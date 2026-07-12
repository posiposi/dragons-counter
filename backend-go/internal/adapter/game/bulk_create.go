package gameadapter

import (
	"context"
	"database/sql"
	"fmt"
	"strings"
	"time"

	"github.com/posiposi/dragons-counter/backend-go/internal/db/sqlc"
	"github.com/posiposi/dragons-counter/backend-go/internal/domain/game"
	"github.com/posiposi/dragons-counter/backend-go/internal/port"
)

var stadiumNameToID = map[string]string{
	"バンテリンドーム":              "a1b2c3d4-e5f6-7890-abcd-ef1234567001",
	"バンテリンドーム ナゴヤ":          "a1b2c3d4-e5f6-7890-abcd-ef1234567001",
	"神宮球場":                  "a1b2c3d4-e5f6-7890-abcd-ef1234567002",
	"明治神宮野球場":               "a1b2c3d4-e5f6-7890-abcd-ef1234567002",
	"神宮":                    "a1b2c3d4-e5f6-7890-abcd-ef1234567002",
	"甲子園球場":                 "a1b2c3d4-e5f6-7890-abcd-ef1234567003",
	"阪神甲子園球場":               "a1b2c3d4-e5f6-7890-abcd-ef1234567003",
	"甲子園":                   "a1b2c3d4-e5f6-7890-abcd-ef1234567003",
	"東京ドーム":                 "a1b2c3d4-e5f6-7890-abcd-ef1234567004",
	"横浜スタジアム":               "a1b2c3d4-e5f6-7890-abcd-ef1234567005",
	"横浜":                    "a1b2c3d4-e5f6-7890-abcd-ef1234567005",
	"マツダスタジアム":              "a1b2c3d4-e5f6-7890-abcd-ef1234567006",
	"MAZDA Zoom-Zoom スタジアム広島": "a1b2c3d4-e5f6-7890-abcd-ef1234567006",
}

const defaultStadiumID = "a1b2c3d4-e5f6-7890-abcd-ef1234567001"

type BulkCreateGameAdapter struct {
	db         *sql.DB
	findByDate port.FindGameByDatePort
}

func NewBulkCreateGameAdapter(db *sql.DB, findByDate port.FindGameByDatePort) *BulkCreateGameAdapter {
	return &BulkCreateGameAdapter{
		db:         db,
		findByDate: findByDate,
	}
}

func (a *BulkCreateGameAdapter) BulkSave(ctx context.Context, inputs []port.BulkCreateGameInput) port.BulkCreateGameResult {
	result := port.BulkCreateGameResult{}
	queries := sqlc.New(a.db)

	for _, input := range inputs {
		gameDate, err := game.NewGameDate(input.GameDate)
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

		gameID := game.NewGameID()
		opponent, err := game.NewOpponent(input.Opponent)
		if err != nil {
			result.Errors = append(result.Errors, fmt.Sprintf("invalid opponent %q: %v", input.Opponent, err))
			continue
		}

		dragonsScore, err := game.NewScore(input.DragonsScore)
		if err != nil {
			result.Errors = append(result.Errors, fmt.Sprintf("invalid dragons score %d: %v", input.DragonsScore, err))
			continue
		}

		opponentScore, err := game.NewScore(input.OpponentScore)
		if err != nil {
			result.Errors = append(result.Errors, fmt.Sprintf("invalid opponent score %d: %v", input.OpponentScore, err))
			continue
		}

		stadiumID := resolveStadiumID(input.StadiumName)
		gameResult := game.NewGameResultFromScores(dragonsScore.Value(), opponentScore.Value())

		now := time.Now().Truncate(time.Second)
		params := sqlc.CreateGameParams{
			ID:            gameID.Value(),
			GameDate:      input.GameDate,
			Opponent:      opponent.Value(),
			DragonsScore:  int32(dragonsScore.Value()),
			OpponentScore: int32(opponentScore.Value()),
			Result:        GameResultToDB(gameResult.Value()),
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
