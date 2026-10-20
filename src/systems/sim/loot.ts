/**
 * Loot (Claude 3, HOLLOW_CROWN.md §3, §6): shared drops rolled once per party member, level-gated gear, gold,
 * handoff material drops, boss legendaries. Loot is a world entity anyone can pick up (PvP gold piles are locked
 * to the killer for 30 s). Pickup grants go out as loot:granted for the owning client to apply and save.
 */
import { HC_PIECES } from '@/data/items/hc/armour.gen';
import { HC_LEGENDARIES } from '@/data/items/hc/legendary.gen';
import { HC_WEAPONS } from '@/data/items/hc/weapons.gen';
import { P, dropRolls, unlockLevel } from '@/systems/rules/curves';
import type { DropSpec } from '@/systems/rules/creatures';
import { AMULET_IDS, itemInfo, materialIndex, RING_IDS, styleIndex } from '@/systems/rules/gear';
import { itemRarity, rollable, rollAffixes, rollInstance, type DropTier } from '@/systems/rules/affixes';
import { SOCKETS, type LootEntry } from '@/systems/rules/affixTypes';
import { ACT3_BOSSES, lootTable } from '@/data/items/hc/lootTables';
import { HC_RUNES, HC_TOMES } from '@/data/items/hc/build-items';
import { uniqueDef, uniqueInstance } from '@/systems/rules/uniques';
import { ELITE } from '@/data/enemies/hc/elites';
import { RARITY_ORDER, type ItemInstance } from '@/systems/rules/types';
import type { EnemyEnt, LootEnt, PlayerEnt } from './state';
import { Btn } from '@/net/types';
import { dist2, type SimWorld } from './world';

const GEAR_CHANCE = { enemy: 0.12, mini: 1, boss: 1 } as const;
const GEAR_COUNT = { enemy: 1, mini: 1, boss: 2 } as const;
const GOLD = { enemy: 3, mini: 30, boss: 150 } as const;
const LOOT_LIFE = 120_000;

/** Highest unlocked index weighted toward recent tiers but leaving older ones possible. */
function pickIndex(w: SimWorld, level: number, max: number, luck: number): number {
  let top = 0;
  for (let i = 0; i <= max; i++) if (level >= unlockLevel(i)) top = i;
  const roll = w.rng.next() * (1 - luck * 0.5);
  // the newest tier most of the time (0.7): drops, not the smith, are where upgrades come from (gear-curve audit)
  return roll < 0.7 ? top : roll < 0.9 ? Math.max(0, top - 1) : w.rng.int(0, top);
}

/** Who the drop is for: weapon types and armour school of the killers (drops lean toward what they can use). */
export interface LootFor { weapons: string[]; school: string; classId?: string }

/** A rolled gear drop: the base by material / style (as before), then rolled rarity, affixes and empty sockets. */
export function rollGear(w: SimWorld, level: number, spec?: DropSpec, luck = 0, forWho?: LootFor, tier: DropTier = 'enemy'): Pick<ItemInstance, 'base' | 'ilvl' | 'rarity' | 'affixes' | 'sockets'> {
  const g = rollBase(w, level, spec, luck, forWho);
  return { ...g, ...rollInstance(w.rng, g.base, g.ilvl, luck, tier, forWho && { classId: forWho.classId, school: forWho.school }) };
}

function rollBase(w: SimWorld, level: number, spec?: DropSpec, luck = 0, forWho?: LootFor): { base: string; ilvl: number } {
  // rings and amulets drop too (about 1 in 10 gear rolls), with the usual rarity and bonus lines
  if (!spec && w.rng.chance(0.1)) return { base: w.rng.pick(w.rng.chance(0.5) ? RING_IDS : AMULET_IDS), ilvl: level };
  if (spec?.kind === 'spark') {
    const pool = w.rng.chance(0.5) ? HC_WEAPONS.filter((x) => x.material === 'spark').map((x) => x.id) : HC_PIECES.filter((p) => p.set.endsWith('_vestment')).map((p) => p.id);
    return { base: w.rng.pick(pool), ilvl: level };
  }
  if (spec?.kind === 'armour' || (!spec && w.rng.chance(0.6))) {
    const s = spec?.kind === 'armour' ? spec : undefined;
    const styleIdx = s?.style ? ['cloth', 'leather', 'fur', 'mail', 'robe', 'scale', 'plate', 'vestment'].indexOf(s.style) : pickIndex(w, level, 7, luck);
    const school = s?.school ?? (forWho && w.rng.chance(0.5) ? forWho.school : undefined);
    const pool = HC_PIECES.filter((p) => styleIndex(p.id) === styleIdx && (!school || p.set.startsWith(`${school}_`)));
    return { base: w.rng.pick(pool.length ? pool : HC_PIECES).id, ilvl: level };
  }
  const m = pickIndex(w, level, 7, luck);
  const mine = forWho && w.rng.chance(0.7) ? forWho.weapons : null;
  const pool = HC_WEAPONS.filter((x) => materialIndex(x.id) === m && (!mine || mine.includes(x.type)));
  return { base: w.rng.pick(pool.length ? pool : HC_WEAPONS.filter((x) => materialIndex(x.id) === m)).id, ilvl: level };
}

