/** Hollow Crown codex: Steelvale (Blade), shared by the Swordsman and Samurai campaigns. Owner: Claude 4. */
import type { LoreEntry } from '@/core';

const entries: LoreEntry[] = [
  {
    id: 'lore:hc-steelvale', name: 'Steelvale', category: 'realms', source: 'an Edgewater primer, with a duelling diagram in the margin',
    body: 'Silver grass and clean rivers, the realm of the Blade school. Every child here learns the sword before they learn to read. The Blade school holds that a quarrel settled cleanly is a quarrel ended. Swordsmen duel in the salles of Edgewater; the Samurai keep silence on the Hushpine Terraces.\n\nThe Blade Stone made an ended duel stay ended. Since C. 1012 no quarrel finishes: the loser simply challenges again, and their children after them, and those who die mid-feud rise as Revenants to keep fighting.',
  },
  // ---------- depth pass: Edgewater codex finds (the silver-grass road, the side quests, Claude 2's optional areas, the lairs)
  {
    id: 'lore:hc-swordsman-salute-stone', name: 'The Salute Stone', category: 'culture', source: 'a stone on the silver-grass road', hidden: true,
    body: 'Duellists leaving Edgewater stop at the Salute Stone halfway up the silver-grass road, rest their point in the hollow on its top, and give the city the closing salute: the bout is over, and they are going. Those who fenced for the Concord at the Turnings, and came home, had their names cut in its face.\n\nThe last name is dated C. 1000. Since the Hollowing nobody has left by that road, and in Edgewater nobody has given the closing salute to anything.',
  },
  {
    id: 'lore:hc-swordsman-two-swords', name: 'Ser Odo, Who Put His Sword Down Second', category: 'history', source: 'a statue in the river shallows', hidden: true,
    body: 'The Schools’ War ended on a hill in Concordia with a single bout between Varric of the Blade and Ser Odo of the School of Ash. Varric won. Then he put his sword down, point to the ground, and waited. After a long time, Ser Odo did the same.\n\nEdgewater raised them as a pair, on opposite banks, facing each other. The flood of C. 1013 took Odo into the shallows. Since then Varric has been facing an empty plinth, and nobody in the city remembered there had ever been two.',
  },
  {
    id: 'lore:hc-blade-capital-ruin', name: 'The Old Lists', category: 'history', source: 'a carved board in a ruined square', hidden: true,
    body: 'Before the Ladder there were the Lists: a sunken square of sand where Edgewater settled its quarrels in public, under a board with two columns, BEGUN and ENDED. A quarrel was not allowed off the board until it had a mark in both.\n\nThe Ladder replaced the Lists in the first years of the Concord, because it was tidier. It kept only one column.',
  },
  {
    id: 'lore:hc-blade-capital-cave', name: 'The Duel Cellars', category: 'places', source: 'seconds’ marks on a cellar wall', hidden: true,
    body: 'Under the Fencing Quarter run the old wine cellars where duellists went to settle the quarrels they did not want the Watch to see. When a matter was ended down there, the seconds scratched a pair of crossed swords on the wall.\n\nThere are thousands of them. The newest is from the summer of C. 1012. After the Hollowing nobody went down to the cellars any more. There was no point settling anything in secret when nothing could be settled at all.',
  },
  {
    id: 'lore:hc-blade-capital-tally', name: 'The Second’s Duty', category: 'culture', source: 'a second’s notebook in the Duel Cellars', hidden: true,
    body: '“See that the blades are equal. See that the ground is fair. Speak for your friend if he cannot. And when it is over, take your friend’s sword from his hand before he can lift it again. That is the whole of the job.”\n\nIn old Edgewater the second was the most honoured part in any duel, because the second ended it. Since the Hollowing, the seconds of Edgewater have forgotten the last line.',
  },
  {
    id: 'lore:hc-blade-capital-view', name: 'The Nineteen Bridges', category: 'places', source: 'tally-marks on a viewpoint rail', hidden: true,
    body: 'Nineteen Duelling Bridges cross the river at Edgewater, and by old law each has a holder who must fence anybody who wishes to cross. Before the Hollowing a crossing was one touch and a bow, and the holder went home for supper.\n\nNow every holder is held by the bridge. Someone keeps a tally on the viewpoint rail of the years since anybody crossed each one without a fight. Most of the tallies stop at thirty.',
  },
  {
    id: 'lore:hc-blade-saints-tomb', name: 'The Saint’s Tomb', category: 'places', source: 'a dedication over the tomb door', hidden: true,
    body: 'The Sword Saint was the last great master of the Lists, buried under the oldest bridge with his blade across his chest and a pupil’s promise: that whoever came down to challenge him would get a bout worth having, and a salute at the end of it.\n\nFor nine hundred years the challengers came down, fenced, saluted and went home. After C. 1012 they fenced and did not salute, and the Saint could not stop, and neither could they.',
  },
  {
    id: 'lore:hc-blade-grand-salle', name: 'The Grand Salle', category: 'places', source: 'a list on a practice-room wall', hidden: true,
    body: 'The oldest salle on the river, where the Ladder’s original roll is kept and the Perfect Parry has stood on guard for a thousand years. The automaton was built by the first Ladder clerks to test the roll’s champions: nobody could be called champion who had not tried to touch it.\n\nNobody ever did. That was the point. A champion who has failed once, the clerks said, knows how a bout ends.',
  },
  {
    id: 'lore:hc-blade-fencing-hall', name: 'The Fencing Hall', category: 'places', source: 'a bout-board in the Fencing Hall', hidden: true,
    body: 'The great hall of the Fencing Quarter, where every champion of the Ladder was crowned and every Turning’s duellists were chosen. The Hall half of the Blade Stone lay under its floor for a thousand years, and every bout fenced above it ended when it should.\n\nOn the night of the Hollowing Lucia Ferro beat Auguste Vellacourt on that floor. The bout-board still has the score on it. Nobody ever wiped it.',
  },
  // ---------- depth pass: Hushpine codex finds (the pilgrim road, Claude 2's optional areas, the lairs)
  {
    id: 'lore:hc-samurai-last-milestone', name: 'The Last Milestone', category: 'culture', source: 'the last milestone of the Temple Road', hidden: true,
    body: 'The Temple Road has a hand-sign cut on every milestone, so that pilgrims can speak without speaking. The last milestone, where the pines end, has two: a palm to the chest, “I am here”, and below it a palm turned out, “I was here”.\n\nPilgrims leaving Hushpine stop at it and keep one breath of silence for the road behind them. The lower hand is worn so deep that a child’s fingers fit it exactly.',
  },
  {
    id: 'lore:hc-blade-frontier-ruin', name: 'The Dojo of One Word', category: 'history', source: 'a name-board in a ruined dojo', hidden: true,
    body: 'Before the Order gathered on the Terraces, its novices trained in small dojos scattered across the mountain, each under a single teacher. When a novice left, the teacher gave them one word to take away, and wrote it on the dojo’s name-board beside their name.\n\nThe words on the board in the ruin are ordinary ones: Patience. Rice. Again. Kindness. Duck. The last was given, the Order says, by the dojo’s last teacher to its last novice. It was “Stay.” Nobody knows whether he did.',
  },
  {
    id: 'lore:hc-blade-frontier-cave', name: 'The Hermit’s Year', category: 'culture', source: 'tally-marks on a cave wall', hidden: true,
    body: 'Every Hushpine novice keeps a year of silence before taking the oath. In the old days the hardest of them kept it alone, in a cave below the Terraces, with one bowl and no light, and came back up when they could hear the mountain.\n\nThe tally-marks on the wall are many hands deep, a thousand years of hermits, each starting a new column over the last. The final column stops at three hundred and sixty-five, and says the hermit went back up.',
  },
  {
    id: 'lore:hc-blade-frontier-tally', name: 'The Hundred-and-First Day', category: 'culture', source: 'a note under a bowl in the Hermit’s Cave', hidden: true,
    body: '“Fill it with water each morning. Drink it at night. Say nothing in between. On the hundredth day you will want to speak more than you have ever wanted anything. Don’t. On the hundred-and-first you won’t.”\n\nThe Order calls the hundred-and-first day the day the sword goes into the sheath. Novices who reach it say that it is not that they stop wanting to talk. It is that they start being able to hear.',
  },
  {
    id: 'lore:hc-blade-frontier-view', name: 'Above the Clouds', category: 'places', source: 'a word carved in a viewpoint rail', hidden: true,
    body: 'On most mornings the Hushpine mountain stands up out of a sea of cloud, and from the viewpoint you can see every part of it at once and hear none of it. Pilgrims come up to stand here at dawn and say nothing.\n\nSomebody carved “Listen” into the rail long ago and has polished it with their thumb ever since. The novices believe it was Kanemori, as a boy. Kanemori, asked, has not said.',
  },
  {
    id: 'lore:hc-blade-ronin-fort', name: 'The Ronin Fort', category: 'places', source: 'a muster-roll nailed to the stockade', hidden: true,
    body: 'The stockade in the Ronin Camps was built as a muster-ground for the Turning, where the swords of Steelvale gathered to march to Concordia with the procession. The Ronin Companies took it over when the Turnings stopped.\n\nThe old muster-roll is still nailed to the gate: every company that marched, and beside each one the same word, “Returned”. Under the last line, the Ronin Captain had chalked his own: “PRESSED: 41 PILGRIMS”, and underlined it.',
  },
  {
    id: 'lore:hc-blade-sheathed-shrine', name: 'The Shrine of the Sheathed Blade', category: 'places', source: 'a sheath-rack in the shrine', hidden: true,
    body: 'Pilgrims who gave up the sword left their sheaths in this shrine, so that the sheath at least would rest. In its innermost hall the Order kept the Unsheathed, a sword-spirit that had never once been put away, and the empty sheath of a student who took his sword and never brought it back.\n\nThe seal on the door was renewed at every Turning. After C. 1012 nobody came to renew it, and the spirit inside learned, slowly, how to cut seals.',
  },
  {
    id: 'lore:hc-blade-high-terrace', name: 'The High Terrace', category: 'places', source: 'the bell on the High Terrace', hidden: true,
    body: 'Above the clouds, at the top of the Hushpine mountain, a single terrace and a single shrine, where the Terrace half of the Blade Stone lay on a stand made for a sword. Its bell was rung once at every Turning, at dawn, to tell the mountain that the swords could rest.\n\nNobody has rung it since C. 1012. Pilgrims say that on still mornings you can hear it hum anyway, as if it is waiting to be asked.',
  },
  {
    id: 'lore:hc-the-ladder', name: 'The Ladder', category: 'culture', source: 'the Ladder board, Fencing Quarter',
    body: 'Edgewater’s great ranking of duellists, chalked on a board the size of a house in the Fencing Quarter: every duellist in the city, from rung 1 to rung 4,012, and every challenge outstanding between them. In the Concord days a bout ended with one word on the roll: Ended. Since the Hollowing, almost none have.',
  },
  {
    id: 'lore:hc-salles', name: 'The Salles of Edgewater', category: 'factions', source: 'Maestro Cosimo Bracca, Chair of the Council',
    body: 'The fencing schools of Edgewater, each with its master, its colours and its feuds, governed by the Salles’ Council, which sits under the Ladder board and argues about it. The oldest salle, the Grand Salle on the river, kept the Ladder’s original roll, guarded by an automaton that had never been touched.',
  },
  {
    id: 'lore:hc-hushpine-order', name: 'The Hushpine Order', category: 'factions', source: 'a milestone on the Temple Road, carved with a closed hand',
    body: 'The silent blades of the Hushpine Terraces, for whom the sheath matters more than the sword. On the Temple Road speaking aloud is rude; pilgrims and novices talk in hand-signs carved on the milestones. A novice keeps a year of silence. The abbot, by custom, spends his words as carefully as coin.',
  },
  {
    id: 'lore:hc-ronin-companies', name: 'The Ronin Companies', category: 'factions', source: 'Daisuke Nine-Coins, who is honest about it',
    body: 'Masterless blades for hire, who camp in a lawless valley below the Terraces and sell their swords to whoever pays. Since Lord Ikeda Shun took them over they pay fairly, shout less, and serve nobody at all.',
  },
  {
    id: 'lore:hc-thousand-edge-general', name: 'The Thousand-Edge General', category: 'bestiary', source: 'Old Tomoe, at her wheel',
    body: 'Steelvale’s marshal, who wanted everyone to be safe, all the time, and so mustered every blade in the realm at the Edge Gate and turned them outward. His thousand edges orbit him in rings. Disarmed, each one stays dropped, which is new to Steelvale. Old Tomoe sharpened his first sword when he was a boy.',
  },
  {
    id: 'lore:hc-unended-gallery', name: 'The Unended Gallery', category: 'places', source: 'the Ladder’s original roll: “Kept.”', hidden: true,
    body: 'Behind the racks of the Old Armoury, a long gallery where Ser Auguste Vellacourt keeps everyone he has beaten in thirty years, raised as Revenants, still fencing, still getting better, never allowed to stop. He walks among them like a gardener.',
  },
  {
    id: 'lore:hc-insult-trade', name: 'The Insult Trade', category: 'culture', source: 'Madame Celandine Sallow’s booth',
    body: 'In a city where every quarrel is legally a duel, a good insult is a tool of the trade. Madame Sallow’s booth sold them ready-made: “Sir, your footwork is a goose on ice.” Since the Hollowing nobody in Edgewater has the strength to be offended. She has diversified into apologies.',
  },
  {
    id: 'lore:hc-varric-statue', name: 'Varric’s Statue', category: 'places', source: 'its plinth, on the river wall',
    body: 'On the river wall by the Salle Grisi stands Varric, first duellist of the Concord, his sword held point-down and out, as if offering it. His plinth reads: THE FIGHT IS OVER WHEN BOTH SWORDS ARE DOWN. Since the Hollowing the statue has wept black by noon, however often it is scrubbed.',
  },
  {
    id: 'lore:hc-armoury-roll', name: 'The Armoury Roll', category: 'history', source: 'Clerk Benedict Strop, twice',
    body: 'The Old Armoury’s count of every sword in Edgewater, kept for a thousand years. In the champions’ rack, every champion’s blade hangs in its slot but one, which is dusted every week and labelled in brass: “Ferro: withdrawn, C. 1012.” It is the only sword in Edgewater ever taken out of service on purpose.',
  },
  {
    id: 'lore:hc-blade-watch-house', name: 'The Watch House Ladder', category: 'culture', source: 'Ser Basilio Trento, rung 61, once',
    body: 'Captain Rook Harrow keeps a chalk Ladder on the wall of the Brindlecross Watch House: eleven farmers, a halberd, and whoever else turns up. It records who is on watch and who owes whom a pint. The bottom rung gets the best bunk. Nobody ever challenges anybody.',
  },
  {
    id: 'lore:hc-swordsman-climb', name: 'The Champion’s Climb', category: 'history', source: 'chalk on the Storm Spire stair', hidden: true,
    body: 'Ser Auguste Vellacourt climbed the Storm Spire at Cliffstair chalking a challenge on every landing, to duel the Stormcrow so that its scream would carry his name across the ring. He signed each one with a smiling face. The chalk was smeared black wherever his blade wept on it.',
  },
  {
    id: 'lore:hc-blade-dancers', name: 'Blade Dancers', category: 'bestiary', source: 'Punt-woman Natsu, from her punt',
    body: 'Swords that dance in the mist of the Bamboo Shallows with nobody holding them. They were dancers, once. Lord Ikeda gave them the black tears, and the tears took the dancers out and left the swords. One of them, for thirty years, did not attack anyone. It was waiting for its partner.',
  },
  {
    id: 'lore:hc-fallen-pine', name: 'The Pine That Fell', category: 'history', source: 'Master Ren Tsuge, aloud, which is rare',
    body: 'A thousand-year pine on the Temple Road, which fell across it on the night of the Bell. Its rings run honey-coloured for nine hundred and seventy years. The last thirty are black all the way through, one for every year since the crown broke. Master Tsuge is making a bench of it, for the road.',
  },
  {
    id: 'lore:hc-old-tomoe', name: 'Old Tomoe', category: 'characters', source: 'the Ronin Camps',
    body: 'An old woman with a whetstone who sharpens anyone’s sword and asks no questions. She taught the Thousand-Edge General the edge, when he was a boy, and forgot to teach him the rest. Now she gives away a plain sheath with every sharpening. A sharp sword wants to be used, she says. Only a sheath can teach it to wait.',
  },
  {
    id: 'lore:hc-eleven-words', name: 'The Eleven Words', category: 'books', source: 'eleven slips, in eleven novices’ hands', hidden: true,
    body: 'In the year before the Bell, Sensei Kanemori spoke eleven words, one at a time, each to a different novice, and each novice wrote theirs down. In order of their dates they make one sentence: “The sheath, not the edge, is what a sword is for.”',
  },
  {
    id: 'lore:hc-samurai-quiet-pew', name: 'The Quiet Pew', category: 'places', source: 'Pilgrim-Mother Hisako, in one word',
    body: 'In the back pew of the Chapel of the Drowned Bell in Brindlecross, five Hushpine pilgrims have kept silence for thirty years. Brother Aldous lets them. Under the pew, far down through stone and bone, Bonelord Varric’s dead muster drills every night in silence. The pilgrims did not know. They only knew it should not be left alone.',
  },
  {
    id: 'lore:hc-samurai-threads', name: 'No Record, No Masters', category: 'history', source: 'cut threads under the Gloamwood', hidden: true,
    body: 'Lord Ikeda went under the Gloamwood and cut the Spinner Below’s threads, one by one, to free the Concord’s records from their weave: every Turning, every bearer, every oath. “No record,” he said, “no masters.” Wherever he cut, black chains tightened on the air around him.',
  },
  {
    id: 'lore:hc-lucia-ferro', name: 'Maestra Lucia Ferro', category: 'characters', source: 'the Fencing Quarter, behind her back',
    body: 'The only champion of the Ladder ever to retire. She beat Ser Auguste Vellacourt five touches to three on the night of the Hollowing, and walked away from the sword at the top. Her sword-hand has shaken for thirty years. She is very particular about feet.',
  },
  {
    id: 'lore:hc-auguste-vellacourt', name: 'Ser Auguste Vellacourt', category: 'characters', source: 'his admirers, of whom there are many',
    body: 'Champion of the Ladder, undefeated in thirty years but for one bout. Gracious, funny, golden, generous with autographs and touches. He salutes at the start of every duel and never at the end. His one loss was to Lucia Ferro, on the night of the Hollowing; he has asked her for a rematch every week since.',
  },
  {
    id: 'lore:hc-haru-kanemori', name: 'Sensei Haru Kanemori', category: 'characters', source: 'the novices of Hushpine, in signs',
    body: 'Abbot of the Hushpine Order, who spends his words for the year one at a time and has never wasted one. He has worn the same straw hat on the Temple Road for forty years. He has kept one word unspoken for thirty.',
  },
  {
    id: 'lore:hc-ikeda-shun', name: 'Lord Ikeda Shun', category: 'characters', source: 'the Ronin Camps',
    body: 'Warlord of the Ronin Companies: honest, generous and very easy to like. He pays his ronin fairly and frees pilgrims for the pleasure of it. Serve no one, he says, as I do. His sword hangs bare at his belt, and his hand has never been seen to leave the hilt.',
  },
];

export default entries;
