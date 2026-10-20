/**
 * rules-props: the stat engine (Claude 5). Every condition kind both ways, the flat / increased / more arithmetic of
 * compile, conditional modifiers, hook sums, scalePassive, and a content-wide guard: a conditional modifier on a
 * scaled stat (hp, armour, sp…) must be flat, since statWith adds conditional values raw (a conditional "+4% health"
 * would add 0.04 HP). The content sweep covers every tree node, set bonus, Attuned bonus, legendary and story item.
 */
import { HC_CLASSES } from '@/data/classes/hc/classes.gen';
import { HC_CAMPAIGN_ITEMS } from '@/data/items/hc/campaign-items';
import { HC_LEGENDARIES } from '@/data/items/hc/legendary.gen';
import { HC_PIECES, HC_SCHOOLS, HC_SETS } from '@/data/items/hc/armour.gen';
import { ATTUNED, legendaryPassive, setBonuses } from '@/systems/rules/gear';
import { scalePassive } from '@/systems/rules/scale';
import { compile, evalCond, hook, moreWith, statWith, type CondCtx } from '@/systems/rules/stats';
import { allNodes } from '@/systems/rules/tree';
import type { Cond, Passive, Proc } from '@/systems/rules/types';
import { check, near } from './features-harness';

const base: CondCtx = { hpFrac: 0.5, inCombat: false, stationaryMs: 0, momentum: 0 };
const ctx = (x: Partial<CondCtx>): CondCtx => ({ ...base, ...x });

/** [condition, a context where it holds, one where it does not] for every Cond kind */
const CONDS: [Cond, CondCtx, CondCtx][] = [
  [{ c: 'hpBelow', pct: 0.5 }, ctx({ hpFrac: 0.4 }), ctx({ hpFrac: 0.5 })],
  [{ c: 'hpAbove', pct: 0.5 }, ctx({ hpFrac: 0.6 }), ctx({ hpFrac: 0.5 })],
  [{ c: 'targetHpAbove', pct: 0.8 }, ctx({ targetHpFrac: 0.9 }), ctx({ targetHpFrac: 0.8 })],
  [{ c: 'targetHpBelow', pct: 0.3 }, ctx({ targetHpFrac: 0.2 }), ctx({})],
  [{ c: 'targetHas', status: 'burn' }, ctx({ targetStatuses: new Set(['burn']) }), ctx({ targetStatuses: new Set(['chill']) })],
  [{ c: 'targetTier', tiers: ['boss'] }, ctx({ targetTier: 'boss' }), ctx({ targetTier: 'player' })],
  [{ c: 'targetFar', px: 200 }, ctx({ distance: 200 }), ctx({ distance: 199 })],
  [{ c: 'alone', px: 300 }, ctx({ alliesNear: 0 }), ctx({ alliesNear: 1 })],
  [{ c: 'inCombat' }, ctx({ inCombat: true }), ctx({})],
  [{ c: 'stationary', ms: 1000 }, ctx({ stationaryMs: 1000 }), ctx({ stationaryMs: 999 })],
  [{ c: 'weapon', types: ['sword', 'dagger'] }, ctx({ weapon: 'dagger' }), ctx({ weapon: 'bow' })],
  [{ c: 'behind' }, ctx({ behind: true }), ctx({})],
  [{ c: 'fromStealth' }, ctx({ fromStealth: true }), ctx({})],
  [{ c: 'momentum', min: 5 }, ctx({ momentum: 5 }), ctx({ momentum: 4 })],
  [{ c: 'emberAbove', pct: 0.5 }, ctx({ emberFrac: 0.6 }), ctx({ emberFrac: 0.5 })],
  [{ c: 'emberBelow', pct: 0.3 }, ctx({ emberFrac: 0.2 }), ctx({})],
  [{ c: 'staminaBelow', pct: 0.3 }, ctx({ staminaFrac: 0.2 }), ctx({})],
  [{ c: 'moving' }, ctx({ moving: true }), ctx({})],
  [{ c: 'minions', min: 2 }, ctx({ minions: 2 }), ctx({ minions: 1 })],
];
/** every Cond kind must have a row above: a new kind without one fails this suite's typecheck */
const COVERED: Record<Cond['c'], true> = {
  hpBelow: true, hpAbove: true, targetHpAbove: true, targetHpBelow: true, targetHas: true, targetTier: true, targetFar: true, alone: true,
  inCombat: true, stationary: true, weapon: true, behind: true, fromStealth: true, momentum: true, emberAbove: true, emberBelow: true,
  staminaBelow: true, moving: true, minions: true,
};

/** stats where compile applies the increased pool to the flat total (stats.ts SCALED) */
const SCALED = ['hp', 'ember', 'stamina', 'armor', 'sp', 'emberRegen', 'hpRegen', 'staminaRegen'];

/** every Passive the game ships, labelled */
function contentPassives(): [string, Passive][] {
  const out: [string, Passive][] = [];
  for (const c of HC_CLASSES) for (const n of allNodes(c.id)) n.effects.forEach((p, i) => out.push([`${c.id} ${n.id} r${i + 1}`, p]));
  for (const s of HC_SCHOOLS) out.push([`attuned ${s}`, ATTUNED[s]]);
  for (const set of HC_SETS) {
    const pieces = HC_PIECES.filter((x) => x.set === set.id).map((x, i) => ({ uid: `${i}`, base: x.id, ilvl: 20, qty: 1 }));
    setBonuses(pieces, set.school).forEach((p, i) => out.push([`set ${set.id} #${i}`, p]));
  }
  for (const l of HC_LEGENDARIES) out.push([`legendary ${l.id}`, legendaryPassive(l.id)]);
  for (const ci of HC_CAMPAIGN_ITEMS) if (ci.passive) out.push([`story ${ci.id}`, ci.passive]);
  return out;
}

