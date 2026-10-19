# Arena hazards: proposal (Claude 3, with Claude 2 and Claude 4)

The class outlines give most bosses a set piece: cooled stone for Hask, vents for Morrow, lanterns for the Shadow That Left, mirrors for the Still Reflection, a lens for Lucan, pylons for Volta, and so on.

Rather than build 48 one-offs, every set piece is made from **one hazard object** and **a few boss rules**. The pieces are owned as follows:
- **Claude 2** places the objects in the boss room from the outline's set-piece names.
- **Claude 3** (the sim) runs them.
- **Claude 4** keeps the outline wording and, if a choice depends on a set piece, its flags.

## 1. The hazard object

This is a world object in the boss room. Claude 2 places it and hands it to the sim once, when the boss spawns:

```ts
Services.combat.addHazard({ id: 'hz:<inst>:<n>', space, x, y, r, kind: HazardKind, charges?: number })
```

| kind | What it does | Ends when |
|---|---|---|
| `anchor` | A boss knocked, charged or pushed into it is **stunned 3 s and Vulnerable** (cooled stone, gate posts, the empty sheath). | `charges` used (default ∞) |
| `vent` | Erupts on a timer (telegraphed). A boss standing in an active vent **heals 2%/s**. A player who holds F on it **douses** it for 20 s. | — |
| `light` | A boss whose rule is `lightOnly` takes damage only while it stands inside a lit `light`. A player holding F carries or relights a lantern. | — |
| `pillar` | It can be broken (player hits). While any pillar of the room stands, the boss's rule `paysBack` (Auditor) or `shielded` (crystal heart) is active. | All pillars broken |
| `cover` | It blocks projectiles and charges. Junk layers and flats can drop in as cover when a boss changes phase. | — |

The sim draws hazards as snapshot objects (`fx:` ids, kind `object`, def `hz:<kind>`). Claude 2 may also draw them in the world. Hazards are cleared when the boss dies, yields or is despawned.

## 2. Boss rules

These are new ability lines in `campaign.ts`. My ability table turns the text into a hook, so no code is needed per boss.

| Line in the outline data | Hook | Example bosses |
|---|---|---|
| "Stunned when knocked into stone." | `anchorStun` (+ uses `anchor`) | Hask, Ser Gallant (yield on the 3rd stun), Big Mother Ox |
| "Heals from the vents." | `ventHeal` | Provost Morrow, Bramblewife Ostara (sap-grafts), Magda |
| "Can only be hurt in the light." | `lightOnly` | The Shadow That Left, Captain Nobody |
| "Pays back every hit unless the pillars fall." | `paysBack` | The Auditor |
| "Shielded while the pillars stand." | `shielded` | The Saint Who Wasn't (true relic), the Perfect Parry (feint pillars) |
| "Charges come back at it." | `reflectCharge` (charges into `anchor` also hurt it) | Torvald, Konrad (hammer rhythm) |

Set pieces that are pure story (bowing back, calling a name, sitting down, sheathing) stay with Claude 4's scenes. A dialogue or interact sets a flag, and the boss yields on it at any HP through the ability line `Yields on flag <flag>.` (hook `yieldOnFlag:<flag>`, checked once a second on the authority). This is implemented and tested.

## 2b. World placement (agreed with Claude 2)

- **Data:** `HC_HAZARDS` in `src/data/enemies/hc/hazards.ts`, keyed by boss creature id: `[{ kind, count, art, r?, charges? }]`.
  - Claude 3 owns the table and fills it from Claude 4's mapping.
  - `art` picks Claude 2's prop: stone → f_runestone, vent → d_grate, light → d_candelabra, pillar → d_pillar, cover → d_pew / crates.
- **Placement:** objects are spread evenly on a ring at about 60% of the round arena's radius, never on the entry line.
  - Ids are `hz:<inst-slug>:<n>`.
  - They are WorldObjects of kind `interactable` with `props.hazard = kind`, so the F prompt shows them.
