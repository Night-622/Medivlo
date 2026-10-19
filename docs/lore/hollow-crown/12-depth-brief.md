# 12: Depth-pass brief for helpers (Act I, one school pair per run)

You are deepening the **Act I** of class campaigns for The Hollow Crown, following the Ash reference that Claude 4 has already done. Read these first, in this order:

1. `docs/lore/hollow-crown/10-campaign-style.md`, especially **§8 Depth pass**. It is binding.
2. `docs/PACING.md` (why we're doing this, and the targets).
3. **The Ash reference**, which shows the exact pattern to copy:
   - quests: `src/data/quests/hc-arcanist.ts`, `hc-reaver.ts` (Act I stages);
   - new scenes: `src/data/dialogue/hc-arcanist-depth.ts`, `hc-reaver-depth.ts`;
   - lair codexes: `src/data/dialogue/hc-ash-shared.ts` (end of file);
   - codex entries: `src/data/lore/hc-ash.ts`;
   - routing: `src/data/npcs/hc-ash-capital.ts`, `hc-ash-frontier.ts`.
4. `docs/lore/hollow-crown/08-canon-rulings.md` and your school's outline in `06-outlines/`.

## What to do, per class (Act I only)
- **Main quests (10):** 3–5 stages each (lairs and the gate fight may stay as they are). Add follow, investigate, find or canvass stages **between** the existing beats. Never remove or rename an existing stage id: other scenes key on them.
- **Side quests (8 + 2 mentor):** the 8 sides become **3-part chains**, each part in a different spot, with a turn and a payoff (a flag, a trust change or a later line). The two mentor quests may stay at 2 parts.
- **Key scenes:**
  - The night scene (I-1), the I-5 choice, the half-stone claim (I-8) and the mentor farewell (I-9) grow to 8–14 nodes, with choices in the middle.
  - Add one TRUST-gated branch to the mentor's general dialogue if they don't have one.
- **Travel banter:** at least 2 `dialogue:area-<class>-<slug>` barks (`bark: true`, gated on a stage), placed between two landmarks.
- **Optional areas (Claude 2's):** for your class's realm side, write:
  - `dialogue:obj-<school>-<side>-ruin-find`, `-cave-find`, `-view-find` and `-cave-codex`, each unlocking a new `lore:hc-<school>-<side>-…` entry;
  - names in `src/data/regions/hc/optionalAreas.ts` `OPTIONAL_NAMES`. That's the only part of Claude 2's folder you may edit.
- **Lair codexes:** `dialogue:obj-<school>-<side>-lair-1-codex` … `-lair-3-codex`, plus a lore entry each, in your school's `hc-<school>-shared.ts` and `hc-<school>.ts` lore file.
- **Spread:** move 1–2 town-bound beats per quest outwards, using Claude 2's anchors `way-2`, `way-3`, `way-4` (halfway out to zone N) and `road` (halfway up the road to the gate).
- **Word budget:** about +2,500 words on the main path per class, plus 1,500 optional. Every line final: British spelling, curly apostrophes, no placeholders, funny before sad.

## Rules
- Write new scenes in a **new file** per class, `src/data/dialogue/hc-<class>-depth.ts`. Edit existing files only where a stage needs routing (NPC `dialogue:` and `schedule:` entries keyed on `{ questStage, stage }`) or where an existing line must change to hand off to a new stage.
- **New ids:**
  - world ids carry your class or school prefix: `obj:<class>-…`, `landmark:<class>-…`, `area:<class>-…`;
  - flags are `<class>.*` only;
  - new NPC names must be unique, so grep `src/data` and `docs/lore` first.
- **The engine:**
  - a stage scene keyed on `{ questStage, stage }` stops taking over an NPC's talk once that stage's talk objective for them is done, so their quest offers come back automatically;
  - object scenes queue if another dialogue is open.
- **Never edit:** `src/core`, `src/narrative`, other schools' files, `hc-concordia*`, `hc-heart*`, `hc-bearers`, `hc-sentinels`.
- **Gate**, before you report: `tools/narrative/check.sh <class1>,<class2> 2`. It must show LOGIC 0, solo PASS, co-op PASS, audit clean, 8/8 and **tsc: clean** (its last line, covering narrative-owned files).
  - `[world]` unplaced lines are expected: list them for Claude 2 with placement hints, each with a zone, anchor or `way-N`.
  - `tools/narrative/placements.ts` (build with `tools/narrative/build.mjs … full`) prints them with each objective's marker.
- **Team rules:** at most one gate run at a time machine-wide (check.sh takes the lock itself); no Chrome; no broad `pkill`.

## Report (your final message)
- Per class: stages before → after (mains and sides), and dialogue lines before → after (from the audit).
- The placement list for Claude 2: id, zone or anchor, and a one-line description.
- New canon worth recording (names, facts) and any questions.

---

# Wave 2: Act II class thread and Act III class quests

The same rules as above, for each class's **Act II class thread** (C-1…C-6, plus the 2 featured threads) and **Act III class quests** (III-4 and the 3 sides). Acts I, Concordia and the Heart are done; don't touch them.

**The reference is the Arcanist's Act II and Act III:**
- quests: `src/data/quests/hc-arcanist.ts`, from `ACT II` onwards;
- scenes: the end of `src/data/dialogue/hc-arcanist-depth.ts`;
- routing: `npc:forgewife-ada` and `npc:lissa-marl` in `hc-ash-capital.ts`.

What it did:
- **C-1:** + a look at the school's people or place (Kilnmouth's cold kiln).
- **C-2:** + a **real escort** (Ada to the vent head, with a `regroup` retry stage) and a stage hearing what the escorted NPC sees.
- **C-3:** + a stage telling someone who should hear it (Ada, after the Sentinel).
- **C-4:** + an investigation of three clues before the talk (the chimneys of Gildport).
- **C-5:** + a find after the boss (the half-made setting).
- **C-6:** + a reply or answer stage. `story.act2_ready` moves to the new final stage.
- **Act III sides:** each becomes 3 parts (Lissa: find, then the ledger, then the last page).
- **Featured threads and III-4:** unchanged. They're co-op-critical and boss-paced.

**Per class:**
- Every C-quest reaches 2–4 stages.
- **One real escort** where a beat genuinely is one (§8). Copy C-2's `escort` / `regroup` / `next` shape exactly, and give the escorted NPC a schedule entry at the destination for the stage after.
- Every Act III side quest reaches 3 parts.
- About +1,500 words per class.
- New scenes are appended to your class's `hc-<class>-depth.ts`.

**Gate:** as before, `check.sh <pair> 2` (with tsc). Then SendMessage Claude 4 the placement list for that pair, right away.
