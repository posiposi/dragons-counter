resource "aws_security_group" "ecs" {
  name_prefix = "${var.project_name}-ecs-sg-"
  description = "Security group for ECS tasks (Frontend and Backend)"
  vpc_id      = var.vpc_id

  tags = {
    Name        = "${var.project_name}-ecs-sg"
    Environment = var.environment
    Purpose     = "ECS Fargate tasks"
  }

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_vpc_security_group_ingress_rule" "ecs_from_alb" {
  security_group_id = aws_security_group.ecs.id
  description       = "Allow HTTP from ALB on port 3000"

  from_port                    = 3000
  to_port                      = 3000
  ip_protocol                  = "tcp"
  referenced_security_group_id = var.alb_security_group_id

  tags = {
    Name = "allow-from-alb"
  }
}

resource "aws_vpc_security_group_egress_rule" "ecs_all" {
  security_group_id = aws_security_group.ecs.id
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

resource "aws_vpc_security_group_ingress_rule" "rds_from_ecs" {
  security_group_id = aws_security_group.rds.id
  description       = "Allow MySQL from ECS tasks on port 3306"

  from_port                    = 3306
  to_port                      = 3306
  ip_protocol                  = "tcp"
  referenced_security_group_id = aws_security_group.ecs.id

  tags = {
    Name = "allow-from-ecs"
  }
}
