package domain

// Error represents a domain-level error with an identifying code and human-readable message.
type Error struct {
	Code    string
	Message string
}

// NewError creates a new domain Error with the given code and message.
func NewError(code, message string) *Error {
	return &Error{
		Code:    code,
		Message: message,
	}
}

func (e *Error) Error() string {
	return e.Message
}
