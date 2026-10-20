/**
 * Gear rules: item lookup across the generated tables, item-level scaling, trinkets, gems,
 * armour set bonuses (style × school) and legendary effects. Pure.
 */
import { HC_PIECES, HC_SETS, HC_STYLES } from '@/data/items/hc/armour.gen';
import { HC_ITEMS } from '@/data/items/hc/items.gen';
import { HC_LEGENDARIES } from '@/data/items/hc/legendary.gen';
import { HC_MATERIALS, HC_WEAPONS } from '@/data/items/hc/weapons.gen';
import { HC_BESTIARY } from '@/data/enemies/hc/bestiary.gen';
import { campaignItem } from '@/data/items/hc/campaign-items';
import { P } from './curves';
import { scalePassive } from './scale';
import type {
  Action, GearSlot, HcArmourPiece, HcArmourSet, HcLegendaryBase, HcWeaponBase, ItemCat, Modifier, Passive, Proc, Rarity,
  SchoolId, StatKey, StyleId, Trigger, WeaponType,
} from './types';
import { RARITY_ORDER } from './types';

// ───────────── item instances & lookup ─────────────
import type { ItemInstance } from "./types";
export type { ItemInstance };

export type ItemKind = 'weapon' | 'armour' | 'trinket' | 'legendary' | ItemCat;
export interface ItemInfo {
  id: string; name: string; kind: ItemKind; rarity: Rarity; value: number; desc?: string;
  /** equip slot family: ring covers ring1/ring2, weapon covers main (and off for daggers/wands) */
  slot?: 'weapon' | 'head' | 'chest' | 'hands' | 'feet' | 'ring' | 'amulet';
  weaponType?: WeaponType; stackable: boolean; questItem: boolean;
}

const WEAPON = new Map(HC_WEAPONS.map((w) => [w.id, w]));
const PIECE = new Map(HC_PIECES.map((p) => [p.id, p]));
const SET = new Map(HC_SETS.map((s) => [s.id, s]));
const ITEM = new Map(HC_ITEMS.map((i) => [i.id, i]));
const LEG = new Map(HC_LEGENDARIES.map((l) => [l.id, l]));
const MAT_INDEX = new Map(HC_MATERIALS.map((m, i) => [m.id, i]));
const STYLE_INDEX = new Map<string, number>(HC_STYLES.map((s, i) => [s, i]));

export const RING_IDS = ['i_copper', 'i_silver', 'i_signet', 'i_emberring'];
export const AMULET_IDS = ['i_bonecharm', 'i_locket', 'i_sunpend', 'i_moonpend'];
export const TWO_HANDED: WeaponType[] = ['spear', 'bow', 'staff'];
export const OFFHAND_OK: WeaponType[] = ['dagger', 'wand'];

export function itemInfo(id: string): ItemInfo | undefined {
  // bespoke story items: the stand-in base gives the shape, the story item its name, rarity and slot
  const ci = campaignItem(id);
  if (ci) {
    const b = itemInfo(ci.base);
    if (!b) return undefined;
    if (ci.kind === 'relic') return { ...b, id, name: ci.name, kind: 'relic', rarity: ci.rarity, desc: ci.desc, slot: undefined, weaponType: undefined, stackable: false, questItem: true };
    return { ...b, id, name: ci.name, rarity: ci.rarity, desc: ci.desc, stackable: false, questItem: false, value: Math.max(b.value, 60),
      ...(ci.kind === 'trinket' ? { kind: 'trinket' as const, slot: ci.slot, weaponType: undefined } : {}) };
  }
  const w = WEAPON.get(id);
  if (w) return { id, name: w.name, kind: 'weapon', rarity: w.rarity, value: w.value, slot: 'weapon', weaponType: w.type, stackable: false, questItem: false };
  const p = PIECE.get(id);
  if (p) return { id, name: p.name, kind: 'armour', rarity: p.rarity, value: p.value, slot: p.slot, stackable: false, questItem: false };
  const l = LEG.get(id);
  if (l) {
    const base = WEAPON.get(l.base);
    return {
      id, name: l.name, kind: 'legendary', rarity: 'spark', value: l.value, desc: l.fx, stackable: false, questItem: false,
      slot: l.slot === 'main' ? 'weapon' : l.slot, weaponType: base?.type,
    };
  }
  const it = ITEM.get(id);
  if (!it) return undefined;
  const ring = RING_IDS.includes(id), amulet = AMULET_IDS.includes(id);
  return {
    id, name: it.name, kind: ring || amulet ? 'trinket' : it.cat, rarity: it.rarity, value: it.value, desc: it.desc,
    slot: ring ? 'ring' : amulet ? 'amulet' : undefined,
    stackable: !(ring || amulet), questItem: it.cat === 'relic',
  };
}

