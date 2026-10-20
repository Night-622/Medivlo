# 10: Campaign data style guide (frozen from the Ash reference)

The **Ash campaigns are the reference implementation**. Read their data before writing any other class:
- quests: `src/data/quests/hc-arcanist.ts`, `hc-reaver.ts`
- dialogue: `src/data/dialogue/hc-arcanist-act1.ts`, `hc-arcanist-people.ts`, `hc-reaver.ts`, `hc-ash-shared.ts`
- NPCs: `src/data/npcs/hc-ash-capital.ts`, `hc-ash-frontier.ts`
- codex: `src/data/lore/hc-ash.ts`

Every class campaign must match them in structure, density and tone. Binding canon is in [08-canon-rulings.md](08-canon-rulings.md); the story is the class outline in [06-outlines/](06-outlines/).

## 1. Files, per school
| File | Contents |
|---|---|
| `src/data/npcs/hc-<school>-capital.ts`, `hc-<school>-frontier.ts` | realm NPCs (`presentWhen: { heroClass }`), plus the school's Concordia NPCs (diaspora, C-4 informants) |
| `src/data/quests/hc-<class>.ts` | ~30 quests: Act I (22) and the Act II class thread (C-1…C-6 plus 2 featured) |
| `src/data/dialogue/hc-<class>.ts` (or `-act1.ts` and `-people.ts` if large) | all of that class's dialogue |
| `src/data/dialogue/hc-<school>-shared.ts` | scenes both classes of the school share: the gate-seal object `dialogue:obj-<school>-gate-seal`, with one entry per class, plus shared diaspora NPC general talk |
| `src/data/lore/hc-<school>.ts` | codex: the realm, its places and factions, mentors, nemeses, the Sentinel(s) |

**Never edit shared files.** These belong to Claude 4 and every campaign:
- `hc-concordia*.ts`, `hc-bearers.ts`, `hc-sentinels.ts`
- `npcs/hc-concordia.ts`
- anything in `src/narrative/` or `src/core/`
- another school's files

Use the hooks below instead.

## 2. Hooks into shared content (no shared edits needed)
| You want | Do this |
|---|---|
| A Brindlecross NPC (any of the 14) to say something class-specific | Define `dialogue:hook-<class>-<npc-slug>`, e.g. `dialogue:hook-reaver-hobb`. Its entries should only pass when relevant; otherwise talk falls through to the NPC's normal dialogue. Hooks are optional. |
| A featured-bearer scene | Define `dialogue:<class>-featured-<bearer-class>`. The bearer NPC already lists it. Featured bearers per class are in `src/narrative/engine/classes.ts` (`featured`). |
| A Sentinel's release | Already written: `dialogue:sentinel-release-<school>` (Ash, Rime, Storm, Umbral, Verdant, Blade, Iron, Fist, Hunt, Guile) and `dialogue:sentinel-release-morwen` (sets both Radiance and Song). Open it from the kill stage's `onComplete`. |
| Shared Concordia objects (barrow door, ferry, Gate Circle arches) | Don't hang class scenes on them. Use your own `obj:` / `landmark:` ids and list them for Claude 2. |
| Any new id in a SHARED place (Concordia, the Heart) | Start it with your class or school: `obj:ranger-…`, `landmark:rime-…`, `lore:hc-rime-…`. Sentinel codex entries live only in that Sentinel's own school's lore file. Duplicate ids are a gate failure: the Registry silently keeps the later file. |

## 3. Quest skeleton (Act I)
- **I-1** `autoStart: true`, `requires: { heroClass: '<class>' }`. Stage 1 `onEnter: [{ openDialogue: '<night scene>' }]`. The Bell rings, the half-stone wakes, the hero meets the mentor. Set `<class>.bell_heard`.
- **Chain** each main quest from the previous one with `onComplete: [{ startQuest: … }]` and `requires: { all: [heroClass, questCompleted(prev)] }`.
- **Lairs:**
  - Enter with `reach: 'inst:<school>-<side>-lair-N'`, then the boss `kill`.
  - Lair 1 is the realm mini, `bx_<school>_3` or `_4`, per 02-realms.md.
  - Lair 2 is Claude 3's `cb_<slug>`; lair 3 is the nemesis, `cb_<slug>`. The exact ids are in `src/data/enemies/hc/campaign.ts`.
