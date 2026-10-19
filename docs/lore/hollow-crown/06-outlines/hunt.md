# Hunt: the Greywilds (Huntsman and Falconer)

Realm: [02-realms.md § The Greywilds](../02-realms.md). Gate boss: **the Great Hunt** at the Antler Gate. Morvane Sentinel A: **the White Stag**.

The Huntsman's story asks what a hunter may *take*; the Falconer's asks what a hunter may *hold*. The Huntsman works among the Lodge's laws, debts and trophies, down in the forest and the town. The Falconer works among birds, sky and the quiet people of the moor, where the danger isn't killing but calm.

---

# HUNTSMAN: *What may a hunter take?*
| | |
|---|---|
| Start | `area:hunt-capital`, Antlerford |
| Mentor | **Ulric Bannock**, Master of the Lodge (`npc:ulric-bannock`, trust starts at 2), and his elderly deerhound **Biscuit**, who has never caught anything |
| Nemesis | **Lady Corva Ashby** (`npc:corva-ashby`), a Trophy Baron. Act III Union Chimera |
| Half-stone | the Lodge half, in the Trophy Hall (lair 3) |
| Sentinels | A the White Stag, B the Spinner Below |

## Act I: Antlerford (22 quests)
### Main
| # | Quest (`quest:huntsman-…`) | Where | Beat | Flags |
|---|---|---|---|---|
| I-1 | `the-bell-in-the-antlers`, **The Bell in the Antlers** | zone 1 | Night, on smokehouse watch in the Lodge Yards. The Drowned Bell rings, every antler on every wall in Antlerford hums the same note, and the kennels howl. The Lodge half's song leads the hero to the locked gates of the Trophy Hall. Bannock finds them there and walks them home without asking why. Tutorial: move, crossbow, track and talk. | `huntsman.bell_heard` |
| I-2 | `count-the-herd`, **Count the Herd** | zone 3 | Bannock takes the hero down the Elkway to count the autumn herd, as the Lodge has done every year for a thousand years. There is no herd: only Great Elk standing wrong among the trees with black tears in their eyes, who charge when you look away. | |
| I-3 | `the-poachers-camp`, **The Poachers' Camp** | zone 4 to lair 1 | Snares are strung right across the Elkway. The Poacher Chief is selling tear-stained pelts to the Tannery Lanes, and his snares weep and hollow whatever they hold. **Boss 1: the Poacher Chief.** | `huntsman.snares_cut` |
| I-4 | `the-barons-bonfire`, **The Baron's Bonfire** | zone 2 | Lady Corva Ashby, the richest Trophy Baron in the Greywilds, buys every tear-stained pelt in the Tannery Lanes and burns them in the street. Then she pays the Lodge's debts in full and asks for the hero by name to lead her hunting party: she has heard they're the best tracker in Antlerford, and she's right. | `huntsman.corva_met` |
| I-5 | `the-old-law`, **The Old Law** | zone 1 | The Barons offer to buy the Lodge's charter, the old law of the chase that says what may be hunted, and when. **Faction choice** (see below). | `huntsman.charter` |
| I-6 | `the-swollen-queen`, **The Swollen Queen** | zone 4 to lair 2 | Whatever was chosen, the Elkway's sick animals are fleeing into the Tick Hollows: driven by the Barons' cull, chased by the Lodge's hungry hunters, or turned off the rebuilt road. The Swollen Queen is waiting for them, fat on hollow blood. **Boss 2: the Swollen Queen.** | `huntsman.hollows_clear` |
| I-7 | `the-empty-wall`, **The Empty Wall** | zone 2 | The Queen's hollow is full of tags from Corva's hunting parties: she has been driving the hollow herd into it. Corva means to kill the Great Hunt itself and hang its antlers in the Trophy Hall, where the Lodge half has been set in a stag's brow for thirty years. It won't sing for her. It will sing for its bearer, and the Great Hunt will come to the song, and she'll shoot it under her own roof. "Someone has to put it down. The Lodge won't. I will, and I'll keep what I take." INSIGHT options let the hero work out that her last forty trophies were all hollowed animals, each killed the night it turned. | `huntsman.corva_turned`, `insight.corva_tally` |
| I-8 | `the-trophy-hall`, **The Trophy Hall** | lair 3 | **Boss 3: Corva (nemesis I)**, among her mounted heads, which turn their glass eyes and then their antlers on the hero. The hero lifts the Lodge half from the stag's brow. Corva rides out along the Elkway to wait for the Great Hunt at the Antler Gate. | `huntsman.halfstone` |
| I-9 | `the-last-count`, **The Last Count** | gate road | Bannock walks the Elkway with the hero to the gate road, counting what's left: two elk, a fox and Biscuit. A trust check: at Friendly he gives his horn, which calls the Lodge. At Trusted he also gives Biscuit, as a pet. | `huntsman.bannock_farewell` |
| I-10 | `the-antler-gate`, **The Antler Gate** | `area:hunt-gate` | **Boss 4: the Great Hunt**, circling the gate at the head of a hollow herd, with Corva on the ridge above with her crossbow. The old law: run it to a standstill, and don't kill it. When the tears leave it, it lowers its head and offers the hero one tine. **Take it**, or **take nothing**. Then open the gate. | `huntsman.tine`, `story.gate_open`, `story.act = 2` |

