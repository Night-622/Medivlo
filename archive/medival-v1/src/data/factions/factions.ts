/** Factions of Morvane (docs/lore/03-factions.md). Owner: Claude 4. */
import type { FactionDef } from '@/core';

const ranks = (...titles: string[]) => titles.map((title, i) => ({ min: [0, 25, 45, 65, 90][i] ?? 90, title }));

const factions: FactionDef[] = [
  {
    id: 'faction:lanternate', name: 'The Lanternate', shortName: 'Lanternate', leader: 'Hierophant Aurelian IV', seat: 'region:lantern-coast',
    description: 'The Church of the Seven Lights, spiritual authority of the Solenne Empire. It holds that all magic belongs to the gods and may be used by mortals only under licence. Since the Brand went dark, it has been a church without its miracle.',
    joinable: true, startingRep: 0, ranks: ranks('Lay Sibling', 'Acolyte', 'Lightsworn', 'Lantern-Knight', 'Hand of the Hierophant'),
    relations: { 'faction:crown-of-haldmarch': 30, 'faction:emberwardens': -70, 'faction:thornwise': -30, 'faction:drowned-choir': -100, 'faction:ashen-creed': -90, 'faction:iron-concord': 10, 'faction:wolf-moot': -20, 'faction:salt-league': -40, 'faction:qasiri': -30 },
    colors: { primary: 0xe8d38a, secondary: 0xffffff }, sigil: 'a white-gold lantern with seven rays',
  },
  {
    id: 'faction:order-of-the-wick', name: 'The Order of the Wick', shortName: 'The Wick', leader: 'Lord-Inquisitor Castor Vellane', seat: 'region:lantern-coast', parent: 'faction:lanternate',
    description: 'The inquisitors and witchfinders of the Lanternate, who "trim the wick so the flame burns true". They enforce the Wick-Edict: no magic without a licence.',
    joinable: false, startingRep: 0,
    relations: { 'faction:lanternate': 60, 'faction:emberwardens': -90, 'faction:ashen-creed': -100, 'faction:drowned-choir': -100 },
    colors: { primary: 0x2a2320, secondary: 0xe8d38a }, sigil: 'wick-scissors crossed over a candle',
  },
  {
    id: 'faction:crown-of-haldmarch', name: 'The Crown of Haldmarch', shortName: 'Crown', leader: 'Queen Aldith (Lord Protector Osric Harrow, regent)', seat: 'region:kingsvale',
    description: 'The Haldish kingdom, self-ruling since the Charter of Haldren in 870 YL. Its old king died this winter, and now a fifteen-year-old queen and an ambitious regent argue over a starving realm.',
    joinable: true, startingRep: 0, ranks: ranks('Freeman', 'Sworn Sword', 'Knight of the March', "Queen's Champion"),
    relations: { 'faction:lanternate': 30, 'faction:thornwise': 10, 'faction:drowned-choir': -80, 'faction:ashen-creed': -40, 'faction:iron-concord': 30, 'faction:wolf-moot': -50, 'faction:salt-league': -10 },
    colors: { primary: 0x2f4a7a, secondary: 0xc8a046 }, sigil: 'a gold crossroads on blue',
  },
  {
    id: 'faction:emberwardens', name: 'The Emberwardens', shortName: 'Emberwardens', leader: 'Hesta Corrow', seat: 'region:kingsvale',
    description: 'Mage-knights sworn in 112 YL to guard the leys and hunt the Mire. The Church purged them in 1041 YL. What remains is one old woman with a sword, and whoever she can find.',
    joinable: true, startingRep: 0, ranks: ranks('Kindling', 'Warden', 'Ember-Knight', 'Warden-Captain', 'Warden-Mother'),
    relations: { 'faction:lanternate': -70, 'faction:thornwise': 30, 'faction:drowned-choir': -100, 'faction:ashen-creed': 10, 'faction:iron-concord': 20, 'faction:qasiri': 20 },
    colors: { primary: 0xb5481f, secondary: 0x1a140e }, sigil: 'an ember inside an open hand',
  },
  {
    id: 'faction:thornwise', name: 'The Thornwise Circle', shortName: 'Thornwise', leader: 'Archdruid Rhiannon Ys-Caer', seat: 'region:ylwen-deepwood',
    description: 'Druids and wardens of the old forests, Aelthi and human alike. They mourn the Mire rather than hate it, and keep fragments of a song meant to sing it back to sleep.',
    joinable: true, startingRep: 0, ranks: ranks('Seedling', 'Thornsworn', 'Antlered', 'Elder of the Circle'),
    relations: { 'faction:lanternate': -30, 'faction:crown-of-haldmarch': 10, 'faction:emberwardens': 30, 'faction:drowned-choir': -60, 'faction:ashen-creed': -20, 'faction:wolf-moot': 10, 'faction:qasiri': 10 },
    colors: { primary: 0x4a6b3a, secondary: 0xd9cfa6 }, sigil: 'an antler crown wound with thorns',
  },
  {
    id: 'faction:drowned-choir', name: 'The Drowned Choir', shortName: 'Drowned Choir', leader: 'Ysolde, the Pale Saint', seat: 'region:greywater-marsh',
    description: '"The world is a wound. The Forging was the blade. Let the water close over it." Once a hidden marsh cult, now an army of the willingly Hollowed.',
    joinable: false, startingRep: -60,
    relations: { 'faction:lanternate': -100, 'faction:crown-of-haldmarch': -80, 'faction:emberwardens': -100, 'faction:thornwise': -60 },
    colors: { primary: 0x1c2a33, secondary: 0x9fb4c8 }, sigil: 'a black circle on still water',
  },
  {
    id: 'faction:ashen-creed', name: 'The Ashen Creed', shortName: 'Ashen Creed', leader: 'The Red Abbess (Vesper Qadri)', seat: 'region:cinder-wastes',
    description: 'A free-mage underground, faithful to Ashvar the Ember-Tongue. They hold that fire belongs to everyone and that the Lanternate’s licences are chains.',
    joinable: true, startingRep: 0, ranks: ranks('Spark', 'Flame', 'Pyre', 'Brand-Breaker'),
    relations: { 'faction:lanternate': -90, 'faction:crown-of-haldmarch': -40, 'faction:emberwardens': 10, 'faction:drowned-choir': -50, 'faction:salt-league': 30, 'faction:qasiri': 40 },
    colors: { primary: 0xa3261b, secondary: 0xf0a040 }, sigil: 'a flame-tongue breaking a lantern',
  },
  {
    id: 'faction:iron-concord', name: 'The Iron Concord', shortName: 'Iron Concord', leader: 'High Thane Brannoch Deepforge', seat: 'region:ironspine',
    description: 'The council of the Orrun holds beneath the Ironspine. They trade with humans and swear fealty to none, and they guard the Nine Nails that pin the Mire. They will not say how many still hold.',
    joinable: true, startingRep: 0, ranks: ranks('Guest-of-Hall', 'Oathfriend', 'Hearthkin', 'Thane-Sworn'),
    relations: { 'faction:lanternate': 10, 'faction:crown-of-haldmarch': 30, 'faction:emberwardens': 20, 'faction:drowned-choir': -80, 'faction:wolf-moot': -10, 'faction:salt-league': 10 },
    colors: { primary: 0x5a554d, secondary: 0xd4a646 }, sigil: 'a hammer struck through an anvil',
  },
  {
    id: 'faction:wolf-moot', name: 'The Hrothi Wolf-Moot', shortName: 'Wolf-Moot', leader: 'Jarl Sigrun Ice-Eye', seat: 'region:frostreach',
    description: 'The gathering of the northern clans. The Long Winter is killing the north, and its young warriors look south with hungry eyes.',
    joinable: true, startingRep: 0, ranks: ranks('Outlander', 'Shield-Friend', 'Wolf-Sworn', 'Moot-Voice'),
    relations: { 'faction:lanternate': -20, 'faction:crown-of-haldmarch': -50, 'faction:thornwise': 10, 'faction:drowned-choir': -70, 'faction:salt-league': 20 },
    colors: { primary: 0x6b7f8f, secondary: 0xe8e8e8 }, sigil: 'a wolf’s head under a storm-cloud',
  },
  {
    id: 'faction:salt-league', name: 'The Salt League', shortName: 'Salt League', leader: 'Admiral Marisol Kestrel', seat: 'region:saltreach-coast',
    description: 'Corsair-merchants of Brackhaven and the western isles, free of both Hierophant and King since the War of the Two Lanterns. Everything has a price.',
    joinable: true, startingRep: 0, ranks: ranks('Deckhand', 'Mate', 'Captain', 'Commodore'),
    relations: { 'faction:lanternate': -40, 'faction:drowned-choir': -30, 'faction:ashen-creed': 30, 'faction:iron-concord': 10, 'faction:wolf-moot': 20, 'faction:qasiri': 20 },
    colors: { primary: 0x1f4f5a, secondary: 0xe0d6b8 }, sigil: 'a gull over crossed oars',
  },
  {
    id: 'faction:qasiri', name: 'The Qasiri Caravans', shortName: 'Qasiri', leader: 'The Cindermother, Ruqaya al-Nar', seat: 'region:sunscar',
    description: 'The nomad clans descended from fallen Qadir. They carry their ancestors’ shame and their craft, and they mean to keep the world from repeating the Burning.',
    joinable: true, startingRep: 0, ranks: ranks('Guest', 'Salt-Sharer', 'Caravan-Kin', 'Keeper of the Ash'),
    relations: { 'faction:lanternate': -30, 'faction:emberwardens': 20, 'faction:thornwise': 10, 'faction:drowned-choir': -70, 'faction:ashen-creed': 40, 'faction:salt-league': 20 },
    colors: { primary: 0xc2873a, secondary: 0x3a2a1a }, sigil: 'a glass flame within a sun-ring',
  },
];

export default factions;
