import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// QTCLOUD_CROWD_PROVIDER_URL：qtcrowd-provider（前台唯一服务端）根 URL。
// - 已配置：site 任务池从数据 API 拉取（{url}/api/tasks——自己桶黄页快照，
//   published 任务：title/description/reward/apply_guide），fetch 失败页面报错不静默；
// - 未配置：本地开发默认 /mock（本仓库 mock 数据 API，见 public/mock/api/tasks.json），
//   生产构建回退打包 tasks.json（开发兜底，仅 PROVIDER_URL 未配置时使用）。
export default defineConfig(({ mode }) => {
  const providerUrl =
    process.env.QTCLOUD_CROWD_PROVIDER_URL ??
    (mode === "development" ? "/mock" : "");
  return {
    plugins: [react()],
    base: "/",
    define: {
      "import.meta.env.QTCLOUD_CROWD_PROVIDER_URL": JSON.stringify(providerUrl),
    },
  };
});
