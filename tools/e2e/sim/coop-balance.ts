/**
 * Co-op balance at typical gear (Claude 5 for Claude 1, 2026-10-21). Parties of 2, 3 and 4 (mixed classes, a few
 * line-ups per size, the slow tank / healer classes grouped on purpose) against the host's campaign boss (L8 lair-2,
 * L14 nemesis, L34 Act III) and a realm pack (3 creatures × the party's spawn-count scaling), through the real party
 * scaling and downed / revive rules (coop-party.ts). Kits: the gear-curve typical player's worn kit at that level
 * (gear-curve-walk.ts, seed 101) on the typical tree / hotbar, as boss-check.ts.
 * Compared with each member fighting the same thing alone (party size 1):
 *   speed-up = host's solo time / party time · additive = the time the members' solo damage rates would give against
 *   the party-scaled HP (efficiency > 1: the party beats the sum of its parts) · drag = a member whose damage share
 *   falls well below their solo rate's share.
 *   node tools/e2e/sim/run.mjs coop-balance      → tools/e2e/out/coop-balance.md   (FIGHTS=n seeds, default 2)
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { CLASS_SCHOOL } from '@/core/constants';
import { partyHpMult, spawnCountMult } from '@/systems/rules/curves';
import type { CharacterSave } from '@/systems/rules/types';
import { seedOf, typicalBuild } from './builds-make';
import { bossFor, LEVELS, type Level } from './builds-run';
import type { Spawn } from './builds-fight';
import { runParty, type PartyResult } from './coop-party';
import { questsOf, runClass } from './gear-curve-walk';

const FIGHTS = Number(process.env.FIGHTS) || 2;
const PARTIES: string[][] = [
  ['warden', 'cantor'], ['arcanist', 'swordsman'], ['huntsman', 'bard'], ['oathbound', 'shade'], ['knight', 'juggernaut'],
  ['knight', 'arcanist', 'cantor'], ['monk', 'ranger', 'skald'], ['warden', 'oathbound', 'corsair'],
  ['juggernaut', 'stormlancer', 'hedgewitch', 'bard'], ['warden', 'duskweaver', 'samurai', 'falconer'], ['warden', 'oathbound', 'knight', 'cantor'],
];
const t0 = Date.now();

// kits: one gear-curve walk per class, the worn kit at each level, on the typical tree / hotbar
const saves = new Map<string, CharacterSave>();
for (const cls of [...new Set(PARTIES.flat())]) {
  const own = await questsOf(cls);
  runClass(cls, 101, own, LEVELS, (L, pl) => { const s = typicalBuild(cls, L).save; s.equipment = structuredClone(pl.s.equipment); saves.set(`${cls}@${L}`, s); });
}
const save = (cls: string, L: Level) => saves.get(`${cls}@${L}`) ?? typicalBuild(cls, L).save;

/** hard: the boss with ×HARD damage, to see downs, revives and the downed timer play out */
type Kind = 'boss' | 'pack' | 'hard';
const HARD = Number(process.env.HARD) || 8;
// proposals (test-only): PBOSS / PFOE = HP per extra player for bosses / creatures, PCOUNT = pack count per extra player
const PBOSS = process.env.PBOSS ? Number(process.env.PBOSS) : null, PFOE = process.env.PFOE ? Number(process.env.PFOE) : null;
const PCOUNT = process.env.PCOUNT ? Number(process.env.PCOUNT) : null;
const hpCurve = PBOSS !== null || PFOE !== null ? (tier: string, n: number) => (tier === 'boss' ? PBOSS !== null ? 1 + PBOSS * (n - 1) : partyHpMult(n, 'boss') : PFOE !== null ? 1 + PFOE * (n - 1) : partyHpMult(n, 'enemy')) : undefined;
const countMult = (n: number) => (PCOUNT !== null ? 1 + PCOUNT * (n - 1) : spawnCountMult(n));
const spawnsFor = (host: string, L: Level, kind: Kind, n: number): Spawn[] => kind !== 'pack'
  ? [{ creature: bossFor(host, L).id, level: L, x: 220, y: 0 }]
  : Array.from({ length: Math.round(3 * countMult(n)) }, (_, i) => ({ creature: `bx_${CLASS_SCHOOL[host]}_${i % 3}`, level: L, x: 170 + (i % 3) * 30, y: -70 + Math.floor(i / 3) * 45 + (i % 3) * 20 }));
const runs = (party: string[], host: string, L: Level, kind: Kind): PartyResult[] =>
  Array.from({ length: FIGHTS }, (_, f) => runParty(party.map((c) => save(c, L)), spawnsFor(host, L, kind, party.length), seedOf('coop', host, L, kind, f), 600, kind === 'hard' ? HARD : 1, hpCurve));

