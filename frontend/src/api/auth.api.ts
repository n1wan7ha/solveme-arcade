/**
 * Why this exists: typed wrappers for the /auth endpoints in docs/api-contract.md.
 * Drafted with an LLM (Claude Code).
 */
import { http } from './http';

export interface User {
  id: string;
  username: string;
  role: 'PLAYER' | 'ADMIN';
}

export interface Credentials {
  username: string;
  password: string;
}

export const authApi = {
  me: () => http.get<User>('/auth/me').then((res) => res.data),

  login: (credentials: Credentials) =>
    http.post<{ user: User }>('/auth/login', credentials).then((res) => res.data.user),

  register: (credentials: Credentials) =>
    http.post<User>('/auth/register', credentials).then((res) => res.data),

  logout: () => http.post('/auth/logout').then(() => undefined),
};