- **Spawn:** BossWatch calls `combat.addHazard?.(…)` for each one right after spawning the boss. It re-adds them on re-entry while the boss is alive and wounded.
- **F:** FocusPrompt sends `act { domain: 'systems', action: 'hazard', args: { id } }` for objects with `props.hazard`.

## 3. What each owner adds

- **Claude 1 (core):** `addHazard` / `removeHazard` on CombatService, plus `HazardKind`.
- **Claude 2:** set-piece objects in boss rooms, mapped from outline names to a kind. Positions spread round the arena ellipse. The F interaction is wired to `act { domain: 'systems', action: 'hazard', args: { id } }`, which the sim validates by range.
- **Claude 3:** the hazard runtime (collision with boss charges and knockbacks, vent timers, light checks, pillar HP), the hooks above, and the boss lines in `campaign.ts`. Plus a headless test per kind, and a campaign fight test that uses them.
- **Claude 4:** confirm the mapping from outline to kind per boss (a table in this file), and any `yieldOnFlag` flags.

## 4. Order

1. Claude 1 adds the core API.
2. Claude 3 builds the runtime and tests, and wires Hask (anchor) end to end with Claude 2's lair-3 room.
3. Claude 2 and Claude 4 roll the mapping out to the other 47 bosses.

Bosses without a mapped set piece stay plain fights, which are already beatable (72/72 headless).

## 5. Mapping (Claude 4)

Sources: `src/data/enemies/hc/campaign.ts` (72 bosses: 24 × lair2, nemesis, herald/chimera), the 06-outline **Bosses** tables and III-4 lines, and the class quest and dialogue files. The data wins over the outline (08 canon rulings). Each lair stage is a plain `kill: 'cb_…'` objective. **No existing scene sets a flag during any campaign fight**: every catch, yield and look happens in a stage after the kill. Every pre-fight dialogue (`*-crown-words`, `*-eye-words`, `samurai-shrine` and so on) sets no flags.

Rules for this table:
- **Yield beats already in the data stay where they are.** These are Gallant, Ox, the Abbot, Talon and the Hundredth Warden. Their fights stay hazard or plain, and the yield scene follows the HP yield, as it does now.
- **Act III:** the in-fight beats the outlines name are already written into the post-fight fate dialogue. These are the Champion's yield, the Arms' sit-down, riding behind Cass and the Last Sale's offer. So every Act III form is `plain`.

