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
| `GET`  | `/leaderboard?gameId=…` | — | `200 { rank, username, score }[]` |
| `GET`  | `/me/runs` | — | `200 Run[]` |
| `GET`  | `/fish/puzzle?category=…` | — | `200 { sol: number, image: string }` |

## WebSocket Events (Socket.IO)

> TBD — will be filled in during Module 4.

### Client → Server

| Event | Payload |
|-------|---------|
| `game:submit` | `{ gameId, score, attempts, correct, maxCombo, startedAt }` |

### Server → Client

| Event | Payload |
|-------|---------|
| `score:updated` | TBD |
| `run:saved` | TBD |
| `leaderboard:changed` | TBD |
| `game:tick` | TBD |

## Error Format

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request"
}
```

