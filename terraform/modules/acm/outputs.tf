output "certificate_arn" {
  description = "ACM証明書のARN"
  value       = aws_acm_certificate.main.arn
}

output "certificate_domain_name" {
  description = "証明書のドメイン名"
  value       = aws_acm_certificate.main.domain_name
}

output "certificate_status" {
  description = "証明書のステータス"
  value       = aws_acm_certificate.main.status
}

output "validated_certificate_arn" {
  description = "検証済み証明書のARN（検証完了後に使用）"
  value       = aws_acm_certificate_validation.main.certificate_arn
}