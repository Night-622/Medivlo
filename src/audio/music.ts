/**
 * Procedural chiptune music (Claude 1). A theme is a key, a mode, a tempo, a chord progression and a mood; the
 * generator turns it (deterministically, seeded by the theme id) into an 8-bar loop for four channels: lead
 * (square), bass (triangle), arpeggio or pad, and noise drums. A lookahead scheduler plays it; switching themes
 * crossfades. Moods: calm · explore · tense · combat · boss · title.
 */
import { audio } from './engine';

type Mood = 'calm' | 'explore' | 'tense' | 'combat' | 'boss' | 'title';
export interface Theme { id: string; root: number; mode: number[]; bpm: number; prog: number[]; mood: Mood; lead?: OscillatorType }

const MODES: Record<string, number[]> = {
  ionian: [0, 2, 4, 5, 7, 9, 11], dorian: [0, 2, 3, 5, 7, 9, 10], phrygian: [0, 1, 3, 5, 7, 8, 10],
  lydian: [0, 2, 4, 6, 7, 9, 11], mixolydian: [0, 2, 4, 5, 7, 9, 10], aeolian: [0, 2, 3, 5, 7, 8, 10],
  harmonic: [0, 2, 3, 5, 7, 8, 11], phrygDom: [0, 1, 4, 5, 7, 8, 10], penta: [0, 2, 4, 7, 9, 12, 14],
};

/** Per-school realm character: [root midi, mode, bpm, progression (scale degrees, 0-based), lead wave] */
const SCHOOL: Record<string, [number, keyof typeof MODES, number, number[], OscillatorType]> = {
  ash: [50, 'phrygian', 92, [0, 1, 0, 6], 'sawtooth'],
  rime: [57, 'lydian', 78, [0, 1, 4, 3], 'triangle'],
  storm: [52, 'dorian', 116, [0, 6, 5, 6], 'square'],
  radiance: [55, 'ionian', 96, [0, 4, 5, 3], 'square'],
  umbral: [49, 'aeolian', 70, [0, 5, 3, 4], 'triangle'],
  verdant: [53, 'penta', 100, [0, 3, 4, 0], 'triangle'],
  blade: [50, 'dorian', 104, [0, 3, 0, 4], 'square'],
  iron: [45, 'harmonic', 88, [0, 5, 4, 4], 'sawtooth'],
  fist: [55, 'mixolydian', 112, [0, 6, 3, 0], 'square'],
  hunt: [52, 'aeolian', 98, [0, 6, 5, 4], 'triangle'],
  guile: [51, 'phrygDom', 106, [0, 1, 5, 1], 'square'],
  song: [60, 'ionian', 102, [0, 5, 3, 4], 'triangle'],
};

/** Theme for a world space and situation. */
export function themeFor(space: string, situation: 'explore' | 'combat' | 'boss' = 'explore'): Theme {
  const school = space.startsWith('realm:') ? space.slice(6) : null;
  const s = school ? SCHOOL[school] : null;
  const base: Theme = s
    ? { id: space, root: s[0], mode: MODES[s[1]], bpm: s[2], prog: s[3], mood: 'explore', lead: s[4] }
    : space === 'concordia' ? { id: space, root: 55, mode: MODES.ionian, bpm: 96, prog: [0, 3, 4, 0], mood: 'explore', lead: 'square' }
    : space.startsWith('arena:') ? { id: space, root: 50, mode: MODES.dorian, bpm: 124, prog: [0, 6, 5, 6], mood: 'combat', lead: 'square' }
    : space.includes('citadel') || space.includes('heart') ? { id: space, root: 47, mode: MODES.phrygian, bpm: 72, prog: [0, 1, 0, 6], mood: 'tense', lead: 'sawtooth' }
    : { id: space, root: 48, mode: MODES.aeolian, bpm: 74, prog: [0, 5, 0, 6], mood: 'tense', lead: 'triangle' }; // lairs / interiors
  if (space.startsWith('inst:') && base.mood === 'explore') { base.mood = 'tense'; base.bpm = Math.round(base.bpm * 0.8); }
  if (situation === 'combat') return { ...base, id: `${base.id}#combat`, mood: 'combat', bpm: Math.max(128, base.bpm + 30) };
  if (situation === 'boss') return { ...base, id: `${base.id}#boss`, mood: 'boss', mode: MODES.harmonic, bpm: 148, prog: [0, 5, 3, 4] };
  return base;
}

export const TITLE_THEME: Theme = { id: 'title', root: 50, mode: MODES.dorian, bpm: 84, prog: [0, 5, 6, 4], mood: 'title', lead: 'square' };
export const DEATH_THEME: Theme = { id: 'death', root: 45, mode: MODES.aeolian, bpm: 60, prog: [0, 5, 3, 4], mood: 'calm', lead: 'triangle' };

