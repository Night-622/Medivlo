/** Hollow Crown codex: Mountainreach (Fist), shared by the Monk and Brawler campaigns. Owner: Claude 4. */
import type { LoreEntry } from '@/core';

const entries: LoreEntry[] = [
  // ---------- the realm
  {
    id: 'lore:hc-mountainreach', name: 'Mountainreach', category: 'realms', source: 'a pilgrim’s guide, with every stair numbered',
    body: 'Highland terraces and mountain monasteries, the realm of the Fist school, where every path is a stair. Fist teaches that the self is the only weapon you cannot drop. Monks train in Stonecloister; Brawlers fight for coin and glory in the Lowfold Pits.\n\nThe 85th Turning should have crowned Fist. Its champion, Master Doran Kell, was on the road to Concordia when the gates shut. He climbed home, crowned himself the Mountain King, and has sat on a throne carved from the summit for thirty years, waiting for what he was owed.',
    related: ['lore:hc-mountain-king'],
  },
  // ---------- depth pass: Stonecloister codex finds (the gate road, Claude 2's optional areas, the lairs)
  {
    id: 'lore:hc-monk-kell-stone', name: 'The Listening Stone', category: 'history', source: 'tally-marks on a boulder on the gate road', hidden: true,
    body: 'On the road to the crowning in C. 1012, at a bend below the Stair Gate, Master Doran Kell stopped, and stood still, and heard the gates of Concordia closing far ahead. Then he turned round and ran home before they could close on him.\n\nEvery year since, until the night of the Bell, somebody has come down to the boulder at that bend and walked round it in the dark, and scratched one more mark on its top. The first mark has a word beside it: LISTENED.',
  },
  {
    id: 'lore:hc-fist-capital-ruin', name: 'The First Cloister', category: 'history', source: 'a rule carved in a ruined cell', hidden: true,
    body: 'The Fist school began as one hermit in one cell cut into the mountain, who taught that the self is the only weapon you cannot drop, and so the one you must learn to put down. Pilgrims climbed to hear him, and stayed, and the cloister grew up the Stairs around them.\n\nThe hermit’s cell is a ruin now. Somebody, centuries later, carved one word under his rule. The Fist school has been answering it ever since, and has never agreed.',
  },
  {
    id: 'lore:hc-fist-capital-cave', name: 'The Stillness Pool', category: 'culture', source: 'a rule carved at a pool’s edge', hidden: true,
    body: 'Before a novice of Stonecloister may take the grey, they sit at the Stillness Pool in the cave below the cloister until the water forgets they are there: until not one ripple comes from them. It takes most novices three or four days.\n\nThe rock round the pool is worn into ridges by a thousand years of fidgeting. The novices call them the Abbess’s Rings, because Shirin Tal, as a girl, is said to have made most of them.',
  },
  {
    id: 'lore:hc-fist-capital-tally', name: 'The Pebbles', category: 'culture', source: 'pebbles on a ledge above the Stillness Pool', hidden: true,
    body: 'When a novice finally stills the pool, they scratch their name and the number of days it took on a pebble and leave it on the ledge above. The ledge holds thousands.\n\nOne pebble says forty-one days, the longest ever. Beside it is one with no name, which says only “Gave up”, and beside that, in a child’s hand, one that says “Came back.” The novices touch the last one for luck before they sit.',
  },
  {
    id: 'lore:hc-fist-capital-view', name: 'The Thousand Stairs', category: 'places', source: 'seen from a viewpoint above the cloister', hidden: true,
    body: 'The Thousand Stairs climb from the valley floor to the summit of Mountainreach, with a landing and a tea stall every hundred steps, and every stall kept by the same family for generations. Novices sweep them every night, all thousand, and are told to mind step six hundred and eleven.\n\nNobody remembers why that step is cracked, or why it has never been mended. The oldest stall-keepers say it has always been like that, and that it hums.',
  },
  {
    id: 'lore:hc-fist-guardian-hall', name: 'The Guardian Hall', category: 'places', source: 'an inscription on the Guardian’s plinth', hidden: true,
    body: 'The Temple Guardian was carved nine hundred years ago to stand in the hall below the Bell Courts and let up the mountain only those who climbed it for the right reasons. It judges by stillness: a pilgrim who can stand before it without fear may pass.\n\nSince the tears filled its eyes, it has seen nobody as worthy. Novices bound for the Bell Courts have been turned back weeping, and only those going down, towards the King, have been allowed through.',
  },
  {
    id: 'lore:hc-fist-silent-cell', name: 'The Silent Cell', category: 'places', source: 'the cell-roll of the Silent Cell', hidden: true,
    body: 'The old Abbot of Stonecloister retired to the Silent Cell in C. 1012, to meditate on what Fist had been owed. He took the summit key with him, so that nobody could go up to the empty throne until he had an answer.\n\nThe cell-roll records every meditation held in the Silent Cell for six hundred years, each with a topic and a length. His has no length. It has thirty years of entries, in nine different hands, all his.',
  },
  {
    id: 'lore:hc-fist-summit-shrine', name: 'The Summit Shrine', category: 'places', source: 'words cut over the summit niche', hidden: true,
    body: 'At the very top of Mountainreach, above the Mountain King’s throne, is a niche in the rock no bigger than a cupped hand, where the Summit half of the Fist stone came to rest. The first monks cut the school’s oldest teaching over it, so that nobody who climbed so far could miss it.\n\nIt says that there is nothing at the top of the mountain that you did not carry up yourself. Thirty years of Climbers have read it, and gone back down, and climbed again.',
  },
  // ---------- depth pass: Lowfold codex finds (the gate road, Claude 2's optional areas, the lairs)
  {
    id: 'lore:hc-brawler-last-corner', name: 'The Last Corner', category: 'culture', source: 'a stone bench on the Stair Gate road', hidden: true,
    body: 'At every Turning the Lowfold sent its champions up the Stair Gate road to fight in Concordia, and each one stopped at a stone bench halfway up to have their hands wrapped by their cornerman. Both names were cut into the bench, the fighter’s and the corner’s, side by side.\n\nThe Lowfold says a fighter is only as good as their corner. The bench is the only place in Mountainreach where that was ever written down. The last pair of names before yours is dated C. 1000.',
  },
  {
    id: 'lore:hc-fist-frontier-ruin', name: 'The First Ring', category: 'history', source: 'a corner-stone in a ruined ring', hidden: true,
    body: 'Before the Pit Leagues, before belts and purses and promoters, the Lowfold settled its arguments in a square of four standing stones in a field. The rule was cut into the corner-stone: two go in, two come out.\n\nIt meant that nobody was to be left in the ring. It has been read, since the outlaw rings opened in the quarries, as a promise that has been broken.',
  },
  {
    id: 'lore:hc-fist-frontier-cave', name: 'The Towels', category: 'culture', source: 'cornermen’s marks in a cave', hidden: true,
    body: 'In the old outlaw days the Lowfold’s fighters hid between bouts in a cave above the Pits, and their cornermen marked its wall with a little scratched towel every time they threw one in to save a fighter from worse. It was not a mark of shame. It was a tally of people who got to go home.\n\nThe newest towel on the wall is very old. Pops Knuckle, asked about the cave, says only that he knows where it is.',
  },
  {
    id: 'lore:hc-fist-frontier-tally', name: 'The Cornerman’s Five Rules', category: 'culture', source: 'a slate in the Corner Cave', hidden: true,
    body: 'Water, not too much. Look at the eyes. Tell them one thing, and make it true. Throw the towel before they would. Be there when they wake up.\n\nEvery cornerman in the Lowfold learns the five rules, and most of them say the fifth is the hard one. Somebody has written as much on the slate in the cave, in a second hand. Doc Lint says she knows whose hand. She will not say.',
  },
  {
    id: 'lore:hc-fist-frontier-view', name: 'The Rings of the Lowfold', category: 'places', source: 'seen from a viewpoint above the Pits', hidden: true,
    body: 'From high on the valley side you can count the Lowfold’s rings: forty village rings in the fields, the Grand Pit in the middle, and the outlaw rings in the quarries, which are lit at all hours and have no names. The village rings fight on harvest nights. The outlaw rings never stop.\n\nFrom the viewpoint you can also see what nobody in the Pits can: a tunnel mouth in the deepest quarry, running towards the Stair Gate.',
  },
  {
    id: 'lore:hc-fist-broken-fist-dojo', name: 'The Broken Fist Dojo', category: 'places', source: 'a bout-sheet on the dojo wall', hidden: true,
    body: 'The Master of the Broken Fist threw the Lowfold final of C. 1022 for a bag of coin, broke his right hand doing it, and never had it set. He opened a dojo on the Goat Paths soon after, for young fighters who had been beaten and had nowhere else to go.\n\nThe bout-sheet from the thrown final hangs framed on his wall, with the result crossed out and rewritten in his own hand: “Lost. Paid. Sorry.”',
  },
  {
    id: 'lore:hc-fist-grand-pit', name: 'The Grand Pit', category: 'places', source: 'the roll of champions in the Grand Pit', hidden: true,
    body: 'The Grand Pit is an old quarry floor ringed with stone benches for four thousand, where the Lowfold’s champion is crowned with a belt every harvest. Big Mother Ox has held the belt for nineteen years.\n\nThe roll of champions is painted on the Pit wall. The year C. 1009 has two names against it, which happens in no other year: Doran Kell, who won, and Tobiah Knuckle, who knocked him down first.',
  },
  {
    id: 'lore:hc-fist-quarry-throne', name: 'The Quarry Throne', category: 'places', source: 'a price-list by the Quarry Throne', hidden: true,
    body: 'In the deepest quarry of the Lowfold, at the heart of the outlaw rings, Silas Gaunt built a throne of cut stone and set the Pit half of the Fist stone under it, because a half-stone stops the tears where it lies. His was the only ring in the Lowfold where nobody went hollow.\n\nHe sold places in it by the hour. The price-list by the throne is very neat. It goes up every week.',
  },
  {
    id: 'lore:hc-mountain-king', name: 'The Mountain King', category: 'characters', source: 'Stonecloister, and the Lowfold, who tell it differently',
    body: 'Master Doran Kell, champion of Fist, who should have been crowned the Fist Concordant in C. 1012. Ever since, from his summit throne, he has called it a robbery. On the night the Drowned Bell rang he came down from the throne to sit on the last stair before the Stair Gate, and he has not moved since. His beard froze into a black crown.\n\nIn C. 1009 he was knocked down once, in the fourth round of the Lowfold championship, by a small man who now sells noodles.',
  },
  {
    id: 'lore:hc-kell-turned-back', name: 'What Happened on the Road', category: 'history', source: 'Abbess Shirin Tal, his second; and his porter, Bodhan Kreel', hidden: true,
    body: 'In C. 1012, on the road to Concordia, Doran Kell heard the gates beginning to shut far ahead, like a great door swinging. He could have run for them. He stood very still, and then he turned and ran home, before they closed. He has called it a robbery for thirty years, because the other word was harder.',
  },
  {
    id: 'lore:hc-thirty-moves', name: 'The Thirty Moves', category: 'culture', source: 'scratched into the arm of an empty throne', hidden: true,
    body: 'For thirty years Abbess Shirin Tal sent Doran Kell one move a year in a game of stones, by messenger, and he never replied. He did reply. Every move is scratched into the arm of his summit throne, thirty of them, the last answering a move he could not have seen. He never sent one down. He would have had to come down with it. They have both been cheating throughout.',
  },
  // ---------- Stonecloister
  {
    id: 'lore:hc-thousand-stairs', name: 'The Thousand Stairs', category: 'places', source: 'the night-sweep’s instructions',
    body: 'The stair-city of Stonecloister, climbing the mountain in a thousand steps, with prayer flags on every landing and a tea stall on most of them. Novices sweep it every night and carry the Abbess’s tea up it every day, pouring a cup on each landing. Step six hundred and eleven has a crack in it. Mind it.',
  },
  {
    id: 'lore:hc-high-monastery', name: 'The High Monastery', category: 'factions', source: 'the Bell Courts’ cell-roll',
    body: 'The Monks of Stonecloister, where the self is trained into stillness. Its great bell has rung every dawn for four hundred years. Its Temple Guardian has judged the worthy on the mountain road for nine hundred. Since the Bell, half its cells are empty, and every leaver has left a note on their mat, because that is the rule.',
  },
  {
    id: 'lore:hc-kings-climbers', name: 'The King’s Climbers', category: 'factions', source: 'a grey robe, folded',
    body: 'The Mountain King’s monk-army, in grey, who carry the cloister’s rice up the mountain to a King who does not eat it, and recruit in the valleys for the day Fist is paid what it was owed. Many of them were Stonecloister novices. Their signal is three handfuls of juniper on a cairn, and a whistle.',
  },
  {
    id: 'lore:hc-ninefold-abbot', name: 'The Ninefold Abbot', category: 'characters', source: 'the Silent Cell, which was not',
    body: 'An old abbot who shut himself in the Silent Cell in C. 1012 to meditate on what Fist was owed, and meditated so hard he split into nine: anger, hunger, doubt, mirth and the rest, all arguing. The ninth was his grief, and it wept black. When the others were gone he cried for a while, unlocked the summit door, and went to have something to eat.',
  },
  // ---------- the Lowfold
  {
    id: 'lore:hc-lowfold-pits', name: 'The Lowfold Pits', category: 'places', source: 'a Knuckletown fight card',
    body: 'The valley fight-country of Mountainreach: village rings in barns, the bunting and bookies of Knuckletown, the Grand Pit, and, in the abandoned quarries, the outlaw rings. In the Lowfold the self is trained by getting hit. The whole sport, as any cornerman will tell you, is getting up.',
  },
  {
    id: 'lore:hc-pit-leagues', name: 'The Pit Leagues', category: 'factions', source: 'League Steward Bess Plummet',
    body: 'The Brawlers and their promoters, who run the lawful rings of the Lowfold under League rules, for the League belt and the League’s good name. League coin is dry. The stewards check.',
  },
  {
    id: 'lore:hc-grand-pit', name: 'The Grand Pit', category: 'places', source: 'the champion’s board',
    body: 'The champion’s arena of the Lowfold, held for nineteen years by Big Mother Ox, who could not lie down. The tears pooled under her feet like roots and would not let her fall, and she was frightened of what the Promoter did with losers. When she fell at last, someone caught her.',
  },
  {
    id: 'lore:hc-quarry-names', name: 'The Names on the Wall', category: 'history', source: 'a cell under the old quarry crane',
    body: 'Two hundred and twelve names, scratched into the wall of the cell where Silas Gaunt kept beaten fighters before they went through the tunnel under the Stair Gate to the Hollow Legion. Pops Knuckle has read every one aloud. People come back to their names, he says.',
  },
  // ---------- mentors and nemeses
  {
    id: 'lore:hc-shirin-tal', name: 'Abbess Shirin Tal', category: 'characters', source: 'every novice who ever lost to her at stones',
    body: 'Abbess of the High Monastery: serene, mischievous, and the finest cheat at stones in Mountainreach. She found the hero and Kestrel in one basket on the same stair in the same winter. Thirty years ago she walked the road to Concordia as Doran Kell’s second, and came back up it at a run. She has not left the cloister since.',
  },
  {
    id: 'lore:hc-kestrel', name: 'Brother Kestrel', category: 'characters', source: 'a note on a sleeping-mat, never delivered',
    body: 'The hero’s foster-brother, who was holding their foot in the basket. He left the cloister to serve the Mountain King, believing Fist was robbed and should take the crown now. He is funny, generous and sad, gives every novice a sweet and remembers every name. His prayer beads went black first. He still counts them.',
  },
  {
    id: 'lore:hc-tobiah-knuckle', name: '“Pops” Tobiah Knuckle', category: 'characters', source: 'the back of a noodle menu',
    body: 'A retired champion of the Lowfold who knocked down Doran Kell in C. 1009 and never wore the belt again. He runs a noodle cart and a cornerman’s stall in Knuckletown, and his stock has been simmering since C. 1003. In forty years in a corner he threw in the towel once, to save a sixteen-year-old’s eye.',
  },
  {
    id: 'lore:hc-silas-gaunt', name: 'Silas Gaunt, the Promoter', category: 'characters', source: 'his own ledger, very neat',
    body: 'The Promoter of the Lowfold’s outlaw pits: silk scarf, kind eyes, a small scar under the right one. As a boy he had a left hook like a door slamming. His cornerman threw in the towel to save his eye, and the next morning his promoter sold his contract for the loss, and he learned that nobody fights for you. He sells beaten fighters to the Hollow Legion by the head, and writes every name down.',
  },
  // ---------- Concordia and the Sentinel
  {
    id: 'lore:hc-fist-welcome-hall', name: 'The Welcome Hall', category: 'places', source: 'Brother Faraj Stillwater, with a broom',
    body: 'The Fist embassy-cloister in Briar Hollow, half sunk in the bog. Six monks came ahead in C. 1012 to prepare Doran Kell’s crowning, and they have swept its welcome hall every morning since. He is late. They know. They sweep anyway.',
  },
  {
    id: 'lore:hc-fist-cellar-ring', name: 'The Cellar Ring', category: 'places', source: 'Moll Treadwell, on a crate, with a bell',
    body: 'A rope ring in the cellar under the Briar & Kettle in Thornhollow, run on Saturdays by Lowfold fighters who came through for an exhibition bout in C. 1012 and were stranded when the arches shut. Gloves on, grudges off. Nan Briar comes to watch, and bets on the small ones.',
  },
  {
    id: 'lore:hc-sentinel-sovereign', name: 'The Ooze Sovereign and the Stone Abbot', category: 'bestiary', source: 'the Stone Abbot, a little damp',
    body: 'The Sentinel of the Fist school was the Stone Abbot, who walked ahead of every crown on the Turning Road and kept the road still. When the tears came, and the bog came, he sat down, because he was very good at sitting. Something ate him: the Ooze Sovereign, the Slime King of Briar Hollow grown into a sovereign. It wore his discipline, and fought like a monk, and taught the slimes of the Hollow his forms, very badly.\n\nFreed, the Stone Abbot said only: I have been very patient.',
  },
];

export default entries;
