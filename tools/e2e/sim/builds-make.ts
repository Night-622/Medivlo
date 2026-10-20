/**
 * Build simulator (Claude 3 helper): character builds per class and level. Fresh (creation kit, no tree), starter
 * (a player who never optimises: common gear at level, points clicked in tree order), typical (Spells branch first,
 * then Skills offence, kept-up kit weapon + own-school armour), three archetypes
 * (spell-heavy, melee/attack, tank) and seeded random LEGAL builds (canLearn / availablePoints / allNodes).
 */
import { Rng } from '@/core/rng';
import { CLASS_SCHOOL } from '@/core/constants';
import { kitFor } from '@/data/classes/hc/kits';
import { availablePoints, newCharacter } from '@/systems/rules/character';
import { allNodes, canLearn, rankOf } from '@/systems/rules/tree';
import type { CharacterSave, SchoolId } from '@/systems/rules/types';
import {
  AMULET_IDS, RING_IDS, SCHOOLS, casterKitWeapon, commonTier, equip, fastestKitWeapon, gearText, heaviestStyle, keptUpTier, stockConsumables, tierAt,
  type GearSpec,
} from './builds-gear';

export type BuildKind = 'fresh' | 'starter' | 'typical' | 'spell' | 'melee' | 'tank' | 'random';
export interface Build {
  cls: string;
  level: number;
  kind: BuildKind;
  /** unique within class + level, e.g. "random#3" */
  label: string;
  save: CharacterSave;
  gear: string;
  /** spent points by branch, e.g. "sp 13 / sk 0 / up 0" */
  points: string;
}

/** A save that never levels up mid-fight (a level-up heals fully and rebuilds stats). */
function base(cls: string, level: number): CharacterSave {
  const s = newCharacter(cls);
  s.level = level;
  s.xp = -1e15;
  stockConsumables(s);
  return s;
}

/** Learn up to `ranks` ranks of each listed node, in order, while canLearn allows it. */
export function learnList(cls: string, s: CharacterSave, list: readonly (string | [string, number])[]): void {
  for (const e of list) {
    const [id, want] = typeof e === 'string' ? [e, 1] : e;
    const n = allNodes(cls).find((x) => x.id === id);
    if (!n) continue;
    while (availablePoints(s) > 0 && rankOf(n, s.tree) < Math.min(want, n.maxRank) && canLearn(cls, id, s.tree, availablePoints(s)).ok) s.tree[id] = (s.tree[id] ?? 0) + 1;
  }
}

/** Points in node order (fight.ts pattern): Spells root → p0 → p1 → p2 → bridges → tops → ultimate, then Skills, then Upgrades. */
function greedy(cls: string, s: CharacterSave): void {
  for (let g = 0; g < 200 && availablePoints(s) > 0; g++) {
    const n = allNodes(cls).find((x) => canLearn(cls, x.id, s.tree, availablePoints(s)).ok);
    if (!n) break;
    s.tree[n.id] = (s.tree[n.id] ?? 0) + 1;
  }
}

/** Spells learned through the tree (school spells + ultimate), best first: ultimate, then the higher-ranked top. */
export function learnedSpells(cls: string, s: CharacterSave): string[] {
  const kit = kitFor(cls).spells;
  const order = ['sp_u', 'sp_t0', 'sp_t1'];
  return allNodes(cls).filter((n) => n.grantsSpell && (s.tree[n.id] ?? 0) > 0 && !kit.includes(n.grantsSpell))
    .sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id)).map((n) => n.grantsSpell!);
}

function bindSlot4(cls: string, s: CharacterSave, pick?: (xs: string[]) => string | undefined): void {
  const ls = learnedSpells(cls, s);
  s.hotbar[3] = (pick ? pick(ls) : ls[0]) ?? null;
}

const pointsText = (s: CharacterSave): string => {
  const by = (p: string) => Object.entries(s.tree).filter(([k]) => k.startsWith(p)).reduce((a, [, v]) => a + v, 0);
  return `sp ${by('sp_')} / sk ${by('sk_')} / up ${by('up_')}`;
};
const finish = (cls: string, level: number, kind: BuildKind, label: string, s: CharacterSave, g: GearSpec | null): Build =>
  ({ cls, level, kind, label, save: s, gear: g ? gearText(g) : `${kitFor(cls).startWeapon} (ilvl 1), no armour`, points: pointsText(s) });

