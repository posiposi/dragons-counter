---
paths:
  - "backend/**/*.go"
---

# Go DDD Architecture Rules

本プロジェクトのバックエンドはドメイン駆動設計（DDD）+ CQRS パターンに従う。
既存の TypeScript 実装と同一のレイヤー構造・命名規約を Go 実装でも踏襲する。

## Layer Structure (Go)

```
backend-go/internal/
├── domain/                    # ドメイン層（ビジネスロジックの核）
│   ├── model/                 # ドメインモデル（エンティティ・値オブジェクト・列挙型・例外）
│   │                          # 全ファイルをフラットに配置する（サブディレクトリなし）
│   │                          # パッケージ名: model
│   └── repository/            # リポジトリインターフェース（抽象）
│                              # パッケージ名: repository
├── infrastructure/            # インフラ層（技術的実装詳細）
│   └── persistence/           # リポジトリ実装（sqlcベース）
│                              # パッケージ名: persistence
├── db/                        # DB接続・sqlc生成コード・トランザクションヘルパー
│   ├── sqlc/                  # sqlc自動生成コード
│   └── query/                 # sqlcクエリ定義ファイル（.sql）
└── config/                    # 設定・DSN変換
```

### Layer Structure (TypeScript / 参考)

```
backend/src/
├── domain/           # ドメイン層
│   ├── entities/     # エンティティ（集約ルート含む）
│   ├── value-objects/ # 値オブジェクト
│   ├── enums/        # ドメイン列挙型
│   ├── exceptions/   # ドメイン例外
│   ├── ports/        # ポート（インターフェース定義）
│   └── usecases/     # ユースケース（アプリケーションサービス）
│       └── read-models/ # 読み取り専用モデル（Query用）
├── application/      # アプリケーション層（HTTP/外部I/F）
│   ├── controllers/  # コントローラー
│   ├── dto/          # データ転送オブジェクト
│   │   ├── request/  # リクエストDTO
│   │   └── response/ # レスポンスDTO
│   ├── filters/      # 例外フィルター
│   └── guards/       # 認証・認可ガード
└── infrastructure/   # インフラ層（技術的実装詳細）
    ├── adapters/     # アダプター（Port実装）
    │   ├── mappers/  # ドメイン ↔ 永続化マッパー
    │   └── services/ # 外部サービスアダプター
    └── typeorm/      # ORM固有
        ├── entities/ # 永続化エンティティ
        ├── enums/    # DB列挙型
        ├── migrations/ # マイグレーション
        └── seeders/  # シードデータ
```

## File Naming Convention (Go)

| Layer | Category | Naming Pattern | Example |
|-------|----------|----------------|---------|
| domain/model | Entity | `{entity}.go` | `game.go`, `user.go`, `user_game.go` |
| domain/model | Value Object | `{name}.go` | `game_id.go`, `email.go`, `impression.go` |
| domain/model | Enum/定数 | `{name}.go` | `role.go`, `status.go` |
| domain/model | 共通基盤 | `{name}.go` | `error.go`, `id.go`, `httpstatus.go` |
| domain/repository | Repository Interface | `{entity}_repository.go` | `game_repository.go` |
| infrastructure/persistence | Repository Implementation | `{entity}_repository.go` | `game_repository.go` |
| infrastructure/persistence | テスト | `{entity}_repository_test.go` | `game_repository_test.go` |

### DTO変換の方針

- DTO（外部入出力の変換）はUseCase層で行う。独自のmapperメソッドは不要
- Update操作はドメインモデル内にCommand構造体を定義して責務を寄せる

```go
type CommandUpdateUser struct {
    RegistrationStatus RegistrationStatus
}
```

### File Naming Convention (TypeScript / 参考)

| Layer | Category | Naming Pattern | Example |
|-------|----------|----------------|---------|
| Domain | Entity | `{entity-name}.go` | `game.go`, `user.go` |
| Domain | Port (Query) | `{entity}_query_port.go` | `user_query_port.go` |
| Domain | Port (Command) | `{entity}_command_port.go` | `user_command_port.go` |
| Domain | UseCase | `{action}.usecase.go` | `get_games_usecase.go` |
| Application | Controller | `{action}.controller.go` | `get_games_controller.go` |
| Application | Request DTO | `{name}_request.dto.go` | `bulk_create_game_request_dto.go` |
| Application | Response DTO | `{name}_response.dto.go` | `game_response_dto.go` |
| Infrastructure | Adapter | `{entity}_{query|command}.adapter.go` | `user_query_adapter.go` |

## Query/Command Separation (CQRS)

Port（インターフェース）は原則として Query と Command に分離する。

### Query Port

- 読み取り専用の操作を定義する
- データを変更しない（副作用なし）
- `Find`, `Get`, `List` 等の動詞を使用する

```go
type UserQueryPort interface {
    FindByEmail(ctx context.Context, email Email) (*User, error)
    FindByID(ctx context.Context, id UserID) (*User, error)
    FindAll(ctx context.Context) ([]*User, error)
}
```

### Command Port

- 書き込み・状態変更の操作を定義する
- `Save`, `Delete`, `Update` 等の動詞を使用する

```go
type UserCommandPort interface {
    Save(ctx context.Context, user *User) (*User, error)
    UpdateRegistrationStatus(ctx context.Context, user *User) (*User, error)
}
```

### Mixed Port (例外的)

- 集約が小さく Query/Command 分離が過剰な場合のみ許容する
- 例: Game エンティティのように CRUD が単純な場合

```go
type GamePort interface {
    Save(ctx context.Context, game *Game) (*Game, error)
    FindAll(ctx context.Context) ([]*Game, error)
    FindByID(ctx context.Context, id GameID) (*Game, error)
    Delete(ctx context.Context, id GameID) (bool, error)
}
```

## Repository Implementation

- リポジトリインターフェースは `domain/repository/` に配置する
- リポジトリ実装は `infrastructure/persistence/` に配置する
- ファイル名は両方とも `{entity}_repository.go`（インターフェースと実装で同名、パッケージで区別）
- DB行→ドメインエンティティの変換はリポジトリ実装内のprivate関数で行う（独立したmapperは不要）
- 独立したmapper層は設けない（現在のサービス規模では不要）

## Dependency Rule

- Domain 層は他の層に依存しない（Port はインターフェースのみ）
- Application 層は Domain 層に依存する
- Infrastructure 層は Domain 層に依存する（Port を実装）
- Infrastructure 層の詳細が Domain/Application に漏れてはならない
