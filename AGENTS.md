# AGENTS.md

本文件为参与本仓库（qtcrowd）开发 / 维护的 AI 与成员提供约定。

## 真实数据源

- 本仓库（qtcrowd）及其中 `src/site`（官网）展示的众包任务数据，**运行时真实数据源是 qtcrowd-provider 数据 API**
  （前台唯一服务端——`QTCLOUD_CROWD_PROVIDER_URL`：上架 + 数据 API + 写操作转发）。
- **数据流**：后台（qtcloud-crowd provider）审核通过 → 前台 qtcrowd-provider 拉取可上架任务
  （`GET {BACKEND}/api/tasks?status=published`）→ 写自己桶 qtcrowd-provider（`public/tasks/{id}.json`
  黄页快照）→ 数据 API（`GET {PROVIDER}/api/tasks`）→ 前台（site/studio）拉取。
  前台依赖后台（上架拉取 + 认领/交付写回 API）；后台不依赖前台。
- 未配置 `QTCLOUD_CROWD_PROVIDER_URL` 时回退：site 用 `src/site/src/data/tasks.json`（与 `data/profile` 一致的静态黄页），studio 用 `assets/data/tasks.json`——**静态文件是开发兜底，不是运行时源**。
- 需要「真实 / 当前」任务、结算、报价等数据时，不要自创占位 / 示例数据（mock 数据 API 除外，见下）。
- 开发 mock：`src/site/public/mock/api/tasks.json` 模拟 qtcrowd-provider 数据 API——仅开发模式（PROVIDER_URL 未配置时）使用。

## 其它约定

- 站点只做信息展示（黄页），非交易平台；改动遵循 README 与 CHANGELOG。
