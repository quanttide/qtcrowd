# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/lang/zh-CN/).

> 组件 scope changelog（组件独立发布，tag 前缀见下）：
> - provider → [src/provider/CHANGELOG.md](src/provider/CHANGELOG.md)（`provider/*` tag，FC 部署，如 `provider/v0.1.0-alpha.1`）
> - site → [src/site/CHANGELOG.md](src/site/CHANGELOG.md)（`site/*` tag，OSS/CDN 部署，如 `site/v0.1.1-beta.6`）

## [Unreleased]

### Changed

- **qtcrowd-provider 定稿架构（前台唯一服务端）**：上架 + 数据 API + 写操作转发
  - 上架：provider 拉取后台 published 任务（`GET {BACKEND}/api/tasks?status=published`）→ 写自己桶
    qtcrowd-provider（`public/tasks/{id}.json` 黄页快照 title/description/reward/apply_guide）；
    周期同步（`QTCLOUD_CROWD_SYNC_INTERVAL`，默认 5m）+ `POST /api/admin/sync` 手动触发；
    认领/关闭的任务下次同步清理（撤回语义）；后台不可达/非 2xx 上架失败不静默（502）
  - 数据 API：`GET /api/tasks` 从自己桶读黄页快照返回 `{tasks: [...]}`——site/studio 不再直读 OSS/CDN
  - 转发保留：`POST /api/tasks/{id}/claim`、`/deliver` 仍转发后台（4xx/5xx 透传、后台不可达 502）
  - 存储：`QTCLOUD_CROWD_STORE`（local 开发 / oss 生产，`QTCLOUD_OSS_BUCKET`=自己桶 qtcrowd-provider）
- site：任务数据改从 qtcrowd-provider 数据 API 拉取（`QTCLOUD_CROWD_PUBLIC_URL` → `QTCLOUD_CROWD_PROVIDER_URL`，
  fetch `{PROVIDER}/api/tasks`）；dev mock 改为模拟数据 API（`public/mock/api/tasks.json`）；
  黄页快照解析兼容 `apply_guide` / 字符串 reward / `status=published`（视为可接）
- studio：任务列表改经 qtcrowd-provider 数据 API（读+写都经它，`QTCLOUD_CROWD_PUBLIC_URL` 移除）；
  黄页快照解析兼容 `apply_guide` / 字符串 reward / `status=published`（视为可认领）

### Added

- `src/provider`：qtcrowd-provider——前台写操作代理（Go 轻量转发服务）
  - 路由：`POST /api/tasks/{id}/claim`、`POST /api/tasks/{id}/deliver`——请求体原样透传（含 `partner_id`）
    转发到后台 qtcloud-crowd provider（`QTCLOUD_CROWD_BACKEND_API`，必填）；后台 4xx/5xx 状态码与错误体透传返回（前台能区分 404/409/400），后台不可达返回 502
  - 配置：`QTCLOUD_CROWD_ADDR`（默认 :8080）、`QTCLOUD_CROWD_TENANT`（租户上下文预留，当前为空不加前缀）
  - `GET /health` 健康检查；多阶段 Dockerfile + docker-compose.yml（provider 前置 :8080，后台 :8081）
- studio：认领 API 改调本 provider（新配置 `QTCLOUD_CROWD_PROVIDER_URL`，默认指向本 provider；未配置时回退现有 `QTCLOUD_CROWD_BACKEND_API` 直连或本地 mock）

## [0.0.1] - 2026-08-20

### Added

- 初始化仓库：README、LICENSE、CHANGELOG
- 定位：通用双边众包平台，标准交易市场，为 qtdata 筛选导流（意图档案见 data/intention/qtcrowd）

[Unreleased]: https://github.com/quanttide/qtcrowd/compare/v0.0.1...HEAD
[0.0.1]: https://github.com/quanttide/qtcrowd/releases/tag/v0.0.1
