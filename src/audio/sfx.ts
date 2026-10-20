/**
 * Synthesised sound effects (Claude 1). jsfxr-style voices: an oscillator or noise source, a pitch slide, an ADSR-ish
 * envelope, an optional filter sweep and vibrato. Presets are data; `sfx(name, opts)` plays one with flood control
 * (the same preset at most `max` times per 60 ms) and optional stereo pan / distance attenuation.
 */
import { audio } from './engine';

type Wave = 'square' | 'triangle' | 'sawtooth' | 'sine' | 'noise';
interface Voice {
  wave: Wave;
  /** start / end frequency (Hz); noise uses them for the band-pass centre */
  f0: number; f1?: number;
  /** seconds */
  attack?: number; hold?: number; decay: number;
  vol?: number;
  /** low-pass sweep (Hz) */
  lp0?: number; lp1?: number;
  /** vibrato depth (Hz) / rate (Hz) */
  vib?: number; vibRate?: number;
  /** start offset (s) inside the preset */
  at?: number;
  /** square duty approximation via detuned pair (0 = off) */
  detune?: number;
}
type Preset = { voices: Voice[]; max?: number };

const P: Record<string, Preset> = {
  // ── UI ─────────────────────────────────────────────────────────────
  ui_hover: { voices: [{ wave: 'square', f0: 1800, decay: 0.025, vol: 0.06 }], max: 1 },
  ui_click: { voices: [{ wave: 'square', f0: 880, f1: 1320, decay: 0.06, vol: 0.12 }], max: 1 },
  ui_open: { voices: [{ wave: 'triangle', f0: 440, f1: 880, decay: 0.12, vol: 0.18 }, { wave: 'noise', f0: 3000, decay: 0.08, vol: 0.05 }] },
  ui_close: { voices: [{ wave: 'triangle', f0: 880, f1: 440, decay: 0.1, vol: 0.15 }] },
  ui_error: { voices: [{ wave: 'square', f0: 220, f1: 180, decay: 0.16, vol: 0.12 }, { wave: 'square', f0: 233, f1: 190, decay: 0.16, vol: 0.08 }] },
  blip: { voices: [{ wave: 'square', f0: 620, decay: 0.03, vol: 0.05 }], max: 1 },
  // ── combat: one timbre per school ─────────────────────────────────
  hit_physical: { voices: [{ wave: 'noise', f0: 900, decay: 0.09, vol: 0.32, lp0: 3000, lp1: 500 }, { wave: 'square', f0: 160, f1: 70, decay: 0.08, vol: 0.18 }], max: 3 },
  hit_ash: { voices: [{ wave: 'noise', f0: 1600, decay: 0.18, vol: 0.3, lp0: 5000, lp1: 900 }, { wave: 'sawtooth', f0: 240, f1: 90, decay: 0.14, vol: 0.12 }], max: 3 },
  hit_rime: { voices: [{ wave: 'triangle', f0: 2400, f1: 1800, decay: 0.14, vol: 0.18 }, { wave: 'noise', f0: 6000, decay: 0.07, vol: 0.12 }], max: 3 },
  hit_storm: { voices: [{ wave: 'sawtooth', f0: 1200, f1: 300, decay: 0.1, vol: 0.18, vib: 200, vibRate: 60 }, { wave: 'noise', f0: 4000, decay: 0.06, vol: 0.15 }], max: 3 },
  hit_radiance: { voices: [{ wave: 'sine', f0: 1320, decay: 0.22, vol: 0.18 }, { wave: 'sine', f0: 1980, decay: 0.18, vol: 0.1 }], max: 3 },
  hit_umbral: { voices: [{ wave: 'sawtooth', f0: 180, f1: 60, decay: 0.2, vol: 0.2, lp0: 1200, lp1: 200 }, { wave: 'noise', f0: 400, decay: 0.16, vol: 0.12 }], max: 3 },
  hit_verdant: { voices: [{ wave: 'triangle', f0: 520, f1: 260, decay: 0.12, vol: 0.2 }, { wave: 'noise', f0: 1200, decay: 0.05, vol: 0.12 }], max: 3 },
  hit_blade: { voices: [{ wave: 'square', f0: 2200, f1: 1600, decay: 0.07, vol: 0.12 }, { wave: 'noise', f0: 5000, decay: 0.06, vol: 0.2 }], max: 3 },
  hit_iron: { voices: [{ wave: 'square', f0: 120, f1: 50, decay: 0.16, vol: 0.24 }, { wave: 'noise', f0: 700, decay: 0.1, vol: 0.22, lp0: 2000, lp1: 300 }], max: 3 },
  hit_fist: { voices: [{ wave: 'sine', f0: 140, f1: 55, decay: 0.12, vol: 0.32 }, { wave: 'noise', f0: 1500, decay: 0.04, vol: 0.16 }], max: 3 },
  hit_hunt: { voices: [{ wave: 'triangle', f0: 900, f1: 200, decay: 0.08, vol: 0.18 }, { wave: 'noise', f0: 2500, decay: 0.05, vol: 0.14 }], max: 3 },
  hit_guile: { voices: [{ wave: 'noise', f0: 7000, decay: 0.05, vol: 0.2 }, { wave: 'square', f0: 1400, f1: 900, decay: 0.05, vol: 0.08 }], max: 3 },
  hit_song: { voices: [{ wave: 'triangle', f0: 784, decay: 0.16, vol: 0.16 }, { wave: 'triangle', f0: 988, decay: 0.16, vol: 0.12, at: 0.04 }], max: 3 },
  crit: { voices: [{ wave: 'square', f0: 1760, f1: 2640, decay: 0.08, vol: 0.12 }, { wave: 'noise', f0: 3000, decay: 0.12, vol: 0.18 }], max: 2 },
  block: { voices: [{ wave: 'square', f0: 2600, f1: 2400, decay: 0.12, vol: 0.12 }, { wave: 'triangle', f0: 3300, decay: 0.1, vol: 0.08 }], max: 2 },
  miss: { voices: [{ wave: 'noise', f0: 2000, f1: 800, decay: 0.1, vol: 0.08 }], max: 2 },
  heal: { voices: [{ wave: 'triangle', f0: 523, decay: 0.1, vol: 0.12 }, { wave: 'triangle', f0: 659, decay: 0.1, vol: 0.12, at: 0.06 }, { wave: 'triangle', f0: 784, decay: 0.16, vol: 0.12, at: 0.12 }], max: 2 },
  hurt: { voices: [{ wave: 'square', f0: 300, f1: 120, decay: 0.14, vol: 0.18 }, { wave: 'noise', f0: 800, decay: 0.1, vol: 0.16 }], max: 2 },
  cast: { voices: [{ wave: 'sawtooth', f0: 300, f1: 900, decay: 0.16, vol: 0.1, lp0: 800, lp1: 4000 }], max: 2 },
  dash: { voices: [{ wave: 'noise', f0: 600, f1: 2400, decay: 0.16, vol: 0.18, lp0: 600, lp1: 3000 }], max: 1 },
  telegraph: { voices: [{ wave: 'square', f0: 440, decay: 0.08, vol: 0.06 }, { wave: 'square', f0: 440, decay: 0.08, vol: 0.06, at: 0.12 }], max: 1 },
  enemy_die: { voices: [{ wave: 'square', f0: 400, f1: 80, decay: 0.2, vol: 0.14 }, { wave: 'noise', f0: 1200, decay: 0.18, vol: 0.14, lp0: 3000, lp1: 200 }], max: 2 },
  boss_die: { voices: [{ wave: 'sawtooth', f0: 220, f1: 40, decay: 1.2, vol: 0.22, lp0: 3000, lp1: 100 }, { wave: 'noise', f0: 600, decay: 1.0, vol: 0.2, lp0: 4000, lp1: 100 }] },
  boss_phase: { voices: [{ wave: 'sine', f0: 98, decay: 1.4, vol: 0.32 }, { wave: 'sine', f0: 147, decay: 1.2, vol: 0.16 }, { wave: 'noise', f0: 300, decay: 0.6, vol: 0.1 }] },
  downed: { voices: [{ wave: 'triangle', f0: 440, f1: 110, decay: 0.6, vol: 0.2 }] },
  revive: { voices: [{ wave: 'triangle', f0: 330, f1: 660, decay: 0.4, vol: 0.18 }, { wave: 'sine', f0: 990, decay: 0.3, vol: 0.08, at: 0.2 }] },
  death: { voices: [{ wave: 'square', f0: 392, decay: 0.25, vol: 0.14 }, { wave: 'square', f0: 330, decay: 0.25, vol: 0.14, at: 0.25 }, { wave: 'square', f0: 262, decay: 0.25, vol: 0.14, at: 0.5 }, { wave: 'triangle', f0: 196, decay: 1.2, vol: 0.2, at: 0.75 }] },
  // ── rewards / world ──────────────────────────────────────────────
  coin: { voices: [{ wave: 'square', f0: 1318, decay: 0.05, vol: 0.1 }, { wave: 'square', f0: 1760, decay: 0.12, vol: 0.1, at: 0.05 }], max: 2 },
  pickup: { voices: [{ wave: 'triangle', f0: 660, f1: 990, decay: 0.1, vol: 0.14 }], max: 2 },
  rare: { voices: [{ wave: 'triangle', f0: 880, decay: 0.12, vol: 0.12 }, { wave: 'triangle', f0: 1109, decay: 0.12, vol: 0.12, at: 0.08 }, { wave: 'triangle', f0: 1319, decay: 0.3, vol: 0.14, at: 0.16, vib: 8, vibRate: 6 }] },
  potion: { voices: [{ wave: 'sine', f0: 300, f1: 500, decay: 0.08, vol: 0.14 }, { wave: 'sine', f0: 360, f1: 600, decay: 0.08, vol: 0.12, at: 0.09 }, { wave: 'sine', f0: 420, f1: 700, decay: 0.1, vol: 0.1, at: 0.18 }] },
  levelup: { voices: [523, 659, 784, 1047].map((f, i): Voice => ({ wave: 'square', f0: f, decay: i === 3 ? 0.5 : 0.12, vol: 0.12, at: i * 0.09 })).concat([{ wave: 'triangle', f0: 262, decay: 0.7, vol: 0.18, at: 0 }]) },
  quest_start: { voices: [{ wave: 'triangle', f0: 587, decay: 0.12, vol: 0.14 }, { wave: 'triangle', f0: 880, decay: 0.25, vol: 0.14, at: 0.1 }] },
  quest_done: { voices: [392, 523, 659, 784, 1047].map((f, i): Voice => ({ wave: 'square', f0: f, decay: i === 4 ? 0.6 : 0.1, vol: 0.1, at: i * 0.08 })).concat([{ wave: 'triangle', f0: 196, decay: 0.8, vol: 0.16, at: 0.32 }]) },
  codex: { voices: [{ wave: 'sine', f0: 1046, decay: 0.3, vol: 0.1 }, { wave: 'sine', f0: 1568, decay: 0.4, vol: 0.06, at: 0.1 }] },
  waystone: { voices: [{ wave: 'sine', f0: 262, decay: 1.2, vol: 0.14 }, { wave: 'sine', f0: 392, decay: 1.2, vol: 0.1, at: 0.15 }, { wave: 'sine', f0: 523, decay: 1.4, vol: 0.1, at: 0.3, vib: 4, vibRate: 5 }] },
  door: { voices: [{ wave: 'noise', f0: 300, decay: 0.3, vol: 0.18, lp0: 800, lp1: 200 }, { wave: 'square', f0: 90, f1: 70, decay: 0.25, vol: 0.1 }] },
  trust_up: { voices: [{ wave: 'sine', f0: 880, decay: 0.12, vol: 0.1 }, { wave: 'sine', f0: 1320, decay: 0.25, vol: 0.1, at: 0.08 }] },
};

