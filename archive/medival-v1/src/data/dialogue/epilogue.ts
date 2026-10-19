/**
 * Epilogue slides, part 1 (docs/lore/14-act3-spec.md § Epilogue slides; endings in 06-campaign.md).
 * Opened in order by quest:the-heart-of-orr `epilogue`; they queue. Each slide's entries pick ONE
 * variant (most specific first) and every slide here ends with an unconditional fallback.
 * Slides: world, haldmarch, church, wardens, thornwise, orrun, north, salt-and-ash.
 * Companions, Ysolde and the Ashmarked are in epilogue-2.ts. Owner: Claude 4.
 *
 * Voice: an elegiac chronicle in the past tense. Under quench and usurp the chronicle is written as if
 * the world dreams, or as if the new god reigns; under the Iron Lantern, order, fire and fear.
 */
import type { DialogueDef, NarrativeCondition } from '@/core';

type Mood = 'neutral' | 'happy' | 'sad' | 'angry' | 'afraid' | 'hollow';
/** One variant: 1–3 narrator nodes. `use` points the entry at another variant's first node instead. */
interface Variant { key: string; when?: NarrativeCondition; mood?: Mood; text?: string[]; use?: string }

function slide(id: `dialogue:${string}`, name: string, variants: Variant[]): DialogueDef {
  const nodes: DialogueDef['nodes'] = {};
  const entries: DialogueDef['entries'] = [];
  for (const v of variants) {
    const text = v.text ?? [];
    text.forEach((t, i) => {
      const nodeId = i === 0 ? v.key : `${v.key}-${i + 1}`;
      nodes[nodeId] = { speaker: 'narrator', mood: v.mood ?? 'sad', text: t, next: i + 1 < text.length ? `${v.key}-${i + 2}` : null };
    });
    const node = v.use ?? v.key;
    entries.push(v.when ? { when: v.when, node } : { node });
  }
  return { id, name, entries, nodes };
}

// ----- conditions
const f = (flag: string): NarrativeCondition => ({ flag });
const is = (flag: string, value: string): NarrativeCondition => ({ flag, op: '==', value });
const all = (...c: NarrativeCondition[]): NarrativeCondition => ({ all: c });
const any = (...c: NarrativeCondition[]): NarrativeCondition => ({ any: c });
const not = (c: NarrativeCondition): NarrativeCondition => ({ not: c });

const ending = (e: 'rekindle' | 'iron-lantern' | 'reforge' | 'quench' | 'usurp') => is('act3.ending', e);
const IRON = ending('iron-lantern'), REFORGE = ending('reforge'), QUENCH = ending('quench'), USURP = ending('usurp');
const keeper = (k: 'player' | 'ysolde' | 'hesta') => is('act3.keeper', k);
/** Quench is gentle only if Nhal was destroyed first (the offer refused, the fight won). */
const QUENCH_DARK = all(QUENCH, not(is('act3.nhal_offer', 'refused')));
const USURP_WITH_NHAL = all(USURP, is('act3.nhal_offer', 'accepted'));

const ruler = (r: 'aldith' | 'harrow' | 'wick') => is('act1.ruler', r);
const HELD = is('act3.siege_outcome', 'held'), FALLEN = is('act3.siege_outcome', 'fallen');
const harrow = (h: 'slain' | 'arrested' | 'fled') => all(ruler('harrow'), is('act3.harrow_fate', h));

const stance = (s: 'pledged' | 'neutral' | 'defiant') => is('act2.church_stance', s);
const archive = (a: 'cinderhold' | 'published' | 'burned') => is('act2.warden_archive', a);
const MERCY = f('act2.aurelian_mercy');
const HESTA = f('act1.hesta_alive');
const PACT = f('act1.ylwen_pact');
const SUNG = is('companion.cadoc-ap-ynys.verse', 'sung');
const NEW_NAIL = f('act2.new_nail'), FLOODED = f('act2.korrath_flooded');
const EXPOSED = f('act1.nails_exposed');
const moot = (m: 'allied' | 'broken' | 'stolen') => is('act2.moot_outcome', m);
const INVASION = any(f('act2.hrothi_invasion'), moot('stolen'));
const auction = (a: 'bid' | 'heist' | 'duel' | 'betrayal') => is('act2.auction_outcome', a);
const VESPER_JOINED = all(f('act2.vesper_joined'), not(f('act2.vesper_betrayed')));
const SAMIR_KEPT = all(f('act2.samir_promise'), not(f('act2.samir_promise_broken')));
const SAMIR_BROKEN = f('act2.samir_promise_broken');

