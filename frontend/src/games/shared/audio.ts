/**
 * Why this exists: the prototype's tiny WebAudio synth. It turns the engines'
 * sound cues into beeps, and is the only game code that touches browser audio.
 * Ported from snd(), good() and bad() in solveme-arcade.html.
 */
import type { SoundCue } from './types';

let muted = false;
let audio: AudioContext | undefined;

export const isMuted = () => muted;

export function toggleMute(): boolean {
  muted = !muted;
  return muted;
}

function tone(frequency: number, duration = 0.12, wave: OscillatorType = 'sine', volume = 0.07): void {
  if (muted) return;
  try {
    audio ??= new AudioContext();
    const oscillator = audio.createOscillator();
    const gain = audio.createGain();
    oscillator.type = wave;
    oscillator.frequency.value = frequency;
    gain.gain.value = volume;
    oscillator.connect(gain);
    gain.connect(audio.destination);
    oscillator.start();
    gain.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + duration);
    oscillator.stop(audio.currentTime + duration);
  } catch {
    // Some browsers block audio until the user interacts; sound is optional.
  }
}

const good = () => {
  tone(660, 0.1, 'triangle');
  setTimeout(() => tone(880, 0.14, 'triangle'), 70);
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
