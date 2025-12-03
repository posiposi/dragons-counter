variable "project_name" {
  description = "プロジェクト名"
  type        = string
}

variable "environment" {
  description = "環境名（production/staging/development）"
  type        = string
}

variable "vpc_id" {
  description = "VPCのID"
  type        = string
}

variable "private_subnet_ids" {
  description = "プライベートサブネットのIDリスト"
  type        = list(string)
}

variable "ecs_security_group_id" {
  description = "ECS用セキュリティグループのID"
  type        = string
}

variable "backend_target_group_arn" {
  description = "Backend用ALBターゲットグループのARN"
  type        = string
}

variable "backend_ecr_repository_url" {
  description = "BackendのECRリポジトリURL"
  type        = string
}

variable "db_host" {
  description = "RDSエンドポイント（ホスト部分）"
  type        = string
}

variable "db_port" {
  description = "RDSポート"
  type        = number
  default     = 3306
}

variable "db_name" {
  description = "データベース名"
  type        = string
}

variable "db_username" {
  description = "データベースユーザー名"
  type        = string
}

variable "db_password_secret_arn" {
  description = "データベースパスワードのSecrets Manager ARN"
  type        = string
}

variable "backend_cpu" {
  description = "BackendタスクのCPUユニット"
  type        = number
  default     = 256
}

variable "backend_memory" {
  description = "BackendタスクのメモリMB"
  type        = number
  default     = 512
}

variable "backend_desired_count" {
  description = "Backendタスクの希望数"
  type        = number
  default     = 1
}

variable "frontend_target_group_arn" {
  description = "Frontend用ALBターゲットグループのARN"
  type        = string
}

variable "frontend_ecr_repository_url" {
  description = "FrontendのECRリポジトリURL"
  type        = string
}

variable "alb_dns_name" {
  description = "ALBのDNS名"
  type        = string
}

variable "frontend_cpu" {
  description = "FrontendタスクのCPUユニット"
  type        = number
  default     = 256
}

variable "frontend_memory" {
  description = "FrontendタスクのメモリMB"
  type        = number
  default     = 512
}

variable "frontend_desired_count" {
  description = "Frontendタスクの希望数"
  type        = number
  default     = 1
}
