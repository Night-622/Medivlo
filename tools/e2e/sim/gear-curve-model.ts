/**
 * Gear curve (Claude 5 for Claude 1): the player model behind gear-curve.ts. A typical player wears whatever scores
 * better, sells what it replaces (salvages runed and better for ingots), and at each town visit buys a smith piece that
 * is a real upgrade and spends spare gold on Runeforge upgrades of worn gear. Every roll is the game's own:
 * rollKillLoot / openChest / questReward / shopStock (sim), upgradeCost / salvageYield (rules/runeforge.ts).
 */
import { CLASS_SCHOOL, MAGIC_SCHOOLS } from '@/core/constants';
import { kitFor, spellScaling } from '@/data/classes/hc/kits';
import { shopByNpc } from '@/data/items/hc/shops';
import { itemRarity } from '@/systems/rules/affixes';
import { creature } from '@/systems/rules/creatures';
import { P } from '@/systems/rules/curves';
import { itemInfo, itemWeaponDamage, rarityIndex, sellValue, slotsFor, TWO_HANDED } from '@/systems/rules/gear';
import { compileStats } from '@/systems/rules/playerStats';
import { reforgeCost, salvageYield, upgradeCost } from '@/systems/rules/runeforge';
import { newCharacter } from '@/systems/rules/character';
import { RARITY_ORDER, type CharacterSave, type GearSlot, type ItemInstance, type Rarity } from '@/systems/rules/types';
import { rollKillLoot } from '@/systems/sim/loot';
import { shopStock } from '@/systems/sim/shop';
import { Sim } from '@/systems/sim/Sim';
import type { EnemyEnt, PlayerEnt } from '@/systems/sim/state';
import type { SimPorts } from '@/systems/sim/world';

/** a gain this big (offence × EHP, geometric) counts as a real upgrade; anything better is still worn. A weapon carries the
 * whole offence side, an armour piece or trinket only a share of the defence, so a piece counts at a lower bar */
export const REAL_UPGRADE = 0.03;
export const REAL_UPGRADE_PIECE = 0.01;
export const realBar = (slot: GearSlot): number => (slot === 'main' || slot === 'off' ? REAL_UPGRADE : REAL_UPGRADE_PIECE);

/** One number for a loadout: √(offence × EHP), from the compiled stats (EHP as builds-probe refEhp). */
export function gearScore(s: CharacterSave): number {
  const st = compileStats(s).stats, L = s.level, cls = s.classId, school = CLASS_SCHOOL[cls];
  const w = s.equipment.main, [a, b] = w ? itemWeaponDamage(w) : [1, 2];
  const wAvg = ((a + b) / 2) * (1 + (st.power ?? 0));
  const caster = spellScaling(cls) === 'spell';
  const base = caster ? (st.sp ?? 0) + wAvg * 0.25 : wAvg + (st.sp ?? 0) * 0.25;
  const off = base * (1 + (st.dmg ?? 0) + (st[`dmg.${school}` as 'dmg'] ?? 0) + (caster ? st.spellDmg ?? 0 : 0))
    * (1 + Math.min(1, st.crit ?? 0) * (0.5 + (st.critd ?? 0))) * (1 + (caster ? st.castSpeed ?? 0 : st.atkSpeed ?? 0));
  const taken = (kind: string): number => {
    let m = (MAGIC_SCHOOLS as readonly string[]).includes(kind) ? 1 - Math.min(0.6, st[`resist.${kind}` as 'dmg'] ?? 0)
      : 1 - Math.min(0.75, (st.armor ?? 0) / ((st.armor ?? 0) + 40 + 12 * L));
    const wt = w ? itemInfo(w.base)?.weaponType : undefined;
    m *= Math.max(0.1, 1 + (st.dmgTaken ?? 0) - (wt && ['bow', 'staff', 'wand'].includes(wt) ? 0 : 0.12));
    return m * (1 - 0.6 * Math.min(0.75, st.block ?? 0));
  };
  const elem = (MAGIC_SCHOOLS as readonly string[]).includes(school) ? school : 'physical';
  const ehp = (st.hp ?? 100) / (0.6 * taken('physical') + 0.4 * taken(elem));
  return Math.sqrt(Math.max(1e-6, off) * ehp);
}

