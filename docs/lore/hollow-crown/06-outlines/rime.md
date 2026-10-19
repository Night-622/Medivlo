# Rime: Frostmere (Rimecaller and Warden)

Realm: [02-realms.md § Frostmere](../02-realms.md). Gate boss: **the Winter Tyrant** at the White Gate. Morvane Sentinel A: **the Rimeheart Colossus**.

---

# RIMECALLER: *Should anything be kept forever?*
| | |
|---|---|
| Start | `area:rime-capital`, Glacierhome |
| Mentor | **Archivist-Superior Halla Vint** (`npc:halla-vint`, trust starts at 2) |
| Nemesis | **Regent Seraphine Cold** (`npc:seraphine-cold`), Act III Herald. Her husband **Anselm Cold** (`npc:anselm-cold`) sits frozen in the room beside hers, one breath from the end |
| Half-stone | the Spire half, in the crown of the Ice Spire (lair 3) |
| Sentinels | A the Rimeheart Colossus, B the Lantern Queen |

The hero is one of the Archive's **hour-walkers**: the few Rimecallers who can move inside the held hour, wearing an ice hour-pin that Halla cuts for each of them. Everyone else in Glacierhome is still. The campaign's question is the difference between **holding** a moment (stopping it) and **keeping** one (remembering it well enough to let it go).

## Act I: Glacierhome (22 quests)
### Main
| # | Quest (`quest:rimecaller-…`) | Where | Beat | Flags |
|---|---|---|---|---|
| I-1 | `the-first-tick`, **The First Tick** | zone 1 | The same night it has been for thirty years. The Drowned Bell rings, and every stopped clock in Glacierhome ticks once. A frozen lamplighter on the Spire Stair finishes his blink. The hero wakes with the Spire half's song in their chest; Halla finds them staring at the lamplighter and says, delighted, "He's never done that before." Tutorial: move, cast and talk. | `rimecaller.bell_heard` |
| I-2 | `the-hold-gauges`, **The Hold-Gauges** | zone 1 | Halla sends the hero up the Stair to read the five hold-gauges, ice hourglasses that show how firmly the hour is held. All five are dripping. The meltwater runs black, and the Frost Wraiths that rise from it are people who once stepped out of the hour and into the melt. | |
| I-3 | `the-melt-cisterns`, **The Melt Cisterns** | zone 4 to lair 1 | The meltwater has to go somewhere, and it has all gone into the city's reservoir. Something down there has drunk thirty years of it and the cistern-keepers too. **Boss 1: the Glacier Blob.** | `rimecaller.blob_down` |
| I-4 | `the-regents-key`, **The Regent's Key** | zone 2 | Regent Seraphine Cold, the only person allowed to wind the held clocks, visits the Hall of Held Hours. She is gracious, grey-eyed and very tired. She asks the hero, who heard the tick, to help her find what ticked, "so that it never needs to again". | `rimecaller.regent_met` |
| I-5 | `the-conduit-vote`, **The Conduit Vote** | zone 2 | The hold is failing. The Archive votes to open the old Rime Conduits and draw the Wardwall's cold up into the city. **Faction choice** (see below). | `rimecaller.conduits` |
| I-6 | `the-mirror-gallery`, **The Mirror Gallery** | zone 3 to lair 2 | Whatever was chosen, the hold's working shudders through the Mirror Gallery off the Frozen Market, where it is focused. The mirrors hold whatever looks into them. The hero looks, and their reflection freezes and steps out: it wants to stay still forever, and it wants the hero to stay with it. **Boss 2: the Still Reflection.** | `rimecaller.mirror_seen` |
| I-7 | `the-next-room`, **The Next Room** | zone 3 | The Reflection's last shard shows what the Gallery's mirrors have seen for thirty years: the room beside the Regent's, where Anselm Cold sits in a chair one breath from dying. For a year Seraphine has shored up the hold with black tears drawn from the Wall's seep, and they are why the melt runs black. She wants the Spire half set into the hold so that the hour never moves again, and Anselm's last breath never leaves. INSIGHT options let the hero see it early: every clock in the city is stopped at the minute written in the court physician's log. | `insight.held_minute` |
| I-8 | `the-crown-of-the-spire`, **The Crown of the Spire** | lair 3 | Up the Ice Spire to its crown. **Boss 3: Seraphine (nemesis I).** She holds time in patches across the floor. The hero lifts the Spire half (only its bearer can), and the hold breaks. Seraphine flees down the glacier towards the White Gate, with Anselm's frozen chair on a sledge pulled by Ice Sentries. | `rimecaller.halfstone` |
| I-9 | `the-thaw-road`, **The Thaw Road** | gate road | Behind the hero Glacierhome wakes all at once: the thief finishes his snatch, the bread comes out of the ovens, and every clock strikes thirty years. Halla's farewell, with a trust check. At Friendly she gives her hour-pin ("You won't need it. That's the point"); at Trusted she gives her pocket-watch, wound for the first time since C. 1012. | `rimecaller.halla_farewell` |
| I-10 | `the-white-gate`, **The White Gate** | `area:rime-gate` | **Boss 4: the Winter Tyrant.** The Archive built it, so the Archive's apprentice can read it. The hero opens the gate with the Spire half and steps through. | `story.gate_open`, `story.act = 2` |

