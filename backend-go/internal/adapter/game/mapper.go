package gameadapter

import (
	"fmt"
	"time"

	"github.com/posiposi/dragons-counter/backend-go/internal/db/sqlc"
	"github.com/posiposi/dragons-counter/backend-go/internal/domain/game"
)

type gameRow struct {
	ID            string
	GameDate      time.Time
	Opponent      string
	DragonsScore  int32
	OpponentScore int32
	Result        sqlc.GamesResult
	StadiumID     string
	CreatedAt     time.Time
	UpdatedAt     time.Time
	StadiumName   string
}

func findGamesByDateRowToGameRow(row sqlc.FindGamesByDateRow) gameRow {
	return gameRow{
		ID: row.ID, GameDate: row.GameDate, Opponent: row.Opponent,
		DragonsScore: row.DragonsScore, OpponentScore: row.OpponentScore,
		Result: row.Result, StadiumID: row.StadiumID,
		CreatedAt: row.CreatedAt, UpdatedAt: row.UpdatedAt, StadiumName: row.StadiumName,
	}
}

func findAllGamesRowToGameRow(row sqlc.FindAllGamesRow) gameRow {
	return gameRow{
		ID: row.ID, GameDate: row.GameDate, Opponent: row.Opponent,
		DragonsScore: row.DragonsScore, OpponentScore: row.OpponentScore,
		Result: row.Result, StadiumID: row.StadiumID,
		CreatedAt: row.CreatedAt, UpdatedAt: row.UpdatedAt, StadiumName: row.StadiumName,
	}
}

func getGameByIDWithStadiumRowToGameRow(row sqlc.GetGameByIDWithStadiumRow) gameRow {
	return gameRow{
		ID: row.ID, GameDate: row.GameDate, Opponent: row.Opponent,
		DragonsScore: row.DragonsScore, OpponentScore: row.OpponentScore,
		Result: row.Result, StadiumID: row.StadiumID,
		CreatedAt: row.CreatedAt, UpdatedAt: row.UpdatedAt, StadiumName: row.StadiumName,
	}
}

func gameRowToDomain(row gameRow) (game.Game, error) {
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
		gameID, gameDate, opponent, dragonsScore, opponentScore,
		stadium, row.CreatedAt, row.UpdatedAt,
	)

	return g, nil
}

func GameRowToDomain(row sqlc.FindGamesByDateRow) (game.Game, error) {
	return gameRowToDomain(findGamesByDateRowToGameRow(row))
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
