# ================================
# パブリックサブネット（ALB用）
# ================================

# Availability Zones のデータソース
data "aws_availability_zones" "available" {
  state = "available"
}

# パブリックサブネット 1（ALB用 - AZ1）
resource "aws_subnet" "public_1" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = var.public_subnet_1_cidr
  availability_zone       = data.aws_availability_zones.available.names[0]
  map_public_ip_on_launch = true

  tags = {
    Name        = "${var.project_name}-public-subnet-1"
    Environment = var.environment
    Type        = "public"
    Purpose     = "ALB"
    AZ          = data.aws_availability_zones.available.names[0]
  }
}

# パブリックサブネット 2（ALB用 - AZ2）
resource "aws_subnet" "public_2" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = var.public_subnet_2_cidr
  availability_zone       = data.aws_availability_zones.available.names[1]
  map_public_ip_on_launch = true

  tags = {
    Name        = "${var.project_name}-public-subnet-2"
    Environment = var.environment
    Type        = "public"
    Purpose     = "ALB"
    AZ          = data.aws_availability_zones.available.names[1]
  }
}
