# Song: Harmonia (Bard and Skald)

Realm: [02-realms.md § Harmonia](../02-realms.md). Gate boss: **the Silent Maestro** at the Lyre Gate. Morvane Sentinel A: **Abbess Morwen** (shared with Radiance).

---

# BARD: *Is a song you only sing once worth more?*
| | |
|---|---|
| Start | `area:song-capital`, Lyrehaven |
| Mentor | **Signora Rosalind Vell** (`npc:rosalind-vell`, trust starts at 2) and her pug **Encore** |
| Nemesis | **Impresario Blaise Marchetti** (`npc:blaise-marchetti`). Act III: bound into the Union Chimera |
| Half-stone | the Opera half, on the stage of the Grand Opera (lair 3) |
| Sentinels | A Abbess Morwen, B the Weeping Willow |

## Act I: Lyrehaven (22 quests)
### Main
| # | Quest (`quest:bard-…`) | Where | Beat | Flags |
|---|---|---|---|---|
| I-1 | `the-bell-in-the-opera`, **The Bell in the Opera** | zone 1 | Night. The hero has broken into the silent Grand Opera to practise where the echo is best, and the Drowned Bell rings: the great chandelier hums one note, its first in seven years. The Opera half sings back from under the stage. Signora Vell, who sleeps in her old dressing room, catches the hero and is thrilled to have an audience. Tutorial: move, play and talk; Siren Wisps in the stalls. | `bard.bell_heard` |
| I-2 | `the-five-bars`, **The Five Bars** | zone 1 | Rosalind wants the Opera's overture back. Five buskers in the Opera Quarter each remember one bar of it, and hollow Siren Wisps drink the notes as soon as they're played. The fountains that used to hum are full of black tears. | |
| I-3 | `the-choir-loft`, **The Choir Loft** | zone 1 to lair 1 | Something sings in the Opera's choir loft at night, and every busker who stops to listen forgets their only tune. **Boss 1: the Choir Phantom.** | `bard.phantom_rests` |
| I-4 | `the-impresario`, **The Impresario** | zone 2 | Impresario Blaise Marchetti sweeps onto the Busking Steps in a lilac coat and pays fortunes for the last good songs in the turf war. He means to reopen the Grand Opera for one gala night, and he wants the hero to sing Rosalind's old role. He is gracious, funny and knows every busker's name. | `bard.marchetti_met` |
| I-5 | `the-songbook-act`, **The Songbook Act** | zone 3 | The Conservatory moves to write down every song left in Lyrehaven and lock the scores away, so no more can be lost; the Discord moves to sing every song a last time and let it go. **Faction choice** (see below). | `bard.songbook` |
| I-6 | `the-grand-organ`, **The Grand Organ** | zone 3 to lair 2 | Whatever was chosen, the songs end up in the Grand Organ, whose pipes run up behind the Conservatory's walls: the sealed scores are stored in its loft, or the let-go songs drift into its pipes, or Marchetti feeds them in himself. It ate the Conservatory's choir seven years ago, and it is hungry again. **Boss 2: the Organ That Ate a Choir.** Twelve choristers tumble out of its pipes, and every one says Marchetti showed them in. | `bard.choir_freed` |
| I-7 | `marchettis-masterpiece`, **Marchetti's Masterpiece** | zone 4 | His workshop is in the Prompter's Cellars. Every song he bought was memorised, folded into a single score and then burned, and the score is written in black-tear ink so it can never be forgotten. He wants the Opera half to play it once, forever: a song that never ends, so nobody will ever need another. INSIGHT options let the hero see it early: the prompt-box is full of the ash of burned songs. | `insight.marchetti_ash`, `bard.marchetti_turned` |
| I-8 | `the-opera-stage`, **The Opera Stage** | lair 3 | Gala night, with every seat sold. **Boss 3: Marchetti (nemesis I)**, conducting the stage machinery. The hero takes the Opera half from the boards. Marchetti takes his bow and flies out on the scenery ropes, towards the Lyre Gate. | `bard.halfstone` |
| I-9 | `curtain-call`, **Curtain Call** | gate road | Rosalind's farewell on the meadow road, with a trust check. At Friendly she gives her opera glasses, which show Siren Wisps for what they are; at Trusted she gives Encore too, as a pet ("he has a better ear than the whole Conservatory"). | `bard.rosalind_farewell` |
| I-10 | `the-lyre-gate`, **The Lyre Gate** | `area:song-gate` | **Boss 4: the Silent Maestro**, conducting a choir of stolen voices. When he falls the voices fly home over the meadows, and one bright soprano goes straight for Lyrehaven. The hero opens the gate with the Opera half. | `story.gate_open`, `story.act = 2` |

