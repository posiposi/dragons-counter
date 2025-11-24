output "frontend_repository_url" {
  description = "FrontendのECRリポジトリURL"
  value       = aws_ecr_repository.frontend.repository_url
}

output "frontend_repository_arn" {
  description = "FrontendのECRリポジトリARN"
  value       = aws_ecr_repository.frontend.arn
}

output "frontend_repository_name" {
  description = "FrontendのECRリポジトリ名"
  value       = aws_ecr_repository.frontend.name
}

output "backend_repository_url" {
  description = "BackendのECRリポジトリURL"
  value       = aws_ecr_repository.backend.repository_url
}

output "backend_repository_arn" {
  description = "BackendのECRリポジトリARN"
  value       = aws_ecr_repository.backend.arn
}

output "backend_repository_name" {
  description = "BackendのECRリポジトリ名"
  value       = aws_ecr_repository.backend.name
}