/**
 * Skill tree generator (handoff skTree): 3 branches × 24 nodes per class, built from the class kit and school.
 * Layout, requirements and exclusions follow the prototype; every node carries mechanical effects. Pure.
 */
import { HC_CLASSES, HC_SCHOOL_ELEMENT, HC_SCHOOL_KEYSTONES, HC_SCHOOL_SPELLS } from '@/data/classes/hc/classes.gen';
import { HC_KIT_SPELLS } from '@/data/spells/hc/kit-spells';
import { HC_KIT_SPELLS_NEW, NEW_KIT } from '@/data/spells/hc/kit-spells-new';
import { HC_SCHOOL_SPELL_DEFS } from '@/data/spells/hc/school-spells';
import { HC_SCHOOL_PERKS } from '@/data/skilltrees/hc';
import { HC_SHARED_KEYSTONES, KEYSTONE_OFFERS } from '@/data/skilltrees/hc/keystones';
import type { PerkDef, SchoolPerks } from './perkTypes';
import { displayName, flavourOf } from './buildText';
import { slug } from '@/data/spells/hc/build';
import { SCHOOL_NAME } from '@/data/classes/hc';
import type { Modifier, Passive, SchoolId, StatKey, TreeBranch, TreeNode } from './types';
import { scalePassive } from './scale';

const PREFIX: Record<TreeBranch, string> = { spells: 'sp_', skills: 'sk_', upgrades: 'up_' };
const X = [200, 410, 620];
const f = (stat: StatKey, value: number, when?: Modifier['when']): Modifier => ({ stat, op: 'flat', value, when });
const pct = (stat: StatKey, value: number): Modifier => ({ stat, op: 'pct', value });

/** A node spec: per-rank text + passive builders. */
interface Spec { name: string; icon: string; max?: number; text: (r: number) => string; fx: (r: number) => Passive; spell?: string; free?: boolean; label?: string; shared?: boolean; flavour?: string }
const one = (name: string, icon: string, text: string, fx: Passive, spell?: string): Spec => ({ name, icon, text: () => text, fx: () => fx, spell });
const ranks = (name: string, icon: string, max: number, text: (r: number) => string, fx: (r: number) => Passive): Spec => ({ name, icon, max, text, fx });

// ───────────── perks (BUILDS.md §3; tables by Claude 5 in src/data/skilltrees/hc) ─────────────
const PERK_LABEL: Record<PerkDef['kind'], string> = {
  conversion: 'Perk · conversion', trigger: 'Perk · trigger', resource: 'Perk · resource', aura: 'Perk · aura', tradeoff: 'Perk · trade-off', power: 'Perk',
};
const perk = (p: PerkDef, icon: string, label?: string): Spec =>
  ({ name: displayName('perk', p.id, p.name), flavour: flavourOf('perk', p.id), icon: p.icon ?? icon, max: p.ranks, text: (r) => p.text[r - 1], fx: (r) => p.effects[r - 1], label: label ?? PERK_LABEL[p.kind] });
function schoolPerks(school: SchoolId): SchoolPerks {
  const sp = HC_SCHOOL_PERKS.find((x) => x.school === school);
  if (!sp) throw new Error(`[tree] no perk table for ${school}`);
  return sp;
}
const classPerks = (classId: string, school: SchoolId): PerkDef[] => {
  const c = schoolPerks(school).classes.find((x) => x.classId === classId);
  if (!c) throw new Error(`[tree] no signature perks for ${classId}`);
  return c.signature;
};
export const MAX_SHARED_KEYSTONES = 2;

interface PathSpec { a: Spec; m1: Spec; m2: Spec; b: Spec; c1: Spec; c2: Spec }
interface BranchSpec { root: Spec; paths: PathSpec[]; bridge: Spec; tops: [Spec, Spec]; ult: Spec; topsExclusive?: boolean; ultAny?: boolean; labels: Record<string, string> }

