/**
 * Integrated headless campaign playthrough (Claude 2). One class per process, solo, with the REAL authorities:
 * world (travel, doors, waystones, spawns, bosses), systems (the hero's real kit and fights), narrative (quests,
 * dialogue). The bot reads its tracked objective, finds the target in the generated world, walks there with the
 * world's A*, talks / uses / fights through the real messages, and reports where and why it stops.
 *   CLASS=warden ACT=2 HOURS=12 node <bundle>
 */
import { writeFileSync } from 'node:fs';
import { Collision, Game, Registry, Services, bus, createNewGameState, getFlag, heroClassId, classSchool, type QuestDef, type NpcDef, type DialogueDef, type TimePhase } from '@/core';
import { LocalNet, sim, Btn, type InputFrame } from '@/net';
import { installWorldAuthority, phaseOf } from '@/world/hc/authority';
import { standBeside } from '@/world/hc/worldService';
import { npcsIn } from '@/world/hc/npcs';
import { tileDist } from '@/world/hc/interact';
import { allWaystones } from '@/world/hc/spaces';
import { installSystemsAuthority, systemsAuthority } from '@/systems/sim';
import { sendLoadout, character, equip } from '@/systems/client/character';
import { itemInfo, slotsFor } from '@/systems/rules/gear';
import { availablePoints } from '@/systems/rules/character';
import { allNodes, canLearn } from '@/systems/rules/tree';
import { installNarrativeAuthority, dialogue, activeQuests, checkCondition, npcPlacements, progress, questDef } from '@/narrative/engine';
import { currentStage, objectiveDone } from '@/narrative/engine/quests';
import { indexInstance, where, whereCreature, whereNpc, doorInto, type Spot } from './places';
import { spawnZones } from '@/world/hc/spawns';
import { instanceDef, spaceRuntime } from '@/world/hc/spaces';
import { Fighter } from './fighter';
import { OPTIONAL_LEVEL } from '@/world/hc/realmGen';
import { regionLevels, type ConcordiaGen } from '@/world/hc/concordiaGen';
import { MORVANE_REGIONS } from '@/data/regions/hc/morvane';

const CLASS = process.env.CLASS ?? 'warden';
const TARGET_ACT = Number(process.env.ACT ?? 2);
const HOURS = Number(process.env.HOURS ?? 12);
const DT = 1000 / 30;
const ME = 'local';

// ───────────── boot: the real creation path and the three authorities ─────────────
Game.set(createNewGameState());
Registry.load();
Game.state.player.hero = { classId: CLASS, look: { skin: 0, hair: 0, hc: 0, eyes: 0, brows: 0, ec: 0, mouth: 0, mark: 0, body: 0 }, outfit: { dye: 0, headw: 0, cape: 0, neck: 0, face: 0, extra: 0 } } as never;
Game.set(Game.state); // mirrors hero.classId into progression (core)
Game.state.world.time = 8 * 60;
const net = new LocalNet(ME, 'Bot', CLASS, 1);
Services.register('net', net);
sim.attach(net);
installSystemsAuthority();
const clock = () => { const hour = (Game.state.world.time / 60) % 24; return { hour, phase: phaseOf(hour) as TimePhase }; };
const players = () => Services.tryGet('combat')?.players().map((p) => ({ id: p.playerId ?? p.id, space: p.space, x: p.x, y: p.y })) ?? [];
const W = Game.state.world;
/** open kill objectives with markers: the world spawns their creatures at the marker (story fights) */
const questKills = () => activeQuests().flatMap((qd) => ((currentStage(qd)?.objectives ?? []) as any[])
  .filter((o) => 'kill' in o && o.kill && !objectiveDone(qd, o))
  .map((o) => ({ playerId: ME, creature: String(o.kill), count: o.count ?? 1, marker: o.marker ? o.marker.landmark ?? o.marker.place ?? o.marker.region : undefined })));
installWorldAuthority({
  space: 'concordia', players, sim, clock, classOf: () => heroClassId(), npcPlacements, questKills,
  place: (pid, space, x, y) => void systemsAuthority()?.sim.teleport(pid, space, x, y),
  discover: (_p, id) => {
    if (id.startsWith('boss:')) { W.clearedZones[id] = Date.now(); return; }
    const list = id.startsWith('landmark:') ? W.discoveredLandmarks : W.foundRegions;
    if (!list.includes(id)) list.push(id);
  },
  known: (_p, id) => (id.startsWith('boss:') ? id in W.clearedZones : W.discoveredLandmarks.includes(id)),
});
installNarrativeAuthority();
character();
sendLoadout(); // the hero joins the systems sim at the class start (world respawnPoint)
bus.emit('game:new', {} as never);
bus.emit('world:ready', {});

