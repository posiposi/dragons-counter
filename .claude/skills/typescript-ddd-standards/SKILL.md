---
name: typescript-ddd-standards
description: ドメイン駆動設計(以下DDD)におけるTypeScriptの開発規約。バックエンドでのTypescriptコード作成時に使用する。各レイヤーでの実装パターンを定義。
allowed-tools: Read, Grep, Glob
---

# TypeScriptドメイン駆動設計開発規約

## ドメイン層

ドメイン層はビジネスロジックの中核を担う層であり、他の層に依存してはならない。

### 共通原則

#### インスタンス生成規則

- クラスのインスタンスは`new`キーワードで直接生成せず、**必ず**ファクトリメソッドを使用する
- コンストラクタは`private`として外部からの直接呼び出しを禁止する
- ファクトリメソッドは`create`または意図を表す名前（`fromPrimitives`、`reconstruct`等）を使用する
- ファクトリメソッド内でバリデーションを行い、不正な状態のオブジェクト生成を防ぐ
- バリデーション失敗時は`Result`パターンまたはドメイン例外をスローする

#### 不変性の原則

- ドメインオブジェクトは**不変（イミュータブル）**として設計する
- プロパティは`readonly`修飾子を付与する
- プロパティは`private`を付与して外部からの直接参照を防止する
- 状態変更が必要な場合は、新しいインスタンスを返すようにする
- プロパティへのアクセスは**getter**を使用するように実装する

### 値オブジェクト (Value Object)

#### 定義と特徴

- 識別子を持たず、属性の値によって同一性を判断するオブジェクト
- 完全に不変であること
- 自己検証を行い、常に有効な状態を保証する

#### 実装規則

- コンストラクタは`private`とし、静的ファクトリメソッドでインスタンスを生成する
- `equals`メソッドを実装し、値による等価性比較を可能にする
- プリミティブ型への変換メソッド（`toValue`、`toString`等）を提供する
- ドメインロジックに関連する振る舞いをメソッドとして実装する

#### 命名規則

- クラス名はドメインの概念を表す名詞を使用する（例: `Email`、`Money`、`DateRange`）
- ファイル名はケバブケースで`<概念名>.ts`とする

### エンティティ (Entity)

#### 定義と特徴

- 一意の識別子（ID）によって同一性を判断するオブジェクト
- ライフサイクルを通じて識別子は変更されない
- 状態変更が許容されるが、常に有効な状態を維持する

#### 実装規則

- コンストラクタは`private`とし、静的ファクトリメソッドでインスタンスを生成する
- 識別子用の値オブジェクトを定義する（例: `UserId`、`OrderId`）
- `equals`メソッドを実装し、識別子による等価性比較を行う
- 状態変更は専用のメソッドを通じてのみ行い、直接のプロパティ変更は禁止する
- 状態変更メソッドは事前条件を検証し、ビジネスルールに違反する操作を拒否する

#### 命名規則

- クラス名はドメインの主要な概念を表す名詞を使用する（例: `User`、`Order`、`Game`）
- ファイル名はケバブケースで`<概念名>.ts`とする

### 集約 (Aggregate)

#### 定義と特徴

- 関連するエンティティと値オブジェクトをまとめた整合性の境界
- 集約ルート（Aggregate Root）を通じてのみアクセスする
- トランザクション整合性の単位となる

#### 実装規則

- 集約ルートのエンティティのみが外部に公開される
- 集約内部のオブジェクトへの直接参照を返さない（必要に応じてコピーを返す）
- 集約間の参照は識別子（ID）のみで行い、オブジェクト参照は持たない
- 集約のサイズは小さく保ち、トランザクションの競合を最小化する

### ドメインサービス (Domain Service)

#### 定義と特徴

- 特定のエンティティや値オブジェクトに属さないドメインロジックを実装する
- ステートレスであること
- 複数の集約にまたがる操作や、外部リソースとの連携を抽象化する
- 過剰なドメインサービスの実装は**ドメインモデル貧血症**に繋がるため注意を要する

#### 実装規則

- インターフェースを定義し、実装はインフラ層に配置する（依存性逆転）
- メソッド名はドメインの操作を表す動詞を使用する
- 引数と戻り値はドメインオブジェクトを使用する

#### 命名規則

