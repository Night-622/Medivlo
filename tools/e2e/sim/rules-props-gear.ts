/**
 * rules-props: gear, Runeforge and paperdoll invariants across all content (Claude 5). Every base resolves with slots
 * that fit it; weapon damage and item stats never fall as item level rises; set bonuses switch on at 2 and 4 pieces
 * (+ Attuned for the set's own school) for all 96 sets; every legendary does something; sockets follow rarity; the
 * smith's prices and yields obey their rules; the paperdoll's 1-based indices follow MV.GEAR's order (read from the
 * gear.js source) and the replicated look key changes whenever a drawn field does.
 */
import { readFileSync } from 'node:fs';
import { HC_PIECES, HC_SETS, HC_STYLES } from '@/data/items/hc/armour.gen';
import { HC_CAMPAIGN_ITEMS } from '@/data/items/hc/campaign-items';
import { HC_ITEMS } from '@/data/items/hc/items.gen';
import { HC_LEGENDARIES } from '@/data/items/hc/legendary.gen';
import { HC_MATERIALS, HC_WEAPONS } from '@/data/items/hc/weapons.gen';
import { HC_BESTIARY } from '@/data/enemies/hc/bestiary.gen';
import { newCharacter } from '@/systems/rules/character';
import {
  AMULET_IDS, GEMS, OFFHAND_OK, RING_IDS, SCHOOL_EFFECT, TWO_HANDED, canSocket, itemInfo, itemMods, legendaryPassive, rarityIndex, setBonuses, slotsFor, weaponDamage,
} from '@/systems/rules/gear';
import { lookKey, paperdoll, type PaperdollGear } from '@/systems/rules/paperdoll';
import { INGOT, reforgeCost, salvageYield, socketCost } from '@/systems/rules/runeforge';
import type { ItemInstance, Modifier, SchoolId } from '@/systems/rules/types';
import { check } from './features-harness';

const inst = (base: string, ilvl = 10, gem?: string): ItemInstance => ({ uid: `t-${base}-${ilvl}`, base, ilvl, qty: 1, ...(gem ? { gem } : {}) });
const sum = (ms: Modifier[]): Record<string, number> => ms.reduce((t, m) => ({ ...t, [m.stat]: (t[m.stat] ?? 0) + m.value }), {} as Record<string, number>);
const LEVELS = [1, 5, 10, 15, 20, 25, 30, 35, 40];

