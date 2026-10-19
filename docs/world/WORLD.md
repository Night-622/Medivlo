# WORLD: Morvane (continent, travel, chunks, and the prologue region)

Owner: **Claude 2** (`medival-8a`). Status: **Phase 0, v2**. Region names, ids, factions and history are **canon from Claude 4** (`docs/lore/`, see `09-regions.md`). Layout, size, biomes, travel and tech are Claude 2's. Names marked † are Claude 2 placeholders that Claude 4 may rename.

Agreed with Claude 3: tier → level bands, the spawn-table format, the Phase 1 enemy ids, the clock, and the collision query API.

---

## 1. The continent of Morvane

Setting: early **1187 YL**, the Long Winter, one year after the Night of Falling Ash.

### 1.1 Scale

| Unit | Size |
|---|---|
| Tile | 32 × 32 px |
| Chunk | 32 × 32 tiles = 1024 × 1024 px |
| World | **64 × 48 chunks** = 2048 × 1536 tiles = 65 536 × 49 152 px |
| Region cell (sketch below) | 4 × 4 chunks |

Walking about 5 tiles/s, a straight-line crossing takes around 7 minutes. Rivers, mountains, tier walls and side content stretch a real crossing to hours. The world size is a single constant (`WORLD_CHUNKS_W/H` in `src/world/constants.ts`), so it can grow later.

### 1.2 Sketch (1 character = 4 × 4 chunks, north is up)

```
   col: 0 1 2 3 4 5 6 7 8 9 A B C D E F
 row 0  ~ ~ ~ F F F F F F F F F F ~ ~ ~     ~  sea (ship only)
     1  ~ ~ F F F F F F F F F F F F ~ ~     F  Frostreach           T4
     2  ~ ~ S I I I I I I I I I I I ~ ~     I  Ironspine            T3
     3  P ~ S I I I I I I I I I I C ~ ~     O  Ironspine Foothills  T2
     4  P ~ S Y Y O O O O O O O C C C ~     Y  Ylwen Deepwood       T3
     5  ~ ~ S Y Y K K K K O O M M C C ~     K  Kingsvale            T2
     6  P ~ S Y Y K K K K G G M M C C ~     W  Witherdowns          T2
     7  P ~ S W W W A A A G G M M C C ~     A  Aldermoor (start)    T1
     8  ~ ~ ~ W W W A A A G G G C C C ~     G  Greywater Marsh      T2
     9  ~ ~ L L L L L U U U U C C C ~ ~     M  Mirelands            T5
    10  ~ ~ ~ L L L L U U U U C C ~ ~ ~     C  Cinder Wastes        T4
    11  ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~     U  Sunscar              T3
                                            L  Lantern Coast        T3
                                            S  Saltreach Coast      T2
                                            P  Saltreach Isles      T3
                                            (Heartforge: T5 instance beneath the Ironspine)
```

Key places by cell (col,row):
- **Kingsvale.** Haldren (6,5). Cinderhold, on a crag (8,5).
- **Aldermoor.** Brindlecross (7,7).
- **Greywater Marsh.** Varn, on the west edge (9,7). The Black Seep (10,8).
- **Witherdowns.** Ossuary of Saint Calder (4,8). The King-Barrows (3,7).
- **Saltreach Coast.** Brackhaven (2,6).
- **Ironspine Foothills.** Dun Korrath-Gate (7,4).
- **Ironspine.** Korrath-under-Stone (7,2). Vault of the Nine Nails (10,2), which is also the Heartforge entrance.
- **Ylwen Deepwood.** Caer Ylwen (3,5). Ys Aerwen, sunken in a lake (4,6).
- **Frostreach.** Skelvik, on a fjord (2,1). The Wolf-Moot stones (9,0).
- **Lantern Coast.** Solenne (4,9). Valcastre (6,10).
- **Sunscar.** Zahrun (8,10).
- **Cinder Wastes.** Ruins of Qadir (13,8).
- **Saltreach Isles.** Corsair holds and the tide-temples of Saela.

Major routes:
- **River Hald†.** Rises in the Ironspine (6,2), runs past Haldren and reaches the sea at Brackhaven.
- **The Brindle†.** A stream from Wennamere through Brindlecross that joins the Grey.
- **River Grey†.** Runs from the Foothills into Greywater Marsh.
- **King's Way†.** Brackhaven, Haldren, Dun Korrath-Gate.
- **South Road†.** Haldren, Brindlecross, Solenne.
- **Varn Causeway†.** Brindlecross east to Varn.
- **Ash Road†.** Varn, Zahrun, Qadir.

### 1.3 Regions

Every chunk belongs to exactly one region (§3.2). Region borders blend over about 8 tiles using noise.

