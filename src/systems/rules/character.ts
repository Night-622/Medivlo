/** New characters and skill-point bookkeeping (Claude 3). Pure. */
import { kitFor } from '@/data/classes/hc/kits';
import { levelPoints } from './curves';
import { spentPoints } from './tree';
import type { CharacterSave, ItemInstance } from './types';

let seq = 0;
const uid = (base: string) => `new-${base}-${(++seq).toString(36)}`;
const item = (base: string, qty = 1, ilvl = 1): ItemInstance => ({ uid: uid(base), base, ilvl, qty });

/** A fresh level-1 character: class start weapon equipped, a few draughts in the pack, kit spells on 1–3. */
export function newCharacter(classId: string, body: 0 | 1 = 0): CharacterSave {
  const kit = kitFor(classId);
  return {
    classId, body, level: 1, xp: 0, gold: 20,
    inventory: [item('i_hp_s', 3), item('i_em_s', 2), item('i_bread', 2)],
    equipment: { main: item(kit.startWeapon) },
    cosmetics: { back: 0, neck: 0, face: 0, extra: 0, dye: 0, headwear: 0 },
    tree: {}, bonusPoints: 0,
    hotbar: [kit.spells[0], kit.spells[1], kit.spells[2], null],
    legendariesSeen: [], waystone: null,
  };
}

export const availablePoints = (s: CharacterSave): number => levelPoints(s.level) + s.bonusPoints - spentPoints(s.tree);
