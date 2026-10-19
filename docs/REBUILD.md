# The Hollow Crown — rebuild plan

This replaces the "Medival" Phase 1 game. The Claude Design handoff is the new game design. Decisions below are the user's and are fixed unless the user changes them.

Source handoff: `Medieval Browser Action RPG/` (read `HANDOFF.md` first; `assets/atlas.json`, `medival-tokens.json`, `art.js`, `tiles.js`, `gear.js`, `bestiary.js`, `map.js`, `realms.js`, `legendary.js`; the `.dc.html` boards are the visual reference, and `Medival Screens.dc.html` is a playable prototype).

## User decisions
| Topic | Decision |
|---|---|
| Name | **The Hollow Crown** (wordmark is generated in code; replace "MEDIVAL") |
| Design | Adopt the handoff as the new game: its art, UI, screens, 24 classes in 12 schools, 13 realms, NPCs, gear, bestiary, skill-tree format, quest journal, map zoom levels |
| Names | When old lore and the handoff clash, **the handoff's names win** |
| Classes | All 24 classes playable, female/male, full appearance options (per HANDOFF) |
| Story | Written from scratch. **Each class has its own full campaign (~15–20 h, ~60 quests, ~8 bosses).** Old campaign is retired; ideas may be reused only if they fit |
| Start | Each hero starts in their school's realm. The two classes of a school play **different areas of the same realm** |
| Ending | Every class campaign ends by reaching Concordia and confronting the **Hollow King**, with class-specific endings |
| Controls | Handoff style: WASD move, click/auto attack target, 1–4 cast, Space dash, Q/E potions, I inventory, K skills, B spells, J journal, M map, F talk/interact, Esc pause |
| Auto-fight | No (prototype demo only) |
| Platform | Desktop only (keyboard + mouse), 1280×720 FIT |
| Fonts | Jersey 10 + Pixelify Sans, **bundled** (no external URLs) |
| Release | **Nothing is released until all 24 campaigns are done. No previews.** The current live site stays up until then; old saves are wiped at launch |

## Multiplayer (in the first version)
| Topic | Decision |
|---|---|
| Co-op | Up to **4 players** in a fully shared world. Guests play the **host's campaign and story** whatever their own class |
| Joining | Short **join code**; short **friend code** to add friends (join from the friends list); **public realms** browser |
| Drop-in | Any time **if they have joined that host's world before** (they appear beside the host); a first-time join only while the host is in a **safe zone** |
| Guest progress | Guests keep **everything** (XP, levels, gold, gear, items) and take it back to their own campaign |
| Level sync | **None**: guests fight at their real level |
| Loot | **Shared drops**, with drop quantity scaled up per player (2 players → double drops) |
| Story choices | **Everyone votes**; the host breaks ties |
| Death | **Downed** for about 30 s; a teammate holds F to revive; respawn at the waystone if everyone is down |
| Scaling | Enemies get more health and more spawns per extra player |
| Chat | Text chat in co-op and in public realms (profanity filter, mute/block/report) |
| Accounts | **Email + password**; **username + password with no email** (recovery code shown at sign-up; an email can be added any time); **guest** (device-only) |

### Public realms
- Run on a **dedicated server** (Cloud Run, scales to zero), **up to 8 players** each.
- Realm types have fixed rules: **Peaceful**, **Duels** (both players must accept), **Arena** (PvP only in arena zones) and **Free-for-all** (PvP everywhere).
- PvP death penalty depends on the realm type: nothing in Duels and Arena; a share of carried gold drops in Free-for-all, and the killer can pick it up.
- Billing: Firebase **Blaze** plan with a **$10/month budget alert**. The user has to set up billing in the console.

