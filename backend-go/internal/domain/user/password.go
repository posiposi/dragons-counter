package user

import (
	"strings"

	"golang.org/x/crypto/bcrypt"

	"github.com/posiposi/dragons-counter/backend-go/internal/domain"
)

const bcryptCost = 10

type Password struct {
	hash string
}

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
