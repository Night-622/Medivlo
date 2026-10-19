/** World objects in live chunks (WORLD.md §4.3): sprites, "press F" prompts, interaction, triggers. */
import Phaser from 'phaser';
import { Depth, Game, TILE_SIZE, bus, getFlag, setFlag, type WorldObject } from '@/core';
import { Theme, circleTexture, outlinedStyle, rectTexture } from '@/ui/kit';
import type { ChunkData } from './types';

const REACH_TILES = 1.6;

/** Travel request raised by doors; the scene performs it. */
/** `target: 'tp'` moves within the overworld (ferries, lifts) to `at`; otherwise an instance or the overworld. */
export interface TravelRequest { target: string; floor?: string; entrance?: string; at?: [number, number] }

const LABEL: Partial<Record<WorldObject['kind'], string>> = {
  door: 'Enter', chest: 'Open', sign: 'Read', lore: 'Examine', lever: 'Pull', waystone: 'Touch', interactable: 'Use',
};

function textureFor(scene: Phaser.Scene, o: WorldObject): string | null {
  if (o.props?.rest) return circleTexture(scene, 'obj-campfire', 9, 0xe08a2a);
  if (o.kind === 'door' && o.props?.floor) return rectTexture(scene, 'obj-stairs', 26, 20, 0x2a2420);
  switch (o.kind) {
    case 'chest': return rectTexture(scene, 'obj-chest', 22, 16, 0x8a5a2a);
    case 'sign': return rectTexture(scene, 'obj-sign', 16, 20, 0x9a7a4a);
    case 'lore': return circleTexture(scene, 'obj-lore', 7, 0xd4a646);
    case 'lever': return rectTexture(scene, 'obj-lever', 8, 22, 0x8a8a92);
    case 'waystone': return rectTexture(scene, 'obj-waystone', 14, 30, 0x6a8aa8);
    case 'interactable': return circleTexture(scene, 'obj-interact', 8, 0xc9a0dc);
    default: return null;
  }
}

export class WorldObjects {
  private sprites = new Map<string, Phaser.GameObjects.Image>();
  private objects = new Map<string, WorldObject>();
  private insideTriggers = new Set<string>();
  private prompt: Phaser.GameObjects.Text;
  private focus: WorldObject | null = null;
  onTravel?: (req: TravelRequest) => void;
  /** Extra focusable objects (e.g. NPC sprites from NpcLayer), re-read every frame. */
  extraFocus?: () => WorldObject[];

  constructor(private scene: Phaser.Scene) {
    this.prompt = scene.add.text(0, 0, '', { ...outlinedStyle('bodyS', Theme.css.gold), backgroundColor: Theme.css.ink, padding: { x: 6, y: 3 } }).setOrigin(0.5, 1).setDepth(Depth.WorldUi).setVisible(false);
  }

  show(c: ChunkData): void {
    for (const o of c.objects) {
      this.objects.set(o.id, o);
      const key = textureFor(this.scene, o);
      if (!key || this.sprites.has(o.id)) continue;
      const x = o.at[0] * TILE_SIZE + TILE_SIZE / 2, y = o.at[1] * TILE_SIZE + TILE_SIZE - 4;
      const s = this.scene.add.image(x, y, key).setOrigin(0.5, 1).setDepth(Depth.Actors + y);
      if (o.kind === 'chest' && Game.state.world.objectState[o.id]) s.setAlpha(0.45);
      this.sprites.set(o.id, s);
    }
  }

  hide(c: ChunkData): void {
    for (const o of c.objects) {
      this.objects.delete(o.id);
      this.sprites.get(o.id)?.destroy();
      this.sprites.delete(o.id);
    }
  }

  clear(): void {
    for (const s of this.sprites.values()) s.destroy();
    this.sprites.clear();
    this.objects.clear();
  }

  /** px, py = player feet in world px. */
  update(px: number, py: number): void {
    const ptx = px / TILE_SIZE, pty = py / TILE_SIZE;
    let best: WorldObject | null = null;
    let bestD = REACH_TILES;
    const candidates = [...this.objects.values(), ...(this.extraFocus?.() ?? [])];
    for (const o of candidates) {
      if (o.kind === 'trigger') { this.checkTrigger(o, ptx, pty); continue; }
      if (!LABEL[o.kind] && !o.props?.rest && !o.props?.label) continue;
      const d = Math.hypot(o.at[0] + 0.5 - ptx, o.at[1] + 0.5 - pty);
      if (d < bestD) { bestD = d; best = o; }
    }
    this.focus = best;
    if (best) {
      const verb = best.props?.rest ? 'Rest' : best.props?.label ?? LABEL[best.kind];
      const name = best.props?.name ? ` ${best.props.name}` : '';
      this.prompt.setText(`[F] ${verb}${name}`).setPosition(best.at[0] * TILE_SIZE + TILE_SIZE / 2, best.at[1] * TILE_SIZE - 6).setVisible(true);
    } else this.prompt.setVisible(false);
  }

  private checkTrigger(o: WorldObject, ptx: number, pty: number): void {
    const [w, h] = o.size ?? [1, 1];
    const inside = ptx >= o.at[0] && ptx < o.at[0] + w && pty >= o.at[1] && pty < o.at[1] + h;
    if (inside && !this.insideTriggers.has(o.id)) {
      this.insideTriggers.add(o.id);
      bus.emit('area:entered', { triggerId: o.id });
    } else if (!inside) this.insideTriggers.delete(o.id);
  }

  focusId(): string | null { return this.focus ? String(this.focus.props?.npc ?? this.focus.id) : null; }

  /** F pressed (interact key per SYSTEMS §2.1). */
  interact(): void {
    const o = this.focus;
    if (!o) return;
    const props = o.props ?? {};
    const state = Game.state.world;
    switch (o.kind) {
      case 'npc-anchor':
        bus.emit('interact', { objectId: String(props.anchor ?? o.id), kind: o.kind, props: { npc: String(props.npc), landmark: String(props.landmark ?? '') } });
        return;
      case 'door':
        bus.emit('interact', { objectId: o.id, kind: o.kind, props });
        if (props.locked && !getFlag(String(props.locked))) return;
        this.onTravel?.({
          target: String(props.target), floor: props.floor as string | undefined, entrance: props.entrance as string | undefined,
          at: typeof props.toX === 'number' && typeof props.toY === 'number' ? [props.toX, props.toY] : undefined,
        });
        return;
      case 'chest':
        if (state.objectState[o.id]) return;
        state.objectState[o.id] = true;
        this.sprites.get(o.id)?.setAlpha(0.45);
        break;
      case 'lever': {
        const flag = String(props.flag ?? `world.lever.${o.id}`);
        setFlag(flag, !getFlag(flag));
        break;
      }
      case 'waystone':
        if (!state.waystones.includes(o.id)) state.waystones.push(o.id);
        break;
    }
    if (props.rest || o.kind === 'waystone') bus.emit('world:rest', { pointId: o.id });
    bus.emit('interact', { objectId: o.id, kind: o.kind, props });
  }
}
