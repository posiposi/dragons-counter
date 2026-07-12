package model_test

import (
	"errors"
	"testing"

	"github.com/posiposi/dragons-counter/backend-go/internal/domain/model"
)

func TestNewOpponent(t *testing.T) {
	t.Run("正式名称をそのまま保持できる", func(t *testing.T) {
		opponent, err := model.NewOpponent("読売ジャイアンツ")
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if got := opponent.Value(); got != "読売ジャイアンツ" {
			t.Errorf("NewOpponent().Value() = %v, want %v", got, "読売ジャイアンツ")
		}
	})

	t.Run("英語名をそのまま保持できる", func(t *testing.T) {
		opponent, err := model.NewOpponent("Yomiuri Giants")
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if got := opponent.Value(); got != "Yomiuri Giants" {
			t.Errorf("NewOpponent().Value() = %v, want %v", got, "Yomiuri Giants")
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
				_, err := model.NewOpponent(tt.value)
				if err == nil {
					t.Fatal("expected error, got nil")
				}

				var domainErr *model.Error
				if !errors.As(err, &domainErr) {
					t.Fatal("errors.As failed to extract *model.Error")
				}
				if domainErr.Code == "" {
					t.Error("expected non-empty Code")
				}
			})
		}
	})

	t.Run("前後の空白を除去して保持する", func(t *testing.T) {
		opponent, err := model.NewOpponent("  読売ジャイアンツ  ")
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if got := opponent.Value(); got != "読売ジャイアンツ" {
			t.Errorf("NewOpponent().Value() = %v, want %v", got, "読売ジャイアンツ")
		}
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
				opponent, err := model.NewOpponent(tt.abbreviation)
				if err != nil {
					t.Fatalf("unexpected error: %v", err)
				}

				if got := opponent.Value(); got != tt.expected {
					t.Errorf("NewOpponent(%q).Value() = %v, want %v", tt.abbreviation, got, tt.expected)
				}
			})
		}
	})

	t.Run("未知の値はそのまま保持する", func(t *testing.T) {
		opponent, err := model.NewOpponent("未知のチーム")
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if got := opponent.Value(); got != "未知のチーム" {
			t.Errorf("NewOpponent().Value() = %v, want %v", got, "未知のチーム")
		}
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
			a, err := model.NewOpponent(tt.a)
			if err != nil {
				t.Fatalf("unexpected error: %v", err)
			}
			b, err := model.NewOpponent(tt.b)
			if err != nil {
				t.Fatalf("unexpected error: %v", err)
			}

			if got := a.Equals(b); got != tt.expected {
				t.Errorf("Opponent.Equals() = %v, want %v", got, tt.expected)
			}
		})
	}
}
