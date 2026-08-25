#!/usr/bin/env node
// 校验 studio 任务数据与 site 一致：assets/data/tasks.json 必须等于 site 的 tasks.json。
// studio 展示的必须是 site 同一份任务清单（真实数据源 data/profile，见 AGENTS.md），
// 不允许漂移或自创占位数据。
// 用法：node scripts/validate-tasks.mjs

import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { readFileSync, existsSync } from 'node:fs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const source = join(root, '..', 'site', 'src', 'data', 'tasks.json');
const target = join(root, 'assets', 'data', 'tasks.json');

if (!existsSync(target)) {
  console.error(`[studio] 校验失败：缺少 ${target}，请先运行 node scripts/sync-tasks.mjs`);
  process.exit(1);
}

const site = JSON.parse(readFileSync(source, 'utf8'));
const studio = JSON.parse(readFileSync(target, 'utf8'));

if (JSON.stringify(site) !== JSON.stringify(studio)) {
  console.error('[studio] 校验失败：assets/data/tasks.json 与 site 的 tasks.json 不一致');
  console.error('[studio] 请运行 node scripts/sync-tasks.mjs 重新同步。');
  process.exit(1);
}

const count = studio.tasks?.length ?? 0;
console.log(`[studio] 校验通过：与 site 任务数据一致（共 ${count} 个任务）。`);
