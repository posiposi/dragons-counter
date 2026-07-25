package seeder

import (
	"context"
	"database/sql"
	"fmt"
	"time"

	"github.com/google/uuid"

	"github.com/posiposi/dragons-counter/backend-go/internal/db"
	"github.com/posiposi/dragons-counter/backend-go/internal/db/sqlc"
	"github.com/posiposi/dragons-counter/backend-go/internal/domain/model"
)

func SeedAdminUser(ctx context.Context, pool *sql.DB, adminEmail, adminPassword string) error {
	if adminEmail == "" || adminPassword == "" {
		return nil
	}

	queries := sqlc.New(pool)
	_, err := queries.GetUserByEmail(ctx, adminEmail)
	if err == nil {
		return nil
	}
	if err != sql.ErrNoRows {
		return fmt.Errorf("failed to check existing admin user: %w", err)
	}

	pw, err := model.NewPasswordFromPlainText(adminPassword)
	if err != nil {
		return fmt.Errorf("failed to hash admin password: %w", err)
	}

	now := time.Now()
	userID := uuid.New().String()
	reqID := uuid.New().String()

	return db.WithTx(ctx, pool, func(tx *sql.Tx) error {
		txQueries := sqlc.New(tx)

		err := txQueries.CreateUser(ctx, sqlc.CreateUserParams{
			ID:        userID,
			Email:     adminEmail,
			Password:  pw.Hash(),
			Role:      sqlc.UsersRoleAdmin,
			CreatedAt: now,
			UpdatedAt: now,
		})
		if err != nil {
			return fmt.Errorf("failed to create admin user: %w", err)
		}

		err = txQueries.CreateRegistrationRequest(ctx, sqlc.CreateRegistrationRequestParams{
			ID:                 reqID,
			UserID:             userID,
			Status:             sqlc.UserRegistrationRequestsStatusApproved,
			Reasonforrejection: sql.NullString{Valid: false},
			CreatedAt:          now,
			UpdatedAt:          now,
		})
		if err != nil {
			return fmt.Errorf("failed to create registration request: %w", err)
		}

		return nil
	})
}