const dialogues: DialogueDef[] = [
  // =====================================================================
  // 1. The world: the ending itself
  // =====================================================================
  slide('dialogue:epilogue-world', 'Epilogue: The World', [
    {
      key: 'reforge-ysolde', when: all(REFORGE, keeper('ysolde')),
      text: [
        'In the end it was not you who stayed below. Ysolde Maerin, who had wanted the world to sleep, knelt at the anvil of Orr’s ribs and took the new heart into her hands, and the water ran from her eyes for the last time and did not fall. You climbed the long stair alone, and at the top of it the snow was soft underfoot, and wet.',
        'Spring came to Morvane that year, for the first time in a generation. Not all at once: a thaw in the Kingsvale, a green haze on the Ironspine’s lower slopes, rivers loud with meltwater. Beneath the mountains the Heartfire burned low and steady, and the Mire beneath it slept, and between the two a woman who had once been a saint kept the watch she had chosen.',
      ],
    },
    {
      key: 'reforge-hesta', when: all(REFORGE, keeper('hesta')),
      text: [
        'Hesta Corrow went down in your place. She told you that she was old, that her lungs were full of cinders, that she had one good apprenticeship left in her and meant to spend it on the dark. You did not win the argument. Nobody ever had. The last you saw of her was her back, straight as a spear, and her burned hand raised in farewell without her looking round.',
        'Spring came that year. The leys warmed under the fields like blood returning to a numb hand, and the black water drew back from Greywater into its deep places and lay still. At Cinderhold they kept a chair empty by the brazier. The fire in that brazier never again needed tending, and no one could say why.',
      ],
    },
    {
      key: 'reforge', when: REFORGE,
      text: [
        'You did not come back. That was the price, and you paid it. With the Lullaby in the air and seven Embers in your marked hand, you reforged the dying Heartfire into something new: a heart that held both the forged world and the dreaming sea, and burned without devouring either. Then you sat down at the anvil of Orr’s ribs to keep it.',
        'Above you, spring came. Those who lived through it said the first thaw smelled of woodsmoke and wet earth, and that for a moment every hearth in the Haldmarch flared at once, as if something far beneath had breathed. Children born that year were called ember-born. Few of them ever learned the name of the one who kept the fire. But they were warm.',
      ],
    },
    {
      key: 'iron', when: IRON, mood: 'afraid',
      text: [
        'Castor Vellane came down into the Heartforge with a column of Lightsworn and lanterns lit from Brand-fire, and the Embers went back into the heart of the world under the eyes of the Order of the Wick. When the new Brand was raised over Solenne it burned white and very bright, and the Lord-Inquisitor stood beneath it and did not smile.',
        'So began the Age of the Iron Lantern. The winters eased. The Hollowed were purged from Greywater to the coast. Every fire in the Empire, from the cathedral altar to the cottage hearth, was lit under licence, and every unlicensed flame was put out, and sometimes the hand that held it. There was order. There was warmth. People learned to be grateful in a whisper.',
      ],
    },
    {
      key: 'quench-dark', when: QUENCH_DARK, mood: 'hollow',
      text: [
        'The Heartfire went out softly, the way a candle does when someone you trust pinches the wick. For a while nothing happened. Then the stones of the world remembered that they had once been something else, and let go. The water came up through the floors of houses, warm as a bath, and nobody ran from it.',
        'They are all very happy now. The chronicle must set that down, because there is no one else left to set it down: the people of Morvane smile. They smile in the drowned streets of Haldren and in the sunken nave at Solenne, black water running from their eyes, and they sing the one song together. Beneath them something vast is listening, and it is not asleep. It is eating, slowly, and it is pleased.',
      ],
    },
    {
      key: 'quench', when: QUENCH, mood: 'hollow',
      text: [
        'With Nhal unmade there was nothing left in the deep to be hungry. The Heartfire went out, and the forged world loosened like a fist unclenching, and slid back into the dream it had been hammered out of. It was not a death. The Grey Monks had no word for what it was, and after it there were no Grey Monks.',
        'In the Dreaming every lost thing is found. Mothers walk with children who died of the Grey Lung; the bells of Ys Aerwen ring in a city that never sank. Nothing hurts there, and nothing ends. Nor does anything begin. If you are reading this, it is only because you are dreaming that you are; and if you listen you may hear it, a whole world breathing slowly in its sleep, with no one awake to tell it so.',
      ],
    },
    {
      key: 'usurp-nhal', when: USURP_WITH_NHAL, mood: 'hollow',
      text: [
        'You and the Drowned One took the Heartfire between you, and became it. The world did not end. It changed its mind about what it was. Mountains shifted in their sleep; rivers ran warm, then black, then clear again; and a pulse came up through the stones of Morvane that every living thing could feel in its teeth: two beats, very close together, like a heart with two voices.',
        'In time the people stopped asking which of the voices was yours. The Hollowed walked openly at noon, and the unmarked walked beside them, and neither feared the other any more, because both feared the same thing. Some called it the Eighth Light. Some called it the Ashmarked. The old, who remembered the Brand, called it nothing at all, and prayed quietly that it would not hear.',
      ],
    },
    {
      key: 'usurp', when: USURP, mood: 'hollow',
      text: [
        'You put your marked hand into the heart of the world and closed it. Nhal’s ruin went into you, and the seven Embers, and the last of Orr’s fire, and you did not burn and did not drown. You became the thing beneath the mountains: a living heart of flame and black water, and the world beat to your rhythm because it had no other.',
        'Summer came when you willed it, and winter when you forgot. Fields grew in strange colours. Children were born with ember-light behind their eyes, or water in their tears, by some reckoning only you understood. Temples rose to you in a dozen tongues and quarrelled over your name. You heard every prayer. That was the worst of it, and the best: you heard every one.',
      ],
    },
    {
      key: 'rekindle',
      text: [
        'The seven Embers went back into the Heartfire, and the Heartfire took them. Far above, in the snowbound cathedral at Solenne, the dead Brand split along its cracks and showed a light inside, like a coal blown upon. The cold did not break all at once. But the next winter was shorter than the last, and the one after shorter still.',
        'The Mire sank back into its depths, chained and dreaming and not at peace. The Grey Monks, who keep long accounts, wrote that the world had been given perhaps four centuries more before the cooling began again. Most people did not read the Grey Monks. They lit their lanterns, and sowed their fields, and left the next ending to their children’s children.',
      ],
    },
  ]),

  // =====================================================================
  // 2. The Haldmarch: ruler × siege × Harrow’s fate
  // =====================================================================
  slide('dialogue:epilogue-haldmarch', 'Epilogue: The Haldmarch', [
    {
      key: 'quench', when: QUENCH, mood: 'hollow',
      text: ['Haldren went under on a still night, without a sound. The river came up over the market, and the lanterns of the last Lanternmass floated on it, still lit, and drifted out through the open gates towards the marsh. In the throne room the court of the Haldmarch sits at table to this day, the water to its chin, entirely contented. Every so often someone proposes a toast to a monarch whose name none of them can quite remember, and they all drink, and nobody swallows.'],
    },
    {
      key: 'usurp', when: USURP, mood: 'hollow',
      text: ['The Haldmarch was the first realm to kneel. It was the nearest, and the coldest, and it had suffered longest, and when the ground grew warm under the Kingsvale its people wept and called it a miracle. Haldren raised a cathedral of black glass to you on the ruins of the old one. Whoever wore the crown, and there were several, ruled by your leave and dreamed of you at night, and woke not knowing whether the dream had been a blessing or an order.'],
    },
    {
      key: 'iron-wick', when: all(IRON, ruler('wick')), mood: 'afraid',
      text: ['Under the Iron Lantern the Haldmarch ceased, in all but name, to be a kingdom. Queen Aldith kept her crown, her throne room, and the right to sign whatever the Lord-Inquisitor’s clerks set before her. Wick checkpoints stood on every road from Brackhaven to the Witherdowns. The granaries were full, and the gibbets were full, and the Haldish, who had once argued about everything, learned to say very little at all.'],
    },
    {
      key: 'iron', when: IRON, mood: 'afraid',
      text: ['The Haldmarch kept its crown under the Iron Lantern, but the Church kept the fire, and that proved the greater thing. Every hearth in the Kingsvale burned by Wick-licence; every village chapel became a tollhouse for warmth. The Queen protested, in letters very carefully worded. When the letters stopped, her people understood that she had been made to understand something too. The winters were mild. Nobody in the Haldmarch would have called them kind.'],
    },
    {
      key: 'harrow-slain-held', when: all(harrow('slain'), HELD),
      text: ['Osric Harrow died at the river gate he had opened, with the Choir’s letters still in his coat. Haldren held without him. The year after, Queen Aldith had his name struck from the roll of the Lords Protector; then, after a long night alone in the chapel, had it written back in, with the truth beside it. “He bought the people one winter,” she said, “and sold them the next. Let both be remembered.” She ruled long and well, and never took another regent.'],
    },
    {
      key: 'harrow-arrested-held', when: all(harrow('arrested'), HELD),
      text: ['Osric Harrow gave up his sword at the river gate and was brought before his Queen in chains. Haldren held that night, and the trial that followed was the shortest and quietest in the Haldmarch’s history. Aldith did not hang him. She sent him to the Witherdowns, to the Grey Monks of Morrow, to spend his remaining years tending the graves of those his bargain had cost. It is said he dug a great many, and never once complained of the cold.'],
    },
    {
      key: 'harrow-caught-fallen', when: all(ruler('harrow'), any(is('act3.harrow_fate', 'slain'), is('act3.harrow_fate', 'arrested')), FALLEN),
      text: ['The river gate was shut and its traitor dealt with, but too late, and with too few: Haldren fell on Lanternmass night. Its people wintered at Cinderhold, and in the ruin of everything the young Queen at last ruled alone, with no Lord Protector at her shoulder. She found that she was good at it. When Haldren was rebuilt it was rebuilt to her plan, with the river gate bricked up and a lantern always burning above the place where it had been.'],
    },
    {
      key: 'harrow-fled-held', when: all(harrow('fled'), HELD),
      text: ['Osric Harrow fled through the river gate he had opened, and the Hollowed came in behind him. Haldren held anyway, street by street, at a price the city never forgot. Of Harrow nothing certain was ever heard again: some said he reached the Saltreach and took ship, some that the marsh took him. In Haldren they curse him still at Lanternmass, and Queen Aldith, who reigned long after, never once let his portrait be taken down. “So that we know his face,” she said.'],
    },
    {
      key: 'harrow-fled-fallen', when: all(ruler('harrow'), FALLEN),
      text: ['Osric Harrow ran, and left the river gate open behind him, and Haldren fell. That is how the Haldish tell it, in four words: Harrow ran, Haldren fell. The Queen lived, and the city was rebuilt in time, but the Haldmarch that came after was a poorer and warier country. In it the name Harrow became a word in its own right, as in “Don’t harrow me,” meaning: do not leave me at the gate.'],
    },
    {
      key: 'harrow', when: ruler('harrow'),
      text: ['Osric Harrow’s bargain with the Choir outlived the Choir itself, as such bargains do. Haldren survived the Lanternmass siege, and the Lord Protector did not survive the reckoning that followed it; whether he died, or fled, or merely faded from the council, the chronicles of the Haldmarch disagree, as if none of them could bear to write it plainly. Queen Aldith ruled alone thereafter, and in all the years of her reign she never signed a treaty without first reading every word of it aloud.'],
    },
    {
      key: 'wick-held', when: all(ruler('wick'), HELD),
      text: ['Haldren held, and the Order of the Wick took the credit. Vellane’s inquisitors had commanded the walls, and when the cold at last began to ease they did not leave them. Queen Aldith reigned in name. The Haldmarch was governed from the cathedral, by licence and by ledger, and it was safe, and orderly, and fed. Some years later the old remembrance pyres were forbidden as unlicensed fire. The Haldish lit them anyway, in secret, and the Wick pretended, for a time, not to see.'],
    },
    {
      key: 'wick-fallen', when: ruler('wick'),
      text: ['Haldren fell under the Wick’s command, and the Order never forgave the city for it. In the rebuilding every street was laid straight, so that a lantern at one end could see to the other. Queen Aldith lived out her reign in a few rooms of the keep, with a Lightsworn at her door to keep her safe. The Haldmarch survived the Long Winter. Whether it was still the Haldmarch afterwards was a question its people learned not to ask aloud.'],
    },
    {
      key: 'aldith-fallen', when: FALLEN,
      text: ['Haldren fell on Lanternmass night, and Queen Aldith was carried out of it over Ser Bryce Aldmere’s shoulder, protesting. The survivors wintered at Cinderhold, packed into the Wardens’ old halls, and when the cold at last began to loosen they went home to a city of drowned streets and blackened stone. Aldith set the first new stone of the Haldren gate herself. The city that rose was smaller and plainer than the old. Its people said it was warmer, and meant something other than the weather.'],
    },
    {
      key: 'aldith-held',
      text: ['Haldren held. On Lanternmass night the Hollowed tide broke against its walls and drew back, and at dawn the city lit every lantern it had. Queen Aldith, who had been fifteen and untested when the winter began, stood on the gatehouse among her soldiers and was untested no longer. She reigned for half a century. The chroniclers called her Aldith the Just, and in the Kingsvale they called her the Lantern Queen, and she answered to both with the same small, tired smile.'],
    },
  ]),

  // =====================================================================
  // 3. The Church: stance, the Warden archive, the lower city, Aurelian’s mercy
  // =====================================================================
  slide('dialogue:epilogue-church', 'Epilogue: The Lanternate', [
    {
      key: 'quench', when: QUENCH, mood: 'hollow',
      text: ['The Cathedral of the Brand stands where it always stood, though the sea has climbed the hill to meet it. The great doors are open. Inside, the nave is full of black water to the sills of the clerestory, and the bells still ring the hours, very slowly, from below. Hierophant Aurelian sits in his chair beneath the dead Brand, robed and crowned and smiling, and the faithful kneel in the water around him, and nobody has prayed for anything in a long, long time.'],
    },
    {
      key: 'usurp-kneel', when: all(USURP, { rep: 'faction:lanternate', min: 25 }), mood: 'hollow',
      text: ['The Lanternate, which had outlived empires by deciding in good time what it had always believed, decided that you were the Eighth Light. The Canticle of the Anvil was rewritten. In the new telling Orr’s hammer did not slip on the eighth blow; it was saving the best for last. Castor Vellane did not live to read it. The Hierophancy’s histories say only that he “withdrew to contemplation”, and that no one saw him contemplate again.'],
    },
    {
      key: 'usurp', when: USURP, mood: 'hollow',
      text: ['The Lanternate named you the Unnamed, and preached against you from every pulpit, and lit its lanterns against you; and the lanterns burned with your fire, because there was no other fire left in the world. That was the end of the Church of the Seven Lights. It did not fall. It went quiet, one chapel at a time, until the Cathedral of the Brand was a place where old women came to sweep, and to whisper the names of gods who no longer answered.'],
    },
    {
      key: 'iron-burned', when: all(IRON, is('act3.lower_city', 'burned')), mood: 'afraid',
      text: ['The Iron Lantern was lit above the ashes of Haldren’s lower city, and the Church never let anyone forget that the fire had worked. Castor Vellane became Hierophant in all but title. Aurelian died some winters later, quietly, in a warm room, and his Mercy faction did not outlive him. In the new catechism the Burning of the Lower City is a feast-day, kept with candles. Those who once lived in the lower city keep it differently.'],
    },
    {
      key: 'iron', when: IRON, mood: 'afraid',
      text: ['The Iron Lantern hung over Solenne, white and terrible, and the Lanternate became what Castor Vellane had always meant it to be: the keeper of every flame in the world. Aurelian lived on as a frail figure on a balcony, raising a hand to the crowds at Lanternmass. Every mage in the Empire was licensed or burned. Vellane, it is said, kept a list of every name he had trimmed, and read it through each night before he slept, so that he would never mistake himself for something gentler.'],
    },
    {
      key: 'reforge-reformed', when: all(REFORGE, any(archive('published'), MERCY)),
      text: ['Spring came, and the Brand in Solenne stayed dead, and the Lanternate had to decide what that meant. Hierophant Aurelian, old and frightened and suddenly brave, decided it in public. The Emberwardens’ archive was read aloud from the cathedral steps, and the Wick-licences were burned in the brazier that had burned so many mages. Castor Vellane resigned his office that day. The Church of the Seven Lights went on, smaller and humbler, and for the first time in a thousand years admitted that it did not know everything.'],
    },
    {
      key: 'reforge',
      when: REFORGE,
      text: ['Spring came, and the Brand in Solenne stayed dead, and the Lanternate declared the thaw a miracle of Ithren the Lantern and had a hymn written about it within the month. Few in the Haldmarch believed it. The chapels emptied slowly, the way a room does when the fire has gone out of the grate, and the Old Hearth, which had never needed a Brand to keep its fires, quietly took back the villages. Castor Vellane, they say, wrote the Hierophant a long letter about it, and burned it unsent.'],
    },
    {
      key: 'published-mercy', when: all(archive('published'), MERCY),
      text: ['The Brand was relit, and the Lanternate held it, but it was not the Church it had been. The Emberwardens’ archive lay open in every library from Solenne to Haldren, and Hierophant Aurelian, who had found mercy and then, late, courage, would not let it go unread. The Wick-licences were abolished in the third year of the new light. Castor Vellane obeyed to the letter and the hour, then went home to the coast to tend his family’s vines, and never spoke of fire again.'],
    },
    {
      key: 'published', when: archive('published'),
      text: ['The Emberwardens’ archive, once published, could not be unpublished, and the Church split along the line it drew. In Solenne the Brand was relit and the Wick kept its licences; across half the Haldmarch the chapels read the truth of the Purge aloud and tore the licences up. For a generation there were two Lanternates, each certain of the other’s damnation. It was, the Grey Monks observed, the healthiest the faith had been in centuries.'],
    },
    {
      key: 'burned', when: is('act3.lower_city', 'burned'),
      text: ['The Brand was relit in Solenne, and Castor Vellane was honoured for saving Haldren with fire. The lower city had been burned to stop the tide, and the tide had stopped; that was the whole of the Church’s argument, and few dared make another. Every Lanternmass afterwards the Lord-Inquisitor walked barefoot through the ash-quarter of Haldren to the cathedral, in penance. Its people lined the road and watched him pass, and said nothing at all.'],
    },
    {
      key: 'saved', when: is('act3.lower_city', 'saved'),
      text: ['On Lanternmass night Castor Vellane ordered Haldren’s lower city burned, and was refused, and the city held without the fire. The Church never wholly recovered its nerve. The Brand was relit in Solenne, but the Wick had been told no, in front of soldiers, and the Haldish do not forget a thing like that. In the lower city they still show travellers the corner where the Lord-Inquisitor stood with his torch unlit, and charge a penny for it.'],
    },
    {
      key: 'mercy', when: MERCY,
      text: ['The Brand was relit, and with the light restored Hierophant Aurelian found that he was no longer afraid. He spent his last years undoing what he could: pardons for the marked, a quiet end to the burnings, Wick-licences granted to any who asked. Castor Vellane fought him in council at every step, and lost every vote. When Aurelian died, Vellane carried his coffin. Nobody ever understood why, and he never explained.'],
    },
    {
      key: 'defiant', when: stance('defiant'),
      text: ['The Brand burned again over Solenne, and the Lanternate gave thanks to Ithren for it, and declined, officially, to mention who had carried the Embers down. You had defied the Church in its own cathedral, and the Church has a long memory and a longer patience. In its histories the Rekindling was accomplished by “the faithful of the Seven Lights, and certain others”. The Wick kept a file on you. It is a very thick file, they say, and it is still open.'],
    },
    {
      key: 'pledged', when: stance('pledged'),
      text: ['The Lanternate had backed the Ashmarked, and the Ashmarked had relit the Brand, and the Church took its reward with both hands. Pilgrims crowded the Pilgrim’s Road to see the Brand burning again; the Wick-licences were renewed and their fees doubled. Castor Vellane, who had meant to forge the new Brand himself, accepted the old one rekindled with good grace. He was a patient man. He began, that same year, to plan for the next cooling, four hundred years hence.'],
    },
    {
      key: 'neutral',
      text: ['The Brand was relit, and the Lanternate rang every bell in Solenne for three days. Hierophant Aurelian wept on the cathedral steps. Castor Vellane did not weep; he went back to his ledgers. In the Haldmarch the chapels filled again for a while, then emptied a little, then settled, as they always had, into the slow, uncertain faith of people who have been cold and are now somewhat less cold.'],
    },
  ]),

  // =====================================================================
  // 4. The Emberwardens: Cinderhold, Hesta, the keeper
  // =====================================================================
  slide('dialogue:epilogue-wardens', 'Epilogue: The Emberwardens', [
    {
      key: 'quench-hesta', when: all(QUENCH, HESTA), mood: 'hollow',
      text: ['Hesta Corrow was the last at Cinderhold to fall asleep. She sat by the ley-brazier as it dimmed, wrapped in her old Warden’s cloak, coughing, refusing on principle. When the water came up through the flagstones she put her feet in it and said a word this chronicle will not record. In the dream she is young again, and her lungs are clear, and her apprentice is with her, and they are happy. Hesta would have hated it.'],
    },
    {
      key: 'quench', when: QUENCH, mood: 'hollow',
      text: ['Cinderhold’s ley-brazier was the last fire in the Kingsvale to go out. The Wardens the Ashmarked had gathered kept it burning nine nights after the Heartfire failed, feeding it furniture, then books, then the old banners of the hall, until the water came up over the crag and took the flame without a hiss. They are dreaming now, in their places round the cold brazier, and none of them remembers what they were keeping it lit for.'],
    },
    {
      key: 'usurp', when: USURP, mood: 'hollow',
      text: ['The Emberwardens had been founded to guard the fire. Now the fire had a face, and a will, and a name they had once called friend, and they no longer knew what guarding meant. Some knelt. Some left Cinderhold by night and went north, to wait for a cooling that might never come. The great brazier in the hall burned on without fuel, and the Wardens who stayed learned not to look into it for too long, in case it looked back.'],
    },
    {
      key: 'iron-hesta', when: all(IRON, HESTA), mood: 'afraid',
      text: ['Under the Iron Lantern the Emberwardens were declared a heresy for the second time in two centuries. Hesta Corrow did not run. She met the Wick at Cinderhold’s gate in her old cloak, with her staff across her knees, and told them she had been purged once already and had not cared for it. They took her to Valcastre. She lived four winters there, teaching the other prisoners to kindle fire in their palms, until there were more fires in Valcastre than the Wick could put out.'],
    },
    {
      key: 'iron', when: IRON, mood: 'afraid',
      text: ['Under the Iron Lantern Cinderhold was seized by the Wick and made a Lightsworn chapterhouse, and its ley-brazier was licensed. The Wardens the Ashmarked had gathered went to ground, as their order had gone to ground once before. Hesta Corrow’s grave on the crag was left alone, for even the Wick has its superstitions. Every Lanternmass someone left a coal on it, still burning, and the inquisitors never caught who.'],
    },
    {
      key: 'keeper-hesta', when: all(REFORGE, keeper('hesta')),
      text: ['The Emberwardens lost their mother and gained a legend. Hesta Corrow had gone below to keep the new heart, and the order she had kept alive alone for sixty years went on without her, and grew. Cinderhold became a school, then a fortress, then a town. Its Wardens take a vow on their first night, at the brazier, and the last words of the vow are hers, from the letter she left on her chair: “Keep the fire. Mind your temper. Write to me.”'],
    },
    {
      key: 'keeper-player-hesta', when: all(REFORGE, keeper('player'), HESTA),
      text: ['Hesta Corrow had already lost one apprentice to the dark. She would not lose another, she said; and then the stair closed behind you, and she did not speak for a month. When she did, it was to open Cinderhold’s gates. She trained Wardens until her lungs failed her, and taught every one of them to go down the long stair on the first night of spring and sit a while in the warm dark and talk, in case you were listening. She died in her chair by the brazier, mid-sentence, scolding someone.'],
    },
    {
      key: 'keeper-player', when: all(REFORGE, keeper('player')),
      text: ['Cinderhold lost both its wardens, the old one at Varn and the young one beneath the world. The order went on regardless, as orders do, out of habit and grief and stubbornness. Lastlight hung above the brazier in the great hall, unlit; the Wardens said it was waiting. On the first warm night of every year they climbed to Hesta’s grave on the crag and poured out a cup of something strong, and then went down to the cellars, where the stones were warm, and poured out another.'],
    },
    {
      key: 'hesta-archive', when: all(HESTA, archive('cinderhold')),
      text: ['Hesta Corrow lived to see the Emberwardens rebuilt, which she had long since stopped expecting. The archive chests from the undercroft at Solenne stood open in Cinderhold’s hall, and every year the names of the Wardens murdered on the Night of Snuffed Candles were read aloud there, every one. She taught until her cinderlung would not let her, and then taught from her chair. When at last she died it was winter, by the brazier; but it was a short winter, and she had always said she could manage one more.'],
    },
    {
      key: 'hesta', when: HESTA,
      text: ['Hesta Corrow did not die at Varn, and did not die at Haldren, and lived, out of what she called sheer contrariness, eleven winters more. Cinderhold filled with Wardens again: hedge-mages, marked children, a defrocked Lightsworn or two. She was harder on them than anyone had ever been on her, and kinder. They buried her on the crag beneath the brazier, and her students argued for a week over the epitaph, and settled on the shortest thing she ever said to them: “Again.”'],
    },
    {
      key: 'ruin', when: not(f('act1.cinderhold_restored')),
      text: ['Cinderhold stayed a ruin on its crag, as it had been since the Night of Snuffed Candles, and the Emberwardens were remembered, by the few who remembered them at all, as a story the old told about the cold. Yet the marked still came, now and then, in ones and twos, to sit among the fallen stones where the brazier had stood. They did not know why they came. They only knew that the ground there was warm.'],
    },
    {
      key: 'dead',
      text: ['Hesta Corrow died at Varn, but the order she had kept alive alone did not die with her. Cinderhold’s brazier burned on its crag, and the marked and the mage-born came to it from every corner of the Haldmarch. The Ashmarked led them, with Lastlight across their back, until there were Wardens enough to need no one leading at all. There is a stone on the crag with her name on it. The newest Kindling are brought to it on their first night and told: she was very rude, and she was right.'],
    },
  ]),

  // =====================================================================
  // 5. The Thornwise: the pact and the last verse
  // =====================================================================
  slide('dialogue:epilogue-thornwise', 'Epilogue: The Thornwise Circle', [
    {
      key: 'quench', when: QUENCH, mood: 'hollow',
      text: ['The Thornwise had sung to the Mire for a thousand years to keep it sleeping, and when it rose at last over the deepwood they did not run. They sat beneath the antlered trees of Caer Ylwen and sang it the Lullaby one more time, and this time the Mire sang back. Rhiannon Ys-Caer, who watched Ys Aerwen sink when she was a child, saw its roofs again, the colour she had spent three hundred years trying to remember. She is looking at them still.'],
    },
    {
      key: 'usurp', when: USURP, mood: 'hollow',
      text: ['Caer Ylwen closed its gates to you on the day you became the Heart, and never opened them again. The Thornwise had wanted the Mire asleep: not chained, and not crowned. In the deepwood they sing still, though not the Lullaby. It is a new song, slow and very old in its bones, which the Aelthi call a song for a god who might yet be persuaded. They have been singing it into the ground beneath their feet for a long time. They believe, patiently, that you can hear it.'],
    },
    {
      key: 'iron-pact', when: all(IRON, PACT), mood: 'afraid',
      text: ['The Wick came to the Thornwall in the second year of the Iron Lantern, with a licence for every hedge-witch in the Kingsvale. Archdruid Rhiannon sent them away courteously, and the Thornwall grew thicker overnight, and the inquisitors who tried to cut a way through came back older, and would not say what they had heard. The pact you swore was kept. Ylwen became an island of unlicensed green in an empire of white fire, and the Wick learned to leave it be.'],
    },
    {
      key: 'iron', when: IRON, mood: 'afraid',
      text: ['Without a pact with the Ashmarked, the Thornwise had no friend in the new order. The Wick burned the hedge-witches of the Kingsvale first, then the Thornwall, then the edges of the deepwood itself, ring by ring, as a forester clears a stand. Caer Ylwen survived behind its oldest trees. The Aelthi withdrew into it and closed the way behind them, and the songs that came out of the deepwood after that were not lullabies.'],
    },
    {
      key: 'reforge-sung', when: all(REFORGE, SUNG),
      text: ['The Lullaby was sung entire for the first time since Ys Aerwen sank, every verse and the last verse, and the Mire heard all of it and slept. On the shore of the drowned lake the bells of Ys stopped ringing. Rhiannon Ys-Caer heard them stop, and wept, and said it was gladness. From that day the Thornwise kept the song not as a secret but as a duty, taught to every Aelthi child, so that it would never be half-forgotten again.'],
    },
    {
      key: 'reforge', when: REFORGE,
      text: ['The Lullaby that sang the Mire to its true sleep was not quite whole: its last verse lay drowned with Ys Aerwen, and the Thornwise sang around the gap as one walks around a grave. It was enough. The deepwood greened in the first spring, and Caer Ylwen opened its gates to the Haldish for the first time in an age. Rhiannon Ys-Caer said that the Mire would dream more gently now, and that some songs are better left a little unfinished.'],
    },
    {
      key: 'pact-sung', when: all(PACT, SUNG),
      text: ['The Thornwise kept faith with you, and you with them, though in the end the Lullaby was not the song that saved the world. The Mire was chained again, not sung to sleep, and Rhiannon Ys-Caer grieved for it. But the last verse had been found, and it was kept. In a grove beneath Caer Ylwen the Aelthi teach it to their children still: a verse for the next cooling, four centuries off, so that whoever stands before the Heartfire then may choose better.'],
    },
    {
      key: 'pact', when: PACT,
      text: ['The pact held. The Thornwise came when they were called, and when the Embers were returned and the Mire chained again they went home to the deepwood and mourned it, as they had always mourned it. Archdruid Rhiannon planted an antler-oak at the Thornwall in your name. It grew crooked and slow, and the Aelthi said that was fitting. They are waiting still, in their patient way, for the third way to be tried.'],
    },
    {
      key: 'no-pact',
      text: ['The Thornwise had sworn no pact with the Ashmarked, and they did not come down from the deepwood when the world was saved. Caer Ylwen stayed closed. Hedge-witches like Nan Briar still crossed the Thornwall at need, and brought back word of a kingdom thawing, slowly, beneath a rekindled fire. In the deepwood the Aelthi heard, and said nothing, and went on singing to the roots of the world, in case it should ever need them.'],
    },
  ]),

  // =====================================================================
  // 6. The Orrun: the Nails, the flood, the new Nail
  // =====================================================================
  slide('dialogue:epilogue-orrun', 'Epilogue: The Iron Concord', [
    {
      key: 'quench', when: QUENCH, mood: 'hollow',
      text: ['Korrath-under-Stone had held the Mire down for a thousand years with nine iron Nails. When the Heartfire failed the Nails held on one day more, out of pure Orrun stubbornness, and then they did not. The black water rose through the Vault and the halls and the long galleries, and the Orrun went down to meet it singing the forge-songs, and it was warm. In the deep halls the hammers are ringing still, slowly, under the water. They are forging nothing.'],
    },
    {
      key: 'usurp', when: USURP, mood: 'hollow',
      text: ['The Iron Concord had sworn its oaths to Vor the Hammer and to Orr beneath the mountain, and now the heart beneath the mountain was you. High Thane Brannoch broke his staff in the Thane-Hall rather than kneel. His successors were more practical. The Nails were drawn from the Vault, there being nothing left for them to hold down, and melted into a great bell; and the bell is rung at every dawn in Korrath to tell you that the Orrun are still there, and still awake.'],
    },
    {
      key: 'iron', when: IRON, mood: 'afraid',
      text: ['The Iron Concord stayed out of the Church’s new order as long as it could, and then a little longer. The Lord-Inquisitor wanted true-iron for his lanterns; the Orrun wanted no part in them. The treaty that was at last signed is the longest in the Concord’s ledger, and the most bitterly kept. Korrath-under-Stone traded with Solenne for a hundred years, and in all that time no Orrun smith ever forged a lantern, nor was asked twice.'],
    },
    {
      key: 'reforge-flooded', when: all(REFORGE, FLOODED),
      text: ['When the Mire went to its true sleep, the black water in Korrath’s lower holds lay still for a season, and then, one morning, it was only water: cold, clear, and full of the drowned. The Orrun drained the halls and brought their dead up into the light, and buried them with every honour the ledger allowed, and some it did not. Then they relit the forges of the lower holds, one by one, and the mountain was loud again.'],
    },
    {
      key: 'nail-exposed', when: all(NEW_NAIL, EXPOSED),
      text: ['The Concord’s lie had been told aloud at the gate, and the gap it hid was filled with a new Nail, forged of true-iron and plain stubbornness. In time the Thane-Hall did what the Orrun almost never do: it amended the ledger. Two failed Nails were written in, and one new one; beside the new Nail, the name of the hand that forged it; and beside that, in a smaller and grudging script, the name of Grimma Ironsong, who had said it first.'],
    },
    {
      key: 'nail-kept', when: NEW_NAIL,
      text: ['The secret of the failed Nails was never told at the gate. It no longer needed telling: the gap they left was filled with a new Nail of true-iron, forged in the Vault and driven home, and the Nine were nine again. High Thane Brannoch died believing that this had made the lie true after all. Perhaps it had. The Orrun do not greatly care for such questions. They care that the mountain is quiet, and it was quiet, for a very long time.'],
    },
    {
      key: 'flooded-exposed', when: all(FLOODED, EXPOSED),
      text: ['The Ember of the Deep had been holding back the black water, and when it was taken the lower holds of Korrath drowned. The Concord did not survive the double blow of the truth and the flood. Brannoch gave up his staff; the clans quarrelled; for a generation the Orrun were a scattered people, trading iron in human towns. But they came back. They always come back. In time they pumped the lower holds dry, and found their dead there, seated at their forges, and buried them properly.'],
    },
    {
      key: 'flooded', when: FLOODED,
      text: ['The lower holds of Korrath drowned when the Ember of the Deep was taken, and the Thane-Hall kept that secret too, as it had kept the secret of the Nails. The lower holds were, officially, closed for repair. They were closed for repair for two hundred years. The Orrun who had lived there were remembered in the songs of their own clans, and in the ledger, where someone had written their names and then, very carefully, ruled a line beneath them.'],
    },
    {
      key: 'held',
      text: ['The Nine Nails held, or held well enough, and the Iron Concord kept its counsel, as it always had. Korrath-under-Stone sent its true-iron down the mountain and stayed out of the wars of men, and the High Thane’s ledger grew by a page each year. Only the oldest smiths, working the deepest forges, would sometimes stop with the hammer raised and listen, as if to something knocking very patiently on the other side of the stone.'],
    },
  ]),

  // =====================================================================
  // 7. The North: the Moot and the invasion
  // =====================================================================
  slide('dialogue:epilogue-north', 'Epilogue: The North', [
    {
      key: 'quench', when: QUENCH, mood: 'hollow',
      text: ['The north went under last, because it was coldest. The Mire came up beneath the ice of Frostreach and the ice did not melt; it became something else, a pale glass through which the faces of the drowned look up, smiling. At Skelvik the Moot still gathers at the stones. The clans sit in their ring and dream of raiding the south, and of feasting, and of the dead who are not dead, and none of them will ever be hungry again.'],
    },
    {
      key: 'usurp', when: USURP, mood: 'hollow',
      text: ['The Hrothi had always said the Ember on the Moot-stones was a sign from Calun the Wanderer. When the ground warmed under Frostreach and the ice-rivers ran, they decided that you were Calun, come home at last. You did not correct them. Nobody could have. Their skalds made a hundred kennings for you, and the oldest is the plainest: burning-water, heart-of-the-hill, the god who stayed. They chant it at the Moot-stones and pour mead into the ground.'],
    },
    {
      key: 'iron-allied', when: all(IRON, moot('allied')), mood: 'afraid',
      text: ['The Hrothi had bled for Haldren, and Castor Vellane thanked them with a mission. Lightsworn went over the north pass to bring the Seven Lights to Skelvik. Jarl Sigrun Ice-Eye received them in her hall, fed them, heard out their sermon, and sent them home with a gift of furs and a message for the Lord-Inquisitor that his envoys would not repeat. The north kept its own gods and its own fires, and the Iron Lantern never quite reached so far.'],
    },
    {
      key: 'iron', when: IRON, mood: 'afraid',
      text: ['The Iron Lantern answered the Hrothi in the end, as it answered everything. The Wick’s crusade over the north pass is a famous victory in the Lanternate’s histories. In Frostreach it is remembered otherwise. The clans were broken, the Moot-stones thrown down, and Lightsworn chapels raised in the burned halls of Skelvik. Hrothi children learned the Canticle of the Anvil by rote, and learned something else at home, in a whisper.'],
    },
    {
      key: 'allied', when: moot('allied'),
      text: ['The Wolf-Moot kept its word. The Hrothi came over the north pass in the depth of the siege-winter with their axes and their storm-callers, and when the cold at last began to ease they went home again, which surprised the Haldish more than anything. Jarl Sigrun Ice-Eye lived to see her grandchildren raid nothing more dangerous than the Haldren fairs. Every year the clans send a cask of mead south, and a skald to recite, at very great length, the tale of the Ashmarked at the Moot.'],
    },
    {
      key: 'invasion', when: INVASION,
      text: ['The Hrothi came south, as the young wolves of the Moot had always wanted, and the northern Kingsvale burned. When the world grew warmer there was no longer any need to raid for bread, but by then the war had a life of its own. It took years, and a great many dead, and a peace sworn at the Moot-stones by a grey-haired Sigrun Ice-Eye, before the raids ended. The Haldish do not forgive easily. Nor, it proved, do the Hrothi.'],
    },
    {
      key: 'broken', when: moot('broken'),
      text: ['The Moot broke when the riddle-contest was lost, and the clans scattered across Frostreach, each to its own fjord and its own hunger. No army came south, and none came to Haldren’s aid. When the cold eased the north eased with it, slowly, clan by clan, and in time a new Moot was called. It was smaller than the old. The skalds did not sing of the Ashmarked there, except once, as a riddle that nobody could answer.'],
    },
    {
      key: 'endured',
      text: ['Frostreach endured, as Frostreach always has. The Hrothi buried their dead beneath cairns, kept their own counsel and their own gods, and when the thaw crept north over the pass they met it with suspicion, as one meets a stranger at the hall door who claims to be kin. They let it in, in the end. But they kept an axe by the door for a long while after.'],
    },
  ]),

  // =====================================================================
  // 8. Salt and Ash: the Salt League, the Ashen Creed and the Qasiri
  // =====================================================================
  slide('dialogue:epilogue-salt-and-ash', 'Epilogue: Salt and Ash', [
    {
      key: 'quench', when: QUENCH, mood: 'hollow',
      text: ['The Saltreach was the first coast the Mire took, and it took it gently. Admiral Kestrel’s fleet rides at anchor off Gull Rock still, every ship in its place, every crew asleep at the oars. In the Cinder Wastes the glass ruins of Qadir lie under the water now, and the Ashen Creed and the Qasiri caravans sleep in them side by side, their old quarrels quite forgotten. Every fire of the Red Abbess went out with all the others. In the dream she is a nun again, and does not mind.'],
    },
    {
      key: 'usurp', when: USURP, mood: 'hollow',
      text: ['The Salt League sold your likeness on every quay from Brackhaven to the Isles, at a handsome mark-up. The Ashen Creed, which had always said that magic belonged to everyone, found it now belonged to one, and split three ways over whether that was a victory. And the Qasiri, who had spent a thousand years keeping the world from repeating Qadir, closed the Ash Road for ever, and spoke of you only as Ozrah’s heir. It was not meant kindly.'],
    },
    {
      key: 'iron-creed', when: all(IRON, VESPER_JOINED), mood: 'afraid',
      text: ['The Iron Lantern’s first proclamation named the Ashen Creed a heresy, and its second named the Red Abbess. Vesper Qadri was never taken. She burned the Wick’s chapterhouse at Valcastre on the anniversary of the midwife’s death and vanished into the Cinder Wastes, and the Creed went with her, and the Qasiri sheltered them in the glass streets of Qadir. Admiral Kestrel, who had no religion beyond profit, smuggled for both sides and grew richer every year.'],
    },
    {
      key: 'iron', when: IRON, mood: 'afraid',
      text: ['Under the Iron Lantern the free mages of the Ashen Creed were hunted from cell to cell, until no cells were left north of the Sunscar. The Salt League bought its licences, paid its tithes, and carried contraband tomes in the bilges of its tithe-ships. And the Qasiri closed the Ash Road. They had watched one empire try to own the fire, the Cindermother said. They did not need to watch another.'],
    },
    {
      key: 'betrayal', when: any(auction('betrayal'), f('act2.vesper_betrayed')),
      text: ['Admiral Kestrel made a great deal of money from the Ember auction, and the Lanternate made a prisoner of the Red Abbess, and the Ashen Creed never forgave the Ashmarked for either. Its cells burned Wick-chapels for a generation, and every fire was signed with the same word, scratched in the ash: sold. The Qasiri, who keep the salt-law, said that a bidder betrayed at table is a guest betrayed, and would not speak your name in Zahrun.'],
    },
    {
      key: 'creed-kin', when: all(VESPER_JOINED, SAMIR_KEPT),
      text: ['Salt and ash, the Qasiri say, are the two things a fire leaves. In the years after the war the Ashen Creed and the caravans made a kind of peace among the ruins of Qadir: the Creed’s free mages learned the salt-law, and the Qasiri learned to let a fire be lit without a licence. Samir ibn Ruqaya’s vow was kept, and the Glass Ember was used by no hand but the one it was promised to. Admiral Kestrel ran the cargo between them, at a modest and entirely unreasonable fee.'],
    },
    {
      key: 'creed-broken', when: all(VESPER_JOINED, SAMIR_BROKEN),
      text: ['The Ashen Creed came out of the war stronger than it went in, with the Red Abbess at its head and the Church too weakened to hunt it. But the Qasiri remembered the night Vesper held the Glass Ember against Samir ibn Ruqaya’s vow, and your word broken with it. The salt-law is old, and it does not bend. The caravans traded with the Creed, and with you, and the trade was always fair and always cold, and never once did they share their salt again.'],
    },
    {
      key: 'creed', when: VESPER_JOINED,
      text: ['The Ashen Creed came home from the war with the Red Abbess at its head and a great many new friends, most of them dangerous. Wick-licences were burned in the squares of Haldren, openly, at Lanternmass, and the Church had not the strength to stop it. The Qasiri watched from the Sunscar with the patience of people who have seen fire go wrong before. And Admiral Kestrel, who supplied the Creed with lamp-oil by the shipload, called it the best market she had known in forty years.'],
    },
    {
      key: 'creed-left', when: f('act2.vesper_left'),
      text: ['The Red Abbess had parted from the Ashmarked at the Glass Throne and taken the Ashen Creed with her, and after the war the Creed went its own way. It grew. Licensed or not, the free mages of the Haldmarch found their cellars full of fire again, and the Church found that it had not the strength to put it out. Vesper Qadri never spoke of you in public. In private, the Creed said, she spoke of little else.'],
    },
    {
      key: 'samir-broken', when: SAMIR_BROKEN,
      text: ['The Qasiri do not forgive a broken salt-vow, and they did not forgive yours. Samir ibn Ruqaya returned to Zahrun and spoke your name once before the Cindermother’s tent, and then never again, and the caravans closed the Ash Road to all who bore the Ashmark. The Salt League did not care; it had ships. The Ashen Creed did not care; it had fire. But in the Sunscar they tell a story of a marked one who ate salt and lied, and children are made to listen to the end of it.'],
    },
    {
      key: 'samir-kept', when: SAMIR_KEPT,
      text: ['Samir ibn Ruqaya’s vow was kept, and the caravans did not forget it. In Zahrun your name was spoken at the salt-sharing, an honour given to few outsiders in a thousand years. The Ashen Creed went on as it always had, in cellars and on the margins, burning Wick-licences and quarrelling with itself. And Admiral Kestrel dined out on the tale of her auction for the rest of her life, improving it a little every time.'],
    },
    {
      key: 'heist', when: auction('heist'),
      text: ['Admiral Marisol Kestrel never recovered the Ember stolen from her own vault on Gull Rock, nor her dignity, nor, she claimed, her faith in human nature. She recovered everything else, with interest. Her new flagship was christened the Thief, and its figurehead was carved, by her particular instruction, in your likeness, so that she could look at it every morning while she cursed. The Salt League thrived. The Creed and the Qasiri went their separate ways, and kept their distance from Brackhaven.'],
    },
    {
      key: 'league',
      text: ['The Salt League did well out of the end of the world, as it did out of everything. Admiral Kestrel kept her seat by show of hands for another twenty years, and spent them selling warm wool to a thawing continent. The Ashen Creed lived on in cellars and margins, burning licences, preaching that fire belongs to everyone. And the Qasiri kept the Ash Road and the salt-law, and told the story of Ozrah again and again, never sure it was the right one, but surer now than they had been.'],
    },
  ]),
];

export default dialogues;
