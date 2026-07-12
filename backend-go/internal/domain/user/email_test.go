package user_test

import (
	"testing"

	"github.com/posiposi/dragons-counter/backend-go/internal/domain/user"
)

func TestNewEmail(t *testing.T) {
	t.Run("有効なメールアドレスで生成できる", func(t *testing.T) {
		tests := []struct {
			name  string
			value string
		}{
			{name: "通常の形式", value: "test@example.com"},
			{name: "サブドメインを含む形式", value: "user@mail.example.co.jp"},
			{name: "プラス記号を含む形式", value: "user+tag@example.com"},
		}
		for _, tt := range tests {
			t.Run(tt.name, func(t *testing.T) {
				email, err := user.NewEmail(tt.value)
				if err != nil {
					t.Fatalf("unexpected error: %v", err)
				}

				if got := email.Value(); got != tt.value {
					t.Errorf("NewEmail(%q).Value() = %v, want %v", tt.value, got, tt.value)
				}
			})
		}
	})

	t.Run("空文字の場合はエラーを返す", func(t *testing.T) {
		tests := []struct {
			name  string
			value string
		}{
			{name: "空文字", value: ""},
			{name: "空白のみ", value: "   "},
		}
		for _, tt := range tests {
			t.Run(tt.name, func(t *testing.T) {
				_, err := user.NewEmail(tt.value)
				if err == nil {
					t.Fatal("expected error, got nil")
				}

				if got := err.Error(); got != "Email cannot be empty" {
					t.Errorf("error message = %v, want %v", got, "Email cannot be empty")
				}
			})
		}
	})

	t.Run("不正な形式の場合はエラーを返す", func(t *testing.T) {
		tests := []struct {
			name  string
			value string
		}{
			{name: "アットマークがない", value: "testexample.com"},
			{name: "ドメインがない", value: "test@"},
			{name: "ローカル部がない", value: "@example.com"},
			{name: "空白を含む", value: "test user@example.com"},
		}
		for _, tt := range tests {
			t.Run(tt.name, func(t *testing.T) {
				_, err := user.NewEmail(tt.value)
				if err == nil {
					t.Fatal("expected error, got nil")
				}

				if got := err.Error(); got != "Invalid email format" {
					t.Errorf("error message = %v, want %v", got, "Invalid email format")
				}
			})
		}
	})
}

func TestEmail_Equals(t *testing.T) {
	t.Run("同じ値のEmail同士はtrueを返す", func(t *testing.T) {
		a, err := user.NewEmail("test@example.com")
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		b, err := user.NewEmail("test@example.com")
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if !a.Equals(b) {
			t.Error("expected Equals to return true")
		}
	})

	t.Run("異なる値のEmail同士はfalseを返す", func(t *testing.T) {
		a, err := user.NewEmail("test@example.com")
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		b, err := user.NewEmail("other@example.com")
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if a.Equals(b) {
			t.Error("expected Equals to return false")
		}
	})
}
