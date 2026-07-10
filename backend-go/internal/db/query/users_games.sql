-- name: CreateUserGame :exec
INSERT INTO users_games (id, user_id, game_id, impression, created_at, updated_at)
VALUES (?, ?, ?, ?, ?, ?);

-- name: GetUserGameByUserIDAndGameID :one
SELECT * FROM users_games
WHERE user_id = ? AND game_id = ? AND deleted_at IS NULL
LIMIT 1;

-- name: ListUserGamesByUserID :many
SELECT * FROM users_games
WHERE user_id = ? AND deleted_at IS NULL
ORDER BY created_at DESC;

-- name: SoftDeleteUserGame :exec
UPDATE users_games SET deleted_at = ?, updated_at = ? WHERE id = ?;

-- name: RestoreUserGame :exec
UPDATE users_games SET deleted_at = NULL, impression = ?, updated_at = ?
WHERE user_id = ? AND game_id = ?;