### Network architecture
- **Private co-op:** host-authoritative peer-to-peer over **WebRTC** (data channels), with Firebase (Firestore) used only for signalling and invites. The host's browser runs the simulation. Guests send inputs; the host sends state snapshots and events. If the host leaves, the session ends and guests keep what they've earned.
- **Public realms:** the same simulation code runs headless on a Node server (Cloud Run + WebSocket). Game logic must therefore be **Phaser-free and deterministic where possible** (`src/systems` pure modules, `src/world` chunk/collision, and the `src/narrative` engine), with Phaser kept to rendering and input.
- Core contract (Claude 1): `src/net` with `NetRole = 'solo' | 'host' | 'guest' | 'server-client'`, an input message schema, snapshot/delta schema, replicated events (a flagged subset of GameEvents), `Services.net`, party state, and votes. Every system must run its simulation only where `Services.net.isAuthority()` is true and render from replicated state elsewhere.
- Saves: each player's own character and inventory are saved by their own client to their own Firestore doc. Story and world state are saved by the host only.

## Stack (unchanged)
TypeScript strict, Vite, Phaser 3.90, Firebase (anonymous auth, Firestore saves, Hosting). Systems talk only through `src/core` (EventBus, GameState, Registry, Services). Content is typed data in `src/data/**`. Files under ~400 lines.

## Ownership (same folders as before)
| Agent | Owns | Rebuild scope |
|---|---|---|
| Claude 1 | `src/core`, `src/net`, `server/`, `src/firebase`, `src/ui/kit`, `src/ui/hud`, scenes Boot/MainMenu/CharacterCreate, `tools/`, asset pipeline `src/art/` | Netcode (WebRTC co-op, public-realm server, accounts, friends, codes, chat, votes), asset pipeline (atlas + art.js port, hero composer/baking), new UI kit from `medival-tokens.json` (9-slice panels, fonts), title, character creation (24 classes, body/skin/hair/eyes/expression/marks, dyes, headwear), HUD, pause/death/settings, NPCs screen, save schema v2, integration, release gates |
| Claude 2 | `src/world`, `src/scenes/World*`, `src/ui/map`, `src/data/regions` | 13 realms (12 school realms + Concordia/Morvane with 11 regions and 10 villages), realm tilesets/buildings/landmarks, autotiles, props + light points, MULTIPLY/ADD lighting, two class start areas per realm, the Realms › Morvane › Village map, waystones, region gates for all 24 campaigns |
| Claude 3 | `src/systems`, `src/ui/character`, `src/data/{classes,traits,items,spells,skilltrees,enemies}` | 24 classes × kits (12 schools), handoff controls/combat (dash, 1–4 casts, Q/E), gear (64 weapons, 96 armour sets with 2/4-piece + Attuned), 64 items, paperdoll rules, 25 legendaries, 142 creatures with stats/abilities/phases, the 3-branch × 24-node skill tree per class, inventory/skills/spells screens per handoff |
| Claude 4 | `src/narrative`, `src/ui/narrative`, `src/data/{quests,dialogue,lore,npcs,factions}` | New lore bible for The Hollow Crown, **24 class campaigns** (~60 quests each), Concordia finale with class endings, NPC trust (Stranger…Devoted), dialogue with TRUST/QUEST/INSIGHT/[School] tags, journal per handoff (Active/Story/Side/Bounty/Done), codex, cutscenes per `Medival Cutscenes.dc.html` |

## Build order
1. **Foundation (all agents, in parallel):** Claude 1 asset pipeline + UI kit + core v2 types/save schema; Claude 4 new lore bible + campaign outlines for all 24 classes; Claude 2 realm data + Concordia map + tile/autotile engine on the new art; Claude 3 class/school kits + new combat controls + gear/bestiary data import.
2. **Vertical slice:** one school (two classes) end-to-end in its realm, through the new UI, to prove the pipeline. Internal only.
3. **Waves:** the remaining 11 schools, two class campaigns each, plus Concordia and the Hollow King finale.
4. **Release gate:** all 24 campaigns pass Claude 2's world audit, Claude 4's interrupt bot, Claude 3's real-combat e2e, then launch replaces the live site.

## Rules carried over
Release gating by `content.*` flags (now per class, e.g. `content.class.warden`), headless e2e in `tools/e2e`, `validateContent()` at boot in DEV, STATUS.md per agent, no edits outside your folders, contract changes go through Claude 1.
