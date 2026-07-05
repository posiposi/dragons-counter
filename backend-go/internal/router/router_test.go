package router

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestNewRouterHealth(t *testing.T) {
	t.Run("GET /health は200でContent-Type: application/jsonかつ{\"status\":\"ok\"}を返す", func(t *testing.T) {
		r := NewRouter()
		req := httptest.NewRequest(http.MethodGet, "/health", nil)
		rec := httptest.NewRecorder()

		r.ServeHTTP(rec, req)

		require.Equal(t, http.StatusOK, rec.Code)
		assert.Contains(t, rec.Header().Get("Content-Type"), "application/json")
		assert.JSONEq(t, `{"status":"ok"}`, rec.Body.String())
	})
}

func TestNewRouterAPI(t *testing.T) {
	t.Run("GET /api は200で\"Hello World!\"を返す", func(t *testing.T) {
		r := NewRouter()
		req := httptest.NewRequest(http.MethodGet, "/api", nil)
		rec := httptest.NewRecorder()

		r.ServeHTTP(rec, req)

		require.Equal(t, http.StatusOK, rec.Code)
		assert.Equal(t, "Hello World!", rec.Body.String())
	})
}

func TestNewRouterNotFound(t *testing.T) {
	t.Run("GET /nonexistent は404を返す", func(t *testing.T) {
		r := NewRouter()
		req := httptest.NewRequest(http.MethodGet, "/nonexistent", nil)
		rec := httptest.NewRecorder()

		r.ServeHTTP(rec, req)

		assert.Equal(t, http.StatusNotFound, rec.Code)
	})
}
