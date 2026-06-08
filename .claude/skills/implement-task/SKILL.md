---
name: implement-task
description: GitHub IssueからPR作成までの開発ワークフローを実行する。Issue番号を引数として受け取る。
allowed-tools: Read, Write, Edit, Glob, Grep, Bash, Skill, Agent, WebFetch, TaskCreate, TaskUpdate, TaskList, TaskGet
---

# 概要

引数で受け取ったGitHub Issue番号（以下 `<Issue番号>`）の仕様に基づき、以下のフェーズを順番に実行する。
各フェーズ間の情報連携はClaude CodeのTasks機能を使用する。

## Phase 1: 仕様取得

1. GitHub MCPサーバー（`mcp__github__issue_read`）を使用してIssue #`<Issue番号>` の内容を取得する
2. Issueのタイトル、本文、ラベル、コメントを収集する
3. TaskCreateで「仕様取得」タスクを作成する
   - subjectにIssueタイトルを記載
   - descriptionにIssue本文を記載
   - metadataに構造化した仕様情報を格納

## Phase 2: タスク分解

### Phase 2-a, 2-b: 並列調査

サブエージェント起動**前に**、メインコンテキストで各調査タスクをTaskCreateする：

1. **コード調査タスク**をTaskCreateする
   - subject: 「コード調査: {調査対象の概要}」
   - description: 調査の目的と対象範囲
   - metadata: `{ "type": "code_investigation" }`
   - addBlockedBy: Phase 1の仕様取得タスクID

2. **ログ調査が必要な場合**、ログ調査タスクをTaskCreateする
   - subject: 「ログ調査: {調査対象の概要}」
   - description: 調査の目的と対象範囲
   - metadata: `{ "type": "log_investigation" }`
   - addBlockedBy: Phase 1の仕様取得タスクID

TaskCreate完了後、以下のサブエージェントを起動する：

- **`code-investigator`**: 関連コードの調査
  - promptに**仕様取得タスクID**と**コード調査タスクID**を渡す
  - フロントエンドとバックエンドの**両方の調査が必要な場合**には**並列**で起動する

**ログの調査も必要な場合**は以下のサブエージェントを上記に加えて**並列**で起動する：

- **`log-investigator`**: ログ・エラー情報の調査
  - promptに**仕様取得タスクID**と**ログ調査タスクID**を渡す

各エージェントはTaskGetで仕様取得タスクから仕様を取得し、調査結果をTaskUpdateで自身のタスクのmetadataに記録する。

### Phase 2-c: タスク分解

並列調査が完了したら **`task-decomposer`** サブエージェントを起動する。

- promptに以下のタスクIDを渡す：
  - **仕様取得タスクID**（Phase 1で作成）
  - **コード調査タスクID**（Phase 2-aで作成）
  - **ログ調査タスクID**（Phase 2-bで作成、存在する場合）
- 1コミット粒度の実装タスクをTaskCreateで作成する
- タスク間の依存関係をaddBlockedByで設定する

## Phase 3: TDD + DDD実装

### Phase 3-1: ブランチ切り替え

- `main`ブランチから実装用のブランチを作成する（実行許可の確認は不要）
  - issueNo.の前には`#`を入れること
  - ブランチ名は簡潔な**英語**で記述すること

```bash
git switch -c "{#issue_no.}_{issue_name}"
```

### Phase 3-2: 実装ループ

Phase 2-cで分解した**1コミット粒度の実装タスクごと**に、メインコンテキストが以下の12ステップをオーケストレーションする。

**オーケストレーションの所在（重要）**: サブエージェントはAgentツール（他サブエージェントの起動）を使用できない。したがって、レビューエージェント（`/pr-review-toolkit:review-pr` の各エージェント）の起動・並列実行、および `/commit-commands:commit` によるコミットは、**すべてメインコンテキストが担う**。実装作業（テストコード作成・実装・テスト実行・指摘修正）は `implementer` サブエージェントに委任する。実装時のTDDサイクル・lint確認は `implementer` がプリロードするスキル（`tdd-workflow`、`typescript-ddd-standards`、`linter-execute`）に従う。

各タスクについて、以下の手順を実行する：

