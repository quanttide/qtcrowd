# qtcrowd provider 实现方案（前台唯一服务端）

> 面向：人（开发者/维护者阅读）——说明这个服务是什么、为什么存在、怎么运行。
> 实现细节以代码与测试为准。

## 一句话

**qtcrowd provider 是众包前台唯一服务端——上架（拉后台 published 任务写自己桶）+ 数据 API（site/studio 读）+ 写操作转发（认领/交付到后台）。**

## 为什么需要它（不直接连后台 / 不直读公开桶的理由）

众包系统有两层：**后台**（众包管理云——审核/认证/结算，内部数据）和**前台**（量潮众包——参与人员使用）。

定稿架构：**前台唯一服务端**——site/studio 只认 qtcrowd-provider：

- 前台要暴露后台地址——相当于把金库的钥匙放在大厅——不安全；数据也改经 provider 中转（不再直读 OSS/CDN）
- 后台要面对所有前台的直接请求——无法区分"哪个市场来的"——多租户时无从隔离
- 前台侧该做的检查（这个任务还能认领吗）没地方做——全压给后台

**门卫的价值**：前台只认门卫（qtcrowd provider），门卫负责上架（把后台可上架任务搬到自己的桶）、
提供数据（site/studio 从门卫的数据 API 拉任务）、转交写操作（认领/交付给后台）——
后台不知道也不关心前台是谁（依赖方向：前台可以依赖后台，反之不行）。

## 它做什么

| 操作 | 说明 |
|------|------|
| **上架** | 拉取后台 published 任务（`GET {BACKEND}/api/tasks?status=published`）→ 写自己桶 qtcrowd-provider（`public/tasks/{id}.json` 黄页快照：title/description/reward/apply_guide）；认领/关闭的任务下次同步清理 |
| **数据 API** | `GET /api/tasks` 从自己桶读黄页快照返回（site/studio 不再直读 OSS/CDN） |
| **认领任务** | `POST /api/tasks/{id}/claim`——参与人员认领任务（带执行方身份 partner_id）→ 转交后台 → 任务从"可接"变"进行中" |
| **交付任务** | `POST /api/tasks/{id}/deliver`——执行方提交交付 → 转交后台 → 任务进入验收 |
| **健康检查** | `GET /health`——确认门卫还活着 |

**转交规则**：后台怎么说，前台就怎么听到——后台返回"任务不存在"(404)、"状态已变化"(409)、
"参数不对"(400)，原样转达；后台不可达时告诉前台"暂时联系不上"(502)——前台能区分情况，
给用户正确的提示。**上架失败不静默**：后台不可达/非 2xx，上架报错（502），不做半桶状态。

**不做的事**：不做审核/结算（那是后台的事）——它只负责上架 + 数据 + 转交写操作。

## 怎么运行

```bash
# 环境变量
QTCLOUD_CROWD_ADDR            # 本服务监听地址（默认 :8080）
QTCLOUD_CROWD_BACKEND_API     # 后台地址（必填——没有它门卫不知道找谁）
QTCLOUD_CROWD_TENANT          # 租户标识（预留——将来多市场时区分"哪个市场"）
QTCLOUD_CROWD_STORE           # 存储后端：local（开发）/ oss（生产，自己桶 qtcrowd-provider）
QTCLOUD_OSS_*                 # OSS 配置（oss 模式：endpoint/bucket/ak/sk，bucket=自己桶）
QTCLOUD_CROWD_SYNC_INTERVAL   # 周期上架间隔（默认 5m；0/无效 = 仅启动时上架一次）

# 本地启动
go run ./cmd/server
```

- 后台地址没配 → 启动即报错（门卫不设岗就开门是事故）
- 周期上架：启动后立即同步一次，之后每 interval 同步；也可手动 `POST /api/admin/sync`
- Docker：`docker compose up`（provider + 后台一起起）

## 部署

- Docker 镜像（多阶段构建——镜像小、启动快）
- 生产用 `QTCLOUD_CROWD_STORE=oss` + 自己桶 qtcrowd-provider（已建）
- 部署方式对齐量潮惯例（FC 3.0 / 容器）——按需接入部署流水线

## 未来（多租户预留）

将来如果出现多个众包市场（多个前台）：

- 每个市场 = 自己的 qtcrowd provider（门卫跟市场走）
- 门卫转交/上架时带上自己的租户标识（`QTCLOUD_CROWD_TENANT`）——后台按标识隔离数据
- 现在不做多租户逻辑（验证先行），但结构已留好位置
