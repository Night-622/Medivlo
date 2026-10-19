/** Codex: places of the Haldmarch (Act I set). Owner: Claude 4. */
import type { LoreEntry } from '@/core';

const entries: LoreEntry[] = [
  // ----- Kingsvale
  {
    id: 'lore:the-kingsvale', name: 'The Kingsvale', category: 'places',
    source: 'The Husbandman’s Almanack, Haldford printing, 1187 YL',
    unlockOn: [{ region: 'region:kingsvale' }],
    body: `The Kingsvale is the Haldmarch’s bread-basket and its oldest settled ground: a broad, gentle valley of plough-land, water-meadow and orchard, cut through by the River Hald on its way to the capital. In a fair year it feeds the kingdom twice over. Barley and rye do well upon the slopes, wheat in the bottoms, and the Haldford barges carry the surplus downriver to Haldren market.

Sow barley on Kethday after the first thaw. Lamb in the month of Saela’s Moon. Cut hay when the elder blooms.

[Written below in a later hand:] There has been no thaw. The elder has not bloomed. The barges are frozen at their moorings in Haldford and the seed-corn is being eaten. Do not trust the dates in this almanack, for they were written for a world that had a spring.`,
    sections: [
      { id: 'crag', title: 'The Crag', hint: 'Something stands above the vale.', body: `On a crag above the north road stand the black walls of Cinderhold. Kingsvale children dare one another to touch them, for the stones are warm in the hardest frost. Their grandmothers tell them not to. “Wardens’ walls,” they say, and spit for luck, though few can say whether the luck is for the walls or against them.` },
    ],
    related: ['lore:haldren', 'lore:cinderhold', 'lore:the-haldish', 'lore:crown-of-haldmarch', 'lore:haldren-keep', 'lore:the-emberwardens'],
  },
  {
    id: 'lore:haldren', name: 'Haldren', category: 'places',
    source: 'Itinerary of the Northern Sees, for pilgrims of the Lantern (Solenne, 1150 YL)',
    unlockOn: [{ landmark: 'landmark:haldren-gate' }],
    body: `Haldren, the royal seat of the Haldmarch, stands upon the River Hald where it bends beneath a long ridge. It is a city of timber and grey stone, of smoke and close-built lanes, with a keep upon the height and a cathedral of the Lantern below it, the finest north of the Ironspine, though modest by the measure of Solenne.

The pilgrim will find the folk of Haldren plain in their speech and dress, devout after their fashion, and somewhat too fond of their Charter, which they will recite to the visitor unasked. The ale is strong. The pilgrim is advised to lodge within the cathedral close, and to keep his purse beneath his shirt.`,
    sections: [
      { id: 'winter', title: 'Haldren in Winter', hint: 'The Itinerary is out of date.', body: `The gates are barred at dusk now, and Wick soldiers stand beside the Crown’s at every one, turning out the hands of all who enter. Outside the walls the refugees of Greywater live in a camp of sailcloth and turf, three thousand of them at the last count, and the count is old. The cathedral bells ring for the dead twice daily. The ale is still strong.` },
      { id: 'undercity', title: 'Beneath the Streets', hint: 'The city goes deeper than it looks.', body: `Haldren is built upon Haldren: the cellars of the old town, burned in the War of the Two Lanterns, were never filled in, only roofed over. Drains, crypts and forgotten undercrofts run beneath half the city. Respectable folk do not go down there. The Quiet Hand does not go anywhere else.` },
    ],
    related: ['lore:haldren-keep', 'lore:the-kingsvale', 'lore:the-quiet-hand', 'lore:charter-of-haldren', 'lore:crown-of-haldmarch', 'lore:queen-aldith', 'lore:sable'],
  },
  {
    id: 'lore:haldren-keep', name: 'Haldren Keep', category: 'places',
    source: 'Notes for the instruction of royal pages, kept by the Steward of the Keep',
    unlockOn: [{ landmark: 'landmark:throne-room' }],
    body: `The Keep was raised upon the ridge above the Hald three hundred years before the Charter, by a Barrow-King whose name no herald now remembers. King Edric Barrowborn took it in 868 and made it his seat, and in its great hall, two years later, the lords of the Haldish kingdoms set their seals to the Charter of Haldren. The table at which they sat stands there still. A page who leans upon it is to be beaten.

The throne is oak, not gold, by Edric’s wish: “A king should sit on what grows here.” Over it hangs the banner of the Haldmarch, the gold crossroads upon blue. A page is to bow to the throne whether or not a king is in it.`,
    sections: [
      { id: 'queen', title: 'The Queen’s Chair', hint: 'The throne is too large for its sitter.', body: `Since King Aldred died in the first months of the Long Winter, a cushion has been placed upon the oak throne, and a footstool beneath it. The pages are not to remark upon either. To the right of the throne stands the Lord Protector’s chair, which is not a throne, and is not to be called one, and is a little higher than it was.` },
    ],
    related: ['lore:haldren', 'lore:charter-of-haldren', 'lore:queen-aldith', 'lore:osric-harrow', 'lore:the-kingsvale'],
  },
  {
    id: 'lore:cinderhold', name: 'Cinderhold', category: 'places',
    unlockOn: [{ landmark: 'landmark:cinderhold' }],
    body: `The fortress of the Emberwardens was built in 112 YL upon a crag above the Kingsvale, where a ley runs so near the surface that the rock itself is warm. For nine hundred years its red banners could be seen from Haldren, and its great ley-brazier, lit from the earth and not from the Brand, burned on the battlements every night.

It was stormed in a single night in 1041 YL and has stood empty since. The roofs are gone, the gates are gone, and the Crown has three times tried to quarry the stone and three times given it up, because the masons would not stay. The walls are scorched black to the height of a man. They are still warm to the touch. Hesta Corrow says that is not the ley. She says it is the walls remembering.`,
    sections: [
      { id: 'rekindled', title: 'Rekindled', hint: 'If the brazier should burn again.', body: `The brazier took the Ashmark’s fire as if it had been waiting for it. Light ran along the old ley-channels cut into the floor of the hall, and for a moment every scorched window in Cinderhold shone red, as they had when the order lived. In Haldren that night people stood in the streets to watch. Some of them wept, and some of them sent for the Wick.` },
    ],
    related: ['lore:the-emberwardens', 'lore:purge-of-the-emberwardens', 'lore:cinder-shades', 'lore:hesta-corrow', 'lore:the-kingsvale'],
  },
  // ----- Greywater
  {
    id: 'lore:greywater-marsh', name: 'Greywater Marsh', category: 'places',
    source: 'Report of the Order of the Wick to the Prior of Haldren, Ashday after Lanternmass, 1186 YL',
    unlockOn: [{ region: 'region:greywater-marsh' }],
    body: `It is the finding of this Order that the fen called Greywater is, and has ever been, a place of corruption. The ground is unsound, the water black, the folk ignorant and given to heathen custom. The Unmade presses closer to the world here than in any other part of the Haldmarch, as the drainage-works of the heathen giants themselves bear witness, and where the Unmade presses, the weak in faith are drawn to it.

The Order therefore recommends that the Varn Causeway be closed; that no aid be sent into the fen until the heresy called the Drowned Choir is put down; and that any fen-dweller seeking refuge in the Kingsvale be examined for the mark of the Mire before admittance. The fen is lost. The Order does not say this lightly.`,
    sections: [
      { id: 'sleeper', title: 'Another Reading', hint: 'An Aelthi has read the report.', body: `Cadoc ap Ynys, when shown the Wick’s report, read it twice and handed it back. “They are right that it lies closest here,” he said. “They are wrong about everything else. This is where the sleeper turns over nearest to the surface. You do not hate a sleeper for turning. You hush it, or you let it wake. There is no third thing to do with a sleeper, whatever the Lantern thinks.”` },
    ],
    related: ['lore:varn', 'lore:fenwick', 'lore:the-black-seep', 'lore:the-mire', 'lore:the-drowned-choir', 'lore:reed-temples', 'lore:aldwin-varn', 'lore:reed-mother', 'lore:the-breach', 'lore:the-mirelands'],
  },
  {
    id: 'lore:varn', name: 'Varn', category: 'places',
    source: 'The Charter of Varn, 702 YL (preamble)',
    unlockOn: [{ landmark: 'landmark:varn-gates' }],
    body: `“Be it known that We, by the grace of the Seven and the leave of the Lantern, grant to Our servant Godwin of the Fen and his heirs the drained lands at the mouth of the Grey, to hold the dykes, the sluices and the floodgates thereof, and to keep the water out of Our realm for so long as their line endures.”

Varn grew rich on eels, peat and salt, and on the tolls of the causeway that is the Haldmarch’s eastern gate. Its lords built their dykes upon the footings of far older works, the giants’ drains that had held the fen in check since the First Age, and they were proud to say no flood had ever passed them.

On the Night of Falling Ash, Lord Aldwin Varn opened the floodgates with his own hands. The town burned first, and then it drowned.`,
    sections: [
      { id: 'drowned', title: 'Drowned Varn', hint: 'Seen from inside the walls.', body: `The streets of Varn are under water to the knee, to the waist, to the eaves. The water is black and very still and does not freeze. Lamps burn in windows below its surface. The bells of the town chapel ring every hour, slow and muffled, and no one has climbed the tower to ring them. In the market, stalls stand laid out with goods, as if the town had only stepped away and meant to come back.` },
    ],
    related: ['lore:greywater-marsh', 'lore:aldwin-varn', 'lore:drowned-knights', 'lore:night-of-falling-ash', 'lore:book-varn-charter'],
  },
  {
    id: 'lore:fenwick', name: 'Fenwick', category: 'places',
    unlockOn: [{ landmark: 'landmark:fenwick-stilts' }],
    body: `A village of eel-fishers built on stilts over the open water of Greywater, three hours by punt from Varn. Its houses are reed-thatched and joined by plank-walks, its people narrow-eyed, weatherproof and proud, and its headwoman, Agna Fenn, is said to have once broken a tithe-reeve’s jaw with an eel-gaff. Fenwick has paid its dues to the lords of Varn for near five hundred years, and its tithe to the Lantern for longer, and it has never much liked either.

Fenwick did not flee when Varn drowned. It had nowhere to flee to. The Wick had closed the causeway.`,
    sections: [
      { id: 'tithe', title: 'The New Tithe', hint: 'Fenwick pays someone now.', body: `Every new moon a punt goes out from Fenwick to the reed temples, carrying eels, peat and salt, and comes back empty. In return the Choir’s acolytes leave the village be. No one in Fenwick wears the black. No one in Fenwick speaks against it either. “We pay who’s here,” Agna Fenn says. “The Queen’s not here. The Lantern’s not here. You find me someone who’ll keep the water off my children, and I’ll pay them instead.”` },
    ],
    related: ['lore:greywater-marsh', 'lore:the-drowned-choir', 'lore:varn', 'lore:reed-temples', 'lore:reed-mother'],
  },
  {
    id: 'lore:the-black-seep', name: 'The Black Seep', category: 'places',
    unlockOn: [{ landmark: 'landmark:black-seep' }],
    body: `In the deep fen east of Varn, where the reeds grow white as bone, there is a pool that no one has ever sounded. Its water is black and warm and moves with a slow swell, though there is no wind and no current, as if something far beneath were breathing. Birds will not fly over it. The fen-folk call it the Seep, as though there were no other, and in their mouths there is not.

The Choir’s pilgrims come to its shore in procession, singing, and some of them walk in. The fen-folk have marked its edge with willow stakes each spring for as long as anyone has kept count. Every year they have had to drive the stakes a little further back.`,
    sections: [
      { id: 'embersight', title: 'Through the Ashmark', hint: 'The mark sees what the eye cannot.', body: `With Embersight the leys of the fen show as faint red threads, guttering. Around the Seep there are none at all. The threads run toward it and stop at its rim, cleanly, as if cut. It is not a pool. It is a hole in the world, and the world has been holding its edges together by habit.` },
    ],
    related: ['lore:greywater-marsh', 'lore:the-mire', 'lore:the-drowned-choir', 'lore:the-drowned-tongue', 'lore:reed-temples', 'lore:reed-mother', 'lore:the-breach'],
  },
  // ----- Witherdowns
  {
    id: 'lore:the-witherdowns', name: 'The Witherdowns', category: 'places',
    source: '“The Downs-Wife’s Song”, as sung in the chalk villages',
    unlockOn: [{ region: 'region:witherdowns' }],
    body: `“Lay him high on the long chalk hill, / Turf on his breast and his hand on his blade, / Saela will come when the night is still / And carry him down where the old kings laid.”

West of the Kingsvale the land rises into the Witherdowns, long bare hills of chalk and thin turf where the wind never stops. The downs are older in their dead than in their living: every crest carries a barrow, and some carry dozens. Here the Barrow-Kings of the Haldish lie with their sworn men about them, and here the Grey Monks of Morrow keep their ossuary and their silences.

Downs-folk are a quiet people who leave a cup of water on the sill for passing souls. This winter they have taken to leaving it inside, with the shutters barred, for the souls are not passing.`,
    related: ['lore:barrow-kings', 'lore:ossuary-of-saint-calder', 'lore:the-restless', 'lore:saela-and-the-river-under', 'lore:grey-monks-of-morrow', 'lore:edric-barrowborn'],
  },
  {
    id: 'lore:ossuary-of-saint-calder', name: 'The Ossuary of Saint Calder', category: 'places',
    unlockOn: [{ landmark: 'landmark:ossuary-of-saint-calder' }],
    body: `The house of the Grey Monks in the Witherdowns is half monastery and half charnel. Its upper halls are cloisters and scriptoria; its lower are vaults where the bones of forty generations of downs-folk lie sorted, labelled and remembered. Every skull bears a name, written on the brow in grey ink, and the monks read the names aloud in turn, so that no one there is ever wholly forgotten.

Calder, whose house it is, was a saint before the Lanternate had saints to name. The monks say he sat with the dying of the Grey Winters and wrote down the last words of every one, and that his book of them is still on its lectern. They do not let pilgrims read it.`,
    sections: [
      { id: 'archive', title: 'The Sealed Shelves', hint: 'The library goes back further than the Lantern.', body: `The Ossuary’s archive of memory holds the oldest human writings on the Mire anywhere in Morvane: dream-records, the testimonies of the drowned, accounts of seeps that opened and closed before Solenne was a village. A whole wing of it is sealed with grey wax. Brother Ossory, asked why, says only that some memories are kept the way one keeps a fire in: banked, and watched, and not for warming hands.` },
    ],
    related: ['lore:grey-monks-of-morrow', 'lore:morrow-the-veiled', 'lore:the-witherdowns', 'lore:the-restless', 'lore:book-grey-monk-ossuary-rule'],
  },
  // ----- the west and north
  {
    id: 'lore:dun-korrath-gate', name: 'Dun Korrath-Gate', category: 'places',
    source: 'Letter of Hild Coalbrook, smith’s apprentice, to her mother in Brindlecross (c. 1180 YL)',
    unlockOn: [{ landmark: 'landmark:dun-korrath-gate' }],
    body: `Mam, I am here and I am well. You never saw such a door. It is cut straight into the mountain, twice the height of the chapel, all of one piece of iron, and they say it has stood since the Iron Concord and not one fleck of rust on it. Humans come no further than the gate-town. That is all forges and inns and the Exchange where the Orrun trade with us, and they drive a hard bargain, but they keep it to the letter.

There are giants up on the ridges. Stone ones, I mean, or iron gone to stone. They stand looking down at the road with their hands at their sides. The Orrun call them the Fathers and will not talk of them to outsiders. My master says you get used to them. I have not.`,
    sections: [
      { id: 'closed', title: 'The Gate Closed', hint: 'The gate does not open as it did.', body: `Since the Quench the great door has been shut to all but Orrun. Thane-Speaker Hedda Stonebrow gives audience at the threshold and refuses everything politely. The gate-town is full of rumours: that the deep mines are flooding, that the water coming up is black, that the Concord has called back every clan from the lower holds. The Orrun deny all of it, quickly, and do not meet your eye.` },
    ],
    related: ['lore:iron-concord', 'lore:the-orrun', 'lore:the-nine-nails', 'lore:grimma-ironsong', 'lore:ironspine-foothills', 'lore:korrath-under-stone'],
  },
  {
    id: 'lore:ylwen-deepwood', name: 'The Ylwen Deepwood', category: 'places',
    unlockOn: [{ landmark: 'landmark:thornwall' }, { region: 'region:ylwen-deepwood' }],
    body: `West of the Kingsvale the farms end at a hedge. It is not a hedge as the Haldish make them. It is forty feet high and older than the Haldmarch, a wall of living thorn the Aelthi call the Thornwall, and it does not open for axes or for fire. Beyond it lies the Ylwen Deepwood, the last of the great forests of the Age of Leaves.

In its canopy is Caer Ylwen, the hold of the Aelthi, grown rather than built, where the halls are trees bent into arches over centuries of patient song. Beneath it lies a lake, still and very clear, and on clear days those who look down may see towers in it. That is Ys Aerwen, which sank. The Aelthi do not look down.`,
    sections: [
      { id: 'grove', title: 'The Grove of Antlers', hint: 'Only those of the pact may enter.', body: `At the heart of the Deepwood is a clearing ringed by the antlers of every white stag that has died in the forest, set into the living trunks so that the trees have grown around them. There the Thornwise Circle meets. It is very quiet. The Aelthi say the antlers listen.` },
    ],
    related: ['lore:sundering-of-ys', 'lore:the-lullaby', 'lore:the-aelthi', 'lore:the-thornwise', 'lore:cadoc-ap-ynys', 'lore:rhiannon-ys-caer', 'lore:kethra-the-thorn'],
  },
  {
    id: 'lore:brackhaven', name: 'Brackhaven', category: 'places',
    source: 'Salt League saying',
    unlockOn: [{ landmark: 'landmark:brackhaven-docks' }, { region: 'region:saltreach-coast' }],
    body: `“No king in Brackhaven, no priest at the helm, and the tide takes its tithe from everyone.”

The free port of the Saltreach Coast sits in a deep cove between two headlands, its houses stacked up the cliffs like gulls’ nests and painted every colour that was cheapest that year. It has refused both Hierophant and King since the War of the Two Lanterns, and it has prospered on that refusal: anything in Morvane that can be bought may be bought here, and much that cannot.

The Salt Exchange stands on the quay, a hall of black timber where the League’s factors sit at long tables and the prices are chalked on slate. Along the cliffs above, the old tide-shrines of Saela are still kept, and the captains still pay her priests to bless their keels. This winter the harbour has begun to freeze at night. The priests are asking more.`,
    related: ['lore:salt-league', 'lore:war-of-the-two-lanterns', 'lore:saela-and-the-river-under', 'lore:saltreach-coast', 'lore:marisol-kestrel', 'lore:saltreach-isles'],
  },
  {
    id: 'lore:reed-temples', name: 'The Reed Temples', category: 'places',
    source: 'Told by Agna Fenn, headwoman of Fenwick',
    unlockOn: [{ landmark: 'landmark:reed-temple' }],
    body: `They grew out of the fen the winter Varn drowned: domes of black reed, woven wet and left to set like wicker, standing on stilts above water that does not freeze. The eel-folk say no one saw them built. One morning they were there, and the singing started.

Inside, the floors are water. The faithful kneel in it to the waist, and the Choir’s priests walk among them pressing their heads gently under, “for a breath, only a breath, so you remember.” Most come up weeping. Some come up smiling, and do not weep again.

Fenwick pays its tithe in eels and silence. “They leave us be,” says Agna Fenn, “so long as we don’t look at the temples too long. I’ve stopped looking. I’m not proud of it.”`,
    related: ['lore:the-drowned-choir', 'lore:fenwick', 'lore:the-drowned-tongue', 'lore:reed-mother', 'lore:the-black-seep', 'lore:greywater-marsh'],
  },
];

export default entries;
