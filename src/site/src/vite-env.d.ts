/// <reference types="vite/client" />

interface ImportMetaEnv {
  /**
   * 公开数据源（公开桶/CDN）根 URL（vite.config.ts 注入 QTCLOUD_CROWD_PUBLIC_URL）。
   * 未配置时为空字符串：site 回退打包 tasks.json（开发兜底）。
   */
  readonly QTCLOUD_CROWD_PUBLIC_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
