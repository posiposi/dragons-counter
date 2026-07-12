package game_test

import (
	"testing"
	"time"

	"github.com/posiposi/dragons-counter/backend-go/internal/domain/game"
)

type gameFixture struct {
	id            game.GameID
	gameDate      game.GameDate
	opponent      game.Opponent
	dragonsScore  game.Score
	opponentScore game.Score
	stadium       game.Stadium
	createdAt     time.Time
	updatedAt     time.Time
}

func newGameFixture(t *testing.T, dragonsScore, opponentScore int) gameFixture {
	t.Helper()

	gameDate, err := game.NewGameDate(time.Date(2024, 4, 1, 0, 0, 0, 0, time.UTC))
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	opponent, err := game.NewOpponent("阪神タイガース")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	dScore, err := game.NewScore(dragonsScore)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	oScore, err := game.NewScore(opponentScore)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	stadiumName, err := game.NewStadiumName("バンテリンドーム ナゴヤ")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	return gameFixture{
		id:            game.NewGameID(),
		gameDate:      gameDate,
		opponent:      opponent,
		dragonsScore:  dScore,
		opponentScore: oScore,
		stadium:       game.NewStadium(game.NewStadiumID(), stadiumName),
		createdAt:     time.Date(2024, 4, 1, 21, 0, 0, 0, time.UTC),
		updatedAt:     time.Date(2024, 4, 2, 9, 0, 0, 0, time.UTC),
	}
}

func TestNewGame(t *testing.T) {
	t.Run("有効な値でGameを生成し各フィールドをゲッターで取得できる", func(t *testing.T) {
		f := newGameFixture(t, 7, 3)

		g := game.NewGame(
			f.id,
			f.gameDate,
			f.opponent,
			f.dragonsScore,
			f.opponentScore,
			f.stadium,
			f.createdAt,
			f.updatedAt,
		)

		if !g.ID().Equals(f.id) {
			t.Errorf("Game.ID() does not equal fixture ID")
		}
		if g.GameDate() != f.gameDate {
			t.Errorf("Game.GameDate() = %v, want %v", g.GameDate(), f.gameDate)
		}
		if !g.Opponent().Equals(f.opponent) {
			t.Errorf("Game.Opponent() does not equal fixture opponent")
		}
		if !g.DragonsScore().Equals(f.dragonsScore) {
			t.Errorf("Game.DragonsScore() does not equal fixture dragonsScore")
		}
		if !g.OpponentScore().Equals(f.opponentScore) {
			t.Errorf("Game.OpponentScore() does not equal fixture opponentScore")
		}
		if !g.Stadium().Equals(f.stadium) {
			t.Errorf("Game.Stadium() does not equal fixture stadium")
		}
		if g.CreatedAt() != f.createdAt {
			t.Errorf("Game.CreatedAt() = %v, want %v", g.CreatedAt(), f.createdAt)
		}
		if g.UpdatedAt() != f.updatedAt {
			t.Errorf("Game.UpdatedAt() = %v, want %v", g.UpdatedAt(), f.updatedAt)
		}
		if g.Result().Value() != game.Win {
			t.Errorf("Game.Result().Value() = %v, want %v", g.Result().Value(), game.Win)
		}
	})
}

func TestNewGame_ResultDetermination(t *testing.T) {
	tests := []struct {
		name          string
		dragonsScore  int
		opponentScore int
		expected      game.GameResultValue
	}{
		{name: "ドラゴンズの得点が多い場合はresultがWINになる", dragonsScore: 7, opponentScore: 3, expected: game.Win},
		{name: "相手の得点が多い場合はresultがLOSEになる", dragonsScore: 2, opponentScore: 5, expected: game.Lose},
		{name: "同点の場合はresultがDRAWになる", dragonsScore: 4, opponentScore: 4, expected: game.Draw},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			f := newGameFixture(t, tt.dragonsScore, tt.opponentScore)

			g := game.NewGame(
				f.id,
				f.gameDate,
				f.opponent,
				f.dragonsScore,
				f.opponentScore,
				f.stadium,
				f.createdAt,
				f.updatedAt,
			)

			if got := g.Result().Value(); got != tt.expected {
				t.Errorf("NewGame().Result().Value() = %v, want %v", got, tt.expected)
			}
		})
	}
}

func TestGame_IsVictory(t *testing.T) {
	tests := []struct {
		name          string
		dragonsScore  int
		opponentScore int
		expected      bool
	}{
		{name: "勝ちの場合はtrueを返す", dragonsScore: 7, opponentScore: 3, expected: true},
		{name: "負けの場合はfalseを返す", dragonsScore: 2, opponentScore: 5, expected: false},
		{name: "引き分けの場合はfalseを返す", dragonsScore: 4, opponentScore: 4, expected: false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			f := newGameFixture(t, tt.dragonsScore, tt.opponentScore)

			g := game.NewGame(
				f.id,
				f.gameDate,
				f.opponent,
				f.dragonsScore,
				f.opponentScore,
				f.stadium,
				f.createdAt,
				f.updatedAt,
			)

			if got := g.IsVictory(); got != tt.expected {
				t.Errorf("Game.IsVictory() = %v, want %v", got, tt.expected)
			}
		})
	}
}