const S = () => systemsAuthority()!.sim;
/** each death: who killed the hero, the boss's HP then, and the room (Claude 3's arena-geometry question) */
const deathLog: string[] = [];
/** XP by source (Claude 3's curve question); kills while grinding are counted apart */
const xpBy: Record<string, number> = {};
let grinding = false;
bus.on('xp:gained', (e) => { const k = grinding && /kill/i.test(e.source) ? 'grind' : e.source; xpBy[k] = (xpBy[k] ?? 0) + e.amount; });
let lastKiller = '?';
let lastKillTick = 0;
bus.on('enemy:killed', () => { lastKillTick = tick; });
bus.on('player:died', (e: any) => {
  const p = hero();
  lastKiller = e.killerName ?? e.killer ?? '?';
  const boss = [...(S() as any).w.enemies.values()].find((x: any) => !x.dead && x.space === p?.space && x.tier !== 'enemy');
  const g = p?.space?.startsWith('inst:') ? (spaceRuntime(p.space).gen as any) : null;
  const room = g?.bossRoom ? `${g.bossRoom.w}x${g.bossRoom.h} ${g.bossRoom.shape}` : '-';
  deathLog.push(`L${p?.save.level} killed by ${e.killerName ?? e.killer ?? '?'}; ${boss ? `${boss.def} ${Math.round(boss.hp)}/${boss.maxHp}` : 'no boss'}; room ${room}`);
});
if (process.env.DEBUG) {
  const at = () => `[${Math.round(sim.tick / 1800)}m]`;
  bus.on('enemy:killed', (e) => { if ((e.tier ?? 'enemy') !== 'enemy') console.log(at(), 'KILLED', e.creature, e.zoneId); });
  (bus as unknown as { on(ev: string, fn: (e: any) => void): void }).on('enemy:yielded', (e) => console.log(at(), 'YIELDED', e.creature, e.zoneId));
  bus.on('dialogue:started', (e) => console.log(at(), 'DIALOGUE', e.dialogueId));
  bus.on('quest:advanced', (e) => console.log(at(), 'QUEST', JSON.stringify(e).slice(0, 120)));
}
const hero = () => (S() as unknown as { w: { players: Map<string, any> } }).w.players.get(`p:${ME}`);
const q = (space: string) => Services.get('worlds').query(space);

// ───────────── report ─────────────
const log: string[] = [];
const stats = { deaths: 0, teleports: 0, waits: 0, travels: 0, talks: 0, uses: 0, equips: 0, points: 0 };
/** pacing (Claude 1): what a human would spend — walking, fighting, reading, menus */
const pace = { tiles: 0, walkTicks: 0, fights: 0, combatTicks: 0, nodes: 0, words: 0, journal: 0 };
let lastPos: { space: string; x: number; y: number } | null = null, inFight = false, lastText = '';
let stuck: string | null = null;
/** content findings: things a real player would also hit (talks that open nothing, objects that do nothing) */
const findings = new Set<string>();
/** goals that got nowhere after a few tries (skipped from then on) */
const tries = new Map<string, number>();
const skip = new Set<string>();
/** dialogues that opened per goal key (to tell "nothing opened" from "opened but no quest") */
const opened = new Map<string, number>();
let activeKey = '';
bus.on('dialogue:started', () => { if (activeKey) opened.set(activeKey, (opened.get(activeKey) ?? 0) + 1); });
let deathsAt = new Map<string, number>();
/** per act (Claude 1): distinct places, stage overhead, banter; full-tree words of every dialogue opened (Claude 4) */
const places = new Set<string>();
const opens = new Set<string>();
let stages = 0, banter = 0;
const ev = bus as unknown as { on(ev: string, fn: (e: any) => void): void };
for (const n of ['region:entered', 'area:entered', 'instance:entered']) ev.on(n, (e) => { const id = e.regionId ?? e.triggerId ?? e.instanceId; if (id) places.add(id); });
ev.on('landmark:discovered', (e) => places.add(e.landmarkId));
ev.on('quest:advanced', () => stages++);
// the Journal shows each stage's prose (Claude 4, from 2026-10-21): read once per stage entered, at the same 200 wpm
const journalOf = (quest: string, stage?: string) => { const q = questDef(quest as QuestDef['id']); const st = stage ? q?.stages.find((x) => x.id === stage) : q?.stages[0]; return st?.journal ? wordsOf(st.journal) : 0; };
ev.on('quest:started', (e) => { pace.journal += journalOf(e.questId); });
ev.on('quest:advanced', (e) => { pace.journal += journalOf(e.questId, e.stage); });
bus.on('dialogue:started', (e) => { opens.add(e.dialogueId); if (e.dialogueId.startsWith('dialogue:area-')) banter++; });
const wordsOf = (t: string) => t.split(/\s+/).filter(Boolean).length;
function treeWords(id: string): number {
  const d = Registry.tryGet('dialogue', id as DialogueDef['id']) as DialogueDef | undefined;
  return d ? Object.values(d.nodes).reduce((n, x) => n + wordsOf(x.text) + (x.choices ?? []).reduce((m, c) => m + wordsOf(c.text), 0), 0) : 0;
}

// ───────────── dialogue: take enabled choices (seeded), advance otherwise ─────────────
let seed = CLASS.length * 7919;
const rand = () => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);
function stepDialogue(): boolean {
  if (!dialogue.active) return false;
  const v = dialogue.view();
  if (v && v.text !== lastText) {
    lastText = v.text;
    pace.nodes++;
    pace.words += (v.text + ' ' + v.choices.map((c) => c.text).join(' ')).split(/\s+/).filter(Boolean).length;
  }
  const en = v?.choices.filter((c) => c.enabled) ?? [];
  // like a player who came for the quest: take the [Quest] choice when there is one, else any
  const quest = en.filter((c) => c.quest);
  const pool = quest.length ? quest : en;
  if (!pool.length) dialogue.advance(); else dialogue.choose(pool[Math.floor(rand() * pool.length)].index);
  return true;
}

