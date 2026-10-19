# Guile: Tidecourt (Jester and Corsair)

Realm: [02-realms.md § Tidecourt](../02-realms.md). Gate boss: **the Velvet King** at the Pawned Gate. Morvane Sentinel A: **the Lantern Queen**.

---

# JESTER: *Is a joke a lie?*
| | |
|---|---|
| Start | `area:guile-capital`, Velvet Harbour |
| Mentor | **Old Fennick Pantaloon** (`npc:fennick-pantaloon`, trust starts at 3: he taught the hero to fall over) |
| Nemesis | **Harlequin Sorrow** (`npc:harlequin-sorrow`), the Velvet King's fool and the real power behind the throne. Act III: bound into the Union Chimera |
| Half-stone | the Court half, in the Velvet Court (lair 3) |
| Sentinels | A the Lantern Queen, B Abbess Morwen |

## Act I: Velvet Harbour (22 quests)
### Main
| # | Quest (`quest:jester-…`) | Where | Beat | Flags |
|---|---|---|---|---|
| I-1 | `the-bell-at-the-masque`, **The Bell at the Masque** | zone 1 | Midnight on the Velvet Docks, as the court's barge-masque comes ashore. The Drowned Bell rings under the harbour, every bell on every fool's cap answers it, and for one heartbeat the whole of Velvet Harbour stops laughing. The hero hears the Court half singing from the palace; Fennick falls flat across the gangplank so nobody notices them staring. Tutorial: move, tumble and talk. | `jester.bell_heard` |
| I-2 | `fennicks-pawn-ticket`, **Fennick's Pawn Ticket** | zone 1 | Fennick sends the hero to redeem his old cap-bells from Tuttle's Pawn on the Docks. Tuttle only takes and pays in black pearls now, and the dockers who sold theirs sit on the bollards smiling at nothing. Hollow Cutpurses work the crowd. | |
| I-3 | `the-phantom-theatre`, **The Phantom Theatre** | zone 2 to lair 1 | Masks are vanishing from the Masquerade Quarter, faces and all: revellers wake bare-faced and can't remember who they were. The trail of dropped ribbons leads to the boarded-up Phantom Theatre. **Boss 1: the Masked Phantom.** | `jester.phantom_unmasked` |
| I-4 | `the-kings-fool`, **The King's Fool** | zone 3 | On the Exchange Floor, in front of everyone, Harlequin Sorrow buys the hero's apprentice indenture and tears it up. He offers them a cap at court: "Fools should be free. Free fools are so much cheaper." He is funny, generous and kind to the pages, and he never laughs. | `jester.sorrow_met` |
| I-5 | `the-jubilee-jest`, **The Jubilee Jest** | zone 3 | The Velvet King has bought back the Pawned Gate and declares a Jubilee: every debt in Tidecourt "forgiven by royal jest". The Court wants the hero to tell the jest; the Thieves' Exchange wants it told differently. **Faction choice** (see below). | `jester.jest` |
| I-6 | `the-counting-house`, **The Counting House** | zone 3 to lair 2 | Whatever was told, a joke can't cancel a debt, and the Auditor wakes in the royal treasury to collect every one at once, with interest. **Boss 2: the Auditor.** Its strongroom holds thousands of jars of black pearls, each labelled "One sorrow, received with thanks. H.S." One label reads "H. Sorrow, aged seven". | `jester.pearl_jar` |
| I-7 | `sorrows-laughing-shop`, **Sorrow's Laughing Shop** | zone 4 | The labels lead up the Crooked Stairs to a little shop with a red door. Sorrow buys people's grief (they weep it into a pearl) and pays them in laughter, on credit. He wants the Court half set in his bauble: a joke that never fails, so that no one in Tidecourt ever has to cry again. INSIGHT options let the hero see it early: he has never once laughed at his own jokes, and his sleeves clink. | `insight.sorrow_never_laughs`, `jester.sorrow_turned` |
| I-8 | `the-velvet-court`, **The Velvet Court** | lair 3 | Into the King's court on Jubilee night, where a paid claque laughs on cue. **Boss 3: Harlequin Sorrow (nemesis I).** The hero takes the Court half from under the throne's cushion; Sorrow bows, says "Encore", and leaves by the King's private tunnel to the Pawned Gate. | `jester.halfstone` |
| I-9 | `exit-pursued-by-a-fool`, **Exit, Pursued by a Fool** | gate road | Fennick's farewell on the toll road, with a trust check. At Friendly he gives Little Fennick, his marotte: a fool's stick carved with his own face, which heckles. At Trusted he also teaches the Pantaloon Pratfall, a taunting dodge he swore he'd take to his grave. | `jester.fennick_farewell` |
| I-10 | `the-pawned-gate`, **The Pawned Gate** | `area:guile-gate` | **Boss 4: the Velvet King**, standing on the gate's deed and waiting to sell passage to the Hollow King. The hero makes him laugh, honestly, and the pearl-crust cracks off his crown. Then they open the gate with the Court half. | `story.gate_open`, `story.act = 2` |