const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / Math.max(1, xs.length);
const solo = new Map<string, PartyResult[]>();
const soloOf = (cls: string, host: string, L: Level, kind: Kind) => {
  const k = `${cls}|${host}|${L}|${kind}`;
  if (!solo.has(k)) solo.set(k, runs([cls], host, L, kind));
  return solo.get(k)!;
};
const secs = (rs: PartyResult[]) => mean(rs.filter((r) => r.won).map((r) => r.secs));

interface Row { party: string[]; L: Level; kind: Kind; target: string; res: PartyResult[]; hostSolo: number; soloSecs: number[]; additive: number; flags: string[] }
const rows: Row[] = [];
for (const party of PARTIES) for (const L of LEVELS) for (const kind of ['boss', 'pack', 'hard'] as Kind[]) {
  const host = party[0], n = party.length;
  const res = runs(party, host, L, kind);
  const soloSecs = party.map((c) => secs(soloOf(c, host, L, kind)));
  // additive: HP × the party multiplier ÷ the sum of solo rates (solo rate ∝ 1 / solo time)
  const mult = hpCurve ? (kind !== 'pack' ? hpCurve('boss', n) : hpCurve('enemy', n) * countMult(n)) : kind !== 'pack' ? partyHpMult(n, 'boss') : partyHpMult(n, 'enemy') * spawnCountMult(n);
  const additive = mult / soloSecs.reduce((a, s) => a + (s > 0 ? 1 / s : 0), 0);
  const t = secs(res), flags: string[] = [];
  const won = res.filter((r) => r.won).length;
  if (won < res.length) flags.push(`lost ${res.length - won}/${res.length}`);
  if (t > soloSecs[0]) flags.push(`slower than the host alone (${t.toFixed(0)} vs ${soloSecs[0].toFixed(0)} s)`);
  const slowest = Math.max(...soloSecs.filter((s) => s > 0));
  if (t > 0 && soloSecs.some((s, i) => s > 0 && t > s && i > 0)) flags.push(`slower than ${party.filter((_, i) => soloSecs[i] > 0 && t > soloSecs[i]).join(', ')} alone`);
  void slowest;
  // drag: a member's share of party damage vs the share their solo rate predicts
  const dealt = party.map((_, i) => mean(res.map((r) => r.members[i].dealt))), total = dealt.reduce((a, b) => a + b, 0) || 1;
  const rate = soloSecs.map((s) => (s > 0 ? 1 / s : 0)), rTot = rate.reduce((a, b) => a + b, 0) || 1;
  party.forEach((c, i) => { const got = dealt[i] / total, want = rate[i] / rTot; if (want > 0 && got < want * 0.6) flags.push(`${c} deals ${(got * 100).toFixed(0)}% of party damage (solo rate predicts ${(want * 100).toFixed(0)}%)`); });
  rows.push({ party, L, kind, target: kind !== 'pack' ? `${bossFor(host, L).name}${kind === 'hard' ? ` (×${HARD} damage)` : ''}` : `${Math.round(3 * countMult(n))} ${CLASS_SCHOOL[host]} creatures`, res, hostSolo: soloSecs[0], soloSecs, additive, flags });
  console.log(`${party.join('+').padEnd(36)} L${String(L).padEnd(2)} ${kind.padEnd(4)} ${t.toFixed(0).padStart(4)} s (host alone ${soloSecs[0].toFixed(0)} s, additive ${additive.toFixed(0)} s) · downs ${mean(res.map((r) => r.members.reduce((a, m) => a + m.downs, 0))).toFixed(1)} · revives ${mean(res.map((r) => r.members.reduce((a, m) => a + m.revivesGiven, 0))).toFixed(1)}${flags.length ? ' · ' + flags.join('; ') : ''}`);
}

// ───────────── report ─────────────
const md: string[] = ['# Co-op balance at typical gear', '', `Generated by tools/e2e/sim/coop-balance.ts (${FIGHTS} seeds per fight). Party HP scaling: boss ×${[2, 3, 4].map((n) => partyHpMult(n, 'boss')).join(' / ')}, ` +
  `creatures ×${[2, 3, 4].map((n) => partyHpMult(n, 'enemy').toFixed(1)).join(' / ')} HP and ×${[2, 3, 4].map((n) => spawnCountMult(n)).join(' / ')} count for 2 / 3 / 4 players. ` +
  'Speed-up = host alone ÷ party time; efficiency = additive time ÷ party time (> 1: better than the members\' solo rates added up).', ''];
