/** Hollow Crown codex: Tidecourt (Guile), shared by the Jester and Corsair campaigns. Owner: Claude 4. */
import type { LoreEntry } from '@/core';

const entries: LoreEntry[] = [
  {
    id: 'lore:hc-tidecourt', name: 'Tidecourt', category: 'realms', source: 'a harbour guide, price on request',
    body: 'Rose heath and crooked harbours, the realm of the Guile school. Everything in Tidecourt is for sale, including you. Guile holds that there is always another way round. Jesters work the courts of Velvet Harbour, and Corsairs work the sea.\n\nIn the year of the Hollowing the Velvet King pawned the realm’s gate to pay his debts, and Tidecourt has run on credit ever since.',
  },
  // ---------- depth pass: codex finds (the roads to the gate, Claude 2's optional areas, the lairs)
  {
    id: 'lore:hc-jester-jest-house', name: 'The Jest House', category: 'culture', source: 'a slate in a booth on the toll road', hidden: true,
    body: 'For a thousand years the toll on the road to the Pawned Gate was a joke. Every traveller to the Turning told one to the toll-keeper, and if he laughed they passed, and if he did not they told another. Nobody was ever turned back. The slate kept the best of them.\n\nThe last line on it was chalked in C. 1012 by a young fool who had walked up the road to watch the gate shut. The keeper did not laugh, and let him pass anyway.',
  },
  {
    id: 'lore:hc-corsair-last-bell', name: 'The Last Bell', category: 'culture', source: 'a bell-buoy at the mouth of the Gallows Reef channel', hidden: true,
    body: 'Every free captain leaving Gallows Reef rings the bell-buoy at the channel mouth once and scratches a mark on its rim, so that the reef knows who has gone and can listen for them coming back.\n\nThe last mark before this year was a little anchor with an A through it, cut in C. 1012 by Captain Annis Brine of the Underpaid, who sailed out to see who had bought the gate and did not return.',
  },
  {
    id: 'lore:hc-guile-capital-ruin', name: 'The First Trade', category: 'history', source: 'a slate on a sunken pillar in Velvet Harbour', hidden: true,
    body: 'The first Exchange in Velvet Harbour was a ring of pillars on the shore, long since sunk into the mud. On the last pillar standing is the first trade anybody in Tidecourt ever recorded: “One joke, for one fish. Both parties satisfied.”\n\nThe Thieves’ Exchange keeps a copy over its door. Most brokers think it is a joke. Fennick says it is the only honest line in the building.',
  },
  {
    id: 'lore:hc-guile-capital-cave', name: 'The Counterfoil', category: 'history', source: 'a pawnbroker’s spike in a sea cave', hidden: true,
    body: 'When the Velvet King pawned the realm’s gate in C. 1012, the pledge was written out in the old way, with the ticket for the buyer and the counterfoil for the shop. The ticket is nailed to the Guile arch in Concordia. The counterfoil hangs in the cave where the Tuttles have always kept their oldest pledges.\n\nSomebody scratched out the buyer’s name on it, so hard that the paper tore.',
  },
  {
    id: 'lore:hc-guile-capital-ledger', name: 'The Pawnbroker’s Rule', category: 'culture', source: 'the first Tuttle’s ledger', hidden: true,
    body: 'The first Tuttle to keep a pawnshop on the Velvet Docks, two hundred years ago, wrote one rule on the flyleaf of his ledger: never sell what somebody is coming back for. Every pledge in that ledger was redeemed, some of them after forty years.\n\nThe present Mister Tuttle has kept the rule, mostly. He keeps Fennick’s bag, too, though he says he does not.',
  },
  {
    id: 'lore:hc-guile-capital-view', name: 'The Fool’s Leap', category: 'places', source: 'a brass plaque on a cliff over Velvet Harbour', hidden: true,
    body: 'From the top of the Fool’s Leap you can see the whole of Velvet Harbour at once, glittering and in debt. Apprentice fools are brought up here to learn that a fall is only frightening from the top.\n\nThe plaque by the edge records that Fennick Pantaloon jumped from it into the harbour for a bet in C. 1003, and won. It does not record the bet. Fennick says it was a herring.',
  },
  {
    id: 'lore:hc-guile-frontier-ruin', name: 'The Reef Light', category: 'places', source: 'the last keeper’s logbook', hidden: true,
    body: 'The lighthouse on the outer reef guided the Brine Fleet home for six hundred years. Its last keeper kept the light every night after C. 1012 and wrote the same three words in the log each morning, “Light kept. No ships”, because the free captains no longer sailed far enough to need it.\n\nThe last entry records one ship, and says it was not theirs. It was white.',
  },
  {
    id: 'lore:hc-guile-frontier-cave', name: 'The Widows’ Cave', category: 'culture', source: 'names scratched in a sea cave', hidden: true,
    body: 'When a ship of the Brine Fleet is lost, the people who waited for it row out to the sea cave under the reef and scratch its name in the rock above the tideline, and then they stop waiting, or say they have.\n\nSome names have been scratched more than once. The Merry Widow’s has been cut three times, by three different families, over forty years.',
  },
  {
    id: 'lore:hc-guile-frontier-bottle', name: 'Annis Brine’s Bottle', category: 'characters', source: 'a bottle in a crack in the Widows’ Cave', hidden: true,
    body: '“If found, tell my daughter I did not sell it. Tell her I went to buy it back, and the price was more than the Fleet had.”\n\nCaptain Annis Brine of the Underpaid sailed out of Gallows Reef on the night the Velvet King pawned the gate. Her ship came home a wreck on the next spring tide, with nobody aboard. Her daughter Dorothea has never been told what she went to buy back. The bottle does not say.',
  },
  {
    id: 'lore:hc-guile-frontier-view', name: 'Lookout Rock', category: 'places', source: 'the highest rock on Gallows Reef', hidden: true,
    body: 'The Fleet’s lookouts have kept watch from this rock for as long as there has been a Fleet. From it you can see everything that matters on Gallows Reef: the Brine Market, the gibbets, the coves, the Crow Islands, and on a clear day the Pawned Gate’s water-arch.\n\nFor thirty years there has been a gilded barge moored in the arch. The lookouts stopped reporting it. Everybody knew.',
  },
  {
    id: 'lore:hc-phantom-theatre', name: 'The Phantom Theatre', category: 'places', source: 'the prompt book on the prompter’s stand', hidden: true,
    body: 'The Masquerade Quarter’s finest theatre closed in C. 1012, on the last night of a comedy called The Fool and the King, in which a fool makes a King laugh and so saves a gate. The manager cut the ending as too unlikely.\n\nThe theatre has been dark ever since. The Quarter says its prompter never left, and that he has spent thirty years trying on other people’s faces, looking for the right ending.',
  },
  {
    id: 'lore:hc-the-auditor', name: 'The Auditor', category: 'bestiary', source: 'the first page of its own ledger', hidden: true,
    body: 'The Counting House built a golem of ledgers and brass to keep the Crown’s account, and the first entry it ever made was the pawning of the gate. It has done nothing since but add the interest.\n\nThe Auditor does not hate anybody. It cannot forgive a debt because it has no column for forgiving. Augustin Drabb says he has looked.',
  },
  {
    id: 'lore:hc-pages-tally', name: 'The Page’s Tally', category: 'characters', source: 'scratches behind the Velvet Throne', hidden: true,
    body: 'Some page boy of the Velvet Court once kept count, with a pin, behind the throne, of every time the King laughed. Hundreds of marks over a few short years, and then, in C. 1012, they stop.\n\nThere is one more mark after the stop, cut much harder than the rest. Nobody at court remembers the page’s name. It began with H.',
  },
  {
    id: 'lore:hc-guildmaster-vex', name: 'Guildmaster Vex', category: 'characters', source: 'a frame in the Guildhold strongroom', hidden: true,
    body: 'The master of the Thieves’ Exchange runs it from his sea-fort off Gallows Reef. He keeps two frames in his strongroom. One held the Brine Fleet’s First Article, as a joke. The other holds his own indenture: sold to the Exchange as a boy, by his father, for eleven shillings.\n\nHe has written CHEAP across the glass. He has never said whether he means himself or his father.',
  },
  {
    id: 'lore:hc-merry-widow', name: 'The Merry Widow', category: 'places', source: 'the crew list in her forecastle', hidden: true,
    body: 'A free ship of the Brine Fleet, forty years lost, that comes out of the fog for cargo it can never carry home. Her crew list hangs in the forecastle, and every name on it has been crossed out and written again beside itself, over and over, in one careful hand.\n\nSomebody aboard has spent forty years refusing to forget who sailed with them.',
  },
  {
    id: 'lore:hc-the-gallows', name: 'The Gallows', category: 'history', source: 'the last warrant on the lowest cage', hidden: true,
    body: 'The great gibbet-rock of Gallows Reef was the Fleet’s court and its prison. Its last hanging, in C. 1012, was of a man who sold a free captain to the Exchange.\n\nAfter that the Fleet decided it had hanged enough people, and began to hang hats instead: one for every captain lost at sea. The cages still swing in the wind, and every one of them has a hat in it.',
  },
  {
    id: 'lore:hc-velvet-court', name: 'The Velvet Court', category: 'factions', source: 'Old Fennick Pantaloon, who used to work there',
    body: 'The court of the Velvet King in Velvet Harbour, where the fools tell the truth because they are paid not to. It laughs on cue, these days, behind a paid claque in the gallery. Fennick says it used to laugh when things were funny, and that the difference is the whole of politics.',
  },
  {
    id: 'lore:hc-thieves-exchange', name: 'The Thieves’ Exchange', category: 'factions', source: 'a broker’s handbook, slightly stolen',
    body: 'The guilds of Tidecourt, run from the Exchange Floor in Velvet Harbour by Guildmaster Vex from his sea-fort off Gallows Reef. Anything can be traded on the Floor: coin, cargo, debts, futures, promises and apologies. If a thing has a price, the Exchange knows it. If it has no price yet, the Exchange will think of one.',
  },
  {
    id: 'lore:hc-brine-fleet', name: 'The Brine Fleet', category: 'factions', source: 'the Fleet’s own shanties',
    body: 'The free captains of Gallows Reef, who sail where they like and owe everyone money. The Fleet stopped hanging people thirty years ago; now it hangs a hat for every captain lost at sea, and drinks to every hat on memorial night. It was founded on a single article, which most of its captains have forgotten.',
  },
  {
    id: 'lore:hc-black-pearls', name: 'Black Pearls', category: 'magic', source: 'Mister Tuttle, pawnbroker, through his glass',
    body: 'The black tears that wash up on Tidecourt’s shores harden into pearls, and the pearls have become the realm’s most valuable trade. They are always cold. Tears seeping through the shut Pawned Gate harden into pearls on the Concordia side too.\n\nA pearl can be wept to order. People who sell too many sit on the bollards afterwards and smile at nothing.',
  },
  {
    id: 'lore:hc-pawned-gate', name: 'The Pawned Gate', category: 'places', source: 'the gate’s own deed',
    body: 'Tidecourt’s realm gate, on a water-arch above the sea, its rose stone carved with all twelve schools’ marks. In C. 1012 the Velvet King pawned it to a creditor to pay the court’s debts, and its new name became official. This winter he bought it back, and meant to sell passage through it to the Hollow King.',
  },
  {
    id: 'lore:hc-velvet-king', name: 'The Velvet King', category: 'bestiary', source: 'the toll road, from a safe distance',
    body: 'The King of Tidecourt, a magnificent old man on a throne of IOUs, his crown crusted with black pearls. He pawned the realm’s gate in the year of the Hollowing, laughing, with his own fool lying flat in front of the throne. He has not laughed honestly since, and nobody has told him the truth to his face in thirty years.',
  },
  {
    id: 'lore:hc-fools-licence', name: 'The Fool’s Licence', category: 'history', source: 'vellum in the FOOLS drawer of the palace archive', hidden: true,
    body: '“A fool may tell the crown one truth in each reign, unpunished, so long as it is funny.” Granted by the first Concordant of Tidecourt. In C. 1012 Fennick Pantaloon spent his reign’s truth on a pratfall in front of the throne, to stop the King signing the gate’s pawn deed. The court laughed, and the King signed anyway.',
  },
  {
    id: 'lore:hc-masquerade-quarter', name: 'The Masquerade Quarter', category: 'places', source: 'Clementine Daub, portrait-painter',
    body: 'A district of Velvet Harbour permanently in carnival, where everybody is masked and has been for so long that some of them no longer remember what is underneath. Its yearly Worst Joke contest is held under the Fool’s Licence, to keep the fools in practice.',
  },
  {
    id: 'lore:hc-promise-trade', name: 'The Promise Trade', category: 'culture', source: 'a broker on the Exchange Floor, under protest',
    body: 'On the Exchange Floor a promise may be sold before it is made. Vows, oaths and apologies change hands every day, marked by wear: “as new”, “lightly worn”, “barely sworn”. A promise is said to be warm until it is kept. The Exchange does not like to talk about what happens to the ones that go cold.',
  },
  {
    id: 'lore:hc-exchange-markets', name: 'The Stranger Markets', category: 'culture', source: 'Broker Lionel Mizzle of the Weather Desk',
    body: 'Besides cargo and debt, the Exchange Floor trades in weather, luck, tomorrow, other people’s regrets and the right to be right. The Weather Desk has sold “fine tomorrow” every day for thirty years. It was a very steady market until the Bell.',
  },
  {
    id: 'lore:hc-thousand-knot', name: 'The Thousand Knot', category: 'culture', source: 'Netty Hawser, its keeper',
    body: 'The one great knot that lashes every ship of the Brine Market to every other, tied on the night the gate shut so that no ship would ever be left behind. Its words are said as it is tied: “Bound to each and each to all, none to buy and none to sell.”',
  },
  {
    id: 'lore:hc-fleet-articles', name: 'The Articles of the Brine Fleet', category: 'history', source: 'the lining of Dot Brine’s hat', hidden: true,
    body: 'The Fleet’s founding articles, which Dot Brine stole off the Exchange in C. 1012 so that nobody could ever sell them, and sewed into her hat. Article One: “No free captain may be bought, nor sold, nor sell another.” Guildmaster Vex kept the first page framed on his wall, as a joke.',
  },
  {
    id: 'lore:hc-thrice-sold-crown', name: 'The Thrice-Sold Crown', category: 'history', source: 'a children’s story on the Crow Islands',
    body: 'In C. 384 a Concordant of Tidecourt sold the little princess’s crown twice on the same day, to two different lords, and both paid. The third buyer was the Concord, which bought it back from both and gave it to the princess, and fined the Concordant a year of silence. The only thing in Tidecourt nobody could sell was what the Concord gave away.',
  },
  {
    id: 'lore:hc-nobodys-contract', name: 'Captain Nobody’s Contract', category: 'history', source: 'the wreck of the Merry Widow', hidden: true,
    body: '“I sell my name, all of it, for a ship of my own.” Forty years ago a young captain sold his name to a nameless wharf-boy of Gallows Reef, and got the Merry Widow, and lost her, and became nobody. The boy wrote the name he had bought in careful capitals: SALTMARSH.',
  },
  {
    id: 'lore:hc-fennick-pantaloon', name: 'Old Fennick Pantaloon', category: 'characters', source: 'the Velvet Docks, fondly',
    body: 'A retired royal fool who lives in a sail-loft attic full of cushions and still falls over on purpose several times a day. He was once half of the Pantaloon Act, the finest double act Velvet Harbour ever saw. He has won the Worst Joke contest eleven years running and regards it as his life’s work.',
  },
  {
    id: 'lore:hc-harlequin-sorrow', name: 'Harlequin Sorrow', category: 'characters', source: 'Velvet Harbour, quietly',
    body: 'The Velvet King’s fool and the real power behind the throne, in a white mask and black-and-white diamonds. He owns half the realm’s debts, and from a little shop with a red door he buys people’s grief and pays them in laughter, on credit. He is generous and kind to the pages. He never laughs. His sleeves clink.',
  },
  {
    id: 'lore:hc-dot-brine', name: 'Captain Dorothea “Dot” Brine', category: 'characters', source: 'every creditor on Gallows Reef',
    body: 'Captain of the Overdraft, admiral of nothing, captain of everything, owing money to everyone. She has a parrot called Interest, a first mate who will not take her money, and a hat she will not let anybody look inside.',
  },
  {
    id: 'lore:hc-saltmarsh', name: 'Admiral Saltmarsh', category: 'characters', source: 'Gallows Reef, admiringly',
    body: 'Master of the black-pearl trade, who sails a white flagship, pays every debt he buys on the day he buys it, and is kind to deckhands. He smells of lavender and wears one black pearl in one ear. He came to the reef as a wharf-boy with nothing, not even a name worth having.',
  },
  {
    id: 'lore:hc-guile-lanternford', name: 'Lanternford', category: 'places', source: 'Hester Glimmer, of the Will-o’-Wisp',
    body: 'A village of Tidecourt folk on the edge of Morvane Marsh, stranded when they came to sell lanterns at the Turning fair of C. 1011. They sell lanterns that lead you only slightly into the water. The Bog Market runs on black pearls. The Lantern Queen is regarded as a business rival.',
  },
  {
    id: 'lore:hc-sentinel-lantern-queen', name: 'The Lantern Queen', category: 'bestiary', source: 'her own last lantern',
    body: 'The Sentinel of the Guile school: the marsh-queen who sold the crown’s road safe passage across Morvane Marsh every Turning for a thousand years, with honest lights at honest prices, and only ever charged a song. When the crown stopped coming, an empty marsh paid nothing, so she sold lights that lead into the water, and charged a memory.',
  },
];

export default entries;
