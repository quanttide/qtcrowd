variable "region" {
  description = "阿里云地域"
  type        = string
  default     = "cn-hangzhou"
}

variable "project" {
  description = "项目名（资源命名前缀）"
  type        = string
  default     = "qtcrowd"
}

variable "environment" {
  description = "环境：dev / prod"
  type        = string
  default     = "prod"
}

# ============================================================
# site（React+Vite 官网，.github/workflows/deploy-site.yml）相关变量
# ============================================================
variable "oss_bucket_name" {
  description = "站点桶名（OSS 全局唯一；静态网站模式）"
  type        = string
  default     = "qtcrowd-site"
}

# ============================================================
# provider（qtcrowd-provider FC 容器，.github/workflows/deploy-provider.yml）相关变量
# ============================================================
variable "image" {
  description = "FC 容器镜像（ACR 地址）。由 CI 注入（TF_VAR_image 拼接 secret ALIYUN_ACR_REGISTRY 的实例地址）或 terraform.tfvars 提供；实例地址属敏感信息不写默认值"
  type        = string
}

variable "backend_api" {
  description = "后台 API 根 URL（qtcrowd-provider 的 QTCLOUD_CROWD_BACKEND_API，必填——上架拉取 + 认领/交付转发目标；生产指向 qtcloud-crowd API 网关，如 https://api.quanttide.com/qtcloud-crowd）"
  type        = string
}

variable "oss_provider_bucket" {
  description = "qtcrowd-provider 自有 OSS 桶（已建，手动——本配置只引用不创建；QTCLOUD_OSS_BUCKET，黄页快照 public/tasks/{id}.json）"
  type        = string
  default     = "qtcrowd-provider"
}

variable "oss_endpoint" {
  description = "阿里云 OSS Endpoint（provider 运行时 QTCLOUD_OSS_ENDPOINT）"
  type        = string
  default     = "oss-cn-hangzhou.aliyuncs.com"
}

variable "oss_access_key_id" {
  description = "provider 运行时访问 OSS 的 AccessKey ID（FC 环境变量 QTCLOUD_OSS_ACCESS_KEY_ID；会明文落入 tfstate，生产建议后续改用 FC 密钥管理注入）"
  type        = string
  sensitive   = true
}

variable "oss_access_key_secret" {
  description = "provider 运行时访问 OSS 的 AccessKey Secret（FC 环境变量 QTCLOUD_OSS_ACCESS_KEY_SECRET；会明文落入 tfstate，生产建议后续改用 FC 密钥管理注入）"
  type        = string
  sensitive   = true
}

variable "sync_interval" {
  description = "周期上架间隔（QTCLOUD_CROWD_SYNC_INTERVAL；默认 5m，0 或无效值 = 仅启动时上架一次）"
  type        = string
  default     = "5m"
}

variable "fc_memory" {
  description = "FC 函数内存（MB）"
  type        = number
  default     = 512
}

variable "fc_timeout" {
  description = "FC 函数超时（秒）"
  type        = number
  default     = 60
}
