package migrate_test

import (
	"database/sql"
	"testing"

	"github.com/posiposi/dragons-counter/backend-go/internal/migrate"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	_ "github.com/go-sql-driver/mysql"
)

func openUnreachableDB(t *testing.T) *sql.DB {
	t.Helper()
	database, err := sql.Open("mysql", "user:pass@tcp(127.0.0.1:1)/nonexistent")
	require.NoError(t, err)
	return database
}

func TestUp(t *testing.T) {
	t.Run("接続できないDBを渡すとエラーを返す", func(t *testing.T) {
		database := openUnreachableDB(t)
		defer func() { _ = database.Close() }()

		err := migrate.Up(database)

		assert.Error(t, err)
	})
}

func TestDown(t *testing.T) {
	t.Run("接続できないDBを渡すとエラーを返す", func(t *testing.T) {
		database := openUnreachableDB(t)
		defer func() { _ = database.Close() }()

		err := migrate.Down(database)

		assert.Error(t, err)
	})
}
