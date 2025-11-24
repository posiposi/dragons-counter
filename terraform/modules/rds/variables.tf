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
  description = "プライベートサブネットのIDリスト（最低2つ必要）"
  type        = list(string)
}

variable "rds_security_group_id" {
  description = "RDS用セキュリティグループのID"
  type        = string
}

variable "db_name" {
  description = "データベース名"
  type        = string
  default     = "dragons_counter"
}

variable "db_username" {
  description = "データベースユーザー名"
  type        = string
  default     = "admin"
}

variable "db_instance_class" {
  description = "RDSインスタンスクラス"
  type        = string
  default     = "db.t4g.micro"
}

variable "allocated_storage" {
  description = "割り当てストレージ容量（GB）"
  type        = number
  default     = 20
}

variable "backup_retention_period" {
  description = "バックアップ保持期間（日数）"
  type        = number
  default     = 7
}

variable "backup_window" {
  description = "バックアップウィンドウ（UTC）"
  type        = string
  default     = "17:00-18:00"
}

variable "maintenance_window" {
  description = "メンテナンスウィンドウ（UTC）"
  type        = string
  default     = "sun:18:00-sun:19:00"
}