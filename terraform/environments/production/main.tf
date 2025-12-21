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

module "bastion" {
  source = "../../modules/bastion"

  project_name     = var.project_name
  environment      = var.environment
  vpc_id           = module.networking.vpc_id
  subnet_id        = module.networking.public_subnet_1_id
  allowed_ssh_cidr = var.allowed_ssh_cidr
  key_name         = var.key_name
}

module "security" {
  source = "../../modules/security"

  project_name              = var.project_name
  environment               = var.environment
  vpc_id                    = module.networking.vpc_id
  alb_security_group_id     = module.alb.alb_security_group_id
  bastion_security_group_id = module.bastion.bastion_security_group_id
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
  key_name                  = var.key_name
  github_repo_url           = var.github_repo_url
  frontend_target_group_arn = module.alb.frontend_target_group_arn
  backend_target_group_arn  = module.alb.backend_target_group_arn
  db_host                   = module.rds.db_instance_address
  db_name                   = module.rds.db_name
  db_user                   = module.rds.db_username
  rds_secret_arn            = module.rds.db_password_secret_arn
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
