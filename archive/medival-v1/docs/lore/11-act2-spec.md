# 11: Act II "The Seven Embers": data spec

Expands [06-campaign.md](06-campaign.md) Act II. **All ids here are fixed.** It's data-only and gated: the first quest requires `act1.complete && content.act2`. Same conventions as [10-act1-spec.md](10-act1-spec.md):
- `name` is the title; every quest has `reward.xpTier`.
- Choices become flags, and stages wait on `when: { flag }`.
- `obj:X` auto-opens `dialogue:obj-X`.
- British spelling and curly quotes.

**Hard rule (learned the hard way):** never put a quest-critical flag only on the LAST node of a dialogue. Set it at the moment the decision is made, on the choice's `effects` or the first node after it. Any scene opened with `openDialogue` whose flag a stage waits on must ALSO be re-openable from an NPC route or an `obj:` dialogue. The soft-lock bot randomly closes dialogues at choice nodes, and every stage must survive that.

Ember count: Act I ends at `world.embers_held = 2`. Each Act II hunt adds one via `{ addFlag: 'world.embers_held', amount: 1 }`, and every hunt's Ember moment also sets `ashmark.rank = 4` (idempotent). The seventh Ember belongs to Ysolde (Act III).

## Companions in Act II
These exist from Act I: Maren (`npc:maren-hollis`), Cadoc (`npc:cadoc-ap-ynys`, if `act1.ylwen_pact`), Grimma (`npc:grimma-ironsong`, if `act1.nails_exposed`), Sable (`npc:sable`), Anselm (if not betrayed, or once freed) and Hesta (if `act1.hesta_alive`).
New: **Vesper Qadri** (`npc:vesper-qadri`), recruitable in Ch5 (auction or glass throne).

