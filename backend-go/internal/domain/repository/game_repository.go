package repository

import (
	"context"

	"github.com/posiposi/dragons-counter/backend-go/internal/domain/model"
)

type GameQueryPort interface {
	FindAll(ctx context.Context) ([]model.Game, error)
	FindByID(ctx context.Context, id model.GameID) (*model.Game, error)
	FindByIDs(ctx context.Context, ids []model.GameID) ([]model.Game, error)
}

type GameCommandPort interface {
	Save(ctx context.Context, g model.Game) error
	Delete(ctx context.Context, id model.GameID) (bool, error)
}