// ───────── generation ─────────

interface Note { step: number; len: number; midi: number; vol: number }
interface Pattern { steps: number; lead: Note[]; bass: Note[]; arp: Note[]; pad: Note[][]; kick: number[]; snare: number[]; hat: number[] }

function rng(seed: string): () => number {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) { h = Math.imul(h ^ seed.charCodeAt(i), 3432918353); h = (h << 13) | (h >>> 19); }
  return () => { h = Math.imul(h ^ (h >>> 16), 2246822507); h = Math.imul(h ^ (h >>> 13), 3266489909); h ^= h >>> 16; return (h >>> 0) / 4294967296; };
}

const BARS = 8, SPB = 16;

function generate(t: Theme): Pattern {
  const r = rng(t.id);
  const deg = (d: number, oct = 0) => {
    const n = t.mode.length;
    const o = Math.floor(d / n), i = ((d % n) + n) % n;
    return t.root + t.mode[i] + 12 * (o + oct);
  };
  const steps = BARS * SPB;
  const p: Pattern = { steps, lead: [], bass: [], arp: [], pad: [], kick: [], snare: [], hat: [] };
  const busy = t.mood === 'combat' || t.mood === 'boss';
  // two-bar motif, then A A' B A' over 8 bars
  const motif: { s: number; len: number; d: number }[] = [];
  let d = 4 + Math.floor(r() * 3);
  const rhythm = busy ? [2, 2, 1, 1, 2, 2, 4, 2] : t.mood === 'calm' || t.mood === 'tense' ? [8, 4, 4, 8, 8] : [4, 2, 2, 4, 2, 2, 4, 4, 8];
  for (let s = 0, k = 0; s < 2 * SPB; k++) {
    const len = rhythm[k % rhythm.length];
    if (r() < (t.mood === 'tense' ? 0.35 : 0.15)) { s += len; continue; } // rest
    d += Math.round((r() - 0.5) * 3.2);
    d = Math.max(0, Math.min(11, d));
    motif.push({ s, len, d });
    s += len;
  }
  const sections = [0, 1, 2, 1];
  for (let sec = 0; sec < 4; sec++) {
    const shift = sections[sec] === 1 ? 2 : sections[sec] === 2 ? -1 : 0;
    for (const n of motif) {
      const step = sec * 2 * SPB + n.s;
      const chordDeg = t.prog[Math.floor(step / SPB / 2) % t.prog.length];
      // lean the motif towards the current chord
      const dd = n.d + shift + (sections[sec] === 2 ? chordDeg % 3 : 0);
      p.lead.push({ step, len: Math.max(1, n.len - (busy ? 0 : 1)), midi: deg(dd, 1), vol: 0.09 });
    }
  }
  for (let bar = 0; bar < BARS; bar++) {
    const c = t.prog[Math.floor(bar / 2) % t.prog.length];
    const s0 = bar * SPB;
    const chord = [deg(c), deg(c + 2), deg(c + 4)];
    // bass
    if (t.mood === 'calm' || t.mood === 'tense' || t.mood === 'title') p.bass.push({ step: s0, len: SPB - 1, midi: chord[0] - 12, vol: 0.16 });
    else if (busy) for (let i = 0; i < SPB; i += 2) p.bass.push({ step: s0 + i, len: 1, midi: chord[0] - (i % 4 === 0 ? 12 : 0), vol: 0.15 });
    else { p.bass.push({ step: s0, len: 6, midi: chord[0] - 12, vol: 0.15 }); p.bass.push({ step: s0 + 8, len: 6, midi: chord[2] - 12, vol: 0.13 }); }
    // arpeggio (busy / explore) or pad (calm / tense / title)
    if (busy || t.mood === 'explore') {
      const every = busy ? 1 : 2;
      for (let i = 0; i < SPB; i += every) p.arp.push({ step: s0 + i, len: 1, midi: chord[(i / every) % 3] + 12, vol: busy ? 0.035 : 0.04 });
    } else p.pad.push(chord.map((m) => ({ step: s0, len: SPB, midi: m, vol: 0.035 })));
    // drums
    if (t.mood === 'explore') { p.kick.push(s0, s0 + 8); p.snare.push(s0 + 4, s0 + 12); for (let i = 0; i < SPB; i += 4) p.hat.push(s0 + i + 2); }
    if (busy) { p.kick.push(s0, s0 + 6, s0 + 8, ...(t.mood === 'boss' ? [s0 + 10, s0 + 14] : [])); p.snare.push(s0 + 4, s0 + 12); for (let i = 0; i < SPB; i += 2) p.hat.push(s0 + i); }
    if (t.mood === 'title' && bar >= 4) { p.kick.push(s0); p.snare.push(s0 + 8); }
  }
  return p;
}

