// 数据契约校验（schema + 与 data/profile 一致性 + 报名闭环/邮箱去重）。
//
// 用法：
//   node scripts/validate-tasks.mjs
//   QTCROWD_PROFILE_DIR=/path/to/data/profile/qtcloud node scripts/validate-tasks.mjs
//
// 校验内容：
// 1. tasks.json 满足 tasks.schema.json（最小 JSON Schema 子集校验，无第三方依赖）；
// 2. 档案字段与 data/profile 档案逐项一致（数据源在父仓库时执行；缺失则警告跳过）；
// 3. 每个任务有唯一 name，且 tasks.json 与 data/profile 档案一一对应；
// 4. applyGuide（如何报名）非空且包含真实接单入口（联系邮箱）；
// 5. 源码不硬编码联系邮箱（统一走 src/data/site.ts 常量，去重机器保证）。
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseProfileDir } from "./lib/profile.mjs";

const SCRIPTS_DIR = path.dirname(fileURLToPath(import.meta.url));
const SITE_DIR = path.resolve(SCRIPTS_DIR, "..");
const DATA_DIR = path.join(SITE_DIR, "src", "data");
const TASKS_JSON = path.join(DATA_DIR, "tasks.json");
const SCHEMA_JSON = path.join(DATA_DIR, "tasks.schema.json");
const PROFILE_BASE_DIR =
  process.env.QTCROWD_PROFILE_DIR ??
  path.resolve(SITE_DIR, "..", "..", "..", "..", "data", "profile");

const errors = [];
const warnings = [];

// ---------- 最小 JSON Schema 校验（draft-07 子集） ----------

function checkType(value, type) {
  switch (type) {
    case "string": return typeof value === "string";
    case "number": return typeof value === "number";
    case "integer": return Number.isInteger(value);
    case "boolean": return typeof value === "boolean";
    case "null": return value === null;
    case "array": return Array.isArray(value);
    case "object": return value !== null && typeof value === "object" && !Array.isArray(value);
    default: return true;
  }
}

