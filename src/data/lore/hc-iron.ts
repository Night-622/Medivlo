/** Hollow Crown codex: Ironhold (Iron), shared by the Knight and Juggernaut campaigns. Owner: Claude 4. */
import type { LoreEntry } from '@/core';

const entries: LoreEntry[] = [
  // ---------- the realm
  {
    id: 'lore:hc-ironhold', name: 'Ironhold', category: 'realms', source: 'an Anvilgate primer, with a toll-stamp on every page',
    body: 'Dusty hills full of mines and walls, the realm of the Iron school. Iron endures; it holds the line. Knights and Juggernauts are forged here, sometimes literally.\n\nIt was Iron’s Concordant, Queen Berenika, who named Casimir her steward on the last night of the 85th Turning, and Ironhold has never forgiven itself. Since the Hollowing it has walled itself in out of shame: Anvilgate has walls inside its walls inside its walls, and a toll at every gate.',
    related: ['lore:hc-berenika', 'lore:hc-iron-colossus'],
  },
  // ---------- depth pass: Anvilgate codex finds (the gate road, Claude 2's optional areas, the lairs)
  {
    id: 'lore:hc-knight-last-toll', name: 'The Last Toll', category: 'culture', source: 'a toll-box on the gate road', hidden: true,
    body: 'The forty-first gate of Anvilgate has no walls: a single iron arch on the gate road with a toll-box on a post. Knights riding out to the Turning paid it one penny, so that the road home would already be paid for when they came back. You could walk round the arch. Nobody ever has.\n\nThe box holds centuries of pennies. The newest was paid in C. 1012, by knights who came home in disgrace and never felt they had the right to use the road they had paid for.',
  },
  {
    id: 'lore:hc-iron-capital-ruin', name: 'The First Forge', category: 'history', source: 'words on a small anvil', hidden: true,
    body: 'Before the Fortress Forge there was one anvil, no higher than a knee, in a smithy that is now a ruin among the Wards. The Iron school’s first rule is cut into its face: made slowly, made properly, made for somebody.\n\nThe Forge kept the rule for a thousand years. Since C. 1012 it has made walls, gates, sentries and a Colossus, quickly, out of shame, for nobody in particular.',
  },
  {
    id: 'lore:hc-iron-capital-cave', name: 'The Horses’ Vigil', category: 'culture', source: 'grave-slabs in a drowned crypt', hidden: true,
    body: 'The oldest knights of the Order of the Anvil were buried with their horses carved standing over them, on guard: in Ironhold the horse kept the last vigil, so that the knight could rest. The custom died out when the Order began burying its dead in the Barrow under the Tilt Yard.\n\nThe old crypt flooded long ago. The horses on the slabs are still standing guard, under the water.',
  },
  {
    id: 'lore:hc-iron-capital-tally', name: 'The Vigil-Cards', category: 'culture', source: 'a tin on a ledge in the drowned crypt', hidden: true,
    body: 'On the night before their dubbing, squires of the Order used to write down the one thing they were afraid of and leave it in the dark of the old crypt, so that they could go up to the chapel without it.\n\nMost of the cards have rotted. One, in a tin, survives: a squire’s fear that he would be good at the work and never know what it was for. It is signed Gideon Marke, C. 990.',
  },
  {
    id: 'lore:hc-iron-capital-view', name: 'The Nineteen Walls', category: 'places', source: 'a tally on a viewpoint rail', hidden: true,
    body: 'Anvilgate has nineteen rings of wall, and a toll at almost every gate in them. Two were built for defence, in the Schools’ War. The other seventeen were built after C. 1012, one a year at first and then whenever the Regency felt the need, each with an apology cut into its stones.\n\nThe viewpoint tally was begun by a mason’s child. It is still kept, though nobody admits to keeping it.',
  },
  {
    id: 'lore:hc-iron-barrow', name: 'The Barrow of Knights', category: 'places', source: 'a vigil-roll in the Barrow', hidden: true,
    body: 'Under the Tilt Yard lie the Order’s crypts and the empty tomb of Queen Berenika, who rode to the Citadel in C. 1012 and never came back. Squires keep their vigils here when the chapel is full.\n\nThe vigil-roll by the stair lists every squire who knelt in the Barrow, and the hour they rose. For thirty years one line has no hour against it: Ser Roswitha Dunne, who knelt to guard the tomb until the crown came home.',
  },
  {
    id: 'lore:hc-iron-heraldry-vault', name: 'The Heraldry Vault', category: 'places', source: 'a herald’s note in the Vault', hidden: true,
    body: 'Every house in Ironhold has its arms in the Vault, painted on a shield, and every new knight’s arms are added to the roll on the day of their dubbing. After C. 1012 houses began to scrape their arms off in shame, one shield at a time, and the heralds stopped adding new ones.\n\nThe scrapings were swept into the Vault’s cellar. Thirty years of them. The heralds did not know what else to do with a crest nobody wanted.',
  },
  {
    id: 'lore:hc-iron-forge-throne', name: 'The Forge Throne', category: 'places', source: 'a plate on the Forge Throne', hidden: true,
    body: 'The Regency’s throne stands at the heart of the Fortress Forge, among the great hammers, so that the regent can hear the realm being made. It was built in C. 1013 over the place where the Forge half of the Iron Stone had come to rest, which the Regency took for a sign.\n\nThe half-stone did not come out for any regent. Konrad Berenikson sat over it for nineteen years, listening, and heard nothing at all.',
  },
  // ---------- depth pass: Deepworks codex finds (the main line, the side quests, Claude 2's optional areas, the lairs)
  {
    id: 'lore:hc-juggernaut-lamp-post', name: 'The Lamp Post', category: 'culture', source: 'lamps on a pole at the top of the main line', hidden: true,
    body: 'When a Juggernaut leaves the Deepworks for good, or for a long time, they hang their lamp on the Lamp Post at the top of the main line. A cold lamp means “keep my place”; the shift will not give their tally-hook to anyone else until the lamp is lit again by its owner.\n\nThe post carries lamps nine hundred years old. The newest before yours belonged to miners who went up to the Turning of C. 1012 and could not come back. Somebody has kept their tallies on the board ever since.',
  },
  {
    id: 'lore:hc-juggernaut-first-song', name: 'The First Miners’ Song', category: 'culture', source: 'a song-board in the oldest gallery', hidden: true,
    body: '“Down by the singing, left at the red, under the water and on to the bed. Where the rock answers, there you will stay: dig where it sings and it gives you its way.”\n\nThe song is a set of directions. The first miners followed the Iron Stone’s song through the rock and dug where it was loudest. Its last verse is a warning: “And when it goes quiet, put down your pick. Something has stopped. Go up and be quick.” In C. 1012 the rock went quiet. Nobody had sung the last verse in four hundred years.',
  },
  {
    id: 'lore:hc-iron-frontier-ruin', name: 'The First Whistle-House', category: 'history', source: 'words over a ruined door', hidden: true,
    body: 'The first foremen of the Deepworks kept their whistles in a stone hut at the head of the first shaft, one whistle for each, hung on a nail when they retired. The rule over the door is the Brotherhood’s oldest: blow for the shift, never for the owner.\n\nA whistle is not a summons in the Deepworks. It is a promise. Whoever blows it is saying: somebody will come.',
  },
  {
    id: 'lore:hc-iron-frontier-cave', name: 'The Prop Gallery', category: 'places', source: 'stone props in a cave', hidden: true,
    body: 'In the oldest galleries the pit-props were never timber. The first miners left pillars of the living rock to hold the roof, and carved each one into the likeness of whoever had held that roof up by hand while it was dug. The Prop Gallery has forty of them.\n\nRivet Town children are brought here once, at six, on their first shift, and told: this is what we are for.',
  },
  {
    id: 'lore:hc-iron-frontier-tally', name: 'Big Aud’s Hour', category: 'history', source: 'a shift-ticket in a prop’s hand', hidden: true,
    body: 'In C. 610 the third face of the old gallery came down on a full shift. Big Aud Fenner, the tallest Juggernaut of her day, held a split prop on her shoulders for an hour and three-quarters while forty-one miners crawled out.\n\nShe lived another fifty years and never once talked about it. The shift carved her into the rock anyway. Every Juggernaut since has been told about Aud’s hour. Most of them pretend it is not why they do it.',
  },
  {
    id: 'lore:hc-iron-frontier-view', name: 'The Black Run', category: 'places', source: 'seen from a viewpoint over the Scrapfields', hidden: true,
    body: 'From high on the Scrapfields you can see the whole Deepworks: the shaft-heads, the rail-lines and the Slag Rivers, glowing red where the waste of the Forge runs away to cool.\n\nAt the deep end, by the Hollow Lode, one run is black instead of red. The miners call it the Black Run, and do not swim in it, or fish, or let their children throw stones into it. It has been spreading for a year.',
  },
  {
    id: 'lore:hc-iron-warden-foundry', name: 'The Warden Foundry', category: 'places', source: 'a casting-order in the foundry', hidden: true,
    body: 'The old foundry on the Slag Rivers cast the first Iron Sentries for the Wall, and was shut when the Wall was done. Its Forge Warden, a foundry-spirit meant to tend the moulds, was never told the order was finished.\n\nWhen the Bell rang and the Colossus walked, the Warden read its last order again: “Sentries, for the Colossus, as many as required.” It has been trying to work out how many are required ever since.',
  },
  {
    id: 'lore:hc-iron-scrap-hive', name: 'The Scrap Hive', category: 'bestiary', source: 'a tin sign in the Scrap Hive', hidden: true,
    body: 'Scrap Beetles eat iron rust and nest in whatever people throw away. The Scrapfields have fed them for nine hundred years, and the Beetle King is the oldest of them, armoured in layer on layer of Rivet Town’s rubbish.\n\nThe miners have always said you can date a layer of the Hive like rock: the boiler from the flood year, the cart from the strike, the door from old Haskins’s house. The deepest layer, they say, is the first thing anybody in Rivet Town ever threw away.',
  },
  {
    id: 'lore:hc-iron-hollow-lode', name: 'The Hollow Lode', category: 'places', source: 'a survey stake in the deep seam', hidden: true,
    body: 'The deepest seam in the Deepworks, where the Lode half of the Iron Stone came to rest in C. 1012. Its iron sang when struck, and the Forge paid well for it. Then the tears came down into the rock, and the iron went on singing, but in the wrong key.\n\nMagda Ruhl bought the seam for a song, the miners say. It is the one joke about the Lode that nobody in Rivet Town laughs at.',
  },
  {
    id: 'lore:hc-berenika', name: 'Queen Berenika', category: 'characters', source: 'the roll of arms, and Ser Gideon, eventually',
    body: 'The Iron Concordant who held the crown until C. 1012, when it should have passed to Fist. On the last night she named Casimir of Brindlecross steward of the crown until dawn. She walked into the Citadel and did not come out. Ironhold has called it treason for thirty years. Everyone who knew her says, in the same tone, that she was kind.',
    related: ['lore:hc-berenikas-writ'],
  },
  {
    id: 'lore:hc-berenikas-writ', name: 'The Steward’s Writ', category: 'history', source: 'the Order’s archive, behind the apologies', hidden: true,
    body: '“To my knights. I name Casimir of Brindlecross steward of the crown, for this one night, until it passes to Fist at dawn. He cannot hear the stones, so he cannot want them. Let him hold it one night: he has never held anything. Berenika.”\n\nIt was never treason. It was kindness, which is a much harder thing to wall in.',
  },
  {
    id: 'lore:hc-iron-colossus', name: 'The Iron Colossus', category: 'bestiary', source: 'the Council of the Forge, minutes, thirty years of them',
    body: 'The war-construct the Fortress Forge spent thirty years building, to march on Concordia and take the crown back for Iron. It was built of hollow iron from the Deepworks, and every plate is stamped with a Brotherhood shift-mark.\n\nOn the night the Drowned Bell rang it woke on its own, walked out of the Forge through three of Anvilgate’s walls, and went to stand at the Iron Gate, waiting for a king.',
  },
  // ---------- Anvilgate
  {
    id: 'lore:hc-order-of-the-anvil', name: 'The Order of the Anvil', category: 'factions', source: 'Chapter-Master Ansel Varley',
    body: 'The Knights of Ironhold, sworn shields of the realm. A squire keeps an all-night vigil before their dubbing, beside a shield with no arms on it. The Order’s oldest mark is a small plain anvil. For thirty years the line it holds has mostly been walls.',
  },
  {
    id: 'lore:hc-regency', name: 'The Regency', category: 'factions', source: 'gold and black, on every banner in the Tilt Yard',
    body: 'Berenika’s heirs, who have ruled Ironhold since the Hollowing in the name of a queen who never came back. The Prince-Regent, Konrad Berenikson, is her grandson. The Regency wants the crown back for Iron, and has never quite said what it means to do with it then.',
  },
  {
    id: 'lore:hc-fortress-forge', name: 'The Fortress Forge', category: 'places', source: 'Forgemistress Marit Blum',
    body: 'The vast forge-halls at the heart of Anvilgate, where the great hammers fall in time. Under them stands the Forge Throne, the Regency’s seat, and under the throne lay the Forge half of the Iron stone, which would not come out for any prince. The Colossus stood in its cradle here for thirty years. There is now a hole in the wall the exact shape of it.',
  },
  {
    id: 'lore:hc-barrow-of-knights', name: 'The Barrow of Knights', category: 'places', source: 'the Order’s burial roll',
    body: 'The crypts of the Order under the Tilt Yard, and the tomb of Queen Berenika, who has no body in it. Her champion, Ser Roswitha Dunne, swore to keep watch over it until the crown came home. She kept the oath for thirty years, and the tears found her there.',
  },
  {
    id: 'lore:hc-roll-of-arms', name: 'The Roll of Arms', category: 'culture', source: 'the Heraldry Vault',
    body: 'Every house of Ironhold, every crest, painted on one long roll kept in the Heraldry Vault. After the Hollowing, families in shame scraped their arms off their shields, and thirty years of scraped-off crests gathered in the Vault into one nameless suit of armour: the Blank Shield. When it fell, a single crest surfaced on it at last: a small plain anvil, the Order’s oldest mark.',
  },
  {
    id: 'lore:hc-office-of-contrition', name: 'The Office of Public Contrition', category: 'culture', source: 'Clerk Absalom Bray, who would like you to know the spring of C. 1027 is in verse',
    body: 'An office of one clerk in the Anvilgate Wards, which has written Concordia a formal apology every day since the Hollowing. Ten thousand, nine hundred and fifty letters, filed by date. None was ever sent. At Gildport, the Ironhold envoy wrote Anvilgate a letter of forgiveness every week for thirty years. None of those got through either.',
  },
  {
    id: 'lore:hc-queens-last-ride', name: 'The Queen’s Last Ride', category: 'history', source: 'the grooms of the Tilt Yard, and a horse called Duty',
    body: 'Every evening Berenika rode the same way: the Tilt Yard, the Lantern Arch, the old chapel, and out along the road to the Iron Gate. On her last evening she stopped at the foot of what is now the Wall and wrote a letter in the saddle, crossing it out and rewriting it many times. Her destrier, Duty, would not leave his stall for thirty years after.',
  },
  {
    id: 'lore:hc-berenikas-wall', name: 'Berenika’s Wall', category: 'places', source: 'Old Jarek, mason',
    body: 'The “Wall of Shame”, built round Anvilgate after the Hollowing by four hundred masons, every one ordered to cut a small apology into their stone. It is cracking now, and hollow Iron Sentries walk its top. At least one of its apologies is a baby’s name.',
  },
  // ---------- the Deepworks
  {
    id: 'lore:hc-deepworks', name: 'The Deepworks', category: 'places', source: 'a Rivet Town shift-card',
    body: 'Mine shafts and rail-carts under the hills of Ironhold, worked by the Brotherhood and hauled by Rivet Golems. Rivet Town sits at the shaft-head: iron shacks, steam, and shift-whistles that everyone in town answers to. Since the Hollowing the Deepworks have struck hollow iron, metal soaked in black tears, and the Forge has bought every ounce.',
  },
  {
    id: 'lore:hc-deepworks-brotherhood', name: 'The Deepworks Brotherhood', category: 'factions', source: 'the strike banner',
    body: 'The Juggernauts and miners of the Deepworks: mine-born giants in forged plate, and the small loud foremen who run their shifts. They vote with the shift-whistle: one long blast to down tools, two short to dig. Their banner is a pick and a whistle crossed on red, and their motto is Nobody Works Alone. Their founding whistle was blown once, at the first strike, nine hundred years ago.',
  },
  {
    id: 'lore:hc-hollow-lode', name: 'The Hollow Lode', category: 'places', source: 'a shipping tag: “Hollow Lode. M. Ruhl.”',
    body: 'The deepest seam in the Deepworks, where hollow iron is mined, and where the Lode half of the Iron stone lay in the rock at the bottom like a seed in fruit. Its mine-boss, Magda Ruhl, paid double wages in bright new coin. The miners who carried her coin went quiet, then docile, then down the Lode for good.',
  },
  {
    id: 'lore:hc-singing-seam', name: 'The Singing Seam', category: 'history', source: 'Old Selwyn Duckett',
    body: 'The oldest gallery of the Deepworks, where the first miners did not dig for iron: they sang for it, and dug where the rock sang back. What they were following, it turns out, was the song of the Iron stone in the mountain. Thirty years ago it went quiet, and the Deepworks just kept digging.',
  },
  {
    id: 'lore:hc-slag', name: 'Slag', category: 'magic', source: 'Foreman Haldt’s lamp, and a children’s contest', hidden: true,
    body: 'The Deepworks’ waste, thrown away by the cartload for nine hundred years. Black tears that run into slag stop there, sealed in like flies in amber, and never weep again. A miner’s lamp lay thirteen years in a cooled slag-run without a single tear on it. Rivet Town had been saving the answer all along without knowing it.',
  },
  // ---------- mentors and nemeses
  {
    id: 'lore:hc-gideon-marke', name: 'Ser Gideon Marke', category: 'characters', source: 'the Order’s roll, and a pot of paint',
    body: 'Queen Berenika’s last living knight: old, kind and full of guilt. On the night of the Hollowing he carried the crown into the hall for Casimir, because she asked him to, and bowed. He threw his spurs down the Barrow well that night and has not ridden since. He keeps a pot of paint for squires’ arms, and has not had a squire in thirty years.',
  },
  {
    id: 'lore:hc-konrad-berenikson', name: 'Prince-Regent Konrad Berenikson', category: 'characters', source: 'Anvilgate, fondly',
    body: 'Berenika’s grandson: golden-haired, generous, funny and tired of apologising. He was four when his grandmother left for the Citadel. He cannot hear the stones, and has spent his life pretending that does not matter. He wears her armour on state occasions. The armour weeps. He has never once looked down.',
  },
  {
    id: 'lore:hc-gussie-haldt', name: 'Foreman Gussie Haldt', category: 'characters', source: 'Rivet Town, at volume',
    body: 'Foreman of the Rivet Town shift and keeper of its whistle, pocket-sized and enormously loud, who stands on a crate to be seen by the back row of Juggernauts. Her father, Foreman Haldt, was lost in the Slag Rivers in C. 1029. Her canary, Sergeant, sings for gas, for trouble and for tears.',
  },
  {
    id: 'lore:hc-magda-ruhl', name: 'Magda Ruhl, the Smelter', category: 'characters', source: 'Copper Lane, four doors from the store',
    body: 'Mine-boss of the Hollow Lode, born in Rivet Town to a mother who owed the company store a winter coat for nine years. She bought the store outright and burned its ledgers on the step. She sells hollow iron to the Hollow King for a share of a world where the diggers own the mountain. Her coin weeps. Her eyes never do.',
  },
  // ---------- Concordia
  {
    id: 'lore:hc-iron-embassy', name: 'The Ironhold Embassy at Gildport', category: 'places', source: 'Envoy Perpetua Stannard, still accredited',
    body: 'The shuttered Ironhold embassy in Gildport, whose lamp has been lit every evening for thirty years by its last envoy, because an embassy with its lamp out is a declaration of war in the old protocols. Under the gold of the buried city lie the footings of a much older Iron embassy, built in the days of the Concord.',
  },
  {
    id: 'lore:hc-iron-gilded-diggers', name: 'The Gilded Diggers', category: 'peoples', source: 'Hobnail Jenks, gaffer',
    body: 'Deepworks miners stranded in Concordia since C. 1012, who dig out the buried Sparkwright city of C. 640 for the Sparkwright Works. They are paid in gold and searched for gold at the end of every shift. For thirty years they have heard something hammering under the gold, every night, never missing a stroke.',
  },
];

export default entries;
