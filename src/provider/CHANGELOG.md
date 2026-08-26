# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/lang/zh-CN/).

## [Unreleased]

## [0.1.0-alpha.1] - 2026-08-26

### Added

- **qtcrowd-provider：量潮众包前台（site/studio）的唯一服务端**——上架 + 数据 API + 写操作转发：
  - 上架：从后台 qtcloud-crowd provider 拉取可上架任务（`GET {BACKEND}/api/tasks?status=published`）→
    写自己桶 qtcrowd-provider 黄页快照（`public/tasks/{id}.json`：title/description/reward/apply_guide）；
    周期同步（`QTCLOUD_CROWD_SYNC_INTERVAL`，默认 5m）+ `POST /api/admin/sync` 手动触发；
    认领/关闭的任务下次同步清理（撤回语义）；后台不可达/非 2xx 上架失败不静默（502）
  - 数据 API：`GET /api/tasks` 从自己桶读黄页快照返回 `{tasks: [...]}`（site/studio 不再直读 OSS/CDN）
  - 写操作转发：`POST /api/tasks/{id}/claim`、`/deliver` 转发后台（请求体原样透传含 `partner_id`；
    后台 4xx/5xx 状态码与错误体透传返回，后台不可达 502）
  - 路由：`GET /health` 健康检查；存储 `QTCLOUD_CROWD_STORE`（local 开发 / oss 生产，
    `QTCLOUD_OSS_BUCKET`=自己桶 qtcrowd-provider）
  - 配置：`QTCLOUD_CROWD_BACKEND_API`（必填）、`QTCLOUD_CROWD_ADDR`（默认 :8080）、
    `QTCLOUD_CROWD_TENANT`（租户上下文预留）、`QTCLOUD_OSS_*`（OSS 配置）
  - 交付：多阶段 Dockerfile + docker-compose.yml；部署流水线（deploy-provider.yml，FC 3.0 + ACR +
    Terraform，对齐 qtcloud-crowd 模式）

[Unreleased]: https://github.com/quanttide/qtcrowd/compare/provider/v0.1.0-alpha.1...HEAD
[0.1.0-alpha.1]: https://github.com/quanttide/qtcrowd/releases/tag/provider/v0.1.0-alpha.1
