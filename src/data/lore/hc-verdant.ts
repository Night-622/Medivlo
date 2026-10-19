/** Hollow Crown codex: Wildheart (Verdant), shared by the Hedgewitch and Ranger campaigns. Owner: Claude 4. */
import type { LoreEntry } from '@/core';

const entries: LoreEntry[] = [
  {
    id: 'lore:hc-wildheart', name: 'Wildheart', category: 'realms', source: 'a Rootholme primer, slightly sticky',
    body: 'Overgrown and loud with life, the realm of the Verdant school. The Verdant hold that growth and rot are one thing seen from two ends. Rootholme is built inside a single tree. Hedgewitches tend it, Rangers walk the wilds, and everyone argues about compost.\n\nSince the Hollowing, growth has lost its brakes. The Elder Tree grows a ring a day and swallows streets, and in the Thornwilds a grey blight spreads wherever the black tears touch.',
  },
  // ---------- depth pass: Rootholme codex finds (the Root Road, the side quests, Claude 2's optional areas, the lairs)
  {
    id: 'lore:hc-hedgewitch-leaving-hazel', name: 'The Leaving Hazel', category: 'culture', source: 'an old hazel on the Root Road', hidden: true,
    body: 'Every witch who leaves Rootholme ties a strip of her apron to the hazel on the Root Road, so that the tree will remember who went and wait for them to come back. A strip that is untied means the witch came home and took it off herself.\n\nThe lowest strip is Nan Briar’s, tied when she went to tend the Concordant’s garden. Nobody untied it. For thirty years nobody tied a new one, until you did.',
  },
  {
    id: 'lore:hc-hedgewitch-liars-fork', name: 'The Liar’s Fork', category: 'culture', source: 'initials cut in the canopy', hidden: true,
    body: 'Every child in Rootholme is dared, sooner or later, to climb to the topmost leaf of the Elder Tree. Almost none of them do. Halfway up, the trunk forks, the view opens out over the whole of Wildheart, and the rest of the climb looks very long indeed.\n\nThe bark of the fork is cut with hundreds of initials, a century of them, and under most of them, very small: “didn’t go on”. The grandmothers of Rootholme have kept this secret from their grandchildren for generations.',
  },
  {
    id: 'lore:hc-verdant-capital-ruin', name: 'The Winter House', category: 'history', source: 'a rota pinned to a ruined door', hidden: true,
    body: 'In the Concord days the Root Circle kept a long low house among the roots where the witches slept through the tree’s winters, taking turns to keep the lanterns low and the blankets on. In spring the youngest was sent up to wake the tree gently, with a song and a cup of tea.\n\nThe last rota is for the winter of C. 1011. Young Yarrow was on blankets. The house was never needed again, and the roots took the roof.',
  },
  {
    id: 'lore:hc-verdant-capital-cave', name: 'The Ring-Wall', category: 'places', source: 'the cut face of the taproot', hidden: true,
    body: 'Deep in the Taproot Hollow a face of the Elder Tree’s wood was cut smooth, long ago, so the Circle could read its rings. For a thousand years they are wide and even, one ring for every year: a summer’s growth and a winter’s rest.\n\nAfter C. 1012 there is no rest between them. The rings crowd together, one a day, too fine to count, thirty years of them pressed into the width of a finger. A tree, the Circle says, that has forgotten how to stop.',
  },
  {
    id: 'lore:hc-verdant-capital-tally', name: 'The Ring-Counter’s Slate', category: 'culture', source: 'a slate in the Taproot Hollow', hidden: true,
    body: 'The Root Circle has always kept a ring-counter, whose only duty is to note each new ring the Elder Tree lays down. It was the easiest office in Rootholme: one mark a year, and a party.\n\nSince the Hollowing the tree has laid a ring a day. The last ring-counter, a witch called Dimity Rennet, kept up for twenty-four years, by chalk, by lamplight, alone in the Hollow. Her slate stops in the middle of a column. The Circle has not appointed another.',
  },
  {
    id: 'lore:hc-verdant-capital-view', name: 'The Swallowed Streets', category: 'places', source: 'a chalk map on a gallery rail', hidden: true,
    body: 'Thimble Steps. The Long Bough. Candle Row. Old Mill Lane. Lantern Row. Since C. 1012 the Elder Tree has grown over twenty-three streets of Rootholme, a ring at a time, and the people who lived in them have moved up a level, or in with their sisters.\n\nSomebody has kept count on the rail of the Hanging Gallery for thirty years, in chalk, a street at a time. Nobody admits to it. Every child in Rootholme knows it is Eldest Cicely Rue.',
  },
  {
    id: 'lore:hc-verdant-spore-cellar', name: 'The Spore Cellar', category: 'places', source: 'a notice on the cellar door', hidden: true,
    body: 'The Root Circle grew its winter mushrooms in the Spore Cellar for three hundred years, on old compost, in the dark. A sign on the door asked growers to keep it shut, “or the whole street will have a nap”. It was a joke.\n\nThe Ancient Puffcap was the oldest grower’s pride: a mushroom she had kept alive for sixty years by talking to it. When the tears came up through the floor, it grew, and grew, and its spores came out black.',
  },
  {
    id: 'lore:hc-verdant-seed-vault', name: 'The Seed Vault', category: 'places', source: 'a label on the Gardener’s plinth', hidden: true,
    body: 'The Circle’s Seed Vault holds a drawer of seed from every plant in Wildheart, gathered at every Turning for a thousand years, so that nothing the realm has ever grown can be lost for good.\n\nIts keeper, the Gardener, is a topiary, clipped and quickened by Nan Briar before she left to tend the Concordant’s garden, to keep the vault tidy while she was away. She said she would be back in the spring. It has been keeping it tidy ever since.',
  },
  {
    id: 'lore:hc-verdant-heartwood', name: 'The Heartwood', category: 'places', source: 'words carved at the heart of the Elder Tree', hidden: true,
    body: 'At the centre of the Elder Tree is a chamber of living wood that beats, slowly, like a heart. The first witches of Rootholme carved their only rule over its door: “Speak softly. It is listening.”\n\nFor a thousand years the Heartwood half of the Verdant Stone lay here, singing the tree to sleep each winter and awake each spring. With nobody to sing to, it went on singing to itself, and the tree went on growing to hear it.',
  },
  // ---------- depth pass: Thornwilds codex finds (the gate road, the side quests, Claude 2's optional areas, the lairs)
  {
    id: 'lore:hc-ranger-blaze-oak', name: 'The Blaze Oak', category: 'culture', source: 'a great oak on the gate road', hidden: true,
    body: 'Every Wayfarer, on the day they first walk out of the Thornwilds alone, cuts a blaze of their own on the Blaze Oak by the gate road: the old arrow over three notches, with something of their own added, a fox or a flower or a crown. Whoever comes after can read who went this way.\n\nFor thirty years nobody went. The newest blaze on the oak was grey with weather, until yours.',
  },
  {
    id: 'lore:hc-ranger-old-pennyroyal', name: 'The Bloomkin Before', category: 'peoples', source: 'Old Pennyroyal, on its stone', hidden: true,
    body: 'Not every Bloomkin woke in the wild growth. A few, one a Turning or so, were woken by the Verdant Stone as the procession carried it through the Bloomfen. They lived as plants do: awake in summer, asleep in winter, and, one honest autumn, asleep for good.\n\nOld Pennyroyal, a water-mint, has woken seventy-seven springs. It is the last of them. The Bloomkin of the growth have never slept at all, and are afraid of the dark under the leaves.',
  },
  {
    id: 'lore:hc-verdant-frontier-ruin', name: 'The First Rest', category: 'history', source: 'a note in a cooking pot', hidden: true,
    body: 'Wayfarer’s Rest has moved eleven times in the Wayfarers’ memory. The paths of the Thornwilds move in the night, and a camp that wants to stay on its paths has to move after them.\n\nThe first Rest was left in a hurry, by the look of it, with the supper still in the pot. The note in the pot says the camp went north after the paths. The Wayfarers say that is where the habit of the blaze began: a whole camp, cutting marks so that nobody would be left behind.',
  },
  {
    id: 'lore:hc-verdant-frontier-cave', name: 'The Blaze-Key', category: 'culture', source: 'the wall of the Blaze Cellar', hidden: true,
    body: 'Wayfarer apprentices learn their marks in the Blaze Cellar, from a key cut into its wall. Arrow over three notches: this way. Arrow and circle: water. Arrow and cross: danger. Arrow and ring: camp.\n\nThe last mark is the arrow cut upside down: do not follow. It is cut deeper than the rest, and in all the Wayfarers’ songs nobody has ever had to use it. Since the Hollowing, it has appeared three times in the grey.',
  },
  {
    id: 'lore:hc-verdant-frontier-letter', name: 'Nell Rennet’s Letter', category: 'culture', source: 'a tin on a ledge in the Blaze Cellar', hidden: true,
    body: '“To my boy. Storm caught me, so I am in the Blaze Cellar until it passes, and I have been cutting you a whistle. If the path moves before I get back, follow the fox marks. I always cut a fox for you.”\n\nThe Wayfarers’ roll lists a Nell Rennet, who came back from that storm, and two dozen more, and taught her boy to cut a fox on every blaze. Her granddaughter was Kit Fernsby.',
  },
  {
    id: 'lore:hc-verdant-frontier-view', name: 'The Moving Ways', category: 'places', source: 'notches cut in a viewpoint rail', hidden: true,
    body: 'There are nine paths through the Thornwilds, the Wayfarers say, and on a still evening from the viewpoint you can watch every one of them move: sliding, curling, drifting a few paces at a time, like grass in a slow wind.\n\nBefore the Hollowing they held still once every twelve years, for the Turning procession. A Wayfarer has cut a notch for each path on the rail, and kept count of the years in which none of them held. The last date is C. 1041.',
  },
  {
    id: 'lore:hc-verdant-mossback-wallow', name: 'The Mossback Wallow', category: 'bestiary', source: 'a swineherd’s post in the Wallow', hidden: true,
    body: 'The Wayfarers once kept a herd of mossbacks in the Wallow: great slow hill-boars with gardens on their backs, that rooted up the bramble and kept the supply trail clear. The last swineherd let them go wild after the Hollowing, when the paths moved and the trail stopped mattering.\n\nMossbacks eat anything. Since the tears came into the mud, they eat everything, and grow no fatter.',
  },
  {
    id: 'lore:hc-verdant-beetle-mound', name: 'The Beetle Mound', category: 'bestiary', source: 'a tally-pole in the Mound', hidden: true,
    body: 'Thorn Beetles are the Thornwilds’ undertakers. They eat dead wood, and only dead wood, and the Wayfarers have always counted them as friends: a fallen tree in the beetles’ country is gone in a season, and something green grows in the gap.\n\nThe Mound is their city, and the Carapace Queen its mother. The tally-pole at its mouth is the Wayfarers’ own, for counting the clutches each spring. The counts stop thirty years ago, at a number nobody believed.',
  },
  {
    id: 'lore:hc-verdant-rotting-glade', name: 'The Rotting Glade', category: 'places', source: 'a ring of stones in the Glade', hidden: true,
    body: 'The Rot half of the Verdant Stone lay for a thousand years in a glade at the heart of the Rotwood, where the oldest trees in Wildheart went to lie down. It was the best rot in the realm: soft, sweet and busy, and the Wayfarers called the glade the Kitchen, because everything that fell there was turned into something else.\n\nWhen the tears came, the Kitchen stopped cooking. The trees stood up out of habit, and nothing came to eat them.',
  },
  {
    id: 'lore:hc-elder-tree', name: 'The Elder Tree', category: 'places', source: 'Mother Yarrow, to the tree, and then to you',
    body: 'The great tree that Rootholme is built in: markets on its boughs, wells in its sap, cellars in its roots and children in its crown. In the Concord days it slept every winter, sung to sleep by the Verdant Stone, and woke in the spring to grow a sensible amount. It has not slept since C. 1012.',
  },
  {
    id: 'lore:hc-root-circle', name: 'The Root Circle', category: 'factions', source: 'Eldest Cicely Rue, wearily',
    body: 'The Hedgewitches of Rootholme, who meet in a ring of thirty roots and disagree in a ring. Any motion carried by the Circle is said to have been “disagreed in the usual way”. They tend the Elder Tree, keep the Seed Vault and, when the tree grows too far, order a Pruning.',
  },
  {
    id: 'lore:hc-wayfarers', name: 'The Wayfarers', category: 'factions', source: 'carved on the memorial tree at Wayfarer’s Rest',
    body: 'The Rangers of the Thornwilds, who walk the wilds and keep its paths. The paths of the Thornwilds move in the night; the Wayfarers cut blazes in the trees so that whoever comes after can find the way. Their sign is an arrow over three notches. They let things rot where they fall.',
  },
  {
    id: 'lore:hc-bloomkin', name: 'The Bloomkin', category: 'peoples', source: 'Old Cattail, very slowly',
    body: 'Plant-folk woken by the wild growth since the Hollowing: lilies, bulrushes, rose-hips and things like walking moss. They are new, and serious, and not yet sure whose side they are on, or what they are for. In the Bloomfen they once counted themselves, and came to four hundred and twelve.',
  },
  {
    id: 'lore:hc-thornwilds', name: 'The Thornwilds', category: 'places', source: 'Holt Barrow, in fewer words',
    body: 'Dense bramble forest beyond Rootholme, where the trails move overnight. Wayfarer’s Rest sits at its edge; beyond lie the flowering Bloomfen and, deeper still, the grey Rotwood, where the tears soaked in.',
  },
  {
    id: 'lore:hc-black-sap', name: 'Black Sap and Barren Rot', category: 'magic', source: 'the Gardener’s seed-ledger, and Sister Morel’s slate', hidden: true,
    body: 'In Wildheart the black tears do two things. Fed into living wood they make it grow without stopping, and fed to the sick they hold them: rooted, green at the nails, unable to get worse or to die. Fed into rot they make it hungry, so that it eats the living as well as the dead, and gives nothing back. Mushrooms grown on it are perfect, and drop no spores.',
  },
  {
    id: 'lore:hc-elder-grove', name: 'The Elder Grove', category: 'bestiary', source: 'the Thorn Gate',
    body: 'The root-mind of the Elder Tree, older than Rootholme, which lies coiled round the Thorn Gate. Hollowed by the tears, it wrapped the gate in grasping roots and stopped letting anything die. Sung to, it nods off; touched with honest rot, its dead roots fall away. Beaten, it lies down to sleep for a winter.',
  },
  {
    id: 'lore:hc-rootholme-compost', name: 'On Compost', category: 'culture', source: 'Hepzibah Marl and Old Fennimore Clay, forty years apart',
    body: 'In Rootholme compost is a science, a religion and a grudge. Hepzibah Marl turns hers every Tuesday with nettles; Old Fennimore Clay lets the winter do it. Since C. 1012 neither heap has rotted at all. There has been no winter for the tree to sleep through, and nothing can become something else without a rest.',
  },
  {
    id: 'lore:hc-willow-daughter', name: 'The Elder Tree’s Daughter', category: 'history', source: 'Grandmother Wenna Sloe, from the topmost leaf',
    body: 'On the day the Concord was sworn, a cutting of the Elder Tree was carried out of Wildheart and planted on a hill in Concordia, so that the Verdant school would always have a root at the heart of the ring. It grew into the Weeping Willow. From the topmost leaf of its mother, on a clear day, you can just see it.',
  },
  {
    id: 'lore:hc-yarrow-diary', name: 'Yarrow’s Tree-Diary', category: 'books', source: 'volume one, in a hand like a hedge in a high wind',
    body: '“Snow tonight. Told the tree goodnight. The Concordant’s gardener came by and we sang the Stone to it, and all the leaves came down together, and it slept. Back in the spring, I said. It always is.”\n\nSixty years of everything Mother Yarrow has said to the Elder Tree. The tree has been listening to all of it.',
  },
  {
    id: 'lore:hc-still-tune', name: 'The Still Tune', category: 'culture', source: 'Old Ivo Pennick’s fiddle',
    body: 'A Wayfarer fiddle tune in three phrases, slow and stepping. For as long as it is played, every path in the Thornwilds holds still. Ivo Pennick played it for fifty years and forgot it; the briars of the Thornwilds had been humming along all that time, and remembered it for him.',
  },
  {
    id: 'lore:hc-old-rot', name: 'The Old Rot', category: 'places', source: 'Holt Barrow, who showed it to you',
    body: 'The oldest fallen log in the Thornwilds, longer than a street and soft as cake, which has been rotting gently for a thousand years and feeds a whole grove. Honest rot eats only the dead, only the done with, and gives it all back. The tears make rot greedy.',
  },
  {
    id: 'lore:hc-ranger-stag-grief', name: 'The Stag’s Grief', category: 'history', source: 'the edge of the White Stag’s glade', hidden: true,
    body: 'Aldo Mire planted his barren fungus in rows around the White Stag’s glade and let it drink the Stag’s tears. Thirty years of grief, he said, was enough to rot the whole Gloamwood. The Stag was not running from anything. It was walking the old Turning road, round and round, waiting for a procession that never came.',
  },
  {
    id: 'lore:hc-verdant-thornhollow', name: 'Thornhollow and the Hedge House', category: 'places', source: 'Teasel Gammon, among the pots',
    body: 'A village of bramble and bog in Briar Hollow, home to Nan Briar and the Verdant folk of Concordia. Its Hedge House was the old Verdant waystation on the Turning road: Wayfarers slept upstairs and witches down, and they argued about compost through the floor. Since the arches shut it has kept a little of Wildheart alive in pots.',
  },
  {
    id: 'lore:hc-verdant-willow', name: 'The Weeping Willow', category: 'bestiary', source: 'its own last words',
    body: 'The Sentinel of the Verdant school: a cutting of the Elder Tree, planted at Stag’s Rest on the day the Concord was sworn. Every Turning it dropped its leaves for the crown to walk on. When the crown stopped coming it held on to every leaf, and wept black into the Gloamwood instead.',
  },
  {
    id: 'lore:hc-hedgewitch-graft', name: 'The Bramblewife’s Graft', category: 'history', source: 'a note under a glass bell, in sticky green ink', hidden: true,
    body: '“The Sovereign eats and eats and never dies. The tree grows and grows and never dies. Put them together and nothing ends, ever. Isn’t that kind?” Ostara fed the Ooze Sovereign black-tear sap in Briar Hollow, meaning to graft its hunger into the Elder Tree’s stolen seed.',
  },
  {
    id: 'lore:hc-mother-yarrow', name: 'Mother Yarrow', category: 'characters', source: 'Rootholme, fondly',
    body: 'Root-Warden of the Circle, gentle and immovable. She talks to the Elder Tree out loud, all day, about everything, and has done for sixty years without an answer. She has taught the hero since they were knee-high to a Briarling.',
  },
  {
    id: 'lore:hc-ostara', name: 'Bramblewife Ostara', category: 'characters', source: 'her patients, who do not speak',
    body: 'The Circle’s finest healer, warm and funny and sticky to the elbows. Nobody in her ward has died in a year. She lost her mother to a fever as a girl, and swore she would never let anyone go into the compost again.',
  },
  {
    id: 'lore:hc-holt-barrow', name: 'Holt Barrow', category: 'characters', source: 'the Wayfarers',
    body: 'Warden-of-Ways of the Wayfarers, who smells of pine and says very little. He has one joke, about a beetle, a boar and a Circle witch, and nobody has ever heard the end of it. Something always interrupts him.',
  },
  {
    id: 'lore:hc-aldo-mire', name: 'Aldo Mire', category: 'characters', source: 'the Wayfarers, before',
    body: 'Holt Barrow’s oldest friend, the loudest man in the Thornwilds and the best cook in the camp. He went missing in the Rotwood for a year and came home laughing, with shelf-fungus in his beard. They call him the Rotking now.',
  },
];

export default entries;
