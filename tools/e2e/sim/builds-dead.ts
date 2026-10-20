/**
 * Build simulator (Claude 3 helper): dead-content analysis. For one class, a direct A/B on the typical build at the
 * probe level: every tree node (added at max rank to a build without it, or removed from a build that has it) and
 * every kit / school spell (bound vs slot empty). Marginal value = test vs reference on the builds-probe.ts probe.
 * Dead or near-dead: < 2% DPS, < 2% survival and < 2% EHP change, and no utility effect (movement, loot, XP, gold,
 * bag, stamina, potions, crowd control) that the probe cannot see.
 */
import { kitFor } from '@/data/classes/hc/kits';
import { spellDef } from '@/systems/rules/spells';
import { allNodes } from '@/systems/rules/tree';
import type { CharacterSave, TreeNode } from '@/systems/rules/types';
import { calibrate, probe, PROBE_SEEDS, type Probe } from './builds-probe';
import { learnedSpells, typicalBuild } from './builds-make';

export const DEAD_PCT = 0.02;
const UTIL_STATS = new Set(['moveSpeed', 'bag', 'lootRange', 'xp', 'gold', 'itemFind', 'potionHeal', 'stamina', 'staminaRegen', 'dashCharges', 'stunTaken', 'slowPower', 'rootDur']);
const UTIL_HOOKS = new Set(['dashNoSlow', 'potionCdr', 'shopDiscount', 'chestExtra', 'rootDurMs']);

/** Utility parts of a node (at max rank) the combat probe cannot measure. */
export function utilityOf(n: TreeNode): string[] {
  const fx = n.effects[n.maxRank - 1] ?? {};
  return [...(fx.mods ?? []).filter((m) => UTIL_STATS.has(m.stat)).map((m) => m.stat), ...(fx.hooks ?? []).filter((h) => UTIL_HOOKS.has(h.id)).map((h) => h.id)];
}

export type Verdict = 'dead' | 'utility' | 'live';
export interface Item {
  cls: string;
  /** node id, or "spell:<id>" / "kit:<slot>" */
  id: string;
  /** the same position in every class's tree, named without the class's own spell / school names */
  pos: string;
  name: string;
  /** "add" (to a build without it), "remove" (from the typical build), "bind" (spell in a slot vs empty), "ranks" */
  mode: 'add' | 'remove' | 'bind' | 'ranks';
  points: number;
  dDps: number; dSurv: number; dEhp: number;
  util: string[];
  verdict: Verdict;
}

const clone = (s: CharacterSave): CharacterSave => structuredClone(s);
const rel = (b: number, a: number): number => (a === 0 ? (b === 0 ? 0 : 1) : (b - a) / Math.abs(a));

/** Survival delta: how much of the reference's NET drain (taken − healed) B cancels. Normalised by net drain, floored at
 *  10% of gross damage taken (Claude 5, agreed with Claude 3): dividing by gross damage made a once-a-minute 25% shield
 *  read ~0.3% on heal-heavy classes whose gross intake is huge, though it adds 20%+ to time-to-die. The floor keeps it
 *  bounded where sustain nearly matches the incoming damage. */
export const survDelta = (test: Probe, ref: Probe): number => (ref.drain - test.drain) / Math.max(ref.drain, 0.1 * Math.max(ref.taken, test.taken), ref.maxHp / 200);

function item(cls: string, id: string, name: string, mode: Item['mode'], points: number, test: Probe, ref: Probe, util: string[]): Item {
  const dDps = rel(test.dps, ref.dps), dSurv = survDelta(test, ref), dEhp = rel(test.ehp, ref.ehp);
  const small = Math.abs(dDps) < DEAD_PCT && Math.abs(dSurv) < DEAD_PCT && Math.abs(dEhp) < DEAD_PCT;
  return { cls, id, pos: position(cls, id, name), name, mode, points, dDps, dSurv, dEhp, util, verdict: !small ? 'live' : util.length ? 'utility' : 'dead' };
}

