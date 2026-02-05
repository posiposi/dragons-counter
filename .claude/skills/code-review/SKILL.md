---
name: code-review
description: coderabbit CLIによるレビュー実行と、プロジェクト固有のDDD/CQRS観点での補足レビューを定義するスキル。
user-invocable: false
allowed-tools: Read, Glob, Grep, Bash, TaskUpdate, TaskGet, TaskList
---

# コードレビュースキル

## レビューフロー

レビューは以下の2段階で実施する。

### Phase 1: coderabbit CLIによるレビュー

coderabbit CLIを使用して自動レビューを実行する。

#### 実行コマンド

```bash
coderabbit review --prompt-only --type committed --base <ベースブランチ>
```

- `--prompt-only`: エージェント向けの最小出力
- `--type committed`: コミット済みの変更を対象とする
- `--base`: 比較対象のベースブランチ（通常はmainブランチ）

#### coderabbitがカバーする観点

以下の観点はcoderabbit CLIが検出するため、Phase 2では扱わない。

- 一般的なコード品質（不要コード、重複、複雑度）
- セキュリティ脆弱性（OWASP Top 10）
- 入力バリデーションの不足
- テストカバレッジの不足
- バグ（ロジックエラー、null参照等）

### Phase 2: プロジェクト固有観点の補足レビュー

coderabbitでは検出が難しいプロジェクト固有の規約・設計パターンを確認する。

#### 1. DDD層の責務分離

- ドメイン層がフレームワーク（NestJS）に依存していないか
- UseCase層がHTTP固有の概念（リクエスト/レスポンス）を扱っていないか
- Controller層にビジネスロジックが含まれていないか
- Adapter層がドメイン層のPortインターフェースを正しく実装しているか

#### 2. 依存関係の方向

- 依存性逆転の原則が守られているか（ドメイン層 ← 他の層）
- 集約間の参照がIDのみで行われているか
- UseCase間の直接的な依存・呼び出しがないか

#### 3. CQRSパターン

- Command UseCaseとQuery UseCaseが分離されているか
- Command PortとQuery Portが分離されているか
- Query UseCaseがドメインオブジェクトを経由せずDTOを返しているか

#### 4. DDD命名規則・不変性

- クラス名、メソッド名がDDD規約の命名規則に従っているか
- ファイル名がケバブケースで適切な命名か
- ドメインオブジェクトのプロパティがreadonly / privateか
- 状態変更が新しいインスタンスの返却で行われているか
- getterを通じたプロパティアクセスが実装されているか

#### 5. ファクトリメソッド

- コンストラクタがprivateか
- create / reconstruct 等のファクトリメソッドが提供されているか
- ファクトリメソッド内でバリデーションが行われているか

#### 6. テスト規約

- テスト名が期待する振る舞いを日本語で記述しているか
- テストファイルが規約通りの場所に配置されているか（`*.spec.ts`）
- 冗長なテストケースや、言語・フレームワーク機能自体をテストしているケースがないか

## レビュー結果の分類

### 重大（修正必須）

- coderabbitが検出したcriticalレベルの指摘
- DDD層の責務違反
- 依存関係の方向の誤り

### 改善推奨

- coderabbitが検出したsuggestionレベルの指摘
- DDD命名規則の改善余地
- テスト規約との乖離

### 良い点

- 適切なDDD設計
- 読みやすいコード
- 適切なテストカバレッジ
