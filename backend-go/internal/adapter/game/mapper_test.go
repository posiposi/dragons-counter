package gameadapter_test

import (
	"testing"
	"time"

	gameadapter "github.com/posiposi/dragons-counter/backend-go/internal/adapter/game"
	"github.com/posiposi/dragons-counter/backend-go/internal/db/sqlc"
	"github.com/posiposi/dragons-counter/backend-go/internal/domain/game"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestGameRowToDomain(t *testing.T) {
	pastDate := time.Date(2025, 6, 15, 18, 0, 0, 0, time.UTC)
	createdAt := time.Date(2025, 6, 15, 21, 0, 0, 0, time.UTC)
	updatedAt := time.Date(2025, 6, 15, 21, 0, 0, 0, time.UTC)

	tests := []struct {
		name           string
		row            sqlc.FindGamesByDateRow
		wantOpponent   string
		wantResult     game.GameResultValue
		wantDragons    int
		wantOpponentSc int
	}{
		{
			name: "勝利の試合行をドメインGameに正しく変換できる",
			row: sqlc.FindGamesByDateRow{
				ID:            "test-game-id-1",
				GameDate:      pastDate,
				Opponent:      "阪神タイガース",
				DragonsScore:  5,
				OpponentScore: 3,
				Result:        sqlc.GamesResultWin,
				StadiumID:     "test-stadium-id-1",
				CreatedAt:     createdAt,
				UpdatedAt:     updatedAt,
				StadiumName:   "バンテリンドーム ナゴヤ",
			},
			wantOpponent:   "阪神タイガース",
			wantResult:     game.Win,
			wantDragons:    5,
			wantOpponentSc: 3,
		},
		{
			name: "敗北の試合行をドメインGameに正しく変換できる",
			row: sqlc.FindGamesByDateRow{
				ID:            "test-game-id-2",
				GameDate:      pastDate,
				Opponent:      "読売ジャイアンツ",
				DragonsScore:  1,
				OpponentScore: 4,
				Result:        sqlc.GamesResultLose,
				StadiumID:     "test-stadium-id-2",
				CreatedAt:     createdAt,
				UpdatedAt:     updatedAt,
				StadiumName:   "東京ドーム",
			},
			wantOpponent:   "読売ジャイアンツ",
			wantResult:     game.Lose,
			wantDragons:    1,
			wantOpponentSc: 4,
		},
		{
			name: "引き分けの試合行をドメインGameに正しく変換できる",
			row: sqlc.FindGamesByDateRow{
				ID:            "test-game-id-3",
				GameDate:      pastDate,
				Opponent:      "広島東洋カープ",
				DragonsScore:  2,
				OpponentScore: 2,
				Result:        sqlc.GamesResultDraw,
				StadiumID:     "test-stadium-id-3",
				CreatedAt:     createdAt,
				UpdatedAt:     updatedAt,
				StadiumName:   "MAZDA Zoom-Zoom スタジアム広島",
			},
			wantOpponent:   "広島東洋カープ",
			wantResult:     game.Draw,
			wantDragons:    2,
			wantOpponentSc: 2,
		},
		{
			name: "略称の対戦相手名が正式名に変換される",
			row: sqlc.FindGamesByDateRow{
				ID:            "test-game-id-4",
				GameDate:      pastDate,
				Opponent:      "神",
				DragonsScore:  3,
				OpponentScore: 1,
				Result:        sqlc.GamesResultWin,
				StadiumID:     "test-stadium-id-1",
				CreatedAt:     createdAt,
				UpdatedAt:     updatedAt,
				StadiumName:   "バンテリンドーム ナゴヤ",
			},
			wantOpponent:   "阪神タイガース",
			wantResult:     game.Win,
			wantDragons:    3,
			wantOpponentSc: 1,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			g, err := gameadapter.GameRowToDomain(tt.row)

			require.NoError(t, err)
			assert.Equal(t, tt.row.ID, g.ID().Value())
			assert.Equal(t, tt.row.GameDate, g.GameDate().Value())
			assert.Equal(t, tt.wantOpponent, g.Opponent().Value())
			assert.Equal(t, tt.wantDragons, g.DragonsScore().Value())
			assert.Equal(t, tt.wantOpponentSc, g.OpponentScore().Value())
			assert.Equal(t, tt.wantResult, g.Result().Value())
			assert.Equal(t, tt.row.StadiumID, g.Stadium().ID().Value())
			assert.Equal(t, tt.row.StadiumName, g.Stadium().Name().Value())
			assert.Equal(t, tt.row.CreatedAt, g.CreatedAt())
			assert.Equal(t, tt.row.UpdatedAt, g.UpdatedAt())
		})
	}
}

func TestGameResultConversion(t *testing.T) {
	tests := []struct {
		name     string
		dbValue  sqlc.GamesResult
		domValue game.GameResultValue
	}{
		{name: "WIN と win が相互変換できる", dbValue: sqlc.GamesResultWin, domValue: game.Win},
		{name: "LOSE と lose が相互変換できる", dbValue: sqlc.GamesResultLose, domValue: game.Lose},
		{name: "DRAW と draw が相互変換できる", dbValue: sqlc.GamesResultDraw, domValue: game.Draw},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			gotDB := gameadapter.GameResultToDB(tt.domValue)
			assert.Equal(t, tt.dbValue, gotDB)

			gotDom := gameadapter.GameResultToDomain(tt.dbValue)
			assert.Equal(t, tt.domValue, gotDom)
		})
	}
}
