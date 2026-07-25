package seeder

import (
	"context"
	"database/sql"
	"fmt"
	"time"

	"github.com/posiposi/dragons-counter/backend-go/internal/db/sqlc"
)

type stadiumEntry struct {
	ID   string
	Name string
}

var stadiums = []stadiumEntry{
	{"a1b2c3d4-e5f6-7890-abcd-ef1234567001", "バンテリンドーム ナゴヤ"},
	{"a1b2c3d4-e5f6-7890-abcd-ef1234567002", "神宮球場"},
	{"a1b2c3d4-e5f6-7890-abcd-ef1234567003", "甲子園球場"},
	{"a1b2c3d4-e5f6-7890-abcd-ef1234567004", "東京ドーム"},
	{"a1b2c3d4-e5f6-7890-abcd-ef1234567005", "横浜スタジアム"},
	{"a1b2c3d4-e5f6-7890-abcd-ef1234567006", "マツダスタジアム"},
	{"a1b2c3d4-e5f6-7890-abcd-ef1234567007", "楽天モバイルパーク宮城"},
	{"a1b2c3d4-e5f6-7890-abcd-ef1234567008", "PayPayドーム"},
	{"a1b2c3d4-e5f6-7890-abcd-ef1234567009", "京セラドーム大阪"},
	{"a1b2c3d4-e5f6-7890-abcd-ef1234567010", "ZOZOマリンスタジアム"},
	{"a1b2c3d4-e5f6-7890-abcd-ef1234567011", "ベルーナドーム"},
	{"a1b2c3d4-e5f6-7890-abcd-ef1234567012", "エスコンフィールド北海道"},
}

func Stadiums() []stadiumEntry {
	result := make([]stadiumEntry, len(stadiums))
	copy(result, stadiums)
	return result
}

func SeedStadiums(ctx context.Context, pool *sql.DB) error {
	queries := sqlc.New(pool)
	now := time.Now()

	for _, s := range stadiums {
		err := queries.UpsertStadium(ctx, sqlc.UpsertStadiumParams{
			ID:        s.ID,
			Name:      s.Name,
			CreatedAt: now,
			UpdatedAt: now,
		})
		if err != nil {
			return fmt.Errorf("failed to upsert stadium %s: %w", s.Name, err)
		}
	}
	return nil
}
