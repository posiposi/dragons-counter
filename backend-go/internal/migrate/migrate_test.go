package migrate_test

import (
	"testing"

	"github.com/posiposi/dragons-counter/backend-go/internal/config"
	"github.com/posiposi/dragons-counter/backend-go/internal/migrate"
	"github.com/stretchr/testify/assert"

	_ "github.com/go-sql-driver/mysql"
)

func unreachableConfig() config.Config {
	return config.Config{
		DatabaseURL: "mysql://user:pass@127.0.0.1:1/nonexistent",
	}
}

func TestUp(t *testing.T) {
	t.Run("接続できないDBを指すConfigを渡すとエラーを返す", func(t *testing.T) {
		err := migrate.Up(unreachableConfig())

		assert.Error(t, err)
	})

	t.Run("DATABASE_URLが空のConfigを渡すとエラーを返す", func(t *testing.T) {
		err := migrate.Up(config.Config{})

		assert.Error(t, err)
	})
}

func TestDown(t *testing.T) {
	t.Run("接続できないDBを指すConfigを渡すとエラーを返す", func(t *testing.T) {
		err := migrate.Down(unreachableConfig())

		assert.Error(t, err)
	})
}
