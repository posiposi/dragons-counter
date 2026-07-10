package usergame

import (
	"github.com/posiposi/dragons-counter/backend-go/internal/domain"
)

type UserGameID struct {
	domain.ID
}

func NewUserGameID() UserGameID {
	return UserGameID{ID: domain.NewID()}
}

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
