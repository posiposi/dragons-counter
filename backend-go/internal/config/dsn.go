package config

import (
	"errors"
	"fmt"
	"net"
	"net/url"
	"strings"
	"time"

	"github.com/go-sql-driver/mysql"
)

// BuildDSN は `mysql://user:pass@host:port/db?...` 形式のURLを
// go-sql-driver/mysql が要求するDSN形式へ変換する。
// 空文字・不正URL・非mysqlスキームの場合はエラーを返す。
// parseTime はクエリで明示されない限り true をデフォルトで付与する。
func BuildDSN(databaseURL string) (string, error) {
	if databaseURL == "" {
		return "", errors.New("DATABASE_URL is required")
	}

	u, err := url.Parse(databaseURL)
	if err != nil {
		return "", fmt.Errorf("invalid DATABASE_URL format: %w", err)
	}
	if u.Scheme != "mysql" {
		return "", fmt.Errorf("invalid DATABASE_URL format: unsupported scheme %q", u.Scheme)
	}

	cfg := mysql.NewConfig()
	cfg.User = u.User.Username()
	if pw, ok := u.User.Password(); ok {
		cfg.Passwd = pw
	}
	cfg.Net = "tcp"

	port := u.Port()
	if port == "" {
		port = "3306"
	}
	cfg.Addr = net.JoinHostPort(u.Hostname(), port)
	cfg.DBName = strings.TrimPrefix(u.Path, "/")
	cfg.ParseTime = true

	for key, values := range u.Query() {
		if len(values) == 0 {
			continue
		}
		value := values[0]
		switch key {
		case "parseTime":
			cfg.ParseTime = value == "true"
		case "loc":
			loc, err := time.LoadLocation(value)
			if err != nil {
				return "", fmt.Errorf("invalid loc parameter: %w", err)
			}
			cfg.Loc = loc
		case "collation":
			cfg.Collation = value
		default:
			if cfg.Params == nil {
				cfg.Params = map[string]string{}
			}
			cfg.Params[key] = value
		}
	}

	return cfg.FormatDSN(), nil
}
