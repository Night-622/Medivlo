/**
 * Random affixes, sockets, upgrades and imbue (Claude 3, docs/systems/BUILDS.md §2.3–2.4, §6): the roll obeys its
 * tables, equipped affixes change the hero, drops carry them, and remote loadouts cannot forge them.
 */
import { Rng } from '@/core/rng';
import { HC_AFFIXES } from '@/data/items/hc/affixes';
import { kitFor } from '@/data/classes/hc/kits';
import { NEW_KIT } from '@/data/spells/hc/kit-spells-new';
import { HC_WEAPONS } from '@/data/items/hc/weapons.gen';
import { AFFIX_COUNT, SOCKETS } from '@/systems/rules/affixTypes';
import { affixDef, rollAffixes, rollInstance, rollRarity, sanitizeAffixes, tierAt } from '@/systems/rules/affixes';
import { newCharacter } from '@/systems/rules/character';
import { itemMods, itemWeaponDamage, weaponDamage } from '@/systems/rules/gear';
import { compileStats } from '@/systems/rules/playerStats';
import { sanitizeLoadout } from '@/systems/rules/validate';
import { RARITY_ORDER, type CharacterSave, type ItemInstance, type Rarity } from '@/systems/rules/types';
import { spellView } from '@/systems/sim/player';
import { check, hero, world } from './features-harness';

const sword = HC_WEAPONS.find((w) => w.type === 'sword' && w.material === 'iron')!.id;

function rolls(): void {
  const rng = new Rng(11);
  const seen: Record<string, number> = {};
  let bad: string[] = [];
  for (let i = 0; i < 4000; i++) {
    const ilvl = 1 + (i % 40);
    const r = rollInstance(rng, sword, ilvl, 0, 'enemy', { classId: 'swordsman', school: 'blade' });
    const rar = r.rarity as Rarity;
    seen[rar] = (seen[rar] ?? 0) + 1;
    const a = r.affixes ?? [];
    const [lo, hi] = AFFIX_COUNT[rar];
    const groups = new Set(a.map((x) => affixDef(x.id)!.group));
    const pre = a.filter((x) => affixDef(x.id)!.kind === 'prefix').length;
    const inTier = a.every((x) => { const d = affixDef(x.id)!, t = tierAt(d, ilvl)!; return x.v >= t.min - 1e-9 && x.v <= t.max + 1e-9; });
    if (a.length < lo || a.length > hi || groups.size !== a.length || pre > 2 || a.length - pre > 2 || !inTier || (r.sockets?.length ?? 0) !== SOCKETS[rar]) bad.push(`${rar}@${ilvl}:${a.map((x) => `${x.id}=${x.v}`).join(',')}`);
  }
  check(!bad.length, 'affix rolls: count by rarity, unique groups, ≤ 2 prefixes / suffixes, values inside the tier, sockets by rarity (4000 drops)', bad.slice(0, 3).join(' | '));
  const common = (seen.common ?? 0) / 4000, spark = seen.spark ?? 0;
  check(common > 0.4 && common < 0.6 && spark < 60, 'rarity: about half the drops are common, sparkforged stays rare', JSON.stringify(seen));
  // bosses and luck lift rarity
  let boss = 0, plain = 0;
  for (let i = 0; i < 3000; i++) { if (RARITY_ORDER.indexOf(rollRarity(rng, 0, 'boss')) >= 3) boss++; if (RARITY_ORDER.indexOf(rollRarity(rng, 0, 'enemy')) >= 3) plain++; }
  check(boss > plain * 2.5, 'rarity: a boss drop is far more often runed or better', `boss ${boss}, enemy ${plain} of 3000`);
  // class locks: "+1 to <kit spell>" rolls only for its class
  bad = [];
  const kit = new Set([...kitFor('swordsman').spells, ...NEW_KIT.swordsman]);
  for (let i = 0; i < 3000; i++) {
    for (const x of rollAffixes(rng, sword, 30, 'spark', { classId: 'swordsman', school: 'blade' })) {
      const d = affixDef(x.id)!;
      if (d.only?.classId && d.only.classId !== 'swordsman') bad.push(x.id);
      if ('spellLevels' in d.effect && d.effect.spellLevels !== '*' && !kit.has(d.effect.spellLevels)) bad.push(x.id);
    }
    for (const x of rollAffixes(rng, sword, 30, 'spark')) if (affixDef(x.id)!.only) bad.push(`anon:${x.id}`);
  }
  check(!bad.length, 'affixes: class / school locked affixes roll only for that class (and never on anonymous drops)', bad.slice(0, 4).join(','));
}

