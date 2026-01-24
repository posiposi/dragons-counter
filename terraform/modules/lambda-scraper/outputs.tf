output "function_name" {
  description = "Lambda関数名"
  value       = aws_lambda_function.scraper.function_name
}

output "function_arn" {
  description = "Lambda関数のARN"
  value       = aws_lambda_function.scraper.arn
}

output "invoke_arn" {
  description = "Lambda関数のInvoke ARN"
  value       = aws_lambda_function.scraper.invoke_arn
}

output "role_arn" {
  description = "Lambda実行ロールのARN"
  value       = aws_iam_role.lambda.arn
}
