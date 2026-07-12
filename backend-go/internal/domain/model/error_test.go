package model_test

import (
	"errors"
	"fmt"
	"testing"

	"github.com/posiposi/dragons-counter/backend-go/internal/domain/model"
)

func TestNewError(t *testing.T) {
	t.Run("生成したErrorがcodeとmessageを保持する", func(t *testing.T) {
		err := model.NewError("INVALID_EMAIL", "メールアドレスの形式が不正です")

		if err.Code != "INVALID_EMAIL" {
			t.Errorf("NewError().Code = %v, want %v", err.Code, "INVALID_EMAIL")
		}
		if err.Message != "メールアドレスの形式が不正です" {
			t.Errorf("NewError().Message = %v, want %v", err.Message, "メールアドレスの形式が不正です")
		}
	})
}

func TestError_Error(t *testing.T) {
	t.Run("Errorがmessage文字列を返す", func(t *testing.T) {
		err := model.NewError("GAME_NOT_FOUND", "試合が見つかりません")

		if got := err.Error(); got != "試合が見つかりません" {
			t.Errorf("Error.Error() = %v, want %v", got, "試合が見つかりません")
		}
	})
}

func TestError_ErrorsAs(t *testing.T) {
	t.Run("error型からerrors.Asで取り出してCodeへアクセスできる", func(t *testing.T) {
		var err error = model.NewError("ALREADY_EXISTS", "既に登録されています")
		wrapped := fmt.Errorf("usecase failed: %w", err)

		var domainErr *model.Error
		if !errors.As(wrapped, &domainErr) {
			t.Fatal("errors.As failed to extract *model.Error")
		}
		if domainErr.Code != "ALREADY_EXISTS" {
			t.Errorf("domainErr.Code = %v, want %v", domainErr.Code, "ALREADY_EXISTS")
		}
	})
}
