# Tooltip read-through (Claude 4, 2026-10-21)

Read as a player: every line `describeHc.itemTooltip()` writes for 640 rolled items (every weapon and armour base,
item levels 5 / 15 / 30 / 40, upgrades 0–5), plus every perk (rank 1), keystone, mastery, spell, rune, unique, hybrid
set and armour set line. Numbers were not changed anywhere; only how they read. Owners apply; nothing here is edited
outside Claude 4's folders.

## 1. describeHc.ts (Claude 3): bugs a player sees

| Seen in the tooltip | Cause | Fix |
|---|---|---|
| `+0.1 castSpeed`, `+0.3 minionHp`, `+0.2 minionDmg`, `+0.1 statusChance`, `+0.3 statusDmg.burn` (and poison, bleed), `+1.1 emberOnHit`, `+2.7 staminaOnKill`, `−0.1 staminaCost`, `−0.1 dashCd`, `+0 area` | the deeper-builds stat keys have no LABEL and are not in PCT, so they print raw and as fractions (`+0 area` is 0.04 rounded) | LABEL: castSpeed “Cast speed”, area “Area of effect”, projCount “Projectiles”, dashCd “Dash cooldown”, staminaCost “Stamina cost”, emberOnHit “Ember per hit”, staminaOnKill “Stamina per kill”, minionDmg “Summon damage”, minionHp “Summon health”, statusChance “Status chance”, rootDur “Root duration”; statLabel: `statusDmg.<id>` → “Burn damage” / “Poison damage” / “Bleed damage”. PCT: add castSpeed, area, dashCd, staminaCost, minionDmg, minionHp, statusChance, rootDur, and `k.startsWith('statusDmg.')` in isPct |
| `−12% Damage taken ({v}% damage taken below 50% health)` | affixLines takes the bracket text of the affix's `text` as the condition; suf_of_last_light has no brackets, so the whole template (with `{v}`) is printed | when `text` has no brackets, describe `when` instead (hpBelow → “below 50% health”), or print `d.text` with `{v}` filled: `−12% damage taken below 50% health` |
| `Your class cannot wield a axe.` | fixed article | `a${/^[aeiou]/.test(t) ? 'n' : ''} ${t}` |
| `+6.5% Stamina regen /s` | a `pct` modifier on a per-second stat keeps the “/s” | in modText, drop “ /s” from the label when `op === 'pct'`: `+6.5% Stamina regen` |
| `2: +10% move speed` / `4: Cinder Rhythm. …` | a bare number reads as a list index | `2 pieces: …` / `4 pieces: …` |
| `Hybrid: 2 of this set + 2 of another school’s set: a two-school bonus.` | two colons, a plus sign | `Hybrid: wear 2 of this set and 2 of another school’s set for a two-school bonus.` |
| proc affixes: `… (power ×1.23)` | internal multiplier shown as-is (Claude 1's “+0.15 x”) | ` (rolled at 123% strength)` — or fold r.v into the numbers the text quotes |

Data (generated armour sets, Claude 3): set names and ability names use straight apostrophes
(`Balladeer's`, `Stalker's`, `Rogue's`, `Duelist's`, `Minstrel's`); the house style is ’.

## 2. Timings (Claude 5's text: perks, keystones, mastery, runes, uniques, hybrids, proc affixes)

109 effect lines write timings as bare brackets: `(2 s)`, `(1.5 s, 4 s)`. A player cannot tell a duration from a
cooldown, and the same line often has both (`Landing a dash blinds the foes around you (1.5 s, 4 s)`). The armour set
abilities already use the clear form, so match it: **duration → “for 2 s”, cooldown → “once every 4 s”.**

`tools/narrative/tooltip-timing.ts` reads each line's effect data (icd vs dur) and prints the rewrite for all 109:

    node $(node tools/narrative/build.mjs tools/narrative/tooltip-timing.ts full)

Examples:
- `Spell critical hits restore 6 Ember (0.5 s).` → `Spell critical hits restore 6 Ember, once every 0.5 s.`
- `Landing a dash blinds the foes around you (1.5 s, 4 s).` → `… blinds the foes around you for 1.5 s, once every 4 s.`
- `When hit: burn the foes around you (6 s).` → `When hit: burn the foes around you, once every 6 s.`
- `Casting a spell gives you and allies near you 10% more damage for 5 s (5 s).` → `… for 5 s, once every 5 s.`
- `When hit: heal 6% of max health (8 s)` (suf_of_the_dawn) → `When hit: heal 6% of max health, once every 8 s`

Perk lines are rank templates, so apply the same form inside the template strings.

## 3. Distances in pixels (Claude 5 / Claude 3)

47 kit spells, 13 perk / keystone / unique lines say `within 130 px`, `a 400 px line`, `foes 200 px or more away`.
Players do not see pixels. Either rewrite in paces (1 pace = 1 tile = 32 px: `within 4 paces`, `a 12-pace line`,
`foes 6 paces or more away`), or convert at display time (one regex in the spell / perk tooltip: `(\d+) px` →
`${Math.round(n / 32)} paces`), which keeps the data in pixels for the sim.

## 4. Wording (Claude 5's data unless noted)

| Now | Suggest |
|---|---|
| `+2.3% damage to anything` (7 perks, after a conditional bonus) | `+2.3% damage to all foes` |
| `While moving: +7.5% damage; +1.5% damage while standing too.` | `+7.5% damage while moving, +1.5% while standing still.` |
| `… recharges 20% faster and costs 15% less and hits 25% harder.` (8 perks) | `… recharges 20% faster, costs 15% less and hits 25% harder.` |
| `Summoning makes the target bleed (4 s, 2 s); casting makes the target bleed (4 s, 2 s).` | `Summoning or casting makes the target bleed for 4 s, once every 2 s.` |
| ks_spellblade `… also casts your slot-1 spell at 40% power.` | `… also casts the spell in your first slot at 40% power.` |
| ks_vampire `+10% of damage healed back` (also Veilshroud `+3% of damage healed back`) | `Heal for 10% of the damage you deal` |
| ks_chain_reaction `… sparks a small blast of 30%.` | `… sparks a small blast of 30% power.` |
| rn_twin `Also strikes a second foe nearby for 75%.` | `Also strikes a second foe nearby for 75% damage.` |
| rn_burst `Repeating spells land all at once for 50% more.` | `Spells that hit several times land every hit at once, for 50% more damage.` |
| benediction, shield-song `… 18% of their max health, 6 s.` | `… 18% of their max health for 6 s.` |
| school spells (Claude 3): `4s`, `5s`, `6s` (absolute-zero, cataclysm, eclipse, iron-skin, tempest, unbreakable) | `4 s` (the kit spells' spacing) |

## 5. Read and fine

Item headers (`Sword · Fine · Item level 15`), damage ranges, the base stat lines, school damage and resistances,
set progress `(2/4)`, attuned lines, the twelve set abilities (already `once every N s`), sockets, sell value,
every flavour line, and the spell descriptions apart from §3 and §4. “Power” (`140% power`) is consistent across
spells, perks and uniques and matches the Spell power / Weapon power stats, so it stays.
