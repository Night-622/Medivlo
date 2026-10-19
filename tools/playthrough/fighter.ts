/**
 * The playthrough bot's hands in a fight, after Claude 3's tools/e2e/sim/fight.ts: focus the big one unless an
 * add is on top of us, cast a ready hotbar slot every half second, drink below 40% HP or 20 ember, dash out of
 * telegraphs, kite with ranged weapons, step out of hostile ground. After a fight, walk over nearby loot.
 * In a boss room, play the arena (Claude 3's hazards): light a lantern and fight in it, douse or turn vents,
 * strike pillars down, stand behind an anchor so the boss charges into it.
 */
import { Btn } from '@/net';

const AGGRO = 7 * 32;
const LOOT = 8 * 32;

/* eslint-disable @typescript-eslint/no-explicit-any */
type Sim = { w: { t: number; enemies: Map<string, any>; zones: Map<string, any>; loot: Map<string, any>; hazards?: Map<string, any> } };
const HAZARD_REACH = 44;

export class Fighter {
  private held = 0;
  /** hazard uses this run, by kind (for the report) */
  readonly hazardUses: Record<string, number> = {};
  private nextHazard = 0;
  /** ticks spent walking at each loot drop: give up on ones we can't reach (behind a wall, across water) */
  private lootTries = new Map<string, number>();
  /** @param los is there a clear line between two points (walls, fences, buildings)? */
  constructor(private sim: () => unknown, private me: string, private los: (space: string, x0: number, y0: number, x1: number, y1: number) => boolean = () => true) {}

  private w(): Sim['w'] { return (this.sim() as Sim).w; }

  private foes(p: any): any[] {
    // only foes we can actually get at: one behind a wall or fence would pin us against it
    return [...this.w().enemies.values()].filter((e) => !e.dead && !e.yielded && e.team === 'enemies' && e.space === p.space && Math.hypot(e.x - p.x, e.y - p.y) < AGGRO && this.los(p.space, p.x, p.y, e.x, e.y));
  }

  private loot(p: any): any | null {
    let best: any = null, bd = LOOT;
    for (const l of this.w().loot.values()) {
      if (l.space !== p.space || (this.lootTries.get(l.id) ?? 0) > 150) continue;
      const d = Math.hypot(l.x - p.x, l.y - p.y);
      if (d < bd) { bd = d; best = l; }
    }
    return best;
  }

  /** Is there anything to fight (or pick up) right here? */
  engaged(p: any): boolean { return this.foes(p).length > 0 || !!this.loot(p); }

  /**
   * Arena play while a boss is up: where to stand (overrides the chase) and which hazard to use. Light: keep the
   * nearest lantern lit and fight inside it. Vent / pillar: walk to the nearest live one and use it. Anchor: stand
   * on the far side of the nearest one from the boss.
   */
  private arena(p: any, boss: any): { go?: { x: number; y: number }; use?: string } {
    const hz = [...(this.w().hazards?.values() ?? [])].filter((h) => h.space === p.space && h.charges > 0);
    if (!hz.length) return {};
    const t = this.w().t;
    const near = (l: any[]) => l.sort((a, b) => Math.hypot(a.x - p.x, a.y - p.y) - Math.hypot(b.x - p.x, b.y - p.y))[0];
    const reach = (h: any) => Math.hypot(h.x - p.x, h.y - p.y) <= h.r + HAZARD_REACH;
    const lights = hz.filter((h) => h.kind === 'light');
    if (lights.length) {
      const lit = lights.filter((h) => h.activeUntil > t + 3000);
      const h = near(lit.length ? lit : lights);
      if (h.activeUntil <= t + 3000) return reach(h) ? { use: h.id } : { go: h };
      // fight in the light: drift back to its middle when the boss isn't in it
      return Math.hypot(boss.x - h.x, boss.y - h.y) > h.r * 0.8 ? { go: h } : {};
    }
    const work = hz.filter((h) => (h.kind === 'vent' && h.dousedUntil < t && h.turnedUntil < t) || h.kind === 'pillar');
    if (work.length) { const h = near(work); return reach(h) ? { use: h.id } : { go: h }; }
    const anchors = hz.filter((h) => h.kind === 'anchor');
    // only bait a boss that charges or leaps (Claude 3: a walker just gets pinned on the stone, out of sight)
    if (anchors.length && this.charges(boss) && Math.hypot(boss.x - p.x, boss.y - p.y) > 80) {
      const h = near(anchors);
      const d = Math.hypot(h.x - boss.x, h.y - boss.y) || 1;
      return { go: { x: h.x + ((h.x - boss.x) / d) * (h.r + 20), y: h.y + ((h.y - boss.y) / d) * (h.r + 20) } };
    }
    return {};
  }

