package game_test

import (
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

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
	require.NoError(t, err)

	opponent, err := game.NewOpponent("阪神タイガース")
	require.NoError(t, err)

	dScore, err := game.NewScore(dragonsScore)
	require.NoError(t, err)

	oScore, err := game.NewScore(opponentScore)
	require.NoError(t, err)

	stadiumName, err := game.NewStadiumName("バンテリンドーム ナゴヤ")
	require.NoError(t, err)

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

		assert.True(t, g.ID().Equals(f.id))
		assert.Equal(t, f.gameDate, g.GameDate())
		assert.True(t, g.Opponent().Equals(f.opponent))
		assert.True(t, g.DragonsScore().Equals(f.dragonsScore))
		assert.True(t, g.OpponentScore().Equals(f.opponentScore))
		assert.True(t, g.Stadium().Equals(f.stadium))
		assert.Equal(t, f.createdAt, g.CreatedAt())
		assert.Equal(t, f.updatedAt, g.UpdatedAt())
		assert.Equal(t, game.Win, g.Result().Value())
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

			assert.Equal(t, tt.expected, g.Result().Value())
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

			assert.Equal(t, tt.expected, g.IsVictory())
		})
	}
}
