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