export function statsProps(): void {
  // conditions
  const wrong = CONDS.filter(([c, yes, no]) => !evalCond(c, yes) || evalCond(c, no)).map(([c]) => c.c);
  const kinds = new Set(CONDS.map(([c]) => c.c));
  const missing = Object.keys(COVERED).filter((k) => !kinds.has(k as Cond['c']));
  check(!wrong.length && !missing.length, `evalCond: all ${kinds.size} condition kinds hold where they should and only there`, [...wrong, ...missing.map((m) => `no row: ${m}`)].join(', '));

  // compile arithmetic
  const k = compile([
    { mods: [{ stat: 'hp', op: 'flat', value: 100 }, { stat: 'hp', op: 'pct', value: 0.1 }] },
    { mods: [{ stat: 'hp', op: 'pct', value: 0.1 }, { stat: 'hp', op: 'more', value: 0.5 }] },
    { mods: [{ stat: 'crit', op: 'flat', value: 0.05 }, { stat: 'crit', op: 'pct', value: 0.08 }] },
    { mods: [{ stat: 'dmg', op: 'flat', value: 0.1 }, { stat: 'dmg', op: 'more', value: 0.5 }, { stat: 'dmg', op: 'more', value: 0.2 }] },
  ]);
  check(near(k.stats.hp, 100 * 1.2 * 1.5), `compile: scaled stats are flat × (1 + Σincreased) × Πmore (hp 100, +10% +10%, 50% more → ${k.stats.hp})`);
  check(near(k.stats.crit, 0.13), `compile: on plain stats an increased value adds (crit 5% + 8% → ${k.stats.crit})`);
  check(near(k.stats.dmg, 0.1) && near(k.more.dmg, 1.5 * 1.2) && !('hp' in k.more), `compile: "more" on plain stats multiplies apart (dmg more ×${k.more.dmg?.toFixed(2)}); scaled stats bake it in`);

  // conditional modifiers stay out of the table and apply by context
  const cm = compile([{ mods: [
    { stat: 'dmg', op: 'flat', value: 0.2, when: { c: 'hpBelow', pct: 0.5 } },
    { stat: 'dmg', op: 'more', value: 1, when: { c: 'fromStealth' } },
    { stat: 'dmg', op: 'flat', value: 0.05 },
  ] }]);
  check(cm.conditional.length === 2 && near(cm.stats.dmg, 0.05), 'compile: conditional modifiers are kept aside, not summed into the table');
  check(near(statWith(cm, 'dmg', ctx({ hpFrac: 0.3 })), 0.25) && near(statWith(cm, 'dmg', ctx({ hpFrac: 0.9 })), 0.05), 'statWith: a conditional flat applies only while its condition holds');
  check(near(moreWith(cm, 'dmg', ctx({ fromStealth: true })), 2) && near(moreWith(cm, 'dmg', ctx({})), 1), 'moreWith: a conditional "more" multiplies only while its condition holds');

  // hooks
  const h = compile([{ hooks: [{ id: 'sw' }, { id: 'v', value: 0.3 }] }, { hooks: [{ id: 'sw' }, { id: 'v', value: 0.2 }] }]);
  check(hook(h, 'sw') === 2 && near(hook(h, 'v'), 0.5) && hook(h, 'none') === 0, 'compile: hook values add up; a switch counts 1 per source; an absent hook is 0');

  // scalePassive
  const proc: Proc = { on: 'hit', icd: 1000, do: [{ a: 'heal', pctMax: 0.1, over: 4000, to: 'self' }, { a: 'damage', coef: 0.4, area: { shape: 'circle', at: 'self', r: 90 } }] };
  const p: Passive = { mods: [{ stat: 'dmg', op: 'flat', value: 0.2 }], hooks: [{ id: 'sw' }, { id: 'v', value: 2 }], procs: [proc], spellMods: [{ spell: '*', dmg: 0.1 }] };
  const s = scalePassive(p, 1.5);
  const a0 = s.procs![0].do[0] as { pctMax: number; over: number }, a1 = s.procs![0].do[1] as { coef: number; area: { r: number } };
  check(scalePassive(p, 1) === p, 'scalePassive: ×1 returns the passive untouched');
  check(near(s.mods![0].value, 0.3) && s.hooks![0].value === undefined && near(s.hooks![1].value!, 3), 'scalePassive: modifier and hook values scale; switch hooks stay switches');
  check(near(a0.pctMax, 0.15) && a0.over === 4000 && near(a1.coef, 0.6) && a1.area.r === 90 && s.procs![0].icd === 1000,
    'scalePassive: proc sizes (coef, pctMax) scale; durations, radii and cooldowns do not');
  check(JSON.stringify(p.mods) === JSON.stringify([{ stat: 'dmg', op: 'flat', value: 0.2 }]), 'scalePassive: the original passive is not mutated');

  // content-wide guard: conditional modifiers on scaled stats must be flat
  const all = contentPassives();
  const raw = all.flatMap(([who, ps]) => (ps.mods ?? []).filter((m) => m.when && SCALED.includes(m.stat) && m.op !== 'flat').map((m) => `${who}: ${m.op} ${m.stat}`));
  check(!raw.length, `content (${all.length} passives): no conditional increased/more modifier on a scaled stat (statWith would add it raw)`, raw.slice(0, 4).join('; '));
  const nonFinite = all.filter(([, ps]) => (ps.mods ?? []).some((m) => !Number.isFinite(m.value)) || (ps.hooks ?? []).some((x) => x.value !== undefined && !Number.isFinite(x.value))).map(([w]) => w);
  check(!nonFinite.length, 'content: every modifier and hook value is a finite number', nonFinite.slice(0, 4).join('; '));
}
