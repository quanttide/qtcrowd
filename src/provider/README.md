# qtcrowd provider（前台唯一服务端）

量潮众包前台（site / studio）的**唯一服务端**——上架 + 数据 API + 写操作转发：

1. **上架**：从后台 qtcloud-crowd provider 拉取可上架任务（`GET {BACKEND}/api/tasks?status=published`），
   写入自己桶 qtcrowd-provider 的黄页快照（`public/tasks/{id}.json`：title/description/reward/apply_guide）；
   被认领/关闭的任务由下次同步清理（撤回语义）。
2. **数据 API**：`GET /api/tasks` 从自己桶读黄页快照返回（site/studio 不再直读 OSS/CDN）。
3. **写操作转发保留**：认领/交付转发到后台 qtcloud-crowd provider。

架构依据：qtcloud-crowd `docs/dev-guide/index.md`（前台依赖后台，后台不依赖前台；
前台是唯一服务端——上架/数据/转发，后台只存私有数据 + 提供 API）。

## 后台 API 契约（转发目标 / 上架数据源）

| 动作 | 路径 | 状态机 |
|------|------|--------|
| 上架拉取 | `GET {BACKEND}/api/tasks?status=published` | 可上架任务列表（published） |
| 认领 | `POST {BACKEND}/api/tasks/{id}/claim`（body `partner_id`） | published → accepted |
| 交付 | `POST {BACKEND}/api/tasks/{id}/deliver` | accepted → reviewing |

## 本服务路由

| 路由 | 行为 |
|------|------|
| `GET /api/tasks` | 数据 API：从自己桶读黄页快照，返回 `{tasks: [...]}`（site/studio 拉取） |
| `POST /api/admin/sync` | 手动触发上架：拉取后台 published → 写自己桶 → 清理过期快照（返回 `{published, removed}`） |
| `POST /api/tasks/{id}/claim` | 请求体原样透传（含 `partner_id`）转发到后台；后台状态码与错误体透传返回 |
| `POST /api/tasks/{id}/deliver` | 同上（交付） |
| `GET /health` | 健康检查（200） |

- **4xx/5xx 透传**：后台 404/409/400 等状态码与错误体原样返回（前台能区分「任务不存在 / 状态冲突 / 请求无效」）。
- **后台不可达**：返回 502 Bad Gateway（前台可感知后台故障）。
- **周期上架**：启动后立即同步一次，之后每 `QTCLOUD_CROWD_SYNC_INTERVAL`（默认 5m）同步；
  手动触发 `POST /api/admin/sync`。

## 配置（环境变量）

| 变量 | 必填 | 默认 | 说明 |
|------|------|------|------|
| `QTCLOUD_CROWD_BACKEND_API` | **必填** | — | 后台 API 根 URL（未配置启动报错）。生产指向 API 网关，如 `https://api.quanttide.com/qtcloud-crowd` |
| `QTCLOUD_CROWD_ADDR` | 否 | `:8080` | 监听地址 |
| `QTCLOUD_CROWD_TENANT` | 否 | 空 | 租户上下文（预留：当前为空不加前缀；非空时后台路径加 `/api/{tenant}/…` 前缀，对齐 qtcloud-crowd 多租户扩展缝） |
| `QTCLOUD_CROWD_STORE` | 否 | `local` | 存储后端：`local`（开发）/ `oss`（生产——自己桶 qtcrowd-provider） |
| `QTCLOUD_CROWD_DATA_DIR` | 否 | `data` | 本地存储数据根目录（local 模式） |
| `QTCLOUD_OSS_ENDPOINT` / `QTCLOUD_OSS_BUCKET` / `QTCLOUD_OSS_ACCESS_KEY_ID` / `QTCLOUD_OSS_ACCESS_KEY_SECRET` | oss 模式必填 | — | 阿里云 OSS 配置（`QTCLOUD_OSS_BUCKET` = 自己桶 qtcrowd-provider，已建） |
| `QTCLOUD_CROWD_SYNC_INTERVAL` | 否 | `5m` | 周期上架间隔；`0` 或无效值 = 仅启动时上架一次 |

## 本地开发

```bash
# 直接运行（QTCLOUD_CROWD_BACKEND_API 必填；默认 local 存储写 ./data）
QTCLOUD_CROWD_BACKEND_API=http://localhost:8081 go run ./cmd/server

# 或 docker compose（provider :8080 → 后台 :8081）
QTCLOUD_CROWD_BACKEND_API=http://localhost:8081 docker compose up --build
```

## 验证

```bash
go build ./... && go vet ./... && go test ./...
```

测试覆盖：上架（mock 后台 API——拉取 published 任务 + 写自己桶黄页快照 + 过期快照清理）、
数据 API（读桶返回 `{tasks: [...]}`）、手动上架端点（成功/后台不可达 502）、
转发保留（路径/请求体/响应体透传）、后台 404/409/400 透传、后台不可达 502、健康检查、
租户前缀预留、路由保护（只暴露 health + 数据 API + 上架 + 两个写操作）。