### Side quests (8)
| Zone | Quest | Beat |
|---|---|---|
| 1 Lodge Yards | **Grandfer Lumm's Hat** | The Lodge's oldest braggart, Grandfer Lumm, swears he once caught a boar in his hat. Prove it, or kindly arrange not to. Comedy. |
| 1 Lodge Yards | **Hounds Facing East** | Kennelmaster Jem Furlong's hounds have refused to hunt since the Bell. They lie down facing the Antler Gate. Walk them, and learn what they're waiting for. They run with the hero at I-10. |
| 2 Tannery Lanes | **The Back Room** | Tanner Mistress Griselda Lusk sells tear-stained pelts from a back room, and her customers are going quiet. Shut it down, or follow the pelts back to whoever supplies them: a clue for I-3. |
| 2 Tannery Lanes | **Gloves for a Giant** | No glover in Antlerford has ever fitted Bannock, and he's too shy to be measured. Get a measurement out of him for a pair of feast gloves. Comedy. He wears them in the epilogue slides. |
| 3 the Elkway | **The Gamekeeper's Notice** | Corva's gamekeeper, Quentin Snipe, wants to hand in his notice and can't face her. Deliver it for him. He tells the hero that she weeps after every kill. He returns in Act III. |
| 3 the Elkway | **The Last Calf** | A newborn elk calf on the Elkway, alone and tear-free. Lead it home to cover without touching it once (the old law). It runs with the Great Hunt after I-10. |
| 4 the Old Snares | **Unstringing** | Cut the snares across the Old Snares. Each one holds something: a Baron's hound, a hollow hare, and in the last one the Poacher Chief's own boot, with his second-in-command still in it. |
| 4 the Old Snares | **The First Letter** | A hunter's bones hang in a snare-tree, with a letter to the Lodge dated C. 1013: the first record of the herds leaving their roads. Codex; Ysolde wants it in Act II. |

### Mentor thread (2) and bounties (2)
- **The Herd-Road Cairns** (needs Friendly): Bannock takes the hero to rebuild the first antler-cairn on the Elkway, and explains. The herds didn't lose their road: the Barons pulled the cairns down so the herds would be easier to drive. Sets `insight.cairns_pulled` (opens the I-5 INSIGHT option if it's done first).
- **Biscuit's Hunt** (needs Trusted): Bannock wants Biscuit to catch something, once, before she's too old. Set up a hunt she can win. She catches a hare, looks at it, and lets it go. Bannock has to sit down. Sets `huntsman.bannock_devotable`.
- **Bounty: the Old Snares Tick Swarm** (Giant Ticks). **Bounty: Old Broadhead** (a hollowed bull Great Elk).

### Bosses
| Boss | Fight | Black tears |
|---|---|---|
| **The Poacher Chief** (lair 1) | A trapper's camp strung with snares he can trigger. Cut the lines and flush him out of his hides. | his snares weep black; anything caught is hollowed (a slow Ember drain until the hero breaks free) |
| **The Swollen Queen** (lair 2) | A tick the size of a hill that latches on and drains. Shoot the swollen sacs on her back; when she's done she deflates with a long, rude noise. | she is swollen with tears, not blood, and her bites drain Ember |
| **Corva Ashby** (lair 3) | A crossbow duel among the trophy cases. She reloads behind the glass; shoot out the hooks so the mounted heads fall on her side. | tears run from the glass eyes of her trophies, never from her own |
| **The Great Hunt** (the gate) | For the Huntsman, a chase: keep pace round the gate ring and never shoot to kill. Thin the hollow herd, let the half-stone's song slow it, and stop Corva's bolts from the ridge. | its antlers of light run black, like a candle smoking. When it's beaten the tears drip off and the antlers relight |

