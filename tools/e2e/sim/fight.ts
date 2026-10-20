/**
 * Headless combat test (Claude 3): every class vs a same-level pack and a realm boss in an open field.
 * Run: node tools/e2e/sim/run.mjs fight [level] [classId]
 */
import { HC_CLASSES } from '@/data/classes/hc/classes.gen';
import { kitFor } from '@/data/classes/hc/kits';
import { HC_PIECES } from '@/data/items/hc/armour.gen';
import { Btn, type InputFrame } from '@/net/types';
import { newCharacter, availablePoints } from '@/systems/rules/character';
import { unlockLevel } from '@/systems/rules/curves';
import { allNodes, canLearn } from '@/systems/rules/tree';
import type { CharacterSave } from '@/systems/rules/types';
import { Sim } from '@/systems/sim/Sim';
import { hasSlash } from '@/systems/rules/slash';
import { HC_CAMPAIGN_BOSSES } from '@/data/enemies/hc/campaign';
import type { SimPorts } from '@/systems/sim/world';

const args = process.argv.slice(3); // node run.mjs fight [level] [class]
const CAMPAIGN = args[0] === 'campaign';
// node run.mjs fight vs <creature> <creatureLevel> <class> <playerLevel> [starter] [n=3]
const VS = args[0] === 'vs';
// node run.mjs fight lair <realm> <level> [class] [rooms=5]: lairWaves() wave by wave (fresh HP per wave), total combat time
const LAIR = args[0] === 'lair';
// node run.mjs fight starter [class]: a brand-new character (newCharacter kit, no gear picked up, no tree) vs what it meets first
const STARTER = args[0] === 'starter';
const LEVEL = CAMPAIGN || VS || LAIR || STARTER ? 0 : Number(args[0] ?? 8);
const ONLY = VS ? args[3] : LAIR ? args[3] : STARTER ? args[1] : args[1];
const STYLES = ['cloth', 'leather', 'fur', 'mail', 'robe', 'scale', 'plate', 'vestment'];
const MATS = ['wood', 'iron', 'steel', 'ember', 'rime', 'storm', 'umbral', 'spark'];

const events: Record<string, number> = {};
const meter = { dealt: 0, taken: 0 };
const errors: string[] = [];
const ports: SimPorts = {
  move: (_s, x, y, dx, dy) => ({ x: Math.max(-2000, Math.min(2000, x + dx)), y: Math.max(-2000, Math.min(2000, y + dy)) }),
  clear: () => true,
  zoneRule: () => 'wild',
  respawnPoint: () => ({ space: 'test', x: 0, y: 0 }),
  emit: (name, payload) => {
    events[name] = (events[name] ?? 0) + 1;
    if (process.env.HITS && name === 'ability:cast') { const a = (payload as { ability: string }).ability; events['cast:' + a] = (events['cast:' + a] ?? 0) + 1; }
    if (name === 'combat:hit') {
      const h = payload as { sourceId: string; targetId: string; amount: number; kind?: string };
      if (h.kind === 'dmg' && (h.sourceId === 'p:bot' || h.sourceId.startsWith('pet:'))) meter.dealt += h.amount;
      if (h.kind === 'dmg' && h.targetId === 'p:bot') meter.taken += h.amount;
      if (process.env.HITS && h.kind === 'dmg' && h.sourceId === 'p:bot' && h.amount > 300) console.log('  big hit', h.amount, (payload as { type: string }).type);
    }
  },
  partySize: () => 1,
  realmRule: () => 'peaceful',
};

/** Gear a character like a player who kept up: school armour + kit weapon at the best unlocked tier. */
function geared(classId: string, level: number): CharacterSave {
  const s = newCharacter(classId);
  s.level = level;
  const school = HC_CLASSES.find((c) => c.id === classId)!.school;
  const tier = Math.max(0, ...[0, 1, 2, 3, 4, 5, 6, 7].filter((i) => level >= unlockLevel(i)));
  const kit = kitFor(classId);
  s.equipment.main = { uid: 'w', base: `w_${kit.weapons[0]}_${MATS[Math.max(0, tier - 1)]}`, ilvl: level, qty: 1 };
  const style = STYLES[Math.max(0, tier - 1)];
  for (const piece of ['helm', 'chest', 'hands', 'feet'] as const) {
    const pc = HC_PIECES.find((p) => p.set === `${school}_${style}` && p.piece === piece)!;
    s.equipment[pc.slot] = { uid: pc.id, base: pc.id, ilvl: level, qty: 1 };
  }
  s.inventory.push({ uid: 'pots', base: 'i_hp_s', ilvl: 1, qty: 10 });
  // spend points greedily in node order
  for (let guard = 0; guard < 200 && availablePoints(s) > 0; guard++) {
    const n = allNodes(classId).find((x) => canLearn(classId, x.id, s.tree, availablePoints(s)).ok);
    if (!n) break;
    s.tree[n.id] = (s.tree[n.id] ?? 0) + 1;
  }
  const learned = allNodes(classId).filter((n) => n.grantsSpell && (s.tree[n.id] ?? 0) > 0 && !kit.spells.includes(n.grantsSpell)).map((n) => n.grantsSpell!);
  if (learned[0]) s.hotbar[3] = learned[0];
  return s;
}

