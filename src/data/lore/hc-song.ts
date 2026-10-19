/** Hollow Crown codex: Harmonia (Song), shared by the Bard and Skald campaigns. Owner: Claude 4. */
import type { LoreEntry } from '@/core';

const entries: LoreEntry[] = [
  // ---------- the realm
  {
    id: 'lore:hc-harmonia', name: 'Harmonia', category: 'realms', source: 'a Lyrehaven songsheet, sung to the tune of something else',
    body: 'Lilac meadows that hum when the wind crosses them, the realm of the Song school. Song holds that nothing is true until it has been sung, and nothing is over until it has been sung about. Lyrehaven sings in opera houses; the Echoing Fells drum their news from valley to valley.\n\nSince the Song Stone fled the crown, songs have been slipping away, a few a week. Each year Harmonia forgets more tunes. This winter the meadows stopped humming altogether.',
  },
  // ---------- depth pass: codex finds (the roads to the gate, side-quest finds, Claude 2's optional areas, the lairs)
  {
    id: 'lore:hc-bard-hum-stone', name: 'The Hum Stone', category: 'culture', source: 'a menhir on the meadow road', hidden: true,
    body: 'Halfway along the meadow road from Lyrehaven to the Lyre Gate stands a grey menhir with a hollow worn through it at the height of a singer’s mouth. Every traveller to the Turning sang one note into it for luck, and the wind through the meadows carried the note on to the gate ahead of them.\n\nThe meadows have been silent for seven years. The stone still hums, if you stand close enough.',
  },
  {
    id: 'lore:hc-bard-quiet-child', name: 'For a Quiet Child', category: 'books', source: 'a printed sheet in the Conservatory library', hidden: true,
    body: 'A lullaby printed at Lyrehaven at the request of a singer of the Citadel, who would not give a name. It was written, the busker Tobble says, for a baby there who could not hear a note of it. Somebody has written under the music, by hand: “Sing it anyway.”\n\nIt is the only cradle song in the Conservatory’s drawer that nobody claims.',
  },
  {
    id: 'lore:hc-bard-great-metronome', name: 'The Belfry Fork', category: 'magic', source: 'a label on a nail in the Conservatory belfry', hidden: true,
    body: 'At every Turning the Conservatory’s porter climbed the belfry with a brass tuning fork and struck it once from the Song Stone, and set the great metronome by it for the next twelve years. Every metronome in Lyrehaven took its time from that one.\n\nThe fork was last struck at the Turning of C. 1000, and should have been struck again in C. 1012. Struck from half a stone, it will only set the metronome as fast as Andante.',
  },
  {
    id: 'lore:hc-skald-last-echo', name: 'The Last Echo', category: 'culture', source: 'a split boulder where the road leaves the Fells', hidden: true,
    body: 'The Last Echo is the last place on the road south where the Fells will answer you. Skalds going down to the Turning shouted their names into it, so that the Fells would keep them safe until they came home, and when they came home they shouted again to collect them.\n\nThe Fells are still keeping a great many names from C. 1012.',
  },
  {
    id: 'lore:hc-skald-drove-stone', name: 'The Drove Stone', category: 'history', source: 'a rubbing of the oldest stone by the drove track', hidden: true,
    body: 'The oldest of the Saga Stones does not stand in the ring at all. It stands by the old drove track and carries no saga, only a ring of names under one line: “These drove the herds to the Turning, and came home.”\n\nThe Halls forgot it centuries ago, because nobody in it was a hero. Asta rubbed it before it went smooth. Her granny’s granny is on it.',
  },
  {
    id: 'lore:hc-song-capital-ruin', name: 'The Rotunda', category: 'places', source: 'a burned ring on a ruined bandstand', hidden: true,
    body: 'Before he conducted at the Grand Opera, the man Harmonia now calls the Silent Maestro gave free concerts every summer in the Rotunda in the park, and all Lyrehaven came to hear him.\n\nThe Rotunda fell in the year he put down his baton. In the conductor’s circle on its floor there is a perfect black ring, burned into the boards, where nothing will grow.',
  },
  {
    id: 'lore:hc-song-capital-cave', name: 'The Grotto of Lost Songs', category: 'culture', source: 'titles scratched in a grotto under the Opera gardens', hidden: true,
    body: 'When a busker in Lyrehaven loses a song for good, it is the custom to go down into the grotto under the Opera gardens and scratch its name on the wall, so that at least the name is kept. Some of the oldest have their tunes scratched under them as well.\n\nThe custom is older than the Hollowing. The walls were only half full in C. 1012. They are nearly full now.',
  },
  {
    id: 'lore:hc-song-capital-learn', name: 'Learn This', category: 'culture', source: 'a song scratched in full at the back of the grotto', hidden: true,
    body: 'At the very back of the Grotto of Lost Songs, one song has been scratched out in full, every word and every note, by somebody who would not let it be lost, and under it, three times over, in letters as high as they could reach: LEARN THIS.\n\nNobody knows who wrote it there. A great many buskers now know the song.',
  },
  {
    id: 'lore:hc-song-capital-view', name: 'The Dome Walk', category: 'places', source: 'a plaque on the Opera dome', hidden: true,
    body: 'The narrow walk round the dome of the Grand Opera was built for the lamp-men, and it has the finest view in Lyrehaven: the Quarter, the Steps, the Conservatory and the meadows beyond.\n\nA brass plaque claims that Rosalind Vell’s top C was heard from here on the Echoing Fells in C. 1019. The Fells deny it. Rosalind says the Fells would.',
  },
  {
    id: 'lore:hc-song-frontier-ruin', name: 'The Last Relay', category: 'history', source: 'a split war-drum in a burned drum-tower', hidden: true,
    body: 'The drum-towers of the Fells carried every message from the Lyre Gate to the highest stead in a single night. On the night the gate shut in C. 1012, this tower drummed the news until it caught fire from its own beacon.\n\nIts last message is cut into the rim of the split war-drum in the ashes: THE GATE IS SHUT. TELL THE FELLS. TELL EVERYONE.',
  },
  {
    id: 'lore:hc-song-frontier-cave', name: 'The Answering Cave', category: 'places', source: 'voices in a cave on the high Fells', hidden: true,
    body: 'Speak in this cave and it answers in other people’s voices: Skalds beginning sagas, shepherds laughing, children counting. None of them ever finishes. The Fells keep what is said on them, the Skalds say, and this cave keeps the beginnings.\n\nNovices are sent here to practise, because the cave is the only audience on the Fells that never interrupts.',
  },
  {
    id: 'lore:hc-song-frontier-practice', name: 'A Boy’s Practice Wall', category: 'characters', source: 'drum-marks in the Answering Cave', hidden: true,
    body: 'Low on the back wall of the Answering Cave, at a child’s height, somebody tapped drum-marks into the soft stone with a knuckle, nine hundred little groups of them: every saga in the Saga Halls, drummed once each, in order.\n\nAt the end, scratched with a pebble: ALL OF THEM. U. The cave does not answer drumming. It never has. He did it anyway.',
  },
  {
    id: 'lore:hc-song-frontier-view', name: 'The Long Look', category: 'places', source: 'the summit cairn of the highest fell', hidden: true,
    body: 'From the top of the highest fell you can see every Drum-Stead in Harmonia at once, each one a thread of smoke, and the ring of the Saga Stones, and far to the south the Lyre Gate.\n\nThe summit cairn has every stead’s name cut round it in a ring, with an arrow pointing south, so that whoever stands here can see who would hear them if they drummed.',
  },
  {
    id: 'lore:hc-choir-phantom', name: 'The Choir Phantom', category: 'bestiary', source: 'the chorus register in the choir loft', hidden: true,
    body: 'On the Opera’s last night, in C. 1035, the Maestro took the chorus’s voices with the rest, and the chorus walked out into the night and did not come back. Their choirmaster stayed behind in the loft to rehearse until they did.\n\nHe is still rehearsing. He has forgotten why, and he has forgotten their faces, and every busker who stops to listen forgets a tune to keep him company.',
  },
  {
    id: 'lore:hc-grand-organ', name: 'The Grand Organ', category: 'bestiary', source: 'the builder’s plate on its console', hidden: true,
    body: 'The Conservatory’s Grand Organ was built three centuries ago with pipes that run up behind every wall, so that the whole building could sing with it. Its builder left a plate on the console: “Feed it music, not musicians.”\n\nSomebody, seven years ago, showed twelve choristers into its pipes and told them it would only be for one night.',
  },
  {
    id: 'lore:hc-lucky-board', name: 'The Lucky Board', category: 'culture', source: 'names on the underside of the stage', hidden: true,
    body: 'Every singer who ever made a debut at the Grand Opera crawled under the stage the night before and scratched their name on the underside of the centre board, for luck. Three hundred years of names, and the Opera half lying under all of them in the dust.\n\nThe last name on the board is Rosalind Vell’s, with one small word beside it, which she has never admitted to writing.',
  },
  {
    id: 'lore:hc-hoddersgill-toasts', name: 'The Hoddersgill Toasts', category: 'culture', source: 'a slate behind the high seat of Hoddersgill Hall', hidden: true,
    body: 'Hoddersgill Hall has chalked every toast it ever drank on the slate behind its high seat, so that nobody need drink the same one twice in a winter. A hundred years of toasts: to brides, to ewes, to the end of a bad winter, to the Turning that never came.\n\nThe Discord wrote the last line, and wiped the slate clean under it. The hall has started again from the top.',
  },
  {
    id: 'lore:hc-ragnas-messages', name: 'Come Home', category: 'characters', source: 'drum-hide strips in the Harpy Roost', hidden: true,
    body: 'For seven years Ragna Saga-Keeper sent a drum-message by harpy every month to the Lyre Gate, in the long-message knots she taught her saga-children, all saying the same thing. The harpies never delivered one of them. Shriek-Mother lined her nest with the lot.\n\nRagna has never told anybody she sent them. She may no longer remember that she did.',
  },
  {
    id: 'lore:hc-echo-barrow', name: 'The Echo Barrow', category: 'places', source: 'runes round the first Skald’s plinth', hidden: true,
    body: 'The barrow of the first Skald lies under the ring of the Saga Stones, and every sound made in it comes back three times. The first Skald explained why, in runes round his own plinth: a saga should be sung once for the living, once for the dead and once for the ones not yet born.\n\nFor a thousand years the Fell half lay in his stone hands, and the barrow sang its note three times a night.',
  },
  {
    id: 'lore:hc-grand-opera', name: 'The Grand Opera', category: 'places', source: 'Signora Rosalind Vell, at length',
    body: 'Four thousand seats, eleven chandeliers and the best echo in Harmonia. When the crown broke, half of the Song Stone fell through its roof during an overture, and the conductor kept going.\n\nSeven years ago its Maestro conducted his last night there, and at the final bar he turned his baton on the stage. The Opera has been silent ever since. Its prima donna still sleeps in her dressing room.',
  },
  {
    id: 'lore:hc-conservatory', name: 'The Conservatory', category: 'factions', source: 'Rector Isadora Quaver, from the prospectus',
    body: 'The music school of Lyrehaven, and the Bards’ own house. It has catalogued some four thousand songs, and lost count of the ones it could not save. Its practice rooms have been going quiet one by one. Its motto, over the door: A song not written down is a rumour.',
  },
  {
    id: 'lore:hc-discord', name: 'The Discord', category: 'factions', source: 'Verity Hush, who said it without speaking',
    body: 'Musicians, in Lyrehaven and on the Fells, who believe silence is the purest song. They wear grey, play lutes with no strings, and hold that every song should be sung once, beautifully, and then let go. Some of them only want the dead to rest. Some of them take a hall’s voice whether it wants to rest or not.',
  },
  {
    id: 'lore:hc-saga-halls', name: 'The Saga Halls', category: 'factions', source: 'Hall-Reeve Brynja',
    body: 'The Skalds of the Echoing Fells, who keep nine hundred sagas: they cut them on the Saga Stones, drum them at every feast and argue about them always. A Skald who agrees with another Skald, the Halls say, has stopped listening. Ragna Saga-Keeper is their eldest.',
  },
  {
    id: 'lore:hc-echoing-fells', name: 'The Echoing Fells', category: 'places', source: 'Old Gunnvor, at the foot of Scarrow Pike',
    body: 'Lilac fells where a shouted word comes back changed. The Fells keep what is said on them: a sentence started on a summit forty years ago will still be waiting there for someone to ask for the end of it. News is drummed from stead to stead along the drum-relay, and comes out the far end improved.',
  },
  {
    id: 'lore:hc-saga-stones', name: 'The Saga Stones', category: 'places', source: 'carved on the first of them',
    body: 'A ring of standing stones on the Fells, carved with the sagas of Harmonia. Since the Hollowing they have been wearing blank faster than the Halls can cut them. One stone in the ring has never been carved. The Halls say it waits for a saga not yet sung.',
  },
  {
    id: 'lore:hc-great-metronome', name: 'The Great Metronome', category: 'history', source: 'Porter Crotchet, who winds it',
    body: 'The brass metronome of the Lyrehaven Conservatory, taller than a house, from which every metronome in the city takes its time. It stopped dead on the downbeat on the night the crown broke, and it ticks only when the Song Stone sings: it was never kept in time by its spring at all.',
  },
  {
    id: 'lore:hc-first-skald', name: 'The Echo Barrow', category: 'history', source: 'the Saga of the First Skald, abridged',
    body: 'The barrow of the first Skald, under the Saga Stones, where every word comes back three times. She is carved sitting, with a drum on her knees and her stone hands held out, and for thirty years the Fell half of the Song Stone lay in them. When it was lifted, the barrow fell silent for the first time.',
  },
  {
    id: 'lore:hc-silent-maestro', name: 'The Silent Maestro', category: 'characters', source: 'every busker in Harmonia, quietly',
    body: 'Once the Maestro of the Grand Opera. When the songs began to slip away he stopped conducting music and began collecting voices: a prima donna’s, a drummer’s, a whole choir’s. Now he stands at the Lyre Gate conducting silence, and his baton drips black.\n\nWhen he falls, the stolen voices fly home.',
  },
  // ---------- mentors and nemeses
  {
    id: 'lore:hc-rosalind-vell', name: 'Signora Rosalind Vell', category: 'characters', source: 'Lyrehaven, fondly and with some exasperation',
    body: 'The greatest soprano of her age, as she will tell you. As a girl she sang the Turning Bell’s descant at the Abbey. She has not sung in seven years, and says she is resting the voice. She keeps a pug called Encore, a hundred jars of honey and a regrettable series of commemorative plates.',
  },
  {
    id: 'lore:hc-blaise-marchetti', name: 'Impresario Blaise Marchetti', category: 'characters', source: 'the Busking Steps',
    body: 'A gracious, funny impresario in a lilac coat who arrived in Lyrehaven on the Tuesday coach and bought every good song left in the city. He knows every busker’s name. He never asks to hear a song twice. Once, he says, is forever, if it is done properly.',
  },
  {
    id: 'lore:hc-ragna-saga-keeper', name: 'Ragna Saga-Keeper', category: 'characters', source: 'the Saga Halls',
    body: 'The eldest Skald of the Fells, who knows nine hundred sagas and is losing one a week. She raised two children in the Saga Hall: one who could sing every saga, and one who could not sing at all. She would sooner lose a king’s saga than a shepherd’s.',
  },
  {
    id: 'lore:hc-ulf-the-unsung', name: 'Ulf the Unsung', category: 'characters', source: 'the Drum-Steads',
    body: 'Born Unsung, with no spark of any school, and raised by Ragna in the Saga Hall. He learned all nine hundred sagas by heart and drummed them, because they would not ring in his mouth. Seven years ago he walked to the Lyre Gate and the Silent Maestro took the little voice he had. Now he talks with his drum.',
  },
  {
    id: 'lore:hc-marchettis-score', name: 'Marchetti’s Score', category: 'history', source: 'a workshop under the Opera stage', hidden: true,
    body: 'Every song the Impresario bought, learned once, written into one enormous score in black-tear ink that will never fade, and then the original burned. The last page has no last bar. Across the bottom: For the Opera half. To be played once, and forever, so that nobody will ever need another song.',
  },
  {
    id: 'lore:hc-weeping-runes', name: 'The Weeping Runes', category: 'history', source: 'Ulf’s message, in his own knots', hidden: true,
    body: '“To the King in the Heart, from one Unsung to another. I have cut them in tears. They will never wear. Nobody will ever have to sing them again, so nobody can be left out of the singing.”\n\nUlf re-cut the worn sagas in black tears, so they would weep and never fade.',
  },
  {
    id: 'lore:hc-nine-hundredth-saga', name: 'The Nine-Hundredth Saga', category: 'books', source: 'Ragna Saga-Keeper, who never drummed it in the Hall', hidden: true,
    body: 'He was nine. He could not sing a note, so he climbed Scarrow Pike every night and drummed every saga he knew at the sky, so that the Fells would sing them back to him in a voice.',
  },
  {
    id: 'lore:hc-tobbles-lullaby', name: 'Tobble’s Lullaby', category: 'culture', source: 'Old Tobble, the One-Note Busker', hidden: true,
    body: 'Seven notes down, a rocking phrase, four notes rising like a question, and one last note. Tobble’s master had it from a singer who had been to the Citadel. It was written, they said, for a baby there who could not hear a note of it: an Unsung child. Somebody sang to it anyway.',
  },
  // ---------- Concordia
  {
    id: 'lore:hc-song-exiles', name: 'The Song-folk of Abbeyshore', category: 'places', source: 'Precentor Eulalie Marchbank and Hallgerd Drum-Wife',
    body: 'Lyrehaven singers and Fells drummers stranded at Abbeyshore since the arches shut in C. 1012. Every dusk the singers sing to the drowned choir from the Shore Chapel, in songs thirty years out of date and still in tune. Every night the drummers drum the choir’s forty names from the Old Fish Mill, so that someone is still saying them.',
  },
  {
    id: 'lore:hc-song-sentinel', name: 'Abbess Morwen and her Choir', category: 'bestiary', source: 'the Shore Chapel and the Fish Mill',
    body: 'The Sentinel of the Song school is the Abbey’s choir: forty brothers who drowned singing round their Abbess when the lake came up over the Turning Bell. Abbess Morwen leads them, and so Morwen is the Sentinel of two schools, Radiance and Song.\n\nShe would not let the Bell be rung out of turn. All she ever asked was whether it could be rung gently, once, the way it was meant to be.',
  },
  {
    id: 'lore:hc-bard-willow', name: 'The Weeping Willow, adagio', category: 'bestiary', source: 'a Bard’s notebook',
    body: 'The Sentinel of the Verdant school: the willow planted at the founding of the Concord, at Stag’s Rest in the Gloamwood. It drank from the same black tears as the Stag, and wept them into the wood. An impresario recorded its weeping with brass horns as the last movement of a song with no ending. A tree, the Hedgewitches say, needs a song slow enough to hear: one note a breath.',
  },
  {
    id: 'lore:hc-skald-stag', name: 'The Saga of the White Stag', category: 'bestiary', source: 'drummed in the Deep Glade',
    body: 'The Sentinel of the Hunt school: the Stag that led the Turning procession through the Gloamwood, every twelve years, for a thousand years, lanterns on its antlers. In C. 1012 the procession waited for a crown that never came. The Stag was not sick, Nan Briar said. It was grieving. Nobody had told it its own saga in thirty years.',
  },
  // ---------- wave 2 depth pass: Act II finds
  {
    id: 'lore:hc-bard-marchbank-descant', name: 'Marchbank’s Descant', category: 'culture', source: 'Precentor Eulalie Marchbank, on the old Abbey landing', hidden: true,
    body: 'At every Turning the Abbey asked Lyrehaven for a singer to take the descant of the passing hymn. In C. 1012 Lyrehaven sent Eulalie Marchbank. She was in the ferry, halfway over the lake, when the Bell began to ring and would not stop, and the ferryman turned back.\n\nFor thirty years the drowned choir left four bars empty in the fourth verse, every dusk, for a descant that never arrived. The choir lets the descant in. It always did.',
  },
  {
    id: 'lore:hc-bard-last-movement', name: 'The Last Movement', category: 'books', source: 'a writing-desk under a lilac awning above Stag’s Rest', hidden: true,
    body: 'Marchetti’s last movement, recorded from the Weeping Willow through three brass horns: weeping, adagio, sixty pages and no double bar. On the last page a rest has been written into the final bar three times, and crossed out three times, each stroke harder than the last.\n\nPinned beneath it, a Legion fitting-slip: width of back, to take the coat; length of tail, to take the baton; heart, to be fitted last. In lilac ink underneath: “Thank you, gentlemen. Do take a biscuit.”',
  },
  {
    id: 'lore:hc-bard-playbill', name: 'The Last Performance (a playbill)', category: 'culture', source: 'nailed to the Weeping Willow’s root', hidden: true,
    body: 'THE LAST PERFORMANCE. The Twelve Stairs, the Heart of Morvane. Conducted by B. Marchetti, with the Legion Orchestra. No interval. No ending. Admission: everything.\n\nPrinted in Lyrehaven, by the date on it, before the Opera half was ever lifted, on the same press as the gala tickets the touts were selling. One complimentary seat was reserved, front row, centre, and made out by name. On the back, in lilac ink: “Darling, do come. You will be the only one listening.”',
  },
  {
    id: 'lore:hc-skald-mill-pegs', name: 'The Forty Pegs', category: 'culture', source: 'the loft of the Old Fish Mill, Abbeyshore', hidden: true,
    body: 'Round the walls of the Fish Mill loft the Fells exiles hung forty pegs, one for every brother of the drowned choir, each tied with a strip of cloth bearing his name. Every night for thirty years they drummed the names from peg to peg in the long-message beat.\n\nThree strips were lost one winter, with the three old drummers who alone had learned them. After that the ring kept three silences each night, the right size, so the names would fit when they came home.',
  },
  {
    id: 'lore:hc-skald-ulf-road', name: 'Ulf’s Road', category: 'characters', source: 'a drum-hide strip in a hollow of the Deep Glade', hidden: true,
    body: 'A strip of drum-hide as long as a man, knotted end to end in the Saga Halls’ hand-knots: every stage of the old Turning procession from the Gloamwood to the Heart, with a tally of nights beside each. Ulf knotted it from memory, out of the sagas, before the White Stag ever walked beside him. The last knot is the Citadel door.\n\nUnder his bracken bed lay a square of birch-bark, carved and scraped smooth a dozen times. It says ULF, and nothing after.',
  },
];

export default entries;
