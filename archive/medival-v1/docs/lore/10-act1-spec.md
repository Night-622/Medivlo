# 10: Act I "The Long Winter": data spec

Implementation spec for the Act I narrative data. It expands [06-campaign.md](06-campaign.md). **All ids here are fixed.** Data goes in `src/data/{quests,dialogue,npcs,lore}/act1-*.ts`. It is data-only: nothing appears in-world until Claude 2 builds these regions, and world placement gaps show up as `[world]` lines from `validateContent()`.

Conventions are the same as the prologue (copy its style from `src/data/**/prologue-*.ts`):
- `QuestDef.name` is the title; every quest has `reward.xpTier` (1 minor, 2 standard, 3 major).
- Quest items and rewards go out via `giveItem` / `reward.items`; Claude 3 grants them.
- Choices are recorded as flags, and quests branch on flags. Use `when: { flag }` objectives for anything decided in dialogue, not `talk`.
- Objects: interacting with `obj:X` auto-opens `dialogue:obj-X`; the obj dialogue should branch on quest stage with entries.
- Checks: `check: { stat, dc, failTo }` using attributes might/finesse/vigor/intellect/will, DCs 10/15/20/25. Tags: `dialogueTag` devout, silver-tongue, scholar, hollow-touched, noble-born, outlander, wick-licensed, brute. Classes: `class:warden|ranger|arcanist|reaver|shade|oathbound`.
- Prose: British spelling, curly quotes (’) in strings, no modern idiom. Haldish folk are plain; Solenni formal; the Choir soft, with water imagery.

---

## Landmarks, instances, objects (requested from Claude 2 via Claude 1)

