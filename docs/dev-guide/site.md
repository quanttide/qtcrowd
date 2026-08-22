# qtcrowd 站点（site）设计 · dev-guide

> 依据：`data/context/crowdsourcing-platform/`（众包平台语境设计）。

## 0. 定位

- `site` = 公网信息/招募站（`crowd.quanttide.com`），**只做说明展示，不是交易平台**。
- 主线：量潮科技自营发**销售众包**，**以接单人为中心**（接单人优先）。
- 核心任务：面向外部渠道/代理，讲清「接这个活你能得到什么、怎么相信、怎么开始」，并把行动引流到 `studio`（真实平台工作台）。

## 1. 现状（v0.1.1-alpha.1）与 context 的差距

| 维度 | 现状 | context（crowdsourcing-platform）要求 | 出处 |
|---|---|---|---|
| 定价 | 分佣/单价**面议**，以合作契约为准 | **反对面议**，明码标价（标准化任务包 + 定价表） | `00-overview.md` |
| 信任 | 「标准公开 / 结算保障（以契约为准）」 | **平台托管（escrow）+ 预缴保证金，验收通过才打款**，出金流水透明 | `03-settlement-escrow.md` |
| 验收 | 「验收标准公开可验证」 | **可判定验收配方**：有效 = 机器可判定布尔公式，发布时写死并公开 | `02-verifier-*.json` |
| 任务类型 | 渠道拓展/线索获取/代理销售/推广投放/客户回访（5 类） | 首期只实现 `lead_acquisition`（线索）＋`deal`（成交）两类 | `00/01-task-model.md` |
| 归因 | 未提 | 唯一归因：线索费归线索提交者、成交佣金归成交完成方 | `03-settlement-escrow.md` |

## 2. 应如何改（接单人优先 + context 落地）

### 2.1 信息架构（以接单人为中心）

1. **Hero**：价值主张——你来把产品卖出去，量潮按结果付你钱。
2. **你能得到什么**：明码标价 / 验收通过才打款（托管）/ 唯一归因 / 长期有单。
3. **你可以接这些活**：任务类型对齐 `lead_acquisition`（线索获取）＋`deal`（成交），展示任务包（目标画像 / 覆盖地域 / 时效窗口 / 定价）。
4. **怎么相信**（核心信任，替代现有泛泛「标准公开」）：
   - **明码标价**：任务包定价表公开、写死。
   - **托管结算**：量潮预缴保证金到托管池，验收通过才划款（`accepted → settled → released`），出金流水对接单者可见。
   - **可判定验收**：发布时公开「有效线索 / 有效成交」定义，机器判，减少拒付扯皮。
   - **唯一归因**：线索费 / 成交佣金两笔独立，归谁都清晰（线索提交者 vs 成交完成方）。
5. **怎么开始**：说明到 `studio` 接单，site 承担引流。
6. **联系**（仍占位，待补）。

### 2.2 关键差异点（把「占位」换成「真承诺」）

- 把**「面议」→「明码标价」**：任务包定价 + 分阶段（线索费按条、成交佣金按 percent）。
- 把**「结算保障」→「托管结算」**：预缴保证金 + 验收通过才打款 + 透明出金流水。
- 把**「标准公开」→「可判定验收配方」**：发布时公开、机器判。
- 任务类型**对齐 `lead_acquisition` / `deal`**（同步 `tasks.ts` 与定价表）。

### 2.3 与 studio 的分工

- `site` = 招募说明 + 引流；`studio` = 实际发单 / 接单 / 验收 / 结算工作台。
- site 不承载交易，交易链路全部落到 studio。

## 3. 待补业务输入（site 需真实数据才能落地）

- 任务包定价：线索费单价（条）、成交佣金 percent、结算节点。
- 真实任务样例（`targetPersona` / `coverage` / `windowHours`）与对应定价表。
- 联系人信息（邮件/微信）替换现有占位。

## 4. 数据来源

- `data/context/crowdsourcing-platform/00-overview.md`
- `data/context/crowdsourcing-platform/01-task-model.md`
- `data/context/crowdsourcing-platform/02-verifier-lead-acquisition.json`、`02b-verifier-instance.json`
- `data/context/crowdsourcing-platform/03-settlement-escrow.md`
- `data/context/crowdsourcing-platform/04-data-model.sql`

## 5. 里程碑

1. 接单人优先文案上线（已 v0.1.1-alpha.1）。
2. 把「面议」换成「明码标价 + 托管结算 + 可判定验收」的真实承诺（需业务输入）。
3. 任务类型对齐 `lead_acquisition`/`deal`，site 引流到 studio。
4. site 逐步展示任务包 / 定价 / 信誉。
