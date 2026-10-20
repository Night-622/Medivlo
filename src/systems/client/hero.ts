/**
 * Hollow Crown hero in a world scene (Claude 3): installs the systems authority where this client simulates,
 * sends the character loadout, and wires the client side (CombatView, CombatFx, HeroInput, hotbar on the HUD).
 * WorldV2 calls createHero(scene, space, x, y) and follows `sprite` with the camera.
 */
import Phaser from 'phaser';
import { SceneKeys } from '@/core/constants';
import { Services } from '@/core/services';
import { installSystemsAuthority, systemsAuthority } from '@/systems/sim';
import { bus } from '@/core/EventBus';
import { getFlag } from '@/core/flags';
import { trustPrice } from '@/narrative/engine/trust';
import { ShopPanel } from '@/ui/character/hc/ShopPanel';
import { HeroInput } from '@/systems/input/HeroInput';
import { CombatFx } from '@/systems/view/fx';
import { CombatView } from '@/systems/view/CombatView';
import { hasSideView } from '@/art';
import { Hotbar } from '@/ui/character/hc/Hotbar';
import { BossBar, BuffRow } from '@/ui/character/hc/HudExtras';
import { CharacterPanels } from '@/ui/character/hc/CharacterPanels';
import { changed, character, installCharacterSync, sendLoadout } from './character';

export interface HeroHandle {
  readonly sprite: Phaser.GameObjects.Sprite;
  readonly x: number;
  readonly y: number;
  readonly input: HeroInput;
  readonly view: CombatView;
  teleport(x: number, y: number, space?: string): void;
  destroy(): void;
}

let syncOff: (() => void) | null = null;

export function createHero(scene: Phaser.Scene, space: string, x: number, y: number): HeroHandle {
  const net = Services.get('net');
  if (net.isAuthority()) installSystemsAuthority({ priceMult: (npc) => trustPrice(npc as never), flag: (k) => getFlag(k) });
  syncOff ??= installCharacterSync();
  // gold for dialogue costs and gifts (local character; the authority shares the object in solo / host)
  Services.register('economy', {
    gold: () => character().gold,
    spend: (n) => { const c = character(); if (c.gold < n) return false; c.gold -= n; sendLoadout(); return true; },
    give: (n) => { character().gold += n; sendLoadout(); },
  });
  const localId = `p:${net.localPlayer}`;
  let curSpace = space;
  const c = character();
  sendLoadout();
  net.send({ type: 'act', domain: 'systems', action: 'teleport', args: { space, x, y } });

  const view = new CombatView(scene, localId, () => curSpace, x, y, c.classId);
  const offView = net.addConsumer(view);
  const fx = new CombatFx(scene, () => localId, (px, py) => view.visible(px, py), view);
  const input = new HeroInput(scene, view);
  const panels = new CharacterPanels(scene, input);
  const shop = new ShopPanel(scene, input);

  // hotbar on the HUD's bottom anchor (the HUD may start a frame after us)
  let bar: Hotbar | null = null, buffs: BuffRow | null = null, boss: BossBar | null = null;
  const mount = () => {
    const hud = scene.scene.get(SceneKeys.HudV2) as Phaser.Scene & { anchors?: Record<string, Phaser.GameObjects.Container> };
    if (!hud?.anchors?.bottom || bar) return !!bar;
    bar = new Hotbar(hud, input);
    hud.add.existing(bar);
    hud.anchors.bottom.add(bar);
    buffs = new BuffRow(hud);
    hud.add.existing(buffs);
    hud.anchors.topLeft?.add(buffs);
    boss = new BossBar(hud);
    hud.add.existing(boss);
    return true;
  };
  const timer = scene.time.addEvent({ delay: 100, loop: true, callback: () => { if (mount()) timer.remove(); } });

  if (import.meta.env.DEV) installDevHandle(scene, view, () => curSpace);

  const handle: HeroHandle = {
    sprite: view.local, input, view,
    get x() { return view.local.x; },
    get y() { return view.local.y; },
    teleport(tx: number, ty: number, sp?: string) {
      if (sp) curSpace = sp;
      view.local.setPosition(tx, ty);
      net.send({ type: 'act', domain: 'systems', action: 'teleport', args: { space: curSpace, x: tx, y: ty } });
    },
    destroy() {
      timer.remove();
      offView();
      fx.destroy();
      input.destroy();
      panels.destroy();
      shop.destroy();
      view.destroy();
      bar?.destroy();
      buffs?.destroy();
      boss?.destroy();
      view.local.destroy();
    },
  };
  return handle;
}

