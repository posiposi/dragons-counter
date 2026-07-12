package model

import (
	"strings"
)

var teamNameByAbbreviation = map[string]string{
	"巨":  "読売ジャイアンツ",
	"神":  "阪神タイガース",
	"広":  "広島東洋カープ",
	"De": "横浜DeNAベイスターズ",
	"ヤ":  "東京ヤクルトスワローズ",
	"中":  "中日ドラゴンズ",
	"オ":  "オリックス・バファローズ",
	"ソ":  "福岡ソフトバンクホークス",
	"楽":  "東北楽天ゴールデンイーグルス",
	"西":  "埼玉西武ライオンズ",
	"ロ":  "千葉ロッテマリーンズ",
	"日":  "北海道日本ハムファイターズ",
}

type Opponent struct {
	value string
}

// 略称が渡された場合は正式チーム名に展開する。
func NewOpponent(value string) (Opponent, error) {
	trimmed := strings.TrimSpace(value)
	if trimmed == "" {
		return Opponent{}, NewError("INVALID_OPPONENT", "Opponent name cannot be empty")
	}
	if fullName, ok := teamNameByAbbreviation[trimmed]; ok {
		return Opponent{value: fullName}, nil
	}
	return Opponent{value: trimmed}, nil
}

func (o Opponent) Value() string {
	return o.value
}

func (o Opponent) Equals(other Opponent) bool {
	return o.value == other.value
}
