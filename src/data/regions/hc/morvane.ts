/**
 * Concordia's Morvane (generated from the handoff's map.js). Region polygons stay in MAP px (432×272);
 * waystones, villages and routes are in WORLD TILES (map px × 4).
 */
import type { MorvaneRegionDef, Polyline, VillageDef, WaystoneDef } from '@/world/hc/types';

export const MORVANE_MAP_W = 432;
export const MORVANE_MAP_H = 272;
/** world tiles per map px */
export const MORVANE_SCALE = 4;

export const MORVANE_REGIONS: MorvaneRegionDef[] = [
  {
    id: 'region:frost', name: "Frostmere Pass", levels: "14–18", colors: [0xe8f0ff, 0xffffff, 0xa9bbd6],
    polys: [[[60,20],[170,14],[190,60],[150,86],[80,80],[40,56]]],
    label: [110, 48], desc: "High, white and quiet. The Wardens hold the pass, and the Rimeheart Colossus holds everything above it.",
  },
  {
    id: 'region:heart', name: "Heart of Morvane", levels: "30+", colors: [0x5a4a7a, 0x7a6a9a, 0x3a2a5a],
    polys: [[[170,14],[262,18],[250,70],[190,60]]],
    label: [216, 38], desc: "Where the black tears began. The Hollow King keeps his throne here.",
  },
  {
    id: 'region:gilded', name: "Gilded Ruins", levels: "20–24", colors: [0xe8c87a, 0xffe8a0, 0xb8904a],
    polys: [[[262,18],[372,26],[400,74],[330,92],[250,70]]],
    label: [322, 52], desc: "A sparkwright city, buried in its own gold. The Gilded Engine still runs.",
  },
  {
    id: 'region:storm', name: "Stormcliffs", levels: "22–26", colors: [0x7a8ab0, 0x9aaad0, 0x4a5a80],
    polys: [[[400,74],[414,150],[372,170],[330,140],[330,92]]],
    label: [372, 118], desc: "Sheer cliffs and constant thunder. The Stormcrow nests at the top.",
  },
  {
    id: 'region:abbey', name: "Drowned Abbey", levels: "10–14", colors: [0x5aa86a, 0x7ac88a, 0x3a8a4a],
    polys: [[[250,70],[330,92],[330,140],[280,150],[236,118]]],
    label: [288, 124], desc: "A lake where the Abbey used to stand. Its bells have started ringing again.",
  },
  {
    id: 'region:gloam', name: "Gloamwood", levels: "6–10", colors: [0x2a8a5a, 0x3fae6a, 0x1a5a3a],
    polys: [[[150,86],[190,60],[250,70],[236,118],[190,140],[140,124]]],
    label: [194, 100], desc: "Old forest, teal and glowing. The wolves come from here, and so does the White Stag.",
  },
  {
    id: 'region:briar', name: "Briar Hollow", levels: "8–12", colors: [0x6a8a3a, 0x8aaa4a, 0x4a6a2a],
    polys: [[[40,56],[80,80],[150,86],[140,124],[96,150],[36,130],[22,90]]],
    label: [86, 108], desc: "Bog, bramble and slime. Nan Briar’s cottage sits on its edge.",
  },
  {
    id: 'region:ash', name: "Ashfall Kiln", levels: "16–20", colors: [0x8a4a3a, 0xb06a4a, 0x4a2a2a],
    polys: [[[36,130],[96,150],[110,196],[70,236],[30,200]]],
    label: [68, 186], desc: "Kilns built around a beast that would not die. Ashmaw still breathes under them.",
  },
  {
    id: 'region:alder', name: "Aldermoor", levels: "1–7", colors: [0x5ccc55, 0x8fe36a, 0x3eae4c],
    polys: [[[96,150],[140,124],[190,140],[208,190],[160,214],[110,196]],[[110,196],[160,214],[208,190],[268,196],[268,250],[200,262],[120,250],[70,236]]],
    label: [152, 170], desc: "Green moor and the village of Brindlecross. Home, for now.",
  },
  {
    id: 'region:road', name: "Morvane Road", levels: "6–9", colors: [0x9ad070, 0xbfe890, 0x6aa850],
    polys: [[[190,140],[236,118],[280,150],[268,196],[208,190]]],
    label: [236, 166], desc: "The old coach road east. Bandits, and Mags the Knife, work it now.",
  },
  {
    id: 'region:marsh', name: "Morvane Marsh", levels: "18–22", colors: [0x4a8a7a, 0x6aaa9a, 0x2a5a5a],
    polys: [[[280,150],[330,140],[372,170],[350,236],[268,250],[268,196]]],
    label: [318, 200], desc: "Lantern lights over black water. Follow them and you will meet the Lantern Queen.",
  },
];