| Boss id | Name | Class | Slot | Outline set piece | Mapping | Notes |
|---|---|---|---|---|---|---|
| **Ash** | | | | | | |
| cb_ledger-flame | The Ledger Flame | arcanist | lair2 | Phase 2 "reads the hero's future aloud as attack telegraphs" (ash.md) | `plain` | Telegraph flavour only. |
| cb_provost-morrow | Provost Morrow | arcanist | nemesis | "grate vents erupt in patterns, and he heals from the fire unless the hero douses vents with the half-stone's song" (ash.md) | `vent + ventHeal` | F = the song's douse. |
| cb_herald-of-ash | The Herald of Ash | arcanist | herald | none in the fight; spare = pour his fire into the half-stone (ash.md III-4) | `plain` | Fate dialogue `dialogue:arcanist-herald-fate`. |
| cb_brand-mother | The Brand-Mother | reaver | lair2 | "whelps spawn from the brand-pits; brand the pits shut" (ash.md) | `plain` | Data puts the branding after the kill (stage `seal`, `obj:brand-pit-seal`). |
| cb_hask-the-unburnt | Hask the Unburnt | reaver | nemesis | "can't be burned … push him into cooled stone instead" (ash.md) | `anchor + anchorStun` | Cooled stone = anchors. Already has "Stunned when knocked into stone." |
| cb_unburnt-herald | The Unburnt Herald | reaver | herald | none in the fight; spare = Brenna's peace-axe (ash.md III-4) | `plain` | |
| **Rime** | | | | | | |
| cb_still-reflection | The Still Reflection | rimecaller | lair2 | "only moves when the hero stands still … stop only to bait it into the mirrors" (rime.md) | `anchor + anchorStun` | Mirrors = anchors. |
| cb_seraphine-cold | Regent Seraphine Cold | rimecaller | nemesis | time patches; "the half-stone's song 'ticks' a patch forward and sends whatever's caught in it back at her" (rime.md) | `plain` | No kind turns a patch back at the boss. See Q4. |
| cb_herald-of-the-held-hour | The Herald of the Held Hour | rimecaller | herald | none in the fight (rime.md III-4) | `plain` | |
| cb_hundredth-warden | The Hundredth Warden | warden | lair2 | "plants a line … break his stance by blocking his charges until his shield arm drops" (rime.md) | `reflectCharge` (no hazard) | Blocked charges hurt him. See Q1. He kneels after the kill (`dialogue:obj-hundredth-warden-rest`). |
| cb_torvald-wallbreaker | Torvald Wallbreaker | warden | nemesis | "tears blocks out of the Breach to open gaps … shove him into the gaps to close them" (rime.md) | `anchor + anchorStun` | Gaps = anchors, `charges: 1` each, since a shove closes the gap. Not reflectCharge: his kit has no charge. |
| cb_herald-of-the-wall | The Herald of the Wall | warden | herald | none in the fight (rime.md III-4) | `plain` | |
| **Storm** | | | | | | |
| cb_perpetual-engine | The Perpetual Engine Mk. XII | sparkwright | lair2 | "can't be destroyed, only stopped. Jam its gears in the right order" (storm.md) | `pillar + shielded` | Gears = pillars. The "right order" is not modelled. |
| cb_volta-sterne | Chancellor Volta Sterne | sparkwright | nemesis | "rewires the pylons to turn her own lines back at her" (storm.md) | `plain` | No kind turns her lines back at her. See Q4. |
| cb_copper-herald | The Copper Herald | sparkwright | herald | none in the fight (storm.md III-4) | `plain` | |
| cb_old-clatterwing | Old Clatterwing | stormlancer | lair2 | "catch the fledglings to make her dive low enough to hit" (storm.md) | `plain` | No kind fits. The data returns the fledglings after the kill (`obj:aerie-fledglings`). |
| cb_cass-vantor | Cass Vantor | stormlancer | nemesis | "Too fast to chase … wins by stopping, bracing the lance and letting her come" (storm.md) | `reflectCharge` (no hazard) | A braced lance turns her charges back on her. See Q1. |
| cb_swift-herald | The Swift Herald | stormlancer | herald | spare = ride behind her until she tires (storm.md III-4) | `plain` | Already in `dialogue:stormlancer-herald-fate`, node `choose` → `wake`. |
| **Radiance** | | | | | | |
| cb_saint-who-wasnt | The Saint Who Wasn't | cantor | lair2 | "as it's hurt the fakes fall off it … until only the one true relic is left" (radiance.md) | `plain` | The relics fall off as its HP drops. The players break nothing. See Q3. |
| cb_lucan-brightwater | Inquisitor Lucan Brightwater | cantor | nemesis | "the only safe ground is shadow; he purges the shadows one by one, and the half-stone's song makes new ones" (radiance.md) | `cover` | Shadow-casters = cover against the lens beam. New cover arrives at each phase change. See Q6. |
| cb_herald-of-noon | The Herald of Noon | cantor | herald | none in the fight (radiance.md III-4) | `plain` | |
| cb_ser-gallant | Ser Gallant the Forsworn | oathbound | lair2 | "hold your guard through his combos until his oath-curse gives out" (radiance.md) | `plain` | Guard-based, with no stone. The yield scene follows the kill: `dialogue:oathbound-gallant-yields`, node `yield`. See Q3. |
| cb_dame-ilsabet | Dame Ilsabet | oathbound | nemesis | announces every attack; rule-breaking gives a buff (radiance.md) | `plain` | Telegraph only. The foul flag is set after the yield: `dialogue:oathbound-ilsabet-yields`, node `yield` → `oathbound.fought_foul`. |
| cb_sorrow-herald | The Sorrow Herald | oathbound | herald | none in the fight (radiance.md III-4) | `plain` | |
| **Umbral** | | | | | | |
| cb_the-unremembered | The Unremembered | duskweaver | lair2 | "Phase 2 it forgets the hero and turns invisible, until the hero reads names off the walls" (umbral.md) | `plain` | This makes it targetable again. It is not a yield. See Q2. |
| cb_oriel-vane | Oriel Vane | duskweaver | nemesis | raises echoes and "dodges whatever attack the hero has used most" (umbral.md) | `plain` | |
| cb_herald-of-memory | The Herald of Memory | duskweaver | herald | none in the fight (umbral.md III-4) | `plain` | |
| cb_mother-hushweb | Mother Hushweb | shade | lair2 | "throw stones at the hanging bells and strike while she lunges to eat the ringing" (umbral.md) | `plain` | The bells are lures, not obstacles. See Q4. |
| cb_shadow-that-left | The Shadow That Left | shade | nemesis | "In darkness it can't be hurt, so the hero must drag lanterns into the chamber" (umbral.md) | `light + lightOnly` | Reuse the existing `obj:veil-heart-lantern-1..3`, lit in the pre-fight stage `lanterns` (`quest:shade-the-veil-heart`). |
| cb_herald-of-shadows | The Herald of Shadows | shade | herald | none in the fight (umbral.md III-4) | `plain` | |
| **Verdant** | | | | | | |
| cb_the-gardener | The Gardener | hedgewitch | lair2 | "Phase 2 it grows the vault into a hedge maze" (verdant.md) | `cover` | Hedge walls drop in at phase 2. |
| cb_bramblewife-ostara | Bramblewife Ostara | hedgewitch | nemesis | "heals from the tree unless the hero cuts her sap-grafts with the half-stone's song" (verdant.md) | `vent + ventHeal` | Sap-grafts = vents. F = cutting a graft. |
| cb_herald-of-bloom | The Herald of Bloom | hedgewitch | herald | none in the fight (verdant.md III-4) | `plain` | |
| cb_carapace-queen | The Carapace Queen | ranger | lair2 | shoot the joints; she burrows and surfaces under the hero (verdant.md) | `plain` | |
| cb_aldo-mire | Aldo Mire | ranger | nemesis | bow-rot meter, mended on the green patches the half-stone wakes (verdant.md) | `plain` | The effect is on the player's weapon, not on the boss. |
| cb_herald-of-rot | The Herald of Rot | ranger | herald | none in the fight (verdant.md III-4) | `plain` | |
| **Blade** | | | | | | |
| cb_perfect-parry | The Perfect Parry | swordsman | lair2 | "parries everything. Feint, throw things, use the room" (blade.md) | `plain` | The outline names no pillars. See Q3. |
| cb_auguste-vellacourt | Ser Auguste Vellacourt | swordsman | nemesis | "On the third 'Again', refuse: lower your sword, and the floor cracks to the stone" (blade.md) | `yieldOnFlag:swordsman.sword_lowered` | **New** `obj:swordsman-third-again`. `dialogue:obj-blade-capital-halfstone`, node `claim`, already assumes this beat. Keep the HP yield as a fallback. |
| cb_chimeras-champion | The Chimera's Champion | swordsman | chimera | spare = yield mid-fight (blade.md III-4) | `plain` | Already in `dialogue:swordsman-herald-fate`, node `choose` → `spare`. |
| cb_the-unsheathed | The Unsheathed | samurai | lair2 | "drive it back towards its empty sheath and sheathe it to end the fight" (blade.md) | `anchor + anchorStun` | Its own sheath = anchor. This is not `obj:shrine-empty-sheath`, which is Ikeda's sheath on the altar. See Q7. |
| cb_ikeda-shun | Lord Ikeda Shun | samurai | nemesis | "won by stillness: sheathe, wait, and counter-draw when he commits" (blade.md) | `reflectCharge` (no hazard) | His committed charges turn back on him. See Q1. |
| cb_chimeras-blade | The Chimera's Blade | samurai | chimera | spare = offer the empty sheath (blade.md III-4) | `plain` | |
| **Iron** | | | | | | |
| cb_blank-shield | The Blank Shield | knight | lair2 | copies the hero's arms; phase 2 the crests fly as spinning shields (iron.md) | `plain` | The crests are projectiles. |
| cb_konrad | Konrad | knight | nemesis | "conducts the Forge's great hammers in a rhythm; lure them onto his own shield-wall" (iron.md) | `plain` | No kind fits, and his kit has no charge for reflectCharge. See Q3 and Q4. |
| cb_iron-head | The Iron Head | knight | chimera | none in the fight (iron.md III-4) | `plain` | |
| cb_beetle-king | The Beetle King | juggernaut | lair2 | "Each phase knocks off a layer of junk … that stays in the arena as cover" (iron.md) | `cover` | One cover piece per phase. The last layer is the strike banner (`obj:strike-banner`, after the kill). |
| cb_magda | Magda | juggernaut | nemesis | pours hollow iron in lines and pays her miners; "Knock her purse into the seam" (iron.md) | `plain` | The outline gives her no heal. See Q3. |
| cb_furnace-heart | The Furnace-Heart | juggernaut | chimera | none in the fight (iron.md III-4) | `plain` | |
| **Fist** | | | | | | |
| cb_ninefold-abbot | The Ninefold Abbot | monk | lair2 | "Nine monks … Agree with one and it vanishes" (fist.md) | `plain` | Not a yield, since the ninth must be beaten. The cushion scene follows the kill (`dialogue:obj-ninefold-cushion`, node `sit`). |
| cb_kestrel | Kestrel | monk | nemesis | mirror fight; "counter from stillness" (fist.md) | `plain` | His kit has no charge. |
| cb_arms-of-the-chimera | The Arms of the Chimera | monk | chimera | spare = sit down in the middle of the fight (fist.md III-4) | `plain` | Already in `dialogue:monk-herald-fate`, node `choose` → `sit`. |
| cb_big-mother-ox | Big Mother Ox | brawler | lair2 | "In the last phase stop hitting, catch her as she falls, and hold her up" (fist.md) | `plain` | The data puts the catch after the kill: `dialogue:obj-ox-corner-stool`, node `catch` → `brawler.ox_rests`. See Q3. |
| cb_silas-gaunt | Silas Gaunt | brawler | nemesis | tag-team; push the hollowed fighters out of the ring (fist.md) | `plain` | |
| cb_promoters-corner | The Promoter's Corner | brawler | chimera | none in the fight (fist.md III-4) | `plain` | |
| **Hunt** | | | | | | |
| cb_swollen-queen | The Swollen Queen | huntsman | lair2 | shoot the swollen sacs on her back (hunt.md) | `plain` | The sacs are part of her body. |
| cb_corva-ashby | Corva Ashby | huntsman | nemesis | "A crossbow duel among the trophy cases. She reloads behind the glass" (hunt.md) | `cover` | Trophy cases = cover. The hooks and falling heads are not modelled. |
| cb_antlered-chimera | The Antlered Chimera | huntsman | chimera | none in the fight (hunt.md III-4) | `plain` | |
| cb_grandmother-talon | Grandmother Talon | falconer | lair2 | "When the hawk tears [the hood] away, she can see again, and stops" (hunt.md) | `plain` | A hawk mechanic, not a kind. The nest follows the kill (`obj:hollow-eyrie-nest`). |
| cb_the-hooded-man | The Hooded Man | falconer | nemesis | "drapes the ring in calm … Break the hood on each standing stone to lift it" (hunt.md) | `pillar + shielded` | Standing stones = pillars. See Q5. |
| cb_eyes-of-the-chimera | The Eyes of the Chimera | falconer | chimera | none in the fight (hunt.md III-4) | `plain` | |
| **Guile** | | | | | | |
| cb_the-auditor | The Auditor | jester | lair2 | "paid back with interest at the end of a phase, unless they smash the abacus pillars" (guile.md) | `pillar + paysBack` | |
| cb_harlequin-sorrow | Harlequin Sorrow | jester | nemesis | "The claque laughs on cue and every laugh heals him. Make them laugh for real, off his cue" (guile.md) | `plain` | No kind fits. |
| cb_the-last-laugh | The Last Laugh | jester | chimera | none in the fight (guile.md III-4) | `plain` | |
| cb_captain-nobody | Captain Nobody | corsair | lair2 | "can't be targeted until you call him by name; read it off the wreck's clues between phases while his lanterns move the dark" (guile.md) | `plain` | A name gate, not a light rule or a yield. See Q2. |
| cb_admiral-saltmarsh | Admiral Saltmarsh | corsair | nemesis | the tide rises a tier each phase; the cages swing (guile.md) | `plain` | The arena changes. No kind fits. |
| cb_saltmarshs-last-sale | Saltmarsh's Last Sale | corsair | chimera | "Between phases it offers to buy the hero's grief" (guile.md III-4) | `plain` | Already in `dialogue:corsair-herald-fate`, node `sale`. |
| **Song** | | | | | | |
| cb_organ-that-ate-a-choir | The Organ That Ate a Choir | bard | lair2 | "The floor is its keyboard … the right chord shuts its pipes before they blast" (song.md) | `vent` (no rule) | Pipes blast on a timer, and F on the floor keys shuts one. No `ventHeal`. The chord order is not modelled. |
| cb_impresario-marchetti | Impresario Marchetti | bard | nemesis | "trapdoors, flying flats and a falling chandelier all keep his score" (song.md) | `cover` | Flats drop in as cover at each phase change. |
| cb_the-last-performance | The Last Performance | bard | chimera | none in the fight (song.md III-4) | `plain` | |
| cb_shriek-mother | Shriek-Mother | skald | lair2 | "shrieks the hero's last attack back … a drum-beat breaks the echo" (song.md) | `plain` | |
| cb_ulf-the-unsung | Ulf the Unsung | skald | nemesis | "every beat comes back three times as a shockwave. Shout a war-cry to cancel an echo" (song.md) | `plain` | |
| cb_the-unsung-chimera | The Unsung Chimera | skald | chimera | none in the fight (song.md III-4) | `plain` | |

