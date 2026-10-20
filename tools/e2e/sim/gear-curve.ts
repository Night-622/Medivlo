/**
 * Gear curve (Claude 5 for Claude 1, 2026-10-21): a typical player's gear and gold over each class campaign, from the
 * real loot rules. The walk is xp-project.ts's (Claude 3): each class's Act I–III quests in order, kills on the way
 * (Claude 2's walk exports), quest kill objectives, lair waves and bosses, quest rewards. On top: every kill rolls
 * rollKillLoot, every chest in a cleared instance rolls openChest (the instance's own generated chests, side rooms
 * included), quest gold and hcItems pay out, and each quest ends with a town visit (gear-curve-model.ts Player.town).
 *   node tools/e2e/sim/run.mjs gear-curve [classId…]      → tools/e2e/out/gear-curve.md
 *   SEEDS=n (default 3) · EXPLORE=1 also fights lair side rooms (xp-project's explorer) · RF=0 no Runeforge (→ gear-curve-noforge.md)
 * Not modelled: optional realm ruins / caves and Morvane caves (extra chests), dialogue story items, PvP gold, potions.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import type { QuestDef, WorldObject } from '@/core';
import { CLASS_SCHOOL } from '@/core/constants';
import { HC_SHOPS } from '@/data/items/hc/shops';
import { creature } from '@/systems/rules/creatures';
import { LEVEL_CAP, P, xpForKill, xpToNext } from '@/systems/rules/curves';
import { socketCost, upgradeCost } from '@/systems/rules/runeforge';
import { RARITY_ORDER, type ItemInstance, type Rarity } from '@/systems/rules/types';
import { shopStock } from '@/systems/sim/shop';
import { QUEST_XP_TIER } from '@/systems/sim/shop';
import { ELITE } from '@/data/enemies/hc/elites';
import { InstanceGen } from '@/world/hc/instanceGen';
import { instanceDef } from '@/world/hc/spaces';
import { startAreaOf } from '@/world/hc/worldService';
import { spawnZones, type SpawnZoneDef } from '@/world/hc/spawns';
import { kitFor } from '@/data/classes/hc/kits';
import { Player, REAL_UPGRADE } from './gear-curve-model';

const CHECK = [5, 10, 15, 20, 30, 40] as const;
const SEEDS = Number(process.env.SEEDS) || 3;
const EXPLORE = process.env.EXPLORE === '1';
const DRY = 5;
const args = process.argv.slice(3);
const CLASSES = args.length ? args : Object.keys(CLASS_SCHOOL);

// ───────────── the walk (xp-project.ts, condensed) ─────────────
type WalkZone = string | { id: string; level: [number, number]; elite: boolean; cap: number };
type Walk = Record<string, { quest: string; zones?: WalkZone[]; lairs?: string[] }[]>;
const walks: Walk = {};
for (const f of ['act1', 'act2', 'act3'].map((a) => `tools/playthrough/out/${a}-walks.json`)) {
  for (const [cls, list] of Object.entries(JSON.parse(readFileSync(f, 'utf8')) as Walk)) (walks[cls] ??= []).push(...list);
}
const spaceOfZone = (id: string): string | null => { const m = /^(?:camp|patrol|zone|guard|pack):([a-z]+)-/.exec(id); return m ? `realm:${m[1]}` : null; };
// (Concordia zones are not realm spaces: the lookup throws, and the exported band / cap carry them instead)
const zoneById = (id: string): SpawnZoneDef | undefined => { const sp = spaceOfZone(id); try { return sp ? spawnZones(sp).find((z) => z.id === id) : undefined; } catch { return undefined; } };
const tierOf = (id: string) => creature(id)?.tier ?? 'enemy';
function order(qs: QuestDef[]): QuestDef[] {
  const isMain = (q: QuestDef) => q.type === 'main' || q.type === 'class';
  const mains = qs.filter(isMain), after = new Map<string, QuestDef[]>();
  for (const s of qs.filter((q) => !isMain(q))) {
    const refs = JSON.stringify(s.requires ?? {});
    const anchor = [...mains].reverse().find((m) => refs.includes(`"${m.id}"`)) ?? mains[0];
    if (anchor) after.set(anchor.id, [...(after.get(anchor.id) ?? []), s]);
  }
  return mains.flatMap((m) => [m, ...(after.get(m.id) ?? [])]);
}
function actQuests(cls: string, act: QuestDef['act'], own: QuestDef[], shared: QuestDef[]): QuestDef[] {
  const gatedTo = (q: QuestDef) => [...JSON.stringify(q.requires ?? {}).matchAll(/"heroClass":"([a-z]+)"/g)].map((m) => m[1]);
  const mine = (q: QuestDef) => q.act === act && ['main', 'class', 'side', 'bounty'].includes(q.type) && gatedTo(q).every((c) => c === cls);
  const a = order(own.filter(mine)), b = order(shared.filter(mine));
  return [...a.map((q, k) => ({ q, t: (k + 0.5) / a.length })), ...b.map((q, k) => ({ q, t: (k + 0.5) / b.length }))].sort((x, y) => x.t - y.t).map((x) => x.q);
}
const sharedQs = [...(await import('../../../src/data/quests/hc-concordia.ts')).default, ...(await import('../../../src/data/quests/hc-heart.ts')).default] as QuestDef[];

/** XP (xp-project's Hero) driving the Player's level */
class Hero {
  xp = 0;
  constructor(readonly pl: Player) {}
  gain(n: number): void {
    const pl = this.pl;
    if (pl.level >= LEVEL_CAP) return;
    this.xp += n;
    while (pl.level < LEVEL_CAP && this.xp >= xpToNext(pl.level)) { this.xp -= xpToNext(pl.level); pl.level = pl.level + 1; }
  }
  kill(id: string, level: number, tier: 'enemy' | 'mini' | 'boss', elite = false): void {
    this.gain(xpForKill(this.pl.level, level, tier) * (elite ? ELITE.xp : 1));
    this.pl.kill(id, level, tier, elite);
  }
}

