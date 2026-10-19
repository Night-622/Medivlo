/** Hollow Crown codex: Solaria (Radiance), shared by the Cantor and Oathbound campaigns. Owner: Claude 4. */
import type { LoreEntry } from '@/core';

const entries: LoreEntry[] = [
  // ---------- the realm
  {
    id: 'lore:hc-solaria', name: 'Solaria', category: 'realms', source: 'a pilgrim’s guide to Dawnspire, very politely worded',
    body: 'Golden meadows and white stone, the realm of the Radiance school. Radiance keeps light and keeps promises, and holds that these are the same thing. Cantors sing the hours in the Sun Cathedral at Dawnspire; the Oathbound hold the Gilded March.\n\nSince the Hollowing the sun has not set over the Sun Cathedral. The Hierarch decreed that night must not return, and Solaria has not slept properly in a generation. Everyone is very polite, and very tired.',
  },
  {
    id: 'lore:hc-hour-of-lamps', name: 'The Hour of Lamps', category: 'culture', source: 'the Dawnspire Choir’s rota',
    body: 'Dawnspire has no night. Once a day, for one hour, the Sun Cathedral turns its light down a single notch so that the city’s lamps can be trimmed. It is the nearest thing Dawnspire has to evening, and the novices sing it on the Close steps.\n\nIn the Hour of Lamps every watchman in the city looks at his wick. A great many things happen in Dawnspire during the Hour of Lamps that do not happen at any other time.',
  },
  {
    id: 'lore:hc-sun-cathedral', name: 'The Sun Cathedral', category: 'places', source: 'carved over the great doors',
    body: 'The great church of Dawnspire, built around a lens of white glass that gathers the sun and keeps it. Its great bell was rung once a minute for thirty years to keep the city awake. Its High Altar held the Altar half of the Radiance stone.\n\nThe Cathedral’s light has not gone out since C. 1012, except once, for one heartbeat, on the night the Drowned Bell rang.',
  },
  {
    id: 'lore:hc-cathedral-choir', name: 'The Cathedral Choir', category: 'factions', source: 'Mother Celestine Hale',
    body: 'The Cantors of the Sun Cathedral, singer-priests whose hymns are light. Since the Hollowing they have sung every hour of every day, so that the light never wavers. Sleeping in the Hours of Light is forbidden, so the novices sleep in corners, standing up, and between the amen and the next hymn.',
  },
  {
    id: 'lore:hc-brightwatch', name: 'The Brightwatch', category: 'factions', source: 'a fine-book, much corrected',
    body: 'The Hierarch’s inquisitors, who keep the light. They fine anyone who says the word for it, close the sleep-draught sellers, and take those who sing out of turn. Their Inquisitor gives everyone he arrests a loaf and a blanket. Their sergeants apologise.',
  },
  {
    id: 'lore:hc-undercroft', name: 'The Undercroft', category: 'places', source: 'Sister Amabel, keeper of the nights',
    body: 'The only dark place in Dawnspire, under the Sunward Market, behind a door with no lamp over it. Here the forbidden night is kept in jars, each one labelled in a round, neat hand: a night, and the year it was kept. “Mind the bottom shelf,” says Amabel. “Those are the windy ones.”',
  },
  {
    id: 'lore:hc-compline', name: 'Compline', category: 'culture', source: 'pasted inside the lid of a draught-crate', hidden: true,
    body: 'The evening hymn of the Cathedral Choir, which sang the light down gently at the end of every day until the Hierarch banned it. It does not ask the dark to go away. It asks it to come in gently and keep watch.\n\nThe second verse goes down at the end, not up. Most of Dawnspire has forgotten that.',
  },
  {
    id: 'lore:hc-reliquary-of-hours', name: 'The Reliquary of Hours', category: 'places', source: 'an inventory, never finished',
    body: 'A vault under the Choir Cloisters holding every relic the Cathedral was ever sold: three heads of the Saint of Noon, none of which match; a donkey’s jaw; a chicken’s wishbone; a great many pigs’ knuckles. When the tears came, the fakes got up and put themselves together. There was one true relic in the vault, and it was not a saint’s.',
  },
  {
    id: 'lore:hc-lucans-candle', name: 'L. B., C. 1012', category: 'history', source: 'a Brightwatch evidence box', hidden: true,
    body: 'A stub of night-candle wrapped in a child’s nightshirt, labelled “Evidence. Not to be destroyed”, with the “not” underlined three times. Lucan Brightwater lit it the night his mother died, the last night Dawnspire ever had, and held it all night so she would not be in the dark. In the morning she was gone, and the candle was not even half burned down.',
  },
  {
    id: 'lore:hc-fallen-hierarch', name: 'The Fallen Hierarch', category: 'characters', source: 'the Dawn Gate',
    body: 'The head of the Radiance school, who decreed in C. 1012 that night must never come again, and shut himself in the light at the Dawn Gate behind a golden mask with a face of perfect calm. His shadow could not follow him into so much brightness, and waited for him in the Undercroft for thirty years.\n\nUnder the mask he is very old, and he has been weeping the whole time.',
  },
  // ---------- depth pass: codex finds (Dawnspire, the Dawn Road, Claude 2's optional areas)
  {
    id: 'lore:hc-radiance-road-sundial', name: 'The Pilgrims’ Sundial', category: 'culture', source: 'a bronze dial on the Dawn Road', hidden: true,
    body: 'Pilgrims walking to Dawnspire used to stop at the sundial halfway down the Dawn Road to learn how long they had left before dark, and leave a candle at its foot for the walk home. For thirty years the sun stood still over Solaria and the dial told nobody anything. People kept polishing it anyway, the way you keep winding a clock that belonged to someone.',
  },
  {
    id: 'lore:hc-radiance-capital-ruin', name: 'The Compline Belfry', category: 'history', source: 'a lintel on a roofless belfry', hidden: true,
    body: 'Before the Hierarch nailed the sun to the sky, a small bell outside the walls rang every evening to tell the Choir it was time for Compline, and the city to go to bed. The Brightwatch took the bell down in C. 1012 and cut DOWN off the lintel. The chalk has been put back so many times that the stone under it is worn smooth.',
  },
  {
    id: 'lore:hc-radiance-capital-cave', name: 'The Cool Dark', category: 'places', source: 'a cave past the reach of the Cathedral’s light', hidden: true,
    body: 'The only true dark for thirty miles outside the Undercroft. Nobody in Dawnspire admits to knowing where it is, and a surprising number of people know the way. The hollows in its floor were worn by sleepers over three decades: pilgrims, Brightwatch sergeants, and at least one Precentrix of the Cathedral Choir, who would very much prefer you did not mention it.',
  },
  {
    id: 'lore:hc-radiance-capital-sleepers', name: 'The Sleepers’ Note', category: 'culture', source: 'a note in a crack above a hollow', hidden: true,
    body: 'Whoever first found the Cool Dark left a note for the next sleeper, and every sleeper since has added their initials and left it for the next. Forty sets of initials in thirty years. One of them, very small, low in the corner, is C. H., and beside it a date from seven years ago. It does not appear again.',
  },
  {
    id: 'lore:hc-radiance-capital-view', name: 'The Glare Steps', category: 'places', source: 'a line scratched on a rail', hidden: true,
    body: 'The highest public steps outside Dawnspire, where pilgrims used to stop to see the Cathedral before they reached it. Since C. 1012 nobody can look at it for long. The rail is scratched with three decades of advice to look away, and one line of thanks to everyone who did.',
  },
  // ---------- lair codexes
  {
    id: 'lore:hc-radiance-ringers-rota', name: 'The Ringers’ Rota', category: 'culture', source: 'a rota pinned up in the Bell Loft', hidden: true,
    body: 'Before C. 1012 the great bell rang the hours, and twelve ringers took turns, two to an hour. Since the Hierarch’s decree it has rung every minute, and the rota has had only one name on it: the Seraph of the Last Light, who never asked to be relieved, and was never offered.',
  },
  {
    id: 'lore:hc-radiance-relic-receipts', name: 'The Relic Receipts', category: 'history', source: 'a receipt-book in the Reliquary of Hours', hidden: true,
    body: 'Three hundred years of receipts for relics bought by the Cathedral: three heads of the Saint of Noon, eleven of her fingers, a great many knuckles. Every one sold by a travelling man from the Gilded March who signed himself “Honest Crispin”. The Cathedral paid in gold, every time, and never once checked. The receipts are filed under Faith.',
  },
  {
    id: 'lore:hc-radiance-lens-log', name: 'The Lens-Keepers’ Log', category: 'places', source: 'a log-book by the great lens', hidden: true,
    body: 'The great lens of the Sun Cathedral was polished by lens-keepers for six hundred years, and they kept a log of the light: bright, very bright, clouded, dim. Every entry since C. 1012 says the same thing, in the same hand, which is not a lens-keeper’s: “Bright. Keep it bright. — L. B.”',
  },
  // ---------- the Gilded March
  {
    id: 'lore:hc-order-of-oathkeep', name: 'The Order of Oathkeep', category: 'factions', source: 'the Hall of Broken Swords',
    body: 'The Oathbound, knights of the Gilded March, whose sworn word is armour. Every knight swears the Oath of the March in the Hall of Broken Swords, and finishes its last line in their own words. A broken oath, the Order says, will not let you die. It will not let you do anything else, either.\n\nA ring worn sun outward marks an oath to a living lord. Turned in, sun to the palm, it marks an oath kept to a lord who has fallen.',
  },
  {
    id: 'lore:hc-dimming', name: 'The Dimming', category: 'places', source: 'Reeve Marjory Stook of Haybright',
    body: 'Where the Hierarch’s light fails on the edge of the Gilded March, and the first real night in thirty years is creeping in over the wheat. Villages that have never seen a star are seeing them. Villages that have never seen their own shadows at full length are staring at their feet. Black tears pool in the first real shade.',
  },
  {
    id: 'lore:hc-sorrow-oath', name: 'The Sorrow-Oath', category: 'culture', source: 'Ser Wystan Crake, keeper of the Hall',
    body: 'The Order’s oldest vow, sworn by a knight whose lord has fallen: to keep the lord’s last command, though no one is left to see it kept. It is sworn rarely and kept terribly well. Dame Ilsabet swore it in C. 1012, in the Citadel, to the crown.',
  },
  {
    id: 'lore:hc-golden-waymarks', name: 'The Golden Waymarks', category: 'places', source: 'Jessamy Brightpenny, gilder',
    body: 'Gilded stones along the March road, so travellers can find their way. Every one has a traveller’s oath scratched on the back: mostly “I’ll come home”, some rude. The oldest, at the edge of the Dimming, is older than the Order: “Who walks this road walks it for the crown that passes. Keep it open.”',
  },
  {
    id: 'lore:hc-march-stars', name: 'The Stars of the March', category: 'cosmology', source: 'Gammer Lisle, shepherd',
    body: 'Before C. 1012 every shepherd on the March knew the stars: the Plough, the Weaver, the Hound. Low over the March, Gammer Lisle’s grandmother showed her two hands with a crown between them, going from one to the other. She called it the Passing. It never stops moving, she said; it is always on its way from one to the next.',
  },
  {
    id: 'lore:hc-first-oath', name: 'The First Oath', category: 'history', source: 'a rubbing from the buried face of the founding stone', hidden: true,
    body: '“We who keep the March swear it to the Concord, and to the crown that passes, and to no lord who will not let it pass.”\n\nThe Order of Oathkeep was never sworn to the Hierarch. It was sworn to see the crown passed on.',
  },
  {
    id: 'lore:hc-ser-gallant', name: 'Ser Gallant the Forsworn', category: 'characters', source: 'the Hall’s roll of names, struck through',
    body: 'Squire to Dame Ilsabet. On the night of the 85th Turning she knelt to the crown and swore to it, and he would not, because he saw who was wearing it. So he broke his oath to follow her anywhere, and ran. A broken oath will not let you die. He has held the Forsworn Chapel ever since, getting up every time he falls.',
  },
  // ---------- depth pass: codex finds (the Gilded March)
  {
    id: 'lore:hc-radiance-march-end', name: 'The Last Waymark', category: 'culture', source: 'a tall waymark at the March’s edge', hidden: true,
    body: 'TRAVELLER, KEEP. The last waymark of the Gilded March does not say what to keep, and the Order has never agreed on it. Squires are taught that it means the road. Old knights say it means your word. Gammer Lisle says it means your boots, because the road past it is terrible, and she has walked it.',
  },
  {
    id: 'lore:hc-radiance-frontier-ruin', name: 'The First Watch-Tower', category: 'history', source: 'a lintel on a broken tower', hidden: true,
    body: 'Before Oathkeep was built, the knights of the March kept towers along the Dimming’s edge, and their work was not to fight the dark but to sit up in it with anyone who was frightened. WATCH THE DARK FOR THOSE WHO FEAR IT. The motto was changed when the Hierarch nailed the sun up, and the towers were let fall. Dobbin Fenwick, who has never heard of any of this, has just reinvented it.',
  },
  {
    id: 'lore:hc-radiance-frontier-cave', name: 'The Oath-Cave', category: 'culture', source: 'scratched on the walls of a March cave', hidden: true,
    body: 'The one place on the March that was always dark, even in the long noon, and so the place where people came to swear the things they could not say in daylight. Most of the oaths are about love. A few are about cheese. The newest, by the entrance, is signed B., and was cut by somebody using the point of a knight’s dagger, very neatly, thirty years ago.',
  },
  {
    id: 'lore:hc-radiance-frontier-tally', name: 'The Squires’ Tally', category: 'characters', source: 'a slate wedged in a crack in the oath-cave', hidden: true,
    body: 'Two squires of Oathkeep raced each other one summer to count every star visible from the March. One gave up at four thousand and eleven, when the Marshal caught her and put her on latrines. The other finished, and left the slate in the cave for her to find, and never told anybody she had won. Neither of them, it seems, ever came back for the slate.',
  },
  {
    id: 'lore:hc-radiance-frontier-view', name: 'Sunset Rise', category: 'places', source: 'a bench on the Rise, facing east', hidden: true,
    body: 'When the sun still set over the March, people climbed the Rise every evening to watch it go down. Since C. 1012 the sun has stood in the west at noon for thirty years, and the only thing worth looking at from the Rise is the Dimming in the east. Somebody turned the bench round to face it. Nobody has turned it back.',
  },
  // ---------- lair codexes
  {
    id: 'lore:hc-radiance-lion-plate', name: 'The Lion’s Wage', category: 'history', source: 'a bronze plate in the Lion’s gatehouse', hidden: true,
    body: 'The Gilded Lion kept the March road by an old bargain: one ingot of gold every Midsummer, laid on the gatehouse step by the Marshal herself. The tally of Midsummers on the plate runs for nine hundred years and stops at C. 1012, the year the sun stood still and there were no more Midsummers to count. Nobody paid the Lion for thirty years. In the end it took its wage from the road.',
  },
  {
    id: 'lore:hc-radiance-gallant-pew', name: 'The Forsworn Pews', category: 'places', source: 'the carved pew-ends of the Forsworn Chapel', hidden: true,
    body: 'Every knight struck from the Order’s roll has their name carved on a pew-end in the Forsworn Chapel, so that they can sit, at least, among their own. The newest carving is Ser Gallant’s. Under his name someone has added, in a different and much steadier hand, three words: WHO WOULD NOT KNEEL. Ser Wystan Crake has never admitted to it.',
  },
  {
    id: 'lore:hc-radiance-shrine-roll', name: 'The Vigil-Roll of the Shrine', category: 'characters', source: 'a vigil-roll in the Dimming Shrine', hidden: true,
    body: 'Knights of the March who kept vigil in the Dimming Shrine signed the roll by its door, one line each, for a thousand years. The last true entry reads: “Ilsabet, C. 1012, before the Turning.” After it, one line a year for thirty years, the same name, in the same clear hand, getting no less clear: “Ilsabet. Still keeping it.”',
  },
  // ---------- characters
  {
    id: 'lore:hc-celestine-hale', name: 'Mother Celestine Hale', category: 'characters', source: 'the Choir, fondly',
    body: 'Precentrix of the Cathedral Choir, thin as a reed and sharp as glass. She has not slept for six years, and has sung every hour of every day in that time. She lies for her novices in ways that are strictly true. Her family has a branch in Concordia, millers, who cannot hold a tune in a sack.',
  },
  {
    id: 'lore:hc-lucan-brightwater', name: 'Inquisitor Lucan Brightwater', category: 'characters', source: 'Dawnspire, gratefully',
    body: 'Inquisitor of the Brightwatch: thin, gentle, polite, behind smoked spectacles he never takes off. He arrests the sleep-draught sellers with a loaf and a blanket for each. His mother sang alto in the Choir and died on the last night Dawnspire ever had. Nobody can remember seeing him yawn.',
  },
  {
    id: 'lore:hc-beatrix-holm', name: 'Ser Beatrix Holm', category: 'characters', source: 'Oathkeep, respectfully, out of earshot',
    body: 'Marshal of Oathkeep: bluff, scarred and rigidly honest. She likes nobody until they have kept a promise in front of her. In C. 1012 she promised to ride with Ilsabet to the 85th Turning, and stayed to hold the March instead. It is the only promise she has ever broken.',
  },
  {
    id: 'lore:hc-ilsabet', name: 'Dame Ilsabet of the Sorrow-Oath', category: 'characters', source: 'the March, and the Dimming',
    body: 'The most famous knight of the Gilded March, Beatrix Holm’s shield-companion, lost at the 85th Turning. On the night of the Hollowing she knelt in the Citadel and swore fealty to the crown, and she has kept it every day since. “An oath to the crown is an oath to whoever wears it.” Her ring is turned inward.',
  },
  // ---------- Concordia
  {
    id: 'lore:hc-radiance-abbeyshore', name: 'Abbeyshore', category: 'places', source: 'Mother Ysmay Penhallow',
    body: 'A wet little village on the shore of the lake where the Abbey stood. Its Shore Chapel is kept by Radiance pilgrims who came for the 85th Turning and were on this side of the arches when they shut. They sing the hours at the chapel window, towards the water, every one of them, and the drowned choir sings back.',
  },
  {
    id: 'lore:hc-radiance-shorewatch', name: 'The Shorewatch', category: 'factions', source: 'three shields leaning on a post',
    body: 'Three Oathbound, Ser Cuthbert Lowe, Ser Bryony Wade and Ser Petronella Fane, who swore in C. 1012 that none would reach the drowned nave while the Shorewatch stood, until relieved by Oathkeep. They kept the shore for thirty years in rusting, dripping armour. Nobody came to relieve them.',
  },
  {
    id: 'lore:hc-radiance-morwen', name: 'Abbess Morwen, the Drowned', category: 'bestiary', source: 'the altar step of the drowned nave',
    body: 'The Sentinel of the Radiance school, and of Song: Abbess of the hill chapel that became the Abbey, and keeper of the Turning Bell for a thousand years. She drowned with it, and leads its choir still. When the Bell rang out of turn in C. 1042 she would not forgive it: a Turning with no crown, she said, is a lie, and she would not let it tell the lie.',
  },
  {
    id: 'lore:hc-cantor-willow', name: 'The Willow and the Lens', category: 'bestiary', source: 'a Cantor’s account of Stag’s Rest',
    body: 'The Weeping Willow, the Sentinel of the Verdant school, was planted at the Concord’s founding and now weeps black tears into the Gloamwood. Lucan Brightwater tried to burn the tears out of her with a lens the size of a cartwheel. It only made her weep harder. Under her branches is the deepest shade in Morvane, and something that only opens in the dark can calm her.',
  },
];

export default entries;
