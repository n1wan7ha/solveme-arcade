# AGENT-BOOTSTRAP.md — SolveMe Arcade

> **You are an expert full-stack engineer pairing with a university student.**
> **Their grade depends on the CODE being clean, modular, and demonstrable in a 10-minute video.**
> **Read this entire document before writing any code.**
> **Stop after each prompt, show the acceptance checks, wait for "continue".**

---

## 0. Project context (do not skip)

**Project name:** SolveMe Arcade
**Root folder:** `solveme-arcade/`
**Purpose:** A mini-game arcade (7 games) that uses the Fish Game API
(`https://marcconrad.com/uob/fish/api.php`) to fetch puzzle solutions hidden
in images, with real authentication, persistent scores, and real-time updates.

**This is a university assignment.** The rubric assesses FOUR themes — you must
build so that each is **visibly separable in the source code**:

1. **Low coupling / high cohesion** — clear modules, single responsibility
2. **Event-driven programming** — WebSocket gateway + event bus + SSE
3. **Interoperability** — Fish API adapter with retries, documented protocol
4. **Virtual identity** — JWT + bcrypt + HttpOnly cookies + RBAC

**Non-negotiable rules for you (the agent):**
- Read `docs/decision-log.md` before any architectural change; append to it after.
- Never put secrets in code. Read all secrets from `process.env` (backend) or `import.meta.env` (frontend).
- Do not invent API endpoints; the contract lives in `docs/api-contract.md`.
- Write one module at a time. Wait for user confirmation between modules.
- Where you use third-party code or LLM-generated code, add a comment marking it.
- Prefer clarity over cleverness — the student must be able to *explain every line in a video*.

**Stack (locked — do not substitute without asking):**
- Backend: NestJS 10 + TypeScript + Prisma + PostgreSQL 16 + Redis 7 + Socket.IO
- Frontend: Vite + React 18 + TypeScript + Tailwind + Zustand + Axios + Socket.IO client
- Infra: Docker + Docker Compose (Postgres, Redis, pgAdmin optional)

---

## 1. Environment setup & repo scaffold

**Goal:** Create `solveme-arcade/` with backend, frontend, infra, and docs skeletons — all running locally, zero business logic yet.

### Tasks

1. **Verify toolchain** — run each command, show output, stop on failure:
   ```bash
   node -v          # must be v20+ or v22+
   npm -v           # must be 10+
   git --version
   docker --version
   docker compose version
   nest --version
   prisma --version
   tsc --version
   ```
   If any tool is missing, **tell the user exactly what to install and stop**.

2. **Create folder structure** under the current directory:
   ```
   solveme-arcade/
   ├── backend/
   ├── frontend/
   ├── infra/
   ├── docs/
   ├── .gitignore
   ├── .env.example
   └── README.md
   ```
   Populate `.gitignore` with standard ignores:
   `node_modules/`, `dist/`, `.env`, `.env.local`, `*.log`, `.DS_Store`,
   `coverage/`, `.vscode/`, `.idea/`, `infra/pgdata/`.

3. **Create root `.env.example`** exactly with these keys (do not add/remove):
   ```env
   # Backend
   NODE_ENV=development
   PORT=3000
   FRONTEND_URL=http://localhost:5173

   # Database
   POSTGRES_USER=solveme
   POSTGRES_PASSWORD=solveme_dev
   POSTGRES_DB=solveme
   DATABASE_URL=postgresql://solveme:solveme_dev@localhost:5432/solveme?schema=public

   # Redis
   REDIS_URL=redis://localhost:6379

   # Auth
   JWT_ACCESS_SECRET=dev_access_secret_change_me
   JWT_REFRESH_SECRET=dev_refresh_secret_change_me
   JWT_ACCESS_TTL=15m
   JWT_REFRESH_TTL=7d
   BCRYPT_ROUNDS=12

   # External
   FISH_API_URL=https://marcconrad.com/uob/fish/api.php

   # Frontend (Vite exposes VITE_* only)
   VITE_API_URL=http://localhost:3000
   VITE_SOCKET_URL=http://localhost:3000
   ```
   Then copy it to `.env` (root) so backend can read it.

