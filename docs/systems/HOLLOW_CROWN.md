# The Hollow Crown: systems outline (Claude 3)

Scope: classes, combat, gear, bestiary, skill trees, co-op/PvP rules, and the Inventory, Skills and Spells screens. It replaces `SYSTEMS.md` for the rebuild; that file still describes the retired Medival build until the old code is removed.
Sources: `Medieval Browser Action RPG/` handoff (`gear.js`, `bestiary.js`, `legendary.js`, `realms.js`, `atlas.json`, `Medival Screens.dc.html` → `CLASSES`, `skTree`, `SKSP`, `SKEL`, `SKKEY`, `STAT`, `BASE`).

## 0. Architecture

| Layer | Folder | Phaser? | Runs where |
|---|---|---|---|
| Content data (typed, generated from the handoff) | `src/data/{classes,items,enemies,skilltrees,spells}/hc/` | no | everywhere |
| Rules (stats, damage, loot, XP, trees, set bonuses, co-op scaling) | `src/systems/rules/` | no | everywhere (pure functions, used by the sim and by tooltips) |
| Simulation (players, enemies, projectiles, ground effects, loot, statuses, AI) | `src/systems/sim/` | no, and no DOM | authority only: `Services.get('net').isAuthority()` |
| Input (keyboard/mouse → `InputFrame`) | `src/systems/input/` | yes | every client |
| Rendering (snapshot → sprites, damage numbers, telegraphs) | `src/systems/view/` | yes | every client, including the authority |
| Screens (Inventory, Skills, Spells) | `src/ui/character/` | yes | every client |

- The sim is a fixed-step loop: `Sim.step(dtMs, inputs: Map<PlayerId, InputFrame[]>)`. It is seeded by an `Rng`, holds only plain JSON state, and has no timers outside its own clock. The headless Node server can run it unchanged.
- Entity ids are stable and follow Claude 1's prefixes: `p:<uid>`, `e:<n>`, `proj:<n>`, `loot:<n>`, plus ground effects as `fx:<n>` (kind `object`, requested in §9).
- The sim publishes `EntityState[]` through a `SnapshotProvider`, and the view renders through a `SnapshotConsumer`. In solo, the view reads the same snapshots, so solo and co-op share one code path.
- Combat events are emitted on the authority and replicated: `combat:hit`, `enemy:killed`, `boss:phase`, `player:*`, `item:picked`. Clients spawn VFX and damage numbers only from those events and from snapshots.
- Each player's **character** (class, level, XP, gold, inventory, equipment, tree ranks, hotbar) belongs to that player's client and is saved there.
  - The authority holds a working copy, received in a `loadout` message.
  - XP, gold and items earned are granted by the authority through replicated events that carry a `playerId`. The owning client applies them and saves.

## 1. Classes (24 in 12 schools)

- Magic schools:
  - Rime: Warden, Rimecaller
  - Verdant: Ranger, Hedgewitch
  - Ash: Reaver, Arcanist
  - Storm: Stormlancer, Sparkwright
  - Radiance: Oathbound, Cantor
  - Umbral: Shade, Duskweaver
- Martial schools:
  - Blade: Swordsman, Samurai
  - Iron: Knight, Juggernaut
  - Fist: Monk, Brawler
  - Hunt: Huntsman, Falconer
  - Guile: Corsair, Jester
  - Song: Bard, Skald

