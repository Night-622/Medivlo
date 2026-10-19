# Blade: Steelvale (Swordsman and Samurai)

Realm: [02-realms.md § Steelvale](../02-realms.md). Gate boss: **the Thousand-Edge General** at the Edge Gate. Morvane Sentinel A: **Bonelord Varric**.

---

# SWORDSMAN: *How do you end a fight?*
| | |
|---|---|
| Start | `area:blade-capital`, Edgewater |
| Mentor | **Maestra Lucia Ferro** (`npc:lucia-ferro`, trust starts at 2), the Ladder's only retired champion |
| Nemesis | **Ser Auguste Vellacourt** (`npc:auguste-vellacourt`), champion of the Ladder. Act III Union Chimera |
| Half-stone | the Hall half, under the floor of the Fencing Hall (lair 3) |
| Sentinels | A Bonelord Varric, B the Stormcrow |

## Act I: Edgewater (22 quests)
### Main
| # | Quest (`quest:swordsman-…`) | Where | Beat | Flags |
|---|---|---|---|---|
| I-1 | `the-bell-on-the-ladder`, **The Bell on the Ladder** | zone 1 | A midnight challenge for rung 212, under the Ladder board. The Drowned Bell rings, every blade in Edgewater hums the same note, and both duellists' swords stop dead in the air. The Hall half's song wakes. Duelist Revenants climb out of the Quarter's duel-graves, and Ferro hauls the hero out by the collar. Tutorial: move, strike, parry and talk. | `swordsman.bell_heard` |
| I-2 | `strike-them-off`, **Strike Them Off** | zone 1 | Ferro sends the hero to settle five of the oldest challenges on the Ladder board, by talking or by fighting. One is a Revenant still fencing a duel from C. 1013, and its opponent's grandson is very tired of it. Black tears run down the board's chalk. | |
| I-3 | `the-saints-tomb`, **The Saint's Tomb** | zone 2 to lair 1 | Duellists keep going down under the oldest bridge to challenge the Sword Saint, and don't come back up, except as Revenants. **Boss 1: the Sword Saint.** | `swordsman.saint_down` |
| I-4 | `the-champions-salute`, **The Champion's Salute** | zone 2 | Ser Auguste Vellacourt crosses the Duelling Bridges, signing autographs, and accepts the hero's challenge on the spot. He's gracious, funny and far better than you. He lets you take a touch, beams, and says "Again." He calls Ferro "my only loss". | `swordsman.vellacourt_met` |
| I-5 | `the-ladder-vote`, **The Ladder Vote** | zone 1 | The Salles' Council sits under the Ladder board to vote on whether to close the Ladder for good. **Faction choice** (see below). | `swordsman.ladder` |
| I-6 | `the-grand-salle`, **The Grand Salle** | zone 3 to lair 2 | Whatever was chosen, everyone wants the Ladder's original roll, kept in the oldest salle on the river: the Council to defend it, Ferro to burn it, or the hero to yield on it. Its guardian has never been touched. **Boss 2: the Perfect Parry.** In the roll, Vellacourt's line has thirty years of wins with not one marked "ended". | `swordsman.ladder_roll` |
| I-7 | `the-unended`, **The Unended** | zone 4 | In the Old Armoury, behind ranks of Training Automatons, Vellacourt keeps everyone he has ever beaten, as Revenants, still fencing. He never lets a duel end. He wants the Hall half set in his sword so every duel he wins stays won, and every quarrel in Steelvale is settled by him alone, forever. His first will be a rematch with Ferro. INSIGHT options see it coming: he salutes at the start of a bout and never at the end. | `insight.swordsman_salute` |
| I-8 | `the-fencing-hall`, **The Fencing Hall** | lair 3 | The great hall, empty, every lamp lit. **Boss 3: Vellacourt (nemesis I).** The hero breaks the hall floor and takes the Hall half from beneath it; Vellacourt goes out through the river-gate to join the General's muster at the Edge Gate, calling "Again!" over his shoulder. | `swordsman.halfstone` |
| I-9 | `the-last-lesson`, **The Last Lesson** | gate road | Ferro walks the hero up the silver-grass road and finally says why she quit. Trust check: at Friendly she gives her champion's ribbon; at Trusted she gives the sword she beat Vellacourt with, which hasn't been drawn in thirty years. | `swordsman.ferro_farewell` |
| I-10 | `the-edge-gate`, **The Edge Gate** | `area:blade-gate` | **Boss 4: the Thousand-Edge General**, with every blade in his muster turned outward. For the Swordsman it's a duel against a thousand swords, one at a time, and the fight is won when he puts them down. The hero opens the gate with the Hall half and steps through. | `story.gate_open`, `story.act = 2` |

