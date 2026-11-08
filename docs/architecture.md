# Architecture

## Overview

SolveMe Arcade is a full-stack mini-game platform consisting of a NestJS backend,
a React frontend, and PostgreSQL + Redis infrastructure.

## Component Diagram (ASCII)

```
┌─────────────────────────────────────────────────┐
│                  Browser (React)                 │
│  ┌──────────┐  ┌──────────┐  ┌───────────────┐  │
│  │ AuthCtx  │  │  Games   │  │  Leaderboard  │  │
│  └────┬─────┘  └────┬─────┘  └──────┬────────┘  │
│       │ REST        │ REST          │ SSE/WS     │
└───────┼─────────────┼───────────────┼────────────┘
        │             │               │
┌───────▼─────────────▼───────────────▼────────────┐
│                 NestJS Backend                    │
│  ┌──────────┐  ┌──────────┐  ┌───────────────┐   │
│  │ AuthMod  │  │ GamesMod │  │  RealtimeMod  │   │
│  └────┬─────┘  └────┬─────┘  └──────┬────────┘   │
│       │             │  ┌──────────┐  │            │
│       │             │  │FishApiMod│  │            │
│       │             │  └────┬─────┘  │            │
└───────┼─────────────┼───────┼─────────┼────────────┘
        │             │       │          │
   ┌────▼────┐   ┌────▼────┐  │      ┌───▼────┐
   │Postgres │   │ Redis   │  │      │Socket  │
   └─────────┘   └─────────┘  │      └────────┘
                               │
                     marcconrad.com/uob/fish
```

## Data Flow

1. User logs in → AuthModule issues JWT in HttpOnly cookie
2. User starts a game → frontend fetches puzzle via `GET /fish/puzzle?category=…`
3. FishApiModule calls Fish Game API, retries on failure, returns `{ sol, image }`
4. User submits answer → `game:submit` Socket.IO event → RunsService saves to Postgres
5. `run.created` event → LeaderboardListener recomputes → `leaderboard:changed` broadcast

## Trade-offs

<!-- The student fills this in during Module 7 -->
- TBD

