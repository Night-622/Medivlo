/** Codex: factions and peoples (Act I set). Owner: Claude 4. */
import type { LoreEntry } from '@/core';

const entries: LoreEntry[] = [
  // ----- factions
  {
    id: 'lore:crown-of-haldmarch', name: 'The Crown of Haldmarch', category: 'factions',
    source: 'Roll of the Heralds of Haldren, 1187 YL',
    body: `The Crown of Haldmarch: a gold crossroads upon blue, for the roads that meet at Haldren and the kingdoms that met there to make one.

Sovereign: Aldith, by the grace of the Seven Queen of the Haldmarch, daughter of Aldred, eleventh of the line of Edric. Aged fifteen years.

Lord Protector of the Realm during the Queen’s minority: Osric Harrow, Lord of Harrowfield, Knight of the March, sometime Marshal of the Northern Passes.

Held of the Crown: the Kingsvale, the Witherdowns, Aldermoor, the Ironspine Foothills as far as the Iron Concord allows, and Greywater as far as the Causeway.

[A clerk’s note in the margin:] Greywater to be struck from the roll pending its recovery. The Lord Protector asks that it not be struck. The Queen asks that it not be struck. It is not struck. It is not recovered, either.`,
    sections: [
      { id: 'queen-rules', title: 'The Queen’s Peace', hint: 'Who rules when the winter ends?', body: `By the Queen’s own decree, Osric Harrow is stripped of the Protectorate and banished beyond the March for treating with the enemies of the realm. Aldith rules alone. The army is smaller and the council is frightened, but the bread-dole is honest and the gates of Haldren are open again by day. “Hold, and be held,” she said from the oak throne. People noticed that she did not need the cushion.` },
      { id: 'protector-rules', title: 'The Protector’s Peace', hint: 'Who rules when the winter ends?', body: `The Lord Protector’s hand grows heavier on the realm. The levies are mustered, the walls are manned, and the Greywater border is quiet, as though by arrangement. The Queen sits the oak throne at feasts and signs what is put before her. Some say she is biding her time. Some say she is afraid. Both may be true.` },
      { id: 'wick-rules', title: 'The Wick’s Peace', hint: 'Who rules when the winter ends?', body: `By the Queen’s seal, the defence of the realm is given into the keeping of the Order of the Wick until the Long Winter ends. The Wick’s white surcoats stand on every gate. Hedge-mages are taken in the streets. The Charter has not been torn up, the Lord-Inquisitor’s envoy says; it has merely been set aside, for the duration, as one sets aside a cloak indoors.` },
    ],
    related: ['lore:charter-of-haldren', 'lore:queen-aldith', 'lore:osric-harrow', 'lore:haldren-keep', 'lore:the-haldish', 'lore:the-kingsvale', 'lore:haldren'],
  },
  {
    id: 'lore:the-quiet-hand', name: 'The Quiet Hand', category: 'factions',
    source: 'The Rules of the Hand, as recited to a new finger',
    body: `One: the Hand does not take from the hearth. A man’s last loaf, his child’s blanket, his mother’s ring: these are not for us.

Two: the Hand does not speak. Not to the Watch, not to the Wick, not to your lover. What the Hand knows, the Hand knows.

Three: the Hand pays its debts. Every one. If you do a kindness to the Hand, the Hand will find you, even after years, even after you have forgotten.

Four: a finger that breaks the Rules is cut off.

The Quiet Hand has kept Haldren’s undercity for two centuries: thieves, fences, smugglers and, it is said, the best forgers north of Solenne. The Watch tolerates it because it keeps worse things out of the cellars. Since the Long Winter began, the Hand has been doing something no one expected of it. It has been feeding people.`,
    sections: [
      { id: 'sable', title: 'Sable', hint: 'One finger of the Hand is very cheerful.', body: `The Hand’s best climber is a woman called Sable, who laughs at everything, owns nothing and has never been caught. She is unfailingly cheerful, and she wipes her eyes rather often for someone so cheerful. She says it is the cold. She wears black, which is practical in her trade. It also hides stains.` },
    ],
    related: ['lore:haldren', 'lore:wick-licence', 'lore:sable', 'lore:the-kingsvale'],
  },
  {
    id: 'lore:grey-monks-of-morrow', name: 'The Grey Monks of Morrow', category: 'factions',
    body: `A cloistered order that keeps the dead: their bones, their rites and their memory. Grey Monks wash the bodies of the poor and bury them for nothing. They keep ossuaries in the Witherdowns, the Lantern Coast and the high passes, and in each ossuary an archive, where the names, last words and remembered dreams of the dead are written down and kept for ever.

The order takes no side in any war. It has outlived three dynasties and a schism, and it has never once been asked to choose between Church and Crown, because both are afraid of what it might remember about them. The Lanternate calls its Umbral arts “tolerated”. The monks call them their duty.

A Grey Monk does not lie about the dead. That is the first of their vows. They have never said anything about the living.`,
    sections: [
      { id: 'knowing', title: 'What the Monks Have Known', hint: 'They are not surprised by this winter.', body: `When you told Brother Ossory what the Aelthi ghost had sung beneath the barrows, that the sea under the river was dreaming before it was chained, he did not look surprised. He looked tired. “We have a great many records of that dream,” he said. “Some of them are older than the Lantern. We were told, long ago, that it would do more harm to speak of them than to keep them. I am beginning to wonder who told us.”` },
    ],
    related: ['lore:morrow-the-veiled', 'lore:ossuary-of-saint-calder', 'lore:the-restless', 'lore:the-witherdowns'],
  },
  {
    id: 'lore:iron-concord', name: 'The Iron Concord', category: 'factions',
    source: 'The Concord of Iron, between the Holds of the Ironspine and the Empire of Solenne (c. 300 YL), first article',
    body: `“The Holds shall trade with the Empire in iron, coal, stone and craft, and the Empire with the Holds in grain, wool, salt and wine, each at a fair weight. The Holds owe the Empire no fealty, and the Empire owes the Holds no protection. Neither shall pass the Gate of the other uninvited. What lies beneath the mountain is the Holds’ affair.”

The Iron Concord is the council of the Orrun holds, and also the treaty that gave it its name. It is governed by a High Thane, at present Brannoch Deepforge of Korrath-under-Stone, and by the thanes of the lesser holds, who meet in council beneath the mountain and keep an oath-ledger of every promise ever made by the Orrun to anyone. The Concord has kept its articles for nearly nine hundred years. It is very proud of that.`,
    sections: [
      { id: 'silence', title: 'What Lies Beneath', hint: 'The last line of the article is doing a great deal of work.', body: `Two of the Nine Nails have failed. The Concord has known for years. It closed the deep holds, called back the clans, and entered nothing in the oath-ledger, because what is not written was never promised, and what was never promised cannot be broken. Grimma Ironsong said it aloud at the gate, in front of humans. For that she was named oath-breaker and sent out of the mountain.` },
    ],
    related: ['lore:the-orrun', 'lore:the-nine-nails', 'lore:dun-korrath-gate', 'lore:grimma-ironsong', 'lore:brannoch-deepforge', 'lore:korrath-under-stone', 'lore:the-ironspine', 'lore:vor-the-hammer', 'lore:the-iron-concord-treaty'],
  },
  {
    id: 'lore:salt-league', name: 'The Salt League', category: 'factions',
    source: 'Articles of the Salt League, as posted in the Salt Exchange',
    body: `Every captain is a voice. Every voice is a vote. The Admiral is chosen by the votes, and unchosen by them likewise.

No captain of the League shall sail under the flag of king or Church. No captain of the League shall refuse a cargo for its owner’s creed.

What is taken from the sea belongs to the ship that takes it.

The League was born in the War of the Two Lanterns, when the free port of Brackhaven refused both sides and the captains of the Saltreach banded together to keep it free. Now it holds the western coast and the storm-isles beyond, and its Admiral, Marisol Kestrel, is said to be the only person in Morvane who has made both the Hierophant and the Lord-Inquisitor laugh in the same week. It is not said whether either enjoyed it.`,
    sections: [
      { id: 'star', title: 'A Star from the Sea', hint: 'The third article has been put to the test.', body: `In the spring of 1187 a League fishing-smack hauled up something that glowed through the net and boiled the water round it. It is in the League’s keeping now, somewhere in the isles. The Admiral means to sell it at auction next spring to the highest bidder, whoever that may be. Invitations, Wren Tallow says, cost a favour. “And we always,” the factor adds pleasantly, “collect.”` },
    ],
    related: ['lore:brackhaven', 'lore:war-of-the-two-lanterns', 'lore:the-seven-embers', 'lore:marisol-kestrel', 'lore:saltreach-coast', 'lore:saltreach-isles', 'lore:brackhaven-auction'],
  },
  {
    id: 'lore:ashen-creed', name: 'The Ashen Creed', category: 'factions',
    source: 'Instruction of the Order of the Wick to its witchfinders, ch. IV',
    body: `The heresy called the Ashen Creed holds that the gods’ fire belongs to every man who can draw it, and that the Lanternate’s licences are a tyranny. Its adherents meet in cells of three or four, so that no one of them can betray many. They do not wear marks. They pass smuggled tomes from hand to hand and teach the Ash tint to anyone who will learn it.

Its leader, who styles herself the Red Abbess, is a woman of Qasiri blood, once a sister of our own Church, who fled her vows and her abbey in a fire of her own making. She is to be taken alive if possible.

The witchfinder is to remember that a heretic of the Creed is not stupid. Many are learned. All are sincere. That is what makes them dangerous.`,
    sections: [
      { id: 'pamphlet', title: 'A Creed Pamphlet', hint: 'Found folded inside a hymnal.', body: `“Who lit the first fire? Not the Hierophant. Not Ithren. A hand that was cold and wanted to be warm. The Lantern tells you magic is the gods’ and they have lent it to the Church. Ask them who they lent it to before Solenne. Ask them what Ashvar thinks of licences. Ask them why the Brand went out in their keeping, and not in ours.”` },
    ],
    related: ['lore:wick-licence', 'lore:order-of-the-wick', 'lore:burning-of-qadir', 'lore:the-lanternate', 'lore:the-red-abbess', 'lore:vesper-qadri', 'lore:ashvar-the-ember-tongue', 'lore:ruins-of-qadir', 'lore:cinder-wastes'],
  },
  // ----- peoples
  {
    id: 'lore:the-haldish', name: 'The Haldish', category: 'peoples',
    source: 'From the travel-letters of a Solenni envoy to Haldren (c. 1120 YL)',
    body: `They are a ruddy people, broad in the shoulder and plain in the speech, who dress in wool and undyed linen and think it a great extravagance to wear blue. They farm, they herd, they quarrel with one another over boundary-stones, and they drink a bitter brown ale that is, I am assured, a food.

They profess the Lantern. They also keep a fire in every house that must never go out, and leave milk for their grandmothers’ ghosts, and see no contradiction in it. When I raised the matter with my host he said, “Seven keep us,” which I gather is both a prayer and a way of ending a conversation.

They are inordinately proud of their Charter. They distrust Solenne, and magic, and anything that comes from more than a day’s walk away. I have come to like them very much. I would not tell them so. They would distrust it.`,
    related: ['lore:haldish-hearth-customs', 'lore:charter-of-haldren', 'lore:the-solenni', 'lore:crown-of-haldmarch', 'lore:the-kingsvale', 'lore:aldermoor', 'lore:the-witherdowns'],
  },
  {
    id: 'lore:the-orrun', name: 'The Orrun', category: 'peoples',
    source: 'Grimma Ironsong, runesmith, at her forge',
    body: `“Short, you’d say. Broad. Heavy. Grey skin that goes to stone when we’re old, eyes like coals in a banked fire. That’s what you see. Here’s what you don’t.

“We are the children of the Orrin, the Fathers, the iron giants that Orr made from his own slag. When the Fathers rusted, what was left of them was us. Smaller. Shorter-lived. Stubborner. We keep their halls. We keep their oaths.

“An Orrun hold is a clan, and a clan is a ledger. Every debt we owe is written down, and every debt owed us. We do not forget either. That is not pride. That is what we are for. Korr nagh, we say: iron-oath. A promise that does not break.

“And if you want to know what an Orrun thinks of a thing that won’t hold, listen for the word grenn. It means rust. We do not say it at table.”`,
    sections: [
      { id: 'unwritten', title: 'The Unwritten', hint: 'There is a gap in the ledger.', body: `“Here is the thing about a ledger, human. It is only as honest as the hand that writes in it. Leave a thing out, and it never happened. My people have left something out.” She did not say more. She struck the iron in front of her, hard, and it rang.` },
    ],
    related: ['lore:iron-concord', 'lore:the-orrin', 'lore:grimma-ironsong', 'lore:the-nine-nails', 'lore:korrath-under-stone', 'lore:vor-the-hammer', 'lore:the-ironspine', 'lore:dun-korrath-gate', 'lore:brannoch-deepforge'],
  },
  {
    id: 'lore:the-solenni', name: 'The Solenni', category: 'peoples',
    source: 'Wat Fennick, keeper of The Guttered Candle, Brindlecross',
    body: `“Southerners. Dark-haired, mostly, and brown from the sun, and they wear white and gold like they’ve never had to wash a shirt. Every word out of them’s got three more words hanging off it. You ask a Solenni the road to Haldford and he’ll bless you, ask after your mother, tell you about his cousin’s vineyard and point you the wrong way, all very polite.

“They’re Lantern through and through, mind. Not like us. Their priests run the cities and their saints are on the coins. They call us their rustic cousins, which is their way of saying sheep. And everyone who isn’t a cousin is a heathen.

“Still. They’ve had a hard year. My brother carted for a pilgrim-house on the Lantern Coast, and he said it snowed on their vines this winter, which it never has, not once, and the priests went white as their robes. They think it means the gods are angry. I don’t know what it means. But I wouldn’t want to be a southerner, this winter, and find out.”`,
    related: ['lore:the-lanternate', 'lore:the-haldish', 'lore:the-brand', 'lore:solenne', 'lore:the-lantern-coast', 'lore:the-hierophancy', 'lore:ithren-the-lantern'],
  },
];

export default entries;
