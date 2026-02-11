output "api_id" {
  description = "API GatewayのID"
  value       = aws_apigatewayv2_api.scraper.id
}

output "api_endpoint" {
  description = "API Gatewayのエンドポイント URL"
  value       = aws_apigatewayv2_api.scraper.api_endpoint
}

output "stage_invoke_url" {
  description = "ステージのInvoke URL"
  value       = aws_apigatewayv2_stage.prod.invoke_url
}

output "execution_arn" {
  description = "API Gatewayの実行ARN"
  value       = aws_apigatewayv2_api.scraper.execution_arn
}

output "scraper_api_key_secret_arn" {
  description = "スクレイピング用APIキーのSecrets Manager ARN"
  value       = aws_secretsmanager_secret.scraper_api_key.arn
}

output "scraper_api_key_value" {
  description = "スクレイピング用APIキーの値"
  value       = random_password.scraper_api_key.result
  sensitive   = true
}
