# The Hollow Crown: world design

Owner: **Claude 2**. Status: **v3, 2026-10-21**: built and placed for all 24 campaigns; Act II levels tuned to the measured player and frozen. §10 covers the campaign-order systems and §11 the world checks. Source: the Claude Design handoff (`Medieval Browser Action RPG/`: `tiles.js`, `realms.js`, `map.js`, `atlas.json`, `medival-tokens.json`). Where old Morvane lore and the handoff clash, the handoff wins (docs/REBUILD.md). This replaces `WORLD.md`.

---

## 1. Spaces

The world is a set of **spaces**. Each space is a separate tile map with its own coordinates, chunk cache and collision. Co-op players may be in different spaces at once; the authority simulates every space that has a player in it.

| Space id | What | Size (tiles) | Chunks |
|---|---|---|---|
| `realm:<school>` ×12 | One school realm per school: `realm:ash`, `realm:rime`, `realm:storm`, `realm:radiance`, `realm:umbral`, `realm:verdant`, `realm:blade`, `realm:iron`, `realm:fist`, `realm:hunt`, `realm:guile`, `realm:song` | 384 × 256 | 12 × 8 |
| `concordia` | Concordia: the Morvane continent from `map.js` (11 regions, 10 villages, the Heart) | 1728 × 1088 | 54 × 34 |
| `inst:<id>` | Interiors, dungeons and boss lairs | ≤ 128 × 128 | loaded whole |

Ids are namespaced on purpose. In `realms.js` the realm ids `ash` and `storm` collide with Morvane region ids, so realms are `realm:*` and Morvane regions are `region:*`.

**Coordinates:** tile = 32 px, chunk = 32 × 32 tiles, world px inside a space. A player's location is `{ space, x, y }` (world px).

## 2. Concordia (Morvane)

- **Scale:** `map.js` draws Morvane at 432 × 272 map px. **1 map px = 4 tiles**, so a region polygon point `(mx, my)` is world tile `(4·mx, 4·my)`.
- **Regions:** the 11 `map.js` regions with their polygons, palettes, level ranges and descriptions, as `region:<id>`: `region:frost` Frostmere Pass, `region:heart` Heart of Morvane, `region:gilded` Gilded Ruins, `region:storm` Stormcliffs, `region:abbey` Drowned Abbey, `region:gloam` Gloamwood, `region:briar` Briar Hollow, `region:ash` Ashfall Kiln, `region:alder` Aldermoor, `region:road` Morvane Road, `region:marsh` Morvane Marsh.
- **Region at a tile:** even-odd point-in-polygon on `(tx/4, ty/4)`, first match in `map.js` order; the ocean otherwise.
- **Villages:** the 10 `map.js` villages (`vil:brind` Brindlecross, `vil:thorn`, `vil:lodge`, `vil:coach`, `vil:warden`, `vil:kiln`, `vil:shore`, `vil:ford`, `vil:gild`, `vil:cliff`). A village close-up is 768 × 448 px, which is **exactly 24 × 14 tiles**. The in-world village *is* the close-up: its crossroads autotile, `vilLayout()` places and decor are stamped into the world as an overlay centred on the village's map position × 4. The map screen's village view and the world therefore always agree.
- **Waystones:** the 11 `map.js` waystones (`ws:brind`, `ws:road`, …) at map position × 4. `lit` in the handoff becomes "attuned by touch".
- **Roads and the river Wend:** the `map.js` polylines × 4, rasterised like the old routes (river = deep water with shallow banks, roads = path autotile).
- **Features** (mountains, gloam forest, swamp pools, Abbey lake, volcanoes, gilded pillars, storm cliffs, marsh lanterns, the Heart) become terrain and prop scatter rules per region.
- **Gates:** Concordia is Act II+ for every campaign. Its regions open by Claude 4's per-class flags; the Heart of Morvane stays sealed until the Act III flag.

## 3. School realms

Each realm (from `realms.js`) has a name, capital, landmark (`arch`: spire, hall, dome or tree), palette `C`, accent and the hue-shift rules `g`, `s`, `w`, `roof`.

### 3.1 Layout (384 × 256 tiles)

