package store

import (
	"bytes"
	"context"
	"errors"
	"io"
	"strings"

	"github.com/aliyun/aliyun-oss-go-sdk/oss"
)

// OSSConfig 是阿里云 OSS 连接配置（环境变量注入）。
// Bucket 为 qtcrowd-provider 自己的桶（已建，如 qtcrowd-provider）。
type OSSConfig struct {
	Endpoint        string // 如 oss-cn-hangzhou.aliyuncs.com（不带 https://）
	Bucket          string // qtcrowd-provider 自有桶（黄页快照 public/tasks/{id}.json）
	AccessKeyID     string
	AccessKeySecret string
}

// OSS 是阿里云 OSS 实现（qtcrowd-provider 自有桶），使用官方 SDK。
type OSS struct {
	client *oss.Client
	bucket *oss.Bucket
	cfg    OSSConfig
}

// NewOSS 创建 OSS 存储。
func NewOSS(cfg OSSConfig) (*OSS, error) {
	endpoint := strings.TrimPrefix(cfg.Endpoint, "https://")
	endpoint = strings.TrimPrefix(endpoint, "http://")

	client, err := oss.New(endpoint, cfg.AccessKeyID, cfg.AccessKeySecret)
	if err != nil {
		return nil, err
	}
	bucket, err := client.Bucket(cfg.Bucket)
	if err != nil {
		return nil, err
	}
	return &OSS{client: client, bucket: bucket, cfg: cfg}, nil
}

// List 返回前缀匹配的所有对象名（如 public/tasks/ → public/tasks/{id}.json 列表）。
func (s *OSS) List(_ context.Context, prefix string) ([]string, error) {
	var keys []string
	marker := ""
	for {
		res, err := s.bucket.ListObjects(oss.Prefix(prefix), oss.Marker(marker))
		if err != nil {
			return nil, err
		}
		for _, obj := range res.Objects {
			keys = append(keys, obj.Key)
		}
		if !res.IsTruncated {
			return keys, nil
		}
		marker = res.NextMarker
	}
}

// Get 读取对象；不存在（404）时返回 ErrNotFound。
func (s *OSS) Get(_ context.Context, key string) ([]byte, error) {
	body, err := s.bucket.GetObject(key)
	if err != nil {
		if isNotFound(err) {
			return nil, ErrNotFound
		}
		return nil, err
	}
	defer body.Close()
	return io.ReadAll(body)
}

// Put 写入对象（覆盖语义）。
func (s *OSS) Put(_ context.Context, key string, data []byte) error {
	return s.bucket.PutObject(key, bytes.NewReader(data))
}

// Delete 删除对象；404 视为已删除（幂等——上架同步清理时对象可能已不存在）。
func (s *OSS) Delete(_ context.Context, key string) error {
	err := s.bucket.DeleteObject(key)
	if err != nil && !isNotFound(err) {
		return err
	}
	return nil
}

// isNotFound 判断错误是否为 OSS 404（NoSuchKey/NoSuchBucket）。
func isNotFound(err error) bool {
	var serr oss.ServiceError
	if errors.As(err, &serr) {
		return serr.StatusCode == 404
	}
	return false
}

// _ 编译期断言：OSS 实现 Store。
var _ Store = (*OSS)(nil)
