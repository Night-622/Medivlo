/**
 * Builds text, school of ash (Claude 4; overlay on Claude 3 / Claude 5's mechanics, docs/systems/BUILDS.md phase 8).
 * Keyed by frozen ids: perks pk_* (perks-ash.ts) and the school's new kit spells (kit-spells-new.ts). Flavour only, no
 * numbers (they are still being tuned); `name` only where the working name is replaced. Owner: Claude 4.
 */
import type { BuildText, SpellText } from '../hc-builds-text';

export const PERKS: Record<string, BuildText> = {
  // Arcanist (Kilnhold, the Kiln Conclave)
  'pk_arcanist_kindled_bolt': { flavour: 'Thrane fires his bolts like teacups: thin walls, a good glaze, and something very hot inside.' },
  'pk_arcanist_combustion': { flavour: 'First lesson of the Kiln Conclave: a thing already burning is a thing already listening.' },
  'pk_arcanist_ember_well': { flavour: 'A clean strike gives back a little of what it took. Thrane calls it interest; the Conclave calls it theft.' },
  'pk_arcanist_burning_ambition': { flavour: 'Burning anything larger than a candle needs a permit. Burning yourself, oddly, does not.' },
  'pk_arcanist_quick_nova': { name: 'Bellows Work', flavour: 'Every Kilnhold apprentice works the bellows for a year. The quick ones learn to breathe out fire instead.' },
  'pk_arcanist_wildfire': { flavour: 'Glassblowers’ Row holds a fire-safety contest every spring. Nobody has ever been allowed to win it.' },
  'pk_arcanist_ember_hands': { flavour: 'Arcanists who skip the gloves soon stop needing them. They also stop being asked to shake hands.' },
  'pk_arcanist_cauterise': { flavour: 'Kiln Ward surgeons keep a hot iron by the door. Patients learn very quickly to say they feel better.' },
  'pk_arcanist_hearthfire': { name: 'Hearthfire', flavour: 'Before fire was for burning, it was for sitting round. Thrane insists you learn that one first.' },
  'pk_arcanist_searing_light': { flavour: 'A kind fire warms its friends and takes the eyebrows off everyone else.' },
  'pk_arcanist_phoenix': { name: 'Rekindled', flavour: 'The Great Kiln has never gone out, says the Conclave, and it relights itself very quickly when it does.' },
  'pk_arcanist_hearth_circle': { flavour: 'In Kilnhold a circle round the fire is a lecture, a family and a war council, often all before supper.' },
  // Reaver (the Bleeding Fields, the Red Muster)
  'pk_reaver_muster_flame': { flavour: 'The Red Muster keeps a flame lit from the Schools’ War. Every axe on the Fields was blessed in it, and a few dropped in it.' },
  'pk_reaver_red_fury': { flavour: 'Brenna’s rule: a Reaver is not hurt until she says so, and she has not said so yet.' },
  'pk_reaver_searing_edge': { flavour: 'Muster axes are quenched in the red veins of the Fields. The edge never quite forgets where it was born.' },
  'pk_reaver_berserk_blood': { flavour: 'Armour is for people planning to grow old, says Two-Coin Jory, and offers odds on whether you will.' },
  'pk_reaver_quick_blood': { flavour: 'Bloodburn comes easier the second time, and the third, which is why Brenna counts out loud.' },
  'pk_reaver_bloodthirst': { flavour: 'What the axe takes, the arm keeps. Muster cooks call it the only meal nobody complains about.' },
  'pk_reaver_unbowed': { flavour: 'On the Bone Ridge the old war-banners still stand, rotted through and upright. So do the Reavers.' },
  'pk_reaver_pain_to_power': { flavour: 'Every blow you take is a wager you have not lost yet. The Muster’s bookie keeps the ledger.' },
  'pk_reaver_pyre_landing': { flavour: 'A Reaver does not arrive. A Reaver lands, and the ground spends the evening apologising.' },
  'pk_reaver_kill_frenzy': { name: 'Muster Frenzy', flavour: 'Once the war-drums start, the Muster stops counting. Two-Coin Jory never stops counting.' },
  'pk_reaver_undying': { name: 'Scald-Hand’s Stand', flavour: 'Brenna put her arm into the lava to pull a child out. She says she would do it again, and then looks away.' },
  'pk_reaver_scorched_steel': { flavour: 'Muster steel comes out of the forge the colour of a sunset and smelling faintly of burned supper.' },
  // School of Ash
  'pk_ash_slow_burn': { flavour: 'Kilnhold fires its finest pots for days. Its finest grudges take a good deal longer.' },
  'pk_ash_flashfire': { flavour: 'Glassblowers call it the flash: the instant sand becomes something else. Blink and you lose your eyebrows.' },
  'pk_ash_hearthward': { flavour: 'Kiln Ward children grow up beside the flues, and can hold a hot coal before they can hold a spoon.' },
  'pk_ash_kiln_skin': { flavour: 'Stokers come up from the Kiln Roots too hot to hug. They consider this a fair trade.' },
  'pk_ash_firewalker': { flavour: 'Walking through fire still needs a permit. The permit office, being on fire, is in no position to object.' },
  'pk_ash_banked_coals': { flavour: 'Bank the coals at night and the fire is waiting in the morning. Old Stoker Bettany has not lit a fresh one in years.' },
  'pk_ash_cinder_heart': { flavour: 'Pudding eats embers and grows warmer for it. Thrane says that is the whole of Ash magic, minus the slime.' },
  'pk_ash_forge_focus': { name: 'Steady Draught', flavour: 'A kiln lives on its draught: too much and it roars, too little and it sulks. So does an Arcanist.' },
};

export const SPELLS: Record<string, SpellText> = {
  'spell:ember-comet': { flavour: 'Slow enough to watch coming, which in Kilnhold is considered good manners.' },
  'spell:cinder-wall': { flavour: 'A fire-break, in the Conclave’s paperwork. A wall of fire, in everyone else’s.' },
  'spell:hearths-embrace': { flavour: 'Fire is for gathering round. Thrane will tell you so, at length, while the enemy is still on fire.' },
  'spell:searing-rend': { flavour: 'The Muster pays for every cut in blood, its own first. Brenna says that is what keeps it honest.' },
  'spell:battle-roar': { name: 'Muster Call', flavour: 'The Muster’s call carries right across the Fields. Magma Hounds come running. That is rather the point.' },
  'spell:inferno': { name: 'Open the Vein', flavour: 'The Fields bleed red wherever the rock is broken. So, it turns out, do Reavers.' },
};
