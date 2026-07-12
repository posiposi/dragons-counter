//go:build integration

package persistence_test

import (
	"context"
	"database/sql"
	"os"
	"testing"
	"time"

	_ "github.com/go-sql-driver/mysql"

	"github.com/posiposi/dragons-counter/backend-go/internal/config"
	"github.com/posiposi/dragons-counter/backend-go/internal/db/sqlc"
	"github.com/posiposi/dragons-counter/backend-go/internal/domain/model"
	"github.com/posiposi/dragons-counter/backend-go/internal/infrastructure/persistence"
)

const testPrefix = "repo-test-"

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

func insertTestStadium(t *testing.T, db *sql.DB, id, name string) {
	t.Helper()
	now := time.Now().Truncate(time.Second)
	queries := sqlc.New(db)
	err := queries.UpsertStadium(context.Background(), sqlc.UpsertStadiumParams{
		ID:        id,
		Name:      name,
		CreatedAt: now,
		UpdatedAt: now,
	})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
}

func cleanupTestGamesAndStadiums(t *testing.T, db *sql.DB, gameIDs []string, stadiumIDs []string) {
	t.Helper()
	ctx := context.Background()
	for _, id := range gameIDs {
		_, err := db.ExecContext(ctx, "DELETE FROM games WHERE id = ?", id)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
	}
	for _, id := range stadiumIDs {
		_, err := db.ExecContext(ctx, "DELETE FROM stadiums WHERE id = ?", id)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
	}
}

func newTestGame(t *testing.T, id, opponent string, dragonsScore, opponentScore int, stadiumID, stadiumName string, gameDate time.Time) model.Game {
	t.Helper()

	gid, err := model.ParseGameID(id)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	gd, err := model.NewGameDate(gameDate)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	opp, err := model.NewOpponent(opponent)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	ds, err := model.NewScore(dragonsScore)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	os, err := model.NewScore(opponentScore)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	sid, err := model.ParseStadiumID(stadiumID)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	sn, err := model.NewStadiumName(stadiumName)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	stadium := model.NewStadium(sid, sn)

	now := time.Now().Truncate(time.Second)
	return model.NewGame(gid, gd, opp, ds, os, stadium, now, now)
}

func TestGameRepository_Save(t *testing.T) {
	db := setupDB(t)
	repo := persistence.NewGameRepository(db)

	stadiumID := testPrefix + "stadium-save"
	stadiumName := "バンテリンドーム ナゴヤ"
	insertTestStadium(t, db, stadiumID, stadiumName)

	tests := []struct {
		name          string
		gameID        string
		opponent      string
		dragonsScore  int
		opponentScore int
		wantResult    model.GameResultValue
	}{
		{
			name:          "勝利の試合を保存しFindByIDで全フィールドを検証できる",
			gameID:        testPrefix + "game-save-win",
			opponent:      "阪神タイガース",
			dragonsScore:  5,
			opponentScore: 3,
			wantResult:    model.Win,
		},
		{
			name:          "敗北の試合を保存しFindByIDで全フィールドを検証できる",
			gameID:        testPrefix + "game-save-lose",
			opponent:      "読売ジャイアンツ",
			dragonsScore:  1,
			opponentScore: 4,
			wantResult:    model.Lose,
		},
		{
			name:          "引き分けの試合を保存しFindByIDで全フィールドを検証できる",
			gameID:        testPrefix + "game-save-draw",
			opponent:      "広島東洋カープ",
			dragonsScore:  2,
			opponentScore: 2,
			wantResult:    model.Draw,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			gameDate := time.Date(2025, 6, 15, 18, 0, 0, 0, time.UTC)
			g := newTestGame(t, tt.gameID, tt.opponent, tt.dragonsScore, tt.opponentScore, stadiumID, stadiumName, gameDate)

			t.Cleanup(func() {
				cleanupTestGamesAndStadiums(t, db, []string{tt.gameID}, nil)
			})

			err := repo.Save(context.Background(), g)
			if err != nil {
				t.Fatalf("unexpected error: %v", err)
			}

			found, err := repo.FindByID(context.Background(), g.ID())
			if err != nil {
				t.Fatalf("unexpected error: %v", err)
			}
			if found == nil {
				t.Fatal("got nil, want non-nil")
			}

			if got := found.ID().Value(); got != tt.gameID {
				t.Errorf("ID: got %v, want %v", got, tt.gameID)
			}
			if got := found.Opponent().Value(); got != tt.opponent {
				t.Errorf("Opponent: got %v, want %v", got, tt.opponent)
			}
			if got := found.DragonsScore().Value(); got != tt.dragonsScore {
				t.Errorf("DragonsScore: got %v, want %v", got, tt.dragonsScore)
			}
			if got := found.OpponentScore().Value(); got != tt.opponentScore {
				t.Errorf("OpponentScore: got %v, want %v", got, tt.opponentScore)
			}
			if got := found.Result().Value(); got != tt.wantResult {
				t.Errorf("Result: got %v, want %v", got, tt.wantResult)
			}
			if got := found.Stadium().Name().Value(); got != stadiumName {
				t.Errorf("Stadium.Name: got %v, want %v", got, stadiumName)
			}
			if got := found.Stadium().ID().Value(); got != stadiumID {
				t.Errorf("Stadium.ID: got %v, want %v", got, stadiumID)
			}
		})
	}

	t.Cleanup(func() {
		cleanupTestGamesAndStadiums(t, db, nil, []string{stadiumID})
	})
}

