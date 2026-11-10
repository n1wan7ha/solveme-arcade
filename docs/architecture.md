# Architecture

> Draft written from the finished code. Reword it in your own voice before you submit it.

## Overview

SolveMe Arcade has three parts:

- a **React single-page app** that runs the seven games in the browser,
- a **NestJS API** that owns identity, scores, leaderboards and every call to the Fish Game API,
- **PostgreSQL** for permanent data and **Redis** as a cache.

The browser only ever talks to our API. The API talks to the Fish Game API, so third-party details (URL, CSV format, failures) stay in one backend file.

## Components

```
 Browser (React, :5173)
 ┌──────────────────────────────────────────────────────────────────────┐
 │  auth/  dashboard/  games/<slug>/ (engine + renderer + React glue)   │
 │     │        │            │                                          │
 │  api/http.ts (Axios, cookies, one shared token refresh)              │
 │  events/socket.ts + useGameEvents.ts ──► store/gameStore (Zustand)   │
 └─────┬───────────────────────────────────────────────┬────────────────┘
       │ REST (HttpOnly cookies)                       │ Socket.IO
 ┌─────▼───────────────────────────────────────────────▼────────────────┐
 │ NestJS API (:3000)                                                   │
 │  AuthModule ── JwtAuthGuard ──► used by FishApi, Scores, Realtime    │
 │  FishApiModule ──────────────────────────────► Fish Game API (HTTPS) │
 │  GamesModule   ScoresModule ── emits run.created ──┐                 │
 │                     ▲                              ▼                 │
 │                     │                 EventEmitter2 (event bus)      │
 │                     │                              │                 │
 │  RealtimeModule: LeaderboardListener ◄─────────────┘                 │
 │                  GameGateway (Socket.IO)  LeaderboardSseController   │
 │  HealthModule   PrismaModule (global)   RedisModule (global)         │
 └──────────┬─────────────────────────────────┬─────────────────────────┘
            ▼                                 ▼
      PostgreSQL 16                       Redis 7
  users, refresh tokens,           cached games (5 min) and
  games, runs                      leaderboards (30 s)
```

## Backend modules

| Module | Responsibility | Depends on |
|---|---|---|
| `AuthModule` | Register, log in, refresh, log out; bcrypt passwords; access and refresh JWTs in HttpOnly cookies; `JwtAuthGuard`, `RolesGuard` | Prisma |
| `FishApiModule` | `GET /fish/puzzle`: calls the Fish API, parses its CSV, retries, logs each attempt with a correlation ID | Auth (guard) |
| `GamesModule` | `GET /games`, cached in Redis | Prisma, Redis |
| `ScoresModule` | Saves runs, lists a player's runs, builds leaderboards; emits `run.created` | Prisma, Redis, event bus, Auth (guard) |
| `RealtimeModule` | Turns domain events into Socket.IO messages and an SSE stream | Scores, Auth (JWT) |
| `HealthModule` | `GET /health` for the database, Redis and the Fish API | Prisma, Redis, FishApi |
| `PrismaModule`, `RedisModule` | One shared database client and one shared Redis connection | — |

Dependencies only point one way. `ScoresModule` has no idea sockets exist; `RealtimeModule` depends on it, never the reverse.

## Frontend structure

| Folder | Responsibility |
|---|---|
| `api/` | Typed calls to the REST endpoints. `http.ts` sends cookies and renews an expired session once |
| `auth/`, `store/authStore.ts` | Who is signed in, login and register pages, route guards |
| `events/`, `store/gameStore.ts` | The socket connection and the live data it delivers |
| `dashboard/` | Stats, game library, run history, achievements, live rankings. All maths is in `stats.ts` |
| `games/shared/` | Base engine, game loop, answer queue, audio, shared game screens, run saving |
| `games/<slug>/` | Each action game: `engine.ts` (rules, no React or DOM), `renderer.ts` (draws, never changes state), a React component, `index.ts` |
| `games/puzzle/` | One engine and one screen shared by the four puzzle games; each puzzle folder holds only its rules |
| `ui/` | Button, Card, Modal, DotText, CountUp |

## Data flow: playing a puzzle

1. The browser calls `GET /fish/puzzle?category=fish` with its access cookie.
2. `FishApiService` calls `https://marcconrad.com/uob/fish/api.php?out=csv&base64=yes`, retrying network errors and 5xx responses up to 3 times (300, 900, 2700 ms).
3. It parses `<base64 png>,<solution>[,<extra>]` into `{ sol, image }` and returns it.
4. `PuzzleEngine` checks each answer and keeps score.
5. When the run ends, the browser calls `POST /games/fish-count/runs`. The user ID comes from the token, never from the body.

The action games use the same endpoint without showing the image: the hidden answer picks Snake's bonus food, Fruit Slash's golden fruit, and Star Scraper's safe lane.

## Event flow: a score reaching every screen

```
POST /games/:id/runs ─┐
                      ├─► RunsService.createRun ─► PostgreSQL
game:submit (socket) ─┘        │ clears leaderboard cache
                               ▼
                      emit "run.created" ───────────────┐
                               │                         ▼
                               ▼              GameGateway: run:saved (to owner)
                     LeaderboardListener                 score:updated (to all)
                     recomputes game + all boards
                               │
                      emit "leaderboard.updated"
                               ├──► GameGateway: leaderboard:changed (to all)
                               └──► GET /sse/leaderboard stream
```

In the browser, `useGameEvents` puts each message into `gameStore`. The rankings panel replaces its table, and the dashboard reloads the player's stats when `run:saved` arrives.

## Identity

- Passwords are hashed with bcrypt (12 rounds by default).
- Login issues a 15-minute access JWT and a 7-day refresh JWT, signed with different secrets, both in `HttpOnly; SameSite=Strict` cookies (`Secure` in production). The refresh cookie is scoped to `/auth`.
- Only a SHA-256 hash of each refresh token is stored. Each refresh revokes the old token and issues a new one, in one atomic update, so a stolen or replayed token stops working.
- Sockets are authenticated in Socket.IO middleware from the same access cookie, and token expiry is re-checked when a socket submits a run.
- `RolesGuard` and `@Roles()` provide role-based access control (`PLAYER`, `ADMIN`). No route needs `ADMIN` yet.

## Trade-offs and known limitations

- **Players are trusted with their own scores.** `/fish/puzzle` returns the answer, and the browser reports the final score. That is required for games that run in the browser, but a determined player could post a fake score. A server-authoritative design would keep answers on the server and check each move.
- **The game catalogue exists twice.** Slugs, names and emojis live in the database `Game` table and in `frontend/src/games/registry.ts` (which also holds colours and help text). The seed keeps them in line, but a change must be made in both places.
- **Redis is optional by design.** Every cache call falls back to the database within about 500 ms if Redis is down, so the cache can never take the app down. The cost is a slower leaderboard while it is down.
- **Leaderboards are cached for 30 seconds**, but every new run clears them, so players see new scores at once.
- **REST saves runs, sockets deliver updates.** A failed save shows a clear error and a retry button, while the server still pushes the result to every connected player.
- **Socket.IO and SSE both exist.** Socket.IO carries everything the app needs; the SSE stream is a simpler one-way alternative that any client (even `curl -N`) can read.
- **Versions differ from the original plan.** NestJS 12, React 19 and Vitest replaced NestJS 10, React 18 and Jest because the scaffold installed them and they work; see the decision log.
