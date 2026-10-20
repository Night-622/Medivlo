/**
 * Headless co-op / PvP rules test (Claude 3, HOLLOW_CROWN.md §6). Run: node tools/e2e/sim/run.mjs coop
 */
import { Btn, type InputFrame, type RealmRule } from '@/net/types';
import { newCharacter } from '@/systems/rules/character';
import { creature, creatureStats } from '@/systems/rules/creatures';
import { Sim } from '@/systems/sim/Sim';
import type { SimPorts, ZoneRule } from '@/systems/sim/world';

let fails = 0;
const check = (ok: boolean, what: string) => { console.log(ok ? 'ok  ' : 'FAIL', what); if (!ok) fails++; };

function world(rule: RealmRule, party: number, zone: ZoneRule = 'wild') {
  const events: { name: string; p: unknown }[] = [];
  const ports: SimPorts = {
    move: (_s, x, y, dx, dy) => ({ x: x + dx, y: y + dy }), clear: () => true, zoneRule: () => zone,
    respawnPoint: () => ({ space: 't', x: 0, y: 0 }), emit: (name, p) => events.push({ name, p }),
    partySize: () => party, realmRule: () => rule,
  };
  const sim = new Sim(ports, 11);
  const a = sim.addPlayer('a', { ...newCharacter('warden'), gold: 100 }, { space: 't', x: 0, y: 0 });
  const b = party > 1 ? sim.addPlayer('b', { ...newCharacter('cantor'), gold: 100 }, { space: 't', x: 30, y: 0 }) : null;
  let seq = 0;
  const step = (ms: number, input: Record<string, Partial<InputFrame>> = {}) => {
    for (let t = 0; t < ms; t += 1000 / 30) {
      const m = new Map(Object.entries(input).map(([pid, f]) => [pid, [{ seq: ++seq, t: 0, move: { x: 0, y: 0 }, aim: { x: 0, y: 0 }, buttons: 0, target: null, ...f } as InputFrame]]));
      sim.step(1000 / 30, seq, m);
    }
  };
  return { sim, a, b, events, step, count: (n: string) => events.filter((e) => e.name === n).length };
}

// ── party scaling
{
  const d = creature('bx_wolf')!;
  const solo = creatureStats(d, 10, 1).hp, duo = creatureStats(d, 10, 2).hp, boss1 = creatureStats(creature('bx_stag')!, 10, 1).hp, boss4 = creatureStats(creature('bx_stag')!, 10, 4).hp;
  check(Math.abs(duo / solo - 1.4) < 0.01, `enemy HP ×1.4 for 2 players (${solo} → ${duo})`);
  check(Math.abs(boss4 / boss1 - 2.5) < 0.01, `boss HP ×2.5 for 4 players (${boss1} → ${boss4})`);
}

// ── downed, revive by holding F, then wipe
{
  const w = world('peaceful', 2);
  w.sim.damage(w.a.id, 99999, 'physical');
  check(!!w.a.downed && !w.a.dead, 'player at 0 HP with a standing ally is downed');
  check(w.count('player:downed') === 1, 'player:downed emitted');
  w.step(3200, { b: { buttons: Btn.INTERACT } });
  check(!w.a.downed && w.a.hp > 0, `held F for 3 s revives (hp ${Math.round(w.a.hp)}/${w.a.maxHp})`);
  check(w.count('player:revived') === 1, 'player:revived emitted');
  w.sim.damage(w.a.id, 99999, 'physical');
  w.sim.damage(w.b!.id, 99999, 'physical');
  check(w.count('party:wiped') === 1 && w.a.dead && w.b!.dead, 'everyone down → party:wiped');
  check(w.a.save.gold === 90 && w.b!.save.gold === 90, `wipe costs 10% Embershards (${w.a.save.gold}, ${w.b!.save.gold})`);
  w.step(8500);
  check(!w.a.dead && !w.b!.dead && w.a.hp === w.a.maxHp, 'co-op wipe auto-respawns at the waystone after 8 s');
}

// ── solo death waits for the Death screen
{
  const w = world('peaceful', 1);
  w.sim.damage(w.a.id, 99999, 'physical');
  check(w.a.dead && w.count('player:died') === 1, 'solo: dead, player:died');
  w.step(20000);
  check(w.a.dead, 'solo: stays dead until respawn is chosen');
  w.sim.receive({ type: 'act', domain: 'systems', action: 'respawn', args: {} }, 'a');
  check(!w.a.dead, 'act respawn brings the hero back');
}

