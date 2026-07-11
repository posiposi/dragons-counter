package db

import (
	"context"
	"database/sql"
	"fmt"
)

// WithTx はトランザクション内でfnを実行するヘルパー関数。
// fn成功時はCommit、fnエラー時はRollback、fn内panicはRollback後にre-panicする。
func WithTx(ctx context.Context, pool *sql.DB, fn func(tx *sql.Tx) error) (err error) {
	tx, err := pool.BeginTx(ctx, nil)
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}

	defer func() {
		if p := recover(); p != nil {
			_ = tx.Rollback()
			panic(p)
		}
	}()

	if err := fn(tx); err != nil {
		_ = tx.Rollback()
		return err
	}

	return tx.Commit()
}
