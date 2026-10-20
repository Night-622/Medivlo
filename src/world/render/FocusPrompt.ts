/**
 * Client side of world interaction: picks the nearest usable object around the local player, shows a
 * "[F] Wake" prompt over it, and on the interact key sends act { domain: 'world', action: 'use', args: { id } }.
 * The authority re-checks range and conditions (src/world/hc/interact.ts).
 */
import Phaser from 'phaser';
import { Depth, Services, TILE_SIZE, bus, keyLabel, type WorldObject } from '@/core';
import { actionKeyCode } from '@/ui/kit/hc/keys';
import { C, typeStyle } from '@/ui/kit/hc';
import { objectsAround, tileDist, usableNow } from '../hc/interact';

/** a little inside the authority's USE_RANGE so a prompt never promises what the server refuses */
const FOCUS_RANGE = 1.9;
/** tiles an NPC counts as nearer than an object (talking beats a stone or a sign at about the same distance) */
const NPC_BIAS = 0.75;
const LABEL: Partial<Record<WorldObject['kind'], string>> = { waystone: 'Wake', door: 'Enter', 'npc-anchor': 'Talk', chest: 'Open', sign: 'Read', lore: 'Read', lever: 'Pull' };

export class FocusPrompt {
  private text: Phaser.GameObjects.Text;
  private focus: WorldObject | null = null;
  /** NPC entities (from snapshots) the player can talk to */
  npcs: () => { id: string; x: number; y: number; name: string }[] = () => [];
  private acc = 1e9;
  private key: Phaser.Input.Keyboard.Key | null = null;

  constructor(private scene: Phaser.Scene, private space: () => string, private pos: () => { x: number; y: number }, private paused: () => boolean) {
    this.text = scene.add.text(0, 0, '', typeStyle('caption', C.text)).setOrigin(0.5, 1).setDepth(Depth.WorldUi)
      .setBackgroundColor('#0d1226cc').setPadding(6, 3, 6, 3).setVisible(false);
    this.bindKey();
    // follow rebinds (Settings › Controls) without a reload
    this.offSettings = bus.on('settings:changed', (e) => { if (e.key === 'keys' || e.key === 'all') this.bindKey(); });
  }

  private offSettings: () => void;

  private bindKey(): void {
    const kb = this.scene.input.keyboard!;
    if (this.key) { this.key.removeAllListeners(); kb.removeKey(this.key); }
    const code = actionKeyCode('interact');
    this.key = code === undefined ? null : kb.addKey(code);
    this.key?.on('down', () => this.use());
  }

  focusId(): string | null { return this.focus?.id ?? null; }

  use(): void {
    if (!this.focus || this.paused()) return;
    // arena hazards belong to the combat sim (Claude 3); everything else is a world use
    const hazard = typeof this.focus.props?.hazard === 'string';
    Services.tryGet('net')?.send({ type: 'act', domain: hazard ? 'systems' : 'world', action: hazard ? 'hazard' : 'use', args: { id: this.focus.id } });
  }

  update(dt: number): void {
    this.acc += dt;
    const p = this.pos();
    if (this.acc > 120) { // re-pick ~8×/s
      this.acc = 0;
      let best: WorldObject | null = null, bd = FOCUS_RANGE;
      for (const o of objectsAround(this.space(), Math.floor(p.x / TILE_SIZE), Math.floor(p.y / TILE_SIZE), 0)) {
        if (!usableNow(o)) continue;
        const d = tileDist(o, p.x, p.y);
        if (d < bd) { bd = d; best = o; }
      }
      // NPC entities: talk to whoever stands closest (anchored or not); the authority re-checks range. People win
      // over a stone or object about as close (Sela Moth keeps the Brindlecross waystone and stands on its step)
      for (const n of this.npcs()) {
        const d = Math.hypot(n.x - p.x, n.y - p.y) / TILE_SIZE;
        if (d < FOCUS_RANGE && d - NPC_BIAS < bd) { bd = Math.max(0, d - NPC_BIAS); best = { id: n.id, kind: 'npc-anchor', at: [Math.floor(n.x / TILE_SIZE), Math.floor(n.y / TILE_SIZE) - 1], props: { name: n.name, label: 'Talk' } }; }
      }
      this.focus = best;
    }
    const o = this.focus;
    this.text.setVisible(!!o && !this.paused());
    if (!o) return;
    const label = String(o.props?.label ?? LABEL[o.kind] ?? 'Use');
    const name = o.props?.name ? `${o.props.name} · ` : '';
    this.text.setText(`[${keyLabel('interact')}] ${name}${label}`);
    // over an NPC, above its name plate (NpcView draws it 42 px over the feet)
    this.text.setPosition(o.at[0] * TILE_SIZE + 16, o.at[1] * TILE_SIZE - (o.kind === 'npc-anchor' && o.id.startsWith('npc') ? 24 : 6));
  }

  destroy(): void { this.offSettings(); this.key?.removeAllListeners(); this.text.destroy(); }
}
