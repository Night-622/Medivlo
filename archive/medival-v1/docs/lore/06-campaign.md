# 06: Campaign Outline

Structure: **Prologue → Act I → Act II → Act III**, each made of chapters, each chapter made of main quests (`quest:*`). Side and faction quests hang off each region. Key choices set **world flags** that other systems read (Claude 2 for world state, Claude 3 for rewards, Claude 1 for UI).

Embers: there are **Seven**. The player gets #1 in the prologue. The rest are spread across Act I (1), Act II (4) and Act III (1, held by Ysolde). The seventh is the one that hit Solenne itself, and Ysolde kept it.

| # | Ember | Where it fell | Act |
|---|---|---|---|
| 1 | **Ember of the Mere** | Wennamere, Drowned Abbey (Aldermoor) | Prologue |
| 2 | **Ember of the Fen** | Varn (Greywater Marsh), held by Aldwin Varn | Act I |
| 3 | **Ember of the Deep** | under Korrath, by the failed Nails (Ironspine) | Act II |
| 4 | **Ember of the Wolf** | the Moot-stones (Frostreach); the Hrothi think it's a god-sign | Act II |
| 5 | **Ember of the Tide** | fished up by the Salt League, auctioned in Brackhaven/Isles | Act II |
| 6 | **Ember of the Glass** | the ruins of Qadir (Cinder Wastes), guarded by an Ashwyrm | Act II |
| 7 | **Ember of the Lantern** | kept by Ysolde from the cathedral | Act III |

The Lanternate holds none, but Vellane wants them all. Ylwen holds none, but has the Lullaby.

---

## PROLOGUE: "The Ashmark" (region:aldermoor)
Fully specified in [07-prologue.md](07-prologue.md).
- The anniversary of the Night of Falling Ash. Your mark ignites the remembrance pyre, Hollowed attack, a boy goes missing, an inquisitor arrives, a cultist is unmasked, the mere is drained, and the Drowned Abbey is cleared. You claim **Ember #1**, have your first **vision of Ysolde**, and **Hesta Corrow** finds you.
- **Choices carried forward:** `prologue.tobin_fate`, `prologue.stag_fate`, `prologue.oswin_fate`, `prologue.hale_outcome`, `prologue.anselm_secret`.
- **End:** `prologue.complete = true`. The roads out open.

---

## ACT I: "The Long Winter" (the Haldmarch)
Regions: Greywater Marsh, Kingsvale, Witherdowns, Ylwen Deepwood, Ironspine Foothills, Saltreach Coast.
Theme: *a kingdom freezing to death argues about who to blame.*

### Chapter 1: "Cinderhold" (Kingsvale)
- `quest:the-last-warden`: travel with Hesta to the ruins of Cinderhold. Learn what the Embers are and what the Ashmark means. Rekindle Cinderhold's ley-brazier, which makes it the **hub base**. Sets `act1.cinderhold_restored`.
- `quest:a-queen-in-winter`: in Haldren, meet Queen Aldith and Lord Protector Harrow. Haldren is starving, refugees from Greywater crowd the gates, and the Wick is arresting "marked" people. You're asked to prove Varn can be retaken.
- *Optional:* `quest:the-quiet-hand` (recruit Sable).

