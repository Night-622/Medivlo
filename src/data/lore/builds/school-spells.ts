/**
 * Flavour for the 36 school spells (HC_SCHOOL_SPELL_DEFS, taught by tomes), merged into SPELL_TEXT. The handoff names stay
 * (each tome in shared.ts ITEMS is named for its spell); the mechanical desc stays Claude 3's. Owner: Claude 4.
 */
import type { SpellText } from '../hc-builds-text';

export const SPELLS: Record<string, SpellText> = {
  // Ash
  'spell:meteor': { flavour: 'Kilnhold calls it sending a rock back. Nobody remembers who threw the first one.' },
  'spell:flame-wall': { flavour: 'Reavers draw it across a field like a line in the sand, except the sand is on fire.' },
  'spell:cataclysm': { flavour: 'The last chapter of every Arcanist’s textbook. The pages are scorched from the inside.' },
  // Rime
  'spell:blizzard': { flavour: 'Frostmere weather, brought indoors. Glacierhome considers it a mild afternoon.' },
  'spell:ice-lance': { flavour: 'Rimecallers carve them from the Wall itself. The Wall has never asked for any back.' },
  'spell:absolute-zero': { flavour: 'For one breath the whole world holds still, the way Frostmere always wished it would.' },
  // Storm
  'spell:ball-lightning': { flavour: 'Spirehold children chase these through the streets. The lucky ones never catch one.' },
  'spell:thunderclap': { flavour: 'On the Thunderclap Heights this is how you say good morning, and also how you end an argument.' },
  'spell:tempest': { flavour: 'Skyrender made the weather with its wings. You will have to make do with your arms.' },
  // Radiance
  'spell:sunbeam': { flavour: 'Dawnspire’s Cantors call it a morning prayer. Whoever stands on the wrong end calls it something else.' },
  'spell:sanctuary': { flavour: 'A ring of old Solarian light. Inside it every oath is kept, and every blow lands softer.' },
  'spell:dawnbreak': { flavour: 'The Gilded March sings it at first light, loud enough to wake the dead and send them straight back.' },
  // Umbral
  'spell:shadow-step': { flavour: 'Nocturne keeps a memory of every place. Step into one, and step out where it remembers.' },
  'spell:soul-siphon': { flavour: 'The Veilwarrens teach that a stolen breath is only borrowed. Shades never say from whom.' },
  'spell:eclipse': { flavour: 'The Eclipse Queen wanted the moon for ever. You only want it for a moment, which is far more polite.' },
  // Verdant
  'spell:overgrowth': { flavour: 'Rootholme’s gardeners use it on weeds. The weeds have started using it back.' },
  'spell:thorn-volley': { flavour: 'Thornwilds rangers pick the thorns by hand, and keep a jar of plasters for the picking.' },
  'spell:wild-heart': { flavour: 'The old trees of Wildheart remember every friend who helped them grow. Some of them come when called.' },
  // Blade
  'spell:blade-dance': { flavour: 'Edgewater duellists call it a dance. Their partners rarely ask for a second one.' },
  'spell:perfect-parry': { flavour: 'The Hushpine masters practise it for ten winters before they try it in earnest.' },
  'spell:thousand-cuts': { flavour: 'The Thousand-Edge General’s favourite lesson. He taught it to each pupil once, briefly.' },
  // Iron
  'spell:shield-wall': { flavour: 'Anvilgate’s first lesson: a shield is a wall you can carry, and a wall is a shield that stays put.' },
  'spell:earthshaker': { flavour: 'Deepworks crews use it to loosen ore. The ore was never consulted.' },
  'spell:unbreakable': { flavour: 'Ironhold’s oldest boast, true for a moment. The bruises arrive later, all at once.' },
  // Fist
  'spell:dragon-kick': { flavour: 'No dragon has ever been kicked by a Stonecloister monk. The monks say that is because the dragons heard.' },
  'spell:iron-skin': { flavour: 'The Abbess calls it standing up straight. The rest of Mountainreach calls it being hit and not minding.' },
  'spell:mountain-breaker': { flavour: 'The Lowfold Pits ban it from friendly bouts. It is the only rule the Pits have.' },
  // Hunt
  'spell:snare-trap': { flavour: 'Greywilds knotwork, older than the Lodge. Take only what the trap gives.' },
  'spell:piercing-shot': { flavour: 'One arrow, one line, and everything on it. The Lodge frowns on waste, so it counts as one shot.' },
  'spell:apex-predator': { flavour: 'For a moment the whole field remembers what the Great Hunt felt like, and every quarry knows it.' },
  // Guile
  'spell:smoke-bomb': { flavour: 'Tidecourt’s answer to every bill, every question and every pointed sword.' },
  'spell:backstab': { flavour: 'Tidecourt calls it a closing argument. It is always delivered from behind.' },
  'spell:grand-heist': { flavour: 'The Velvet King pawned a gate. This is your heist, and it does not need a creditor.' },
  // Song
  'spell:ballad-of-valour': { flavour: 'Harmonia’s oldest marching song. Nobody knows the second verse, so everyone fights harder in the first.' },
  'spell:war-drum': { flavour: 'A drum of the Fells, played loud enough to move the enemy back a step and the neighbours a street.' },
  'spell:encore': { flavour: 'The Grand Opera’s crowds never let a good song end. Neither, it turns out, will your allies.' },
};
