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