// ── shared drops ×2 for two players
{
  let solo = 0, duo = 0;
  for (let i = 0; i < 20; i++) {
    const w1 = world('peaceful', 1); const e1 = w1.sim.spawn({ creature: 'bx_alpha', level: 5, space: 't', x: 50, y: 0 }); w1.sim.damage(e1, 1e9, 'physical', w1.a.id); solo += w1.sim.w.loot.size;
    const w2 = world('peaceful', 2); const e2 = w2.sim.spawn({ creature: 'bx_alpha', level: 5, space: 't', x: 50, y: 0 }); w2.sim.damage(e2, 1e9, 'physical', w2.a.id); duo += w2.sim.w.loot.size;
  }
  check(duo > solo * 1.7, `two players get about double the drops (${solo} → ${duo} over 20 kills)`);
}

// ── PvP by realm rule
for (const [rule, zone, expect] of [['peaceful', 'wild', false], ['duels', 'wild', false], ['arena', 'wild', false], ['arena', 'arena', true], ['ffa', 'wild', true], ['ffa', 'safe', false]] as const) {
  const w = world(rule, 2, zone);
  w.a.spawnProtectUntil = 0; w.b!.spawnProtectUntil = 0;
  check(w.sim.w.hostile(w.a, w.b!) === expect, `${rule} in ${zone}: PvP ${expect ? 'on' : 'off'}`);
}
{
  const w = world('duels', 2);
  w.a.spawnProtectUntil = 0; w.b!.spawnProtectUntil = 0;
  w.sim.receive({ type: 'duel', target: 'b' }, 'a');
  w.sim.receive({ type: 'duel', target: 'a', accept: true }, 'b');
  check(w.sim.w.hostile(w.a, w.b!), 'duel accepted → PvP between the two');
  w.b!.hp = 5;
  w.sim.damage(w.b!.id, 999, 'physical', w.a.id);
  check(!w.b!.dead && w.b!.hp === 1 && !w.sim.w.hostile(w.a, w.b!), 'losing a duel leaves 1 HP and ends it');
}
{
  const w = world('ffa', 2);
  w.a.spawnProtectUntil = 0; w.b!.spawnProtectUntil = 0;
  // PvP hit cap (sim/combat.ts): no single player hit takes more than 30% of max health, so no one-shot from full
  w.sim.damage(w.b!.id, 99999, 'physical', w.a.id);
  check(!w.b!.dead && w.b!.hp >= w.b!.maxHp * 0.69, `PvP hit cap: a huge hit from full leaves ≥ 70% (${Math.round(w.b!.hp)}/${w.b!.maxHp})`);
  w.b!.hp = 5;
  w.sim.damage(w.b!.id, 99999, 'physical', w.a.id);
  const pile = [...w.sim.w.loot.values()].find((l) => l.gold);
  check(w.b!.dead && !w.b!.downed, 'free-for-all PvP death: no downed state');
  check(!!pile && pile.gold === 20 && pile.lockTo === w.a.id && w.b!.save.gold === 80, `20% of gold drops, locked to the killer (${pile?.gold})`);
  check(w.count('pvp:kill') === 1, 'pvp:kill emitted');
}
console.log(fails ? `FAIL ${fails}` : 'OK');

// ── yield → spare (despawn) still pays loot; destroy pays loot once; XP granted once at the yield
{
  for (const fate of ['spare', 'destroy'] as const) {
    const w = world('peaceful', 1);
    const id = w.sim.spawn({ creature: 'cb_provost-morrow', level: 12, space: 't', x: 40, y: 0 });
    const xp0 = w.a.save.xp + w.a.save.level * 1e6;
    w.sim.damage(id, 1e9, 'ash', w.a.id);
    const e = w.sim.w.enemies.get(id)!;
    check(e.yielded && !e.dead && e.hp === 1, `${fate}: nemesis yields at 1 HP`);
    const xp1 = w.a.save.xp + w.a.save.level * 1e6;
    check(xp1 > xp0, `${fate}: XP granted at the yield`);
    w.sim.damage(id, 1e9, 'ash', w.a.id);
    check(!e.dead, `${fate}: player hits cannot finish a yielded boss`);
    if (fate === 'spare') w.sim.despawn(id); else w.sim.damage(id, 1, 'umbral');
    const xp2 = w.a.save.xp + w.a.save.level * 1e6;
    check(w.sim.w.loot.size > 0, `${fate}: loot dropped (${w.sim.w.loot.size} piles)`);
    check(xp2 === xp1, `${fate}: no second XP grant`);
    check(fate === 'spare' ? w.count('enemy:killed') === 0 : w.count('enemy:killed') === 1, `${fate}: enemy:killed ${fate === 'spare' ? 'not ' : ''}emitted`);
  }
  console.log(fails ? `FAIL ${fails}` : 'OK (yield)');
}

