-- name: GetUserByEmail :one
SELECT * FROM users
WHERE email = ?
LIMIT 1;

-- name: GetUserByID :one
SELECT * FROM users
WHERE id = ?
LIMIT 1;

-- name: ListUsers :many
SELECT * FROM users
ORDER BY created_at DESC;

-- name: CreateUser :exec
INSERT INTO users (id, email, password, role, created_at, updated_at)
VALUES (?, ?, ?, ?, ?, ?);

-- name: UpdateUserRole :exec
UPDATE users SET role = ?, updated_at = ? WHERE id = ?;
