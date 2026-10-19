/**
 * Content registry. Auto-loads every module under src/data/**.
 * A data module default-exports a def or an array of defs; the kind comes from the id prefix
 * (`item:iron-longsword` → kind "item"). Files may also export other named things (ignored).
 */
import type { ContentDefs, ContentKind } from './types';

type AnyDef = ContentDefs[ContentKind];
const KINDS: ContentKind[] = ['region', 'quest', 'dialogue', 'lore', 'npc', 'faction'];

const store = new Map<ContentKind, Map<string, AnyDef>>(KINDS.map((k) => [k, new Map()]));
/** Defs whose id prefix isn't a ContentKind (e.g. `spawn:`, `instance:`), keyed by prefix. Owners read via `extra`. */
const extraStore = new Map<string, Map<string, unknown>>();

function add(def: unknown, file: string): void {
  if (!def || typeof def !== 'object' || !('id' in def) || typeof (def as { id: unknown }).id !== 'string') return;
  const id = (def as { id: string }).id;
  const prefix = id.split(':')[0];
  const bucket = store.get(prefix as ContentKind);
  if (bucket) {
    if (bucket.has(id)) console.warn(`[registry] duplicate id ${id} in ${file}`);
    bucket.set(id, def as AnyDef);
  } else {
    if (!extraStore.has(prefix)) extraStore.set(prefix, new Map());
    extraStore.get(prefix)!.set(id, def);
  }
}

let loaded = false;
export const Registry = {
  load(): void {
    if (loaded) return;
    const mods = import.meta.glob<{ default?: unknown }>('../data/**/*.{ts,json}', { eager: true });
    for (const [file, mod] of Object.entries(mods)) {
      const d = mod.default;
      if (Array.isArray(d)) d.forEach((x) => add(x, file));
      else add(d, file);
    }
    loaded = true;
    console.info('[registry]', KINDS.map((k) => `${k}:${store.get(k)!.size}`).join(' '));
  },
  get<K extends ContentKind>(kind: K, id: string): ContentDefs[K] {
    const def = store.get(kind)!.get(id);
    if (!def) throw new Error(`[registry] missing ${kind} "${id}"`);
    return def as ContentDefs[K];
  },
  tryGet<K extends ContentKind>(kind: K, id: string): ContentDefs[K] | undefined {
    return store.get(kind)!.get(id) as ContentDefs[K] | undefined;
  },
  all<K extends ContentKind>(kind: K): ContentDefs[K][] {
    return [...store.get(kind)!.values()] as ContentDefs[K][];
  },
  /** Non-core kinds (`spawn`, `instance`, `overlay`, …). Typed by the owner. */
  extra<T>(prefix: string, id: string): T | undefined {
    return extraStore.get(prefix)?.get(id) as T | undefined;
  },
  extraAll<T>(prefix: string): T[] {
    return [...(extraStore.get(prefix)?.values() ?? [])] as T[];
  },
};