```
 x→ 0          128        192         256          383
 ┌────────────────────────────────────────────────────┐
 │  ▲ realm edge (cliffs / sea / ice by theme) ▲       │
 │        ┌────────┐   REALM GATE   ┌────────┐         │
 │        │ zone C2│   (centre-north│ zone F2│         │
 │ zone C1│        │   black tears) │        │ zone F1 │
 │   ┌────┴────────┤                ├────────┴───┐     │
 │   │  CAPITAL    │   crossroads   │  FRONTIER  │     │
 │   │ (west)      │ ────────────── │  (east)    │     │
 │   └────┬────────┤                ├────────┬───┘     │
 │ zone C3│ zone C4│    shared wilds│ zone F4│ zone F3 │
 │        └────────┘                └────────┘         │
 └────────────────────────────────────────────────────┘
```

- **Capital area** (west half): the capital village, stamped from the realm's capital close-up (recoloured tiles and buildings), and the realm landmark (`rl_<realm>`). This is the start area of the class Claude 4 assigned to the capital.
- **Frontier area** (east half): the other class's start area, with its own hub settlement and terrain theme.
- Each area has **4 quest zones** plus its hub. That's room for Act I's ~22 quests per class. Each area also has **3 boss lairs**, which are instances.
- **The realm gate** sits centre-north between the two areas. Black tears seep here, and Act II leaves the realm through it to Concordia. Both classes' Act I ends here.
- **Edges:** the realm is an island of land framed by impassable themed terrain (sea, cliffs, ice, lava), so a realm needs no gates of its own between areas. Area-to-area progress is gated by Claude 4's flags where a campaign needs it.

### 3.2 Start areas (ids are final; names are Claude 4's canon)

| Realm | Capital area (class) | Frontier area (class) |
|---|---|---|
| `realm:ash` Cinderreach | `area:ash-capital` Kilnhold · Great Kiln (Arcanist) | `area:ash-frontier` the Bleeding Fields (Reaver) |
| `realm:rime` Frostmere | `area:rime-capital` Glacierhome · Ice Spire (Rimecaller) | `area:rime-frontier` the Wardwall (Warden) |
| `realm:storm` Thunderreach | `area:storm-capital` Spirehold · Lightning Tower (Sparkwright) | `area:storm-frontier` the Thunderclap Heights (Stormlancer) |
| `realm:radiance` Solaria | `area:radiance-capital` Dawnspire · Sun Cathedral (Cantor) | `area:radiance-frontier` the Gilded March (Oathbound) |
| `realm:umbral` Nocturne | `area:umbral-capital` Duskmere · Moon Obelisk (Duskweaver) | `area:umbral-frontier` the Veilwarrens (Shade) |
| `realm:verdant` Wildheart | `area:verdant-capital` Rootholme · Elder Tree (Hedgewitch) | `area:verdant-frontier` the Thornwilds (Ranger) |
| `realm:blade` Steelvale | `area:blade-capital` Edgewater · Fencing Hall (Swordsman) | `area:blade-frontier` the Hushpine Terraces (Samurai) |
| `realm:iron` Ironhold | `area:iron-capital` Anvilgate · Fortress Forge (Knight) | `area:iron-frontier` the Deepworks (Juggernaut) |
| `realm:fist` Mountainreach | `area:fist-capital` Stonecloister · High Monastery (Monk) | `area:fist-frontier` the Lowfold Pits (Brawler) |
| `realm:hunt` the Greywilds | `area:hunt-capital` Antlerford · Great Lodge (Huntsman) | `area:hunt-frontier` the Hawkmoor (Falconer) |
| `realm:guile` Tidecourt | `area:guile-capital` Velvet Harbour · Thieves' Exchange (Jester) | `area:guile-frontier` Gallows Reef (Corsair) |
| `realm:song` Harmonia | `area:song-capital` Lyrehaven · Grand Opera (Bard) | `area:song-frontier` the Echoing Fells (Skald) |

Each realm also has `area:<realm>-gate` (the realm gate) and `ws:<realm>-capital`, `ws:<realm>-frontier` and `ws:<realm>-gate` waystones.

**Zones and lairs** follow the pattern `zone:<realm>-<capital|frontier>-<1..4>` and `inst:<realm>-<capital|frontier>-lair-<1..3>`. Claude 4 names them in the campaign data, and I place them.

## 4. Tiles, autotiles and art

