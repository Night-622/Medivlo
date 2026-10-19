/**
 * Dev-time content validator: checks that every id referenced by narrative data resolves:
 * quests, dialogue, NPCs, lore, factions (Registry), items/enemies/spells (Claude 3), and
 * regions/landmarks/instances/objects/areas (Claude 2: RegionDef.landmarks, Registry.extra instance/overlay).
 * Problems about world placement are prefixed "[world]" (content written ahead of the region being built).
 * Called by BootScene in DEV (Claude 1). Returns the problem list.
 */
import { Registry } from '@/core';
import { CAMPAIGNS, SCHOOL_NAME } from './classes';
import type { ContentKind, DialogueDef, LoreEntry, NarrativeCondition, NarrativeEffect, NpcDef, QuestDef } from '@/core';

type Kind = 'quest' | 'dialogue' | 'npc' | 'lore' | 'faction' | 'item' | 'enemy' | 'spell';

/**
 * v2: ids that live outside the Registry (Hollow Crown world places/objects from Claude 2, handoff creature and
 * item ids from Claude 3). The client registers a source built from those data modules; the engine stays pure.
 */
export interface ExternalIds { places?: Iterable<string>; objects?: Iterable<string>; creatures?: Iterable<string>; items?: Iterable<string> }
const sources: (() => ExternalIds)[] = [];
export function addValidationSource(fn: () => ExternalIds): void { sources.push(fn); }

const SCHOOLS = new Set(Object.keys(SCHOOL_NAME));
const CAMPAIGN_IDS = new Set(['shared', ...CAMPAIGNS.map((c) => c.id)]);

