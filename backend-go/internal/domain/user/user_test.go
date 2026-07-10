package user_test

import (
	"errors"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"github.com/posiposi/dragons-counter/backend-go/internal/domain"
	"github.com/posiposi/dragons-counter/backend-go/internal/domain/user"
)

func newTestEmailAndPassword(t *testing.T) (user.Email, user.Password) {
	t.Helper()
	email, err := user.NewEmail("test@example.com")
	require.NoError(t, err)
	password, err := user.NewPasswordFromHash("$2b$10$hashedpasswordvalue")
	require.NoError(t, err)
	return email, password
}

func TestParseUserID(t *testing.T) {
	t.Run("有効な値でUserIDを生成できる", func(t *testing.T) {
		id, err := user.ParseUserID("550e8400-e29b-41d4-a716-446655440000")

		require.NoError(t, err)
		assert.Equal(t, "550e8400-e29b-41d4-a716-446655440000", id.Value())
	})
}

func TestCreateNewUser(t *testing.T) {
	t.Run("PENDING状態かつUSERロールで新規ユーザーを生成できる", func(t *testing.T) {
		email, password := newTestEmailAndPassword(t)

		u := user.CreateNewUser(email, password)

		assert.NotEmpty(t, u.ID().Value())
		assert.Equal(t, email, u.Email())
		assert.Equal(t, password, u.Password())
		assert.Equal(t, user.RegistrationStatusPending, u.RegistrationStatus())
		assert.Equal(t, user.RoleUser, u.Role())
	})
}

func TestUserFromRepository(t *testing.T) {
	t.Run("すべてのフィールドを指定してユーザーを復元できる", func(t *testing.T) {
		email, password := newTestEmailAndPassword(t)
		id := user.NewUserID()

		u := user.UserFromRepository(id, email, password, user.RegistrationStatusApproved, user.RoleAdmin)

		assert.Equal(t, id, u.ID())
		assert.Equal(t, email, u.Email())
		assert.Equal(t, password, u.Password())
		assert.Equal(t, user.RegistrationStatusApproved, u.RegistrationStatus())
		assert.Equal(t, user.RoleAdmin, u.Role())
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

			assert.Equal(t, tt.want, u.CanLogin())
		})
	}
}

func TestUser_Approve(t *testing.T) {
	t.Run("PENDING状態からAPPROVED状態へ遷移できる", func(t *testing.T) {
		email, password := newTestEmailAndPassword(t)
		original := user.UserFromRepository(user.NewUserID(), email, password, user.RegistrationStatusPending, user.RoleUser)

		approved, err := original.Approve()

		require.NoError(t, err)
		assert.Equal(t, user.RegistrationStatusApproved, approved.RegistrationStatus())
		assert.Equal(t, original.ID(), approved.ID())
		assert.Equal(t, user.RegistrationStatusPending, original.RegistrationStatus())
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

				require.Error(t, err)
				var domainErr *domain.Error
				require.True(t, errors.As(err, &domainErr))
				assert.Equal(t, "INVALID_STATUS_TRANSITION", domainErr.Code)
				assert.Equal(t, tt.message, domainErr.Message)
			})
		}
	})
}

func TestUser_Reject(t *testing.T) {
	t.Run("PENDING状態からREJECTED状態へ遷移できる", func(t *testing.T) {
		email, password := newTestEmailAndPassword(t)
		original := user.UserFromRepository(user.NewUserID(), email, password, user.RegistrationStatusPending, user.RoleUser)

		rejected, err := original.Reject()

		require.NoError(t, err)
		assert.Equal(t, user.RegistrationStatusRejected, rejected.RegistrationStatus())
		assert.Equal(t, original.ID(), rejected.ID())
		assert.Equal(t, user.RegistrationStatusPending, original.RegistrationStatus())
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

				require.Error(t, err)
				var domainErr *domain.Error
				require.True(t, errors.As(err, &domainErr))
				assert.Equal(t, "INVALID_STATUS_TRANSITION", domainErr.Code)
				assert.Equal(t, tt.message, domainErr.Message)
			})
		}
	})
}
