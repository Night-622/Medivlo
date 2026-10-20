/**
 * Respec and Runeforge economy (Claude 5 for Claude 1, 2026-10-21): can a player who changes their mind afford it?
 * Prices of changing a build at L20 / 30 / 40 (the real rules: curves.ts resetCost, runeforge.ts upgrade / reroll /
 * imbue / transfer / reforge costs), against the gear-curve typical player's gold on hand, income per level and worn
 * upgrade levels (gear-curve-walk.ts, 24 classes, with and without Runeforge spending). Report only.
 *   node tools/e2e/sim/run.mjs respec-econ      → tools/e2e/out/respec-econ.md
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { CLASS_SCHOOL } from '@/core/constants';
import { HC_PIECES } from '@/data/items/hc/armour.gen';
import { resetCost } from '@/systems/rules/curves';
import { imbueCost, reforgeCost, rerollCost, transferCost, transferMoves, upgradeCost } from '@/systems/rules/runeforge';
import { HC_TOMES } from '@/data/items/hc/build-items';
import { newCharacter } from '@/systems/rules/character';
import { readTome } from '@/systems/sim/runes';
import { Sim } from '@/systems/sim/Sim';
import type { SimPorts } from '@/systems/sim/world';
import type { ItemInstance } from '@/systems/rules/types';
import { questsOf, runClass } from './gear-curve-walk';

const LV = [20, 30, 40] as const;
const t0 = Date.now();
const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / Math.max(1, xs.length);

// ───────────── the typical player's purse (both spending styles) ─────────────
interface Purse { gold: number; incomePerLevel: number; upgrade: number }
const purse: Record<'forge' | 'noforge', Record<number, Purse[]>> = { forge: {}, noforge: {} };
for (const mode of ['forge', 'noforge'] as const) {
  if (mode === 'noforge') process.env.RF = '0'; else delete process.env.RF;
  for (const cls of Object.keys(CLASS_SCHOOL)) {
    const own = await questsOf(cls), at = new Map<number, { gold: number; income: number; upgrade: number }>();
    runClass(cls, 101, own, [10, ...LV], (L, pl) => {
      at.set(L, { gold: pl.t.gold, income: Object.values(pl.t.goldIn).reduce((a, b) => a + b, 0), upgrade: pl.snapshot().upgrade });
    });
    for (const L of LV) {
      const now = at.get(L), before = at.get(L === 20 ? 10 : L - 10);
      if (!now || !before) continue;
      (purse[mode][L] ??= []).push({ gold: now.gold, incomePerLevel: (now.income - before.income) / 10, upgrade: now.upgrade });
    }
  }
}
delete process.env.RF;

// ───────────── prices of changing your mind ─────────────
const piece = (L: number, rarity: string, upgrade = 0): ItemInstance =>
  ({ uid: 'p', base: HC_PIECES.find((p) => p.slot === 'chest')!.id, ilvl: L, qty: 1, rarity, affixes: [{ id: 'suf_of_the_bear', v: 1 }], upgrade } as ItemInstance);
const weapon = (L: number): ItemInstance => ({ uid: 'w', base: 'w_sword_iron', ilvl: L, qty: 1, rarity: 'runed', affixes: [{ id: 'pre_keen', v: 0.03 }] } as ItemInstance);
const upTo = (L: number, n: number) => { let g = 0, ing = 0; for (let k = 0; k < n; k++) { const c = upgradeCost(piece(L, 'runed', k)); if (c) { g += c.gold; ing += c.ingots; } } return { g, ing }; };
interface Row { what: string; cost: Record<number, number>; note: string }
const rows: Row[] = [];
const by = (f: (L: number) => number) => Object.fromEntries(LV.map((L) => [L, Math.round(f(L))])) as Record<number, number>;
rows.push({ what: 'Respec one branch (e.g. swap a keystone)', cost: by((L) => resetCost(L)), note: '10 × level per branch' });
rows.push({ what: 'Full respec (all three branches)', cost: by((L) => 3 * resetCost(L)), note: 'the first one after the rebuild is free' });
rows.push({ what: 'Reroll one affix on a wrought piece', cost: by((L) => rerollCost(piece(L, 'wrought')) ?? 0), note: 'same price every time (no escalation)' });
rows.push({ what: 'Chase one affix (4 rerolls, wrought)', cost: by((L) => 4 * (rerollCost(piece(L, 'wrought')) ?? 0)), note: '' });
rows.push({ what: 'Re-imbue the weapon to a new school', cost: by((L) => imbueCost(weapon(L)) ?? 0), note: '+ one Essence of that school' });
rows.push({ what: 'Move a unique effect to a new piece', cost: by((L) => transferCost({ ...weapon(L), uid: 'src', uniqueFx: 'lg_ash_5' } as ItemInstance, weapon(L)) ?? 0), note: 'the source item is destroyed' });
rows.push({ what: 'Reforge an old favourite 10 levels up', cost: by((L) => reforgeCost(piece(L - 10, 'runed'), L)?.gold ?? 0), note: '+ ingots' });
for (const n of [3, 5]) rows.push({ what: `Bring one new piece to +${n}`, cost: by((L) => upTo(L, n).g), note: `+ ${n * (n + 1) / 2} ingots (upgrades stay on the old item)` });
rows.push({ what: 'New armour set (4 pieces) to +3', cost: by((L) => 4 * upTo(L, 3).g), note: 'switching to another set or hybrid, if your old set was at +3' });
// the Transfer tab moves the higher +n onto the new piece (rules/runeforge.ts transferMoves, Claude 3)
const upMoves = !!transferMoves(piece(20, 'runed', 3), { ...piece(20, 'runed', 0), uid: 'q' })?.upgrade;
if (upMoves) {
  rows.push({ what: 'Move +3 onto one new piece (Transfer)', cost: by((L) => transferCost(piece(L, 'runed', 3), { ...piece(L, 'runed', 0), uid: 'q' }) ?? 0), note: 'the old piece is used up' });
  rows.push({ what: 'Move +3 onto a new armour set (4 Transfers)', cost: by((L) => 4 * (transferCost(piece(L, 'runed', 3), { ...piece(L, 'runed', 0), uid: 'q' }) ?? 0)), note: 'instead of re-upgrading' });
}
// a tome read over another: does the replaced spell's tome come back? (a real read in a headless sim)
function tomeComesBack(): boolean {
  const ports: SimPorts = { move: (_s, x, y, dx, dy) => ({ x: x + dx, y: y + dy }), clear: () => true, zoneRule: () => 'safe', respawnPoint: () => ({ space: 't', x: 0, y: 0 }), emit: () => {}, partySize: () => 1, realmRule: () => 'peaceful' };
  const sim = new Sim(ports, 1), s = newCharacter('warden');
  const [a, b] = HC_TOMES.filter((x) => x.school !== 'rime');
  s.tomeSpell = a.spell;
  s.inventory.push({ uid: 'tb', base: b.item, ilvl: 1, qty: 1 });
  const p = sim.addPlayer('me', s, { space: 't', x: 0, y: 0 });
  readTome(sim.w, p, 'tb');
  return p.save.tomeSpell === b.spell && p.save.inventory.some((x) => x.base === a.item);
}
const tomeBack = tomeComesBack();

// ───────────── report ─────────────
const p = (mode: 'forge' | 'noforge', L: number) => ({ gold: mean(purse[mode][L].map((x) => x.gold)), inc: mean(purse[mode][L].map((x) => x.incomePerLevel)), up: mean(purse[mode][L].map((x) => x.upgrade)) });
const md: string[] = ['# Respec and Runeforge economy', '', 'Generated by tools/e2e/sim/respec-econ.ts. Prices are the game’s own formulas. "Levels of income" = price ÷ the typical player’s gold earned per level at that point (gear-curve walk, mean of 24 classes). Gold on hand: a Runeforge user spends nearly everything as it comes; a player who never uses the forge keeps it.', ''];
md.push('## The typical player’s purse', '', '| level | income per level | gold on hand (Runeforge user) | gold on hand (no Runeforge) | worn upgrade level (Runeforge user) |', '|---|---|---|---|---|');
for (const L of LV) md.push(`| ${L} | ${p('forge', L).inc.toFixed(0)} | ${p('forge', L).gold.toFixed(0)} | ${p('noforge', L).gold.toFixed(0)} | +${p('forge', L).up.toFixed(1)} |`);
md.push('', '## What changing your mind costs', '', '| change | ' + LV.map((L) => `L${L}`).join(' | ') + ' | levels of income (L20 / 30 / 40) | note |', '|---|' + LV.map(() => '---|').join('') + '---|---|');
for (const r of rows) md.push(`| ${r.what} | ${LV.map((L) => r.cost[L].toLocaleString('en')).join(' | ')} | ${LV.map((L) => (r.cost[L] / p('forge', L).inc).toFixed(2)).join(' / ')} | ${r.note} |`);
// ───────────── what could make a player afraid to try a new build ─────────────
const flags: string[] = [];
for (const r of rows) {
  const lv = r.cost[40] / p('forge', 40).inc;
  // re-upgrading is optional once Transfer moves +n: flag it only when it can't
  if (upMoves && /^(Bring one new piece|New armour set \(4 pieces\) to)/.test(r.what)) continue;
  if (lv > 2) flags.push(`**${r.what}**: ${r.cost[40].toLocaleString('en')} gold at L40 = ${lv.toFixed(1)} levels of income.`);
}
const fr = 3 * resetCost(20);
if (p('forge', 20).gold < fr) flags.push(`**A Runeforge user is cash-poor**: about ${p('forge', 20).gold.toFixed(0)} gold on hand at L20, under one full respec (${fr}). They must stop upgrading for most of a level to try a new tree.`);
if (!upMoves) flags.push('**Upgrades never move**: Transfer moves only a unique effect, and salvage returns ingots and dust but no gold. A player who switches armour set throws away every +n on the old pieces. This is the biggest cost of changing build.');
md.push(`Checked live: Transfer moves a piece’s +n — ${upMoves ? 'yes' : '**no**'}; reading a new tome gives the old one back — ${tomeBack ? 'yes' : '**no**'}.`, '');
if (!tomeBack) flags.push('**Tomes are one-way**: reading a new tome consumes it and forgets the old spell for good (sim/runes.ts readTome). Tomes are rare finds and no shop sells them, so trying another school’s spell risks losing yours. (Runes are safe: unslotting returns them, and a forgotten spell’s runes come back.)');
md.splice(4, 0, '## What could make a player afraid to try a new build', '', ...flags.map((f) => `- ${f}`), '');
mkdirSync('tools/e2e/out', { recursive: true });
writeFileSync('tools/e2e/out/respec-econ.md', md.join('\n'));
console.log(md.slice(4).join('\n'));
console.log(`report tools/e2e/out/respec-econ.md · run time ${((Date.now() - t0) / 1000).toFixed(1)} s`);
