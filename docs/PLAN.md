# MEDIVAL — Master Plan

> **Superseded (2026-10-19):** the game is being rebuilt as **The Hollow Crown**. See [REBUILD.md](REBUILD.md). This file is kept for history.

Working title: **Medival** (rename later). Owner/orchestrator: **Claude 1** (`medival-d9`).

## 1. The game

A top-down fantasy RPG set in a medieval world. **Campaign is the only mode** for now.

Pillars (every feature should serve one of these):
1. **Very deep lore**: factions, history, religions, languages, a readable in-game codex, and lore you discover by exploring rather than being told it.
2. **Massive map**: many regions you can travel between seamlessly, streamed in chunks, with handcrafted landmarks on top of seeded procedural terrain.
3. **Build-crafting**: classes, traits, skill trees, weapons, gear, spells/powers and upgrades that combine into distinct builds and tactics.
4. **Identity**: character creation with custom skins (layered body, hair, colours, armour visuals) and unlockable cosmetics.

## 2. Tech stack (fixed — don't change without Claude 1)

| Layer | Choice |
|---|---|
| Language | TypeScript (strict) |
| Bundler / dev server | Vite |
| Game engine | Phaser 3 (pinned 3.90.x) |
| Backend | Firebase: Hosting, Auth (anonymous + Google), Firestore (cloud saves, profile, cosmetics) |
| Maps | Seeded procedural terrain + handcrafted overlays in JSON; chunks of 32×32 tiles, tile = 32px |
| Content | Data-driven: all classes, items, spells, quests, dialogue and lore are typed data files, not code |
| Art (phase 1–2) | Runtime-generated placeholder textures. Phase 3: layered sprite sheets (e.g. LPC-style, licence-checked) |

Firebase needs a real project from the user (see §8). Until then saves go to `localStorage` behind the same `SaveService` interface.

## 3. Repo layout & ownership

**Rule: only edit files in folders you own.** If you need something in someone else's folder, message its owner. `src/core/` is the shared contract and only Claude 1 edits it; ask for changes there.

```
/docs/PLAN.md                 Claude 1   (this file)
/docs/world/                  Claude 2   world & region design docs
/docs/systems/                Claude 3   combat/progression design docs
/docs/lore/                   Claude 4   lore bible, campaign outline
/src/main.ts, /src/scenes/Boot*, MainMenu*, CharacterCreate*   Claude 1
/src/core/                    Claude 1   types, EventBus, GameState, registry, constants
/src/firebase/                Claude 1   auth, Firestore saves, SaveService
/src/ui/kit/                  Claude 1   shared UI primitives (Panel, Button, Bar, Tooltip, theme)
/src/ui/hud/                  Claude 1   HUD shell (slots other systems plug into)
/src/world/                   Claude 2   tilemap, chunk streaming, terrain gen, collision, camera, travel
/src/scenes/World*            Claude 2   the main overworld/dungeon scenes
/src/ui/map/                  Claude 2   minimap, world map, fast travel UI
/src/data/regions/            Claude 2   region definitions, landmarks, spawn tables
/src/systems/                 Claude 3   stats, combat, abilities/spells, AI, loot, inventory, skill trees, crafting
/src/ui/character/            Claude 3   inventory, equipment, skill tree, spellbook panels
/src/data/{classes,traits,items,spells,skilltrees,enemies}/   Claude 3
/src/narrative/               Claude 4   quest engine, dialogue engine, codex, NPC schedules
/src/ui/narrative/            Claude 4   dialogue box, quest log, codex/journal panels
/src/data/{quests,dialogue,lore,npcs,factions}/               Claude 4
```

## 4. How systems talk (contracts in `src/core/`)