### Side quests (8)
| Zone | Quest | Beat |
|---|---|---|
| 1 Fencing Quarter | **Rung 4,012** | Percy Thimble, a cheerful tailor, is the lowest-ranked duellist on the Ladder and has lost nine hundred and ninety-nine bouts. Help him win one. He wins by a pin. |
| 1 Fencing Quarter | **The Insult Broker** | Madame Celandine Sallow sells pre-written insults to start duels with, and business is terrible: everyone is too tired to be offended. Write her some new ones. Codex. |
| 2 Duelling Bridges | **The Sisters' Bridge** | One bridge has been closed for thirty years: Rosa Sarto died there mid-duel, and her Revenant still waits. Her sister Bettina is waiting on the far bank, eighty-one years old. End it with something other than a sword. |
| 2 Duelling Bridges | **Lunch Is a Challenge** | Young Tommaso Rill holds his bridge against all comers, by law, including his mother when she brings his lunch. Comedy. |
| 3 Riverside Salles | **The Empty Salle** | Master Ottavio Grisi still teaches every morning to an empty room. Find him one student. It's Percy. |
| 3 Riverside Salles | **Varric's Statue** | The riverside statue of Varric, the first Concord duellist, is weeping black. Clean it and read the inscription: "The fight is over when both swords are down." Codex; sets up Act II. |
| 4 Old Armoury | **A Sheath for Once** | Armourer Dulcie Bellows's family has sharpened swords for three generations and never made a scabbard, because no sword in Edgewater is ever put away. Find her the old pattern. |
| 4 Old Armoury | **The Armoury Roll** | Count the armoury's swords. One rack-slot is empty and labelled "Ferro: withdrawn, C. 1012". Lore, and a nudge to Ferro's thread. |

### Mentor thread (2) and bounties (2)
- **Ferro's Last Bout** (needs Friendly): Ferro shows the hero the record of her last duel. She beat Vellacourt on the night of the Hollowing, he challenged her again at once, and she yielded on purpose. A yield is an ending too. Sets `insight.swordsman_ferro_yield` (opens the I-5 INSIGHT option if it's done first).
- **The Hand That Quit** (needs Trusted): Ferro's sword-hand shakes, and she hasn't held a blade in thirty years. She asks the hero to fence her one bout in the empty Grand Salle, to the first touch, and to end it. Sets `swordsman.ferro_devotable`.
- **Bounty: the Midnight Revenants** (Duelist Revenants in the Quarter). **Bounty: the Rusted Drill-Sergeant** (a Training Automaton loose on the bridges).

### Bosses
| Boss | Fight | Black tears |
|---|---|---|
| **The Sword Saint** (lair 1) | An ancient master in perfect forms who bows between phases. Bow back and he gives you a free opening; attack during his bow and he gets faster | tears have filled his old wounds, and each new one heals black. He can't fall until someone salutes the end of the duel |
| **The Perfect Parry** (lair 2) | A fencing automaton that parries everything. Feint, throw things, use the room; phase 2 it learns the hero's patterns. The first touch in a thousand years ends it | its joint-oil runs black; when it's finally touched it weeps and stops |
| **Ser Auguste Vellacourt** (lair 3) | A proper duel on the Hall floor. Every time he's beaten he says "Again" and resets with a new style. On the third "Again", refuse: lower your sword, and the floor cracks to the stone | his blade weeps black from the tip whenever he says "Again" |
| **The Thousand-Edge General** (the gate) | His blades orbit him in rings. Disarm them one by one; each one dropped stays dropped, which is new to Steelvale | his edges are blacked with tears. When they drain he lays the last of them down across the gate |