### Side quests (8)
| Zone | Quest | Beat |
|---|---|---|
| 1 Opera Quarter | **The One-Note Busker** | Old Tobble plays one note on his crumhorn all day: the last note of a lullaby he is forgetting. Find the rest of it around the Quarter. It was written for an Unsung baby in the Citadel (it pays off in Act III). |
| 1 Opera Quarter | **Ticket Touts** | Two touts are selling tickets to a gala the Opera hasn't announced. Expose them, or [INSIGHT] work out that Marchetti printed the tickets a month before he arrived. |
| 2 Busking Steps | **Fiddlers versus Pipers** | The Steps' two busking gangs are at war over the last good jig. Settle it with a play-off, and find out halfway through that the jig was written as a duet. |
| 2 Busking Steps | **The Tune Thief** | A Songbird Harpy fledgling, blown in from the Fells, is stealing tunes out of buskers' hats. Catch it gently; it nests on the Opera roof and sings at the gala. |
| 3 Conservatory | **Practice Room Nine** | A student has practised the same scale in Practice Room Nine for three years, and the room has gone so quiet it no longer echoes. The Organ's pipe behind the wall is drinking the sound: a clue for I-6. |
| 3 Conservatory | **The Great Metronome** | The Conservatory's great metronome stopped on the night of the Hollowing. Restart it, and learn it was kept in time by the Song Stone. Codex. |
| 4 Prompter's Cellars | **Old Mister Murmur** | The Opera's prompter still whispers every line of every opera to an empty stage. He knows where Marchetti goes at night: a clue for I-7. |
| 4 Prompter's Cellars | **Wisps in the Wings** | Siren Wisps are nesting in the old costume store and have started wearing the dresses. Comedy. |

### Mentor thread (2) and bounties (2)
- **Resting the Voice** (needs Friendly): Rosalind's dressing room, her honey jars and her letters. She didn't stop singing: the Maestro took her voice on his last night with the baton, seven years ago, and she's been too proud to say so. Her last aria survives only because she once taught it to her dresser. Songs aren't lost by being sung; they're lost when nobody new learns them. Sets `insight.songs_passed_on` (opens the I-5 INSIGHT option if it's done first).
- **The Understudy** (needs Trusted): find Perdita Brisk, Rosalind's understudy, who was never once let on stage and now sells hot chestnuts on the Busking Steps. Bring them back together. Sets `bard.rosalind_devotable`.
- **Bounty: the Cellar Wisps** (Siren Wisps). **Bounty: the Bellflower Beds** (Bellflowers that ring all night in the Opera gardens).

### Bosses
| Boss | Fight | Black tears |
|---|---|---|
| **The Choir Phantom** (lair 1) | A ghostly choirmaster whose sung notes fly across the loft in bars; sing harmony in the rests to stun it | its hymn-book drips black, and its wrong notes hollow (a debuff that mutes skills) |
| **The Organ That Ate a Choir** (lair 2) | The floor is its keyboard. Stepping on keys plays notes, and the right chord shuts its pipes before they blast | black tears clog its bellows, and each pipe holds a hollowed chorister to free |
| **Impresario Marchetti** (lair 3) | He conducts the stage itself: trapdoors, flying flats and a falling chandelier all keep his score. Improvise off the beat to break it | his black-tear ink runs off the score and stains the boards; when the score tears, a tear runs down his own cheek |
| **The Silent Maestro** (the gate) | He conducts silence: circles where nothing can be cast. The Bard plays counter-melody to shrink them, and sings the Opera half between phases | his baton drips black; when beaten the tears leave him, and the stolen voices fly home |