// ───────────── Spells branch ─────────────
// Path i: kit spell i (free) → the new kit spell i+3 (m1) → 4 signature perks (m2, b with 3 ranks, the c1 / c2 pick).
// The old Echo / Split / Twin / Wide / Linger / Burst variants are spell runes now (BUILDS.md §2.2).
function spellsBranch(classId: string, school: SchoolId): BranchSpec {
  const c = HC_CLASSES.find((x) => x.id === classId)!;
  const si = `school_${school}`;
  const kitIds = c.abilities.map((a) => HC_KIT_SPELLS.find((s) => s.name === a.name)!);
  const SP = HC_SCHOOL_SPELLS[school];
  const sig = classPerks(classId, school), fresh = NEW_KIT[classId] ?? [];
  const paths = kitIds.map((sp, i): PathSpec => {
    const nw = HC_KIT_SPELLS_NEW.find((s) => s.id === fresh[i]);
    return {
      a: { ...one(displayName('spell', sp.id, sp.name), sp.icon, sp.desc, {}, sp.id), free: true },
      m1: nw ? { ...one(displayName('spell', nw.id, nw.name), nw.icon, nw.desc, {}, nw.id), label: 'New spell', flavour: flavourOf('spell', nw.id) } : one(`+8% ${sp.name} damage`, sp.icon, `+8% ${sp.name} damage`, { spellMods: [{ spell: sp.id, dmg: 0.08 }] }),
      m2: perk(sig[4 * i], sp.icon),
      b: perk(sig[4 * i + 1], sp.icon),
      c1: perk(sig[4 * i + 2], sp.icon, 'Perk · pick one of two'),
      c2: perk(sig[4 * i + 3], sp.icon, 'Perk · pick one of two'),
    };
  });
  const top = (i: 0 | 1): Spec => {
    const id = `spell:${slug(SP[i][0])}`;
    // ranks 2–3: +30% damage per rank; a spell that deals no damage (buff / trap / control) lasts 25% longer per rank
    const def = HC_SCHOOL_SPELL_DEFS.find((s) => s.id === id);
    const hurts = !!def && JSON.stringify(def.actions).match(/"a":"(damage|projectile|chain)"/) !== null;
    const what = (r: number) => (hurts ? `+${(r - 1) * 30}% damage` : `+${(r - 1) * 25}% duration`);
    return { name: SP[i][0], icon: si, max: 3, spell: id, text: (r) => (r === 1 ? SP[i][1] : `${SP[i][1]} Rank ${r}: ${what(r)}, ${r - 1}s less cooldown.`),
      fx: (r) => ({ spellMods: r > 1 ? [{ spell: id, ...(hurts ? { dmg: 0.3 * (r - 1) } : { dur: 0.25 * (r - 1) }), cd: -(r - 1) / 10 }] : [] }) };
  };
  return {
    root: { ...one(`${c.name} Spellcraft`, si, 'Your path into magic. Every spell grows from here.', {}), free: true },
    paths,
    bridge: one('Spell Weaving', si, '+6% spell damage, +6% cast speed and +3% damage', { mods: [f('spellDmg', 0.06), f('castSpeed', 0.06), f('dmg', 0.03)] }),
    tops: [top(0), top(1)],
    ult: one(SP[2][0], si, SP[2][1], {}, `spell:${slug(SP[2][0])}`),
    labels: { root: 'Path root', major: 'Spell', minor: 'Minor node', choice: 'Variant · pick one of two', top: 'New school spell', ult: 'Ultimate spell' },
  };
}