/** A node / spell position named for every class at once ("+8% kit spell 2 damage", "keystone 1"). */
function position(cls: string, id: string, name: string): string {
  const FIXED: Record<string, string> = {
    'kit:1': 'kit spell 1', 'kit:2': 'kit spell 2', 'kit:3': 'kit spell 3', 'spell:sp_t0': 'school spell 1', 'spell:sp_t1': 'school spell 2',
    'spell:sp_u': 'school ultimate', sp_t0: 'school spell 1 ranks 2–3', sp_t1: 'school spell 2 ranks 2–3',
    sk_p0a: 'school Attunement', sk_p0b: 'school element node', sk_t0: 'keystone 1', sk_t1: 'keystone 2', sk_u: 'Avatar capstone',
  };
  if (FIXED[id]) return FIXED[id];
  let out = name;
  kitFor(cls).spells.forEach((sp, i) => { const nm = spellDef(sp)?.name; if (nm) out = out.split(nm).join(`kit spell ${i + 1}`); });
  return out;
}

/** Unbind a spell from the hotbar (slot left empty). */
const unbind = (s: CharacterSave, spell: string | undefined): void => { if (spell) s.hotbar = s.hotbar.map((x) => (x === spell ? null : x)) as CharacterSave['hotbar']; };

export interface ClassDead { cls: string; level: number; dmgMult: number; noise: { dDps: number; dSurv: number }; base: Probe; items: Item[] }

export function deadContent(cls: string, level: number): ClassDead {
  const base = typicalBuild(cls, level).save;
  const dmgMult = calibrate(base);
  const P = (s: CharacterSave): Probe => probe(s, dmgMult);
  const bp = P(base);
  // noise floor: the same build on two other seeds
  const alt = probe(base, dmgMult, PROBE_SEEDS.map((x) => x + 100));
  const noise = { dDps: rel(alt.dps, bp.dps), dSurv: survDelta(alt, bp) };
  const items: Item[] = [];
  const kit = kitFor(cls).spells;

  // kit spells: bound (the typical build) vs that slot empty
  kit.forEach((sp, i) => {
    const ref = clone(base); ref.hotbar[i] = null;
    if (base.hotbar[i] !== sp) return;
    items.push(item(cls, `kit:${i + 1}`, `${spellDef(sp)?.name ?? sp} (kit spell ${i + 1})`, 'bind', 0, bp, P(ref), []));
  });

  // school spells + ultimate: learned at rank 1 and bound to slot 4 vs slot 4 empty; then ranks 2–3 of the tops
  const emptySlot4 = clone(base); emptySlot4.hotbar[3] = null;
  const e4 = P(emptySlot4);
  for (const n of allNodes(cls).filter((x) => x.grantsSpell && !kit.includes(x.grantsSpell))) {
    const t = clone(base); t.tree[n.id] = Math.max(1, t.tree[n.id] ?? 0); t.hotbar[3] = n.grantsSpell!;
    const r1 = clone(t); r1.tree[n.id] = 1;
    const p1 = P(r1);
    items.push(item(cls, `spell:${n.id}`, `${n.name} (${n.id === 'sp_u' ? 'ultimate' : 'school spell'})`, 'bind', 1, p1, e4, []));
    if (n.maxRank > 1) {
      const rm = clone(t); rm.tree[n.id] = n.maxRank;
      items.push(item(cls, n.id, `${n.name} ranks 2–${n.maxRank}`, 'ranks', n.maxRank - 1, P(rm), p1, []));
    }
  }

  // every other node: remove from the typical build, or add at max rank (its exclusive partner removed on both sides)
  for (const n of allNodes(cls)) {
    if (n.kind === 'root' || n.free || (n.grantsSpell && !kit.includes(n.grantsSpell))) continue;
    const have = base.tree[n.id] ?? 0;
    if (have > 0) {
      const ref = clone(base); delete ref.tree[n.id];
      items.push(item(cls, n.id, n.name, 'remove', have, bp, P(ref), utilityOf(n)));
    } else {
      const ref = clone(base);
      if (n.excludes && (ref.tree[n.excludes] ?? 0) > 0) {
        const partner = allNodes(cls).find((x) => x.id === n.excludes);
        delete ref.tree[n.excludes];
        if (partner?.grantsSpell) unbind(ref, partner.grantsSpell);
        if (!learnedSpells(cls, ref).includes(ref.hotbar[3] ?? '')) ref.hotbar[3] = learnedSpells(cls, ref)[0] ?? null;
      }
      const t = clone(ref); t.tree[n.id] = n.maxRank;
      items.push(item(cls, n.id, n.name, 'add', n.maxRank, P(t), n.excludes && (base.tree[n.excludes] ?? 0) > 0 ? P(ref) : bp, utilityOf(n)));
    }
  }
  return { cls, level, dmgMult, noise, base: bp, items };
}
