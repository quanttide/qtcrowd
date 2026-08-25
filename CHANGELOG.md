# Changelog

## [Unreleased]

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
