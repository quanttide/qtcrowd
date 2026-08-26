// 任务目录异步加载 hook：qtcrowd-provider 数据 API（PROVIDER_URL 配置时）→
// 打包 tasks.json 兜底（未配置时）。fetch 失败不静默：error 态由页面展示错误提示（含重试）。

import { useCallback, useEffect, useState } from "react";
import { loadTaskCatalog, type PublishedTask } from "../data/publicTasks";

export type CatalogState =
  | { status: "loading" }
  | { status: "ready"; source: "provider" | "asset"; tasks: PublishedTask[] }
  | { status: "error"; message: string };

export function useTaskCatalog() {
  const [state, setState] = useState<CatalogState>({ status: "loading" });

  const reload = useCallback(async () => {
    setState({ status: "loading" });
    try {
      const { source, tasks } = await loadTaskCatalog();
      setState({ status: "ready", source, tasks });
    } catch (e) {
      setState({
        status: "error",
        message: e instanceof Error ? e.message : String(e),
      });
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { state, reload };
}