// flags → where they are set (object dialogues → obj ids, npc dialogues → npc ids): for `when` objectives
const setters = new Map<string, { objs: Set<string>; npcs: Set<string> }>();
{
  const npcOf = new Map<string, string[]>();
  for (const n of Registry.all('npc') as NpcDef[]) for (const d of n.dialogue) npcOf.set(d.dialogue, [...(npcOf.get(d.dialogue) ?? []), n.id]);
  for (const d of Registry.all('dialogue') as DialogueDef[]) {
    for (const f of JSON.stringify(d).match(/"setFlag":"[^"]+"|"insight":"[^"]+"/g) ?? []) {
      const key = f.startsWith('"setFlag"') ? f.slice(11, -1) : `insight.${f.slice(11, -1)}`;
      const e = setters.get(key) ?? { objs: new Set(), npcs: new Set() };
      if (d.id.startsWith('dialogue:obj-')) e.objs.add(`obj:${d.id.slice(13)}`);
      for (const n of npcOf.get(d.id) ?? []) e.npcs.add(n);
      setters.set(key, e);
    }
  }
}

// ───────────── goals ─────────────
interface Goal { label: string; kind: 'talk' | 'use' | 'reach' | 'kill'; id: string; spot: Spot; creature?: string; /** a boss room: walk right in (its trigger spawns the boss) */ boss?: boolean; /** a story fight at its marker: walk onto it (the fight spawns there) */ story?: boolean }
const used = new Set<string>();
const mine = (Registry.all('quest') as QuestDef[]).filter((x) => x.campaign === CLASS || x.campaign === 'shared');
const school = classSchool(CLASS) ?? '';

function npcGoal(npc: string, label: string): Goal | string {
  const at = whereNpc(npc, npcPlacements());
  return at ? { label, kind: 'talk', id: npc, spot: at } : `no talk target: ${npc} is not placed now (hour ${Math.floor(clock().hour)})`;
}

/** a boss we lost to twice: grind until this level, then go back */
let grindTo = 0;
/** boss HP samples (every game minute) to spot stalemates: a fight the hero can't out-damage */
const bossHp: number[] = [];
function grindGoal(): Goal | null {
  const p = hero();
  if (!grindTo || p.save.level >= grindTo) { grindTo = 0; return null; }
  // the zone whose levels fit the hero best (low zones give no XP), nearest among equals
  const lv = p.save.level;
  const fit = (z: { level: [number, number] }) => (z.level[1] >= lv ? z.level[1] - lv : 100 + lv - z.level[1]);
  // ambient zones only: patrols wander off and elite packs are not where a careful player farms
  const z = spawnZones(p.space.startsWith('inst:') ? (doorInto(p.space)?.space ?? p.space) : p.space).filter((x) => x.id.startsWith('zone:'))
    .sort((a, b) => fit(a) - fit(b) || Math.hypot(a.at[0] - p.x / 32, a.at[1] - p.y / 32) - Math.hypot(b.at[0] - p.x / 32, b.at[1] - p.y / 32))[0];
  // above every zone here: grinding gives no XP, so go back and try the fight as we are
  if (!z || z.level[1] + 3 < lv) { findings.add(`no useful XP left in ${p.space} at L${lv} (wanted L${grindTo})`); grindTo = 0; return null; }
  return { label: `grind to L${grindTo}`, kind: 'kill', id: z.pool[0], creature: z.pool[0], spot: { space: z.space, at: z.at } };
}

/**
 * EXPLORE=1 (PACING pass 2), the careful player: a lair's codex and side chests on the way to its boss, then the
 * hero's realm's lookouts, ruins and caves once the hero is near their level. Nearest first, the hero's space first.
 */
const EXPLORE = !!process.env.EXPLORE;
let explored = 0;
function exploreGoal(): Goal | null {
  if (!EXPLORE) return null;
  const p = hero();
  const realm = p.space.startsWith('inst:') ? doorInto(p.space)?.space ?? '' : p.space;
  const ids: string[] = [];
  if (p.space.startsWith('inst:')) { indexInstance(p.space); const slug = p.space.slice(5); ids.push(`obj:${slug}-codex`, `obj:${slug}-find`, `obj:${slug}-cache`, ...[1, 2, 3].map((i) => `obj:${slug}-side-${i}`)); }
  // Morvane: the optional areas of the region the hero is in, once the hero is inside its band
  if (realm === 'concordia') {
    const g = spaceRuntime('concordia').gen as ConcordiaGen;
    const here = g.optional.get(g.regionAt(Math.floor(p.x / 32), Math.floor(p.y / 32)))?.region ?? g.regionAt(Math.floor(p.x / 32), Math.floor(p.y / 32));
    for (const [id, o] of g.optional) {
      const r = MORVANE_REGIONS.find((x) => x.id === o.region)!, [lo, hi] = regionLevels(r);
      if (o.region !== here || p.save.level < lo) continue;
      const base = id.slice(5);
      if (o.kind === 'view') ids.push(`obj:${base}-find`);
      if (o.kind === 'ruin' && p.save.level >= hi - 1) ids.push(`obj:${base}-cache`, `obj:${base}-find`);
      if (o.kind === 'cave' && p.save.level >= hi) { indexInstance(`inst:${base}`); ids.push(`obj:${base}-cache`, `obj:${base}-find`); }
    }
  }
  const S = realm.startsWith('realm:') ? realm.slice(6) : '';
  for (const side of S ? ['capital', 'frontier'] : []) {
    ids.push(`obj:${S}-${side}-view-find`);
    if (p.save.level >= OPTIONAL_LEVEL.ruin - 1) ids.push(`obj:${S}-${side}-ruin-cache`, `obj:${S}-${side}-ruin-find`);
    if (p.save.level >= OPTIONAL_LEVEL.cave - 1) { indexInstance(`inst:${S}-${side}-cave`); ids.push(`obj:${S}-${side}-cave-cache`, `obj:${S}-${side}-cave-find`); }
  }
  const cost = (sp: Spot) => (sp.space === p.space ? Math.hypot(sp.at[0] - p.x / 32, sp.at[1] - p.y / 32) : 1e4);
  const open = ids.filter((id) => !used.has(id) && !skip.has(`explore|${id}`)).map((id) => ({ id, spot: where(id) })).filter((x): x is { id: string; spot: Spot } => !!x.spot);
  open.sort((a, b) => cost(a.spot) - cost(b.spot));
  return open[0] ? { label: 'explore', kind: 'use', id: open[0].id, spot: open[0].spot } : null;
}

