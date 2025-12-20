# Dragons Counter Project

中日ドラゴンズ観戦記録アプリケーション

## プロジェクト構成

このプロジェクトは3つの独立したリポジトリで構成されています：

- **backend**: バックエンドAPI (NestJS/TypeScript/DDD)
- **frontend**: フロントエンド (Vite + React/TypeScript)
- **terraform**: インフラ構成 (Terraform/AWS)

## 各リポジトリの管理

各ディレクトリは独立したGitリポジトリとして管理されます。

```bash
cd backend
git init
git remote add origin <backend-repo-url>

cd frontend
git init
git remote add origin <frontend-repo-url>

cd terraform
git init
git remote add origin <terraform-repo-url>
```

## 開発環境

- Docker/Docker Compose
- Node.js 20+
- TypeScript
- MySQL 8.0

## デプロイ環境

- AWS EC2 + ALB
- GitHub Actions (CI/CD)

## アーキテクチャ

- Domain-Driven Design (DDD)
- API First Development (OpenAPI)
- Test-Driven Development (TDD)