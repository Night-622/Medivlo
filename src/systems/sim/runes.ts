/**
 * Runes and tomes on the authority (Claude 3, docs/systems/BUILDS.md §2.2, §4). Slotting a rune uses one from the
 * pack; unslotting gives it back. Reading a tome teaches its spell as the one off-school spell (a second replaces
 * the first). Replies with a notice string on refusal, like the shop and the Runeforge.
 */
import { CLASS_SCHOOL } from '@/core/constants';
import { HC_TOMES } from '@/data/items/hc/build-items';
import { runeDef, runeFits, runeSlots } from '@/systems/rules/runes';
import { spellDef } from '@/systems/rules/spells';
import { grantItem, grantOrDrop } from './loot';
import { consumeItem, rebuildPlayer } from './player';
import type { PlayerEnt } from './state';
import type { SimWorld } from './world';

const changed = (w: SimWorld, p: PlayerEnt): void => { rebuildPlayer(w, p); w.emit('loot:granted', { playerId: p.playerId }); };

/** act 'rune': { spell, rune } slots one; { spell, rune, remove: true } takes it out. */
export function runeAct(w: SimWorld, p: PlayerEnt, args: Record<string, unknown>): string | null {
  const spellId = String(args.spell ?? ''), id = String(args.rune ?? '');
  const sp = spellDef(spellId), r = runeDef(id);
  if (!sp || !r) return 'That rune won’t go there.';
  if (!p.spells.has(spellId)) return 'You don’t know that spell.';
  const runes = (p.save.runes ??= {});
  const now = runes[spellId] ?? [];
  if (args.remove === true) {
    if (!now.includes(id)) return 'That rune isn’t in that spell.';
    if (!grantItem(w, p, { base: id, ilvl: 1, qty: 1 })) return 'Your pack is full.';
    runes[spellId] = now.filter((x) => x !== id);
    if (!runes[spellId].length) delete runes[spellId];
    changed(w, p);
    return null;
  }
  const slots = runeSlots(p.save, spellId);
  if (!slots) return 'That spell has no rune slot yet. Learn more of its path.';
  if (now.length >= slots) return 'Every rune slot in that spell is full.';
  if (now.includes(id)) return 'That rune is already in that spell.';
  if (!runeFits(r, sp)) return 'That rune doesn’t suit that spell.';
  const it = p.save.inventory.find((x) => x.base === id && x.qty > 0);
  if (!it) return 'You don’t have that rune.';
  consumeItem(w, p, it.uid);
  runes[spellId] = [...now, id];
  changed(w, p);
  return null;
}

/** Reading a tome (useItem): true if `uid` was a tome (read or refused), false if it is something else. */
export function readTome(w: SimWorld, p: PlayerEnt, uid: string): boolean {
  const it = p.save.inventory.find((x) => x.uid === uid);
  const tome = it && HC_TOMES.find((t) => t.item === it.base);
  if (!it || !tome) return false;
  if (tome.school === CLASS_SCHOOL[p.save.classId]) { w.emit('systems:notice', { playerId: p.playerId, text: 'You already know your own school’s spells.', kind: 'error' }); return true; }
  const old = p.save.tomeSpell;
  if (old === tome.spell) { w.emit('systems:notice', { playerId: p.playerId, text: 'You already know that spell.', kind: 'error' }); return true; }
  // runes slotted in the forgotten spell come back to the pack
  if (old) for (const id of p.save.runes?.[old] ?? []) grantOrDrop(w, p, { base: id, ilvl: 1, qty: 1 });
  if (old && p.save.runes) delete p.save.runes[old];
  p.save.tomeSpell = tome.spell;
  p.save.hotbar = p.save.hotbar.map((h) => (h === old ? null : h)) as typeof p.save.hotbar;
  consumeItem(w, p, uid);
  changed(w, p);
  w.emit('systems:notice', { playerId: p.playerId, text: `You learn ${spellDef(tome.spell)?.name ?? 'a new spell'}.`, kind: 'info' });
  return true;
}
