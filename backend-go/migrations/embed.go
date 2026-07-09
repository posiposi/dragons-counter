package migrations

import "embed"

// FS はマイグレーションSQLファイルを埋め込んだファイルシステムである。
//
//go:embed *.sql
var FS embed.FS
