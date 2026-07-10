package domain_test

import (
	"errors"
	"fmt"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"github.com/posiposi/dragons-counter/backend-go/internal/domain"
)

func TestNewError(t *testing.T) {
	t.Run("生成したErrorがcodeとmessageを保持する", func(t *testing.T) {
		err := domain.NewError("INVALID_EMAIL", "メールアドレスの形式が不正です")

		assert.Equal(t, "INVALID_EMAIL", err.Code)
		assert.Equal(t, "メールアドレスの形式が不正です", err.Message)
	})
}

func TestError_Error(t *testing.T) {
	t.Run("Errorがmessage文字列を返す", func(t *testing.T) {
		err := domain.NewError("GAME_NOT_FOUND", "試合が見つかりません")

		assert.Equal(t, "試合が見つかりません", err.Error())
	})
}

func TestError_ErrorsAs(t *testing.T) {
	t.Run("error型からerrors.Asで取り出してCodeへアクセスできる", func(t *testing.T) {
		var err error = domain.NewError("ALREADY_EXISTS", "既に登録されています")
		wrapped := fmt.Errorf("usecase failed: %w", err)

		var domainErr *domain.Error
		require.True(t, errors.As(wrapped, &domainErr))
		assert.Equal(t, "ALREADY_EXISTS", domainErr.Code)
	})
}
