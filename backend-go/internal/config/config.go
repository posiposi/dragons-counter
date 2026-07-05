package config

import (
	"os"
	"strings"
)

type Config struct {
	Env        string
	Addr       string
	TLSEnabled bool
	CertFile   string
	KeyFile    string
}

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