// ───────────── Skills branch ─────────────
function elementNode(school: SchoolId): Spec {
  const [name] = HC_SCHOOL_ELEMENT[school];
  const fx = (r: number): Passive => {
    switch (school) {
      case 'ash': return { hooks: [{ id: 'burnPower', value: 0.3 * r }] };
      case 'rime': return { mods: [f('slowPower', 0.15 * r)] };
      case 'storm': return { mods: [f('chains', r)] };
      case 'radiance': return { mods: [f('healing', 0.1 * r)] };
      case 'umbral': return { mods: [f('lifesteal', 0.03 * r)] };
      case 'verdant': return { hooks: [{ id: 'rootDurMs', value: 500 * r }] };
      case 'blade': return { mods: [f('critd', 0.1 * r)] };
      case 'iron': return { mods: [f('block', 0.05 * r)] };
      case 'fist': return { mods: [f('maxMomentum', r)] };
      case 'hunt': return { mods: [f('dmg', 0.08 * r, { c: 'targetHas', status: 'mark' })] };
      case 'guile': return { mods: [f('gold', 0.1 * r)] };
      case 'song': return { mods: [f('buffPower', 0.1 * r)] };
    }
  };
  // the real value at each rank, not "<handoff line> × r"
  const TEXT: Record<SchoolId, (r: number) => string> = {
    ash: (r) => `Burns deal +${30 * r}% damage.`, rime: (r) => `Slows are +${15 * r}% stronger.`, storm: (r) => `Chains jump to ${r} more foe${r > 1 ? 's' : ''}.`,
    radiance: (r) => `+${10 * r}% healing done.`, umbral: (r) => `+${3 * r}% life steal.`, verdant: (r) => `Roots last ${0.5 * r} s longer.`,
    blade: (r) => `+${10 * r}% crit damage.`, iron: (r) => `+${5 * r}% block chance.`, fist: (r) => `+${r} max Momentum.`,
    hunt: (r) => `+${8 * r}% damage to marked foes.`, guile: (r) => `+${10 * r}% Embershards found.`, song: (r) => `Your buffs are ${10 * r}% stronger.`,
  };
  return ranks(name, `school_${school}`, 3, TEXT[school], fx);
}

function keystone(school: SchoolId, i: 0 | 1): Spec {
  const [name, desc] = HC_SCHOOL_KEYSTONES[school][i];
  const P: Record<SchoolId, [Passive, Passive]> = {
    ash: [{ mods: [f('dmg', 0.25, { c: 'targetHas', status: 'burn' })], hooks: [{ id: 'selfSinge' }] }, { hooks: [{ id: 'burnSpread' }, { id: 'burnPower', value: -0.3 }] }],
    rime: [{ hooks: [{ id: 'shatterFrozen' }] }, { mods: [f('moveSpeed', -0.1), f('spellDmg', 0.3)] }],
    storm: [{ procs: [{ on: 'crit', icd: 300, do: [{ a: 'chain', coef: 0.4, kind: 'storm', jumps: 2, range: 120 }] }] }, { hooks: [{ id: 'stormCharge' }] }],
    radiance: [{ procs: [{ on: 'heal', icd: 1000, do: [{ a: 'damage', coef: 0.5, kind: 'radiance', area: { shape: 'circle', at: 'self', r: 90 } }] }] }, { hooks: [{ id: 'halo' }] }],
    umbral: [{ hooks: [{ id: 'spellsCostHp' }] }, { mods: [{ stat: 'dmg', op: 'more', value: 2, when: { c: 'fromStealth' } }] }],
    verdant: [{ hooks: [{ id: 'hotDur', value: 1 }] }, { hooks: [{ id: 'thornskin' }] }],
    blade: [{ hooks: [{ id: 'parryRefundsDash' }] }, { hooks: [{ id: 'berserker', value: 0.03 }] }],
    iron: [{ hooks: [{ id: 'unstoppable' }] }, { hooks: [{ id: 'armorToDamage' }] }],
    fist: [{ mods: [f('crit', 1, { c: 'momentum', min: 5 })] }, { procs: [{ on: 'hit', every: 5, do: [{ a: 'status', status: { id: 'stun', dur: 800 }, area: { shape: 'single', at: 'target' } }] }] }],
    hunt: [{ mods: [f('dmg', 0.3, { c: 'alone', px: 300 })] }, { hooks: [{ id: 'petPower', value: 1 }, { id: 'trapPower', value: 1 }] }],
    guile: [{ procs: [{ on: 'crit', do: [{ a: 'steal', gold: 1, buffs: false, area: { shape: 'single', at: 'target' } }] }] }, { procs: [{ on: 'dash', icd: 4000, do: [{ a: 'zone', kind: 'decoy', area: { shape: 'circle', at: 'self', r: 16 }, dur: 3000, taunts: true }] }] }],
    song: [{ hooks: [{ id: 'encore' }] }, { hooks: [{ id: 'buffStacks', value: 3 }] }],
  };
  // each keystone also carries one plain stat (2026-10-21 dead-content pass: several were utility- or probe-blind)
  const X: Partial<Record<SchoolId, [[string, Passive] | null, [string, Passive] | null]>> = {
    rime: [['+15% damage to chilled foes.', { mods: [f('dmg', 0.15, { c: 'targetHas', status: 'chill' })] }], null],
    verdant: [null, ['+8% max health.', { mods: [pct('hp', 0.08)] }]],
    radiance: [null, ['+5% Radiance damage.', { mods: [f('dmg.radiance', 0.05)] }]],
    umbral: [null, ['Kills cloak you in shadow for 1 s.', { procs: [{ on: 'kill', icd: 3000, do: [{ a: 'buff', id: 'ks:shadowborn', dur: 1000, to: 'self', flags: ['stealth'] }] }] }]],
    blade: [['+5% block; a parry gives +10% damage for 3 s.', { mods: [f('block', 0.05)], procs: [{ on: 'parry', do: [{ a: 'buff', id: 'ks:riposte', dur: 3000, to: 'self', mods: [f('dmg', 0.1)] }] }] }], null],
    iron: [['+10% max health.', { mods: [pct('hp', 0.1)] }], null],
    guile: [['+5% crit chance.', { mods: [f('crit', 0.05)] }], null],
    song: [['+10% buff strength.', { mods: [f('buffPower', 0.1)] }], null],
    fist: [null, ['+5% attack speed.', { mods: [f('atkSpeed', 0.05)] }]],
  };
  const extra = X[school]?.[i];
  if (!extra) return one(name, `school_${school}`, desc, P[school][i]);
  const base = P[school][i];
  return one(name, `school_${school}`, `${desc} ${extra[0]}`, {
    ...base, mods: [...(base.mods ?? []), ...(extra[1].mods ?? [])], procs: [...(base.procs ?? []), ...(extra[1].procs ?? [])],
  });
}

