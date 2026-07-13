package persistence

import (
	"context"
	"database/sql"
	"fmt"
	"strings"
	"time"

	"github.com/posiposi/dragons-counter/backend-go/internal/db/sqlc"
	"github.com/posiposi/dragons-counter/backend-go/internal/domain/model"
	"github.com/posiposi/dragons-counter/backend-go/internal/domain/repository"
)

var stadiumNameToID = map[string]string{
	"バンテリンドーム":                "a1b2c3d4-e5f6-7890-abcd-ef1234567001",
	"バンテリンドーム ナゴヤ":            "a1b2c3d4-e5f6-7890-abcd-ef1234567001",
	"神宮球場":                    "a1b2c3d4-e5f6-7890-abcd-ef1234567002",
	"明治神宮野球場":                 "a1b2c3d4-e5f6-7890-abcd-ef1234567002",
	"神宮":                      "a1b2c3d4-e5f6-7890-abcd-ef1234567002",
	"甲子園球場":                   "a1b2c3d4-e5f6-7890-abcd-ef1234567003",
	"阪神甲子園球場":                 "a1b2c3d4-e5f6-7890-abcd-ef1234567003",
	"甲子園":                     "a1b2c3d4-e5f6-7890-abcd-ef1234567003",
	"東京ドーム":                   "a1b2c3d4-e5f6-7890-abcd-ef1234567004",
	"横浜スタジアム":                 "a1b2c3d4-e5f6-7890-abcd-ef1234567005",
	"横浜":                      "a1b2c3d4-e5f6-7890-abcd-ef1234567005",
	"マツダスタジアム":                "a1b2c3d4-e5f6-7890-abcd-ef1234567006",
	"MAZDA Zoom-Zoom スタジアム広島": "a1b2c3d4-e5f6-7890-abcd-ef1234567006",
}

const defaultStadiumID = "a1b2c3d4-e5f6-7890-abcd-ef1234567001"

// BulkCreateGameAdapter implements repository.BulkCreateGamePort using sqlc queries
// with duplicate-date skip logic.
type BulkCreateGameAdapter struct {
	db         *sql.DB
	findByDate repository.FindGameByDatePort
}

// NewBulkCreateGameAdapter creates a new BulkCreateGameAdapter.
func NewBulkCreateGameAdapter(db *sql.DB, findByDate repository.FindGameByDatePort) *BulkCreateGameAdapter {
	return &BulkCreateGameAdapter{
		db:         db,
		findByDate: findByDate,
	}
}

// BulkSave persists multiple games, skipping dates that already have a game recorded.
func (a *BulkCreateGameAdapter) BulkSave(ctx context.Context, inputs []repository.BulkCreateGameInput) repository.BulkCreateGameResult {
	result := repository.BulkCreateGameResult{}
	queries := sqlc.New(a.db)

	for _, input := range inputs {
		gameDate, err := model.NewGameDate(input.GameDate)
		if err != nil {
			result.Errors = append(result.Errors, fmt.Sprintf("invalid game date %v: %v", input.GameDate, err))
			continue
		}

		existing, err := a.findByDate.FindByDate(ctx, gameDate)
		if err != nil {
			result.Errors = append(result.Errors, fmt.Sprintf("failed to check existing game for date %v: %v", input.GameDate, err))
			continue
		}
		if existing != nil {
			result.SkippedCount++
			continue
		}

		gameID := model.NewGameID()
		opponent, err := model.NewOpponent(input.Opponent)
		if err != nil {
			result.Errors = append(result.Errors, fmt.Sprintf("invalid opponent %q: %v", input.Opponent, err))
			continue
		}

		dragonsScore, err := model.NewScore(input.DragonsScore)
		if err != nil {
			result.Errors = append(result.Errors, fmt.Sprintf("invalid dragons score %d: %v", input.DragonsScore, err))
			continue
		}

		opponentScore, err := model.NewScore(input.OpponentScore)
		if err != nil {
			result.Errors = append(result.Errors, fmt.Sprintf("invalid opponent score %d: %v", input.OpponentScore, err))
			continue
		}

		stadiumID := resolveStadiumID(input.StadiumName)
		gameResult := model.NewGameResultFromScores(dragonsScore.Value(), opponentScore.Value())

		now := time.Now().Truncate(time.Second)
		params := sqlc.CreateGameParams{
			ID:            gameID.Value(),
			GameDate:      input.GameDate,
			Opponent:      opponent.Value(),
			DragonsScore:  int32(dragonsScore.Value()),
			OpponentScore: int32(opponentScore.Value()),
			Result:        sqlc.GamesResult(strings.ToLower(string(gameResult.Value()))),
			StadiumID:     stadiumID,
			CreatedAt:     now,
			UpdatedAt:     now,
		}

		if err := queries.CreateGame(ctx, params); err != nil {
			result.Errors = append(result.Errors, fmt.Sprintf("failed to save game for date %v: %v", input.GameDate, err))
			continue
		}

		result.SavedCount++
	}

	return result
}

func resolveStadiumID(stadiumName string) string {
	// 完全一致
	if id, ok := stadiumNameToID[stadiumName]; ok {
		return id
	}

	// 部分一致フォールバック
	for key, id := range stadiumNameToID {
		if strings.Contains(stadiumName, key) || strings.Contains(key, stadiumName) {
			return id
		}
	}

	// デフォルト: バンテリンドーム
	return defaultStadiumID
}
