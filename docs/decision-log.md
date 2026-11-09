# Decision Log

| Date | Decision | Alternatives considered | Rationale |
|------|----------|------------------------|-----------|
| 2026-11-08 | Chose NestJS over Express | Express, Fastify | Rubric requires visible module boundaries; NestJS enforces them via `@Module()` decorator system |
| 2026-11-09 | Chose PostgreSQL over MongoDB | MongoDB | Relational queries suit leaderboards; joins connect runs to users and games |
| 2026-11-09 | Chose Prisma over TypeORM | TypeORM | Type safety and migration ergonomics |
| 2026-11-09 | Pinned Prisma to 5.22 | Prisma 8.0.0-rc.33 (scaffold default) | Stable release instead of a release candidate; keeps the classic `url = env(...)` datasource |
| 2026-11-09 | Refresh token rotation, stored as SHA-256 hashes | Stateless refresh JWTs, server-side session store, bcrypt-hashed tokens | Revocation without a session store. SHA-256 is deterministic so the `@unique` column can be looked up; bcrypt salts each hash and truncates input at 72 bytes, which is unsuitable for long JWTs |
| 2026-11-09 | Kept NestJS 12 and Vitest from the scaffold | Downgrade to NestJS 10 and Jest as first planned | The installed versions work and are maintained; downgrading adds risk without changing the module architecture |
| 2026-11-09 | JWT access tokens instead of server sessions | Session store in Redis | Requests are verified from the signature with no lookup; the database-backed refresh token still allows revocation |
| 2026-11-09 | HttpOnly SameSite=Strict cookies instead of localStorage | localStorage with a Bearer header | Browser JavaScript cannot read the tokens, which limits XSS theft; SameSite=Strict stops them being sent cross-site |

