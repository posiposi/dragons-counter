variable "domain_name" {
  description = "メインドメイン名"
  type        = string
}

variable "subject_alternative_names" {
  description = "追加のドメイン名（SAN）"
  type        = list(string)
  default     = []
}

variable "zone_id" {
  description = "Route53ホストゾーンID"
  type        = string
}

variable "project_name" {
  description = "プロジェクト名"
  type        = string
}

variable "environment" {
  description = "環境名"
  type        = string
}
