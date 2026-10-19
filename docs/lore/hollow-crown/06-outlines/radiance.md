# Radiance: Solaria (Cantor and Oathbound)

Realm: [02-realms.md § Solaria](../02-realms.md). Gate boss: **the Fallen Hierarch** at the Dawn Gate. Morvane Sentinel A: **Abbess Morwen**.

---

# CANTOR: *Is it kind to never let the dark in?*
| | |
|---|---|
| Start | `area:radiance-capital`, Dawnspire |
| Mentor | **Mother Celestine Hale** (`npc:celestine-hale`, trust starts at 2) |
| Nemesis | **Inquisitor Lucan Brightwater** (`npc:lucan-brightwater`) of the Brightwatch, Act III Herald |
| Half-stone | the Altar half, on the High Altar of the Sun Cathedral (lair 3) |
| Sentinels | A Abbess Morwen, B the Weeping Willow |

There is no night in Dawnspire, so nobody in Dawnspire can grieve properly: grief keeps for the dark, and there isn't any. The Cantor's campaign is about what that costs. Lucan's mother died on the last night Dawnspire had, in C. 1012, and he has not slept since.

## Act I: Dawnspire (22 quests)
### Main
| # | Quest (`quest:cantor-…`) | Where | Beat | Flags |
|---|---|---|---|---|
| I-1 | `the-hour-of-no-night`, **The Hour of No Night** | zone 1 | Night, or what Dawnspire calls night: the Hour of Lamps, when the Cathedral turns its light down one notch. The novices sing it on the Close steps, swaying. The Drowned Bell rings, the light flickers for one heartbeat, and the whole city sees a star. The hero wakes from a doze mid-hymn with the Altar half's song in their chest and says "It went dark." Celestine covers for them before the Brightwatch hears. Tutorial: move, cast and talk. | `cantor.bell_heard` |
| I-2 | `the-sleepers-census`, **The Sleepers' Census** | zone 1 | Sleeping in the Hours of Light is forbidden, so Celestine sends the hero round the Close to wake the novices who've nodded off before the Brightwatch finds them. They aren't asleep. They're weeping black in their sleep, and going hollow: people who can't sleep or grieve fill up with the tears instead. Hollow Lightbearers stalk the squares, looking for anyone who isn't singing. | |
| I-3 | `the-bell-loft`, **The Bell Loft** | zone 2 to lair 1 | The Cathedral's great bell is rung every minute to keep Dawnspire awake. Since the Drowned Bell it hasn't stopped at all, and the Choir is collapsing on its feet. Silence it. **Boss 1: the Seraph of the Last Light.** | `cantor.bell_loft_quiet` |
| I-4 | `the-inquisitors-kindness`, **The Inquisitor's Kindness** | zone 3 | Inquisitor Lucan Brightwater raids the sleep-draught sellers of the Sunward Market, gently. He gives each seller he arrests a loaf and a blanket. He wears smoked spectacles against the glare and thanks the hero for quieting the bell. "Now help me keep the light, quietly. Everyone's so tired." He asks them to find the way into the Undercroft. | `cantor.lucan_met` |
| I-5 | `the-jars-of-night`, **The Jars of Night** | zone 4 | Under the Cathedral the forbidden night is kept in jars, and Sister Amabel keeps the jars. The Brightwatch wants them broken in the sun; the Choir wants one opened in the Cloisters so the novices can sleep. **Faction choice** (see below). | `cantor.night_jars` |
| I-6 | `the-reliquary-of-hours`, **The Reliquary of Hours** | zone 2 to lair 2 | Whatever was chosen, someone goes looking for the Reliquary: the Brightwatch, for the Saint of Noon's relic to bless the light, or the hero, hiding from the Brightwatch. The false relics get up and assemble themselves. **Boss 2: the Saint Who Wasn't.** In its ribcage is the one true relic in the vault: a child's night-candle in a Brightwatch evidence box, labelled "L. B., C. 1012". | `cantor.night_candle` |
| I-7 | `the-last-night`, **The Last Night** | zone 3 | The candle is Lucan's. He lit it the night his mother died, the last night Dawnspire had. He wants the Altar half set in the Sun Cathedral's great lens to make the light permanent: no Dimming, no Undercroft, no dark anywhere in Solaria, ever, so that nobody has to lose anyone in the night again. INSIGHT options let the hero see it early: ask him when he last slept, and watch him fail to remember. | `insight.lucan_awake` |
| I-8 | `the-high-altar`, **The High Altar** | lair 3 | The heart of the Sun Cathedral, where the lens burns. **Boss 3: Lucan (nemesis I).** The hero lifts the Altar half (only its bearer can), and Lucan escapes along a beam of his own light towards the Dawn Gate, where the Fallen Hierarch waits. | `cantor.halfstone` |
| I-9 | `the-dawn-road`, **The Dawn Road** | gate road | Celestine's farewell, with a trust check. At Friendly she gives her censer; at Trusted she sings the hero Compline on the road, and falls asleep halfway through her own farewell. They tuck her halo-pin into the hero's hand when she wakes. | `cantor.celestine_farewell` |
| I-10 | `the-dawn-gate`, **The Dawn Gate** | `area:radiance-gate` | **Boss 4: the Fallen Hierarch.** The hero opens the gate with the Altar half and steps through. | `story.gate_open`, `story.act = 2` |

