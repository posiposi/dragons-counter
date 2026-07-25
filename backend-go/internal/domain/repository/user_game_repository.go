package repository

import (
	"context"

	"github.com/posiposi/dragons-counter/backend-go/internal/domain/model"
)

type UserGameQueryPort interface {
	FindByUserID(ctx context.Context, userID model.ID) ([]model.UserGame, error)
	FindByUserIDAndGameID(ctx context.Context, userID, gameID model.ID) (*model.UserGame, error)
}

type UserGameCommandPort interface {
	Save(ctx context.Context, userGame model.UserGame) error
	SoftDelete(ctx context.Context, userID, gameID model.ID) error
}
