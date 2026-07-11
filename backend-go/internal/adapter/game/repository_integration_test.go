//go:build integration

package gameadapter_test

import (
	"context"
	"database/sql"
	"os"
	"testing"
	"time"

	_ "github.com/go-sql-driver/mysql"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	gameadapter "github.com/posiposi/dragons-counter/backend-go/internal/adapter/game"
	"github.com/posiposi/dragons-counter/backend-go/internal/config"
	"github.com/posiposi/dragons-counter/backend-go/internal/db/sqlc"
	"github.com/posiposi/dragons-counter/backend-go/internal/domain/game"
)

const testPrefix = "repo-test-"

func setupDB(t *testing.T) *sql.DB {
	t.Helper()

	databaseURL := os.Getenv("TEST_DATABASE_URL")
	if databaseURL == "" {
		t.Fatal("TEST_DATABASE_URL is not set")
	}

	dsn, err := config.BuildDSN(databaseURL)
	require.NoError(t, err)

	database, err := sql.Open("mysql", dsn)
	require.NoError(t, err)

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
	require.NoError(t, err)
}

func cleanupTestGamesAndStadiums(t *testing.T, db *sql.DB, gameIDs []string, stadiumIDs []string) {
	t.Helper()
	ctx := context.Background()
	for _, id := range gameIDs {
		_, err := db.ExecContext(ctx, "DELETE FROM games WHERE id = ?", id)
		require.NoError(t, err)
	}
	for _, id := range stadiumIDs {
		_, err := db.ExecContext(ctx, "DELETE FROM stadiums WHERE id = ?", id)
		require.NoError(t, err)
	}
}

func newTestGame(t *testing.T, id, opponent string, dragonsScore, opponentScore int, stadiumID, stadiumName string, gameDate time.Time) game.Game {
	t.Helper()

	gid, err := game.ParseGameID(id)
	require.NoError(t, err)
	gd, err := game.NewGameDate(gameDate)
	require.NoError(t, err)
	opp, err := game.NewOpponent(opponent)
	require.NoError(t, err)
	ds, err := game.NewScore(dragonsScore)
	require.NoError(t, err)
	os, err := game.NewScore(opponentScore)
	require.NoError(t, err)
	sid, err := game.ParseStadiumID(stadiumID)
	require.NoError(t, err)
	sn, err := game.NewStadiumName(stadiumName)
	require.NoError(t, err)
	stadium := game.NewStadium(sid, sn)

	now := time.Now().Truncate(time.Second)
	return game.NewGame(gid, gd, opp, ds, os, stadium, now, now)
}

func TestGameRepository_Save(t *testing.T) {
	db := setupDB(t)
	repo := gameadapter.NewGameRepository(db)

	stadiumID := testPrefix + "stadium-save"
	stadiumName := "バンテリンドーム ナゴヤ"
	insertTestStadium(t, db, stadiumID, stadiumName)

	tests := []struct {
		name          string
		gameID        string
		opponent      string
		dragonsScore  int
		opponentScore int
		wantResult    game.GameResultValue
	}{
		{
			name:          "勝利の試合を保存しFindByIDで全フィールドを検証できる",
			gameID:        testPrefix + "game-save-win",
			opponent:      "阪神タイガース",
			dragonsScore:  5,
			opponentScore: 3,
			wantResult:    game.Win,
		},
		{
			name:          "敗北の試合を保存しFindByIDで全フィールドを検証できる",
			gameID:        testPrefix + "game-save-lose",
			opponent:      "読売ジャイアンツ",
			dragonsScore:  1,
			opponentScore: 4,
			wantResult:    game.Lose,
		},
		{
			name:          "引き分けの試合を保存しFindByIDで全フィールドを検証できる",
			gameID:        testPrefix + "game-save-draw",
			opponent:      "広島東洋カープ",
			dragonsScore:  2,
			opponentScore: 2,
			wantResult:    game.Draw,
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
			require.NoError(t, err)

			found, err := repo.FindByID(context.Background(), g.ID())
			require.NoError(t, err)
			require.NotNil(t, found)

			assert.Equal(t, tt.gameID, found.ID().Value())
			assert.Equal(t, tt.opponent, found.Opponent().Value())
			assert.Equal(t, tt.dragonsScore, found.DragonsScore().Value())
			assert.Equal(t, tt.opponentScore, found.OpponentScore().Value())
			assert.Equal(t, tt.wantResult, found.Result().Value())
			assert.Equal(t, stadiumName, found.Stadium().Name().Value())
			assert.Equal(t, stadiumID, found.Stadium().ID().Value())
		})
	}

	t.Cleanup(func() {
		cleanupTestGamesAndStadiums(t, db, nil, []string{stadiumID})
	})
}

