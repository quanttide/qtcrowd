# Changelog

## [Unreleased]

### 新增

- 初始化 `src/site`：众包官网（React 19 + Vite + TS，参考 qtfounder/qtbusiness）
- 首页：定位（标准交易市场）、交易方式入口、标准任务清单、与 qtdata 协同、联系
- 发单页 `/post`、接单页 `/take`：流程说明与平台原则
- 数据：`src/data/tasks.ts` 静态标准任务清单

### 修改

- site：数据模型结构化 + 数据源解耦（`tasks.json` + JSON Schema + 同步/校验脚本），首页与详情页按状态 / 报名闭环渲染；文档定位拉齐为「黄页信息展示站 + 真实数据源 data/profile」

## [0.0.1] - 2026-08-20

### 新增

- 初始化仓库：README、LICENSE、CHANGELOG
- 定位：通用双边众包平台，标准交易市场，为 qtdata 筛选导流（意图档案见 data/intention/qtcrowd）