export function validateContent(): string[] {
  const problems: string[] = [];
  const ext = { places: new Set<string>(), objects: new Set<string>(), creatures: new Set<string>(), items: new Set<string>() };
  for (const src of sources) {
    const s = src();
    for (const k of ['places', 'objects', 'creatures', 'items'] as const) for (const id of s[k] ?? []) ext[k].add(id);
  }
  // v1 systems kinds (item/enemy/spell/…) left the Registry (Claude 1, 2026-10-20); only narrative kinds remain there.
  const isRegistryKind = (k: Kind): k is Kind & ContentKind => (['region', 'quest', 'dialogue', 'lore', 'npc', 'faction'] as string[]).includes(k);
  const inSet = (set: Set<string>, id: string) => (id.endsWith('*') ? [...set].some((x) => x.startsWith(id.slice(0, -1))) : set.has(id));
  const has = (kind: Kind, id: string) => {
    // handoff ids (bx_*, i_*, w_*, a_*, lg_*) are validated against the external lists
    if (kind === 'enemy' && !id.startsWith('enemy:')) return !ext.creatures.size || inSet(ext.creatures, id);
    if (kind === 'item' && !id.startsWith('item:')) return !ext.items.size || inSet(ext.items, id);
    // v1 Registry items/enemies/spells were archived with the old game: those ids are no longer checked
    if (kind === 'item' || kind === 'enemy' || kind === 'spell') return true;
    return isRegistryKind(kind) && !!Registry.tryGet(kind as ContentKind, id);
  };
  const ref = (where: string, kind: Kind, id: string | null | undefined) => {
    if (!id || has(kind, id)) return;
    // a handoff-style creature/item id that Claude 3 hasn't defined yet (new bosses named in the outlines)
    const pending = (kind === 'enemy' || kind === 'item') && !id.includes(':');
    problems.push(`${pending ? '[systems] ' : ''}${where}: unknown ${kind} "${id}"`);
  };

  const v1 = worldIndex();
  const places = new Set<string>([...(v1?.regions ?? []), ...(v1?.landmarks ?? []), ...(v1?.instances ?? []), ...(v1?.objects ?? []), ...ext.places]);
  const objects = new Set<string>([...(v1?.objects ?? []), ...ext.objects]);
  const world = places.size ? { places, objects } : null;
  /** landmark:/region:/instance:/inst:/area:/zone:/vil:/ws:/realm: ids, and the concordia space */
  const PLACE = new Set(['landmark', 'region', 'instance', 'inst', 'area', 'zone', 'vil', 'ws', 'realm']);
  const wref = (where: string, id: string | undefined) => {
    if (!id || !world) return;
    const prefix = id.split(':')[0];
    if ((PLACE.has(prefix) || id === 'concordia') && !world.places.has(id)) problems.push(`[world] ${where}: ${prefix} "${id}" not placed`);
  };
  /** obj: ids; a trailing * is a prefix match */
  const oref = (where: string, id: string) => {
    if (!world) return;
    const ok = id.endsWith('*') ? [...world.objects].some((o) => o.startsWith(id.slice(0, -1))) : world.objects.has(id);
    if (!ok) problems.push(`[world] ${where}: object "${id}" not placed`);
  };

  const cond = (where: string, c: NarrativeCondition | undefined): void => {
    if (!c) return;
    if ('all' in c) return (c.all as NarrativeCondition[]).forEach((x) => cond(where, x));
    if ('any' in c) return (c.any as NarrativeCondition[]).forEach((x) => cond(where, x));
    if ('not' in c) return cond(where, c.not as NarrativeCondition);
    if ('questStage' in c) {
      ref(where, 'quest', c.questStage);
      const q = Registry.tryGet('quest', c.questStage) as QuestDef | undefined;
      if (q && !q.stages.some((s) => s.id === c.stage)) problems.push(`${where}: quest ${c.questStage} has no stage "${c.stage}"`);
    }
    if ('questCompleted' in c) ref(where, 'quest', c.questCompleted);
    if ('questActive' in c) ref(where, 'quest', c.questActive);
    if ('questFailed' in c) ref(where, 'quest', c.questFailed);
    if ('questOutcome' in c) ref(where, 'quest', c.questOutcome);
    if ('hasItem' in c) ref(where, 'item', c.hasItem);
    if ('rep' in c) ref(where, 'faction', c.rep);
    if ('loreUnlocked' in c) ref(where, 'lore', c.loreUnlocked);
    // v2
    if ('trust' in c) ref(where, 'npc', c.trust);
    if ('heroSchool' in c && !SCHOOLS.has(c.heroSchool)) problems.push(`${where}: unknown school "${c.heroSchool}"`);
    if ('partyHasSchool' in c && !SCHOOLS.has(c.partyHasSchool)) problems.push(`${where}: unknown school "${c.partyHasSchool}"`);
    if ('heroClass' in c && !CAMPAIGN_IDS.has(c.heroClass.replace(/^class:/, ''))) problems.push(`${where}: unknown class "${c.heroClass}"`);
    if ('partyHasClass' in c && !CAMPAIGN_IDS.has(c.partyHasClass.replace(/^class:/, ''))) problems.push(`${where}: unknown class "${c.partyHasClass}"`);
  };

  const effects = (where: string, list: NarrativeEffect[] | undefined): void => {
    for (const e of list ?? []) {
      if ('startQuest' in e) ref(where, 'quest', e.startQuest);
      if ('completeQuest' in e) ref(where, 'quest', e.completeQuest);
      if ('failQuest' in e) ref(where, 'quest', e.failQuest);
      if ('setStage' in e) {
        const q = Registry.tryGet('quest', e.setStage) as QuestDef | undefined;
        if (!q) ref(where, 'quest', e.setStage);
        else if (!q.stages.some((s) => s.id === e.stage)) problems.push(`${where}: setStage to missing stage "${e.stage}"`);
      }
      if ('giveItem' in e) ref(where, 'item', e.giveItem);
      if ('takeItem' in e) ref(where, 'item', e.takeItem);
      if ('reputation' in e) ref(where, 'faction', e.reputation);
      if ('openDialogue' in e) ref(where, 'dialogue', e.openDialogue);
      if ('companion' in e) ref(where, 'npc', e.companion);
      if ('loyalty' in e) ref(where, 'npc', e.loyalty);
      if ('reward' in e) for (const it of [...(e.reward.items ?? []), ...(e.reward.hcItems ?? [])]) ref(where, 'item', it.item);
      if ('trust' in e) ref(where, 'npc', e.trust);
      if ('unlockLore' in e) {
        const l = Registry.tryGet('lore', e.unlockLore) as LoreEntry | undefined;
        if (!l) ref(where, 'lore', e.unlockLore);
        else if (e.section && !l.sections?.some((s) => s.id === e.section)) problems.push(`${where}: lore ${e.unlockLore} has no section "${e.section}"`);
      }
    }
  };

  for (const q of Registry.all('quest') as QuestDef[]) {
    const ids = new Set(q.stages.map((s) => s.id));
    if (!ids.has(q.firstStage)) problems.push(`${q.id}: firstStage "${q.firstStage}" missing`);
    cond(q.id, q.requires);
    ref(q.id, 'npc', q.giver);
    wref(q.id, q.region);
    for (const it of [...(q.reward?.items ?? []), ...(q.reward?.hcItems ?? [])]) ref(`${q.id} reward`, 'item', it.item);
    if (q.campaign && !CAMPAIGN_IDS.has(q.campaign)) problems.push(`${q.id}: unknown campaign "${q.campaign}"`);
    for (const l of q.reward?.lore ?? []) ref(`${q.id} reward`, 'lore', l);
    for (const r of q.reward?.rep ?? []) ref(`${q.id} reward`, 'faction', r.faction);
    ref(`${q.id} reward`, 'spell', q.reward?.tome);
    for (const s of q.stages) {
      const w = `${q.id}#${s.id}`;
      effects(w, s.onEnter); effects(w, s.onComplete);
      const nexts = typeof s.next === 'string' ? [s.next] : (s.next ?? []).map((b) => { cond(w, b.when); return b.to; });
      for (const n of nexts) if (!ids.has(n)) problems.push(`${w}: next stage "${n}" missing`);
      if (!s.end && !s.next && s !== q.stages[q.stages.length - 1]) problems.push(`${w}: no next and no end`);
      const oids = new Set<string>();
      for (const o of s.objectives) {
        if (oids.has(o.id)) problems.push(`${w}: duplicate objective id "${o.id}"`);
        oids.add(o.id);
        if ('talk' in o) ref(w, 'npc', o.talk);
        if ('reach' in o) wref(w, o.reach);
        if ('interact' in o) oref(w, o.interact);
        if (o.marker) { const m: Record<string, string> = o.marker; wref(w, m.landmark ?? m.region ?? m.place); }
        if ('kill' in o) ref(w, 'enemy', o.kill);
        if ('collect' in o) ref(w, 'item', o.collect);
        if ('when' in o) cond(w, o.when);
      }
    }
  }

  for (const d of Registry.all('dialogue') as DialogueDef[]) {
    if (d.id.startsWith('dialogue:obj-')) oref(d.id, `obj:${d.id.slice(13)}`);
    if (d.id.startsWith('dialogue:area-')) wref(d.id, `area:${d.id.slice(14)}`);
    const nodes = d.nodes;
    for (const e of d.entries) {
      cond(d.id, e.when);
      if (!nodes[e.node]) problems.push(`${d.id}: entry node "${e.node}" missing`);
    }
    for (const [nid, n] of Object.entries(nodes)) {
      const w = `${d.id}#${nid}`;
      if (n.speaker !== 'player' && n.speaker !== 'narrator') ref(w, 'npc', n.speaker);
      effects(w, n.effects);
      if (n.next && !nodes[n.next]) problems.push(`${w}: next "${n.next}" missing`);
      // v2: the box shows at most 4 choices; unconditional ones (no when/school/once) are always visible
      const always = (n.choices ?? []).filter((c) => !c.when && !c.school && !c.once && !c.lockedLabel).length;
      if (always > 4) problems.push(`${w}: ${always} always-visible choices (max 4)`);
      for (const c of n.choices ?? []) {
        cond(w, c.when);
        if (c.school && !SCHOOLS.has(c.school)) problems.push(`${w}: unknown school "${c.school}"`);
        if (c.trustNpc) ref(w, 'npc', c.trustNpc);
        if (c.trust && !c.trustNpc && !n.speaker.startsWith('npc:')) problems.push(`${w}: TRUST choice with no NPC (speaker is ${n.speaker}; set trustNpc)`);
        effects(w, c.effects);
        if (c.to && !nodes[c.to]) problems.push(`${w}: choice → "${c.to}" missing`);
        if (c.check?.failTo && !nodes[c.check.failTo]) problems.push(`${w}: failTo "${c.check.failTo}" missing`);
      }
    }
  }

  const built = new Set((Registry.all('quest') as QuestDef[]).map((q) => q.campaign).filter((c): c is string => !!c));
  for (const n of Registry.all('npc') as NpcDef[]) {
    cond(n.id, n.presentWhen);
    ref(n.id, 'faction', n.faction);
    ref(n.id, 'lore', n.lore);
    wref(n.id, n.region);
    wref(n.id, n.home);
    for (const s of n.schedule ?? []) wref(n.id, s.at);
    for (const e of n.dialogue) {
      cond(n.id, e.when);
      // hooks for a class campaign that has no data yet are skipped (talkTo falls through missing dialogues)
      const cls = e.when && 'heroClass' in e.when ? e.when.heroClass.replace(/^class:/, '') : null;
      if (cls && !built.has(cls)) continue;
      // optional class hooks (dialogue:hook-<class>-<npc>) may be absent
      if (e.dialogue.startsWith('dialogue:hook-') && !Registry.tryGet('dialogue', e.dialogue)) continue;
      ref(n.id, 'dialogue', e.dialogue);
    }
    for (const s of n.schedule ?? []) cond(n.id, s.when);
    for (const b of n.barks ?? []) cond(n.id, b.when);
  }

  for (const l of Registry.all('lore') as LoreEntry[]) {
    for (const r of l.related ?? []) ref(l.id, 'lore', r);
    cond(l.id, l.unlock);
    for (const t of l.unlockOn ?? []) {
      if ('landmark' in t) wref(l.id, t.landmark);
      if ('region' in t) wref(l.id, t.region);
      if ('interact' in t) oref(l.id, t.interact);
      if ('kill' in t) ref(l.id, 'enemy', t.kill);
      if ('item' in t) ref(l.id, 'item', t.item);
    }
  }

  return problems;
}

