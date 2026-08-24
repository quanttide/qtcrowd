// data/profile 任务档案解析器（sync / validate 脚本共用）。
// 档案格式（见 data/profile/qtcloud/*.md）：
//   # 任务名
//   - 业务：xxx
//   - 类别：xxx
//   - 状态：xxx
//   ## 任务背景 / 任务内容 / 任务输入 / 参考链接 / 交付物 / 报酬 / 其他
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";

/** 档案元数据键 → 任务字段 */
export const META_FIELD_MAP = {
  业务: "business",
  类别: "category",
  状态: "status",
};

/** 档案小节标题 → 任务字段 */
export const SECTION_FIELD_MAP = {
  任务背景: "background",
  任务内容: "content",
  任务输入: "input",
  参考链接: "reference",
  交付物: "deliverables",
  报酬: "reward",
  其他: "others",
};

/** 解析参考链接条目：`前缀[文字](url)` → { label, url }；无链接 → { label, url: null } */
function parseReferenceItem(text) {
  const m = text.match(/^(.*?)\[(.*?)\]\((.*?)\)$/);
  if (m) {
    return { label: `${m[1]}${m[2]}`.trim(), url: m[3].trim() };
  }
  return { label: text, url: null };
}

/**
 * 解析一个档案 markdown 文本。
 * @param {string} mdText 档案全文
 * @param {string} fileName 档案文件名（如 second-brain-init.md），任务 name 取文件名去 .md
 * @returns {object} 档案字段（title/business/category/status + 各小节数组）
 */
export function parseProfileMarkdown(mdText, fileName) {
  const name = fileName.replace(/\.md$/, "");
  const sections = Object.fromEntries(
    Object.values(SECTION_FIELD_MAP).map(field => [field, []]),
  );
  const task = { name, title: "" };
  const meta = {};
  let inMeta = true;
  let currentField = null;

  for (const raw of mdText.split(/\r?\n/)) {
    const line = raw.trim();
    if (line === "") continue;

    if (line.startsWith("# ")) {
      task.title = line.slice(2).trim();
      continue; // 元数据段在 h1 之后、首个 ## 之前，保持 inMeta
    }
    if (line.startsWith("## ")) {
      currentField = SECTION_FIELD_MAP[line.slice(3).trim()] ?? null;
      inMeta = false;
      continue;
    }
    if (inMeta) {
      const m = line.match(/^-\s*([^：:]+)[：:]\s*(.+)$/);
      if (m && META_FIELD_MAP[m[1]]) meta[META_FIELD_MAP[m[1]]] = m[2].trim();
      continue;
    }
    if (!currentField) continue;

    const item = line.replace(/^\d+\.\s*/, "").replace(/^-\s*/, "").trim();
    sections[currentField].push(item);
  }

  const result = {
    name,
    title: task.title,
    business: meta.business ?? "",
    category: meta.category ?? "",
    status: meta.status ?? "",
    ...sections,
  };
  if (result.reference.length > 0) {
    result.reference = result.reference.map(parseReferenceItem);
  }
  return result;
}

/** 读取目录下所有档案，返回按文件名排序的解析结果 */
export function parseProfileDir(profileDir) {
  return readdirSync(profileDir)
    .filter(file => file.endsWith(".md"))
    .sort()
    .map(file => parseProfileMarkdown(readFileSync(path.join(profileDir, file), "utf8"), file));
}
