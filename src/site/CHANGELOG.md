# Changelog

## [Unreleased]

## 2026-08-24

### site/v0.1.1-beta.3（联系邮箱变更）

### 修改

- 联系邮箱由 `hr@quanttide.com` 改为 `crowd@quanttide.com`（`src/data/site.ts` 常量 + 任务 applyGuide）

## 2026-08-24

### site/v0.1.1-beta.2（结构化数据 + 黄页体验）

### 新增

- 数据模型结构化：`Task` 扩展为 `status / category / business / deliverables / reward / reference / applyGuide` 等命名段落，基于 `data/profile/qtcloud/second-brain-init.md` 真实内容填充
- 数据源解耦：任务数据抽为 `src/data/tasks.json` + JSON Schema 契约（`tasks.schema.json`）；新增 `scripts/sync-tasks.mjs`（从 data/profile 生成）与 `scripts/validate-tasks.mjs`（契约 + 一致性 + 邮箱去重校验），npm 脚本 `data:sync` / `data:validate`，build 前置校验
- 共享常量：`src/data/site.ts`（联系邮箱、结算口径），Home 与 TaskDetail 共用
- 首页「可接任务」按状态分组展示，标注可接性
- 详情页「如何报名」步骤 + 真实接单入口（联系邮箱报名）

### 修改

- 首页「结算与竞价」改由任务数据渲染，删除与任务数据重复的硬编码段落
- 移除 `/tasks` 与 `/` 重复路由，路由收敛为 `/` 与 `/tasks/:name`
- 详情列表 `key` 改用稳定值（条目文本 / 链接）；footer 年份动态取当前年
- 文档（docs/*、README、docs/dev-guide/site.md）定位拉齐为「黄页信息展示站 + 真实数据源 data/profile」

## 2026-08-22

### site/v0.1.1-beta.1（课程研发众包）

- 首场景改为课程研发最小循环：制作（录制片段）+ 审核（学习记录）+ 分解 + 组合
- 可接任务：录制讲解片段（现金 20 元/片段，或 10 倍代金券 200 元课券）；审核学习记录（现金 5 元/份记录，或 10 倍代金券 50 元课券）
- 报酬二选一：接单人自选——现金或 10 倍课程代金券（想学习选券、想赚钱选现金；券回流课堂）
- 谈条件竞价：可报更低价格、或指定现金/券来接单
- 链条：课堂 → 众包 → 招聘；不做低价悬赏（标准任务，非悬赏）

### site/v0.1.1-alpha.2（黄页版）

- 精简为**单页黄页**：一页目录 + 联系，去路由与导航。
- 首页：定位一行 +「可接任务」目录（渠道拓展/线索获取/代理销售/推广投放/客户回访）+ 联系。
- 删除 `/post`、`/take` 漏斗页与「你能得到什么/怎么开始/怎么相信」营销段落。
- 已上线 crowd.quanttide.com

### site/v0.1.1-alpha.1（接单人优先版）

- 站点以**接单人为中心**重构：Hero 改为面向接单人的价值主张
- 新增「你能得到什么」：按结果付酬 / 标准公开 / 持续有单
- 任务清单改为「你可以接这些活」；新增「怎么相信」（结算保障）
- 导航改为：首页 / 任务清单 / 成为伙伴
- 已上线 crowd.quanttide.com

### site/v0.1.0（初始发布）

- 初始化 src/site：Vite + React 19 + TS 脚手架
- 首页：Hero + 发单说明 + 可接任务清单 + 参与方式 + 联系
- 发单页 `/post`：量潮科技自营发销售众包；参与页 `/take`：谁能参与 / 如何参与 / 平台原则
- 数据：`src/data/tasks.ts` 销售众包任务类型清单（渠道拓展 / 线索获取 / 代理销售 / 推广投放 / 客户回访）
- 上线配置：`deploy-site.yml` + `manifests/terraform`（qtcrowd-site / CDN crowd.quanttide.com / DNS CNAME / 证书 / SPA 回退）
- 上线 crowd.quanttide.com
