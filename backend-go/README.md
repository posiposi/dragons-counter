# backend-go

Dragons Counter の Go 版バックエンド。TypeScript/NestJS 版（`backend/`）からの段階的移行の **Phase 0** として、DB 接続とマイグレーション基盤を提供する。

## 概要

- **DB 接続**: `internal/db` が `internal/config` の `DATABASE_URL`（`mysql://user:pass@host:port/db?...` 形式）を go-sql-driver/mysql の DSN に変換して接続する。
- **マイグレーション**: `internal/migrate` が [golang-migrate](https://github.com/golang-migrate/migrate) を用いて、`migrations/` 配下の SQL（Go の `embed` で埋め込み）を適用する。
  - マイグレーションSQLは `backend-go/migrations/*.sql` に配置され、`migrations/embed.go` の `//go:embed *.sql` によりバイナリへ埋め込まれる。
  - バージョンはファイル名の数値プレフィックスで管理する（例: `000001_init_schema.up.sql` → version `1`）。
- **起動時自動適用**: `cmd/api/main.go` はアプリ起動時に `migrate.Up(cfg)` を呼び出し、未適用のマイグレーションを最新まで適用する。適用済みで変更がない場合（`migrate.ErrNoChange`）はエラーにせず起動を続行する。

## マイグレーション運用

golang-migrate は適用状態を独自の **`schema_migrations`** テーブルで管理する。これは TypeORM が使用する **`migrations`** テーブルとは別テーブルであり、両者は衝突しない。

### 新規/空DB・テスト環境

通常の `migrate up` で全 SQL を適用する。アプリ（`backend-go`）を起動すれば `main.go` が `migrate.Up(cfg)` を実行し、自動でスキーマが構築される。空DBであれば全マイグレーションが順に適用される。

### 本番既存DB（TypeORM で既にスキーマ適用済み）

本番DBは TypeORM 版で既にテーブルが作成済みである。この状態で golang-migrate の `up` を実行すると、`CREATE TABLE` が既存テーブルと衝突してエラーになる。

そこで本番では、**既存スキーマを再実行せず、現行バージョンを「適用済み」として登録する baseline 運用**を採る。`migrate force <version>` で `schema_migrations` に現行バージョンを直接書き込み、`CREATE TABLE` を再実行させない。

> **警告**
> - `force` は `schema_migrations` テーブルの状態を強制的に書き換える操作であり、**ロールバック不可**。実行前に必ず **DB のバックアップ** を取得すること。
> - `force` 実行後は、指定バージョンまでの SQL が「適用済み」とみなされる。SQL 本体は実行されないため、DB の実スキーマと golang-migrate のバージョンが一致していることを事前に確認すること。

#### 手順（migrate CLI）

golang-migrate CLI をインストールし、マイグレーション定義（`backend-go/migrations`）と本番DBを指定して baseline を登録する。DB URL には複数ステートメント実行を許可する `multiStatements=true` を付与する（`internal/config/BuildMigrationDSN` がアプリ内では同等の指定を自動付与している）。

```bash
# 0. 事前にDBバックアップを取得（必須）
mysqldump -h <host> -u <user> -p <db> > backup_$(date +%Y%m%d_%H%M%S).sql

# 1. 現行バージョン（例: 1）を「適用済み」として schema_migrations に登録する。
#    既存スキーマの CREATE TABLE は再実行されない。
migrate \
  -source file://backend-go/migrations \
  -database "mysql://<user>:<pass>@tcp(<host>:3306)/<db>?multiStatements=true" \
  force 1

# 2. 登録状態を確認する（version が 1、dirty が false であること）
migrate \
  -source file://backend-go/migrations \
  -database "mysql://<user>:<pass>@tcp(<host>:3306)/<db>?multiStatements=true" \
  version

# 3. 以降のマイグレーションがある場合のみ up を実行する。
#    version 1 は適用済み扱いのため、version 2 以降のみが適用される。
migrate \
  -source file://backend-go/migrations \
  -database "mysql://<user>:<pass>@tcp(<host>:3306)/<db>?multiStatements=true" \
  up
```

baseline 登録後は、`backend-go` を通常どおり起動すれば `migrate.Up(cfg)` が未適用分（version 2 以降）のみを適用する。

## 開発時のマイグレーション確認方法

いずれもプロジェクトルートの `Makefile` から Docker コンテナ内で実行する。

| コマンド | 内容 |
| --- | --- |
| `make test-go` | `backend-go` のユニットテスト（`go test ./...`）を実行する。 |
| `make test-go-integration` | `test-db` に接続する integration テスト（`-tags=integration`、`internal/migrate`）を実行する。実際に `migrate.Up`/`Down` を走らせ、スキーマが TypeORM 版定義と一致することを検証する。 |
| `make migrate-go` | `backend-go` コンテナを再起動し、起動時の `migrate.Up(cfg)` を適用する。起動ログに `database connected and migrations applied` が出力されれば成功。 |

integration テストは `TEST_DATABASE_URL`（`mysql://dragons_user:dragons_password@test-db:3306/dragons_counter_test`）を用いて `test-db` に実接続する。`make test-go-integration` はこの環境変数を自動で付与する。