function drop(w: SimWorld, space: string, x: number, y: number, item?: LootEnt['item'], gold?: number, lockTo?: string): void {
  const id = w.nextId('loot');
  const a = w.rng.range(0, Math.PI * 2), d = w.rng.range(8, 30);
  w.loot.set(id, { id, space, x: x + Math.cos(a) * d, y: y + Math.sin(a) * d, item, gold, lockTo, lockUntil: lockTo ? w.t + 30_000 : undefined, expiresAt: w.t + LOOT_LIFE });
}

/** Drops for one creature kill. Rolls repeat per party member (2 players → double drops). */
export function rollKillLoot(w: SimWorld, e: EnemyEnt, killers: PlayerEnt[]): void {
  if (e.ownerId || e.summonerId && e.tier === 'enemy' && w.rng.chance(0.7)) return; // pets and most adds drop nothing
  const rolls = dropRolls(w.ports.partySize());
  const luck = Math.max(0, ...killers.map((k) => k.stats.stats.itemFind ?? 0));
  const goldMult = Math.max(0, ...killers.map((k) => k.stats.stats.gold ?? 0));
  for (let r = 0; r < rolls; r++) {
    const elite = e.elite?.length ? ELITE : null;
    drop(w, e.space, e.x, e.y, undefined, Math.round(GOLD[e.tier] * (elite?.gold ?? 1) * Math.pow(P(e.level), 0.6) * w.rng.range(0.7, 1.3) * (1 + goldMult)));
    const gearSpecs = e.cdef.drops.filter((d) => d.kind === 'armour' || d.kind === 'spark');
    for (let g = 0; g < GEAR_COUNT[e.tier]; g++) {
      if (!w.rng.chance(Math.max(GEAR_CHANCE[e.tier], elite?.gear ?? 0) * (1 + luck))) continue;
      const spec = gearSpecs.length && w.rng.chance(0.6) ? w.rng.pick(gearSpecs) : undefined;
      const k = killers.length ? killers[(r + g) % killers.length] : undefined;
      drop(w, e.space, e.x, e.y, { ...rollGear(w, Math.max(e.level, (k?.save.level ?? e.level) - 2), spec, luck, k ? { weapons: k.kit.weapons, school: k.school, classId: k.save.classId } : undefined, e.tier === 'boss' ? 'boss' : e.tier === 'mini' ? 'mini' : 'enemy'), qty: 1 });
    }
    for (const d of e.cdef.drops) {
      if (d.kind !== 'item') continue;
      const info = itemInfo(d.id);
      if (!info) continue;
      const chance = e.tier === 'enemy' ? 0.25 : e.tier === 'mini' ? 0.6 : 1;
      if (w.rng.chance(chance)) drop(w, e.space, e.x, e.y, { base: d.id, ilvl: e.level, qty: 1 });
    }
    if (e.tier === 'enemy' && w.rng.chance(0.08)) drop(w, e.space, e.x, e.y, { base: w.rng.pick(['i_hp_s', 'i_hp_s', 'i_em_s', 'i_st']), ilvl: e.level, qty: 1 });
  }
  if (e.tier === 'boss') {
    const lg = HC_LEGENDARIES.find((l) => l.boss === e.cdef.id);
    if (lg) for (const k of killers) {
      const first = !k.save.legendariesSeen.includes(lg.id);
      if (first || w.rng.chance(0.1)) {
        drop(w, e.space, e.x, e.y, { base: lg.id, ilvl: e.level, qty: 1 }, undefined, k.id);
        if (first) k.save.legendariesSeen.push(lg.id);
      }
    }
    // named tables (BUILDS.md §5.1): the boss's own, and tbl:act3 for every Act III form
    for (const k of killers) {
      rollTable(w, k, `tbl:${e.cdef.id}`, e.level, e);
      if (ACT3_BOSSES.has(e.cdef.id)) rollTable(w, k, 'tbl:act3', e.level, e);
    }
  }
}

