package game

import "github.com/posiposi/dragons-counter/backend-go/internal/domain"

// Score is a value object representing a non-negative game score.
type Score struct {
	value int
}

// NewScore creates a Score, returning an error if the value is negative.
func NewScore(value int) (Score, error) {
	if value < 0 {
		return Score{}, domain.NewError("INVALID_SCORE", "score cannot be negative")
	}
	return Score{value: value}, nil
}

func (s Score) Value() int {
	return s.value
}

func (s Score) Equals(other Score) bool {
	return s.value == other.value
}
