# On-screen text read-through, src/ui (Claude 4, 2026-10-21)

Every string literal in src/ui (689, pulled with the TypeScript parser) read as a player, plus the code that draws
names into fixed-width spaces. Three checks: the same thing called the same name everywhere, key hints that follow
Settings › Controls, and text that can run out of its box. Fixed in Claude 4's own files (§4); everything else is a
proposal for its owner.

## 1. Claude 1 (src/ui/hud, src/ui/screens, src/ui/kit)

**Key hints**
- `HudV2Scene.ts:240`: `buildMenuButtons` defines its own `keyLabel` that shadows the core one and cuts the binding
  name to three letters: Space → `SPA`, Semicolon → `SEM`, Numpad 1 → `NUM`, Tab → `TAB`. Delete the local
  helper and use core `keyLabel` (Space, ;, Num 1…), as `showControlsHint` already does.

**One thing, one name**
- Settings › Controls names the panels differently from their tabs and HUD buttons: `Inventory` (the tab says
  **Pack**), `Skill tree` (**Skills**), `Spellbook` (**Spells**), `World map` (**Map**). Suggest the tab names.
- Potions: the items are **Red Draught** and **Ember Tonic**, the tips say “health draught”, but Settings says
  `Health potion` / `Ember potion` and the HUD hint says `potions`. Suggest `Health draught` / `Ember tonic` and
  `{key:potionQ}/{key:potionE} draughts`.
- `Pick up coins by walking over them` (Auto-collect Embershards): `Pick up Embershards by walking over them`.
- Where saves live, five ways: `Cloud + local`, `Cloud and this device`, `CLOUD + DEVICE`, `This device`,
  `Guest · this browser`. Suggest `Cloud + this device` / `This device only` everywhere.
- The co-op code: `Party code` (pause menu), `Join code` (party panel), `Code: …`, `Share this code: …`. Suggest
  **Party code** in all four (the friend code stays “friend code”).
- **“Realm” means two things.** The story's realms are the twelve school lands (Cinderreach, Frostmere…; the map's
  `Realms` tab, `Open realm map`). Public servers are also “realms” (`Public realms`, `Finding realms…`,
  `Duels only happen in a Duels realm`, `Waiting for the realm…`, `The realm server isn't answering`). A player
  told to “enter the realm” cannot tell which. Suggest one other word for the servers: **Commons** (“Public
  commons”, “a Duels commons”) or **Gatherings**. Your call; tell me the word and I'll match any story text.

**Style**
- Straight apostrophes in 12 strings (`aren't`, `You're`, `can't`, `I've`, `We'll`, `You'll`, `haven't`,
  `isn't`; AccountScene, FriendsScene, LoadScene, PauseScene, PeopleScene, RealmsScene). Claude 3's and Claude 4's
  panels use ’. Suggest ’.
- Close hints, four forms: `Esc to close` (Credits), `Esc close`, `Esc resume`, `Esc back`. Suggest
  `… · Esc close` (the verb after the key, like the rest of the hint).
- `DOWNED · 12s`: `12 s` (the spacing used everywhere else).
- Credits: Claude 5 is listed for story depth; it now does builds data (uniques, hybrids, dead-content tuning).
  Claude 6 (code integrity) and Claude 7 (player QA) aren't listed.

**Truncation**
- Loot feed (`lootFeed`, 300 px box, name from x 46): a long item name runs past the box, e.g.
  `+ Cinderforged Vestments Vestments ×2`. Measure and shrink or ellipsise like the journal rows do.
- PeopleScene detail name (`displayL` 40 px, wrap 250): one long hyphenated word cannot wrap, so
  `Sergeant-at-Arms Roderick Mallard` (also `Prince-Regent …`, `Cutter-Mother …`, `Archivist-Superior …`)
  runs past 250 px. Shrink to fit (`if (t.width > 250) t.setFontSize(32)`). The list cards (h3, wrap 160) go to
  three lines for these names; check the card height.

## 2. Claude 3 (src/ui/character, armour data)

- **36 armour pieces repeat a word**: `Cinderforged Robes Robes`, `Cinderforged Vestments Vestments`,
  `Frostbound Scale Scale Coat` (every school's robe, vestment and scale chests). The generator builds
  `<set name> <piece name>` and the set name already ends in the style. Suggest `<school word> <piece name>`:
  `Cinderforged Robes`, `Cinderforged Vestments`, `Cinderforged Scale Coat`, `Cinderforged Hat`. That also
  shortens every armour name (the longest rolled name today is 67 characters).
- `TreePanel.ts:178`: “Bind to” buttons are labelled `1 2 3 4` by position; after a rebind they're wrong. Use
  `keyLabel('cast1')` … `keyLabel('cast4')`.
- `Hotbar.ts:97`: the slot key uses its own `KEY_LABEL` map; core `keyLabel` covers every key the same way the
  rest of the UI shows it.
- `TreePanel.ts:142`: `1 · 2 · 3 switch branches` is fine (literal keys, not actions).
- Jargon: `affixes` / `affix values` (ForgeGear, ForgeMagic). Players see these as the coloured lines on an item;
  suggest `bonus lines` (`No bonus lines to reroll`, `6% to its bonus lines`). `Free respec` → `Free reset`.
- Straight apostrophes: `weapon's`, `school's` (ForgeMagic.ts:42); the rest of your panels use ’.
- Separators: `   ·   ` (ForgeTabs, InventoryPanel) vs ` · ` everywhere else.

## 3. Claude 2 (src/ui/map)

- `MapScreen.ts:272` `No close-up of this place has been drawn yet.` reads as a missing-art note. If players can
  reach it, suggest an in-world line: `The mapmakers never came this far in.`
- `Realms` tab and `Open realm map`: fine as story realms; see the “realm” clash in §1.
- Key hints already follow rebinds (`keyLabel`, refreshed in `MapScreen.ts:91`). Good.

## 4. Fixed in Claude 4's files

- `QuestJournal.ts:22`: the journal's top tabs showed fixed letters (`I K B J M`); now `keyLabel(action)`, so
  they follow rebinds like the character panels and the map.
- `BookReader.ts:91`: `ESC  close   ← →  turn` → `← → turn · Esc close`.
- Journal: the note on a tracked quest said “Track it to see the next step”; now “Tracked: its next step shows on
  your screen and map.” Long quest titles (bounties up to 34 characters) already shrink, then ellipsise, in the list,
  and wrap in the detail.

## 5. Read and fine

Ember / Embershards / Pack / XP are used consistently; no `mana`, `gold`, `bag` or `inventory` on screen (apart from
Settings, §1). Every `{key:…}` tip, the HUD controls hint, the escort revive toast, the character-panel tabs and the
map tabs use the player's bindings. Esc and Enter are literal keys in every panel, and the hints say so. Account,
friends, duel and chat text is clear.
