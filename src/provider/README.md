# qtcrowd provider（前台写操作代理）

量潮众包前台（site / studio）的服务端：**轻量转发服务**，只做写操作转发（认领/交付）到后台
qtcloud-crowd provider；读侧不经本服务（site / studio 直接读公开桶 CDN）。

架构依据：qtcloud-crowd `docs/dev-guide/index.md`（OSS 共享数据层：前台读公开桶 + 写操作调后台 API；
前台依赖后台，后台不依赖前台）。

## 后台 API 契约（转发目标）

| 动作 | 路径 | 状态机 |
|------|------|--------|
| 认领 | `POST {BACKEND}/api/tasks/{id}/claim`（body `partner_id`） | published → accepted |
| 交付 | `POST {BACKEND}/api/tasks/{id}/deliver` | accepted → reviewing |

## 本服务路由

| 路由 | 行为 |
|------|------|
| `POST /api/tasks/{id}/claim` | 请求体原样透传（含 `partner_id`）转发到后台；后台状态码与错误体透传返回 |
| `POST /api/tasks/{id}/deliver` | 同上（交付） |
| `GET /health` | 健康检查（200） |

- **4xx/5xx 透传**：后台 404/409/400 等状态码与错误体原样返回（前台能区分「任务不存在 / 状态冲突 / 请求无效」）。
- **后台不可达**：返回 502 Bad Gateway（前台可感知后台故障）。

## 配置（环境变量）

| 变量 | 必填 | 默认 | 说明 |
|------|------|------|------|
| `QTCLOUD_CROWD_BACKEND_API` | **必填** | — | 后台 API 根 URL（未配置启动报错）。生产指向 API 网关，如 `https://api.quanttide.com/qtcloud-crowd` |
| `QTCLOUD_CROWD_ADDR` | 否 | `:8080` | 监听地址 |
| `QTCLOUD_CROWD_TENANT` | 否 | 空 | 租户上下文（预留：当前为空不加前缀；非空时后台路径加 `/api/{tenant}/…` 前缀，对齐 qtcloud-crowd 多租户扩展缝） |

## 本地开发

```bash
# 直接运行（QTCLOUD_CROWD_BACKEND_API 必填）
QTCLOUD_CROWD_BACKEND_API=http://localhost:8081 go run ./cmd/server

# 或 docker compose（provider :8080 → 后台 :8081）
QTCLOUD_CROWD_BACKEND_API=http://localhost:8081 docker compose up --build
```

## 验证

```bash
go build ./... && go vet ./... && go test ./...
```

测试覆盖：转发成功（路径/请求体/响应体透传）、后台 404/409/400 透传、后台不可达 502、健康检查、
租户前缀预留、路由保护（只暴露 health + 两个写操作）。
