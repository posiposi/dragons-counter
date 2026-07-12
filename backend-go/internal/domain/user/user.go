package user

import (
	"fmt"

	"github.com/posiposi/dragons-counter/backend-go/internal/domain"
)

// User is the aggregate root representing an application user.
type User struct {
	id                 UserID
	email              Email
	password           Password
	registrationStatus RegistrationStatus
	role               UserRole
}

// CreateNewUser creates a new User with Pending status and User role.
func CreateNewUser(email Email, password Password) User {
	return User{
		id:                 NewUserID(),
		email:              email,
		password:           password,
		registrationStatus: RegistrationStatusPending,
		role:               RoleUser,
	}
}

// UserFromRepository reconstructs a User entity from persisted data.
func UserFromRepository(
	id UserID,
	email Email,
	password Password,
	registrationStatus RegistrationStatus,
	role UserRole,
) User {
	return User{
		id:                 id,
		email:              email,
		password:           password,
		registrationStatus: registrationStatus,
		role:               role,
	}
}

func (u User) ID() UserID {
	return u.id
}

func (u User) Email() Email {
	return u.email
}

func (u User) Password() Password {
	return u.password
}

func (u User) RegistrationStatus() RegistrationStatus {
	return u.registrationStatus
}

func (u User) Role() UserRole {
	return u.role
}

func (u User) Approve() (User, error) {
	return u.transitionTo(RegistrationStatusApproved)
}

func (u User) Reject() (User, error) {
	return u.transitionTo(RegistrationStatusRejected)
}

func (u User) CanLogin() bool {
	return u.registrationStatus == RegistrationStatusApproved
}

func (u User) transitionTo(next RegistrationStatus) (User, error) {
	if u.registrationStatus != RegistrationStatusPending {
		return User{}, domain.NewError(
			"INVALID_STATUS_TRANSITION",
			fmt.Sprintf("%sから%sへの遷移はできません", u.registrationStatus, next),
		)
	}
	return UserFromRepository(u.id, u.email, u.password, next, u.role), nil
}
