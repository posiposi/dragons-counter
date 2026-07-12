package gameadapter

import (
	"context"
	"database/sql"
	"fmt"
	"time"

	"github.com/posiposi/dragons-counter/backend-go/internal/db/sqlc"
	"github.com/posiposi/dragons-counter/backend-go/internal/domain/game"
)

// GameRepository はGameQueryPortおよびGameCommandPortの実装であり、sqlcを用いてデータベースアクセスを行う。
type GameRepository struct {
	queries *sqlc.Queries
	db      *sql.DB
}

// NewGameRepository はGameRepositoryの新しいインスタンスを生成する。
func NewGameRepository(db *sql.DB) *GameRepository {
	return &GameRepository{
		queries: sqlc.New(db),
		db:      db,
	}
}

func (r *GameRepository) FindAll(ctx context.Context) ([]game.Game, error) {
	rows, err := r.queries.FindAllGames(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to find all games: %w", err)
	}

	games := make([]game.Game, 0, len(rows))
	for _, row := range rows {
		g, err := gameRowToDomain(findAllGamesRowToGameRow(row))
		if err != nil {
			return nil, fmt.Errorf("failed to convert game row: %w", err)
		}
		games = append(games, g)
	}

	return games, nil
}

func (r *GameRepository) FindByID(ctx context.Context, id game.GameID) (*game.Game, error) {
	row, err := r.queries.GetGameByIDWithStadium(ctx, id.Value())
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, fmt.Errorf("failed to find game by id: %w", err)
	}

	g, err := gameRowToDomain(getGameByIDWithStadiumRowToGameRow(row))
	if err != nil {
		return nil, fmt.Errorf("failed to convert game row: %w", err)
	}

	return &g, nil
}

func (r *GameRepository) FindByIDs(ctx context.Context, ids []game.GameID) ([]game.Game, error) {
	if len(ids) == 0 {
		return []game.Game{}, nil
	}

	games := make([]game.Game, 0, len(ids))
	for _, id := range ids {
		row, err := r.queries.GetGameByIDWithStadium(ctx, id.Value())
		if err != nil {
			if err == sql.ErrNoRows {
				continue
			}
			return nil, fmt.Errorf("failed to find game by id %s: %w", id.Value(), err)
		}

		g, err := gameRowToDomain(getGameByIDWithStadiumRowToGameRow(row))
		if err != nil {
			return nil, fmt.Errorf("failed to convert game row: %w", err)
		}
		games = append(games, g)
	}

	return games, nil
}

func (r *GameRepository) Save(ctx context.Context, g game.Game) error {
	now := time.Now().Truncate(time.Second)
	params := sqlc.CreateGameParams{
		ID:            g.ID().Value(),
		GameDate:      g.GameDate().Value(),
		Opponent:      g.Opponent().Value(),
		DragonsScore:  int32(g.DragonsScore().Value()),
		OpponentScore: int32(g.OpponentScore().Value()),
		Result:        GameResultToDB(g.Result().Value()),
		StadiumID:     g.Stadium().ID().Value(),
		CreatedAt:     now,
		UpdatedAt:     now,
	}

	if err := r.queries.CreateGame(ctx, params); err != nil {
		return fmt.Errorf("failed to save game: %w", err)
	}

	return nil
}

func (r *GameRepository) Delete(ctx context.Context, id game.GameID) (bool, error) {
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
