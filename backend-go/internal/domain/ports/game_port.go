package ports

import (
	"context"
	"time"

	"github.com/posiposi/dragons-counter/backend-go/internal/domain/game"
)

// BulkCreateGameInput represents input data for bulk game creation.
type BulkCreateGameInput struct {
	GameDate      time.Time
	Opponent      string
	DragonsScore  int
	OpponentScore int
	StadiumName   string
}

// BulkCreateGameResult holds the summary of a bulk game creation operation.
type BulkCreateGameResult struct {
	SavedCount   int
	SkippedCount int
	Errors       []string
}

// BulkCreateGamePort defines the port for bulk game creation with duplicate skip logic.
type BulkCreateGamePort interface {
	BulkSave(ctx context.Context, inputs []BulkCreateGameInput) BulkCreateGameResult
}

// GameQueryPort defines read operations for game data.
type GameQueryPort interface {
	FindAll(ctx context.Context) ([]game.Game, error)
	FindByID(ctx context.Context, id game.GameID) (*game.Game, error)
	FindByIDs(ctx context.Context, ids []game.GameID) ([]game.Game, error)
}

// FindGameByDatePort defines the port for finding a game by date.
type FindGameByDatePort interface {
	FindByDate(ctx context.Context, gameDate game.GameDate) (*game.Game, error)
}

// GameCommandPort defines write operations for game data.
type GameCommandPort interface {
	Save(ctx context.Context, g game.Game) error
	Delete(ctx context.Context, id game.GameID) (bool, error)
}
