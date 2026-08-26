# Changelog

## [0.1.1-beta.6] - 2026-08-26

### 新增

- 前台 OSS 共享数据层：公开数据源配置 `QTCLOUD_CROWD_PUBLIC_URL`（公开桶/CDN 根 URL），site/studio 任务池同源读公开数据层（published 任务：title/description/reward/applyGuide），fetch 失败页面报错不静默；本地 mock 公开桶（`src/site/public/mock/`，dev 默认数据源）；未配置时回退打包 tasks.json（开发兜底）
- site：任务池改为公开数据源拉取（`{url}/tasks.json`，404 回退 `public/tasks/index.json`），首页 / 详情页 loading / error / 空态三态 + 重试；vitest 数据源切换测试（mock fetch 成功 / 404 回退 / 失败不静默）
- studio：认领改调后台 API（`POST {BACKEND_API}/api/tasks/{id}/claim`，body `partner_id`，published → accepted，`QTCLOUD_CROWD_BACKEND_API` 未配置时本地 mock），认领成功写本地 `my-tasks.json`，API 失败 / 非法状态不写本地并提示；任务列表未认领显示「可认领」；测试：认领流程 mock API 成功 / 失败 / 非法状态 + 公开数据层仓储
- 部署：`deploy-site.yml` 增加 SPA 深链 200 处理（列表 key 模式，参考 qtfiction）——把 SPA 壳上传为无扩展名 key（`/tasks` 及 `/tasks/<id>`，Content-Type:text/html），id 集合从 `src/site/src/data/tasks.json` 解析；深链直接访问返回 200，不依赖 CDN 回写

### 修改

- site：任务数据源从静态 `tasks.json` 改为公开数据层（`publicTasks.ts` + `useTaskCatalog` hook），`tasks.json` 降级为开发兜底（仅 PUBLIC_URL 未配置时）
- studio：任务目录支持公开数据层（`HttpTaskRepository`，`QTCLOUD_CROWD_PUBLIC_URL` 配置时生效），资产 tasks.json 降级为兜底；详情页空档案段落自动隐藏；README 补充 dart-define 配置说明

### 新增

- 初始化 `src/site`：众包官网（React 19 + Vite + TS，参考 qtfounder/qtbusiness）
- 首页：定位（标准交易市场）、交易方式入口、标准任务清单、与 qtdata 协同、联系
- 发单页 `/post`、接单页 `/take`：流程说明与平台原则
- 数据：`src/data/tasks.ts` 静态标准任务清单

### 修改

- site：数据模型结构化 + 数据源解耦（`tasks.json` + JSON Schema + 同步/校验脚本），首页与详情页按状态 / 报名闭环渲染；文档定位拉齐为「黄页信息展示站 + 真实数据源 data/profile」

### 新增

- 初始化 `src/studio`：众包**参与人员端**（Flutter Web，渠道 / 代理 / 实训成员）
- 任务列表 + 详情：真实任务（title / category / business / 状态 / 报酬 + 背景 / 内容 / 输入 / 交付物 / 报酬 / 如何报名），数据与 site 同一数据源（`assets/data/tasks.json`，由 `scripts/sync-tasks.mjs` 从 site 同步，`validate-tasks.mjs` 校验一致）
- 认领：待认领任务 → 认领按钮 → 本地记录（`data/my-tasks.json` 原子写，`QTCLOUD_CROWD_STUDIO_DATA` 可覆盖目录），参与端不写管理端数据
- 我的结算：结算记录（金额 / 时间），本地文件 `data/my-settlements.json`
- 底部导航：任务 / 我的认领 / 结算；models/repositories/screens 三件套 + main.dart 接线；测试：模型 / 仓储 / 屏幕基础渲染（`flutter analyze` + `flutter test` 全绿）

## [0.0.1] - 2026-08-20

### 新增

- 初始化仓库：README、LICENSE、CHANGELOG
- 定位：通用双边众包平台，标准交易市场，为 qtdata 筛选导流（意图档案见 data/intention/qtcrowd）
