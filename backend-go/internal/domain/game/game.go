package game

import "time"

// Game is the aggregate root representing a single baseball game record.
type Game struct {
	id            GameID
	gameDate      GameDate
	opponent      Opponent
	dragonsScore  Score
	opponentScore Score
	result        GameResult
	stadium       Stadium
	createdAt     time.Time
	updatedAt     time.Time
}

// NewGame creates a Game instance and derives the result from the given scores.
func NewGame(
	id GameID,
	gameDate GameDate,
	opponent Opponent,
	dragonsScore Score,
	opponentScore Score,
	stadium Stadium,
	createdAt time.Time,
	updatedAt time.Time,
) Game {
	return Game{
		id:            id,
		gameDate:      gameDate,
		opponent:      opponent,
		dragonsScore:  dragonsScore,
		opponentScore: opponentScore,
		result:        NewGameResultFromScores(dragonsScore.Value(), opponentScore.Value()),
		stadium:       stadium,
		createdAt:     createdAt,
		updatedAt:     updatedAt,
	}
}

func (g Game) ID() GameID {
	return g.id
}

func (g Game) GameDate() GameDate {
	return g.gameDate
}

func (g Game) Opponent() Opponent {
	return g.opponent
}

func (g Game) DragonsScore() Score {
	return g.dragonsScore
}

func (g Game) OpponentScore() Score {
	return g.opponentScore
}

func (g Game) Result() GameResult {
	return g.result
}

func (g Game) Stadium() Stadium {
	return g.stadium
}

func (g Game) CreatedAt() time.Time {
	return g.createdAt
}

func (g Game) UpdatedAt() time.Time {
	return g.updatedAt
}

func (g Game) IsVictory() bool {
	return g.result.IsWin()
}
