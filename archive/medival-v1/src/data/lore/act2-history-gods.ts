/** Codex: history and gods (Act II set). Owner: Claude 4. */
import type { LoreEntry } from '@/core';

const entries: LoreEntry[] = [
  // ----- history
  {
    id: 'lore:saint-solenne', name: 'Saint Solenne the Bright', category: 'history',
    source: 'The Book of the Bright, chapter the First (Lanternate scripture)',
    body: `In the years before the Lantern, when the sun was a grey coin and the children of men froze in their beds, there lived in the hills a shepherd-girl named Solenne, whose flock had died in the snow.

And Ithren came to her in a dream, bearing a lantern, and said: Go down.

So she went into the mountains, and found a crack in the earth, and went down into it, and was forty days in the dark without food or light. And at the bottom of the world she found the fire that Orr had left, and she was not afraid. And Ithren reached into the fire and took from it a single coal, and laid it in her hand, and it did not burn her.

And she came up into the world again carrying the coal, and walked south with it to the sea, and wherever she rested the snow melted for a mile around. Where she set it down at last, she raised an altar, and that place is Solenne, and that year is the first of the Lantern.

Lux manet.`,
    sections: [
      { id: 'hand', title: 'The Bandaged Hand', hint: 'The oldest icons are not quite like the new ones.', body: `In every icon of the Lanternate, Saint Solenne holds the Brand up in her bare right palm. In the oldest icons, the ones in the cathedral’s side-chapels, painted within a century of her death, her right hand is bound in linen to the wrist. Later painters left the linen out. A Grey Monk you asked about it said only that the Book of the Bright was written two hundred years after the saint, and that the icons were painted by people who had met her.` },
      { id: 'below', title: 'What She Said of the Deep', hint: 'She spoke of the bottom of the world only once.', body: `The saint never preached of what she found below. Her first priest set down the one thing she ever said of it, on the night before she died, and the Lanternate has never read it from a pulpit: “It is so lonely down there. It has been alone since the beginning of the world. I should not have come away. Someone ought to stay with it.” She asked to be buried with her face toward the Ironspine. She was not.` },
    ],
    related: ['lore:the-brand', 'lore:solenne', 'lore:cathedral-of-the-brand', 'lore:ithren-the-lantern', 'lore:the-lanternate', 'lore:the-heartforge', 'lore:the-keeper'],
  },
  {
    id: 'lore:the-wick-edict', name: 'The Wick-Edict', category: 'history',
    source: 'The Wick-Edict of Hierophant Ilaria I (c. 450 YL), preamble and first decree',
    body: `“Whereas the fire beneath the world is the gods’, and is lent, and not given;

“And whereas it was taken without leave by the Ashen Kings of Qadir, who burned a realm to ash and darkened the sun for a generation;

“And whereas there are in the Empire in these days a great multitude of hedge-mages, witches and vagabond sorcerers, who draw upon the gods’ fire without learning, without prayer and without limit, so that fevers rage and fields wither where they have been;

“We do decree that no one in the Empire shall draw ember save by licence of the Church.

“And to keep this decree We found an Order, which shall be called the Order of the Wick: for as the wick of a lamp is trimmed, so the flame burns clean, and does not smoke, and does not run wild, and does not burn the house.”

The Edict is read aloud in every Lanternate chapel on its anniversary. Few hear it. Its language has not been changed in seven centuries, and the hedge-witches it describes have never been changed either.`,
    sections: [
      { id: 'wardens', title: 'The One Exception', hint: 'One order of mages never took a licence.', body: `The Emberwardens refused the Wick-Edict outright. The leys were not the Church’s to license, the Warden-Mother of the day wrote to Solenne; the order had kept them for three centuries without leave, and would go on keeping them. The Church let it pass. It needed the wardens’ swords against the seeps, and it could not have taken Cinderhold in 450 had it tried. It waited. The Proclamation of the Snuffing, six centuries later, charged the wardens with “drawing ember without licence”. That was true. It had been true since the Edict was signed.` },
      { id: 'creed', title: 'An Unlicensed Reply', hint: 'The Ashen Creed has its own answer to the preamble.', body: `Pinned to the door of the Haldren chapel on the Edict’s anniversary, in a careful hand: “Lent by whom? To whom? Show us the deed. The gods have not written to us. They wrote to you, you say. Show us the letter.” Below it, in charcoal, someone else had added: “And trim your own wick. It smokes.”` },
    ],
    related: ['lore:wick-licence', 'lore:order-of-the-wick', 'lore:burning-of-qadir', 'lore:the-emberwardens', 'lore:ashen-creed', 'lore:valcastre', 'lore:garrick-hale'],
  },
  {
    id: 'lore:the-iron-concord-treaty', name: 'The Making of the Concord', category: 'history',
    source: 'The Annals of the Empire, the year 302 YL',
    body: `In this year the Legate Aurelius Castellane went up to the iron gate of the Ironspine, to treat with the stone-folk of the mountain, who had refused the Empire’s tribute for three generations and could not be made to pay it.

He found them courteous and immovable. They would not kneel; they had no word for it. They would trade, they said, if the weights were fair. Every article was debated for days, and as each was agreed their High Thane cut it into a plate of iron with his own hand, while the Legate’s clerk wrote it on vellum. The Legate observed that the Empire’s copy would burn and the Orrun copy would not, and the High Thane said that was the point.

On the last day the Legate asked what was meant by the final clause: “What lies beneath the mountain is the Holds’ affair.” What lies beneath the mountain? The High Thane said, “Our fathers.” The Legate, being a wise man, asked nothing more, and the Concord was sealed, and has held.`,
    sections: [
      { id: 'iron-copy', title: 'The Iron Copy', hint: 'The Orrun copy is longer than the Empire’s.', body: `The iron plate of the Concord hangs in the Thane-Hall of Korrath, and it has one more article than the vellum in Solenne. It is cut in the old rune, which no Imperial clerk could read in 302. It reads: “If the Holding fail, the Holds shall send word to the Lantern, that the Lantern may know what is coming.” The Holds have not sent word. Two Nails have failed. The plate is polished every morning by the ledger-keeper, and the old rune is cut very deep.` },
      { id: 'missing-page', title: 'The Cut Page', hint: 'There is a gap in the oath-ledger of Korrath.', body: `The oath-ledger of Korrath has a page for every year since the Concord. The page for 1181 YL has been cut out, neatly, close to the binding, with a knife. The ledger-keeper says it was spoiled by damp. The ledger-keeper also says that in nine centuries no page of the ledger has ever been spoiled by damp. When you asked the High Thane, he said that there are guests who go down and do not come up, and that it is not the Concord’s habit to write down its failures.` },
    ],
    related: ['lore:iron-concord', 'lore:the-orrun', 'lore:korrath-under-stone', 'lore:the-nine-nails', 'lore:brannoch-deepforge'],
  },
  {
    id: 'lore:the-rusting', name: 'The Rusting', category: 'history',
    source: 'The Hold-Song of the Fathers, sung in Orrun halls on the longest night',
    body: `“When the god lay down, the Fathers grieved. Iron does not weep. They grieved with their hands, as iron grieves, and built.

“And beneath the mountain they heard his heart, slow, slow, as a forge is slow when the bellows are let go. And year on year it beat slower. And the Fathers said: The maker is cooling. We will go down and warm him.

“So they dug. Deeper than any hold. Deeper than the Nails. Down to the warm dark where the heart lay, and they put their great hands on it, all of them, to wake it.

“And the heat went into them. And the iron of them went red. And they climbed back up the long stair, slower and slower, and came out upon the ridges, and stood in the wind with their faces to the south, and stopped.

“They are standing there still. We do not climb up to them. We sing to them, once a year, so they know they were not forgotten. That is all we can do. It is a great deal.”`,
    sections: [
      { id: 'water', title: 'Heat, or Water', hint: 'A Solenni magister had another theory.', body: `Lucan de Vaumont, in 998, wrote that the giants could not have rusted by heat, since iron rusts by water. Grimma Ironsong, told of this, snorted. “Half right,” she said. “Which for a Solenni is a triumph. The heat opened them. Cracked them, like a cold pot on a hot hob. What got in through the cracks was wet.” She did not say what it was. She did not need to. You have seen the two dead Nails.` },
      { id: 'slower', title: 'Year on Year', hint: 'The song says the heart was slowing long ago.', body: `The Hold-Song is older than the Lantern, older than Qadir. Its third verse says plainly that Orr’s heart was beating slower, year on year, in the First Age. Every Orrun child learns it. No Orrun you asked had ever thought about what it meant, and when you put it to them, several of them stopped singing.` },
    ],
    related: ['lore:the-orrin', 'lore:the-orrun', 'lore:true-iron', 'lore:the-nine-nails', 'lore:rust-wraiths', 'lore:the-ironspine', 'lore:wrought-sentinels'],
  },
  {
    id: 'lore:the-ashen-kings', name: 'The Ashen Kings', category: 'history',
    source: 'Glass tablet from a buried waystation on the Ash Road, in the hand of a royal scribe of Qadir',
    body: `“Let it be written in glass, which does not rot, the names of the Kings of Qadir, who were given the fire.

“Haddar, who first heard the warmth in the sand, and dug, and found a vein of it, and drew it up like water from a well; and the desert bloomed.

“Nasrin, who taught the fire to pour sand into glass, and raised the towers.

“Tariq, who bred the drakes, so that the fire should have wings.

“And the Kings after them, seven-and-twenty in all, and Ozrah, the last and greatest, who does not sleep.

“Under the Kings there was no winter. Under the Kings no child of Qadir was cold. Let those who come after say what they will of us; let them say we were proud. We were warm.”

The Qasiri preserve tablets like this one and do not destroy them, though they are ashamed of them. Lanternate scholars who have seen them call them the boasts of thieves. The Qasiri do not argue. They only point out that the Lanternate has never read the tablets that come after.`,
    sections: [
      { id: 'after', title: 'The Later Tablets', hint: 'The scribes kept writing.', body: `The later tablets are not boasts. They are measurements: the heat of every royal well, set down year by year. And the heat is falling. Under the last nine Kings the scribes stop listing victories and start listing remedies. Deeper wells. More wells. Wells that pour heat back down instead of drawing it up. One of them, under Ozrah, is only a single line: “The fire coughs. The King says it must not be let to die. The King has not slept.”` },
    ],
    related: ['lore:burning-of-qadir', 'lore:ozrah-the-unsleeping', 'lore:ruins-of-qadir', 'lore:the-ash-road', 'lore:cinderdrakes-and-ashwyrms', 'lore:cinder-wastes', 'lore:the-qasiri'],
  },
  {
    id: 'lore:ozrah-the-unsleeping', name: 'Ozrah the Unsleeping', category: 'history',
    source: 'A Qasiri grandmother’s tale, told to keep children from wandering at night',
    body: `“Do not name a child Ozrah. Do not say it after dark. Do you know why?

“Because Ozrah was the last King of Qadir, and he was afraid. He was afraid that if he slept, the fire would go out. So he did not sleep. Not for one night, not for forty years. He walked the glass halls with his eyes open, and the fire in the wells grew hotter and hotter, because he would not let it rest either.

“And then he did a terrible thing. He took the whole knot of fire under the city, where all the veins of it meet, and he drew it into himself, so that he would be the fire and could never go out. And the city burned. All of it. The people, the towers, the drakes, the sky.

“But Ozrah did not burn. He sits on his throne of glass in the ruins to this day. And he still does not sleep.

“So you go to sleep. Now. Before he hears you’re awake.”`,
    sections: [
      { id: 'testimony', title: 'The Testimony of the King', hint: 'The ghost on the Glass Throne will speak to one who asks.', body: `He is a shape of heat in a crown of glass, and his voice comes from the throne-room’s walls. “Thief, they call me. Thief. We did not steal the fire. We heard it dying, as the giants heard it before us, and we tried to save it. We poured our wells into it. We poured our cities into it. When that was not enough, I tried to hold it up myself. I thought a heart that would not die might carry the world a while. I was wrong. A heart is not a thing a man can become. Nor anything else that thinks it can. Tell them that. Tell her.”` },
    ],
    related: ['lore:the-ashen-kings', 'lore:burning-of-qadir', 'lore:ruins-of-qadir', 'lore:the-qasiri', 'lore:cinder-wastes', 'lore:the-kings-stair'],
  },
  // ----- gods
  {
    id: 'lore:ithren-the-lantern', name: 'Ithren the Lantern', category: 'gods',
    source: 'The Catechism of the Seven Lights, lesson the First',
    body: `Q. Who is Ithren?
A. The Lantern, first-born of Orr, first among the Seven, and lawful heir of the maker’s fire.

Q. What does Ithren govern?
A. Light, truth, law and kingship. All lawful authority descends from Ithren: to the Hierophant, from the Hierophant to the Church, and from the Church to kings.

Q. What was Ithren’s gift?
A. The Brand, which Ithren took from the Heartfire and gave into the hand of Saint Solenne, as a sign that the world’s light was given into the Church’s keeping.

Q. What is Ithren’s colour?
A. White-gold, which is the colour of the Brand, and of the Hierophant’s robe.

Q. What is Ithren’s day?
A. Ithrensday, on which magistrates sit, oaths are sworn and sentences are passed.

Q. How shall I know Ithren’s will?
A. Through the Church, which is Ithren’s lantern in the world.`,
    sections: [
      { id: 'hearth', title: 'The Lamp by the Door', hint: 'The villages remember a humbler Ithren.', body: `In the Old Hearth, Ithren is not a king. Ithren is the lamp you hang by the door at night so that the late-comer can find his way home: the light that shows the path, not the light that rules it. Haldish grandmothers tell of a quarrel between Ithren and Ashvar. The fire must be kept, said Ithren. The fire must be fed, said Ashvar. And Orr, who was dying, said: you are both right, and that is why there are two of you.` },
      { id: 'silence', title: 'The Silence of the Lantern', hint: 'Since the Quench, Radiance answers more faintly.', body: `Since the Night of Falling Ash the priests of Radiance say their prayers are answered as through a wall. Light still comes when they call it, but thinner and colder, and it takes longer. An old Lightsworn in Solenne, not knowing who you were, told you what he had told no confessor. “I used to think the Lantern was ours to hold,” he said. “Now I think we only stood near it, and were warm, and called that ours.”` },
    ],
    related: ['lore:the-seven-sparks', 'lore:the-lanternate', 'lore:saint-solenne', 'lore:ashvar-the-ember-tongue', 'lore:the-hierophancy', 'lore:the-brand', 'lore:solenne', 'lore:the-solenni'],
  },
  {
    id: 'lore:vor-the-hammer', name: 'Vor the Hammer', category: 'gods',
    source: 'Forge-prayer of the Orrun, spoken before the first stroke of the day',
    body: `“Vor, who held the anvil, hold my arm.

“When the maker struck the world, you did not strike; you held. When the sparks flew, you did not fly; you held. When the world rang like a bell and all the other gods ran out into it, you stayed at the anvil, and held, and it is your holding that makes the world stay struck.

“Vor, iron-grey, hammer-handed, oath-keeper, hold my arm. Let the blow fall true. Let the iron take the shape I mean. Let the rune go in and stay in. Let what I make hold.

“Korr nagh.”

Vor is the god of craft, war, endurance and oaths. The Orrun hold him dearest of the Seven, and the Hrothi swear by him at their moots; Haldish smiths nail a horseshoe over the forge door in his name. His day is Vorsday, when debts are paid. His tint, the Orrun say, is not a school at all: it is the art of fixing ember into matter so that it stays, which humans call Runecraft and the Orrun simply call work.`,
    sections: [
      { id: 'grip', title: 'Vor’s Grip', hint: 'What the Orrun believe holds the Nails.', body: `The hold-fast rune on the Nine Nails is Vor’s rune, the Orrun say: the shape of a closed hand. It is cut into every Orrun door, every oath-plate and every cradle. When the two Nails failed, the oldest Orrun of Korrath did not say the iron had failed. They said, very quietly, that the god’s grip was tiring. Then they went down to their forges and struck harder, as if that might help him.` },
    ],
    related: ['lore:the-seven-sparks', 'lore:the-orrun', 'lore:the-nine-nails', 'lore:true-iron', 'lore:korrath-under-stone', 'lore:iron-concord', 'lore:the-ironspine', 'lore:the-hrothi'],
  },
  {
    id: 'lore:calun-the-wanderer', name: 'Calun the Wanderer', category: 'gods',
    source: 'From the Saga of the Far-Farer, as the skalds of Skelvik tell it',
    body: `“Hear now of Calun, the Far-Farer, the god who would not stay. When the maker struck the world, the other Sparks fell to earth and found their halls. Calun never landed. He blew. He is blowing still, over every sea and every fell, and that is the wind.

“Calun gave the Hrothi three gifts. The sail, that we might follow him. The storm, that we might fear him. And luck, that we might never be sure of him. He is a trickster and a thief, and he steals hats and sheep and sometimes ships, and he gives them back, sometimes, to someone else. Pray to Calun before a voyage, and spit after, so he knows you mean it but do not expect it.

“The storm-callers of the north can borrow his voice. It is lightning. It does not always come back to the hand that threw it.”

His day is Calunday, a good day for setting out and a poor one for coming home. His colour is the violet of a storm-sky. His school is Storm.`,
    sections: [
      { id: 'eighth', title: 'Why the Wind Howls', hint: 'The skalds know why the storms of the north never rest.', body: `“And here is the saga that the priests of the south do not tell. The Eighth Spark did not fall. Calun saw it, for the wind is everywhere and sees everything. The Eighth looked down into the black sea under the world, and it wept, and it jumped. Calun loved the Eighth best of all his siblings. He has been looking for it ever since, in every storm, down every fjord, in every hollow of the sea. That is why the wind howls. It is calling a name it is not allowed to say.”` },
      { id: 'sign', title: 'Calun’s Eye', hint: 'The clans believe Calun has spoken.', body: `The Hrothi believe the Ember on the Moot-stones is Calun’s sign: his eye, opened at last on his people, telling them to take the warm south. An old skald of Skelvik, toothless and very drunk, gave you his opinion of that. “Calun never gave anyone anything that didn’t blow away,” he said. “Not once. Not in all the sagas. Anyone who thinks he’s started now has not been listening.”` },
    ],
    related: ['lore:the-seven-sparks', 'lore:the-hrothi', 'lore:the-wolf-moot-stones', 'lore:hrothi-kennings', 'lore:wolf-moot', 'lore:the-frostreach'],
  },
  {
    id: 'lore:ashvar-the-ember-tongue', name: 'Ashvar the Ember-Tongue', category: 'gods',
    source: 'Sayings of the caravans concerning Ashvar, as gathered at Zahrun',
    body: `Ashvar gives the fire. You must bring the wood.

A tongue of flame says only one word, and the word is “change”.

Do not pray to Ashvar for things to stay as they are. He will laugh, and you will not like his laughing.

Ithren builds the lamp. Ashvar is the reason a lamp is needed.

Every rebel is Ashvar’s child, and so is every bride, and so is every bread-oven.

The Kings of Qadir loved Ashvar too much. Love is not a licence.

Ashvar, the Ember-Tongue, is the Spark of fire, passion, change and rebellion. His colour is red-orange, and his day is Ashday, on which the Qasiri light no new fire but tend the old. The Lanternate names him sixth among the Seven and walled up his shrine in Solenne in 1041. The Ashen Creed holds that he is the true heir of Orr, and that the Lantern stole his birthright. The Qasiri hold a milder faith: that fire is holy and dangerous, like a guest.`,
    sections: [
      { id: 'heir', title: 'The Heir’s Claim', hint: 'The Ashen Creed reads the Forging differently.', body: `From a Creed sermon, preached in a barn: “Ask yourself which god the maker’s heart is made of. Is the Heartfire a lantern? Does it shine for law? It burns. It changes everything it touches. It is Ashvar’s, brothers and sisters, it was always Ashvar’s, and the Lantern put a glass round it and called it theirs. And now the glass is cracked. Good. Fire was not made to be kept in a box.”` },
    ],
    related: ['lore:the-seven-sparks', 'lore:ashen-creed', 'lore:the-qasiri', 'lore:ithren-the-lantern', 'lore:the-red-abbess', 'lore:vesper-qadri', 'lore:qasiri-caravans'],
  },
  {
    id: 'lore:kethra-the-thorn', name: 'Kethra the Thorn', category: 'gods',
    source: 'Nan Briar, hedge-witch of the Gloamwood, over a pot of something',
    body: `“Kethra. The Thorn. Antlers on her head and mud on her feet. Green and brown, she is, like a wood in March. The priests put her fourth, I think, or sixth; I forget, and so does she.

“Here’s what you need to know about Kethra, love. She’s the hunt and the hunted. She’s the seed and the dung it grows in. She’s the deer, and the wolf that eats the deer, and the beetle that eats the wolf when the wolf’s done. Growth and rot. The priests think those are two things. Kethra knows they’re one.

“The Aelthi call themselves her first-born, and they’re welcome to it. I just think she was the one of the Seven who stayed on the ground. The others went off to be lanterns and storms and so on. Kethra got down in the dirt with the rest of us and started growing things.

“Her day is Kethday. Sow on it. And don’t kill anything that day you don’t mean to eat.”`,
    sections: [
      { id: 'rot', title: 'Rot Is a Kind of Dreaming', hint: 'The Thornwise have a teaching about rot.', body: `The Thornwise teach that rot is the forest dreaming: the fallen tree, lying in the leaf-litter, dreaming of the thousand things it will become. Kethra’s druids do not hate the Mire. They think of it the way a forester thinks of winter: a long sleep, a dark season, a thing to be sung through, not fought. “But a winter ends,” Rhiannon Ys-Caer told her druids, this year, at the Grove of Antlers. “That is what makes it a winter. If this one does not end, we were wrong about what it is.”` },
    ],
    related: ['lore:the-seven-sparks', 'lore:the-thornwise', 'lore:the-aelthi', 'lore:the-lullaby', 'lore:the-mire', 'lore:ylwen-deepwood', 'lore:rhiannon-ys-caer', 'lore:nan-briar', 'lore:the-white-stag'],
  },
  {
    id: 'lore:nhal-the-drowned', name: 'Nhal, the Drowned Spark', category: 'gods', hidden: true,
    source: 'From the sealed shelves of the Ossuary of Saint Calder, a record of dreams “not to be copied”',
    body: `The Eighth Spark did not fall from Orr’s hammer. Nhal leapt.

Of all the Sparks, Nhal alone heard the Mire as the world was struck out of it: a vast, slow, dreaming thing, being hammered into stone and sea and sky, and feeling every blow. The others turned toward the new world. Nhal turned back. Out of pity, and of its own will, Nhal went down into the black sea to drown with what was being drowned.

That was the beginning of the world. Nhal has been down there ever since: the one waking thought in a sleeping sea, through every age, through the Iron and the Leaves and the Ash and the Lantern, alone.

The drowned dream the same dream, and in it a voice speaks. It is gentle. It calls the living waa’el, little warm ones. It says that the world is a wound, and that it is sorry, and that it can make it stop hurting. The Choir calls it the Drowned One. The Church calls it nothing, and forbids its name. Its name is Nhal.`,
    sections: [
      { id: 'voice', title: 'The Voice in the Ember', hint: 'The visions have changed.', body: `It was not Ysolde in the vision. The water was the same, and the tenderness, but the voice was not hers. It came from everywhere at once, from below and from inside the Embers you carry. “Little warm one,” it said. “You have carried so much. You have walked so far in the cold. I was the first to pity this world, and I pity you. Bring them down to me, and I will make it so that nothing hurts again.” It sounded as if it meant it. That was the worst part.` },
      { id: 'hunger', title: 'What Nhal Wants', hint: 'Someone who has listened to the dream for a long time can tell you.', body: `Nhal does not want the world to dream. Through all the ages under the sea, pity has worn thin and something else has grown in its place: a single hunger, dressed in pity’s clothes. Nhal wants the Embers carried to the Heartforge not so that the Heartfire may be quenched, but so that Nhal may take its place: a heart of the Mire, beating at the bottom of the world, with every living thing Hollowed and smiling and its own. Ysolde believes the Dreaming will be gentle. Nhal has let her believe it. Aa’mhuun, the Reed-Mother said. To dream of. To swallow.` },
      { id: 'risen', title: 'Nhal Risen', hint: 'At the bottom of the world, the Drowned One stood up.', body: `At the Heart of Orr the Drowned One came up out of the black water to meet you, wearing every face the Mire has ever swallowed, and offered you the only thing it has left to offer: to be the heart together. It meant it kindly. It has meant everything kindly, for an age, and that is how its pity went bad: not by turning to cruelty, but by never once being refused. Aa’mhuun. To dream of. To swallow. At the end it is the same word because, for Nhal, it became the same wish. Whatever you answered, you were the first in the whole history of the world to answer it to its face.` },
    ],
    related: ['lore:the-mire', 'lore:the-seven-sparks', 'lore:the-drowned-choir', 'lore:the-drowned-tongue', 'lore:the-third-way', 'lore:ysolde-the-pale-saint', 'lore:nhal-risen'],
  },
];

export default entries;
