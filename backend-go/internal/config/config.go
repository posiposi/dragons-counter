package config

import (
	"os"
	"strings"

	"github.com/caarlos0/env/v11"
)

type Config struct {
	Env        string
	Addr       string
	TLSEnabled bool
	CertFile   string
	KeyFile    string

	DatabaseURL          string   `env:"DATABASE_URL"`
	JWTSecret            string   `env:"JWT_SECRET"`
	Port                 string   `env:"PORT" envDefault:"3000"`
	HTTPSPort            string   `env:"HTTPS_PORT" envDefault:"3443"`
	AllowedOrigins       []string `env:"ALLOWED_ORIGINS" envSeparator:","`
	APIGatewayURL        string   `env:"API_GATEWAY_URL"`
	APIGatewayAPIKey     string   `env:"API_GATEWAY_API_KEY"`
	AWSRegion            string   `env:"AWS_REGION" envDefault:"ap-northeast-1"`
	AdminEmail           string   `env:"ADMIN_EMAIL"`
	AdminDefaultPassword string   `env:"ADMIN_DEFAULT_PASSWORD"`
}

func Load() (Config, error) {
	var cfg Config
	if err := env.Parse(&cfg); err != nil {
		return Config{}, err
	}

	applyRuntimeMode(&cfg)

	return cfg, nil
}

// applyRuntimeMode はGO_ENVを正規化し、実行モードに応じた
// リッスンアドレス・TLS設定・証明書パスを決定する。
func applyRuntimeMode(cfg *Config) {
	goEnv := strings.ToLower(strings.TrimSpace(os.Getenv("GO_ENV")))
	if goEnv == "production" {
		cfg.Env = "production"
		cfg.Addr = ":" + cfg.Port
		cfg.TLSEnabled = false
		cfg.CertFile = ""
		cfg.KeyFile = ""
		return
	}

	cfg.Env = "development"
	cfg.Addr = ":" + cfg.HTTPSPort
	cfg.TLSEnabled = true
	cfg.CertFile = "certs/localhost.pem"
	cfg.KeyFile = "certs/localhost-key.pem"
}