### I-5: The Songbook Act
| Choice | Immediate | Later |
|---|---|---|
| **Seal the songs** (with the Conservatory) | every song is written down and locked away, and the Busking Steps go quiet; Rosalind trust −1 ("a song in a box is a pressed flower") | Act II: the sealed hymn-scores reach the Song exiles at Abbeyshore, so the drowned choir's hymns can be read to Morwen (an easier release); Act III: Marchetti's score is shorter (one fewer phase) |
| **The Last Night** (with the Discord) | the whole city sings every song once more and lets it go; the Conservatory's practice rooms fall silent | Act II: Discord exiles at Abbeyshore teach the hero a rest that hushes Morwen's choir for a beat (a C-3 helper); Act III: Marchetti believes you agree with him, and sparing him is harder |
| **[INSIGHT] Teach them** (needs `insight.songs_passed_on`) | every song is given to one stranger, and the turf war on the Steps ends; Marchetti notices he can't buy a song that everybody has | Act III: Marchetti's perfect song has a crack in it (an extra phase-skip), and sparing him is easier |

## Act II: the class thread (Concordia)
| # | Quest | Beat |
|---|---|---|
| C-1 | `abbeyshore`, **Abbeyshore** | The Song diaspora sing from the Shore Chapel every dusk to keep the drowned choir company. Their songs are thirty years out of date and still in tune. |
| C-2 | `under-the-lake`, **Under the Lake** | Tamsin ferries the hero over the drowned nave while the pale shapes in the reeds sing back. Down through the flooded cloister to the Abbess. |
| C-3 | `abbess-morwen`, **Abbess Morwen** | **Boss 5: Sentinel A.** Release: she drowned with the Bell because it would not stop ringing, and she asks whether it could be rung gently, just once. Sets `story.sentinel.song`. |
| C-4 | `the-last-movement`, **The Last Movement** | Marchetti is at Stag's Rest in the Gloamwood, recording the Weeping Willow's weeping as the last movement of his perfect song. The Legion are fitting him for the Union Chimera. |
| C-5 | `the-weeping-willow`, **The Weeping Willow** | **Boss 6: Sentinel B**, at Stag's Rest. Freeing the willow lets the Ranger bearer claim Verdant's mark (+1 bearers). |
| C-6 | `a-letter-sung`, **A Letter, Sung** | Rosalind's letter comes through the Song arch with Encore (or a Conservatory songbird), and Wil Crane sings it aloud at the Gilded Goose. Rosalind has written at the bottom: "I sang it to the pug first. My voice came home." At the Stone Court, the Bard and the Skald bearer try a duet and find their halves already know it. |

**Featured bearers:** **Root and Refrain**, with the Hedgewitch bearer at Stag's Rest, who wants the willow to keep growing even as it weeps (it is her Sentinel A; the Bard writes a song slow enough for a tree), and **Song for a Missing Shadow**, with the Shade bearer in the Gloamwood, whose shadow walked off on the night of the Bell: a tune sung to an empty patch of ground can make a shadow follow it home. +1 each.

## Act III: class quests
- **III-4 The Last Performance** (boss 7): Marchetti bound into the Union Chimera, a beast stitched from every school with his lilac coat across its back and a baton for a tail, playing a perfect song with no ending. **Spare** him by writing a rest into his song so that it can end (needs the I-5 Teach option or Rosalind Trusted), or **destroy** him. Sets `bard.nemesis_fate`.
- **Rosalind's Aria** (mentor's last request): Rosalind sends the aria she taught her dresser. Sing it once, on the Song stair of the Twelve Stairs, and never again. If `bard.rosalind_devotable` is set, Rosalind goes to Devoted (5).
- **The Bought Songs**: Marchetti burned the original of every song he bought, but the hollowed buskers in the Legion camp each still hum one. Collect them and give them back.
- **Tobble's Lullaby**: an Act I loose end. The One-Note Busker's lullaby was written for the Unsung baby in the Citadel by Casimir's Bard parent. Play it in the throne hall (it changes the III-6 line).

