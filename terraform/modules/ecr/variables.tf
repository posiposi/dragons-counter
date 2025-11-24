variable "project_name" {
  description = "プロジェクト名"
  type        = string
}

variable "environment" {
  description = "環境名（production/staging/development）"
  type        = string
}

variable "image_retention_count" {
  description = "保持するイメージの最大数（各リポジトリごと）"
  type        = number
  default     = 5
}