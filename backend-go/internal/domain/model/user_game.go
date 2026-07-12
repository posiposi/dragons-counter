package model

import (
	"time"
)

type UserGame struct {
	id         UserGameID
	userID     ID
	gameID     ID
	impression Impression
	createdAt  time.Time
	updatedAt  time.Time
}

func CreateNewUserGame(userID, gameID ID, impression Impression) UserGame {
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

func UserGameFromRepository(
	id UserGameID,
	userID, gameID ID,
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

func (u UserGame) UserID() ID {
	return u.userID
}

func (u UserGame) GameID() ID {
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
