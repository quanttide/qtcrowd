package main

import (
	"io"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

// fakeBackend 可编程后台：按预设 status/body 返回，并捕获转发请求供断言。
type fakeBackend struct {
	url       string
	status    int
	body      string
	gotPath   string
	gotBody   string
	gotCT     string
	gotTenant string // X-Qtcloud-Tenant（租户预留头）
}

// newFakeBackend 起一个假后台：记录收到的请求（方法/路径/body/Content-Type/租户头），
// 按 status/body 应答。
func newFakeBackend(t *testing.T, status int, body string) *fakeBackend {
	t.Helper()
	fb := &fakeBackend{status: status, body: body}
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		raw, _ := io.ReadAll(r.Body)
		fb.gotPath = r.URL.Path
		fb.gotBody = string(raw)
		fb.gotCT = r.Header.Get("Content-Type")
		fb.gotTenant = r.Header.Get("X-Qtcloud-Tenant")
		w.Header().Set("Content-Type", "application/json; charset=utf-8")
		w.WriteHeader(status)
		_, _ = io.WriteString(w, body)
	}))
	t.Cleanup(srv.Close)
	fb.url = srv.URL
	return fb
}

// doPost 向 provider 发一个写操作请求。
func doPost(t *testing.T, h http.Handler, path, body string) *httptest.ResponseRecorder {
	t.Helper()
	req := httptest.NewRequest(http.MethodPost, path, strings.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	rec := httptest.NewRecorder()
	h.ServeHTTP(rec, req)
	return rec
}

// TestHealth 健康检查：GET /health → 200。
func TestHealth(t *testing.T) {
	h := newMux("http://unused", "")
	req := httptest.NewRequest(http.MethodGet, "/health", nil)
	rec := httptest.NewRecorder()
	h.ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("GET /health want 200, got %d", rec.Code)
	}
	if !strings.Contains(rec.Body.String(), "ok") {
		t.Fatalf("GET /health body want contains ok, got %q", rec.Body.String())
	}
}

// TestForwardClaimSuccess 转发成功：路径/方法/请求体（含 partner_id）原样透传，响应体透传。
func TestForwardClaimSuccess(t *testing.T) {
	fb := newFakeBackend(t, http.StatusOK, `{"id":"t1","status":"accepted"}`)
	h := newMux(fb.url, "")

	rec := doPost(t, h, "/api/tasks/t1/claim", `{"partner_id":"p1"}`)

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

// TestForwardDeliverSuccess 交付转发成功：accepted → reviewing 路径透传。
func TestForwardDeliverSuccess(t *testing.T) {
	fb := newFakeBackend(t, http.StatusOK, `{"id":"t1","status":"reviewing"}`)
	h := newMux(fb.url, "")

	rec := doPost(t, h, "/api/tasks/t1/deliver", "")

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

// TestForwardPassthroughStatus 后台 4xx 透传：状态码与错误体原样返回（前台能区分 404/409/400）。
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
			fb := newFakeBackend(t, tc.status, tc.body)
			h := newMux(fb.url, "")

			rec := doPost(t, h, "/api/tasks/t1/claim", `{"partner_id":"p1"}`)

			if rec.Code != tc.status {
				t.Fatalf("状态码透传 want %d, got %d", tc.status, rec.Code)
			}
			if rec.Body.String() != tc.body {
				t.Fatalf("错误体透传 want %q, got %q", tc.body, rec.Body.String())
			}
		})
	}
}

// TestForwardBackendUnreachable 后台不可达：502 Bad Gateway（前台可感知后台故障）。
func TestForwardBackendUnreachable(t *testing.T) {
	// 起一个 server 拿 URL 后立即关闭：连接拒绝 → 502。
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {}))
	deadURL := srv.URL
	srv.Close()

	h := newMux(deadURL, "")
	rec := doPost(t, h, "/api/tasks/t1/claim", `{"partner_id":"p1"}`)

	if rec.Code != http.StatusBadGateway {
		t.Fatalf("后台不可达 want 502, got %d: %s", rec.Code, rec.Body.String())
	}
}

// TestForwardTenantPrefix 多租户预留：QTCLOUD_CROWD_TENANT 非空时后台路径加
// /api/{tenant}/… 前缀；当前为空则不加前缀（由 TestForwardClaimSuccess 覆盖）。
func TestForwardTenantPrefix(t *testing.T) {
	fb := newFakeBackend(t, http.StatusOK, `{"id":"t1","status":"accepted"}`)
	h := newMux(fb.url, "acme")

	rec := doPost(t, h, "/api/tasks/t1/claim", `{"partner_id":"p1"}`)

	if rec.Code != http.StatusOK {
		t.Fatalf("want 200, got %d: %s", rec.Code, rec.Body.String())
	}
	if fb.gotPath != "/api/acme/tasks/t1/claim" {
		t.Fatalf("多租户路径 want /api/acme/tasks/t1/claim, got %s", fb.gotPath)
	}
}

// TestRouteGuard 路由保护：只暴露 health + 两个写操作转发，其余请求不转发。
func TestRouteGuard(t *testing.T) {
	h := newMux("http://unused", "")
	for _, tc := range []struct{ method, path string }{
		{http.MethodGet, "/api/tasks/t1/claim"},  // 写操作只收 POST
		{http.MethodPost, "/api/tasks/t1/other"}, // 未知动作
		{http.MethodPost, "/health"},             // 健康检查只收 GET
	} {
		req := httptest.NewRequest(tc.method, tc.path, nil)
		rec := httptest.NewRecorder()
		h.ServeHTTP(rec, req)
		if rec.Code == http.StatusOK {
			t.Fatalf("%s %s want 非 200, got %d", tc.method, tc.path, rec.Code)
		}
	}
}
