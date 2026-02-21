# ユーザー試合リレーション構築

## 概要

複数ユーザー登録に対応したことに伴い、ユーザーと試合の多対多リレーションを構築する。`games`テーブルを試合マスタとして責務を再定義し、ユーザーごとの観戦記録は中間テーブル`users_games`で管理する。また、スクレイピング実行権限をadminに移管する。

## 仕様分割

### 1. 中間テーブル作成

- `users`テーブルと`games`テーブルをリレーションする中間テーブル(`users_games`)を作成する
- 各種カラムは実装時にユーザーから指示を受けて決定する
- Issue: [#127](https://github.com/posiposi/dragons-counter/issues/127)

### 2. スクレイピング実行をユーザーからadminに移管

- ユーザーのページからスクレイピング実行導線（`GameScrapePanel`コンポーネント等）を削除する
- admin管理画面からのみスクレイピングを実行できるように変更する
- Issue: [#128](https://github.com/posiposi/dragons-counter/issues/128)

### 3. ユーザー試合観戦登録実装

- `games`テーブルは試合マスタとしてテーブルの責務を変更する
- ユーザーが観戦した試合を登録する場合は仕様1で作成した中間テーブル(`users_games`)にレコードをinsertする
- Issue: [#129](https://github.com/posiposi/dragons-counter/issues/129)

### 4. 観戦試合の論理削除方式変更

- 観戦試合の削除は中間テーブル(`users_games`)の該当レコードを論理削除する方式に変更する
- `games`テーブル（試合マスタ）のレコードは削除しない
- Issue: [#130](https://github.com/posiposi/dragons-counter/issues/130)
