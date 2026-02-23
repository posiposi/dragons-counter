variable "project_name" {
  description = "プロジェクト名"
  type        = string
}

variable "environment" {
  description = "環境名（production/staging/development）"
  type        = string
}

variable "ec2_instance_id" {
  description = "対象EC2インスタンスのID"
  type        = string
}

variable "ec2_instance_arn" {
  description = "対象EC2インスタンスのARN（IAMポリシー用）"
  type        = string
}

variable "rds_instance_id" {
  description = "対象RDSインスタンスのID"
  type        = string
}

variable "rds_instance_arn" {
  description = "対象RDSインスタンスのARN（IAMポリシー用）"
  type        = string
}