/** Best slot for an item and the score gain there (0 if it cannot be worn by this class). */
export function bestFit(s: CharacterSave, it: ItemInstance): { slot: GearSlot; gain: number } | null {
  const info = itemInfo(it.base);
  if (!info?.slot || info.questItem) return null;
  if (info.weaponType && !kitFor(s.classId).weapons.includes(info.weaponType)) return null;
  const before = gearScore(s);
  let best: { slot: GearSlot; gain: number } | null = null;
  for (const slot of slotsFor(info)) {
    const main = s.equipment.main && itemInfo(s.equipment.main.base);
    if (slot === 'off' && main?.weaponType && TWO_HANDED.includes(main.weaponType)) continue;
    const t: CharacterSave = { ...s, equipment: { ...s.equipment, [slot]: it } };
    if (slot === 'main' && info.weaponType && TWO_HANDED.includes(info.weaponType)) delete t.equipment.off;
    const gain = gearScore(t) / before - 1;
    if (!best || gain > best.gain) best = { slot, gain };
  }
  return best;
}

export interface Tally {
  gold: number; goldIn: Record<string, number>; goldOut: Record<string, number>;
  ingots: number; drops: Record<Rarity, number>; pieces: number; kills: number; chests: number; reforges: number;
  /** hero level − drop item level, summed with a count, by hero level band 1–10 / 11–20 / 21–30 / 31–40 */
  lag: [number, number][];
  /** hero level (integer) at each real upgrade, and its source */
  upgrades: { level: number; src: string; gain: number; rarity: Rarity }[];
}
export const newTally = (): Tally => ({
  gold: 0, goldIn: {}, goldOut: {}, ingots: 0, drops: Object.fromEntries(RARITY_ORDER.map((r) => [r, 0])) as Record<Rarity, number>, pieces: 0, kills: 0, chests: 0, reforges: 0, lag: [], upgrades: [],
});
const add = (m: Record<string, number>, k: string, v: number) => { m[k] = (m[k] ?? 0) + v; };

const ports: SimPorts = {
  move: (_s, x, y, dx, dy) => ({ x: x + dx, y: y + dy }), clear: () => true, zoneRule: () => 'wild',
  respawnPoint: () => ({ space: 't', x: 0, y: 0 }), emit: () => {}, partySize: () => 1, realmRule: () => 'peaceful',
};

/** One class's hero in a headless Sim: loot goes to the ground (w.loot) and is picked up here. */
export class Player {
  readonly sim: Sim; readonly p: PlayerEnt; readonly s: CharacterSave; readonly t = newTally();
  private seq = 0;
  constructor(readonly cls: string, seed: number) {
    this.sim = new Sim(ports, seed);
    this.sim.shopEnv = { flag: () => false, priceMult: () => 1 };
    this.s = newCharacter(cls);
    this.sim.addPlayer('me', this.s, { space: 't', x: 0, y: 0 });
    this.p = this.sim.w.players.get('p:me')!;
    this.t.gold = this.s.gold;
  }
  set level(L: number) { this.s.level = L; }
  get level(): number { return this.s.level; }