### I-5: The Old Law
| Choice | Immediate | Later |
|---|---|---|
| **Sell the charter** (with the Trophy Barons) | the Lodge's debts are paid and the Barons begin culling hollowed animals; Bannock trust −1 | Act II: Hollis Lodge calls you a Baron's hound, so C-1 starts cold; Act III: Corva's part of the Chimera carries your licence, and sparing her needs the Lodge horn |
| **Keep the old law** (with Bannock and the Great Lodge) | the Lodge stays poor; the Barons hunt anyway, unlicensed | Act II: Maren treats you as a real Lodge hunter (an extra Maren trust +1 at II-2); Act III: harder to spare Corva ("the last honest fool") |
| **[INSIGHT] Rebuild the road** (needs `insight.cairns_pulled`) | the hero and Bannock lead the Lodge out to rebuild every cairn on the Elkway by torchlight; the hollow herd falters and turns; Corva notices | I-10: the Great Hunt finds its road and the fight loses a phase; Act III: Corva can be spared by showing her the road |

## Act II: the class thread (Concordia)
| # | Quest | Beat |
|---|---|---|
| C-1 | `hollis-lodge`, **Hollis Lodge** | The Hunt diaspora in the Gloamwood. Maren's family lodge hasn't hunted by the old law in thirty years, because nobody was left to teach it. They tell the hero the Hunt's Sentinel, the White Stag, is weeping in its glade. |
| C-2 | `the-stags-road`, **The Stag's Road** | Follow the White Stag's trail through the Gloamwood without taking anything: no pelts, no herbs, no kills. If the hero takes, the trail goes cold. |
| C-3 | `the-white-stag`, **The White Stag** | **Boss 5: Sentinel A.** Release: the Stag the Turning procession followed asks whether anyone will follow it again, or only hunt it. Sets `story.sentinel.hunt`. |
| C-4 | `the-barons-list`, **The Baron's List** | Corva is in Concordia with a list from the Hollow King: the twelve Sentinels, with a bounty on each. She has gone under the Gloamwood roots after the Spinner. The King's smiths have begun binding her into the Chimera. |
| C-5 | `the-spinner-below`, **The Spinner Below** | **Boss 6: Sentinel B**, under the Gloamwood roots. Beating it lets the Duskweaver bearer claim the Umbral mark (+1 bearers). |
| C-6 | `a-letter-by-hawk`, **A Letter by Hawk** | Bannock's letter arrives on the Falconer bearer's hawk; Biscuit sniffs it all over. Then the Stone Court: the Huntsman and the Falconer bearer. Biscuit and the hawk do not get on. |

**Featured bearers:** **What the Wild Gives**, with the Ranger bearer at Hollis Lodge, who believes everything must die to feed something else. They follow the Stag's trail together and argue about what a hunter owes. And **The Unwoven Hunt**, with the Duskweaver bearer under the roots: the Spinner is unweaving the records of every Turning hunt, the Duskweaver wants them remembered, and the Huntsman still knows where the old trails ran. Each gives +1 `story.bearers_gathered`.

