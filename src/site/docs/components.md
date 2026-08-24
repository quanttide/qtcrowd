# 布局组件

对应代码模块：`src/components/Layout.tsx`。

## 职责

`Layout` 是全局布局容器，包裹所有页面：

- **头部** `header`：品牌「量潮众包」（链接回首页）
- **主内容** `main`：渲染子页面
- **底部** `footer`：版权行（当前硬编码 `© 2026 量潮科技`）

## 已知问题与改进

- footer 年份硬编码，会过期（见 [ROADMAP.md](../ROADMAP.md) 缺陷 #8）。
- 当前仅一个布局组件；后续如需导航，可在此扩展（见 [ROADMAP.md](../ROADMAP.md) 阶段 3）。
