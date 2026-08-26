# qtcrowd 基础设施（Terraform）

管理量潮众包（qtcrowd）的云上基础设施，对齐 qtcloud-crowd / qtcloud-execute 已跑通的部署模式
（FC 3.0 + Terraform + ACR）：

- **site**（React+Vite 官网，`crowd.quanttide.com`）：OSS 静态网站桶 `qtcrowd-site` + CDN + DNS
- **provider**（qtcrowd-provider，前台唯一服务端）：FC 3.0 容器，承载 `src/provider`
  （上架 + 数据 API + 写操作转发）

## 一、site（React+Vite 官网）

- **site OSS 桶** `qtcrowd-site`：静态网站托管（`index.html` 根默认页），CDN 回源
- **CDN 域名** `crowd.quanttide.com`：web 加速，私有回源鉴权 + SPA 回退 + 强制 HTTPS
- **DNS**：CNAME 接入（云解析，`crowd.quanttide.com` → CDN）

## 二、provider（FC 3.0 容器，qtcrowd-provider）

- **FC 函数** `qtcrowd-prod`：custom-container，承载 `src/provider`（上架 + 数据 API + 写操作转发）
- **自有 OSS 桶** `qtcrowd-provider`（**已建，手动——terraform 不建桶**）：黄页快照
  `public/tasks/{id}.json`（`QTCLOUD_CROWD_STORE=oss`；见 `fc.tf` 的 `environment_variables`）
- **HTTP 触发器**：`https://<fc-fn>.<region>.fcapp.run`（直连入口，后续可上系统级 API 网关）
- **环境变量**（`fc.tf`）：
  - `QTCLOUD_CROWD_BACKEND_API`：后台 API 根 URL（必填——上架拉取 + 认领/交付转发目标，生产指向
    qtcloud-crowd API 网关 `https://api.quanttide.com/qtcloud-crowd`）
  - `QTCLOUD_OSS_BUCKET`：自己桶 `qtcrowd-provider`（只引用）
  - `QTCLOUD_CROWD_STORE=oss`、`QTCLOUD_CROWD_SYNC_INTERVAL`（周期上架间隔，默认 5m）
  - `QTCLOUD_OSS_*`（代码实际读取，对齐 qtcloud-crowd）+ `ALIYUN_OSS_*`（对齐 qtcloud-execute 惯例双写）

> 数据流：后台审核通过 → qtcrowd-provider 拉取（`GET {BACKEND}/api/tasks?status=published`）→
> 写自己桶黄页快照 → 数据 API（`GET /api/tasks`）→ site/studio 拉取。

## 远程状态（OSS backend）

本配置使用 OSS 远程 state（`providers.tf` 的 `backend "oss"`），本机与 CI 共用。
同一 terraform 目录按 `-target` 分两个 state key 管理，互不接管：

| state key | 管理资源 | 触发 |
|-----------|---------|------|
| `qtcrowd/site.tfstate` | site 桶 / CDN / DNS（`cdn.tf`、`site-bucket.tf`） | `deploy-site.yml`（site/* tag） |
| `qtcrowd/terraform.tfstate` | provider FC 角色 / 函数 / 触发器（`fc.tf`） | `deploy-provider.yml`（provider/* tag） |

### 本机操作（以 provider state 为例）

```bash
cd manifests/terraform
export ALICLOUD_ACCESS_KEY_ID=xxx
export ALICLOUD_ACCESS_KEY_SECRET=xxx

terraform init \
  -backend-config="bucket=quanttide-terraform-state" \
  -backend-config="key=qtcrowd/terraform.tfstate" \
  -backend-config="region=cn-hangzhou"
export TF_VAR_image=<ACR>/quanttide/qtcrowd-provider:latest
export TF_VAR_backend_api=https://api.quanttide.com/qtcloud-crowd
export TF_VAR_oss_access_key_id=xxx
export TF_VAR_oss_access_key_secret=xxx
terraform plan -target=alicloud_fcv3_function.this -target=alicloud_fcv3_trigger.http
terraform apply
```

> 注：`oss_access_key_id/secret` 会明文落入 tfstate（FC 环境变量注入），生产建议后续改用 FC 密钥管理。

## 发布

### provider（FC）

`provider/*` tag（如 `provider/v0.1.0-alpha.1`）推送触发 `.github/workflows/deploy-provider.yml`：
构建 `src/provider` 镜像 → 推 ACR（`quanttide/qtcrowd-provider`）→ Terraform apply（`qtcrowd/terraform.tfstate`）到 FC。

前置：ACR 仓库已创建（PUBLIC）、GitHub org secrets 已配置（`ALIYUN_ACCESS_KEY_ID/SECRET`、
`ALIYUN_ACR_USERNAME/PASSWORD/REGISTRY`）、OSS 状态桶 `quanttide-terraform-state` 已存在、
OSS 数据桶 `qtcrowd-provider` 已存在（手动建）。

### site

`site/*` tag 推送触发 `.github/workflows/deploy-site.yml`：应用基础设施（`qtcrowd/site.tfstate`）+
构建 `src/site` → 上传 `oss://qtcrowd-site/` → 刷新 CDN（`crowd.quanttide.com`）。

## 前置条件（公共）

| 项 | 说明 |
|----|------|
| 桶 | `qtcrowd-site`（site 桶，terraform 建）；`qtcrowd-provider`（provider 自有桶，**手动已建，terraform 只引用**） |
| DNS | `crowd.quanttide.com` 需 CNAME 到 CDN 分配的地址（当前已配置） |
| ICP 备案 | 大陆 CDN 节点要求备案（crowd.quanttide.com 已备案） |
| Secrets | GitHub Actions 部署需要仓库配置 `ALIYUN_ACCESS_KEY_ID` / `ALIYUN_ACCESS_KEY_SECRET`（org 级已有） |
