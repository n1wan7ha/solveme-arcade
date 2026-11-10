# API Contract

## Auth Endpoints

| Method | Path | Body | Response |
|--------|------|------|----------|
| `POST` | `/auth/register` | `{ username, password }` | `201 { id, username, role }` + `Set-Cookie: access_token, refresh_token` |
| `POST` | `/auth/login` | `{ username, password }` | `200 { user }` + `Set-Cookie: access_token, refresh_token` |
| `POST` | `/auth/refresh` | _(cookie)_ | `200 { user }` + rotated cookies |
| `POST` | `/auth/logout` | _(cookie)_ | `204` (clears cookies, revokes refresh) |
| `GET`  | `/auth/me` | _(cookie)_ | `200 { id, username, role }` |

## Games Endpoints

| Method | Path | Body | Response |
|--------|------|------|----------|
| `GET`  | `/games` | — | `200 Game[]` |
| `POST` | `/games/:gameId/runs` | `{ score, attempts, correct, maxCombo, startedAt }` | `201 Run` |
| `GET`  | `/leaderboard?gameId=…` | — | `200 { rank, username, score }[]`, top 100. With a `gameId`, ranks each player's best run; with `all` or no `gameId`, ranks total points |
| `GET`  | `/me/runs` | — | `200 Run[]` |
| `GET`  | `/fish/puzzle?category=…` | — | `200 { sol: number, image: string }` (`image` is base64 PNG; `category` is fish, banana, tomato or smile; `502` if the Fish API fails) |

## WebSocket Events (Socket.IO)

The handshake is authenticated with the `access_token` cookie. A missing or invalid token fails with a `connect_error` of `Unauthorized`.

### Client → Server

| Event | Payload | Result |
|-------|---------|--------|
| `game:submit` | `{ gameId, score, attempts, correct, maxCombo, startedAt }` | Acknowledged with the saved `Run`. On failure the server emits `exception` with `{ status: "error", message }` |

### Server → Client

| Event | Sent to | Payload |
|-------|---------|---------|
| `run:saved` | The player who finished the run | `Run` |
| `score:updated` | Everyone connected | `{ username, gameId, score }` |
| `leaderboard:changed` | Everyone connected | `{ gameId, leaderboard: { rank, username, score }[] }`, sent once for the game and once with `gameId: "all"` |
| `game:tick` | Each new connection at once, then everyone every 5 seconds | `{ serverTime, playersOnline }` |

Runs saved through `POST /games/:gameId/runs` trigger the same events.

## Server-Sent Events

| Method | Path | Events |
|--------|------|--------|
| `GET` | `/sse/leaderboard` | `text/event-stream`; each `data:` line is `{ gameId, leaderboard }` |

## Error Format

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request"
}
```

