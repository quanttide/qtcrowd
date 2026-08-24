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
| 首页 | `.hero`、`.section`、`.task-grid` / `.task-card`（任务卡片网格，点击进详情）、`.status-tag`（可接性标签） |
| 详情 | `.back-link`、`.detail-meta` |
| 联系 | `.contact-item` / `.contact-label` / `.contact-note` |

## 说明

- 现有 `entry-grid` / `entry-card` / `principle-*` / `service-item` / `task-group` / `settlement-*` 等样式块为重构后不再使用的历史样式，可随后续清理。
- 响应式：`.task-grid` 在 ≤600px 收为单列。