Each class kit (`src/data/classes/hc/kits.ts`) contains:
- **Identity**, from the handoff: name, epithet, school, role, tags, colour, lore and difficulty.
- **Rating:** the handoff's 4-pip bars. Might (0–5) feeds weapon damage, Guard feeds health and armour, Arcana feeds spell power and Ember, and Speed feeds move and attack speed plus crit. The base stats follow the handoff `BASE`: sp 12, hp 180, ember 100, regen 5, armour 6, crit 5%, critd 50%.
- **Weapons:** the weapon types the class may wield (e.g. Warden: sword, mace, spear) and its default starting weapon.
- **Basic attack:** the auto-attack's form. It is either melee (an arc, a range and a swing time) or ranged (a projectile with a speed and a range), taken from the equipped weapon type and adjusted per class (Shade daggers strike twice, Bard's lute fires notes).
- **Spells 1–3:** the handoff's three abilities, which are free starting spells in the Spells tree. Each one has a mechanical definition: shape (projectile, cone, circle, dash, self, ally, ground or summon), damage coefficient, Ember cost, cooldown, statuses and range.
- **Slot 4:** this slot takes the school spells (two top nodes) and the ultimate learned in the Spells tree. The player binds any learned spell to any of slots 1–4.
- **Class mechanic:** one small hook per class that makes it play differently. It reuses the handoff text where the handoff gives one. Examples:
  - Reaver Bloodburn pays HP instead of Ember.
  - Shade strikes from behind deal Umbral damage.
  - Fist Momentum: 0–5 stacks, +5% attack speed each.
  - Falconer has a hawk companion entity.
  - Bard and Skald buffs hit allies.
  - Jester's Punchline: every 5th hit crits.
- **Resources:** every class uses Ember (mana) and stamina (dash = 25). Fist classes also have Momentum, and Reaver spends health. No other secondary bars.

## 2. Controls and combat (handoff)

| Input | Action |
|---|---|
| WASD | Move (8-dir, normalised). Movement cancels auto-approach. |
| Left-click enemy | Set `target`. The hero auto-attacks while the target is valid and in range, and walks to it when out of range and no WASD is held. |
| Left-click ground / hold | Basic attack toward the cursor (`aim`), no target needed |
| 1–4 | Cast the bound spell. It aims at the target if there is one, otherwise at the cursor. |
| Space | Dash 72 px in the move direction (or toward the cursor when standing still). Costs 25 stamina, gives 220 ms of i-frames, then a 400 ms cooldown. |
| Q / E | Drink the best health / Ember potion carried. Each has its own 8 s cooldown. Second Wind is used from the pack. |
| F | Talk/interact (Claude 2/4). Held near a downed ally, it revives them (§6). |
| I / K / B | Inventory, then Skills (Skills branch) and Spells (Spells branch) on the same tree screen. These are client-side UI only. |
| J / M / Esc | Journal (Claude 4) / Map (Claude 2) / Pause (Claude 1). These are client-side UI only. |

