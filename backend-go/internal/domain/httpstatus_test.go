package domain_test

import (
	"net/http"
	"testing"

	"github.com/posiposi/dragons-counter/backend-go/internal/domain"
)

func TestResolveHTTPStatus(t *testing.T) {
	tests := []struct {
		name string
		code string
		want int
	}{
		{
			name: "完全一致するUSER_ALREADY_EXISTSは409を返す",
			code: "USER_ALREADY_EXISTS",
			want: http.StatusConflict,
		},
		{
			name: "完全一致するGAME_NOT_FOUNDは404を返す",
			code: "GAME_NOT_FOUND",
			want: http.StatusNotFound,
		},
		{
			name: "完全一致するUNAUTHORIZEDは401を返す",
			code: "UNAUTHORIZED",
			want: http.StatusUnauthorized,
		},
		{
			name: "完全一致するFORBIDDENは403を返す",
			code: "FORBIDDEN",
			want: http.StatusForbidden,
		},
		{
			name: "未定義コードでもNOT_FOUNDで終わる場合は404を返す",
			code: "CUSTOM_NOT_FOUND",
			want: http.StatusNotFound,
		},
		{
			name: "未定義コードでもALREADY_EXISTSで終わる場合は409を返す",
			code: "SOMETHING_ALREADY_EXISTS",
			want: http.StatusConflict,
		},
		{
			name: "どのマッピングにも一致しないコードは400を返す",
			code: "UNKNOWN_ERROR",
			want: http.StatusBadRequest,
		},
		{
			name: "不正な状態遷移コードは400を返す",
			code: "INVALID_STATUS_TRANSITION",
			want: http.StatusBadRequest,
		},
		{
			name: "空文字は400を返す",
			code: "",
			want: http.StatusBadRequest,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := domain.ResolveHTTPStatus(tt.code)
			if got != tt.want {
				t.Errorf("ResolveHTTPStatus(%q) = %v, want %v", tt.code, got, tt.want)
			}
		})
	}
}