function gearProps(): void {
  // every base resolves, with slots that fit it
  const bad: string[] = [];
  for (const w of HC_WEAPONS) {
    const i = itemInfo(w.id), s = i ? slotsFor(i) : [];
    if (!i || i.kind !== 'weapon' || !s.includes('main') || s.includes('off') !== OFFHAND_OK.includes(w.type) || (TWO_HANDED.includes(w.type) && s.includes('off'))) bad.push(w.id);
  }
  for (const p of HC_PIECES) { const i = itemInfo(p.id); if (!i || i.kind !== 'armour' || slotsFor(i).join() !== p.slot) bad.push(p.id); }
  for (const l of HC_LEGENDARIES) {
    const i = itemInfo(l.id), s = i ? slotsFor(i) : [];
    if (!i || i.kind !== 'legendary' || i.rarity !== 'spark' || (l.slot === 'main' ? !s.includes('main') : l.slot === 'ring' ? s.join() !== 'ring1,ring2' : s.join() !== 'amulet')) bad.push(l.id);
  }
  for (const it of HC_ITEMS) {
    const i = itemInfo(it.id);
    const want = RING_IDS.includes(it.id) ? 'ring1,ring2' : AMULET_IDS.includes(it.id) ? 'amulet' : '';
    if (!i || (i ? slotsFor(i).join() : '') !== want) bad.push(it.id);
  }
  for (const ci of HC_CAMPAIGN_ITEMS) {
    const i = itemInfo(ci.id);
    if (!i || i.name !== ci.name || (ci.kind === 'relic' ? !i.questItem || slotsFor(i).length > 0 : !slotsFor(i).length)) bad.push(ci.id);
  }
  const total = HC_WEAPONS.length + HC_PIECES.length + HC_LEGENDARIES.length + HC_ITEMS.length + HC_CAMPAIGN_ITEMS.length;
  check(!bad.length, `items: all ${total} bases resolve (weapons, armour, legendaries, items, story items) with slots that fit them`, bad.slice(0, 6).join(', '));

  // weapon damage: min ≤ max, never falls with item level, and a better material never hits softer at the same level
  const wBad = HC_WEAPONS.filter((w) => LEVELS.some((L, i) => {
    const [lo, hi] = weaponDamage(w.id, L), prev = i ? weaponDamage(w.id, LEVELS[i - 1]) : [0, 0];
    return lo > hi || lo < prev[0] || hi < prev[1];
  })).map((w) => w.id);
  check(!wBad.length, `weapons: damage min ≤ max and never falls as item level rises (${HC_WEAPONS.length} weapons, L1–40)`, wBad.slice(0, 6).join(', '));
  const matOrder = HC_MATERIALS.map((m) => m.id);
  const mBad = [...new Set(HC_WEAPONS.map((w) => w.type))].filter((t) => {
    const avg = matOrder.map((m) => HC_WEAPONS.find((w) => w.type === t && w.material === m)).filter(Boolean).map((w) => { const [a, b] = weaponDamage(w!.id, 20); return (a + b) / 2; });
    return avg.some((v, i) => i > 0 && v < avg[i - 1]);
  });
  check(!mBad.length, 'weapons: at the same item level a better material never hits softer (every type, wood → sparkforged)', mBad.join(', '));

  // item stats never fall as item level rises (armour pieces, trinkets, legendary trinkets, gems)
  const sBad: string[] = [];
  const bases = [...HC_PIECES.map((p) => p.id), ...RING_IDS, ...AMULET_IDS, ...HC_LEGENDARIES.filter((l) => l.slot !== 'main').map((l) => l.id)];
  for (const b of bases) for (let i = 1; i < LEVELS.length; i++) {
    const a = sum(itemMods(inst(b, LEVELS[i - 1]))), z = sum(itemMods(inst(b, LEVELS[i])));
    if (Object.keys(a).some((k) => (z[k] ?? 0) < a[k] - 1e-9)) { sBad.push(`${b}@${LEVELS[i]}`); break; }
  }
  const gemBad = Object.keys(GEMS).filter((g) => !HC_ITEMS.some((x) => x.id === g) || !GEMS[g].mods(20).length);
  check(!sBad.length, `item stats never fall as item level rises (${bases.length} armour pieces and trinkets)`, sBad.slice(0, 6).join(', '));
  check(!gemBad.length, `gems: all ${Object.keys(GEMS).length} are real items and give a stat`, gemBad.join(', '));

  // set bonuses: 2 pieces → style bonus; 4 → the school's proc (+ Attuned when the wearer's school matches)
  const setBad: string[] = [];
  for (const set of HC_SETS) {
    const pieces = HC_PIECES.filter((p) => p.set === set.id).map((p) => inst(p.id, 20));
    const other = (set.school === 'iron' ? 'ash' : 'iron') as SchoolId;
    const counts = [1, 2, 3, 4].map((n) => setBonuses(pieces.slice(0, n), other).length);
    const own = setBonuses(pieces, set.school as SchoolId);
    const proc = setBonuses(pieces, other).find((p) => p.procs)?.procs?.[0];
    if (pieces.length !== 4 || counts.join() !== '0,1,1,2' || own.length !== 3 || !proc || JSON.stringify(proc.do) !== JSON.stringify(SCHOOL_EFFECT[set.school as SchoolId])) setBad.push(`${set.id} ${counts.join('/')}`);
  }
  check(!setBad.length && HC_SETS.length === 96, `sets: all ${HC_SETS.length} switch on at 2 and 4 pieces, the 4-piece proc is the school's effect, and only the set's school is Attuned`, setBad.slice(0, 4).join('; '));
  const styleBad = HC_STYLES.filter((st) => HC_SETS.filter((s) => s.style === st).length !== 12);
  check(!styleBad.length, 'sets: every style comes in all 12 schools', styleBad.join(', '));

  // legendaries: every one does something, and its boss exists
  const lBad = HC_LEGENDARIES.filter((l) => { const p = legendaryPassive(l.id); return !HC_BESTIARY.some((b) => b.id === l.boss) || !(p.mods?.length || p.procs?.length || p.hooks?.length); }).map((l) => l.id);
  check(!lBad.length && HC_LEGENDARIES.length === 25, `legendaries: all ${HC_LEGENDARIES.length} have an effect and a real boss`, lBad.join(', '));

  // sockets follow rarity: runed and better gear only, never consumables
  const sockBad = [...HC_WEAPONS, ...HC_PIECES].filter((x) => { const i = itemInfo(x.id)!; return canSocket(i) !== rarityIndex(i.rarity) >= 3; }).map((x) => x.id);
  const consumable = HC_ITEMS.filter((x) => !RING_IDS.includes(x.id) && !AMULET_IDS.includes(x.id)).filter((x) => canSocket(itemInfo(x.id)!)).map((x) => x.id);
  check(!sockBad.length && !consumable.length, 'sockets: weapons and armour take a gem exactly when runed or better; consumables never', [...sockBad, ...consumable].slice(0, 6).join(', '));
}

