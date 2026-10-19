/** Codex: factions, peoples, places, characters, bestiary, culture (prologue set). Owner: Claude 4. */
import type { LoreEntry } from '@/core';

const entries: LoreEntry[] = [
  // ----- factions
  {
    id: 'lore:the-lanternate', name: 'The Lanternate', category: 'factions',
    body: `The Church of the Seven Lights, seated at Solenne and headed by the Hierophant. It teaches that Ithren is first among the Seven, that the Brand was Ithren's gift, and that all magic is the gods' property, to be used only under licence.

In Haldish villages the Church is a chapel, a priest and a bell, and most folk keep the Old Hearth alongside it without seeing any contradiction. Since the Brand went dark, sermons have been shorter and the collection plates emptier.`,
    related: ['lore:order-of-the-wick', 'lore:the-brand', 'lore:the-hierophancy', 'lore:hierophant-aurelian', 'lore:solenne', 'lore:ithren-the-lantern', 'lore:the-solenni', 'lore:wick-licence', 'lore:anselm-pryde'],
  },
  {
    id: 'lore:order-of-the-wick', name: 'The Order of the Wick', category: 'factions',
    body: `The Lanternate's inquisitors. Since the Wick-Edict of around 450 YL, no one may practise magic outside the Church without a Wick-licence, and the Order hunts those who try. Their sigil is a pair of wick-scissors over a candle: "We trim the wick so the flame burns true."

Since the Quench, the Order has been riding into villages looking for anyone "marked".`,
    sections: [
      { id: 'last-wick', title: 'The Last Wick', body: "Inquisitor Hale carries a lantern lit from the Brand itself before it died. It is one of perhaps a dozen such flames left in the world. It leans toward you like a dog toward its master." },
    ],
    related: ['lore:the-lanternate', 'lore:castor-vellane', 'lore:garrick-hale', 'lore:valcastre', 'lore:the-wick-edict', 'lore:wick-licence'],
  },
  {
    id: 'lore:the-emberwardens', name: 'The Emberwardens', category: 'factions',
    source: 'A Warden’s Primer, foreword',
    body: `Founded 112 YL: an order of mage-knights sworn to guard the leys, to police the reckless and to burn out the Mire wherever it seeped. They wore red over iron, and every village knew them.

In 1041 YL the Lanternate declared them heretics. Their fortress of Cinderhold was stormed in a single night, the Night of Snuffed Candles, and the order was broken. Possession of their writings is still a hanging matter.`,
    sections: [
      { id: 'last-warden', title: 'The Last Warden', hint: 'Not all of them died.', body: `Hesta Corrow was born a century and a half after the Purge, and she is an Emberwarden anyway. The order survived the way embers survive: buried, passed hand to hand, one master and one apprentice at a time. She is, as far as she knows, the last. She had an apprentice once.` },
      { id: 'purge-truth', title: 'What the Wardens Knew', hint: 'Why was the order really broken?', body: `In 1038, 1039 and 1040 YL the Warden-Mother of Cinderhold sent reports to Solenne: the draws were weakening; the leys were cooling, slowly and everywhere, decade upon decade; and the Heartfire beneath them, the wardens feared, was failing. The Church did not reply. In 1041 it sent the Wick instead. The Proclamation of the Snuffing called the reports a falsehood spread to sow despair, yet the chests the Wick carried down from Cinderhold under the Hierophant’s seal were never burned. Hesta believes they are still in Solenne, somewhere beneath the cathedral. “They didn’t break us for heresy,” she says. “They broke us for being right, and too loud about it.”` },
    ],
    related: ['lore:the-heartfire-and-leys', 'lore:hesta-corrow', 'lore:cinderhold', 'lore:purge-of-the-emberwardens', 'lore:book-wardens-primer-excerpts', 'lore:the-ashmark'],
  },
  {
    id: 'lore:the-thornwise', name: 'The Thornwise', category: 'factions',
    body: `Druids, hedge-witches and wood-wardens who follow Kethra the Thorn, Aelthi and human alike. Their circle meets far to the west in the Ylwen Deepwood, but their people live in every old forest: one old woman in a hut, usually, who knows which mushrooms to eat and which to leave for the dead.

The Thornwise hold that the Forging was necessary but cruel, and that the Mire should be mourned rather than hated. The Church tolerates them barely.`,
    related: ['lore:the-aelthi', 'lore:the-white-stag', 'lore:rhiannon-ys-caer', 'lore:nan-briar', 'lore:ylwen-deepwood', 'lore:kethra-the-thorn', 'lore:the-lullaby', 'lore:cadoc-ap-ynys'],
  },
  {
    id: 'lore:the-drowned-choir', name: 'The Drowned Choir', category: 'factions',
    body: `A cult of the Mire. Its creed is short: "The world is a wound. The Forging was the blade. Let the water close over it, and let all things dream again."

A year ago it was a rumour from the eastern fens. Now its hymns are sung in Greywater, its black candles are sold by pedlars, and its converts walk willingly into black water and come out changed.`,
    related: ['lore:the-mire', 'lore:the-hollowed', 'lore:ysolde-the-pale-saint', 'lore:nhal-the-drowned', 'lore:greywater-marsh', 'lore:reed-temples', 'lore:reed-mother', 'lore:aldwin-varn', 'lore:abbess-morwen', 'lore:sister-ilse', 'lore:the-drowned-tongue'],
  },
  // ----- peoples
  {
    id: 'lore:the-aelthi', name: 'The Aelthi', category: 'peoples',
    body: `The forest folk: tall, long-lived (four centuries is not old for them) and musical. Their magic was always song. They awoke in the great forests in the Second Age and built courts there, chief among them Ys Aerwen, which sank into its own lake in a single night eleven hundred years before the Lantern.

Few Aelthi leave the Ylwen Deepwood now. But they were here once. The standing stones of the Gloamwood are theirs, and the paths that cross at Brindlecross were Aelthi roads before they were Haldish ones.`,
    related: ['lore:the-weeping-stones', 'lore:the-thornwise', 'lore:ylwen-deepwood', 'lore:sundering-of-ys', 'lore:kethra-the-thorn', 'lore:rhiannon-ys-caer', 'lore:cadoc-ap-ynys'],
  },
  // ----- places
  {
    id: 'lore:brindlecross', name: 'Brindlecross', category: 'places',
    unlockOn: [{ region: 'region:aldermoor' }],
    body: `A crossroads village of some forty households in the moorland valley of Aldermoor, founded around 600 YL where two old Aelthi paths meet. It has sheep, peat, a watermill on the Brindle, a smithy, a tavern called The Guttered Candle, and a Lantern chapel with a rood-screen of the Seven that is the pride of the valley.

Since the Night of Falling Ash the roads east and north have been closed, the south road watched by the Wick, and the valley left to look after itself. It has, mostly.`,
    related: ['lore:lanternmass', 'lore:aldermoor', 'lore:maren-hollis', 'lore:anselm-pryde', 'lore:haldish-hearth-customs'],
  },
  {
    id: 'lore:the-weeping-stones', name: 'The Weeping Stones', category: 'places',
    unlockOn: [{ landmark: 'landmark:weeping-stones' }],
    body: `A ring of Aelthi standing stones deep in the Gloamwood. They sweat water even in hard frost, and the water runs down grooves carved like tear-tracks. Villagers leave bread and ribbons there and do not go after dark. A white stag, they say, has guarded the stones for as long as the stones have stood.`,
    related: ['lore:the-aelthi', 'lore:the-white-stag', 'lore:aldermoor', 'lore:nan-briar'],
  },
  {
    id: 'lore:saint-wenna', name: 'Saint Wenna and her Abbey', category: 'characters',
    body: `Wenna of the Mere was an abbess of the Lanternate around 780 YL, famous for curing the marsh-fever that ran through the eastern Haldmarch. She built her abbey on an islet in Wennamere, and for four hundred years its sisters kept the hours and a lantern lit for travellers on the moor.

On the Night of Falling Ash something fell into the mere. The water turned black and rose, and by morning the abbey was gone beneath it.`,
    sections: [
      { id: 'last-abbess', title: 'The Last Abbess', body: `Mother Morwen did not flee when the black water rose. She rang the bells for the hours until the water closed over the bell-tower, and then, by the sound of it, she went on ringing. When you found her she was still keeping the hours. "Light," she said at the end. "Is it Lanternmass?"` },
    ],
    related: ['lore:night-of-falling-ash', 'lore:abbess-morwen', 'lore:aldermoor'],
  },
  // ----- characters
  {
    id: 'lore:ysolde-the-pale-saint', name: 'Saint Ysolde', category: 'characters',
    source: 'Lives of the Lightsworn (Lanternate hagiography, 1172 YL)',
    body: `Ysolde Maerin, Lightsworn of Solenne, who in 1170 YL ended the Grey Lung with Radiance such as had not been seen since Saint Solenne herself. She was canonised in her own lifetime and in 1178 YL named Keeper of the Brand. In 1181 YL she went on pilgrimage into the Ironspine and did not return. She is mourned as dead.`,
    sections: [
      { id: 'pale-saint', title: 'The Pale Saint', body: `She is not dead. When the Ember sank into your hand you saw her: tall, white-robed, water running endlessly from her eyes and hair and never falling. She looked at you as if she were sorry. "You are so warm, little spark," she said. "I remember being warm. It hurt."` },
      { id: 'journals', title: 'The Keeper’s Journals', hint: 'She left her thoughts behind in Solenne.', body: `From the journals found in the Keeper’s rooms:

“1178. Today I was given the Brand to keep. I looked into it, as the Keepers are told not to. There is a great deal more down there than fire.”

“1179. It is cooling. Hesta was right. The wardens were right. Every night it is a little less.”

“1180. A month among the Grey Monks. They have been writing down the same dream for a thousand years and telling no one. If the fire goes out by itself it will not be gentle: famine, the black water in every crack, children Hollowed in their cradles. There must be another way. The voice says there is.”

“1181. The voice is so kind. It says that if the fire is given back by someone who loves the world enough, everyone will simply fall asleep, and no one will be cold again. I am going down to see.”

Tucked into the last page is a letter, its seal broken, soft as cloth at the folds from being read many times: “Ysolde. Whatever is talking to you in that coal, it is not your friend. Nothing that lives in the dark talks that sweetly for free. Come home. H.”` },
    ],
    related: ['lore:the-seven-embers', 'lore:hesta-corrow', 'lore:ysolde-maerin', 'lore:the-drowned-choir', 'lore:the-grey-lung', 'lore:cathedral-of-the-brand'],
  },
  {
    id: 'lore:hesta-corrow', name: 'Hesta Corrow', category: 'characters',
    body: `An old woman with burn-scars to the elbow, a cough full of ash, and a sword that steams in the snow. She has spent a year following falling stars across the Haldmarch. She found you on the shore of Wennamere and was, she said, disappointed by your height.

She is an Emberwarden, which is supposed to be impossible, and she knows the name of the woman in your vision.`,
    related: ['lore:the-emberwardens', 'lore:cinderhold', 'lore:ysolde-maerin', 'lore:cinderlung'],
  },
  // ----- bestiary
  {
    id: 'lore:the-hollowed', name: 'The Hollowed', category: 'bestiary',
    unlockOn: [{ kill: null, hollowed: true }],
    body: `People and beasts touched by the Mire. The skin goes pale and wet, black tears run from the eyes and do not stop, and whatever they were fades a little each day until something else is looking out. They are drawn to warmth, to fire and to the living.

The Church says they are lost. The hedge-witches say no one is lost who can still be found.`,
    related: ['lore:the-mire', 'lore:the-unwrought'],
  },
  {
    id: 'lore:the-unwrought', name: 'The Unwrought', category: 'bestiary',
    unlockOn: [{ kill: 'enemy:mireling' }],
    body: `Things that were never anything. Where the Mire rises through the earth, it sometimes gathers itself into shapes: blobs, tendrils, a mouth with no face. They are made the way a child draws a dog, from a memory of what a living thing is supposed to be. The smallest are called Mirelings. No one has named the largest and lived.`,
    related: ['lore:the-hollowed', 'lore:the-mire'],
  },
  {
    id: 'lore:the-white-stag', name: 'The White Stag of the Gloamwood', category: 'bestiary',
    body: `An old guardian of the Weeping Stones: a stag white as frost, with antlers like a winter tree. Aldermoor folk say that seeing it means a hard winter is coming, and that harming it means the winter never ends. Nan Briar says it's older than the village and kinder than most of its people.

This winter the stag came out of the forest with black tears in its eyes.`,
    sections: [
      { id: 'cleansed', title: 'Cleansed', body: 'You burned the dark out of it. It stood a long while among the stones, shaking, then bowed its great head to you and walked back into the trees. Villagers say they have seen it since, watching the road.' },
      { id: 'slain', title: 'Slain', body: 'You put it down among the stones. The Weeping Stones have stopped weeping. Nan Briar will not speak of it.' },
    ],
    related: ['lore:the-weeping-stones', 'lore:the-hollowed', 'lore:nan-briar', 'lore:aldermoor'],
  },
  {
    id: 'lore:the-restless', name: 'The Restless', category: 'bestiary',
    body: `When the Haldish die, Saela carries them down the River Under to Morrow's grey halls. That is what the hearthwardens teach. This winter the dead are not going. They wake in their barrows, cold and confused, and walk the moors looking for a river they cannot find.

A voice behind the sealed door of Edric's Barrow put it simply: "The water is frozen. We cannot cross."`,
    sections: [
      { id: 'barrow-wights', title: 'Barrow-Wights', hint: 'The downs have their own dead.', body: `In the King-Barrows of the Witherdowns the Restless are not wanderers. They are the sworn men of the Barrow-Kings, laid in mail about their lords to guard them in Morrow’s halls, and now, with the River Under frozen, guarding them here instead. The downs-folk call them wights. They keep their oaths in the dark: they stand their posts, they challenge in a tongue older than the Charter, and they strike at anyone who comes armed into the king’s house. Their blades are cold enough to stick to the skin. Brother Ossory says they are not cruel, only faithful, and that faithfulness with no river to end it is a terrible thing.` },
    ],
    related: ['lore:edric-barrowborn', 'lore:the-witherdowns', 'lore:saela-and-the-river-under', 'lore:barrow-kings'],
  },
  // ----- culture
  {
    id: 'lore:lanternmass', name: 'Lanternmass', category: 'culture',
    body: `The midwinter festival of light: the longest night, when every household in the Empire lights a lantern from the chapel flame and carries it home to keep the dark out until morning. Children go door to door singing the Lantern Carol. There is spiced ale, and honey-cakes stamped with seven rays.

This year it is also the Remembrance, one year since the Night of Falling Ash. In Brindlecross they have built a remembrance pyre on the green in the old Hearth way, to burn for those the black water took.`,
    related: ['lore:night-of-falling-ash', 'lore:brindlecross', 'lore:the-last-lanternmass'],
  },
];

export default entries;
