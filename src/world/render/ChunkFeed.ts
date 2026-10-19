/**
 * Client-side chunk feed (polish list: fresh-terrain hitches): asks a Web Worker to build chunks ahead of the
 * camera and adopts the results into the shared SpaceRuntime cache, where the renderer, the local authority (A*,
 * spawns, collision) and the minimap all find them. Nearest-first, deduplicated, a few in flight at a time.
 * Without Worker support (or if it fails) every request answers "not available" and callers build synchronously.
 */
import type { HcChunk } from '@/world/hc/space';
import type { SpaceRuntime } from '@/world/hc/runtime';
import { spaceRuntime } from '@/world/hc/spaces';

const IN_FLIGHT = 3;

interface Job { space: string; cx: number; cy: number; pri: number }

export class ChunkFeed {
  private worker: Worker | null = null;
  private seq = 0;
  /** key → when it was asked for (ms), queued or in flight */
  private asked = new Map<string, number>();
  private queue: Job[] = [];
  private flying = new Map<number, string>();
  /** dev stats: chunks the worker delivered and adopted */
  delivered = 0;
  /** called with every chunk adopted (the renderer shows it if it is still wanted) */
  onChunk?: (c: HcChunk) => void;

  constructor() {
    try {
      this.worker = new Worker(new URL('../hc/chunkWorker.ts', import.meta.url), { type: 'module' });
      this.worker.onmessage = (e: MessageEvent<{ id: number; chunk?: HcChunk; error?: string }>) => this.land(e.data);
      this.worker.onerror = (e) => { console.warn('[world] chunk worker failed; building on the main thread', e.message); this.stop(); };
    } catch (e) {
      console.warn('[world] no chunk worker; building on the main thread', e);
      this.worker = null;
    }
  }

  get live(): boolean { return !!this.worker; }

  private key(space: string, cx: number, cy: number): string { return `${space}|${cx},${cy}`; }

  /** Ask for a chunk (lower `pri` = sooner). No-op if cached, queued or in flight. */
  request(rt: SpaceRuntime, cx: number, cy: number, pri: number): void {
    if (!this.worker || !rt.inBounds(cx, cy) || rt.chunk(cx, cy, false)) return;
    const k = this.key(rt.id, cx, cy);
    const q = this.queue.find((j) => j.space === rt.id && j.cx === cx && j.cy === cy);
    if (q) { q.pri = Math.min(q.pri, pri); return; }
    if (this.asked.has(k)) return;
    this.asked.set(k, performance.now());
    this.queue.push({ space: rt.id, cx, cy, pri });
    this.pump();
  }

  /** How long (ms) a chunk has been waiting, or undefined if it was never asked for. */
  waiting(rt: SpaceRuntime, cx: number, cy: number): number | undefined {
    const t = this.asked.get(this.key(rt.id, cx, cy));
    return t === undefined ? undefined : performance.now() - t;
  }

  /** Drop queued (not in-flight) requests for a space the camera has left, or all of them. */
  clear(space?: string): void {
    this.queue = this.queue.filter((j) => {
      if (space && j.space !== space) return true;
      this.asked.delete(this.key(j.space, j.cx, j.cy));
      return false;
    });
  }

  private pump(): void {
    if (!this.worker) return;
    while (this.flying.size < IN_FLIGHT && this.queue.length) {
      this.queue.sort((a, b) => a.pri - b.pri);
      const j = this.queue.shift()!;
      const id = ++this.seq;
      this.flying.set(id, this.key(j.space, j.cx, j.cy));
      this.worker.postMessage({ id, space: j.space, cx: j.cx, cy: j.cy });
    }
  }

  private land(msg: { id: number; chunk?: HcChunk; error?: string }): void {
    const k = this.flying.get(msg.id);
    this.flying.delete(msg.id);
    if (k) this.asked.delete(k);
    if (msg.chunk) {
      const rt = spaceRuntime(msg.chunk.space);
      if (rt.adopt(msg.chunk)) { this.delivered++; this.onChunk?.(msg.chunk); }
    } else if (msg.error) console.warn('[world] chunk worker error', msg.error);
    this.pump();
  }

  stop(): void {
    this.worker?.terminate();
    this.worker = null;
    this.queue = [];
    this.asked.clear();
    this.flying.clear();
  }
}

/** One feed per page (workers are not free); created on first use by the client. */
let shared: ChunkFeed | null = null;
export const chunkFeed = (): ChunkFeed => (shared ??= new ChunkFeed());