/** Resolve an alias (story item) to the handoff id that carries its stats and art. */
export const statBase = (id: string): string => { const ci = campaignItem(id); return ci && ci.kind !== 'relic' ? ci.base : id; };
export const weaponBase = (id: string): HcWeaponBase | undefined => WEAPON.get(statBase(id)) ?? WEAPON.get(LEG.get(id)?.base ?? '');
export const armourPiece = (id: string): HcArmourPiece | undefined => PIECE.get(statBase(id));
export const armourSet = (id: string): HcArmourSet | undefined => SET.get(id);
export const legendary = (id: string): HcLegendaryBase | undefined => LEG.get(id);
export const rarityIndex = (r: Rarity): number => RARITY_ORDER.indexOf(r);

/** Which equip slots an item may go in. */
export function slotsFor(info: ItemInfo): GearSlot[] {
  switch (info.slot) {
    case 'weapon': return info.weaponType && OFFHAND_OK.includes(info.weaponType) ? ['main', 'off'] : ['main'];
    case 'ring': return ['ring1', 'ring2'];
    case 'amulet': return ['amulet'];
    case 'head': case 'chest': case 'hands': case 'feet': return [info.slot];
    default: return [];
  }
}

// ───────────── item-level scaling ─────────────
/** Normalise a handoff value (authored at handoff ilvl) and scale it to item level L. */
const norm = (v: number, handoffIlvl: number, L: number): number => (v / Math.pow(1.075, handoffIlvl - 1)) * P(L);
/** Ember on gear grows gently so Ember costs stay meaningful. */
const emberScale = (v: number, L: number): number => v * (1 + 0.03 * (L - 1));

export function weaponDamage(id: string, ilvl: number): [number, number] {
  const w = weaponBase(id);
  if (!w) return [1, 2];
  const m = (1 + 0.05 * (MAT_INDEX.get(w.material) ?? 0)) * materialLift(w.type, w.material) + (LEG.has(id) ? 0.15 : 0);
  return [Math.round(norm(w.dmg[0], w.ilvl, ilvl) * m), Math.round(norm(w.dmg[1], w.ilvl, ilvl) * m)];
}

/**
 * The handoff's damage grows slower than 1.075 per handoff ilvl at the top materials, so at equal item level a
 * better material could hit softer. Lift each material so it is at least 3% above the one below it (per type).
 */
let LIFT: Map<string, number> | null = null;
function materialLift(type: WeaponType, material: string): number {
  if (!LIFT) {
    LIFT = new Map();
    const types = new Set(HC_WEAPONS.map((x) => x.type));
    for (const t of types) {
      let prev = 0;
      for (const mat of HC_MATERIALS) {
        const x = HC_WEAPONS.find((y) => y.type === t && y.material === mat.id);
        if (!x) continue;
        const own = (norm((x.dmg[0] + x.dmg[1]) / 2, x.ilvl, 1)) * (1 + 0.05 * (MAT_INDEX.get(mat.id) ?? 0));
        const want = Math.max(own, prev * 1.03);
        LIFT.set(`${t}:${mat.id}`, want / own);
        prev = want;
      }
    }
  }
  return LIFT.get(`${type}:${material}`) ?? 1;
}

const f = (stat: StatKey, value: number): Modifier => ({ stat, op: 'flat', value });

/** Trinket stats; flat numbers scale with item level. */
const TRINKET: Record<string, (L: number) => Modifier[]> = {
  i_copper: (L) => [f('hp', 15 * P(L))],
  i_silver: () => [f('crit', 0.03)],
  i_signet: () => [f('crit', 0.02), f('critd', 0.15)],
  i_emberring: (L) => [f('ember', emberScale(15, L)), f('emberRegen', 1)],
  i_bonecharm: (L) => [f('resist.umbral', 0.15), f('armor', 8 * P(L))],
  i_locket: (L) => [f('hp', 30 * P(L)), f('hpRegen', 0.02 * 30 * P(L))],
  i_sunpend: (L) => [f('sp', 4 * P(L)), f('healing', 0.1)],
  i_moonpend: (L) => [f('sp', 6 * P(L)), f('crit', 0.03)],
};

/** Gems: one socket on runed-or-better gear. */
export const GEMS: Record<string, { label: string; mods: (L: number) => Modifier[] }> = {
  i_ruby: { label: '+health', mods: (L) => [f('hp', 25 * P(L))] },
  i_sapphire: { label: '+Ember', mods: (L) => [f('ember', emberScale(12, L))] },
  i_emerald: { label: '+health regen', mods: (L) => [f('hpRegen', 0.5 * P(L))] },
  i_amethyst: { label: '+spell power', mods: (L) => [f('sp', 3 * P(L))] },
  i_topaz: { label: '+crit chance', mods: () => [f('crit', 0.03)] },
  i_moonstone: { label: '+Ember regen', mods: () => [f('emberRegen', 1)] },
  i_onyx: { label: '+armour', mods: (L) => [f('armor', 10 * P(L))] },
  i_embershard: { label: '+damage', mods: () => [f('dmg', 0.06)] },
};
export const canSocket = (info: ItemInfo): boolean =>
  (info.kind === 'weapon' || info.kind === 'armour' || info.kind === 'trinket' || info.kind === 'legendary') && rarityIndex(info.rarity) >= 3;