interface Snap { L: number; ilvl: number; rarity: Record<string, number>; upgrade: number; gold: number; income: number; spent: number; ingots: number; empty: string[] }
interface Run {
  cls: string; seed: number; snaps: Snap[]; end: number; upgrades: Player['t']['upgrades']; drops: Record<Rarity, number>; goldIn: Record<string, number>; goldOut: Record<string, number>;
  maxDry: [number, number]; kills: number; chests: number; reforges: number; lag: [number, number][];
}

function runClass(cls: string, seed: number): Run {
  const own = (globalThis as { __qs?: Record<string, QuestDef[]> }).__qs![cls];
  const pl = new Player(cls, seed), h = new Hero(pl);
  const walk = new Map((walks[cls] ?? []).map((w) => [w.quest, w]));
  const named = new Set(JSON.stringify([...own, ...sharedQs]).match(/inst:[a-z0-9-]+/g) ?? []);
  const side = startAreaOf(cls).waystone.replace(/^ws:/, '');
  for (const n of [1, 2, 3]) named.add(`inst:${side}-lair-${n}`);
  const lairOf = new Map<string, string>();
  for (const i of named) { const d = instanceDef(i); for (const b of [d?.boss, d?.boss2]) if (b && !lairOf.has(b.creature)) lairOf.set(b.creature, i); }
  const bossLevel = (id: string) => { const d = instanceDef(lairOf.get(id) ?? ''); return [d?.boss, d?.boss2].find((b) => b?.creature === id)?.level; };
  const fallback = `bx_${CLASS_SCHOOL[cls]}_0`;
  const clearZone = (z: SpawnZoneDef) => { for (let k = 0; k < z.cap; k++) h.kill(z.pool?.[k % Math.max(1, z.pool.length)] ?? fallback, (z.level[0] + z.level[1]) / 2, 'enemy', !!z.elite && k === 0); };
  const clearLair = (inst: string, bossByObjective: boolean) => {
    for (const z of spawnZones(inst).filter((x) => EXPLORE || !x.id.includes(':side-'))) {
      if (z.waves) for (const wave of z.waves) for (const e of wave) h.kill(e.creature, e.level, e.tier ?? tierOf(e.creature), !!e.elite);
      else clearZone(z);
    }
    const b = instanceDef(inst)?.boss;
    if (b && !bossByObjective) h.kill(b.creature, b.level, tierOf(b.creature));
    // the instance's own generated chests (main path and side rooms)
    const gen = new InstanceGen(instanceDef(inst)!);
    const objs = [...(gen as unknown as { objs: Map<string, WorldObject[]> }).objs.values()].flat().filter((o) => o.kind === 'chest');
    for (const o of objs) pl.chest(o.id, o.props as Record<string, string | number | boolean>);
  };
  const snaps: Snap[] = [];
  const snap = (L: number) => {
    const s = pl.snapshot();
    snaps.push({ L, ilvl: s.ilvl, rarity: s.rarity, upgrade: s.upgrade, gold: pl.t.gold, income: Object.values(pl.t.goldIn).reduce((a, b) => a + b, 0), spent: Object.values(pl.t.goldOut).reduce((a, b) => a + b, 0), ingots: pl.t.ingots, empty: s.empty });
  };
  let next = 0;
  const cleared = new Set<string>();
  for (const act of ['act1', 'act2', 'act3'] as const) for (const q of actQuests(cls, act, own, sharedQs)) {
    const w = walk.get(q.id);
    for (const wz of w?.zones ?? []) {
      const z = typeof wz === 'string' ? zoneById(wz) : { ...(zoneById(wz.id) ?? { id: wz.id, space: '', at: [0, 0], r: 0, pool: [] }), level: wz.level, cap: wz.cap, elite: wz.elite } as SpawnZoneDef;
      if (z) clearZone(z);
    }
    const objKills = (q.stages.flatMap((s) => s.objectives) as { kill?: string; count?: number }[]).filter((o) => o.kill);
    const inst = [...new Set([q.region, ...(w?.lairs ?? []), ...objKills.map((o) => lairOf.get(o.kill as string))]
      .filter((r): r is string => !!r && r.startsWith('inst:') && !!instanceDef(r)))];
    for (const i of inst) if (!cleared.has(i)) { cleared.add(i); clearLair(i, objKills.some((o) => lairOf.get(o.kill as string) === i)); }
    for (const o of objKills) {
      const id = o.kill as string, lv = bossLevel(id) ?? (/^bx_[a-z]+_5$/.test(id) ? 14 : pl.level + 0.5);
      for (let k = 0; k < (o.count ?? 1); k++) h.kill(id, lv, tierOf(id));
    }
    pl.quest(q.reward?.gold, q.reward?.hcItems);
    if (q.reward?.xpTier) h.gain(QUEST_XP_TIER[q.reward.xpTier] * xpToNext(pl.level));
    pl.town();
    while (next < CHECK.length && pl.level >= CHECK[next]) snap(CHECK[next++]);
  }
  snap(pl.level);
  // longest stretch with no real upgrade (levels), from level 1 to the campaign's end
  const lv = [1, ...pl.t.upgrades.map((u) => u.level), pl.level];
  let maxDry: [number, number] = [0, 0];
  for (let i = 1; i < lv.length; i++) if (lv[i] - lv[i - 1] > maxDry[1] - maxDry[0]) maxDry = [lv[i - 1], lv[i]];
  return { cls, seed, snaps, end: pl.level, upgrades: pl.t.upgrades, drops: pl.t.drops, goldIn: pl.t.goldIn, goldOut: pl.t.goldOut, maxDry, kills: pl.t.kills, chests: pl.t.chests, reforges: pl.t.reforges, lag: pl.t.lag };
}

