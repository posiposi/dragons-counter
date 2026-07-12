package game

// GameResultValue represents the outcome of a game as a string constant.
type GameResultValue string

const (
	// Win indicates the Dragons won the game.
	Win GameResultValue = "WIN"
	// Lose indicates the Dragons lost the game.
	Lose GameResultValue = "LOSE"
	// Draw indicates the game ended in a draw.
	Draw GameResultValue = "DRAW"
)

// GameResult is a value object that holds the derived result of a game.
type GameResult struct {
	value GameResultValue
}

// NewGameResultFromScores determines the game result by comparing the two scores.
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
