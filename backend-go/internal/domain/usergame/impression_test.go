package usergame_test

import (
	"errors"
	"strings"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"github.com/posiposi/dragons-counter/backend-go/internal/domain"
	"github.com/posiposi/dragons-counter/backend-go/internal/domain/usergame"
)

func strPtr(s string) *string {
	return &s
}

func TestNewImpression(t *testing.T) {
	t.Run("有効な文字列で生成できる", func(t *testing.T) {
		impression, err := usergame.NewImpression(strPtr("素晴らしい試合でした"))

		require.NoError(t, err)
		require.NotNil(t, impression.Value())
		assert.Equal(t, "素晴らしい試合でした", *impression.Value())
		assert.False(t, impression.IsEmpty())
	})

	t.Run("nilと空文字列は空として扱う", func(t *testing.T) {
		fromNil, err := usergame.NewImpression(nil)
		require.NoError(t, err)
		assert.Nil(t, fromNil.Value())
		assert.True(t, fromNil.IsEmpty())

		fromEmpty, err := usergame.NewImpression(strPtr(""))
		require.NoError(t, err)
		assert.Nil(t, fromEmpty.Value())
		assert.True(t, fromEmpty.IsEmpty())
	})

	t.Run("前後の空白をトリムする", func(t *testing.T) {
		impression, err := usergame.NewImpression(strPtr("  感動した試合  "))

		require.NoError(t, err)
		require.NotNil(t, impression.Value())
		assert.Equal(t, "感動した試合", *impression.Value())
	})

	t.Run("空白のみの文字列は空として扱う", func(t *testing.T) {
		impression, err := usergame.NewImpression(strPtr("   "))

		require.NoError(t, err)
		assert.Nil(t, impression.Value())
		assert.True(t, impression.IsEmpty())
	})

	t.Run("191文字を超える文字列でエラーになる", func(t *testing.T) {
		longString := strings.Repeat("あ", 192)

		_, err := usergame.NewImpression(strPtr(longString))

		require.Error(t, err)
		var domainErr *domain.Error
		require.True(t, errors.As(err, &domainErr))
		assert.Equal(t, "INVALID_IMPRESSION", domainErr.Code)
		assert.Equal(t, "Impression must be 191 characters or less", domainErr.Message)
	})

	t.Run("191文字ちょうどの文字列で生成できる", func(t *testing.T) {
		maxString := strings.Repeat("あ", 191)

		impression, err := usergame.NewImpression(strPtr(maxString))

		require.NoError(t, err)
		require.NotNil(t, impression.Value())
		assert.Equal(t, maxString, *impression.Value())
	})
}

func TestImpressionEquals(t *testing.T) {
	t.Run("空同士が等価である", func(t *testing.T) {
		impression1, err := usergame.NewImpression(nil)
		require.NoError(t, err)
		impression2, err := usergame.NewImpression(strPtr(""))
		require.NoError(t, err)

		assert.True(t, impression1.Equals(impression2))
	})

	t.Run("値ありと空が非等価である", func(t *testing.T) {
		impression1, err := usergame.NewImpression(strPtr("良い試合"))
		require.NoError(t, err)
		impression2, err := usergame.NewImpression(nil)
		require.NoError(t, err)

		assert.False(t, impression1.Equals(impression2))
	})

	t.Run("トリム後の値で等価性を比較する", func(t *testing.T) {
		impression1, err := usergame.NewImpression(strPtr("  良い試合  "))
		require.NoError(t, err)
		impression2, err := usergame.NewImpression(strPtr("良い試合"))
		require.NoError(t, err)

		assert.True(t, impression1.Equals(impression2))
	})
}
