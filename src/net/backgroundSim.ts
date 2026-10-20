/**
 * Keep a co-op host's world running while its tab is hidden (browser only; installed from main.ts). Owner: Claude 6.
 *
 * The sim is driven by Phaser's step, which stops when the tab is hidden (rAF stops; Phaser pauses its loop), so a
 * host who minimised the window froze every guest. While hidden, an authority with remote players takes its ticks
 * from a worker (src/net/tickWorker.ts) instead: the sim steps and snapshots go out; nothing is drawn. Phaser's
 * loop is paused meanwhile and resumes on show, so the two never drive it at once. A solo game still pauses when
 * hidden, as before.
 */
import type { NetService } from './types';
import type { SimLoop } from './SimLoop';

let driving = (): boolean => false;
/** True while the worker clock steps the sim: the Phaser step must not also advance it (a browser that keeps some
 * rAF going in a hidden tab would otherwise run the world at double speed). */
export const backgroundDriving = (): boolean => driving();

export function installBackgroundSim(sim: SimLoop, net: () => NetService | undefined): void {
  if (typeof Worker === 'undefined' || typeof document === 'undefined') return;
  let worker: Worker | null = null;
  let last = 0;
  const hostWithGuests = () => { const n = net(); return !!n && n.isAuthority() && n.role !== 'solo' && n.partySize() > 1; };
  let running = false;
  driving = () => running && document.hidden && hostWithGuests();

  const start = () => {
    if (!worker) {
      try { worker = new Worker(new URL('./tickWorker.ts', import.meta.url), { type: 'module' }); }
      catch (e) { console.warn('[net] background ticks unavailable', e); return; }
      worker.onmessage = () => {
        const now = performance.now();
        const dt = now - last;
        last = now;
        if (document.hidden && hostWithGuests()) sim.advance(dt);
      };
    }
    last = performance.now();
    running = true;
    worker.postMessage('start');
  };
  const stop = () => { running = false; worker?.postMessage('stop'); };

  // any host: a guest may join while the tab is hidden (the ticks only step the sim once someone is there)
  document.addEventListener('visibilitychange', () => { if (document.hidden && net()?.role === 'host') start(); else stop(); });
}
