/**
 * Why this exists: the arcade's tiny WebAudio synth and the only game code
 * that touches browser audio. It plays the engines' sound cues, the coin and
 * start jingles, and a chiptune bass loop whose tempo the game can raise.
 * Switches come from the settings store.
 * Ported from snd(), good() and bad() in solveme-arcade.html; jingles and
 * music drafted with an LLM (Claude Code).
 */
import { useSettings } from '../../settings/settingsStore';
import type { SoundCue } from './types';

let audio: AudioContext | undefined;

function context(): AudioContext | undefined {
  try {
    audio ??= new AudioContext();
    if (audio.state === 'suspended') void audio.resume();
    return audio;
  } catch {
    return undefined; // no audio support; sound is optional
  }
}

/** One note. `at` is seconds from now, so jingles can be scheduled precisely. */
function tone(frequency: number, duration = 0.12, wave: OscillatorType = 'sine', volume = 0.07, at = 0, force = false): void {
  if (!force && !useSettings.getState().sound) return;
  const ctx = context();
  if (!ctx) return;
  const start = ctx.currentTime + at;
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  oscillator.type = wave;
  oscillator.frequency.value = frequency;
  gain.gain.setValueAtTime(volume, start);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  oscillator.connect(gain);
  gain.connect(ctx.destination);
  oscillator.start(start);
  oscillator.stop(start + duration);
}

const good = () => {
  tone(660, 0.1, 'triangle');
  tone(880, 0.14, 'triangle', 0.07, 0.07);
};

export function play(cue: SoundCue): void {
  switch (cue.kind) {
    case 'good':
      return good();
    case 'bad':
      return tone(90, 0.35, 'sawtooth', 0.12);
    case 'gold':
      good();
      return tone(1100, 0.2, 'triangle');
    case 'slice':
      return tone(500 + Math.min(cue.combo, 8) * 40, 0.08, 'square', 0.05);
  }
}

/** A coin dropping into the slot: START, PLAY AGAIN. */
export function coin(): void {
  tone(988, 0.08, 'square', 0.05);
  tone(1319, 0.3, 'square', 0.05, 0.08);
}

/** Rising fanfare when a cabinet powers on. */
export function startJingle(): void {
  [523, 659, 784, 1047, 784, 1047].forEach((f, i) => tone(f, 0.12, 'square', 0.04, i * 0.09));
}

/** Short tick for menu moves (keyboard / gamepad / initials). */
export function blip(): void {
  tone(1200, 0.04, 'square', 0.03);
}

// ---------------------------------------------------------------------------
// Background music: a four-bar square-wave bass line with a hi-hat tick.
// A lookahead scheduler queues notes slightly ahead of time so the beat stays
// steady even when the game loop is busy.
// ---------------------------------------------------------------------------
const BASS = [110, 110, 165, 110, 147, 110, 165, 196, 98, 98, 147, 98, 131, 98, 147, 175];
const LOOKAHEAD_S = 0.12;
const TIMER_MS = 25;

let musicTimer: ReturnType<typeof setInterval> | undefined;
let nextNoteAt = 0;
let step = 0;
let bpm = 120;

export function setMusicTempo(next: number): void {
  bpm = Math.max(80, Math.min(220, next));
}

export function startMusic(): void {
  if (musicTimer) return;
  const ctx = context();
  if (!ctx) return;
  nextNoteAt = ctx.currentTime + 0.05;
  musicTimer = setInterval(() => {
    const { music } = useSettings.getState();
    while (nextNoteAt < ctx.currentTime + LOOKAHEAD_S) {
      const at = nextNoteAt - ctx.currentTime;
      if (music) {
        tone(BASS[step % BASS.length], 0.14, 'square', 0.025, at, true);
        if (step % 2 === 1) tone(7000, 0.02, 'square', 0.006, at, true); // hi-hat
      }
      nextNoteAt += 60 / bpm / 2; // eighth notes
      step++;
    }
  }, TIMER_MS);
}

export function stopMusic(): void {
  clearInterval(musicTimer);
  musicTimer = undefined;
  step = 0;
}
