/**
 * Why this exists: the prototype's two button styles, red "btn" and white
 * "btn2", as one component.
 * Drafted with an LLM (Claude Code).
 */
import type { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
}

export function Button({ variant = 'primary', className = '', type = 'button', ...props }: ButtonProps) {
  const style = variant === 'primary' ? 'btn' : 'btn2';
  return <button type={type} className={`${style} ${className}`} {...props} />;
}
