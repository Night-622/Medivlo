# Storm: Thunderreach (Sparkwright and Stormlancer)

Realm: [02-realms.md § Thunderreach](../02-realms.md). Gate boss: **Skyrender** at the Copper Gate. Morvane Sentinel A: **the Stormcrow**.

---

# SPARKWRIGHT: *Can you control what you love?*
| | |
|---|---|
| Start | `area:storm-capital`, Spirehold |
| Mentor | **Guildmother Tess Ampery** (`npc:tess-ampery`, trust starts at 3: she declares everyone family on sight) |
| Nemesis | **Chancellor Volta Sterne** (`npc:volta-sterne`), head of the Coil Guild. Act III Herald |
| Half-stone | the Tower half, in the crown of the Lightning Tower (lair 3) |
| Sentinels | A the Stormcrow, B the Gilded Engine |

Tess loves her machines and lets them be ridiculous. Volta loves Spirehold and wants it safe forever. Both are Sparkwrights to the bone, and the campaign asks which kind of love a storm will stay for.

## Act I: Spirehold (22 quests)
### Main
| # | Quest (`quest:sparkwright-…`) | Where | Beat | Flags |
|---|---|---|---|---|
| I-1 | `every-workshop-at-once`, **Every Workshop at Once** | zone 1 | Night on Coil Street, where the workshops explode on the hour, politely, one at a time. The Drowned Bell rings and every one of them goes off at once. The hero wakes in the rubble with the Tower half's song in their chest and no eyebrows. Tess pulls them out and says, beaming, "Welcome to the family." Tutorial: move, cast and talk. | `sparkwright.bell_heard` |
| I-2 | `rod-duty`, **Rod Duty** | zone 1 | Tess sends the hero to reset the five lightning rods that feed Coil Street's workshops. The storm comes down them black now, and the Static Wisps that ride the strikes come out hollow and biting. Up on the rods you can see the storm over the Copper Gate, which has not moved in a year. | |
| I-3 | `the-witchs-belfry`, **The Witch's Belfry** | zone 2 to lair 1 | Every night a bell rings in an old belfry among the Copper Spires, and the storm comes down on whichever tower is tallest. A Tempest Coven witch is calling it. **Boss 1: the Tempest Witch.** | `sparkwright.belfry_quiet` |
| I-4 | `the-chancellors-tour`, **The Chancellor's Tour** | zone 3 | Chancellor Volta Sterne, impeccably buttoned and without a single burn mark, gives the hero a private tour of the Dynamo Halls. She is brilliant, funny in a dry way, and genuinely proud of every wheel. She wants the bearer for Tower Fifteen, the tower that will not fall. | `sparkwright.volta_met` |
| I-5 | `tower-fifteen`, **Tower Fifteen** | zone 2 | Tower Fifteen needs a coil, and the Guild votes to fill it with Spirehold's Static Wisps, the little living sparks that light the streets and that every child keeps one of. **Faction choice** (see below). | `sparkwright.wisps` |
| I-6 | `the-grand-patent-vault`, **The Grand Patent Vault** | zone 3 to lair 2 | Whatever was chosen, Tower Fifteen needs a heart. Volta sends the hero into the Grand Patent Vault for the plans of the Perpetual Engine, and the Mk. XII, which has refused to stop for forty years, refuses to be fetched. **Boss 2: the Perpetual Engine Mk. XII.** | `sparkwright.patent_sheet` |
| I-7 | `patent-pending`, **Patent Pending** | zone 4 | The sheet jammed in the Mk. XII's gears is Volta's own application: the Perpetual Tower. The Tower half caged in a coil-engine at the Lightning Tower's crown, fed by Skyrender's storm, pinned over the Copper Gate for ever. The storm would never end; it would only be used. In the margin, in her neat hand, she has drawn a crown with a lightning bolt for every jewel. INSIGHT options let the hero see it early: Volta's anchor-rods in the Tower Foundations are what hold the storm still. | `insight.anchored_storm` |
| I-8 | `the-tower-crown`, **The Tower Crown** | lair 3 | Up the Lightning Tower to its crown, where Volta has built her cage around the half-stone and is waiting for the bearer to set it. **Boss 3: Volta (nemesis I).** The hero lifts the Tower half; Volta clips her harness to a lightning-line and rides it, crackling, all the way down to the Copper Gate. | `sparkwright.halfstone` |
| I-9 | `the-copper-road`, **The Copper Road** | gate road | Tess's farewell, with a trust check. At Friendly she gives her goggles ("for the eyebrows you've got left"); at Trusted she gives Kettle Twenty, a small walking kettle that whistles when danger is near, as a pet. | `sparkwright.tess_farewell` |
| I-10 | `the-copper-gate`, **The Copper Gate** | `area:storm-gate` | **Boss 4: Skyrender.** The hero opens the gate with the Tower half and steps through. | `story.gate_open`, `story.act = 2` |

