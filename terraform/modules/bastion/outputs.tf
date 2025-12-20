output "bastion_public_ip" {
  description = "BastionサーバーのパブリックIP"
  value       = aws_instance.bastion.public_ip
}

output "bastion_instance_id" {
  description = "BastionサーバーのインスタンスID"
  value       = aws_instance.bastion.id
}

output "bastion_security_group_id" {
  description = "Bastionセキュリティグループ ID"
  value       = aws_security_group.bastion.id
}
