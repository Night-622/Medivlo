/**
 * Features gate, part 3: gear. Equip / unequip through a remote loadout changes the authority's hero; 2- and 4-piece
 * armour set bonuses and Attuned (wearer's school = set school) apply; two legendaries work in the sim.
 */
import { HC_PIECES } from '@/data/items/hc/armour.gen';
import { Btn } from '@/net/types';
import { newCharacter } from '@/systems/rules/character';
import { P } from '@/systems/rules/curves';
import { bossElement, itemMods, legendary } from '@/systems/rules/gear';
import { compileStats } from '@/systems/rules/playerStats';
import type { CharacterSave, GearSlot, ItemInstance } from '@/systems/rules/types';
import { check, dummy, hero, near, world } from './features-harness';

const pieces = (set: string, ilvl: number, n = 4): ItemInstance[] =>
  HC_PIECES.filter((p) => p.set === set).slice(0, n).map((p) => ({ uid: `${p.id}-x`, base: p.id, ilvl, qty: 1 }));
const wear = (classId: string, level: number, items: ItemInstance[], tree: Record<string, number> = {}): CharacterSave => {
  const s = { ...newCharacter(classId), level, tree };
  for (const it of items) s.equipment[HC_PIECES.find((p) => p.id === it.base)!.slot as GearSlot] = it;
  return s;
};
const stat = (s: CharacterSave, k: string): number => compileStats(s).stats[k] ?? 0;
const ownArmor = (it: ItemInstance): number => itemMods(it).filter((m) => m.stat === 'armor').reduce((a, m) => a + m.value, 0);

function equipUnequip(): void {
  const w = world();
  hero(w, 'a', { ...newCharacter('warden'), level: 10 });
  const p = w.player('a');
  w.sim.questReward({ playerId: 'a', hcItems: [{ item: 'a_rime_plate_helm' }, { item: 'w_sword_iron' }] });
  const helm = p.save.inventory.find((x) => x.base === 'a_rime_plate_helm')!;
  const sword = p.save.inventory.find((x) => x.base === 'w_sword_iron')!;
  const armor0 = p.stats.stats.armor ?? 0, weap0 = p.weapon.max, start = p.save.equipment.main!;
  const send = (s: CharacterSave) => w.sim.receive({ type: 'loadout', data: s as unknown as Record<string, unknown> }, 'a');
  // the client's equip(): out of the pack, into the slot (the old main hand goes back to the pack)
  const s = JSON.parse(JSON.stringify(p.save)) as CharacterSave;
  s.inventory = s.inventory.filter((x) => x.uid !== helm.uid && x.uid !== sword.uid).concat([s.equipment.main!]);
  s.equipment.head = { ...helm }; s.equipment.main = { ...sword };
  send(s);
  const plus = ownArmor(helm);
  check(p.save.equipment.head?.uid === helm.uid && near(p.stats.stats.armor ?? 0, armor0 + plus, 0.01) && p.weapon.max > weap0 && p.save.inventory.some((x) => x.uid === start.uid),
    `equip: Rime plate helm +${plus.toFixed(1)} armour, iron sword raises weapon damage (${weap0.toFixed(1)} → ${p.weapon.max.toFixed(1)})`, `armor ${armor0}→${p.stats.stats.armor}`);
  const u = JSON.parse(JSON.stringify(p.save)) as CharacterSave;
  u.inventory.push(u.equipment.head!); delete u.equipment.head;
  send(u);
  check(!p.save.equipment.head && near(p.stats.stats.armor ?? 0, armor0, 0.01) && p.save.inventory.some((x) => x.uid === helm.uid), 'unequip: the helm goes back to the pack and its armour leaves the hero');
}

