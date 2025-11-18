# ================================
# 変数定義
# ================================

variable "project_name" {
  description = "プロジェクト名"
  type        = string
}

variable "environment" {
  description = "環境名（production, staging, etc.）"
  type        = string
}

variable "vpc_id" {
  description = "VPC ID"
  type        = string
}

variable "public_subnet_ids" {
  description = "パブリックサブネットIDのリスト（最低2つのAZ）"
  type        = list(string)
}

variable "enable_deletion_protection" {
  description = "削除保護を有効にするか"
  type        = bool
  default     = false
}
