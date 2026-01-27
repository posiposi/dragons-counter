variable "project_name" {
  description = "プロジェクト名"
  type        = string
}

variable "environment" {
  description = "環境名（production, staging, etc.）"
  type        = string
}

variable "lambda_invoke_arn" {
  description = "Lambda関数のInvoke ARN"
  type        = string
}

variable "lambda_function_name" {
  description = "Lambda関数名"
  type        = string
}

variable "cors_allowed_origins" {
  description = "CORS許可オリジンのリスト"
  type        = list(string)
  default     = ["*"]
}
