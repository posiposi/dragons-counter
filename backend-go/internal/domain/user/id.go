package user

import (
	"github.com/posiposi/dragons-counter/backend-go/internal/domain"
)

type UserID struct {
	domain.ID
}

func NewUserID() UserID {
	return UserID{ID: domain.NewID()}
}

func ParseUserID(value string) (UserID, error) {
	id, err := domain.ParseID(value)
	if err != nil {
		return UserID{}, err
	}
	return UserID{ID: id}, nil
}