// Path 0 offence, 1 defence, 2 focus; the school's 8 perks sit at p0 c1/c2, p1 b/c1/c2, p2 b/c1/c2 (BUILDS.md §3)
function skillsBranch(school: SchoolId): BranchSpec {
  const S = SCHOOL_NAME[school], si = `school_${school}`;
  const dk = `dmg.${school}` as StatKey;
  const P = schoolPerks(school).perks;
  const pick = 'School perk · pick one of two';
  return {
    root: { ...one(`${S} Discipline`, si, 'The core of your school. Grow outward into offence, defence and utility.', {}), free: true },
    paths: [
      { a: ranks(`${S} Attunement`, si, 5, (r) => `+${r * 3}% ${S} damage and +${r}% damage`, (r) => ({ mods: [f(dk, 0.03 * r), f('dmg', 0.01 * r)] })),
        m1: one('Set Mastery', 'icon_robe', 'Attuned armour bonuses are 25% stronger; +3% damage.', { hooks: [{ id: 'setMastery', value: 0.25 }], mods: [f('dmg', 0.03)] }),
        m2: one('Keen Eye', 'icon_dagger', '+3% crit chance and +10% crit damage', { mods: [f('crit', 0.03), f('critd', 0.1)] }),
        b: elementNode(school),
        c1: perk(P[0], si, pick), c2: perk(P[1], si, pick) },
      { a: ranks('Toughness', 'icon_shield', 5, (r) => `+${r * 4}% max health`, (r) => ({ mods: [pct('hp', 0.04 * r)] })),
        m1: one('Hardened', 'icon_helm', '+10% armour and +4% max health', { mods: [pct('armor', 0.1), pct('hp', 0.04)] }),
        m2: one('+5% max health', 'icon_potion_red', '+5% max health', { mods: [pct('hp', 0.05)] }),
        b: perk(P[2], si, 'School perk'),
        c1: perk(P[3], si, pick), c2: perk(P[4], si, pick) },
      { a: ranks('Focus', 'icon_potion_ember', 5, (r) => `+${r * 10} max Ember; +${r * 3}% spell damage`, (r) => ({ mods: [f('ember', 10 * r), f('spellDmg', 0.03 * r)] })),
        m1: one('Deep Well', 'icon_potion_ember', '+0.6 Ember regen per second; spells cost 3% less; 3% shorter cooldowns', { mods: [f('emberRegen', 0.6), f('emberCost', -0.03), f('cdr', 0.03)] }),
        m2: one('Quick Hands', 'icon_staff', '6% shorter cooldowns; +0.3 Ember regen', { mods: [f('cdr', 0.06), f('emberRegen', 0.3)] }),
        b: perk(P[5], si, 'School perk'),
        c1: perk(P[6], si, pick), c2: perk(P[7], si, pick) },
    ],
    bridge: one('Versatility', 'icon_ring', '+3% to all stats', { mods: [pct('hp', 0.03), pct('armor', 0.03), pct('sp', 0.03), f('dmg', 0.03)] }),
    tops: [keystone(school, 0), keystone(school, 1)],
    topsExclusive: true, ultAny: true,
    ult: one(`Avatar of ${S}`, si, `Your keystone also grants +10% ${S} damage and its effect is 50% stronger.`, { mods: [f(dk, 0.1)], hooks: [{ id: 'keystonePower', value: 0.5 }] }),
    labels: { root: 'Path root', major: 'Notable skill', minor: 'Minor node', choice: 'Choice · pick one of two', top: 'Keystone · pick one', ult: 'Capstone' },
  };
}

