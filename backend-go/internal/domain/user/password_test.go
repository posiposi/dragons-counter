package user_test

import (
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"golang.org/x/crypto/bcrypt"

	"github.com/posiposi/dragons-counter/backend-go/internal/domain/user"
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
				_, err := user.NewPasswordFromPlainText(tt.value)

				require.Error(t, err)
				assert.Equal(t, "Password cannot be empty", err.Error())
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
				_, err := user.NewPasswordFromHash(tt.value)

				require.Error(t, err)
				assert.Equal(t, "Password hash cannot be empty", err.Error())
			})
		}
	})
}

func TestPassword_Compare(t *testing.T) {
	t.Run("平文から生成したPasswordが同じ平文と一致する", func(t *testing.T) {
		password, err := user.NewPasswordFromPlainText("SecurePass123!")
		require.NoError(t, err)

		assert.True(t, password.Compare("SecurePass123!"))
	})

	t.Run("平文から生成したPasswordが異なる平文と一致しない", func(t *testing.T) {
		password, err := user.NewPasswordFromPlainText("SecurePass123!")
		require.NoError(t, err)

		assert.False(t, password.Compare("WrongPass456!"))
	})

	t.Run("ハッシュから復元したPasswordのCompareが機能する", func(t *testing.T) {
		original, err := user.NewPasswordFromPlainText("SecurePass123!")
		require.NoError(t, err)

		restored, err := user.NewPasswordFromHash(original.Hash())
		require.NoError(t, err)

		assert.True(t, restored.Compare("SecurePass123!"))
		assert.False(t, restored.Compare("WrongPass456!"))
	})

	t.Run("既知のbcryptハッシュから復元したPasswordが平文と照合できる", func(t *testing.T) {
		hashBytes, err := bcrypt.GenerateFromPassword([]byte("StoredDbPass789!"), 10)
		require.NoError(t, err)

		password, err := user.NewPasswordFromHash(string(hashBytes))
		require.NoError(t, err)

		assert.True(t, password.Compare("StoredDbPass789!"))
		assert.False(t, password.Compare("WrongPass456!"))
	})
}