// ───────────── price list at a level (what the gold is for) ─────────────
function prices(L: number, cls: string): Record<string, number> {
  const s = Math.pow(P(L), 0.6);
  const it = { uid: 'x', base: `w_${kitFor(cls).weapons[0]}_iron`, ilvl: L, qty: 1 } as ItemInstance;
  const up = (n: number) => upgradeCost({ ...it, upgrade: n - 1 })?.gold ?? 0;
  const smith = HC_SHOPS.find((x) => x.id === `shop:${CLASS_SCHOOL[cls]}-smith`)!;
  const lines = shopStock(smith, { classId: cls, level: L, school: CLASS_SCHOOL[cls], weapons: kitFor(cls).weapons }, () => false, 1).filter((l) => /^[wa]_/.test(l.item));
  return {
    'smith piece (mean)': Math.round(lines.reduce((a, l) => a + l.price, 0) / Math.max(1, lines.length)),
    'upgrade +1': up(1), 'upgrade +1…+5 (one item)': [1, 2, 3, 4, 5].reduce((a, n) => a + up(n), 0),
    'socket a gem': socketCost({ ...it, sockets: [null] }, 'i_ruby') ?? Math.max(10, Math.round(20 * s)),
    'full health potion stock (5 small)': 5 * 6,
  };
}