// ───────────── Upgrades branch ─────────────
// Each path's c1 is one of the class's 3 offered shared keystones (≤ MAX_SHARED_KEYSTONES held), against a utility in c2
function upgradesBranch(classId: string): BranchSpec {
  const offers = (KEYSTONE_OFFERS[classId] ?? []).map((id) => HC_SHARED_KEYSTONES.find((k) => k.id === id));
  const ks = (i: number, fallback: Spec): Spec => {
    const k = offers[i];
    return k ? { ...perk(k, 'icon_amulet', 'Shared keystone · max 2 · or the other option'), shared: true } : fallback;
  };
  return {
    root: { ...one('Adventurer', 'icon_coin', 'Experience upgrades for any class: body, pack and road.', {}), free: true },
    paths: [
      { a: ranks('Vitality', 'icon_potion_red', 5, (r) => `+${r * 5}% max health`, (r) => ({ mods: [pct('hp', 0.05 * r)] })),
        m1: one('+2% move speed', 'icon_boots', '+2% move speed', { mods: [f('moveSpeed', 0.02)] }),
        m2: one('+4% max health', 'icon_potion_red', '+4% max health', { mods: [pct('hp', 0.04)] }),
        b: ranks('Fleet Foot', 'icon_boots', 3, (r) => `+${r * 3}% move speed`, (r) => ({ mods: [f('moveSpeed', 0.03 * r)] })),
        c1: ks(0, one('Extra Dash', 'school_storm', '+1 dash charge.', { mods: [f('dashCharges', 1)] })),
        c2: one('Sure Footed', 'icon_boots', '+1 dash charge, and you can’t be slowed while dashing.', { mods: [f('dashCharges', 1)], hooks: [{ id: 'dashNoSlow' }] }) },
      { a: ranks('Ember Reserve', 'icon_potion_ember', 5, (r) => `+${r * 15} max Ember; +${r * 2}% spell damage`, (r) => ({ mods: [f('ember', 15 * r), f('spellDmg', 0.02 * r)] })),
        m1: one('+3 bag slots', 'icon_robe', '+3 bag slots', { mods: [f('bag', 3)] }),
        m2: one('+5% potion healing', 'icon_potion_red', '+5% potion healing', { mods: [f('potionHeal', 0.05)] }),
        b: ranks('Deep Pockets', 'icon_robe', 3, (r) => `+${r * 6} bag slots`, (r) => ({ mods: [f('bag', 6 * r)] })),
        c1: ks(1, one('Potion Belt', 'icon_potion_red', 'Potions recharge 40% faster.', { hooks: [{ id: 'potionCdr', value: 0.4 }] })),
        c2: one('Potion Belt', 'icon_potion_red', 'Potions recharge 40% faster, and loot flies to you from twice as far.', { hooks: [{ id: 'potionCdr', value: 0.4 }], mods: [f('lootRange', 48)] }) },
      { a: ranks('Endurance', 'icon_potion_stamina', 5, (r) => `+${r * 10} max stamina`, (r) => ({ mods: [f('stamina', 10 * r)] })),
        m1: one('+5% stamina regen', 'icon_potion_stamina', '+5% stamina regen', { mods: [pct('staminaRegen', 0.05)] }),
        m2: one('+3% XP gained', 'icon_amulet', '+3% XP gained', { mods: [f('xp', 0.03)] }),
        b: ranks('Second Breath', 'icon_potion_stamina', 3, (r) => `+${r * 10}% stamina regen`, (r) => ({ mods: [pct('staminaRegen', 0.1 * r)] })),
        c1: ks(2, one('Quick Study', 'icon_amulet', '+15% XP gained.', { mods: [f('xp', 0.15)] })),
        c2: one('Haggler', 'icon_coin', 'Shop prices are 20% lower, and +15% XP gained.', { hooks: [{ id: 'shopDiscount', value: 0.2 }], mods: [f('xp', 0.15)] }) },
    ],
    bridge: one('Treasure Sense', 'icon_ring', '+3% chance of rarer loot', { mods: [f('itemFind', 0.03)] }),
    tops: [
      one('Seasoned', 'icon_amulet', '+10% XP, and enemies of your level drop more Embershards.', { mods: [f('xp', 0.1), f('gold', 0.1)] }),
      one('Lucky', 'icon_ring', 'Chests have a 10% chance to hold an extra item.', { hooks: [{ id: 'chestExtra', value: 0.1 }] }),
    ],
    ult: one('Hero of Morvane', 'school_radiance', '+5% to every stat.', { mods: [pct('hp', 0.05), pct('armor', 0.05), pct('sp', 0.05), pct('ember', 0.05), f('dmg', 0.05), f('moveSpeed', 0.05)] }),
    labels: { root: 'Path root', major: 'Upgrade', minor: 'Minor node', choice: 'Choice · pick one of two', top: 'Notable upgrade', ult: 'Capstone' },
  };
}

