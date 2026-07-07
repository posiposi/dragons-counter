package config

import (
	"testing"

	"github.com/go-sql-driver/mysql"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestBuildDSN(t *testing.T) {
	t.Run("mysql://形式をgo-sql-driverのDSN形式へ変換しparseTime=trueを付与する", func(t *testing.T) {
		dsn, err := BuildDSN("mysql://user:pass@db:3306/dragons_counter")

		require.NoError(t, err)
		assert.Equal(t, "user:pass@tcp(db:3306)/dragons_counter?parseTime=true", dsn)
	})

	t.Run("ポート未指定の場合は3306を補完する", func(t *testing.T) {
		dsn, err := BuildDSN("mysql://user:pass@db/dragons_counter")

		require.NoError(t, err)
		assert.Equal(t, "user:pass@tcp(db:3306)/dragons_counter?parseTime=true", dsn)
	})

	t.Run("パスワードに特殊文字を含む場合も往復パースで元の値を復元できる", func(t *testing.T) {
		// パスワードは p@ss:w/rd（@ : / を含む）をURLエンコードして渡す
		dsn, err := BuildDSN("mysql://user:p%40ss%3Aw%2Frd@db:3306/dragons_counter")

		require.NoError(t, err)

		parsed, err := mysql.ParseDSN(dsn)
		require.NoError(t, err)
		assert.Equal(t, "user", parsed.User)
		assert.Equal(t, "p@ss:w/rd", parsed.Passwd)
		assert.Equal(t, "db:3306", parsed.Addr)
		assert.Equal(t, "dragons_counter", parsed.DBName)
		assert.True(t, parsed.ParseTime)
	})

	t.Run("クエリパラメータcharset・locを引き継ぎparseTimeを維持する", func(t *testing.T) {
		dsn, err := BuildDSN("mysql://user:pass@db:3306/dragons_counter?charset=utf8mb4&loc=Asia%2FTokyo")

		require.NoError(t, err)
		// charset は生成DSN文字列へ引き継がれる
		assert.Contains(t, dsn, "charset=utf8mb4")

		parsed, err := mysql.ParseDSN(dsn)
		require.NoError(t, err)
		assert.Equal(t, "Asia/Tokyo", parsed.Loc.String())
		assert.True(t, parsed.ParseTime)
	})

	t.Run("parseTime=falseがクエリで明示された場合はfalseを反映する", func(t *testing.T) {
		dsn, err := BuildDSN("mysql://user:pass@db:3306/dragons_counter?parseTime=false")

		require.NoError(t, err)

		parsed, err := mysql.ParseDSN(dsn)
		require.NoError(t, err)
		assert.False(t, parsed.ParseTime)
	})

	t.Run("空文字の場合はDATABASE_URL is requiredエラーを返す", func(t *testing.T) {
		_, err := BuildDSN("")

		require.Error(t, err)
		assert.Contains(t, err.Error(), "DATABASE_URL is required")
	})

	t.Run("mysql以外のスキームの場合はフォーマットエラーを返す", func(t *testing.T) {
		_, err := BuildDSN("postgres://user:pass@db:5432/dragons_counter")

		require.Error(t, err)
		assert.Contains(t, err.Error(), "invalid DATABASE_URL format")
	})

	t.Run("パースできない不正なURLの場合はフォーマットエラーを返す", func(t *testing.T) {
		_, err := BuildDSN("://not-a-valid-url")

		require.Error(t, err)
		assert.Contains(t, err.Error(), "invalid DATABASE_URL format")
	})
}

func TestBuildMigrationDSN(t *testing.T) {
	t.Run("multiStatements=trueを強制付与する", func(t *testing.T) {
		dsn, err := BuildMigrationDSN("mysql://user:pass@db:3306/dragons_counter")

		require.NoError(t, err)

		parsed, err := mysql.ParseDSN(dsn)
		require.NoError(t, err)
		assert.True(t, parsed.MultiStatements)
		assert.True(t, parsed.ParseTime)
		assert.Equal(t, "user", parsed.User)
		assert.Equal(t, "pass", parsed.Passwd)
		assert.Equal(t, "db:3306", parsed.Addr)
		assert.Equal(t, "dragons_counter", parsed.DBName)
	})

	t.Run("クエリでmultiStatements=falseが指定されてもtrueを強制する", func(t *testing.T) {
		dsn, err := BuildMigrationDSN("mysql://user:pass@db:3306/dragons_counter?multiStatements=false")

		require.NoError(t, err)

		parsed, err := mysql.ParseDSN(dsn)
		require.NoError(t, err)
		assert.True(t, parsed.MultiStatements)
	})

	t.Run("BuildDSNのmultiStatementsには影響しない", func(t *testing.T) {
		dsn, err := BuildDSN("mysql://user:pass@db:3306/dragons_counter")

		require.NoError(t, err)

		parsed, err := mysql.ParseDSN(dsn)
		require.NoError(t, err)
		assert.False(t, parsed.MultiStatements)
	})

	t.Run("空文字の場合はDATABASE_URL is requiredエラーを返す", func(t *testing.T) {
		_, err := BuildMigrationDSN("")

		require.Error(t, err)
		assert.Contains(t, err.Error(), "DATABASE_URL is required")
	})
}
