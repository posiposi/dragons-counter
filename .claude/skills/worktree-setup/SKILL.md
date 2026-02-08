---
name: worktree-setup
description: git worktreeを使用した並列開発環境のセットアップ手順を定義するスキル。ワークツリーの作成・削除、Dockerポート競合回避、環境変数の設定を網羅する。
user-invocable: true
allowed-tools: Read, Glob, Grep, Bash, Write, Edit
---

# Worktreeセットアップスキル

git worktreeを使用してclaude codeの並列開発環境を構築する手順を定義する。

## ワークツリーの作成

### 1. ワークツリーの作成コマンド

`main`ブランチから新しいブランチを切り出し、`.worktrees/`配下にワークツリーを作成する。

```bash
git worktree add .worktrees/<branch-name> -b <branch-name> main
```

- **配置先**: リポジトリルートの `.worktrees/` ディレクトリ配下
- **ディレクトリ名**: ブランチ名と同名
- **ブランチの切り出し元**: 常に `main` ブランチ

### 2. 環境変数ファイルのコピー

プロジェクトルートの `.env` をワークツリーディレクトリにコピーする。

```bash
cp .env .worktrees/<branch-name>/.env
```

### 3. Dockerポート競合の回避

各ワークツリーではメインのプロジェクトとDockerコンテナのポートが競合するため、`docker-compose.override.yml` を作成してポートをオフセットする。

#### デフォルトポート（メインプロジェクト）

| サービス  | ホストポート | コンテナポート |
| --------- | ------------ | -------------- |
| db        | 3306         | 3306           |
| test-db   | 3307         | 3306           |
| backend   | 3443         | 3443           |
| frontend  | 3043         | 3043           |
| api-docs  | 8080         | 80             |
| proxy     | 443          | 443            |

#### ワークツリー用のポートオフセット

ワークツリーごとにポートオフセットを適用する。ワークツリーの番号（1, 2, 3...）に応じてオフセット値を決定する。

- **オフセット値**: ワークツリー番号 × 100

例: ワークツリー1の場合（オフセット +100）

```yaml
# .worktrees/<branch-name>/docker-compose.override.yml
services:
  db:
    ports:
      - "3406:3306"
  test-db:
    ports:
      - "3407:3306"
  backend:
    ports:
      - "3543:3443"
    environment:
      HTTPS_PORT: 3543
  frontend:
    ports:
      - "3143:3043"
  api-docs:
    ports:
      - "8180:80"
  proxy:
    ports:
      - "543:443"
```

**オフセット番号の決定方法**: 既存の `.worktrees/` 内のディレクトリ数を数え、次の番号を割り当てる。

```bash
# 既存のワークツリー数を取得（0なら次は1）
ls -d .worktrees/*/ 2>/dev/null | wc -l
```

#### docker-compose.override.yml の生成

ワークツリーディレクトリ内に `docker-compose.override.yml` を以下の内容で生成する。

`<OFFSET>` は `ワークツリー番号 × 100` で計算した値に置き換えること。

```yaml
services:
  db:
    ports:
      - "${DB_PORT:-<3306+OFFSET>}:3306"
  test-db:
    ports:
      - "${TEST_DB_PORT:-<3307+OFFSET>}:3306"
  backend:
    ports:
      - "${BACKEND_PORT:-<3443+OFFSET>}:3443"
    environment:
      HTTPS_PORT: ${BACKEND_PORT:-<3443+OFFSET>}
  frontend:
    ports:
      - "${FRONTEND_PORT:-<3043+OFFSET>}:3043"
  api-docs:
    ports:
      - "${API_DOCS_PORT:-<8080+OFFSET>}:80"
  proxy:
    ports:
      - "${PROXY_PORT:-<443+OFFSET>}:443"
```

### 4. npm install の実行

ワークツリーディレクトリ内でDockerコンテナを起動し、依存パッケージをインストールする。

```bash
cd .worktrees/<branch-name>
docker compose up -d
docker compose exec backend npm install
docker compose exec frontend npm install
```

## ワークツリーの削除

作業完了後、ワークツリーを削除する。

```bash
# Dockerコンテナの停止・削除
cd .worktrees/<branch-name>
docker compose down -v

# ワークツリーの削除
cd <repository-root>
git worktree remove .worktrees/<branch-name>
```

## セットアップ手順まとめ

1. `git worktree add .worktrees/<branch-name> -b <branch-name> main`
2. `cp .env .worktrees/<branch-name>/.env`
3. `.worktrees/<branch-name>/docker-compose.override.yml` を生成（ポートオフセット適用）
4. `cd .worktrees/<branch-name> && docker compose up -d`
5. `docker compose exec backend npm install`
6. `docker compose exec frontend npm install`
7. ワークツリーディレクトリ内で開発作業を実施

## 注意事項

- 同じブランチを複数のワークツリーで同時にチェックアウトすることはできない
- ワークツリー内での `git commit` はそのワークツリーのブランチに対して行われる
- `.worktrees/` は `.gitignore` に登録済みのため、git管理外となる
- メインプロジェクトのDockerコンテナが起動中の場合、先にポート使用状況を確認すること
