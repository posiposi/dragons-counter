output "ecs_security_group_id" {
  description = "ECS用セキュリティグループのID"
  value       = aws_security_group.ecs.id
}

output "ecs_security_group_name" {
  description = "ECS用セキュリティグループの名前"
  value       = aws_security_group.ecs.name
}

output "rds_security_group_id" {
  description = "RDS用セキュリティグループのID"
  value       = aws_security_group.rds.id
}

output "rds_security_group_name" {
  description = "RDS用セキュリティグループの名前"
  value       = aws_security_group.rds.name
}