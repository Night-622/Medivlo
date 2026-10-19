# 04: Concordia, Morvane and Brindlecross

Concordia is the union at the centre of the ring: the old ground where all twelve notes can be heard faintly together. Its land is **Morvane**, the handoff's original map (map.js). Its capital village is **Brindlecross**, in Aldermoor. At its heart stands the **Concord Citadel**, where the Hollow King sits on his throne and weeps.

Concordia is home to all twelve schools: Morvane folk come from every realm's diaspora, and since the gates shut they have been trapped here with the tears. The fourteen Brindlecross NPCs (below) are one from each school plus extras, which is why they are so mixed.

**Every campaign reaches Concordia in Act II.** It is the shared heart of all 24 stories. Its content is written once, with **class-tagged variants** ([School] options, class-aware lines and class-thread quests). Guests in co-op see the host's version.

## Arrival: the Gate Circle
Every realm gate opens onto the same place: **the Gate Circle**, a ring of twelve stone arches on the moor above Brindlecross (region:alder). Each arch carries its school's mark. All twelve have been shut and weeping for thirty years. When a hero opens their own gate at the end of Act I, they step out of their arch into Concordia at dusk, just as the Gloamwood wolves come out of the trees.

Set pieces: `landmark:gate-circle` (12 arches, `obj:arch-<school>`; only the opened ones are lit) and `ws:gate-circle` (proposed; Claude 2 to confirm).