1. **テストコード作成**: `implementer` を起動し、対象タスクのテストコード（`*.spec.ts`）を作成する
2. **テストコードのレビュー（並列）**: `pr-review-toolkit:pr-test-analyzer` と `pr-review-toolkit:comment-analyzer` をAgentツールで**並列起動**し、追加したテストコードをレビューする
3. **指摘修正**: 修正すべき指摘がある場合、`implementer` を起動して修正する
4. **RED確認**: `implementer` を起動し、テストを実行して**失敗（RED）すること**を確認する
5. **コード実装**: `implementer` を起動し、テストが通る最小限の実装を行う
6. **GREEN確認**: `implementer` を起動し、テストを実行して**成功（GREEN）すること**を確認する
7. **コード・コメントのレビュー（並列）**: `pr-review-toolkit:code-reviewer` と `pr-review-toolkit:comment-analyzer` をAgentツールで**並列起動**し、コード品質とコメントをレビューする
8. **指摘修正**: 指摘がある場合、`implementer` を起動して修正する。**エラー処理を変更した場合**は `pr-review-toolkit:silent-failure-hunter` を起動してエラー処理を確認し、指摘があれば修正する
9. **GREEN再確認**: `implementer` を起動し、テストを実行して**GREENであること**を確認する
10. **可読性向上**: GREENを確認したら `pr-review-toolkit:code-simplifier` を起動し、コードの可読性を向上させる
11. **コミット**: メインコンテキストが `/commit-commands:commit` を使用してコミットする（実行許可の確認は不要）。1コミットの粒度は、そのコミット単体で意味を把握できる単位に限定する（判断しにくい大きな粒度でのコミットは禁止）
12. **繰り返し**: 未消化の実装タスクが残っている場合、1. に戻り次のタスクを実装する

全タスクの実装が完了したら、**Phase 4（PR作成）** へ移行する。

> **補足**: 実装レビュー（旧 `code-reviewer`）とレビュー指摘修正（旧 `review-fixer`）は、Phase 3-2 の実装ループ内（step 2・7・8 のレビューと step 3・8 の修正）に統合された。独立したレビューフェーズは設けない。

## Phase 4: PR作成・レビュー・指摘修正

Phase 3の全タスク完了後、メインコンテキストが以下をオーケストレーションする。

**オーケストレーションの所在（重要）**: `/commit-commands:commit-push-pr`・`/code-review:code-review` はスラッシュコマンド、指摘修正の `implementer` 起動はAgentツールであり、いずれもサブエージェントからは実行できない。よってPR作成・レビュー・修正のオーケストレーションはすべてメインコンテキストが担う。

### Phase 4-1: PRタイトル・本文の生成

**`pr-creator`** サブエージェントを起動する。

- Tasksから仕様・設計・実装の全体像を把握する
- `pr-template` のルールに従いPRタイトル・本文を生成する
- **PRタイトルにIssue番号を含めない**
- 生成したタイトル・本文を返す（PR作成の実行は行わない）

### Phase 4-2: PR作成

メインコンテキストが **`/commit-commands:commit-push-pr`** を使用してPRを作成する。

- Phase 4-1で生成したタイトル・本文を用いる
- 作業ブランチをpushし、PRを作成する（未コミットの変更が残っている場合はコミットも行われる）
- 作成されたPR番号を控える

### Phase 4-3: コードレビュー

PR作成後、メインコンテキストが **`/code-review:code-review`** に作成したPR（番号またはURL）を渡してレビューを実行する。

### Phase 4-4: レビュー指摘修正

レビューで指摘があった場合、**特に重要な指摘がある場合は `implementer` サブエージェントを起動して修正する**。

- 修正は**実装フロー（Phase 3-2）同様にTDD（Red→Green→Refactor）を遵守する**
- 修正後、メインコンテキストが `/commit-commands:commit` でコミットし、ブランチへpushする
- 必要に応じて `/code-review:code-review` を再実行し、指摘が解消されたことを確認する

## タスク構造

各フェーズのタスクは以下の構造でTasksに作成・管理する。
タスクの依存関係はaddBlocks/addBlockedByで管理する。

```
[Phase 1] 仕様取得 (metadata: issue_spec)
  → [Phase 2-a] コード調査 (metadata: code_investigation)
  → [Phase 2-b] ログ調査 (metadata: log_investigation)
  → [Phase 2-c] タスク分解 (blockedBy: 2-a, 2-b)
    → [Phase 3] 実装ループ (blockedBy: 2-c) ※タスクごとに12ステップ（実装 + レビュー + コミット）を反復
      → [Phase 4] PR作成・レビュー・指摘修正
```

## 制約事項

- テストコードは必ずDockerコンテナ内で実行する
- CLIコマンド実行は必ずDockerコンテナ内で実行する
- レビューエージェント（`pr-review-toolkit:*`）の起動・並列実行、および `/commit-commands:commit` によるコミットは、すべてメインコンテキストが行う。サブエージェントはAgentツール（他サブエージェントの起動）を使用できないため、オーケストレーションはサブエージェントに委ねない
- コミットは一定の機能粒度（1コミットで意味を把握できる単位）で都度 `/commit-commands:commit` を使用して行う。判断しにくい大きな粒度でのコミットは禁止する
- Phase 3-2のコミット工程ではPR作成を行わない。PR作成はPhase 4でメインコンテキストが `/commit-commands:commit-push-pr` を用いて行う
- Phase 4のレビュー（`/code-review:code-review`）で重要な指摘があった場合の修正は、`implementer` を用いて実装フロー同様にTDDを遵守して行う
- Web調査（公式ドキュメント参照、API仕様確認、エラー解決策検索）が必要な場合は **`web-researcher`** サブエージェントを使用する（メインコンテキストで直接WebFetch/WebSearchを実行しない）