function validateNode(value, schema, root, at) {
  const out = [];
  if (schema.$ref) {
    const def = root.$defs?.[schema.$ref.replace(/^#\/\$defs\//, "")];
    if (!def) { out.push(`${at}: 未知 $ref ${schema.$ref}`); return out; }
    return out.concat(validateNode(value, def, root, at));
  }
  if (schema.type) {
    const types = Array.isArray(schema.type) ? schema.type : [schema.type];
    if (!types.some(t => checkType(value, t))) {
      out.push(`${at}: 类型应为 ${JSON.stringify(schema.type)}，实际为 ${value === null ? "null" : typeof value}`);
      return out;
    }
  }
  if (value !== null && typeof value === "object" && !Array.isArray(value)) {
    for (const key of schema.required ?? []) {
      if (!(key in value)) out.push(`${at}: 缺少必需字段 ${key}`);
    }
    for (const [key, sub] of Object.entries(schema.properties ?? {})) {
      if (key in value) out.push(...validateNode(value[key], sub, root, `${at}.${key}`));
    }
    if (schema.additionalProperties === false) {
      for (const key of Object.keys(value)) {
        if (!(key in (schema.properties ?? {}))) out.push(`${at}: 存在未知字段 ${key}`);
      }
    }
  }
  if (Array.isArray(value) && schema.items) {
    value.forEach((item, i) => out.push(...validateNode(item, schema.items, root, `${at}[${i}]`)));
  }
  if (schema.enum && !schema.enum.includes(value)) {
    out.push(`${at}: 值 ${JSON.stringify(value)} 不在枚举 ${JSON.stringify(schema.enum)} 中`);
  }
  if (typeof value === "string" && schema.minLength != null && value.length < schema.minLength) {
    out.push(`${at}: 字符串长度 ${value.length} 小于 minLength=${schema.minLength}`);
  }
  return out;
}

function validateSchema() {
  const data = JSON.parse(readFileSync(TASKS_JSON, "utf8"));
  const schema = JSON.parse(readFileSync(SCHEMA_JSON, "utf8"));
  const errs = validateNode(data, schema, schema, "$");
  if (errs.length > 0) {
    console.error("[validate] tasks.json 未通过 tasks.schema.json 校验：");
    for (const e of errs) console.error(`  - ${e}`);
    errors.push(...errs);
  } else {
    console.log(`[validate] tasks.json 通过 schema 校验（${data.tasks.length} 个任务）`);
  }

  // 附加规则：name 唯一 + applyGuide 报名闭环
  const names = new Set();
  for (const task of data.tasks ?? []) {
    if (names.has(task.name)) {
      errors.push(`任务 name 重复：${task.name}`);
    }
    names.add(task.name);
    if (!Array.isArray(task.applyGuide) || task.applyGuide.length === 0) {
      errors.push(`任务 ${task.name} 缺少 applyGuide（如何报名步骤），请补充站点侧报名步骤`);
    }
  }
  return data;
}

// ---------- 与 data/profile 一致性 ----------

function crossCheckProfile(tasks) {
  if (!existsSync(PROFILE_BASE_DIR)) {
    warnings.push(
      `未找到 data/profile 目录（${PROFILE_BASE_DIR}），跳过与 data/profile 的一致性校验；` +
      "完整校验请在父仓库 quanttide-crowd 下运行（data/profile 为父仓库子模块）",
    );
    return;
  }
  // 扫描所有业务子目录（qtcloud、qtrecurit 等）
  const parsedByName = new Map();
  for (const entry of readdirSync(PROFILE_BASE_DIR)) {
    const subdir = path.join(PROFILE_BASE_DIR, entry);
    if (statSync(subdir).isDirectory() && !entry.startsWith(".")) {
      for (const p of parseProfileDir(subdir)) {
        parsedByName.set(p.name, p);
      }
    }
  }
  const profileFields = [
    "title", "business", "category", "status",
    "background", "content", "input", "reference",
    "deliverables", "reward", "others",
  ];

  for (const task of tasks) {
    const parsed = parsedByName.get(task.name);
    if (!parsed) {
      errors.push(`任务 ${task.name} 在 data/profile 中无对应档案（${task.name}.md）`);
      continue;
    }
    for (const field of profileFields) {
      const a = JSON.stringify(task[field]);
      const b = JSON.stringify(parsed[field]);
      if (a !== b) {
        errors.push(`任务 ${task.name} 字段 ${field} 与 data/profile 不一致：\n    tasks.json:  ${a}\n    data/profile: ${b}`);
      }
    }
  }
  for (const [name] of parsedByName) {
    if (!tasks.some(t => t.name === name)) {
      errors.push(`data/profile 档案 ${name}.md 在 tasks.json 中无对应任务`);
    }
  }
  console.log(`[validate] 与 data/profile 一致性校验完成（数据源：${PROFILE_BASE_DIR}）`);
}

// ---------- 邮箱去重（真实接单入口） ----------

function walkFiles(dir, exts, out = []) {
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) {
      walkFiles(full, exts, out);
    } else if (exts.some(ext => full.endsWith(ext))) {
      out.push(full);
    }
  }
  return out;
}

function checkEmailConsistency(tasks) {
  const siteTs = path.join(DATA_DIR, "site.ts");
  const src = readFileSync(siteTs, "utf8");
  const m = src.match(/CONTACT_EMAIL\s*=\s*"([^"]+)"/);
  if (!m) {
    errors.push("src/data/site.ts 缺少 CONTACT_EMAIL 常量");
    return;
  }
  const email = m[1];
  for (const task of tasks) {
    const guide = (task.applyGuide ?? []).join("\n");
    if (!guide.includes(email)) {
      errors.push(`任务 ${task.name} 的 applyGuide 未包含联系邮箱 ${email}（缺真实接单入口）`);
    }
  }
  const srcDir = path.join(SITE_DIR, "src");
  for (const file of walkFiles(srcDir, [".ts", ".tsx"])) {
    if (file === siteTs) continue;
    const content = readFileSync(file, "utf8");
    if (content.includes(email)) {
      errors.push(`${path.relative(SITE_DIR, file)} 硬编码了联系邮箱 ${email}，请改用 src/data/site.ts 的 CONTACT_EMAIL / CONTACT_MAILTO`);
    }
  }
  console.log(`[validate] 接单入口（${email}）一致，源码无邮箱硬编码`);
}

// ---------- 主流程 ----------

let data;
try {
  data = validateSchema();
  crossCheckProfile(data.tasks);
  checkEmailConsistency(data.tasks);
} catch (err) {
  console.error(`[validate] 校验失败：${err.message}`);
  process.exit(1);
}

for (const w of warnings) console.warn(`[validate] 警告：${w}`);
if (errors.length > 0) {
  console.error(`[validate] 校验未通过（${errors.length} 个错误）：`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}
console.log("[validate] 全部通过：数据契约合法，且与 data/profile 保持一致");
