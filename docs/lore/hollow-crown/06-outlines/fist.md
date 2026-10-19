# Fist: Mountainreach (Monk and Brawler)

Realm: [02-realms.md § Mountainreach](../02-realms.md). Gate boss: **the Mountain King** at the Stair Gate. Morvane Sentinel A: **the Ooze Sovereign**.

Mountainreach was robbed: the 85th Turning should have crowned Fist. Master Doran Kell has sat on his throne carved from the summit for thirty years, waiting for what he was owed. On the night of the Bell he came down from it to sit on the last stair before the Stair Gate, and he hasn't moved since. The Monk grew up inside the cloister that trained him; the Brawler grew up in the valley that never cared.

---

# MONK: *What is owed to you?*
| | |
|---|---|
| Start | `area:fist-capital`, Stonecloister |
| Mentor | **Abbess Shirin Tal** (`npc:shirin-tal`, trust starts at 3: she raised the hero and Kestrel, two foundlings left on the same stair in the same winter) |
| Nemesis | **Brother Kestrel** (`npc:kestrel`), the hero's foster-brother. Act III Union Chimera |
| Half-stone | the Summit half, in the Summit Shrine (lair 3) |
| Sentinels | A the Ooze Sovereign, B the Stormcrow |

## Act I: Stonecloister (22 quests)
### Main
| # | Quest (`quest:monk-…`) | Where | Beat | Flags |
|---|---|---|---|---|
| I-1 | `the-bell-on-the-stair`, **The Bell on the Stair** | zone 1 | Night. The hero, a novice on the night-sweep, has reached step 611 of the Thousand Stairs when the Drowned Bell rings, and the great bell of the Bell Courts answers it with no one on the rope. The Summit half's song comes from straight up. Shirin is on landing 600, cheating the night porter at stones. Tutorial: move, staff strikes, the stillness stance and talk. | `monk.bell_heard` |
| I-2 | `tea-on-every-landing`, **Tea on Every Landing** | zone 1 | Shirin sends the hero up the Stairs with her tea-urn to pour a cup on every landing, as novices always have. Half the tea stalls are shuttered because their keepers have gone up to the Mountain King. Black tears trickle down the steps like slow rain, and the Rogue Monks coming down to meet the hero are the cloister's own. | |
| I-3 | `the-guardian-hall`, **The Guardian Hall** | zone 2 to lair 1 | The Temple Guardian has let no unworthy soul pass for nine hundred years. Now it lets nobody up and everybody down, towards the King, and novices bound for the Bell Courts are turned back weeping. **Boss 1: the Temple Guardian.** | `monk.guardian_passed` |
| I-4 | `kestrel-comes-down`, **Kestrel Comes Down** | zone 2 | Brother Kestrel walks back onto the Prayer Terraces in the Mountain King's grey, with presents for every novice and a goat on a lead. He's funnier than he used to be, and much sadder. "We were robbed, little one. You know we were." | `monk.kestrel_home` |
| I-5 | `the-empty-cells`, **The Empty Cells** | zone 3 | In the Bell Courts, Kestrel and the King's Climbers stand on one side, Shirin on the other, and the cloister votes with its feet. **Faction choice** (see below). | `monk.cells` |
| I-6 | `the-ninefold-abbot`, **The Ninefold Abbot** | zone 3 to lair 2 | Whatever was chosen, only the Ninefold Abbot can open the way to the summit. He has sat in the Silent Cell since C. 1012, meditating on what Fist was owed, and has split into nine monks who disagree with each other at great length. **Boss 2: the Ninefold Abbot.** | `monk.abbot_whole` |
| I-7 | `what-is-owed`, **What Is Owed** | zone 4 | In the Cloud Kitchen, stirring rice for the King's Climbers, Kestrel tells the hero the truth. The Mountain King is tired, and Kestrel serves someone who promised more. The Hollow King has sent word down the tears: bring him the Fist stone, and the crown will pass to Fist at last, to whoever carries it. Kestrel means that to be him. INSIGHT options let the hero notice that Kestrel's prayer beads have gone black and he still counts them. | `monk.kestrel_turned`, `insight.kestrel_beads` |
| I-8 | `the-summit-shrine`, **The Summit Shrine** | lair 3 | Above the clouds, past the Mountain King's empty throne. **Boss 3: Kestrel (nemesis I).** He knows every form the hero knows, because he learned them first. The hero takes the Summit half; Kestrel steps backwards off the summit into the clouds and is gone down the cloud-side towards the Stair Gate. | `monk.halfstone` |
| I-9 | `the-long-descent`, **The Long Descent** | gate road | Shirin walks the hero down the Stair Gate road, the first time she has left Stonecloister in thirty years. A trust check: at Friendly she gives her stones bowl, with the loaded stone still in it. At Trusted she also gives Vespers, a Mountain Goat kid with no respect for anything, as a pet. | `monk.shirin_farewell` |
| I-10 | `the-stair-gate`, **The Stair Gate** | `area:fist-gate` | **Boss 4: the Mountain King**, on the last stair. The hero can't out-hit him; they have to out-*still* him. When the tears leave him he sits down on the step and asks, "Was I owed it?" The hero answers, and opens the gate. | `monk.kell_answer`, `story.gate_open`, `story.act = 2` |

