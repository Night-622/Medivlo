# 07: Narrative systems: trust, tags, co-op voting and the authority engine

Owner: Claude 4. This covers the handoff's dialogue design ("Dialogue, Pause, Death, Settings (phase 2)" in HANDOFF.md): trust diamonds on the name plate, up to 4 numbered choices, and the choice tags **TRUST ±1**, **QUEST**, **INSIGHT** and **[School]**. It also covers how all of it runs in co-op. Core and net contract changes are listed at the end; they go to Claude 1.

## 1. NPC trust
Six levels, shown as diamonds on the dialogue name plate (handoff `trust: 0–5`).
| Value | Level | Effects |
|---|---|---|
| 0 | **Stranger** | default for most NPCs; basic lines only |
| 1 | **Wary** | a few NPCs start here (Nan Briar starts at 1); some refuse quests |
| 2 | **Neutral** | normal service |
| 3 | **Friendly** | shop prices −10%; personal lines; unlocks the NPC's thread quest |
| 4 | **Trusted** | prices −20%; secrets (often INSIGHT); mentor-gated options |
| 5 | **Devoted** | **only** reached by finishing the NPC's personal thread (an explicit `set: 5`). Needed for some endings (the mentor) |

**Rules:**
- **Storage:** the flag `trust.<npc-slug>` (a number, for example `trust.maren`). The start value is `NpcDef.trust` (default 0). Because it's a flag, it is host state and replicates through `flag:changed`.
- **TRUST ±1 choices** move trust by one step and clamp it to 0–4. Each trust choice pays out **once per save** (it is implicitly `once`). Only a thread ending can set 5.
- **Toasts:** a trust change shows a toast ("Maren Hollis: Friendly ◆◆◆"). Dropping a level shows a red toast.
- **Conditions:** `{ trust: 'npc:maren', op: '>=', value: 3 }`. Level names are allowed as values (`'friendly'`).
- **Prices:** trust replaces the old reputation price tier for Hollow Crown merchants. The old `rep.*` system stays in the engine but isn't used by Hollow Crown content.