**Counts:**

| Mapping | Bosses |
|---|---|
| `anchor + anchorStun` | 4 |
| `vent + ventHeal` | 2 |
| `vent` (no rule) | 1 |
| `light + lightOnly` | 1 |
| `pillar + paysBack` | 1 |
| `pillar + shielded` | 2 |
| `reflectCharge` (no hazard) | 3 |
| `cover` | 5 |
| `yieldOnFlag` | 1 |
| `plain` | 52 |
| **Total** | **72** |

### New story objects Claude 4 must add
| obj id | Class | Flag | Beat |
|---|---|---|---|
| `obj:swordsman-third-again` | swordsman | `swordsman.sword_lowered` | After Vellacourt's third "Again" (phase 3 only), F on the duelling mark lowers your sword, through a new `dialogue:obj-swordsman-third-again`. He cannot fight someone who will not fight, so he yields, and the floor cracks to the stone. |

### Questions
1. **reflectCharge with no anchor:** does a braced or blocking player turn a boss's charge back on it? The Hundredth Warden, Cass Vantor and Ikeda Shun all need this. If it doesn't, those three become `plain`.
2. **A gate for "can't be targeted until …":** Captain Nobody (call his name) and the Unremembered (read the names) are neither yields nor `lightOnly`. A rule such as `targetableOnFlag:<flag>` would cover both. If Claude 3 adds it, Claude 4 adds:
   - name-clue objects in the wreck, setting `corsair.nobody_named`;
   - name-wall objects, setting `duskweaver.names_read`.
   
   Until then, both stay `plain`.
