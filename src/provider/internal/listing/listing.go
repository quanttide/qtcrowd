// Package listing 实现"上架"：qtcrowd-provider 从后台 qtcloud-crowd provider
// 拉取可上架任务（GET /api/tasks?status=published），写入自己桶的黄页快照
// （public/tasks/{id}.json：title/description/reward/apply_guide），并清理
// 桶中已不在 published 列表里的旧快照（撤回语义）。
//
// 依赖方向：前台（qtcrowd-provider）依赖后台 API（读 published 列表）；后台不依赖前台。
package listing

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strings"

	"github.com/quanttide/qtcrowd-provider/internal/store"
)

// Prefix 是自己桶内黄页快照的路径前缀约定：public/tasks/{id}.json。
const Prefix = "public/tasks/"

// Snapshot 是自己桶中的黄页快照：黄页模型视图（title/description/reward/报名引导）。
// 内部数据（验收准则等）留后台——模型不同构由桶边界天然解决。
type Snapshot struct {
	ID          string `json:"id"`
	Title       string `json:"title"`
	Description string `json:"description"`
	Reward      string `json:"reward"`
	ApplyGuide  string `json:"apply_guide"`
	Status      string `json:"status"`
}

// Key 返回任务 id 对应的自己桶对象 key（public/tasks/{id}.json）。
func Key(id string) string {
	return Prefix + id + ".json"
}

// BackendTask 是后台任务模型（GET /api/tasks?status=published 返回项，取黄页所需字段）。
type BackendTask struct {
	ID         string `json:"id"`
	Title      string `json:"title"`
	Content    string `json:"content"`
	Reward     string `json:"reward"`
	ApplyGuide string `json:"apply_guide"`
	Status     string `json:"status"`
}

// SyncResult 是一次上架同步的结果统计。
type SyncResult struct {
	Published int `json:"published"` // 本次写入/更新的快照数
	Removed   int `json:"removed"`   // 清理的过期快照数（已不在 published 列表）
}

// Syncer 负责上架：拉取后台 published 任务 → 写自己桶黄页快照 → 清理过期快照。
type Syncer struct {
	backend string       // 后台 API 根 URL（不含尾部 /）
	tenant  string       // 租户上下文（预留：当前为空不加前缀）
	store   store.Store  // 自己桶（本地目录 / OSS）
	client  *http.Client // HTTP 客户端（测试可注入）
}

// NewSyncer 创建上架同步器。
func NewSyncer(backend, tenant string, st store.Store) *Syncer {
	return &Syncer{backend: strings.TrimRight(backend, "/"), tenant: tenant, store: st, client: http.DefaultClient}
}

// Sync 执行一次上架同步：
//  1. GET {backend}/api/tasks?status=published 拉取可上架任务；
//  2. 每个任务写黄页快照 public/tasks/{id}.json（覆盖更新）；
//  3. 清理桶中已不在 published 列表的旧快照（撤回语义：任务被认领/关闭后不再展示）。
//
// 后台不可达 / 非 2xx 返回错误（上架失败不静默）。
func (s *Syncer) Sync(ctx context.Context) (SyncResult, error) {
	tasks, err := s.fetchPublished(ctx)
	if err != nil {
		return SyncResult{}, err
	}

	// 写/更新快照。
	written := 0
	for _, t := range tasks {
		snap := snapshotOf(t)
		data, err := json.MarshalIndent(snap, "", "  ")
		if err != nil {
			return SyncResult{}, err
		}
		if err := s.store.Put(ctx, Key(snap.ID), data); err != nil {
			return SyncResult{}, err
		}
		written++
	}

	// 清理过期快照（撤回语义）。
	removed, err := s.cleanupStale(ctx, tasks)
	if err != nil {
		return SyncResult{}, err
	}

	return SyncResult{Published: written, Removed: removed}, nil
}

// fetchPublished 从后台拉取 published 任务列表（GET {backend}/api/tasks?status=published）。
func (s *Syncer) fetchPublished(ctx context.Context) ([]BackendTask, error) {
	target := s.backendPath("tasks") + "?status=published"
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, target, nil)
	if err != nil {
		return nil, err
	}
	res, err := s.client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("listing: fetch published tasks failed: %w", err)
	}
	defer res.Body.Close()
	if res.StatusCode < 200 || res.StatusCode >= 300 {
		body, _ := io.ReadAll(io.LimitReader(res.Body, 4096))
		return nil, fmt.Errorf("listing: backend %s returned HTTP %d: %s", target, res.StatusCode, strings.TrimSpace(string(body)))
	}

	var tasks []BackendTask
	if err := json.NewDecoder(res.Body).Decode(&tasks); err != nil {
		return nil, fmt.Errorf("listing: decode published tasks: %w", err)
	}
	return tasks, nil
}

// cleanupStale 删除桶中已不在 published 列表的旧快照。
func (s *Syncer) cleanupStale(ctx context.Context, tasks []BackendTask) (int, error) {
	current := make(map[string]bool, len(tasks))
	for _, t := range tasks {
		if t.ID != "" {
			current[t.ID] = true
		}
	}
	keys, err := s.store.List(ctx, Prefix)
	if err != nil {
		return 0, err
	}
	removed := 0
	for _, key := range keys {
		id := strings.TrimSuffix(strings.TrimPrefix(key, Prefix), ".json")
		if !current[id] {
			if err := s.store.Delete(ctx, key); err != nil {
				return 0, err
			}
			removed++
		}
	}
	return removed, nil
}

// snapshotOf 把后台任务映射为自己桶黄页快照（description 取 content；status 恒为 published）。
func snapshotOf(t BackendTask) Snapshot {
	return Snapshot{
		ID:          t.ID,
		Title:       t.Title,
		Description: t.Content,
		Reward:      t.Reward,
		ApplyGuide:  t.ApplyGuide,
		Status:      "published",
	}
}

// backendPath 后台目标路径：单租户（tenant 为空）不加前缀；多租户预留加 /api/{tenant}/… 前缀。
func (s *Syncer) backendPath(resource string) string {
	if s.tenant != "" {
		return fmt.Sprintf("%s/api/%s/%s", s.backend, url.PathEscape(s.tenant), resource)
	}
	return fmt.Sprintf("%s/api/%s", s.backend, resource)
}