// ── the Hollow King yields (endings decide); despawn still pays loot incl. his legendary
{
  const w = world('peaceful', 1);
  const id = w.sim.spawn({ creature: 'bx_hollowking', level: 40, space: 't', x: 40, y: 0 });
  w.sim.damage(id, 1e12, 'radiance', w.a.id);
  const e = w.sim.w.enemies.get(id)!;
  check(e.yielded && !e.dead && w.count('enemy:yielded') === 1, 'Hollow King yields at 1 HP');
  w.sim.despawn(id);
  check([...w.sim.w.loot.values()].some((l) => l.item?.base === 'lg_hollowking'), 'despawn after yield drops the Hollow King legendary');
  const c5 = w.sim.spawn({ creature: 'bx_concord_5', level: 40, space: 't', x: 40, y: 0 });
  w.sim.damage(c5, 1e12, 'radiance', w.a.id);
  check(!w.sim.w.enemies.get(c5) || w.sim.w.enemies.get(c5)!.dead, 'the Black Concord dies normally');
  console.log(fails ? `FAIL ${fails}` : 'OK (hollow king)');
}

// ── Settings.autoLootGold off: Embershards wait for F
{
  const w = world('peaceful', 1);
  (w.a.save as { prefs?: { autoLootGold: boolean } }).prefs = { autoLootGold: false };
  w.sim.w.loot.set('loot:t', { id: 'loot:t', space: 't', x: 5, y: 0, gold: 50, expiresAt: 1e12 });
  const g0 = w.a.save.gold;
  w.step(500);
  check(w.a.save.gold === g0 && w.sim.w.loot.has('loot:t'), 'autoLootGold off: walking over gold does not take it');
  w.step(200, { a: { buttons: Btn.INTERACT } });
  check(w.a.save.gold === g0 + 50, 'holding F picks it up');
  console.log(fails ? `FAIL ${fails}` : 'OK (autoLootGold)');
}

// ── co-op join: a guest appears beside the host, not at its own waystone
{
  const events: unknown[] = [];
  const ports: SimPorts = {
    move: (_s, x, y, dx, dy) => ({ x: x + dx, y: y + dy }), clear: () => true, zoneRule: () => 'wild',
    respawnPoint: (pid) => (pid === 'host' ? { space: 'realm:ash', x: 100, y: 100 } : { space: 'realm:rime', x: 9000, y: 9000 }),
    emit: (n, p) => events.push([n, p]), partySize: () => 2, realmRule: () => 'peaceful',
  };
  const s = new Sim(ports, 3);
  s.localPlayer = 'host';
  s.receive({ type: 'loadout', data: newCharacter('arcanist') as never }, 'host');
  const h = s.w.players.get('p:host')!;
  s.teleport('host', 'realm:ash', 640, 480);
  s.receive({ type: 'loadout', data: newCharacter('warden') as never }, 'guest');
  const g = s.w.players.get('p:guest')!;
  check(g.space === 'realm:ash' && Math.hypot(g.x - h.x, g.y - h.y) < 40, `guest joins beside the host (${g.space} ${Math.round(g.x)},${Math.round(g.y)})`);
  const pub = new Sim(ports, 4);
  pub.receive({ type: 'loadout', data: newCharacter('warden') as never }, 'stranger');
  check(pub.w.players.get('p:stranger')!.space === 'realm:rime', 'no host (public realm): the world respawn point decides');
  console.log(fails ? `FAIL ${fails}` : 'OK (join)');
}

