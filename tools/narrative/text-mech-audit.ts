/**
 * Text vs mechanics audit (Claude 4, for Claude 1): every perk, keystone, mastery, spell, rune, unique and hybrid
 * description is checked against the data it describes.
 *   NUM   a number in the text that the data doesn't have (wrong value)
 *   CD    the data has an internal cooldown the text never mentions
 *   DUR   a status / buff duration in the data that the text never mentions
 *   CHANCE a proc chance in the data that the text never mentions
 *   TARGET "foes" for something that only ever hits one target, or a single "foe" for an area
 *   COND  a condition in the data (target has <status>, health below N%) the text doesn't state
 * Heuristic: every flag is a candidate for a human read, not a verdict.
 * Usage: node $(node tools/narrative/build.mjs tools/narrative/text-mech-audit.ts full) [VERBOSE=1] [ONLY=perk,spell…]
 */
import { HC_SCHOOL_PERKS } from '@/data/skilltrees/hc/index';
import { HC_SHARED_KEYSTONES } from '@/data/skilltrees/hc/keystones';
import { HC_MASTERY } from '@/data/skilltrees/hc/mastery';
import { HC_KIT_SPELLS_NEW } from '@/data/spells/hc/kit-spells-new';
import { HC_KIT_SPELLS } from '@/data/spells/hc/kit-spells';
import { HC_RUNES } from '@/data/items/hc/build-items';
import { HC_UNIQUES } from '@/data/items/hc/uniques';
import { HC_HYBRIDS } from '@/data/items/hc/hybrid-sets';

type Row = { kind: string; id: string; text: string; data: unknown };
const rows: Row[] = [];
for (const s of HC_SCHOOL_PERKS) for (const p of [...s.classes.flatMap((c) => c.signature), ...s.perks]) {
  const last = p.text.length - 1;
  rows.push({ kind: 'perk', id: p.id, text: p.text[last], data: p.effects[last] });
}
for (const k of HC_SHARED_KEYSTONES) rows.push({ kind: 'keystone', id: k.id, text: k.text[0], data: k.effects[0] });
for (const m of HC_MASTERY) rows.push({ kind: 'mastery', id: `${m.classId}:${m.weapon}`, text: m.text, data: m.passive });
for (const s of [...HC_KIT_SPELLS, ...HC_KIT_SPELLS_NEW]) rows.push({ kind: 'spell', id: s.id, text: s.desc, data: s.actions });
for (const r of HC_RUNES) rows.push({ kind: 'rune', id: r.id, text: r.desc, data: r.mod });
for (const u of HC_UNIQUES) rows.push({ kind: 'unique', id: u.id, text: u.text, data: u.effect });
for (const h of HC_HYBRIDS) rows.push({ kind: 'hybrid', id: h.schools.join('+'), text: h.text, data: h.passive });

const r1 = (n: number) => Math.round(n * 10) / 10;
/** every number the data could legitimately be quoted as, plus the facts the checks need */
function facts(data: unknown) {
  const nums = new Set<number>(), icd: number[] = [], durs: number[] = [], chances: number[] = [], conds: string[] = [];
  let single = 0, area = 0;
  const add = (n: number) => { nums.add(r1(n)); nums.add(r1(n * 100)); nums.add(r1(n / 1000)); nums.add(r1(n / 32)); nums.add(r1(Math.abs(n) * 100)); nums.add(r1(Math.abs(n))); };
  const walk = (o: unknown, key = ''): void => {
    if (Array.isArray(o)) { o.forEach((x) => walk(x, key)); return; }
    if (!o || typeof o !== 'object') { if (typeof o === 'number') add(o); return; }
    const x = o as Record<string, unknown>;
    if (typeof x.icd === 'number') icd.push(x.icd / 1000);
    if (typeof x.dur === 'number' && key !== 'zone') durs.push(x.dur / 1000);
    if (typeof x.chance === 'number' && x.chance < 1) chances.push(r1(x.chance * 100));
    if (x.shape === 'single') single++; else if (typeof x.shape === 'string') area++;
    if (x.c === 'targetHas' && typeof x.status === 'string') conds.push(`status:${x.status}`);
    if (x.c === 'hpBelow' || x.c === 'targetHpBelow') conds.push(`${x.c}:${r1(Number(x.pct) * 100)}`);
    if (x.c === 'moving') conds.push('moving');
    for (const [k, v] of Object.entries(x)) walk(v, k === 'a' ? String(v) : k);
  };
  walk(data);
  return { nums, icd, durs, chances, conds, single, area };
}

// status words a description uses for "target has <status>"
const STATUS_WORDS: Record<string, RegExp> = {
  chill: /chill/i, freeze: /froz|freez/i, burn: /burn/i, poison: /poison/i, bleed: /bleed/i, shock: /shock/i, stun: /stun/i,
  blind: /blind/i, root: /root/i, mark: /mark/i, linked: /link/i, slow: /slow/i, weaken: /weak/i, vulnerable: /vulnerab/i,
  confuse: /confus/i, sleep: /sleep|asleep/i, doom: /doom/i, knockdown: /knock/i, fear: /fear|afraid/i,
};

