/**
 * Draws NPC entities from snapshots (kind 'npc'): the handoff NPC sheet (npcs:<id>), a bearer's class look
 * (heroes:<class>), or a stand-in villager. Only NPCs in the local player's space are shown.
 */
import Phaser from 'phaser';
import { Depth } from '@/core';
import type { EntityId, EntityKind, EntityState, SnapshotConsumer } from '@/net';
import { C, typeStyle } from '@/ui/kit/hc';
import { SHADOW } from '@/systems/view/CombatView';

const STAND_INS = ['pell', 'odo', 'wil', 'pip', 'corwin', 'hobb'];

interface NpcSprite { body: Phaser.GameObjects.Sprite; plate: Phaser.GameObjects.Text; shadow: Phaser.GameObjects.Ellipse }

export class NpcView implements SnapshotConsumer {
  readonly kinds: EntityKind[] = ['npc'];
  private live = new Map<EntityId, NpcSprite>();

  constructor(private scene: Phaser.Scene, private space: () => string) {}

  private texture(e: EntityState): string {
    const bare = e.def.replace(/^npc:/, '');
    if (this.scene.textures.exists(`npcs:${bare}`)) return `npcs:${bare}`;
    const cls = typeof e.data?.classLook === 'string' ? e.data.classLook.replace(/^class:/, '') : '';
    if (cls && this.scene.textures.exists(`heroes:${cls}`)) return `heroes:${cls}`;
    let h = 0;
    for (const ch of bare) h = (h * 31 + ch.charCodeAt(0)) | 0;
    return `npcs:${STAND_INS[Math.abs(h) % STAND_INS.length]}`;
  }

  apply(entities: EntityState[], removed: EntityId[]): void {
    for (const id of removed) this.drop(id);
    const here = this.space();
    for (const e of entities) {
      if (e.space !== here) { this.drop(e.id); continue; }
      let s = this.live.get(e.id);
      if (!s) {
        const tex = this.texture(e);
        if (!this.scene.textures.exists(tex)) continue;
        const body = this.scene.add.sprite(e.x, e.y, tex, 0).setOrigin(0.5, 38 / 40);
        if (this.scene.anims.exists(`${tex}:idle`)) body.play({ key: `${tex}:idle`, startFrame: Math.floor(Math.random() * 2) });
        const plate = this.scene.add.text(e.x, e.y - 42, String(e.data?.name ?? ''), typeStyle('caption', C.text)).setOrigin(0.5, 1).setAlpha(0.85);
        // a soft ground shadow at the feet, the same as heroes and creatures (Claude 3's SHADOW)
        const w = Phaser.Math.Clamp(body.displayWidth * SHADOW.widthOfSprite, SHADOW.min, SHADOW.max);
        const shadow = this.scene.add.ellipse(e.x, e.y - 1, w, w * SHADOW.aspect, SHADOW.color, SHADOW.alpha).setDepth(SHADOW.depth);
        s = { body, plate, shadow };
        this.live.set(e.id, s);
      }
      s.body.setPosition(e.x, e.y).setDepth(Depth.Actors + e.y);
      s.shadow.setPosition(e.x, e.y - 1);
      s.plate.setPosition(e.x, e.y - 42).setDepth(Depth.WorldUi - 1);
    }
  }

  private drop(id: EntityId): void {
    const s = this.live.get(id);
    if (!s) return;
    s.body.destroy();
    s.plate.destroy();
    s.shadow.destroy();
    this.live.delete(id);
  }

  /** NPCs drawn now (for the interact prompt) */
  list(): { id: string; x: number; y: number; name: string }[] {
    return [...this.live].map(([id, s]) => ({ id, x: s.body.x, y: s.body.y, name: s.plate.text }));
  }

  destroy(): void { for (const id of [...this.live.keys()]) this.drop(id); }
}
