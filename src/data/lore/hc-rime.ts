/**
 * Hollow Crown codex: Frostmere (Rime), shared by the Rimecaller and Warden campaigns
 * (docs/lore/hollow-crown/06-outlines/rime.md). Owner: Claude 4.
 */
import type { LoreEntry } from '@/core';

const entries: LoreEntry[] = [
  // ---------- the realm
  {
    id: 'lore:hc-frostmere', name: 'Frostmere', category: 'realms', source: 'the Archive of the Spire, primer, page one (of nine hundred)',
    body: 'Snowfields under a pale sun, the realm of the Rime school. Rime holds that what stays still, lasts. Glacierhome is a city of archives cut into a glacier, where everything is kept, from treaties and recipes to the exact temperature of every day for nine hundred years.\n\nTo the north the Wardwall holds back the winter, and beyond it the Outland Clans hold on as best they can.',
  },
  {
    id: 'lore:hc-ice-spire', name: 'The Ice Spire', category: 'places', source: 'Archivist-Superior Halla Vint, correcting a guidebook',
    body: 'The tower at the crown of Glacierhome, grown from the glacier itself. For a thousand years it hummed with the Rime Stone’s note, and the city melted no further than it ought to. When the Stone fled in C. 1012 the hum stopped, and the glacier began to weep.',
  },
  {
    id: 'lore:hc-held-hour', name: 'The Held Hour', category: 'magic', source: 'an hour-walker’s primer, written very small',
    body: 'On the night the Rime Stone fled, the Regent stopped the melt by holding the hour: a great working that keeps Glacierhome at one moment of one night in C. 1012. Inside it nobody ages and nothing changes. The bread in the ovens has been baking for thirty years.\n\nA few Rimecallers, the hour-walkers, can move inside the hold, wearing ice hour-pins cut for them by the Archivist-Superior. Everyone else is still.',
    sections: [{ id: 'broken', title: 'The thaw', body: 'When the Spire half was lifted from the Crown of the Spire, the hold broke. Every clock in Glacierhome struck thirty years at once, and the city went on with its evening as if nothing had happened, which for most of it was true.' }],
  },
  {
    id: 'lore:hc-archive-of-the-spire', name: 'The Archive of the Spire', category: 'factions', source: 'its own charter, kept in triplicate',
    body: 'The Rimecallers of Glacierhome, archivist-mages who still and keep: ice, time, memory. They have written down the weather every day for nine hundred years and the price of bread for longer. Their motto is Nothing Lost, and they argue about the comma.',
  },
  {
    id: 'lore:hc-first-keeping', name: 'The First Keeping', category: 'history', source: 'the Archive’s oldest vault', hidden: true,
    body: 'A single sunrise, written down in C. 3 by the first Rimecallers so completely that they could afford to let it go. Every colour is there, and the temperature, and the name of the dog that barked. At the bottom, in a different hand: Kept. Not held.\n\nThe Archive was built to keep. It was never meant to hold.',
  },
  {
    id: 'lore:hc-thirteenth-line', name: 'The Thirteenth Line', category: 'history', source: 'the Rime copy of the Concord’s founding treaty',
    body: 'The last page of the treaty bears twelve champions’ signatures, one for each school, and below them a thirteenth line, ruled and left blank. Nobody in the Archive has ever been able to say who it was left for. Ysolde Fenn of Brindlecross has asked to see it.',
  },
  {
    id: 'lore:hc-weather-register', name: 'The Weather Register', category: 'books', source: 'Clerk Cornelius Teal, in a very steady hand',
    body: 'Ten thousand nine hundred and fifty days of “cold; still”. Before that, nine hundred years of weather. The last true entry before the hold reads: “11.52. Mild for the season. The Regent’s physician called up to the Spire.”',
  },
  {
    id: 'lore:hc-wardwall', name: 'The Wardwall', category: 'places', source: 'carved over the Gatehouse',
    body: 'A wall of ice and grey stone a hundred miles long across the north of Frostmere, built to hold back the winter. Watch-fires burn along its Long Rampart, one every mile, and the Wardens have kept them lit for a thousand years. Lately they keep going out.',
  },
  {
    id: 'lore:hc-wardens-of-the-wall', name: 'The Wardens of the Wall', category: 'factions', source: 'the drill-yard, shouted',
    body: 'The shield-guard of the Wardwall, who hold the passes with tower shields and fin crests and a great deal of shouting. A Warden sets their shield before they learn to read, and some never bother with the reading. They answer to the Wall-Captain, who answers to the wall.',
  },
  {
    id: 'lore:hc-outland-clans', name: 'The Outland Clans', category: 'factions', source: 'Grandam Hekla, who disagrees with most of it',
    body: 'The steadings beyond the Wardwall, in the Jarlsfell, where the winter the wall keeps out comes down on them instead. They were led by the Frostbound Jarl until he froze to his high seat, and his hall-folk went on bringing him the food.',
  },
  {
    id: 'lore:hc-wall-charter', name: 'The Wall Charter', category: 'history', source: 'a sealed chest in the Wraith Barrows', hidden: true,
    body: 'The founding charter of the Wardwall, signed by the Hundredth Warden and his ninety-nine. The wall is built to keep out the winter, it says, and nothing else. Its gates are to stand open “for anyone who comes in from the cold”.',
  },
  {
    id: 'lore:hc-empty-banner', name: 'The Empty Banner', category: 'history', source: 'seen at the Breach, by night',
    body: 'Torvald Wallbreaker’s parley-flag bore no clan’s mark. It showed a crown with nothing in it. The Hollow King has promised a seat at his table to everyone who has ever been kept out, and the banner is the invitation.',
  },
  {
    id: 'lore:hc-out-of-the-hour', name: 'Out of the Hour', category: 'peoples', source: 'Signy Frosk, aged sixty-one, or forty-one',
    body: 'Some of Glacierhome’s people slipped out of the held hour over the years and came down off the glacier. Time caught up with them the moment they left. Signy Frosk stayed in the hold for twenty years before she walked out, which is why she is younger than her daughter.',
  },
  {
    id: 'lore:hc-rime-wardenhold', name: 'Wardenhold', category: 'places', source: 'Wardenmother Ingeborg Tull',
    body: 'A village of Rime-folk at the foot of Frostmere Pass in Concordia, stranded when the arches shut. Its Wardens have kept their drills for thirty years at a gate that faces nothing. Its Rimecallers kept no archive at all, and remember everything slightly differently, loudly.',
  },
  {
    id: 'lore:hc-winter-tyrant', name: 'The Winter Tyrant', category: 'bestiary', source: 'the Archive’s founding charge, cut into its chest',
    body: 'An ice-king built by the Archive to stand at the White Gate and hold back the cold. It never once came to the Wall’s aid. Hollowed, it wore black icicles for a crown. Beaten, it remembered its charge, and sat down in the snow like an old man at the end of a shift.',
  },
  // ---------- depth pass: codex finds (Glacierhome, the Thaw Road, Claude 2's optional areas)
  {
    id: 'lore:hc-rime-mile-clock', name: 'The Mile-Clocks', category: 'culture', source: 'a brass plate on the Thaw Road', hidden: true,
    body: 'The Archive set a clock on a post at every mile of the Thaw Road, so that travellers would know not only how far they had come but how long it had taken them, which the Archive considered the more important figure.\n\nFor thirty years every mile-clock stood at eleven fifty-two, and the road was empty. When the hold broke they all began to run at once, a little fast, as if they were trying to make up the time.',
  },
  {
    id: 'lore:hc-rime-founders-minute', name: 'The Founders’ Minute', category: 'history', source: 'the Archive’s first minute-book, on its chain', hidden: true,
    body: 'The first meeting of the Archive of the Spire, in C. 0, kept minutes, as every meeting since has done. Eleven were present. The twelfth had gone to Concordia to sign the treaty, and sent word to rule a line beneath the twelve names and leave room.\n\nThe meeting voted to do so, and then voted that nobody should ask who the line was for. The second motion was carried “with feeling”. It is the only entry in a thousand years of minutes to say so.',
  },
  {
    id: 'lore:hc-rime-capital-ruin', name: 'The Stone Reading Room', category: 'history', source: 'a lectern among fallen pillars', hidden: true,
    body: 'Before the Archive was cut into the glacier it kept its books in a stone hall on the slope below, and chained every one to its lectern, because Rimecallers lend nothing. The hall fell in a hard winter four centuries ago. The books were carried up into the ice, all but one, whose chain was found cut. Maudlin Frane has an index card for the missing book. The title on it reads: “Unknown. Overdue.”',
  },
  {
    id: 'lore:hc-rime-capital-cave', name: 'The Year-Ice', category: 'places', source: 'the banded wall of a cave below Glacierhome', hidden: true,
    body: 'A glacier lays down one band of ice for every winter, pale where the snow was heavy, dark where the summer thawed it. Rimecallers read the bands the way foresters read rings. In the caves below Glacierhome they run back a thousand years without a break, until C. 1012, where a single clear band thirty years thick shows a glacier that neither froze nor thawed, but only waited.',
  },
  {
    id: 'lore:hc-rime-capital-survey', name: 'The Surveyor’s Tin', category: 'culture', source: 'notes in a tin below a brass stake', hidden: true,
    body: 'The Archive’s glacier surveyors drive a brass stake into the ice and measure it every year. One of them went on measuring through the held hour, alone, from outside the city, and left a note at every visit. None of the notes is signed.\n\nThe stake has moved one hair’s breadth since it was driven, on the night every clock in Glacierhome ticked once. That was enough to knock the tin off its hook.',
  },
  {
    id: 'lore:hc-rime-capital-view', name: 'The Lamplight Bench', category: 'places', source: 'a brass plate on a bench at the lookout', hidden: true,
    body: 'Every evening of C. 1011 the Regent and her husband walked out to the lookout to watch the lamplighter go up the Spire Stair, one lamp at a time. When Anselm could no longer manage the walk, Seraphine had the bench given to the city, with a plate asking strangers to keep his side free. In thirty years nobody has sat on the left.',
  },
  {
    id: 'lore:hc-rime-boundary-stone', name: 'The Boundary Stone', category: 'culture', source: 'a stone on the gate road, cut with the Wardens’ fin', hidden: true,
    body: '“THE WALL HOLDS TO HERE.” Halfway down the road from the Gatehouse to the White Gate, the stone marks the end of the Wall-Captain’s charge. Wardens walk new recruits down to it on their first posting and walk them back again, so that they know exactly how far their duty runs.\n\nIt is a point of pride that no Captain has ever passed it on duty. It is a point of gossip which Captains have passed it off duty, and why.',
  },
  {
    id: 'lore:hc-rime-frontier-ruin', name: 'The First Postern', category: 'history', source: 'a lone arch below the Wardwall', hidden: true,
    body: 'The first Wardwall was not a wall at all but a line of gate-towers, one every mile, each with a door hung to open inward from the north. The Hundredth Warden built them before he built anything to join them. Only one still stands. Its words, COME IN FROM THE COLD, are the oldest carving on the Wall, and the Gatehouse has never once quoted them.',
  },
  {
    id: 'lore:hc-rime-frontier-cave', name: 'The Captain’s Echo', category: 'places', source: 'scratched by a crack in a Wolfrun cave', hidden: true,
    body: 'A cave in the Wolfrun where the wind sounds the Wardwall’s old recall: long, two short. Generations of Wardens on patrol have heard it, turned for home, and found nobody had called them. They named it the Captain’s Echo. Captains have always said it is only the wind. Wardens have always noted that Captains would say that.',
  },
  {
    id: 'lore:hc-rime-frontier-patrol', name: 'The Snowed-In Patrol', category: 'history', source: 'a log board in a Wolfrun cave', hidden: true,
    body: 'A century ago a Wardwall patrol of six sat out a week-long blizzard in a cave in the Wolfrun on a round of cheese and a great deal of optimism. The log records that they were dug out by the clans. It does not record which clan, by request, because the Captain of the day had forbidden all dealings over the wall, and the patrol wished to go on being alive and employed.',
  },
  {
    id: 'lore:hc-rime-frontier-view', name: 'Both Sides', category: 'places', source: 'the lookout above the Wardwall', hidden: true,
    body: 'From the lookout the Wardwall can be seen end to end, if the weather is kind, with the Gatehouse lights on one side and the steadings of the Jarlsfell on the other. Wardens who climb up here tend to come down quieter. Ingrith Halfmile says it is the height. Grandam Hekla says it is the first time most of them have seen the wall from anywhere but on top of it.',
  },
  // ---------- lair codexes
  {
    id: 'lore:hc-rime-jarl-seat', name: 'The Jarl’s High Seat', category: 'culture', source: 'carved into the arm of the high seat', hidden: true,
    body: 'The old law of the Jarlsfell is cut into the arm of every high seat: “The Jarl eats last.” A Jarl who eats before his hall is fed is no Jarl. When the Frostbound Jarl froze to his seat, his hall-folk went on setting his bowl before him every evening, full, by the law. He never touched one. They never ate until he did.',
  },
  {
    id: 'lore:hc-rime-founders-roll', name: 'The Founders’ Roll', category: 'history', source: 'a slab in the Wraith Barrows', hidden: true,
    body: 'The ninety-nine Wardens who raised the first Wall cut their own names into the founders’ slab, each in their own hand. The Hundredth Warden cut his last, at the foot, and below it began a line: “I built it for”. He never finished it. The barrow-keepers say he meant to come back when he knew, and that he was still deciding when he died.',
  },
  {
    id: 'lore:hc-rime-breach-names', name: 'The Names in the Breach', category: 'characters', source: 'scratched into the ice inside the Breach', hidden: true,
    body: 'On the inside of the Breach, where the patch ice met the stone, Torvald scratched the name of every clan-folk who came through the hole he made: two hundred and twelve of them, the last winter before he was put over the wall. The final name on the list is his own. It has been scratched out, hard, and then written again.',
  },
  {
    id: 'lore:hc-rime-cistern-board', name: 'The Melt Cisterns', category: 'places', source: 'a keepers’ duty board by the sluice', hidden: true,
    body: 'The great reservoir under the Undercrypt, cut to hold the glacier’s spring melt for the city’s taps. Four keepers worked it in shifts, kept a duty board, and cooked a stew every Friday.\n\nSince the hold began it has been Friday for thirty years, and every week the board says the same thing: STEW. Nobody has complained. When the melt turned black, it all came here, and something learned to drink it.',
  },
  {
    id: 'lore:hc-rime-mirror-gallery', name: 'The Mirror Gallery', category: 'places', source: 'a plaque by the gallery door', hidden: true,
    body: 'An Archive gallery of ice-mirrors off the Frozen Market, made to keep faces: each mirror holds the last face that looked into it, for as long as nobody else looks. Families came to keep the faces of the old and the very young.\n\nWhen the hold was cast, the Regent focused it through the Gallery, and every mirror began to keep everything, all at once, and would not let any of it go.',
  },
  {
    id: 'lore:hc-rime-regents-count', name: 'The Regent’s Count', category: 'characters', source: 'a notebook on the sill at the Crown of the Spire', hidden: true,
    body: 'A small notebook in Seraphine Cold’s hand: one column of numbers, from one to ten thousand nine hundred and fifty, a number for every day of the hold. Beside each number, the same word: Held.\n\nBeside the last number the word is different. It has been written, crossed out and written again, and it says: Tired.',
  },
  // ---------- people
  {
    id: 'lore:hc-halla-vint', name: 'Archivist-Superior Halla Vint', category: 'characters', source: 'the Archive, with some reluctance',
    body: 'Head of the Archive of the Spire: precise, dry, and secretly delighted by anything new, of which there has been nothing for thirty years. She cuts the hour-pins that let the hour-walkers move inside the hold, and she has never once worn her own.',
  },
  {
    id: 'lore:hc-seraphine-cold', name: 'Regent Seraphine Cold', category: 'characters', source: 'Glacierhome, quietly',
    body: 'Regent of Glacierhome, the only person permitted to wind the held clocks. Gracious, grey-eyed and very tired. She has held the city’s hour for thirty years, and nobody has ever asked her why that particular minute.',
    sections: [{ id: 'truth', title: 'The minute', body: 'Her husband, Anselm, sits in the room beside hers, one breath from the end. She held the hour so that he would never take it. For a year she has shored up the failing hold with black tears drawn from the Wall’s seep.' }],
  },
  {
    id: 'lore:hc-anselm-cold', name: 'Anselm Cold', category: 'characters', source: 'the court physician’s log, C. 1012', hidden: true,
    body: '“11.52. The Lord Anselm sinking. A breath, perhaps two.” The physician never wrote the next line. Anselm Cold sits in a chair in the room beside the Regent’s, his eyes half closed, one breath from the end, and he has been there thirty years.',
  },
  {
    id: 'lore:hc-dagny-orr', name: 'Wall-Captain Dagny Orr', category: 'characters', source: 'the Wardwall, at volume',
    body: 'Captain of the Wardwall, gruff, fair and half deaf from horn-calls. She has commanded the hero since they could lift a shield. Her runners have been too frightened to ask her to repeat herself for twenty years, and the Wall is full of things nobody asked for.',
  },
  {
    id: 'lore:hc-torvald', name: 'Torvald Wallbreaker', category: 'characters', source: 'the Wardwall, not to his face',
    body: 'A Warden who taught half the Gatehouse to set a shield, the hero among them. Last winter, when the tears first came, he broke the Wardwall at the Breach to let his starving Outland kin through, and the tears came in with them. Dagny branded him Wallbreaker and put him over the wall.',
  },
  // ---------- Sentinels
  {
    id: 'lore:hc-sentinel-colossus', name: 'The Rimeheart Colossus', category: 'bestiary', source: 'its own last words, and the pass',
    body: 'The Sentinel of the Rime school: the ice-giant who held the northern pass open for the crown’s road, for a thousand years of Turnings. When the tears found it, it went on holding, and now it holds the pass shut, travellers and all. Is anyone still coming, it asked.',
  },
];

export default entries;
