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