function setBonuses(): void {
  const L = 10;
  const plate = pieces('rime_plate', L);
  const two = stat(wear('warden', L, plate.slice(0, 2)), 'armor'), one = stat(wear('warden', L, plate.slice(0, 1)), 'armor');
  check(near(two - one - ownArmor(plate[1]), 25 * P(L), 0.01), `2-piece plate: +${(25 * P(L)).toFixed(1)} armour on top of the pieces (25 × P(${L}))`, `bonus ${(two - one - ownArmor(plate[1])).toFixed(2)}`);
  const leather = pieces('rime_leather', L);
  const crit = (n: number) => stat(wear('warden', L, leather.slice(0, n)), 'crit');
  check(near(crit(2) - crit(1), 0.08) && near(crit(1), crit(0)), '2-piece leather: +8% crit (one piece gives none)');
  // 4-piece: the style trigger (leather = dash) runs the school effect (rime = freeze around you)
  for (const n of [4, 3]) {
    const w = world();
    const p = hero(w, 'a', wear('warden', L, leather.slice(0, n)));
    const d = dummy(w, 30, 0, L);
    w.run(500, { a: { aim: { x: 40, y: 0 } } }); // past the opening 0.4 s dash gap
    const n0 = w.events.length;
    w.tick({ a: { aim: { x: 40, y: 0 }, move: { x: 1, y: 0 }, buttons: Btn.DASH } });
    const froze = w.since(n0, 'status:changed').some((e) => e.p.entityId === d.id && e.p.status === 'freeze');
    check(n === 4 ? froze && compileStats(p.save).procs.some((x) => x.on === 'dash') : !froze, n === 4 ? '4-piece Rime leather: dashing freezes the foe beside you' : '3 pieces: dashing freezes nothing');
  }
  // Attuned: four pieces of your own school's set
  const att = (classId: string, set: string, n: number, k: string, tree: Record<string, number> = {}) => stat(wear(classId, L, pieces(set, L, n), tree), k);
  const rimeW4 = att('warden', 'rime_leather', 4, 'dmg.rime'), rimeW3 = att('warden', 'rime_leather', 3, 'dmg.rime');
  const slowW4 = att('warden', 'rime_leather', 4, 'slowPower'), slowW3 = att('warden', 'rime_leather', 3, 'slowPower');
  check(near(rimeW4 - rimeW3, 0.15) && near(slowW4 - slowW3, 0.2), 'Attuned: a warden (Rime) in 4 Rime pieces gets +15% Rime damage and +20% slow strength');
  check(near(att('knight', 'rime_leather', 4, 'dmg.rime'), att('knight', 'rime_leather', 3, 'dmg.rime')), 'not Attuned: a knight (Iron) in the same 4 Rime pieces gets no Rime bonus');
  check(near(att('knight', 'iron_leather', 4, 'block') - att('knight', 'iron_leather', 3, 'block'), 0.1), 'Attuned: a knight in 4 Iron pieces gets +10% block');
  // Set Mastery (Skills branch): "Attuned armour bonuses are 25% stronger"
  const mastery = { sk_p0a: 1, sk_p0m1: 1, sk_p0m2: 1, sk_p0b: 1, sk_p0c1: 1 };
  const withM = att('warden', 'rime_leather', 4, 'dmg.rime', mastery) - att('warden', 'rime_leather', 3, 'dmg.rime', mastery);
  check(near(withM, 0.15 * 1.25), 'Set Mastery: the Attuned +15% Rime damage becomes +18.75%', `Attuned part is still +${(withM * 100).toFixed(2)}% (hook 'setMastery' is never read)`);
}

function legendaries(): void {
  // Morwen's axe (fxIndex 1): kills heal 10% and restore 10 Ember
  const lg = legendary('lg_morwen')!;
  for (const main of ['lg_morwen', 'w_axe_ember']) {
    const w = world();
    const s = { ...newCharacter('juggernaut'), level: 10 }; // axe, no lifesteal (a reaver's 7% would refill it from the killing blow)
    s.equipment.main = { uid: 'm', base: main, ilvl: 10, qty: 1 };
    const p = hero(w, 'a', s);
    const id = w.sim.spawn({ creature: 'bx_wolf', level: 10, space: 't', x: 30, y: 0, dormant: true });
    p.ember = 0; p.hp = Math.round(p.maxHp * 0.5);
    const hp0 = p.hp;
    w.sim.damage(id, 1e12, 'physical', p.id);
    const healed = (p.hp - hp0) / p.maxHp;
    // every melee kill also heals 5% (bloodlust)
    check(main === lg.id ? near(p.ember, 10) && near(healed, 0.15, 0.01) : near(p.ember, 0) && near(healed, 0.05, 0.01),
      main === lg.id ? `${lg.name}: a kill restores 10 Ember and heals 10% (+5% bloodlust)` : 'plain ember axe: a kill gives no Ember, only the 5% bloodlust', `ember ${p.ember}, healed ${(healed * 100).toFixed(1)}%`);
  }
  // The Engine's amulet (fxIndex 3): immune to its boss's signature status
  const eng = legendary('lg_engine')!, sig = bossElement(eng.boss).signature;
  const w = world();
  const a = { ...newCharacter('warden'), level: 10 };
  a.equipment.amulet = { uid: 'am', base: eng.id, ilvl: 10, qty: 1 };
  const pa = hero(w, 'a', a), pb = hero(w, 'b', { ...newCharacter('warden'), level: 10 }, 200, 0);
  w.sim.applyStatus(pa.id, { id: sig as never, dur: 2000 });
  w.sim.applyStatus(pb.id, { id: sig as never, dur: 2000 });
  check(!pa.statuses.has(sig as never) && pb.statuses.has(sig as never), `${eng.name}: immune to ${sig} (the hero beside it is not)`);
}

export function gearChecks(): void {
  equipUnequip();
  setBonuses();
  legendaries();
}
