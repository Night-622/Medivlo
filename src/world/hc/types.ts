/**
 * The Hollow Crown world model (docs/world/HOLLOW-CROWN-WORLD.md). Pure data shapes, no Phaser:
 * these modules also run headless on the public-realm server.
 */

/** HSL shift rule from realms.js: [hue (deg), saturation multiplier, lightness add]. */
export type HueRule = [number, number, number];

import type { SchoolId } from '@/core/constants';
export type { SchoolId };

export type LandmarkArch = 'spire' | 'hall' | 'dome' | 'tree' | 'citadel';

/** One of the 13 realms (realms.js). Concordia has no hue rules. */
export interface RealmDef {
  id: `realm:${string}`;
  school: SchoolId | null;
  name: string;
  /** capital village name */
  capital: string;
  arch: LandmarkArch;
  landmark: string;
  desc: string;
  /** palette [light, mid, dark] and accent, 0xRRGGBB */
  colors: [number, number, number];
  accent: number;
  ground?: HueRule;
  stone?: HueRule;
  water?: HueRule;
  roofHue?: number;
  /** position on the Realms ring map (432×272 map px) */
  ring: [number, number];
  /** space the realm is played in */
  space: string;
}

/** A Morvane region (map.js REG): polygons in map px (432×272; 1 map px = 4 tiles). */
export interface MorvaneRegionDef {
  id: `region:${string}`;
  name: string;
  levels: string;
  /** base, light, dark */
  colors: [number, number, number];
  polys: [number, number][][];
  label: [number, number];
  desc: string;
}

export interface WaystoneDef {
  id: `ws:${string}`;
  name: string;
  space: string;
  /** region or area id it belongs to */
  region: string;
  /** world tile */
  at: [number, number];
  /** awake from the start (otherwise attuned by touch) */
  startsLit?: boolean;
}

/** A place in a village close-up: [prop/building key, label, service, npc id | null]. */
export type VillagePlace = [string, string, string, string | null];

export interface VillageDef {
  id: `vil:${string}`;
  name: string;
  space: string;
  region: string;
  /** centre in world tiles */
  at: [number, number];
  /** 'v' village tiles, 'f' forest tiles, or a realm id for recoloured capital tiles */
  tiles: 'v' | 'f' | `realm:${string}`;
  tint?: [number, number];
  /** well prop key (realm capitals use r_<realm>_well) */
  well?: string;
  places: VillagePlace[];
  capital?: boolean;
}

export type Polyline = [number, number][];

/** A class start area of a school realm (Claude 4's names; zones and lairs in placement order). */
export interface AreaDef {
  id: `area:${string}`;
  school: SchoolId;
  side: 'capital' | 'frontier';
  title: string;
  className: string;
  zones: { name: string; theme: string }[];
  lairs: { name: string; theme: string }[];
}

/** A landmark or set-piece object of a class start area (Claude 4's outlines). */
export interface SetPieceDef {
  id: string;
  area: `area:${string}`;
  /** zone-1..4 | lair-1..3 | gate | road (halfway from the crossroads to the gate) | way-2..4 (halfway out to zone N); a lair piece noted "rooms" goes one per room */
  where: string;
  /** location note from the outline (mentor house, lair 2 entrance, I-2…) */
  note: string;
  /** place beside this already-placed piece instead of round the zone centre */
  near?: string;
}
