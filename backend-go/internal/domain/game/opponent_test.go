package game_test

import (
	"errors"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"github.com/posiposi/dragons-counter/backend-go/internal/domain"
	"github.com/posiposi/dragons-counter/backend-go/internal/domain/game"
)

func TestNewOpponent(t *testing.T) {
	t.Run("正式名称をそのまま保持できる", func(t *testing.T) {
		opponent, err := game.NewOpponent("読売ジャイアンツ")

		require.NoError(t, err)
		assert.Equal(t, "読売ジャイアンツ", opponent.Value())
	})

	t.Run("英語名をそのまま保持できる", func(t *testing.T) {
		opponent, err := game.NewOpponent("Yomiuri Giants")

		require.NoError(t, err)
		assert.Equal(t, "Yomiuri Giants", opponent.Value())
	})

	t.Run("空文字または空白のみの場合はドメインエラーを返す", func(t *testing.T) {
		tests := []struct {
			name  string
			value string
		}{
			{name: "空文字はエラーになる", value: ""},
			{name: "空白のみはエラーになる", value: "   "},
		}

		for _, tt := range tests {
			t.Run(tt.name, func(t *testing.T) {
				_, err := game.NewOpponent(tt.value)

				require.Error(t, err)
				var domainErr *domain.Error
				require.True(t, errors.As(err, &domainErr))
				assert.NotEmpty(t, domainErr.Code)
			})
		}
	})

	t.Run("前後の空白を除去して保持する", func(t *testing.T) {
		opponent, err := game.NewOpponent("  読売ジャイアンツ  ")

		require.NoError(t, err)
		assert.Equal(t, "読売ジャイアンツ", opponent.Value())
	})

	t.Run("12球団の略称を正式名称に変換できる", func(t *testing.T) {
		tests := []struct {
			name         string
			abbreviation string
			expected     string
		}{
			{name: "巨は読売ジャイアンツに変換される", abbreviation: "巨", expected: "読売ジャイアンツ"},
			{name: "神は阪神タイガースに変換される", abbreviation: "神", expected: "阪神タイガース"},
			{name: "広は広島東洋カープに変換される", abbreviation: "広", expected: "広島東洋カープ"},
			{name: "Deは横浜DeNAベイスターズに変換される", abbreviation: "De", expected: "横浜DeNAベイスターズ"},
			{name: "ヤは東京ヤクルトスワローズに変換される", abbreviation: "ヤ", expected: "東京ヤクルトスワローズ"},
			{name: "中は中日ドラゴンズに変換される", abbreviation: "中", expected: "中日ドラゴンズ"},
			{name: "オはオリックス・バファローズに変換される", abbreviation: "オ", expected: "オリックス・バファローズ"},
			{name: "ソは福岡ソフトバンクホークスに変換される", abbreviation: "ソ", expected: "福岡ソフトバンクホークス"},
			{name: "楽は東北楽天ゴールデンイーグルスに変換される", abbreviation: "楽", expected: "東北楽天ゴールデンイーグルス"},
			{name: "西は埼玉西武ライオンズに変換される", abbreviation: "西", expected: "埼玉西武ライオンズ"},
			{name: "ロは千葉ロッテマリーンズに変換される", abbreviation: "ロ", expected: "千葉ロッテマリーンズ"},
			{name: "日は北海道日本ハムファイターズに変換される", abbreviation: "日", expected: "北海道日本ハムファイターズ"},
		}

		for _, tt := range tests {
			t.Run(tt.name, func(t *testing.T) {
				opponent, err := game.NewOpponent(tt.abbreviation)

				require.NoError(t, err)
				assert.Equal(t, tt.expected, opponent.Value())
			})
		}
	})

	t.Run("未知の値はそのまま保持する", func(t *testing.T) {
		opponent, err := game.NewOpponent("未知のチーム")

		require.NoError(t, err)
		assert.Equal(t, "未知のチーム", opponent.Value())
	})
}

func TestOpponent_Equals(t *testing.T) {
	tests := []struct {
		name     string
		a        string
		b        string
		expected bool
	}{
		{name: "同じ値の対戦相手同士はtrueを返す", a: "阪神タイガース", b: "阪神タイガース", expected: true},
		{name: "異なる値の対戦相手同士はfalseを返す", a: "阪神タイガース", b: "読売ジャイアンツ", expected: false},
		{name: "前後の空白差はtrimされて等価になる", a: "阪神タイガース", b: "  阪神タイガース  ", expected: true},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			a, err := game.NewOpponent(tt.a)
			require.NoError(t, err)
			b, err := game.NewOpponent(tt.b)
			require.NoError(t, err)

			assert.Equal(t, tt.expected, a.Equals(b))
		})
	}
}
