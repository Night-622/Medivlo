/**
 * The 24 Hollow Crown campaigns, as narrative metadata (docs/lore/hollow-crown/03-classes.md). Pure data used by
 * the engine for {class}/{sibling}/{mentor}/… tokens and by the generated bearer NPCs. Class defs themselves
 * (stats, kits) are Claude 3's; the class → school map is core's classSchool(). Owner: Claude 4.
 */
import type { SchoolId } from '@/core';

export interface CampaignInfo {
  id: string;
  name: string;
  school: SchoolId;
  side: 'capital' | 'frontier';
  realm: string;
  start: string;
  sibling: string;
  mentor: string;
  nemesis: string;
  halfStone: string;
  /** this class's hero as an NPC bearer in other campaigns */
  bearer: string;
  sentinelA: string;
  sentinelB: string;
  /** the two featured bearers of this campaign's Act II (06-outlines; their hook dialogue is `dialogue:<id>-featured-<bearer>`) */
  featured: [string, string];
  /** the mentor NPC id (the engine derives story.mentor_trust from it) */
  mentorId: string;
}

type Row = [id: string, name: string, school: SchoolId, side: 'capital' | 'frontier', realm: string, start: string,
  sibling: string, mentor: string, nemesis: string, halfStone: string, bearer: string, sentinelA: string, sentinelB: string, featured: [string, string]];

