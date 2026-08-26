package store

import (
	"context"
	"errors"
	"io"
	"net/http"
	"net/http/httptest"
	"sort"
	"strings"
	"sync"
	"testing"
)

// mockOSSServer 模拟阿里云 OSS（qtcrowd-provider 自己桶 bucket）：
// 校验签名头并保存对象；404 返回 OSS 规范错误 XML（SDK 才能解析为 oss.ServiceError）；
// GET 带 ?prefix= 视为 ListObjects（返回 ListBucketResult XML）。
func mockOSSServer(t *testing.T) (*httptest.Server, *sync.Map) {
	t.Helper()
	objects := &sync.Map{}
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if !strings.HasPrefix(r.Header.Get("Authorization"), "OSS AKID:") {
			t.Errorf("missing/invalid Authorization header: %q", r.Header.Get("Authorization"))
			http.Error(w, "unauthorized", http.StatusUnauthorized)
			return
		}
		key := strings.TrimPrefix(r.URL.Path, "/bucket/")
		switch r.Method {
		case http.MethodGet:
			// ListObjects：GET /bucket/?prefix=…&marker=…（SDK 列表契约）。
			if prefix := r.URL.Query().Get("prefix"); r.URL.RawQuery != "" && prefix != "" {
				writeListResult(w, objects, prefix)
				return
			}
			v, ok := objects.Load(key)
			if !ok {
				writeOSSError(w, http.StatusNotFound, "NoSuchKey")
				return
			}
			_, _ = w.Write(v.([]byte))
		case http.MethodPut:
			data, err := io.ReadAll(r.Body)
			if err != nil {
				http.Error(w, err.Error(), http.StatusBadRequest)
				return
			}
			objects.Store(key, data)
			_, _ = w.Write([]byte("{}"))
		case http.MethodDelete:
			objects.Delete(key)
			w.WriteHeader(http.StatusNoContent)
		default:
			http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		}
	}))
	t.Cleanup(srv.Close)
	return srv, objects
}

// writeListResult 写 ListBucketResult XML（前缀匹配，key 排序，不分页）。
func writeListResult(w http.ResponseWriter, objects *sync.Map, prefix string) {
	var keys []string
	objects.Range(func(k, _ any) bool {
		if s, ok := k.(string); ok && strings.HasPrefix(s, prefix) {
			keys = append(keys, s)
		}
		return true
	})
	sort.Strings(keys)

	var b strings.Builder
	b.WriteString(`<?xml version="1.0" encoding="UTF-8"?>`)
	b.WriteString(`<ListBucketResult xmlns="http://doc.oss-aliyuncs.com"><Name>bucket</Name><Prefix>` + prefix + `</Prefix><Marker></Marker><MaxKeys>1000</MaxKeys><Delimiter></Delimiter><IsTruncated>false</IsTruncated>`)
	for _, k := range keys {
		b.WriteString(`<Contents><Key>` + k + `</Key><LastModified>2026-01-01T00:00:00.000Z</LastModified><ETag>"mock"</ETag><Size>2</Size><StorageClass>Standard</StorageClass></Contents>`)
	}
	b.WriteString(`</ListBucketResult>`)
	w.Header().Set("Content-Type", "application/xml")
	_, _ = io.WriteString(w, b.String())
}

func newTestOSS(t *testing.T, srv *httptest.Server) *OSS {
	t.Helper()
	st, err := NewOSS(OSSConfig{
		Endpoint:        srv.URL,
		Bucket:          "bucket",
		AccessKeyID:     "AKID",
		AccessKeySecret: "SECRET",
	})
	if err != nil {
		t.Fatalf("NewOSS: %v", err)
	}
	return st
}

func TestOSSPutGetRoundTrip(t *testing.T) {
	srv, objects := mockOSSServer(t)
	st := newTestOSS(t, srv)
	ctx := context.Background()

	key := "public/tasks/t1.json"
	if err := st.Put(ctx, key, []byte(`{"id":"t1"}`)); err != nil {
		t.Fatalf("Put: %v", err)
	}
	if _, ok := objects.Load(key); !ok {
		t.Fatal("对象未写入 mock OSS")
	}
	got, err := st.Get(ctx, key)
	if err != nil {
		t.Fatalf("Get: %v", err)
	}
	if string(got) != `{"id":"t1"}` {
		t.Fatalf("got %q", got)
	}
}

func TestOSSGetNotFound(t *testing.T) {
	srv, _ := mockOSSServer(t)
	st := newTestOSS(t, srv)
	if _, err := st.Get(context.Background(), "public/tasks/missing.json"); !errors.Is(err, ErrNotFound) {
		t.Fatalf("want ErrNotFound, got %v", err)
	}
}

func TestOSSDeleteIdempotent(t *testing.T) {
	srv, objects := mockOSSServer(t)
	st := newTestOSS(t, srv)
	ctx := context.Background()

	key := "public/tasks/t1.json"
	if err := st.Put(ctx, key, []byte(`{}`)); err != nil {
		t.Fatal(err)
	}
	if err := st.Delete(ctx, key); err != nil {
		t.Fatalf("Delete: %v", err)
	}
	if _, ok := objects.Load(key); ok {
		t.Fatal("对象应已删除")
	}
	// 重复删除幂等（对象已不存在 → 404 → 视为已删除）。
	if err := st.Delete(ctx, key); err != nil {
		t.Fatalf("重复删除应幂等: %v", err)
	}
}

func TestOSSList(t *testing.T) {
	srv, _ := mockOSSServer(t)
	st := newTestOSS(t, srv)
	ctx := context.Background()

	if err := st.Put(ctx, "public/tasks/t1.json", []byte(`{}`)); err != nil {
		t.Fatal(err)
	}
	if err := st.Put(ctx, "public/tasks/t2.json", []byte(`{}`)); err != nil {
		t.Fatal(err)
	}
	if err := st.Put(ctx, "other/k.json", []byte(`{}`)); err != nil {
		t.Fatal(err)
	}

	keys, err := st.List(ctx, "public/tasks/")
	if err != nil {
		t.Fatalf("List: %v", err)
	}
	if len(keys) != 2 || keys[0] != "public/tasks/t1.json" || keys[1] != "public/tasks/t2.json" {
		t.Fatalf("List want 2 keys（前缀匹配 + 排序）, got %v", keys)
	}
}

// writeOSSError 写 OSS 规范错误响应（XML + 状态码），SDK 可解析为 oss.ServiceError。
func writeOSSError(w http.ResponseWriter, status int, code string) {
	w.Header().Set("Content-Type", "application/xml")
	w.WriteHeader(status)
	_, _ = io.WriteString(w, `<?xml version="1.0" encoding="UTF-8"?>
<Error>
  <Code>`+code+`</Code>
  <Message>mock oss error</Message>
  <RequestId>mock-request</RequestId>
  <HostId>mock</HostId>
</Error>`)
}
