# 样式

对应代码模块：`src/index.css`。

## 设计原则

- **克制 / 文字优先 / 留白**
- **颜色仅黑、白、灰**；无动画、无渐变、无卡片阴影
- 字体：`system-ui`，正文 16px，行高 1.8

## 主要样式块

| 样式块 | 说明 |
|--------|------|
| 全局 | `:root` 变量、`body`、`#root` 容器（max-width 720px 居中） |
| 布局 | `.layout` / `.header` / `.main` / `.footer` |
| 首页 | `.hero`、`.section`、`.entry-*`、`.service-item`（可点击目录项） |
| 详情 | `.back-link`、`.detail-meta` |
| 联系 | `.contact-item` / `.contact-label` / `.contact-note` |

## 说明

- 现有 `entry-grid` / `entry-card` / `principle-*` 等样式块为历史遗留，当前页面未使用（可随重构清理）。
- 响应式：`.entry-grid` 在 ≤600px 收为单列。
