/**
 * The Sentinels of the Turning Road: one lair per school in Concordia (Claude 4's 2026-10-19 list). Radiance and
 * Song share Abbess Morwen in inst:drowned-abbey; Blade's Varric is inst:varric-barrow. `near` is a tile hint for
 * the entrance (the placer finds free ground around it).
 */
import type { SchoolId } from '@/core';

export interface SentinelDef {
  school: SchoolId;
  inst: string;
  boss: string;
  name: string;
  region: `region:${string}`;
  near: [number, number];
  /** entrance art and look of the lair */
  palette: SchoolId;
  drowned?: boolean;
}

export const SENTINELS: SentinelDef[] = [
  { school: 'ash', inst: 'inst:sentinel-ash', boss: 'bx_ashmaw', name: 'The Oldest Kiln', region: 'region:ash', near: [276, 690], palette: 'ash' },
  { school: 'rime', inst: 'inst:sentinel-rime', boss: 'bx_colossus', name: 'The High Pass', region: 'region:frost', near: [524, 226], palette: 'rime' },
  { school: 'storm', inst: 'inst:sentinel-storm', boss: 'bx_stormcrow', name: "The Stormcrow's Nest", region: 'region:storm', near: [1500, 468], palette: 'storm' },
  { school: 'iron', inst: 'inst:sentinel-iron', boss: 'bx_engine', name: 'The Buried Engine', region: 'region:gilded', near: [1228, 284], palette: 'iron' },
  { school: 'umbral', inst: 'inst:sentinel-umbral', boss: 'bx_spinner', name: 'The Root-Hollow', region: 'region:gloam', near: [664, 452], palette: 'umbral' },
  { school: 'verdant', inst: 'inst:sentinel-verdant', boss: 'bx_willow', name: "The Willow's Hollow", region: 'region:gloam', near: [698, 488], palette: 'verdant' },
  { school: 'hunt', inst: 'inst:sentinel-hunt', boss: 'bx_stag', name: 'The Deep Glade', region: 'region:gloam', near: [832, 338], palette: 'hunt' },
  { school: 'fist', inst: 'inst:sentinel-fist', boss: 'bx_sovereign', name: 'The Deep Bog', region: 'region:briar', near: [418, 562], palette: 'fist', drowned: true },
  { school: 'guile', inst: 'inst:sentinel-guile', boss: 'bx_lanternqueen', name: 'The Drowned Lights', region: 'region:marsh', near: [1252, 860], palette: 'guile', drowned: true },
];
