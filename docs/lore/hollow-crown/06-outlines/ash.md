# Ash: Cinderreach (Arcanist and Reaver)

Realm: [02-realms.md § Cinderreach](../02-realms.md). Gate boss: **Pyrelord Vulkan** at the Cinder Gate. Morvane Sentinel A: **Ashmaw**.

---

# ARCANIST: *What is fire for?*
| | |
|---|---|
| Start | `area:ash-capital`, Kilnhold |
| Mentor | **Magister Coalby Thrane** (`npc:coalby-thrane`, trust starts at 2) and his Lava Slime **Pudding** |
| Nemesis | **Provost Ignace Morrow** (`npc:ignace-morrow`), Act III Herald |
| Half-stone | the Kiln half, under the Great Kiln (lair 3) |
| Sentinels | A Ashmaw, B the Gilded Engine |

## Act I: Kilnhold (22 quests)
### Main
| # | Quest (`quest:arcanist-…`) | Where | Beat | Flags |
|---|---|---|---|---|
| I-1 | `the-bell`, **The Bell in the Kiln** | zone 1 | Night. The Drowned Bell rings and every pane in the Kiln Ward cracks at once. The hero wakes with the Kiln half's song in their chest and walks, half asleep, to the Great Kiln's gate. Thrane finds them there and hides them from the Conclave's watch. Tutorial: move, cast and talk. | `arcanist.bell_heard` |
| I-2 | `a-permit-to-burn`, **A Permit to Burn** | zone 1 | Thrane forges the hero a burning permit and sends them to relight the Ward's five guttering braziers. Black tears are in the gutters, and hollow Lava Slimes come out of them. | |
| I-3 | `the-zealots-furnace`, **The Zealots' Furnace** | zone 2 to lair 1 | Glassblowers are vanishing from the Row. The Ashen Zealots are taking them to stoke a furnace that burns black. **Boss 1: the Ashen Zealot.** | `arcanist.zealot_down` |
| I-4 | `the-provosts-favour`, **The Provost's Favour** | zone 3 | Provost Ignace Morrow, brilliant, warm and the Conclave's youngest-ever provost, invites the hero to the Conclave Hall and praises their "unusual warmth". He asks for help with the Kiln's fuel crisis. | `arcanist.ignace_met` |
| I-5 | `the-last-library`, **The Last Library** | zone 3 | The Conclave votes to burn the Glass Archive to feed the Kiln. **Faction choice** (see below). | `arcanist.library` |
| I-6 | `the-ledger-flame`, **The Ledger Flame** | zone 2 to lair 2 | Whatever was chosen, the Archive goes up: the Zealots' revenge, the Conclave's fire gone wrong, or Morrow testing the stone. The burning records rise as one creature. **Boss 2: the Ledger Flame.** | `arcanist.ledger_page` |
| I-7 | `what-the-provost-burned`, **What the Provost Burned** | zone 4 | The page saved from the Ledger Flame is Morrow's fuel ledger. For a year he has fed the Kiln **black tears**. They burn hot, and the smoke carries them across Kilnhold. He wants the Kiln half set in his own chest, to become a living kiln that never goes out. INSIGHT options let the hero work this out early from the smoke's colour. | `insight.arcanist_smoke` |
| I-8 | `the-heart-of-the-kiln`, **The Heart of the Kiln** | lair 3 | Down through the Kiln Roots to the Kiln's core. **Boss 3: Morrow (nemesis I).** He fights with the Kiln itself, and the floor is the grate. The hero takes the Kiln half; Morrow escapes up the flue towards the Cinder Gate. | `arcanist.halfstone` |
| I-9 | `the-cinder-road`, **The Cinder Road** | gate road | Thrane's farewell, with a trust check. At Friendly he gives his lantern; at Trusted he gives Pudding too, as a pet. | `arcanist.thrane_farewell` |
| I-10 | `the-cinder-gate`, **The Cinder Gate** | `area:ash-gate` | **Boss 4: Pyrelord Vulkan.** The hero opens the gate with the Kiln half and steps through. | `story.gate_open`, `story.act = 2` |