## Class beats in shared quests
- **II-1:** the Song arch at the Gate Circle hums one flat note. The hero can tune it, and the arch lights a beat sooner.
- **II-2:** [Song] "Sing them a lullaby: hollow things want filling." The wolves sit down. Maren trust −1 ("now they'll follow you home"), or +1 if the hero finishes the verse.
- **II-3:** Brother Aldous remembers the Lyrehaven singers who came to the Abbey for every Turning, and a girl soprano called Rosalind who sang the Bell's descant. Aldous trust +1.
- **II-6:** Marchetti is the nemesis who strikes at the Eve, stealing the **Skald bearer's** Fell half.
- **III-6:** Bard line to the King: "A song you hear once is enough, if you're listening." With Tobble's Lullaby done: "Someone sang you to sleep once. I've brought the song."

## Endings
| Ending | Realm | Mentor | Nemesis spared / destroyed |
|---|---|---|---|
| Turning | The Grand Opera reopens and the meadows hum again. Every song is sung, and some of them only once. | Rosalind sings the opening night; she is terrible for one bar, and then she isn't | manages the Opera and never composes again / his baton hangs in the foyer, unused |
| Unmaking | The Song Stone stays home, and Harmonia forgets old songs and makes new ones a little faster than it forgets | Rosalind teaches at the Conservatory and, by choice, never sings in public again | busks on the Steps, playing other people's songs / forgotten, which he would have hated most |
| Hollow Crown | Harmonia becomes the crown's choir, singing the hero's anthem in every realm forever. It is the only song left. | Rosalind refuses to sing it | conducts the anthem / his one song is never played |
| First Chord | Lyrehaven writes the first song of the new Turning, with a rest in it for the Unsung to breathe | Rosalind (Devoted) sings it once, and lets it go | plays the rest / the rest is kept for him |

## Landmarks and set pieces (for Claude 2)
- `landmark:grand-opera` (zone 1, the realm landmark) and `landmark:rosalind-dressing-room` (zone 1, mentor house, inside the Opera)
- `landmark:humming-fountain` (zone 1)
- `obj:busker-bar-1..5` (zone 1, I-2)
- `landmark:busking-steps-pitch` (zone 2)
- `landmark:practice-room-nine` and `landmark:great-metronome` (zone 3)
- `landmark:organ-hall-door` (zone 3, lair 2 entrance)
- `landmark:prompt-box` and `obj:marchetti-score` (zone 4)
- `obj:song-capital-halfstone` (lair 3)
- `obj:song-gate-seal` (gate)

---

# SKALD: *What is left when the song is gone?*
| | |
|---|---|
| Start | `area:song-frontier`, the Echoing Fells |
| Mentor | **Ragna Saga-Keeper** (`npc:ragna-saga-keeper`, trust starts at 3: she raised the hero in the Saga Hall) |
| Nemesis | **Ulf the Unsung** (`npc:ulf-the-unsung`), the hero's elder saga-brother: born without a school's spark, and now without a voice. Act III: bound into the Union Chimera |
| Half-stone | the Fell half, in the Echo Barrow (lair 3) |
| Sentinels | A Abbess Morwen, B the White Stag |

