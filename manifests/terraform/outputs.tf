output "oss_bucket" {
  description = "站点桶名"
  value       = alicloud_oss_bucket.site.bucket
}

output "cdn_domain" {
  description = "CDN 域名"
  value       = alicloud_cdn_domain_new.site.domain_name
}

output "cdn_cname" {
  description = "CDN CNAME"
  value       = alicloud_cdn_domain_new.site.cname
}

# ============================================================
# provider（FC）输出
# ============================================================
output "fc_function_name" {
  description = "函数计算函数名（qtcrowd-provider）"
  value       = alicloud_fcv3_function.this.function_name
}

output "fc_http_url" {
  description = "FC HTTP 触发器公网地址（系统级 API 网关接入前的直连入口）"
  value       = try(alicloud_fcv3_trigger.http.http_trigger[0].url_internet, "尚未创建")
}

output "oss_provider_bucket" {
  description = "qtcrowd-provider 自有 OSS 桶名（已建，只引用不创建）"
  value       = var.oss_provider_bucket
}

# ============================================================
# API 网关输出（对齐 qtcloud-crowd 惯例——网关手动配置，此处记录清单）
# ============================================================
output "apigateway_domain" {
  description = "API 网关子域名（DNS CNAME 已配置 api.quanttide.com）"
  value       = "34c138c4bec1405d942a57d9bb5ede37-cn-hangzhou.alicloudapi.com"
}

output "apigateway_apis" {
  description = "API 网关 API 列表（qtcrowd-provider——前台唯一入口）"
  value = {
    tasks        = "/qtcrowd/api/tasks"
    task_claim   = "/qtcrowd/api/tasks/{id}/claim"
    task_deliver = "/qtcrowd/api/tasks/{id}/deliver"
  }
}
