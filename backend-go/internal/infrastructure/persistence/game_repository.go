package persistence

import (
	"context"
	"database/sql"
	"fmt"
	"time"

	"github.com/posiposi/dragons-counter/backend-go/internal/db/sqlc"
	"github.com/posiposi/dragons-counter/backend-go/internal/domain/model"
)

type GameRepository struct {
	queries *sqlc.Queries
	db      *sql.DB
}

func NewGameRepository(db *sql.DB) *GameRepository {
	return &GameRepository{
		queries: sqlc.New(db),
		db:      db,
	}
}

func (r *GameRepository) FindAll(ctx context.Context) ([]model.Game, error) {
	rows, err := r.queries.FindAllGames(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to find all games: %w", err)
	}

	games := make([]model.Game, 0, len(rows))
	for _, row := range rows {
		g, err := toDomainGame(row.ID, row.GameDate, row.Opponent, row.DragonsScore, row.OpponentScore, row.Result, row.StadiumID, row.StadiumName, row.CreatedAt, row.UpdatedAt)
		if err != nil {
			return nil, fmt.Errorf("failed to convert game row: %w", err)
		}
		games = append(games, g)
	}

	return games, nil
}

func (r *GameRepository) FindByID(ctx context.Context, id model.GameID) (*model.Game, error) {
	row, err := r.queries.GetGameByIDWithStadium(ctx, id.Value())
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, fmt.Errorf("failed to find game by id: %w", err)
	}

	g, err := toDomainGame(row.ID, row.GameDate, row.Opponent, row.DragonsScore, row.OpponentScore, row.Result, row.StadiumID, row.StadiumName, row.CreatedAt, row.UpdatedAt)
	if err != nil {
		return nil, fmt.Errorf("failed to convert game row: %w", err)
	}

	return &g, nil
}

func (r *GameRepository) FindByIDs(ctx context.Context, ids []model.GameID) ([]model.Game, error) {
	if len(ids) == 0 {
		return []model.Game{}, nil
	}

	games := make([]model.Game, 0, len(ids))
	for _, id := range ids {
		row, err := r.queries.GetGameByIDWithStadium(ctx, id.Value())
		if err != nil {
			if err == sql.ErrNoRows {
				continue
			}
			return nil, fmt.Errorf("failed to find game by id %s: %w", id.Value(), err)
		}

		g, err := toDomainGame(row.ID, row.GameDate, row.Opponent, row.DragonsScore, row.OpponentScore, row.Result, row.StadiumID, row.StadiumName, row.CreatedAt, row.UpdatedAt)
		if err != nil {
			return nil, fmt.Errorf("failed to convert game row: %w", err)
		}
		games = append(games, g)
	}

	return games, nil
}

func (r *GameRepository) FindByDate(ctx context.Context, gameDate model.GameDate) (*model.Game, error) {
	rows, err := r.queries.FindGamesByDate(ctx, gameDate.Value())
	if err != nil {
		return nil, fmt.Errorf("failed to find games by date: %w", err)
	}

	if len(rows) == 0 {
		return nil, nil
	}

	g, err := toDomainGame(rows[0].ID, rows[0].GameDate, rows[0].Opponent, rows[0].DragonsScore, rows[0].OpponentScore, rows[0].Result, rows[0].StadiumID, rows[0].StadiumName, rows[0].CreatedAt, rows[0].UpdatedAt)
	if err != nil {
		return nil, fmt.Errorf("failed to convert game row: %w", err)
	}

	return &g, nil
}

func (r *GameRepository) Save(ctx context.Context, g model.Game) error {
	now := time.Now().Truncate(time.Second)
	params := sqlc.CreateGameParams{
		ID:            g.ID().Value(),
		GameDate:      g.GameDate().Value(),
		Opponent:      g.Opponent().Value(),
		DragonsScore:  int32(g.DragonsScore().Value()),
		OpponentScore: int32(g.OpponentScore().Value()),
		Result:        gameResultToDB(g.Result().Value()),
		StadiumID:     g.Stadium().ID().Value(),
		CreatedAt:     now,
		UpdatedAt:     now,
	}

	if err := r.queries.CreateGame(ctx, params); err != nil {
		return fmt.Errorf("failed to save game: %w", err)
	}

	return nil
}

func (r *GameRepository) Delete(ctx context.Context, id model.GameID) (bool, error) {
	result, err := r.queries.DeleteGame(ctx, id.Value())
	if err != nil {
		return false, fmt.Errorf("failed to delete game: %w", err)
	}

	affected, err := result.RowsAffected()
	if err != nil {
		return false, fmt.Errorf("failed to get rows affected: %w", err)
	}

	return affected > 0, nil
}

func toDomainGame(id string, gameDate time.Time, opponent string, dragonsScore, opponentScore int32, result sqlc.GamesResult, stadiumID, stadiumName string, createdAt, updatedAt time.Time) (model.Game, error) {
	gID, err := model.ParseGameID(id)
	if err != nil {
		return model.Game{}, fmt.Errorf("failed to parse game id: %w", err)
	}

	gDate, err := model.NewGameDate(gameDate)
	if err != nil {
		return model.Game{}, fmt.Errorf("failed to create game date: %w", err)
	}

	opp, err := model.NewOpponent(opponent)
	if err != nil {
		return model.Game{}, fmt.Errorf("failed to create opponent: %w", err)
	}

	dScore, err := model.NewScore(int(dragonsScore))
	if err != nil {
		return model.Game{}, fmt.Errorf("failed to create dragons score: %w", err)
	}

	oScore, err := model.NewScore(int(opponentScore))
	if err != nil {
		return model.Game{}, fmt.Errorf("failed to create opponent score: %w", err)
	}

	sID, err := model.ParseStadiumID(stadiumID)
	if err != nil {
		return model.Game{}, fmt.Errorf("failed to parse stadium id: %w", err)
	}

	sName, err := model.NewStadiumName(stadiumName)
	if err != nil {
		return model.Game{}, fmt.Errorf("failed to create stadium name: %w", err)
	}

	stadium := model.NewStadium(sID, sName)

	return model.NewGame(gID, gDate, opp, dScore, oScore, stadium, createdAt, updatedAt), nil
}

func gameResultToDB(result model.GameResultValue) sqlc.GamesResult {
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

func gameResultToDomain(result sqlc.GamesResult) model.GameResultValue {
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
