/**
 * Co-op party fights (Claude 5 for Claude 1, 2026-10-21): 1–4 bot heroes in one seeded Sim with the real party scaling
 * (ports.partySize → creature HP / pack counts) and the real downed / revive / wipe rules (sim/coop.ts). Each hero
 * plays builds-fight.ts's Bot logic (chooseSlot, slash, potions, dodge, kite) and walks into basic-attack reach; a downed ally gets one helper, who walks
 * over and holds F for the 3 s channel (a hit taken pauses it, as in play).
 * Used by coop-balance.ts.
 */
import { Btn, type InputFrame } from '@/net/types';
import { partyHpMult } from '@/systems/rules/curves';
import type { CreatureTier } from '@/core/hc';
import { hasSlash } from '@/systems/rules/slash';
import type { CharacterSave } from '@/systems/rules/types';
import { BASIC } from '@/systems/sim/player';
import { Sim } from '@/systems/sim/Sim';
import type { EnemyEnt, PlayerEnt } from '@/systems/sim/state';
import type { SimPorts } from '@/systems/sim/world';
import { CAST, chooseSlot, DT, foesOf, type Spawn } from './builds-fight';

export interface Member {
  cls: string; dealt: number; taken: number; healed: number; potions: number; downs: number; revivesGiven: number; deaths: number; downedSecs: number;
  /** seconds kneeling in range with F held, and of those the seconds a hit taken paused the channel (sim/coop.ts) */
  kneel: number; blockedHit: number;
  /** seconds standing with a target beyond basic-attack reach, and healing given to other heroes */
  outOfReach: number; healedOthers: number; fightSecs: number;
  /** what the hero was doing while out of reach (seconds): dodging a wind-up, leaving a zone, in a move (dash / knockback),
   * held (stun, root…), walking in (chase), or standing */
  oorWhy: Record<string, number>;
}
/** bot variants for A/B runs: chase = walk into basic-attack reach when the target is beyond it */
export interface BotOpts {
  /** walk into basic-attack reach (default on: without it a melee hero not being chased stood out of reach, coop-ab.ts) */
  chase?: boolean;
  /** ranged heroes hold their ground instead of kiting while an ally is standing */
  holdRanged?: boolean;
  /** filled every 15 ticks (0.5 s): the big foe's position and target, each hero's distance, reach and state */
  trace?: TraceRow[];
}
export interface TraceRow { t: number; foe: { x: number; y: number; target: string | null; windup: string | null }; heroes: { cls: string; x: number; y: number; d: number; reach: number; why: string }[] }
export interface PartyResult { won: boolean; wiped: boolean; secs: number; members: Member[]; crash?: string }

const SPOTS: [number, number][] = [[0, 0], [0, 44], [0, -44], [-36, 0]];

/** One fight for a party (index 0 is the host); lost on a wipe or after capSecs. foeDmg multiplies every foe's damage
 * (a stress test for downs and revives). */
