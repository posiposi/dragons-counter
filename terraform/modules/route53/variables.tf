variable "domain_name" {
  description = "ドメイン名"
  type        = string
}

variable "alb_dns_name" {
  description = "ALBのDNS名"
  type        = string
}

variable "alb_zone_id" {
  description = "ALBのホストゾーンID"
  type        = string
}

variable "create_www_record" {
  description = "wwwサブドメインのレコードを作成するか"
  type        = bool
  default     = true
}

variable "project_name" {
  description = "プロジェクト名"
  type        = string
}

variable "environment" {
  description = "環境名"
  type        = string
}