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

output "private_subnet_1_id" {
  description = "プライベートサブネット1のID"
  value       = module.networking.private_subnet_1_id
}

output "private_subnet_2_id" {
  description = "プライベートサブネット2のID"
  value       = module.networking.private_subnet_2_id
}

output "nat_gateway_id" {
  description = "NAT GatewayのID"
  value       = module.networking.nat_gateway_id
}

output "nat_gateway_eip" {
  description = "NAT Gateway用Elastic IP（固定グローバルIP）"
  value       = module.networking.nat_gateway_eip
}

# ================================
# ALB出力値
# ================================

output "alb_dns_name" {
  description = "ALBのDNS名（アクセスURL）"
  value       = module.alb.alb_dns_name
}

output "alb_arn" {
  description = "ALBのARN"
  value       = module.alb.alb_arn
}

output "alb_security_group_id" {
  description = "ALB用セキュリティグループのID"
  value       = module.alb.alb_security_group_id
}

output "frontend_target_group_arn" {
  description = "フロントエンド用ターゲットグループのARN"
  value       = module.alb.frontend_target_group_arn
}

output "backend_target_group_arn" {
  description = "バックエンド用ターゲットグループのARN"
  value       = module.alb.backend_target_group_arn
}
