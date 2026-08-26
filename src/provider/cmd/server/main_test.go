package main

import (
	"context"
	"encoding/json"
	"io"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"strings"
	"testing"

	"github.com/quanttide/qtcrowd-provider/internal/listing"
	"github.com/quanttide/qtcrowd-provider/internal/store"
)

// newTestStore 用临时目录创建本地自己桶（{dir}/data）。
func newTestStore(t *testing.T) (store.Store, string) {
	t.Helper()
	dir := t.TempDir()
	return store.NewLocal(filepath.Join(dir, "data")), dir
}

// newMuxFor 构建完整 handler：数据 API + 上架触发 + 写操作转发（backend 指向假后台）。
func newMuxFor(st store.Store, fb *fakeBackend, tenant string) http.Handler {
	return newMux(st, listing.NewSyncer(fb.url, tenant, st), fb.url, tenant)
}

// fakeBackend 可编程后台：GET /api/tasks 返回预设任务列表（记录请求路径），
// 写操作按预设 status/body 应答并捕获转发请求。
type fakeBackend struct {
	url        string
	tasks      []map[string]string
	status     int
	body       string
	gotPath    string
	gotBody    string
	gotCT      string
	gotTenant  string
	gotStatusQ string
}

// newFakeBackend 起一个假后台：任务列表路由（GET /api/tasks?status=published，上架契约）
// + 写操作路由（POST /api/tasks/{id}/claim、/deliver，转发契约）。
func newFakeBackend(t *testing.T, tasks []map[string]string) *fakeBackend {
	t.Helper()
	fb := &fakeBackend{tasks: tasks, status: http.StatusOK, body: "{}"}
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		fb.gotPath = r.URL.Path
		fb.gotStatusQ = r.URL.Query().Get("status")
		if r.Method == http.MethodGet && r.URL.Path == "/api/tasks" {
			// 上架契约：GET /api/tasks?status=published → 任务列表（JSON 数组）。
			if fb.status != http.StatusOK {
				w.WriteHeader(fb.status)
				_, _ = io.WriteString(w, fb.body)
				return
			}
			w.Header().Set("Content-Type", "application/json; charset=utf-8")
			_ = json.NewEncoder(w).Encode(fb.tasks)
			return
		}
		// 写操作：记录请求并透传预设响应。
		raw, _ := io.ReadAll(r.Body)
		fb.gotBody = string(raw)
		fb.gotCT = r.Header.Get("Content-Type")
		fb.gotTenant = r.Header.Get("X-Qtcloud-Tenant")
		w.Header().Set("Content-Type", "application/json; charset=utf-8")
		w.WriteHeader(fb.status)
		_, _ = io.WriteString(w, fb.body)
	}))
	t.Cleanup(srv.Close)
	fb.url = srv.URL
	return fb
}

// publishedTasks 构造两条后台 published 任务（上架测试样例，含黄页快照字段）。
func publishedTasks() []map[string]string {
	return []map[string]string{
		{"id": "t1", "title": "任务一", "content": "描述一", "reward": "100 元", "apply_guide": "发邮件报名", "status": "published"},
		{"id": "t2", "title": "任务二", "content": "描述二", "reward": "200 元", "apply_guide": "加群报名", "status": "published"},
	}
}

// doRequest 向 handler 发一个请求。
func doRequest(t *testing.T, h http.Handler, method, path, body string) *httptest.ResponseRecorder {
	t.Helper()
	var r io.Reader
	if body != "" {
		r = strings.NewReader(body)
	}
	req := httptest.NewRequest(method, path, r)
	if body != "" {
		req.Header.Set("Content-Type", "application/json")
	}
	rec := httptest.NewRecorder()
	h.ServeHTTP(rec, req)
	return rec
}

// decodeTasks 解析 {tasks: [...]} 响应。
func decodeTasks(t *testing.T, rec *httptest.ResponseRecorder) []map[string]any {
	t.Helper()
	var out struct {
		Tasks []map[string]any `json:"tasks"`
	}
	if err := json.Unmarshal(rec.Body.Bytes(), &out); err != nil {
		t.Fatalf("decode tasks: %v", err)
	}
	return out.Tasks
}

// TestHealth 健康检查：GET /health → 200。
func TestHealth(t *testing.T) {
	st, _ := newTestStore(t)
	h := newMux(st, listing.NewSyncer("http://unused", "", st), "http://unused", "")
	rec := doRequest(t, h, http.MethodGet, "/health", "")
	if rec.Code != http.StatusOK {
		t.Fatalf("GET /health want 200, got %d", rec.Code)
	}
	if !strings.Contains(rec.Body.String(), "ok") {
		t.Fatalf("GET /health body want contains ok, got %q", rec.Body.String())
	}
}

