// qtcrowd-provider：量潮众包前台（site/studio）的轻量转发服务（写操作代理）。
//
// 只做写操作转发（认领/交付）到后台 qtcloud-crowd provider；读侧不经本服务
// （site/studio 直接读公开桶 CDN）。
//
// 后台 API 契约（qtcloud-crowd provider，见其 docs/dev-guide 架构章节）：
//
//	POST {BACKEND}/api/tasks/{id}/claim    认领：published → accepted（body: partner_id）
//	POST {BACKEND}/api/tasks/{id}/deliver  交付：accepted → reviewing
//
// 环境变量：
//   - QTCLOUD_CROWD_ADDR        监听地址，默认 :8080
//   - QTCLOUD_CROWD_BACKEND_API 后台 API 根 URL（必填：未配置启动报错）
//   - QTCLOUD_CROWD_TENANT      租户上下文（预留：当前为空不加前缀；非空时后台路径
//     加 /api/{tenant}/… 前缀，对齐 qtcloud-crowd 多租户扩展缝）
package main

import (
	"fmt"
	"io"
	"log"
	"net/http"
	"net/url"
	"os"
	"strings"
)

func main() {
	addr := getenv("QTCLOUD_CROWD_ADDR", ":8080")
	backendAPI := strings.TrimRight(os.Getenv("QTCLOUD_CROWD_BACKEND_API"), "/")
	if backendAPI == "" {
		log.Fatal("QTCLOUD_CROWD_BACKEND_API 未配置：本服务只做写操作转发，必须配置后台 qtcloud-crowd provider 的 API 根 URL")
	}
	tenant := os.Getenv("QTCLOUD_CROWD_TENANT")

	log.Printf("qtcrowd-provider listening on %s (backend=%s)", addr, backendAPI)
	if err := http.ListenAndServe(addr, newMux(backendAPI, tenant)); err != nil {
		log.Fatal(err)
	}
}

// newMux 组装路由：
//
//	GET  /health                   健康检查（200）
//	POST /api/tasks/{id}/claim     认领转发（published → accepted）
//	POST /api/tasks/{id}/deliver   交付转发（accepted → reviewing）
func newMux(backendAPI, tenant string) http.Handler {
	p := &proxy{backend: backendAPI, tenant: tenant}
	mux := http.NewServeMux()
	mux.HandleFunc("GET /health", func(w http.ResponseWriter, _ *http.Request) {
		w.Header().Set("Content-Type", "text/plain; charset=utf-8")
		fmt.Fprintln(w, "ok")
	})
	mux.HandleFunc("POST /api/tasks/{id}/claim", p.forwardClaim)
	mux.HandleFunc("POST /api/tasks/{id}/deliver", p.forwardDeliver)
	return mux
}

// proxy 写操作转发器：请求体原样透传（含 partner_id），后台响应状态码与错误体透传返回。
type proxy struct {
	backend string // 后台 API 根 URL（不含尾部 /）
	tenant  string // 租户上下文（预留：当前为空不加前缀）
}

// forwardClaim 转发认领：POST {BACKEND}/api/tasks/{id}/claim。
func (p *proxy) forwardClaim(w http.ResponseWriter, r *http.Request) {
	p.forward(w, r, "claim")
}

// forwardDeliver 转发交付：POST {BACKEND}/api/tasks/{id}/deliver。
func (p *proxy) forwardDeliver(w http.ResponseWriter, r *http.Request) {
	p.forward(w, r, "deliver")
}

// forward 把前台写操作转发到后台：请求体原样透传；后台 4xx/5xx 的状态码与错误体
// 透传返回（前台能区分 404/409/400）；后台不可达返回 502 Bad Gateway。
func (p *proxy) forward(w http.ResponseWriter, r *http.Request, action string) {
	target := p.backendPath(r.PathValue("id"), action)
	req, err := http.NewRequestWithContext(r.Context(), http.MethodPost, target, r.Body)
	if err != nil {
		http.Error(w, "bad gateway: invalid target", http.StatusBadGateway)
		return
	}
	req.Header.Set("Content-Type", r.Header.Get("Content-Type"))

	res, err := http.DefaultClient.Do(req)
	if err != nil {
		log.Printf("qtcrowd-provider: forward %s failed: %v", target, err)
		http.Error(w, "bad gateway: backend unreachable", http.StatusBadGateway)
		return
	}
	defer res.Body.Close()

	body, err := io.ReadAll(res.Body)
	if err != nil {
		log.Printf("qtcrowd-provider: read backend response failed: %v", err)
		http.Error(w, "bad gateway: read backend response failed", http.StatusBadGateway)
		return
	}
	for k := range res.Header {
		w.Header().Set(k, res.Header.Get(k))
	}
	w.WriteHeader(res.StatusCode)
	_, _ = w.Write(body)
}

// backendPath 后台目标路径：单租户（tenant 为空）不加前缀；
// 多租户预留：tenant 非空时加 /api/{tenant}/… 前缀（对齐 qtcloud-crowd 多租户扩展缝）。
func (p *proxy) backendPath(id, action string) string {
	if p.tenant != "" {
		return fmt.Sprintf("%s/api/%s/tasks/%s/%s", p.backend, url.PathEscape(p.tenant), url.PathEscape(id), action)
	}
	return fmt.Sprintf("%s/api/tasks/%s/%s", p.backend, url.PathEscape(id), action)
}

func getenv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
