/** Codex: magic, bestiary, culture (Act II set). Owner: Claude 4. */
import type { LoreEntry } from '@/core';

const entries: LoreEntry[] = [
  // ----- magic
  {
    id: 'lore:heartstone', name: 'Heartstone', category: 'magic',
    source: 'Lucan de Vaumont, Upon the Stones of Fable (Solenne, 1004 YL)',
    body: `Of all the wonders that the vulgar believe in, the most persistent is heartstone: a jewel said to be the Heartfire itself grown hard, as sap grows hard into amber. It is described as clear and red, warm to the touch for ever, heavier than gold, and able to light a room, a forge or a city.

Every people has the tale. The Orrun say the Fathers found it at the bottom of their deepest shaft. The Qasiri say the Ashen Kings wore it in their crowns. The Hrothi say a lump of it lies under the ice of the north, and that the glaciers are the world trying to keep it cold. The Lanternate, more soberly, holds that the Brand was the only true fire ever brought from the deep, and that heartstone is a fable put about by jewellers.

I have examined nine heartstones offered for sale in Solenne. Eight were glass. The ninth was a ruby, very fine. I bought it, and I set this down as the end of the matter.`,
    sections: [
      { id: 'cooling', title: 'Where Fire Cools', hint: 'The magister was wrong about one thing.', body: `In the deep veins around the Vault, where the leys run thickest, you saw it with your own eyes in the light of the Ashmark: clear red crystal, warm as a hand, crusted along the veins like frost along a window. The Orrun of the Vault would not touch it. “Heartstone is not a jewel,” one told you. “It is what the fire leaves when it stops. It was not here when my grandmother was young.”` },
      { id: 'cinderglass', title: 'The Poor Man’s Heartstone', hint: 'The Qasiri make something like it.', body: `Qasiri cinderglass is sand fused by ley-fire, black and glossy and faintly warm. The caravans call it the poor man’s heartstone, and use it for knives, lenses and braziers that burn without smoke. The Cindermother sees through it. She says the true stone would show far more, and that she is glad she has never had to look through one.` },
    ],
    related: ['lore:the-heartfire-and-leys', 'lore:the-seven-embers', 'lore:the-ashen-kings', 'lore:true-iron', 'lore:the-heartfire'],
  },
  {
    id: 'lore:true-iron', name: 'True-Iron', category: 'magic',
    source: 'Grimma Ironsong, at her forge',
    unlockOn: [{ landmark: 'landmark:true-iron-seam' }, { item: 'item:true-iron' }],
    body: `“You want to know what true-iron is? Hold out your arm. Feel that? Under the skin, that’s a vein. Your blood goes round in it.

“The Ironspine is Orr’s body. True-iron is what runs in his veins. You find it deep, in seams that glow red in the dark, and nowhere else in the world. It is the metal the Fathers were made of, and the Nails, and the great gate at Korrath. It takes a rune and keeps it. It holds an edge for a thousand years. Air does not rust it. Water does not rust it. Fire does not melt it, unless the fire is very old.

“It cannot be bought. The Concord does not sell it. It is given, by the High Thane, for a deed the ledger thinks is worth it, and then you have it, and you owe for it, and so do your children.

“You’ve heard the ledger says true-iron never rusts. You’ve also heard me say that two of the Nine did. So the ledger is wrong, or something is down there that isn’t air, or water, or fire. Pick one. I picked.”`,
    sections: [
      { id: 'seam', title: 'The Seam', hint: 'True-iron must be cut from the living rock.', body: `The true-iron seam beneath Korrath glows like a coal seen through smoke, and it is warm. When you laid the Ashmark against it, the glow beat once, slow, like a pulse under a thumb. The Orrun miner with you took off his cap. “That is why we do not sell it,” he said.` },
      { id: 'forging', title: 'Forging a Nail', hint: 'What it takes to make a new one.', body: `To forge a Nail, the Vault-keepers’ rule says, three veins of true-iron must be cut and brought to one anvil; the hold-fast rune must be cut while the iron is white; and the smith must swear, while the hammer falls, the oath that the Fathers swore when they drove the first: korr nagh, I will hold. Nobody living had done it before. Nobody had known what the oath was for. The rule says only: the Nail will hold as long as the oath does.` },
    ],
    related: ['lore:the-nine-nails', 'lore:vault-of-the-nine-nails', 'lore:the-orrun', 'lore:the-rusting', 'lore:vor-the-hammer'],
  },
  {
    id: 'lore:the-third-way', name: 'The Third Way', category: 'magic', hidden: true,
    source: 'What you were told when you asked how the world might be saved',
    body: `There are two ways the Long Winter ends, and everyone has chosen one.

Rekindle the Heartfire: carry the Embers back down and give them to it, and the world burns warm again, and the Mire stays nailed beneath it, and in a few centuries the cooling begins again, because the fire was always dying. Or quench it, as Ysolde means to: let the Mire close over everything, and let the world dream, which is to say, let Nhal have it.

There is a third way. The Aelthi began it at Ys Aerwen and could not finish it. Their Lullaby was meant to sing the Mire to true sleep, but a song made of voices alone is water and air, and it melted. Sung with fire in it, with the Seven Embers and with the Ashmark to carry the tune down into the deep, it could do what the Aelthi never could. Not chain the Mire. Not drown the world. Reforge the Heartfire into a new heart that holds both: the world awake above, the Dreaming at peace beneath, and a pact between them where there was only a nail.`,
    sections: [
      { id: 'price', title: 'The Price', hint: 'There is always a price.', body: `A new heart needs a keeper. The old one has burned on for an age without its smith, and it is dying for want of one. Whoever carries the song down to the Heartforge must stay there, at the bottom of the world, holding the new heart as Vor held the anvil, for as long as the world lasts. They will not come back. They will not grow old. They will be very lonely, and the world will be warm. That is the third way. It is the only way that does not end in fire or in water. It is not free.` },
      { id: 'who', title: 'It Need Not Be You', hint: 'Someone else might go in your place.', body: `It need not be the Ashmarked who stays. Anyone could keep the heart who carried enough of its fire and was willing to be lonely for ever: someone who has already stood at the bottom of the world and come back changed; someone who has spent her whole life keeping a flame no one else would keep. Saint Solenne said it nearly twelve hundred years ago, at the end of her life, and no one understood her. Someone ought to stay with it.` },
      { id: 'kept', title: 'Kept', hint: 'The third way was taken.', body: `It was done. The Lullaby was sung at the bottom of the world with the Seven Embers and the Ashmark in it, and the old heart was struck again upon the anvil of ribs: not as a nail this time, driven down into the Dreaming, but as a hearth set over it, to keep it warm while it sleeps. The Mire lies under the world now as a child lies under a blanket, and someone sits beside it. Saint Solenne said it nearly twelve hundred years ago, and it took the world that long to hear her. Someone stayed with it. Someone always will.` },
    ],
    related: ['lore:the-lullaby', 'lore:nhal-the-drowned', 'lore:the-seven-embers', 'lore:the-ashmark', 'lore:saint-solenne', 'lore:the-forging', 'lore:rhiannon-ys-caer', 'lore:the-keeper'],
  },
  // ----- bestiary
  {
    id: 'lore:wrought-sentinels', name: 'Wrought Sentinels', category: 'bestiary',
    source: 'Orrun Vault-keepers’ lore',
    unlockOn: [{ kill: 'enemy:wrought-sentinel' }],
    body: `“The Fathers built the sentinels before they built anything else, and set them walking. They are iron and stone and rune, twice the height of a man, with a light behind the eye-slit that is not fire. They have no hearts. They need none. They walk the same paths through the deep that they walked in the First Age, between the same points, at the same pace, and the paths are worn a hand’s depth into the rock.

“They do not know the Fathers are gone. They do not know there are Orrun. They know three things: walk, watch, and stop what moves where nothing should be moving. In the old days we learned the hours of their rounds and kept out of the way. We can still do it, mostly. But since the Nails failed they have been walking faster, and they have begun to stop things that were never stopped before.

“Strike for the rune on the chest. Everything else is just iron.”`,
    sections: [
      { id: 'rounds', title: 'Their Rounds', hint: 'What the sentinels are guarding.', body: `Watch a sentinel long enough and you learn its round. Every path in the Vault goes, sooner or later, to the foot of a Nail. The sentinels walk from Nail to Nail, and at each one they stop, and lay an iron hand flat on the true-iron, and wait, as a physician waits with two fingers on a wrist. At the two dead Nails they wait much longer. Then they move on, and walk faster.` },
    ],
    related: ['lore:vault-of-the-nine-nails', 'lore:the-orrin', 'lore:rust-wraiths', 'lore:the-nine-nails', 'lore:the-ironspine'],
  },
  {
    id: 'lore:cinderdrakes-and-ashwyrms', name: 'Cinderdrakes and Ashwyrms', category: 'bestiary',
    source: 'A Qasiri drake-warden’s teaching',
    unlockOn: [{ kill: 'enemy:ashwyrm' }, { kill: null, family: 'cinderdrake' }],
    body: `“The cinderdrake is the Kings’ child. Tariq the Drake-King bred them from the lizards of the hot springs, feeding each brood on ley-fire until the fire stayed in them. He wanted a weapon with wings. He got one. The drakes fought for Qadir for three hundred years. When Qadir burned, they did not. They liked it.

“A cinderdrake is the size of a horse, scaled in black glass, with a belly that glows like a forge-mouth when it breathes in. Its breath is not flame. It is ash, hot enough to melt sand, and if you breathe it you will cough until you die. Keep a wet cloth on your face. Keep the wind at your back.

“An ashwyrm is what a cinderdrake becomes if it lives five hundred years and is never killed. It loses its wings. It gains its length. It swims through the ash dunes as a fish swims, and it does not breathe ash; it breathes the fire it has been storing since the Burning. There are only a few left. There is one in the ruins of the palace. It is, as far as we know, guarding something.”`,
    sections: [
      { id: 'guarding', title: 'What the Wyrm Guarded', hint: 'Why the wyrm lay at the throne.', body: `The ashwyrm of Qadir lay coiled round the Glass Throne, its coils filling the hall, and it was not guarding the king. It lay with its head toward the throne’s foot, where the Ember had fallen through the glass roof on the Night of Falling Ash, and its great body was curled round the Ember as a cat curls round a hearth. It was not guarding it from anyone. It was keeping warm.` },
    ],
    related: ['lore:ruins-of-qadir', 'lore:the-ashen-kings', 'lore:burning-of-qadir', 'lore:cinderlung', 'lore:cinder-wastes'],
  },
  {
    id: 'lore:mirebeasts', name: 'Mirebeasts', category: 'bestiary',
    unlockOn: [{ kill: 'enemy:mirebeast' }],
    body: `When enough of the Mire gathers in one place, and stays, it begins to remember animals. Mirelings are the first attempts: blobs and mouths and tendrils, things a child might draw. Mirebeasts are what comes after, when the Mire has had longer to think.

A mirebeast is the size of an ox, or a bear, or a cart, depending on what it is trying to be. It has legs, usually four, often more. It has a head, usually. Its hide is black water held in a shape by an effort of will, and it ripples where it is struck and closes again. It has learned from the Hollowed things it has eaten that a beast should have eyes, and it has eyes, many of them, all of them closed. It finds you without them.

They were rare before the Quench. Fen-folk would see one in a lifetime, at the edge of the Seep, at dusk. In the last days before the Breach they came out of the Seep in herds.`,
    sections: [
      { id: 'remembering', title: 'What They Remember', hint: 'A mirebeast is always copying something.', body: `When a mirebeast dies under the Ashmark, it does not fall. It forgets. The shape goes first, and then the water runs out across the ground, and for a moment, as it goes, you can see what it was trying to remember: a heron, a plough-horse, a dog that sat by a door in Fenwick. The fen-folk who watched it happen grew very quiet. One of them said she knew the dog.` },
    ],
    related: ['lore:the-unwrought', 'lore:the-breach', 'lore:the-black-seep', 'lore:the-mire', 'lore:the-hollowed', 'lore:the-mirelands'],
  },
  {
    id: 'lore:rime-wolves', name: 'Rime-Wolves', category: 'bestiary',
    source: 'From the Saga of the Long White, as the skalds of Skelvik tell it',
    unlockOn: [{ kill: 'enemy:rime-wolf' }],
    body: `“Hear now of the rime-wolves, the grey walkers, the frost-tongued, who came down out of the north in the year the star fell.

“They were wolves once, the old skalds say, of the great white kind that hunt the high fells. But the cold came, and did not go, and the wolves that lived were the wolves that let the cold into them. Now there is ice in their fur, and ice in their eyes, and their breath freezes as it leaves them, so that they run in a mist of their own making. Their bite does not bleed. It freezes. A man bitten on the hand will lose the hand by morning unless it is warmed.

“They run in packs of nine or ten. They are not hungry, as wolves are hungry. They hunt warm things for the warmth. Where a pack has fed, the snow is clean, and the dead are cold as stones, and not a mark on them but the bite.

“The clans used to hunt wolves for their pelts. No one takes a rime-wolf’s pelt. It does not keep you warm.”`,
    sections: [
      { id: 'deeds', title: 'A Deed for the Moot', hint: 'The clans honour those who hunt them.', body: `Since the rime-wolves came, a hunter who kills one may lay its frozen tooth on the speaking-stone at the Moot, and be heard. Four teeth, by the old law of deeds, is enough to be heard in any matter whatever. The teeth lie there still, in a little heap below Calun’s Eye, where the Ember’s heat is slowly melting them to water.` },
    ],
    related: ['lore:the-wolf-moot-stones', 'lore:the-hrothi', 'lore:hrothi-kennings', 'lore:skelvik', 'lore:the-frostreach'],
  },
  // ----- culture
  {
    id: 'lore:hrothi-kennings', name: 'Hrothi Kennings', category: 'culture',
    source: 'A list of kennings, set down by a Haldish trader in Skelvik who was tired of being laughed at',
    body: `The Hrothi do not call a thing by its name if they can call it by two other names instead. A sword is a “wound-twig”. To speak plainly at the Moot is thought a little rude, and to speak plainly in a saga is unforgivable. I have set down those I have learned, to spare the next trader.

Calun’s road: the sky. Calun’s laughter: thunder.
Saela’s floor: the sea. Saela’s roof: sea-ice.
Vor’s sweat: sparks. Vor’s promise: iron.
Hall-sun: the hearth-fire. Ring-giver: a jarl, if generous; “ring-keeper”, if not.
The grey walker: a wolf. The white walker: winter.
Spear-weather: battle. The long white: the Long Winter. The South-Hunger: the wish to raid.
Wave-horse: a ship. Wave-horse’s bones: a burned ship. A fire of bones: a hall in winter, now.
Morrow’s guest: a dead man. Morrow’s doorstep: a sickbed.

A kenning contest is fought at the Moot as a duel is, and the loser goes home as quietly.`,
    sections: [
      { id: 'riddles', title: 'Riddle-Kennings', hint: 'The hardest kennings are riddles.', body: `The hardest kennings are riddles, and at a moot, they are weapons. “What is the bride the fjord takes every winter, and gives back every spring?” Ice. “What is the guest who eats at every hall, and is never fed?” Fire. And one the skalds have only asked this year, and do not answer: “What did the fjord’s bride take last winter, that she has not given back?”` },
      { id: 'eighth', title: 'The Kenning without a Name', hint: 'There is one thing the Hrothi will not name even sideways.', body: `There is one kenning the trader did not set down, because no one would tell it to him. You heard it at the Moot, from a storm-caller, who said it once and then spat on the fire. “The one the wind is looking for.” He meant the Eighth Spark. In the north they will not say its name, or even what it is. They only say what is missing.` },
    ],
    related: ['lore:the-hrothi', 'lore:calun-the-wanderer', 'lore:wolf-moot', 'lore:the-wolf-moot-stones'],
  },
  {
    id: 'lore:qasiri-salt-law', name: 'Qasiri Salt-Law', category: 'culture',
    source: 'The Salt-Law, as every Qasiri child recites it',
    body: `Salt shared is a vow.

Who eats your salt is your guest. Who gives you salt is your host. A guest may not be harmed by the host, nor the host by the guest, for three days and three nights from the sharing, and on the fourth they may part as they please.

A guest’s enemy is the host’s enemy for those three days. A host’s debt is the guest’s debt.

Salt is not refused. To refuse salt is to say: I mean you harm. A caravan that is refused salt at a well will water its camels and leave by night.

Who breaks the salt is poured out. Their name is not said again in any tent of the forty clans, and their grandchildren will be asked, at every well, whose grandchildren they are.

The Qasiri carry a pinch of salt in a copper box at the belt for the purpose, and they share it with strangers more readily than any people in Morvane. It is not trust. It is the law that makes trust unnecessary.`,
    sections: [
      { id: 'auction', title: 'Salt at Gull Rock', hint: 'The Salt League borrowed a Qasiri custom.', body: `The salt at the door of Gull Rock Hall was the Qasiri envoys’ suggestion, accepted by the Admiral with delight. Every bidder shared it: the Wick’s factor, the Red Abbess, Samir ibn Ruqaya, and you. Samir explained the law to the room, very courteously, in three languages. Then he added that the law did not say what happened on the fourth day. Kestrel laughed for a full minute. The auction was to last three.` },
    ],
    related: ['lore:the-qasiri', 'lore:qasiri-caravans', 'lore:zahrun', 'lore:brackhaven-auction', 'lore:salt-league'],
  },
];

export default entries;