const ROWS: Row[] = [
  ['arcanist', 'Arcanist', 'ash', 'capital', 'Cinderreach', 'Kilnhold', 'reaver', 'Magister Coalby Thrane', 'Provost Ignace Morrow', 'the Kiln half', 'Ottoline Pyre', 'Ashmaw', 'the Gilded Engine', ['sparkwright', 'knight']],
  ['reaver', 'Reaver', 'ash', 'frontier', 'Cinderreach', 'the Bleeding Fields', 'arcanist', 'Brenna Scald-Hand', 'Hask the Unburnt', 'the Field half', 'Garrow Redaxe', 'Ashmaw', 'Bonelord Varric', ['swordsman', 'brawler']],
  ['rimecaller', 'Rimecaller', 'rime', 'capital', 'Frostmere', 'Glacierhome', 'warden', 'Archivist-Superior Halla Vint', 'Regent Seraphine Cold', 'the Spire half', 'Ilse Winterbourne', 'the Rimeheart Colossus', 'the Lantern Queen', ['stormlancer', 'jester']],
  ['warden', 'Warden', 'rime', 'frontier', 'Frostmere', 'the Wardwall', 'rimecaller', 'Wall-Captain Dagny Orr', 'Torvald Wallbreaker', 'the Wall half', 'Aled Holloway', 'the Rimeheart Colossus', 'the White Stag', ['juggernaut', 'falconer']],
  ['sparkwright', 'Sparkwright', 'storm', 'capital', 'Thunderreach', 'Spirehold', 'stormlancer', 'Guildmother Tess Ampery', 'Chancellor Volta Sterne', 'the Tower half', 'Fizz Copperpot', 'the Stormcrow', 'the Gilded Engine', ['arcanist', 'monk']],
  ['stormlancer', 'Stormlancer', 'storm', 'frontier', 'Thunderreach', 'the Thunderclap Heights', 'sparkwright', 'Lancemaster Odran Gale', 'Cass Vantor', 'the Eye half', 'Kit Skyward', 'the Stormcrow', 'the Rimeheart Colossus', ['warden', 'swordsman']],
  ['cantor', 'Cantor', 'radiance', 'capital', 'Solaria', 'Dawnspire', 'oathbound', 'Mother Celestine Hale', 'Inquisitor Lucan Brightwater', 'the Altar half', 'Seraphina Dawe', 'Abbess Morwen', 'the Weeping Willow', ['bard', 'ranger']],
  ['oathbound', 'Oathbound', 'radiance', 'frontier', 'Solaria', 'the Gilded March', 'cantor', 'Ser Beatrix Holm', 'Dame Ilsabet of the Sorrow-Oath', 'the March half', 'Ser Aldric Vow', 'Abbess Morwen', 'Bonelord Varric', ['skald', 'samurai']],
  ['duskweaver', 'Duskweaver', 'umbral', 'capital', 'Nocturne', 'Duskmere', 'shade', 'Loremistress Nyx Aubade', 'Oriel Vane, the Mnemosarch', 'the Obelisk half', 'Lune Ashgrey', 'the Spinner Below', 'the Lantern Queen', ['rimecaller', 'huntsman']],
  ['shade', 'Shade', 'umbral', 'frontier', 'Nocturne', 'the Veilwarrens', 'duskweaver', 'Grey Mab', 'the Shadow That Left', 'the Veil half', 'Vesper', 'the Spinner Below', 'the Weeping Willow', ['cantor', 'samurai']],
  ['hedgewitch', 'Hedgewitch', 'verdant', 'capital', 'Wildheart', 'Rootholme', 'ranger', 'Mother Yarrow', 'Bramblewife Ostara', 'the Heartwood half', 'Bryony Fernwick', 'the Weeping Willow', 'the Ooze Sovereign', ['monk', 'bard']],
  ['ranger', 'Ranger', 'verdant', 'frontier', 'Wildheart', 'the Thornwilds', 'hedgewitch', 'Holt Barrow', 'Aldo Mire, the Rotking', 'the Rot half', 'Rowan Thornbury', 'the Weeping Willow', 'the White Stag', ['falconer', 'skald']],
  ['swordsman', 'Swordsman', 'blade', 'capital', 'Steelvale', 'Edgewater', 'samurai', 'Maestra Lucia Ferro', 'Ser Auguste Vellacourt', 'the Hall half', 'Gaspard Lisle', 'Bonelord Varric', 'the Stormcrow', ['reaver', 'falconer']],
  ['samurai', 'Samurai', 'blade', 'frontier', 'Steelvale', 'the Hushpine Terraces', 'swordsman', 'Sensei Haru Kanemori', 'Lord Ikeda Shun', 'the Terrace half', 'Aiko Hoshida', 'Bonelord Varric', 'the Spinner Below', ['oathbound', 'shade']],
  ['knight', 'Knight', 'iron', 'capital', 'Ironhold', 'Anvilgate', 'juggernaut', 'Ser Gideon Marke', 'Prince-Regent Konrad Berenikson', 'the Forge half', 'Ser Edda Brand', 'the Gilded Engine', 'Ashmaw', ['arcanist', 'corsair']],
  ['juggernaut', 'Juggernaut', 'iron', 'frontier', 'Ironhold', 'the Deepworks', 'knight', 'Foreman Gussie Haldt', 'Magda Ruhl, the Smelter', 'the Lode half', 'Hamm Ironsides', 'the Gilded Engine', 'the Rimeheart Colossus', ['warden', 'sparkwright']],
  ['monk', 'Monk', 'fist', 'capital', 'Mountainreach', 'Stonecloister', 'brawler', 'Abbess Shirin Tal', 'Brother Kestrel', 'the Summit half', 'Brother Sefu', 'the Ooze Sovereign', 'the Stormcrow', ['hedgewitch', 'stormlancer']],
  ['brawler', 'Brawler', 'fist', 'frontier', 'Mountainreach', 'the Lowfold Pits', 'monk', '"Pops" Tobiah Knuckle', 'Silas Gaunt, the Promoter', 'the Pit half', 'Kat Mabry', 'the Ooze Sovereign', 'Ashmaw', ['reaver', 'knight']],
  ['huntsman', 'Huntsman', 'hunt', 'capital', 'the Greywilds', 'Antlerford', 'falconer', 'Ulric Bannock', 'Lady Corva Ashby', 'the Lodge half', 'Ulla Fenwright', 'the White Stag', 'the Spinner Below', ['ranger', 'duskweaver']],
  ['falconer', 'Falconer', 'hunt', 'frontier', 'the Greywilds', 'the Hawkmoor', 'huntsman', 'Old Wren', 'the Hooded Man', 'the Moor half', 'Perrin Featherstone', 'the White Stag', 'the Stormcrow', ['skald', 'sparkwright']],
  ['jester', 'Jester', 'guile', 'capital', 'Tidecourt', 'Velvet Harbour', 'corsair', 'Old Fennick Pantaloon', 'Harlequin Sorrow', 'the Court half', 'Tumble', 'the Lantern Queen', 'Abbess Morwen', ['oathbound', 'duskweaver']],
  ['corsair', 'Corsair', 'guile', 'frontier', 'Tidecourt', 'Gallows Reef', 'jester', 'Captain Dorothea "Dot" Brine', 'Admiral Saltmarsh', 'the Reef half', 'Captain Nell Quay', 'the Lantern Queen', 'the Gilded Engine', ['rimecaller', 'juggernaut']],
  ['bard', 'Bard', 'song', 'capital', 'Harmonia', 'Lyrehaven', 'skald', 'Signora Rosalind Vell', 'Impresario Blaise Marchetti', 'the Opera half', 'Lark Ellery', 'Abbess Morwen', 'the Weeping Willow', ['hedgewitch', 'shade']],
  ['skald', 'Skald', 'song', 'frontier', 'Harmonia', 'the Echoing Fells', 'bard', 'Ragna Saga-Keeper', 'Ulf the Unsung', 'the Fell half', 'Sigrid Drumhallow', 'Abbess Morwen', 'the White Stag', ['cantor', 'ranger']],
];

