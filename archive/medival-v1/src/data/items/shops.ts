/**
 * Merchant stock (non-core `shop:` prefix → Registry.extra('shop', id)). NPCs point here with `shop: 'shop:<id>'`.
 * Owner: Claude 3.
 */
import type { ShopDef } from '@/systems/items/Shop';

const shops: ShopDef[] = [
  {
    id: 'shop:coalbrook-smithy', name: 'Coalbrook Smithy', greeting: 'Iron, steel, and honest edges.',
    stock: [
      { item: 'item:iron-arming-sword' }, { item: 'item:steel-arming-sword', minLevel: 3 }, { item: 'item:bearded-axe' }, { item: 'item:iron-mace' },
      { item: 'item:haldish-spear' }, { item: 'item:oak-kite-shield' }, { item: 'item:iron-buckler' }, { item: 'item:padded-gambeson' },
      { item: 'item:chain-hauberk', minLevel: 3 }, { item: 'item:iron-helm' }, { item: 'item:leather-gloves' }, { item: 'item:iron-scrap' },
    ],
    randomGear: 2, buys: ['weapon', 'offhand', 'armor', 'material'],
  },
  {
    id: 'shop:guttered-candle', name: 'The Guttered Candle', greeting: 'Stew’s hot. Ale’s cold. Coin first.',
    stock: [{ item: 'item:hearty-stew' }, { item: 'item:stamina-draught' }, { item: 'item:healing-poultice' }, { item: 'item:ember-tonic' }],
  },
  {
    id: 'shop:pell-tinker', name: 'Pell’s Pack', greeting: 'A little of everything, and a story for each!',
    stock: [
      { item: 'item:hunting-arrows' }, { item: 'item:broadhead-arrows', minLevel: 3 }, { item: 'item:wool-cloak' }, { item: 'item:leather-hood' },
      { item: 'item:copper-ring' }, { item: 'item:hempen-belt' }, { item: 'item:ley-glass-amulet', minLevel: 3 }, { item: 'item:fire-oil' },
    ],
    randomGear: 3,
  },
  {
    id: 'shop:briar-hut', name: 'Nan Briar’s Shelves', greeting: 'Mind the jars. Some of them bite.',
    stock: [
      { item: 'item:healing-poultice' }, { item: 'item:ember-tonic' }, { item: 'item:fire-oil' }, { item: 'item:ley-wand' },
      { item: 'item:apprentice-grimoire' }, { item: 'item:tome-ember-burst', minLevel: 4 }, { item: 'item:glyph-haste' }, { item: 'item:glyph-lingering' },
    ],
    buys: ['consumable', 'material', 'tome'],
  },
  {
    id: 'shop:grimma-forge', name: 'Grimma’s Forge', greeting: 'Orrun work. It will outlive you.',
    stock: [
      { item: 'item:iron-greatsword' }, { item: 'item:bearded-greataxe' }, { item: 'item:chain-hauberk' }, { item: 'item:iron-helm' },
      { item: 'item:iron-scrap' }, { item: 'item:ley-dust' },
    ],
    randomGear: 3, buys: ['weapon', 'offhand', 'armor', 'material'],
  },
  {
    id: 'shop:barrow-keeper', name: 'Cuthred’s Barrow-Goods', greeting: 'The dead do not need these. Neither, perhaps, do you.',
    stock: [{ item: 'item:barrow-blade' }, { item: 'item:healing-poultice' }, { item: 'item:essence-rime' }],
    randomGear: 2,
  },
  {
    id: 'shop:salt-exchange', name: 'Brackhaven Salt Exchange', greeting: 'Everything has a price. Most things have two.',
    stock: [{ item: 'item:broadhead-arrows' }, { item: 'item:fire-oil' }, { item: 'item:stamina-draught' }, { item: 'item:glyph-piercing' }, { item: 'item:glyph-homing' }],
    randomGear: 4,
  },
  {
    id: 'shop:kestrel-isles', name: 'Kestrel’s Hold', greeting: 'Corsair goods. No questions, no receipts.',
    stock: [{ item: 'item:cinderglass-dagger' }, { item: 'item:healing-poultice' }, { item: 'item:glyph-detonation' }],
    randomGear: 4,
  },
  {
    id: 'shop:zahrun-bazaar', name: 'Samir’s Glass Bazaar', greeting: 'Cinderglass, ley-glass, and the sand that made them.',
    stock: [{ item: 'item:cinderglass-dagger' }, { item: 'item:ley-wand' }, { item: 'item:ley-glass-amulet' }, { item: 'item:essence-ash' }, { item: 'item:glyph-cinders' }, { item: 'item:glyph-storms' }],
    randomGear: 3,
  },
  {
    id: 'shop:fenwick-eel-market', name: 'Fenwick Eel-Market', greeting: 'Eels, salt, and charms against the drowned.',
    stock: [{ item: 'item:hearty-stew' }, { item: 'item:healing-poultice' }, { item: 'item:wool-cloak' }, { item: 'item:glyph-frost' }],
    buys: ['consumable', 'material', 'armor'],
  },
  {
    id: 'shop:ulka-smithy', name: 'Ulka Ironsong’s Forge', greeting: 'Concord steel. Weighed, stamped, and fair.',
    stock: [{ item: 'item:iron-greatsword' }, { item: 'item:chain-hauberk' }, { item: 'item:iron-helm' }, { item: 'item:hrothi-round-shield' }, { item: 'item:ley-dust' }],
    randomGear: 3, buys: ['weapon', 'offhand', 'armor', 'material'],
  },
];

export default shops;
