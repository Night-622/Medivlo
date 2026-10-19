/** Authority trust tests (Claude 3): forged loadouts, remote teleports. Run: node tools/e2e/sim/run.mjs security */
import { newCharacter } from '@/systems/rules/character';
import { Sim } from '@/systems/sim/Sim';
import type { SimPorts } from '@/systems/sim/world';

let fails = 0;
const check = (ok: boolean, what: string) => { console.log(ok ? 'ok  ' : 'FAIL', what); if (!ok) fails++; };
const ports: SimPorts = {
  move: (_s, x, y, dx, dy) => ({ x: x + dx, y: y + dy }), clear: () => true, zoneRule: () => 'wild',
  respawnPoint: () => ({ space: 'home', x: 0, y: 0 }), emit: () => {}, partySize: () => 2, realmRule: () => 'ffa',
};
const sim = new Sim(ports, 5);
sim.localPlayer = 'host';
sim.receive({ type: 'loadout', data: newCharacter('warden') as never }, 'host');

// a forged first loadout from a remote player
const forged = {
  ...newCharacter('reaver'), level: 99, xp: 1e12, gold: 1e15, bonusPoints: 500,
  equipment: { main: { uid: 'x1', base: 'lg_stag', ilvl: 99, qty: 1 }, off: { uid: 'x2', base: 'w_staff_spark', ilvl: 40, qty: 1 }, head: { uid: 'x3', base: 'w_sword_iron', ilvl: 1, qty: 1 } },
  inventory: [{ uid: 'p1', base: 'i_hp_l', ilvl: 1, qty: 1e9 }, { uid: 'p2', base: 'not_an_item', ilvl: 1, qty: 1 }, { uid: 'p1', base: 'i_hp_l', ilvl: 1, qty: 5 }],
  tree: Object.fromEntries([...Array(80)].map((_, i) => [`sk_p${i % 3}a`, 5])), hotbar: ['spell:meteor', 'spell:cinder-cleave', null, null],
};
sim.receive({ type: 'loadout', data: forged as never }, 'guest');
const g = sim.w.players.get('p:guest')!;
check(g.save.level === 40, `level clamped to the cap (${g.save.level})`);
check(g.save.gold === 10_000_000 && g.save.bonusPoints === 60, `gold and bonus points clamped (${g.save.gold}, ${g.save.bonusPoints})`);
check(!g.save.equipment.off && !g.save.equipment.head, 'staff in a reaver off hand and a sword on the head are rejected');
check(g.save.equipment.main?.base === 'lg_stag' && g.save.equipment.main.ilvl <= 40, 'item levels clamped');
check(g.save.inventory.length === 1 && g.save.inventory[0].qty === 999, 'unknown items and duplicate uids dropped, stacks capped');
const spent = Object.values(g.save.tree).reduce((a, b) => a + b, 0);
check(spent <= 39 + 60, `tree replayed within points (${spent})`);
check(g.save.hotbar[0] === null || g.save.hotbar[0] !== 'spell:meteor' || (g.save.tree['sp_t0'] ?? 0) > 0, 'unlearned spells removed from the hotbar');

// a later loadout cannot mint gold or items
const before = { gold: g.save.gold, n: g.save.inventory.length };
sim.receive({ type: 'loadout', data: { ...g.save, gold: 1, level: 1, inventory: [...g.save.inventory, { uid: 'new', base: 'lg_stag', ilvl: 40, qty: 1 }] } as never }, 'guest');
check(g.save.gold === before.gold && g.save.level === 40, 'later loadouts keep authority gold and level');
check(!g.save.inventory.some((i) => i.uid === 'new'), 'later loadouts cannot add items the authority never granted');

// teleports
const { x, y, space } = g;
sim.receive({ type: 'act', domain: 'systems', action: 'teleport', args: { space: 'boss-room', x: 999, y: 999 } }, 'guest');
check(g.x === x && g.y === y && g.space === space, 'remote teleport act ignored');
const h = sim.w.players.get('p:host')!;
sim.receive({ type: 'act', domain: 'systems', action: 'teleport', args: { space: 'town', x: 5, y: 6 } }, 'host');
check(h.space === 'town' && h.x === 5, 'the authority\'s own player may move itself');
check(sim.teleport('guest', 'town', 10, 10) && g.space === 'town', 'world code moves remote players with sim.teleport()');
console.log(fails ? `FAIL ${fails}` : 'OK');