export function runParty(saves: CharacterSave[], spawns: Spawn[], seed: number, capSecs = 600, foeDmg = 1, hpMult?: (tier: CreatureTier, n: number) => number, bot: BotOpts = {}): PartyResult {
  const n = saves.length, ids = saves.map((_, i) => `h${i}`);
  const members: Member[] = saves.map((s) => ({ cls: s.classId, dealt: 0, taken: 0, healed: 0, potions: 0, downs: 0, revivesGiven: 0, deaths: 0, downedSecs: 0, kneel: 0, blockedHit: 0, outOfReach: 0, healedOthers: 0, fightSecs: 0, oorWhy: {} }));
  let sim: Sim | undefined, wiped = false;
  const idx = (playerId: string) => ids.indexOf(playerId);
  const ownerIdx = (id: string): number => {
    if (id.startsWith('p:')) return idx(id.slice(2));
    const e = sim?.w.enemies.get(id);
    return e?.ownerId ? idx(e.ownerId.replace(/^p:/, '')) : -1;
  };
  const ports: SimPorts = {
    move: (_s, x, y, dx, dy) => ({ x: Math.max(-2000, Math.min(2000, x + dx)), y: Math.max(-2000, Math.min(2000, y + dy)) }),
    clear: () => true, zoneRule: () => 'wild', respawnPoint: () => ({ space: 'test', x: 0, y: 0 }),
    emit: (name, payload) => {
      const pl = payload as { playerId?: string; by?: string; sourceId?: string; targetId?: string; amount?: number; kind?: string; def?: string };
      if (name === 'combat:hit') {
        const src = ownerIdx(pl.sourceId ?? ''), tgt = ownerIdx(pl.targetId ?? '');
        if (pl.kind === 'dmg' && src >= 0 && tgt < 0) members[src].dealt += pl.amount ?? 0;
        if (pl.kind === 'heal' && tgt >= 0) members[tgt].healed += pl.amount ?? 0;
        if (pl.kind === 'heal' && tgt >= 0 && src >= 0 && src !== tgt) members[src].healedOthers += pl.amount ?? 0;
      } else if (name === 'player:damaged') { const i = idx(pl.playerId ?? ''); if (i >= 0) members[i].taken += pl.amount ?? 0; }
      else if (name === 'item:used') { const i = idx(pl.playerId ?? ''); if (i >= 0 && /^i_(hp|em)_/.test(String(pl.def))) members[i].potions++; }
      else if (name === 'player:downed') { const i = idx(pl.playerId ?? ''); if (i >= 0) members[i].downs++; }
      else if (name === 'player:revived') { const i = idx(pl.by ?? ''); if (i >= 0) members[i].revivesGiven++; }
      else if (name === 'player:died') { const i = idx(pl.playerId ?? ''); if (i >= 0) members[i].deaths++; }
      else if (name === 'party:wiped') wiped = true;
    },
    partySize: () => n, realmRule: () => 'peaceful',
  };
  sim = new Sim(ports, seed);
  sim.shopEnv = { flag: (k) => /names_read|nobody_named/.test(k), priceMult: () => 1 };
  const ps: PlayerEnt[] = saves.map((s, i) => sim!.addPlayer(ids[i], structuredClone(s), { space: 'test', x: SPOTS[i][0], y: SPOTS[i][1] }));
  for (const s of spawns) {
    const e = sim.w.enemies.get(sim.spawn({ creature: s.creature, level: s.level, space: 'test', x: s.x, y: s.y, tier: s.tier, elite: s.elite }));
    if (!e) continue;
    e.dmg *= foeDmg;
    // test-only: another party HP curve in place of rules/curves.ts partyHpMult (proposals)
    if (hpMult) { e.maxHp = e.hp = Math.round((e.maxHp / partyHpMult(n, e.tier)) * hpMult(e.tier, n)); }
  }
  const seq = ids.map(() => 0), held = ids.map(() => 0);
  const result = (won: boolean, ticks: number, crash?: string): PartyResult => ({ won, wiped, secs: Math.round(ticks / 30), members, ...(crash ? { crash } : {}) });
  for (let tick = 1; tick <= 30 * capSecs; tick++) {
    const foes = foesOf(sim);
    if (!foes.length) return result(ps.some((p) => !p.dead && !p.downed), tick);
    if (wiped || ps.every((p) => p.dead || p.downed)) return result(false, tick);
    // one helper per downed ally: the nearest standing hero
    const helperOf = new Map<PlayerEnt, PlayerEnt>();
    for (const d of ps.filter((p) => p.downed)) {
      const h = ps.filter((p) => !p.dead && !p.downed && ![...helperOf.values()].includes(p)).sort((a, b) => Math.hypot(a.x - d.x, a.y - d.y) - Math.hypot(b.x - d.x, b.y - d.y))[0];
      if (h) helperOf.set(h, d);
    }
    const frames = new Map<string, InputFrame[]>();
    const traceNow: TraceRow['heroes'] = [];
    ps.forEach((p, i) => {
      if (p.downed) members[i].downedSecs += DT / 1000;
      let buttons = 0, mx = 0, my = 0, aim = { x: p.x, y: p.y + 40 }, target: string | null = null;
      const ward = helperOf.get(p);
      if (p.dead || p.downed) { /* idle */ }
      else if (ward) {
        const d = Math.hypot(ward.x - p.x, ward.y - p.y) || 1;
        if (d > 30) { mx = (ward.x - p.x) / d; my = (ward.y - p.y) / d; } else {
          buttons = Btn.INTERACT; members[i].kneel += DT / 1000;
          if (sim!.w.t - (p.hurtAt ?? -Infinity) <= 500) members[i].blockedHit += DT / 1000;
        }
        aim = { x: ward.x, y: ward.y };
      } else {
        foes.sort((a, b) => Math.hypot(a.x - p.x, a.y - p.y) - Math.hypot(b.x - p.x, b.y - p.y));
        const big = foes.find((e) => e.tier !== 'enemy');
        const t: EnemyEnt = big && Math.hypot(foes[0].x - p.x, foes[0].y - p.y) > 60 ? big : foes[0];
        const d = Math.hypot(t.x - p.x, t.y - p.y) || 1;
        buttons = Btn.ATTACK;
        if (tick % 15 === (i * 4) % 15) { const slot = chooseSlot(sim!, p); if (slot !== undefined) buttons |= CAST[slot]; }
        if (hasSlash(p.save.classId) && tick % 2 === 0 && sim!.w.t >= (p.cds.get('slash') ?? 0)) buttons |= Btn.SLASH;
        if (p.hp < p.maxHp * 0.4) buttons |= Btn.POTION_Q;
        if (p.ember < 20) buttons |= Btn.POTION_E;
        const winding = foes.find((e) => e.windup && e.windup.label !== 'basic' && Math.hypot(e.x - p.x, e.y - p.y) < 320);
        if (winding && tick % 4 === 0) buttons |= Btn.DASH;
        const melee = !['bow', 'staff', 'wand'].includes(p.weapon.type);
        const reach = ({ ...BASIC[p.weapon.type], ...(p.kit.basic ?? {}) }).range + t.r;
        members[i].fightSecs += DT / 1000;
        if (d > reach) members[i].outOfReach += DT / 1000;
        const allies = ps.some((o) => o !== p && !o.dead && !o.downed);
        if (!melee && d < 120 && !(bot.holdRanged && allies)) { mx = (p.x - t.x) / d; my = (p.y - t.y) / d; }
        else if ((bot.chase ?? true) && d > reach - 6) { mx = (t.x - p.x) / d; my = (t.y - p.y) / d; }
        const zone = [...sim!.w.zones.values()].find((z) => z.team === 'enemies' && Math.hypot(z.x - p.x, z.y - p.y) < (z.area.r ?? 60) + 14);
        if (zone) { const zd = Math.hypot(p.x - zone.x, p.y - zone.y) || 1; mx = (p.x - zone.x) / zd; my = (p.y - zone.y) / zd; }
        if (winding) { const wd = Math.hypot(p.x - winding.x, p.y - winding.y) || 1; mx = (p.x - winding.x) / wd - (p.y - winding.y) / wd * 0.5; my = (p.y - winding.y) / wd + (p.x - winding.x) / wd * 0.5; }
        const why0 = p.motion ? 'moving (dash / knockback)' : p.statuses.has('stun') || p.statuses.has('root') || p.statuses.has('freeze') ? 'held (stun / root)' : winding ? 'dodging a wind-up' : zone ? 'leaving a zone' : mx || my ? 'walking in / kiting' : 'standing';
        if (bot.trace && tick % 15 === 0) traceNow.push({ cls: p.save.classId, x: Math.round(p.x), y: Math.round(p.y), d: Math.round(d), reach: Math.round(reach), why: d > reach ? why0 : 'in reach' });
        if (d > reach) {
          const why = p.motion ? 'moving (dash / knockback)' : p.statuses.has('stun') || p.statuses.has('root') || p.statuses.has('freeze') ? 'held (stun / root)' : winding ? 'dodging a wind-up' : zone ? 'leaving a zone' : mx || my ? 'walking in / kiting' : 'standing';
          members[i].oorWhy[why] = (members[i].oorWhy[why] ?? 0) + DT / 1000;
        }
        aim = { x: t.x, y: t.y }; target = t.id;
      }
      const hold = Btn.ATTACK | Btn.INTERACT;
      frames.set(ids[i], [{ seq: ++seq[i], t: sim!.w.t, move: { x: mx, y: my }, aim, buttons: (buttons & ~held[i]) | (buttons & hold), target }]);
      held[i] = buttons & ~hold;
    });
    if (bot.trace && tick % 15 === 0) {
      const big = foes.find((e) => e.tier !== 'enemy') ?? foes[0];
      bot.trace.push({ t: Math.round(sim.w.t / 100) / 10, foe: { x: Math.round(big.x), y: Math.round(big.y), target: big.targetId ? (ids[ps.findIndex((p) => p.id === big.targetId)] ? saves[ps.findIndex((p) => p.id === big.targetId)].classId : big.targetId) : null, windup: big.windup?.label ?? null }, heroes: traceNow });
    }
    try {
      sim.step(DT, tick, frames);
      // presses are edges: release them on a tiny second step (the held ones stay down)
      if (held.some(Boolean)) {
        const rel = new Map([...frames].map(([id, [f]]) => [id, [{ ...f, seq: ++seq[ids.indexOf(id)], buttons: f.buttons & (Btn.ATTACK | Btn.INTERACT) }]]));
        held.fill(0);
        sim.step(0.0001, tick, rel);
      }
    } catch (e) { return result(false, tick, (e as Error).stack?.split('\n').slice(0, 3).join(' | ')); }
  }
  return result(false, 30 * capSecs);
}
