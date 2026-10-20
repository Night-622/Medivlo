/**
 * Spell runes and tomes (Claude 3, docs/systems/BUILDS.md §2.2, §4): slots by tree progress, slotting through the
 * authority (uses the rune, refuses misfits and full spells, unslotting returns it), each rune's effect in a real
 * cast, loadouts cannot add runes or tomes, and reading a tome teaches one off-school spell.
 */
import { kitFor } from '@/data/classes/hc/kits';
import { Btn } from '@/net/types';
import { HC_TOMES } from '@/data/items/hc/build-items';
import { ACT3_BOSSES, lootTable } from '@/data/items/hc/lootTables';
import { HC_LEGENDARIES } from '@/data/items/hc/legendary.gen';
import { itemRarity } from '@/systems/rules/affixes';
import { newCharacter } from '@/systems/rules/character';
import { runeSlots } from '@/systems/rules/runes';
import type { CharacterSave, HcSpell } from '@/systems/rules/types';
import { spellDef } from '@/systems/rules/spells';
import { spellView } from '@/systems/sim/player';
import { check, dummy, hero, world, type World } from './features-harness';

const act = (w: World, action: string, args: Record<string, unknown>, pid = 'a') => w.sim.receive({ type: 'act', domain: 'systems', action, args } as never, pid);
const notices = (w: World, n0: number) => w.since(n0, 'systems:notice').map((e) => String(e.p.text));
const pack = (s: CharacterSave, ...ids: string[]) => { for (const id of ids) s.inventory.push({ uid: `u-${id}-${s.inventory.length}`, base: id, ilvl: 1, qty: 1 }); return s; };
const qty = (s: CharacterSave, id: string) => s.inventory.filter((x) => x.base === id).reduce((a, x) => a + x.qty, 0);

function slots(): void {
  const s = { ...newCharacter('arcanist'), level: 20, tree: {} as Record<string, number> };
  const sp = kitFor('arcanist').spells[0];
  const a = runeSlots(s, sp);
  s.tree.sp_p0m1 = 1; s.tree.sp_p0m2 = 1;
  const b = runeSlots(s, sp);
  s.tree.sp_p0b = 3;
  const c = runeSlots(s, sp);
  check(a === 0 && b === 1 && c === 2, `rune slots: ${sp} has 0 → 1 at sp_p0m2 → 2 at sp_p0b rank 3`, `${a}, ${b}, ${c}`);
}

/** A level-20 arcanist with path 0 opened (2 slots in kit spell 1) and the given runes in the pack. */
function rig(...runes: string[]) {
  const w = world();
  const s = pack({ ...newCharacter('arcanist'), level: 20, tree: { sp_p0m1: 1, sp_p0m2: 1, sp_p0b: 3 } }, ...runes);
  const p = hero(w, 'a', s);
  return { w, p, sp: p.spells.get(kitFor('arcanist').spells[0])! };
}

function slotting(): void {
  const { w, p, sp } = rig('rn_power', 'rn_thrift', 'rn_haste', 'rn_volley');
  const v0 = spellView(p, sp);
  let n0 = w.events.length;
  act(w, 'rune', { spell: sp.id, rune: 'rn_power' });
  const v1 = spellView(p, sp);
  check(!notices(w, n0).length && qty(p.save, 'rn_power') === 0 && Math.abs(v1.dmg / v0.dmg - 1.3) < 1e-9 && Math.abs(v1.cost / v0.cost - 1.3) < 1e-9, `slotting a Rune of Power into ${sp.name} uses it: +30% damage, +30% cost`, `dmg ×${(v1.dmg / v0.dmg).toFixed(2)}`);
  act(w, 'rune', { spell: sp.id, rune: 'rn_haste' });
  n0 = w.events.length;
  act(w, 'rune', { spell: sp.id, rune: 'rn_thrift' });
  check(notices(w, n0).some((t) => /full/.test(t)) && qty(p.save, 'rn_thrift') === 1, 'a third rune in a 2-slot spell is refused and kept');
  const cd = spellView(p, sp).cd / v0.cd;
  check(Math.abs(cd - 0.8) < 1e-9, 'Rune of Haste: 20% shorter cooldown', `cd ×${cd.toFixed(2)}`);
  n0 = w.events.length;
  act(w, 'rune', { spell: sp.id, rune: 'rn_power', remove: true });
  check(!notices(w, n0).length && qty(p.save, 'rn_power') === 1 && Math.abs(spellView(p, sp).dmg - v0.dmg) < 1e-9, 'unslotting gives the rune back and its effect goes');
  // misfit: a projectile rune in a non-projectile spell
  const other = [...p.spells.values()].find((x) => !x.tags.includes('projectile') && runeSlots(p.save, x.id) > 0);
  if (other) { n0 = w.events.length; act(w, 'rune', { spell: other.id, rune: 'rn_volley' }); check(notices(w, n0).some((t) => /suit/.test(t)), `Rune of Volley does not fit ${other.name} (no projectiles)`); }
  n0 = w.events.length;
  act(w, 'rune', { spell: kitFor('arcanist').spells[1], rune: 'rn_thrift' });
  check(notices(w, n0).some((t) => /no rune slot/.test(t)), 'a spell whose path is not learned has no slot');
}

