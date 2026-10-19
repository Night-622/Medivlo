/** Display names for handoff item ids (i_*, w_*, a_*, lg_*) from Claude 3's generated item data. Client-side. */
import { HC_PIECES } from '@/data/items/hc/armour.gen';
import { HC_CAMPAIGN_ITEMS } from '@/data/items/hc/campaign-items';
import { HC_ITEMS } from '@/data/items/hc/items.gen';
import { HC_LEGENDARIES } from '@/data/items/hc/legendary.gen';
import { HC_WEAPONS } from '@/data/items/hc/weapons.gen';

let names: Map<string, string> | null = null;

export function itemName(id: string): string {
  names ??= new Map([...HC_ITEMS, ...HC_WEAPONS, ...HC_PIECES, ...HC_LEGENDARIES, ...HC_CAMPAIGN_ITEMS].map((x) => [x.id, x.name]));
  return names.get(id) ?? id.replace(/^item:/, '');
}
