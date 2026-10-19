/**
 * Buildup meters + timed statuses for one combatant (SYSTEMS.md §2.5). Pure; the runtime applies effects.
 */
import type { BuildupStatus, StatusId } from '@/core';
import { BOSS_METER_GROWTH, BUILDUP_DECAY_DELAY_MS, BUILDUP_DECAY_PER_SEC, METER_BASE } from '../balance';

export interface ActiveStatus {
  id: StatusId;
  until: number;
  magnitude: number;
  stacks: number;
  /** damage-over-time per second (burn/poison/bleed DoTs, regen heal) */
  dps?: number;
  tickAcc?: number;
}

export class StatusState {
  readonly meters: Record<BuildupStatus, number> = { bleed: 0, burn: 0, frozen: 0, shock: 0, poison: 0 };
  readonly meterSize: Record<BuildupStatus, number> = { bleed: METER_BASE, burn: METER_BASE, frozen: METER_BASE, shock: METER_BASE, poison: METER_BASE };
  private lastBuildup = 0;
  readonly active = new Map<StatusId, ActiveStatus>();
  /** cached set for condition checks */
  readonly set = new Set<StatusId>();

  constructor(private readonly isBoss = false, resist: Partial<Record<BuildupStatus, number>> = {}, statusResist = 0) {
    for (const s of Object.keys(this.meterSize) as BuildupStatus[]) {
      this.meterSize[s] = METER_BASE * (1 + (resist[s] ?? 0) + statusResist);
    }
  }

  /** Add buildup; returns true when the meter fills (status triggers; meter resets). */
  addBuildup(s: BuildupStatus, amount: number, now: number, refill = 0): boolean {
    if (amount <= 0) return false;
    this.lastBuildup = now;
    this.meters[s] += amount;
    if (this.meters[s] < this.meterSize[s]) return false;
    this.meters[s] = this.meterSize[s] * refill;
    if (this.isBoss) this.meterSize[s] *= BOSS_METER_GROWTH;
    return true;
  }

  apply(id: StatusId, now: number, durationMs: number, magnitude = 1, opts: { stacks?: number; maxStacks?: number; dps?: number; refresh?: boolean } = {}): ActiveStatus {
    const cur = this.active.get(id);
    if (cur) {
      cur.until = Math.max(cur.until, now + durationMs);
      cur.magnitude = Math.max(cur.magnitude, magnitude);
      cur.stacks = Math.min(opts.maxStacks ?? 1, cur.stacks + (opts.stacks ?? 1));
      if (opts.dps !== undefined) cur.dps = opts.refresh === false ? (cur.dps ?? 0) + opts.dps : Math.max(cur.dps ?? 0, opts.dps);
      return cur;
    }
    const st: ActiveStatus = { id, until: now + durationMs, magnitude, stacks: Math.min(opts.maxStacks ?? 1, opts.stacks ?? 1), dps: opts.dps, tickAcc: 0 };
    this.active.set(id, st);
    this.set.add(id);
    return st;
  }

  remove(id: StatusId): void {
    this.active.delete(id);
    this.set.delete(id);
  }

  has(id: StatusId): boolean { return this.set.has(id); }
  get(id: StatusId): ActiveStatus | undefined { return this.active.get(id); }

  clearAll(): void {
    this.active.clear();
    this.set.clear();
    for (const k of Object.keys(this.meters) as BuildupStatus[]) this.meters[k] = 0;
  }

  /**
   * Advance time. Returns DoT/heal ticks to apply (amount per status, whole-second granularity smoothed).
   */
  update(now: number, dtMs: number): { id: StatusId; amount: number }[] {
    if (now - this.lastBuildup > BUILDUP_DECAY_DELAY_MS) {
      for (const k of Object.keys(this.meters) as BuildupStatus[]) {
        if (this.meters[k] > 0) this.meters[k] = Math.max(0, this.meters[k] - this.meterSize[k] * BUILDUP_DECAY_PER_SEC * (dtMs / 1000));
      }
    }
    const ticks: { id: StatusId; amount: number }[] = [];
    for (const st of [...this.active.values()]) {
      if (st.dps) {
        st.tickAcc = (st.tickAcc ?? 0) + dtMs;
        if (st.tickAcc >= 500) {
          ticks.push({ id: st.id, amount: st.dps * (st.tickAcc / 1000) * (st.id === 'poison' ? st.stacks : 1) });
          st.tickAcc = 0;
        }
      }
      if (now >= st.until) this.remove(st.id);
    }
    return ticks;
  }

  /** movement multiplier from statuses */
  moveMult(): number {
    if (this.has('root') || this.has('frozen') || this.has('stagger')) return 0;
    let m = 1;
    const chill = this.get('chill');
    if (chill) m *= Math.max(0.5, 1 - 0.1 * chill.stacks);
    const slow = this.get('slow');
    if (slow) m *= Math.max(0.2, 1 - slow.magnitude);
    if (this.has('haste')) m *= 1.15;
    return m;
  }

  /** attack/cast speed multiplier from statuses */
  actionMult(): number {
    let m = 1;
    const chill = this.get('chill');
    if (chill) m *= Math.max(0.5, 1 - 0.1 * chill.stacks);
    if (this.has('haste')) m *= 1.15;
    return m;
  }

  /** can't act at all */
  incapacitated(): boolean { return this.has('stagger') || this.has('frozen'); }
}