### Side quests (8)
| Zone | Quest | Beat |
|---|---|---|
| 1 Coil Street | **The Quiet Workshop** | Pim Joule's workshop hasn't exploded in nine days, and the whole street is worried. He has finally invented something that works, a toaster, and he's too frightened to tell anyone in case it's boring. |
| 1 Coil Street | **Patent Rejected** | Help the Patent Office clerk, Mortimer Sneddon, deliver thirty years of rejection letters. One is to Juniper Gauss, aged nine, for "a tower that hums instead of catches". It's right. Epilogue slide. |
| 2 Copper Spires | **Tower Seven Leans** | Old Bert and Ada Henry live at the top of Tower Seven, which leans a little further every day. They refuse to leave. Rig a counterweight from the fallen towers' scrap before teatime. |
| 2 Copper Spires | **The Spire-Jumpers** | Wilf Farraday's apprentices leap between the leaning towers on glide-cloaks for fun. Race them. They want to go first; the hero just wants to land. |
| 3 Dynamo Halls | **Wheel Three** | Marjorie Watt has run the Number Three wheel for thirty years to keep the orphanage warm. The haywire Coil Sentries have decided to "replace" her. Help her finish her shift. |
| 3 Dynamo Halls | **Sentry Sixty-One** | A haywire Coil Sentry has decided it is a pigeon. Win its trust with breadcrumbs and keep it from being scrapped. It turns up at Gildport in Act II, still a pigeon. |
| 4 Tower Foundations | **The Root-Tuner** | Ma Ohmsworth tunes the Lightning Tower's copper roots like harp strings, and Volta has told her to stop. Help her tune the last six. The roots hum a note the hero's half-stone knows. A clue for the I-5 INSIGHT. |
| 4 Tower Foundations | **The Wisp Nursery** | The Static Wisps breed in the foundations, and the hollow ones are eating the young sparks. Clear the nest; one baby wisp follows the hero to the gate as a lamp. |

### Mentor thread (2) and bounties (2)
- **The Nineteenth Kettle** (needs Friendly): why Tess holds nineteen patents for the same kettle. The first one, made by her grandmother, whistled at exactly the Storm Stone's pitch. Find its patent in the Vault annexe. It proves the Lightning Tower never caught storms: it **hummed** to them, and they came to it. Sets `insight.tower_hum` (opens the I-5 INSIGHT option if it's done first).
- **Tess's Eyebrows** (needs Trusted): on the night of C. 1012 Tess was in the Tower Crown, and she tried to catch the Storm Stone as it fled. She lost her eyebrows and has never grown them back, on principle. Find the scorch where the stone struck the Foundations, and the notebook she dropped there, open at a drawing of a stone she couldn't hold. Sets `sparkwright.tess_devotable`.
- **Bounty: the Belfry Thunderbirds**. **Bounty: the Haywire Sentries** (a gang of Coil Sentries in the Dynamo Halls).

### Bosses
| Boss | Fight | Black tears |
|---|---|---|
| **The Tempest Witch** (lair 1) | She rings the belfry bell to call strikes down on the tallest point in the arena; the hero raises and drops lightning rods so the strikes land on her instead | her bell rings black, and every strike it calls comes down hollow (a stun that drains Ember) |
| **The Perpetual Engine Mk. XII** (lair 2) | A machine that can't be destroyed, only stopped. Jam its gears in the right order; every phase it upgrades itself (Mk. XII.1, Mk. XII.2) and announces it | its oil runs black; it has been running so long that it's grieving for the inventor who never came back to switch it off |
| **Chancellor Volta Sterne** (lair 3) | She reroutes lightning between pylons from her coil-harness; the hero rewires the pylons to turn her own lines back at her, and the half-stone's song shorts her harness between phases | her sparks are black and leave scorch-tears on the floor; first sign of the Herald |
| **Skyrender** (the gate) | For the Sparkwright it's a "cutting loose" fight: shoot out Volta's four anchor-rods to free the bird between phases, and ground its hollow lightning through the Tower half | its feathers shed black rain; when beaten the tears leave it, it beats its wings once, and the storm over the Copper Gate finally moves on |

