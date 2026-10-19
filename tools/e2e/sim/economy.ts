/** Headless economy test (Claude 3): quest rewards, take-item, shop buy/sell. Run: node tools/e2e/sim/run.mjs economy */
import { newCharacter } from '@/systems/rules/character';
import { Sim } from '@/systems/sim/Sim';
import type { SimPorts } from '@/systems/sim/world';

const log: string[] = [];
const ports: SimPorts = {
  move: (_s, x, y, dx, dy) => ({ x: x + dx, y: y + dy }), clear: () => true, zoneRule: () => 'safe',
  respawnPoint: () => ({ space: 't', x: 0, y: 0 }), emit: (n, p) => { if (n === 'loot:granted' || n === 'item:used') log.push(`${n} ${JSON.stringify(p)}`); },
  partySize: () => 1, realmRule: () => 'peaceful',
};
const sim = new Sim(ports, 3);
sim.shopEnv = { flag: (k) => k === 'cc.mill_built', priceMult: (npc) => (npc === 'npc:odo' ? 0.8 : 1) };
const save = newCharacter('warden');
sim.addPlayer('me', save, { space: 't', x: 0, y: 0 });
let fails = 0;
const check = (ok: boolean, what: string) => { console.log(ok ? 'ok  ' : 'FAIL', what); if (!ok) fails++; };

sim.questReward({ xpTier: 2, gold: 120, hcItems: [{ item: 'a_verdant_leather_helm' }, { item: 'i_ingot', qty: 3 }, { item: 'i_tear' }], skillPoints: 1 });
check(save.gold === 140, `gold 20 + 120 = ${save.gold}`);
check(save.level === 2 || save.xp > 0, `xp tier 2 granted (level ${save.level}, xp ${save.xp})`);
check(save.inventory.some((i) => i.base === 'a_verdant_leather_helm' && i.ilvl === save.level - (save.level > 1 ? save.level - 1 : 0) || i.base === 'a_verdant_leather_helm'), 'helm granted');
check(save.inventory.find((i) => i.base === 'i_ingot')?.qty === 3, 'ingots ×3');
check(save.bonusPoints === 1, 'skill point');
sim.questTake('i_tear', 1);
check(!save.inventory.some((i) => i.base === 'i_tear'), 'tear taken back');
const recv = (action: string, args: Record<string, string>) => sim.receive({ type: 'act', domain: 'systems', action, args }, 'me');
const before = save.gold;
recv('buy', { shop: 'npc:wil', item: 'i_stew' });
check(save.inventory.some((i) => i.base === 'i_stew') && save.gold === before - 5, `bought stew for 5 (gold ${before} → ${save.gold})`);
recv('buy', { shop: 'npc:corwin', item: 'i_cake' });
check(save.inventory.some((i) => i.base === 'i_cake'), 'honey cake unlocked by cc.mill_built');
const g2 = save.gold;
recv('buy', { shop: 'npc:wil', item: 'w_sword_iron' });
check(save.gold === g2, 'cannot buy what the inn does not sell');
const ingot = save.inventory.find((i) => i.base === 'i_ingot')!;
recv('sell', { shop: 'npc:wil', uid: ingot.uid });
check(save.inventory.includes(ingot), 'inn refuses to buy ingots');
recv('sell', { shop: 'npc:odo', uid: ingot.uid });
check(!save.inventory.includes(ingot), `Odo buys ingots (gold now ${save.gold})`);
save.gold = 10_000;
recv('buy', { shop: 'npc:odo', item: sim.w.players.get('p:me')!.save.inventory[0].base });
const odo = (await import('@/systems/sim/shop')).shopStock((await import('@/data/items/hc/shops')).shopByNpc('npc:odo')!, { classId: 'warden', level: save.level, school: 'rime', weapons: ['sword', 'mace', 'spear'] }, () => false, 0.8);
check(odo.filter((l) => l.item.startsWith('w_') || l.item.startsWith('a_')).length >= 6, `Odo rolls gear: ${odo.map((l) => `${l.item}@${l.price}`).join(', ')}`);
console.log(fails ? `FAIL ${fails}` : 'OK');

