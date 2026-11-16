/**
 * Why this exists: arcade-style menus. Arrow keys (or a gamepad) move focus
 * around a grid of buttons; Enter presses the focused one (native button
 * behaviour). With `grabFocus`, the first arrow press on an empty page jumps
 * into the grid, so the dashboard works without a mouse.
 * Drafted with an LLM (Claude Code).
 */
import { useEffect } from 'react';
import type { KeyboardEvent, RefObject } from 'react';
import { blip } from '../games/shared/audio';

const MOVES: Record<string, (columns: number) => number> = {
  ArrowLeft: () => -1,
  ArrowRight: () => 1,
  ArrowUp: (columns) => -columns,
  ArrowDown: (columns) => columns,
};

function items(grid: HTMLElement): HTMLElement[] {
  return [...grid.querySelectorAll<HTMLElement>('button:not([disabled])')];
}

function columnCount(grid: HTMLElement): number {
  return getComputedStyle(grid).gridTemplateColumns.split(' ').filter(Boolean).length || 1;
}

export function useGridNav(gridRef: RefObject<HTMLElement | null>, grabFocus = false) {
  useEffect(() => {
    if (!grabFocus) return;
    const onKey = (event: globalThis.KeyboardEvent) => {
      const grid = gridRef.current;
      const idle = document.activeElement === document.body || document.activeElement === null;
      if (!grid || !idle || !(event.key in MOVES)) return;
      event.preventDefault();
      items(grid)[0]?.focus();
      blip();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [gridRef, grabFocus]);

  /** Put this on the grid element. */
  return (event: KeyboardEvent<HTMLElement>) => {
    const grid = gridRef.current;
    const move = MOVES[event.key];
    if (!grid || !move) return;
    const list = items(grid);
    const current = list.indexOf(document.activeElement as HTMLElement);
    if (current < 0) return;
    const next = current + move(columnCount(grid));
    if (next < 0 || next >= list.length) return;
    event.preventDefault();
    list[next].focus();
    blip();
  };
}