### Side quests (8)
| Zone | Quest | Beat |
|---|---|---|
| 1 Velvet Docks | **Gull Number Nine** | A gull with forty-one convictions for chip theft is to be hanged in a tiny hat-gibbet. Prove a Thief Crow framed it. The gull follows you everywhere afterwards, and reappears in Act II. |
| 1 Velvet Docks | **Mother Gudgeon's Tab** | Mother Gudgeon's fish stall has run on credit for thirty years, and Sorrow has just bought the whole street's tab. Pay it, haggle it down on the Exchange, or [INSIGHT] prove it was paid twice already, in C. 1019 and C. 1031. |
| 2 Masquerade Quarter | **The Man Who Forgot His Face** | Mister Ottoline Squibb has worn the same carnival mask since the year of the Hollowing and no longer knows what's under it. Find the painter who did his portrait at twenty. He unmasks at the Jubilee if helped (epilogue slide). |
| 2 Masquerade Quarter | **The Worst Joke in Tidecourt** | The Quarter's yearly contest for the worst joke. Fennick has won it eleven years running. Beat him. Pure comedy; the prize is a cap that honks. |
| 3 Exchange Floor | **A Promise, Slightly Used** | A bride sold her wedding vow on the Exchange to pay her father's debts, and it's being resold as "lightly worn". Buy it back before the wedding. Codex: how promises are traded. |
| 3 Exchange Floor | **Futures in Weather** | A broker has sold "fine tomorrow" for thirty years running, and the Bell has spoiled the forecast. Help him cover his position before it rains on the whole market. Comedy, with a codex on the Exchange's stranger markets. |
| 4 Crooked Stairs | **The Chest That Bites Back** | A treasure-chest on the Stairs is a Mimic Slime, and it has swallowed a debt-collector who is still collecting from inside. |
| 4 Crooked Stairs | **The Lamplighter's Wife** | Old Wick Pellam lights a lamp at the top of the Stairs every night and can't remember why. He sold the grief for his late wife at a shop with a red door. Find the receipt, signed H.S.: a clue for I-7. |

