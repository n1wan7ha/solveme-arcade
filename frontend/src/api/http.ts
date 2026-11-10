/**
 * Why this exists: the one HTTP client for the backend. It sends the auth
 * cookies with every request and quietly renews an expired session once
 * before giving up.
 * Drafted with an LLM (Claude Code).
 */
import axios from 'axios';
import type { AxiosError, InternalAxiosRequestConfig } from 'axios';

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, // send the HttpOnly cookies cross-origin
});

// A 401 from these is a real answer, not an expired session.
const AUTH_ROUTES = ['/auth/login', '/auth/register', '/auth/refresh', '/auth/logout'];

let refreshInFlight: Promise<void> | null = null;
let onSessionExpired: () => void = () => {};

/** The auth layer registers what to do when the session cannot be renewed. */
export function setSessionExpiredHandler(handler: () => void): void {
  onSessionExpired = handler;
}

/**
 * Refresh tokens rotate, so each one works only once. Requests that hit a 401
 * at the same moment therefore share a single refresh call.
 */
export function refreshSession(): Promise<void> {
  refreshInFlight ??= http
    .post('/auth/refresh')
    .then(() => undefined)
    .catch((error: unknown) => {
      onSessionExpired();
      throw error;
    })
    .finally(() => {
      refreshInFlight = null;
    });
  return refreshInFlight;
}

type RetryableConfig = InternalAxiosRequestConfig & { _retried?: boolean };

http.interceptors.response.use(undefined, async (error: AxiosError) => {
  const config = error.config as RetryableConfig | undefined;
  const isAuthRoute = AUTH_ROUTES.some((route) => config?.url?.startsWith(route));

  if (error.response?.status !== 401 || !config || config._retried || isAuthRoute) {
    throw error;
  }

  config._retried = true; // retry once only, so this can never loop
  await refreshSession();
  return http(config);
});

/** Turns a backend error into one readable sentence for the UI. */
export function apiErrorMessage(error: unknown): string {
  if (axios.isAxiosError<{ message?: string | string[] }>(error)) {
    const message = error.response?.data?.message;
    if (Array.isArray(message)) return message.join(', ');
    if (message) return message;
    if (!error.response) return 'Cannot reach the server. Is the backend running?';
  }
  return 'Something went wrong. Please try again.';
}
