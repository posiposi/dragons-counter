package repository

import (
	"context"
	"time"

	"github.com/posiposi/dragons-counter/backend-go/internal/domain/model"
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
	FindAll(ctx context.Context) ([]model.Game, error)
	FindByID(ctx context.Context, id model.GameID) (*model.Game, error)
	FindByIDs(ctx context.Context, ids []model.GameID) ([]model.Game, error)
}

type FindGameByDatePort interface {
	FindByDate(ctx context.Context, gameDate model.GameDate) (*model.Game, error)
}

type GameCommandPort interface {
	Save(ctx context.Context, g model.Game) error
	Delete(ctx context.Context, id model.GameID) (bool, error)
}
