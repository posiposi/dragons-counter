resource "random_password" "scraper_api_key" {
  length  = 48
  special = false
}

resource "aws_secretsmanager_secret" "scraper_api_key" {
  name                    = "${var.project_name}-${var.environment}-scraper-api-key"
  recovery_window_in_days = 0

  tags = {
    Name        = "${var.project_name}-scraper-api-key"
    Environment = var.environment
  }
}

resource "aws_secretsmanager_secret_version" "scraper_api_key" {
  secret_id     = aws_secretsmanager_secret.scraper_api_key.id
  secret_string = random_password.scraper_api_key.result
}
