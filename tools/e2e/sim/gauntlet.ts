/**
 * Lair gauntlet (Claude 3): one hero through lairWaves() rooms with HP carried between waves (attrition), played by
 * Claude 2's playthrough Fighter, 5 potions + natural drops, gear at its level and the tree spent. Counts deaths
 * (respawn at the room, the wave stays) and what killed it. Survivability by class:
 *   node tools/e2e/sim/run.mjs gauntlet <realm> <level> [class|all] [rooms=6] [seeds=2]
 */
import { HC_CLASSES } from '@/data/classes/hc/classes.gen';
import { kitFor } from '@/data/classes/hc/kits';
import { HC_PIECES } from '@/data/items/hc/armour.gen';
import { newCharacter, availablePoints } from '@/systems/rules/character';
import { allNodes, canLearn } from '@/systems/rules/tree';
import { unlockLevel } from '@/systems/rules/curves';
import { lairWaves } from '@/systems/rules/encounters';
import { Sim } from '@/systems/sim/Sim';
import type { SimPorts } from '@/systems/sim/world';
import type { InputFrame } from '@/net/types';
import { Fighter } from '../../playthrough/fighter';

const [realm, lv, only, roomsArg, seedsArg] = process.argv.slice(3);
const L = Number(lv), ROOMS = Number(roomsArg ?? 6), SEEDS = Number(seedsArg ?? 2);
const MATS = ['wood', 'iron', 'steel', 'ember', 'rime', 'storm', 'umbral', 'spark'], STYLES = ['cloth', 'leather', 'fur', 'mail', 'robe', 'scale', 'plate', 'vestment'];

function hero(cls: string) {
  const save = newCharacter(cls); save.level = L;
  const school = HC_CLASSES.find((c) => c.id === cls)!.school;
  const tier = Math.max(0, ...[0, 1, 2, 3, 4, 5, 6, 7].filter((i) => L >= unlockLevel(i)));
  save.equipment.main = { uid: 'w', base: `w_${kitFor(cls).weapons[0]}_${MATS[Math.max(0, tier - 1)]}`, ilvl: L, qty: 1 };
  for (const piece of ['helm', 'chest', 'hands', 'feet'] as const) { const pc = HC_PIECES.find((p) => p.set === `${school}_${STYLES[Math.max(0, tier - 1)]}` && p.piece === piece)!; save.equipment[pc.slot] = { uid: pc.id, base: pc.id, ilvl: L, qty: 1 }; }
  save.inventory = save.inventory.filter((i) => !i.base.startsWith('i_hp'));
  save.inventory.push({ uid: 'pots', base: 'i_hp_s', ilvl: 1, qty: 5 });
  for (let g = 0; g < 200 && availablePoints(save) > 0; g++) { const n = allNodes(cls).find((x) => canLearn(cls, x.id, save.tree, availablePoints(save)).ok); if (!n) break; save.tree[n.id] = (save.tree[n.id] ?? 0) + 1; }
  return save;
}

