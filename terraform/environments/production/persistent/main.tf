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
      Persistent  = "true"
    }
  }
}

data "aws_route53_zone" "main" {
  name         = var.domain_name
  private_zone = false
}

module "acm" {
  source = "../../../modules/acm"

  domain_name               = var.domain_name
  subject_alternative_names = ["www.${var.domain_name}"]
  zone_id                   = data.aws_route53_zone.main.zone_id
  project_name              = var.project_name
  environment               = var.environment
}