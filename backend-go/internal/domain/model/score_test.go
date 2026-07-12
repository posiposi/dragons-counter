package model_test

import (
	"errors"
	"testing"

	"github.com/posiposi/dragons-counter/backend-go/internal/domain/model"
)

func TestNewScore(t *testing.T) {
	t.Run("正常な値でスコアを生成できる", func(t *testing.T) {
		tests := []struct {
			name  string
			value int
		}{
			{name: "0を保持できる", value: 0},
			{name: "5を保持できる", value: 5},
			{name: "15を保持できる", value: 15},
		}

		for _, tt := range tests {
			t.Run(tt.name, func(t *testing.T) {
				score, err := model.NewScore(tt.value)
				if err != nil {
					t.Fatalf("unexpected error: %v", err)
				}

				if got := score.Value(); got != tt.value {
					t.Errorf("NewScore(%d).Value() = %v, want %v", tt.value, got, tt.value)
				}
			})
		}
	})

	t.Run("負数の場合はドメインエラーを返す", func(t *testing.T) {
		_, err := model.NewScore(-1)
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

func TestScore_Equals(t *testing.T) {
	tests := []struct {
		name     string
		a        int
		b        int
		expected bool
	}{
		{name: "同じ値のスコア同士はtrueを返す", a: 7, b: 7, expected: true},
		{name: "異なる値のスコア同士はfalseを返す", a: 3, b: 5, expected: false},
		{name: "0同士はtrueを返す", a: 0, b: 0, expected: true},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			a, err := model.NewScore(tt.a)
			if err != nil {
				t.Fatalf("unexpected error: %v", err)
			}
			b, err := model.NewScore(tt.b)
			if err != nil {
				t.Fatalf("unexpected error: %v", err)
			}

			if got := a.Equals(b); got != tt.expected {
				t.Errorf("Score.Equals() = %v, want %v", got, tt.expected)
			}
		})
	}
}