## The eleven regions (map.js; levels rescaled: see the end of this doc)
| Region (id) | Handoff text | Hollow Crown role | Boss |
|---|---|---|---|
| **Aldermoor** (`region:alder`) | Green moor and Brindlecross. "Home, for now." | Act II hub: Gate Circle, Brindlecross, the wolves | none |
| **Morvane Road** (`region:road`) | The old coach road east; Mags the Knife | the road between the hub and the east; bandits, the Old Coach Inn | Mags the Knife (bounty mini) |
| **Gloamwood** (`region:gloam`) | Old forest, teal and glowing; the wolves; the White Stag | the Stag's grief; the wolves' source; Hollis Lodge | **the White Stag** (Gloamwood glade), **the Weeping Willow** (Stag's Rest), **the Spinner Below** (under the roots) |
| **Briar Hollow** (`region:briar`) | Bog, bramble and slime; Nan Briar | Thornhollow and Briar Cottage | **the Ooze Sovereign** (the handoff's "Slime King" bounty grown into a sovereign) |
| **Drowned Abbey** (`region:abbey`) | A lake where the Abbey stood; the bells ring again | the Turning Bell; Brother Aldous; Abbeyshore | **Abbess Morwen** (the drowned nave) |
| **Frostmere Pass** (`region:frost`) | High, white; the Wardens hold the pass | Morvane's Rime diaspora; Wardenhold | **the Rimeheart Colossus** |
| **Ashfall Kiln** (`region:ash`) | Kilns built round a beast that would not die | Morvane's Ash diaspora; Kilnmouth | **Ashmaw** |
| **Gilded Ruins** (`region:gilded`) | A Sparkwright city buried in its own gold | Gildport; the buried city of C. 640 | **the Gilded Engine** |
| **Stormcliffs** (`region:storm`) | Sheer cliffs, thunder; the Stormcrow | Cliffstair; Stormlancer training | **the Stormcrow** |
| **Morvane Marsh** (`region:marsh`) | Lantern lights over black water | Lanternford; the drowned lights | **the Lantern Queen** |
| **Heart of Morvane** (`region:heart`) | Where the tears began; the Hollow King's throne | **Act III**; sealed until `story.heart_open` | **the Black Concord**, **the Hollow King** |

**Bonelord Varric** has no region of his own. He rules **the Barrowdowns** under Aldermoor's old graveyard: the empty graves of Old Hobb's quest lead there. Proposed instance: `inst:varric-barrow`, entered from Brindlecross graveyard.

## The Morvane bosses: the twelve Sentinels of the Turning Road
In the Concord's days, each school kept an **embassy** in Concordia and a **Sentinel of the Turning Road**: a great guardian who escorted the crown on its way to the next school. When the crown was emptied, the twelve Sentinels were the first things the black tears touched. They are hollowed now, and each guards its school's old embassy. The school's affinity boss is its Sentinel. (The Wardens of the Wall, the Warden class and the Forge Warden are unrelated: "Sentinel" is only the Morvane bosses.)
| Sentinel | School | What it was / what it is now |
|---|---|---|
| **Ashmaw** | Ash | the Kiln-Beast, whose breath lit the Turning torches. It "would not die", so the Ash diaspora built kilns around it. It still breathes under them. |
| **Rimeheart Colossus** | Rime | the ice-giant who held the northern pass for the crown's road. Now it holds the pass shut. |
| **the Stormcrow** | Storm | the storm-bird who carried the Turning news across the ring. It nests atop the Stormcliffs and screams the news of a Turning that never came. |
| **Abbess Morwen** | Radiance (and Song) | Abbess of the hill chapel that became the Abbey, keeper of the Turning Bell. She drowned with it, and she will not let it be rung again. She also leads the drowned choir, which is why Song shares her. |
| **the Spinner Below** | Umbral | the memory-spider who wove the Concord's records into the dark under the Gloamwood. It is unweaving them. |
| **the Weeping Willow** | Verdant | the willow planted at the Concord's founding. Its branches now weep black tears into the Gloamwood. |
| **Bonelord Varric** | Blade | Varric was the first Concord duellist, who settled the Schools' War in single combat. His barrow lies under Aldermoor. The empty graves are his, raised to his muster. |
| **the Gilded Engine** | Iron | the Concord's great forge-engine, which made the crown's settings. It was buried in the gold of the Gilded city, and it still runs. |
| **the Ooze Sovereign** | Fist | once the "Slime King" of the prototype bounty. It has eaten a hollowed Fist guardian, the Stone Abbot, and wears his discipline: it fights like a monk. |
| **the White Stag** | Hunt | the Stag the Turning procession followed through the Gloamwood. It is not sick, it is grieving (Nan Briar is right), and its tears poison the wood. |
| **the Lantern Queen** | Guile | the marsh-queen who sold safe passage across Morvane Marsh to the crown's road. Now she sells lights that lead into the water. |
| **the Hollow King** | none | Casimir. See 01-world.md. |

**Story rule:** beating a Sentinel **unhollows** it in its final moments: a short "release" scene with a codex unlock. The school mark it gives (`story.sentinel.<school>`) is what lets a bearer of that school stand at the Citadel's doors.

## Villages (map.js VIL; ids from Claude 2: vil:<id>)
| Village | Region | Places (handoff) | Notes |
|---|---|---|---|
| **Brindlecross** (`vil:brind`) | Aldermoor | the Gilded Goose (Wil), Elder's House (Godric), the Anvil (Odo), Hearth & Crust, Watch House (Rook), Market (Pell), Chapel of the Drowned Bell (Aldous), Cinderwick Mill (Corwin) | the Act II hub; also the **Stone Court** (proposed `landmark:stone-court`): the old Concord embassy square, where bearers meet |
| **Thornhollow** (`vil:thorn`) | Briar Hollow | Briar Cottage (Nan Briar), Greenbriar Nursery, the Briar & Kettle, Hedge House, Herb Stall | |
| **Hollis Lodge** (`vil:lodge`) | Gloamwood | Hunter's Lodge (Maren), Kennels, Archery Yard, Pelt Trader | Maren's family lodge |
| **Old Coach Inn** (`vil:coach`) | Morvane Road | Old Coach Inn, Coach Stables, the Drowned Rat, Wheelwright, Road Market (Pell) | |
| **Wardenhold** (`vil:warden`) | Frostmere Pass | Warden's Gate, Wardenhold Keep, Watchtower, Frost Forge, Drill Yard | Morvane's Rime/Warden diaspora |
| **Kilnmouth** (`vil:kiln`) | Ashfall Kiln | the Great Kiln (its Concordia copy), the Cinder Mug, Kiln Row, Ashworks, Ore Market | the Ash diaspora |
| **Abbeyshore** (`vil:shore`) | Drowned Abbey | Shore Chapel, the Tide Kettle, Ferry House (Tamsin), Old Fish Mill, Fish Stall | |
| **Lanternford** (`vil:ford`) | Morvane Marsh | the Will-o'-Wisp, Lantern Shop, Ford Keeper, Bog Market | |
| **Gildport** (`vil:gild`) | Gilded Ruins | Sparkwright Works, Gilded Row, Golden Crust, the Gear & Saucer, Clocktower | |
| **Cliffstair** (`vil:cliff`) | Stormcliffs | Storm Spire, Cliff House, the Lightning Jar, Wind Yard | |

## The Brindlecross fourteen
Their handoff text (lore, lines, quests) is canon. Below is what each one *is* in the Hollow Crown. Every one has one Act II quest thread and a role in Act III or the epilogue.

| NPC (id) | School | Role (handoff) | Hollow Crown story |
|---|---|---|---|
| **Maren Hollis** (`npc:maren`) | Hunt | Huntress of the Gloamwood; *The Wolves at the Gate* | She wears the pelt of the first wolf that came back wrong. She is hunting the reason, and the reason is the White Stag's grief. Her mother was a **bearer** who walked into the Heart in C. 1012 and never came back. |
| **Elder Godric** (`npc:godric`) | Radiance | Elder of Brindlecross; *The Drowned Bell* | He remembers the Abbey bells. He was a young Citadel guard on the night of the Hollowing and saw Casimir put the crown on. He has never said so. *(INSIGHT thread.)* |
| **Nan Briar** (`npc:nanbriar`) | Verdant | Hedge-witch; *Tears of the Stag* | Nobody remembers her young because she was **the Verdant Concordant's gardener**, three Turnings ago. She knows what the tears are made of. Her cat Parson bites clergy and anyone in red. |
| **Odo Vance** (`npc:odo`) | Iron | Smith of the Anvil; *Hollow Iron* | His study of hollow iron leads to the Gilded Engine, and to the discovery that the crown's settings were made to *hold* grief as well as song. |
| **Wil Crane** (`npc:wil`) | Song | Keeper of the Gilded Goose | Rest, rumours, stew. She hears everything first. In the epilogue she sings the ending's ballad, with class-specific verses. |
| **Pell Odd** (`npc:pell`) | Guile | Peddler of the Morvane Road | Moves weekly. Sells rare goods, some of it really Sparkforged. Secretly a black-pearl smuggler (a Tidecourt link) who will sell the hero a way into the Heart in Act III. |
| **Brother Aldous** (`npc:aldous`) | Radiance | Last Brother of the Abbey; *Bells Beneath* | The only novice who swam out in C. 1012. He wants the bell clapper. **He rings the Drowned Bell at the end of Act II**, opening the Heart. |
| **Captain Rook Harrow** (`npc:rook`) | Blade | Militia captain; *Hold the North Road*, bounties | Eleven farmers and a halberd. She runs the bounty board, which lists all the optional Morvane bosses. |
| **Tamsin Reed** (`npc:tamsin`) | Hunt | Ferrywoman of the Wend; *Something in the Reeds* | The pale shapes under her ferry are the drowned choir, swimming home to the Bell. |
| **Old Hobb** (`npc:hobb`) | Umbral | Sexton; *Empty Graves* | "The Hollowed walk home." The graves lead to Bonelord Varric's muster in the Barrowdowns. |
| **Ysolde Fenn** (`npc:ysolde`) | Rime | Archivist of the Moot Hall | Keeper of the codex. The White Stag weeps in the margins of a 300-year-old chronicle. She works out that **the tears are older than Casimir**: the crown always held the schools' grief, and the Concordant's song kept it quiet. *(INSIGHT thread; key to the secret ending.)* |
| **Pip** (`npc:pip`) | Song | Self-appointed squire; *Pip's Big Adventure* | Cannot be hurt; can be very annoying. He remembers everything adults say when they think he isn't listening. **Pip is Unsung.** His thread turns the hero's view of Casimir. |
| **Corwin Hale** (`npc:corwin`) | Ash | Miller of the Cinderwick; *Rebuild the Mill* | The mill burned the night the wolves came. He gave his hearth-beam to an Arcanist; if the hero is an Arcanist, it is their staff. |
| **Sela Moth** (`npc:sela`) | Storm | Keeper of Waystones; *Wake the Waystones* | She wakes the old waystones. The stones hum before a storm, and they're humming now. In Act III she opens the waystone into the Heart. |

## The bearers (the other 23 heroes)
In any one campaign, the other 23 half-stones are carried by the **other 23 heroes**, who come through their own arches into Concordia over the course of Act II. They are NPCs in your story, in their class's default look. They give the world its scale and the ending its weight.
- **Your sibling bearer** (the other class of your school) is featured: they arrive a little after you, and their half-stone is the one your nemesis steals at the end of Act II.
- **Two or three featured bearers per campaign**, chosen for the regions your story visits (named in each outline). Each gets a short quest thread.
- **The rest** appear at the Stone Court as cameo NPCs with barks, who gather as the Turning nears.
- **Co-op:** a bearer NPC whose class is in the party is hidden (`presentWhen: { not: { partyHasClass: '<class>' } }`), because the player *is* that bearer. Their quest beats are re-voiced for the player via [School] options. **This needs a `partyHasClass` condition** (07-narrative-systems.md, contract needs).
- How many bearers stand with you at the end (`story.bearers_gathered`) affects the ending.

## The Heart of Morvane (Act III)
- **The Weeping Wall:** a curtain of black tears around the Heart. It parts only when the Turning Bell rings (the end of Act II).
- **The Hollow Legion's camp:** the camp of the hollowed, where everyone who walked into the Heart in thirty years now stands. Hollow Legionnaires, Weeping Shades, Black Tear Knights. Maren's mother is here.
- **The Twelve Stairs:** the processional way, one stair per school, each hung with that school's old banner.
- **The Concord Citadel** (`inst:concord-citadel`): the throne hall. The empty crown hangs above the throne in a cage of its own tears.
- **The Black Concord:** the Hollow King's war-engine, built by the Gilded Engine from the crown's settings and thirty years of tears. Phase 1 of the finale.
- **The Hollow King:** Casimir, sixty years old, gentle, broken, weeping. Phase 2 of the finale, then the choice.

## Proposed level bands (for Claude 1 and Claude 3 to own)
Act I runs from level 1 to 10 in the realm. Concordia's handoff bands (1–30) are compressed into Act II and III:
| Region | Handoff band | Proposed |
|---|---|---|
| Aldermoor | 1–7 | 10–12 |
| Morvane Road, Gloamwood | 6–10 | 11–14 |
| Briar Hollow, Drowned Abbey | 8–14 | 13–16 |
| Frostmere Pass, Ashfall Kiln | 14–20 | 15–19 |
| Morvane Marsh, Gilded Ruins, Stormcliffs | 18–26 | 18–23 |
| Heart of Morvane | 30+ | 24–30 |

With no level sync in co-op, a guest who is over-levelled for the host's area just has it easy. Drops scale per player.
