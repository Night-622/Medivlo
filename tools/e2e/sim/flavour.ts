import { itemTooltip } from '@/systems/rules/describeHc';
import { HC_ITEM_FLAVOUR } from '@/data/lore/hc-item-flavour';
import { HC_WEAPONS } from '@/data/items/hc/weapons.gen';
import { HC_SETS } from '@/data/items/hc/armour.gen';
import { HC_LEGENDARIES } from '@/data/items/hc/legendary.gen';
const missing = [...HC_WEAPONS.map((w) => w.id), ...HC_SETS.map((s) => s.id), ...HC_LEGENDARIES.map((l) => l.id)].filter((k) => !HC_ITEM_FLAVOUR[k]);
console.log('flavour lines', Object.keys(HC_ITEM_FLAVOUR).length, 'missing', missing.length, missing.slice(0, 5));
for (const id of ['w_sword_iron', 'a_ash_cloth_chest', 'lg_stag', 'w_ferro_blade']) console.log(id, '→', itemTooltip({ uid: 'x', base: id, ilvl: 10, qty: 1 }, [], 'ash', ['sword']).slice(-2).map((l) => l.text).join(' | '));
