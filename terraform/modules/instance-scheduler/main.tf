locals {
  lambda_functions = {
    ec2_start = {
      name        = "${var.project_name}-ec2-start"
      handler     = "ec2_start.handler"
      source_file = "${path.module}/lambda/ec2_start.py"
      environment = {
        EC2_INSTANCE_ID = var.ec2_instance_id
      }
    }
    ec2_stop = {
      name        = "${var.project_name}-ec2-stop"
      handler     = "ec2_stop.handler"
      source_file = "${path.module}/lambda/ec2_stop.py"
      environment = {
        EC2_INSTANCE_ID = var.ec2_instance_id
      }
    }
    rds_start = {
      name        = "${var.project_name}-rds-start"
      handler     = "rds_start.handler"
      source_file = "${path.module}/lambda/rds_start.py"
      environment = {
        RDS_INSTANCE_ID = var.rds_instance_id
      }
    }
    rds_stop = {
      name        = "${var.project_name}-rds-stop"
      handler     = "rds_stop.handler"
      source_file = "${path.module}/lambda/rds_stop.py"
      environment = {
        RDS_INSTANCE_ID = var.rds_instance_id
      }
    }
  }
}

data "archive_file" "lambda" {
  for_each = local.lambda_functions

  type        = "zip"
  source_file = each.value.source_file
  output_path = "${path.module}/dist/${each.key}.zip"
}

resource "aws_lambda_function" "this" {
  for_each = local.lambda_functions

  function_name = each.value.name
  role          = aws_iam_role.lambda.arn
  handler       = each.value.handler
  runtime       = "python3.13"

  filename         = data.archive_file.lambda[each.key].output_path
  source_code_hash = data.archive_file.lambda[each.key].output_base64sha256

  memory_size = 128
  timeout     = 30

  environment {
    variables = each.value.environment
  }

  tags = {
    Name        = each.value.name
    Environment = var.environment
  }
}
