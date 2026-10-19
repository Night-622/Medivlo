/** Day/night clock (WORLD.md §4.6): 1 real second = 1 in-game minute; paused by menus, panels and dialogue. */
import { Game, bus, type TimePhase } from '@/core';
import type Phaser from 'phaser';

export function phaseOf(hour: number): TimePhase {
  if (hour >= 5 && hour < 7) return 'dawn';
  if (hour >= 7 && hour < 18) return 'day';
  if (hour >= 18 && hour < 20) return 'dusk';
  return 'night';
}

/** Does a spawn entry's `time` allow spawning now? Dawn/dusk count as both. */
export function timeMatches(want: 'day' | 'night' | 'any' | undefined, phase: TimePhase): boolean {
  if (!want || want === 'any') return true;
  if (phase === 'dawn' || phase === 'dusk') return true;
  return want === phase;
}

export class WorldClock {
  private pausers = new Set<string>();
  private phase: TimePhase;

  constructor(scene: Phaser.Scene) {
    this.phase = phaseOf(this.hour);
    bus.onScene(scene, 'ui:open', ({ panel }) => this.pausers.add(`ui:${panel}`));
    bus.onScene(scene, 'ui:close', ({ panel }) => this.pausers.delete(`ui:${panel}`));
    bus.onScene(scene, 'dialogue:started', ({ dialogueId }) => this.pausers.add(`dlg:${dialogueId}`));
    bus.onScene(scene, 'dialogue:ended', ({ dialogueId }) => this.pausers.delete(`dlg:${dialogueId}`));
    bus.onScene(scene, 'game:paused', ({ paused }) => (paused ? this.pausers.add('pause') : this.pausers.delete('pause')));
  }

  /** Pause reasons other than `except` (e.g. "is anything but the world map open?"). */
  pausedExcept(except: string): boolean {
    for (const p of this.pausers) if (p !== except) return true;
    return false;
  }

  /** True while any panel, dialogue or pause is open; world input should be ignored too. */
  get paused(): boolean { return this.pausers.size > 0; }

  get hour(): number { return (Game.state.world.time / 60) % 24; }

  get current(): { hour: number; phase: TimePhase } { return { hour: this.hour, phase: this.phase }; }

  tick(dtMs: number): void {
    if (this.paused) return;
    Game.state.world.time += dtMs / 1000;
    const p = phaseOf(this.hour);
    if (p !== this.phase) {
      this.phase = p;
      bus.emit('time:phase-changed', { phase: p, hour: Math.floor(this.hour) });
    }
  }

  /** 0 (noon) .. 1 (midnight) darkness, for the Phase 2 lighting tint. */
  get darkness(): number {
    const h = this.hour;
    if (h >= 7 && h < 18) return 0;
    if (h >= 20 || h < 5) return 1;
    return h < 7 ? 1 - (h - 5) / 2 : (h - 18) / 2;
  }
}
