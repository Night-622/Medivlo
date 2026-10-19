/**
 * Start areas of the 12 school realms: zone and lair names/themes are Claude 4's canon
 * (generated from docs/lore/hollow-crown/02-realms.md; regenerate when it changes).
 */
import type { AreaDef } from '@/world/hc/types';

export const AREAS: AreaDef[] = [
  {
    id: 'area:ash-capital', school: 'ash', side: 'capital', title: "Kilnhold", className: "Arcanist",
    zones: [
      { name: "Kiln Ward", theme: "lower streets of soot-brick and chimney-pots; permit queues, glowing gutters" },
      { name: "Glassblowers' Row", theme: "bright workshops, a coloured-glass market, apprentices with singed eyebrows" },
      { name: "the Smoke Terraces", theme: "stepped rooftops wreathed in smoke; Conclave towers and the old observatories" },
      { name: "the Kiln Roots", theme: "flues and tunnels under the city that feed the Great Kiln; Lava Slimes and Kiln Golems" },
    ],
    lairs: [
      { name: "the Zealots' Furnace", theme: "a chapel turned furnace, run by the Ashen Zealot" },
      { name: "the Glass Archive", theme: "a burning library, held by the Ledger Flame: a fire-spirit made of thirty years of burned records" },
      { name: "the Heart of the Kiln", theme: "the Great Kiln's core, where the Kiln half-stone glows; nemesis I" },
    ],
  },
  {
    id: 'area:ash-frontier', school: 'ash', side: 'frontier', title: "the Bleeding Fields", className: "Reaver",
    zones: [
      { name: "the Red Muster", theme: "Reaver war-camp of hide tents, forge-fires and wagers" },
      { name: "the Bleeding Fields", theme: "cracked black lava flats with red veins; Magma Hounds hunting in packs" },
      { name: "Bone Ridge", theme: "the old Schools' War battlefield; rusted banners and hollow-touched dead" },
      { name: "the Drakeholt", theme: "cliffs and roosts above the Fields; cinder winds" },
    ],
    lairs: [
      { name: "the Drake Roost", theme: "the Cinder Drake's nest on the highest crag" },
      { name: "the Brand-Pits", theme: "Magma Hound dens around the Brand-Mother, a hound matriarch the size of a house" },
      { name: "the Old Battle-Kiln", theme: "a war-kiln from the Schools' War, holding the Field half-stone; nemesis I" },
    ],
  },
  {
    id: 'area:rime-capital', school: 'rime', side: 'capital', title: "Glacierhome", className: "Rimecaller",
    zones: [
      { name: "the Spire Stair", theme: "city streets spiralling up the glacier; people frozen mid-step, a few who aren't" },
      { name: "the Hall of Held Hours", theme: "the great archive; clocks all stopped at the same minute" },
      { name: "the Frozen Market", theme: "a market held still mid-bargain; ice-glass stalls, a thief caught mid-snatch for thirty years" },
      { name: "the Undercrypt", theme: "meltwater tunnels beneath the glacier, where the hold is failing; Frost Wraiths" },
    ],
    lairs: [
      { name: "the Melt Cisterns", theme: "the city's flooded reservoir, home of the Glacier Blob" },
      { name: "the Mirror Gallery", theme: "a hall of ice mirrors, held by the Still Reflection: your own frozen double" },
      { name: "the Crown of the Spire", theme: "the top of the Ice Spire and the source of the held hour; nemesis I" },
    ],
  },
  {
    id: 'area:rime-frontier', school: 'rime', side: 'frontier', title: "the Wardwall", className: "Warden",
    zones: [
      { name: "the Wardwall Gatehouse", theme: "the Warden fortress-town on the wall; drill yards, frost forges" },
      { name: "the Long Rampart", theme: "the top of the wall, miles long; watch-fires going out one by one" },
      { name: "the Wolfrun Passes", theme: "narrow white passes below the wall; Snow Wolf packs" },
      { name: "the Jarlsfell", theme: "the outlands beyond the wall: frozen steadings, starving clans" },
    ],
    lairs: [
      { name: "the Jarl's Longhall", theme: "the Frostbound Jarl's hall in the Jarlsfell" },
      { name: "the Wraith Barrows", theme: "Warden burial mounds, held by the Hundredth Warden: the wall's founder, hollow and still on watch" },
      { name: "the Breach", theme: "the broken section of the Wardwall, holding the Wall half-stone; nemesis I" },
    ],
  },
  {
    id: 'area:storm-capital', school: 'storm', side: 'capital', title: "Spirehold", className: "Sparkwright",
    zones: [
      { name: "Coil Street", theme: "workshops and sparks; explosions on the hour" },
      { name: "the Copper Spires", theme: "the forest of failed towers, some still standing, some leaning" },
      { name: "the Dynamo Halls", theme: "great wheel-halls that power the city; Coil Sentries gone haywire" },
      { name: "the Tower Foundations", theme: "under the Lightning Tower: copper roots, static, Static Wisps" },
    ],
    lairs: [
      { name: "the Witch's Belfry", theme: "an abandoned bell-tower the Tempest Witch rings to call the storm" },
      { name: "the Grand Patent Vault", theme: "the guild's vault of forbidden inventions, held by the Perpetual Engine Mk. XII, which has refused to stop" },
      { name: "the Tower Crown", theme: "the top of the Lightning Tower, holding the Tower half-stone; nemesis I" },
    ],
  },
  {
    id: 'area:storm-frontier', school: 'storm', side: 'frontier', title: "the Thunderclap Heights", className: "Stormlancer",
    zones: [
      { name: "the Ram Pastures", theme: "clan steadings and Storm Ram herds; wind-chimes everywhere" },
      { name: "the Thunderclap Heights", theme: "open cliff-top plains under the storm; lightning strikes in patterns you can learn" },
      { name: "Skyfall Gorge", theme: "a deep gorge of fallen rocks and fallen Thunderbirds" },
      { name: "the Eyrie Steps", theme: "cliff stairs up to the Thunderbird nests" },
    ],
    lairs: [
      { name: "the Ram King's Crag", theme: "the Storm Ram's crag, where the herd-king fights for the herd" },
      { name: "the Thunderbird Aerie", theme: "the nest of Old Clatterwing, a hollowed Thunderbird matriarch" },
      { name: "the Eye of the Storm", theme: "the still, silent centre of the storm, holding the Eye half-stone; nemesis I" },
    ],
  },
  {
    id: 'area:radiance-capital', school: 'radiance', side: 'capital', title: "Dawnspire", className: "Cantor",
    zones: [
      { name: "Cathedral Close", theme: "white stone squares, pilgrims, the Brightwatch on every corner" },
      { name: "the Choir Cloisters", theme: "singing halls and gardens; exhausted novices nodding off mid-hymn" },
      { name: "the Sunward Market", theme: "the market that never closes; a black trade in sleep-draughts" },
      { name: "the Undercroft", theme: "the only dark place in Dawnspire, where the forbidden night is kept in jars" },
    ],
    lairs: [
      { name: "the Bell Loft", theme: "the Cathedral's great bell, guarded by the Seraph of the Last Light" },
      { name: "the Reliquary of Hours", theme: "a vault of relics, held by the Saint Who Wasn't: a relic-golem built of false saints' bones" },
      { name: "the High Altar", theme: "the heart of the Sun Cathedral, holding the Altar half-stone; nemesis I" },
    ],
  },
  {
    id: 'area:radiance-frontier', school: 'radiance', side: 'frontier', title: "the Gilded March", className: "Oathbound",
    zones: [
      { name: "Oathkeep", theme: "the Oathbound's border fortress; oath-stones, a training yard, a hall of broken swords" },
      { name: "the Sunfields", theme: "golden wheat border country; villages that have never seen a star" },
      { name: "the Gilded March", theme: "the border road with its golden waymarks, Gilded Lions roaming" },
      { name: "the Dimming", theme: "where the light fails: the first night in thirty years, and terrified villagers" },
    ],
    lairs: [
      { name: "the Lion's Gate", theme: "an old gatehouse, den of the Gilded Lion" },
      { name: "the Forsworn Chapel", theme: "a ruined Oathbound chapel, held by Ser Gallant the Forsworn, a knight who broke his oath and cannot die" },
      { name: "the Dimming Shrine", theme: "the shrine at the centre of the Dimming, holding the March half-stone; nemesis I" },
    ],
  },
  {
    id: 'area:umbral-capital', school: 'umbral', side: 'capital', title: "Duskmere", className: "Duskweaver",
    zones: [
      { name: "the Lanternless Streets", theme: "a city lit only by the moon; quiet, courteous, forgetful people" },
      { name: "the Memory Gardens", theme: "gardens where memories grow as pale flowers; some wilting" },
      { name: "Obelisk Plaza", theme: "the great square around the Moon Obelisk; queues of people waiting to remember" },
      { name: "the Archive of Shadows", theme: "stacks of bottled shadows, now spilling; Shade Wisps" },
    ],
    lairs: [
      { name: "the Cult Undercroft", theme: "the Duskblade Cult's den beneath a forgotten temple" },
      { name: "the Hall of Lost Names", theme: "a hall papered in forgotten names, held by the Unremembered: a creature made of everyone Nocturne forgot" },
      { name: "the Obelisk's Shadow", theme: "the shadow-side of the Moon Obelisk, holding the Obelisk half-stone; nemesis I" },
    ],
  },
  {
    id: 'area:umbral-frontier', school: 'umbral', side: 'frontier', title: "the Veilwarrens", className: "Shade",
    zones: [
      { name: "the Veilwarrens", theme: "a slum-maze of tunnels and rope bridges, home of the Veil" },
      { name: "the Webbed Deeps", theme: "lower tunnels full of Night Spiders and silk" },
      { name: "the Moonwell", theme: "an open shaft where the moon is seen from below; the warrens' only market" },
      { name: "the Stalker Moors", theme: "purple moorland above the warrens, where Moon Stalkers hunt" },
    ],
    lairs: [
      { name: "the Stalker's Den", theme: "the Moon Stalker's hollow on the moor" },
      { name: "the Brood Spire", theme: "a silk tower, home of Mother Hushweb, a vast Night Spider who eats sound" },
      { name: "the Veil Heart", theme: "the deepest chamber of the warrens, holding the Veil half-stone; nemesis I" },
    ],
  },
  {
    id: 'area:verdant-capital', school: 'verdant', side: 'capital', title: "Rootholme", className: "Hedgewitch",
    zones: [
      { name: "the Bough Markets", theme: "markets on the great boughs; swinging bridges, lanterns, too many cats" },
      { name: "the Sap Wells", theme: "where the tree's sap is tapped; sticky, sweet, dangerous" },
      { name: "the Root Cellars", theme: "the city's lower hollows, being swallowed by new growth" },
      { name: "the Canopy Hollows", theme: "the high crown of the tree, bright and windy; Briarlings" },
    ],
    lairs: [
      { name: "the Spore Cellar", theme: "a mushroom cellar where the Ancient Puffcap has grown enormous" },
      { name: "the Seed Vault", theme: "the Circle's seed store, held by the Gardener: a topiary giant still pruning a garden no one wants" },
      { name: "the Heartwood", theme: "the living heart of the Elder Tree, holding the Heartwood half-stone; nemesis I" },
    ],
  },
  {
    id: 'area:verdant-frontier', school: 'verdant', side: 'frontier', title: "the Thornwilds", className: "Ranger",
    zones: [
      { name: "Wayfarer's Rest", theme: "the Rangers' tree-camp at the edge of the wilds" },
      { name: "the Thornwilds", theme: "dense bramble forest; trails that move overnight" },
      { name: "the Bloomfen", theme: "a flowering marsh; Bloomtraps disguised as lilies" },
      { name: "the Rotwood", theme: "grey, blighted forest where the tears soaked in" },
    ],
    lairs: [
      { name: "Mossback Wallow", theme: "the Mossback Boar's mud wallow" },
      { name: "the Beetle Mound", theme: "a giant mound ruled by the Carapace Queen, a Thorn Beetle as big as a cart" },
      { name: "the Rotting Glade", theme: "the dead glade at the Rotwood's heart, holding the Rot half-stone; nemesis I" },
    ],
  },
  {
    id: 'area:blade-capital', school: 'blade', side: 'capital', title: "Edgewater", className: "Swordsman",
    zones: [
      { name: "the Fencing Quarter", theme: "bright streets of salles and challenges; the Ladder board in the square" },
      { name: "the Duelling Bridges", theme: "river bridges where every crossing is a challenge" },
      { name: "the Riverside Salles", theme: "grand old fencing schools on the river, some abandoned" },
      { name: "the Old Armoury", theme: "the city's ancient armoury, crawling with Training Automatons" },
    ],
    lairs: [
      { name: "the Saint's Tomb", theme: "the crypt of the Sword Saint, who has not stopped duelling" },
      { name: "the Grand Salle", theme: "the oldest salle, held by the Perfect Parry: a fencing automaton that has never been touched" },
      { name: "the Fencing Hall", theme: "the realm's landmark, holding the Hall half-stone; nemesis I" },
    ],
  },
  {
    id: 'area:blade-frontier', school: 'blade', side: 'frontier', title: "the Hushpine Terraces", className: "Samurai",
    zones: [
      { name: "the Hushpine Temple Road", theme: "a silent pilgrim road through pines; speaking aloud is rude" },
      { name: "the Hushpine Terraces", theme: "stepped tea-gardens and dojo yards on the hillside" },
      { name: "the Ronin Camps", theme: "a lawless valley of mercenary camps" },
      { name: "the Bamboo Shallows", theme: "flooded bamboo groves; Blade Dancers in the mist" },
    ],
    lairs: [
      { name: "the Ronin Fort", theme: "the Ronin Captain's stockade" },
      { name: "the Shrine of the Sheathed Blade", theme: "a sealed shrine, held by the Unsheathed: a cursed sword-spirit that has never been put away" },
      { name: "the High Terrace", theme: "the top terrace and its shrine, holding the Terrace half-stone; nemesis I" },
    ],
  },
  {
    id: 'area:iron-capital', school: 'iron', side: 'capital', title: "Anvilgate", className: "Knight",
    zones: [
      { name: "the Anvilgate Wards", theme: "walls within walls; gate-tolls between every street" },
      { name: "the Tilt Yard", theme: "jousting lists, squires, heraldry, a great deal of shouting" },
      { name: "the Fortress Forge", theme: "the vast forge-halls building the Colossus; sparks and slag" },
      { name: "Berenika's Wall", theme: "the \"Wall of Shame\" built after the Hollowing, now cracking; Iron Sentries" },
    ],
    lairs: [
      { name: "the Barrow of Knights", theme: "crypts of the Order, where the Iron Revenant still keeps vigil" },
      { name: "the Heraldry Vault", theme: "the vault of the realm's arms, held by the Blank Shield: a living suit of armour with no heraldry and no name" },
      { name: "the Forge Throne", theme: "the Regency's throne in the heart of the Forge, holding the Forge half-stone; nemesis I" },
    ],
  },
  {
    id: 'area:iron-frontier', school: 'iron', side: 'frontier', title: "the Deepworks", className: "Juggernaut",
    zones: [
      { name: "Rivet Town", theme: "a mining town of iron shacks, steam and shift-whistles" },
      { name: "the Deepworks", theme: "mine shafts and rail-carts; Rivet Golems at work" },
      { name: "the Slag Rivers", theme: "glowing slag-runs and crane bridges" },
      { name: "the Scrapfields", theme: "mountains of discarded machinery; Scrap Beetles" },
    ],
    lairs: [
      { name: "the Warden Foundry", theme: "an old foundry where the Forge Warden still turns out sentries" },
      { name: "the Scrap Hive", theme: "a beetle hive in the scrap, ruled by the Beetle King, armoured in thirty years of junk" },
      { name: "the Hollow Lode", theme: "the deepest seam, where hollow iron is mined, holding the Lode half-stone; nemesis I" },
    ],
  },
  {
    id: 'area:fist-capital', school: 'fist', side: 'capital', title: "Stonecloister", className: "Monk",
    zones: [
      { name: "the Thousand Stairs", theme: "the stair-city; prayer flags, tea stalls on every landing" },
      { name: "the Prayer Terraces", theme: "terraced training grounds; Mountain Goats with no respect for meditation" },
      { name: "the Bell Courts", theme: "the monastery courts and the great bell; half the cells empty" },
      { name: "the Cloud Kitchen", theme: "the mountaintop kitchens above the clouds, overrun by Stone Slimes" },
    ],
    lairs: [
      { name: "the Guardian Hall", theme: "the hall of the Temple Guardian, who will let no one pass unworthy" },
      { name: "the Silent Cell", theme: "the cell of the Ninefold Abbot, a monk who meditated so hard he split into nine" },
      { name: "the Summit Shrine", theme: "the shrine at the peak, holding the Summit half-stone; nemesis I" },
    ],
  },
  {
    id: 'area:fist-frontier', school: 'fist', side: 'frontier', title: "the Lowfold Pits", className: "Brawler",
    zones: [
      { name: "Knuckletown", theme: "the valley fight-town; bunting, bookies and bruises" },
      { name: "the Lowfold Pits", theme: "the fighting pits themselves, from village rings to the grand arena" },
      { name: "the Goat Paths", theme: "mountain trails between valleys; smugglers and goats" },
      { name: "the Quarry Rings", theme: "abandoned quarries turned into outlaw rings" },
    ],
    lairs: [
      { name: "the Broken Fist Dojo", theme: "the dojo of the Master of the Broken Fist, a disgraced master" },
      { name: "the Grand Pit", theme: "the champion's arena, held by Big Mother Ox, unbeaten for nineteen years" },
      { name: "the Quarry Throne", theme: "the outlaw promoter's seat in the deepest quarry, holding the Pit half-stone; nemesis I" },
    ],
  },
  {
    id: 'area:hunt-capital', school: 'hunt', side: 'capital', title: "Antlerford", className: "Huntsman",
    zones: [
      { name: "the Lodge Yards", theme: "the town round the Great Lodge; kennels, smokehouses, bragging" },
      { name: "the Tannery Lanes", theme: "the leather quarter, pungent, with a black market in tear-stained pelts" },
      { name: "the Elkway", theme: "the old herd road through the forest, now empty" },
      { name: "the Old Snares", theme: "the deep forest, strung with poachers' traps; Giant Ticks" },
    ],
    lairs: [
      { name: "the Poachers' Camp", theme: "the Poacher Chief's camp" },
      { name: "the Tick Hollows", theme: "a rotten hollow, home of the Swollen Queen, a tick fat on hollow blood" },
      { name: "the Trophy Hall", theme: "a baron's trophy hall, holding the Lodge half-stone; nemesis I" },
    ],
  },
  {
    id: 'area:hunt-frontier', school: 'hunt', side: 'frontier', title: "the Hawkmoor", className: "Falconer",
    zones: [
      { name: "the Mews Cliffs", theme: "the Falconers' cliff village of perches and jesses" },
      { name: "the Hawkmoor", theme: "open moorland under huge skies; Hunting Hawks" },
      { name: "the Windscour Plain", theme: "the flat plain where the herds once ran; bones and silence" },
      { name: "the Featherfall", theme: "a valley where hollowed birds fall from the sky" },
    ],
    lairs: [
      { name: "the Bear Cave", theme: "the Alpha Bear's den" },
      { name: "the Hollow Eyrie", theme: "the nest of Grandmother Talon, the eldest great hawk, hollowed" },
      { name: "the Moor's Crown", theme: "a stone ring on the highest hill, holding the Moor half-stone; nemesis I" },
    ],
  },
  {
    id: 'area:guile-capital', school: 'guile', side: 'capital', title: "Velvet Harbour", className: "Jester",
    zones: [
      { name: "the Velvet Docks", theme: "rose-pink harbour streets, pickpockets, gulls with criminal records" },
      { name: "the Masquerade Quarter", theme: "a district permanently in carnival; everyone masked" },
      { name: "the Exchange Floor", theme: "the Thieves' Exchange, where anything is traded, including promises" },
      { name: "the Crooked Stairs", theme: "the twisted old town; Mimic Slimes posing as treasure" },
    ],
    lairs: [
      { name: "the Phantom Theatre", theme: "an abandoned theatre haunted by the Masked Phantom" },
      { name: "the Counting House", theme: "the royal treasury, held by the Auditor, a ledger-golem that collects every debt, with interest" },
      { name: "the Velvet Court", theme: "the King's court, holding the Court half-stone; nemesis I" },
    ],
  },
  {
    id: 'area:guile-frontier', school: 'guile', side: 'frontier', title: "Gallows Reef", className: "Corsair",
    zones: [
      { name: "the Brine Market", theme: "a floating market of lashed-together ships" },
      { name: "Gallows Reef", theme: "the reef islands and their gibbets, home port of the Brine Fleet" },
      { name: "the Wreckers' Coves", theme: "sea-caves where wreckers lure ships with lanterns" },
      { name: "the Crow Islands", theme: "rocky isles thick with Thief Crows and pirate hoards" },
    ],
    lairs: [
      { name: "Vex's Guildhold", theme: "Guildmaster Vex's sea-fort" },
      { name: "the Wreck of the Merry Widow", theme: "a ghost ship held by Captain Nobody, who signed away his name" },
      { name: "the Gallows", theme: "the great gibbet-rock at the reef's heart, holding the Reef half-stone; nemesis I" },
    ],
  },
  {
    id: 'area:song-capital', school: 'song', side: 'capital', title: "Lyrehaven", className: "Bard",
    zones: [
      { name: "the Opera Quarter", theme: "grand lilac streets around the silent Opera; buskers with no tunes left" },
      { name: "the Busking Steps", theme: "the stair-streets where music is still allowed; a turf war over the last good songs" },
      { name: "the Conservatory", theme: "the music school, its practice rooms going quiet" },
      { name: "the Prompter's Cellars", theme: "the tunnels beneath the Opera; Siren Wisps" },
    ],
    lairs: [
      { name: "the Choir Loft", theme: "the Opera's loft, haunted by the Choir Phantom" },
      { name: "the Grand Organ", theme: "the organ-hall, held by the Organ That Ate a Choir" },
      { name: "the Opera Stage", theme: "the great stage of the Grand Opera, holding the Opera half-stone; nemesis I" },
    ],
  },
  {
    id: 'area:song-frontier', school: 'song', side: 'frontier', title: "the Echoing Fells", className: "Skald",
    zones: [
      { name: "the Drum-Steads", theme: "the Skalds' hill-farms, where news is drummed valley to valley" },
      { name: "the Echoing Fells", theme: "lilac fells where shouted words come back changed" },
      { name: "the Saga Stones", theme: "standing stones carved with sagas; some being worn blank" },
      { name: "the Harpy Cliffs", theme: "sea-cliffs of Songbird Harpies" },
    ],
    lairs: [
      { name: "the Discordant Hall", theme: "a mead-hall taken by the Discord Bard" },
      { name: "the Harpy Roost", theme: "the roost of Shriek-Mother, the eldest harpy" },
      { name: "the Echo Barrow", theme: "the barrow of the first Skald, holding the Fell half-stone; nemesis I" },
    ],
  },
];
