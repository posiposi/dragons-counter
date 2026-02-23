# Get latest Amazon Linux 2023 AMI
data "aws_ami" "amazon_linux_2023" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["al2023-ami-*-x86_64"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }

  filter {
    name   = "root-device-type"
    values = ["ebs"]
  }
}

# EC2 Instance
resource "aws_instance" "app" {
  ami                    = data.aws_ami.amazon_linux_2023.id
  instance_type          = var.instance_type
  subnet_id              = var.subnet_id
  vpc_security_group_ids = [var.ec2_security_group_id]
  iam_instance_profile   = aws_iam_instance_profile.ec2.name

  root_block_device {
    volume_size           = var.root_volume_size
    volume_type           = "gp3"
    encrypted             = true
    delete_on_termination = true
  }

  user_data_base64 = base64encode(templatefile("${path.module}/user_data.sh", {
    aws_region                = var.aws_region
    github_repo_url           = var.github_repo_url
    db_host                   = var.db_host
    db_name                   = var.db_name
    db_user                   = var.db_user
    db_secret_arn             = var.rds_secret_arn
    frontend_port             = var.frontend_port
    backend_port              = var.backend_port
    api_gateway_url           = var.api_gateway_url
    scraper_api_key_secret_id = var.scraper_api_key_secret_id
  }))

  tags = {
    Name        = "${var.project_name}-app"
    Environment = var.environment
  }

  lifecycle {
    ignore_changes = [ami]
  }
}

# ALB Target Group Attachment - Frontend
resource "aws_lb_target_group_attachment" "frontend" {
  target_group_arn = var.frontend_target_group_arn
  target_id        = aws_instance.app.id
  port             = var.frontend_port
}

# ALB Target Group Attachment - Backend
resource "aws_lb_target_group_attachment" "backend" {
  target_group_arn = var.backend_target_group_arn
  target_id        = aws_instance.app.id
  port             = var.backend_port
}
