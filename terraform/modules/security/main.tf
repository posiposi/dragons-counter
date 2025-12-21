resource "aws_security_group" "ec2" {
  name_prefix = "${var.project_name}-ec2-sg-"
  description = "Security group for EC2 instances (Frontend and Backend)"
  vpc_id      = var.vpc_id

  tags = {
    Name        = "${var.project_name}-ec2-sg"
    Environment = var.environment
    Purpose     = "EC2 instances"
  }

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_vpc_security_group_ingress_rule" "ec2_from_alb_frontend" {
  security_group_id = aws_security_group.ec2.id
  description       = "Allow HTTP from ALB on port 3043 (Frontend)"

  from_port                    = 3043
  to_port                      = 3043
  ip_protocol                  = "tcp"
  referenced_security_group_id = var.alb_security_group_id

  tags = {
    Name = "allow-from-alb-frontend"
  }
}

resource "aws_vpc_security_group_ingress_rule" "ec2_from_alb_backend" {
  security_group_id = aws_security_group.ec2.id
  description       = "Allow HTTP from ALB on port 3443 (Backend)"

  from_port                    = 3443
  to_port                      = 3443
  ip_protocol                  = "tcp"
  referenced_security_group_id = var.alb_security_group_id

  tags = {
    Name = "allow-from-alb-backend"
  }
}

resource "aws_vpc_security_group_egress_rule" "ec2_all" {
  security_group_id = aws_security_group.ec2.id
  description       = "Allow all outbound traffic"

  ip_protocol = "-1"
  cidr_ipv4   = "0.0.0.0/0"

  tags = {
    Name = "allow-all-outbound"
  }
}

resource "aws_security_group" "rds" {
  name_prefix = "${var.project_name}-rds-sg-"
  description = "Security group for RDS MySQL database"
  vpc_id      = var.vpc_id

  tags = {
    Name        = "${var.project_name}-rds-sg"
    Environment = var.environment
    Purpose     = "RDS MySQL"
  }

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_vpc_security_group_ingress_rule" "rds_from_ec2" {
  security_group_id = aws_security_group.rds.id
  description       = "Allow MySQL from EC2 instances on port 3306"

  from_port                    = 3306
  to_port                      = 3306
  ip_protocol                  = "tcp"
  referenced_security_group_id = aws_security_group.ec2.id

  tags = {
    Name = "allow-from-ec2"
  }
}

resource "aws_vpc_security_group_ingress_rule" "ec2_from_bastion" {
  security_group_id = aws_security_group.ec2.id
  description       = "Allow SSH from Bastion host"

  from_port                    = 22
  to_port                      = 22
  ip_protocol                  = "tcp"
  referenced_security_group_id = var.bastion_security_group_id

  tags = {
    Name = "allow-ssh-from-bastion"
  }
}