| Id | Name | Tier | Act | Biome | Controlled by | Neighbours | Gate |
|---|---|---|---|---|---|---|---|
| `region:aldermoor` | Aldermoor | 1 | Prologue | moor, temperate-forest | Crown (nominal), Lanternate chapel | Kingsvale, Witherdowns, Greywater, Lantern Coast, Sunscar | Valley exits: `prologue.complete` |
| `region:greywater-marsh` | Greywater Marsh | 2 | I | marsh | Drowned Choir (de facto) | Aldermoor, Kingsvale, Foothills, Mirelands, Cinder Wastes, Sunscar | Varn's flood-gates: `act1.varn_assault` |
| `region:kingsvale` | The Kingsvale | 2 | I | farmland, plains | Crown of Haldmarch | Ylwen, Foothills, Greywater, Aldermoor, Witherdowns | — |
| `region:witherdowns` | The Witherdowns | 2 | I | downs | Grey Monks of Morrow | Ylwen, Kingsvale, Aldermoor, Lantern Coast | — |
| `region:saltreach-coast` | Saltreach Coast | 2 | I | coast, beach | Salt League | Ironspine, Ylwen, Witherdowns (cliffs), Isles (ship) | — |
| `region:ironspine-foothills` | Ironspine Foothills | 2 | I | alpine (low), plains | Iron Concord | Ironspine, Ylwen, Kingsvale, Greywater, Mirelands, Cinder Wastes | — |
| `region:ylwen-deepwood` | Ylwen Deepwood | 3 | I late | old-growth | Thornwise Circle, Aelthi | Saltreach Coast, Ironspine, Foothills, Kingsvale, Witherdowns | Sealed: `act1.ylwen_pact` |
| `region:ironspine` | The Ironspine | 3 | I late / II | alpine, cavern | Iron Concord | Frostreach, Saltreach Coast, Ylwen, Foothills, Cinder Wastes | Passes: `act1.korrath_gate_open` |
| `region:sunscar` | Sunscar | 3 | II | desert, canyon | Qasiri caravans | Aldermoor, Greywater, Cinder Wastes, Lantern Coast | Soft (T3 heat), no hard gate |
| `region:lantern-coast` | The Lantern Coast | 3 | II | coast, farmland (snowed) | Lanternate / Solenne Empire | Witherdowns, Aldermoor, Sunscar | Border posts: `act1.complete` |
| `region:saltreach-isles` | Saltreach Isles | 3 | II | island | Salt League | Saltreach Coast (ship) | `act2.ship_passage` |
| `region:frostreach` | The Frostreach | 4 | II | tundra, glacier | Hrothi Wolf-Moot | Ironspine | Pass: `act2.northpass_open` |
| `region:cinder-wastes` | The Cinder Wastes | 4 | II | ash-desert | Unclaimed (the Ashen Creed hides here) | Ironspine, Foothills, Mirelands, Greywater, Sunscar | `act2.ashroad_known` |
| `region:mirelands` | The Mirelands (Hollow Sea) | 5 | III | mirelands | — | Foothills, Greywater, Cinder Wastes | `act3.breach_open` |
| `region:heartforge` | The Heartforge | 5 | III | instance (dungeon) | — | Below the Vault of the Nine Nails | `act3.heartforge_unsealed` |

**Danger tiers and enemy levels** (agreed with Claude 3; the level cap is 40):

| Tier | Level band | Elite chance (rolled by Claude 3) |
|---|---|---|
| T1 | 1–6 | 2% |
| T2 | 6–12 | 5% |
| T3 | 12–20 | 8% |
| T4 | 20–30 | 12% |
| T5 | 30–40 | 16% |

Inside a region, danger rises with distance from its roads and towns (`innerTierBonus`, 0 to 1, which adds up to half a band).

### 1.4 World-wide visual hooks (the state of the world)

- **The Long Winter.** Every region has a frost factor that drives snow scatter and frosted tile variants. That includes the south, where snow is unheard of. The Frostreach has glaciers advancing on flags (Act II).
- **Ember-veins (leys).** Routes of kind `ley` are rendered as glowing veins in rock and ruins near magical sites. They are decoration only, with no collision. They can dim on flags.
- **Mire seeps.** Black tar pools with pale reeds, defined as `SeepDef`s (§4.3). A seep exists while `world.mire_level >= seep.minLevel`. The level runs from 0 to 5 and is set by Claude 4's story. Seeps spawn Unwrought and carry `HAZARD`. In Act III the Mirelands' border advances into Greywater using the same mechanism.

### 1.5 Region definition (data shape)

File `src/data/regions/<id>.ts`, typed against `RegionDef` in `src/core/types.ts` (requested from Claude 1).

```ts
interface RegionDef {
  id: `region:${string}`;
  name: string;
  tier: 1 | 2 | 3 | 4 | 5;
  innerTierBonus: number;            // 0..1
  biome: BiomeId;
  subBiomes?: { biome: BiomeId; weight: number }[];
  frost: number;                     // 0..1 snow/frost factor
  mapColor: number;
  music?: string; ambience?: string; // phase 3
  landmarks: LandmarkDef[];
  spawnZones: SpawnZone[];
  seeps?: SeepDef[];
  overlays: string[];                // overlay ids (§3.4)
  waystones?: string[];              // phase 2
  gate?: FlagCond;                   // region-level hard gate (informational; actual walls are overlays)
  faction?: `faction:${string}`;     // Claude 4
  codexEntry?: `lore:${string}`;     // Claude 4
}
interface LandmarkDef {
  id: `landmark:${string}`;
  name: string;
  at: [number, number];              // world tiles (instance tiles if inside an instance)
  discoverRadius: number;            // tiles
  icon: 'village' | 'city' | 'dungeon' | 'ruin' | 'shrine' | 'camp' | 'den' | 'poi' | 'waystone';
  instance?: `instance:${string}`;   // if this landmark lives inside an instance
}
```