export const MORVANE_WAYSTONES: WaystoneDef[] = [
  { id: 'ws:brind', name: "Brindlecross", space: 'concordia', region: 'region:alder', at: [600, 736], startsLit: true },
  { id: 'ws:road', name: "Old Coach Inn", space: 'concordia', region: 'region:road', at: [960, 712], startsLit: true },
  { id: 'ws:glade', name: "Gloamwood Glade", space: 'concordia', region: 'region:gloam', at: [800, 368] },
  { id: 'ws:stag', name: "Stag’s Rest", space: 'concordia', region: 'region:gloam', at: [680, 472] },
  { id: 'ws:briar', name: "Briar Cottage", space: 'concordia', region: 'region:briar', at: [440, 528] },
  { id: 'ws:abbey', name: 'Abbeyshore', space: 'concordia', region: 'region:abbey', at: [1032, 472] },
  { id: 'ws:frost', name: "Warden’s Gate", space: 'concordia', region: 'region:frost', at: [520, 280] },
  { id: 'ws:kiln', name: "Kiln Gate", space: 'concordia', region: 'region:ash', at: [328, 680] },
  { id: 'ws:marsh', name: "Lantern Ford", space: 'concordia', region: 'region:marsh', at: [1200, 856] },
  { id: 'ws:storm', name: "Cliff Stair", space: 'concordia', region: 'region:storm', at: [1504, 560] },
  { id: 'ws:gild', name: "Gilded Gate", space: 'concordia', region: 'region:gilded', at: [1200, 288] },
];

