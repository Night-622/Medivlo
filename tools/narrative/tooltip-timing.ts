import { HC_SCHOOL_PERKS } from '@/data/skilltrees/hc/index';
import { HC_SHARED_KEYSTONES } from '@/data/skilltrees/hc/keystones';
import { HC_MASTERY } from '@/data/skilltrees/hc/mastery';
import { HC_RUNES } from '@/data/items/hc/build-items';
import { HC_UNIQUES } from '@/data/items/hc/uniques';
import { HC_HYBRIDS } from '@/data/items/hc/hybrid-sets';
/**
 * Tooltip timing audit (Claude 4, for Claude 1's tooltip read-through). Effect lines write timings as bare brackets, "(2 s)"
 * or "(1.5 s, 4 s)", which read the same for a duration and a cooldown. This proposes the house form from the effect data:
 * a duration becomes "for 2 s", an internal cooldown "once every 4 s" (the set abilities' wording). Prints was/now
 * per line; '??' marks a value that is both a duration and a cooldown and was settled by the rule below.
 * Usage: node $(node tools/narrative/build.mjs tools/narrative/tooltip-timing.ts full)
 */
import { HC_AFFIXES } from '@/data/items/hc/affixes';
// gather icd / dur numbers (seconds) from an effect tree
function walk(o: any, icd: Set<number>, dur: Set<number>): void {
  if (!o || typeof o !== 'object') return;
  if (Array.isArray(o)) { o.forEach((x) => walk(x, icd, dur)); return; }
  for (const [k, v] of Object.entries(o)) {
    if (typeof v === 'number' && (k === 'icd' || k === 'cooldown')) icd.add(v / 1000);
    else if (typeof v === 'number' && (k === 'dur' || k === 'linger')) dur.add(v / 1000);
    else walk(v, icd, dur);
  }
}
const rows: [string, string, any][] = [];
for (const s of HC_SCHOOL_PERKS) for (const p of [...s.classes.flatMap((c: any) => c.signature), ...s.perks] as any[]) rows.push([p.id, p.text[0], p.effects[0]]);
for (const k of HC_SHARED_KEYSTONES as any[]) rows.push([k.id, k.text[0], k.effects[0]]);
for (const m of HC_MASTERY as any[]) rows.push([`${m.classId}:${m.weapon}`, m.text, m.effect ?? m.effects ?? m]);
for (const r of HC_RUNES as any[]) rows.push([r.id, r.desc, r]);
for (const u of HC_UNIQUES as any[]) rows.push([u.id, u.text, u.effect]);
for (const h of HC_HYBRIDS) rows.push([h.schools.join('+'), h.text, h.passive]);
for (const a of HC_AFFIXES as any[]) if ('proc' in a.effect) rows.push([a.id, a.text, a.effect]);
const n = (s: string) => Number(s);
let fixed = 0, unsure = 0;
for (const [id, text, fx] of rows) {
  if (!/\(([^()]*\d+(\.\d+)? ?s)\)/.test(text)) continue;
  const icd = new Set<number>(), dur = new Set<number>(); walk(fx, icd, dur);
  let ok = true;
  const out = text.replace(/ ?\(([^()]*?)\)/g, (all, inner: string, at: number) => {
    const afterFor = /for \d+(\.\d+)? ?s$/.test(text.slice(0, at).trimEnd());
    const parts = inner.split(/,\s*/);
    const times = parts.filter((p) => /^\d+(\.\d+)? ?s$/.test(p));
    if (!times.length) return all;
    const rest = parts.filter((p) => !times.includes(p));
    const v = times.map((t) => n(t.replace(/ ?s$/, '')));
    let words: string[];
    if (v.length === 2) words = [`for ${v[0]} s`, `once every ${v[1]} s`];
    else if (icd.has(v[0]) && !dur.has(v[0])) words = [`once every ${v[0]} s`];
    else if (dur.has(v[0]) && !icd.has(v[0])) words = [`for ${v[0]} s`];
    else { ok = false; words = [afterFor ? `once every ${v[0]} s` : `for ${v[0]} s`]; }
    const head = rest.length ? ` (${rest.join(', ')})` : '';
    return `${head}${words[0].startsWith('for') ? ' ' : ', '}${words.join(', ')}`;
  });
  if (ok) fixed++; else unsure++;
  console.log(`${ok ? 'OK ' : '?? '}${id}\n    was: ${text}\n    now: ${out}`);
}
console.log(`${fixed + unsure} lines rewritten (${unsure} settled by the both-ways rule: after \"for N s\" a cooldown, else a duration)`);
