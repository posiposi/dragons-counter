package auth_test

import (
	"encoding/json"
	"os"
	"testing"

	"github.com/posiposi/dragons-counter/backend-go/internal/auth"
)

type jwtFixture struct {
	Token   string `json:"token"`
	Secret  string `json:"secret"`
	Payload struct {
		Sub   string `json:"sub"`
		Email string `json:"email"`
		Role  string `json:"role"`
	} `json:"payload"`
}

func loadFixture(t *testing.T) jwtFixture {
	t.Helper()
	data, err := os.ReadFile("../../testdata/jwt-interop.json")
	if err != nil {
		t.Fatalf("fixture ファイルの読み込みに失敗: %v", err)
	}
	var fixture jwtFixture
	if err := json.Unmarshal(data, &fixture); err != nil {
		t.Fatalf("fixture のパースに失敗: %v", err)
	}
	return fixture
}

func TestVerifyJWT_InteropWithNode(t *testing.T) {
	fixture := loadFixture(t)

	claims, err := auth.VerifyJWT(fixture.Token, fixture.Secret)
	if err != nil {
		t.Fatalf("JWT 検証に失敗: %v", err)
	}

	if claims.Sub != fixture.Payload.Sub {
		t.Errorf("sub: got %q, want %q", claims.Sub, fixture.Payload.Sub)
	}
	if claims.Email != fixture.Payload.Email {
		t.Errorf("email: got %q, want %q", claims.Email, fixture.Payload.Email)
	}
	if claims.Role != fixture.Payload.Role {
		t.Errorf("role: got %q, want %q", claims.Role, fixture.Payload.Role)
	}
}

func TestVerifyJWT_InvalidToken(t *testing.T) {
	_, err := auth.VerifyJWT("invalid.token.here", "some-secret")
	if err == nil {
		t.Error("無効なトークンでエラーが返されるべき")
	}
}

func TestVerifyJWT_WrongSecret(t *testing.T) {
	fixture := loadFixture(t)

	_, err := auth.VerifyJWT(fixture.Token, "wrong-secret")
	if err == nil {
		t.Error("異なるシークレットでエラーが返されるべき")
	}
}
