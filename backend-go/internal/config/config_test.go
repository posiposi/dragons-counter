package config

import (
	"os"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestLoad(t *testing.T) {
	t.Run("GO_ENV=productionの場合はTLS無効でアドレス:3000の設定を返す", func(t *testing.T) {
		t.Setenv("GO_ENV", "production")

		cfg := Load()

		assert.Equal(t, "production", cfg.Env)
		assert.Equal(t, ":3000", cfg.Addr)
		assert.False(t, cfg.TLSEnabled)
		assert.Empty(t, cfg.CertFile)
		assert.Empty(t, cfg.KeyFile)
	})

	t.Run("GO_ENV=PRODUCTION（大文字）の場合は小文字化によりproduction扱いの設定を返す", func(t *testing.T) {
		t.Setenv("GO_ENV", "PRODUCTION")

		cfg := Load()

		assert.Equal(t, "production", cfg.Env)
		assert.Equal(t, ":3000", cfg.Addr)
		assert.False(t, cfg.TLSEnabled)
		assert.Empty(t, cfg.CertFile)
		assert.Empty(t, cfg.KeyFile)
	})

	t.Run("GO_ENVに前後空白がある場合はtrimによりproduction扱いの設定を返す", func(t *testing.T) {
		t.Setenv("GO_ENV", " production ")

		cfg := Load()

		assert.Equal(t, "production", cfg.Env)
		assert.Equal(t, ":3000", cfg.Addr)
		assert.False(t, cfg.TLSEnabled)
		assert.Empty(t, cfg.CertFile)
		assert.Empty(t, cfg.KeyFile)
	})

	t.Run("GO_ENV=developmentの場合はTLS有効でアドレス:3443・証明書パスの設定を返す", func(t *testing.T) {
		t.Setenv("GO_ENV", "development")

		cfg := Load()

		assert.Equal(t, "development", cfg.Env)
		assert.Equal(t, ":3443", cfg.Addr)
		assert.True(t, cfg.TLSEnabled)
		assert.Equal(t, "certs/localhost.pem", cfg.CertFile)
		assert.Equal(t, "certs/localhost-key.pem", cfg.KeyFile)
	})

	t.Run("GO_ENV未設定の場合はdevelopment扱いでTLS有効・アドレス:3443の設定を返す", func(t *testing.T) {
		// t.Setenv で終了時の復元を登録したうえで、テスト中は実際に未設定状態にする
		t.Setenv("GO_ENV", "")
		require.NoError(t, os.Unsetenv("GO_ENV"))

		cfg := Load()

		assert.Equal(t, "development", cfg.Env)
		assert.Equal(t, ":3443", cfg.Addr)
		assert.True(t, cfg.TLSEnabled)
		assert.Equal(t, "certs/localhost.pem", cfg.CertFile)
		assert.Equal(t, "certs/localhost-key.pem", cfg.KeyFile)
	})

	t.Run("GO_ENVが想定外の値の場合はdevelopment扱いでTLS有効・アドレス:3443の設定を返す", func(t *testing.T) {
		t.Setenv("GO_ENV", "staging")

		cfg := Load()

		assert.Equal(t, "development", cfg.Env)
		assert.Equal(t, ":3443", cfg.Addr)
		assert.True(t, cfg.TLSEnabled)
		assert.Equal(t, "certs/localhost.pem", cfg.CertFile)
		assert.Equal(t, "certs/localhost-key.pem", cfg.KeyFile)
	})
}
