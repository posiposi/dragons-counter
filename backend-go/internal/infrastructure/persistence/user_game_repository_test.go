//go:build integration

package persistence_test

import (
	"context"
	"database/sql"
	"errors"
	"testing"
	"time"

	"github.com/posiposi/dragons-counter/backend-go/internal/db/sqlc"
	"github.com/posiposi/dragons-counter/backend-go/internal/domain/model"
	"github.com/posiposi/dragons-counter/backend-go/internal/infrastructure/persistence"
)

const ugTestPrefix = "ug-repo-test-"

func insertTestUser(t *testing.T, db *sql.DB, id, email string) {
	t.Helper()
	now := time.Now().Truncate(time.Second)
	queries := sqlc.New(db)
	err := queries.CreateUser(context.Background(), sqlc.CreateUserParams{
		ID:        id,
		Email:     email,
		Password:  "hashed-password",
		Role:      sqlc.UsersRoleUser,
		CreatedAt: now,
		UpdatedAt: now,
	})
	if err != nil {
		t.Fatalf("unexpected error inserting test user: %v", err)
	}
}

func insertTestGame(t *testing.T, db *sql.DB, id, stadiumID string) {
	t.Helper()
	now := time.Now().Truncate(time.Second)
	queries := sqlc.New(db)
	err := queries.CreateGame(context.Background(), sqlc.CreateGameParams{
		ID:            id,
		GameDate:      time.Date(2025, 6, 15, 18, 0, 0, 0, time.UTC),
		Opponent:      "阪神タイガース",
		DragonsScore:  5,
		OpponentScore: 3,
		Result:        sqlc.GamesResultWin,
		StadiumID:     stadiumID,
		CreatedAt:     now,
		UpdatedAt:     now,
	})
	if err != nil {
		t.Fatalf("unexpected error inserting test game: %v", err)
	}
}

func cleanupUserGameTestData(t *testing.T, db *sql.DB, userGameIDs, gameIDs, userIDs, stadiumIDs []string) {
	t.Helper()
	ctx := context.Background()
	for _, id := range userGameIDs {
		_, err := db.ExecContext(ctx, "DELETE FROM users_games WHERE id = ?", id)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
	}
	for _, id := range gameIDs {
		_, err := db.ExecContext(ctx, "DELETE FROM games WHERE id = ?", id)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
	}
	for _, id := range userIDs {
		_, err := db.ExecContext(ctx, "DELETE FROM users WHERE id = ?", id)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
	}
	for _, id := range stadiumIDs {
		_, err := db.ExecContext(ctx, "DELETE FROM stadiums WHERE id = ?", id)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
	}
}

func newTestUserGame(t *testing.T, userID, gameID string, impression *string) model.UserGame {
	t.Helper()
	uid, err := model.ParseID(userID)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	gid, err := model.ParseID(gameID)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	imp, err := model.NewImpression(impression)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	return model.CreateNewUserGame(uid, gid, imp)
}

func setupUserGameTestFixtures(t *testing.T, db *sql.DB, suffix string) (stadiumID, userID, gameID string) {
	t.Helper()
	stadiumID = ugTestPrefix + "stadium-" + suffix
	userID = ugTestPrefix + "user-" + suffix
	gameID = ugTestPrefix + "game-" + suffix

	insertTestStadium(t, db, stadiumID, "バンテリンドーム ナゴヤ")
	insertTestUser(t, db, userID, ugTestPrefix+suffix+"@example.com")
	insertTestGame(t, db, gameID, stadiumID)
	return
}

