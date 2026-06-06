---
name: worktree-parallel-dev
description: 複数のGitHub Issueをgit worktreeで並列開発するためのワークフローを実行する。引数として1つ以上のIssue番号を受け取り、実装前にIssue間の競合確認を行ってから各Issue専用のworktreeをセットアップする。並列で複数Issueを進めたい場合に使用する。
allowed-tools: Read, Write, Edit, Glob, Grep, Bash, TaskCreate, TaskUpdate, TaskList, TaskGet
---

# 概要

引数で受け取った1つ以上のGitHub Issue番号（以下 `<Issue番号群>`）を、git worktreeを用いて並列開発するためのワークフローを定義する。

本プロジェクトはgit worktreeによる並列開発に対応しており、各Issueを独立したworktree・ブランチ・開発環境で同時に進められる。

**重要:** worktreeを作成して実装に着手する**前に**、必ず`<Issue番号群>`間で変更範囲の競合がないかを確認する（後述の Phase 2）。競合を見落としたまま並列実装を進めると、マージ時に解決困難なコンフリクトが発生するため、この確認は必須とする。

## 引数

```
/worktree-parallel-dev <Issue番号1> [<Issue番号2> ...]
```

- スペース区切りで複数のIssue番号を指定できる
- Issue番号が1つだけの場合も利用可能（競合確認はスキップし、worktreeセットアップから開始する）

## Phase 1: Issue仕様の取得

`<Issue番号群>`の各Issueについて、GitHub MCPサーバー（`mcp__github__issue_read`）を使用して仕様を取得する。

- タイトル、本文、ラベル、関連コメントを収集する
- 各Issueが対象とする機能・レイヤー・想定変更ファイルを把握する

## Phase 2: Issue間の競合確認（実装前必須）

worktree作成・実装着手の**前に**、`<Issue番号群>`間で変更範囲が競合しないかを確認する。

### 確認方式の選択

Issue件数・変更範囲の規模に応じて、以下のいずれかの方式で確認する。

| 方式 | 適用条件 |
| --- | --- |
| メインコンテキストでの確認（後述「基本の確認手順」） | Issue件数が少なく、変更範囲が小規模で見通しやすい場合 |
| Agent Teamsによる並列確認（後述「Agent Teamsによる並列確認」） | Issue件数が多い、または変更範囲が広く調査の網羅性・効率を高めたい複雑・大規模な場合 |

> **Agent Teams使用規約（CLAUDE.md準拠）:** Agent Teamsは**複雑かつ大規模なタスク**に対してのみ使用する。使用を検討する場合は、**着手前に必ずユーザーへ使用許可を求める**こと。許可が得られない場合や小規模な場合は、基本の確認手順（メインコンテキスト）で確認する。

### 基本の確認手順

1. 各Issueについて、Phase 1の仕様から**変更が想定されるファイル・ディレクトリ・モジュール**を洗い出す
   - 必要に応じて `Grep` / `Glob` でコードベースを調査し、実際の影響範囲を特定する
   - backend / frontend / terraform のどのレイヤーに影響するかを明確にする
2. Issue同士で以下の観点の重複がないかを突き合わせる
   - 同一ファイルの編集
   - 同一ドメインモデル・エンティティ・スキーマの変更
   - 共通モジュール（共有ユーティリティ、型定義、DBマイグレーション等）の変更
   - APIインターフェースの破壊的変更による相互依存

### Agent Teamsによる並列確認

複雑・大規模な場合、コンフリクト確認を**複数のagent teamsで並列実施**して調査の網羅性と効率を高める。**ユーザーの使用許可を得たうえで**、以下の2段構成で実施する。

Agent Teamsは**ネスト不可・ロスターはフラット**（teammateはチームやteammateを生成できない）という制約がある。このため、複数チームの並列起動と最終的な突き合わせは、**メインコンテキスト（スキル本体）が統括する**。各フェーズ間の情報連携はTasks機能（TaskCreate/TaskUpdate/TaskGet/TaskList）のmetadataを用いる。

#### 第1段（並列）: Issue調査team

`<Issue番号群>`の**Issue件数分**のチーム（`team-issue-<番号>`）をメインコンテキストから並列起動する。各teamは担当Issueの「**変更範囲マップ**」を作成し、Tasks機能のmetadataに格納する。

