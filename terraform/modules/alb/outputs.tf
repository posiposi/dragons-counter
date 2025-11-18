# ================================
# 出力値
# ================================

output "alb_id" {
  description = "ALBのID"
  value       = aws_lb.main.id
}

output "alb_arn" {
  description = "ALBのARN"
  value       = aws_lb.main.arn
}

output "alb_dns_name" {
  description = "ALBのDNS名"
  value       = aws_lb.main.dns_name
}

output "alb_zone_id" {
  description = "ALBのホストゾーンID"
  value       = aws_lb.main.zone_id
}

output "alb_security_group_id" {
  description = "ALB用セキュリティグループのID"
  value       = aws_security_group.alb.id
}

output "frontend_target_group_arn" {
  description = "フロントエンド用ターゲットグループのARN"
  value       = aws_lb_target_group.frontend.arn
}

output "backend_target_group_arn" {
  description = "バックエンド用ターゲットグループのARN"
  value       = aws_lb_target_group.backend.arn
}

output "http_listener_arn" {
  description = "HTTPリスナーのARN"
  value       = aws_lb_listener.http.arn
}
