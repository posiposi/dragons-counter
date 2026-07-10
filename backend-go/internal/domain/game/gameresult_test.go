package game_test

import (
	"testing"

	"github.com/stretchr/testify/assert"

	"github.com/posiposi/dragons-counter/backend-go/internal/domain/game"
)

func TestNewGameResultFromScores(t *testing.T) {
	tests := []struct {
		name          string
		dragonsScore  int
		opponentScore int
		expected      game.GameResultValue
	}{
		{name: "ドラゴンズの得点が多い場合はWINを返す", dragonsScore: 5, opponentScore: 3, expected: game.Win},
		{name: "相手の得点が多い場合はLOSEを返す", dragonsScore: 2, opponentScore: 4, expected: game.Lose},
		{name: "同点の場合はDRAWを返す", dragonsScore: 3, opponentScore: 3, expected: game.Draw},
		{name: "大差で勝った場合はWINを返す", dragonsScore: 10, opponentScore: 0, expected: game.Win},
		{name: "大差で負けた場合はLOSEを返す", dragonsScore: 0, opponentScore: 10, expected: game.Lose},
		{name: "0対0の場合はDRAWを返す", dragonsScore: 0, opponentScore: 0, expected: game.Draw},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := game.NewGameResultFromScores(tt.dragonsScore, tt.opponentScore)

			assert.Equal(t, tt.expected, result.Value())
		})
	}
}

func TestGameResult_IsWin(t *testing.T) {
	tests := []struct {
		name          string
		dragonsScore  int
		opponentScore int
		expected      bool
	}{
		{name: "WINの場合はtrueを返す", dragonsScore: 5, opponentScore: 3, expected: true},
		{name: "LOSEの場合はfalseを返す", dragonsScore: 2, opponentScore: 4, expected: false},
		{name: "DRAWの場合はfalseを返す", dragonsScore: 3, opponentScore: 3, expected: false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := game.NewGameResultFromScores(tt.dragonsScore, tt.opponentScore)

			assert.Equal(t, tt.expected, result.IsWin())
		})
	}
}