interface Result { cls: string; fight: string; won: boolean; secs: number; hpLeft: number; casts: number; dps?: number; dtps?: number; maxHp?: number }

/** Starter kit: class start weapon (ilvl 1) and no armour, but tree points spent: a player who never equipped loot. */
/** A brand-new character at this level: its creation kit only, tree unspent, 5 small potions. */
function bare(classId: string, level: number): CharacterSave {
  const s = newCharacter(classId);
  s.level = level;
  s.inventory.push({ uid: 'pots', base: 'i_hp_s', ilvl: 1, qty: 5 });
  return s;
}

function starter(classId: string, level: number): CharacterSave {
  const s = geared(classId, level);
  s.equipment = { main: { uid: 'w', base: kitFor(classId).startWeapon, ilvl: 1, qty: 1 } };
  return s;
}

function fight(classId: string, label: string, spawns: { creature: string; tier?: 'enemy' | 'mini' | 'boss'; x: number; y: number; level?: number; elite?: boolean }[], level: number, o: { creatureLevel?: number; starter?: boolean; bare?: boolean; seed?: number } = {}): Result {
  const sim = new Sim(ports, o.seed ?? 7);
  // the bot performs the in-fight story beats that gate targeting (reading the names, calling Nobody by name)
  sim.shopEnv = { flag: (k) => /names_read|nobody_named/.test(k), priceMult: () => 1 };
  meter.dealt = 0; meter.taken = 0;
  const save = o.bare ? bare(classId, level) : o.starter ? starter(classId, level) : geared(classId, level);
  const p = sim.addPlayer('bot', save, { space: 'test', x: 0, y: 0 });
  for (const s of spawns) sim.spawn({ creature: s.creature, level: s.level ?? o.creatureLevel ?? level, space: 'test', x: s.x, y: s.y, tier: s.tier, elite: s.elite });
  let seq = 0, held = 0, casts = 0;
  const DT = 1000 / 30;
  const melee = !['bow', 'staff', 'wand'].includes(p.weapon.type);
  for (let tick = 1; tick <= 30 * 600; tick++) {
    const foes = [...sim.w.enemies.values()].filter((e) => !e.dead && !e.yielded && e.team === 'enemies');
    if (!foes.length || p.dead) {
      const secs = tick / 30;
      return { cls: classId, fight: label, won: !foes.length && !p.dead, secs: Math.round(secs), hpLeft: Math.round((p.hp / p.maxHp) * 100), casts, dps: Math.round(meter.dealt / secs), dtps: Math.round(meter.taken / secs), maxHp: p.maxHp };
    }
    foes.sort((a, b) => Math.hypot(a.x - p.x, a.y - p.y) - Math.hypot(b.x - p.x, b.y - p.y));
    // like a player: focus the boss / mini unless an add is right on top of us
    const big = foes.find((e) => e.tier !== 'enemy');
    const t = big && Math.hypot(foes[0].x - p.x, foes[0].y - p.y) > 60 ? big : foes[0];
    const d = Math.hypot(t.x - p.x, t.y - p.y);
    let buttons = Btn.ATTACK;
    // casts: press one ready slot every 15 ticks (edge-triggered)
    if (tick % 15 === 0) {
      const slot = [0, 1, 2, 3].find((i) => { const id = p.save.hotbar[i]; return id && sim.w.t >= (p.cds.get(id) ?? 0); });
      if (slot !== undefined) { buttons |= [Btn.CAST1, Btn.CAST2, Btn.CAST3, Btn.CAST4][slot]; casts++; }
    }
    // martial classes press the slash / quick shot whenever it is up (NOSLASH=1: the bot without it, for comparison)
    if (!process.env.NOSLASH && hasSlash(p.save.classId) && tick % 2 === 0 && sim.w.t >= (p.cds.get('slash') ?? 0)) buttons |= Btn.SLASH;
    if (p.hp < p.maxHp * 0.4) buttons |= Btn.POTION_Q;
    if (p.ember < 20) buttons |= Btn.POTION_E;
    // dodge telegraphed wind-ups
    const winding = foes.find((e) => e.windup && e.windup.label !== 'basic' && Math.hypot(e.x - p.x, e.y - p.y) < 320);
    if (winding && tick % 4 === 0) buttons |= Btn.DASH;
    const kite = !melee && d < 120;
    let mx = kite ? (p.x - t.x) / d : 0, my = kite ? (p.y - t.y) / d : 0;
    // step out of hostile ground effects, like a player would
    const zone = [...sim.w.zones.values()].find((z) => z.team === 'enemies' && Math.hypot(z.x - p.x, z.y - p.y) < (z.area.r ?? 60) + 14);
    if (zone) { const zd = Math.hypot(p.x - zone.x, p.y - zone.y) || 1; mx = (p.x - zone.x) / zd; my = (p.y - zone.y) / zd; }
    // telegraphed ability: step away from the caster (sideways for ranged) while dashing
    if (winding) { const wd = Math.hypot(p.x - winding.x, p.y - winding.y) || 1; mx = (p.x - winding.x) / wd - (p.y - winding.y) / wd * 0.5; my = (p.y - winding.y) / wd + (p.x - winding.x) / wd * 0.5; }
    const frame: InputFrame = { seq: ++seq, t: sim.w.t, move: { x: mx, y: my }, aim: { x: t.x, y: t.y }, buttons: buttons & ~held | (buttons & Btn.ATTACK), target: t.id };
    held = buttons & ~Btn.ATTACK;
    if (process.env.DEBUG && tick % 300 === 0) console.log(`  t=${tick / 30}s ${label} p.hp=${Math.round(p.hp)} foes:`, foes.map((e) => `${e.def} ${Math.round(e.hp)}/${e.maxHp} ai=${e.ai} d=${Math.round(Math.hypot(e.x - p.x, e.y - p.y))} buffs=${e.buffs.map((b) => b.id)} st=${[...e.statuses.keys()]}`).join(' | '), `pbuffs=${p.buffs.map((b) => b.id + ':' + b.charges)} pst=${[...p.statuses.keys()]} wind=${foes[0]?.windup?.label ?? ''} pAnim=${p.anim} motion=${!!p.motion} moved=${Math.round(sim.w.t - p.movedAt)} atkIn=${Math.round(p.attackReadyAt - sim.w.t)} tgt=${p.target}`);
    try { sim.step(DT, tick, new Map([['bot', [frame]]])); }
    catch (e) { errors.push(`${classId}/${label}: ${(e as Error).stack?.split('\n').slice(0, 3).join(' | ')}`); return { cls: classId, fight: label, won: false, secs: -1, hpLeft: 0, casts }; }
    // release keys next tick so presses are edges
    if (held) { const rel: InputFrame = { ...frame, seq: ++seq, buttons: Btn.ATTACK }; held = 0; sim.step(0.0001, tick, new Map([['bot', [rel]]])); }
  }
  return { cls: classId, fight: label, won: false, secs: 600, hpLeft: Math.round((p.hp / p.maxHp) * 100), casts, dps: Math.round(meter.dealt / 600), dtps: Math.round(meter.taken / 600), maxHp: p.maxHp };
}

