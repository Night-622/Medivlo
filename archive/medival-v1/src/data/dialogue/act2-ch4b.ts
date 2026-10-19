/** Dialogue: Act II Ch4, quest:sister-ilse and quest:the-prisoner-of-valcastre (docs/lore/11-act2-spec.md). Owner: Claude 4. */
import type { DialogueDef, DialogueNode } from '@/core';

const QI = 'quest:sister-ilse' as const, QP = 'quest:the-prisoner-of-valcastre' as const;
const at = (quest: `quest:${string}`, stage: string) => ({ questStage: quest, stage });
const f = (flag: string) => ({ flag });
const eq = (flag: string, value: string) => ({ flag, op: '==' as const, value });
const AU = 'npc:hierophant-aurelian' as const, V = 'npc:castor-vellane' as const;
const IL = 'npc:sister-ilse' as const, OT = 'npc:deacon-ottavia' as const, CA = 'npc:brother-caius' as const;
const Y = 'npc:ysolde' as const, H = 'npc:hesta-corrow' as const;
const AN = 'npc:anselm-pryde' as const, HA = 'npc:garrick-hale' as const, SA = 'npc:sable' as const;
const LANT = 'faction:lanternate' as const;
/** the clue stage or later (the accusation) */
const searching = { any: [at(QI, 'clues'), at(QI, 'accuse')] };
const accuse = (who: 'ilse' | 'ottavia' | 'caius') => ({ setFlag: 'act2.ilse_accused', value: who });

/** set on the node right after the door opens, whichever way it was opened */
const freed = (route: string) => [
  { setFlag: 'act2.anselm_freed', value: true },
  { setFlag: 'act2.anselm_route', value: route },
  { companion: AN, following: true },
];

/**
 * Anselm's apology, shared by the cell door (obj) and his own Act II route (dialogue:ch4-anselm-freed),
 * so it can be reopened if the scene is closed early. Enters at 'sorry'.
 */
const apology: Record<string, DialogueNode> = {
  sorry: {
    speaker: AN,
    text: 'I watched you across the green at Brindlecross, you know. When the soldiers came. I wanted very much to see your face, to know whether you were sorry. I couldn’t tell. I have had a long time to wonder.',
    choices: [
      {
        text: '[Will 15] "I was afraid, and I gave them you instead of me. There is no excuse. I am sorry, Anselm."', to: 'forgive', tag: 'persuade',
        check: { stat: 'will', dc: 15, failTo: 'not-yet' }, effects: [{ setFlag: 'npc.anselm-pryde.apology_made', value: true }],
      },
      {
        text: '[Devout] (Kneel on the wet stone.) "Bless me, Brother, for I have sinned against you."', to: 'forgive', tag: 'trait',
        when: { dialogueTag: 'devout' }, effects: [{ setFlag: 'npc.anselm-pryde.apology_made', value: true }],
      },
      { text: '"It was you or me. I chose me."', to: 'hard', effects: [{ setFlag: 'npc.anselm-pryde.apology_made', value: true }, { loyalty: AN, delta: -5 }] },
      { text: '(Say nothing. Help him to his feet.)', to: 'not-yet', effects: [{ setFlag: 'npc.anselm-pryde.apology_made', value: true }] },
    ],
  },
  forgive: {
    speaker: AN, mood: 'sad', effects: [{ setFlag: 'npc.anselm-pryde.forgave', value: true }, { loyalty: AN, delta: 15 }],
    text: '(He is quiet for a long while.) I forgave you in the first week. It was the only thing in here I could do with my hands. What took the rest of the year was forgiving myself for being glad it was me in this cell, and not you.',
    next: 'walk',
  },
  'not-yet': {
    speaker: AN,
    text: 'Not today, I think. Perhaps not this year. Forgiveness isn’t a door; you can’t pick it. (He takes your arm all the same.) But I will walk with you. I find I would rather walk with you than sit here waiting to be useful.',
    next: 'walk',
  },
  hard: {
    speaker: AN, mood: 'sad',
    text: '…Yes. That is the truth, and I asked for it. Thank you for not dressing it up. (He stands on his own, which costs him something.) I will still come. Someone ought to watch what you choose next.',
    next: 'walk',
  },
  walk: {
    speaker: AN,
    text: 'They told me things in here, to see what my face would do. That Varn had fallen. That the old Warden of Cinderhold was dead. Is it true? Hesta Corrow?',
    choices: [
      { text: '"She died at Varn, holding Ysolde back."', to: 'hesta-dead', when: { not: f('act1.hesta_alive') } },
      { text: '"No. She’s alive, and as rude as ever."', to: 'hesta-alive', when: f('act1.hesta_alive') },
    ],
  },
  'hesta-dead': {
    speaker: AN, mood: 'sad',
    text: 'Then I shall pray for her, though she would have hated it. (He closes his eyes.) I wonder, sometimes, whether I could have stood beside her there. Radiance is good for very little, but it is good for holding a door. Well. We shall never know. That is the cruelty of it.',
  },
  'hesta-alive': { speaker: AN, mood: 'happy', text: 'Seven be thanked. I shall write and tell her I was in prison for owning her book. She will think it very funny.' },
};

