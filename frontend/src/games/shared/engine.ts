/**
 * Why this exists: the rules every action game shares (score, combo, lives,
 * countdown, pause, particles, floating text) so each game's engine only
 * contains what makes that game different. Pure TypeScript: no React, no DOM.
 * Ported from solveme-arcade.html; restructured with an LLM (Claude Code).
 */
import { between } from './math';
import type { Hud, Particle, Pop, RunStats, SoundCue } from './types';

export interface BaseState {
  time: number; // seconds of play, paused time excluded
  score: number;
  combo: number;
  maxCombo: number;
  correct: number;
  attempts: number;
  lives: number;
  maxLives: number;
  over: boolean;
  paused: boolean;
  countdown: number; // seconds left of "3, 2, 1, GO"
  shake: number;
  flash: number;
  pop: Pop | null;
  particles: Particle[];
}

export function baseState(lives: number, countdown: number): BaseState {
  return {
    time: 0, score: 0, combo: 1, maxCombo: 1, correct: 0, attempts: 0,
    lives, maxLives: lives, over: false, paused: false, countdown,
    shake: 0, flash: 0, pop: null, particles: [],
  };
}

export abstract class BaseEngine<S extends BaseState> {
  readonly state: S;
  private readonly popFadePerFrame: number;
  private sounds: SoundCue[] = [];

  protected constructor(state: S, popFadePerFrame: number) {
    this.state = state;
    this.popFadePerFrame = popFadePerFrame;
  }

  /** Advances the game by dt seconds. Called once per animation frame. */
  step(dt: number): void {
    const s = this.state;
    if (s.over || s.paused) return;

    // The prototype was tuned per 60 fps frame; k keeps speeds equal at any frame rate.
    const k = dt * 60;
    s.time += dt;
    s.shake = Math.max(0, s.shake - dt);
    s.flash = Math.max(0, s.flash - dt);

    for (const p of s.particles) {
      p.x += p.vx * k;
      p.y += p.vy * k;
      p.life -= 0.03 * k;
    }
    s.particles = s.particles.filter((p) => p.life > 0);

    if (s.pop) {
      s.pop.alpha -= this.popFadePerFrame * k;
      if (s.pop.alpha <= 0) s.pop = null;
    }

    this.update(dt);
  }

  /** The game-specific part of a frame. */
  protected abstract update(dt: number): void;

  togglePause(): void {
    const s = this.state;
    if (s.over || s.countdown > 0) return;
    s.paused = !s.paused;
  }

  hud(): Hud {
    const { score, combo, lives } = this.state;
    return { score, combo: Math.min(combo, 5), lives };
  }

  stats(): RunStats {
    const { score, attempts, correct, maxCombo } = this.state;
    return { score, attempts, correct, maxCombo };
  }

  /** Hands over the sounds requested since the last call. */
  drainSounds(): SoundCue[] {
    const cues = this.sounds;
    this.sounds = [];
    return cues;
  }

  protected sound(cue: SoundCue): void {
    this.sounds.push(cue);
  }

  protected end(): void {
    this.state.over = true;
  }

  protected showPop(text: string, x: number, y: number): void {
    this.state.pop = { text, x, y, alpha: 1 };
  }

  /** A ring of particles flying out from one point. */
  protected burst(x: number, y: number, color: string, count: number, speed: number): void {
    for (let i = 0; i < count; i++) {
      const angle = between(0, Math.PI * 2);
      const v = between(1, speed);
      this.state.particles.push({
        x, y, vx: Math.cos(angle) * v, vy: Math.sin(angle) * v,
        life: 1, color, r: between(2, 4.5),
      });
    }
  }
}
