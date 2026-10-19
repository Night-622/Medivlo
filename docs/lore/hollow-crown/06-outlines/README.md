# 06: Class campaign outlines

There is one file per school, each holding both class campaigns. Every outline follows [05-campaign-framework.md](../05-campaign-framework.md) exactly, and [ash.md](ash.md) is the worked example of the format.

| School | File | Capital class | Frontier class |
|---|---|---|---|
| Ash | [ash.md](ash.md) | Arcanist | Reaver |
| Rime | [rime.md](rime.md) | Rimecaller | Warden |
| Storm | [storm.md](storm.md) | Sparkwright | Stormlancer |
| Radiance | [radiance.md](radiance.md) | Cantor | Oathbound |
| Umbral | [umbral.md](umbral.md) | Duskweaver | Shade |
| Verdant | [verdant.md](verdant.md) | Hedgewitch | Ranger |
| Blade | [blade.md](blade.md) | Swordsman | Samurai |
| Iron | [iron.md](iron.md) | Knight | Juggernaut |
| Fist | [fist.md](fist.md) | Monk | Brawler |
| Hunt | [hunt.md](hunt.md) | Huntsman | Falconer |
| Guile | [guile.md](guile.md) | Jester | Corsair |
| Song | [song.md](song.md) | Bard | Skald |

## What an outline lists, per class
Only the **class-specific** content is listed: 34 quests per class. The shared Concordia and Heart quests (16 in Act II, 4 in Act III, plus 3 shared Act III side quests) come from 05 and are only *referenced*, with any class-specific beat they gain.

1. **Header:** the class, start area, mentor, nemesis, half-stone, theme and Morvane Sentinels A/B (from 03-classes.md).
2. **Act I:** 22 quests.
   - I-1 to I-10 (main), as a table: id slug | title | zone or lair | one-line beat | key flag(s).
   - 8 side quests (2 per zone).
   - 2 mentor-thread quests.
   - 2 bounties.
3. **Act I bosses:** lair 1, lair 2, lair 3 and the gate. Name, one-line fight idea, and what the black tears do to it.
4. **The I-5 faction choice:** the options, plus what each changes later.
5. **Act II class thread:** C-1 to C-6, plus 2 featured-bearer threads (which bearers, and why).
6. **Act III class quests:** III-4 (the nemesis remade), plus 3 class side quests.
7. **Class beats in shared quests:** any [School] or class lines that shared quests need, for example "II-2 Wolves: an Arcanist can read the scorch marks".
8. **Endings:** one line each for the class's realm slide, mentor slide and nemesis slide (spared or destroyed) under each of the four endings.
9. **Landmarks and set pieces for Claude 2:** `landmark:<id>` and `obj:<id>` names, each with its zone.

**Ids:** quest slugs are `quest:<class>-<slug>`. Flags are `<class>.<name>`, `story.*` or `insight.*` (see 05).