// TestSyncOnboard 上架：拉取后台 published 任务 → 写自己桶黄页快照
// （public/tasks/{id}.json：title/description/reward/apply_guide）。
func TestSyncOnboard(t *testing.T) {
	fb := newFakeBackend(t, publishedTasks())
	st, dir := newTestStore(t)
	syncer := listing.NewSyncer(fb.url, "", st)

	if _, err := syncer.Sync(context.Background()); err != nil {
		t.Fatalf("Sync: %v", err)
	}

	// 上架契约：拉取路径为 GET /api/tasks?status=published。
	if fb.gotPath != "/api/tasks" || fb.gotStatusQ != "published" {
		t.Fatalf("上架拉取 want GET /api/tasks?status=published, got %s?status=%s", fb.gotPath, fb.gotStatusQ)
	}

	// 写桶：public/tasks/t1.json 与 t2.json，内容是黄页快照（status=published）。
	for _, id := range []string{"t1", "t2"} {
		data, err := os.ReadFile(filepath.Join(dir, "data", "public", "tasks", id+".json"))
		if err != nil {
			t.Fatalf("快照未写入自己桶: %v", err)
		}
		var snap map[string]any
		if err := json.Unmarshal(data, &snap); err != nil {
			t.Fatalf("解析快照: %v", err)
		}
		if snap["id"] != id || snap["status"] != "published" {
			t.Fatalf("快照 id/status 不符: %+v", snap)
		}
		if snap["title"] == "" || snap["description"] == "" || snap["reward"] == "" || snap["apply_guide"] == "" {
			t.Fatalf("黄页快照字段不全（title/description/reward/apply_guide）: %+v", snap)
		}
	}
}

// TestSyncCleanupStale 上架撤回语义：后台列表收缩后，桶中过期快照被清理。
func TestSyncCleanupStale(t *testing.T) {
	// 第一次同步：两条任务上架。
	fb := newFakeBackend(t, publishedTasks())
	st, dir := newTestStore(t)
	syncer := listing.NewSyncer(fb.url, "", st)
	if _, err := syncer.Sync(context.Background()); err != nil {
		t.Fatalf("Sync #1: %v", err)
	}

	// 第二次同步：后台只剩 t1（t2 被认领/关闭，退出 published 列表）→ t2 快照清理。
	fb.tasks = publishedTasks()[:1]
	if _, err := syncer.Sync(context.Background()); err != nil {
		t.Fatalf("Sync #2: %v", err)
	}
	if _, err := os.Stat(filepath.Join(dir, "data", "public", "tasks", "t2.json")); !os.IsNotExist(err) {
		t.Fatalf("过期快照 t2 应被清理, got %v", err)
	}
	if _, err := os.Stat(filepath.Join(dir, "data", "public", "tasks", "t1.json")); err != nil {
		t.Fatalf("仍 published 的 t1 快照应保留: %v", err)
	}
}

// TestSyncBackendFailure 上架失败不静默：后台不可达 / 非 2xx → Sync 返回错误。
func TestSyncBackendFailure(t *testing.T) {
	// 后台 500。
	fb := newFakeBackend(t, nil)
	fb.status = http.StatusInternalServerError
	fb.body = "boom"
	st, _ := newTestStore(t)
	syncer := listing.NewSyncer(fb.url, "", st)
	if _, err := syncer.Sync(context.Background()); err == nil {
		t.Fatal("后台 500 上架应失败")
	}

	// 后台不可达 → 连接拒绝。
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {}))
	deadURL := srv.URL
	srv.Close()
	st2, _ := newTestStore(t)
	syncer2 := listing.NewSyncer(deadURL, "", st2)
	if _, err := syncer2.Sync(context.Background()); err == nil {
		t.Fatal("后台不可达上架应失败")
	}
}

// TestAdminSyncEndpoint 手动上架：POST /api/admin/sync → 200 + 统计；后台失败 → 502。
func TestAdminSyncEndpoint(t *testing.T) {
	fb := newFakeBackend(t, publishedTasks())
	st, _ := newTestStore(t)
	h := newMuxFor(st, fb, "")

	rec := doRequest(t, h, http.MethodPost, "/api/admin/sync", "")
	if rec.Code != http.StatusOK {
		t.Fatalf("手动上架 want 200, got %d: %s", rec.Code, rec.Body.String())
	}
	var result map[string]int
	if err := json.Unmarshal(rec.Body.Bytes(), &result); err != nil {
		t.Fatal(err)
	}
	if result["published"] != 2 {
		t.Fatalf("published want 2, got %d", result["published"])
	}

	// 后台不可达 → 502。
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {}))
	deadURL := srv.URL
	srv.Close()
	st2, _ := newTestStore(t)
	h2 := newMux(st2, listing.NewSyncer(deadURL, "", st2), deadURL, "")
	rec2 := doRequest(t, h2, http.MethodPost, "/api/admin/sync", "")
	if rec2.Code != http.StatusBadGateway {
		t.Fatalf("后台不可达上架 want 502, got %d", rec2.Code)
	}
}

