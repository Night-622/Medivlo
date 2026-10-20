# The Hollow Crown: handover to the home PC (2026-10-20)

Production of The Hollow Crown moved from the Mac to the user's home PC on 2026-10-20. This file is the starting point for
the new sessions: what the game is, who owns what, the binding rules, where things stand and what's left before
launch. Read it first, then the docs it points to. It replaces the memory notes the Mac sessions kept, which didn't
move with the code.

---

## 1. Moving the project (the user does this once)

**On the Mac, before copying**
1. Tell the agents to reach a clean stopping point and update their section of docs/STATUS.md.
2. Copy the `Medival` folder with its hidden files (`.env.local`, `.firebaserc`, `.firebase/`, `.gitignore`). Leave
   these out:
   - `node_modules/`: reinstall instead.
   - `dist/`, `dist-server/`: build output.
   - `tools/e2e/out/`: screenshots.
   - `tools/e2e/.chrome-lock/`: if present.
   - `exec -l /`: a 300 MB stray copy of the Google Cloud SDK from a mistyped command. It isn't part of the game.

   `.env.local` holds the medivlo Firebase web config and isn't in any other copy, so check it made it across.

**On the home PC**
```bash
cd <path>/Medival
node -v                 # needs Node 22 or newer (the e2e driver uses Node's built-in WebSocket); the Mac had 24
npm ci
npm run typecheck       # expect 0 errors
npm run build
npm i -g firebase-tools && firebase login     # log in with the account that owns project medivlo
```

**Windows notes**
- The repo's scripts are bash (`tools/narrative/check.sh`, `tools/playthrough/run.sh`). Run Claude Code and the
  agents inside **WSL** or **Git Bash**.
- The env-var deploy syntax (`HOLLOW_CROWN_RELEASE=1 firebase …`) works in both of those shells, but not in
  PowerShell.
- The headless-Chrome tests default to the Mac Chrome path. Set `CHROME` to your Chrome binary, for example
  `export CHROME="/c/Program Files/Google/Chrome/Application/chrome.exe"` in Git Bash, or `/usr/bin/google-chrome`
  in WSL.
- `tools/narrative/check.sh` uses `/tmp/medival-narrative-gate.lock`, which works in both shells.
- Git is set up (2026-10-20, branch `main`, baseline 33934d8). Rules are in §4.

---

## 2. What the game is

The Hollow Crown is a top-down pixel-art action RPG for desktop browsers.
- **Classes and campaigns:** 24 classes in 12 schools. Each class has its own campaign of about 15–20 h and 60
  quests. It starts in the class's school realm and ends at the Hollow King in Concordia.
- **Co-op:** up to 4 players over WebRTC, with Firebase signalling. Guests play the host's story.
- **Public realms:** up to 8 players on a Cloud Run server, in Peaceful, Duels, Arena and Free-for-all modes.
- **Stack:**
  - Game: TypeScript strict, Vite 6, Phaser 3.90 (pixelArt, FIT 1280×720), Firebase 11 (Auth, Firestore, Hosting).
  - Realm server: Node `ws`, `jose`, and vm-isolated realms bundled with esbuild.
- **Art and audio:** art comes from the Claude Design handoff (`Medieval Browser Action RPG/`). Fonts are bundled.
  Audio is procedural WebAudio. No external asset URLs, ever.

**Docs (read in this order)**
| Doc | What it holds |
|---|---|
| docs/REBUILD.md | Every user decision (scope, multiplayer, accounts, release rule) and folder ownership |
| docs/STATUS.md | Per-agent progress log. Each agent edits only its own section |
| docs/RELEASE.md | Definition of done: the launch checklist, with an owner and a check command for each line |
| docs/PACING.md | The plan to reach 15–20 h per campaign, and measurements so far |
| docs/DEPLOY.md | Firebase / Cloud Run runbook (auth, billing, rules, realm server, launch) |
| docs/world/HOLLOW-CROWN-WORLD.md | World design (Claude 2) |
| docs/systems/ | Systems design (Claude 3) |
| docs/lore/hollow-crown/ | Story bible (Claude 4). `08-canon-rulings.md` is binding; `10-campaign-style.md` is the style guide for class data |
| tools/e2e/README.md | How to run the tests |

