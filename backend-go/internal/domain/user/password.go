package user

import (
	"strings"

	"golang.org/x/crypto/bcrypt"

	"github.com/posiposi/dragons-counter/backend-go/internal/domain"
)

const bcryptCost = 10

// Password is a value object that holds a bcrypt-hashed password.
type Password struct {
	hash string
}

// NewPasswordFromPlainText hashes the given plain text and returns a Password.
func NewPasswordFromPlainText(plainText string) (Password, error) {
	if strings.TrimSpace(plainText) == "" {
		return Password{}, domain.NewError("INVALID_PASSWORD", "Password cannot be empty")
	}
	hash, err := bcrypt.GenerateFromPassword([]byte(plainText), bcryptCost)
	if err != nil {
		return Password{}, err
	}
	return Password{hash: string(hash)}, nil
}

// NewPasswordFromHash creates a Password from an existing bcrypt hash string.
func NewPasswordFromHash(hash string) (Password, error) {
	if strings.TrimSpace(hash) == "" {
		return Password{}, domain.NewError("INVALID_PASSWORD", "Password hash cannot be empty")
	}
	return Password{hash: hash}, nil
}

func (p Password) Compare(plainText string) bool {
	return bcrypt.CompareHashAndPassword([]byte(p.hash), []byte(plainText)) == nil
}

func (p Password) Hash() string {
	return p.hash
}