### I-5: The Ladder Vote
| Choice | Immediate | Later |
|---|---|---|
| **Keep the Ladder** (with the Salles' Council) | every challenge stands; the Revenants keep rising; Vellacourt sends flowers | Act II: Rook keeps a chalk Ladder at the Watch House and likes you at once (Rook trust +1); Act III: the Chimera has an extra "Rematch" phase |
| **Close the Ladder** (with Ferro) | the board comes down; duellists riot, then drift off to the General's muster; the Council strikes your name; Ferro trust +1 | Act I: the General's muster at I-10 is angrier but smaller (one fewer phase); Act II: Varric's dead muster has no Edgewater Revenants in it |
| **[INSIGHT] Yield** (needs `insight.swordsman_ferro_yield`) | the hero stands on the Council floor and yields their own oldest challenge in front of everyone: the first ended duel in thirty years. The Hall half hums under the floor. A hundred duellists yield after you. Vellacourt is horrified | Act III: Vellacourt can be spared by a yield without Ferro Trusted; Varric's release scene gains an extra line |

## Act II: the class thread (Concordia)
| # | Quest | Beat |
|---|---|---|
| C-1 | `the-watch-house-ladder`, **The Watch House Ladder** | Captain Rook Harrow runs her eleven farmers like a salle and keeps a chalk Ladder on the Watch House wall. The few old Blade folk of Brindlecross gather there. Rook says the empty graves lead to Varric's barrow, under the graveyard. |
| C-2 | `the-barrowdowns`, **The Barrowdowns** | With Old Hobb's lantern, down into `inst:varric-barrow`, where the dead of the muster fence duels in the dark that never end. |
| C-3 | `bonelord-varric`, **Bonelord Varric** | **Boss 5: Sentinel A.** Release: Varric won the Schools' War in single combat, and the war ended because the other champion *yielded*. He asks if anyone has yielded since. Sets `story.sentinel.blade`. |
| C-4 | `the-champions-climb`, **The Champion's Climb** | Vellacourt is on the Stormcliffs, climbing the Storm Spire to challenge the Stormcrow, so that its scream will carry his name across the ring. |
| C-5 | `the-stormcrow`, **The Stormcrow** | **Boss 6: Sentinel B**, atop the cliffs. Freeing it lets the Storm bearer claim their mark (+1 bearers). |
| C-6 | `a-letter-from-ferro`, **A Letter from Ferro** | Ferro's letter is two words long: "End it." At Trusted, her ribbon is folded inside. At the Stone Court, the Samurai bearer says nothing at all, and the Swordsman can't stop talking. Your halves sing. |

**Featured bearers:** **No Quarter**, with the Reaver bearer in the Barrowdowns, who has come to fight Varric's dead muster and won't stop at Varric (Varric is the Reaver's Sentinel B; you have to teach an axe to yield), and **The Falcon and the Crow**, with the Falconer bearer at Cliffstair, who wants to hood the Stormcrow while you want to beat it (the Stormcrow is the Falconer's Sentinel B too). Each gives +1 `story.bearers_gathered`.

## Act III: class quests
- **III-4 The Chimera's Champion** (boss 7): Vellacourt bound into the Union Chimera as its sword-arm, still calling "Again." **Spare** him by yielding mid-fight (needs the I-5 INSIGHT or Ferro Trusted): drop your sword, and he can't fight someone who has yielded, so the Chimera's binding breaks on him. Or **destroy** him. Sets `swordsman.nemesis_fate`.
- **Ferro's Ribbon** (mentor's last request): tie Ferro's champion's ribbon to the Blade banner on the stair, handing back the title she walked away from. If `swordsman.ferro_devotable` is set, Ferro goes to Devoted (5).
- **The Kept Opponents**: Vellacourt's Revenants were walked into the Legion camp. Let each one yield. Each one says their name and lays their sword down.
- **Percy's Thousandth**: an Act I loose end. Percy Thimble came through the gate behind the hero and wants his thousandth duel at the Heart's edge, against a Hollow Legionnaire. He wins by a pin (comic relief before the end).