// ───────────── run + report ─────────────
const qs: Record<string, QuestDef[]> = {};
for (const cls of CLASSES) qs[cls] = ((await import(`../../../src/data/quests/hc-${cls}.ts`)) as { default: QuestDef[] }).default;
(globalThis as { __qs?: Record<string, QuestDef[]> }).__qs = qs;
const t0 = Date.now();
const runs: Run[] = [];
for (const cls of CLASSES) {
  for (let k = 0; k < SEEDS; k++) runs.push(runClass(cls, 101 + 17 * k));
  const rs = runs.filter((r) => r.cls === cls);
  const at = (L: number, f: (s: Snap) => number) => { const v = rs.map((r) => r.snaps.find((s) => s.L === L)).filter((s): s is Snap => !!s); return v.length ? v.reduce((a, s) => a + f(s), 0) / v.length : NaN; };
  console.log(`${cls.padEnd(12)} end L${(rs.reduce((a, r) => a + r.end, 0) / rs.length).toFixed(1)} · ilvl−L ${CHECK.map((L) => (at(L, (s) => s.ilvl - L)).toFixed(1)).join('/')} · real upgrades ${(rs.reduce((a, r) => a + r.upgrades.length, 0) / rs.length).toFixed(0)} · longest dry ${rs.map((r) => `L${r.maxDry[0]}–${r.maxDry[1]}`).join(', ')} · gold L20 ${at(20, (s) => s.gold).toFixed(0)}`);
}

const md: string[] = ['# Gear curve', '', `Generated by tools/e2e/sim/gear-curve.ts (${SEEDS} seeds per class, ${EXPLORE ? 'explorer' : 'quest route'}; real upgrade = +${REAL_UPGRADE * 100}% or more on √(offence × EHP)). ` +
  'Player model: wears what scores better, sells the rest (salvages runed+ for ingots), each quest ends with a town visit (a smith piece if it is a real upgrade, then Runeforge upgrades of worn gear above a potion reserve). ' +
  'Every chest in each cleared instance is opened; optional realm ruins / caves, Morvane caves and dialogue story items are not counted (upside).', ''];