/** Stat modifiers an equipped item contributes on its own (no set bonuses). */
export function itemMods(it: ItemInstance): Modifier[] {
  const L = it.ilvl, out: Modifier[] = [];
  const piece = armourPiece(it.base);
  if (piece) {
    if (piece.stats.armor) out.push(f('armor', norm(piece.stats.armor, piece.ilvl, L)));
    if (piece.stats.hp) out.push(f('hp', norm(piece.stats.hp, piece.ilvl, L)));
    if (piece.stats.ember) out.push(f('ember', emberScale(piece.stats.ember, L)));
  }
  const lg = LEG.get(it.base);
  const trinketId = lg && lg.slot !== 'main' ? lg.base : statBase(it.base);
  if (TRINKET[trinketId]) out.push(...TRINKET[trinketId](L).map((m) => (lg ? { ...m, value: m.value * 1.5 } : m)));
  if (it.gem && GEMS[it.gem]) out.push(...GEMS[it.gem].mods(L));
  return out;
}

// ───────────── armour sets ─────────────
const STYLE_TRIGGER: Record<StyleId, { on: Trigger; every?: number; icd?: number }> = {
  cloth: { on: 'attack', every: 5 }, leather: { on: 'dash' }, fur: { on: 'kill' }, mail: { on: 'hurt', icd: 4000 },
  robe: { on: 'cast', icd: 3000 }, scale: { on: 'lowHp', icd: 30000 }, plate: { on: 'block' }, vestment: { on: 'heal', icd: 2000 },
};
const near = (r = 72) => ({ shape: 'circle' as const, at: 'self' as const, r });
const nearest = { shape: 'single' as const, at: 'target' as const, r: 220 };
export const SCHOOL_EFFECT: Record<SchoolId, Action[]> = {
  ash: [{ a: 'damage', coef: 0.3, kind: 'ash', area: near(), status: [{ id: 'burn', dur: 3000 }] }],
  rime: [{ a: 'status', status: { id: 'freeze', dur: 1500 }, area: near() }],
  storm: [{ a: 'chain', coef: 0.5, kind: 'storm', jumps: 3, range: 140 }],
  radiance: [{ a: 'shield', pctMax: 0.15, dur: 6000, to: 'self' }],
  umbral: [{ a: 'damage', coef: 0.5, kind: 'umbral', area: nearest, flags: ['lifesteal'] }],
  verdant: [{ a: 'status', status: { id: 'root', dur: 1500 }, area: near() }, { a: 'heal', pctMax: 0.08, over: 4000, to: 'self' }],
  blade: [{ a: 'buff', id: 'set:keen', dur: 8000, to: 'self', charges: 1, flags: ['nextHitsCrit', 'nextHitsTrue'] }],
  iron: [{ a: 'buff', id: 'set:bulwark', dur: 3000, to: 'self', mods: [f('dmgTaken', -0.4)] }],
  fist: [{ a: 'resource', momentum: 1 }],
  hunt: [{ a: 'status', status: { id: 'mark', dur: 6000, power: 0.25 }, area: nearest, maxTargets: 1 }],
  guile: [{ a: 'buff', id: 'set:smoke', dur: 1000, to: 'self', flags: ['untargetable'] }],
  song: [{ a: 'buff', id: 'set:chord', dur: 5000, to: 'allies', r: 180, mods: [f('dmg', 0.15)] }],
};

/** 2-piece bonus by style; flat values scale with the set's item level. */
function twoPiece(style: StyleId, L: number): Modifier[] {
  switch (style) {
    case 'cloth': return [f('moveSpeed', 0.1)];
    case 'leather': return [f('crit', 0.08)];
    case 'fur': return [f('hp', 60 * P(L))];
    case 'mail': return [f('armor', 15 * P(L))];
    case 'robe': return [f('ember', emberScale(30, L))];
    case 'scale': return [{ stat: 'dmgTaken', op: 'flat', value: -0.1, when: { c: 'hpBelow', pct: 0.5 } }];
    case 'plate': return [f('armor', 25 * P(L))];
    case 'vestment': return [f('emberRegen', 2)];
  }
}

