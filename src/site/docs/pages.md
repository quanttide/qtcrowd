# 页面

对应代码模块：`src/pages/Home.tsx`、`src/pages/TaskDetail.tsx`。

## Home（首页 `/`）

- Hero：定位一行「量潮众包」+ 副文案
- 可接任务：按状态分组渲染任务目录（`groupTasksByStatus`），每项显示状态与可接性（`STATUS_AVAILABILITY`），点击进详情页
- 任务来源：量潮自供需求、不做低价悬赏
- 结算与竞价：按任务数据（`task.reward`）渲染明码标价，竞价原则来自 `site.ts` 的 `SETTLEMENT_POLICY`，无硬编码重复
- 联系：来自 `site.ts` 的 `CONTACT_ITEMS`（单一邮箱来源）

## TaskDetail（详情页 `/tasks/:name`）

按路由参数 `name` 在 `tasks` 中查找任务：

- 未找到：显示「未找到该任务」+ 返回首页
- 找到：展示标题与元信息（业务 / 类别 / 状态与可接性），并按命名段落渲染：任务背景、任务内容、任务输入、参考链接、交付物、报酬、其他、如何报名（`applyGuide` 步骤 + 真实接单入口 `CONTACT_MAILTO`）
- 列表 `key` 均用稳定值（条目文本或链接），不用数组索引
