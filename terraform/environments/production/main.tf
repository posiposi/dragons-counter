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
}

module "security" {
  source = "../../modules/security"

  project_name          = var.project_name
  environment           = var.environment
  vpc_id                = module.networking.vpc_id
  alb_security_group_id = module.alb.alb_security_group_id
}

module "ecr" {
  source = "../../modules/ecr"

  project_name           = var.project_name
  environment            = var.environment
  image_retention_count  = 5
}

module "rds" {
  source = "../../modules/rds"

  project_name           = var.project_name
  environment            = var.environment
  vpc_id                 = module.networking.vpc_id
  private_subnet_ids     = [
    module.networking.private_subnet_1_id,
    module.networking.private_subnet_2_id
  ]
  rds_security_group_id  = module.security.rds_security_group_id
}

module "ecs" {
  source = "../../modules/ecs"

  project_name               = var.project_name
  environment                = var.environment
  vpc_id                     = module.networking.vpc_id
  private_subnet_ids         = [module.networking.private_subnet_1_id]
  ecs_security_group_id      = module.security.ecs_security_group_id
  backend_target_group_arn   = module.alb.backend_target_group_arn
  backend_ecr_repository_url = module.ecr.backend_repository_url
  db_host                    = module.rds.db_instance_address
  db_name                    = module.rds.db_name
  db_username                = module.rds.db_username
  db_password_secret_arn     = module.rds.db_password_secret_arn
  frontend_target_group_arn  = module.alb.frontend_target_group_arn
  frontend_ecr_repository_url = module.ecr.frontend_repository_url
  alb_dns_name               = module.alb.alb_dns_name
}