// ───────────── point orders ─────────────
/** Typical Spells branch: one path to its variant, the school spell, the next path, the second spell, then ranks. */
export const TYPICAL_SPELLS: (string | [string, number])[] = [
  'sp_p0m1', 'sp_p0m2', 'sp_p0b', 'sp_p0c1', 'sp_t0', 'sp_p1m1', 'sp_p1m2', 'sp_p1b', 'sp_p1c1', 'sp_t1',
  'sp_p2m1', 'sp_p2m2', 'sp_p2b', 'sp_p2c1', 'sp_u', 'sp_br0', 'sp_br1',
  ['sp_p0b', 3], ['sp_p1b', 3], ['sp_p2b', 3], ['sp_t0', 3], ['sp_t1', 3],
];
/** Skills offence path (Attunement → crit → element → choice → keystone → capstone). */
export const SKILLS_OFFENCE: (string | [string, number])[] = [
  ['sk_p0a', 5], 'sk_p0m1', 'sk_p0m2', ['sk_p0b', 3], 'sk_p0c1', 'sk_br0', 'sk_t0', 'sk_u',
];
const SPELL_HEAVY: (string | [string, number])[] = [
  'sp_p0m1', 'sp_p0m2', ['sp_p0b', 3], 'sp_p0c1', 'sp_t0', 'sp_p1m1', 'sp_p1m2', ['sp_p1b', 3], 'sp_p1c1', 'sp_t1', 'sp_br0', 'sp_br1',
  'sp_p2m1', 'sp_p2m2', ['sp_p2b', 3], 'sp_p2c2', 'sp_u', ['sp_t0', 3], ['sp_t1', 3],
  ['sk_p2a', 5], 'sk_p2m1', 'sk_p2m2', ['sk_p2b', 3],
];
const MELEE: (string | [string, number])[] = [
  ['sk_p0a', 5], 'sk_p0m1', 'sk_p0m2', ['sk_p0b', 3], 'sk_p0c2', 'sk_br0', 'sk_t0', 'sk_u', ['sk_p2a', 5], 'sk_p2m1', 'sk_p2m2', ['sk_p2b', 3],
];
const TANK: (string | [string, number])[] = [
  ['sk_p1a', 5], 'sk_p1m1', 'sk_p1m2', ['sk_p1b', 3], 'sk_p1c1', ['up_p0a', 5], 'up_p0m1', 'up_p0m2', 'sk_br0', 'sk_t0', 'sk_u', 'sk_br1',
];

// ───────────── builds ─────────────
/** A brand-new character at this level: creation kit only (start weapon at item level 1), tree unspent. Not gated. */
export function freshBuild(cls: string, level: number): Build {
  return finish(cls, level, 'fresh', 'fresh', base(cls, level), null);
}

/**
 * A player who never optimises: COMMON gear at the build level (kit weapon + own-school armour, no trinkets) and
 * points clicked in the order the tree shows them — each branch from its root, path p0 node by node, filling Spells,
 * then Skills, then Upgrades (canLearn decides) — with the first school spell learned bound to slot 4.
 */
export function starterBuild(cls: string, level: number): Build {
  const s = base(cls, level);
  const t = commonTier(level);
  const g: GearSpec = { weapon: kitFor(cls).weapons[0], mat: t, style: t, school: CLASS_SCHOOL[cls] };
  equip(s, g);
  greedy(cls, s);
  const first = allNodes(cls).find((n) => n.grantsSpell && (s.tree[n.id] ?? 0) > 0 && !kitFor(cls).spells.includes(n.grantsSpell));
  s.hotbar[3] = first?.grantsSpell ?? null;
  return finish(cls, level, 'starter', 'starter', s, g);
}

export function typicalGear(cls: string, level: number): GearSpec {
  return { weapon: kitFor(cls).weapons[0], mat: keptUpTier(level), style: keptUpTier(level), school: CLASS_SCHOOL[cls] };
}

