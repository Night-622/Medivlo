/**
 * Build simulator (Claude 3 helper): report lines. Informational lines start with "# " or "note " (never "FAIL");
 * gate lines with "ok  " / "FAIL" (predeploy-check.mjs convention).
 */
import type { FightResult } from './builds-fight';
import { DEAD_PCT, type ClassDead, type Item } from './builds-dead';
import { BOSS_SLOT, dps, ehp, LEVELS, score, wins, type Level, type Row } from './builds-run';

const pad = (s: string | number, n: number): string => String(s).padEnd(n);
const lpad = (s: string | number, n: number): string => String(s).padStart(n);
const r0 = (x: number): number => Math.round(x);
const pc = (x: number): string => `${x >= 0 ? '+' : '−'}${Math.abs(x * 100).toFixed(1)}%`;
const ttk = (f: FightResult): string => (f.won ? `${f.secs}s` : f.secs >= 600 ? 'T/O' : `✗${f.secs}s`);

export const HEADER = '#   class        lvl build          DPS pack/lair/boss    EHP   TTK pack/lair/boss    wins deaths pots  points           gear';

export function rowLine(r: Row, tag = r.b.label): string {
  const mean = (r.pack.secs ? [r.pack, r.lair, r.boss] : [r.boss]).map(ehp);
  const e = mean.reduce((a, b) => a + b, 0) / mean.length;
  const d = `${r0(dps(r.pack))}/${r0(dps(r.lair))}/${r0(dps(r.boss))}`;
  const t = `${ttk(r.pack)}/${r.lair.won ? `${r.lair.secs}s` : `${r.lair.cleared}of${r.lair.waves}`}/${ttk(r.boss)}`;
  return `#   ${pad(r.b.cls, 12)} L${pad(r.b.level, 3)}${pad(tag, 14)} ${pad(d, 21)} ${lpad(r0(e), 5)}   ${pad(t, 21)} ${wins(r)}/3  ${lpad(r.lair.deaths, 3)}  ${lpad(r.pack.potions + r.lair.potions + r.boss.potions, 4)}  ${pad(r.b.points, 16)} ${r.b.gear}`;
}

/** Per class and level: starter, typical, then best / worst of all builds (full mode). */
export function classTable(rows: Row[], full: boolean): string[] {
  const out = [HEADER];
  const classes = [...new Set(rows.map((r) => r.b.cls))];
  for (const c of classes) for (const L of LEVELS) {
    const rs = rows.filter((r) => r.b.cls === c && r.b.level === L);
    if (!rs.length) continue;
    const st = rs.find((r) => r.b.kind === 'starter'), ty = rs.find((r) => r.b.kind === 'typical');
    if (st) out.push(rowLine(st));
    if (ty) out.push(rowLine(ty));
    if (full) {
      const sorted = [...rs].sort((a, b) => score(b) - score(a));
      out.push(rowLine(sorted[0], `best:${sorted[0].b.label}`.slice(0, 13)));
      out.push(rowLine(sorted[sorted.length - 1], `worst:${sorted[sorted.length - 1].b.label}`.slice(0, 13)));
    }
  }
  return out;
}

const median = (xs: number[]): number => { const s = [...xs].sort((a, b) => a - b); const m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };

/** Typical builds > 1.6× or < 0.6× the class median on DPS or TTK, and every build that loses its boss. */
export function outliers(rows: Row[]): string[] {
  const out: string[] = [];
  for (const L of LEVELS) {
    const ty = rows.filter((r) => r.b.kind === 'typical' && r.b.level === L);
    if (ty.length < 3) continue;
    const metrics: [string, (r: Row) => number, boolean][] = [
      ['boss DPS', (r) => dps(r.boss), true], ['lair DPS', (r) => dps(r.lair), !!ty[0].lair.secs],
      ['boss TTK', (r) => r.boss.secs, true], ['lair TTK', (r) => r.lair.secs, !!ty[0].lair.secs],
    ]; // pack TTK is left out: 3–30 s fights in whole seconds are too coarse for a ratio
    for (const [name, f, on] of metrics) {
      if (!on) continue;
      const med = median(ty.map(f));
      out.push(`# L${L} median typical ${name}: ${r0(med)}`);
      for (const r of ty) {
        const k = med ? f(r) / med : 1;
        if (k > 1.6 || k < 0.6) out.push(`note outlier L${L} ${pad(r.b.cls, 12)} typical ${name} ${r0(f(r))} = ${k.toFixed(2)}× median${name === 'boss TTK' && !r.boss.won ? ' (lost)' : ''}`);
      }
    }
  }
  for (const r of rows) if (!r.boss.won) out.push(`note loses boss: ${r.b.cls} L${r.b.level} ${r.b.label} vs ${BOSS_SLOT[r.b.level as Level].label} ${r.bossName}: ${r.boss.crash ? 'CRASH' : r.boss.secs >= 600 ? 'timeout 600s' : `died at ${r.boss.secs}s`}, boss DPS ${r0(dps(r.boss))} (${r.b.points}; ${r.b.gear})`);
  return out;
}

