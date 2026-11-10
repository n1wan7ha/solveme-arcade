/**
 * Why this exists: the prototype's stat numbers that count up from zero.
 * Ported from the student's prototype; React version drafted with an LLM (Claude Code).
 */
import { useEffect, useState } from 'react';

const DURATION_MS = 800;

export function CountUp({ to, suffix = '' }: { to: number; suffix?: string }) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let frame = 0;
    const start = performance.now();
    const step = (now: number) => {
      const progress = Math.min(1, (now - start) / DURATION_MS);
      setValue(Math.round(to * (1 - (1 - progress) ** 3))); // ease-out
      if (progress < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [to]);

  return <>{value}{suffix}</>;
}
