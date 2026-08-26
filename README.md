# qtcrowd

量潮众包：量潮科技自营发销售众包，面向外部渠道与代理，按量潮标准结算。

站点只做信息展示，不是交易平台。

## 代码

| 路径 | 说明 |
|------|------|
| `src/site` | 众包官网（React 19 + Vite，见 [site README](./src/site/README.md)） |
| `src/studio` | 参与人员端工作室（Flutter Web，任务认领 + 结算，见 [studio README](./src/studio/README.md)） |

## 数据层：OSS 共享数据层

前台（site / studio）读公开数据层（公开桶/CDN），写操作（认领）调后台 API：

- `QTCLOUD_CROWD_PUBLIC_URL`：公开数据源根 URL。配置后任务池从 `{url}/tasks.json`
  （404 回退 `public/tasks/index.json`）拉取 published 任务（title/description/reward/applyGuide）；
  失败页面报错不静默。未配置时：site dev 默认读本地 mock 公开桶（`src/site/public/mock/`），
  site 生产与 studio 回退打包 tasks.json（开发兜底）。
- `QTCLOUD_CROWD_BACKEND_API`（studio，dart-define）：认领写回 `POST {url}/api/tasks/{id}/claim`
  （body `partner_id`，published → accepted），成功写本地 `my-tasks.json`；未配置时本地 mock。

## 开发

```bash
cd src/site && npm install && npm run dev
cd src/studio && flutter pub get && flutter run -d chrome --dart-define=QTCLOUD_CROWD_BACKEND_API=http://localhost:8080
```

## 构建

```bash
cd src/site && npm run build
cd src/studio && flutter build web
```