function pickGoal(): Goal | string {
  const gr = grindGoal();
  grinding = !!gr;
  if (gr) return gr;
  const ex = exploreGoal();
  if (ex) return ex;
  const g = pickGoalRaw();
  return typeof g !== 'string' && skip.has(`${g.label}|${g.id}`) ? pickOther(g) : g;
}

/** the next goal after skipped ones (re-run with the skipped goal's quest giver excluded) */
function pickOther(first: Goal): Goal | string {
  const seen = new Set<string>([`${first.label}|${first.id}`]);
  for (let i = 0; i < 20; i++) {
    const g = pickGoalRaw(seen);
    if (typeof g === 'string' || !skip.has(`${g.label}|${g.id}`)) return g;
    seen.add(`${g.label}|${g.id}`);
  }
  return 'every open goal was skipped';
}

function pickGoalRaw(exclude = new Set<string>()): Goal | string {
  const ok = (g: Goal | string) => typeof g === 'string' || !(exclude.has(`${g.label}|${g.id}`) || skip.has(`${g.label}|${g.id}`));
  // a quest the hero could take: go and talk to its giver
  for (const qd of mine) if (!progress(qd.id) && qd.giver && checkCondition(qd.requires)) { const g = npcGoal(qd.giver, `take ${qd.id.slice(6)}`); if (typeof g !== 'string' && ok(g)) return g; }
  let reason = 'no active objective';
  for (const qd of activeQuests()) {
    for (const o of (currentStage(qd)?.objectives ?? []) as any[]) {
      if (o.optional || objectiveDone(qd, o)) continue;
      const label = `${qd.id.slice(6)}/${o.id}`;
      if ('talk' in o) { const g = npcGoal(o.talk, label); if (typeof g !== 'string' && ok(g)) return g; if (typeof g === 'string') reason = g; continue; }
      if ('interact' in o) {
        const pat: string = o.interact.replace('*', o.interact.endsWith('-*') ? '' : school);
        const id = pat.endsWith('-') ? [1, 2, 3, 4, 5, 6].map((i) => pat + i).find((x) => !used.has(x) && where(x)) : pat;
        const spot = id ? where(id) : null;
        if (spot && id && ok({ label, kind: 'use', id, spot })) return { label, kind: 'use', id, spot };
        reason = `no object for ${o.interact}`; continue;
      }
      if ('reach' in o) {
        const spot = where(o.reach);
        if (spot?.obj?.size) {
          const [x0, y0] = spot.obj.at, [w, h] = spot.obj.size;
          const qq = q(spot.space);
          let best: [number, number] | null = null;
          for (let y = y0 + h - 1; y >= y0 && !best; y--) for (let x = x0; x < x0 + w; x++) if (qq.isWalkable(x, y)) { best = [x, y]; break; }
          if (best) return { label, kind: 'reach', id: o.reach, spot: { ...spot, at: best } };
        }
        if (spot) return { label, kind: 'reach', id: o.reach, spot };
        reason = `unknown place ${o.reach}`; continue;
      }
      if ('kill' in o && o.kill) {
        const c = String(o.kill).replace('*', 'ed');
        // live ones first (story scenes spawn their own), then boss rooms and spawn zones
        const live = [...(S() as any).w.enemies.values()].find((e: any) => !e.dead && !e.yielded && (e.def === c || (c.endsWith('*') && e.def.startsWith(c.slice(0, -1)))));
        const marked = o.marker ? where(o.marker.landmark ?? o.marker.place ?? o.marker.region) : null;
        const spot = live ? { space: live.space, at: [Math.floor(live.x / 32), Math.floor(live.y / 32)] as [number, number] } : marked ?? whereCreature(c, CLASS, hero());
        if (spot) return { label, kind: 'kill', id: c, spot, creature: c, boss: live ? live.tier !== 'enemy' : spot.space.startsWith('inst:') || !!spot.obj?.id.startsWith('boss:'), story: !live && !!marked };
        reason = `no spawn for ${c}`; continue;
      }
      if ('when' in o) {
        const keys = [...JSON.stringify(o.when).matchAll(/"(?:flag|insight)":"([^"]+)"/g)].map((m) => (m[0].startsWith('"insight"') ? `insight.${m[1]}` : m[1]));
        for (const k of keys) {
          const s = setters.get(k);
          for (const ob of s?.objs ?? []) { const spot = where(ob); if (spot && !used.has(ob)) return { label: `${label} (${k})`, kind: 'use', id: ob, spot }; }
          for (const np of s?.npcs ?? []) { const g = npcGoal(np, `${label} (${k})`); if (typeof g !== 'string' && ok(g)) return g; }
        }
        reason = `condition with no reachable setter: ${JSON.stringify(o.when).slice(0, 80)}`; continue;
      }
      if ('collect' in o) { reason = `collect ${o.collect} (no source the bot knows)`; continue; }
    }
  }
  return reason;
}

