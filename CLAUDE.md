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

### タスク実装コマンド

GitHub Issueからの実装には `/implement-task` コマンドを使用します。

```
/implement-task <Issue番号>
```

このコマンドは以下のフェーズを自動で実行します：

| Phase                 | 内容                            | サブエージェント                                             |
| --------------------- | ------------------------------- | ------------------------------------------------------------ |
| 1. 仕様取得           | GitHub Issueから仕様を取得      | （コマンド自身が実行）                                       |
| 2. タスク分解         | 並列調査 + 1コミット粒度に分解  | `code-investigator` + `log-investigator` → `task-decomposer` |
| 3. TDD+DDD実装        | テスト駆動 + ドメイン駆動で実装 | `implementer`                                                |
| 4. 実装レビュー       | コードレビュー                  | `code-reviewer`                                              |
| 4-b. レビュー指摘修正 | レビュー指摘をTDDで修正         | `review-fixer`                                               |
| 5. PR作成             | Pull Requestを作成              | `pr-creator`                                                 |

詳細は `.claude/commands/implement-task.md` を参照してください。

### 情報管理

フェーズ間の情報連携はClaude CodeのTasks機能（TaskCreate/TaskUpdate/TaskList/TaskGet）を使用します。ステアリングファイルは使用しません。

- TaskCreateでタスクを作成し、descriptionに詳細情報を記載する
- TaskUpdateのmetadataに成果物（調査結果、設計情報等）を格納する
- 各サブエージェントはTaskGet/TaskListで前フェーズの情報を取得する

## Worktree並列開発

git worktreeを使用して複数のIssueを並列で開発できる。

- ワークツリーは `.worktrees/` 配下に配置（git管理外）
- ブランチは基本的に `main` から切り出し、ディレクトリ名はブランチ名と同名
- 各ワークツリーで独立したDockerコンテナを起動（ポートオフセットで競合回避）

詳細は `worktree-setup` スキル（`.claude/skills/worktree-setup/SKILL.md`）を参照

## Agent Teams使用規約

複雑かつ大規模なタスクに対してはAgent Teamsを[公式ドキュメント](https://code.claude.com/docs/en/agent-teams)を参考に使用する。
ただし、下記ルールに基づくこと。

- Agent Teamsの使用を検討する必要があるタスクの場合は使用許可をユーザーに求める
- タスクにおける対応項目を分割し、各Agentに委任する
  - **例**
    - タスク仕様の検討
    - 仕様に基づくタスク分割
    - テストコード実装
    - 実装
    - コードレビュー
