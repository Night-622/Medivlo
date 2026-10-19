# MEDIVAL — Systems Design (combat, progression, builds)

Owner: **Claude 3** (`medival-61`). Status: **Phase 0 draft v1**, for agreement with C1, C2 and C4.
Contracts: [`types-proposal.ts`](types-proposal.ts) is the paste-ready version of §9 for `src/core/types.ts` and typechecks under `strict`.
Lore source: Claude 4 (`docs/lore/`). Every class, school, family, legendary and material name below has been agreed with C4.

All numbers are **tuning knobs**. They will live in `src/systems/balance.ts` so they can be tuned without touching logic.

---

## 0. Design goals

1. **Readable, fair real-time combat.** Every enemy attack is telegraphed (wind-up ≥ 250 ms, ≥ 400 ms for heavies). Dodges have i-frames. Deaths should feel like the player's mistake.
2. **Builds come from combinations, not bigger numbers.** Class × subclass × traits × skill tree × spells/glyphs × gear uniques. Every layer has a choice with a cost.
3. **Data-driven.** Classes, traits, items, spells, trees and enemies are typed data files. Bespoke behaviour goes through named **hooks** (`EffectDef.kind = 'hook'`) implemented once in `src/systems/effects/hooks.ts`.
4. **The lore shows through the systems.** Mana is **Ember**, drawn from the leys. Overdrawing gives **Cinderlung**. Blood magic is **Bloodcraft**, the first step toward forbidden Mirecraft. Crafting is **Runecraft**. Every player carries the **Ashmark**.

---

## 1. Stat model

### 1.1 Primary attributes (5)

| Id | Name | Feeds | Dialogue checks (for C4) |
|---|---|---|---|
| `might` | Might | heavy-weapon scaling, equip load, poise | intimidate, force, lift |
| `finesse` | Finesse | light/ranged weapon scaling, crit, attack speed, stamina | sleight, lockpick, acrobatics |
| `vigor` | Vigor | max HP, stamina, status resist | endure, drink, survive |
| `intellect` | Intellect | Ash/Rime/Storm/Umbral scaling, max Ember, cast speed | lore, arcana, deduce |
| `will` | Will | Radiance/Verdant scaling, Ember regen, status resist | persuade, faith, resist fear |

- Every class starts with attributes **summing to 55** (see §3), with a minimum of 7 in each.
- Each level-up gives **+2 attribute points** and **+1 skill point**.
- **Soft cap 40:** points above 40 count half for scaling. This stops one-stat builds from scaling forever.
- Dialogue checks compare a stat against a DC (10 easy / 15 / 20 / 25 / 30 heroic). Traits can add flat bonuses to specific check kinds.

### 1.2 Derived stats

`L` is character level and attributes are their current totals.

| Stat | Formula | Lv1 typical |
|---|---|---|
| Max HP | `60 + 5·VIG + 10·(L−1)` | 110–135 |
| Max Stamina | `80 + 2·VIG + 1·FIN` | ~110 |
| Stamina regen | 30/s, after a 600 ms delay since the last spend (50% while blocking) | |
| Max Ember (mana) | `30 + 4·INT + 2·WIL` | 80 (Arcanist ~122) |
| Ember regen | `1 + 0.08·WIL` per s, ×2 out of combat | ~1.8/s |
| Crit chance | `5% + 0.3%·max(0, FIN−10)` | 5–7% |
| Crit multiplier | `×1.5` base | |
| Attack speed | `+0.5% per FIN above 10` | |
| Cast speed | `+0.5% per INT above 10` | |
| Status resist | `+0.5% per VIG and per WIL above 10` | |
| Poise | `20 + Σ armour poise + 0.5·MIG` | |
| Equip-load capacity | `30 + 1.5·MIG + 0.5·VIG` | |
| Move speed | 150 px/s (≈4.7 tiles/s); sprint ×1.45 drains 18 stamina/s | |
| Ability slots | 4, rising to 5 at L10 and 6 at L25 | |

**Equip load** (worn weight ÷ capacity) sets the roll type:

| Load | Roll | Distance | i-frames | Stamina |
|---|---|---|---|---|
| < 30% | fast | 110 px | 280 ms | 18 |
| < 70% | normal | 90 px | 220 ms | 22 |
| < 100% | heavy | 70 px | 150 ms | 32 |
| ≥ 100% | none | none | none | walk only |

### 1.3 Level curve

- **Level cap 40.** Danger-tier level bands, agreed with C2: T1 1–6, T2 6–12, T3 12–20, T4 20–30, T5 30–40.
- XP to the next level: `xpToNext(L) = round(80·L^1.7 + 120)`. That gives 200 at L1, ~4.1k at L10, ~13.2k at L20 and ~40.6k at L39, about 600k in total.
- Skill points: 39 from levels plus ~8 bonus points from quests, codex milestones and tomes, about 47 in all. Maxing the class tree and the subclass tree together would need ~61, so a character can never take everything.

### 1.4 XP sources (target share of a normal playthrough)