- インターフェース名は`<概念名>Service`とする（例: `PasswordHashService`）
- ファイル名はケバブケースで`<概念名>-service.ts`とする

### Port（CQRS）

本プロジェクトではCQRS（Command Query Responsibility Segregation）パターンを採用し、書き込み操作と読み取り操作の責務を分離する。

#### CQRS の原則

- **Command（コマンド）**: 状態を変更する操作。集約を通じてビジネスルールを適用する
- **Query（クエリ）**: 状態を読み取る操作。集約を経由せず、最適化された読み取りモデルを使用する
- コマンドとクエリは明確に分離し、同一のインターフェースに混在させない

### Command Port

#### 定義と特徴

- 集約の永続化・更新・削除を担当するインターフェース
- ドメイン層にインターフェースを定義し、実装はインフラ層に配置する（依存性逆転）
- 集約単位でトランザクション整合性を保証する

#### 実装規則

- 集約ルートごとに1つのCommand Portを定義する
- 基本操作として`save`、`delete`を定義する
- `save`メソッドは新規作成と更新の両方を担当する（Upsertパターン）
- 識別子による取得（`findById`）はCommand Portに含める（更新時の整合性確認用）
- 戻り値の型は`Promise`でラップし、非同期操作に対応する
- 集約全体を引数として受け取り、集約全体を永続化する

#### 命名規則

- インターフェース名は`<集約ルート名>CommandPort`とする（例: `UserCommandPort`）
- ファイル名はケバブケースで`<集約ルート名>-command-port.ts`とする

### Query Port

#### 定義と特徴

- データの読み取り専用操作を担当するインターフェース
- ドメイン層にインターフェースを定義し、実装はインフラ層に配置する（依存性逆転）
- パフォーマンス最適化のため、集約を経由せずに直接データを取得できる

#### 実装規則

- ユースケースの読み取り要件に応じてQuery Portを定義する
- 戻り値はDTO（Data Transfer Object）または読み取り専用モデルとする
- 集約やエンティティをそのまま返さない（読み取りモデルへの変換を行う）
- 複雑な検索条件に対応するメソッドを定義できる
- ページネーション、ソート、フィルタリングのパラメータを受け取れる
- 戻り値の型は`Promise`でラップし、非同期操作に対応する

#### 命名規則

- インターフェース名は`<集約ルート名>QueryPort`とする（例: `UserQueryPort`）
- ファイル名はケバブケースで`<集約ルート名>-query-port.ts`とする

### ドメイン例外 (Domain Exception)

#### 定義と特徴

- ドメインルール違反を表現するカスタム例外
- ビジネスルールに基づいた明確なエラーメッセージを提供する

#### 実装規則

- 基底クラス`DomainException`を継承する
- エラーコードとメッセージを持つ
- 例外の種類ごとにクラスを定義する

#### 命名規則

- クラス名は`<エラー内容>Exception`とする（例: `InvalidEmailException`、`InsufficientBalanceException`）
- ファイル名はケバブケースで`<例外名>.ts`とする

### ドメイン層ディレクトリ構成

```
src/domain/
├── entities/           # エンティティ
├── value-objects/      # 値オブジェクト
├── aggregates/         # 集約（集約ルートを含む）
├── services/           # ドメインサービスインターフェース
├── ports/
│   ├── command/        # Command Port（書き込み用）
│   └── query/          # Query Port（読み取り用）
└── exceptions/         # ドメイン例外
```

---

## Adapter層（インフラストラクチャ層）

Adapter層はドメイン層で定義されたPortインターフェースの具体的な実装を提供する。データベースアクセスや外部サービス連携などの技術的関心事を担当する。

### 共通原則

- ドメイン層のPortインターフェースを実装する
- NestJSの`@Injectable()`デコレータを付与し、DIコンテナに登録する
- 技術的な詳細（ORM、外部API等）をこの層に閉じ込める
- ドメインオブジェクトと永続化モデル間のマッピングは**Mapperクラス**に集約する

### Command Adapter

#### 定義と特徴

- Command Portの実装クラス
- 集約の永続化・更新・削除を担当する
- ドメインオブジェクトと永続化モデル間の双方向マッピングを行う

#### 実装規則

