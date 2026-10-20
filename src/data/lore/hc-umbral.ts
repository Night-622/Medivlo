/** Hollow Crown codex: Nocturne (Umbral), shared by the Duskweaver and Shade campaigns. Owner: Claude 4. */
import type { LoreEntry } from '@/core';

const entries: LoreEntry[] = [
  // ---------- the realm
  {
    id: 'lore:hc-nocturne', name: 'Nocturne', category: 'realms', source: 'a Duskmere primer, annotated in several hands',
    body: 'A realm of endless dusk, where the sun is always just gone and the moon is always about to rise. The Umbral school teaches that a shadow is a memory the light left behind. Duskweavers keep the realm’s memories in the Moon Obelisk at Duskmere; Shades work in the shadows they keep, down in the Veilwarrens.\n\nSince the Hollowing the Obelisk has leaked. Nocturne is forgetting. Old people forget their names, children forget their parents, and shadows wander off on their own.',
  },
  {
    id: 'lore:hc-kept-names', name: 'Kept Names', category: 'culture', source: 'Loremistress Nyx Aubade, eventually',
    body: 'Everyone in Nocturne has two names: the one they use, and the one they keep in the Obelisk. The used name is for the world. The kept name is for the people who will remember you after you have forgotten yourself. A Nocturne wedding is the swapping of kept names, so that each has the other’s. To tell someone your kept name is the greatest trust there is.',
  },
  {
    id: 'lore:hc-moon-obelisk', name: 'The Moon Obelisk', category: 'places', source: 'the lower register, page two',
    body: 'A tall black stone at the heart of Duskmere, banded with iron and taller than any building in the city, where every memory in Nocturne is kept. The Obelisk half of the Umbral stone lay at its foot for thirty years, in the one shadow the moon has never seen. Without the whole stone the Obelisk leaks, like a bucket with no bottom.',
  },
  {
    id: 'lore:hc-obelisk-keepers', name: 'The Obelisk Keepers', category: 'factions', source: 'the Keepers’ oldest law',
    body: 'The Duskweavers of Duskmere, memory-mages who keep the Obelisk and its registers. Their oldest law is that nothing kept may be unkept. Their Loremistress cannot remember anyone’s name; their Mnemosarch remembers everyone’s.',
  },
  {
    id: 'lore:hc-memory-gardens', name: 'The Memory Gardens', category: 'places', source: 'Marigold Thrupp, head gardener',
    body: 'Gardens below the Obelisk where memories grow as pale flowers, each bed belonging to somebody. Cut a flower and its person forgets. Plant a memory in moonlight and it burns; plant it in moonshade, the shade the moon throws, and it keeps. “Mind the beds,” says Marigold. “Every one of those is somebody.”',
  },
  {
    id: 'lore:hc-duskblade-cult', name: 'The Duskblade Cult', category: 'factions', source: 'a price tag, tied to nothing',
    body: 'Memory-thieves who cut pasts out of the Memory Gardens and sell them to people who would rather have someone else’s: “First kiss, very good, 40 shards.” “Being somebody’s favourite, 60.” They sell most in the Veilwarrens, where people forget fastest and own least.',
  },
  {
    id: 'lore:hc-lamp-shadows', name: 'The Lamp-Post Shadows', category: 'places', source: 'Old Ambrose Hewlett, vindicated',
    body: 'Duskmere had lamp-posts once, all down the Lanternless Streets, before the Keepers melted them down for the Obelisk’s new bands. When the moon is up their shadows still stand in a row, curly at the top, each throwing the shadow of a little lamp. Old Ambrose has swept round them for thirty years, and everybody has very kindly humoured him.',
  },
  {
    id: 'lore:hc-twelve-champions', name: 'The Twelve, C. 0', category: 'history', source: 'the oldest bottle in the Archive of Shadows',
    body: 'A bottle in the east stacks of the Archive, never opened, labelled with a date: C. 0. Inside, twelve shadows stand in a ring, each with a hand on the next one’s shoulder, as if they had just finished swearing something: the champions at the signing of the Concord. One of them, on the far side, has reached across the middle of the ring, where there is nobody, as if to hold the hand of someone who is not there.',
  },
  {
    id: 'lore:hc-the-rest', name: 'The Rest', category: 'culture', source: 'a margin of the lower register',
    body: 'The first page of the Obelisk’s register is blank on purpose. In the margin the first Keepers wrote: “A rest, for what should be let go.” Like a rest in music, it is a space where nothing is played, so that you can hear what came before. They kept a bed in the Memory Gardens for the same reason. Later Keepers filled it with roses.',
  },
  {
    id: 'lore:hc-mnemosarchs-city', name: 'The Shadow City', category: 'history', source: 'behind the fourteenth shelf', hidden: true,
    body: 'Behind a shelf that is not on any plan of the Archive, Oriel Vane built Duskmere again in shadow on a table forty feet long: every street, every bed in the Gardens, every window, with tiny figures moving in them. Every memory he took from the queue is there. The phials he handed back were perfect copies. You cannot copy a smell.',
  },
  {
    id: 'lore:hc-eclipse-queen', name: 'The Eclipse Queen', category: 'characters', source: 'the Dusk Gate',
    body: 'Nocturne’s ancient ruler, who sat down on the Dusk Gate and began to swallow the moon, so that nothing more could be forgotten by its light. Her eclipse was a disc of black tears. Under it she was an old woman in a crown of night, who had forgotten her own name first.',
  },
  // ---------- depth pass: codex finds (Duskmere, the long dusk road, Claude 2's optional areas)
  {
    id: 'lore:hc-umbral-road-lamp', name: 'The Leaving Lantern', category: 'culture', source: 'a paper lantern on the last lamp-shadow', hidden: true,
    body: 'When anyone leaves Duskmere for good, or for long, their street hangs a paper lantern on the last lamp-post on the long dusk road, so that they can find the way back. The posts were melted down thirty years ago. The street goes on hanging the lanterns on the shadows the posts left behind, which hold them perfectly well, nobody quite knows how.',
  },
  {
    id: 'lore:hc-umbral-capital-ruin', name: 'The First Obelisk', category: 'history', source: 'a carved stump in a ring of stones', hidden: true,
    body: 'Before the Moon Obelisk there was a smaller one, cut by the first Keepers, who believed that a thing could only be safely forgotten once it had been properly kept. WHAT WE KEEP, WE KEEP SO THAT WE MAY LET IT GO. It cracked in a hard winter and was left where it fell. The Keepers have argued for six hundred years about the second half of the sentence.',
  },
  {
    id: 'lore:hc-umbral-capital-cave', name: 'The Echo-Well', category: 'places', source: 'a pool at the bottom of a cave below Duskmere', hidden: true,
    body: 'A pool that gives back whatever is said into it, in the voice of the last person who said it there. Duskmere folk come to hear the voices of people they have lost, which is why the Keepers have tried three times to fill it in. It will not stay filled. Somebody always comes back down with a shovel and a reason.',
  },
  {
    id: 'lore:hc-umbral-capital-list', name: 'Things Said Once', category: 'culture', source: 'a list scratched above the Echo-Well', hidden: true,
    body: 'In Nocturne a thing said aloud once is said, and does not need to be remembered after. People come to the Echo-Well to say the things they cannot carry: apologies, confessions, the truth about the cake. Then they let the well keep them. The list on the wall is the Keepers’ one concession to writing any of it down.',
  },
  {
    id: 'lore:hc-umbral-capital-view', name: 'The Moonward Steps', category: 'places', source: 'paint on the top step', hidden: true,
    body: 'The highest steps in Duskmere, built so that the Keepers could see the Moon Obelisk and the moon together. For thirty years every bottled shadow in the city has faced the Obelisk from here like a field of sunflowers. The painted YOU ARE HERE is the work of the Lanternless Streets’ unofficial sign-painter, whose other signs mostly say PROBABLY.',
  },
  // ---------- lair codexes
  {
    id: 'lore:hc-umbral-cult-prices', name: 'The Cult’s Price-List', category: 'factions', source: 'a chalkboard in the Duskblade undercroft', hidden: true,
    body: 'The Duskblade Cult sold cut memories like flowers, by the stem, priced by how sweet they smelled. Courage sold dear. First kisses sold steady. Grief could not be given away, and the Cult’s board lists it, at the bottom, under WILL TAKE FOR FREE. Business, the florist told her customers, was in other people’s good days.',
  },
  {
    id: 'lore:hc-umbral-paper-rota', name: 'The Paper-Hangers’ Rota', category: 'culture', source: 'a rota by the Hall of Lost Names door', hidden: true,
    body: 'Every name nobody says any more is written on a paper and pasted in the Hall of Lost Names, so that it is somewhere. The Keepers take turns to read a wall aloud each evening, so the names are said at least once a year. For thirty years the rota has been short of readers, and whole walls have gone unread. The papers there went blank first.',
  },
  {
    id: 'lore:hc-umbral-first-phial', name: 'The First Phial', category: 'characters', source: 'a phial in the Obelisk’s shadow', hidden: true,
    body: 'A glass phial, older than the rest, labelled in a boy’s careful hand: “Mother’s face. Found in the queue. Original. Not to be returned.” Oriel Vane lost his mother’s face when he was six, found it years later in the Obelisk, and kept it, and has carried it in his coat ever since. It is the only phial he has never copied.',
  },
  // ---------- depth pass: codex finds (the Veilwarrens, Claude 2's optional areas)
  {
    id: 'lore:hc-umbral-frontier-ruin', name: 'The Counting-House', category: 'history', source: 'a roofless building in the warren rock', hidden: true,
    body: 'The Concord counted Nocturne by shadows: every shadow a soul, and every soul a share of the tax. Its counting-house in the warrens kept the rolls, until the winter the Veil’s founder walked in with no shadow and walked out with all of them. The Concord never built another. The painted outline on the floor is redone every year by somebody nobody has ever seen.',
  },
  {
    id: 'lore:hc-umbral-frontier-cave', name: 'The Hiding-Hole', category: 'places', source: 'a hook-lined cave behind the silk', hidden: true,
    body: 'Where the Veil kept the shadows it lifted from families hiding from the tax-men, each on its own hook, until the census men had gone and the family came back for it. A lifted shadow left too long goes thin, and then goes to sleep, and does not wake for anybody but its own person.',
  },
  {
    id: 'lore:hc-umbral-frontier-tally', name: 'The Hook-Tally', category: 'characters', source: 'chalk on the Hiding-Hole wall', hidden: true,
    body: 'The Veil chalked every shadow it hid, IN and OUT. The last seven lines, from the year the crown fell, have no OUT: seven families who never came back for theirs. Grizel Gall, Thief-mother before Mab, would not let the hooks be cleared. “Keep them anyway.” Mab has kept them for thirty years and does not go into the cave.',
  },
  {
    id: 'lore:hc-umbral-frontier-view', name: 'The Top Rung', category: 'places', source: 'the highest ladder in the warrens', hidden: true,
    body: 'The one place in the Veilwarrens where the rock opens onto sky. Young Shades are brought up the ladder on their first night in the Veil and shown the whole warren lit below them, every lantern and every shadow, and told: all of this is ours to keep safe. Mab brought the hero up it at five, and they were sick on the way down.',
  },
  // ---------- lair codexes
  {
    id: 'lore:hc-umbral-lantern-tithe', name: 'The Lantern-Tithe', category: 'culture', source: 'a stone in the Stalker’s Den', hidden: true,
    body: 'The Moon Stalker hunts by shadow, and for longer than the Veil has kept a ledger the moor folds paid it in lanterns: one left lit at the den mouth each moonless night, so it would take the lantern’s shadow and leave the flock’s. The tithe lapsed in the hungry years after the crown fell, when nobody had oil to spare. For years it did not seem to matter. Then the Bell rang, and the Stalker came up out of its den hollow and hungry, and there was no lantern lit.',
  },
  {
    id: 'lore:hc-umbral-rule-slate', name: 'The Cutters’ Four Rules', category: 'culture', source: 'a slate in the Brood Spire', hidden: true,
    body: 'The silk-cutters of the Webbed Deeps work by four rules, cut into slates at every turn of the climb. The fourth, Nobody goes up for anybody, is the one that has kept the cutters alive for three hundred years, and the one every Cutter-Mother has broken at least once, alone, and told nobody.',
  },
  {
    id: 'lore:hc-umbral-veil-oath', name: 'The Veil’s Oath', category: 'factions', source: 'the wall of the Veil Heart', hidden: true,
    body: 'WHAT WE LIFT, WE KEEP SAFE. WHAT WE KEEP, WE GIVE BACK WARM. Every Thief-mother of the Veil leaves her hand on the Heart’s wall in lamp-black when she takes the chair. The first print has no name under it, because its owner had given hers away. Mab’s is the smallest on the wall by a good inch, and she will fight anyone who says so.',
  },
  // ---------- the Veilwarrens
  {
    id: 'lore:hc-the-veil', name: 'The Veil', category: 'factions', source: 'Grey Mab, in a good mood',
    body: 'The Shades’ guild of the Veilwarrens, a slum-maze of tunnels and rope bridges. In the Concord’s days the Veil’s trade was hiding people from the tax-men: they would lift a family’s shadows and keep them safe, and nobody can count a person with no shadow. Now the Veil picks pockets, and keeps a ledger of every job, and every Shade signs it.',
  },
  {
    id: 'lore:hc-stalker-moors', name: 'The Stalker Moors', category: 'places', source: 'Bryn Tallow, shepherd',
    body: 'Purple moorland above the Veilwarrens, reached by a very long ladder, where the moon comes up enormous over the edge and Moon Stalkers hunt. A Moon Stalker hunts by shadow: it sees the shadow and pounces where it falls. It cannot see anyone who casts none, though it can smell them.',
  },
  {
    id: 'lore:hc-moonwell', name: 'The Moonwell', category: 'places', source: 'Twig, of Twig and Moss',
    body: 'An open shaft in the middle of the warrens, the only place below ground where the moon can be seen: a coin of light at the end of a long pipe, the size of a button. The warrens’ only market is at the bottom. Most children born there have never seen the moon any other way.',
  },
  {
    id: 'lore:hc-veil-whistles', name: 'The Veil’s Whistles', category: 'culture', source: 'Silvan Hollowell, echo-trader',
    body: 'The warrens talk in whistles from bridge to bridge. Short-short-long: come quick. Long-long: all clear. Two shorts and a trill: Mab is coming, look busy. The last is the one most used. Echo-traders bottle the best of them and sell them up the tunnels, along with dropped pins, cathedral bells and lovers calling your name.',
  },
  {
    id: 'lore:hc-unshadowed', name: 'The Cairn of the Unshadowed', category: 'history', source: 'the founder’s stone',
    body: 'A long cairn on the high moor where the Veil buried the Shades who lost their shadows and never got them back. Each stone is scratched with a name and nothing else, except the oldest: “HERE LIES THE UNLISTED. The first of the Veil lost her shadow and went on anyway. Shadows keep what we put down. We can pick it up again.”',
  },
  // ---------- characters
  {
    id: 'lore:hc-nyx-aubade', name: 'Loremistress Nyx Aubade', category: 'characters', source: 'Duskmere, fondly, and mostly by the wrong name',
    body: 'Keeper of the Moon Obelisk, who likes everyone and remembers almost nobody. She apologises beautifully. She calls her pupils by a different wrong name every time, until the day she trusts them, and then never again. She had a younger sister once, grey-eyed and frightfully rude, who ran away to the warrens forty years ago.',
  },
  {
    id: 'lore:hc-oriel-vane', name: 'Oriel Vane, the Mnemosarch', category: 'characters', source: 'the Obelisk queue',
    body: 'The Mnemosarch of the Obelisk, who runs the queue of people waiting to remember. He pours them tea and hands their memories back in little glass phials. He is the only person in Duskmere who gets everyone’s name right first time. He has not forgotten anything since he was a boy, and he finds that he cannot bear the idea.',
  },
  {
    id: 'lore:hc-grey-mab', name: 'Grey Mab', category: 'characters', source: 'the Veilwarrens, quietly',
    body: 'Thief-mother of the Veil: ancient, tiny and terrifying. She trusts nobody above wary on principle. Forty years ago she ran away from Duskmere after a quarrel with her elder sister, and she has never once said what it was about. Her name in Duskmere was Mabyn. Nobody calls her that and lives.',
  },
  {
    id: 'lore:hc-shadow-that-left', name: 'The Shadow That Left', category: 'characters', source: 'the Veil’s ledger, in your handwriting',
    body: 'On the night of the Bell a Shade’s shadow stood up off the third bridge, bowed, and walked away. It is charming and sorry and glad to see you. It knows every story you tried to forget. The black tears found it on the bridge and filled it in, and gave it weight, and now it would like a turn in the light.',
  },
  // ---------- Concordia
  {
    id: 'lore:hc-duskweaver-sextons-register', name: 'The Sexton’s Register', category: 'places', source: 'Old Hobb’s lych-gate box',
    body: 'Old Hobb of Brindlecross keeps the names of every Umbral soul in Concordia, the living and the buried, in a register wrapped in oilcloth. Its last page lists the Turning songs, and the date someone in Brindlecross last remembered each one’s second verse. The dates are getting closer together.',
  },
  {
    id: 'lore:hc-umbral-spinner', name: 'The Spinner Below', category: 'bestiary', source: 'the last of its web',
    body: 'The Sentinel of the Umbral school: the memory-spider who wove the Concord’s records into the dark under the Gloamwood, every Turning and every name and every shadow. When the tears came it began to unweave them, thread by thread, because they were too sad to keep. At the end it asked only that someone remember one Turning for it, so that it would be somewhere.',
  },
  {
    id: 'lore:hc-duskweaver-lights', name: 'The Drowned Lights', category: 'bestiary', source: 'Tabitha Cresset, lampwright of Lanternford',
    body: 'The lights the Lantern Queen sends out over Morvane Marsh to lead travellers into the water. Every one holds the last thing a traveller saw before the water closed over them; that is why they shine. Oriel Vane bought them by the jar at Lanternford, to light the windows of a shadow Brindlecross.',
  },
  {
    id: 'lore:hc-umbral-drowned-rat', name: 'The Drowned Rat', category: 'places', source: 'Constance Gentle, who will deny it',
    body: 'A tavern at the Old Coach Inn on the Morvane Road. The front room is for drinking. The back room is for the Veil’s Concordia cousins, stranded since the arches shut, who play cards with marked cards because it saves time, and hide family on the road when asked.',
  },
  {
    id: 'lore:hc-shade-willow', name: 'The Deepest Shade in Morvane', category: 'bestiary', source: 'a Shade, standing in it',
    body: 'The Weeping Willow, the Sentinel of the Verdant school, throws the deepest shade in Morvane at Stag’s Rest. A shadow that left its person sheltered there, while the Hollow King’s tailors made of tears fitted it for a Herald’s robe. A person with no shadow casts nothing in her shade at all, and that, for once, is no different from anyone else.',
  },
];

export default entries;