### I-5: Tower Fifteen
| Choice | Immediate | Later |
|---|---|---|
| **Cage the wisps** (with the Guild) | Tower Fifteen rises and stands for a whole night; the street-lamps go out and the children cry; Tess trust −1 | Act II: Gildport's Sparkwrights admire the hero; Act III: the caged wisps light the Herald's machine, and sparing Volta is harder |
| **Free the wisps** (with Tess) | the wisps fly up into the storm; Tower Fifteen falls, the fifteenth to fall; the Tempest Coven cheers from the rooftops | Act II: a wisp swarm follows the hero to the Stormcliffs and lights the way up (C-2) |
| **[INSIGHT] Let them choose** (needs `insight.tower_hum`) | the hero opens the cages and plays the kettle's note; the wisps that want to stay, stay. Half the city keeps its lights, and Tower Fifteen hums, half-built; Volta hears the note and goes white | Act III: the Herald's machine can't bear the kettle note (an extra phase-skip, and a way to spare her) |

## Act II: the class thread (Concordia)
| # | Quest | Beat |
|---|---|---|
| C-1 | `cliffstair`, **Cliffstair** | The Storm diaspora at the Stormcliffs. Their Storm Spire is a thirty-year-old kit-build that has never been switched on, because the instructions came in eleven parts and part six is missing. The Stormcrow screams overhead. |
| C-2 | `the-news-that-never-came`, **The News That Never Came** | The Stormcrow screams the news of a Turning that never came, and nobody at Cliffstair has climbed to its nest in thirty years. The Sparkwright builds a lightning-ladder up the cliffs. |
| C-3 | `the-stormcrow`, **The Stormcrow** | **Boss 5: Sentinel A.** Release: the storm-bird carried the Turning news across the ring, and asks the Sparkwright what the news is. The hero tells it: the Bell has rung. Sets `story.sentinel.storm`. |
| C-4 | `the-machine-age`, **The Machine Age** | Volta is in Gildport, restarting the old Sparkwright Works of the buried Gilded city with the Hollow King's tears for fuel. She has promised the Gilded Engine a new crown to forge, with a seat in it for her. Sentry Sixty-One is here, and it has seen her. |
| C-5 | `the-gilded-engine`, **The Gilded Engine** | **Boss 6: Sentinel B**, in the Gilded Ruins. Freeing the Engine lets the Juggernaut bearer claim the Iron mark (+1 bearers). |
| C-6 | `stop-proud-of-you-stop`, **Telegram** | A copper wire runs out of the Storm arch into the grass, and one night it starts to clack. Tess has strung a telegraph through the Copper Gate: "STOP. PROUD OF YOU. STOP. KETTLE FINE. STOP." Then the Stone Court: the Sparkwright and the Stormlancer bearer. |

**Featured bearers:** **Spark and Ember**, with the Arcanist bearer at Gildport (the Sparkwright's tower-machine needs a fire-mage, and the Arcanist's furnace needs a spark), and **The Long Way Up**, with the Monk bearer at Cliffstair, who insists on climbing the Stormcliffs with no machines at all (race them, or carry their tea). Each gives +1 `story.bearers_gathered`.

## Act III: class quests
- **III-4 The Copper Herald** (boss 7): Volta remade as the Herald, in a robe of copper wire with a crown of coils, ringing a bell that is a dynamo and never stops turning. **Spare** her by making her let go of the switch: play the kettle note (needs the I-5 choice) or bring Tess's notebook (needs Tess Trusted). Or **destroy** her. Sets `sparkwright.nemesis_fate`.
- **Tess's Last Patent** (mentor's last request): Tess sends her last design through the wire: "a crown that hums instead of holds". Carry it to the Citadel and have it witnessed by the crown itself. If `sparkwright.tess_devotable` is set, Tess goes to Devoted (5).
- **The Chancellor's Engineers**: Volta's loyal Guild engineers followed her into the Heart and stand hollowed in the Legion camp, still taking measurements of nothing. Bring them back.
- **Sixty-One Flies Home**: an Act I loose end. Sentry Sixty-One has decided it is a homing pigeon, and it homes on the crown. Chase it across the Twelve Stairs before it reaches the throne first (comic relief before the end).