### Mentor thread (2) and bounties (2)
- **The Fool's Licence** (needs Friendly): why Fennick falls over. In C. 1012 he fell down in front of the throne to stop the King signing the gate's pawn deed; the court laughed, and the King signed anyway. Find the old Fool's Licence in the palace archive: a fool may tell the crown one truth a reign, so long as it's funny. Sets `insight.fools_licence` (opens the I-5 INSIGHT option if it's done first).
- **The Pantaloon Act** (needs Trusted): Fennick's straight man, Augustin Drabb, quit the act in C. 1012 to clerk in the Counting House and hasn't smiled since. Get the two of them on a stage one last time. Sets `jester.fennick_devotable`.
- **Bounty: the Velvet Fingers** (a Cutpurse gang). **Bounty: Old Grin** (a Mimic Slime posing as the Crooked Stairs' wishing-well).

### Bosses
| Boss | Fight | Black tears |
|---|---|---|
| **The Masked Phantom** (lair 1) | A theatre ghost who swaps places with the masks hung round the stage; find the one that blinks and strike it | the masks' eyeholes weep black pearls that roll across the boards like marbles; stepping on them slows and hollows |
| **The Auditor** (lair 2) | A ledger-golem. Every hit the hero lands is "charged" and paid back with interest at the end of a phase, unless they smash the abacus pillars to clear the account | its ink runs pearl-black, and its coins are black pearls stamped with the King's face |
| **Harlequin Sorrow** (lair 3) | The claque laughs on cue and every laugh heals him. Make them laugh for real, off his cue, to break the rhythm and open his guard | he never weeps; black pearls drop from his sleeves instead, the first sign of what he has swallowed |
| **The Velvet King** (the gate) | A magnificent hollow king on a throne of IOUs. Each phase he auctions a patch of floor to hollow bidders, who seize it. For the Jester it's a fool's fight: a true joke between phases cracks the crust on his crown | his crown is crusted with black pearls; when beaten they drop off and roll back to the sea, and he weeps clear tears for the first time in thirty years |

### I-5: The Jubilee Jest
| Choice | Immediate | Later |
|---|---|---|
| **Tell the King's jest** (with the Velvet Court) | the harbour laughs and the Jubilee holds, though nobody's debts go anywhere; Fennick trust −1 ("that wasn't a joke, it was a receipt") | Act II: Lanternford's Guile exiles know the King's fool by reputation and charge double; Act III: Sorrow's claque is louder (one extra add wave) |
| **Tell the Exchange's jest** (with Guildmaster Vex) | the truth, told for profit: "the King is broke". Panic on the Exchange Floor, and Vex buys the realm's debts for pennies | Act II: Pell Odd knows you as Vex's fool and sells you a cheap way through the Marsh (C-2 is shorter); the Corsair bearer distrusts you at the Stone Court |
| **[INSIGHT] Use the Fool's Licence** (needs `insight.fools_licence`) | the hero tells the King to his face that the gate was never his to pawn; he laughs until he cries real tears; Sorrow notices | Act III: Sorrow's mask is cracked (an extra phase-skip), and sparing him is easier |

## Act II: the class thread (Concordia)
| # | Quest | Beat |
|---|---|---|
| C-1 | `lanternford`, **Lanternford** | The Guile diaspora in Morvane Marsh keep the Will-o'-Wisp and sell "safe" lanterns that lead you only slightly into the water. They speak of the Lantern Queen as a business rival. |
| C-2 | `the-queens-toll`, **The Queen's Toll** | Crossing to the old Guile embassy takes one of the Queen's lights, and her lights cost a memory. Pay, or pay her in a joke she hasn't heard in thirty years. |
| C-3 | `the-lantern-queen`, **The Lantern Queen** | **Boss 5: Sentinel A.** Release: for a thousand years she sold the crown's road safe passage, and only ever charged a song. She asks whether anyone will need a light across the Marsh again. Sets `story.sentinel.guile`. |
| C-4 | `sorrow-buys-the-silence`, **Sorrow Buys the Silence** | Sorrow is at Abbeyshore, buying the drowned Abbey's bell-ropes from the Old Fish Mill so that the Bell can never be rung, and Abbess Morwen is glad to see it. The Legion are measuring him for the Union Chimera. |
| C-5 | `abbess-morwen`, **Abbess Morwen** | **Boss 6: Sentinel B**, in the drowned nave. The Jester makes the drowned choir laugh, and the laughter rises as bubbles. Freeing her lets the Cantor bearer claim Radiance's mark (+1 bearers). |
| C-6 | `a-letter-by-gull`, **A Letter by Gull** | Gull Number Nine (or a court pigeon, if the gull wasn't saved) flies through the Guile arch with Fennick's letter, which is mostly drawings of him falling over. At the Stone Court the Corsair bearer picks the Jester's pocket by way of hello, and the Court and Reef halves hum a sea-shanty in a minor key. |

**Featured bearers:** **The Knight Who Wouldn't Laugh**, with the Oathbound bearer at Abbeyshore, who swore not to smile until the Concord is restored; Morwen's drowned choir holds them to it (help them keep the oath, or make them break it), and **Remember the Punchline**, with the Duskweaver bearer at Lanternford, who is losing memories to the Lantern Queen's lights: jokes stick where facts slip. Each gives +1 `story.bearers_gathered`.

## Act III: class quests
- **III-4 The Last Laugh** (boss 7): Sorrow bound into the Union Chimera, a patchwork beast of every school with his white mask for its face, laughing with every laugh he ever sold. **Spare** him by breaking the jar labelled "H. Sorrow, aged seven" and letting him weep (needs the I-5 Licence or Fennick Trusted), or **destroy** him. Sets `jester.nemesis_fate`.
- **The Joke for the King** (mentor's last request): as a boy, Prince Casimir visited the Velvet Court and was the only child who never laughed. Fennick wrote him a joke and never got to tell it. Tell it at the throne. If `jester.fennick_devotable` is set, Fennick goes to Devoted (5).
- **Paid in Full**: Sorrow's best customers, who sold every grief they had and walked into the Heart empty, stand in the Legion camp. Give them back their pearls.
- **Gull Number Nine Goes Straight**: an Act I loose end. The gull has followed the hero through the Weeping Wall and stolen a Black Tear Knight's plume (comic relief before the end).

## Class beats in shared quests
- **II-1:** a brass pawn ticket is nailed to the Guile arch's keystone: "Redeemable at Velvet Harbour. No refunds."
- **II-2:** [Guile] "Throw your voice: call the wolves to the wrong side of the fire." Maren trust +1 ("Cheap. I like it.").
- **II-4:** [Guile] "Appraise the tear." Under a jeweller's glass it carries an Exchange hallmark older than the Hollowing. Sets `insight.tears_hallmarked`, which supports `insight.tears_older`.
- **II-6:** Sorrow is the nemesis who strikes at the Eve, stealing the **Corsair bearer's** Reef half.
- **III-6:** Jester line to the King: "Nobody ever told you the truth to your face. Someone should have paid a fool."

## Endings
| Ending | Realm | Mentor | Nemesis spared / destroyed |
|---|---|---|---|
| Turning | Tidecourt redeems the Pawned Gate for a song, and the ticket is framed above the Exchange. The court laughs only when something is funny. | Fennick is Royal Fool again, and falls over at the coronation | runs his shop in reverse, handing back pearls one at a time / his mask hangs over the Exchange door as a warning |
| Unmaking | No crown, no King's debts: Tidecourt writes everything off and starts a new ledger at page one | Fennick retires to the Docks and teaches gulls to fall over | sails away owing nobody / his debts die with him, and the harbour throws a party |
| Hollow Crown | Tidecourt becomes the new crown's bank, and every realm owes it forever. The court's last joke is about the hero, and nobody dares laugh. | Fennick refuses the cap | the crown's fool / a jar on the throne-room shelf labelled "H.S." |
| First Chord | The Velvet Court tells the first true joke of the new Turning, and the whole ring laughs at once, with a rest for breath | Fennick (Devoted) tells it, then falls over | laughs for the first time in his life / Fennick tells his jokes for him |

## Landmarks and set pieces (for Claude 2)
- `landmark:fennick-attic` (zone 1, mentor house: a sail-loft attic full of cushions)
- `landmark:tuttles-pawn` (zone 1)
- `landmark:phantom-theatre` (zone 2, lair 1 entrance)
- `landmark:squibb-portrait` (zone 2)
- `landmark:thieves-exchange` (zone 3, the realm landmark) and `landmark:counting-house` (zone 3, lair 2 entrance)
- `landmark:sorrows-laughing-shop` (zone 4, the red door)
- `landmark:pellam-lamp` (zone 4, top of the Crooked Stairs)
- `obj:sorrow-pearl-jar` (lair 2, the jar the hero keeps for III-4)
- `obj:guile-capital-halfstone` (lair 3)
- `obj:guile-gate-seal` and `obj:pawned-gate-deed` (gate)

---

# CORSAIR: *What can't be bought?*
| | |
|---|---|
| Start | `area:guile-frontier`, Gallows Reef |
| Mentor | **Captain Dorothea "Dot" Brine** (`npc:dot-brine`, trust starts at 2: the hero signed on last month and hasn't been paid) and her ship, the *Overdraft* |
| Nemesis | **Admiral Saltmarsh** (`npc:saltmarsh`), master of the black-pearl trade. Act III: bound into the Union Chimera |
| Half-stone | the Reef half, at the Gallows (lair 3) |
| Sentinels | A the Lantern Queen, B the Gilded Engine |

## Act I: Gallows Reef (22 quests)
### Main
| # | Quest (`quest:corsair-…`) | Where | Beat | Flags |
|---|---|---|---|---|
| I-1 | `the-bell-over-the-water`, **The Bell over the Water** | zone 1 | Night in the Brine Market. Dot is slipping the *Overdraft*'s moorings to dodge a creditor when the Drowned Bell rings under the sea, and every ship's bell in the market rings back. The black pearls in the hold hum one note, and so does the hero's chest. Tutorial: a boarding fight against Cutpurses on a deck that sways. | `corsair.bell_heard` |
| I-2 | `dots-creditors`, **Dot's Creditors** | zone 1 | Dot sends the hero round the floating market to "renegotiate" her debts, which mostly means hiding behind barrels. Every creditor now wants paying in black pearls, and the divers who bring them up sit at the market's edge, smiling and empty. | |
| I-3 | `vexs-guildhold`, **Vex's Guildhold** | zone 2 to lair 1 | Guildmaster Vex of the Thieves' Exchange has bought up Dot's paper, seized the *Overdraft* and towed her to his sea-fort off the reef. Steal her back. **Boss 1: Guildmaster Vex.** | `corsair.overdraft_back` |
| I-4 | `the-pearl-admiral`, **The Pearl Admiral** | zone 2 | Admiral Saltmarsh sails into Gallows Reef on a white flagship, buys every one of Dot's debts in an afternoon and forgives them with a smile. He is weathered, kind to deckhands, smells of lavender and wears a single black pearl in one ear. He offers the Fleet honest work. | `corsair.saltmarsh_met` |
| I-5 | `the-pearl-charter`, **The Pearl Charter** | zone 2 | Saltmarsh offers the free captains a charter to carry his pearls; the Velvet Court sends letters of marque to raid them instead. Either way, somebody buys the Fleet. **Faction choice** (see below). | `corsair.charter` |
| I-6 | `the-merry-widow`, **The Wreck of the Merry Widow** | zone 3 to lair 2 | False lanterns in the Wreckers' Coves are luring pearl barges onto the rocks, and the ghost ship *Merry Widow* comes for the cargo. Under the charter you're guarding the barges; under the marque you're racing her for them. **Boss 2: Captain Nobody.** Beaten, he unhollows long enough to hand over the contract he signed forty years ago: he sold his name, for a ship, to a nameless wharf-boy. The name was Saltmarsh. | `corsair.nobodys_name` |
| I-7 | `what-the-admiral-sells`, **What the Admiral Sells** | zone 4 | A Thief Crow's hoard on the Crow Islands is full of Saltmarsh's pearls, and the islanders who wept them are kept on "grief rations" so they keep weeping. He wants the Reef half to stop the pearls hollowing anyone, so grief can be farmed safely and sold to all twelve realms when the gates open. INSIGHT options let the hero see it early: the pearl in his ear grows when he lies. | `insight.saltmarsh_pearl`, `corsair.saltmarsh_turned` |
| I-8 | `the-gallows`, **The Gallows** | lair 3 | Up the great gibbet-rock as the tide comes in. **Boss 3: Admiral Saltmarsh (nemesis I).** The hero takes the Reef half from the topmost cage; Saltmarsh dives, surfaces by his flagship and runs for the Pawned Gate's water-arch. | `corsair.halfstone` |
| I-9 | `dots-reckoning`, **Dot's Reckoning** | gate road | The sail to the gate and Dot's farewell, with a trust check. At Friendly she gives her compass, which points at whatever you owe most; at Trusted she gives her parrot Interest too, who compounds. With the **charter**, Saltmarsh's barges try to turn you back; with the **marque**, the King's customs cutters do. | `corsair.dot_farewell` |
| I-10 | `the-pawned-gate`, **The Pawned Gate (sea side)** | `area:guile-gate` | **Boss 4: the Velvet King**, on his gilded barge in the water-arch, waiting to sell passage to the Hollow King. When he falls the gate's deed floats free: **keep it** (and own a realm gate) or **tear it up** (nobody owns it). Then open the gate. | `corsair.gate_deed`, `story.gate_open`, `story.act = 2` |

### Side quests (8)
| Zone | Quest | Beat |
|---|---|---|
| 1 Brine Market | **Everything Must Go** | Salvage Sal is selling her own ship plank by plank while standing on it. Find her a buyer for the rest before she sinks. Comedy. |
| 1 Brine Market | **The Thousand Knot** | The market's ships are lashed together by one great knot, tied the night the gate shut so nobody would be left behind. Thief Crows are picking it apart. Retie it. Codex. |
| 2 Gallows Reef | **The Hat on the Gibbet** | The Fleet stopped hanging people thirty years ago; now it hangs a hat for every captain lost. Captain Merrin Tusk's hat has been stolen a week before the memorial night. |
| 2 Gallows Reef | **A Message in a Pearl** | A diver's pearl plays back the last thing its weeper said: "Just one more, and they'll let me sleep." Find who wept it. A clue for I-7. |
| 3 Wreckers' Coves | **The Wrecker's Daughter** | Little Nell Gant keeps a lantern lit in the coves for her father, who never came home. He crews the *Merry Widow*. If this is done he walks home after I-6 (epilogue slide). |
| 3 Wreckers' Coves | **Ma Colley's Lights** | Ma Colley rents out wreckers' lanterns by the hour, and someone has been paying her in black pearls to keep them lit for the barges. Find out who. |
| 4 Crow Islands | **The Crow Who Stole a Crown** | A Thief Crow's nest holds a tiny crown: one of the crown jewels a Tidecourt Concordant sold twice in C. 384. Codex: who the third buyer was (the Concord). |
| 4 Crow Islands | **Pennywhistle's Map** | Captain Pennywhistle's treasure map leads to a chest that is a Mimic Slime, and it is very sorry. Pure comedy, with a map-shaped reward. |

### Mentor thread (2) and bounties (2)
- **The First Article** (needs Friendly): Dot's hat is lined with the Brine Fleet's original articles, which she stole off the Exchange in C. 1012 so nobody could sell them. Find the missing first page. Article One: "No free captain may be bought, nor sold, nor sell another." Sets `insight.first_article` (opens the I-5 INSIGHT option if it's done first).
- **Quill's Price** (needs Trusted): Dot has one debt she can't pay in coin, to her old first mate Barnaby Quill, who lost a leg pulling her out of the sea and won't take money. Find what he will take: one more voyage. Sets `corsair.dot_devotable`.
- **Bounty: the Parliament of Pockets** (a Thief Crow flock). **Bounty: the Barnacle Mimic** (a Mimic Slime living in a wreck's strongbox).

### Bosses
| Boss | Fight | Black tears |
|---|---|---|
| **Guildmaster Vex** (lair 1) | A rampart duel on his sea-fort while the fort's cannons fire on a timer; he calls in Cutpurses whenever his ledger closes | he loads his cannons with his debtors' black pearls, and the grapeshot hollows |
| **Captain Nobody** (lair 2) | A ghost captain with no name and no face, who can't be targeted until you call him by name; read it off the wreck's clues between phases while his lanterns move the dark | the rigging drips black, and his wreckers' lanterns burn with pearl-light |
| **Admiral Saltmarsh** (lair 3) | On the gibbet-rock as the tide rises a tier each phase; the cages swing like pendulums, and he throws pearls that hatch into hollow Mimic Slimes | the pearl in his ear swells as he fights, and at the end it weeps |
| **The Velvet King** (the gate) | From the sea side: a broadside duel, then boarding his barge. Break its pearl plating with the *Overdraft*'s guns before you can reach him | his barge's hull is crusted with black pearls; beaten, the barge lifts free of them and floats high for the first time in thirty years |

### I-5: The Pearl Charter
| Choice | Immediate | Later |
|---|---|---|
| **Sign the charter** (with Saltmarsh and the Fleet's majority) | the Fleet is rich overnight and free no longer; Dot trust −1 | Act II: Saltmarsh's agents in Lanternford wave you through (C-2 is shorter); Act III: the Fleet's captains are in the Legion camp, hollowed by their own cargo |
| **Take the King's marque** (with the Velvet Court; Dot's pick: "a privateer at least chooses her targets") | the Fleet raids pearl barges legally and owes the Crown a cut | Act II: Pell Odd won't trade with a King's privateer, and the Jester bearer recognises your commission; Act III: the marque lets you board Saltmarsh's flagship at the Weeping Wall |
| **[INSIGHT] Read them the First Article** (needs `insight.first_article`) | the Fleet refuses both offers and stays free and poor; Saltmarsh notices, and smiles | Act III: Saltmarsh's bought name can be taken back mid-fight (an extra phase-skip), and sparing him is easier |

## Act II: the class thread
| # | Quest | Beat |
|---|---|---|
| C-1 | `lanternford`, **The Smugglers of Lanternford** | Lanternford's Bog Market runs on black pearls, and Pell Odd buys his from a man with a white flag. Saltmarsh's trade got here before you did. |
| C-2 | `the-queens-toll`, **The Queen's Toll** | As for the Jester, with Corsair lines: the Lantern Queen and Dot would have got on. |
| C-3 | `the-lantern-queen`, **The Lantern Queen** | **Boss 5.** Release scene, then `story.sentinel.guile`. |
| C-4 | `the-admirals-cargo`, **The Admiral's Cargo** | Saltmarsh is in Gildport, selling barge-loads of black pearls to the Gilded Engine, which burns them to forge the Black Concord. He is the Hollow King's merchant now, and the Legion's binders are waiting for him. |
| C-5 | `the-gilded-engine`, **The Gilded Engine** | **Boss 6:** in the Gilded Ruins. The Corsair boards it like a ship. Stopping it lets the Knight bearer claim Iron's mark (+1). |
| C-6 | `a-bottle-from-dot`, **A Bottle from Dot** | Interest (if Dot gave him) or a bottle bobbing out of the Guile arch brings Dot's letter, written on the back of an IOU. At the Stone Court, the Corsair and the Jester bearer play cards for who buys the drinks, and both cheat. |

**Featured bearers:** **The Lantern Bargain**, with the Rimecaller bearer at Lanternford, who wants to buy one of the Lantern Queen's lights because it holds a frozen memory of her mother (help her haggle, or tell her what it costs), and **Union Rates**, with the Juggernaut bearer at Gildport, who is organising the dockers unloading Saltmarsh's pearls for the Engine (Magda Ruhl's hollow iron and Saltmarsh's pearls share one ledger). +1 each.

## Act III: class quests
- **III-4 Saltmarsh's Last Sale** (boss 7): Saltmarsh bound into the Union Chimera, its hide crusted with pearls and barnacles and his flagship's figurehead for a face. Between phases it offers to buy the hero's grief. **Spare** him: give the name back, and the nameless wharf-boy underneath can be saved (needs the I-5 First Article or Dot Trusted). Or **destroy** him. Sets `corsair.nemesis_fate`.
- **Dot's IOU** (mentor's last request): Dot sends an IOU made out to the Hollow King: "Owed, one apology, from the Brine Fleet, for selling his tears." Have him read it. If `corsair.dot_devotable` is set, Dot goes to Devoted (5).
- **The White Flagship**: Saltmarsh's hollowed crew still sail his flagship round and round the Weeping Wall. Take the ship and set them ashore.
- **Nobody's Name**: an Act I loose end. Captain Nobody's ghost has followed his contract into the Heart. If Saltmarsh was spared, he hands the name back himself; if not, the hero writes it on Nobody's hat and hangs it on the Guile stair.

## Class beats in shared quests
- **II-1:** black pearls lie like gravel in the lee of the Guile arch: tears seeping through the shut gate harden on this side too. Pell Odd has been harvesting them for years.
- **II-2:** [Guile] "Dot's trick: hang a false light on the hill and let them run at it." Maren trust +1, or −1 if done with the charter flag ("you sound like a man who sells lights").
- **II-3:** Elder Godric recognises Dot Brine's name: she owes him four Embershards from C. 1011, and he'd like them back. Pay, and Godric trust +1.
- **II-6:** Saltmarsh strikes at the Eve, stealing the **Jester bearer's** Court half.
- **III-6:** Corsair line to the King: "Half of Tidecourt got rich off your crying. I'm sorry. I don't say that for free."

## Endings
| Ending | Realm | Mentor | Nemesis spared / destroyed |
|---|---|---|---|
| Turning | The pearls stop washing up, the divers dive for fish again, and the Fleet sails the Pawned Gate open to anyone, free | Dot pays every debt she owes in a single afternoon and is bored by evening | a nameless deckhand on the *Overdraft*, learning knots / his white flagship sunk on the reef as a breakwater |
| Unmaking | The Fleet goes back to honest smuggling, and Gallows Reef has no master but the tide | Dot sails off the edge of the chart, owing everyone | sells fish at the Brine Market under his own name, whatever it is / his earring is thrown into the sea |
| Hollow Crown | Tidecourt becomes the crown's treasury and the Fleet its navy: paid, owned and never free again | Dot burns her commission and sails away | the crown's harbourmaster / nobody remembers what he was called, because it was never his |
| First Chord | Every ship in the harbour rings its bell at once: the first shanty of the new Turning | Dot (Devoted) stands on the *Overdraft*'s rail and conducts it with a cutlass | sings it under his own name, at last / Captain Nobody's name is rung for both of them |

## Landmarks and set pieces (for Claude 2)
- `landmark:the-overdraft` (zone 1, Dot's ship, mentor house)
- `landmark:thousand-knot` (zone 1)
- `landmark:hat-gibbets` (zone 2)
- `landmark:vex-guildhold-gate` (zone 2, lair 1 entrance)
- `landmark:colley-lantern-stall` (zone 3)
- `landmark:merry-widow-wreck` (zone 3, lair 2 entrance)
- `landmark:grief-ration-huts` (zone 4)
- `obj:nobody-contract` (lair 2)
- `obj:guile-frontier-halfstone` (lair 3)
- `obj:pawned-gate-deed` (gate, sea side; the keep/tear choice)
- the shared `obj:guile-gate-seal`, water-arch approach
