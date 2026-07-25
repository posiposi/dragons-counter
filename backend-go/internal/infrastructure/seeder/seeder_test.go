//go:build integration

package seeder_test

import (
	"context"
	"database/sql"
	"os"
	"testing"

	_ "github.com/go-sql-driver/mysql"

	"github.com/posiposi/dragons-counter/backend-go/internal/config"
	"github.com/posiposi/dragons-counter/backend-go/internal/db/sqlc"
	"github.com/posiposi/dragons-counter/backend-go/internal/infrastructure/seeder"
)

const testAdminEmailPrefix = "seed-test-"

func setupDB(t *testing.T) *sql.DB {
	t.Helper()

	databaseURL := os.Getenv("TEST_DATABASE_URL")
	if databaseURL == "" {
		t.Fatal("TEST_DATABASE_URL is not set")
	}

	dsn, err := config.BuildDSN(databaseURL)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	database, err := sql.Open("mysql", dsn)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	t.Cleanup(func() { database.Close() })
	return database
}

func cleanupTestAdmin(t *testing.T, db *sql.DB, email string) {
	t.Helper()
	ctx := context.Background()
	queries := sqlc.New(db)

	user, err := queries.GetUserByEmail(ctx, email)
	if err != nil {
		return
	}

	_, _ = db.ExecContext(ctx, "DELETE FROM user_registration_requests WHERE user_id = ?", user.ID)
	_, _ = db.ExecContext(ctx, "DELETE FROM users WHERE id = ?", user.ID)
}

func TestSeedStadiums(t *testing.T) {
	db := setupDB(t)
	ctx := context.Background()

	t.Run("12球場がupsertされる", func(t *testing.T) {
		err := seeder.SeedStadiums(ctx, db)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		queries := sqlc.New(db)
		stadiums, err := queries.ListStadiums(ctx)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if len(stadiums) < 12 {
			t.Fatalf("got %d stadiums, want at least 12", len(stadiums))
		}

		expected := map[string]string{
			"a1b2c3d4-e5f6-7890-abcd-ef1234567001": "バンテリンドーム ナゴヤ",
			"a1b2c3d4-e5f6-7890-abcd-ef1234567002": "神宮球場",
			"a1b2c3d4-e5f6-7890-abcd-ef1234567003": "甲子園球場",
			"a1b2c3d4-e5f6-7890-abcd-ef1234567004": "東京ドーム",
			"a1b2c3d4-e5f6-7890-abcd-ef1234567005": "横浜スタジアム",
			"a1b2c3d4-e5f6-7890-abcd-ef1234567006": "マツダスタジアム",
			"a1b2c3d4-e5f6-7890-abcd-ef1234567007": "楽天モバイルパーク宮城",
			"a1b2c3d4-e5f6-7890-abcd-ef1234567008": "PayPayドーム",
			"a1b2c3d4-e5f6-7890-abcd-ef1234567009": "京セラドーム大阪",
			"a1b2c3d4-e5f6-7890-abcd-ef1234567010": "ZOZOマリンスタジアム",
			"a1b2c3d4-e5f6-7890-abcd-ef1234567011": "ベルーナドーム",
			"a1b2c3d4-e5f6-7890-abcd-ef1234567012": "エスコンフィールド北海道",
		}

		stadiumMap := make(map[string]string)
		for _, s := range stadiums {
			stadiumMap[s.ID] = s.Name
		}

		for id, wantName := range expected {
			gotName, ok := stadiumMap[id]
			if !ok {
				t.Errorf("stadium %s not found", id)
				continue
			}
			if gotName != wantName {
				t.Errorf("stadium %s: got %q, want %q", id, gotName, wantName)
			}
		}
	})

	t.Run("2回実行しても冪等", func(t *testing.T) {
		err := seeder.SeedStadiums(ctx, db)
		if err != nil {
			t.Fatalf("1st run: unexpected error: %v", err)
		}

		err = seeder.SeedStadiums(ctx, db)
		if err != nil {
			t.Fatalf("2nd run: unexpected error: %v", err)
		}

		queries := sqlc.New(db)
		stadiums, err := queries.ListStadiums(ctx)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		seededIDs := map[string]bool{
			"a1b2c3d4-e5f6-7890-abcd-ef1234567001": true,
			"a1b2c3d4-e5f6-7890-abcd-ef1234567002": true,
			"a1b2c3d4-e5f6-7890-abcd-ef1234567003": true,
			"a1b2c3d4-e5f6-7890-abcd-ef1234567004": true,
			"a1b2c3d4-e5f6-7890-abcd-ef1234567005": true,
			"a1b2c3d4-e5f6-7890-abcd-ef1234567006": true,
			"a1b2c3d4-e5f6-7890-abcd-ef1234567007": true,
			"a1b2c3d4-e5f6-7890-abcd-ef1234567008": true,
			"a1b2c3d4-e5f6-7890-abcd-ef1234567009": true,
			"a1b2c3d4-e5f6-7890-abcd-ef1234567010": true,
			"a1b2c3d4-e5f6-7890-abcd-ef1234567011": true,
			"a1b2c3d4-e5f6-7890-abcd-ef1234567012": true,
		}
		count := 0
		for _, s := range stadiums {
			if seededIDs[s.ID] {
				count++
			}
		}
		if count != 12 {
			t.Errorf("got %d seeded stadiums, want 12", count)
		}
	})

	t.Run("BulkCreateGameのstadiumNameToIDと一致する", func(t *testing.T) {
		expectedMapping := map[string]string{
			"a1b2c3d4-e5f6-7890-abcd-ef1234567001": "バンテリンドーム ナゴヤ",
			"a1b2c3d4-e5f6-7890-abcd-ef1234567002": "神宮球場",
			"a1b2c3d4-e5f6-7890-abcd-ef1234567003": "甲子園球場",
			"a1b2c3d4-e5f6-7890-abcd-ef1234567004": "東京ドーム",
			"a1b2c3d4-e5f6-7890-abcd-ef1234567005": "横浜スタジアム",
			"a1b2c3d4-e5f6-7890-abcd-ef1234567006": "マツダスタジアム",
		}

		seederStadiums := seeder.Stadiums()
		seederMap := make(map[string]string)
		for _, s := range seederStadiums {
			seederMap[s.ID] = s.Name
		}

		for id, wantName := range expectedMapping {
			gotName, ok := seederMap[id]
			if !ok {
				t.Errorf("seeder missing stadium ID %s", id)
				continue
			}
			if gotName != wantName {
				t.Errorf("stadium %s: got %q, want %q", id, gotName, wantName)
			}
		}
	})
}

