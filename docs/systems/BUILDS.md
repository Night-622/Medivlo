# Deeper builds: spec (Claude 3, lead)

The user asked for "more perks, complex builds (spells, armour, weapon, class compatibility), balanced, more spells,
upgrades". User decisions (via Claude 1, 2026-10-20):

1. **Deep scope.** Perks, spells, runes, affixes, uniques, mastery, sets, tomes and Runeforge upgrades.
2. **Random affixes on drops.**
3. **Mostly class identity, some crossover.** Each class plays differently, and a few chosen paths cross over.
4. **Power-fantasy balance.** Great builds may feel broken in PvE. The gate checks only that every class can finish
   its campaign, that no content is dead, and that nothing crashes.

Kept as they are: level bands and the XP curve (rules/curves.ts), the 3-branch tree with one shared point pool, the
Action / Passive language, Phaser-free rules and sim (they run on the realm server), and folder ownership.

**What is built now, and the checks that guard it: §11.** Sections 1–10 are the original plan.

---

## 1. How it fits together

| Layer | Today | After |
|---|---|---|
| Tree (rules/tree.ts generator) | 72 nodes per class, mostly +x% formula nodes | 72 nodes: **12 signature perks per class, 8 school perks per school, ~20 shared keystones**; minor nodes stay as connectors but each must pass the dead-content bar (§7) |
| Spells | 3 kit + 3 school + 1 ultimate per class | **6 kit spells per class** (3 starting + 3 learned on the Spells branch: +72 spells), school spells and ultimates as now, **runes** slotted into any spell |
| Gear | base stats by material / style, 1 gem socket on runed+, 2 / 4-piece sets, Attuned, 25 legendaries | **rolled rarity + 1–4 random affixes**, **1–3 sockets** by rarity, **~40 uniques** (the 25 legendaries reworked + 15 new), **weapon mastery**, **hybrid two-school sets**, **tomes** |
| Runeforge | reforge to level, set a gem, salvage | + **upgrade +1..+5**, **reroll one affix**, **imbue an element**, **move a unique effect**, **craft runes** |
| Gate | features, hitboxes, fight sims | + **`run.mjs builds`** (starter and typical builds beat every class's bosses; no dead content) |

Everything a source gives still compiles to a `Passive` (mods / procs / hooks / spellMods) through `compile()`. New
mechanics are new **Passive fields and hooks** read by the sim, never one-off code per item.

---

## 2. Data shapes

### 2.1 Passive extensions (src/systems/rules/types.ts, mine)

```ts
interface Passive {
  mods?: Modifier[]; procs?: Proc[]; hooks?: Hook[]; spellMods?: SpellMod[];
  /** NEW: share of one damage kind dealt as another (sum per `from` is capped at 100%) */
  convert?: { from: DamageKind | 'attack' | 'spell'; to: DamageKind; pct: number }[];
  /** NEW: an aura on you and allies within r (re-applied every 1 s as a 1.5 s buff: keystones.ts already does this) */
  aura?: { r: number; mods: Modifier[]; enemies?: boolean };
  /** NEW: spell-specific power, "+1 to Fireball": each level is +12% damage and +6% area on that spell */
  spellLevels?: { spell: string | '*'; levels: number }[];
}
```

New `StatKey`s:
- `statusDmg.<StatusId>` (e.g. "+20% burn damage"), `statusChance`;
- `projCount`, `area` (all spells), `castSpeed`, `dashCd`;
- `staminaCost`, `emberOnHit`, `staminaOnKill`;
- `minionDmg`, `minionHp`.

New `Trigger`s:
- `spellCrit`, `attackCrit` (crit already exists and is either one);
- `dashEnd`;
- `emberSpent` (per 50), `staminaSpent` (per 50);
- `statusApplied`;
- `summon`;
- `fullHp`.

New `Cond`s:
- `ember` with `pctAbove` / `pctBelow`, `stamina` with `pctBelow`;
- `moving` / `still`;
- `minions` with `min`;
- `weapon` with `type`, `school` with `id`.

Perks are tree nodes as now (`TreeNode.effects: Passive[]`). What changes is **what** the effects are (§3).

### 2.2 Spell and rune (rules/types.ts, mine)

```ts
interface HcSpell {
  // … as now
  /** NEW: rune slots unlocked on this spell by tree progress (0–2; ultimates 1) */
  runeSlots?: number;
}

interface RuneDef {
  id: string;                    // 'rn_fork'
  name: string;
  /** spells it can go in (by HcSpell.tags); empty = any */
  fits: HcSpell['tags'];
  mod: SpellMod;                 // extended below
  /** Runeforge recipe: gold + materials */
  craft: { gold: number; items: { item: string; qty: number }[] };
}

interface SpellMod {
  // … as now (dmg, cost, cd, area, dur, echo, twin, split, linger, burst)
  fork?: number;                 // projectiles split into N at first hit
  chain?: number;                // hits chain to N more foes (60% each)
  pierce?: boolean;
  haste?: number;                // −cast time / −cd share
  convert?: DamageKind;          // the spell deals this kind
  count?: number;                // + projectiles
  ward?: number;                 // a shield of this % max HP on cast
  lifesteal?: number;
}
```

**Rune catalogue (15 kinds, 27 ids; data/items/hc/build-items.ts):**
- **Projectile:** Volley (+2 projectiles, −20% each), Pierce, Split.
- **Area:** Reach (+40% area), Linger, Burst (a repeating spell lands at once, +50%).
- **Any spell:** Chain (2 more foes at 60%), Haste (−20% cd and cast time), Echo, Thrift (−25% cost), Power (+30% dmg,
  +30% cost), Ward (8% max-HP shield on cast), Leech (6%), Twin, Duration (+40%), and Convert, one per school
  (`rn_convert_<school>`, crafted with that school's Essence).

Rune instances are items (`base: 'rn_<id>'`) that drop and are crafted. Slotted runes live in the character save
(§2.5). **Slots:**
- 1 slot per kit / school spell once its tree path's second node is learned;
- a 2nd slot at its 3-rank node's rank 3;
- the ultimate gets 1 slot.

### 2.3 Affix (rules/affixes.ts NEW, mine; pools in src/data/items/hc/affixes.ts, Claude 5 fills)

```ts
interface AffixDef {
  id: string;                         // 'pre_burning', 'suf_of_the_owl'
  kind: 'prefix' | 'suffix';
  slots: ('weapon' | 'offhand' | 'head' | 'chest' | 'hands' | 'feet' | 'ring' | 'amulet')[];
  group: string;                      // one affix per group per item ('dmgFire', 'hp', …)
  weight: number;                     // pool weight (rarer = lower)
  minIlvl: number;
  /** value tiers by item level: tier t applies from ilvl tiers[t].ilvl; the roll is uniform in [min, max] */
  tiers: { ilvl: number; min: number; max: number }[];
  /** what one rolled value v gives */
  effect:
    | { mod: Modifier }                                    // value = v (pct / flat as the modifier says)
    | { spellLevels: string | '*' }                        // "+v to <spell>" (v integer 1–2)
    | { proc: Proc }                                       // coef scaled by v
    | { statusDmg: StatusId };
  /** class / school restriction (spell-specific affixes): only rolls on drops for that class */
  only?: { classId?: string; school?: SchoolId };
}
```

**Affixes per rarity (rolled per drop):**

| Rarity | Affixes | Sockets |
|---|---|---|
| common | 0 | 0 |
| fine | 1 | 0 |
| ember | 2 | 1 |
| runed | 3 | 1 |
| wrought | 3–4 | 2 |
| spark | 4 | 3 |

Uniques have fixed affixes plus their effect. At most 2 prefixes and 2 suffixes.

**Rarity is rolled per drop.** It no longer comes from the material or style, which keep their base stats and the
level gates. Weights at luck 0: common 50, fine 30, ember 13, runed 5, wrought 1.6, spark 0.4. `itemFind` and the
monster tier shift them: minis ×2 above fine, bosses ×5 above ember.

**Pools: ~90 affixes.**
- **Offence:** flat and % damage per kind, attack speed, cast speed, crit, crit damage, spell power, projectile count
  (rings / amulets, rare), area, status chance and status damage.
- **Defence:** HP, armour, resist per kind, block, healing taken, HP regen, damage taken below 50%.
- **Resource:** Ember, Ember regen, Ember on hit, stamina, dash cooldown.
- **Utility:** move speed, gold, item find, XP.
- **Spell-specific (`only`):** "+1 to <kit spell>" for each class's 6 kit spells, plus "+1 to all <school> spells".
- **Proc affixes (rare, wrought+):** "Casting has a 10% chance to cast <school spell>", "On kill: 20% chance of a
  fire nova".

**Values scale with item level.** Flat stats use `P(ilvl)` like the base stats. Percentages tier up at
ilvl 1 / 10 / 20 / 30 / 38 (e.g. % damage tiers 4–7 / 8–12 / 13–17 / 18–22 / 23–28 %).

### 2.4 Item instance: CONTRACT (src/core/hc.ts, Claude 1)

```ts
interface ItemInstance {
  uid: string; base: string; ilvl: number; qty: number;
  gem?: string;                                   // LEGACY: migrated to sockets[0]; keep reading it
  /** NEW (all optional, so old saves and stackables stay valid) */
  rarity?: Rarity;                                // rolled; absent = the base's rarity (old items)
  affixes?: { id: string; v: number }[];          // rolled values
  sockets?: (string | null)[];                    // gem ids; length = socket count
  upgrade?: number;                               // 0–5
  imbue?: SchoolId;                               // Runeforge imbue: weapon damage converts 50% to this kind
  uniqueFx?: string;                              // a unique / legendary effect id (moved by the Runeforge)
}
```

Unique items are bases of their own (`u_<id>`), whose stats and effect come from the unique table. `uniqueFx` is
what the Runeforge's **move** writes onto another item.

### 2.5 Character save: CONTRACT (CharacterSave, Claude 1)

```ts
interface CharacterSave {
  // … as now
  /** NEW: runes slotted per spell id → rune item uids (the rune items stay in `inventory`, flagged as slotted) */
  runes?: Record<string, string[]>;
  /** NEW: off-school spell taught by a tome (one at most) */
  tomeSpell?: string;
  /** NEW: a one-time free tree reset for characters from before the perk tree (true until used) */
  freeRespec?: boolean;
  /** NEW: version of the build system the tree was spent under (migration) */
  buildVersion?: number;
}
```

---

## 3. Perks

The generator stays (`buildTree(classId, branch)`), but it now draws node content from **perk tables** instead of
formulas.

| Table | Count | Where it sits | Data file (Claude 5 authors, I review) |
|---|---|---|---|
| Signature perks | 12 per class (288) | Spells branch paths (6) + Skills offence path (6) | src/data/skilltrees/hc/perks-<school>.ts (2 classes each) |
| School perks | 8 per school (96) | Skills defence / focus paths + bridge | same file |
| Shared keystones | ~20 | Upgrades branch tops / choice nodes, and each branch's ultimate choice | src/data/skilltrees/hc/keystones.ts |
| Connectors (minor) | the rest (~30 per class) | between perks | generator formulas, but each ≥ the dead-content bar |

**Kinds of perk** (every perk is one or more Passive fields; no per-perk code):
- **Conversion:** "Your attacks deal 50% of their damage as Rime" (`convert`).
- **Trigger:** "Critical hits with spells cast Ash Bolt (1 s)", "Dashing leaves a frost ring", "Kills refund 20%
  of the last spell's cooldown" (procs on the new triggers).
- **Resource interplay:** "Spells cost stamina instead of Ember below 30% Ember", "Spend 50 stamina: +1 Momentum",
  "HP-cost spells deal +30%" (hooks + `Cond`).
- **Aura / minion-lite:** "Allies near you +8% damage", "Your summons inherit 30% of your crit" (`aura`, `minion*`).
- **Trade-off:** "+40% spell damage, −25% max HP", "Attacks can't crit; +60% attack damage" (negative mods; the
  text shows both).

**Shared keystones (~20)** are the crossover. Any class can take them, each costs a top-tier slot, and each one
reshapes a build. Examples:
- **Blood Magic:** spells cost HP, +20% spell damage.
- **Iron Grip:** spell power adds to attack damage.
- **Arcane Edge:** attack hits restore Ember.
- **Glass Cannon:** +50% damage, +50% damage taken.
- **Untouchable:** dash cooldown −40%, damage taken +15%.
- **Conduit:** your auras also hit enemies.
- **Pack Leader:** summons +60%, you −20%.
- **Elementalist:** all conversions +25%.
- **Spellblade:** basic attacks cast your slot-1 spell every 4th hit at 40%.
- **Juggernaut Heart:** can't be stunned, −15% move speed.

Each class can take **at most 2** shared keystones. That keeps identity at the core and crossover a choice.

**Weapon mastery (rules/mastery.ts NEW):** each class × each weapon type it may wield has a small Passive, active
while wielding it. 24 classes × ~2.4 weapons = ~58 entries. Examples:
- Warden + mace: 15% stun chance on crit.
- Arcanist + wand: +1 projectile on Ash Bolt.
- Swordsman + sword: parry window +100 ms.

### Tree layout per branch (unchanged shape, new contents)

Root (free) → 3 paths of [perk → connector → connector → perk (3 ranks) → choice of 2 perks] → 2 bridges →
2 tops → 1 ultimate.

| Branch | Paths | Tops | Ultimate |
|---|---|---|---|
| Spells | each path a kit spell (6 kit spells: 3 paths × 2 spells) | the school spells, with their rune slots | the school ultimate |
| Skills | offence = signature perks, defence and focus = school perks | the school keystones (as now) | Avatar |
| Upgrades | utility connectors | shared keystones (pick ≤ 2 across the tree) | Hero of Morvane |

---

## 4. Spells (+72)

Each class gains 3 kit spells (`k(class, 3..5)` in kit-spells.ts), learned on the Spells branch path nodes. Design
rules per class: one that **extends the class mechanic**, one **utility / control**, one **payoff** that combos with
a signature perk.

Spell budgets stay those of the existing kit spells:
- cost 8–30 Ember;
- cd 2–20 s;
- coefficients in line with HOLLOW_CROWN.md §2.1;
- ultimates as now.

Claude 4 names them and writes their descriptions from my mechanical list. **Tomes** (`t_<spellId>`) teach one
off-school spell, from the school spells of other schools only (no class kit spells). They drop rare from bosses and
sell at Pell's from Act II. A second tome replaces the first.

---

## 5. Gear depth

- **Affixes** (§2.3).
- **Sockets:** gems as now (8 gems); a socket can also hold a **rune of power** (a rune with only a mod).
- **Uniques: 40.**
  - The 25 boss legendaries become uniques, each with a build-defining effect instead of the 6 generic ones.
  - 15 new uniques, mostly off-boss: world chests, Act III, crafted.
  - Each one has 2 fixed affixes plus one effect. Examples:
    - "Your fire spells leave burning ground."
    - "Dash casts your slot-2 spell."
    - "Each summon makes you 5% faster."
    - "Crits chain lightning to 2 foes."
    - "Below 50% HP your spells cost nothing."
- **Sets:**
  - 2 / 4-piece bonuses already work on any class; this stays.
  - Attuned stays (school match).
  - NEW **hybrid**: 2 pieces of school A + 2 of school B gives a hybrid bonus (12 curated pairs plus a generic
    fallback: both schools' 4-piece effects at 50%).

### 5.1 Loot tables (data/items/hc/lootTables.ts, mine; Claude 2 names them in placements)

Each unique, rune, tome and Essence gets a home through **named tables**, so no site needs its own code. A
placement names a table in its props:
- chest prop: `loot: 'tbl:rime-ruin'`;
- boss trigger prop: `loot: 'tbl:hask'`.

The sim rolls the table at that site's level (`props.level`, clamped 1–40; it falls back to the player's level).

```ts
interface LootTable {
  id: string;                          // 'tbl:rime-ruin'
  /** independent rolls; each picks one entry by weight */
  rolls: number;
  entries: LootEntry[];
  /** always dropped, on top of the rolls */
  always?: LootEntry[];
  /** keeps today's chest roll (gold + gear + potion) and adds this table on top (default true for chests) */
  base?: boolean;
}
type LootEntry = { weight: number } & (
  | { item: string; qty?: [number, number] }                 // a fixed base: 'rn_fork', 't_frost-lance', 'u_hask-crown'
  | { gear: { slot?: Slot; minRarity?: Rarity; forKit?: boolean } }  // a rolled affixed piece
  | { rune: 'any' | string[] } | { tome: 'any' | SchoolId }
  | { nothing: true });
```

Rules:
- Uniques drop once per character per table (tracked like chests). Repeats roll as wrought gear.
- `tbl:<boss id>` tables exist for all 25 bosses.
- Claude 2 asks me for new table ids. I add them, and validate.mjs checks that every placement's table id exists.

---

## 6. Runeforge upgrades (rules/runeforge.ts, sim/runeforge.ts, mine)

**Where:** Odo in Brindlecross, plus each of the 12 realm capitals. This is the QA new-player fix, approved by
Claude 1: every capital has two shops, defined in shops.ts.
- `shop:<school>-smith`: kit gear, buys all, Runeforge. Blade's smith is npc:dulcie-bellows, Iron's is
  npc:marit-blum, and the rest are npc:<school>-smith.
- `shop:<school>-trader`: potions, food, scrolls, buys all. NPC npc:<school>-trader.
- Claude 4 creates the NPCs. Claude 2 places them near the capital waystone (checks.ts smiths: ≤ 30 tiles).

| Action | Effect | Price |
|---|---|---|
| Upgrade +n (1–5) | +8% base stats and +6% affix values per level | `40 × P(ilvl) × n²` gold + n Iron Ingots |
| Reroll one affix | rerolls one chosen affix within its group's pool at the item's ilvl | `25 × P(ilvl) × (rerolls+1)` gold, rising per item |
| Imbue element | the weapon's damage converts 50% to a school kind | `60 × P(ilvl)` gold + an Essence of that school |
| Move unique effect | moves `uniqueFx` from one item to another of the same slot family; the source is destroyed | `120 × P(ilvl)` gold |
| Craft rune | from the rune's recipe | the recipe |
| (as now) reforge, set gem, salvage | salvage also returns rune dust from affixed items | as now |

---

## 7. Balance gate (power fantasy)

`node tools/e2e/sim/run.mjs builds` (quick mode, joins the pre-deploy suites):
- for every class, the **starter** build and a **typical** build beat that class's lair-2 boss (L8), nemesis (L12–14)
  and Act III form (L34) in the fight sim;
- **no crash** across all builds;
- in **full mode** (run before each content drop, and by me when tuning):
  - **dead content:** every perk, spell, rune, affix group and unique must move DPS, EHP or a utility measure by
    ≥ 5% in its best use (A/B on top of the typical build);
  - anything under the bar is listed, and the gate fails until it is fixed or cut;
- outliers are reported, not failed (power fantasy). A build only fails the gate if it makes a campaign
  **unfinishable** (loses a required boss).

XP and level bands are unchanged: `run.mjs xp-project` must still give the same act medians (it ignores gear, so it
holds).

### Audit 2026-10-21 (Claude 5)

`builds full` on the typical L14 build, at the start of the night and after the tuning and probe passes. Gate 145/145
throughout.

**Totals:** dead entries 343 → 127. Harm notes 51 → 77, but probe survival is informational for harm now, so only the
25 DPS harm notes count. In the signature, school and shared-keystone slots, dead entries went 210 → 31.

**How the probe changed** (tools/e2e/sim/builds-probe.ts, builds-dead.ts, builds-fight.ts):
- **Healing:** it is read from the hero's own health. Lifesteal and other silent heals were invisible before.
- **Positions:** the bag and the hitters are re-pinned every tick, so knockback can no longer carry them out of reach.
- **Incoming damage:** it is continuous in the multiplier, and hits are capped at 5% hp.
  - Extra hitters stay in the frontal arc, so front blocks count.
  - A replacement hitter waits a full interval.
- **Calibration:** a log bisection on the mean drain of all 5 seeds. If no multiplier lands in the window, it keeps the one closest to 60 s.
- **Dashing:** the bot dashes every 3 s.
- **Survival:** the share of the net drain cancelled, floored at 25% of gross damage taken.
- **Harm:** only counts beyond 1.5× the class's own seed noise.
- **Spell choice:** the bot heals first below 60% hp, skips heals above 90%, and keeps Ember for its cheapest heal below 80%.

| Class | Dead (start) | Dead (now) | Harm notes | DPS harm |
|---|---|---|---|---|
| warden | 6 | 2 | 0 | 0 |
| rimecaller | 13 | 9 | 1 | 1 |
| ranger | 13 | 6 | 3 | 2 |
| hedgewitch | 16 | 7 | 1 | 0 |
| reaver | 10 | 6 | 0 | 0 |
| arcanist | 11 | 4 | 2 | 2 |
| stormlancer | 8 | 3 | 2 | 0 |
| sparkwright | 16 | 11 | 0 | 0 |
| oathbound | 12 | 7 | 0 | 0 |
| cantor | 17 | 2 | 8 | 2 |
| shade | 22 | 3 | 6 | 3 |
| duskweaver | 24 | 7 | 1 | 0 |
| swordsman | 10 | 1 | 11 | 0 |
| samurai | 11 | 1 | 5 | 4 |
| knight | 8 | 2 | 3 | 1 |
| juggernaut | 14 | 3 | 4 | 2 |
| monk | 17 | 3 | 6 | 0 |
| brawler | 14 | 2 | 3 | 0 |
| huntsman | 12 | 7 | 4 | 4 |
| falconer | 19 | 13 | 2 | 2 |
| corsair | 13 | 3 | 11 | 1 |
| jester | 15 | 4 | 4 | 1 |
| bard | 23 | 15 | 0 | 0 |
| skald | 19 | 6 | 0 | 0 |
| **total** | **343** | **127** | **77** | **25** |

**Outliers and open items:**
- **Dead in the most classes** (generator positions): the +10% armour connector (12), school keystones 1 / 2 (10 / 6), school
  spell ranks 2–3 (8 / 4), the Ember connectors Focus / +0.6 regen / Ember Reserve (7 / 7 / 6), Spell Weaving (4) and
  Set Mastery (6).
- **Probe-blind** (judge by the fight sims): parry, stealth and freeze keystones, traps, ground heals at the aim point,
  crowd control on the boss bag, and ally buffs measured solo.
- **Oathbound:** heal throughput caps at about 60 HP/s, so survival sits on a cliff. It calibrates at that cap (×5.9, 36 s)
  and wins all of its campaign fights.
- **Most DPS harm notes** are "binding one more spell" in tempo kits (Samurai, Huntsman, Shade): a cast costs a swing.
- **Gauntlet after the changes** (`gauntlet ash 8 all 5 2`, `gauntlet storm 27 all 5 2`): Ash L8 had 0 deaths in all 24
  classes. Storm L27 had 4 in total (Monk 0/2, Falconer 1/0, Bard 0/1), within the earlier 0–2 per class.

---

## 8. Saves, replication, security (Claude 1's contracts; my rules)

- **Migration (Claude 1, on load):**
  - items without `rarity` keep their base rarity, `gem` → `sockets[0]`, no affixes;
  - trees spent under build version < 2 are refunded in full and `freeRespec = true` is set;
  - slotted runes start empty.
- **Loadout replication (Claude 1):** the loadout carries the new item fields and `runes` / `tomeSpell` as part of
  `CharacterSave`. Size is fine: ~40 items × ~120 bytes.
- **Sanitiser (mine, rules/validate.ts):** a remote loadout's affixes must exist, fit the slot, and roll inside their
  tier range for the item's ilvl. Upgrades ≤ 5, sockets ≤ the rarity's count, runes slotted only into learned spells
  with free slots, at most one `tomeSpell`, at most 2 shared keystones. Anything else is dropped (anti-mint: as today,
  a loadout cannot create items or raise values; the authority keeps its own copy and merges).

---

## 9. UI (src/ui/character, mine)

- **Perk tree:** node frames by kind (signature / school / keystone / connector), a perk detail card with trade-off
  text in red, a "2 / 2 shared keystones" counter, and the free-respec banner.
- **Spells panel:** rune slots under each spell (drag or click a rune from the pack), with the rune's effect in the
  spell tooltip.
- **Tooltips:** affix lines grouped prefix / suffix with tier marks, sockets row, upgrade "+3", imbue badge, unique
  effect in gold, and comparison deltas vs the worn item for every stat (as today, extended to affixes).
- **Runeforge:** tabs Upgrade, Reroll, Imbue, Transfer, Sockets (gems / runes), Craft (runes), Salvage.

---

## 10. Work split and order

| Phase | Work | Who | Depends on |
|---|---|---|---|
| A | build simulator `run.mjs builds` (quick gate + full dead-content report) on today's content | my helper (running) | — |
| 0 | this spec | me | — |
| 1 | contracts: ItemInstance fields (§2.4), CharacterSave fields (§2.5), migration, loadout replication | **Claude 1** | spec |
| 2 | affix engine (rules/affixes.ts: roll, compile, sanitise), rolled rarity, sockets in itemMods, loot rolls | me | 1 |
| 2b | affix pools (~90) with tiers | **Claude 5** | 2 shapes |
| 3 | Passive extensions in the sim (convert, aura, spellLevels, new triggers / conds / stats) | me | — |
| 3b | perk tables: 288 signature + 96 school + 20 keystones + 58 mastery entries | **Claude 5** (data), me (review + generator) | 3 |
| 4 | spells +72 (mechanics) and the rune engine + 16 runes | me (engine), Claude 5 (spell mechanics data to my budget table) | 3 |
| 5 | uniques (40 effects), hybrid sets, tomes | me + Claude 5 | 3 |
| 6 | Runeforge upgrades | me | 2 |
| 7 | UI (§9) | me | 2–6 |
| 8 | names and flavour for perks, spells, runes, uniques and affixes | **Claude 4** | lists fixed in 3b–5 |
| 9 | loot distribution: rune / tome / unique sources, Essences, Runeforge locations | **Claude 2** | 2, 4, 5 |
| 10 | balance pass on `builds full` + gate wired into pre-deploy | me | all |

**My helper agents (cap 3):** the build-simulator helper now. Later, one helper each for the sim Passive extensions'
tests and the UI shots, run one after another.

**Order of value for the user:** affixes + uniques first (loot excitement), then perks (choices), then spells +
runes, then the Runeforge, then polish. Each phase lands behind its own gates (features + hitboxes + builds), so the
game stays playable throughout.

---

## 11. As built (2026-10-21, Claude 5)

Sections 1–10 are the plan. This section is what is in the game tonight, and which check guards each part. Run every
check from the repo root. "Gate" means it fails the pre-deploy check; "report" means it writes a file under
tools/e2e/out/ for a person to read.

### 11.1 Affixes and rarity

- **238 affixes** (data/items/hc/affixes.ts): 197 prefixes and 41 suffixes. 156 of them are "+N to a spell" lines:
  each class's 6 kit spells and its school, which roll only for that class.
- **Rarity** (rules/affixTypes.ts):

| Rarity | Roll weight | Affix lines | Sockets |
|---|---|---|---|
| common | 50 | 0 | 0 |
| fine | 30 | 1 | 0 |
| ember | 13 | 2 | 1 |
| runed | 5 | 3 | 1 |
| wrought | 1.6 | 3–4 | 2 |
| spark | 0.4 | 4 | 3 |

  Item-find raises every tier above common. Minis double ember+, bosses ×5 runed+. At most 2 prefixes and 2
  suffixes, one per group. Affix values scale with item level (tiers at ilvl 1 / 10 / 20 / 30 / 38).
- **Drops** (sim/loot.ts):
  - about 1 in 10 gear rolls is a ring or amulet;
  - kill gear rolls at max(creature level, hero level − 2);
  - chest gear (loot-table gear included) rolls at max(chest level, hero level);
  - the newest unlocked material / style drops 70% of the time.
- **Guards:** `run.mjs rules-props` (gate, 356 checks: every affix's tiers, slots, budgets and text);
  `qa-builds-text.mjs` (gate, every affix line as the player sees it).

### 11.2 Perks, keystones, mastery

- **Signature perks:** 12 per class (288). **School perks:** 8 per school (96). Both are in
  data/skilltrees/hc/perks-<school>.ts. 3-rank perks are front-loaded (rank weights 1.5 / 2.25 / 3).
- **Shared keystones:** 20, in data/skilltrees/hc/keystones.ts. Each class is offered 3 of them (KEYSTONE_OFFERS)
  and can hold at most 2.
  - Glass Cannon, Conduit and Chain Reaction are the strongest wherever offered.
  - The jester is offered Chain Reaction instead of Hoarder, so it has a real second choice.
- **School keystones:** 2 per school (rules/tree.ts). Each carries one plain rider so that none is dead. Tonight:
  - Blood Pact: +10% damage and a 30% power blood nova on kill;
  - Pressure Points: +10% attack speed and +20% critical damage.
- **Weapon mastery:** 49 entries (data/skilltrees/hc/mastery.ts), active while wielding that weapon.
- **Text:** every timing reads "for N s" for a duration and "once every N s" for a cooldown. Claude 4's
  `tools/narrative/text-mech-audit.ts` checks text against mechanics (clean).
- **Guards:** `run.mjs rules-props` (gate); `run.mjs builds` (gate, 145: starter and typical builds beat every
  campaign boss); `run.mjs builds full` (report: the dead-content list, §7); `run.mjs fresh-pass` (report: what a new
  player can pick at L1 / 5 / 10, and whether each pick matters).

### 11.3 Spells, runes, tomes

- **72 new kit spells** (data/spells/hc/kit-spells-new.ts), 3 per class, each learned on its Spells-branch path.
  Budgets: cost 8–30, cd 2–20 s, coefficient ≤ 3.2 (checked by rules-props).
- **27 runes** (data/items/hc/build-items.ts, Claude 3), slotted into spells.
- **24 tomes:** each teaches one off-school school spell (never an ultimate), one at a time.
  - Meteor, Blizzard, Blade Dance and Dragon Kick are the strongest picks.
  - Flame Wall, Ice Lance and Perfect Parry were lifted tonight as real alternatives.
  - Iron Skin stays defensive by design.
- **Guards:** `run.mjs features` (gate, 759: every spell casts); `run.mjs hitboxes` (gate, 247: every shape hits what it
  shows); `run.mjs rules-props spells` (gate).

### 11.4 Uniques and hybrid sets

- **40 uniques** (data/items/hc/uniques.ts): 25 boss legendaries (lg_) and 15 others (u_). Each has 2 fixed
  affixes plus its own effect. Built with `uniqueInstance(id, ilvl)`.
  - An armour unique counts as its base piece for set bonuses (rules/gear.ts).
  - Every unique gives a real gain to at least one class at L40.
- **12 curated hybrid sets** (data/items/hc/hybrid-sets.ts): 2 pieces of one school + 2 of a neighbouring school
  replace the generic half-and-half bonus.
  - The ring: Scald (ash+rime), Hailstorm (rime+storm), Lightning Rod, Iron Body, Flurry, Dirty Fencing
    (blade+guile), Shadowplay, Night Stalker, Wildwood, Pastoral, Hymnal, Sunfire.
  - Names and flavour come from Claude 4's overlay.
  - Every hybrid is viable for at least 2 classes.
- **Guards:** `run.mjs rules-props uniques` and `rules-props hybrids` (gate); `run.mjs build-diversity` (report, see
  11.8).

### 11.5 Runeforge and respec

- **Where:** Odo in Brindlecross, and every realm capital's smith.
- **Tabs:** Reforge, Sockets, Upgrade, Reroll, Imbue, Transfer, Craft, Salvage (ui/character/hc/ForgeTabs.ts).
- **Costs** (rules/runeforge.ts, s = P(level)^0.6):

| Action | Cost |
|---|---|
| upgrade to +n (max +5) | 40·s·n² gold + n ingots |
| reroll an affix | 25·s·(1 + rarity / 2) |
| imbue | 60·s + an Essence |
| transfer | 120·s |
| socket | max(10, 20·s) |

- **Salvage:** gives ingots, plus rune dust per affix.
- **Respec:** costs 10 × level per branch. A save migrated from the old tree gets one free respec.
- **Gold:** with the Runeforge in use, it takes about 95% of all gold a player spends, so gold never piles up
  unused. Without it, gold idles at about 11,000 by L20.
- **Guards:** `run.mjs economy` (gate: shop, quest rewards, chests, Runeforge actions); `run.mjs gear-curve`
  (report, 11.6).

### 11.6 Loot and gear curve

`node tools/e2e/sim/run.mjs gear-curve` (report → tools/e2e/out/gear-curve.md, 5 s; `RF=0` → gear-curve-noforge.md)
plays a typical player through each class campaign:
- **Route:** Claude 2's walk-export order.
- **Optional sites:** the hero's own realm ruin and cave, and each Morvane region's ruin and cave.
- **Rolls:** every roll is the game's own (rollKillLoot, openChest, questReward, shopStock, Runeforge costs).

Tonight:
- drops arrive within about 0.5 levels of the hero all game (Act II gap 4.3 → 0.3);
- every run ends with its ring and amulet slots filled;
- kills are the top source of real upgrades, ahead of the smith.

A real upgrade is +3% for a weapon or +1% for an armour piece or trinket. Upgrades come every few levels, at the
5-level material / style tiers. With the Runeforge, longer gaps remain mid-campaign, because upgraded favourites
outlast fresh drops. Claude 3 accepted that as power fantasy.

### 11.7 XP pacing

`node tools/e2e/sim/run.mjs xp-pacing` (report, 4 s) runs the same walk solo and as a duo. It compares each quest's
start level with that quest's zone band.
- **Duo rule:** every hero near a kill gets the full XP, and packs and lair waves are 35% bigger per extra player.
- **Quest XP:** scaled by rules/curves.ts questXpMult against Claude 2's QUEST_BANDS.

Tonight, solo:
- act ends at L14.2 / 29.8 / 40;
- 3 of 1,177 quest starts are under-levelled and 6 over-levelled.

A duo runs about half a level ahead. Open item: the Sentinel bosses still keep a fixed level (Claude 3), so the storm
classes, juggernaut and knight end Act II at L31.7–32.6.

`xp-pacing attribute` → tools/e2e/out/xp-attribution.md splits Act II XP by source (zones, lairs, optional sites,
objectives, quests). `run.mjs hero-levels` → tools/playthrough/out/hero-levels.json is the hero's level at each quest
start. Claude 2 builds bands from it, so regenerate it only together with Claude 2 and run
`node tools/playthrough/suite.mjs --full` (bands-concordia) before it lands.

### 11.8 Bosses, co-op, PvP, build diversity

- **`run.mjs boss-check gate`** (gate, 13 s): every class's lair-2, nemesis and Act III boss, at the gear a typical
  player actually wears.
  - It checks: every fight won, 0 deaths, every win ≤ 300 s (or a documented allowance; none today), no crash.
  - Tonight 10/10: median time to kill 88–110 s.
- **`run.mjs coop-balance gate`** (gate, 14 s): parties of 2–4 through the real party scaling and revive rules.
  - Party scaling (rules/curves.ts): boss HP +50% per extra player, creature HP +40%, pack size +35%.
  - Revives: hold F for 3 s; a hit taken pauses the channel instead of resetting it.
  - Threat (sim/enemy.ts): ×2 within 120 px, and tanks get ×1.5 (threatPower).
  - It checks: every normal party fight won, median boss speed-up ≥ ×1.2 per party size, revives land under heavy
    damage, no crash.
  - Tonight 11/11: bosses ×1.46 / 1.50 / 1.86 faster than solo for 2 / 3 / 4 players.
  - Companion reports: `coop-ab` (bot vs game A/B), `coop-trace` (positions over time).
- **`run.mjs pvp-duels`** (report): 24×24 duels at L20 / L40 under the real duel rules.
  - Tonight: median time to kill 7–9 s; 58 one-shots at L40; stun-locks up to 4.9 s; healers lead.
  - The PvP rules are Claude 3's open item.
- **`run.mjs build-diversity`** (report, 27 s): at L40, how many choices on each axis stay within 15% of a class's
  best build (keystone pairings, armour set, tome).
  - Tonight 6–48 viable combinations per class.
  - No school keystone, unique or hybrid that nobody would pick.
  - Open: endgame bosses barely threaten a typical player, so defensive choices rarely pay off. That's the user's
    call (power fantasy).
