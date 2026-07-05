package logger

import (
	"io"
	"log/slog"

	"github.com/posiposi/dragons-counter/backend-go/internal/config"
)

// New は実行環境に応じた構造化ロガーを生成する。
// production ではJSON、development では可読性の高いText形式で出力する。
func New(cfg config.Config, w io.Writer) *slog.Logger {
	if cfg.Env == "production" {
		return slog.New(slog.NewJSONHandler(w, nil))
	}
	return slog.New(slog.NewTextHandler(w, nil))
}