func TestGameRepository_FindAll(t *testing.T) {
	db := setupDB(t)
	repo := persistence.NewGameRepository(db)

	stadiumID := testPrefix + "stadium-findall"
	stadiumName := "東京ドーム"
	insertTestStadium(t, db, stadiumID, stadiumName)

	gameID1 := testPrefix + "game-findall-1"
	gameID2 := testPrefix + "game-findall-2"
	date1 := time.Date(2025, 6, 14, 18, 0, 0, 0, time.UTC)
	date2 := time.Date(2025, 6, 15, 18, 0, 0, 0, time.UTC)

	g1 := newTestGame(t, gameID1, "阪神タイガース", 3, 1, stadiumID, stadiumName, date1)
	g2 := newTestGame(t, gameID2, "読売ジャイアンツ", 2, 5, stadiumID, stadiumName, date2)

	if err := repo.Save(context.Background(), g1); err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if err := repo.Save(context.Background(), g2); err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	t.Cleanup(func() {
		cleanupTestGamesAndStadiums(t, db, []string{gameID1, gameID2}, []string{stadiumID})
	})

	games, err := repo.FindAll(context.Background())
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	// FindAllは他テストのデータも含む可能性があるため、挿入した2件が含まれることを確認
	foundIDs := make(map[string]bool)
	for _, g := range games {
		foundIDs[g.ID().Value()] = true
	}
	if !foundIDs[gameID1] {
		t.Error("game1が結果に含まれるべき")
	}
	if !foundIDs[gameID2] {
		t.Error("game2が結果に含まれるべき")
	}

	// 日付降順を確認: date2(6/15) > date1(6/14) なのでgame2が先に来る
	var idx1, idx2 int
	for i, g := range games {
		switch g.ID().Value() {
		case gameID1:
			idx1 = i
		case gameID2:
			idx2 = i
		}
	}
	if idx2 >= idx1 {
		t.Errorf("新しい日付の試合が先に来るべき: idx2=%d, idx1=%d", idx2, idx1)
	}

	// stadium名の検証
	for _, g := range games {
		if g.ID().Value() == gameID1 || g.ID().Value() == gameID2 {
			if got := g.Stadium().Name().Value(); got != stadiumName {
				t.Errorf("Stadium.Name: got %v, want %v", got, stadiumName)
			}
		}
	}
}

func TestGameRepository_FindByIDs(t *testing.T) {
	db := setupDB(t)
	repo := persistence.NewGameRepository(db)

	stadiumID := testPrefix + "stadium-findbyids"
	stadiumName := "甲子園球場"
	insertTestStadium(t, db, stadiumID, stadiumName)

	gameID1 := testPrefix + "game-byids-1"
	gameID2 := testPrefix + "game-byids-2"
	gameDate := time.Date(2025, 6, 15, 18, 0, 0, 0, time.UTC)

	g1 := newTestGame(t, gameID1, "阪神タイガース", 3, 1, stadiumID, stadiumName, gameDate)
	g2 := newTestGame(t, gameID2, "読売ジャイアンツ", 0, 2, stadiumID, stadiumName, gameDate)

	if err := repo.Save(context.Background(), g1); err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if err := repo.Save(context.Background(), g2); err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	t.Cleanup(func() {
		cleanupTestGamesAndStadiums(t, db, []string{gameID1, gameID2}, []string{stadiumID})
	})

	t.Run("指定した2件のIDで2件返却される", func(t *testing.T) {
		id1, _ := model.ParseGameID(gameID1)
		id2, _ := model.ParseGameID(gameID2)

		games, err := repo.FindByIDs(context.Background(), []model.GameID{id1, id2})
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if len(games) != 2 {
			t.Fatalf("got len %d, want %d", len(games), 2)
		}
	})

	t.Run("存在しないIDを含む場合は存在分のみ返却される", func(t *testing.T) {
		id1, _ := model.ParseGameID(gameID1)
		nonExistent, _ := model.ParseGameID(testPrefix + "non-existent")

		games, err := repo.FindByIDs(context.Background(), []model.GameID{id1, nonExistent})
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if len(games) != 1 {
			t.Fatalf("got len %d, want %d", len(games), 1)
		}
		if got := games[0].ID().Value(); got != gameID1 {
			t.Errorf("got %v, want %v", got, gameID1)
		}
	})

	t.Run("空配列を渡すと空の結果が返る", func(t *testing.T) {
		games, err := repo.FindByIDs(context.Background(), []model.GameID{})
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if len(games) != 0 {
			t.Errorf("got len %d, want %d", len(games), 0)
		}
	})
}

