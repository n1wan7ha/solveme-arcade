# Demo script (10 minutes)

A plan for the video. Timings are a guide; rehearse once with a 2-minute dry run of the screen flow first.

## Before you record

- Start Docker Desktop, then `docker compose -f infra/docker-compose.yml --env-file .env up -d`.
- Re-seed for clean data: `cd backend && npx prisma db seed`.
- Start the backend (`npm run start:dev`) and the frontend (`npm run dev`).
- Open two browser windows side by side: a normal one and a private one.
- In VS Code, open the files listed below as tabs, in order.
- Have a terminal ready in `backend/`.

## 0:00 – 1:00 · What it is

- Log in as `niwantha` / `1234`. Show the dashboard: level, stats, game library, achievements, rankings.
- One sentence on the stack: React talks only to a NestJS API; the API talks to PostgreSQL, Redis and the Fish Game API.
- Show the diagram in `docs/architecture.md`.

## 1:00 – 3:00 · Low coupling, high cohesion

- `backend/src/app.module.ts`: each feature is one module.
- `backend/src/auth/auth.module.ts`: other modules only import `JwtAuthGuard`; they never see tokens or passwords.
- `frontend/src/games/snake/engine.ts` next to `renderer.ts`: the engine has no React, DOM or `window`; the renderer only reads state.
- `frontend/src/games/shared/useGameLoop.ts`: each frame calls `engine.step(dt)` then `draw(ctx, state)`.
- `frontend/src/games/fish-count/rules.ts`: four puzzle games, one engine, and each game is just its rules.
- Play 20 seconds of Snake.

## 3:00 – 5:00 · Event-driven programming

- Log in as `player` in the private window. Point at "LIVE · 2 online".
- In the first window, play Fish Count until it ends. In the second window the rankings and the score feed update with no reload.
- Code walk: `backend/src/scores/runs.service.ts` emits `run.created` → `backend/src/realtime/leaderboard.listener.ts` recomputes and emits `leaderboard.updated` → `backend/src/realtime/game.gateway.ts` broadcasts → `frontend/src/events/useGameEvents.ts` updates the store. None of them call each other directly.
- Terminal: `curl -N http://localhost:3000/sse/leaderboard`, then finish another game and watch the event arrive.

## 5:00 – 7:00 · Interoperability

- `backend/src/fish-api/fish-api.service.ts`: URL building, CSV parsing, retries with backoff, correlation-ID logging, 502 on failure.
- Browser DevTools, Network tab: start a puzzle and filter for `marcconrad`. There are zero requests; everything goes to `/fish/puzzle`.
- Show the backend log lines for one puzzle (`correlationId`, `attempt`, `ms`, `success`).
- Failure demo: stop the backend, start it with `FISH_API_URL=https://marcconrad.invalid/uob npm run start:dev`, request a puzzle, and show attempts 1 to 4 with growing gaps, then the 502. Restart it normally afterwards.
- `GET http://localhost:3000/health`, then `docker stop solveme_redis`: the status becomes "degraded" and the leaderboard still loads. Run `docker start solveme_redis`.

## 7:00 – 9:00 · Virtual identity

- `backend/src/auth/auth.service.ts`: bcrypt, two tokens with separate secrets, a SHA-256 hash stored, rotation in one atomic update.
- DevTools, Application tab, Cookies: `access_token` and `refresh_token` are `HttpOnly` and `SameSite=Strict`; in the Console, `document.cookie` cannot see them.
- `backend/src/auth/strategies/jwt-access.strategy.ts`: the token is read from the cookie.
- `frontend/src/api/http.ts`: on a 401, one shared refresh, then the request is retried.
- Delete the `access_token` cookie and reload: still signed in, with a single `/auth/refresh` in the Network tab.
- Log out: the cookies are gone, and `/dashboard` redirects to the login page.

## 9:00 – 10:00 · Quality and wrap-up

- `cd backend && npm test`: 6 tests pass.
- `docs/decision-log.md`: every decision with its alternatives.
- One honest limitation: scores are reported by the browser (see Trade-offs in `docs/architecture.md`).
