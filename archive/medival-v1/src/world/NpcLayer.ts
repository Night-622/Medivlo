/**
 * NPC sprites at npc-anchors. Presence comes from Claude 4's narrative (injected by the scene as `presentAt`),
 * so this file doesn't import another owner's folder. One sprite per present NPC, fanned around the anchor.
 */
import Phaser from 'phaser';
import { Depth, TILE_SIZE, type WorldObject } from '@/core';
import { Theme, humanoidTexture, outlinedStyle } from '@/ui/kit';
import type { ChunkData } from './types';

export interface NpcView {
  id: string;
  name: string;
  look: { skin: number; hair?: number; cloth: number; accent?: number };
}

const FAN: readonly [number, number][] = [[0, 0], [2.4, 0.4], [-2.4, 0.4], [1.2, 2], [-1.2, 2], [3.6, 2], [-3.6, 2], [0, -1.8]];
const REFRESH_MS = 4000;
const LABEL_RANGE = 4;

interface Shown { sprite: Phaser.GameObjects.Image; label: Phaser.GameObjects.Text; obj: WorldObject }

function stagTexture(scene: Phaser.Scene): string {
  const key = 'npc-stag';
  if (scene.textures.exists(key)) return key;
  const g = scene.make.graphics({ x: 0, y: 0 }, false);
  g.fillStyle(0x000000, 0.25).fillEllipse(24, 45, 34, 6);
  g.fillStyle(0xf2efe6, 1).fillEllipse(22, 30, 30, 14);          // body
  g.fillRect(10, 34, 3, 11).fillRect(16, 35, 3, 10).fillRect(27, 35, 3, 10).fillRect(33, 34, 3, 11); // legs
  g.fillRect(34, 16, 5, 14).fillEllipse(39, 15, 10, 7);           // neck + head
  g.lineStyle(2, 0xd8d0b8, 1);
  g.lineBetween(37, 12, 32, 2).lineBetween(34, 6, 29, 5).lineBetween(41, 12, 46, 2).lineBetween(44, 6, 47, 8);
  g.generateTexture(key, 48, 48);
  g.destroy();
  return key;
}

export class NpcLayer {
  private anchors = new Map<string, WorldObject>();
  private shown = new Map<string, Shown>();
  private acc = 0;

  constructor(private scene: Phaser.Scene, private presentAt: (landmarkId: string) => NpcView[]) {}

  show(c: ChunkData): void {
    let added = false;
    for (const o of c.objects) if (o.kind === 'npc-anchor' && o.props?.landmark) { this.anchors.set(o.id, o); added = true; }
    if (added) this.refresh();
  }

  hide(c: ChunkData): void {
    for (const o of c.objects) if (this.anchors.delete(o.id)) this.refresh();
  }

  /** Talkable NPCs as focusable objects for WorldObjects (kind npc-anchor, props.npc / props.anchor). */
  focusables(): WorldObject[] {
    return [...this.shown.values()].map((s) => s.obj);
  }

  /** px, py = player feet (world px). Names show only for NPCs within LABEL_RANGE tiles, so crowds stay readable. */
  update(dtMs: number, px: number, py: number): void {
    this.acc += dtMs;
    if (this.acc >= REFRESH_MS) this.refresh();
    for (const s of this.shown.values()) {
      s.label.setVisible(Math.hypot(s.sprite.x - px, s.sprite.y - py) < LABEL_RANGE * TILE_SIZE);
    }
  }

  refresh(): void {
    this.acc = 0;
    const want = new Set<string>();
    for (const a of this.anchors.values()) {
      const npcs = this.presentAt(String(a.props!.landmark));
      npcs.forEach((n, i) => {
        const key = `${a.id}|${n.id}`;
        want.add(key);
        if (this.shown.has(key)) return;
        const [fx, fy] = FAN[i % FAN.length];
        const tx = a.at[0] + fx, ty = a.at[1] + fy;
        const x = tx * TILE_SIZE + TILE_SIZE / 2, y = ty * TILE_SIZE + TILE_SIZE - 2;
        const tex = n.id === 'npc:white-stag'
          ? stagTexture(this.scene)
          : humanoidTexture(this.scene, `npc-${n.id}`, n.look.skin, n.look.hair ?? n.look.skin, n.look.cloth, n.look.accent ?? n.look.cloth);
        const sprite = this.scene.add.image(x, y, tex).setOrigin(0.5, 0.95).setDepth(Depth.Actors + y);
        const label = this.scene.add.text(x, y - 50 - (i % 2) * 14, n.name, outlinedStyle('micro', Theme.css.text))
          .setOrigin(0.5, 1).setDepth(Depth.WorldUi).setVisible(false);
        const obj: WorldObject = {
          id: a.id, kind: 'npc-anchor', at: [Math.round(tx), Math.round(ty)],
          props: { npc: n.id, name: n.name, label: 'Talk to', anchor: a.id, landmark: String(a.props!.landmark) },
        };
        this.shown.set(key, { sprite, label, obj });
      });
    }
    for (const [key, s] of this.shown) {
      if (want.has(key)) continue;
      s.sprite.destroy();
      s.label.destroy();
      this.shown.delete(key);
    }
  }

  clear(): void {
    for (const s of this.shown.values()) { s.sprite.destroy(); s.label.destroy(); }
    this.shown.clear();
    this.anchors.clear();
  }
}
