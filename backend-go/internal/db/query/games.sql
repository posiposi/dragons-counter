-- name: GetGameByID :one
SELECT * FROM games
WHERE id = ?
LIMIT 1;

-- name: FindGamesByDate :many
SELECT g.*, s.name as stadium_name
FROM games g
JOIN stadiums s ON g.stadium_id = s.id
WHERE DATE(g.game_date) = ?;

-- name: CreateGame :exec
INSERT INTO games (id, game_date, opponent, dragons_score, opponent_score, result, stadium_id, created_at, updated_at)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);

-- name: FindAllGames :many
SELECT g.*, s.name as stadium_name
FROM games g
JOIN stadiums s ON g.stadium_id = s.id
ORDER BY g.game_date DESC;

-- name: GetGameByIDWithStadium :one
SELECT g.*, s.name as stadium_name
FROM games g
JOIN stadiums s ON g.stadium_id = s.id
WHERE g.id = ?
LIMIT 1;

-- name: DeleteGame :execresult
DELETE FROM games WHERE id = ?;
