# 量潮众包官网（qtcrowd-site）

公网信息展示站（黄页，非交易平台）：展示量潮众包正在发的任务与参与方式，把行动引流到真实接单入口。

## 页面

- 首页 `/`：定位 + 可接任务目录（qtcrowd-provider 数据 API，published 任务）+ 联系
- 详情页 `/tasks/:id`：任务结构化说明 + 如何报名 + 真实接单入口

## 数据源：qtcrowd-provider 数据 API（前台唯一服务端）

任务池从**qtcrowd-provider 数据 API**拉取（与 studio 同源，不再直读公开桶 OSS/CDN）：

- `QTCLOUD_CROWD_PROVIDER_URL`：qtcrowd-provider 根 URL。配置后 fetch `{url}/api/tasks`
  （返回自己桶黄页快照——published 任务 title/description/reward/apply_guide）；
  失败**页面显示错误提示（不静默）**。
- **未配置时**：本地开发默认 `/mock`（本仓库 mock 数据 API，见 `public/mock/api/tasks.json`）；
  生产构建回退打包 `src/data/tasks.json`（开发兜底，仅 PROVIDER_URL 未配置时使用）。

```bash
QTCLOUD_CROWD_PROVIDER_URL=https://api.crowd.quanttide.com npm run dev   # 读 qtcrowd-provider 数据 API
npm run dev                                                               # 未配置：读本地 mock 数据 API
```

## 打包数据兜底（data:sync / data:validate）

`src/data/tasks.json` 作为未配置 PROVIDER_URL 时的兜底数据源，仍从父仓库 `data/profile` 生成：

```bash
npm run data:sync      # 从 data/profile 生成 src/data/tasks.json
npm run data:validate  # JSON Schema 校验 + 与 data/profile 一致性核对（已挂进 build 前置）
```

## 技术栈

- React 19 + TypeScript
- Vite 6（`QTCLOUD_CROWD_PROVIDER_URL` 经 vite.config.ts 注入 `import.meta.env`）
- vitest（数据源切换测试：mock fetch 成功 / 失败不静默 + 黄页快照解析）

## 开发 / 测试 / 构建

```bash
npm install
npm run dev       # 开发（默认读 mock 数据 API）
npm test          # vitest：数据源切换 + 快照解析
npm run build     # data:validate + tsc + vite build
npm run preview
```
