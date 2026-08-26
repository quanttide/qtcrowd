# qtcrowd

量潮众包：量潮科技自营发销售众包，面向外部渠道与代理，按量潮标准结算。

站点只做信息展示，不是交易平台。

## 代码

| 路径 | 说明 |
|------|------|
| `src/site` | 众包官网（React 19 + Vite，见 [site README](./src/site/README.md)） |
| `src/studio` | 参与人员端工作室（Flutter Web，任务认领 + 结算，见 [studio README](./src/studio/README.md)） |
| `src/provider` | 前台唯一服务端（Go：上架 + 数据 API + 转发，见 [provider README](./src/provider/README.md)） |

## 数据层：qtcrowd-provider 数据 API（前台唯一服务端）

前台（site / studio）**只认 qtcrowd-provider**——上架 + 数据 API + 写操作转发：

- `QTCLOUD_CROWD_PROVIDER_URL`（site 环境变量 / studio dart-define，统一 URL）：qtcrowd-provider 根 URL。
  任务数据从 `{url}/api/tasks` 拉取（provider 自己桶 qtcrowd-provider 的黄页快照
  ——published 任务 title/description/reward/applyGuide）；认领写回 `POST {url}/api/tasks/{id}/claim`
  （body `partner_id`，published → accepted），qtcrowd-provider 转发到后台。
  **site/studio 不再直读公开桶 OSS/CDN**。
- 上架：qtcrowd-provider 从后台拉取可上架任务（`GET {BACKEND}/api/tasks?status=published`）→
  写自己桶 qtcrowd-provider（`public/tasks/{id}.json` 黄页快照）；周期同步 + `POST /api/admin/sync` 手动触发。
- `QTCLOUD_CROWD_BACKEND_API`（provider 环境变量，必填）：后台 API 根 URL。qtcrowd-provider 只做
  上架拉取与写操作转发（`POST {url}/api/tasks/{id}/claim`、`POST {url}/api/tasks/{id}/deliver`），
  后台状态码与错误体透传返回。
- 未配置 `QTCLOUD_CROWD_PROVIDER_URL` 时回退：site 用 `src/site/src/data/tasks.json`，
  studio 用 `assets/data/tasks.json`——**静态文件是开发兜底，不是运行时源**。

## 开发

```bash
# provider：前台唯一服务端（QTCLOUD_CROWD_BACKEND_API 必填，默认 :8080）
cd src/provider && QTCLOUD_CROWD_BACKEND_API=http://localhost:8081 go run ./cmd/server
cd src/site && npm install && npm run dev
cd src/studio && flutter pub get && flutter run -d chrome --dart-define=QTCLOUD_CROWD_PROVIDER_URL=http://localhost:8080
```

## 构建

```bash
cd src/site && npm run build
cd src/studio && flutter build web
```
