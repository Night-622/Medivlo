/**
 * Hero lifecycle across world restarts and loads (Claude 3; Claude 6's integrity findings): a new input stream after
 * a door / reload is accepted; a load drops the old world and a dead hero; loading another class re-derives the kit.
 */
import { kitFor } from '@/data/classes/hc/kits';
import { newCharacter } from '@/systems/rules/character';
import { check, DT, hero, world } from './features-harness';

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

export function lifecycleChecks(): void {
  inputRestart();
  loadReset();
  classSwap();
}
