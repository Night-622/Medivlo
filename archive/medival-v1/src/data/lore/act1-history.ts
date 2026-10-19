/** Codex: history and gods (Act I set). Owner: Claude 4. */
import type { LoreEntry } from '@/core';

const entries: LoreEntry[] = [
  // ----- history
  {
    id: 'lore:charter-of-haldren', name: 'The Charter of Haldren', category: 'history',
    source: 'The Charter of Haldren, opening and closing clauses (870 YL)',
    body: `“We, the lords of the Haldish lands, of the Kingsvale and the Downs, of the Moor and the Fen and the March of the Mountains, being weary of a crown that sits in Solenne and a tax that walks to it, do here set our seals and swear:

That Edric, called Barrowborn, is King of the Haldmarch, and his heirs after him, and no lord of the south shall be lord over us.

That no man of the Haldmarch shall be taxed save by the King in his council, nor tried save by his neighbours, nor made to bear arms beyond the March save of his own will.

That the Lantern shall keep its chapels, its priests and its right over things holy, and the King shall keep the rest.

Hold, and be held.”

Every Haldish child can recite the second clause. Fewer know the third, which the Church’s lawyers wrote, and which has been argued over ever since.`,
    sections: [
      { id: 'hold', title: 'Hold, and be Held', hint: 'The last line is older than the Charter.', body: `The Charter’s closing words were Edric’s own: the oath he swore with his sworn knights before every battle, and they with him. A lord who holds the King’s peace is held by the King’s protection; a king who fails his lords is no longer held by them. Haldish lawyers have been quoting the line against their kings for three hundred years. It is graven on the blade of Edric’s sword.` },
    ],
    related: ['lore:edric-barrowborn', 'lore:haldren-keep', 'lore:crown-of-haldmarch', 'lore:war-of-the-two-lanterns', 'lore:haldren'],
  },
  {
    id: 'lore:war-of-the-two-lanterns', name: 'The War of the Two Lanterns', category: 'history',
    source: 'Haldren Chronicle, entries for 960 and 978 YL',
    body: `960. In this year the Hierophant sent word north that the Brand-lanterns of the Haldmarch were the Church’s and not the King’s, and that no flame lit from the Brand might burn in any royal hall save at the Church’s pleasure. King Cuthbert of Haldmarch answered that a fire in his house was his to keep. So began the War of the Two Lanterns, which was fought over a flame and burned a great deal else.

978. In this year peace was made at Haldford. The lanterns went back to the chapels and the King kept his crown, and both sides rang their bells for victory. The old town of Haldren had burned; the Witherdowns had been wasted twice; and the port of Brackhaven, which had taken coin from both sides and fought for neither, declared that it would have no lord at all, and no one had the strength left to tell it otherwise.`,
    sections: [
      { id: 'solenni', title: 'The Southern Telling', hint: 'Solenne remembers it under another name.', body: `In the histories of Solenne the war is called the Haldish Apostasy, and it is a short chapter. The northern king, misled by evil counsel, sought to steal the holy fire for his own glory; the faithful of the Haldmarch would not follow him; peace was restored by the Hierophant’s mercy. The burning of Haldren is not mentioned. Nor is Brackhaven, save as “a nest of pirates, since chastised.” It has not been.` },
    ],
    related: ['lore:charter-of-haldren', 'lore:brackhaven', 'lore:salt-league', 'lore:the-brand', 'lore:saltreach-coast', 'lore:the-hierophancy'],
  },
  {
    id: 'lore:purge-of-the-emberwardens', name: 'The Purge of the Emberwardens', category: 'history',
    source: 'Proclamation of the Snuffing, read from every pulpit of the Lantern, 1041 YL',
    body: `Know, faithful, that the Light has trimmed its wick.

The order called the Emberwardens, which the Church in its charity suffered to keep the leys for nine centuries, had grown proud. Its knights drew ember without licence and without prayer. They hoarded the gods’ fire in their fortress and taught it to whom they pleased. And lately they had begun to spread among the people a vile falsehood: that the holy fire beneath the world was failing, that the gods’ gift was cooling in the earth, and that the Lantern could not save it. This they did to sow despair, and to make themselves the masters of the leys.

Therefore, on this night, the Order of the Wick has gone up to Cinderhold, and the false wardens are no more. Their writings are forbidden. Those who keep them shall answer to the Wick. Give thanks, for the Lantern burns on, as it ever has and ever will.

Lux manet.`,
    sections: [
      { id: 'snuffed-candles', title: 'The Night of Snuffed Candles', hint: 'The brazier at Cinderhold remembers.', body: `When the brazier woke, you saw it. Red cloaks on the walls; white surcoats in the gate; fire everywhere, and none of it ember. An old warden with a grey braid pressing a satchel of ledgers into the arms of a girl and pushing her toward the postern. And afterwards, in the morning smoke, Wick soldiers carrying chests out of the archive, not to the pyres with the rest, but down the crag to a waiting wagon, each chest sealed with the Hierophant’s wax.` },
    ],
    related: ['lore:the-emberwardens', 'lore:cinderhold', 'lore:order-of-the-wick', 'lore:cinder-shades', 'lore:the-heartfire-and-leys', 'lore:hesta-corrow', 'lore:book-proclamation-of-the-snuffing'],
  },
  {
    id: 'lore:the-grey-lung', name: 'The Grey Lung', category: 'history',
    source: 'Daybook of Merewyn Ashby, physician of Haldford',
    body: `1163. A sickness come up the river with the eel-barges. It begins as a cough and a greyness about the lips. Then the breath shortens, and the sick lie very still, as if listening. Bled three. Two dead by Morrowday.

1165. They are calling it the Grey Lung now. It is in every town of the Haldmarch and they say in Solenne also. No physic touches it. The priests’ Radiance eases the dying but does not stop it. I have stopped bleeding them. I sit with them.

1168. Varn has closed its gates, too late. Word is that the lord’s lady and his little girl are taken with it.

1170. It is over. A Lightsworn out of Solenne, Sister Ysolde, came up the Hald in spring and laid her hands on the sick of every town from the coast to the fens, and they rose. All of them. I watched her at Haldford. I do not know what I watched. The Church is calling her a saint, and I will not argue.`,
    sections: [
      { id: 'hands', title: 'A Physician’s Afterthought', hint: 'Something about the saint troubled her.', body: `From the same daybook, written later and struck through: “She did not pray as the others pray. She knelt and put her hands flat upon the ground first, every time, as if feeling for something in the earth, and only then upon the sick. My grandmother said the old red-cloaked Wardens did the same over a seep. I have told no one this.”` },
      { id: 'too-late', title: 'Too Late for Varn', hint: 'Not everyone was saved.', body: `Saint Ysolde reached Varn in the autumn of 1170. Lord Aldwin Varn met her at the causeway gate. His wife and daughter had been buried a fortnight. The town remembers that he thanked her, very courteously, and then went into the chapel and did not come out until the next day.` },
    ],
    related: ['lore:ysolde-the-pale-saint', 'lore:aldwin-varn', 'lore:varn', 'lore:maren-hollis', 'lore:book-lives-of-the-lightsworn'],
  },
  {
    id: 'lore:barrow-kings', name: 'The Barrow-Kings', category: 'history',
    source: 'Brother Ossory, Grey Monk of Morrow, in conversation',
    body: `“Before the Charter there were kings in the Haldmarch the way there are crows in a field: plenty of them, all shouting. Each valley had one. The downs-kings were the oldest, and they had a custom. When a king died, his sworn men did not go home. They were laid in the barrow round him, in their mail, with their swords, and the barrow was sealed with the king’s sigil, so that the king would have his guard in Morrow’s halls as he had in life.

“Some went willingly, after a long life. Some did not have the choice. We do not like to talk about that part.

“The Empire came north and made them client-kings, and later the Haldish rose and made Edric king of all of them, and the custom died. Edric was the last to be given a barrow and a guard. People call him the first King of Haldmarch. On the downs, we call him the last of the Barrow-Kings.”`,
    sections: [
      { id: 'empty', title: 'The Empty Barrow', hint: 'The greatest tomb on the downs holds no king.', body: `Edric’s tomb in the King-Barrows is the largest on the downs, and it is empty. It was opened in the War of the Two Lanterns by soldiers looking for the crown, and they found a stone bier, a royal mantle folded upon it, and nothing else: no king, no sword, no guard. The Grey Monks have the record of his burial, signed and witnessed. It does not say where he went. Ossory says that is not the same as not knowing.` },
    ],
    related: ['lore:edric-barrowborn', 'lore:the-witherdowns', 'lore:the-restless', 'lore:charter-of-haldren'],
  },
  {
    id: 'lore:sundering-of-ys', name: 'The Sundering of Ys', category: 'history',
    source: '“Hiraeth-ys”, an Aelthi lament, in a Thornwise translation',
    body: `“We sang to the sea that was under the lake, / for it turned in its sleep and it wept in its sleep. / We sang it the softest of songs that we knew, / and it heard us, it heard us, and came up to see.

The towers went soft as the wax of a candle. / The stair went to water, the bridge went to dream. / Our mothers were singing; they sang as they sank. / We could hear them for three days beneath the still lake.”

Around eleven hundred years before the Lantern, the great Aelthi court of Ys Aerwen sank into its own lake in a single night, with half of the Aelthi people. Lanternate scholars hold that it was punished for heathen sorcery. The Aelthi say it was a song that worked too well. The survivors withdrew into Caer Ylwen and swore an oath never again to sing to the sea below the world.`,
    sections: [
      { id: 'rhiannon', title: 'One Who Remembers', hint: 'Someone alive today was there.', body: `The Archdruid Rhiannon Ys-Caer was a child in Ys Aerwen on the night it sank. She is older than any Aelthi has a right to be, and the Aelthi do not explain it. She does not speak of that night. Once, at a Thornwise moot, a young druid asked her what it had been like. “Gentle,” she said. “That was the worst of it.”` },
    ],
    related: ['lore:the-lullaby', 'lore:ylwen-deepwood', 'lore:the-aelthi', 'lore:the-mire', 'lore:rhiannon-ys-caer', 'lore:book-lament-for-ys'],
  },
  {
    id: 'lore:burning-of-qadir', name: 'The Burning of Qadir', category: 'history',
    source: 'A Catechism for Novices of the Lantern, lesson the Ninth',
    body: `Q. What was Qadir?
A. The first great realm of men, in the south-east, ruled by the Ashen Kings.

Q. What was the sin of the Ashen Kings?
A. They found that the leys could be tapped like wells, and they drew upon the gods’ fire without licence or limit. They built cities of glass and bred the cinderdrakes, and they grew proud.

Q. Who was the last of them?
A. Ozrah, called the Unsleeping, who sought to draw a whole ley-nexus into himself and live for ever.

Q. What came of it?
A. About four hundred years before the Lantern, the leys of Qadir overdrew and burned. The realm became the Cinder Wastes. Its ash darkened the sun for a generation, and those years are called the Grey Winters.

Q. What is the lesson of Qadir?
A. That the fire beneath the world belongs to the gods, and must be kept by those the gods appoint.`,
    sections: [
      { id: 'qasiri', title: 'A Caravan Saying', hint: 'The children of Qadir tell it differently.', body: `The Qasiri carry the shame of Qadir and do not deny it. Ozrah is an ill-omened name among them, never given to a child. But their oracles keep a saying that does not appear in the Lanternate catechism: “The Kings dug deep because they heard the fire cough. They were not the first to hear it. They will not be the last.”` },
    ],
    related: ['lore:the-heartfire-and-leys', 'lore:cinderlung', 'lore:ashen-creed', 'lore:wick-licence', 'lore:cinder-wastes', 'lore:the-ashen-kings', 'lore:ruins-of-qadir', 'lore:the-qasiri'],
  },
  // ----- gods
  {
    id: 'lore:saela-and-the-river-under', name: 'Saela and the River Under', category: 'gods',
    source: 'As told by a hearthwarden of the Witherdowns',
    body: `When you die, love, you don’t go far at first. You stand by your body a little while, puzzled, the way you stand in a room when you’ve forgotten why you came in. Then you hear water.

That’s Saela’s river. It runs under everything, under the downs and the fens and the sea, cold and dark and very quiet. And Saela comes up it in her grey boat, and she holds out her cupped hand, and you step in. She’s the Tide-Mother. She’s gentle. She doesn’t ask what you did.

She carries you down the River Under to Morrow’s halls, where her love is waiting, and he takes your name and keeps it, and you rest. That’s why we leave water on the sill: so she can find the house. That’s why we don’t keen too loud: so the dead can hear her coming.`,
    sections: [
      { id: 'frozen', title: 'The Frozen River', hint: 'Seen at the bottom of the King-Barrows.', body: `At the shrine beneath the King-Barrows the River Under runs close enough to see. It is not running. It is ice from bank to bank, grey and thick, and the dead stand on its shore in their hundreds, waiting for a boat that cannot come. Beneath the ice, far down, something vast moves slowly, as a sleeper moves. The dead do not look at it. They have learned not to.` },
    ],
    related: ['lore:morrow-the-veiled', 'lore:the-restless', 'lore:the-seven-sparks', 'lore:the-witherdowns', 'lore:saltreach-coast', 'lore:saltreach-isles', 'lore:brackhaven'],
  },
  {
    id: 'lore:morrow-the-veiled', name: 'Morrow the Veiled', category: 'gods',
    source: 'The Grey Catechism, as taught to novices of the Ossuary',
    body: `Who is Morrow? The Veiled, the keeper of the dead, the god of memory, of dreams and of secrets.

Why is his face veiled? Because no one living may look upon the end of all things and be unchanged.

What does Morrow keep? Every name. When Saela brings the dead to his halls, he takes their names and keeps them, so that nothing that has been is ever wholly lost.

What is a dream? A visit to Morrow’s country without leave. The dreamer walks among memories that are not his. That is why dreams are strange, and why the Grey Monks write them down.

What is a secret? A thing given into Morrow’s keeping by the living. It is holy. It is not to be spent lightly.

What is forbidden to a Grey Monk? To lie about the dead. To refuse the dying. To tell what Morrow keeps.`,
    sections: [
      { id: 'far-shore', title: 'The Far Shore', hint: 'A question the Catechism does not answer.', body: `Written on a scrap and pressed between the pages of an Ossuary catechism: “Novice’s question, put to Brother Ossory: if dreams are Morrow’s country, why do the drowned dream the same dream? He answered that Morrow’s country has a far shore, and that it is not Morrow’s. He would not say whose. He told me to write it down and not to ask again.”` },
    ],
    related: ['lore:saela-and-the-river-under', 'lore:grey-monks-of-morrow', 'lore:the-seven-sparks', 'lore:the-mire', 'lore:ossuary-of-saint-calder'],
  },
];

export default entries;