const only = process.env.ONLY?.split(',');
const flags: Record<string, string[]> = { NUM: [], CD: [], DUR: [], CHANCE: [], TARGET: [], COND: [] };
for (const r of rows) {
  if (only && !only.includes(r.kind)) continue;
  const f = facts(r.data), t = r.text;
  const tag = `${r.kind} ${r.id}: ${t}`;
  const textNums = [...t.matchAll(/(\d+(?:\.\d+)?)/g)].map((m) => Number(m[1]));
  // ordinals ("every 4th hit"), counts in words and px distances are all data too; anything else should match
  const wrong = textNums.filter((n) => !f.nums.has(r1(n)) && !(n <= 12 && Number.isInteger(n) && /\d+(st|nd|rd|th)\b|\+\d+ (to|projectile|dash|max)|\d+ (foes|more|hits|times|spins|knives|volleys)/.test(t)));
  if (wrong.length) flags.NUM.push(`${tag}  [not in data: ${wrong.join(', ')}]`);
  const saysCd = /once every|\(\d+(\.\d+)? ?s\)|cooldown|recharge/i.test(t);
  if (f.icd.some((s) => s >= 1) && !saysCd && !f.icd.every((s) => t.includes(`${s} s`))) flags.CD.push(`${tag}  [icd ${f.icd.join('/')} s]`);
  const missingDur = f.durs.filter((s) => s >= 1 && !t.includes(`${s} s`) && !t.includes(`${s}s`));
  if (missingDur.length && !/for \d|until|while/.test(t)) flags.DUR.push(`${tag}  [dur ${missingDur.join('/')} s]`);
  const missingCh = f.chances.filter((c) => !t.includes(`${c}%`));
  if (missingCh.length) flags.CHANCE.push(`${tag}  [chance ${missingCh.join('/')}%]`);
  if (/\bfoes\b/i.test(t) && f.single > 0 && f.area === 0 && !/foes (below|near|that|who|with|around|in)|marked foes|chilled foes|frozen foes|linked foes|burning foes|rooted foes|stunned foes|blinded foes|bosses|to foes \d/i.test(t)) flags.TARGET.push(`${tag}  [single-target only]`);
  for (const c of f.conds) {
    if (c.startsWith('status:')) { const s = c.slice(7); const re = STATUS_WORDS[s] ?? new RegExp(s, 'i'); if (!re.test(t)) flags.COND.push(`${tag}  [needs target ${s}]`); }
    else if (c.startsWith('hpBelow:') || c.startsWith('targetHpBelow:')) { const pct = c.split(':')[1]; if (!t.includes(`${pct}%`)) flags.COND.push(`${tag}  [${c}]`); }
    else if (c === 'moving' && !/mov/i.test(t)) flags.COND.push(`${tag}  [while moving]`);
  }
}
// strict pass: a quoted power, duration or distance must match a value of that same kind
flags.STRICT = [];
const kinds = (data: unknown) => {
  const coef = new Set<number>(), secs = new Set<number>(), px = new Set<number>();
  const walk = (o: unknown): void => {
    if (Array.isArray(o)) { o.forEach(walk); return; }
    if (!o || typeof o !== 'object') return;
    for (const [k, v] of Object.entries(o as Record<string, unknown>)) {
      if (typeof v === 'number') {
        if (k === 'coef' || k === 'pctMax') coef.add(r1(v * 100));
        if (['dur', 'icd', 'linger', 'ms', 'tick', 'delay', 'castMs'].includes(k)) secs.add(r1(v / 1000));
        if (['r', 'len', 'width', 'range', 'dist', 'px'].includes(k)) px.add(v);
      } else walk(v);
    }
  };
  walk(data);
  return { coef, secs, px };
};
for (const r of rows) {
  if (only && !only.includes(r.kind)) continue;
  const k = kinds(r.data), bad: string[] = [];
  for (const m of r.text.matchAll(/(\d+(?:\.\d+)?)% (?:spell |weapon )?power/g)) if (!k.coef.has(r1(Number(m[1])))) bad.push(`${m[1]}% power`);
  for (const m of r.text.matchAll(/(?:for|over|after) (\d+(?:\.\d+)?) s\b/g)) if (!k.secs.has(r1(Number(m[1])))) bad.push(`${m[1]} s`);
  for (const m of r.text.matchAll(/(\d+) px/g)) if (!k.px.has(Number(m[1]))) bad.push(`${m[1]} px`);
  if (bad.length) flags.STRICT.push(`${r.kind} ${r.id}: ${r.text}  [${bad.join(', ')}]`);
}
let total = 0;
for (const [k, list] of Object.entries(flags)) {
  total += list.length;
  console.log(`${k.padEnd(7)} ${list.length}`);
  if (process.env.VERBOSE) for (const l of list) console.log(`    ${l}`);
}
console.log(`rows ${rows.filter((r) => !only || only.includes(r.kind)).length}, flags ${total}`);