// ───────────── travel ─────────────
interface Route { space: string; path: [number, number][]; i: number; goal: Goal; stall: number; best: number; then?: string }
// (Route is a Walk with a destination action)
let route: Route | null = null;

/** The next step towards a goal: a spot in the hero's current space, and what to do there. */
function hop(goal: Goal, space: string): { spot: [number, number]; use?: string } | string {
  const t = goal.spot;
  if (t.space === space) return { spot: t.at };
  if (space.startsWith('inst:')) { indexInstance(space); const exit = where(`obj:${space.slice(5)}-exit`); return exit ? { spot: exit.at, use: exit.obj!.id } : `no exit from ${space}`; }
  if (t.space.startsWith('inst:')) {
    const door = doorInto(t.space);
    if (!door) return `no door into ${t.space}`;
    if (door.space === space) return { spot: door.at, use: door.obj!.id };
    return hop({ ...goal, spot: door }, space);
  }
  return `travel ${space} → ${t.space}`; // handled by waystones / gates in travelTo()
}

/** Cross between main spaces: travel from a woken waystone there if any, else the realm gate / the school arch. */
function travelTo(target: string, here: string): { spot: [number, number]; use?: string } | string {
  const worlds = Services.get('worlds') as unknown as { isWoken(p: string, w: string): boolean };
  const lit = allWaystones().filter((w) => w.space === target && worlds.isWoken(ME, w.id));
  if (lit.length) {
    net.send({ type: 'act', domain: 'world', action: 'travel', args: { waystone: lit[0].id } });
    stats.travels++;
    return 'travelling';
  }
  if (target === 'concordia' && here.startsWith('realm:')) { const d = where(`obj:${here.slice(6)}-gate-way`); return d ? { spot: d.at, use: d.obj!.id } : 'no gate way'; }
  if (here === 'concordia' && target === `realm:${school}`) { const d = where(`obj:arch-${school}`); return d ? { spot: d.at, use: d.obj!.id } : 'no arch'; }
  return `no route ${here} → ${target}`;
}

function plan(goal: Goal): string | null {
  const p = hero();
  let h = hop(goal, p.space);
  if (typeof h === 'string' && h.startsWith('travel ')) h = travelTo(goal.spot.space.startsWith('inst:') ? (doorInto(goal.spot.space)?.space ?? goal.spot.space) : goal.spot.space, p.space);
  if (typeof h === 'string') return h === 'travelling' ? null : h;
  const from: [number, number] = [Math.floor(p.x / 32), Math.floor(p.y / 32)];
  // walk onto the target tile when it is walkable (NPCs and loose objects), else beside it
  const dest = q(p.space).isWalkable(h.spot[0], h.spot[1]) ? { x: h.spot[0] * 32 + 16, y: h.spot[1] * 32 + 16 } : standBeside(q(p.space), h.spot[0], h.spot[1]);
  const to: [number, number] = [Math.floor(dest.x / 32), Math.floor(dest.y / 32)];
  const path = q(p.space).findPath(from, to, 600_000);
  if (!path) return `no path in ${p.space} from ${from} to ${to} (${goal.label})`;
  route = { space: p.space, path, i: 0, goal, stall: 0, best: Infinity, then: h.use };
  if (process.env.DEBUG) console.log(`[route] ${goal.label} from ${from} to ${to} (${path.length} steps) target ${h.spot} walkable=${q(p.space).isWalkable(h.spot[0], h.spot[1])}`);
  return null;
}

// ───────────── walking ─────────────
interface Walk { path: [number, number][]; i: number; stall: number; best: number }
let hunt: Walk | null = null;

function pathTo(p: any, tile: [number, number]): Walk | null {
  const qq = q(p.space);
  if (!qq.isWalkable(tile[0], tile[1])) { const b = standBeside(qq, tile[0], tile[1]); tile = [Math.floor(b.x / 32), Math.floor(b.y / 32)]; }
  const path = qq.findPath([Math.floor(p.x / 32), Math.floor(p.y / 32)], tile, 200_000);
  return path ? { path, i: 0, stall: 0, best: Infinity } : null;
}

/** Steer along a path; null when it ends or stalls (the caller re-plans). */
function follow(p: any, w: Walk): { x: number; y: number } | null {
  const wp = w.path[Math.min(w.i, w.path.length - 1)];
  const dx = wp[0] * 32 + 16 - p.x, dy = wp[1] * 32 + 16 - p.y, d = Math.hypot(dx, dy);
  if (d < (w.i >= w.path.length - 1 ? 4 : 12)) { w.i++; w.best = Infinity; }
  if (w.i >= w.path.length) return null;
  // stuck on something the path doesn't know (a placement edge, a body): give up so it re-plans
  if (d < w.best - 1) { w.best = d; w.stall = 0; } else if (++w.stall > 90) return null;
  return { x: dx / (d || 1), y: dy / (d || 1) };
}

