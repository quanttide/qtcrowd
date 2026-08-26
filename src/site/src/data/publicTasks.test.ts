// 公开数据源（PUBLIC_URL 配置）与 tasks.json 兜底（未配置）的数据源切换测试。
// mock global fetch：成功 / HTTP 404 回退 / 网络失败三种路径。

import { describe, expect, it, vi, afterEach } from "vitest";
import {
  fetchPublishedTasks,
  loadTaskCatalog,
  parsePublishedTasks,
} from "./publicTasks";

const MOCK_PUBLIC_TASKS = {
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
  it("PUBLIC_URL 未配置 → 回退打包 tasks.json（asset 兜底）", async () => {
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

  it("PUBLIC_URL 已配置且 fetch 成功 → 从公开数据源拉取（public）", async () => {
    const spy = vi.fn().mockResolvedValue(jsonResponse(MOCK_PUBLIC_TASKS));
    vi.stubGlobal("fetch", spy);

    const result = await loadTaskCatalog("https://cdn.example.com");
    expect(result.source).toBe("public");
    expect(result.tasks).toHaveLength(1);
    expect(result.tasks[0]).toMatchObject({
      id: "t1",
      title: "任务一",
      reward: ["100 元现金"],
      applyGuide: ["发邮件报名"],
    });
    // 先试聚合 tasks.json
    expect(spy).toHaveBeenCalledWith("https://cdn.example.com/tasks.json");
  });

  it("聚合 tasks.json 404 → 回退 public/tasks/index.json", async () => {
    const spy = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({}, 404))
      .mockResolvedValueOnce(jsonResponse(MOCK_PUBLIC_TASKS));
    vi.stubGlobal("fetch", spy);

    const result = await fetchPublishedTasks("https://cdn.example.com");
    expect(result).toHaveLength(1);
    expect(spy).toHaveBeenNthCalledWith(1, "https://cdn.example.com/tasks.json");
    expect(spy).toHaveBeenNthCalledWith(2, "https://cdn.example.com/public/tasks/index.json");
  });

  it("fetch 失败（网络错误）→ 抛错不静默", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("NetworkError")));

    await expect(fetchPublishedTasks("https://cdn.example.com")).rejects.toThrow(
      "NetworkError",
    );
  });

  it("所有候选 URL 均非 2xx → 抛错不静默", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse({}, 500)));

    await expect(fetchPublishedTasks("https://cdn.example.com")).rejects.toThrow(
      /HTTP 500/,
    );
  });
});

describe("parsePublishedTasks", () => {
  it("解析聚合 {tasks: [...]} 形态", () => {
    const tasks = parsePublishedTasks(MOCK_PUBLIC_TASKS);
    expect(tasks).toHaveLength(1);
    expect(tasks[0].id).toBe("t1");
  });

  it("解析裸数组形态（public/tasks/ 列表）", () => {
    const tasks = parsePublishedTasks(MOCK_PUBLIC_TASKS.tasks);
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
