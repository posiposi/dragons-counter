variable "project_name" {
  description = "プロジェクト名"
  type        = string
}

variable "environment" {
  description = "環境名"
  type        = string
}

variable "aws_region" {
  description = "AWSリージョン"
  type        = string
}

variable "subnet_id" {
  description = "EC2を配置するサブネットID"
  type        = string
}

variable "ec2_security_group_id" {
  description = "EC2用セキュリティグループID"
  type        = string
}

variable "instance_type" {
  description = "EC2インスタンスタイプ"
  type        = string
  default     = "t3.nano"
}

variable "root_volume_size" {
  description = "ルートボリュームサイズ (GB)"
  type        = number
  default     = 30
}

variable "github_repo_url" {
  description = "GitHubリポジトリURL"
  type        = string
}

variable "frontend_target_group_arn" {
  description = "フロントエンド用ターゲットグループARN"
  type        = string
}

variable "backend_target_group_arn" {
  description = "バックエンド用ターゲットグループARN"
  type        = string
}

variable "frontend_port" {
  description = "フロントエンドのポート番号"
  type        = number
  default     = 3043
}

variable "backend_port" {
  description = "バックエンドのポート番号"
  type        = number
  default     = 3443
}

variable "db_host" {
  description = "RDSエンドポイント"
  type        = string
}

variable "db_name" {
  description = "データベース名"
  type        = string
}

variable "db_user" {
  description = "データベースユーザー名"
  type        = string
}

variable "rds_secret_arn" {
  description = "RDSパスワードのSecrets Manager ARN"
  type        = string
}

variable "enable_codedeploy" {
  description = "CodeDeployを有効化するか"
  type        = bool
  default     = false
}

variable "deploy_bucket_arn" {
  description = "デプロイアーティファクト用S3バケットARN"
  type        = string
  default     = ""
}
