package model_test

import (
	"testing"

	"github.com/posiposi/dragons-counter/backend-go/internal/domain/model"
)

func TestNewGameResultFromScores(t *testing.T) {
	tests := []struct {
		name          string
		dragonsScore  int
		opponentScore int
		expected      model.GameResultValue
	}{
		{name: "ドラゴンズの得点が多い場合はWINを返す", dragonsScore: 5, opponentScore: 3, expected: model.Win},
		{name: "相手の得点が多い場合はLOSEを返す", dragonsScore: 2, opponentScore: 4, expected: model.Lose},
		{name: "同点の場合はDRAWを返す", dragonsScore: 3, opponentScore: 3, expected: model.Draw},
		{name: "大差で勝った場合はWINを返す", dragonsScore: 10, opponentScore: 0, expected: model.Win},
		{name: "大差で負けた場合はLOSEを返す", dragonsScore: 0, opponentScore: 10, expected: model.Lose},
		{name: "0対0の場合はDRAWを返す", dragonsScore: 0, opponentScore: 0, expected: model.Draw},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := model.NewGameResultFromScores(tt.dragonsScore, tt.opponentScore)

			if got := result.Value(); got != tt.expected {
				t.Errorf("NewGameResultFromScores(%d, %d).Value() = %v, want %v", tt.dragonsScore, tt.opponentScore, got, tt.expected)
			}
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
			result := model.NewGameResultFromScores(tt.dragonsScore, tt.opponentScore)

			if got := result.IsWin(); got != tt.expected {
				t.Errorf("GameResult.IsWin() = %v, want %v", got, tt.expected)
			}
		})
	}
}
