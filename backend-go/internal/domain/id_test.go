package domain_test

import (
	"errors"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"github.com/posiposi/dragons-counter/backend-go/internal/domain"
)

func TestParseID(t *testing.T) {
	t.Run("通常の値を保持できる", func(t *testing.T) {
		id, err := domain.ParseID("550e8400-e29b-41d4-a716-446655440000")

		require.NoError(t, err)
		assert.Equal(t, "550e8400-e29b-41d4-a716-446655440000", id.Value())
		assert.Equal(t, "550e8400-e29b-41d4-a716-446655440000", id.String())
	})

	t.Run("前後の空白がtrimされて保存される", func(t *testing.T) {
		id, err := domain.ParseID("  abc-123  ")

		require.NoError(t, err)
		assert.Equal(t, "abc-123", id.Value())
	})

	t.Run("空文字の場合はドメインエラーを返す", func(t *testing.T) {
		_, err := domain.ParseID("")

		require.Error(t, err)
		var domainErr *domain.Error
		require.True(t, errors.As(err, &domainErr))
		assert.NotEmpty(t, domainErr.Code)
	})

	t.Run("空白のみの場合はドメインエラーを返す", func(t *testing.T) {
		_, err := domain.ParseID("   ")

		require.Error(t, err)
		var domainErr *domain.Error
		require.True(t, errors.As(err, &domainErr))
	})
}

func TestID_Equals(t *testing.T) {
	t.Run("同じ値のID同士はtrueを返す", func(t *testing.T) {
		a, err := domain.ParseID("same-id")
		require.NoError(t, err)
		b, err := domain.ParseID("same-id")
		require.NoError(t, err)

		assert.True(t, a.Equals(b))
	})

	t.Run("異なる値のID同士はfalseを返す", func(t *testing.T) {
		a, err := domain.ParseID("id-1")
		require.NoError(t, err)
		b, err := domain.ParseID("id-2")
		require.NoError(t, err)

		assert.False(t, a.Equals(b))
	})
}

func TestNewID(t *testing.T) {
	t.Run("呼び出しごとに異なる値が生成される", func(t *testing.T) {
		first := domain.NewID()
		second := domain.NewID()

		assert.False(t, first.Equals(second))
	})
}