## Act III: class quests
- **III-4 The Antlered Chimera** (boss 7): Corva is bound into the Union Chimera as its antlers and its aim; she sights for it. **Spare** her: offer her the Great Hunt's tine, a thing that was given rather than taken (needs `huntsman.tine`, or the I-5 INSIGHT, or Bannock Trusted). Corva has never been given anything she didn't kill. Or **destroy** her. Sets `huntsman.nemesis_fate`.
- **The Homeward Call** (mentor's last request): carry Bannock's horn to the Citadel and blow the Lodge's call for the herd to come home. If `huntsman.bannock_devotable` is set, Bannock goes to Devoted (5).
- **The Gamekeeper**: Quentin Snipe has followed Corva into the Heart, to bring her home or to bury her. Help him do whichever it turns out to be.
- **The Calf on the Stair**: an Act I loose end. The tear-free calf from the Elkway, half grown, has followed the Great Hunt's old road all the way into Concordia, and stands on the Hunt stair waiting to be led.

## Class beats in shared quests
- **II-1:** the carved antlers on the Hunt arch have been sawn off on the Greywilds side, for somebody's wall.
- **II-2:** [Hunt] Huntsman: "Read the tracks: these wolves were herded." Maren trust +1 (another +1 with *Keep the old law*).
- **II-4:** [Hunt] "It isn't sick. It's grieving. You can tell by the way it doesn't eat." Nan trust +1, and the hero skips one step of the herb-gathering.
- **II-6:** Corva strikes at the Eve, stealing the **Falconer bearer's** Moor half.
- **III-6:** Huntsman line to the King: "The old law says take only what the hunt gives. You took the crown, and it never gave you anything."

## Endings
| Ending | Realm | Mentor | Nemesis spared / destroyed |
|---|---|---|---|
| Turning | The herds walk the Elkway again, and the Lodge counts them, every one | Bannock leads the count in his feast gloves, Biscuit at heel | Corva rebuilds the cairns she pulled down / the Trophy Hall is emptied and opened to the public |
| Unmaking | The herds come back slowly and warily; the Lodge and the Barons share the woods, badly | Bannock nails the charter to a tree and gives it to the forest | Corva turns her hall into a hospital for hollowed animals / she lies under the first cairn on the Elkway |
| Hollow Crown | The Greywilds is hunted bare to feed the crown's table | Bannock hangs up his crossbow and won't take it down | Corva is your huntmaster / her antlers hang over your throne |
| First Chord | The Great Hunt runs the Turning road through Concordia again, and the Lodge's horns sound the first note | Bannock (Devoted) blows the horn | Corva follows the Hunt, and doesn't raise her bow / her crossbow hangs unstrung on the Antler Gate |

## Landmarks and set pieces (for Claude 2)
- `landmark:lodge-smokehouse` (zone 1, I-1)
- `landmark:great-lodge-hall` and `landmark:bannock-hearth` (zone 1, mentor house)
- `landmark:lodge-kennels` (zone 1)
- `landmark:lusk-tannery` (zone 2)
- `landmark:trophy-hall-gates` (zone 2, lair 3 entrance)
- `obj:elkway-cairn-1..6` (zone 3, mentor thread and the I-5 INSIGHT)
- `landmark:poachers-camp-stockade` (zone 4, lair 1 entrance)
- `landmark:tick-hollows-mouth` (zone 4, lair 2 entrance)
- `landmark:snare-tree` (zone 4)
- `obj:hunt-capital-halfstone` (lair 3)
- `obj:great-hunt-tine` (gate, I-10)
- `obj:hunt-gate-seal` (gate)

---

# FALCONER: *Can you hold something without hooding it?*
| | |
|---|---|
| Start | `area:hunt-frontier`, the Hawkmoor |
| Mentor | **Old Wren** (`npc:old-wren`, trust starts at 3: she taught the hero to fly their first bird), and her kestrel **Pibb**, through whose eyes she sees |
| Nemesis | **The Hooded Man** (`npc:hooded-man`), once Wren's apprentice, Teodor Tanager. Act III Union Chimera |
| Half-stone | the Moor half, on the Moor's Crown (lair 3) |
| Sentinels | A the White Stag, B the Stormcrow |

## Act I: the Hawkmoor (22 quests)
### Main
| # | Quest (`quest:falconer-…`) | Where | Beat | Flags |
|---|---|---|---|---|
| I-1 | `the-bell-over-the-moor`, **The Bell over the Moor** | zone 1 | Night. The Drowned Bell rings and every bird on the Mews Cliffs takes off at once, hooded or not: ten thousand wings in the dark. The hero's own hawk goes with them to the Moor's Crown and comes back with the Moor half's song caught in its feathers. Wren, on her perch-ledge, watches it all through Pibb's eyes and laughs. Tutorial: move, cast the hawk, call it back and talk. | `falconer.bell_heard` |
| I-2 | `the-falling-birds`, **The Falling Birds** | zone 2 | Wren sends the hero out over the moor to count the wild hawks. Half of them are gone. The rest are dropping out of the sky towards the Featherfall with black tears on their wings, and getting up again wrong. | |
| I-3 | `the-bear-cave`, **The Bear Cave** | zone 2 to lair 1 | The Alpha Bear has come down to raid the Mews' hen-runs and the shepherds' folds. Its eyes run black and it can't stop eating. **Boss 1: the Alpha Bear.** | `falconer.bear_down` |
| I-4 | `the-gentle-stranger`, **The Gentle Stranger** | zone 1 | A stranger in a soft leather hood walks into the Mews Cliffs with a panicking falcon on his fist, hoods it, and it settles. He goes round the cliffs hooding the frightened birds one by one, and the Mews gives him supper. When the hero's hawk panics at the falling birds, he offers, kindly, to hood it too. | `falconer.hooded_man_met` |
| I-5 | `the-hooding`, **The Hooding** | zone 1 | The Mews votes. The Hooded Man proposes hooding every bird on the cliffs until the tears pass. The Great Lodge's envoy wants the Mews' hawks for Antlerford, to hunt the hollow herd beside the Huntsmen. **Faction choice** (see below). | `falconer.hooding` |
| I-6 | `grandmother-talon`, **Grandmother Talon** | zone 4 to lair 2 | Whatever was chosen, the birds are being pulled to the Hollow Eyrie: the hooded ones walk there on foot, the Lodge's hawks fly off course, and the free ones circle it, crying. Grandmother Talon, eldest of the great hawks, is calling every bird on the moor home. **Boss 2: Grandmother Talon.** | `falconer.talon_freed` |
| I-7 | `what-the-hood-holds`, **What the Hood Holds** | zone 3 | On the Windscour Plain whole steadings sit calm and quiet in their doorways, hooded in black tears. The Hooded Man is Teodor Tanager, Wren's apprentice, who left the Mews in C. 1030. He hoods minds now as well as birds, and nobody he hoods is ever frightened, or in pain. With the Moor half he could hood the whole Greywilds, the Great Hunt too, and "nothing would ever be afraid again." INSIGHT options let the hero notice that his own hood is wet on the inside. | `falconer.teodor_turned`, `insight.teodor_hooded_himself` |
| I-8 | `the-moors-crown`, **The Moor's Crown** | lair 3 | The stone ring on the highest hill. **Boss 3: the Hooded Man (nemesis I).** Mid-fight he hoods the hero's hawk and it drops to his fist; the hero must call it back without a lure. The hero takes the Moor half, and Teodor is carried off on a cloud of hooded birds towards the Antler Gate. | `falconer.halfstone` |
| I-9 | `cut-jesses`, **Cut Jesses** | gate road | Wren's farewell, with a trust check. At Friendly she gives her old glove. At Trusted she also gives Pibb, her kestrel and her eyes, as a pet: "I've seen enough. You go and see the rest." | `falconer.wren_farewell` |
| I-10 | `the-antler-gate`, **The Antler Gate (Hawkmoor side)** | `area:hunt-gate` | **Boss 4: the Great Hunt**, running blind under a hood of black tears that Teodor drew over its eyes. The fight is from the sky: the hero's hawk strikes at the hood in passes while the hero keeps the hollow herd off. When the hood falls, the Great Hunt looks up. Then open the gate. | `story.gate_open`, `story.act = 2` |

### Side quests (8)
| Zone | Quest | Beat |
|---|---|---|
| 1 Mews Cliffs | **Pibb Won't Come Down** | Pibb has taken against the new perch-ledge and is sulking on the chapel roof, and Wren is blind until he comes down. Comedy; introduces Pibb. |
| 1 Mews Cliffs | **The Jess-Maker's Knots** | Odile Thistlewood ties a different knot for every bird on the cliffs, and her hands have started to shake. Learn the knots from her: a knot that holds a bird but lets it go when it truly pulls. The knot opens a hooded mind in Act III. |
| 2 the Hawkmoor | **Shepherd Coyle's Dog** | Shepherd Amos Coyle's sheepdog has started herding hawks, and the hawks have started letting her. Sort it out. Comedy. |
| 2 the Hawkmoor | **The Moorland Post** | Carry messages between the moor steadings by hawk. One, unsent since C. 1030, is from Wren to Teodor. A clue for I-7. |
| 3 the Windscour Plain | **Bones of the Herd** | Ma Ketterick reads the herd bones on the plain: they all died running towards the Antler Gate on the same night in C. 1012. Codex: the herds ran to a Turning that never came. |
| 3 the Windscour Plain | **The Quiet Steading** | A family sits hooded and content on their doorstep. Their boy, who wasn't hooded, asks the hero to wake his mother. You can't yet: promise. After I-8 she wakes, and the boy is waiting on the road at I-9. |
| 4 the Featherfall | **The Feather-Counter** | Old Elias Downe counts and names every bird that falls in the Featherfall. Help him for a day. One carries a ring from Cliffstair, in Concordia, thirty years old. |
| 4 the Featherfall | **Fledglings** | A nest of tear-free fledglings in the Featherfall, their mother gone. Raise them without hoods. They fly in the I-10 fight, and return in Act III. |

### Mentor thread (2) and bounties (2)
- **Pibb's Eyes** (needs Friendly): Wren lets the hero fly as Pibb, a short sequence seen through the kestrel's eyes. A hawk sees black tears as a colour and steers round them. A hooded bird can't. Sets `insight.hawks_see_tears` (opens the I-5 INSIGHT option if it's done first).
- **The First Hood** (needs Trusted): Wren kept the first hood she ever made. She put it on Teodor's first bird when he was a frightened boy, and he never quite took it off again. Find it in the old mews and burn it with her. Sets `falconer.wren_devotable`.
- **Bounty: the Featherfall Cast** (a hollowed cast of Hunting Hawks). **Bounty: Tick Hill** (a Giant Tick on the Windscour Plain, mistaken for a hill by two separate shepherds).

