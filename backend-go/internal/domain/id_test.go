package domain_test

import (
	"errors"
	"testing"

	"github.com/posiposi/dragons-counter/backend-go/internal/domain"
)

func TestParseID(t *testing.T) {
	t.Run("通常の値を保持できる", func(t *testing.T) {
		id, err := domain.ParseID("550e8400-e29b-41d4-a716-446655440000")
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if got := id.Value(); got != "550e8400-e29b-41d4-a716-446655440000" {
			t.Errorf("ParseID().Value() = %v, want %v", got, "550e8400-e29b-41d4-a716-446655440000")
		}
		if got := id.String(); got != "550e8400-e29b-41d4-a716-446655440000" {
			t.Errorf("ParseID().String() = %v, want %v", got, "550e8400-e29b-41d4-a716-446655440000")
		}
	})

	t.Run("前後の空白がtrimされて保存される", func(t *testing.T) {
		id, err := domain.ParseID("  abc-123  ")
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if got := id.Value(); got != "abc-123" {
			t.Errorf("ParseID().Value() = %v, want %v", got, "abc-123")
		}
	})

	t.Run("空文字の場合はドメインエラーを返す", func(t *testing.T) {
		_, err := domain.ParseID("")
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

	t.Run("空白のみの場合はドメインエラーを返す", func(t *testing.T) {
		_, err := domain.ParseID("   ")
		if err == nil {
			t.Fatal("expected error, got nil")
		}

		var domainErr *domain.Error
		if !errors.As(err, &domainErr) {
			t.Fatal("errors.As failed to extract *domain.Error")
		}
	})
}

func TestID_Equals(t *testing.T) {
	t.Run("同じ値のID同士はtrueを返す", func(t *testing.T) {
		a, err := domain.ParseID("same-id")
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		b, err := domain.ParseID("same-id")
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if !a.Equals(b) {
			t.Error("expected Equals to return true")
		}
	})

	t.Run("異なる値のID同士はfalseを返す", func(t *testing.T) {
		a, err := domain.ParseID("id-1")
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		b, err := domain.ParseID("id-2")
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if a.Equals(b) {
			t.Error("expected Equals to return false")
		}
	})
}

func TestNewID(t *testing.T) {
	t.Run("呼び出しごとに異なる値が生成される", func(t *testing.T) {
		first := domain.NewID()
		second := domain.NewID()

		if first.Equals(second) {
			t.Error("expected two NewID calls to produce different IDs")
		}
	})
}
