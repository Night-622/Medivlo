/// <reference lib="webworker" />
/**
 * Chunk generation off the main thread (polish list: fresh-terrain hitches). The same pure generators build the
 * same chunks here; the typed arrays are transferred back and the client adopts them into its SpaceRuntime cache
 * (ChunkFeed). Builds are deterministic from the world seed and static data, so worker and main thread agree.
 */
import { buildChunk } from './space';
import { spaceRuntime } from './spaces';

export interface ChunkRequest { id: number; space: string; cx: number; cy: number }

self.onmessage = (e: MessageEvent<ChunkRequest>) => {
  const { id, space, cx, cy } = e.data;
  try {
    const c = buildChunk(spaceRuntime(space).gen, cx, cy);
    (self as unknown as Worker).postMessage({ id, chunk: c }, [c.ground.buffer, c.collision.buffer, c.mini.buffer]);
  } catch (err) {
    (self as unknown as Worker).postMessage({ id, space, cx, cy, error: String(err) });
  }
};