const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / Math.max(1, xs.length);
md.push('## Summary by class', '', '| class | end L | kills / chests | ilvl − level at ' + CHECK.join(' / ') + ' | real upgrades | per level | reforges | longest dry stretch (each seed) | gold on hand L10 / L20 / L30 | spent | empty slots at end |', '|---|---|---|---|---|---|---|---|---|---|---|');
for (const cls of CLASSES) {
  const rs = runs.filter((r) => r.cls === cls);
  const at = (L: number, f: (s: Snap) => number) => { const v = rs.map((r) => r.snaps.find((s) => s.L === L)).filter((s): s is Snap => !!s); return v.length ? mean(v.map(f)) : NaN; };
  const ups = mean(rs.map((r) => r.upgrades.length)), end = mean(rs.map((r) => r.end));
  const last = rs[0].snaps[rs[0].snaps.length - 1];
  md.push(`| ${cls} | ${end.toFixed(1)} | ${mean(rs.map((r) => r.kills)).toFixed(0)} / ${mean(rs.map((r) => r.chests)).toFixed(0)} | ${CHECK.map((L) => { const v = at(L, (s) => s.ilvl - L); return Number.isNaN(v) ? '—' : v.toFixed(1); }).join(' / ')} | ${ups.toFixed(0)} | ${(ups / Math.max(1, end - 1)).toFixed(2)} | ${mean(rs.map((r) => r.reforges)).toFixed(0)} | ${rs.map((r) => `L${r.maxDry[0]}–${r.maxDry[1]}${r.maxDry[1] - r.maxDry[0] >= DRY ? ' **dry**' : ''}`).join(', ')} | ${[10, 20, 30].map((L) => { const v = at(L, (s) => s.gold); return Number.isNaN(v) ? '—' : v.toFixed(0); }).join(' / ')} | ${mean(rs.map((r) => Object.values(r.goldOut).reduce((a, b) => a + b, 0))).toFixed(0)} | ${last.empty.join(', ') || '—'} |`);
}
// rarity seen
const drops = Object.fromEntries(RARITY_ORDER.map((r) => [r, mean(runs.map((x) => x.drops[r]))])) as Record<Rarity, number>;
const total = Object.values(drops).reduce((a, b) => a + b, 0);
md.push('', '## Rarity of gear drops (mean pieces per campaign)', '', '| ' + RARITY_ORDER.join(' | ') + ' | total |', '|' + '---|'.repeat(RARITY_ORDER.length + 1),
  '| ' + RARITY_ORDER.map((r) => `${drops[r].toFixed(1)} (${((drops[r] / total) * 100).toFixed(1)}%)`).join(' | ') + ` | ${total.toFixed(0)} |`, '');
const worn = (L: number) => { const acc: Record<string, number> = {}; let n = 0; for (const r of runs) { const s = r.snaps.find((x) => x.L === L); if (!s) continue; n++; for (const [k, v] of Object.entries(s.rarity)) acc[k] = (acc[k] ?? 0) + v; } return RARITY_ORDER.map((k) => `${k} ${((acc[k] ?? 0) / Math.max(1, n)).toFixed(1)}`).join(', '); };
md.push('Worn rarity mix (mean pieces of 9 slots):', '', ...CHECK.map((L) => `- L${L}: ${worn(L)}`), '');
// how far drops sit under the hero
md.push('Drop item level under the hero (mean hero level − drop ilvl) at hero levels 1–10 / 11–20 / 21–30 / 31–40: ' +
  [0, 1, 2, 3].map((b) => { const s = runs.reduce((a, r) => a + (r.lag[b]?.[0] ?? 0), 0), n = runs.reduce((a, r) => a + (r.lag[b]?.[1] ?? 0), 0); return n ? (s / n).toFixed(1) : '—'; }).join(' / '), '');
