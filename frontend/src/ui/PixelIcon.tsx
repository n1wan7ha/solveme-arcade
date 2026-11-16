/**
 * Why this exists: draws one icon from ui/icons.ts as a crisp SVG. Each run
 * of same-coloured pixels in a row becomes one rect, so an icon is a few
 * dozen shapes. Decorative by default; pass `label` when the icon is the only
 * thing that says what a button does.
 * Drafted with an LLM (Claude Code).
 */
import type { CSSProperties } from 'react';
import { ICONS } from './icons';
import type { IconName } from './icons';

const COLOURS: Record<string, string> = {
  k: 'var(--ink)',
  r: 'var(--red)',
  b: 'var(--blue)',
  w: 'var(--white)',
  c: 'currentColor',
};

interface Run {
  x: number;
  y: number;
  width: number;
  fill: string;
}

function toRuns(rows: readonly string[]): Run[] {
  const runs: Run[] = [];
  rows.forEach((row, y) => {
    let x = 0;
    while (x < row.length) {
      const ch = row[x];
      let end = x + 1;
      while (end < row.length && row[end] === ch) end++;
      if (COLOURS[ch]) runs.push({ x, y, width: end - x, fill: COLOURS[ch] });
      x = end;
    }
  });
  return runs;
}

// Icons never change, so each is converted once.
const RUNS = Object.fromEntries(Object.entries(ICONS).map(([name, rows]) => [name, toRuns(rows)])) as Record<IconName, Run[]>;

interface PixelIconProps {
  name: IconName;
  /** CSS size, e.g. 24 or "1.25em". Defaults to the text size. */
  size?: number | string;
  className?: string;
  style?: CSSProperties;
  label?: string;
}

export function PixelIcon({ name, size = '1em', className = '', style, label }: PixelIconProps) {
  return (
    <svg
      viewBox="0 0 16 16"
      width={size}
      height={size}
      shapeRendering="crispEdges"
      className={`inline-block shrink-0 align-[-0.125em] ${className}`}
      style={style}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      {RUNS[name].map((run, i) => (
        <rect key={i} x={run.x} y={run.y} width={run.width} height={1} style={{ fill: run.fill }} />
      ))}
    </svg>
  );
}
