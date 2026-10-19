# Iron: Ironhold (Knight and Juggernaut)

Realm: [02-realms.md § Ironhold](../02-realms.md). Gate boss: **the Iron Colossus** at the Iron Gate. Morvane Sentinel A: **the Gilded Engine**.

Both campaigns open on the same night: when the Drowned Bell rings, the Iron Colossus wakes in the Fortress Forge, walks out through three of Anvilgate's walls and goes to stand at the Iron Gate, waiting for a king. The Knight sees it from the city; the Juggernaut feels it in the rock.

---

# KNIGHT: *Can shame be put down?*
| | |
|---|---|
| Start | `area:iron-capital`, Anvilgate |
| Mentor | **Ser Gideon Marke** (`npc:gideon-marke`, trust starts at 2: he has kept every squire at arm's length since C. 1012) |
| Nemesis | **Prince-Regent Konrad Berenikson** (`npc:konrad-berenikson`), Berenika's grandson. Act III Union Chimera |
| Half-stone | the Forge half, under the Forge Throne (lair 3) |
| Sentinels | A the Gilded Engine, B Ashmaw |

## Act I: Anvilgate (22 quests)
### Main
| # | Quest (`quest:knight-…`) | Where | Beat | Flags |
|---|---|---|---|---|
| I-1 | `the-vigil`, **The Vigil** | zone 1 | Night, and the hero is keeping the vigil before their dubbing in the Order's chapel, alone with an unpainted shield. The Drowned Bell rings and every anvil, gate-bell and helmet in Anvilgate rings back. Through the chapel window the hero watches the Iron Colossus walk out of the Forge and through three walls. The Forge half's song pulls them out of vigil, which is technically a hanging offence; Gideon finds them and walks them back himself, saying nothing. Tutorial: move, shield-block and talk. | `knight.bell_heard` |
| I-2 | `forty-gates`, **Forty Gates** | zone 1 | Gideon sends the hero across the Wards with a sealed letter for the Chapterhouse, paying a toll at every one of forty gates. The Iron Sentries at the inner gates have started to "ring wrong": black tears weep from their rivets, and they turn their pikes on the toll-payers. | |
| I-3 | `the-barrow-vigil`, **The Barrow Vigil** | zone 2 to lair 1 | Squires who keep their vigils in the Barrow of Knights are coming back up hollow-eyed. Ser Roswitha Dunne, Berenika's champion, swore to keep watch over the Queen's tomb until the crown came home; thirty years on she is the Iron Revenant, weeping black onto the tomb. **Boss 1: the Iron Revenant.** | `knight.revenant_rest` |
| I-4 | `the-prince-regents-purse`, **The Prince-Regent's Purse** | zone 2 | Prince-Regent Konrad Berenikson, golden-haired and generous, wins the tilt in borrowed armour and gives the whole prize purse to the squires. He asks the undubbed hero to carry his colours. "Ironhold has apologised for thirty years. I'd like to try something else." | `knight.konrad_met` |
| I-5 | `the-colossus-vote`, **The Colossus Vote** | zone 3 | The Council of the Forge votes on what to do with the Colossus standing at the gate. **Faction choice** (see below). | `knight.colossus_vote` |
| I-6 | `the-blank-shield`, **The Blank Shield** | zone 1 to lair 2 | Whatever was chosen, the realm's roll of arms is needed: the Regency wants its banners painted for the march, the Order wants Berenika struck from the roll at last, or the writ must be entered beside her name. The Heraldry Vault has gone blank. Thirty years of crests, scraped off Ironhold's shields in shame, have gathered into one nameless suit of armour. **Boss 2: the Blank Shield.** | `knight.roll_of_arms` |
| I-7 | `a-king-for-the-colossus`, **A King for the Colossus** | zone 3 | The recovered roll has a new entry in Konrad's hand: the Colossus, under Berenika's arms, with a heart-socket the size of a half-stone. The Forge half has lain under his throne for thirty years and won't come out for him; it will for a bearer. He wants it set in the Colossus so the hollow iron obeys Iron blood. Then he will march on Concordia, take the crown from the Hollow King and hand it to Fist himself, "thirty years late, with an apology the size of a mountain." INSIGHT options let the hero notice that the Colossus's head turns to follow the hero's song, not Konrad's voice. | `knight.konrad_turned`, `insight.colossus_listens` |
| I-8 | `the-forge-throne`, **The Forge Throne** | lair 3 | Into the heart of the Forge, where the great hammers fall in time. **Boss 3: Konrad (nemesis I)**, in his grandmother's armour. The hero lifts the Forge half from under the throne. Konrad climbs into the Colossus's empty rail-cradle and rides the forge line out towards the Iron Gate. | `knight.halfstone` |
| I-9 | `the-dubbing-on-the-wall`, **The Dubbing on the Wall** | gate road | Gideon's farewell, with a trust check. He dubs the hero on top of Berenika's Wall, where it is cracking. At Friendly he gives his sword, the one that stood guard at the last Turning. At Trusted he also paints the hero's blank shield with arms of their choosing and tells them the truth: he was the knight who carried the crown to Casimir. | `knight.gideon_farewell` |
| I-10 | `the-iron-gate`, **The Iron Gate** | `area:iron-gate` | **Boss 4: the Iron Colossus.** It ignores Konrad and waits for a king. The hero clears the hollow iron from its heart-socket, the Colossus kneels, and the hero opens the gate with the Forge half. | `story.gate_open`, `story.act = 2` |

### Side quests (8)
| Zone | Quest | Beat |
|---|---|---|
| 1 Anvilgate Wards | **Hilde's Tenth Key** | Toll-keeper Hilde Ninelocks has nine keys and ten gates on her street. Work out which gate shouldn't exist. It was built round a bakery by mistake in C. 1031, and the baker has been paying a toll to reach her own oven ever since. |
| 1 Anvilgate Wards | **The Office of Public Contrition** | Clerk Absalom Bray has written Concordia one formal apology a day for thirty years: 10,950 letters, none of them sent. He asks the hero to carry the newest one. It pays off in Act II, C-1. |
| 2 Tilt Yard | **The Dented Lance** | Squire Wat Mudge, the hero's fellow squire, is cheerful, brave and the worst jouster in the Order. Get him through one clean tilt before his father arrives. He appears in the epilogue slides. |
| 2 Tilt Yard | **A Horse Called Duty** | Berenika's last destrier, Duty, thirty-eight and stubborn, has refused to leave his stall since the Bell. Walk him the Queen's old route to the Wall. Codex: the Queen's last ride. Duty can carry Gideon's letter in Act II. |
| 3 Fortress Forge | **Hollow Rivets** | Forgemistress Marit Blum's riveters are going quiet at their benches. The rivets came up from the Deepworks, and every crate is tagged "Hollow Lode, M. Ruhl". (A link to the Juggernaut's story.) |
| 3 Fortress Forge | **The Replica Crown** | In the Forge's oldest hall, the smiths' practice crown for the C. 1012 hand-over, made so the Iron Concordant could rehearse giving it to Fist. Bring it to Gideon, who can't hold it. It returns in the Turning ending. |
| 4 Berenika's Wall | **The Masons' Marks** | Every mason who built the Wall of Shame cut a small apology into their stone. Old Jarek wants to find his. It isn't an apology: it's his daughter's name, cut the week she was born. |
| 4 Berenika's Wall | **The Wall-Walker** | Fenna Tock, nine, walks the top of the Wall every evening hoping to see Concordia. Escort her past the hollow Iron Sentries to the highest tower. She sees the glint of the Gate Circle arches. In the Turning ending she is the first child through the gate. |

