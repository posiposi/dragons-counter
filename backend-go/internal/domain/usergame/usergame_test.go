package usergame_test

import (
	"testing"
	"time"

	"github.com/posiposi/dragons-counter/backend-go/internal/domain"
	"github.com/posiposi/dragons-counter/backend-go/internal/domain/usergame"
)

func newTestIDs(t *testing.T) (domain.ID, domain.ID) {
	t.Helper()
	userID, err := domain.ParseID("user-1")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	gameID, err := domain.ParseID("game-1")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	return userID, gameID
}

func newTestImpression(t *testing.T, value string) usergame.Impression {
	t.Helper()
	impression, err := usergame.NewImpression(&value)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	return impression
}

func newEmptyImpression(t *testing.T) usergame.Impression {
	t.Helper()
	impression, err := usergame.NewImpression(nil)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	return impression
}

func TestCreateNewUserGame(t *testing.T) {
	t.Run("指定したuserIDとgameIDで作成できる", func(t *testing.T) {
		userID, gameID := newTestIDs(t)

		userGame := usergame.CreateNewUserGame(userID, gameID, newEmptyImpression(t))

		if !userGame.UserID().Equals(userID) {
			t.Error("UserGame.UserID() does not equal expected userID")
		}
		if !userGame.GameID().Equals(gameID) {
			t.Error("UserGame.GameID() does not equal expected gameID")
		}
	})

	t.Run("空のImpressionで作成するとImpressionが空になる", func(t *testing.T) {
		userID, gameID := newTestIDs(t)

		userGame := usergame.CreateNewUserGame(userID, gameID, newEmptyImpression(t))

		if !userGame.Impression().IsEmpty() {
			t.Error("expected Impression to be empty")
		}
	})

	t.Run("Impressionありで作成できる", func(t *testing.T) {
		userID, gameID := newTestIDs(t)
		impression := newTestImpression(t, "素晴らしい試合でした")

		userGame := usergame.CreateNewUserGame(userID, gameID, impression)

		if !userGame.Impression().Equals(impression) {
			t.Error("UserGame.Impression() does not equal expected impression")
		}
	})

	t.Run("作成時にcreatedAtとupdatedAtが現在時刻で設定される", func(t *testing.T) {
		userID, gameID := newTestIDs(t)

		before := time.Now()
		userGame := usergame.CreateNewUserGame(userID, gameID, newEmptyImpression(t))
		after := time.Now()

		if userGame.CreatedAt() != userGame.UpdatedAt() {
			t.Errorf("CreatedAt and UpdatedAt differ: %v vs %v", userGame.CreatedAt(), userGame.UpdatedAt())
		}
		if userGame.CreatedAt().Before(before) {
			t.Error("CreatedAt is before test start time")
		}
		if userGame.CreatedAt().After(after) {
			t.Error("CreatedAt is after test end time")
		}
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

		if !userGame.ID().Equals(id) {
			t.Error("UserGame.ID() does not equal expected ID")
		}
		if !userGame.UserID().Equals(userID) {
			t.Error("UserGame.UserID() does not equal expected userID")
		}
		if !userGame.GameID().Equals(gameID) {
			t.Error("UserGame.GameID() does not equal expected gameID")
		}
		if !userGame.Impression().Equals(impression) {
			t.Error("UserGame.Impression() does not equal expected impression")
		}
		if userGame.CreatedAt() != createdAt {
			t.Errorf("UserGame.CreatedAt() = %v, want %v", userGame.CreatedAt(), createdAt)
		}
		if userGame.UpdatedAt() != updatedAt {
			t.Errorf("UserGame.UpdatedAt() = %v, want %v", userGame.UpdatedAt(), updatedAt)
		}
	})
}

func TestUserGameEquals(t *testing.T) {
	t.Run("IDが同一なら他フィールドが異なっても等価である", func(t *testing.T) {
		id := usergame.NewUserGameID()
		userID, gameID := newTestIDs(t)
		otherUserID, err := domain.ParseID("user-2")
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		createdAt := time.Date(2026, 1, 1, 10, 0, 0, 0, time.UTC)

		userGame1 := usergame.UserGameFromRepository(
			id, userID, gameID, newTestImpression(t, "良い試合"), createdAt, createdAt,
		)
		userGame2 := usergame.UserGameFromRepository(
			id, otherUserID, gameID, newEmptyImpression(t), createdAt.Add(time.Hour), createdAt.Add(time.Hour),
		)

		if !userGame1.Equals(userGame2) {
			t.Error("expected Equals to return true for same ID")
		}
	})

	t.Run("IDが異なると非等価である", func(t *testing.T) {
		userID, gameID := newTestIDs(t)
		impression := newEmptyImpression(t)

		userGame1 := usergame.CreateNewUserGame(userID, gameID, impression)
		userGame2 := usergame.CreateNewUserGame(userID, gameID, impression)

		if userGame1.Equals(userGame2) {
			t.Error("expected Equals to return false for different IDs")
		}
	})
}

func TestUserGameUpdateImpression(t *testing.T) {
	t.Run("新しいImpressionを持つ新インスタン���を返す", func(t *testing.T) {
		userID, gameID := newTestIDs(t)
		original := usergame.CreateNewUserGame(userID, gameID, newTestImpression(t, "最初の感想"))
		newImpression := newTestImpression(t, "更新後の感想")

		updated := original.UpdateImpression(newImpression)

		if !updated.Impression().Equals(newImpression) {
			t.Error("updated UserGame.Impression() does not equal new impression")
		}
	})

	t.Run("元のインスタ��スのImpressionは変更されない", func(t *testing.T) {
		userID, gameID := newTestIDs(t)
		originalImpression := newTestImpression(t, "最初の感想")
		original := usergame.CreateNewUserGame(userID, gameID, originalImpression)

		original.UpdateImpression(newTestImpression(t, "更新後の感想"))

		if !original.Impression().Equals(originalImpression) {
			t.Error("original UserGame.Impression() was mutated")
		}
	})

	t.Run("更新後もIDが維持される", func(t *testing.T) {
		userID, gameID := newTestIDs(t)
		original := usergame.CreateNewUserGame(userID, gameID, newEmptyImpression(t))

		updated := original.UpdateImpression(newTestImpression(t, "更新後の感想"))

		if !original.Equals(updated) {
			t.Error("expected original.Equals(updated) to be true")
		}
		if !updated.ID().Equals(original.ID()) {
			t.Error("updated ID does not match original ID")
		}
	})

	t.Run("更新後のupdatedAtは元のupdatedAt以降の時刻になる", func(t *testing.T) {
		userID, gameID := newTestIDs(t)
		original := usergame.CreateNewUserGame(userID, gameID, newEmptyImpression(t))

		updated := original.UpdateImpression(newTestImpression(t, "更新後の感想"))

		if updated.CreatedAt() != original.CreatedAt() {
			t.Errorf("CreatedAt changed: got %v, want %v", updated.CreatedAt(), original.CreatedAt())
		}
		if updated.UpdatedAt().Before(original.UpdatedAt()) {
			t.Error("updated.UpdatedAt() is before original.UpdatedAt()")
		}
	})
}
