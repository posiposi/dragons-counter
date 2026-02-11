variable "project_name" {
  description = "プロジェクト名"
  type        = string
}

variable "environment" {
  description = "環境名（production, staging, etc.）"
  type        = string
}

variable "lambda_zip_path" {
  description = "Lambda関数のZIPファイルパス"
  type        = string
}

variable "memory_size" {
  description = "Lambda関数のメモリサイズ（MB）"
  type        = number
  default     = 256
}

variable "timeout" {
  description = "Lambda関数のタイムアウト（秒）"
  type        = number
  default     = 30
}

variable "npb_base_url" {
  description = "NPB公式ページのベースURL"
  type        = string
  default     = "https://npb.jp"
}

variable "scraper_api_key" {
  description = "スクレイピングAPI用のAPIキー"
  type        = string
  sensitive   = true
  default     = ""
}