### Side quests (8)
| Zone | Quest | Beat |
|---|---|---|
| 1 Thousand Stairs | **Auntie Yuen's Last Pot** | The oldest tea-stall keeper, on landing 400, won't close though her customers have all gone up the mountain. Bring her one customer from each landing. Her tea reaches the Welcome Hall in Act II. |
| 1 Thousand Stairs | **Misprayers** | The wind has torn the prayer flags, and the novices re-stitching them have got the prayers muddled: "May my enemies have very pleasant weather." Find the originals before the Abbess reads them aloud. Comedy. |
| 2 Prayer Terraces | **Matins Ate the Sutras** | A Mountain Goat called Matins has eaten the novices' sutra scrolls and is on the roof of the meditation hall, chewing. Chase her to an old shrine nobody remembered. She is Vespers's mother. |
| 2 Prayer Terraces | **Little Brother Sop** | Sop, a novice of eight, keeps falling asleep mid-form. He isn't lazy: he is dreaming the Summit half's song as well. He returns in Act III. |
| 3 Bell Courts | **The Ringer's Arms** | Sister Agnetha Hume has rung the great bell every dawn for forty years and her arms are going; she's too proud to say so. Ring it for her, badly, and be told off for it. |
| 3 Bell Courts | **Half the Cells** | Count the empty cells and read the notes the leavers left. One is Kestrel's, from years ago, addressed to the hero and never delivered. A clue for I-7. |
| 4 Cloud Kitchen | **Slime Stew** | Cook-Brother Halvard Pottage's kitchens are overrun by Stone Slimes that have learned to sit very still in the soup pots. Find out which pots are soup. Comedy. |
| 4 Cloud Kitchen | **The King's Rice** | The Climbers are taking the cloister's rice up the mountain, and the novices' bowls are thin. Carry the rice up anyway (the King's monks are hungry too), or keep it. Either way the Climbers' old porter, Bodhan Kreel, remembers the hero at I-10. |

