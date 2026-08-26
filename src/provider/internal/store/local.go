package store

import (
	"context"
	"os"
	"path/filepath"
)

// Local 是本地文件存储实现：key 视为根目录下的相对路径（开发/测试）。
type Local struct {
	root string
}

// NewLocal 创建本地文件存储（root 为数据根目录，自动创建）。
func NewLocal(root string) *Local {
	return &Local{root: root}
}

// List 返回前缀匹配的所有 key（相对路径，/ 分隔）。
func (s *Local) List(_ context.Context, prefix string) ([]string, error) {
	dir := filepath.Join(s.root, filepath.FromSlash(prefix))
	entries, err := os.ReadDir(dir)
	if err != nil {
		if os.IsNotExist(err) {
			return []string{}, nil
		}
		return nil, err
	}
	keys := make([]string, 0, len(entries))
	for _, e := range entries {
		if e.IsDir() {
			continue
		}
		keys = append(keys, prefix+e.Name())
	}
	return keys, nil
}

// Get 读取对象；不存在时返回 ErrNotFound。
func (s *Local) Get(_ context.Context, key string) ([]byte, error) {
	data, err := os.ReadFile(filepath.Join(s.root, filepath.FromSlash(key)))
	if err != nil {
		if os.IsNotExist(err) {
			return nil, ErrNotFound
		}
		return nil, err
	}
	return data, nil
}

// Put 写入对象（覆盖语义：先写临时文件再原子 rename，避免半写状态）。
func (s *Local) Put(_ context.Context, key string, data []byte) error {
	path := filepath.Join(s.root, filepath.FromSlash(key))
	if err := os.MkdirAll(filepath.Dir(path), 0o755); err != nil {
		return err
	}
	tmp := path + ".tmp"
	if err := os.WriteFile(tmp, data, 0o644); err != nil {
		return err
	}
	return os.Rename(tmp, path)
}

// Delete 删除对象；对象不存在视为已删除（幂等）。
func (s *Local) Delete(_ context.Context, key string) error {
	err := os.Remove(filepath.Join(s.root, filepath.FromSlash(key)))
	if err != nil && !os.IsNotExist(err) {
		return err
	}
	return nil
}

// _ 编译期断言：Local 实现 Store。
var _ Store = (*Local)(nil)
