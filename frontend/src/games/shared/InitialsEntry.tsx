/**
 * Why this exists: the classic arcade "ENTER YOUR INITIALS" after a new high
 * score. Up / down rolls the letter, left / right picks the slot, typing a
 * letter sets it, Enter signs the table (PATCH /me/initials). The ▲ ▼ buttons
 * do the same on touch screens. Works with a gamepad through useGamepad.
 * Drafted with an LLM (Claude Code).
 */
import { useEffect, useState } from 'react';
import { gamesApi } from '../../api/games.api';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../../ui/Button';
import { blip, coin } from './audio';
import { PixelIcon } from '../../ui/PixelIcon';

const A = 'A'.charCodeAt(0);
const roll = (letter: string, by: number) => String.fromCharCode(A + ((letter.charCodeAt(0) - A + by + 26) % 26));

/** Saved initials, else the first three letters of the username. */
function startingLetters(username: string, saved?: string | null): string[] {
  const source = (saved ?? username.toUpperCase().replace(/[^A-Z]/g, '')).padEnd(3, 'A');
  return source.slice(0, 3).split('');
}

type SaveState = 'editing' | 'saving' | 'error';

export function InitialsEntry({ onDone }: { onDone: () => void }) {
  const user = useAuthStore((state) => state.user);
  const storeInitials = useAuthStore((state) => state.setInitials);
  const [letters, setLetters] = useState(() => startingLetters(user?.username ?? '', user?.initials));
  const [slot, setSlot] = useState(0);
  const [save, setSave] = useState<SaveState>('editing');

  const change = (index: number, by: number) => {
    setLetters((current) => current.map((letter, i) => (i === index ? roll(letter, by) : letter)));
    setSlot(index);
    blip();
  };

  async function confirm() {
    const initials = letters.join('');
    setSave('saving');
    try {
      storeInitials(await gamesApi.setInitials(initials));
      coin();
      onDone();
    } catch {
      setSave('error');
    }
  }

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const { key } = event;
      if (key === 'ArrowUp') change(slot, 1);
      else if (key === 'ArrowDown') change(slot, -1);
      else if (key === 'ArrowLeft') setSlot((s) => Math.max(0, s - 1));
      else if (key === 'ArrowRight') setSlot((s) => Math.min(2, s + 1));
      else if (/^[a-z]$/i.test(key)) {
        setLetters((current) => current.map((letter, i) => (i === slot ? key.toUpperCase() : letter)));
        setSlot((s) => Math.min(2, s + 1));
        blip();
      } else if (key === 'Enter') void confirm();
      else if (key === 'Escape') onDone();
      else return;
      event.preventDefault();
      event.stopImmediatePropagation(); // the result screen must not also act on these keys
    };
    window.addEventListener('keydown', onKey, { capture: true });
    return () => window.removeEventListener('keydown', onKey, { capture: true });
  });

  return (
    <div className="text-center">
      <p className="pixel text-[0.6rem] c-red blink">NEW HIGH SCORE!</p>
      <p className="pixel text-xs mt-2">ENTER YOUR INITIALS</p>

      <div className="flex justify-center gap-3 mt-4">
        {letters.map((letter, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <button type="button" aria-label={`Letter ${i + 1} up`} className="pixel text-xs px-3 py-1 cursor-pointer hover:text-[var(--red)]" onClick={() => change(i, 1)}>
              <PixelIcon name="up" size={18} />
            </button>
            <button
              type="button"
              aria-label={`Letter ${i + 1}: ${letter}`}
              onClick={() => setSlot(i)}
              className={`pixel text-3xl w-16 h-16 grid place-items-center border-4 border-[var(--ink)] cursor-pointer ${
                i === slot ? 'bg-[var(--blue)] c-white' : 'bg-[var(--white)] c-ink'
              }`}
            >
              {letter}
            </button>
            <button type="button" aria-label={`Letter ${i + 1} down`} className="pixel text-xs px-3 py-1 cursor-pointer hover:text-[var(--red)]" onClick={() => change(i, -1)}>
              <PixelIcon name="down" size={18} />
            </button>
          </div>
        ))}
      </div>

      <div className="flex gap-2 justify-center mt-4">
        <Button onClick={() => void confirm()} disabled={save === 'saving'}>
          {save === 'saving' ? 'SAVING…' : <>SIGN<PixelIcon name="play" className="ml-2" /></>}
        </Button>
        <Button variant="secondary" onClick={onDone}>SKIP</Button>
      </div>
      {save === 'error' && <p className="pixel text-[0.5rem] c-red mt-3">COULD NOT SAVE. PRESS SIGN TO RETRY.</p>}
      <p className="text-xs muted mt-3">Up / down to change · left / right to move · type letters · Enter to sign</p>
    </div>
  );
}