// ── duel notifications and guards
{
  const w = world('duels', 2);
  w.a.spawnProtectUntil = 0; w.b!.spawnProtectUntil = 0;
  const has = (n: string) => w.events.some((e) => e.name === n);
  w.sim.receive({ type: 'duel', target: 'a' }, 'a');
  check(!has('duel:asked'), 'a challenge to yourself is ignored');
  w.sim.receive({ type: 'duel', target: 'b' }, 'a');
  check(w.events.some((e) => e.name === 'duel:asked' && JSON.stringify(e.p) === '{"from":"a","to":"b"}'), 'duel:asked { from, to } emitted');
  w.step(31_000);
  w.sim.receive({ type: 'duel', target: 'a', accept: true }, 'b');
  check(!has('duel:started') && !w.sim.w.hostile(w.a, w.b!), 'an ask older than 30 s cannot be accepted');
  w.sim.receive({ type: 'duel', target: 'b' }, 'a');
  w.sim.receive({ type: 'duel', target: 'a', accept: true }, 'b');
  check(has('duel:started') && w.sim.w.hostile(w.a, w.b!), 'fresh ask + accept → duel:started and PvP on');
  w.sim.receive({ type: 'duel', target: 'a' }, 'b');
  check(w.events.filter((e) => e.name === 'duel:asked').length === 2, 'no new challenges while already duelling');
  w.b!.hp = 5;
  w.sim.damage(w.b!.id, 999, 'physical', w.a.id);
  check(w.events.some((e) => e.name === 'duel:ended' && JSON.stringify(e.p) === '{"winner":"a","loser":"b"}'), 'duel:ended { winner, loser } on the decisive hit');
  w.sim.receive({ type: 'duel', target: 'b' }, 'a');
  w.sim.receive({ type: 'duel', target: 'a', accept: true }, 'b');
  w.sim.removePlayer('b');
  check(w.events.filter((e) => e.name === 'duel:ended').length === 2 && !w.a.duelWith, 'a duellist who leaves forfeits');
  console.log(fails ? `FAIL ${fails}` : 'OK (duels)');
}

// ── nobody spawns on top of anybody: realm arrivals and wipe respawns fan out
{
  const ports: SimPorts = {
    move: (_s, x, y, dx, dy) => ({ x: x + dx, y: y + dy }), clear: () => true, zoneRule: () => 'wild',
    respawnPoint: () => ({ space: 'square', x: 500, y: 500 }), emit: () => {}, partySize: () => 4, realmRule: () => 'peaceful',
  };
  const s = new Sim(ports, 8);
  for (const id of ['p1', 'p2', 'p3', 'p4']) s.receive({ type: 'loadout', data: newCharacter('warden') as never }, id);
  const ps = [...s.w.players.values()];
  const minGap = Math.min(...ps.flatMap((a, i) => ps.slice(i + 1).map((b) => Math.hypot(a.x - b.x, a.y - b.y))));
  check(minGap >= 26, `4 realm arrivals at one waystone are spread out (closest pair ${Math.round(minGap)} px)`);
  for (const p of ps) s.damage(p.id, 1e9, 'physical');
  for (let i = 0; i < 300; i++) s.step(1000 / 30, i, new Map());
  const after = [...s.w.players.values()];
  const gap2 = Math.min(...after.flatMap((a, i) => after.slice(i + 1).map((b) => Math.hypot(a.x - b.x, a.y - b.y))));
  check(after.every((p) => !p.dead) && gap2 >= 26, `a party wipe respawns fanned out at the waystone (closest ${Math.round(gap2)} px)`);
  console.log(fails ? `FAIL ${fails}` : 'OK (spread)');
}

// ── a hero's death costs time, not progress: bosses keep their wounds and do not walk home to heal
{
  const w = world('peaceful', 1);
  const id = w.sim.spawn({ creature: 'cb_brand-mother', level: 10, space: 't', x: 60, y: 0 });
  const boss = w.sim.w.enemies.get(id)!;
  w.sim.damage(id, Math.round(boss.maxHp * 0.6), 'physical', w.a.id);
  const wounded = boss.hp;
  w.sim.damage(w.a.id, 1e9, 'physical', id);
  w.step(15_000);
  check(boss.hp === wounded, `boss HP held at ${wounded}/${boss.maxHp} after the hero died (now ${boss.hp})`);
  const e = w.sim.spawn({ creature: 'bx_wolf', level: 5, space: 't', x: 60, y: 0 });
  const wolf = w.sim.w.enemies.get(e)!;
  w.sim.damage(e, Math.round(wolf.maxHp * 0.5), 'physical', w.a.id);
  w.a.x = 5000; w.step(20_000);
  check(wolf.dead || wolf.hp === wolf.maxHp || wolf.ai === 'idle', 'ordinary creatures still reset when left alone');
  console.log(fails ? `FAIL ${fails}` : 'OK (boss memory)');
}