### Side quests (8)
| Zone | Quest | Beat |
|---|---|---|
| 1 Kiln Ward | **Pudding Gets Out** | Thrane's slime escapes and eats the permit office's filing. Comedy chase; introduces Pudding. |
| 1 Kiln Ward | **The Sweeps' Strike** | The chimney sweeps won't climb chimneys that weep black. Settle the strike: masks from the Ashworks, or [INSIGHT] prove the tears follow the smoke. |
| 2 Glassblowers' Row | **The Unbreakable Vase** | A master glassblower's commission for the Velvet King (a Tidecourt link) keeps shattering at the Bell's note. |
| 2 Glassblowers' Row | **Apprentice Eyebrows** | The Row's apprentices hold a fire-safety contest. Pure comedy, with a pun-laden reward. |
| 3 Smoke Terraces | **The Last Star** | An old astronomer can't see the stars through the smoke. Clear the observatory lens and see the **Concord Ring**, the twelve stars that once hung over the crown. Codex. |
| 3 Smoke Terraces | **Soot Pigeons** | Deliver messages by the Conclave's soot-pigeons. One message is Morrow's, unsent. A clue for I-7. |
| 4 Kiln Roots | **The Stoker's Lament** | Old Stoker Bettany hears the Kiln "crying" at night. She is right: it is the half-stone. |
| 4 Kiln Roots | **Golem Nine** | A friendly Kiln Golem has lost its master. Find her (dead, of old age). Golem Nine walks to Kilnmouth and appears there in Act II. |

### Mentor thread (2) and bounties (2)
- **Thrane's Equation** (needs Friendly): finish his thirty-year sum. It proves the Kiln's original fuel was **the stone's song**, not wood. Sets `insight.kiln_song` (opens the I-5 INSIGHT option if it's done first).
- **Pudding's Pedigree** (needs Trusted): find Pudding's mother in the Kiln Roots. She's enormous and polite. Sets `arcanist.thrane_devotable`.
- **Bounty: the Ward Hounds** (Magma Hound pack). **Bounty: the Runaway Kiln Golem.**

### Bosses
| Boss | Fight | Black tears |
|---|---|---|
| **The Ashen Zealot** (lair 1) | A preacher with a burning scythe who sets parts of the arena alight in rings | his fire burns black; black flame hollows instead of burning (a DoT that drains Ember) |
| **The Ledger Flame** (lair 2) | A paper fire-spirit. Pages fly as projectiles. Phase 2 reads the hero's future aloud as attack telegraphs. | the burned ink runs black and pools |
| **Provost Morrow** (lair 3) | He channels the Kiln: grate vents erupt in patterns, and he heals from the fire unless the hero douses vents with the half-stone's song | his eyes weep black when he's hurt; first sign of the Herald |
| **Pyrelord Vulkan** (the gate) | A great fire-beast coiled round the gate. For the Arcanist it's a "putting out" fight: sing the half-stone between phases to douse the hollow fire in its mane | its mane burns black; when beaten the tears leave it, and it lies down to sleep across the gate |

### I-5: The Last Library
| Choice | Immediate | Later |
|---|---|---|
| **Burn it** (with the Conclave) | the Kiln flares; Thrane trust −1 | Act II: Ysolde has no Ash records, so `insight.tears_older` needs one more clue |
| **Save the books** (with Thrane) | the Kiln gutters and Kilnhold grows cold; the Zealots grow bolder | Act II: the saved books arrive at Ysolde's archive, which makes one INSIGHT gate free |
| **[INSIGHT] Sing to it** (needs `insight.kiln_song`) | the half-stone feeds the Kiln for a night; Morrow notices | Act III: the Herald's weak point is known (an extra phase-skip) |

## Act II: the class thread (Concordia)
| # | Quest | Beat |
|---|---|---|
| C-1 | `kilnmouth`, **Kilnmouth** | The Ash diaspora at Ashfall Kiln. Its copy of the Great Kiln burns cold. Golem Nine is here if it was helped. |
| C-2 | `ashmaws-breath`, **Ashmaw's Breath** | The kilns are built round a beast that wouldn't die. Kilnmouth smiths take Ashmaw's breath for their forges. Get down to it. |
| C-3 | `ashmaw`, **Ashmaw** | **Boss 5: Sentinel A.** Release: Ashmaw lit the Turning torches, and asks whether there will be torches again. Sets `story.sentinel.ash`. |
| C-4 | `the-provosts-smoke`, **The Provost's Smoke** | Morrow is in Gildport, paying the Gilded Engine to forge a crown-setting that fits a human heart. |
| C-5 | `the-gilded-engine`, **The Gilded Engine** | **Boss 6: Sentinel B**, in the Gilded Ruins. Freeing the Engine lets the Iron bearer claim their mark (+1 bearers). |
| C-6 | `a-letter-from-thrane`, **A Letter from Thrane** | Pudding comes through the Gate Circle with a letter (or a Conclave pigeon, if the hero has no Pudding). Then the Stone Court: the Arcanist and the Reaver bearer hear their halves sing in harmony. |

