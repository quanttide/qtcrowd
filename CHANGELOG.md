# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/lang/zh-CN/).

## [Unreleased]

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
