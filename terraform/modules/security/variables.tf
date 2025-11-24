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

variable "alb_security_group_id" {
  description = "ALBのセキュリティグループID"
  type        = string
}
