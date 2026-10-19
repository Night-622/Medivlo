/**
 * Arena repro (Claude 3): a boss room as the world builds it, played by Claude 2's playthrough Fighter.
 * HC_HAZARDS stones are solid 32 px tiles (like instanceGen's art) on a ring; the hero respawns at the door and walks
 * back after each death, the boss keeps its wounds. Reports lives, boss HP per life, anchor stuns and causes.
 *   node tools/e2e/sim/run.mjs arena <boss> <bossLevel> <class> <heroLevel> [minutes=30]
 */
import { HC_HAZARDS } from '@/data/enemies/hc/hazards';
import { HC_CLASSES } from '@/data/classes/hc/classes.gen';
import { kitFor } from '@/data/classes/hc/kits';
import { HC_PIECES } from '@/data/items/hc/armour.gen';
import { newCharacter, availablePoints } from '@/systems/rules/character';
import { allNodes, canLearn } from '@/systems/rules/tree';
import { unlockLevel } from '@/systems/rules/curves';
import { Sim } from '@/systems/sim/Sim';
import type { SimPorts } from '@/systems/sim/world';
import type { InputFrame } from '@/net/types';
import { Fighter } from '../../playthrough/fighter';

const [boss, bl, cls, hl, mins] = process.argv.slice(3);
const T = 32, ROOM = 14 * T; // 28×28-tile arena centred on 0,0
const stones: [number, number][] = [];
const solid = (x: number, y: number) => Math.abs(x) > ROOM || Math.abs(y) > ROOM || stones.some(([tx, ty]) => Math.floor(x / T) === tx && Math.floor(y / T) === ty);
const boxBlocked = (x: number, y: number, w: number, h: number) => solid(x - w / 2, y - h / 2) || solid(x + w / 2, y - h / 2) || solid(x - w / 2, y + h / 2) || solid(x + w / 2, y + h / 2);
const events: Record<string, number> = {};
const deaths: string[] = [];
const ports: SimPorts = {
  move: (_s, x, y, dx, dy, r) => {
    const w = r * 1.6, h = r * 1.2;
    const n = Math.max(1, Math.ceil(Math.max(Math.abs(dx), Math.abs(dy)) / 4));
    for (let i = 0; i < n; i++) { if (!boxBlocked(x + dx / n, y, w, h)) x += dx / n; if (!boxBlocked(x, y + dy / n, w, h)) y += dy / n; }
    return { x, y };
  },
  clear: () => true, zoneRule: () => 'wild', respawnPoint: () => ({ space: 'arena', x: 0, y: ROOM - 40 }),
  emit: (name, p) => {
    if (name === 'ability:cast') { const a = (p as { ability: string }).ability; if (a.startsWith('hazard')) events[a] = (events[a] ?? 0) + 1; }
    if (name === 'player:died') deaths.push(JSON.stringify(p).slice(0, 160));
  },
  partySize: () => 1, realmRule: () => 'peaceful',
};
const sim = new Sim(ports, 5);
const save = newCharacter(cls); save.level = Number(hl);
const school = HC_CLASSES.find((c) => c.id === cls)!.school;
const tier = Math.max(0, ...[0, 1, 2, 3, 4, 5, 6, 7].filter((i) => save.level >= unlockLevel(i)));
save.equipment.main = { uid: 'w', base: `w_${kitFor(cls).weapons[0]}_${['wood', 'iron', 'steel', 'ember', 'rime', 'storm', 'umbral', 'spark'][Math.max(0, tier - 1)]}`, ilvl: save.level, qty: 1 };
const style = ['cloth', 'leather', 'fur', 'mail', 'robe', 'scale', 'plate', 'vestment'][Math.max(0, tier - 1)];
for (const piece of ['helm', 'chest', 'hands', 'feet'] as const) { const pc = HC_PIECES.find((p) => p.set === `${school}_${style}` && p.piece === piece)!; save.equipment[pc.slot] = { uid: pc.id, base: pc.id, ilvl: save.level, qty: 1 }; }
save.inventory.push({ uid: 'pots', base: 'i_hp_s', ilvl: 1, qty: 20 });
for (let g = 0; g < 200 && availablePoints(save) > 0; g++) { const n = allNodes(cls).find((x) => canLearn(cls, x.id, save.tree, availablePoints(save)).ok); if (!n) break; save.tree[n.id] = (save.tree[n.id] ?? 0) + 1; }
const p = sim.addPlayer('me', save, { space: 'arena', x: 0, y: ROOM - 40 });
const bid = sim.spawn({ creature: boss, level: Number(bl), space: 'arena', x: 0, y: -60 });
// hazards on a ring at ~60% of the arena, skipping the entry wedge (instanceGen.hazards)
const list = HC_HAZARDS[boss] ?? [];
const total = list.reduce((n, h) => n + h.count, 0);
let k = 0;
for (const h of list) for (let i = 0; i < h.count; i++, k++) {
  const a = Math.PI / 2 + Math.PI / 6 + ((k + 0.5) / total) * (Math.PI * 2 - Math.PI / 3);
  const tx = Math.round((Math.cos(a) * 28 * 0.3)), ty = Math.round((Math.sin(a) * 28 * 0.3));
  if (h.kind === 'anchor' || h.kind === 'pillar') stones.push([tx, ty]);
  sim.addHazard({ id: `hz:${k}`, space: 'arena', x: tx * T + T / 2, y: ty * T + T / 2, r: h.r ?? 40, kind: h.kind, ...(h.charges !== undefined ? { charges: h.charges } : {}) });
}
const fighter = new Fighter(() => sim, 'me');
const e = () => sim.w.enemies.get(bid)!;
const hpAtDeath: number[] = [];
let lastDead = false, seq = 0;
const DT = 1000 / 30;
for (let tick = 1; tick <= 30 * 60 * Number(mins ?? 30); tick++) {
  const b = e();
  if (!b || b.dead || b.yielded) { console.log(`WIN after ${Math.round(tick / 30)}s, ${hpAtDeath.length} deaths`); break; }
  if (p.dead && !lastDead) hpAtDeath.push(Math.round(b.hp));
  lastDead = p.dead;
  let frame: InputFrame;
  if (p.dead) { if (sim.w.t >= p.respawnAt) sim.receive({ type: 'act', domain: 'systems', action: 'respawn', args: {} }, 'me'); frame = { seq: ++seq, t: tick * DT, move: { x: 0, y: 0 }, aim: { x: p.x, y: p.y }, buttons: 0, target: null }; }
  else if (!fighter.engaged(p)) { const d = Math.hypot(b.x - p.x, b.y - p.y) || 1; frame = { seq: ++seq, t: tick * DT, move: { x: (b.x - p.x) / d, y: (b.y - p.y) / d }, aim: { x: b.x, y: b.y }, buttons: 0, target: null }; }
  else { const f = fighter.frame(p, tick); if (f.hazard) sim.receive({ type: 'act', domain: 'systems', action: 'hazard', args: { id: f.hazard } }, 'me'); frame = { seq: ++seq, t: tick * DT, ...f } as InputFrame; }
  sim.step(DT, tick, new Map([['me', [frame]]]));
  if (process.env.DEBUG && tick % 300 === 0) console.log(`t=${tick / 30}s boss ${Math.round(b.hp)}/${b.maxHp} ph${b.phase} ai=${b.ai} d=${Math.round(Math.hypot(b.x - p.x, b.y - p.y))} bossAt=${Math.round(b.x)},${Math.round(b.y)} me=${Math.round(p.x)},${Math.round(p.y)} hp=${Math.round(p.hp)} buffs=${b.buffs.map((x: { id: string }) => x.id)} adds=${[...sim.w.enemies.values()].filter((x) => !x.dead && x.id !== bid).length}`);
}
console.log('deaths', hpAtDeath.length, 'boss hp at each death', hpAtDeath.slice(0, 12).join(' → '), 'hazard events', JSON.stringify(events), 'final', Math.round(e()?.hp ?? 0));
console.log(deaths.slice(0, 3).join('\n'));
