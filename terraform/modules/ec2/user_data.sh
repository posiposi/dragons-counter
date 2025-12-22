#!/bin/bash
set -e

exec > >(tee /var/log/user-data.log) 2>&1
echo "Starting user data script at $(date)"

dnf update -y

dnf install -y docker git
systemctl start docker
systemctl enable docker

usermod -aG docker ec2-user

DOCKER_COMPOSE_VERSION="v2.24.0"
curl -L "https://github.com/docker/compose/releases/download/$${DOCKER_COMPOSE_VERSION}/docker-compose-linux-x86_64" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
ln -sf /usr/local/bin/docker-compose /usr/bin/docker-compose

dnf install -y aws-cli

dnf install -y ruby wget
cd /home/ec2-user
wget https://aws-codedeploy-${aws_region}.s3.${aws_region}.amazonaws.com/latest/install
chmod +x ./install
./install auto
systemctl start codedeploy-agent
systemctl enable codedeploy-agent
echo "CodeDeploy agent installed and started"

mkdir -p /opt/dragons-counter
cd /opt/dragons-counter

git clone ${github_repo_url} .

DB_PASSWORD=$(aws secretsmanager get-secret-value --secret-id ${db_secret_arn} --region ${aws_region} --query 'SecretString' --output text)

cat > /opt/dragons-counter/.env << ENVEOF
DATABASE_URL=mysql://${db_user}:$${DB_PASSWORD}@${db_host}:3306/${db_name}
MYSQL_HOST=${db_host}
MYSQL_PORT=3306
MYSQL_DATABASE=${db_name}
MYSQL_USER=${db_user}
MYSQL_PASSWORD=$${DB_PASSWORD}
NODE_ENV=production
FRONTEND_PORT=${frontend_port}
BACKEND_PORT=${backend_port}
VITE_API_URL=/api
ENVEOF

cat > /opt/dragons-counter/docker-compose.prod.yml << 'COMPOSEEOF'
services:
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
      target: production
      args:
        VITE_API_URL: "/api"
    container_name: dragons-counter-frontend
    ports:
      - "${frontend_port}:80"
    depends_on:
      - backend
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "-q", "--spider", "http://localhost:80/"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 60s

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
      target: production
    container_name: dragons-counter-backend
    ports:
      - "${backend_port}:3000"
    env_file:
      - .env
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "-q", "--spider", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 60s
COMPOSEEOF

cd /opt/dragons-counter
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d

echo "Waiting for backend container to be ready..."
sleep 30

echo "Running database migrations..."
docker-compose -f docker-compose.prod.yml exec -T backend npx prisma migrate deploy || \
  docker-compose -f docker-compose.prod.yml exec -T backend npx prisma db push

echo "Database migrations completed"

cat > /etc/systemd/system/dragons-counter.service << 'SERVICEEOF'
[Unit]
Description=Dragons Counter Application
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/opt/dragons-counter
ExecStart=/usr/local/bin/docker-compose -f docker-compose.prod.yml up -d
ExecStop=/usr/local/bin/docker-compose -f docker-compose.prod.yml down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
SERVICEEOF

systemctl daemon-reload
systemctl enable dragons-counter.service

chown -R ec2-user:ec2-user /opt/dragons-counter

echo "User data script completed at $(date)"