// ───────── playback ─────────

interface Playing { theme: Theme; pat: Pattern; out: GainNode; nextStep: number; nextTime: number; stopAt: number | null }

let current: Playing | null = null;
const fading: Playing[] = [];
let timer: ReturnType<typeof setInterval> | null = null;

const hz = (m: number) => 440 * Math.pow(2, (m - 69) / 12);

/** Play a theme (crossfades from the current one). Same id = no-op. null = fade out. */
export function playTheme(theme: Theme | null, fade = 1.4): void {
  const a = audio();
  if (!a) return;
  if (theme && current?.theme.id === theme.id) return;
  const now = a.ctx.currentTime;
  if (current) {
    current.out.gain.setTargetAtTime(0, now, fade / 4);
    current.stopAt = now + fade;
    fading.push(current);
    current = null;
  }
  if (theme) {
    const out = a.ctx.createGain();
    out.gain.setValueAtTime(0, now);
    out.gain.linearRampToValueAtTime(1, now + fade);
    out.connect(a.music);
    current = { theme, pat: generate(theme), out, nextStep: 0, nextTime: now + 0.05, stopAt: null };
  }
  timer ??= setInterval(tick, 25);
}

function tick(): void {
  const a = audio();
  if (!a || a.ctx.state !== 'running') return;
  const now = a.ctx.currentTime;
  for (const p of [current, ...fading]) if (p) schedule(a.ctx, a.noise, p, now + 0.15);
  for (let i = fading.length - 1; i >= 0; i--) {
    if (fading[i].stopAt !== null && now > fading[i].stopAt!) { try { fading[i].out.disconnect(); } catch { /* */ } fading.splice(i, 1); }
  }
}

function schedule(ctx: AudioContext, noise: AudioBuffer, p: Playing, until: number): void {
  const stepDur = 60 / p.theme.bpm / 4;
  while (p.nextTime < until) {
    const s = p.nextStep % p.pat.steps, t = p.nextTime;
    const lead = p.theme.lead ?? 'square';
    for (const n of p.pat.lead) if (n.step === s) tone(ctx, p.out, lead, n.midi, t, n.len * stepDur, n.vol);
    for (const n of p.pat.bass) if (n.step === s) tone(ctx, p.out, 'triangle', n.midi, t, n.len * stepDur, n.vol);
    for (const n of p.pat.arp) if (n.step === s) tone(ctx, p.out, 'square', n.midi, t, n.len * stepDur * 0.9, n.vol);
    for (const chord of p.pat.pad) if (chord[0].step === s) for (const n of chord) tone(ctx, p.out, 'triangle', n.midi, t, n.len * stepDur, n.vol, 0.3);
    if (p.pat.kick.includes(s)) kick(ctx, p.out, t);
    if (p.pat.snare.includes(s)) hit(ctx, noise, p.out, t, 1800, 0.12, 0.06);
    if (p.pat.hat.includes(s)) hit(ctx, noise, p.out, t, 8000, 0.035, 0.025);
    p.nextStep++;
    p.nextTime += stepDur;
  }
}

function tone(ctx: AudioContext, out: AudioNode, wave: OscillatorType, midi: number, t: number, dur: number, vol: number, attack = 0.01): void {
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.type = wave;
  o.frequency.setValueAtTime(hz(midi), t);
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(vol, t + attack);
  g.gain.setValueAtTime(vol, t + Math.max(attack, dur * 0.7));
  g.gain.linearRampToValueAtTime(0, t + dur);
  if (wave === 'sawtooth') {
    const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 2200;
    o.connect(f); f.connect(g);
  } else o.connect(g);
  g.connect(out);
  o.start(t); o.stop(t + dur + 0.02);
}

function kick(ctx: AudioContext, out: AudioNode, t: number): void {
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.frequency.setValueAtTime(140, t);
  o.frequency.exponentialRampToValueAtTime(40, t + 0.12);
  g.gain.setValueAtTime(0.22, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.16);
  o.connect(g); g.connect(out);
  o.start(t); o.stop(t + 0.18);
}

function hit(ctx: AudioContext, noise: AudioBuffer, out: AudioNode, t: number, freq: number, dur: number, vol: number): void {
  const src = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
  src.buffer = noise;
  f.type = freq > 4000 ? 'highpass' : 'bandpass';
  f.frequency.value = freq;
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  src.connect(f); f.connect(g); g.connect(out);
  src.start(t, Math.random() * 0.5); src.stop(t + dur + 0.01);
}