### Side quests (8)
| Zone | Quest | Beat |
|---|---|---|
| 1 Cathedral Close | **The Word for It** | Sergeant Osgood Bellamy of the Brightwatch must fine anyone who says "night", and fines himself every morning for dreaming. Help him find a word for it that isn't illegal: "the long dusk", "the soft hour", "Tuesday". Epilogue slide. |
| 1 Cathedral Close | **The Pilgrim Who Saw Stars** | Prue Haverlock walked all the way from the Gilded March to report a miracle: the Dimming has stars in it. The Brightwatch wants her quiet. Hide her in the Choir until she can go home. Epilogue slide: she's back on the March, teaching her village the names of the stars. |
| 2 Choir Cloisters | **Nodding Off** | Novice Tobit Lark keeps falling asleep mid-hymn. Cover for him through the whole of Lauds by singing his part as well as yours (a rhythm game). Tobit returns in Act III. |
| 2 Choir Cloisters | **The Moonflower** | The Cloister garden has a bed of moonflowers that hasn't bloomed in thirty years, because they only open at night. Take one down to the Undercroft's dark and grow it. It blooms; in Act II it's the gift that calms the Weeping Willow's first phase. |
| 3 Sunward Market | **Madame Lull's Draughts** | Madame Dovina Lull sells sleep-draughts from a cart that keeps moving. The Brightwatch is closing in. Help her, or turn her in to Lucan. If helped, she is in Abbeyshore in Act II, selling lullabies to the drowned choir. |
| 3 Sunward Market | **Closed for One Hour** | Grocer Albin Mote wants to close his stall for one hour, just once, and the Market Charter forbids it. Find the loophole in the Charter (a stall may close "for reasons of darkness"). |
| 4 Undercroft | **Rain at Night** | Old Orla Penwright, nearly blind, wants to hear one jar on the shelves before she dies: "rain at night, C. 1009". Open it for her. She listens to the whole thing. |
| 4 Undercroft | **The Hierarch's Shadow** | The Undercroft holds the only shadows in Dawnspire, and one of them belongs to nobody in the city. It's the Fallen Hierarch's: he left it here when he shut himself in the light. Bottle it and carry it to the gate. At I-10, giving it back skips a phase. |

### Mentor thread (2) and bounties (2)
- **Compline** (needs Friendly): the Choir used to sing Compline, the evening hymn that sang the light down gently each day, until the Hierarch banned it. Celestine remembers the first line and nothing else. Find the last copy, pasted inside the lid of one of Madame Lull's draught-crates. Sets `insight.compline` (opens the I-5 INSIGHT option if it's done first).
- **Six Years Awake** (needs Trusted): why Celestine hasn't slept. Six years ago the Brightwatch took her dearest friend, Sister Amabel, for singing Compline, and Celestine has sung every hour since so that they would never have cause to take the Choir. Amabel wasn't taken far: she's the keeper of the Undercroft's jars. Bring them together. Celestine falls asleep on the spot, sitting up, holding Amabel's hand. Sets `cantor.celestine_devotable`.
- **Bounty: the Overzealous Acolytes** (Zealous Acolytes gone hollow). **Bounty: the Lantern Lightbearers**.

