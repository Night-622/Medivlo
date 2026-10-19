# Verdant: Wildheart (Hedgewitch and Ranger)

Realm: [02-realms.md § Wildheart](../02-realms.md). Gate boss: **the Elder Grove** at the Thorn Gate. Morvane Sentinel A: **the Weeping Willow**.

---

# HEDGEWITCH: *Can there be too much life?*
| | |
|---|---|
| Start | `area:verdant-capital`, Rootholme |
| Mentor | **Mother Yarrow** (`npc:mother-yarrow`, trust starts at 3: she has taught the hero since they were knee-high to a Briarling). She talks to the Elder Tree out loud, all day, about everything. |
| Nemesis | **Bramblewife Ostara** (`npc:ostara`), Act III Herald |
| Half-stone | the Heartwood half, inside the Elder Tree (lair 3) |
| Sentinels | A the Weeping Willow, B the Ooze Sovereign |

## Act I: Rootholme (22 quests)
### Main
| # | Quest (`quest:hedgewitch-…`) | Where | Beat | Flags |
|---|---|---|---|---|
| I-1 | `the-bell-in-the-boughs`, **The Bell in the Boughs** | zone 1 | Night on the Bough Markets. The Drowned Bell rings, every leaf on the Elder Tree turns over silver side up, and the tree grows a whole ring in one breath. A rope bridge snaps. The hero wakes with the Heartwood half's song in their chest and finds Mother Yarrow on the next bough in her slippers, telling the tree to hush. Tutorial: move, cast and talk. | `hedgewitch.bell_heard` |
| I-2 | `pruning-day`, **Pruning Day** | zone 1 | Yarrow hands the hero her second-best shears and sends them to cut five market stalls free of last night's growth. One stall is weeping black sap, and Lantern Row, the street next door, has been swallowed whole overnight, cats and all. "It's not wicked, dear. It's frightened." | |
| I-3 | `the-sleeping-cellars`, **The Sleeping Cellars** | zone 3 to lair 1 | A whole cellar-street in the Root Cellars has fallen asleep and won't wake. The spores are coming from a mushroom cellar where something has grown enormous. **Boss 1: the Ancient Puffcap.** | `hedgewitch.puffcap_down` |
| I-4 | `the-bramblewifes-garden`, **The Bramblewife's Garden** | zone 2 | Bramblewife Ostara grows medicine in the Sap Wells: warm, funny, sticky to the elbows. She heals a dying grandmother with a spoon of sap while the hero watches, and nobody in her ward has died in a year. She asks the hero to help her "keep everyone". | `hedgewitch.ostara_met` |
| I-5 | `the-ring-vote`, **The Ring Vote** | zone 1 | The Root Circle meets in its ring to vote on the Great Pruning: burn back a year's growth to save the swallowed streets. The Bloomkin who woke in that growth would go back to seed. **Faction choice** (see below). | `hedgewitch.pruning` |
| I-6 | `the-seed-vault`, **The Seed Vault** | zone 3 to lair 2 | Whatever was chosen, everyone needs the Seed Vault: the Circle to replant, the Bloomkin to save their kin, or the tree for its spring. Its keeper prunes anyone who comes in. **Boss 2: the Gardener.** In the Gardener's seed-ledger one drawer is empty: the seed of the Elder Tree itself, signed out by Ostara. | `hedgewitch.empty_drawer` |
| I-7 | `what-the-bramblewife-planted`, **What the Bramblewife Planted** | zone 4 | In the Canopy Hollows, Ostara's grafts run into the tree's crown: she has been feeding it black-tear sap for a year. The tears make it grow without stopping. Her patients aren't healed but *held*: rooted, hollow-green and unable to die. She wants the Heartwood half to make the tree cover the world, so nothing will ever have to rot. INSIGHT options let the hero see it early: her patients smell of sap, not skin. | `insight.hedgewitch_sap` |
| I-8 | `the-heartwood`, **The Heartwood** | lair 3 | Into the living heart of the tree, where the wood beats. **Boss 3: Ostara (nemesis I).** She is grafted into the Heartwood and fights with the tree's own limbs. The hero takes the Heartwood half; Ostara rides a tunnelling root down and away towards the Thorn Gate. | `hedgewitch.halfstone` |
| I-9 | `the-root-road`, **The Root Road** | gate road | Yarrow's farewell, with a trust check. At Friendly she gives the acorn she has carried since the tree's last winter; at Trusted she tells the tree the hero's name, and the roots on the gate road part for them (a shortcut, and fewer root-adds at I-10). | `hedgewitch.yarrow_farewell` |
| I-10 | `the-thorn-gate`, **The Thorn Gate** | `area:verdant-gate` | **Boss 4: the Elder Grove**, the tree's own root-mind, hollowed and wrapped round the gate. For the Hedgewitch it's a "talking down" fight: between phases, sing the half-stone to it as Yarrow sings to the tree. The hero opens the gate with the Heartwood half and steps through. | `story.gate_open`, `story.act = 2` |