// ── bespoke story items and pets
{
  const { HC_CAMPAIGN_ITEMS } = await import('@/data/items/hc/campaign-items');
  const { itemInfo, slotsFor, weaponDamage } = await import('@/systems/rules/gear');
  const { compileStats } = await import('@/systems/rules/playerStats');
  const bad = HC_CAMPAIGN_ITEMS.filter((c) => { const i = itemInfo(c.id); return !i || !itemInfo(c.base) || (c.kind !== 'relic' && !slotsFor(i).length) || (c.kind === 'relic' && !i.questItem); });
  check(!bad.length, `all ${HC_CAMPAIGN_ITEMS.length} story items resolve with a slot (or as relics) ${bad.map((b) => b.id).join(',')}`);
  check(weaponDamage('w_ferro_blade', 10)[0] === weaponDamage('w_sword_steel', 10)[0], 'story weapons hit like their base');
  const c = newCharacter('arcanist');
  const plain = compileStats(c).stats['dmg.ash'] ?? 0;
  c.equipment.amulet = { uid: 'tl', base: 'i_thrane_lantern', ilvl: 8, qty: 1 };
  check((compileStats(c).stats['dmg.ash'] ?? 0) > plain, 'Thrane’s lantern passive applies when worn');
  const s2 = new Sim(ports, 9);
  s2.shopEnv = { flag: (k) => k === 'arcanist.pudding_pet', priceMult: () => 1 };
  s2.addPlayer('a', newCharacter('arcanist'), { space: 't', x: 0, y: 0 });
  for (let i = 1; i <= 31; i++) s2.step(1000 / 30, i, new Map());
  const pet = [...s2.w.enemies.values()].find((e) => e.storyPet === 'arcanist.pudding_pet');
  check(!!pet && pet.def === 'bx_emberslime', 'Pudding follows the Arcanist once arcanist.pudding_pet is set');
  if (pet) { const hp = pet.hp; s2.damage(pet.id, 999, 'ash', 'p:a'); check(pet.hp === hp && !pet.dead, 'story pets cannot be hurt'); }
  console.log(fails ? `FAIL ${fails}` : 'OK (story items)');
}

// ── world chests: once per character, rolled at the chest's level, held for the opener
{
  const { sanitizeLoadout } = await import('@/systems/rules/validate');
  const s3 = new Sim(ports, 11);
  const a = newCharacter('ranger'); a.level = 20;
  s3.addPlayer('a', a, { space: 't', x: 0, y: 0 });
  s3.addPlayer('b', newCharacter('knight'), { space: 't', x: 0, y: 0 });
  check(s3.openChest('a', 'obj:test-chest-0', { level: 22, rarity: 'rare' }), 'chest opens');
  const drops = [...s3.w.loot.values()];
  check(drops.some((l) => l.gold) && drops.some((l) => l.item && /^[wa]_/.test(l.item.base) && l.item.ilvl === 22) && drops.every((l) => l.lockTo === 'p:a'), `rare chest drops gold + L22 gear for its opener (${drops.map((l) => l.item?.base ?? `${l.gold}g`).join(', ')})`);
  check(!s3.openChest('a', 'obj:test-chest-0', { level: 22, rarity: 'rare' }), 'same character cannot open it twice');
  check(s3.openChest('b', 'obj:test-chest-0', { level: 22, rarity: 'rare' }), 'a party member opens their own roll');
  const back = sanitizeLoadout(JSON.parse(JSON.stringify(a)));
  check(((back as { chests?: string[] }).chests ?? []).includes('obj:test-chest-0'), 'opened chests survive the save round-trip');
  s3.receive({ type: 'loadout', data: { ...JSON.parse(JSON.stringify(s3.w.players.get('p:b')!.save)), chests: [] } }, 'b');
  check(!s3.openChest('b', 'obj:test-chest-0', {}), 'a guest loadout cannot forget a chest');
  console.log(fails ? `FAIL ${fails}` : 'OK (chests)');
}

