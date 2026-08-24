# 数据模型与真实数据源

对应代码模块：`src/data/tasks.ts`。

## 真实数据源

站点任务数据**一律取自父仓库 `quanttide-crowd` 下的 `data/profile`**（见 `AGENTS.md`），不自创占位/示例数据，也不引用产品档案。

## 数据模型

`tasks.ts` 导出 `Task` 接口与 `tasks` 数组。

```ts
export interface Task {
  name: string;         // 唯一任务标识（路由参数 / key）
  title: string;        // 任务名
  description: string;  // 目录一句话
  business: string;     // 所属环节
  detail: string[];     // 详情页具体信息（无序列表）
  settlement: string;   // 结算 / 报价
}
```

### 当前任务

| name | title | business | 报酬 |
|------|-------|----------|------|
| `second-brain-init` | 第二大脑创建插件 | 量潮云 · 招聘考核 | 1000 元代金券（可兑换 CEO 2 小时课程） |

## 已知问题与改进

- **模型过窄**：`detail[]` / `settlement` 装不下真实档案的「业务/类别/状态/交付物/参考链接」等多块结构。
- **硬编码脱节**：tasks.ts 静态抄写 data/profile，无同步/校验机制。
- 改进方向见 [ROADMAP.md](../ROADMAP.md) 阶段 1（数据源解耦 + 数据模型结构化）。
