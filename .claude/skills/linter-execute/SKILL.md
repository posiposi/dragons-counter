---
name: linter-execute
description: テスト通過後のlint確認・修正手順を定義するスキル。フロントエンド・バックエンドそれぞれのDockerコンテナ内でlintコマンドを実行する。TDD実装フロー内でテストPASS後に使用する。
user-invocable: false
allowed-tools: Bash
---

# Linter実行スキル

## 実行タイミング

テストがPASSした後、コミット前にlint確認を行う。

## フロントエンドのlint実行

frontendコンテナ内で下記コマンドを順に実行する。

```bash
# 1. lint確認
docker compose exec frontend npm run lint

# 2. 型チェック
docker compose exec frontend npm run typecheck

# 3. フォーマット確認
docker compose exec frontend npm run format:check
```

lintエラーがある場合はfrontendコンテナ内で自動修正を実行する。

```bash
docker compose exec frontend npm run format
```

## バックエンドのlint実行

backendコンテナ内で下記コマンドを順に実行する。

```bash
# 1. lint確認（ESLint）
docker compose exec backend npm run lint

# 2. フォーマット（Prettier）
docker compose exec backend npm run format
```

## 制約事項

- lint/formatコマンドは**必ず**Dockerコンテナ内で実行する
- フロントエンドは`lint` → `typecheck` → `format:check`の順で実行する
- エラーがある場合は`npm run format`で自動修正した後、再度確認する