/**
 * Why this exists: lives shown as pixel hearts in the cabinet HUD, with a
 * spoken count for screen readers.
 * Drafted with an LLM (Claude Code).
 */
import { PixelIcon } from './PixelIcon';

export function Hearts({ count }: { count: number }) {
  const lives = Math.max(0, count);
  return (
    <span className="inline-flex gap-0.5 align-middle" role="img" aria-label={`${lives} lives`}>
      {lives === 0 ? '-' : Array.from({ length: lives }, (_, i) => <PixelIcon key={i} name="heart" size="1.1em" />)}
    </span>
  );
}
