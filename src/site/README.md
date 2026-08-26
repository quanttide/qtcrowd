# 量潮众包官网（qtcrowd-site）

公网信息展示站（黄页，非交易平台）：展示量潮众包正在发的任务与参与方式，把行动引流到真实接单入口。

## 页面

- 首页 `/`：定位 + 可接任务目录（公开数据源，published 任务）+ 联系
- 详情页 `/tasks/:id`：任务结构化说明 + 如何报名 + 真实接单入口

## 数据源：OSS 共享数据层

任务池从**公开数据层**（公开桶/CDN）拉取，与 studio 同源：

- `QTCLOUD_CROWD_PUBLIC_URL`：公开桶/CDN 根 URL。配置后 fetch `{url}/tasks.json`（聚合），
  404/失败回退 `{url}/public/tasks/index.json`（对应后台发布的 `public/tasks/{id}.json`）；
  全部失败**页面显示错误提示（不静默）**。
- **未配置时**：本地开发默认 `/mock`（本仓库 mock 公开桶，见 `public/mock/`）；
  生产构建回退打包 `src/data/tasks.json`（开发兜底，仅 PUBLIC_URL 未配置时使用）。

```bash
QTCLOUD_CROWD_PUBLIC_URL=https://cdn.example.com npm run dev   # 读真实公开桶/CDN
npm run dev                                                     # 未配置：读本地 mock 公开桶
```

## 打包数据兜底（data:sync / data:validate）

`src/data/tasks.json` 作为未配置 PUBLIC_URL 时的兜底数据源，仍从父仓库 `data/profile` 生成：

```bash
npm run data:sync      # 从 data/profile 生成 src/data/tasks.json
npm run data:validate  # JSON Schema 校验 + 与 data/profile 一致性核对（已挂进 build 前置）
```

## 技术栈

- React 19 + TypeScript
- Vite 6（`QTCLOUD_CROWD_PUBLIC_URL` 经 vite.config.ts 注入 `import.meta.env`）
- vitest（数据源切换测试：mock fetch 成功 / 404 回退 / 失败不静默）

## 开发 / 测试 / 构建

```bash
npm install
npm run dev       # 开发（默认读 mock 公开桶）
npm test          # vitest：公开数据源切换
npm run build     # data:validate + tsc + vite build
npm run preview
```
