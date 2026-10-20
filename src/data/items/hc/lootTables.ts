/**
 * Named loot tables (Claude 3, docs/systems/BUILDS.md §5.1). Claude 2's placements name them: chests carry
 * `loot: 'tbl:<id>'`; bosses need no prop (a boss's `tbl:<creature id>` table, and `tbl:act3` for every Act III
 * herald / chimera form, apply on the kill). Rolled by sim/loot.ts at the site's level, per player.
 * Uniques join these tables as they land (BUILDS.md §5): one `u_<id>` entry per home.
 */
import { HC_CAMPAIGN_BOSSES } from '@/data/enemies/hc/campaign';
import { HC_LEGENDARIES } from './legendary.gen';
import type { LootTable } from '@/systems/rules/affixTypes';
import type { SchoolId } from '@/systems/rules/types';
import { essenceOf } from './build-items';

const SCHOOLS: SchoolId[] = ['ash', 'rime', 'storm', 'radiance', 'umbral', 'verdant', 'blade', 'iron', 'fist', 'hunt', 'guile', 'song'];

const ruin = (s: SchoolId): LootTable => ({
  id: `tbl:${s}-ruin`, rolls: 1,
  entries: [{ weight: 30, tome: s }, { weight: 50, gear: { minRarity: 'runed', forKit: true } }, { weight: 20, rune: 'any' }],
});
const cave = (s: SchoolId): LootTable => ({
  id: `tbl:${s}-cave`, rolls: 1,
  always: [{ weight: 1, item: essenceOf(s), qty: [1, 2] }],
  entries: [{ weight: 60, rune: 'any' }, { weight: 40, gear: { minRarity: 'wrought', forKit: true } }],
});

export const HC_LOOT_TABLES: LootTable[] = [
  ...SCHOOLS.map(ruin),
  ...SCHOOLS.map(cave),
  { id: 'tbl:morvane-ruin', rolls: 1, entries: [{ weight: 40, rune: 'any' }, { weight: 25, tome: 'any' }, { weight: 35, gear: { minRarity: 'runed', forKit: true } }] },
  { id: 'tbl:morvane-cave', rolls: 2, entries: [{ weight: 50, rune: 'any' }, { weight: 20, tome: 'any' }, { weight: 30, gear: { minRarity: 'wrought', forKit: true } }] },
  { id: 'tbl:heart-cache', rolls: 2, entries: [{ weight: 40, rune: 'any' }, { weight: 60, gear: { minRarity: 'wrought', forKit: true } }] },
  // lairs stay worth clearing: a small extra on top of a rare side-room chest's usual roll
  { id: 'tbl:lair-rare', rolls: 1, entries: [{ weight: 70, nothing: true }, { weight: 20, rune: 'any' }, { weight: 10, item: 'i_runedust', qty: [2, 4] }] },
  // Act III: the killer's own class gets a tome of another school and a spark-rarity piece for its kit
  { id: 'tbl:act3', rolls: 1, always: [{ weight: 1, gear: { minRarity: 'spark', forKit: true } }], entries: [{ weight: 60, tome: 'any' }, { weight: 40, rune: 'any' }] },
  // the 25 legendary bosses: on top of the legendary itself, a rune and a rare piece
  ...HC_LEGENDARIES.map((l): LootTable => ({ id: `tbl:${l.boss}`, rolls: 1, entries: [{ weight: 60, rune: 'any' }, { weight: 40, gear: { minRarity: 'runed', forKit: true } }] })),
];

const BY_ID = new Map(HC_LOOT_TABLES.map((t) => [t.id, t]));
export const lootTable = (id: string): LootTable | undefined => BY_ID.get(id);

/** Act III forms (herald / chimera): their kill also rolls tbl:act3. */
export const ACT3_BOSSES = new Set(HC_CAMPAIGN_BOSSES.filter((b) => b.slot === 'herald' || b.slot === 'chimera').map((b) => b.id));
