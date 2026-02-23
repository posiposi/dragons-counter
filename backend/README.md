# Backend

Dragons Counter（Dra Vincit）のバックエンドAPIサーバー。

## 技術スタック

- **フレームワーク**: NestJS v11
- **言語**: TypeScript
- **ORM**: TypeORM v0.3
- **DB**: MySQL 8.0
- **認証**: Passport（JWT + Local Strategy）
- **テスト**: Jest

## アーキテクチャ

ドメイン駆動設計（DDD）のレイヤードアーキテクチャを採用しています。

```
src/
├── domain/                  # ドメイン層（ビジネスロジック）
│   ├── entities/            #   ドメインエンティティ（Game, User）
│   ├── value-objects/       #   値オブジェクト（Email, Score, GameDate 等）
│   ├── enums/               #   ドメインEnum（UserRole, RegistrationStatus）
│   ├── exceptions/          #   ドメイン例外
│   ├── ports/               #   ポート（リポジトリインターフェース）
│   └── usecases/            #   ユースケース
├── application/             # アプリケーション層（API・認証）
│   ├── controllers/         #   コントローラー（Game CRUD）
│   ├── admin/               #   管理者用コントローラー・ガード
│   ├── auth/                #   認証（JWT, Local, CSRF）
│   ├── dto/                 #   リクエスト/レスポンスDTO
│   └── filters/             #   例外フィルター
├── infrastructure/          # インフラ層（外部接続）
│   ├── adapters/            #   ポート実装（リポジトリ・外部サービス）
│   └── typeorm/             #   TypeORM設定
│       ├── entities/        #     DBエンティティ
│       ├── enums/           #     DB用Enum
│       ├── migrations/      #     マイグレーションファイル
│       └── seeders/         #     シードデータ
├── app.module.ts            # ルートモジュール
└── main.ts                  # エントリーポイント
```

## 開発環境のセットアップ

開発環境はDocker Composeで構築されています。プロジェクトルートで以下を実行してください。

```bash
# コンテナの起動
docker compose up -d

# コンテナの停止
docker compose down
```

| サービス | ポート | 用途 |
|---------|-------|------|
| backend | 3443 (HTTPS) | APIサーバー |
| db | 3306 | 開発用MySQL |
| test-db | 3307 | テスト用MySQL |

開発環境では自己署名証明書によるHTTPSで起動します。`certs/` ディレクトリに証明書を配置してください。

## コマンド一覧

すべてのコマンドはDockerコンテナ内で実行します。

### アプリケーション

```bash
# 開発サーバー起動（watchモード、コンテナ起動時に自動実行）
docker compose exec backend npm run start:dev

# ビルド
docker compose exec backend npm run build
```

### テスト

```bash
# ユニットテスト実行
docker compose exec backend npm run test

# watchモードでテスト実行
docker compose exec backend npm run test:watch

# カバレッジ付きテスト
docker compose exec backend npm run test:cov

# E2Eテスト
docker compose exec backend npm run test:e2e
```

### コード品質

```bash
# フォーマット（Prettier）
docker compose exec backend npm run format

# リント（ESLint）
docker compose exec backend npm run lint
```

### シード

```bash
# 初期データ投入（スタジアム・管理者ユーザー）
docker compose exec backend npm run seed
```

## データベースマイグレーション

TypeORMのマイグレーション機能でDBスキーマを管理しています。`synchronize: false` のため、エンティティを変更しただけではDBに反映されません。

### スキーマ変更時のフロー

1. エンティティファイル（`src/infrastructure/typeorm/entities/`）を修正する
2. マイグレーションファイルを生成する
3. 生成されたクラスを `src/infrastructure/typeorm/data-source.ts` の `migrations` 配列にimport・登録する
4. マイグレーションを実行してDBに反映する

### よく使うコマンド

```bash
# マイグレーションファイルの生成（エンティティとDB差分から自動生成）
docker compose exec backend npm run migration:generate -- src/infrastructure/typeorm/migrations/<マイグレーション名>

# マイグレーションの実行（未実行分のみDBに適用）
docker compose exec backend npm run migration:run

# 直近1件のマイグレーションを取り消す
docker compose exec backend npm run migration:revert

# マイグレーションの実行状況を確認する
docker compose exec backend npm run migration:show
```

### 注意事項

- マイグレーションファイル生成後、`data-source.ts` の `migrations` 配列へのクラス登録を忘れないこと
- `migration:generate` はエンティティと現在のDB状態を比較して差分を生成するため、DBが最新の状態であることを確認してから実行すること

## 環境変数

プロジェクトルートの `.env` で設定します。必要な環境変数については `.env` のテンプレートまたはプロジェクト管理者に確認してください。