// TestListTasksDataAPI 数据 API：从自己桶读黄页快照返回 {tasks: [...]}；
// 桶为空返回空列表。
func TestListTasksDataAPI(t *testing.T) {
	// 空桶 → {tasks: []}。
	st, _ := newTestStore(t)
	h := newMux(st, listing.NewSyncer("http://unused", "", st), "http://unused", "")
	rec := doRequest(t, h, http.MethodGet, "/api/tasks", "")
	if rec.Code != http.StatusOK {
		t.Fatalf("GET /api/tasks want 200, got %d", rec.Code)
	}
	if tasks := decodeTasks(t, rec); len(tasks) != 0 {
		t.Fatalf("空桶 want 0 条, got %d", len(tasks))
	}

	// 上架后：数据 API 返回桶内快照（site/studio 拉取契约）。
	fb := newFakeBackend(t, publishedTasks())
	st2, _ := newTestStore(t)
	h2 := newMuxFor(st2, fb, "")
	if rec := doRequest(t, h2, http.MethodPost, "/api/admin/sync", ""); rec.Code != http.StatusOK {
		t.Fatalf("预置上架 want 200, got %d", rec.Code)
	}
	rec2 := doRequest(t, h2, http.MethodGet, "/api/tasks", "")
	tasks := decodeTasks(t, rec2)
	if len(tasks) != 2 {
		t.Fatalf("上架后 want 2 条, got %d", len(tasks))
	}
	first := tasks[0]
	if first["title"] != "任务一" || first["description"] != "描述一" || first["reward"] != "100 元" || first["apply_guide"] != "发邮件报名" {
		t.Fatalf("数据 API 返回内容不符: %+v", first)
	}
}

// TestListTasksSortStable 数据 API 输出稳定：快照按对象名排序（a1 在 z9 前）。
func TestListTasksSortStable(t *testing.T) {
	fb := newFakeBackend(t, []map[string]string{
		{"id": "z9", "title": "Z", "content": "z", "reward": "1", "apply_guide": "a", "status": "published"},
		{"id": "a1", "title": "A", "content": "a", "reward": "1", "apply_guide": "a", "status": "published"},
	})
	st, _ := newTestStore(t)
	h := newMuxFor(st, fb, "")
	if rec := doRequest(t, h, http.MethodPost, "/api/admin/sync", ""); rec.Code != http.StatusOK {
		t.Fatalf("预置上架 want 200, got %d", rec.Code)
	}
	rec := doRequest(t, h, http.MethodGet, "/api/tasks", "")
	tasks := decodeTasks(t, rec)
	if len(tasks) != 2 || tasks[0]["id"] != "a1" || tasks[1]["id"] != "z9" {
		t.Fatalf("快照应按 key 排序: %+v", tasks)
	}
}

// TestForwardClaimSuccess 转发保留：认领路径/方法/请求体（含 partner_id）原样透传，响应体透传。
func TestForwardClaimSuccess(t *testing.T) {
	fb := newFakeBackend(t, nil)
	fb.status = http.StatusOK
	fb.body = `{"id":"t1","status":"accepted"}`
	st, _ := newTestStore(t)
	h := newMuxFor(st, fb, "")

	rec := doRequest(t, h, http.MethodPost, "/api/tasks/t1/claim", `{"partner_id":"p1"}`)

	if rec.Code != http.StatusOK {
		t.Fatalf("claim 转发 want 200, got %d: %s", rec.Code, rec.Body.String())
	}
	if fb.gotPath != "/api/tasks/t1/claim" {
		t.Fatalf("后台路径 want /api/tasks/t1/claim, got %s", fb.gotPath)
	}
	if fb.gotBody != `{"partner_id":"p1"}` {
		t.Fatalf("请求体未原样透传 want %q, got %q", `{"partner_id":"p1"}`, fb.gotBody)
	}
	if !strings.Contains(fb.gotCT, "application/json") {
		t.Fatalf("Content-Type 未透传, got %q", fb.gotCT)
	}
	if rec.Body.String() != fb.body {
		t.Fatalf("响应体透传 want %q, got %q", fb.body, rec.Body.String())
	}
	if fb.gotTenant != "" {
		t.Fatalf("tenant 为空时不应注入租户头, got %q", fb.gotTenant)
	}
}

