//go:build integration

package db_test

import (
	"context"
	"database/sql"
	"errors"
	"os"
	"testing"
	"time"

	"github.com/posiposi/dragons-counter/backend-go/internal/config"
	"github.com/posiposi/dragons-counter/backend-go/internal/db"

	_ "github.com/go-sql-driver/mysql"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

const testIDPrefix = "tx-test-"

func setupTestDB(t *testing.T) *sql.DB {
	t.Helper()

	databaseURL := os.Getenv("TEST_DATABASE_URL")
	if databaseURL == "" {
		t.Fatal("TEST_DATABASE_URL is not set")
	}

	dsn, err := config.BuildDSN(databaseURL)
	require.NoError(t, err)

	database, err := sql.Open("mysql", dsn)
	require.NoError(t, err)

	t.Cleanup(func() {
		database.Close()
	})

	return database
}

func cleanupTestData(t *testing.T, database *sql.DB, testID string) {
	t.Helper()
	_, err := database.ExecContext(context.Background(), "DELETE FROM stadiums WHERE id = ?", testID)
	require.NoError(t, err)
}

func TestWithTx(t *testing.T) {
	pool := setupTestDB(t)

	t.Run("コールバック成功時にcommitされデータが永続化される", func(t *testing.T) {
		testID := testIDPrefix + "commit-ok"
		cleanupTestData(t, pool, testID)
		t.Cleanup(func() { cleanupTestData(t, pool, testID) })

		now := time.Now().Truncate(time.Second)

		err := db.WithTx(context.Background(), pool, func(tx *sql.Tx) error {
			_, err := tx.ExecContext(context.Background(),
				"INSERT INTO stadiums (id, name, created_at, updated_at) VALUES (?, ?, ?, ?)",
				testID, "テスト球場", now, now,
			)
			return err
		})
		require.NoError(t, err)

		var name string
		err = pool.QueryRowContext(context.Background(),
			"SELECT name FROM stadiums WHERE id = ?", testID,
		).Scan(&name)
		require.NoError(t, err)
		assert.Equal(t, "テスト球場", name)
	})

	t.Run("コールバックがエラーを返した場合にrollbackされデータが存在しない", func(t *testing.T) {
		testID := testIDPrefix + "rollback-err"
		cleanupTestData(t, pool, testID)
		t.Cleanup(func() { cleanupTestData(t, pool, testID) })

		now := time.Now().Truncate(time.Second)
		callbackErr := errors.New("intentional error")

		err := db.WithTx(context.Background(), pool, func(tx *sql.Tx) error {
			_, execErr := tx.ExecContext(context.Background(),
				"INSERT INTO stadiums (id, name, created_at, updated_at) VALUES (?, ?, ?, ?)",
				testID, "ロールバック球場", now, now,
			)
			if execErr != nil {
				return execErr
			}
			return callbackErr
		})
		require.ErrorIs(t, err, callbackErr)

		var count int
		err = pool.QueryRowContext(context.Background(),
			"SELECT COUNT(*) FROM stadiums WHERE id = ?", testID,
		).Scan(&count)
		require.NoError(t, err)
		assert.Equal(t, 0, count)
	})

	t.Run("コールバック内でpanicが発生した場合にrollbackされre-panicする", func(t *testing.T) {
		testID := testIDPrefix + "rollback-panic"
		cleanupTestData(t, pool, testID)
		t.Cleanup(func() { cleanupTestData(t, pool, testID) })

		now := time.Now().Truncate(time.Second)

		assert.PanicsWithValue(t, "intentional panic", func() {
			_ = db.WithTx(context.Background(), pool, func(tx *sql.Tx) error {
				_, err := tx.ExecContext(context.Background(),
					"INSERT INTO stadiums (id, name, created_at, updated_at) VALUES (?, ?, ?, ?)",
					testID, "パニック球場", now, now,
				)
				if err != nil {
					return err
				}
				panic("intentional panic")
			})
		})

		var count int
		err := pool.QueryRowContext(context.Background(),
			"SELECT COUNT(*) FROM stadiums WHERE id = ?", testID,
		).Scan(&count)
		require.NoError(t, err)
		assert.Equal(t, 0, count)
	})
}