**Featured bearers:** **Spark and Ember**, with the Sparkwright bearer at Gildport (their tower-machine needs a fire-mage), and **The Knight's Shame**, with the Knight bearer at the Gilded Ruins (Iron's guilt for Berenika). Each gives +1 `story.bearers_gathered`.

## Act III: class quests
- **III-4 The Herald of Ash** (boss 7): Morrow remade as the Herald, a living kiln in the Herald's robes ringing a bell of fire. **Spare** him by pouring his fire into the hero's half-stone (needs the I-5 song or Thrane Trusted), or **destroy** him. Sets `arcanist.nemesis_fate`.
- **Thrane's Lantern** (mentor's last request): carry Thrane's lantern to the Citadel and light it from the crown's cage. If `arcanist.thrane_devotable` is set, Thrane goes to Devoted (5).
- **Ignace's Apprentice**: Morrow's young apprentice is in the Legion camp, hollowed. Bring her back.
- **Pudding Comes Home**: an Act I loose end. Pudding's mother arrives at the Heart's edge (comic relief before the end).

## Class beats in shared quests
- **II-1:** the Ash arch at the Gate Circle is scorched from the inside.
- **II-2:** [Ash] "Read the scorch marks: these wolves ran through fire to get here."
- **II-3:** Corwin recognises the Arcanist's staff as his old hearth-beam (handoff lore). Corwin trust +1.
- **II-4:** [Ash] "Burn a tear." It won't burn. Sets `insight.tears_unburnable`, which supports `insight.tears_older`.
- **II-6:** Morrow is the nemesis who strikes at the Eve, stealing the **Reaver bearer's** Field half.
- **III-6:** Arcanist line to the King: "You put out the fire of the world to see if it would warm you."

## Endings
| Ending | Realm | Mentor | Nemesis spared / destroyed |
|---|---|---|---|
| Turning | The Great Kiln burns on the stone's song again. The burning permit is repealed, and the permit office survives. | Thrane is made Provost, with Pudding as deputy | stokes the Kiln, a man again / his ash is fired into the Kiln's new bell |
| Unmaking | The Kiln burns on the Ash Stone alone: smaller, stubborn, enough | Thrane writes *A Treatise on Small Fires* | exiled to the Bleeding Fields / forgotten |
| Hollow Crown | Cinderreach becomes the forge of the new crown, and its fires never go out. Nothing is ever finished. | Thrane leaves Kilnhold with Pudding | the crown's stoker / a scorch on the throne-room floor |
| First Chord | Kilnhold fires the first Bell of the new Turning, and its kiln-song has a rest in it | Thrane (Devoted) fires the bell | helps fire it / his ledger is read aloud at the firing |

## Landmarks and set pieces (for Claude 2)
- `landmark:thrane-study` (zone 1, mentor house)
- `landmark:kiln-permit-office` (zone 1)
- `obj:kiln-brazier-1..5` (zone 1, I-2)
- `landmark:glass-archive` (zone 2, lair 2 entrance)
- `landmark:conclave-hall` and `landmark:provost-tower` (zone 3)
- `landmark:kiln-observatory` (zone 3)
- `landmark:stokers-gallery` (zone 4)
- `obj:ash-capital-halfstone` (lair 3)
- `obj:ash-gate-seal` (gate)

---

# REAVER: *Can a war end?*
| | |
|---|---|
| Start | `area:ash-frontier`, the Bleeding Fields |
| Mentor | **Brenna Scald-Hand** (`npc:brenna-scald-hand`, trust starts at 3: she raised the hero in the Muster) |
| Nemesis | **Hask the Unburnt** (`npc:hask`), Brenna's son and the hero's shield-sibling. Act III Herald |
| Half-stone | the Field half, in the Old Battle-Kiln (lair 3) |
| Sentinels | A Ashmaw, B Bonelord Varric |