/** live items that cost more than this much DPS or survival are listed as harmful */
const DEAD_NEG = 0.05;

const itemLine = (tag: string, i: Item): string =>
  `note ${pad(tag, 5)} ${pad(i.cls, 12)} ${pad(i.id, 14)} ${pad(i.name.slice(0, 44), 44)} ${pad(`${i.mode} ${i.points}pt`, 10)} dps ${lpad(pc(i.dDps), 7)}  surv ${lpad(pc(i.dSurv), 7)}  ehp ${lpad(pc(i.dEhp), 7)}${i.util.length ? `  util: ${i.util.join(',')}` : ''}`;

export function deadLines(d: ClassDead): string[] {
  const out = [`# dead content: ${d.cls} L${d.level} typical (probe creature dmg ×${d.dmgMult.toFixed(2)}; base dps ${r0(d.base.dps)}, survives ${r0(d.base.surv)}s, ehp ${r0(d.base.ehp)}; seed noise dps ${pc(d.noise.dDps)} surv ${pc(d.noise.dSurv)}; surv = share of incoming damage cancelled)`];
  for (const i of d.items.filter((x) => x.verdict === 'dead')) out.push(itemLine('dead', i));
  for (const i of d.items.filter((x) => x.verdict === 'utility')) out.push(itemLine('util', i));
  const live = d.items.filter((x) => x.verdict === 'live').sort((a, b) => Math.max(Math.abs(b.dDps), Math.abs(b.dSurv)) - Math.max(Math.abs(a.dDps), Math.abs(a.dSurv)));
  out.push(`# ${d.cls}: ${d.items.filter((x) => x.verdict === 'dead').length} dead, ${d.items.filter((x) => x.verdict === 'utility').length} utility-only, ${live.length} live of ${d.items.length}; strongest: ${live.slice(0, 4).map((i) => `${i.id} ${pc(i.dDps)}dps/${pc(i.dSurv)}surv`).join(', ')}`);
  // harmful: costs over 5% of DPS or survival without paying 2% back in the other (or in EHP)
  const harm = (x: Item): boolean => (x.dDps < -DEAD_NEG && x.dSurv < DEAD_PCT && x.dEhp < DEAD_PCT) || (x.dSurv < -DEAD_NEG && x.dDps < DEAD_PCT);
  for (const i of live.filter(harm)) out.push(itemLine('harm', i));
  return out;
}

/** Across classes: how often each node / spell position is dead. */
export function deadSummary(ds: ClassDead[]): string[] {
  const by = new Map<string, { name: string; dead: string[]; live: string[]; util: number; n: number; dps: number[]; surv: number[] }>();
  for (const d of ds) for (const i of d.items) {
    const key = i.id; // node ids are positions: the same id is the same slot of every class's tree
    const e = by.get(key) ?? { name: i.pos, dead: [], live: [], util: 0, n: 0, dps: [], surv: [] };
    e.n++; if (i.verdict === 'dead') e.dead.push(i.cls); else if (i.verdict === 'utility') e.util++; else e.live.push(i.cls);
    e.dps.push(i.dDps); e.surv.push(i.dSurv);
    by.set(key, e);
  }
  const out = ['# dead-content summary by node position (dead / utility-only in N of M classes; median Δdps / Δsurvival; the minority listed)'];
  for (const [id, e] of [...by.entries()].sort((a, b) => b[1].dead.length - a[1].dead.length || a[0].localeCompare(b[0]))) {
    if (!e.dead.length && !e.util) continue;
    const who = !e.dead.length ? '' : e.dead.length * 2 <= e.n ? `  dead for: ${e.dead.join(',')}` : e.live.length ? `  live for: ${e.live.join(',')}` : '';
    out.push(`note ${pad(id, 14)} ${pad(e.name.slice(0, 40), 40)} dead ${lpad(e.dead.length, 2)}/${e.n}  util ${lpad(e.util, 2)}/${e.n}  median dps ${lpad(pc(median(e.dps)), 7)} surv ${lpad(pc(median(e.surv)), 7)}${who}`);
  }
  return out;
}
