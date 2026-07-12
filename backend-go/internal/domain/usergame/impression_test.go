package usergame_test

import (
	"errors"
	"strings"
	"testing"

	"github.com/posiposi/dragons-counter/backend-go/internal/domain"
	"github.com/posiposi/dragons-counter/backend-go/internal/domain/usergame"
)

func strPtr(s string) *string {
	return &s
}

func TestNewImpression(t *testing.T) {
	t.Run("有効な文字列で生成できる", func(t *testing.T) {
		impression, err := usergame.NewImpression(strPtr("素晴らしい試合でした"))
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if impression.Value() == nil {
			t.Fatal("expected non-nil Value")
		}
		if got := *impression.Value(); got != "素晴らしい試合でした" {
			t.Errorf("NewImpression().Value() = %v, want %v", got, "素晴らしい試合でした")
		}
		if impression.IsEmpty() {
			t.Error("expected IsEmpty to return false")
		}
	})

	t.Run("nilと空文字列は空として扱う", func(t *testing.T) {
		fromNil, err := usergame.NewImpression(nil)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if fromNil.Value() != nil {
			t.Errorf("expected nil Value, got %v", fromNil.Value())
		}
		if !fromNil.IsEmpty() {
			t.Error("expected IsEmpty to return true")
		}

		fromEmpty, err := usergame.NewImpression(strPtr(""))
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if fromEmpty.Value() != nil {
			t.Errorf("expected nil Value, got %v", fromEmpty.Value())
		}
		if !fromEmpty.IsEmpty() {
			t.Error("expected IsEmpty to return true")
		}
	})

	t.Run("前後の空白をトリムする", func(t *testing.T) {
		impression, err := usergame.NewImpression(strPtr("  感動した試合  "))
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if impression.Value() == nil {
			t.Fatal("expected non-nil Value")
		}
		if got := *impression.Value(); got != "感動した試合" {
			t.Errorf("NewImpression().Value() = %v, want %v", got, "感動した試合")
		}
	})

	t.Run("空白のみの文字列は空として扱う", func(t *testing.T) {
		impression, err := usergame.NewImpression(strPtr("   "))
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if impression.Value() != nil {
			t.Errorf("expected nil Value, got %v", impression.Value())
		}
		if !impression.IsEmpty() {
			t.Error("expected IsEmpty to return true")
		}
	})

	t.Run("191文字を超える文字列でエラーになる", func(t *testing.T) {
		longString := strings.Repeat("あ", 192)

		_, err := usergame.NewImpression(strPtr(longString))
		if err == nil {
			t.Fatal("expected error, got nil")
		}

		var domainErr *domain.Error
		if !errors.As(err, &domainErr) {
			t.Fatal("errors.As failed to extract *domain.Error")
		}
		if domainErr.Code != "INVALID_IMPRESSION" {
			t.Errorf("domainErr.Code = %v, want %v", domainErr.Code, "INVALID_IMPRESSION")
		}
		if domainErr.Message != "Impression must be 191 characters or less" {
			t.Errorf("domainErr.Message = %v, want %v", domainErr.Message, "Impression must be 191 characters or less")
		}
	})

	t.Run("191文字ちょうどの文字列で生成できる", func(t *testing.T) {
		maxString := strings.Repeat("あ", 191)

		impression, err := usergame.NewImpression(strPtr(maxString))
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if impression.Value() == nil {
			t.Fatal("expected non-nil Value")
		}
		if got := *impression.Value(); got != maxString {
			t.Errorf("NewImpression().Value() length = %d, want %d", len(got), len(maxString))
		}
	})
}

func TestImpressionEquals(t *testing.T) {
	t.Run("空同士が等価である", func(t *testing.T) {
		impression1, err := usergame.NewImpression(nil)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		impression2, err := usergame.NewImpression(strPtr(""))
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if !impression1.Equals(impression2) {
			t.Error("expected Equals to return true")
		}
	})

	t.Run("値ありと空が非等価である", func(t *testing.T) {
		impression1, err := usergame.NewImpression(strPtr("良い試合"))
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		impression2, err := usergame.NewImpression(nil)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if impression1.Equals(impression2) {
			t.Error("expected Equals to return false")
		}
	})

	t.Run("トリム後の値で等価性を比較する", func(t *testing.T) {
		impression1, err := usergame.NewImpression(strPtr("  良い試合  "))
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		impression2, err := usergame.NewImpression(strPtr("良い試合"))
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if !impression1.Equals(impression2) {
			t.Error("expected Equals to return true")
		}
	})
}
