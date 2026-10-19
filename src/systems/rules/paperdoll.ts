/**
 * Paperdoll (Claude 3, atlas.heroComposer.equipRules): which armour sets / weapon the hero composer draws.
 * Indices are 1-based into MV.GEAR.SETS / WEAPONS (same order as HC_SETS / HC_WEAPONS); 0 = class default.
 */
import { HC_SETS } from '@/data/items/hc/armour.gen';
import { HC_WEAPONS } from '@/data/items/hc/weapons.gen';
import { armourPiece, weaponBase } from './gear';
import type { CharacterSave } from './types';

export interface PaperdollGear {
  brows?: number; dye?: number; headwear?: number; cape?: number; neck?: number; face?: number; extra?: number;
  helmSet?: number; chestSet?: number; handsSet?: number; feetSet?: number; weapon?: number;
}
export interface HeroLookLite { skin: number; hair: number; hc: number; eyes: number; ec: number; mouth: number; mark: number; body: 0 | 1; brows?: number }

const setIdx = (pieceId?: string) => {
  const p = pieceId ? armourPiece(pieceId) : undefined;
  return p ? HC_SETS.findIndex((s) => s.id === p.set) + 1 : 0;
};

export function paperdoll(save: CharacterSave, look?: HeroLookLite): PaperdollGear {
  const e = save.equipment, c = save.cosmetics;
  const w = e.main ? weaponBase(e.main.base) : undefined;
  return {
    brows: look?.brows ?? 0, dye: c.dye, headwear: c.headwear, cape: c.back, neck: c.neck, face: c.face, extra: c.extra,
    helmSet: setIdx(e.head?.base), chestSet: setIdx(e.chest?.base), handsSet: setIdx(e.hands?.base), feetSet: setIdx(e.feet?.base),
    weapon: w ? HC_WEAPONS.findIndex((x) => x.id === w.id) + 1 : 0,
  };
}

/** Compact replicated key: changes whenever the drawn hero would change. */
export const lookKey = (classId: string, look: HeroLookLite | undefined, g: PaperdollGear): string =>
  [classId, ...(look ? [look.skin, look.hair, look.hc, look.eyes, look.ec, look.mouth, look.mark, look.body] : ['d']),
    g.brows, g.dye, g.headwear, g.cape, g.neck, g.face, g.extra, g.helmSet, g.chestSet, g.handsSet, g.feetSet, g.weapon].join('.');