## Class beats in shared quests
- **II-1:** a sword is driven into the Blade arch's keystone. The hero pulls it out: it's a Ladder challenge, thirty years old, addressed to nobody.
- **II-2:** [Blade] "Watch their feet. They're circling like duellists, waiting for a gap." Maren trust +1.
- **II-4:** [Blade] "Cut a tear in two." It joins up again, as if it's older than the cut. Sets `insight.tears_uncut`, which supports `insight.tears_older`.
- **II-6:** Vellacourt is the nemesis who strikes at the Eve, stealing the **Samurai bearer's** Terrace half. He challenges them on the Abbey jetty and won't let the duel end until they let go of it.
- **III-6:** Swordsman line to the King: "Every fight you couldn't win, you just kept fighting. Yield, Casimir. It's allowed."

## Endings
| Ending | Realm | Mentor | Nemesis spared / destroyed |
|---|---|---|---|
| Turning | The Ladder board comes down, and one word is chalked in its place: Ended | Ferro takes up the sword again, to teach endings | Vellacourt hangs his sword in the Fencing Hall / his record is struck from the Ladder roll with a single line |
| Unmaking | Duels in Edgewater end only when both duellists agree. It is slow, polite and furious | Ferro opens a salle that teaches only the yield | Vellacourt loses his first bout in thirty years, to Percy / dropped from the Ladder and forgotten |
| Hollow Crown | The hero's crown ends every quarrel by decree. The salles close; nobody in Steelvale ever loses again, or wins | Ferro breaks her sword over her knee | the crown's champion, undefeated forever / a sword-scar in the throne room floor |
| First Chord | The first duel of the new Turning is fenced to a single touch, and both duellists bow | Ferro (Devoted) referees it | Vellacourt fences it, and loses gladly / his last "Again" is carved in the Hall floor, crossed out |

## Landmarks and set pieces (for Claude 2)
- `landmark:ferro-salle` (zone 1, mentor house)
- `landmark:ladder-board` and `obj:ladder-challenge-1..5` (zone 1, I-2 and I-5)
- `landmark:sisters-bridge` (zone 2)
- `landmark:varric-statue` and `landmark:grisi-salle` (zone 3)
- `landmark:armoury-roll` and `landmark:unended-gallery` (zone 4, I-7)
- `obj:blade-capital-halfstone` (lair 3, under the Hall floor)
- `obj:blade-gate-seal` (gate)

---

# SAMURAI: *Whom does a sword serve?*
| | |
|---|---|
| Start | `area:blade-frontier`, the Hushpine Terraces |
| Mentor | **Sensei Haru Kanemori** (`npc:haru-kanemori`, trust starts at 2), abbot of Hushpine. The journal counts his words for the year ("Kanemori: 11 words"), and every one is a single-word line. |
| Nemesis | **Lord Ikeda Shun** (`npc:ikeda-shun`), warlord of the Ronin Companies. Act III Union Chimera |
| Half-stone | the Terrace half, in the High Terrace shrine (lair 3) |
| Sentinels | A Bonelord Varric, B the Spinner Below |

**Silence:** the Samurai's dialogues often carry a plain "(Say nothing.)" choice. On the Temple Road and in the dojo yards it is usually the best one, and Hushpine NPCs trust it more than words.