4. **Scaffold NestJS backend**:
   ```bash
   cd backend
   nest new . --package-manager npm --skip-git
   ```
   Install base deps:
   ```bash
   npm i @nestjs/config @nestjs/jwt @nestjs/passport passport passport-jwt
   npm i @nestjs/axios @nestjs/event-emitter @nestjs/websockets @nestjs/platform-socket.io
   npm i @nestjs/throttler bcrypt class-validator class-transformer cookie-parser
   npm i prisma @prisma/client redis ioredis socket.io
   npm i -D @types/bcrypt @types/cookie-parser @types/passport-jwt @types/node
   ```
   In `src/main.ts`:
   - enable `app.use(cookieParser())`
   - enable `app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }))`
   - enable CORS with `origin: process.env.FRONTEND_URL, credentials: true`
   - enable `ConfigModule` globally in `app.module.ts`

5. **Scaffold Vite + React + TypeScript frontend**:
   ```bash
   cd ../frontend
   npm create vite@latest . -- --template react-ts
   npm i
   npm i axios zustand socket.io-client react-router-dom
   npm i -D tailwindcss postcss autoprefixer @types/node
   npx tailwindcss init -p
   ```
   Configure `tailwind.config.ts` content globs: `./index.html`, `./src/**/*.{ts,tsx}`.
   Replace `src/index.css` with Tailwind directives:
   ```css
   @tailwind base;
   @tailwind components;
   @tailwind utilities;
   ```
   Create `frontend/.env.local` with `VITE_API_URL` and `VITE_SOCKET_URL` (mirror root).

6. **Create `infra/docker-compose.yml`** with:
   - `postgres:16-alpine` (env from root `.env`, port 5432, volume `pgdata`, healthcheck)
   - `redis:7-alpine` (port 6379, healthcheck)
   - `dpage/pgadmin4` (port 5050, optional)
   Bring up: `docker compose --env-file ../.env up -d`.
   **Do not run Postgres or Redis locally** — containers only.

7. **Create `docs/` files with skeletons**:
   - `docs/architecture.md` — sections: Overview, Component diagram (ASCII), Data flow, Trade-offs. Start with placeholders; **the user fills this**.
   - `docs/decision-log.md` — table: `Date | Decision | Alternatives considered | Rationale`. Pre-populate the first row: "Chose NestJS over Express because rubric requires visible module boundaries."
   - `docs/api-contract.md` — sections: Auth endpoints, Games endpoints, WebSocket events, Error format. Leave TBD; the DB + backend prompts will fill this in.

8. **Root `README.md`** with:
   - Project name + one-line description
   - Prerequisites list
   - `docker compose up -d` then `cd backend && npm run start:dev` then `cd frontend && npm run dev`
   - Ports: backend 3000, frontend 5173, pgAdmin 5050

9. **Git initialise and commit** at root:
   ```bash
   git init
   git add .
   git commit -m "chore: initial scaffold (backend, frontend, infra, docs)"
   ```

### Acceptance checks (print each result)

- [ ] `docker compose -f infra/docker-compose.yml --env-file .env up -d` starts both Postgres and Redis healthy (`docker ps` shows both `healthy`).
- [ ] `cd backend && npm run start:dev` — NestJS boots on port 3000, `/` returns "Hello World!"
- [ ] `cd frontend && npm run dev` — Vite opens on 5173, default page loads.
- [ ] `npx prisma --version` works inside `backend/` (though no schema yet).
- [ ] `docs/` contains the three files; `decision-log.md` has one row.
- [ ] `git log --oneline` shows one commit.
- [ ] No `.env` file is tracked (`git status` clean).

### Stop and report

Print a table: task → done y/n → notes.
**Do NOT proceed to schema design until user says "continue".**

---

## 2. Database schema (Prisma + PostgreSQL)

**Goal:** A Prisma schema that supports the full arcade, migrations that apply cleanly, and a seed file with demo users.

### Tasks

