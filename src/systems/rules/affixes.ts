/**
 * Random affixes (Claude 3, docs/systems/BUILDS.md §2.3). Pure: the authority rolls them on drops (sim/loot.ts),
 * every client compiles them into the same passives (playerStats), and remote loadouts are sanitised against the
 * same tables (validate). Pools: src/data/items/hc/affixes.ts (Claude 5).
 */
import type { Rng } from '@/core/rng';
import { HC_AFFIXES } from '@/data/items/hc/affixes';
import { AFFIX_COUNT, RARITY_WEIGHT, SOCKETS, type AffixDef, type AffixSlot, type RolledAffix } from './affixTypes';
import { P } from './curves';
import { OFFHAND_OK, itemInfo, rarityIndex } from './gear';
import { RARITY_ORDER, type Action, type ItemInstance, type Modifier, type Passive, type Proc, type Rarity, type SchoolId } from './types';

const BY_ID = new Map(HC_AFFIXES.map((a) => [a.id, a]));
export const affixDef = (id: string): AffixDef | undefined => BY_ID.get(id);

/** Affix-bearing slot families of an item base (daggers and wands roll weapon and off-hand affixes). */
export function affixSlots(base: string): AffixSlot[] {
  const info = itemInfo(base);
  if (!info?.slot || info.kind === 'legendary' || info.questItem) return [];
  if (info.slot === 'weapon') return info.weaponType && OFFHAND_OK.includes(info.weaponType) ? ['weapon', 'offhand'] : ['weapon'];
  return [info.slot];
}

/** Can this base carry rolled rarity / affixes at all? (gear only; uniques and story items are fixed) */
export const rollable = (base: string): boolean => affixSlots(base).length > 0;

/** The item's rarity: rolled, else its base's. */
export const itemRarity = (it: Pick<ItemInstance, 'base' | 'rarity'>): Rarity => (it.rarity as Rarity | undefined) ?? itemInfo(it.base)?.rarity ?? 'common';
/** Socket count: by rolled rarity (BUILDS.md §2.3), legacy items by their base's rarity. */
export const socketCount = (it: Pick<ItemInstance, 'base' | 'rarity'>): number => (rollable(it.base) || itemInfo(it.base)?.kind === 'legendary' ? SOCKETS[itemRarity(it)] : 0);

// ───────────── rolling ─────────────
export type DropTier = 'enemy' | 'mini' | 'boss' | 'chest';

/** Rolled rarity: weights at luck 0, itemFind / chest luck lift everything above common, minis ×2 above fine, bosses ×5 above ember. */
export function rollRarity(rng: Rng, luck = 0, tier: DropTier = 'enemy'): Rarity {
  const w = RARITY_ORDER.map((r, i) => {
    let x = RARITY_WEIGHT[r];
    if (i >= 1) x *= 1 + luck;
    if (tier === 'mini' && i >= 2) x *= 2;
    if (tier === 'boss' && i >= 3) x *= 5;
    return x;
  });
  let roll = rng.next() * w.reduce((a, b) => a + b, 0);
  for (let i = 0; i < w.length; i++) { roll -= w[i]; if (roll < 0) return RARITY_ORDER[i]; }
  return 'common';
}

/** The tier in force at an item level (the last one at or below it). */
export function tierAt(a: AffixDef, ilvl: number): AffixDef['tiers'][number] | undefined {
  let t: AffixDef['tiers'][number] | undefined;
  for (const x of a.tiers) if (x.ilvl <= ilvl) t = x;
  return t;
}

const INTEGER = (a: AffixDef): boolean => 'spellLevels' in a.effect || 'schoolLevels' in a.effect || ('mod' in a.effect && a.effect.mod.stat === 'projCount');
const roundV = (a: AffixDef, v: number): number => (INTEGER(a) ? Math.round(v) : Math.round(v * 1000) / 1000);

export interface AffixFor { classId?: string; school?: SchoolId | string }

/** Roll `count` affixes for a base at an item level: groups unique, ≤ 2 prefixes and ≤ 2 suffixes, class/school locks. */
export function rollAffixes(rng: Rng, base: string, ilvl: number, rarity: Rarity, forWho?: AffixFor): RolledAffix[] {
  const slots = affixSlots(base);
  if (!slots.length) return [];
  const [lo, hi] = AFFIX_COUNT[rarity];
  const want = rng.int(lo, hi);
  const out: RolledAffix[] = [], groups = new Set<string>(), kinds = { prefix: 0, suffix: 0 };
  const ri = rarityIndex(rarity);
  for (let k = 0; k < want; k++) {
    const pool = HC_AFFIXES.filter((a) => a.minIlvl <= ilvl && !groups.has(a.group) && kinds[a.kind] < 2
      && a.slots.some((s) => slots.includes(s)) && (!a.minRarity || rarityIndex(a.minRarity) <= ri)
      && (!a.only || ((!a.only.classId || a.only.classId === forWho?.classId) && (!a.only.school || a.only.school === forWho?.school))));
    if (!pool.length) break;
    let roll = rng.next() * pool.reduce((s, a) => s + a.weight, 0);
    const pick = pool.find((a) => (roll -= a.weight) < 0) ?? pool[pool.length - 1];
    const t = tierAt(pick, ilvl)!;
    out.push({ id: pick.id, v: INTEGER(pick) ? rng.int(Math.ceil(t.min), Math.floor(t.max)) : roundV(pick, rng.range(t.min, t.max)) });
    groups.add(pick.group); kinds[pick.kind]++;
  }
  return out;
}

