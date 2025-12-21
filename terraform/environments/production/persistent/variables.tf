variable "aws_region" {
  description = "AWSリージョン"
  type        = string
  default     = "ap-northeast-1"
}

variable "project_name" {
  description = "プロジェクト名"
  type        = string
  default     = "dragons-counter"
}

variable "environment" {
  description = "環境名"
  type        = string
  default     = "production"
}

variable "domain_name" {
  description = "ドメイン名"
  type        = string
  default     = "dravincit.com"
}