### Side quests (8)
| Zone | Quest | Beat |
|---|---|---|
| 1 Spire Stair | **The Longest Loaf** | Mistress Pomfrey Dunn, a baker whose oven sat at the edge of the hold, has watched the same loaf for thirty years. Fetch her firewood that isn't frozen. When the hold breaks at I-8 the loaf finishes, and she carries it to Wardenhold in Act II. |
| 1 Spire Stair | **Mid-Step** | A courier, Wendel Fross, has been frozen mid-stride on the Stair for thirty years with a letter in his hand. Read it through the frost: it's a proposal to Greta Lind, who is frozen mid-bargain in the Market. Get it to her before the hour moves. Epilogue slide. |
| 2 Hall of Held Hours | **The Weather Clerk** | Clerk Cornelius Teal has written "cold; still" in the temperature register for 10,950 days running. Bring him one new reading from the warm Undercrypt, and he weeps with joy. In Act II he keeps Wardenhold's weather register with alarming enthusiasm. |
| 2 Hall of Held Hours | **The Thirteenth Line** | Find the Rime copy of the Concord's founding treaty. Its last page has twelve champions' signatures and a thirteenth line left blank. Codex; Ysolde asks to see it in Act II. |
| 3 Frozen Market | **The Thief Who Never Got Away** | Nim Larkspur has been caught mid-snatch for thirty years, and he has been awake the whole time, regretting it. Thaw his face so he can talk, then slip the purse back before the hour moves. Reformed, he guides the hero across Morvane Marsh in Act II (C-4). |
| 3 Frozen Market | **The Thirty-Year Haggle** | An ice-glass merchant, Brannoc Hulle, and Widow Saffi Tern have been frozen mid-haggle over a sugar bowl. Look up the fair price in C. 1012 in the Archive, so that the first thing they do when they wake is shake hands. |
| 4 Undercrypt | **The Drip-Counters** | Gunnhild Tapp's drip-counters measure the hold's failure drop by drop. The drips have a rhythm, and Gunnhild knows it: it's a heartbeat, slow and stubborn. A clue for I-7. |
| 4 Undercrypt | **The Wraith Who Wanted Its Hat** | A Frost Wraith keeps drifting back to one spot in the tunnel wall, where a hat is frozen in the ice. Cut the hat free and give it back. The wraith puts it on, sighs, and is gone. |

### Mentor thread (2) and bounties (2)
- **The First Keeping** (needs Friendly): Halla opens the Archive's oldest vault, where the first Rimecallers kept moments by writing them down so completely that they could be let go. Recover the first keeping, a single sunrise written in C. 3. It proves the Archive was built to **keep**, never to **hold**. Sets `insight.first_keeping` (opens the I-5 INSIGHT option if it's done first).
- **Something New** (needs Trusted): Halla admits, very drily, that she has not seen anything new in thirty years and would like to. Bring her three: a snowflake that formed in the Undercrypt's thaw, a curse-word the Wardens invented last winter, and a spell the hero made up themselves. She keeps all three in a drawer marked NEW. Sets `rimecaller.halla_devotable`.
- **Bounty: the Cistern Wraiths** (Frost Wraith pack). **Bounty: Sentry Seventeen** (an Ice Sentry that arrests everyone on the Stair for loitering, and everyone on the Stair is loitering).

