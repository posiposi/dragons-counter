output "vpc_id" {
  description = "VPCのID"
  value       = module.networking.vpc_id
}

output "vpc_cidr" {
  description = "VPCのCIDRブロック"
  value       = module.networking.vpc_cidr
}

output "public_subnet_1_id" {
  description = "パブリックサブネット1のID"
  value       = module.networking.public_subnet_1_id
}

output "public_subnet_2_id" {
  description = "パブリックサブネット2のID"
  value       = module.networking.public_subnet_2_id
}

output "internet_gateway_id" {
  description = "インターネットゲートウェイのID"
  value       = module.networking.internet_gateway_id
}

output "private_subnet_1_id" {
  description = "プライベートサブネット1のID"
  value       = module.networking.private_subnet_1_id
}

output "private_subnet_2_id" {
  description = "プライベートサブネット2のID"
  value       = module.networking.private_subnet_2_id
}

output "nat_gateway_id" {
  description = "NAT GatewayのID"
  value       = module.networking.nat_gateway_id
}

output "nat_gateway_eip" {
  description = "NAT Gateway用Elastic IP（固定グローバルIP）"
  value       = module.networking.nat_gateway_eip
}

output "alb_dns_name" {
  description = "ALBのDNS名（アクセスURL）"
  value       = module.alb.alb_dns_name
}

output "alb_arn" {
  description = "ALBのARN"
  value       = module.alb.alb_arn
}

output "alb_security_group_id" {
  description = "ALB用セキュリティグループのID"
  value       = module.alb.alb_security_group_id
}

output "frontend_target_group_arn" {
  description = "フロントエンド用ターゲットグループのARN"
  value       = module.alb.frontend_target_group_arn
}

output "backend_target_group_arn" {
  description = "バックエンド用ターゲットグループのARN"
  value       = module.alb.backend_target_group_arn
}

output "ec2_security_group_id" {
  description = "EC2用セキュリティグループのID"
  value       = module.security.ec2_security_group_id
}

output "rds_security_group_id" {
  description = "RDS用セキュリティグループのID"
  value       = module.security.rds_security_group_id
}

output "bastion_public_ip" {
  description = "踏み台サーバーのパブリックIP"
  value       = module.bastion.bastion_public_ip
}

output "db_instance_endpoint" {
  description = "RDSインスタンスのエンドポイント"
  value       = module.rds.db_instance_endpoint
}

output "db_instance_address" {
  description = "RDSインスタンスのアドレス"
  value       = module.rds.db_instance_address
}

output "db_name" {
  description = "データベース名"
  value       = module.rds.db_name
}

output "db_password_secret_arn" {
  description = "データベースパスワードのSecrets Manager ARN"
  value       = module.rds.db_password_secret_arn
}

output "ec2_instance_id" {
  description = "EC2インスタンスのID"
  value       = module.ec2.instance_id
}

output "ec2_instance_private_ip" {
  description = "EC2インスタンスのプライベートIP"
  value       = module.ec2.instance_private_ip
}

output "ec2_iam_role_arn" {
  description = "EC2用IAMロールのARN"
  value       = module.ec2.iam_role_arn
}

output "https_enabled" {
  description = "HTTPSが有効かどうか"
  value       = var.enable_https
}

output "domain_url" {
  description = "ドメインURL（HTTPS有効時）"
  value       = var.enable_https ? "https://${var.domain_name}" : null
}

output "www_domain_url" {
  description = "wwwドメインURL（HTTPS有効時）"
  value       = var.enable_https ? "https://www.${var.domain_name}" : null
}

output "https_listener_arn" {
  description = "HTTPSリスナーのARN"
  value       = module.alb.https_listener_arn
}

output "deploy_bucket_name" {
  description = "デプロイアーティファクト用S3バケット名"
  value       = module.s3_deploy.bucket_name
}

output "codedeploy_app_name" {
  description = "CodeDeployアプリケーション名"
  value       = module.codedeploy.app_name
}

output "codedeploy_deployment_group" {
  description = "CodeDeployデプロイメントグループ名"
  value       = module.codedeploy.deployment_group_name
}

output "github_actions_role_arn" {
  description = "GitHub Actions用IAMロールARN"
  value       = module.github_oidc.role_arn
}
