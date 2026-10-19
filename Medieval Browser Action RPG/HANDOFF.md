# Medival · Phase 1 handoff

Target: Phaser 3, 1280×720 logical canvas, `pixelArt: true`, `roundPixels: true`, `scale.mode: FIT`, `autoCenter: CENTER_BOTH`.

## Files
- `medival-tokens.json`: colours, type scale, spacing, motion, 9-slice sources and per-component sizes.
- `assets/atlas.json`: every sheet, its frame size, frame order and animations.
- `assets/ui/*.png`: 9-slice textures. Most are 24×24 with an 8px slice; `bar` is 12×12 with a 4px slice. Load them with `this.add.nineslice(x, y, key, null, w, h, 8, 8, 8, 8)`.
- `assets/sprites/char_*.png`: humanoids are 32×40 and beasts 36×24. Frames are `[idle0, idle1, walkA, pass, walkB, pass]`. Pivot is the bottom centre: `setOrigin(0.5, 38/40)`.
- `assets/sprites/icons_items.png` (32×32, 8 columns), `icons_schools.png` (24×24), `icon_coin.png` (16×16), `tiles.png` (32×32, 6 columns).
- `assets/sprites/props/*.png`: single images. Use `setOrigin(0.5, 1)` and depth = `y + height - 4`.
- `art.js`: the source of every pixel. Characters are string grids with per-layer auto-outline. Icons, tiles and props are drawn as code. To re-export after an edit, run its `frames()` and `nine()` functions.

## Rules the build must keep
1. The world is drawn at 1× only. UI art may use integer 2×, 3× or 4× (hotbar glyphs, tooltip icons, portrait, hero preview). Never use fractional scales.
2. The HUD stays out of the centre safe rect `{x:320, y:140, w:640, h:420}`. HUD margins are 16px.
3. Lighting is drawn in this order: world → full-screen rect in `light.gradeDusk` with `BlendModes.MULTIPLY` → radial glow sprites with `BlendModes.ADD` → damage numbers and enemy bars. No blur or postFX.
4. Damage numbers are text in Jersey 10 with a 2px `#1a1230` stroke. Tween the scale 1.7 → 1 over 120ms, rise 34px/s and fade over the last 300ms of a 900ms life. Crits are 32px `#ffd23f` with “!”.
5. Fonts load from Google Fonts (Jersey 10, Pixelify Sans). Wait for `document.fonts.ready` before creating Text. For crisp text when the canvas scales, bake BitmapFonts at the type-scale sizes.

## Screen layout (1280×720)
- **HUD**
  - Portrait frame: 80×80 at (16, 16).
  - Name and bars start at x 108: name at y 14, HP 260×20 at y 48, Ember 260×14 at y 74, stamina 190×8 at y 94.
  - Minimap: 216×140 at the top-right (inset 16). Quest tracker: 260 wide at y 192. Toasts: x −16, y 300.
  - Hotbar: 7 slots of 60×60 with an 8px gap, centred, bottom 40. The XP bar (440×8) sits below it at bottom 12.
  - Loot feed: bottom-left (16, −24). Menu buttons: 5 × 44 at the bottom-right.
- **Inventory**
  - Background: dim `rgba(13,18,38,.8)` over the paused world.
  - Tabs: 150×44, centred at y 20. Close button: 44×44 at (1188, 20).
  - Character panel: 400×604 at (48, 84). Equip slots are 56×56 in columns at x 72 and x 368, rows at y 168, 240, 312 and 384. The hero is shown at 3× at (200, 196).
  - Pack panel: 760×604 at (472, 84). The grid has 11×6 slots of 56 with an 8px gap, starting at (504, 156).
  - Tooltip: 268 wide, anchored to the right of the slot and flipping left when there's no room.
- **Title**
  - Logo: `wordmark('MEDIVAL')` from art.js at 4×, centred at y 44. The tagline is 30px Jersey with 6px letter-spacing.
  - Menu: 340 wide at (80, 320). Items are 52 tall, or 64 with a subline, with a 6px gap.