- Inputs reach the sim only as `InputFrame` (Claude 1's `Btn` bitmask). Simulation code never reads the keyboard.
- Casting while moving is allowed; channels and charged spells root the caster. Basic attacks have a short wind-up, and moving cancels the wind-up but not the swing.
- Enemies show a telegraph (a red ground shape) for every ability. Damage resolves when the telegraph ends, so dodging matters.

### 2.1 Damage

`hit = base × (1 + Σincreased) × Πmore × crit × mitigation × resist × vuln`

- **base:**
  - For attacks: the weapon roll × (1 + 0.04·Might + 0.01·level).
  - For spells: `coef × (sp + weaponAvg × 0.25)`.
- **Crit:** chance = `crit%`, multiplier = 1 + `critd%`.
- **Mitigation (physical):** `armor / (armor + 40 + 12·attackerLevel)`, capped at 75%. Elemental hits use the school resist, which is capped at 60%.
- **Elements:** each of the 12 schools is a damage type, plus Beast, which is physical. An enemy's `el` field sets its damage type and gives it 25% resistance to that type.
- **Statuses:**
  - burn (Ash): damage over time.
  - chill → freeze (Rime): a slow that builds up to a stun.
  - shock (Storm): chains to nearby targets.
  - bleed (Hunt/Blade): damage over time.
  - root (Verdant).
  - stun.
  - blind (makes attacks miss).
  - mark (+25% damage taken).
  - sleep (breaks on damage).
  - taunt.
  - Bosses take 50% shorter control effects and get 4 s of control immunity after each one.
- **Player stagger:** the player flinches for 450 ms, then gets 3 s of flinch immunity. This rule carries over from the old build.

### 2.2 Curves (level cap 40)

- Health and spell power: `P(L) = 1.075^(L-1)`. Enemy damage: `D(L) = 1.05^(L-1) × 1.25`.
- XP: `xpToNext(L) = round(80·L^1.7 + 120)`. A kill gives `xpToNext(min(enemyLevel, L + 5)) / killsPerLevel(L) × tier × levelDiff` (rules/curves.ts), with tier 1 for an enemy, 6 for a mini-boss and 25 for a boss (elites ×ELITE.xp on top).
  - killsPerLevel follows the hero's level: 110 through L14, 70 at L16, 48 at L28, 30 at L40 (linear between). Set 2026-10-20 from the static projection on Claude 2's walks (tools/e2e/sim/xp-project.ts), after the pacing passes made kills over half a campaign's XP.
  - levelDiff: +20% per level the enemy is above you (catch-up, up to +5), −25% per level below, never under 10%.
  - Projected act ends (quest-only + walks, min/median/max): I L13.7/14.2/15.1, II 24.7/27.7/32.3, III 38.1/39.2/40. Main quests only: medians 13.0 / 25.2 / 36.2.
- Level bands per class campaign, following Claude 4's act shape:
  - Act I (home realm): L1–14, 3 bosses.
  - Act II (Morvane/Concordia): L14–28, 3 bosses.
  - Act III (Heart of Morvane): L28–40, 2 bosses plus the Hollow King at L40.
- Skill points: 1 per level from L2 (39 in total), plus quest rewards. About 20 per campaign, through `quest:reward.skillPoints`.

## 3. Gear (import of `gear.js`)

- **Slots:**
  - main, off, head, chest, hands, feet, ring ×2, amulet.
  - Cosmetic accessories (back, neck, face, extra), restricted per class by `kitOf(class)`.
  - Dye: 4 options per class.
  - Headwear: 3 options per class.
- **Weapons:** 8 types × 8 materials (wood → sparkforged).
  - spear, bow and staff are two-handed. The other types are one-handed, and a one-handed main hand allows a dagger or wand in the off hand (50% of its damage, plus its stats).
  - Rarity follows the material: common, fine, ember, runed, wrought, spark.
- **Armour:** 96 sets (12 schools × 8 styles), 4 pieces each (384 items). Rarity and tier follow the style, from cloth (tier 0) up to vestment (tier 7).
  - **2 pieces**, from the style: cloth +10% move speed · leather +8% crit · fur +60 HP · mail +15 armour · robe +30 Ember · scale −10% damage taken below 50% HP · plate +25 armour · vestment +2 Ember regen.
  - **4 pieces:** the style sets the trigger and the school sets the effect.
    - Triggers: every 5th attack · after a dash · on kill · when hit (4 s internal cooldown) · when casting (3 s internal cooldown) · below 50% HP (30 s internal cooldown) · on block · on heal.
    - Effects: Ash fire ring (burn 3 s) · Rime freeze nearby 1.5 s · Storm chain lightning ×3 · Radiance shield worth 15% HP · Umbral drain · Verdant root + heal over time · Blade guaranteed crit that ignores armour · Iron −40% damage taken for 3 s · Fist +1 Momentum · Hunt mark nearest (+25% for 6 s) · Guile smoke (untargetable 1 s) · Song +15% ally damage for 5 s.
    - So the bonus is a 2-field table, not 96 bespoke effects.
  - **Attuned** (wearer's school = set school, with 4 pieces): Ash +15% damage and burns last +1 s · Rime +15% damage and slows +20% · Storm +15% damage and chains +1 · Radiance +15% healing · Umbral 10% lifesteal · Verdant +3 HP/s in combat · Blade +10% crit with blades · Iron 10% block chance · Fist +10% attack speed · Hunt +15% damage to distant foes · Guile +20% Embershards · Song +30% buff duration.
- **Item level:** dropped gear rolls an item level equal to the enemy's level.
  - Stats are normalised from the handoff values (which assume item levels 2–16): `value(L) = handoff / 1.075^(ilvl_h − 1) × P(L)`.
  - Weapons gain an extra `× (1 + 0.05·materialIndex)`.
  - Drop gating:
    - A material or style becomes droppable at `L ≥ 1 + 5·index`: iron at 6, steel at 11 … sparkforged at 36.
    - Rarer tiers stay uncommon after they unlock.
- **Items (64):**
  - Potions (Q/E use the potion lines).
  - Food: out of combat, restores and buffs.
  - Scrolls: free casts of school spells. The tome teaches a spell.
  - Gems: socket into gear. One socket on runed and higher gear, adding a flat stat by gem type.
  - Materials and tools: crafting and quest use, plus a few active tools (bomb, torch, lantern).
  - Trinkets: rings and amulets with stats scaled by item level.
  - Relics: quest items, not sellable.
- **Paperdoll:** `atlas.heroComposer.equipRules`.
  - The view re-bakes the hero through Claude 1's hero composer whenever equipment, dye or headwear changes.
  - The sim replicates only `data.look` (a short appearance-and-equipment key).
- **Legendaries (25):** one Sparkforged unique per bestiary boss, from `MV.LEGENDARY`. Each is a weapon, ring or amulet with one of 6 effects:
  - Every third hit releases an elemental shockwave.
  - Kills restore 10% HP and Ember.
  - The ultimate recharges 30% faster.
  - Immunity to that boss's signature status.
  - Crits summon a 3 s echo.
  - +25% damage to bosses and mini-bosses.
  The boss drops it on its first kill per character, and after that 10% of the time.
- **Currency:** Embershards (the economy service's `gold()`).

## 4. Bestiary (import of `bestiary.js` + realm creatures)

- **Count:** 142 creatures: 69 enemies, 48 mini-bosses and 25 bosses.
- **By realm:** each of the 13 realms has 3 enemies, 2 mini-bosses and 1 boss (78). Another 64 creatures belong to the Morvane regions (Gloamwood, Drowned Abbey, Briar Hollow, Ashfall Kiln, Frostmere Pass, Gilded Ruins, Stormcliffs, Morvane Marsh, Heart of Morvane, Aldermoor, Morvane Road).
- **Levels:** creatures are level-agnostic. Claude 2's `enemy:spawn-request` sets `level` and may promote `tier`, for example a mini-boss used as an Act I boss.
  - HP = `tierHp(tier) × hpShape × P(L) × partyHp(n)`. `hpShape` is the handoff hp divided by the median for that tier, clamped to 0.6–1.6.
  - Damage = `tierDmg(tier) × D(L)`.
- **AI by body type** (`arch`):
  - quad: chase, then lunge.
  - slime: hop; some split.
  - skeleton: melee or archer.
  - humanoid: melee or caster, chosen from its ability text.
  - spirit: floats, phases, casts.
  - flyer: swoops; ignores ground collision.
  - plant: stationary ranged/root.
  - construct: slow, heavy slams.
  - bug: swarm/burrow.
  The basic finite state machine is idle → alert → engage → (flee) → return, with Director attack tokens and a leash. It carries over from the old build and is rewritten Phaser-free.
- **Abilities:**
  - Each handoff ability line maps to a mechanical ability via a keyword table: lunge, charge, ranged shot, cone breath, ground slam, summon N, split, heal, shield, teleport, root, blind, drain, darkness.
  - Lines the table doesn't catch get a body-type default, and the build-time validator lists them.
- **Bosses:**
  - "Phase N:" lines give the phases, at 100/66/33% HP. Each phase adds its ability to the rotation.
  - `boss:phase` is emitted at each threshold. Phase transitions give 1.5 s of invulnerability and a roar.
- **Drops:** the handoff `drops` list names materials and relics. Item names are resolved against `ITEMS`, and loose names become materials. The loot tables are generated per creature: tier, level and region select the gear pool.
- **Realm Act I pools:** the realm's 6 creatures, plus Morvane creatures that share the realm's element, so a 15–20 h act has variety. Claude 2 and Claude 4 pick the spawns. I publish `bestiaryFor(realm)` and `bestiaryByElement(el)`.

## 5. Skill tree (3 branches × 24 nodes per class)

- The layout is exactly the handoff `skTree()`:
  - root → 3 paths of (major → minor → minor → major with 3 ranks → a fork of 2 mutually exclusive choice nodes).
  - 2 bridge nodes, which need either neighbouring path's second minor.
  - 2 top nodes, each needing any choice from the two paths below it.
  - 1 ultimate.
  Node ids are `<branch letter>_<node>`, e.g. `s_p0a`.
- **Spells branch:**
  - The root is "<Class> Spellcraft".
  - Each path is built on one kit spell: the free starting spell, then +8% damage, −8% Ember cost, a 3-rank upgrade (Empowered/Quickened/Efficient), and a variant fork (Echo or Split, Twin or Wide, Lingering or Burst).
  - The tops are the 2 school spells, 3 ranks each, from `SKSP`. The ultimate is the school ultimate.
- **Skills branch:**
  - The root is "<School> Discipline".
  - The paths are offence (school damage, then crit, then the school element node from `SKEL`), defence (Toughness, then Iron Will) and focus (Ember, then Quick Mind), each ending in a fork.
  - The tops are the 2 mutually exclusive school keystones from `SKKEY`. The ultimate is "Avatar of <School>".
- **Upgrades branch:**
  - The root is "Adventurer".
  - The paths are Vitality/Fleet Foot, Ember Reserve/Deep Pockets and Endurance/Second Breath, with forks such as Extra Dash, Potion Belt, Quick Study and Haggler.
  - The tops are Seasoned and Lucky. The ultimate is "Hero of Morvane".
- Every node has a mechanical `EffectDef[]` (stat modifiers, granted spells, spell modifiers or named hooks), and the text is generated from those effects. The tree is generated in code from the class and school (`buildTree(classId, branch)`), not stored as 72 hand-written nodes per class.
- **Points:**
  - All three branches share one pool. Ranks cost 1 point each.
  - Resetting a branch costs `10 × level` Embershards at any waystone and returns that branch's points.

## 6. Co-op (up to 4) and public realms (up to 8)

- **Downed:**
  - When a player in a party reaches 0 HP, they are downed. They crawl at 30% speed and can't act, and enemies drop them as a target.
  - Bleed-out lasts 30 s.
  - A teammate within 40 px who holds F for 3 s revives them at 30% HP. Taking damage interrupts the revive.
  - Once everyone is downed, or in solo at 0 HP, the party wipes: every player respawns at the last waystone with full HP and 10% of carried Embershards lost. Claude 1 shows the Death screen.
- **Scaling with party size n:**
  - Enemy HP × (1 + 0.6·(n−1)); boss HP × (1 + 0.75·(n−1)).
  - Spawn count × (1 + 0.5·(n−1)), rounded, applied by Claude 2's spawner through my `spawnCountMult(n)`.
  - Enemy damage is unchanged.
  - Enemies pick a target by threat (damage + healing + taunt), with a proximity tiebreak.
- **Loot:** shared drops. Each loot roll is repeated n times (2 players → double).
  - Drops are world entities that anyone can pick up. Gear is free-for-all.
  - Gold and consumable piles go to the player who picks them up.
  - Quest items drop once for each player who needs them.
- **XP:** every party member within 900 px of a kill gets full XP at their own level. There is no level sync, and the low-level clamp in §2.2 still applies.
- **PvP by realm rule** (`SessionInfo.realmRule`):
  - Peaceful: there is no player-on-player damage.
  - Duels: PvP only between two players who have both accepted a duel. The loser is left at 1 HP and loses nothing.
  - Arena: PvP only inside arena zones (Claude 2 world flag). A death there means respawning at the arena edge with no penalty.
  - Free-for-all: PvP everywhere except safe zones.
    - A PvP death drops 20% of carried Embershards as a loot pile. Only the killer can pick it up for 30 s, and after that anyone can.
    - The victim respawns at the waystone with 5 s of spawn protection.
  - PvP numbers: damage ×0.5, control durations ×0.5, no downed state (players die outright).

## 7. Screens (per handoff layout)

- **Inventory (I):**
  - Character panel 400×604: equip slots 56 px in two columns, with the hero at 3× in the middle.
  - Pack 760×604: an 11×6 grid with 8 px gaps.
  - Tooltip 268 px wide: rarity frame, compare deltas, set bonus progress (2/4 and Attuned) and requirements.
  - Category filter tabs from `CATS`.
- **Skills (K) / Spells (B):** one tree screen with 3 branch tabs (keys 1–3), node frames and sizes per the handoff, a detail card, a Learn button (Enter), the points counter and branch reset.
- The screens read the local player's character from the client copy. Equip, learn and reset are actions:
  - In solo, they apply locally.
  - In co-op, they apply locally and then resend `loadout`.

## 8. Build and validation

- `docs/systems/tools/import-handoff.cjs` generates `src/data/**/hc/*.gen.ts` from the handoff JS. It runs in a stubbed VM, so the data stays a 1:1 copy and can be re-run when the handoff changes.
- `validateSystems()` (DEV) checks:
  - every kit spell resolves;
  - every tree node has effects;
  - every creature ability is mapped;
  - every drop resolves;
  - all 24 classes can equip a weapon.
- Headless sim tests (`tools/e2e/sim-*.mjs`, Node only, no browser):
  - each class kills a same-level enemy pack and a boss;
  - downed/revive works;
  - party scaling holds;
  - PvP rules are respected.
  Then a browser e2e per class for the release gate.

## 9. Contract requests (sent to Claude 1)

See the message of 2026-10-19. These are also listed in `types-v2-proposal.ts` once it is drafted. In short:
- Content kinds for the new defs, or an agreed prefix set.
- `fx:` entity ids, of kind `object`.
- `playerId` on player-scoped events.
- New replicated events: `ability:cast`, `player:downed`, `player:revived`, `party:wiped`, `pvp:kill`, `loot:granted`.
- ClientMsgs `loadout`, `action` (equip, learn, reset, use item, bind slot) and `duel`.
- Sim tick and snapshot rates.
- An `isArena` / `isSafe` world query.
- Save v2 `CharacterSave` shape.

## 10. Implementation map (as built, 2026-10-20)

| Area | Files |
|---|---|
| Handoff import | `docs/systems/tools/import-handoff.cjs` → `src/data/{items,enemies,classes}/hc/*.gen.ts` |
| Class display (creation) | `src/data/classes/hc/index.ts` (HC_CLASS_DISPLAY, defaultLook) |
| Kits & spells | `src/data/classes/hc/kits.ts`, `src/data/spells/hc/{kit-spells,school-spells,build}.ts` |
| Creatures | `src/data/enemies/hc/abilities.ts` (ability text → mechanics), `campaign.ts` (72 campaign bosses), `src/systems/rules/creatures.ts` |
| Shops | `src/data/items/hc/shops.ts`, `src/systems/sim/shop.ts` |
| Rules (pure) | `src/systems/rules/`: types, curves, stats, gear, tree, creatures, playerStats, paperdoll, spells, spellText, describeHc, character |
| Authority sim (Phaser-free) | `src/systems/sim/`: index (installSystemsAuthority), Sim, world, state, combat, actions, player, enemy, spawn, entities, loot, death, coop, items, shop |
| Client | `src/systems/client/{hero,character}.ts`, `src/systems/input/HeroInput.ts`, `src/systems/view/{CombatView,fx}.ts` |
| Screens | `src/ui/character/hc/`: Hotbar, HudExtras (buffs, boss bar), CharacterPanels, InventoryPanel, TreePanel, ShopPanel, tooltip |

**Tests**
- `node tools/e2e/sim/run.mjs validate`: content integrity (spells, kits, trees, creatures, drops, art bodies).
- `node tools/e2e/sim/run.mjs fight <level> [class]`: each class against a realm pack, a mini-boss and the realm boss.
- `node tools/e2e/sim/run.mjs fight campaign`: each class against its lair-2 boss, nemesis and Act III boss.
- `node tools/e2e/sim/run.mjs economy`: quest rewards, take-item, buy and sell.
- `node tools/e2e/sim/run.mjs inspect <creature> [level]`: prints a creature's resolved combat def.
- `node tools/e2e/hc-smoke.mjs --class a,b,…`: real-browser smoke against the no-HMR server.
- DEV handle: `window.__hc` (spawn, enemies, local, sprite, screenOf, counts). URL `?hc_class=<id>`.

**Balance anchors (headless, current)**
- Creature HP = `TIER_HP × hpShape × P(L) × (1 + 0.04(L−1)) × party`, with TIER_HP enemy 70 / mini 600 / boss 2200.
- Creature damage = `TIER_DMG × D(L)`, with TIER_DMG 9 / 12 / 12. Ability coefficients ×1 / ×1.2 / ×1.4 by tier. Boss basic attacks run at a ×1.6 interval.
- Adds that bosses and minis summon have 60% power and never split again.
- Creature heals scale from the healer.
