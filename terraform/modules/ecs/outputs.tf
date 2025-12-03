output "cluster_id" {
  description = "ECSクラスターのID"
  value       = aws_ecs_cluster.main.id
}

output "cluster_name" {
  description = "ECSクラスターの名前"
  value       = aws_ecs_cluster.main.name
}

output "cluster_arn" {
  description = "ECSクラスターのARN"
  value       = aws_ecs_cluster.main.arn
}

output "backend_task_definition_arn" {
  description = "BackendタスクタスクのARN"
  value       = aws_ecs_task_definition.backend.arn
}

output "backend_service_name" {
  description = "BackendサービスのARN"
  value       = aws_ecs_service.backend.name
}

output "backend_cloudwatch_log_group" {
  description = "BackendのCloudWatch Logsグループ名"
  value       = aws_cloudwatch_log_group.backend.name
}

output "frontend_task_definition_arn" {
  description = "FrontendタスクのARN"
  value       = aws_ecs_task_definition.frontend.arn
}

output "frontend_service_name" {
  description = "Frontendサービス名"
  value       = aws_ecs_service.frontend.name
}

output "frontend_cloudwatch_log_group" {
  description = "FrontendのCloudWatch Logsグループ名"
  value       = aws_cloudwatch_log_group.frontend.name
}