/** A dropped gear instance's rolled fields (rarity, affixes, empty sockets); nothing for non-rollable bases. */
export function rollInstance(rng: Rng, base: string, ilvl: number, luck = 0, tier: DropTier = 'enemy', forWho?: AffixFor): Pick<ItemInstance, 'rarity' | 'affixes' | 'sockets'> {
  if (!rollable(base)) return {};
  const rarity = rollRarity(rng, luck, tier);
  const n = SOCKETS[rarity];
  return { rarity: rarity as ItemInstance['rarity'], affixes: rollAffixes(rng, base, ilvl, rarity, forWho), ...(n ? { sockets: Array.from({ length: n }, () => null) } : {}) };
}

// ───────────── compile ─────────────
/** flat stats authored at the L1 scale grow with item level like base stats (Ember like base Ember) */
const P_SCALED = new Set(['hp', 'armor', 'sp']);
const emberScale = (v: number, L: number): number => v * (1 + 0.03 * (L - 1));

function scaleProc(p: Proc, v: number): Proc {
  const sa = (a: Action): Action => {
    const x = { ...a } as Action & { coef?: number; then?: Action[]; onHit?: Action[]; each?: Action[]; land?: Action[]; path?: Action[] };
    if (typeof x.coef === 'number') x.coef *= v;
    for (const k of ['then', 'onHit', 'each', 'land', 'path'] as const) if (x[k]) x[k] = x[k]!.map(sa);
    return x;
  };
  return { ...p, do: p.do.map(sa) };
}

/** The passive one rolled affix gives on an item (upgrade +n: +6% per level). */
export function affixPassive(r: RolledAffix, ilvl: number, upgrade = 0): Passive | null {
  const a = BY_ID.get(r.id);
  if (!a) return null;
  const up = 1 + 0.06 * Math.max(0, Math.min(5, upgrade));
  const e = a.effect;
  if ('mod' in e) {
    let value = r.v * up;
    if (e.mod.op === 'flat' && !e.mod.when && P_SCALED.has(e.mod.stat)) value *= P(ilvl);
    if (e.mod.op === 'flat' && !e.mod.when && e.mod.stat === 'ember') value = emberScale(value, ilvl);
    return { mods: [{ ...e.mod, value } as Modifier] };
  }
  if ('spellLevels' in e) return { spellLevels: [{ spell: e.spellLevels, levels: Math.round(r.v) }] };
  if ('schoolLevels' in e) return { spellLevels: [{ spell: `school:${e.schoolLevels}`, levels: Math.round(r.v) }] };
  if ('proc' in e) return { procs: [scaleProc(e.proc, r.v * up)] };
  if ('statusDmg' in e) return { mods: [{ stat: `statusDmg.${e.statusDmg}`, op: 'flat', value: r.v * up }] };
  return null;
}

/** Every affix passive on an item. */
export function itemAffixPassives(it: ItemInstance): Passive[] {
  const out: Passive[] = [];
  for (const r of it.affixes ?? []) { const p = affixPassive(r, it.ilvl, it.upgrade ?? 0); if (p) out.push(p); }
  return out;
}

// ───────────── sanitise (remote loadouts) ─────────────
/**
 * Keep only affixes that exist, fit the base, sit inside their value range (from the first tier's min up to the
 * tier at this item level: a Runeforge reforge raises ilvl but keeps the rolled value) with unique groups,
 * ≤ 2 prefixes / ≤ 2 suffixes and no more than the rarity allows.
 */
export function sanitizeAffixes(it: Pick<ItemInstance, 'base' | 'ilvl' | 'rarity' | 'affixes'>): RolledAffix[] {
  const slots = affixSlots(it.base);
  if (!slots.length || !Array.isArray(it.affixes)) return [];
  const [, max] = AFFIX_COUNT[itemRarity(it)];
  const out: RolledAffix[] = [], groups = new Set<string>(), kinds = { prefix: 0, suffix: 0 };
  for (const r of it.affixes) {
    const a = r && typeof r.id === 'string' ? BY_ID.get(r.id) : undefined;
    if (!a || typeof r.v !== 'number' || !Number.isFinite(r.v) || groups.has(a.group) || kinds[a.kind] >= 2 || out.length >= max) continue;
    if (!a.slots.some((s) => slots.includes(s)) || a.minIlvl > it.ilvl) continue;
    // any tier up to this item level (negative stats grow downward, so take the whole span)
    const tiers = a.tiers.filter((t) => t.ilvl <= it.ilvl);
    const lo = Math.min(...tiers.map((t) => t.min)), hi = Math.max(...tiers.map((t) => t.max));
    const eps = 1e-6;
    if (r.v < lo - eps || r.v > hi + eps) continue;
    out.push({ id: a.id, v: r.v });
    groups.add(a.group); kinds[a.kind]++;
  }
  return out;
}
