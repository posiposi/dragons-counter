package model_test

import (
	"testing"

	"github.com/posiposi/dragons-counter/backend-go/internal/domain/model"
)

func TestParseUserGameID(t *testing.T) {
	t.Run("有効な文字列で生成できる", func(t *testing.T) {
		id, err := model.ParseUserGameID("user-game-id-1")
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if got := id.Value(); got != "user-game-id-1" {
			t.Errorf("ParseUserGameID().Value() = %v, want %v", got, "user-game-id-1")
		}
	})
}

func TestUserGameIDEquals(t *testing.T) {
	t.Run("同一値のIDが等価である", func(t *testing.T) {
		id1, err := model.ParseUserGameID("user-game-id-1")
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		id2, err := model.ParseUserGameID("user-game-id-1")
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if !id1.Equals(id2) {
			t.Error("expected Equals to return true")
		}
	})

	t.Run("異なる値のIDが非等価である", func(t *testing.T) {
		id1, err := model.ParseUserGameID("user-game-id-1")
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		id2, err := model.ParseUserGameID("user-game-id-2")
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if id1.Equals(id2) {
			t.Error("expected Equals to return false")
		}
	})
}