/** Opened chests ride on the save (like look / prefs): object ids, once per character. */
export const chestsOf = (save: PlayerEnt['save']): string[] => ((save as { chests?: string[] }).chests ??= []);

/**
 * World chests (Claude 2's realm / instance objects): one roll per character per chest, at the chest's level, dropped
 * at the player's feet and held for them for 30 s. Common: gold, a gear roll (60%) and a potion. Rare: more gold and
 * one or two pieces leaning to the newest tier and the player's kit. Returns false if this character already opened it.
 */
export function openChest(w: SimWorld, p: PlayerEnt, objectId: string, props: Record<string, string | number | boolean>): boolean {
  const seen = chestsOf(p.save);
  if (seen.includes(objectId)) return false;
  seen.push(objectId);
  if (seen.length > 3000) seen.splice(0, seen.length - 3000);
  const level = Math.max(1, Math.min(40, Math.round(Number(props.level) || p.save.level)));
  const rare = props.rarity === 'rare';
  const luck = (rare ? 0.6 : 0.15) + (p.stats.stats.itemFind ?? 0);
  const forWho = { weapons: p.kit.weapons, school: p.school, classId: p.save.classId };
  const gold = Math.round(GOLD.mini * (rare ? 1.5 : 0.5) * Math.pow(P(level), 0.6) * w.rng.range(0.8, 1.2) * (1 + (p.stats.stats.gold ?? 0)));
  drop(w, p.space, p.x, p.y, undefined, gold, p.id);
  const pieces = rare ? (w.rng.chance(0.4) ? 2 : 1) : w.rng.chance(0.6) ? 1 : 0;
  // Lucky (hook chestExtra, 0.1): a chance of one more item
  const extra = w.rng.chance(p.stats.hooks.get('chestExtra') ?? 0) ? 1 : 0;
  for (let i = 0; i < pieces + extra; i++) drop(w, p.space, p.x, p.y, { ...rollGear(w, Math.max(level, p.save.level), undefined, luck, forWho, 'chest'), qty: 1 }, undefined, p.id);
  if (!rare || w.rng.chance(0.5)) drop(w, p.space, p.x, p.y, { base: w.rng.pick(['i_hp_s', 'i_hp_s', 'i_em_s', 'i_st']), ilvl: level, qty: 1 }, undefined, p.id);
  // a named table on the chest (Claude 2's placements: props.loot = 'tbl:<id>') rolls on top
  if (typeof props.loot === 'string') rollTable(w, p, props.loot, level, p);
  w.emit('chest:opened', { playerId: p.playerId, objectId });
  return true;
}

/** PvP (free-for-all): a share of carried gold drops, locked to the killer for 30 s. */
export function dropPvpGold(w: SimWorld, victim: PlayerEnt, killer: PlayerEnt): number {
  const g = Math.floor(victim.save.gold * 0.2);
  if (g <= 0) return 0;
  victim.save.gold -= g;
  w.emit('loot:granted', { playerId: victim.playerId, gold: -g });
  drop(w, victim.space, victim.x, victim.y, undefined, g, killer.id);
  return g;
}

let uidSeq = 0;
const uid = (w: SimWorld) => `it${w.tick.toString(36)}${(++uidSeq).toString(36)}${w.rng.int(0, 1295).toString(36)}`;

/** Add to the authority's copy of the character and tell the owning client. */
export function grantItem(w: SimWorld, p: PlayerEnt, it: Omit<ItemInstance, 'uid'>): boolean {
  const info = itemInfo(it.base);
  if (!info) return false;
  const inv = p.save.inventory;
  let instance: ItemInstance;
  const stack = info.stackable ? inv.find((x) => x.base === it.base) : undefined;
  if (stack) { stack.qty += it.qty; instance = stack; }
  else {
    if (inv.length >= Math.round(p.stats.stats.bag ?? 66)) return false;
    instance = { ...it, uid: uid(w) };
    if (!instance.gem) delete instance.gem;
    inv.push(instance);
  }
  w.emit('loot:granted', { playerId: p.playerId, item: it.base, qty: it.qty, instance: { ...instance, qty: it.qty } });
  w.emit('item:picked', { uid: instance.uid, def: it.base as never, qty: it.qty, playerId: p.playerId }); // v1 ItemId type until cutover
  return true;
}

