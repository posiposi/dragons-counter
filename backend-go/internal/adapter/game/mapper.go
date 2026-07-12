package gameadapter

import (
	"fmt"

	"github.com/posiposi/dragons-counter/backend-go/internal/db/sqlc"
	"github.com/posiposi/dragons-counter/backend-go/internal/domain/model"
)

func GameRowToDomain(row sqlc.FindGamesByDateRow) (model.Game, error) {
	gameID, err := model.ParseGameID(row.ID)
	if err != nil {
		return model.Game{}, fmt.Errorf("failed to parse game id: %w", err)
	}

	gameDate, err := model.NewGameDate(row.GameDate)
	if err != nil {
		return model.Game{}, fmt.Errorf("failed to create game date: %w", err)
	}

	opponent, err := model.NewOpponent(row.Opponent)
	if err != nil {
		return model.Game{}, fmt.Errorf("failed to create opponent: %w", err)
	}

	dragonsScore, err := model.NewScore(int(row.DragonsScore))
	if err != nil {
		return model.Game{}, fmt.Errorf("failed to create dragons score: %w", err)
	}

	opponentScore, err := model.NewScore(int(row.OpponentScore))
	if err != nil {
		return model.Game{}, fmt.Errorf("failed to create opponent score: %w", err)
	}

	stadiumID, err := model.ParseStadiumID(row.StadiumID)
	if err != nil {
		return model.Game{}, fmt.Errorf("failed to parse stadium id: %w", err)
	}

	stadiumName, err := model.NewStadiumName(row.StadiumName)
	if err != nil {
		return model.Game{}, fmt.Errorf("failed to create stadium name: %w", err)
	}

	stadium := model.NewStadium(stadiumID, stadiumName)

	g := model.NewGame(
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

func GameResultToDB(result model.GameResultValue) sqlc.GamesResult {
	switch result {
	case model.Win:
		return sqlc.GamesResultWin
	case model.Lose:
		return sqlc.GamesResultLose
	case model.Draw:
		return sqlc.GamesResultDraw
	default:
		return sqlc.GamesResultDraw
	}
}

func GameResultToDomain(result sqlc.GamesResult) model.GameResultValue {
	switch result {
	case sqlc.GamesResultWin:
		return model.Win
	case sqlc.GamesResultLose:
		return model.Lose
	case sqlc.GamesResultDraw:
		return model.Draw
	default:
		return model.Draw
	}
}
