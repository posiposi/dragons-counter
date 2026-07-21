//go:build integration

package persistence_test

import (
	"context"
	"errors"
	"strings"
	"testing"

	_ "github.com/go-sql-driver/mysql"

	"github.com/posiposi/dragons-counter/backend-go/internal/domain/model"
	"github.com/posiposi/dragons-counter/backend-go/internal/infrastructure/persistence"
)

const userTestPrefix = "user-repo-test-"

func newTestUser(t *testing.T, emailAddr string) model.User {
	t.Helper()
	email, err := model.NewEmail(emailAddr)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	pw, err := model.NewPasswordFromPlainText("Test1234!")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	return model.CreateNewUser(email, pw)
}

func TestUserRepository_Save(t *testing.T) {
	db := setupDB(t)
	repo := persistence.NewUserRepository(db)

	user := newTestUser(t, userTestPrefix+"save@example.com")
	t.Cleanup(func() {
		ctx := context.Background()
		db.ExecContext(ctx, "DELETE FROM user_registration_requests WHERE user_id = ?", user.ID().Value())
		db.ExecContext(ctx, "DELETE FROM users WHERE id = ?", user.ID().Value())
	})

	err := repo.Save(context.Background(), user)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	found, err := repo.FindByEmail(context.Background(), user.Email())
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if found == nil {
		t.Fatal("got nil, want non-nil")
	}
	if got := found.Email().Value(); got != user.Email().Value() {
		t.Errorf("Email: got %v, want %v", got, user.Email().Value())
	}
	if got := found.Role(); got != model.RoleUser {
		t.Errorf("Role: got %v, want %v", got, model.RoleUser)
	}
	if got := found.RegistrationStatus(); got != model.RegistrationStatusPending {
		t.Errorf("RegistrationStatus: got %v, want %v", got, model.RegistrationStatusPending)
	}
}

func TestUserRepository_Save_DuplicateEmail(t *testing.T) {
	db := setupDB(t)
	repo := persistence.NewUserRepository(db)

	user1 := newTestUser(t, userTestPrefix+"dup@example.com")
	t.Cleanup(func() {
		ctx := context.Background()
		db.ExecContext(ctx, "DELETE FROM user_registration_requests WHERE user_id = ?", user1.ID().Value())
		db.ExecContext(ctx, "DELETE FROM users WHERE id = ?", user1.ID().Value())
	})

	err := repo.Save(context.Background(), user1)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	email, _ := model.NewEmail(userTestPrefix + "dup@example.com")
	pw, _ := model.NewPasswordFromPlainText("Test1234!")
	user2 := model.CreateNewUser(email, pw)
	t.Cleanup(func() {
		ctx := context.Background()
		db.ExecContext(ctx, "DELETE FROM user_registration_requests WHERE user_id = ?", user2.ID().Value())
		db.ExecContext(ctx, "DELETE FROM users WHERE id = ?", user2.ID().Value())
	})

	err = repo.Save(context.Background(), user2)
	if err == nil {
		t.Fatal("expected error, got nil")
	}

	var modelErr *model.Error
	if !errors.As(err, &modelErr) {
		t.Fatalf("expected *model.Error, got %T: %v", err, err)
	}
	if modelErr.Code != "USER_ALREADY_EXISTS" {
		t.Errorf("Code: got %v, want USER_ALREADY_EXISTS", modelErr.Code)
	}
}

func TestUserRepository_FindByEmail_Exists(t *testing.T) {
	db := setupDB(t)
	repo := persistence.NewUserRepository(db)

	user := newTestUser(t, userTestPrefix+"findbyemail@example.com")
	t.Cleanup(func() {
		ctx := context.Background()
		db.ExecContext(ctx, "DELETE FROM user_registration_requests WHERE user_id = ?", user.ID().Value())
		db.ExecContext(ctx, "DELETE FROM users WHERE id = ?", user.ID().Value())
	})

	if err := repo.Save(context.Background(), user); err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	found, err := repo.FindByEmail(context.Background(), user.Email())
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if found == nil {
		t.Fatal("got nil, want non-nil")
	}
	if got := found.ID().Value(); got != user.ID().Value() {
		t.Errorf("ID: got %v, want %v", got, user.ID().Value())
	}
	if got := found.Email().Value(); got != user.Email().Value() {
		t.Errorf("Email: got %v, want %v", got, user.Email().Value())
	}
	if got := found.Role(); got != model.RoleUser {
		t.Errorf("Role: got %v, want %v", got, model.RoleUser)
	}
	if got := found.RegistrationStatus(); got != model.RegistrationStatusPending {
		t.Errorf("RegistrationStatus: got %v, want %v", got, model.RegistrationStatusPending)
	}
}

func TestUserRepository_FindByEmail_NotFound(t *testing.T) {
	db := setupDB(t)
	repo := persistence.NewUserRepository(db)

	email, _ := model.NewEmail(userTestPrefix + "nonexistent@example.com")
	found, err := repo.FindByEmail(context.Background(), email)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if found != nil {
		t.Errorf("got %v, want nil", found)
	}
}

