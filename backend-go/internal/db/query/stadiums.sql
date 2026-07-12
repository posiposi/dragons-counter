-- name: GetStadiumByID :one
SELECT * FROM stadiums
WHERE id = ?
LIMIT 1;

-- name: GetStadiumByName :one
SELECT * FROM stadiums
WHERE name = ?
LIMIT 1;

-- name: ListStadiums :many
SELECT * FROM stadiums
ORDER BY name;

-- name: UpsertStadium :exec
INSERT INTO stadiums (id, name, created_at, updated_at)
VALUES (?, ?, ?, ?)
ON DUPLICATE KEY UPDATE name = VALUES(name), updated_at = VALUES(updated_at);
