/** Codex: cosmology, gods, magic, history (prologue set). Owner: Claude 4. */
import type { LoreEntry } from '@/core';

const entries: LoreEntry[] = [
  {
    id: 'lore:the-forging', name: 'The Forging', category: 'cosmology',
    source: 'Canticle of the Anvil, verses I–VII (Lanternate liturgy)',
    body: `Before the world there was only the Mire: a black sea without bottom, shore or shape, in which nothing was and everything might be.

Out of the Mire rose Orr, who was the first thing to want to be one thing. He drew a coal from his own chest and laid it on the anvil of his ribs, and he struck it. Stone from the first blow, sea from the second, sky from the third. From every blow a Spark flew, and every Spark became a god.

Seven blows, seven Sparks. On the eighth the hammer slipped, and the Spark that flew fell back into the Mire and was drowned.

When the world was made, Orr was spent. He lay down across it, and his bones became the Ironspine. His heart, still burning, sank into the deep places, and there it burns still. All warmth is borrowed from it.`,
    sections: [
      { id: 'aelthi', title: 'The Aelthi Telling', hint: 'Another people tell this story differently.', body: `The Aelthi of the deep woods sing the same story with one word changed. Where the Canticle says Orr "rose out of" the Mire, the old song says he "tore himself from" it. Where the Canticle says the world was "made", the song says it was "taken".

"The sea was not empty," their loremasters say. "It was asleep, and it was dreaming us."` },
      { id: 'truth', title: 'What the Heartfire Holds', hint: 'Revealed far from here.', body: 'The Forging was a binding as much as a making. The Heartfire does not only warm the world. It holds it down.' },
    ],
    related: ['lore:the-seven-sparks', 'lore:the-mire', 'lore:the-heartfire-and-leys', 'lore:the-ironspine'],
  },
  {
    id: 'lore:the-seven-sparks', name: 'The Seven Sparks', category: 'gods',
    source: 'Brindlecross chapel, painted rood-screen',
    body: `Seven gods flew from Orr's hammer, and the Haldish week keeps a day for each. The Lanternate names Ithren first among them. The village hearths name them as siblings, no one above another.

Ithren, the Lantern: light, truth, law, kingship. White-gold.
Vor, the Hammer: craft, war, endurance and oaths. Iron-grey.
Saela, the Tide-Mother: water and cold, mercy, and the passage of the dead down the River Under. Sea-blue.
Kethra, the Thorn: the wild, the hunt, growth and rot. Green-brown.
Morrow, the Veiled: death, memory, dreams and secrets. Grey.
Ashvar, the Ember-Tongue: fire, passion, change and rebellion. Red.
Calun, the Wanderer: wind and storm, roads, luck and tricks. Violet.`,
    sections: [
      { id: 'eighth', title: 'The Eighth', hint: 'A name the Church forbids.', body: `There is no eighth day in the Haldish week. Heretics call that a joke and the Church calls it a mercy. The Drowned Spark, the Spark that fell back into the Mire, has a name, and speaking it is a crime in the Empire. Cultists say "the Drowned One", or simply "Below".` },
    ],
    related: ['lore:the-forging', 'lore:the-lanternate', 'lore:ithren-the-lantern', 'lore:vor-the-hammer', 'lore:saela-and-the-river-under', 'lore:kethra-the-thorn', 'lore:morrow-the-veiled', 'lore:ashvar-the-ember-tongue', 'lore:calun-the-wanderer', 'lore:nhal-the-drowned'],
  },
  {
    id: 'lore:the-mire', name: 'The Mire', category: 'cosmology',
    body: `What was before the world, and is still beneath it. The Lanternate teaches that the Mire is the Unmade: formless, hungry, and the enemy of all that is. Where it seeps up through the ground the water turns black, the reeds grow pale, and living things begin to change.`,
    sections: [
      { id: 'old-sleeper', title: 'The Old Sleeper', hint: 'A hedge-witch sees it differently.', body: `"You'll hear priests call it evil," says Nan Briar, stirring her pot. "Is the sea evil? Is sleep? It was here first, love. It was dreaming, and Orr woke it with a hammer, and it's been tossing in its bed ever since. Everything that's hungry was something else first."` },
      { id: 'below', title: 'Below', hint: 'Written in a hymnal you should not have.', body: `From a Drowned Choir hymnal, in a careful village hand:

"Below there is no winter. Below there is no hunger. Below my Edith is sleeping, and she is not cold, and she is not afraid. The water is a door. Ooluun ae Nhal, maa'reh suun."` },
      { id: 'dreaming', title: 'The Dreaming', hint: 'The Aelthi have an older word.', body: 'The Aelthi call it Ae’Hun, the Dreaming, and they grieve for it.' },
      { id: 'nhal', title: 'The One Below', hint: 'Something in the Mire is awake.', body: `The Mire is not only a sea, and not only a dream. Something in it is awake. The Choir has always said so: Ooluun ae Nhal, below is Nhal. You took it for a creed. It is an address. Since the Embers began to speak in another voice, you have felt it whenever you stand near black water: an attention, vast and patient and fond, like a hearth-cat watching a mouse-hole. It pities you. It says so, often. It has had a very long time, alone in the dark, to decide what pity is for.` },
    ],
    related: ['lore:the-forging', 'lore:the-hollowed', 'lore:the-unwrought', 'lore:the-drowned-choir', 'lore:nhal-the-drowned', 'lore:the-lullaby'],
  },
  {
    id: 'lore:the-heartfire-and-leys', name: 'The Heartfire and the Leys', category: 'magic',
    source: 'A Warden’s Primer, ch. I (Emberwarden text, banned since 1041 YL)',
    body: `Orr's heart burns at the bottom of the world. We call it the Heartfire. Its heat rises through the rock in veins we call leys, the way warmth rises through a sleeping body. Where a ley runs close you will find hot springs, green grass in winter, and the old holy places.

A mage is one whose body can draw that heat. The heat drawn is called ember. Each of the Seven tints it differently. Draw with Ashvar's tint and you make fire; with Saela's, cold and water; and so on through the schools.

Draw more than the body can carry and it scars. The first sign is the cough with ash in it: cinderlung. The last sign is a pile of ash where a mage stood. Remember Qadir.`,
    sections: [
      { id: 'cooling', title: 'Margin Note', hint: 'Someone wrote in the margins.', body: `In faded ink, in the margin of the Primer: "The draws grow weaker every decade. Reported to Solenne, 1038, 1039, 1040. No reply."` },
      { id: 'dead-coal', title: 'Dead Coal', hint: 'A smith has noticed something.', body: `Hild Coalbrook's forge will no longer hold its heat. "It's not the coal," she says. "It's what's under the coal. The ground's gone cold, like a hearth nobody's fed." Ley-coal, dug from where the veins still glow, burns as it should. For now.` },
    ],
    related: ['lore:the-ashmark', 'lore:the-emberwardens', 'lore:the-brand', 'lore:the-heartfire'],
  },
  {
    id: 'lore:the-brand', name: 'The Brand', category: 'history',
    body: `In 0 YL a shepherd-girl called Solenne went down into the deep places beneath the Ironspine and came back carrying fire: a coal of the Heartfire itself that never dimmed and never burned the hand that held it. Around it she founded the city that bears her name, and around the city the Lanternate grew.

For eleven hundred and eighty-six years the Brand burned in the Cathedral of Solenne. Every lantern-flame in every major chapel of the Empire was lit from it and carried north by pilgrims. To the faithful it was proof: the gods had given the world's light into the Church's keeping.`,
    sections: [
      { id: 'last-wick', title: 'The Last Wicks', hint: 'Some of its fire still burns.', body: 'A handful of lanterns lit directly from the Brand before the Quench still burn. The Order of the Wick guards them jealously. They flare in the presence of Ember-touched things.' },
    ],
    related: ['lore:night-of-falling-ash', 'lore:the-lanternate', 'lore:the-seven-embers', 'lore:saint-solenne', 'lore:cathedral-of-the-brand'],
  },
  {
    id: 'lore:night-of-falling-ash', name: 'The Night of Falling Ash', category: 'history',
    body: `Lanternmass, 1186 YL. In the cathedral at Solenne the Brand went dark. Witnesses spoke of a pale figure at the altar and black water hissing on the coal. Then the sky over Morvane split with falling stars: seven of them, burning white, scattering across the land.

Ash fell for three days. In the east the town of Varn burned and then drowned. Every hedge-mage in the Haldmarch felt their power gutter like a candle in a draught. Spring has not come since.

In Brindlecross they remember it as the night the star fell into Wennamere and the abbey sank.`,
    related: ['lore:the-brand', 'lore:the-seven-embers', 'lore:lanternmass', 'lore:saint-wenna', 'lore:ysolde-the-pale-saint'],
  },
  {
    id: 'lore:the-seven-embers', name: 'The Seven Embers', category: 'magic', hidden: true,
    body: `The Brand did not simply go out. It broke, and its pieces fell burning across the world: seven Embers, each a living shard of the Heartfire.

Whoever gathers them holds the last true fire in Morvane. Everyone will want them.`,
    sections: [
      { id: 'mere', title: 'The Ember of the Mere', body: 'Recovered from the reliquary of the Drowned Abbey of Saint Wenna, in Aldermoor. It did not stay in your hand. It went into it.' },
      { id: 'fen', title: 'The Ember of the Fen', hint: 'Lost in the drowned east.', body: `Claimed from the flooded hall of Varn, where Aldwin Varn had kept it a year beneath the black water without its going out. It burns with a low green-gold light, like marsh-fire, and it is heavier than it looks. When you took it up, the Pale Saint was in the hall. Not a vision this time: Ysolde herself, standing upon the water, her hand held out for it. She reached for it, and was stopped, and what the stopping cost is written elsewhere. Before she went she looked at you with something like tenderness. “Stay alive, little spark,” she said. “I need you.”` },
      { id: 'deep', title: 'The Ember of the Deep', hint: 'Fallen beneath the mountain.', body: `It fell through a thousand feet of the Ironspine to lodge in the wound between two failed Nails, and for a year it held the Mire down where true-iron could not. It burns forge-red at the heart and iron-grey at the edges, and it is heavier than any Ember has a right to be, as though it remembers the weight it was holding. Whether the lower holds of Korrath drowned for it, or a new Nail was driven in its place, is written in the Concord’s ledger. When it came into your hand, every Ember you carry grew warmer at once, and far beneath your feet something turned over in its sleep.` },
      { id: 'wolf', title: 'The Ember of the Wolf', hint: 'Fallen in the frozen north.', body: `It struck the speaking-stone of the Wolf-Moot out of a clear sky and melted itself into it, and the clans called it Calun’s Eye and came from every fjord to kneel before it. It burns a storm-violet white, and it crackles when it is held, like the air before lightning. Whether the north gave it to you or you took it from them in the night, the skalds will be singing about it for a long time. It is the only Ember that has ever felt, in your hand, as though it wanted to be somewhere else.` },
      { id: 'tide', title: 'The Ember of the Tide', hint: 'Fished from the western sea.', body: `It fell into the sea west of the Gull Rocks, boiled the water round it for a season, and was hauled up in a fishing-net by the smack Saela’s Cup. It burns a cold sea-blue at the edges and white at the heart, and it is always wet, though nothing drips from it. Salt crusts on it overnight and is gone by morning. The Salt League’s book records its passing in a single line in the Admiral’s hand: “Lot the first. Gone.” It does not say to whom, or how. The Admiral says that is the League’s business, and laughs.` },
      { id: 'glass', title: 'The Ember of the Glass', hint: 'Fallen in the ruins of a burned city.', body: `It fell through the glass roof of the palace of Qadir and lay at the foot of the Glass Throne, where an ashwyrm curled round it for a year as a cat curls round a hearth. It burns red-orange, the colour of Ashvar, and the light inside it moves slowly, like the light inside Qadir’s melted towers. It tastes of smoke when it is near your mouth. When it joined the others, for a moment you saw the Kings’ Stair behind the throne going down, and down, and heard a dead king saying: Tell her.` },
      { id: 'lantern', title: 'The Ember of the Lantern', hint: 'Kept by the one who broke the Brand.', body: `It never left Solenne on the Night of Falling Ash. It went into Ysolde’s hand, and she carried it for two years, through the reed-temples of the Choir and the Hollow Sea, closed in her fist. It burns white-gold, the colour of Ithren and of the Hierophant’s robe, and it is the only Ember that is cold to the touch until it is held, and then very warm, as a hand is warm. Whether she opened her hand to you or it was opened for her, the drowned cathedral went quiet as it passed between you. With seven in your hand there is no Brand any more, and no Embers: only the fire, whole again, waiting to be taken home.` },
    ],
    related: ['lore:the-brand', 'lore:the-ashmark', 'lore:ysolde-the-pale-saint'],
  },
  {
    id: 'lore:the-ashmark', name: 'The Ashmark', category: 'magic',
    body: `On the Night of Falling Ash you were out on the moor. Something burning hissed past, close enough to touch, and it did. The scar on your hand never healed, and it has never stopped being warm.

On the first anniversary of that night, it set the remembrance pyre alight from three paces away.`,
    sections: [
      { id: 'kindle', title: 'Kindle', body: 'The mark can light what has gone cold: braziers, wards, a pyre.' },
      { id: 'purge', title: 'Purge', body: 'The mark burns the Mire out of what it touches. It hurts. Used on a living thing, it can heal the taint, or kill.' },
      { id: 'embersight', title: 'Embersight', hint: 'The mark is still growing.', body: 'Since the Ember joined it, the mark lets you see the leys glowing through the earth, and the black seeps where the Mire is rising.' },
    ],
    related: ['lore:the-seven-embers', 'lore:the-heartfire-and-leys'],
  },
  {
    id: 'lore:the-orrin', name: 'The Orrin and the Rusting', category: 'history',
    body: `Long before men or Aelthi, the Orrin walked the world: giants of living iron that Orr made from the slag of his forge. They raised the Wrought Dominion in the high places and built things no one has built since, like dams, roads and great nails driven into the earth for reasons no one now remembers.

Then they dug toward the Heartfire, hoping to rekindle their dead maker, and the heat they let loose rusted them from within. Most froze where they stood; the Ironspine is full of their statues. The stout, stubborn Orrun of the mountain holds are said to be their children.`,
    sections: [
      { id: 'sluice', title: "The Giant's Sluice", body: 'The great stone sluice at Wennamere is Orrin work, older than any kingdom. Why would giants care about a moorland mere? The gate-wheel is carved with the same sigil the Orrun use for "hold fast".' },
    ],
    related: ['lore:the-forging', 'lore:the-rusting', 'lore:the-orrun', 'lore:the-ironspine'],
  },
  {
    id: 'lore:edric-barrowborn', name: 'Edric Barrowborn', category: 'history',
    body: `The first King of Haldmarch, who united the Haldish lords and sealed the Charter of Haldren in 870 YL, winning the kingdom's freedom from the Empire. He was called Barrowborn because he was said to have been born in a burial mound during a siege.

His tomb in the Witherdowns is famously empty. Aldermoor folk say he lies under Edric's Barrow on their own moor, with his sword, guarded by his sworn dead.`,
    sections: [
      { id: 'oath', title: 'Edric’s Oath', hint: 'The sealed door on the moor will open in time.', body: `When you came back from the River Under, the inner door of Edric’s Barrow stood open. Cuthred was waiting within, and behind him, on a bier of moorstone, lay a king in his mail with a sword upon his breast. The tomb in the Witherdowns was a blind. Edric had asked to be buried here, on the moor, within sight of the mere. “He never told us why,” Cuthred said. “Only that someone ought to keep watch on it, and that we should hold until we were relieved.” He put the sword into your hands, its blade graven with the old words: Hold, and be held. Then he lay down at his king’s feet, and was gone.` },
    ],
    related: ['lore:the-restless', 'lore:barrow-kings', 'lore:charter-of-haldren', 'lore:aldermoor'],
  },
];

export default entries;