function effects(): void {
  // Volley: +2 projectiles; Convert: the damage kind; Ward: a shield on cast
  const { w, p, sp } = rig('rn_volley', 'rn_convert_rime');
  const count = () => [...w.sim.w.projectiles.values()].filter((x) => x.cast.caster === p).length;
  w.run(300);
  const cast = (s: HcSpell) => { const n0 = count(); w.sim.w.players.get(p.id)!.cds.clear(); (w.sim.w as unknown as { t: number }); castNow(w, p, s); return count() - n0; };
  const n1 = cast(sp);
  w.run(3000);
  act(w, 'rune', { spell: sp.id, rune: 'rn_volley' });
  const n3 = cast(p.spells.get(sp.id)!);
  check(sp.tags.includes('projectile') && n3 === n1 + 2, `Rune of Volley: ${sp.name} fires ${n1} → ${n3} projectiles`);
  w.run(3000);
  act(w, 'rune', { spell: sp.id, rune: 'rn_convert_rime' });
  const d = dummy(w, 150, 0), e0 = w.events.length;
  p.target = d.id;
  p.attackReadyAt = Number.POSITIVE_INFINITY; // only the spell's hits count
  castNow(w, p, p.spells.get(sp.id)!);
  w.run(1500);
  const kinds = new Set(w.since(e0, 'combat:hit').filter((e) => e.p.sourceId === p.id && e.p.targetId === d.id && e.p.kind === 'dmg').map((e) => String(e.p.type)));
  check(kinds.has('rime') && !kinds.has('ash'), `Rune of Rime: ${sp.name} deals Rime instead of Ash`, [...kinds].join(','));
}

function castNow(w: World, p: ReturnType<typeof hero>, sp: HcSpell): void {
  const slot = p.save.hotbar.indexOf(sp.id);
  p.cds.delete(sp.id); p.ember = p.emberMax;
  w.press('a', [Btn.CAST1, Btn.CAST2, Btn.CAST3, Btn.CAST4][slot] ?? Btn.CAST1, { aim: { x: 150, y: 0 } });
}

function antiMint(): void {
  // a guest joins with its own save (no runes), then a later loadout claims runes and a tome it never slotted / read
  const { w, p, sp } = rig();
  const own = JSON.parse(JSON.stringify(p.save));
  w.sim.receive({ type: 'loadout', data: own } as never, 'b');
  const guest = w.sim.w.players.get('p:b');
  const forged = { ...own, runes: { [sp.id]: ['rn_power', 'rn_echo'] }, tomeSpell: HC_TOMES.find((t) => t.school !== 'ash')!.spell };
  w.sim.receive({ type: 'loadout', data: forged } as never, 'b');
  check(!!guest && !Object.keys(guest.save.runes ?? {}).length && !guest.save.tomeSpell, 'a later guest loadout cannot add runes or a tome spell', JSON.stringify({ r: guest?.save.runes, t: guest?.save.tomeSpell }));
}