func TestSeedAdminUser(t *testing.T) {
	db := setupDB(t)
	ctx := context.Background()

	t.Run("管理者ユーザーが作成される", func(t *testing.T) {
		email := testAdminEmailPrefix + "admin@example.com"
		password := "test-password-123"

		t.Cleanup(func() { cleanupTestAdmin(t, db, email) })

		err := seeder.SeedAdminUser(ctx, db, email, password)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		queries := sqlc.New(db)
		user, err := queries.GetUserByEmail(ctx, email)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if user.Role != sqlc.UsersRoleAdmin {
			t.Errorf("role: got %v, want %v", user.Role, sqlc.UsersRoleAdmin)
		}

		reg, err := queries.GetLatestRegistrationByUserID(ctx, user.ID)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if reg.Status != sqlc.UserRegistrationRequestsStatusApproved {
			t.Errorf("status: got %v, want %v", reg.Status, sqlc.UserRegistrationRequestsStatusApproved)
		}
	})

	t.Run("既存の場合はスキップされる", func(t *testing.T) {
		email := testAdminEmailPrefix + "existing@example.com"
		password := "test-password-123"

		t.Cleanup(func() { cleanupTestAdmin(t, db, email) })

		err := seeder.SeedAdminUser(ctx, db, email, password)
		if err != nil {
			t.Fatalf("1st run: unexpected error: %v", err)
		}

		err = seeder.SeedAdminUser(ctx, db, email, password)
		if err != nil {
			t.Fatalf("2nd run: unexpected error: %v", err)
		}
	})

	t.Run("空のメールアドレスの場合はスキップされる", func(t *testing.T) {
		err := seeder.SeedAdminUser(ctx, db, "", "some-password")
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
	})

	t.Run("空のパスワードの場合はスキップされる", func(t *testing.T) {
		err := seeder.SeedAdminUser(ctx, db, "a@b.c", "")
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
	})
}
