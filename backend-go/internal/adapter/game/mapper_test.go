package gameadapter_test

import (
	"testing"
	"time"

	gameadapter "github.com/posiposi/dragons-counter/backend-go/internal/adapter/game"
	"github.com/posiposi/dragons-counter/backend-go/internal/db/sqlc"
	"github.com/posiposi/dragons-counter/backend-go/internal/domain/game"
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
			if err != nil {
				t.Fatalf("unexpected error: %v", err)
			}

			if got := g.ID().Value(); got != tt.row.ID {
				t.Errorf("Game.ID().Value() = %v, want %v", got, tt.row.ID)
			}
			if got := g.GameDate().Value(); got != tt.row.GameDate {
				t.Errorf("Game.GameDate().Value() = %v, want %v", got, tt.row.GameDate)
			}
			if got := g.Opponent().Value(); got != tt.wantOpponent {
				t.Errorf("Game.Opponent().Value() = %v, want %v", got, tt.wantOpponent)
			}
			if got := g.DragonsScore().Value(); got != tt.wantDragons {
				t.Errorf("Game.DragonsScore().Value() = %v, want %v", got, tt.wantDragons)
			}
			if got := g.OpponentScore().Value(); got != tt.wantOpponentSc {
				t.Errorf("Game.OpponentScore().Value() = %v, want %v", got, tt.wantOpponentSc)
			}
			if got := g.Result().Value(); got != tt.wantResult {
				t.Errorf("Game.Result().Value() = %v, want %v", got, tt.wantResult)
			}
			if got := g.Stadium().ID().Value(); got != tt.row.StadiumID {
				t.Errorf("Game.Stadium().ID().Value() = %v, want %v", got, tt.row.StadiumID)
			}
			if got := g.Stadium().Name().Value(); got != tt.row.StadiumName {
				t.Errorf("Game.Stadium().Name().Value() = %v, want %v", got, tt.row.StadiumName)
			}
			if got := g.CreatedAt(); got != tt.row.CreatedAt {
				t.Errorf("Game.CreatedAt() = %v, want %v", got, tt.row.CreatedAt)
			}
			if got := g.UpdatedAt(); got != tt.row.UpdatedAt {
				t.Errorf("Game.UpdatedAt() = %v, want %v", got, tt.row.UpdatedAt)
			}
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
			if gotDB != tt.dbValue {
				t.Errorf("GameResultToDB(%v) = %v, want %v", tt.domValue, gotDB, tt.dbValue)
			}

			gotDom := gameadapter.GameResultToDomain(tt.dbValue)
			if gotDom != tt.domValue {
				t.Errorf("GameResultToDomain(%v) = %v, want %v", tt.dbValue, gotDom, tt.domValue)
			}
		})
	}
}