function tomes(): void {
  const t = HC_TOMES.find((x) => x.school !== 'ash')!, own = HC_TOMES.find((x) => x.school === 'ash')!;
  const t2 = HC_TOMES.find((x) => x.school !== 'ash' && x.spell !== t.spell)!;
  const { w, p } = rig(t.item, own.item, t2.item);
  const uid = (id: string) => p.save.inventory.find((x) => x.base === id)!.uid;
  let n0 = w.events.length;
  act(w, 'useItem', { uid: uid(own.item) });
  check(notices(w, n0).some((x) => /own school/.test(x)) && qty(p.save, own.item) === 1, 'a tome of your own school is refused (and kept)');
  n0 = w.events.length;
  act(w, 'useItem', { uid: uid(t.item) });
  check(p.save.tomeSpell === t.spell && p.spells.has(t.spell) && qty(p.save, t.item) === 0 && runeSlots(p.save, t.spell) === 1, `reading ${t.item} teaches ${spellDef(t.spell)?.name} (one rune slot) and uses the tome`, String(p.save.tomeSpell));
  // respec-econ: a second tome replaces the spell and the first tome comes back, so swapping back costs nothing
  act(w, 'useItem', { uid: uid(t2.item) });
  check(p.save.tomeSpell === t2.spell && qty(p.save, t2.item) === 0 && qty(p.save, t.item) === 1, `reading ${t2.item} replaces the spell and returns ${t.item} to the pack`, String(p.save.tomeSpell));
  act(w, 'useItem', { uid: uid(t.item) });
  check(p.save.tomeSpell === t.spell && qty(p.save, t2.item) === 1 && qty(p.save, t.item) === 0, 'swapping back: the first spell again, the second tome returned');
}

/** Runeforge v3 at a capital smith: upgrade, reroll, imbue, move a unique effect, craft a rune, dust from salvage. */
function forge(): void {
  const w = world();
  const s = pack({ ...newCharacter('swordsman'), level: 20, gold: 1e6 }, 'i_essence_rime', 'i_runedust', 'i_runedust', 'i_runedust', 'i_runedust', 'i_runedust');
  for (let i = 0; i < 20; i++) pack(s, 'i_ingot');
  const sword = s.equipment.main!;
  Object.assign(sword, { ilvl: 20, rarity: 'runed', affixes: [{ id: 'pre_honed', v: 0.1 }, { id: 'suf_of_fortune', v: 0.05 }] });
  s.inventory.push({ uid: 'lg', base: 'lg_stag', ilvl: 20, qty: 1 }, { uid: 'junk', base: s.equipment.main!.base, ilvl: 20, qty: 1, rarity: 'ember', affixes: [{ id: 'pre_honed', v: 0.1 }, { id: 'suf_of_fortune', v: 0.05 }] });
  const p = hero(w, 'a', s);
  const smith = (action: string, args: Record<string, unknown>) => { const n0 = w.events.length; act(w, action, { shop: 'shop:iron-smith', ...args }); return notices(w, n0); };
  const dmg0 = p.weapon.max;
  smith('upgrade', { uid: sword.uid }); smith('upgrade', { uid: sword.uid });
  check(sword.upgrade === 2 && p.weapon.max > dmg0 * 1.1, `upgrade: +2 at a capital smith raises the worn sword's damage (${dmg0} → ${p.weapon.max})`);
  const before = sword.affixes![0].id;
  check(!smith('reroll', { uid: sword.uid, affix: 0 }).length && sword.affixes![0].id !== before && sword.affixes!.length === 2, `reroll: the first affix changes (${before} → ${sword.affixes![0].id}), the other stays`);
  check(!smith('imbue', { uid: sword.uid, school: 'rime' }).length && sword.imbue === 'rime' && qty(p.save, 'i_essence_rime') === 0 && p.stats.convert.some((c) => c.to === 'rime'), 'imbue: an Essence of Rime turns half the sword’s attacks to Rime');
  check(smith('imbue', { uid: sword.uid, school: 'rime' }).some((t) => /Essence/.test(t)), 'imbue: refused without an Essence');
  const gone = smith('transfer', { uid: sword.uid, from: 'lg' });
  check(!gone.length && sword.uniqueFx === 'lg_stag' && !p.save.inventory.some((x) => x.uid === 'lg'), 'transfer: the Stag’s Blade effect moves onto the sword; the legendary is used up', gone.join());
  // respec-econ: an old piece's +n moves too, so a set swap keeps its upgrades; a lower +n has nothing to give
  p.save.inventory.push({ uid: 'old4', base: sword.base, ilvl: 20, qty: 1, upgrade: 4 }, { uid: 'old1', base: sword.base, ilvl: 20, qty: 1, upgrade: 1 });
  check(smith('transfer', { uid: sword.uid, from: 'old1' }).length > 0 && p.save.inventory.some((x) => x.uid === 'old1'), 'transfer: a lower upgrade with no effect is refused (and kept)');
  const up = smith('transfer', { uid: sword.uid, from: 'old4' });
  check(!up.length && sword.upgrade === 4 && sword.uniqueFx === 'lg_stag' && !p.save.inventory.some((x) => x.uid === 'old4'), `transfer: a +4 piece moves its upgrade onto the +2 sword (now +${sword.upgrade}), the effect stays`, up.join());
  check(!smith('craft', { rune: 'rn_pierce' }).length && qty(p.save, 'rn_pierce') === 1 && qty(p.save, 'i_runedust') === 2, 'craft: a Rune of Piercing from 3 rune dust and gold');
  const d0 = qty(p.save, 'i_runedust');
  smith('salvage', { uid: 'junk' });
  check(qty(p.save, 'i_runedust') === d0 + 2, 'salvage: an item with 2 affixes gives 2 rune dust');
}

