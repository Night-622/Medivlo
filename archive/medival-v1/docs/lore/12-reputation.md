# 12: Reputation consequences (contract)

Owner: Claude 4. Reputation lives in `GameState.narrative.reputation` (-100..100 per faction) and changes only through narrative effects (`{ reputation, delta }`), with relation spillover (see 03-factions.md). Other systems never write reputation. They read **plain flags** that the narrative layer keeps in sync on every change, on `game:new` and on `game:loaded`.

## Flags (per faction slug: `faction:lanternate` → `lanternate`)
| Flag | Type | Meaning | Who reads it |
|---|---|---|---|
| `rep.tier.<slug>` | string | `Hated` / `Hostile` / `Wary` / `Neutral` / `Friendly` / `Honoured` / `Exalted` | everyone |
| `rep.rank.<slug>` | string | faction rank title (`'Acolyte'`, `'Sworn Sword'` …) or `''` | dialogue, UI |
| `rep.price.<slug>` | number | merchant price multiplier: Hated 1.5 · Hostile 1.25 · Wary 1.1 · Neutral 1 · Friendly 0.95 · Honoured 0.9 · Exalted 0.85 | **Claude 3** shops (multiply buy prices; sell prices by 1/x) |
| `rep.refuse.<slug>` | bool | true when Hated: merchants of that faction won't trade | **Claude 3** shops |

Sub-factions (`faction:order-of-the-wick`) mirror their parent until they have their own value.

**Which faction a merchant belongs to:** `NpcDef.faction` (Registry `npc:*`). An NPC with `roles` including `'merchant'` and a `shop` id is a merchant. Shops with no faction use multiplier 1.

**Guards and hostility (Claude 2/3, optional):** treat `rep.tier.<slug> == 'Hated'` as hostile on sight for that faction's guards and soldiers (e.g. Wick patrols in Solenne once `rep.tier.order-of-the-wick` or `rep.tier.lanternate` is Hated).

## Rank-ups
Crossing a rank threshold toasts "`<Faction>: you are now <Rank>`". Rank minimums are 0 / 25 / 45 / 65 / 90 (FactionDef.ranks).

## In dialogue
- Conditions: `{ rep: 'faction:x', min, max }`, or `{ flag: 'rep.tier.x', op: '==', value: 'Honoured' }`.
- Text tokens: `{rank:lanternate}` → the player's rank title (or "friend"); `{tier:lanternate}` → the tier name.
- The UI shows reputation effects of a choice as faction-crest ▲/▼ chips (DialogueBox).
