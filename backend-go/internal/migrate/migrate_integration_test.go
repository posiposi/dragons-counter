//go:build integration

package migrate_test

import (
	"database/sql"
	"os"
	"testing"

	"github.com/posiposi/dragons-counter/backend-go/internal/config"
	"github.com/posiposi/dragons-counter/backend-go/internal/migrate"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	_ "github.com/go-sql-driver/mysql"
)

// 対象テーブル。usersとstadiumsはFK参照先のため先に生成される必要がある。
var migrationTables = []string{
	"stadiums",
	"users",
	"games",
	"user_registration_requests",
	"users_games",
}

// Node版(TypeORM)のマイグレーション定義に由来する制約/インデックス名。
// 各テーブルのSHOW CREATE TABLE出力に含まれることを検証する。
var expectedConstraintNames = map[string][]string{
	"stadiums":                   {"IDX_ceac6207277b20dcc9048a4751"},
	"users":                      {"IDX_97672ac88f789774dd47f7c8be"},
	"games":                      {"FK_d7f60119c29d181fda573c3a460"},
	"user_registration_requests": {"FK_9ec072b11958125c65afa5445ce"},
	"users_games": {
		"UQ_users_games_user_game",
		"FK_32e6fd6c60456d11f4fd948d4de",
		"FK_5709157a2bef3e8657f721c4734",
	},
}

func integrationConfig(t *testing.T) config.Config {
	t.Helper()

	databaseURL := os.Getenv("TEST_DATABASE_URL")
	if databaseURL == "" {
		t.Skip("TEST_DATABASE_URL is not set; skipping integration test")
	}

	return config.Config{DatabaseURL: databaseURL}
}

func openTestDB(t *testing.T, cfg config.Config) *sql.DB {
	t.Helper()

	dsn, err := config.BuildDSN(cfg.DatabaseURL)
	require.NoError(t, err)

	database, err := sql.Open("mysql", dsn)
	require.NoError(t, err)
	require.NoError(t, database.Ping())

	return database
}

func showCreateTable(t *testing.T, database *sql.DB, table string) string {
	t.Helper()

	var name, ddl string
	err := database.QueryRow("SHOW CREATE TABLE `"+table+"`").Scan(&name, &ddl)
	require.NoError(t, err)

	return ddl
}

func columnExists(t *testing.T, database *sql.DB, table, column string) bool {
	t.Helper()

	var name string
	err := database.QueryRow("SHOW COLUMNS FROM `"+table+"` LIKE '"+column+"'").Scan(
		&name, new(any), new(any), new(any), new(any), new(any),
	)
	if err == sql.ErrNoRows {
		return false
	}
	require.NoError(t, err)

	return true
}

func tableExists(t *testing.T, database *sql.DB, table string) bool {
	t.Helper()

	var name string
	err := database.QueryRow("SHOW TABLES LIKE '" + table + "'").Scan(&name)
	if err == sql.ErrNoRows {
		return false
	}
	require.NoError(t, err)

	return true
}

// resetSchema はgolang-migrateの管理外で残存したテーブル（Node版が生成したものを含む）を
// 強制的に削除し、Upが常にクリーンな状態から実行できるようにする。
func resetSchema(t *testing.T, database *sql.DB) {
	t.Helper()

	_, err := database.Exec("SET FOREIGN_KEY_CHECKS = 0")
	require.NoError(t, err)
	defer func() {
		_, _ = database.Exec("SET FOREIGN_KEY_CHECKS = 1")
	}()

	for _, table := range append([]string{"schema_migrations"}, migrationTables...) {
		_, err := database.Exec("DROP TABLE IF EXISTS `" + table + "`")
		require.NoError(t, err)
	}
}

func TestMigrationSchemaMatchesNodeDefinition(t *testing.T) {
	cfg := integrationConfig(t)

	database := openTestDB(t, cfg)
	defer func() { _ = database.Close() }()

	// 先行実行やNode版が残したdirty stateを避けるため、テスト開始前に強制リセットする。
	resetSchema(t, database)

	require.NoError(t, migrate.Up(cfg))

	t.Run("全テーブルがNode版の制約名を保持している", func(t *testing.T) {
		for _, table := range migrationTables {
			ddl := showCreateTable(t, database, table)
			for _, constraint := range expectedConstraintNames[table] {
				assert.Contains(t, ddl, constraint,
					"table %s must contain constraint %s", table, constraint)
			}
		}
	})

	t.Run("gamesにnotes/deleted_atカラムが存在しない", func(t *testing.T) {
		assert.False(t, columnExists(t, database, "games", "notes"))
		assert.False(t, columnExists(t, database, "games", "deleted_at"))
	})

	t.Run("users_gamesにdeleted_atカラムが存在する", func(t *testing.T) {
		assert.True(t, columnExists(t, database, "users_games", "deleted_at"))
	})

	t.Run("Down実行後に対象テーブルがすべて消滅する", func(t *testing.T) {
		require.NoError(t, migrate.Down(cfg))

		for _, table := range migrationTables {
			assert.False(t, tableExists(t, database, table),
				"table %s must be dropped after Down", table)
		}
	})
}
