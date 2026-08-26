package store

import (
	"context"
	"errors"
	"os"
	"path/filepath"
	"testing"
)

func TestLocalPutGetDelete(t *testing.T) {
	ctx := context.Background()
	s := NewLocal(t.TempDir())

	// Put + Get 往返。
	if err := s.Put(ctx, "public/tasks/t1.json", []byte(`{"id":"t1"}`)); err != nil {
		t.Fatalf("Put: %v", err)
	}
	got, err := s.Get(ctx, "public/tasks/t1.json")
	if err != nil {
		t.Fatalf("Get: %v", err)
	}
	if string(got) != `{"id":"t1"}` {
		t.Fatalf("got %q", got)
	}

	// 覆盖语义。
	if err := s.Put(ctx, "public/tasks/t1.json", []byte(`{"id":"t1","status":"published"}`)); err != nil {
		t.Fatalf("Put overwrite: %v", err)
	}
	got, _ = s.Get(ctx, "public/tasks/t1.json")
	if string(got) != `{"id":"t1","status":"published"}` {
		t.Fatalf("覆盖后 got %q", got)
	}

	// List 前缀匹配。
	keys, err := s.List(ctx, "public/tasks/")
	if err != nil {
		t.Fatalf("List: %v", err)
	}
	if len(keys) != 1 || keys[0] != "public/tasks/t1.json" {
		t.Fatalf("List want [public/tasks/t1.json], got %v", keys)
	}

	// Delete + 幂等删除。
	if err := s.Delete(ctx, "public/tasks/t1.json"); err != nil {
		t.Fatalf("Delete: %v", err)
	}
	if _, err := s.Get(ctx, "public/tasks/t1.json"); !errors.Is(err, ErrNotFound) {
		t.Fatalf("删除后 Get want ErrNotFound, got %v", err)
	}
	if err := s.Delete(ctx, "public/tasks/t1.json"); err != nil {
		t.Fatalf("重复删除应幂等: %v", err)
	}
}

func TestLocalListEmpty(t *testing.T) {
	s := NewLocal(t.TempDir())
	keys, err := s.List(context.Background(), "public/tasks/")
	if err != nil {
		t.Fatalf("List: %v", err)
	}
	if len(keys) != 0 {
		t.Fatalf("空目录 want 0 keys, got %v", keys)
	}
}

func TestLocalGetNotFound(t *testing.T) {
	s := NewLocal(t.TempDir())
	if _, err := s.Get(context.Background(), "public/tasks/missing.json"); !errors.Is(err, ErrNotFound) {
		t.Fatalf("want ErrNotFound, got %v", err)
	}
}

func TestLocalListIgnoresDirectories(t *testing.T) {
	ctx := context.Background()
	root := t.TempDir()
	s := NewLocal(root)
	if err := s.Put(ctx, "public/tasks/t1.json", []byte(`{}`)); err != nil {
		t.Fatal(err)
	}
	// 目录不算对象。
	if err := os.MkdirAll(filepath.Join(root, "public", "tasks", "sub"), 0o755); err != nil {
		t.Fatal(err)
	}
	keys, err := s.List(ctx, "public/tasks/")
	if err != nil {
		t.Fatal(err)
	}
	if len(keys) != 1 || keys[0] != "public/tasks/t1.json" {
		t.Fatalf("目录不应计入对象, got %v", keys)
	}
}
