/**
 * Realm-capital merchants (Claude 4; shops by Claude 3, placement by Claude 2): in every realm capital, a Runeforge
 * smith (shop:<school>-smith) and a general trader (shop:<school>-trader), at the capital's Smithy and Market, within
 * reach of the capital waystone. Always present, for both of the school's classes (Act I had no merchants outside
 * Brindlecross). Their talk is dialogue/hc-capital-merchants.ts. Owner: Claude 4.
 */
import type { NpcDef, SchoolId } from '@/core';

type Look = NpcDef['look'];
type Kind = 'smith' | 'trader' | 'pedlar';
/** frontier villages built as forts have a Quartermaster where the others have a Trader (Claude 2's realmGen) */
const FORT = new Set<SchoolId>(['rime', 'radiance', 'iron']);
const HOME: Record<Kind, (s: SchoolId) => string> = {
  smith: (s) => `landmark:${s}-capital-smithy`,
  trader: (s) => `landmark:${s}-capital-market`,
  pedlar: (s) => `landmark:${s}-frontier-${FORT.has(s) ? 'quartermaster' : 'trader'}`,
};
const SERVICES: Record<Kind, string[]> = { smith: ['Weapons', 'Armour', 'Runeforge'], trader: ['Potions', 'Food', 'Scrolls', 'Rope & lanterns'], pedlar: ['Potions', 'Food', 'Torches', 'Buys loot'] };

function merchant(school: SchoolId, kind: Kind, name: string, title: string, look: Look, bio: string, lines: string[]): NpcDef {
  return {
    id: `npc:${school}-${kind}`, name, title, school, origin: school, trust: 1,
    region: `zone:${school}-${kind === 'pedlar' ? 'frontier' : 'capital'}-1`, home: HOME[kind](school), services: SERVICES[kind],
    shop: `shop:${school}-${kind}`,
    dialogue: [{ dialogue: `dialogue:merchant-${school}-${kind}` }],
    barks: [{ lines }],
    roles: ['merchant'],
    look, bio,
  } as NpcDef;
}

