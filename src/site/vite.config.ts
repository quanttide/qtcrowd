import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// QTCLOUD_CROWD_PUBLIC_URL：公开数据源（公开桶/CDN）根 URL。
// - 已配置：site 任务池从公开数据源拉取（{url}/tasks.json 或 public/tasks/ 列表，
//   published 任务：title/description/reward/applyGuide），fetch 失败页面报错不静默；
// - 未配置：本地开发默认 /mock（本仓库 mock 公开桶，见 public/mock/），
//   生产构建回退打包 tasks.json（开发兜底，仅 PUBLIC_URL 未配置时使用）。
export default defineConfig(({ mode }) => {
  const publicUrl =
    process.env.QTCLOUD_CROWD_PUBLIC_URL ??
    (mode === "development" ? "/mock" : "");
  return {
    plugins: [react()],
    base: "/",
    define: {
      "import.meta.env.QTCLOUD_CROWD_PUBLIC_URL": JSON.stringify(publicUrl),
    },
  };
});
