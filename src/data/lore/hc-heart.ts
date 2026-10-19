/** Hollow Crown codex: the Heart of Morvane and the truth of the Hollow King (Act III). Owner: Claude 4. */
import type { LoreEntry } from '@/core';

const entries: LoreEntry[] = [
  {
    id: 'lore:hc-heart', name: 'The Heart of Morvane', category: 'places', source: 'seen at last',
    body: 'Where the black tears began. Behind the Weeping Wall: the Legion camp, the Twelve Stairs and the Concord Citadel, where the empty crown hangs above the throne in a cage of its own tears.',
  },
  {
    id: 'lore:hc-hollow-legion', name: 'The Hollow Legion', category: 'factions', source: 'the camp across the Citadel road',
    body: 'Everyone who walked into the Heart in thirty years: bearers of C. 1012, wanderers, the lonely and the brave. They stand in ranks and weep, and they turn towards a half-stone like flowers towards the sun. They are not wicked. They are waiting to be told they can stop.',
  },
  {
    id: 'lore:hc-twelve-stairs', name: 'The Twelve Stairs', category: 'places', source: 'the processional way',
    body: 'Twelve stairs to the Citadel, one for each school, each hung with that school’s banner. At every Turning the champion of the next school climbed theirs, and the twelve stairs met at the top.',
  },
  {
    id: 'lore:hc-concord-citadel', name: 'The Concord Citadel', category: 'places', source: 'carved over its door',
    body: 'Built in four years after the Concord was sworn, so that the first Concordant could be crowned in C. 4. The throne-room door is carved with all twelve schools’ marks, and it opens at a touch.',
  },
  {
    id: 'lore:hc-black-concord', name: 'The Black Concord', category: 'bestiary', source: 'the throne room',
    body: 'The crown’s twelve empty settings, forged by the Gilded Engine into a war-engine and fed thirty years of tears. It was the Hollow King’s guard, and it never once asked him what it was guarding.',
  },
  {
    id: 'lore:hc-casimir', name: 'Casimir of Concordia', category: 'characters', source: 'Elder Godric, and the man himself', hidden: true,
    body: 'Born in the Citadel in C. 984 to a Cantor of Radiance and a Bard of Song, and Unsung. Taught by masters of every school, he mastered none. He did not want power. He wanted to hear the Chord, just once.\n\nThe black tears are his. He has wept them for thirty years, and he could not stop.',
  },
  {
    id: 'lore:hc-what-godric-saw', name: 'What Godric Saw', category: 'history', source: 'Elder Godric, at last', hidden: true,
    body: 'On the night of the 85th Turning a nineteen-year-old guard stood at the throne-room door. He saw the steward weep before he ever touched the crown, and hold it to his ear like a shell. Then he put it on, and when it was silent, he screamed.',
  },
  {
    id: 'lore:hc-thirteenth-note', name: 'The Thirteenth Note', category: 'cosmology', source: 'Ysolde Fenn, revised', hidden: true,
    body: 'Concordia never had a school, and some are born in every realm with no spark at all. Ysolde Fenn’s last chronicle suggests that the Unsung were never missing a note. They are the rest between the notes: the thirteenth note, Concordia’s own.',
  },
];

export default entries;