- 1つのCommand Portに対して1つのCommand Adapterを実装する
- ドメインオブジェクトと永続化モデル間の変換はMapperクラスに委譲する
- `save`の実装ではUpsert（存在すれば更新、なければ作成）を使用する
- トランザクションが必要な場合はAdapter内で制御する

#### 命名規則

- クラス名は`<集約ルート名>CommandAdapter`とする（例: `UserCommandAdapter`）
- ファイル名はケバブケースで`<集約ルート名>-command-adapter.ts`とする

### Query Adapter

#### 定義と特徴

- Query Portの実装クラス
- 読み取り専用のデータ取得を担当する
- 永続化モデルからDTOへの変換を行う

#### 実装規則

- 1つのQuery Portに対して1つのQuery Adapterを実装する
- 永続化モデルからの変換はMapperクラスに委譲する
- パフォーマンスを考慮し、必要なカラムのみを取得するクエリを記述する
- ページネーション等の共通処理はAdapter内で実装する

#### 命名規則

- クラス名は`<集約ルート名>QueryAdapter`とする（例: `UserQueryAdapter`）
- ファイル名はケバブケースで`<集約ルート名>-query-adapter.ts`とする

### Mapper

#### 定義と特徴

- ドメインオブジェクトと永続化モデル（ORMエンティティ）間の変換ロジックを集約するクラス
- Command AdapterとQuery Adapterの両方から利用され、マッピングロジックの重複を排除する
- ステートレスな静的メソッドで構成する

#### 実装規則

- 集約ルートごとに1つのMapperクラスを定義する
- すべてのメソッドは`static`とする（状態を持たない）
- `toDomainEntity`: 永続化モデルからドメインオブジェクトへの変換
- `toPersistence`: ドメインオブジェクトから永続化モデルへの変換
- enum変換メソッド: ドメインenumと永続化enumの相互変換
- 変換に失敗する場合（未知のenum値等）は明示的にエラーをスローする

#### 命名規則

- クラス名は`<集約ルート名>Mapper`とする（例: `UserMapper`、`GameMapper`）
- ファイル名はケバブケースで`<集約ルート名>.mapper.ts`とする
- 配置先: `src/infrastructure/adapters/mappers/`

### ドメインサービス Adapter

#### 定義と特徴

- ドメイン層で定義されたドメインサービスインターフェースの実装クラス
- 外部ライブラリや技術的な詳細を隠蔽する

#### 実装規則

- ドメインサービスインターフェースを実装する
- 外部ライブラリへの依存はAdapter内に閉じ込める

#### 命名規則

- クラス名は`<概念名>ServiceAdapter`とする（例: `PasswordHashServiceAdapter`）
- ファイル名はケバブケースで`<概念名>-service-adapter.ts`とする

### NestJS モジュール連携

#### DIトークンの定義

- Portインターフェースに対応するDIトークンを定義する
- トークン名はPortインターフェース名と同一の文字列を使用する

#### プロバイダー登録

- Adapterクラスを`providers`に登録し、対応するPortのトークンで提供する
- `useClass`を使用してインターフェースと実装を紐づける

### Adapter層ディレクトリ構成

```
src/infrastructure/
├── adapters/
│   ├── command/            # Command Adapter
│   ├── query/              # Query Adapter
│   ├── mappers/            # Mapper（ドメイン⇔永続化モデル変換）
│   └── services/           # ドメインサービスAdapter
└── typeorm/                # TypeORMエンティティ・設定
```

---

## UseCase層

UseCase層はアプリケーションのユースケース（ビジネスシナリオ）を実現するオーケストレーション層である。ドメインオブジェクトとPortを組み合わせてビジネスロジックの実行を制御する。

### 共通原則

#### 単一責務

- 1つのUseCaseクラスは1つのユースケースのみを担当する
- 公開メソッドは`execute`のみとする
- UseCaseの名前でそのクラスが何をするかが明確にわかるようにする

#### CQRSとの対応

- UseCaseはCommand UseCaseとQuery UseCaseに分離する
- Command UseCase: 状態変更を伴う操作。Command Portを使用する
- Query UseCase: 読み取り専用操作。Query Portを使用する
- 1つのUseCaseにCommandとQueryの責務を混在させない

#### 依存関係