### Bosses
| Boss | Fight | Black tears |
|---|---|---|
| **The Alpha Bear** (lair 1) | It charges and climbs the cave walls. The hawk harries its eyes while the hero strikes its flanks. | the tears make it hungrier: each phase it eats something and heals, unless the hawk steals it first |
| **Grandmother Talon** (lair 2) | Aerial dives through the eyrie, and a duel in the air between her and the hero's hawk. | a hood of tears covers her eyes, so she dives at sound. When the hawk tears it away, she can see again, and stops |
| **The Hooded Man** (lair 3) | He hoods the hero's hawk and sends hooded birds that never flinch, and he drapes the ring in calm (a slowing aura). Break the hood on each standing stone to lift it. | his hood is wet on the inside: he has been weeping behind it for years |
| **The Great Hunt** (the gate) | From the Hawkmoor side, from the sky: hold the high paths above the gate while the hawk makes passes at the hood. | a hood of black tears drawn over its eyes and antlers. When it's struck off, the Great Hunt sees the sky and slows |

### I-5: The Hooding
| Choice | Immediate | Later |
|---|---|---|
| **Hood the Mews** (with the Mews elders and the Hooded Man) | the cliffs go quiet and no more birds fall; Wren trust −1 | Act II: hooded Mews birds won't fly for you on the Stormcliffs; Act III: harder to spare Teodor ("you chose the hood once") |
| **Lend the hawks to the Lodge** (with the Great Lodge) | the best birds go to Antlerford, and the Mews is half empty | Act II: Lodge-flown hawks join you against the Stormcrow, and the Huntsman bearer owes you; Act III: a Lodge hawk brings Wren's last request |
| **[INSIGHT] Fly them free** (needs `insight.hawks_see_tears`) | every bird on the cliffs flies free and steers round the tears itself; Teodor watches and doesn't understand | Act III: the hero's hawk can unhood the Chimera's eyes (an extra phase-skip), and sparing Teodor is easier |

