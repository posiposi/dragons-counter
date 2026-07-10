package game_test

import (
	"errors"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"github.com/posiposi/dragons-counter/backend-go/internal/domain"
	"github.com/posiposi/dragons-counter/backend-go/internal/domain/game"
)

func TestNewGameDate(t *testing.T) {
	t.Run("過去の日時で試合日を生成できる", func(t *testing.T) {
		value := time.Date(2024, 8, 1, 18, 0, 0, 0, time.Local)

		gameDate, err := game.NewGameDate(value)

		require.NoError(t, err)
		assert.True(t, gameDate.Value().Equal(value))
	})

	t.Run("現在時刻の直前の日時で試合日を生成できる", func(t *testing.T) {
		value := time.Now().Add(-time.Second)

		gameDate, err := game.NewGameDate(value)

		require.NoError(t, err)
		assert.True(t, gameDate.Value().Equal(value))
	})

	t.Run("未来の日時の場合はドメインエラーを返す", func(t *testing.T) {
		value := time.Now().AddDate(0, 0, 1)

		_, err := game.NewGameDate(value)

		require.Error(t, err)
		var domainErr *domain.Error
		require.True(t, errors.As(err, &domainErr))
		assert.NotEmpty(t, domainErr.Code)
	})
}

func TestGameDate_Format(t *testing.T) {
	tests := []struct {
		name     string
		value    time.Time
		expected string
	}{
		{
			name:     "2024年8月1日をYYYY-MM-DD形式で整形できる",
			value:    time.Date(2024, 8, 1, 18, 0, 0, 0, time.Local),
			expected: "2024-08-01",
		},
		{
			name:     "2024年1月5日をYYYY-MM-DD形式で整形できる",
			value:    time.Date(2024, 1, 5, 13, 30, 0, 0, time.Local),
			expected: "2024-01-05",
		},
		{
			name:     "2024年12月31日をYYYY-MM-DD形式で整形できる",
			value:    time.Date(2024, 12, 31, 0, 0, 0, 0, time.Local),
			expected: "2024-12-31",
		},
		{
			name:     "2024年10月10日をYYYY-MM-DD形式で整形できる",
			value:    time.Date(2024, 10, 10, 14, 0, 0, 0, time.Local),
			expected: "2024-10-10",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			gameDate, err := game.NewGameDate(tt.value)
			require.NoError(t, err)

			assert.Equal(t, tt.expected, gameDate.Format())
		})
	}
}
