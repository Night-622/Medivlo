/**
 * Hollow Crown merchants (Claude 3). Claude 4's NpcDef.shop names the shop; dialogue sets flag shop.open = <npc id>.
 * Prices: item value × level scale × trustPrice(npc) × (1 − Haggler). Gear stock is rolled per player level.
 */
import type { ItemCat, WeaponType } from '@/systems/rules/types';

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
    id: 'shop:nan-briar', npc: 'npc:nan-briar', name: 'Nan Briar’s Cottage',
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

export const shopByNpc = (npc: string): HcShopDef | undefined =>
  HC_SHOPS.find((s) => s.npc === npc || s.npc === `npc:${npc}` || s.id === npc || s.id === `shop:${npc.replace(/^npc:/, '')}`);
