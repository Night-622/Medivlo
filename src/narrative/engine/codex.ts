/** Codex (lore entries): unlocking, progressive sections and auto-unlock triggers. Owner: Claude 4. */
import { Registry, bus } from '@/core';
import type { LoreEntry, LoreId, NpcDef } from '@/core';
import { check } from './conditions';
import { authBus, ext, nar, toast } from './state';

export function loreSections(): Record<string, string[]> {
  return ext<Record<string, string[]>>('loreSections', () => ({}));
}

export function isUnlocked(id: LoreId): boolean {
  return nar().codexUnlocked.includes(id);
}

export function unlockedSections(id: LoreId): string[] {
  return loreSections()[id] ?? [];
}

export function unlockLore(id: LoreId, section?: string): void {
  const def = Registry.tryGet('lore', id) as LoreEntry | undefined;
  if (!def) { console.warn(`[codex] unknown lore entry ${id}`); return; }
  const n = nar();
  if (!n.codexUnlocked.includes(id)) {
    n.codexUnlocked.push(id);
    bus.emit('codex:unlocked', { entryId: id });
    toast(`Codex: ${def.name}`, 'codex');
  }
  if (section) {
    const all = loreSections();
    const list = (all[id] ??= []);
    if (!list.includes(section)) {
      list.push(section);
      bus.emit('codex:unlocked', { entryId: id, sectionId: section });
      const title = def.sections?.find((s) => s.id === section)?.title;
      toast(`Codex updated: ${def.name}${title ? `: ${title}` : ''}`, 'codex');
    }
  }
}

/** Wires auto-unlock triggers declared in LoreEntry.unlockOn / unlock. Call once. */
export function installCodexTriggers(): void {
  const entries = () => Registry.all('lore') as LoreEntry[];
  const each = (fn: (e: LoreEntry, t: NonNullable<LoreEntry['unlockOn']>[number]) => boolean) => {
    for (const e of entries()) {
      if (isUnlocked(e.id)) continue;
      if (e.unlockOn?.some((t) => fn(e, t))) unlockLore(e.id);
    }
  };
  const onLandmark = ({ landmarkId }: { landmarkId: string }) => each((_, t) => 'landmark' in t && t.landmark === landmarkId);
  authBus.on('landmark:discovered', onLandmark);
  authBus.on('landmark:entered', onLandmark);
  authBus.on('region:entered', ({ regionId }) => each((_, t) => 'region' in t && t.region === regionId));
  authBus.on('enemy:killed', ({ enemyId, family, variant }) => each((_, t) => {
    if (!('kill' in t)) return false;
    if (t.kill && t.kill !== enemyId) return false;
    if (t.family && t.family !== family) return false;
    if (t.hollowed && variant !== 'hollowed') return false;
    return true;
  }));
  authBus.on('item:picked', ({ def }) => each((_, t) => 'item' in t && t.item === def));
  authBus.on('interact', ({ objectId, kind, props }) => {
    each((_, t) => 'interact' in t && t.interact === objectId);
    // lore objects placed by Claude 2 carry props.lore (+ optional props.section)
    if ((kind === 'lore' || kind === 'sign') && typeof props.lore === 'string') {
      unlockLore(props.lore as LoreId, typeof props.section === 'string' ? props.section : undefined);
    }
  });
  // meeting someone opens their codex page (NpcDef.lore)
  authBus.on('dialogue:started', ({ npcId }) => {
    const npc = npcId ? (Registry.tryGet('npc', npcId) as NpcDef | undefined) : undefined;
    if (npc?.lore && !isUnlocked(npc.lore)) unlockLore(npc.lore);
  });
  authBus.on('flag:changed', () => {
    for (const e of entries()) if (e.unlock && !isUnlocked(e.id) && check(e.unlock)) unlockLore(e.id);
  });
}
