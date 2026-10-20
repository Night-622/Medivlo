/**
 * Loadout sanitising (Claude 3): the authority never trusts a client's CharacterSave blindly. Until public realms
 * read a trusted Firestore copy, every loadout passes through here: numbers clamped, unknown items dropped,
 * equipment checked against slot and class, the skill tree replayed node by node within the points available,
 * the hotbar limited to spells the character actually has. Pure.
 */
import { HC_CLASSES } from '@/data/classes/hc/classes.gen';
import { kitFor } from '@/data/classes/hc/kits';
import { LEVEL_CAP, levelPoints, xpToNext } from './curves';
import { itemInfo, slotsFor, TWO_HANDED } from './gear';
import { rollable, sanitizeAffixes, socketCount } from './affixes';
import { sanitizeRunes } from './runes';
import { allUniques, uniqueDef } from './uniques';
import { spellDef } from './spells';
import { HC_TOMES } from '@/data/items/hc/build-items';
import { CLASS_SCHOOL } from '@/core/constants';
import { MAGIC_SCHOOLS, MARTIAL_SCHOOLS } from '@/core/constants';
import { HC_LEGENDARIES } from '@/data/items/hc/legendary.gen';
import { allNodes, canLearn } from './tree';
import { RARITY_ORDER, type CharacterSave, type GearSlot, type ItemInstance } from './types';

const MAX_GOLD = 10_000_000, MAX_STACK = 999, MAX_PACK = 160, MAX_BONUS_POINTS = 60, ILVL_ABOVE = 5;
const SLOTS: GearSlot[] = ['main', 'off', 'head', 'chest', 'hands', 'feet', 'ring1', 'ring2', 'amulet'];

const int = (v: unknown, lo: number, hi: number, dflt = lo): number => {
  const n = typeof v === 'number' && Number.isFinite(v) ? Math.floor(v) : dflt;
  return Math.max(lo, Math.min(hi, n));
};
const str = (v: unknown, max = 64): string | null => (typeof v === 'string' && v.length > 0 && v.length <= max ? v : null);

function item(raw: unknown, level: number): ItemInstance | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const base = str(r.base), uid = str(r.uid, 80);
  const info = base ? itemInfo(base) : undefined;
  if (!base || !uid || !info) return null;
  const out: ItemInstance = {
    uid, base, ilvl: int(r.ilvl, 1, Math.min(LEVEL_CAP, level + ILVL_ABOVE), 1),
    qty: info.stackable ? int(r.qty, 1, MAX_STACK, 1) : 1,
  };
  const gem = str(r.gem);
  if (gem && itemInfo(gem)?.kind === 'gem') out.gem = gem;
  // deeper builds (BUILDS.md §8): rolled rarity / affixes inside their tables, sockets by rarity, upgrade 0–5
  if (rollable(base)) {
    if (typeof r.rarity === 'string' && (RARITY_ORDER as string[]).includes(r.rarity)) out.rarity = r.rarity as ItemInstance['rarity'];
    const affixes = sanitizeAffixes({ base, ilvl: out.ilvl, rarity: out.rarity, affixes: r.affixes as ItemInstance['affixes'] });
    if (affixes.length) out.affixes = affixes;
  }
  // a unique's affixes are its own (fixed), whatever the loadout says
  const ud = uniqueDef(base);
  if (ud) { out.rarity = 'spark'; out.affixes = ud.affixes.map((a) => ({ ...a })); }
  const n = socketCount(out);
  if (n && Array.isArray(r.sockets)) out.sockets = Array.from({ length: n }, (_, i) => { const g = str((r.sockets as unknown[])[i]); return g && itemInfo(g)?.kind === 'gem' ? g : null; });
  const up = int(r.upgrade, 0, 5, 0);
  if (up && info.slot) out.upgrade = up;
  const imbue = str(r.imbue);
  if (imbue && info.slot === 'weapon' && (info.kind === 'weapon' || info.kind === 'legendary') && ([...MAGIC_SCHOOLS, ...MARTIAL_SCHOOLS] as readonly string[]).includes(imbue)) out.imbue = imbue as ItemInstance['imbue'];
  const fx = str(r.uniqueFx);
  if (fx && info.slot && uniqueFxOk(fx)) out.uniqueFx = fx;
  return out;
}

/**
 * Equipment rules on the authority's own items (a later remote loadout only names uids; the authority swaps its copy
 * in, so the slot / class / two-hander rules must hold on that copy): right slot, a kit weapon, no off hand with a
 * two-hander. Returns the equipment kept and the items that must go back to the pack.
 */
export function legalEquipment(classId: string, eq: CharacterSave['equipment']): { equipment: CharacterSave['equipment']; off: ItemInstance[] } {
  const kit = kitFor(classId), equipment: CharacterSave['equipment'] = {}, off: ItemInstance[] = [];
  for (const slot of SLOTS) {
    const it = eq[slot];
    if (!it) continue;
    const info = itemInfo(it.base);
    if (!info || !slotsFor(info).includes(slot) || (info.weaponType && !kit.weapons.includes(info.weaponType))) { off.push(it); continue; }
    equipment[slot] = it;
  }
  const main = equipment.main && itemInfo(equipment.main.base);
  if (main?.weaponType && TWO_HANDED.includes(main.weaponType) && equipment.off) { off.push(equipment.off); delete equipment.off; }
  return { equipment, off };
}

