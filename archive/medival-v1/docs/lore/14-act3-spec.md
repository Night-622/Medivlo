# 14: Act III "The Heartforge": data spec

Expands [06-campaign.md](06-campaign.md) Act III. **All ids are fixed.**
- **Gate:** data-only; the first quest requires `act2.complete && content.act3`.
- **Conventions:** same as the Act II spec, including its **Hard rule** (set decision flags at the decision; every quest-critical scene reopenable from an NPC route or an `obj:`; scenes opened by `openDialogue` must have one of those as a backup).
- **Bot:** the soft-lock bot with INTERRUPT must reach the end.

## Flags Act III reads (from earlier content)
| Area | Flags |
|---|---|
| Act I | `act1.ruler` (aldith/harrow/wick), `act1.hesta_alive`, `act1.ylwen_pact`, `act1.nails_kept` / `act1.nails_exposed` |
| Act II | `act2.church_stance` (pledged/neutral/defiant), `act2.korrath_flooded` / `act2.new_nail`, `act2.moot_outcome` (allied/broken/stolen), `act2.hrothi_invasion`, `act2.auction_outcome`, `act2.vesper_joined` / `act2.vesper_betrayed` / `act2.vesper_left`, `act2.samir_promise` / `act2.samir_promise_broken`, `act2.ozrah_truth`, `act2.third_way_known`, `act2.ysolde_doubt` (0–3), `act2.ilse_unmasked`, `act2.anselm_freed`, `act2.owes_vellane` |
| Companions | `companion.<slug>.following` / `.loyalty`, `companion.maren-hollis.oath`, `companion.anselm-pryde.path` (reform/inquisitor/heretic), `act2.warden_archive` (cinderhold/published/burned), `companion.cadoc-ap-ynys.verse` (sung/left), `companion.grimma-ironsong.ring`, `companion.sable.fate` (saved/gone/bound) |
| Prologue | `prologue.tobin_fate`, `act1.tobin_saved` |

