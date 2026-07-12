package model

import (
	"strings"
)

type StadiumName struct {
	value string
}

func NewStadiumName(value string) (StadiumName, error) {
	trimmed := strings.TrimSpace(value)
	if trimmed == "" {
		return StadiumName{}, NewError("INVALID_STADIUM_NAME", "Stadium name cannot be empty")
	}
	return StadiumName{value: trimmed}, nil
}

func (n StadiumName) Value() string {
	return n.value
}

func (n StadiumName) Equals(other StadiumName) bool {
	return n.value == other.value
}

type Stadium struct {
	id   StadiumID
	name StadiumName
}

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
