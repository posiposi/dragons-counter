# ユビキタス言語定義

## ドメイン用語

### 試合（Game）

| 用語 | 英語 | 説明 |
|------|------|------|
| 試合 | Game | 中日ドラゴンズの1試合の記録 |
| 試合日 | GameDate | 試合が行われた日付。未来日付は不可 |
| 対戦相手 | Opponent | 相手チーム。略称（"巨"等）から正式名称（"読売ジャイアンツ"等）に変換される |
| 得点 | Score | チームの得点。0以上の整数 |
| ドラゴンズ得点 | DragonsScore | ドラゴンズの得点 |
| 相手チーム得点 | OpponentScore | 対戦相手の得点 |
| 試合結果 | GameResult | 勝利(WIN)・敗北(LOSE)・引き分け(DRAW)。スコアから自動判定される |
| スタジアム | Stadium | 試合会場。StadiumIdとStadiumNameで構成される |
| メモ | Notes | 試合に関する任意の備考。空の場合はundefinedとして扱う |
| 論理削除 | SoftDelete | deletedAtフィールドに日時を設定して削除済みとする方式 |

### ユーザー（User）

| 用語 | 英語 | 説明 |
|------|------|------|
| ユーザー | User | システムの利用者 |
| メールアドレス | Email | ユーザーの識別に使用するメールアドレス |
| パスワード | Password | bcryptでハッシュ化されたパスワード |
| 登録ステータス | RegistrationStatus | ユーザーアカウントの状態 |
| 承認待ち | PENDING | 新規登録直後の状態。ログイン不可 |
| 承認済み | APPROVED | 管理者が承認した状態。ログイン可能 |
| 却下 | REJECTED | 管理者が却下した状態。ログイン不可 |
| BAN | BANNED | 利用禁止の状態。ログイン不可 |
| 登録リクエスト | UserRegistrationRequest | ユーザー登録の申請。却下理由を保持可能 |

### チーム名

| 略称 | 正式名称 |
|------|----------|
| 巨 | 読売ジャイアンツ |
| 神 / 阪 | 阪神タイガース |
| 横 / De | 横浜DeNAベイスターズ |
| 広 | 広島東洋カープ |
| ヤ | 東京ヤクルトスワローズ |
| 日 | 北海道日本ハムファイターズ |
| ソ | 福岡ソフトバンクホークス |
| 楽 | 東北楽天ゴールデンイーグルス |
| 西 | 埼玉西武ライオンズ |
| オ | オリックス・バファローズ |
| ロ | 千葉ロッテマリーンズ |

## ビジネス用語

| 用語 | 説明 |
|------|------|
| 観戦記録 | ユーザーが現地観戦した試合の記録 |
| 勝率 | 勝利数 ÷ (勝利数 + 敗北数)。引き分けは計算から除外 |
| スクレイピング | 外部Webサイトから試合結果を自動取得する処理 |
| 一括登録 | 複数の試合を一度に登録する処理。日付重複はスキップされる |

## アーキテクチャ用語

| 用語 | 英語 | 説明 |
|------|------|------|
| ドメイン層 | Domain Layer | ビジネスロジックを含む層。フレームワークに依存しない |
| アプリケーション層 | Application Layer | コントローラー、DTO、ユースケースを含む層 |
| インフラストラクチャ層 | Infrastructure Layer | データベースアクセス等の技術的実装を含む層 |
| エンティティ | Entity | 一意のIDで識別されるドメインオブジェクト |
| 値オブジェクト | Value Object | 値の等価性で比較される不変のオブジェクト |
| ポート | Port | ドメイン層が定義するインターフェース |
| アダプター | Adapter | ポートの具体的な実装（インフラストラクチャ層に配置） |
| ユースケース | UseCase | 1つのビジネスシナリオを実現するクラス |
| CQRS | Command Query Responsibility Segregation | 書き込み操作と読み取り操作の責務分離 |
| DIトークン | DI Token | NestJSの依存性注入で使用する識別子。ポート名を文字列で使用 |

## コード上の命名規則

### クラス名

| 分類 | パターン | 例 |
|------|---------|-----|
| エンティティ | `{名詞}` | `Game`, `User` |
| 値オブジェクト | `{概念名}` | `GameDate`, `Score`, `Email` |
| ユースケース | `{動詞}{対象}Usecase` | `GetGamesUsecase`, `DeleteGameUsecase` |
| コントローラー | `{動詞}{対象}Controller` | `GetGamesController`, `BulkCreateGameController` |
| ポート | `{概念名}Port` | `GamePort`, `UserCommandPort` |
| アダプター | `{概念名}Adapter` | `GameAdapter`, `UserQueryAdapter` |
| リクエストDTO | `{操作名}Dto` | `BulkCreateGameDto`, `GameInputDto` |
| レスポンスDTO | `{対象名}ResponseDto` | `GameResponseDto` |

### メソッド名

| 分類 | パターン | 例 |
|------|---------|-----|
| ファクトリ | `create`, `createNew`, `fromRepository`, `fromPlainText`, `fromHash`, `fromScores` | `Email.create()`, `User.createNew()` |
| 等価性判定 | `equals` | `gameId.equals(other)` |
| 状態判定 | `is{状態}`, `can{動詞}` | `isVictory()`, `canLogin()`, `isEmpty()` |
| 値取得 | getter (`get value()`) | `gameDate.value` |
| 変換 | `format`, `toPrisma`, `fromPrisma` | `gameDate.format()` |
| ポートメソッド | `save`, `findAll`, `findById`, `findByEmail`, `findByDate`, `softDelete` | |
| ユースケース | `execute` | `usecase.execute()` |
