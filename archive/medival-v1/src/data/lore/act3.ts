/** Codex: places, history, magic, characters and bestiary (Act III set). Owner: Claude 4. */
import type { LoreEntry } from '@/core';

const entries: LoreEntry[] = [
  // ----- places: the Haldmarch under siege
  {
    id: 'lore:the-siege-of-haldren', name: 'The Siege of Haldren', category: 'places',
    source: 'Orders of the day for the walls of Haldren, given by Ser Bryce Aldmere, Captain of the Gate, on Lanternmass eve',
    unlockOn: [{ landmark: 'landmark:haldren-river-gate' }, { landmark: 'landmark:lower-city' }],
    unlock: { flag: 'act3.siege_active' },
    body: `“To every captain of the walls. Read this to your men and then burn it. We need the fire.

“The enemy is on the plain. You have seen the camps: no tents, no horses, no cook-fires, only people standing in the snow in their thousands, facing the city, singing. Some of them are from Greywater. Some of them are from here. You will know faces. Do not call out to them. They will answer.

“The Drowned Knights will come at the main gate. The thralls will come at everything. The black water will come up the Hald behind them, so watch the river, and watch the drains, and if the drains start singing, send a runner to me.

“The walls are burning at the north tower. Let them burn. Stone does not, and fire is the one thing the Hollowed will not walk through.

“Every lantern in the city is to be filled and trimmed and kept unlit until dawn. Do not ask me why. Cinderhold asked it, and it is the only thing anyone has asked of me this year that made me less afraid.

“Hold until morning. Seven keep you. B. Aldmere.”`,
    sections: [
      { id: 'river-gate', title: 'The River Gate', hint: 'Someone meant to open it from inside.', body: `The River Gate lets the Hald into Haldren under a portcullis of oak and iron, and at the second hour of the night a man came to its winch-house with the Lord Protector’s seal and a key no one else in the city held. Osric Harrow had made a bargain with the Choir a long time ago: his lands spared, his gate opened. He kept it to the last. He was met there. What was done with him, and whether the portcullis came down again before the water reached it, the songs of Haldren tell three different ways, and every one of them ends with his name spat into the river.` },
      { id: 'burned', title: 'The Burning of the Lower City', hint: 'The Church had a remedy for the tide.', body: `When the water came up the drains, the Lord-Inquisitor gave the order he had drawn up a week before: fire the lower city, from Tanners’ Steps to Ashby Ford, and let the Hollowed tide break on the flames before it reached the keep. Wick soldiers went down the lanes with torches, knocking on doors as they went. Most of the people got out. The fire held the tide until dawn, exactly as he said it would. The Wick calls it the Firebreak. The people of Haldren call it the Wick’s Lanternmass, and do not say it kindly, and have not rebuilt.` },
      { id: 'saved', title: 'The Lower City Stands', hint: 'An order was given, and not obeyed.', body: `The order came down from the keep to burn the lower city, Tanners’ Steps and Ashby Ford and everything between, and the Wick soldiers stood at the head of the lanes with their torches lit, and did not go down. Someone had told them no who had the right to say it. The people of the lower city held their own streets that night with boat-hooks, cleavers and tanners’ knives, and held them. Every door in Tanners’ Steps has a lantern chalked on it now. The Wick has not asked them to wash it off.` },
    ],
    related: ['lore:haldren', 'lore:the-last-lanternmass', 'lore:osric-harrow', 'lore:castor-vellane', 'lore:drowned-knights', 'lore:cinderhold', 'lore:queen-aldith'],
  },
  // ----- places: the Mirelands
  {
    id: 'lore:the-mirelands', name: 'The Mirelands', category: 'places',
    source: 'Report of a Wick outrider to the Lord-Inquisitor, written at the edge of the Hollow Sea',
    unlockOn: [{ region: 'region:mirelands' }, { landmark: 'landmark:mireland-shore' }],
    body: `“To his Grace the Lord-Inquisitor, from the outrider at Fenwick Ridge, greeting.

“Your Grace asked for a survey. I cannot give one. The ground will not hold still long enough to be surveyed. Where the Greywater fens stood there is now a country that is not a country: low hills that drift a little every night, like cattle in a field; water standing in the air at the height of a man’s chest; rain that falls upward and does not come down.

“Things are there that were not there before. I saw the bell-tower of Varn, whole, rising out of a meadow that was never a meadow. I saw a procession of lanterns going out across the water with no one carrying them.

“Brother Benedek, who rode with me, went down to the shore on the second evening to fill our water-skins. He said his mother was there, hanging out washing. He has not come back. I am told she died of the Grey Lung in 1163.

“It is heresy made into land, your Grace. I do not know how one burns a land. I await instructions.”`,
    sections: [
      { id: 'shore', title: 'The Shore', hint: 'Where the black-seep ended, the Dreaming begins.', body: `Where the Black Seep was, the land simply stops being sure of itself. The reeds are white to the root. The mud is warm and soft as risen dough, and the line of the shore is wherever you last looked at it. When you laid the Ashmark on the ground, it showed you the old fen underneath, faint as a drawing under paint: the causeway, the eel-weirs, the stilts of Fenwick. Then the paint closed over it again. Behind you was the Haldmarch. Ahead was the Hollow Sea, and on its far side, very small, a white spire.` },
      { id: 'memory', title: 'Memory Made Matter', hint: 'Here, what is remembered is real enough to touch.', body: `In the Mirelands a memory weighs as much as a stone. Remember a thing hard enough and it stands up out of the water in front of you: a door, a dog, a well you drank from as a child. The Grey Monks say the Mire is what the world was before anything was decided, and that here, where the Heartfire’s grip has slipped, the world is being undecided again. The danger, they say, is not the things you remember. It is the things down there that remember you.` },
    ],
    related: ['lore:the-breach', 'lore:greywater-marsh', 'lore:the-unmade-road', 'lore:the-drowned-cathedral', 'lore:the-mire', 'lore:the-dream-memories'],
  },
  {
    id: 'lore:the-drowned-cathedral', name: 'The Drowned Cathedral', category: 'places',
    unlockOn: [{ landmark: 'landmark:drowned-cathedral' }],
    body: `On the far side of the Hollow Sea stands the Cathedral of the Brand. Not the one in Solenne: the one Ysolde remembers.

It is built of black water held in the shape of white stone. The Ithren Door stands open, and the nave runs three hundred paces to the altar between seventy pillars, every one of them perfect but the last, which is hers, and which is still unfinished, as it was on the day she left. The floor is a still pool that bears your weight. Your reflection walks beneath you, upside down, a step behind.

Above the altar hangs the Great Lantern, uncracked and whole and full of water. Something moves in it, slowly, like a coal turning over in its sleep.

There are no pilgrims here. There are the Choir, kneeling in rows down the nave with their faces in the water, singing very softly; and there is the Font of Saint Solenne, overflowing, as by the look of the floor it has overflowed every day for two years.`,
    sections: [
      { id: 'window', title: 'The Window', hint: 'The Keeper’s rooms are here too.', body: `Behind the altar a stair goes up to the Keeper’s rooms: three small cells, exactly as they are in Solenne, the narrow bed, the writing-desk, the window facing north. On the sill stands a candle in a dish. It has never been lit; there is no fire in this place to light it with. The wick is trimmed. The dish has been lifted and set down again so many times that the sill is worn into rings, and you have seen those rings before, on a window-sill in Solenne, where Sister Ilse swore she never brought a cup.` },
    ],
    related: ['lore:cathedral-of-the-brand', 'lore:ysolde-maerin', 'lore:the-mirelands', 'lore:the-drowned-choir', 'lore:the-seventh-ember'],
  },
  // ----- places: the Heartforge
  {
    id: 'lore:the-heartforge', name: 'The Heartforge', category: 'places',
    source: 'Cut above the sealed gate beneath the Vault of the Nine Nails, in the old rune of the Fathers',
    unlockOn: [{ region: 'region:heartforge' }, { landmark: 'landmark:heartforge-gate' }],
    body: `“What lies beneath the mountain is the Holds’ affair.

“Here the Fathers went down. Here the Fathers came up again, and went out to the ridges, and stopped. Let no child of the Holds pass this gate who means to warm the maker, for the maker is not cold. He is tired.

“Korr nagh. We hold the door.”

Below the gate the stair goes down for a day and a night, through rock that grows warmer at every step, until it is as warm as a body; and then the rock gives way to something that is not rock. It is ribbed, and curved, and red-black, and it beats. This is the Heartforge: the forge-chamber at the bottom of the world, where Orr struck the world out of the Mire, and where his heart lay down when he was spent. The air is thick as forge-smoke and smells of iron and of rain. Far below, a light swells and fades, and swells, and between one swelling and the next you can count to twenty.`,
    sections: [
      { id: 'seal', title: 'The Seal', hint: 'The gate was not meant to open.', body: `The gate is a single slab of true-iron cut with the hold-fast rune, and it opens for three things only: the High Thane’s word, the oath-ring of a clan that remembers what the gate is for, or a fire older than the iron. It has been opened before. Low on its face, the rune has been recut, cleanly and recently: six years ago, perhaps, or seven. Someone in Korrath let a guest go down in 1181, mended the seal behind her, and cut that year’s page out of the oath-ledger with a knife.` },
      { id: 'footprints', title: 'Two Pilgrims', hint: 'Others came this way before you.', body: `In the ash on the stair there are footprints, small and bare. One set is old beyond reckoning, pressed into ash that has hardened to stone, and the right foot drags a little, as if its owner were carrying something heavy in that hand. Beside them, stepping exactly in them, is a second set, and the second set is wet. Both go down. Only the old set comes back up. Whoever made the wet ones did not leave the Heartforge by the stair.` },
    ],
    related: ['lore:vault-of-the-nine-nails', 'lore:the-kings-stair', 'lore:the-anvil-of-ribs', 'lore:the-heartfire', 'lore:saint-solenne', 'lore:the-iron-concord-treaty', 'lore:the-ironspine'],
  },
  {
    id: 'lore:the-anvil-of-ribs', name: 'The Anvil of Ribs', category: 'places',
    unlockOn: [{ landmark: 'landmark:the-anvil-of-ribs' }],
    body: `“He drew a coal from his own chest and laid it on the anvil of his ribs, and he struck it.” So the Canticle. The priests have always taken it for a figure of speech.

It is not. Halfway down the Heartforge the chamber opens out beneath a vault of ribs, each one as broad as an Orrun bridge, curving up into the dark and meeting overhead. Beneath them, on a floor of black slag, stands the anvil: a single block of true-iron the size of a chapel, its face worn hollow by the blows that made the world. The marks are still there. Seven of them, deep and round, each crusted with heartstone that glitters red where a Spark flew.

The Wrought keep this place. They do not walk their rounds here as they do in the Vault. They stand about the anvil in a ring, facing outward, as mourners stand about a grave, and they have stood so since the First Age. Lately the black water has begun to well up between the slag, and the Drowned Things with it, and the Wrought have begun to move.`,
    sections: [
      { id: 'eighth', title: 'The Eighth Mark', hint: 'The Canticle says the hammer slipped.', body: `The Canticle says that on the eighth blow the hammer slipped. There is an eighth mark on the anvil, at its very edge, and it was made by no hammer. It is long and shallow and five-fingered: the mark of a hand that took hold of the anvil’s edge, and held on, and then let go. Below it the slag falls away into black water. Nothing slipped here. Something climbed down.` },
    ],
    related: ['lore:the-heartforge', 'lore:the-forging', 'lore:wrought-sentinels', 'lore:heartstone', 'lore:nhal-the-drowned', 'lore:drowned-things'],
  },
  {
    id: 'lore:the-kings-stair', name: 'The Kings’ Stair', category: 'places',
    source: 'Glass tablets set into the walls of the stair beneath Qadir, read by lamplight on the way down',
    unlockOn: [{ landmark: 'landmark:kings-stair' }],
    body: `“Haddar came down this far, and heard it, and was afraid, and went up again.”

“Nasrin came down this far, and lined the walls with glass, that the heat should not be lost.”

“Tariq came down this far with his drakes, and the drakes would go no further.”

So the tablets go, king by king, each set into the stair at the depth that king reached, each a little lower than the last: seven-and-twenty kings, and seven-and-twenty tablets, and the stair going on below them all, cut in rock far older than Qadir and hot as an oven’s breath. The Qasiri have not set foot on it since the Burning. They say it is the back door of the world.

The last tablet is not glass. It is a smear of gold, melted onto the wall at the very bottom, where the rock gives way to the ribbed red dark of the Heartforge. Something was written in it with a fingertip while the gold was still soft. It says: “Ozrah. This far.”`,
    sections: [
      { id: 'blessing', title: 'The Cindermother’s Blessing', hint: 'No Qasiri would let you go down without it.', body: `At the head of the stair Ruqaya al-Nar put a pinch of salt on your tongue and a thumb of ash on your brow. “We are the grandchildren of thieves,” she said. “Our fathers went down to save the fire, and burned the world doing it. Go down for us. Do not try to save it the way they did. They wanted to keep it. No one keeps a fire, child. You sit with it.” Then she turned her back on the stair, as Qasiri do at a grave, and did not watch you go.` },
    ],
    related: ['lore:ruins-of-qadir', 'lore:the-ashen-kings', 'lore:ozrah-the-unsleeping', 'lore:ruqaya-al-nar', 'lore:the-heartforge', 'lore:cinder-wastes'],
  },
  // ----- history
  {
    id: 'lore:the-last-lanternmass', name: 'The Last Lanternmass', category: 'history',
    source: 'The Haldren Chronicle, kept by the clerks of the cathedral close',
    unlockOn: [{ interact: 'obj:haldren-great-lantern' }],
    unlock: { any: [{ flag: 'act3.siege_outcome', op: '==', value: 'held' }, { flag: 'act3.siege_outcome', op: '==', value: 'fallen' }] },
    body: `In this year, on the night of Lanternmass, the Hollowed came against Haldren out of the east in such numbers as no one living had seen, and the black water with them, and the walls burned from the north tower to the river.

And every ally the Ashmarked had won came to the city that night, those that would come. The names of those that did not come are also written down, in another place.

And an hour before dawn the word went round the walls from Cinderhold: light everything. And the people of Haldren, who had hoarded their oil all winter against the dark, took down every lantern in the city: the chapel lamps and the tavern lamps, the horn lanterns of the watch, the paper lanterns the children had made for a feast no one had kept, the lamps in the windows of the dead. Twelve thousand, the clerks reckoned afterwards. They lit them all at once, from the Great Lantern in the market, as the sun came up behind the Hollowed host.

It was the last Lanternmass, the clerks wrote. Whether they meant the last of the old world or the first of a new one, they did not say.`,
    sections: [
      { id: 'held', title: 'The City Held', hint: 'What the dawn showed.', body: `When the light went up, the Hollowed on the walls stopped where they stood and turned their faces to it, and many of them wept black tears, and some of them fell down and were only people, cold and frightened and alive. The tide broke. By full morning the plain was empty but for the dead and a great trampled road of footprints going back into the east. Every bell in Haldren rang, for the first time in two years. In the market someone began the Lantern Carol, badly, and the whole city took it up.` },
      { id: 'fallen', title: 'The City Fell', hint: 'Not every dawn is a victory.', body: `The lanterns were lit, and it was not enough. The water came through the walls before the sun was fully up, and the banners came down from the keep before noon. The survivors went north to Cinderhold in a line six miles long, through the snow, carrying their lanterns still lit; and all that night the crag above the Kingsvale shone with them like a second dawn. Haldren is a drowned city now. On clear nights you can still see lights in some of its windows. No one goes down to find out whose.` },
    ],
    related: ['lore:the-siege-of-haldren', 'lore:lanternmass', 'lore:haldren', 'lore:cinderhold', 'lore:night-of-falling-ash'],
  },
  // ----- magic
  {
    id: 'lore:the-heartfire', name: 'The Heartfire', category: 'magic',
    unlockOn: [{ landmark: 'landmark:heart-of-orr' }],
    body: `Every priest in Morvane has a word for it, and none of them has seen it. You have.

It is a heart. Not a fire in the shape of one, not a holy figure for one: a heart, as great as a hold-hall, red-black and ridged and slow, lying where Orr’s chest once was, at the bottom of the world. It beats. Between one beat and the next you could count to twenty. When the Fathers came down, it was faster. When Ozrah came down, it was slower. Its heat goes up into the world through the leys as blood goes up through veins.

And under it, pressing up against it as the sea presses on a ship’s hull, is the Mire. The heart does not burn the Mire. It holds it, the whole dreaming weight of it, as a hand holds a door shut. That is what the Forging was, and that is what every hearth-fire in the world has been borrowed from. The leys are not cooling because the fire is going out. They are cooling because the heart is tired. It has held that door alone since the beginning of the world.`,
    sections: [
      { id: 'hollow', title: 'The Hollow in the Heart', hint: 'There is a place where something was taken.', body: `On the heart’s flank, where the ridges run together, there is a hollow the size of a child’s fist, its edges glassed and very old. The Brand was no larger than a child’s fist. Saint Solenne did not find a coal lying by the fire. She took it out of the heart, and the heart let her, and for twelve centuries it has beaten a little slower round the wound. When the Embers came near, the hollow glowed, as a gum aches for a missing tooth. They know where they belong. Whether taking it was a theft or a mercy, the world above was warm for eleven hundred years because of it.` },
    ],
    related: ['lore:the-heartfire-and-leys', 'lore:the-forging', 'lore:the-brand', 'lore:saint-solenne', 'lore:the-keeper', 'lore:the-heartforge'],
  },
  {
    id: 'lore:the-keeper', name: 'The Keeper', category: 'magic', hidden: true,
    source: 'From the sealed shelves of the Ossuary of Saint Calder: “On Keepers”, a record of dreams',
    unlockOn: [{ interact: 'obj:heartfire' }],
    body: `Every hearth in the Haldmarch has a keeper. It is the oldest office in the world, and it has no rank: the one who sits up with the fire, who banks it at night, who does not let it go out in winter. Old women, mostly. The Old Hearth says the first keeper was Orr.

Orr was the smith of the world, and a forge is kept by its smith. When he lay down, the forge had no one. His heart burned on alone beneath the mountains, holding the Mire down, through every age; and everyone who has gone down to it since has misunderstood it. The Fathers tried to warm it. Ozrah tried to become it. Saint Solenne sat with it for forty days, and was the only one who understood, and came away anyway, carrying a piece of it, and was sorry for the rest of her life.

A keeper is not a heart. A keeper does not burn, and does not rule, and need not be worshipped. A keeper stays. That is the whole of the office. It is the hardest thing in the world.

Nhal does not wish to keep the heart. Nhal wishes to be it. That is the difference, and it is everything.`,
    sections: [
      { id: 'hand', title: 'The Bandaged Hand', hint: 'Why the saint’s hand was bound.', body: `When you laid the Ashmark on the heart, it did not burn you. It took hold, the way a hammer-haft settles into a smith’s palm, and for a moment you could feel the whole weight of the door it holds, and the Dreaming asleep against the other side of it. Then you understood the oldest icons in Solenne, the ones where the saint’s right hand is bound in linen to the wrist. She had held the heart, too. Her hand never cooled afterwards. It was the keeper’s mark, and she hid it, because she had not stayed.` },
    ],
    related: ['lore:the-third-way', 'lore:the-heartfire', 'lore:saint-solenne', 'lore:the-ashmark', 'lore:ozrah-the-unsleeping', 'lore:nhal-the-drowned'],
  },
  {
    id: 'lore:the-seventh-ember', name: 'The Seventh Ember', category: 'magic',
    source: 'The examination of Seraphine, verger of the Cathedral of the Brand, before the Order of the Wick at Valcastre',
    unlock: { flag: 'act3.embers_complete' },
    body: `Q. What did you see when the star fell?
A. I have told you. I was trimming the lamps in the south aisle. The Saint was at the altar. Saint Ysolde. She was dead, they said, and she was at the altar, and she was wet.

Q. What did she do?
A. She poured something on the Brand out of her two hands. It hissed. It went dark. And then it broke, and the light came out of it all at once, in seven pieces.

Q. Where did they go?
A. Six went up, through the Great Lantern and the roof of the nave. I heard the clerestory glass come down like hail. The seventh did not go up.

Q. Where did it go?
A. Into her hand. She held up her hand and it went to her, as a hawk goes to the glove. She closed her fingers on it, and the light came out between them, white and gold, and she wept, and walked out by the Ithren Door.

Q. Why did you not stop her?
A. Because she looked at me as she went by, brother. She looked sorry.

[In the margin, in the Lord-Inquisitor’s hand:] Not to be released.`,
    sections: [
      { id: 'seven', title: 'Seven', hint: 'What happens when they are all together.', body: `When the seventh Ember came into your hand, the other six rose up inside the Ashmark to meet it, and for a moment there was no scar at all, only light, the colour of every Spark at once. Then it settled. For the first time since the night on the moor the mark did not hurt. You could feel the heart at the bottom of the world, beating, very slowly, like someone asleep in the next room. And you could feel something else turn its attention toward you from under the water, and say nothing. That was new.` },
    ],
    related: ['lore:the-seven-embers', 'lore:night-of-falling-ash', 'lore:the-brand', 'lore:ysolde-maerin', 'lore:the-ashmark', 'lore:valcastre'],
  },
  // ----- characters
  {
    id: 'lore:ysolde-maerin', name: 'Ysolde Maerin', category: 'characters',
    source: 'Entered in the archive of memory at the Ossuary of Saint Calder, where the Grey Monks keep the lives of the dead',
    unlockOn: [{ landmark: 'landmark:drowned-cathedral' }],
    unlock: { any: [{ flag: 'act3.ysolde_fate', op: '==', value: 'turned' }, { flag: 'act3.ysolde_fate', op: '==', value: 'slain' }, { flag: 'act3.ysolde_fate', op: '==', value: 'spared' }] },
    body: `She was born in the vineyards above Solenne, the youngest of seven, and as a child she lay with her ear to the earth because she could hear the fire singing. In her twelfth year an old woman from the north came to lodge with the family, and came back every summer after, and taught her to lay her palms flat on the ground and listen properly. The woman was an Emberwarden and a heretic, and the only teacher Ysolde ever loved.

She took the white of the Lightsworn and sat with the dying of the Grey Lung for seven years, and they died. Then she went north up the Hald, and they rose, and the Church made her a saint. In 1178 it gave her the Brand to keep. She looked into it. It was tired, and dying, and behind it in the dark something kind was waiting, and it said we.

She believed it, because she had watched too many people die slowly to bear the thought of a whole world doing it. In 1181 she went down to the bottom of the world alone. In 1186 she put out every hearth in Morvane, out of mercy.

She was wrong. She was not wicked. The monks write down both, because both are true.`,
    sections: [
      { id: 'turned', title: 'Turned', hint: 'In the drowned cathedral, she was shown.', body: `In the cathedral she had dreamed, where the Mire was thin enough that Nhal had to show its face, she looked at last, and saw what had been holding her: not a friend, but a mouth that had learned to speak softly. She knelt, as she had always knelt before the sick, and laid her palms flat on the water. Then she opened her hand. The Ember of the Lantern lay in it, and she gave it to you. The water stopped running from her eyes. She was cold, and shaking, and alive, and she asked for a blanket like anyone else. The monks record that she was the first of the Drowned ever to come back of her own will.` },
      { id: 'slain', title: 'Slain', hint: 'It ended in the cathedral she dreamed.', body: `She fought as she had healed, without hatred and without stopping. When she fell, the cathedral of black water began to come down around her, pillar by pillar, the last and unfinished one first, which was hers. The Ashmark’s light was on her face. “Warm,” she said, wondering, as though she had found something she had lost. “I’d forgotten.” Then the water ran out of her hair and pooled on the floor at last, as it had never done, and she was still. The Grey Monks have not entered her among the saints. They have entered her among the dead they remember, which they say is better.` },
      { id: 'spared', title: 'Spared', hint: 'You let her live.', body: `She lives. The Mire went out of her when the Ember did, and took most of what she was along with it. What is left is a thin, grey, shivering woman who cannot get warm, and whose hands, when she lays them on the ground, hear nothing any more. She does not ask to be forgiven. She asks for a place near a fire, and sits as close to it as anyone will let her, and watches it for hours, as if it were a patient she had been told might not last the night. Sometimes, when she thinks no one is near, she talks to it.` },
    ],
    related: ['lore:ysolde-the-pale-saint', 'lore:hesta-corrow', 'lore:the-grey-lung', 'lore:the-brand', 'lore:the-drowned-cathedral', 'lore:the-seventh-ember', 'lore:nhal-the-drowned', 'lore:the-drowned-choir'],
  },
  // ----- bestiary
  {
    id: 'lore:drowned-things', name: 'Drowned Things', category: 'bestiary',
    source: 'Brother Ossory of the Grey Monks, on the things that walk the Hollow Sea',
    unlockOn: [{ kill: 'enemy:drowned-thing' }],
    body: `“You will want to call them Hollowed. They are not. The Hollowed were people once, and the Mire got into them. The Drowned Things were never people. They are what the Mire dreams people are.

“Down there, in the Dreaming, there is no one, only the memory of everyone. Every soul that has drowned in black water since the Forging has left its impression there, as a body leaves its impression in a bed. Where the Mire comes up into the world, as it has come up now, those impressions stand up and walk. They have the faces. They have the voices, near enough. They have none of the rest.

“They are pale, and wet, and taller than they ought to be, and they move as if under water even on dry ground. They will call you by the names of people you have lost, and they will be very nearly right.

“Do not answer them. Do not grieve for them. Burn them, if you can. There is no one inside to hurt.”`,
    sections: [
      { id: 'faces', title: 'Faces You Know', hint: 'Sometimes they are wearing someone.', body: `After the third one on the Unmade Road you stopped looking at their faces. One was Abbess Morwen, still ringing a bell that made no sound. One was a girl from Fenwick, with her hair still in its ribbons. And one, for a moment, before the Ashmark took it, was your own: drowned and patient and smiling, as you would have been if the falling star had missed you on the moor, and the water had come for you like everyone else.` },
    ],
    related: ['lore:the-unwrought', 'lore:the-hollowed', 'lore:the-mirelands', 'lore:the-unmade-road', 'lore:mirebeasts'],
  },
  {
    id: 'lore:nhal-risen', name: 'Nhal Risen', category: 'bestiary',
    unlockOn: [{ kill: 'enemy:nhal-risen' }],
    unlock: { flag: 'act3.nhal_offer', op: '==', value: 'accepted' },
    body: `At the Heart of Orr the black water stands up out of the floor, and it is Nhal.

It is not one shape. It is every shape the Mire has ever dreamed, rising through one another like faces in a river: a child, a white stag, a giant of rusted iron, an Aelthi singer with her mouth open, a king in a crown of glass, a woman in white with water running from her hair. At the centre of all of them is something small and bright that might once have been a Spark, before it spent an age at the bottom of the sea; and it is the only part of Nhal that is not smiling.

It wants to lie down in the heart’s place. It has wanted that so long that it has forgotten how to want anything else. It speaks in your voice and in Ysolde’s, and it says “we”, and it says that it is sorry, and it is. That is the terrible thing. Its pity is real. It has only grown hungry.

The Wardens have no lore for fighting a god. The Ashmark does not need any. It was made for exactly this.`,
    sections: [
      { id: 'last', title: 'The Last of the Eighth', hint: 'Something was left when it broke.', body: `When it broke, the faces fell back into the water one by one, the woman in white last of all, and the small bright thing at the centre was left lying on the slag like a dropped coin. It was cold. It said nothing. You thought, though you could not have said why, that it might have been relieved. Then it went out, or down, or home. That night, the Hrothi say, the wind over the Frostreach howled once, very loud, and then was still for the first time since the world was made.` },
    ],
    related: ['lore:nhal-the-drowned', 'lore:the-mire', 'lore:the-heartfire', 'lore:the-anvil-of-ribs', 'lore:calun-the-wanderer'],
  },
];

export default entries;
