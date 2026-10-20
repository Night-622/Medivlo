/**
 * Hero lifecycle across world restarts and loads (Claude 3; Claude 6's integrity findings): a new input stream after
 * a door / reload is accepted; a load drops the old world and a dead hero; loading another class re-derives the kit.
 */
import { Btn } from '@/net/types';
import { plausible } from '@/systems/rules/plausible';
import type { CharacterSave } from '@/systems/rules/types';
import { kitFor } from '@/data/classes/hc/kits';
import { newCharacter } from '@/systems/rules/character';
import { check, DT, dummy, hero, world } from './features-harness';

function inputRestart(): void {
  const w = world(), p = hero(w, 'a', { ...newCharacter('warden'), level: 5 });
  w.run(10_000, { a: {} }); // 300 frames: lastSeq ≈ 300
  const seq0 = p.lastSeq;
  // a new HeroInput starts at seq 1 again: its frames must steer the hero
  const x0 = p.x;
  for (let i = 1; i <= 30; i++) w.sim.step(DT, 100_000 + i, new Map([['a', [{ seq: i, t: 0, move: { x: 1, y: 0 }, aim: { x: 0, y: 40 }, buttons: 0, target: null }]]]));
  check(seq0 >= 290 && p.x > x0 + 20 && p.lastSeq === 30, 'restart: a new input stream (seq from 1) after a long one steers the hero', `lastSeq ${seq0} → ${p.lastSeq}, x ${x0.toFixed(0)} → ${p.x.toFixed(0)}`);
  // a stale duplicate just behind the stream is still dropped
  const before = p.lastSeq;
  w.sim.step(DT, 200_000, new Map([['a', [{ seq: before - 2, t: 0, move: { x: -1, y: 0 }, aim: { x: 0, y: 40 }, buttons: 0, target: null }]]]));
  check(p.lastSeq === before, 'restart: a stale frame just behind the stream is still ignored', `lastSeq ${before} → ${p.lastSeq}`);
}

function loadReset(): void {
  const w = world(), p = hero(w, 'a', { ...newCharacter('warden'), level: 5 });
  w.sim.localPlayer = 'a';
  w.sim.spawn({ creature: 'bx_wolf', level: 5, space: 't', x: 200, y: 0 });
  p.hp = 0; p.dead = true;
  w.sim.resetForLoad();
  const gone = !w.sim.w.players.has(p.id) && w.sim.w.enemies.size === 0;
  const q = hero(w, 'a', { ...newCharacter('huntsman'), level: 5 });
  check(gone && !q.dead && q.hp === q.maxHp && q.def === 'class:huntsman' && q.kit.startWeapon === kitFor('huntsman').startWeapon,
    'load: the old world and the dead hero are dropped; the loaded hero is alive with its own class kit', `gone ${gone}, dead ${q.dead}, def ${q.def}`);
}

function classSwap(): void {
  const w = world(), p = hero(w, 'a', { ...newCharacter('warden'), level: 5 });
  const q = hero(w, 'a', { ...newCharacter('huntsman'), level: 5 }); // same entity, another class (addPlayer reuses it)
  check(p === q && q.def === 'class:huntsman' && q.kit.classId === 'huntsman' && q.school === 'hunt'
    && q.weapon.type === (kitFor('huntsman').weapons[0]), 'load: another class on the same entity re-derives def, school, kit and weapon', `def ${q.def}, kit ${q.kit.classId}, weapon ${q.weapon.type}`);
}

/** The one free respec (BUILDS.md §8): a guest's first reset after the perk tree is free and uses it up; a loadout can't grant it. */
function freeRespec(): void {
  const w = world({ party: 2 });
  hero(w, 'a', { ...newCharacter('warden'), level: 10 });
  const own = { ...newCharacter('warden'), level: 10, gold: 5000, tree: { sk_p1a: 3, up_p0a: 2 }, freeRespec: true };
  w.sim.receive({ type: 'loadout', data: JSON.parse(JSON.stringify(own)) } as never, 'b');
  const g = w.sim.w.players.get('p:b')!;
  const gold0 = g.save.gold;
  w.sim.receive({ type: 'loadout', data: JSON.parse(JSON.stringify({ ...own, tree: {}, freeRespec: false })) } as never, 'b');
  const free = g.save.gold === gold0 && !Object.keys(g.save.tree).length && !g.save.freeRespec;
  w.sim.receive({ type: 'loadout', data: JSON.parse(JSON.stringify({ ...own, tree: { sk_p1a: 1 }, freeRespec: true })) } as never, 'b');
  const regranted = !!g.save.freeRespec;
  w.sim.receive({ type: 'loadout', data: JSON.parse(JSON.stringify({ ...own, tree: {}, freeRespec: false })) } as never, 'b');
  check(free && !regranted && g.save.gold < gold0, 'free respec: the first reset costs nothing and uses it up; a loadout cannot grant it again; the next reset is charged', JSON.stringify({ free, regranted, gold: [gold0, g.save.gold] }));
}