- **I-8:** claim the half-stone with `interact: 'obj:<school>-<side>-halfstone'`, then set `<class>.halfstone`. The nemesis escapes towards the gate (08 R7).
- **I-9:** the mentor farewell is a **trust check**:
  - Friendly gives a gift (`giveItem` with a handoff `i_*` id).
  - Trusted adds a second, personal one.
  - Below Friendly, a plain goodbye.
- **I-10:**
  - Kill the realm boss `bx_<school>_5`, then `interact: 'obj:<school>-gate-seal'`.
  - The seal dialogue lives in `hc-<school>-shared.ts`, with one entry per class.
  - Stage `onComplete`: `story.gate_open`, `story.act = 2` and `<class>.act1_done`.
- **I-5:** the faction choice is a `scope: 'party'` vote with 3 options:
  - two faction options;
  - an INSIGHT option `when: { insight: '<flag>' }`, where the flag comes from the Friendly mentor quest **or** a side quest (two routes).
  - Set `<class>.<choice>` at the moment of decision, and branch later content on it.
- **Side quests:** 8, two per zone. **Mentor thread:** 2. The Friendly one sets an insight; the Trusted one sets `<class>.<mentor-slug>_devotable`. **Bounties:** 2, from a bounty-board NPC.
- **Markers:**
  - `{ place: 'zone:…' }` for zones and areas;
  - `{ landmark: … }` for landmarks;
  - `{ region: 'region:…' }` only for Morvane regions.
- **Night-only beats:**
  - The object dialogue has three entries: night (`hour: [21, 4]`, sets the flag), day ("come back at night"), and plain.
  - The quest objective is `when: { flag }`.

## 4. Act II class thread
- **C-1:** `autoStart`, `requires` the hero's class and `questCompleted('quest:cc-through-the-arch')`. Find your school's people in Concordia, using the embassy table in 08. Diaspora NPCs go in your school's npc file (`region: 'region:…'`, `presentWhen: { flag: 'story.act', op: '>=', value: 2 }`).
- **C-2 / C-3, Sentinel A:**
  - Approach, then `reach: 'inst:sentinel-<school>'`. Varric is `inst:varric-barrow`; Morwen is `inst:drowned-abbey`.
  - Kill `bx_*`, then `onComplete: [{ openDialogue: 'dialogue:sentinel-release-…' }]`.
  - Then a `release` stage waiting on `when: { flag: 'story.sentinel.<school>' }`.
- **C-4:** follow the nemesis.
- **C-5, Sentinel B:** release scene, plus `setFlag story.bearer.<X>`. X is the bearer of that Sentinel's school, and must be **neither** your sibling **nor** one of your featured bearers, so each source counts a distinct bearer (08 R11).
- **C-6:** a personal scene, usually a mentor's message delivered by your own messenger NPC at `landmark:gate-circle` (see `npc:brenna-runner`). Its `onComplete` sets **`story.act2_ready`**, which unlocks II-6.
- **Featured threads** (2), with the **co-op-safe pattern**, which is mandatory:
  - `autoStart: true`, `requires` heroClass and `questCompleted('quest:cc-stone-court')`.
  - The work stage uses your own objects.
  - The `back` stage objective is `when: { any: [{ flag: '<class>.<x>_thanked' }, { partyHasClass: '<bearer-class>' }] }`; the hook dialogue's `back` node sets the flag.
  - `onComplete` sets `story.bearer.<bearer-class>`.
  - Why: when a party member plays that class, the NPC bearer is hidden. The player *is* that bearer.

