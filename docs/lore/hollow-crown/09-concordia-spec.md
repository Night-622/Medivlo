# 09: Concordia Act II spec (shared data, as built)

Data:
- `src/data/quests/hc-concordia.ts` (16 quests)
- `src/data/npcs/hc-concordia.ts` (the Brindlecross 14 plus 24 generated bearers)
- `src/data/dialogue/hc-concordia-{arrival,spine,people}.ts` and `hc-bearers.ts`
- `src/data/lore/hc-concordia.ts` (31 codex entries)

All of it is gated on `story.act >= 2`.

Tested by a headless playthrough: **24 classes × 2 seeds, 16/16 quests each**. Every run reaches `story.act = 3` and `story.heart_open`. Validation reports 0 logic problems; the only remaining issues are world placements (the list below).

## Quests
| Id | Type | Giver | Stages (objective) |
|---|---|---|---|
| `cc-through-the-arch` | main, autoStart | Maren | arch (interact `obj:arch-*`) → wolves (kill `bx_wolf` ×3) → maren (talk) |
| `cc-wolves` | main | Maren | drive (kill `bx_wolf` ×8) → gate (talk Maren) → tracks (interact `obj:gloam-wolf-tracks`) |
| `cc-drowned-bell` | main | Godric | aldous (talk) → abbey (interact `obj:shore-boat`) |
| `cc-tears` | main | Nan Briar | stag (interact `obj:gloam-stag-glade`, gives `i_tear`) → return (talk Nan, takes `i_tear`) |
| `cc-stone-court` | main | Ysolde | court (talk Ysolde at the Stone Court) → sibling (flag `story.sibling_met`, from the sibling bearer NPC or a co-op partner) |
| `cc-eve` | main | Aldous | clapper (interact `obj:abbey-clapper`, gives `i_clapper`) → gather (talk Aldous at `landmark:shore-boat`). Sets `story.heart_open` and `story.act = 3` |
| `cc-warm-bed` | side, portable | Wil | wil (talk) → rest (world:rest at `obj:brind-goose-bed`) |
| `cc-hollow-iron` | side, portable | Odo | iron (kill `bx_hollow*` ×5) → odo (talk) |
| `cc-north-road` | side, portable | Rook | bandits (kill `bx_bandit` ×6) → camp (reach `landmark:road-bandit-camp`) → mags (kill `bx_mags`) |
| `cc-reeds` | side, portable | Tamsin | watch (night: interact `obj:shore-ferry-rail`) → follow (interact `obj:shore-reed-bed`) |
| `cc-empty-graves` | side, portable | Hobb | search (night: interact `obj:brind-empty-grave`) → follow (interact `obj:barrow-door`) → report (talk) |
| `cc-pip` | side, portable | Pip | well (interact `obj:brind-well`) → drop (interact again) → home (talk Pip) |
| `cc-mill` | side, portable | Corwin | timber (collect `i_timber` ×10 via loot:granted, plus kill `bx_wolf` ×4) → corwin (talk). Sets `cc.mill_built` (bakery honey cakes) |
| `cc-waystones` | side, portable | Sela | brind (waystone:woken `ws:brind`) → wood (`ws:glade`, `ws:stag`, `ws:briar`) |
| `cc-bounty-alpha` | bounty | Rook | kill `bx_alpha` |
| `cc-bounty-slime` | bounty | Rook | kill `bx_slimeking` |

`story.act2_ready` is set by each class campaign's C-6. It is what unlocks II-6.

## Places and objects for Claude 2
**Brindlecross (`vil:brind`) landmarks.** Handoff places map to: `landmark:brind-gilded-goose` (Wil), `brind-elders-house` (Godric and Ysolde: the moot hall and archive), `brind-anvil` (Odo), `brind-watch-house` (Rook), `brind-market` (Pell), `brind-chapel` (Aldous), `brind-mill` (Corwin). New:
- `landmark:brind-east-gate`: Maren's post
- `landmark:brind-graveyard`: Hobb, by the chapel
- `landmark:brind-green`: Pip by day
- `landmark:brind-pip-home`: Pip at night
- `landmark:brind-well`, with `obj:brind-well`
- `landmark:brind-waystone`: Sela, at `ws:brind`
- `obj:brind-goose-bed`: the Goose's rest point; please emit world:rest with this pointId
- `obj:brind-empty-grave`: in the graveyard
- `landmark:stone-court`: the old embassy square, where the bearers stand

**Aldermoor:**
- `landmark:gate-circle`: the 12 arches, with `obj:arch-<school>` for each school
- `landmark:barrow-door`, with `obj:barrow-door`: a barrow on the moor, the entrance to `inst:varric-barrow`

**Elsewhere:**
- `landmark:lodge-hunters-lodge`: Maren at night (Hollis Lodge)
- `landmark:thorn-briar-cottage`: Nan Briar (Thornhollow)
- `landmark:gloam-wolf-tracks`, with `obj:gloam-wolf-tracks`: Gloamwood, on the path from Brindlecross
- `landmark:gloam-stag-glade`, with `obj:gloam-stag-glade`: the White Stag's glade, beside `ws:glade`
- `landmark:shore-ferry-house` and `obj:shore-ferry-rail`: Tamsin (Abbeyshore)
- `landmark:shore-boat` and `obj:shore-boat`: Aldous's boat at Abbeyshore
- `landmark:shore-reed-bed` and `obj:shore-reed-bed`: the mouth of the Wend
- `obj:abbey-clapper`: the altar of the drowned nave (Drowned Abbey interior)
- `landmark:road-bandit-camp`: Morvane Road, past the Old Coach Inn

## For Claude 3
- **Shops:** `shop:nan-briar`, `shop:odo`, `shop:wil`, `shop:pell`, `shop:corwin` (NpcDef.shop). The dialogue sets `shop.open = <npc id>`. Prices: `trustPrice(npcId)`.
- **Quest items that pass through the hero:** `i_tear` (given then taken by Nan) and `i_clapper` (given then taken at the Eve), via quest:reward `hcItems` and quest:take-item.
- **Kills used:** `bx_wolf`, `bx_hollowed` and `bx_hollowmilitia` (as `bx_hollow*`), `bx_bandit`, `bx_mags`, `bx_alpha`, `bx_slimeking`. HC kills match on `enemy:killed.creature`.
