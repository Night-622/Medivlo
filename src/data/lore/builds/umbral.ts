/**
 * Builds text, school of umbral (Claude 4; overlay on Claude 3 / Claude 5's mechanics, docs/systems/BUILDS.md phase 8).
 * Keyed by frozen ids: perks pk_* (perks-umbral.ts) and the school's new kit spells (kit-spells-new.ts). Flavour only, no
 * numbers (they are still being tuned); `name` only where the working name is replaced. Owner: Claude 4.
 */
import type { BuildText, SpellText } from '../hc-builds-text';

export const PERKS: Record<string, BuildText> = {
  // ---------- Shade (the Veilwarrens)
  pk_shade_deep_step: { flavour: 'Grey Mab’s first lesson: the dark is a door. Her second: knock first, in case somebody is using it.' },
  pk_shade_backstab: { flavour: 'The Veil does not call it a backstab. It calls it a conversation the other fellow was not ready for.' },
  pk_shade_ambush: { flavour: 'In the warrens you never hear a Shade arrive. You hear them leave, and then you check your pockets.' },
  pk_shade_shadow_dance: { flavour: 'Rope bridges, wet stone and no light at all. Veilwarrens children learn to dance before they learn to fall.' },
  pk_shade_glass_edges: { flavour: 'Nightglass from the Moonwell market. The seller swears it was cut in moonshade, and charges as if it was.' },
  pk_shade_serrated_glass: { flavour: 'Nightglass chips when it meets bone. The Veil considers this a feature, and the bone is not consulted.' },
  pk_shade_night_blades: { flavour: 'Dip the blade in your own shadow and it comes out colder, darker and very slightly offended.' },
  pk_shade_thousand_cuts: { flavour: 'Grey Mab, on swords: why hit a man once with a big thing, when you can annoy him to death with a small one?' },
  pk_shade_long_contract: { flavour: 'Grey Mab never forgets a mark. She forgets birthdays, faces and the way home, but never a mark.' },
  pk_shade_executioner: { name: 'Paid in Full', flavour: 'Every debt in the warrens is settled sooner or later. The Veil simply prefers sooner.' },
  pk_shade_vanish: { flavour: 'There, then not there, then not there at all. Grizel Gall could do it mid-sentence, usually when the bill came.' },
  pk_shade_bloodprice: { flavour: 'Every fight costs somebody something. The Veil merely makes sure the bill goes to the other fellow.' },
  // ---------- Duskweaver (Duskmere)
  pk_duskweaver_strong_thread: { name: 'Double Stitch', flavour: 'A memory sewn once can slip. The Keepers sew everything twice, and the important things thrice, to be safe.' },
  pk_duskweaver_tangle: { flavour: 'Tie two shadows together and they bicker like an old married couple, all the way to the ground.' },
  pk_duskweaver_unravel: { name: 'Loose Ends', flavour: 'Pull one loose thread and the whole shadow comes apart. Loremistress Aubade calls this housekeeping.' },
  pk_duskweaver_frayed_mind: { flavour: 'Weave long enough and you forget where your own edges are. The best Duskweavers forget beautifully.' },
  pk_duskweaver_wide_eclipse: { flavour: 'The moon is never in a hurry to go dark. Duskweavers learn to wait for it, and to bring a cushion.' },
  pk_duskweaver_hungering_dark: { flavour: 'The dark keeps a little of everything it touches. Taught properly, it learns to share.' },
  pk_duskweaver_void_ward: { name: 'Moonshade Mantle', flavour: 'Planted in moonlight, a memory burns; planted in moonshade, it keeps. Wrap yourself the same way.' },
  pk_duskweaver_gloom: { flavour: 'Near a Duskweaver even angry people find they have forgotten what they were angry about.' },
  pk_duskweaver_swift_curse: { name: 'Easy Forgetting', flavour: 'Is forgetting a mercy? The Keepers have argued it for thirty years, and keep forgetting where they got to.' },
  pk_duskweaver_doom: { flavour: 'A Duskweaver’s prophecy is only a memory told in the wrong order, which is why it is never wrong.' },
  pk_duskweaver_soul_harvest: { name: 'Gleaning', flavour: 'When a foe falls, something small is left behind in the dark. Marigold Thrupp would plant it. You pocket it.' },
  pk_duskweaver_chain_curse: { name: 'Long Shadows', flavour: 'A fallen foe throws a long shadow, and the shadow, it turns out, has friends.' },
  // ---------- Umbral school
  pk_umbral_dusk: { flavour: 'In Nocturne the sun is always just gone. Nobody misses it much; it was always showing off.' },
  pk_umbral_predator: { name: 'Waning Moon', flavour: 'A waning moon is still the moon, only nearer its end. The Moon Stalkers hunt by it, and so does the Veil.' },
  pk_umbral_shroud: { flavour: 'Nocturne grannies tuck the children into shadow at bedtime, so the light cannot find them and tell tales.' },
  pk_umbral_fade: { flavour: 'Your shadow has walked off before. Ask it nicely, and for a moment it will take you with it.' },
  pk_umbral_leech: { name: 'Borrowed Warmth', flavour: 'The Veil’s oath ends: what we keep, we give back warm. It says nothing about how soon.' },
  pk_umbral_night_mind: { flavour: 'In Duskmere they think best at night, which is convenient, as it is always very nearly night.' },
  pk_umbral_shadow_stride: { flavour: 'Every lamp-post shadow on the Lanternless Streets is a stepping stone, if you are quick and Ambrose is not sweeping.' },
  pk_umbral_dark_pact: { name: 'Night’s Tithe', flavour: 'Spend the dark freely, says the Duskmere primer, and it pays you back. The margin adds, in another hand: eventually.' },
};

export const SPELLS: Record<string, SpellText> = {
  'spell:shadowstrike': { flavour: 'Strike from your own shadow and the foe never sees you. They see your shadow, and blame it.' },
  'spell:smoke-veil': { flavour: 'Grey Mab keeps a pinch of smoke in every pocket, and one pocket she will not tell you about.' },
  'spell:death-blossom': { flavour: 'In the Veilwarrens they dance it at weddings too. It is the same dance, only with fewer knives.' },
  'spell:soul-link': { flavour: 'Bound by a thread of night, foes share one shadow between them, and argue over who has to wear it.' },
  'spell:shadow-ward': { flavour: 'Your shadow takes the blow for you. It does not mind; it is used to being walked on.' },
  'spell:unravelling': { flavour: 'Everything is woven from what was. Find the end of the thread and pull, gently, firmly, until it stops.' },
};
