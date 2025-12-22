variable "project_name" {
  description = "Project name"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "github_org" {
  description = "GitHub organization or username"
  type        = string
}

variable "github_repo" {
  description = "GitHub repository name"
  type        = string
}

variable "aws_region" {
  description = "AWS region"
  type        = string
}

variable "aws_account_id" {
  description = "AWS account ID"
  type        = string
}

variable "s3_bucket_arn" {
  description = "S3 bucket ARN for deployment artifacts"
  type        = string
}

variable "codedeploy_app_name" {
  description = "CodeDeploy application name"
  type        = string
}
