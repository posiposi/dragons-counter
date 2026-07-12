package model_test

import (
	"testing"

	"golang.org/x/crypto/bcrypt"

	"github.com/posiposi/dragons-counter/backend-go/internal/domain/model"
)

func TestNewPasswordFromPlainText(t *testing.T) {
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
				_, err := model.NewPasswordFromPlainText(tt.value)
				if err == nil {
					t.Fatal("expected error, got nil")
				}

				if got := err.Error(); got != "Password cannot be empty" {
					t.Errorf("error message = %v, want %v", got, "Password cannot be empty")
				}
			})
		}
	})
}

func TestNewPasswordFromHash(t *testing.T) {
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
				_, err := model.NewPasswordFromHash(tt.value)
				if err == nil {
					t.Fatal("expected error, got nil")
				}

				if got := err.Error(); got != "Password hash cannot be empty" {
					t.Errorf("error message = %v, want %v", got, "Password hash cannot be empty")
				}
			})
		}
	})
}

func TestPassword_Compare(t *testing.T) {
	t.Run("平文から生成したPasswordが同じ平文と一致する", func(t *testing.T) {
		password, err := model.NewPasswordFromPlainText("SecurePass123!")
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if !password.Compare("SecurePass123!") {
			t.Error("expected Compare to return true for matching plaintext")
		}
	})

	t.Run("平文から生成したPasswordが異なる平文と一致しない", func(t *testing.T) {
		password, err := model.NewPasswordFromPlainText("SecurePass123!")
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if password.Compare("WrongPass456!") {
			t.Error("expected Compare to return false for non-matching plaintext")
		}
	})

	t.Run("ハッシュから復元したPasswordのCompareが機能する", func(t *testing.T) {
		original, err := model.NewPasswordFromPlainText("SecurePass123!")
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		restored, err := model.NewPasswordFromHash(original.Hash())
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if !restored.Compare("SecurePass123!") {
			t.Error("expected Compare to return true for matching plaintext")
		}
		if restored.Compare("WrongPass456!") {
			t.Error("expected Compare to return false for non-matching plaintext")
		}
	})

	t.Run("既知のbcryptハッシュから復元したPasswordが平文と照合できる", func(t *testing.T) {
		hashBytes, err := bcrypt.GenerateFromPassword([]byte("StoredDbPass789!"), 10)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		password, err := model.NewPasswordFromHash(string(hashBytes))
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if !password.Compare("StoredDbPass789!") {
			t.Error("expected Compare to return true for matching plaintext")
		}
		if password.Compare("WrongPass456!") {
			t.Error("expected Compare to return false for non-matching plaintext")
		}
	})
}
