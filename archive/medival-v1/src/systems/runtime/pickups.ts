/**
 * Ground loot (items + gold) and the death Echo.
 */
import Phaser from 'phaser';
import { Depth, Registry } from '@/core';
import type { ItemInstance } from '@/core';
import { RARITY_COLOR } from '../balance';
import { addInstance } from '../items/Inventory';
import { dist } from './Actor';
import type { CombatRuntime } from './CombatRuntime';
import { lootTexture } from './textures';

interface Drop {
  x: number; y: number;
  item?: ItemInstance;
  gold?: number;
  echo?: boolean;
  sprite: Phaser.GameObjects.Image;
  label?: Phaser.GameObjects.Text;
  bornAt: number;
  vx: number; vy: number;
}

export class Pickups {
  private drops: Drop[] = [];
  private bagsFullToastAt = 0;

  constructor(private readonly scene: Phaser.Scene) {}

  spawnItem(item: ItemInstance, x: number, y: number, now: number): void {
    const color = RARITY_COLOR[item.rarity];
    const sprite = this.scene.add.image(x, y, lootTexture(this.scene, color, false)).setDepth(Depth.Actors + y - 4);
    const def = Registry.tryGet('item', item.def);
    const label = item.rarity !== 'common' || def?.itemKind === 'quest'
      ? this.scene.add.text(x, y - 14, def?.name ?? item.def, { fontFamily: 'Georgia, serif', fontSize: '11px', color: `#${color.toString(16).padStart(6, '0')}`, stroke: '#0e0b08', strokeThickness: 3 }).setOrigin(0.5).setDepth(Depth.WorldUi)
      : undefined;
    const a = Math.random() * Math.PI * 2;
    this.drops.push({ x, y, item, sprite, label, bornAt: now, vx: Math.cos(a) * 90, vy: Math.sin(a) * 90 });
  }

  spawnGold(amount: number, x: number, y: number, now: number, echo = false): void {
    if (amount <= 0) return;
    const sprite = this.scene.add.image(x, y, lootTexture(this.scene, 0xd4a646, true)).setDepth(Depth.Actors + y - 4);
    if (echo) sprite.setScale(2.2).setTint(0xffd27a);
    const label = echo ? this.scene.add.text(x, y - 18, `Echo (${amount} gold)`, { fontFamily: 'Georgia, serif', fontSize: '12px', color: '#ffd27a', stroke: '#0e0b08', strokeThickness: 3 }).setOrigin(0.5).setDepth(Depth.WorldUi) : undefined;
    const a = Math.random() * Math.PI * 2;
    this.drops.push({ x, y, gold: amount, echo, sprite, label, bornAt: now, vx: echo ? 0 : Math.cos(a) * 70, vy: echo ? 0 : Math.sin(a) * 70 });
  }

  update(rt: CombatRuntime, now: number, dtMs: number): void {
    const p = rt.player;
    const dt = dtMs / 1000;
    this.drops = this.drops.filter((d) => {
      // scatter, then settle
      if (d.vx || d.vy) {
        d.x += d.vx * dt; d.y += d.vy * dt;
        d.vx *= 0.88; d.vy *= 0.88;
        if (Math.abs(d.vx) + Math.abs(d.vy) < 5) { d.vx = 0; d.vy = 0; }
      }
      const age = now - d.bornAt;
      const dd = dist(d.x, d.y, p.x, p.y);
      if (p.alive && age > 350) {
        if (dd < 70 && !d.echo && d.gold) { // gold magnet
          const a = Math.atan2(p.y - d.y, p.x - d.x);
          d.x += Math.cos(a) * 260 * dt; d.y += Math.sin(a) * 260 * dt;
        }
        if (dd < 24) {
          if (this.collect(rt, d, now)) { d.sprite.destroy(); d.label?.destroy(); return false; }
        }
      }
      d.sprite.setPosition(d.x, d.y + Math.sin(now / 250 + d.bornAt) * 1.5);
      d.label?.setPosition(d.x, d.y - 14);
      return true;
    });
  }

  private collect(rt: CombatRuntime, d: Drop, now: number): boolean {
    const gs = rt.player.gs;
    if (d.gold) {
      gs.player.inventory.gold += d.gold;
      if (d.echo) { gs.player.inventory.echo = undefined; rt.fx.label(d.x, d.y, `Echo recovered: +${d.gold} gold`, '#ffd27a', now); }
      else rt.fx.label(d.x, d.y, `+${d.gold} gold`, '#d4a646', now, 800);
      return true;
    }
    if (d.item) {
      if (!addInstance(gs, d.item)) {
        if (now - this.bagsFullToastAt > 2000) { this.bagsFullToastAt = now; rt.fx.label(d.x, d.y, 'Bags full', '#c04a4a', now); }
        return false;
      }
      const def = Registry.tryGet('item', d.item.def);
      rt.onItemPicked(d.item);
      rt.fx.label(d.x, d.y, `${def?.name ?? d.item.def}${d.item.qty > 1 ? ` ×${d.item.qty}` : ''}`, `#${RARITY_COLOR[d.item.rarity].toString(16).padStart(6, '0')}`, now, 1000);
      return true;
    }
    return true;
  }

  clearEcho(): void {
    this.drops = this.drops.filter((d) => {
      if (!d.echo) return true;
      d.sprite.destroy(); d.label?.destroy();
      return false;
    });
  }

  destroy(): void {
    for (const d of this.drops) { d.sprite.destroy(); d.label?.destroy(); }
    this.drops = [];
  }
}
