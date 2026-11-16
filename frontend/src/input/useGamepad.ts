/**
 * Why this exists: lets a USB / Bluetooth gamepad drive the whole arcade. It
 * turns the D-pad, left stick and buttons into the same key presses the
 * keyboard sends, so menus and games need no gamepad-specific code.
 *   D-pad / stick -> arrow keys (held directions repeat)
 *   A             -> press the focused button, or Enter
 *   B             -> Escape
 *   Start         -> P (pause)
 * Drafted with an LLM (Claude Code).
 */
import { useEffect, useState } from 'react';

const STICK_DEADZONE = 0.5;
const REPEAT_DELAY_MS = 320;
const REPEAT_EVERY_MS = 110;

type Control = 'ArrowUp' | 'ArrowDown' | 'ArrowLeft' | 'ArrowRight' | 'A' | 'B' | 'Start';

function pressed(pad: Gamepad): Set<Control> {
  const down = new Set<Control>();
  const button = (i: number) => pad.buttons[i]?.pressed;
  const [x = 0, y = 0] = pad.axes;
  if (button(12) || y < -STICK_DEADZONE) down.add('ArrowUp');
  if (button(13) || y > STICK_DEADZONE) down.add('ArrowDown');
  if (button(14) || x < -STICK_DEADZONE) down.add('ArrowLeft');
  if (button(15) || x > STICK_DEADZONE) down.add('ArrowRight');
  if (button(0)) down.add('A');
  if (button(1)) down.add('B');
  if (button(9)) down.add('Start');
  return down;
}

/** Sends a key to whatever has focus, so React handlers and window listeners both see it. */
function sendKey(key: string): void {
  const target = document.activeElement ?? document.body;
  target.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
}

function fire(control: Control): void {
  if (control === 'A') {
    const focused = document.activeElement;
    if (focused instanceof HTMLButtonElement || focused instanceof HTMLAnchorElement) focused.click();
    else sendKey('Enter');
  } else if (control === 'B') sendKey('Escape');
  else if (control === 'Start') sendKey('p');
  else sendKey(control);
}

/** Returns true while a gamepad is connected. */
export function useGamepad(): boolean {
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    let frame = 0;
    const heldSince = new Map<Control, number>();
    const lastFired = new Map<Control, number>();

    const poll = (now: number) => {
      const pad = [...navigator.getGamepads()].find(Boolean);
      if (pad) {
        const down = pressed(pad);
        for (const control of down) {
          const since = heldSince.get(control);
          if (since === undefined) {
            heldSince.set(control, now);
            lastFired.set(control, now);
            fire(control);
          } else if (control.startsWith('Arrow') && now - since > REPEAT_DELAY_MS && now - (lastFired.get(control) ?? 0) > REPEAT_EVERY_MS) {
            lastFired.set(control, now);
            fire(control);
          }
        }
        for (const control of heldSince.keys()) if (!down.has(control)) heldSince.delete(control);
      }
      frame = requestAnimationFrame(poll);
    };

    const onConnect = () => {
      setConnected(true);
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(poll);
    };
    const onDisconnect = () => {
      if (![...navigator.getGamepads()].some(Boolean)) {
        setConnected(false);
        cancelAnimationFrame(frame);
      }
    };

    window.addEventListener('gamepadconnected', onConnect);
    window.addEventListener('gamepaddisconnected', onDisconnect);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('gamepadconnected', onConnect);
      window.removeEventListener('gamepaddisconnected', onDisconnect);
    };
  }, []);

  return connected;
}