## Act I: the Bleeding Fields (22 quests)
### Main
| # | Quest (`quest:reaver-…`) | Where | Beat | Flags |
|---|---|---|---|---|
| I-1 | `the-bell-on-the-fields`, **The Bell on the Fields** | zone 1 | A night fight at the Red Muster's palisade against Magma Hounds. The Bell rings. By old Muster law a Turning bell means truce, and every Reaver lowers their axe. The hounds don't. The half-stone's song wakes. Hask is missing from the line. Tutorial. | `reaver.bell_heard` |
| I-2 | `count-the-fallen`, **Count the Fallen** | zone 2 | Brenna sends the hero to bring back the dead from the Fields. There are black tears in the lava, and the dead are gone: their footprints walk away. | |
| I-3 | `the-drake-roost`, **The Drake Roost** | zone 4 to lair 1 | The Cinder Drake carries off the Muster's war-banner. **Boss 1: the Cinder Drake.** | `reaver.banner` |
| I-4 | `hask-comes-home`, **Hask Comes Home** | zone 1 | Hask walks back out of the Fields at night, alive, grinning and **unburnt**: the lava won't touch him. "We can win it now, all of it, forever." | `reaver.hask_home` |
| I-5 | `the-muster-vote`, **The Muster's Vote** | zone 1 | The Muster splits. **Faction choice** (see below). | `reaver.muster` |
| I-6 | `the-brand-pits`, **The Brand-Pits** | zone 2 to lair 2 | Either to kill the Brand-Mother (war), or to treat with her (truce); she is hollowed and attacks either way. **Boss 2: the Brand-Mother.** | |
| I-7 | `the-unburnt`, **The Unburnt** | zone 3 | Hask leads hollowed Reavers, the missing dead among them, in a night raid on the Old Battle-Kiln. He wants a war that never ends, fought by soldiers who never die. | `reaver.hask_turned` |
| I-8 | `the-old-battle-kiln`, **The Old Battle-Kiln** | lair 3 | **Boss 3: Hask (nemesis I).** The hero takes the Field half. Hask falls into the lava, walks out smiling, and heads for the gate. | `reaver.halfstone` |
| I-9 | `the-last-muster`, **The Last Muster** | gate road | Brenna's farewell. At Friendly she gives her burned-arm axe-ring. With **war**, the Muster marches with you; with **truce**, it stays to keep the peace. | `reaver.brenna_farewell` |
| I-10 | `the-cinder-gate`, **The Cinder Gate (Fields side)** | `area:ash-gate` | **Boss 4: Pyrelord Vulkan**, the Muster's oldest enemy. When it falls the tears leave it: **finish it**, or **let it sleep** across the gate. Then open the gate. | `reaver.vulkan`, `story.gate_open`, `story.act = 2` |

### Side quests (8)
| Zone | Quest | Beat |
|---|---|---|
| 1 Red Muster | **A Wager of Axes** | An axe-throwing wager with the Muster's bookie, Two-Coin Jory. |
| 1 Red Muster | **The Cook's Last Ox** | The camp is starving. Find food without raiding the truce villages. |
| 2 Bleeding Fields | **Hounds at the Well** | Clear the Muster's only water well. |
| 2 Bleeding Fields | **Red Veins** | Map the lava veins. They all run towards the gate. Codex. |
| 3 Bone Ridge | **Banners of the Schools' War** | Collect the old war's banners and learn how the war ended: in the Concord. Lore. |
| 3 Bone Ridge | **A Grave for Old Cinder** | Bury a dead Reaver's war-ram properly. |
| 4 Drakeholt | **Warm Eggs** | Drake eggs that are warm and tear-free. Return them or sell them. |
| 4 Drakeholt | **The Hermit of the Holt** | An old deserter who walked away from the war. A conversation about ending wars that feeds the I-5 INSIGHT. |

### Mentor thread (2) and bounties (2)
- **Brenna's Arm** (needs Friendly): how she burned her arm. She pulled Hask out of the lava when he was seven. He didn't burn then either. Sets `insight.hask_unburnt`.
- **The Peace-Axe** (needs Trusted): find the Muster's ceremonial peace-axe, made a thousand years ago and never used. Sets `reaver.brenna_devotable`.
- **Bounty: the Bone Ridge Prowlers** (Magma Hounds). **Bounty: Slag-Belly** (a giant Lava Slime).

### Bosses
| Boss | Fight | Black tears |
|---|---|---|
| **The Cinder Drake** (lair 1) | Strafing runs across the Drakeholt cliffs; knock it down with thrown axes | it breathes black ash clouds that blind |
| **The Brand-Mother** (lair 2) | A hound matriarch; whelps spawn from the brand-pits; brand the pits shut to stop them | her brands glow black and mark the hero (a hollow-mark debuff) |
| **Hask the Unburnt** (lair 3) | He mirrors the Reaver's own axe moves; he can't be burned, so the lava arena helps him; push him into cooled stone instead | tears run from his smile, never his eyes |
| **Pyrelord Vulkan** (the gate) | From the Fields side: smash the hollow crust off its scales, then strike the exposed fire | the crust is black tears hardened like obsidian |

