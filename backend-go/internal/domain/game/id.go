package game

import (
	"github.com/posiposi/dragons-counter/backend-go/internal/domain"
)

// GameID is a typed identifier for Game entities.
type GameID struct {
	domain.ID
}

// NewGameID generates a new unique GameID.
func NewGameID() GameID {
	return GameID{ID: domain.NewID()}
}

// ParseGameID creates a GameID from a string value.
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

// StadiumID is a typed identifier for Stadium entities.
type StadiumID struct {
	domain.ID
}

// NewStadiumID generates a new unique StadiumID.
func NewStadiumID() StadiumID {
	return StadiumID{ID: domain.NewID()}
}

// ParseStadiumID creates a StadiumID from a string value.
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
