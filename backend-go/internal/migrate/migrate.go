package migrate

import (
	"database/sql"
	"errors"
	"fmt"

	"github.com/golang-migrate/migrate/v4"
	migratemysql "github.com/golang-migrate/migrate/v4/database/mysql"
	"github.com/golang-migrate/migrate/v4/source/iofs"

	"github.com/posiposi/dragons-counter/backend-go/internal/config"
	"github.com/posiposi/dragons-counter/backend-go/migrations"

	_ "github.com/go-sql-driver/mysql"
)

// Up は埋め込まれたマイグレーションを最新まで適用する。
// 適用済みで変更がない場合はエラーとせずnilを返す。
func Up(cfg config.Config) error {
	m, database, err := newMigrate(cfg)
	if err != nil {
		return err
	}
	defer func() { _ = database.Close() }()

	if err := m.Up(); err != nil && !errors.Is(err, migrate.ErrNoChange) {
		return fmt.Errorf("failed to apply migrations: %w", err)
	}

	return nil
}

// Down は適用済みのマイグレーションをすべて巻き戻す。
// 巻き戻すものがない場合はエラーとせずnilを返す。
func Down(cfg config.Config) error {
	m, database, err := newMigrate(cfg)
	if err != nil {
		return err
	}
	defer func() { _ = database.Close() }()

	if err := m.Down(); err != nil && !errors.Is(err, migrate.ErrNoChange) {
		return fmt.Errorf("failed to revert migrations: %w", err)
	}

	return nil
}

// newMigrate はマイグレーション専用の短命接続を生成し、
// 埋め込みソースと紐づけたmigrateインスタンスを返す。
// 呼び出し側は返却されたDBをCloseする責務を負う。
func newMigrate(cfg config.Config) (*migrate.Migrate, *sql.DB, error) {
	dsn, err := config.BuildMigrationDSN(cfg.DatabaseURL)
	if err != nil {
		return nil, nil, err
	}

	database, err := sql.Open("mysql", dsn)
	if err != nil {
		return nil, nil, fmt.Errorf("failed to open migration database: %w", err)
	}

	source, err := iofs.New(migrations.FS, ".")
	if err != nil {
		_ = database.Close()
		return nil, nil, fmt.Errorf("failed to build migration source: %w", err)
	}

	driver, err := migratemysql.WithInstance(database, &migratemysql.Config{})
	if err != nil {
		_ = database.Close()
		return nil, nil, fmt.Errorf("failed to build migration driver: %w", err)
	}

	m, err := migrate.NewWithInstance("iofs", source, "mysql", driver)
	if err != nil {
		_ = database.Close()
		return nil, nil, fmt.Errorf("failed to build migrate instance: %w", err)
	}

	return m, database, nil
}
