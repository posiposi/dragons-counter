# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

Dragons Counter（Dra Vincit）は中日ドラゴンズファン向けの野球観戦記録アプリケーションです。

**構成:**

- **backend/**: NestJS/TypeScript API（ドメイン駆動設計）
- **frontend/**: Vite + React/TypeScript Web アプリケーション
- **terraform/**: AWS インフラ構成（EC2 + ALB + RDS）

## 作業ドキュメントの分類

各種ドキュメントの保存ディレクトリはプロジェクトルートディレクトリ配下にある`.claude`に設置するようにします。

### 永続的ドキュメント(`.claude/docs`)

アプリケーション全体での「**何を目的としているか**」、「**どのように目的を達成するか**」を定義しています。
アプリケーションの基本設計や方針が変わらない限り更新されません。

- **product-reuirements.md** - プロダクト要求定義書
- **functional-design.md** - 機能設計書
- **development-guidelines.md** - 開発ガイドライン
- **glossary.md** - ユビキタス言語定義

### 実装タスクリスト(`.claude/tmp/implement-lists`)

大規模なプロジェクトタスクの場合はgithubにIssuesを細分化して作成しますが、その大本となるプロジェクト概要を保存するディレクトリです。
セッション固有の一時的な作業ファイルとして扱うため、永続ドキュメント(`.claude/docs`)とは分離して配置しています。
ユーザーからプロジェクトファイル作成の指示がある場合、下記定義に従って各タスクプロジェクトを保存するファイルを作成して、概要および詳細仕様を記述します。

**ファイル命名規則**

- `プロジェクト名(英語)-YYYYMMDD`

**記述内容**

- 概要
  - プロジェクトの概要を記述します。どのような機能、目的であるかを**端的に**記述します

- 仕様分割
  - `main`ブランチへマージできる単位で仕様を分割して記述します
    - 仕様内容は概要レベルで記述します
    - githubで個別単位のIssueを作成します

## 開発プロセス

### タスク実装スキル

GitHub Issueからの実装には `implement-task` スキルを使用します。Issue番号を引数として渡します。

```
/implement-task <Issue番号>
```

このスキルは以下のフェーズを自動で実行します：

| Phase                 | 内容                            | サブエージェント                                             |
| --------------------- | ------------------------------- | ------------------------------------------------------------ |
| 1. 仕様取得           | GitHub Issueから仕様を取得      | （スキル自身が実行）                                         |
| 2. タスク分解         | 並列調査 + 1コミット粒度に分解  | `code-investigator` + `log-investigator` → `task-decomposer` |
| 3. TDD+DDD実装ループ  | テスト作成→レビュー→実装→レビュー→簡素化→コミットを1コミット粒度ごとに反復 | `implementer`（実装ワーカー） + `pr-review-toolkit:{pr-test-analyzer, comment-analyzer, code-reviewer, silent-failure-hunter, code-simplifier}`（メインがオーケストレーション・コミット） |
| 4. PR作成・レビュー・修正 | commit-push-prでPR作成→code-reviewでレビュー→重要指摘をTDDで修正 | `pr-creator`（タイトル・本文生成） + `/commit-commands:commit-push-pr` + `/code-review:code-review` + `implementer`（メインがオーケストレーション） |

詳細は `.claude/skills/implement-task/SKILL.md` を参照してください。

### 情報管理

フェーズ間の情報連携はClaude CodeのTasks機能（TaskCreate/TaskUpdate/TaskList/TaskGet）を使用します。ステアリングファイルは使用しません。

- TaskCreateでタスクを作成し、descriptionに詳細情報を記載する
- TaskUpdateのmetadataに成果物（調査結果、設計情報等）を格納する
- 各サブエージェントはTaskGet/TaskListで前フェーズの情報を取得する

## git worktreeによる並列開発

本プロジェクトはgit worktreeを使用した並列開発に対応しています。

複数のGitHub Issueをworktreeで並列開発する場合は `worktree-parallel-dev` スキルを使用します。Issue番号（複数指定可）を引数として渡します。

```
/worktree-parallel-dev <Issue番号1> [<Issue番号2> ...]
```

このスキルは、実装着手前にIssue間の変更範囲の競合を確認したうえで、各Issue専用のworktree・開発環境（`make dev`）をセットアップします。worktreeのセットアップ手順・利用可能なコマンド・ポート割り当ての詳細は `.claude/skills/worktree-parallel-dev/SKILL.md` を参照してください。

## gitコマンドの実行ルール

`git add`、`git commit`、`git push`の実行に**ユーザーの実行許可は不要**。都度確認せず実行してよい。

実装ワークフロー（`implement-task`）でのコミットは、一定の機能粒度で都度 `/commit-commands:commit` スキルを使用して実行する。1コミットの粒度はそのコミット単体で変更の意味を把握できる単位に限定し、判断しにくい大きな粒度でのコミットは禁止する。実装フローではレビューエージェント（`pr-review-toolkit:*`）の並列起動が必要であり、これはサブエージェントからは起動できないため、フロー全体のオーケストレーションとコミット実行は `implement-task` スキルのメインコンテキストが担う。PR作成は別スキル・サブエージェント（Phase 4: `pr-creator`）の責務とし、コミット工程には含めない。

## Agent Teams使用規約

複雑かつ大規模なタスクに対してはAgent Teamsを[公式ドキュメント](https://code.claude.com/docs/en/agent-teams)を参考に使用する。
ただし、下記ルールに基づくこと。

- agent teamの起動自体にユーザーの許可は不要
- タスクにおける対応項目を分割し、各Agentに委任する
  - **例**
    - タスク仕様の検討
    - 仕様に基づくタスク分割
    - テストコード実装
    - 実装
    - コードレビュー
