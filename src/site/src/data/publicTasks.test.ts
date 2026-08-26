// 任务数据源（qtcrowd-provider 数据 API：PROVIDER_URL 配置）与 tasks.json 兜底（未配置）
// 的数据源切换测试。mock global fetch：成功 / HTTP 404 / 网络失败三种路径。
// 另覆盖黄页快照解析（apply_guide / reward 字符串 / status=published → 可接）。

import { describe, expect, it, vi, afterEach } from "vitest";
import {
  fetchPublishedTasks,
  loadTaskCatalog,
  parsePublishedTask,
  parsePublishedTasks,
} from "./publicTasks";

const MOCK_PROVIDER_TASKS = {
  tasks: [
    {
      id: "t1",
      title: "任务一",
      description: "描述一",
      reward: ["100 元现金"],
      applyGuide: ["发邮件报名"],
    },
  ],
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("loadTaskCatalog 数据源切换", () => {
  it("PROVIDER_URL 未配置 → 回退打包 tasks.json（asset 兜底）", async () => {
    const spy = vi.fn();
    vi.stubGlobal("fetch", spy);

    const result = await loadTaskCatalog("");
    expect(result.source).toBe("asset");
    expect(result.tasks.length).toBeGreaterThan(0);
    // 兜底数据保留完整档案字段（含 id=name）
    const first = result.tasks[0];
    expect(first.id).toBeTruthy();
    expect(first.reward.length).toBeGreaterThan(0);
    expect(first.applyGuide.length).toBeGreaterThan(0);
    expect(spy).not.toHaveBeenCalled();
  });

  it("PROVIDER_URL 已配置且 fetch 成功 → 从 qtcrowd-provider 数据 API 拉取（provider）", async () => {
    const spy = vi.fn().mockResolvedValue(jsonResponse(MOCK_PROVIDER_TASKS));
    vi.stubGlobal("fetch", spy);

    const result = await loadTaskCatalog("https://provider.example.com");
    expect(result.source).toBe("provider");
    expect(result.tasks).toHaveLength(1);
    expect(result.tasks[0]).toMatchObject({
      id: "t1",
      title: "任务一",
      reward: ["100 元现金"],
      applyGuide: ["发邮件报名"],
    });
    // 数据 API 契约：fetch {PROVIDER}/api/tasks（不再 fetch 公开桶）
    expect(spy).toHaveBeenCalledWith("https://provider.example.com/api/tasks");
  });

  it("fetch 失败（网络错误）→ 抛错不静默", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("NetworkError")));

    await expect(fetchPublishedTasks("https://provider.example.com")).rejects.toThrow(
      /任务数据源不可用/,
    );
  });

  it("数据 API 非 2xx → 抛错不静默", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse({}, 500)));

    await expect(fetchPublishedTasks("https://provider.example.com")).rejects.toThrow(
      /HTTP 500/,
    );
  });
});

describe("parsePublishedTasks", () => {
  it("解析聚合 {tasks: [...]} 形态（数据 API 契约）", () => {
    const tasks = parsePublishedTasks(MOCK_PROVIDER_TASKS);
    expect(tasks).toHaveLength(1);
    expect(tasks[0].id).toBe("t1");
  });

  it("解析裸数组形态", () => {
    const tasks = parsePublishedTasks(MOCK_PROVIDER_TASKS.tasks);
    expect(tasks).toHaveLength(1);
  });

  it("reward 兼容字符串与数组两种形态", () => {
    const [task] = parsePublishedTasks({
      tasks: [{ id: "t1", title: "t", description: "d", reward: "100 元", applyGuide: [] }],
    });
    expect(task.reward).toEqual(["100 元"]);
  });

  it("非任务结构 → 空列表", () => {
    expect(parsePublishedTasks({ foo: "bar" })).toEqual([]);
    expect(parsePublishedTasks(null)).toEqual([]);
  });
});

describe("parsePublishedTask 黄页快照解析（qtcrowd-provider 自己桶快照形态）", () => {
  it("apply_guide（snake_case）与字符串 reward 兼容解析", () => {
    const task = parsePublishedTask({
      id: "t1",
      title: "任务一",
      description: "描述一",
      reward: "100 元",
      apply_guide: "发邮件报名",
      status: "published",
    });
    expect(task.id).toBe("t1");
    expect(task.reward).toEqual(["100 元"]);
    expect(task.applyGuide).toEqual(["发邮件报名"]);
  });

  it("status=published 视为可接（映射为 undefined，不显示状态标签）", () => {
    const task = parsePublishedTask({
      id: "t1",
      title: "任务一",
      description: "描述一",
      reward: "100 元",
      apply_guide: "发邮件报名",
      status: "published",
    });
    expect(task.status).toBeUndefined();
  });

  it("档案形态 status（中文标签）保留", () => {
    const task = parsePublishedTask({
      id: "t1",
      title: "任务一",
      description: "描述一",
      reward: [],
      applyGuide: [],
      status: "待认领",
    });
    expect(task.status).toBe("待认领");
  });

  it("缺 id 时回退 name（tasks.json 兜底形态）", () => {
    const task = parsePublishedTask({
      name: "t1",
      title: "任务一",
      description: "描述一",
      reward: [],
      applyGuide: [],
    });
    expect(task.id).toBe("t1");
  });
});