### Bosses
| Boss | Fight | Black tears |
|---|---|---|
| **The Glacier Blob** (lair 1) | A slime of thirty years of meltwater that freezes and thaws in turns: frozen it's armoured, thawed it splits into smaller blobs that rejoin unless the hero freezes them apart | the tears are frozen inside it like flies in amber; each split blob carries one, and the blob that carries the last is the one to kill |
| **The Still Reflection** (lair 2) | The hero's frozen double. It only moves when the hero stands still, then strikes with their own spells; keep moving to stay safe, and stop only to bait it into the mirrors | its face weeps black where the hero's doesn't |
| **Regent Seraphine Cold** (lair 3) | She holds time in patches across the floor, where spells and shards hang in the air; the half-stone's song "ticks" a patch forward and sends whatever's caught in it back at her | her tears freeze in black beads on her cheeks, and she plucks them and throws them; first sign of the Herald |
| **the Winter Tyrant** (the gate) | For the Rimecaller it's an "unmaking" fight: the Archive's founding charge is cut into the Tyrant's chest, and in each stun window the hero reads one line of it aloud to unbind a piece of its hollow armour | black icicles hang from its crown; when beaten the tears leave it, and it remembers its charge and sits down in the snow beside the gate like an old man at the end of a shift |

### I-5: The Conduit Vote
| Choice | Immediate | Later |
|---|---|---|
| **Open the Conduits** (with the Archive) | the hold is shored up and Glacierhome stays perfect; up on the Wall, six more watch-fires go out; Halla trust −1 | Act II: the Wardens at Wardenhold are cold to the hero; Act III: harder to spare Seraphine ("you held it too") |
| **Let the Wall keep its cold** (with the Wardens' envoy, Halla agreeing) | the hold weakens and the Frozen Market wakes early: Nim Larkspur's hand finally closes on nothing | Act II: the Wardenhold Wardens trust the hero and send a patrol up the pass with them (C-2) |
| **[INSIGHT] Keep it instead** (needs `insight.first_keeping`) | the hero writes the Frozen Market down in the Archive's oldest way, then lets it go; the market wakes, the Wall keeps its cold, and Seraphine watches from the Spire, frightened | Act III: the hero can offer to keep Anselm instead of holding him, which opens the gentlest way to spare the Herald |

## Act II: the class thread (Concordia)
| # | Quest | Beat |
|---|---|---|
| C-1 | `wardenhold`, **Wardenhold** | The Rime diaspora at Frostmere Pass. Its Rimecallers have kept no archive for thirty years and remember everything slightly differently, loudly. Pomfrey's loaf and Cornelius's register are here if those quests were done. They point the hero up the pass to the Rimeheart Colossus. |
| C-2 | `the-held-pass`, **The Held Pass** | The road up the pass is held like Glacierhome was: travellers caught mid-step under the snow for thirty years. The Rimecaller can read the frost and see that this hold is not the Regent's. It's the Colossus's. |
| C-3 | `rimeheart-colossus`, **The Rimeheart Colossus** | **Boss 5: Sentinel A.** Release: the ice-giant held the northern pass for the crown's road, and asks if anyone is still coming. The held travellers walk on. Sets `story.sentinel.rime`. |
| C-4 | `the-regents-lanterns`, **The Regent's Lanterns** | Seraphine is in Lanternford with Anselm's chair, buying the Lantern Queen's lights: each one is a held moment, and she means to build a lantern that never goes out around her husband's last breath. Nim Larkspur, if reformed, knows the safe way across the marsh. |
| C-5 | `the-lantern-queen`, **The Lantern Queen** | **Boss 6: Sentinel B**, in Morvane Marsh. Freeing her lets the Jester bearer claim the Guile mark (+1 bearers). |
| C-6 | `halla-writes`, **Halla's Footnotes** | Halla's first letter in thirty years arrives through the Rime arch: fourteen pages, most of them footnotes on new things, and one line at the end that is not dry at all. Then the Stone Court: the Rimecaller and the Warden bearer hear the Spire and Wall halves sing a held chord, and let it go. |

**Featured bearers:** **The Charge on the Pass**, with the Stormlancer bearer at Wardenhold, who means to charge the Rimeheart Colossus head-on (the Rimecaller can show them it's a holding, not a wall), and **A Fool in the Marsh**, with the Jester bearer at Lanternford, who is trying to out-bargain the Lantern Queen and losing. Each gives +1 `story.bearers_gathered`.

## Act III: class quests
- **III-4 The Herald of the Held Hour** (boss 7): Seraphine remade as the Herald, in a robe of hoarfrost and a crown of icicles, ringing a bell of clear ice that tolls one note and never lets it end. **Spare** her by keeping Anselm for her, written in the Archive's oldest way, so that she can let the hour go (needs the I-5 keeping or Halla Trusted), or **destroy** her. Sets `rimecaller.nemesis_fate`.
- **Halla's First New Entry** (mentor's last request): Halla asks the hero to write the Archive's first new entry in thirty years at the Citadel: the date, the temperature in the Heart, and one new thing. If `rimecaller.halla_devotable` is set, Halla goes to Devoted (5).
- **Anselm**: Anselm Cold's chair stands in the Legion camp, where the Hollow King keeps him. Let the hour go around him. He wakes for one minute, asks what year it is, laughs at the answer, asks after Seraphine, and goes.
- **The Still One**: an Act I loose end. A shard of the Still Reflection stands in the Legion camp, perfectly still, and the hollowed have gathered round it because it's the stillest thing in the Heart. Shatter it, or keep it, properly, and take it home for Halla's drawer.

## Class beats in shared quests
- **II-1:** the Rime arch at the Gate Circle is rimmed with icicles that stopped dripping thirty years ago. As the Rimecaller steps out, they start again.
- **II-2:** [Rime] "Hold the moment: look at the frost on their pelts. These wolves stood still a long time before they ran." Maren trust +1.
- **II-4:** [Rime] "Freeze a tear and read it." Inside is a frozen memory of a Turning feast, centuries before Casimir. Sets `insight.tears_kept`, which supports `insight.tears_older`.
- **II-6:** Seraphine is the nemesis who strikes at the Eve, stealing the **Warden bearer's** Wall half.
- **III-6:** Rimecaller line to the King: "You held the crown so long you forgot it was meant to be passed."

## Endings
| Ending | Realm | Mentor | Nemesis spared / destroyed |
|---|---|---|---|
| Turning | The Ice Spire hums again and Glacierhome melts no further. The clocks run, and Cornelius Teal records a warm day. | Halla opens a new wing of the Archive, the Hall of New Hours, and fills it in a week | Seraphine winds the city's clocks every morning, and lets them run / her frozen tears are kept in the Archive, labelled precisely |
| Unmaking | Glacierhome melts slowly, a street a year, and its people learn to move house | Halla writes the Archive's first book of things that are gone | Seraphine keeps a cottage below the glacier with a clock that is always a little fast / a stopped clock on the Spire Stair, left stopped |
| Hollow Crown | The hero holds Frostmere's hour from the throne. Nothing in Frostmere will ever change again, and nobody in it will ever die. | Halla leaves Glacierhome for the Wardwall, to watch things happen | Seraphine is the crown's timekeeper / the chair in the next room stands empty forever |
| First Chord | The Ice Spire's hum has a rest in it. For one minute every year all of Glacierhome stands still on purpose, then walks on. | Halla (Devoted) keeps the first note of the new Turning, and lets it go | Seraphine keeps Anselm and lets him go / Halla enters both their names in the Archive, side by side |

## Landmarks and set pieces (for Claude 2)
- `landmark:halla-vint-study` (zone 1, mentor house)
- `obj:hold-gauge-1..5` (zone 1, I-2)
- `obj:frozen-lamplighter` and `obj:frozen-courier` (zone 1)
- `landmark:pomfrey-bakery` (zone 1)
- `landmark:hall-of-held-hours` and `obj:held-clock-wall` (zone 2)
- `landmark:archive-oldest-vault` (zone 2, mentor thread)
- `landmark:frozen-market-stalls` and `obj:frozen-thief` (zone 3)
- `landmark:mirror-gallery-door` (zone 3, lair 2 entrance)
- `landmark:rime-conduits` (zone 4, I-5)
- `obj:drip-counter-station` (zone 4)
- `landmark:regents-next-room` (lair 3, Anselm's chair)
- `obj:rime-capital-halfstone` (lair 3)
- `obj:rime-gate-seal` (gate)

---

# WARDEN: *Who is the wall for?*
| | |
|---|---|
| Start | `area:rime-frontier`, the Wardwall |
| Mentor | **Wall-Captain Dagny Orr** (`npc:dagny-orr`, trust starts at 3: she has been the hero's captain since they could lift a shield) |
| Nemesis | **Torvald Wallbreaker** (`npc:torvald-wallbreaker`), the Warden who taught the hero to set a shield. Act III Herald |
| Half-stone | the Wall half, frozen in the Breach (lair 3) |
| Sentinels | A the Rimeheart Colossus, B the White Stag |

Last winter, when the tears first came, Torvald broke the Wardwall at the Breach to let his starving Outland kin through. The tears came in with them. Dagny branded him Wallbreaker and put him over the wall. The Breach has been patched with ice ever since, and the Wall half has been singing in it the whole time.

## Act I: the Wardwall (22 quests)
### Main
| # | Quest (`quest:warden-…`) | Where | Beat | Flags |
|---|---|---|---|---|
| I-1 | `the-horn-at-midnight`, **The Horn at Midnight** | zone 1 | Night watch at the Gatehouse. The Drowned Bell rings, and Dagny, half deaf, hears a horn-call and turns out the whole fortress in its nightshirts. Snow Wolves come over the drifts anyway. The half-stone's song wakes, and the hero hears it out past the Breach. Tutorial: move, block and talk. | `warden.bell_heard` |
| I-2 | `the-watch-fires`, **The Watch-Fires** | zone 2 | Dagny sends the hero along the Long Rampart to find out why the watch-fires keep going out. Each one has drowned in black tears seeping up through the stones. At the last fire, on the far side of the wall, Outland children are standing in the snow, asking for bread. | |
| I-3 | `the-jarls-longhall`, **The Jarl's Longhall** | zone 4 to lair 1 | Raiders keep taking the Wall's supply sledges. The hero goes over the wall for the first time, into the Jarlsfell, and finds the raiders' lord: the Frostbound Jarl, Torvald's uncle, frozen hollow to his high seat while his hall-folk starve around him and keep bringing him the food. **Boss 1: the Frostbound Jarl.** | `warden.jarl_down` |
| I-4 | `the-wallbreakers-parley`, **The Wallbreaker's Parley** | zone 3 | With the Jarl gone the clans have no lord, and Torvald comes down the Wolfrun Passes under a parley-flag to lead them. He is big, gentle and ashamed, and he asks the hero for one sledge of grain. "You know me. You know what's out here." | `warden.torvald_parley` |
| I-5 | `the-wall-moot`, **The Wall Moot** | zone 1 | The Wardens meet in the drill yard to decide whether to open the postern to the clans. **Faction choice** (see below). | `warden.postern` |
| I-6 | `the-wraith-barrows`, **The Wraith Barrows** | zone 3 to lair 2 | Whatever was chosen, the Wardens' dead stir: the wall's founder rises from his barrow to drive out an enemy, though he can no longer say which side it's on. **Boss 2: the Hundredth Warden.** Beaten, he asks one thing: "Who did we build it for?" | `warden.hundredth_rest` |
| I-7 | `the-empty-banner`, **The Empty Banner** | zone 2 | Torvald leads the clans and the hollowed against the Breach at night. He wants the Wall half to bring the whole Wardwall down, "no wall, ever again", and then lead every clan through the White Gate to Concordia, where the Hollow King has promised a seat at his table to everyone who has ever been kept out. INSIGHT options let the hero see it coming: the parley-flag at I-4 bore no clan's mark, only a crown with nothing in it. | `insight.empty_banner` |
| I-8 | `the-breach`, **The Breach** | lair 3 | **Boss 3: Torvald (nemesis I)**, shield against shield in the broken wall. The hero cuts the Wall half out of the Breach's ice (only its bearer can lift it). The Breach falls wider, and Torvald walks out through it at the head of the clans, south through the passes towards the White Gate. | `warden.halfstone` |
| I-9 | `the-long-walk`, **The Long Walk** | gate road | Dagny walks the hero to the White Gate herself. Her farewell, with a trust check. At Friendly she gives her horn ("I can't hear the thing anyway"); at Trusted she gives the fin crest off her own shield. With **Hold**, the Wardens hold the road behind you; with **Open**, the clans walk beside you. | `warden.dagny_farewell` |
| I-10 | `the-white-gate`, **The White Gate (Wall side)** | `area:rime-gate` | **Boss 4: the Winter Tyrant**, the Archive's answer to the cold, which never once came to the Wall's aid. When it falls the tears leave it: **send it to the Wall**, where it can hold the winter off the Wardwall at last, or **let it melt**, and the Jarlsfell gets a spring. Then open the gate. | `warden.tyrant`, `story.gate_open`, `story.act = 2` |

### Side quests (8)
| Zone | Quest | Beat |
|---|---|---|
| 1 Wardwall Gatehouse | **The Misheard Orders** | Dagny's runners have been too frightened to ask her to repeat herself for twenty years. A squad is digging a moat because she asked for a boat. Untangle three misheard orders before she notices. |
| 1 Wardwall Gatehouse | **The Ration Ledger** | Quartermaster Ebbe Strand's sums don't add up because he has been sneaking rations over the wall to the clans for a year. Report him, or help him cook the ledger. If helped, he speaks for the clans at I-5 and is at Wardenhold in Act II. |
| 2 Long Rampart | **The Last Watch-Fire** | Old Ingrith Halfmile has kept the furthest watch-fire alone for forty years and has never been relieved. Take her watch for one night. From her fire you can see the whole Jarlsfell, and every light in it. Epilogue slide. |
| 2 Long Rampart | **Letters Over the Wall** | Wardens have been shooting letters tied to arrows into the Jarlsfell for kin on the other side. Collect the replies frozen in the drifts. There are more of them than anyone admits. |
| 3 Wolfrun Passes | **The White Pack** | A Snow Wolf alpha that isn't hollow is defending her pups from wolves that are. Help her. A Warden who does learns the difference, which pays off in Act II (II-2). |
| 3 Wolfrun Passes | **Out of the Hour** | A family who slipped out of Glacierhome's held hour are snowed in in the passes. Escort them to the Gatehouse. The grandmother is younger than her daughter: she stayed in the hold for twenty years before she left. |
| 4 the Jarlsfell | **The Steading Oven** | Mend a frozen steading's communal oven so the clan children can eat something hot. Meet Grandam Hekla, who runs the steading and the argument. She speaks for the clans at I-5. |
| 4 the Jarlsfell | **The Goat That Crosses Walls** | A clan goat called Old Gubbins has climbed the Wardwall twice a day for years: the only thing that crosses freely. Follow him and find the smugglers' stair, which is a shortcut to the Breach at I-8. |

### Mentor thread (2) and bounties (2)
- **The Long Horn** (needs Friendly): how Dagny went deaf. In C. 1012, when the gates shut, she blew the Long Horn for three nights to call the clan grandmothers in out of the cold, as the old charter said to. The Wall-Captain of the day countermanded her and kept the postern shut. Find the charter in his sealed chest in the Wraith Barrows: the Wardwall was built to keep out **the winter**, with gates "for anyone who comes in from the cold". Sets `insight.wall_charter` (opens the I-5 INSIGHT option if it's done first).
- **A Captain's Sister** (needs Trusted): Dagny has a sister on the far side of the wall and has not spoken to her in thirty years. It's Grandam Hekla. Bring Dagny to the steading oven, and stand between them until one of them laughs. Sets `warden.dagny_devotable`.
- **Bounty: the Wolfrun Pack** (Snow Wolves). **Bounty: the Rampart Sentry** (a hollow Ice Sentry walking the Long Rampart and shoving Wardens off it).

### Bosses
| Boss | Fight | Black tears |
|---|---|---|
| **The Frostbound Jarl** (lair 1) | He never rises from his high seat; the hall fights for him, with falling icicles and his hall-folk's frozen shields; break the ice that binds him to the seat, side by side | the tears freeze in his beard as a black icicle crown and drip into the mead-cauldron, and his starving hall-folk drink from it |
| **The Hundredth Warden** (lair 2) | A tower-shield duel with the wall's founder. He plants a line across the arena that the hero can't cross; break his stance by blocking his charges until his shield arm drops | the tears have frozen his shield to his arm, and he can't put it down |
| **Torvald Wallbreaker** (lair 3) | Shield against shield. He tears blocks out of the Breach to open gaps that let hollow wolves in; shove him into the gaps to close them | the tears run down his shield like meltwater and never freeze |
| **the Winter Tyrant** (the gate) | From the Wall side it's a holding fight: it drives blizzard waves down the road at the hero, and the Warden braces, walls off with the tower shield, and advances between waves to break its icy crown | its breath is black snow; when beaten the tears leave it, and it waits for the Warden's word |

### I-5: The Wall Moot
| Choice | Immediate | Later |
|---|---|---|
| **Hold the wall** (with Dagny and the Wardens) | the postern stays shut; the clans turn to Torvald; Dagny trust +1 | Act II: the Wardenhold Wardens welcome the hero as one of theirs; Act III: harder to spare Torvald ("you kept them out too") |
| **Open the postern** (with the Outland Clans) | the clans come through; the Gatehouse is crowded, hungry and grateful, and a few tear-sick come in with them; Dagny trust −1 | Act II: Outland folk followed the hero through the White Gate, and Grandam Hekla's clan guides them up the pass (C-2); half of Torvald's following leaves him |
| **[INSIGHT] Read the charter** (needs `insight.wall_charter`) | the hero reads the founding charter aloud in the drill yard; Dagny asks them to say it again, louder, and then opens the postern herself; the Wardens hold the line and the clans shelter behind it | Act III: Dagny comes to the Heart's edge herself, and sparing Torvald is easier |

## Act II: the class thread (Concordia)
| # | Quest | Beat |
|---|---|---|
| C-1 | `wardenhold`, **Wardenhold** | Morvane's Rime diaspora at Frostmere Pass. Its Wardens have kept their drills for thirty years at a gate that faces nothing. Ebbe Strand is here if he was helped. The Rimeheart Colossus holds the pass above them shut. |
| C-2 | `the-shut-pass`, **The Shut Pass** | No Wardenhold patrol has gone up the pass in thirty years. Lead the first one, with Wardens or clanfolk at your back depending on I-5. |
| C-3 | `rimeheart-colossus`, **The Rimeheart Colossus** | **Boss 5: Sentinel A.** Release: the ice-giant held the pass for the crown's road and asks the Warden what it is for, now. Sets `story.sentinel.rime`. |
| C-4 | `the-kept-out`, **The Kept-Out** | Torvald has led the clans who followed him through the White Gate into the Gloamwood, gathering every hungry soul in Morvane. He means to follow the weeping White Stag down its old procession road into the Heart, with all of them behind him. |
| C-5 | `the-white-stag`, **The White Stag** | **Boss 6: Sentinel B**, in the Gloamwood glade. It isn't sick, it's grieving, and the Warden fights to hold it, not to kill it. Freeing it lets the Falconer bearer claim the Hunt mark (+1 bearers). |
| C-6 | `a-horn-from-the-north`, **A Horn from the North** | A horn-call comes faintly through the Rime arch: Dagny's Long Horn, blown from the Frostmere side, the old signal for "come home when you're done". Then the Stone Court: the Warden and the Rimecaller bearer. |

**Featured bearers:** **Under the Pass**, with the Juggernaut bearer at Wardenhold, who wants to dig through the pass rather than climb it (help them find the old Warden tunnels, or talk them up the road), and **The Hooded Glade**, with the Falconer bearer in the Gloamwood, whose bird won't fly near the Stag. Each gives +1 `story.bearers_gathered`.

## Act III: class quests
- **III-4 The Herald of the Wall** (boss 7): Torvald remade as the Herald, in a robe of drifted snow and the empty crown's colours, ringing a bell cut from the Wardwall's own ice. **Spare** him by reading him the charter, "for anyone who comes in from the cold" (needs the I-5 charter or Dagny Trusted). He kneels, and his tears thaw. Or **destroy** him. Sets `warden.nemesis_fate`.
- **Dagny's Last Watch** (mentor's last request): Dagny asks the hero to stand one watch on the last wall there is, the Weeping Wall, and blow her horn when it parts. If `warden.dagny_devotable` is set, Dagny goes to Devoted (5).
- **The Clans in the Camp**: the Outland folk who followed Torvald stand in the Legion camp, still waiting for the table they were promised. Bring them out. Grandam Hekla leads them home if she's met.
- **The Goat Who Crosses Walls**: an Act I loose end. Old Gubbins has followed the hero through every gate, and now he climbs the Weeping Wall too. He finds a path the Legion doesn't watch, and eats a Legionnaire's banner (comic relief before the end).

## Class beats in shared quests
- **II-1:** the Rime arch is cracked down the middle like the Breach, and on the Morvane side there are handprints in the frost: Outland hands.
- **II-2:** [Rime] "Those aren't hunting. They're running from something." Needs *The White Pack*; Maren trust +1 and a clue towards the Stag. Otherwise [Rime] "Shields up: hold the gate and let them break on it."
- **II-3:** [Rime] "You stand like a man who once had a gate to guard." Godric goes quiet, then trust +1. A step towards `insight.godric_saw`.
- **II-6:** Torvald strikes at the Eve, stealing the **Rimecaller bearer's** Spire half.
- **III-6:** Warden line to the King: "A wall's for the ones behind it. You built yours round yourself."

## Endings
| Ending | Realm | Mentor | Nemesis spared / destroyed |
|---|---|---|---|
| Turning | The Wardwall's gates open every morning and shut every night, against the weather. The clans farm both sides of it. | Dagny is made Warden of the White Gate and hands the Wall to the hero | Torvald keeps the postern / his shield is mortared into the mended Breach |
| Unmaking | The Wardwall stands with no stone in it, held by Wardens alone. The clans come and go by treaty, uneasily. | Dagny holds the Wall for ten more winters and then sits by Ingrith's fire | Torvald goes back over the wall as the clans' Jarl / a cairn at the Breach |
| Hollow Crown | The hero raises the Wardwall around all of Frostmere, then around every realm. Nobody gets in. | Dagny puts down her shield and goes over the wall to her sister | Torvald is the crown's gatekeeper, keeping everyone out / nobody remembers which stone was his |
| First Chord | The Wardwall becomes a wall of gates, and the watch-fires are lit for travellers. | Dagny (Devoted) blows the Long Horn for the new Turning, and says she heard it | Torvald keeps the first gate / Hekla carves his name over it |

## Landmarks and set pieces (for Claude 2)
- `landmark:dagny-orr-quarters` and `obj:long-horn` (zone 1, mentor)
- `landmark:wardwall-drill-yard` and `landmark:wall-postern` (zone 1, I-5)
- `obj:watch-fire-1..6` (zone 2, I-2)
- `landmark:last-watch-fire` (zone 2)
- `landmark:white-pack-den` (zone 3)
- `landmark:jarlsfell-steading-oven` (zone 4)
- `landmark:goat-stair` (zone 4, shortcut to lair 3)
- `obj:wall-charter-chest` (lair 2, mentor thread)
- `obj:rime-frontier-halfstone` (lair 3)
- the shared `obj:rime-gate-seal`, Wall-side approach
