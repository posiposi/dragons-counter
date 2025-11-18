# ================================
# ALB リスナー
# ================================

# HTTPリスナー (port 80)
resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.main.arn
  port              = 80
  protocol          = "HTTP"

  # デフォルトアクション: フロントエンドへ転送
  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.frontend.arn
  }

  tags = {
    Name        = "${var.project_name}-http-listener"
    Environment = var.environment
  }
}

# HTTPリスナールール: /api/* → バックエンド
resource "aws_lb_listener_rule" "backend_api" {
  listener_arn = aws_lb_listener.http.arn
  priority     = 100

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.backend.arn
  }

  condition {
    path_pattern {
      values = ["/api/*"]
    }
  }

  tags = {
    Name        = "${var.project_name}-backend-api-rule"
    Environment = var.environment
  }
}

# HTTPリスナールール: /health → バックエンド
resource "aws_lb_listener_rule" "backend_health" {
  listener_arn = aws_lb_listener.http.arn
  priority     = 101

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.backend.arn
  }

  condition {
    path_pattern {
      values = ["/health"]
    }
  }

  tags = {
    Name        = "${var.project_name}-backend-health-rule"
    Environment = var.environment
  }
}
