#!/usr/bin/env node
// 同步任务数据：site 的 tasks.json（同一数据源，与 site 一致）→ assets/data/tasks.json。
// site 的 tasks.json 由 site/scripts/sync-tasks.mjs 从父仓库 data/profile 生成，
// studio 不直接读 data/profile，只复用 site 已同步的同一份任务清单（见 AGENTS.md）。
// 用法：node scripts/sync-tasks.mjs

import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { copyFileSync, mkdirSync, existsSync } from 'node:fs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const source = join(root, '..', 'site', 'src', 'data', 'tasks.json');
const target = join(root, 'assets', 'data', 'tasks.json');

if (!existsSync(source)) {
  console.error(`[studio] 同步失败：找不到 site 任务数据 ${source}`);
  console.error('[studio] 请确认在 qtcrowd 完整检出中运行（site 与 studio 同仓库）。');
  process.exit(1);
}

mkdirSync(dirname(target), { recursive: true });
copyFileSync(source, target);
console.log(`[studio] 已同步任务数据：${source} → ${target}`);