func TestGameRepository_FindByID(t *testing.T) {
	db := setupDB(t)
	repo := persistence.NewGameRepository(db)

	stadiumID := testPrefix + "stadium-findbyid"
	stadiumName := "ナゴヤ球場"
	insertTestStadium(t, db, stadiumID, stadiumName)

	gameID := testPrefix + "game-findbyid"
	gameDate := time.Date(2025, 6, 15, 18, 0, 0, 0, time.UTC)
	g := newTestGame(t, gameID, "横浜DeNAベイスターズ", 4, 2, stadiumID, stadiumName, gameDate)
	if err := repo.Save(context.Background(), g); err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	t.Cleanup(func() {
		cleanupTestGamesAndStadiums(t, db, []string{gameID}, []string{stadiumID})
	})

	t.Run("存在するIDで全フィールドが取得できる", func(t *testing.T) {
		id, _ := model.ParseGameID(gameID)
		found, err := repo.FindByID(context.Background(), id)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if found == nil {
			t.Fatal("got nil, want non-nil")
		}

		if got := found.ID().Value(); got != gameID {
			t.Errorf("ID: got %v, want %v", got, gameID)
		}
		if got := found.Opponent().Value(); got != "横浜DeNAベイスターズ" {
			t.Errorf("Opponent: got %v, want %v", got, "横浜DeNAベイスターズ")
		}
		if got := found.DragonsScore().Value(); got != 4 {
			t.Errorf("DragonsScore: got %v, want %v", got, 4)
		}
		if got := found.OpponentScore().Value(); got != 2 {
			t.Errorf("OpponentScore: got %v, want %v", got, 2)
		}
		if got := found.Result().Value(); got != model.Win {
			t.Errorf("Result: got %v, want %v", got, model.Win)
		}
		if got := found.Stadium().Name().Value(); got != stadiumName {
			t.Errorf("Stadium.Name: got %v, want %v", got, stadiumName)
		}
	})

	t.Run("存在しないIDの場合nilが返る", func(t *testing.T) {
		id, _ := model.ParseGameID(testPrefix + "non-existent-id")
		found, err := repo.FindByID(context.Background(), id)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if found != nil {
			t.Errorf("got %v, want nil", found)
		}
	})
}

func TestGameRepository_Delete(t *testing.T) {
	db := setupDB(t)
	repo := persistence.NewGameRepository(db)

	stadiumID := testPrefix + "stadium-delete"
	stadiumName := "マツダスタジアム"
	insertTestStadium(t, db, stadiumID, stadiumName)

	t.Cleanup(func() {
		cleanupTestGamesAndStadiums(t, db, nil, []string{stadiumID})
	})

	t.Run("存在するIDを削除するとtrueが返りFindByIDでnilになる", func(t *testing.T) {
		gameID := testPrefix + "game-delete-ok"
		gameDate := time.Date(2025, 6, 15, 18, 0, 0, 0, time.UTC)
		g := newTestGame(t, gameID, "広島東洋カープ", 1, 0, stadiumID, stadiumName, gameDate)
		if err := repo.Save(context.Background(), g); err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		deleted, err := repo.Delete(context.Background(), g.ID())
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if !deleted {
			t.Error("got false, want true")
		}

		found, err := repo.FindByID(context.Background(), g.ID())
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if found != nil {
			t.Errorf("got %v, want nil", found)
		}
	})

	t.Run("存在しないIDを削除するとfalseが返る", func(t *testing.T) {
		id, _ := model.ParseGameID(testPrefix + "game-delete-none")
		deleted, err := repo.Delete(context.Background(), id)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if deleted {
			t.Error("got true, want false")
		}
	})
}
