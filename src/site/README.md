# 量潮众包官网（qtcrowd-site）

公网信息展示站（黄页，非交易平台）：展示量潮众包正在发的任务与参与方式，把行动引流到真实接单入口。

## 页面

- 首页 `/`：定位 + 可接任务目录（按状态分组）+ 任务来源 + 结算与竞价 + 联系
- 详情页 `/tasks/:name`：任务结构化说明 + 如何报名 + 真实接单入口

## 真实数据源

任务数据真实来源为父仓库 `quanttide-crowd` 下的 `data/profile`（见 [AGENTS.md](../AGENTS.md)），保持一致是机器保证：

```bash
npm run data:sync      # 从 data/profile 生成 src/data/tasks.json
npm run data:validate  # JSON Schema 校验 + 与 data/profile 一致性核对（已挂进 build 前置）
```

## 技术栈

- React 19 + TypeScript
- Vite 6

## 开发

```bash
npm install
npm run dev
```

## 构建

```bash
npm run build
npm run preview
```
