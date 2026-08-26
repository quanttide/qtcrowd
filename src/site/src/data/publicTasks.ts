// 公开数据源（公开桶/CDN）任务池：published 任务（title/description/reward/applyGuide）。
//
// 配置 QTCLOUD_CROWD_PUBLIC_URL（公开桶/CDN 根 URL）后，site 从公开数据源拉取任务池：
//   1) {url}/tasks.json          —— 聚合列表（后台发布时维护，推荐形态）
//   2) {url}/public/tasks/index.json —— public/tasks/ 列表（回退形态，对应单文件 {id}.json）
// fetch 失败不静默：抛错由页面展示错误提示。
// 仅 PUBLIC_URL 未配置时回退打包 tasks.json（开发兜底，见 AGENTS.md 真实数据源约定）。

import { tasks as assetTasks, type Task, type TaskStatus } from "./tasks";

/** 公开任务（published 黄页视图）：title/description/reward/applyGuide 为公开字段，
 * 其余档案字段公开桶可能不携带（可选，按需条件渲染）。 */
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
  /** 业务（可选，公开桶可能携带） */
  business?: string;
  /** 类别（可选） */
  category?: string;
  /** 状态（可选；公开层均为 published，无此字段时视为可接） */
  status?: TaskStatus;
  /** 截止日期（可选） */
  deadline?: string;
  // 以下档案字段仅 tasks.json 兜底 / 公开桶全量发布时存在
  background?: string[];
  content?: string[];
  input?: string[];
  reference?: Task["reference"];
  deliverables?: string[];
  others?: string[];
}

/** 公开数据源根 URL（vite.config.ts 注入；未配置时为空字符串 → 回退 tasks.json）。 */
export function getPublicUrl(): string {
  return import.meta.env.QTCLOUD_CROWD_PUBLIC_URL ?? "";
}

function asStringArray(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.filter((v): v is string => typeof v === "string");
  return [];
}

/** 公开任务对象解析（单任务对象：public/tasks/{id}.json 或聚合列表项）。 */
export function parsePublishedTask(json: Record<string, unknown>): PublishedTask {
  const id = (json.id as string) ?? (json.name as string) ?? "";
  return {
    id,
    title: (json.title as string) ?? "",
    description: (json.description as string) ?? "",
    reward: asStringArray(json.reward),
    applyGuide: asStringArray(json.applyGuide),
    business: json.business as string | undefined,
    category: json.category as string | undefined,
    status: json.status as TaskStatus | undefined,
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

/** 公开任务列表解析（兼容 {tasks: [...]} 聚合与裸数组两种形态）。 */
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

/** 从公开数据源拉取任务池：先试聚合 tasks.json，404/失败回退 public/tasks/index.json；
 * 全部失败抛错（不静默，由页面展示错误提示）。 */
export async function fetchPublishedTasks(
  publicUrl: string,
): Promise<PublishedTask[]> {
  const base = publicUrl.replace(/\/+$/, "");
  const candidates = [`${base}/tasks.json`, `${base}/public/tasks/index.json`];
  let lastError: unknown = new Error("公开数据源不可用");

  for (const url of candidates) {
    try {
      const res = await fetch(url);
      if (!res.ok) {
        lastError = new Error(`公开数据源 ${url} 返回 HTTP ${res.status}`);
        continue;
      }
      return parsePublishedTasks(await res.json());
    } catch (e) {
      lastError = e;
    }
  }
  throw lastError;
}

/** 任务目录加载：PUBLIC_URL 未配置 → 打包 tasks.json 兜底（source=asset）；
 * 已配置 → 公开数据源拉取（source=public），fetch 失败抛错不静默。 */
export async function loadTaskCatalog(
  publicUrl: string = getPublicUrl(),
): Promise<{ source: "public" | "asset"; tasks: PublishedTask[] }> {
  if (!publicUrl) {
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
  return { source: "public", tasks: await fetchPublishedTasks(publicUrl) };
}
