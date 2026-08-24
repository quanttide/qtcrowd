# 页面

对应代码模块：`src/pages/Home.tsx`、`src/pages/TaskDetail.tsx`。

## Home（首页 `/`）

展示：

- **Hero**：定位一行「量潮众包」+ 副文案
- **可接任务**：从 `tasks` 渲染可点击目录（`/tasks/:name`）
- **任务来源**：量潮自供需求、不做低价悬赏
- **结算与竞价**：明码标价 + 谈条件竞价
- **联系**：招聘邮箱（`hr@quanttide.com`）

## TaskDetail（详情页 `/tasks/:name`）

按路由参数 `name` 在 `tasks` 中查找任务：

- 未找到 → 显示「未找到该任务」+ 返回首页
- 找到 → 展示标题、所属环节、任务说明、具体信息（`detail` 列表）、结算、联系

## 已知问题与改进

- 首页「结算与竞价」文案与 `tasks.ts` 结算数据重复（见 [ROADMAP.md](../ROADMAP.md) 缺陷 #3）。
- 联系邮箱在 Home 与 TaskDetail 两处硬编码（缺陷 #3）。
- 缺任务状态（待认领/进行中/已关闭）与「如何报名」闭环（缺陷 #5、#6）。
- `TaskDetail` 列表用 `key={i}`（索引作 key）（缺陷 #8）。
