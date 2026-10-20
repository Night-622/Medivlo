/**
 * Features gate, part 4: progression and the economy. Level-ups from XP (quest-free grantXp and kills), shop buy /
 * sell edge cases, the Runeforge's refusals and side effects, scroll spells and the Old Abbey Tome.
 */
import { HC_ITEMS } from '@/data/items/hc/items.gen';
import { shopByNpc } from '@/data/items/hc/shops';
import { HC_WEAPONS } from '@/data/items/hc/weapons.gen';
import { HC_SCROLL_SPELLS, SCROLL_SPELL } from '@/data/spells/hc/school-spells';
import { availablePoints, newCharacter } from '@/systems/rules/character';
import { LEVEL_CAP, xpForKill, xpToNext } from '@/systems/rules/curves';
import { gemsOf, itemInfo, rarityIndex } from '@/systems/rules/gear';
import { reforgeCost } from '@/systems/rules/runeforge';
import { scrollSpell } from '@/systems/rules/spells';
import type { CharacterSave } from '@/systems/rules/types';
import { grantXp } from '@/systems/sim/death';
import { playerShopView, sellPrice, shopStock } from '@/systems/sim/shop';
import type { PlayerEnt } from '@/systems/sim/state';
import { learnViaLoadout } from './features-casts';
import { check, dummy, EffectWatch, expectedEffects, describe, hero, world, type World } from './features-harness';

const act = (w: World, action: string, args: Record<string, string | number>, pid = 'a') => w.sim.receive({ type: 'act', domain: 'systems', action, args }, pid);
const qty = (p: PlayerEnt, base: string) => p.save.inventory.filter((x) => x.base === base).reduce((a, x) => a + x.qty, 0);
const notices = (w: World, n0: number) => w.since(n0, 'systems:notice').map((e) => String(e.p.text));

function levelUp(): void {
  const w = world();
  const p = hero(w, 'a', newCharacter('warden'));
  const hp1 = p.maxHp, sp1 = p.base.stats.sp ?? 0, em1 = p.emberMax;
  p.hp = 10; p.ember = 0;
  grantXp(w.sim.w, p, xpToNext(1) - 1);
  check(p.save.level === 1 && p.save.xp === xpToNext(1) - 1 && !w.events.some((e) => e.name === 'player:levelup'), `one XP short of ${xpToNext(1)}: still level 1`);
  grantXp(w.sim.w, p, 1);
  const up = w.events.filter((e) => e.name === 'player:levelup');
  check(p.save.level === 2 && p.save.xp === 0 && up.length === 1 && up[0].p.level === 2 && up[0].p.playerId === 'a', 'crossing xpToNext → level 2, XP carries 0, player:levelup { playerId, level }');
  check(availablePoints(p.save) === 1 && p.maxHp > hp1 && (p.base.stats.sp ?? 0) > sp1 && p.emberMax > em1 && p.hp === p.maxHp && p.ember === p.emberMax,
    `level 2: a skill point, HP ${hp1} → ${p.maxHp}, spell power ${sp1.toFixed(1)} → ${(p.base.stats.sp ?? 0).toFixed(1)}, Ember ${em1} → ${p.emberMax}, refilled`);
  grantXp(w.sim.w, p, xpToNext(2) + xpToNext(3) + 5);
  check(p.save.level === 4 && p.save.xp === 5 && w.events.filter((e) => e.name === 'player:levelup').length === 3 && availablePoints(p.save) === 3, 'one big grant crosses two levels (4, 5 XP over, 3 points)');
  p.save.level = LEVEL_CAP; p.save.xp = 0;
  grantXp(w.sim.w, p, 1e9);
  check(p.save.level === LEVEL_CAP && p.save.xp === 0, `level ${LEVEL_CAP} is the cap: XP stops`);
  // kills: xpForKill at the hero's level, +3% from the Upgrades branch
  for (const tree of [false, true]) {
    const k = world();
    const q = hero(k, 'a', { ...newCharacter('ranger'), level: 4 });
    if (tree) learnViaLoadout(k, 'a', ['up_p2a', 'up_p2m1', 'up_p2m2']);
    const id = k.sim.spawn({ creature: 'bx_wolf', level: 4, space: 't', x: 50, y: 0, dormant: true });
    const n0 = k.events.length;
    k.sim.damage(id, 1e12, 'physical', q.id);
    const got = k.since(n0, 'loot:granted').map((e) => Number(e.p.xp ?? 0)).reduce((a, b) => a + b, 0);
    const want = Math.max(1, Math.round(xpForKill(4, 4, 'enemy') * (tree ? 1.03 : 1)));
    check(got === want, `killing a level-4 wolf grants ${want} XP${tree ? ' (+3% XP node)' : ''}`, `got ${got}`);
  }
}