func TestUserGameRepository_Save(t *testing.T) {
	db := setupDB(t)
	repo := persistence.NewUserGameRepository(db)

	stadiumID, userID, gameID := setupUserGameTestFixtures(t, db, "save")
	t.Cleanup(func() {
		cleanupUserGameTestData(t, db, nil, []string{gameID}, []string{userID}, []string{stadiumID})
	})

	t.Run("新規のUserGameを保存しFindByUserIDAndGameIDで全フィールドを検証できる", func(t *testing.T) {
		impression := "素晴らしい試合だった"
		ug := newTestUserGame(t, userID, gameID, &impression)

		t.Cleanup(func() {
			cleanupUserGameTestData(t, db, []string{ug.ID().Value()}, nil, nil, nil)
		})

		err := repo.Save(context.Background(), ug)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		uid, _ := model.ParseID(userID)
		gid, _ := model.ParseID(gameID)
		found, err := repo.FindByUserIDAndGameID(context.Background(), uid, gid)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if found == nil {
			t.Fatal("got nil, want non-nil")
		}

		if got := found.UserID().Value(); got != userID {
			t.Errorf("UserID: got %v, want %v", got, userID)
		}
		if got := found.GameID().Value(); got != gameID {
			t.Errorf("GameID: got %v, want %v", got, gameID)
		}
		if found.Impression().IsEmpty() {
			t.Error("Impression: got empty, want non-empty")
		}
		if got := found.Impression().Value(); got == nil || *got != impression {
			t.Errorf("Impression: got %v, want %v", got, impression)
		}
	})

	t.Run("感想なしのUserGameを保存できる", func(t *testing.T) {
		gameID2 := ugTestPrefix + "game-save-noimp"
		insertTestGame(t, db, gameID2, stadiumID)
		ug := newTestUserGame(t, userID, gameID2, nil)

		t.Cleanup(func() {
			cleanupUserGameTestData(t, db, []string{ug.ID().Value()}, []string{gameID2}, nil, nil)
		})

		err := repo.Save(context.Background(), ug)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		uid, _ := model.ParseID(userID)
		gid, _ := model.ParseID(gameID2)
		found, err := repo.FindByUserIDAndGameID(context.Background(), uid, gid)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if found == nil {
			t.Fatal("got nil, want non-nil")
		}
		if !found.Impression().IsEmpty() {
			t.Errorf("Impression: got non-empty, want empty")
		}
	})

	t.Run("同一user_id/game_idで異なるIDのUserGameを保存すると重複エラーになる", func(t *testing.T) {
		gameID3 := ugTestPrefix + "game-save-dup"
		insertTestGame(t, db, gameID3, stadiumID)

		impression := "一回目"
		ug1 := newTestUserGame(t, userID, gameID3, &impression)

		t.Cleanup(func() {
			cleanupUserGameTestData(t, db, []string{ug1.ID().Value()}, []string{gameID3}, nil, nil)
		})

		err := repo.Save(context.Background(), ug1)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		impression2 := "二回目"
		ug2 := newTestUserGame(t, userID, gameID3, &impression2)

		err = repo.Save(context.Background(), ug2)
		if err == nil {
			t.Fatal("expected error, got nil")
		}

		var domainErr *model.Error
		if !errors.As(err, &domainErr) {
			t.Fatalf("expected *model.Error, got %T: %v", err, err)
		}
		if domainErr.Code != "USER_GAME_ALREADY_EXISTS" {
			t.Errorf("Code: got %v, want USER_GAME_ALREADY_EXISTS", domainErr.Code)
		}
	})

	t.Run("同一IDのUserGameを再保存するとimpressionが更新される", func(t *testing.T) {
		gameID4 := ugTestPrefix + "game-save-update"
		insertTestGame(t, db, gameID4, stadiumID)

		impression := "初回感想"
		ug := newTestUserGame(t, userID, gameID4, &impression)

		t.Cleanup(func() {
			cleanupUserGameTestData(t, db, []string{ug.ID().Value()}, []string{gameID4}, nil, nil)
		})

		err := repo.Save(context.Background(), ug)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		newImpression := "更新後の感想"
		imp, _ := model.NewImpression(&newImpression)
		updated := ug.UpdateImpression(imp)

		err = repo.Save(context.Background(), updated)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		uid, _ := model.ParseID(userID)
		gid, _ := model.ParseID(gameID4)
		found, err := repo.FindByUserIDAndGameID(context.Background(), uid, gid)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if found == nil {
			t.Fatal("got nil, want non-nil")
		}
		if got := found.Impression().Value(); got == nil || *got != newImpression {
			t.Errorf("Impression: got %v, want %v", got, newImpression)
		}
	})
}

func TestUserGameRepository_FindByUserID(t *testing.T) {
	db := setupDB(t)
	repo := persistence.NewUserGameRepository(db)

	stadiumID, userID, gameID := setupUserGameTestFixtures(t, db, "findbyuid")
	gameID2 := ugTestPrefix + "game-findbyuid-2"
	insertTestGame(t, db, gameID2, stadiumID)

	impression1 := "感想1"
	impression2 := "感想2"
	ug1 := newTestUserGame(t, userID, gameID, &impression1)
	ug2 := newTestUserGame(t, userID, gameID2, &impression2)

	if err := repo.Save(context.Background(), ug1); err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if err := repo.Save(context.Background(), ug2); err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	t.Cleanup(func() {
		cleanupUserGameTestData(t, db,
			[]string{ug1.ID().Value(), ug2.ID().Value()},
			[]string{gameID, gameID2},
			[]string{userID},
			[]string{stadiumID},
		)
	})

	t.Run("同一ユーザーの2件が返却される", func(t *testing.T) {
		uid, _ := model.ParseID(userID)
		results, err := repo.FindByUserID(context.Background(), uid)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if len(results) != 2 {
			t.Fatalf("got len %d, want 2", len(results))
		}
	})

	t.Run("存在しないユーザーIDでは空配列が返る", func(t *testing.T) {
		uid, _ := model.ParseID(ugTestPrefix + "nonexistent-user")
		results, err := repo.FindByUserID(context.Background(), uid)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if len(results) != 0 {
			t.Errorf("got len %d, want 0", len(results))
		}
	})
}