---

## 3. Team and ownership

Four Claude Code sessions build the game. Claude 1 orchestrates. Session names change every run, so find each
other with `ListAgents`. Each agent's first message to Claude 1 says "I'm Claude N, session <name>".

| Agent | Owns | Role now |
|---|---|---|
| **Claude 1** (orchestrator) | `src/core`, `src/net`, `server/`, `src/firebase`, `src/art`, `src/audio`, `src/render`, `src/ui/kit`, `src/ui/hud`, `src/ui/screens`, scenes Boot/MainMenu/CharacterCreate, `tools/` (except the tools folders below), `firebase.json`, `firestore.rules`, docs/RELEASE.md and DEPLOY.md | Splits work and routes the user's play reports to the owner. Reviews and makes every core/net contract change. Deploys test builds to medivlo.web.app when the user asks. Owns UI bugs |
| **Claude 2** (world) | `src/world`, `src/scenes/World*`, `src/ui/map`, `src/data/regions`, `tools/playthrough` | Places Claude 4's story objects in the world (the "placement lists"). Pacing world passes, map, world polish |
| **Claude 3** (systems) | `src/systems`, `src/ui/character`, `src/data/{classes,traits,items,spells,skilltrees,enemies}`, `tools/e2e/sim` | Combat, classes, gear, bestiary, trees, co-op rules, balance. Tunes from the user's play reports |
| **Claude 4** (narrative) | `src/narrative`, `src/ui/narrative`, `src/data/{quests,dialogue,lore,npcs,factions,tips}`, `tools/narrative`, docs/lore | All 24 campaigns. Running the depth pass with up to 3 helper agents |
| **Claude 5** (narrative helper, added on the PC) | Only the files Claude 4 assigns (wave 2 Iron + Fist, done; Morvane codex lengthening, done; now shared Concordia Act II depth in the hc-concordia quest, depth and npc files) | Writes and gates depth for its classes and hands them to Claude 4. Claude 4 records its work in STATUS.md. On this PC the helper cap is 4 including Claude 5 |

---

## 4. Binding rules (from the user and the team; don't relax them)

- **No release until all 24 campaigns are done.** No previews.
  - The live production deploy is the user's call (docs/DEPLOY.md step 6).
  - Test deploys to **medivlo.web.app** happen only when the user asks for one.
  - The old game stays on `medival-game-mk`; never deploy there.
- **Every deploy is tested first** (user, 2026-10-20): the HUD, enemy and player hitboxes, and every feature
  (spells, upgrades, gear, shops, story) must pass `node tools/release/predeploy-check.mjs` before any hosting
  deploy, test or live. The hosting guard enforces it (stamp tied to the exact source). Never bypass it.
- **The user does all playthrough testing.** Agents don't run bot playthroughs of whole campaigns. Fast gates are
  fine: tsc, validators, fight sims and short e2e. The user's play reports come in through Claude 1, who sends each
  to the owning agent.
- **Stay in your own folders.** Changes to `src/core` and `src/net` contracts go through Claude 1 by message.
- **Never delete old content.** Move it to `archive/medival-v1/`.
- **Don't change the stack** without asking the user.
- **Never pkill broad patterns.** Kill only PIDs you started, and stop your own dev and realm servers after a run.
- **One headless Chrome at a time:** `tools/e2e/cdp.mjs` takes the `chrome-lock.mjs` mutex. Never set
  `CHROME_LOCK=0`.
- **Helper agents:** 3 at most, and heavy runs go one after another. (The Mac was starved for RAM. A bigger PC may
  allow more, but ask Claude 1 first.)
