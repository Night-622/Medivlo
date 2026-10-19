/**
 * Regional rank-and-file (Claude 3): Morvane regions the handoff bestiary left with only a boss (Stormcliffs, Morvane
 * Marsh) or a single creature (Morvane Road), so the world had nothing to spawn there (Claude 2, 2026-10-20). Same shape
 * as the generated bestiary; `body` is existing bestiary art until bespoke sprites exist. Ability lines reuse the
 * creature ability language (abilities.ts), and summons point at creatures of the same region.
 */
import type { HcCreatureBase } from '@/systems/rules/types';

export interface HcRegionalCreature extends HcCreatureBase { body: string }

const C = (id: string, name: string, tier: 'enemy' | 'mini', arch: HcCreatureBase['arch'], body: string, region: string, element: string,
  hp: number, abilities: string[], drops: string[], lore: string): HcRegionalCreature =>
  ({ id, name, tier, arch, scale: tier === 'mini' ? 1.6 : 1, region, element, hp, abilities, drops, lore, body });

export const HC_REGIONAL: HcRegionalCreature[] = [
  // Stormcliffs (L22–26): the Stormcrow's cliff, wind and its flock
  C('bx_cliff_crow', 'Storm Crow', 'enemy', 'flyer', 'bx_storm_0', 'Stormcliffs', 'Storm', 60, ['Strikes with chain lightning.'], ['Embershards', 'Black Feather'],
    'One of the Stormcrow’s flock. Where one dives, the rest follow.'),
  C('bx_cliff_gale', 'Gale Wisp', 'enemy', 'spirit', 'bx_storm_1', 'Stormcliffs', 'Storm', 65, ['Gusts of wind push you toward the edge.'], ['Embershards'],
    'A knot of wind that learned to want something.'),
  C('bx_cliff_ram', 'Crag Ram', 'enemy', 'quad', 'bx_storm_3', 'Stormcliffs', 'Storm', 95, ['Charges in a straight line.'], ['Stormwrought pieces'],
    'Its horns ring like a struck bell when it charges.'),
  C('bx_cliff_matriarch', 'Crow Matriarch', 'mini', 'flyer', 'bx_storm_0', 'Stormcliffs', 'Storm', 900, ['Strikes with chain lightning.', 'Splits into a flock of storm crows.'],
    ['Stormwrought pieces'], 'The oldest of the flock. The Stormcrow listens to her, sometimes.'),
  // Morvane Marsh (L18–22): the Lantern Queen's lights and the bog under them
  C('bx_marsh_wisp', 'Will-o’-Wisp', 'enemy', 'spirit', 'bx_radiance_0', 'Morvane Marsh', 'Radiance', 55, ['Blinds with holy light.'], ['Embershards'],
    'A lantern with nobody holding it. Do not follow.'),
  C('bx_marsh_bogling', 'Bogling', 'enemy', 'plant', 'bx_verdant_2', 'Morvane Marsh', 'Verdant', 80, ['Roots you in place.'], ['Moonmint'],
    'A tussock of reeds that grabs ankles.'),
  C('bx_marsh_drowned', 'Marsh Drowned', 'enemy', 'humanoid', 'bx_drownedmonk', 'Morvane Marsh', 'Radiance', 85, ['Drains your life.'], ['Embershards'],
    'Followed a light into the water. Still following it.'),
  C('bx_marsh_lanternbearer', 'Lantern Bearer', 'mini', 'humanoid', 'bx_radiance_1', 'Morvane Marsh', 'Radiance', 900,
    ['Lights a ring of lanterns. Stay inside the light.', 'Shields its allies.'], ['Sunblessed Vestments'], 'Carries the Queen’s light from pool to pool.'),
  // Escorts: the neutral body story escorts use (combat.spawn({ creature: 'bx_escort', escort: { npc } }): sprite and name from the NPC)
  C('bx_escort', 'Traveller', 'enemy', 'humanoid', 'bx_drownedmonk', 'Escort', 'Beast', 80, [], [], 'Someone the hero promised to see home.'),
  // Morvane Road: more than one bandit
  C('bx_road_cutthroat', 'Road Cutthroat', 'enemy', 'humanoid', 'bx_guile_0', 'Morvane Road', 'Guile', 85, ['Vanishes and strikes from behind.'], ['Lockpicks', 'Embershards'],
    'Mags’s crew. The knife is the friendly part.'),
  C('bx_road_lookout', 'Bandit Lookout', 'enemy', 'humanoid', 'bx_bandit', 'Morvane Road', 'Guile', 70, ['Fires a volley of arrows.'], ['Embershards'],
    'Whistles twice for a merchant, once for a soldier.'),
];
