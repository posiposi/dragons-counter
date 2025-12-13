output "instance_id" {
  description = "EC2インスタンスID"
  value       = aws_instance.app.id
}

output "instance_private_ip" {
  description = "EC2インスタンスのプライベートIP"
  value       = aws_instance.app.private_ip
}

output "instance_arn" {
  description = "EC2インスタンスのARN"
  value       = aws_instance.app.arn
}

output "iam_role_arn" {
  description = "EC2用IAMロールのARN"
  value       = aws_iam_role.ec2.arn
}

output "iam_role_name" {
  description = "EC2用IAMロールの名前"
  value       = aws_iam_role.ec2.name
}

output "instance_profile_arn" {
  description = "EC2インスタンスプロファイルのARN"
  value       = aws_iam_instance_profile.ec2.arn
}

output "instance_profile_name" {
  description = "EC2インスタンスプロファイルの名前"
  value       = aws_iam_instance_profile.ec2.name
}