/** Minimal structural views of Claude 2's world data (src/world/types.ts), read via the Registry. */
interface WorldObjLike { id: string }
interface OverlayLike { objects?: WorldObjLike[]; variants?: { objects?: WorldObjLike[] }[] }
interface InstanceLike { id: string; floors: { landmarks?: { id: string }[] }[] }
interface RegionLike { id: string; landmarks: { id: string; instance?: string }[] }

/** Sets of placed world ids, or null when no regions are loaded (e.g. the headless harness). */
function worldIndex(): { regions: Set<string>; landmarks: Set<string>; instances: Set<string>; objects: Set<string> } | null {
  const regions = Registry.all('region') as unknown as RegionLike[];
  if (!regions.length) return null;
  const idx = { regions: new Set<string>(), landmarks: new Set<string>(), instances: new Set<string>(), objects: new Set<string>() };
  for (const r of regions) {
    idx.regions.add(r.id);
    for (const l of r.landmarks ?? []) { idx.landmarks.add(l.id); if (l.instance) idx.instances.add(l.instance); }
  }
  for (const inst of Registry.extraAll<InstanceLike>('instance')) {
    idx.instances.add(inst.id);
    for (const f of inst.floors ?? []) for (const l of f.landmarks ?? []) idx.landmarks.add(l.id);
  }
  for (const ov of Registry.extraAll<OverlayLike>('overlay')) {
    for (const o of ov.objects ?? []) idx.objects.add(o.id);
    for (const v of ov.variants ?? []) for (const o of v.objects ?? []) idx.objects.add(o.id);
  }
  return idx;
}