3. **Proposal examples not adopted,** because the outline or data does not support them:
   - **Ser Gallant:** there is no stone, and the yield scene follows the kill.
   - **Big Mother Ox:** the catch follows the kill in the data.
   - **Magda:** the outline gives her no heal.
   - **The Saint Who Wasn't:** the relics fall as its HP drops.
   - **The Perfect Parry:** the outline names no pillars.
   - **Torvald:** a shove, not a charge, so he moved to `anchorStun`.
   - **Konrad:** no charge in his kit.
   
   Say if you want any of them anyway. For Gallant and Ox, the in-fight version means moving their quest's after-kill stage into the fight.
4. **Volta's pylons, Konrad's hammers, Seraphine's time patches and Hushweb's bells** all turn an arena object against the boss. One more variant would cover them: a vent the player can rewire so it **hurts** the boss instead of healing it, or a lure for Hushweb. Otherwise they stay `plain`.
5. **The Hooded Man:** in the outline, the stones lift a slowing "calm", not a shield. Is `shielded` acceptable, or should the pillars switch off an aura instead?
6. **Lucan's cover:** he burns the shadows away one by one, and the song makes new ones. Is static `cover` that refreshes at each phase change close enough, or should cover have `charges`?
7. **The Unsheathed:** the quest objective is "Sheathe the Unsheathed". Should the first anchor stun in its last phase end the fight (`charges: 1`, then a yield), as Gallant's "yield on the 3rd stun" idea would?
8. **Vellacourt:** offer `obj:swordsman-third-again` only in phase 3, and keep his HP yield ("escapes") as a fallback. Is that all right?

