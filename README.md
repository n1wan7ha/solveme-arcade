# SolveMe Arcade

A mini-game arcade (7 games) powered by the Fish Game API, with real authentication,
persistent scores, and real-time leaderboard updates.

## Prerequisites

- Node.js v20+ (v22 recommended)
- npm 10+
- Docker + Docker Compose

## Quick Start

```bash
# 1. Copy and configure environment
cp .env.example .env

# 2. Start infrastructure (Postgres + Redis)
docker compose -f infra/docker-compose.yml --env-file .env up -d

# 3. Start the backend
cd backend
npm install
npm run start:dev

# 4. In a separate terminal — start the frontend
cd frontend
npm install
npm run dev
```

## Ports

| Service   | Port |
|-----------|------|
| Backend   | 3000 |
| Frontend  | 5173 |
| pgAdmin   | 5050 |
| PostgreSQL| 5432 |
| Redis     | 6379 |

## Stack

- **Backend:** NestJS 10 · TypeScript · Prisma · PostgreSQL 16 · Redis 7 · Socket.IO
- **Frontend:** Vite · React 18 · TypeScript · Tailwind CSS · Zustand · Axios · Socket.IO client
- **Infra:** Docker · Docker Compose

## Rubric themes

| Theme | Key files |
|---|---|
| Low coupling / high cohesion | `backend/src/auth/auth.module.ts`, `frontend/src/games/snake/engine.ts` |
| Event-driven programming | `backend/src/realtime/game.gateway.ts`, `frontend/src/events/useGameEvents.ts` |
| Interoperability | `backend/src/fish-api/fish-api.service.ts`, `frontend/src/api/fish.api.ts` |
| Virtual identity | `backend/src/auth/auth.service.ts`, `backend/src/auth/strategies/jwt-access.strategy.ts` |

