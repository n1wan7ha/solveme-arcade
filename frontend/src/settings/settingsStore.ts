/**
 * Why this exists: the player's cabinet switches (sound, music, screen
 * effects). They are per-device conveniences, so they live in localStorage,
 * and the app still works when storage is blocked (private windows).
 * Drafted with an LLM (Claude Code).
 */
import { create } from 'zustand';

interface Settings {
  sound: boolean; // sound effects
  music: boolean; // background beat
  screenFx: boolean; // CRT scanlines and power-on effect
}

interface SettingsState extends Settings {
  toggle: (key: keyof Settings) => void;
}

const STORAGE_KEY = 'solveme.settings';
const DEFAULTS: Settings = { sound: true, music: true, screenFx: true };

function load(): Settings {
  try {
    return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') };
  } catch {
    return DEFAULTS;
  }
}

function save(settings: Settings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // Storage blocked: the switch still works for this visit.
  }
}

/** CSS reads this attribute to turn the scanlines off. */
const applyScreenFx = (on: boolean) => document.documentElement.setAttribute('data-fx', on ? 'on' : 'off');

export const useSettings = create<SettingsState>()((set, get) => {
  const initial = load();
  applyScreenFx(initial.screenFx);
  return {
    ...initial,
    toggle: (key) => {
      set({ [key]: !get()[key] } as Partial<Settings>);
      const { sound, music, screenFx } = get();
      save({ sound, music, screenFx });
      applyScreenFx(screenFx);
    },
  };
});
