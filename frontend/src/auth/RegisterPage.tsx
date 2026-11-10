/**
 * Why this exists: the "/register" route.
 * Drafted with an LLM (Claude Code).
 */
import { AuthForm } from './AuthForm';

export function RegisterPage() {
  return <AuthForm mode="register" />;
}