  private chargers = new Map<string, boolean>();
  /** does this creature have a charge or leap move (ability or phase action)? */
  private charges(e: any): boolean {
    if (!this.chargers.has(e.def)) this.chargers.set(e.def, /"mode":"(charge|leap)"/.test(JSON.stringify(e.cdef ?? {})));
    return this.chargers.get(e.def)!;
  }

  frame(p: any, tick: number): { move: { x: number; y: number }; buttons: number; aim: { x: number; y: number }; target: string | null; hazard?: string } {
    const foes = this.foes(p);
    if (!foes.length) {
      const l = this.loot(p);
      if (l) this.lootTries.set(l.id, (this.lootTries.get(l.id) ?? 0) + 1);
      const d = l ? Math.hypot(l.x - p.x, l.y - p.y) || 1 : 1;
      return { move: l ? { x: (l.x - p.x) / d, y: (l.y - p.y) / d } : { x: 0, y: 0 }, buttons: 0, aim: { x: p.x, y: p.y }, target: null };
    }
    foes.sort((a, b) => Math.hypot(a.x - p.x, a.y - p.y) - Math.hypot(b.x - p.x, b.y - p.y));
    const big = foes.find((e) => e.tier !== 'enemy');
    const t = big && Math.hypot(foes[0].x - p.x, foes[0].y - p.y) > 60 ? big : foes[0];
    const d = Math.hypot(t.x - p.x, t.y - p.y) || 1;
    let buttons = Btn.ATTACK;
    if (tick % 15 === 0) {
      const slot = [0, 1, 2, 3].find((i) => { const id = p.save.hotbar[i]; return id && this.w().t >= (p.cds.get(id) ?? 0); });
      if (slot !== undefined) buttons |= [Btn.CAST1, Btn.CAST2, Btn.CAST3, Btn.CAST4][slot];
    }
    if (p.hp < p.maxHp * 0.4) buttons |= Btn.POTION_Q;
    if (p.ember < 20) buttons |= Btn.POTION_E;
    const winding = foes.find((e) => e.windup && e.windup.label !== 'basic' && Math.hypot(e.x - p.x, e.y - p.y) < 160);
    if (winding && tick % 4 === 0) buttons |= Btn.DASH;
    const melee = !['bow', 'staff', 'wand'].includes(p.weapon?.type);
    // close in with melee, keep range with ranged weapons
    let mx = melee ? (d > 30 ? (t.x - p.x) / d : 0) : d < 120 ? (p.x - t.x) / d : d > 220 ? (t.x - p.x) / d : 0;
    let my = melee ? (d > 30 ? (t.y - p.y) / d : 0) : d < 120 ? (p.y - t.y) / d : d > 220 ? (t.y - p.y) / d : 0;
    const zone = [...this.w().zones.values()].find((z) => z.team === 'enemies' && Math.hypot(z.x - p.x, z.y - p.y) < (z.area?.r ?? 60) + 14);
    let hazard: string | undefined;
    if (big) {
      const a = this.arena(p, big);
      if (a.use && this.w().t >= this.nextHazard) {
        hazard = a.use;
        this.nextHazard = this.w().t + 600;
        const k = this.w().hazards!.get(a.use).kind;
        this.hazardUses[k] = (this.hazardUses[k] ?? 0) + 1;
      }
      if (a.go) { const gd = Math.hypot(a.go.x - p.x, a.go.y - p.y); if (gd > 10) { mx = (a.go.x - p.x) / gd; my = (a.go.y - p.y) / gd; } else { mx = 0; my = 0; } }
    }
    if (zone) { const zd = Math.hypot(p.x - zone.x, p.y - zone.y) || 1; mx = (p.x - zone.x) / zd; my = (p.y - zone.y) / zd; }
    if (winding) { const wd = Math.hypot(p.x - winding.x, p.y - winding.y) || 1; mx = (p.x - winding.x) / wd - (p.y - winding.y) / wd * 0.5; my = (p.y - winding.y) / wd + (p.x - winding.x) / wd * 0.5; }
    // presses are edges: release held buttons every other frame
    const out = buttons & ~this.held | (buttons & Btn.ATTACK);
    this.held = this.held ? 0 : buttons & ~Btn.ATTACK;
    void this.me;
    return { move: { x: mx, y: my }, buttons: out, aim: { x: t.x, y: t.y }, target: t.id, hazard };
  }
}