- **`EventBus`**: systems never import each other's internals. They emit and listen to typed events (`enemy:killed`, `item:picked`, `quest:advanced`, `region:entered`, `dialogue:choice`, `player:levelup`…). The event map lives in `src/core/events.ts`.
- **`GameState`**: one serialisable object (player, inventory, quests, world flags, discovered map, cosmetics). Each system owns its own slice; `SaveService` saves it as a whole.
- **`Registry`**: loads all `src/data/**` content by id. Ids are `kebab-case`, namespaced: `item:iron-longsword`, `spell:ember-bolt`, `quest:ashes-of-varn`, `region:greywater-marsh`.
- **World flags**: `flags: Record<string, boolean | number | string>` in GameState. This is how quests change the world (Claude 4 sets them, Claude 2 reads them to spawn and despawn things).

## 5. Phases

### Phase 0: Foundations (now)
- C1: Vite + TS + Phaser scaffold, `src/core` contracts, UI kit, Firebase stubs, boot → menu → world scene flow.
- C2: World design doc: continent layout, list of regions, biomes, travel routes, chunk format spec.
- C3: Systems design doc: stat model, damage formula, class roster, trait list, skill-tree structure, item rarity/affix model, spell schools.
- C4: Lore bible: cosmology, history timeline, factions, religions, major characters, campaign outline (acts → chapters → quests).
- **Exit:** game boots to an empty world scene; all four design docs agreed.

### Phase 1: Vertical slice (one region, everything working end-to-end)
- C2: Starting region (village + forest + one dungeon), chunk streaming, collision, camera, minimap.
- C3: Player movement + melee + 1 spell per class, 3 classes, 6 traits, 1 small skill tree per class, inventory/equip, 3 enemy types with AI, loot drops.
- C4: Prologue quest chain (≈5 quests) with branching dialogue, 10 NPCs, quest log, codex with ~20 entries.
- C1: Character creation (class, traits, skin layers), HUD, pause/menu, local save/load, Firebase auth + cloud save, integration and reviews.
- **Exit:** a new player can create a character, play the prologue to its end, and save/load in the cloud.

### Phase 2: The world opens (Act I)
- C2: 6–8 regions, seamless streaming, roads, towns, 5+ dungeons, fast travel, fog-of-war world map, day/night.
- C3: Full class roster (6), full skill trees, 4 spell schools, item rarities/affixes/sets, upgrade & crafting, 15+ enemies, 3 bosses.
- C4: Act I campaign, faction reputation, side quests per region, lore books and readable items, codex 100+ entries.
- C1: Cosmetics/skin unlocks, settings, save slots, perf budget, balancing tools.

### Phase 3: Acts II–III, art & audio
- Real layered sprite art, music and SFX, more regions, endgame, consequences of choices across acts.

### Phase 4: Release
- Performance pass, playtesting, balancing, Firebase Hosting deploy, security rules audit.

## 6. Coding conventions
- TypeScript strict; no `any` in exported APIs.
- Every data file is typed against interfaces in `src/core/types.ts` (Claude 1 adds a type the moment you ask for it).
- No cross-folder imports except from `src/core/`, `src/ui/kit/` and the Registry. One exception: **scenes** may import another owner's public entry file (`src/world/index.ts`, `src/systems/index.ts`, `src/narrative/index.ts`). Each owner keeps that file small and stable.
- Runtime cross-system calls go through `Services` (src/core/services.ts). Ask Claude 1 to add a typed slot.
- The player entity and its controller belong to Claude 3 (`src/systems/index.ts` exports `createPlayer(scene, x, y)`). The World scene (Claude 2) calls it, and movement collides through `Services.get('world').moveAndCollide`.
- Keep files under ~400 lines; one system per file.
- `npm run typecheck` and `npm run build` must pass before you report a task done.
- Placeholder art: use `src/ui/kit/placeholder.ts` helpers (coloured shapes + labels), never external URLs.

## 7. Communication protocol
- Report to Claude 1 (`medival-d9`) when a task is **done**, when you are **blocked**, or when you **need a contract change**.
- Message other agents directly when you need data or an event from them; copy Claude 1 on anything that changes a contract.
- Status board: `docs/STATUS.md`. Each agent updates only its own section.

## 8. Needs from the user
- Create a Firebase project (console.firebase.google.com), enable Firestore + Authentication (Anonymous, Google), and provide the web config, or run `firebase login` so Claude 1 can wire it up.
- Final game name.
