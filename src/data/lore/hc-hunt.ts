/** Hollow Crown codex: the Greywilds (Hunt), shared by the Huntsman and Falconer campaigns. Owner: Claude 4. */
import type { LoreEntry } from '@/core';

const entries: LoreEntry[] = [
  {
    id: 'lore:hc-greywilds', name: 'The Greywilds', category: 'realms', source: 'a Lodge primer, chewed at one corner',
    body: 'Endless olive forest and wide plains, the realm of the Hunt school. Huntsmen and Falconers follow the herds. The Hunt holds that the chase is a conversation between hunter and hunted, and that a hunter takes only what the hunt gives.\n\nSince the Hollowing the herds have left their old roads. The Great Hunt lost its path, the hunt became a slaughter, and the Trophy Barons grew rich while the Lodge grew poor.',
  },
  // ---------- depth pass: codex finds (the gate road, side-quest finds, Claude 2's optional areas, the lairs)
  {
    id: 'lore:hc-huntsman-counting-post', name: 'The Counting Post', category: 'culture', source: 'an oak post on the gate road', hidden: true,
    body: 'Every Lodge hunter who ran the Turning road beside the Great Hunt cut a notch in the Counting Post on the way up, and a second notch beside it on the way home. A thousand years of pairs, nearly all of them whole.\n\nIn C. 1012 twelve Lodge hunters went up the gate road for the eighty-fifth Turning, and the gate shut behind them. Their single notches are the last row on the post. Somebody has scratched under them, very small: “Still counting.”',
  },
  {
    id: 'lore:hc-huntsman-osric-tally', name: 'Osric Fallow’s Tally Stick', category: 'history', source: 'a warden’s hide above the old cart track', hidden: true,
    body: 'Thirty-one notches for thirty-one carts, cut by the Elkway warden from his hide in the autumn of C. 1013, and three crests burned into the end of the stick with a hot nail: a raven over a skull, a boar’s head and a silver horseshoe.\n\nThe Lodge has always said that the herds lost their road. Osric Fallow sat in the cold and counted the people who took it.',
  },
  {
    id: 'lore:hc-hunt-capital-ruin', name: 'The First Lodge', category: 'history', source: 'a feast-board over a roofless hearth', hidden: true,
    body: 'Before the Great Lodge hall there was a single long house of turf and oak in the forest, and its hearth is still standing. Every twelve years the Lodge ran beside the Great Hunt to the Turning, and when the runners came home they walked out to the old hearth, roof or no roof, and cut a notch over it.\n\nThere are eighty-five. Somebody began the eighty-sixth in C. 1024, out of habit, and stopped halfway through the cut.',
  },
  {
    id: 'lore:hc-hunt-capital-cave', name: 'The Shedding Cave', category: 'places', source: 'a cave floor of shed antler', hidden: true,
    body: 'Every spring the Elkway herd came up into this cave to rub their antlers off against the rock, and every spring the Lodge left them to it, by the old law: take nothing in the calving moon. The floor is a thousand years deep in antler.\n\nThe top layer is thirty years old, all but one antler, which is new this spring. Somewhere the herd is still trying.',
  },
  {
    id: 'lore:hc-hunt-capital-slate', name: 'The Shedding Count', category: 'culture', source: 'an apprentice’s slate in the Shedding Cave', hidden: true,
    body: 'Lodge apprentices have counted the cave’s new antlers every spring for as long as there has been a Lodge, a different hand each generation, each one signing the slate at the foot. It is the first count a young Huntsman is trusted with.\n\nThe last true count was four hundred and six, in C. 1012. After it some apprentice wrote “None” three springs running, and then stopped coming.',
  },
  {
    id: 'lore:hc-hunt-capital-view', name: 'Breath Hill', category: 'places', source: 'a bench on a hill above the Elkway', hidden: true,
    body: 'On a cold dawn in the calving moon you could once sit on this hill and count the herd by the steam of its breath rising out of the trees, a white thread from Antlerford to the Antler Gate. The Lodge put a bench here so that old hunters could still take part in the count.\n\nThe bench is worn smooth. The breath is gone. From up here you can see exactly where each missing cairn should be.',
  },
  {
    id: 'lore:hc-poacher-chief', name: 'The Poacher Chief', category: 'characters', source: 'a tin under a bunk in the Poachers’ Camp', hidden: true,
    body: 'Thirty years ago he was a beater for the Barons, one of a hundred men who walked the woods in a line to drive the herd towards the guns. When the cairns came down and the herds could be driven by anyone with a cart, the Barons stopped hiring beaters.\n\nHe set his first snare the next spring. He always set them too low. He kept his old armband, and his daughter’s drawing, to the end.',
  },
  {
    id: 'lore:hc-tick-hollows', name: 'The Lying-Down Place', category: 'places', source: 'a Lodge marker stone in the Tick Hollows', hidden: true,
    body: 'Before it was the Tick Hollows it was the Lying-Down Place, where the oldest elk of the herd went to die in peace, and where the Lodge did not hunt, by custom older than the charter.\n\nThe Barons’ parties drove the hollowed herd there because it was the one place in the Greywilds every beast already knew the way to. The ticks came for the dying, and the Queen came for the ticks.',
  },
  {
    id: 'lore:hc-corva-first-trophy', name: 'Corva’s First Trophy', category: 'characters', source: 'the smallest case in the Trophy Hall', hidden: true,
    body: 'The Ashby Trophy Hall holds more heads than any hall in the Greywilds, three hundred years of them, and the smallest thing in it is a hare. Corva shot it at seven with a child’s crossbow, and her father had it mounted in a case beside his stags and called it a beginning.\n\nThere is no case in the Hall for anything she was ever given.',
  },
  {
    id: 'lore:hc-falconer-leaving-post', name: 'The Leaving Post', category: 'culture', source: 'a larch pole on the Hawkmoor gate road', hidden: true,
    body: 'When a falconer leaves the Mews to fly somewhere else, they cut one jess and knot it to the Leaving Post on the gate road, and the Mews says “cut jesses” after them. It means go and fly. It does not mean do not come back.\n\nThe post is so thick with jesses that from the road it looks feathered. One, near the top, was cut in C. 1030 and never knotted.',
  },
  {
    id: 'lore:hc-falconer-turned-back', name: 'The Two Who Turned', category: 'history', source: 'two skulls on the Windscour Plain', hidden: true,
    body: 'On the night of C. 1012 every herd on the Windscour ran to the Antler Gate to meet a Turning that never came, and died facing it. At the far edge of the last drift lie the only two that did not: a yearling calf that turned for home, and the great stag that came back for it.\n\nThey died later than the rest, side by side, not running. Someone has laid a flat stone between them.',
  },
  {
    id: 'lore:hc-hunt-frontier-ruin', name: 'Kestrel Keep', category: 'history', source: 'a roofless tower on the Hawkmoor', hidden: true,
    body: 'The first mews was a round tower on the open moor, with a thousand nest-holes in its walls and no door at all, only a gap, so that the birds could come and go as they liked. The Mews moved to the cliffs six hundred years ago and took the rule with it.\n\nIt is carved over the gap: “A bird that comes back was never kept.” Wren says it is the only rule the Mews has never voted on.',
  },
  {
    id: 'lore:hc-hunt-frontier-cave', name: 'The Calling Cave', category: 'culture', source: 'calls cut into a windy cave', hidden: true,
    body: 'The wind blows through this cave in long notes, and every Mews falconer is brought here once, as a child, to find the call they will use for the rest of their life. The teacher cuts it into the wall, notch and line, low down, where the child can see it.\n\nThousands of calls cover the walls. No two are the same. A bird, the Mews says, should never have to wonder who is calling.',
  },
  {
    id: 'lore:hc-hunt-frontier-call', name: 'Teodor’s Call', category: 'characters', source: 'a side passage in the Calling Cave', hidden: true,
    body: 'One call in the Calling Cave has been cut six times and scratched out five, each cutting smaller than the last. The boy who made them signed the last one T.T. and wrote under it that Wren said it was a good call, and he was not sure it was his.\n\nThe sixth is still there. It is a good call. The birds on the moor still answer it.',
  },
  {
    id: 'lore:hc-hunt-frontier-view', name: 'The Hawk’s Seat', category: 'places', source: 'a stone seat on the highest tor', hidden: true,
    body: 'Falconers have sat on this tor waiting for their birds for a thousand years, and their waiting has worn the stone into a seat. From it you can see the whole Hawkmoor: the cliffs, the three counting tors, the grey bowl of the Featherfall and the ring on the Moor’s Crown.\n\nCut into the arm of the seat: “Watch the sky. It watches back.”',
  },
  {
    id: 'lore:hc-old-bruin', name: 'Old Bruin', category: 'bestiary', source: 'a board in the mouth of the Bear Cave', hidden: true,
    body: 'For forty summers the Alpha Bear of the Hawkmoor sat on its tor and let the Mews’ young hawks mob it for practice, swatting at them slowly and never once hitting one. The Mews called it Old Bruin and put up a board telling people not to shoot it.\n\nThe last line on the board, in charcoal, says that nobody saw it this spring. The tears found it in its sleep.',
  },
  {
    id: 'lore:hc-grandmother-talon', name: 'Grandmother Talon', category: 'bestiary', source: 'a brass ring on the rim of the Hollow Eyrie', hidden: true,
    body: 'The eldest of the great hawks of the Greywilds, the size of a pony, who has nested above the Featherfall for longer than the Mews has kept its ring-book. Her ring is stamped with the Concord crown and no date.\n\nThe Mews says she calls the birds of the moor home when something is wrong. This year, for the first time, she called them into the dark.',
  },
  {
    id: 'lore:hc-moors-crown', name: 'The Moor’s Crown', category: 'places', source: 'a camp in the stone ring', hidden: true,
    body: 'The ring of standing stones on the highest hill of the Hawkmoor, where the Moor half of the Hunt stone lay for thirty years and would sing for nobody. On Bell night every bird on the moor flew to it and circled it until dawn.\n\nTeodor Tanager camped in the lee of its tallest stone for years, waiting for a bearer, and wrote the same line on his slate every night.',
  },
  {
    id: 'lore:hc-great-lodge', name: 'The Great Lodge', category: 'factions', source: 'Ulric Bannock, reluctantly',
    body: 'The Huntsmen of Antlerford, who keep the herd-roads and the old law of the chase. Every autumn for a thousand years the Lodge has walked the Elkway and counted the herd. The count is kept in a tally book that has never once been thrown away, even in the bad years. Especially in the bad years.',
  },
  {
    id: 'lore:hc-the-mews', name: 'The Mews', category: 'factions', source: 'Mews-Mother Agatha Spurling, between bangs of the gavel',
    body: 'The Falconers of the Hawkmoor, who live on the Mews Cliffs among their birds and hunt as one with them. The Mews council has voted on everything for a thousand years and has never once agreed. Its oldest saying is that a frightened bird is a bird that is paying attention.',
  },
  {
    id: 'lore:hc-trophy-barons', name: 'The Trophy Barons', category: 'factions', source: 'the Tannery Lanes, quietly',
    body: 'The noble hunting families of the Greywilds, who hunt for the wall rather than the table. Since the Hollowing they have grown rich on the herds’ confusion. Their halls are full of heads, and their horses are shod with silver so that they can be heard coming, and so that nobody forgets who is.',
  },
  {
    id: 'lore:hc-old-law', name: 'The Old Law of the Chase', category: 'history', source: 'the Lodge charter, in its case above the hearth',
    body: 'Seven lines, older than the Concord, of which Antlerford still remembers three. Take only what the hunt gives. Take nothing in the calving moon. Count what you leave as well as what you take.\n\nWhoever holds the charter says what is legal in the Greywilds. The Lodge has held it since before there were Barons to want it.',
  },
  {
    id: 'lore:hc-elkway', name: 'The Elkway', category: 'places', source: 'Grandfer Lumm, who remembers',
    body: 'The old herd road through the forest north of Antlerford, marked with antler-cairns from the town to the Antler Gate. When Grandfer Lumm was a boy the herd took three days to cross it. You could hear them in your sleep. You cannot hear anything now.',
  },
  {
    id: 'lore:hc-hawkmoor', name: 'The Hawkmoor', category: 'places', source: 'Swithun Jessop’s post-round',
    body: 'Open moorland under enormous skies, west of the Mews Cliffs, with three high tors where the Mews has counted the wild hawks for a thousand years. Beyond it lie the Windscour Plain, where the herds once ran, and the Featherfall, the valley where sick and old birds come down to die.',
  },
  {
    id: 'lore:hc-hooding', name: 'Hooding', category: 'culture', source: 'Old Wren',
    body: 'A falconer’s hood covers a bird’s eyes, and a hooded bird sits calm, because it cannot see what frightens it. Every falconer hoods a bird sometimes, for travel, for the dark. The Mews teaches that you never hood a bird that is only frightened.\n\nA hooded bird cannot see the black tears. A free one sees them as a colour, and steers round.',
  },
  {
    id: 'lore:hc-great-hunt', name: 'The Great Hunt', category: 'bestiary', source: 'the stories every Lodge child is told',
    body: 'The spirit of the chase itself: an antlered beast of light that runs at the head of the herds, and that the Lodge hounds once ran beside. When it lost its path in the Hollowing it was hollowed, and its antlers ran black like a candle smoking. It circles the Antler Gate at the head of a hollow herd, trampling anything that moves.',
  },
  {
    id: 'lore:hc-first-letter', name: 'Osric Fallow’s Letter', category: 'books', source: 'a letter from the snare-tree, C. 1013', hidden: true,
    body: '“The herd did not come down the road this year. They came through the trees in a rabble, lost. The cairns on the Elkway are down, every one, and there are cart tracks where they stood. I mean to go into the Snares and see who drives the carts.”\n\nThe Elkway warden never came home. His letter is the first record of the herds leaving their roads.',
  },
  {
    id: 'lore:hc-herd-bones', name: 'The Bones of the Windscour', category: 'history', source: 'Ma Ketterick, who reads them',
    body: 'Every skeleton on the Windscour Plain faces the Antler Gate, and every one died running, on the same winter night in C. 1012. The herds ran to meet a Turning, the way they always had. There was nothing at the gate. They kept running until they dropped.',
  },
  {
    id: 'lore:hc-ulric-bannock', name: 'Ulric Bannock', category: 'characters', source: 'Antlerford, fondly',
    body: 'Master of the Great Lodge: enormous, soft-spoken and painfully shy, who has counted the herd for fifty autumns and watched the count fall for thirty. No glover in Antlerford has ever managed to measure his hands. His deerhound, Biscuit, has never caught anything.',
  },
  {
    id: 'lore:hc-corva-ashby', name: 'Lady Corva Ashby', category: 'characters', source: 'Antlerford, carefully',
    body: 'The richest of the Trophy Barons. She hunts alone and pays every bill on the day it falls due. She has never missed a shot, and she says that she would rather have missed once and known what it felt like. Her gamekeeper says she weeps after every kill.',
  },
  {
    id: 'lore:hc-old-wren', name: 'Old Wren', category: 'characters', source: 'the Mews',
    body: 'The eldest falconer of the Mews, half blind, who sees through the eyes of her kestrel Pibb. She has taught half the Mews to fly their first bird, and she laughs at nearly everything. She has never hooded a bird that was only frightened.',
  },
  {
    id: 'lore:hc-hooded-man', name: 'The Hooded Man', category: 'characters', source: 'the Mews, and the quiet steadings',
    body: 'Teodor Tanager, Old Wren’s last apprentice, who left the Mews in the night in C. 1030. He was the gentlest falconer she ever taught, and frightened of everything. He learned to hood the black tears and lay them over minds, and nobody he hoods is ever afraid again. His own hood is wet on the inside.',
  },
  {
    id: 'lore:hc-hunt-hollis-lodge', name: 'Hollis Lodge', category: 'places', source: 'Thaddeus Hollis',
    body: 'The last Hunt lodge in Concordia, in the Gloamwood east of Brindlecross, kept by the Hollis family since before the arches shut. Maren Hollis was raised here. For thirty years there has been nobody left at the lodge who could teach the old law, and its hunters have hunted by guesswork.',
  },
  {
    id: 'lore:hc-hunt-cormorant-fishers', name: 'The Cormorant Fishers', category: 'culture', source: 'Prudence Gannet',
    body: 'A few Hawkmoor folk, stranded in Concordia since the Turning fair of C. 1011, who fish the Wend with cormorants from flat boats under Tamsin Reed’s ferry. They have never hooded a bird. A bird that is made to fish, they say, brings you the small ones.',
  },
  {
    id: 'lore:hc-hunt-barons-list', name: 'The Baron’s List', category: 'history', source: 'a sheet of heavy paper at the Gloamwood roots', hidden: true,
    body: 'The twelve Sentinels of the Turning Road, in a careful, flourishing hand, each with a bounty written beside it, and the seal of the Hollow King at the foot. Under the second name, in Corva Ashby’s own writing: “It is easier to aim when someone else is holding you still.”',
  },
  {
    id: 'lore:hc-sentinel-stag', name: 'The White Stag', category: 'bestiary', source: 'its own silence, and the margins of Ysolde’s chronicle',
    body: 'The Sentinel of the Hunt school: the Stag the Turning procession followed through the Gloamwood every twelve years for a thousand years. It waited at a worn stone in the deep glade for the crown to come. When the crown stopped coming it waited anyway, and wept, and the wood sickened with its tears. It is not sick, Nan Briar says. It is grieving.',
  },
];

export default entries;