### Side quests (8)
| Zone | Quest | Beat |
|---|---|---|
| 1 Bough Markets | **Too Many Cats** | Lantern Row was swallowed with nineteen cats in it. Rescue them from the new wood. One of them is a Bloomkin that has decided it's a cat, and won't be told. |
| 1 Bough Markets | **The Compost Debate** | Hepzibah Marl and Old Fennimore Clay have argued about compost across the same bough for forty years. Settle it. They're both wrong: the city's compost heaps have stopped rotting at all. Codex. |
| 2 Sap Wells | **A Sticky Situation** | Sap-tapper Dunstan Treacle has been stuck to his tap for three days and is being very brave about it. Comedy rescue. |
| 2 Sap Wells | **Gran Hasn't Said a Word** | Young Ned Burdock asks whether his Gran is better. Ostara healed her a month ago and she hasn't spoken since; she just smiles and smells of sap. A clue for I-7, and she returns in Act III. |
| 3 Root Cellars | **Moving Day** | The Mudlark family (eight children, one goat) have to move up a level before the roots fill their cellar. Help them carry everything, then help them leave the house behind. |
| 3 Root Cellars | **What Is Thistledown For?** | A newly woken Bloomkin, Thistledown, asks the hero what it is for. There is no right answer. It walks to Thornhollow and appears there in Act II. |
| 4 Canopy Hollows | **Kite Weather** | Briarlings keep snatching kites at the Canopy kite-race. Win it back for the children of the high boughs. |
| 4 Canopy Hollows | **The Topmost Leaf** | Grandmother Wenna Sloe wants to see the topmost leaf before she dies, and the tree has grown past the clouds. Climb it. From the top you can see a willow far away in Morvane: the Elder Tree's daughter, planted at the Concord. Codex. |