## Act II: the class thread (Concordia)
| # | Quest | Beat |
|---|---|---|
| C-1 | `the-cormorant-boats`, **The Cormorant Boats** | At Abbeyshore, a few Hawkmoor exiles fish the Wend with cormorants from under Tamsin Reed's ferry. They have never hooded a bird. They tell the hero the White Stag weeps in the Gloamwood, and no bird will fly over it. |
| C-2 | `the-silent-canopy`, **The Silent Canopy** | Fly the hawk over the Gloamwood and follow the silence: where no bird sings, the Stag has wept. |
| C-3 | `the-white-stag`, **The White Stag** | **Boss 5: Sentinel A.** Release: the Stag asks the Falconer to let it go. It isn't afraid any more. Sets `story.sentinel.hunt`. |
| C-4 | `the-hooded-crow`, **The Hooded Crow** | Teodor is on the Stormcliffs, hooding the Stormcrow so it will stop screaming the news of a Turning that never came. The Hollow King's smiths are fitting him to the Chimera as its eyes. |
| C-5 | `the-stormcrow`, **The Stormcrow** | **Boss 6: Sentinel B**, half hooded and screaming through it. Beating it lets the Sparkwright bearer claim the Storm mark (+1 bearers). |
| C-6 | `wrens-letter`, **Wren's Letter** | Wren's letter arrives tied to Pibb's leg (or, if the hero has Pibb, to a moor pigeon who is extremely proud of himself). Then the Stone Court: the Falconer and the Huntsman bearer. The hawk and the Huntsman's hound do not get on. |

