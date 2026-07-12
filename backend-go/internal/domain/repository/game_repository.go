package repository

import (
	"context"
	"time"

	"github.com/posiposi/dragons-counter/backend-go/internal/domain/game"
)

type BulkCreateGameInput struct {
	GameDate      time.Time
	Opponent      string
	DragonsScore  int
	OpponentScore int
	StadiumName   string
}

type BulkCreateGameResult struct {
	SavedCount   int
	SkippedCount int
	Errors       []string
}

type BulkCreateGamePort interface {
	BulkSave(ctx context.Context, inputs []BulkCreateGameInput) BulkCreateGameResult
}

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
