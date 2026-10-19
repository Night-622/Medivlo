# 07: Phase 1 Prologue: "The Ashmark" (region:aldermoor)

The vertical slice is **5 main quests + 2 side quests, 10 core NPCs (+4 special), 24 codex entries.**
Setting: Brindlecross, on **Lanternmass 1187 YL**, the first anniversary of the Night of Falling Ash. It is snowing.

## Valley exits (lore for Claude 2's road gaps)
| Gap | Road | Blocked by (until) | Opens on |
|---|---|---|---|
| North | **King's Way** → Kingsvale | trees felled across the road by the storm of the Night of Falling Ash; the village can't spare the axes | `prologue.complete` (Hesta burns a path) |
| East | **Varn Causeway** → Greywater | **Reeve's barricade**: Elder Godric's quarantine against Hollowed from the marsh | `prologue.complete` |
| South | **Pilgrim's Road** → Lantern Coast | **Wick toll-gate**: the Inquisition has closed the south road to "marked" travellers | `prologue.complete` + `act1.complete` |

Waterways: **the Brindle** (village stream, which drives Oswin's mill) flows into **Wennamere**, which drains east via the **River Grey** into Greywater. The **River Hald** runs through Kingsvale to Haldren. The **Ash Road** runs east from Sunscar into the Cinder Wastes.

---

## Core NPCs (10)

| # | Id | Name | Role | Home landmark | Schedule (hours) | Notes |
|---|---|---|---|---|---|---|
| 1 | `npc:maren-hollis` | Maren Hollis | huntress, childhood friend; temporary companion | `landmark:hollis-cottage` | 6–18 green, 18–6 cottage; **follows the player** while `companion.maren.following` | essential |
| 2 | `npc:anselm-pryde` | Brother Anselm Pryde | village priest, scholar, mentor | `landmark:brindlecross-chapel` | 6–20 chapel, 20–6 chapel (sleeps there) | essential; absent if `prologue.anselm_betrayed` |
| 3 | `npc:tobin-hollis` | Tobin Hollis (14) | Maren's missing brother | `landmark:abbey-crypt` during Q5; `landmark:hollis-cottage` after if `prologue.tobin_fate = saved` | – | present only via conditions |
| 4 | `npc:godric-thatch` | Elder Godric Thatch | village reeve | `landmark:elder-hall` | 8–17 green, otherwise hall | merchant: none |
| 5 | `npc:nan-briar` | Nan Briar | Thornwise hedge-witch | `landmark:briar-hut` | always hut | merchant: potions/herbs; trainer: Verdant/Rime tome |
| 6 | `npc:garrick-hale` | Inquisitor Garrick Hale | Order of the Wick witchfinder | `landmark:brindlecross-green` (Q3), `landmark:guttered-candle` (lodging), `landmark:wennamere-shore` (Q5 end) | present from Q3 start | not killable in the prologue (he flees at low HP) |
| 7 | `npc:oswin` | Oswin the Miller | secret Drowned Choir convert | `landmark:oswin-mill` | 6–19 mill, 23–2 `landmark:wennamere-shore` (night rite, a clue) | absent if `prologue.oswin_fate = slain`; guarded if exposed |
| 8 | `npc:hild-coalbrook` | Hild Coalbrook | blacksmith | `landmark:coalbrook-smithy` | 7–19 smithy | merchant: weapons/armour, repair |
| 9 | `npc:wat-fennick` | Wat Fennick | keeper of *The Guttered Candle* tavern | `landmark:guttered-candle` | always tavern | merchant: food, drink, rumours |
| 10 | `npc:hesta-corrow` | Hesta Corrow | the last Emberwarden | `landmark:wennamere-shore` (Q5 final), then `landmark:brindlecross-green` | present when `quest:the-drowned-abbey` is at stage `hesta` or `prologue.complete` | essential |

**Special (not counted):** `npc:pell-tinker` (travelling pedlar at the green, a merchant who sells Oswin black candles: a clue), `npc:abbess-morwen` (boss and her speech), `npc:ysolde` (vision only), `npc:white-stag` (Weeping Stones, if `prologue.stag_fate = cleansed`; gives a blessing).

### NPC sketches
- **Maren Hollis** (19): short-cropped red hair, a scar through one eyebrow, longbow. Raised Tobin alone after their mother died in the Grey Lung. Teases the player; terrified for Tobin; furious at anyone who hesitates. *"If you say 'he'll turn up' one more time I'll put an arrow somewhere you'll remember."*
- **Brother Anselm Pryde** (50s): round, kind, ink-stained. Sent to Brindlecross as a punishment for "excessive curiosity". He secretly hoards Emberwarden texts and recognised the Ashmark from a drawing a year ago. He has kept the player's secret since. *"Faith is a lantern, child. You don't stare into it. You hold it up so you can see the road."*
- **Tobin Hollis** (14): a shepherd boy who couldn't stop dreaming of his mother under the water, until he followed the voice.
- **Elder Godric Thatch** (60s): a weather-beaten, decent, overwhelmed reeve. He built the east barricade himself. He's afraid of the player since the pyre but will defend them against outsiders.
- **Nan Briar** (age unknown): bent, sharp-eyed, half-Aelthi by rumour. She sings to her pots. She calls the Mire "the Old Sleeper" and pities it. *"Everything that's hungry was something else first."*
- **Inquisitor Garrick Hale** (40s): weathered and tired, a devout ex-soldier, not cruel but certain. He carries the **Last Wick**, a lantern lit from the Brand itself before the Quench, one of perhaps a dozen such flames left. It flares in the player's presence. *"Hold out your hand. If the Lantern loves you, you've nothing to fear."*
- **Oswin the Miller** (40s): quiet, grieving, polite. His wife **Edith** drowned in Wennamere on the Night of Falling Ash. The Choir told him she is dreaming below, happy, and he believes them. He sent for the Inquisition to have the player *taken away* before they reach the Ember.
- **Hild Coalbrook** (30s): a broad, laughing smith, Orrun-trained as an apprentice in Dun Korrath-Gate. She knows a little Runecraft and sees ley-glow in coal.
- **Wat Fennick** (50s): a gossip who keeps the tavern's hearth lit no matter what ("Not one night in thirty years"). He hears everything.
- **Hesta Corrow** (70s): tall, gaunt, with burn-lines up both arms. She coughs ash. She has a staff and a sword (*Lastlight*). She's spent a year tracking the falling Embers; she failed to save Ysolde, and she isn't going to fail again. *"Well. You're shorter than I hoped."*

---

## Quest chain

All ids are final unless Claude 1 objects. Objective kinds are the ones from [08-data-formats.md](08-data-formats.md).

### Q1 `quest:the-ashmark`: "The Ashmark" (main, auto-start)
Tutorial for movement, interaction, dialogue and basic combat. At `pyre`, set `ashmark.rank = 1` (Kindle + Purge I).
| Stage | Journal | Objectives | Effects / notes |
|---|---|---|---|
| `wake` | Maren is hammering on the door. It's Lanternmass, the Remembrance. | talk `npc:maren-hollis` | unlock `lore:lanternmass`, `lore:night-of-falling-ash` |
| `chapel` | Brother Anselm wants help preparing the remembrance pyre. | talk `npc:anselm-pryde` | unlock `lore:the-seven-sparks` |
| `tinder` | Fetch dry tinder from the woodshed. | interact `obj:woodshed-tinder` | gives `item:pyre-tinder` |
| `pyre` | Bring the tinder to the pyre on the green. | interact `obj:remembrance-pyre` (requires the item) | dialogue `dialogue:pyre-ignites`: the Ashmark flares and the pyre *explodes* into white-gold flame. Set `prologue.pyre_lit`, `prologue.festival_attacked`. Unlock `lore:the-ashmark`. |
| `attack` | Hollowed are coming out of the snow! | kill `enemy:hollowed-thrall` ×4 | unlock `lore:the-hollowed` on first kill |
| `aftermath` | Speak to Elder Godric. | talk `npc:godric-thatch` | Tobin is missing; his bed is soaked with black water. Complete → start `quest:lost-in-the-gloamwood`. Reward: xpTier 1 (minor). |

### Q2 `quest:lost-in-the-gloamwood`: "Lost in the Gloamwood" (main)
| Stage | Journal | Objectives | Effects / notes |
|---|---|---|---|
| `enter` | Maren is going after Tobin, with or without you. | reach `landmark:gloamwood-path` | Maren joins: `companion.maren.following = true` |
| `camp` | Tobin's trail leads into the wood. | reach `landmark:tobins-camp`; interact `obj:tobins-lantern` | wet black footprints lead toward the Weeping Stones |
| `wolves` | Wolves, and something worse, guard the hollow. | kill `enemy:gloamwood-wolf` ×3 | – |
| `briar` | Smoke from a hut. Someone lives out here. | talk `npc:nan-briar` | unlock `lore:the-thornwise`, `lore:the-white-stag`. She explains that the White Stag of the Weeping Stones has been Hollowed and is herding the taken toward the mere. |
| `stag` | Face the White Stag at the Weeping Stones. Nan Briar says: *"Bring it low, then burn the dark out of it, if you've the heart."* | boss `enemy:hollowed-white-stag`. **Claude 3's mechanic:** at ≤15% HP the Ashmark can cleanse it, which sets `prologue.stag_cleansed`; killing it sets `prologue.stag_slain`. Objective: flag any of the two. | On complete the quest sets `prologue.stag_fate` = `cleansed` (gives `item:stag-tears`, +10 Thornwise, `dialogue:stag-cleansed` bark) or `slain` (gives `item:white-stag-antler`, -10 Thornwise). Unlock `lore:the-weeping-stones`, `lore:the-aelthi`. |
| `return` | Return to Nan Briar. | talk `npc:nan-briar` | If `stag_fate = cleansed` and you hold `item:stag-tears`, she brews `item:briar-salve` (it lets Purge cleanse a person safely). She reveals the trail leads to **Wennamere's drowned abbey**. Unlock `lore:the-mire` (section "The Old Sleeper"). Complete → start `quest:the-witchfinder`. Reward: xpTier 2 (standard), `tome:rime-frostbite` *(placeholder, Claude 3)*. |

### Q3 `quest:the-witchfinder`: "The Witchfinder" (main)
| Stage | Journal | Objectives | Effects / notes |
|---|---|---|---|
| `arrival` | Riders of the Wick are on the green. | talk `npc:garrick-hale` | `dialogue:hale-arrival`: he's here for "the one who lit the pyre". He'll test you, but first he'll hear the village. Unlock `lore:order-of-the-wick`. |
| `secret` | Brother Anselm beckons from the chapel door. | talk `npc:anselm-pryde` | `dialogue:anselm-secret`: he shows you *A Warden's Primer*, explains Emberwardens and what the Ashmark might be, and begs secrecy. Unlock `lore:the-emberwardens` (section 1), `lore:the-heartfire-and-leys`, `lore:the-brand`, `lore:the-lanternate`. Set `prologue.anselm_secret = true`. |
| `test` | Face the Inquisitor's test. | talk `npc:garrick-hale` | `dialogue:hale-test`, the **branch point**. The Last Wick flares at your hand. Options (see below). |
| `sluice` | The abbey lies under Wennamere. The old Giant's Sluice could drain it, but the miller keeps the sluice-key. | – (auto-advance) | Complete → start `quest:the-millers-key`. Reward: xpTier 2 (standard). |

**`dialogue:hale-test` outcomes → `prologue.hale_outcome`:**
- **Submit** (hold out your hand): `submitted`. Hale: "Lantern-touched… or something wearing its light. Cleanse that abbey, and I'll write to Solenne that you're the former." +15 Lanternate.
- **Persuade** (check `will` ≥ 15, or trait tag `devout`, or class `class:oathbound`): `persuaded`. He agrees to come to the abbey as a witness rather than a jailer. +10 Lanternate.
- **Deceive** (tag `silver-tongue`, or class `class:shade`, or Anselm's forged Wick-licence when `prologue.anselm_secret` is true and you chose "ask Anselm for help"): `deceived`. He leaves for the night; he'll find out later. +0, sets `npc.garrick-hale.suspicious`.
- **Defy** (refuse and draw steel): `defied`. Fight `enemy:wick-soldier` ×3 *(requested from Claude 3; fallback `enemy:ashfoot-cutthroat`)*. Hale flees, wounded. -25 Lanternate, Wick hostile in Act I.
- **Betray Anselm** (an extra option in any branch: "The priest has heretic books"): +20 Lanternate, Hale arrests Anselm, `prologue.anselm_betrayed = true`, `prologue.anselm_secret = false`. Anselm's companion arc becomes "the prisoner of Valcastre" in Act II.

### Q4 `quest:the-millers-key`: "The Miller's Key" (main)
| Stage | Journal | Objectives | Effects / notes |
|---|---|---|---|
| `ask` | Ask Oswin for the sluice-key. | talk `npc:oswin` | He says it was lost years ago. He is lying, badly. |
| `investigate` | Something about Oswin isn't right. | **any of:** interact `obj:oswin-strongbox` (locked; open by class `class:shade`, `item:mill-key` from Wat's hint, or force with `might` ≥ 15); talk `npc:wat-fennick` *(optional hint)*; talk `npc:pell-tinker` *(optional hint: black candles)* | the strongbox holds `item:sluice-key` and `item:choir-hymnal`. Unlock `lore:the-drowned-choir`, `lore:the-mire` (section "Below"). |
| `confront` | Confront Oswin. | talk `npc:oswin` | `dialogue:oswin-confront`: he confesses (Edith, the Choir, sending for the Wick). **Expose him** to Hale and the village (`exposed`; with Hale present, +10 Lanternate); **spare** him and keep the secret (`spared`; he flees to Greywater, recurs in Act I); **kill** him (he attacks if you choose violence, `slain`). Set `prologue.oswin_fate`. |
| `sluice` | Go to the Giant's Sluice. | reach `landmark:giants-sluice`; kill `enemy:mireling` ×5; interact `obj:giants-sluice-wheel` (requires `item:sluice-key`) | unlock `lore:the-orrin`. Set `prologue.mere_drained`. The mere drains and the abbey rises out of the mud. Complete → start `quest:the-drowned-abbey`. Reward: xpTier 2 (standard). Unlock `lore:the-unwrought` on first Mireling kill. |

### Q5 `quest:the-drowned-abbey`: "The Drowned Abbey" (main, dungeon)
| Stage | Journal | Objectives | Effects / notes |
|---|---|---|---|
| `enter` | Enter the Abbey of Saint Wenna. | reach `landmark:drowned-abbey` (instance) | unlock `lore:saint-wenna`. Hale joins temporarily if `hale_outcome` is `submitted` or `persuaded`. |
| `nave` | The nave is full of the drowned faithful. | reach `landmark:abbey-nave`; kill `enemy:drowned-dead` ×3, `enemy:hollowed-thrall` ×4 | lore object `obj:wenna-bell` |
| `crypt` | Find the taken villagers. | reach `landmark:abbey-crypt`; interact `obj:reed-cocoon` ×3 | freed villagers flee |
| `tobin` | Tobin is here, half-taken. | interact `obj:bound-tobin` | `dialogue:tobin-choice` (below) → `prologue.tobin_fate` |
| `abbess` | Something is ringing bells beneath the water. | reach `landmark:abbey-reliquary`; kill `enemy:abbess-morwen` (boss) | `dialogue:morwen-death` |
| `ember` | The Ember lies in the reliquary. | interact `obj:fallen-ember` | `dialogue:ysolde-vision-1`: the Ember fuses with the Ashmark and Ysolde speaks. Set `world.embers_held = 1`, `ashmark.rank = 2` (Embersight unlocked, Purge II). Unlock `lore:ysolde-the-pale-saint`, `lore:the-seven-embers`. |
| `hesta` | Get out. Someone is waiting on the shore. | reach `landmark:wennamere-shore`; talk `npc:hesta-corrow` | `dialogue:hesta-meeting`. Hale confronts Hesta, and his response depends on `hale_outcome`. Hesta reveals herself as an Emberwarden and invites you east and north. Unlock `lore:hesta-corrow`, `lore:the-emberwardens` (section 2). **Complete:** set `prologue.complete = true`. Reward: xpTier 3 (major), 1 skill point, `item:wardens-token`. |

**`dialogue:tobin-choice` → `prologue.tobin_fate`:**
- **Purge with the briar-salve** (requires `item:briar-salve`): `saved`, safe. Maren's loyalty +30.
- **Purge without salve:** check (`will` ≥ 20) → success: `saved`; failure: `dead` (he burns). Maren's loyalty -40 on failure.
- **Bind him and carry him home:** `hollowed`. He breaks free on the way out and flees into the reeds. Sets up Act I's `quest:the-boy-in-the-reeds`. Maren's loyalty +10 (she still hopes).
- **Mercy:** `dead`. Maren's loyalty -60, and she leaves after the prologue unless persuaded.

---

## Side quests

### SQ1 `quest:smoke-from-the-barrow`: "Smoke from the Barrow" (side; giver `npc:godric-thatch`, available after Q1)
- Lights have been seen at **Edric's Barrow** on the moor. It turns out **Ashfoot Reavers** (bandits) are looting it. Reach `landmark:edrics-barrow` and kill `enemy:ashfoot-cutthroat` ×2 and `enemy:ashfoot-archer` ×2. Then interact `obj:barrow-inner-door`: a cold voice speaks through the stone (`dialogue:barrow-voice`). One of Edric's sworn dead can't cross over, because Saela's river is freezing. The door is sealed with the Barrow-Kings' sigil and *won't open until Act I*: this foreshadows *Edric's Oath*.
- Unlock `lore:the-restless`, `lore:edric-barrowborn`. Reward: xpTier 1 (minor), `item:barrow-blade` (fine sword).

### SQ2 `quest:the-cold-forge`: "The Cold Forge" (side; giver `npc:hild-coalbrook`)
- Hild's forge won't hold heat; "the coal's gone dead". She asks for **ley-coal** from the veins in the tors. The Ashmark makes it glow faintly when you're near: this foreshadows Embersight. Interact `obj:ley-coal-vein-*` ×3 (on the moor, guarded by `enemy:gloamwood-wolf` ×2). Unlock `lore:the-heartfire-and-leys` (section "Dead Coal").
- Reward: xpTier 1 (minor), 1 skill point, a free weapon upgrade at Hild (Claude 3 hook), and Hild remembers you in Act I (Dun Korrath-Gate contact).

---

## Codex entries (24)

Categories: `cosmology`, `gods`, `magic`, `history`, `factions`, `peoples`, `places`, `characters`, `bestiary`, `culture`, `books`.

| # | Id | Title | Category | Unlocked by | Sections (progressive) |
|---|---|---|---|---|---|
| 1 | `lore:the-forging` | The Forging | cosmology | interact `obj:chapel-lectern` (the *Canticle of the Anvil*) | Canticle version; later the Aelthi version (Act I), then the truth (Act II) |
| 2 | `lore:the-seven-sparks` | The Seven Sparks | gods | Q1 `chapel` | one section per god, unlocked from shrines over time |
| 3 | `lore:the-mire` | The Mire | cosmology | Q2 `return` | "The Old Sleeper" (Nan Briar), "Below" (the Choir hymnal), "The Dreaming" (Act I) |
| 4 | `lore:the-heartfire-and-leys` | The Heartfire and the Leys | magic | Q3 `secret` | "Dead Coal" (SQ2) |
| 5 | `lore:the-brand` | The Brand | history | Q3 `secret` | – |
| 6 | `lore:night-of-falling-ash` | The Night of Falling Ash | history | Q1 `wake` | – |
| 7 | `lore:the-seven-embers` | The Seven Embers | magic | Q5 `ember` | one section per Ember found |
| 8 | `lore:the-ashmark` | The Ashmark | magic | Q1 `pyre` | "Kindle", "Purge", "Embersight" as abilities unlock |
| 9 | `lore:lanternmass` | Lanternmass | culture | Q1 `wake` | – |
| 10 | `lore:the-lanternate` | The Lanternate | factions | Q3 `secret` | – |
| 11 | `lore:order-of-the-wick` | The Order of the Wick | factions | Q3 `arrival` | "The Last Wick" (Hale's lantern) |
| 12 | `lore:the-emberwardens` | The Emberwardens | factions | Q3 `secret` | (2) "The Last Warden", unlocked by Hesta in Q5 |
| 13 | `lore:the-thornwise` | The Thornwise | factions | Q2 `briar` | – |
| 14 | `lore:the-drowned-choir` | The Drowned Choir | factions | Q4 `investigate` | – |
| 15 | `lore:the-aelthi` | The Aelthi | peoples | Q2 `stag` | – |
| 16 | `lore:the-orrin` | The Orrin and the Rusting | history | Q4 `sluice` (the giant-work) | – |
| 17 | `lore:brindlecross` | Brindlecross | places | `region:entered` aldermoor / Q1 start | – |
| 18 | `lore:the-weeping-stones` | The Weeping Stones | places | `landmark:discovered` weeping-stones | – |
| 19 | `lore:saint-wenna` | Saint Wenna and her Abbey | characters | Q5 `enter` | "The Last Abbess" (Morwen) after the boss |
| 20 | `lore:the-hollowed` | The Hollowed | bestiary | first `enemy:hollowed-*` kill | – |
| 21 | `lore:the-unwrought` | The Unwrought | bestiary | first `enemy:mireling` kill | – |
| 22 | `lore:the-white-stag` | The White Stag of the Gloamwood | bestiary | Q2 `briar` | its fate |
| 23 | `lore:ysolde-the-pale-saint` | Saint Ysolde | characters | Q5 `ember` | the Lanternate hagiography; "The Pale Saint" (vision) |
| 24 | `lore:hesta-corrow` | Hesta Corrow | characters | Q5 `hesta` | – |
| + | `lore:the-restless`, `lore:edric-barrowborn` | – | bestiary / history | SQ1 | – |

## World objects and triggers needed from Claude 2 (`obj:*`, kind)
`obj:remembrance-pyre` (interactable), `obj:woodshed-tinder` (interactable), `obj:chapel-lectern` (lore → lore:the-forging), `obj:tobins-lantern` (interactable), `obj:oswin-strongbox` (interactable), `obj:giants-sluice-wheel` (interactable), `obj:wenna-bell` (lore), `obj:reed-cocoon` ×3 (interactable; ids `obj:reed-cocoon-1..3`, and I count any `obj:reed-cocoon-*`), `obj:bound-tobin` (interactable), `obj:fallen-ember` (interactable), `obj:barrow-inner-door` (interactable), `obj:ley-coal-vein-1..3` (interactable, moor tors).
Trigger zones: `area:exit-north`, `area:exit-east`, `area:exit-south` at the three road gaps, so I can show "the road is blocked" barks before `prologue.complete`.

## Enemy ids needed from Claude 3
Confirmed (Claude 3, Phase 1): `enemy:gloamwood-wolf`, `enemy:hollowed-thrall`, `enemy:mireling`, `enemy:ashfoot-cutthroat`, `enemy:ashfoot-archer`, `enemy:drowned-dead`; bosses `enemy:hollowed-white-stag` (cleansable at ≤15% HP → `prologue.stag_cleansed` / `prologue.stag_slain`) and `enemy:abbess-morwen`.
Requested: `enemy:wick-soldier` (for the Defy branch of Q3; fallback `enemy:ashfoot-cutthroat`). Please give every enemy family tags (`hollowed`, `unwrought`, `beast`, `folk`, `restless`) so objectives can count "any hollowed".

## Item ids needed from Claude 3 (quest items are mine to define if he prefers)
Quest items (no stats): `item:pyre-tinder`, `item:stag-tears`, `item:briar-salve`, `item:sluice-key`, `item:choir-hymnal`, `item:mill-key`, `item:wardens-token`. Rewards (Claude 3's stats): `item:white-stag-antler`, `item:barrow-blade`, `tome:rime-frostbite` (placeholder).
