---
paths:
  - "backend/**/*.go"
---

# Go DDD Architecture Rules

本プロジェクトのバックエンドはドメイン駆動設計（DDD）+ CQRS パターンに従う。
既存の TypeScript 実装と同一のレイヤー構造・命名規約を Go 実装でも踏襲する。

## Layer Structure

```
backend/
└── src/
    ├── domain/           # ドメイン層（ビジネスロジックの核）
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
        └── typeorm/      # ORM固有（Go では sqlc/DB固有）
            ├── entities/ # 永続化エンティティ
            ├── enums/    # DB列挙型
            ├── migrations/ # マイグレーション
            └── seeders/  # シードデータ
```

## File Naming Convention

| Layer | Category | Naming Pattern | Example |
|-------|----------|----------------|---------|
| Domain | Entity | `{entity-name}.go` | `game.go`, `user.go` |
| Domain | Value Object | `{name}.go` | `game_id.go`, `email.go` |
| Domain | Enum | `{name}.go` | `registration_status.go` |
| Domain | Exception | `{name}_exception.go` | `game_not_found_exception.go` |
| Domain | Port (Query) | `{entity}_query_port.go` | `user_query_port.go` |
| Domain | Port (Command) | `{entity}_command_port.go` | `user_command_port.go` |
| Domain | Port (Mixed) | `{entity}_port.go` | `game_port.go` |
| Domain | UseCase | `{action}.usecase.go` | `get_games_usecase.go` |
| Domain | Read Model | `{name}.read_model.go` | `user_game_with_game_read_model.go` |
| Application | Controller | `{action}.controller.go` | `get_games_controller.go` |
| Application | Request DTO | `{name}_request.dto.go` | `bulk_create_game_request_dto.go` |
| Application | Response DTO | `{name}_response.dto.go` | `game_response_dto.go` |
| Infrastructure | Adapter (Query) | `{entity}_query.adapter.go` | `user_query_adapter.go` |
| Infrastructure | Adapter (Command) | `{entity}_command.adapter.go` | `user_command_adapter.go` |
| Infrastructure | Mapper | `{entity}.mapper.go` | `user_mapper.go` |
| Infrastructure | Service Adapter | `{name}_service.adapter.go` | `jwt_token_service_adapter.go` |

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

## Adapter Implementation

- 各 Port に対応する Adapter を infrastructure/adapters/ に配置する
- Adapter の命名: `{Entity}{Query|Command}Adapter`
- Query Adapter と Command Adapter は別ファイル・別構造体に分離する
- Mapper を使用してドメインエンティティと永続化エンティティを変換する

## Dependency Rule

- Domain 層は他の層に依存しない（Port はインターフェースのみ）
- Application 層は Domain 層に依存する
- Infrastructure 層は Domain 層に依存する（Port を実装）
- Infrastructure 層の詳細が Domain/Application に漏れてはならない