### Bosses
| Boss | Fight | Black tears |
|---|---|---|
| **The Seraph of the Last Light** (lair 1) | A six-winged guardian that swings the great bell, sending rings of blinding light across the loft; hide in the shadow the bell itself throws, and cut the bell-ropes one by one | its light has a black core, and it weeps from all six eyes |
| **The Saint Who Wasn't** (lair 2) | A relic-golem of false saints' bones that flings reliquaries; as it's hurt the fakes fall off it (a donkey's jaw, a chicken's wishbone, a great many pigs' knuckles) until only the one true relic is left | its gilded reliquaries fill with the black tears of every pilgrim who prayed to a fake, and spill when struck |
| **Inquisitor Lucan Brightwater** (lair 3) | He focuses the great lens on the hero, and the only safe ground is shadow; he purges the shadows one by one, and the half-stone's song makes new ones | black tears run from under his smoked spectacles; first sign of the Herald |
| **the Fallen Hierarch** (the gate) | For the Cantor it's a dimming fight: he blazes, and the hero sings the light down between phases until they can reach his mask and lift it off. Under it he is weeping and very old. | when beaten the tears leave him, and he asks, very quietly, for the dark. The Cantor sings Compline (or a plain lullaby), and he lies down across the gate and sleeps |

### I-5: The Jars of Night
| Choice | Immediate | Later |
|---|---|---|
| **Break them in the sun** (with the Brightwatch) | the night is gone for good; Lucan trusts the hero completely; Amabel weeps; Celestine trust −1 | Act II: Brightwatch letters of passage open the Shore Chapel to the hero; Act III: harder to spare Lucan ("you burned it too") |
| **Open one in the Cloisters** (with the Choir) | one hour of dark in the Cloisters; the novices sleep for the first time in years, and some wake crying ordinary tears; the Brightwatch posts the hero's face as a night-speaker | Act II: the Choir's sleeping hymn, learned that hour, quiets the drowned choir at the Abbey (C-2) |
| **[INSIGHT] Sing Compline** (needs `insight.compline`) | the hero sings the evening hymn, and the jars open only as far as people need: the whole Close dims to dusk for one hour. Lucan hears it from the Market and stops dead; he remembers it from when he was a boy | Act III: the Herald can be sung to sleep, which opens the gentlest way to spare him |

## Act II: the class thread (Concordia)
| # | Quest | Beat |
|---|---|---|
| C-1 | `abbeyshore`, **The Shore Chapel** | The Radiance diaspora at Abbeyshore. Its little Shore Chapel sings the hours towards the lake, where the drowned choir sings back. Brother Aldous is here, and so is Madame Lull if she was helped. Abbess Morwen holds the drowned nave. |
| C-2 | `the-drowned-choir`, **The Drowned Choir** | Down to the nave, by Tamsin's ferry and then underwater. The drowned choir sings anyone who swims near to sleep, for good. The Cantor has to sing against them, or with them. |
| C-3 | `abbess-morwen`, **Abbess Morwen** | **Boss 5: Sentinel A.** Release: she kept the Turning Bell for a thousand years, and asks the Cantor whether it will be rung for a Turning or a funeral. "Both," says the Cantor, if Compline is known. Sets `story.sentinel.radiance`. |
| C-4 | `the-light-in-the-wood`, **The Light in the Wood** | Lucan is at Stag's Rest in the Gloamwood, trying to burn the black tears out of the Weeping Willow with a lens of his own. It's only making her weep harder. |
| C-5 | `the-weeping-willow`, **The Weeping Willow** | **Boss 6: Sentinel B**, at Stag's Rest. Freeing her lets the Hedgewitch bearer claim the Verdant mark (+1 bearers). The moonflower, if grown, calms her first phase. |
| C-6 | `celestines-lullaby`, **Celestine's Lullaby** | A letter from Celestine comes through the Radiance arch. It is a lullaby with words, and a note at the bottom: "I slept. Twice." (If the hero is a wanted night-speaker, Madame Lull smuggles it.) Then the Stone Court: the Cantor and the Oathbound bearer. |

