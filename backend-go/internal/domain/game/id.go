package game

import (
	"github.com/posiposi/dragons-counter/backend-go/internal/domain"
)

type GameID struct {
	domain.ID
}

func NewGameID() GameID {
	return GameID{ID: domain.NewID()}
}

func ParseGameID(value string) (GameID, error) {
	id, err := domain.ParseID(value)
	if err != nil {
		return GameID{}, err
	}
	return GameID{ID: id}, nil
}

func (g GameID) Equals(other GameID) bool {
	return g.ID.Equals(other.ID)
}

type StadiumID struct {
	domain.ID
}

func NewStadiumID() StadiumID {
	return StadiumID{ID: domain.NewID()}
}

func ParseStadiumID(value string) (StadiumID, error) {
	id, err := domain.ParseID(value)
	if err != nil {
		return StadiumID{}, err
	}
	return StadiumID{ID: id}, nil
}

func (s StadiumID) Equals(other StadiumID) bool {
	return s.ID.Equals(other.ID)
}
