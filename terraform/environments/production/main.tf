terraform {
  required_version = ">= 1.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.0"
    }
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = var.project_name
      Environment = var.environment
      ManagedBy   = "Terraform"
    }
  }
}

data "aws_acm_certificate" "main" {
  count = var.enable_https ? 1 : 0

  domain      = var.domain_name
  statuses    = ["ISSUED"]
  most_recent = true
}

data "aws_caller_identity" "current" {}

module "networking" {
  source = "../../modules/networking"

  project_name = var.project_name
  environment  = var.environment
  vpc_cidr     = var.vpc_cidr
}

module "alb" {
  source = "../../modules/alb"

  project_name = var.project_name
  environment  = var.environment
  vpc_id       = module.networking.vpc_id
  public_subnet_ids = [
    module.networking.public_subnet_1_id,
    module.networking.public_subnet_2_id
  ]
  enable_deletion_protection = false
  certificate_arn            = var.enable_https ? data.aws_acm_certificate.main[0].arn : null
}

module "security" {
  source = "../../modules/security"

  project_name          = var.project_name
  environment           = var.environment
  vpc_id                = module.networking.vpc_id
  alb_security_group_id = module.alb.alb_security_group_id
}

module "rds" {
  source = "../../modules/rds"

  project_name = var.project_name
  environment  = var.environment
  vpc_id       = module.networking.vpc_id
  private_subnet_ids = [
    module.networking.private_subnet_1_id,
    module.networking.private_subnet_2_id
  ]
  rds_security_group_id = module.security.rds_security_group_id
}

module "ec2" {
  source = "../../modules/ec2"

  project_name              = var.project_name
  environment               = var.environment
  aws_region                = var.aws_region
  subnet_id                 = module.networking.private_subnet_1_id
  ec2_security_group_id     = module.security.ec2_security_group_id
  github_repo_url           = var.github_repo_url
  frontend_target_group_arn = module.alb.frontend_target_group_arn
  backend_target_group_arn  = module.alb.backend_target_group_arn
  db_host                   = module.rds.db_instance_address
  db_name                   = module.rds.db_name
  db_user                   = module.rds.db_username
  rds_secret_arn            = module.rds.db_password_secret_arn
  enable_codedeploy         = true
  deploy_bucket_arn         = module.s3_deploy.bucket_arn
}

module "route53" {
  source = "../../modules/route53"
  count  = var.enable_https ? 1 : 0

  domain_name       = var.domain_name
  alb_dns_name      = module.alb.alb_dns_name
  alb_zone_id       = module.alb.alb_zone_id
  create_www_record = true
  project_name      = var.project_name
  environment       = var.environment
}

module "s3_deploy" {
  source = "../../modules/s3-deploy"

  project_name = var.project_name
  environment  = var.environment
}

module "codedeploy" {
  source = "../../modules/codedeploy"

  project_name  = var.project_name
  environment   = var.environment
  ec2_tag_value = "${var.project_name}-app"
}

module "github_oidc" {
  source = "../../modules/github-oidc"

  project_name        = var.project_name
  environment         = var.environment
  github_org          = var.github_org
  github_repo         = var.github_repo
  aws_region          = var.aws_region
  aws_account_id      = data.aws_caller_identity.current.account_id
  s3_bucket_arn       = module.s3_deploy.bucket_arn
  codedeploy_app_name = module.codedeploy.app_name
}

module "lambda_scraper" {
  source = "../../modules/lambda-scraper"

  project_name    = var.project_name
  environment     = var.environment
  lambda_zip_path = "${path.root}/../../../lambda/scraper.zip"
}

module "api_gateway" {
  source = "../../modules/api-gateway"

  project_name         = var.project_name
  environment          = var.environment
  lambda_invoke_arn    = module.lambda_scraper.invoke_arn
  lambda_function_name = module.lambda_scraper.function_name
  cors_allowed_origins = ["https://${var.domain_name}", "https://www.${var.domain_name}"]
}