**Featured bearers:** **A Duet for the Drowned**, with the Bard bearer at Abbeyshore, who wants to write the drowned choir a song worth waking for (Morwen is Song's Warden too, and the Willow is the Bard's), and **What the Willow Feeds**, with the Ranger bearer at Stag's Rest, who thinks the Willow should be let die so the wood can grow. Each gives +1 `story.bearers_gathered`.

## Act III: class quests
- **III-4 The Herald of Noon** (boss 7): Lucan remade as the Herald, in a robe of white fire with a crown of rays, ringing a bell that rings noon and never stops. **Spare** him by singing him to sleep in the Heart's dark, for the first time since he was a boy (needs the I-5 Compline or Celestine Trusted). Or **destroy** him. Sets `cantor.nemesis_fate`.
- **Compline at the Citadel** (mentor's last request): Celestine asks the hero to sing Compline at the Citadel, "so that I'll hear it, wherever I am, and can sleep". If `cantor.celestine_devotable` is set, Celestine goes to Devoted (5).
- **The Brightwatch Recruits**: Lucan's young inquisitors followed him into the Heart and stand hollow in the Legion camp, still saluting a sun that isn't there. Bring them back.
- **Tobit Lark Falls Asleep**: an Act I loose end. Tobit snuck through the Dawn Gate after the hero, and has fallen asleep in the Legion camp. The hollowed have tucked him in. Get him out without waking him (comic relief before the end).

## Class beats in shared quests
- **II-1:** the Radiance arch is the only lit arch at the Gate Circle at dusk, and the wolves flinch from it.
- **II-2:** [Radiance] "Dim your halo. Let them come close enough to see they're frightened." Maren trust +1.
- **II-3:** Godric hears the Cantor sing an hour-hymn and joins in: he knows the old Citadel hours by heart. Godric trust +1, and a step towards `insight.godric_saw`.
- **II-6:** Lucan strikes at the Eve, stealing the **Oathbound bearer's** March half.
- **III-6:** Cantor line to the King: "Nobody let you grieve in the dark, did they? So you wept on all of us."

## Endings
| Ending | Realm | Mentor | Nemesis spared / destroyed |
|---|---|---|---|
| Turning | The Sun Cathedral sets the sun at last, and Dawnspire sleeps its first night in thirty years. Compline is sung again. | Celestine sleeps for a week, and wakes as Hierarch | Lucan keeps the night-watch with a candle, for anyone afraid of the dark / his spectacles are left on the High Altar |
| Unmaking | Solaria has night again, unevenly: some towns sleep, some keep the light, and they argue about it | Celestine founds a choir of night-singers with Amabel | Lucan walks the Dimming with a lantern, unarmed / the Brightwatch is disbanded |
| Hollow Crown | The hero's light never sets over any realm. Nobody sleeps again. | Celestine walks out of Dawnspire to the March, to sleep | Lucan is the crown's lamplighter / nobody says his name in the light |
| First Chord | The Cathedral rings the new Turning at dusk, and the hymn has a rest in it where the night comes in | Celestine (Devoted) sings Compline in the Citadel | Lucan sleeps through it, and dreams / Amabel sings his mother's lullaby for him |

## Landmarks and set pieces (for Claude 2)
- `landmark:celestine-cell` (zone 2, mentor house)
- `landmark:close-steps` and `landmark:brightwatch-house` (zone 1)
- `obj:sleeping-novice-1..6` (zone 1, I-2)
- `landmark:bell-loft-stair` (zone 2, lair 1 entrance)
- `landmark:moonflower-bed` (zone 2)
- `landmark:lull-cart` (zone 3)
- `landmark:undercroft-jar-shelves` and `obj:night-jar` (zone 4, I-5)
- `obj:hierarchs-shadow` (zone 4)
- `landmark:great-lens` (lair 3)
- `obj:radiance-capital-halfstone` (lair 3)
- `obj:radiance-gate-seal` (gate)

---

# OATHBOUND: *What do you owe a promise when the one you promised has fallen?*
| | |
|---|---|
| Start | `area:radiance-frontier`, the Gilded March |
| Mentor | **Ser Beatrix Holm** (`npc:beatrix-holm`, trust starts at 2: she likes nobody until they've kept a promise) |
| Nemesis | **Dame Ilsabet of the Sorrow-Oath** (`npc:ilsabet`), Beatrix's old shield-companion. Act III Herald |
| Half-stone | the March half, in the Dimming Shrine (lair 3) |
| Sentinels | A Abbess Morwen, B Bonelord Varric |

The Oathbound swear to the Hierarch, and the Hierarch has fallen. The Sorrow-Oath is the Order's oldest vow, sworn by a knight whose lord has fallen: to keep the lord's last command. Ilsabet swore it in C. 1012, to the crown.

## Act I: the Gilded March (22 quests)
### Main
| # | Quest (`quest:oathbound-…`) | Where | Beat | Flags |
|---|---|---|---|---|
| I-1 | `the-vigil`, **The Vigil** | zone 1 | The hero keeps the night vigil in the Hall of Broken Swords before swearing into the Order. The Drowned Bell rings and every broken sword in the hall rings with it. The half-stone wakes in their chest mid-oath. Beatrix, at the door: "Finish the oath. Then we'll talk." The hero swears the Oath of the March in their own words (one of three), and it is quoted back to them at the end. Tutorial: move, guard and talk. | `oathbound.bell_heard`, `oathbound.oath_words` |
| I-2 | `no-village-alone`, **No Village Alone** | zone 2 | "No village of the March shall stand alone," says the Oath. Beatrix sends the hero to Haybright in the Sunfields, where the Dimming has reached the wheat. The villagers have never seen a shadow at full length and are panicking at their own. Black tears pool in the first real shade in thirty years, and hollow Lightbearers rise from it. | |
| I-3 | `the-lions-gate`, **The Lion's Gate** | zone 3 to lair 1 | The Gilded Lion has stopped guarding the March road and started eating the golden waymarks off it, so nobody can find the way in the dark. **Boss 1: the Gilded Lion.** | `oathbound.lion_down` |
| I-4 | `the-sorrow-oath`, **The Sorrow-Oath** | zone 4 | Dame Ilsabet rides out of the Dimming leading a line of villagers to safety, calm and kind, armour polished, every child holding her stirrup. She is the most famous knight of the March and was thought lost. Beatrix sees her and has to sit down. | `oathbound.ilsabet_met` |
| I-5 | `the-oath-moot`, **The Oath Moot** | zone 1 | The Brightwatch arrives at Oathkeep with the Hierarch's decree: everyone who has seen the night is "night-touched", and must be marched to Dawnspire for cleansing in the light. The Order is sworn to obey the Hierarch. **Faction choice** (see below). | `oathbound.decree` |
| I-6 | `the-forsworn-chapel`, **The Forsworn Chapel** | zone 2 to lair 2 | Whatever was chosen, the night-touched end up in the Forsworn Chapel, held there by the Brightwatch or sheltering there from it. The chapel's knight rises to drive everyone out. **Boss 2: Ser Gallant the Forsworn.** He can't die, because he broke an oath. Beaten, he says whose: he was Ilsabet's squire, and he broke his oath to her because she kept hers to someone else. Then **release** him from it, so he can rest, or **hold him to his word**, and he follows the hero to the Shrine. | `oathbound.gallant` |
| I-7 | `to-whoever-wears-it`, **To Whoever Wears It** | zone 4 | In the Dimming Ilsabet says it plainly: she has sworn fealty to the Hollow King. "An oath to the crown is an oath to whoever wears it." She wants the March half to carry to him, because the crown should have its stones back, and so should the hero: "You're Oathbound. Your oath is to the crown too." INSIGHT options let the hero see it early: at I-4 her oath-ring was turned inward, the Order's sign of an oath sworn to a fallen lord. | `insight.ring_turned` |
| I-8 | `the-dimming-shrine`, **The Dimming Shrine** | lair 3 | The shrine at the heart of the Dimming, in the first true dark. **Boss 3: Ilsabet (nemesis I).** She fights by the rules of fair combat. The hero lifts the March half (only its bearer can), and Ilsabet yields, formally, and then rides off towards the Dawn Gate: "I yielded the field. Not the road." | `oathbound.halfstone` |
| I-9 | `the-march-road`, **The March Road** | gate road | Beatrix rides the March road with the hero to the Dawn Gate. Her farewell, with a trust check. At Friendly she gives her oath-ring; at Trusted she releases the hero from their oath to Oathkeep, "so that what you keep from here, you keep freely". With **Keep the March**, the Order rides behind you; with the decree, it stays to guard Dawnspire's road. | `oathbound.beatrix_farewell` |
| I-10 | `the-dawn-gate`, **The Dawn Gate (March side)** | `area:radiance-gate` | **Boss 4: the Fallen Hierarch**, the lord the Oathbound swore to. When he falls the tears leave him, and he asks the knight to release him from his own oath to keep the light. The Oathbound can: he takes off his mask and sleeps. Then open the gate. | `story.gate_open`, `story.act = 2` |

### Side quests (8)
| Zone | Quest | Beat |
|---|---|---|
| 1 Oathkeep | **The Squire Who Swears Too Much** | Squire Hamish Goodbody swears oaths about everything ("I swear I'll finish this porridge") and is now bound by two hundred and twelve of them. Help him keep them all before sunset, which in Solaria is never, so you have time. Hamish returns in Act II. |
| 1 Oathkeep | **The Sword That Rattles** | One broken sword in the Hall has rattled in its bracket since the Bell. Find whose it was. The record says Ser Gallant, and the Forsworn Chapel. Foreshadows lair 2. |
| 2 the Sunfields | **The First Star** | Clover Wheatley, aged seven, has seen a star at the Dimming's edge and wants to know if it's a hole in the sky. Climb the windmill with her and name it. Codex: the Concord Ring. Clover is naming the rest in the epilogue. |
| 2 the Sunfields | **The Recruit and His Shadow** | Recruit Dobbin Fenwick, posted at Haybright, has seen his own shadow at full length for the first time and is sure it's a curse. Explain shadows to him, with a lantern and a lot of patience. He becomes the Order's first night-watchman. |
| 3 the Gilded March | **The Golden Waymarks** | Re-gild the March's waymarks so travellers can find the road in the Dimming. Every waymark has an old traveller's oath carved on the back. Codex. |
| 3 the Gilded March | **The Bridge Knight** | Ser Humbert Tench swore forty years ago to let no one cross his bridge without answering his riddle. He has forgotten the riddle. Help him remember it (the answer is "a promise"). |
| 4 the Dimming | **Afraid of the Dark** | The whole village of Lampwick is terrified of its first night. Light campfires, tell them what the dark is for, and get them through to morning, which comes. Lampwick folk cheer the hero at I-9. |
| 4 the Dimming | **The Night Shepherd** | Gammer Lisle is the only calm person in the Dimming: she remembers night from before C. 1012. Help her bring her flock in by starlight, and she teaches the hero the old constellations, one of which is shaped like a crown passed between two hands. |

### Mentor thread (2) and bounties (2)
- **The First Oath** (needs Friendly): Oathkeep's founding oath-stone has worn blank. Help Beatrix take a rubbing of its buried underside. The Order's first oath was never sworn to the Hierarch. It was sworn to the Concord: "to the crown **that passes**". Sets `insight.first_oath` (opens the I-5 INSIGHT option if it's done first).
- **The Marshal's Promise** (needs Trusted): Beatrix's one broken promise. In C. 1012 she promised to ride with Ilsabet to the 85th Turning, and stayed to hold the March instead, and the gates shut, and Ilsabet went to the crown alone. She has written Ilsabet a letter, thirty years late. Help her finish it (she is rigidly honest, and it takes nine drafts), and carry it. Sets `oathbound.beatrix_devotable`.
- **Bounty: the Sunfield Acolytes** (hollow Zealous Acolytes). **Bounty: Old Grizzleface** (a giant Sun Gargoyle that fell off Oathkeep's chapel and now walks the Sunfields).

### Bosses
| Boss | Fight | Black tears |
|---|---|---|
| **The Gilded Lion** (lair 1) | A great golden lion armoured in plates of waymark gold; strip the plates one by one with shield-bashes, and keep it away from the waymarks it eats to heal | its mane tarnishes black, and it eats the gold to fill something that gold won't fill |
| **Ser Gallant the Forsworn** (lair 2) | He can't die: every time he falls, he gets up. Win by making him **yield**: hold your guard through his combos until his oath-curse gives out | the tears run from a crack in his breastplate, where his oath-stone used to sit |
| **Dame Ilsabet** (lair 3) | She announces every attack aloud before she makes it, by the rules of fair combat (a telegraph the player can read). Breaking the rules yourself (striking a yielded foe, using the dark) gives a short buff, and she remembers it at III-4 | her tears fall straight down, like a plumb-line, and never touch her cheeks; first sign of the Herald |
| **the Fallen Hierarch** (the gate) | From the March side it's a fight against your own lord: he commands the knight to kneel (a compulsion to resist by holding guard), and the hero must refuse three times before he can be struck | when beaten the tears leave him, and he asks to be let go of his own promise |

### I-5: The Oath Moot
| Choice | Immediate | Later |
|---|---|---|
| **Keep the decree** (with the Brightwatch) | the night-touched are marched to Dawnspire under Oathbound escort; Oathkeep keeps its word; Beatrix obeys and hates it, trust −1 | Act II: Brightwatch passes get the hero past the Shorewatch's first oath (C-2); Act III: harder to spare Ilsabet ("you kept a fallen lord's word too") |
| **Keep the March** (with the Order's older oath, "no village alone") | the Order stands with the villagers in the Dimming; the Brightwatch withdraws and names Oathkeep forsworn | Act II: Lampwick's and Haybright's folk send bread through the gate; the Shorewatch knights respect a forsworn knight more than a decree (C-2) |
| **[INSIGHT] The crown that passes** (needs `insight.first_oath`) | the hero reads the founding oath at the oath-stones: the Order is sworn to the Concord, and no decree can bind it against the March. The Brightwatch captain can't argue with his own Hierarch's seal on the stone, and goes home | Act III: Ilsabet's logic breaks on it: an oath to the crown that passes is an oath to pass it on, not to keep it. The gentlest way to spare her |

## Act II: the class thread (Concordia)
| # | Quest | Beat |
|---|---|---|
| C-1 | `abbeyshore`, **The Shorewatch** | The Radiance diaspora at Abbeyshore. Three ancient Oathbound, Ser Bryony Wade, Ser Cuthbert Lowe and Ser Petronella Fane, swore in C. 1012 to let no one reach the drowned nave, and have kept the shore for thirty years in rusting, dripping armour. |
| C-2 | `the-shorewatch-oath`, **The Shorewatch Oath** | The Shorewatch won't let the hero pass. Release them from their oath, out-swear them, or find the clause they forgot. They row the hero out themselves. |
| C-3 | `abbess-morwen`, **Abbess Morwen** | **Boss 5: Sentinel A**, in the drowned nave. Release: she swore to keep the Turning Bell, and she asks the Oathbound to release her from it. Sets `story.sentinel.radiance`. |
| C-4 | `the-dames-muster`, **The Dame's Muster** | Ilsabet is in the Barrowdowns under Aldermoor, reached from Brindlecross graveyard. She is swearing Bonelord Varric's dead muster to the Hollow King, oath by oath. Ties in with Old Hobb's *Empty Graves*. |
| C-5 | `bonelord-varric`, **Bonelord Varric** | **Boss 6: Sentinel B.** Varric settled the Schools' War by single combat, and he holds the Oathbound to the same rules. Freeing him lets the Samurai bearer claim the Blade mark (+1 bearers). |
| C-6 | `hamish-delivers`, **Hamish Delivers** | Squire Hamish Goodbody falls out of the Radiance arch, having sworn to deliver Beatrix's message or die trying, and very nearly having done both. Then the Stone Court: the Oathbound and the Cantor bearer. |

**Featured bearers:** **The Saga of the Shorewatch**, with the Skald bearer at Abbeyshore, who wants to drum the three old knights' saga before it's lost (Morwen is Song's Warden too), and **Whom the Sword Serves**, with the Samurai bearer in the Barrowdowns, who has come to ask Varric that question and will only ask it alone. Each gives +1 `story.bearers_gathered`.

## Act III: class quests
- **III-4 The Sorrow Herald** (boss 7): Ilsabet remade as the Herald, in a robe of black samite, ringing a bell once for every vow she makes. **Spare** her with the first oath, "to the crown that passes", or with Beatrix's letter (needs the I-5 INSIGHT or Beatrix Trusted): her oath was to pass the crown on, and she is released, and weeps ordinary tears. Or **destroy** her. If the hero fought foul at I-8, she says so. Sets `oathbound.nemesis_fate`.
- **A Promise Kept Late** (mentor's last request): deliver Beatrix's letter to Ilsabet, read to her if she's spared, or read aloud on the Radiance stair if not. If `oathbound.beatrix_devotable` is set, Beatrix goes to Devoted (5).
- **The Sorrow-Sworn**: knights of the March who swore the Sorrow-Oath after Ilsabet stand hollow in the Legion camp, rings turned inward. Turn them back.
- **Ser Gallant's Rest**: an Act I loose end. If he was held to his word, Gallant has followed the hero all the way here; if he was released, his rattling sword turns up in the Legion camp instead. With Ilsabet's fate settled, his broken oath is settled too, and he can rest.

## Class beats in shared quests
- **II-1:** the Radiance arch is lit, and someone has scratched a line into its stone on the Morvane side: "to whoever wears it". Ilsabet came through behind the hero.
- **II-2:** [Radiance] "I swear I'll hold this gate." The oath becomes a shield for the fight (an Oathbound ward). Maren trust +1: "Nobody's sworn me anything in years."
- **II-3:** [Radiance] "Ask him what he swore that night." Godric flinches: he swore an oath as a Citadel guard in C. 1012, and didn't keep it. Godric trust −1 now, +2 at III-5, and the first step of *What Godric Saw* opens early.
- **II-6:** Ilsabet strikes at the Eve, stealing the **Cantor bearer's** Altar half: by the rules, in single combat, after a formal challenge.
- **III-6:** Oathbound line to the King: "You took an oath that wasn't yours to take. Give it back."

## Endings
| Ending | Realm | Mentor | Nemesis spared / destroyed |
|---|---|---|---|
| Turning | The Oathbound ride escort on the Turning Road again, and Oathkeep's broken swords are reforged | Beatrix carries the crown's banner to Mountainreach for Fist's Turning | Ilsabet rides beside her, her ring turned outward / her ring is set into the founding oath-stone |
| Unmaking | With no crown to swear to, the Oathbound swear to the March itself, village by village | Beatrix becomes reeve of Haybright and is very strict about the bread | Ilsabet swears nothing at all for a year, and is happier / her broken sword hangs in the Hall |
| Hollow Crown | Every Oathbound swears to the hero, and nobody may ever break an oath to the crown again | Beatrix breaks her own sword rather than swear | Ilsabet is the first to kneel, again / the Sorrow-Oath is sworn in her name |
| First Chord | Oaths in Solaria are sworn to the passing now: the Order's new vow ends "until it is someone else's turn" | Beatrix (Devoted) swears the new oath first | Ilsabet swears it second / Beatrix swears it for her |

## Landmarks and set pieces (for Claude 2)
- `landmark:beatrix-holm-quarters` (zone 1, mentor house)
- `landmark:hall-of-broken-swords` (zone 1, I-1)
- `landmark:oath-stones` and `obj:founding-oath-stone` (zone 1, I-5 and mentor thread)
- `landmark:haybright` and `landmark:haybright-windmill` (zone 2)
- `obj:march-waymark-1..6` (zone 3)
- `landmark:tench-bridge` (zone 3)
- `landmark:lampwick` (zone 4)
- `obj:radiance-frontier-halfstone` (lair 3)
- the shared `obj:radiance-gate-seal`, March-side approach
