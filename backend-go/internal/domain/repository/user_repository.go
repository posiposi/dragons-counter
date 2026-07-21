package repository

import (
	"context"

	"github.com/posiposi/dragons-counter/backend-go/internal/domain/model"
)

type UserQueryPort interface {
	FindByEmail(ctx context.Context, email model.Email) (*model.User, error)
	FindByID(ctx context.Context, id model.UserID) (*model.User, error)
	FindAll(ctx context.Context) ([]model.User, error)
}

type UserCommandPort interface {
	Save(ctx context.Context, user model.User) error
	UpdateRegistrationStatus(ctx context.Context, user model.User) error
}
