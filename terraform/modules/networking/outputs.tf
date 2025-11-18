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