## Heroes and appearance
- There are 24 classes in 12 schools (two classes per school), and every class has a female and a male version.
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
- Every hero shares one head base. The player picks a body (Female or Male), skin (5), hair style (7), hair colour (8), eye style (5), eye colour (6), expression (4) and face mark (6, including Stubble and Beard). Each class has a default look: six female and six male.
- Female faces have 1px lashes, lip colour and blush. Male bodies are wider: rows 21–35 gain 1px on each side, and the shoulders (rows 21–26) another 1px, so the torso tapers into a V and robes flare less. Male faces have a wider jaw, 4px brows drawn over the fringe, a nose shadow and no blush. Switching to Male turns Long, Bob and Braids into Tousled; switching to Female removes Stubble and Beard.
- A hero is composited from layers in a fixed order (see `atlas.json → heroComposer.layerOrder`). Headgear and weapons are outlined separately, so they always read against hair and clothing.
- Each class owns one silhouette feature:
  - Warden: tower shield and fin crest
  - Rimecaller: shard crown
  - Ranger: tall bow and quiver
  - Hedgewitch: antler twigs and lantern crook
  - Arcanist: bent hat with lantern
  - Reaver: greataxe over the head
  - Stormlancer: lance and swept plume
  - Sparkwright: tesla antenna
  - Oathbound: winged helm
  - Cantor: halo and censer
  - Shade: peaked hood and scarf trail
  - Duskweaver: black crescent
  - Swordsman: upright longsword
  - Samurai: straw hat and lacquered shoulder plates
  - Knight: great helm and heraldic kite shield
  - Juggernaut: spiked pauldrons and maul
  - Monk: bo staff across the shoulders
  - Brawler: big gloves
  - Huntsman: fur cap and crossbow
  - Falconer: hawk on a raised fist
  - Corsair: bicorne and cutlass
  - Jester: forked belled hat
  - Bard: lute and plumed beret
  - Skald: war-drum ring and horned helm
- Bake one 6-frame sheet per saved character at character creation. Default-look sheets are in `assets/sprites/char_<class>.png`.

## NPCs
- 14 NPCs are built with the same composer as the heroes, in three groups:
  - Story: Maren Hollis, Elder Godric, Nan Briar, Brother Aldous, Captain Rook Harrow, Ysolde Fenn
  - Trade: Odo Vance, Wil Crane, Pell Odd, Corwin Hale, Sela Moth
  - Villagers: Tamsin Reed, Old Hobb, Pip Sheets are in `assets/sprites/npc_<id>.png`.
