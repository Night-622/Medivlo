/**
 * Slash / quick shot (Claude 3, the user's request 2026-10-20): martial classes get a plain swing on its own key
 * (core action `slash`, Btn.SLASH) with a short cooldown set by the weapon's weight; bows loose a quick shot instead.
 * Pure: the sim swings it, the hotbar reads the cooldown total, the tests read the table.
 *
 * Damage per swing is a share of the weapon roll, sized so that spamming it adds about half the weapon's basic-attack
 * damage per second (heavier weapons: longer cooldown, bigger hit). It costs nothing and never resets the auto-attack.
 */
import { CLASS_SCHOOL, MARTIAL_SCHOOLS } from '@/core/constants';
import type { WeaponType } from './types';

export interface SlashSpec {
  /** cooldown, ms */
  cd: number;
  /** share of the weapon roll per hit */
  coef: number;
  /** swing: reach past the body (px) and arc (degrees) */
  range: number;
  arc: number;
  /** foes one swing can strike */
  hits: number;
  /** bows: a fast, short shot instead of a swing */
  shot?: { speed: number; range: number };
}

export const SLASH_ID = 'slash';

export const SLASH: Record<WeaponType, SlashSpec> = {
  dagger: { cd: 350, coef: 0.39, range: 52, arc: 100, hits: 2 },
  wand: { cd: 400, coef: 0.3, range: 52, arc: 100, hits: 2 },
  sword: { cd: 500, coef: 0.38, range: 60, arc: 120, hits: 2 },
  spear: { cd: 600, coef: 0.4, range: 88, arc: 60, hits: 2 },
  staff: { cd: 600, coef: 0.38, range: 64, arc: 130, hits: 2 },
  axe: { cd: 750, coef: 0.47, range: 62, arc: 140, hits: 3 },
  mace: { cd: 850, coef: 0.53, range: 58, arc: 110, hits: 2 },
  bow: { cd: 500, coef: 0.33, range: 0, arc: 0, hits: 1, shot: { speed: 720, range: 220 } },
};

/** Martial schools only: the six magic schools never see or get the slash. */
export const hasSlash = (classId: string): boolean => {
  const s = CLASS_SCHOOL[classId.replace(/^class:/, '')];
  return !!s && MARTIAL_SCHOOLS.includes(s);
};

export type SlashAim = 'facing' | 'mouse';

/**
 * The aim point the client sends with Btn.SLASH (Settings › Gameplay › Slash aim). 'facing' (default): 100 px ahead of
 * the hero along its current or last walking direction, whatever the mouse is doing. 'mouse': the cursor / click point.
 */
export function slashAimPoint(mode: SlashAim, hero: { x: number; y: number } | null, facing: { x: number; y: number }, mouse: { x: number; y: number }): { x: number; y: number } {
  if (mode === 'mouse' || !hero) return { x: Math.round(mouse.x), y: Math.round(mouse.y) };
  const l = Math.hypot(facing.x, facing.y) || 1;
  return { x: Math.round(hero.x + (facing.x / l) * 100), y: Math.round(hero.y + (facing.y / l) * 100) };
}