function shops(): void {
  const w = world();
  const p = hero(w, 'a', { ...newCharacter('warden'), level: 10, gold: 1000 });
  const nan = shopByNpc('npc:nan-briar')!, odo = shopByNpc('npc:odo')!;
  const price = (shop = nan, item = 'i_hp_l', mult = 1) => shopStock(shop, playerShopView(p), () => undefined, mult).find((l) => l.item === item)!.price;
  const full = price();
  let g = p.save.gold, n0 = w.events.length;
  act(w, 'buy', { shop: 'npc:nan-briar', item: 'i_hp_l' });
  check(p.save.gold === g - full && qty(p, 'i_hp_l') === 1 && !notices(w, n0).length, `buy a large health potion for its listed ${full}`);
  p.save.gold = full - 1; n0 = w.events.length;
  act(w, 'buy', { shop: 'npc:nan-briar', item: 'i_hp_l' });
  check(p.save.gold === full - 1 && qty(p, 'i_hp_l') === 1 && notices(w, n0).includes('Not enough Embershards.'), 'one Embershard short: refused with a notice, nothing changes');
  p.save.gold = 1000;
  learnViaLoadout(w, 'a', ['up_p2a', 'up_p2m1', 'up_p2m2', 'up_p2b', 'up_p2c2']);
  const cheap = price(nan, 'i_hp_l', 0.8);
  g = p.save.gold;
  act(w, 'buy', { shop: 'npc:nan-briar', item: 'i_hp_l' });
  check(p.save.tree.up_p2c2 === 1 && cheap < full && p.save.gold === g - cheap, `Haggler (Upgrades): the same potion costs ${cheap} instead of ${full}`, `gold ${g} → ${p.save.gold}`);
  // smith gear: rolled at the buyer's level
  const line = shopStock(odo, playerShopView(p), () => undefined, 0.8).find((l) => /^[wa]_/.test(l.item))!;
  g = p.save.gold;
  const before = new Set(p.save.inventory.map((x) => x.uid));
  act(w, 'buy', { shop: 'npc:odo', item: line.item });
  const bought = p.save.inventory.find((x) => !before.has(x.uid));
  check(bought?.base === line.item && bought.ilvl === 10 && p.save.gold === g - line.price, `Odo's ${line.item}: item level 10 (the buyer's), ${line.price} paid`);
  // selling: stacks pay per unit, gear by item level, relics are refused everywhere
  w.sim.questReward({ playerId: 'a', hcItems: [{ item: 'i_ingot', qty: 3 }] });
  const ing = p.save.inventory.find((x) => x.base === 'i_ingot')!;
  g = p.save.gold;
  act(w, 'sell', { shop: 'npc:odo', uid: ing.uid });
  check(p.save.gold === g + sellPrice({ base: 'i_ingot', ilvl: 1 }) * 3 && !qty(p, 'i_ingot'), `sell 3 ingots: ${sellPrice({ base: 'i_ingot', ilvl: 1 })} each`);
  g = p.save.gold;
  act(w, 'sell', { shop: 'npc:odo', uid: bought!.uid });
  check(p.save.gold === g + sellPrice({ base: line.item, ilvl: 10 }) && sellPrice({ base: line.item, ilvl: 20 }) > sellPrice({ base: line.item, ilvl: 1 }), `sell the L10 piece back for ${sellPrice({ base: line.item, ilvl: 10 })} (gear sells by item level)`);
  const relic = HC_ITEMS.find((i) => i.cat === 'relic')!;
  w.sim.questReward({ playerId: 'a', hcItems: [{ item: relic.id }] });
  const r = p.save.inventory.find((x) => x.base === relic.id)!;
  g = p.save.gold; n0 = w.events.length;
  act(w, 'sell', { shop: 'npc:pell', uid: r.uid });
  check(p.save.inventory.includes(r) && p.save.gold === g && notices(w, n0).length === 1, `Pell (buys "all") still refuses the relic ${relic.name}`);
  // a full pack
  const bag = Math.round(p.stats.stats.bag ?? 66);
  for (let i = 0; p.save.inventory.length < bag; i++) p.save.inventory.push({ uid: `fill-${i}`, base: 'w_sword_iron', ilvl: 1, qty: 1 });
  g = p.save.gold; n0 = w.events.length;
  act(w, 'buy', { shop: 'npc:pell', item: 'i_copper' });
  check(p.save.gold === g && !qty(p, 'i_copper') && notices(w, n0).includes('Your pack is full.'), `pack full (${bag} slots): a ring is refused and not charged`);
}

