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

**Rune catalogue (16):**
- **Projectile:** Fork, Chain, Pierce, Split.
- **Area:** Wider area, Linger, Burst.
- **Any spell:** Haste, Echo, Convert (one rune per school, so 12 variants under one id pattern `rn_convert_<school>`),
  Efficiency (−cost), Power (+dmg, +cost), Ward, Leech, Twin, Duration.

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