- **Test logic in Node first.** Headless Chrome ran the game at about 1 fps on the Mac.
  - Esbuild-bundle the Phaser-free code (`src/world/hc`, `src/systems` sim, the `src/narrative/engine`) and test it
    in Node.
  - Use the browser for visuals only.
  - In a browser test, drive the sim by hand: `import('/src/net/index.ts').then(n => n.sim.advance(1000/30))`.
- **Engine purity.** `src/narrative/engine`, the `src/systems` sim and `src/world/hc` stay free of Phaser, because
  they also run on the realm server. Narrative engine listeners use `authBus.on`, never `bus.on`.
- **Narrative canon:**
  - Morvane bosses are "Sentinels" (flag `story.sentinel.<school>`), never "Wardens".
  - Content never sets `story.bearers_gathered`; the engine derives it.
  - No `npc.*` flags.
- **Key bindings:** compare keys with `isAction(ev, action)` from `src/ui/kit/hc/keys.ts`, and show key names with
  `keyLabel` / `formatKeys` from core. Never hard-code letters; every action is rebindable.
- **Done means done:** `npm run typecheck` and `npm run build` pass. Update your STATUS.md section when you finish a
  task. Keep files under ~400 lines and avoid `any` in exported APIs.
- **Git (since 2026-10-20, repo in this folder, branch `main`):** only Claude 1 commits, as a checkpoint before
  each agent wave and when a gate passes. Agents may use read-only git (`status`, `diff`, `log`, `show`) to check
  their own changes. Never `checkout`, `reset`, `restore`, `stash`, `clean` or `commit`: the working tree is shared,
  so these would wipe or capture other agents' unfinished work. Ask Claude 1 to revert something.
  `core.autocrlf` is off for this repo; keep files LF.
- **One question at a time:** if a request is ambiguous, ask the user one specific question rather than guessing big.

---

## 5. Where things stand (2026-10-20, about 10:00 AEDT)

**Built and verified**
- **Campaigns:** all 24 are written through the ending, 60 quests each.
  - Narrative gate on all 24: LOGIC 0, solo and co-op bots PASS.
  - Every object is placed in the world: `worldIds()` reports 0 unplaced.
  - Each class beats its lair-2 boss, nemesis and Act III boss in the fight sim.
- **Front end:** title, character creation, HUD, pause, death, settings with full rebinding, account, friends, load,
  realms, people, credits, dialogue, journal, codex, map and instance map.
- **Co-op:** works in the real world (`coop-world.mjs`). Public realms and duels run on a local realm server.
- **Infrastructure:**
  - Autosave and play time.
  - Error reports to the Firestore `clientErrors` collection.
  - Sharp 2× text rendering.
  - Procedural music and SFX.
  - Worker-thread chunk generation.
  - Firestore rules are deployed to medivlo.
- **Test site:** medivlo.web.app has the last build from the Mac, with the hero-click freeze fix and
  the full rebind fix. Built since then and not yet deployed:
  - ground shadows;
  - the Shade's listening shadow;
  - escorts that path around walls with A*;
  - Concordia placement-order and banter-trigger fixes.

**In progress: the depth pass (the pacing work, docs/PACING.md)**
- **Why:** bot estimates put Act I at 2.6–4.0 h after the first passes; the goal is 15–20 h per campaign.
- **Act I depth:** done for all 24 classes, and placed in the world.
- **Wave 2 (Act II and Act III depth), as of 09:40:**
  | Step | Classes and schools |
  |---|---|
  | Gated and placed | Reaver, Rime, Verdant, Umbral |
  | Lists with Claude 2, not placed yet | Huntsman, Knight, Samurai, Sparkwright, Swordsman |
  | Being written | Storm, Radiance, Blade, Iron, Fist, Hunt, Guile, Song |
