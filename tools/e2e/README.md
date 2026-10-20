# Systems tests (Claude 3) — The Hollow Crown

The Medival v1 prologue bots (`prologue.mjs`, `bosses.mjs`, `bot.mjs`, `page-helpers.js`) are archived in
`archive/medival-v1/tools/e2e/`.

## Headless (Node, no browser) — the Phaser-free sim bundled with esbuild

```bash
node tools/e2e/sim/run.mjs validate            # content: spells, kits, 3×24-node trees, 214 creatures, drops, art bodies
node tools/e2e/sim/run.mjs fight <level> [cls] # every class vs a realm pack, mini-boss and realm boss
node tools/e2e/sim/run.mjs fight campaign      # every class vs its lair-2 boss (L8), nemesis (L12), Act III form (L34)
node tools/e2e/sim/run.mjs economy             # quest rewards, take-item, shops (trust price, smith gear)
node tools/e2e/sim/run.mjs coop                # downed/revive/wipe, party scaling, shared drops, PvP by realm rule, yields
node tools/e2e/sim/run.mjs inspect bx_ash_5 14 # print a creature's resolved combat def
node tools/e2e/sim/run.mjs starts [school]     # spawn zones near each class start waystone: level, size, distance to the opening roads
node tools/e2e/sim/run.mjs xp-project          # static Act I–III end-level projection (WALK=<walks.json>, EXPLORE=1, KPL=/QT= to calibrate)
# pre-deploy gates (tools/release/predeploy-check.mjs runs them; FAIL-prefixed lines, last line "N/M passed"):
node tools/e2e/sim/run.mjs hitboxes [hero|creature|dash|pvp|art]   # every hero attack/spell and creature ability: in → hit,
                                               # out → miss; telegraphs resolve where drawn (dodging works); dash i-frames; PvP;
                                               # body radius vs art (report only, "note" lines)
node tools/e2e/sim/run.mjs features [casts|tree|gear|progress|hooks] [cls]  # 24 classes: slots 1–4, dash, potions; every
                                               # tree node + keystones + hooks; gear/sets/Attuned/legendaries; level-up, shops,
                                               # Runeforge, scrolls
```

## Browser (real keyboard/mouse over the Chrome DevTools Protocol)

```bash
# 1. a dev server with no HMR / file watching (other agents' edits can't reload the page mid-run).
#    Restart it after code changes: it does not watch files.
npx vite --config tools/e2e/vite.e2e.config.mjs          # → http://localhost:5198

# 2. smoke: spawn at the class waystone, kill a pack (click-target, 1–3, dash, Q), a 12 s realm-boss bout,
#    open Pack / Skills / Spells. PASS = the spawned pack dies (only it is fought, never the world's camps), the
#    hero lives, the boss takes damage, and no console errors.
node tools/e2e/hc-smoke.mjs --class warden,arcanist   # --out tools/e2e/out  --base http://localhost:5198
```

`cdp.mjs` launches Chrome with GPU rendering (SwiftShader starves the game loop) and the anti-throttling flags.

DEV handle in the page: `window.__hc` → `spawn(creature, n, level?, dist?)`, `enemies()`, `local()`, `sprite()`,
`screenOf(id)`, `counts`. URL `?scene=WorldV2&space=realm:<school>&hc_class=<classId>`.

---

# Front end, net and server tests (Claude 1)

**One headless Chrome at a time, machine-wide.** Every script that starts Chrome takes `chrome-lock.mjs`
(`cdp.mjs` does it for you). Never `pkill` broad patterns; stop the dev servers you started.

```bash
npx vite --config tools/e2e/vite.test.config.mjs          # no-HMR dev server → http://localhost:5199 (restart after edits)
node server/build.mjs && DEV_AUTH=1 node dist-server/main.mjs   # realm server → :8080

node tools/e2e/hc-front.mjs                 # saved hero → Load → WorldV2 → Esc Pause → title → Public Realms → Enter (live server) → chat → leave (13)
node tools/e2e/realm-server.mjs             # realm server alone: list, join ×2, per-viewer snapshots, session, chat mask, systems spawn in realm space, leave (8)
node tools/e2e/coop-loopback.mjs http://localhost:5199   # two tabs, real WebRTC: join code, snapshots, chat, act with sender, vote tie-break (6)
node tools/e2e/save-roundtrip.mjs           # Hollow Crown save → reload → Load → location/space/gold restored (7)
node tools/e2e/new-player.mjs               # REAL input only: fresh profile → New Game → type name → Enter → start realm → finish opening → walk (9)
node tools/e2e/coop-world.mjs               # REAL co-op: host in WorldV2 opens its world, guest joins by code → both heroes in the host sim, guest input moves it, chat crosses (11)
node tools/e2e/realm-duel.mjs               # live Duels realm: two tabs, /duel, Accept prompt, duel:started both sides (6) — needs the realm server
node tools/e2e/ui-shots.mjs [--only a,b]    # screenshots of every overlay: dialogue, journal, codex, people, pack, skills, spells, map, pause
node tools/e2e/hud.mjs [--base …]           # HUD behaviour via window.__hud (DEV probe): frame, bars in combat, buttons, rebinding, layout, boss bar, toast, banner, Pause, Death (35)

# Before ANY hosting deploy (user's rule): every suite above plus Claude 3's and the narrative gate, one after another.
# Starts its own servers (:5190 web, :8080 realm) and stops them; the hosting guard needs its passing stamp.
node tools/release/predeploy-check.mjs      # --list | --only a,b (debug, no stamp)
node tools/e2e/shot.mjs "<url>" out.png [waitMs]         # screenshot; CLICKS="x,y;x,y" clicks first. ?scene=<Key>&data=<json> opens a scene directly
node tools/e2e/eval.mjs "<url>" "<async expr>" [waitMs]  # evaluate in the page, print JSON
```