## World requests (Claude 2)
- `region:kingsvale`: siege variant when `act3.siege_active`. Haldren walls burning, Hollowed camps on the plain. Landmarks: `landmark:haldren-river-gate` (new), `landmark:lower-city` (new).
- `region:mirelands`: `landmark:mireland-shore` (the way in from the black-seep), `landmark:the-unmade-road`, `landmark:drowned-cathedral` (Ysolde's seat, in `instance:drowned-cathedral`), and dream objects `obj:dream-memory-1..7`.
- `region:heartforge`:
  - Routes in: `landmark:heartforge-gate` (beneath the Vault, needs the Orrun) or `landmark:kings-stair` (beneath Qadir, needs the Qasiri).
  - Inside: `landmark:the-anvil-of-ribs`, `landmark:heart-of-orr` (with `obj:heartfire`).

## NPCs
Mostly reuse existing NPCs. New:
- `npc:ysolde` becomes present in `landmark:drowned-cathedral` during Ch8. She is defined already as speaker-only; add a new presence and routes file.
- `npc:nhal-risen` (speaker for the final boss).
- `npc:siege-captain` (Ser Bryce Aldmere is fine to reuse: `npc:bryce-aldmere`).

## Chapter 7: "The Siege of Haldren"
**`quest:the-last-lanternmass`** (main, xpTier 3). Requires `act2.complete && content.act3`, autoStart. On start: `act3.siege_active = true`, `world.mire_level = 5`.
- `muster`: talk hesta at cinderhold-hall (or anselm, else maren; route on all three). `dialogue:ch7-muster` walks through who answers the call and sets `act3.ally.<x> = true` on the first node, computed by condition branches:
  - `thornwise` if `act1.ylwen_pact`
  - `orrun` if `act2.new_nail` or `act1.nails_kept`, and not `act2.korrath_flooded`
  - `hrothi` if `act2.moot_outcome == allied`
  - `salt` if `act2.auction_outcome` is bid or duel
  - `creed` if `act2.vesper_joined` and not betrayed
  - `qasiri` if `act2.samir_promise` and not broken
  - `church` if `act2.church_stance == pledged` or `act1.ruler == wick`
  - Also `act3.ally_count` (number) via addFlag.
- `walls`: reach `landmark:haldren-gate`; kill `enemy:drowned-knight` ×3, `enemy:hollowed-thrall` ×8, `enemy:mirebeast` ×1.
- `betrayal` (only when `act1.ruler == harrow`): Harrow opens the river gate (`landmark:haldren-river-gate`). `dialogue:ch7-harrow-gate` gives three options, setting `act3.harrow_fate` = `slain` / `arrested` / `fled`:
  - stop him by force;
  - [Will 20], or showing his letters (`npc.osric-harrow.dates_known`);
  - let him run.
  - If he flees, the river gate stays open, which is −1 to the defence.
- `fire` (only when `act3.ally.church`): Vellane orders the lower city burned to stop the tide. `dialogue:ch7-vellane-fire` sets `act3.lower_city` = `saved` / `burned`:
  - stop him: [Will 20], or `act2.warden_archive == published` (the Church is split and he lacks the authority), or Hale's help (`npc.garrick-hale.let_go`);
  - or let it burn.
- `dawn`: objective `when act3.siege_outcome`. `dialogue:ch7-dawn` is the Lanternmass dawn: the city lights every lantern it has. Outcome is `held` when `act3.ally_count >= 3`, else `fallen`. A fallen city means survivors at Cinderhold. Set on the first node; reopenable via `obj:haldren-great-lantern` (new object at haldren-market).

## Chapter 8: "The Hollow Sea"
**`quest:into-the-dreaming`** (main, xpTier 3). Requires `quest:the-last-lanternmass` completed, autoStart.
- `shore`: reach `landmark:mireland-shore`.
- `dreams`: interact `obj:dream-memory-*` ×3. Each opens `dialogue:obj-dream-memory-N`: a companion's worst dream, chosen by entry conditions on who is following.
  - The dreams: Maren and Tobin; Anselm and Wenna; Sable and the water; Cadoc and Ys; Grimma and the empty socket; Vesper and the burning abbey; Hesta and the girl Ysolde.
  - Choices shift loyalty and set `act3.dream.<slug> = faced|fled`.
  - If no companion follows, the player's own dream (the night of the Ashmark).
- `road`: reach `landmark:the-unmade-road`; kill `enemy:drowned-thing` ×4.
- `ysolde`: reach `landmark:drowned-cathedral`, talk `npc:ysolde`. `dialogue:ch8-ysolde` is the confrontation.
  - She turns if `act2.ysolde_doubt >= 2` and at least one of: `companion.sable.fate == saved` (the proof that someone half-gone can come back), `act2.warden_archive == published`, or `act1.hesta_alive` with Hesta following.
  - A turned Ysolde gives Ember #7: `act3.ysolde_fate = turned`.
  - Otherwise she fights: stage `boss` kills `enemy:ysolde-pale-saint`, then `dialogue:ch8-ysolde-fallen` offers `slain` / `spared` (spared means she lives, broken).
  - Set `act3.ysolde_fate` at the decision.
- `ember`: the seventh Ember. `world.embers_held = 7`, `ashmark.rank = 5`, `act3.embers_complete`.

## Chapter 9: "The Heart of Orr"
**`quest:the-heart-of-orr`** (main, xpTier 3). Requires `quest:into-the-dreaming` completed, autoStart.
- `way`: choose the way down. Objective `when act3.heartforge_unsealed`.
  - Via the Vault (`landmark:heartforge-gate`, Brannoch opens it if Concord rep ≥ 0, or Grimma's ring).
  - Via the Kings' Stair (`landmark:kings-stair`, if `act2.ozrah_truth`; the Cindermother's blessing).
  - Fallback: the Ashmark burns the seal open (always).
  - `dialogue:obj-heartforge-seal` / `dialogue:ch9-brannoch-gate` / `dialogue:ch9-kings-stair` set it.
- `descent`: reach `landmark:the-anvil-of-ribs`; kill `enemy:wrought-sentinel` ×2 and `enemy:drowned-thing` ×3.
- `nhal`: reach `landmark:heart-of-orr`; kill `enemy:nhal-risen` (final boss). Before the fight, `dialogue:ch9-nhal` (Nhal's offer: become the Heart together; accepting starts the Usurp ending) sets `act3.nhal_offer = refused|accepted`. If accepted, skip the fight → stage `choice`.
- `choice`: interact `obj:heartfire` → `dialogue:obj-heartfire`, THE ENDING CHOICE. Set `act3.ending` on the choice itself.
  - **Rekindle**: always available. Variant `iron-lantern` when `act2.church_stance == pledged` or `act1.ruler == wick` and `act3.lower_city != saved`: Vellane arrives with the Brand-lit lanterns.
  - **Reforge**: requires `act2.third_way_known` and `companion.cadoc-ap-ynys.verse == sung` (or `act1.ylwen_pact` plus Cadoc following). Choose the keeper: `act3.keeper` = `player` / `ysolde` (if turned or spared) / `hesta` (if alive).
  - **Quench**: requires `act3.ysolde_fate` turned or spared, or `act2.ysolde_doubt <= 1`. "Let it dream."
  - **Usurp**: requires `act3.nhal_offer == accepted`, or the `hollow-touched` tag, or `class:reaver`.
  - Then `act3.complete = true`.
- `epilogue`: on entering, `openDialogue` the epilogue slides in order (they queue). The quest completes when `act3.epilogue_seen` is set, by the last slide's first node; also reopenable from `obj:heartfire`.

## Epilogue slides (`src/data/dialogue/epilogue*.ts`)
One dialogue per topic. Each is a single narrator node (or 2–3) whose entries branch on flags: the ending, plus that topic's history. Opened in this order:
1. `dialogue:epilogue-world` (the ending itself)
2. `dialogue:epilogue-haldmarch` (ruler, siege outcome)
3. `dialogue:epilogue-church` (stance, archive, Vellane, Aurelian)
4. `dialogue:epilogue-wardens` (Cinderhold, Hesta)
5. `dialogue:epilogue-thornwise`
6. `dialogue:epilogue-orrun`
7. `dialogue:epilogue-north`
8. `dialogue:epilogue-salt-and-ash` (the Salt League, the Ashen Creed and the Qasiri)
9. `dialogue:epilogue-ysolde`
10. companions: `dialogue:epilogue-maren`, `-anselm`, `-cadoc`, `-grimma`, `-sable`, `-vesper` (each branches on its personal-quest flags and loyalty; skipped by entry conditions if never met)
11. `dialogue:epilogue-ashmarked` (the player; the keeper, if they stayed below)
The last one sets `act3.epilogue_seen` on its first node.

## Codex (`src/data/lore/act3-*.ts`, ~25)
- **Places:** `lore:the-mirelands`, `lore:the-drowned-cathedral`, `lore:the-heartforge`, `lore:the-anvil-of-ribs`, `lore:the-kings-stair`, `lore:the-siege-of-haldren`.
- **History:** `lore:the-last-lanternmass`.
- **Magic:** `lore:the-heartfire` (the truth), `lore:the-keeper`, `lore:the-seventh-ember`.
- **Characters:** `lore:ysolde-maerin` (the full, final entry).
- **Bestiary:** `lore:drowned-things`, `lore:nhal-risen`.
- **Endings** (hidden; unlocked by `act3.ending`): `lore:ending-rekindle`, `lore:ending-iron-lantern`, `lore:ending-reforge`, `lore:ending-quench`, `lore:ending-usurp`.
- **Sections on existing entries:** `lore:the-seven-embers` `lantern`; `lore:nhal-the-drowned` `risen`; `lore:the-third-way` `kept`.

## Needs
- **Claude 2:** the world above.
- **Claude 3:** `enemy:drowned-thing` (unwrought), `enemy:ysolde-pale-saint` (boss), `enemy:nhal-risen` (final boss, phases).
