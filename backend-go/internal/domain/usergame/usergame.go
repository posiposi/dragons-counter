package usergame

import (
	"time"

	"github.com/posiposi/dragons-counter/backend-go/internal/domain"
)

// UserGame is the aggregate root representing a user's attendance record for a game.
type UserGame struct {
	id         UserGameID
	userID     domain.ID
	gameID     domain.ID
	impression Impression
	createdAt  time.Time
	updatedAt  time.Time
}

// CreateNewUserGame creates a new UserGame with a generated ID and current timestamps.
func CreateNewUserGame(userID, gameID domain.ID, impression Impression) UserGame {
	now := time.Now()
	return UserGame{
		id:         NewUserGameID(),
		userID:     userID,
		gameID:     gameID,
		impression: impression,
		createdAt:  now,
		updatedAt:  now,
	}
}

// UserGameFromRepository reconstructs a UserGame entity from persisted data.
func UserGameFromRepository(
	id UserGameID,
	userID, gameID domain.ID,
	impression Impression,
	createdAt, updatedAt time.Time,
) UserGame {
	return UserGame{
		id:         id,
		userID:     userID,
		gameID:     gameID,
		impression: impression,
		createdAt:  createdAt,
		updatedAt:  updatedAt,
	}
}

func (u UserGame) ID() UserGameID {
	return u.id
}

func (u UserGame) UserID() domain.ID {
	return u.userID
}

func (u UserGame) GameID() domain.ID {
	return u.gameID
}

func (u UserGame) Impression() Impression {
	return u.impression
}

func (u UserGame) CreatedAt() time.Time {
	return u.createdAt
}

func (u UserGame) UpdatedAt() time.Time {
	return u.updatedAt
}

func (u UserGame) Equals(other UserGame) bool {
	return u.id.Equals(other.id)
}

func (u UserGame) UpdateImpression(newImpression Impression) UserGame {
	return UserGame{
		id:         u.id,
		userID:     u.userID,
		gameID:     u.gameID,
		impression: newImpression,
		createdAt:  u.createdAt,
		updatedAt:  time.Now(),
	}
}
