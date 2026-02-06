# 機能設計書

## システム構造図

```
[Browser] → [Nginx Proxy :443]
               ├── /api/* → [Backend (NestJS) :3443]
               │                └── [MySQL 8.0 :3306]
               └── /* → [Frontend (Vite+React) :3043]

[API Gateway] → [Lambda Scraper] (スクレイピング用)
```

### 本番環境

```
[Browser] → [Route53 (dravincit.com)]
               └── [ALB (HTTPS/ACM)]
                     └── [EC2 (Amazon Linux 2023)]
                           ├── Backend (:3000 HTTP)
                           └── Frontend
                     └── [RDS MySQL 8.0]

[API Gateway] → [Lambda] (スクレイピング)
```

## アーキテクチャ

### バックエンド（DDD + CQRSパターン）

```
src/
├── domain/               # ドメイン層
│   ├── entities/         # エンティティ
│   ├── value-objects/    # 値オブジェクト
│   ├── enums/            # ドメイン列挙型
│   ├── ports/            # ポート（インターフェース）
│   └── usecases/         # ユースケース
├── application/          # アプリケーション層
│   ├── controllers/      # コントローラー
│   ├── dto/
│   │   ├── request/      # リクエストDTO
│   │   └── response/     # レスポンスDTO
│   └── *.module.ts       # NestJSモジュール定義
├── infrastructure/       # インフラストラクチャ層
│   ├── adapters/         # ポートの実装
│   └── prisma/           # Prismaクライアント
└── main.ts               # エントリーポイント
```

## データモデル定義

### ER図

```
[Stadium] 1 ──── * [Game]
                      │
                      │ deletedAt (論理削除)

[User] 1 ──── * [UserRegistrationRequest]
```

### Game（試合記録）

| カラム | 型 | 制約 | 説明 |
|--------|-----|------|------|
| id | VARCHAR (UUID) | PK | 試合ID |
| game_date | DATETIME | NOT NULL | 試合日 |
| opponent | VARCHAR | NOT NULL | 対戦相手 |
| dragons_score | INT | NOT NULL | ドラゴンズ得点 |
| opponent_score | INT | NOT NULL | 相手チーム得点 |
| result | ENUM(win,lose,draw) | NOT NULL | 試合結果 |
| stadium_id | VARCHAR (UUID) | FK → stadiums.id | スタジアムID |
| notes | TEXT | NULLABLE | メモ |
| created_at | DATETIME | NOT NULL, DEFAULT NOW | 作成日時 |
| updated_at | DATETIME | NOT NULL, AUTO UPDATE | 更新日時 |
| deleted_at | DATETIME | NULLABLE | 削除日時（論理削除） |

### Stadium（スタジアム）

| カラム | 型 | 制約 | 説明 |
|--------|-----|------|------|
| id | VARCHAR (UUID) | PK | スタジアムID |
| name | VARCHAR | NOT NULL, UNIQUE | スタジアム名 |
| created_at | DATETIME | NOT NULL, DEFAULT NOW | 作成日時 |
| updated_at | DATETIME | NOT NULL, AUTO UPDATE | 更新日時 |

### User（ユーザー）

| カラム | 型 | 制約 | 説明 |
|--------|-----|------|------|
| id | VARCHAR (UUID) | PK | ユーザーID |
| email | VARCHAR | NOT NULL, UNIQUE | メールアドレス |
| password | VARCHAR | NOT NULL | ハッシュ化パスワード |
| created_at | DATETIME | NOT NULL, DEFAULT NOW | 作成日時 |
| updated_at | DATETIME | NOT NULL, AUTO UPDATE | 更新日時 |

### UserRegistrationRequest（ユーザー登録リクエスト）

| カラム | 型 | 制約 | 説明 |
|--------|-----|------|------|
| id | VARCHAR (UUID) | PK | リクエストID |
| user_id | VARCHAR (UUID) | FK → users.id | ユーザーID |
| status | ENUM(pending,approved,rejected,banned) | NOT NULL, DEFAULT pending | ステータス |
| reason_for_rejection | TEXT | NULLABLE | 却下理由 |
| created_at | DATETIME | NOT NULL, DEFAULT NOW | 作成日時 |
| updated_at | DATETIME | NOT NULL, AUTO UPDATE | 更新日時 |

## コンポーネント設計

### バックエンド

#### エンティティ

| エンティティ | 説明 | 主要メソッド |
|---|---|---|
| Game | 試合記録 | `determineResult()`, `isVictory()` |
| User | ユーザー | `canLogin()`, `createNew()`, `fromRepository()` |

#### 値オブジェクト

| 値オブジェクト | 説明 | バリデーション |
|---|---|---|
| GameId | 試合ID | 空文字列不可 |
| GameDate | 試合日 | 未来日付不可 |
| Opponent | 対戦相手 | 空文字列不可、略称→正式名称変換 |
| Score | 得点 | 整数、0以上 |
| Stadium | スタジアム | StadiumId + StadiumName |
| StadiumId | スタジアムID | 空文字列不可 |
| StadiumName | スタジアム名 | 空文字列不可、トリム処理 |
| Notes | メモ | 空文字列はundefinedに正規化 |
| GameResult | 試合結果 | WIN/LOSE/DRAW（スコアから自動判定） |
| UserId | ユーザーID | 空文字列不可 |
| Email | メールアドレス | メール形式検証 |
| Password | パスワード | bcryptハッシュ化 |

#### ポート

| ポート | 種別 | メソッド |
|---|---|---|
| GamePort | Command/Query | `save()`, `findAll()`, `findById()`, `softDelete()` |
| BulkCreateGamePort | Command | `save()` |
| FindGameByDatePort | Query | `findByDate()` |
| UserCommandPort | Command | `save()` |
| UserQueryPort | Query | `findByEmail()`, `findById()` |

#### ユースケース

| ユースケース | 種別 | 説明 |
|---|---|---|
| GetGamesUsecase | Query | 全試合取得、DTO変換 |
| BulkCreateGameUsecase | Command | 試合一括登録（日付重複チェック付き） |
| DeleteGameUsecase | Command | 試合論理削除（存在確認付き） |

### フロントエンド

| コンポーネント | 説明 |
|---|---|
| App | ルートコンポーネント |
| GameList | 試合一覧・統計情報・削除機能 |
| GameScrapePanel | 日付指定でスクレイピング→登録 |
| DeleteConfirmDialog | 削除確認ダイアログ |
| DeleteResultDialog | 削除結果ダイアログ |

## API設計

| メソッド | エンドポイント | 概要 | リクエスト | レスポンス |
|---------|--------------|------|----------|----------|
| GET | `/api/games` | 試合一覧取得 | - | `GameResponseDto[]` |
| POST | `/api/games/bulk` | 試合一括登録 | `BulkCreateGameDto` | `BulkCreateGameResult` |
| DELETE | `/api/games/:gameId` | 試合削除 | - | 204 No Content |
| GET | `/health` | ヘルスチェック | - | 200 OK |

### 外部API（API Gateway経由）

| メソッド | エンドポイント | 概要 |
|---------|--------------|------|
| GET | `{API_GATEWAY_URL}/scrape?date={date}` | 試合結果スクレイピング |

## 画面構成

### メイン画面（GameList）

- **統計エリア**: 観戦数、勝利数、敗北数、引き分け数、勝率
- **スクレイピングパネル**: 日付選択 → 取得 → 自動登録
- **試合一覧テーブル**: 試合日、対戦相手、スコア、勝敗バッジ、スタジアム、メモ、削除ボタン