## 2. Dialogue choice tags (chips)
Each choice can carry these chips, drawn as small labels after the text (board 8g; handoff colours):
| Chip | Data | Behaviour |
|---|---|---|
| **TRUST +1 / TRUST −1** | `trust: 1 \| -1` (plus `trustNpc` if it isn't the speaker) | Applies to the speaker NPC by default. Shown so the player knows. |
| **QUEST** | `quest: true` | Marks a choice that starts, advances or ends a quest. The validator warns if a QUEST choice has no quest effect. |
| **INSIGHT** | `insight: '<id>'` | A choice that reveals lore. Picking it sets `insight.<id>` and usually unlocks a codex entry. It is often gated by a `when` (you read the book, met the person, have the codex entry). When the gate fails it is **hidden**, not locked, so INSIGHT stays a discovery. |
| **[School]** | `school: '<school>'` | Visible only if the viewer's class belongs to that school (gold frame and school colour). In co-op only players of that school can **vote** for it; others see it dimmed with the school tag. If nobody in the party is of that school, it is hidden. |

- A choice can have several chips (for example `school: 'hunt', trust: 1`).
- **Max 4 choices** shown (handoff layout). The validator errors if more than 4 can be visible at once.
- **Voice:** [School] options should be a short, specific action ("[Hunt] Read the tracks: these wolves were herded"), not a stat check.

## 3. Dialogue scope and co-op voting
Each `DialogueDef` has a **scope**:
- **`party`**: story dialogues (quest givers' quest nodes, cutscene dialogues, set pieces). The whole party sees it, and **every choice node is a vote**.
- **`personal`** (default): small talk, shops, barks, codex chat. Only the player who started it sees it and picks.

### Vote flow (the authority runs the dialogue; clients only render)
1. **Start.** A player interacts with an NPC, and the client sends `interact` (Claude 1's input). The authority's narrative engine picks the dialogue (the first `NpcDef.dialogue` entry that passes, evaluated on **host state**) and opens a **session**: `{ sessionId, dialogueId, initiator, audience: 'all' | [initiator] }`.
2. **Show the node.** The authority interpolates the node text (flags live there) and emits **`dialogue:node`** (new, replicated). It carries the speaker, the text, the mood, and the choice views, each with `{ index, text, chips, school?, locked?, lockedLabel? }`. The client's DialogueBox renders it for everyone in the audience.
3. **Non-choice nodes** (`next`). The **initiator** sets the pace and sends `dialogue:continue`; everyone else sees the same line. In party scope, a continue from anyone else is ignored. As a fallback, the authority auto-advances after 12 s if the initiator disconnects.
4. **Choice nodes.**
   - **Party scope:** the authority calls `net.openVote({ dialogueId, nodeId, choices: [{ index, text, allowed }] }, 30000)`. `allowed` is `'all'`, or the players of the choice's school for [School] options.
   - Each client shows the choices with numbers; `vote:cast` events put each player's portrait pip next to what they picked.
   - The vote resolves when everyone has voted or on timeout; the host breaks ties. Then the authority applies the effects once, emits `dialogue:choice` and moves on.
   - **Personal scope:** the same call, with every choice `allowed: [initiator]` and `audience: [initiator]`. In solo, `LocalNet.castLocalVote` resolves it immediately.
5. **End.** `dialogue:ended { sessionId }` closes the box for the audience.

**Rules:**
- **One party-scope session at a time.** If a second player triggers a party dialogue while one is running, they get a "the party is talking" bark.
- **Personal sessions** can run alongside each other (two players shopping at once).
- **Effects never run on clients.** Quest, flag, trust, item and shop effects run only on the authority. Shop windows open on the initiator's client from a `shop.open` effect addressed to that player.
- **Timeout:** 30 s, with a visible countdown ring. Players who don't vote abstain. If nobody votes, the host's highlighted choice wins (in practice the first choice, or the "leave/back" choice when there is one).
- **Ending votes** (`quest:heart-choice`) use a 60 s timer, and the winning ending is announced as "The party chose …" with the tally.
- **Public realms** (dedicated server, up to 8): there is no host campaign there, so every dialogue is personal scope and only portable content (bounties, shops, codex) is offered.

## 4. The authority-only engine
The narrative core moves to a **Phaser-free engine**. It runs only where `net.isAuthority()` is true (solo, host, server); clients render from replicated events.
```
src/narrative/
  engine/        pure TS, no Phaser, no DOM
    state.ts conditions.ts effects.ts trust.ts quests.ts dialogue.ts (sessions)
    npcs.ts codex.ts reputation.ts banter.ts validate.ts index.ts → installNarrativeAuthority(services)
  client/        UI-side glue (Phaser allowed)
    view.ts      mirrors replicated quest/flag/codex state for the journal and tracker
    index.ts     → installNarrativeClient(scene): DialogueBox ⇄ dialogue:node / vote:open / vote:cast / vote:result
src/ui/narrative/  (unchanged UI components, now fed by client/view.ts)
```
- **Authority inputs:**
  - gameplay events: `enemy:killed`, `item:picked`, `region:entered`, `area:entered` and `landmark:discovered`, all with `playerId`;
  - `interact` from any player;
  - `dialogue:continue` from the initiator;
  - vote results.
  Player-scoped objectives count when **any** party member triggers them.
- **Authority outputs** (all replicated): `quest:*`, `flag:changed`, `codex:unlocked`, `narrative:toast`, `dialogue:node`, `dialogue:choice`, `dialogue:ended`, plus votes through `net.openVote`.
- **Ticking:** almost everything is event-driven. A stepper `sim.add({ name: 'narrative', order: 300, step })` handles:
  - timed objectives;
  - the 12 s auto-advance;
  - schedule changes on hour boundaries.
- **Late join:** a joining guest needs the host's narrative state (active quests and stages, flags, unlocked codex) to fill their journal. That needs a **state sync on join** (contract need N5).
- **Saves:** the host save holds the narrative state. Guests save only what they keep: codex entries, portable-quest completions, and a co-op journal record.

## 5. Data formats (Hollow Crown content)
```ts
// dialogue (TS data, as today; handoff DLG maps 1:1)
const d: DialogueDef = {
  id: 'dialogue:cc-maren-wolves', scope: 'party',
  entries: [{ node: 'start' }],
  nodes: {
    start: { speaker: 'npc:maren', text: 'Wolves don’t come this far out of the Gloamwood. Not on their own.', choices: [
      { text: 'Then something’s driving them.', to: 'driving', quest: true, effects: [{ startQuest: 'quest:cc-wolves' }] },
      { text: '[Hunt] They’re herded. Look at the spacing.', to: 'herded', school: 'hunt', trust: 1 },
      { text: 'You wear one of them.', to: 'pelt', insight: 'maren-pelt', when: { codexKnown: 'lore:gloamwood-wolves' } },
      { text: 'Not my problem.', to: null, trust: -1 },
    ] },
    // …
  },
};
```
- **Handoff DLG → data:** `[choiceText, next, trustDelta, tagLabel, color, schoolFilter]` becomes `{ text, to: next, trust: trustDelta, school: schoolFilter, quest/insight from tagLabel }`. The colour comes from the chip type or school, so it isn't stored.
- **NpcDef** gains:
  - `trust?: 0–5` (start value);
  - `school?: SchoolId` (the handoff `school_*`, drawn as the crest on the name plate);
  - `services?: string[]` (the handoff list, shown in the NPC screen).
  - `people` gives way to `origin: SchoolId | 'concord'`.
- **Class-aware text:** `{class}`, `{school}` and `{realm}` tokens, plus the conditions `heroClass` and `heroSchool` (the **campaign owner's** class, meaning the host) and `partyHasClass` / `partyHasSchool` (anyone in the party).

## 6. Validation (`validateContent()` keeps running)
New checks:
- At most 4 choices can be visible at once.
- `school` values are real schools.
- Trust effects point at real NPCs.
- An `insight` id isn't reused by two different choices.
- A QUEST chip has a quest effect.
- Every `scope: 'party'` dialogue has no shop effect.
- Every class's campaign has ≥ 1 entry quest gated by `heroClass` and an ending path (I-10 → II-6 → III-7).

The soft-lock bot is extended to run **per class** (24 runs × seeds) and in **co-op vote mode**: random votes and random [School] eligibility, checking that no vote can strand a quest. The hard rule still applies: quest-critical flags are set at the moment of decision, and every critical scene can be reopened.

## 7. Contract needs (to Claude 1: core and net)
- **N1 `types.narrative.ts`:**
  - `SchoolId` (12 schools).
  - `DialogueChoice` gains `trust?`, `trustNpc?`, `quest?`, `insight?` and `school?`.
  - `DialogueDef.scope?: 'party' | 'personal'`.
  - `NpcDef` gains `trust?`, `school?`, `services?`, and `origin` replacing `people`.
  - New `NarrativeCondition`s: `trust`, `heroClass`, `heroSchool`, `partyHasClass`, `partyHasSchool`, `insight`.
  - New `NarrativeEffect`: `{ trust: NpcId, delta?: number, set?: number }`.
- **N2 events** (replicated):
  - `dialogue:node { sessionId, dialogueId, nodeId, audience, speaker, text, mood?, choices: ChoiceView[] }`.
  - `dialogue:started` / `dialogue:ended` gain `sessionId`, `initiator` and `audience`.
  - `dialogue:choice` gains `sessionId` and `tally?`.
- **N3 ClientMsg:**
  - `{ type: 'dialogue:continue', sessionId }`;
  - `{ type: 'interact', target: EntityId }`, if not already in your input set.
- **N4 VoteOpen:** add `audience: PlayerId[] | 'all'` (who sees it) and `sessionId`.
- **N5 state sync on join:** a hook such as `net.addStateSync({ name: 'narrative', collect(): unknown, apply(state: unknown): void })`. It sends the host's narrative state to a joining guest, and to everyone on reconnect.
- **N6 party queries:** `net.session().members` already has `classId`. I need a class → school map from core or data, `classSchool(classId): SchoolId`, owned by whoever owns the class defs.
- **N7 `@/systems`:** the engine should not import Phaser through `@/systems`. `activeDialogueTags` (the old trait/class tags) is replaced by the conditions above, so that import goes away.
