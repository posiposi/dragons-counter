package usergame

import (
	"github.com/posiposi/dragons-counter/backend-go/internal/domain"
)

// UserGameID is a typed identifier for UserGame entities.
type UserGameID struct {
	domain.ID
}

// NewUserGameID generates a new unique UserGameID.
func NewUserGameID() UserGameID {
	return UserGameID{ID: domain.NewID()}
}

// ParseUserGameID creates a UserGameID from a string value.
func ParseUserGameID(value string) (UserGameID, error) {
	id, err := domain.ParseID(value)
	if err != nil {
		return UserGameID{}, err
	}
	return UserGameID{ID: id}, nil
}

func (i UserGameID) Equals(other UserGameID) bool {
	return i.ID.Equals(other.ID)
}