## Act I: the Hushpine Terraces (22 quests)
### Main
| # | Quest (`quest:samurai-…`) | Where | Beat | Flags |
|---|---|---|---|---|
| I-1 | `the-bell-in-the-pines`, **The Bell in the Pines** | zone 1 | A silent night vigil on the Temple Road. The Drowned Bell rings, the pines drop every needle at once, and the Terrace half's song is the first loud thing the hero has heard in a year. Revenants walk up the pilgrim road. Kanemori spends his twelfth word of the year: "Come." Tutorial: move, draw, sheathe (sheathed stance builds focus for a draw-strike) and talk. | `samurai.bell_heard` |
| I-2 | `tea-before-steel`, **Tea Before Steel** | zone 2 | By gesture, Kanemori sends the hero with tea to five dojo yards on the Terraces. Four are empty: the novices have gone down to the Ronin Camps for pay. Black tears seep through the tea-terraces' irrigation, and the leaves are curling. | |
| I-3 | `the-ronin-fort`, **The Ronin Fort** | zone 3 to lair 1 | The Ronin Captain is press-ganging pilgrims off the road to fill the General's muster. **Boss 1: the Ronin Captain**, the loudest man on the silent frontier. | `samurai.captain_down` |
| I-4 | `the-lord-of-no-master`, **The Lord of No Master** | zone 3 | Lord Ikeda Shun rides into the camps and *thanks* the hero for beating his captain: "He served me badly. Serve no one, as I do." He frees the pilgrims, pays the novices fairly, and pours the hero a drink. He's honest, generous and very easy to like. | `samurai.ikeda_met` |
| I-5 | `the-call-to-muster`, **The Call to Muster** | zone 2 | The Thousand-Edge General has called every blade in Steelvale to the Edge Gate. The Order's elders say a sword must answer its realm's marshal. Ikeda's Ronin offer the novices another way. **Faction choice** (see below). | `samurai.oath` |
| I-6 | `the-sheathed-blade`, **The Sheathed Blade** | zone 4 to lair 2 | Whatever was chosen, someone breaks the seal on the old shrine in the Bamboo Shallows, and what was kept inside gets out. **Boss 2: the Unsheathed.** Its shrine holds an empty sheath, and the sword that belonged in it was taken thirty years ago. | `samurai.empty_sheath` |
| I-7 | `a-blade-with-no-master`, **A Blade with No Master** | zone 1 | Ikeda marches up the silent Temple Road, talking, with Blade Dancers at his back: swords with no dancers in them, hollowed by the tears he gave them. He wants the Terrace half set in himself, to become a living blade that answers to no hand, not even the Hollow King's. INSIGHT options see it coming: he has no sheath, and his hand has never once left the hilt. | `insight.samurai_bare_blade` |
| I-8 | `the-high-terrace`, **The High Terrace** | lair 3 | The top terrace and its shrine, above the clouds. **Boss 3: Ikeda (nemesis I).** The hero takes the Terrace half. Ikeda steps off the terrace into the cloud and goes down to the General's muster at the Edge Gate. | `samurai.halfstone` |
| I-9 | `the-pilgrim-road-down`, **The Pilgrim Road Down** | gate road | Kanemori's farewell, with a trust check. At Friendly he gives the hero his straw hat; at Trusted he speaks a whole sentence, more words than he has spoken in a year: "A sword serves whoever it protects. Go and protect someone." | `samurai.kanemori_farewell` |
| I-10 | `the-edge-gate`, **The Edge Gate (terrace side)** | `area:blade-gate` | **Boss 4: the Thousand-Edge General.** From the terraces, his edges can't touch a sheathed blade: it's a fight of waiting until he over-commits. Whatever the hero chose at I-5, the Hushpine novices are there: lowering their swords in his ranks, flanking him, or guarding the pilgrims behind you. Open the gate. | `story.gate_open`, `story.act = 2` |

### Side quests (8)
| Zone | Quest | Beat |
|---|---|---|
| 1 Temple Road | **The Loudest Pilgrim** | Goodwife Hettie Natter cannot stop talking on the silent road and is mortified about it. Teach her the pilgrims' hand-signs and get her to the shrine without a word. |
| 1 Temple Road | **The Pine That Fell** | A thousand-year pine fell on the night of the Bell. Count its rings with the Order's carpenter: one ring for every year, and the last thirty are black. Codex. |
| 2 Hushpine Terraces | **Tea Without Water** | Tea-Mistress Chiyo Ashina's spring is running black. Clear the tears from the source before the terraces dry. |
| 2 Hushpine Terraces | **The Novice Who Stayed** | Ten-year-old Kenta is the only novice who didn't go down to the camps. He practises alone and asks the hero to spar. Epilogue slide. |
| 3 Ronin Camps | **Nine Coins** | Daisuke Nine-Coins's company has been cheated by its paymaster. Get them paid. A sword that serves a purse, and is honest about it. |
| 3 Ronin Camps | **The Whetstone Stall** | Old Tomoe sharpens anyone's sword and asks no questions. She taught the Thousand-Edge General as a boy: "He wanted everyone to be safe. That's how it starts." Codex. |
| 4 Bamboo Shallows | **The Dancer's Partner** | One Blade Dancer isn't hostile. It dances alone in the mist, waiting. Find its partner's sword sunk in the shallows, and they dance away together. |
| 4 Bamboo Shallows | **The Frog Choir** | The Shallows' frogs are the only things on the frontier allowed to be loud, and their conductor has gone missing. Find him. Pure comedy. |

