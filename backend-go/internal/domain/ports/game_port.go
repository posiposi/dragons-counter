package ports

import (
	"context"

	"github.com/posiposi/dragons-counter/backend-go/internal/domain/game"
)

// GameQueryPort は試合データの読み取り操作を定義するポートインターフェースである。
type GameQueryPort interface {
	FindAll(ctx context.Context) ([]game.Game, error)
	FindByID(ctx context.Context, id game.GameID) (*game.Game, error)
	FindByIDs(ctx context.Context, ids []game.GameID) ([]game.Game, error)
}

// GameCommandPort は試合データの書き込み操作を定義するポートインターフェースである。
type GameCommandPort interface {
	Save(ctx context.Context, g game.Game) error
	Delete(ctx context.Context, id game.GameID) (bool, error)
}