- PortおよびドメインサービスはNestJSの`@Inject()`でDIトークンを指定して注入する
- UseCase間の直接的な依存・呼び出しは禁止する
- フレームワーク固有の例外（`NotFoundException`等）はUseCase層で使用してよい

### Command UseCase

#### 定義と特徴

- 状態を変更するユースケースを実装する（作成・更新・削除）
- Command Portを通じて集約を取得・永続化する
- ドメインオブジェクトのファクトリメソッドや振る舞いメソッドを呼び出す

#### 実装規則

- `execute`メソッドの引数にはプリミティブ型またはDTOを使用する
- `execute`メソッド内でプリミティブ型からドメインオブジェクト（値オブジェクト等）への変換を行う
- ドメインオブジェクトの生成にはファクトリメソッドを使用する
- 戻り値は`Promise<void>`または操作結果を表すオブジェクトとする
- 事前条件の検証（存在確認等）はUseCase内で行う

#### 命名規則

- クラス名は`<動詞><対象>Usecase`とする（例: `RegisterUserUsecase`、`DeleteGameUsecase`）
- ファイル名はケバブケースで`<動詞>-<対象>.usecase.ts`とする

### Query UseCase

#### 定義と特徴

- 読み取り専用のユースケースを実装する
- Query Portを通じてDTOを取得し、そのまま返却する

#### 実装規則

- `execute`メソッドの引数には検索条件のプリミティブ型またはDTOを使用する
- 戻り値はQuery Portから取得したDTOをそのまま返す
- ドメインオブジェクトへの変換は行わない（Query Portが直接DTOを返すため）
- 追加のビジネスロジックが不要な場合でも、Controllerから直接Query Portを呼ばず、必ずUseCaseを経由する

#### 命名規則

- クラス名は`<動詞><対象>Usecase`とする（例: `GetUserUsecase`、`GetGamesUsecase`）
- ファイル名はケバブケースで`<動詞>-<対象>.usecase.ts`とする

### テスト方針

- Portをモック化してUseCaseのロジックのみをテストする
- Command UseCaseではPortの呼び出し引数を検証する
- Query UseCaseではPortの戻り値がそのまま返却されることを検証する
- テストファイル名は`<usecase名>.usecase.spec.ts`とする

### UseCase層ディレクトリ構成

```
src/domain/usecases/
├── command/                # Command UseCase
└── query/                  # Query UseCase
```

---

## Controller層（プレゼンテーション層）

Controller層はHTTPリクエストの受け付けとレスポンスの返却を担当する。ビジネスロジックは一切持たず、UseCaseへの処理委譲に徹する薄い層である。

### 共通原則

#### 責務の限定

- HTTPリクエストの受け付け、バリデーション、UseCaseの呼び出し、レスポンスの返却のみを担当する
- ビジネスロジック、データ変換、永続化処理をController内に記述しない
- 1つのControllerクラスは1つのエンドポイント（1つのUseCase）のみを担当する

#### UseCaseとの連携

- UseCaseはコンストラクタインジェクションで注入する
- Controllerのハンドラメソッドは受け取ったリクエストデータをUseCaseの`execute`メソッドに渡すのみとする
- UseCaseからの戻り値をそのままレスポンスとして返却する

### リクエストDTO

#### 定義と特徴

- HTTPリクエストボディのバリデーションを担当するクラス
- `class-validator`のデコレータでバリデーションルールを宣言する
- `class-transformer`の`@Type()`でネストされたオブジェクトの型変換を行う

#### 実装規則

- リクエストDTOは`class`で定義する（`class-validator`のデコレータ使用のため）
- プロパティごとにバリデーションデコレータを付与する
- ネストされたオブジェクトには`@ValidateNested()`と`@Type()`を使用する
- NestJSの`ValidationPipe`によってバリデーションが自動実行される

#### 命名規則

- クラス名は`<操作名>RequestDto`とする（例: `RegisterUserRequestDto`）
- ファイル名はケバブケースで`<操作名>-request.dto.ts`とする
- 配置先: `src/application/dto/request/`

### レスポンスDTO

#### 定義と特徴

- HTTPレスポンスの型を定義する
- Query PortのDTOをそのまま使用できる場合は新たに定義しない

#### 実装規則