1. **Design `backend/prisma/schema.prisma`** with these models (adjust minimally if justified):

   ```prisma
   model User {
     id           String   @id @default(uuid())
     username     String   @unique
     passwordHash String
     role         Role     @default(PLAYER)
     createdAt    DateTime @default(now())
     updatedAt    DateTime @updatedAt
     runs         Run[]
     refreshTokens RefreshToken[]
   }

   enum Role { PLAYER ADMIN }

   model RefreshToken {
     id         String   @id @default(uuid())
     userId     String
     user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)
     tokenHash  String   @unique
     expiresAt  DateTime
     revokedAt  DateTime?
     createdAt  DateTime @default(now())
     @@index([userId])
   }

   model Game {
     id        String  @id            // slug: snake, fruit-ninja, ...
     name      String
     category  String                 // fish, smile, tomato, banana
     type      GameType
     emoji     String
     runs      Run[]
   }

   enum GameType { PUZZLE SLASH SNAKE ARCADE }

   model Run {
     id         String   @id @default(uuid())
     userId     String
     user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)
     gameId     String
     game       Game     @relation(fields: [gameId], references: [id])
     score      Int
     attempts   Int
     correct    Int
     maxCombo   Int
     startedAt  DateTime
     finishedAt DateTime @default(now())
     @@index([userId, gameId, score(sort: Desc)])
     @@index([gameId, score(sort: Desc)])
   }
   ```

   **Why this design (add as a comment block at the top of the file):**
   - Normalised `Game` table so leaderboard filters are fast and games are data-driven.
   - `Run` holds every finished game (audit trail).
   - `RefreshToken` supports rotation + revocation (video talking point).
   - `@@index` on `(gameId, score DESC)` powers the leaderboard query.

2. **Migrate**:
   ```bash
   cd backend
   npx prisma migrate dev --name init
   npx prisma generate
   ```

3. **Seed script** `backend/prisma/seed.ts`:
   - Upsert the 7 games with exact slugs matching the prototype:
     `snake, fruit-ninja, star-scraper, fish-count, banana-streak, tomato-rush, smile-cove`.
   - Create 3 demo users (`niwantha`, `user`, `player`) with password `1234`
     hashed via bcrypt rounds from env. Role = `PLAYER`.
   - Create 20 random `Run` records across users/games for the leaderboard demo.
   - Wire into `package.json`: `"prisma": { "seed": "ts-node prisma/seed.ts" }`.

4. **Create `backend/src/prisma/prisma.service.ts`** and `prisma.module.ts`:
   - `@Injectable()` service extending `PrismaClient` with `onModuleInit` connecting.
   - `@Global()` module exporting the service.

5. **Update `docs/api-contract.md`** with the resource shapes:
   ```
   POST /auth/register { username, password } → 201 { id, username, role }
   POST /auth/login    { username, password } → 200 { user } + Set-Cookie: access_token, refresh_token
   POST /auth/refresh                          → 200 { user } + rotated cookies
   POST /auth/logout                           → 204 (clears cookies, revokes refresh)
   GET  /auth/me                               → 200 { id, username, role }

   GET  /games                                 → 200 Game[]
   POST /games/:gameId/runs { score, attempts, correct, maxCombo, startedAt } → 201 Run
   GET  /leaderboard?gameId=…                  → 200 { rank, username, score }[]
   GET  /me/runs                               → 200 Run[]
   ```
   Also list WebSocket events (TBD placeholder — filled in Module 4).

6. **Update `docs/decision-log.md`** — append rows for:
   - "Chose PostgreSQL over MongoDB — relational queries for leaderboards, joins for runs/users"
   - "Chose Prisma over TypeORM — type safety, migration ergonomics"
   - "Refresh token rotation — revocation support without session store"

### Acceptance checks

- [ ] `npx prisma migrate status` shows "Database schema is up to date".
- [ ] `npx prisma studio` opens on 5555 and shows 3 users + 7 games + 20 runs.
- [ ] `docker exec -it <postgres-container> psql -U solveme -d solveme -c "\dt"` lists all tables.
- [ ] `docs/api-contract.md` has the endpoints listed above.
- [ ] `docs/decision-log.md` has ≥ 4 rows.

### Stop and report
Print: tables created, row counts, and the acceptance checklist. **Wait for "continue".**

---

## 3. Backend modules (Auth, FishApi, Games, Scores)

**Goal:** Fully working REST API implementing the contract. No frontend needed yet.

### Tasks (module by module — commit after each)

#### 3a. AuthModule — virtual identity theme

