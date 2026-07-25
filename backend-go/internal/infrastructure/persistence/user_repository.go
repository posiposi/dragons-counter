package persistence

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/go-sql-driver/mysql"
	"github.com/posiposi/dragons-counter/backend-go/internal/db"
	"github.com/posiposi/dragons-counter/backend-go/internal/db/sqlc"
	"github.com/posiposi/dragons-counter/backend-go/internal/domain/model"
)

type UserRepository struct {
	queries *sqlc.Queries
	db      *sql.DB
}

func NewUserRepository(database *sql.DB) *UserRepository {
	return &UserRepository{
		queries: sqlc.New(database),
		db:      database,
	}
}

func (r *UserRepository) FindByEmail(ctx context.Context, email model.Email) (*model.User, error) {
	row, err := r.queries.GetUserByEmail(ctx, email.Value())
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, fmt.Errorf("failed to find user by email: %w", err)
	}

	regRow, err := r.queries.GetLatestRegistrationByUserID(ctx, row.ID)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("registration request not found for user %s", row.ID)
		}
		return nil, fmt.Errorf("failed to get registration status: %w", err)
	}

	u, err := toDomainUser(userRow{
		ID:                 row.ID,
		Email:              row.Email,
		Password:           row.Password,
		Role:               row.Role,
		RegistrationStatus: regRow.Status,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to convert user row: %w", err)
	}

	return &u, nil
}

func (r *UserRepository) FindByID(ctx context.Context, id model.UserID) (*model.User, error) {
	row, err := r.queries.GetUserByID(ctx, id.Value())
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, fmt.Errorf("failed to find user by id: %w", err)
	}

	regRow, err := r.queries.GetLatestRegistrationByUserID(ctx, row.ID)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("registration request not found for user %s", row.ID)
		}
		return nil, fmt.Errorf("failed to get registration status: %w", err)
	}

	u, err := toDomainUser(userRow{
		ID:                 row.ID,
		Email:              row.Email,
		Password:           row.Password,
		Role:               row.Role,
		RegistrationStatus: regRow.Status,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to convert user row: %w", err)
	}

	return &u, nil
}

func (r *UserRepository) FindAll(ctx context.Context) ([]model.User, error) {
	rows, err := r.queries.ListUsers(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to list users: %w", err)
	}

	users := make([]model.User, 0, len(rows))
	for _, row := range rows {
		regRow, err := r.queries.GetLatestRegistrationByUserID(ctx, row.ID)
		if err != nil {
			if err == sql.ErrNoRows {
				continue
			}
			return nil, fmt.Errorf("failed to get registration status for user %s: %w", row.ID, err)
		}

		u, err := toDomainUser(userRow{
			ID:                 row.ID,
			Email:              row.Email,
			Password:           row.Password,
			Role:               row.Role,
			RegistrationStatus: regRow.Status,
		})
		if err != nil {
			return nil, fmt.Errorf("failed to convert user row: %w", err)
		}
		users = append(users, u)
	}

	return users, nil
}

func (r *UserRepository) Save(ctx context.Context, user model.User) error {
	return db.WithTx(ctx, r.db, func(tx *sql.Tx) error {
		qtx := sqlc.New(tx)
		now := time.Now()

		err := qtx.CreateUser(ctx, sqlc.CreateUserParams{
			ID:        user.ID().Value(),
			Email:     user.Email().Value(),
			Password:  user.Password().Hash(),
			Role:      sqlc.UsersRole(strings.ToLower(string(user.Role()))),
			CreatedAt: now,
			UpdatedAt: now,
		})
		if err != nil {
			var mysqlErr *mysql.MySQLError
			if errors.As(err, &mysqlErr) && mysqlErr.Number == 1062 {
				return model.NewError("USER_ALREADY_EXISTS", "user with this email already exists")
			}
			return fmt.Errorf("failed to create user: %w", err)
		}

		err = qtx.CreateRegistrationRequest(ctx, sqlc.CreateRegistrationRequestParams{
			ID:                 model.NewID().Value(),
			UserID:             user.ID().Value(),
			Status:             sqlc.UserRegistrationRequestsStatus(strings.ToLower(string(user.RegistrationStatus()))),
			Reasonforrejection: sql.NullString{},
			CreatedAt:          now,
			UpdatedAt:          now,
		})
		if err != nil {
			return fmt.Errorf("failed to create registration request: %w", err)
		}

		return nil
	})
}

func (r *UserRepository) UpdateRegistrationStatus(ctx context.Context, user model.User) error {
	now := time.Now()
	err := r.queries.CreateRegistrationRequest(ctx, sqlc.CreateRegistrationRequestParams{
		ID:                 model.NewID().Value(),
		UserID:             user.ID().Value(),
		Status:             sqlc.UserRegistrationRequestsStatus(strings.ToLower(string(user.RegistrationStatus()))),
		Reasonforrejection: sql.NullString{},
		CreatedAt:          now,
		UpdatedAt:          now,
	})
	if err != nil {
		return fmt.Errorf("failed to update registration status: %w", err)
	}
	return nil
}

type userRow struct {
	ID                 string
	Email              string
	Password           string
	Role               sqlc.UsersRole
	RegistrationStatus sqlc.UserRegistrationRequestsStatus
}

func toDomainUser(row userRow) (model.User, error) {
	uid, err := model.ParseUserID(row.ID)
	if err != nil {
		return model.User{}, fmt.Errorf("failed to parse user id: %w", err)
	}

	email, err := model.NewEmail(row.Email)
	if err != nil {
		return model.User{}, fmt.Errorf("failed to create email: %w", err)
	}

	pw, err := model.NewPasswordFromHash(row.Password)
	if err != nil {
		return model.User{}, fmt.Errorf("failed to create password: %w", err)
	}

	role := model.UserRole(strings.ToUpper(string(row.Role)))
	status := model.RegistrationStatus(strings.ToUpper(string(row.RegistrationStatus)))

	return model.UserFromRepository(uid, email, pw, status, role), nil
}