### Mentor thread (2) and bounties (2)
- **Yarrow's Tree-Diary** (needs Friendly): Yarrow has written down everything she has said to the tree for sixty years, and can't read her early handwriting. Decode it. In the Concord days the Elder Tree slept every winter, and the Verdant Stone sang it to sleep. Sets `insight.hedgewitch_winter` (opens the I-5 INSIGHT option if it's done first).
- **What the Tree Said Back** (needs Trusted): Yarrow admits the tree has never once answered her. She talks to it anyway. Find the Listening Knot in the canopy, the one place the tree still speaks, and hear it say her name. Sets `hedgewitch.yarrow_devotable`.
- **Bounty: the Cellar Beetles** (a Thorn Beetle nest in the Root Cellars). **Bounty: the Sap Well Bloomtraps.**

### Bosses
| Boss | Fight | Black tears |
|---|---|---|
| **The Ancient Puffcap** (lair 1) | A mushroom the size of a cottage. Its spore-clouds put the hero to sleep in slow rings; stamp its puffballs flat to clear a path, and strike its gills while it breathes in | its spores are black, and anyone they put to sleep dreams of nothing at all |
| **The Gardener** (lair 2) | A topiary giant still pruning a garden nobody wants. Its shears telegraph long cutting lines, and it prunes the hero's summoned plants first. Phase 2 it grows the vault into a hedge maze | its leaves are black-veined, and when it's hurt it prunes itself |
| **Bramblewife Ostara** (lair 3) | She is grafted to the Heartwood: roots erupt in patterns, and she heals from the tree unless the hero cuts her sap-grafts with the half-stone's song | her sap runs black, and her flowers bloom black when she's hurt; first sign of the Herald |
| **The Elder Grove** (the gate) | The root-mind rises out of the gate in three great knots. Cut the hollow roots, then sing to the knot between phases until it nods off | its roots weep black sap into the gate. When it's beaten the tears drain away, and it lets go of the gate and lies down to sleep for a winter |

### I-5: The Ring Vote
| Choice | Immediate | Later |
|---|---|---|
| **Prune** (with the Root Circle and Yarrow) | the swallowed streets come back; the new-woken Bloomkin go back to seed; Ostara walks out of the ring without a word | Act II: Nan Briar approves ("a gardener cuts") and starts at Neutral; Act III: the Herald fights harder for every leaf (one extra phase) |
| **Let it grow** (with the Bloomkin) | the Bloomkin live and cheer; Rootholme loses three more streets; Yarrow trust −1 | Act II: Thistledown and a Bloomkin band are at Thornhollow and help at the Ooze Sovereign; Act III: harder to spare Ostara, because she thinks you agreed |
| **[INSIGHT] Give it a winter** (needs `insight.hedgewitch_winter`) | the half-stone sings the tree a winter's night: it sheds its leaves, the Bloomkin sleep instead of dying, and the growth stops for the first time in thirty years. Ostara is frightened | Act III: the Herald can be spared by giving her a winter too (no Yarrow trust needed); Act II: the Weeping Willow recognises the song |

## Act II: the class thread (Concordia)
| # | Quest | Beat |
|---|---|---|
| C-1 | `thornhollow`, **Thornhollow** | The Verdant diaspora at Thornhollow in Briar Hollow. Nan Briar, who was the Verdant Concordant's gardener three Turnings ago, calls Mother Yarrow "that girl". Thistledown is at the Greenbriar Nursery if it was helped. |
| C-2 | `the-willows-roots`, **The Willow's Roots** | Through the Gloamwood to Stag's Rest, where the Willow weeps black into the wood. The Hedgewitch feels it at once: it's family, a cutting of the Elder Tree. |
| C-3 | `the-weeping-willow`, **The Weeping Willow** | **Boss 5: Sentinel A.** Release: the Willow was planted the day the Concord was sworn, and it asks the hero whether it may finally drop its leaves. Sets `story.sentinel.verdant`. |
| C-4 | `the-bramblewifes-graft`, **The Bramblewife's Graft** | Ostara is in Briar Hollow, feeding black-tear sap to the Ooze Sovereign. She wants to graft its endless hunger into the Elder Tree's stolen seed: a thing that eats forever and never dies. |
| C-5 | `the-ooze-sovereign`, **The Ooze Sovereign** | **Boss 6: Sentinel B**, in the bog. It fights like a monk, because it has eaten the Stone Abbot. Beating it frees the Abbot's discipline and lets the Fist bearer claim their mark (+1 bearers). |
| C-6 | `a-letter-from-yarrow`, **A Letter from Yarrow** | A leaf blows through the Gate Circle with Yarrow's handwriting on it; the tree must have carried it. At the Stone Court, the Ranger bearer, who smells of leaf-mould; your halves sing together, and you argue about compost. |

**Featured bearers:** **The Abbot in the Ooze**, with the Monk bearer at Thornhollow, who wants to bring the Stone Abbot out of the Ooze Sovereign whole (the Sovereign is Fist's Warden; the Monk asks what is owed, you ask how much is too much), and **The Willow's Song**, with the Bard bearer at Stag's Rest, who wants to write down the Willow's song before it stops (the Willow is the Bard's Sentinel B). Each gives +1 `story.bearers_gathered`.

## Act III: class quests
- **III-4 The Herald of Bloom** (boss 7): Ostara remade as the Herald, her robe a living hedge, ringing a seed-pod bell that makes everything in the arena grow. **Spare** her by singing her a winter (needs the I-5 INSIGHT or Yarrow Trusted): she sleeps, and wakes old. Or **destroy** her, and she goes to compost at last. Sets `hedgewitch.nemesis_fate`.
- **Yarrow's Acorn** (mentor's last request): plant Yarrow's acorn on the Verdant stair, so the tree has a word in the Heart. If `hedgewitch.yarrow_devotable` is set, Yarrow goes to Devoted (5).
- **Gran Burdock's Rest**: Ostara's silent patient walked into the Heart and stands rooted in the Legion camp. Let her go to sleep, gently, or bring her home still rooted.
- **Thistledown's Answer**: an Act I loose end. Thistledown turns up at the Heart's edge, having worked out what it's for ("growing where nothing has"), and plants itself there, very pleased (comic relief before the end).

## Class beats in shared quests
- **II-1:** the Verdant arch has grown shut with briar on the Concordia side. The hero has to talk it open.
- **II-2:** [Verdant] "These wolves have been eating bark. Something has starved the wood." Maren trust +1.
- **II-4:** [Verdant] "Plant a seed in a tear." Nothing grows, and then something does: a seed from three Turnings ago, which Nan Briar recognises. Sets `insight.tears_seed`, which supports `insight.tears_older`.
- **II-6:** Ostara is the nemesis who strikes at the Eve, stealing the **Ranger bearer's** Rot half.
- **III-6:** Hedgewitch line to the King: "You wept so long the world grew round you. That isn't life. It's a wound that won't close."

## Endings
| Ending | Realm | Mentor | Nemesis spared / destroyed |
|---|---|---|---|
| Turning | The Elder Tree sleeps its first winter in thirty years, and the swallowed streets come back in the spring | the tree answers Yarrow, out loud, in front of the whole Circle | Ostara tends the compost heaps / her stolen seed grows a small, ordinary apple tree |
| Unmaking | Rootholme prunes by hand forever; the Circle draws up a pruning rota and argues about it in a ring | Yarrow teaches the young witches to talk to the tree | Ostara is sent to the Thornwilds to learn rot from the Wayfarers / compost |
| Hollow Crown | The Elder Tree grows over Concordia and roots the crown in its branches. Nothing in Wildheart ever dies again | Yarrow stops talking to the tree | the crown's gardener / a black flower that never wilts |
| First Chord | Rootholme keeps the first winter of the new Turning: a season of rest written into the song | Yarrow (Devoted) sings the tree to sleep | Ostara sleeps beside it / her seed is planted at the Turning |

## Landmarks and set pieces (for Claude 2)
- `landmark:yarrow-bower` (zone 1, mentor house)
- `landmark:root-circle-ring` (zone 1, I-5)
- `obj:verdant-stall-1..5` (zone 1, I-2)
- `landmark:ostara-sap-garden` (zone 2)
- `landmark:mudlark-cellar` (zone 3)
- `landmark:listening-knot` and `landmark:topmost-leaf` (zone 4)
- `obj:verdant-capital-halfstone` (lair 3)
- `obj:verdant-gate-seal` (gate)

---

# RANGER: *Does everything have to die to feed something else?*
| | |
|---|---|
| Start | `area:verdant-frontier`, the Thornwilds |
| Mentor | **Holt Barrow** (`npc:holt-barrow`, trust starts at 2). Warden-of-Ways, smells of pine, and has one joke, which he has been trying to finish for the whole of the hero's life. Something always interrupts him. |
| Nemesis | **Aldo Mire, the Rotking** (`npc:aldo-mire`), Holt's oldest friend. Act III Herald |
| Half-stone | the Rot half, in the Rotting Glade (lair 3) |
| Sentinels | A the Weeping Willow, B the White Stag |

## Act I: the Thornwilds (22 quests)
### Main
| # | Quest (`quest:ranger-…`) | Where | Beat | Flags |
|---|---|---|---|---|
| I-1 | `the-bell-in-the-thorns`, **The Bell in the Thorns** | zone 1 | Night watch at Wayfarer's Rest. Holt has just got to "a beetle, a boar and a Circle witch walk into the Thornwilds" when the Drowned Bell rings and every path in the wilds moves at once. Thorn Beetles swarm the rope-ladders. The Rot half's song wakes in the hero's chest, and it smells of leaf-mould. Tutorial: move, shoot and talk. | `ranger.bell_heard` |
| I-2 | `walk-the-ways`, **Walk the Ways** | zone 2 | The trails moved overnight. Holt sends the hero to re-blaze five waymarks. Out at the fifth they find grey blight across the old line, and black tears beaded on the bramble like dew. | |
| I-3 | `the-wallow`, **The Wallow** | zone 2 to lair 1 | Something is tearing up the Wayfarers' supply trail, eating whole carts. It's starving, hollow and huge. **Boss 1: the Mossback Boar.** Afterwards, dress it to feed the camp through the winter, or leave it for the forest. | `ranger.boar` |
| I-4 | `the-rotking-returns`, **The Rotking Returns** | zone 1 | Aldo Mire walks into the camp after a year lost in the Rotwood, grey-bearded with shelf-fungus, laughing, and carrying a basket of perfect mushrooms grown from the blight. "The rot's not the enemy, Holt. It's the cook." Holt hugs him for a very long time. | `ranger.aldo_home` |
| I-5 | `the-burning-line`, **The Burning Line** | zone 3 | The Root Circle sends an envoy from Rootholme: the Wayfarers must burn a firebreak through the Bloomfen before the blight reaches the city. The Bloomkin live in the fen. **Faction choice** (see below). | `ranger.line` |
| I-6 | `the-beetle-mound`, **The Beetle Mound** | zone 3 to lair 2 | Whatever was chosen, the beetles come: driven out by the fire, swarming the hand-held line, or eating the living wood they should only eat dead. **Boss 2: the Carapace Queen.** In her mound the hero finds Aldo's spores, sown on purpose. | `ranger.spores_found` |
| I-7 | `the-rotkings-crown`, **The Rotking's Crown** | zone 4 | In the Rotwood Aldo crowns himself in shelf-fungus among his hollowed Bloomkin. He has been seeding the blight with black tears. He wants the Rot half to let everything fall at once, the whole world, and see what grows, even out of the Hollow King's tears. INSIGHT options see it coming: nothing in his basket ever had a spore. His rot eats and makes nothing. | `insight.ranger_barren` |
| I-8 | `the-rotting-glade`, **The Rotting Glade** | lair 3 | The dead glade at the Rotwood's heart, where the trees stand up only out of habit. **Boss 3: Aldo (nemesis I).** The hero takes the Rot half; Aldo sinks into the leaf-mould like a man into a bath and is gone, under the roots, towards the Thorn Gate. | `ranger.halfstone` |
| I-9 | `the-last-waymark`, **The Last Waymark** | gate road | Holt's farewell, with a trust check. At Friendly he gives the hero his waymark knife; at Trusted he walks with them to the gate and holds the roots back himself (fewer adds at I-10). He starts the joke again, and the gate interrupts him. | `ranger.holt_farewell` |
| I-10 | `the-thorn-gate`, **The Thorn Gate (wilds side)** | `area:verdant-gate` | **Boss 4: the Elder Grove**, a forest that has forgotten how to let anything die. From the wilds side it's a "letting fall" fight: cut the hollow roots, and the old ones the Rot half touches fall away by themselves. Then open the gate. | `story.gate_open`, `story.act = 2` |

### Side quests (8)
| Zone | Quest | Beat |
|---|---|---|
| 1 Wayfarer's Rest | **The Salt Thief** | Cook Dunmore Fitch has been feuding with a red squirrel that steals the camp's salt every day, and has done for eleven years. Catch it, or broker a peace. Either way it ends up in the hero's pack. |
| 1 Wayfarer's Rest | **Names on the Tree** | Three new names are due on the camp's memorial tree this year. One is Kit Fernsby's. Find her bow in the Thornwilds so her name can be carved properly. Epilogue slide. |
| 2 Thornwilds | **The Path That Likes Him** | The pedlar Cobb Tinsley has been walking in a circle for four days, because the path keeps moving with him. It turns out the path is fond of him. |
| 2 Thornwilds | **The Still Tune** | The Wayfarers once had a fiddle tune that held the paths still for one song. Old Ivo Pennick has forgotten it; the Bloomkin haven't. Codex. |
| 3 Bloomfen | **Lilies for a Wedding** | A fen wedding needs real lilies, and half of them are Bloomtraps. Pick carefully. Comedy, with one very surprised best man. |
| 3 Bloomfen | **The Bloomkin Census** | The fen's Bloomkin want to count themselves before they decide whose side they're on. Their counter, a solemn bulrush called Old Cattail, keeps losing count. Whoever you count speaks at I-5. |
| 4 Rotwood | **The House Is Just Old** | Woodcutter Bram Hatchley won't leave his half-rotted cottage: "It's just getting old, same as me." Help him carry out the one thing he wants to keep. |
| 4 Rotwood | **Mushroom Supper** | Collect blight mushrooms from Aldo's old supper spot for the camp's herbalist, Sister Morel. They taste wonderful, and she can't find a single spore in them. A clue for I-7. |

### Mentor thread (2) and bounties (2)
- **The Old Rot** (needs Friendly): Holt takes the hero to the oldest stump in the Thornwilds, a log that has been rotting gently for a thousand years and feeds a whole grove. Honest rot eats only the dead; the tears are what make it eat the living. Sets `insight.ranger_old_rot` (opens the I-5 INSIGHT option if it's done first).
- **Holt and Aldo** (needs Trusted): Holt shows the hero the waymark he and Aldo carved as boys. Find Aldo's last blaze in the Rotwood, cut before he turned: "Sorry, Holt. It's so quiet out here." Sets `ranger.holt_devotable`.
- **Bounty: the Arrow-Thief Briarlings.** **Bounty: Old Snapjaw** (a Bloomtrap that swallowed a ferry punt).

### Bosses
| Boss | Fight | Black tears |
|---|---|---|
| **The Mossback Boar** (lair 1) | Charging runs through a mud wallow that slows the hero. The moss on its back regrows and heals it unless the hero shoots it off, patch by patch | its moss has gone grey-black, and the mud is tear-sludge that drains stamina |
| **The Carapace Queen** (lair 2) | A Thorn Beetle as big as a cart. Shoot the joints between her plates; she burrows and surfaces under the hero, and her drones carry her eggs | her shell oozes black lacquer, and her eggs hatch hollow |
| **Aldo Mire** (lair 3) | Dead trees fall on cue, spore-clouds drift, and the hero's bow slowly rots in their hands (a weapon-decay meter). Keep moving to the green patches the half-stone wakes, where the bow mends | his fungus weeps black, and the blight he spreads is the tears themselves |
| **The Elder Grove** (the gate) | From the wilds side: the roots rise in walls. Cut the hollow ones; touch the old ones with the Rot half and they crumble on their own | the tears run in its root-sap. When they drain, the dead roots fall and the living ones let go of the gate |

### I-5: The Burning Line
| Choice | Immediate | Later |
|---|---|---|
| **Burn the break** (with the Root Circle's envoy) | the blight stops at the Bloomfen; the fen's Bloomkin burn or flee; Holt says nothing for a whole day | Act II: Nan Briar starts at Neutral ("someone had to"); Act III: harder to spare Aldo, who calls you a Circle dog |
| **Hold the line** (with the Wayfarers and the Bloomkin) | no fire: the Wayfarers fight the blight tree by tree; three are hurt; the Bloomkin join the line | Act II: a Bloomkin scout guides the hero through the Gloamwood to the White Stag; Act III: the Wayfarers' blazes mark a path through the Legion camp |
| **[INSIGHT] Let the rot be honest** (needs `insight.ranger_old_rot`) | the half-stone's song turns the blight back to ordinary rot along the line: the dead wood falls, the living stands. Aldo watches, and for the first time he looks afraid | Act III: the Herald can be spared with the Old Rot's mould (no Holt trust needed) |

## Act II: the class thread
| # | Quest | Beat |
|---|---|---|
| C-1 | `the-hedge-house`, **The Hedge House** | Thornhollow's Hedge House was the Wayfarers' old waystation in Concordia. Nan Briar knew Holt's grandfather and thinks Holt still owes her a ladder. |
| C-2 | `stags-rest`, **Stag's Rest** | Old Wayfarer ways into the Gloamwood. The Willow's black weeping has rotted the glade, but not honestly: nothing in it feeds anything. |
| C-3 | `the-weeping-willow`, **The Weeping Willow** | **Boss 5.** Ranger framing: the Willow can't let its leaves fall. Release scene, then `story.sentinel.verdant`. |
| C-4 | `the-rotkings-trail`, **The Rotking's Trail** | Aldo's barren spores lead deeper into the Gloamwood, to the glade where the White Stag grieves. He is feeding on the Stag's grief to rot the whole wood. |
| C-5 | `the-white-stag`, **The White Stag** | **Boss 6: Sentinel B**, the Stag the Turning procession followed. It isn't sick, it's grieving, and Nan Briar was right. Freeing it lets the Hunt bearer claim their mark (+1). |
| C-6 | `holts-blaze`, **Holt's Blaze** | Holt doesn't write. A fresh Wayfarer blaze appears on the Concordia side of the Verdant arch, meaning "I walked this far." He came to the gate himself. At the Stone Court, the Hedgewitch bearer, who smells of sap; you argue about compost. |

**Featured bearers:** **The Hooded Stag**, with the Falconer bearer in the Gloamwood, who wants to hood the Stag's grief so it can't run while you want to let it run out (the Stag is the Falconer's Sentinel A), and **The Stag's Last Saga**, with the Skald bearer at the glade, who is losing the Stag's saga a verse a day and needs a Ranger to track where the verses went (the Stag is the Skald's Sentinel B). +1 each.

## Act III: class quests
- **III-4 The Herald of Rot** (boss 7): Aldo remade as the Herald, his robe a skirt of shelf-fungus, ringing a bell of hollow wood. **Spare** him by pressing the Old Rot's living mould into his hands (needs the I-5 INSIGHT or Holt Trusted): he remembers that rot is supposed to feed something. Or **destroy** him. Sets `ranger.nemesis_fate`.
- **Holt's Last Blaze** (mentor's last request): carve the Wayfarers' blaze on the Verdant stair, so whoever comes after can find the way. Under the blaze-knife's grip is a note in Holt's hand: the punchline to the joke. It is terrible. If `ranger.holt_devotable` is set, Holt goes to Devoted (5).
- **Aldo's Garden**: plant Aldo's barren mushrooms in honest rot at the Heart's edge, and see if anything comes up. If he was destroyed, one small honest mushroom grows where he fell.
- **The Salt Thief Abroad**: an Act I loose end. The squirrel has been in the hero's pack since the Thornwilds, with eleven years of the camp's salt, and it picks the Heart to make its escape (comic relief before the end).

## Class beats in shared quests
- **II-1:** the Verdant arch's briars have rotted on the Concordia side. The hero steps out through a crumble of black leaf-mould.
- **II-2:** [Verdant] "Track them back. These wolves aren't hunting, they're running from the rot." Maren trust +1.
- **II-4:** [Verdant] "Let a tear rot." It won't, and nothing on earth should be able to refuse. Sets `insight.tears_unrotting`, which supports `insight.tears_older`.
- **II-6:** Aldo strikes at the Eve, stealing the **Hedgewitch bearer's** Heartwood half.
- **III-6:** Ranger line to the King: "You let a whole world rot to feed one hunger, and you're still hungry."

## Endings
| Ending | Realm | Mentor | Nemesis spared / destroyed |
|---|---|---|---|
| Turning | The blight turns back to honest rot, and the Rotwood grows green out of its own fallen trees | Holt finally finishes the joke at the Wayfarers' fire. Nobody laughs, and he is delighted | Aldo walks the Rotwood as a Wayfarer again / a ring of honest mushrooms where he fell |
| Unmaking | The Thornwilds stay wild, and the Wayfarers keep the paths with no Circle and no crown to answer to | Holt retires to the Old Rot stump | Aldo lives alone in the Bloomfen / his name on the memorial tree, carved low down |
| Hollow Crown | The hero's crown decrees that nothing in Wildheart may rot. The paths stop moving and the forest goes quiet | Holt walks off into the wilds and isn't found | the crown's gamekeeper / "the Mire" becomes the Wayfarers' word for blight |
| First Chord | The Wayfarers walk the first path of the new Turning, from the Thorn Gate to Concordia, and it moves for them | Holt (Devoted) tells the joke in the middle of the song | Aldo sings the low verse / Holt sings it for him |

## Landmarks and set pieces (for Claude 2)
- `landmark:holt-lookout` and `landmark:wayfarer-memorial-tree` (zone 1, mentor)
- `obj:wayfarer-blaze-1..5` (zone 2, I-2)
- `landmark:old-rot-stump` (zone 2, mentor thread)
- `landmark:bloomkin-census-stone` and `landmark:burning-line` (zone 3)
- `landmark:hatchley-cottage` and `obj:aldo-last-blaze` (zone 4)
- `obj:verdant-frontier-halfstone` (lair 3)
- the shared `obj:verdant-gate-seal`, wilds-side approach
