terraform {
  required_version = ">= 1.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
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