// ───────────── the loop ─────────────
const fighter = new Fighter(S, ME, (space, x0, y0, x1, y1) => !q(space).raycast(x0, y0, x1, y1, Collision.SOLID | Collision.WATER).hit);
let goal: Goal | null = null, sig = '', sameFor = 0, waitTicks = 0, lastGoalLabel = '';
let goalSince = 0, goalKey = '', goalBest = Infinity, wasDead = false;
const maxTicks = HOURS * 3600 * 30;
let tick = 0;
for (; tick < maxTicks; tick++) {
  const p = hero();
  if (!p) { stuck = 'hero never joined the systems sim'; break; }
  W.time += DT / 1000; // 1 real second = 1 game minute
  if (lastPos && lastPos.space === p.space) {
    const d = Math.hypot(p.x - lastPos.x, p.y - lastPos.y) / 32;
    if (d > 0.01 && d < 2) { pace.tiles += d; pace.walkTicks++; }
  }
  lastPos = { space: p.space, x: p.x, y: p.y };
  const fighting = !p.dead && fighter.engaged(p) && [...(S() as any).w.enemies.values()].some((e: any) => !e.dead && !e.yielded && e.space === p.space && Math.hypot(e.x - p.x, e.y - p.y) < 7 * 32);
  if (fighting) { pace.combatTicks++; if (!inFight) pace.fights++; }
  inFight = fighting;
  let move = { x: 0, y: 0 }, buttons = 0, aim = { x: p.x, y: p.y }, target: string | null = null;

  if (p.dead) {
    net.send({ type: 'act', domain: 'systems', action: 'respawn', args: {} });
    if (!wasDead) {
      wasDead = true;
      goalSince = tick; goalBest = Infinity; // the walk back from the waystone is not "can't reach"
      stats.deaths++;
      // explore goals count per target (they all share the label)
      const dk = goal?.label === 'explore' ? `explore|${goal.id}` : goal?.label ?? '?';
      const n = (deathsAt.get(dk) ?? 0) + 1;
      deathsAt.set(dk, n);
      route = null;
      if (goal?.label === 'explore' && n % 2 === 0) {
        // optional content that kills us twice: a careful player leaves it for later, not grinds for it
        skip.add(`explore|${goal.id}`);
        findings.add(`died twice exploring ${goal.id} (killed by ${lastKiller}) at L${p.save.level}: left for later`);
        goal = null;
      } else if (goal && n % 2 === 0) {
        const bossLevel = Number(goal.spot.obj?.props?.level ?? instanceDef(goal.spot.space)?.boss?.level ?? p.save.level + 2);
        grindTo = Math.max(p.save.level + 1, bossLevel + 1);
        findings.add(`died twice to ${goal.creature ?? goal.id} (L${bossLevel}, killed by ${lastKiller}) at L${p.save.level}: grinding to L${grindTo}`);
      }
    }
  } else if ((wasDead = false) || stepDialogue()) {
    // talking
  } else if (fighter.engaged(p)) {
    let hazard: string | undefined;
    ({ move, buttons, aim, target, hazard } = fighter.frame(p, tick));
    if (hazard) net.send({ type: 'act', domain: 'systems', action: 'hazard', args: { id: hazard } });
  } else {
    if (tick % 30 === 0 || !goal) {
      const g = pickGoal();
      if (typeof g === 'string') { goal = null; if (getFlag('story.act') as number >= TARGET_ACT) break; waitTicks++; if (waitTicks > 30 * 60) { stuck = g; break; } }
      else { if (g.label !== goal?.label || g.id !== goal?.id) route = null; goal = g; waitTicks = 0; }
    }
    // a goal the bot can't reach in 5 game minutes is a finding, and gets skipped
    if (goal) {
      const gk = `${goal.label}|${goal.id}`;
      if (gk !== goalKey) { goalKey = gk; goalSince = tick; goalBest = Infinity; }
      // progress towards the goal (closer by 2+ tiles, or into its space) restarts the clock
      const dist = p.space === goal.spot.space ? Math.hypot(p.x / 32 - goal.spot.at[0], p.y / 32 - goal.spot.at[1]) : 1e6 + (p.space.startsWith('inst:') ? 0 : 1);
      if (dist < goalBest - 2) { goalBest = dist; goalSince = tick; }
      // a hunt or a grind that is killing things is getting somewhere, wherever it stands
      if (goal.kind === 'kill' && lastKillTick > goalSince) goalSince = lastKillTick;
      if (tick - goalSince > 30 * 300 && !(goal.kind === 'kill' && p.space === goal.spot.space && Math.hypot(p.x / 32 - goal.spot.at[0], p.y / 32 - goal.spot.at[1]) < 25)) {
        findings.add(`can't reach ${goal.kind} ${goal.id} at ${goal.spot.space} ${goal.spot.at} in 5 min (hero at ${p.space} ${Math.floor(p.x / 32)},${Math.floor(p.y / 32)}; ${goal.label})`);
        skip.add(gk); goal = null; route = null; goalKey = '';
      }
    }
    if (goal) {
      if (goal.label !== lastGoalLabel) { log.push(`${Math.round(tick / 1800)}m ${goal.kind} ${goal.id} — ${goal.label}`); lastGoalLabel = goal.label; }
      const npcPx = goal.kind === 'talk' ? npcsIn(p.space, npcPlacements()).find((n) => n.npc.id === goal!.id) : null;
      const inRect = goal.kind === 'reach' && goal.spot.obj?.size ? tileDist(goal.spot.obj, p.x, p.y) === 0 : null;
      const here = p.space === goal.spot.space && (inRect !== null ? inRect : npcPx ? Math.hypot(p.x - npcPx.x, p.y - npcPx.y) < 2.8 * 32 : Math.hypot(p.x / 32 - goal.spot.at[0] - 0.5, p.y / 32 - goal.spot.at[1] - 0.5) < (goal.kind === 'kill' && !goal.boss ? (goal.story ? 6 : 22) : goal.kind === 'reach' ? 0.7 : 2.2));
      if (here) {
        route = null;
        if ((goal.kind === 'talk' || goal.kind === 'use') && tick % 30 === 0) {
          const key = `${goal.label}|${goal.id}`;
          const n = (tries.get(key) ?? 0) + 1;
          tries.set(key, n);
          if (n > 3) {
            skip.add(key);
            const o = opened.get(key) ?? 0;
            // for Claude 4's repro-talk (FLAGS=…): the exact flag state when a talk opened nothing
            if (goal.kind === 'talk' && !o && process.env.DUMP) writeFileSync(`${process.env.DUMP}/flags-${goal.id.slice(4)}.json`, JSON.stringify({ hour: clock().hour, flags: Game.state.flags, quests: Game.state.narrative.quests }));
            findings.add(goal.kind === 'talk'
              ? (o ? `talking to ${goal.id} opened ${o} dialogue(s) but did not advance ${goal.label}` : `talking to ${goal.id} opens no dialogue (${goal.label}; hero at ${p.space} ${Math.floor(p.x / 32)},${Math.floor(p.y / 32)})`)
              : `using ${goal.id} does nothing (${goal.label})`);
          } else {
            activeKey = key;
            if (process.env.DEBUG && goal.kind === 'talk') {
              const d = dialogue as any;
              const np = whereNpc(goal.id, npcPlacements());
              console.log(`[talk] ${goal.id} try ${n}: open=${d.def?.id ?? '-'} queue=${d.queue?.length ?? 0} hero=${p.space} ${Math.floor(p.x / 32)},${Math.floor(p.y / 32)} npc=${np ? `${np.space} ${np.at}` : 'none'}`);
            }
            net.send({ type: 'act', domain: 'world', action: 'use', args: { id: goal.id } });
            if (goal.kind === 'talk') stats.talks++; else { used.add(goal.id); stats.uses++; if (goal.label === 'explore') explored++; }
          }
        }
        else if (goal.kind === 'kill') {
          // hunt: the wanted creature first, else anything in the zone (killing frees spawn slots for it)
          const en = [...(S() as any).w.enemies.values()].filter((e: any) => !e.dead && !e.yielded && e.team === 'enemies' && e.space === p.space && Math.hypot(e.x - p.x, e.y - p.y) < 25 * 32);
          en.sort((a: any, b: any) => (a.def === goal!.creature ? 0 : 1) - (b.def === goal!.creature ? 0 : 1) || Math.hypot(a.x - p.x, a.y - p.y) - Math.hypot(b.x - p.x, b.y - p.y));
          if (en[0]) {
            if (!hunt || tick % 60 === 0) hunt = pathTo(p, [Math.floor(en[0].x / 32), Math.floor(en[0].y / 32)]);
            if (hunt) { const m = follow(p, hunt); if (m) move = m; else hunt = null; }
          }
        }
        if (goal.kind !== 'kill') hunt = null;
        goal = goal.kind === 'kill' || goal.kind === 'reach' ? goal : null;
      } else {
        if (!route || route.space !== p.space) { const why = plan(goal); if (why && process.env.DEBUG && tick % 300 === 0) console.log(`[plan-fail] ${why}`); if (why) { if (++waitTicks > 30 * 60) { stuck = why; break; } } }
        if (route) {
          const m = follow(p, route);
          if (m) move = m;
          else {
            if (route.i >= route.path.length && route.then) { net.send({ type: 'act', domain: 'world', action: 'use', args: { id: route.then } }); stats.uses++; }
            route = null;
          }
        }
      }
    }
  }
  if (tick % 300 === 0) { spendPoints(); equipUpgrades(); }
  if (process.env.DEBUG && tick < 30 * 120 && tick % 60 === 0) console.log(`[early] t${tick / 30}s @${Math.floor(p.x / 32)},${Math.floor(p.y / 32)} move=${move.x.toFixed(2)},${move.y.toFixed(2)} dlg=${(dialogue as any).def?.id ?? '-'} frozen=${(S() as any).w.frozen} engaged=${fighter.engaged(p)} route=${route ? `${route.i}/${route.path.length}` : '-'} goal=${goal?.id ?? '-'}`);
  if (process.env.DEBUG && tick % 900 === 0 && goal?.kind === 'kill') {
    const ks = questKills();
    console.log(`[story] kills=${JSON.stringify(ks)} live=${[...(S() as any).w.enemies.values()].filter((e: any) => !e.dead && e.def === goal!.creature).length}`);
  }
  // stalemate: in a boss fight for 2+ game minutes without the boss losing 3% → grind two levels, then retry
  if (tick % 1800 === 0 && goal?.boss && !p.dead) {
    const b = [...(S() as any).w.enemies.values()].find((e: any) => e.def === goal!.creature && !e.dead && !e.yielded && e.space === p.space);
    if (b) {
      bossHp.push(b.hp / b.maxHp);
      if (bossHp.length >= 5 && bossHp[bossHp.length - 1] > bossHp[bossHp.length - 5] - 0.03) {
        if (p.save.level > (b.level ?? 0) + 3) { findings.add(`stalemate vs ${goal.creature} L${b.level} at L${p.save.level} (already well above it)`); bossHp.length = 0; } else {
        grindTo = p.save.level + 2;
        findings.add(`stalemate vs ${goal.creature} (${Math.round(b.hp)}/${b.maxHp}) at L${p.save.level}: grinding to L${grindTo}`);
        bossHp.length = 0;
        goal = null; route = null;
        }
      }
    } else bossHp.length = 0;
  }
  if (process.env.DEBUG && tick % (30 * (p.space.startsWith('inst:') ? 60 : 300)) === 0) {
    const en = [...(S() as any).w.enemies.values()].filter((e: any) => !e.dead && e.space === p.space);
    console.log(`[${Math.round(tick / 1800)}m] ${p.space} @${Math.floor(p.x / 32)},${Math.floor(p.y / 32)} hp ${Math.round(p.hp)}/${p.maxHp} L${p.save.level} goal ${goal ? `${goal.kind} ${goal.id} @${goal.spot.space}:${goal.spot.at}` : '-'} route ${route ? `${route.i}/${route.path.length}` : '-'} enemies ${en.length}${en.slice(0, 3).map((e: any) => ` ${e.def}@${Math.floor(e.x / 32)},${Math.floor(e.y / 32)} hp ${Math.round(e.hp)}/${e.maxHp} ai ${e.ai}${e.flying ? ' fly' : ''}`).join('')} wait ${waitTicks}`);
  }
  const frame: InputFrame = { seq: tick, t: tick * DT, move, aim, buttons, target };
  net.send({ type: 'input', frames: [frame] });
  sim.advance(DT);
  // progress watch: no quest movement for 40 game minutes → stop and report
  // progress = quests, act, or the hero getting stronger (grinding counts)
  const s = JSON.stringify(Game.state.narrative.quests) + getFlag('story.act') + '|' + (p.save.level ?? 0) + ':' + Math.floor((p.save.xp ?? 0) / 50);
  if (s !== sig) { sig = s; sameFor = 0; } else if (++sameFor > 30 * 60 * 40) { stuck = `no progress for 40 min at ${goal?.label ?? '-'} (${goal ? `${goal.kind} ${goal.id} in ${goal.spot.space}` : 'no goal'})`; break; }
  if ((getFlag('story.act') as number ?? 1) >= TARGET_ACT) break;
}

