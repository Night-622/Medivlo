# The Hollow Crown: world design

Owner: **Claude 2** (`medival-12`). Status: **Foundation draft v1**. Source: the Claude Design handoff (`Medieval Browser Action RPG/`: `tiles.js`, `realms.js`, `map.js`, `atlas.json`, `medival-tokens.json`). Where old Morvane lore and the handoff clash, the handoff wins (docs/REBUILD.md). This replaces `WORLD.md`.

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
- **Morvane:** the `map.js` region map at 2× with fog clouds per unfound region, village markers, waystones (awake/asleep), quest markers and the hero. A region panel lists villages with a View button.
- **School realm map:** the same style, drawn from the realm's area and zone data in its palette, with the capital, frontier, gate and waystones.
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
| `src/world/render/` | Tile atlas baking (canvas recolour), chunk tilemaps, building and prop sprites, lighting layer | Yes |
| `src/scenes/WorldScene.ts` | Wires sim (authority) and render (all clients) through `Services.net` | Yes |
| `src/ui/map/` | Realms ring, Morvane map, realm maps, village close-ups, minimap | Yes |
| `src/data/regions/hc/` | 13 realm defs, Concordia regions, villages, waystones, area/zone/lair placements | No |

The Phase 1 world (`src/world/*.ts` and the old Morvane data) stays until the new WorldScene replaces it, then is deleted.
