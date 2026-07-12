package user

import (
	"regexp"
	"strings"

	"github.com/posiposi/dragons-counter/backend-go/internal/domain"
)

var emailRegex = regexp.MustCompile(`^[^\s@]+@[^\s@]+\.[^\s@]+$`)

// Email is a value object that validates and holds an email address.
type Email struct {
	value string
}

// NewEmail creates an Email after validating the format.
func NewEmail(value string) (Email, error) {
	if strings.TrimSpace(value) == "" {
		return Email{}, domain.NewError("INVALID_EMAIL", "Email cannot be empty")
	}
	if !emailRegex.MatchString(value) {
		return Email{}, domain.NewError("INVALID_EMAIL", "Invalid email format")
	}
	return Email{value: value}, nil
}

func (e Email) Value() string {
	return e.value
}

func (e Email) Equals(other Email) bool {
	return e.value == other.value
}