## Class beats in shared quests
- **II-1:** the Storm arch crackles with trapped static. A copper wire trails out of it into the grass (Tess's: see C-6).
- **II-2:** [Storm] "Flash the waystone: wolves hate a sudden light." Sela trust +1, and the pack breaks.
- **II-3:** [Storm] "Measure the Bell's pitch." The Drowned Bell, ringing faintly under the lake, sounds all twelve stones' notes and one more that the hero's instruments can't name. Sets `insight.thirteenth_pitch`, which supports `insight.who_rang`.
- **II-6:** Volta strikes at the Eve, stealing the **Stormlancer bearer's** Eye half.
- **III-6:** Sparkwright line to the King: "You couldn't make it sing, so you took it apart to see why."

## Endings
| Ending | Realm | Mentor | Nemesis spared / destroyed |
|---|---|---|---|
| Turning | The Lightning Tower hums again and the storms come to it like cats to a hearth. Spirehold stops building towers. | Tess is made Chancellor and immediately patents the job | Volta tunes the copper roots with Ma Ohmsworth / her harness is kept in the Patent Vault, labelled DO NOT |
| Unmaking | The Lightning Tower stands silent. Spirehold learns to live with the weather, and invents roofs. | Tess files her twentieth patent: the umbrella (it is also a kettle) | Volta runs one small, honest dynamo / Tower Sixteen is named after her, and falls down |
| Hollow Crown | The hero wires the crown into the Lightning Tower. Thunderreach's storm is owned now, metered, and sold. | Tess shuts her workshop and leaves Spirehold with Kettle Twenty | Volta runs the machine age for the crown / her patents are filed under the hero's name |
| First Chord | Juniper Gauss builds the tower that hums, and one night in twelve the storms rest over Spirehold. | Tess (Devoted) gives the kettle the first note of the new Turning | Volta throws the switch, and lets go / Tess files Volta's patents under both their names |

## Landmarks and set pieces (for Claude 2)
- `landmark:tess-ampery-workshop` (zone 1, mentor house)
- `obj:coil-rod-1..5` (zone 1, I-2)
- `landmark:patent-office` (zone 1)
- `landmark:witchs-belfry-door` (zone 2, lair 1 entrance)
- `landmark:tower-seven` (zone 2)
- `landmark:tower-fifteen` and `obj:wisp-cage` (zone 2, I-5)
- `landmark:dynamo-wheel-three` and `landmark:chancellery` (zone 3)
- `landmark:root-tuning-chamber` and `obj:volta-anchor-rod-1..4` (zone 4; the rods return at the gate)
- `obj:storm-stone-scorch` (zone 4, mentor thread)
- `obj:storm-capital-halfstone` (lair 3)
- `obj:storm-gate-seal` (gate)

---

# STORMLANCER: *Is it brave to go first?*
| | |
|---|---|
| Start | `area:storm-frontier`, the Thunderclap Heights |
| Mentor | **Lancemaster Odran Gale** (`npc:odran-gale`, trust starts at 2: he gives everyone time) |
| Nemesis | **Cass Vantor** (`npc:cass-vantor`), the hero's lance-rival, who rode into Skyrender's storm a month ago. Act III Herald |
| Half-stone | the Eye half, at the Eye of the Storm (lair 3) |
| Sentinels | A the Stormcrow, B the Rimeheart Colossus |

The Lance Clans honour whoever rides first. Cass always did. A month before the game begins she rode into Skyrender's storm alone, and her ram **Thistle** came home without her.

## Act I: the Thunderclap Heights (22 quests)
### Main
| # | Quest (`quest:stormlancer-…`) | Where | Beat | Flags |
|---|---|---|---|---|
| I-1 | `the-bell-in-the-chimes`, **The Bell in the Chimes** | zone 1 | Night on the Ram Pastures. The Drowned Bell rings, every wind-chime on the Heights rings with it, and the Storm Rams stampede. The hero catches a ram bareback and turns the herd (tutorial: ride, lance and talk). The half-stone's song wakes. Odran arrives last, slowly, on foot: "Thought I'd let you go first." | `stormlancer.bell_heard` |
| I-2 | `reading-the-sky`, **Reading the Sky** | zone 2 | Odran sends the hero onto the open Heights to read the lightning, which strikes in patterns a lancer learns as a child. The patterns have changed. The strikes come down black, and they fall where the herds graze. | |
| I-3 | `the-ram-kings-crag`, **The Ram King's Crag** | zone 1 to lair 1 | The herd-king has gone hollow, and every night he leads more rams off the crag into the storm. The clan wants him killed; he's still fighting for his herd, just the wrong way. **Boss 1: the Storm Ram.** | `stormlancer.herd_saved` |
| I-4 | `catch-her`, **Catch Her** | zone 2 | A streak crosses the Heights faster than any ram: Cass, on foot, laughing, alive, and hollow. The hero can't catch her. She stops only when they challenge her to the Thunderclap Run, the clans' oldest race, and she wins it by a mile. "Come with me. We can outrun all of it." | `stormlancer.cass_back` |
| I-5 | `the-great-charge`, **The Great Charge** | zone 1 | By old clan law, when a storm won't pass the clans charge it. The young lancers want to charge Skyrender's storm with Cass at their head. **Faction choice** (see below). | `stormlancer.charge` |
| I-6 | `old-clatterwing`, **Old Clatterwing** | zone 3 to lair 2 | Whatever was chosen, the clans end up under the Thunderbird Aerie, where the matriarch has gone hollow and is dropping her own fledglings into Skyfall Gorge. **Boss 2: Old Clatterwing.** | |
| I-7 | `faster-than-grief`, **Faster Than Grief** | zone 4 | On the Eyrie Steps Cass tells the hero what she wants. The Eye of the Storm is the only still place in Thunderreach, and the Eye half lies there. With it she would carry the eye inside her and outrun the tears for good. But she can't get in: the Eye only opens to someone who can stop, and she can't stop. She left Thistle in the storm and didn't look back. "If you stop, it catches you." INSIGHT options let the hero see it early: she still wears Thistle's bridle at her belt and has never once asked after her. | `insight.cass_bridle` |
| I-8 | `the-eye-of-the-storm`, **The Eye of the Storm** | lair 3 | The hero rides into the storm and stops in its silent centre, and Cass follows them in. **Boss 3: Cass (nemesis I).** The hero takes the Eye half. Cass runs before they can turn, out of the Eye and away towards the Copper Gate. | `stormlancer.halfstone` |
| I-9 | `the-long-ride-down`, **The Long Ride Down** | gate road | Odran rides down to the gate with the hero, which takes a while. His farewell, with a trust check. At Friendly he gives his old lance-pennant; at Trusted he gives his ram, **Old Biddy**, who has thrown him more times than anyone alive, as a mount. | `stormlancer.odran_farewell` |
| I-10 | `the-copper-gate`, **The Copper Gate (Heights side)** | `area:storm-gate` | **Boss 4: Skyrender**, met in the air over the cliffs. When it falls the tears leave it, and it carries the hero the last mile to the gate on its back. Then open the gate. | `story.gate_open`, `story.act = 2` |

### Side quests (8)
| Zone | Quest | Beat |
|---|---|---|
| 1 Ram Pastures | **Thistle Won't Eat** | Cass's ram has stood in her stall since she came home alone and won't eat. Bring her Cass's old saddle-blanket. She eats, a bit. Thistle returns in Act III. |
| 1 Ram Pastures | **The Chime-Maker** | Wendeline Chyme's wind-chimes tell the clans which way a storm is coming, and since the Bell every one of them rings the same note. Retune them with the hero's own lance-butt. |
| 2 the Thunderclap Heights | **Learn the Pattern** | Strike-Reader Osric Quell runs the clans' oldest trial: cross the open Heights in a lightning storm by stepping where it won't strike. He insists it's perfectly safe and has a scorch on every boot. |
| 2 the Thunderclap Heights | **The Coward's Cairn** | Lancers who turned back from a charge have their names stacked on a cairn of shame, across the plain from the Brave Stone where the first riders are carved. The oldest name on the cairn is Odran's. Ask him why. Codex; it changes his lines at I-9. |
| 3 Skyfall Gorge | **The Fallen Fledgling** | A Thunderbird fledgling has fallen into the gorge, not hollow, only small. Feed it static and keep it warm. In Act II it nests at the Stormcliffs and carries the hero part of the way up (C-2). |
| 3 Skyfall Gorge | **The Rockfall Wager** | Rory Gust's young lancers dare each other to ride under the gorge's falling rocks, and the first one through wins. Ride it, or talk them out of it. Either way, someone has to go second. |
| 4 the Eyrie Steps | **The Stair-Counter** | Old Tally Rowe has counted the Eyrie Steps every morning for forty years. Since the Bell there is one more step than there used to be, and it's warm. Codex. |
| 4 the Eyrie Steps | **Feathers for the Pennant** | Nessa Plume, the clans' pennant-maker, needs untainted Thunderbird feathers from the nests. She sews them into Odran's pennant, if he gives it at I-9. |

### Mentor thread (2) and bounties (2)
- **Why Odran Falls Off** (needs Friendly): Odran demonstrates, several times. He falls off on purpose: it's the oldest lancers' trick, from before the clans charged storms. They didn't charge them; they rode **in the storm's wake**, behind it, as it went home to its eye. Sets `insight.ride_the_wake` (opens the I-5 INSIGHT option if it's done first).
- **Maudie's Lance** (needs Trusted): the lancer Odran turned back for, and whose name is why his is on the Cairn, was Maudie, who became his wife. She lived thirty more years and died last winter. Carry her lance up the Eyrie Steps and plant it where she always said she wanted to watch the storm from. Sets `stormlancer.odran_devotable`.
- **Bounty: the Pasture Wisps** (Static Wisps spooking the herds). **Bounty: the Gorge Thunderbirds**.

### Bosses
| Boss | Fight | Black tears |
|---|---|---|
| **The Storm Ram** (lair 1) | A mounted joust on the crag. Lightning gathers in his horns before each charge; meet it lance-first, and drive the herd behind him back from the edge between passes | his horns drip black lightning, and every ram that follows him through it goes hollow |
| **Old Clatterwing** (lair 2) | A diving Thunderbird matriarch who drops boulders and fledglings into the arena; catch the fledglings to make her dive low enough to hit | her feathers moult black; she's dropping her fledglings because the tears tell her they're already lost |
| **Cass Vantor** (lair 3) | Too fast to chase. She dashes across the silent Eye in lightning lines; the hero wins by stopping, bracing the lance and letting her come | the tears streak behind her like a lightning trail and never land; first sign of the Herald |
| **Skyrender** (the gate) | From the Heights side it's an aerial joust: charge along the cliff-tops on ramback and strike when it dives, then leap from the cliff onto its back for the last phase | its wings beat black weather; when beaten the tears leave it, and it bows its head to the lance |

### I-5: The Great Charge
| Choice | Immediate | Later |
|---|---|---|
| **Charge** (with the young lancers) | the clans charge the storm's edge; three lancers come back hollow and fast, like Cass; Odran trust −1 | Act II: Cliffstair's lancers revere the hero; Act III: harder to spare Cass ("she was right; you went too") |
| **Bring the herds down** (with Odran) | the clans shelter in Skyfall Gorge and leave the Heights to the storm; the young lancers call the hero slow | Act II: Cliffstair's herders lend the hero their one Storm Ram to ride up the cliffs (C-2) |
| **[INSIGHT] Ride the wake** (needs `insight.ride_the_wake`) | the clans ride behind the storm instead of into it, and lose nobody; Cass laughs at them, and for a moment looks like she wants to come | Act III: the hero can ride behind the Herald and catch her, which opens the gentlest way to spare her |

## Act II: the class thread (Concordia)
| # | Quest | Beat |
|---|---|---|
| C-1 | `cliffstair`, **The Lancers of Cliffstair** | Morvane's Storm diaspora trains Stormlancers in the Wind Yard, but there are no Storm Rams in Concordia, so they ride goats. They're very good at it. The Stormcrow screams above them. |
| C-2 | `the-cliff-charge`, **The Cliff Charge** | The Wind Yard dares the hero to ride up the Stormcliffs first. The fledgling from Skyfall Gorge helps if it was raised. |
| C-3 | `the-stormcrow`, **The Stormcrow** | **Boss 5: Sentinel A.** Release: the storm-bird was always first with the news, and it asks the Stormlancer if being first ever did it any good. Sets `story.sentinel.storm`. |
| C-4 | `the-race-on-the-pass`, **The Race on the Pass** | Cass runs Frostmere Pass at night, racing the avalanches the Rimeheart Colossus brings down, with hollow racers behind her. The Colossus is the one thing in Morvane she can't get past, because it holds the pass shut. |
| C-5 | `rimeheart-colossus`, **The Rimeheart Colossus** | **Boss 6: Sentinel B**, at Frostmere Pass. Freeing it lets the Warden bearer claim the Rime mark (+1 bearers). Cass is through the pass before the snow settles. |
| C-6 | `old-biddy-brings-word`, **Old Biddy Brings Word** | A Storm Ram ambles out of the Storm arch with a message from Odran tied to her horn (a clan runner brings it if Old Biddy is already with the hero). Then the Stone Court: the Stormlancer and the Sparkwright bearer. |

**Featured bearers:** **The Shield on the Pass**, with the Warden bearer at Wardenhold, who means to hold the pass against the Colossus while the Stormlancer charges it (agree who goes first), and **First Blood**, with the Swordsman bearer at Cliffstair, who has challenged the Stormcrow to a duel and won't hear of help. Each gives +1 `story.bearers_gathered`.

## Act III: class quests
- **III-4 The Swift Herald** (boss 7): Cass remade as the Herald, in a robe that streams behind her like a storm-tail, ringing a bell that always sounds a moment before she arrives. **Spare** her by riding behind her until she tires (needs the I-5 wake or Odran Trusted), so that she stops for the first time in a year and cries ordinary tears. Or **destroy** her. Sets `stormlancer.nemesis_fate`.
- **Ride Second** (mentor's last request): Odran's letter asks one thing: when the Weeping Wall parts, don't go first. Wait, and bring the last one in with you. Escort the slowest hollowed lancer up the Twelve Stairs. If `stormlancer.odran_devotable` is set, Odran goes to Devoted (5).
- **Thistle**: Thistle has walked all the way from the Heights and into the Heart behind the hero. If Cass is spared, she rides Thistle home at a walk; if not, Thistle stands at the edge of the Eye on the Storm stair and won't move.
- **The Ones Who Came Back Fast**: an Act I loose end. The lancers who came back hollow from the storm (from the Charge, or Cass's own racers) stand in the Legion camp, twitching to run. Bring them back.

## Class beats in shared quests
- **II-1:** hoofprints scorched into the turf ahead of the Storm arch: Cass came through behind the hero, and was out of sight before they turned.
- **II-2:** [Storm] "Charge them before they circle." Maren trust −1 ("Brave. Daft."). With `insight.ride_the_wake`, [Storm] "Let Maren's arrows go first, then ride behind them" instead: Maren trust +1.
- **II-4:** [Storm] "Ride after the Stag; don't catch it, just follow." It leads the hero to the glade where it first wept, on the old procession road, and the tears there are older than the road. A clue towards `insight.tears_older`.
- **II-6:** Cass strikes at the Eve, stealing the **Sparkwright bearer's** Tower half, and is gone before anyone sees her move.
- **III-6:** Stormlancer line to the King: "You went first, Casimir. Nobody followed. That isn't the same as brave."

## Endings
| Ending | Realm | Mentor | Nemesis spared / destroyed |
|---|---|---|---|
| Turning | Skyrender flies the storms home to the Lightning Tower, and the Heights have weather again instead of war. The clans give a prize at the Thunderclap Run for the last rider in. | Odran retires, and does not fall off | Cass rides Thistle at a walk / Thistle runs the Run riderless every year |
| Unmaking | The Heights keep their wild storm, and the clans learn to read it all over again | Odran teaches the young how to fall | Cass carries the clans' post, the fastest runner alive, for a reason / her name goes on the Cairn and the Brave Stone both |
| Hollow Crown | The hero rides the storm across every realm, first everywhere. The clans follow, and none of them come back the same. | Odran stays on the Heights and won't ride | Cass is the crown's outrider / nobody can catch her ghost |
| First Chord | The Lance Clans ride behind the storm at the new Turning, and the first rider waits for the last. | Odran (Devoted) rides with Maudie's lance | Cass stops, and hears the rest between the notes / Odran carves her name on the Brave Stone himself |

## Landmarks and set pieces (for Claude 2)
- `landmark:odran-gale-steading` (zone 1, mentor house)
- `landmark:chime-yard` and `landmark:thistles-stall` (zone 1)
- `obj:lightning-pattern-stones` (zone 2)
- `landmark:thunderclap-run-start` (zone 2, I-4)
- `landmark:cowards-cairn` (zone 2)
- `landmark:gorge-rockfall` and `obj:fledgling-nest` (zone 3)
- `landmark:eyrie-stair` and `obj:maudie-lance` (zone 4, mentor thread)
- `obj:storm-frontier-halfstone` (lair 3)
- the shared `obj:storm-gate-seal`, Heights-side approach