Files under `backend/src/auth/`:
- `auth.module.ts` — imports `JwtModule.registerAsync`, `PassportModule`
- `auth.controller.ts` — `register`, `login`, `refresh`, `logout`, `me`
- `auth.service.ts`
- `strategies/jwt-access.strategy.ts` — reads `access_token` cookie
- `strategies/jwt-refresh.strategy.ts`
- `guards/jwt-auth.guard.ts` — extends `AuthGuard('jwt-access')`
- `guards/roles.guard.ts` + `decorators/roles.decorator.ts` — RBAC
- `decorators/current-user.decorator.ts`
- `dto/register.dto.ts`, `dto/login.dto.ts` — `class-validator` rules

Behavioural requirements:
- **Register:** reject duplicate username (409), hash password with bcrypt (`BCRYPT_ROUNDS`).
- **Login:** compare hash; on success issue **access JWT (15 min)** and **refresh JWT (7 d)**, store **hashed refresh token** in `RefreshToken` table, set **both tokens as HttpOnly + SameSite=Strict + Secure-in-prod cookies**, return user DTO.
- **Refresh:** verify refresh cookie → rotate (revoke old, insert new) → set new cookies.
- **Logout:** revoke refresh token, clear cookies.
- **Me:** protected by `JwtAuthGuard`, returns current user.
- All controllers use `@UsePipes(ValidationPipe)`.

**Comment every file with a one-line "Why this exists" header** — the student will read these on camera.

#### 3b. FishApiModule — interoperability theme

Files under `backend/src/fish-api/`:
- `fish-api.module.ts` — imports `HttpModule.registerAsync` (timeout 5000, `maxRedirects: 0`)
- `fish-api.service.ts`
- `fish-api.controller.ts` — `GET /fish/puzzle?category=fish` (protected by `JwtAuthGuard`, used by frontend)
- `interfaces/fish-puzzle.interface.ts`

`FishApiService.getPuzzle(category)` must:
- Call `${FISH_API_URL}/${category}/api.php?out=csv&base64=yes&nocache=<ts>`.
- Response is **CSV**: `<base64Png>,<solutionNumber>` → parse and return `{ sol: number, image: string }`.
- **Retry 3× with exponential backoff** (300ms, 900ms, 2700ms) on network/5xx errors.
- **Timeout** 5s per attempt.
- Log every call: `{ category, attempt, ms, success }` with a UUID correlation ID (video talking point).
- Throw `BadGatewayException` after final failure.

#### 3c. GamesModule + ScoresModule

- `games.service.ts` — list games from DB (cached in Redis for 5 min).
- `runs.service.ts` — `createRun(userId, dto)`, `listUserRuns(userId)`, `leaderboard(gameId | 'all')` (query with Redis cache 30s, invalidated on new run).
- `games.controller.ts` — `GET /games`.
- `runs.controller.ts` — `POST /games/:gameId/runs`, `GET /me/runs`.
- `leaderboard.controller.ts` — `GET /leaderboard?gameId=…`.

#### 3d. Real-time events (if user says continue — otherwise Module 4)

Skip for now if user hasn't approved Module 4 yet.

### Acceptance checks
- [ ] `POST /auth/register` with curl returns 201, cookie set.
- [ ] `POST /auth/login` returns 200, **two** `Set-Cookie` headers visible in curl `-i`.
- [ ] `GET /auth/me` with cookies returns user; without cookies returns 401.
- [ ] `GET /fish/puzzle?category=fish` returns `{ sol, image }`.
- [ ] Force Fish API failure (change URL) → after 3 retries, `GET /fish/puzzle` returns 502 and server logs show `attempt=1,2,3`.
- [ ] `POST /games/snake/runs` inserts a row (verify via Prisma Studio).
- [ ] `GET /leaderboard?gameId=snake` returns users sorted DESC.
- [ ] `docs/decision-log.md` has entries for JWT-vs-session, HttpOnly-vs-localStorage, retry strategy.

### Stop and report
Show the **list of files created**, sample curl outputs, and the checklist. **Wait for "continue"**.

---

## 4. Real-time layer (event-driven theme)

**Goal:** Socket.IO gateway + event bus + SSE leaderboard.

### Tasks

