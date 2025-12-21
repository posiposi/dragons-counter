output "ec2_security_group_id" {
  description = "EC2用セキュリティグループのID"
  value       = aws_security_group.ec2.id
}

output "ec2_security_group_name" {
  description = "EC2用セキュリティグループの名前"
  value       = aws_security_group.ec2.name
}

output "rds_security_group_id" {
  description = "RDS用セキュリティグループのID"
  value       = aws_security_group.rds.id
}

output "rds_security_group_name" {
  description = "RDS用セキュリティグループの名前"
  value       = aws_security_group.rds.name
}