## 4b. Act III class quests (III-4 and 3 side quests)
- The shared Heart is `src/data/quests/hc-heart.ts`; read it.
- **III-4, the nemesis remade:**
  - `autoStart`, `requires` heroClass and `questCompleted('quest:heart-stairs')`.
  - Stage `herald`: `kill` the class's Act III form (`cb_*` with slot `herald` or `chimera` in campaign.ts; it **yields**, which counts as the kill). Marker `landmark:twelve-stairs-top`. `onComplete: [{ openDialogue: 'dialogue:<class>-herald-fate' }]`.
  - Stage `fate`: `when: { flag: '<class>.nemesis_fate' }`.
  - **Reopenable:** the nemesis NPC must be present at `landmark:twelve-stairs-top` during the `fate` stage, with that fate dialogue as its first entry (see `npc:ignace-morrow`, `npc:hask`).
- **The fate dialogue** (`scope: 'party'`):
  - spare: gated by the outline's condition, with a `lockedLabel` so players see what they missed;
  - destroy: always available.
  - Each sets `<class>.nemesis_fate` = `'spared'` | `'destroyed'`. The engine derives `story.nemesis_resolved` / `story.nemesis_spared` and despawns or finishes the yielded boss.
- **The mentor's last request:** a node gated on `<class>.<mentor>_devotable` applies `{ trust: '<mentor npc id>', set: 5 }` (Devoted). Report your mentor npc id; Claude 4 adds it to `MENTOR_ID` in classes.ts.
- **Endings and epilogue slides** are shared and generated from your outline's Endings table. Don't write them.
- **Places:** Heart scenes use `landmark:heart-camp`, `landmark:legion-camp` and `landmark:twelve-stairs-top`, or your own `obj:` ids there.

## 5. Dialogue rules
- **Length:** aim for 1–3 sentences per node, as in the handoff; short stage directions in brackets don’t count. A node never passes **360 characters** (about 60 words; the audit’s over-long check); a longer beat becomes two nodes. Characters sound distinct. Every realm is funny before it is sad.
- **Spelling and voice:** British spelling, curly apostrophes (’), no modern idiom, and **no placeholder text**. Nothing ships until all 24 campaigns are done, so every line is final.
- **Choices:** at most **4 visible at once**. Story scenes are `scope: 'party'`; small talk is personal (the default).
- **Chips:**
  - `trust: ±1` sparingly (0–2 per conversation). It pays once per save. If the speaker isn't the NPC whose trust changes, set `trustNpc`.
  - `quest: true` on choices that start or advance quests.
  - `insight: '<id>'` for discoveries, gated by `when` and hidden when the gate fails.
  - `school: '<school>'` for the class flavour options. Don't also prefix the text with "[School]", except for bracketed actions like `[Lift it off.]`.
- **Openers:** givers use the `offer()` helper (`when: fresh(quest)`). Turn-ins are entries keyed on `questStage`, placed before the general entry.
- **Flags:** set quest-critical flags at the moment of decision, in the choice effects. Every critical scene must be reopenable.
- **Ids and flag names:**
  - dialogue ids `dialogue:<class>-<slug>`; object scenes `dialogue:obj-<object-slug>`;
  - flags `<class>.*`, `insight.*` or `story.*` only (no `npc.*`).

## 6. Data rules
- **Creatures** are handoff ids: `bx_*` from the bestiary, `cb_*` from the campaign bosses.
- **Items** are `i_*`, `w_*`, `a_*` or `lg_*`. Rewards use `hcItems`, XP uses `xpTier` 1/2/3, gold uses `gold`.
- **New NPC names** must be unique across the whole bible and data, so grep before using one. NPC ids are `npc:<kebab-name>`.
- **Lore:** add a realm entry, the mentor and nemesis entries (`NpcDef.lore` unlocks on first talk) and the Sentinel entries. Unlock them with quest `reward.lore`.

