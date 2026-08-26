/// <reference types="vite/client" />

interface ImportMetaEnv {
  /**
   * qtcrowd-provider（前台唯一服务端）根 URL（vite.config.ts 注入 QTCLOUD_CROWD_PROVIDER_URL）。
   * 任务数据从 {url}/api/tasks（数据 API）拉取。未配置时为空字符串：
   * site 回退打包 tasks.json（开发兜底）。
   */
  readonly QTCLOUD_CROWD_PROVIDER_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
