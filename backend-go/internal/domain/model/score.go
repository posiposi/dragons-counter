package model

type Score struct {
	value int
}

func NewScore(value int) (Score, error) {
	if value < 0 {
		return Score{}, NewError("INVALID_SCORE", "score cannot be negative")
	}
	return Score{value: value}, nil
}

func (s Score) Value() int {
	return s.value
}

func (s Score) Equals(other Score) bool {
	return s.value == other.value
}
