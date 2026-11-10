/**
 * Why this exists: text in the dot-matrix arcade font, as any heading or span.
 * Drafted with an LLM (Claude Code).
 */
import type { ElementType, ReactNode } from 'react';

interface DotTextProps {
  as?: ElementType;
  className?: string;
  children: ReactNode;
}

export function DotText({ as: Tag = 'span', className = '', children }: DotTextProps) {
  return <Tag className={`dot ${className}`}>{children}</Tag>;
}
