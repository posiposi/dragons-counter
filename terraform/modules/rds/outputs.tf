output "db_instance_endpoint" {
  description = "RDSインスタンスのエンドポイント"
  value       = aws_db_instance.main.endpoint
}

output "db_instance_address" {
  description = "RDSインスタンスのアドレス"
  value       = aws_db_instance.main.address
}

output "db_instance_port" {
  description = "RDSインスタンスのポート"
  value       = aws_db_instance.main.port
}

output "db_instance_arn" {
  description = "RDSインスタンスのARN"
  value       = aws_db_instance.main.arn
}

output "db_name" {
  description = "データベース名"
  value       = aws_db_instance.main.db_name
}

output "db_username" {
  description = "データベースユーザー名"
  value       = aws_db_instance.main.username
}

output "db_password_secret_arn" {
  description = "データベースパスワードのSecrets Manager ARN"
  value       = aws_secretsmanager_secret.db_password.arn
}

output "db_password_secret_name" {
  description = "データベースパスワードのSecrets Manager名"
  value       = aws_secretsmanager_secret.db_password.name
}
