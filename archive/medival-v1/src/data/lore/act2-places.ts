/** Codex: places of the wider continent (Act II set). Owner: Claude 4. */
import type { LoreEntry } from '@/core';

const entries: LoreEntry[] = [
  // ----- Lantern Coast
  {
    id: 'lore:solenne', name: 'Solenne', category: 'places',
    source: 'In Praise of the White City, a panegyric for the Lanternmass of 1150 YL; with a note added in 1187',
    unlockOn: [{ landmark: 'landmark:solenne-gate' }, { landmark: 'landmark:pilgrim-camp' }],
    body: `“Hail, white city, first of cities, lamp of the world! Hail Solenne, founded upon the fire! Her walls are of the white stone of the coast and her roofs of beaten gold, and her streets climb by seven terraces to the Cathedral of the Brand: one terrace for each of the Lights, and the seventh and highest for Ithren. No beggar sleeps cold in Solenne, for the holy fire warms her very paving. Her vines are the sweetest in the Empire, her bells the loudest, her people the most devout; and in all her eleven centuries no snow has fallen upon her, nor ever shall.”

[In a later hand, below:] It snowed on the seventh terrace on the night the Brand went dark, and it has not stopped since. The vines are black on the slopes. The paving is cold. The beggars sleep in the cathedral porch now, because the Hierophant has allowed it. Some call that mercy. The Lord-Inquisitor calls it disorder, and has posted a guard to count them.`,
    sections: [
      { id: 'pilgrims', title: 'The Vigil Outside the Walls', hint: 'Thousands are waiting outside the gate.', body: `Below the walls the pilgrims camp in their thousands, from every diocese of the Empire and half the parishes of the Haldmarch. Each of them carried a lantern south, to be lit again at the Brand as their grandparents’ lanterns were. Each lantern is dark. They keep vigil with them anyway, all night, in rows across the frozen vineyards, holding up their cold lamps toward the cathedral like beggars holding out bowls. A child asked you, very politely, whether you were the one who would light them. Her mother pulled her away before you could answer.` },
      { id: 'terraces', title: 'The Seven Terraces', hint: 'Seven Lights, but not seven equals.', body: `Each terrace of Solenne has its shrine. Ithren’s, on the seventh, is a hall of gold. Vor’s is a smithy’s forge kept by the city guild; Saela’s a fountain, frozen; Morrow’s a locked door, as it always has been. Kethra’s has been allowed to grow over. Calun’s is a weathervane on a pole. Ashvar’s was walled up in 1041 and has a Wick sentry standing in front of it. The pilgrims’ guides say the terraces show the gods in their proper order. The Haldish pilgrims say they show the Church’s.` },
    ],
    related: ['lore:cathedral-of-the-brand', 'lore:saint-solenne', 'lore:the-hierophancy', 'lore:the-solenni', 'lore:the-brand', 'lore:the-lantern-coast', 'lore:hierophant-aurelian', 'lore:sister-ilse'],
  },
  {
    id: 'lore:cathedral-of-the-brand', name: 'The Cathedral of the Brand', category: 'places',
    source: 'A Short Guide for the Pilgrim, sold upon the cathedral steps (before 1186 YL)',
    unlockOn: [{ landmark: 'landmark:cathedral-of-the-brand' }],
    body: `Enter by the Ithren Door with your head uncovered and your lantern unlit. The nave is three hundred paces from door to altar, and its roof is held up by seventy pillars of white stone, one for every saint of the Lantern; the newest, near the altar, is Saint Ysolde’s, and its carving is not yet finished.

Above the altar hangs the Great Lantern, of gold and crystal, the height of four men. Within it is the Brand: a coal no larger than a child’s fist, which has burned without fuel since the Year of our Salvation. Look upon it without fear. It does not blind. Many pilgrims have said that it seems to look back.

To the right of the altar is the Font of Saint Solenne, where she washed the ash from her hands on the day she came up from the deep. Pilgrims are asked not to touch the font.

The stair behind the altar leads to the rooms of the Keeper of the Brand, and is closed to all.`,
    sections: [
      { id: 'husk', title: 'The Dead Brand', hint: 'The Great Lantern is dark.', body: `The crystal of the Great Lantern is cracked from top to bottom, and the thing inside it is black: a husk the size of a fist, split down the middle and crusted with a pale rime that is not frost and not salt. It gives no warmth. When you came near, the Ashmark ached as a broken bone aches in the cold, and the Embers in you hummed, all of them at once, like bees in a wall. Deep in the crack, for a moment, something glowed. Then it did not. The Wick sentry beside the altar said, very quietly, that it had never done that for anyone else.` },
      { id: 'keepers-rooms', title: 'The Keeper’s Rooms', hint: 'Someone still keeps them.', body: `The Keeper’s rooms are three small cells at the top of the stair, kept exactly as Ysolde left them when she went on pilgrimage in 1181: a narrow bed, a writing-desk, a window facing north toward the Ironspine. Sister Ilse has swept them every day for six years. There are rings on the window-sill, as from a cup that has been set down wet again and again, though the sister says she never brings a cup up the stair.` },
      { id: 'undercroft', title: 'The Undercroft', hint: 'The guide does not say what lies beneath.', body: `Beneath the nave is the undercroft, where the Order of the Wick keeps its archive. Its door is sealed with the Hierophant’s wax, the same red wax, stamped with the same lantern, as the seals on the chests that the Wick carried down from Cinderhold in 1041. A verger told you that no one has broken that seal in his lifetime, nor in his father’s. Then he asked who had sent you to ask.` },
    ],
    related: ['lore:solenne', 'lore:the-brand', 'lore:night-of-falling-ash', 'lore:ysolde-the-pale-saint', 'lore:purge-of-the-emberwardens', 'lore:sister-ilse', 'lore:the-hierophancy'],
  },
  {
    id: 'lore:valcastre', name: 'Valcastre', category: 'places',
    source: 'Scratched into the walls of a cell in Valcastre, in several hands',
    unlockOn: [{ landmark: 'landmark:valcastre' }, { landmark: 'landmark:valcastre-cells' }],
    body: `Valcastre stands on a spur of black rock above the Pilgrim’s Road, an hour’s ride north of Solenne: the fortress of the Order of the Wick, and its prison. It was raised in the century after the Wick-Edict. No one examined by the Wick is examined anywhere else. The wick-scissors are carved above its gate, and its bell rings once for every examination, and the pilgrims on the road below have learned not to count.

Scratched on a cell wall, in different hands:

“Licensed in Rime. Taken for Storm. M. of Aurenac.”

“Seven keep me. Seven did not.”

“They ask the same question every morning. What did you see when the star fell? I saw a star fall. That is not the answer.”

“If you read this, you are warmer than I was. Draw nothing. They can smell it.”`,
    sections: [
      { id: 'cells', title: 'The Lower Cells', hint: 'Some prisoners have been here since the Quench.', body: `The lower cells are full this year: hedge-mages, unlicensed midwives, a ferryman who said the river had spoken to him, children with burn-scars on their hands. The rule of Valcastre is that a prisoner may have light only on the day he confesses. Most of the cells are dark. The jailers are not cruel men, on the whole. They are frightened ones, which is worse, because a cruel man can be bargained with.` },
    ],
    related: ['lore:order-of-the-wick', 'lore:the-wick-edict', 'lore:castor-vellane', 'lore:wick-licence', 'lore:the-lantern-coast', 'lore:garrick-hale'],
  },
  // ----- Ironspine
  {
    id: 'lore:korrath-under-stone', name: 'Korrath-under-Stone', category: 'places',
    source: 'A gate-warden of Korrath, to a human guest',
    unlockOn: [{ landmark: 'landmark:korrath-under-stone' }, { landmark: 'landmark:thane-hall' }],
    body: `“Korrath-under-Stone. Greatest of the Holds. The Fathers began it and we finished it, which took us far longer than it took them, and we are prouder of it.

“It is carved into the god’s own ribs. Walk the Long Hall and look up: the roof curves like the inside of a chest, because it is one. The forges are fed by a ley that runs up the spine, and the hold has never once gone cold, not in the Grey Winters, not now. At the heart is the Thane-Hall, where the High Thane sits at the oath-ledger with the clans on their benches round him, and every word said in that hall is written down by the ledger-keeper as it is said.

“Mind your manners there. Don’t whistle; it’s for the dead. Don’t say grenn. Don’t touch the ledger. And whatever you hear through the floor, human, don’t ask what’s below.”`,
    sections: [
      { id: 'lower-holds', title: 'The Lower Holds', hint: 'The deep holds have been closed.', body: `The stairs to the lower holds are barred with true-iron, and the clans that lived there sleep in the Long Hall on borrowed pallets. Orrun children are told the deep holds are resting. If you stand by the barred stair at night you can hear water dripping far below, slow and steady, like a clock that is counting down rather than up.` },
      { id: 'flooded', title: 'The Price of an Ember', hint: 'What happened when the Ember was taken.', body: `The black water came up into the lower holds the night you took the Ember from the Vault. It filled the deep halls to the ceiling and stopped at the barred stair, and it is there still, smooth as glass, with lamplight in it that no one lit. No Orrun has blamed you aloud. In the oath-ledger of Korrath, under that day, a single line has been entered against your name. The ledger-keeper read it, and would not read it to you.` },
    ],
    related: ['lore:the-orrun', 'lore:iron-concord', 'lore:vault-of-the-nine-nails', 'lore:vor-the-hammer', 'lore:the-iron-concord-treaty', 'lore:brannoch-deepforge', 'lore:the-ironspine'],
  },
  {
    id: 'lore:vault-of-the-nine-nails', name: 'The Vault of the Nine Nails', category: 'places',
    unlockOn: [{ landmark: 'landmark:vault-of-nine-nails' }, { landmark: 'landmark:the-empty-socket' }],
    body: `Below the last hold, below the last stair, the mountain opens into a cavern so large that lamplight does not reach its walls. The floor is black stone, warm underfoot, and faintly ridged, as a palm is ridged. Out of it rise the Nine Nails of the Fathers: pillars of true-iron each the height of a hold-hall, standing in a ring, with the hold-fast rune cut into every one and glowing a dull forge-red.

Nothing grows here. Nothing echoes. The air is heavy in a way that has nothing to do with depth, as if something enormous were pressing up against the underside of the floor and the Nails were all that kept it there. Between them, on paths worn smooth before the first Orrun was born, the Wrought still walk their rounds.

Seven of the Nails burn red. Two are dark, and swollen with rust, and the stone around their feet is wet.`,
    sections: [
      { id: 'socket', title: 'The Empty Socket', hint: 'Where two Nails failed, something else is holding.', body: `Between the two dead Nails the floor has torn open, a ragged mouth of stone with black water standing in it, level and still. Wedged in the throat of that wound, white-hot, is an Ember. It fell through a thousand feet of mountain on the Night of Falling Ash to lodge exactly here, and here it has held, like a thumb pressed into a cut. The black water strains around it and cannot rise. True-iron could not hold that wound. A falling star can. The Orrun have a word for luck, and it is the same as their word for a debt.` },
      { id: 'new-nail', title: 'The Tenth Nail', hint: 'A Nail can still be forged.', body: `It took three veins of true-iron, the anvil of the Vault-keepers, and a rune no living Orrun had cut. When it was done the new Nail stood between the two dead ones, raw and grey and humming, and the black water sank away from it like a tide going out. The Ember came free into your hand. The clans call it the Tenth Nail, though it is only the ninth, because, they say, it is the first that was ever driven by someone who knew what it was for.` },
    ],
    related: ['lore:the-nine-nails', 'lore:korrath-under-stone', 'lore:true-iron', 'lore:wrought-sentinels', 'lore:the-rusting', 'lore:the-ironspine', 'lore:the-heartforge'],
  },
  // ----- Frostreach
  {
    id: 'lore:skelvik', name: 'Skelvik', category: 'places',
    source: 'From the Saga of Skelvik, as the skalds recite it in the jarl’s hall',
    unlockOn: [{ landmark: 'landmark:skelvik' }, { landmark: 'landmark:skelvik-hall' }],
    body: `“Hear now how Skelvik was founded. Ragna the Far-Steering came out of the east with three ships and the storm behind her. Where the fjord bends its knee, she drove her ship up the shingle, and set fire to it, and said: Here we stay. Her crews thought her mad. She said: A ship is for those who mean to leave. So they built the hall from the other two, and Skelvik has been a hall-town ever since, and every jarl of Skelvik has sat on a seat made from Ragna’s keel.”

So the saga. Skelvik is a long town of turf-roofed halls along the shingle at the head of Skelvikfjord, the greatest port of the Frostreach. In any other year its harbour would be crowded with longships and fishing-boats. This year the fjord is frozen from shore to shore, and the ships stand locked in it, and the ice is creeping out toward the open sea at the pace of a walking man.`,
    sections: [
      { id: 'hall', title: 'The Jarl’s Hall', hint: 'There is an empty seat by the high seat.', body: `In Skelvik hall the high seat stands between two carved pillars, wolves on one, storm-clouds on the other. Beside it is a second chair, and no one sits in it. An axe hangs above it on the wall. The fire in the long hearth is fed with ship-timber now, plank by plank; the skalds call it “burning the sea-road”, and do not mean it kindly. Sigrun Ice-Eye watches the young warriors on the benches while they drink, and they watch her, and the fire between them is very small.` },
    ],
    related: ['lore:the-hrothi', 'lore:sigrun-ice-eye', 'lore:wolf-moot', 'lore:the-wolf-moot-stones', 'lore:the-frostreach'],
  },
  {
    id: 'lore:the-wolf-moot-stones', name: 'The Wolf-Moot Stones', category: 'places',
    source: 'The Moot-Law of the Hrothi, as the lawsayer speaks it at the opening of every moot',
    unlockOn: [{ landmark: 'landmark:wolf-moot-stones' }],
    body: `“Here stand the stones the wolves raised when the first clans came over the ice, twelve stones for twelve clans, and a thirteenth in the midst, which is the speaking-stone.

“Within the ring no blade is drawn, save the moot calls for it.

“Within the ring any free Hrothi may speak, and the jarl may not stop them.

“The moot is decided by deed, by word, or by the duel; and what the moot decides, the clans hold to, though it kill them.

“Whoever breaks the peace of the ring is wolf’s-head, and may be hunted.”

The ring stands on a bare rise above the tundra, a day north of Skelvik. On the Night of Falling Ash a star came down on it out of a clear sky. It struck the speaking-stone, which is now melted smooth as a river pebble, and it is still there, burning, set into the stone like an eye. The clans call it Calun’s Eye, and they have come from every fjord to look into it.`,
    sections: [
      { id: 'beneath', title: 'Beneath the Ring', hint: 'The ice under the stones is older than the clans.', body: `Under the snow inside the ring, where the Ember’s heat has melted it back, the ground is not earth. It is worked stone, set in great courses, and in it is cut a rune you have seen before, on the Giant’s Sluice at Wennamere and on the broken nail below Dun Korrath-Gate. The Hrothi say the frozen old empire lies under the ice of the north. It seems the wolves raised their ring on top of a piece of it. The Ember of the Mere fell on a giant’s sluice. The Ember of the Fen fell on a giant’s drain. Wherever the Embers are falling, it is not at random. They are falling where the world is thin.` },
    ],
    related: ['lore:wolf-moot', 'lore:calun-the-wanderer', 'lore:skelvik', 'lore:the-seven-embers', 'lore:the-nine-nails', 'lore:the-frostreach', 'lore:the-orrin', 'lore:the-hrothi'],
  },
  // ----- Saltreach Isles
  {
    id: 'lore:brackhaven-auction', name: 'The Auction at Gull Rock', category: 'places',
    source: 'Invitation of the Salt League, delivered by hand to each bidder',
    unlockOn: [{ landmark: 'landmark:gull-rock-hall' }, { landmark: 'landmark:auction-vault' }],
    body: `“The Admiral of the Salt League presents her compliments, and invites the bearer to Gull Rock Hall in the outer isles, when the ice permits, for the sale of a single lot.

“Bids may be made in gold, in ships, in favours, or in any other coin the Admiral finds amusing.

“No blade shall be drawn in the Hall save by the Admiral’s champion.

“Salt will be shared at the door. Those who will not share it will be shown the sea.

“The League takes no side, keeps no creed and asks no questions. Come as you are. Leave as you can.”

Gull Rock Hall is a corsair hold cut into a sea-stack on the outermost of the Saltreach Isles: black rock streaked white with gulls, a hundred steps up from a landing-stage that the waves cover twice a day. Its name has nothing to do with the Gull Rocks off Brackhaven. The isle-folk call those its puppies.`,
    sections: [
      { id: 'bidders', title: 'The Bidders', hint: 'Everyone who wants the world’s fire is here.', body: `For the Lanternate, Benedetta Aurevine, Lord Vellane’s factor, whose grey-gloved clerk had twice called at the Salt Exchange: ten thousand gold, a pardon for every captain of the League, and the Church’s silence on the matter of Brackhaven for a hundred years. For the Ashen Creed, the Red Abbess herself, with a purse of old Imperial coin, every piece scorched black: “for the fire, which is everyone’s”. For the Qasiri, Samir ibn Ruqaya, who offered no gold at all, only a promise that whoever held it would be helped to keep it safe. For the Choir, no one at all. But the clerks found wet footprints on the stair each morning, leading up, and none leading down.` },
      { id: 'vault', title: 'The Strong-Room', hint: 'The lot is kept somewhere warm.', body: `The lot is kept in a strong-room cut below the waterline of the stack, behind a door of Orrun iron with three locks and a League corsair asleep against it. The rock around it sweats. In a winter that has frozen the harbour at Brackhaven, the sea for a cable’s length round Gull Rock steams, and the gulls stand on the warm stone in their thousands, and will not leave.` },
    ],
    related: ['lore:salt-league', 'lore:marisol-kestrel', 'lore:brackhaven', 'lore:qasiri-salt-law', 'lore:the-red-abbess', 'lore:saltreach-isles'],
  },
  // ----- Sunscar
  {
    id: 'lore:zahrun', name: 'Zahrun', category: 'places',
    source: 'The welcome of a Qasiri caravan-master, at the edge of the oasis',
    unlockOn: [{ landmark: 'landmark:zahrun' }, { landmark: 'landmark:cindermother-tent' }],
    body: `“Zahrun. The Bloom. Here the Sunscar drinks.

“You see palms; we see a ley. It runs up out of the deep sand and warms the spring, and the spring feeds the palms, and the palms feed us, and we have camped round it since the burning of the fated city. Forty clans come and go. There are no walls. The desert is the wall. There are no locks. Salt is the lock.

“Drink. The water is warm. In Zahrun the water is warm and the welcome is warmer; that is a saying, and it is also a law.

“You came from the north? Then you will find it strange, but it is true: this is the last warm place in Morvane. Or it was. Last month there was frost on the palm-tops at dawn. The children saw their first snow, and they danced in it. The grandmothers did not dance.”`,
    sections: [
      { id: 'tent', title: 'The Tent of the Cindermother', hint: 'At the centre of the oasis stands a tent with no door-flap.', body: `The Cindermother’s tent stands by the spring, black and red, and it has no door-flap, because the Cindermother refuses no one. Inside, braziers of cinderglass burn without smoke, and along the walls are racks of glass tablets older than the Lantern, each wrapped in undyed wool. Ruqaya al-Nar sits among them with a bowl of salt in her lap. She does not rise for anyone. She does not need to.` },
    ],
    related: ['lore:the-qasiri', 'lore:qasiri-caravans', 'lore:ruqaya-al-nar', 'lore:qasiri-salt-law', 'lore:the-ash-road', 'lore:sunscar'],
  },
  // ----- Cinder Wastes
  {
    id: 'lore:the-ash-road', name: 'The Ash Road', category: 'places',
    source: 'A counting-rhyme taught to Qasiri children, with a caravan-guide’s gloss',
    unlockOn: [{ landmark: 'landmark:ash-road-end' }],
    body: `“One is the well that is dry. Two is the glass that hums. Three is the dune that walks, so never sleep on Three. Four is the tower bent over. Five is the King’s cold oven. Six is the road of black mirrors; keep your eyes on your feet. Seven is the gate, and the gate is the end, and nobody counts past seven.”

The Ash Road is the only safe way across the Cinder Wastes: a line of glass posts and buried waystations running from the edge of the Sunscar to the gates of Qadir. Leave it, and the ash dunes take you, softly, as snow takes a sleeper. The Qasiri keep its stations in their children’s rhymes and nowhere else. They have never drawn a map of it, and they will not draw one for you. They will walk you along it, if the Cindermother says so, and they will not let go of your sleeve at Three.`,
    sections: [
      { id: 'waystations', title: 'The Waystations', hint: 'The Kings left records along the road.', body: `In the buried waystations, under the ash, the Ashen Kings’ scribes left glass tablets: ley-readings, taken at the same place every year for centuries, in a tidy hand. Your guide could read the numerals. They go down. Slowly, steadily, station by station and reign by reign, long before the Burning, the readings go down. “The fire coughed,” the guide said, as if quoting someone. Then he put the tablet back exactly where it had been and wiped his hands on the sand.` },
    ],
    related: ['lore:ruins-of-qadir', 'lore:zahrun', 'lore:the-ashen-kings', 'lore:burning-of-qadir', 'lore:cinder-wastes', 'lore:sunscar'],
  },
  {
    id: 'lore:ruins-of-qadir', name: 'The Ruins of Qadir', category: 'places',
    unlockOn: [{ landmark: 'landmark:qadir-gates' }, { landmark: 'landmark:glass-throne' }],
    body: `Qadir, the fated city, was built of glass: not windows set in stone, but glass entire, towers and domes and bridges of it, poured and blown by the Ashen Kings from the sand of their own desert with the heat of the leys. When the leys burned, the city did not fall. It melted. The towers slumped like candles in a draught and set again, crooked, with the fire still inside them. Even now, at dusk, light moves within the glass, slow and red, though no fire has been set in it for sixteen centuries.

The ash has risen to the second storey of every house. The great palace stands out of it like a ship out of a black sea, and in its throne-room, the Qasiri say, the last king still sits upon his throne of glass, and holds court for no one, and does not sleep.

Ashwyrms nest in the fallen domes. Their tracks are the only fresh marks in the ash.`,
    sections: [
      { id: 'creed-camp', title: 'The Creed in the Ruins', hint: 'Someone lives among the glass.', body: `In a fallen dome on the city’s western edge, the Ashen Creed keeps its last stronghold: a few hundred free mages, their families, and every forbidden tome they have ever smuggled out of the Empire. They have relit the Kings’ braziers. They teach the Ash tint in the open, aloud, to children, which no one has done in Morvane since the Wick-Edict. It is the one place you have been this winter where people laugh in the street. There is no street. They laugh anyway.` },
      { id: 'below', title: 'The Kings’ Stair', hint: 'The palace stairs go further down than a palace needs.', body: `Behind the Glass Throne a stair goes down. It is cut in rock, not glass, and much older than the palace above it, and the air that rises out of it is hot, and smells of metal, the way the air smelled at the bottom of the Vault beneath Korrath. The Qasiri call it the Kings’ Well. Your guide would not go within twenty paces of it. “It goes where they went,” he said. “Under. All the way under.”` },
    ],
    related: ['lore:the-ashen-kings', 'lore:ozrah-the-unsleeping', 'lore:burning-of-qadir', 'lore:cinderdrakes-and-ashwyrms', 'lore:the-red-abbess', 'lore:cinder-wastes', 'lore:ashen-creed', 'lore:the-kings-stair'],
  },
  // ----- Greywater
  {
    id: 'lore:the-breach', name: 'The Breach', category: 'places',
    source: 'Told by an eel-fisher of Fenwick at a refugee fire in the Kingsvale',
    unlockOn: [{ region: 'region:mirelands' }],
    body: `“It didn’t rise. That’s what I keep telling them. The Seep didn’t rise, not like a flood. It went in. It was like the whole fen was water going down a drain, only slow, and the drain was the sky.

“First the reeds bent toward it, all of them, a mile round, like they were listening. Then the stilts of Fenwick started leaning. Then it rained, only the rain was going up. I swear it on my mother. I stood on the jetty with rain falling off my face into the sky.

“And the sky over the Seep went black and round, like the middle of an eye when you bring a candle near it. And the singing started, the Choir, hundreds of them, out on the water. And the fen came apart. Not broke. Came apart, the way bread does in milk.

“There’s no Greywater now. There’s just what’s there instead.”`,
    sections: [
      { id: 'heart', title: 'At the Edge', hint: 'You stood at the heart of it.', body: `You reached the heart of the Seep as it opened. The Ashmark burned the black water back from its edge, and the edge came back, and you burned it again, and it came back again, patient as a tide. It could not be closed. The Choir was not fighting you. It did not need to. It was singing, and the Breach was the song. On the far side of the water, for a moment, there was a tall figure in white, with her hand raised, as a conductor raises her hand.` },
      { id: 'mirelands', title: 'What Lies Beyond', hint: 'What Greywater has become.', body: `Beyond the edge the land is unforged. Hills drift. A road you walked yesterday is a river today and a memory tomorrow. You saw Varn standing whole again, unflooded, with its bells ringing in the air, and a woman and a girl at the window of the lord’s hall, waving. It was not there when you looked again. The fen-folk call it the Hollow Sea. The Choir call it home.` },
    ],
    related: ['lore:the-black-seep', 'lore:greywater-marsh', 'lore:the-mire', 'lore:the-drowned-choir', 'lore:mirebeasts', 'lore:the-mirelands'],
  },
];

export default entries;
