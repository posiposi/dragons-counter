package model

type UserID struct {
	ID
}

func NewUserID() UserID {
	return UserID{ID: NewID()}
}

func ParseUserID(value string) (UserID, error) {
	id, err := ParseID(value)
	if err != nil {
		return UserID{}, err
	}
	return UserID{ID: id}, nil
}
