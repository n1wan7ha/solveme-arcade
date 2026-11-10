/**
 * Why this exists: tells TypeScript which VITE_* variables exist, so a typo in
 * an environment variable name is a compile error.
 * Drafted with an LLM (Claude Code).
 */
interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_SOCKET_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
