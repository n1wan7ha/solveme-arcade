/**
 * Why this exists: names the shapes that move through the auth flow, so the
 * JWT contents and the public user DTO are defined in one place.
 * Drafted with an LLM (Claude Code).
 */
import type { Role } from '@prisma/client';

/** Public user data. Never includes the password hash. */
export interface AuthUser {
  id: string;
  username: string;
  role: Role;
}

/** Claims inside the short-lived access JWT. */
export interface AccessTokenPayload {
  sub: string;
  username: string;
  role: Role;
}

/** Claims inside the refresh JWT. jti makes every token unique. */
export interface RefreshTokenPayload {
  sub: string;
  jti: string;
}

/** What jwt-refresh.strategy.ts attaches to req.user. */
export interface RefreshPrincipal {
  id: string;
  refreshToken: string;
}

/** A signed-in user plus the tokens the controller must put in cookies. */
export interface AuthSession {
  user: AuthUser;
  accessToken: string;
  accessExpiresAt: Date;
  refreshToken: string;
  refreshExpiresAt: Date;
}
