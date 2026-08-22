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

variable "oss_bucket_name" {
  description = "站点桶名（OSS 全局唯一；静态网站模式）"
  type        = string
  default     = "qtcrowd-site"
}

variable "image" {
  description = "保留变量（对齐平台 deploy-site 模板；本站点不使用）"
  type        = string
  default     = ""
}
