package user_test

import (
	"errors"
	"testing"

	"github.com/posiposi/dragons-counter/backend-go/internal/domain"
	"github.com/posiposi/dragons-counter/backend-go/internal/domain/user"
)

func newTestEmailAndPassword(t *testing.T) (user.Email, user.Password) {
	t.Helper()
	email, err := user.NewEmail("test@example.com")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	password, err := user.NewPasswordFromHash("$2b$10$hashedpasswordvalue")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	return email, password
}

func TestParseUserID(t *testing.T) {
	t.Run("有効な値でUserIDを生成できる", func(t *testing.T) {
		id, err := user.ParseUserID("550e8400-e29b-41d4-a716-446655440000")
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if got := id.Value(); got != "550e8400-e29b-41d4-a716-446655440000" {
			t.Errorf("ParseUserID().Value() = %v, want %v", got, "550e8400-e29b-41d4-a716-446655440000")
		}
	})
}

func TestCreateNewUser(t *testing.T) {
	t.Run("PENDING状態かつUSERロールで新規ユーザーを生成できる", func(t *testing.T) {
		email, password := newTestEmailAndPassword(t)

		u := user.CreateNewUser(email, password)

		if u.ID().Value() == "" {
			t.Error("expected non-empty ID")
		}
		if u.Email() != email {
			t.Errorf("CreateNewUser().Email() = %v, want %v", u.Email(), email)
		}
		if u.Password() != password {
			t.Errorf("CreateNewUser().Password() does not match")
		}
		if u.RegistrationStatus() != user.RegistrationStatusPending {
			t.Errorf("CreateNewUser().RegistrationStatus() = %v, want %v", u.RegistrationStatus(), user.RegistrationStatusPending)
		}
		if u.Role() != user.RoleUser {
			t.Errorf("CreateNewUser().Role() = %v, want %v", u.Role(), user.RoleUser)
		}
	})
}

func TestUserFromRepository(t *testing.T) {
	t.Run("すべてのフィールドを指定してユーザーを復元できる", func(t *testing.T) {
		email, password := newTestEmailAndPassword(t)
		id := user.NewUserID()

		u := user.UserFromRepository(id, email, password, user.RegistrationStatusApproved, user.RoleAdmin)

		if u.ID() != id {
			t.Errorf("UserFromRepository().ID() = %v, want %v", u.ID(), id)
		}
		if u.Email() != email {
			t.Errorf("UserFromRepository().Email() = %v, want %v", u.Email(), email)
		}
		if u.Password() != password {
			t.Errorf("UserFromRepository().Password() does not match")
		}
		if u.RegistrationStatus() != user.RegistrationStatusApproved {
			t.Errorf("UserFromRepository().RegistrationStatus() = %v, want %v", u.RegistrationStatus(), user.RegistrationStatusApproved)
		}
		if u.Role() != user.RoleAdmin {
			t.Errorf("UserFromRepository().Role() = %v, want %v", u.Role(), user.RoleAdmin)
		}
	})
}

func TestUser_CanLogin(t *testing.T) {
	tests := []struct {
		name   string
		status user.RegistrationStatus
		want   bool
	}{
		{name: "APPROVED状態の場合はtrueを返す", status: user.RegistrationStatusApproved, want: true},
		{name: "PENDING状態の場合はfalseを返す", status: user.RegistrationStatusPending, want: false},
		{name: "REJECTED状態の場合はfalseを返す", status: user.RegistrationStatusRejected, want: false},
		{name: "BANNED状態の場合はfalseを返す", status: user.RegistrationStatusBanned, want: false},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			email, password := newTestEmailAndPassword(t)
			u := user.UserFromRepository(user.NewUserID(), email, password, tt.status, user.RoleUser)

			if got := u.CanLogin(); got != tt.want {
				t.Errorf("User.CanLogin() = %v, want %v", got, tt.want)
			}
		})
	}
}

