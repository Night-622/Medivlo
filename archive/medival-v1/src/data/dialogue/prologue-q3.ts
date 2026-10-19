/** Dialogue: quest:the-witchfinder. Owner: Claude 4. */
import type { DialogueDef } from '@/core';

const dialogues: DialogueDef[] = [
  {
    id: 'dialogue:hale-arrival', name: 'Hale: Arrival',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:garrick-hale',
        text: 'You’ll be the one who lit the pyre. Half the village pointed at you before I’d got off my horse.',
        next: 'name',
      },
      name: {
        speaker: 'npc:garrick-hale',
        text: 'Garrick Hale, Inquisitor of the Order of the Wick. Don’t look like that. I’m not here to burn anyone. Not yet, and perhaps not at all.',
        next: 'wick',
      },
      wick: {
        speaker: 'narrator', effects: [{ unlockLore: 'lore:order-of-the-wick', section: 'last-wick' }, { unlockLore: 'lore:the-brand', section: 'last-wick' }],
        text: 'He lifts a small iron lantern from his saddle. The flame inside is white-gold, and as you step closer it leans toward you through the grille like a dog toward its master.',
        next: 'odd',
      },
      odd: {
        speaker: 'npc:garrick-hale',
        text: 'Interesting. This is the Last Wick, lit from the Brand itself before it died. It has never done that before.',
        choices: [
          { text: 'What do you want with me?', to: 'want' },
          { text: 'I’ve done nothing wrong.', to: 'wrong' },
        ],
      },
      wrong: { speaker: 'npc:garrick-hale', text: 'I didn’t say you had. Fire’s no crime. Unlicensed fire is.', next: 'want' },
      want: {
        speaker: 'npc:garrick-hale',
        text: 'The truth. I’ll test you, and the Wick will tell me whether you’re Lantern-touched or something wearing its light. But first I’ll hear what your Elder has to say. Don’t leave the village.',
      },
    },
  },
  {
    id: 'dialogue:anselm-secret', name: 'Anselm: The Warden’s Primer',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: 'npc:anselm-pryde', mood: 'afraid', text: 'Quickly, inside. Shut the door. …Good.', next: 'book' },
      book: {
        speaker: 'narrator',
        text: 'He pulls a loose stone from behind the altar and takes out a battered book bound in red leather, stamped with an ember in an open hand.',
        next: 'primer',
      },
      primer: {
        speaker: 'npc:anselm-pryde',
        effects: [
          { setFlag: 'prologue.anselm_secret', value: true },
          { unlockLore: 'lore:the-emberwardens' }, { unlockLore: 'lore:the-heartfire-and-leys' },
          { unlockLore: 'lore:the-heartfire-and-leys', section: 'cooling' },
          { unlockLore: 'lore:the-brand' }, { unlockLore: 'lore:the-lanternate' },
        ],
        text: 'A Warden’s Primer. Emberwarden, and banned since 1041. I bought it from a pedlar thirty years ago because I was young and curious, and the Church sent me to Brindlecross for exactly that sort of curiosity.',
        next: 'drawing',
      },
      drawing: {
        speaker: 'npc:anselm-pryde',
        text: 'Look at this drawing: the mark the Wardens’ founders were said to bear, "from touching the heart’s fire". A scar like a burn. It’s your hand. It is exactly your hand.',
        choices: [
          { text: 'What does it mean?', to: 'mean' },
          { text: 'Why show me this now?', to: 'why' },
        ],
      },
      mean: {
        speaker: 'npc:anselm-pryde',
        text: 'I don’t know. I truly don’t. But the Wardens guarded the leys and fought the Mire, and you just burned four Hollowed with a bonfire. Whatever happens with Hale, don’t let him take you south before you’ve finished what you started.',
        next: 'licence',
      },
      why: {
        speaker: 'npc:anselm-pryde',
        text: 'Because Hale will ask you whether anyone here keeps heretic books, and I’d rather you heard about them from me.',
        next: 'licence',
      },
      licence: {
        speaker: 'npc:anselm-pryde',
        text: 'If it helps… I know a little about Wick-licences. Enough to forge one, Ithren forgive me. Say the word.',
        choices: [
          { text: 'Do it.', to: 'forged', effects: [{ setFlag: 'prologue.forged_licence', value: true }] },
          { text: 'No. I won’t put you at risk.', to: 'refuse', effects: [{ loyalty: 'npc:anselm-pryde', delta: 5 }] },
        ],
      },
      forged: { speaker: 'npc:anselm-pryde', text: 'There. The ink’s still wet, so keep it out of the snow. Signed by the Prior of Haldren, who has terrible handwriting.' },
      refuse: { speaker: 'npc:anselm-pryde', mood: 'happy', text: 'Bless you. Go on, then. He’s waiting.' },
    },
  },
  {
    id: 'dialogue:hale-test', name: 'Hale: The test of the Wick',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:garrick-hale',
        text: 'Your Elder says you’re a good neighbour who lit a fire that saved his village. Your priest says nothing, which priests rarely do.',
        next: 'test',
      },
      test: {
        speaker: 'npc:garrick-hale',
        text: 'Hold out your hand over the Wick. If the Lantern loves you, you’ve nothing to fear.',
        choices: [
          { text: '[Hold out your hand]', to: 'submit' },
          { text: '"You want the truth? Come and see it. Come to the abbey with me."', to: 'persuade', once: true, tag: 'persuade', check: { stat: 'will', dc: 15, failTo: 'persuade-fail' } },
          { text: '[Devout] "By the Seventh Light, let me prove it in the abbey, not on a village green."', to: 'persuade', when: { dialogueTag: 'devout' }, tag: 'trait' },
          { text: '[Oathbound] "Brother of the Wick, I’m Lightsworn too. Let me cleanse the abbey, then judge me."', to: 'persuade', when: { classIs: 'class:oathbound' }, tag: 'class' },
          { text: '[Show the forged Wick-licence]', to: 'licence', when: { flag: 'prologue.forged_licence' }, tag: 'deceive' },
          { text: '[Silver Tongue] "I’m licensed already. Surely Solenne sent word?"', to: 'lie', when: { dialogueTag: 'silver-tongue' }, tag: 'deceive' },
          { text: '[Shade] "Licensed in Haldren. The Quiet Hand vouches for me." (a convincing lie)', to: 'lie', when: { classIs: 'class:shade' }, tag: 'class' },
          { text: '"The priest keeps heretic books. Emberwarden books."', to: 'betray', when: { all: [{ flag: 'prologue.anselm_secret' }, { not: { flag: 'prologue.anselm_betrayed' } }] } },
          { text: '"No. You’re not putting anything of mine near that lantern."', to: 'defy', tag: 'aggressive' },
        ],
      },
      submit: {
        speaker: 'narrator',
        text: 'You hold your hand over the iron lantern. The white flame leaps up through the grille and wraps your fingers. It doesn’t burn. It sings. Hale steps back as though struck.',
        next: 'submit2',
      },
      submit2: {
        speaker: 'npc:garrick-hale',
        effects: [{ setFlag: 'prologue.hale_outcome', value: 'submitted' }, { reputation: 'faction:lanternate', delta: 15 }],
        text: 'Lantern-touched… or something wearing its light. I can’t tell, and I’ve tested two hundred. Very well. Your Elder says there’s an abbey under that mere with something burning in it. Cleanse it, and I’ll write to Solenne that you’re the former.',
        next: 'sluice',
      },
      'persuade-fail': { speaker: 'npc:garrick-hale', text: 'Clever words. I’ve heard cleverer. Your hand, please.', next: 'test' },
      persuade: {
        speaker: 'npc:garrick-hale',
        effects: [{ setFlag: 'prologue.hale_outcome', value: 'persuaded' }, { reputation: 'faction:lanternate', delta: 10 }],
        text: '…A witness instead of a jailer. All right. I’ll come to your abbey, and I’ll see what you are with my own eyes.',
        next: 'sluice',
      },
      licence: {
        speaker: 'narrator',
        text: 'Hale reads the licence twice, holding it up to the Wick’s light. The ink is very fresh.',
        next: 'lie',
      },
      lie: {
        speaker: 'npc:garrick-hale',
        effects: [{ setFlag: 'prologue.hale_outcome', value: 'deceived' }, { setFlag: 'npc.garrick-hale.suspicious', value: true }],
        text: 'Hm. I’ve had no word, but the roads are closed and the crows are slow. Very well. For now. I’ll be at the tavern.',
        next: 'sluice',
      },
      betray: {
        speaker: 'npc:garrick-hale',
        effects: [
          { setFlag: 'prologue.anselm_betrayed', value: true }, { setFlag: 'prologue.anselm_secret', value: false },
          { reputation: 'faction:lanternate', delta: 20 },
        ],
        text: 'Does he. …Thank you. That took courage, or something that looks like it.',
        next: 'betray2',
      },
      betray2: {
        speaker: 'narrator',
        text: 'Two soldiers walk toward the chapel. Brother Anselm does not run. He looks at you once across the green, and then he lets them take his arms.',
        next: 'betray3',
      },
      betray3: { speaker: 'npc:garrick-hale', text: 'I’ll still test you, you understand. Your hand.', next: 'submit' },
      defy: {
        speaker: 'npc:garrick-hale', mood: 'angry',
        effects: [{ setFlag: 'prologue.hale_outcome', value: 'defied' }, { reputation: 'faction:lanternate', delta: -25 }],
        text: 'Then you’ve made my choice for me. Take them!',
      },
      sluice: {
        speaker: 'npc:garrick-hale',
        text: 'Your Elder says the abbey can’t be reached while the mere stands, and the old sluice that could drain it is locked. The miller holds the key. See to it.',
      },
    },
  },
];

export default dialogues;
