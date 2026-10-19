# 05: Campaign framework

Every one of the 24 classes has **its own full campaign**: about 15–20 hours, ~60 quests and 8 bosses. Each starts in the class's start area in its school's realm and ends at the Hollow King in Concordia, with endings flavoured for the class. This doc is the template; [06-outlines/](06-outlines/) fills it in per class.

## Shape at a glance
| Act | Where | Levels | Quests | Bosses | Ends when |
|---|---|---|---|---|---|
| **I: the Realm** | the class's start area in its realm, then the realm gate | 1–10 | 22 | 4: lair 1, lair 2, lair 3 (nemesis I), the gate (realm boss) | the realm boss falls and the hero opens the gate with their half-stone. Sets `story.act = 2` |
| **II: Concordia** | Morvane, from the Gate Circle and Brindlecross outward | 10–23 | 24 | 2: Morvane Sentinel A (school), Morvane Sentinel B (class) | the Turning Bell rings and the Weeping Wall parts. Sets `story.act = 3` and `story.heart_open` |
| **III: the Heart** | the Heart of Morvane and the Concord Citadel | 24–30 | 14 | 2: the nemesis remade (Herald or Union Chimera), then the Black Concord and the Hollow King (one encounter, two stages) | the ending choice, then the epilogue. Sets `story.ending` |
| | | | **60** | **8** | |

