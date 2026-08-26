// 任务数据源：qtcrowd-provider 数据 API（前台唯一服务端）。
//
// 定稿架构：site 任务池从 qtcrowd-provider 拉取（fetch {PROVIDER}/api/tasks，
// 返回自己桶里的黄页快照——published 任务 title/description/reward/apply_guide），
// 不再直读公开桶 OSS/CDN。
//   - 配置 QTCLOUD_CROWD_PROVIDER_URL（vite.config.ts 注入 import.meta.env）后从数据 API 拉取；
//   - fetch 失败不静默：抛错由页面展示错误提示；
//   - 仅 PROVIDER_URL 未配置时回退打包 tasks.json（开发兜底，见 AGENTS.md 真实数据源约定）。

import { tasks as assetTasks, STATUS_AVAILABILITY, type Task, type TaskStatus } from "./tasks";

/** 公开任务（published 黄页视图）：title/description/reward/applyGuide 为公开字段，
 * 其余档案字段快照可能不携带（可选，按需条件渲染）。 */
export interface PublishedTask {
  /** 任务标识（public/tasks/{id}.json 的 id；tasks.json 兜底时取 name） */
  id: string;
  /** 任务名 */
  title: string;
  /** 目录一句话 */
  description: string;
  /** 报酬 / 结算（明码标价） */
  reward: string[];
  /** 如何报名步骤（真实接单入口） */
  applyGuide: string[];
  /** 业务（可选，快照可能携带） */
  business?: string;
  /** 类别（可选） */
  category?: string;
  /** 状态（可选；黄页快照 status=published 视为可接，映射为 undefined） */
  status?: TaskStatus;
  /** 截止日期（可选） */
  deadline?: string;
  // 以下档案字段仅 tasks.json 兜底 / 快照全量发布时存在
  background?: string[];
  content?: string[];
  input?: string[];
  reference?: Task["reference"];
  deliverables?: string[];
  others?: string[];
}

/** qtcrowd-provider 根 URL（vite.config.ts 注入；未配置时为空字符串 → 回退 tasks.json）。 */
export function getProviderUrl(): string {
  return import.meta.env.QTCLOUD_CROWD_PROVIDER_URL ?? "";
}

function asStringArray(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.filter((v): v is string => typeof v === "string");
  return [];
}

/** 黄页快照解析（数据 API 返回项：public/tasks/{id}.json，字段 apply_guide 与
 * 档案任务 name 的兼容处理）。 */
export function parsePublishedTask(json: Record<string, unknown>): PublishedTask {
  const id = (json.id as string) ?? (json.name as string) ?? "";
  const status = json.status as string | undefined;
  return {
    id,
    title: (json.title as string) ?? "",
    description: (json.description as string) ?? "",
    reward: asStringArray(json.reward),
    // 快照用 apply_guide（后台黄页模型视图）；档案数据用 applyGuide，两者兼容。
    applyGuide: asStringArray(json.applyGuide ?? json.apply_guide),
    business: json.business as string | undefined,
    category: json.category as string | undefined,
    // 黄页快照 status=published：公开层均为可接任务，映射为 undefined（不显示「已关闭」等）。
    status: status && STATUS_AVAILABILITY[status as TaskStatus] ? (status as TaskStatus) : undefined,
    deadline: json.deadline as string | undefined,
    background: asStringArray(json.background),
    content: asStringArray(json.content),
    input: asStringArray(json.input),
    reference: Array.isArray(json.reference)
      ? json.reference.filter(
          (r): r is { label: string; url: string | null } =>
            typeof r === "object" && r !== null,
        )
      : undefined,
    deliverables: asStringArray(json.deliverables),
    others: asStringArray(json.others),
  };
}

/** 任务列表解析（兼容 {tasks: [...]} 聚合与裸数组两种形态）。 */
export function parsePublishedTasks(data: unknown): PublishedTask[] {
  if (Array.isArray(data)) {
    return data
      .filter((t): t is Record<string, unknown> => typeof t === "object" && t !== null)
      .map(parsePublishedTask);
  }
  if (typeof data === "object" && data !== null) {
    const tasks = (data as Record<string, unknown>).tasks;
    if (Array.isArray(tasks)) return parsePublishedTasks(tasks);
  }
  return [];
}

/** 从 qtcrowd-provider 数据 API 拉取任务池：fetch {base}/api/tasks；
 * 非 2xx / 网络失败抛错（不静默，由页面展示错误提示）。 */
export async function fetchPublishedTasks(
  providerUrl: string,
): Promise<PublishedTask[]> {
  const base = providerUrl.replace(/\/+$/, "");
  const url = `${base}/api/tasks`;
  let res: Response;
  try {
    res = await fetch(url);
  } catch (e) {
    throw new Error(`任务数据源不可用：${url}`, { cause: e });
  }
  if (!res.ok) {
    throw new Error(`任务数据源 ${url} 返回 HTTP ${res.status}`);
  }
  return parsePublishedTasks(await res.json());
}

/** 任务目录加载：PROVIDER_URL 未配置 → 打包 tasks.json 兜底（source=asset）；
 * 已配置 → qtcrowd-provider 数据 API 拉取（source=provider），fetch 失败抛错不静默。 */
export async function loadTaskCatalog(
  providerUrl: string = getProviderUrl(),
): Promise<{ source: "provider" | "asset"; tasks: PublishedTask[] }> {
  if (!providerUrl) {
    return {
      source: "asset",
      tasks: assetTasks.map(t => ({
        id: t.name,
        title: t.title,
        description: t.description,
        reward: t.reward,
        applyGuide: t.applyGuide,
        business: t.business,
        category: t.category,
        status: t.status,
        deadline: t.deadline,
        background: t.background,
        content: t.content,
        input: t.input,
        reference: t.reference,
        deliverables: t.deliverables,
        others: t.others,
      })),
    };
  }
  return { source: "provider", tasks: await fetchPublishedTasks(providerUrl) };
}