const dialogues: DialogueDef[] = [
  // ---------------------------------------------------------------- Ysolde's journals (obj:ysolde-journal)
  {
    id: 'dialogue:obj-ysolde-journal', name: 'Object: Ysolde’s journals',
    entries: [
      { when: { not: { any: [{ questActive: QI }, { questCompleted: QI }] } }, node: 'sealed' },
      { when: f('act2.journals_read'), node: 'hub' },
      { node: 'start' },
    ],
    nodes: {
      sealed: { speaker: 'narrator', text: 'A writing-desk under a north window, its lid sealed with the Hierophant’s red wax. No one has broken it. No one, you suspect, has dared.' },
      start: {
        speaker: 'narrator',
        effects: [
          { setFlag: 'act2.journals_read', value: true },
          { giveItem: 'item:ysolde-journal' },
          { unlockLore: 'lore:ysolde-the-pale-saint', section: 'journals' },
          { unlockLore: 'lore:cathedral-of-the-brand', section: 'keepers-rooms' },
        ],
        text: 'The Keeper’s rooms are three small cells at the top of the stair: a narrow bed, a writing-desk, a window facing north toward the Ironspine. Everything is swept. On the window-sill there are pale rings, as from a cup set down wet, again and again. In the desk lie six daybooks in a healer’s quick, slanting hand, and a packet of letters tied in red cord, addressed in a cramped northern script you have seen before.',
        next: 'hub',
      },
      hub: {
        speaker: 'narrator',
        text: 'The daybooks smell of lavender and lamp-oil. Some pages are stained, as if they had been read in the rain.',
        choices: [
          { text: '(The first daybook: 1178.)', to: 'j1' },
          { text: '(The third daybook: 1179.)', to: 'j2' },
          { text: '(The fifth daybook: 1180.)', to: 'j3' },
          { text: '(The last daybook: 1181.)', to: 'j4' },
          { text: '(The letters in the red cord.)', to: 'l1' },
          { text: '[Intellect 15] (Some margins are written in a cipher. Try to read it.)', to: 'cipher', once: true, tag: 'lore', check: { stat: 'intellect', dc: 15, failTo: 'cipher-fail' } },
          { text: '[Arcanist] (Set her figures beside what you know of the leys.)', to: 'arcanist', when: { classIs: 'class:arcanist' }, tag: 'class', once: true },
          { text: '[Hesta] (Give the letters to Hesta.)', to: 'hesta-reads', when: { all: [f('companion.hesta-corrow.following'), f('act1.hesta_alive')] }, once: true },
          { text: '(Close the books.)', to: 'close', tag: 'leave' },
        ],
      },
      j1: {
        speaker: Y, mood: 'happy',
        text: '“Ithrensday, the first of Thawmonth, 1178. They let me hold it today. Not touch, the Hierophant said; tend. But there is no tending it without touching. It is warm the way a sleeping child is warm: from inside, steadily, as if it trusts you. I sat with it all night. I have sat with a thousand dying, and I think it is the first time I have ever sat with something that was not afraid.”',
        next: 'j1b',
      },
      j1b: {
        speaker: Y,
        text: '“Later. I put my hands on the floor of the nave first, as Hesta taught me, before I put them on the Brand. The Sisters think it is a strange humility. It is not humility. I wanted to feel where the warmth goes when it leaves. It goes down. Everything goes down.”',
        next: 'hub',
      },
      j2: {
        speaker: Y, mood: 'sad',
        text: '“Morrowday, 1179. The sea again. Not our sea. A sea without a shore, black and very still, and everyone I could not save was floating in it. The children from the Grey Lung wards. The Varn lord’s little girl. They were not drowning. They were asleep, and the Lung was not in them, and they were smiling. I woke up and I was not frightened. I am frightened now, writing it, that I was not frightened.”',
        next: 'j2b',
      },
      j2b: {
        speaker: Y,
        text: '“Every night now, when I have tended it. The Brand is a window, and I am looking down through it into deep water, and the water is looking back. It does not speak. It only aches, as I ache, as the sick ache. I have spent my life putting my hands on things that hurt. I do not know how to stop.”',
        next: 'hub',
      },
      j3: {
        speaker: Y,
        text: '“Saelsday, 1180. I have done it Hesta’s way, with the mercury and the iron rod and the ley-glass, every Lanternmass since I came. The Brand is cooler than it was in 1170 by the breadth of a fingernail. The leys under the nave are cooler by a thumb. It is not sin. It is not anyone’s sin. The fire is old, and it is tired, and nobody will let it rest.”',
        next: 'j3b',
      },
      j3b: {
        speaker: Y, mood: 'afraid',
        text: '“I took the figures to the Hierophant. He held my hands and told me to pray, and to say nothing. I have prayed. And under the prayers, every night now, so faint I could almost believe I make it up: someone is weeping under the world. Not for themselves. For us.”',
        next: 'hub',
      },
      j4: {
        speaker: Y, mood: 'sad',
        text: '“Calunday, the last of Leafmonth, 1181. I am going down. Solenne went down, and came back with a coal; I shall go down and find out where she found it, and why it is dying, and whether anything can be done. If it is dying, I will not let it die screaming. I have sat with too many who did. I know what that sound is. I will not let the world make it.”',
        next: 'j4b',
      },
      j4b: {
        speaker: Y,
        text: '“Ilse has promised to keep my rooms. She is the only one who ever asked what I saw. She says the sea I dream of is not cruel, only lonely, and I think she is right. I have left the window open for her. She likes to hear the rain.”',
        choices: [
          { text: '(Read it again: “She is the only one who ever asked what I saw.”)', to: 'ilse-note', once: true },
          { text: '(Put the daybook down.)', to: 'hub' },
        ],
      },
      'ilse-note': {
        speaker: 'narrator', effects: [{ setFlag: 'act2.journal_ilse_named', value: true }],
        text: 'The rest of the page is blank, but the paper is cockled, as paper is when it has been wet and dried. Beneath the last line, in a different, rounder hand, someone has written very small: “Kept dry. Kept safe. Soon.”',
        next: 'hub',
      },
      l1: {
        speaker: H,
        text: '“Hesta to Ysolde, the year of the Lung, 1170. They’ve made you a saint, I hear. Don’t let it go to your head, girl; your head’s the only sensible part of you. And don’t let them put you in a lantern. Saints get burned or framed, and either way they stop being people. Eat something. H.”',
        next: 'l1n',
      },
      l1n: {
        speaker: Y, mood: 'sad',
        text: '(In the margin, in Ysolde’s hand:) “She never says she is proud. She says don’t. Don’t, don’t, don’t, a whole page of don’ts, and I keep every one of them in my sleeve like a charm.”',
        next: 'l2',
      },
      l2: {
        speaker: H,
        text: '“Hesta to Ysolde, 1178. The Brand. Seven Sparks, they’ve given you the Brand. Listen to me: don’t look into it too long. I mean it. The fire comes from somewhere, and you know where, and the somewhere is not kind to people who stare. Keep your hands on the floor. Keep your eyes on the living. H.”',
        next: 'l2n',
      },
      l2n: {
        speaker: Y, mood: 'angry',
        text: '(In the margin, pressed so hard the nib has torn the paper:) “You taught me the fire was dying, and then you told me to be careful. Careful. As if care were a kind of answer. You hid in a ditch for forty years with your figures and your cough and called it keeping faith. Someone has to look. Someone has to do something with the looking.”',
        next: 'l3',
      },
      l3: {
        speaker: H, mood: 'sad',
        text: '“Hesta to Ysolde, 1181. I heard you went to the Hierophant. I heard what he said. Child, come home. Not to Solenne. To me. Whatever you’ve seen, bring it north and sit by my fire and tell me, and we’ll be wrong about it together, the way we used to be. I’m old. I don’t want to be right any more. I want you home. H.”',
        next: 'l3n',
      },
      l3n: {
        speaker: Y, mood: 'sad',
        text: '(On the back, in Ysolde’s hand, the ink run with water:) “I love you. I love you, you terrible old woman. I can’t. Home is the thing that is ending.”',
        choices: [
          { text: '"Hesta needs to read this."', to: 'l-alive', when: f('act1.hesta_alive') },
          { text: '"She died at Varn, Ysolde. Holding you back."', to: 'l-dead', when: { not: f('act1.hesta_alive') } },
        ],
      },
      'l-alive': {
        speaker: 'narrator',
        text: 'You fold the letters along their old creases and tie the red cord again. Somewhere in the Kingsvale an old woman is keeping a fire lit in a burned hall, and does not know that every word she wrote was kept. You will have to decide whether to tell her. You think you already have.',
        next: 'hub',
      },
      'l-dead': {
        speaker: 'narrator', mood: 'sad',
        text: 'You say it aloud, to an empty room, to a window left open for the rain. Nobody answers. You fold the letters along their old creases and tie the red cord again, and your hands are not quite steady. She came home in the end, Hesta. Just not the way either of you meant.',
        next: 'hub',
      },
      cipher: {
        speaker: Y, mood: 'hollow', effects: [{ setFlag: 'act2.journal_cipher', value: true }],
        text: '(The cipher is the old Warden letter-shift; Hesta must have taught it her. In the margins of 1180:) “It has a voice. It told me its name, and I will not write it. It says it is sorry for all of us. It says it has been sorry since the beginning of the world. It says it can make it stop hurting.”',
        next: 'hub',
      },
      'cipher-fail': { speaker: 'narrator', text: 'The letters swim. It is some old shift-cipher, and you cannot find the key of it. Only one word repeats often enough to stand out, at the end of entry after entry, and you cannot read that either.', next: 'hub' },
      arcanist: {
        speaker: 'narrator',
        text: 'Her figures are good. Better than good: careful, repeated, the work of someone who wanted badly to be wrong. You set them beside the weak draws every hedge-school in the Haldmarch complains of, beside the cold ley under the cathedral floor, and they agree. She was not mad. She was the first person in a century to read the instruments honestly.',
        next: 'hub',
      },
      'hesta-reads': {
        speaker: H, mood: 'sad',
        text: '(Hesta reads the margins of her own letters for a long time, standing by the window. When she speaks her voice is quite ordinary.) “Hid in a ditch for forty years.” Well. She wasn’t wrong. (She folds the last letter and puts it inside her coat, against her chest.) I’m keeping this one. Don’t argue. I taught her to write, you know. That terrible hand is mine.',
        next: 'hub',
      },
      close: { speaker: 'narrator', text: 'You close the daybooks and stack them as you found them. Ysolde’s journal goes into your pack; the rest you leave for whoever keeps these rooms. Outside, the snow has started again.' },
    },
  },
  // ---------------------------------------------------------------- the three suspects (obj:)
  {
    id: 'dialogue:obj-suspect-ottavia-desk', name: 'Object: Deacon Ottavia’s desk',
    entries: [{ when: f('act2.clue_ottavia'), node: 'again' }, { when: searching, node: 'start' }, { node: 'desk' }],
    nodes: {
      desk: { speaker: 'narrator', text: 'A deacon’s writing-desk in the cathedral archive, heaped with ledgers and quills. It belongs to Deacon Ottavia, who would not thank you for touching it.' },
      again: { speaker: 'narrator', text: 'The false bottom of the drawer is back in place. Under it, Ottavia’s forbidden books lie in the dark, waiting to be read.' },
      start: {
        speaker: 'narrator', effects: [{ setFlag: 'act2.clue_ottavia', value: true }],
        text: 'The deacon’s desk is a mess of ledgers, and the drawer is a hand’s breadth too shallow for the desk. You press the back panel and the false bottom lifts. Underneath, wrapped in oilcloth: books. An Aelthi songbook in a wardwood cover. A Qasiri treatise on ley-wells, with the Wick’s burn-mark on its title page. A Haldish hedge-witch’s almanac. And a bundle of loose tables, tied with tape and stamped “For Solenne”.',
        choices: [
          { text: '(Untie the tables. You know that stamp.)', to: 'tables', when: { any: [f('act1.reports_known'), f('act1.purge_vision_full')] } },
          { text: '[Scholar] (Read the tables. They look like ley-draws.)', to: 'tables', when: { dialogueTag: 'scholar' }, tag: 'trait' },
          { text: '[Intellect 15] (Make sense of the figures.)', to: 'tables', once: true, tag: 'lore', check: { stat: 'intellect', dc: 15, failTo: 'tables-fail' } },
          { text: '(Look for anything touching the Pale Saint.)', to: 'verdict' },
        ],
      },
      tables: {
        speaker: 'narrator', effects: [{ setFlag: 'act2.ley_reports_found', value: true }, { unlockLore: 'lore:the-emberwardens', section: 'purge-truth' }],
        text: 'Ley-draws, hall by hall, year by year: Cinderhold, Ashby, the Witherdown halls, the Ironspine passes. Every column a little shorter than the last. These are three of the Emberwardens’ reports, carried out of Cinderhold in 1041 and sealed under the cathedral. Someone has taken them out of the undercroft, one at a time, over years. Someone has been reading them.',
        next: 'verdict',
      },
      'tables-fail': { speaker: 'narrator', text: 'Columns of figures under the names of northern places, each column a little shorter than the last. It means something. You cannot tell what.', next: 'verdict' },
      verdict: {
        speaker: 'narrator',
        text: 'Nothing here touches the Pale Saint. No black water, no Drowned Tongue, no hymns. Only ink and dust and a great deal of fear, wrapped in oilcloth. Deacon Ottavia is a thief of books the Wick wanted burned. It is a hanging matter in Solenne. It is not this one.',
      },
    },
  },
  {
    id: 'dialogue:obj-suspect-caius-cell', name: 'Object: Brother Caius’s cell',
    entries: [{ when: f('act2.clue_caius'), node: 'again' }, { when: searching, node: 'start' }, { node: 'cell' }],
    nodes: {
      cell: { speaker: 'narrator', text: 'A lamplighter’s cell off the nave: a pallet, a taper-box, a brass snuffer hung on a nail. Brother Caius keeps it very tidy.' },
      again: { speaker: 'narrator', text: 'The loose flagstone is back under the pallet. The red thread is still beneath it.' },
      start: {
        speaker: 'narrator', effects: [{ setFlag: 'act2.clue_caius', value: true }],
        text: 'Brother Caius’s cell smells of tallow and smoke. Under the pallet a flagstone rocks when you press it, and beneath it there is a hollow. In it: a flame-tongue of Ashvar worked in red thread on a scrap of linen; a sheaf of copied lists in a careful hand, names of the marked with the dates the Wick’s carts would come for them; and a letter sealed with nothing but a red thumbprint.',
        choices: [
          { text: '(Read the lists.)', to: 'lists' },
          { text: '(Read the letter.)', to: 'letter' },
          { text: '[Shade] (You know this kind of hidey-hole. The Quiet Hand carries the Creed’s post.)', to: 'shade', when: { classIs: 'class:shade' }, tag: 'class', once: true },
          { text: '(Put it all back.)', to: 'verdict' },
        ],
      },
      lists: {
        speaker: 'narrator',
        text: 'Each name has a mark beside it. Most are ticked, and beside each tick is one word: warned. A cobbler in Aurevine, warned. A midwife at the pilgrim camp, warned. Three children in the Via Lucis, warned. He has been passing the Wick’s lists out of the cathedral, a week ahead of the carts.',
        choices: [
          { text: '(Look for Haldren.)', to: 'corin', when: eq('act1.market_mage', 'ignored') },
          { text: '(Go on.)', to: 'start' },
        ],
      },
      corin: {
        speaker: 'narrator', mood: 'sad',
        text: '“Corin Vale, hedge-mage, Haldren market.” No tick. In the margin, small: “Too late. Valcastre.” You remember a thin young man pinned against a well-head, and a crowd that did nothing, and yourself walking on.',
        next: 'start',
      },
      letter: {
        speaker: 'narrator', effects: [{ unlockLore: 'lore:the-red-abbess' }],
        text: '“Brother. The lists came safe, and eleven are over the hills who would be in Valcastre. The Abbess thanks you, and says: keep your lamps lit, and your head down, and burn this.” He did not burn it. You think he could not bear to.',
        next: 'start',
      },
      shade: { speaker: 'narrator', text: 'Red thread on a door means a safe house. A thumbprint in wax means the letter came up the chain, hand to hand, from the top. Whoever Brother Caius is passing lists to, they are not small fry. The Red Abbess herself, or near enough to touch her sleeve.', next: 'start' },
      verdict: {
        speaker: 'narrator', effects: [{ unlockLore: 'lore:ashen-creed', section: 'pamphlet' }],
        text: 'Brother Caius is of the Ashen Creed, and if the Wick finds this hollow he will burn for it. But the Creed is a creed of fire. It hates the Lantern’s licences; it does not worship the black water that put the Lantern out. Whatever Caius has done, he did not open the door to the Pale Saint.',
      },
    },
  },
  {
    id: 'dialogue:obj-suspect-ilse-reliquary', name: 'Object: Sister Ilse’s reliquary',
    entries: [{ when: f('act2.clue_ilse'), node: 'again' }, { when: searching, node: 'start' }, { node: 'shut' }],
    nodes: {
      shut: { speaker: 'narrator', text: 'A small silver reliquary in the shape of a cupped hand, Saela’s sign, on a shelf in Sister Ilse’s alcove. It is very cold to look at, somehow. You leave it be.' },
      again: { speaker: 'narrator', mood: 'hollow', text: 'The silver hand sits on its shelf. You do not need to open it again. You can hear the water moving inside, very softly, like breathing.' },
      start: {
        speaker: 'narrator', effects: [{ setFlag: 'act2.clue_ilse', value: true }],
        text: 'In Sister Ilse’s alcove beside the Keeper’s rooms there is a reliquary of silver in the shape of a cupped hand, the sign of Saela. A slip of vellum on it reads: “A finger-bone of Saint Wenna of the Mere.” You lift the lid. There is no bone. There is water, a thumb’s depth of it, black as ink, and it is moving, though nothing has disturbed it.',
        next: 'cold',
      },
      cold: {
        speaker: 'narrator', mood: 'hollow',
        text: 'The Ashmark goes cold. The Embers you carry, which hummed at the Brand like bees in a wall, go silent all at once, as birds go silent when a hawk goes over. On the inside of the lid, scratched into the silver, there is a line of writing all in doubled vowels.',
        choices: [
          { text: '(Read the inscription. You know a little of the Drowned Tongue.)', to: 'read', when: { loreUnlocked: 'lore:the-drowned-tongue' }, tag: 'lore' },
          { text: '[Intellect 15] (Work out the inscription.)', to: 'read', once: true, tag: 'lore', check: { stat: 'intellect', dc: 15, failTo: 'read-fail' } },
          { text: '[Hollow-touched] (Listen to the water.)', to: 'hollow', when: { dialogueTag: 'hollow-touched' }, tag: 'trait', once: true },
          { text: '(Burn it out with the Ashmark.)', to: 'purge', once: true, tag: 'aggressive' },
          { text: '(Close the lid.)', to: 'verdict' },
        ],
      },
      read: {
        speaker: 'narrator', effects: [{ unlockLore: 'lore:the-drowned-tongue', section: 'hymns' }],
        text: '“Maa’reh suun. Ooluun, ooluun. Ae’laa ysolde.” There, sleep. Below, below. Come home, Ysolde. It is a hymn of the Drowned Choir, the one the reed-priests sing over the drowning. Someone has written her name into it.',
        next: 'cold',
      },
      'read-fail': { speaker: 'narrator', text: 'Long vowels and soft consonants, doubled, apostrophed. It looks like the hymns scratched on the reed-temple walls in Greywater. One word in it is not Drowned at all. It is a name, and you know it.', next: 'cold' },
      hollow: {
        speaker: 'narrator', mood: 'hollow',
        text: 'It is singing. Very softly, in a woman’s voice, the kind of voice you would use over a cradle. It is singing to you. It knows your name. It says: you are so tired, aren’t you, and so warm, and it must hurt to be so warm. You shut the lid before it can say anything else.',
        next: 'verdict',
      },
      purge: {
        speaker: 'narrator', effects: [{ setFlag: 'act2.reliquary_purged', value: true }],
        text: 'You lay your palm over the open reliquary and let the Ashmark burn. The black water shrieks, a thin sound like a kettle, and boils away to nothing, and the silver blackens. Far off, somewhere down in the cathedral, a woman cries out once, as if she had been scalded. Then there is silence.',
        next: 'verdict',
      },
      verdict: {
        speaker: 'narrator',
        text: 'Saint Wenna’s bones lie in her abbey in Aldermoor, under Wennamere, where the black water rose. This reliquary never held a saint. It holds a piece of the Mire, kept in the house of the Lantern by the woman who sweeps the Keeper’s rooms.',
      },
    },
  },
  // ---------------------------------------------------------------- the suspects in person
  {
    id: 'dialogue:ch4-ilse-general', name: 'Ilse: The keeper of the font',
    entries: [
      { when: at(QI, 'journal'), node: 'rooms' },
      { when: { all: [searching, f('act2.clue_ilse')] }, node: 'confront' },
      { node: 'start' },
    ],
    nodes: {
      start: {
        speaker: IL,
        text: 'Peace, Ashmarked. (Her voice is very soft, like water running under ice.) The font is fresh this morning. I see to it before the bells. It is the only thing in Solenne that has not frozen. Have you noticed? Water remembers how to move, even now.',
        choices: [
          { text: '"You served Saint Ysolde."', to: 'served', once: true },
          { text: '"Where were you on Lanternmass night?"', to: 'night', once: true },
          { text: '"Peace, Sister."', to: null, tag: 'leave' },
        ],
      },
      rooms: {
        speaker: IL,
        text: 'You have come for her rooms. The Holiness said you would. (She takes a key from her sleeve. Her fingers are cool and a little damp.) They are as she left them. I sweep them every day. One does not read a saint’s dreams, Ashmarked; one keeps them dry. But you will read them. You have that kind of face.',
        next: 'start',
      },
      served: {
        speaker: IL,
        text: 'I brought her water. That was all I ever did. Water for her hands, water for the font, water for the long nights with the Brand. (She smiles.) She told me her dreams, and I listened. No one else would. They wanted a saint who did not dream.',
        next: 'start',
      },
      night: {
        speaker: IL,
        text: 'At the font. I am always at the font. I was there when the light went out, and the snow came in through the doors, and everyone began to scream. (Her face does not change at all.) It was very beautiful. I am sorry. That is a wicked thing to say. But it was.',
        next: 'start',
      },
      confront: {
        speaker: IL,
        text: 'You opened my reliquary. (She is not angry. She is not afraid. She tilts her head, like someone listening to rain.) It is only water. Everything is only water, in the end. Even you. Especially you.',
        choices: [
          { text: '"You let her into the cathedral."', to: 'door' },
          { text: '[Will 20] "Tell me the truth, Sister. Here, now, before I say it to Vellane."', to: 'truth', once: true, tag: 'intimidate', check: { stat: 'will', dc: 20, failTo: 'calm' } },
          { text: '"Someone burned your water. Did that hurt?"', to: 'burned', once: true, when: f('act2.reliquary_purged') },
          { text: '(Say nothing, and go.)', to: null, tag: 'leave' },
        ],
      },
      door: { speaker: IL, text: 'Doors are for opening, Ashmarked. Ask the Deacon about doors; she has so many keys. Ask the lamplighter where his lists go. (She folds her damp hands.) Everyone in this house is keeping something dry.', next: 'confront' },
      truth: {
        speaker: IL, mood: 'happy',
        text: '(For the first time her smile reaches her eyes.) She asked me. And I loved her, and I opened the door, and I held it while the snow came in. Will you tell him? Then tell him. Tell him the font is very deep. He will not understand, but you will.',
        next: 'confront',
      },
      calm: { speaker: IL, text: 'You are shouting, a little. You need not. (She lays a cool hand on your arm, and the Ashmark flinches from it.) Hush. Listen. Can you hear the rain under the snow?', next: 'confront' },
      burned: {
        speaker: IL, mood: 'hollow',
        text: '(She touches her breast, just over the heart, where a burn is showing pink through the grey wool.) Yes. It did. You are so warm, little spark. She said you would be. I remember being warm. It hurt.',
        next: 'confront',
      },
    },
  },
  {
    id: 'dialogue:ch4-ottavia-general', name: 'Ottavia: The archive',
    entries: [
      { when: eq('act2.wrong_accused', 'ottavia'), node: 'cell' },
      { when: { all: [searching, f('act2.clue_ottavia')] }, node: 'confront' },
      { node: 'start' },
    ],
    nodes: {
      start: {
        speaker: OT,
        text: 'Touch nothing. Breathe shallowly. The archive does not like strangers and neither do I. (She does not look up from her ledger.) If the Lord-Inquisitor sent you, tell him the inventory of the Brand’s vestments is on his desk and has been since Ithrensday.',
        choices: [
          { text: '"You had a key to the Brand’s doors on Lanternmass night."', to: 'night', once: true },
          { text: '"What do you keep in here?"', to: 'keep', once: true },
          { text: '"I’ll leave you to it."', to: null, tag: 'leave' },
        ],
      },
      night: { speaker: OT, mood: 'angry', text: 'I had a key to the archive, which is not the Brand, which is three hundred yards and two stairs away. I was asleep on this desk with my face in the vestment rolls. Ask anyone. Ask the rolls; there’s ink on them in the shape of my cheek.', next: 'start' },
      keep: { speaker: OT, text: 'Eleven hundred years of the Lantern’s paperwork. Every candle-tithe, every licence, every heretic’s confession, filed and cross-filed. Ink is a kind of faith, you know. It assumes someone will one day read it. Most days I am the only one.', next: 'start' },
      confront: {
        speaker: OT, mood: 'afraid',
        text: 'You have been in my desk. (Her quill has stopped.) Don’t. Don’t say it. I know what they are, I know what the Edict says, I have read it more often than the Lord-Inquisitor has. They are books. The Wick burns them. I keep them. If that is heresy, it is the oldest kind there is.',
        choices: [
          { text: '"Your secret is safe with me."', to: 'safe', effects: [{ setFlag: 'npc.deacon-ottavia.protected', value: true }] },
          { text: '[Will 15] "Then help me. Who was near the Brand that night?"', to: 'hint', once: true, tag: 'persuade', check: { stat: 'will', dc: 15, failTo: 'no-hint' } },
          { text: '"The Wardens’ reports. You’ve been reading them."', to: 'reports', once: true, when: f('act2.ley_reports_found') },
          { text: '(Leave her.)', to: null, tag: 'leave' },
        ],
      },
      safe: { speaker: OT, mood: 'sad', text: '…Thank you. (She does not believe you, quite. She wants to.) No one has said a kind thing to me in this building since the Quench. I had forgotten what it sounded like.', next: 'confront' },
      hint: {
        speaker: OT,
        text: '(She hesitates.) The font. On Lanternmass morning I came down early, before the bells, and the floor of the nave was wet from the font to the great doors. Not snow; the snow had not come in yet. Water. A trail of it, as though someone had walked out of the font and gone to open the doors. I thought nothing of it at the time. Sister Ilse is always at the font.',
        next: 'confront',
      },
      'no-hint': { speaker: OT, mood: 'angry', text: 'Help you? You have just been through my drawers. I shall help you to the door. It is that way.', next: 'confront' },
      reports: {
        speaker: OT, mood: 'sad',
        text: 'One a year. I take one out of the undercroft at Lanternmass, when the Wick is all at its prayers, and put it back the next. I have read thirty-one of them. Every one says the same thing. The fire is dying, and it has been dying since before my grandmother, and the Church has known. (She looks at you.) Do you see why I hid them? Not from the Wick. From the Hierophant. It would break his heart.',
        next: 'confront',
      },
      cell: { speaker: OT, mood: 'angry', text: '(Through the bars of a Valcastre cell, ink still on her fingers.) Books. I hid books. I hope the Saint’s real servant thanks you for it. I hope she sends a very nice letter.' },
    },
  },
  {
    id: 'dialogue:ch4-caius-general', name: 'Caius: The lamplighter',
    entries: [
      { when: eq('act2.wrong_accused', 'caius'), node: 'cell' },
      { when: { all: [searching, f('act2.clue_caius')] }, node: 'confront' },
      { node: 'start' },
    ],
    nodes: {
      start: {
        speaker: CA,
        text: 'Seven hundred lamps in this nave, and every one lit from tallow now. (He holds up his taper, and you see the burn-scars along his forearm.) I was the last to light one from the Brand. Lanternmass Eve. I remember thinking how warm it was. You don’t think about warmth until it’s gone.',
        choices: [
          { text: '"Where were you on Lanternmass night?"', to: 'night', once: true },
          { text: '"Those scars."', to: 'scars', once: true },
          { text: '"Light your lamps, Brother."', to: null, tag: 'leave' },
        ],
      },
      night: { speaker: CA, text: 'Doing the midnight lamps in the north aisle. I saw the light go out from there: the whole nave went dark at once, all seven hundred, as if someone had shut a door on them. Then the screaming started. I ran toward it. I don’t know why. Everyone else ran away.', next: 'start' },
      scars: { speaker: CA, text: 'Tapers. Twelve years of tapers. (He pulls his sleeve down.) Fire is fire, Ashmarked. It does not ask whose hand holds the taper. It burns them all the same.', next: 'start' },
      confront: {
        speaker: CA, mood: 'afraid',
        text: 'You found it. (He goes very white, and then, oddly, he straightens.) Well. Yes. I pass the lists. Eleven people are over the hills tonight who would be in Valcastre. Fire belongs to everyone, and so does warning. Will you give me to him?',
        choices: [
          { text: '"Not for that. But you know something about that night."', to: 'hint' },
          { text: '[Shade] "Tell the Abbess the Quiet Hand says hello."', to: 'shade', when: { classIs: 'class:shade' }, tag: 'class', once: true },
          { text: '"I haven’t decided."', to: null, tag: 'leave' },
        ],
      },
      hint: {
        speaker: CA,
        text: 'Only that the north aisle was cold before the light went out. Cold and wet, like a cellar. I could smell it: river-water, mud, the reed-smell you get off the Greywater carts. In a cathedral. (He shakes his head.) The Creed would sooner burn the world than drown it, Ashmarked. Whoever let her in, it was someone who loves the water.',
        next: 'confront',
      },
      shade: { speaker: CA, mood: 'happy', text: '(He laughs, startled, and then covers his mouth.) The Hand. Seven Sparks. I’ll tell her. She’ll want to meet you, you know. She collects people who can open doors.', next: 'confront' },
      cell: { speaker: CA, mood: 'angry', text: '(Through the bars of a Valcastre cell, his forearms newly bandaged.) Fire belongs to everyone. Even in here. Tell the Abbess nothing, Ashmarked. Tell her nothing at all. She already knows.' },
    },
  },
  // ---------------------------------------------------------------- the accusation
  {
    id: 'dialogue:ch4-accusation', name: 'Vellane: The accusation',
    entries: [{ when: f('act2.ilse_accused'), node: 'after' }, { node: 'start' }],
    nodes: {
      after: { speaker: V, text: 'The matter of the door is closed, Ashmarked. I have written it down. Go and do what you came south to do.' },
      start: {
        speaker: 'narrator',
        text: 'The Hierophant’s court has been cleared of clerks. The Lord-Inquisitor stands by the cold throne; the Hierophant sits on it, very small in his furs. Before them stand the three keepers. Deacon Ottavia, ink to the wrist and furious. Brother Caius, pale, his scarred arms folded. And Sister Ilse, with her damp hands clasped, looking at the snow in the high windows as if she can hear something in it.',
        next: 'vellane',
      },
      vellane: {
        speaker: V,
        text: 'You have been in their desks and under their beds and inside their reliquaries. I have let you, because I would rather one of them went to Valcastre than all three. (He turns to you.) Lay it out, if you wish. Then name the one who opened the door to the Pale Saint.',
        next: 'name',
      },
      name: {
        speaker: V,
        text: 'Well?',
        choices: [
          { text: '(Lay out what you have found, first.)', to: 'evidence', once: true },
          { text: '"Sister Ilse."', to: 'ilse', effects: [accuse('ilse'), { setFlag: 'act2.ilse_unmasked', value: true }, { unlockLore: 'lore:sister-ilse', section: 'unmasked' }, { reputation: LANT, delta: 10 }, { reputation: 'faction:drowned-choir', delta: -10 }] },
          { text: '"Deacon Ottavia."', to: 'ottavia', effects: [accuse('ottavia'), { setFlag: 'act2.wrong_accused', value: 'ottavia' }] },
          { text: '"Brother Caius."', to: 'caius', effects: [accuse('caius'), { setFlag: 'act2.wrong_accused', value: 'caius' }, { reputation: 'faction:ashen-creed', delta: -20 }] },
        ],
      },
      evidence: {
        speaker: 'narrator',
        text: 'Three secrets. Forbidden books under a false bottom. Red thread and Creed letters under a flagstone. Black water in a saint’s reliquary. All three keepers are watching you, and only one of them is smiling.',
        choices: [
          { text: '"I saw that night in the Brand. A grey sleeve on the door, and a hand wet to the wrist."', to: 'e-vision', once: true, when: f('act2.brand_vision_full') },
          { text: '"Ysolde’s last daybook: ‘She is the only one who ever asked what I saw.’"', to: 'e-journal', once: true, when: f('act2.journal_ilse_named') },
          { text: '[Intellect 15] "Neither books nor fire put out the Brand. Black water did. Ask who keeps water."', to: 'e-reason', once: true, tag: 'lore', check: { stat: 'intellect', dc: 15, failTo: 'e-muddle' } },
          { text: '[Oathbound] "By the Seventh Light, I will name only what I have seen."', to: 'e-oath', when: { classIs: 'class:oathbound' }, tag: 'class', once: true },
          { text: '"That’s all I have."', to: 'name' },
        ],
      },
      'e-vision': { speaker: AU, mood: 'afraid', text: '(The old man’s hand goes to his mouth.) Grey. The sisters of the font wear grey. Castor, the sisters of the font—', next: 'evidence' },
      'e-journal': { speaker: IL, text: '(Sister Ilse closes her eyes, as if at a kindness.) She did write that. I was. I am. I am the only one.', next: 'evidence' },
      'e-reason': { speaker: V, text: '(He looks at you, then, slowly, at the font-sister.) Yes. Books do not quench fire, nor does fire. I had been looking for a heretic. I should have been looking for a believer.', next: 'evidence' },
      'e-muddle': { speaker: V, text: 'You are thinking aloud. Do it more quietly, or more quickly. Preferably both.', next: 'evidence' },
      'e-oath': { speaker: V, text: 'An oath. How old-fashioned. (He means it as a compliment.) Then name what you have seen, Lightsworn, and I shall believe you, because I shall have to.', next: 'evidence' },
      ilse: {
        speaker: IL, mood: 'happy',
        text: '(She smiles at you, and it is the sweetest smile you have ever seen.) Maa’reh suun. Ooluun, ooluun. (Then, in the common tongue, very gently:) You are so warm. She said you would be. Don’t be afraid, little spark. It doesn’t hurt for long.',
        next: 'ilse2',
      },
      ilse2: {
        speaker: 'narrator',
        text: 'She turns, and walks across the court and out through the archway to the cathedral, and nobody stops her, because nobody can quite believe it. You follow her into the nave. She goes down the three steps into the great font, which is a hand deep, and the water closes over her head as if it were a well, and she is gone. Ripples go out to the rim, and come back, and are still.',
        next: 'ilse3',
      },
      ilse3: {
        speaker: V,
        text: '(The Lord-Inquisitor stands at the rim and looks down at a hand’s depth of water over white marble.) …I shall have it drained. I shall have every font in Solenne drained. (He turns to you, and for once his voice is not quite level.) Thank you, Ashmarked. Truly. I had her as a frightened woman who prayed too much. I am not often wrong.',
        next: 'ilse4',
      },
      ilse4: { speaker: AU, mood: 'sad', text: 'She brought me my tea. Every morning for eleven years. With honey in it, because of my throat. (He sits down on the font’s edge, an old man in furs, and weeps without any sound.)' },
      ottavia: {
        speaker: OT, mood: 'afraid',
        text: 'Me? Books! I hide books! I never touched the Brand in my life, I never went near the nave that night, ask the rolls, ask the ink! (The brothers of the Wick have her by the arms.) Holiness. Holiness, you know me. Thirty years.',
        choices: [
          { text: '[The Hierophant rises]', to: 'mercy', when: f('act2.aurelian_mercy') },
          { text: '[The Hierophant looks away]', to: 'taken', when: { not: f('act2.aurelian_mercy') } },
        ],
      },
      caius: {
        speaker: CA, mood: 'angry',
        text: '(He does not struggle when the brothers take him.) I opened no door for her. I pass lists. I warn people before your carts come. (He lifts his chin at Vellane.) Fire belongs to everyone, Lord-Inquisitor. You can’t license it, and you can’t put it in a cell.',
        next: 'caius2',
      },
      caius2: {
        speaker: V,
        text: 'Ah. A Creed brother in my own nave. (He sounds almost pleased.) Not the traitor I wanted, but a traitor. Valcastre. (To you, mildly:) The Ashen Creed will hear whose word sent him. I should keep away from red thread, for a while.',
        choices: [
          { text: '[The Hierophant rises]', to: 'mercy', when: f('act2.aurelian_mercy') },
          { text: '[The Hierophant looks away]', to: 'taken', when: { not: f('act2.aurelian_mercy') } },
        ],
      },
      mercy: {
        speaker: AU,
        text: '(The old man stands up from the throne, shaking.) They are not to be put to the question, Castor. Not this one. Valcastre, if you must. But not the question. I have sealed a mercy, and I shall seal another.',
        next: 'mercy2',
      },
      mercy2: { speaker: V, text: '(A long pause. Then he bows.) As your Holiness wishes. (To the brothers:) Gently, then.', next: 'taken' },
      taken: {
        speaker: 'narrator',
        text: 'They take the accused out through the archway. As the doors close, Sister Ilse catches your eye across the court, and inclines her head to you, very slightly, as one thanks a stranger for holding a door.',
        next: 'vanish',
      },
      vanish: {
        speaker: 'narrator', mood: 'hollow',
        text: 'In the morning Sister Ilse’s bed in the Keeper’s quarters is empty and still warm. A trail of wet footprints leads from it down the stair, across the nave, and up to the rim of the great font. There they stop. The water is a hand deep. Ripples are still going out to the edges, and coming back.',
      },
    },
  },
  // ---------------------------------------------------------------- Valcastre
  {
    id: 'dialogue:ch4-valcastre-arrival', name: 'Valcastre: The fortress on the rock',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: 'narrator',
        text: 'Valcastre stands on a black rock in the sea, joined to the shore by a causeway that the tide covers twice a day. Its walls are white, as everything of the Lantern’s is white, and streaked with rust from the iron in them. Carts come and go along the causeway with covered loads. The covers move.',
        next: 'carts',
      },
      carts: {
        speaker: 'narrator', effects: [{ unlockLore: 'lore:valcastre', section: 'cells' }],
        text: 'Within the gate the fortress is quieter than a fortress ought to be. Brothers of the Wick walk the yard without speaking. From somewhere below comes the sound of someone singing, very badly, to keep warm.',
        choices: [
          { text: '[Look at the carts]', to: 'haldish', when: eq('act1.ruler', 'wick') },
          { text: '[Look up at the barred windows]', to: 'corin', when: eq('act1.market_mage', 'ignored') },
          { text: '[A man in grey is waiting by the cell stair]', to: 'hale', when: f('npc.garrick-hale.let_go') },
          { text: '(Go down to the cells.)', to: 'down' },
        ],
      },
      haldish: {
        speaker: 'narrator', mood: 'sad',
        text: 'The loads in the carts are Haldish: farmers, a smith, a midwife still in her apron, an old man clutching a hearth-knot of red string. Since the Order took the keeping of the Haldmarch, the carts have come south full every week. A brother checks their names against a list. Most of them have only a village written beside them, and the word “suspicion”.',
        next: 'carts',
      },
      corin: {
        speaker: 'narrator', mood: 'sad',
        text: 'At a barred window two storeys up, a thin young face looks down into the yard. You know it. Corin Vale, the hedge-mage from Haldren market, whom you walked past while they lifted him into the cart. He does not know you. He is singing, badly, to keep warm.',
        next: 'carts',
      },
      hale: {
        speaker: HA, effects: [{ unlockLore: 'lore:castor-vellane', section: 'lanterns' }],
        text: '(Garrick Hale, in a jailer’s grey instead of an inquisitor’s black.) You. Of course it’s you. They sent me here after my report on Wennamere. Warden of the lower cells. The Lord-Inquisitor thought I’d like it; I was a boy here, once. They took the Last Wick off me too. It’s up in the high tower with the others he’s gathering, all of them leaning the same way. (He looks at the stair.) I know who you’ve come for. Go on down. I’ll be along.',
        next: 'carts',
      },
      down: { speaker: 'narrator', text: 'The cell stair goes down into the rock, past the waterline. The walls sweat. At the bottom, behind a door of black oak bound in Wick iron, someone is praying in a voice you know.' },
    },
  },
  {
    id: 'dialogue:obj-valcastre-cell-door', name: 'Object: Anselm’s cell door',
    entries: [
      { when: { all: [f('act2.anselm_freed'), { not: f('npc.anselm-pryde.apology_made') }] }, node: 'sorry' },
      { when: f('act2.anselm_freed'), node: 'empty' },
      { when: { not: at(QP, 'cells') }, node: 'locked' },
      { node: 'door' },
    ],
    nodes: {
      ...apology,
      empty: { speaker: 'narrator', text: 'The cell door hangs open on its hinges. Inside there is a pallet of wet straw, a tin cup and, scratched into the wall at the height of a kneeling man, a small and careful lantern.' },
      locked: { speaker: 'narrator', text: 'A cell door of black oak, bound in Wick iron. Someone is inside. It is not your business yet, and the jailer’s eyes are on you.' },
      door: {
        speaker: 'narrator',
        text: 'Through the grille you can see him: Brother Anselm, thinner by a third, kneeling on wet straw with his back to the door. His tonsure has grown out grey. He is praying for someone. You hear your own name, and stop breathing.',
        next: 'jailer',
      },
      jailer: {
        speaker: 'narrator',
        text: 'The jailer of the lower cells is a broad Solenni brother with a ring of keys at his belt, and he has been watching you since the stair. “The priest,” he says. “The Lord-Inquisitor’s priest. Nobody sees him without a paper.”',
        next: 'options',
      },
      options: {
        speaker: 'narrator',
        text: 'The lock is old Wick work, heavy and plain. The jailer is in the way.',
        choices: [
          { text: '[Shade] (Wait for the jailer to turn, and go to work on the lock.)', to: 'pick', when: { classIs: 'class:shade' }, tag: 'class' },
          { text: '[Sable] "Sable. The lock."', to: 'sable', when: f('companion.sable.following') },
          { text: '[Finesse 15] (Wait for the jailer to turn, and try the lock with a bent pin.)', to: 'pick', once: true, check: { stat: 'finesse', dc: 15, failTo: 'pick-fail' } },
          { text: '"Garrick."', to: 'hale', when: f('npc.garrick-hale.let_go') },
          { text: '[Wick papers] "In the Lord-Inquisitor’s name. I am here for the priest."', to: 'writ', when: eq('act2.church_stance', 'pledged') },
          { text: '"The Hierophant has sealed a mercy for the marked."', to: 'mercy', once: true, when: f('act2.aurelian_mercy') },
          { text: '[Will 20] "Look at him, brother. You know what he is in for. Owning a book."', to: 'jailer-yes', once: true, tag: 'persuade', check: { stat: 'will', dc: 20, failTo: 'jailer-fail' } },
          { text: '(Lay the Ashmark on the lock, and burn it out.)', to: 'burn', tag: 'aggressive' },
          { text: '(Not yet.)', to: null, tag: 'leave' },
        ],
      },
      pick: {
        speaker: 'narrator', effects: freed('lock'),
        text: 'The jailer turns to spit. Three heartbeats, four: the wards give with a sound like a knuckle cracking, and the door swings in. When the jailer turns back you are already inside, and he decides, visibly, that he saw nothing at all.',
        next: 'cell',
      },
      sable: {
        speaker: SA, effects: [...freed('lock'), { loyalty: SA, delta: 3 }],
        text: '(She is at the lock before you have finished saying it.) Ooh. Wick iron. They always make it so heavy, as if heavy were the same as clever. (Click.) There. Don’t tell the jailer; he looks the sort to take it personally.',
        next: 'cell',
      },
      'pick-fail': {
        speaker: 'narrator',
        text: 'The pin snaps in the wards. The jailer’s head turns at the sound, and you are standing a pace from the door with your hands empty, looking innocent, and he is looking at you as if he has seen a great many innocent faces.',
        next: 'options',
      },
      hale: {
        speaker: HA, effects: freed('hale'),
        text: '(Hale comes down the last steps behind you. He looks at the door, and at the jailer, and at you.) Brother. Go and see to the tide-gate. Now. (The jailer goes. Hale takes the key from his own belt and turns it in the lock.) I wrote that you were lost in the snow. I may as well have lost a priest too.',
        next: 'hale2',
      },
      hale2: {
        speaker: HA, mood: 'sad',
        text: 'I’m going to stand here and look at this wall for a while. It’s a very interesting wall. When I turn round, I’d be obliged if there were nobody behind me. (He turns his back.) Look after him. He prayed for me too, you know. Every night. Even me.',
        next: 'cell',
      },
      writ: {
        speaker: 'narrator', effects: [...freed('vellane'), { setFlag: 'act2.owes_vellane', value: true }],
        text: 'The jailer breaks the seal, and reads, and his face changes. Then he takes a second letter from inside his habit, already opened, and gives it to you without a word. It is in a tidy, cold hand you know.',
        next: 'writ2',
      },
      writ2: {
        speaker: V,
        text: '“If the Ashmarked comes for the priest, give him. I have had a year of his learning, and he is no more use to me in a cell than out of it. Tell the Ashmarked that I shall ask for something in return, one day, and that I shall not ask twice. C.V.”',
        next: 'cell',
      },
      mercy: {
        speaker: 'narrator',
        text: 'The jailer hears you out, and then he laughs, not unkindly. “The Hierophant’s mercy. Aye, it came. It’s on the board in the guardroom, with a nail through it. The Holiness’s writ doesn’t run in Valcastre, friend. Only the Lord-Inquisitor’s.”',
        next: 'options',
      },
      'jailer-yes': {
        speaker: 'narrator', effects: freed('jailer'),
        text: 'He looks. For a long time he looks at the thin man on the straw, praying for the one who put him there. Then he takes the ring from his belt, finds the key without looking, and turns it. “Nobody saw the priest go,” he says. “Nobody ever sees anything, down here. That’s what down here is for.”',
        next: 'cell',
      },
      'jailer-fail': { speaker: 'narrator', text: '“I know what he’s in for,” the jailer says. “I know what they’re all in for. That’s why I don’t look.” He folds his arms and plants himself before the door.', next: 'options' },
      burn: {
        speaker: 'narrator',
        effects: [...freed('burn'), { setFlag: 'act2.valcastre_alarm', value: true }, { reputation: LANT, delta: -10 }],
        text: 'You lay your palm on the Wick iron. It goes red, then white, and the lock runs down the oak like candle-wax. The jailer shouts. Above, a bell begins to ring, and goes on ringing. The door falls in on its hinges, smoking. You have perhaps a minute.',
        next: 'cell',
      },
      cell: {
        speaker: AN, mood: 'afraid',
        text: '(He has turned on his knees, and he is staring at you as if you were a ghost, or an answer.) …You. Seven keep me. I prayed for you every night, and I was never sure whether I was praying you would come, or praying you wouldn’t.',
        next: 'sorry',
      },
    },
  },
  {
    id: 'dialogue:ch4-anselm-freed', name: 'Anselm: After Valcastre',
    entries: [{ when: { not: f('npc.anselm-pryde.apology_made') }, node: 'sorry' }, { node: 'start' }],
    nodes: {
      ...apology,
      start: {
        speaker: AN,
        text: 'I keep reaching for my breviary and finding nothing there. They burned it, at Valcastre. I find I know most of it by heart. That was a surprise; I always thought I was reading it.',
        choices: [
          { text: '"How are you, truly?"', to: 'truly', once: true },
          { text: '"What did Vellane want from you?"', to: 'vellane', once: true },
          { text: '"Come on, Brother."', to: null, tag: 'leave' },
        ],
      },
      truly: {
        speaker: AN, mood: 'sad',
        text: 'Thinner. Older. Less sure of nearly everything, except that the Light is not the men who carry it. I used to think that was a heresy. Now I think it may be the only orthodoxy I have left.',
        next: 'start',
      },
      vellane: {
        speaker: AN,
        text: 'The primer. The Wardens’ figures. He asked me to read Hesta’s old book aloud to him, a chapter a night, and took notes in a beautiful hand. He was never unkind. Once he wept, at the chapter on the cooling of the leys. I have never been so frightened of anyone in my life.',
        next: 'start',
      },
    },
  },
];

export default dialogues;