/** Claude 6's sim audit: each finding's repro, now holding. */
function audit(): void {
  // 1. a downed hero under a DoT keeps its downed timer (revivable)
  {
    const w = world({ party: 2 }), a = hero(w, 'a', { ...newCharacter('warden'), level: 10 }), b = hero(w, 'b', { ...newCharacter('warden'), level: 10 }, 30, 0);
    a.spawnProtectUntil = b.spawnProtectUntil = 0;
    w.sim.damage(a.id, 1e9, 'physical');
    const until = a.downed?.until;
    a.statuses.set('bleed', { id: 'bleed', until: w.sim.w.t + 5000, power: 0, sourceId: 'world', dps: 50, kind: 'physical', stacks: 1, nextTick: w.sim.w.t });
    w.run(1500);
    check(!!until && a.downed?.until === until && !a.dead && !!b, 'downed: a DoT ticking on a downed hero does not restart the downed timer (still revivable)', `until ${until} → ${a.downed?.until}`);
  }
  // 2 + 3. a later remote loadout: equipment rules on the authority's own item, tree within the authority's points
  {
    const w = world({ party: 2 });
    hero(w, 'a', newCharacter('warden'));
    const own = { ...newCharacter('reaver'), level: 2 };
    own.inventory.push({ uid: 'spear', base: 'w_spear_wood', ilvl: 1, qty: 1 });
    w.sim.receive({ type: 'loadout', data: JSON.parse(JSON.stringify(own)) } as never, 'b');
    const g = w.sim.w.players.get('p:b')!;
    const forged = JSON.parse(JSON.stringify({ ...own, level: 40, bonusPoints: 60, equipment: { ...own.equipment, main: { uid: 'spear', base: own.equipment.main!.base, ilvl: 1, qty: 1 } }, tree: { sk_p1a: 5, sk_p0a: 5, up_p0a: 5 } }));
    w.sim.receive({ type: 'loadout', data: forged } as never, 'b');
    const ranks = Object.values(g.save.tree).reduce((x, y) => x + y, 0);
    check(g.save.equipment.main?.base !== 'w_spear_wood' && g.save.inventory.some((x) => x.uid === 'spear'), 'remote loadout: a uid naming a weapon the class cannot wield stays in the pack', String(g.save.equipment.main?.base));
    check(g.save.level === 2 && ranks <= 2, `remote loadout: the tree replays within the authority's level 2 (${ranks} ranks), not the claimed L40`, JSON.stringify(g.save.tree));
  }
  // 4. a quest reward into a full pack falls at the hero's feet
  {
    const w = world(), p = hero(w, 'a', newCharacter('warden'));
    while (p.save.inventory.length < 66) p.save.inventory.push({ uid: `f${p.save.inventory.length}`, base: 'w_sword_wood', ilvl: 1, qty: 1 });
    w.sim.questReward({ playerId: 'a', hcItems: [{ item: 'i_ruby', qty: 1 }] });
    check([...w.sim.w.loot.values()].some((l) => l.item?.base === 'i_ruby' && l.lockTo === p.id), 'quest reward into a full pack: dropped at the hero’s feet, held for them');
  }
  // 8 + 9. a remote respawn waits for its timer; the dead buy nothing
  {
    const w = world({ party: 2 }), a = hero(w, 'a', newCharacter('warden'));
    hero(w, 'b', newCharacter('warden'), 400, 0);
    a.dead = true; a.respawnAt = w.sim.w.t + 8000;
    w.sim.receive({ type: 'act', domain: 'systems', action: 'respawn', args: {} } as never, 'a');
    const early = !a.dead;
    const g0 = a.save.gold;
    w.sim.receive({ type: 'act', domain: 'systems', action: 'buy', args: { shop: 'npc:nan-briar', item: 'i_hp_s' } } as never, 'a');
    w.sim.receive({ type: 'act', domain: 'systems', action: 'useItem' } as never, 'a');
    check(!early && a.save.gold === g0, 'a remote respawn before its timer is ignored; a dead hero cannot buy; an act with no args does not throw');
  }
}