**Featured bearers:** **The Stag's Saga**, with the Skald bearer in the Gloamwood, who wants to drum the White Stag's grief into a saga before it is lost; the Falconer flies to find the missing verses. And **Spark and Feather**, with the Sparkwright bearer at Cliffstair, who has built a cage-machine to catch the Stormcrow. Can it be held without one? Each gives +1 `story.bearers_gathered`.

## Act III: class quests
- **III-4 The Eyes of the Chimera** (boss 7): Teodor is bound into the Union Chimera as its eyes, hooded in tears, seeing for it. **Spare** him: take the hood off and let him be frightened (needs the I-5 INSIGHT, Odile's knot, or Wren Trusted). Or **destroy** him. Sets `falconer.nemesis_fate`.
- **Wren's Last Flight** (mentor's last request): fly Pibb, or a Mews hawk, over the Citadel so Wren can see Concordia once through its eyes. If `falconer.wren_devotable` is set, Wren goes to Devoted (5).
- **The Hooded Steadings**: the hooded people of the Windscour Plain walked into the Heart years ago. Unhood them in the Legion camp, one by one, and stay with each while they're frightened.
- **Fledglings Grown**: an Act I loose end. The Featherfall fledglings, grown now, have found the hero in the Heart. They won't be hooded, and they won't leave.

## Class beats in shared quests
- **II-1:** birds roost on the Hunt arch and on no other. The Falconer's hawk lands on it and won't come off.
- **II-2:** [Hunt] Falconer: "Send the hawk up. Count them from above." Maren trust +1; she has never seen it done.
- **II-3:** [Hunt] "Let the hawk look." It sees the drowned choir under the lake as a colour, moving towards the Bell. Aldous trust +1.
- **II-6:** Teodor strikes at the Eve, stealing the **Huntsman bearer's** Lodge half.
- **III-6:** Falconer line to the King: "You hooded the whole world so you wouldn't have to hear it. It's still singing under there."

## Endings
| Ending | Realm | Mentor | Nemesis spared / destroyed |
|---|---|---|---|
| Turning | On Turning Day the Mews flies every bird unhooded, and the sky over the Hawkmoor goes dark with wings | Wren watches it through Pibb | Teodor flies a hawk again, badly and frightened / his hood is burned on the Moor's Crown |
| Unmaking | The Mews keeps fewer birds and lets the rest go | Wren gives Pibb his freedom; he stays anyway | Teodor lives at the Mews unhooded and jumps at everything / a new stone stands in the ring on the Moor's Crown |
| Hollow Crown | Every bird in the Greywilds is hooded to the crown, and very quiet | Wren flies Pibb away from you | Teodor hoods for you / his hood lies on the arm of your throne |
| First Chord | The birds of the Hawkmoor fly the first Turning road through Concordia, unhooded, and the moor rings with them | Wren (Devoted) can't see it, and says hearing it is better | Teodor leads the flight / his hood is the first thing the new bell rings away |

## Landmarks and set pieces (for Claude 2)
- `landmark:mews-cliff-perches` (zone 1, I-1)
- `landmark:wren-ledge` (zone 1, mentor house)
- `landmark:mews-chapel-roof` (zone 1)
- `landmark:jess-maker-hut` (zone 1)
- `obj:wren-first-hood` (zone 1, mentor thread)
- `landmark:bear-cave-mouth` (zone 2, lair 1 entrance)
- `landmark:coyle-steading` (zone 2)
- `landmark:quiet-steading` (zone 3)
- `landmark:feather-counter-cairn` (zone 4)
- `landmark:hollow-eyrie-cliff` (zone 4, lair 2 entrance)
- `obj:hunt-frontier-halfstone` (lair 3)
- the shared `obj:hunt-gate-seal`, Hawkmoor-side approach
