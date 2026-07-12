package game_test

import (
	"errors"
	"testing"

	"github.com/posiposi/dragons-counter/backend-go/internal/domain"
	"github.com/posiposi/dragons-counter/backend-go/internal/domain/game"
)

func TestNewStadiumName(t *testing.T) {
	t.Run("日本語の球場名で生成できる", func(t *testing.T) {
		name, err := game.NewStadiumName("バンテリンドーム ナゴヤ")
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if got := name.Value(); got != "バンテリンドーム ナゴヤ" {
			t.Errorf("NewStadiumName().Value() = %v, want %v", got, "バンテリンドーム ナゴヤ")
		}
	})

	t.Run("英語の球場名で生成できる", func(t *testing.T) {
		name, err := game.NewStadiumName("Vantelin Dome Nagoya")
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if got := name.Value(); got != "Vantelin Dome Nagoya" {
			t.Errorf("NewStadiumName().Value() = %v, want %v", got, "Vantelin Dome Nagoya")
		}
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
				if err == nil {
					t.Fatal("expected error, got nil")
				}

				var domainErr *domain.Error
				if !errors.As(err, &domainErr) {
					t.Fatal("errors.As failed to extract *domain.Error")
				}
				if domainErr.Code == "" {
					t.Error("expected non-empty Code")
				}
			})
		}
	})

	t.Run("前後の空白を除去して保持する", func(t *testing.T) {
		name, err := game.NewStadiumName("  甲子園球場  ")
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if got := name.Value(); got != "甲子園球場" {
			t.Errorf("NewStadiumName().Value() = %v, want %v", got, "甲子園球場")
		}
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
			if err != nil {
				t.Fatalf("unexpected error: %v", err)
			}
			b, err := game.NewStadiumName(tt.b)
			if err != nil {
				t.Fatalf("unexpected error: %v", err)
			}

			if got := a.Equals(b); got != tt.expected {
				t.Errorf("StadiumName.Equals() = %v, want %v", got, tt.expected)
			}
		})
	}
}

func TestNewStadium(t *testing.T) {
	t.Run("IDと球場名から生成できる", func(t *testing.T) {
		id := game.NewStadiumID()
		name, err := game.NewStadiumName("バンテリンドーム ナゴヤ")
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		stadium := game.NewStadium(id, name)

		if !stadium.ID().Equals(id) {
			t.Error("Stadium.ID() does not equal expected ID")
		}
		if !stadium.Name().Equals(name) {
			t.Error("Stadium.Name() does not equal expected name")
		}
	})
}

func TestStadium_Equals(t *testing.T) {
	t.Run("同じIDであれば球場名が異なってもtrueを返す", func(t *testing.T) {
		id, err := game.ParseStadiumID("stadium-001")
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		nameA, err := game.NewStadiumName("ナゴヤドーム")
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		nameB, err := game.NewStadiumName("バンテリンドーム ナゴヤ")
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		a := game.NewStadium(id, nameA)
		b := game.NewStadium(id, nameB)

		if !a.Equals(b) {
			t.Error("expected Equals to return true for same ID")
		}
	})

	t.Run("異なるIDであればfalseを返す", func(t *testing.T) {
		name, err := game.NewStadiumName("甲子園球場")
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		a := game.NewStadium(game.NewStadiumID(), name)
		b := game.NewStadium(game.NewStadiumID(), name)

		if a.Equals(b) {
			t.Error("expected Equals to return false for different IDs")
		}
	})
}

func TestParseStadiumID(t *testing.T) {
	t.Run("値からStadiumIDを生成できる", func(t *testing.T) {
		id, err := game.ParseStadiumID("stadium-001")
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if got := id.Value(); got != "stadium-001" {
			t.Errorf("ParseStadiumID().Value() = %v, want %v", got, "stadium-001")
		}
	})
}

func TestStadiumID_Equals(t *testing.T) {
	t.Run("同じ値のStadiumID同士はtrueを返す", func(t *testing.T) {
		a, err := game.ParseStadiumID("stadium-001")
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		b, err := game.ParseStadiumID("stadium-001")
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if !a.Equals(b) {
			t.Error("expected Equals to return true")
		}
	})

	t.Run("異なる値のStadiumID同士はfalseを返す", func(t *testing.T) {
		a, err := game.ParseStadiumID("stadium-001")
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		b, err := game.ParseStadiumID("stadium-002")
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if a.Equals(b) {
			t.Error("expected Equals to return false")
		}
	})
}

func TestParseGameID(t *testing.T) {
	t.Run("値からGameIDを生成できる", func(t *testing.T) {
		id, err := game.ParseGameID("game-001")
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if got := id.Value(); got != "game-001" {
			t.Errorf("ParseGameID().Value() = %v, want %v", got, "game-001")
		}
	})
}

func TestGameID_Equals(t *testing.T) {
	t.Run("同じ値のGameID同士はtrueを返す", func(t *testing.T) {
		a, err := game.ParseGameID("game-001")
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		b, err := game.ParseGameID("game-001")
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if !a.Equals(b) {
			t.Error("expected Equals to return true")
		}
	})

	t.Run("異なる値のGameID同士はfalseを返す", func(t *testing.T) {
		a, err := game.ParseGameID("game-001")
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		b, err := game.ParseGameID("game-002")
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if a.Equals(b) {
			t.Error("expected Equals to return false")
		}
	})
}
