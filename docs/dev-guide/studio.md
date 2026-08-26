# qtcrowd 工作室（studio）设计 · dev-guide

> 依据：`data/context/crowdsourcing-platform/`（众包平台语境设计）。

## 0. 定位

- `studio` = 量潮众包平台的**工作台 / 控制台**（真实交易与运营层），与 `site`（招募说明）分工：**site 引流，studio 落地**。
- 依据：`00-overview.md`（设计总览）、`01-task-model.md`（任务模型）、`02-verifier-*.json`（验收器）、`03-settlement-escrow.md`（托管结算）、`04-data-model.sql`（数据模型）。

## 0.5 当前状态（2026-08）

- 已初始化 `src/studio`：**参与人员端**（Flutter Web）MVP——任务列表 / 详情 / 认领（本地记录 `data/my-tasks.json`）/ 我的结算（`data/my-settlements.json`），任务数据与 site 同一数据源（见 `src/studio/README.md`）。
- 已新增 `src/provider`：**前台唯一服务端**（Go）——上架（拉后台 published 任务写自己桶 qtcrowd-provider）+ 数据 API（site/studio 从 `{PROVIDER}/api/tasks` 拉任务，不再直读公开桶）+ 认领/交付写操作转发（`QTCLOUD_CROWD_BACKEND_API`，必填），后台状态码与错误体透传。studio 读+写都经 provider（`QTCLOUD_CROWD_PROVIDER_URL`），未配置时读回退资产 tasks.json、写回退直连后台或本地 mock。
- 尚未实现：管理端（qtcloud-crowd `src/studio` 已先行）、服务端（验收器 / 托管结算 / 归因 / 数据层），见下文角色与里程碑。

## 1. 角色工作台

| 角色 | 能力 |
|---|---|
| **需求方（量潮）** | 发布任务（验收配方 + 定价表 + 托管预算池预缴保证金）；选单；查看验收；触发/查看结算；发起/处理仲裁 |
| **接单者（worker）** | 浏览/领取任务；提交证据（按 `type.evidenceSchema`）；查看验收结果/质量分；查看结算与出金流水（`escrow_ledger`）；查看信誉 |
| **平台 / 运营** | 验收入口（`verifier` 运行 + 人工抽样复核）；仲裁（`disputed`）；任务类型插件注册（`task_types`） |

## 2. 核心：验收器（verifier）—— MVP 全部工作量所在

- 「有效」= 机器可判定的布尔公式；发布时写死并公开。
- **硬规则**（任一失败即 `reject`）：去重、手机/邮箱格式、目标画像匹配、时效窗口。
- **软规则**（输出质量分，用于信誉与抽样，不阻断打款）：如 `intent_v1`（`intentLevel ≠ none`）。
- 产物：`verification_runs`（`rule_results` / `valid` / `quality_score`）；`quality_score = f(intentLevel, completeness, sourceTrust)`（示例权重 0.5 / 0.3 / 0.2）。

## 3. 生命周期与实体（对齐 01 / 04）

- **任务状态机**：`draft → published → applied/assigned → in_progress → submitted → under_review → accepted | rejected → settled → closed`；任一态可 `revoked / cancelled / archived`；可进入 `disputed`。
- **关键关口**：只有 `accepted` 放行到 `settled`；托管池只从 accepted 状态扣款。
- **实体**：`users`、`task_types`、`tasks`、`pricing_tables`、`budget_pools`、`submissions`、`verification_rules`、`verification_runs`、`settlements`、`escrow_ledger`、`reputations`、`disputes`。

## 4. 关键决策落地

- **明码标价**：`pricing_tables`（`metric` / `unit` / `price`（`fixed` | `percent`）/ `conditions`）；拒绝「分佣面议」。
- **托管结算**：`budget_pools`（预缴保证金）→ `settlements`（`accepted → locked → settled → released`）→ `escrow_ledger` 出金流水（对接单者透明）。
- **唯一归因**：线索费归线索提交者、成交佣金归成交完成方（`closerId`）；两者独立、不按贡献加权；同一成交被多人申报则先到 + 证据链完整者优先，其余进 `disputed`。
- **分阶段**：线索费验收即结（短周期）；成交佣金确权后结（合同号 / 订单号 / 金额 / 付款凭证 / 财务复核，长周期）。

## 5. MVP 范围与边界（首期不做）

- 只实现 `sale`（`lead_acquisition` + `deal`）两种任务类型。
- **不做**：多任务类型、竞价/招标、多触点加权归因、评论审核、复杂信誉等级、消息通知、开放第三方发任务。
- **冷启动**：自供需求（量潮为首个/唯一需求方）→ 单垂直切入 → 再横向开放成平台。

## 6. 技术 / 架构

- **栈**：`studio` 遵循惯例用 **Flutter Web**（类比 qtcloud-agent / qtcloud-health 的 `studio`）。`site` 为 React + Vite。
- **服务端**：验收器 / 托管结算 / 归因 / 数据层（PostgreSQL 数据模型见 `04-data-model.sql`）。site 与 studio 共享同一数据模型与业务逻辑。
- **构建**：`src/studio`，`flutter build web` 产物上传到 `{repo}-studio` 桶。
- **部署**：新增 `deploy-studio.yml`（`site/*` / `studio/*` tag 触发）＋ terraform（`studio-bucket.tf` + `cdn.tf` 的 studio CDN/DNS，如 `studio.crowd.quanttide.com`）＋ 证书（单层/按需）＋ SPA 回退。`site` 已上线；`studio` 已初始化参与端（待部署）。

## 7. 里程碑

1. **MVP**：sale 单类型 + 验收器 + 托管结算 + 唯一归因（自供需求验证）。
2. **验证**：接单人跑通「接单 → 提交 → 验收 → 拿钱」，site 引流。
3. **横向**：开放更多任务类型 / 第三方发单 / 信誉等级。
