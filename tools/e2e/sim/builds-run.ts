/**
 * Build simulator (Claude 3 helper): runs one build through its level's fights. Realm pack (three of the class
 * realm's creatures), one lair (lairWaves, 5 rooms, HP carried over) and the campaign boss for the level:
 * L8 → lair-2 boss, L14 → nemesis, L34 → the Act III form (Herald / Union Chimera), boss level = build level.
 */
import { CLASS_SCHOOL } from '@/core/constants';
import { HC_CAMPAIGN_BOSSES } from '@/data/enemies/hc/campaign';
import type { Build } from './builds-make';
import { seedOf } from './builds-make';
import { runFight, runLair, type FightResult } from './builds-fight';

export const LEVELS = [8, 14, 34] as const;
export type Level = (typeof LEVELS)[number];
export const BOSS_SLOT: Record<Level, { slot: string; label: string }> = {
  8: { slot: 'lair2', label: 'lair-2' }, 14: { slot: 'nemesis', label: 'nemesis' }, 34: { slot: 'act3', label: 'Act III' },
};

export function bossFor(cls: string, level: Level): { id: string; name: string } {
  const slot = BOSS_SLOT[level].slot;
  const b = HC_CAMPAIGN_BOSSES.find((x) => x.classId === cls && (x.slot === slot || (slot === 'act3' && (x.slot === 'herald' || x.slot === 'chimera'))));
  if (!b) throw new Error(`[builds] no ${slot} boss for ${cls}`);
  return { id: b.id, name: b.name };
}

export interface Row {
  b: Build;
  pack: FightResult;
  lair: FightResult & { waves: number; cleared: number };
  boss: FightResult;
  bossName: string;
}

export const dps = (r: FightResult): number => r.dealt / Math.max(1, r.secs);
export const ehp = (r: FightResult): number => r.maxHp / Math.max(0.05, 1 - r.mitig);

/** Every fight a build plays. Same seeds for every build of a class at a level, so builds differ only by build. */
export function runBuild(b: Build, opts: { bossOnly?: boolean } = {}): Row {
  const L = b.level as Level, realm = CLASS_SCHOOL[b.cls];
  const boss = bossFor(b.cls, L);
  const bossR = runFight(b.save, [{ creature: boss.id, level: L, x: 200, y: 0 }], seedOf(b.cls, L, 'boss'));
  const skip: FightResult = { won: false, secs: 0, dealt: 0, taken: 0, healed: 0, potions: 0, deaths: 0, maxHp: bossR.maxHp, mitig: bossR.mitig, hpLeft: 0 };
  if (opts.bossOnly) return { b, pack: skip, lair: { ...skip, waves: 0, cleared: 0 }, boss: bossR, bossName: boss.name };
  const pack = runFight(b.save, [0, 1, 2].map((i) => ({ creature: `bx_${realm}_${i}`, level: L, x: 160 + i * 30, y: -60 + i * 60 })), seedOf(b.cls, L, 'pack'));
  const lair = runLair(b.save, realm, seedOf(b.cls, L, 'lair') % 1000);
  return { b, pack, lair, boss: bossR, bossName: boss.name };
}

/** Ranking: most wins (pack, lair without a death, boss), fewest deaths, then fastest total time. */
export const wins = (r: Row): number => (r.pack.won ? 1 : 0) + (r.lair.won && r.lair.deaths === 0 ? 1 : 0) + (r.boss.won ? 1 : 0);
export const score = (r: Row): number => wins(r) * 1e6 - r.lair.deaths * 1e4 - (r.pack.secs + r.lair.secs + r.boss.secs);
