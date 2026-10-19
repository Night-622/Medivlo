# 08: Narrative Data Formats

**FROZEN v1.** The TypeScript for `src/core/types.ts` is in [narrative-types.ts](narrative-types.ts). Claude 1 pastes it over the "DRAFT: Claude 4" block. It's aligned with the existing core style: key-discriminated `Condition` and `Effect`, defs extending `BaseDef`, and registry kinds taken from the id prefix.

## Ids (the registry kind comes from the prefix)
`quest:*`, `dialogue:*`, `npc:*`, `lore:*` (codex entries), `faction:*`. Referenced: `region:*`, `landmark:*`, `area:*`, `instance:*`, `obj:*` (Claude 2); `enemy:*`, `item:*`, `trait:*`, `class:*`, `spell:*` (Claude 3).

## Conditions and effects
- `NarrativeCondition` = core `Condition` plus `questActive`, `questFailed`, `questOutcome`, `stat` (attribute ≥ min), `classIs`, `dialogueTag`, `rep`, `loreUnlocked`, `hour`. These are evaluated in `src/narrative/conditions.ts`, which delegates the core variants to `evalCondition()`.
- `NarrativeEffect` = core `Effect` plus `addFlag`, `setStage`, `completeQuest`, `failQuest`, `reward` (→ the `quest:reward` event), `unlockLore`, `openDialogue`, `companion`, `loyalty`. These are applied in `src/narrative/effects.ts`.
- Dialogue skill checks are **passive**: attribute ≥ DC (DCs 10/15/20/25/30, per Claude 3). Locked choices can be shown with a label such as `[Will 15]`.

## Events: requested additions or changes to `src/core/events.ts`
| Event | Payload | Emitter | Why |
|---|---|---|---|
| `quest:completed` (change) | add `outcome?: string` | Claude 4 | branching outcomes |
| `quest:failed` | `{ questId }` | Claude 4 | |
| `quest:objective` | `{ questId, objectiveId, count, target }` | Claude 4 | HUD tracker updates |
| `dialogue:choice` | `{ dialogueId, nodeId, choiceIndex }` | Claude 4 | analytics, companion reactions |
| `dialogue:ended` (change) | add `npcId?: ContentId` | Claude 4 | `talk` objectives |
| `codex:unlocked` (change) | add `sectionId?: string` | Claude 4 | progressive sections |
| `reputation:changed` | `{ factionId, value, delta }` | Claude 4 | HUD toast, world reactions |
| `companion:changed` | `{ npcId, following }` | Claude 4 | Claude 2/3 spawn the follower |
| `narrative:toast` | `{ text, kind: 'quest' \| 'lore' \| 'rep' }` | Claude 4 | optional; HUD can show it |

Consumed: `interact`, `landmark:*`, `region:entered`, `area:entered`, `instance:*` (Claude 2); `enemy:killed`, `enemy:cleansed`, `item:picked`, `trait:earned` (Claude 3); `flag:changed` (core).

## GameState usage (`narrative` slice)
- `quests[questId]`: `QuestProgress` (`stage`, `objectives` counts, `completed`, `failed`). **Request:** add `outcome?: string` to `QuestProgress`.
- `trackedQuest`, `codexUnlocked` (lore ids), `reputation` (faction id → -100..100).
- `ext.loreSections: Record<LoreId, string[]>`, `ext.dialogueOnce: Record<DialogueId, string[]>`.
- Shared `flags`: all story flags (see 06-campaign.md flag reference), e.g. `companion.maren.loyalty`, `ashmark.rank`, `world.embers_held`.

## Reputation
Tiers: Hated ≤ -60 · Hostile ≤ -25 · Wary < 0 · Neutral < 25 · Friendly < 60 · Honoured < 90 · Exalted ≥ 90. Spillover on gaining Δ with faction A: each B changes by `trunc(Δ × relation(A,B) / 200)`.