function equipUpgrades(): void {
  const c = character();
  for (const it of [...c.inventory]) {
    const info = itemInfo(it.base);
    if (!info) continue;
    for (const slot of slotsFor(info)) {
      const worn = c.equipment[slot];
      if (worn && worn.ilvl >= it.ilvl) continue;
      if (!equip(it.uid, slot)) { stats.equips++; break; } // null = equipped
    }
  }
}

function spendPoints(): void {
  const c = character();
  let any = false;
  for (let g = 0; g < 50 && availablePoints(c) > 0; g++) {
    const n = allNodes(c.classId).find((x) => canLearn(c.classId, x.id, c.tree, availablePoints(c)).ok);
    if (!n) break;
    c.tree[n.id] = (c.tree[n.id] ?? 0) + 1;
    any = true;
    stats.points++;
  }
  if (any) sendLoadout();
}

const p = hero();
const done = (Registry.all('quest') as QuestDef[]).filter((x) => (x.campaign === CLASS || x.campaign === 'shared') && progress(x.id)?.completed).length;
console.log(JSON.stringify({
  class: CLASS, act: getFlag('story.act') ?? 1, simHours: +(tick / 30 / 3600).toFixed(2), level: p?.save.level, space: p?.space,
  human: (() => {
    const walk = pace.walkTicks / 30 / 0.6, combat = (pace.combatTicks / 30) * 1.5, read = ((pace.words + pace.journal) / 200) * 60, menus = (stats.equips + stats.points) * 8, quests = done * 120, stage = stages * 30;
    // the careful reader: every node of every conversation the bot opened, at the same 200 wpm (reported, not added to hours)
    const full = ([...opens].reduce((n, id) => n + treeWords(id), 0) / 200) * 60;
    const h = (x: number) => +(x / 3600).toFixed(2);
    return { hours: h(walk + combat + read + menus + quests + stage), walkH: h(walk), combatH: h(combat), readH: h(read), menusH: h(menus), questsH: h(quests), stagesH: h(stage), readFullH: h(full) };
  })(),
  acts: { explored, places: places.size, fightsPerQuest: done ? +(pace.fights / done).toFixed(1) : null, stages, banter, dialogues: opens.size },
  pace: { tiles: Math.round(pace.tiles), fights: pace.fights, combatMin: Math.round(pace.combatTicks / 30 / 60), nodes: pace.nodes, words: pace.words, journalWords: pace.journal },
  questsDone: done, quests: mine.length, ...stats, deathsAt: Object.fromEntries(deathsAt), stuck, findings: [...findings], deathLog: deathLog.slice(-12), xpBy, hazards: fighter.hazardUses, gearIlvl: (() => { const w = Object.values(character().equipment).filter(Boolean) as { ilvl: number }[]; return w.length ? Math.round(w.reduce((n, x) => n + x.ilvl, 0) / w.length) : 0; })(),
  lastGoals: log.slice(-8),
}));
void questDef;