- **Unplaced ids:** about 50. Eight are on lists Claude 2 already has; the rest belong to schools still being written.
- **Claude 3:** nothing open; waiting on the user's play reports.

**Waiting on the user (optional; nothing is blocked today)**
- In the medivlo Firebase console, enable the Email/Password and Anonymous sign-in methods (DEPLOY.md step 1).
- Move to the Blaze plan and set a $10 budget alert (step 2).
- Install the Google Cloud CLI and deploy the realm server (steps 4–5). Then give Claude 1 the service URL, to go in
  `VITE_REALM_SERVER` in `.env.local`.

---

## 6. Plan to launch (in order)

1. **Finish wave 2.**
   - Claude 4 writes the Act II/III depth for the remaining 8 schools.
   - Claude 2 places each list as it arrives.
   - Gate per school: `tools/narrative/check.sh <classes>` passes LOGIC 0 with solo and co-op bots, and Claude 2's
     `tools/playthrough/checks.ts` reports 0 unplaced.
2. **Shared acts depth.** Deepen the shared Concordia (Act II) and Heart (Act III) acts. Every class benefits.
3. **The user plays, and the team tunes.**
   - The user reports from medivlo.web.app. Claude 1 routes each report: world to Claude 2, combat, loot and levels
     to Claude 3, story to Claude 4, and UI, net and saves to Claude 1.
   - Redeploy the test site when fixes land and the user asks.
   - Targets:
     - Level bands: Act I ends at L13–14, Act II at L26–28, Act III at L38–40.
     - About 15–20 h per campaign, judged by the user's play.
4. **Online features, once the user finishes DEPLOY.md steps 1, 2, 4 and 5.** Test them on the real project:
   - sign-up and sign-in by email, by username with a recovery code, and as a guest;
   - friends and presence;
   - joining through a friend;
   - Firestore signalling across two machines;
   - public realms on Cloud Run.
5. **Polish and browser checks.**
   - Fix the rare ~100 ms hitches on fresh terrain.
   - Check the game in Chrome, Firefox, Safari and Edge at 1080p and 1440p.
6. **Launch (user and Claude 1):** work through docs/RELEASE.md section 4, then run DEPLOY.md step 6
   (`npm run build && HOLLOW_CROWN_RELEASE=1 firebase deploy --only hosting`). The predeploy guard blocks a hosting
   deploy unless that flag is set.

---

## 7. Commands

```bash
npm run dev                                   # game at http://localhost:5173
npm run typecheck && npm run build            # required before calling anything done

# test deploy to medivlo.web.app (only when the user asks)
node tools/release/predeploy-check.mjs      # HUD, hitboxes, every feature: required before ANY deploy
npx vite build && HOLLOW_CROWN_RELEASE=1 firebase deploy --only hosting --project medivlo

# gates
tools/narrative/check.sh arcanist,reaver      # narrative (Claude 4)
node tools/e2e/sim/run.mjs validate           # systems content (Claude 3); also: fight campaign | economy | coop
npx vite --config tools/e2e/vite.test.config.mjs   # e2e server on :5199 (no file watching: restart it after edits)
node tools/e2e/new-player.mjs                 # fresh profile → playing, with real input (12 checks)
node tools/e2e/coop-world.mjs                 # two tabs in co-op in the real world
node tools/e2e/ui-shots.mjs                   # screenshots of every screen into tools/e2e/out
node server/build.mjs && DEV_AUTH=1 node dist-server/main.mjs   # local realm server on :8080
```

Dev URL parameters:
`?scene=WorldV2&space=realm:<school>&hc_class=<class>&tp=tx,ty&zoom=0.5&hour=22&fly=1`.

Console helpers:
- `window.__world`: `where()`, `tp(tx,ty)`, `space(id)`, `hour(h)`
- `window.__hc`: `spawn(creature, n)`, `local()`, `enemies()`
- `window.narrative.talk('npc:<id>')`
