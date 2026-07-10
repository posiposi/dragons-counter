package usergame_test

import (
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"github.com/posiposi/dragons-counter/backend-go/internal/domain/usergame"
)

func TestNewUserGameID(t *testing.T) {
	t.Run("非空のIDを採番する", func(t *testing.T) {
		id := usergame.NewUserGameID()

		assert.NotEmpty(t, id.Value())
	})
}

func TestParseUserGameID(t *testing.T) {
	t.Run("有効な文字列で生成できる", func(t *testing.T) {
		id, err := usergame.ParseUserGameID("user-game-id-1")

		require.NoError(t, err)
		assert.Equal(t, "user-game-id-1", id.Value())
	})
}

func TestUserGameIDEquals(t *testing.T) {
	t.Run("同一値のIDが等価である", func(t *testing.T) {
		id1, err := usergame.ParseUserGameID("user-game-id-1")
		require.NoError(t, err)
		id2, err := usergame.ParseUserGameID("user-game-id-1")
		require.NoError(t, err)

		assert.True(t, id1.Equals(id2))
	})

	t.Run("異なる値のIDが非等価である", func(t *testing.T) {
		id1, err := usergame.ParseUserGameID("user-game-id-1")
		require.NoError(t, err)
		id2, err := usergame.ParseUserGameID("user-game-id-2")
		require.NoError(t, err)

		assert.False(t, id1.Equals(id2))
	})
}
