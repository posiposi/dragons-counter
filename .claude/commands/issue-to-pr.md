---
name: issue-to-pr
description: GitHub IssueからPR作成までの開発ワークフローを実行する。Issue番号を引数として受け取る。
argument-hint: "[Issue番号]"
disable-model-invocation: true
allowed-tools: Read, Write, Edit, Glob, Grep, Bash, WebFetch, TaskCreate, TaskUpdate, TaskList, TaskGet
---

# Issue to PR ワークフロー

GitHub Issue #$ARGUMENTS の仕様に基づき、以下のフェーズを順番に実行する。
各フェーズ間の情報連携はClaude CodeのTasks機能を使用する。

## 並列開発セットアップ

下記に従い環境をセットアップする。
ただしユーザーから並列開発を**しないように**指示がある場合は、下記をスキップしてPhase1の仕様取得に進み実装を開始する。

### skill読み込み

- `worktree-setup`スキルを読み込み、並列開発環境をセットアップしてから実装を進める

## Phase 1: 仕様取得

1. GitHub MCPサーバー（`mcp__github__issue_read`）を使用してIssue #$ARGUMENTS の内容を取得する
2. Issueのタイトル、本文、ラベル、コメントを収集する
3. TaskCreateで「仕様取得」タスクを作成する
   - subjectにIssueタイトルを記載
   - descriptionにIssue本文を記載
   - metadataに構造化した仕様情報を格納

## Phase 2: タスク分解

### Phase 2-a, 2-b: 並列調査

以下のサブエージェントを起動する :

- **`code-investigator`**: 関連コードの調査
  - フロントエンドとバックエンドの**両方の調査が必要な場合**には**並列**で起動する

**ログの調査も必要な場合**は以下のサブエージェントを上記に加えて**並列**で起動する：

- **`log-investigator`**: ログ・エラー情報の調査

各エージェントにはPhase 1で作成したタスクIDを渡し、TaskGetで仕様を取得させる。
調査結果はTaskUpdateで各タスクのmetadataに記録される。

### Phase 2-c: タスク分解

並列調査が完了したら **`task-decomposer`** サブエージェントを起動する。

- Phase 2-a, 2-bの調査結果タスクIDを渡す
- 1コミット粒度の実装タスクをTaskCreateで作成する
- タスク間の依存関係をaddBlockedByで設定する

## Phase 3: TDD + DDD実装

### Phase 3-1: ブランチ切り替え

- `main`ブランチから実装用のブランチを作成し、スイッチする
  - issueNo.の前には`#`を入れること
  - ブランチ名は簡潔な**英語**で記述すること

```bash
git switch -c "{#issue_no.}_{issue_name}"
```

### Phase 3-2: 実装エージェント起動

**`tdd-implementer`** サブエージェントを起動する。

- TaskListから未着手の実装タスクを取得して順番に実装する
- Red→Green→Refactorのサイクルを厳守する
- `.claude/skills/typescript-ddd-standards/SKILL.md` のDDD規約に準拠する
- テストは必ずDockerコンテナ内で実行する（`docker compose exec backend npm run test`）

#### linter実行

- テストがPASSした後に**コンテナ内で**コマンドを実行してlint確認を行うこと
  - **フロントエンドのlint実行**
    - frontendコンテナ内で下記コマンドを順に実行する
      1. `npm run lint`
      2. `npm run typecheck`
      3. `npm run format:check`
    - コマンド実行後にlintエラーがある場合はfrontendコンテナ内で`npm run format`を実行してlintエラー修正を行う
  - **バックエンドのlint実行**
    - backendコンテナ内で`npm run format`を実行する

#### gitコマンド実行

- テストおよびlintをPASSした場合はコミット行う
  - タスク単位で`git add`および`git commit`を行うこと

## Phase 4: 実装レビュー

**`code-reviewer`** サブエージェントを起動する。

- 完了済み実装タスクの変更内容をレビューする
- レビュー結果をTaskUpdateでmetadataに記録する

**並列実行の最適化**: 独立したタスクが複数ある場合、タスクAのレビューとタスクBの実装を並列で実行する。

## Phase 4-b: レビュー指摘修正

レビュー結果に重大な指摘（`changes_requested`）がある場合、**`review-fixer`** サブエージェントを起動する。

- code-reviewerのレビュー結果をTasksから取得する
- TDDサイクル（Red→Green→Refactor）で指摘事項を修正する
- `.claude/skills/typescript-ddd-standards/SKILL.md` のDDD規約に準拠する
- 指摘**1つの修正毎**に`git add`および`git commit`を行うこと
- 修正完了後、必要に応じてPhase 4のレビューを再実行する

## Phase 5: PR作成

**`pr-creator`** サブエージェントを起動する。

- Tasksから仕様・設計・実装の全体像を把握する
- PRタイトルにIssue番号を含めない
- GitHub MCPサーバーを優先してPRを作成する（フォールバック: ghコマンド）

## 制約事項

- テストコードは必ずDockerコンテナ内で実行する
- CLIコマンド実行は必ずDockerコンテナ内で実行する
- 各フェーズの完了時にユーザーに進捗を報告する