### Mentor thread (2) and bounties (2)
- **The Eleven Words** (needs Friendly): find out what Kanemori's eleven words this year were. A novice wrote each one down. In order, they make one sentence: the sheath is what the sword is for. Sets `insight.samurai_sheath` (opens the I-5 INSIGHT option if it's done first).
- **The Word He Saved** (needs Trusted): Kanemori has kept one word unspoken for thirty years. He asks the hero to bring him to the High Terrace bell at dawn so he can say it. It's a name: Shun, his student. Sets `samurai.kanemori_devotable`.
- **Bounty: the Mist Dancers** (Blade Dancers in the Shallows). **Bounty: the Pilgrim Revenant** (a Duelist Revenant that challenges everyone on the Temple Road, out loud).

### Bosses
| Boss | Fight | Black tears |
|---|---|---|
| **The Ronin Captain** (lair 1) | A huge man who shouts every attack before he makes it. On a frontier this quiet, the shouts are the telegraphs | his war-banner weeps black, and each shout rallies a hollow ronin from the stockade |
| **The Unsheathed** (lair 2) | A sword-spirit that has never been put away. It spins and can't be blocked; dodge until it overreaches, then drive it back towards its empty sheath and sheathe it to end the fight | its edge drips black, and its cuts leave hollow marks that drain focus |
| **Lord Ikeda Shun** (lair 3) | He never sheathes, so he never stops. Every Samurai instinct says attack; the fight is won by stillness: sheathe, wait, and counter-draw when he commits | tears run down his blade from his own hand; his shadow already has too many arms, the first sign of the Chimera |
| **The Thousand-Edge General** (the gate) | From the terrace side: the edges are drawn to drawn steel. Stay sheathed and let them pass, then strike the General in the gap | the tears blacken his edges. When they drain he lays them down, one by one, and kneels |

