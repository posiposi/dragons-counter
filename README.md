# Dra Vincit

中日ドラゴンズファン向け野球観戦記録アプリケーション

> [!WARNING]
> アプリケーションサーバーはコスト観点から停止中です

## アプリケーション名の由来

中日ドラゴンズの略称である`ドラ`、名古屋弁で「すごい」を意味する`どら`に、ラテン語で勝利を意味する`Vincere`の三人称単数を掛けています。

- ドラゴンズの勝利
- すごく沢山勝利する

上記の意味合いを込めています。

## プロジェクト構成

```
dra-vincit/
├── backend/     # NestJS/TypeScript API（DDD）
├── frontend/    # Vite + React/TypeScript
├── terraform/   # AWS インフラ構成
```

## 技術スタック

### バックエンド

- NestJS / TypeScript
- TypeORM
- MySQL 8.0
- Domain-Driven Design (DDD)

### フロントエンド

- Vite 6 + React 19
- TypeScript
- CSS Modules

### インフラ

- AWS (EC2 / ALB / RDS / VPC)
- Terraform
- Docker / Docker Compose

## インフラ構成

```
┌─────────────────────────────────────────────────────────────┐
│                         AWS VPC                             │
│                                                             │
│  ┌─────────────────────┐    ┌─────────────────────────┐     │
│  │  Public Subnet      │    │  Private Subnet         │     │
│  │                     │    │                         │     │
│  │  ┌───────────────┐  │    │  ┌─────────────────┐    │     │
│  │  │     ALB       │──┼────┼─▶│      EC2        │    │     │
│  │  │  (HTTPS/443)  │  │    │  │  (Backend API)  │    │     │
│  │  └───────────────┘  │    │  │  (Frontend)     │    │     │
│  │                     │    │  └────────┬────────┘    │     │
│  │  ┌───────────────┐  │    │           │             │     │
│  │  │  NAT Gateway  │  │    │  ┌────────▼────────┐    │     │
│  │  └───────────────┘  │    │  │      RDS        │    │     │
│  │                     │    │  │    (MySQL)      │    │     │
│  └─────────────────────┘    │  └─────────────────┘    │     │
│                             └─────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

### セキュアな EC2 アクセス

EC2 インスタンスはプライベートサブネットに配置され、SSH ポートは開放していません。
サーバーへのアクセスは **AWS Systems Manager (SSM) Session Manager** を使用します。

## CI/CD パイプライン

GitHub Actions + AWS CodeDeploy による自動デプロイ:

```
┌──────────┐    ┌────────────────┐    ┌─────────────┐    ┌──────┐
│  GitHub  │───▶│ GitHub Actions │───▶│  CodeDeploy │───▶│  EC2 │
│   Push   │    │   (CI/Build)   │    │  (Deploy)   │    │      │
└──────────┘    └────────────────┘    └─────────────┘    └──────┘
```

### ワークフロー

| ワークフロー      | トリガー  | 内容                      |
| ----------------- | --------- | ------------------------- |
| `backend-ci.yml`  | PR        | Lint + Test               |
| `frontend-ci.yml` | PR        | Lint + TypeCheck + Format |
| `deploy.yml`      | main push | CodeDeploy デプロイ       |

## 開発方針

- **API First**: OpenAPI 仕様に準拠
- **TDD**: テスト駆動開発
- **DDD**: ドメイン駆動設計

## ライセンス

Private