const lastPlayed = new Map<string, number[]>();

export interface SfxOpts { pan?: number; gain?: number; pitch?: number }

/** Play a preset. pan −1..1, gain 0..1 (distance), pitch multiplier. Unknown names are ignored. */
export function sfx(name: string, opts: SfxOpts = {}): void {
  const a = audio();
  const p = P[name];
  if (!a || !p || a.ctx.state !== 'running') return;
  const now = a.ctx.currentTime;
  const recent = (lastPlayed.get(name) ?? []).filter((t) => now - t < 0.06);
  if (recent.length >= (p.max ?? 4)) return;
  recent.push(now);
  lastPlayed.set(name, recent);
  const out = a.ctx.createGain();
  out.gain.value = opts.gain ?? 1;
  let tail: AudioNode = out;
  if (opts.pan) { const pan = a.ctx.createStereoPanner(); pan.pan.value = Math.max(-1, Math.min(1, opts.pan)); out.connect(pan); tail = pan; }
  tail.connect(a.sfx);
  const pitch = opts.pitch ?? 1;
  let end = now;
  for (const v of p.voices) end = Math.max(end, voice(a.ctx, a.noise, out, v, now + (v.at ?? 0), pitch));
  setTimeout(() => { try { out.disconnect(); tail.disconnect(); } catch { /* already gone */ } }, (end - now + 0.2) * 1000);
}

