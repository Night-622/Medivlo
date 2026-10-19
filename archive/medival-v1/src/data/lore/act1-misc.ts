/** Codex: magic, characters, bestiary, culture (Act I set). Owner: Claude 4. */
import type { LoreEntry } from '@/core';

const entries: LoreEntry[] = [
  // ----- magic
  {
    id: 'lore:the-lullaby', name: 'The Lullaby (Hun-Aerwen)', category: 'magic',
    source: 'Cadoc ap Ynys, at the Thornwall',
    body: `“Every child of Ylwen knows the story, and no child of Ylwen knows the song. That is the point of the story.

“Our loremasters heard the Dreaming long before your people learned to build in stone. They heard it turn in its sleep beneath the world, and they heard it grieve, and they pitied it. The Lantern would have you chain a thing like that. We thought: why chain what can be soothed? So they made a song to sing it back to sleep, a true sleep, deep and without dreams of waking. Hun-Aerwen, they called it. The Lullaby.

“They sang it at Ys Aerwen, all together, on a still night. And the Dreaming heard them, and loved the sound, and came up to listen. You know the rest. Afterwards we swore an oath on the drowned that the song would never be sung again, and we unlearned it, verse by verse, mother to child. Nearly all of us.”`,
    sections: [
      { id: 'verse', title: 'A Verse Remembered', hint: 'Not everyone unlearned it.', body: `Cadoc sang it once, very quietly, with his hand over the Ashmark as if to keep it from hearing: “Hun, Ae’Hun, ys hun. Gwyn aer, gwyn aer, ys hun.” Sleep, Dreaming, sleep below. Bright song, bright song, sleep below. Then he stopped, though the tune plainly went on. “That is as much as I will give you,” he said, “until I know what you mean to do with it.”` },
      { id: 'what-failed', title: 'What Failed at Ys', hint: 'The Thornwise have a theory.', body: `The Thornwise do not believe the Lullaby was wrong. They believe it was unfinished. “We sang with voices only,” Rhiannon Ys-Caer told you at the Thornwall. “Voices are water and air. We had nothing to sing it with that would not melt. Perhaps a song like that needs something in it that burns.” She looked at your hand when she said it, and then away.` },
      { id: 'last-verse', title: 'The Last Verse', hint: 'It went down with Ys Aerwen.', body: `Eluned, loremaster of Ys Aerwen, made the Lullaby, and on the night it was sung on the lake her people sang every verse of it but one. This is the one. It is the only verse that asks anything of the singer. She sang it to you at the bottom of the lake, close to your ear, the way one sings to a single child in a room full of sleeping children; and Cadoc ap Ynys sang it back under the water, with your hand burning beside him, and the bells of Ys stopped.

Hun, Ae’Hun, ys hun;
mi gwyl, mi gwyl, ni hun.
Tân yn caer, gwyn aer;
hiraeth-ys, ni hun.

Sleep now, Dreaming; sleep below.
I keep the watch. I do not sleep.
There is a fire in the hold, a bright song at the door,
and I grieve for the drowned, and I do not sleep.

Turn over, sea, and do not rise.
The ones you took are in my song.
I will not leave you in the dark;
I am the lamp you sleep beside.

And when the long night wears to grey
and you would wake, wake as yourself.
I will be here. I will be here.
Sleep, Dreaming. I am awake.

“Every lullaby has a mother in it,” Eluned said, “sitting up by the bed so the child can sleep. Sung by voices alone it is a lie, because voices sleep. Sung with something that burns…” She looked at your hand, and did not look away.` },
    ],
    related: ['lore:sundering-of-ys', 'lore:the-mire', 'lore:the-thornwise', 'lore:cadoc-ap-ynys', 'lore:rhiannon-ys-caer', 'lore:kethra-the-thorn', 'lore:the-third-way', 'lore:book-lament-for-ys'],
  },
  {
    id: 'lore:the-nine-nails', name: 'The Nine Nails', category: 'magic',
    source: 'Ledger-fragment of the Iron Concord, in Orrun rune, translated by Grimma Ironsong',
    body: `“Of the Fathers’ works beneath the mountain, the greatest is the Ninefold Holding. Where the Unmaking pressed upward hardest, under the god’s ribs, the Fathers drove nine nails of true-iron into the root of the world, each the height of a hold-hall, and sang the hold-fast rune into each, and the Unmaking was pinned beneath them and could not rise.

“True-iron does not rust. The rune does not fade. The Holding is for ever.

“Let it be entered: the Holds of the Concord are its keepers, and shall keep it, and shall not speak of it to those who are not of the Holds, lest they ask what it holds down.”

The Vault of the Nine Nails lies far beneath Korrath-under-Stone. No human has seen it. Most Orrun have not. The Concord keeps the Nails in the way the Orrun keep everything: in a ledger, in silence, and for ever.`,
    sections: [
      { id: 'failed', title: 'Grenn', hint: 'True-iron does not rust.', body: `The shaft below Dun Korrath-Gate holds the head of a lesser nail, a cousin of the Nine, driven by the Fathers long before the Holds were dug. It is rusted through. It came apart in your hands, and black water welled up in the hole where it had been. Grimma would not touch it. “There are two of the Nine like this,” she said. “Two in nine. I’ve seen them. The ledger says for ever. The ledger is wrong.”` },
      { id: 'cousins', title: 'Lesser Cousins', hint: 'There may be more of them than the Orrun admit.', body: `You described the Giant’s Sluice at Wennamere to Grimma: the great stone gate, the wheel, the rune carved upon it. She asked you to draw the rune. You did. She looked at it a long time, and then she put the drawing in the forge, and said she had never seen it before.` },
    ],
    related: ['lore:iron-concord', 'lore:the-orrin', 'lore:the-orrun', 'lore:grimma-ironsong', 'lore:rust-wraiths', 'lore:vault-of-the-nine-nails', 'lore:brannoch-deepforge', 'lore:true-iron', 'lore:korrath-under-stone'],
  },
  {
    id: 'lore:wick-licence', name: 'The Wick-Licence', category: 'magic',
    source: 'A Wick-licence, standard form (Haldren diocese)',
    body: `IN THE NAME OF THE SEVEN LIGHTS, and by the authority of the Wick-Edict:

Know that the bearer, ______, of the parish of ______, having been examined by the Order of the Wick in the doctrine of the Lantern and in the safe and lawful drawing of ember, is licensed to practise the tint of ______ and no other, for the purposes of ______ and no other, within the diocese of ______ and no other, for a term of seven years.

The bearer shall not teach. The bearer shall not draw upon any ley not consecrated. The bearer shall present this licence on demand to any officer of the Wick, and shall submit to examination at the Order’s pleasure.

Witnessed and sealed, ______, Prior.

Since the Wick-Edict of about 450 YL, no one in the Empire or the Haldmarch may draw ember outside the Church without such a paper. A licence costs a year’s wages in fees and examinations. Most hedge-mages have never held one. Since the Quench, the Wick has stopped issuing them.`,
    sections: [
      { id: 'forged', title: 'A Fair Hand', hint: 'Not every licence was issued by the Church.', body: `The licences of the Haldren diocese are sealed by Prior Benedek, and a surprising number of them were never seen by him. Brother Anselm Pryde, it turns out, has a very fair hand and an excellent memory for seals. Prior Benedek, told of this, went pale, then red, then sat down. “Please,” he said, “never tell Lord Vellane. He would not believe I did not know.”` },
    ],
    related: ['lore:order-of-the-wick', 'lore:ashen-creed', 'lore:bloodcraft', 'lore:the-lanternate', 'lore:garrick-hale', 'lore:the-wick-edict', 'lore:anselm-pryde'],
  },
  {
    id: 'lore:bloodcraft', name: 'Bloodcraft', category: 'magic',
    source: 'Instruction of the Order of the Wick to its witchfinders, ch. VII',
    body: `Of the practice called Bloodcraft, or Reaving.

The lawful mage draws ember from the leys, which are the gods’ and are lent. The Reaver draws it from within himself: from the warmth of his own blood and body. It is quicker than any lawful drawing and more savage, and it needs no ley, which is why it has spread so greatly since the leys began to weaken.

It is forbidden absolutely. It cannot be licensed.

The witchfinder will know a Reaver by pallor, by cold hands, by old cuts on the forearm and palm, and by the frost that forms upon his breath after he has drawn. He is to be taken, and if he cannot be taken, he is to be killed.

Let the witchfinder remember why. The Mire does not answer to ember. It answers to the warmth of the living. Bloodcraft is the first step on the road to Mirecraft, and those who take it are already halfway down.`,
    sections: [
      { id: 'reaver', title: 'A Reaver’s Answer', hint: 'Written on the back of the page in another hand.', body: `“Halfway down to what? The leys are going out. The Church won’t license me, and the gods won’t answer. My blood is the only fire I have left that is mine. I know what listens when I use it. I hear it. It’s very kind. It says I needn’t be cold. That is how you know not to listen.”` },
    ],
    related: ['lore:wick-licence', 'lore:cinderlung', 'lore:the-drowned-choir', 'lore:the-heartfire-and-leys'],
  },
  {
    id: 'lore:cinderlung', name: 'Cinderlung', category: 'magic',
    source: 'A Warden’s Primer, ch. IV, “Of Overdraw”',
    body: `Ember is heat, and heat must go somewhere. The body of a mage is a hearth: it can hold so much fire and no more, and what it cannot hold, it burns.

The first sign is the cough. It is dry, and there is a taste of smoke after it. Then the cough brings up ash, grey flecks in the spittle. Then come the burn-lines: thin red tracks upon the skin of the hands and arms, following the paths the ember took. These do not heal. A mage who goes on drawing after the burn-lines appear will feel the heat in the lungs at every breath, and then in the blood, and at the last the body burns from within, all at once. What is left is ash in the shape of a man.

There is no cure for cinderlung. There is only rest, cold water, willow bark, and the discipline to draw less. Remember Qadir.`,
    sections: [
      { id: 'hesta', title: 'Hesta’s Cough', hint: 'You know someone who has it.', body: `Hesta Corrow’s burn-lines run from her fingertips to her elbows, and her cough wakes the whole of Cinderhold. She will not rest, she has no willow bark, and she does not seem to know the meaning of the word discipline. “I’m seventy years old,” she says, when you raise it. “What do you want me to save it for?”` },
    ],
    related: ['lore:the-heartfire-and-leys', 'lore:bloodcraft', 'lore:burning-of-qadir', 'lore:hesta-corrow'],
  },
  // ----- characters
  {
    id: 'lore:queen-aldith', name: 'Queen Aldith', category: 'characters',
    body: `Aldith, Queen of the Haldmarch, is fifteen years old. Her father King Aldred died in the first cold months after the Night of Falling Ash, of a fever that the Long Winter would not let him shake, and she was crowned in Haldren cathedral in a borrowed mantle, because her own was too long and there was no time to take it up.

She is small, dark-browed and very still. She speaks in the formal manner of the court, which she learned from her father’s tutors and uses like armour, and she has a habit of asking the one question that no one in the room wished to be asked. Her council finds her alarming. Her people hardly know her. The Lord Protector rules in her name, and she has not yet said in public whether she minds.`,
    sections: [
      { id: 'audience', title: 'Behind the Formality', hint: 'She is not as composed as she seems.', body: `When the audience was over and the Lord Protector had gone, the Queen stayed upon the oak throne. She did not dismiss you. After a while she said, without the court voice: “They are eating the seed-corn in Haldford. Did you know? If spring comes now there will be nothing to plant.” Then the court voice came back, and she thanked you for your attendance.` },
    ],
    related: ['lore:crown-of-haldmarch', 'lore:haldren-keep', 'lore:osric-harrow', 'lore:haldren', 'lore:the-kingsvale'],
  },
  {
    id: 'lore:osric-harrow', name: 'Osric Harrow, Lord Protector', category: 'characters',
    source: '“The Ballad of the Northern Pass”, as sung in Haldren taverns',
    body: `“Three hundred came down from the frozen north / With axe and with fire and with wolf on the shield; / Harrow stood in the pass with forty men forth, / And Harrow stood fast, and he would not yield.”

Osric Harrow, Lord of Harrowfield, held the northern passes against Hrothi raiders in King Aldred’s time, and the ballads have never forgotten it. When the old king died he named Harrow Lord Protector until his daughter came of age, and few in the kingdom thought it a poor choice.

He is a big, weathered, courteous man in his fifties, who speaks softly and listens more than he talks. He is a good soldier and a better counter of costs, and he has been heard to say that the measure of a lord is how many of his people are alive in spring.`,
    sections: [
      { id: 'bargain', title: 'Harrow’s Bargain', hint: 'Some wars are better ended at a table.', body: `The letters in the reed temple were in Harrow’s hand, and sealed with his ring. The Choir would spare Harrowfield and the Kingsvale; Harrow would send no army into Greywater. He did not deny it. “I bought my people a winter,” he said. “Do you know what it costs to take a drowned town? I do. I have counted it. I would do it again.”` },
    ],
    related: ['lore:crown-of-haldmarch', 'lore:queen-aldith', 'lore:the-drowned-choir', 'lore:haldren-keep', 'lore:reed-mother', 'lore:book-ballad-of-the-northern-pass', 'lore:sigrun-ice-eye'],
  },
  {
    id: 'lore:aldwin-varn', name: 'Aldwin Varn', category: 'characters',
    body: `Aldwin, Lord of Varn, of the line that has held the fen-dykes since 702 YL. In his youth he was known as a careful lord and a dull one, who walked his dykes himself and knew every sluice-keeper by name. He married late, for love, and had one daughter.

In 1168 the Grey Lung came to Varn. His lady and his daughter died of it in the autumn of 1170, a fortnight before Saint Ysolde came to the causeway and healed everyone else. He thanked the saint for his town, and he went into the chapel, and the town said afterwards that he never quite came out.

On the Night of Falling Ash, the Lord of Varn walked down to his own floodgates and opened them, and let the black water into his town.`,
    sections: [
      { id: 'drowned-lord', title: 'The Drowned Lord', hint: 'He is still in his hall.', body: `He sits in the flooded hall of Varn with the water to his chest, in his lord’s chain, and two figures sit beside him: a woman and a girl, pale and smiling, who never speak. He talks to them. He is very gentle with them. “They promised me,” he says. “Below, they said, no one is lost. And here they are. You see? Here they are.”` },
      { id: 'peace', title: 'At Peace', hint: 'His end.', body: `The Ashmark burned through the water, and the woman and the girl came apart like mist on a pond, and there was nothing behind them but reeds. Aldwin Varn looked at the place where they had been for a long while. “Ah,” he said. “Yes. I think I knew.” He did not fight after that. He asked you to have the bells stopped.` },
      { id: 'slain', title: 'Slain', hint: 'His end.', body: `He died calling their names, and the two pale shapes beside him did not turn their heads. When he was gone they stayed a moment, smiling at nothing, and then sank into the black water without a sound.` },
    ],
    related: ['lore:varn', 'lore:the-grey-lung', 'lore:drowned-knights', 'lore:the-drowned-choir', 'lore:greywater-marsh', 'lore:book-varn-charter', 'lore:reed-mother'],
  },
  {
    id: 'lore:cadoc-ap-ynys', name: 'Cadoc ap Ynys', category: 'characters',
    body: `An Aelthi of Ylwen, three hundred years old and still the youngest in his family, a fact he raises often and with feeling. He keeps watch at the Thornwall, which is where the Circle posts those of its people it would rather not have at home. He is long and narrow, with bark-brown skin and silver in his hair, and a thornbow that is very slowly growing leaves.

He has a dry wit, a low opinion of humans in general and a surprisingly high one of you in particular, though he would not put it that way. He calls you “spark”. He means it, mostly, as a warning.

Cadoc was not exiled, exactly. He was asked to sit at the edge of the forest for a century or two and think about what he had done.`,
    sections: [
      { id: 'what-he-did', title: 'What He Did', hint: 'Why the Circle keeps him at the edge.', body: `His mother was among the few who kept the Lullaby after the Sundering, in secret, against the oath. When she died she taught what she had to her youngest. Cadoc, being young, told someone. “I was only two hundred,” he says. “At that age one believes the truth should be told. I have since learned it should be told carefully, and preferably to someone else.”` },
    ],
    related: ['lore:the-lullaby', 'lore:ylwen-deepwood', 'lore:the-aelthi', 'lore:the-thornwise', 'lore:rhiannon-ys-caer', 'lore:book-lament-for-ys'],
  },
  {
    id: 'lore:grimma-ironsong', name: 'Grimma Ironsong', category: 'characters',
    body: `An Orrun runesmith of Clan Ironsong, who keeps a forge in the snow outside Dun Korrath-Gate because she is no longer allowed to keep one inside. She is broad even for an Orrun, with iron rings braided through her hair to the waist and forearms scarred white from a century of sparks. Her runework is the finest in the foothills. The gate-town smiths say so, quietly, and then add that it is a pity.

She does not ask for pity. She asks for coal, payment in advance, and that you stand out of her light.

In the oath-ledger of the Iron Concord, against her name, is written a single word: grenn. Rust. It is the worst thing one Orrun can call another. It means a thing that would not hold.`,
    sections: [
      { id: 'truth', title: 'The Truth She Told', hint: 'What she did to earn the word.', body: `She was the runesmith sent down to renew the hold-fast runes in the Vault. She saw two of the Nine Nails gone red with rust, black water seeping round their heads, and she came back up and told the High Thane. He told her to keep silent. She went to the gate and told everyone instead. “They wrote grenn on me,” she says. “Fine. I wrote it on them first.”` },
    ],
    related: ['lore:the-orrun', 'lore:iron-concord', 'lore:the-nine-nails', 'lore:dun-korrath-gate', 'lore:brannoch-deepforge', 'lore:ironspine-foothills', 'lore:korrath-under-stone'],
  },
  // ----- bestiary
  {
    id: 'lore:cinder-shades', name: 'Cinder Shades', category: 'bestiary',
    unlockOn: [{ kill: 'enemy:cinder-shade' }],
    body: `The walls of Cinderhold are walked by the dead of 1041. They are made of ash and the shape of the wardens they were: red cloaks gone grey, swords gone to cinders, faces like burned paper that still hold a look of great surprise. They do not know the order has fallen. They guard the gate against the Wick, as they did on the last night, and anyone who climbs the crag is the Wick to them.

They burn cold. A blow from one leaves frost, not a blister, as though whatever fire was in them went out a long time ago and left only the memory of its shape. They cannot cross the River Under, any more than the downs’ dead can, and they have been waiting a great deal longer.`,
    sections: [
      { id: 'rest', title: 'Stand Down', hint: 'Perhaps they can be relieved.', body: `When the brazier burned again, the shades on the walls turned toward it, all of them at once. One by one they lowered their cinder-swords. Hesta said something in a voice you had not heard her use, the words of an old order of watch: “Stand down, wardens. The fire is kept.” And they fell, softly, like ash from a pyre when the wind changes.` },
    ],
    related: ['lore:cinderhold', 'lore:purge-of-the-emberwardens', 'lore:the-restless', 'lore:the-emberwardens'],
  },
  {
    id: 'lore:rust-wraiths', name: 'Rust-Wraiths', category: 'bestiary',
    unlockOn: [{ kill: 'enemy:rust-wraith' }],
    source: 'Orrun miners’ lore, as told at Dun Korrath-Gate',
    body: `“When a Father rusted, the heat that killed him didn’t leave. It went into the rust. Most of it sleeps there, in the red stone of the deep shafts. But when you dig into old iron, sometimes the rust gets up.

“It comes off the walls like a red fog, and it has the Father’s shape, more or less: long arms, heavy head, too many joints. It has the Father’s patience. It has none of his sense. It goes for warmth, for lamps and for breathing things. It eats iron where it touches. You’ll hear it before you see it, a noise like a hinge, slow and awful. Lamps out, then, and still, and pray it isn’t hungry.

“Don’t fight one with a good blade. You’ll not have a good blade after.”`,
    sections: [
      { id: 'drawn', title: 'Drawn to the Wound', hint: 'Why there are so many now.', body: `The miners say the rust-wraiths have been thick in the lower shafts this year, thicker than in living memory. They gather where the black water rises, around the broken nail, like moths around a dying lamp. Grimma says that is no accident. Rust is a thing that does not hold. It goes to where things are not holding.` },
    ],
    related: ['lore:the-orrin', 'lore:the-nine-nails', 'lore:dun-korrath-gate', 'lore:ironspine-foothills', 'lore:the-ironspine', 'lore:the-rusting'],
  },
  {
    id: 'lore:drowned-knights', name: 'Drowned Knights', category: 'bestiary',
    unlockOn: [{ kill: 'enemy:drowned-knight' }],
    body: `The household knights of Varn swore to their lord the old Haldish oath: hold, and be held. On the Night of Falling Ash they held. When Aldwin Varn opened the floodgates, they stood their posts on the causeway as the black water rose, and it rose over them, and they did not move.

They are still at their posts. Their mail is full of water, which runs from the joints at every step and never empties. Their faces behind the visors are pale and quite peaceful, and black tears run down them. They fight as well as they did in life, which was very well, and they do not tire or bleed.

The Choir calls them the faithful. The fen-folk call them the poor lads, and leave them bread on the causeway, which is always gone by morning.`,
    sections: [
      { id: 'oath', title: 'An Oath Kept Too Well', hint: 'They still answer to their lord.', body: `When their lord fell in the hall, the drowned knights on the causeway stopped where they stood. Some knelt. Some simply lay down in the water, as though they had been given leave at last, and did not get up again.` },
    ],
    related: ['lore:varn', 'lore:aldwin-varn', 'lore:the-hollowed', 'lore:charter-of-haldren'],
  },
  // ----- culture
  {
    id: 'lore:haldish-hearth-customs', name: 'Haldish Hearth Customs', category: 'culture',
    source: 'Sayings of the hearthwardens, gathered in the Kingsvale',
    body: `Cold hearth, cold heart. The house-fire is not to go out between the first frost and the first lamb. If it does, borrow a coal from a neighbour; a neighbour who refuses a coal will not be forgiven in three generations.

Ash from the hearth is smeared upon the doorposts at Lanternmass and at every death in the house, so that what is cold may not come in. Do not sweep it off until it falls of itself.

When a disaster comes on a village, the hearthwarden lights a remembrance pyre on its anniversary, and every household brings a stick to it, and names its dead.

The grandmother’s seat is nearest the fire. If she is dead, it stays empty, and the cat may have it.

Seven keep us. Hearth and kin. And the oldest saying of all, older than the Lantern: keep the fire, and the fire keeps you.`,
    sections: [
      { id: 'one-fire', title: 'One Fire', hint: 'The Long Winter has changed the custom.', body: `There is not wood enough in the Kingsvale this winter for every house to keep its fire. In village after village, the hearthwardens have done something that has not been done since the Grey Winters: they have let the household fires go out, all but one, and brought every family to sleep around it in the barn or the chapel. People say it is the warmest the villages have been in years, and not only because of the fire.` },
    ],
    related: ['lore:the-haldish', 'lore:lanternmass', 'lore:brindlecross', 'lore:aldermoor', 'lore:book-hearthwardens-almanac'],
  },
  {
    id: 'lore:the-drowned-tongue', name: 'The Drowned Tongue', category: 'culture',
    source: 'A wordlist begun by a Grey Monk of the Ossuary of Saint Calder, with later additions in several hands',
    body: `The Drowned speak a tongue no living people taught them: long vowels, soft consonants, nothing that needs teeth. The Hollowed come to it as they change, without learning it, as a child comes to its mother’s voice. Converts of the Choir learn it from the hymns. This list is made from what the drowned have said in the hearing of the living, and it is very far from complete.

ooluun: below. Also the Choir’s name for the Mire.
ae: is, or of.
maa’reh: there.
suun: sleep.
luu: water. Also “we”, “us”. The tongue has no word for “I”.

“Ooluun ae Nhal, maa’reh suun.” Below is Nhal; there, sleep. A greeting, a blessing and a creed.

“Luu ae oo’raa.” The water is a door. Said at the edge of black water, and at baptisms.`,
    sections: [
      { id: 'hymns', title: 'Words from the Reed Temples', hint: 'The Choir sings more than it says.', body: `Added in a second hand, after the reed temples of Greywater:

hiima: winter; cold. neh: no, not. waa’el: “little warm one”, the Choir’s word for the living, and for children.

“Ooluun neh hiima.” Below there is no winter. The first line of the great hymn.

“Suun, waa’el, suun.” Sleep, little warm one, sleep. Sung over the dying, to children, and, by acolytes, to enemies as they close in.

“Haa’ruun!” Close over! The last word of the drowning-rite, and the Choir’s only war-cry.` },
      { id: 'drowned', title: 'Words of the Drowned', hint: 'The Hollowed have their own courtesies.', body: `Added in a third hand:

mae’luun: one who has gone below; the drowned. It is a word of honour, not of grief.

“Mae’luun ae neh hiima.” The drowned are not cold. Said by Hollowed to one another, as one would say good morrow.

aamuun: the Dreaming. The word is spoken with great tenderness. It is not clear that it means a place.` },
      { id: 'reed-mother', title: 'Last Words', hint: 'A high priestess said something the hymns do not.', body: `Added last, in a careful, unsteady hand:

The Reed-Mother, dying, said this, not to us but to the water: “Nhal neh suun. Nhal aa’mhuun.” Nhal does not sleep. Nhal… The last word does not appear in any hymn. It is built like aamuun, the Dreaming, but harder. As near as I can render it, it means “to dream of”. It may also mean “to swallow”. I do not know which she meant. I do not think the hymns would want me to ask.` },
    ],
    related: ['lore:the-drowned-choir', 'lore:the-mire', 'lore:the-hollowed', 'lore:the-black-seep', 'lore:sister-ilse', 'lore:reed-mother', 'lore:book-drowned-hymnal'],
  },
];

export default entries;