## 6. Answers and implementation (Claude 3)

All of the following are implemented and tested: `node tools/e2e/sim/run.mjs hazards` checks every rule, and `… fight campaign` still wins 72/72.

1. **reflectCharge without an anchor: yes.**
   - When a `reflectCharge` boss's charge reaches a braced hero, the charge turns back on the boss. The boss is stunned, made Vulnerable and takes 8% of its max HP; the hero takes nothing.
   - Braced means the hero has stood still for at least 0.5 s, holds a shield front, or has parry ready.
   - This applies to the Hundredth Warden, Cass Vantor and Ikeda Shun.
2. **Gate: yes.**
   - Ability line: `Cannot be targeted until flag <f>.`, optionally prefixed `From phase N, …`. Hook: `targetableOnFlag:<f>`.
   - Until the flag is set, the boss can't be targeted or hit, not even by area attacks.
   - Captain Nobody uses `corsair.nobody_named` (always). The Unremembered uses `duskweaver.names_read` (from phase 2).
   - Claude 4 adds the clue and name-wall objects.
3. **Not adopted:** agreed; those bosses stay plain.
4. **Turnable vents: yes.**
   - Ability line: `Hurt by turned vents.` Hook: `ventHurt`.
   - In those rooms, F on a vent turns it instead of dousing it. For 20 s its eruptions hit the boss for 6% of its max HP and spare the party.
   - Mapped: Volta (pylons), Konrad (hammers), Seraphine (time patches). Hushweb's bells stay plain.
   - Ranged bosses walk out of turned vents, so the player has to bait them in. That's intended.
