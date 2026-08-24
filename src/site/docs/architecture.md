# 应用入口与路由

对应代码模块：`src/main.tsx`、`src/App.tsx`。

## 入口

- `src/main.tsx`：挂载 `App` 到 DOM 根节点，引入全局样式 `index.css`。

## 路由

`src/App.tsx` 使用 `BrowserRouter`，域名根路径部署（`crowd.quanttide.com`，无子路径前缀）；SPA 回退由 CDN 处理。

| 路由 | 渲染 | 说明 |
|------|------|------|
| `/` | `Home` | 首页（定位 + 可接任务目录 + 任务来源 + 结算 + 联系） |
| `/tasks` | `Home` | 任务集合页，当前复用首页 |
| `/tasks/:name` | `TaskDetail` | 任务详情页（按任务 `name` 查 `tasks`） |

## 布局

所有页面经 `<Layout>` 包裹（头部品牌 + 主内容 + 底部版权），见 [components.md](components.md)。

## 已知问题

- `/` 与 `/tasks` 渲染同一页，语义重复（见 [ROADMAP.md](../ROADMAP.md) 缺陷 #4）。