## Act I: the Echoing Fells (22 quests)
### Main
| # | Quest (`quest:skald-…`) | Where | Beat | Flags |
|---|---|---|---|---|
| I-1 | `the-bell-on-the-fells`, **The Bell on the Fells** | zone 1 | Night on drum-watch at the Drum-Steads. The Drowned Bell rings and the Fells throw it back changed: its echo comes home as the hero's own name. Every drum on every stead beats once by itself, Songbird Harpies drop on the sheepfolds, and the Fell half starts to sing. Ragna wakes and forgets a saga getting out of bed. Tutorial: move, drum and talk. | `skald.bell_heard` |
| I-2 | `the-drum-relay`, **The Drum-Relay** | zones 1 and 2 | Ragna sends the hero to drum the news of the Bell from valley to valley. The far steads drum it back wrong: "the Bell rang" comes home as "the Bell drowned". Black tears stand in the tarns, and their echoes come back hollow. | |
| I-3 | `the-discordant-hall`, **The Discordant Hall** | zone 2 to lair 1 | The Discord have taken Hoddersgill's mead-hall and silenced its feast: no drums, no sagas, no toasts. Their leader plays a lute with no strings. **Boss 1: the Discord Bard.** | `skald.hall_retaken` |
| I-4 | `ulf-comes-home`, **Ulf Comes Home** | zone 3 | Ulf walks out of the mist at the Saga Stones after seven years away. He was the one child Ragna could never teach to sing: Unsung from birth, he learned all nine hundred sagas by heart anyway, and drummed them because they wouldn't ring in his mouth. Now he has no voice at all, because the Maestro took it. He talks with his drum, and he has been re-cutting the worn stones by night. | `skald.ulf_home` |
| I-5 | `the-blank-stones`, **The Blank Stones** | zone 3 | The Saga Stones are wearing blank faster than anyone can cut, and there's stone and time to save only some of the sagas. **Faction choice** (see below). | `skald.stones` |
| I-6 | `the-harpy-roost`, **The Harpy Roost** | zone 4 to lair 2 | Whatever was chosen, the Songbird Harpies come for the carvers, shrieking the sagas back wrong. Their roost on the cliffs is lined with stolen echoes. **Boss 2: Shriek-Mother.** In the nest is a drum-message Ulf sent by harpy, and it isn't addressed to anyone in Harmonia. | `skald.ulf_message` |
| I-7 | `the-weeping-runes`, **The Weeping Runes** | zone 3 | The message is to the Hollow King, "from one Unsung to another". Ulf has been cutting the sagas in black tears, so they'll never wear away and never need a voice. With the Fell half every saga would be fixed in stone forever and no Skald would ever have to sing, so no one could be left out of the song again. INSIGHT options let the hero see it early: the new carvings weep at dusk. | `insight.weeping_runes`, `skald.ulf_turned` |
| I-8 | `the-echo-barrow`, **The Echo Barrow** | lair 3 | Into the barrow of the first Skald, where every word comes back three times. **Boss 3: Ulf (nemesis I).** The hero takes the Fell half from the first Skald's stone hands. Ulf drums one last beat, and the barrow's back door opens onto the road to the Lyre Gate. | `skald.halfstone` |
| I-9 | `ragnas-last-saga`, **Ragna's Last Saga** | gate road | Ragna's farewell, with a trust check: she tells the hero's saga so far, and loses a verse of it as she goes. At Friendly she gives her saga-staff, notched once for every saga she has lost; at Trusted she also gives the Nine-Hundredth Saga, the one she kept back: Ulf as a boy, drumming alone on Scarrow Pike. | `skald.ragna_farewell` |
| I-10 | `the-lyre-gate`, **The Lyre Gate (Fells side)** | `area:song-gate` | **Boss 4: the Silent Maestro**, who on this side has stolen even the echoes. When he falls the voices burst free, and one rough, plain voice flies after Ulf. **Catch it** in the hero's drum, or **let it go** home to the Fells. Then open the gate. | `skald.ulf_voice`, `story.gate_open`, `story.act = 2` |

### Side quests (8)
| Zone | Quest | Beat |
|---|---|---|
| 1 Drum-Steads | **The Ewe Who Sang** | Sigrun's ewe Bluebell bleats in perfect pitch, and three steads want her for the drum-relay. Settle it before they come to blows. (They come to blows.) |
| 1 Drum-Steads | **News from Two Valleys Over** | The relay says Old Hulda of Brackenhow has died, married and been turned into a cow, in that order. Walk over and find out. She's fine, and furious. |
| 2 Echoing Fells | **What the Fell Said** | Shout from Scarrow Pike and the echo comes back in a dead shepherd's voice, finishing a sentence he began forty years ago. Codex: the Fells keep what is said on them. |
| 2 Echoing Fells | **The Lost Flock** | The echo of a dog-whistle is calling sheep into the tarns. Find the hollow Siren Wisp that's whistling. |
| 3 Saga Stones | **The Stone with No Saga** | One standing stone was never carved. The Saga Halls say it waits for a saga not yet sung, and Ulf has been sitting beside it at night. His drum-marks on it are black: a clue for I-7. |
| 3 Saga Stones | **Rubbings** | A girl called Asta is taking charcoal rubbings of the sagas before they go, and she has run out of paper. Find her some. Her rubbings hang in the Saga Hall in the epilogue. |
| 4 Harpy Cliffs | **Egg-Song** | Harpy eggs that hum lullabies have been taken by egg-thieves for the Lyrehaven market. Return them, or let them be sold. |
| 4 Harpy Cliffs | **The Fog-Drummer** | Old Haldor drums ships off the cliffs in fog, and his drum-skin is splitting. Find a new hide, and learn the coast-saga the drum carries. |

