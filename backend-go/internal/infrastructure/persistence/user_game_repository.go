package persistence

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"time"

	"github.com/go-sql-driver/mysql"

	"github.com/posiposi/dragons-counter/backend-go/internal/db/sqlc"
	"github.com/posiposi/dragons-counter/backend-go/internal/domain/model"
)

type UserGameRepository struct {
	queries *sqlc.Queries
	db      *sql.DB
}

func NewUserGameRepository(db *sql.DB) *UserGameRepository {
	return &UserGameRepository{
		queries: sqlc.New(db),
		db:      db,
	}
}

func (r *UserGameRepository) FindByUserID(ctx context.Context, userID model.ID) ([]model.UserGame, error) {
	rows, err := r.queries.ListUserGamesByUserID(ctx, userID.Value())
	if err != nil {
		return nil, fmt.Errorf("failed to find user games by user id: %w", err)
	}

	userGames := make([]model.UserGame, 0, len(rows))
	for _, row := range rows {
		ug, err := toDomainUserGame(row)
		if err != nil {
			return nil, fmt.Errorf("failed to convert user game row: %w", err)
		}
		userGames = append(userGames, ug)
	}

	return userGames, nil
}

func (r *UserGameRepository) FindByUserIDAndGameID(ctx context.Context, userID, gameID model.ID) (*model.UserGame, error) {
	row, err := r.queries.GetUserGameByUserIDAndGameID(ctx, sqlc.GetUserGameByUserIDAndGameIDParams{
		UserID: userID.Value(),
		GameID: gameID.Value(),
	})
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, fmt.Errorf("failed to find user game: %w", err)
	}

	ug, err := toDomainUserGame(row)
	if err != nil {
		return nil, fmt.Errorf("failed to convert user game row: %w", err)
	}

	return &ug, nil
}

func (r *UserGameRepository) Save(ctx context.Context, userGame model.UserGame) error {
	now := time.Now().Truncate(time.Second)

	existing, err := r.queries.GetUserGameByUserIDAndGameIDWithDeleted(ctx, sqlc.GetUserGameByUserIDAndGameIDWithDeletedParams{
		UserID: userGame.UserID().Value(),
		GameID: userGame.GameID().Value(),
	})
	if err != nil && err != sql.ErrNoRows {
		return fmt.Errorf("failed to check existing user game: %w", err)
	}

	if err != sql.ErrNoRows {
		if !existing.DeletedAt.Valid && existing.ID != userGame.ID().Value() {
			return model.NewError("USER_GAME_ALREADY_EXISTS", "この試合は既に観戦登録されています")
		}

		if existing.DeletedAt.Valid {
			return r.queries.RestoreUserGame(ctx, sqlc.RestoreUserGameParams{
				Impression: toSQLNullString(userGame.Impression()),
				UpdatedAt:  now,
				UserID:     userGame.UserID().Value(),
				GameID:     userGame.GameID().Value(),
			})
		}

		if existing.ID == userGame.ID().Value() {
			return r.queries.RestoreUserGame(ctx, sqlc.RestoreUserGameParams{
				Impression: toSQLNullString(userGame.Impression()),
				UpdatedAt:  now,
				UserID:     userGame.UserID().Value(),
				GameID:     userGame.GameID().Value(),
			})
		}
	}

	err = r.queries.CreateUserGame(ctx, sqlc.CreateUserGameParams{
		ID:         userGame.ID().Value(),
		UserID:     userGame.UserID().Value(),
		GameID:     userGame.GameID().Value(),
		Impression: toSQLNullString(userGame.Impression()),
		CreatedAt:  now,
		UpdatedAt:  now,
	})
	if err != nil {
		var mysqlErr *mysql.MySQLError
		if errors.As(err, &mysqlErr) && mysqlErr.Number == 1062 {
			return model.NewError("USER_GAME_ALREADY_EXISTS", "この試合は既に観戦登録されています")
		}
		return fmt.Errorf("failed to save user game: %w", err)
	}

	return nil
}

func (r *UserGameRepository) SoftDelete(ctx context.Context, userID, gameID model.ID) error {
	found, err := r.FindByUserIDAndGameID(ctx, userID, gameID)
	if err != nil {
		return err
	}
	if found == nil {
		return nil
	}

	now := time.Now().Truncate(time.Second)
	return r.queries.SoftDeleteUserGame(ctx, sqlc.SoftDeleteUserGameParams{
		DeletedAt: sql.NullTime{Time: now, Valid: true},
		UpdatedAt: now,
		ID:        found.ID().Value(),
	})
}

func toDomainUserGame(row sqlc.UsersGame) (model.UserGame, error) {
	ugID, err := model.ParseUserGameID(row.ID)
	if err != nil {
		return model.UserGame{}, fmt.Errorf("failed to parse user game id: %w", err)
	}

	uid, err := model.ParseID(row.UserID)
	if err != nil {
		return model.UserGame{}, fmt.Errorf("failed to parse user id: %w", err)
	}

	gid, err := model.ParseID(row.GameID)
	if err != nil {
		return model.UserGame{}, fmt.Errorf("failed to parse game id: %w", err)
	}

	var impressionPtr *string
	if row.Impression.Valid {
		impressionPtr = &row.Impression.String
	}
	impression, err := model.NewImpression(impressionPtr)
	if err != nil {
		return model.UserGame{}, fmt.Errorf("failed to create impression: %w", err)
	}

	return model.UserGameFromRepository(ugID, uid, gid, impression, row.CreatedAt, row.UpdatedAt), nil
}

func toSQLNullString(imp model.Impression) sql.NullString {
	v := imp.Value()
	if v == nil {
		return sql.NullString{}
	}
	return sql.NullString{String: *v, Valid: true}
}