func TestGameRepository_FindAll(t *testing.T) {
	db := setupDB(t)
	repo := gameadapter.NewGameRepository(db)

	stadiumID := testPrefix + "stadium-findall"
	stadiumName := "東京ドーム"
	insertTestStadium(t, db, stadiumID, stadiumName)

	gameID1 := testPrefix + "game-findall-1"
	gameID2 := testPrefix + "game-findall-2"
	date1 := time.Date(2025, 6, 14, 18, 0, 0, 0, time.UTC)
	date2 := time.Date(2025, 6, 15, 18, 0, 0, 0, time.UTC)

	g1 := newTestGame(t, gameID1, "阪神タイガース", 3, 1, stadiumID, stadiumName, date1)
	g2 := newTestGame(t, gameID2, "読売ジャイアンツ", 2, 5, stadiumID, stadiumName, date2)

	require.NoError(t, repo.Save(context.Background(), g1))
	require.NoError(t, repo.Save(context.Background(), g2))

	t.Cleanup(func() {
		cleanupTestGamesAndStadiums(t, db, []string{gameID1, gameID2}, []string{stadiumID})
	})

	games, err := repo.FindAll(context.Background())
	require.NoError(t, err)

	// FindAllは他テストのデータも含む可能性があるため、挿入した2件が含まれることを確認
	foundIDs := make(map[string]bool)
	for _, g := range games {
		foundIDs[g.ID().Value()] = true
	}
	assert.True(t, foundIDs[gameID1], "game1が結果に含まれるべき")
	assert.True(t, foundIDs[gameID2], "game2が結果に含まれるべき")

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
	assert.Less(t, idx2, idx1, "新しい日付の試合が先に来るべき")

	// stadium名の検証
	for _, g := range games {
		if g.ID().Value() == gameID1 || g.ID().Value() == gameID2 {
			assert.Equal(t, stadiumName, g.Stadium().Name().Value())
		}
	}
}

func TestGameRepository_FindByIDs(t *testing.T) {
	db := setupDB(t)
	repo := gameadapter.NewGameRepository(db)

	stadiumID := testPrefix + "stadium-findbyids"
	stadiumName := "甲子園球場"
	insertTestStadium(t, db, stadiumID, stadiumName)

	gameID1 := testPrefix + "game-byids-1"
	gameID2 := testPrefix + "game-byids-2"
	gameDate := time.Date(2025, 6, 15, 18, 0, 0, 0, time.UTC)

	g1 := newTestGame(t, gameID1, "阪神タイガース", 3, 1, stadiumID, stadiumName, gameDate)
	g2 := newTestGame(t, gameID2, "読売ジャイアンツ", 0, 2, stadiumID, stadiumName, gameDate)

	require.NoError(t, repo.Save(context.Background(), g1))
	require.NoError(t, repo.Save(context.Background(), g2))

	t.Cleanup(func() {
		cleanupTestGamesAndStadiums(t, db, []string{gameID1, gameID2}, []string{stadiumID})
	})

	t.Run("指定した2件のIDで2件返却される", func(t *testing.T) {
		id1, _ := game.ParseGameID(gameID1)
		id2, _ := game.ParseGameID(gameID2)

		games, err := repo.FindByIDs(context.Background(), []game.GameID{id1, id2})
		require.NoError(t, err)
		assert.Len(t, games, 2)
	})

	t.Run("存在しないIDを含む場合は存在分のみ返却される", func(t *testing.T) {
		id1, _ := game.ParseGameID(gameID1)
		nonExistent, _ := game.ParseGameID(testPrefix + "non-existent")

		games, err := repo.FindByIDs(context.Background(), []game.GameID{id1, nonExistent})
		require.NoError(t, err)
		assert.Len(t, games, 1)
		assert.Equal(t, gameID1, games[0].ID().Value())
	})

	t.Run("空配列を渡すと空の結果が返る", func(t *testing.T) {
		games, err := repo.FindByIDs(context.Background(), []game.GameID{})
		require.NoError(t, err)
		assert.Empty(t, games)
	})
}

func TestGameRepository_FindByID(t *testing.T) {
	db := setupDB(t)
	repo := gameadapter.NewGameRepository(db)

	stadiumID := testPrefix + "stadium-findbyid"
	stadiumName := "ナゴヤ球場"
	insertTestStadium(t, db, stadiumID, stadiumName)

	gameID := testPrefix + "game-findbyid"
	gameDate := time.Date(2025, 6, 15, 18, 0, 0, 0, time.UTC)
	g := newTestGame(t, gameID, "横浜DeNAベイスターズ", 4, 2, stadiumID, stadiumName, gameDate)
	require.NoError(t, repo.Save(context.Background(), g))

	t.Cleanup(func() {
		cleanupTestGamesAndStadiums(t, db, []string{gameID}, []string{stadiumID})
	})

	t.Run("存在するIDで全フィールドが取得できる", func(t *testing.T) {
		id, _ := game.ParseGameID(gameID)
		found, err := repo.FindByID(context.Background(), id)
		require.NoError(t, err)
		require.NotNil(t, found)

		assert.Equal(t, gameID, found.ID().Value())
		assert.Equal(t, "横浜DeNAベイスターズ", found.Opponent().Value())
		assert.Equal(t, 4, found.DragonsScore().Value())
		assert.Equal(t, 2, found.OpponentScore().Value())
		assert.Equal(t, game.Win, found.Result().Value())
		assert.Equal(t, stadiumName, found.Stadium().Name().Value())
	})

	t.Run("存在しないIDの場合nilが返る", func(t *testing.T) {
		id, _ := game.ParseGameID(testPrefix + "non-existent-id")
		found, err := repo.FindByID(context.Background(), id)
		require.NoError(t, err)
		assert.Nil(t, found)
	})
}

func TestGameRepository_Delete(t *testing.T) {
	db := setupDB(t)
	repo := gameadapter.NewGameRepository(db)

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
		require.NoError(t, repo.Save(context.Background(), g))

		deleted, err := repo.Delete(context.Background(), g.ID())
		require.NoError(t, err)
		assert.True(t, deleted)

		found, err := repo.FindByID(context.Background(), g.ID())
		require.NoError(t, err)
		assert.Nil(t, found)
	})

	t.Run("存在しないIDを削除するとfalseが返る", func(t *testing.T) {
		id, _ := game.ParseGameID(testPrefix + "game-delete-none")
		deleted, err := repo.Delete(context.Background(), id)
		require.NoError(t, err)
		assert.False(t, deleted)
	})
}
