package migrate

import (
	"database/sql"
	"errors"
	"fmt"

	"github.com/golang-migrate/migrate/v4"
	migratemysql "github.com/golang-migrate/migrate/v4/database/mysql"
	"github.com/golang-migrate/migrate/v4/source/iofs"

	"github.com/posiposi/dragons-counter/backend-go/migrations"
)

// Up は埋め込まれたマイグレーションを最新まで適用する。
// 適用済みで変更がない場合はエラーとせずnilを返す。
func Up(database *sql.DB) error {
	m, err := newMigrate(database)
	if err != nil {
		return err
	}

	if err := m.Up(); err != nil && !errors.Is(err, migrate.ErrNoChange) {
		return fmt.Errorf("failed to apply migrations: %w", err)
	}

	return nil
}

// Down は適用済みのマイグレーションをすべて巻き戻す。
// 巻き戻すものがない場合はエラーとせずnilを返す。
func Down(database *sql.DB) error {
	m, err := newMigrate(database)
	if err != nil {
		return err
	}

	if err := m.Down(); err != nil && !errors.Is(err, migrate.ErrNoChange) {
		return fmt.Errorf("failed to revert migrations: %w", err)
	}

	return nil
}

func newMigrate(database *sql.DB) (*migrate.Migrate, error) {
	source, err := iofs.New(migrations.FS, ".")
	if err != nil {
		return nil, fmt.Errorf("failed to build migration source: %w", err)
	}

	driver, err := migratemysql.WithInstance(database, &migratemysql.Config{})
	if err != nil {
		return nil, fmt.Errorf("failed to build migration driver: %w", err)
	}

	m, err := migrate.NewWithInstance("iofs", source, "mysql", driver)
	if err != nil {
		return nil, fmt.Errorf("failed to build migrate instance: %w", err)
	}

	return m, nil
}
