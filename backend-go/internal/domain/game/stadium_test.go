package game_test

import (
	"errors"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"github.com/posiposi/dragons-counter/backend-go/internal/domain"
	"github.com/posiposi/dragons-counter/backend-go/internal/domain/game"
)

func TestNewStadiumName(t *testing.T) {
	t.Run("日本語の球場名で生成できる", func(t *testing.T) {
		name, err := game.NewStadiumName("バンテリンドーム ナゴヤ")

		require.NoError(t, err)
		assert.Equal(t, "バンテリンドーム ナゴヤ", name.Value())
	})

	t.Run("英語の球場名で生成できる", func(t *testing.T) {
		name, err := game.NewStadiumName("Vantelin Dome Nagoya")

		require.NoError(t, err)
		assert.Equal(t, "Vantelin Dome Nagoya", name.Value())
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
				_, err := game.NewStadiumName(tt.value)

				require.Error(t, err)
				var domainErr *domain.Error
				require.True(t, errors.As(err, &domainErr))
				assert.NotEmpty(t, domainErr.Code)
			})
		}
	})

	t.Run("前後の空白を除去して保持する", func(t *testing.T) {
		name, err := game.NewStadiumName("  甲子園球場  ")

		require.NoError(t, err)
		assert.Equal(t, "甲子園球場", name.Value())
	})
}

func TestStadiumName_Equals(t *testing.T) {
	tests := []struct {
		name     string
		a        string
		b        string
		expected bool
	}{
		{name: "同じ値の球場名同士はtrueを返す", a: "甲子園球場", b: "甲子園球場", expected: true},
		{name: "異なる値の球場名同士はfalseを返す", a: "甲子園球場", b: "東京ドーム", expected: false},
		{name: "前後の空白差はtrimされて等価になる", a: "甲子園球場", b: "  甲子園球場  ", expected: true},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			a, err := game.NewStadiumName(tt.a)
			require.NoError(t, err)
			b, err := game.NewStadiumName(tt.b)
			require.NoError(t, err)

			assert.Equal(t, tt.expected, a.Equals(b))
		})
	}
}

func TestNewStadium(t *testing.T) {
	t.Run("IDと球場名から生成できる", func(t *testing.T) {
		id := game.NewStadiumID()
		name, err := game.NewStadiumName("バンテリンドーム ナゴヤ")
		require.NoError(t, err)

		stadium := game.NewStadium(id, name)

		assert.True(t, stadium.ID().Equals(id))
		assert.True(t, stadium.Name().Equals(name))
	})
}

func TestStadium_Equals(t *testing.T) {
	t.Run("同じIDであれば球場名が異なってもtrueを返す", func(t *testing.T) {
		id, err := game.ParseStadiumID("stadium-001")
		require.NoError(t, err)
		nameA, err := game.NewStadiumName("ナゴヤドーム")
		require.NoError(t, err)
		nameB, err := game.NewStadiumName("バンテリンドーム ナゴヤ")
		require.NoError(t, err)

		a := game.NewStadium(id, nameA)
		b := game.NewStadium(id, nameB)

		assert.True(t, a.Equals(b))
	})

	t.Run("異なるIDであればfalseを返す", func(t *testing.T) {
		name, err := game.NewStadiumName("甲子園球場")
		require.NoError(t, err)

		a := game.NewStadium(game.NewStadiumID(), name)
		b := game.NewStadium(game.NewStadiumID(), name)

		assert.False(t, a.Equals(b))
	})
}

func TestParseStadiumID(t *testing.T) {
	t.Run("値からStadiumIDを生成できる", func(t *testing.T) {
		id, err := game.ParseStadiumID("stadium-001")

		require.NoError(t, err)
		assert.Equal(t, "stadium-001", id.Value())
	})
}

func TestStadiumID_Equals(t *testing.T) {
	t.Run("同じ値のStadiumID同士はtrueを返す", func(t *testing.T) {
		a, err := game.ParseStadiumID("stadium-001")
		require.NoError(t, err)
		b, err := game.ParseStadiumID("stadium-001")
		require.NoError(t, err)

		assert.True(t, a.Equals(b))
	})

	t.Run("異なる値のStadiumID同士はfalseを返す", func(t *testing.T) {
		a, err := game.ParseStadiumID("stadium-001")
		require.NoError(t, err)
		b, err := game.ParseStadiumID("stadium-002")
		require.NoError(t, err)

		assert.False(t, a.Equals(b))
	})
}

func TestParseGameID(t *testing.T) {
	t.Run("値からGameIDを生成できる", func(t *testing.T) {
		id, err := game.ParseGameID("game-001")

		require.NoError(t, err)
		assert.Equal(t, "game-001", id.Value())
	})
}

func TestGameID_Equals(t *testing.T) {
	t.Run("同じ値のGameID同士はtrueを返す", func(t *testing.T) {
		a, err := game.ParseGameID("game-001")
		require.NoError(t, err)
		b, err := game.ParseGameID("game-001")
		require.NoError(t, err)

		assert.True(t, a.Equals(b))
	})

	t.Run("異なる値のGameID同士はfalseを返す", func(t *testing.T) {
		a, err := game.ParseGameID("game-001")
		require.NoError(t, err)
		b, err := game.ParseGameID("game-002")
		require.NoError(t, err)

		assert.False(t, a.Equals(b))
	})
}