const npcs: NpcDef[] = [
  // ---------- Ash: Kilnhold
  merchant('ash', 'smith', 'Forgemaster Tibb Slagworth', 'of the Kilnhold Runeforge', { skin: 0xc08060, hair: 0x2a1a14, cloth: 0x5a2a20, accent: 0xff7a2a, build: 'broad' },
    'Tibb Slagworth has run the Kilnhold Runeforge since the Provost’s permits made every other forge in the city illegal, which Tibb regards as the Provost’s finest work.',
    ['Hot iron, cold coin.', 'If it can melt, I can mend it.']),
  merchant('ash', 'trader', 'Persis Cokesby', 'Chandler of Kilnhold', { skin: 0xe8b890, hair: 0x8a3a1a, cloth: 0x7a4a2a, accent: 0xffd36a, build: 'short' },
    'Persis Cokesby sells candles, cordials and cinder-salve from a stall that has burned down four times and been rebuilt five, because the fifth time she added a porch.',
    ['Salve! Salve for the singed!', 'Two for a shard, three if you stop sniffing them.']),
  // ---------- Rime: Glacierhome
  merchant('rime', 'smith', 'Coldsmith Ingrid Hoarfell', 'of Glacierhome', { skin: 0xf0d8c8, hair: 0xd8e4f0, cloth: 0x4a6a9a, accent: 0x9fdcff, build: 'tall' },
    'Ingrid Hoarfell keeps her forge against the coldest stretch of Glacierhome’s wall and has never once lit it properly. She says fire is for people in a hurry.',
    ['Hammer. Wait. Hammer.', 'Frost on the anvil means it’s a good day.']),
  merchant('rime', 'trader', 'Sven Rimeholt', 'Provisioner of Glacierhome', { skin: 0xe8c0a0, hair: 0xa8a8a8, cloth: 0x6a5a4a, accent: 0xd8f6ff, build: 'broad' },
    'Sven Rimeholt has sold furs, fish and firelighters from the same counter for thirty years, at the same prices, which in Glacierhome is not a figure of speech.',
    ['Fresh fish! Well. Fish.', 'Thaw a coin, buy a candle.']),
  // ---------- Storm: Spirehold
  merchant('storm', 'smith', 'Petra Coilwright', 'Runesmith of the Coil Guild', { skin: 0xd8a888, hair: 0x3a2a4a, cloth: 0x2a3470, accent: 0xffe14a, build: 'average' },
    'Petra Coilwright holds Coil Guild licence No. 4,112, which permits her to forge, temper and, in exceptional circumstances, apologise.',
    ['Stand behind the yellow line!', 'Sparks are free. Everything else is extra.']),
  merchant('storm', 'trader', 'Mabel Squall', 'Storekeeper of Spirehold', { skin: 0xf0c8a8, hair: 0x6a4a3a, cloth: 0x4a5aa8, accent: 0xd3ddff, build: 'short' },
    'Mabel Squall sells oilskins to a city that has needed them every day for thirty years, and has still never once said “I told you so”, out loud.',
    ['Oilskins! Get your oilskins!', 'It’ll rain. It always rains.']),
  // ---------- Radiance: Dawnspire
  merchant('radiance', 'smith', 'Sister Honorine Lathe', 'Lampsmith of the Cathedral Close', { skin: 0xf0d0b0, hair: 0xe8d8a0, cloth: 0xe6e9f5, accent: 0xf0a823, build: 'average' },
    'Sister Honorine Lathe trims the Cathedral’s great lamps in the Hour of Lamps and forges in every other hour, and cannot honestly say which she is better at.',
    ['Polish is a kind of prayer.', 'No smudges on the Close, please.']),
  merchant('radiance', 'trader', 'Prosper Lumley', 'Almoner of Dawnspire', { skin: 0xd8a888, hair: 0x5a4a3a, cloth: 0xb7c0e3, accent: 0xffe27a, build: 'broad' },
    'Prosper Lumley gives alms to the poor of Dawnspire on Sundays and sells provisions to everyone else on the other six days, which he insists is the same work at a different price.',
    ['Blessed bread! Ordinary bread!', 'Charity begins at two shards.']),
  // ---------- Umbral: Duskmere
  merchant('umbral', 'smith', 'Osk Nightjar', 'Shadowsmith of Duskmere', { skin: 0xa07a6a, hair: 0x1d1638, cloth: 0x232a55, accent: 0xa35cff, build: 'slight' },
    'Osk Nightjar forges with felt on his hammer, so the street outside never knows when he is working, which is how Duskmere likes its tradesmen.',
    ['Quiet hands.', '(The hammer comes down without a sound.)']),
  merchant('umbral', 'trader', 'Jago Penumbra', 'Night-trader of Duskmere', { skin: 0xc8a088, hair: 0x2b2145, cloth: 0x36387a, accent: 0xd9a0ff, build: 'tall' },
    'Jago Penumbra keeps a shop that is open after dark, which in Duskmere is always, and sells rope that does not creak to customers who do not give their names.',
    ['Rope that doesn’t creak!', 'No questions asked, no answers given.']),
  // ---------- Verdant: Rootholme
  merchant('verdant', 'smith', 'Linnea Brambleforge', 'Thornsmith of Rootholme', { skin: 0xd8a070, hair: 0x6a8a3a, cloth: 0x3f6a2a, accent: 0x8ef06a, build: 'average' },
    'Linnea Brambleforge’s smithy is half a tree, and the half that isn’t is slowly being persuaded.',
    ['Sap-quenched, root-tempered!', 'Don’t step on the forge. It’s alive.']),
  merchant('verdant', 'trader', 'Basil Hedgerow', 'Herbalist of Rootholme', { skin: 0xe8c098, hair: 0xb8a070, cloth: 0x6a9a3a, accent: 0xff79a8, build: 'short' },
    'Basil Hedgerow sells herbs for what ails you, seeds for what doesn’t yet, and has a shelf of red bottles he describes only as “for emergencies”.',
    ['Fresh nettle!', 'Picked this morning, or possibly next week.']),
  // ---------- Blade: Edgewater
  merchant('blade', 'smith', 'Giacomo Tempra', 'Bladesmith of Edgewater', { skin: 0xc89070, hair: 0x2a2a2a, cloth: 0x4a4a5a, accent: 0xd3ddff, build: 'tall' },
    'Giacomo Tempra and the Bellows family have been rivals for three generations over who sharpens Edgewater’s swords, a feud conducted entirely through very polite pricing.',
    ['Sharp is a beginning, not an end.', 'Ask a Bellows to sheathe it.']),
  merchant('blade', 'trader', 'Rosaria Gatti', 'Merchant of Edgewater', { skin: 0xe0b090, hair: 0x5a2a1a, cloth: 0x8a2a3a, accent: 0xffd36a, build: 'average' },
    'Rosaria Gatti sells liniment to the duellists of Edgewater before their bouts and bandages after them, and has never yet lost money on either.',
    ['Liniment! For the proud!', 'First aid, second aid, third aid!']),
  // ---------- Iron: Anvilgate
  merchant('iron', 'smith', 'Brunhild Hammerling', 'Ironmonger of Anvilgate', { skin: 0xd09878, hair: 0xb87a3a, cloth: 0x4a3a30, accent: 0xa9bbd6, build: 'broad' },
    'Brunhild Hammerling learned at the Fortress Forge under Marit Blum, and left the day the Forgemistress let her rivet unsupervised, which she still counts as graduation.',
    ['Rivet it, then rivet it again.', 'Good iron hums. Hear that? Neither do I. Good.']),
  merchant('iron', 'trader', 'Oswin Steelyard', 'Quartermaster of Anvilgate', { skin: 0xe8c0a0, hair: 0x7a7a7a, cloth: 0x5a5a6a, accent: 0xc98a1c, build: 'average' },
    'Oswin Steelyard issues rations, rope and lamp-oil to anyone with a chit, and sells them to anyone without one, and keeps both ledgers with equal pride.',
    ['Sign here. And here.', 'Issued, not sold. Well. Sold.']),
  // ---------- Fist: Stonecloister
  merchant('fist', 'smith', 'Brother Dorje Stonepalm', 'Bellsmith of Stonecloister', { skin: 0xb88a68, hair: 0x2a2a2a, cloth: 0xc87a2a, accent: 0xffe27a, build: 'broad' },
    'Brother Dorje Stonepalm casts the Cloister’s bells and mends its gates, and has never once raised a hand in anger, only in metallurgy.',
    ['One stroke. Then another.', 'The bell knows when it’s finished.']),
  merchant('fist', 'trader', 'Mother Pemba', 'Keeper of the Pilgrims’ Store', { skin: 0xa87858, hair: 0xc8c8c8, cloth: 0x8a3a2a, accent: 0xe8c98f, build: 'short' },
    'Mother Pemba has kept the Pilgrims’ Store at Stonecloister for forty years, and in all that time nobody has bought anything before finishing their tea.',
    ['Tea! Then shopping!', 'All those stairs. Buy the salve.']),
  // ---------- Hunt: Antlerford
  merchant('hunt', 'smith', 'Garth Elkhorn', 'Bowyer and Smith of Antlerford', { skin: 0xc89070, hair: 0x6a4a2a, cloth: 0x6e7f3a, accent: 0xe8c98f, build: 'tall' },
    'Garth Elkhorn forges by the ford where the elk cross, and stops work whenever they do, which the Lodge considers the sign of a good smith and his customers the sign of a slow one.',
    ['Straight shafts, sharp heads.', 'Name what it’s for.']),
  merchant('hunt', 'trader', 'Larch Tumbrel', 'Provisioner of Antlerford', { skin: 0xe0b088, hair: 0x8a5a2a, cloth: 0x7a4526, accent: 0x3fae4c, build: 'average' },
    'Larch Tumbrel sells jerky, rope and waxed thread to hunters going out into the Greywilds, and keeps a list of who came back to buy more.',
    ['Jerky! It’s mostly elk.', 'Rope for the cliffs, thread for after.']),
  // ---------- Guile: Velvet Harbour
  merchant('guile', 'smith', 'Fanny Fob', 'Pawn-smith of the Velvet Docks', { skin: 0xf0c8a8, hair: 0xa83a5a, cloth: 0x2a3a5a, accent: 0xffd84a, build: 'short' },
    'Fanny Fob mends what Mister Tuttle won’t take, and buys what he will, and the two of them have not spoken in eleven years, which suits the Docks perfectly.',
    ['Mend it, don’t pawn it!', 'Interest-free, for once.']),
  merchant('guile', 'trader', 'Molly Sixpence', 'Dockside Trader', { skin: 0xd8a888, hair: 0x3a2a1a, cloth: 0x5a2a6a, accent: 0xff8a6a, build: 'average' },
    'Molly Sixpence sells anything you want on the Velvet Docks, and a good deal on things you didn’t know you wanted until she held them up.',
    ['Sixpence a bag!', 'Nothing’s stolen till somebody notices.']),
  // ---------- Song: Lyrehaven
  merchant('song', 'smith', 'Mirabel Strum', 'Instrument-smith of Lyrehaven', { skin: 0xf0d0b8, hair: 0xd8a040, cloth: 0x8a4ae0, accent: 0xffd84a, build: 'slight' },
    'Mirabel Strum strings the Grand Opera’s harps and forges its stage swords, and was the first person in Lyrehaven to notice the Maestro’s orchestra had stopped buying strings.',
    ['In tune, or not at all.', 'A flat blade is a sad blade.']),
  merchant('song', 'trader', 'Fabian Semiquaver', 'Music-seller of Lyrehaven', { skin: 0xe8c0a0, hair: 0x4a3a2a, cloth: 0x2f7a4a, accent: 0xc08aff, build: 'tall' },
    'Fabian Semiquaver sells sheet music, rosin and throat-lozenges, and a potion for stage fright that outsells everything else in the shop put together.',
    ['Lozenges! Lozenges!', 'Rosin, rope and remedies!']),
  // ---------- frontier pedlars (Claude 3's shop:<school>-pedlar): the frontier-start classes' first merchant
  merchant('ash', 'pedlar', 'Ansley Kettleby', 'Pedlar of the Ash frontier', { skin: 0xc89878, hair: 0x5a3a2a, cloth: 0x7a5a3a, accent: 0xff9a2e, build: 'short' },
    'Ansley Kettleby walks the cinder roads with a kettle on his back and sells tea to everyone he meets, whether they want it or not. By the end, most of them do.',
    ['Tea and tinder!', 'Mind the ash. It gets in everything.']),
  merchant('rime', 'pedlar', 'Agnar Frostby', 'Pedlar of the Wall', { skin: 0xe8c8b0, hair: 0xc8c8c8, cloth: 0x5a6a8a, accent: 0xd8f6ff, build: 'broad' },
    'Agnar Frostby has carried the same pack along the Wall for thirty years and claims he has never once been cold, which nobody believes and nobody can disprove.',
    ['Warm bread, cold hands.', 'Torches! Torches!']),
  merchant('storm', 'pedlar', 'Hamlet Thunderley', 'Pedlar of the Heights', { skin: 0xd8a888, hair: 0x8a6a4a, cloth: 0x4a5aa8, accent: 0xffe14a, build: 'tall' },
    'Hamlet Thunderley sells from a pack that is mostly waterproofing, and has been struck by lightning twice, which he regards as good for business.',
    ['Dry goods! Genuinely dry!', 'It’s only thunder.']),
  merchant('radiance', 'pedlar', 'Abelard Tinch', 'Pedlar of the Shorewatch road', { skin: 0xf0d0b0, hair: 0xb8a070, cloth: 0xd8dce8, accent: 0xf0a823, build: 'average' },
    'Abelard Tinch sells provisions to the Shorewatch from a cart painted with saints, every one of whom he will name for you, at length, if you buy an apple.',
    ['Apples blessed by Saint Nobody!', 'Bread for the watch!']),
  merchant('umbral', 'pedlar', 'Mirri Dimm', 'Pedlar of the moor road', { skin: 0xb88a78, hair: 0x2b2145, cloth: 0x36387a, accent: 0xa35cff, build: 'slight' },
    'Mirri Dimm appears beside travellers on the moor road without anybody ever quite seeing her arrive, which makes her an excellent pedlar and a poor dinner guest.',
    ['(She’s already beside you.)', 'Psst. Torches.']),
  merchant('verdant', 'pedlar', 'Bramwell Reedling', 'Pedlar of the Wild', { skin: 0xd8a070, hair: 0x5a7a3a, cloth: 0x6a9a3a, accent: 0xffd84a, build: 'short' },
    'Bramwell Reedling sells apples from trees nobody else can find, and carries a pack the Bloomkin are fairly sure has started to sprout.',
    ['Apples! Mysterious apples!', 'Don’t water the pack.']),
  merchant('blade', 'pedlar', 'Nico Spada', 'Pedlar of the Temple Road', { skin: 0xc89070, hair: 0x3a2a1a, cloth: 0x8a3a2a, accent: 0xd3ddff, build: 'tall' },
    'Nico Spada once challenged a duellist to a bout over the price of an apple, lost, and has sold apples at a very fair price ever since.',
    ['Fair prices! Fairer than duels!', 'Apples, en garde!']),
  merchant('iron', 'pedlar', 'Gunnar Brackwater', 'Pedlar of the March', { skin: 0xd09878, hair: 0x7a5a3a, cloth: 0x5a5a6a, accent: 0xc98a1c, build: 'broad' },
    'Gunnar Brackwater sells to the March garrison from a handcart he swears was once a siege engine, and he has the splinters to prove it.',
    ['Rations! Not regulation!', 'Fresh off the cart.']),
  merchant('fist', 'pedlar', 'Old Tenzin', 'Pedlar of the pilgrim road', { skin: 0xa87858, hair: 0xd8d8d8, cloth: 0xc87a2a, accent: 0xffe27a, build: 'slight' },
    'Old Tenzin has walked the pilgrim road with a pack bigger than he is for longer than anyone can remember, and has never once been seen to put it down.',
    ['Climb lightly. Buy something.', 'The road is long. The bread is fresh.']),
  merchant('hunt', 'pedlar', 'Eldon Packstraw', 'Pedlar of the Greywilds', { skin: 0xc89070, hair: 0x8a5a2a, cloth: 0x6e7f3a, accent: 0xe8c98f, build: 'average' },
    'Eldon Packstraw follows the hunters into the Greywilds and buys their pelts before they are dry, a habit the Lodge disapproves of and the hunters very much do not.',
    ['Pelts bought, apples sold!', 'Jerky’s a shard. The advice is free.']),
  merchant('guile', 'pedlar', 'Zeb Whelk', 'Pedlar of the Reef road', { skin: 0xd8a888, hair: 0x3a2a2a, cloth: 0x2a3a5a, accent: 0xffd84a, build: 'short' },
    'Zeb Whelk sells from a barrow on the Reef road, and keeps a second, smaller barrow for the goods he sells to people who ask the right question.',
    ['Barrow goods! Legitimate!', 'Ask the right question.']),
  merchant('song', 'pedlar', 'Tamsy Tambour', 'Pedlar of the Fells', { skin: 0xf0d0b8, hair: 0xd8a040, cloth: 0x2f7a4a, accent: 0xc08aff, build: 'average' },
    'Tamsy Tambour drums her prices out on a tambourine as she walks the Fells, so the sheepfolds always know she is coming and roughly how much it will cost.',
    ['(A jingle of tambourine.) Bread!', 'Two beats a shard!']),
];

export default npcs;
