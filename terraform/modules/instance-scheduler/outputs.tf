output "lambda_function_arns" {
  description = "各Lambda関数のARN"
  value = {
    for key, fn in aws_lambda_function.this : key => fn.arn
  }
}

output "lambda_function_names" {
  description = "各Lambda関数名"
  value = {
    for key, fn in aws_lambda_function.this : key => fn.function_name
  }
}

output "ec2_start_function_arn" {
  description = "EC2起動Lambda関数のARN"
  value       = aws_lambda_function.this["ec2_start"].arn
}

output "ec2_start_function_name" {
  description = "EC2起動Lambda関数名"
  value       = aws_lambda_function.this["ec2_start"].function_name
}

output "ec2_stop_function_arn" {
  description = "EC2停止Lambda関数のARN"
  value       = aws_lambda_function.this["ec2_stop"].arn
}

output "ec2_stop_function_name" {
  description = "EC2停止Lambda関数名"
  value       = aws_lambda_function.this["ec2_stop"].function_name
}

output "rds_start_function_arn" {
  description = "RDS起動Lambda関数のARN"
  value       = aws_lambda_function.this["rds_start"].arn
}

output "rds_start_function_name" {
  description = "RDS起動Lambda関数名"
  value       = aws_lambda_function.this["rds_start"].function_name
}

output "rds_stop_function_arn" {
  description = "RDS停止Lambda関数のARN"
  value       = aws_lambda_function.this["rds_stop"].arn
}

output "rds_stop_function_name" {
  description = "RDS停止Lambda関数名"
  value       = aws_lambda_function.this["rds_stop"].function_name
}

output "role_arn" {
  description = "Lambda実行ロールのARN"
  value       = aws_iam_role.lambda.arn
}