### Mentor thread (2) and bounties (2)
- **The Saga of Nobody Much** (needs Friendly): Ragna's oldest saga isn't about a hero. It's about a shepherd who did nothing great his whole life. She keeps it because nobody else would, and she'd sooner lose a king's. Sets `insight.unsung_sagas` (opens the I-5 INSIGHT option if it's done first).
- **The First Saga She Lost** (needs Trusted): last spring Ragna lost her first saga. It survives only as an echo on the Fells. Gather its verses from four tarns and drum it back to her. Sets `skald.ragna_devotable`.
- **Bounty: Old Screel** (a giant Songbird Harpy). **Bounty: the Tarn Wisps** (Siren Wisps).

### Bosses
| Boss | Fight | Black tears |
|---|---|---|
| **The Discord Bard** (lair 1) | A lanky bard with a stringless lute whose "silent chords" bloom as rings that cancel drumming; drum from outside the rings to crack them | his empty strings drip black, and the hall's mead turns black and hollows the drinkers into his chorus |
| **Shriek-Mother** (lair 2) | The eldest harpy, diving across the roost. She shrieks the hero's last attack back at them as an echo; a drum-beat breaks the echo before it lands | her feathers are tipped black, and her shrieks scatter tear-droplets that mute |
| **Ulf the Unsung** (lair 3) | He drums in the Echo Barrow, and every beat comes back three times as a shockwave. Shout a war-cry to cancel an echo before it hits | he never weeps; his drum does, and his runes glow black |
| **The Silent Maestro** (the gate) | From the Fells side he has stolen the echoes, so the arena is dead quiet. Drum the fells awake to win the echoes back, then turn them on his choir | his baton drips black; beaten, he drops it, and the stolen voices tear free |

### I-5: The Blank Stones
| Choice | Immediate | Later |
|---|---|---|
| **Cut the great sagas** (with the Saga Halls) | the war-chiefs' and heroes' sagas go back on the stones and the small ones are lost; Ulf drums one beat and leaves | Act II: Saga Hall exiles at Abbeyshore drum you into Morwen's nave (C-2 is shorter); Act III: harder to spare Ulf |
| **Let them weather** (with the Discord) | the stones go blank, the dead are let rest and the Fells fall quiet; Ragna trust −1 | Act II: Morwen, who wants silence, lets you speak before she fights (an easier release); Act III: the Song banner on the Twelve Stairs is blank |
| **[INSIGHT] Cut the unsung** (needs `insight.unsung_sagas`) | the hero cuts the sagas of people who never had one: shepherds, cooks, Ulf's mother. Ulf weeps clear tears, and runs | Act III: Ulf's Chimera has a gap where its heart should be (an extra phase-skip), and sparing him is easier |

## Act II: the class thread
| # | Quest | Beat |
|---|---|---|
| C-1 | `abbeyshore`, **The Drummers at the Fish Mill** | The Fells exiles at Abbeyshore drum the drowned choir's names from the Old Fish Mill every night, so that someone is still saying them. They have lost three. |
| C-2 | `under-the-lake`, **Under the Lake** | As for the Bard, with Skald lines: the drowned choir's names, drummed on the water, open the nave. |
| C-3 | `abbess-morwen`, **Abbess Morwen** | **Boss 5.** Release: she asks the Skald for the three lost names. Sets `story.sentinel.song`. |
| C-4 | `the-drum-in-the-glade`, **The Drum in the Glade** | Ulf is in the Gloamwood glade, drumming for the White Stag that once led the Turning procession, asking it to lead him to the King. The Stag is following him. |
| C-5 | `the-white-stag`, **The White Stag** | **Boss 6:** the Stag isn't sick, it's grieving, and the Skald drums its saga to it as it falls. Freeing it lets the Falconer bearer claim Hunt's mark (+1). |
| C-6 | `ragnas-drum-letter`, **Ragna's Drum-Letter** | Someone is drumming on the far side of the Song arch: Ragna, in the Fells' long-message beat. Pip, who is Unsung and listens to everything, writes it down, then asks whether Unsung people can be in sagas. At the Stone Court, the Skald and the Bard bearer. |