const by = (n: number, kind: Kind) => n === 1
  ? [...solo.entries()].filter(([k]) => k.endsWith(`|${kind}`)).map(([k, res]) => { const [c, host, L] = k.split('|'); const s = secs(res); return { party: [c], L: Number(L) as Level, kind, target: '', res, hostSolo: c === host ? s : NaN, soloSecs: [s], additive: s, flags: [] } as Row; })
  : rows.filter((r) => r.party.length === n && r.kind === kind);
md.push('## Summary', '', '| party size | fight | won | speed-up vs host alone (median) | efficiency vs additive (median) | downs / fight | revives / fight | members killed (downed timer) / fight |', '|---|---|---|---|---|---|---|---|');
const med = (xs: number[]) => { const s = xs.filter((x) => Number.isFinite(x)).sort((a, b) => a - b); return s.length ? s[s.length >> 1] : NaN; };
for (const n of [1, 2, 3, 4]) for (const kind of ['boss', 'pack', 'hard'] as Kind[]) {
  const rs = by(n, kind);
  const won = rs.reduce((a, r) => a + r.res.filter((x) => x.won).length, 0), all = rs.reduce((a, r) => a + r.res.length, 0);
  md.push(`| ${n} | ${kind} | ${won}/${all} | ×${med(rs.map((r) => r.hostSolo / secs(r.res))).toFixed(2)} | ${med(rs.map((r) => r.additive / secs(r.res))).toFixed(2)} | ${mean(rs.map((r) => mean(r.res.map((x) => x.members.reduce((a, m) => a + m.downs, 0))))).toFixed(2)} | ${mean(rs.map((r) => mean(r.res.map((x) => x.members.reduce((a, m) => a + m.revivesGiven, 0))))).toFixed(2)} | ${mean(rs.map((r) => mean(r.res.map((x) => x.members.reduce((a, m) => a + m.deaths, 0))))).toFixed(2)} |`);
}
const flagged = rows.filter((r) => r.flags.length);
// revive diagnostics (hard fights)
const hard = rows.filter((r) => r.kind === 'hard').flatMap((r) => r.res.flatMap((x) => x.members));
const sum = (f: (m: (typeof hard)[number]) => number) => hard.reduce((a, m) => a + f(m), 0);
md.push('', `Revives under ×${HARD} boss damage: ${sum((m) => m.downs)} downs, ${sum((m) => m.revivesGiven)} revives, ${sum((m) => m.deaths)} members lost to the downed timer or a wipe. ` +
  `Helpers knelt ${sum((m) => m.kneel).toFixed(0)} s in range with F held; the 0.5 s combat lock blocked ${sum((m) => m.blockedOwn).toFixed(0)} s of it through the helper's own damage (DoTs, zones, pets' owner credit) and ${sum((m) => m.blockedHit).toFixed(0)} s through hits taken.`);
md.push('', '## Where co-op feels worse', '', ...(flagged.length ? flagged.map((r) => `- **${r.party.join(' + ')}** L${r.L} ${r.kind} (${r.target}): ${r.flags.join('; ')}`) : ['- none']), '');
md.push('## Every fight', '', '| party | L | fight | won | party time | each member alone | additive | speed-up | damage shares | downs | revives | killed |', '|---|---|---|---|---|---|---|---|---|---|---|---|');
for (const r of rows) {
  const t = secs(r.res), dealt = r.party.map((_, i) => mean(r.res.map((x) => x.members[i].dealt))), tot = dealt.reduce((a, b) => a + b, 0) || 1;
  md.push(`| ${r.party.join(' + ')} | ${r.L} | ${r.target} | ${r.res.filter((x) => x.won).length}/${r.res.length} | ${t.toFixed(0)} s | ${r.soloSecs.map((s) => s.toFixed(0)).join(' / ')} s | ${r.additive.toFixed(0)} s | ×${(r.hostSolo / t).toFixed(2)} | ${dealt.map((d) => ((d / tot) * 100).toFixed(0) + '%').join(' / ')} | ${mean(r.res.map((x) => x.members.reduce((a, m) => a + m.downs, 0))).toFixed(1)} | ${mean(r.res.map((x) => x.members.reduce((a, m) => a + m.revivesGiven, 0))).toFixed(1)} | ${mean(r.res.map((x) => x.members.reduce((a, m) => a + m.deaths, 0))).toFixed(1)} |`);
}
mkdirSync('tools/e2e/out', { recursive: true });
writeFileSync('tools/e2e/out/coop-balance.md', md.join('\n'));
console.log(`${flagged.length} flagged · report tools/e2e/out/coop-balance.md · run time ${((Date.now() - t0) / 1000).toFixed(1)} s`);