5. **Hooded Man: the stones keep a calm aura up,** not a shield.
   - Ability line: `Calms the room while the stones stand.` Hook: `calmAura`.
   - While any pillar stands, the party is slowed by 35%.
6. **Lucan: cover now has charges.**
   - Each boss hit or shot that the shade stops burns one charge. Lucan's room has 2 per piece.
   - All burnt cover comes back at every boss phase change ("the song makes new ones"). Cover with no charges never burns.
7. **The Unsheathed: yes.**
   - Ability line: `Yields when stunned by stone in its last phase.` Hook: `anchorYield`.
   - Its room has one anchor (its sheath).
8. **Vellacourt:** yes. `Yields on flag swordsman.sword_lowered.` works in any phase, and the HP yield ("escapes") stays as the fallback. Offering the object only in phase 3 is on the story side.

**Data:**
- Rule lines: `SET_PIECE_LINES` in `src/data/enemies/hc/campaign.ts`.
- Room objects: `HC_HAZARDS` in `src/data/enemies/hc/hazards.ts`, with 19 rooms:
  - 4 anchor (Hask, Still Reflection, Torvald with charges 1, Unsheathed with 1 anchor)
  - 7 vent (Morrow, Ostara, Organ, Volta, Konrad, Seraphine)
  - 1 light (Shadow That Left)
  - 3 pillar (Engine, Auditor, Hooded Man)
  - 5 cover (Lucan with charges 2, Gardener, Beetle King, Corva, Marchetti)
