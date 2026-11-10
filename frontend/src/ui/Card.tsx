/**
 * Why this exists: the white, thick-bordered card with a hard shadow.
 * Drafted with an LLM (Claude Code).
 */
import type { HTMLAttributes } from 'react';

export function Card({ className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`card ${className}`} {...props} />;
}
