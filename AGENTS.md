# AGENTS.md

本文件为参与本仓库（qtcrowd）开发 / 维护的 AI 与成员提供约定。

## 真实数据源

- 本仓库（qtcrowd）及其中 `src/site`（官网）展示的众包任务数据，**真实数据源是父仓库 `quanttide-crowd` 下的 `data/profile`**。
- 需要「真实 / 当前」任务、结算、报价等数据时，一律从 `data/profile` 读取，**不要**引用产品档案（如 `quanttide-profile-of-product-development`），也不要自创占位 / 示例数据。
- site 的任务清单（`src/site/src/data/tasks.ts` 等）必须与 `data/profile` 保持一致，数据以 `data/profile` 为准。

## 其它约定

- 站点只做信息展示（黄页），非交易平台；改动遵循 README 与 CHANGELOG。