/** Named loot tables: a chest prop, a boss's own table, Act III, and every table id resolvable. */
function tables(): void {
  const w = world(), p = hero(w, 'a', { ...newCharacter('warden'), level: 20 });
  const lootOf = () => [...w.sim.w.loot.values()].filter((l) => l.item).map((l) => l.item!.base);
  w.sim.openChest('a', 'obj:test-cave', { level: 20, rarity: 'rare', loot: 'tbl:ash-cave' });
  const got = lootOf();
  check(got.includes('i_essence_ash') && got.some((b) => b.startsWith('rn_') || (itemRarity({ base: b }) && b.startsWith('w_') || b.startsWith('a_'))), 'chest loot: tbl:ash-cave adds an Essence of Ash plus a rune or a rare piece', got.join(','));
  w.sim.w.loot.clear();
  w.sim.openChest('a', 'obj:test-plain', { level: 20, loot: 'tbl:nope' });
  check(!lootOf().some((b) => b.startsWith('i_essence') || b.startsWith('rn_')), 'an unknown table id adds nothing (the usual chest roll only)');
  // a legendary boss: its table rolls for each killer on top of the legendary
  w.sim.w.loot.clear();
  const id = w.sim.spawn({ creature: 'bx_stag', level: 20, space: 't', x: 80, y: 0, tier: 'boss' });
  w.sim.damage(id, 1e12, 'physical', p.id);
  w.run(200);
  const boss = lootOf();
  check(boss.includes('lg_stag') && boss.some((b) => b.startsWith('rn_') || /^(w|a)_/.test(b)), 'boss loot: the White Stag drops its legendary and rolls tbl:bx_stag', boss.join(','));
  const missing = HC_LEGENDARIES.filter((l) => !lootTable(`tbl:${l.boss}`)).map((l) => l.boss);
  const ids = ['ash', 'rime', 'storm', 'radiance', 'umbral', 'verdant', 'blade', 'iron', 'fist', 'hunt', 'guile', 'song'].flatMap((s) => [`tbl:${s}-ruin`, `tbl:${s}-cave`]).concat(['tbl:morvane-ruin', 'tbl:morvane-cave', 'tbl:heart-cache', 'tbl:lair-rare', 'tbl:act3']);
  check(!missing.length && ids.every((x) => !!lootTable(x)) && ACT3_BOSSES.size === 24, `all ${ids.length + HC_LEGENDARIES.length} agreed table ids exist; ${ACT3_BOSSES.size} Act III forms roll tbl:act3`, missing.join(','));
}

export function runeChecks(): void {
  tables();
  forge();
  slots();
  slotting();
  effects();
  antiMint();
  tomes();
}