export const MORVANE_VILLAGES: VillageDef[] = [
  {
    id: 'vil:brind', name: "Brindlecross", space: 'concordia', region: 'region:alder', at: [600, 736], tiles: 'v', places: [
      ["b_inn", "The Gilded Goose", "Rest · Rumours", "wil"],
      ["b_house_stone", "Elder’s House", "Main story", "godric"],
      ["b_smithy", "The Anvil", "Weapons · Armour", "odo"],
      ["b_bakery", "Hearth & Crust", "Food", null],
      ["b_training", "Watch House", "Bounties", "rook"],
      ["b_stall", "Market", "Trade", "pell"],
      ["b_chapel", "Chapel of the Drowned Bell", "Blessings", "aldous"],
      ["b_mill", "Cinderwick Mill", "Materials", "corwin"],
    ],
  },
  {
    id: 'vil:thorn', name: "Thornhollow", space: 'concordia', region: 'region:briar', at: [416, 512], tiles: 'v', tint: [0x6a7a3a, 0.28], places: [
      ["b_alchemist", "Briar Cottage", "Potions · Curses", "nanbriar"],
      ["b_nursery", "Greenbriar Nursery", "Herbs", null],
      ["b_teahouse", "The Briar & Kettle", "Food · Rest", null],
      ["b_house_tall", "Hedge House", "Homes", null],
      ["b_stall", "Herb Stall", "Trade", null],
    ],
  },
  {
    id: 'vil:lodge', name: "Hollis Lodge", space: 'concordia', region: 'region:gloam', at: [736, 512], tiles: 'f', places: [
      ["b_house_stone", "Hunter’s Lodge", "Ranger training", "maren"],
      ["b_stables", "Kennels", "Mounts", null],
      ["b_training", "Archery Yard", "Bounties", null],
      ["b_stall", "Pelt Trader", "Trade", null],
    ],
  },
  {
    id: 'vil:coach', name: "Old Coach Inn", space: 'concordia', region: 'region:road', at: [976, 688], tiles: 'v', places: [
      ["b_inn", "Old Coach Inn", "Rest", null],
      ["b_stables", "Coach Stables", "Mounts", null],
      ["b_pub", "The Drowned Rat", "Rumours", null],
      ["b_smithy", "Wheelwright", "Repairs", null],
      ["b_stall", "Road Market", "Trade", "pell"],
    ],
  },
  {
    id: 'vil:warden', name: "Wardenhold", space: 'concordia', region: 'region:frost', at: [520, 264], tiles: 'v', tint: [0xe8f0ff, 0.5], places: [
      ["c_gate", "Warden’s Gate", "Pass north", null],
      ["c_keep", "Wardenhold Keep", "Warden training", null],
      ["c_tower", "Watchtower", "Lookout", null],
      ["b_smithy", "Frost Forge", "Weapons", null],
      ["b_training", "Drill Yard", "Bounties", null],
    ],
  },
  {
    id: 'vil:kiln', name: "Kilnmouth", space: 'concordia', region: 'region:ash', at: [288, 704], tiles: 'v', tint: [0x8a3a2a, 0.38], places: [
      ["b_smithy", "The Great Kiln", "Weapons · Armour", null],
      ["b_pub", "The Cinder Mug", "Rumours", null],
      ["b_rowhouses", "Kiln Row", "Homes", null],
      ["b_alchemist", "Ashworks", "Fire tonics", null],
      ["b_stall", "Ore Market", "Trade", null],
    ],
  },
  {
    id: 'vil:shore', name: "Abbeyshore", space: 'concordia', region: 'region:abbey', at: [1000, 496], tiles: 'v', tint: [0x4a8aa8, 0.22], places: [
      ["b_chapel", "Shore Chapel", "Blessings", null],
      ["b_teahouse", "The Tide Kettle", "Food", null],
      ["b_house_tall", "Ferry House", "River crossing", "tamsin"],
      ["b_mill", "Old Fish Mill", "Materials", null],
      ["b_stall", "Fish Stall", "Trade", null],
    ],
  },
  {
    id: 'vil:ford', name: "Lanternford", space: 'concordia', region: 'region:marsh', at: [1200, 824], tiles: 'v', tint: [0x2a6a6a, 0.4], places: [
      ["b_pub", "The Will-o’-Wisp", "Rumours", null],
      ["b_alchemist", "Lantern Shop", "Lanterns", null],
      ["b_house_stone", "Ford Keeper", "Homes", null],
      ["b_stall", "Bog Market", "Trade", null],
    ],
  },
  {
    id: 'vil:gild', name: "Gildport", space: 'concordia', region: 'region:gilded', at: [1264, 304], tiles: 'v', tint: [0xd9a83a, 0.25], places: [
      ["b_smithy", "Sparkwright Works", "Sparkforged gear", null],
      ["b_rowhouses", "Gilded Row", "Homes", null],
      ["b_bakery", "Golden Crust", "Food", null],
      ["b_teahouse", "The Gear & Saucer", "Rest", null],
      ["c_tower", "Clocktower", "Fast travel", null],
    ],
  },
  {
    id: 'vil:cliff', name: "Cliffstair", space: 'concordia', region: 'region:storm', at: [1488, 520], tiles: 'v', tint: [0x4a5a8a, 0.35], places: [
      ["c_tower", "Storm Spire", "Stormlancer training", null],
      ["b_house_stone", "Cliff House", "Homes", null],
      ["b_pub", "The Lightning Jar", "Rumours", null],
      ["b_training", "Wind Yard", "Bounties", null],
    ],
  },
];

/** The river Wend and the coach roads, in world tiles. */
export const MORVANE_RIVER: Polyline = [[600,240],[688,296],[784,336],[888,384],[992,416],[1048,424]];
export const MORVANE_ROADS: Polyline[] = [[[600,736],[704,704],[824,696],[960,712],[1080,736],[1200,856]], [[600,736],[520,640],[440,528]], [[824,696],[800,560],[800,368]]];