/** event counters live once per page (createHero runs on every World create; re-adding them leaked handlers) */
const DEV_COUNTS: Record<string, number> = {};
let devCounting = false;
/** DEV / e2e: window.__hc — spawn creatures, read the local entity, convert world → screen, count events. */
function installDevHandle(scene: Phaser.Scene, view: CombatView, space: () => string): void {
  const counts = DEV_COUNTS;
  if (!devCounting) for (const ev of ['enemy:killed', 'player:died', 'player:levelup', 'loot:granted', 'combat:hit', 'ability:cast', 'player:downed'] as const) {
    bus.on(ev, () => { counts[ev] = (counts[ev] ?? 0) + 1; });
  }
  devCounting = true;
  const me =() => systemsAuthority()?.sim.w.players.get(`p:${Services.get('net').localPlayer}`);
  (window as unknown as { __hc: unknown }).__hc = {
    counts,
    character,
    local: () => { const p = me(); return p && { x: p.x, y: p.y, hp: p.hp, maxHp: p.maxHp, ember: p.ember, level: p.level, dead: p.dead, target: p.target, space: p.space }; },
    enemies: () => [...(systemsAuthority()?.sim.w.enemies.values() ?? [])].filter((e) => !e.dead).map((e) => ({ id: e.id, def: e.def, x: e.x, y: e.y, hp: e.hp, maxHp: e.maxHp, ai: e.ai })),
    spawn: (creature: string, n = 1, level?: number, dist = 140) => {
      const p = me();
      if (!p) return [];
      return Array.from({ length: n }, (_, i) => Services.get('combat').spawn({ creature, level: level ?? p.level, space: space(), x: p.x + dist * Math.cos(i * 2.1), y: p.y + dist * Math.sin(i * 2.1) }));
    },
    /** what CombatView is drawing right now (ids, kinds, defs, positions) */
    views: () => view.dump(),
    sprite: () => {
      const o = view.local, cam = scene.cameras.main;
      return { key: o.texture.key, frame: o.frame.name, x: o.x, y: o.y, visible: o.visible, alpha: o.alpha, depth: o.depth, w: o.displayWidth, h: o.displayHeight,
        anim: o.anims.currentAnim?.key ?? '', flipX: o.flipX, side: hasSideView(scene, o.texture.key),
        cam: { x: cam.worldView.x, y: cam.worldView.y, w: cam.worldView.width, h: cam.worldView.height, zoom: cam.zoom }, active: o.active };
    },
    screenOf: (id: string) => {
      const r = view.entity(id);
      if (!r) return null;
      const cam = scene.cameras.main;
      const canvas = scene.game.canvas.getBoundingClientRect();
      const sx = (r.x - cam.worldView.x) * cam.zoom, sy = (r.y - 12 - cam.worldView.y) * cam.zoom;
      return { x: canvas.left + (sx * canvas.width) / scene.scale.width, y: canvas.top + (sy * canvas.height) / scene.scale.height };
    },
    /** the page-pixel rectangle an entity's sprite covers (hc-features clicks its edges) */
    bounds: (id: string) => {
      const r = view.entity(id);
      if (!r || !('getBounds' in r.obj)) return null;
      const b = (r.obj as Phaser.GameObjects.Sprite).getBounds(), cam = scene.cameras.main, canvas = scene.game.canvas.getBoundingClientRect();
      const px = (x: number) => canvas.left + ((x - cam.worldView.x) * cam.zoom * canvas.width) / scene.scale.width;
      const py = (y: number) => canvas.top + ((y - cam.worldView.y) * cam.zoom * canvas.height) / scene.scale.height;
      return { x: px(b.x), y: py(b.y), w: px(b.right) - px(b.x), h: py(b.bottom) - py(b.y) };
    },
    /** a creature that only uses the ability whose text matches, never moves and never basic-attacks */
    rig: (id: string, text: string) => {
      const e = systemsAuthority()?.sim.w.enemies.get(id);
      const ab = e && [...e.cdef.abilities, ...e.cdef.phases.flat()].find((a) => a.text.toLowerCase().includes(text.toLowerCase()));
      if (!e || !ab) return false;
      // no basic attack at all (attackRange 0, not ranged): a skipped ability roll must not park it behind a basic
      // one strike per rig (60 s cooldown) with a 1.2 s wind-up: time for a real key press to step out of it
      e.cdef = { ...e.cdef, abilities: [{ ...ab, cd: 60000, windup: Math.max(ab.windup, 1200) }], phases: [], ai: { ...e.cdef.ai, speed: 0, immobile: true, ranged: false, attackRange: 0 } };
      e.abilityReadyAt.clear();
      return true;
    },
    /** a creature that stands still and never notices anyone (a click target) */
    freeze: (id: string) => {
      const e = systemsAuthority()?.sim.w.enemies.get(id);
      if (!e) return false;
      e.cdef = { ...e.cdef, abilities: [], phases: [], ai: { ...e.cdef.ai, speed: 0, immobile: true, aggro: 0, attackRange: 0, ranged: false } };
      return true;
    },
    /** put an item in the local pack (the authority's copy is the same save in solo) */
    give: (base: string, ilvl = 1) => { const c = character(); c.inventory.push({ uid: `dev-${base}-${c.inventory.length}-${Date.now()}`, base, ilvl, qty: 1 }); sendLoadout(); changed(); return true; },
    heal: () => { const p = me(); if (p) { p.hp = p.maxHp; p.ember = p.emberMax; } },
  };
}
