# 阿里云凭证通过环境变量注入（不在代码中写死）：
#   export ALICLOUD_ACCESS_KEY=...
#   export ALICLOUD_SECRET_KEY=...
provider "alicloud" {
  region = var.region
}

# 远程状态：OSS（本机与 CI 共用，CI 必须持久化状态）。初始化时通过 -backend-config 指定：
#   terraform init \
#     -backend-config="bucket=quanttide-terraform-state" \
#     -backend-config="key=qtcrowd/site.tfstate" \
#     -backend-config="region=cn-hangzhou"
#
# 同一 terraform 目录两个 state key（按 -target 限定各自资源，避免互相接管）：
#   - qtcrowd/site.tfstate      ：site 资源（OSS 桶/CDN/DNS，deploy-site.yml apply）
#   - qtcrowd/terraform.tfstate ：provider 资源（FC 角色/函数/触发器，deploy-provider.yml apply）
terraform {
  backend "oss" {}
}
