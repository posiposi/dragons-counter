# PrismaからTypeORMへの移行

## 概要

バックエンドのORMをPrisma（v6.13.x）からTypeORMへ移行する。現在Prismaで管理しているデータベーススキーマ定義、アダプター層のDB操作、シーダー、マイグレーションをすべてTypeORMベースに置き換える。DDD + CQRS + Port/Adapterアーキテクチャは維持する。

**対象テーブル:** games, stadiums, users, user_registration_requests
**対象アダプター:** GameAdapter, BulkCreateGameAdapter, FindGameByDateAdapter, UserCommandAdapter, UserQueryAdapter
**対象シーダー:** stadium.seed.ts, game.seed.ts, admin-user.seed.ts

**参考ドキュメント:**
- [TypeORM公式 - Getting Started](https://typeorm.io/docs/getting-started)
- [TypeORM公式 - DataSource Options](https://typeorm.io/docs/data-source/data-source-options)
- [TypeORM公式 - Migrations](https://typeorm.io/docs/migrations/why)
- [NestJS公式 - Database (TypeORM Integration)](https://docs.nestjs.com/techniques/database)

## 仕様分割

### 1. TypeORM基盤セットアップ + エンティティ定義

TypeORMパッケージの導入とNestJSモジュール設定、および全テーブルに対応するTypeORMエンティティの定義を行う。PrismaModuleと並行して動作する状態とし、既存機能に影響を与えない。

- `@nestjs/typeorm`, `typeorm`, `mysql2`パッケージのインストール
- `tsconfig.json`で`emitDecoratorMetadata`と`experimentalDecorators`の有効化を確認
- TypeORM DataSource設定ファイル（`data-source.ts`）の作成
  - type: "mysql", host/port/username/password/database を環境変数から取得
  - entities, migrations, synchronize: false（全環境共通。Prisma並行動作期間中はマイグレーション競合を防ぐためfalse固定）, logging設定
- `TypeOrmModule.forRoot()`による`app.module.ts`への組み込み
  - NestJS公式の`@nestjs/typeorm`インテグレーションを使用
- TypeORMエンティティクラスの定義（`@Entity`, `@Column`, `@PrimaryColumn`等のデコレータ使用）
  - GameEntity: `@ManyToOne(() => StadiumEntity)` リレーション、softDelete用の`deletedAt`カラム
  - StadiumEntity: `@OneToMany(() => GameEntity)` リレーション、name UNIQUEカラム
  - UserEntity: `@OneToMany(() => UserRegistrationRequestEntity)` リレーション、email UNIQUEカラム、role Enumカラム
  - UserRegistrationRequestEntity: `@ManyToOne(() => UserEntity)` リレーション、status Enumカラム
- Enum定義の対応（GameResult, UserRole, RegistrationStatus）
- テスト用DB接続設定（test-db向けDataSource）
- 既存Prismaとの並行動作を確認

### 2. Game系アダプターのTypeORM移行

Game関連の3つのアダプターをPrismaからTypeORMに移行する。対応するテストコードも合わせて移行する。

- GameAdapterのTypeORM実装
  - `@InjectRepository(GameEntity)`でリポジトリ注入
  - save: `repository.save()`でupsert相当の処理
  - findAll: `repository.find({ where: { deletedAt: IsNull() }, relations: { stadium: true } })`
  - findById: `repository.findOne()`
  - softDelete: `repository.update(id, { deletedAt: new Date() })`
  - ドメインオブジェクト ↔ TypeORMエンティティ間のマッピング維持
- BulkCreateGameAdapterのTypeORM実装
  - `repository.save()`による一括登録
- FindGameByDateAdapterのTypeORM実装
  - `repository.findOne({ where: { gameDate } })`
- GameModuleで`TypeOrmModule.forFeature([GameEntity, StadiumEntity])`を設定
- 各アダプターの統合テストをTypeORMベースに書き換え
  - テストモジュールでTypeOrmModule.forRoot()をテストDB向けに設定
  - beforeEach/afterEachでのテストデータ管理をTypeORMリポジトリで実装

### 3. User系アダプターのTypeORM移行

User関連の2つのアダプターをPrismaからTypeORMに移行する。対応するテストコードも合わせて移行する。

- UserCommandAdapterのTypeORM実装
  - `@InjectRepository(UserEntity)`, `@InjectRepository(UserRegistrationRequestEntity)`でリポジトリ注入
  - save: `repository.save()`でユーザー保存（新規/更新）
  - updateRegistrationStatus: 登録リクエストの作成
  - エラーハンドリング: PrismaのP2002エラーコードからTypeORMの`QueryFailedError`（ER_DUP_ENTRY）への変換
- UserQueryAdapterのTypeORM実装
  - findByEmail: `repository.findOne({ where: { email }, relations: { registrationRequests: true } })`
  - findAll: `repository.find({ relations: { registrationRequests: true } })`
- AuthModule・AdminModuleで`TypeOrmModule.forFeature([UserEntity, UserRegistrationRequestEntity])`を設定
- 各アダプターの統合テストをTypeORMベースに書き換え

### 4. シーダー移行 + Prisma完全削除

シーダーをTypeORMベースに書き換え、Prisma関連のコード・設定・依存をすべて削除する。

- シーダーのTypeORM移行
  - DataSourceを直接初期化してシード実行
  - stadium.seed.ts: `repository.upsert()`でスタジアムマスタ登録
  - game.seed.ts: `repository.save()`でテストデータ登録
  - admin-user.seed.ts: `repository.upsert()`で管理者ユーザー登録
  - TypeORMの`DataSource.transaction()`でトランザクション管理
- TypeORMマイグレーション設定
  - 既存DBスキーマとの整合確認（Prismaマイグレーション適用済みスキーマとTypeORMエンティティの一致確認）
  - `typeorm migration:generate`で初期マイグレーション生成
- Prisma関連の完全削除
  - `src/infrastructure/prisma/prisma.service.ts`の削除
  - `src/infrastructure/prisma/prisma.module.ts`の削除
  - `prisma/`ディレクトリ（schema.prisma, migrations/, seed.ts, config.ts）の削除
  - `@prisma/client`, `prisma`パッケージの削除
  - `app.module.ts`からPrismaModuleのimport削除
- Docker関連設定の調整（必要に応じて）