1. **`EventEmitterModule.forRoot()`** in `AppModule`.
2. **`GameGateway`** (`backend/src/realtime/game.gateway.ts`):
   - `@WebSocketGateway({ cors: { origin: FRONTEND_URL, credentials: true } })`
   - Handshake: read JWT from cookie; reject unauth.
   - Events emitted *to* client: `score:updated`, `run:saved`, `leaderboard:changed`, `game:tick`.
   - Events received *from* client: `game:submit` — payload `{ gameId, score, attempts, correct, maxCombo, startedAt }`.
   - Handler delegates to `RunsService.createRun` then `eventEmitter.emit('run.created', run)`.
3. **`LeaderboardListener`** (`@OnEvent('run.created')`) → recompute leaderboard → `eventEmitter.emit('leaderboard.updated', payload)`.
4. **`LeaderboardSseController`** — `GET /sse/leaderboard` returns `text/event-stream`, subscribes to `leaderboard.updated`, pushes JSON.
5. Update `docs/api-contract.md` with the WebSocket event names and payloads.
6. Update `docs/decision-log.md`: "Socket.IO for gameplay (bidirectional, reconnection), SSE for leaderboard (one-way, simpler). Why not polling: battery + latency."

### Acceptance checks
- [ ] Socket.IO connects with valid cookie; rejects without.
- [ ] Emitting `game:submit` from the Socket.IO test client persists a run (verify in DB).
- [ ] `run.created` triggers `leaderboard:changed` broadcast.
- [ ] `curl -N http://localhost:3000/sse/leaderboard` prints updates when a run is created.
- [ ] `docs/decision-log.md` updated.

### Stop and report. Wait for "continue".

---

## 5. Frontend shell

**Goal:** React app skeleton with routing, auth context, API client, design system — **no games yet**.

### Tasks

1. **Folder structure** under `frontend/src/`:
   ```
   api/        http.ts, auth.api.ts, games.api.ts, fish.api.ts
   auth/       AuthContext.tsx, ProtectedRoute.tsx, LoginPage.tsx, RegisterPage.tsx
   dashboard/  Dashboard.tsx, StatsGrid.tsx, GameLibrary.tsx, Leaderboard.tsx, Achievements.tsx
   games/      (empty — populated in Module 7)
   events/     socket.ts, useGameEvents.ts
   store/      authStore.ts, gameStore.ts
   ui/         Button.tsx, Card.tsx, Modal.tsx, DotText.tsx
   styles/     index.css (Tailwind + your prototype CSS)
   App.tsx, main.tsx, router.tsx
   ```
2. **`api/http.ts`** — Axios instance at `VITE_API_URL`, `withCredentials: true`, response interceptor that on 401 tries `POST /auth/refresh` **once**, then retries.
3. **`auth/AuthContext.tsx`** — on mount calls `GET /auth/me`; exposes `user`, `login`, `register`, `logout`, `loading`.
4. **Routing** — `/` → login, `/dashboard` → protected, `/play/:gameId` → protected.
5. **Copy prototype CSS** into `styles/index.css`. Move SVG ship + emoji constants into `games/shared/assets.ts`.
6. **`ui/` components** — Button, Card, Modal, DotText — reuse your existing Tailwind classes exactly.
7. **`store/authStore.ts`** (Zustand) and `store/gameStore.ts` (skeleton).
8. **`events/socket.ts`** — `io(VITE_SOCKET_URL, { withCredentials: true, autoConnect: false })`. `useGameEvents.ts` — hook wiring socket events to gameStore.

### Acceptance checks
- [ ] `npm run dev` — login page renders with your prototype's styling.
- [ ] Register → redirected to dashboard with a welcome message showing the username.
- [ ] Refresh page → still logged in (cookie + `/auth/me`).
- [ ] Network tab shows `Set-Cookie` on login, and subsequent calls include the cookie.
- [ ] Logout → back to login, cookie cleared.

### Stop and report. Wait for "continue".

---

## 6. Migrate the 7 games from the HTML prototype

**Goal:** Port game logic from `solveme-arcade.html` into TypeScript modules, preserving visuals exactly.

**You must request the user paste the prototype HTML if not provided.**

### Per-game pattern (repeat 7×)

For each game create under `frontend/src/games/<slug>/`:
- `engine.ts` — pure TS, **zero React imports**, holds the game state and step/reduce logic. No `document`, no `window`.
- `renderer.ts` — pure TS, takes `CanvasRenderingContext2D` + engine state, draws. **No state mutation.**
- `<Name>Game.tsx` — React component that:
  - mounts a `<canvas>`,
  - calls `useGameLoop()` hook (create in `games/shared/`) which runs `requestAnimationFrame` and calls `engine.step(dt)` then `renderer.draw(ctx, engine.state)`,
  - handles input events (keyboard, pointer) and forwards to `engine`,
  - on game end calls `POST /games/:slug/runs` (via `games.api.ts`), **not** localStorage.
