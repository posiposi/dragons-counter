package gameadapter

import (
	"fmt"

	"github.com/posiposi/dragons-counter/backend-go/internal/db/sqlc"
	"github.com/posiposi/dragons-counter/backend-go/internal/domain/game"
)

func GameRowToDomain(row sqlc.FindGamesByDateRow) (game.Game, error) {
	gameID, err := game.ParseGameID(row.ID)
	if err != nil {
		return game.Game{}, fmt.Errorf("failed to parse game id: %w", err)
	}

	gameDate, err := game.NewGameDate(row.GameDate)
	if err != nil {
		return game.Game{}, fmt.Errorf("failed to create game date: %w", err)
	}

	opponent, err := game.NewOpponent(row.Opponent)
	if err != nil {
		return game.Game{}, fmt.Errorf("failed to create opponent: %w", err)
	}

	dragonsScore, err := game.NewScore(int(row.DragonsScore))
	if err != nil {
		return game.Game{}, fmt.Errorf("failed to create dragons score: %w", err)
	}

	opponentScore, err := game.NewScore(int(row.OpponentScore))
	if err != nil {
		return game.Game{}, fmt.Errorf("failed to create opponent score: %w", err)
	}

	stadiumID, err := game.ParseStadiumID(row.StadiumID)
	if err != nil {
		return game.Game{}, fmt.Errorf("failed to parse stadium id: %w", err)
	}

	stadiumName, err := game.NewStadiumName(row.StadiumName)
	if err != nil {
		return game.Game{}, fmt.Errorf("failed to create stadium name: %w", err)
	}

	stadium := game.NewStadium(stadiumID, stadiumName)

	g := game.NewGame(
		gameID,
		gameDate,
		opponent,
		dragonsScore,
		opponentScore,
		stadium,
		row.CreatedAt,
		row.UpdatedAt,
	)

	return g, nil
}

func GameResultToDB(result game.GameResultValue) sqlc.GamesResult {
	switch result {
	case game.Win:
		return sqlc.GamesResultWin
	case game.Lose:
		return sqlc.GamesResultLose
	case game.Draw:
		return sqlc.GamesResultDraw
	default:
		return sqlc.GamesResultDraw
	}
}

func GameResultToDomain(result sqlc.GamesResult) game.GameResultValue {
	switch result {
	case sqlc.GamesResultWin:
		return game.Win
	case sqlc.GamesResultLose:
		return game.Lose
	case sqlc.GamesResultDraw:
		return game.Draw
	default:
		return game.Draw
	}
}