### Chapter 2: "Allies in the Cold" (choose order: Ylwen / Foothills / Witherdowns)
- `quest:the-singing-wood`: earn the Thornwise's trust (Nan Briar vouches if `prologue.stag_fate = cleansed`). Meet Cadoc. Hear of the Lullaby. Sets `act1.ylwen_pact`.
- `quest:iron-and-oath`: at Dun Korrath-Gate, help Grimma Ironsong. Discover that the Concord is hiding the failed Nails. Choice: **expose** (`act1.nails_exposed`: Concord reputation drops, Grimma's loyalty rises) or **keep the secret** (`act1.nails_kept`: alliance plus true-iron; Grimma leaves). Either way `act1.korrath_gate_open`.
- `quest:the-river-under`: in the Witherdowns the dead are restless. The Grey Monks reveal the River Under is freezing. Meet Morrow's ghosts, who give the **first true hint** that the Mire was alive. Sets `act1.river_truth`.
- `quest:salt-and-silver` (optional in Act I): at Brackhaven, learn the Salt League has an Ember. This sets up Act II.

### Chapter 3: "The Drowning of Varn" (Greywater Marsh): Act I climax
- `quest:the-reed-mother`: infiltrate the Choir's reed temples. If `prologue.tobin_fate = hollowed`, Tobin is here (`quest:the-boy-in-the-reeds`).
- `quest:harrows-bargain`: discover that Lord Protector Harrow has a pact with the Choir: they spare his lands and he leaves Varn alone. **Major choice:**
  - **Expose Harrow to the Queen** (`act1.ruler = aldith`): Aldith rules; she's weaker but just, and Crown reputation goes up.
  - **Keep quiet and use Harrow** (`act1.ruler = harrow`): Harrow rules and the army is stronger, but he'll betray you in Act II.
  - **Let the Wick take the kingdom** (`act1.ruler = wick`): Vellane's martial law. The Lanternate is strong, the Haldmarch is crushed, and mages are hunted everywhere.
- `quest:ashes-of-varn`: the assault on drowned Varn with whichever allies you've gathered (the Crown army, Thornwise, Orrun, the Ashen Creed). `act1.varn_assault = true`. Boss: **Aldwin Varn, the Drowned Lord** (kill or Purge to peace; `act1.varn_fate`). Claim **Ember #2**.
- **Hesta's fate:** Ysolde appears in person for the first time and offers Hesta a choice; it is her old apprentice. Hesta **sacrifices herself** to break Ysolde's hold on the Ember, *unless* the player brought Thornwise allies (`act1.ylwen_pact`) and Anselm (`npc.anselm.trust >= 2`). Then Cadoc's song and Anselm's Radiance hold Ysolde off and Hesta lives. `act1.hesta_alive`.
- Ysolde's parting words reveal she *needs* the player alive.
- **End of Act I:** `act1.complete = true`, `world.mire_level = 2`. The Lantern Coast opens. Vellane summons the "Ashmarked" to Solenne.

---

## ACT II: "The Seven Embers" (the wider continent)
Regions: Lantern Coast, Ironspine, Frostreach, Sunscar, Cinder Wastes, Saltreach Isles.
Theme: *every power in the world wants the Embers, and they're all a little bit right.*
Act II is **open-ended**. The four Ember hunts can be played in any order. Each one is also a **faction alliance decision**.

### Chapter 4: "The Dark Cathedral" (Lantern Coast): opening
- `quest:the-summons`: in Solenne, the snow-covered holy city, see the dead Brand. Meet the Hierophant and Vellane. Vellane demands the Embers. **Choice:** pledge to the Church (they back you with arms and access, and take Embers when you return), refuse politely (neutral, watched), or defy openly (`act2.church_stance = pledged|neutral|defiant`).
- `quest:sister-ilse`: uncover the Choir's spy in the cathedral. Find **Ysolde's journals** in the Keeper's quarters: her visions, her reasoning, and Hesta's letters to her. These are big codex unlocks.

### Chapter 5: four Ember hunts (any order)
- **Ironspine:** `quest:the-ninth-nail`. Descend into the Vault of the Nine Nails. The Wrought and Rustwraiths wake. The Ember of the Deep has been *holding back the gap left by the failed Nails*. **Take it** (the Mire floods the lower holds; `act2.korrath_flooded`) or **leave it and forge a new Nail** with Grimma (a long side chain, `act2.new_nail`, true-iron needed).
- **Frostreach:** `quest:the-wolf-moot`. The Hrothi revere the Ember as a sign from Calun and are preparing to invade the south with its power. **Win the Moot** by deeds, wits or a duel with Sigrun, or **steal** the Ember. Outcomes: Hrothi allies, Hrothi invasion of the Haldmarch (`act2.hrothi_invasion`), or a broken clan. `act2.northpass_open` opens the way.
- **Saltreach Isles:** `quest:the-ember-auction`. Get a ship (`act2.ship_passage`). Admiral Kestrel's auction is attended by Vellane's agents, the Ashen Creed, the Choir and Qasiri envoys. Win it by bidding, heist (Shade), duel or betrayal.
- **Sunscar → Cinder Wastes:** `quest:the-glass-throne`. The Cindermother reveals Qadir's records. Follow the Ash Road (`act2.ashroad_known`) into the ruins of Qadir. Face the **Ashwyrm** and the ghost of **King Ozrah**, who tells you the truth about the Heartfire: *it was always dying; the Ashen Kings were trying to save it, not steal it.* Vesper and the Ashen Creed may try to take this Ember for themselves.

### Chapter 6: "Nhal" (the turn)
- After the third Ember, the visions change: **Nhal** speaks, not Ysolde. The player learns (`act2.nhal_revealed`):
  - Nhal wants to *become* the new Heart.
  - Ysolde believes the Dreaming will be gentle. Nhal has been lying to her.
  - There is a **third way** (the Aelthi Lullaby plus the Embers plus the Ashmark): reforge the Heartfire into something that **neither burns the Mire nor drowns the world**, a new pact. Its price: the Ashmarked must become the new Heart's keeper and never come back. Or someone else could.
- `quest:the-pale-parley`: a truce-meeting with Ysolde in a dream. The player can tell her the truth. Her belief depends on evidence: Ozrah's testimony (`act2.ozrah_truth`), Hesta's letters, and whether Hesta lives. This sets `act2.ysolde_doubt` (0–3).
- **End of Act II:** the Choir triggers the **Breach**. Greywater Marsh collapses into the Mire, and the Mirelands spread. `act2.complete`, `act3.breach_open`, `world.mire_level = 4`.

---

## ACT III: "The Heartforge"
Regions: Mirelands, Heartforge (+ Haldmarch under siege).
Theme: *what will you give to keep the world, and which world is worth keeping?*

### Chapter 7: "The Siege of Haldren"
- `quest:the-last-lanternmass`: the Hollowed tide hits Haldren. Every ally you earned fights. Which factions show up (and who betrays you) depends on Act I and II flags: Harrow betrays if `act1.ruler = harrow`; the Hrothi come or invade; the Orrun come if you kept faith; the Church holds the walls or burns the city. Cinderhold is the last refuge.

### Chapter 8: "The Hollow Sea" (Mirelands)
- `quest:into-the-dreaming`: cross the unforged lands where memory and matter blur. Companions face their worst dreams; each companion quest pays off here. Maren meets the dream of Tobin. Anselm meets Saint Wenna. Sable is pulled toward full Hollowing.
- Possible **Ysolde confrontation**: if `act2.ysolde_doubt >= 2` she **turns** and gives you Ember #7. Otherwise you fight her (boss) and take it.

### Chapter 9: "The Heartforge"
- `quest:the-heart-of-orr`: descend through the Vault into the Heartforge (`act3.heartforge_unsealed`). Nhal, rising, is the final boss. Before the end, with all Seven Embers, comes the **final choice**:

## Endings

| Ending | Requirements | Outcome |
|---|---|---|
| **Rekindle** | default | Return the Embers to the Heartfire. The world is saved *for now*; the cooling resumes in a few centuries. The Church restores a Brand. Variant **"The Iron Lantern"**: if the Church holds power (`act1.ruler = wick` or `act2.church_stance = pledged`), Vellane forges a new Brand and rules an age of order and fire. |
| **Reforge** | the Lullaby (`act1.ylwen_pact` + Cadoc's loyalty) + `act2.nhal_revealed` | Sing the Mire to *true* sleep and reforge the Heartfire into a new heart that holds both. The Ashmarked stays below as its keeper, or **Ysolde takes your place** if redeemed (`act2.ysolde_doubt = 3`), or **Hesta** if alive. The best ending: spring comes. |
| **Quench** | side with Ysolde (dark choice) | The world dreams. It is gentle if Nhal is destroyed first; otherwise it's Nhal's world, with everyone Hollowed and smiling. A bad ending, presented beautifully. |
| **Usurp** | Bloodcraft/Mirecraft path, or many Hollowed-mercy choices | The Ashmarked *becomes* the new Heart: a living god of fire and Mire. Ambiguous. Epilogue slides depend on the player's reputation. |

Every ending has **epilogue slides** for each region, faction and companion, driven by flags.

---

## Flag reference (main campaign)

| Flag | Type | Set by | Read by |
|---|---|---|---|
| `prologue.festival_attacked` | bool | Q1 | world (spawn) |
| `prologue.pyre_lit` | bool | Q1 | world (fire visual) |
| `prologue.stag_fate` | "cleansed" / "slain" | Q2 | world, Act I Thornwise |
| `prologue.hale_outcome` | "submitted" / "persuaded" / "defied" / "deceived" | Q3 | Act I Wick reputation, Hale's later attitude |
| `prologue.oswin_fate` | "exposed" / "spared" / "slain" | Q4 | world (mill) |
| `prologue.mere_drained` | bool | Q4 | world (overlay) |
| `prologue.tobin_fate` | "saved" / "hollowed" / "dead" | Q5 | Act I `quest:the-boy-in-the-reeds`, Maren's loyalty |
| `prologue.anselm_secret` | bool | Q3/Q5 | Anselm's companion arc |
| `prologue.complete` | bool | Q5 | world (roads), Hesta spawns |
| `act1.cinderhold_restored` | bool | Ch1 | world (hub) |
| `act1.ylwen_pact` | bool | Ch2 | world (Ylwen gate), endings |
| `act1.korrath_gate_open` | bool | Ch2 | world (Ironspine gate) |
| `act1.nails_exposed` / `act1.nails_kept` | bool | Ch2 | Concord reputation, Grimma |
| `act1.river_truth` | bool | Ch2 | codex |
| `act1.ruler` | "aldith" / "harrow" / "wick" | Ch3 | world (Haldren banners, guards), Act III |
| `act1.varn_assault` | bool | Ch3 | world (Varn opens) |
| `act1.varn_fate` | "slain" / "peace" | Ch3 | epilogue |
| `act1.hesta_alive` | bool | Ch3 | Cinderhold, endings |
| `act1.complete` | bool | Ch3 | world (Lantern Coast gate) |
| `act2.church_stance` | "pledged" / "neutral" / "defiant" | Ch4 | Lanternate behaviour |
| `act2.korrath_flooded` / `act2.new_nail` | bool | Ch5 | world (Ironspine) |
| `act2.hrothi_invasion` | bool | Ch5 | world (Haldmarch raids) |
| `act2.ship_passage` / `act2.northpass_open` / `act2.ashroad_known` | bool | Ch5 | world gates |
| `act2.ozrah_truth` / `act2.nhal_revealed` | bool | Ch5–6 | dialogue, endings |
| `act2.ysolde_doubt` | number 0–3 | Ch6 | Act III |
| `act2.complete`, `act3.breach_open` | bool | Ch6 | world (Mirelands) |
| `act3.heartforge_unsealed` | bool | Ch8 | world gate |
| `act3.ending` | "rekindle" / "iron-lantern" / "reforge" / "quench" / "usurp" | Ch9 | epilogue |
| `world.mire_level` | number 0–5 | each act | world (seep spread, Hollowed spawn density) |
| `world.embers_held` | number 0–7 | Ember pickups | UI, Ashmark power, visions |

## Ashmark ranks (`ashmark.rank`, read by Claude 3)
| Rank | When | Unlocks (lore) |
|---|---|---|
| 1 | Prologue Q1 `pyre` | Kindle, Purge I |
| 2 | Prologue Q5 `ember` (Ember #1 fused) | Embersight, Purge II |
| 3 | Act I, `quest:ashes-of-varn` (Ember #2) | Purge III (cleanse people mid-fight) |
| 4 | Act II, when `world.embers_held` reaches 4 | Carry (Ember powers and visions intensify) |
| 5 | Act III, Ember #7 claimed | the full Ashmark (ending-dependent) |
