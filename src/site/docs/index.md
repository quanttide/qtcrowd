# 量潮众包官网（qtcrowd-site）· 文档

公网信息/招募站（黄页，非交易平台），展示量潮众包正在发的任务与参与方式。

## 定位

- **只做信息展示**：非交易平台，把行动引流到真实接单入口。
- **真实数据源**：父仓库 `quanttide-crowd` 下的 `data/profile`（见 `AGENTS.md`）；站点任务数据与 `data/profile` 保持一致，不自创占位/示例数据。
- **当前任务**：第二大脑创建插件（业务：量潮云，类别：招聘考核，报酬 1000 元代金券）。

## 风格约束

- 克制 / 文字优先 / 留白
- 颜色仅黑、白、灰；无动画、无渐变、无卡片阴影
- 细节见 [styling.md](styling.md)

## 文档模块 ↔ 代码模块对应

| 文档 | 对应代码模块 | 说明 |
|------|-------------|------|
| [architecture.md](architecture.md) | `src/main.tsx`、`src/App.tsx` | 应用入口与路由 |
| [data.md](data.md) | `src/data/tasks.ts` | 数据模型与真实数据源 |
| [components.md](components.md) | `src/components/Layout.tsx` | 布局组件 |
| [pages.md](pages.md) | `src/pages/Home.tsx`、`src/pages/TaskDetail.tsx` | 页面 |
| [styling.md](styling.md) | `src/index.css` | 样式 |

## 演进

- 已知设计缺陷与改进计划见 [ROADMAP.md](../ROADMAP.md)。
- 变更记录见 [CHANGELOG.md](../CHANGELOG.md)。
