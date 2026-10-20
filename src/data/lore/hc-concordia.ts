/** Hollow Crown codex: the world basics and Concordia (docs/lore/hollow-crown/01, 04). Owner: Claude 4. */
import type { LoreEntry } from '@/core';

const npc = (slug: string, name: string, body: string, source = 'Brindlecross gossip, collected at the Gilded Goose'): LoreEntry =>
  ({ id: `lore:hc-${slug}`, name, category: 'characters', source, body });

const entries: LoreEntry[] = [
  // ---------- the world
  {
    id: 'lore:hc-the-concord', name: 'The Concord', category: 'history', source: 'Ysolde Fenn, notes for a history nobody asked for',
    body: 'A thousand years ago the twelve schools were at war, each sure its note was the true one. The war ended on a hill in Concordia, where twelve champions swore the Concord.\n\nEach school gave a Concord Stone, a crystal of its note, and the twelve were set in one crown. Every twelve years the crown passed to the next school’s champion, the Concordant, and the Turning Bell rang once to tell the world.\n\nIt held for eighty-four Turnings. Then, in C. 1012, it did not.',
  },
  {
    id: 'lore:hc-first-chord', name: 'The First Chord', category: 'cosmology', source: 'as the schools tell it, and argue about',
    body: 'In the beginning the world was one song. When it grew too large for one song, the Chord broke into twelve notes, six magics and six crafts. Those who heard a note most clearly gathered round it and became a school, and the land round each school took on the colour of its note.\n\nOnly at the centre, where all twelve could still be heard faintly together, did the land stay green and ordinary. That is Concordia.\n\nThe Duskweavers say the Chord did not break. It was broken.',
  },
  {
    id: 'lore:hc-schools', name: 'The Twelve Schools', category: 'schools', source: 'a child’s counting rhyme from Brindlecross',
    body: 'Six that burn and freeze and strike, shine and shadow, grow alike: Ash, Rime, Storm, Radiance, Umbral and Verdant.\n\nSix of edge and wall and hand, chase and angle, voice and band: Blade, Iron, Fist, Hunt, Guile and Song.\n\nTwo classes keep each school, one in its capital and one on its frontier. Folk born with no school’s spark at all are called Unsung. It is rare, and in Concordia it is pitied, which the Unsung do not much enjoy.',
  },
  {
    id: 'lore:hc-black-tears', name: 'The Black Tears', category: 'magic', source: 'Nan Briar, who charges for this',
    body: 'The black tears are grief made solid, the way sap goes hard on a cut tree. Whatever they touch is hollowed: emptied, docile, drawn towards whoever wears the crown.\n\nA hollowed creature is not wicked. It is empty, and it goes looking for something to fill it. That is why the Hollow King’s armies are made of the lonely.\n\nThe tears do not burn, cut, rot or echo. They are older than the Hollowing. “The crown always held the schools’ grief, dear. Somebody stopped singing over it.”',
  },
  {
    id: 'lore:hc-hollow-king', name: 'The Hollow King', category: 'characters', source: 'what Concordia says in daylight', hidden: true,
    body: 'In C. 1012 the crown should have passed from Iron to Fist. Instead the steward of the Citadel put it on, out of turn. The stones would not sing for him, so he pried them out, and the empty crown began to weep. He has sat in the Concord Citadel at the Heart of Morvane ever since.\n\nNobody in Brindlecross says his name. Elder Godric knows it.',
  },
  // ---------- Concordia
  {
    id: 'lore:hc-concordia', name: 'Concordia', category: 'realms', source: 'Sela Moth’s map, the margins',
    body: 'The union at the centre of the ring. All twelve schools live here together, and since the arches shut they have had no choice. Its land is Morvane: the green moor of Aldermoor and Brindlecross, the Gloamwood, Briar Hollow, the Drowned Abbey, the Ashfall Kiln, the Frostmere Pass, the Gilded Ruins, the Stormcliffs and the Morvane Marsh.\n\nAt the centre is the Heart of Morvane, where the tears began, and the Concord Citadel, where the crown is.',
  },
  {
    id: 'lore:hc-gate-circle', name: 'The Gate Circle', category: 'places', source: 'Maren Hollis, who has watched it for years',
    body: 'Twelve stone arches in a ring on the moor above Brindlecross, one for each school, each carved with its mark. Every realm gate opens onto one of them. They have been dark and weeping since C. 1012.\n\nThey are starting to light again, one at a time, and people are walking out of them.',
  },
  {
    id: 'lore:hc-gloamwood', name: 'The Gloamwood', category: 'places', source: 'Maren Hollis',
    body: 'Old forest, teal and glowing at night. The wolves come from here, and so does the White Stag, which the Turning processions once followed along the old paved road through the trees. The road is still there, under the moss.',
  },
  {
    id: 'lore:hc-turning-bell', name: 'The Turning Bell', category: 'history', source: 'Brother Aldous',
    body: 'The bell of the hill chapel where the Concord was sworn. The chapel became the Abbey, and the Bell rang once at every Turning, heard in all twelve realms.\n\nIn C. 1012 it began to ring by itself and would not stop. Abbess Morwen took the rope and held it, and the lake rose over the Abbey in one night. She is holding it still. She will not let it be rung out of turn.\n\nIt rang again this year, once, out of turn. Nobody knows who rang it.',
  },
  {
    id: 'lore:hc-drowned-choir', name: 'The Drowned Choir', category: 'places', source: 'Tamsin Reed, who will never trail her hand again',
    body: 'The monks of the Abbey went down with it, still singing. At night they swim up the Wend in a slow line and back down to the Bell. They are not hollow, exactly. They are waiting for a reason to sing it.',
  },
  {
    id: 'lore:hc-bearers', name: 'The Bearers', category: 'history', source: 'Ysolde Fenn, the Stone Court ledger',
    body: 'When the stones fled the crown, each cracked in two and fell in two corners of its realm. A half-stone will not leave its rest or sing for anyone but its bearer.\n\nThe night the Bell rang, twenty-four people woke with a half-stone’s song in their chests, two in every realm. Now they are coming through the arches, one by one, to the Stone Court.',
  },
  {
    id: 'lore:hc-sentinels', name: 'The Sentinels of the Turning Road', category: 'history', source: 'the Concord charter, Ysolde’s copy',
    body: 'Each school kept an embassy in Concordia and a Sentinel: a great guardian that escorted the crown along the Turning Road to the next school. When the crown was emptied the Sentinels were the first things the tears touched.\n\nThey are hollowed now, and each guards its school’s old embassy: Ashmaw, the Rimeheart Colossus, the Stormcrow, Abbess Morwen, the Spinner Below, the Weeping Willow, Bonelord Varric, the Gilded Engine, the Ooze Sovereign, the White Stag and the Lantern Queen. Morwen serves two schools, Radiance and Song.\n\nA bearer who would stand at the Citadel’s door must carry their school’s Sentinel mark.',
  },
  {
    id: 'lore:hc-weeping-wall', name: 'The Weeping Wall', category: 'places', source: 'seen from Abbeyshore',
    body: 'A curtain of black tears round the Heart of Morvane, falling forever and never reaching the ground. It parts only when the Turning Bell rings for a true Turning. It has parted.',
  },
  {
    id: 'lore:hc-hollow-iron', name: 'Hollow Iron', category: 'magic', source: 'Odo Vance, at the anvil',
    body: 'Iron touched by the tears rings two notes at once, as if it remembers being something else. The best of it rings like the old Gilded Engine that made the crown’s settings, which were made to hold song and grief both.',
  },
  {
    id: 'lore:hc-varric', name: 'Bonelord Varric', category: 'characters', source: 'Old Hobb',
    body: 'The first Concord duellist, who ended the Schools’ War in single combat and was buried under the moor with honour. His barrow has a door again, and the dead of Brindlecross are walking to it at night. The Hollowed walk home. Varric seems to think they should walk to him.',
  },
  {
    id: 'lore:hc-concord-coin', name: 'A Concord Coin', category: 'history', source: 'found at the bottom of a well, with help',
    body: 'An old coin, stamped with twelve marks in a ring and a crown in the middle. Before C. 1012 it was good in every realm. Pip says it is lucky. Pip says that about everything.',
  },
  {
    id: 'lore:hc-waystones', name: 'Waystones', category: 'magic', source: 'Sela Moth',
    body: 'Standing stones on the old roads of Morvane, from the days when the realms were open. Wake one with your hand and a little attention, and it will remember you and send you back. The stones hum before a storm. They are humming now.',
  },
  // ---------- the Brindlecross fourteen (unlocked on first talk via NpcDef.lore)
  npc('maren', 'Maren Hollis', 'The best tracker in Aldermoor. She wears the pelt of the first Gloamwood wolf that came back wrong, and she has been hunting the reason ever since. Her mother carried a stone into the Heart in C. 1012.'),
  npc('godric', 'Elder Godric', 'Elder of Brindlecross for twenty winters. He remembers the Abbey bells, distrusts magic and relies on it anyway. He was a Citadel guard once, which he mentions to nobody.'),
  npc('nan-briar', 'Nan Briar', 'Nobody remembers Nan Briar being young. Her cat is called Parson. She knows more about the White Stag than she will say, and she charges for what she does say.'),
  npc('odo', 'Odo Vance', 'Odo forged half the militia’s blades and mended the rest. Iron from Hollowed armour rings wrong on his anvil, and he can’t stop thinking about it.'),
  npc('wil', 'Wil Crane', 'Keeper of the Gilded Goose. Wil hears everything that happens in Brindlecross, usually before it happens. A night at the Goose restores you fully.'),
  npc('pell', 'Pell Odd', 'Pell carries his whole shop on his back and sets it down wherever there is a crowd. His prices change with your face. Some of his stock is real Sparkforged gear.'),
  npc('aldous', 'Brother Aldous', 'Aldous was a novice when the Abbey sank, and the only one who swam out. He still carries his prayer book, and the water stains have never dried.'),
  npc('rook', 'Captain Rook Harrow', 'Rook commands eleven farmers and a halberd. She lost an eye to a Hollowed in spring and says the scar improved her looks.'),
  npc('tamsin', 'Tamsin Reed', 'Tamsin poles travellers across the Wend for a copper and a story. Lately she has been seeing pale shapes under the water, heading downstream toward the Abbey.'),
  npc('hobb', 'Old Hobb', 'Hobb has buried most of Brindlecross and knows exactly where. Three of his graves were empty this week.'),
  npc('ysolde', 'Ysolde Fenn', 'Ysolde keeps every record Brindlecross has ever written, and several it would rather forget. She found the White Stag drawn in the margins of a book three hundred years old.'),
  npc('pip', 'Pip', 'Pip has decided to be your squire and will not hear otherwise. He has a wooden sword, a lucky stone and an extremely good memory for things adults say when they think he is not listening.'),
  npc('corwin', 'Corwin Hale', 'Corwin’s mill burned down the night the wolves first came. He is rebuilding it plank by plank, and he once gave the old hearth-beam to an Arcanist who asked nicely.'),
  npc('sela', 'Sela Moth', 'Sela walks the old roads of Morvane, waking the waystones one by one. Each one she lights shows on your map and lets you travel back to it.'),
];

export default entries;