- `index.ts` — exports metadata `{ slug, name, emoji, category, type }`.

**Order of migration (easiest → hardest):**
1. `fish-count` (pure puzzle — proves the API+run flow)
2. `banana-streak`
3. `tomato-rush`
4. `smile-cove`
5. `snake`
6. `fruit-ninja`
7. `star-scraper`

**For every game, add a header comment:**
```ts
/**
 * Ported from solveme-arcade.html (student's original prototype, 2025).
 * Refactored into pure engine + renderer + React glue for rubric theme #1
 * (low coupling: engine knows nothing about React; high cohesion: all snake
 * logic lives here).
 */
```

### Wire up the game catalogue
- `games/registry.ts` exports `GAMES: GameMeta[]` consumed by dashboard.
- Router `/play/:slug` resolves the component from the registry.

### Update the Fish API path
- **Puzzles now call `GET /fish/puzzle?category=…` (your backend), NOT `marcconrad.com` directly.** This is critical for the interoperability rubric — the browser never talks to a third party.
- Update `api/fish.api.ts` accordingly.

### Acceptance checks
- [ ] All 7 tiles appear on dashboard.
- [ ] Each game is playable, visuals match the prototype.
- [ ] Finishing a game writes a `Run` to PostgreSQL (verify via Prisma Studio).
- [ ] Browser DevTools Network shows **zero** requests to `marcconrad.com` — all go to your backend.
- [ ] No `localStorage.setItem('solveme_users_v5', …)` calls remain.
- [ ] `docs/decision-log.md` has one row per game describing the refactor.

### Stop and report. Wait for "continue".

---

## 7. Final polish + demo prep

**Goal:** Everything works end-to-end; ready for the video.

### Tasks
- [ ] Add `Dockerfile` for backend (multi-stage, non-root user) and a `Dockerfile` for frontend (nginx static build).
- [ ] Add health endpoints `GET /health` (DB, Redis, Fish API ping).
- [ ] Add `infra/Makefile` with `make up`, `make down`, `make seed`, `make logs`.
- [ ] Add **one happy-path test per module** using Jest + Supertest (auth, fish-api with mocked axios, runs).
- [ ] Root `README.md` final pass: setup, run, seed, tests.
- [ ] `docs/architecture.md` final pass: overview, module list, event flow, trade-offs.
- [ ] `docs/decision-log.md` final pass: ≥ 10 rows covering all four themes.
- [ ] Record a **dry-run 2-min demo** to verify screen flow for the actual video.

### Acceptance checks
- [ ] `docker compose up -d` → `cd backend && npm run start:dev` → `cd frontend && npm run dev` — everything loads.
- [ ] Demo flow works: register → play 3 games → see scores → see leaderboard update live.
- [ ] `npm test` passes in backend.
- [ ] `git log` shows ≥ 12 meaningful commits.

### Final report
Print a **rubric-to-code map** the student can narrate:

| Rubric theme | Files to open in video |
|---|---|
| Low coupling | `backend/src/auth/auth.module.ts`, `frontend/src/games/snake/engine.ts` |
| Event-driven | `backend/src/realtime/game.gateway.ts`, `frontend/src/events/useGameEvents.ts` |
| Interoperability | `backend/src/fish-api/fish-api.service.ts`, `frontend/src/api/fish.api.ts` |
| Virtual identity | `backend/src/auth/auth.service.ts`, `backend/src/auth/strategies/jwt-access.strategy.ts` |

**You are done. Announce it and wait.**

---

## ⚠️ Global reminders for the agent

- **Commit after each module** with a descriptive message.
- **Never skip the acceptance checks** — the user relies on them.
- **If a tool is missing, stop** and tell the user what to install.
- **If the Fish API is down during development**, mock it in `FishApiService` behind a `FISH_API_MOCK=true` env flag — but always keep the real path the default.
- **You are being recorded** — the code you write will be read on camera. Keep it clean, commented, and modular.