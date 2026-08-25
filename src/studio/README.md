# qtcrowd 工作室（studio）

量潮众包·**参与人员端**（Flutter Web）：面向渠道 / 代理 / 实训成员的任务认领与结算工作台。

> 与 `src/site`（官网黄页，信息展示）分工：site 引流，studio 落地。参与端只写自己的本地数据，不写管理端数据。

## 功能（参与人员工作流程）

1. **任务列表**：真实任务（title / category / business / 状态 / 报酬），点击进详情
2. **任务详情**：背景 / 内容 / 输入 / 交付物 / 报酬 / 如何报名
3. **认领**：待认领任务 → 认领按钮 → 本地记录我的认领（`data/my-tasks.json`）→ 展示为进行中
4. **我的结算**：结算记录（金额 / 时间），本地文件 `data/my-settlements.json`
5. **底部导航**：任务 / 我的认领 / 结算

## 真实数据源

- 任务数据与 site 一致：由 `scripts/sync-tasks.mjs` 从 `../site/src/data/tasks.json` 同步到 `assets/data/tasks.json`（site 的数据源自父仓库 `data/profile`，见 `AGENTS.md`）。
- 认领 / 结算只写参与端本地文件（`data/my-tasks.json`、`data/my-settlements.json`），**不写管理端数据**。
- 本地数据目录可用环境变量 `QTCLOUD_CROWD_STUDIO_DATA` 覆盖（默认 `data`）。

## 结构（models / repositories / screens 三件套）

```
lib/
├── main.dart                 # 入口接线：仓储集合 + 底部导航
├── models/                   # 领域模型
│   ├── task.dart             # 任务（对齐 site tasks.json 契约）
│   ├── my_claim.dart         # 我的认领（taskName + 认领时间）
│   └── settlement.dart       # 我的结算（任务 + 金额 + 时间）
├── repositories/             # 数据访问（DDD 仓储）
│   ├── file_store.dart       # 原子 JSON 文件存储（+ QTCLOUD_CROWD_STUDIO_DATA）
│   ├── task_repository.dart  # 任务目录（资产 tasks.json，只读）
│   ├── my_task_repository.dart # 我的认领（data/my-tasks.json）
│   └── settlement_repository.dart # 我的结算（data/my-settlements.json）
└── screens/                  # 页面
    ├── task_list_screen.dart     # 任务列表
    ├── task_detail_screen.dart   # 任务详情 + 认领
    ├── my_tasks_screen.dart      # 我的认领
    └── settlement_screen.dart    # 我的结算
```

## 数据同步与校验

```bash
node scripts/sync-tasks.mjs     # site tasks.json → assets/data/tasks.json
node scripts/validate-tasks.mjs # 校验 studio 与 site 数据一致（不允许漂移 / 占位数据）
```

## 开发 / 测试 / 构建

```bash
flutter pub get
flutter analyze          # 全绿
flutter test             # 模型 / 仓储 / 屏幕基础渲染全绿
flutter build web        # 构建产物在 build/web
```

设计依据：`docs/dev-guide/studio.md`（site 引流，studio 落地）。