const classes = HC_CLASSES.filter((c) => !ONLY || c.id === ONLY);
const rows: Result[] = [];
if (STARTER) {
  const { HC_LAIR1 } = await import('@/data/enemies/hc/campaign');
  console.log('class        realm pack L2 (you L2)       lair-1 boss L6 (you L5)      lair-2 boss L9 (you L8)');
  for (const c of classes) {
    const realm = c.school;
    const own = HC_CAMPAIGN_BOSSES.filter((b) => b.classId === c.id);
    const rs = [
      fight(c.id, 'pack', [0, 1, 2].map((i) => ({ creature: `bx_${realm}_${i}`, x: 160 + i * 30, y: i * 20 })), 2, { bare: true }),
      // as the world spawns it (instanceGen.lairBoss + spawns.ts): the realm mini at its own tier, level 6
      fight(c.id, 'lair1', [{ creature: (HC_LAIR1 as Record<string, string>)[c.id], x: 200, y: 0 }], 5, { bare: true, creatureLevel: 6 }),
      fight(c.id, 'lair2', [{ creature: own.find((b) => b.slot === 'lair2')!.id, x: 200, y: 0 }], 8, { bare: true, creatureLevel: 9 }),
    ];
    rows.push(...rs);
    console.log(c.id.padEnd(12), rs.map((r) => `${r.won ? 'WIN ' : 'LOSS'} ${String(r.secs).padStart(4)}s ${String(r.hpLeft).padStart(3)}% ${r.dps}/${r.dtps}`.padEnd(29)).join(' '), `hp ${rs[0].maxHp}`);
  }
  console.log(`wins: pack ${rows.filter((r) => r.fight === 'pack' && r.won).length}/${classes.length}, lair1 ${rows.filter((r) => r.fight === 'lair1' && r.won).length}/${classes.length}, lair2 ${rows.filter((r) => r.fight === 'lair2' && r.won).length}/${classes.length}`);
  process.exit(0);
}
if (LAIR) {
  const { lairWaves, elitePack } = await import('@/systems/rules/encounters');
  const [, realm, lv] = args;
  const L = Number(lv), rooms = Number(args[4] ?? 5);
  for (const c of classes) {
    let total = 0, lost = 0, waves = 0;
    for (const room of lairWaves(realm, L, rooms, 1, 3)) for (const wave of room.waves) {
      const r = fight(c.id, `room${room.room}`, wave.map((s, i) => ({ ...s, x: 160 + (i % 3) * 40, y: -60 + Math.floor(i / 3) * 50 })), L, { seed: 7 + waves++ });
      total += r.secs; if (!r.won) lost++;
    }
    const pack = fight(c.id, 'elitePack', elitePack(realm, L, 1, 5).map((s, i) => ({ ...s, x: 180 + i * 30, y: 0 })), L);
    console.log(`${c.id.padEnd(12)} lair ${realm} L${L} ${rooms} rooms: ${waves} waves, ${Math.round(total / 60 * 10) / 10} min, lost ${lost} | elite pack ${pack.won ? 'WIN' : 'LOSS'} ${pack.secs}s`);
  }
  process.exit(0);
}
if (VS) {
  const [, creature, cl, cls, pl, flag] = args;
  const n = Number(args[6] ?? 3);
  for (let i = 0; i < n; i++) {
    const r = fight(cls, `${creature}#${i}`, [{ creature, x: 200, y: 0 }], Number(pl), { creatureLevel: Number(cl), starter: flag === 'starter', seed: 7 + i });
    console.log(`${cls} L${pl}${flag === 'starter' ? ' (starter kit)' : ''} vs ${creature} L${cl}: ${r.won ? 'WIN ' : 'LOSS'} ${r.secs}s hp ${r.hpLeft}% dps ${r.dps} taken/s ${r.dtps} maxHp ${r.maxHp}`);
  }
  console.log('events', JSON.stringify(events));
  process.exit(0);
}
for (const c of classes) {
  if (CAMPAIGN) {
    const own = HC_CAMPAIGN_BOSSES.filter((b) => b.classId === c.id);
    const at = (slot: string) => own.find((b) => b.slot === slot || (slot === 'act3' && (b.slot === 'herald' || b.slot === 'chimera')))!.id;
    rows.push(fight(c.id, 'lair2', [{ creature: at('lair2'), x: 200, y: 0 }], 8));
    rows.push(fight(c.id, 'nemesis', [{ creature: at('nemesis'), x: 200, y: 0 }], 12));
    rows.push(fight(c.id, 'act3', [{ creature: at('act3'), x: 200, y: 0 }], 34));
    continue;
  }
  const realm = c.school;
  rows.push(fight(c.id, 'pack', [0, 1, 2].map((i) => ({ creature: `bx_${realm}_${i}`, x: 160 + i * 30, y: -60 + i * 60 })), LEVEL));
  rows.push(fight(c.id, 'mini', [{ creature: `bx_${realm}_3`, x: 180, y: 0 }], LEVEL));
  rows.push(fight(c.id, 'boss', [{ creature: `bx_${realm}_5`, x: 200, y: 0 }], LEVEL + 2));
}
console.log(`level ${LEVEL}`);
console.log(CAMPAIGN ? 'class        lair 2 (L8)              nemesis (L12)            Act III (L34)            (dps/taken-per-s, maxHp)' : 'class        pack                     mini                     boss                     (dps/taken-per-s, maxHp)');
for (const c of classes) {
  const r = rows.filter((x) => x.cls === c.id);
  console.log(c.id.padEnd(12), ...r.map((x) => `${x.won ? 'WIN ' : 'LOSS'} ${String(x.secs).padStart(3)}s ${String(x.hpLeft).padStart(3)}% ${x.dps}/${x.dtps}`.padEnd(25)), r[0]?.maxHp);
}
const wins = (f: string) => rows.filter((r) => r.fight === f && r.won).length;
if (CAMPAIGN) console.log(`wins: lair2 ${wins('lair2')}/${classes.length}, nemesis ${wins('nemesis')}/${classes.length}, act3 ${wins('act3')}/${classes.length}`);
else console.log(`wins: pack ${wins('pack')}/${classes.length}, mini ${wins('mini')}/${classes.length}, boss ${wins('boss')}/${classes.length}`);
console.log('events', JSON.stringify(events));
errors.forEach((e) => console.log('ERROR', e));
