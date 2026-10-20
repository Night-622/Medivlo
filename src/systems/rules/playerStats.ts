/**
 * Player stat compilation from a CharacterSave (Claude 3). Pure and shared: the sim uses it on the authority and
 * the character screens use it on every client, so the sheet always matches combat.
 */
import { HC_CLASSES } from '@/data/classes/hc/classes.gen';
import { kitFor } from '@/data/classes/hc/kits';
import { legendary, legendaryPassive, setBonuses, itemMods } from './gear';
import { campaignItem } from '@/data/items/hc/campaign-items';
import { classBase, compile, type Compiled } from './stats';
import { treePassives } from './tree';
import type { CharacterSave, Passive } from './types';

export function playerPassives(s: CharacterSave): { passives: Passive[]; spells: string[] } {
  const cls = HC_CLASSES.find((c) => c.id === s.classId)!;
  const eq = Object.values(s.equipment).filter((x): x is NonNullable<typeof x> => !!x);
  const out: Passive[] = [{ mods: classBase(cls, s.level) }, kitFor(s.classId).passive];
  for (const it of eq) {
    out.push({ mods: itemMods(it) });
    if (legendary(it.base)) out.push(legendaryPassive(it.base));
    const story = campaignItem(it.base)?.passive;
    if (story) out.push(story);
  }
  const tree = treePassives(s.classId, s.tree);
  // Set Mastery (hook setMastery, value 0.25): Attuned armour bonuses are that much stronger
  const mastery = tree.passives.reduce((v, p) => v + (p.hooks?.find((h) => h.id === 'setMastery')?.value ?? 0), 0);
  out.push(...setBonuses(eq, cls.school, 1 + mastery));
  out.push(...tree.passives);
  return { passives: out, spells: tree.spells };
}

export const compileStats = (s: CharacterSave): Compiled => compile(playerPassives(s).passives);