| 役割 | 担当エージェント | 責務 |
| --- | --- | --- |
| Lead（影響範囲統合） | チームlead | 担当Issue仕様を把握し、メンバー結果を統合して変更範囲マップを構築・metadata格納 |
| Backend調査 | `code-investigator` | `backend/` のドメインモデル・エンティティ・スキーマ・APIインターフェースの変更範囲を特定 |
| Frontend調査 | `code-investigator` | `frontend/` のコンポーネント・型定義・API呼び出しの変更範囲を特定 |
| 共通資産調査 | `code-investigator` | 共有モジュール・型定義・DBマイグレーション・`terraform/` 等の共通領域を特定 |

- 小規模Issueは **Lead + 変更レイヤーに応じた1名** に縮小してよい

#### 第2段（収束）: 競合判定team

全Issueの変更範囲マップが揃ったら、メインコンテキストから**競合判定team（1チーム）**を起動する。第1段の全変更範囲マップを突き合わせ、競合有無を判定する。

| 役割 | 担当エージェント | 責務 |
| --- | --- | --- |
| Lead（判定統括） | チームlead | 全変更範囲マップを収集・突き合わせ、競合有無を判定しユーザー報告用にまとめる |
| 重複検出メンバー | `code-investigator` | 同一ファイル・ディレクトリの編集重複を検出 |
| ドメイン整合メンバー | `code-investigator` | 同一ドメインモデル・スキーマ・DBマイグレーション・破壊的API変更の相互依存を検出 |

判定観点は基本の確認手順と同じ（同一ファイルの編集 / 同一ドメインモデル・エンティティ・スキーマの変更 / 共通モジュールの変更 / APIインターフェースの破壊的変更による相互依存）。

競合判定teamの判定結果は、以下の「競合が検出された場合」「競合がない場合」へそのまま接続する。

### 競合が検出された場合

- **並列開発を開始せず**、検出した競合内容をユーザーに報告する
- 以下の対応方針を提示し、ユーザーの判断を仰ぐ
  - 競合するIssueは並列ではなく**順次実装**する
  - Issueの分割粒度を見直す
  - 共通部分を先行Issueとして切り出す
- ユーザーの承認なく競合のあるIssueを並列着手しない

### 競合がない場合

- 各Issueが独立して実装可能であることを確認した旨をユーザーに報告し、Phase 3へ進む

## Phase 3: worktreeのセットアップ

競合がないことを確認した各Issueについて、専用のworktreeを作成する。

### セットアップ手順

```bash
# Issueごとにworktreeを作成（<name> はIssue番号や機能名が分かる命名にする）
git worktree add -b <branch-name> .worktrees/<name>

# worktreeディレクトリに移動して開発環境を起動
cd .worktrees/<name>
make dev
```

> **注意:** `git worktree add` はブランチ作成を伴うが、`git commit` / `git push` ではないため許可確認は不要。ただしコミット・プッシュ時はプロジェクト規約に従いユーザーの実行許可を得ること。

`make dev` は以下を自動で実行する：

1. メインworktreeから `.env` をコピー（未存在時）
2. メインworktreeから `certs/` をコピー（未存在時）
3. ポートオフセットを算出して `.env` に `HOST_*_PORT` を追記（サブworktreeのみ）
4. `docker compose up -d` で起動
5. 割り当てポートを `.worktree-ports.txt` に記録

### 利用可能なコマンド

| コマンド | 内容 |
| --- | --- |
| `make dev` | 開発環境の起動（.env・certs/コピー + ポート割り当て + Docker起動） |
| `make down` | Docker停止 |
| `make status` | 現在のポート割り当てを表示 |

### ポート割り当て

- **メインworktree**: `docker-compose.yml` のデフォルト固定ポートを使用
- **サブworktree**: ディレクトリパスからオフセットを算出し、ポート競合を回避

割り当てられたポートは `.worktree-ports.txt` で確認できます。

### Claude Codeでの利用

```bash
# Claude Codeの--worktreeフラグでworktreeを自動作成して起動
claude --worktree <name>
```

## Phase 4: 各worktreeでの並列実装

各worktreeで対象Issueの実装を進める。

- 個別Issueの実装は `implement-task` スキルを利用する（`/implement-task <Issue番号>`）
- worktreeごとに独立した開発環境・ブランチで作業するため、相互に干渉せず並列に進行できる
- 実装完了後の検証は各worktreeの `make dev` フローで行う