function runeforge(): void {
  const w = world();
  const runed = HC_WEAPONS.find((x) => x.type === 'sword' && rarityIndex(x.rarity) >= 3)!;
  const s: CharacterSave = { ...newCharacter('knight'), level: 20, gold: 5000 };
  s.inventory.push({ uid: 'old', base: 'w_sword_iron', ilvl: 6, qty: 1 }, { uid: 'sap', base: 'i_sapphire', ilvl: 1, qty: 1 }, { uid: 'rb', base: 'i_ruby', ilvl: 1, qty: 1 },
    { uid: 'gemmed', base: runed.id, ilvl: 12, qty: 1, gem: 'i_topaz' }, { uid: 'lg', base: 'lg_stag', ilvl: 20, qty: 1 });
  s.equipment.main = { uid: 'main', base: runed.id, ilvl: 20, qty: 1, gem: 'i_ruby' };
  s.equipment.head = { uid: 'helm', base: 'a_iron_plate_helm', ilvl: 5, qty: 1 };
  const p = hero(w, 'a', s);
  const smith = (action: string, uid: string, gem?: string, socket?: number) => { const n0 = w.events.length; act(w, action, { shop: 'npc:odo', uid, ...(gem ? { gem } : {}), ...(socket !== undefined ? { socket } : {}) }); return notices(w, n0); };
  let g = p.save.gold;
  const old = p.save.inventory.find((x) => x.uid === 'old')!;
  const need = reforgeCost(old, 20)!;
  check(smith('reforge', 'old').some((t) => /Iron Ingots/.test(t)) && old.ilvl === 6 && p.save.gold === g, `reforge without ${need.ingots} ingots: refused, nothing paid`);
  w.sim.questReward({ playerId: 'a', hcItems: [{ item: 'i_ingot', qty: 20 }] });
  smith('reforge', 'old');
  check(old.ilvl === 20 && smith('reforge', 'old').some((t) => /already/.test(t)), 'a piece at your level cannot be reforged again');
  const armor0 = p.stats.stats.armor ?? 0;
  g = p.save.gold;
  smith('reforge', 'helm');
  check(p.save.equipment.head!.ilvl === 20 && (p.stats.stats.armor ?? 0) > armor0 && p.save.gold < g, `reforging the worn helm (L5 → L20) raises armour at once (${armor0.toFixed(0)} → ${(p.stats.stats.armor ?? 0).toFixed(0)})`);
  check(rarityIndex(itemInfo('w_sword_iron')!.rarity) < 3 && smith('socket', 'old', 'i_ruby').length === 1 && qty(p, 'i_ruby') === 1 && !gemsOf(old).length, 'an iron sword has no socket: the ruby stays in the pack');
  const em0 = p.emberMax;
  smith('socket', 'main', 'i_sapphire', 0);
  check(gemsOf(p.save.equipment.main!)[0] === 'i_sapphire' && !gemsOf(p.save.equipment.main!).includes('i_ruby') && !qty(p, 'i_sapphire') && qty(p, 'i_ruby') === 1 && p.emberMax > em0, `a sapphire replaces the worn ruby (the ruby is lost), Ember ${em0} → ${p.emberMax}`);
  const topaz = qty(p, 'i_topaz'), ing0 = qty(p, 'i_ingot');
  smith('salvage', 'gemmed');
  check(!p.save.inventory.some((x) => x.uid === 'gemmed') && qty(p, 'i_topaz') === topaz + 1 && qty(p, 'i_ingot') > ing0, 'salvaging a socketed piece gives its topaz back with the ingots');
  check(smith('salvage', 'lg').length === 1 && p.save.inventory.some((x) => x.uid === 'lg'), 'the smith will not break a legendary');
  p.save.gold = 0;
  check(smith('socket', 'main', 'i_ruby', 0).includes('Not enough Embershards.') && qty(p, 'i_ruby') === 1 && gemsOf(p.save.equipment.main!)[0] === 'i_sapphire', 'no gold: socketing refused, ruby kept');
}