export function tickLoot(w: SimWorld): void {
  for (const l of w.loot.values()) {
    if (w.t >= l.expiresAt) { w.loot.delete(l.id); continue; }
    for (const p of w.players.values()) {
      if (p.dead || p.downed || p.space !== l.space) continue;
      if (l.lockTo && l.lockTo !== p.id && w.t < (l.lockUntil ?? 0)) continue;
      const range = p.stats.stats.lootRange ?? 48;
      if (dist2(p, l) > range * range) continue;
      // Settings.autoLootGold off: Embershards wait for F (interact) instead of flying to the player
      if (l.gold && (p.save as { prefs?: { autoLootGold?: boolean } }).prefs?.autoLootGold === false && !(p.buttons & Btn.INTERACT)) continue;
      if (l.gold) { p.save.gold += l.gold; w.emit('loot:granted', { playerId: p.playerId, gold: l.gold }); w.loot.delete(l.id); break; }
      if (l.item && grantItem(w, p, l.item)) { w.loot.delete(l.id); break; }
    }
  }
}

// ───────────── named loot tables (BUILDS.md §5.1) ─────────────
const RUNE_WEIGHT: Record<string, number> = { fine: 3, ember: 2, runed: 1 };

/** Roll a named table for one player at a level; drops land at `at`, locked to that player. Unknown ids do nothing. */
export function rollTable(w: SimWorld, p: PlayerEnt, id: string, level: number, at: { space: string; x: number; y: number }): void {
  const t = lootTable(id);
  if (!t) return;
  const give = (e: LootEntry): void => {
    const it = entryItem(w, p, e, level);
    if (it) drop(w, at.space, at.x, at.y, it, undefined, p.id);
  };
  for (const e of t.always ?? []) give(e);
  for (let i = 0; i < t.rolls; i++) {
    let roll = w.rng.next() * t.entries.reduce((s, e) => s + e.weight, 0);
    const e = t.entries.find((x) => (roll -= x.weight) < 0) ?? t.entries[t.entries.length - 1];
    if (e) give(e);
  }
}

function entryItem(w: SimWorld, p: PlayerEnt, e: LootEntry, level: number): LootEnt['item'] | undefined {
  if ('nothing' in e) return undefined;
  if ('unique' in e) {
    // once per character: a repeat (or an Act-gated one too early) is a wrought piece for the kit instead
    const u = uniqueDef(e.unique), seen = p.save.legendariesSeen;
    if (u && !seen.includes(u.id) && level >= (u.minLevel ?? 1)) { seen.push(u.id); return uniqueInstance(u.id, level) ?? undefined; }
    return entryItem(w, p, { weight: 1, gear: { minRarity: 'wrought', forKit: true } }, level);
  }
  if ('item' in e) return { base: e.item, ilvl: level, qty: e.qty ? w.rng.int(e.qty[0], e.qty[1]) : 1 };
  if ('rune' in e) {
    const pool = HC_RUNES.filter((r) => e.rune === 'any' || e.rune.includes(r.id));
    let roll = w.rng.next() * pool.reduce((s, r) => s + (RUNE_WEIGHT[r.rarity] ?? 1), 0);
    const r = pool.find((x) => (roll -= RUNE_WEIGHT[x.rarity] ?? 1) < 0) ?? pool[0];
    return r && { base: r.id, ilvl: 1, qty: 1 };
  }
  if ('tome' in e) {
    // never the player's own school (those spells are on its tree already)
    const pool = HC_TOMES.filter((x) => x.school !== p.school && (e.tome === 'any' || x.school === e.tome));
    if (!pool.length) return entryItem(w, p, { weight: 1, gear: { minRarity: 'runed', forKit: true } }, level);
    return { base: w.rng.pick(pool).item, ilvl: 1, qty: 1 };
  }
  const forWho = e.gear.forKit ? { weapons: p.kit.weapons, school: p.school, classId: p.save.classId } : undefined;
  const g = rollGear(w, Math.max(level, p.save.level), undefined, 0.3, forWho, 'chest');
  const min = e.gear.minRarity;
  if (min && rollable(g.base) && RARITY_ORDER.indexOf(itemRarity(g)) < RARITY_ORDER.indexOf(min)) {
    const n = SOCKETS[min];
    Object.assign(g, { rarity: min, affixes: rollAffixes(w.rng, g.base, level, min, forWho), sockets: n ? Array.from({ length: n }, () => null) : undefined });
  }
  return { ...g, qty: 1 };
}

/** Give an item, or drop it at the hero's feet (held for them) with a notice when the pack is full: nothing is lost. */
export function grantOrDrop(w: SimWorld, p: PlayerEnt, it: Omit<ItemInstance, 'uid'>): void {
  if (grantItem(w, p, it)) return;
  drop(w, p.space, p.x, p.y, it, undefined, p.id);
  w.emit('systems:notice', { playerId: p.playerId, text: 'Your pack is full: it fell at your feet.', kind: 'error' });
}
