package auth_test

import (
	"testing"

	"github.com/golang-jwt/jwt/v5"
	"github.com/posiposi/dragons-counter/backend-go/internal/auth"
)

func signTestToken(t *testing.T, secret string, claims jwt.MapClaims) string {
	t.Helper()
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	signed, err := token.SignedString([]byte(secret))
	if err != nil {
		t.Fatalf("テスト用トークンの生成に失敗: %v", err)
	}
	return signed
}

func TestVerifyJWT_ValidToken(t *testing.T) {
	secret := "test-secret"
	claims := jwt.MapClaims{
		"sub":   "660e8400-e29b-41d4-a716-446655440001",
		"email": "test@example.com",
		"role":  "admin",
	}
	tokenString := signTestToken(t, secret, claims)

	result, err := auth.VerifyJWT(tokenString, secret)
	if err != nil {
		t.Fatalf("JWT 検証に失敗: %v", err)
	}

	if result.Sub != claims["sub"] {
		t.Errorf("sub: got %q, want %q", result.Sub, claims["sub"])
	}
	if result.Email != claims["email"] {
		t.Errorf("email: got %q, want %q", result.Email, claims["email"])
	}
	if result.Role != claims["role"] {
		t.Errorf("role: got %q, want %q", result.Role, claims["role"])
	}
}

func TestVerifyJWT_InvalidToken(t *testing.T) {
	_, err := auth.VerifyJWT("invalid.token.here", "some-secret")
	if err == nil {
		t.Error("無効なトークンでエラーが返されるべき")
	}
}

func TestVerifyJWT_WrongSecret(t *testing.T) {
	tokenString := signTestToken(t, "correct-secret", jwt.MapClaims{
		"sub":   "user-id",
		"email": "test@example.com",
		"role":  "user",
	})

	_, err := auth.VerifyJWT(tokenString, "wrong-secret")
	if err == nil {
		t.Error("異なるシークレットでエラーが返されるべき")
	}
}
