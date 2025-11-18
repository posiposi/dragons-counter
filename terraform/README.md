# Terraform Infrastructure

Dragons Counter の AWS インフラストラクチャを Terraform で管理します。

## 構成

- **ECS Fargate**: コンテナ実行環境
- **RDS for MySQL**: データベース
- **VPC**: ネットワーク（パブリック/プライベートサブネット）
- **ALB**: Application Load Balancer
- **ECR**: Docker イメージレジストリ
- **VPC Endpoints**: ECR、Secrets Manager、S3（NAT Gateway不使用）

## ディレクトリ構成

```
terraform/
├── environments/
│   └── production/          # 本番環境設定
│       ├── main.tf
│       ├── variables.tf
│       ├── outputs.tf
│       └── terraform.tfvars.example
└── modules/
    └── networking/          # VPC、サブネット、VPC Endpoints
        ├── vpc.tf
        ├── variables.tf
        └── outputs.tf
```

## 使用方法

### 初回セットアップ

```bash
cd terraform/environments/production

# 変数ファイルの作成
cp terraform.tfvars.example terraform.tfvars

# 必要に応じて terraform.tfvars を編集
vim terraform.tfvars

# Terraform初期化
terraform init

# プラン確認
terraform plan

# 適用
terraform apply
```

### リソースの確認

```bash
# 作成されたリソースの確認
terraform show

# 出力値の確認
terraform output
```

### リソースの削除

```bash
terraform destroy
```

## 注意事項

- `terraform.tfvars` は機密情報を含むため `.gitignore` で除外されています
- 本番環境の変更は必ず `terraform plan` で確認してから `apply` してください
- State ファイルは将来的に S3 バックエンドで管理することを推奨します
