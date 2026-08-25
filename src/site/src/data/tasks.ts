// 众包可接任务清单（类型与聚合）。
// 数据本体在 tasks.json（真实数据源：父仓库 data/profile，见 AGENTS.md），
// 由 scripts/sync-tasks.mjs 从 data/profile 生成 / 更新，scripts/validate-tasks.mjs 校验。
// 本文件只做类型声明与数据聚合，不自创占位 / 示例数据。

import tasksData from "./tasks.json";

export type TaskStatus = "待认领" | "进行中" | "已关闭";

export interface TaskReference {
  label: string;
  url: string | null;
}

/** 与 tasks.schema.json 中 task 定义保持一致 */
export interface Task {
  name: string; // 唯一任务标识（路由参数 / key），与档案文件名一致
  title: string; // 任务名
  description: string; // 目录一句话（站点侧维护）
  business: string; // 业务
  category: string; // 类别
  status: TaskStatus; // 状态（黄页可接性依据）
  background: string[]; // 任务背景
  content: string[]; // 任务内容
  input: string[]; // 任务输入
  reference: TaskReference[]; // 参考链接
  deliverables: string[]; // 交付物
  reward: string[]; // 报酬 / 结算
  others: string[]; // 其他说明
  applyGuide: string[]; // 如何报名步骤（站点侧维护）
  deadline?: string; // 截止日期（可选）
}

// tasks.json 由 scripts/sync-tasks.mjs 生成并经 scripts/validate-tasks.mjs 校验
// （含 tasks.schema.json 契约），此处显式断言为 Task[] 作为类型桥。
export const tasks: Task[] = tasksData.tasks as Task[];

/** 状态 → 可接性说明 */
export const STATUS_AVAILABILITY: Record<TaskStatus, string> = {
  "待认领": "可接",
  "进行中": "已在进行，暂不可接",
  "已关闭": "已关闭，不可接",
};

/** 按状态分组（待认领 → 进行中 → 已关闭），为多任务目录铺路 */
export function groupTasksByStatus(
  taskList: Task[],
): { status: TaskStatus; tasks: Task[] }[] {
  const order: TaskStatus[] = ["待认领", "进行中", "已关闭"];
  return order
    .map(status => ({ status, tasks: taskList.filter(t => t.status === status) }))
    .filter(group => group.tasks.length > 0);
}