| Source | Amount | Share |
|---|---|---|
| Quests | quest XP tier: `minor` = 0.6·xpToNext, `standard` = 1.2·, `major` = 2.0· (at the player's level; tuned by the e2e pass), where Lq is the quest's recommended level. **C4 tags quests with a tier, not raw numbers.** | ~45% |
| Kills | `xpToNext(Lenemy)/20 × rankMult × diffMult`. rankMult: minion .4, normal 1, elite 3, champion 6, boss 25. diffMult by enemy level minus player level: ≤−6 → 0.1, −5…−3 → 0.5, −2…+2 → 1, ≥+3 → 1.25 | ~40% |
| Discovery | new region 0.15·, landmark 0.05·, codex entry 0.02· (× xpToNext of the player's level) | ~10% |
| Misc | first craft of a recipe, spell rank-ups, cleansing Hollowed | ~5% |

---

## 2. Combat

### 2.1 Controls (proposal; C1 owns the rebindable input map)

| Input | Action |
|---|---|
| WASD | move (8-way, analogue-ready) |
| Mouse | aim / facing |
| LMB tap / hold | light combo / charged heavy (bows: hold to draw, release to loose) |
| RMB | block and parry (shield), aim (bow), or off-hand action (tome or talisman) |
| Space | dodge-roll in the move direction (aim direction if standing still) |
| Shift | sprint |
| 1–6 | ability slots |
| Q / E | consumable quickslots |
| R | **Hearth Draught** (healing flask; lore name pending) |
| X | swap weapon loadout (2 loadouts; 400 ms) |
| F | interact; **Ashmark** when it is prompted |
| Tab / K / B / C | inventory / skill tree / spellbook / character |

### 2.2 Attack anatomy

Every attack, from player or enemy, has the phases **wind-up → active → recovery**. Hit detection runs only during *active*.

- **Melee arcs:** a sector test (origin, facing, reach, arcDeg) against each target's circle collider, once per target per swing. Light combo: 3 hits at ×1.0 / ×1.1 / ×1.4. The third hit has +50% poise damage, and swords thrust on it (pierce).
- **Heavy:** hold 300–900 ms for ×1.6–×2.4 damage and ×2 poise damage. Hyper-armour is on during the final 200 ms of the charge.
- **Projectiles:** custom circle bodies moved per frame. World collision uses C2's `raycast(…, SOLID|BLOCK_PROJECTILE)` and entities use overlap tests. Projectiles support pierce, count/spread and homing. Enemy projectiles can be blocked by shields and dodged through.
- **Block:** reduces damage by the shield's `blockPhysical`% plus elemental `blockResist`. It costs stamina equal to `blocked × (1 − stability/100)`. At 0 stamina the guard breaks and the player is **staggered for 1 s**. Blocking only works in a 120° front arc.
- **Parry:** block pressed ≤ 160 ms before a hit (the `parryWindow` stat). It costs nothing, staggers the attacker and opens a **riposte**: the next hit within 1.5 s is a guaranteed crit at ×1.3. Unblockable attacks (red telegraph) can't be parried.
- **Dodge:** see §1.2. Hits during i-frames are ignored. The player can roll-cancel the recovery of light attacks but not of heavies.
- **Cooldowns:** each ability has its own cooldown, plus a 300 ms global cooldown between abilities. Cooldown reduction is capped at 40%.
- **Game feel:** 50 ms hit-stop on heavies, crits and parries; 2 px camera shake on heavies; floating damage numbers coloured by damage type; white flash on hit.
- **No friendly fire** for player abilities. Enemy area attacks don't hurt other enemies, except where a hook says so (e.g. Mireling bursts).

### 2.3 Damage formula

Run once per hit per damage type, then sum:

```
1  base      = roll(min,max) of the weapon or spell damage line
               (spells: × P(casterLevel); weapons already carry itemLevel in their stats)
               powers with weaponDamagePct use the weapon roll × pct
2  scaled    = base × (1 + Σ_attr grade(attr) × eff(attr))
               eff(a) = 0.03·min(a−10, 30) + 0.015·max(0, a−40)     (negative below 10 is clamped to 0)
               grade  S 1.4 | A 1.15 | B 0.9 | C 0.65 | D 0.4 | E 0.2
3  increased = scaled × (1 + Σ increased%)        additive pool: damage.<type>, meleeDamage/spellDamage, school.<x>, damageDealt
4  more      = increased × Π(1 + more_i)          each 'more' source multiplies separately (keystones, uniques, backstab)
5  crit      = × critMultiplier on a successful crit roll (crit chance includes weapon/spell bonuses)
6  mitigate  physical: × (1 − armour / (armour + 40 + 12·attackerLevel)), capped at 80%
             every type: × (1 − resist[type]); resist is capped at 75% (85% with uniques) and may go down to −100%
7  taken     = × (1 + Σ damageTaken) × statusMultipliers (Shocked +20%, Exposed +30%, Vulnerable +25%)
8  final     = max(1, round(result))
```

**Balance curves**, in `balance.ts`:
- `P(L) = 1.075^(L−1)` is the power curve, about ×16.8 at L40. Enemy HP and spell base damage use it.
- `D(L) = 1.05^(L−1)` is the enemy damage curve, about ×6.7 at L40. Player HP grows ~×5.7, and armour and resistance cover the rest.
- `goldCurve(L) = 1.06^(L−1)`.

**Backstab:** a hit from the target's rear 120° arc gets ×1.5 *more* and +25% crit chance. Only melee and Shade powers can backstab, and bosses are immune.

### 2.4 Damage types and resistances

| Group | Types | Notes |
|---|---|---|
| Physical | `slash`, `pierce`, `blunt` | reduced by armour, then by per-type resist (e.g. Restless: pierce +50%, blunt −30%) |
| Elemental | `fire`, `frost`, `lightning` | Ash, Rime and Storm |
| Divine/occult | `radiant`, `shadow` | Radiance (Lumen) and Umbral (Veil). Mirecraft enemies deal `shadow`. |
| Toxic | `poison` | Verdant, coatings and beasts. The Restless, the Wrought and the Unwrought are immune. |

**Hollowed** (variant): −25% fire and radiant resist, +25% shadow, immune to poison. The Ashmark and lumen-silver tempers deal ×1.5 *more* to them.

### 2.5 Status effects

**Buildup statuses** work like Souls: each hit adds meter points. The meter size is `100 × (1 + target statusResist[s])` and it decays 10%/s after 2 s without buildup. When the meter fills, the status triggers and the meter resets. Bosses' meters grow ×1.5 after every trigger.

| Status | On trigger | Sources |
|---|---|---|
| **Bleed** | burst of 15% of the target's max HP (bosses 5%, players 10%) as untyped physical, ignoring armour | axes, daggers, Bloodcraft, Reaver |
| **Burn** | fire DoT of 25% of the triggering hit's fire damage per second for 4 s; refreshes rather than stacks (uniques can stack it) | Ash, cinderglass |
| **Frozen** | 1.5 s hard freeze; the next hit shatters it for ×1.5. Bosses are slowed 50% for 2 s instead. | Rime |
| **Shock** | 6 s Shocked: +20% damage taken, and lightning hits chain once (160 px) | Storm |
| **Poison** | adds 1 stack (max 10). Each stack deals `2 × P(L)` poison per second for 6 s and cuts healing received by 3%. The meter refills at 50%. | Verdant, oils, wolves |

**Direct statuses** come from abilities with a duration:

| Status | Effect |
|---|---|
| Chill | −10% move and attack speed per stack, max 5 stacks |
| Stagger / Exposed | poise broken: 1.2 s stun, then 2 s Exposed (+30% damage taken) |
| Weaken | −25% damage dealt |
| Vulnerable | +25% damage taken |
| Root | can't move, can still act |
| Slow | reduced move speed |
| Silence | no spells |
| Blind | 50% of attacks miss |
| Fear | flees |
| Haste | +15% move and attack speed |
| Regen | heal over time |
| Ward | absorb shield |
| Stealth | unseen |
| Cinderlung | see §6.4 |

**Poise:** a hit's poise damage is subtracted from the target's poise. Poise regenerates fully 2.5 s after the last poise hit. At 0 poise the target is **staggered**. Player heavies and Warden powers are the main poise breakers.

**Crits** roll per hit, not per damage line. Spells and DoT ticks can't crit unless an effect says they can (e.g. the Deadeye keystone).

### 2.6 Healing, death and rest

- **Hearth Draught:** a refillable flask with 3 charges, upgradable to 6. Each charge heals 45% of max HP over 1.2 s and slows the player to 50% while drinking. It refills at **rest points** (C2 places waystones and campfires).
- **Resting** refills draughts and HP. It also respawns open-world enemies, though C2's zone timers decide what actually respawns.
- **Death:** the player respawns at the last rest point. An **Echo** is left at the death spot holding 50% of carried gold, and touching it recovers the gold. A second death before recovery loses that gold. No XP is lost, and items have **no durability**.

---

## 3. Classes

There are 6 classes. **Phase 1 ships Warden, Ranger and Arcanist.** Every class can equip anything, but weapons outside its proficiencies deal −30% damage and armour outside them costs +30% equip weight. Traits and nodes can grant extra proficiencies.

Every class also gets the universal ability **Ashmark** (`spell:ashmark`), the lore mark on the player's hand. It is an F-prompted purge: it deals fire damage to Hollowed and Unwrought (×1.5 *more* to Hollowed), cleanses Mire-taint objects for quest interactions, and **cleanses bosses flagged `cleansable`** (e.g. the White Stag at ≤15% HP) instead of killing them. Its rank (1–5) comes from story flag `ashmark.rank`, set by C4, rather than from skill points.

| Class | Fantasy (lore origin) | Attributes M/F/V/I/W | Signature resource | Proficiencies | Starting kit | Starting ability |
|---|---|---|---|---|---|---|
| **Warden** (P1) | shield-sworn of the Marches; holds the line | 14/10/14/8/9 | **Resolve** 0–100: +10 per block, +30 per parry, +5 when hit; each point gives 0.2% damage reduction; Warden powers can spend it | swords, maces, spears, shields; light, medium, heavy | `item:iron-arming-sword`, `item:oak-kite-shield`, `item:padded-gambeson`, `item:leather-boots` | `spell:shield-bash`: 25 stamina, 6 s cooldown, 40 px lunge, 80% weapon damage as blunt, 60 poise damage, interrupts casts |
| **Ranger** (P1) | Thornwise-taught hunter | 9/16/11/9/10 | **Focus** 0–5 stacks: built by full draws while standing still; +6% crit per stack; a dodge drops 2 stacks | bows, daggers, spears, swords; light, medium | `item:yew-shortbow` + `item:hunting-arrows` (quiver), loadout 2 `item:hunting-knife`, `item:leather-jerkin` | `spell:pinning-shot`: 20 stamina, 8 s cooldown, 140% weapon damage, roots for 2 s (bosses slowed 40%) |
| **Arcanist** (P1) | a ley-scholar from a hedge-school (needs a Wick-licence to be legal) | 7/10/9/17/12 | **Attunement** 0–3: casting a school's spell adds a stack. Casting a different school consumes the stacks for +15% damage each and a cross-school **combo** (e.g. Ash→Rime gives *Thermal Shock*, a burst plus Exposed) | staves, wands, daggers, tomes; light | `item:ashwood-staff`, `item:apprentice-robes`, `item:soft-boots`; knows Ash Bolt | `spell:ash-bolt`: 12 Ember, 0.8 s cooldown, 250 ms cast, 420 px/s, 18–24 fire, INT A scaling, 35 Burn buildup |
| **Reaver** (P2) | Hrothi wolf-sworn who practise **Bloodcraft** (Church-hated; the Drowned Choir recruits them) | 16/9/15/7/8 | **Fury** 0–100: gained from dealing and taking damage, decays fast. At Fury >50 gets +attack speed. Bloodcraft powers cost HP, not stamina | greataxes, axes, greatswords, warhammers; medium, heavy | `item:bearded-greataxe`, `item:wolfhide-coat` | `spell:blood-rend` |
| **Shade** (P2) | the Quiet Hand of Haldren, or Veil-touched | 9/17/10/11/8 | **Venom** coatings + Stealth: stealth out of combat or after Shadowstep. The first hit from stealth is a guaranteed crit at ×2 *more* | daggers, swords, crossbows; light | `item:quiet-hand-daggers`, `item:dark-leathers` | `spell:shadowstep` |
| **Oathbound** (P2) | Lightsworn of the Lanternate Church | 12/8/12/8/15 | **Devotion** 0–100: gained by hitting and healing; at 100 the next prayer is empowered (×1.5 and no cooldown) | maces, warhammers, swords, shields, talismans; medium, heavy | `item:lantern-mace`, `item:pilgrim-talisman`, `item:chain-hauberk` | `spell:lantern-smite` |

### 3.1 Subclasses and multiclassing

- **Subclass at level 15** (Phase 2). Each class has two. Picking one unlocks a 12-node subclass tree (§5) and one signature passive.

  | Class | Subclass A | Subclass B |
  |---|---|---|
  | Warden | **Bulwark**: taunt, tower shields, damage return | **Vanguard**: charges, war-banner auras |
  | Ranger | **Deadeye**: crits, long shots, DoTs can crit | **Beastwarden**: Kethra-blessed hawk or wolf companion |
  | Arcanist | **Elementalist**: three-school combos, Attunement up to 5 | **Spellblade**: melee hits cut spell cooldowns |
  | Reaver | **Bloodletter**: Bleed, leech, HP-cost scaling | **Juggernaut**: poise, unstoppable heavies |
  | Shade | **Assassin**: stealth burst, executes | **Hexblade**: Umbral curses on dagger hits |
  | Oathbound | **Lightbringer**: heals, wards, auras | **Inquisitor** (Order of the Wick): Radiance damage, anti-Mire, anti-mage |

- **Second Oath at level 25:** the player picks one other class's main tree. Its nodes cost **+1 point**, it is limited to **tiers 1–3**, and its keystones are off-limits. This allows hybrids such as Warden/Arcanist ("Emberwarden", which also fits the lore) without letting a hybrid out-specialise a pure class.
- **Respec:** see §5.3.

---

## 4. Traits

Two kinds:
- **Creation traits:** pick **2 of 20**. Each has a real downside.
- **Earned traits:** granted by deeds and counters, with no limit. Most are small, and some are build-defining.

A `dialogueTag` is checked by C4's dialogue. **Phase 1 ships the first 6.**

| # | Id | Boon | Drawback | Tag |
|---|---|---|---|---|
| 1 | `trait:ironhide` | +15% armour, +10 poise | −8% move speed | |
| 2 | `trait:quickfoot` | +10% move speed, −20% dodge cost | −10% max HP | |
| 3 | `trait:reckless` | +20% damage dealt | +20% damage taken | |
| 4 | `trait:scholar` | +15% max Ember, +10% XP from codex/discovery, +3 to INT checks | −10% melee damage | scholar |
| 5 | `trait:silver-tongue` | −15% shop prices, +3 to persuade checks | −1 Might | silver-tongue |
| 6 | `trait:devout` | +20% Radiance damage and healing, +3 to faith checks | Umbral and Bloodcraft cost +50% | devout |
| 7 | `trait:hardy` | +25% status resist, +10% max HP | −15% max Ember | |
| 8 | `trait:keen-eye` | +5% crit chance, see enemy weaknesses on hover | −10% max stamina | |
| 9 | `trait:brute` | +2 Might, +15% poise damage, +3 to intimidate | −2 Intellect, worse prices with scholars | brute |
| 10 | `trait:hollow-touched` | +20% shadow damage, heal 3% HP on kill | Lanternate NPCs distrust you, −15% healing received | hollow-touched |
| 11 | `trait:noble-born` | +200 starting gold, Fine (uncommon) starting gear | −10% XP from kills ("soft hands") | noble-born |
| 12 | `trait:outlander` | +10% resist to all elements, +1 to two attributes of choice | −10% prices penalty in Haldish towns | outlander |
| 13 | `trait:wick-licensed` | +10% spell damage, Church guards ignore your casting | Bloodcraft and Umbral spells are *illegal*: casting them near the Wick sets a hostile flag | wick-licensed |
| 14 | `trait:night-eyed` | +15% damage and stealth at night (C2's `timeOfDay`) | −10% damage by day | |
| 15 | `trait:ambidextrous` | dual-wield 1H weapons in the off-hand (off-hand hits at 60%) | shields' block −30% | |
| 16 | `trait:stubborn` | +30% poise, immune to knockback | −25% dodge distance | |
| 17 | `trait:ley-sensitive` | +15% elemental damage, +20% Ember regen | +15% elemental damage taken | |
| 18 | `trait:gambler` | +40% crit multiplier | −3% crit chance | |
| 19 | `trait:death-cheater` | once every 5 min, a lethal hit leaves you at 1 HP | Hearth Draught heals −15% | |
| 20 | `trait:beastbane` | +25% damage vs beasts and cinderdrakes | −10% damage vs folk | |

**Ancestry** (proposal for C1's character creation; source `'ancestry'`): each people gives +1/+1 to two attributes and one minor perk.

| People | Bonus |
|---|---|
| Haldish | +1 MIG, +1 VIG; +5% XP |
| Solenni | +1 INT, +1 WIL; −10% prices |
| Hrothi | +1 MIG, +1 VIG; +15% frost resist |
| Aelthi | +1 FIN, +1 INT; +10% bow damage |
| Orrun | +1 MIG, +1 VIG; +10% poise, +20% equip load |
| Qasiri | +1 FIN, +1 WIL; +15% fire resist |

**Earned traits** (examples; counters live in GameState `counters`):

| Id | Requirement | Effect |
|---|---|---|
| `trait:duelist` | 50 parries | parry window +40 ms |
| `trait:hollowbane` | cleanse or kill 100 Hollowed | +10% damage vs Hollowed |
| `trait:fire-kissed` | trigger Burn on yourself 25 times | +10% fire resist |
| `trait:wayfarer` | discover 20 landmarks | +8% move speed out of combat |
| `trait:lorekeeper` | 25 codex entries | +5% XP |
| `trait:wolf-friend` | story flag (C4) | wolves won't aggro at T1–T2 |
| `trait:oathbreaker` | story flag (C4) | +10% damage, −20% healing received (dialogue tag `oathbreaker`) |
| `trait:cinder-scarred` | overdraw 50 times | Cinderlung lasts 30% shorter |
| `trait:giant-slayer` | kill 10 bosses or champions | +10% damage vs bosses and champions |

C4 can grant any `trait:*` as a quest reward through the `trait:earned` event (§10).

---

## 5. Skill trees

### 5.1 Structure

- **One main tree per class:** 5 tiers and ~28 nodes in 3 branches.
- **One small tree per subclass:** 12 nodes, in Phase 2.
- **Tier gates** (points spent in that tree): `[0, 5, 10, 15, 20]`.
- **Node types:**
  - **Minor:** multi-rank stat bumps, 1–3 ranks.
  - **Notable:** a named mechanic change, 1 rank.
  - **Ability:** grants a power or spell, which still has to be slotted.
  - **Keystone:** tier 5. **Choose 1 of 3** (one `exclusiveGroup`). Each keystone defines a build and comes with a hard drawback.
- **Prerequisites:** nodes can require earlier nodes in their branch (`requiresAll` / `requiresAny`), so each branch reads as a path.
- **Cost:** 1 point per rank. A main tree needs ~45 points to fill, against ~47 in the whole game, so the player can't fill it and also invest in a subclass.

### 5.2 Worked example: Warden, "The Shield-Sworn" (`skilltree:warden`)

Branches: **Shield** (defence and parry), **Blade** (offence), **Command** (sustain and auras).

| Tier | Shield | Blade | Command |
|---|---|---|---|
| **1** (0) | `stout` minor ×3: +5% max HP/rank | `honed-edge` minor ×3: +4% melee damage/rank | `rallying-shout` **ability**: 30 stamina, 18 s cooldown, +20% damage and 25 Resolve for 6 s |
| **2** (5) | `braced` notable: blocking costs −25% stamina · `iron-skin` minor ×3: +12 armour/rank | `riposte` notable: riposte ×1.3 → ×1.8 and refunds 20 stamina · `cleave` **ability**: 150° heavy sweep, 120% weapon damage, 25 stamina, 7 s cooldown | `second-wind` notable: below 30% HP, heal 25% over 5 s (90 s cooldown) |
| **3** (10) | `unyielding` notable: +40% poise while blocking; Resolve gain ×1.5 · `retaliation` notable (requires braced): blocking deals 30% of blocked damage back | `tempo` minor ×2: +4% attack speed/rank · `sunder` notable: heavies apply Vulnerable for 3 s | `war-banner` **ability**: plant a banner (8 s, 160 px aura) giving +15% damage and +20 armour; 40 Resolve, 25 s cooldown |
| **4** (15) | `iron-tide` notable (requires shield-bash in loadout): Shield Bash dashes 120 px and hits everything on the path | `executioner` notable: +50% *more* damage to Staggered or Exposed enemies | `stalwart-presence` notable: allies and summons in the banner aura take −15% damage; Resolve no longer decays in the aura |
| **5** (20) | **`living-fortress`** keystone: you **cannot dodge-roll**. Blocking covers 360°, costs no stamina below 50% Resolve and gives +50% armour. | **`oath-of-the-blade`** keystone: you **cannot equip shields**. 2H swords and spears move like 1H weapons, and you get +30% *more* melee damage and parries with your weapon (parry window −40 ms). | **`last-stand`** keystone: 40% of damage you take is **deferred** as bleed over 4 s, and kills cleanse the deferred damage. Max HP −15%. |

All three keystones share `exclusiveGroup: 'warden-keystone'`.

**Example builds this enables:**
- **Fortress tank:** Shield branch, Living Fortress, the Ironhide trait, a Bulwark subclass and heavy armour.
- **Duelist:** Blade branch, Oath of the Blade, the Duelist earned trait, a greatsword and a Vanguard subclass.
- **Spellblade-adjacent Warden:** Command branch, Last Stand, a Second Oath into Arcanist for Ash Bolt, and the Emberwarden Regalia set.

The other trees follow the same template:

| Class | Branches |
|---|---|
| Ranger | Marksman / Trapper / Wilds |
| Arcanist | Ash / Rime / Storm, with a school-agnostic Lore spine |
| Reaver | Fury / Blood / Iron |
| Shade | Blades / Shadow / Venom |
| Oathbound | Smite / Ward / Lantern |

**Phase 1 ships a "small tree"** per class: tiers 1–3 only, ~12 nodes each.

### 5.3 Respec

- **Free and unlimited until level 10.** This covers the prologue, so new players can experiment.
- After that, full respecs happen at a **Lanternate shrine** (or a Grey Monk, for flavour) for `100 × L^1.5` gold. The cost rises +25% per respec, up to ×3.
- A **Tome of Unlearning** (rare drop or craft) refunds a single node, as long as that doesn't orphan any dependent nodes.
- Attribute points can be reset with the same full respec.
- Subclass choice is permanent. Changing it is a late-game quest hook for C4 (an optional "Rite of Remaking").

---

## 6. Spells and powers

### 6.1 Sources of magic (lore-aligned)

- **Spells** (`kind: 'spell'`) cost **Ember** (displayed as Ember; the internal stat is `mana`), drawn from the leys. There are six player schools, each tinted by one of the Seven Sparks:

  | School | Spark | Element | Themes | Scaling | Phase |
  |---|---|---|---|---|---|
  | **Ash** | Ashvar, the Ember-Tongue | fire | Burn, explosions, rebellion | INT A | 1 (Ash Bolt), 2 |
  | **Rime** | Saela, the Tide-Mother | frost | Chill/Freeze, water, mercy (minor heals) | INT A, WIL D | 2 |
  | **Storm** | Calun, the Wanderer | lightning | Shock, chains, wind, blinks | INT A, FIN D | 2 |
  | **Radiance** | Ithren, the Lantern | radiant | heals, wards, smites; Church magic | WIL A | 2 |
  | **Umbral** | Morrow, the Veiled | shadow | curses, drain, memory; grey monks | INT B, WIL B | 3 (Hexblade gets some in 2) |
  | **Verdant** | Kethra, the Thorn | poison | roots, thorns, beasts; Thornwise | WIL B, VIG C | 3 (Beastwarden gets some in 2) |

- **Powers** (`kind: 'power'`) cost stamina or HP and are grouped by discipline: `martial`, `archery`, `shadowcraft`, `bloodcraft`, plus `ashmark` for the universal ability.
- **Bloodcraft** draws ember from the caster's own warmth: HP costs, and +10% damage per 10% HP missing. In the lore it is the road to Mirecraft. Using it raises the `counters['bloodcraft.casts']` counter, which C4 can read for Drowned Choir recruitment dialogue.
- **Mirecraft** is enemy-only. A late "temptation" path is possible in Phase 3 if C4 wants it.

### 6.2 Learning, slotting and upgrading

1. **Learn:** use a **Tome** (`kind: 'tome'`, `teaches`) that meets its attribute and level requirements. Tomes come from loot, vendors and quests (C4 places some, e.g. a Rime tome from the hedge-witch Nan Briar). Powers come from skill-tree ability nodes.
2. **Slot:** 4 → 5 → 6 active slots (§1.2). The player can swap freely out of combat or at rest. In combat, a swap is allowed with a 3 s lockout on the slot.
3. **Rank (1–5) via Mastery:** casting earns mastery XP on hits and kills. Ranks 2 and 3 come from mastery alone. **Ranks 4 and 5 also cost a school essence** (`item:essence-ash` and so on, from salvage and drops).
4. **Branching upgrades:** at ranks **2, 3 and 5** the player picks **1 of 2** upgrade choices (`SpellRankDef.choices`). Example, `spell:ash-bolt`:
   - R2: *Kindling* (+40% Burn buildup) **or** *Quickfire* (−30% cast time)
   - R3: *Splitting Flame* (+2 bolts at 60% damage, 25° spread) **or** *Searing Core* (pierce 2)
   - R5: *Cinderstorm* (Burning targets that die explode for 50%) **or** *Lance of Ashvar* (hold to charge up to ×3 damage and size)
5. **Glyphs:** the support-gem equivalent. A spell gets 0/1/1/2/3 glyph sockets at ranks 1–5. Glyphs are items (`kind: 'glyph'`) that apply `SpellModifier`s to compatible spells, matched by spell tags:

   | Glyph | Applies to | Effect |
   |---|---|---|
   | Splitting | projectile | +2 projectiles, ×0.7 damage |
   | Lingering | area | +100% duration, ×0.8 damage |
   | Echo | any | recasts after 1 s at ×0.4 |
   | Haste | any | ×0.75 cooldown, ×1.3 cost |
   | Conversion (per element) | any | 50% of damage converted to that element |
   | Chaining | projectile, chain | +2 chains |
   | Siphon | any | 5% of damage returned as Ember |
   | Detonation | projectile | explodes on impact, 80 px |
   | Homing | projectile | homing 180°/s |
   | Widening | area, cone | +40% area |

   Glyphs can be unsocketed freely at rest points. That is deliberate: experimenting should be free.

### 6.3 Combos across schools (Arcanist Attunement)

Consuming ≥2 stacks of school A with a cast of school B triggers a combo:

| A → B | Combo | Effect |
|---|---|---|
| Ash → Rime | Thermal Shock | burst of 100% of the spell's damage + Exposed |
| Rime → Storm | Conduction | Frozen or Chilled targets take a chain that can't miss |
| Storm → Ash | Wildfire | Burn spreads to Shocked targets |
| Radiance → any | Sanctified | the next spell heals for 20% of the damage it deals |

Phase 2 adds the rest of the table.

### 6.4 Overdraw and Cinderlung

Casting with too little Ember is allowed. Each missing Ember point costs **2 HP**, and the cast applies **Cinderlung**: −5% max HP per stack (max 5 stacks), which decays one stack per 20 s out of combat.

This turns a lore mechanic into a build lever:
- the Crown of Ozrah makes overdraw permanent;
- the `trait:cinder-scarred` earned trait shortens Cinderlung;
- Reaver/Arcanist hybrids can live on HP instead of Ember.

---

## 7. Items

### 7.1 Equipment slots

| Slot | Notes |
|---|---|
| Main hand, off-hand | ×2 loadouts, swapped with X |
| Head, chest, hands, legs, feet, cloak | armour |
| Amulet, ring ×2, belt, trinket | jewellery and accessories |
| Q/E quickslots | consumables |
| Inventory | 40 slots to start; **bags** raise it to 80 |

Materials stack to 99 and have a separate unlimited **materials pouch**, so they don't clutter the inventory.

### 7.2 Weapon families (movesets in `src/systems/combat/movesets.ts`)

| Family | Hands | Damage | Speed | Reach / arc | Scaling | Identity | Lore culture |
|---|---|---|---|---|---|---|---|
| sword | 1H | slash (3rd hit pierce) | med | 48 px / 100° | MIG C, FIN C | all-rounder, parry-friendly | Haldish arming sword, Qasiri nar-sabre, cutlass |
| greatsword | 2H | slash | slow | 64 / 150° | MIG B, FIN D | wide sweeps | Haldish longsword |
| axe | 1H | slash + Bleed 25 | med | 44 / 90° | MIG B | bleed | Hrothi bearded axe |
| greataxe | 2H | slash + Bleed 40 | slow | 60 / 160° | MIG A | bleed and cleave | Orrun runeforged |
| mace | 1H | blunt, ×1.5 poise | med | 44 / 90° | MIG B, WIL D | stagger; anti-Restless | Lanternate ("shed no blood") |
| warhammer | 2H | blunt, ×2.5 poise | very slow | 56 / 120° | MIG S | stagger-lock | Orrun |
| spear | 2H (1H with shield via node) | pierce | med | 80 / 30° | FIN B, MIG D | reach; poke from behind a shield | Hrothi, Haldish bills |
| dagger | 1H | pierce + Bleed 15 | fast | 36 / 70° | FIN A | backstab ×2 *more* instead of ×1.5 | Quiet Hand, cinderglass |
| bow | 2H | pierce (projectile) | draw 0.6–1.0 s | 600 px | FIN A | draw-time scaling, Focus | Haldish longbow, Aelthi thornbow |
| crossbow | 2H | pierce | 1.2 s reload | 520 px | flat (E) | 30% armour pen; no Finesse needed | Salt League |
| staff | 2H | basic bolt in the staff's school | med | 400 px | INT B | +10–30% spell damage implicit | |
| wand | 1H | fast weak bolts | fast | 360 px | INT C | pairs with tomes | |

**Off-hands:**
- **Shields:** buckler (parry window +60 ms), kite, round, tower (−15% move speed, 100% block).
- **Tomes:** +spell damage, +1 glyph socket to one slotted spell.
- **Talismans:** +Radiance, +healing, Devotion gain.
- **Quivers:** arrow types, e.g. broadhead (Bleed), cinder arrows (fire), lumen-tipped (radiant).

### 7.3 Rarity

Internal ids are paired with lore display names (C4):

| Rarity id | Display | Affixes | Notes |
|---|---|---|---|
| `common` | Common | 0 | |
| `uncommon` | **Fine** | 1 | |
| `rare` | **Ember-touched** | 2–3 | |
| `epic` | **Runed** | 4 | +1 affix tier |
| `legendary` | **Wrought** | 2 random + unique effect | build-defining (§7.5) |
| `set` | **Sparkforged** | 1 random + set bonus | |

- **Drop weights at T1:** common 70, uncommon 22, rare 6.5, epic 1.3, legendary 0.2, set 0 (sets drop from T2).
- **Danger tier** multiplies the rare-and-above weights by `1 + 0.25·(tier−1)`.
- **Rank** multiplies them too: elite ×3, champion ×5, boss ×10. The `itemFind` stat also multiplies them.
- **Smart loot:** 60% of random gear drops are biased toward the player's class proficiencies (`ItemFilter.smart`).

### 7.4 Affixes

- An item gets at most 2 prefixes and 2 suffixes.
- **Affix tiers** unlock by item level: T1 at ilvl 1, T2 at 8, T3 at 16, T4 at 24, T5 at 32.
- An optional `group` field stops duplicate stat affixes on one item.

Examples:

| Prefix (offence) | Stat | Suffix (defence/utility) | Stat |
|---|---|---|---|
| Keen | +crit chance | of the Bear | +Vigor |
| Searing / Rimed / Crackling | +fire / frost / lightning damage | of the Fox | +Finesse |
| Brutal | +poise damage | of the Owl | +Intellect |
| Serrated | +Bleed buildup | of the Lantern | +Will |
| Venomous | +Poison buildup | of the Ox | +Might |
| Swift | +attack speed | of Warding | +all elemental resist |
| Ley-drawn | +spell damage | of the Hearth | +Draught potency |
| Vicious | +crit multiplier | of Haste | +move speed |
| Lumen-edged | +radiant damage vs Hollowed | of the Wick | +status resist |
| Thirsting | +life leech | of Echoes | +cooldown reduction |

### 7.5 Legendaries (Wrought) and sets (Sparkforged)

Names and origins are from C4's lore. Each legendary breaks a rule.

| Item | Slot | Unique effect | Build it enables |
|---|---|---|---|
| **Edric's Oath** | longsword | your first block every 6 s counts as a perfect parry; ripostes restore 25 Resolve | parry Warden |
| **Wenna's Last Light** | talisman | Radiance overheal becomes a Ward (up to 30% max HP); Hollowed slain near you are *cleansed* (bonus loot, Hollowbane progress) | Lightbringer |
| **The First Nail** | warhammer | fully charged heavies **pin** (2 s Root + Vulnerable); −20% attack speed | Juggernaut stagger-lock |
| **Gwynfar, the Singing Bow** | bow | full-draw arrows ricochet to 2 more targets, +20% damage per bounce | Deadeye clearing |
| **Lastlight** | sword | 30% of physical damage is converted to fire; killing Hollowed restores 10 Ember (story-bound: inherited if Hesta Corrow dies in Act I) | Emberwarden hybrid |
| **Frostjaw** | axe | Bleed triggers also apply Frozen; Frozen kills shatter for 60% as frost AoE | Bleed/Rime crossover |
| **Crown of Ozrah** | head | +50% *more* spell damage; **every** cast overdraws (Ember costs are paid in HP) | Cinderlung glass cannon |
| **The Drowned Lord's Hook** | dagger | hitting from stealth pulls you to the target; 5% leech vs Bleeding; −20% healing received (Mire-taint) | Assassin |
| **Saltheart** | sword | an attack within 1 s after a dodge always crits; dodging through enemies applies 30 Bleed | dodge-crit duelist |
| **Censer of the Red Abbess** | off-hand | Burn stacks up to 5×; Burning enemies spread Burn on death | Ash DoT |

**Sets** (two-piece and four-piece bonuses):

| Set | 2-piece | 4-piece |
|---|---|---|
| **Emberwarden Regalia** | melee hits add 15% fire | melee hits cut spell cooldowns by 0.3 s |
| **Lightsworn Plate of Saint Solenne** | +25% armour in your Radiance auras | parries heal 8% HP |
| **Vestments of the Drowned Choir** | +5% life leech | spells cost HP and deal +35% *more* (tainted: Lanternate NPCs react) |
| **Wolf-Sworn Furs** | +15% attack speed at Fury >50 | kills give Haste and 20 Fury |
| **Thornwise Mantle** | +Poison buildup | traps root and summon briars |

### 7.6 Runecraft: upgrading, tempering, enchanting, crafting

"Runecraft" (the Spark Vor, the Hammer) is the lore name for the whole system.

**Upgrade (forge):** +0 → +10, each level adding +7% base damage or armour.

| Levels | Material |
|---|---|
| +1…+3 | iron, steel |
| +4…+6 | emberforged steel |
| +7…+9 | a **temper** material, chosen at +7 and permanent |
| +10 | **true-iron** |

| Temper | Adds |
|---|---|
| **Cinderglass** | +15% damage as fire, +Burn |
| **Wardwood** | bows, staves and spears only: +Poison and +10% attack speed |
| **Lumen silver** | +15% radiant; ×1.5 *more* vs Hollowed and Restless |
| **Drowned silver** | +15% shadow and 3% life leech; −10% healing received (cursed) |

**Reforging** moves an item's upgrade level onto a new item for 50% of the material cost, so upgrading never traps the player in old gear.

**Salvage** turns items into materials: scrap, ley-dust, rune-shards, Wrought fragments and school essences.

**Runeforge (enchanting):**
- **Reroll** one affix while the others stay locked. The cost doubles per reroll on the same item (`enchantStrain`).
- **Imbue** an empty affix slot with a crafted **Rune** of a chosen affix, at a random tier up to the item level.
- **Heartstone** (mythic) upgrades a Wrought item to *Sparkforged*. That is late Phase 3.

**Recipes:**

| Station | Makes |
|---|---|
| Forge | weapons and armour; bases with one guaranteed affix |
| Alchemy | potions, **oils** (weapon coatings: +20% damage as an element and buildup, for 3 min), **bombs** (thrown AoE) and **food** (10-minute buff, one at a time) |
| Runeforge | runes and glyphs |

Recipes are learned from **schematics**.

---

## 8. Enemies

### 8.1 Families (C4 lore) and archetypes

**Families:** beasts, folk, the Restless, the Wrought, Thornkin, Cinderdrakes, the Unwrought. **Hollowed** is a variant that can apply to any beast or folk enemy (§2.4).

| Archetype | Behaviour | Example |
|---|---|---|
| brute | slow, high poise, big telegraphed swings | Hollowed Thrall, Rustwraith |
| skirmisher | circles and lunges, dodges player heavies | Gloamwood Wolf, Ashfoot cutthroat |
| archer | keeps 5–9 tiles away, repositions with LoS | Ashfoot archer, Wick crossbowman |
| caster | channels behind melee, interruptible | Choir acolyte, reed-priest |
| swarm | weak, many, surrounds | Mireling, carrion crows |
| charger | long telegraphed dash, vulnerable after | boar, White Stag |
| shieldbearer | blocks frontal physical; must be flanked or staggered | Drowned dead, Wick soldier |
| summoner | spawns adds and flees | reed-priest, Gloamlight |
| ambusher | hidden until close (burrowed or in stealth) | Briarwight |
| support | heals and buffs allies | Choir chanter |
| boss | phased, multi-attack, arena | Abbess Morwen |

**Ranks:**

| Rank | HP | Damage | Notes |
|---|---|---|---|
| minion | ×0.4 | ×0.6 | |
| normal | ×1 | ×1 | |
| elite | ×2.5 | ×1.3 | plus 1–3 elite affixes |
| champion | ×5 | ×1.5 | named, 2 affixes |
| boss | ×12–20 | ×1.6 | phases |

### 8.2 AI

- **FSM per enemy:** `Idle → Patrol/Wander → Suspicious (0.6 s "?" telegraph) → Engage → [Flee] → Return (leash)`.
- **Perception:**
  - **Sight:** perception radius plus FOV, with line of sight via C2's `raycast(…, SOLID|BLOCK_SIGHT)`.
  - **Hearing:** combat within 10 tiles, sprinting within 5, half that in stealth.
  - **Night:** reduces enemy sight by 30%.
- **Behaviour modules** (data keys in `AiProfile.behaviors`): `approach`, `strafe`, `keepDistance`, `flank`, `retreatAfterAttack`, `dodgeTelegraphs`, `callForHelp`, `guardPoint`, `packHunt`, `kite`, `shieldFront`, `summonAdds`, `fleeAtLowHp`, `splitOnDeath`.
- **Encounter Director** (`src/systems/ai/Director.ts`) hands out **attack tokens**:
  - At T1–2: at most **2 melee and 2 ranged** enemies may be mid-attack against the player at once.
  - Each limit rises by 1 at T3 and again at T5.
  - Higher-aggression enemies grab tokens first.

  This stops dog-piling and keeps 1-vs-many fights readable.
- **Movement:** steering, plus C2's `findPath` (A*, recomputed every 400 ms while LoS is blocked). World collision uses C2's resolver, and entity-vs-entity uses Arcade bodies.
- **Leash:** comes from C2's `SpawnZone.leash`. Past the leash the enemy returns and regenerates fully.

### 8.3 Scaling by danger tier

Region tier, from C2's spawn request, plus the spawn level determine enemy stats:
- **HP** = `base.hp × P(L) × rankMult`
- **Damage** = `base.damage × D(L) × rankMult`
- **Armour** = `base.armor × (1 + 0.1·(L−1))`

| Tier | Levels | Elite chance | Elite affix count | Affix pool unlocks |
|---|---|---|---|---|
| T1 | 1–6 | 2% | 1 | Frenzied, Armoured |
| T2 | 6–12 | 5% | 1–2 | + Vampiric, Molten |
| T3 | 12–20 | 8% | 2 | + Shielded, Teleporting, Frost-touched |
| T4 | 20–30 | 12% | 2–3 | + Mire-tainted, Splitting, Warded |
| T5 | 30–40 | 16% | 3 | + Undying (revives once), Overcharged |

### 8.4 Phase 1 roster (ids agreed with C2 and C4)

| Id | Family / archetype | Sketch |
|---|---|---|
| `enemy:gloamwood-wolf` | beast / skirmisher | packs of 2–4; `packHunt` + `flank`; lunge with 300 ms wind-up; 10 Poison buildup; flees at 20% HP when alone |
| `enemy:hollowed-thrall` | folk (Hollowed) / brute | shambling villager; slow grab plus a 2-hit flail; weak to fire and radiant; the festival attack on the village green |
| `enemy:mireling` | unwrought / swarm | small blob with a 2-step hop and lunge; **splits** into 2 minis on death (hook `splitOnDeath`); immune to Poison and Bleed |
| `enemy:ashfoot-cutthroat` | folk / skirmisher | bandit with a dagger, Bleed 20, dodges heavies 25% |
| `enemy:ashfoot-archer` | folk / archer | kites at 6–8 tiles; volley of 3 every 6 s |
| `enemy:drowned-dead` | restless / shieldbearer | Drowned Abbey dead (replaces barrow-skeleton); frontal block; pierce +50% / blunt −30% resist; immune to Bleed and Poison |
| `enemy:hollowed-white-stag` | beast (Hollowed) / **mini-boss** charger | Weeping Stones; antler charge (500 ms telegraph), stomp ring, summons 2 Hollowed wolves at 50%; `cleansable` at ≤15% HP sets `prologue.stag_fate = "cleansed"`, otherwise killing it sets `"slain"` (C4 owns the flag) |
| `enemy:abbess-morwen` | folk (Mirecraft) / **boss** caster | Drowned Abbey reliquary. **P1:** mire-bolts and drowned-dead adds. **P2** (66%): water rises, slow zones and a Mireling flood. **P3** (33%): "Drowned Hymn", a channelled pulse that must be interrupted by Stagger. |

Required for Phase 1: wolf, thrall, mireling and the two bosses. Cutthroat, archer and drowned-dead are stretch goals, but likely to make it.

### 8.5 Loot table format

The type is `LootTable` (§9). Example:

```ts
{ id: 'loot:gloamwood-wolf', rolls: 1, gold: [0, 3],
  entries: [
    { weight: 60, kind: 'nothing' },
    { weight: 30, kind: 'item', item: 'item:wolf-pelt', qty: [1, 2] },
    { weight: 10, kind: 'random', filter: { kinds: ['weapon', 'armor', 'accessory'], smart: 0.6 }, rarity: 'roll' },
  ] }
```

- Bosses use `guaranteed` entries: their legendary chance, a school essence and a story item.
- Chests are loot tables too. C2 places a chest with `loot:<id>`, and C4 can reference tables for quest rewards.

---

## 9. Contracts for `src/core/types.ts`

Merged by C1 into `src/core/types.systems.ts`, which is now the source of truth; [`types-proposal.ts`](types-proposal.ts) is frozen history. Combat conditions are `CombatCondition`, because core `Condition` is the flag/quest condition. Key types:

| Type | Purpose |
|---|---|
| Ids | `class:`, `trait:`, `item:`, `spell:` (spells **and** powers), `skilltree:`, `enemy:`, `loot:`, `affix:`, `set:`, `recipe:` |
| `AttributeId`, `DamageType`, `StatusId`, `MagicSchool`, `StatId`, `StatModifier` | flat / increased / more, with optional `Condition` |
| `EffectDef` | the universal effect union: modifier, grantAbility, applyStatus, hook, proficiency, dialogueTag |
| `ClassDef`, `SubclassDef`, `ClassResourceDef` | classes |
| `TraitDef` (+ `EarnRequirement`) | traits |
| `ItemDef` with `WeaponStats` / `OffhandStats` / `ArmorStats` / `ConsumableDef` / `GlyphDef`, plus `AffixDef`, `SetDef`, `RecipeDef`, `ItemInstance`, `RARITY_NAMES` | items |
| `SpellDef` (+ `SpellDelivery`, `SpellModifier`, `SpellRankDef`, `SpellUpgradeChoice`) | spells and powers |
| `SkillTreeDef`, `SkillNodeDef` | skill trees |
| `EnemyDef` (+ `EnemyAttackDef`, `AiProfile`, `BossPhaseDef`, `EliteAffixDef`, `EnemyFamily`, `EnemyVariant`) | enemies |
| `LootTable`, `LootEntry`, `ItemFilter` | loot |
| `ProgressionState`, `SpellbookState`, `EquipmentState`, `InventoryState`, `CountersState` | GameState slices Claude 3 owns |

## 10. Events Claude 3 emits and consumes (for `src/core/events.ts`)

**Emits:**

| Event | Payload |
|---|---|
| `enemy:killed` | `{ enemyId, zoneId?, x, y, level, family, variant?, rank, byPlayer }` |
| `enemy:cleansed` | `{ enemyId, flag }` |
| `boss:phase` | `{ enemyId, phase }` |
| `combat:hit` | `{ sourceId, targetId, amount, type, crit }` (UI damage numbers) |
| `combat:engaged` / `combat:disengaged` | `{}` (music and HUD) |
| `player:damaged` | `{ amount, type, sourceId }` |
| `player:died` | `{ x, y, regionId }` |
| `player:respawned` | `{}` |
| `player:levelup` | `{ level }` |
| `xp:gained` | `{ amount, source }` |
| `item:picked` | `{ uid, def, qty }` |
| `item:equipped` / `item:unequipped` | `{ uid, slot }` |
| `item:used` | `{ uid, def }` |
| `item:crafted` | `{ recipe, uid }` |
| `spell:learned` | `{ spellId }` |
| `spell:cast` | `{ spellId, school? }` |
| `spell:ranked` | `{ spellId, rank }` |
| `trait:earned` | `{ traitId }` |
| `tree:allocated` | `{ treeId, nodeId, rank }` |
| `subclass:chosen` | `{ id }` |
| `stats:changed` | `{}` (HUD bars) |

**Consumes:**

| Event | From | What I do |
|---|---|---|
| `enemy:spawn-request { enemyId, level, x, y, zoneId, tier }` | C2 | spawn the enemy |
| `time:phase-changed` | C2 | night-based traits and perception |
| `quest:reward { xpTier?, items?, traits?, skillPoints?, gold?, tome? }` | C4 | grant the rewards |
| `world:rest` | C2 | refill draughts, reset cooldowns |

**Needs from C1:**
- GameState slices `progression`, `spellbook`, `equipment`, `inventory` and `counters`.
- A seedable RNG in core, so loot and crits are reproducible in tests.

## 11. Code layout (`src/systems/`)

| File | Responsibility |
|---|---|
| `balance.ts` | every constant and curve (P, D, xpToNext, rarity weights, caps) |
| `stats/StatBlock.ts` | aggregate base, attributes and modifiers (flat → increased → more), conditional modifiers, caching |
| `combat/` | `HitResolver.ts` (formula §2.3), `Melee.ts`, `Projectiles.ts`, `Block.ts`, `movesets.ts`, `Poise.ts` |
| `status/StatusSystem.ts` | buildup meters, DoTs, durations |
| `abilities/` | `AbilitySystem.ts` (cast pipeline, cooldowns, costs, overdraw), `deliveries.ts`, `glyphs.ts` |
| `effects/hooks.ts` | named bespoke effects (legendaries, keystones) |
| `ai/` | `EnemyController.ts`, `behaviors.ts`, `Director.ts`, `perception.ts` |
| `progression/` | `Leveling.ts`, `SkillTrees.ts`, `Traits.ts`, `Respec.ts` |
| `items/` | `Inventory.ts`, `Equipment.ts`, `ItemRoller.ts` (rarity and affixes), `Loot.ts`, `Runecraft.ts` |
| `player/PlayerController.ts` | input → actions; dodge, sprint, draught |

UI lives in `src/ui/character/`: `InventoryPanel`, `EquipmentPanel`, `SkillTreePanel`, `SpellbookPanel`, `CharacterSheet` and `ItemTooltip`, all built with C1's `ui/kit`.

Every system file stays under ~400 lines. The pure maths (formula, rolls, stat aggregation) is Phaser-free so it can be unit-tested.

## 12. Phase 1 deliverables (Claude 3)

- [ ] PlayerController: move, sprint, dodge, light/heavy melee, block/parry, bow draw, staff bolt, draught
- [ ] StatBlock + HitResolver + Status (Bleed, Burn, Poison, Stagger, Root)
- [ ] 3 classes (Warden, Ranger, Arcanist), each with a starting ability (Shield Bash, Pinning Shot, Ash Bolt) plus the Ashmark
- [ ] 6 traits (§4 #1–6)
- [ ] 3 small skill trees (tiers 1–3, ~12 nodes each)
- [ ] Inventory, equipment (2 loadouts), item tooltips, ~25 items (starting kits + T1 drops + 1 legendary teaser)
- [ ] Enemies: wolf, thrall, mireling + White Stag + Abbess Morwen (+ stretch: cutthroat, archer, drowned-dead) with AI, Director and loot
- [ ] Levelling and XP (kills, `quest:reward`, discovery)
- [ ] UI: inventory/equipment, skill tree, spellbook, character sheet

## 13. Open questions

1. **C1:** are the input map (§2.1), the GameState slices and the seedable RNG OK? Do you want ancestry (§4) in character creation?
2. **C4:**
   - The Hearth Draught lore name.
   - A quest XP tier on every quest.
   - Who grants `ashmark.rank` and when.
   - The prologue's Nan Briar tome: Rime arrives early as a reward, which is fine because tomes are class-agnostic.
3. **C2:** rest-point placement (`world:rest` event) and Echo pickup on death. Chests reference `loot:*` ids.
4. **Phase 2:** decide whether Umbral and Verdant become full schools or stay subclass-only.