function run(cls: string, seed: number) {
  const killers: Record<string, number> = {};
  let selfHp = 0;
  const taken: Record<string, number> = {};
  let sim: Sim | undefined;
  const ports: SimPorts = {
    move: (_s, x, y, dx, dy) => ({ x: Math.max(-600, Math.min(600, x + dx)), y: Math.max(-600, Math.min(600, y + dy)) }),
    clear: () => true, zoneRule: () => 'wild', respawnPoint: () => ({ space: 'lair', x: 0, y: 200 }),
    emit: (name, p) => {
      if (name === 'player:damaged') { const d = p as { amount: number; sourceId: string }; const e = sim?.w.enemies.get(d.sourceId); const k = !d.sourceId || d.sourceId === 'p:me' ? 'self/thorns' : e ? (e.elite?.length ? 'elite' : e.tier) : 'other'; taken[k] = (taken[k] ?? 0) + d.amount; }
      if (name === 'player:died') { const k = String((p as { killer?: string; by?: string }).killer ?? (p as { by?: string }).by ?? '?'); killers[k] = (killers[k] ?? 0) + 1; }
    },
    partySize: () => 1, realmRule: () => 'peaceful',
  };
  sim = new Sim(ports, seed);
  const p = sim.addPlayer('me', hero(cls), { space: 'lair', x: 0, y: 200 });
  const fighter = new Fighter(() => sim, 'me');
  const DT = 1000 / 30;
  let deaths = 0, wasDead = false, seq = 0, tick = 0, diedAt = 0;
  const waves = lairWaves(realm, L, ROOMS, 1, seed).flatMap((r) => r.waves);
  for (const wave of waves) {
    const ids = wave.map((s, i) => sim.spawn({ creature: s.creature, level: s.level, tier: s.tier, elite: s.elite, space: 'lair', x: -120 + (i % 4) * 80, y: -100 - Math.floor(i / 4) * 50 }));
    for (let t = 0; t < 30 * 240; t++, tick++) {
      if (ids.every((id) => { const e = sim.w.enemies.get(id); return !e || e.dead; })) break;
      if (p.dead && !wasDead) { deaths++; diedAt = sim.w.t; if (process.env.ELITES) console.log('  died near', [...sim.w.enemies.values()].filter((x) => !x.dead && x.elite?.length).map((x) => `${x.def}[${x.elite}] ${Math.round(x.hp)}/${x.maxHp}`).join(', ')); }
      wasDead = p.dead;
      let f: InputFrame;
      // a solo wipe waits for the Death screen: press Respawn after 3 s
      if (p.dead) { if (sim.w.t >= diedAt + 3000) sim.receive({ type: 'act', domain: 'systems', action: 'respawn', args: {} }, 'me'); f = { seq: ++seq, t: tick * DT, move: { x: 0, y: 0 }, aim: { x: p.x, y: p.y }, buttons: 0, target: null }; }
      else if (!fighter.engaged(p)) { const e = [...sim.w.enemies.values()].find((x) => !x.dead && x.team === 'enemies'); const d = e ? Math.hypot(e.x - p.x, e.y - p.y) || 1 : 1; f = { seq: ++seq, t: tick * DT, move: e ? { x: (e.x - p.x) / d, y: (e.y - p.y) / d } : { x: 0, y: 0 }, aim: { x: p.x, y: p.y }, buttons: 0, target: null }; }
      else f = { seq: ++seq, t: tick * DT, ...fighter.frame(p, tick) } as InputFrame;
      if (process.env.DEBUG && tick % 900 === 0) console.log(`  t=${Math.round(tick / 30)}s dead=${p.dead} downed=${!!p.downed} hp=${Math.round(p.hp)} pos=${Math.round(p.x)},${Math.round(p.y)} foes=${ids.map((id) => { const e = sim!.w.enemies.get(id); return e && !e.dead ? `${e.def}:${Math.round(e.hp)}:${e.ai}:${Math.round(e.x)},${Math.round(e.y)}` : ''; }).filter(Boolean).join(' ')}`);
      const hp0 = p.hp;
      sim.step(DT, tick, new Map([['me', [f]]]));
      void hp0;
    }
    // walk to the next room: a few seconds of regen, like a real lair
    for (let t = 0; t < 30 * 4; t++, tick++) sim.step(DT, tick, new Map([['me', [{ seq: ++seq, t: tick * DT, move: { x: 0, y: 0 }, aim: { x: p.x, y: p.y }, buttons: 0, target: null }]]]));
  }
  void selfHp;
  const pots = p.save.inventory.filter((i) => i.base.startsWith('i_hp')).reduce((a, i) => a + i.qty, 0);
  return { deaths, mins: Math.round(tick / 30 / 6) / 10, pots, killers, taken };
}

for (const c of HC_CLASSES.filter((x) => !only || only === 'all' || x.id === only)) {
  const rs = Array.from({ length: SEEDS }, (_, i) => run(c.id, 3 + i));
  console.log(`${c.id.padEnd(12)} ${realm} L${L} ${ROOMS} rooms ×${SEEDS}: deaths ${rs.map((r) => r.deaths).join('/')}  min ${rs.map((r) => r.mins).join('/')}  pots left ${rs.map((r) => r.pots).join('/')}  killers ${JSON.stringify(rs[rs.length - 1].killers)}  taken ${JSON.stringify(Object.fromEntries(Object.entries(rs[0].taken).map(([k, v]) => [k, Math.round(v)])))}`);
}