// where upgrades come from
const src: Record<string, number> = {};
for (const r of runs) for (const u of r.upgrades) src[u.src] = (src[u.src] ?? 0) + 1;
md.push('## Where real upgrades come from (all classes)', '', ...Object.entries(src).sort((a, b) => b[1] - a[1]).map(([k, v]) => `- ${k}: ${v} (${((v / runs.reduce((a, r) => a + r.upgrades.length, 0)) * 100).toFixed(0)}%)`), '');
const perLevel = Array.from({ length: LEVEL_CAP }, (_, L) => mean(runs.map((r) => r.upgrades.filter((u) => u.level === L + 1).length)));
md.push('Real upgrades per level (mean per class):', '', '`' + perLevel.map((v, i) => `${i + 1}:${v.toFixed(1)}`).join(' ') + '`', '');
// gold
const gi: Record<string, number> = {}, go: Record<string, number> = {};
for (const r of runs) { for (const [k, v] of Object.entries(r.goldIn)) gi[k] = (gi[k] ?? 0) + v / runs.length; for (const [k, v] of Object.entries(r.goldOut)) go[k] = (go[k] ?? 0) + v / runs.length; }
md.push('## Gold (mean per campaign)', '', 'Income: ' + Object.entries(gi).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${v.toFixed(0)}`).join(' · '), '',
  'Spent: ' + (Object.entries(go).map(([k, v]) => `${k} ${v.toFixed(0)}`).join(' · ') || 'nothing'), '');
md.push('Gold on hand vs prices (first class listed for prices):', '', '| level | gold on hand (mean) | income so far | spent so far | ingots | ' + Object.keys(prices(10, CLASSES[0])).join(' | ') + ' |', '|' + '---|'.repeat(5 + Object.keys(prices(10, CLASSES[0])).length));
for (const L of CHECK) {
  const v = runs.map((r) => r.snaps.find((s) => s.L === L)).filter((s): s is Snap => !!s);
  if (!v.length) continue;
  md.push(`| ${L} | ${mean(v.map((s) => s.gold)).toFixed(0)} | ${mean(v.map((s) => s.income)).toFixed(0)} | ${mean(v.map((s) => s.spent)).toFixed(0)} | ${mean(v.map((s) => s.ingots)).toFixed(1)} | ${Object.values(prices(L, CLASSES[0])).join(' | ')} |`);
}
// ───────────── flags ─────────────
const flags: string[] = [];
const dry = runs.filter((r) => r.maxDry[1] - r.maxDry[0] >= DRY);
if (dry.length) {
  const mid = dry.filter((r) => r.maxDry[0] >= 12 && r.maxDry[1] <= 32).length;
  flags.push(`**Dry stretches** (no real upgrade for ${DRY}+ levels): ${dry.length} of ${runs.length} runs, ${mid} of them inside L12–32; classes: ${[...new Set(dry.map((r) => r.cls))].length} of ${CLASSES.length}.`);
}
const rare = RARITY_ORDER.filter((r) => drops[r] < 1);
flags.push(rare.length ? `**Rarity tiers a player barely sees** (< 1 drop per campaign): ${rare.join(', ')}.` : 'Every rarity tier drops at least once per campaign on average.');
for (const L of CHECK) {
  const v = runs.map((r) => r.snaps.find((s) => s.L === L)).filter((s): s is Snap => !!s);
  if (!v.length) continue;
  const g = mean(v.map((s) => s.gold)), pr = prices(L, CLASSES[0]);
  if (g > 10 * pr['smith piece (mean)']) flags.push(`**Idle gold at L${L}**: ${g.toFixed(0)} on hand = ${(g / pr['smith piece (mean)']).toFixed(0)}× a smith piece.`);
  if (g < pr['upgrade +1']) flags.push(`**Short gold at L${L}**: ${g.toFixed(0)} on hand < one +1 upgrade (${pr['upgrade +1']}).`);
}
const emptyTrinket = runs.filter((r) => r.snaps[r.snaps.length - 1].empty.some((k) => /^(ring|amulet)/.test(k))).length;
flags.push(`**Trinket slots**: ${emptyTrinket} of ${runs.length} runs end with an empty ring or amulet slot. Gear drops roll weapons and armour only (sim/loot.ts rollBase), so rings and amulets come from Pell's stall (no rarity or affixes), uniques and story items.`);
const spentAll = mean(runs.map((r) => Object.values(r.goldOut).reduce((a, b) => a + b, 0))), rf = mean(runs.map((r) => (r.goldOut['runeforge upgrades'] ?? 0) + (r.goldOut['runeforge reforges'] ?? 0)));
if (spentAll) flags.push(`**Gold sink**: the Runeforge takes ${((rf / spentAll) * 100).toFixed(0)}% of all gold spent (${rf.toFixed(0)} of ${spentAll.toFixed(0)}).`);
md.splice(3, 0, '## Flags', '', ...flags.map((f) => `- ${f}`), '');

mkdirSync('tools/e2e/out', { recursive: true });
const OUT = process.env.RF === '0' ? 'tools/e2e/out/gear-curve-noforge.md' : 'tools/e2e/out/gear-curve.md';
writeFileSync(OUT, md.join('\n'));
console.log(`report ${OUT} · run time ${((Date.now() - t0) / 1000).toFixed(1)} s`);
