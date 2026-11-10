# SolveMe Arcade

A seven-game browser arcade built on the Fish Game API, with real accounts, scores saved in PostgreSQL, and leaderboards that update live.

## Prerequisites

- Node.js 20 or later (22 recommended) and npm 10 or later
- Docker Desktop (runs PostgreSQL and Redis; you do not install them yourself)
- Optional: `make`, for the shortcuts in `infra/Makefile`

## First-time setup

```bash
# 1. Environment: the root .env is read by Docker Compose; the backend reads backend/.env
cp .env.example .env
cp .env.example backend/.env

# 2. Start PostgreSQL, Redis and pgAdmin
docker compose -f infra/docker-compose.yml --env-file .env up -d

# 3. Backend: install, create the tables, load the demo data
cd backend
npm install --legacy-peer-deps
npx prisma migrate deploy
npx prisma db seed

# 4. Frontend (in a second terminal)
cd frontend
npm install
```

`frontend/.env.local` holds `VITE_API_URL` and `VITE_SOCKET_URL` (both `http://localhost:3000`).

## Run it

```bash
docker compose -f infra/docker-compose.yml --env-file .env up -d   # if not already running
cd backend && npm run start:dev                                    # API on :3000
cd frontend && npm run dev                                         # app on :5173
```

Open <http://localhost:5173> and log in with a demo account: `niwantha`, `user` or `player`, password `1234`.

### Or run everything in Docker

```bash
docker compose -f infra/docker-compose.yml --env-file .env --profile app up -d --build
```

The app is then on <http://localhost:8080> and the API on <http://localhost:3000>. The backend image runs as a non-root user and applies migrations when it starts. Stop the dev backend first, because both use port 3000.

## Tests

```bash
cd backend
npm test            # unit and HTTP tests, no database needed
npm run test:e2e    # needs PostgreSQL and Redis running
```

| Test file | What it proves |
|---|---|
| `src/auth/auth.controller.spec.ts` | Register, cookie-based `/auth/me`, refresh rotation and logout over real HTTP (Supertest) |
| `src/fish-api/fish-api.service.spec.ts` | The Fish API adapter retries a network error, parses the CSV, and fails fast with 502 on a 4xx (HTTP client mocked) |
| `src/scores/runs.service.spec.ts` | Saving a run clears the cached leaderboards and emits `run.created`; leaderboards are ranked and cached |

## Make shortcuts

From `infra/`: `make up`, `make down`, `make seed`, `make logs`, `make app` (full stack in Docker), `make test`. On Windows, install make first (for example `choco install make`) or run the command shown under each target in `infra/Makefile`.

## Ports

| Service | Port |
|---|---|
| Backend API | 3000 |
| Frontend (dev) | 5173 |
| Frontend (Docker) | 8080 |
| pgAdmin | 5050 (`admin@solveme.dev` / `admin`) |
| PostgreSQL | 5432 |
| Redis | 6379 |

`GET http://localhost:3000/health` reports the database, Redis and the Fish API.

## Stack

- **Backend:** NestJS 12, TypeScript, Prisma 5, PostgreSQL 16, Redis 7, Socket.IO, Vitest and Supertest
- **Frontend:** Vite, React 19, TypeScript, Tailwind CSS 4, Zustand, Axios, Socket.IO client
- **Infra:** Docker and Docker Compose, nginx for the production frontend

## Documentation

- [docs/architecture.md](docs/architecture.md): modules, data and event flow, trade-offs
- [docs/api-contract.md](docs/api-contract.md): every REST endpoint, WebSocket event and SSE stream
- [docs/decision-log.md](docs/decision-log.md): each design decision, with alternatives and rationale
- [docs/demo-script.md](docs/demo-script.md): a plan for the 10-minute video

## Where each rubric theme lives

| Theme | Files to open |
|---|---|
| Low coupling, high cohesion | `backend/src/auth/auth.module.ts`, `frontend/src/games/snake/engine.ts` with `renderer.ts` |
| Event-driven programming | `backend/src/realtime/game.gateway.ts`, `backend/src/realtime/leaderboard.listener.ts`, `frontend/src/events/useGameEvents.ts` |
| Interoperability | `backend/src/fish-api/fish-api.service.ts`, `frontend/src/api/fish.api.ts` |
| Virtual identity | `backend/src/auth/auth.service.ts`, `backend/src/auth/strategies/jwt-access.strategy.ts`, `frontend/src/api/http.ts` |