function voice(ctx: AudioContext, noise: AudioBuffer, out: AudioNode, v: Voice, t: number, pitch: number): number {
  const a = v.attack ?? 0.004, h = v.hold ?? 0, d = v.decay;
  const env = ctx.createGain();
  env.gain.setValueAtTime(0, t);
  env.gain.linearRampToValueAtTime(v.vol ?? 0.15, t + a);
  env.gain.setValueAtTime(v.vol ?? 0.15, t + a + h);
  env.gain.exponentialRampToValueAtTime(0.0008, t + a + h + d);
  let node: AudioNode = env;
  if (v.lp0) {
    const f = ctx.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.setValueAtTime(v.lp0, t);
    f.frequency.exponentialRampToValueAtTime(Math.max(40, v.lp1 ?? v.lp0), t + a + h + d);
    env.connect(f);
    node = f;
  }
  node.connect(out);
  const stop = t + a + h + d + 0.02;
  if (v.wave === 'noise') {
    const src = ctx.createBufferSource();
    src.buffer = noise;
    src.loop = true;
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.Q.value = 0.8;
    bp.frequency.setValueAtTime(v.f0 * pitch, t);
    if (v.f1) bp.frequency.exponentialRampToValueAtTime(v.f1 * pitch, stop);
    src.connect(bp); bp.connect(env);
    src.start(t, Math.random() * 0.5); src.stop(stop);
    return stop;
  }
  const osc = ctx.createOscillator();
  osc.type = v.wave;
  osc.frequency.setValueAtTime(v.f0 * pitch, t);
  if (v.f1) osc.frequency.exponentialRampToValueAtTime(Math.max(20, v.f1 * pitch), stop);
  if (v.vib) {
    const lfo = ctx.createOscillator(), lg = ctx.createGain();
    lfo.frequency.value = v.vibRate ?? 6; lg.gain.value = v.vib;
    lfo.connect(lg); lg.connect(osc.frequency);
    lfo.start(t); lfo.stop(stop);
  }
  osc.connect(env);
  osc.start(t); osc.stop(stop);
  return stop;
}
