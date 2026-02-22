# Issue #136 コード調査結果: シーダー移行 + Prisma完全削除

## 調査日: 2026-02-22

## 概要
Issue #136「シーダー移行 + Prisma完全削除」に関連する既存コードを調査しました。
現在プロジェクトはPrismaとTypeORMの両方を使用している過渡期の状態です。

---

## 1. 現在のシーダー関連コード

### ファイル構成
```
backend/prisma/
├── seed.ts                   # メインシーダースクリプト
├── seeders/
│   ├── stadium.seed.ts      # スタジアムシード
│   ├── game.seed.ts         # ゲームシード
│   └── admin-user.seed.ts   # 管理者ユーザーシード
├── schema.prisma            # Prismaスキーマ（データベース定義）
├── migrations/              # マイグレーション履歴
└── config.ts                # なし（prisma.config.tsが存在）
```

### seed.ts の構造
- PrismaClientを使用してシードを実行
- 環境変数NODE_ENVに基づいて実行内容を分岐
  - 本番環境: stadiums, admin-userのみシード
  - 開発環境: stadiums, admin-user, gamesをシード
- seeders以下の3つのシーダー関数を順次実行

### 各シーダーの詳細

#### stadium.seed.ts
- 12個の野球スタジアムをデータベースに登録
- upsert操作（create or update）を使用
- 固定のUUIDを使用して管理

#### admin-user.seed.ts
- 環境変数から管理者のメールアドレスとパスワードを取得
- bcryptでパスワードをハッシュ化
- User及びUserRegistrationRequestレコードを作成
- 既に存在する場合はスキップ

#### game.seed.ts
- 開発環境のみで実行される
- 9個のゲームデータを作成
- トランザクション内で既存レコードをクリアして新規作成

### package.jsonのシーダー実行方法
- `prisma.config.ts` で定義: `seed: 'ts-node prisma/seed.ts'`
- `npm run seed` で実行可能（直接記載なし、prisma CLIで実行）

---

## 2. Prisma関連の全ファイル

### Prismaクライアント
```
backend/src/infrastructure/prisma/
├── prisma.module.ts        # NestJSモジュール定義
└── prisma.service.ts       # PrismaClientラッパーサービス

backend/prisma/
├── schema.prisma           # スキーマ定義
├── seed.ts                 # エントリーポイント
└── seeders/                # シーダー関数群
```

### PrismaService実装
- PrismaClientを継承
- OnModuleInit/OnModuleDestroyを実装
- NestJSのライフサイクルフックと連携

### PrismaModule実装
- グローバルモジュール（@Global()）
- PrismaServiceとPrismaClientを提供
- DIコンテナ経由で全モジュールから利用可能

### Prismマイグレーション
```
migrations/
├── 20250818104614_init
├── 20260119133402_created_stadiums_table
├── 20260123085606_add_stadium_relation_to_game
└── 20260207054945_add_role_to_user
```

### Prismaスキーマで定義されるモデル
- Game: ゲーム情報（id, gameDate, opponent, dragonsScore, opponentScore, result, stadiumId, notes）
- Stadium: スタジアム情報（id, name）
- User: ユーザー（id, email, password, role）
- UserRegistrationRequest: ユーザー登録リクエスト（id, userId, status, reasonForRejection）
- Enum: GameResult（WIN, LOSE, DRAW）, UserRole（USER, ADMIN）, RegistrationStatus（PENDING, APPROVED, REJECTED, BANNED）

---

## 3. TypeORMの現在の設定

### ファイル構成
```
backend/src/infrastructure/typeorm/
├── typeorm.module.ts                # TypeORMモジュール定義
├── data-source.ts                   # DataSource設定
├── entities/
│   ├── index.ts
│   ├── game.entity.ts
│   ├── stadium.entity.ts
│   ├── user.entity.ts
│   └── user-registration-request.entity.ts
└── enums/
    ├── index.ts
    ├── game-result.enum.ts
    ├── registration-status.enum.ts
    └── user-role.enum.ts
```

### TypeOrmModule定義
- dataSourceOptionsを使用して初期化
- データベースURL解析ロジック実装済み

### TypeORMエンティティ
- StadiumEntity: Prismastadiumモデルに対応
- GameEntity: Prismaゲームモデルに対応
- UserEntity: Prismaユーザーモデルに対応
- UserRegistrationRequestEntity: 登録リクエストモデルに対応

### TypeORM Enumクラス
- GameResultEnum, UserRoleEnum, RegistrationStatusEnum
- Prismaのenumと互換性あり

---

## 4. Docker関連設定

### docker-compose.yml
- db: MySQL 8.0コンテナ
- test-db: テスト用MySQL 8.0コンテナ（ポート3307）
- backend: NestJSアプリケーション

### Dockerfile
```
開発ステージ (development):
- node:24.6.0-alpine
- Copypeachprism ./prisma/
- npm ci実行
- npx prisma generate実行

本番ステージ (production):
- dependencies: dev依存除外
- builder: ビルド実行
- production: 本番実行
- prisma generate実行（3段階すべてで実行）
```

**重要**: 現在Dockerfileの全ステージで `npx prisma generate` が実行されている

---

## 5. package.json の依存関係

### Prisma関連
```json
"@prisma/client": "^6.13.0",
"prisma": "^6.13.0"
```

### TypeORM関連
```json
"@nestjs/typeorm": "^11.0.0",
"typeorm": "^0.3.28"
```