- **Base art:** `tilesV2` village/forest/abbey sheets and the four 16-tile autotile sets (`v_path`, `v_water`, `f_path`, `d_flood`); 19 v2 buildings; 43 v2 props. All 32 px, pre-outlined, drawn at 1× only.
- **Realm recolour** (runtime, from `realms.js` `shift()`): per-pixel HSL rules (keep alpha 0, outlines `l<.13` and gold highlights; ground `g`, water `w`, other saturated colours to `roof`, the rest to stone `s`). It generates `r_<realm>_{grass_0,grass_1,grass_2,flowers,cobble,farm,floor,bridge,water}`, `r_<realm>_path_0..15`, `r_<realm>_well`, eight `rb_<realm>_*` buildings and the procedural landmark `rl_<realm>`. I extend the same shift to the tree, rock and hedge props, so realm wilds match.
- **Dual-grid autotiles:** terrain is stored on the **corner grid** (one value per tile corner). A tile's frame is `mask = TL·8 + TR·4 + BL·2 + BR` per terrain, with the priority water → path → base. A mask of 0 picks a base variant by hash; a mask of 15 is solid terrain. Tiles render offset by half a tile, which hides the corner grid.
- **Tile atlas per theme:** each space builds one runtime tileset (canvas) from its base or recoloured frames. A deterministic **tile registry** maps names to indices, so every client agrees without sending tiles over the network.
- **Depth:** buildings and props use origin (0.5, 1) and depth = `y + h − 4` (handoff rule). Actors sort on foot y.

## 5. Collision (Phaser-free)

The handoff has no collision data, so collision is defined here.

| Thing | Rule |
|---|---|
| Water | A tile blocks if ≥ 3 of its corners are water (bridges override) |
| Realm edge, cliffs, lava | Solid terrain classes |
| Buildings | Solid footprint = the lower 55% of the image, inset 4 px each side. The door is a gap at the bottom centre (24 px wide, interactable) |
| Castle wall / tower / gate | Full lower band solid; the gate's arch is a 40 px gap |
| Props | Per-prop footprint table (`src/world/hc/footprints.ts`): trees = trunk 12 × 8; well, cart, barrels = base box; fences, hedges = 8 px strip; flowers, ferns, mushrooms = none |
| Dungeon walls | `d_wall*` tiles solid |

The collision bitmask and `WorldQuery` (`moveAndCollide`, `raycast`, `findPath`) carry over from Phase 1 unchanged, so they work per space.

## 6. Lighting (handoff rule 3)

World → full-screen grade rect with **MULTIPLY** → radial glow sprites with **ADD** → damage numbers and bars. No blur, no postFX.

