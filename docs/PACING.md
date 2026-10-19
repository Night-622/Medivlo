# Pacing plan: getting each campaign to 15–20 hours

**User requirement:** each class campaign is about 15–20 h long, with about 60 quests and 8 bosses.

**Measured (2026-10-20, Claude 2's integrated playthrough, `tools/playthrough`, human-time estimator):**
Act I plays in about **1.5 estimated human hours** (Arcanist: walking 0.39 h, combat 0.11 h, reading 0.18 h,
menus 0.06 h, quest overhead 0.70 h). At that rate a whole campaign is about 4.5 h estimated, or roughly 7–9 h for
real players, who usually take 1.5–2× the estimate. That's about half the target.

**Target:** an estimated **4–5 h per act** (13–15 h per campaign, which should come out at 15–20 h for real players).
We keep the 60-quest structure and add depth, not quest count. Claude 2's estimator is the gate: the report lists
each class's per-act split. An act passes when its estimate is ≥ 4 h, combat is ≥ 30% of it and no single bucket
is over 45%.

| bucket (per act) | now | target | owner | levers |
|---|---|---|---|---|
| combat | 0.1 h | **1.3–1.6 h** | Claude 3 (+2) | Enemies take 2–3× longer to kill at the intended level. Elite packs and patrols on routes. Kill objectives count higher (e.g. 4 → 8–12). Lairs with waves. Bosses with 2–3 phases at about 90–150 s each. The level curve stays on the act bands so fights stay meaningful |
| walking / exploration | 0.4 h | **1.0–1.3 h** | Claude 2 | Longer routes between story beats (objectives spread across the realm, not clustered). Optional areas off each route (ruins, caves, viewpoints) with codex, loot and lore. Lairs grow from 3–4 rooms to 6–9 with branching. Waystones placed so travel is a choice, not constant |
| quest structure | 0.7 h | **1.0–1.2 h** | Claude 4 | Main quests get 3–5 stages with travel between them. Side quests chain (2–3 parts). Find, follow, investigate and escort objectives alongside kill and talk. Bounties repeatable once per rest |
| reading / story | 0.2 h | **0.4–0.5 h** | Claude 4 | Fuller key scenes, optional deeper conversations (INSIGHT/TRUST branches), codex finds in the new optional areas, companion and mentor banter while travelling |
| menus / builds | 0.06 h | 0.2 h | Claude 3 | More build decisions (tree points, upgrades and runeforge matter at each act boundary). Shops worth visiting |

Rules:
- No padding. Every added minute is a fight, place, choice or line that's worth having. Don't slow walking, make
  backtracking tedious, or add empty kill counts.
- Co-op keeps working: added content scales per player (Claude 3) and party votes stay meaningful (Claude 4).
- Gates stay green: narrative LOGIC 0, world unplaced 0, fight sim, playthrough 0 free objectives.
- Measure after each pass. Claude 2 re-runs Ash and Rime first (four classes), then all 24.

## Progress
- 2026-10-20 ~05:00, Ash/Rime Act I with passes 1, 2 and 4, Claude 3 A–D and Claude 4's Ash depth. Estimated human h,
  quest-only → explorer: Arcanist 2.63 → 3.08, Warden 3.12 → 3.97, Rimecaller 2.63 → 3.03, Reaver → 3.73 (was 1.4–1.6 h).
  Walking and quest/stage buckets are near target. Combat (0.4–1.1 h) and reading (0.3–0.5 h) still need to grow.

- 2026-10-20 05:45: the user takes over playthrough testing; bot playthrough runs stop. Passes continue and the user's play decides the final pacing.