**Featured bearers:** **The Cantor's Dirge**, with the Cantor bearer at Abbeyshore, who won't sing the dark verses of the drowned choir's dirge; the Skald drums them while the Cantor sings the light ones (Morwen is the Cantor's Sentinel A too), and **The Ranger's Mercy**, with the Ranger bearer in the Gloamwood, who wants to end the Stag's grief with one arrow (help, or stop them; the Stag is the Ranger's Sentinel B). +1 each.

## Act III: class quests
- **III-4 The Unsung Chimera** (boss 7): Ulf bound into the Union Chimera, with a war-drum for a chest and his black-tear sagas cut into its hide. **Spare** him by giving him back his voice from the hero's drum (needs `skald.ulf_voice` caught, plus the I-5 Unsung choice or Ragna Trusted), or **destroy** him. Sets `skald.nemesis_fate`.
- **The Nine-Hundred-and-First** (mentor's last request): Ragna wants one new saga before she forgets the rest: the hero's. Drum it on the Song stair. If `skald.ragna_devotable` is set, Ragna goes to Devoted (5).
- **The Hollow Skalds**: the Fells' Skalds who followed the Maestro's choir to the Lyre Gate and on into the Heart stand in the Legion camp. Drum them their names.
- **The Stone with No Saga**: an Act I loose end. The uncarved stone was the one Ulf meant for himself. Cut his saga on a stair-stone in the Heart, in plain stone, whatever his fate.

## Class beats in shared quests
- **II-1:** the Song arch's echo answers the hero's footsteps a beat late, like the Fells.
- **II-2:** [Song] "Drum the fire-watch beat. The wolves know it from the old Turning roads." Maren trust +1.
- **II-4:** [Song] "Drum against the tear." It makes no echo at all, and Nan Briar says it never did, even in her day. Sets `insight.tears_echoless`, which supports `insight.tears_older`.
- **II-6:** Ulf strikes at the Eve, stealing the **Bard bearer's** Opera half. He drums the King's summons as he goes.
- **III-6:** Skald line to the King: "Ulf knew every saga, and none of them had his name in. Yours neither. Stop weeping long enough and I'll drum it."

## Endings
| Ending | Realm | Mentor | Nemesis spared / destroyed |
|---|---|---|---|
| Turning | The Saga Stones stop wearing, the Fells echo true, and the drum-relay carries the Turning valley to valley | Ragna remembers all nine hundred sagas, and forgets the one she never liked | keeps the Stone with No Saga and cuts other people's sagas in plain stone / his drum hangs in the Echo Barrow beside the first Skald |
| Unmaking | The Fell half stays home. The sagas fade, and the Fells keep only what's sung each year. | Ragna teaches Asta the hundred sagas she has left | speaks the sagas at the Drum-Steads in his own plain voice / the Fells echo his name, sometimes |
| Hollow Crown | The sagas are cut in tear-stone forever, as Ulf wanted, and the Skalds have nothing left to do. The hero's saga is the longest. | Ragna refuses to drum it | the crown's saga-cutter / his stone stays blank |
| First Chord | The Skalds drum the first saga of the new Turning, about the Unsung, and its rests are where the Unsung come in | Ragna (Devoted) drums it | sings it, out of tune, in his own voice / Ragna drums his verse |

## Landmarks and set pieces (for Claude 2)
- `landmark:saga-hall` and `landmark:ragna-hearth` (zone 1, mentor house)
- `obj:relay-drum-1..3` (zones 1 and 2, I-2)
- `landmark:scarrow-pike` (zone 2)
- `landmark:hoddersgill-hall` (zone 2, lair 1 entrance)
- `landmark:stone-with-no-saga` (zone 3)
- `landmark:fog-drum` (zone 4)
- `obj:ulf-drum-message` (lair 2)
- `obj:song-frontier-halfstone` (lair 3)
- the shared `obj:song-gate-seal`, Fells-side approach
