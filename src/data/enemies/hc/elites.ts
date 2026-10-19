/**
 * Elite affixes (Claude 3, PACING.md): champion creatures in packs and patrols. An elite has ~6× health, hits ~1.3×
 * harder, wears a name prefix per affix ("Vampiric Molten Thunderbird") and drops like a lesser mini-boss.
 * Affixes reuse the creature ability language: `lines` go through abilities.ts like any bestiary line, so every
 * affix is a real, telegraphed ability; `passive` adds stat rules.
 */
import type { Passive } from '@/systems/rules/types';

export interface EliteAffix {
  id: string;
  /** name prefix shown on the nameplate / target frame */
  prefix: string;
  /** one-glyph tag for compact UI (affix icons) */
  glyph: string;
  color: string;
  lines?: string[];
  passive?: Passive;
  /** movement / attack tempo */
  speed?: number;
  /** short player-facing rule text (tooltips, target frame) */
  desc: string;
}

export const HC_ELITE_AFFIXES: EliteAffix[] = [
  { id: 'vampiric', prefix: 'Vampiric', glyph: '♥', color: '#ff4d5e', desc: 'Heals itself for a fifth of the damage it deals.', passive: { mods: [{ stat: 'lifesteal', op: 'flat', value: 0.2 }] } },
  { id: 'frozen', prefix: 'Frozen', glyph: '❄', color: '#7fe3ff', desc: 'Freezes the ground around it.', lines: ['Freezes the floor.'] },
  { id: 'molten', prefix: 'Molten', glyph: '▲', color: '#ff6a2a', desc: 'Leaves fire behind and bursts into flame when it dies.', lines: ['Leaves pools of fire.', 'Bursts into flames when it dies.'] },
  { id: 'shielding', prefix: 'Shielding', glyph: '◈', color: '#ffd96b', desc: 'Shields itself and its pack.', lines: ['Shields its allies.'] },
  { id: 'swift', prefix: 'Swift', glyph: '»', color: '#4fd86a', desc: 'Moves and strikes far faster.', speed: 1.4 },
  { id: 'warding', prefix: 'Warding', glyph: '✚', color: '#c09070', desc: 'Takes far less damage while another of its pack stands near.', passive: { hooks: [{ id: 'warding', value: 0.45 }] } },
  { id: 'thorny', prefix: 'Thorny', glyph: '✶', color: '#d9b45a', desc: 'Hurts whoever strikes it in melee.', passive: { hooks: [{ id: 'thorny', value: 0.15 }] } },
  { id: 'blinking', prefix: 'Blinking', glyph: '✦', color: '#a35cff', desc: 'Vanishes and strikes from behind.', lines: ['Vanishes and strikes from behind.'] },
];

export const eliteAffix = (id: string): EliteAffix | undefined => HC_ELITE_AFFIXES.find((a) => a.id === id);

/** Elite multipliers (the affixes add the mechanics). */
export const ELITE = { hp: 6, dmg: 1.3, armor: 1.2, xp: 6, gear: 0.7, gold: 6 } as const;

/** Act level bands end at 14 / 28 / 40 (PACING.md): elites in the last few levels of a band roll one extra affix. */
export const ELITE_BAND_TOPS = [14, 28, 40] as const;
export const eliteBandTop = (level: number): boolean => ELITE_BAND_TOPS.some((t) => level >= t - 2 && level <= t);
