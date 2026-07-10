-- name: CreateRegistrationRequest :exec
INSERT INTO user_registration_requests (id, user_id, status, reasonForRejection, created_at, updated_at)
VALUES (?, ?, ?, ?, ?, ?);

-- name: GetLatestRegistrationByUserID :one
SELECT * FROM user_registration_requests
WHERE user_id = ?
ORDER BY created_at DESC
LIMIT 1;
