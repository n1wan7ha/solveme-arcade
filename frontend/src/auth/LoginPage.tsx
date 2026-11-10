/**
 * Why this exists: the "/" route.
 * Drafted with an LLM (Claude Code).
 */
import { AuthForm } from './AuthForm';

export function LoginPage() {
  return <AuthForm mode="login" />;
}