## Regions, landmarks, objects (requested from Claude 2)
| Region | Landmarks |
|---|---|
| `region:lantern-coast` | `landmark:wick-tollgate` (Pilgrim's Road), `landmark:solenne-gate`, `landmark:pilgrim-camp`, `landmark:cathedral-of-the-brand` (in `instance:cathedral-of-the-brand`), `landmark:keepers-quarters` (same instance), `landmark:hierophant-court`, `landmark:valcastre` (in `instance:valcastre`), `landmark:valcastre-cells` |
| `region:ironspine` | `landmark:korrath-under-stone`, `landmark:thane-hall`, `landmark:vault-of-nine-nails` (in `instance:vault-of-nine-nails`), `landmark:the-empty-socket` (the failed Nails), `landmark:true-iron-seam` |
| `region:frostreach` | `landmark:north-pass-camp` (on the Ironspine side), `landmark:skelvik`, `landmark:skelvik-hall`, `landmark:wolf-moot-stones` |
| `region:saltreach-isles` | `landmark:gull-rock-hall` (the auction), `landmark:auction-vault`, `landmark:drowned-tide-temple` |
| `region:sunscar` | `landmark:zahrun`, `landmark:cindermother-tent` |
| `region:cinder-wastes` | `landmark:ash-road-end`, `landmark:qadir-gates`, `landmark:glass-throne` (in `instance:ruins-of-qadir`), `landmark:ashen-creed-camp` |
| `region:greywater-marsh` | `landmark:black-seep` (exists in the Act I spec) |
| `region:kingsvale` | `landmark:cinderhold-hall` (exists) |

Objects: `obj:dead-brand`, `obj:ysolde-journal`, `obj:suspect-ottavia-desk`, `obj:suspect-caius-cell`, `obj:suspect-ilse-reliquary`, `obj:valcastre-cell-door`, `obj:empty-socket`, `obj:true-iron-vein-1..3`, `obj:ember-of-the-deep`, `obj:new-nail-anvil`, `obj:wolf-ember-shrine`, `obj:auction-vault-lock`, `obj:ember-of-the-glass`, `obj:dream-brazier` (in cinderhold-hall), `obj:black-seep-heart`.

## NPCs (`src/data/npcs/act2-*.ts`)
| Id | Name | People | Faction | Home | Notes |
|---|---|---|---|---|---|
| `npc:hierophant-aurelian` | Aurelian IV, Hierophant | solenni | lanternate | hierophant-court | old and frightened; can be swayed to mercy |
| `npc:castor-vellane` | Castor Vellane, Lord-Inquisitor | solenni | order-of-the-wick | hierophant-court | "I hate fire left unattended." Brilliant, sincere |
| `npc:sister-ilse` | Sister Ilse | solenni | drowned-choir (secret) | keepers-quarters | Choir infiltrator; serene; absent once unmasked |
| `npc:deacon-ottavia` | Deacon Ottavia | solenni | lanternate | cathedral-of-the-brand | red herring: hoards forbidden books |
| `npc:brother-caius` | Brother Caius | solenni | lanternate | cathedral-of-the-brand | red herring: secretly Ashen Creed |
| `npc:brannoch-deepforge` | Brannoch Deepforge, High Thane | orrun | iron-concord | thane-hall | old and honour-bound; his attitude depends on `act1.nails_choice` |
| `npc:ketil-wolfsbane` | Ketil Wolfsbane | hrothi | wolf-moot | north-pass-camp | young, hungry, wants war; guide north |
| `npc:sigrun-ice-eye` | Sigrun Ice-Eye, Jarl of Skelvik | hrothi | wolf-moot | skelvik-hall | widowed war-leader under pressure |
| `npc:marisol-kestrel` | Admiral Marisol Kestrel | haldish | salt-league | gull-rock-hall | ruthless and funny; runs the auction |
| `npc:vesper-qadri` | Vesper Qadri, the Red Abbess | qasiri | ashen-creed | gull-rock-hall during the auction, then ashen-creed-camp | ex-nun, idealist; companion |
| `npc:benedetta-aurevine` | Benedetta Aurevine | solenni | lanternate | gull-rock-hall | Vellane's factor at the auction |
| `npc:samir-ibn-ruqaya` | Samir ibn Ruqaya | qasiri | qasiri | gull-rock-hall, then zahrun | the Cindermother's son and envoy |
| `npc:ruqaya-al-nar` | Ruqaya al-Nar, the Cindermother | qasiri | qasiri | cindermother-tent | oracle-matriarch |
| `npc:ozrah` | Ozrah the Unsleeping | drowned | — | glass-throne | speaker only (ghost); `presentWhen` his stage |
| `npc:nhal` | The Drowned One | drowned | drowned-choir | — | speaker only; `presentWhen: { flag: 'never' }` |

---

## Chapter 4: "The Dark Cathedral" (Lantern Coast)

**`quest:the-summons`** (main, xpTier 2). Requires `act1.complete && content.act2`, autoStart.
- `road`: reach `landmark:wick-tollgate`. `dialogue:ch4-tollgate`: the summons gets you through; reaction depends on `act1.ruler` and `prologue.hale_outcome`.
- `solenne`: reach `landmark:solenne-gate`. Snow on the vineyards; pilgrims praying.
- `brand`: interact `obj:dead-brand`; `dialogue:obj-dead-brand` (the cracked black husk). The Ashmark aches; the Embers in you hum. Unlock lore.
- `hierophant`: talk `npc:hierophant-aurelian`.
- `vellane`: objective `when act2.church_stance`. `dialogue:vellane-summons` demands the Embers:
  - **pledge**: `pledged`, +20 lanternate. Vellane gives you Wick papers (`item:wick-writ`).
  - **neutral**: polite refusal.
  - **defiant**: -25 lanternate, and Wick hostility in Lanternate lands (flag).
- End: starts `quest:sister-ilse`, `quest:the-ninth-nail`, `quest:the-wolf-moot`, `quest:the-ember-auction` and `quest:the-glass-throne`. If `prologue.anselm_betrayed`, also starts `quest:the-prisoner-of-valcastre`.

**`quest:sister-ilse`** (main, xpTier 2).
- `journal`: interact `obj:ysolde-journal` in `landmark:keepers-quarters`. `dialogue:obj-ysolde-journal` has extracts from Ysolde's visions and Hesta's letters to her. Sets `act2.journals_read`, gives `item:ysolde-journal`, unlocks lore.
- `clues`: interact `obj:suspect-ottavia-desk`, `obj:suspect-caius-cell` and `obj:suspect-ilse-reliquary`. Each scene reveals a secret; Ilse's is a reliquary of black water.
- `accuse`: objective `when act2.ilse_accused`. `dialogue:ch4-accusation` names a suspect in front of Vellane:
  - **Ilse** → `act2.ilse_unmasked`, `act2.ilse_accused = 'ilse'`. She smiles, speaks in the Drowned Tongue, and walks into the cathedral font.
  - **Ottavia or Caius** → `act2.wrong_accused` set to their name. The innocent is taken to Valcastre (Caius is Ashen Creed: -20 ashen-creed), and Ilse vanishes anyway.
- End: the quest is complete either way; the outcome is the accused name.

**`quest:the-prisoner-of-valcastre`** (companion, xpTier 2). Requires `prologue.anselm_betrayed`.
- `valcastre`: reach `landmark:valcastre`.
- `cells`: objective `when act2.anselm_freed`. `dialogue:obj-valcastre-cell-door` routes:
  - Shade or [Finesse 15]: pick the lock;
  - Hale's help (if `npc.garrick-hale.let_go`): he opens it and turns his back;
  - `act2.church_stance == pledged`: request his release; Vellane grants it for a price (flag `act2.owes_vellane`);
  - [Will 20]: persuade the jailer.
  - Anselm forgives you, or doesn't (`npc.anselm-pryde.forgave`, [Will 15] apology).
- Sets `act2.anselm_freed`, and Anselm follows.

## Chapter 5: four Ember hunts (any order)

**`quest:the-ninth-nail`** (main, xpTier 3). Requires `act1.korrath_gate_open`.
- `korrath`: reach `landmark:korrath-under-stone`, talk brannoch. If `act1.nails_kept` he trusts you; if exposed he is cold, and Grimma must vouch, or [Will 15].
- `vault`: reach `landmark:vault-of-nine-nails`; kill `enemy:wrought-sentinel` ×3 and `enemy:rust-wraith` ×2.
- `socket`: interact `obj:empty-socket`. The Ember of the Deep is plugging the gap the failed Nails left. Sets `act2.socket_seen`.
- `choice`: objective `when act2.deep_choice`. `dialogue:obj-ember-of-the-deep`:
  - **TAKE IT** → `act2.deep_choice = 'take'`, `act2.korrath_flooded`. The black water rises into the lower holds; Concord -25.
  - **FORGE A NEW NAIL** (requires Grimma following, or [Intellect 20]) → `act2.deep_choice = 'forge'` → stage `forge`: interact `obj:true-iron-vein-*` ×3, then interact `obj:new-nail-anvil`. Sets `act2.new_nail`; Concord +20; the Ember is freed safely.
- `ember`: the Ember joins you: `addFlag world.embers_held 1`, `ashmark.rank 4`, lore section. Reward `item:the-first-nail` (legendary true-iron warhammer, given only on the forge path, by Brannoch).

**`quest:the-wolf-moot`** (main, xpTier 3).
- `pass`: talk ketil at north-pass-camp. Sets `act2.northpass_open`.
- `skelvik`: reach skelvik, talk sigrun. The Ember fell on the Moot-stones, and the clans think it is Calun's sign to take the south.
- `moot`: objective `when act2.moot_outcome`. `dialogue:ch5-moot` at `landmark:wolf-moot-stones` offers four routes:
  - **deeds**: kill `enemy:rime-wolf` ×4 in a stage `deeds`, then the moot. Sets `allied`.
  - **wits**: a kenning riddle contest ([Intellect 15] three times). Win → `allied`; fail → `broken`.
  - **duel**: fight Sigrun's champion (`enemy:hrothi-champion` stage). → `allied`.
  - **steal**: at night, interact `obj:wolf-ember-shrine` → `act2.moot_outcome = 'stolen'`, `act2.hrothi_invasion`.
  - Persuading Sigrun that the south is starving too ([Will 20], or `act1.ruler == aldith` with a letter from the Queen) → `allied`, no invasion.
- `ember`: Ember of the Wolf: `addFlag world.embers_held`, `ashmark.rank 4`. Rewards: `item:frostjaw` if allied; Wolf-Moot +25 if allied.

**`quest:the-ember-auction`** (main, xpTier 3).
- `passage`: talk wren-tallow at Brackhaven (Act I NPC). Sets `act2.ship_passage`. The price is a favour (`act1.wren_favour`), or [Will 15], or Salt League rep ≥ 25.
- `isles`: reach `landmark:gull-rock-hall`.
- `bidders`: talk vesper, benedetta and samir (any order; three talk objectives). Sets up Vesper. Lore: each faction's bid.
- `auction`: objective `when act2.auction_outcome`. `dialogue:ch5-auction` (Kestrel presiding):
  - **win the bid**: with `act1.wren_favour == 'whole'`, Qasiri support (promise Samir the Glass Ember's safety) or Lanternate gold (if pledged);
  - **heist**: night stage; interact `obj:auction-vault-lock` (Shade, or [Finesse 20]);
  - **duel**: Kestrel's champion (`enemy:salt-corsair-champion`);
  - **betray a bidder**: sell Vesper to Benedetta. → `act2.vesper_betrayed`; lanternate +15, ashen-creed -40.
  - Outcome values: `bid | heist | duel | betrayal`.
- `ember`: Ember of the Tide: `addFlag world.embers_held`, `ashmark.rank 4`. Vesper offers to join if not betrayed (`companion` vesper, `act2.vesper_joined`).

**`quest:the-glass-throne`** (main, xpTier 3).
- `zahrun`: reach zahrun, talk ruqaya. Qasiri hospitality ("salt shared is a vow"). She gives the Ash Road route: `act2.ashroad_known`.
- `ashroad`: reach `landmark:qadir-gates`.
- `wyrm`: reach `landmark:glass-throne`, kill `enemy:ashwyrm` (boss).
- `ozrah`: talk `npc:ozrah` (`dialogue:ozrah-throne`): the ghost king's testimony. *The Heartfire was always dying; the Ashen Kings tried to save it, not steal it.* Set `act2.ozrah_truth` in the FIRST revelation node.
- `ember`: interact `obj:ember-of-the-glass`. If Vesper is present (following), she wants the Ember for the Creed: share the burden (`act2.vesper_trust`, she stays), refuse ([Will 15], or she leaves → `act2.vesper_left`), or let her hold it for one night (she returns it; +20 ashen-creed). Then `addFlag world.embers_held`, `ashmark.rank 4`.
- Reward: `item:crown-of-ozrah` (legendary circlet).

## Chapter 6: "Nhal"

**`quest:the-drowned-voice`** (main, xpTier 2). Requires at least 3 of the 4 hunts completed (all/any of `questCompleted`), autoStart.
- `dream`: on start `openDialogue: dialogue:nhal-first`, also reachable from `obj:dream-brazier` at cinderhold-hall. The visions change: Nhal speaks, not Ysolde. Set `act2.nhal_heard` on the first node.
- `counsel`: seek counsel. Talk rhiannon (if `act1.ylwen_pact`) or brother-ossory (otherwise); objective `when act2.nhal_revealed`. They reveal that Nhal wants to BECOME the new Heart, and that a third way exists: the Lullaby, plus the Embers, plus the Ashmark. Its price is that someone must stay below as the keeper. Sets `act2.nhal_revealed`, `act2.third_way_known`.

**`quest:the-pale-parley`** (main, xpTier 3). Requires `act2.nhal_revealed`, autoStart.
- `brazier`: interact `obj:dream-brazier` → `dialogue:obj-dream-brazier`, a truce-meeting with Ysolde in the dream (black water, the underside of the world). Present evidence; each `addFlag act2.ysolde_doubt 1`, set the moment it's chosen, each `once: true`:
  - Ozrah's testimony (requires `act2.ozrah_truth`);
  - her own journals and Hesta's letters (requires `act2.journals_read`); if `act1.hesta_alive`, Hesta speaks through the brazier instead (stronger, +1 extra but capped at 3);
  - the River Under (requires `act1.river_truth`).
  - Ysolde's final answer depends on doubt: 0–1 cold, 2 shaken, 3 she weeps and asks for proof in the Mirelands.
  - Set `act2.parley_done` on the first node after any choice.

**`quest:the-breach`** (main, xpTier 3). Requires `act2.parley_done`, autoStart.
- `word`: news arrives (`dialogue:ch6-breach-word` from Hesta, or Maren if Hesta is dead): Greywater is collapsing.
- `seep`: reach `landmark:black-seep`; kill `enemy:mirebeast` ×2 and `enemy:mireling` ×6.
- `heart`: interact `obj:black-seep-heart` → `dialogue:obj-black-seep-heart`. You can't close it. Ysolde's Choir has opened the Breach.
  - Set `act2.complete`, `act3.breach_open`, `world.mire_level = 4` on the first node.

## Codex (`src/data/lore/act2-*.ts`, ~40)
- **Places:** `lore:solenne`, `lore:cathedral-of-the-brand`, `lore:valcastre`, `lore:korrath-under-stone`, `lore:vault-of-the-nine-nails`, `lore:skelvik`, `lore:the-wolf-moot-stones`, `lore:brackhaven-auction`, `lore:zahrun`, `lore:the-ash-road`, `lore:ruins-of-qadir`, `lore:the-breach`.
- **History:** `lore:saint-solenne`, `lore:the-wick-edict`, `lore:the-iron-concord-treaty`, `lore:the-rusting`, `lore:the-ashen-kings`, `lore:ozrah-the-unsleeping`.
- **Factions:** `lore:the-hierophancy`, `lore:wolf-moot`, `lore:qasiri-caravans`, `lore:the-red-abbess`.
- **Peoples:** `lore:the-hrothi`, `lore:the-qasiri`.
- **Gods:** `lore:ithren-the-lantern`, `lore:vor-the-hammer`, `lore:calun-the-wanderer`, `lore:ashvar-the-ember-tongue`, `lore:kethra-the-thorn`, `lore:nhal-the-drowned` (hidden until `act2.nhal_heard`).
- **Magic:** `lore:heartstone`, `lore:true-iron`, `lore:the-third-way` (hidden).
- **Characters:** `lore:castor-vellane`, `lore:hierophant-aurelian`, `lore:sigrun-ice-eye`, `lore:marisol-kestrel`, `lore:vesper-qadri`, `lore:ruqaya-al-nar`.
- **Bestiary:** `lore:wrought-sentinels`, `lore:cinderdrakes-and-ashwyrms`, `lore:mirebeasts`, `lore:rime-wolves`.
- **Culture:** `lore:hrothi-kennings`, `lore:qasiri-salt-law`.
- **Sections on existing entries:**
  - `lore:the-seven-embers`: `deep`, `wolf`, `tide`, `glass`
  - `lore:the-forging`: `truth` (exists; unlocked by `act2.nhal_revealed`)
  - `lore:the-mire`: `nhal` (new)
  - `lore:ysolde-the-pale-saint`: `journals` (new)

## Needs from other teams (Claude 1 relays)
- **Claude 2:** the landmarks, instances and objects above, plus:
  - npc-anchors at every NPC home;
  - Solenne snowed in;
  - variants for `act2.korrath_flooded` (lower holds flooded) and `act2.hrothi_invasion` (raider camps in the northern Kingsvale);
  - `world.mire_level` 4 spreading seeps;
  - the Breach visual at the black-seep.
- **Claude 3:**
  - enemies `enemy:wrought-sentinel` (wrought), `enemy:rime-wolf` (beast), `enemy:hrothi-champion` (folk, duel), `enemy:salt-corsair-champion` (folk, duel), `enemy:ashwyrm` (cinderdrake boss), `enemy:mirebeast` (unwrought);
  - items `item:wick-writ`, `item:ysolde-journal` and `item:true-iron` (if it doesn't already exist);
  - legendaries `item:the-first-nail`, `item:frostjaw` and `item:crown-of-ozrah` (already in SYSTEMS §7.5).
