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

		cfg, err := Load()

		require.NoError(t, err)
		assert.Equal(t, "production", cfg.Env)
		assert.Equal(t, ":3000", cfg.Addr)
		assert.False(t, cfg.TLSEnabled)
		assert.Empty(t, cfg.CertFile)
		assert.Empty(t, cfg.KeyFile)
	})

	t.Run("GO_ENV=PRODUCTION（大文字）の場合は小文字化によりproduction扱いの設定を返す", func(t *testing.T) {
		t.Setenv("GO_ENV", "PRODUCTION")

		cfg, err := Load()

		require.NoError(t, err)
		assert.Equal(t, "production", cfg.Env)
		assert.Equal(t, ":3000", cfg.Addr)
		assert.False(t, cfg.TLSEnabled)
		assert.Empty(t, cfg.CertFile)
		assert.Empty(t, cfg.KeyFile)
	})

	t.Run("GO_ENVに前後空白がある場合はtrimによりproduction扱いの設定を返す", func(t *testing.T) {
		t.Setenv("GO_ENV", " production ")

		cfg, err := Load()

		require.NoError(t, err)
		assert.Equal(t, "production", cfg.Env)
		assert.Equal(t, ":3000", cfg.Addr)
		assert.False(t, cfg.TLSEnabled)
		assert.Empty(t, cfg.CertFile)
		assert.Empty(t, cfg.KeyFile)
	})

	t.Run("GO_ENV=developmentの場合はTLS有効でアドレス:3443・証明書パスの設定を返す", func(t *testing.T) {
		t.Setenv("GO_ENV", "development")

		cfg, err := Load()

		require.NoError(t, err)
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

		cfg, err := Load()

		require.NoError(t, err)
		assert.Equal(t, "development", cfg.Env)
		assert.Equal(t, ":3443", cfg.Addr)
		assert.True(t, cfg.TLSEnabled)
		assert.Equal(t, "certs/localhost.pem", cfg.CertFile)
		assert.Equal(t, "certs/localhost-key.pem", cfg.KeyFile)
	})

	t.Run("GO_ENVが想定外の値の場合はdevelopment扱いでTLS有効・アドレス:3443の設定を返す", func(t *testing.T) {
		t.Setenv("GO_ENV", "staging")

		cfg, err := Load()

		require.NoError(t, err)
		assert.Equal(t, "development", cfg.Env)
		assert.Equal(t, ":3443", cfg.Addr)
		assert.True(t, cfg.TLSEnabled)
		assert.Equal(t, "certs/localhost.pem", cfg.CertFile)
		assert.Equal(t, "certs/localhost-key.pem", cfg.KeyFile)
	})
}

func TestLoadEnv(t *testing.T) {
	t.Run("環境変数が設定されている場合はConfigの各フィールドへマッピングされる", func(t *testing.T) {
		t.Setenv("DATABASE_URL", "mysql://user:pass@db:3306/dragons_counter")
		t.Setenv("JWT_SECRET", "secret-value")
		t.Setenv("PORT", "8080")
		t.Setenv("HTTPS_PORT", "8443")
		t.Setenv("ALLOWED_ORIGINS", "https://a.example.com,https://b.example.com")
		t.Setenv("API_GATEWAY_URL", "https://gw.example.com")
		t.Setenv("API_GATEWAY_API_KEY", "gw-key")
		t.Setenv("AWS_REGION", "us-east-1")
		t.Setenv("ADMIN_EMAIL", "admin@example.com")
		t.Setenv("ADMIN_DEFAULT_PASSWORD", "admin-pass")

		cfg, err := Load()

		require.NoError(t, err)
		assert.Equal(t, "mysql://user:pass@db:3306/dragons_counter", cfg.DatabaseURL)
		assert.Equal(t, "secret-value", cfg.JWTSecret)
		assert.Equal(t, "8080", cfg.Port)
		assert.Equal(t, "8443", cfg.HTTPSPort)
		assert.Equal(t, []string{"https://a.example.com", "https://b.example.com"}, cfg.AllowedOrigins)
		assert.Equal(t, "https://gw.example.com", cfg.APIGatewayURL)
		assert.Equal(t, "gw-key", cfg.APIGatewayAPIKey)
		assert.Equal(t, "us-east-1", cfg.AWSRegion)
		assert.Equal(t, "admin@example.com", cfg.AdminEmail)
		assert.Equal(t, "admin-pass", cfg.AdminDefaultPassword)
	})

	t.Run("PORT・HTTPS_PORT・AWS_REGION未設定時はデフォルト値が入る", func(t *testing.T) {
		for _, key := range []string{"PORT", "HTTPS_PORT", "AWS_REGION"} {
			t.Setenv(key, "")
			require.NoError(t, os.Unsetenv(key))
		}

		cfg, err := Load()

		require.NoError(t, err)
		assert.Equal(t, "3000", cfg.Port)
		assert.Equal(t, "3443", cfg.HTTPSPort)
		assert.Equal(t, "ap-northeast-1", cfg.AWSRegion)
	})

	t.Run("必須envが未設定でもLoadはエラーを返さずアプリ起動を継続できる", func(t *testing.T) {
		for _, key := range []string{"DATABASE_URL", "JWT_SECRET"} {
			t.Setenv(key, "")
			require.NoError(t, os.Unsetenv(key))
		}

		cfg, err := Load()

		require.NoError(t, err)
		assert.Empty(t, cfg.DatabaseURL)
		assert.Empty(t, cfg.JWTSecret)
	})

	t.Run("production環境ではPORTでリッスンアドレスが決まる", func(t *testing.T) {
		t.Setenv("GO_ENV", "production")
		t.Setenv("PORT", "8080")

		cfg, err := Load()

		require.NoError(t, err)
		assert.Equal(t, ":8080", cfg.Addr)
	})

	t.Run("development環境ではHTTPS_PORTでリッスンアドレスが決まる", func(t *testing.T) {
		t.Setenv("GO_ENV", "development")
		t.Setenv("HTTPS_PORT", "8443")

		cfg, err := Load()

		require.NoError(t, err)
		assert.Equal(t, ":8443", cfg.Addr)
	})
}
