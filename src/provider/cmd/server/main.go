// qtcrowd-provider：量潮众包前台（site/studio）的唯一服务端——上架 + 数据 API + 写操作转发。
//
// 定稿架构（前台唯一服务端）：
//  1. 上架：从后台 qtcloud-crowd provider 拉取可上架任务
//     （GET {BACKEND}/api/tasks?status=published——后台支持 status 过滤），
//     写入自己桶 qtcrowd-provider 的黄页快照（public/tasks/{id}.json：
//     title/description/reward/apply_guide）；认领/关闭的任务由下次同步清理（撤回语义）。
//  2. 数据 API：GET /api/tasks 从自己桶读黄页快照返回（site/studio 不再直读 OSS/CDN）。
//  3. 写操作转发保留：POST /api/tasks/{id}/claim、/deliver 转发后台。
//
// 后台 API 契约（qtcloud-crowd provider，见其 docs/dev-guide 架构章节）：
//
//	GET  {BACKEND}/api/tasks?status=published  上架：可上架任务列表
//	POST {BACKEND}/api/tasks/{id}/claim        认领：published → accepted（body: partner_id）
//	POST {BACKEND}/api/tasks/{id}/deliver      交付：accepted → reviewing
//
// 环境变量：
//   - QTCLOUD_CROWD_ADDR            监听地址，默认 :8080
//   - QTCLOUD_CROWD_BACKEND_API     后台 API 根 URL（必填：未配置启动报错）
//   - QTCLOUD_CROWD_TENANT          租户上下文（预留：当前为空不加前缀；非空时后台路径
//     加 /api/{tenant}/… 前缀，对齐 qtcloud-crowd 多租户扩展缝）
//   - QTCLOUD_CROWD_STORE           存储后端，默认 local；设为 oss 走阿里云 OSS（自己桶 qtcrowd-provider）
//   - QTCLOUD_CROWD_DATA_DIR        本地存储数据根目录（local 模式），默认 data
//   - QTCLOUD_OSS_ENDPOINT / QTCLOUD_OSS_BUCKET /
//     QTCLOUD_OSS_ACCESS_KEY_ID / QTCLOUD_OSS_ACCESS_KEY_SECRET  OSS 配置（oss 模式，
//     BUCKET=自己桶 qtcrowd-provider）
//   - QTCLOUD_CROWD_SYNC_INTERVAL   周期上架间隔，默认 5m；0 或无效值 = 仅启动时上架一次
package main

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log"
	"net/http"
	"net/url"
	"os"
	"sort"
	"strings"
	"time"

	"github.com/quanttide/qtcrowd-provider/internal/listing"
	"github.com/quanttide/qtcrowd-provider/internal/store"
)

func main() {
	addr := getenv("QTCLOUD_CROWD_ADDR", ":8080")
	backendAPI := strings.TrimRight(os.Getenv("QTCLOUD_CROWD_BACKEND_API"), "/")
	if backendAPI == "" {
		log.Fatal("QTCLOUD_CROWD_BACKEND_API 未配置：本服务依赖后台 qtcloud-crowd provider 的 API 根 URL（上架 + 写操作转发）")
	}
	tenant := os.Getenv("QTCLOUD_CROWD_TENANT")

	st := newStore()
	syncer := listing.NewSyncer(backendAPI, tenant, st)

	// 周期上架：启动后立即同步一次，之后每 QTCLOUD_CROWD_SYNC_INTERVAL 同步。
	go runSyncLoop(syncer)

	log.Printf("qtcrowd-provider listening on %s (backend=%s, store=%s)", addr, backendAPI, getenv("QTCLOUD_CROWD_STORE", "local"))
	if err := http.ListenAndServe(addr, newMux(st, syncer, backendAPI, tenant)); err != nil {
		log.Fatal(err)
	}
}

// newStore 按 QTCLOUD_CROWD_STORE 选择自己桶存储后端（local 文件 / OSS 自己桶）。
func newStore() store.Store {
	if getenv("QTCLOUD_CROWD_STORE", "local") == "oss" {
		ossStore, err := store.NewOSS(store.OSSConfig{
			Endpoint:        getenv("QTCLOUD_OSS_ENDPOINT", ""),
			Bucket:          getenv("QTCLOUD_OSS_BUCKET", ""),
			AccessKeyID:     getenv("QTCLOUD_OSS_ACCESS_KEY_ID", ""),
			AccessKeySecret: getenv("QTCLOUD_OSS_ACCESS_KEY_SECRET", ""),
		})
		if err != nil {
			log.Fatalf("failed to create OSS store: %v", err)
		}
		return ossStore
	}
	return store.NewLocal(getenv("QTCLOUD_CROWD_DATA_DIR", "data"))
}