  /** a kill at the game's own drop rules (a minimal enemy record: tier, level, elite, the creature's drops) */
  kill(creatureId: string, level: number, tier: 'enemy' | 'mini' | 'boss', elite: boolean): void {
    const cdef = creature(creatureId) ?? creature(`bx_${CLASS_SCHOOL[this.cls]}_0`)!;
    const e = { id: `e${++this.seq}`, tier, level: Math.round(level), elite: elite ? ['x'] : [], space: 't', x: 0, y: 0, cdef } as unknown as EnemyEnt;
    rollKillLoot(this.sim.w, e, [this.p]);
    this.t.kills++;
    this.collect(tier === 'enemy' ? (elite ? 'elite' : 'kill') : tier);
  }
  chest(id: string, props: Record<string, string | number | boolean>): void {
    if (this.sim.openChest('me', id, props)) { this.t.chests++; this.collect(props.rarity === 'rare' ? 'rare chest' : 'chest'); }
  }
  quest(gold: number | undefined, items: { item: string; qty?: number; ilvl?: number }[] | undefined): void {
    if (gold) { this.t.gold += gold; add(this.t.goldIn, 'quests', gold); }
    if (!items?.length) return;
    const before = new Set(this.s.inventory.map((i) => i.uid));
    this.sim.questReward({ hcItems: items });
    for (const it of this.s.inventory.filter((i) => !before.has(i.uid))) this.consider(it, 'quest');
  }

  /** pick up everything on the ground: gold to the purse, gear considered, other items kept or sold */
  private collect(src: string): void {
    for (const [id, l] of this.sim.w.loot) {
      this.sim.w.loot.delete(id);
      if (l.gold) { this.t.gold += l.gold; add(this.t.goldIn, src, l.gold); }
      if (!l.item) continue;
      const it = { uid: `g${++this.seq}`, ...l.item, qty: l.item.qty ?? 1 } as ItemInstance;
      if (itemInfo(it.base)?.slot) this.consider(it, src); else this.loose(it);
    }
  }
  private loose(it: ItemInstance): void {
    if (it.base === 'i_ingot') this.t.ingots += it.qty ?? 1;
  }
  /** wear it if it scores better; otherwise sell it (salvage runed and better for ingots) */
  consider(it: ItemInstance, src: string): void {
    const r = itemRarity(it);
    if (src !== 'shop') {
      this.t.drops[r]++; this.t.pieces++;
      const band = Math.min(3, Math.floor((this.level - 1) / 10));
      this.t.lag[band] = [(this.t.lag[band]?.[0] ?? 0) + (this.level - it.ilvl), (this.t.lag[band]?.[1] ?? 0) + 1];
    }
    const fit = bestFit(this.s, it);
    const inv = this.s.inventory.indexOf(it);
    if (inv >= 0) this.s.inventory.splice(inv, 1);
    if (fit && fit.gain > 0.001) {
      const old = this.s.equipment[fit.slot];
      this.s.equipment[fit.slot] = it;
      if (fit.slot === 'main' && TWO_HANDED.includes(itemInfo(it.base)?.weaponType as never) && this.s.equipment.off) { this.dispose(this.s.equipment.off); delete this.s.equipment.off; }
      if (old) this.dispose(old);
      if (fit.gain >= realBar(fit.slot)) this.t.upgrades.push({ level: Math.floor(this.level), src, gain: fit.gain, rarity: r });
    } else this.dispose(it);
  }
  private dispose(it: ItemInstance): void {
    const y = rarityIndex(itemRarity(it)) >= rarityIndex('runed') ? salvageYield(it) : null;
    if (y) { this.t.ingots += y.ingots; return; }
    const v = sellValue(it);
    this.t.gold += v; add(this.t.goldIn, 'selling', v);
  }

