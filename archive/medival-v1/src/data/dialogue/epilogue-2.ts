/**
 * Epilogue slides, part 2 (docs/lore/14-act3-spec.md § Epilogue slides). Ysolde, the six companions,
 * and the Ashmarked. Owner: Claude 4.
 *
 * Companion slides are GATED: every entry includes that companion’s “met” condition and there is NO
 * unconditional fallback, so DialogueRunner.open() returns false for a companion never met and the
 * slide is skipped. dialogue:epilogue-ashmarked (the last slide) sets act3.epilogue_seen on the first
 * node of EVERY variant, which completes quest:the-heart-of-orr.
 */
import type { DialogueDef, NarrativeCondition, NarrativeEffect } from '@/core';

type Mood = 'neutral' | 'happy' | 'sad' | 'angry' | 'afraid' | 'hollow';
interface Variant { key: string; when?: NarrativeCondition; mood?: Mood; text: string[] }

/** gate: ANDed into every entry (companions). first: effects on every variant’s first node. */
function slide(id: `dialogue:${string}`, name: string, variants: Variant[], opts: { gate?: NarrativeCondition; first?: NarrativeEffect[] } = {}): DialogueDef {
  const nodes: DialogueDef['nodes'] = {};
  const entries: DialogueDef['entries'] = [];
  for (const v of variants) {
    v.text.forEach((text, i) => {
      const nodeId = i === 0 ? v.key : `${v.key}-${i + 1}`;
      nodes[nodeId] = {
        speaker: 'narrator', mood: v.mood ?? 'sad', text,
        next: i + 1 < v.text.length ? `${v.key}-${i + 2}` : null,
        ...(i === 0 && opts.first ? { effects: opts.first } : {}),
      };
    });
    const when = opts.gate ? (v.when ? { all: [opts.gate, v.when] } : opts.gate) : v.when;
    entries.push(when ? { when, node: v.key } : { node: v.key });
  }
  return { id, name, entries, nodes };
}

// ----- conditions
const f = (flag: string): NarrativeCondition => ({ flag });
const is = (flag: string, value: string): NarrativeCondition => ({ flag, op: '==', value });
const atLeast = (flag: string, value: number): NarrativeCondition => ({ flag, op: '>=', value });
const all = (...c: NarrativeCondition[]): NarrativeCondition => ({ all: c });
const any = (...c: NarrativeCondition[]): NarrativeCondition => ({ any: c });
const not = (c: NarrativeCondition): NarrativeCondition => ({ not: c });

const ending = (e: 'rekindle' | 'iron-lantern' | 'reforge' | 'quench' | 'usurp') => is('act3.ending', e);
const REKINDLE = ending('rekindle'), IRON = ending('iron-lantern'), REFORGE = ending('reforge'), QUENCH = ending('quench'), USURP = ending('usurp');
const keeper = (k: 'player' | 'ysolde' | 'hesta') => is('act3.keeper', k);
const QUENCH_DARK = all(QUENCH, not(is('act3.nhal_offer', 'refused')));
const USURP_WITH_NHAL = all(USURP, is('act3.nhal_offer', 'accepted'));
const LIVING = any(REKINDLE, REFORGE);

const fate = (y: 'turned' | 'spared' | 'slain') => is('act3.ysolde_fate', y);
const YSOLDE_LIVES = any(fate('turned'), fate('spared'));

// ----- companions
const c = (slug: string, key: string) => `companion.${slug}.${key}`;
const loyal = (slug: string, n = 70) => atLeast(c(slug, 'loyalty'), n);
const left = (slug: string) => f(c(slug, 'left'));
/** Anything that proves the companion was ever met and travelled with you. */
const knew = (slug: string, ...more: NarrativeCondition[]) =>
  any(f(c(slug, 'following')), left(slug), atLeast(c(slug, 'loyalty'), 0), ...more);

const MAREN = 'maren-hollis', ANSELM = 'anselm-pryde', CADOC = 'cadoc-ap-ynys', GRIMMA = 'grimma-ironsong', SABLE = 'sable', VESPER = 'vesper-qadri';

const MAREN_MET = knew(MAREN, f('prologue.complete'));
const ANSELM_MET = knew(ANSELM, f(c(ANSELM, 'path')), f('prologue.anselm_secret'), f('prologue.anselm_betrayed'), f('act2.anselm_freed'));
const CADOC_MET = knew(CADOC, f(c(CADOC, 'verse')), f('act1.ylwen_pact'));
const GRIMMA_MET = knew(GRIMMA, f(c(GRIMMA, 'ring')), f('act1.nails_exposed'), f('act1.nails_kept'));
const SABLE_MET = knew(SABLE, f(c(SABLE, 'fate')), { questCompleted: 'quest:the-quiet-hand' });
const VESPER_MET = knew(VESPER, f('npc.vesper-qadri.met'), f('act2.vesper_joined'), f('act2.vesper_betrayed'));

const TOBIN_HOME = any(f('act1.tobin_saved'), is('prologue.tobin_fate', 'saved'));
const TOBIN_GONE = any(f('act1.tobin_lost'), is('prologue.tobin_fate', 'dead'));
const oath = (o: 'blood' | 'justice' | 'hers') => is(c(MAREN, 'oath'), o);
const path = (p: 'reform' | 'inquisitor' | 'heretic') => is(c(ANSELM, 'path'), p);
const SUNG = is(c(CADOC, 'verse'), 'sung'), LEFT_DROWNED = is(c(CADOC, 'verse'), 'left');
const ring = (r: 'old' | 'new' | 'none') => is(c(GRIMMA, 'ring'), r);
const sable = (s: 'saved' | 'gone' | 'bound') => is(c(SABLE, 'fate'), s);
const VESPER_BETRAYED = f('act2.vesper_betrayed');
const VESPER_JOINED = all(f('act2.vesper_joined'), not(VESPER_BETRAYED));

const SEEN: NarrativeEffect[] = [{ setFlag: 'act3.epilogue_seen', value: true }];

