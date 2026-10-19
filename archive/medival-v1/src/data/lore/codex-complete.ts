/** Codex completeness pass: region entries for every region without one. Owner: Claude 4. */
import type { LoreEntry } from '@/core';

const entries: LoreEntry[] = [
  {
    id: 'lore:aldermoor', name: 'Aldermoor', category: 'places', hidden: false,
    unlockOn: [{ region: 'region:aldermoor' }],
    body: `Heather moor and a sheltered valley ringed by granite tors: sheep country, peat country, and a long way from anything a king would ride out to see. The Crown claims Aldermoor. The chapel bell at Brindlecross governs it.

Everything in the valley is older than it looks. The Gloamwood was an Aelthi holy grove in the Age of Leaves, and its Weeping Stones still sweat water in the hardest frost. The Giant’s Sluice on Wennamere was raised by the Orrin in the First Age, long before there was anyone here to wonder why giants should care about a mere. Haldish settlers came around 600 YL and built Brindlecross where the old Aelthi paths cross, and the Abbey of Saint Wenna rose on its islet two centuries later.

Out on the moor stands Edric’s Barrow, the tomb of one of King Edric’s sworn knights. Buy a moor-man his ale and he will tell you it is Edric himself who lies there, and not in the Witherdowns at all.

On the Night of Falling Ash a star came down into Wennamere. The water turned black and rose, and the abbey went under.`,
    related: ['lore:brindlecross', 'lore:the-weeping-stones', 'lore:saint-wenna', 'lore:abbess-morwen', 'lore:edric-barrowborn', 'lore:the-white-stag', 'lore:the-orrin', 'lore:nan-briar'],
  },
  {
    id: 'lore:saltreach-coast', name: 'The Saltreach Coast', category: 'places', hidden: false,
    unlockOn: [{ region: 'region:saltreach-coast' }],
    body: `Morvane’s western edge is a long, storm-beaten line of cliff and cove, where the moors come down to the sea and stop as if they had thought better of it. Fishing villages cling to the coves, and wreckers, it is said, to some of the headlands. The coast’s one city is Brackhaven, which has called itself a free port since the War of the Two Lanterns, when it refused the Hierophant and the King alike and found that it did very well on refusing. The Salt League rules from its Exchange, so far as anything here is ruled.

Saela is the coast’s goddess, more than Ithren ever was. Her tide-shrines line the cliff-paths above the high-water mark, and her priests still go down to the quays to bless a keel with cold water and a Rime-word.

This winter the sea has begun to freeze in the harbours at night: a skin of grey ice that the morning tide breaks up again. The fishermen say Saela is holding her breath. Offshore, past the Gull Rocks, the Saltreach Isles lie in their storms, and only League ships go there.`,
    related: ['lore:brackhaven', 'lore:salt-league', 'lore:saela-and-the-river-under', 'lore:war-of-the-two-lanterns', 'lore:saltreach-isles', 'lore:marisol-kestrel', 'lore:book-salt-exchange-ledger'],
  },
  {
    id: 'lore:ironspine-foothills', name: 'The Ironspine Foothills', category: 'places', hidden: false,
    unlockOn: [{ region: 'region:ironspine-foothills' }],
    body: `Where the land climbs north toward the mountains, the farms give way to slag-heaps, pit-heads and mining towns strung along the southern slopes of the Ironspine. The Crown counts the foothills among its holdings “as far as the Iron Concord allows”, and the Concord allows a good deal less than the Crown would like. Humans dig here for coal and iron by Orrun leave and under Orrun eyes. The only door into the mountain that most of them will ever see is the great iron gate of Dun Korrath-Gate, with its gate-town of forges and inns huddled at its foot.

Along the ridges above the roads stand the Fathers: Orrin giants of the First Age, rusted through and frozen into stone where they stood, hands at their sides, looking down. Ley-veins glow in the rock of the cuttings, faint and red, like a coal seen through a crack in a door. Miners used to warm their hands at them.

Since the Quench the veins have dimmed, and the deep workings have begun to flood. The water coming up from below is black. It does not freeze, and the Orrun will not say what it is.`,
    related: ['lore:dun-korrath-gate', 'lore:iron-concord', 'lore:the-orrun', 'lore:the-orrin', 'lore:the-heartfire-and-leys', 'lore:rust-wraiths', 'lore:grimma-ironsong', 'lore:the-nine-nails', 'lore:the-ironspine'],
  },
  {
    id: 'lore:the-ironspine', name: 'The Ironspine', category: 'places', hidden: false,
    unlockOn: [{ region: 'region:ironspine' }],
    body: `The Canticle of the Anvil says that when the world was made, Orr lay down across it and his bones became the Ironspine. The Orrun do not call this a story. They call it a survey.

The range runs across the north of Morvane like a spine across a back: peaks of black rock and old snow, passes that close for half the year, and slopes ridged in a way that no wind or water ever carved. In the First Age its high places held the Wrought Dominion of the Orrin giants, and their iron sentinels still walk patrols laid down before the Aelthi woke. Rust-wraiths haunt the deeps the giants abandoned.

At its heart is Korrath-under-Stone, greatest of the Orrun holds, cut into the god’s own ribs. Below Korrath lies the Vault of the Nine Nails. Below the Vault, the old roads say, is the way down to the Heartforge, which Saint Solenne walked in the first year of the Lantern and Saint Ysolde walked in 1181.

The Orrun know every stair of it. They do not draw the deepest ones on any map they show to humans.`,
    related: ['lore:korrath-under-stone', 'lore:vault-of-the-nine-nails', 'lore:the-forging', 'lore:the-orrin', 'lore:wrought-sentinels', 'lore:rust-wraiths', 'lore:the-heartforge', 'lore:iron-concord', 'lore:brannoch-deepforge', 'lore:ironspine-foothills'],
  },
  {
    id: 'lore:sunscar', name: 'The Sunscar', category: 'places', hidden: false,
    unlockOn: [{ region: 'region:sunscar' }],
    body: `In the far south of Morvane the land dries, reddens and gives up: dunes the colour of rust, canyons cut through red stone by rivers that have not run in a thousand years, and salt-pans that shine like water and are not. This is the Sunscar. The Qasiri caravans cross it from oasis to oasis by ways they keep in songs, as their grandmothers did, and a stranger who tries it without them is not seen again.

Zahrun, the Bloom, is its heart: the oasis-city where a ley warms a spring and the Cindermother keeps her tent. The forty clans come and go from it in a slow wheel that outsiders mistake for wandering.

Under the sand lie the waystations of Qadir, buried since the Burning, with the Ashen Kings’ glass tablets still racked in the dark. The Qasiri dig them out with great care and read them with great reluctance.

The Sunscar is the last place in Morvane where it is still warm by day. The nights now bring frost even here, and the children of Zahrun have seen their first snow.`,
    related: ['lore:zahrun', 'lore:the-qasiri', 'lore:qasiri-caravans', 'lore:ruqaya-al-nar', 'lore:the-ashen-kings', 'lore:burning-of-qadir', 'lore:qasiri-salt-law', 'lore:cinder-wastes'],
  },
  {
    id: 'lore:the-lantern-coast', name: 'The Lantern Coast', category: 'places', hidden: false,
    unlockOn: [{ region: 'region:lantern-coast' }],
    body: `The imperial and holy south: olive terraces stepping down to a warm sea, vineyards on every slope, white cities roofed in tile and gold, and roads lined with wayside shrines to the Seven. For eleven centuries it has been the heart of the Solenne Empire and of the Lanternate both, and it has never been entirely clear to anyone which of the two owns the other.

Solenne, the white city founded upon the Brand in 0 YL, is its capital and the seat of the Hierophant. An hour’s ride north, on a spur of black rock above the Pilgrim’s Road, stands Valcastre, the fortress-prison of the Order of the Wick. In any other year the road between them is crowded with pilgrims coming to light their lanterns at the Brand.

This year it is more crowded still, and every lantern on it is dark. Snow has fallen on the Lantern Coast for the first time in its history, and it has not stopped. The vines are black and the olives have split on the branch. The Solenni were taught that this could not happen. Some of them are waiting outside the cathedral to be told why it has.`,
    related: ['lore:solenne', 'lore:cathedral-of-the-brand', 'lore:valcastre', 'lore:the-solenni', 'lore:the-lanternate', 'lore:the-hierophancy', 'lore:saint-solenne', 'lore:order-of-the-wick'],
  },
  {
    id: 'lore:saltreach-isles', name: 'The Saltreach Isles', category: 'places', hidden: false,
    unlockOn: [{ region: 'region:saltreach-isles' }],
    body: `West of Brackhaven, past the Gull Rocks, the sea breaks up into a storm-archipelago: black stacks and skerries, a few green isles with sheep on them, and a hundred hidden coves. Nothing reaches the Saltreach Isles except by ship, and nothing sails there without the Salt League’s leave, or at least its knowledge. The corsair holds are cut into the sea-stacks themselves. The smugglers’ caves go back into the rock further than any honest man has followed them.

Older than both are the Drowned Tide-Temples of Saela, raised before the Lantern was lit, and half-sunk now beneath the tide: pillared halls whose floors are sea and whose altars show only at the lowest ebb. Saela’s priests row out to them at the spring tides and do not say what they do there.

On the Night of Falling Ash a star fell into the sea among the outer isles, and the League fished it up. In a winter that freezes the harbour at Brackhaven, the water round Gull Rock steams.`,
    related: ['lore:salt-league', 'lore:marisol-kestrel', 'lore:brackhaven-auction', 'lore:saela-and-the-river-under', 'lore:the-seven-embers', 'lore:saltreach-coast', 'lore:brackhaven'],
  },
  {
    id: 'lore:the-frostreach', name: 'The Frostreach', category: 'places', hidden: false,
    unlockOn: [{ region: 'region:frostreach' }],
    body: `North of the Ironspine the land flattens into tundra and breaks against the sea in long fjords: a country of wolves, ice and wind, where the Hrothi have lived by fishing, herding and raiding since the first clans came over the ice. Twelve clans hold it. They meet at the Wolf-Moot Stones, on a bare rise a day north of Skelvik, the port-hall of Jarl Sigrun Ice-Eye at the head of Skelvikfjord.

The Hrothi say that an empire lay here once, before the ice: an old, frozen empire of giants, whose halls are still down there beneath the glaciers. The skalds tell it as a story. The worked stone under the snow at the Moot-ring suggests it is rather more than one.

The north has always been hard. This winter it is dying. The glaciers are coming down the valleys, the fjords are frozen shore to shore, the herds are thin, and the ship-timber is going on the hearths. On the benches of the halls the young warriors are saying, louder every night, that there is grain in the south, and that the south has not earned it.`,
    related: ['lore:skelvik', 'lore:the-wolf-moot-stones', 'lore:wolf-moot', 'lore:the-hrothi', 'lore:sigrun-ice-eye', 'lore:rime-wolves', 'lore:hrothi-kennings', 'lore:the-orrin', 'lore:the-ironspine'],
  },
  {
    id: 'lore:cinder-wastes', name: 'The Cinder Wastes', category: 'places', hidden: false,
    unlockOn: [{ region: 'region:cinder-wastes' }],
    body: `Beyond the Sunscar, in the south-east, the sand turns black. It is not sand. It is ash: dune upon dune of it, soft as flour and deeper than anyone has dug, with flats of fused glass between that ring underfoot like struck bells. Sixteen centuries ago this was Qadir, the greatest realm of the Age of Ash, where the Ashen Kings tapped the leys like wells. Around 400 BL the leys overdrew and burned, and the land burned with them.

Nothing lives in the Wastes but what likes the heat still left in the ground. Ashwyrms swim the dunes. Feral cinderdrakes, the gone-wild get of the Kings’ own breeding, hunt the glass flats. Leave the Ash Road, the line of glass posts and buried waystations that the Qasiri keep, and the dunes will take you as softly as snow takes a sleeper.

At the road’s end the Ruins of Qadir stand half-sunk in ash, glass palaces slumped like candles, where the ghost of King Ozrah the Unsleeping holds court for no one. No power rules the Wastes. The Ashen Creed hides here, which is not the same thing.`,
    related: ['lore:ruins-of-qadir', 'lore:the-ash-road', 'lore:burning-of-qadir', 'lore:the-ashen-kings', 'lore:ozrah-the-unsleeping', 'lore:cinderdrakes-and-ashwyrms', 'lore:ashen-creed', 'lore:the-kings-stair', 'lore:sunscar'],
  },
];

export default entries;
