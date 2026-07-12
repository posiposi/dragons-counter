package user

import (
	"github.com/posiposi/dragons-counter/backend-go/internal/domain"
)

// UserID is a typed identifier for User entities.
type UserID struct {
	domain.ID
}

// NewUserID generates a new unique UserID.
func NewUserID() UserID {
	return UserID{ID: domain.NewID()}
}

// ParseUserID creates a UserID from a string value.
func ParseUserID(value string) (UserID, error) {
	id, err := domain.ParseID(value)
	if err != nil {
		return UserID{}, err
	}
	return UserID{ID: id}, nil
}
