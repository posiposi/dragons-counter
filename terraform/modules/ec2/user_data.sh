#!/bin/bash
set -e

exec > >(tee /var/log/user-data.log) 2>&1
echo "Starting user data script at $(date)"

dnf update -y

dnf install -y amazon-ssm-agent
systemctl enable amazon-ssm-agent
systemctl start amazon-ssm-agent
echo "SSM Agent status: $(systemctl is-active amazon-ssm-agent)"

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
sudo ./install auto

systemctl status codedeploy-agent
systemctl start codedeploy-agent
systemctl status codedeploy-agent
echo "CodeDeploy agent installed and started"

mkdir -p /opt/dragons-counter
cd /opt/dragons-counter

git clone ${github_repo_url} .

DB_PASSWORD=$(aws secretsmanager get-secret-value --secret-id ${db_secret_arn} --region ${aws_region} --query 'SecretString' --output text)

cat > /opt/dragons-counter/deploy/production/.env << ENVEOF
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
VITE_API_GATEWAY_URL=${api_gateway_url}
ALLOWED_ORIGINS=https://dravincit.com,https://www.dravincit.com
ENVEOF

cd /opt/dragons-counter/deploy/production
docker-compose build
docker-compose up -d

echo "Waiting for backend container to be ready..."
sleep 30

echo "Running database migrations..."
docker-compose exec -T backend npx prisma migrate deploy || \
  docker-compose exec -T backend npx prisma db push

echo "Database migrations completed"

cat > /etc/systemd/system/dragons-counter.service << 'SERVICEEOF'
[Unit]
Description=Dragons Counter Application
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/opt/dragons-counter/deploy/production
ExecStart=/usr/local/bin/docker-compose up -d
ExecStop=/usr/local/bin/docker-compose down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
SERVICEEOF

systemctl daemon-reload
systemctl enable dragons-counter.service

chown -R ec2-user:ec2-user /opt/dragons-counter

echo "User data script completed at $(date)"
