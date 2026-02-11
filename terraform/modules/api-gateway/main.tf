resource "aws_apigatewayv2_api" "scraper" {
  name          = "${var.project_name}-scraper-api"
  protocol_type = "HTTP"

  cors_configuration {
    allow_origins = var.cors_allowed_origins
    allow_methods = ["GET", "OPTIONS"]
    allow_headers = ["Content-Type", "x-api-key"]
    max_age       = 3600
  }

  tags = {
    Name        = "${var.project_name}-scraper-api"
    Environment = var.environment
  }
}

resource "aws_apigatewayv2_stage" "prod" {
  api_id      = aws_apigatewayv2_api.scraper.id
  name        = "prod"
  auto_deploy = true

  tags = {
    Name        = "${var.project_name}-scraper-api-stage"
    Environment = var.environment
  }
}

resource "aws_apigatewayv2_integration" "lambda" {
  api_id                 = aws_apigatewayv2_api.scraper.id
  integration_type       = "AWS_PROXY"
  integration_uri        = var.lambda_invoke_arn
  integration_method     = "POST"
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "scrape" {
  api_id             = aws_apigatewayv2_api.scraper.id
  route_key          = "GET /scrape"
  target             = "integrations/${aws_apigatewayv2_integration.lambda.id}"
  authorization_type = "NONE"
}

resource "aws_lambda_permission" "api_gateway" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = var.lambda_function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.scraper.execution_arn}/*/*"
}
