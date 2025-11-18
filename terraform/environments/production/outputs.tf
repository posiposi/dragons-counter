# ================================
# 出力値
# ================================

output "vpc_id" {
  description = "VPCのID"
  value       = module.networking.vpc_id
}

output "vpc_cidr" {
  description = "VPCのCIDRブロック"
  value       = module.networking.vpc_cidr
}

output "public_subnet_1_id" {
  description = "パブリックサブネット1のID"
  value       = module.networking.public_subnet_1_id
}

output "public_subnet_2_id" {
  description = "パブリックサブネット2のID"
  value       = module.networking.public_subnet_2_id
}

output "internet_gateway_id" {
  description = "インターネットゲートウェイのID"
  value       = module.networking.internet_gateway_id
}
