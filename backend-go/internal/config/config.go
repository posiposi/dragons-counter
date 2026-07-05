// Package config は環境変数に基づくサーバ設定の読み込みを提供する。
package config

import (
	"os"
	"strings"
)

// Config はサーバ起動に必要な設定値を保持する。
type Config struct {
	// Env は解決済みの実行環境名（"production" または "development"。
	// GO_ENV が production 以外の場合はすべて "development" になる）。
	Env string
	// Addr はサーバの待ち受けアドレス。
	Addr string
	// TLSEnabled はTLSで待ち受けるかどうかを示す。
	TLSEnabled bool
	// CertFile はTLS証明書ファイルのパス（プロセスのカレントディレクトリからの相対パス。TLS無効時は空）。
	CertFile string
	// KeyFile はTLS秘密鍵ファイルのパス（プロセスのカレントディレクトリからの相対パス。TLS無効時は空）。
	KeyFile string
}

// Load は環境変数 GO_ENV に基づいてサーバ設定を返す。
// "production"（大文字小文字・前後空白は無視）の場合はHTTP(:3000)、
// それ以外はすべて開発環境としてTLS(:3443)の設定を返す。
func Load() Config {
	env := strings.ToLower(strings.TrimSpace(os.Getenv("GO_ENV")))
	if env == "production" {
		return Config{
			Env:        "production",
			Addr:       ":3000",
			TLSEnabled: false,
			CertFile:   "",
			KeyFile:    "",
		}
	}
	return Config{
		Env:        "development",
		Addr:       ":3443",
		TLSEnabled: true,
		CertFile:   "certs/localhost.pem",
		KeyFile:    "certs/localhost-key.pem",
	}
}