// runSyncLoop 周期执行上架同步：启动即同步一次；QTCLOUD_CROWD_SYNC_INTERVAL
// 无效或为 0 时仅启动时同步一次。同步失败记日志不退出（后台可能临时不可达）。
func runSyncLoop(syncer *listing.Syncer) {
	interval := getenv("QTCLOUD_CROWD_SYNC_INTERVAL", "5m")
	d, err := time.ParseDuration(interval)
	if err != nil || d <= 0 {
		log.Printf("QTCLOUD_CROWD_SYNC_INTERVAL 无效（%q），仅启动时上架一次", interval)
		d = 0
	}
	for {
		if result, err := syncer.Sync(context.Background()); err != nil {
			log.Printf("qtcrowd-provider: 上架同步失败: %v", err)
		} else {
			log.Printf("qtcrowd-provider: 上架同步完成 (published=%d, removed=%d)", result.Published, result.Removed)
		}
		if d <= 0 {
			return
		}
		time.Sleep(d)
	}
}

// newMux 组装路由：
//
//	GET  /health                   健康检查（200）
//	GET  /api/tasks                数据 API：从自己桶读黄页快照（{tasks: [...]}）
//	POST /api/admin/sync           手动触发上架（拉取后台 published → 写自己桶）
//	POST /api/tasks/{id}/claim     认领转发（published → accepted）
//	POST /api/tasks/{id}/deliver   交付转发（accepted → reviewing）
func newMux(st store.Store, syncer *listing.Syncer, backendAPI, tenant string) http.Handler {
	p := &proxy{backend: backendAPI, tenant: tenant}
	s := &server{store: st}
	mux := http.NewServeMux()
	mux.HandleFunc("GET /health", func(w http.ResponseWriter, _ *http.Request) {
		w.Header().Set("Content-Type", "text/plain; charset=utf-8")
		fmt.Fprintln(w, "ok")
	})
	mux.HandleFunc("GET /api/tasks", s.listTasks)
	mux.HandleFunc("POST /api/admin/sync", s.syncHandler(syncer))
	mux.HandleFunc("POST /api/tasks/{id}/claim", p.forwardClaim)
	mux.HandleFunc("POST /api/tasks/{id}/deliver", p.forwardDeliver)
	return mux
}

// server 提供数据 API 与上架触发（读/写自己桶）。
type server struct {
	store store.Store
}

// listTasks 数据 API：从自己桶读全部黄页快照（public/tasks/ 前缀），
// 返回 {tasks: [...]}（site/studio 拉取契约；快照按对象名排序，输出稳定）。
func (s *server) listTasks(w http.ResponseWriter, r *http.Request) {
	keys, err := s.store.List(r.Context(), listing.Prefix)
	if err != nil {
		log.Printf("qtcrowd-provider: list snapshots failed: %v", err)
		http.Error(w, "internal error", http.StatusInternalServerError)
		return
	}
	sort.Strings(keys)
	tasks := make([]json.RawMessage, 0, len(keys))
	for _, key := range keys {
		data, err := s.store.Get(r.Context(), key)
		if err != nil {
			if errors.Is(err, store.ErrNotFound) {
				continue // 并发删除竞态：跳过即可
			}
			log.Printf("qtcrowd-provider: read snapshot %s failed: %v", key, err)
			http.Error(w, "internal error", http.StatusInternalServerError)
			return
		}
		tasks = append(tasks, data)
	}
	writeJSON(w, http.StatusOK, map[string]any{"tasks": tasks})
}

// syncHandler 手动触发上架：拉取后台 published → 写自己桶 → 清理过期快照。
// 后台不可达 / 非 2xx 返回 502（上架失败不静默）。
func (s *server) syncHandler(syncer *listing.Syncer) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		result, err := syncer.Sync(r.Context())
		if err != nil {
			log.Printf("qtcrowd-provider: manual sync failed: %v", err)
			http.Error(w, "bad gateway: sync failed", http.StatusBadGateway)
			return
		}
		writeJSON(w, http.StatusOK, result)
	}
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

func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(status)
	if err := json.NewEncoder(w).Encode(v); err != nil {
		log.Printf("write json: %v", err)
	}
}

func getenv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
