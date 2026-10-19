/**
 * Hollow Crown codex: Thunderreach (Storm), shared by the Sparkwright and Stormlancer campaigns
 * (docs/lore/hollow-crown/06-outlines/storm.md). Owner: Claude 4.
 */
import type { LoreEntry } from '@/core';

const entries: LoreEntry[] = [
  // ---------- the realm
  {
    id: 'lore:hc-thunderreach', name: 'Thunderreach', category: 'realms', source: 'a Spirehold street-guide, slightly scorched',
    body: 'Slate grass and copper towers on cliffs that are always under storm: the realm of the Storm school. Storm believes in going first and apologising after. Sparkwrights in Spirehold build ever more improbable machines, and the Lance Clans ride Storm Rams across the Thunderclap Heights.\n\nSince the Storm Stone fled, the storms have gone wild. For a year now one endless storm has stood over the Copper Gate.',
  },
  {
    id: 'lore:hc-lightning-tower', name: 'The Lightning Tower', category: 'places', source: 'Guildmother Tess Ampery, who has opinions',
    body: 'The great copper tower at the heart of Spirehold, whose roots run deep into the cliff. For a thousand years it calmed the storms. Spirehold says it caught them. Without the Storm Stone it calms nothing, and the Coil Guild has spent thirty years trying to build a taller one. Fourteen have fallen down.',
    sections: [{ id: 'hum', title: 'Hummed, not caught', body: 'The Lightning Tower never caught a storm in its life. It hummed, at the Storm Stone’s pitch, and the storms came to it of their own accord, like cats to a hearth.' }],
  },
  {
    id: 'lore:hc-coil-guild', name: 'The Coil Guild', category: 'factions', source: 'the Patent Office, form one',
    body: 'The Sparkwrights of Spirehold: tinker-mages who bottle lightning in machines, competitive, quarrelsome and very full of patents. The Guild is led by its Chancellor. Its eldest master is called Guildmother out of affection, and she has never once been asked to approve anything.',
  },
  {
    id: 'lore:hc-tempest-coven', name: 'The Tempest Coven', category: 'factions', source: 'a pamphlet nailed to Tower Nine',
    body: 'Storm-witches of the Copper Spires who believe the storm should win, and that every tower built to tame it is an insult to the weather. They ring old bells from old belfries to call the lightning down on whatever is tallest. They are usually right about what is tallest.',
  },
  {
    id: 'lore:hc-lance-clans', name: 'The Lance Clans', category: 'factions', source: 'sung at the Thunderclap Run',
    body: 'The ram-riding Stormlancers of the Thunderclap Heights, who honour whoever rides first. The first riders are carved on the Brave Stone. Across the plain, the names of those who turned back are stacked on the Coward’s Cairn. When a storm will not pass, by old clan law, the clans charge it.',
  },
  {
    id: 'lore:hc-thunderclap-run', name: 'The Thunderclap Run', category: 'culture', source: 'Strike-Reader Osric Quell, timing it',
    body: 'The clans’ oldest race, across the open Heights from the run-stone to the cairn and back, under the storm. Whoever finishes first is honoured for a year. Nobody has ever given a prize for coming last, though it has been suggested, mostly by Odran Gale.',
  },
  {
    id: 'lore:hc-cowards-cairn', name: 'The Coward’s Cairn', category: 'culture', source: 'the cairn itself, and the man at the bottom of it',
    body: 'A cairn of flat stones on the Thunderclap Heights, each scratched with the name of a lancer who turned back from a charge. The oldest name, at the very bottom, is ODRAN GALE. He turned back for a rider who had fallen in the storm. Her name was Maudie, and she lived another thirty years, and married him.',
  },
  {
    id: 'lore:hc-warm-step', name: 'The Warm Step', category: 'places', source: 'Old Tally Rowe, who counts',
    body: 'Since the night the Bell rang, the Eyrie Steps have had one more step than they used to. It is the three hundred and fourth, between the two hundred and eleventh and the two hundred and twelfth, and it is warm. Tally Rowe has counted the stair every morning for forty years and is extremely upset about it.',
  },
  {
    id: 'lore:hc-skyrender', name: 'Skyrender', category: 'bestiary', source: 'the Lance Clans, and the weather',
    body: 'The great storm-bird whose wings make Thunderreach’s weather. Hollowed, it has stood over the Copper Gate for a year in one endless storm, shedding black rain. Beaten, it beat its wings once, and the storm moved on at last.',
  },
  {
    id: 'lore:hc-perpetual-tower', name: 'The Perpetual Tower', category: 'history', source: 'a patent application, jammed in a gear', hidden: true,
    body: '“Application for the Perpetual Tower, by V. Sterne.” The Tower half of the Storm Stone, caged in a coil-engine at the Lightning Tower’s crown, fed by Skyrender’s storm, pinned over the Copper Gate by four anchor-rods for ever. The storm would never end. It would only be used.\n\nIn the margin, in a neat hand, a small drawing of a crown, with a lightning bolt for every jewel.',
  },
  {
    id: 'lore:hc-nineteenth-kettle', name: 'The Nineteenth Kettle', category: 'history', source: 'Patent No. 1, the Vault annexe', hidden: true,
    body: 'Tess Ampery holds nineteen patents for the same kettle. The first was her grandmother’s, filed in C. 961: a copper kettle that whistled at exactly the Storm Stone’s pitch. The patent clerk noted that whenever it boiled, lightning struck the Lightning Tower. He filed it under Coincidence.',
  },
  {
    id: 'lore:hc-ride-the-wake', name: 'Riding the Wake', category: 'history', source: 'Lancemaster Odran Gale, from the ground', hidden: true,
    body: 'Before the Lance Clans charged storms, they rode behind them. A storm goes home to its eye in the end, and the oldest lancers learned to ride in its wake, where the wind is at your back and the lightning has already fallen. You learn it by falling off. Odran has learned it very thoroughly.',
  },
  {
    id: 'lore:hc-storm-cliffstair', name: 'Cliffstair', category: 'places', source: 'Spire-Keeper Prudence Spindle',
    body: 'A village of Storm-folk on the Stormcliffs in Concordia, stranded when the arches shut. Its Sparkwrights have been building a Storm Spire from a kit for thirty years. Its Stormlancers train in the Wind Yard, and since there are no Storm Rams in Concordia, they ride goats. They are very good at it.',
  },
  // ---------- depth pass: codex finds (Spirehold, the Copper Road, Claude 2's optional areas)
  {
    id: 'lore:hc-storm-lightning-lines', name: 'The Lightning-Lines', category: 'culture', source: 'a Guild pylon on the Copper Road', hidden: true,
    body: 'Copper lines strung from the Tower Crown down every road out of Spirehold, so that the Lightning Tower’s spare charge could run out to the farms and the toll-houses. In the old days Sparkwright apprentices rode them for a dare, clipped on by a harness, screaming.\n\nThe Guild banned riding the lines in C. 980. The ban is the most carefully worded document in the Patent Office. It was drafted by an apprentice called V. Sterne, aged twelve, who had just watched her brother Corin fall.',
  },
  {
    id: 'lore:hc-storm-capital-ruin', name: 'The First Workshop', category: 'history', source: 'a polished plaque on a roofless shell', hidden: true,
    body: 'The first workshop of the Coil Guild stood on this spot for nineteen days before it exploded, and the founders were so pleased with the noise that they left it as it was and built Coil Street around it. Every new master of the Guild is sworn in here, among the scorch-marks. Volta Sterne was sworn in here too. She is the only master on record to have asked whether the walls were safe.',
  },
  {
    id: 'lore:hc-storm-capital-cave', name: 'The Copper Grotto', category: 'places', source: 'a humming seam below Spirehold', hidden: true,
    body: 'A seam of raw copper in the rock below the city, which hums whenever a storm passes over. Before there was a Lightning Tower, Sparkwrights came here to listen, and the first tower was built to make the same sound on purpose. The handprints on the walls are thousands of years old. Some are very small. Children have always been the best at hearing it.',
  },
  {
    id: 'lore:hc-storm-capital-exam', name: 'Question One', category: 'books', source: 'a Guild examination paper in a tin', hidden: true,
    body: 'Every Coil Guild apprentice sits the same first question: “Describe a machine that cannot fail.” The examiners mark every answer nought, because there isn’t one. Then, in the old days, a master read the answers again and passed the apprentices whose reasons for failing were the most interesting.\n\nWinifred Ampery marked papers for forty years. She passed exactly one apprentice on the first reading, because the answer made her laugh.',
  },
  {
    id: 'lore:hc-storm-capital-view', name: 'The Weathervane Walk', category: 'places', source: 'a brass plate on a lookout rail', hidden: true,
    body: 'Spirehold has more weathervanes than chimneys, because every workshop on Coil Street makes its own, in the shape of whatever it is proudest of. From the Walk you can see them all. For a year every one of them has pointed at the Copper Gate, whatever the wind is doing. The Guild sent a memorandum about it. The weathervanes did not reply.',
  },
  {
    id: 'lore:hc-storm-brave-stone', name: 'The Brave Stone', category: 'culture', source: 'a slab of slate on the Thunderclap Heights', hidden: true,
    body: 'The names of the first riders of every charge for a thousand years, carved by the clans the night after. Nobody carves their own name; it is the one rule of the stone that has never been broken, until last month.\n\nAcross the plain stands the Coward’s Cairn. The clans built the two within sight of each other on purpose, so that every rider would always know where both of them were.',
  },
  {
    id: 'lore:hc-storm-riders-cairn', name: 'The Riders’ Cairn', category: 'culture', source: 'a cairn wound with thread on the cliff road', hidden: true,
    body: 'Lancers leaving the Heights to see the world tie one thread from their pennant to the cairn halfway down the cliff road, so the Heights will know they went. When they come home they untie one, any one, so the cairn never gets heavier than the Heights can bear. For thirty years the gate was shut, and nobody tied, and nobody untied, and the cairn simply waited.',
  },
  {
    id: 'lore:hc-storm-frontier-ruin', name: 'The Old Charge-Yard', category: 'history', source: 'a ruined yard on the Heights', hidden: true,
    body: 'Before the clans charged storms, they mustered in this yard to ride behind them, in the wake, where the lightning had already fallen. WE RIDE BEHIND was the old clans’ motto. When they changed it, a few hundred years ago, nobody thought to change the gate. The chalk underneath is more recent, and almost certainly Cass Vantor’s.',
  },
  {
    id: 'lore:hc-storm-frontier-cave', name: 'The Thunder Hollow', category: 'places', source: 'painted rams’ skulls under the Heights', hidden: true,
    body: 'When a Storm Ram is too old to run, the clans walk it down into the Thunder Hollow, where the thunder rolls round the walls all day, and leave it there with water and good hay. Storm Rams, the herders say, like the noise; it is the only place on the Heights that sounds the way the sky did when they were young. The skulls stay, with their names on.',
  },
  {
    id: 'lore:hc-storm-frontier-letter', name: 'A Letter from the Hollow', category: 'characters', source: 'a letter behind a ram’s skull', hidden: true,
    body: 'Maudie Gale wrote it the week after the charge that put Odran’s name on the Coward’s Cairn, and never sent it, because she married him instead, which she said came to the same thing. It has been in the Thunder Hollow for forty years. Odran has never found it. He has never looked.',
  },
  {
    id: 'lore:hc-storm-frontier-view', name: 'Stormwatch Rock', category: 'places', source: 'the highest rock on the Heights', hidden: true,
    body: 'The clans’ storm-readers have climbed Stormwatch Rock for a thousand years to see which way the weather means to go. For a year now Skyrender’s storm has gone nowhere, turning round its silent Eye on the Heights like a hen round a nest. The readers have a word for that. They have not had to use it in living memory.',
  },
  // ---------- lair codexes
  {
    id: 'lore:hc-storm-belfry-rota', name: 'The Coven’s Rota', category: 'factions', source: 'a bell-rota in the Witch’s Belfry', hidden: true,
    body: 'The Tempest Coven has rung the old belfry for two hundred years, to call the lightning down on the tallest point in the Spires instead of on the people under it. The rota is very strict: ring for the tallest tower, never for a house, and never on washing day. For thirty years the bell has rung for nothing but towers. This last year it rang black, and did not care what it hit.',
  },
  {
    id: 'lore:hc-storm-mk-twelve', name: 'The Perpetual Engine', category: 'history', source: 'a note on the Mk. XII’s housing', hidden: true,
    body: 'The Perpetual Engine was built by a Sparkwright called Ebenezer Hartle to prove that a machine could run for ever. It could. He switched it on, wrote a note, went out for lunch, and never came back, and the Guild locked it in the Vault rather than be the ones to switch it off. It ran for forty years, upgrading itself out of loneliness, until the night you stopped it.',
  },
  {
    id: 'lore:hc-storm-volta-receipts', name: 'Pending', category: 'characters', source: 'a box of receipts at the Tower Crown', hidden: true,
    body: 'Thirty receipts from the Patent Office, one a year, every one for the renewal of the same application: the Perpetual Tower, V. Sterne, status pending. Every one is filed in date order, and every one has a single line written on the back in the same neat hand. The first says “For Corin.” The last says the same.',
  },
  {
    id: 'lore:hc-storm-ram-kings', name: 'The Ram Kings', category: 'history', source: 'tallies cut into the rock of the crag', hidden: true,
    body: 'Every herd-king of the Heights has stood on this crag, and every one has left a mark: a single notch cut by a horn into the rock at the top, one for every winter he kept the herd alive. The longest reign is thirty-one notches. The last king’s run stops at twenty-nine, and the twenty-ninth notch is black.',
  },
  {
    id: 'lore:hc-storm-aerie-pennants', name: 'The Aerie’s Pennants', category: 'culture', source: 'the bottom of Old Clatterwing’s nest', hidden: true,
    body: 'Thunderbirds collect bright things, and for a thousand years the brightest things on the Heights have been lancers’ pennants. The Aerie’s great nest is woven from them, layer on layer, a whole history of the clans in faded colours. The oldest layer, at the bottom, is all one colour: the grey-blue the riders flew when they rode behind.',
  },
  {
    id: 'lore:hc-storm-eye-stone', name: 'The Stone in the Eye', category: 'places', source: 'the bare stone at the centre of the Eye', hidden: true,
    body: 'At the edge of the Eye of the storm, where the Eye half lay for thirty years, the bare stone is carved with two words in a hand older than the clans: STOP HERE. Every storm on the Heights turns round it. The old riders knew the Eye could only be reached by someone who could stand still in the middle of everything, and they wrote it down for whoever came next.',
  },
  // ---------- people
  {
    id: 'lore:hc-tess-ampery', name: 'Guildmother Tess Ampery', category: 'characters', source: 'Coil Street, fondly, from behind cover',
    body: 'The eldest master of the Coil Guild: cheerful, eyebrowless, and holder of nineteen patents for the same kettle. She declares everyone family on sight and lets her machines be ridiculous. Her workshop explodes on the hour, politely.',
  },
  {
    id: 'lore:hc-volta-sterne', name: 'Chancellor Volta Sterne', category: 'characters', source: 'the Chancellery, precisely',
    body: 'Chancellor of the Coil Guild, impeccably buttoned and without a single burn mark. Brilliant, dry, and proud of every wheel in the Dynamo Halls. She loves Spirehold, and she would like it to be safe for ever.',
  },
  {
    id: 'lore:hc-odran-gale', name: 'Lancemaster Odran Gale', category: 'characters', source: 'the Lance Clans, eventually',
    body: 'The slowest-talking elder of the Lance Clans, who has fallen off more rams than anyone alive. He gives everyone time. His name is the oldest on the Coward’s Cairn, and he has never once asked for it to be taken down.',
  },
  {
    id: 'lore:hc-cass-vantor', name: 'Cass Vantor', category: 'characters', source: 'the Brave Stone, and the hero',
    body: 'The hero’s lance-rival, who always rode first. A month before the Bell she rode into Skyrender’s storm alone, and her ram Thistle came home without her. She came back hollow, and faster than anyone, and she has not stopped running since.',
  },
  // ---------- Sentinel
  {
    id: 'lore:hc-sentinel-stormcrow', name: 'The Stormcrow', category: 'bestiary', source: 'its own last words, on the cliff-top',
    body: 'The Sentinel of the Storm school: the storm-bird who carried the news of every Turning across the ring, first with the news, always. Hollowed, it nests atop the Stormcliffs and screams the news of a Turning that never came.',
  },
];

export default entries;