const dialogues: DialogueDef[] = [
  // =====================================================================
  // 9. Ysolde: her fate × the ending
  // =====================================================================
  slide('dialogue:epilogue-ysolde', 'Epilogue: Ysolde Maerin', [
    {
      key: 'quench-slain', when: all(QUENCH, fate('slain')), mood: 'hollow',
      text: ['The Pale Saint did not live to see her wish come true. It came true anyway. In the Dreaming, they say, there is a girl in a white apron who follows an old woman with a burned hand from room to room of a house that has no doors, asking questions; and the old woman answers every one, and neither of them ever tires, and neither of them ever grows older, and it never, ever ends.'],
    },
    {
      key: 'quench-dark', when: QUENCH_DARK, mood: 'hollow',
      text: ['Ysolde Maerin saw, at the end, what she had done. Nhal had not lied to her about the sleep; it had only never told her who would stay awake. She is in the Drowned One’s world now, as everyone is, smiling, her black halo bright about her head. But of all the Hollowed in Morvane she alone sometimes stops in the middle of the one song, and frowns, as if trying to remember a word she used to know. The word is no.'],
    },
    {
      key: 'quench', when: QUENCH, mood: 'hollow',
      text: ['Ysolde Maerin had her wish, and it was as gentle as she had promised. In the Dreaming she sits beside a sickbed in Solenne that is never empty and never sad, and holds the hand of everyone she could not save from the Grey Lung, and the water no longer runs from her eyes. Sometimes she looks up, as if she has heard a door close somewhere far away. Then she looks down again. It is very quiet. She tells herself it was worth it.'],
    },
    {
      key: 'usurp-slain', when: all(USURP, fate('slain')), mood: 'hollow',
      text: ['Ysolde Maerin had died in her drowned cathedral. That was no hindrance any more. You raised her out of the black water on the first morning of your reign, and she opened her eyes, and knew you, and knelt. She serves you still, the Pale Saint of a new and stranger church. Whether the woman who kneels is Ysolde, or only the shape of her as you remember it, is a question neither of you has ever asked.'],
    },
    {
      key: 'usurp', when: USURP, mood: 'hollow',
      text: ['Ysolde Maerin knelt to you before anyone else did. She had wanted the world to dream, and you had made it something stranger, and she could not tell whether she had won or lost. She became your first priestess, robed in white, her black halo turned to flame. She speaks for you in Solenne and in Greywater. She has never once said what she thinks of what you have done, and you have never once needed to ask.'],
    },
    {
      key: 'iron-slain', when: all(IRON, fate('slain')), mood: 'afraid',
      text: ['Under the Iron Lantern, Ysolde Maerin’s name was cut from every stone in Solenne that had ever borne it, and the Wick fined any who spoke it aloud. Her body was never recovered from the drowned cathedral. Fishermen on the Greywater coast say that a woman in white walks the shallows on still nights, water running from her hair, looking north towards the new Brand as if she is waiting for it to fail.'],
    },
    {
      key: 'iron', when: all(IRON, YSOLDE_LIVES), mood: 'afraid',
      text: ['Castor Vellane had the Pale Saint tried in the Cathedral of the Brand, beneath the new light, before ten thousand witnesses. She made no defence. She burned on the cathedral steps at Lanternmass, and the black water ran out of her into the fire and hissed, and for a moment, the witnesses swore, she smiled. The Iron Lantern’s histories record it as the end of the Drowned Choir. It was not. It was the beginning of a new saint, prayed to in secret, by the cold.'],
    },
    {
      key: 'keeper', when: all(REFORGE, keeper('ysolde')),
      text: ['Ysolde Maerin stayed below. She had wanted to give the world a gentle sleep, and in the end she gave it a gentle waking instead, and kept the heart that made it possible. The Lanternate struck her name from the roll of saints, and then, in a later and wiser age, wrote it back in. In the Kingsvale they say that if you lay your ear to the ground on a still spring night you can hear water running somewhere deep, very softly, and that it is not weeping any more.'],
    },
    {
      key: 'reforge-turned', when: all(REFORGE, fate('turned')),
      text: ['Ysolde Maerin came up out of the Mirelands with the water still running from her eyes and hair, and lived. She would not go back to Solenne. She went to Greywater instead, to the villages the Choir had drowned in her name, and nursed the half-Hollowed there, as once she had nursed the sick of the Grey Lung. She never asked to be forgiven. When spring came, the water from her eyes ran thinner; and then one morning it was only tears.'],
    },
    {
      key: 'turned', when: fate('turned'),
      text: ['Ysolde Maerin lived. The Embers went back into the Heartfire and the Mire was chained again, and she knew better than anyone what that meant: that the cooling would come again in four hundred years, and someone else would look into the Brand and see the end. She spent the rest of her life writing it down, every vision, every reason, every mistake, so that whoever came next would not have to be alone with it, as she had been.'],
    },
    {
      key: 'spared', when: fate('spared'),
      text: ['The Pale Saint did not die beneath the drowned cathedral. She lived, broken, in a house of the Grey Monks in the Witherdowns, where the brothers fed her and read to her and asked nothing. She seldom spoke. When she did, it was to ask whether it was cold outside; and when they told her (less so each year) that it was not so very cold, she would nod, and close her eyes, and say quietly, “Good. Then I was wrong. Good.”'],
    },
    {
      key: 'slain',
      text: ['Ysolde Maerin died in the drowned cathedral she had made her seat, and the black water that had always run from her eyes ran out of her at last and was still. There is no grave. The Choir that followed her melted away within a season, its faithful wandering home from the marsh like sleepers waking. In Solenne her old cell in the Keeper’s quarters was sealed with her journals inside, and on its door someone wrote, in a hand very like Hesta Corrow’s: she was trying to help.'],
    },
  ]),

  // =====================================================================
  // 10a. Maren Hollis: Tobin, the oath, loyalty
  // =====================================================================
  slide('dialogue:epilogue-maren', 'Epilogue: Maren Hollis', [
    {
      key: 'quench', when: QUENCH, mood: 'hollow',
      text: ['In the dream Maren Hollis is home in Brindlecross, and Tobin is twelve again and late for supper, and she is shouting for him across the green, laughing, and he comes running. It happens every evening. It will happen every evening for ever. Her bow hangs on the wall beside the door, unstrung. She has not needed it in a long time, and she cannot think, now, why she ever did.'],
    },
    {
      key: 'usurp', when: USURP, mood: 'hollow',
      text: ['Maren Hollis was the only one who never called you by any of your new names. She went home to Brindlecross and hunted the Gloamwood, and married late and badly, and then, the second time, well. Every year on the Night of Falling Ash she lit the remembrance pyre and said your old name into the smoke, the one from before the mark, and waited to see if the fire would flicker. It always did. She was never sure whether that was an answer.'],
    },
    {
      key: 'iron', when: IRON, mood: 'afraid',
      text: ['Maren Hollis would not carry a licence for her own hearth. She told a Wick officer so in the square at Brindlecross, with an arrow nocked, and the Wick, which could have taken her, decided it would rather not. She lived out the years of the Iron Lantern in the Gloamwood, beyond the reach of its roads, and the fires in her hunting-lodge were unlicensed and very warm, and anyone fleeing the Wick could find their way to them.'],
    },
    {
      key: 'left', when: left(MAREN),
      text: ['Maren Hollis left before the end. She said she could not watch the friend she had grown up with turn into whatever the mark was making of them, and she went home to Brindlecross. She heard the news of the Heartforge from a pedlar, months late, and listened to all of it without a word, then went out into the Gloamwood and did not come back till dark. She never spoke of you again. But she kept the bowstring you broke when you were nine.'],
    },
    {
      key: 'stair', when: all(REFORGE, keeper('player'), loyal(MAREN)),
      text: ['Maren Hollis would not leave the long stair. When the others went up into the first spring she stayed at the bottom, and the Wardens brought her bread, and then, after a season, stopped bringing it, because she had built a hut there and was hunting the deep caves for her own. She lived beneath the Heartforge gate for thirty years, the nearest living soul to you. Every night she told the dark the news. Some nights, she swore, the stones grew warm.'],
    },
    {
      key: 'home-blood', when: all(TOBIN_HOME, oath('blood')),
      text: ['Maren Hollis killed Brother Sallow in the stilt-village and never once pretended to be sorry. She went home to Brindlecross with Tobin, and found that the anger she had carried all winter would not fit in the little house, and left it in the woodshed, mostly. Tobin grew tall and gentle and became a Hearthwarden, of all things. When folk asked Maren whether she had ever killed a man, she would say yes, once, and that she would do it again, and then ask after their children.'],
    },
    {
      key: 'home', when: TOBIN_HOME,
      text: ['Maren Hollis went home to Brindlecross with her brother. That was the whole of what she had wanted from the end of the world, and she had it. Tobin grew tall and quiet, and kept the black water out of his dreams with a lamp by his bed until he was old. Maren taught the village children to shoot, and laughed more than she had since she was small, and kept a chair by the fire for you, just in case, which nobody else was allowed to sit in.'],
    },
    {
      key: 'gone-blood', when: all(TOBIN_GONE, oath('blood')),
      text: ['Maren Hollis hunted the Drowned Choir for twenty years after the Heartforge, from Greywater to the Saltreach, and killed the last reed-priest of the old Choir with her own hand in a fishing-hut on the Fenwick shore. Afterwards she went home to Brindlecross and found she had no idea what to do with her hands. She took up carving: small wooden boys, dozens of them, set along every windowsill of her house, all facing the mere.'],
    },
    {
      key: 'gone-mercy', when: all(TOBIN_GONE, any(oath('justice'), f(c(MAREN, 'sallow_spared')))),
      text: ['Maren Hollis had lost her brother to the water, and still, in the end, she let the Choir’s priest live to answer for it. She never said whether she regretted that. She stayed on in Fenwick, of all places, among the eel-fishers whose children the Choir had taken, and taught them to shoot and to read the water. On every Lanternmass night she set a lantern out on the marsh for Tobin, and let it float away, and watched it until it was gone.'],
    },
    {
      key: 'gone', when: TOBIN_GONE,
      text: ['Maren Hollis never found her brother again, not in the reeds, not in the Mirelands, not in the dreams the black water sent her. She went home to Brindlecross when it was over, and the house was very quiet. She hunted, and mended, and grew grey early. Each spring she walked to the edge of the mere at Wennamere and called his name once across the water, as she had on the night he was taken, and then walked home, and did not call again until the next year.'],
    },
    {
      key: 'loyal', when: loyal(MAREN),
      text: ['Maren Hollis followed you to the bottom of the world and back, and afterwards she went home to Brindlecross and told no one about it, which for Maren was a kind of miracle. She hunted the Gloamwood, quarrelled with the reeve, and laughed easily again. When children asked her about the Ashmarked she said only that you had been a terrible shot as a child, and that she had loved you, and that both were true.'],
    },
    {
      key: 'home-plain',
      text: ['Maren Hollis went home to Brindlecross when it was over, with her bow and her temper and a great many things she would not talk about. She hunted the Gloamwood, as her father had. She lit the remembrance pyre every year on the Night of Falling Ash, and stood beside it longer than anyone else, and when they asked her what she was thinking of she said: the first spark, and the friend who caught it.'],
    },
  ], { gate: MAREN_MET }),

  // =====================================================================
  // 10b. Brother Anselm Pryde: his path
  // =====================================================================
  slide('dialogue:epilogue-anselm', 'Epilogue: Brother Anselm', [
    {
      key: 'quench', when: QUENCH, mood: 'hollow',
      text: ['In the dream Brother Anselm Pryde says the Lanternmass in the Abbey of Saint Wenna, and the nave is full, and Wenna herself stands at his shoulder, holding the lamp. The water comes up to the height of the pews, and nobody minds. Every night he preaches on the same text, the light that does not go out, and every night his congregation smiles up at him with black eyes; and every night, for a moment, his voice falters, and he does not know why.'],
    },
    {
      key: 'usurp', when: USURP, mood: 'hollow',
      text: ['Brother Anselm Pryde was the first to write your scripture, and the first to burn it. He had once believed in a god who could not be seen, and found he could not believe in one he had known as a friend. He went back to the Abbey of Saint Wenna and kept her old lamp lit, and said the old prayers to the Seven, to an empty nave, at every hour, until the end of his life. Out of courtesy, he said, in case they were still listening.'],
    },
    {
      key: 'iron-inquisitor', when: all(IRON, path('inquisitor')), mood: 'afraid',
      text: ['Brother Anselm Pryde became an Inquisitor of the Wick in the second year of the Iron Lantern, and a famous one by the fifth. He was gentle, everyone said, and fair, and never once burned a mage he had not first tried to save. He kept a book of their names. When he was old he would sit in the cathedral at Solenne and read it, and sometimes weep, and the young inquisitors who saw him thought it was piety. It may have been.'],
    },
    {
      key: 'iron', when: IRON, mood: 'afraid',
      text: ['Brother Anselm Pryde would not carry the Wick’s licences to the villages, and said so from the pulpit at Haldren. He was taken to Valcastre, where he had been taken once before. This time no one came for him. He preached to the prisoners in the cells for eleven years, a gentle, stubborn heresy about a light that needed no Church to hold it, and the guards set to silence him took to listening instead.'],
    },
    {
      key: 'valcastre', when: all(f('prologue.anselm_betrayed'), not(f('act2.anselm_freed'))),
      text: ['Brother Anselm Pryde was never freed from Valcastre. The cells there are deep and the Wick’s ledgers long, and in the confusion of the war his name was simply not called. He lived. In time a guard who had it from a pilgrim told him that the world had been saved. He asked who had saved it, and was told, and was silent a long while. Then he said, “Good,” and asked for a candle, and was refused, and prayed in the dark.'],
    },
    {
      key: 'left', when: left(ANSELM),
      text: ['Brother Anselm Pryde left the Ashmarked’s company before the end, with a blessing and an apology, neither of which you had asked for. He went back to Brindlecross and his little chapel, and said his offices, and buried the village dead, and christened its children. When the news came from the Heartforge he rang the chapel bell himself, all night, until his hands bled. In the morning he could not say whether he had been rejoicing or keeping a vigil.'],
    },
    {
      key: 'reform', when: path('reform'),
      text: ['Brother Anselm Pryde went back to the Church and set about mending it from within, which he had once thought impossible, and later found was only very slow. He became Prior of Haldren, and then, to his dismay, a bishop. He reconsecrated Saint Wenna’s abbey with his own hands. His sermons on mercy were copied, and banned, and copied again, and in the end were read aloud in Solenne itself, by a Hierophant who had never met him and wept at them.'],
    },
    {
      key: 'inquisitor', when: path('inquisitor'),
      text: ['Brother Anselm Pryde took the vows of the Wick, as he had sworn in his heart at Saint Wenna’s, believing that a fire left unattended will burn the house down. He was the kindest inquisitor the Order ever had, which is not saying a great deal, and he knew it. He trimmed the wicks of the world with a steady hand for forty years. Those he saved remembered him gratefully. Those he did not save did not remember anything, and he remembered them for them.'],
    },
    {
      key: 'heretic', when: path('heretic'),
      text: ['Brother Anselm Pryde left the Lanternate and took nothing from it but Saint Wenna’s lamp. He preached at crossroads and in barns and on the steps of shut chapels, a faith with no Church and no licence, only a light passed from hand to hand. The Hierophancy excommunicated him twice. He had both letters framed. When he died, in a hayloft in the Witherdowns, two hundred people came to bury him, and not one of them had ever been inside a cathedral.'],
    },
    {
      key: 'loyal', when: loyal(ANSELM),
      text: ['Brother Anselm Pryde came home from the bottom of the world with his faith neither broken nor whole, but changed, as a bone is changed that has knit. He kept the chapel at Brindlecross for the rest of his life. He prayed for you every morning, by name, the true one, though the Church had a dozen opinions about what you were. Asked once by a bishop whether you were a saint or a heretic, he said that you were his friend, and that God could sort out the rest.'],
    },
    {
      key: 'chapel',
      text: ['Brother Anselm Pryde went back to Brindlecross and his chapel when it was over, and lit its lamps, and said its offices, and found that the words meant something different now, and that he did not mind. He was a gentle priest and a doubtful one, and his congregation, who had known him all their lives, loved him for both. He kept a candle burning in the chapel window for you every Lanternmass, and never told anyone whom it was for.'],
    },
  ], { gate: ANSELM_MET }),

  // =====================================================================
  // 10c. Cadoc ap Ynys: the last verse
  // =====================================================================
  slide('dialogue:epilogue-cadoc', 'Epilogue: Cadoc ap Ynys', [
    {
      key: 'quench', when: QUENCH, mood: 'hollow',
      text: ['Cadoc ap Ynys sang to the Mire as it rose, because that is what his people do, and because he had been wanting to finish a song for three hundred years. In the dream he is a boy in Ys Aerwen, still the youngest in his family, running across roofs the colour Rhiannon could never remember, and the bells are ringing, and nothing has sunk. He is very happy. He has stopped making jokes. Those who knew him would find that the most frightening thing of all.'],
    },
    {
      key: 'usurp', when: USURP, mood: 'hollow',
      text: ['Cadoc ap Ynys came to the Heartforge gate once a year, every year, and sang down the stair: the Lullaby, all of it he knew, very softly. It was not meant to put you to sleep, he said. It was to remind you what sleep had sounded like, before you became a thing that never needed it. He was three hundred and some years old when you became the Heart. He is coming still, and he is still the youngest in his family, and he no longer finds that funny.'],
    },
    {
      key: 'iron', when: IRON, mood: 'afraid',
      text: ['Cadoc ap Ynys went home to the deepwood when the Iron Lantern rose, and the Thornwall closed behind him. He was seen outside it only once more, at Haldren, on the night the Wick burned the last hedge-witch of the Kingsvale. He stood at the back of the crowd and sang, and the fire would not take, and when the inquisitors turned to look for the singer there was no one there but a tall stranger, laughing, who had always been much faster than he looked.'],
    },
    {
      key: 'left', when: left(CADOC),
      text: ['Cadoc ap Ynys left before the end, with a joke that did not quite land and a bow that did not quite meet your eye. He went back to the Thornwall and kept it, as he had before you came. When word reached the deepwood of what had happened beneath the mountains, he sat for a long time with his thornbow across his knees, not stringing it, not mending it, only holding it. Then he went and sang to a seep, quietly, as he had when he was young.'],
    },
    {
      key: 'reforge-sung', when: all(REFORGE, SUNG),
      text: ['Cadoc ap Ynys broke his people’s oath and sang the last verse of the Lullaby to the Mire, and the world was saved by it. The Thornwise forgave him eventually, and an Aelthi eventually is a long time. He went back to the Thornwall as its keeper and grew old there, which for an Aelthi means very little, and told every traveller who passed the same story, with a different joke at the end each time. The story was true. The jokes were mostly about you.'],
    },
    {
      key: 'reforge', when: REFORGE,
      text: ['Cadoc ap Ynys sang the Lullaby at the Heartforge, all of it that was left to sing, and when he came to the place where the last verse should have been he was silent, and the silence was enough. Afterwards he said that he had always suspected the song was cleverer than the singers. He went home to the deepwood a hero and was very rude about it, and when the first spring came he lay down on the new grass beyond the Thornwall and slept for three days.'],
    },
    {
      key: 'sung', when: SUNG,
      text: ['Cadoc ap Ynys brought the last verse of the Lullaby up from the drowned court of Ys, and in the end it was not sung. He did not reproach you. He said there would be another winter, and another Ashmarked, and that a song is a thing for keeping as much as for singing. He taught the verse to one Aelthi child, a girl with a crooked laugh, and made her promise to teach it to one more. That was all. It was, he said, the most hopeful thing he had ever done.'],
    },
    {
      key: 'drowned', when: LEFT_DROWNED,
      text: ['Cadoc ap Ynys left the last verse of the Lullaby where it lay, drowned with Ys Aerwen, and never said whether he regretted it. Some songs, he told you once, belong to the dead who sang them. He went back to the Thornwall afterwards and kept it, as he had before you came, and grew no older that anyone could see. Now and then, on the shore of the lake where Ys went down, he could be found sitting with his feet in the water, listening for bells.'],
    },
    {
      key: 'thornwall',
      text: ['Cadoc ap Ynys went back to the Thornwall when it was over and kept it, as he had before you came, and was rude to every traveller who came to see the Aelthi who had walked with the Ashmarked. He said it had been a long walk and the company indifferent. He said it every time. Nobody believed him, least of all Cadoc, who was three hundred years old and still the youngest in his family, and had at last found something to be proud of.'],
    },
  ], { gate: CADOC_MET }),

  // =====================================================================
  // 10d. Grimma Ironsong: the Nails and the oath-ring
  // =====================================================================
  slide('dialogue:epilogue-grimma', 'Epilogue: Grimma Ironsong', [
    {
      key: 'quench', when: QUENCH, mood: 'hollow',
      text: ['Grimma Ironsong was at her anvil when the water came, and she did not stop working. In the dream she is forging the Tenth Nail, the one that will finally hold, and the iron is perfect, and her clan-mother is watching from the forge door with pride. She has been forging it for a very long time. Each morning she begins it again. She has never once wondered why it is never finished, and the Mire is careful never to let her.'],
    },
    {
      key: 'usurp', when: USURP, mood: 'hollow',
      text: ['The Concord asked Grimma Ironsong to forge a crown for the new god, since she had known you, and she was the best. She forged a nail instead, a long one of true-iron, and set it on the Thane-Hall table without a word. They understood her. Orrun usually do. She left Korrath that night for the high passes, and the nail is in the Hall still, under glass, and the clan-mothers show it to their children, and do not explain.'],
    },
    {
      key: 'iron', when: IRON, mood: 'afraid',
      text: ['When the Wick came to Dun Korrath-Gate wanting true-iron for its lanterns, it was Grimma Ironsong who met them, and it is still disputed in the Concord’s ledger what exactly she said. The Orrun record notes only that the Wick did not return to the gate for nine years, and that when it did it brought a much larger escort, and an apology. Grimma lived long, and forged much, and never in her life made anything that would hold a flame.'],
    },
    {
      key: 'kept', when: f('act1.nails_kept'),
      text: ['Grimma Ironsong never forgave you for keeping the Concord’s secret at the gate. She went west into the mountains alone, and kept a forge on a cold ledge above the Ironspine where no thane’s writ ran, and told the truth about the Nails to anyone who climbed that far to hear it. Few did. She was right, as she had always been; and in the long run, which is the only run the Orrun respect, the ledger came round to saying so.'],
    },
    {
      key: 'left', when: left(GRIMMA),
      text: ['Grimma Ironsong left before the end. She said that she had told the truth once and been exiled for it, and that she would not wait to be exiled again. She went back to her forge outside Dun Korrath-Gate and worked it alone. When news of the Heartforge reached her she put down her hammer, which no one had ever seen her do, and walked up to the gate, and stood before it a long while. Then she went back to work.'],
    },
    {
      key: 'ring-old', when: ring('old'),
      text: ['Grimma Ironsong stood before her clan-mother with the oath-ring reforged as it had been, and Ulka Ironsong put it on her hand without a word. Her name went back into the ledger of Clan Ironsong, in the same line it had been scratched from. She became Thane-Speaker at the gate, and was the bluntest the Concord had ever had, and the most trusted. When young smiths asked her how one restores an honour, she told them: you tell the truth, and then you wait. It is mostly waiting.'],
    },
    {
      key: 'ring-new', when: ring('new'),
      text: ['Grimma Ironsong’s oath-ring was forged anew in the Ashmark’s fire, and it glowed faintly in the dark, which embarrassed her terribly. The old clan would not have it. So she founded a new one, the first in the Concord in six hundred years, whose oath-rings are forged hot from a fire the old clans never had. Clan Emberiron, they called it, against her protests. Its first law is that no secret shall be kept in its forge. Its second, added later, is that this includes Grimma’s.'],
    },
    {
      key: 'ring-none', when: ring('none'),
      text: ['Grimma Ironsong refused her clan when it would have taken her back. She said she had learned to stand without them, and did not care to be taught to kneel again. She kept her forge outside Dun Korrath-Gate, belonging to no clan and no ledger, and smiths came from every hold to learn from her, and went home, and were never quite so obedient again. The thanes complained. The mountain, she noted, did not.'],
    },
    {
      key: 'nail', when: f('act2.new_nail'),
      text: ['Grimma Ironsong forged the new Nail in the Vault of Korrath, and the mountain grew quiet, and the Concord could no longer pretend she had ever been wrong. She did not gloat. She said it was beneath a runesmith to gloat, and then gloated, at length, at every feast for the rest of her life. She took apprentices, Orrun and human both, and taught them that iron does not lie, and that therefore neither should they.'],
    },
    {
      key: 'forge',
      text: ['Grimma Ironsong went back to her forge outside Dun Korrath-Gate when it was over, and lit it, and worked. The Concord sent word, now and then, that she might be welcome inside again; she sent word back, now and then, that she was busy. She was. Half the true-iron in the Haldmarch passed under her hammer in the years after, and every piece of it bore a small mark on the tang: a hammer, and an anvil, and a spark.'],
    },
  ], { gate: GRIMMA_MET }),

  // =====================================================================
  // 10e. Sable: the Quiet Hollowing
  // =====================================================================
  slide('dialogue:epilogue-sable', 'Epilogue: Sable', [
    {
      key: 'quench-gone', when: all(QUENCH, sable('gone')), mood: 'hollow',
      text: ['Sable went to the water long before the rest of the world followed her, and when it came she was waiting for it at the edge of the reeds, laughing. In the dream she shows them all round, as a thief shows a newcomer round the city: here is where nothing hurts, here is where nobody is cold, here is where the lost things are kept. She is a very good guide. She has been here longest. She has quite forgotten that she was ever anywhere else.'],
    },
    {
      key: 'quench', when: QUENCH, mood: 'hollow',
      text: ['Sable had been half in the dream for years; when the rest of the world came to join her, she was the only one not surprised. She sits on the roofs of drowned Haldren, picking the locks of houses that no one will ever need to lock again, and she laughs, and the black tears run down her face, and she does not wipe them away. She has nothing left to hide them from.'],
    },
    {
      key: 'gone', when: sable('gone'),
      text: ['Sable went to the water at Tobin’s Reeds with her dignity, her lockpicks and a joke you will not repeat, and the water closed over her, and she was gone. The Quiet Hand held a wake for her in the den beneath Haldren, and drank a great deal, and stole a great deal more in her honour. On still nights in Greywater the eel-fishers hear someone whistling out on the marsh, cheerfully, off-key. Nobody goes to look.'],
    },
    {
      key: 'usurp', when: USURP, mood: 'hollow',
      text: ['Sable was half Mire and half mischief, and you had become a god of both. Of all your old companions she alone seemed to enjoy it. She appointed herself your high priestess, unasked, and stole one candle from every temple raised to you, by way of tithe. Her tears ran black or clear as she pleased, now, and she used both to great effect at card tables. When asked what she believed in, she said she believed in you, mostly, on alternate Ashdays.'],
    },
    {
      key: 'iron-saved', when: all(IRON, sable('saved')), mood: 'afraid',
      text: ['Under the Iron Lantern the Wick burned the half-Hollowed wherever it found them, and it never found Sable, because the Ashmark had left her no black tears to betray her. She went back to the Quiet Hand and robbed the Church with a clear conscience and a light step for thirty years. Every licence she stole she burned. Every Hollowed child she could reach she smuggled out of Haldren to the deepwood, and none of them ever learned her name.'],
    },
    {
      key: 'iron', when: IRON, mood: 'afraid',
      text: ['Under the Iron Lantern the Wick burned the half-Hollowed wherever it found them. It never found Sable. She went down into the undercity beneath Haldren, among the drains and the old cellars, and the Quiet Hand kept her fed, and the inquisitors who went looking for her came back with their purses lighter and their lanterns out. She grew colder every year. She laughed about it. In the end the Hand stopped hearing from her, and kept a place for her at table anyway.'],
    },
    {
      key: 'saved', when: sable('saved'),
      text: ['The Ashmark burned the black water out of Sable at Tobin’s Reeds, and it hurt, and she said so at considerable length. She was the proof that someone half gone can come back. She went back to the Quiet Hand and was running it within the year, and under her the Hand stole from nobody who could not afford it. She wept now and then, afterwards, ordinary salt tears, and was absurdly pleased about it every time.'],
    },
    {
      key: 'bound-reforge', when: all(REFORGE, sable('bound')),
      text: ['Sable went to the Thornwise, bound in Aelthi song, and lived in the deepwood while the singing held her together. Then the Mire was sung to its true sleep, and the singing in her ears stopped, and one morning she woke and her hands were warm. She cried for a whole day, black tears and then clear ones, and then she stole Archdruid Rhiannon’s second-best brooch, to prove she was herself again, and gave it back, to prove she was better.'],
    },
    {
      key: 'bound', when: sable('bound'),
      text: ['Sable lived in the deepwood, held together by Aelthi song, the way a cracked bell is bound with wire. She was not cured. She was not lost. Every Lanternmass she slipped out past the Thornwall to Haldren to steal something, for old times’ sake, and was back before the binding wore thin. The Thornwise said she was the worst guest they had ever had. They also said, when she was not listening, that they would keep singing for as long as she needed.'],
    },
    {
      key: 'left', when: left(SABLE),
      text: ['Sable left before the end, which was very like her: no farewell, only a note in your pack in a looping hand that said she had taken a few things and would bring them back someday, possibly. She went back to Haldren and the Quiet Hand. Nobody there ever saw her cry, black tears or otherwise. Years later a small box arrived at Cinderhold, addressed to you, with all of the few things inside, and one more besides.'],
    },
    {
      key: 'cold',
      text: ['Sable never let anyone help her, in the end. She went back to the Quiet Hand and the rooftops of Haldren, and wiped the black tears away when anyone was looking, and joked about her cold hands until the joke wore thin and then for a while after. She grew quieter, year by year. The Hand say she is still out there somewhere on the roofs, and that if you leave a window open on a still night something small and valuable will be gone by morning, and you will hear someone laughing.'],
    },
  ], { gate: SABLE_MET }),

  // =====================================================================
  // 10f. Vesper Qadri, the Red Abbess
  // =====================================================================
  slide('dialogue:epilogue-vesper', 'Epilogue: Vesper Qadri', [
    {
      key: 'quench', when: QUENCH, mood: 'hollow',
      text: ['Vesper Qadri burned to the very last, because she would not sleep while there was fire in her. Then there was not. In the dream she is Sister Vesper again, of the Lamp-house at Valcastre, and the old midwife is alive and well and scolding her for reading by a candle, and nobody has been burned, and nobody ever will be. She keeps her breviary open on her knees. She has not turned a page of it in a very long time.'],
    },
    {
      key: 'betrayed-iron', when: all(IRON, VESPER_BETRAYED), mood: 'afraid',
      text: ['You sold Vesper Qadri to Benedetta Aurevine on Gull Rock, and under the Iron Lantern the Church made the most of its bargain. The Red Abbess was kept at Valcastre, in the Lamp-house where she had once been a nun, and brought out each Lanternmass to watch the heretics burn. She never broke. She never spoke your name. When she died, old and still unbowed, the guards found the walls of her cell scorched black from floor to ceiling, and no fire anywhere.'],
    },
    {
      key: 'betrayed', when: VESPER_BETRAYED,
      text: ['You sold Vesper Qadri to Benedetta Aurevine on Gull Rock, and she did not stay sold. She broke out of Valcastre in the third winter after, and the Lamp-house burned behind her, and the Ashen Creed rose to meet her in every city of the Haldmarch. She sent you one letter, years later. It was blank, and its corners had been burned. You kept it. You never decided whether it was a threat, or a forgiveness, or only the truest thing she had to say.'],
    },
    {
      key: 'usurp', when: USURP, mood: 'hollow',
      text: ['Vesper Qadri had said all her life that fire belonged to everyone. Now it belonged to you, and she could not forgive you for it, and she could not stop loving the fire. She burned your first temple in Solenne, and your second in Haldren, and was standing in the ashes of the third when you asked her, very gently, through every flame in the city, to stop. She did. That was what frightened her most.'],
    },
    {
      key: 'iron', when: IRON, mood: 'afraid',
      text: ['The Iron Lantern hunted the Red Abbess for twenty years and never caught her. Vesper Qadri burned Wick-chapterhouses from Valcastre to the Saltreach, freed licensed mages from their licences and imprisoned ones from their cells, and still read her breviary every night by the light of whatever she had set on fire. They say she died in the Cinder Wastes, among the glass ruins of Qadir. They also say she did not. The Wick keeps a lantern burning for her in Solenne, in case she comes back for it.'],
    },
    {
      key: 'left', when: any(left(VESPER), f('act2.vesper_left')),
      text: ['Vesper Qadri left the Ashmarked at the Glass Throne, or near enough, and took the Ashen Creed with her. She did not come to the Heartforge. When she heard how it had ended she was in a cellar in Haldren, teaching a stable-boy to light a candle with his thumb, and she finished the lesson before she let herself sit down. Then she laughed, and wept, and lit every candle in the cellar, one by one, and said a prayer from the breviary she still kept.'],
    },
    {
      key: 'glass', when: all(VESPER_JOINED, f('act2.vesper_held_glass')),
      text: ['Vesper Qadri had held the Glass Ember for one night in the ruins of Qadir, and given it back at dawn, and she never forgot either the holding or the giving. After the war she went back to the Cinder Wastes and made the Ashen Creed into something nearer a church than she would ever admit, with no licences and no Wick, and one rule written over the door of every cell: what you are given to hold, you give back. She kept it better than anyone. She had practised.'],
    },
    {
      key: 'loyal', when: all(VESPER_JOINED, loyal(VESPER)),
      text: ['Vesper Qadri came out of the war the most powerful free mage in the world, and laid most of it down. She opened a school in the Lamp-house at Valcastre, where the Wick had once burned her midwife, and taught any child who came to her how to hold a flame without letting it hold them. She was a terrible headmistress and a wonderful teacher. She read her breviary every night. She wrote to you every Ashday, long, furious, affectionate letters, and never once expected an answer.'],
    },
    {
      key: 'joined', when: VESPER_JOINED,
      text: ['Vesper Qadri went home to the Ashen Creed when it was over, and found it larger and angrier than she had left it, and spent the rest of her life trying to keep it from burning down the world she had helped to save. It was harder than burning abbeys. She managed it, mostly. The Red Abbess grew grey in the Cinder Wastes, among the glass ruins of Qadir, still reading her breviary each night, still quick to laugh and quicker to burn.'],
    },
    {
      key: 'met',
      text: ['You met the Red Abbess once, on Gull Rock, amid the smoke and the bidding, and she never walked with you. The Ashen Creed went on without the Ashmarked, in cellars and on margins, burning licences and quarrelling with itself. Vesper Qadri grew grey in the Cinder Wastes. Asked in her old age whether she had known the Ashmarked, she said only that she had once offered you a cup of wine, and you had not drunk it, and she still wondered what would have happened if you had.'],
    },
  ], { gate: VESPER_MET }),

  // =====================================================================
  // 11. The Ashmarked: the player, by ending and keeper. Every variant sets act3.epilogue_seen.
  // =====================================================================
  slide('dialogue:epilogue-ashmarked', 'Epilogue: The Ashmarked', [
    {
      key: 'keeper', when: all(REFORGE, keeper('player')),
      text: [
        'And you. You sit in the warm dark beneath the mountains, at the anvil of Orr’s ribs, with the new heart beating slow beneath your marked hand. You do not grow old. You do not sleep, though you have learned to rest. Sometimes, far above, someone sings a scrap of the Lullaby, or speaks your name into a fire, and you hear it, and the heart beats a little warmer, and somewhere a field thaws a day early.',
        'The Grey Monks keep a book for you in the Witherdowns, the only one in which your true name is written: {player.name}. Its last line was set down in the first spring. It reads: Kept the fire. Did not come back. Was not forgotten.',
      ],
    },
    {
      key: 'returned-ysolde', when: all(REFORGE, keeper('ysolde')),
      text: [
        'You came up the long stair alone into the first spring in a generation, and the light hurt your eyes. The Ashmark on your hand had gone quiet; it was only a scar now, in the shape of a coal, warm when you held it to your cheek. You lived. That was the strangest thing of all, after everything: you were allowed simply to live.',
        '{player.name} grew old in the Haldmarch, and was mostly happy, and was never once cold. When at last you died, in the ordinary way, at the end of a long and ordinary life, they say the ground above the Heartforge grew warm for a single night, as if someone far below had turned to say goodbye.',
      ],
    },
    {
      key: 'returned-hesta', when: all(REFORGE, keeper('hesta')),
      text: [
        'You came up the stair alone, with Hesta’s last instruction still ringing in your ears. It had been about your posture. At Cinderhold you sat down in her chair by the brazier because there was nowhere else to sit, and found, over the years, that it fitted.',
        'In time the order gave you her old rank, though no one could agree on the word for it, and you would answer to none. {player.name} taught a thousand Kindling to hold fire without fear, and was rude to all of them, and was right. The Ashmark faded to a pale scar. Every spring you went down the long stair to tell her the news, and every spring the stones were warm, and once, only once, you heard her cough.',
      ],
    },
    {
      key: 'iron-hand', when: all(IRON, any(is('act2.church_stance', 'pledged'), { rep: 'faction:lanternate', min: 25 })), mood: 'afraid',
      text: [
        'The Church gave you a title, Hand of the Hierophant, and a white cloak, and a seat at the Lord-Inquisitor’s right side beneath the new Brand. You were the proof of its order: the Ashmarked, kneeling. Pilgrims touched the hem of your cloak for luck.',
        '{player.name} lived long and was honoured always, and sometimes, in the cathedral at night, you would hold your marked hand to the Iron Lantern and feel nothing at all, no warmth, no ache, and wonder when exactly that had happened, and whether you had chosen it.',
      ],
    },
    {
      key: 'iron', when: IRON, mood: 'afraid',
      text: [
        'The Wick came for you in the third year of the Iron Lantern, politely, with a writ. The Ashmark was unlicensed fire, and the new order could not abide an exception, least of all the one that had made it possible. You did not let them take you. You went into the wild places, the deepwood and the high passes and the glass streets of Qadir, and the Wick followed, and never caught you.',
        'They say {player.name} lives yet, somewhere beyond the reach of the white light, and that in the villages where the Wick is hated the old women still leave one hearth unlicensed and one door unbarred, in case the Ashmarked should pass that way, and need a fire.',
      ],
    },
    {
      key: 'quench-dark', when: QUENCH_DARK, mood: 'hollow',
      text: [
        'Nhal kept you awake. Of all the people of Morvane you alone were not given the sleep, because the Drowned One wanted someone to see. You are its favourite. Each morning it shows you the world, smiling, and asks if you are pleased, and you have learned that it is better to say yes.',
        'You walk the drowned roads of the Haldmarch, {player.name}, among people you once knew, who smile at you with black eyes and do not remember your name. The Ashmark still burns in your palm, faintly, the last fire in the world. It is not enough to light anything. It is only enough to keep you from forgetting.',
      ],
    },
    {
      key: 'quench', when: QUENCH, mood: 'hollow',
      text: [
        'You were the last to fall asleep, {player.name}, because the mark would not let you. You sat on the steps of the Heartforge with the dead fire at your back and watched the world go soft and quiet. Then the Ashmark went out, like the last lantern of Lanternmass, and you lay down in the warm water, and dreamed.',
        'In the dream you are whoever you were before the mark. You do not remember the mark at all, nor the Embers, nor any of the long road. You are not sorry. That is the one thing this chronicle cannot forgive you; but there is no one left to read it, and you will never wake to mind.',
      ],
    },
    {
      key: 'usurp-nhal', when: USURP_WITH_NHAL, mood: 'hollow',
      text: [
        'You are the Heart now, {player.name}, you and the Drowned One together, and you have long since stopped knowing where you end and it begins. The world beats to your two-voiced pulse. Prayers rise to you like warm air, and you answer some of them, and you cannot always say which of you decided which.',
        'Sometimes, in the deep, you remember a village, a pyre, a friend with a bow. It hurts. Nhal does not understand why you keep the memory. You keep it anyway. It is the last thing that is only yours.',
      ],
    },
    {
      key: 'usurp-mercy', when: all(USURP, { rep: 'faction:drowned-choir', min: 0 }), mood: 'hollow',
      text: [
        'The Hollowed loved you first, and loved you best. You had shown them mercy when no one else would, and when you became the Heart you did not unmake them. You let them be. They walk the world beside the living now, cold-handed and quiet, and the living have learned not to flinch.',
        'You are a god of the half-gone, {player.name}: of the drowned and the burned and the in-between. Whether that makes you merciful or monstrous is argued in a hundred temples. You have heard every argument. You have not yet decided. You have, after all, a very long time.',
      ],
    },
    {
      key: 'usurp', when: USURP, mood: 'hollow',
      text: [
        'You became the Heart of the world, {player.name}, and the world did not end. That is the most that can be said of it, and the chroniclers have learned to say it carefully. Fire and Mire answer to you. The seasons turn at your whim. Your name is a prayer in some mouths and a curse in others, and you hear both, always, all at once.',
        'Some nights you try to remember what it was to be cold, or hungry, or afraid, and find that you cannot. You were warned of that. You did not listen. Down in the deep, beneath the mountains, the thing you have become beats on, and the world beats with it, because it has no choice.',
      ],
    },
    {
      key: 'rekindle-saint', when: all(LIVING, is('act2.church_stance', 'pledged')),
      text: [
        'The Lanternate made you a saint while you were still alive, which you found extremely uncomfortable. There were icons. There were relics, most of them forged. Pilgrims came to Cinderhold to touch the hand that had carried the Embers down, and you let them, because it seemed to help.',
        'The Ashmark faded over the years, as a burn does, until it was only a pale shape on your palm that ached before snow. {player.name} lived long and was honoured always, and some winters, when the cold came early, you would stand at the door looking at the frost and counting. Four hundred years. You hoped whoever stood before the Heartfire next would choose better than you had.',
      ],
    },
    {
      key: 'rekindle',
      text: [
        'And you, {player.name}, who carried seven Embers down into the dark and gave them back: you lived. The Ashmark faded slowly over the years, as a burn does, until it was only a pale shape on your palm that ached before snow. You never told anyone all that you had seen at the bottom of the world.',
        'Some winters, when the cold came early, you would stand at the door a long while, looking at the frost, and counting. Four hundred years. It would not be your choice next time. You hoped that whoever made it would choose better; and then, on the coldest nights, you wondered whether you could have.',
      ],
    },
  ], { first: SEEN }),
];

export default dialogues;
