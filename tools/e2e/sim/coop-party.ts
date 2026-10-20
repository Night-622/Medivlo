/**
 * Co-op party fights (Claude 5 for Claude 1, 2026-10-21): 1–4 bot heroes in one seeded Sim with the real party scaling
 * (ports.partySize → creature HP / pack counts) and the real downed / revive / wipe rules (sim/coop.ts). Each hero
 * plays builds-fight.ts's Bot logic (chooseSlot, slash, potions, dodge, kite); a downed ally gets one helper, who walks
 * over, waits out the 0.5 s combat lock and holds F for the 3 s channel (a hit on the helper resets it, as in play).
 * Used by coop-balance.ts.
 */
import { Btn, type InputFrame } from '@/net/types';
import { partyHpMult } from '@/systems/rules/curves';
import type { CreatureTier } from '@/core/hc';
import { hasSlash } from '@/systems/rules/slash';
import type { CharacterSave } from '@/systems/rules/types';
import { Sim } from '@/systems/sim/Sim';
import type { EnemyEnt, PlayerEnt } from '@/systems/sim/state';
import type { SimPorts } from '@/systems/sim/world';
import { CAST, chooseSlot, DT, foesOf, type Spawn } from './builds-fight';

export interface Member {
  cls: string; dealt: number; taken: number; healed: number; potions: number; downs: number; revivesGiven: number; deaths: number; downedSecs: number;
  /** seconds kneeling in range with F held, and of those the seconds the 0.5 s combat lock blocked: by this hero's own
   * damage (hits, DoTs, zones, all count as the source) or by being hit */
  kneel: number; blockedOwn: number; blockedHit: number;
}
export interface PartyResult { won: boolean; wiped: boolean; secs: number; members: Member[]; crash?: string }

const SPOTS: [number, number][] = [[0, 0], [0, 44], [0, -44], [-36, 0]];

/** One fight for a party (index 0 is the host); lost on a wipe or after capSecs. foeDmg multiplies every foe's damage
 * (a stress test for downs and revives). */
export function runParty(saves: CharacterSave[], spawns: Spawn[], seed: number, capSecs = 600, foeDmg = 1, hpMult?: (tier: CreatureTier, n: number) => number): PartyResult {
  const n = saves.length, ids = saves.map((_, i) => `h${i}`);
  const members: Member[] = saves.map((s) => ({ cls: s.classId, dealt: 0, taken: 0, healed: 0, potions: 0, downs: 0, revivesGiven: 0, deaths: 0, downedSecs: 0, kneel: 0, blockedOwn: 0, blockedHit: 0 }));
  const lastDealt = saves.map(() => -1e9), lastHit = saves.map(() => -1e9);
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
        if (pl.kind === 'dmg' && (pl.sourceId ?? '').startsWith('p:') && src >= 0) lastDealt[src] = sim!.w.t;
        if (pl.kind === 'dmg' && (pl.targetId ?? '').startsWith('p:') && tgt >= 0) lastHit[tgt] = sim!.w.t;
        if (pl.kind === 'heal' && tgt >= 0) members[tgt].healed += pl.amount ?? 0;
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
    ps.forEach((p, i) => {
      if (p.downed) members[i].downedSecs += DT / 1000;
      let buttons = 0, mx = 0, my = 0, aim = { x: p.x, y: p.y + 40 }, target: string | null = null;
      const ward = helperOf.get(p);
      if (p.dead || p.downed) { /* idle */ }
      else if (ward) {
        const d = Math.hypot(ward.x - p.x, ward.y - p.y) || 1;
        if (d > 30) { mx = (ward.x - p.x) / d; my = (ward.y - p.y) / d; } else {
          buttons = Btn.INTERACT; members[i].kneel += DT / 1000;
          if (sim!.w.t <= p.inCombatUntil - 4500) { if (sim!.w.t - lastHit[i] < 500) members[i].blockedHit += DT / 1000; else if (sim!.w.t - lastDealt[i] < 500) members[i].blockedOwn += DT / 1000; }
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
        if (!melee && d < 120) { mx = (p.x - t.x) / d; my = (p.y - t.y) / d; }
        const zone = [...sim!.w.zones.values()].find((z) => z.team === 'enemies' && Math.hypot(z.x - p.x, z.y - p.y) < (z.area.r ?? 60) + 14);
        if (zone) { const zd = Math.hypot(p.x - zone.x, p.y - zone.y) || 1; mx = (p.x - zone.x) / zd; my = (p.y - zone.y) / zd; }
        if (winding) { const wd = Math.hypot(p.x - winding.x, p.y - winding.y) || 1; mx = (p.x - winding.x) / wd - (p.y - winding.y) / wd * 0.5; my = (p.y - winding.y) / wd + (p.x - winding.x) / wd * 0.5; }
        aim = { x: t.x, y: t.y }; target = t.id;
      }
      const hold = Btn.ATTACK | Btn.INTERACT;
      frames.set(ids[i], [{ seq: ++seq[i], t: sim!.w.t, move: { x: mx, y: my }, aim, buttons: (buttons & ~held[i]) | (buttons & hold), target }]);
      held[i] = buttons & ~hold;
    });
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