func TestUserRepository_FindByID_Exists(t *testing.T) {
	db := setupDB(t)
	repo := persistence.NewUserRepository(db)

	user := newTestUser(t, userTestPrefix+"findbyid@example.com")
	t.Cleanup(func() {
		ctx := context.Background()
		db.ExecContext(ctx, "DELETE FROM user_registration_requests WHERE user_id = ?", user.ID().Value())
		db.ExecContext(ctx, "DELETE FROM users WHERE id = ?", user.ID().Value())
	})

	if err := repo.Save(context.Background(), user); err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	found, err := repo.FindByID(context.Background(), user.ID())
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if found == nil {
		t.Fatal("got nil, want non-nil")
	}
	if got := found.ID().Value(); got != user.ID().Value() {
		t.Errorf("ID: got %v, want %v", got, user.ID().Value())
	}
	if got := found.Email().Value(); got != user.Email().Value() {
		t.Errorf("Email: got %v, want %v", got, user.Email().Value())
	}
	if got := found.Role(); got != model.RoleUser {
		t.Errorf("Role: got %v, want %v", got, model.RoleUser)
	}
	if got := found.RegistrationStatus(); got != model.RegistrationStatusPending {
		t.Errorf("RegistrationStatus: got %v, want %v", got, model.RegistrationStatusPending)
	}
}

func TestUserRepository_FindByID_NotFound(t *testing.T) {
	db := setupDB(t)
	repo := persistence.NewUserRepository(db)

	id, _ := model.ParseUserID("00000000-0000-0000-0000-000000000000")
	found, err := repo.FindByID(context.Background(), id)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if found != nil {
		t.Errorf("got %v, want nil", found)
	}
}

func TestUserRepository_FindAll(t *testing.T) {
	db := setupDB(t)
	repo := persistence.NewUserRepository(db)

	user1 := newTestUser(t, userTestPrefix+"findall1@example.com")
	user2 := newTestUser(t, userTestPrefix+"findall2@example.com")
	t.Cleanup(func() {
		ctx := context.Background()
		for _, u := range []model.User{user1, user2} {
			db.ExecContext(ctx, "DELETE FROM user_registration_requests WHERE user_id = ?", u.ID().Value())
			db.ExecContext(ctx, "DELETE FROM users WHERE id = ?", u.ID().Value())
		}
	})

	if err := repo.Save(context.Background(), user1); err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if err := repo.Save(context.Background(), user2); err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	users, err := repo.FindAll(context.Background())
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	foundEmails := make(map[string]bool)
	for _, u := range users {
		if strings.HasPrefix(u.Email().Value(), userTestPrefix) {
			foundEmails[u.Email().Value()] = true
		}
	}
	if !foundEmails[userTestPrefix+"findall1@example.com"] {
		t.Error("user1が結果に含まれるべき")
	}
	if !foundEmails[userTestPrefix+"findall2@example.com"] {
		t.Error("user2が結果に含まれるべき")
	}
}

func TestUserRepository_UpdateRegistrationStatus(t *testing.T) {
	db := setupDB(t)
	repo := persistence.NewUserRepository(db)

	user := newTestUser(t, userTestPrefix+"update-status@example.com")
	t.Cleanup(func() {
		ctx := context.Background()
		db.ExecContext(ctx, "DELETE FROM user_registration_requests WHERE user_id = ?", user.ID().Value())
		db.ExecContext(ctx, "DELETE FROM users WHERE id = ?", user.ID().Value())
	})

	if err := repo.Save(context.Background(), user); err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	approved, err := user.Approve()
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if err := repo.UpdateRegistrationStatus(context.Background(), approved); err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	found, err := repo.FindByID(context.Background(), user.ID())
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if found == nil {
		t.Fatal("got nil, want non-nil")
	}
	if got := found.RegistrationStatus(); got != model.RegistrationStatusApproved {
		t.Errorf("RegistrationStatus: got %v, want %v", got, model.RegistrationStatusApproved)
	}
}

func TestUserRepository_LatestRegistrationStatus(t *testing.T) {
	db := setupDB(t)
	repo := persistence.NewUserRepository(db)

	user := newTestUser(t, userTestPrefix+"latest-status@example.com")
	t.Cleanup(func() {
		ctx := context.Background()
		db.ExecContext(ctx, "DELETE FROM user_registration_requests WHERE user_id = ?", user.ID().Value())
		db.ExecContext(ctx, "DELETE FROM users WHERE id = ?", user.ID().Value())
	})

	if err := repo.Save(context.Background(), user); err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	approved, err := user.Approve()
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if err := repo.UpdateRegistrationStatus(context.Background(), approved); err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	rejected := model.UserFromRepository(
		user.ID(),
		user.Email(),
		user.Password(),
		model.RegistrationStatusRejected,
		user.Role(),
	)
	if err := repo.UpdateRegistrationStatus(context.Background(), rejected); err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	found, err := repo.FindByID(context.Background(), user.ID())
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if found == nil {
		t.Fatal("got nil, want non-nil")
	}
	if got := found.RegistrationStatus(); got != model.RegistrationStatusRejected {
		t.Errorf("RegistrationStatus: got %v, want %v", got, model.RegistrationStatusRejected)
	}
}