// TestForwardDeliverSuccess 转发保留：交付（accepted → reviewing）路径透传。
func TestForwardDeliverSuccess(t *testing.T) {
	fb := newFakeBackend(t, nil)
	fb.body = `{"id":"t1","status":"reviewing"}`
	st, _ := newTestStore(t)
	h := newMuxFor(st, fb, "")

	rec := doRequest(t, h, http.MethodPost, "/api/tasks/t1/deliver", "")

	if rec.Code != http.StatusOK {
		t.Fatalf("deliver 转发 want 200, got %d: %s", rec.Code, rec.Body.String())
	}
	if fb.gotPath != "/api/tasks/t1/deliver" {
		t.Fatalf("后台路径 want /api/tasks/t1/deliver, got %s", fb.gotPath)
	}
	if rec.Body.String() != fb.body {
		t.Fatalf("响应体透传 want %q, got %q", fb.body, rec.Body.String())
	}
}

// TestForwardPassthroughStatus 转发保留：后台 4xx 状态码与错误体原样返回（前台能区分 404/409/400）。
func TestForwardPassthroughStatus(t *testing.T) {
	cases := []struct {
		name   string
		status int
		body   string
	}{
		{"后台 404 透传（任务不存在/已下架）", http.StatusNotFound, "task not found\n"},
		{"后台 409 透传（状态冲突）", http.StatusConflict, `{"error":"task already claimed"}`},
		{"后台 400 透传（非法状态/缺 partner_id）", http.StatusBadRequest, "task not published: only published tasks can be claimed\n"},
	}
	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			fb := newFakeBackend(t, nil)
			fb.status = tc.status
			fb.body = tc.body
			st, _ := newTestStore(t)
			h := newMuxFor(st, fb, "")

			rec := doRequest(t, h, http.MethodPost, "/api/tasks/t1/claim", `{"partner_id":"p1"}`)

			if rec.Code != tc.status {
				t.Fatalf("状态码透传 want %d, got %d", tc.status, rec.Code)
			}
			if rec.Body.String() != tc.body {
				t.Fatalf("错误体透传 want %q, got %q", tc.body, rec.Body.String())
			}
		})
	}
}

// TestForwardBackendUnreachable 转发保留：后台不可达 → 502 Bad Gateway（前台可感知后台故障）。
func TestForwardBackendUnreachable(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {}))
	deadURL := srv.URL
	srv.Close()

	st, _ := newTestStore(t)
	h := newMux(st, listing.NewSyncer(deadURL, "", st), deadURL, "")
	rec := doRequest(t, h, http.MethodPost, "/api/tasks/t1/claim", `{"partner_id":"p1"}`)

	if rec.Code != http.StatusBadGateway {
		t.Fatalf("后台不可达 want 502, got %d: %s", rec.Code, rec.Body.String())
	}
}

// TestForwardTenantPrefix 多租户预留：QTCLOUD_CROWD_TENANT 非空时后台路径加 /api/{tenant}/… 前缀。
func TestForwardTenantPrefix(t *testing.T) {
	fb := newFakeBackend(t, nil)
	fb.body = `{"id":"t1","status":"accepted"}`
	st, _ := newTestStore(t)
	h := newMux(st, listing.NewSyncer(fb.url, "acme", st), fb.url, "acme")

	rec := doRequest(t, h, http.MethodPost, "/api/tasks/t1/claim", `{"partner_id":"p1"}`)

	if rec.Code != http.StatusOK {
		t.Fatalf("want 200, got %d: %s", rec.Code, rec.Body.String())
	}
	if fb.gotPath != "/api/acme/tasks/t1/claim" {
		t.Fatalf("多租户路径 want /api/acme/tasks/t1/claim, got %s", fb.gotPath)
	}
}

// TestRouteGuard 路由保护：只暴露 health + 数据 API + 上架 + 两个写操作转发，其余请求不转发。
func TestRouteGuard(t *testing.T) {
	st, _ := newTestStore(t)
	h := newMux(st, listing.NewSyncer("http://unused", "", st), "http://unused", "")
	for _, tc := range []struct{ method, path string }{
		{http.MethodGet, "/api/tasks/t1/claim"},  // 写操作只收 POST
		{http.MethodPost, "/api/tasks/t1/other"}, // 未知动作
		{http.MethodPost, "/health"},             // 健康检查只收 GET
		{http.MethodDelete, "/api/tasks"},        // 数据 API 只收 GET
	} {
		rec := doRequest(t, h, tc.method, tc.path, "")
		if rec.Code == http.StatusOK {
			t.Fatalf("%s %s want 非 200, got %d", tc.method, tc.path, rec.Code)
		}
	}
}
