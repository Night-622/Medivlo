/** Codex: factions, peoples and characters (Act II set). Owner: Claude 4. */
import type { LoreEntry } from '@/core';

const entries: LoreEntry[] = [
  // ----- factions
  {
    id: 'lore:the-hierophancy', name: 'The Hierophancy', category: 'factions',
    source: 'The Ordinal of the Hierophant’s Court, as copied for new clerks of the Curia',
    body: `The Hierophant is the servant of the Brand and the voice of Ithren in the world. He is chosen for life by the Seven Hierarchs of the Lights, from among themselves, in a conclave held by the Great Lantern, and the choice is made known by the lighting of a lamp from the Brand in the cathedral’s highest window.

He is attended by the Curia, which writes his letters; by the Lightsworn, who guard his person; and by the Lord-Inquisitor of the Order of the Wick, who is the Hierophant’s right hand in all matters touching magic, heresy and the keeping of the leys.

The Hierophant sits in judgement in the Court of the Lantern on Ithrensday. Petitioners kneel at the third step. No petitioner may speak until the Hierophant has spoken. No petitioner may look upon the Brand while addressing him, lest they be dazzled.

[A clerk’s note:] The last instruction has been struck through since 1186.`,
    sections: [
      { id: 'split', title: 'Mercy and the Wick', hint: 'The court is divided.', body: `The Court of the Lantern has split down the middle this winter, though no one will say so in its hearing. On one side stand the Hierophant’s Mercy: the older hierarchs, the hospitallers, the parish priests who write from the starving north, who say the Church must open its granaries and its doors and pray. On the other stands the Wick, which says that prayer did not save the Brand and that order might save what is left. The Hierophant has not chosen. Each side believes that he will, if pushed in the right place, by the right hand.` },
    ],
    related: ['lore:the-lanternate', 'lore:hierophant-aurelian', 'lore:castor-vellane', 'lore:order-of-the-wick', 'lore:solenne', 'lore:cathedral-of-the-brand', 'lore:ithren-the-lantern'],
  },
  {
    id: 'lore:wolf-moot', name: 'The Wolf-Moot', category: 'factions',
    source: 'Ketil Wolfsbane, at the North Pass camp',
    body: `“You want to know what the Moot is, southerner? The Moot is all of us. Every clan of the Frostreach, every jarl, every free man and woman who can hold a spear, standing in the ring at the Stones with the wind in our faces. Twelve clans. One voice. When the Moot speaks, the north moves.

“Your people have kings. Kings tell you what to do. A jarl can’t tell me anything. She can ask. The Moot can tell me, and I’ll do it, because it’s me telling me, along with everyone else.

“And this year the Moot has a lot to say. Our children are eating seal-leather. Our ships are frozen in. The old ones walk out onto the ice at night so there’s one less mouth, and the jarls call it brave. South of the mountains there’s grain, and fat Haldish lords who sing songs about how they beat us once. And now Calun has opened his eye on the speaking-stone. You tell me what that means. I know what it means.”`,
    sections: [
      { id: 'young', title: 'The Young Moot', hint: 'Not all of the north waits for the jarls.', body: `At the North Pass camp, a hundred young warriors from half the clans have pitched their tents in the snow and call themselves the Young Moot. It has no standing in the Moot-Law. It has a great deal of standing among anyone under thirty. They have already chosen the road south. They are only waiting for the Stones to agree with them, and Ketil Wolfsbane says, with a grin, that the Stones can be helped.` },
    ],
    related: ['lore:the-hrothi', 'lore:the-wolf-moot-stones', 'lore:sigrun-ice-eye', 'lore:skelvik', 'lore:calun-the-wanderer', 'lore:the-frostreach'],
  },
  {
    id: 'lore:qasiri-caravans', name: 'The Qasiri Caravans', category: 'factions',
    source: 'Samir ibn Ruqaya, envoy of the Cindermother',
    body: `“You ask who rules the caravans. No one. You ask who leads them. My mother. You think that is the same thing; in the north it may be. Here it is not.

“There are forty clans in the Sunscar, give or take a quarrel. Each has its own wells, its own roads, its own grandmothers. They meet at Zahrun when the stars say so, and they listen to the Cindermother because she is the one who sees, and because she has never once been wrong about the weather.

“We trade: glass, copper, salt, dates, the finest sabres in Morvane. We carry letters for anyone who pays. We carry messages for no one. And we watch. That is the thing the north forgets. Since the city burned, we have watched every mage-realm that rose and every king who dug a well too deep. We know how the Ashen Kings reached the fire. We keep that knowledge so that we may say to anyone who asks for it: no.

“Most people do not ask. This year, everyone does.”`,
    sections: [
      { id: 'keepers', title: 'The Keepers of the Ash', hint: 'Some Qasiri keep more than salt.', body: `In every clan there are a few, chosen as children, who learn the old tablets by heart: the Keepers of the Ash. Each Keeper knows a part, and no Keeper knows the whole, so that no one can be bought or made to give it all away. Only the Cindermother knows how the parts fit. Among the parts, Samir admitted, is a road: not the Ash Road, but the one the Kings took after it, down. “We keep it closed,” he said. “We have kept it closed for sixteen hundred years. Do not ask me to be the one who opens it.”` },
    ],
    related: ['lore:the-qasiri', 'lore:ruqaya-al-nar', 'lore:zahrun', 'lore:qasiri-salt-law', 'lore:the-ashen-kings', 'lore:sunscar', 'lore:ashvar-the-ember-tongue'],
  },
  {
    id: 'lore:the-red-abbess', name: 'The Red Abbess', category: 'factions',
    source: 'Notice of the Order of the Wick, posted in every diocese of the Empire',
    body: `SOUGHT, by order of the Lord-Inquisitor, for heresy, arson, the teaching of unlicensed fire and the corruption of novices:

The woman who styles herself the RED ABBESS, head of the heresy called the Ashen Creed.

Formerly Sister Vesper of the Abbey of Saint Sabine at Aurenac, which she burned. Of Qasiri birth. Of middle height, dark, with ash-scarring at the temples. She speaks the High Solenni of the Church, and will quote the Canticle against you. She draws Ash without a wick and without limit.

Those who shelter her shall answer to the Wick. Those who deliver her alive shall have a reward of five hundred gold and a plenary indulgence. Those who deliver her dead shall have the gold.

[Beneath the notice, on a dozen walls in the Haldmarch, the same words in red chalk:] SHE IS NOT AN ABBESS OF YOURS.`,
    sections: [
      { id: 'cells', title: 'How the Creed Is Led', hint: 'The Red Abbess is more than one woman.', body: `The Ashen Creed has no ranks on paper and no rolls to seize. Its cells know only the cell above them. Messages go up the chain as a word passed hand to hand, and come down again as a red thread tied to a door. At the top of the chain, the Creed says, sits the Red Abbess, and it is true. But in a dozen towns there are women who have answered to the name when the Wick came knocking, so that the Wick would take them instead. The Creed remembers every one of them. The Abbess says their names aloud at every gathering, and the list is long.` },
    ],
    related: ['lore:ashen-creed', 'lore:vesper-qadri', 'lore:order-of-the-wick', 'lore:ashvar-the-ember-tongue', 'lore:ruins-of-qadir', 'lore:cinder-wastes'],
  },
  // ----- peoples
  {
    id: 'lore:the-hrothi', name: 'The Hrothi', category: 'peoples',
    source: 'From the Saga of the Northmen, as the skalds open it',
    body: `“Hear now of the Hrothi, the people of the white north, who were the last to be warm and will be the last to be cold.

“Tall we are, and pale as the snow-light, with our hair in braids and our oaths in our skin, wolf and storm-cloud inked there by our mothers. We live in long halls by the fjords and we sail where we will, and what we want we ask for once, and the second time we do not ask. We keep no king. We keep the Moot. We honour Calun, who gave us the sail, and Vor, who gave us the endurance to use it, and we honour an oath above the law of any land, because a law is made by others and an oath is made by you.

“The southerners call us raiders. That is true. We call the southerners farmers. That is also true. Both peoples like to forget that every raider’s grandmother was a farmer once, and that every farmer’s field was once taken from someone.

“Now the winter has come that the skalds have always sung would come, and it has not gone away.”`,
    sections: [
      { id: 'skald', title: 'The Skald’s Craft', hint: 'Among the Hrothi, the poet is a kind of judge.', body: `A Hrothi skald is not only a singer. A skald remembers every oath, every feud and every gift-of-rings back seven generations, and speaks them aloud at the Moot when they are needed. A jarl who breaks an oath may lose a battle and survive it. A jarl whom the skalds stop singing about is finished. That is why the young warriors of the Frostreach do not fear Sigrun Ice-Eye. They fear that the sagas will call her careful.` },
    ],
    related: ['lore:wolf-moot', 'lore:skelvik', 'lore:calun-the-wanderer', 'lore:hrothi-kennings', 'lore:vor-the-hammer', 'lore:the-frostreach', 'lore:sigrun-ice-eye'],
  },
  {
    id: 'lore:the-qasiri', name: 'The Qasiri', category: 'peoples',
    source: 'Proverbs of the caravans, as a Qasiri mother teaches them',
    body: `Salt shared is a vow.

The desert does not hate you. That is why it is so dangerous.

Count your water before your gold.

A guest is a gift from Ashvar. A guest who stays four days is a lesson from him.

We are the children of a burned city. We do not build cities.

When the fire coughs, step back. When it stops coughing, run.

The Qasiri are the people of the Sunscar and the Cinder Wastes: brown and dark-skinned, often with the ritual ash-scars at temple and wrist, dressed in sand-coloured robes and glass and copper. They are the descendants of Qadir, and they carry its shame openly, as one carries an inherited debt. They are cautious of magic in the way that a burned child is cautious of a hearth, and therefore very skilled at it. They keep a gentle faith in Ashvar. They are led, as far as anyone leads them, by their oracle-matriarchs, and above all by the Cindermother at Zahrun.`,
    sections: [
      { id: 'scars', title: 'The Ash-Scars', hint: 'The marks at temple and wrist mean something.', body: `A Qasiri child receives the first ash-scar at seven, at the temple, from the hand of a grandmother: a small burn, pressed with a cinder and rubbed with ash so it heals dark. It means: I remember what fire did. The second scar, at the wrist, a Qasiri gives themself, when they first draw ember. It means: I know what fire can do. There is no third scar. It is said that Ozrah had one, and it covered him entirely.` },
    ],
    related: ['lore:qasiri-caravans', 'lore:qasiri-salt-law', 'lore:burning-of-qadir', 'lore:zahrun', 'lore:ashvar-the-ember-tongue', 'lore:sunscar', 'lore:cinder-wastes', 'lore:ruqaya-al-nar'],
  },
  // ----- characters
  {
    id: 'lore:castor-vellane', name: 'Castor Vellane, Lord-Inquisitor', category: 'characters',
    body: `Castor Vellane, Lord-Inquisitor of the Order of the Wick, is not yet fifty, and he has held the Order for eleven years. He is tall, spare and very still, with a scholar’s stoop and a soldier’s hands, and he dresses in plain white without a single thread of gold. He reads everything. He forgets nothing. He has never been heard to raise his voice.

He is the son of a vintner of the Lantern Coast. When he was nine, a hedge-mage of his village overdrew in a drought, trying to call rain, and the fire that came out of him burned the village’s whole harvest and half of its houses. Vellane does not tell this story. Other people tell it for him, usually to explain him. He would say it explains nothing. “I do not hate magic, child,” he says. “I hate fire left unattended.”

Since the Quench, the Hierophant has signed everything Vellane has put in front of him. Vellane does not seem to enjoy this. He seems to think it is merely correct.`,
    sections: [
      { id: 'lanterns', title: 'The Last Wicks', hint: 'The Lord-Inquisitor is gathering something.', body: `Every lantern in Morvane that was lit from the Brand before it died, and still burns, is being brought to Valcastre: from Haldren, from the northern sees, from chapels no one has prayed in for a century. There are perhaps a dozen. They stand in a locked room high in the fortress, all burning, all leaning toward the same point in the wall, as plants lean toward a window. Vellane goes up to look at them every evening. Lately the master of the cathedral’s bell-foundry has been seen going up with him, carrying drawings.` },
    ],
    related: ['lore:order-of-the-wick', 'lore:valcastre', 'lore:the-hierophancy', 'lore:hierophant-aurelian', 'lore:the-brand', 'lore:garrick-hale', 'lore:ending-iron-lantern'],
  },
  {
    id: 'lore:hierophant-aurelian', name: 'Aurelian IV, Hierophant', category: 'characters',
    body: `Aurelian, fourth of that name, Hierophant of the Lanternate and Servant of the Brand, has sat in the Court of the Lantern for thirty years. He was a gentle, scholarly hierarch who was chosen because the conclave could agree on no one else, and he has been a gentle, scholarly Hierophant: generous to the poor, patient with the Haldish, fond of music. He has never been called great. He has never wished to be.

It was Aurelian who raised Ysolde Maerin to sainthood in her own lifetime, in 1170, against the advice of the Curia, because he had seen her heal and could not think what else to call it. It was Aurelian who named her Keeper of the Brand. He was in the cathedral on the Night of Falling Ash. He saw her at the altar.

He is old now, and frightened, and he has let the Lord-Inquisitor speak for him in most things. He prays a great deal. He does not seem to find it helps.`,
    sections: [
      { id: 'undercroft', title: 'What He Has Read', hint: 'The Hierophant keeps the key to a sealed door.', body: `When the court had gone, the Hierophant kept you back. He spoke quickly, as a man speaks who has decided to before he can decide not to. “There are chests beneath this cathedral that have been sealed for a century and a half,” he said. “I broke the seal last winter, by night, and had it made again before morning. I read what is in them. I wish I had not. I wish my predecessors had read them, and I wish I had been born in some other century.” Then he called his chaplain, and spoke of the weather.` },
    ],
    related: ['lore:the-hierophancy', 'lore:the-lanternate', 'lore:castor-vellane', 'lore:ysolde-the-pale-saint', 'lore:purge-of-the-emberwardens', 'lore:solenne', 'lore:cathedral-of-the-brand'],
  },
  {
    id: 'lore:sigrun-ice-eye', name: 'Sigrun Ice-Eye, Jarl of Skelvik', category: 'characters',
    source: 'From the Saga of Skelvik, the later verses',
    body: `“Hear now of Sigrun, Hrolf’s daughter, called Ice-Eye, for her left eye is pale as the fjord in winter and sees, they say, as far.

“Her father was Hrolf Frostbeard, who went south to the Northern Pass with three hundred and came home with forty, and without his spear. Sigrun was a girl in Skelvik then. She did not weep. She asked how many the southerners lost.

“She took the high seat at twenty-six, when her brothers had fallen, and she has held it nineteen winters, and in that time no clan has broken from Skelvik and no feud has outlived its winter. She is not loved. She is believed. That is rarer.

“Her husband Ulfar went through the ice of Skelvikfjord in the first winter after the star fell, with eleven men, hunting seal. The fjord gave none of them back.”

The young warriors of the north want her to lead them south. She has not said no. She has said: not yet.`,
    sections: [
      { id: 'counting', title: 'The Jarl’s Arithmetic', hint: 'She asks one question of every plan.', body: `Sigrun has one question for every warrior who comes to her high seat with a plan for the south, and she asks it of you as well. “How many come home?” She waits for the answer. She does not accept a guess. “My father was the bravest man in the north,” she says, “and he could not count. I can count. It has not made me popular. It has kept my people alive. One of those matters more to the sagas, and one matters more to me.”` },
    ],
    related: ['lore:skelvik', 'lore:wolf-moot', 'lore:the-hrothi', 'lore:osric-harrow', 'lore:book-ballad-of-the-northern-pass', 'lore:the-frostreach', 'lore:the-wolf-moot-stones'],
  },
  {
    id: 'lore:marisol-kestrel', name: 'Admiral Marisol Kestrel', category: 'characters',
    source: 'As told on the quays of Brackhaven',
    body: `They say Marisol Kestrel was born in a net-loft on the Brackhaven quay, the seventh child of a net-mender, and that she was mending nets at four and cheating at dice at six. They say she went to sea at twelve as a ship’s boy, and that no one aboard noticed she wasn’t a boy for two years, or at least no one who said so and kept his teeth.

They say she took her first ship from a Solenni tax-galley with nine men and a borrowed rowing-boat, and her second from the man who had sold her the first. They say she has been Admiral of the League for nine years and was elected five times, once by a single vote, which she cast herself.

They say she is the only person alive who has made both the Hierophant and the Lord-Inquisitor laugh in the same week. They do not say what the jokes were. She does. Often. To anyone. They do not improve in the telling, but she does.

All of this is true, according to the Admiral.`,
    sections: [
      { id: 'reason', title: 'Why Sell It?', hint: 'The Admiral has her reasons for the auction.', body: `You asked her why she would sell the thing at all, when it might be the only fire left in the world. She stopped smiling, briefly. “Because I can count ships,” she said. “And every navy in Morvane is coming for that star, sooner or later, Church and Choir and all. If I keep it, they come here. If I sell it, they go wherever it goes. I love this coast. I do not love it enough to burn it.” Then she smiled again. “Besides. Have you seen the bids?”` },
    ],
    related: ['lore:salt-league', 'lore:brackhaven', 'lore:brackhaven-auction', 'lore:saltreach-isles', 'lore:saltreach-coast'],
  },
  {
    id: 'lore:vesper-qadri', name: 'Vesper Qadri', category: 'characters',
    body: `Vesper Qadri was born in a Qasiri caravan and given to the Church at five, at the Abbey of Saint Sabine at Aurenac, as the price of a debt her clan could not otherwise pay. She grew up Solenni, devout and very clever. She could recite the Canticle of the Anvil backwards. She took her vows at seventeen. At twenty-three she burned the abbey to the ground.

She is in her forties now: dark, quick, ash-scarred at the temples in the Qasiri way, which she had done to herself as a grown woman, after. She talks fast and laughs often and argues with everyone, including herself. She believes, absolutely, that the gods’ fire belongs to everyone who can draw it, and that the Church that licensed it has been lying for twelve hundred years. She is not wrong about everything. That is what makes her dangerous to be around, and good to have on your side.

She does not like to be called the Red Abbess to her face. She says the title is for the Wick.`,
    sections: [
      { id: 'abbey', title: 'The Fire at Aurenac', hint: 'Why she burned the abbey.', body: `“There was a novice. Fourteen. She lit a candle with her finger one night, in the dormitory, to see to read by. Someone told. The Wick came at dawn. I had a quarter of an hour.” Vesper shrugs. “I set the fire in the chapel, so they’d all run there. I got her over the wall while they were throwing buckets. Nobody died. I made sure of it. She’s a Pyre of the Creed now, in Haldren. She still reads by her finger. She still doesn’t know I meant to stay behind.”` },
      { id: 'ember', title: 'The Weight of It', hint: 'Vesper has never held an Ember.', body: `At the Glass Throne, with the Ember of the Glass burning in front of her, Vesper did not reach for it. That surprised you, and it surprised her more. “All my life,” she said, “I’ve said the fire should be everyone’s. And there it is. And I am thinking, for the first time: what if everyone is me?” She sat down on a step of the throne. She did not get up for a long time.` },
    ],
    related: ['lore:the-red-abbess', 'lore:ashen-creed', 'lore:the-qasiri', 'lore:ruins-of-qadir', 'lore:wick-licence', 'lore:ashvar-the-ember-tongue'],
  },
  {
    id: 'lore:ruqaya-al-nar', name: 'Ruqaya al-Nar, the Cindermother', category: 'characters',
    source: 'Sayings of the Cindermother, as her clans repeat them',
    body: `“The fire told me you were coming. It did not tell me you would be so thin. Eat.”

“I am not wise. I am old. When you have watched the same mistake made enough times, people start to call you wise.”

“Everyone who comes to my tent wants me to tell them the future. I tell them their past, and they are always more frightened.”

Ruqaya al-Nar is the Cindermother of the Qasiri: oracle, matriarch and judge of the forty clans, at Zahrun by the warm spring. She is very old, very small and nearly blind, and she sees by the light of cinderglass, which shows her, she says, not what will be but what is burning. Her clans would die for her. Most kings would rather not meet her. She has outlived three Cindermothers who were meant to succeed her, and has begun to joke that the fire has forgotten to take her.

Her son Samir speaks for her abroad. She has told him she will not leave the oasis again. She has told him that before.`,
    sections: [
      { id: 'seeing', title: 'What the Cinderglass Shows', hint: 'She looked into the glass for you.', body: `The Cindermother held a shard of cinderglass to the Ashmark and looked through it for a long time. “I see the fire under the world,” she said at last. “It is very low. I see a woman made of water carrying a lamp down a stair. I see someone else on the stair behind her, and the stair goes down a long way, and only one of you is climbing back up. I cannot see which.” She put the glass away. “That is the trouble with seeing. It is never the part you want.”` },
    ],
    related: ['lore:qasiri-caravans', 'lore:the-qasiri', 'lore:zahrun', 'lore:heartstone', 'lore:qasiri-salt-law', 'lore:sunscar', 'lore:the-kings-stair'],
  },
];

export default entries;
