output "certificate_arn" {
  description = "ACM証明書のARN（メインインフラで使用）"
  value       = module.acm.validated_certificate_arn
}

output "certificate_domain_name" {
  description = "証明書のドメイン名"
  value       = module.acm.certificate_domain_name
}

output "zone_id" {
  description = "Route53ホストゾーンID"
  value       = data.aws_route53_zone.main.zone_id
}

output "zone_name" {
  description = "Route53ホストゾーン名"
  value       = data.aws_route53_zone.main.name
}

output "name_servers" {
  description = "ネームサーバーのリスト"
  value       = data.aws_route53_zone.main.name_servers
}