function scrolls(): void {
  for (const [item, spellId] of Object.entries(SCROLL_SPELL)) {
    const sp = scrollSpell(item);
    if (!check(!!sp && sp.id === spellId, `${item} → ${spellId} resolves`)) continue;
    const w = world();
    const p = hero(w, 'a', { ...newCharacter('warden'), level: 5 });
    const ds = [dummy(w, 40, 0, 5), dummy(w, 110, 0, 5)];
    w.sim.questReward({ playerId: 'a', hcItems: [{ item, qty: 2 }] });
    w.tick({ a: { aim: { x: 40, y: 0 } } });
    const exp = expectedEffects(sp!);
    const watch = new EffectWatch(w, p, ds);
    const em0 = p.ember, uid = p.save.inventory.find((x) => x.base === item)!.uid;
    const casts = () => w.events.filter((e) => e.name === 'ability:cast' && e.p.ability === sp!.id).length;
    act(w, 'useItem', { uid });
    const first = casts();
    act(w, 'useItem', { uid });
    for (let t = 0; t < 3000; t += 1000 / 30) { w.tick({ a: { aim: { x: 40, y: 0 } } }); watch.sample(); }
    const miss = watch.missing(exp);
    const free = p.ember >= Math.min(p.emberMax, em0) - 0.001 && !p.cds.has(sp!.id);
    check(first === 1 && casts() === 2 && !qty(p, item) && free && !miss.length, `scroll ${item}: ${sp!.name} cast twice back to back, free (no Ember, no cooldown), scrolls used up; ${describe(exp)}`,
      `casts ${first}/${casts()}, left ${qty(p, item)}, free ${free}, missing ${miss.join(', ')}`);
  }
  check(HC_SCROLL_SPELLS.every((s) => Object.values(SCROLL_SPELL).includes(s.id)), 'every scroll-only spell has a scroll item');
  const w = world();
  const p = hero(w, 'a', newCharacter('bard'));
  w.sim.questReward({ playerId: 'a', hcItems: [{ item: 'i_tome' }] });
  const pts = availablePoints(p.save);
  act(w, 'useItem', { uid: p.save.inventory.find((x) => x.base === 'i_tome')!.uid });
  check(availablePoints(p.save) === pts + 1 && !qty(p, 'i_tome'), 'the Old Abbey Tome: +1 skill point, used up');
}

export function progressChecks(): void {
  levelUp();
  shops();
  runeforge();
  scrolls();
}