export const ATTUNED: Record<SchoolId, Passive> = {
  ash: { mods: [f('dmg.ash', 0.15)], hooks: [{ id: 'burnDurMs', value: 1000 }] },
  rime: { mods: [f('dmg.rime', 0.15), f('slowPower', 0.2)] },
  storm: { mods: [f('dmg.storm', 0.15), f('chains', 1)] },
  radiance: { mods: [f('healing', 0.15), f('healingTaken', 0.15)] },
  umbral: { mods: [f('lifesteal', 0.1)] },
  verdant: { mods: [{ stat: 'hpRegen', op: 'flat', value: 3, when: { c: 'inCombat' } }] },
  blade: { mods: [{ stat: 'crit', op: 'flat', value: 0.1, when: { c: 'weapon', types: ['sword', 'dagger'] } }] },
  iron: { mods: [f('block', 0.1)] },
  fist: { mods: [f('atkSpeed', 0.1)] },
  hunt: { mods: [{ stat: 'dmg', op: 'flat', value: 0.15, when: { c: 'targetFar', px: 200 } }] },
  guile: { mods: [f('gold', 0.2)] },
  song: { mods: [f('buffDur', 0.3)] },
};

export interface SetProgress { set: HcArmourSet; count: number; ilvl: number }

export function setProgress(equipped: ItemInstance[]): SetProgress[] {
  const by = new Map<string, SetProgress>();
  for (const it of equipped) {
    const p = armourPiece(it.base);
    if (!p) continue;
    const cur = by.get(p.set) ?? { set: SET.get(p.set)!, count: 0, ilvl: it.ilvl };
    cur.count++;
    cur.ilvl = Math.min(cur.ilvl, it.ilvl);
    by.set(p.set, cur);
  }
  return [...by.values()];
}

/** attuned: Attuned strength (Set Mastery makes it 25% stronger: 1.25) */
export function setBonuses(equipped: ItemInstance[], classSchool: SchoolId, attuned = 1): Passive[] {
  const out: Passive[] = [];
  for (const { set, count, ilvl } of setProgress(equipped)) {
    if (count >= 2) out.push({ mods: twoPiece(set.style, ilvl) });
    if (count >= 4) {
      const t = STYLE_TRIGGER[set.style];
      const proc: Proc = { on: t.on, every: t.every, icd: t.icd, do: SCHOOL_EFFECT[set.school] };
      if (set.style === 'scale') proc.when = { c: 'hpBelow', pct: 0.5 };
      out.push({ procs: [proc] });
      if (set.school === classSchool) out.push(scalePassive(ATTUNED[set.school], attuned));
    }
  }
  return out;
}

// ───────────── legendaries ─────────────
/** Boss element → damage kind of its shockwave / echo, and its signature status for the immunity effect. */
export function bossElement(bossId: string): { kind: SchoolId | 'physical'; signature: string } {
  const b = HC_BESTIARY.find((x) => x.id === bossId);
  const first = (b?.element ?? '').split('·')[0].trim().toLowerCase();
  const kind = (['ash', 'rime', 'storm', 'radiance', 'umbral', 'verdant', 'blade', 'iron', 'fist', 'hunt', 'guile', 'song'] as const)
    .find((s) => s === first) ?? 'physical';
  const SIG: Record<string, string> = { ash: 'burn', rime: 'freeze', storm: 'shock', radiance: 'blind', umbral: 'doom', verdant: 'root', physical: 'bleed' };
  return { kind, signature: SIG[kind] ?? 'stun' };
}

export function legendaryPassive(id: string): Passive {
  const l = LEG.get(id);
  if (!l) return {};
  const { kind, signature } = bossElement(l.boss);
  switch (l.fxIndex) {
    case 0: return { procs: [{ on: 'hit', every: 3, do: [{ a: 'damage', coef: 0.6, kind, area: { shape: 'circle', at: 'target', r: 64 } }] }] };
    case 1: return { procs: [{ on: 'kill', do: [{ a: 'heal', pctMax: 0.1, to: 'self' }, { a: 'resource', ember: 10 }] }] };
    case 2: return { mods: [f('ultCdr', 0.3)] };
    case 3: return { hooks: [{ id: `immune:${signature}` }] };
    case 4: return { procs: [{ on: 'crit', icd: 1500, do: [{ a: 'summon', what: `echo:${l.boss}`, count: 1, dur: 3000, power: 0.5 }] }] };
    default: return { mods: [{ stat: 'dmg', op: 'flat', value: 0.25, when: { c: 'targetTier', tiers: ['mini', 'boss'] } }] };
  }
}

/** Material / style index for drop gating. */
export const materialIndex = (id: string): number => MAT_INDEX.get(weaponBase(id)?.material ?? '') ?? 0;
export const styleIndex = (pieceId: string): number => STYLE_INDEX.get(SET.get(PIECE.get(pieceId)?.set ?? '')?.style ?? '') ?? 0;