// ───────────── assembly ─────────────
function nodesFor(spec: BranchSpec, branch: TreeBranch): TreeNode[] {
  const p = PREFIX[branch], out: TreeNode[] = [];
  const N = (id: string, x: number, y: number, size: number, kind: TreeNode['kind'], s: Spec, extra: Partial<TreeNode> = {}) => {
    const max = s.max ?? 1;
    out.push({
      id: p + id, branch, kind, name: s.name, icon: s.icon, x, y, size, maxRank: max,
      text: Array.from({ length: max }, (_, i) => s.text(i + 1)), effects: Array.from({ length: max }, (_, i) => s.fx(i + 1)),
      grantsSpell: s.spell, req: [], free: s.free, typeLabel: s.label ?? spec.labels[kind], ...(s.shared ? { shared: true } : {}), ...(s.flavour ? { flavour: s.flavour } : {}), ...extra,
    });
  };
  N('root', 410, 476, 52, 'root', spec.root);
  spec.paths.forEach((P, i) => {
    const x = X[i], q = `p${i}`;
    N(q + 'a', x, 400, 56, 'major', P.a, { req: [p + 'root'], typeLabel: P.a.free ? 'Starting spell' : spec.labels.major });
    N(q + 'm1', x, 346, 40, 'minor', P.m1, { req: [p + q + 'a'] });
    N(q + 'm2', x, 298, 40, 'minor', P.m2, { req: [p + q + 'm1'] });
    N(q + 'b', x, 226, 56, 'major', P.b, { req: [p + q + 'm2'] });
    N(q + 'c1', x - 50, 160, 46, 'choice', P.c1, { req: [p + q + 'b'], excludes: p + q + 'c2' });
    N(q + 'c2', x + 50, 160, 46, 'choice', P.c2, { req: [p + q + 'b'], excludes: p + q + 'c1' });
  });
  ([[305, 0, 1], [515, 1, 2]] as const).forEach(([x, l, r], j) =>
    N(`br${j}`, x, 298, 40, 'minor', spec.bridge, { req: [`${p}p${l}m2`, `${p}p${r}m2`], reqAny: true, typeLabel: 'Bridge · links two paths' }));
  spec.tops.forEach((t, j) => N(`t${j}`, j ? 515 : 305, 92, 56, 'top', t, {
    req: [`${p}p${j}c1`, `${p}p${j}c2`, `${p}p${j + 1}c1`, `${p}p${j + 1}c2`], reqAny: true,
    excludes: spec.topsExclusive ? `${p}t${1 - j}` : undefined, diamond: spec.topsExclusive,
  }));
  N('u', 410, 30, 60, 'ult', spec.ult, { req: [p + 't0', p + 't1'], reqAny: !!spec.ultAny, diamond: true });
  return out;
}

