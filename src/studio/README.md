# qtcrowd 工作室（studio）

量潮众包·**参与人员端**（Flutter Web）：面向渠道 / 代理 / 实训成员的任务认领与结算工作台。

> 与 `src/site`（官网黄页，信息展示）分工：site 引流，studio 落地。参与端只写自己的本地数据，不写管理端数据。

## 功能（参与人员工作流程）

1. **任务列表**：公开数据层 published 任务（title / category / business / 状态 / 报酬），未认领显示「可认领」，点击进详情
2. **任务详情**：背景 / 内容 / 输入 / 交付物 / 报酬 / 如何报名（公开层缺失的档案段落自动隐藏）
3. **认领**：可认领任务 → 认领按钮 → **调前台写操作代理**（`POST {PROVIDER_URL}/api/tasks/{id}/claim`，
   qtcrowd-provider 转发到后台，body `partner_id`，published → accepted）→ 成功写本地认领记录（`data/my-tasks.json`）→ 展示为进行中；
   API 失败 / 非法状态**不写本地**，展示错误提示
4. **我的结算**：结算记录（金额 / 时间），本地文件 `data/my-settlements.json`
5. **底部导航**：任务 / 我的认领 / 结算

## 数据源与配置（dart-define）

| 环境变量（`--dart-define`） | 作用 | 未配置时 |
|---|---|---|
| `QTCLOUD_CROWD_PUBLIC_URL` | 公开数据层（公开桶/CDN）根 URL，任务列表读 `{url}/tasks.json`（404 回退 `public/tasks/index.json`） | 回退打包 `assets/data/tasks.json`（开发兜底，与 site 同源） |
| `QTCLOUD_CROWD_PROVIDER_URL` | 前台写操作代理（qtcrowd-provider）根 URL，认领写回 `POST {url}/api/tasks/{id}/claim`（默认指向本 provider） | 回退 `QTCLOUD_CROWD_BACKEND_API` 直连后台；再未配置 → 本地 mock（`MockClaimApi`，直接成功） |
| `QTCLOUD_CROWD_BACKEND_API` | 后台 API 根 URL（provider 未配置时的直连回退） | 本地 mock |
| `QTCLOUD_CROWD_PARTNER_ID` | 认领 body `partner_id`（参与端身份标识） | HTTP 认领时提示配置；mock 不校验 |

```bash
flutter run -d chrome \
  --dart-define=QTCLOUD_CROWD_PUBLIC_URL=https://cdn.example.com \
  --dart-define=QTCLOUD_CROWD_PROVIDER_URL=http://localhost:8080 \
  --dart-define=QTCLOUD_CROWD_PARTNER_ID=partner-01
```

## 真实数据源

- 任务数据与 site 一致：公开数据层同源；未配置 PUBLIC_URL 时回退 `assets/data/tasks.json`
  （由 `scripts/sync-tasks.mjs` 从 `../site/src/data/tasks.json` 同步，site 的数据源自父仓库 `data/profile`，见 `AGENTS.md`）。
- 认领 / 结算只写参与端本地文件（`data/my-tasks.json`、`data/my-settlements.json`），**不写管理端数据**。
- 本地数据目录可用环境变量 `QTCLOUD_CROWD_STUDIO_DATA` 覆盖（默认 `data`）。

## 结构（models / repositories / screens 三件套）

```
lib/
├── main.dart                 # 入口接线：公开数据层/认领 API 配置 + 仓储集合 + 底部导航
├── models/                   # 领域模型
│   ├── task.dart             # 任务（对齐 site tasks.json 契约）
│   ├── my_claim.dart         # 我的认领（taskName + 认领时间）
│   └── settlement.dart       # 我的结算（任务 + 金额 + 时间）
├── repositories/             # 数据访问（DDD 仓储）
│   ├── file_store.dart       # 原子 JSON 文件存储（+ QTCLOUD_CROWD_STUDIO_DATA）
│   ├── task_repository.dart  # 任务目录（公开数据层 Http / 资产 tasks.json 兜底，只读）
│   ├── claim_api.dart        # 认领写回 API（HttpClaimApi / MockClaimApi，经 provider 转发或直连后台）
│   ├── my_task_repository.dart # 我的认领（data/my-tasks.json）
│   └── settlement_repository.dart # 我的结算（data/my-settlements.json）
└── screens/                  # 页面
    ├── task_list_screen.dart     # 任务列表
    ├── task_detail_screen.dart   # 任务详情 + 认领（API 写回 + 本地记录）
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
flutter test             # 模型 / 仓储 / 屏幕基础渲染 + 认领流程（mock API 成功/失败/非法状态）全绿
flutter build web        # 构建产物在 build/web
```

设计依据：`docs/dev-guide/studio.md`（site 引流，studio 落地）与 `qtcloud-crowd` 的 dev-guide（OSS 共享数据层：前台读公开桶 + 写操作调后台 API）。
