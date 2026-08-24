# qtcrowd 站点（site）设计 · dev-guide

## 0. 定位

- `site` = 公网信息展示站（黄页，`crowd.quanttide.com`），只做信息展示，不是交易平台。
- 展示量潮众包正在发的任务与参与方式，把行动引流到真实接单入口（联系邮箱报名）。
- 真实数据源：父仓库 `quanttide-crowd` 下的 `data/profile`（见 `AGENTS.md`）；站点任务数据由脚本生成并校验一致，不自创占位 / 示例数据。

## 1. 现状

- 首页 `/`：定位 + 可接任务目录（按状态分组）+ 任务来源 + 结算与竞价 + 联系
- 详情页 `/tasks/:name`：任务结构化段落（背景 / 内容 / 输入 / 参考 / 交付物 / 报酬 / 其他）+ 如何报名 + 真实接单入口
- 数据：`src/data/tasks.json`（真实数据源）+ `tasks.schema.json` + `site.ts`（共享常量）
- 校验：`npm run data:sync` / `npm run data:validate`（已挂进 build 前置）

## 2. 数据与校验

- `data:sync` 从 `data/profile/qtcloud/*.md` 生成 `tasks.json`：档案字段逐项生成，站点侧字段（`description` / `applyGuide`）保留现有值。
- `data:validate` 做三件事：JSON Schema 契约校验；与 `data/profile` 逐项核对；报名入口（联系邮箱）一致性检查，源码不允许硬编码邮箱。
- `data/profile` 不在当前检出时（如单独克隆 qtcrowd 仓库），一致性核对跳过并警告，schema 校验始终执行。
- 数据源目录可用环境变量 `QTCROWD_PROFILE_DIR` 覆盖。

## 3. 开发 / 构建

```bash
cd src/site
npm install
npm run dev
npm run build   # 前置执行 data:validate
```

## 4. 与历史设计的关系

早期版本定位为「销售众包 / 引流到 studio 工作台」，见 git 历史与 `src/site/CHANGELOG.md`；当前站点只做信息展示黄页，任务数据以 `data/profile` 为准。

## 5. 里程碑与改进

已完成的改进与待办见 `src/site/ROADMAP.md` 与 `src/site/CHANGELOG.md`。