- レスポンスDTOは`interface`で定義する
- Query PortのDTOと構造が同じ場合は再定義せず、Query PortのDTOを直接使用する
- API固有の整形（日付のフォーマット等）が必要な場合のみレスポンスDTOを別途定義する

#### 命名規則

- インターフェース名は`<対象名>ResponseDto`とする（例: `UserResponseDto`）
- ファイル名はケバブケースで`<対象名>-response.dto.ts`とする
- 配置先: `src/application/dto/response/`

### Controller

#### 実装規則

- NestJSの`@Controller()`デコレータでルートパスを指定する
- HTTPメソッドデコレータ（`@Get()`、`@Post()`、`@Put()`、`@Delete()`等）でエンドポイントを定義する
- パスパラメータは`@Param()`、リクエストボディは`@Body()`、クエリパラメータは`@Query()`で取得する
- レスポンスのHTTPステータスコードは`@HttpCode()`で明示的に指定する
  - `POST`（作成）: `HttpStatus.CREATED`（201）
  - `DELETE`、`PUT`/`PATCH`（戻り値なし）: `HttpStatus.NO_CONTENT`（204）
  - その他: NestJSのデフォルト（200）に従う
- エラーハンドリングはNestJSの例外フィルターに委譲する（Controller内での`try-catch`は原則不要）

#### 命名規則

- クラス名は`<動詞><対象>Controller`とする（例: `RegisterUserController`、`GetUsersController`）
- ファイル名はケバブケースで`<動詞>-<対象>.controller.ts`とする

### テスト方針

- UseCaseをモック化してControllerの振る舞いのみをテストする
- HTTPステータスコード、レスポンスボディの構造を検証する
- テストファイル名は`<controller名>.controller.spec.ts`とする

### Controller層ディレクトリ構成

```
src/application/
├── controllers/            # Controller
├── dto/
│   ├── request/            # リクエストDTO
│   └── response/           # レスポンスDTO
├── filters/                # カスタム例外フィルター
└── <対象>.module.ts         # NestJSモジュール定義
```

---

## 例外処理

### 例外フローの原則

各層でスローされた例外はController層やUseCase層で`try-catch`せず、NestJSの**例外フィルター**が最終的にキャッチしてHTTPレスポンスに変換する。

```
ドメイン層 (DomainException)
  ↓ そのまま伝播
UseCase層 (NestJS HttpException / DomainException)
  ↓ そのまま伝播
Controller層 (try-catchしない)
  ↓ そのまま伝播
例外フィルター → HTTPレスポンスに変換
```

### 例外の種類と発生箇所

| 例外の種類 | 発生箇所 | 説明 |
|---|---|---|
| `DomainException` | ドメイン層 | ビジネスルール違反（バリデーション失敗、不正な状態遷移等） |
| NestJS `HttpException`系 | UseCase層 | アプリケーション固有のエラー（`NotFoundException`等） |
| `ValidationPipe`例外 | Controller層（自動） | リクエストDTOのバリデーション失敗 |

### カスタム例外フィルター

#### 定義と特徴

- `DomainException`はNestJSの`HttpException`を継承していないため、そのままではすべて500エラーになる
- カスタム例外フィルターで`DomainException`をキャッチし、適切なHTTPステータスコードに変換する
- これによりドメイン層はフレームワークに依存せず純粋性を保てる

#### 実装規則

- NestJSの`ExceptionFilter`インターフェースを実装する
- `@Catch(DomainException)`デコレータで`DomainException`のみをキャッチする
- `DomainException`のエラーコードに基づいてHTTPステータスコードをマッピングする
- マッピングに該当しないエラーコードはデフォルトで`400 Bad Request`とする
- グローバルフィルターとしてアプリケーション全体に適用する

#### ステータスコードマッピング方針

- `NOT_FOUND`系 → `404 Not Found`
- `ALREADY_EXISTS`系 / `CONFLICT`系 → `409 Conflict`
- `UNAUTHORIZED`系 → `401 Unauthorized`
- `FORBIDDEN`系 → `403 Forbidden`
- その他のドメインルール違反 → `400 Bad Request`

#### 命名規則

- クラス名は`DomainExceptionFilter`とする
- ファイル名は`domain-exception.filter.ts`とする
- 配置先: `src/application/filters/`
