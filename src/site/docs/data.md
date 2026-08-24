# 数据模型与真实数据源

对应代码模块：`src/data/` 与 `scripts/`。

## 真实数据源

站点任务数据一律取自父仓库 `quanttide-crowd` 下的 `data/profile`（见 `AGENTS.md`），不自创占位 / 示例数据，也不引用产品档案。「保持一致」是机器保证，不是约定：

- `npm run data:sync`：从 `data/profile/qtcloud/*.md` 生成 `src/data/tasks.json`（档案字段逐项生成）。
- `npm run data:validate`：校验 `tasks.json` 满足 `tasks.schema.json`，并与 `data/profile` 逐项核对；已挂进 `npm run build` 前置。
- `data/profile` 不在当前检出时（如单独克隆 qtcrowd 仓库），一致性核对跳过并警告，schema 校验始终执行。

## 数据文件

- `src/data/tasks.json`：任务数据本体。
- `src/data/tasks.schema.json`：数据契约（JSON Schema）。
- `src/data/tasks.ts`：`Task` 类型 + 从 tasks.json 导入的 `tasks` + 按状态分组等聚合。
- `src/data/site.ts`：站点共享常量（联系邮箱、结算口径），Home 与 TaskDetail 共用，避免硬编码漂移。

## 数据模型

`Task` 字段（与 `tasks.schema.json` 一致）：

- 档案字段（由 data/profile 生成）：`name`（与档案文件名一致）、`title`、`business`、`category`、`status`（待认领 / 进行中 / 已关闭）、`background`、`content`、`input`、`reference`、`deliverables`、`reward`、`others`
- 站点侧字段（人工维护，`data:sync` 保留）：`description`（目录一句话）、`applyGuide`（如何报名步骤，含真实接单入口）

## 当前任务

- `second-brain-init` 第二大脑创建插件：业务量潮云，类别招聘考核，状态待认领，报酬 1000 元代金券（可兑换 CEO 2 小时课程，可自报价）。

## 已知问题与改进

- 改进方向见 [ROADMAP.md](../ROADMAP.md)；阶段 1（数据源解耦 + 数据模型结构化）已完成。
