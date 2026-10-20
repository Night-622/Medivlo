/**
 * The client scene's day/night clock: 1 real second = 1 in-game minute, kept in the save's world.time; paused
 * by menus, panels and dialogue (solo). Servers use the sim-driven clock in installWorldAuthority instead.
 */
import type Phaser from 'phaser';
import { Game, bus, type TimePhase } from '@/core';
import { phaseOf } from '../hc/authority';

/** one screen's tabs (HudV2Scene keeps the same groups) */
const GROUPS = [['inventory', 'skills', 'spells'], ['journal', 'codex', 'book']];
const groupOf = (p: string): string[] => GROUPS.find((g) => g.includes(p)) ?? [p];

export class WorldClock {
  private pausers = new Set<string>();
  private phase: TimePhase;
  /** visitors and guests: the authority's hour (StateSync), advanced locally at the same rate */
  private remote: { hour: number; at: number } | null = null;

  constructor(scene: Phaser.Scene) {
    this.phase = phaseOf(this.hour);
    // Tabs of one screen announce only one side (Pack → Skills opens Skills and never closes the Pack; Journal → Codex
    // by key says nothing; closing names only the current tab): a member opening replaces its group and any member
    // closing clears the group, or a stale 'ui:inventory' kept the clock paused for good (the HUD's rule, 3641a48)
    bus.onScene(scene, 'ui:open', ({ panel }) => { for (const p of groupOf(panel)) this.pausers.delete(`ui:${p}`); this.pausers.add(`ui:${panel}`); });
    bus.onScene(scene, 'ui:close', ({ panel }) => { for (const p of groupOf(panel)) this.pausers.delete(`ui:${p}`); });
    bus.onScene(scene, 'dialogue:started', ({ dialogueId }) => this.pausers.add(`dlg:${dialogueId}`));
    bus.onScene(scene, 'dialogue:ended', ({ dialogueId }) => this.pausers.delete(`dlg:${dialogueId}`));
    bus.onScene(scene, 'game:paused', ({ paused }) => (paused ? this.pausers.add('pause') : this.pausers.delete('pause')));
  }

  /** Pause reasons other than `except` (e.g. "is anything but the map open?"). */
  pausedExcept(except: string): boolean {
    for (const p of this.pausers) if (p !== except) return true;
    return false;
  }

  /** True while any panel, dialogue or pause is open; world input should be ignored too. */
  get paused(): boolean { return this.pausers.size > 0; }

  get hour(): number {
    if (this.remote) return (this.remote.hour + (performance.now() - this.remote.at) / 60_000) % 24;
    return (Game.state.world.time / 60) % 24;
  }

  /** Follow the authority's clock instead of the save's (never writes world.time). */
  follow(hour: number): void { this.remote = { hour, at: performance.now() }; this.phase = phaseOf(this.hour); }

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

  /** 0 (noon) .. 1 (midnight) darkness for the lighting grade. */
  get darkness(): number {
    const h = this.hour;
    if (h >= 7 && h < 18) return 0;
    if (h >= 20 || h < 5) return 1;
    return h < 7 ? 1 - (h - 5) / 2 : (h - 18) / 2;
  }
}