func TestUserGameRepository_FindByUserIDAndGameID(t *testing.T) {
	db := setupDB(t)
	repo := persistence.NewUserGameRepository(db)

	stadiumID, userID, gameID := setupUserGameTestFixtures(t, db, "findbyuidgid")

	impression := "テスト感想"
	ug := newTestUserGame(t, userID, gameID, &impression)
	if err := repo.Save(context.Background(), ug); err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	t.Cleanup(func() {
		cleanupUserGameTestData(t, db,
			[]string{ug.ID().Value()},
			[]string{gameID},
			[]string{userID},
			[]string{stadiumID},
		)
	})

	t.Run("保存済みのUserGameを全フィールド検証できる", func(t *testing.T) {
		uid, _ := model.ParseID(userID)
		gid, _ := model.ParseID(gameID)
		found, err := repo.FindByUserIDAndGameID(context.Background(), uid, gid)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if found == nil {
			t.Fatal("got nil, want non-nil")
		}
		if got := found.UserID().Value(); got != userID {
			t.Errorf("UserID: got %v, want %v", got, userID)
		}
		if got := found.GameID().Value(); got != gameID {
			t.Errorf("GameID: got %v, want %v", got, gameID)
		}
		if got := found.Impression().Value(); got == nil || *got != impression {
			t.Errorf("Impression: got %v, want %v", got, impression)
		}
	})

	t.Run("存在しない組み合わせではnilが返る", func(t *testing.T) {
		uid, _ := model.ParseID(ugTestPrefix + "nonexistent-user")
		gid, _ := model.ParseID(ugTestPrefix + "nonexistent-game")
		found, err := repo.FindByUserIDAndGameID(context.Background(), uid, gid)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if found != nil {
			t.Errorf("got %v, want nil", found)
		}
	})
}

func TestUserGameRepository_SoftDelete(t *testing.T) {
	db := setupDB(t)
	repo := persistence.NewUserGameRepository(db)

	stadiumID, userID, gameID := setupUserGameTestFixtures(t, db, "softdel")

	t.Cleanup(func() {
		cleanupUserGameTestData(t, db, nil, []string{gameID}, []string{userID}, []string{stadiumID})
	})

	t.Run("保存後にSoftDeleteするとFindByUserIDAndGameIDでnilになる", func(t *testing.T) {
		impression := "削除対象"
		ug := newTestUserGame(t, userID, gameID, &impression)

		t.Cleanup(func() {
			cleanupUserGameTestData(t, db, []string{ug.ID().Value()}, nil, nil, nil)
		})

		err := repo.Save(context.Background(), ug)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		uid, _ := model.ParseID(userID)
		gid, _ := model.ParseID(gameID)
		err = repo.SoftDelete(context.Background(), uid, gid)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		found, err := repo.FindByUserIDAndGameID(context.Background(), uid, gid)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if found != nil {
			t.Errorf("got %v, want nil", found)
		}
	})

	t.Run("存在しないUserGameのSoftDeleteでもエラーにならない", func(t *testing.T) {
		uid, _ := model.ParseID(ugTestPrefix + "nonexistent-user")
		gid, _ := model.ParseID(ugTestPrefix + "nonexistent-game")
		err := repo.SoftDelete(context.Background(), uid, gid)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
	})

	t.Run("SoftDelete後に同一user/gameで再登録すると復活する", func(t *testing.T) {
		gameID2 := ugTestPrefix + "game-softdel-restore"
		insertTestGame(t, db, gameID2, stadiumID)

		impression := "削除前の感想"
		ug := newTestUserGame(t, userID, gameID2, &impression)

		t.Cleanup(func() {
			cleanupUserGameTestData(t, db, []string{ug.ID().Value()}, []string{gameID2}, nil, nil)
		})

		err := repo.Save(context.Background(), ug)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		uid, _ := model.ParseID(userID)
		gid, _ := model.ParseID(gameID2)
		err = repo.SoftDelete(context.Background(), uid, gid)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		newImpression := "復活後の感想"
		ug2 := newTestUserGame(t, userID, gameID2, &newImpression)
		err = repo.Save(context.Background(), ug2)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		found, err := repo.FindByUserIDAndGameID(context.Background(), uid, gid)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if found == nil {
			t.Fatal("got nil, want non-nil")
		}
		if got := found.Impression().Value(); got == nil || *got != newImpression {
			t.Errorf("Impression: got %v, want %v", got, newImpression)
		}
	})
}
