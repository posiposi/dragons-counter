data "aws_iam_policy_document" "lambda_assume_role" {
  statement {
    effect = "Allow"
    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
    actions = ["sts:AssumeRole"]
  }
}

resource "aws_iam_role" "lambda" {
  name               = "${var.project_name}-scraper-lambda-role"
  assume_role_policy = data.aws_iam_policy_document.lambda_assume_role.json

  tags = {
    Name        = "${var.project_name}-scraper-lambda-role"
    Environment = var.environment
  }
}

resource "aws_iam_role_policy_attachment" "lambda_basic_execution" {
  role       = aws_iam_role.lambda.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_signer_signing_profile" "lambda" {
  platform_id = "AWSLambda-SHA384-ECDSA"
  name_prefix = replace("${var.project_name}_scraper_", "-", "_")

  tags = {
    Name        = "${var.project_name}-scraper-signing-profile"
    Environment = var.environment
  }
}

resource "aws_lambda_code_signing_config" "scraper" {
  description = "Code signing config for ${var.project_name} scraper Lambda"

  allowed_publishers {
    signing_profile_version_arns = [
      aws_signer_signing_profile.lambda.version_arn,
    ]
  }

  policies {
    untrusted_artifact_on_deployment = "Warn"
  }
}

resource "aws_lambda_function" "scraper" {
  function_name = "${var.project_name}-npb-scraper"
  role          = aws_iam_role.lambda.arn
  handler       = "lambda_function.handler"
  runtime       = "python3.13"

  filename         = var.lambda_zip_path
  source_code_hash = filebase64sha256(var.lambda_zip_path)

  code_signing_config_arn = aws_lambda_code_signing_config.scraper.arn

  memory_size = var.memory_size
  timeout     = var.timeout

  environment {
    variables = {
      NPB_BASE_URL = var.npb_base_url
    }
  }

  tags = {
    Name        = "${var.project_name}-npb-scraper"
    Environment = var.environment
  }
}