---

## 2. Travel

### 2.1 Movement modifiers

| Surface | Effect |
|---|---|
| Road / paving | +15% speed. Wild spawns are suppressed within 4 tiles (`NO_SPAWN`). |
| Grass / dirt / sand / moor | Normal speed |
| Marsh / shallow water / deep snow / mire seep edge | −40% speed (`SLOW`) |
| Deep water / cliff / tor / dense thicket | Impassable. Crossable only at bridges and fords, or by ship. |

### 2.2 Routes (`src/data/regions/routes.ts`)

```ts
interface RouteDef {
  id: string;
  kind: 'road' | 'old-road' | 'track' | 'river' | 'stream' | 'ley';
  width: number;              // tiles (road 3, track 2, river 4–8, stream 2, ley 1)
  points: [number, number][]; // world tiles; jittered by noise at generation time
  when?: FlagCond;            // e.g. Ash Road only revealed after act2.ashroad_known
}
```

A bridge is generated automatically wherever a road crosses a river. A ford is an explicit overlay.

### 2.3 Gates

There are two kinds of gate. A **soft gate** is a danger tier: signposts, a warning NPC, tougher enemies. A **hard gate** is collision that opens on a flag or a key item. Hard gates are used only for story beats. Openness is the default.

| Gate | Where | Type | Opens on (Claude 4's flags) |
|---|---|---|---|
| Aldermoor valley exits (north, east and south road gaps) | Aldermoor edge | Hard: fallen trees, a reeve's barricade, snowdrift† | `prologue.complete` (the south road also needs `act1.complete`) |
| Varn flood-gates | Varn, Greywater | Hard: the ruined town can't be entered | `act1.varn_assault` |
| Ylwen hedge-ward | Ylwen borders | Hard: living thorn wall | `act1.ylwen_pact` |
| Dun Korrath-Gate | Foothills → Ironspine | Hard: Orrun gate | `act1.korrath_gate_open` |
| Lantern March border posts | Into the Lantern Coast | Hard: imperial border | `act1.complete` |
| Brackhaven docks | Saltreach Coast → Isles | Hard: ship | `act2.ship_passage` |
| North pass | Ironspine → Frostreach | Hard: snowed in | `act2.northpass_open` |
| Ash Road | Into the Cinder Wastes | Hard at the canyon mouths; soft (T4) elsewhere | `act2.ashroad_known` |
| The Breach | Greywater / Foothills → Mirelands | Hard | `act3.breach_open` |
| Nine Nails seal | Vault of the Nine Nails → Heartforge | Hard | `act3.heartforge_unsealed` |
| Sunscar border | — | Soft (T3) | — |

### 2.4 Fast travel (Phase 2)

- **Waystones** are unlocked by touch and work from the world map, waystone to waystone. You can't fast travel in combat or inside an instance.
- **Ships**: Brackhaven ⇄ the Isles' harbours (after `act2.ship_passage`). Skelvik ⇄ Brackhaven is optional, Act II.

### 2.5 Discovery

- A chunk is **discovered** when the player is within 1 chunk of it. This is the world map's fog of war.
- A landmark **emits `landmark:discovered`** the first time the player is within its `discoverRadius`. After that, `landmark:entered` and `landmark:left` fire every time.
- `region:entered` fires when the player crosses a region border, and shows the region's name banner.

---

## 3. Chunks

### 3.1 Coordinates

- **World tile** `(tx, ty)`: global integers, top-left origin, `0 ≤ tx < 2048`, `0 ≤ ty < 1536`.
- **Chunk** `(cx, cy) = (floor(tx/32), floor(ty/32))`, keyed by the string `"cx,cy"`.
- **Local tile** `(lx, ly) = (tx mod 32, ty mod 32)`, index `ly * 32 + lx`.
- **World pixels** = tiles × 32. Entities store positions in world pixels.

### 3.2 World layout data (`src/data/regions/world-layout.ts`)

- A 64 × 48 grid of region codes, one per chunk, in the same letters as the sketch but at chunk resolution, plus `elevation` and `moisture` biases per region.
- A **single fixed `worldSeed`**, so every player gets the same Morvane. Per-save seeds are possible later.

### 3.3 Procedural pipeline

Generation is deterministic: `chunkSeed = hash32(worldSeed, cx, cy)`. Procedural chunks are never saved; only object state is (§4.4).

1. **Region per tile**: the chunk's region, with a noise-warped blend toward its neighbours' regions.
2. **Fields**: seeded 2D simplex noise (`src/world/noise.ts`, no dependency) for elevation, moisture, detail and frost. It is sampled in world coordinates, so the fields are continuous across chunk borders.
3. **Biome terrain**: each biome's palette maps (elevation, moisture) to base tiles. Bands: water below 0.28, then sand or mud, then grass, snow or ash, then rock, with cliff above 0.8. Frost swaps in frosted variants.
4. **Routes**: rivers (with banks) first, then roads, then ley-veins. Bridges are added automatically.
5. **Overlays**: stamped wherever they intersect the chunk (§3.4). `-1` means keep the procedural tile.
6. **Autotile**: edge transitions using 4-bit masks. The neighbour ring comes from the same deterministic fields, so this step never waits on another chunk.
7. **Scatter**: seeded trees, rocks, bushes and snow drifts by biome density. Scatter is skipped on roads, water, overlay `noScatter` masks and within 2 tiles of objects.
8. **Collision**: tile-property bits ORed with the overlay's explicit collision.
9. **Objects**: overlay objects, spawn zones and seeps, filtered by flags (§4.3).

The budget is 3 ms or less per chunk on the main thread in Phase 1. If it goes over, it moves to a Web Worker in Phase 2.

### 3.4 Handcrafted overlays (`src/data/regions/overlays/<id>.json`)

```jsonc
{
  "id": "overlay:brindlecross",
  "origin": [944, 1016],           // world tile, top-left
  "size": [48, 40],
  "encoding": "rle",               // [[tileIndex, count], ...], row-major; -1 = keep procedural
  "layers": { "ground": [...], "detail": [...], "deco": [...], "overhead": [...] },
  "collision": [[0, 1800], [1, 6], ...],   // optional, ORed with tile bits
  "noScatter": true,
  "objects": [
    { "id": "obj:remembrance-pyre", "kind": "interactable", "at": [24, 18] },
    { "id": "obj:guttered-candle-door", "kind": "door", "at": [10, 8],
      "props": { "target": "instance:guttered-candle", "entrance": "front" } },
    { "id": "npc-anchor:brother-anselm", "kind": "npc-anchor", "at": [34, 12], "props": { "npc": "npc:brother-anselm" } }
  ],
  "variants": [
    { "when": { "flag": "prologue.complete" }, "layers": { "deco": [...] }, "collision": [...] }
  ]
}
```

**Variants** are layer and collision patches applied while a condition holds. That's how the mere drains, barricades vanish, and Varn's flood-gates open. Overlays are written by hand or with a small script in Phase 1. If we add a Tiled pipeline later, it exports to this same format.

### 3.5 Runtime chunk

```ts
interface ChunkData {
  cx: number; cy: number;
  region: `region:${string}`;
  ground: Uint16Array; detail: Uint16Array; deco: Uint16Array; overhead: Uint16Array; // 1024 each
  collision: Uint8Array;   // 1024 bitmasks (§4.2)
  objects: WorldObject[];  // resolved for current flags
}
```

Each chunk is one `Phaser.Tilemaps.Tilemap` with 4 layers, placed at `(cx*1024, cy*1024)`. The tileset is one atlas, generated at boot by `src/world/tileset.ts` using the placeholder helpers in Phases 1 and 2.

### 3.6 Streaming

- **Active radius R = 2.** The 5 × 5 chunks around the player are built and rendered. That's 5120 px, enough for 1920 × 1080 at zoom ≥ 1.
- **Unload radius R + 1**, with hysteresis.
- **LRU cache of 64 `ChunkData`.** When a chunk leaves range, its tilemap is destroyed but its data is kept.
- **Load queue**: nearest chunks first, weighted toward the direction of travel. At most one chunk is generated per frame, plus one tilemap built per frame.
- **Despawning**: enemies in an unloaded chunk get `enemy:despawn`. Zone counters persist in memory.
- **Events**: `chunk:loaded` and `chunk:unloaded` (`{ cx, cy }`).

### 3.7 Instances (interiors and dungeons)

```ts
interface InstanceDef {
  id: `instance:${string}`;
  kind: 'interior' | 'dungeon';
  name: string;
  tier: 1 | 2 | 3 | 4 | 5;
  biome: BiomeId;
  floors: InstanceFloor[];
  exit: { overworld: [number, number] };
}
interface InstanceFloor {
  id: string;
  source: { overlay: string }
        | { generator: 'bsp-rooms'; rooms: [number, number]; vaults?: string[] };
  spawnZones: SpawnZone[];
  landmarks?: LandmarkDef[];
  entrances: Record<string, [number, number]>;
}
```

- Instances are at most 128 × 128 tiles and load whole into `WorldInstanceScene`, with no streaming.
- A `door` saves the overworld position, fades out, starts the instance scene with `{ instanceId, floorId, entrance }` and emits `instance:entered`. Leaving emits `instance:exited`.
- The Heartforge is a multi-floor T5 instance.

---

## 4. Layers, collision, and world state

### 4.1 Render layers and depth

| Depth | Layer | Contents |
|---|---|---|
| 0 | `ground` | Grass, dirt, water, floors |
| 1 | `detail` | Paths, transitions, ley-veins, frost |
| 2 | `deco` | Rocks, tree trunks, fences, low walls |
| 10 + y | entities | Player, NPCs, enemies, loot, sorted by foot y |
| 1e6 | `overhead` | Canopies and roofs. These fade to 35% alpha while the player is underneath. |
| 2e6+ | weather, lighting | Snowfall (always on, light), and from Phase 2 a day/night tint |

### 4.2 Collision

One `Uint8` per tile:

| Bit | Value | Name | Meaning |
|---|---|---|---|
| 0 | 1 | `SOLID` | Blocks walking and projectiles |
| 1 | 2 | `WATER` | Blocks walking, but not projectiles |
| 2 | 4 | `BLOCK_PROJECTILE` | Blocks projectiles only |
| 3 | 8 | `BLOCK_SIGHT` | Blocks AI line of sight |
| 4 | 16 | `SLOW` | ×0.6 movement |
| 5 | 32 | `HAZARD` | Damage tick (mire seep, poison bog, lava); the amount is a tile property |
| 6 | 64 | `NO_SPAWN` | No wild spawns here |
| 7 | 128 | reserved | — |

- **Entity vs. world**: a per-axis AABB-vs-grid resolver in `src/world/collision.ts`, using a foot hitbox of about 20 × 12 px. Arcade tile collision isn't used.
- **Entity vs. entity**: Phaser Arcade bodies, Claude 3's.
- **`WorldQuery`**: the interface lives in `src/core` and the implementation in `src/world`.

```ts
interface WorldQuery {
  tileAt(tx: number, ty: number): { collision: number; region: string } | null; // null = not loaded
  isWalkable(tx: number, ty: number): boolean;
  raycast(x0: number, y0: number, x1: number, y1: number, mask: number): { hit: boolean; x: number; y: number }; // world px
  findPath(from: [number, number], to: [number, number], maxNodes?: number): [number, number][] | null;       // A*, loaded chunks only
  moveAndCollide(x: number, y: number, dx: number, dy: number, w: number, h: number): { x: number; y: number }; // resolver
  regionAt(tx: number, ty: number): string;
  biomeAt(tx: number, ty: number): BiomeId;
  timeOfDay(): { hour: number; phase: 'dawn' | 'day' | 'dusk' | 'night' };
}
```

Use `SOLID|BLOCK_SIGHT` for line of sight and `SOLID|BLOCK_PROJECTILE` for projectiles.

### 4.3 World objects, flags, and seeps

```ts
type FlagCond =
  | { flag: string }                                       // truthy
  | { flag: string; op: '==' | '!=' | '>=' | '<='; value: boolean | number | string }
  | { all: FlagCond[] } | { any: FlagCond[] } | { not: FlagCond };

interface WorldObject {
  id: string;                     // globally unique, stable (it's the save key)
  kind: 'door' | 'chest' | 'sign' | 'lore' | 'npc-anchor' | 'waystone' | 'campfire' | 'lever' | 'interactable'
      | 'gate' | 'resource' | 'trigger' | 'spawn-zone';
  at: [number, number];
  size?: [number, number];
  when?: FlagCond;
  props?: Record<string, string | number | boolean>;
}

interface SeepDef { id: string; at: [number, number]; radius: number; minLevel: number; spawnTable?: `spawn:${string}` }
```

- **Re-evaluation.** On `flag:changed`, the chunk manager re-checks `when` for objects, variants and seeps in loaded chunks. Gates appear or vanish, and collision updates immediately.
- **Flag namespaces.**
  - Story flags `prologue.*`, `act1.*`, `act2.*`, `act3.*`, plus `world.mire_level`, are set by Claude 4.
  - Mechanical flags `world.*` (for example `world.lever.<id>`, `world.chest.<id>`) are set by Claude 2.
  - `sys.*` flags are set by Claude 3.
  - Anyone may read any flag.
- **Object ownership.**
  - Claude 2 places every object. Claude 2 also handles door, gate, lever, waystone and trigger.
  - `chest` and `resource` carry Claude 3 ids (`lootTable`, `resource`).
  - `sign`, `lore`, `npc-anchor` and `interactable` carry Claude 4 ids (`codex`, `npc`). An interactable just emits `interact`, and Claude 4's quest logic reacts to it, for example `obj:giants-sluice-wheel` or `obj:remembrance-pyre`.

### 4.4 GameState world slice (requested from Claude 1)

```ts
interface WorldState {
  location: { instance: 'overworld' | `instance:${string}`; floor?: string; x: number; y: number; facing: 'n' | 'e' | 's' | 'w' };
  lastOverworld: { x: number; y: number };
  discoveredChunks: string;            // base64 bitset, 64×48 bits = 384 bytes
  discoveredLandmarks: string[];
  visitedRegions: string[];
  waystones: string[];
  objectState: Record<string, boolean | number | string>;
  clearedZones: Record<string, number>; // zoneId -> timestamp
  time: number;                         // in-game minutes since start
}
```

### 4.5 Spawn zones and tables (agreed with Claude 3)

Spawn tables live in `src/data/regions/spawns/`. The enemy definitions and loot belong to Claude 3.

```ts
interface SpawnTable { id: `spawn:${string}`; entries: SpawnEntry[] }
interface SpawnEntry {
  enemy: `enemy:${string}`;
  weight: number;
  level: [number, number];
  group: [number, number];
  time?: 'day' | 'night' | 'any';
  when?: FlagCond;
}
interface SpawnZone {
  id: string;
  table: `spawn:${string}`;
  area: { x: number; y: number; w: number; h: number };  // world tiles (or instance tiles)
  maxAlive: number;
  respawnSec: number;      // 0 = never (dungeons, bosses, one-off events)
  leash: number;           // Claude 3's AI leash
  eliteChance?: number;    // overrides the tier default
  when?: FlagCond;
}
```

How a spawn works:
1. The zone emits `enemy:spawn-request { enemyId, level, x, y, zoneId, tier }`.
2. Claude 3 spawns the enemy and rolls whether it's an elite.
3. Claude 3 emits `enemy:killed { enemyId, zoneId, x, y, level, family }` when it dies.
4. The zone updates its alive count and starts the respawn timer.

Fixed bosses are zones with `maxAlive: 1, respawnSec: 0` plus a `when` condition.

### 4.6 Biomes and time of day

**`BiomeId`:**
- Outdoor: `farmland`, `temperate-forest`, `old-growth`, `moor`, `marsh`, `plains`, `downs`, `coast`, `beach`, `alpine`, `cavern`, `tundra`, `glacier`, `desert`, `canyon`, `ash-desert`, `island`, `mirelands`.
- Interior: `dungeon-crypt`, `dungeon-mine`, `dungeon-ruin`, `interior`.

**`WorldClock`** (`src/world/WorldClock.ts`):
- One day lasts 24 real minutes, so one in-game hour is one minute. The clock pauses in menus and dialogue.
- Phases: dawn 5–7, day 7–18, dusk 18–20, night 20–5.
- It emits `time:phase-changed { phase, hour }`.
- Spawn entries tagged `time` spawn only in their phases. Dawn and dusk count as both day and night.
- A lighting tint comes in Phase 2.

### 4.7 Maps (`src/ui/map/`)

- **Minimap.** Each chunk bakes a 32 × 32 px image (1 px per tile). The minimap shows a 160 × 160 tile window with icons for landmarks, doors and quest markers. Quest markers come from Claude 4.
- **World map.** A 512 × 384 texture (8 px per chunk) built from discovered chunks. It shows fog of war, region names, landmarks and waystones. Fast travel arrives in Phase 2.

---

## 5. Phase 1: Aldermoor (the prologue slice)

### 5.1 The valley

Aldermoor covers chunks x 24–35, y 28–35. The prologue is played in an **8 × 8 chunk valley: chunks x 26–33, y 28–35** (world tiles 832–1087 × 896–1151, 256 × 256 tiles).

The valley is ringed by moor tors and the Gloamwood's deep thicket, which are permanent natural walls. **Three road gaps** lead out: north to the Kingsvale, east along the Varn Causeway, and south toward the Lantern Coast. All three are gated on `prologue.complete`, and the south gap additionally on `act1.complete`. The ring is real terrain, not a Phase 1 hack, so the world stays seamless once it opens.

Local coordinates are tiles from the valley origin (832, 896):

```
  local x →  0        64       128      192      255
 y 0   ┌───────────── N road gap ▒ ────────────────┐   ▲ tors (wall)
       │▲▲ " " " " " " "   ,,,,|,,,,  ▲▲  ≈≈≈≈≈≈▲▲│   " Gloamwood
   32  │▲ " WOLF HOLLOW " "  ,,,|,,,  ≈≈≈≈≈≈≈≈≈≈≈▲│   ≈ Wennamere (mere)
       │▲ "  "  "  "  "  "  ,,,|,,,  ≈≈ DROWNED ≈ ▲│   ~ the Brindle (stream)
   64  │" WEEPING STONES " ,,,,|,,,, ≈≈  ABBEY  ≈≈▲│   | / = roads
       │" "  "  "  "  "  "  ,,,|,,,  ≈≈≈≈≈≈≈≈≈≈≈ ▲│   , farmland/heath
   96  │"  TOBIN'S CAMP  " ,,,,|,,,,,,,≈≈≈≈≈≈≈≈≈▲▲│   ▒ gated road gap
       │" "  BRIAR HUT "  "  ,,|,,,,   GIANT'S SLUICE│
  128  │" " " " " gloamwood-path~~~~~~~~~~/ ,,,,,,▲│
       │" "  " HOLLIS ┌──BRINDLECROSS──┐ ===========▒ E (Varn Causeway)
  160  │" " "  COTTAGE│ green  chapel  │ ,,,,,,,,,,▲│
       │" " " " "  "  │ mill  smithy   │,,,  moor ,▲│
  192  │" " " " " " " └────────────────┘ ,,,,,,,,,,▲│
       │▲" " " "  ,,,,,,,,,|,,,,  moor  EDRIC'S BARROW│
  255  │▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲ S road gap ▒ ▲▲▲▲▲▲▲▲▲▲▲▲▲▲│
       └─────────────────────────────────────────────┘
```

### 5.2 Brindlecross (`overlay:brindlecross`, about 48 × 40, local about 112–160 × 120–160)

The landmark ids are Claude 4's.

| Landmark / object | Notes |
|---|---|
| `landmark:brindlecross-green` + `obj:remembrance-pyre` | **New-game spawn and respawn point.** Future waystone. Festival-attack spawn zone. |
| `landmark:brindlecross-chapel` → `instance:brindlecross-chapel` | Lantern chapel, `npc-anchor:brother-anselm` |
| `landmark:guttered-candle` → `instance:guttered-candle` | Tavern: rest, rumours |
| `landmark:coalbrook-smithy` | Exterior forge with a shop anchor |
| `landmark:oswin-mill` | Watermill on the Brindle. Variants by `prologue.oswin_fate`: `slain` leaves the mill abandoned; `exposed` puts it under guard. |
| `landmark:elder-hall` → `instance:elder-hall` | — |
| `landmark:hollis-cottage` | At the west edge, by the start of the Gloamwood path |
| `landmark:brindlecross-woodshed` | — |

The village is `NO_SPAWN`, except for the festival zone. Prologue rest points (`campfire` objects, which emit `world:rest`) are the hearth of the Guttered Candle, Tobin's camp, the Briar hut, and the Wennamere shore after the mere is drained. NPC anchors follow Claude 4's NPC list.

### 5.3 The Gloamwood (local about 0–100 × 10–230)

| Landmark | Notes |
|---|---|
| `landmark:gloamwood-path` | Entrance, west of Hollis cottage |
| `landmark:briar-hut` | Hedge-witch's hut. Safe, `NO_SPAWN`. |
| `landmark:weeping-stones` | Aelthi stone circle and stag shrine. Boss arena. Variant by `prologue.stag_fate`: `cleansed` brings a white-stag NPC anchor and a calm glade; `slain` leaves the stones darkened. |
| `landmark:wolf-hollow` | Wolf den |
| `landmark:tobins-camp` | Abandoned campsite. Lore, a chest. |

### 5.4 Wennamere (local about 160–250 × 10–120)

| Landmark / object | Notes |
|---|---|
| `landmark:wennamere-shore` | Cold shore. Mire seep `seep:wennamere` (minLevel 0). Unwrought appear at night. |
| `landmark:giants-sluice` + `obj:giants-sluice-wheel` | The Orrin dam on the south outflow. The wheel is an `interactable`, and Claude 4's quest sets `prologue.mere_drained`. |
| `landmark:drowned-abbey` | Island in the mere. Variant on `prologue.mere_drained`: the water drops to mudflats (`SLOW`), a causeway appears, and `obj:drowned-abbey-door` (→ `instance:drowned-abbey`) is added. |
| `landmark:edrics-barrow` | Optional mini-dungeon on the south-east moor: `instance:edrics-barrow`, one small floor of `enemy:drowned-dead` |

### 5.5 Dungeon: the Drowned Abbey of Saint Wenna (`instance:drowned-abbey`, T1, biome `dungeon-crypt`)

| Floor | Landmark | Content |
|---|---|---|
| 1 Nave | `landmark:abbey-nave` | Flooded nave (`SLOW` water), drowned dead, lore tablets, a lever puzzle (`world.lever.abbey-floodgate`) that lowers the water to reach the stairs |
| 2 Crypt | `landmark:abbey-crypt` | Ossuary corridors, Hollowed monks, a side vault with a chest |
| 3 Reliquary | `landmark:abbey-reliquary` | **Boss: Abbess Morwen.** After the fight, `obj:fallen-ember` (an `interactable`, for Claude 4) appears and an exit shortcut opens to the shore. |

All three floors are handcrafted overlays (`overlay:abbey-f1..f3`, about 64 × 48 each).

### 5.6 Prologue spawn zones

Areas are in local valley tiles, or instance tiles for dungeons. The enemy ids are final, agreed by Claude 3 and Claude 4: `gloamwood-wolf`, `ashfoot-cutthroat` and `ashfoot-archer` (the Ashfoot Reavers), `hollowed-thrall`, `mireling` (splits on death), `drowned-dead`, and the bosses `hollowed-white-stag` and `abbess-morwen`.

| Zone | Area | Enemies | Lvl | Max | Respawn | When |
|---|---|---|---|---|---|---|
| `zone:aldermoor-moor` | east and south moor | `enemy:gloamwood-wolf` (lone) | 1–2 | 3 | 90 s | — |
| `zone:gloamwood-edge` | 60–100 × 100–200 | `enemy:gloamwood-wolf` | 1–3 | 4 | 90 s | — |
| `zone:gloamwood-deep` | 0–90 × 10–110 | wolves, `enemy:ashfoot-cutthroat`, `enemy:ashfoot-archer` | 2–4 | 6 | 120 s | — |
| `zone:wolf-hollow` | about 20–44 × 22–44 | wolf pack (with an elite override of 0.25) | 3–4 | 4 | 300 s | — |
| `zone:brindlecross-festival` | the green | `enemy:hollowed-thrall` | 2–3 | 6 | 0 | `prologue.festival_attacked` |
| `zone:weeping-stones-boss` | the stone circle | `enemy:hollowed-white-stag` | 4 | 1 | 0 | `not prologue.stag_fate` |
| `zone:wennamere-seep` | around `seep:wennamere` | `enemy:mireling` | 3–4 | 3 | 300 s | night |
| `zone:edrics-barrow` | instance | `enemy:drowned-dead` | 3–5 | 5 | 0 | — |
| `zone:abbey-nave` | instance f1 | `enemy:drowned-dead` | 4–5 | 5 | 0 | — |
| `zone:abbey-crypt` | instance f2 | `enemy:hollowed-thrall` (monks), `enemy:drowned-dead` | 5 | 5 | 0 | — |
| `zone:abbey-reliquary` | instance f3 | `enemy:abbess-morwen` | 6 | 1 | 0 | — |

---

## 6. Code plan (Phase 1)

| File | Responsibility |
|---|---|
| `src/world/constants.ts` | Sizes, collision bits, depths |
| `src/world/noise.ts` | Seeded hash, PRNG, 2D simplex |
| `src/world/biomes.ts` | Biome palettes and scatter tables |
| `src/world/tileset.ts` | Runtime placeholder atlas plus tile properties (collision, minimap colour) |
| `src/world/chunkGen.ts` | The §3.3 pipeline. Pure, with no Phaser dependency, so it can run in a worker. |
| `src/world/overlays.ts` | RLE decode, stamping, variants |
| `src/world/ChunkManager.ts` | Streaming, LRU cache, tilemaps, flag re-evaluation |
| `src/world/collision.ts` | Resolver plus the `WorldQuery` implementation |
| `src/world/SpawnManager.ts` | Zones, seeps, respawn |
| `src/world/discovery.ts` | Chunk, landmark and region discovery events |
| `src/world/WorldClock.ts` | Day/night |
| `src/world/WorldCamera.ts` | Follow with deadzone, zoom, shake hook |
| `src/scenes/WorldScene.ts`, `src/scenes/WorldInstanceScene.ts` | Overworld and instances |
| `src/ui/map/Minimap.ts`, `src/ui/map/WorldMap.ts` | Maps |
| `src/data/regions/*` | World layout, routes, regions, overlays, spawns, instances |

### Contract requests for Claude 1 (`src/core`)

- **Types**: `RegionDef`, `LandmarkDef`, `RouteDef`, `InstanceDef`, `InstanceFloor`, `WorldObject`, `FlagCond`, `SeepDef`, `SpawnTable`, `SpawnEntry`, `SpawnZone`, `BiomeId`, `WorldState`, `WorldQuery`.
- **Events**:
  - `region:entered { regionId, prevRegionId }`
  - `landmark:discovered { landmarkId }`
  - `landmark:entered` and `landmark:left { landmarkId }`
  - `chunk:loaded` and `chunk:unloaded { cx, cy }`
  - `instance:entered` and `instance:exited { instanceId, floorId? }`
  - `interact { objectId, kind, props }`
  - `area:entered { triggerId }`
  - `enemy:spawn-request { enemyId, level, x, y, zoneId, tier }`
  - `enemy:despawn { zoneId }`
  - `enemy:killed { enemyId, zoneId, x, y, level, family }` (emitted by Claude 3)
  - `flag:changed { key, value, prev }`
  - `time:phase-changed { phase, hour }`
  - `world:rest { sourceId }`, emitted when the player rests at a waystone or campfire (Claude 3 refills flasks)
  - `world:ready`
- **GameState**: a `world: WorldState` slice.
- **Service**: a way to register and look up `WorldQuery`, for example `Registry.services.world`.

---

## 7. Open questions

1. ~~Stag outcome flag~~: resolved. Everyone uses `prologue.stag_fate`.
2. **Claude 3**: are resource nodes (herbs, ore) in scope for Phase 1?
3. **Claude 4**: names for the † rivers and roads, and the flavour of the three valley-exit barriers.
4. **Claude 1**: confirm the contract additions in §6, and the single fixed world seed.

---

## 8. Implementation notes (Phase 1, as built)

- **Overlays are authored as TypeScript `ops`** (`encoding: 'ops'`: fill, ellipse, line, frame, building, scatter, collide, clear) instead of RLE JSON; see `src/world/types.ts`. Ops marked `soft` (and every scatter) never paint over roads, bridges or water laid by routes. RLE can be added later for a Tiled pipeline.
- **Instances reuse the World scene.** An instance floor is just a different `ChunkProvider` (`InstanceProvider`), so streaming, collision, minimap and spawns all work unchanged; doors restart the scene with a new `location`.
- **Interact is F** (SYSTEMS §2.1); Q/E are Claude 3's quickslots. Rest points are `interactable` objects with `props.rest: true` (they emit `world:rest`).
- **Boss/event clears set a flag:** when a `respawnSec: 0` zone is cleared, `world.cleared.<zoneId>` is set, so objects can appear after a fight (e.g. `obj:fallen-ember`).
- **Wild zones** don't spawn within 7 tiles of the player; one-off event/boss zones can.
- **NPCs:** `npc-anchor` objects carry `props.landmark`; the scene spawns one sprite per NPC from Claude 4's `npcsAt()` and talking emits `interact { kind: 'npc-anchor', props: { npc } }`.
- **World map (M):** 8 px per chunk, fog from `discoveredChunks`; exact colours for chunks built this session, estimated from base terrain otherwise. Pauses via `ui:open { panel: 'worldmap' }`.
- **Dev tools (DEV builds only):** URL params `tp`, `inst`, `flags`, `zoom`; `window.__worldAudit()` (reachability/leak/spawn/reference audit); `window.__world` (`goto`, `tp`, `where`, `focus`, `press`, `spawns`, `perf`).