### I-5: The Muster's Vote
| Choice | Immediate | Later |
|---|---|---|
| **War** (march with Brenna) | the Muster marches to the Brand-Pits | Act II: Muster veterans fight beside you at Ashmaw; Act III: harder to spare Hask |
| **Truce** (keep the Bell's law) | the war on the Fields stops for the first time in thirty years | Act II: the Kilnmouth deserters trust you; the I-10 "let it sleep" option is guaranteed |
| **[INSIGHT] "Hask isn't burning"** (needs `insight.hask_unburnt` or noticing at I-4) | you reveal his hollowing to the Muster; Brenna is shaken (trust −1, then +2 at I-9) | Act III: Brenna comes into the Heart herself, and sparing Hask is easier |

## Act II: the class thread
| # | Quest | Beat |
|---|---|---|
| C-1 | `kilnmouth`, **The Deserters of Kilnmouth** | Kilnmouth's Reavers are deserters from the old war. They lower their eyes at your axe. |
| C-2 | `ashmaws-breath`, **Ashmaw's Breath** | As for the Arcanist, with Reaver lines: the beast "would not die", like the war. |
| C-3 | `ashmaw`, **Ashmaw** | **Boss 5.** Release scene, then `story.sentinel.ash`. |
| C-4 | `the-muster-of-the-dead`, **The Muster of the Dead** | Hask has found Bonelord Varric's barrow. The empty graves of Brindlecross are walking to a muster under Aldermoor. |
| C-5 | `bonelord-varric`, **Bonelord Varric** | **Boss 6:** Varric, the duellist who ended the Schools' War in single combat, now raising the dead for a war without end. Beating him lets the Blade bearer claim their mark (+1). Ties in with Old Hobb's *Empty Graves*. |
| C-6 | `brennas-runner`, **Brenna's Runner** | A Muster runner comes through the Gate Circle with Brenna's message. At the Stone Court, the Reaver and the Arcanist bearer. |

**Featured bearers:** **Duel at the Barrow**, with the Swordsman or Samurai bearer, who wants to duel Varric alone (help, or stop them), and **The Brawler's Bout**, with the Brawler bearer in Kilnmouth's pits (both are hunting Ashmaw). +1 each.

## Act III: class quests
- **III-4 The Unburnt Herald** (boss 7): Hask as the Herald, ringing a bell of slag. **Spare** him: Brenna's peace-axe (or the I-5 reveal) breaks the hollow. He burns at last, screams, and lives. Or **destroy** him. Sets `reaver.nemesis_fate`.
- **Bring Him Home** (mentor's last request): Brenna asks for Hask, alive or dead. Done with `reaver.brenna_devotable` set, it sets Brenna to Devoted.
- **The Hollow Muster**: free the hollowed Reavers (the walking dead of I-2) in the Legion camp.
- **The Peace-Axe's Edge**: plant the peace-axe in the Heart, where no war has ever been won.

## Class beats in shared quests
- **II-2:** [Ash] Reaver: "Stand in the light. Let them come to the axe." Maren trust −1, or +1 if done with the Truce flag ("you've stopped wars before").
- **II-3:** Aldous explains that the Muster's Bell law came from the Concord: every school had one.
- **II-6:** Hask strikes at the Eve, stealing the **Arcanist bearer's** Kiln half.
- **III-6:** Reaver line: "You started a war with grief, and grief doesn't tire."

## Endings
| Ending | Realm | Mentor | Nemesis spared / destroyed |
|---|---|---|---|
| Turning | The Muster lays down its axes at the Cinder Gate, and the Bleeding Fields cool for the first time | Brenna plants the peace-axe on the Bone Ridge | Hask tends the cooling Fields, burned and alive / his axe stands beside the peace-axe |
| Unmaking | The Fields still bleed; the Reavers fight on, for the realm and not for the war | Brenna retires to the Drakeholt with the Hermit | Hask wanders the Fields / a cairn on the Ridge |
| Hollow Crown | The hero sends the Muster to keep peace in every realm, by the axe: a war that never ends, in the name of peace | Brenna refuses to march | Hask leads the crown's Muster / nobody speaks his name |
| First Chord | The Reavers sing the first war-song with no enemy in it | Brenna (Devoted) leads the song | Hask sings, badly / Brenna sings his verse |

## Landmarks and set pieces (for Claude 2)
- `landmark:muster-palisade` and `landmark:brenna-tent` (zone 1, mentor)
- `landmark:muster-well` (zone 2)
- `landmark:bone-ridge-banners` (zone 3)
- `landmark:hermit-hut` (zone 4)
- `obj:ash-frontier-halfstone` (lair 3)
- `obj:muster-peace-axe` (zone 3, mentor thread)
- the shared `obj:ash-gate-seal`, Fields-side approach