### Mentor thread (2) and bounties (2)
- **Stones with the Abbess** (needs Friendly): beat Shirin at stones. To win you have to catch her cheating three times. She concedes and tells the truth: on the road in C. 1012, Doran Kell heard the gates shutting ahead of him, and he turned and ran home before they closed. He has called it a robbery for thirty years because the other word was harder. Sets `insight.kell_turned_back` (opens the I-5 INSIGHT option if it's done first).
- **The Thirtieth Move** (needs Trusted): Shirin has played a game of stones with Doran Kell by messenger for thirty years, one move a year, and he has never replied. Carry her thirtieth move up to his empty throne at the summit. His answers are all there on the throne's arm, thirty of them; nobody ever carried them down. Sets `monk.shirin_devotable`.
- **Bounty: the Terrace Goats** (a herd of hollow Mountain Goats). **Bounty: the Great Stone Slime** (it lives in the Cloud Kitchen's cellar and is mostly rice).

### Bosses
| Boss | Fight | Black tears |
|---|---|---|
| **The Temple Guardian** (lair 1) | A stone warden that attacks only what moves. Cross its hall in the stillness stance between its sweeps, then strike its heart-stone from behind. | the tears fill its eye-sockets, so it sees everyone climbing as unworthy |
| **The Ninefold Abbot** (lair 2) | Nine monks, each one temper: anger, hunger, doubt, mirth and the rest. Agree with one and it vanishes. In phase 2 all nine talk at once. | the ninth is his grief, and it weeps black. Until it is beaten, the others keep coming back |
| **Kestrel** (lair 3) | A mirror fight of staff forms. He's faster, so the Monk must counter from stillness, and he grows angrier when the hero won't strike first. | his prayer beads weep black, and one bead breaks each phase |
| **The Mountain King** (the gate) | He fights with the mountain: rockfalls and breaking stairs. For the Monk it is a stillness fight: stand fast as he charges, and let the stair break round you. | his tears freeze in his beard into a black crown of icicles. When he is beaten they melt, and he sits |

### I-5: The Empty Cells
| Choice | Immediate | Later |
|---|---|---|
| **Stay** (with Shirin and the High Monastery) | the cloister bars its gate to the Climbers; Kestrel bows and leaves with forty novices | Act II: the Welcome Hall monks receive you as Stonecloister's own and help against the Ooze Sovereign; Act III: harder to spare Kestrel ("you chose a cell over me") |
| **Climb** (with Kestrel and the King's Climbers) | the hero wears the grey for a week; Shirin trust −1; the Climbers open the summit road | Act II: Climber exiles answer the hero's call on the Stormcliffs; Act III: sparing Kestrel is easier, but Shirin's last request needs Trusted |
| **[INSIGHT] "He turned back"** (needs `insight.kell_turned_back`) | the hero tells the Bell Courts what Kell did on the road; the Climbers falter, and Kestrel goes white | I-10: the Mountain King weeps first (an extra phase-skip); Act III: Kestrel's doubt is the Chimera's weak point |

## Act II: the class thread (Concordia)
| # | Quest | Beat |
|---|---|---|
| C-1 | `the-welcome-hall`, **The Welcome Hall** | In Briar Hollow stands the Fist embassy-cloister, half sunk in the bog. Six monks came ahead in C. 1012 to prepare Doran Kell's crowning, and they have swept its welcome hall every morning for thirty years. They tell the hero their Sentinel, the Stone Abbot, was eaten. |
| C-2 | `the-bog-forms`, **The Bog Forms** | The slimes of Briar Hollow are doing the Stone Abbot's forms, badly. Follow the slime-forms through the bramble to the Sovereign's pool. |
| C-3 | `the-ooze-sovereign`, **The Ooze Sovereign** | **Boss 5: Sentinel A.** It fights like a monk because it ate one. Release: the Stone Abbot walks out of it covered in slime and says, "I have been very patient." Sets `story.sentinel.fist`. |
| C-4 | `the-news-that-never-came`, **The News That Never Came** | Kestrel is on the Stormcliffs. The Stormcrow screams the news of a Turning that never came, and Kestrel wants it to scream instead that Fist is crowned. The Hollow King's smiths have begun binding him into the Chimera's arms. |
| C-5 | `the-stormcrow`, **The Stormcrow** | **Boss 6: Sentinel B**, at the top of the Stormcliffs. Beating it lets the Stormlancer bearer claim the Storm mark (+1 bearers). |
| C-6 | `a-move-by-post`, **A Move by Post** | Vespers trots through the Gate Circle with Shirin's letter in her collar (a Climber runner brings it if the hero has no Vespers). It is a stones move, and a cheating one. Then the Stone Court: the Monk and the Brawler bearer. The Brawler wants to spar; the Monk may decline. |

**Featured bearers:** **The Patient Bog**, with the Hedgewitch bearer at Thornhollow, who wants to compost the Ooze Sovereign's pool. The Monk asks what the bog is owed, and they find out together. And **One Breath First**, with the Stormlancer bearer at Cliffstair, who wants to charge the Stormcrow alone. The Monk teaches them to wait one breath. Each gives +1 `story.bearers_gathered`.

## Act III: class quests
- **III-4 The Arms of the Chimera** (boss 7): Kestrel is bound into the Union Chimera as its arms, striking with the stolen Pit half. **Spare** him: with the I-5 INSIGHT or Shirin Trusted, the hero sits down in the middle of the fight. Kestrel has never once seen them give up, and he stops. Or **destroy** him. Sets `monk.nemesis_fate`.
- **The Last Move** (mentor's last request): play Shirin's final stones move on the Citadel floor. It ends the thirty-year game in a draw. If `monk.shirin_devotable` is set, Shirin goes to Devoted (5).
- **Forty Novices**: the novices who went with Kestrel stand hollow in the Legion camp. Bring each one back by name, with a cup of tea from Auntie Yuen's pot.
- **Sop on the Stair**: an Act I loose end. Little Brother Sop followed the song all the way through the Stair Gate and is asleep on the Fist stair of the Twelve Stairs, perfectly safe. Carry him.

## Class beats in shared quests
- **II-1:** the Fist arch has a stair carved up its side, in Kell's own style, and it stops halfway.
- **II-2:** [Fist] Monk: "Stand still. Let them come past you." The wolves part round the Monk like water. Maren laughs for the first time; Maren trust +1.
- **II-3:** in Aldous's boat the Monk's breath-count matches the Abbey's old bell-count. They sit in silence for one full bell. Aldous trust +1.
- **II-6:** Kestrel strikes at the Eve, stealing the **Brawler bearer's** Pit half.
- **III-6:** Monk line to the King: "Nobody owed you the Chord. That's why it would have been a gift."

## Endings
| Ending | Realm | Mentor | Nemesis spared / destroyed |
|---|---|---|---|
| Turning | The crown passes to Fist at last. The Mountain King walks down all the Thousand Stairs to kneel to it, and Stonecloister's cells fill again | Shirin Tal is crowned the Fist Concordant, and cheats at the coronation stones | Kestrel carries the crown up the Thousand Stairs, every one / his beads hang in the Summit Shrine |
| Unmaking | No crown for Fist, ever. Kell comes down anyway and keeps a tea stall on landing 900 | Shirin opens the cloister gate to anyone at all | Kestrel sweeps the Thousand Stairs, all of them, every day / a blank stone in the Summit Shrine |
| Hollow Crown | Mountainreach is owed nothing ever again, because it takes | Shirin shuts herself in the Silent Cell | Kestrel is your champion / his staff lies in two pieces at your door |
| First Chord | Stonecloister's great bell rings the first bell of the new Turning, and the monks sit perfectly still through all of it | Shirin (Devoted) rings it with Kell, who finally replies | Kestrel counts the strokes / his beads are rung in the bell |

## Landmarks and set pieces (for Claude 2)
- `landmark:landing-600-tea-stall` (zone 1, I-1)
- `obj:landing-cup-1..6` (zone 1, I-2)
- `landmark:yuen-tea-stall` (zone 1, landing 400)
- `landmark:guardian-hall-gate` (zone 2, lair 1 entrance)
- `landmark:meditation-hall-roof` (zone 2)
- `landmark:abbess-rooms` (zone 3, mentor house)
- `landmark:great-bell` (zone 3)
- `landmark:silent-cell-door` (zone 3, lair 2 entrance)
- `obj:shirin-stones-board` (zone 3, mentor thread)
- `landmark:cloud-kitchen-hearth` (zone 4)
- `landmark:mountain-king-throne` (lair 3 approach, mentor thread)
- `obj:fist-capital-halfstone` (lair 3)
- `obj:fist-gate-seal` (gate)

---

# BRAWLER: *Who are you fighting for?*
| | |
|---|---|
| Start | `area:fist-frontier`, the Lowfold Pits |
| Mentor | **"Pops" Tobiah Knuckle** (`npc:tobiah-knuckle`, trust starts at 2: he has only just agreed to corner the hero, for a bowl of noodles a week) |
| Nemesis | **Silas Gaunt, the Promoter** (`npc:silas-gaunt`). Act III Union Chimera |
| Half-stone | the Pit half, in the Quarry Throne (lair 3) |
| Sentinels | A the Ooze Sovereign, B Ashmaw |

## Act I: the Lowfold Pits (22 quests)
### Main
| # | Quest (`quest:brawler-…`) | Where | Beat | Flags |
|---|---|---|---|---|
| I-1 | `the-bell-in-round-three`, **The Bell in Round Three** | zone 1 | A night bout in a Knuckletown village ring. The hero is winning on points when the Drowned Bell rings. Everyone thinks it's the round bell, the hero turns for their corner, and gets knocked flat. They wake with the Pit half's song in their chest and Pops fanning them with a noodle menu. Tutorial: move, punch, block and get up. | `brawler.bell_heard` |
| I-2 | `noodles-and-debts`, **Noodles and Debts** | zone 1 | Pops sends the hero round Knuckletown with noodle deliveries and his little book of small debts. Three of the names are fighters who lost in the outlaw rings last month. Their doors are locked, and there are black tears under them. | |
| I-3 | `the-broken-fist-dojo`, **The Broken Fist Dojo** | zone 3 to lair 1 | The Master of the Broken Fist, who threw a Lowfold final for a bag of coin twenty years ago, takes in beaten young fighters. They come out of his dojo hollow-eyed and very obedient. **Boss 1: the Master of the Broken Fist.** | `brawler.dojo_closed` |
| I-4 | `the-promoters-offer`, **The Promoter's Offer** | zone 2 | Silas Gaunt, all silk scarf and kind eyes, pays for the dojo's damage, shakes the hero's hand in front of the whole Pits, and offers them a title shot at the Grand Pit with the purse paid in advance. "Nobody fights for free. Not while I'm around." | `brawler.silas_met` |
| I-5 | `whose-purse`, **Whose Purse** | zone 2 | The Pit Leagues want the hero to fight for the League belt and the League's good name. The King's Climbers, down from the peaks recruiting, want them to fight for the Mountain King and clear the outlaw rings by force. **Faction choice** (see below). | `brawler.purse` |
| I-6 | `big-mother-ox`, **Big Mother Ox** | zone 2 to lair 2 | Either way the road goes through the Grand Pit: for the belt, or because the Climbers mean to take the arena and its champion won't stand aside. Big Mother Ox, unbeaten for nineteen years, can't lie down any more. The tears won't let her lose, and she's frightened of what Silas does with losers. **Boss 2: Big Mother Ox.** | `brawler.ox_rests` |
| I-7 | `sold-by-the-head`, **Sold by the Head** | zone 4 | The missing fighters' trail runs into the Quarry Rings. Silas sells every beaten fighter to the Hollow Legion, by the head, through a quarry tunnel that seeps under the Stair Gate. He wants the Pit half because a half-stone stops the tears where it lies: his Quarry Throne will be the only ring in the Lowfold where nobody goes hollow, and everyone will pay to stand in it. INSIGHT options let the hero remember that the coins in the I-4 purse were wet. | `brawler.silas_turned`, `insight.wet_purse` |
| I-8 | `the-quarry-throne`, **The Quarry Throne** | lair 3 | **Boss 3: Silas (nemesis I).** He doesn't fight fair, and he doesn't fight alone. The hero takes the Pit half from the throne's seat; Silas rides the quarry crane-lift up and away towards the Stair Gate. | `brawler.halfstone` |
| I-9 | `in-your-corner`, **In Your Corner** | gate road | Pops pushes his noodle cart up the Stair Gate road behind the hero, the whole way. A trust check: at Friendly he gives his corner towel. At Trusted he also gives his championship belt, unworn since the night in C. 1009 he knocked down Doran Kell. | `brawler.pops_farewell` |
| I-10 | `the-stair-gate`, **The Stair Gate (Lowfold side)** | `area:fist-gate` | **Boss 4: the Mountain King.** Knuckletown turns out to watch. The King won't fight "a pit-rat" until Pops shouts up who knocked him down in C. 1009. He can't be beaten on points: get knocked down and get up again until he tires. When the tears leave him he laughs, for the first time in thirty years. Then open the gate. | `story.gate_open`, `story.act = 2` |

### Side quests (8)
| Zone | Quest | Beat |
|---|---|---|
| 1 Knuckletown | **Honest Abigail's Book** | Honest Abigail Tuck, the only bookie who has never taken a bet against a local fighter, is being pushed out by Silas's runners. Win three bouts on her book. She runs the betting at Kilnmouth's ash-pits in Act II. |
| 1 Knuckletown | **The Bunting Committee** | Knuckletown's fight bunting has gone black at the edges. Take it all down and put it all up again before the title bout, under the eye of three old women with very firm opinions. Comedy. |
| 2 the Lowfold Pits | **Doc Lint's Thread** | Cutwoman Doc Saffie Lint has run out of stitching silk, and the only silk in the valley is on a smuggler's goat. Fetch it, and learn her rule: "Nobody bleeds in my corner for longer than they have to." |
| 2 the Lowfold Pits | **Tin-Can Tilly** | Tilly, twelve, wants to fight in the pits. Pops says no. Find a way to say no that doesn't break her: teach her to work a corner instead. She turns up in Concordia in Act II. |
| 3 the Goat Paths | **Old Nob's Goats** | Old Nob Furze smuggles by goat, and his goats have gone hollow and keep taking the wrong paths. One is carrying a letter from the King's Climbers to Silas: a clue for I-7. |
| 3 the Goat Paths | **One Coat** | Two rival village champions, who have hated each other for eleven years, are stuck on the Goat Paths in a snowstorm with one coat. Get them to share it. |
| 4 the Quarry Rings | **The Undercard** | The outlaw rings make their undercard fight in the dark. Win the undercard's purse and hand it to the fighters. |
| 4 the Quarry Rings | **Names on the Wall** | Scratched into a quarry cell wall: the name of every fighter Silas has sold. Copy them out for Pops, who reads every one. They are used in Act III. |

### Mentor thread (2) and bounties (2)
- **The Towel** (needs Friendly): Pops's story, told over noodles. He cornered Silas when Silas was sixteen, and threw in the towel to save the boy's eye: the only time he ever did. The next morning Silas's promoter sold his contract, and Silas learned that nobody fights for you. Sets `insight.silas_towel` (opens the I-5 INSIGHT option if it's done first).
- **The Last Herb** (needs Trusted): Pops's noodle stock has been simmering since C. 1003. It's missing one thing: a mountain herb his late wife used to pick on the Goat Paths. Find it where she found it. Sets `brawler.pops_devotable`.
- **Bounty: the Quarry Slimes** (a Stone Slime brood). **Bounty: the Rogue Monk Gang** (Rogue Monks who mug pilgrims on the Goat Paths and lecture them afterwards).

### Bosses
| Boss | Fight | Black tears |
|---|---|---|
| **The Master of the Broken Fist** (lair 1) | His right hand was broken in the thrown final and never set. He fights with the other: feints, sand, low blows. Beat him clean and he stops cheating. | his broken hand weeps black, and every blow it lands is a "pulled punch" that weakens the hero's next strike |
| **Big Mother Ox** (lair 2) | A huge grappler using the ring ropes. Knock her down and she gets back up. In the last phase stop hitting, catch her as she falls, and hold her up. | the tears pool under her feet like roots and won't let her fall |
| **Silas Gaunt** (lair 3) | A tag-team fight: he sends in the hollowed missing fighters. Don't knock them out, because they're the people you came for; push them out of the ring. He throws sand and rings the bell early. | Silas is dry as dust. The tears are in his money: coins spill and hollow the canvas where they land |
| **The Mountain King** (the gate) | From the Lowfold side, a title bout on the last landing. He hits like a rockfall; the Brawler wins by getting up from every knockdown, healed by the crowd's chant. | his fists are gloved in black tears frozen hard as stone. Each time the hero gets up, they crack a little more |

### I-5: Whose Purse
| Choice | Immediate | Later |
|---|---|---|
| **Fight for the League** (with the Pit Leagues) | the League sponsors the title shot, and Pops gets a corner stool with his name on it | Act II: the Lowfold fighters of the cellar ring stand with you at the Ooze Sovereign; Act III: harder to spare Silas ("you fought for a belt") |
| **March with the Climbers** (the King's Climbers) | the Climbers storm two outlaw rings and free some sold fighters early; Pops trust −1 ("monks hit people for nothing and call it virtue") | Act II: Climber exiles fight beside you at Kilnmouth; Act III: more of the sold fighters are still alive to bring home |
| **[INSIGHT] "I'm fighting for the ones he sold"** (needs `insight.silas_towel`) | the hero fights the title bout for no purse, only the names; Silas comes to watch in person | Act III: Silas can be spared by offering him a corner: Pops's towel |

## Act II: the class thread (Concordia)
| # | Quest | Beat |
|---|---|---|
| C-1 | `the-cellar-ring`, **The Cellar Ring** | Under the Briar & Kettle in Thornhollow, Lowfold fighters stranded since C. 1012 run a Saturday ring. They tell the hero that the Fist Sentinel was eaten by the Ooze Sovereign, which now "fights like a monk, which is cheating". |
| C-2 | `bog-sparring`, **Bog Sparring** | Every slime in Briar Hollow wants a bout. Spar your way through the bramble to the Sovereign's pool. |
| C-3 | `the-ooze-sovereign`, **The Ooze Sovereign** | **Boss 5: Sentinel A.** Release: the Stone Abbot, freed, takes one look at the Brawler's gloves and asks to be shown how they go on. Sets `story.sentinel.fist`. |
| C-4 | `the-ashmaw-bout`, **The Ashmaw Bout** | Silas is in Kilnmouth. He has put the beast under the kilns on his fight card, he's selling tickets, and he's selling the losers to the Legion. The Hollow King's smiths are fitting him to the Chimera's chest, and he has negotiated a percentage. |
| C-5 | `ashmaw`, **Ashmaw** | **Boss 6: Sentinel B**, under the kilns. Beating it lets the Reaver bearer claim the Ash mark (+1 bearers). |
| C-6 | `a-menu-with-a-message`, **A Menu with a Message** | Pops's letter, written on the back of a noodle menu, comes through the Gate Circle with Tin-Can Tilly, who was not supposed to come. Then the Stone Court: the Brawler and the Monk bearer. The Monk says the Brawler fights like a door slamming, and means it kindly. |

**Featured bearers:** **The Reaver's Bout**, with the Reaver bearer in Kilnmouth's ash-pits. Both are hunting Ashmaw, and the Reaver wants a bout first to settle who goes down first. And **Knight Errant**, with the Knight bearer at the Cinder Mug, who means to pay Silas's prices to buy back the sold fighters. The Brawler shows them a cheaper way. Each gives +1 `story.bearers_gathered`.

## Act III: class quests
- **III-4 The Promoter's Corner** (boss 7): Silas is bound into the Union Chimera as its chest and its voice: he calls the rounds and it fights them. **Spare** him: throw in Pops's towel and save him the way Pops once did (needs the towel and either the I-5 INSIGHT or Pops Trusted). Or **destroy** him. Sets `brawler.nemesis_fate`.
- **Pops's Stock** (mentor's last request): set Pops's stock-pot bubbling at the foot of the Twelve Stairs, so the hollowed can smell it. If `brawler.pops_devotable` is set, Pops goes to Devoted (5).
- **Calling the Names**: the sold fighters stand in the Legion camp. Read out the names from the quarry wall; each one who hears their name turns round.
- **Big Mother Ox Comes Through**: an Act I loose end. Big Mother Ox has come through the Stair Gate to stand on the Fist stair. She's never been to Concordia and isn't impressed. When it's over, she finally lies down.

## Class beats in shared quests
- **II-1:** the Fist arch is scuffed knee-high where someone in Concordia has kicked it for thirty years. [Fist] "Add one."
- **II-2:** [Fist] Brawler: "Square up to the alpha. Just the alpha." Maren trust −1 ("you'll get bitten"), or +1 if the hero wins it.
- **II-4:** Nan Briar's cat Parson bites anyone in red, and the Brawler's gloves are red. [Fist] "Let him." Nan trust +1.
- **II-6:** Silas strikes at the Eve, stealing the **Monk bearer's** Summit half.
- **III-6:** Brawler line to the King: "Thirty years with nobody in your corner. That isn't strength. That's just lonely."

## Endings
| Ending | Realm | Mentor | Nemesis spared / destroyed |
|---|---|---|---|
| Turning | The crown passes to Fist, and the Lowfold insists the Concordant be chosen in the Grand Pit. Big Mother Ox wins and cries | Pops caters the coronation | Silas is a cornerman, and terrible at it / the Quarry Throne is broken up for corner-posts |
| Unmaking | The Pit Leagues forbid the selling of contracts, and the outlaw rings close | Pops retires, and runs the cart anyway | Silas sweeps out the Grand Pit / his scarf hangs on the quarry wall |
| Hollow Crown | Every quarrel in the ring is settled in your pits, by your rules | Pops won't corner you | Silas promotes you / his bell hangs over your throne |
| First Chord | The Lowfold's round-bells ring the first note of the new Turning, and nobody hits anybody | Pops (Devoted) rings his with a ladle | Silas rings the round-bell and nobody fights / his scarf ties the bell-rope |

## Landmarks and set pieces (for Claude 2)
- `landmark:knuckletown-village-ring` (zone 1, I-1)
- `landmark:pops-noodle-cart` (zone 1, mentor house)
- `obj:pops-stock-pot` (zone 1, mentor thread)
- `landmark:abigail-book-stall` (zone 1)
- `landmark:grand-pit-gate` (zone 2, lair 2 entrance)
- `landmark:doc-lint-tent` (zone 2)
- `landmark:broken-fist-dojo-door` (zone 3, lair 1 entrance)
- `landmark:nob-goat-shed` (zone 3)
- `landmark:quarry-names-wall` (zone 4)
- `obj:fist-frontier-halfstone` (lair 3)
- the shared `obj:fist-gate-seal`, Lowfold-side approach