### I-5: The Call to Muster
| Choice | Immediate | Later |
|---|---|---|
| **Answer the muster** (with the Hushpine Order's elders) | the novices march down to the Edge Gate in silence; Ikeda laughs at the hero | Act I: the novices lower their swords in the General's ranks at I-10; Act II: Rook trusts the hero at once ("a soldier", Rook trust +1); Act III: harder to spare Ikeda, who calls you the General's dog |
| **Cut the oath** (with the Ronin Companies) | the novices cut their topknots and refuse the General; Ikeda is delighted; Kanemori trust −1 | Act II: Ronin deserters in the Barrowdowns fight beside you at Varric; Act III: Ikeda's hollow ronin hesitate when they see you (fewer adds at III-4) |
| **[INSIGHT] Serve the sheath** (needs `insight.samurai_sheath`) | the novices keep their swords sheathed and guard the pilgrims' road instead, serving the people and not a lord. Ikeda goes quiet | Act III: Ikeda can be spared with the empty sheath without Kanemori Trusted |

## Act II: the class thread
| # | Quest | Beat |
|---|---|---|
| C-1 | `the-quiet-pew`, **The Quiet Pew** | A handful of Hushpine pilgrims keep silence in a corner of the Chapel of the Drowned Bell, and Aldous lets them. They have been sitting over Varric's barrow for thirty years without knowing why. |
| C-2 | `the-silent-muster`, **The Silent Muster** | Down into `inst:varric-barrow`. Varric's dead muster drills in silence, and they let the Samurai walk among them as long as they make no sound. |
| C-3 | `bonelord-varric`, **Bonelord Varric** | **Boss 5.** Samurai framing: whom did Varric's sword serve? The Concord. Release: he asks whether it may be sheathed now. Sets `story.sentinel.blade`. |
| C-4 | `the-ronin-under-the-wood`, **The Ronin Under the Wood** | Ikeda is under the Gloamwood, cutting the Spinner Below's threads to free the Concord's records from their weave: "No record, no masters." The Hollow King's chains are tightening round him as he cuts. |
| C-5 | `the-spinner-below`, **The Spinner Below** | **Boss 6: Sentinel B**, in the root-caves. Freeing the Spinner lets the Umbral bearer claim their mark (+1). |
| C-6 | `kanemoris-word`, **Kanemori's Word** | A letter comes through the Gate Circle with one word in it. At Trusted there are two. At the Stone Court, the Swordsman bearer talks enough for both of you; your halves sing. |

**Featured bearers:** **The Oath Unbroken**, with the Oathbound bearer in the Barrowdowns, who has sworn to destroy Varric and asks nothing about whom the oath serves (Varric is the Oathbound's Sentinel B), and **The Shadow on the Thread**, with the Shade bearer in the Spinner's web, who has no shadow while you have no words: you cross the web together (the Spinner is the Shade's Sentinel A). +1 each.

## Act III: class quests
- **III-4 The Chimera's Blade** (boss 7): Ikeda bound into the Union Chimera as its bare sword-arm, a blade that has finally found a master. **Spare** him by offering him the empty sheath from the shrine (needs the I-5 INSIGHT or Kanemori Trusted): he sheathes his sword for the first time in thirty years, and the Chimera's binding breaks on him. Or **destroy** him. Sets `samurai.nemesis_fate`.
- **Say It for Me** (mentor's last request): Kanemori asks the hero to say his saved word, Ikeda's name, aloud in the Heart, where Shun can hear it. If `samurai.kanemori_devotable` is set, Kanemori goes to Devoted (5).
- **The Masterless**: Ikeda's hollowed ronin stand in the Legion camp with no one left to serve. Give them something to protect instead: the camp's hollowed, while you go on.
- **Kenta's Letter**: an Act I loose end. Kenta's letter is badly spelt and asks one question about the draw-strike. Answer it in a last training scene before the Citadel.

## Class beats in shared quests
- **II-1:** the Blade arch carries a Hushpine prayer-strip, thirty years faded. The hero steps out of it so quietly the wolves don't turn round.
- **II-2:** [Blade] "Say nothing. Wait for the lead wolf to commit." Maren trust +1: "First sensible thing anyone's said all week."
- **II-3:** after a year's silence, the Samurai can hear the drowned choir humming under the lake. Aldous weeps. Aldous trust +1.
- **II-6:** Ikeda strikes at the Eve, stealing the **Swordsman bearer's** Hall half. He cuts it from their belt on the Abbey jetty, the only time anyone has seen him strike first.
- **III-6:** Samurai line to the King: "A crown is a sheath. You drew the whole world and never put it away."

## Endings
| Ending | Realm | Mentor | Nemesis spared / destroyed |
|---|---|---|---|
| Turning | The novices come home from the Ronin Camps, and the Temple Road is quiet again by choice | Kanemori speaks whenever he likes, and finds he doesn't want to much | Ikeda sweeps the Temple Road in silence / his bare sword is sheathed and laid in the shrine |
| Unmaking | The Ronin Companies and the Order share the Terraces, uneasily | Kanemori spends his words arguing with Ronin | Ikeda wanders, a masterless sharpener of other people's swords / lost in the Shallows' mist |
| Hollow Crown | Every sword in Steelvale swears to the hero's crown, and the Hushpine Order becomes its guard | Kanemori never speaks again | the crown's executioner / an empty sheath on the High Terrace |
| First Chord | The High Terrace bell rings for the first Turning in silence, and everyone hears it | Kanemori (Devoted) says the whole sentence aloud | Ikeda kneels beside him / Kenta says Shun's name for him |

## Landmarks and set pieces (for Claude 2)
- `landmark:kanemori-cell` and `landmark:fallen-pine` (zone 1, mentor)
- `obj:hushpine-dojo-1..5` (zone 2, I-2)
- `landmark:ashina-spring` (zone 2)
- `landmark:ikeda-pavilion` and `landmark:tomoe-whetstone` (zone 3)
- `landmark:frog-pond` (zone 4)
- `obj:shrine-empty-sheath` (lair 2, needed for III-4)
- `obj:blade-frontier-halfstone` (lair 3)
- the shared `obj:blade-gate-seal`, terrace-side approach
