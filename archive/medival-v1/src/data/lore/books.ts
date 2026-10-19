/** Readable in-world books, part 1 (Aldermoor, Haldren). Pages split on `---`. Owner: Claude 4. */
import type { LoreEntry } from '@/core';

const entries: LoreEntry[] = [
  // ----- The Guttered Candle, Brindlecross
  {
    id: 'lore:book-hearthwardens-almanac', name: 'A Hearthwarden’s Almanac', category: 'books',
    source: 'Wenna Fennick, hearthwarden of Brindlecross (c. 1140 YL), with notes in a later hand',
    unlockOn: [{ interact: 'obj:book-hearthwardens-almanac' }],
    body: `Set down by Wenna Fennick, hearthwarden of Brindlecross, for whoever keeps the fire after me.

I am no scholar, and this is no book of the Church. It is what my mother told me, and her mother told her, and what I have found true in sixty winters on the moor. Read it by the hearth. Read it to the children. And whatever else you forget, do not forget the first thing: keep the fire, and the fire keeps you.

---

Of the Fire.

Bank it at night with turf, wet side down. Never let it go out between the first frost and the first lamb. If it does, do not strike it fresh with flint like a stranger. Go to your neighbour, borrow a coal, carry it home in a pot, and thank her. A borrowed fire remembers the house it came from.

Ash from a fire that has never gone out is good ash. Keep it in a crock by the door. Smear the doorposts with it at Lanternmass and at every death. What is cold may not come in.

---

Of the Hearth Draught, for wounds, chills and weariness of the bones.

Take a pinch of hearth-ash, from a fire that has not gone out. Take a spoon of heather honey. Take water drawn warm from the spring below the tors, that never freezes, for the earth’s own heat comes up there. Stir it sunwise seven times, once for each of the Seven, and stopper it in a stone bottle.

A swallow mends what a night’s sleep would mend, only quicker.

If ever the spring runs cold, the draught will not take. My mother said that has never happened. Write it down if it does.

---

Of Small Ills.

For a fever, willow bark steeped, a cool cloth, and someone to sit by. For a cough, honey and onion, and keep the sick out of the smoke. For a cough with ash in it there is nothing in this book: send for a priest, or for someone who knows more than a priest, and ask no questions.

For chilblains, goose-grease. For grief, work, and company, and time. For bad dreams, a sprig of rowan under the pillow and a light left burning.

Never sleep with the shutters open on to water.

---

Of the Weather.

Rooks flying low, snow before dark. A ring round the moon, rain within three days. When the mere steams of a morning, a hard frost is coming. When the Weeping Stones run fast, a thaw.

If the White Stag is seen on the moor road, the winter will be long. If he is seen at the village edge, longer.

If the elder has not bloomed by the end of lambing, plant late and pray. And if ever the snow does not go when spring comes, build the fire higher, and do not let it out, and wait. Every winter ends. That is what winters are for.

---

[On the last leaf, in a heavier, later hand:]

Gran’s book. Kept the Candle’s fire by it thirty years. Not one night out.

Autumn, 1187. The spring below the tors ran cold. First time anyone remembers. Made the draught with water warmed on the hearth instead, and twice the ash. It takes, mostly. Slower.

The stag was seen on the moor road last winter, and at the village edge this one. I am not writing down what that means. Gran already did.

Keep the fire. W. F.`,
    related: ['lore:haldish-hearth-customs', 'lore:brindlecross', 'lore:the-heartfire-and-leys', 'lore:the-white-stag', 'lore:lanternmass', 'lore:aldermoor'],
  },
  // ----- Hollis cottage, Brindlecross
  {
    id: 'lore:book-tale-of-the-white-stag', name: 'The White Stag (a tale for children)', category: 'books',
    source: 'A tale of Aldermoor, written out for children; “Tobin” is inked on the flyleaf in a child’s hand',
    unlockOn: [{ interact: 'obj:book-tale-of-the-white-stag' }],
    body: `Once, when the moor was young and the Gloamwood was younger, there lived a stag as white as the first frost. His antlers were like a winter tree, and his eyes were like two lamps, and he kept the Weeping Stones in the heart of the wood.

Every night he walked round the stones seven times. Every morning the stones wept, and the stag drank their tears, and that is why the wood was green.

---

One winter a little girl called Merry went into the wood for kindling. The snow came down and she lost the path, and she cried and cried. The White Stag heard her, for he hears everything that cries in the Gloamwood.

“Why are you weeping, little warm one?” said the stag.

“I am lost,” said Merry, “and my mother is calling me, and I cannot find her voice.”

“Climb on my back,” said the stag, “and hold my antlers, and do not let go.”

---

So Merry held on, and the stag ran through the wood as quick as moonlight, and set her down at the edge of the village where the lanterns were.

“Thank you, White Stag,” said Merry. “What can I give you?”

The stag bowed his head. “Give me a ribbon for the stones,” he said, “and a crust for the stones, and remember me.”

And that is why, to this day, the children of Brindlecross leave bread and ribbons at the Weeping Stones, and do not go into the wood after dark.

---

But before he went, the stag said one thing more.

“Under the stones there is a water, and under the water there is a sleeper, and I drink the tears so that it will not wake. If ever I am thirsty, and the water tastes sweet, I shall drink from the mere instead. And then, little one, I shall come out of the wood to fetch you. And you must not climb on my back.”

“Why not?” said Merry.

But the White Stag had gone into the trees, and he did not answer.

The End.

---

[Beneath, in pencil, in a boy’s hand, pressed hard into the page:]

I dreamed about the stag again. He was at the window. His eyes were all wet and black. He said he knows where Mam is. He said she is under the water and it is not cold there, and she has been calling and calling and I never heard.

I asked him why I must not climb on his back.

He said I may.

T.`,
    related: ['lore:the-white-stag', 'lore:the-weeping-stones', 'lore:brindlecross', 'lore:the-mire', 'lore:nan-briar', 'lore:aldermoor'],
  },
  // ----- chapel niche, Brindlecross
  {
    id: 'lore:book-wardens-primer-excerpts', name: 'A Warden’s Primer, chapters II–IV', category: 'books',
    source: 'Emberwarden text, banned since 1041 YL; margin notes in the hand of Brother Anselm Pryde',
    unlockOn: [{ interact: 'obj:book-wardens-primer-excerpts' }],
    body: `Chapter the Second: Of Drawing.

The novice shall sit upon bare earth, not stone, not board, with the palms laid flat. Breathe slowly. Feel for warmth beneath the cold, as one feels for a pulse at the wrist. It will seem at first that there is nothing. There is always something.

The ley does not come to the hand. The hand goes down to the ley, as a root goes down to water.

[Margin, in a round, ink-stained hand:] Tried it on the vestry floor. For three breaths, the flags were warm. A.

---

The second exercise. Having found the warmth, do not seize it. Draw it up as breath is drawn, slowly, to the count of seven, and let it go again to the count of seven. Do this a hundred times before you shape anything at all.

The novice who grasps at ember will burn his hands. The novice who lets it pass through him like water through a mill-race will be a warden.

Ember is not yours. It is lent. The leys are the Heart’s, and the Heart is the world’s, and you are only standing on it.

---

Chapter the Third: Of the Purge.

Where the Mire rises, the warden burns it out. This is called the Purge, and it is the first duty of the order.

Know the signs of seep. Water gone black that does not freeze. Reeds growing white. Birds that will not fly over. A warmth in the ground that is not ley-warmth, being damp and close, like breath. Beasts that drink there weep black. Those who sleep near it dream the same dream: of a sea, and of someone calling them down.

---

The Rules of the Purge.

First: burn the seep, not the land. Draw only what the burning needs.

Second: a Hollowed beast may be cleansed if it is first brought low and the taint is young.

Third: a Hollowed man may be cleansed only with great care, for the Purge burns what it touches, and the taint and the man are woven together. Burn too hot and you will free him of both.

Fourth: never Purge in anger.

Fifth: never answer if the water speaks.

[Margin:] The fifth rule is underlined three times, in older ink than mine. A.

---

[A plate, much thumbed: a hand held palm-out over a black pool, a scar burned across the back of it from knuckle to wrist, and fine lines of light running from the scar into the fingers. The caption reads: “The hand that holds the Heart’s fire close.”]

[Margin, in Brother Anselm’s hand, the ink blotted as if written fast:] The morning after the stars fell. I saw this hand today, on the moor road. The same scar. The same lines. The child does not know what it is. Seven keep us, nor do I. I will not tell the Wick. A.

---

Chapter the Fourth: Of Overdraw.

Ember is heat, and heat must go somewhere. The body of a mage is a hearth: it holds so much fire and no more, and what it cannot hold, it burns. First the dry cough with smoke after it. Then ash in the spittle. Then the burn-lines on hands and arms, which do not heal. At the last, ash in the shape of a man.

There is no cure. There is rest, cold water, willow bark, and the discipline to draw less. Remember Qadir.

[Margin:] Brother Ithel coughed like this at seminary, unlicensed and drawing anyway. He was twenty-six. I wish someone had shown him this page. A.`,
    related: ['lore:the-emberwardens', 'lore:the-heartfire-and-leys', 'lore:the-ashmark', 'lore:cinderlung', 'lore:the-mire', 'lore:anselm-pryde'],
  },
  // ----- Oswin's mill, Brindlecross
  {
    id: 'lore:book-drowned-hymnal', name: 'Hymns for Those Who Sleep', category: 'books',
    source: 'A hymnal of the Drowned Choir, bought from a pedlar; inscribed in the hand of Oswin the Miller',
    unlockOn: [{ interact: 'obj:book-drowned-hymnal' }],
    body: `Hymns for Those Who Sleep: for the grieving, the cold and the weary, that they may know the water is a door.

The world is a wound. The Forging was the blade. Let the water close over it, and let all things dream again.

[On the flyleaf, in a careful village hand:] Edith walked into the mere smiling. I did not understand it then. I am learning.

---

The First Hymn: Below There Is No Winter.

Below there is no winter,
below there is no frost;
below, the ones we buried
are sleeping, and not lost.
Ooluun neh hiima.

The hearth goes out at evening,
the lantern gutters low,
but water keeps its warmth for us
down where the drowned ones go.
Ooluun neh hiima.

---

The Second Hymn: A Cradle-Song for the Living.

Hush now, little warm one,
the night is very long;
the cold has teeth, the fire has teeth,
but water has a song.
Suun, waa’el, suun.

Lay down the heavy hammer,
lay down the burning coal;
what the smith has struck apart
the sea will make whole.
Suun, waa’el, suun.

---

The Third Hymn: At the Water’s Edge (sung at baptisms).

Here is the edge, and here the door,
and here the ones who wait;
we will not need our names below,
we will not need our weight.
Luu ae oo’raa.

[In the margin, Oswin’s hand:] Do they keep their names? I asked the Sister. She said a name is only a kind of cold. I would like Edith to keep hers.

---

The Great Hymn.

Below is the one who pitied,
who leapt when the others flew;
who drowned for love of the dreaming,
and dreams, and waits for you.
Ooluun ae Nhal, maa’reh suun.

Close over, sea, close over
the wound the hammer made;
the hearth, the forge, the lantern,
the banner and the blade.
Haa’ruun.

---

[On the last page, the hand less careful than before:]

Pell says the Sister will come to the shore at midnight. She says Edith asks for me.

She says the star in the mere is a wound, and that if it is taken out the water will go cold, and Edith with it.

I have written to the Wick about the one whose hand burns. Let them take the burning away before it reaches her.

Forgive me, Brindlecross. Ooluun ae Nhal.`,
    related: ['lore:the-drowned-choir', 'lore:the-drowned-tongue', 'lore:the-mire', 'lore:the-hollowed', 'lore:reed-temples'],
  },
  // ----- Haldren cathedral
  {
    id: 'lore:book-lives-of-the-lightsworn', name: 'Lives of the Lightsworn, vol. IX', category: 'books',
    source: 'The Life of Saint Ysolde, set down by the sisters of her house (1172 YL), with a Continuation (Solenne, 1183 YL)',
    unlockOn: [{ interact: 'obj:book-lives-of-the-lightsworn' }],
    body: `Here begins the Life of the blessed Ysolde Maerin, Lightsworn of Solenne, healer of the Grey Lung, Keeper of the Brand, whom the Lantern raised to sainthood in her own lifetime, as it had done for no one since the Bright Saint herself.

It was set down first in the year 1172 by the sisters of her house, and is here continued to her end, so far as her end is known. Let the faithful read it upon her feast, and give thanks.

---

Ysolde was born to a vintner’s house in the hills above Solenne, the youngest of seven. It is told that as a child she would lie with her ear to the vineyard earth, and when asked what she listened for, she said: “The fire, singing.” Her mother thought it idleness. Her confessor thought it a sign.

In her twelfth year a herb-woman of the north, passing through, lodged with the family a season, and came again each summer after. She taught the child her letters, and certain prayers that are not in the Breviary. The saint would never give the woman’s name.

---

When the Grey Lung walked the Empire and the Haldmarch, Sister Ysolde had taken the white of the Lightsworn. For seven years she tended the dying in the hospices of Solenne, and they died.

In the spring of 1170 she went north alone, up the Hald, and laid her hands upon the sick of every town from the coast to the fens, and they rose. Before she touched the sick she would kneel and lay her palms flat upon the ground, as if in prayer. Her sisters took this for humility.

At Varn she came a fortnight too late for the lord’s lady and child. She grieved for it all her days.

---

In that same year, 1170, the Hierophant raised her to sainthood while she yet lived, and the bells of every chapel in the Empire were rung for her.

In 1178 she was granted the highest office a Lightsworn may hold: Keeper of the Brand, who alone may tend the holy coal and stand within its light. She kept it three years. Her sisters record that she spent whole nights before the Brand, unsleeping, and that she wept a great deal in that time, so that her veil was never dry. This they took for holy joy.

---

Of her sayings in those years the sisters preserved few, for she spoke little.

To one, at the Brand’s side, she said: “It is so tired.”

To another, who asked what she saw in the flame: “A sea, and someone in it. Very kind.”

To the Hierophant, who asked her blessing upon the Empire, she said: “I will bless it, Holiness. I will find a way.”

These last words the Church holds to be a prophecy of her pilgrimage.

---

In the spring of 1181 the Saint went out from Solenne on foot, alone, to walk the road of the Bright Saint into the Ironspine, to the deep place from which the Brand was carried up. She told no one her purpose. She did not return. In 1182 the Hierophant declared her dead and among the saints.

A shepherd of the high passes swore that he saw her go by, singing, and that she left a trail of wet stones behind her, though it had not rained in a month. The Church does not hold this testimony to be reliable.

Here ends the Life. Lux manet.`,
    related: ['lore:ysolde-the-pale-saint', 'lore:the-grey-lung', 'lore:the-brand', 'lore:the-lanternate', 'lore:aldwin-varn'],
  },
  // ----- Haldren cathedral archive
  {
    id: 'lore:book-proclamation-of-the-snuffing', name: 'The Proclamation of the Snuffing', category: 'books',
    source: 'Edict of the Hierophant Caius III, 1041 YL; the Haldren see’s copy, with an archivist’s slip',
    unlockOn: [{ interact: 'obj:book-proclamation-of-the-snuffing' }],
    body: `In the name of the Seven Lights, and of Ithren first among them:

We, Caius, third of that name, Hierophant of the Lanternate and servant of the Brand, to all the faithful of the Empire and of the Haldmarch, greeting.

Know, faithful, that the Light has trimmed its wick. Let this be read in every chapel of the Lantern, that none may say afterwards he did not hear it.

---

The order called the Emberwardens, which the Church in its charity suffered to keep the leys for nine centuries, had grown proud. Its knights drew ember without licence and without prayer. They hoarded the gods’ fire in their fortress and taught it to whom they pleased.

And lately they had begun to spread among the people a vile falsehood: that the holy fire beneath the world was failing, that the gods’ gift was cooling in the earth, and that the Lantern could not save it. This they did to sow despair, and to make themselves the masters of the leys.

---

Therefore We decree:

First, that the order called the Emberwardens is heretic, dissolved and accursed, and its oaths are void before the Seven.

Second, that its fortress of Cinderhold is forfeit to the Church, and shall not be rebuilt.

Third, that any who were of the order and will abjure it before a Prior within forty days shall be shown mercy, which is to say a clean death.

Fourth, that whoever gives shelter to a warden shall answer to the Order of the Wick as a warden.

---

Fifth, that the writings of the order, its primers, tint-patterns and rolls, shall be burned wherever they are found, and the keeping of them is a hanging matter.

Sixth, that the reports, ledgers and measurements of the order touching the leys shall not be burned, but delivered sealed and unread into the archive of the Hierophant, that the falsehood they contain may be examined by the learned and spread no further.

Seventh, that any who repeat the said falsehood, that the fire beneath the world is cooling, shall be examined by the Wick for heresy.

---

Therefore, on this night, the Order of the Wick has gone up to Cinderhold, and the false wardens are no more. Their writings are forbidden. Those who keep them shall answer to the Wick. Give thanks, for the Lantern burns on, as it ever has and ever will.

Given at Solenne under Our seal, in the one thousand and forty-first year of the Lantern.

Lux manet.

---

[A slip of later paper, pinned inside the back board:]

Haldren copy. Read from the cathedral pulpit, 1041. Examined for the archive, 1160: in good order.

Note. The chests from Cinderhold named under the Sixth Article went south under seal in 1042. They do not appear in the catalogue of the Hierophant’s archive. I wrote to Solenne to ask where they lie. I was answered that the question was not a proper one for an archivist, and that I should pray on why I had asked it.

I have prayed. I still ask.`,
    related: ['lore:purge-of-the-emberwardens', 'lore:the-emberwardens', 'lore:order-of-the-wick', 'lore:cinderhold', 'lore:the-lanternate'],
  },
];

export default entries;
