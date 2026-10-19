/**
 * The one fixed-step simulation loop (Phaser-free, so the public-realm server runs it too). Owner: Claude 1.
 *
 * - 30 Hz fixed step (SIM_STEP_MS). Steppers run in `order` (world 100 → systems 200 → narrative 300).
 * - Steps run ONLY on the authority (solo, host, server). Clients don't step; they render snapshots.
 * - After each step the net layer flushes a snapshot (LocalNet: loopback every tick; network transports
 *   every SNAPSHOT_EVERY ticks). Render code should always go through SnapshotConsumers, even in solo,
 *   so co-op works whenever solo works.
 * - Solo can pause (menus, dialogue); co-op/public never pause the world.
 * On the client it is driven from main.ts via Phaser's global 'step' event.
 */
import type { NetService } from './types';

export const SIM_HZ = 30;
export const SIM_STEP_MS = 1000 / SIM_HZ;
/** network snapshot cadence (every N sim ticks → 15 Hz) */
export const SNAPSHOT_EVERY = 2;
/** cap catch-up after a stall so we never spiral */
const MAX_STEPS_PER_FRAME = 5;

export interface Stepper {
  readonly name: string;
  /** world 100, systems 200, narrative 300; lower runs first */
  readonly order: number;
  step(dtMs: number, tick: number): void;
}

export class SimLoop {
  private steppers: Stepper[] = [];
  private acc = 0;
  private _tick = 0;
  private _t = 0;
  private paused = false;
  private net: NetService | null = null;

  get tick(): number { return this._tick; }
  /** sim ms since the session started */
  get time(): number { return this._t; }

  attach(net: NetService): void { this.net = net; this.acc = 0; }

  add(s: Stepper): () => void {
    this.steppers.push(s);
    this.steppers.sort((a, b) => a.order - b.order);
    return () => { this.steppers = this.steppers.filter((x) => x !== s); };
  }

  /** Solo only: freeze the world while menus/dialogue are open. Ignored in co-op/public. */
  setPaused(p: boolean): void { this.paused = p; }
  isPaused(): boolean { return this.paused && this.net?.role === 'solo'; }

  /** Feed real elapsed ms; runs as many fixed steps as are due. */
  advance(realDtMs: number): void {
    const net = this.net;
    if (!net || !net.isAuthority() || this.isPaused()) { this.acc = 0; return; }
    this.acc = Math.min(this.acc + realDtMs, SIM_STEP_MS * MAX_STEPS_PER_FRAME);
    while (this.acc >= SIM_STEP_MS) {
      this.acc -= SIM_STEP_MS;
      this._tick++;
      this._t += SIM_STEP_MS;
      for (const s of this.steppers) {
        try { s.step(SIM_STEP_MS, this._tick); }
        catch (e) { console.error(`[sim] stepper "${s.name}" threw`, e); }
      }
      net.flush(this._tick, this._t);
    }
  }

  /** 0..1 progress into the next step (for render interpolation on the authority). */
  alpha(): number { return this.acc / SIM_STEP_MS; }
}

/** Process-wide loop (client). The server creates its own SimLoop per realm. */
export const sim = new SimLoop();
