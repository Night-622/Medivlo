/**
 * Ids outside the Registry, for validateContent() (dev only): Claude 2's Hollow Crown world (Morvane regions,
 * villages, waystones, class areas with their zones/lairs/gates, set pieces) and Claude 3's handoff creatures and
 * items. Lives client-side so the engine never imports world/systems data. Owner: Claude 4.
 */
import { HC_BESTIARY } from '@/data/enemies/hc/bestiary.gen';
import { HC_CAMPAIGN_BOSSES } from '@/data/enemies/hc/campaign';
import { HC_PIECES } from '@/data/items/hc/armour.gen';
import { HC_CAMPAIGN_ITEMS } from '@/data/items/hc/campaign-items';
import { HC_ITEMS } from '@/data/items/hc/items.gen';
import { HC_LEGENDARIES } from '@/data/items/hc/legendary.gen';
import { HC_WEAPONS } from '@/data/items/hc/weapons.gen';
import { AREAS } from '@/data/regions/hc/areas';
import { SET_PIECES } from '@/data/regions/hc/landmarks';
import { MORVANE_REGIONS, MORVANE_VILLAGES, MORVANE_WAYSTONES } from '@/data/regions/hc/morvane';
import { worldIds } from '@/world/hc/ids';
import { addValidationSource, type ExternalIds } from '../engine/validate';

export function hcIds(): ExternalIds {
  const places = new Set<string>(['concordia']);
  for (const r of MORVANE_REGIONS) places.add(r.id);
  for (const v of MORVANE_VILLAGES) places.add(v.id);
  for (const w of MORVANE_WAYSTONES) places.add(w.id);
  for (const a of AREAS) {
    places.add(a.id);
    places.add(`realm:${a.school}`);
    places.add(`area:${a.school}-gate`);
    places.add(`ws:${a.school}-${a.side}`);
    places.add(`ws:${a.school}-gate`);
    a.zones.forEach((_, i) => places.add(`zone:${a.school}-${a.side}-${i + 1}`));
    a.lairs.forEach((_, i) => places.add(`inst:${a.school}-${a.side}-lair-${i + 1}`));
  }
  const objects = new Set<string>();
  for (const s of SET_PIECES) (s.id.startsWith('obj:') ? objects : places).add(s.id);
  // what Claude 2's generators actually place (authoritative; about 1.4 s, dev only)
  try {
    const w = worldIds();
    for (const p of w.places) places.add(p);
    for (const o of w.objects) objects.add(o);
  } catch (e) { console.warn('[narrative] worldIds() failed; validating against static world data', e); }
  return {
    places, objects,
    creatures: [...HC_BESTIARY, ...HC_CAMPAIGN_BOSSES].map((b) => b.id),
    items: [...HC_ITEMS, ...HC_WEAPONS, ...HC_PIECES, ...HC_LEGENDARIES, ...HC_CAMPAIGN_ITEMS].map((x) => x.id),
  };
}

let added = false;
export function installHcValidationSource(): void {
  if (added) return;
  added = true;
  addValidationSource(hcIds);
}
