#!/bin/bash
set -e

# Log output to file
exec > >(tee /var/log/user-data.log) 2>&1
echo "Starting user data script at $(date)"

# Update system packages
dnf update -y

# Install Docker
dnf install -y docker
systemctl start docker
systemctl enable docker

# Add ec2-user to docker group
usermod -aG docker ec2-user

# Install Docker Compose
DOCKER_COMPOSE_VERSION="v2.24.0"
curl -L "https://github.com/docker/compose/releases/download/$${DOCKER_COMPOSE_VERSION}/docker-compose-linux-x86_64" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
ln -sf /usr/local/bin/docker-compose /usr/bin/docker-compose

# Install AWS CLI (already installed on Amazon Linux 2023, but ensure it's up to date)
dnf install -y aws-cli

# Create app directory
mkdir -p /opt/dragons-counter
cd /opt/dragons-counter

# Login to ECR
aws ecr get-login-password --region ${aws_region} | docker login --username AWS --password-stdin $(echo ${frontend_repo_url} | cut -d'/' -f1)

# Get database password from Secrets Manager
DB_PASSWORD=$(aws secretsmanager get-secret-value --secret-id ${db_secret_arn} --region ${aws_region} --query 'SecretString' --output text)

# Create environment file
cat > /opt/dragons-counter/.env << 'ENVEOF'
# Database Configuration
DATABASE_URL=mysql://${db_user}:$${DB_PASSWORD}@${db_host}:3306/${db_name}
MYSQL_HOST=${db_host}
MYSQL_PORT=3306
MYSQL_DATABASE=${db_name}
MYSQL_USER=${db_user}
MYSQL_PASSWORD=$${DB_PASSWORD}

# Application Configuration
NODE_ENV=production
FRONTEND_PORT=${frontend_port}
BACKEND_PORT=${backend_port}
ENVEOF

# Create docker-compose.yml for production
cat > /opt/dragons-counter/docker-compose.yml << 'COMPOSEEOF'
services:
  frontend:
    image: ${frontend_repo_url}:latest
    container_name: dragons-counter-frontend
    ports:
      - "${frontend_port}:3000"
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_API_URL=http://backend:3000
    depends_on:
      - backend
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  backend:
    image: ${backend_repo_url}:latest
    container_name: dragons-counter-backend
    ports:
      - "${backend_port}:3000"
    env_file:
      - .env
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
COMPOSEEOF

# Pull images and start containers
docker-compose pull
docker-compose up -d

# Create systemd service for auto-start on reboot
cat > /etc/systemd/system/dragons-counter.service << 'SERVICEEOF'
[Unit]
Description=Dragons Counter Application
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/opt/dragons-counter
ExecStart=/usr/local/bin/docker-compose up -d
ExecStop=/usr/local/bin/docker-compose down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
SERVICEEOF

systemctl daemon-reload
systemctl enable dragons-counter.service

echo "User data script completed at $(date)"