  /** a town visit: buy a smith piece that is a real upgrade, then Runeforge upgrades with what is left over a reserve */
  town(): void {
    const smith = shopByNpc(`npc:${CLASS_SCHOOL[this.cls]}-smith`), pell = shopByNpc('npc:pell');
    const reserve = Math.round(40 * Math.pow(P(this.level), 0.6)); // potions and food
    const who = { classId: this.cls, level: this.level, school: CLASS_SCHOOL[this.cls], weapons: kitFor(this.cls).weapons };
    // kit gear at the class's smith; rings and amulets at Pell's stall (Concordia village: the only trinket seller)
    const lines = [smith, pell].flatMap((sh) => (sh ? shopStock(sh, who, () => false, 1) : []))
      .filter((l) => /^[wa]_/.test(l.item) || itemInfo(l.item)?.slot);
    {
      for (const l of lines) {
        const it = { uid: `s${++this.seq}`, base: l.item, ilvl: this.level, qty: 1 } as ItemInstance;
        const fit = bestFit(this.s, it);
        if (!fit || fit.gain < realBar(fit.slot) || this.t.gold - l.price < reserve) continue;
        this.t.gold -= l.price; add(this.t.goldOut, /^[wa]_/.test(l.item) ? 'smith gear' : 'trinkets (Pell)', l.price);
        this.consider(it, 'shop');
      }
    }
    if (process.env.RF === '0') return; // raw loot: no Runeforge
    // ingots: the smith sells them; buy what a Runeforge step needs (false when the purse can't cover it)
    const ingotPrice = smith ? shopStock(smith, { classId: this.cls, level: this.level, school: CLASS_SCHOOL[this.cls], weapons: kitFor(this.cls).weapons }, () => false, 1).find((l) => l.item === 'i_ingot')?.price ?? 8 : 8;
    const pay = (gold: number, ingots: number, what: string): boolean => {
      const buy = Math.max(0, ingots - this.t.ingots), total = gold + buy * ingotPrice;
      if (this.t.gold - total < reserve) return false;
      this.t.gold -= total; this.t.ingots += buy - ingots;
      add(this.t.goldOut, what, gold); if (buy) add(this.t.goldOut, 'ingots', buy * ingotPrice);
      return true;
    };
    // Runeforge reforge: a worn piece 4+ levels behind is brought to the hero's level when that is a real upgrade
    for (const [slot, it] of Object.entries(this.s.equipment) as [GearSlot, ItemInstance | undefined][]) {
      if (!it || it.ilvl > this.level - 4) continue;
      const c = reforgeCost(it, this.level);
      if (!c) continue;
      const t: CharacterSave = { ...this.s, equipment: { ...this.s.equipment, [slot]: { ...it, ilvl: c.to } } };
      if (gearScore(t) / gearScore(this.s) - 1 < realBar(slot) || !pay(c.gold, c.ingots, 'runeforge reforges')) continue;
      it.ilvl = c.to;
      this.t.reforges++;
    }
    // Runeforge upgrades: the cheapest next step among worn pieces close to the hero's level, while gold lasts
    for (let k = 0; k < 20; k++) {
      const worn = Object.values(this.s.equipment).filter((x): x is ItemInstance => !!x && x.ilvl >= this.level - 4);
      const opts = worn.map((it) => ({ it, c: upgradeCost(it) })).filter((o): o is { it: ItemInstance; c: NonNullable<ReturnType<typeof upgradeCost>> } => !!o.c)
        .sort((a, b) => a.c.gold - b.c.gold);
      const o = opts[0];
      if (!o || !pay(o.c.gold, o.c.ingots, 'runeforge upgrades')) break;
      o.it.upgrade = o.c.to;
    }
  }

  /** what the equipped set looks like now */
  snapshot(): { ilvl: number; rarity: Record<string, number>; upgrade: number; score: number; empty: string[] } {
    const worn = Object.entries(this.s.equipment).filter(([, x]) => !!x) as [string, ItemInstance][];
    const rarity: Record<string, number> = {};
    for (const [, x] of worn) rarity[itemRarity(x)] = (rarity[itemRarity(x)] ?? 0) + 1;
    const slots: GearSlot[] = ['main', 'off', 'head', 'chest', 'hands', 'feet', 'ring1', 'ring2', 'amulet'];
    // item level over weapons and armour only (trinkets keep the level they were bought at)
    const gear = worn.filter(([k]) => !/^(ring|amulet)/.test(k));
    return {
      ilvl: gear.reduce((a, [, x]) => a + x.ilvl, 0) / Math.max(1, gear.length), rarity,
      upgrade: worn.reduce((a, [, x]) => a + (x.upgrade ?? 0), 0) / Math.max(1, worn.length), score: gearScore(this.s),
      empty: slots.filter((k) => !this.s.equipment[k]),
    };
  }
}
