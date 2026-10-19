/** Codex completeness pass: character entries for major NPCs and companions without one. Owner: Claude 4.
 *  Entries with no unlockOn are meant to unlock by talking to the NPC (set `lore` on the NpcDef). */
import type { LoreEntry } from '@/core';

const entries: LoreEntry[] = [
  // ----- prologue
  {
    id: 'lore:abbess-morwen', name: 'Abbess Morwen', category: 'characters', hidden: false,
    unlockOn: [{ kill: 'enemy:abbess-morwen' }],
    body: `Mother Morwen was the last abbess of Saint Wenna’s on Wennamere, and by every account a hard, plain, devoted woman: the sort of abbess who rang the night hours herself so that her sisters might sleep, and who kept the travellers’ lamp burning in the tower through every winter of her office, because Wenna had kept it burning before her.

On the Night of Falling Ash a star fell into the mere, and the black water rose with it. Morwen did not flee. She prayed for her sisters as the water climbed the walls, and something in the Mire answered her, and she went down with her abbey still ringing the bells.

She was Hollowed long before you found her. She kept the hours anyway. She guarded the fallen Ember in her reliquary, not for the Choir, which she never served, but because a thing had fallen into her keeping, and an abbess does not abandon what is in her keeping. At the end she asked whether it was Lanternmass, and whether she had kept the lamp lit.`,
    related: ['lore:saint-wenna', 'lore:aldermoor', 'lore:the-hollowed', 'lore:night-of-falling-ash', 'lore:lanternmass', 'lore:the-seven-embers'],
  },
  {
    id: 'lore:maren-hollis', name: 'Maren Hollis', category: 'characters', hidden: false,
    body: `A huntress of Brindlecross, nineteen years old, with short-cropped red hair, a scar through one eyebrow and a longbow she can put an arrow through a crow with at eighty paces. She is quick to anger and quicker to laugh, and she has never in her life been able to keep a thought off her face.

The Grey Lung took her mother when Maren was still a child herself, and she raised her brother Tobin alone in Hollis cottage, on what the moor and her bow would give. She did it without complaint and without help, and she will tell you that is because she never asked for any.

She has been your friend since you were both small enough to be chased out of the chapel. She teases you without mercy. She would also walk into the Gloamwood after dark for you, and has. Since Tobin vanished, the teasing has stopped.

“If you say ‘he’ll turn up’ one more time I’ll put an arrow somewhere you’ll remember.”`,
    related: ['lore:brindlecross', 'lore:aldermoor', 'lore:the-grey-lung', 'lore:the-haldish', 'lore:haldish-hearth-customs', 'lore:the-hollowed'],
  },
  {
    id: 'lore:anselm-pryde', name: 'Brother Anselm Pryde', category: 'characters', hidden: false,
    body: `The priest of Brindlecross chapel: a round, kind, ink-stained man in his fifties, who knows the name of every sheep in the valley and the feast-day of every saint in the calendar. He was sent to Brindlecross, his letters of appointment say, on account of “excessive curiosity”. The valley has never found that a fault.

He is a gentle scholar and a good pastor, and he keeps the Lantern’s rites faithfully. He also keeps, behind a loose stone at the back of the altar, a battered red-bound copy of A Warden’s Primer, bought from a pedlar thirty years ago when he was young and curious. Possession of it is a hanging matter.

A year ago he saw the scar on your hand and knew it from a drawing in one of them. He has said nothing to anyone since. He has a steady hand with a pen, and a Prior’s signature is not, he says, so very different from any other.

“Faith is a lantern, child. You don’t stare into it. You hold it up so you can see the road.”`,
    related: ['lore:brindlecross', 'lore:the-lanternate', 'lore:the-emberwardens', 'lore:book-wardens-primer-excerpts', 'lore:wick-licence', 'lore:the-ashmark', 'lore:saint-wenna'],
  },
  {
    id: 'lore:nan-briar', name: 'Nan Briar', category: 'characters', hidden: false,
    body: `A hedge-witch of the Thornwise, who lives in a hut in the Gloamwood that is more briar than wall. She is bent and sharp-eyed, and no one in Brindlecross can say how old she is, because she was old when their grandmothers were girls. Rumour says she is half-Aelthi. She neither confirms it nor troubles to deny it.

She sells salves and simples to anyone who will walk out to her, and she sings to her pots while they boil. She knows which mushrooms to eat and which to leave for the dead, and she is the only soul in Aldermoor who will speak kindly of the White Stag and of the thing beneath the mere in the same breath.

She calls the Mire “the Old Sleeper”, and she pities it. That is not a thing the chapel likes to hear said aloud. Nan Briar has never much cared what the chapel likes.

“Everything that’s hungry was something else first.”`,
    related: ['lore:the-thornwise', 'lore:the-white-stag', 'lore:the-weeping-stones', 'lore:aldermoor', 'lore:the-mire', 'lore:the-aelthi', 'lore:kethra-the-thorn'],
  },
  {
    id: 'lore:garrick-hale', name: 'Garrick Hale, Inquisitor', category: 'characters', hidden: false,
    body: `An inquisitor of the Order of the Wick: a Haldishman in his forties, weathered and tired, who was a soldier before he took the scissors and still sits a horse like one. He is devout, plain-spoken and not cruel. He is certain, and certainty is harder to bargain with than cruelty.

He carries the Last Wick: a small iron lantern whose flame was lit from the Brand itself before the Quench, one of perhaps a dozen such flames left in the world. He uses it to test the marked. It has never leaned toward anyone before. It leans toward you.

Hale has examined more hedge-mages than he cares to count, and he takes no pleasure in it. He believes, honestly, that unlicensed fire killed Qadir and will kill the Haldmarch if it is let, and that the Order is the only thing standing between the villages and the dark. He has not yet decided whether you are the proof of that or the exception to it.

“Hold out your hand. If the Lantern loves you, you’ve nothing to fear.”`,
    related: ['lore:order-of-the-wick', 'lore:wick-licence', 'lore:the-lanternate', 'lore:the-brand', 'lore:valcastre', 'lore:castor-vellane', 'lore:the-wick-edict'],
  },
  // ----- Act I
  {
    id: 'lore:sable', name: 'Sable', category: 'characters', hidden: false,
    body: `A thief of the Quiet Hand, about twenty years old, who can usually be found sitting cross-legged on a broken altar in the Hand’s den beneath the Tanners’ Steps, in a cellar that was a chapel before Haldren was built over it. She is the best climber in the city, has never been caught, owns nothing she did not steal and gives most of that away.

She is cheerful about everything: the Watch, the Wick, the famine, the cold. She calls everyone “love”, makes bets she cannot lose, and noticed the glove you kept on at the gate, under the Wick’s nose, before you had been in the city an hour. She will not sell you to the Wick. Selling folk to the Wick, she says, is the one thing the Hand does not do.

She laughs a great deal. She also wipes her eyes rather often, quickly, with the back of her wrist, and turns her face to the wall when she does it. Her hands are always cold, even by the fire. She says it is the winter. It has been the winter since Lanternmass.`,
    related: ['lore:the-quiet-hand', 'lore:haldren', 'lore:the-kingsvale', 'lore:the-hollowed', 'lore:the-ashmark'],
  },
  {
    id: 'lore:rhiannon-ys-caer', name: 'Rhiannon Ys-Caer, Archdruid', category: 'characters', hidden: false,
    body: `Archdruid of the Thornwise Circle, who sits in the Grove of Antlers in the Ylwen Deepwood. She is taller than any man and older than anything else you have met that still moves, and the wardwood crown on her brow puts out leaves in midwinter. Hedges do not part for her. Where she walks, the thorns are simply not there.

Her people add Ys-Caer to her name, “of the drowned court”, because she was a child in Ys Aerwen on the night it softened and sank beneath its own lake. She is the last who remembers the colour of its roofs. It was not, she says, a colour you have.

She is gentle, grieving and not to be argued with. She holds, as the Circle holds, that the Mire is to be mourned and not hated, and that there is a way between the chain and the drowning. She has had a very long time to think about what that way would cost, and she does not speak of it lightly.`,
    related: ['lore:the-thornwise', 'lore:ylwen-deepwood', 'lore:sundering-of-ys', 'lore:the-lullaby', 'lore:the-aelthi', 'lore:kethra-the-thorn', 'lore:cadoc-ap-ynys', 'lore:book-lament-for-ys', 'lore:the-third-way'],
  },
  {
    id: 'lore:reed-mother', name: 'The Reed-Mother', category: 'characters', hidden: false,
    source: 'Told by Agna Fenn, headwoman of Fenwick, with a note added after',
    unlockOn: [{ kill: 'enemy:reed-mother' }],
    body: `“The Reed-Mother. That’s what they call her, the ones who go out to the temples. High priestess, they say. She sits in the big dome on the Seep, where the water won’t freeze, and she sings, and the reeds lean to her like she’s the sun.

“She came out of the fen the winter Varn drowned. Nobody saw her come. She had fen-woman’s hands, I’ll say that: net-cuts on the knuckles. But nobody in Fenwick will own to knowing her name, and I’ve stopped asking.

“She’s kind. That’s the worst of it. She came to my door with bread when the eels failed. She told me nobody would be cold where she was going. She meant it.”

[A later note:] The Reed-Mother kept Lord Harrow’s letters in her temple, and answered them. When the Ashmark brought her down she knelt in the shallows and spoke to the water, not to you. “Oh. It’s cold,” she said. “They told me it wouldn’t be cold.” Her last words were a warning: the Pale Saint herself was coming to Varn.`,
    related: ['lore:reed-temples', 'lore:the-drowned-choir', 'lore:the-black-seep', 'lore:greywater-marsh', 'lore:fenwick', 'lore:osric-harrow', 'lore:ysolde-the-pale-saint', 'lore:the-drowned-tongue'],
  },
  // ----- Act II
  {
    id: 'lore:brannoch-deepforge', name: 'Brannoch Deepforge, High Thane', category: 'characters', hidden: false,
    body: `High Thane of the Iron Concord, seated at the oath-ledger in the Thane-Hall of Korrath-under-Stone, and the oldest living Orrun of Clan Deepforge. His beard is braided with the iron rings of more oaths than most holds have sworn, and his skin has gone the grey of weathered stone, as Orrun skin does in great age.

He is slow, formal and proud. He weighs every word as if it were iron for the ledger, because in his hall it is: the ledger-keeper writes down everything the High Thane says, as he says it. He has never yet been made to unsay anything.

When Grimma Ironsong came up from the Vault and told him that two of the Nine Nails had failed, he ordered her to keep silent. He did it to stop the holds from panicking, and to keep the passes open, and because the ledger said for ever and he could not bear for the ledger to be wrong. He has kept the secret since. He has never been sure he was right.`,
    related: ['lore:iron-concord', 'lore:korrath-under-stone', 'lore:the-nine-nails', 'lore:vault-of-the-nine-nails', 'lore:grimma-ironsong', 'lore:the-orrun', 'lore:vor-the-hammer', 'lore:the-iron-concord-treaty'],
  },
  {
    id: 'lore:sister-ilse', name: 'Sister Ilse', category: 'characters', hidden: false,
    body: `A sister of the Cathedral of the Brand, in her thirties: serene, soft-spoken, and so quiet in her movements that the vergers say they never hear her on the stair. She was Saint Ysolde’s attendant in the years when the saint was Keeper of the Brand, and when Ysolde went on pilgrimage in 1181 Ilse stayed behind to keep her rooms. She has swept them every day since.

She is Keeper of the Font now, and tends the Font of Saint Solenne beside the dead altar, where the Bright Saint washed the ash from her hands. Pilgrims find her a comfort. She listens to them a long while, and never once interrupts, and when she touches their hands in blessing her fingers are cool and a little damp, as though she had only just taken them out of the water.`,
    sections: [
      { id: 'unmasked', title: 'Sister Ilse of the Black Water', hint: 'Someone opened the cathedral doors on Lanternmass night.', body: `In her reliquary there were no bones, only a phial of black water that did not freeze. It was Ilse who unbarred the cathedral doors on the Night of Falling Ash and let the Pale Saint in to the Brand. When she was named before the Lord-Inquisitor she did not deny it. She smiled, and said something soft in the Drowned Tongue, and walked down the steps into the Font of Saint Solenne, and the water closed over her head without a ripple. The font is barely waist-deep. They drained it. She was not there.` },
    ],
    related: ['lore:cathedral-of-the-brand', 'lore:ysolde-the-pale-saint', 'lore:the-drowned-choir', 'lore:night-of-falling-ash', 'lore:solenne', 'lore:saint-solenne', 'lore:the-drowned-tongue'],
  },
];

export default entries;
