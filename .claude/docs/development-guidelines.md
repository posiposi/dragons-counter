# 開発ガイドライン

## 技術スタック

### バックエンド

| 技術 | バージョン |
|------|----------|
| Node.js | 24.6.0 |
| NestJS | 11.x |
| TypeScript | 5.9.x |
| TypeORM | 0.3.x |
| MySQL | 8.0 |
| Jest | 30.x |
| bcrypt | 6.x |
| class-validator | 0.14.x |

### フロントエンド

| 技術 | バージョン |
|------|----------|
| React | 19.x |
| TypeScript | 5.7.x |
| Vite | 6.x |
| lucide-react | 0.541.x |

### インフラ

| 技術 | 用途 |
|------|------|
| Docker / Docker Compose | ローカル開発環境 |
| Nginx | リバースプロキシ |
| AWS EC2 | アプリケーションサーバー |
| AWS ALB | ロードバランサー |
| AWS RDS (MySQL) | データベース |
| AWS Lambda + API Gateway | スクレイピング |
| AWS CodeDeploy | デプロイ |
| Terraform | IaC |
| GitHub Actions | CI/CD |

## コーディング規約

### 共通

- ファイル名はケバブケースを使用する
- テストファイルは `*.spec.ts` の形式で、テスト対象と同じディレクトリに配置する

### バックエンド

#### フォーマッター

- Prettier使用
- シングルクォート、トレイリングカンマ

#### リンター

- ESLint 9（Flat Config形式）
- TypeScript ESLint + Prettier統合

#### DDD規約

`.claude/skills/typescript-ddd-standards/SKILL.md` に詳細を定義。主要な原則：

- **ドメイン層はフレームワークに依存しない**
- **値オブジェクトは不変**（readonly + private、getterでアクセス）
- **ファクトリメソッドでインスタンス生成**（コンストラクタはprivate）
- **Port/Adapterパターン**で依存性を逆転
- **CQRSパターン**でCommand/Queryを分離

### フロントエンド

#### フォーマッター

- Prettier使用
- ダブルクォート、セミコロンあり、トレイリングカンマ

#### リンター

- ESLint 9（Flat Config形式）
- React Hooks規約、React Refresh対応

#### パスエイリアス

- `@/*` → `./src/*`

## 命名規則

### バックエンド

| 種類 | パターン | 例 |
|------|---------|-----|
| エンティティ | `{entity-name}.ts` | `game.ts`, `user.ts` |
| 値オブジェクト | `{value-object-name}.ts` | `game-date.ts`, `stadium-id.ts` |
| ユースケース | `{verb}-{noun}.usecase.ts` | `get-games.usecase.ts`, `delete-game.usecase.ts` |
| コントローラー | `{verb}-{noun}.controller.ts` | `get-games.controller.ts` |
| ポート | `{port-name}.port.ts` | `game.port.ts`, `user-command.port.ts` |
| アダプター | `{adapter-name}.adapter.ts` | `game.adapter.ts`, `user-query.adapter.ts` |
| リクエストDTO | `{feature}.dto.ts` | `bulk-create-game.dto.ts` |
| レスポンスDTO | `{feature}-response.dto.ts` | `game-response.dto.ts` |
| モジュール | `{feature}.module.ts` | `game.module.ts` |
| テスト | `{対象ファイル名}.spec.ts` | `game.spec.ts`, `get-games.usecase.spec.ts` |

### フロントエンド

| 種類 | パターン | 例 |
|------|---------|-----|
| コンポーネント | `{ComponentName}.tsx`（パスカルケース） | `GameList.tsx`, `DeleteConfirmDialog.tsx` |
| API通信 | `{feature}.ts` | `games.ts`, `scrape.ts` |
| 型定義 | `{type-name}.ts` | `game.ts` |

### DIトークン

- ポートインターフェース名をそのまま文字列トークンとして使用する
- 例: `'GamePort'`, `'UserCommandPort'`, `'UserQueryPort'`

## テスト規約

### テスト実行

**重要**: テストは必ずDockerコンテナ内で実行する。

```bash
# 全テスト実行
docker compose exec backend npm run test

# 特定のテスト実行
docker compose exec backend npm run test -- /src/path/to/test.spec.ts
```

### テストパターン

#### 値オブジェクト・エンティティ（ドメイン層）

- モック不要。純粋なロジックテスト
- `it.each` / `test.each` でパラメータ化テストを活用
- 正常系・異常系・境界値をカバー
- テスト名は日本語で期待する振る舞いを記述

#### ユースケース

- NestJSの`Test.createTestingModule`でDIコンテナをセットアップ
- Portを`jest.fn()`でモック化
- `jest.spyOn()`でメソッド呼び出しを検証

#### コントローラー

- UseCaseを`jest.fn()`でモック化
- レスポンスの形式を検証

#### アダプター（統合テスト）

- 実際のテスト用DBを使用
- `beforeAll`でテストデータセットアップ（`upsert`で冪等性確保）
- `afterAll`でクリーンアップ
- `$transaction`でロールバック可能なテスト
- テストスイートごとに固定UUIDプレフィックスでデータを分離

### CI

- GitHub Actionsでバックエンドのテスト・リンター、フロントエンドのリンター・型チェック・フォーマットチェックを実行
- テスト用MySQLサービスコンテナを使用

## 開発環境

### ローカル起動

```bash
docker compose up
```

| サービス | ポート | プロトコル |
|----------|--------|----------|
| frontend | 3043 | HTTPS |
| backend | 3443 | HTTPS |
| proxy | 443 | HTTPS |
| db | 3306 | TCP |
| test-db | 3307 | TCP |
| api-docs | 8080 | HTTP |

### 環境変数

- `.env` - 開発環境設定
- `.env.test` - テスト環境設定
- `ALLOWED_ORIGINS` - CORS許可オリジン（カンマ区切り）
- `DATABASE_URL` - データベース接続URL
- `API_GATEWAY_URL` - スクレイピングAPI Gateway URL（バックエンド用）
- `API_GATEWAY_API_KEY` - スクレイピングAPI Gatewayキー（バックエンド用）