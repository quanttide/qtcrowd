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
