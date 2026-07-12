package user

// RegistrationStatus represents the approval state of a user's registration.
type RegistrationStatus string

const (
	// RegistrationStatusPending indicates the user is awaiting approval.
	RegistrationStatusPending RegistrationStatus = "PENDING"
	// RegistrationStatusApproved indicates the user has been approved.
	RegistrationStatusApproved RegistrationStatus = "APPROVED"
	// RegistrationStatusRejected indicates the user has been rejected.
	RegistrationStatusRejected RegistrationStatus = "REJECTED"
	// RegistrationStatusBanned indicates the user has been banned.
	RegistrationStatusBanned RegistrationStatus = "BANNED"
)
