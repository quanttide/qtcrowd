// Package store 提供 qtcrowd-provider 自有桶（OSS qtcrowd-provider 桶 / 本地目录）的对象存储抽象。
//
// 定稿架构：前台唯一服务端——上架把后台 published 任务拉到自己桶（public/tasks/{id}.json），
// 数据 API 从自己桶读（site/studio 不再直读 OSS/CDN）。本地实现（local）把 key 视为文件路径
// （开发/测试）；OSS 实现（oss）把 key 视为对象名（生产）。
package store

import (
	"context"
	"errors"
)

// ErrNotFound 表示 key 对应的对象不存在。
var ErrNotFound = errors.New("store: key not found")

// Store 是 qtcrowd-provider 自有桶的存储抽象（黄页快照 public/tasks/{id}.json）。
type Store interface {
	// List 返回前缀匹配的所有 key（如 public/tasks/ → 全部任务快照对象名）。
	List(ctx context.Context, prefix string) ([]string, error)
	// Get 读取 key 对应的对象；不存在时返回 ErrNotFound。
	Get(ctx context.Context, key string) ([]byte, error)
	// Put 写入 key 对应的对象（覆盖语义，原子写）。
	Put(ctx context.Context, key string, data []byte) error
	// Delete 删除 key 对应的对象；对象不存在视为已删除（幂等）。
	Delete(ctx context.Context, key string) error
}
