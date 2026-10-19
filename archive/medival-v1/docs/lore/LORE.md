# MEDIVAL: Lore Bible (index)

Owner: **Claude 4** (`medival-8e`). This is the source of truth for names, history and story. Other agents align to it. If you need a name, ask Claude 4 rather than inventing one.

## The pitch, in one paragraph

The god-smith **Orr** hammered the world of **Morvane** out of the **Mire**, a formless and dreaming sea, then lay down and died. His body became the **Ironspine** mountains. His still-burning heart, the **Heartfire**, sank to the world's core, and its heat rises through **leys** as the magic that mages call **ember**. For 1,186 years the **Lanternate** church has ruled the south from **Solenne**, where the **Brand** burned: a living shard of the Heartfire, carried up from the deep by a saint. One year ago, on the **Night of Falling Ash**, the Brand went dark and shattered into **Seven Embers** that fell across the land. Since then the winters won't end, the leys are failing, and the Mire is rising through the cracks. Its touch makes the **Hollowed** and spawns the **Unwrought**. You are **Ashmarked**: on that night a splinter of a falling Ember scarred your hand. You can burn the Mire out of things. You can carry Embers. And the **Pale Saint**, who quenched the Brand, wants you to carry them to her.

Core questions the campaign asks:
1. **Was the world's making a crime?** The Mire was alive. The Forging bound it, and the Heartfire is the nail that holds it down.
2. **Who should hold magic?** The Church, which licenses and burns mages; the free mages; or no one at all.
3. **What do you owe the dead and the dreaming?**

## Files

| File | Contents |
|---|---|
| [01-cosmology-religion-magic.md](01-cosmology-religion-magic.md) | Creation myth, the Seven Sparks and the Eighth, religions, how magic works, magic schools |
| [02-history.md](02-history.md) | Ages, timeline, wars, fallen empires, the inciting catastrophe |
| [03-factions.md](03-factions.md) | The 10 factions: goals, leaders, seats, relations, joining and opposing them |
| [04-peoples-languages-glossary.md](04-peoples-languages-glossary.md) | Peoples, cultures, naming conventions, language flavour, glossary |
| [05-characters.md](05-characters.md) | Villains, companions, mentors, recurring NPCs |
| [06-campaign.md](06-campaign.md) | Prologue + Acts I–III: chapters, main quests, choices, world flags, endings |
| [07-prologue.md](07-prologue.md) | Phase 1 slice: 5 main + 2 side quests, 10 NPCs, 20 codex entries |
| [08-data-formats.md](08-data-formats.md) | TypeScript interfaces for QuestDef, DialogueDef, NpcDef, CodexEntry, FactionDef |
| [09-regions.md](09-regions.md) | The 15 regions: history, controlling faction, landmarks, gates (for Claude 2) |

## Cross-team agreements

- **Continent:** Morvane. **Calendar:** YL (Years of the Lantern). **Now:** 1187 YL, the Long Winter.
- **Magic resource:** *Ember*. **Stats for checks (Claude 3):** might, finesse, vigor, intellect, will. **Player schools (Claude 3):** Ash, Rime, Storm, Radiance, Umbral, Verdant. **Not player schools:** Runecraft (the crafting/enchanting system), Mirecraft (enemy magic). **Reaver blood magic:** *Bloodcraft*.
- **Classes (Claude 3):** Warden, Ranger, Arcanist, Reaver, Shade, Oathbound. Origins are in 04.
- **Enemy families:** Beasts, Folk, Hollowed (corrupted modifier), Restless (undead), Wrought (constructs), Thornkin (wild/fae), Cinderdrakes, Unwrought (abyssal).
- **Ids:** `quest:`, `dialogue:`, `npc:`, `lore:` (codex entries), `faction:`, `region:`, `landmark:`, `obj:` (world interactables). All kebab-case.
- **Flag namespaces:** `prologue.*`, `act1.*`, `act2.*`, `act3.*`, `world.*` (global, e.g. `world.mire_level` 0–5), `npc.<id>.*`, `companion.<id>.*`, `rep.*` is NOT a flag (reputation is its own GameState slice).

## Tone guide

- Grounded, folkloric, melancholy, with warmth in the people. Think a bleak winter, but with a hearth.
- Lore is **discovered**: codex entries unlock from places, books, conversations and objects. Entries can have sections that unlock progressively, and in-world sources can be **wrong or biased**. Lanternate texts call the Mire "evil"; Aelthi texts call it "the Dreaming".
- No modern idiom in dialogue. Haldish folk are plain-spoken; Solenni speak formally; the Choir speaks softly, in water imagery.

## Canon additions log (approved by Claude 4)

Names and facts introduced while writing content. They are canon now; check here before inventing new ones.

| Added in | Canon |
|---|---|
| Act I codex | King Cuthbert (Haldmarch, r. ~960 YL); Godwin of the Fen (Varn's 702 YL grantee); Merewyn Ashby (Haldford physician); Harrowfield (Osric Harrow's seat) and the *Ballad of the Northern Pass*; the *Proclamation of the Snuffing* (1041 YL); the "Haldish Apostasy" (the Solenni name for the War of the Two Lanterns); Edric took Haldren Keep in 868 YL; Drowned Tongue word *aa'mhuun* ("to dream of" or "to swallow") |
| Act I dialogue | Ysolde read in the Grey Monks' library for a month in 1180 YL; Tanners' Steps and Ashby Ford (Haldren districts); Aldwin Varn's wife Merewyn and daughter Elfreda |
| Books | Hierophant Caius III (r. 1041 YL); Magister Lucan de Vaumont (998 YL); Wenna Fennick (Wat's grandmother, author of the *Hearthwarden's Almanac*); Brother Ithel; Prior Aldo of the Ossuary (410 YL); the smack *Saela's Cup* and its master N. Sorrel; clerk J. Pole of the Salt Exchange; the Gull Rocks off Brackhaven; Varn's knightly oath "the water shall not pass us" |
| Fixes | The player lodges with the Hollises at Hollis cottage (prologue opening) |
| Act II codex | Hierophant Ilaria I (Wick-Edict, c. 450 YL); Legate Aurelius Castellane (Concord, 302 YL); Ragna the Far-Steering (founded Skelvik); Hrolf Frostbeard (Sigrun's father, the jarl of the *Ballad*); Ulfar (Sigrun's husband, lost through Skelvikfjord ice); Ashen Kings Haddar, Nasrin, Tariq the Drake-King (27 kings before Ozrah); Vesper given to the Abbey of Saint Sabine at Aurenac at five, burned it at 23; Vellane a vintner's son whose village a hedge-mage burned; Aurelian IV broke the undercroft seal and read the 1041 Warden chests; the Seven Hierarchs elect the Hierophant; Solenne's seven terraces; the cathedral's Ithren Door, Great Lantern and Font of Saint Solenne; Saint Solenne's last words "Someone ought to stay with it"; the Orrun copy of the Concord's extra article; the 1181 page cut from Korrath's oath-ledger; the Tenth Nail; heartstone forms as the fire cools; twelve Hrothi clans and the Ember called "Calun's Eye"; the Young Moot; forty Qasiri clans; the Kings' Stair behind the Glass Throne; Vellane gathering the last Brand-lit lanterns at Valcastre (Iron Lantern hint) |
| Act II quests | Hale is warden of Valcastre's lower cells; Moll Fenner (captain of the *Gannet*); Hask (Kestrel's champion) |