### Mentor thread (2) and bounties (2)
- **The Steward's Writ** (needs Friendly): find the writ Berenika signed in C. 1012, hidden in the Order's archive behind thirty years of apologies. It reads: "He cannot hear the stones, so he cannot want them. Let him hold it one night: he has never held anything." It was kindness, not treason. Sets `insight.berenika_reason` (opens the I-5 INSIGHT option if it's done first).
- **Gideon's Spurs** (needs Trusted): on the night of the Hollowing Gideon threw his spurs into the Barrow's well and hasn't ridden since. Fetch them up from the bottom, past the hollow sentries that guard the drowned crypts. Sets `knight.gideon_devotable`.
- **Bounty: the Toll-Gate Sentries** (a squad of hollow Iron Sentries). **Bounty: the Lance-Eaters** (Scrap Beetles that have eaten half the Tilt Yard's lances).

### Bosses
| Boss | Fight | Black tears |
|---|---|---|
| **The Iron Revenant** (lair 1) | A formal duel: she salutes, then makes three passes. Attacking during a salute enrages her; honouring it opens her guard. | her visor weeps onto the Queen's tomb; where the tears pool the floor rings like a struck bell and slows the hero |
| **The Blank Shield** (lair 2) | It copies whatever arms the hero bears. In phase 2 the scraped-off crests fly at the hero as spinning shields; break each crest while it is wearing it. | it paints itself blank with black tears. When it falls a crest surfaces at last: a small anvil, the Order's oldest mark |
| **Konrad** (lair 3) | He conducts the Forge's great hammers in a rhythm; lure them onto his own shield-wall. He calls Iron Sentries from the cradle rails. | tears run from the seams of Berenika's armour, never from him. He doesn't notice |
| **The Iron Colossus** (the gate) | For the Knight, a "holding the line" fight: parry its fists with the shield as it strides, then climb its arm to the heart-socket | hollow iron weeps from every rivet. When the socket is cleared the tears run out of it and it kneels facing Concordia, like a knight waiting to be told to rise |

### I-5: The Colossus Vote
| Choice | Immediate | Later |
|---|---|---|
| **March** (with the Regency) | Konrad gives the hero a captaincy and the Forge doubles its shifts; Gideon trust −1 | Act II: Konrad's regiment comes through the gate behind you and goes hollow at Kilnmouth, so C-4 has more enemies; Act III: harder to spare Konrad |
| **Build another wall** (with the Order) | the Order votes to wall the Colossus in where it stands. "Ironhold's answer to everything," Konrad says, and smiles | Act II: the Iron envoy at Gildport trusts you on sight; Act III: the Order's knights hold the Iron stair on the Twelve Stairs |
| **[INSIGHT] Read the writ aloud** (needs `insight.berenika_reason`) | the Council goes quiet; Konrad walks out without a word; Gideon trust +1 | Act II: the Gilded Engine's release (C-3) gains Berenika's last visit; Act III: Konrad can be spared by reading him the writ |

## Act II: the class thread (Concordia)
| # | Quest | Beat |
|---|---|---|
| C-1 | `the-iron-embassy`, **The Iron Embassy** | At Gildport, the shuttered Ironhold embassy is kept by its last envoy, Envoy Perpetua Stannard, who has written Anvilgate a letter of forgiveness every week for thirty years. Not one has ever got through. If the hero carried Bray's apology, the two letters are read together. She tells the hero the Crown-Smith (the embassy’s name for the Gilded Engine, a Sentinel; R4) still hammers under the gold. |
| C-2 | `the-buried-forge`, **The Buried Forge** | Down through the gold-drowned streets of the Gilded city, where hollow-iron golems still walk their rounds, towards a hammering that has never stopped. |
| C-3 | `the-gilded-engine`, **The Gilded Engine** | **Boss 5: Sentinel A.** Release: the Engine made the crown's settings to hold the schools' grief as well as their song. With the writ, it also remembers Berenika bringing it the crown on the last night, to be polished so it would shine for Fist. Sets `story.sentinel.iron`. |
| C-4 | `the-princes-plate`, **The Prince's Plate** | Konrad's trail leads to Ashfall Kiln. The Hollow King's smiths are forging the Union Chimera's frame in Ashmaw's breath, and Konrad has given them his grandmother's armour as its first plate. He is being bound in willingly. |
| C-5 | `ashmaw`, **Ashmaw** | **Boss 6: Sentinel B**, under Kilnmouth's kilns. Beating it lets the Arcanist bearer claim the Ash mark (+1 bearers). |
| C-6 | `gideons-letter`, **Gideon's Letter** | Duty the destrier comes through the Gate Circle carrying Gideon's letter (a Wall courier, if Duty wasn't helped). It is three lines long and took him a month. Then the Stone Court: the Knight and the Juggernaut bearer hear the Forge and Lode halves ring together, and the Juggernaut admits the miners always called the Order "the tin-hats". |

**Featured bearers:** **Whose Fault**, with the Arcanist bearer at Kilnmouth, who blames Iron for thirty years of a failing Kiln and wants to know why Berenika trusted Casimir. Answer with the writ, or take the blame; either way, go down to Ashmaw together. And **Pawned Steel**, with the Corsair bearer at Gildport, who wants to salvage the Engine's gold to pay off Tidecourt's Pawned Gate. Does a knight help a pirate? "What can't be bought? Forgiveness, apparently." Each gives +1 `story.bearers_gathered`.

## Act III: class quests
- **III-4 The Iron Head** (boss 7): Konrad is bound into the Union Chimera as its iron head and shield-arm, Berenika's plate fused to his own. **Spare** him: read him the writ (the I-5 INSIGHT), or, with Gideon Trusted, Gideon steps between them and owns his own shame aloud, and Konrad's plate falls away. Or **destroy** him. Sets `knight.nemesis_fate`.
- **Gideon's Spurs** (mentor's last request): carry Gideon's spurs to the Citadel and leave them at the foot of the throne, where he left the crown thirty years ago. If `knight.gideon_devotable` is set, Gideon goes to Devoted (5).
- **The Regent's Regiment**: Konrad's marchers (or, with the wall vote, the Order's knights who went after him) stand hollow in the Legion camp in their colours. Call each of them home by their name from the roll of arms.
- **The Blank Shield's Crest**: an Act I loose end. The emptied Blank Shield has walked all the way from Anvilgate behind the hero, wearing its one small anvil. It asks to stand guard on the Iron stair.

## Class beats in shared quests
- **II-1:** the Iron arch at the Gate Circle is chained shut from the Concordia side, and the padlock bears Berenika's arms: her own honour guard locked it behind them on the night of the Hollowing.
- **II-2:** [Iron] Knight: "Plant the shield. Nothing gets past to Maren." Maren trust +1 ("a wall I can shoot over").
- **II-3:** Godric stiffens at the Order of the Anvil tabard; he stood beside Berenika's knights in the Citadel. He won't say more yet (this seeds `insight.godric_saw`). With `insight.berenika_reason`, he adds one line: "She was kind. That was the trouble."
- **II-6:** Konrad, half bound into the Chimera, strikes at the Eve, stealing the **Juggernaut bearer's** Lode half.
- **III-6:** Knight line to the King: "She gave you the crown because she thought you couldn't want it. You've spent thirty years proving her wrong."

## Endings
| Ending | Realm | Mentor | Nemesis spared / destroyed |
|---|---|---|---|
| Turning | Anvilgate carries the crown to Mountainreach on foot, thirty years late, with the replica crown on a cushion behind it. The inner walls come down one a week. | Gideon rides again, at the head of the escort | Konrad carries the apology, which is short / his name is entered on the roll of arms, unblanked |
| Unmaking | Ironhold takes down the Wall of Shame and keeps the stones in a neat pile, just in case | Gideon opens a riding school for squires who don't want to be knights | Konrad goes down the Deepworks to work a shift for once / the Colossus kneels over his grave |
| Hollow Crown | Ironhold walls in the whole ring, for everyone's protection. The Office of Public Contrition gets a bigger building. | Gideon breaks his sword over his knee and walks into the Deepworks | Konrad is made your steward / his empty plate stands guard at your door |
| First Chord | Every anvil in Anvilgate rings at once for the first bell of the new Turning, and the Office of Public Contrition closes for good | Gideon (Devoted) holds the bell-rope and is forgiven out loud | Konrad rings beside him / his name is the first read at the bell |

## Landmarks and set pieces (for Claude 2)
- `landmark:order-chapel` (zone 1, I-1 vigil)
- `landmark:gideon-quarters` (zone 1, mentor house)
- `obj:anvilgate-toll-gate-1..6` (zone 1, I-2)
- `landmark:office-of-contrition` (zone 1)
- `landmark:heraldry-vault-door` (zone 1, lair 2 entrance)
- `landmark:tilt-yard-lists` and `landmark:duty-stall` (zone 2)
- `landmark:barrow-stair` and `obj:barrow-well` (zone 2, lair 1 entrance and the mentor thread)
- `landmark:council-of-the-forge` and `landmark:colossus-cradle` (zone 3)
- `obj:replica-crown` (zone 3)
- `landmark:wall-dubbing-tower` (zone 4, I-9)
- `obj:berenika-writ` (zone 1, mentor thread)
- `obj:iron-capital-halfstone` (lair 3)
- `obj:iron-gate-seal` (gate)

---

# JUGGERNAUT: *What is a worker's strength for?*
| | |
|---|---|
| Start | `area:iron-frontier`, the Deepworks |
| Mentor | **Foreman Gussie Haldt** (`npc:gussie-haldt`, trust starts at 3: she has run the hero's shift since they were six and already taller than her) and her shift canary **Sergeant** |
| Nemesis | **Magda Ruhl, the Smelter** (`npc:magda-ruhl`), mine-boss of the Hollow Lode. Act III Union Chimera |
| Half-stone | the Lode half, in the Hollow Lode (lair 3) |
| Sentinels | A the Gilded Engine, B Rimeheart Colossus |

## Act I: the Deepworks (22 quests)
### Main
| # | Quest (`quest:juggernaut-…`) | Where | Beat | Flags |
|---|---|---|---|---|
| I-1 | `the-bell-in-the-rock`, **The Bell in the Rock** | zone 1 | End of the night shift. The Drowned Bell rings through the rock, every shift-whistle in Rivet Town blows by itself, and far above, the Colossus walks out of Anvilgate and shakes the whole Deepworks. The shaft-head roof comes down; the hero holds it up while three miners crawl out. Gussie, standing on a crate to be heard, counts heads. There's one sound too many: the Lode half, singing from below. Tutorial: move, swing, lift and talk. | `juggernaut.bell_heard` |
| I-2 | `stopped-golems`, **Stopped Golems** | zone 2 | Gussie sends the hero down to restart the Rivet Golems that haul the ore carts, which all stopped at the Bell. They restart all right: there are black tears in their boilers, and they swing at the miners. The Regency's ore quota is due in three days anyway. | |
| I-3 | `the-warden-foundry`, **The Warden Foundry** | zone 3 to lair 1 | The Forge Warden in the old foundry is melting down miners' picks, lamps and dinner-pails to cast sentries for a Colossus that has already left. It has started on the cage-lifts. **Boss 1: the Forge Warden.** | `juggernaut.foundry_cold` |
| I-4 | `the-smelters-wages`, **The Smelter's Wages** | zone 1 | Magda Ruhl, mine-boss of the Hollow Lode, walks into Rivet Town's company store, buys it outright and burns its debt-ledgers on the step. She pays double to anyone who'll dig her seam, in bright new iron coin. Rivet Town cheers her down the street. | `juggernaut.magda_met` |
| I-5 | `the-whistle-vote`, **The Whistle Vote** | zone 1 | The Brotherhood meets at the shaft-head to vote on the Hollow Lode. **Faction choice** (see below). | `juggernaut.whistle` |
| I-6 | `the-scrap-hive`, **The Scrap Hive** | zone 4 to lair 2 | Whatever was chosen, the road runs through the Scrapfields: the strike means selling scrap to eat, the new rail to the Lode runs through the hive, or the slag-carts are buried there. The Beetle King has armoured itself in thirty years of Rivet Town's thrown-away things, and the Brotherhood's lost strike banner is the top layer. **Boss 2: the Beetle King.** | `juggernaut.strike_banner` |
| I-7 | `pay-that-empties-you`, **Pay That Empties You** | zone 3 | The banner was wrapped round a strongbox of Magda's coin, and her coin is hollow iron. Miners who've carried her wages for a month go quiet, then docile, then down the Lode for good. The Colossus was built from her iron, and it is walking itself to the Hollow King: the biggest delivery in history, paid for by its customers. The black tears in the Lode whisper to her, and the King has promised that in his new world the diggers will own the mountain. The Lode half is her last shipment. "Nobody ever paid us what the iron was worth. He will." INSIGHT options let the hero notice that Sergeant won't go near the coin. | `juggernaut.magda_turned`, `insight.scrip_hollows` |
| I-8 | `the-hollow-lode`, **The Hollow Lode** | lair 3 | Down the deepest seam. **Boss 3: Magda (nemesis I)**, fighting from a smelting crane above the seam. The hero breaks the Lode half out of the rock with their bare hands. Magda rides the last ore-cart up the main line towards the Iron Gate. | `juggernaut.halfstone` |
| I-9 | `end-of-shift`, **End of Shift** | gate road | Gussie's farewell, with a trust check. Rivet Town lines the rails. At Friendly she gives her shift-whistle ("blow it and somebody comes"). At Trusted she gives Sergeant too, as a pet; he sings when there are tears nearby. | `juggernaut.gussie_farewell` |
| I-10 | `the-iron-gate`, **The Iron Gate (Deepworks side)** | `area:iron-gate` | **Boss 4: the Iron Colossus.** Every plate is stamped with a Brotherhood shift-mark: Rivet Town built it. When it falls the tears drain out of it like water from a flooded shaft. **Break it for scrap** (Rivet Town eats for a year), or **leave it standing** (a monument to the people who made it). Then open the gate. | `juggernaut.colossus`, `story.gate_open`, `story.act = 2` |

### Side quests (8)
| Zone | Quest | Beat |
|---|---|---|
| 1 Rivet Town | **Too Tall for the Door** | Big Lotte Anvers, the tallest Juggernaut in the Deepworks, has grown again and can't get into her own house. Fix the house, not her. Comedy. |
| 1 Rivet Town | **Penny's Other Ledger** | Penny Grist, the company store clerk, kept a secret second ledger of every debt she quietly let go. Magda burned the first one; find the second before the Regency's auditors do. It pays off in Act III. |
| 2 the Deepworks | **Dilly's Rails** | Rail-runner Dilly Spoke races ore carts for fun, and there are hollow golems on her favourite line. Win the race and clear the track. Dilly drives the dig-carts at Gildport in Act II. |
| 2 the Deepworks | **The Singing Seam** | An old gallery where the first miners sang to find iron, and where the song still echoes. Codex: the Deepworks once followed the Iron Stone's song through the rock. |
| 3 the Slag Rivers | **Crane-Mother** | Agathe Strell, the oldest crane-driver, won't come down from her crane, though the slag beneath has turned black. Talk her down, or ride the bridge with her. She swings her crane into the I-10 fight. |
| 3 the Slag Rivers | **Slag Sculptures** | The shift children cast shapes in cooling slag for the yearly contest, and the judge has gone hollow. Judge it yourself, and survive the parents. Comedy. |
| 4 the Scrapfields | **Nib and Nub** | The Tinker Twins are building a cart out of scrap and disagree about everything, including which way is forward. Fetch parts guarded by Scrap Beetles. The cart turns up at Gildport in Act II. |
| 4 the Scrapfields | **The Widow's Pick** | Old Mother Teasdale wants her husband's pick back from the scrap. He died in the C. 1031 collapse, and the pick belongs on the Brotherhood shrine. Gentle; a little sad. |

### Mentor thread (2) and bounties (2)
- **Haldt's Lamp** (needs Friendly): Gussie's father, foreman before her, was lost in the Slag Rivers in C. 1029. Find his lamp in a cooled slag-run. It has never wept, because slag, the Deepworks' waste, seals black tears. Sets `insight.slag_seals` (opens the I-5 INSIGHT option if it's done first).
- **The First Whistle** (needs Trusted): the Brotherhood's founding whistle, blown once at the first strike nine hundred years ago, lies in the Hollow Lode's oldest gallery. Gussie wants to blow it once, at the end of her last shift. Sets `juggernaut.gussie_devotable`.
- **Bounty: the Cart-Line Golems** (a pair of hollow Rivet Golems). **Bounty: Old Mandible** (a giant Scrap Beetle wearing a boiler as a hat).

### Bosses
| Boss | Fight | Black tears |
|---|---|---|
| **The Forge Warden** (lair 1) | A conveyor-belt foundry. Its moulds spit out Iron Sentries; smash each mould before the casting cools. It hammers in a rhythm the hero can learn. | it casts in black iron, and fresh sentries strike hollow (each hit drains stamina) |
| **The Beetle King** (lair 2) | Each phase knocks off a layer of junk (a door, a boiler, a cart) that stays in the arena as cover. The last layer is the strike banner. | under the junk its shell is black glass: tears hardened over thirty years |
| **Magda** (lair 3) | She pours molten hollow iron in lines from her crane and tosses coin to her hollowed miners, who get up and fight for it. Knock her purse into the seam. | her coins weep, never her eyes. She is perfectly sure of herself |
| **The Iron Colossus** (the gate) | From the Deepworks side, a climbing fight up its legs by the mine-rails. Prise the shift-stamped plates loose and lift them as shields. | hollow iron sweats tears at every joint. When it falls they drain out like a flooded shaft being pumped |

### I-5: The Whistle Vote
| Choice | Immediate | Later |
|---|---|---|
| **Strike** (with the Brotherhood) | tools down: no iron goes to the Forge or to Magda, and Rivet Town goes hungry | Act II: the Deepworks diggers at Gildport down tools with you, which helps against the Gilded Engine; Act III: harder to spare Magda ("you starved us for your conscience") |
| **Dig** (Magda's contract) | Rivet Town eats well and the coin flows; Gussie trust −1 | Act II: the hollow miners at Frostmere Pass are Rivet Town folk you know, so C-4 is harder; Act III: more of them to bring home from the Legion camp |
| **[INSIGHT] Seal it with slag** (needs `insight.slag_seals`) | the Brotherhood pours thirty years of waste into the Lode's upper galleries, and the tears stop rising; Magda notices | Act III: the Chimera's furnace can be sealed with slag (an extra phase-skip), and sparing Magda is easier |

## Act II: the class thread (Concordia)
| # | Quest | Beat |
|---|---|---|
| C-1 | `the-gold-diggers`, **The Gold Diggers** | At the Gilded Ruins, Deepworks exiles stranded since C. 1012 dig out the buried city for the Sparkwright Works. They're paid in gold, and searched for it at the end of every shift. Their gaffer, Hobnail Jenks, has heard something hammering under the gold for thirty years. |
| C-2 | `under-the-gold`, **Under the Gold** | The hero leads the night shift down: shoring, a collapse, and the old Iron embassy's foundations. |
| C-3 | `the-gilded-engine`, **The Gilded Engine** | **Boss 5: Sentinel A.** Release: the Engine asks the Juggernaut whether its work was good. It made the settings to hold the schools' grief as well as their song, and nobody ever told it so. Sets `story.sentinel.iron`. |
| C-4 | `the-ore-road`, **The Ore Road** | Magda brought a last load of hollow iron through the Iron arch behind the hero, and she's hauling it to the Heart by the north pass. The Rimeheart Colossus holds the pass shut, so she has hollow miners breaking at it. The Hollow King's smiths are measuring her for the Chimera's furnace. |
| C-5 | `rimeheart-colossus`, **Rimeheart Colossus** | **Boss 6: Sentinel B**, above Wardenhold. "Another colossus," says the Juggernaut. Beating it lets the Warden bearer claim the Rime mark (+1 bearers). |
| C-6 | `three-short-blasts`, **Three Short Blasts** | Gussie's letter comes through the Gate Circle tied to Sergeant (or rolling out of the Iron arch in a Rivet Town ore-cart, if the hero has Sergeant). Then the Stone Court: the Juggernaut and the Knight bearer. The Knight tries to apologise for something; the Juggernaut doesn't know what for. |

**Featured bearers:** **Who Holds the Pass**, with the Warden bearer at Wardenhold: a wall-keeper and a wall-builder argue about who walls are for, then shore up the failing pass together. And **The Machine Age**, with the Sparkwright bearer at Gildport, who wants the Engine's secrets for a machine that does the miners' work. "Then what are we for?" Help them or argue. Each gives +1 `story.bearers_gathered`.

## Act III: class quests
- **III-4 The Furnace-Heart** (boss 7): Magda is bound into the Union Chimera as its furnace, with her coin pouring through its ribs. **Spare** her: seal the furnace with slag (the I-5 INSIGHT), or, with Gussie Trusted, blow the shift-whistle three times. "Magda Ruhl. You're done for the day." Or **destroy** her. Sets `juggernaut.nemesis_fate`.
- **Last Shift** (mentor's last request): blow the First Whistle at the foot of the Twelve Stairs, so that every hollowed worker in the Heart hears the end of shift. If `juggernaut.gussie_devotable` is set, Gussie goes to Devoted (5).
- **Pay Day**: the miners hollowed by Magda's coin stand in the Legion camp. Take the hollow coins off them one by one and pay them properly, in Embershards.
- **Penny's Other Ledger**: an Act I loose end. Penny's ledger has an entry for C. 1020: "M. Ruhl, aged 11, one winter coat. Forgiven." Show it to Magda, before or after the fight.

## Class beats in shared quests
- **II-1:** the Iron arch's padlock-chain is Deepworks chain, Rivet Town stamp. "We made the lock too," says the Juggernaut. [Iron] "Lift it off." They can.
- **II-2:** [Iron] Juggernaut: "Turn the cart over. Now it's a wall." Maren trust +1.
- **II-4:** [Iron] "Weigh a tear." It weighs as much as a pick-head: hollow iron is iron that has carried grief. Sets `insight.tears_heavy`, which supports `insight.tears_older`.
- **II-6:** Magda strikes at the Eve, stealing the **Knight bearer's** Forge half.
- **III-6:** Juggernaut line to the King: "You had the strength of twelve schools in your hands, and you never once asked what it was for."

## Endings
| Ending | Realm | Mentor | Nemesis spared / destroyed |
|---|---|---|---|
| Turning | Rivet Town digs a proper road from the Iron Gate down to Concordia, and every miner is paid in the old coin | Gussie is elected to the Council of the Forge, its first miner, and speaks from a crate | Magda runs the company store at cost / her coin is melted into the Brotherhood's new whistle |
| Unmaking | The Deepworks seals the Hollow Lode and opens a free mine, owned by whoever digs it | Gussie retires and tries to teach Sergeant to whistle | Magda digs on wages for the first time in her life / the Lode is sealed over her |
| Hollow Crown | The Deepworks digs for the crown for ever, and every shift is a double shift | Gussie blows the strike whistle against you | Magda is your mine-boss / the seam is named after her |
| First Chord | Rivet Town's shift-whistles sound the first note of the new Turning together | Gussie (Devoted) blows the First Whistle | Magda pays for the bell, at a fair price / her last coin is the bell's clapper |

## Landmarks and set pieces (for Claude 2)
- `landmark:rivet-shaft-head` (zone 1, I-1)
- `landmark:gussie-whistle-house` (zone 1, mentor house)
- `landmark:rivet-company-store` (zone 1)
- `obj:rivet-golem-1..4` (zone 2, I-2)
- `landmark:singing-seam` (zone 2)
- `landmark:warden-foundry-door` (zone 3, lair 1 entrance)
- `landmark:agathe-crane` (zone 3)
- `obj:haldt-lamp` (zone 3, mentor thread)
- `landmark:scrap-hive-mound` (zone 4, lair 2 entrance)
- `obj:first-whistle` (lair 3, mentor thread)
- `obj:iron-frontier-halfstone` (lair 3)
- the shared `obj:iron-gate-seal`, Deepworks-side approach
