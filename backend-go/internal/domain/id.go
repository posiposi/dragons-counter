package domain

import (
	"strings"

	"github.com/google/uuid"
)

// ID is a generic identifier value object backed by a UUID string.
type ID struct {
	value string
}

// NewID generates a new unique ID using a UUID.
func NewID() ID {
	return ID{value: uuid.NewString()}
}

// ParseID creates an ID from a string, returning an error if the value is empty.
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