- **NPCs screen** (People of Brindlecross):
  - Filter tabs (Everyone, Story, Trade, Villagers): 140×36 at (48, 92).
  - Card grid: scrolls inside 728×552 at (48, 136). It has 4 columns of 172×196 cards with a 10px gap.
  - Card contents: sprite at 2×, name in 22px Jersey, role, place with school glyph, and 5 trust diamonds. A gold "!" badge marks an NPC with an active quest.
  - Detail panel: 440×592 at (792, 96). It holds the sprite at 4×, a speech bubble (#fbf6e9 on ink with a 4px drop), place and quest rows, service chips, lore, and Talk / Show on map buttons (48 tall).
  - Trust labels: Stranger, Wary, Neutral, Friendly, Trusted, Devoted.

## Tiles & buildings v2 (tiles.js)
- Sheets live in `assets/tiles/`:
  - Village: 12 plain tiles, plus a path and a water autotile set (16 tiles each).
  - Gloamwood: 5 plain tiles and a path autotile.
  - Abbey: 9 plain tiles and a flood autotile.
- Autotile index = TL·8 + TR·4 + BL·2 + BR, where 1 means that corner is inside terrain. Paint on a corner grid offset by half a tile.
- Buildings are in `assets/buildings/`, 19 in total, each with a `category` in atlas.json:
  - Homes: townhouse, stone house, row houses
  - Trade: inn, pub, tea room, bakery, stables, stall
  - Craft: smithy, mill, alchemist, nursery
  - Civic: chapel, training hall
  - Castle: wall (tiles every 64px), tower, gatehouse, keep
- Each building has its origin at (0.5, 1) and light points in `atlas.buildings[*].lights` (offset x, offset y, radius).
- Props are in `assets/props_v2/`:
  - 15 village props, including the well, lamp, waystone, cart, fences and hedge.
  - 11 Gloamwood props, including the gloam tree, ruin arch, rune stone and glowing mushrooms.
  - 12 Abbey props, including the arch, pillar, sunken bell, altar, crystal, sconce and both chests.
- The live village in Screens now uses the v2 buildings and the autotiled paths. Light pools come from each prop's `lights` list.

## Gear & outfits (gear.js)
- **Weapons:** 64, as 8 types (sword, axe, mace, spear, bow, staff, dagger, wand) in 8 materials (wood, iron, steel, ember, rime, storm, umbral, sparkforged). The sheet is `assets/gear/weapons.png`: rows are types, columns are materials. Every weapon also has a held version drawn in the right hand. The bow is held in the left.
- **Armour:** 96 sets (12 schools × 8 styles: cloth, leather, fur, mail, robe, scale, plate, vestment), with 4 pieces each, so 384 pieces. The sheet is `assets/gear/armour.png`: one row per set.
  - Rarity follows the style, from cloth (Common) up to vestment (Sparkforged).
  - **2 pieces:** a stat bonus that comes from the style.
  - **4 pieces:** an ability. The style decides when it triggers and the school decides what it does.
  - **Attuned:** a third bonus when the wearer's class belongs to the same school.
  - All of this text is in `atlas.gear.armour.sets`.
- **Items:** 64, in 8 categories (potions, food, scrolls, gems, materials, trinkets, tools, relics). The sheet is `assets/gear/items.png`.
- **Paperdoll:** what you equip changes how the hero looks, following the rules in `atlas.heroComposer.equipRules`.
  - To build a character, bake its 6 frames with `MV.frames(name)`, using the name format in `atlas.heroComposer.nameFormat`.
  - Re-bake whenever equipment changes.
- **Outfits:** every class has 4 dye colours (hue shifts on the class outfit) and 3 headwear options (class, none, plus a hood, circlet or bandana that depends on the class).
  - Accessory slots are back, neck, face and extra, and each class has its own allowed list (`MV.GEAR.kitOf(class)`).
- **Faces:** there are now 12 eye styles and 12 brow styles.

## Bestiary (bestiary.js)
- 30 enemies, 22 mini-bosses and 12 bosses, built from 9 body types: quad, slime, skeleton, humanoid, spirit, flyer, plant, construct and bug.
- Every creature is drawn on the character pixel grid in the hero style: a chibi head, 2×3 eyes with a white glint, blush on the cute ones and angry brows on the hostile ones, 3-tone shading, and the head outlined separately from the body. Humanoid enemies are built with the hero composer itself (`MV.heroFrameX` with a `palX` palette override). Mini-bosses are shown at integer 2× and bosses at 3×. That is a deliberate exception to the 1× rule, so they share the exact construction of the cast.
- Each creature has a 2-frame idle sheet in `assets/bestiary/<id>.png`. `atlas.bestiary` holds its stats, abilities or boss phases, drops and lore.
- Bosses: The White Stag, Abbess Morwen, the Ooze Sovereign, Bonelord Varric, Ashmaw, the Rimeheart Colossus, the Stormcrow, the Weeping Willow, the Spinner Below, the Gilded Engine, the Lantern Queen and the Hollow King.

## Skill tree (phase 2)
- Skills, spells and experience upgrades share one tree screen with three branches. Each branch is a branching tree of 24 nodes that grows upward from a root at the bottom:
  - Root (free) → 3 paths. Each path is: major → minor → minor → major (3 ranks) → a fork of 2 choice nodes, where learning one locks the other.
  - 2 bridge nodes link neighbouring paths at the minor tier.
  - 2 top nodes each need any choice from the two paths below them: school spells in Spells, mutually exclusive keystones in Skills, notables in Upgrades.
  - 1 ultimate or capstone sits at the top.
- Node sizes: root 52, major 56, minor 40, choice 46, top 56, ultimate 60. Connectors are 4px lines drawn from centre to centre. Positions are in `skTree()`.
- The tree is generated per class from its school. 20 points in the prototype, and each branch can be reset.
- Node frames: Spells use the Ember-touched slot, Skills the Runed slot and Upgrades the Fine slot. Maxed nodes use panel_gold, and ultimates and keystones have a gold diamond.

## Quest journal (phase 2)
- Opens with J, the Journal tab, the HUD button, or by clicking the HUD quest tracker.
- Layout:
  - Category tabs (Active, Story, Side, Bounty, Done): 360px wide at (68, 100).
  - Quest list: scrolls inside 368×530 at (64, 146). Each row has the giver's sprite, title, category, level, region and progress, plus a gold diamond on the tracked quest.
  - Detail panel: 760×604 at (472, 84).
- The detail panel shows:
  - the giver at 3× with a glow in the category colour
  - category tag, region and recommended level
  - story text
  - objectives with checkboxes, progress bars for counted steps, and done steps struck through
  - rewards in rarity frames
  - a note
  - Track quest and Show on map buttons
- Category colours: main story #ffc43d, side #7fe3ff, bounty #ff4d5e, completed #6ee06a.
- The HUD quest tracker now follows whichever quest is tracked and shows the next two open objectives. "Drive off the Gloamwood wolves" counts live kills from the village fight.
- 14 quests: 3 main, 7 side, 2 bounties and 2 completed. They tie in the NPCs, mini-bosses and relic items.

## World map (phase 2, map.js)
- The Morvane map is drawn at 432×272 and shown at 2×.
- 11 regions, each a set of polygons with its own biome palette and features: mountains, forest, swamp pools, the Abbey lake, volcanoes, ruins, storm cliffs, marsh lanterns and the Heart.
- The coast gets foam plus a 1px ink outline, and roads and the river Wend are drawn on top.
- **Fog:** `MV.frames('mvfog:<found ids>')` draws one cloud layer per unexplored region (shadow, mid and highlight puffs).
- **Map screen:** 864×544 at (48, 84). The right panel is 304 wide.
  - Click a region to see its level range, explored %, description, creatures from the bestiary and its waystones.
  - Awake waystones travel back to the HUD. Asleep ones only show a message.
  - Markers: the tracked quest is gold, side quests are teal, and the hero sprite shows where you are.
- `MV.WORLD` exposes `REG`, `WS` and `regionAt(x, y)` for hit-testing.

## Map zoom levels: Realms › Morvane › Village
- Breadcrumb tabs at the top-left of the map switch between the three levels. Esc steps back from a village.
- **Realms** (`MV.frames('mvrealm')`): Morvane plus three rumoured realms for later acts: Emberreach, the Sunken Isles and the Hollow Reaches. Locked realms show "???".
- **Morvane:** the region map, now with house markers for the 10 villages. The region panel lists villages with a View button.
- **Village close-ups** (`MV.frames('mvvil:<id>')`, 768×448 at 1× game scale):
  - Each is built from the real tiles, autotiled cross-roads and v2 buildings, with a region tint for snow, ash, marsh or gold.
  - The 10 villages: Brindlecross, Thornhollow, Hollis Lodge, Old Coach Inn, Wardenhold, Kilnmouth, Abbeyshore, Lanternford, Gildport and Cliffstair.
  - `MV.WORLD.vilLayout(v)` returns place boxes for hit-testing and labels.
  - Each place has a label pill (gold diamond if an NPC works there), a highlight box, and a side list with service and NPC. Talk jumps to that NPC in the NPCs screen.

## Realms (realms.js)
- There are 13 realms: one for each school, plus Concordia at the centre.
  - The school realms: Cinderreach (Ash), Frostmere (Rime), Thunderreach (Storm), Solaria (Radiance), Nocturne (Umbral), Wildheart (Verdant), Steelvale (Blade), Ironhold (Iron), Mountainreach (Fist), the Greywilds (Hunt), Tidecourt (Guile) and Harmonia (Song).
  - Concordia is the union of all schools, where the Hollow King's evil lives. It contains the original Morvane map and Brindlecross.
- Each hero begins in the realm of their class's school, shown on the Characters screen and highlighted on the Realms map.
- **Tilesets:** each school realm recolours the base tileset by hue rules (ground, stone, water and roof hue) into its own grass, flowers, cobble, farm, dungeon floor, bridge, water and 16-tile path autotile (`r_<realm>_*`).
- **Buildings:** 8 recoloured buildings (`rb_<realm>_*`) plus one unique landmark (`rl_<realm>`, drawn as a spire, hall, dome, tree or citadel).
- **Capitals:** each school realm has a capital village close-up built from its own tiles.
- **Creatures:** 6 per realm (3 enemies, 2 mini-bosses, 1 boss), so 78 new creatures. They're added to the bestiary through `MV.addBeast`. The bestiary now holds 142 creatures.

## Dialogue, Pause, Death, Settings (phase 2)
- **Dialogue** (F in the HUD, Talk in NPCs or a village close-up):
  - Layout: the NPC at 6× on the left, the hero at 4× on the right, and a box 1152×262 at (64, 430).
  - Name plate on panel_gold with trust diamonds. Text in 17/26 Pixelify, with up to 4 numbered choices on the right.
  - Choice tags: TRUST ±1, QUEST, INSIGHT, and [School] options that only appear for that school (gold frame). The node tree lives in `DLG`.
- **Pause** (Esc in the HUD):
  - Menu: 340 wide, 56px items, with the selected item in gold and an arrow.
  - Side card: the hero, run stats and the tracked quest.
- **Death:**
  - "YOU HAVE FALLEN" in 96px Jersey #ff3d5a with a dark-red vignette.
  - Your hero greyed out next to what killed you (from the bestiary), and 4 stat tiles.
  - Respawn at the waystone, Load, or Quit. The penalty text is shown at the bottom.
- **Settings:**
  - Tabs: Video, Audio, Controls, Gameplay, Accessibility.
  - Row types: sliders in steps of 5 (click to set), option chips on tab art, and keybind chips.
  - Opens from Pause or the Title screen and returns to wherever it was opened from.

## Legendary boss drops (legendary.js)
- Each of the 25 bosses drops one unique Sparkforged item: a weapon, a ring or an amulet. Its icon is the base gear icon with gold and red sparkles.
- Each has a signature effect and lore that names its boss. The list is in `MV.LEGENDARY`, and the Items sheet shows it on the Boss drops tab.

## Phase 2 (not in this delivery)
Still to come: the character sheet (6 classes × 4 directions, NPCs, skeleton knight, swamp slime, White Stag), the full tile and prop sheets for Gloamwood and the Drowned Abbey, All planned screens are now built.
