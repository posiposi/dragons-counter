package game

import (
	"strings"

	"github.com/posiposi/dragons-counter/backend-go/internal/domain"
)

// StadiumName is a value object for a stadium's display name.
type StadiumName struct {
	value string
}

// NewStadiumName creates a StadiumName, returning an error if the value is empty.
func NewStadiumName(value string) (StadiumName, error) {
	trimmed := strings.TrimSpace(value)
	if trimmed == "" {
		return StadiumName{}, domain.NewError("INVALID_STADIUM_NAME", "Stadium name cannot be empty")
	}
	return StadiumName{value: trimmed}, nil
}

func (n StadiumName) Value() string {
	return n.value
}

func (n StadiumName) Equals(other StadiumName) bool {
	return n.value == other.value
}

// Stadium is an entity representing a baseball stadium with an ID and name.
type Stadium struct {
	id   StadiumID
	name StadiumName
}

// NewStadium creates a Stadium from the given ID and name.
func NewStadium(id StadiumID, name StadiumName) Stadium {
	return Stadium{id: id, name: name}
}

func (s Stadium) ID() StadiumID {
	return s.id
}

func (s Stadium) Name() StadiumName {
	return s.name
}

func (s Stadium) Equals(other Stadium) bool {
	return s.id.Equals(other.id)
}
