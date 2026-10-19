/** Hollow Crown codex: Cinderreach (Ash), shared by the Arcanist and Reaver campaigns. Owner: Claude 4. */
import type { LoreEntry } from '@/core';

const entries: LoreEntry[] = [
  {
    id: 'lore:hc-cinderreach', name: 'Cinderreach', category: 'realms', source: 'a Kilnhold primer, much singed',
    body: 'Black ash fields and rivers of lava, the realm of the Ash school. Ash holds that nothing is finished until it has been through the fire. Kilnhold fires pottery, glass, iron and, according to its proverbs, people.\n\nSince the Hollowing, the Great Kiln has been failing. Every year it is fed something it was not built to burn, and every year the ash fields spread.',
  },
  // ---------- depth pass: codex finds (the Cinder Road, and Claude 2's optional areas round Kilnhold)
  {
    id: 'lore:hc-cinder-road-shrine', name: 'The Coal Shrine', category: 'culture', source: 'a stone bowl on the Cinder Road', hidden: true,
    body: 'Ash travellers leave a coal in the bowl before they pass the Cinder Gate, so that something of theirs stays warm at home while they are gone. A coal that is still glowing when you come back means somebody kept you in mind.\n\nFor thirty years every coal in the bowl went cold, because nobody came back. The one you left is still burning.',
  },
  {
    id: 'lore:hc-ash-capital-ruin', name: 'The First Kiln', category: 'history', source: 'a carved stone, older than the Concord', hidden: true,
    body: 'Before the Great Kiln there was this one, no bigger than a bread oven, dug into the ash by the first fire-keepers of Cinderreach. The carving over its mouth is older than any script the Conclave can read. Thrane thinks it says “Keep it lit”. Ashworth thinks it is the first burning permit.',
  },
  {
    id: 'lore:hc-ash-capital-cave', name: 'The Stokers’ Wall', category: 'culture', source: 'scratched with shovel blades', hidden: true,
    body: 'Every stoker who ever fed the Great Kiln scratches their name on the cave wall on their first day, above the names of everyone who fed it before them. Six hundred years of names, a new one over the old, like coals on a fire.\n\nIt is bad luck to scratch your own name out. It is very bad luck to scratch in somebody else’s before they are gone. Somebody has done both, carefully, on purpose.',
  },
  {
    id: 'lore:hc-ash-capital-tally', name: 'The Last Tally', category: 'culture', source: 'a stoker’s tally-board in the Stokers’ Deep', hidden: true,
    body: 'Stokers count their shovels in chalk, five to a gate, a column to a shift. It isn’t for the Conclave. It is for the Kiln, the stokers say, so that she knows somebody was keeping track of her.\n\nThe board in the Deep belonged to a stoker nobody now remembers. The last column stops at forty-one. Bettany says she can guess the year from the chalk: the winter the smoke first stopped lifting at dusk.',
  },
  {
    id: 'lore:hc-ash-capital-view', name: 'The Clear Day Plate', category: 'places', source: 'a brass plate on a viewpoint rail', hidden: true,
    body: '“On a clear day you can see the Cinder Gate.” The plate was put up by the Conclave in C. 980, when Kilnhold’s smoke still lifted at dusk and the city could see the road out. There has not been a clear day since C. 1012. People still come up to read the plate, and look north anyway.',
  },
  {
    id: 'lore:hc-ash-frontier-ruin', name: 'The First Palisade', category: 'history', source: 'a ring of stumps on the Bleeding Fields', hidden: true,
    body: 'The Red Muster’s first wall, raised a thousand years ago, when the Muster was forty Reavers and a banner. Every stake has rotted to a stump but the biggest, which carries the motto the Muster still fights under: Until It Is Over.\n\nSomebody, much later, carved a question under it. Nobody has answered it yet.',
  },
  {
    id: 'lore:hc-ash-frontier-cave', name: 'The Hound Den', category: 'bestiary', source: 'scratch-marks in a cave on the Fields', hidden: true,
    body: 'Magma Hounds den in the caves under the Fields in litters of six, and the Muster has always said they were born hating it. The marks in this den say otherwise. Something taught them the shape of the red axe, at a hound’s eye height, patiently, over generations.',
  },
  {
    id: 'lore:hc-ash-frontier-letter', name: 'Corrie Ash’s Letter', category: 'culture', source: 'a tin on a cave ledge', hidden: true,
    body: '“If this is found, I got lost chasing a hound into the dark, and it was worth it, it was the biggest one I ever saw. Tell my sister she can have my axe. Tell her not to come looking.”\n\nThe Muster’s roll lists a Corrie Ash, lost on the Fields in C. 1019. Her sister kept her axe on the wall for twenty years, and went looking anyway.',
  },
  {
    id: 'lore:hc-ash-frontier-view', name: 'The Circles', category: 'places', source: 'seen from a viewpoint over the Fields', hidden: true,
    body: 'From high enough, the war on the Bleeding Fields is a pattern. The hound packs and the Muster’s patrols move in the same circles every night, the same routes, the same skirmishes at the same fords, as if both sides were walking a dance that nobody remembers being taught.',
  },
  {
    id: 'lore:hc-great-kiln', name: 'The Great Kiln', category: 'places', source: 'Old Stoker Bettany',
    body: 'The oldest fire in Cinderreach, at the heart of Kilnhold. It was lit before the Concord and has never gone out. Fifty years I’ve fed her, says Bettany, and she never cried before this year.',
  },
  {
    id: 'lore:hc-kiln-conclave', name: 'The Kiln Conclave', category: 'factions', source: 'Magister Coalby Thrane, off the record',
    body: 'The forty masters who rule Kilnhold from the Conclave Hall on the Smoke Terraces. They agree that fire matters and on very little else. Burning anything larger than a candle needs one of their permits, and the permit office is frequently on fire.',
  },
  {
    id: 'lore:hc-morrows-ledger', name: 'The Provost’s Ledger', category: 'history', source: 'a page that would not burn', hidden: true,
    body: '“Tincture, black, forty measures.” “Tincture, black, sixty.” Every week, more. Provost Ignace Morrow kept the Great Kiln alive for a year by feeding it black tears, and the smoke carried them across Kilnhold.',
  },
  {
    id: 'lore:hc-half-stones', name: 'The Half-Stones', category: 'magic', source: 'Ysolde Fenn, the Stone Court ledger',
    body: 'When the twelve Concord Stones fled the crown in C. 1012, each cracked in two as it fell home. A half-stone will not leave its resting place, or sing, for anyone but its bearer. It does not burn the bearer’s hand. It feels like holding someone’s hand.',
  },
  {
    id: 'lore:hc-realm-gates', name: 'The Realm Gates', category: 'places', source: 'carved on every gate',
    body: 'Each realm has one gate to Concordia: a great arch of its own stone, carved with all twelve schools’ marks. They have been shut since the stones fled, and since last winter black tears have seeped through every one. A bearer’s half-stone opens their school’s gate.',
  },
  {
    id: 'lore:hc-concord-ring', name: 'The Concord Ring', category: 'cosmology', source: 'Old Ambrose Lumen, astronomer',
    body: 'Twelve stars in a ring, one for each school, that once hung over the crown in every realm’s sky. Ambrose’s master drew them for him as a boy. Nobody ever asked about the dark place in the middle.',
  },
  {
    id: 'lore:hc-kilnmouth', name: 'Kilnmouth', category: 'places', source: 'Forgewife Ada Smelt',
    body: 'A village of Ash-folk in Concordia’s Ashfall Kiln, stranded when the arches shut. They keep a copy of the Great Kiln burning cold out of stubbornness, and draw the breath of the beast under their kilns for their forges.',
  },
  {
    id: 'lore:hc-sentinel-ashmaw', name: 'Ashmaw, the Kiln-Beast', category: 'bestiary', source: 'its own last words',
    body: 'The Sentinel of the Ash school, whose breath lit every torch on the Turning Road for a thousand years. When the tears found it, it would not die, so the Ash-folk built their kilns around it. Will there be torches again, it asked.',
  },
  {
    id: 'lore:hc-sentinel-engine', name: 'The Gilded Engine', category: 'bestiary', source: 'Foreman Brask, and the Engine itself',
    body: 'The Sentinel of the Iron school: the great forge that made the crown’s twelve settings, made to hold the schools’ song and their grief both, so that no one Concordant had to carry it alone. It was buried in the gold of the Sparkwright city, and it kept running.',
  },
  {
    id: 'lore:hc-coalby-thrane', name: 'Magister Coalby Thrane', category: 'characters', source: 'Kilnhold, affectionately',
    body: 'A master of the Kiln Conclave for forty years, soot-faced and absent-minded, keeper of a Lava Slime called Pudding and a thirty-year sum. He believes fire is for making things.',
  },
  {
    id: 'lore:hc-ignace-morrow', name: 'Provost Ignace Morrow', category: 'characters', source: 'Kilnhold, carefully',
    body: 'The Conclave’s youngest-ever provost: brilliant, warm, generous with praise. He has kept the Great Kiln burning when no one else could. Nobody knows how. Everyone near him is always warm.',
  },
  {
    id: 'lore:hc-red-muster', name: 'The Red Muster', category: 'factions', source: 'the Muster’s own songs',
    body: 'The Reaver war-clans of the Bleeding Fields, who have held the lava fronts against the Magma Hounds since before the Concord. Their banner is a red axe on black, and their motto is Until It Is Over. When the Turning Bell rings, by old law, the Muster stands down.',
  },
  {
    id: 'lore:hc-bleeding-fields', name: 'The Bleeding Fields', category: 'places', source: 'Quartermaster Grub’s survey',
    body: 'Black lava flats veined with red, where the Schools’ War was fought. Every vein of lava on the Fields runs north, towards the Cinder Gate.',
  },
  {
    id: 'lore:hc-schools-war', name: 'The Schools’ War', category: 'history', source: 'four banners on the Bone Ridge',
    body: 'Before the Concord the twelve schools fought for centuries, each sure its note was the true one. The war ended on a hill in Concordia, with a peace. On the Bone Ridge the last banner standing is the Concord’s own.',
  },
  {
    id: 'lore:hc-brenna', name: 'Brenna Scald-Hand', category: 'characters', source: 'the Red Muster',
    body: 'War-chief of the Red Muster for thirty years. Her right arm is burned black to the elbow. She raised half the camp, and she has never once said she was tired.',
  },
  {
    id: 'lore:hc-hask', name: 'Hask', category: 'characters', source: 'the Red Muster',
    body: 'Brenna’s son and the best axe in the Muster. He goes out past the line alone, and he always comes back.',
  },
  {
    id: 'lore:hc-hild', name: 'Hild Ashfoot', category: 'characters', source: 'the Drakeholt, if you climb high enough',
    body: 'An old Reaver who walked off the line twenty years ago and has lived in the Drakeholt with the drakes ever since. A war that never ends, she says, is not a war. It is a habit.',
  },
  {
    id: 'lore:hc-sentinel-varric', name: 'Bonelord Varric', category: 'bestiary', source: 'Old Hobb, and the barrow itself',
    body: 'The Sentinel of the Blade school: the first Concord duellist, who ended the Schools’ War in single combat and was buried under the Aldermoor moor with honour. Hollowed, he raises the dead to a muster that never stands down.',
  },
  // ---------- lair codexes
  {
    id: 'lore:hc-zealot-sermons', name: 'The Preacher’s Sermons', category: 'factions', source: 'a sermon book under the Row', hidden: true,
    body: 'The Ashen Zealots began as a reading circle of glassblowers who met in the old chapel to talk about the Kiln. Their preacher was a gentle man, by every account, until the black tears came to the Row. His sermons follow him down, one page at a time, and stop the week his daughter first cried in front of him.',
  },
  {
    id: 'lore:hc-glass-archive', name: 'The Glass Archive', category: 'places', source: 'an index card that slipped behind a shelf', hidden: true,
    body: 'Six hundred years of Kilnhold’s records, kept on glass shelves that never burned, until the night they did. The archivists indexed everything twice and lent nothing out. Their one locked stack, the Provost’s Stack, held whatever Kilnhold knew about the Turnings. It was the first shelf to go.',
  },
  {
    id: 'lore:hc-kiln-heart', name: 'The Heart of the Kiln', category: 'places', source: 'a handprint in the oldest brick', hidden: true,
    body: 'At the bottom of the Great Kiln is the cradle where the Ash stone’s Kiln half lay for a thousand years, singing the fire into the brick. The Conclave forgot it was there. The stokers never did; they call the deepest grate “the cradle” to this day, without knowing why.',
  },
  {
    id: 'lore:hc-drake-riders', name: 'The Drake Riders', category: 'history', source: 'a saddle in the Drake Roost', hidden: true,
    body: 'Before the Schools’ War, the Red Muster’s scouts rode Cinder Drakes over the Fields, and the drakes nested on the Drakeholt by agreement. The agreement is in no record the Muster keeps. The drakes appear to remember it better than the Reavers do.',
  },
  {
    id: 'lore:hc-brand-pits', name: 'The Brand-Pits', category: 'places', source: 'a kennel-keeper’s board in the pits', hidden: true,
    body: 'Long before the hounds came at the wall, the Brand-Pits were the Muster’s kennels, where Magma Hounds were bred to run with Reavers, not against them. The brands on the pit-mouths are the Muster’s own. Nobody living knows when the hounds stopped being dogs and started being the enemy.',
  },
  {
    id: 'lore:hc-battle-kiln', name: 'The Old Battle-Kiln', category: 'places', source: 'a plate on the war-kiln’s door', hidden: true,
    body: 'The Muster built the Battle-Kiln to forge axes faster than the war could break them, and swore to put it out on the day the war ended. It is still burning. The half-stone in its heart kept it lit long after the Muster stopped feeding it, as if waiting to be told it could stop.',
  },
];

export default entries;
