package logger

import (
	"bytes"
	"encoding/json"
	"log/slog"
	"testing"

	"github.com/posiposi/dragons-counter/backend-go/internal/config"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestNew(t *testing.T) {
	t.Run("production環境ではJSONハンドラのロガーを返し構造化ログを出力する", func(t *testing.T) {
		var buf bytes.Buffer
		l := New(config.Config{Env: "production"}, &buf)

		_, ok := l.Handler().(*slog.JSONHandler)
		assert.True(t, ok, "productionではJSONHandlerを使う")

		l.Info("server starting", "addr", ":3000")

		var record map[string]any
		require.NoError(t, json.Unmarshal(buf.Bytes(), &record))
		assert.Equal(t, "server starting", record["msg"])
		assert.Equal(t, ":3000", record["addr"])
	})

	t.Run("development環境ではTextハンドラのロガーを返す", func(t *testing.T) {
		var buf bytes.Buffer
		l := New(config.Config{Env: "development"}, &buf)

		_, ok := l.Handler().(*slog.TextHandler)
		assert.True(t, ok, "developmentではTextHandlerを使う")

		l.Info("server starting", "addr", ":3443")

		out := buf.String()
		assert.Contains(t, out, "msg=\"server starting\"")
		assert.Contains(t, out, "addr=:3443")
	})
}
