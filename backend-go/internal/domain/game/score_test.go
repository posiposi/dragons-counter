package game_test

import (
	"errors"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"github.com/posiposi/dragons-counter/backend-go/internal/domain"
	"github.com/posiposi/dragons-counter/backend-go/internal/domain/game"
)

func TestNewScore(t *testing.T) {
	t.Run("正常な値でスコアを生成できる", func(t *testing.T) {
		tests := []struct {
			name  string
			value int
		}{
			{name: "0を保持できる", value: 0},
			{name: "5を保持できる", value: 5},
			{name: "15を保持できる", value: 15},
		}

		for _, tt := range tests {
			t.Run(tt.name, func(t *testing.T) {
				score, err := game.NewScore(tt.value)

				require.NoError(t, err)
				assert.Equal(t, tt.value, score.Value())
			})
		}
	})

	t.Run("負数の場合はドメインエラーを返す", func(t *testing.T) {
		_, err := game.NewScore(-1)

		require.Error(t, err)
		var domainErr *domain.Error
		require.True(t, errors.As(err, &domainErr))
		assert.NotEmpty(t, domainErr.Code)
	})
}

func TestScore_Equals(t *testing.T) {
	tests := []struct {
		name     string
		a        int
		b        int
		expected bool
	}{
		{name: "同じ値のスコア同士はtrueを返す", a: 7, b: 7, expected: true},
		{name: "異なる値のスコア同士はfalseを返す", a: 3, b: 5, expected: false},
		{name: "0同士はtrueを返す", a: 0, b: 0, expected: true},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			a, err := game.NewScore(tt.a)
			require.NoError(t, err)
			b, err := game.NewScore(tt.b)
			require.NoError(t, err)

			assert.Equal(t, tt.expected, a.Equals(b))
		})
	}
}
