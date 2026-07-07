package migrations_test

import (
	"io/fs"
	"testing"

	"github.com/posiposi/dragons-counter/backend-go/migrations"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestEmbeddedMigrations(t *testing.T) {
	t.Run("埋め込まれたマイグレーションSQLを読み取れる", func(t *testing.T) {
		entries, err := fs.ReadDir(migrations.FS, ".")
		require.NoError(t, err)

		names := make([]string, 0, len(entries))
		for _, entry := range entries {
			names = append(names, entry.Name())
		}

		assert.Contains(t, names, "000001_init_schema.up.sql")
		assert.Contains(t, names, "000001_init_schema.down.sql")
	})
}
