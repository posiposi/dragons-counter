package db

import (
	"context"
	"database/sql"
	"fmt"
	"time"

	"github.com/posiposi/dragons-counter/backend-go/internal/config"

	_ "github.com/go-sql-driver/mysql"
)

const pingTimeout = 5 * time.Second

// Open はConfigからMySQLへの接続プールを生成し、疎通確認を行う。
// DSN生成・接続オープン・疎通確認のいずれかに失敗した場合はエラーを返す。
func Open(cfg config.Config) (*sql.DB, error) {
	dsn, err := config.BuildDSN(cfg.DatabaseURL)
	if err != nil {
		return nil, err
	}

	database, err := sql.Open("mysql", dsn)
	if err != nil {
		return nil, fmt.Errorf("failed to open database: %w", err)
	}

	database.SetMaxOpenConns(cfg.DBMaxOpenConns)
	database.SetMaxIdleConns(cfg.DBMaxIdleConns)
	database.SetConnMaxLifetime(cfg.DBConnMaxLifetime)
	database.SetConnMaxIdleTime(cfg.DBConnMaxIdleTime)

	ctx, cancel := context.WithTimeout(context.Background(), pingTimeout)
	defer cancel()

	if err := database.PingContext(ctx); err != nil {
		_ = database.Close()
		return nil, fmt.Errorf("failed to ping database: %w", err)
	}

	return database, nil
}