const cache = new Map<string, TreeNode[]>();
export function buildTree(classId: string, branch: TreeBranch): TreeNode[] {
  const key = `${classId}/${branch}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const c = HC_CLASSES.find((x) => x.id === classId);
  if (!c) throw new Error(`[tree] unknown class ${classId}`);
  const spec = branch === 'spells' ? spellsBranch(classId, c.school) : branch === 'skills' ? skillsBranch(c.school) : upgradesBranch(classId);
  const nodes = nodesFor(spec, branch);
  cache.set(key, nodes);
  return nodes;
}
export const allNodes = (classId: string): TreeNode[] => (['spells', 'skills', 'upgrades'] as const).flatMap((b) => buildTree(classId, b));

// ───────────── learning ─────────────
export type TreeRanks = Record<string, number>;
export const rankOf = (n: TreeNode, T: TreeRanks): number => (n.free ? 1 : T[n.id] ?? 0);
export const spentPoints = (T: TreeRanks): number => Object.values(T).reduce((a, b) => a + b, 0);

export type LearnCheck = { ok: true } | { ok: false; why: string };
export function canLearn(classId: string, nodeId: string, T: TreeRanks, available: number): LearnCheck {
  const n = allNodes(classId).find((x) => x.id === nodeId);
  if (!n) return { ok: false, why: 'Unknown node.' };
  if (n.free) return { ok: false, why: 'Starting spell' };
  if (rankOf(n, T) >= n.maxRank) return { ok: false, why: 'Maxed' };
  if (n.excludes && (T[n.excludes] ?? 0) > 0) return { ok: false, why: n.kind === 'top' ? 'You already chose the other keystone.' : 'You already chose the other option.' };
  if (n.shared && allNodes(classId).filter((x) => x.shared && rankOf(x, T) > 0).length >= MAX_SHARED_KEYSTONES) return { ok: false, why: `You already hold ${MAX_SHARED_KEYSTONES} shared keystones.` };
  const nodes = buildTree(classId, n.branch);
  const rq = n.req.map((id) => nodes.find((x) => x.id === id)!).filter(Boolean);
  const met = rq.map((x) => rankOf(x, T) > 0);
  if (rq.length && !(n.reqAny ? met.some(Boolean) : met.every(Boolean)))
    return { ok: false, why: `Requires ${rq.map((x) => x.name).join(n.reqAny ? ' or ' : ' and ')}.` };
  if (available <= 0) return { ok: false, why: 'No skill points left. Level up to earn more.' };
  return { ok: true };
}

/** Passives and granted spells for the learned ranks. */
export function treePassives(classId: string, T: TreeRanks): { passives: Passive[]; spells: string[] } {
  const passives: Passive[] = [], spells: string[] = [];
  const nodes = allNodes(classId);
  // Avatar of <School> (sk_u): "your keystone … is 50% stronger" (hook keystonePower)
  const cap = nodes.find((n) => n.id === 'sk_u');
  const capPower = cap && rankOf(cap, T) > 0 ? (cap.effects[0].hooks?.find((h) => h.id === 'keystonePower')?.value ?? 0) : 0;
  for (const n of nodes) {
    const r = rankOf(n, T);
    if (r <= 0) continue;
    const fx = n.effects[r - 1];
    passives.push(capPower && (n.id === 'sk_t0' || n.id === 'sk_t1') ? scalePassive(fx, 1 + capPower) : fx);
    if (n.grantsSpell) spells.push(n.grantsSpell);
  }
  return { passives, spells };
}

/** Reset one branch: returns the new ranks (points come back automatically since spent = Σ ranks). */
export function resetBranch(T: TreeRanks, branch: TreeBranch): TreeRanks {
  const p = PREFIX[branch];
  return Object.fromEntries(Object.entries(T).filter(([id]) => !id.startsWith(p)));
}
