// 从 data/profile 生成 src/data/tasks.json（数据源解耦的机器保证）。
//
// 用法：
//   node scripts/sync-tasks.mjs
//   QTCROWD_PROFILE_DIR=/path/to/data/profile/qtcloud node scripts/sync-tasks.mjs
//
// 规则：
// - 档案字段（title/business/category/status/background/content/input/reference/
//   deliverables/reward/others）由 data/profile 档案生成，保证与真实数据源一致；
// - 站点侧字段保留 tasks.json 现有值：
//     description —— 目录一句话；新任务无值时由档案内容推导占位，需人工润色；
//     applyGuide —— 如何报名步骤；新任务无值时留空数组，校验脚本会强制补充。
// 生成后请运行 npm run data:validate 确认通过。
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseProfileDir } from "./lib/profile.mjs";

const SCRIPTS_DIR = path.dirname(fileURLToPath(import.meta.url));
const SITE_DIR = path.resolve(SCRIPTS_DIR, "..");
const TASKS_JSON = path.join(SITE_DIR, "src", "data", "tasks.json");
// 默认在父仓库 quanttide-crowd 布局下定位 data/profile（qtcrowd 为父仓库子模块）
const PROFILE_DIR =
  process.env.QTCROWD_PROFILE_DIR ??
  path.resolve(SITE_DIR, "..", "..", "..", "..", "data", "profile", "qtcloud");

if (!existsSync(PROFILE_DIR)) {
  console.error(`[sync] 未找到 data/profile 目录：${PROFILE_DIR}`);
  console.error("[sync] 请在父仓库 quanttide-crowd 下运行（data/profile 为父仓库子模块），或用 QTCROWD_PROFILE_DIR 指定目录。");
  process.exit(1);
}

/** 新任务 description 占位：由档案内容推导，需人工润色 */
function fallbackDescription(parsed) {
  const first = parsed.content?.[0];
  return first ? `${parsed.title}：${first}` : `「${parsed.title}」详见任务档案。`;
}

// 读取现有 tasks.json，保留站点侧字段
const existing = new Map();
if (existsSync(TASKS_JSON)) {
  const data = JSON.parse(readFileSync(TASKS_JSON, "utf8"));
  for (const task of data.tasks ?? []) existing.set(task.name, task);
}

const tasks = parseProfileDir(PROFILE_DIR).map(parsed => {
  const prev = existing.get(parsed.name);
  return {
    name: parsed.name,
    title: parsed.title,
    description: prev?.description ?? fallbackDescription(parsed),
    business: parsed.business,
    category: parsed.category,
    status: parsed.status,
    background: parsed.background,
    content: parsed.content,
    input: parsed.input,
    reference: parsed.reference,
    deliverables: parsed.deliverables,
    reward: parsed.reward,
    others: parsed.others,
    applyGuide: prev?.applyGuide ?? [],
  };
});

writeFileSync(TASKS_JSON, `${JSON.stringify({ tasks }, null, 2)}\n`);
console.log(`[sync] 已生成 ${TASKS_JSON}（${tasks.length} 个任务，数据源：${PROFILE_DIR}）`);