/** mentor NPC ids; written by each campaign's data (06-outlines headers). Declared before CAMPAIGNS, which reads it. */
export const MENTOR_ID: Readonly<Record<string, string>> = {
  arcanist: 'npc:coalby-thrane', reaver: 'npc:brenna-scald-hand',
  bard: 'npc:rosalind-vell', skald: 'npc:ragna-saga-keeper',
  hedgewitch: 'npc:mother-yarrow', ranger: 'npc:holt-barrow', swordsman: 'npc:lucia-ferro', samurai: 'npc:haru-kanemori',
  knight: 'npc:gideon-marke', juggernaut: 'npc:gussie-haldt', monk: 'npc:shirin-tal', brawler: 'npc:tobiah-knuckle',
  rimecaller: 'npc:halla-vint', warden: 'npc:dagny-orr', sparkwright: 'npc:tess-ampery', stormlancer: 'npc:odran-gale',
  huntsman: 'npc:ulric-bannock', falconer: 'npc:old-wren', jester: 'npc:fennick-pantaloon', corsair: 'npc:dot-brine',
  cantor: 'npc:celestine-hale', oathbound: 'npc:beatrix-holm', duskweaver: 'npc:nyx-aubade', shade: 'npc:grey-mab',
};

export const CAMPAIGNS: readonly CampaignInfo[] = ROWS.map(([id, name, school, side, realm, start, sibling, mentor, nemesis, halfStone, bearer, sentinelA, sentinelB, featured]) =>
  ({ id, name, school, side, realm, start, sibling, mentor, nemesis, halfStone, bearer, sentinelA, sentinelB, featured, mentorId: MENTOR_ID[id] ?? '' }));

const BY_ID = new Map(CAMPAIGNS.map((c) => [c.id, c]));

export function campaign(classId: string): CampaignInfo | undefined {
  return BY_ID.get(classId.replace(/^class:/, ''));
}

export const SCHOOL_NAME: Readonly<Record<SchoolId, string>> = {
  ash: 'Ash', rime: 'Rime', storm: 'Storm', radiance: 'Radiance', umbral: 'Umbral', verdant: 'Verdant',
  blade: 'Blade', iron: 'Iron', fist: 'Fist', hunt: 'Hunt', guile: 'Guile', song: 'Song',
};