/** Returns a safe copy, or null when the loadout is unusable (unknown class, not an object). */
export function sanitizeLoadout(raw: unknown): CharacterSave | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const classId = str(r.classId);
  if (!classId || !HC_CLASSES.some((c) => c.id === classId)) return null;
  const kit = kitFor(classId);
  const level = int(r.level, 1, LEVEL_CAP, 1);
  const seen = new Set<string>();
  const uniq = (it: ItemInstance | null): it is ItemInstance => !!it && !seen.has(it.uid) && (seen.add(it.uid), true);

  // equipment: right slot, class may wield it, no off hand with a two-hander
  const equipment: CharacterSave['equipment'] = {};
  const eqRaw = (r.equipment && typeof r.equipment === 'object' ? r.equipment : {}) as Record<string, unknown>;
  for (const slot of SLOTS) {
    const it = item(eqRaw[slot], level);
    if (!uniq(it)) continue;
    const info = itemInfo(it.base)!;
    if (!slotsFor(info).includes(slot)) continue;
    if (info.weaponType && !kit.weapons.includes(info.weaponType)) continue;
    equipment[slot] = it;
  }
  const mainType = equipment.main ? itemInfo(equipment.main.base)?.weaponType : undefined;
  if (mainType && TWO_HANDED.includes(mainType)) delete equipment.off;

  const inventory = (Array.isArray(r.inventory) ? r.inventory : []).slice(0, MAX_PACK).map((x) => item(x, level)).filter(uniq);

  // skill tree: replay every rank through the same rules the client used, within the points available
  const bonusPoints = int(r.bonusPoints, 0, MAX_BONUS_POINTS, 0);
  const wanted = (r.tree && typeof r.tree === 'object' ? r.tree : {}) as Record<string, unknown>;
  const tree: Record<string, number> = {};
  let budget = levelPoints(level) + bonusPoints;
  const nodes = allNodes(classId);
  for (let pass = 0; pass < 6 && budget > 0; pass++) {
    let progressed = false;
    for (const n of nodes) {
      const want = int(wanted[n.id], 0, n.maxRank, 0);
      while ((tree[n.id] ?? 0) < want && budget > 0 && canLearn(classId, n.id, tree, budget).ok) {
        tree[n.id] = (tree[n.id] ?? 0) + 1;
        budget--;
        progressed = true;
      }
    }
    if (!progressed) break;
  }

  // hotbar: kit spells + spells granted by learned nodes
  // a tome's off-school spell (BUILDS.md §4): one non-ultimate school spell of another school
  const tomeId = str(r.tomeSpell, 80), tomeSp = tomeId ? spellDef(tomeId) : undefined;
  const tomeSpell = tomeSp && HC_TOMES.some((t) => t.spell === tomeId) && tomeSp.school !== CLASS_SCHOOL[classId] ? tomeId! : undefined;
  const known = new Set<string>([...kit.spells, ...nodes.filter((n) => n.grantsSpell && (tree[n.id] ?? 0) > 0).map((n) => n.grantsSpell!), ...(tomeSpell ? [tomeSpell] : [])]);
  const hb = Array.isArray(r.hotbar) ? r.hotbar : [];
  const hotbar = [0, 1, 2, 3].map((i) => { const s = str(hb[i]); return s && known.has(s) ? s : null; }) as CharacterSave['hotbar'];

  const cos = (r.cosmetics && typeof r.cosmetics === 'object' ? r.cosmetics : {}) as Record<string, unknown>;
  return {
    classId, body: r.body === 1 ? 1 : 0, level,
    xp: int(r.xp, 0, Math.max(0, xpToNext(level) - 1), 0),
    gold: int(r.gold, 0, MAX_GOLD, 0),
    inventory, equipment,
    cosmetics: { back: int(cos.back, 0, 8), neck: int(cos.neck, 0, 8), face: int(cos.face, 0, 8), extra: int(cos.extra, 0, 8), dye: int(cos.dye, 0, 8), headwear: int(cos.headwear, 0, 4) },
    tree, bonusPoints, hotbar,
    ...(tomeSpell ? { tomeSpell } : {}),
    runes: sanitizeRunes({ classId, tree, tomeSpell, runes: r.runes as CharacterSave['runes'] }),
    ...(typeof r.buildVersion === 'number' ? { buildVersion: int(r.buildVersion, 0, 99, 0) } : {}),
    ...(r.freeRespec === true ? { freeRespec: true } : {}),
    legendariesSeen: (Array.isArray(r.legendariesSeen) ? r.legendariesSeen : []).filter((x): x is string => typeof x === 'string' && (x.startsWith('lg_') || x.startsWith('u_'))).slice(0, 80),
    waystone: str(r.waystone, 80),
    ...(r.look && typeof r.look === 'object' ? { look: sanitizeLook(r.look as Record<string, unknown>) } : {}),
    chests: (Array.isArray(r.chests) ? r.chests : []).filter((x): x is string => typeof x === 'string' && x.startsWith('obj:') && x.length < 120).slice(-3000),
    prefs: { autoLootGold: (r.prefs as { autoLootGold?: unknown } | undefined)?.autoLootGold !== false },
  } as CharacterSave;
}

/** The hero look rides along with the loadout for paperdoll baking; keep it to small integers. */
function sanitizeLook(l: Record<string, unknown>): Record<string, number> {
  const out: Record<string, number> = {};
  for (const k of ['skin', 'hair', 'hc', 'eyes', 'ec', 'mouth', 'mark', 'body', 'brows']) out[k] = int(l[k], 0, 12, 0);
  out.body = out.body ? 1 : 0;
  return out;
}

/** A unique effect id a loadout may carry (moved by the Runeforge): today the legendary effects (BUILDS.md §5). */
const UNIQUE_FX = new Set([...HC_LEGENDARIES.map((l) => l.id), ...allUniques().map((u) => u.id)]);
const uniqueFxOk = (fx: string): boolean => UNIQUE_FX.has(fx);
