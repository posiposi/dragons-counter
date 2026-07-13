package model_test

import (
	"errors"
	"testing"

	"github.com/posiposi/dragons-counter/backend-go/internal/domain/model"
)

func newTestEmailAndPassword(t *testing.T) (model.Email, model.Password) {
	t.Helper()
	email, err := model.NewEmail("test@example.com")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	password, err := model.NewPasswordFromHash("$2b$10$hashedpasswordvalue")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	return email, password
}

func TestParseUserID(t *testing.T) {
	t.Run("有効な値でUserIDを生成できる", func(t *testing.T) {
		id, err := model.ParseUserID("550e8400-e29b-41d4-a716-446655440000")
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

		u := model.CreateNewUser(email, password)

		if u.ID().Value() == "" {
			t.Error("expected non-empty ID")
		}
		if u.Email() != email {
			t.Errorf("CreateNewUser().Email() = %v, want %v", u.Email(), email)
		}
		if u.Password() != password {
			t.Errorf("CreateNewUser().Password() does not match")
		}
		if u.RegistrationStatus() != model.RegistrationStatusPending {
			t.Errorf("CreateNewUser().RegistrationStatus() = %v, want %v", u.RegistrationStatus(), model.RegistrationStatusPending)
		}
		if u.Role() != model.RoleUser {
			t.Errorf("CreateNewUser().Role() = %v, want %v", u.Role(), model.RoleUser)
		}
	})
}

func TestUserFromRepository(t *testing.T) {
	t.Run("すべてのフィールドを指定してユーザーを復元できる", func(t *testing.T) {
		email, password := newTestEmailAndPassword(t)
		id := model.NewUserID()

		u := model.UserFromRepository(id, email, password, model.RegistrationStatusApproved, model.RoleAdmin)

		if u.ID() != id {
			t.Errorf("UserFromRepository().ID() = %v, want %v", u.ID(), id)
		}
		if u.Email() != email {
			t.Errorf("UserFromRepository().Email() = %v, want %v", u.Email(), email)
		}
		if u.Password() != password {
			t.Errorf("UserFromRepository().Password() does not match")
		}
		if u.RegistrationStatus() != model.RegistrationStatusApproved {
			t.Errorf("UserFromRepository().RegistrationStatus() = %v, want %v", u.RegistrationStatus(), model.RegistrationStatusApproved)
		}
		if u.Role() != model.RoleAdmin {
			t.Errorf("UserFromRepository().Role() = %v, want %v", u.Role(), model.RoleAdmin)
		}
	})
}

func TestUser_CanLogin(t *testing.T) {
	tests := []struct {
		name   string
		status model.RegistrationStatus
		want   bool
	}{
		{name: "APPROVED状態の場合はtrueを返す", status: model.RegistrationStatusApproved, want: true},
		{name: "PENDING状態の場合はfalseを返す", status: model.RegistrationStatusPending, want: false},
		{name: "REJECTED状態の場合はfalseを返す", status: model.RegistrationStatusRejected, want: false},
		{name: "BANNED状態の場合はfalseを返す", status: model.RegistrationStatusBanned, want: false},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			email, password := newTestEmailAndPassword(t)
			u := model.UserFromRepository(model.NewUserID(), email, password, tt.status, model.RoleUser)

			if got := u.CanLogin(); got != tt.want {
				t.Errorf("User.CanLogin() = %v, want %v", got, tt.want)
			}
		})
	}
}

func TestUser_Approve(t *testing.T) {
	t.Run("PENDING状態からAPPROVED状態へ遷移できる", func(t *testing.T) {
		email, password := newTestEmailAndPassword(t)
		original := model.UserFromRepository(model.NewUserID(), email, password, model.RegistrationStatusPending, model.RoleUser)

		approved, err := original.Approve()
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if approved.RegistrationStatus() != model.RegistrationStatusApproved {
			t.Errorf("Approve().RegistrationStatus() = %v, want %v", approved.RegistrationStatus(), model.RegistrationStatusApproved)
		}
		if approved.ID() != original.ID() {
			t.Error("Approve() changed the ID")
		}
		if original.RegistrationStatus() != model.RegistrationStatusPending {
			t.Error("original User was mutated")
		}
	})

	t.Run("PENDING以外の状態からはAPPROVEDへ遷移できずエラーを返す", func(t *testing.T) {
		tests := []struct {
			name    string
			status  model.RegistrationStatus
			message string
		}{
			{name: "APPROVED状態から", status: model.RegistrationStatusApproved, message: "APPROVEDからAPPROVEDへの遷移はできません"},
			{name: "REJECTED状態から", status: model.RegistrationStatusRejected, message: "REJECTEDからAPPROVEDへの遷移はできません"},
			{name: "BANNED状態から", status: model.RegistrationStatusBanned, message: "BANNEDからAPPROVEDへの遷移はできません"},
		}
		for _, tt := range tests {
			t.Run(tt.name, func(t *testing.T) {
				email, password := newTestEmailAndPassword(t)
				u := model.UserFromRepository(model.NewUserID(), email, password, tt.status, model.RoleUser)

				_, err := u.Approve()
				if err == nil {
					t.Fatal("expected error, got nil")
				}

				var domainErr *model.Error
				if !errors.As(err, &domainErr) {
					t.Fatal("errors.As failed to extract *model.Error")
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
		original := model.UserFromRepository(model.NewUserID(), email, password, model.RegistrationStatusPending, model.RoleUser)

		rejected, err := original.Reject()
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if rejected.RegistrationStatus() != model.RegistrationStatusRejected {
			t.Errorf("Reject().RegistrationStatus() = %v, want %v", rejected.RegistrationStatus(), model.RegistrationStatusRejected)
		}
		if rejected.ID() != original.ID() {
			t.Error("Reject() changed the ID")
		}
		if original.RegistrationStatus() != model.RegistrationStatusPending {
			t.Error("original User was mutated")
		}
	})

	t.Run("PENDING以外の状態からはREJECTEDへ遷移できずエラーを返す", func(t *testing.T) {
		tests := []struct {
			name    string
			status  model.RegistrationStatus
			message string
		}{
			{name: "APPROVED状態から", status: model.RegistrationStatusApproved, message: "APPROVEDからREJECTEDへの遷移はできません"},
			{name: "REJECTED状態から", status: model.RegistrationStatusRejected, message: "REJECTEDからREJECTEDへの遷移はできません"},
			{name: "BANNED状態から", status: model.RegistrationStatusBanned, message: "BANNEDからREJECTEDへの遷移はできません"},
		}
		for _, tt := range tests {
			t.Run(tt.name, func(t *testing.T) {
				email, password := newTestEmailAndPassword(t)
				u := model.UserFromRepository(model.NewUserID(), email, password, tt.status, model.RoleUser)

				_, err := u.Reject()
				if err == nil {
					t.Fatal("expected error, got nil")
				}

				var domainErr *model.Error
				if !errors.As(err, &domainErr) {
					t.Fatal("errors.As failed to extract *model.Error")
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
