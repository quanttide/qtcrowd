# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/lang/zh-CN/).

## [0.1.1-beta.6] - 2026-08-26

### Added

- 前台 OSS 共享数据层：公开数据源配置 `QTCLOUD_CROWD_PUBLIC_URL`（公开桶/CDN 根 URL），site/studio 任务池同源读公开数据层（published 任务）
- site：任务池改为公开数据源拉取（404 回退 `public/tasks/index.json`），loading/error/空态三态 + 重试；vitest 数据源切换测试
- studio：HttpTaskRepository 读公开层 + HttpClaimApi 认领写回（409 提示）；66 测试全绿
- 部署：deploy-site.yml SPA 深链 200（/tasks 及 /tasks/<name> 无扩展名 key）

## [0.1.1-rc.1] - 2026-08-25

### Added

- 新增「量潮招聘工作流升级」任务（qtrecurit-workflow-update）
- 任务数据模型支持 `deadline`（截止日期）可选字段
- 验证脚本支持多业务目录（qtcloud、qtclass 等）

### Changed

- 以 data/profile 档案为准同步 tasks.json 数据
- 规范化招聘工作流升级档案格式

## [0.1.1-beta.5] - 2026-08-24

### Changed

- 任务激励改为 **1000 元代金券或 100 元现金（二选一）**：代金券主要针对学员（学习激励），现金主要针对招聘（应聘激励）
- 明面政策：接单人自己报价 / 自选报酬形式；实际效果是自我选择分流——学员自会选择代金券，招聘对象自会选择现金
- 选择建议：学员推荐选 1000 元代金券（学习激励更划算），实习候选人推荐选 100 元现金（应聘激励更直接）

## [0.1.1-beta.4] - 2026-08-24

### Added

- 首页改为**众包任务卡片列表**：每个任务一张卡片（任务名 + 可接性标签 + 描述 + 业务/类别/状态 + 报酬首条），点击卡片进入详情页
- 新增 `.task-grid` / `.task-card` 卡片样式（双列网格，≤600px 收单列）

### Changed

- 移除首页「任务来源」「结算与竞价」重复区块，任务信息统一由任务数据渲染
- 文档（pages/styling）同步首页卡片结构

## [0.1.1-beta.3] - 2026-08-24

### Changed

- 联系邮箱由 `hr@quanttide.com` 改为 `crowd@quanttide.com`（`src/data/site.ts` 常量 + 任务 applyGuide）

## [0.1.1-beta.2] - 2026-08-24

### Added

- 数据模型结构化：`Task` 扩展为 `status / category / business / deliverables / reward / reference / applyGuide` 等命名段落，基于 `data/profile/qtcloud/second-brain-init.md` 真实内容填充
- 数据源解耦：任务数据抽为 `src/data/tasks.json` + JSON Schema 契约（`tasks.schema.json`）；新增 `scripts/sync-tasks.mjs`（从 data/profile 生成）与 `scripts/validate-tasks.mjs`（契约 + 一致性 + 邮箱去重校验），npm 脚本 `data:sync` / `data:validate`，build 前置校验
- 共享常量：`src/data/site.ts`（联系邮箱、结算口径），Home 与 TaskDetail 共用
- 首页「可接任务」按状态分组展示，标注可接性
- 详情页「如何报名」步骤 + 真实接单入口（联系邮箱报名）

### Changed

- 首页「结算与竞价」改由任务数据渲染，删除与任务数据重复的硬编码段落
- 移除 `/tasks` 与 `/` 重复路由，路由收敛为 `/` 与 `/tasks/:name`
- 详情列表 `key` 改用稳定值（条目文本 / 链接）；footer 年份动态取当前年
- 文档（docs/*、README、docs/dev-guide/site.md）定位拉齐为「黄页信息展示站 + 真实数据源 data/profile」

## [0.1.1-beta.1] - 2026-08-22

### Changed

- 首场景改为课程研发最小循环：制作（录制片段）+ 审核（学习记录）+ 分解 + 组合
- 可接任务：录制讲解片段（现金 20 元/片段，或 10 倍代金券 200 元课券）；审核学习记录（现金 5 元/份记录，或 10 倍代金券 50 元课券）
- 报酬二选一：接单人自选——现金或 10 倍课程代金券（想学习选券、想赚钱选现金；券回流课堂）
- 谈条件竞价：可报更低价格、或指定现金/券来接单
- 链条：课堂 → 众包 → 招聘；不做低价悬赏（标准任务，非悬赏）

## [0.1.1-alpha.2] - 2026-08-22

### Changed

- 精简为**单页黄页**：一页目录 + 联系，去路由与导航
- 首页：定位一行 +「可接任务」目录（渠道拓展/线索获取/代理销售/推广投放/客户回访）+ 联系
- 删除 `/post`、`/take` 漏斗页与「你能得到什么/怎么开始/怎么相信」营销段落
- 已上线 crowd.quanttide.com

## [0.1.1-alpha.1] - 2026-08-22

### Changed

- 站点以**接单人为中心**重构：Hero 改为面向接单人的价值主张
- 新增「你能得到什么」：按结果付酬 / 标准公开 / 持续有单
- 任务清单改为「你可以接这些活」；新增「怎么相信」（结算保障）
- 导航改为：首页 / 任务清单 / 成为伙伴
- 已上线 crowd.quanttide.com

## [0.1.0] - 2026-08-22

### Added

- 初始化 src/site：Vite + React 19 + TS 脚手架
- 首页：Hero + 发单说明 + 可接任务清单 + 参与方式 + 联系
- 发单页 `/post`：量潮科技自营发销售众包；参与页 `/take`：谁能参与 / 如何参与 / 平台原则
- 数据：`src/data/tasks.ts` 销售众包任务类型清单（渠道拓展 / 线索获取 / 代理销售 / 推广投放 / 客户回访）
- 上线配置：`deploy-site.yml` + `manifests/terraform`（qtcrowd-site / CDN crowd.quanttide.com / DNS CNAME / 证书 / SPA 回退）
- 上线 crowd.quanttide.com

[Unreleased]: https://github.com/quanttide/qtcrowd/compare/site/v0.1.1-beta.6...HEAD
[0.1.1-beta.6]: https://github.com/quanttide/qtcrowd/compare/site/v0.1.1-beta.5...site/v0.1.1-beta.6
[0.1.1-rc.1]: https://github.com/quanttide/qtcrowd/compare/site/v0.1.1-beta.5...site/v0.1.1-rc.1
[0.1.1-beta.5]: https://github.com/quanttide/qtcrowd/compare/site/v0.1.1-beta.4...site/v0.1.1-beta.5
[0.1.1-beta.4]: https://github.com/quanttide/qtcrowd/compare/site/v0.1.1-beta.3...site/v0.1.1-beta.4
[0.1.1-beta.3]: https://github.com/quanttide/qtcrowd/compare/site/v0.1.1-beta.2...site/v0.1.1-beta.3
[0.1.1-beta.2]: https://github.com/quanttide/qtcrowd/compare/site/v0.1.1-beta.1...site/v0.1.1-beta.2
[0.1.1-beta.1]: https://github.com/quanttide/qtcrowd/compare/site/v0.1.1-alpha.2...site/v0.1.1-beta.1
[0.1.1-alpha.2]: https://github.com/quanttide/qtcrowd/compare/site/v0.1.1-alpha.1...site/v0.1.1-alpha.2
[0.1.1-alpha.1]: https://github.com/quanttide/qtcrowd/compare/site/v0.1.0...site/v0.1.1-alpha.1
[0.1.0]: https://github.com/quanttide/qtcrowd/releases/tag/site/v0.1.0
