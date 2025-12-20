variable "project_name" {
  description = "プロジェクト名"
  type        = string
}

variable "environment" {
  description = "環境名（production, staging, etc.）"
  type        = string
}

variable "vpc_cidr" {
  description = "VPCのCIDRブロック"
  type        = string
  default     = "10.0.0.0/16"
}

variable "public_subnet_1_cidr" {
  description = "パブリックサブネット1のCIDRブロック（ALB用、AZ1）"
  type        = string
  default     = "10.0.1.0/24"
}

variable "public_subnet_2_cidr" {
  description = "パブリックサブネット2のCIDRブロック（ALB用、AZ2）"
  type        = string
  default     = "10.0.2.0/24"
}

variable "private_subnet_1_cidr" {
  description = "プライベートサブネット1のCIDRブロック（EC2 + RDS用、AZ1）"
  type        = string
  default     = "10.0.10.0/24"
}

variable "private_subnet_2_cidr" {
  description = "プライベートサブネット2のCIDRブロック（RDS DBサブネットグループ要件用、AZ2）"
  type        = string
  default     = "10.0.11.0/24"
}
