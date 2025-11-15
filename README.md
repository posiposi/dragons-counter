# Dragons Counter Project

中日ドラゴンズ観戦記録アプリケーション

## プロジェクト構成

このプロジェクトは3つの独立したリポジトリで構成されています：

- **backend**: バックエンドAPI (NestJS/TypeScript/DDD)
- **frontend**: フロントエンド (Next.js/TypeScript)
- **infrastructure**: インフラ構成 (Terraform/AWS)

## 各リポジトリの管理

各ディレクトリは独立したGitリポジトリとして管理されます。

```bash
cd backend
git init
git remote add origin <backend-repo-url>

cd frontend
git init
git remote add origin <frontend-repo-url>

cd infrastructure
git init
git remote add origin <infrastructure-repo-url>
```

## 開発環境

- Docker/Docker Compose
- Node.js 20+
- TypeScript
- MySQL 8.0

## デプロイ環境

- AWS ECS (Fargate)
- GitHub Actions (CI/CD)

## アーキテクチャ

- Domain-Driven Design (DDD)
- API First Development (OpenAPI)
- Test-Driven Development (TDD)