/**
 * Creature definitions (Claude 3): the 142 handoff creatures turned into level-agnostic combat defs:
 * damage kind, resistances, AI profile, abilities / boss phases, on-death effects and drop specs. Pure.
 */
import { HC_BESTIARY, HC_REALMS } from '@/data/enemies/hc/bestiary.gen';
import { HC_REGIONAL } from '@/data/enemies/hc/regional';
import { abilityFor, type CreatureAbility } from '@/data/enemies/hc/abilities';
import { HC_CAMPAIGN_BOSSES } from '@/data/enemies/hc/campaign';
import { HC_ITEMS } from '@/data/items/hc/items.gen';
import { D, P, TIER_ARMOR, TIER_DMG, TIER_HP, partyHpMult } from './curves';
import type { BodyArch, CreatureTier, DamageKind, HcCreatureBase, Hook, SchoolId, StyleId } from './types';
import { HC_BODY_WIDTH } from '@/data/enemies/hc/bodies.gen';

/** A hitbox that matches the drawn art: 85% of the body's measured width (bodies.gen.ts). A creature drawn on a
 * borrowed body (campaign bosses, regional rank-and-file) is drawn at its tier's size, scaled 0.5–3× from that body
 * (CombatView does the same), so its radius scales with it. */
export const FIT = 0.85;
// caps from Claude 2's clearance check (tools/playthrough/clearance.ts): lair corridors are 2 tiles, so anything but a
// boss stays r ≤ 40; bosses r ≤ 60 (two lair-3 arenas are tighter, r 40 / 52; the current bosses there fit)
const MAX_R: Record<CreatureTier, number> = { enemy: 40, mini: 40, boss: 60 };
function bodyRadius(id: string, body: string, tier: CreatureTier, scale: number): number {
  return Math.min(MAX_R[tier], fit(id, body, tier, scale));
}
function fit(id: string, body: string, tier: CreatureTier, scale: number): number {
  const tierR = Math.round((tier === 'boss' ? 34 : tier === 'mini' ? 22 : 10) * Math.max(0.8, Math.min(1.4, scale || 1)));
  const fitted = (b: string) => (HC_BODY_WIDTH[b] ? Math.max(8, Math.round((HC_BODY_WIDTH[b] * FIT) / 2)) : undefined);
  if (body === id) return fitted(id) ?? tierR;
  const br = fitted(body) ?? tierR;
  return Math.round(br * Math.max(0.5, Math.min(3, tierR / br)));
}

const SCHOOLS: SchoolId[] = ['ash', 'rime', 'storm', 'radiance', 'umbral', 'verdant', 'blade', 'iron', 'fist', 'hunt', 'guile', 'song'];

export type DropSpec =
  | { kind: 'item'; id: string }
  | { kind: 'gold' }
  | { kind: 'armour'; school?: SchoolId; style?: StyleId }
  | { kind: 'spark' }
  | { kind: 'seal'; realm: string };

export interface CreatureAI {
  speed: number; aggro: number; leash: number; attackRange: number; attackMs: number;
  ranged: boolean; flying: boolean; immobile: boolean; flee: boolean;
}

export interface CreatureDef {
  id: string; name: string; tier: CreatureTier; arch: BodyArch; region: string; realm?: string; lore: string;
  kind: DamageKind; elements: DamageKind[]; resist: Partial<Record<DamageKind, number>>;
  /** handoff hp ÷ tier median, clamped */
  hpShape: number; radius: number; scale: number;
  ai: CreatureAI;
  abilities: CreatureAbility[];
  /** bosses: abilities unlocked per phase (index 0 = from the start) */
  phases: CreatureAbility[][];
  onDeath: CreatureAbility[];
  lowHp: CreatureAbility[];
  hooks: Hook[];
  drops: DropSpec[];
  /** bestiary art to draw (campaign bosses borrow a body until bespoke art exists) */
  body: string;
}

const ARCH_AI: Record<BodyArch, Omit<CreatureAI, 'ranged' | 'immobile' | 'flee'>> = {
  quad: { speed: 95, aggro: 220, leash: 520, attackRange: 34, attackMs: 1100, flying: false },
  slime: { speed: 55, aggro: 180, leash: 420, attackRange: 28, attackMs: 1300, flying: false },
  skeleton: { speed: 70, aggro: 220, leash: 480, attackRange: 36, attackMs: 1200, flying: false },
  humanoid: { speed: 75, aggro: 220, leash: 480, attackRange: 36, attackMs: 1100, flying: false },
  spirit: { speed: 70, aggro: 240, leash: 520, attackRange: 260, attackMs: 1700, flying: true },
  flyer: { speed: 110, aggro: 240, leash: 560, attackRange: 30, attackMs: 950, flying: true },
  plant: { speed: 0, aggro: 200, leash: 0, attackRange: 220, attackMs: 1500, flying: false },
  construct: { speed: 50, aggro: 200, leash: 420, attackRange: 44, attackMs: 1600, flying: false },
  bug: { speed: 90, aggro: 200, leash: 460, attackRange: 30, attackMs: 950, flying: false },
};

