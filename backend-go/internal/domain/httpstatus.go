package domain

import (
	"net/http"
	"strings"
)

type statusMapping struct {
	code   string
	status int
}

var statusMappings = []statusMapping{
	{code: "NOT_FOUND", status: http.StatusNotFound},
	{code: "USER_NOT_FOUND", status: http.StatusNotFound},
	{code: "GAME_NOT_FOUND", status: http.StatusNotFound},
	{code: "USER_GAME_NOT_FOUND", status: http.StatusNotFound},
	{code: "ALREADY_EXISTS", status: http.StatusConflict},
	{code: "USER_ALREADY_EXISTS", status: http.StatusConflict},
	{code: "EMAIL_ALREADY_EXISTS", status: http.StatusConflict},
	{code: "UNAUTHORIZED", status: http.StatusUnauthorized},
	{code: "FORBIDDEN", status: http.StatusForbidden},
}

func ResolveHTTPStatus(code string) int {
	for _, m := range statusMappings {
		if m.code == code {
			return m.status
		}
	}
	for _, m := range statusMappings {
		if strings.HasSuffix(code, m.code) {
			return m.status
		}
	}
	return http.StatusBadRequest
}