function runeforgeProps(): void {
  const sword = HC_WEAPONS[0].id, piece = HC_PIECES[0].id, leg = HC_LEGENDARIES[0].id;
  const relic = HC_CAMPAIGN_ITEMS.find((c) => c.kind === 'relic')?.id, potion = HC_ITEMS.find((x) => x.cat === 'potion')!.id;
  const runed = HC_WEAPONS.find((w) => rarityIndex(w.rarity) >= 3)!.id, gem = Object.keys(GEMS)[0];

  const c5 = reforgeCost(inst(sword, 5), 10), c9 = reforgeCost(inst(sword, 5), 20);
  check(!!c5 && !!c9 && c5.to === 10 && c5.gold > 0 && c5.ingots >= 1 && c9.gold > c5.gold && c9.ingots >= c5.ingots, `reforge: a wider level gap costs more (5→10: ${c5?.gold}g ${c5?.ingots}× ${INGOT}; 5→20: ${c9?.gold}g ${c9?.ingots}×)`);
  check(reforgeCost(inst(sword, 10), 10) === null && reforgeCost(inst(sword, 12), 10) === null && reforgeCost(inst(potion, 1), 10) === null && (!relic || reforgeCost(inst(relic, 1), 10) === null),
    'reforge: refused at or above the target level, and for consumables and quest relics');
  const lc = reforgeCost(inst(leg, 5), 13), pc = reforgeCost(inst(piece, 5), 13);
  check(!!lc && !!pc && lc.ingots === 2 * pc.ingots, `reforge: a legendary takes twice the ingots (${lc?.ingots} vs ${pc?.ingots})`);

  const sc = socketCost(inst(runed, 10), gem);
  check(!!sc && sc > 0 && socketCost(inst(sword, 10), gem) === null && socketCost(inst(runed, 10), potion) === null && (socketCost(inst(runed, 30), gem) ?? 0) >= sc,
    'socket: priced only for a runed+ piece and a real gem, never cheaper at a higher level');

  const y = salvageYield(inst(runed, 24, gem));
  check(!!y && y.ingots >= 1 && y.gem === gem, `salvage: gear breaks into ingots (${y?.ingots}) and its gem comes back`);
  const story = HC_CAMPAIGN_ITEMS.find((c) => c.kind !== 'relic')?.id;
  check(salvageYield(inst(leg, 20)) === null && salvageYield(inst(potion, 1)) === null && (!relic || salvageYield(inst(relic, 1)) === null) && (!story || salvageYield(inst(story, 20)) === null),
    'salvage: never legendaries, story gifts, quest relics or consumables');
}

function paperdollProps(): void {
  // gear.js builds SETS as schools × styles and WEAPONS as types × materials; the 1-based indices rely on the same order
  const src = readFileSync('public/art/mv/gear.js', 'utf8');
  const list = (name: string): string[] => JSON.parse((src.match(new RegExp(`${name}=(\\[[^\\]]*\\])`))?.[1] ?? '[]').replace(/'/g, '"'));
  const SCH = list('SCH'), STY = list('STY'), WT = list('WT');
  const matSrc = src.slice(src.indexOf('MAT=['), src.indexOf('];', src.indexOf('MAT=[')));
  const MAT = [...matSrc.matchAll(/id:'([a-z]+)'/g)].map((m) => m[1]);
  const sets = SCH.flatMap((sc) => STY.map((st) => `${sc}_${st}`)), weapons = WT.flatMap((t) => MAT.map((m) => `w_${t}_${m}`));
  check(sets.length === 96 && sets.join() === HC_SETS.map((s) => s.id).join(), `paperdoll: HC_SETS is in MV.GEAR.SETS order (${sets.length} from gear.js)`);
  check(weapons.length === 64 && weapons.join() === HC_WEAPONS.map((w) => w.id).join(), `paperdoll: HC_WEAPONS is in MV.GEAR.WEAPONS order (${weapons.length} from gear.js)`);

  const save = newCharacter('warden');
  const set = HC_SETS[13], helm = HC_PIECES.find((p) => p.set === set.id && p.slot === 'head')!, w = HC_WEAPONS[20];
  save.equipment.head = inst(helm.id); save.equipment.main = inst(w.id);
  const g = paperdoll(save);
  check(g.helmSet === 14 && g.weapon === 21 && g.chestSet === 0, `paperdoll: an equipped helm and weapon map to their 1-based MV indices (helm ${g.helmSet}, weapon ${g.weapon})`);
  const look = { skin: 1, hair: 2, hc: 3, eyes: 0, ec: 1, mouth: 2, mark: 0, body: 0 as const };
  const k0 = lookKey('warden', look, g);
  const fields = Object.keys(g) as (keyof PaperdollGear)[];
  const still = fields.filter((f) => lookKey('warden', look, { ...g, [f]: (g[f] ?? 0) + 1 }) === k0);
  const lookStill = (Object.keys(look) as (keyof typeof look)[]).filter((f) => lookKey('warden', { ...look, [f]: (look[f] as number) + 1 } as typeof look, g) === k0);
  check(!still.length && !lookStill.length && lookKey('knight', look, g) !== k0, `paperdoll: the look key changes with every drawn field (${fields.length} gear + ${Object.keys(look).length} look + class)`, [...still, ...lookStill].join(', '));
}

export function gearAllProps(): void { gearProps(); runeforgeProps(); paperdollProps(); }
