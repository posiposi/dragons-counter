package game

import (
	"time"

	"github.com/posiposi/dragons-counter/backend-go/internal/domain"
)

// GameDate is a value object representing the date a game was played.
type GameDate struct {
	value time.Time
}

// NewGameDate creates a GameDate, returning an error if the date is in the future.
func NewGameDate(value time.Time) (GameDate, error) {
	if value.After(time.Now()) {
		return GameDate{}, domain.NewError("INVALID_GAME_DATE", "Game date cannot be in the future")
	}
	return GameDate{value: value}, nil
}

func (g GameDate) Value() time.Time {
	return g.value
}

func (g GameDate) Format() string {
	return g.value.Format("2006-01-02")
}