export function typicalBuild(cls: string, level: number): Build {
  const s = base(cls, level);
  const g = typicalGear(cls, level);
  equip(s, g);
  learnList(cls, s, [...TYPICAL_SPELLS, ...SKILLS_OFFENCE]);
  greedy(cls, s);
  bindSlot4(cls, s);
  return finish(cls, level, 'typical', 'typical', s, g);
}

export function archetypeBuilds(cls: string, level: number): Build[] {
  const school = CLASS_SCHOOL[cls], t = keptUpTier(level), out: Build[] = [];
  // spell-heavy: every point into the Spells branch (overflow: Focus / cooldowns), Ember armour + spell-power trinkets
  {
    const s = base(cls, level);
    const style = tierAt(level) >= 4 ? 4 : 0; // robe once it unlocks, else cloth (both carry Ember)
    const g: GearSpec = { weapon: casterKitWeapon(cls, t, level), mat: t, style, school, ring1: 'i_emberring', ring2: 'i_emberring', amulet: 'i_moonpend' };
    equip(s, g); learnList(cls, s, SPELL_HEAVY); greedy(cls, s); bindSlot4(cls, s);
    out.push(finish(cls, level, 'spell', 'spell-heavy', s, g));
  }
  // melee / attack: Skills offence + cooldowns, the fastest kit weapon, leather (crit 2-piece) + crit trinkets
  {
    const s = base(cls, level);
    const g: GearSpec = { weapon: fastestKitWeapon(cls, t, level), mat: t, style: Math.min(1, tierAt(level)), school, ring1: 'i_signet', ring2: 'i_silver', amulet: 'i_moonpend' };
    equip(s, g); learnList(cls, s, [...MELEE, ...TYPICAL_SPELLS]); greedy(cls, s); bindSlot4(cls, s);
    out.push(finish(cls, level, 'melee', 'melee/attack', s, g));
  }
  // tank: Toughness path + Vitality, the heaviest unlocked armour (plate from L31) + health / armour trinkets
  {
    const s = base(cls, level);
    const g: GearSpec = { weapon: kitFor(cls).weapons[0], mat: t, style: heaviestStyle(school, level), school, ring1: 'i_copper', ring2: 'i_copper', amulet: 'i_locket' };
    equip(s, g); learnList(cls, s, [...TANK, ...TYPICAL_SPELLS]); greedy(cls, s); bindSlot4(cls, s);
    out.push(finish(cls, level, 'tank', 'tank', s, g));
  }
  return out;
}

/** Seeded random LEGAL build: random learnable nodes until points run out, random kit weapon / armour / trinkets. */
export function randomBuild(cls: string, level: number, i: number, seed: number): Build {
  const r = new Rng(seed);
  const s = base(cls, level);
  const tier = tierAt(level);
  const g: GearSpec = {
    weapon: r.pick(kitFor(cls).weapons), mat: r.int(0, tier), style: r.int(0, tier), school: r.pick(SCHOOLS as SchoolId[]),
    ring1: r.chance(0.5) ? r.pick(RING_IDS) : undefined, ring2: r.chance(0.5) ? r.pick(RING_IDS) : undefined, amulet: r.chance(0.5) ? r.pick(AMULET_IDS) : undefined,
  };
  equip(s, g);
  const nodes = allNodes(cls);
  for (let k = 0; k < 400 && availablePoints(s) > 0; k++) {
    const ok = nodes.filter((n) => canLearn(cls, n.id, s.tree, availablePoints(s)).ok);
    if (!ok.length) break;
    const n = r.pick(ok);
    s.tree[n.id] = (s.tree[n.id] ?? 0) + 1;
  }
  bindSlot4(cls, s, (ls) => (ls.length ? r.pick(ls) : undefined));
  return finish(cls, level, 'random', `random#${i}`, s, g);
}

/** Deterministic seed from strings and numbers. */
export function seedOf(...parts: (string | number)[]): number {
  let h = 2166136261;
  for (const ch of parts.join('|')) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
