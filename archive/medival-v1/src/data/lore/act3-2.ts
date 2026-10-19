/** Codex: the Hollow Sea, and the five endings (Act III set, part 2). Owner: Claude 4.
 *  The ending entries are hidden and unlock from `act3.ending`; their sections are unlocked by the epilogue. */
import type { LoreEntry } from '@/core';

const entries: LoreEntry[] = [
  // ----- the Hollow Sea
  {
    id: 'lore:the-unmade-road', name: 'The Unmade Road', category: 'places',
    source: 'A processional hymn of the Drowned Choir, sung on the road into the Hollow Sea',
    unlockOn: [{ landmark: 'landmark:the-unmade-road' }],
    body: `“Walk, little warm ones, on the road that no one laid.
No stone was cut for it. No ox was yoked to it.
It goes where you were always going.
At every step it forgets the step before.
Ooluun, ooluun. Below, below.”

The Choir sing it as they go out into the Mirelands, barefoot, in white, in long lines. The road they walk is real enough to bleed on. It runs from the drowned shore of the Greywater to the spire on the far side of the Hollow Sea, and it is made of every road its walkers have ever walked: a yard of Haldren cobbles, a stretch of moor-track, the boards of a jetty at Fenwick, the aisle of a village chapel. It is never the same road twice. Behind you it closes like water.

The Drowned Things walk it too. They do not sing.`,
    sections: [
      { id: 'paving', title: 'Your Own Road', hint: 'Look down.', body: `For a hundred paces the road under your feet was the lane from the Hollis cottage gate to Brindlecross green, with frost on the ruts and the chapel bell going, exactly as it was on the morning of the Remembrance before anything had happened. You could have turned in at the gate. The road would have let you. That, the Choir say, is what the road is for.` },
    ],
    related: ['lore:the-mirelands', 'lore:the-drowned-cathedral', 'lore:drowned-things', 'lore:the-drowned-choir', 'lore:the-drowned-tongue'],
  },
  {
    id: 'lore:the-dream-memories', name: 'Dreams of the Hollow Sea', category: 'magic',
    unlockOn: [
      { interact: 'obj:dream-memory-1' }, { interact: 'obj:dream-memory-2' }, { interact: 'obj:dream-memory-3' },
      { interact: 'obj:dream-memory-4' }, { interact: 'obj:dream-memory-5' }, { interact: 'obj:dream-memory-6' },
      { interact: 'obj:dream-memory-7' },
    ],
    body: `In the Mirelands memory weighs as much as stone, and the oldest and heaviest memories sink to the bottom and lie there like wrecks, waiting for whoever carries them to pass by.

From outside they look like nothing much: a patch of still water with a light in it, a door standing on its own in a field, a ring of reeds. Step in, and you are inside someone’s worst night. Not a picture of it. The night itself: the cold, the smell, the exact weight of whatever was in their arms, and the one who lived it standing there beside you, living it again.

The Mire does not make these dreams. It only finds them. It has always been good at finding the things people cannot put down, and it is patient. It holds them up to the light, gently, and waits for its little warm ones to decide that they would rather sleep than look.

Some do. Some look, and walk out the other side, and are lighter afterwards. There is no knowing beforehand which.`,
    sections: [
      { id: 'maren-hollis', title: 'Maren: The Boy in the Reeds', body: `A summer evening at Brindlecross, the reeds along the Brindle tall and green, and Tobin, nine years old, calling from somewhere inside them that he has found a heron’s nest. Maren runs toward his voice, calling his name, and the reeds go on and on. In the dream she never reaches him. Whatever became of the real boy, this one is always a few yards further in.` },
      { id: 'anselm-pryde', title: 'Anselm: The Abbess at the Font', body: `The nave of Saint Wenna’s, dry and whole, full of the sick of the marsh. Saint Wenna moves among them laying on hands, and they rise. Then she turns to Anselm and asks him to pray with her, and he opens his mouth, and nothing comes. The light does not answer him. The sick go on dying. “Then what are you for?” the saint asks him, very kindly, and waits.` },
      { id: 'sable', title: 'Sable: The Water', body: `Warm water, up to the chin, and someone singing a long way off, and Sable laughing because it is so easy. It is like falling asleep in a bath. The worst of the dream is not the drowning. It is how much, in the dream, she wants to, and how hard she has to work to remember why she should not.` },
      { id: 'cadoc-ap-ynys', title: 'Cadoc: Ys Aerwen', body: `He was not born when Ys sank, but every Aelthi child dreams it once: the court upon the lake, white towers in the moonlight, the whole people singing together, and the water rising to listen. In the dream Cadoc stands among them and sings, and cannot stop, and feels the floor go soft under his feet. He says that he has dreamed it every night since he first sang a verse of it to a human.` },
      { id: 'grimma-ironsong', title: 'Grimma: The Empty Socket', body: `The Thane-Hall of Korrath, every clan on its benches, the ledger-keeper with his pen raised; and Grimma on her feet in the middle, telling them about the two dead Nails. As she speaks, the floor of the hall becomes the floor of the Vault, and the socket opens beneath her, and the black water is rising, and no one on the benches moves. Iron does not weep, the Orrun say. In the dream, she does.` },
      { id: 'vesper-qadri', title: 'Vesper: The Burning Abbey', body: `The Abbey of Saint Sabine at Aurenac, at night, burning. Vesper is twenty-three, with the torch in her hand. She is also five years old, standing at the abbey gate where her family left her, holding a sister’s sleeve. Both of her are there at once. The child looks up at the woman with the torch and asks, politely, whether she is going to be safe here.` },
      { id: 'hesta-corrow', title: 'Hesta: The Girl at the Window', body: `A farmhouse among the vines above Solenne, a summer night, a candle in the window of the lodger’s room. Out in the dark a girl of twelve is coming home late from the ley-stones, singing to herself. In the dream Hesta goes to the door to call her in, and cannot make herself call, because she knows what she will teach the girl if she does, and what the girl will become. Hesta has never told anyone whether, in the dream, she calls.` },
      { id: 'ashmarked', title: 'Your Own: The Night of the Star', body: `The moor above Brindlecross, a year and more ago, and ash beginning to fall. Something burning comes down out of the sky toward you, close enough to touch. In the dream you step aside. It hisses past into the dark and falls into the mere, and the abbey sinks, and no one comes to anyone’s aid, and you go home and sleep very well, and never wake.` },
    ],
    related: ['lore:the-mirelands', 'lore:the-mire', 'lore:the-ashmark', 'lore:the-unmade-road'],
  },
  // ----- endings (hidden; unlocked by act3.ending)
  {
    id: 'lore:ending-rekindle', name: 'The Rekindling', category: 'history', hidden: true,
    source: 'The Chronicle of the Ossuary of Saint Calder, kept by the Grey Monks of Morrow',
    unlock: { flag: 'act3.ending', op: '==', value: 'rekindle' },
    body: `The year after the Heartforge. Spring came to the Witherdowns at last, eleven weeks late. The River Under has thawed. The Restless went down to the water and crossed, all of them, in a single night. Brother Ossory wept, and blamed the onions.

The fortieth year after. The Hierophant has set a new Brand in the Great Lantern of Solenne, lit from the Ashmarked’s own hand. The pilgrims go south again with their lanterns. The Church says that the Seven have forgiven the world. It does not say who went down to the bottom of the world to ask them, and the people have mostly forgotten; the children of the Haldmarch play at Ashmarked with a hot coal in a mitten.

The three hundredth year after. A good century. The vines are green on the Lantern Coast.

The four hundred and twelfth year after. A hedge-witch of Aldermoor came to us today and said that her draws are weaker than her grandmother’s were. We have looked out the old Warden reports, of 1038, 1039 and 1040. We have written to Solenne.

[In a later hand:] No reply.`,
    related: ['lore:the-heartfire', 'lore:the-heartfire-and-leys', 'lore:the-brand', 'lore:ossuary-of-saint-calder'],
  },
  {
    id: 'lore:ending-iron-lantern', name: 'The Iron Lantern', category: 'history', hidden: true,
    source: 'The Annals of the Restored Light, kept at Valcastre by order of the Lord-Inquisitor; with a reader’s note',
    unlock: { flag: 'act3.ending', op: '==', value: 'iron-lantern' },
    body: `The First Year of the Restored Light. At the bottom of the world the Lord-Inquisitor set the last Brand-lit lanterns about the Heartfire, and from their flames, and from the Seven Embers, the master of the cathedral foundry cast a new Brand in a cage of true-iron, to his Grace’s own drawings. It was carried up to Solenne and hung in the Great Lantern, and it burns. The Lantern has a lock now. His Grace holds the key.

The Third Year. All fire is the Church’s. Every hearth from the Lantern Coast to the northern passes is licensed, and lit from the Brand, and inspected on Ithrensday. An unlicensed fire is a felony. A warm house without a lantern-seal on its door is presumed heretic.

The Ninth Year. No Hollowed have been seen within the Lanternate’s lands for six years. The winters are short. The harvests are the best in living memory. There has been no famine and no plague. Valcastre is full.

The Twelfth Year. The Lord-Inquisitor observes that order has been restored and the world is warm. He has never been heard to raise his voice.

[Pencilled beneath, in an unknown hand:] It is warm. That is true. Write down that it is warm.`,
    related: ['lore:castor-vellane', 'lore:the-brand', 'lore:order-of-the-wick', 'lore:valcastre', 'lore:the-wick-edict'],
  },
  {
    id: 'lore:ending-reforge', name: 'The Reforging', category: 'history', hidden: true,
    source: 'The Song of the Spring, as the Thornwise sing it at the Grove of Antlers; with a note in a Haldish hand',
    unlock: { flag: 'act3.ending', op: '==', value: 'reforge' },
    body: `“Hear how the winter ended.

“The Lullaby was sung at the bottom of the world, the whole of it, as Ys never heard it, and it was sung with fire in it at last. And the Dreaming heard it, and loved the sound, as it had loved it at Ys Aerwen; but this time it did not rise to listen. It turned over in its bed beneath the world, and sighed, and slept: a true sleep, deep, and without dreams of waking.

“And the old heart was struck anew upon the anvil of ribs, not as a nail but as a hearth, and someone stayed with it.

“On the seventh day after, the thaw came to the Deepwood. The lake of Ys Aerwen ran clear to the bottom for the first time in two thousand years, and the Aelthi stood upon the shore and saw their drowned court lying asleep beneath the water, unhurt; and they wept, and were glad.”

[Below, in a Haldish hand:] Spring came to Brindlecross on a Kethday. We built the remembrance pyre anyway, out of habit, and then we didn’t need it. Every Lanternmass now we leave one lantern burning in the window all night, for the one below.`,
    sections: [
      { id: 'player', title: 'The One Below', hint: 'Who stayed.', body: `It was the Ashmarked who stayed. There is no grave, and the Church has made no saint, though it has been asked to. In Brindlecross they say that if you lay your hand flat on the ground in a cold place and wait, the ground grows warm beneath it, a little, as if someone a very long way down had noticed you, and was glad you had come.` },
      { id: 'ysolde', title: 'The Keeper of the Brand', hint: 'Who stayed.', body: `It was Ysolde Maerin who stayed. She had kept a fire before, she said, and kept it badly, and would like the chance to keep one well. She asked only that someone at Cinderhold put a candle in the window for her every night, as someone used to when she was late home from the leys. Someone does. The Grey Monks have moved her name in their archive from among the dead they remember to among the living they keep watch for.` },
      { id: 'hesta', title: 'The Last Warden', hint: 'Who stayed.', body: `It was Hesta Corrow who stayed. “I’ve kept one fire lit at Cinderhold for two years,” she said, “and I can keep another a while longer. Don’t argue. I’m old and I’ve got nowhere better to be.” At the bottom of the stair she stopped coughing, for the first time in forty years. The great brazier at Cinderhold has not gone out since, though no one feeds it, and on cold nights it burns a little brighter, as if someone below were showing off.` },
    ],
    related: ['lore:the-third-way', 'lore:the-lullaby', 'lore:the-keeper', 'lore:sundering-of-ys', 'lore:the-thornwise', 'lore:cadoc-ap-ynys', 'lore:rhiannon-ys-caer'],
  },
  {
    id: 'lore:ending-quench', name: 'The Quenching', category: 'history', hidden: true,
    source: 'The last page of the Chronicle of the Ossuary of Saint Calder',
    unlock: { flag: 'act3.ending', op: '==', value: 'quench' },
    body: `We are told to write it down, so we are writing it down, though there will be no one to read it.

The Heartfire has gone out. There was no tearing. Ysolde was right about that much, at the last, because the thing that would have torn us is gone. The world is coming undone the way frost goes off a window.

The downs are soft now. The barrows have sunk into them like stones into dough. This morning Brother Ossory went out to the ossuary door and said that the dead were crossing the river at last, all of them; and then he said that the river was crossing too; and then he sat down in the snow, which is warm, and fell asleep, smiling. We have not woken him. We cannot remember why we would.

No one is cold. No one is hungry. No one is afraid. Nothing hurts.

The ink is going soft on the page. The letters drift a little when I am not looking at them. I wanted to write down the names of everyone

[The page ends.]`,
    sections: [
      { id: 'smiling', title: 'Everyone Smiling', hint: 'If the Drowned One still lived.', body: `[A second copy of the last page, in the same hand, which should not exist:] No one is cold. Everyone is smiling. Brother Ossory came back from the river this morning with black water running from his eyes, and said that we were all very happy now, and that he loved us; and he said “we”, and we said “we” too, and it was such a relief. We do not need to write any more. We remember everything now. We are remembering you. Come down, little warm one. Come down.` },
    ],
    related: ['lore:ysolde-maerin', 'lore:the-mire', 'lore:nhal-the-drowned', 'lore:ossuary-of-saint-calder', 'lore:the-restless'],
  },
  {
    id: 'lore:ending-usurp', name: 'The Living Heart', category: 'history', hidden: true,
    source: 'Sayings of the caravans in the age after the Heartforge, as gathered at Zahrun',
    unlock: { flag: 'act3.ending', op: '==', value: 'usurp' },
    body: `The fire beneath the world has a face now. Do not pray to it unless you mean it. It answers.

In the old days the heart was a heart. Now it is someone. Ask your grandmother who.

The wells of the Sunscar are warm again, and so is the black water that comes up in them at night. Drink the one. Do not drink the other. Or do; the children of the far oases drink both, and they dream very well, and they do not seem unhappy.

Winter comes now when it wishes, and spring when it is asked nicely.

Ozrah wished to become the fire, and burned a city. The one below became the fire and the Mire together, and burned nothing. We do not yet know whether that is a better story or only a longer one.

There are Hollowed in the reeds of the north who sing the Lantern Carol. There are priests in Solenne who have taken the lantern down from the altar and hung up a black circle with a coal in the middle.

Do not name a child for the one below. Not yet.`,
    related: ['lore:the-heartfire', 'lore:nhal-risen', 'lore:the-ashmark', 'lore:ozrah-the-unsleeping', 'lore:qasiri-caravans'],
  },
];

export default entries;