## 7. Gate (run before calling a school done)
```
tools/narrative/check.sh <class1>,<class2> 4
```
- **Validator:** `LOGIC problems: 0`. `[world]` and `[systems]` lines are other owners' pending work. List every one of your new place and object ids for Claude 2.
- **Solo bot:** PASS (every quest done, or `gated` by trust); `act=3`, `ready=true`, `heart=true`.
- **Co-op bot** (random 4-player parties, random votes): PASS.
- **Realm server** (last line of check.sh, Claude 1’s e2e): `8/8 passed`. It loads every narrative data module in Node the way the realm server does, which catches module-load errors such as using a const before its declaration.

## 8. Depth pass (docs/PACING.md, 2026-10-20)
The 60-quest structure stays. Each act gets **deeper, not longer for its own sake**. Targets per act per class: quest structure 1.0–1.2 estimated hours (now 0.7), reading 0.4–0.5 h (now 0.2). The Ash campaigns are deepened first, as the reference again. Claude 2's playthrough estimator is the gate.

**No padding.** Every added stage is a place, a choice, a discovery or a line worth having. Never add an empty kill count, a back-and-forth with no new information, or a fetch that the story doesn't need.

### Main quests
- **3–5 stages.** At least one stage moves the hero somewhere new: another zone, or a far landmark in the same zone.
- **At least one objective that isn't kill or talk:**
  - **find:** `reach` a hidden spot (a landmark or object Claude 2 places off the path), with a marker on the area, not the spot;
  - **investigate:** `interact` with 2–4 clue objects (`obj:<class>-…-clue-*`, count). Each clue's scene adds a fact, and the last builds to an INSIGHT or a flag that a later scene uses;
  - **follow:** an NPC moves from landmark to landmark by stage. Use schedules with `when: { questStage }` on the NPC and `reach` objectives on those landmarks, and give each leg a line or two;
  - **escort** (real, Claude 3 runs it): the stage starts it with `onEnter: [{ escort: 'npc:x', to: 'landmark:y' }]` (optional `revives`, `hp`, `fights`). Flag `escort.<npc-slug>` goes 'active' → 'arrived' | 'lost'.
    - The objective must complete on either outcome: `when: { any: [{ flag: 'escort.<slug>', op: '==', value: 'arrived' }, { flag: 'escort.<slug>', op: '==', value: 'lost' }] }`. (The Arcanist's C-2 in hc-arcanist.ts is the reference.)
    - On loss, branch to a retry stage: `next: [{ when: { flag: 'escort.<slug>', value: 'lost' }, to: '<retry>' }, { to: '<onward>' }]`. The retry stage's `onEnter` starts the escort again.
    - While active, the NPC's static placement is hidden. On arrival the body is removed and the NPC goes back to their schedule, so give them a schedule entry at the destination for the stages after.
- The I-x skeleton in §3 still holds. New stages go **between** its beats, never in place of them.

### Side quests
- **2–3 parts, as stages of the same quest**, each in a different spot, with a turn in the middle (the problem isn't what it seemed) and a payoff that changes something: a flag, a trust, a later line.

### Scenes and reading
- **Key scenes:** I-1 night, I-5 choice, mentor scenes, the nemesis reveal, I-9 farewell, the C-scenes and III-4 fate. **8–14 nodes**, with the choices that matter in the middle, not only at the end.
- **Optional depth:** every named story NPC gets one **TRUST-gated** branch (Friendly or Trusted, 3–5 nodes, about them, not the plot) and, where the outline allows, one **INSIGHT** branch that pays off later.
- **Travel banter:** `dialogue:area-<trigger>` scenes, gated on the quest stage. The mentor or a companion says 1–3 lines when you enter a zone or area on the way to the next beat. At most one per stage.
- **Codex finds:** small `obj:` scenes or `lore` objects in Claude 2's optional areas (ruins, caves, viewpoints). Each unlocks a codex entry or section (60–120 words, in-world: a letter, a plaque, a ledger page).
- **Word budget per act per class:** about 4,500–5,000 words on the main path, plus 1,500–2,000 optional. All of it final: no placeholders, same voice rules as §5.

### Mechanics already in place
- Bounties are re-posted after every rest (engine; ext.bountyRuns counts runs).
- First Steps (onboarding) runs beside I-1 and is outside the 60.