- **Grade by time of day:** day = no grade; dusk `#8a8ed6`; night `#5c5fb4` (interpolated through dawn and dusk). Interiors and dungeons use the vignette grades (forest `#a4aae8`, abbey `#b0b0ec`).
- **Glows:** one baked white radial-gradient texture, tinted and scaled. They come from building and prop `lights` (`[dx, dy, r, colour?]` from the image's top-left; default `#ffd36a` at alpha .38, .55 at night), plus lamps (`#ffb347`, r 90 × flicker `1 + sin(9t)·.04 + sin(23t)·.03`, alpha .42, plus a core of r 22 `#fff0b0` at .5) and realm landmarks (accent colour, r 40). Only glows inside the camera view (plus a margin) are live.

## 7. Map: Realms › Realm/Morvane › Village

- **Realms:** the `realms.js` ring (`mvrealm`). Concordia sits at the centre and the 12 realms around it. Your home realm is teal, Concordia is open once Act II starts, and the others show "???".
- **Morvane:** the `map.js` region map at 2× with fog clouds per unfound region, village markers, waystones (awake/asleep), quest marks, merchants and the hero. A region panel lists villages with a View button and shows the level band the hero meets there now (§10.2).
- **School realm map:** the same style, drawn from the realm's area and zone data in its palette, with the capital, frontier, gate, waystones, quest marks and merchants.
- **Instance map:** a lair's or cave's floor plan, with the way out, the boss arena, chests, finds, quest marks and you.
- **Show on map:** `ui:open { panel: 'map', focus: <place id> }` (from the Journal) opens the level holding that place and rings its mark.
- **Village close-ups:** `mvvil` views of the 10 Morvane villages and the 12 capitals, using `vilLayout()` place boxes and NPC pills. Talk jumps to the NPCs screen.
- **Fast travel:** attuned waystones within the current space, plus realm gates between spaces once Claude 4's flags allow it. Not in combat or in instances. The gold fare comes from `Services.economy`.

## 8. Multiplayer (REBUILD.md)

- **Deterministic:** tiles, chunks, overlays and collision are pure functions of the world seed, space and flags, and every client generates them itself. They are never in snapshots.
- **Authority-only:** spawn zones, doors, chests, levers, waystone attunement, region and landmark discovery (per player), and space transfers.
- **Object state** lives in `world.*` flags, which are replicated through `flag:changed`. Per-player fog lives in each player's own save.
- **Public realms** run the same pure modules headlessly on Node: `src/world/hc/*` must not import Phaser.

## 9. Code layout

| Folder | Contents | Phaser? |
|---|---|---|
| `src/world/hc/` | Space model, tile registry, recolour rules (pure maths), realm and Concordia generators, dual-grid autotile, footprints, collision, A*, spawns, objects, discovery | **No** |
| `src/world/render/` | Tile atlas baking (canvas recolour), chunk tilemaps (worker-generated, `ChunkFeed`), building and prop sprites, lighting layer, [F] prompts, NPC view, see-through props (`Occlusion`) | Yes |
| `src/scenes/WorldV2Scene.ts` | Wires sim (authority) and render (all clients) through `Services.net` (registered as `SceneKeys.World`) | Yes |
| `src/ui/map/` | Realms ring, Morvane map, realm and instance maps, village close-ups, minimap, quest marks, merchant glyphs | Yes |
| `src/data/regions/hc/` | 13 realm defs, Concordia regions, villages, waystones, area/zone/lair placements, campaign placement lists, generated band tables | No |
| `tools/playthrough/` | Node world checks (`checks.ts`, `suite.mjs`), band generators, walk exports, the pacing bot | Node |

The Phase 1 world was moved to `archive/medival-v1/`; nothing was deleted.

## 10. Campaign-order systems

### 10.1 Realm spawn bands
Spawn levels follow each campaign's quest order, not the zone number.
- **Generation:** `tools/playthrough/bands.ts gen` walks every class's Act I quests with A*, both on foot and with waystone fast travel. It writes `src/data/regions/hc/zoneBands.gen.ts`.
- **Groups:** a band group is a side's zone n with its roads, the gate road, or one optional area's approach.
- **Tiers:** each group has a list of tiers. A tier's floor is the expected level at that visit, `1 + 1.3 × (main − 1)`. The tier applies once Act I main `step` is done, by the side's class or by the host's class (`src/world/hc/bands.ts`).
- **Levels in a tier:** zones spawn at floor…floor+2 and patrols at floor+1…floor+2. Elites appear only from L8.
- **Off-route groups:** optional areas, which no walk passes, take the nearest zone's band +1.
- **Ruin caches** roll at their guarding pack's band in force.

### 10.2 Concordia bands
`tools/playthrough/concordiaBands.ts gen` writes `src/data/regions/hc/concordiaBands.gen.ts`: host class (the `campaign.class` flag) × Morvane region → tiers.
- **Expected level = the measured player.** Acts II–III use Claude 5's typical player (gear-curve sim, median of 5 seeds): the hero's level at the start of each quest, per class. The old linear model (L14→27 by mains done) lagged the real hero 2–3 levels mid-act.
- **Every quest is a step.** `ACT23_MAINS` lists every Act II/III quest in play order, sides included, because the measured hero climbs through them. A tier set by a visit applies once the quest before that visit is done. A skipped side's tier never applies, but the next one does (`bands.ts` takes the last tier whose step is done).
- **Floors:** the first visit's floor, rising at later visits, capped at L28 in Act II and L38 in Act III. The Heart keeps an L30 floor (Claude 1's rule).
- **Off-route ramp:** before a class's first visit, a region ramps with that class's hero at most `RAMP` = 5 over them (band tops +7). Before this, an L16 hero who strayed met L30 enemies next door. Regions visited earlier stay lower, so walking back is easier, never a wall.
- **Public realms** (no host class): L20; the Heart L30.
- **Guarded by** `bands-concordia` (`suite.mjs --full`): every Act II/III pass is ≤ expected +2, and every main quest ≥ expected −4.