| Region | Landmarks |
|---|---|
| `region:kingsvale` | `landmark:kings-way-north` (arrival from Aldermoor), `landmark:haldren-gate`, `landmark:haldren-market`, `landmark:haldren-cathedral`, `landmark:throne-room` (in `instance:haldren-keep`), `landmark:quiet-hand-den` (in `instance:haldren-undercity`), `landmark:refugee-camp`, `landmark:cinderhold` (crag ruin), `landmark:cinderhold-hall` (in `instance:cinderhold`), `landmark:thornwall` (Ylwen border hedge, west edge of Kingsvale) |
| `region:greywater-marsh` | `landmark:varn-causeway-end`, `landmark:fenwick-stilts` (eel-fishers' village), `landmark:reed-temple` (in `instance:reed-temple`), `landmark:black-seep`, `landmark:tobins-reeds`, `landmark:varn-gates`, `landmark:varn-market` and `landmark:varn-hall` (in `instance:drowned-varn`) |
| `region:witherdowns` | `landmark:ossuary-of-saint-calder`, `landmark:king-barrows` (entrance), `landmark:river-under-shrine` (deepest floor of `instance:king-barrows`) |
| `region:ironspine-foothills` | `landmark:dun-korrath-gate`, `landmark:grimmas-forge`, `landmark:sunken-nail` (in `instance:old-nail-shaft`) |
| `region:saltreach-coast` | `landmark:brackhaven-docks`, `landmark:salt-exchange` |
| `region:ylwen-deepwood` | `landmark:caer-ylwen`, `landmark:grove-of-antlers` (open after `act1.ylwen_pact`) |
| `region:aldermoor` | `obj:barrow-inner-door` already exists; it opens when `act1.river_truth` is set |

Objects: `obj:cinderhold-brazier`, `obj:wick-ledger` (cathedral vestry), `obj:ylwen-seep-1..3` (Kingsvale woods near the Thornwall), `obj:broken-nail` (sunken-nail), `obj:river-under-shrine` (barrows), `obj:harrow-letters` (reed temple), `obj:varn-floodgate-wheel` (varn-gates), `obj:ember-of-the-fen` (varn-hall, after the boss).

---

## NPCs (`src/data/npcs/act1-*.ts`)

| Id | Name / title | People | Faction | Region · home | Presence | Notes |
|---|---|---|---|---|---|---|
| `npc:queen-aldith` | Aldith, Queen of Haldmarch | haldish | crown | kingsvale · throne-room | always | 15, sharp, untested, hides fear behind formality |
| `npc:osric-harrow` | Osric Harrow, Lord Protector | haldish | crown | kingsvale · throne-room | not `act1.ruler == aldith` after Ch3 (then exiled) | war-hero, pragmatic, secretly treating with the Choir |
| `npc:bryce-aldmere` | Ser Bryce Aldmere, Captain of the Gate | haldish | crown | kingsvale · haldren-gate | always | tired, honest, hates the Wick checkpoint on his gate |
| `npc:prior-benedek` | Prior Benedek of Haldren | solenni | lanternate | kingsvale · haldren-cathedral | always | the Prior whose name Anselm forged; fussy, kind, terrified of Vellane |
| `npc:sable` | Sable | haldish | — | kingsvale · quiet-hand-den | always | Quiet Hand thief, cheerful, secretly going Hollow (black tears she wipes away) |
| `npc:corin-vale` | Corin Vale, hedge-mage | haldish | — | kingsvale · haldren-market | until `act1.market_mage` is set | arrested in the market scene |
| `npc:goody-marl` | Goody Marl | haldish | — | kingsvale · refugee-camp | always | Fenwick widow, refugee; rumours of Varn |
| `npc:cadoc-ap-ynys` | Cadoc ap Ynys | aelthi | thornwise | kingsvale · thornwall (later ylwen · caer-ylwen) | always | exile, dry wit, knows part of the Lullaby; companion |
| `npc:rhiannon-ys-caer` | Rhiannon Ys-Caer, Archdruid | aelthi | thornwise | kingsvale · thornwall during `quest:the-singing-wood`, else ylwen · grove-of-antlers | | survived the Sundering as a child |
| `npc:grimma-ironsong` | Grimma Ironsong, runesmith | orrun | iron-concord | foothills · grimmas-forge | not `act1.nails_kept` once the quest is complete (she leaves) | exiled for telling the truth about the Nails |
| `npc:hedda-stonebrow` | Hedda Stonebrow, Thane-Speaker | orrun | iron-concord | foothills · dun-korrath-gate | always | Brannoch's voice at the gate; proud, frightened |
| `npc:brother-ossory` | Brother Ossory | haldish | — | witherdowns · ossuary-of-saint-calder | always | Grey Monk of Morrow; gentle, morbid humour |
| `npc:cuthred` | Cuthred, sworn to Edric | drowned | — | aldermoor · edrics-barrow | speaker only | the barrow voice |
| `npc:wren-tallow` | Wren Tallow, factor of the Salt League | haldish | salt-league | saltreach-coast · salt-exchange | always | smiling broker |
| `npc:agna-fenn` | Agna Fenn, headwoman of Fenwick | haldish | — | greywater · fenwick-stilts | always | eel-fisher, iron-willed, caught between cult and crown |
| `npc:reed-mother` | The Reed-Mother | drowned | drowned-choir | greywater · reed-temple | speaker only | Choir high priestess; boss `enemy:reed-mother` |
| `npc:aldwin-varn` | Aldwin Varn, the Drowned Lord | drowned | drowned-choir | greywater · varn-hall | speaker only | boss `enemy:aldwin-varn` |

Existing NPCs gain Act I entries:
- `npc:hesta-corrow`: home `landmark:cinderhold-hall` once `act1.cinderhold_restored`. During `quest:the-last-warden` she follows the player (`companion.hesta-corrow.following`). Absent if `act1.hesta_alive == false`.
- `npc:anselm-pryde`: appears at `landmark:cinderhold-hall` when `act1.cinderhold_restored && prologue.anselm_secret` (he brings the Primer).
- `npc:garrick-hale`: Wick envoy at `landmark:haldren-cathedral` in Ch1/Ch3 unless `prologue.hale_outcome == defied`, in which case he is hostile and absent.
- `npc:oswin`: if `prologue.oswin_fate == spared`, he is at `landmark:reed-temple` as a reed-acolyte.
- `npc:tobin-hollis`: if `prologue.tobin_fate == hollowed`, at `landmark:tobins-reeds`.

Put new NPCs in `act1-kingsvale.ts`, `act1-allies.ts` (Ch2 NPCs) and `act1-greywater.ts`. Existing NPCs' new dialogue routes go in their **original** file, `src/data/npcs/aldermoor.ts`; Claude 4 merges those.

---

## Quests

### Chapter 1: "Cinderhold"

**Q1 `quest:the-last-warden`** (main, xpTier 2, giver hesta). Requires `prologue.complete`, autoStart.
Stages:
- `road`: reach `region:kingsvale`. onEnter: companion hesta following.
- `crag`: reach `landmark:cinderhold`.
- `shades`: kill `enemy:cinder-shade` ×4 (the burned dead of the Purge).
- `brazier`: objective `when act1.cinderhold_restored`. `dialogue:obj-cinderhold-brazier` (rekindle with the Ashmark; vision of the Night of Snuffed Candles, 1041) sets it.
- `lesson`: talk hesta. `dialogue:hesta-embers`: the Seven Embers, Ysolde as her apprentice, the cooling leys (the Church buried the reports). Choices about trusting the Church.

End: start `quest:a-queen-in-winter`, unlock lore. Rep +10 emberwardens.

**Q2 `quest:a-queen-in-winter`** (main, xpTier 2).
- `gate`: talk bryce. `dialogue:bryce-gate`: the Wick checkpoint on the gate; the Ashmark is hidden under a glove. Options: Hale's letter (if `npc.garrick-hale.let_go`), [Will 15] bluff, a `noble-born` tag, or Bryce simply waves you through ("I don't take orders from Solenne on my own gate"). Sets `act1.gate_passed`.
- `market`: reach `landmark:haldren-market`, then objective `when act1.market_mage`. `dialogue:corin-arrest`: Wick soldiers arresting the hedge-mage Corin. Intervene with [Will 15] persuasion to free him (`freed`), pay his fine via Prior Benedek (`fined`), fight (`fought`: wick-soldier ×2, rep -15 lanternate), or walk past (`ignored`). Corin, if freed, says the leys are "weaker every month".
- `audience`: talk `npc:queen-aldith` (throne-room). `dialogue:aldith-audience`: a starving city, refugees, the Choir in Greywater. She asks for proof that Varn can be retaken and wants allies. Harrow interrupts.
- `harrow`: talk `npc:osric-harrow`. `dialogue:harrow-first`: courteous, measuring you, hinting that "some wars are better ended at a table".

End: sets `act1.audience_done`; starts `quest:the-singing-wood`, `quest:iron-and-oath` and `quest:the-river-under`. Rep +5 crown.

**Q3 `quest:the-quiet-hand`** (side, xpTier 1, giver sable). Requires `act1.gate_passed`. Sable approaches in the market (bark), with an offer to meet at the den.
- `den`: talk sable at quiet-hand-den.
- `ledger`: steal the Wick ledger. Objective `when act1.wick_ledger_taken`; `dialogue:obj-wick-ledger` with [Shade] / [Finesse 15] / distract-the-Prior options. The ledger lists the "marked" held at Valcastre. If `prologue.anselm_betrayed`, Anselm's name is in it, which sets up Act II.
- `return`: talk sable. Sable joins: `companion` sable following. Hint of her Hollowing: she wipes away a black tear.

### Chapter 2: "Allies in the Cold" (any order)

**Q4 `quest:the-singing-wood`** (main, xpTier 2).
- `thornwall`: reach thornwall, talk cadoc. `dialogue:cadoc-thornwall`: Ylwen is closed to outsiders.
- If `prologue.stag_fate == cleansed`, branch to `rhiannon`: "the White Stag remembers you; the stones sang". Otherwise `seeps`: interact `obj:ylwen-seep-*` ×3, cleansing Mire seeps with Purge (each opens `dialogue:obj-ylwen-seep-N`, a short bark).
- `rhiannon`: talk rhiannon. `dialogue:rhiannon-pact`: the Sundering of Ys, the Lullaby, the Thornwise belief in a third way. Choice: swear the pact (sets `act1.ylwen_pact`, Cadoc joins as a companion) or refuse (`act1.ylwen_refused`; the quest completes with outcome refused).

Lore: the Lullaby, Ys Aerwen, the Dreaming section of `lore:the-mire`, the Aelthi section of `lore:the-forging`.

**Q5 `quest:iron-and-oath`** (main, xpTier 2).
- `gate`: reach dun-korrath-gate, talk hedda (the gate is closed to humans).
- `grimma`: talk grimma at her forge outside the gate; she says two Nails failed.
- `shaft`: reach `landmark:sunken-nail`, kill `enemy:rust-wraith` ×3, interact `obj:broken-nail`, which gives `item:broken-nail-shard` (proof).
- `judge`: talk hedda; objective `when act1.nails_choice`. `dialogue:hedda-nails`: expose the truth in front of the gate crowd (`act1.nails_exposed`; Concord -15, Grimma +loyalty, she joins) or keep the secret for an alliance (`act1.nails_kept`; Concord +20, Grimma leaves in disgust). Both set `act1.korrath_gate_open` and `act1.nails_choice`.

**Q6 `quest:the-river-under`** (main, xpTier 2).
- `ossuary`: talk ossory. The dead are restless; Saela's river is freezing.
- `barrows`: reach king-barrows; kill `enemy:barrow-wight` ×4.
- `shrine`: interact `obj:river-under-shrine`. `dialogue:obj-river-under-shrine` is the big lore beat: drowned ghosts, ice on the river of the dead, and a ghost Aelthi singer who says the sea under the river "was dreaming before it was chained". Sets `act1.river_truth`. Unlock `lore:the-mire` section `dreaming`.
- `report`: talk ossory. He hints the Grey Monks have known for centuries.

**Q7 `quest:salt-and-silver`** (side, xpTier 1). Requires `act1.audience_done`.
- `docks`: reach brackhaven-docks.
- `wren`: talk wren. `dialogue:wren-ember`: the Salt League fished a "star" out of the sea and the auction is in the isles next spring; invitations cost a favour. Sets `act1.auction_known`.

**Q8 `quest:edrics-oath`** (side, xpTier 2). Requires `act1.river_truth && quest:smoke-from-the-barrow completed`, autoStart.
- `door`: interact `obj:barrow-inner-door`. The `dialogue:obj-barrow-inner-door` needs a new entry when `questStage(quest:edrics-oath, door)`: Cuthred can cross now. The door opens and sets `act1.edric_door_open`.
- `tomb`: talk cuthred. Farewell; he gives Edric's sword.

Reward: `item:edrics-oath`. Lore: `lore:edric-barrowborn` section `oath`.

### Chapter 3: "The Drowning of Varn"

**Q9 `quest:the-reed-mother`** (main, xpTier 2). Requires `act1.audience_done` plus at least 2 of [`act1.ylwen_pact`, `act1.korrath_gate_open`, `act1.river_truth`], autoStart. Hesta sends word.
- `fenwick`: reach fenwick-stilts, talk agna. Fenwick pays tithe to the Choir to be spared. She can give you Choir robes: `item:choir-robes`.
- `temple`: reach reed-temple. If `prologue.oswin_fate == spared`, Oswin is here: `dialogue:oswin-reeds`. He can lead you to the letters or betray you (a [Will 15] check to reach him).
- `letters`: interact `obj:harrow-letters`, which gives `item:harrow-letters`: Harrow's correspondence with the Choir. Starts `quest:harrows-bargain`.
- `mother`: kill `enemy:reed-mother`, then `dialogue:reed-mother-death` (her last words: the Pale Saint is coming to Varn herself).

Unlock lore: the reed temples, the Black Seep.

**Q10 `quest:the-boy-in-the-reeds`** (companion, xpTier 2). Requires `prologue.tobin_fate == hollowed && quest:the-reed-mother active or completed`, autoStart.
- `reeds`: reach tobins-reeds. `dialogue:tobin-reeds`: Tobin, half-Drowned, with Maren.
  - At `ashmark.rank` ≥ 2 the player can now Purge more carefully ([Will 15], easier than the prologue's 20). `item:briar-salve` still works if held.
  - Outcomes: saved (`act1.tobin_saved`, Maren loyalty +40); lost to the water (`act1.tobin_lost`, Maren loyalty -20, and she swears vengeance on the Choir).

**Q11 `quest:harrows-bargain`** (main, xpTier 2). Started by the letters.
- `confront`: talk harrow. `dialogue:harrow-confront`: he justifies the pact ("I bought my people a winter").
- `choice`: objective `when act1.ruler`. `dialogue:aldith-judgement` happens in the throne room with Aldith, Harrow and Hale (or, if Hale is absent, Prior Benedek for the Church). Options:
  - expose Harrow to the Queen → `act1.ruler = aldith`
  - keep quiet and use Harrow → `harrow`
  - hand the kingdom's defence to the Wick → `wick`
  - Rep: crown +15 / crown -5 / lanternate +20, crown -20.

**Q12 `quest:ashes-of-varn`** (main, xpTier 3). Requires `act1.ruler`, autoStart.
- `muster`: talk hesta at cinderhold-hall. `dialogue:hesta-muster` recaps the allies from flags.
- `causeway`: reach varn-gates; kill `enemy:drowned-knight` ×2 and `enemy:choir-acolyte` ×4; interact `obj:varn-floodgate-wheel`, which sets `act1.varn_assault`.
- `hall`: reach varn-hall; kill `enemy:aldwin-varn`.
- `aldwin`: objective `when act1.varn_fate`. `dialogue:aldwin-death`: Purge to show him his family were Mire-illusions (`peace`), or finish him (`slain`). Reward `item:drowned-lords-hook` either way.
- `ember`: objective `when act1.ember_fen_claimed`. `dialogue:obj-ember-of-the-fen`: Ysolde appears IN PERSON for the first time and offers Hesta a choice.
  - **Hesta lives** if `act1.ylwen_pact && !prologue.anselm_betrayed`: Cadoc's song and Anselm's Radiance hold Ysolde back.
  - **Otherwise** Hesta sacrifices herself to break Ysolde's hold on the Ember. Sets `act1.hesta_alive` true or false; if dead, gives `item:lastlight`.
  - Ysolde's parting line: she *needs* the player alive.
  - Effects: `world.embers_held = 2`, `ashmark.rank = 3`, `world.mire_level = 2`.
- `aftermath`: talk aldith (or hesta). Sets `act1.complete`. The Lantern Coast opens, and a summons arrives from Vellane.

---

## Codex (`src/data/lore/act1-*.ts`, ~40 entries)

Places: `lore:haldren`, `lore:haldren-keep`, `lore:cinderhold`, `lore:the-kingsvale`, `lore:greywater-marsh`, `lore:varn`, `lore:fenwick`, `lore:the-black-seep`, `lore:the-witherdowns`, `lore:ossuary-of-saint-calder`, `lore:dun-korrath-gate`, `lore:ylwen-deepwood`, `lore:brackhaven`.
History: `lore:charter-of-haldren`, `lore:war-of-the-two-lanterns`, `lore:purge-of-the-emberwardens` (Night of Snuffed Candles), `lore:the-grey-lung`, `lore:barrow-kings`, `lore:sundering-of-ys`, `lore:burning-of-qadir`.
Factions: `lore:crown-of-haldmarch`, `lore:the-quiet-hand`, `lore:grey-monks-of-morrow`, `lore:iron-concord`, `lore:salt-league`, `lore:ashen-creed`.
Peoples: `lore:the-haldish`, `lore:the-orrun`, `lore:the-solenni`.
Magic: `lore:the-lullaby`, `lore:the-nine-nails`, `lore:wick-licence`, `lore:bloodcraft`, `lore:cinderlung`.
Gods: `lore:saela-and-the-river-under`, `lore:morrow-the-veiled`.
Characters: `lore:queen-aldith`, `lore:osric-harrow`, `lore:aldwin-varn`, `lore:cadoc-ap-ynys`, `lore:grimma-ironsong`.
Bestiary: `lore:the-restless` (exists; add section `barrow-wights`), `lore:cinder-shades`, `lore:rust-wraiths`, `lore:drowned-knights`.
Culture: `lore:haldish-hearth-customs`, `lore:the-drowned-tongue` (a glossary of Choir phrases, with progressive sections).
Sections added to existing entries: `lore:the-mire` → `dreaming`; `lore:edric-barrowborn` → `oath`; `lore:the-seven-embers` → `fen`; `lore:the-forging` → `aelthi` (already exists; unlocked in Q4); `lore:the-emberwardens` → `purge-truth` (reports of the cooling buried by the Church).
Use `unlockOn` (landmark / region / kill) for places and bestiary. Everything else is unlocked from quest and dialogue effects.

---

## Needs from other teams (Claude 1 relays these)
- **Claude 2 (world):** the landmarks, instances, objects and areas above; NPC anchors at every NPC home landmark; flag-driven variants (Cinderhold rekindled when `act1.cinderhold_restored`; the Varn gates open when `act1.varn_assault`; the Ylwen gate when `act1.ylwen_pact`; the Korrath gate when `act1.korrath_gate_open`; Edric's inner door when `act1.edric_door_open`; Haldren banners by `act1.ruler`).
- **Claude 3 (systems):**
  - Enemies: `enemy:cinder-shade` (restless), `enemy:rust-wraith` (wrought), `enemy:barrow-wight` (restless), `enemy:choir-acolyte` and `enemy:reed-priest` (folk), `enemy:drowned-knight` (folk, hollowed variant), and bosses `enemy:reed-mother` and `enemy:aldwin-varn`. `enemy:wick-soldier` already exists.
  - Items: `item:choir-robes`, `item:harrow-letters`, `item:broken-nail-shard` and `item:wick-ledger` (quest items); `item:edrics-oath`, `item:lastlight` and `item:drowned-lords-hook` (legendaries, which already exist in SYSTEMS).
