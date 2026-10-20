/**
 * Hollow Crown merchants (Claude 3). Claude 4's NpcDef.shop names the shop; dialogue sets flag shop.open = <npc id>.
 * Prices: item value × level scale × trustPrice(npc) × (1 − Haggler). Gear stock is rolled per player level.
 */
import type { ItemCat, SchoolId, WeaponType } from '@/systems/rules/types';

export interface HcShopDef {
  id: string;
  /** merchant npc id (matches shop.open) */
  npc: string;
  name: string;
  /** fixed stock (handoff ids); `when` = flag that must be truthy */
  stock: { item: string; when?: string }[];
  /** smith-style gear rolled at the buyer's level */
  gear?: { weapons?: WeaponType[] | 'kit'; armour?: 'school' | 'any'; count: number };
  /** item categories this merchant buys ('gear' = weapons/armour/trinkets) */
  buys: (ItemCat | 'gear')[] | 'all';
  /** smith with a runeforge: reforge item level, socket gems, salvage gear (rules/runeforge.ts) */
  runeforge?: boolean;
}

export const HC_SHOPS: HcShopDef[] = [
  {
    id: 'shop:nan-briar', npc: 'npc:nanbriar', name: 'Nan Briar’s Cottage',
    stock: ['i_hp_s', 'i_hp_l', 'i_em_s', 'i_em_l', 'i_st', 'i_anti', 'i_herb', 'i_glowcap', 'i_moon'].map((item) => ({ item })),
    buys: ['material', 'potion', 'food'],
  },
  {
    id: 'shop:odo', npc: 'npc:odo', name: 'The Anvil',
    stock: ['i_ore', 'i_ingot', 'i_picks', 'i_torch', 'i_bomb'].map((item) => ({ item })),
    gear: { weapons: 'kit', armour: 'school', count: 8 },
    buys: ['gear', 'material', 'tool'],
    runeforge: true,
  },
  {
    id: 'shop:wil', npc: 'npc:wil', name: 'The Gilded Goose',
    stock: ['i_stew', 'i_bread', 'i_cheese', 'i_apple', 'i_fish', 'i_roast', 'i_pie'].map((item) => ({ item })),
    buys: ['food'],
  },
  {
    id: 'shop:pell', npc: 'npc:pell', name: 'Pell’s Stall',
    stock: ['i_ruby', 'i_sapphire', 'i_emerald', 'i_topaz', 'i_copper', 'i_silver', 'i_signet', 'i_bonecharm', 'i_locket', 'i_map', 'i_rope', 'i_lantern',
      'i_scroll_ash', 'i_scroll_rime', 'i_scroll_storm', 'i_scroll_radiance', 'i_scroll_umbral', 'i_scroll_verdant'].map((item) => ({ item })),
    buys: 'all',
  },
  {
    id: 'shop:corwin', npc: 'npc:corwin', name: 'Corwin’s Mill',
    stock: [{ item: 'i_bread' }, { item: 'i_apple' }, { item: 'i_timber' }, { item: 'i_cake', when: 'cc.mill_built' }],
    buys: ['food', 'material'],
  },
];

/**
 * Realm merchants (QA new-player finding, Claude 1 approved): every capital has a smith (kit gear at the buyer's
 * level, buys all loot, Runeforge) and a general trader (potions, food, scrolls, buys all), and every frontier village
 * a pedlar (potions and food, buys all), so both classes of a school meet a merchant in their first minutes.
 * NPCs (always present): Claude 4, npc:<school>-smith / -trader / -pedlar; placement: Claude 2.
 */
const REALM_SHOPS: [SchoolId, string, string, string][] = [
  ['ash', 'The Kilnhold Runeforge', 'Cokesby’s Chandlery', 'Kettleby’s Kettle Pack'],
  ['rime', 'Hoarfell’s Cold Forge', 'Rimeholt’s Provisions', 'Frostby’s Pack'],
  ['storm', 'Coilwright’s Licensed Forge', 'Squall’s Stores', 'Thunderley’s Dry Goods'],
  ['radiance', 'The Close Lampworks', 'The Almonry', 'Tinch’s Saint-Cart'],
  ['umbral', 'Nightjar’s Quiet Forge', 'Penumbra’s Night Shop', 'Mirri’s Moor Pack'],
  ['verdant', 'The Thornforge', 'Hedgerow’s Herbs', 'Reedling’s Sprouting Pack'],
  ['blade', 'Tempra’s Blades', 'Gatti’s Remedies', 'Spada’s Fair Prices'],
  ['iron', 'Hammerling’s Ironmongery', 'The Anvilgate Stores', 'Brackwater’s Handcart'],
  ['fist', 'The Bell Foundry', 'The Pilgrims’ Store', 'Old Tenzin’s Pack'],
  ['hunt', 'Elkhorn’s Forge', 'Tumbrel’s Provisions', 'Packstraw’s Pelts & Provisions'],
  ['guile', 'Fob’s Pawn-Forge', 'Sixpence’s Stall', 'Whelk’s Barrow'],
  ['song', 'Strum’s Workshop', 'Semiquaver’s Music Shop', 'Tamsy’s Tambourine Stall'],
];
const POTIONS = ['i_hp_s', 'i_hp_l', 'i_em_s', 'i_em_l', 'i_st', 'i_anti'];
const FOOD = ['i_bread', 'i_cheese', 'i_apple', 'i_stew'];
const SCROLLS = ['ash', 'rime', 'storm', 'radiance', 'umbral', 'verdant'].map((s) => `i_scroll_${s}`);
const items = (ids: string[]) => ids.map((item) => ({ item }));

for (const [school, smith, trader, pedlar] of REALM_SHOPS) {
  HC_SHOPS.push(
    {
      id: `shop:${school}-smith`, npc: `npc:${school}-smith`, name: smith,
      stock: items(['i_ore', 'i_ingot', 'i_torch']),
      gear: { weapons: 'kit', armour: 'school', count: 8 },
      buys: 'all',
      runeforge: true,
    },
    { id: `shop:${school}-trader`, npc: `npc:${school}-trader`, name: trader, stock: items([...POTIONS, ...FOOD, ...SCROLLS, 'i_rope', 'i_lantern']), buys: 'all' },
    { id: `shop:${school}-pedlar`, npc: `npc:${school}-pedlar`, name: pedlar, stock: items(['i_hp_s', 'i_em_s', 'i_st', 'i_anti', 'i_bread', 'i_apple', 'i_torch']), buys: 'all' },
  );
}

export const shopByNpc = (npc: string): HcShopDef | undefined =>
  HC_SHOPS.find((s) => s.npc === npc || s.npc === `npc:${npc}` || s.id === npc || s.id === `shop:${npc.replace(/^npc:/, '')}`);
