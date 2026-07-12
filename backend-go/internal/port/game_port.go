package port

import (
	"context"

	"github.com/posiposi/dragons-counter/backend-go/internal/domain/game"
)

type GameQueryPort interface {
	FindAll(ctx context.Context) ([]game.Game, error)
	FindByID(ctx context.Context, id game.GameID) (*game.Game, error)
	FindByIDs(ctx context.Context, ids []game.GameID) ([]game.Game, error)
}

type FindGameByDatePort interface {
	FindByDate(ctx context.Context, gameDate game.GameDate) (*game.Game, error)
}

type GameCommandPort interface {
	Save(ctx context.Context, g game.Game) error
	Delete(ctx context.Context, id game.GameID) (bool, error)
}