### スクリプト
- `prisma.config.ts` に定義: `seed: 'ts-node prisma/seed.ts'`
- 利用可能: `npx prisma db seed`

---

## 6. app.module.ts の構成

```typescript
imports: [
  PrismaModule,      // グローバルモジュール
  TypeormModule,     // TypeORMモジュール
  GameModule,
  AuthModule,
  AdminModule,
  ScrapingModule,
],
```

**特徴**: PrismaModuleはグローバルモジュールのため、全モジュールから利用可能

---

## 7. 既存実装での利用状況

### ドメイン層: Prismadependency
```
src/domain/enums/
├── user-role.ts              # PrismaUserRoleをimport
├── registration-status.ts    # PrismaRegistrationStatusをimport
```

**問題点**: ドメイン層がPrismaに依存しているため、完全なドメイン独立性が達成されていない

### アダプター層: TypeORM migration済み
```
src/infrastructure/adapters/
├── user-command.adapter.ts     # @InjectRepository(UserEntity)使用
├── user-query.adapter.ts       # TypeORMで実装済み
├── game.adapter.ts             # TypeORMで実装済み
├── mappers/
│   └── user.mapper.ts
└── ...その他アダプター
```

**現状**: アダプター層はTypeORMで実装済み。Prismaサービスは使用されていない

---

## 8. 現在のPrismaの役割と依存関係

### 実際に使用されている場所
1. **domain/enums**: 列挙型の定義と変換（PrismaUserRole, PrismaRegistrationStatus）
2. **prisma/seeders**: 初期データ投入

### 実際には使用されていない場所
- データ永続化: アダプター層はTypeORMで実装済み
- NestJSモジュール構成内では不要

### 現在のPrismaModule
- グローバルモジュールだが、実コードでは使用されていない
- テストでのモック化の対象（typeorm-integration.spec.ts）

---

## 9. シーダー関連の実行フロー

### 現在の実行方法
```bash
docker compose exec backend npx prisma db seed
# または
docker compose exec backend npm run seed （若し設定されていれば）
```

### seedersの実行順序
1. seedStadiums() - スタジアム12個をupsert
2. seedAdminUser() - 管理者ユーザーを作成
3. seedGames() - 開発環境のみゲームデータ9個を作成

### 環境変数依存
- ADMIN_EMAIL: 管理者メールアドレス
- ADMIN_DEFAULT_PASSWORD: 管理者パスワード
- NODE_ENV: 環境判定（production/development）

---

## 10. 技術的制約と考慮事項

### Prismaスキーマの状態
- 4つのマイグレーションが適用済み
- Prismaスキーマと TypeORMエンティティが両方存在（重複管理）

### 環境設定
- `.env`: DATABASE_URL定義
- `.env.test`: TEST_DATABASE_URL定義
- Docker環境での実行を想定

### ドメイン層の独立性
- user-role.ts, registration-status.ts がPrismaに依存
- 完全なドメイン独立化にはこれらの変更が必要

### Enum変換実装
- user-role.ts: UserRole.toPrisma(), UserRole.fromPrisma()
- registration-status.ts: 同様の双方向変換メソッド

---

## 11. 影響範囲の分析

### Prisma完全削除時に変更が必要なファイル

#### 高リスク（必須）
1. **domain/enums/user-role.ts**
   - PrismaUserRoleへの依存削除
   - toPrisma/fromPrismaメソッド削除（不要になる）
   - ドメインenumのみに変更

2. **domain/enums/registration-status.ts**
   - 同様に修正

3. **app.module.ts**
   - PrismaModuleのimport削除

4. **infrastructure/prisma/**
   - prisma.module.ts削除
   - prisma.service.ts削除

5. **prisma/**ディレクトリ全体
   - schema.prisma削除
   - migrations/削除
   - seed.ts削除
   - seeders/削除
   - prisma.config.ts削除

#### 中リスク（確認推奨）
1. **Dockerfile**
   - `COPY prisma ./prisma/` 削除
   - `npx prisma generate` 削除

2. **package.json**
   - @prisma/client削除
   - prisma削除

#### 低リスク（参考用）
1. **typeorm-integration.spec.ts**
   - PrismaModule/PrismaService のmockを削除可能

2. **package.json のnpxスクリプト**
   - Prismadependency削除後も無視される

---

## 12. データベーススキーマの同期状況

### 現状
- Prismaスキーマと TypeORMエンティティの両方が存在
- 両者のスキーマは同一（games, stadiums, users, user_registration_requests）

### 移行後
- TypeORMエンティティのみで管理
- マイグレーション管理はTypeORM/flyway等に切り替え
- Prisma関連ファイルは削除対象

---

## 13. CI/CD への影響

### 現在
- Docker buildプロセスで `npx prisma generate` が実行される
- 本番環境でもseederが実行されない（NODE_ENV=production判定）

### 変更後
- Prismaジェネレータ実行が不要
- Dockerビルドステップ簡略化
- シーダー実装をTypeORMベースに置き換え

---

## まとめ: 移行作業の主要変更点

### 削除対象
1. Prisma依存ファイル（schema.prisma, migrations/, seeders/）
2. PrismaModule, PrismaService
3. npm依存（@prisma/client, prisma）
4. domain/enumsのPrismaimport
5. Dockerfile内のprismaコマンド

### 追加/修正対象
1. TypeORMベースのシーダー実装
2. domain/enumsのスタンドアロン実装
3. マイグレーション管理方式の確認

### 検証対象
1. typeorm-integration.spec.ts のテスト状態
2. アダプター層が問題なく動作するか

---

