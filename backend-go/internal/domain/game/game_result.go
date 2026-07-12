package game

type GameResultValue string

const (
	Win  GameResultValue = "WIN"
	Lose GameResultValue = "LOSE"
	Draw GameResultValue = "DRAW"
)

type GameResult struct {
	value GameResultValue
}

func NewGameResultFromScores(dragonsScore, opponentScore int) GameResult {
	switch {
	case dragonsScore > opponentScore:
		return GameResult{value: Win}
	case opponentScore > dragonsScore:
		return GameResult{value: Lose}
	default:
		return GameResult{value: Draw}
	}
}

func (r GameResult) Value() GameResultValue {
	return r.value
}

func (r GameResult) IsWin() bool {
	return r.value == Win
}
