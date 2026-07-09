-- name: GetGameByID :one
SELECT * FROM games
WHERE id = ?
LIMIT 1;