function parseElements(el: string): DamageKind[] {
  if (/all schools/i.test(el)) return ['umbral'];
  const out = el.split('·').map((s) => s.trim().toLowerCase()).filter((s): s is SchoolId => (SCHOOLS as string[]).includes(s));
  return out.length ? out : ['physical'];
}

const median = (xs: number[]) => [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)];
// medians come from the handoff bestiary only (campaign bosses are authored on the same scale)
const MEDIAN_HP: Record<CreatureTier, number> = {
  enemy: median(HC_BESTIARY.filter((b) => b.tier === 'enemy').map((b) => b.hp)),
  mini: median(HC_BESTIARY.filter((b) => b.tier === 'mini').map((b) => b.hp)),
  boss: median(HC_BESTIARY.filter((b) => b.tier === 'boss').map((b) => b.hp)),
};

// ───────────── drops ─────────────
const ITEM_BY_NAME = new Map(HC_ITEMS.map((i) => [i.name.toLowerCase(), i.id]));
const FAMILY: Record<string, SchoolId> = {
  cinderforged: 'ash', frostbound: 'rime', stormwrought: 'storm', sunblessed: 'radiance', nightwoven: 'umbral', thornwild: 'verdant',
  swordsworn: 'blade', ironbound: 'iron', ironclad: 'iron', militia: 'iron', stonefist: 'fist', wildtrack: 'hunt', gloamstalker: 'hunt',
  silvertongue: 'guile', "balladeer's": 'song',
};
const REALM_SCHOOL = new Map(HC_REALMS.map((r) => [r.name.toLowerCase(), r.school]));
const ALIAS: Record<string, string> = {
  'wolf fang': 'i_fang', 'spider silk': 'i_silk', 'stag-tear locket': 'i_locket', 'slime crown': 'i_signet',
  galewhisper: 'w_bow_storm', 'willow shortbow': 'w_bow_wood',
};

export function parseDrop(name: string, region: string): DropSpec | null {
  const n = name.toLowerCase().trim();
  if (n === 'embershards') return { kind: 'gold' };
  if (n === 'realm seal') return { kind: 'seal', realm: region };
  if (n === 'sparkforged gear') return { kind: 'spark' };
  if (ITEM_BY_NAME.has(n)) return { kind: 'item', id: ITEM_BY_NAME.get(n)! };
  if (ALIAS[n]) return { kind: 'item', id: ALIAS[n] };
  const realm = n.replace(/ armour( pieces)?$/, '');
  if (n.includes(' armour')) {
    const sc = REALM_SCHOOL.get(realm);
    return sc && sc !== 'concord' ? { kind: 'armour', school: sc } : { kind: 'armour' };
  }
  const fam = FAMILY[n.split(' ')[0]];
  if (fam) {
    const style = /plate/.test(n) ? 'plate' : /vestment/.test(n) ? 'vestment' : undefined;
    return { kind: 'armour', school: fam, style };
  }
  return null;
}

/** Handoff bosses the story must not let die in combat (endings decide): they yield like the nemeses. */
const STORY_YIELDS = new Set(['bx_hollowking']);

