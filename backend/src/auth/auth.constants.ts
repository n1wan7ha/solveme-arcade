/**
 * Why this exists: one source of truth for the auth cookie names and the
 * refresh cookie's path, shared by the controller and the Passport strategies.
 * Drafted with an LLM (Claude Code).
 */
export const ACCESS_COOKIE = 'access_token';
export const REFRESH_COOKIE = 'refresh_token';

// The browser only sends the refresh token to /auth/*, so it is not exposed on
// every API call.
export const REFRESH_COOKIE_PATH = '/auth';
