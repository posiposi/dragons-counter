package game

import (
	"time"

	"github.com/posiposi/dragons-counter/backend-go/internal/domain"
)

type GameDate struct {
	value time.Time
}

// 未来日を拒否する。
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
