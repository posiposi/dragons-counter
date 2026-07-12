package user

// UserRole represents the authorization level of a user.
type UserRole string

const (
	// RoleUser is the default role for regular users.
	RoleUser UserRole = "USER"
	// RoleAdmin is the role for administrative users.
	RoleAdmin UserRole = "ADMIN"
)
