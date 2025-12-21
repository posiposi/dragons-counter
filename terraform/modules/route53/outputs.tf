output "zone_id" {
  description = "Route53ホストゾーンID"
  value       = data.aws_route53_zone.main.zone_id
}

output "zone_name" {
  description = "Route53ホストゾーン名"
  value       = data.aws_route53_zone.main.name
}

output "apex_fqdn" {
  description = "apexドメインのFQDN"
  value       = aws_route53_record.apex.fqdn
}

output "www_fqdn" {
  description = "wwwサブドメインのFQDN"
  value       = var.create_www_record ? aws_route53_record.www[0].fqdn : null
}

output "name_servers" {
  description = "ネームサーバーのリスト"
  value       = data.aws_route53_zone.main.name_servers
}