// ── escorts (Claude 4's escort / arrive objectives)
{
  const w = world('peaceful', 2);
  const id = w.sim.spawn({ creature: 'bx_escort', level: 8, space: 't', x: 0, y: 40, follow: 'party', escort: { npc: 'npc:bram', toMarker: { space: 't', x: 600, y: 0, r: 60 } } });
  const esc = w.sim.w.enemies.get(id)!;
  check(!!esc?.escort && esc.team === 'players', 'escort spawns allied');
  // the party walks east; the escort keeps up
  w.a.x = 300; w.b!.x = 320; w.step(5000);
  check(Math.hypot(esc.x - 300, esc.y) < 120, `escort follows the party (at ${Math.round(esc.x)},${Math.round(esc.y)})`);
  // doors: the leader changes space, the escort comes along
  w.a.space = 'inst:x'; w.b!.space = 'inst:x'; w.a.x = 10; w.b!.x = 20; w.step(200);
  check(esc.space === 'inst:x', 'escort follows through a door');
  // enemies notice it: one that hunts escorts targets it
  const wolf = w.sim.spawn({ creature: 'bx_wolf', level: 8, space: 'inst:x', x: esc.x + 40, y: esc.y });
  const wf = w.sim.w.enemies.get(wolf)!;
  wf.huntsEscort = true; wf.threat.set(w.a.id, 10); wf.ai = 'engage';
  w.step(600);
  check((wf.threat.get(id) ?? 0) > 10, 'a hunting creature weighs the escort above the hero');
  w.sim.despawn(wolf);
  // down, revive with F, down again with no revives left → lost
  w.sim.damage(id, esc.maxHp * 5, 'physical', wolf);
  check(!!esc.escort!.down && !esc.dead && w.count('escort:downed') === 1, 'escort goes down at 0 HP (revivable)');
  w.a.x = esc.x + 10; w.a.y = esc.y; w.a.inCombatUntil = 0;
  w.step(3400, { a: { buttons: Btn.INTERACT } });
  check(!esc.escort!.down && esc.hp > esc.maxHp * 0.4, `holding F revives it (hp ${Math.round(esc.hp)}/${esc.maxHp})`);
  w.sim.damage(id, esc.maxHp * 5, 'physical', wolf);
  check(esc.dead && w.count('escort:lost') === 1, 'a second fall with no revives left loses it');
  // a fresh escort arrives
  const id2 = w.sim.spawn({ creature: 'bx_escort', level: 8, space: 't', x: 0, y: 0, follow: 'a', escort: { npc: 'npc:bram', toMarker: { space: 't', x: 200, y: 0, r: 60 } } });
  w.a.space = 't'; w.a.x = 220; w.a.y = 0;
  w.step(5000);
  const arr = w.events.filter((e) => e.name === 'escort:arrived');
  check(arr.length === 1 && (arr[0].p as { id: string }).id === id2, 'escort:arrived once at the marker');
  w.sim.despawn(id2);
  check(w.count('escort:lost') === 1, 'despawning after arrival is not a loss');
  console.log(fails ? `FAIL ${fails}` : 'OK (escort)');
}

// ── escort pathing: a wall between escort and leader → it follows the world's A* around it
{
  // wall: x in [90, 110], y < 150; the gap is below it
  const wall = (x: number, y: number) => x > 90 && x < 110 && y < 150;
  let plans = 0;
  const ports: SimPorts = {
    move: (_s, x, y, dx, dy) => (wall(x + dx, y + dy) ? { x, y } : { x: x + dx, y: y + dy }),
    clear: (_s, x0, y0, x1, y1) => { for (let i = 0; i <= 20; i++) if (wall(x0 + ((x1 - x0) * i) / 20, y0 + ((y1 - y0) * i) / 20)) return false; return true; },
    zoneRule: () => 'wild', respawnPoint: () => ({ space: 't', x: 0, y: 0 }), emit: () => undefined, partySize: () => 1, realmRule: () => 'peaceful',
    path: (_s, x0, y0, x1, y1) => { plans++; return [{ x: x0, y: y0 }, { x: 60, y: 200 }, { x: 140, y: 200 }, { x: x1, y: y1 }]; },
  };
  const sim = new Sim(ports, 5);
  const a = sim.addPlayer('a', newCharacter('warden'), { space: 't', x: 200, y: 0 });
  const id = sim.spawn({ creature: 'bx_escort', level: 5, space: 't', x: 0, y: 0, follow: 'a', escort: {} });
  const esc = sim.w.enemies.get(id)!;
  for (let i = 1; i <= 30 * 12; i++) sim.step(1000 / 30, i, new Map());
  check(plans > 0 && esc.x > 110 && Math.hypot(esc.x - a.x, esc.y - a.y) < 120, `escort paths around a wall to its leader (planned ${plans}×, at ${Math.round(esc.x)},${Math.round(esc.y)})`);
  console.log(fails ? `FAIL ${fails}` : 'OK (escort pathing)');
}