Optional extras, not counted above: the nine other Morvane Sentinels as **Sentinel hunts** (Rook's bounty board, Act II+), each realm's spare mini as a postgame bounty, and Mags the Knife. Each Sentinel hunt also frees that school's bearer to stand with you (+1 bearer, 08 R11).

## Act I: the Realm (22 quests)
**Main (10):**
| # | Beat | Notes |
|---|---|---|
| I-1 | **The Bell** | Night prologue. The Drowned Bell rings across the realm; the half-stone wakes in the hero's chest. A tutorial in zone 1. Meet the mentor. |
| I-2 | **The Errand** | The mentor's first task, which reveals the local crisis. |
| I-3 | **lair 1** | The realm mini-boss (boss 1). It has the first black tears seen in the campaign. |
| I-4 | **The Rumour** | Zone 2. The nemesis is introduced, usually as an ally, an authority or a friend. |
| I-5 | **Faction choice** | The realm's two factions want different things from the hero. The first big vote node. Sets a class flag used in Acts II and III. |
| I-6 | **lair 2** | The class's own boss (boss 2). |
| I-7 | **The Turn** | The nemesis reveals what they want the half-stone for. INSIGHT options can see it coming. |
| I-8 | **lair 3** | Nemesis I (boss 3). The hero wins their **half-stone**; the nemesis escapes towards the gate. |
| I-9 | **To the Gate** | The road to `area:<school>-gate`. The mentor's farewell (a trust check). |
| I-10 | **The Gate** | The realm boss (boss 4). The hero opens the gate with the half-stone and steps through to Concordia. |

**Class side quests (8):** two per zone, written for the class's people and themes. At least one per zone should pay off later (a returning NPC in Act II or III, or an epilogue slide).

**Mentor thread (2):** two quests that raise the mentor's trust and set up the class's best ending.

**Bounties (2):** the realm's common creatures, posted at the start area's board.

## Act II: Concordia (24 quests)
### The shared spine (6 main; written once and class-tagged)
| # | Quest | Giver | Notes |
|---|---|---|---|
| II-1 | **Through the Arch** (`quest:cc-through-the-arch`) | | The hero steps out of their arch at the Gate Circle at dusk; wolves; Maren. Replaces the handoff's *First Steps in Brindlecross*. |
| II-2 | **The Wolves at the Gate** (`quest:cc-wolves`) | Maren | handoff quest |
| II-3 | **The Drowned Bell** (`quest:cc-drowned-bell`) | Godric → Aldous | handoff quest. It establishes that the Bell must ring for the Turning to open the Citadel. |
| II-4 | **Tears of the Stag** (`quest:cc-tears`) | Nan Briar | handoff quest; the truth of the tears, part 1 |
| II-5 | **The Stone Court** (`quest:cc-stone-court`) | Ysolde | The bearers gather. Meet your sibling bearer and the featured bearers. The goal: twelve Sentinel marks to open the Citadel. You can win one (your school's) and help others. |
| II-6 | **The Eve of the Turning** (`quest:cc-eve`) | Aldous | Act II finale. The bearers go to the Abbey. Abbess Morwen rises, sees the stones carried at a true Turning, and yields (08 R6); Aldous rings the Bell from his boat. Your nemesis strikes, stealing your sibling bearer's half-stone, and flees into the Heart. The Weeping Wall parts. |

### The class thread (6 main, per class)
| # | Beat |
|---|---|
| C-1 | **Diaspora:** find your school's people in Concordia (Wardenhold for Rime, Kilnmouth for Ash, and so on) and learn where your school's Warden lies. |
| C-2 | **Road to Sentinel A:** the approach. |
| C-3 | **Sentinel A** (boss 5): the release scene gives `story.sentinel.<school>`. |
| C-4 | **The nemesis's trail:** the nemesis is in Concordia and has joined the Hollow King's Heralds, or is being bound into the Chimera. |
| C-5 | **Sentinel B** (boss 6): reached by following the nemesis. Beating it helps another school's bearer earn their mark (+1 `story.bearers_gathered`). |
| C-6 | **Before the Turning:** a personal scene: the mentor's letter, the sibling bearer, the stakes. |

### Shared side quests (8; the handoff's quests, written once)
*A Warm Bed* (Wil), *Hollow Iron* (Odo), *Hold the North Road* (Rook; Mags the Knife), *Something in the Reeds* (Tamsin), *Empty Graves* (Hobb; leads to Varric's barrow), *Pip's Big Adventure* (Pip), *Rebuild the Mill* (Corwin), *Wake the Waystones* (Sela).

### Featured bearers (2) and bounties (2)
- **Bearer threads (2):** short quests helping the outline's featured bearers. Each adds +1 `story.bearers_gathered`.
- **Bounties (2):** *Bounty: Alpha of the Gloam* and *Bounty: the Slime King*, both from the handoff. The Slime King is the Ooze Sovereign's herald-blob, a lesser fight.

## Act III: the Heart (14 quests)
### Main (8)
| # | Quest | Notes |
|---|---|---|
| III-1 | **The Weeping Wall** (`quest:heart-wall`) | Through the parted tears, with Sela's waystone. |
| III-2 | **The Legion Camp** (`quest:heart-legion`) | The hollowed who walked in over thirty years, among them Maren's mother. |
| III-3 | **The Twelve Stairs** (`quest:heart-stairs`) | Each school's stair; your own stair is a class scene. |
| III-4 | **The Nemesis** (class quest) | Boss 7. The nemesis remade: the **Herald** for magic schools, bound into the **Union Chimera** for martial schools. A choice to spare or destroy sets `<class>.nemesis_fate`. |
| III-5 | **The Citadel** (`quest:heart-citadel`) | The throne hall. Godric's memory comes true. |
| III-6 | **The Hollow King** (`quest:heart-king`) | Boss 8: the Black Concord (stage 1), then Casimir (stage 2). The truth is told in a class-tagged confrontation. |
| III-7 | **The Choice** (`quest:heart-choice`) | The ending, by vote (see below). |
| III-8 | **After** (`quest:heart-after`) | The epilogue slides, then the credits. |

### Side (6)
- **Class side (3):** the mentor's last request; the nemesis aftermath; one class-specific loose end from Act I.
- **Shared side (3):** *Maren's Mother* (Legion camp), *What Godric Saw* (INSIGHT), *The Last Chronicle* (Ysolde and Pip; INSIGHT, the 13th note).

## Endings
At the throne, with the crown in reach, the party votes on one of these. Each ending has a **class-specific** realm slide, mentor slide and nemesis slide, plus the shared Concordia and Casimir slides. Wil sings the ballad, with a class verse.
| Ending | Flag `story.ending` | Available | What happens |
|---|---|---|---|
| **The Turning** | `turning` | `story.bearers_gathered >= 6` **and** mentor trust ≥ Friendly | The stones are set back and sing. The crown passes in turn to Fist (robbed in C. 1012), and the Concord is restored. Casimir hears the Chord once, the tears stop, and he dies at peace. |
| **The Unmaking** | `unmaking` | always | The crown is broken. The stones stay home for good, and the gates open without a crown. The realms are free, separate and uneasy; there are no more Concordants. |
| **The Hollow Crown** | `crowned` | always | The hero puts the crown on. With a school's spark the stones *do* sing for them, and the hero rules as Concordant out of turn, as Casimir did. The class slide shows what their school becomes. The last frame: one black tear. |
| **The First Chord** (secret) | `first-chord` | INSIGHT flags `insight.godric_saw`, `insight.tears_older` and `insight.who_rang`; `<class>.nemesis_fate = spared`; mentor trust **Devoted** | The bearers sing the stones *to Casimir*, and the Unsung hears: the rest between the notes, the 13th note, Concordia's own. The crown becomes a bell; the Turning returns with Concordia in the ring. The best ending. |

**Who rang the Bell** (the `insight.who_rang` reveal, Act III): Casimir did. He has been calling the stones home for thirty years, and the Bell only rang this time because he finally stopped trying to keep them.

## Co-op story rules
- **The party plays the host's campaign.** All quest progress, flags, NPC trust and endings are the host's state and are saved to the host's save.
- **Guests keep everything they earn:** XP, levels, loot (shared drops, scaled per player), Embershards, codex entries (unlocks replicate to everyone) and a journal record ("Co-op: \<host\>'s story").
- **Portable quests:** the shared Act II side quests and bounties are portable. If a guest has that quest active or available in their own save, completing it in the host's world completes it in theirs too. Main and class quests are never portable.
- **Player-scoped objectives** (reach X, talk to Y, kill Z) count for the host's campaign when **any** party member triggers them (Claude 1's net rule c).
- **Story choices are votes;** the host breaks ties. Small talk, shops and barks belong to the player who started them. See 07-narrative-systems.md.
- **[School] options** appear for every party member of that school. Only they can vote for them; the others see them dimmed with the school tag.
- **Bearer NPCs** whose class is in the party are hidden; the player is that bearer (04-concordia.md).

## Ids and flags
- **Class quests:** `quest:<class>-<slug>`, for example `quest:arcanist-the-bell`. Shared Concordia quests are `quest:cc-<slug>`; shared Heart quests are `quest:heart-<slug>`.
- **Dialogues** follow the same pattern: `dialogue:<class>-…`, `dialogue:cc-…`, `dialogue:heart-…`.
- **Story flags** (shared by every campaign; a save is one character):
  - `story.act` (1|2|3)
  - `story.gate_open`
  - `story.heart_open`
  - `story.sentinel.<school>`
  - `story.bearer.<class>` (a bearer stands with you), and `story.bearers_gathered`: derived by the engine as the number of distinct bearer flags, never set directly (08 R11)
  - `story.ending`
- **Class flags:** `<class>.<name>`, for example `arcanist.faction` and `reaver.nemesis_fate`.
- **Insight flags:** `insight.<name>`.
- **Release gating:** `content.class.<id>` gates character creation and the campaign for that class. Shared Concordia and Heart content ships when the first class does, but nothing is public until all 24 are done (REBUILD.md).

## Rulings that bind every outline
See [08-canon-rulings.md](08-canon-rulings.md). The ones that shape campaign structure:
- **R7:** the nemesis escapes to the realm gate, waits, and slips through behind the hero at I-10.
- **R10:** the sibling bearer is first met at II-5.
- **R11:** bearer sources and the threshold of 6.
- **R12:** what helping a bearer claim a mark means in your campaign.
- **R21:** every I-10 sets `story.gate_open` and `story.act = 2`.