function compiled(): void {
  const burning = HC_AFFIXES.find((a) => a.group === 'dmg.ash')!;
  const hp = HC_AFFIXES.find((a) => a.group === 'hp' && 'mod' in a.effect && a.effect.mod.op === 'flat')!;
  const s0: CharacterSave = { ...newCharacter('arcanist'), level: 30 };
  const base = compileStats(s0).stats;
  const main = { ...s0.equipment.main!, ilvl: 30, rarity: 'runed', affixes: [{ id: burning.id, v: 0.2 }, { id: hp.id, v: 20 }] } as ItemInstance;
  const s1 = { ...s0, equipment: { ...s0.equipment, main } };
  const st = compileStats(s1).stats;
  const dAsh = (st['dmg.ash'] ?? 0) - (base['dmg.ash'] ?? 0), dHp = (st.hp ?? 0) - (base.hp ?? 0);
  check(Math.abs(dAsh - 0.2) < 1e-9 && dHp > 20 * 5, `affixes compile: +20% Ash damage adds 0.2; +20 HP (L1 scale) grows with item level (ilvl ${main.ilvl})`, `dmg.ash +${dAsh.toFixed(3)}, hp +${dHp.toFixed(0)}`);
  // "+N to <spell>" from an affix raises that spell
  const sp = kitFor('arcanist').spells[0];
  const lvl = HC_AFFIXES.find((a) => 'spellLevels' in a.effect && a.effect.spellLevels === sp)!;
  const w = world(), p = hero(w, 'a', { ...s0, equipment: { ...s0.equipment, main: { ...main, affixes: [{ id: lvl.id, v: 2 }] } } });
  const w0 = world(), q = hero(w0, 'a', s0);
  const ratio = spellView(p, p.spells.get(sp)!).dmg / spellView(q, q.spells.get(sp)!).dmg;
  check(Math.abs(ratio - 1.24) < 1e-9, `affixes compile: "+2 to ${sp}" gives that spell +24% damage`, `×${ratio.toFixed(3)}`);
}

function upgradeImbue(): void {
  const s0: CharacterSave = { ...newCharacter('swordsman'), level: 20 };
  const it: ItemInstance = { uid: 'u', base: sword, ilvl: 20, qty: 1 };
  const [a] = weaponDamage(sword, 20), [b] = itemWeaponDamage({ ...it, upgrade: 3 });
  const helm: ItemInstance = { uid: 'h', base: 'a_iron_plate_helm', ilvl: 20, qty: 1 };
  const arm = (x: ItemInstance) => itemMods(x).find((m) => m.stat === 'armor')!.value;
  check(Math.abs(b / a - 1.24) < 0.03 && Math.abs(arm({ ...helm, upgrade: 2 }) / arm(helm) - 1.16) < 1e-9, 'upgrade: +3 is +24% weapon damage, +2 is +16% armour', `dmg ${a} → ${b}, armour ×${(arm({ ...helm, upgrade: 2 }) / arm(helm)).toFixed(3)}`);
  const conv = compileStats({ ...s0, equipment: { ...s0.equipment, main: { ...it, imbue: 'rime' } } }).convert;
  check(conv.some((c) => c.from === 'attack' && c.to === 'rime' && c.pct === 0.5), 'imbue: a Rime-imbued weapon turns half its attacks into Rime');
}

function drops(): void {
  const w = world(), p = hero(w, 'a', { ...newCharacter('warden'), level: 20 });
  let rolled = 0, total = 0;
  for (let i = 0; i < 60; i++) {
    const id = w.sim.spawn({ creature: 'bx_wolf', level: 20, space: 't', x: 60, y: 0 });
    w.sim.w.enemies.get(id)!.hp = 1;
    w.sim.damage(id, 1e6, 'physical', p.id);
    w.run(100);
  }
  for (const l of w.sim.w.loot.values()) if (l.item && affixDef(l.item.affixes?.[0]?.id ?? '') !== undefined) rolled++;
  for (const l of w.sim.w.loot.values()) if (l.item?.rarity) total++;
  check(total > 0 && rolled > 0, 'drops: gear from kills carries a rolled rarity and affixes', `${total} rolled pieces, ${rolled} with affixes`);
}

function sanitise(): void {
  const good = HC_AFFIXES.find((a) => a.group === 'dmg.ash')!;
  const t = tierAt(good, 20)!;
  const kept = sanitizeAffixes({ base: sword, ilvl: 20, rarity: 'fine', affixes: [{ id: good.id, v: t.max }, { id: 'pre_nope', v: 1 }] });
  const forged = sanitizeAffixes({ base: sword, ilvl: 20, rarity: 'spark', affixes: [{ id: good.id, v: t.max * 3 }] });
  const many = sanitizeAffixes({ base: sword, ilvl: 40, rarity: 'fine', affixes: HC_AFFIXES.filter((a) => a.slots.includes('weapon') && !a.only).slice(0, 6).map((a) => ({ id: a.id, v: tierAt(a, 40)!.min })) });
  check(kept.length === 1 && !forged.length && many.length === 1, 'sanitise: unknown ids, values past the tier and more affixes than the rarity allows are dropped', `kept ${kept.length}, forged ${forged.length}, fine with 6 → ${many.length}`);
  const s = newCharacter('swordsman');
  const raw = JSON.parse(JSON.stringify({ ...s, equipment: { ...s.equipment, main: { ...s.equipment.main!, rarity: 'fine', sockets: ['i_ruby', 'i_ruby', 'i_ruby'], upgrade: 9, imbue: 'nope', affixes: [{ id: good.id, v: 99 }] } } }));
  const out = sanitizeLoadout(raw)!.equipment.main!;
  check(!out.sockets && (out.upgrade ?? 0) <= 5 && !out.imbue && !out.affixes, 'sanitise: a loadout cannot add sockets beyond its rarity, upgrades past +5, a bad imbue or forged affixes', JSON.stringify({ s: out.sockets, u: out.upgrade, i: out.imbue, a: out.affixes }));
}

export function affixChecks(): void {
  rolls();
  compiled();
  upgradeImbue();
  drops();
  sanitise();
}