// ── runeforge (PACING D): reforge item level, socket gems, salvage
{
  const { reforgeCost, salvageYield, socketCost } = await import('@/systems/rules/runeforge');
  const s4 = new Sim(ports, 13);
  const c = newCharacter('knight'); c.level = 20; c.gold = 5000;
  c.inventory.push({ uid: 'old', base: 'w_sword_iron', ilvl: 6, qty: 1 }, { uid: 'ing', base: 'i_ingot', ilvl: 1, qty: 10 }, { uid: 'rb', base: 'i_ruby', ilvl: 1, qty: 1 },
    { uid: 'junk', base: 'a_iron_plate_helm', ilvl: 12, qty: 1 });
  const runed = (await import('@/data/items/hc/weapons.gen')).HC_WEAPONS.find((x) => ['runed', 'wrought', 'spark'].includes(x.rarity))!;
  c.equipment.main = { uid: 'main', base: runed.id, ilvl: 18, qty: 1 };
  s4.addPlayer('k', c, { space: 't', x: 0, y: 0 });
  const p = s4.w.players.get('p:k')!;
  const act = (action: string, args: Record<string, string>) => s4.receive({ type: 'act', domain: 'systems', action, args }, 'k');
  const cost = reforgeCost(c.inventory.find((x) => x.uid === 'old')!, 20)!;
  const g0 = c.gold;
  act('reforge', { shop: 'npc:odo', uid: 'old' });
  check(c.inventory.find((x) => x.uid === 'old')?.ilvl === 20 && c.gold === g0 - cost.gold && c.inventory.find((x) => x.base === 'i_ingot')?.qty === 10 - cost.ingots, `reforge L6 → L20 for ${cost.gold} gold + ${cost.ingots} ingots`);
  act('reforge', { shop: 'npc:wil', uid: 'old' });
  check(c.gold === g0 - cost.gold, 'no runeforge at the inn');
  const hp0 = p.maxHp, sc = socketCost(c.equipment.main!, 'i_ruby')!;
  act('socket', { shop: 'npc:odo', uid: 'main', gem: 'i_ruby' });
  check(c.equipment.main!.gem === 'i_ruby' && !c.inventory.some((x) => x.base === 'i_ruby') && p.maxHp > hp0, `ruby set in the worn ${runed.id} for ${sc} (hp ${hp0} → ${p.maxHp})`);
  act('socket', { shop: 'npc:odo', uid: 'main', gem: 'i_ruby' });
  check(c.equipment.main!.gem === 'i_ruby', 'no second ruby to set');
  const y = salvageYield(c.inventory.find((x) => x.uid === 'junk')!)!;
  const ing = c.inventory.find((x) => x.base === 'i_ingot')?.qty ?? 0;
  act('salvage', { shop: 'npc:odo', uid: 'junk' });
  check(!c.inventory.some((x) => x.uid === 'junk') && (c.inventory.find((x) => x.base === 'i_ingot')?.qty ?? 0) === ing + y.ingots, `salvage helm → ${y.ingots} ingots`);
  act('salvage', { shop: 'npc:odo', uid: 'main' });
  check(!!c.equipment.main, 'worn gear is not salvaged');
  // a guest loadout cannot mint gems or item levels any more
  s4.addPlayer('g', newCharacter('ranger'), { space: 't', x: 0, y: 0 });
  const gs = s4.w.players.get('p:g')!.save;
  const bow = gs.equipment.main!;
  s4.receive({ type: 'loadout', data: { ...JSON.parse(JSON.stringify(gs)), equipment: { ...gs.equipment, main: { ...bow, gem: 'i_embershard', ilvl: 40 } } } }, 'g');
  check(!s4.w.players.get('p:g')!.save.equipment.main?.gem && s4.w.players.get('p:g')!.save.equipment.main?.ilvl === bow.ilvl, 'loadouts cannot add gems or item levels');
  console.log(fails ? `FAIL ${fails}` : 'OK (runeforge)');
}
