package model

type UserGameID struct {
	ID
}

func NewUserGameID() UserGameID {
	return UserGameID{ID: NewID()}
}

func ParseUserGameID(value string) (UserGameID, error) {
	id, err := ParseID(value)
	if err != nil {
		return UserGameID{}, err
	}
	return UserGameID{ID: id}, nil
}

func (i UserGameID) Equals(other UserGameID) bool {
	return i.ID.Equals(other.ID)
}
