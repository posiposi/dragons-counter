package usergame_test

import (
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"github.com/posiposi/dragons-counter/backend-go/internal/domain"
	"github.com/posiposi/dragons-counter/backend-go/internal/domain/usergame"
)

func newTestIDs(t *testing.T) (domain.ID, domain.ID) {
	t.Helper()
	userID, err := domain.ParseID("user-1")
	require.NoError(t, err)
	gameID, err := domain.ParseID("game-1")
	require.NoError(t, err)
	return userID, gameID
}

func newTestImpression(t *testing.T, value string) usergame.Impression {
	t.Helper()
	impression, err := usergame.NewImpression(&value)
	require.NoError(t, err)
	return impression
}

func newEmptyImpression(t *testing.T) usergame.Impression {
	t.Helper()
	impression, err := usergame.NewImpression(nil)
	require.NoError(t, err)
	return impression
}

func TestCreateNewUserGame(t *testing.T) {
	t.Run("IDが自動生成され空でない", func(t *testing.T) {
		userID, gameID := newTestIDs(t)

		userGame := usergame.CreateNewUserGame(userID, gameID, newEmptyImpression(t))

		assert.NotEmpty(t, userGame.ID().Value())
	})

	t.Run("指定したuserIDとgameIDで作成できる", func(t *testing.T) {
		userID, gameID := newTestIDs(t)

		userGame := usergame.CreateNewUserGame(userID, gameID, newEmptyImpression(t))

		assert.True(t, userGame.UserID().Equals(userID))
		assert.True(t, userGame.GameID().Equals(gameID))
	})

	t.Run("空のImpressionで作成するとImpressionが空になる", func(t *testing.T) {
		userID, gameID := newTestIDs(t)

		userGame := usergame.CreateNewUserGame(userID, gameID, newEmptyImpression(t))

		assert.True(t, userGame.Impression().IsEmpty())
	})

	t.Run("Impressionありで作成できる", func(t *testing.T) {
		userID, gameID := newTestIDs(t)
		impression := newTestImpression(t, "素晴らしい試合でした")

		userGame := usergame.CreateNewUserGame(userID, gameID, impression)

		assert.True(t, userGame.Impression().Equals(impression))
	})

	t.Run("作成時にcreatedAtとupdatedAtが現在時刻で設定される", func(t *testing.T) {
		userID, gameID := newTestIDs(t)

		before := time.Now()
		userGame := usergame.CreateNewUserGame(userID, gameID, newEmptyImpression(t))
		after := time.Now()

		assert.Equal(t, userGame.CreatedAt(), userGame.UpdatedAt())
		assert.False(t, userGame.CreatedAt().Before(before))
		assert.False(t, userGame.CreatedAt().After(after))
	})
}

func TestUserGameFromRepository(t *testing.T) {
	t.Run("すべてのフィールドを復元できる", func(t *testing.T) {
		id := usergame.NewUserGameID()
		userID, gameID := newTestIDs(t)
		impression := newTestImpression(t, "良い試合")
		createdAt := time.Date(2026, 1, 1, 10, 0, 0, 0, time.UTC)
		updatedAt := time.Date(2026, 1, 2, 12, 30, 0, 0, time.UTC)

		userGame := usergame.UserGameFromRepository(id, userID, gameID, impression, createdAt, updatedAt)

		assert.True(t, userGame.ID().Equals(id))
		assert.True(t, userGame.UserID().Equals(userID))
		assert.True(t, userGame.GameID().Equals(gameID))
		assert.True(t, userGame.Impression().Equals(impression))
		assert.Equal(t, createdAt, userGame.CreatedAt())
		assert.Equal(t, updatedAt, userGame.UpdatedAt())
	})
}

func TestUserGameEquals(t *testing.T) {
	t.Run("IDが同一なら他フィールドが異なっても等価である", func(t *testing.T) {
		id := usergame.NewUserGameID()
		userID, gameID := newTestIDs(t)
		otherUserID, err := domain.ParseID("user-2")
		require.NoError(t, err)
		createdAt := time.Date(2026, 1, 1, 10, 0, 0, 0, time.UTC)

		userGame1 := usergame.UserGameFromRepository(
			id, userID, gameID, newTestImpression(t, "良い試合"), createdAt, createdAt,
		)
		userGame2 := usergame.UserGameFromRepository(
			id, otherUserID, gameID, newEmptyImpression(t), createdAt.Add(time.Hour), createdAt.Add(time.Hour),
		)

		assert.True(t, userGame1.Equals(userGame2))
	})

	t.Run("IDが異なると非等価である", func(t *testing.T) {
		userID, gameID := newTestIDs(t)
		impression := newEmptyImpression(t)

		userGame1 := usergame.CreateNewUserGame(userID, gameID, impression)
		userGame2 := usergame.CreateNewUserGame(userID, gameID, impression)

		assert.False(t, userGame1.Equals(userGame2))
	})
}

func TestUserGameUpdateImpression(t *testing.T) {
	t.Run("新しいImpressionを持つ新インスタンスを返す", func(t *testing.T) {
		userID, gameID := newTestIDs(t)
		original := usergame.CreateNewUserGame(userID, gameID, newTestImpression(t, "最初の感想"))
		newImpression := newTestImpression(t, "更新後の感想")

		updated := original.UpdateImpression(newImpression)

		assert.True(t, updated.Impression().Equals(newImpression))
	})

	t.Run("元のインスタンスのImpressionは変更されない", func(t *testing.T) {
		userID, gameID := newTestIDs(t)
		originalImpression := newTestImpression(t, "最初の感想")
		original := usergame.CreateNewUserGame(userID, gameID, originalImpression)

		original.UpdateImpression(newTestImpression(t, "更新後の感想"))

		assert.True(t, original.Impression().Equals(originalImpression))
	})

	t.Run("更新後もIDが維持される", func(t *testing.T) {
		userID, gameID := newTestIDs(t)
		original := usergame.CreateNewUserGame(userID, gameID, newEmptyImpression(t))

		updated := original.UpdateImpression(newTestImpression(t, "更新後の感想"))

		assert.True(t, original.Equals(updated))
		assert.True(t, updated.ID().Equals(original.ID()))
	})

	t.Run("更新後のupdatedAtは元のupdatedAt以降の時刻になる", func(t *testing.T) {
		userID, gameID := newTestIDs(t)
		original := usergame.CreateNewUserGame(userID, gameID, newEmptyImpression(t))

		updated := original.UpdateImpression(newTestImpression(t, "更新後の感想"))

		assert.Equal(t, original.CreatedAt(), updated.CreatedAt())
		assert.False(t, updated.UpdatedAt().Before(original.UpdatedAt()))
	})
}
