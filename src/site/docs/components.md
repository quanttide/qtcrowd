# 布局组件

对应代码模块：`src/components/Layout.tsx`。

## 职责

`Layout` 是全局布局容器，包裹所有页面：

- 头部 `header`：品牌「量潮众包」（链接回首页）
- 主内容 `main`：渲染子页面
- 底部 `footer`：版权行，年份动态取 `new Date().getFullYear()`

## 说明

- 当前仅一个布局组件；后续如需导航，可在此扩展（见 [ROADMAP.md](../ROADMAP.md)）。
