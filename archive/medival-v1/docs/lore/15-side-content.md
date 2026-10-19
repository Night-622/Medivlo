# 15: Regional side content: data spec

Serves pillar 1: lore discovered by exploring. For each Act I and Act II region, write **2 side quests**, **5 inscriptions or lore objects**, and **2–3 readable books**. That's about 24 side quests and about 28 books, for about 40 books in total with the existing 12.

## Gates
- Side quests: `requires` must include `{ flag: 'content.side' }`; Claude 1 flips it after Claude 2 places the objects. Act II regions also need `content.act2`.
- Side quests start from a giver NPC dialogue (`startQuest` in a choice), not autoStart, unless noted. Givers can be existing NPCs or new ones; new NPCs also need `presentWhen: { flag: 'content.side' }`.
- Inscriptions and books need no gate: they are lore objects that do nothing until Claude 2 places them.

## Conventions
- **Hard rule** (from 11-act2-spec.md): quest-critical flags are set at the decision, and every critical scene can be reopened from an NPC route or an `obj:`.
- `type: 'side'`, `act` = the region's act, `region` set, `reward.xpTier` 1 or 2.
- Rewards can use Claude 3's glyphs (`item:glyph-<splitting|lingering|echo|haste|cinders|frost|storms|piercing|siphon|detonation|homing|widening>`) and gold.
- Ids:
  - `quest:side-<region-short>-<slug>`
  - dialogues `dialogue:side-<region-short>-<slug>-…` and `dialogue:obj-<object>`
  - objects `obj:<region-short>-<thing>`
  - inscriptions `obj:inscription-<region-short>-<n>` (kind 'lore'; `props.lore` = a lore id, and optionally `props.section`)
  - books `lore:book-<slug>` with `unlockOn: [{ interact: 'obj:book-<slug>' }]`
- Inscriptions unlock either a new short codex entry (category `places`/`history`/`culture`, 60–120 words, often an in-world text such as a gravestone, a milestone, graffiti, a shrine plaque or a boundary stone), or a new section on an existing entry.
- Region shorts: kv (kingsvale), gw (greywater-marsh), wd (witherdowns), ft (ironspine-foothills), sc (saltreach-coast), yl (ylwen-deepwood), lc (lantern-coast), is (ironspine), fr (frostreach), si (saltreach-isles), ss (sunscar), cw (cinder-wastes).
- Landmarks: reuse ones from 09-regions, 10-act1-spec and 11-act2-spec, or invent new ones (`landmark:<region-short>-<name>`), and list them for the world team.

## Hooks (expand these, or improve on them)
| Region | Quest hooks |
|---|---|
| Kingsvale | **The Lamplighters' Strike**: Haldren's lamplighters refuse to light the Brand-wicks that no longer burn true. **Seed Corn**: a farm village hoards seed while refugees starve at its gate. |
| Greywater | **The Eel-Wives**: fishers vanish at a particular eel-weir. **The Bell of Varn**: raise the drowned town bell before the Choir uses it to call the Hollowed. |
| Witherdowns | **The Unburied**: a monk asks you to lay a wight's broken oath to rest. **The Chalk Giant**: the hill figure must be re-scoured at the dark of the year, or the downs-folk think the dead will walk. |
| Foothills | **Mine Nine**: a mine floods with black water that climbs upward. **The Rust Pilgrim**: an Orrun pilgrim walking to a frozen Orrin giant to ask forgiveness. |
| Saltreach Coast | **The Wreckers' Lantern**: false lights on the cliffs. **Saela's Tithe**: a tide-priest in a harbour that freezes at night. |
| Ylwen | **The Wardwood Sapling**: replant a dying heart-tree. **Songless**: an Aelthi child who cannot sing. |
| Lantern Coast | **Snow on the Vines**: a vintners' "miracle" that is a fraud, or isn't. **The Pilgrim's Candle**: a pilgrim who walked from Hrothi lands to see the Brand. |
| Ironspine | **The Ledger of the Lost**: copy the names of the drowned holds before the ink runs. **The Patrol**: a Wrought sentinel still walking a 3,000-year route. |
| Frostreach | **The Skald's Last Saga**: a dying skald needs a deed for her final verse. **The Ice-Bound Longship**: a ship frozen in a glacier with its crew aboard. |
| Saltreach Isles | **The Drowned Tide-Temple**: priests who chose the water. **The Smuggler's Glyph**: contraband spell-glyphs and a dead courier. |
| Sunscar | **A Debt of Salt**: a host who broke salt-law. **The Glass Garden**: a Qasiri widow growing flowers in cinderglass. |
| Cinder Wastes | **Drakeling**: an orphaned cinderdrake egg. **The Defector**: an Ashen Creed mage who wants out. |

## Report (each writer)
Files, ids, flags, a **placement table** (object id → landmark → description) for Claude 2, and the giver-route additions for existing NPCs.
