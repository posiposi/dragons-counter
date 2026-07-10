package user

type RegistrationStatus string

const (
	RegistrationStatusPending  RegistrationStatus = "PENDING"
	RegistrationStatusApproved RegistrationStatus = "APPROVED"
	RegistrationStatusRejected RegistrationStatus = "REJECTED"
	RegistrationStatusBanned   RegistrationStatus = "BANNED"
)
