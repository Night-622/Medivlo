/** Readable in-world books, part 2 (Kingsvale, Saltreach, Greywater, Witherdowns). Pages split on `---`. Owner: Claude 4. */
import type { LoreEntry } from '@/core';

const entries: LoreEntry[] = [
  // ----- Haldren Keep
  {
    id: 'lore:book-ballad-of-the-northern-pass', name: 'The Ballad of the Northern Pass', category: 'books',
    source: 'As sung in the hall of Haldren Keep, to the tune of “Wolf on the Shield”; one verse pencilled in a later hand',
    unlockOn: [{ interact: 'obj:book-ballad-of-the-northern-pass' }],
    body: `Sung in the hall of Haldren Keep on the feast of the Northern Pass, and in every tavern of the Kingsvale on any night at all.

Come sit by the fire and I’ll sing you the pass,
and the year that the Hrothi came over the snow,
when the beacons burned red like the lamps at Lanternmass,
and the King had no army, and nowhere to go.

---

Three hundred came down from the frozen north
with axe and with fire and with wolf on the shield;
Harrow stood in the pass with forty men forth,
and Harrow stood fast, and he would not yield.

Young Osric was twenty, new-knighted that spring,
with his father’s old sword and a borrowed grey mare;
he had sworn to the March and had sworn to the King,
and he swore it again to the cold mountain air.

---

Then up spoke the jarl with the frost in his beard:
“Stand aside, little lord, and go home to your bed.”
And Osric made answer: “The south you have neared,
but the road to it, jarl, runs over my dead.”

Three days and three nights in the mouth of the pass
they fought in the snow and they fought in the sleet,
and the dead of the north lay as thick as the grass,
and the forty were twenty, and none would retreat.

---

On the third night the Hrothi called Calun by name,
and the storm-god came howling down off the height;
but Harrow stood firm as the lightning came,
and he lifted his sword in its terrible light.

And when morning came grey over Ironspine stone,
the wolves were away and the north road was clear;
of forty went up, there came nine down alone,
and Harrow came first, with the jarl’s broken spear.

---

Then the King rode up from his Haldren hall,
and he knighted the nine where they stood in the snow;
and to Harrow he gave the north passes, all,
to keep for the crown while the cold winds blow.

So drink to the pass, and to Harrow the bold,
and the forty who stood in the teeth of the gale;
let the north wind come down and the winter be cold:
while a Harrow keeps watch, there’s no wolf in the vale.

---

[On the last leaf, in pencil, headed “as they sing it in the lower town, and not in the Keep”:]

Three days and three nights, then he went in the dark
to the jarl in his tent with a lamp and a chest;
and what passed between them has left not a mark,
but the wolves went home fed. And you know all the rest.

[Beneath:] Sing that one in the Keep and you’ll sing it in the stocks.`,
    related: ['lore:osric-harrow', 'lore:crown-of-haldmarch', 'lore:haldren-keep', 'lore:sigrun-ice-eye'],
  },
  // ----- Cinderhold library
  {
    id: 'lore:book-on-the-orrin-works', name: 'On the Works of the Orrin', category: 'books',
    source: 'Lucan de Vaumont, Magister of the Studium of Solenne (998 YL); a copy from the library of Cinderhold, scorched along its edges',
    unlockOn: [{ interact: 'obj:book-on-the-orrin-works' }],
    body: `Upon the Works of the Orrin: being a Treatise on the Giant-Builders of the First Age, and the Purposes of their Labours, humbly offered to the Studium of Solenne by Lucan de Vaumont, Magister, in the nine hundred and ninety-eighth year of the Lantern.

That the giants were, all agree. What they were for, none agree. I have walked the Haldmarch and the Ironspine eleven years to settle the matter, and I believe I have settled it.

---

Of the Dams and Drains.

The traveller in the north will find, in places of no apparent consequence, works of a grandeur out of all proportion to their setting: a sluice of dressed stone at a moorland mere in Aldermoor; drains of a cyclopean size beneath the fen of Greywater; a wall across a dry valley of the Ironspine that holds back nothing whatever.

The vulgar say the giants were fools. I say they were farmers. It is my contention that the Orrin dammed and drained to water their forges and their fields, the climate of the First Age being wetter than our own.

---

Of the Nails.

More curious are the iron pillars the Orrun call the Fathers’ Nails. I have seen one only: the head of it, standing from an old shaft below Korrath-Gate, to which an Orrun guide brought me for a great deal of silver and afterwards much regretted it. Its metal bore not one fleck of rust. The guide would say only that it “holds”.

I have considered what a spike driven into the earth might hold, and I conclude: the earth itself. The Ironspine is much troubled by tremors, and the giants, being smiths, sought to pin the restless ground as a smith pins a hot bar to the anvil.

---

Of the Rusting.

Of their end the Orrun tell a fable: that the giants dug toward the fire at the world’s heart to wake their dead maker, and that its heat rusted them from within.

I do not credit it. Iron does not rust by heat, but by water, as every smith knows. It is my belief that the giants rusted because they dug too deep and met the waters under the earth, and that whatever lies beneath their nails is wet.

I set this down as a curiosity of natural philosophy, and draw no theological conclusion from it whatever.

---

Of the Wrought.

Their iron servants still walk the high passes on rounds no living master set them. I watched one for a whole day from a safe height. It walked a circle about a stone the size of a chapel, and at each turn of the circle it stooped and laid its hand upon the stone, as a man lays his hand upon a door to feel whether the room beyond is burning. I commend the question to wiser heads.

[In the margin, in the red ink of the wardens:] Not a stone. Ask the Orrun what lies under the circle, and watch their faces.`,
    related: ['lore:the-orrin', 'lore:the-nine-nails', 'lore:the-orrun', 'lore:cinderhold', 'lore:the-solenni'],
  },
  // ----- the Thornwall
  {
    id: 'lore:book-lament-for-ys', name: 'Hiraeth-Ys: a Lament for the Drowned Court', category: 'books',
    source: 'An Aelthi lament, in a Thornwise translation set down at the Thornwall; a note in another hand',
    unlockOn: [{ interact: 'obj:book-lament-for-ys' }],
    body: `This is the lament the Aelthi sing once in every year, on the still night when Ys Aerwen sank. It is sung without harp or drum, by the oldest voice present, and no one joins in.

The translation is a poor thing. In the Aelthi every line ends on the same falling note, which our tongue cannot hold, and there is no Aelthi word for “drowned” that does not also mean “held”.

---

We sang to the sea that was under the lake,
for it turned in its sleep and it wept in its sleep.
We sang it the softest of songs that we knew,
and it heard us, it heard us, and came up to see.

The towers went soft as the wax of a candle.
The stair went to water, the bridge went to dream.
Our mothers were singing; they sang as they sank.
We could hear them for three days beneath the still lake.

---

O Ys of the white stair, Ys of the willow,
where the lamps of the court lay gold on the lake,
where the old ones walked singing at dusk by the water
and the young ones kept silent for listening’s sake:

we were the first to hear it, the sea below the world,
dreaming its long dream, turning in its bed.
We were the first to pity it. Gwyn aer, we said.
Bright song. And we meant to sing it down.

---

But a song is a calling. We did not know.
A lullaby sung to a child at the door
brings the child to the door. We sang it to sleep,
and it rose to the singing, and loved us the more.

It came up through the lake like a face to a window.
It came up as softly as breath on the glass.
It did not mean harm. It has never meant harm.
That is the grief of it. Hiraeth-ys.

---

Do not sing to the water, children of Ylwen,
though it turn in its sleep, though it weep in its sleep.
We swore on our mothers who sang as they sank:
the song is unsung, and the drowned court is deep.

Ys hun. Ys hun. Sleep below.

[Beneath, in a younger hand, very small:] The song was not wrong. It was not finished. C.`,
    related: ['lore:sundering-of-ys', 'lore:the-lullaby', 'lore:ylwen-deepwood', 'lore:the-aelthi', 'lore:cadoc-ap-ynys'],
  },
  // ----- the Salt Exchange, Brackhaven
  {
    id: 'lore:book-salt-exchange-ledger', name: 'Ledger of the Salt Exchange, Winter 1186–87', category: 'books',
    source: 'Day-book of the Salt Exchange, Brackhaven; kept by the factor Wren Tallow',
    unlockOn: [{ interact: 'obj:book-salt-exchange-ledger' }],
    body: `Winter book, 1186–87. Salt Exchange, Brackhaven. Factor: W. Tallow.

Lanternmass. Exchange shut for the feast. Sky lit past midnight. Seven falling stars, by the harbour watch. One came down west of the Gull Rocks. Watch says it hissed.

Day after. Ash on the water. Ash on the slates. No sailings.

Third day. Ash still falling. Grain up a third. Lamp-oil up half. Bought all the lamp-oil.

Week 2. Harbour iced at the mole. First time in memory. Tide-priests asking double. Paid.

---

Week 4. Cod short. Herring short. Fleet says the fish have gone deep, or gone west. Something warm in the water by the Gull Rocks. Fish won’t go near.

Week 6. Smack Saela’s Cup, master N. Sorrel, nets fouled off the Gull Rocks. Two nets lost. Third came up scorched.

Week 9. Ice in the harbour every morning. Ice-breakers paid four silver a day.

Week 11. No thaw. Winter book kept open. Spring book not begun.

---

Saela’s Moon. Saela’s Cup in at dawn, low in the water, a net still aboard. Master Sorrel would not say what was in it. Asked for the Admiral by name. Sent up.

Same day. Admiral came down herself. Took the net and the thing in it to the strong-room under her own seal. Ice round the hull of Saela’s Cup melted a yard out.

Same day. Sorrel paid off: fifty gold. By the Admiral’s order, not the Exchange’s. Noted.

Next day. Admiral’s instruction: not to be called “the thing”. To be called “the star”. Corrected.

---

Week 14. Letter, unsigned, plain white wax, Solenni hand. Asks what the League has taken from the sea, and its price. Answered: not for sale.

Week 15. Gentleman in grey gloves at the long table. Solenni. Gave no name. Offered ten thousand gold and the League’s pardon. Admiral asked, pardon for what? Gentleman left.

Week 16. Woman, hooded, at the door after dark. Left wet footprints on a dry floor. Offered no gold. Said the star wanted to go back into the sea, and she would carry it. Clerk J. Pole gave notice next morning.

---

Week 17. Two envoys, Qasiri by their rings, copper and glass. Very courteous. Shared salt at the table. Asked to see the star, not to buy it. Asked whether it coughed. Refused.

Week 18. Purse left on the long table, no name. Old Imperial gold, every coin scorched black. Note inside: “For the fire, which is everyone’s.” Purse kept. Note burned, by order.

Week 19. Admiral’s ruling: no private sale. Auction, in the isles, next spring. Invitations at a favour apiece. All parties to be told.

---

Week 20. Strong-room warm through the wall. Clerks will not sit by it. Moved the slate-desk.

Week 21. Grey gloves back. Told: auction. He said his master would bid in person. Admiral laughed. Gentleman did not.

Week 22. Star moved to the isles by night, aboard the Admiral’s own ship. Strong-room cold again. Clerks back at the wall.

Winter book closed. No spring. W. T.`,
    related: ['lore:salt-league', 'lore:brackhaven', 'lore:the-seven-embers', 'lore:night-of-falling-ash', 'lore:marisol-kestrel'],
  },
  // ----- the hall of drowned Varn
  {
    id: 'lore:book-varn-charter', name: 'The Charter of Varn', category: 'books',
    source: 'The Charter of Varn, 702 YL; with a leaf sewn in at the back in the hand of Aldwin, Lord of Varn',
    unlockOn: [{ interact: 'obj:book-varn-charter' }],
    body: `Be it known that We, by the grace of the Seven and the leave of the Lantern, grant to Our servant Godwin of the Fen and his heirs the drained lands at the mouth of the Grey, to hold the dykes, the sluices and the floodgates thereof, and to keep the water out of Our realm for so long as their line endures.

These are the terms of the holding.

---

First, that the lord of Varn shall walk the dykes in person at every new moon, and know every sluice-keeper by name.

Second, that the floodgates shall be opened only at the ebb, only to let the fen drain, and never to let the water in.

Third, that the old drains beneath the town, which were the giants’, shall be kept and mended and not dug beneath, nor their stones taken for building, for they are older than Our realm and hold more than water.

Fourth, that the lord of Varn shall take for toll one penny in twelve at the Causeway, and no more.

---

Fifth, that in time of flood the lord and his household knights shall stand upon the Causeway until the water falls, and shall not leave it, and this shall be their oath: the water shall not pass us.

Sixth, that if ever the lord of Varn let the water into Our realm by his own hand, his charter is void, his line is ended, and the fen shall have him.

Given at the Causeway under Our seal, in the seven hundred and second year of the Lantern.

---

[A leaf sewn in at the back, in a careful hand that grows less careful:]

I, Aldwin, sixteenth lord of Varn, have walked the dykes at every new moon for thirty years. I know every sluice-keeper by name. I have kept every clause of this charter, and it has kept nothing of mine.

Merewyn died on a Morrowday in the autumn of 1170, with her hand in mine. Elfreda died the Kethday after. She asked me to open the window so that she could hear the water. I did not. It was cold. I have thought of it every day for sixteen years.

---

A fortnight after, the saint came to the Causeway. She laid her hands upon the ground, and then upon my people, and they rose. Every one. I thanked her. I do not know what else I said. She wept when they told her. She said: “I was too slow. I am always too slow. One day I will not be.”

The Sisters in the reeds say that no one is lost below. They say Merewyn and Elfreda are sleeping, and that the water is not cold, and that a door may be opened from this side.

---

Lanternmass, 1186. The Sisters say tonight. A light will go out in the south, they say, and the stars will fall, and the door will open for any man who opens his own.

The sixth clause says the fen shall have me. Let it. I have been the fen’s since the autumn of 1170.

I will open the window now, my love. I will let you hear the water.

A.`,
    related: ['lore:varn', 'lore:aldwin-varn', 'lore:greywater-marsh', 'lore:the-grey-lung', 'lore:drowned-knights'],
  },
  // ----- the Ossuary of Saint Calder
  {
    id: 'lore:book-grey-monk-ossuary-rule', name: 'The Rule of the Ossuary', category: 'books',
    source: 'The Rule of Saint Calder, as kept by the Grey Monks of Morrow; with the additions of the Priors, the last dated 1186 YL',
    unlockOn: [{ interact: 'obj:book-grey-monk-ossuary-rule' }],
    body: `Here is the Rule that Calder gave his brothers in the Grey Winters, when there were more dead than living and no one to keep them.

It is read aloud in the Ossuary once in every week, on Morrowday, at the hour of the lamp. Every brother knows it by heart. Every brother is to read it anyway, for the heart forgets what it is sure of.

---

Of the Dead.

I. Write every name. A name not written is a soul that Morrow must search for.

II. Read every name aloud, in turn, so that no one in this house is wholly forgotten.

III. Do not lie about the dead: not to their kin, not to the Church, not to the King, not to yourself.

IV. Do not refuse the dying, whatever they have done and whomever they serve. Sit with them. Write down what they say last.

V. Wash the bodies of the poor, and bury them for nothing. Morrow takes no fee.

---

Of the River.

VI. Leave water on the sill, that Saela may find the house. Leave the door unbarred on the night of a death.

VII. Do not keen too loudly. The dead must hear the boat.

VIII. When the boat has come, do not call them back. They are not yours now.

IX. If the dead speak of the River Under, write it in the grey book. If they speak of what lies beneath the river, write it in the grey book, and seal it with grey wax, and do not read it back.

X. Tell no one what Morrow keeps.

---

Of Dreams.

XI. Write down the dreams of the dying, for they have walked in Morrow’s country and may have seen something of use.

XII. If two of the dying, strangers to each other, dream the same dream, write it twice, and tell the Prior.

XIII. If many dream it, tell no one. (Added by Prior Aldo, in the four hundred and tenth year of the Lantern, after the fever in the fens.)

XIV. Do not sleep in the lower vaults. (Added 790 YL.)

XV. Go not alone to the shrine of Saela beneath the King-Barrows, nor stay there past the lamp. (Added 1102 YL.)

---

XVI. (Added in the last week of 1186 YL, in the Prior’s hand, the ink not yet faded:) If the dead do not cross, do not speak to them of the sea.

[Beneath, smaller, in the same hand:] They ask us where the river goes. We used to tell them: to Morrow. But they have stood on the ice now, and they have seen that it goes on past him, down into the dark, to a sea that is not his.

Do not tell them that it is warm there. They will want to go.`,
    related: ['lore:ossuary-of-saint-calder', 'lore:grey-monks-of-morrow', 'lore:morrow-the-veiled', 'lore:saela-and-the-river-under', 'lore:the-restless'],
  },
];

export default entries;
