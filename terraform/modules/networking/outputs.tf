# ================================
# 出力値
# ================================

output "vpc_id" {
  description = "VPCのID"
  value       = aws_vpc.main.id
}

output "vpc_cidr" {
  description = "VPCのCIDRブロック"
  value       = aws_vpc.main.cidr_block
}

output "public_subnet_1_id" {
  description = "パブリックサブネット1のID"
  value       = aws_subnet.public_1.id
}

output "public_subnet_2_id" {
  description = "パブリックサブネット2のID"
  value       = aws_subnet.public_2.id
}

output "internet_gateway_id" {
  description = "インターネットゲートウェイのID"
  value       = aws_internet_gateway.main.id
}

output "public_route_table_id" {
  description = "パブリックルートテーブルのID"
  value       = aws_route_table.public.id
}

output "private_subnet_1_id" {
  description = "プライベートサブネット1のID"
  value       = aws_subnet.private_1.id
}

output "private_subnet_2_id" {
  description = "プライベートサブネット2のID"
  value       = aws_subnet.private_2.id
}

output "private_route_table_id" {
  description = "プライベートルートテーブルのID"
  value       = aws_route_table.private.id
}
