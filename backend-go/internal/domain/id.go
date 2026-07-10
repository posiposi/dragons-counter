package domain

import (
	"strings"

	"github.com/google/uuid"
)

type ID struct {
	value string
}

func NewID() ID {
	return ID{value: uuid.NewString()}
}

func ParseID(value string) (ID, error) {
	trimmed := strings.TrimSpace(value)
	if trimmed == "" {
		return ID{}, NewError("INVALID_ID", "id must not be empty")
	}
	return ID{value: trimmed}, nil
}

func (i ID) Value() string {
	return i.value
}

func (i ID) String() string {
	return i.value
}

func (i ID) Equals(other ID) bool {
	return i.value == other.value
}
