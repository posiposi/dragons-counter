package db

import (
	"testing"

	"github.com/posiposi/dragons-counter/backend-go/internal/config"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestOpen(t *testing.T) {
	t.Run("DATABASE_URLが空の場合はDSN生成エラーを返す", func(t *testing.T) {
		cfg := config.Config{DatabaseURL: ""}

		database, err := Open(cfg)

		require.Error(t, err)
		assert.Nil(t, database)
	})

	t.Run("DATABASE_URLが非mysqlスキームの場合はDSN生成エラーを返す", func(t *testing.T) {
		cfg := config.Config{DatabaseURL: "postgres://user:pass@db:5432/dragons_counter"}

		database, err := Open(cfg)

		require.Error(t, err)
		assert.Nil(t, database)
	})
}
