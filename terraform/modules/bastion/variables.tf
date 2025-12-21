variable "project_name" {
  description = "プロジェクト名"
  type        = string
}

variable "environment" {
  description = "環境名"
  type        = string
}

variable "vpc_id" {
  description = "VPC ID"
  type        = string
}

variable "subnet_id" {
  description = "Bastionを配置するパブリックサブネットID"
  type        = string
}

variable "allowed_ssh_cidr" {
  description = "SSH接続を許可するCIDRブロック"
  type        = string
}

variable "key_name" {
  description = "SSH接続用キーペア名"
  type        = string
}

variable "instance_type" {
  description = "EC2インスタンスタイプ"
  type        = string
  default     = "t3.micro"
}