func TestUser_Approve(t *testing.T) {
	t.Run("PENDING状態からAPPROVED状態へ遷移できる", func(t *testing.T) {
		email, password := newTestEmailAndPassword(t)
		original := user.UserFromRepository(user.NewUserID(), email, password, user.RegistrationStatusPending, user.RoleUser)

		approved, err := original.Approve()
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if approved.RegistrationStatus() != user.RegistrationStatusApproved {
			t.Errorf("Approve().RegistrationStatus() = %v, want %v", approved.RegistrationStatus(), user.RegistrationStatusApproved)
		}
		if approved.ID() != original.ID() {
			t.Error("Approve() changed the ID")
		}
		if original.RegistrationStatus() != user.RegistrationStatusPending {
			t.Error("original User was mutated")
		}
	})

	t.Run("PENDING以外の状態からはAPPROVEDへ遷移できずエラーを返す", func(t *testing.T) {
		tests := []struct {
			name    string
			status  user.RegistrationStatus
			message string
		}{
			{name: "APPROVED状態から", status: user.RegistrationStatusApproved, message: "APPROVEDからAPPROVEDへの遷移はできません"},
			{name: "REJECTED状態から", status: user.RegistrationStatusRejected, message: "REJECTEDからAPPROVEDへの遷移はできません"},
			{name: "BANNED状態から", status: user.RegistrationStatusBanned, message: "BANNEDからAPPROVEDへの遷移はできません"},
		}
		for _, tt := range tests {
			t.Run(tt.name, func(t *testing.T) {
				email, password := newTestEmailAndPassword(t)
				u := user.UserFromRepository(user.NewUserID(), email, password, tt.status, user.RoleUser)

				_, err := u.Approve()
				if err == nil {
					t.Fatal("expected error, got nil")
				}

				var domainErr *domain.Error
				if !errors.As(err, &domainErr) {
					t.Fatal("errors.As failed to extract *domain.Error")
				}
				if domainErr.Code != "INVALID_STATUS_TRANSITION" {
					t.Errorf("domainErr.Code = %v, want %v", domainErr.Code, "INVALID_STATUS_TRANSITION")
				}
				if domainErr.Message != tt.message {
					t.Errorf("domainErr.Message = %v, want %v", domainErr.Message, tt.message)
				}
			})
		}
	})
}

func TestUser_Reject(t *testing.T) {
	t.Run("PENDING状態からREJECTED状態へ遷移できる", func(t *testing.T) {
		email, password := newTestEmailAndPassword(t)
		original := user.UserFromRepository(user.NewUserID(), email, password, user.RegistrationStatusPending, user.RoleUser)

		rejected, err := original.Reject()
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if rejected.RegistrationStatus() != user.RegistrationStatusRejected {
			t.Errorf("Reject().RegistrationStatus() = %v, want %v", rejected.RegistrationStatus(), user.RegistrationStatusRejected)
		}
		if rejected.ID() != original.ID() {
			t.Error("Reject() changed the ID")
		}
		if original.RegistrationStatus() != user.RegistrationStatusPending {
			t.Error("original User was mutated")
		}
	})

	t.Run("PENDING以外の状態からはREJECTEDへ遷移できずエラーを返す", func(t *testing.T) {
		tests := []struct {
			name    string
			status  user.RegistrationStatus
			message string
		}{
			{name: "APPROVED状態から", status: user.RegistrationStatusApproved, message: "APPROVEDからREJECTEDへの遷移はできません"},
			{name: "REJECTED状態から", status: user.RegistrationStatusRejected, message: "REJECTEDからREJECTEDへの遷移はできません"},
			{name: "BANNED状態から", status: user.RegistrationStatusBanned, message: "BANNEDからREJECTEDへの遷移はできません"},
		}
		for _, tt := range tests {
			t.Run(tt.name, func(t *testing.T) {
				email, password := newTestEmailAndPassword(t)
				u := user.UserFromRepository(user.NewUserID(), email, password, tt.status, user.RoleUser)

				_, err := u.Reject()
				if err == nil {
					t.Fatal("expected error, got nil")
				}

				var domainErr *domain.Error
				if !errors.As(err, &domainErr) {
					t.Fatal("errors.As failed to extract *domain.Error")
				}
				if domainErr.Code != "INVALID_STATUS_TRANSITION" {
					t.Errorf("domainErr.Code = %v, want %v", domainErr.Code, "INVALID_STATUS_TRANSITION")
				}
				if domainErr.Message != tt.message {
					t.Errorf("domainErr.Message = %v, want %v", domainErr.Message, tt.message)
				}
			})
		}
	})
}
