//go:build integration

package persistence_test

import (
	"context"
	"testing"
	"time"

	"github.com/posiposi/dragons-counter/backend-go/internal/domain/repository"
	"github.com/posiposi/dragons-counter/backend-go/internal/infrastructure/persistence"
)

const bulkTestPrefix = "bulk-test-"

const (
	bantelinStadiumID = "a1b2c3d4-e5f6-7890-abcd-ef1234567001"
	koshienStadiumID  = "a1b2c3d4-e5f6-7890-abcd-ef1234567003"
)

func TestBulkCreateGameAdapter_BulkSave(t *testing.T) {
	db := setupDB(t)
	repo := persistence.NewGameRepository(db)
	adapter := persistence.NewBulkCreateGameAdapter(db, repo)

	// fixture: insert stadiums
	insertTestStadium(t, db, bantelinStadiumID, "バンテリンドーム")
	insertTestStadium(t, db, koshienStadiumID, "甲子園球場")

	t.Cleanup(func() {
		// cleanup all test games first (by stadium_id), then stadiums
		ctx := context.Background()
		db.ExecContext(ctx, "DELETE FROM games WHERE stadium_id IN (?, ?)", bantelinStadiumID, koshienStadiumID)
		cleanupTestGamesAndStadiums(t, db, nil, []string{bantelinStadiumID, koshienStadiumID})
	})

	t.Run("正常に1件保存できsavedCountが1になる", func(t *testing.T) {
		inputs := []repository.BulkCreateGameInput{
			{
				GameDate:      time.Date(2024, 4, 1, 0, 0, 0, 0, time.UTC),
				Opponent:      "阪神タイガース",
				DragonsScore:  5,
				OpponentScore: 3,
				StadiumName:   "バンテリンドーム",
			},
		}

		result := adapter.BulkSave(context.Background(), inputs)

		if result.SavedCount != 1 {
			t.Errorf("SavedCount: got %d, want %d", result.SavedCount, 1)
		}
		if result.SkippedCount != 0 {
			t.Errorf("SkippedCount: got %d, want %d", result.SkippedCount, 0)
		}
		if len(result.Errors) != 0 {
			t.Errorf("Errors: got %v, want empty", result.Errors)
		}
	})

	t.Run("日付が重複する場合はスキップされskippedCountが増加する", func(t *testing.T) {
		// 先にgameをDBに挿入
		gameDate := time.Date(2024, 5, 10, 0, 0, 0, 0, time.UTC)
		gameID := bulkTestPrefix + "dup-date"
		g := newTestGame(t, gameID, "読売ジャイアンツ", 3, 1, bantelinStadiumID, "バンテリンドーム", gameDate)
		if err := repo.Save(context.Background(), g); err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		t.Cleanup(func() {
			cleanupTestGamesAndStadiums(t, db, []string{gameID}, nil)
		})

		// 同日付でBulkSave
		inputs := []repository.BulkCreateGameInput{
			{
				GameDate:      gameDate,
				Opponent:      "広島東洋カープ",
				DragonsScore:  2,
				OpponentScore: 1,
				StadiumName:   "バンテリンドーム",
			},
		}

		result := adapter.BulkSave(context.Background(), inputs)

		if result.SavedCount != 0 {
			t.Errorf("SavedCount: got %d, want %d", result.SavedCount, 0)
		}
		if result.SkippedCount != 1 {
			t.Errorf("SkippedCount: got %d, want %d", result.SkippedCount, 1)
		}
		if len(result.Errors) != 0 {
			t.Errorf("Errors: got %v, want empty", result.Errors)
		}
	})

	t.Run("球場名が完全一致する場合に正しいUUIDが使われる", func(t *testing.T) {
		inputs := []repository.BulkCreateGameInput{
			{
				GameDate:      time.Date(2024, 6, 1, 0, 0, 0, 0, time.UTC),
				Opponent:      "阪神タイガース",
				DragonsScore:  1,
				OpponentScore: 0,
				StadiumName:   "甲子園球場",
			},
		}

		result := adapter.BulkSave(context.Background(), inputs)

		if result.SavedCount != 1 {
			t.Errorf("SavedCount: got %d, want %d", result.SavedCount, 1)
		}
		if len(result.Errors) != 0 {
			t.Errorf("Errors: got %v, want empty", result.Errors)
		}

		// DBから確認: stadium_idが甲子園のUUIDであること
		rows, err := db.QueryContext(context.Background(),
			"SELECT stadium_id FROM games WHERE game_date = ?", time.Date(2024, 6, 1, 0, 0, 0, 0, time.UTC))
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		defer rows.Close()

		if !rows.Next() {
			t.Fatal("expected a row but got none")
		}
		var stadiumID string
		if err := rows.Scan(&stadiumID); err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if stadiumID != koshienStadiumID {
			t.Errorf("stadium_id: got %v, want %v", stadiumID, koshienStadiumID)
		}
	})

	t.Run("球場名が部分一致でフォールバックする", func(t *testing.T) {
		inputs := []repository.BulkCreateGameInput{
			{
				GameDate:      time.Date(2024, 7, 1, 0, 0, 0, 0, time.UTC),
				Opponent:      "読売ジャイアンツ",
				DragonsScore:  2,
				OpponentScore: 2,
				StadiumName:   "バンテリンドーム ナゴヤドーム",
			},
		}

		result := adapter.BulkSave(context.Background(), inputs)

		if result.SavedCount != 1 {
			t.Errorf("SavedCount: got %d, want %d", result.SavedCount, 1)
		}
		if len(result.Errors) != 0 {
			t.Errorf("Errors: got %v, want empty", result.Errors)
		}

		// DBから確認: stadium_idがバンテリンドームのUUIDであること
		rows, err := db.QueryContext(context.Background(),
			"SELECT stadium_id FROM games WHERE game_date = ?", time.Date(2024, 7, 1, 0, 0, 0, 0, time.UTC))
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		defer rows.Close()

		if !rows.Next() {
			t.Fatal("expected a row but got none")
		}
		var stadiumID string
		if err := rows.Scan(&stadiumID); err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if stadiumID != bantelinStadiumID {
			t.Errorf("stadium_id: got %v, want %v", stadiumID, bantelinStadiumID)
		}
	})

	t.Run("未知の球場名はデフォルトのバンテリンドームになる", func(t *testing.T) {
		inputs := []repository.BulkCreateGameInput{
			{
				GameDate:      time.Date(2024, 8, 1, 0, 0, 0, 0, time.UTC),
				Opponent:      "横浜DeNAベイスターズ",
				DragonsScore:  4,
				OpponentScore: 3,
				StadiumName:   "未知のスタジアム",
			},
		}

		result := adapter.BulkSave(context.Background(), inputs)

		if result.SavedCount != 1 {
			t.Errorf("SavedCount: got %d, want %d", result.SavedCount, 1)
		}
		if len(result.Errors) != 0 {
			t.Errorf("Errors: got %v, want empty", result.Errors)
		}

		// DBから確認: stadium_idがバンテリンドームのUUIDであること
		rows, err := db.QueryContext(context.Background(),
			"SELECT stadium_id FROM games WHERE game_date = ?", time.Date(2024, 8, 1, 0, 0, 0, 0, time.UTC))
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		defer rows.Close()

		if !rows.Next() {
			t.Fatal("expected a row but got none")
		}
		var stadiumID string
		if err := rows.Scan(&stadiumID); err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if stadiumID != bantelinStadiumID {
			t.Errorf("stadium_id: got %v, want %v", stadiumID, bantelinStadiumID)
		}
	})

	t.Run("複数件を一括保存し集計が正しい", func(t *testing.T) {
		// 先に1件DBに挿入しておく（重複用）
		dupDate := time.Date(2024, 9, 15, 0, 0, 0, 0, time.UTC)
		gameID := bulkTestPrefix + "multi-dup"
		g := newTestGame(t, gameID, "広島東洋カープ", 1, 1, bantelinStadiumID, "バンテリンドーム", dupDate)
		if err := repo.Save(context.Background(), g); err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		t.Cleanup(func() {
			cleanupTestGamesAndStadiums(t, db, []string{gameID}, nil)
		})

		inputs := []repository.BulkCreateGameInput{
			{
				GameDate:      time.Date(2024, 9, 14, 0, 0, 0, 0, time.UTC),
				Opponent:      "阪神タイガース",
				DragonsScore:  3,
				OpponentScore: 2,
				StadiumName:   "バンテリンドーム",
			},
			{
				GameDate:      dupDate, // 重複
				Opponent:      "読売ジャイアンツ",
				DragonsScore:  0,
				OpponentScore: 1,
				StadiumName:   "バンテリンドーム",
			},
			{
				GameDate:      time.Date(2024, 9, 16, 0, 0, 0, 0, time.UTC),
				Opponent:      "横浜DeNAベイスターズ",
				DragonsScore:  5,
				OpponentScore: 0,
				StadiumName:   "バンテリンドーム",
			},
		}

		result := adapter.BulkSave(context.Background(), inputs)

		if result.SavedCount != 2 {
			t.Errorf("SavedCount: got %d, want %d", result.SavedCount, 2)
		}
		if result.SkippedCount != 1 {
			t.Errorf("SkippedCount: got %d, want %d", result.SkippedCount, 1)
		}
		if len(result.Errors) != 0 {
			t.Errorf("Errors: got %v, want empty", result.Errors)
		}
	})
}
