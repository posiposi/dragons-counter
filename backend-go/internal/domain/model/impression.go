package model

import (
	"strings"
	"unicode/utf8"
)

const impressionMaxLength = 191

// runeカウントで191文字制限。nilまたは空文字はempty扱い。
type Impression struct {
	value string
	empty bool
}

func NewImpression(value *string) (Impression, error) {
	if value == nil {
		return Impression{empty: true}, nil
	}
	trimmed := strings.TrimSpace(*value)
	if trimmed == "" {
		return Impression{empty: true}, nil
	}
	if utf8.RuneCountInString(trimmed) > impressionMaxLength {
		return Impression{}, NewError(
			"INVALID_IMPRESSION",
			"Impression must be 191 characters or less",
		)
	}
	return Impression{value: trimmed}, nil
}

func (i Impression) Value() *string {
	if i.empty {
		return nil
	}
	value := i.value
	return &value
}

func (i Impression) IsEmpty() bool {
	return i.empty
}

func (i Impression) Equals(other Impression) bool {
	return i == other
}
