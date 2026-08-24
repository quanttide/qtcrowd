# 量潮众包官网（qtcrowd-site）· 文档

公网信息展示站（黄页，非交易平台），展示量潮众包正在发的任务与参与方式，把行动引流到真实接单入口。

## 定位

- 只做信息展示：非交易平台，不承载发单 / 接单 / 结算交易。
- 真实数据源：父仓库 `quanttide-crowd` 下的 `data/profile`（见 `AGENTS.md`）；站点任务数据由脚本从 `data/profile` 生成并经校验保持一致，不自创占位 / 示例数据。
- 当前任务：第二大脑创建插件（业务：量潮云，类别：招聘考核，状态：待认领，报酬 1000 元代金券）。

## 页面

- 首页 `/`：定位 + 可接任务目录（按状态分组）+ 任务来源 + 结算与竞价 + 联系
- 详情页 `/tasks/:name`：任务结构化说明（背景 / 内容 / 输入 / 参考 / 交付物 / 报酬 / 其他）+ 如何报名与真实接单入口

## 风格约束

- 克制 / 文字优先 / 留白
- 颜色仅黑、白、灰；无动画、无渐变、无卡片阴影
- 细节见 [styling.md](styling.md)

## 文档模块 ↔ 代码模块对应

- [architecture.md](architecture.md)：`src/main.tsx`、`src/App.tsx`（入口与路由）
- [data.md](data.md)：`src/data/`（tasks.json + schema + tasks.ts + site.ts）与 `scripts/`（同步 / 校验）
- [components.md](components.md)：`src/components/Layout.tsx`
- [pages.md](pages.md)：`src/pages/Home.tsx`、`src/pages/TaskDetail.tsx`
- [styling.md](styling.md)：`src/index.css`

## 演进

- 已知设计缺陷与改进计划见 [ROADMAP.md](../ROADMAP.md)。
- 变更记录见 [CHANGELOG.md](../CHANGELOG.md)。