### 10.2a Pinned hero levels and the deliberate rebase
- Claude 5 owns `tools/playthrough/out/hero-levels.json` (`node tools/e2e/sim/run.mjs hero-levels`) and may regenerate it at any time.
- The bands are built from, and checked against, a **pin**: `tools/playthrough/out/hero-levels.bands.json`. `walks.ts` reads the pin by default. So a new `hero-levels.json` never moves the check under bands built from the earlier one; that was the run12 deploy blocker.
- **Rebase deliberately**, once, when tuning is done:
  ```
  ENTRY=tools/playthrough/concordiaBands.ts OUT=<file> node tools/playthrough/build.mjs
  HERO_LEVELS=tools/playthrough/out/hero-levels.json node <file> gen
  ```
  `gen` copies the source into the pin. Then refresh the walk exports (`walks-export.ts both`) and `questBands.ts gen`, and run `suite.mjs --full`.
- **Feedback loop:** higher bands mean more XP, so the hero climbs a little. One rebase moved the Act II end ~0.8 levels; accept rather than iterate. The bands are frozen as of 2026-10-21.

### 10.2b Story instances per host
- The Sentinel lairs, Varric's barrow and the Drowned Abbey fight at the measured level each host class's hero enters them (first entry): `INSTANCE_BANDS` in `concordiaBands.gen.ts`, used by `spawns.ts lairZones`. For example, sentinel-storm is L22 for the storm pair, 25 for monk and 26 for falconer. Hosts that never enter keep the instance's own level.
- Lair waves shift with the band in force and keep their own mix. Boss levels stay Claude 3's.
- The 10 Morvane caves fight at their region's band per host; they were fixed at the old handoff levels, L8–27.
- Chests in all of these roll at the band in force: chest `band` prop → `interact.ts chestLevel` → `zoneTopNow`.
- **Guarded by** `bands-concordia` (the walks enter them) and `loot`.

### 10.3 Class story objects
Each class's story objects are usable only in that class's own campaign. Gating is derived from the quest data (`src/world/hc/classGate.ts`, `classObjects.gen.ts`). Other hosts see the objects, but they are inert.

### 10.4 Quest marks
Claude 4's `questMarkers()` (`src/narrative/client/markers.ts`) lists the open objectives as place ids. `src/world/hc/questPlaces.ts` resolves each place for display:
- **Objects, landmarks, zones, areas (including `area:<S>-gate`), regions and villages:** the marker index, via `markerPeek`, so a frame never builds the cold full index.
- **A piece inside a lair, cave or the citadel:** the instance's door when the hero is outside, and the piece itself once inside.
- **`inst:<lair>` asked from inside that lair:** its boss arena. Lair-boss kill objectives point at their lair (`bossLair()` in `instanceGen.ts`).
- **`npc:<id>`:** the NPC entity where it stands, else its scheduled landmark.

`markerAt` stays exact, because story fights spawn there. The authority warms the marker index one space per quiet tick, starting with the first player's space.

How marks are drawn:
- the tracked quest is gold, with an edge arrow on the minimap when off the window and a pulsing ring on the map;
- other quests are teal.

### 10.5 Merchants
Every capital has a smith (with a Runeforge) and a trader, and every frontier has a pedlar. Claude 3 defines the shops and Claude 4 the NPCs.
- **Village landmarks** stand at each building's door (`villageDoorRects`), so village NPCs no longer stack on the village centre.
- **Distance:** capital merchants are 8–12 tiles from the capital waystone.
- **NPCs on a set-piece landmark** stand on the nearest walkable tile in front of its prop (`onGround` in `npcs.ts`).
- **`WorldService.npcPos(npcId)`** (authority, `npcWhere`) gives where an NPC stands now. Shop and Runeforge actions need the hero within 96 px of the merchant.

### 10.6 Loot tables
Claude 3's tables (`src/data/items/hc/lootTables.ts`) roll on top of the usual chest loot, through a chest's `loot` prop:

| Chests | Table |
|---|---|
| Realm ruin caches | `tbl:<school>-ruin` |
| Realm cave finales | `tbl:<school>-cave` |
| Morvane ruin caches / cave finales | `tbl:morvane-ruin` / `tbl:morvane-cave` |
| First side-room chest of a lair or cave | `tbl:lair-rare` |
| The citadel's side rooms | `tbl:heart-cache` |

Bosses roll their own tables; boss triggers carry no `loot` prop.

