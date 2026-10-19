/**
 * Audio engine (Claude 1). Procedural only: every sound is synthesised with WebAudio, so the game ships no audio
 * files and needs no external URLs. Reuses Phaser's AudioContext (it handles the browser's gesture unlock).
 * Graph: sources → sfx / music buses → master → destination. Volumes follow Settings (0–100, perceptual curve).
 */
import { Settings, bus } from '@/core';

export interface AudioBuses { ctx: AudioContext; master: GainNode; music: GainNode; sfx: GainNode; noise: AudioBuffer }

let buses: AudioBuses | null = null;
let duck = 1;

const curve = (v: number) => Math.pow(Math.max(0, Math.min(100, v)) / 100, 1.6);

/** Wire the engine to a context (Phaser's). Safe to call once; later calls return the same buses. */
export function initAudio(ctx: AudioContext): AudioBuses {
  if (buses) return buses;
  const master = ctx.createGain();
  const music = ctx.createGain();
  const sfx = ctx.createGain();
  // gentle bus compression so busy fights don't clip
  const comp = ctx.createDynamicsCompressor();
  comp.threshold.value = -14; comp.knee.value = 12; comp.ratio.value = 4; comp.attack.value = 0.004; comp.release.value = 0.18;
  music.connect(master); sfx.connect(master); master.connect(comp); comp.connect(ctx.destination);
  // 1 s of white noise, shared by every noise voice
  const noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
  const d = noise.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  buses = { ctx, master, music, sfx, noise };
  applyVolumes();
  bus.on('settings:changed', ({ key }) => { if (key === 'master' || key === 'music' || key === 'sfx' || key === 'all') applyVolumes(); });
  return buses;
}

export function audio(): AudioBuses | null { return buses && buses.ctx.state !== 'closed' ? buses : null; }

function applyVolumes(): void {
  if (!buses) return;
  const s = Settings.get();
  const t = buses.ctx.currentTime;
  buses.master.gain.setTargetAtTime(curve(s.master), t, 0.05);
  buses.music.gain.setTargetAtTime(curve(s.music) * 0.55 * duck, t, 0.05);
  buses.sfx.gain.setTargetAtTime(curve(s.sfx) * 0.8, t, 0.05);
}

/** Lower the music under dialogue / menus (1 = normal). */
export function setDuck(v: number): void {
  duck = v;
  if (!buses) return;
  buses.music.gain.setTargetAtTime(curve(Settings.get().music) * 0.55 * duck, buses.ctx.currentTime, 0.25);
}