/** Trade reach (audit #9b): with the world's npcPos, buying needs the merchant within 96 px in the same space. */
function tradeReach(): void {
  const w = world(), p = hero(w, 'a', { ...newCharacter('warden'), gold: 500 });
  let at = { space: 't', x: 400, y: 0 };
  w.sim.w.ports.npcPos = () => at;
  const buy = () => { const g = p.save.gold; w.sim.receive({ type: 'act', domain: 'systems', action: 'buy', args: { shop: 'npc:nan-briar', item: 'i_hp_s' } } as never, 'a'); return p.save.gold < g; };
  const far = buy();
  at = { space: 't', x: 60, y: 0 };
  const near = buy();
  at = { space: 'elsewhere', x: 0, y: 0 };
  const other = buy();
  w.sim.w.ports.npcPos = () => null;
  const unknown = buy();
  check(!far && near && !other && unknown, 'trade reach: refused 400 px away or in another space, allowed within 96 px, allowed when the position is unknown', JSON.stringify({ far, near, other, unknown }));
}

/** Public-realm plausibility (rules/plausible.ts): honest saves pass, tampered ones fail with a reason. */
function plausibility(): void {
  const honest = { ...newCharacter('warden'), level: 14, gold: 3000, tree: { sk_p1a: 3 } };
  const fresh = newCharacter('arcanist');
  const ok = plausible(honest, { playtimeSec: 4 * 3600 }).ok && plausible(fresh, { playtimeSec: 30 }).ok;
  const bad: [string, CharacterSave, number][] = [
    ['L40 after 3 minutes', { ...honest, level: 40 }, 180],
    ['a million gold at L3', { ...fresh, level: 3, gold: 1e6 }, 3600],
    ['an L40 sword at L5', { ...fresh, level: 5, inventory: [{ uid: 'x', base: 'w_sword_spark', ilvl: 40, qty: 1 }] }, 3600],
    ['more tree ranks than points', { ...fresh, level: 3, tree: { sk_p1a: 5, up_p0a: 5 } }, 3600],
    ['a forged affix', { ...honest, inventory: [{ uid: 'y', base: 'w_sword_iron', ilvl: 14, qty: 1, rarity: 'spark', affixes: [{ id: 'pre_honed', v: 9 }] }] }, 4 * 3600],
    ['an unknown item', { ...honest, inventory: [{ uid: 'z', base: 'i_mint', ilvl: 1, qty: 1 }] }, 4 * 3600],
  ];
  const caught = bad.filter(([, c, t]) => { const r = plausible(c, { playtimeSec: t }); return !r.ok && /verified/.test(r.reason); }).map(([n]) => n);
  check(ok && caught.length === bad.length, `plausible: honest saves pass; ${caught.length}/${bad.length} tampered ones refused`, bad.filter(([n]) => !caught.includes(n)).map(([n]) => n).join(', '));
}

/** Revive (coop-balance): the helper's own damage dealt never blocks it; a hit taken pauses it without resetting. */
function reviveRules(): void {
  const w = world({ party: 2 }), a = hero(w, 'a', { ...newCharacter('warden'), level: 10 }), b = hero(w, 'b', { ...newCharacter('warden'), level: 10 }, 20, 0);
  a.spawnProtectUntil = b.spawnProtectUntil = 0;
  w.sim.damage(a.id, 1e9, 'physical');
  const d = dummy(w, 60, 0);
  // the helper fights while holding F: its damage dealt must not stall the channel
  b.inCombatUntil = w.sim.w.t + 5000;
  w.run(1500, { b: { buttons: Btn.INTERACT, target: d.id } });
  const mid = a.downed?.revive ?? 0;
  b.hurtAt = w.sim.w.t; // a hit taken: the channel pauses
  w.run(300, { b: { buttons: Btn.INTERACT } });
  const paused = a.downed?.revive ?? 0;
  w.run(2000, { b: { buttons: Btn.INTERACT } });
  check(mid > 1000 && paused >= mid && paused - mid < 100 && !a.downed, 'revive: fighting while holding F still channels; a hit pauses (keeps progress); the revive lands', `mid ${Math.round(mid)}, after hit ${Math.round(paused)}, revived ${!a.downed}`);
}

export function lifecycleChecks(): void {
  reviveRules();
  plausibility();
  tradeReach();
  audit();
  freeRespec();
  inputRestart();
  loadReset();
  classSwap();
}