// ───────────── assembly ─────────────
function build(b: HcCreatureBase): CreatureDef {
  const elements = parseElements(b.element);
  const kind = elements[0];
  const ctx = { kind, tier: b.tier, arch: b.arch, region: b.region };
  const all = b.abilities.map((t) => ({ t, ab: abilityFor(t, ctx) }));
  const hooks: Hook[] = all.flatMap(({ ab }) => (ab.use === 'passive' ? ab.hooks ?? [] : []));
  if (STORY_YIELDS.has(b.id)) hooks.push({ id: 'yields' });
  // bosses without "Phase N:" lines get one phase per ability line (handoff bosses list three)
  const implicit = b.tier === 'boss' && !b.abilities.some((t) => /^phase \d+:/i.test(t));
  const isPhase = (t: string) => implicit || /^phase \d+:/i.test(t);
  const phases: CreatureAbility[][] = [];
  const free = all.filter(({ t }) => !isPhase(t)).map(({ ab }) => ab);
  all.filter(({ t }) => isPhase(t)).forEach(({ t, ab }) => {
    const m = /^phase (\d+)/i.exec(t);
    const i = m ? Number(m[1]) - 1 : b.abilities.indexOf(t);
    if (ab.use === 'onDeath' || ab.use === 'passive' || ab.use === 'lowHp') { free.push(ab); return; } // not a rotation ability
    (phases[i] ??= []).push(ab);
  });
  const rangedText = b.abilities.some((t) => /fires|volley|bolt|throws|knives|spits|hurls/i.test(t)) || /archer|sentry/i.test(b.name);
  const base = ARCH_AI[b.arch];
  const immobile = hooks.some((h) => h.id === 'immobile') || b.arch === 'plant';
  const ranged = (b.arch === 'spirit' || b.arch === 'plant' || rangedText) && !hooks.some((h) => h.id === 'immobile');
  const resist: Partial<Record<DamageKind, number>> = {};
  // 10%: a realm's creatures resist its element a little, so its own school's heroes are not weakest at home
  for (const e of elements) if (e !== 'physical') resist[e] = 0.1;
  return {
    id: b.id, name: b.name, tier: b.tier, arch: b.arch, region: b.region, lore: b.lore,
    realm: HC_REALMS.find((r) => r.name === b.region)?.id,
    kind, elements, resist,
    // hpMult: a per-boss trim after the clamp (campaign slogs, boss-check 2026-10-21)
    hpShape: Math.max(0.6, Math.min(1.6, b.hp / MEDIAN_HP[b.tier])) * ((b as { hpMult?: number }).hpMult ?? 1),
    radius: bodyRadius(b.id, (b as { body?: string }).body ?? b.id, b.tier, b.scale),
    scale: b.scale,
    ai: { ...base, attackMs: base.attackMs * (b.tier === 'boss' ? 1.6 : b.tier === 'mini' ? 1.2 : 1), ranged, immobile, flee: hooks.some((h) => h.id === 'flee'), attackRange: ranged ? Math.max(base.attackRange, 240) : base.attackRange, speed: immobile ? 0 : base.speed },
    abilities: free.filter((a) => a.use === 'attack' || a.use === 'self'),
    phases: b.tier === 'boss' ? phases.map((p) => p ?? []) : [],
    onDeath: free.filter((a) => a.use === 'onDeath'),
    lowHp: free.filter((a) => a.use === 'lowHp'),
    hooks,
    drops: b.drops.map((d) => parseDrop(d, b.region)).filter((d): d is DropSpec => !!d),
    body: (b as { body?: string }).body ?? b.id,
  };
}

const DEFS = new Map([...HC_BESTIARY, ...HC_REGIONAL, ...HC_CAMPAIGN_BOSSES].map((b) => [b.id, build(b)]));
export const creature = (id: string): CreatureDef | undefined => DEFS.get(id);
export const allCreatures = (): CreatureDef[] => [...DEFS.values()];

/**
 * Early ease: a new character meets its first lairs with the creation kit and no tree, so creatures below L13 are
 * softer (HP from 30% at L1, damage from 60%), reaching full strength at L13 where Act I bosses are tuned.
 */
const earlyEase = (level: number, from: number): number => Math.min(1, from + (1 - from) * Math.max(0, level - 1) / 12);

/** Combat stats for a spawn at this level and party size. `tier` may promote a creature (e.g. a mini-boss used as a boss). */
export function creatureStats(def: CreatureDef, level: number, partySize: number, tier: CreatureTier = def.tier) {
  const promote = tier !== def.tier ? TIER_HP[tier] / TIER_HP[def.tier] : 1;
  return {
    // +4%/level on top of P(L): player power compounds gear, tree points and set bonuses faster than P alone
    hp: Math.round(TIER_HP[def.tier] * def.hpShape * promote * P(level) * (1 + 0.04 * (level - 1)) * partyHpMult(partySize, tier) * earlyEase(level, 0.3)),
    dmg: TIER_DMG[tier] * D(level) * earlyEase(level, 0.6),
    armor: TIER_ARMOR[tier] * (1 + 0.12 * (level - 1)),
  };
}

/** Act I pools: a realm's own six plus Morvane creatures sharing its element. */
export function bestiaryFor(realmId: string): CreatureDef[] {
  const realm = HC_REALMS.find((r) => r.id === realmId);
  if (!realm) return [];
  const own = allCreatures().filter((c) => c.region === realm.name);
  if (realm.school === 'concord') return own;
  return [...own, ...bestiaryByElement(realm.school).filter((c) => !c.realm)];
}
export const bestiaryByElement = (el: DamageKind): CreatureDef[] => allCreatures().filter((c) => c.elements.includes(el));

/** DEV: ability lines that fell back to a body-type default. */
export const unmappedAbilities = (): string[] =>
  allCreatures().flatMap((c) => [...c.abilities, ...c.phases.flat(), ...c.onDeath].filter((a) => !a.matched).map((a) => `${c.id}: ${a.text}`));