### 10.7 See-through props and prompts
- **See-through props:** tall props drawn over the local hero fade to 0.45 and ease back once the hero is clear (`src/world/render/Occlusion.ts`, testing the 3×3 chunks round the hero).
- **Used search objects:** once an active objective has counted an object, its prompt says "Already searched" or "Already read", dimmed (Claude 4's `objectUsed`).

### 10.8 Quest bands (for quest XP)
- `src/data/regions/hc/questBands.ts` is generated by `tools/playthrough/questBands.ts gen` from the walk exports. It is pure data, with no imports, because the sim on the realm server reads it.
- `QUEST_BANDS[quest]` = `[lo, hi]`, the median band in force over the zones the quest's walk passes and the lairs it enters (median across classes for shared quests). It is `null` where the walk meets no fights; those quests stay unscaled. Claude 3's `questXpMult` scales quest XP toward it.
- `QUEST_ACT[quest]` = 1 | 2 | 3: the quest's own `act`, else the act whose walk lists it. It feeds Claude 3's per-class Act II XP table.
- Regenerate after any band change.
- **Guarded by** `quest-bands`: every quest has a band entry and an act, and no entry names a missing quest.

### 10.9 Map labels and place names
- **Label placement** is one pure function, `src/ui/map/labelSpot.ts pickLabelSpot`. It picks the nearest free spot among candidates (beside, above, below, diagonals, further rows), clear of markers, the hero, other labels and roads. `MapLabels` draws with it.
- **Tracked quest label:** the tracked quest's mark is labelled with its place's name (NPC, landmark, object or door: `questMarks.ts placeLabel`). Zones, areas and regions are labelled by the map already.
- **Place names follow the quest text:**
  - Realm set-piece names come from their ids (`setPieces.ts title`). Small words stay lowercase ("Hall of Held Hours"), and possessives are spelled as the quests spell them (`POSSESSIVE`, e.g. "Keepers’ Lodge").
  - Concordia set pieces have explicit names (`concordiaPlaces.ts PIECE_NAMES`).
  - Waystones are named as the quests call them ("The Heart Camp", "Abbeyshore").
  - Names use the typographic ’.
- **Guarded by** `labels`, which replays the placement in Node for 12 realms and Morvane with every optional area found: 0 labels on a marker or another label.
- **Guarded by** `names`: every place phrase in quest, journal and dialogue text ("to the X", "at X"…) that names a map place matches the map's name exactly, or differs only in case.
  - Case-only is the documented **common-noun form**: prose may lowercase a generic word, as in "the Heart camp" for The Heart Camp.
  - A multi-word phrase one or two letters off a map name, or with a space moved ("Abbey Shore" for Abbeyshore), fails.
  - Deliberate exceptions go in `names.ts ALLOW`.

## 11. World checks

`node tools/playthrough/suite.mjs` runs the fast set (12 checks) in about 30 s and exits 1 on any failure. It is part of the pre-deploy check. Each check also runs alone:

`ENTRY=tools/playthrough/checks.ts OUT=<file> node tools/playthrough/build.mjs && node <file> <check>`

| Check | What must hold |
|---|---|
| `unplaced` | Every place and object id in the hc quests and dialogues exists in the world |
| `pieces` | Every set piece is placed, with no placement warnings and no retired ids |
| `instances` | Every instance builds; side rooms and objects are reachable from the entrance |
| `bands` | Every Act I walk is within expected +2; hosts of other classes step sides up with their own progress |
| `class-objects` | Each class sees only its own story objects, and all of them |
| `clearance` | Bodies fit their arenas, lair corridors and story markers |
| `merchants` | Runeforges, capital smiths and traders, and frontier pedlars stand by their waystone; every shop merchant resolves through `npcPos` |
| `loot` | Every chest `loot` id is a known table, and every rare chest has one |
| `labels` | Realm and Morvane map labels, all optional areas found, sit clear of markers and each other |
| `quest-bands` | Every quest has a `QUEST_BANDS` entry and a `QUEST_ACT`; no entry names a missing quest |
| `names` | Place phrases in the quest, journal and dialogue text match the map's names: exact or a common-noun (case-only) form; no near-miss |
| `reach` | Walking from where a hero starts (a realm's two start waystones, Concordia's Gate Circle, an instance's entrance), a hero body (r12) reaches every quest objective place of all 24 campaigns, every NPC spot (on open ground), every chest and search object, every waystone and door; fast travel and doors land on reached open ground; every escort has a walk from a start spot of its NPC to its destination |
| `bands-concordia` (`--full` only, ~6 min) | Against the pinned hero levels, every Act II/III pass is ≤ expected +2 and every main quest ≥ expected −4 (covers the story-instance bands the walks enter) |
