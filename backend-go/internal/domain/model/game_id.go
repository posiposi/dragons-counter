package model

type GameID struct {
	ID
}

func NewGameID() GameID {
	return GameID{ID: NewID()}
}

func ParseGameID(value string) (GameID, error) {
	id, err := ParseID(value)
	if err != nil {
		return GameID{}, err
	}
	return GameID{ID: id}, nil
}

func (g GameID) Equals(other GameID) bool {
	return g.ID.Equals(other.ID)
}

type StadiumID struct {
	ID
}

func NewStadiumID() StadiumID {
	return StadiumID{ID: NewID()}
}

func ParseStadiumID(value string) (StadiumID, error) {
	id, err := ParseID(value)
	if err != nil {
		return StadiumID{}, err
	}
	return StadiumID{ID: id}, nil
}

func (s StadiumID) Equals(other StadiumID) bool {
	return s.ID.Equals(other.ID)
}
