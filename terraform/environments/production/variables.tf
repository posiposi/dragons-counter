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

variable "vpc_cidr" {
  description = "VPCのCIDRブロック"
  type        = string
  default     = "10.0.0.0/16"
}

variable "allowed_ssh_cidr" {
  description = "SSH接続を許可するCIDRブロック"
  type        = string
}

variable "key_name" {
  description = "SSH接続用キーペア名（AWSコンソールで事前に作成が必要）"
  type        = string
}

variable "github_repo_url" {
  description = "GitHubリポジトリURL"
  type        = string
  default     = "https://github.com/posiposi/dragons-counter.git"
}

variable "github_org" {
  description = "GitHub組織名またはユーザー名"
  type        = string
  default     = "posiposi"
}

variable "github_repo" {
  description = "GitHubリポジトリ名"
  type        = string
  default     = "dragons-counter"
}

variable "domain_name" {
  description = "ドメイン名"
  type        = string
  default     = "dravincit.com"
}

variable "enable_https" {
  description = "HTTPSを有効化するか（persistent環境のACM証明書が必要）"
  type        = bool
  default     = true
}
