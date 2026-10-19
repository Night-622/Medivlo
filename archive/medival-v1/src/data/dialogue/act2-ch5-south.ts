/** Dialogue: Act II Chapter 5 (south), quest:the-ember-auction (Saltreach Isles). docs/lore/11-act2-spec.md. Owner: Claude 4.
 *  The Glass Throne, Vesper’s general/companion scenes and the Qasiri of Zahrun are in act2-ch5-southb.ts.
 *  Quest-critical flags are set on the deciding choice (or the first node after a check), never on a last node. */
import type { DialogueDef, NarrativeEffect } from '@/core';

const QA = 'quest:the-ember-auction';
const f = (flag: string) => ({ flag });
const is = (flag: string, value: string) => ({ flag, op: '==' as const, value });
const at = (stage: string) => ({ questStage: QA, stage });
const set = (flag: string, value: boolean | string = true): NarrativeEffect => ({ setFlag: flag, value });
const VESPER = 'npc:vesper-qadri' as const;
const following = f('companion.vesper-qadri.following');

/** The Ember of the Tide. Guarded by act2.ember_tide_claimed: the vault’s entries route to 'empty' once it is set. */
const TIDE_CLAIM: NarrativeEffect[] = [
  set('act2.ember_tide_claimed'),
  { addFlag: 'world.embers_held', amount: 1 },
  { setFlag: 'ashmark.rank', value: 4 },
  { unlockLore: 'lore:the-seven-embers', section: 'tide' },
];
const outcome = (v: string): NarrativeEffect => set('act2.auction_outcome', v);
const BENE_INTRO = 'Benedetta Aurevine has taken the only clean table on Gull Rock and covered it with a white cloth. She is drinking Solenni wine from a glass she brought with her. Her gown is ivory, her chain is a Lanternate factor’s gold, and the two Wick soldiers behind her chair are trying not to look seasick.';

const dialogues: DialogueDef[] = [
  // ----- Wren Tallow: passage (route on npc:wren-tallow during stage 'passage')
  {
    id: 'dialogue:ch5s-wren-passage', name: 'Wren: Passage to the isles',
    entries: [{ when: f('act2.ship_passage'), node: 'sailing' }, { node: 'start' }],
    nodes: {
      start: { speaker: 'narrator', text: 'The Salt Exchange is quieter than it was. Half the price-chalk has been wiped from the walls, and most of what is left is for ships. Wren Tallow is at her high desk, writing in four ledgers now instead of three.', next: 'hello' },
      hello: { speaker: 'npc:wren-tallow', mood: 'happy', text: 'And here is the gloved hand again, with Solenne snow still on its boots. Let me guess. You want to go to Gull Rock, and you want to go before the Admiral’s gavel comes down.', next: 'price' },
      price: {
        speaker: 'npc:wren-tallow',
        text: 'Every hull in Brackhaven is spoken for. The Hierophancy’s factor bought three, the Creed stole one, and the Qasiri came in their own, which I call very rude. I have one ship left. The price is not coin.',
        choices: [
          { text: '[Wren’s card] “You said a candle would come one day. Light it.”', to: 'whole', when: is('act1.wren_favour', 'whole'), effects: [set('act2.ship_passage'), set('npc.wren-tallow.favour_called')] },
          { text: '[Wren’s card] “Half a favour. You said you’d ask for something small.”', to: 'half', when: is('act1.wren_favour', 'half'), effects: [set('act2.ship_passage'), set('npc.wren-tallow.favour_called')] },
          { text: '[Salt League] “I’ve done the League some good this winter. Ask your captains.”', to: 'league', when: { rep: 'faction:salt-league', min: 25 }, lockedLabel: '[Salt League: Friendly]', effects: [set('act2.ship_passage')] },
          { text: '“Whoever wins that auction carries a piece of the world’s heart through a sea full of knives. Better it goes with someone who can feel it.”', to: 'persuaded', tag: 'persuade', once: true, check: { stat: 'will', dc: 15, failTo: 'unmoved' } },
          { text: '[Shade] “I could always stow away.”', to: 'stow', when: { classIs: 'class:shade' }, tag: 'class', once: true },
          { text: '“Then name a new price.”', to: 'debt' },
          { text: '“Not yet.”', to: 'later', tag: 'leave' },
        ],
      },
      whole: { speaker: 'narrator', text: 'Wren opens a drawer and takes out a tallow candle stamped with a wren. She lights it from her desk-lamp and sets it between you, and for once she is not smiling.', next: 'whole2' },
      whole2: {
        speaker: 'npc:wren-tallow',
        text: 'Here is my favour, then, and it is a whole one. Carry my card to Gull Rock and put it in the Admiral’s hand when the bidding starts. It says that Wren Tallow stands surety for you, for any sum you care to name. Marisol will hate it. Marisol hates owing me nearly as much as she hates the Hierophant.',
        choices: [
          { text: '“Why would you do that?”', to: 'why' },
          { text: '“Done.”', to: 'ship' },
        ],
      },
      why: { speaker: 'npc:wren-tallow', text: 'Because if Solenne buys that star, the League will be paying tithe to the Wick by midsummer. And because you are going to win, and I like to have backed the winner. It is a weakness. I have very few.', next: 'ship' },
      half: { speaker: 'npc:wren-tallow', mood: 'happy', text: '(She lights a stub of candle stamped with half a wren. It gutters at once.) Something small, as promised. When you reach Gull Rock, tell the Admiral that Wren Tallow says her new figurehead looks like a drowned goat. Then duck.', next: 'ship' },
      league: { speaker: 'npc:wren-tallow', text: 'So I hear. Three captains have told me you are a disgrace to honest smugglers, which from them is a love-letter. The League looks after its own, and you, it seems, are now its own. Try not to make a habit of it.', next: 'ship' },
      persuaded: {
        speaker: 'npc:wren-tallow', effects: [set('act2.ship_passage')],
        text: '(She looks at your gloved hand for a long moment, and puts down her pen.) …Yes. I have been trying not to think about that. Very well. Not as a favour. As an investment. If you drown, I shall be terribly put out.',
        next: 'ship',
      },
      unmoved: { speaker: 'npc:wren-tallow', text: 'Beautifully said. I have heard it said beautifully four times this week, once by a nun with a knife. Try again with something I can write in a ledger.', next: 'price' },
      stow: { speaker: 'npc:wren-tallow', mood: 'happy', text: 'You could. And the Gannet’s captain hangs stowaways from the yard by their gloves. Shall we keep this respectable?', next: 'price' },
      debt: {
        speaker: 'npc:wren-tallow',
        text: 'A new price. Since you have nothing I want today, I shall take something I may want tomorrow. You will owe me a whole favour, at interest, and interest at the Salt Exchange is compounded by the tide. Yes?',
        choices: [
          { text: '“Yes.”', to: 'debt-yes', effects: [set('act2.ship_passage'), set('act2.wren_debt')] },
          { text: '“No.”', to: 'price' },
        ],
      },
      'debt-yes': { speaker: 'npc:wren-tallow', mood: 'happy', text: 'Lovely. You are the best sort of debtor: the sort with a short life expectancy and a long memory.', next: 'ship' },
      ship: { speaker: 'npc:wren-tallow', text: 'The Gannet, at the end of pier nine. Her master is Moll Fenner, who does not like passengers, priests or weather. Two days to Gull Rock if Calun is in a good mood. And don’t tell Moll what you carry in that glove.' },
      sailing: { speaker: 'npc:wren-tallow', text: 'Still here? The Gannet sails on the tide, with you or without you, and Moll Fenner prefers without.' },
      later: { speaker: 'npc:wren-tallow', text: 'The auction won’t wait, my dear. Neither will the Hierophancy’s factor.' },
    },
  },
  // ----- Kestrel: arrival
  {
    id: 'dialogue:ch5s-kestrel-welcome', name: 'Kestrel: Welcome to Gull Rock',
    entries: [{ when: f('npc.marisol-kestrel.met'), node: 'again' }, { node: 'start' }],
    nodes: {
      start: { speaker: 'narrator', text: 'Gull Rock Hall was a lighthouse once, before the League roofed it with the keels of captured Solenni warships. Inside it is loud with gulls, gamblers and every flag in the Saltreach. On a dais made from a ship’s stern, a woman with a grey braid and one gold tooth is eating an apple off the point of a boarding-knife.', next: 'kestrel' },
      kestrel: {
        speaker: 'npc:marisol-kestrel', effects: [set('npc.marisol-kestrel.met'), { unlockLore: 'lore:marisol-kestrel' }],
        text: 'Ah. The Ashmarked. They said you’d come; they always say that about the interesting ones, and they are usually wrong. Marisol Kestrel, Admiral of the Salt League, by the grace of nobody and a show of hands. Welcome to my auction.',
        choices: [
          { text: '“I’ve come for the Ember.”', to: 'come' },
          { text: '“Wren Tallow says your new figurehead looks like a drowned goat.”', to: 'goat', once: true, when: { all: [is('act1.wren_favour', 'half'), f('npc.wren-tallow.favour_called')] } },
          { text: '[Wren’s card] Hand her Wren Tallow’s card.', to: 'surety', once: true, when: is('act1.wren_favour', 'whole') },
          { text: '[Silver Tongue] “By the grace of nobody? I heard it was bribery.”', to: 'bribery', once: true, when: { dialogueTag: 'silver-tongue' }, tag: 'trait' },
          { text: '[Outlander] “Nobody elected me either. We should start a league.”', to: 'outlander', once: true, when: { dialogueTag: 'outlander' }, tag: 'trait' },
        ],
      },
      goat: { speaker: 'npc:marisol-kestrel', mood: 'angry', text: '(She stops chewing.) …She sent you to say that. Half a favour, I expect; she’d never waste a whole one on me. (She flicks the apple core at a gull.) Tell Wren the figurehead is a portrait of her mother.', next: 'come' },
      surety: { speaker: 'npc:marisol-kestrel', text: '(She reads it twice, then holds it to the lamp as if the ink might be lying.) Wren Tallow stands surety for you. For any sum. Seven drown me. She must like you very much, or hate me even more than usual. Both, I expect.', next: 'come' },
      bribery: { speaker: 'npc:marisol-kestrel', mood: 'happy', text: 'Bribery is a show of hands, sweetheart. You only have to count the hands that are holding something.', next: 'come' },
      outlander: { speaker: 'npc:marisol-kestrel', mood: 'happy', text: 'Ha! Careful. That is exactly how this one started, and look at the state of it.', next: 'come' },
      come: { speaker: 'npc:marisol-kestrel', text: 'Everyone has come for the Ember. Even the gulls. It sits in my vault under forty fathoms of rock and three of my nastiest people, and it hums. Did you know they hum? It kept me awake the first month. Now I can’t sleep without it.', next: 'rules' },
      rules: {
        speaker: 'npc:marisol-kestrel',
        text: 'The rules are simple, because the people who come to Gull Rock are not. The lot goes at sundown. Bid what you like: gold, ships, sins, favours; I take anything I can sell. And by salt-law of the League, any bid may be answered with steel against my champion, if you are tired of living.',
        choices: [
          { text: '“Who else is bidding?”', to: 'bidders', once: true },
          { text: '“And if someone simply steals it?”', to: 'steal', once: true },
          { text: '“Until sundown, then.”', to: 'go' },
        ],
      },
      bidders: { speaker: 'npc:marisol-kestrel', effects: [{ unlockLore: 'lore:salt-league' }], text: 'The Hierophancy has sent Benedetta Aurevine, who smiles like a cat in a dairy. The Ashen Creed has sent its Red Abbess in person, which is either very brave or very stupid, and Benedetta has noticed. The Qasiri have sent the Cindermother’s own son, who says nothing and hears everything. And there is a lady in grey at the back who drips on my floor. I didn’t invite her. Nobody did.', next: 'rules' },
      steal: { speaker: 'npc:marisol-kestrel', mood: 'happy', text: 'Then I’d be very impressed, and then I’d hang them, in that order. I was a thief before I was an admiral. That is what an admiral is.', next: 'rules' },
      go: { speaker: 'npc:marisol-kestrel', text: 'Go and meet my bidders. Make them nervous. Nervous people bid higher.' },
      again: { speaker: 'npc:marisol-kestrel', text: 'Still breathing? Good. Go and frighten my bidders. The lot goes at sundown.' },
    },
  },
  // ----- The bidders: Vesper Qadri
  {
    id: 'dialogue:ch5s-vesper-bid', name: 'Vesper: The Creed’s bid',
    entries: [
      { when: f('act2.vesper_left'), node: 'cold' },
      { when: following, node: 'beside' },
      { when: f('npc.vesper-qadri.met'), node: 'again' },
      { node: 'start' },
    ],
    nodes: {
      start: { speaker: 'narrator', text: 'In a corner of the hall, behind a sail nailed up for a curtain, a Qasiri woman in a burnt-red habit is reading a breviary. Her head is shaved, and ash-scars run in neat lines from her temples to her jaw. When she looks up, her eyes catch the lamplight like a cat’s, and keep it.', next: 'hello' },
      hello: {
        speaker: VESPER, effects: [set('npc.vesper-qadri.met'), { unlockLore: 'lore:vesper-qadri' }],
        text: 'You’re the one with the hand. Sit, if you like. Nobody else will; they think I set fire to chairs. I did, once. It was a very bad chair. (She closes the book on one finger.) Vesper Qadri. The Church calls me the Red Abbess. My mother called me Vesper, and hers is the only opinion I still pray about.',
        next: 'hub',
      },
      again: { speaker: VESPER, text: 'Back again? Sit. The chair is quite safe now.', next: 'hub' },
      beside: { speaker: VESPER, mood: 'happy', text: 'You want to know what the Creed is bidding? I’m standing next to you. Look at Benedetta’s face. That alone was worth the crossing.', next: 'hub' },
      cold: { speaker: VESPER, mood: 'angry', text: 'I’m bidding against you, if that is what you came to ask. You made your choice in Qadir. I am making mine here. Go away.' },
      hub: {
        speaker: VESPER, text: 'Ask, then. I’m hiding nothing tonight but my purse.',
        choices: [
          { text: '“What is the Ashen Creed bidding?”', to: 'bid' },
          { text: '“You were a nun.”', to: 'nun', once: true },
          { text: '[Oathbound] “I’m sworn to the Lantern. You broke the same vows.”', to: 'oath', once: true, when: { classIs: 'class:oathbound' }, tag: 'class' },
          { text: '[Arcanist] Light a spark on your fingertip, without a licence.', to: 'spark', once: true, when: { classIs: 'class:arcanist' }, tag: 'class' },
          { text: '[Devout] “You still read the breviary.”', to: 'devout', once: true, when: { dialogueTag: 'devout' }, tag: 'trait' },
          { text: '“Until sundown.”', to: 'bye', tag: 'leave' },
        ],
      },
      nun: { speaker: VESPER, text: 'Sister Vesper of the Lamp-house at Valcastre, eleven years. Foundlings go to the Church; it was that or the salt-pans. I loved it. I loved the Seven Lights more than I have loved anyone. (A pause.) Then the Wick burned a midwife in the square under my window, for healing a fever without a licence. She had healed mine, the winter before. I asked the Prior why. He said, “Fire left unattended.” So I left. I took the fire with me.', next: 'hub' },
      oath: { speaker: VESPER, text: 'The same vows. To serve the light and keep it. I am keeping them; it is the Church that broke them. (Her eyes flare gold, briefly.) You’ll hear the difference one day. I hope it costs you less than it cost me.', next: 'hub' },
      spark: { speaker: VESPER, mood: 'happy', effects: [{ loyalty: VESPER, delta: 5 }], text: '(She laughs, the first true laugh you have heard on Gull Rock, and lights her own fingertip to touch yours: two small flames, one gold and one red.) Unlicensed. Oh, I like you. Don’t let Benedetta see; she’ll want it in a jar.', next: 'hub' },
      devout: { speaker: VESPER, mood: 'sad', text: 'Every night. Old habits. (She smooths the page.) The Seven did nothing wrong. Their priests did. I don’t blame a lamp for the hand that holds it.', next: 'hub' },
      bid: {
        speaker: VESPER, effects: [{ unlockLore: 'lore:the-red-abbess' }],
        text: 'Everything we have, which is mostly stolen. Church plate from four chapels. A ship. Eleven unlicensed tomes the League would love to sell twice. And a promise: if the Creed wins, the Ember will never sit in a cathedral again. We would break it into a hundred coals and give one to every hedge-witch in the Haldmarch.',
        choices: [
          { text: '“Break an Ember? You don’t know what it would do.”', to: 'break', once: true },
          { text: '“Benedetta Aurevine is watching you.”', to: 'watch', once: true },
          { text: '“I see.”', to: 'hub' },
        ],
      },
      break: { speaker: VESPER, text: 'No. Neither does the Church, and it held one for twelve hundred years. (Softer.) I know it is a gamble. Everything that matters is. The Brand was a gamble too: one coal, one city, one old man deciding who gets to be warm.', next: 'hub' },
      watch: { speaker: VESPER, text: 'I know. She has watched me since the boat. If I win, she will try to take it off me on the stairs. If I lose, she will try to take me. (A smile, not a reassuring one.) The Wick have been trying to take me for nine years. I am still not very well trimmed.', next: 'heist' },
      heist: {
        speaker: VESPER, effects: [set('npc.vesper-qadri.heist_offer')],
        text: 'If it comes to the worst, and Kestrel sells it to Solenne, come and find me after dark. I can melt any lock in the Saltreach. I would rather it went to you than to Vellane. I think. Ask me again when I know you.',
        next: 'hub',
      },
      bye: { speaker: VESPER, text: 'Sundown, then. Ashvar keep your fire lit.' },
    },
  },
  // ----- The bidders: Benedetta Aurevine
  {
    id: 'dialogue:ch5s-benedetta-bid', name: 'Benedetta: The Hierophancy’s bid',
    entries: [
      { when: f('npc.benedetta-aurevine.met'), node: 'again' },
      { when: is('act2.church_stance', 'pledged'), node: 'p0' },
      { when: is('act2.church_stance', 'defiant'), node: 'd0' },
      { node: 'n0' },
    ],
    nodes: {
      p0: { speaker: 'narrator', text: BENE_INTRO, next: 'p1' },
      n0: { speaker: 'narrator', text: BENE_INTRO, next: 'n1' },
      d0: { speaker: 'narrator', text: BENE_INTRO, next: 'd1' },
      p1: { speaker: 'npc:benedetta-aurevine', mood: 'happy', effects: [set('npc.benedetta-aurevine.met')], text: 'Ashmarked. Or should I say, our friend? The Lord-Inquisitor writes that you have pledged yourself to the Lantern. He writes it with such warmth. One forgets he can. Benedetta Aurevine, factor to the Hierophancy. Do sit.', next: 'hub' },
      n1: { speaker: 'npc:benedetta-aurevine', effects: [set('npc.benedetta-aurevine.met')], text: 'Ashmarked. You declined the Lord-Inquisitor so politely that he has not stopped talking about it. Very few people decline Castor at all, and fewer politely. Benedetta Aurevine, factor to the Hierophancy. Do sit.', next: 'hub' },
      d1: { speaker: 'npc:benedetta-aurevine', effects: [set('npc.benedetta-aurevine.met')], text: 'Ashmarked. You told the Lord-Inquisitor to his face that he might whistle for your Embers. He has not whistled since. Benedetta Aurevine, factor to the Hierophancy. I find I rather admire you, which is inconvenient, as I have orders to have you watched.', next: 'hub' },
      again: { speaker: 'npc:benedetta-aurevine', text: 'Back again? I knew you would be. People always come back to the table with the cloth on it.', next: 'hub' },
      hub: {
        speaker: 'npc:benedetta-aurevine', text: 'Ask what you like. I shall answer what I like. That is diplomacy.',
        choices: [
          { text: '“What is Solenne bidding?”', to: 'bid' },
          { text: '“Why does Vellane want it so badly?”', to: 'vellane', once: true },
          { text: '“What do you want with the Red Abbess?”', to: 'abbess', once: true },
          { text: '“I am pledged. Will the Church stand behind my bid?”', to: 'purse', once: true, when: is('act2.church_stance', 'pledged') },
          { text: '[Oathbound] “I serve the same Lantern you do.”', to: 'oathbound', once: true, when: { classIs: 'class:oathbound' }, tag: 'class' },
          { text: '[Devout] “Is it not a sin, to buy a piece of the Brand?”', to: 'devout', once: true, when: { dialogueTag: 'devout' }, tag: 'trait' },
          { text: '“Good evening.”', to: 'bye', tag: 'leave' },
        ],
      },
      bid: { speaker: 'npc:benedetta-aurevine', effects: [{ unlockLore: 'lore:the-hierophancy' }], text: 'Forty thousand crowns in Solenni gold, which the League will pretend to despise and then count twice. Absolution for every soul in the League for every crime done at sea, and a few not yet done. And the Lantern’s blessing on the Admiral’s fleet, which in a winter like this one is not nothing.', next: 'hub' },
      vellane: { speaker: 'npc:benedetta-aurevine', text: 'Because the Brand was the Church’s proof that the light belongs to it, and the Brand is a husk. Every Ember we hold puts a sentence of that proof back together. Castor is not a greedy man. He is a frightened one, in the way only very clever men are frightened: precisely.', next: 'hub' },
      abbess: {
        speaker: 'npc:benedetta-aurevine', effects: [set('npc.benedetta-aurevine.offer_made')],
        text: 'Vesper Qadri has burned four chapels and a Wick-house, and taught three hundred people to light fires the Church did not light for them. She is the most wanted woman in the Empire, and she has sailed into a hall full of my soldiers to bid on a lamp. (She sets down her glass.) I will be frank, because it is late. The Lord-Inquisitor would accept an Ember, or the Abbess. He did not say both. If someone were to put her in my hands tomorrow, before the gavel, I should be so grateful that my whole purse would stand behind that someone’s bid.',
        choices: [
          { text: '“You want me to sell her.”', to: 'sell' },
          { text: '“Never.”', to: 'never' },
          { text: '“I’ll think on it.”', to: 'hub' },
        ],
      },
      sell: { speaker: 'npc:benedetta-aurevine', text: 'I want you to deliver a heretic to lawful justice, and to be rewarded for it. “Sell” is such a Salt League word.', next: 'hub' },
      never: { speaker: 'npc:benedetta-aurevine', text: 'Of course not. And yet you asked me what I wanted. I always answer that question honestly; it saves so much time.', next: 'hub' },
      purse: { speaker: 'npc:benedetta-aurevine', text: 'The Lord-Inquisitor foresaw you. He writes that an Ember travels more safely in a pledged pocket than in mine; pockets are harder to rob than ships. Bid in the Church’s name, if it comes to it, and the gold is yours to spend. It will come back to Solenne in the end. Everything does.', next: 'hub' },
      oathbound: { speaker: 'npc:benedetta-aurevine', text: 'Then you know what obedience costs, and what it buys. I have never been brave. I have been useful. In Solenne that lasts longer.', next: 'hub' },
      devout: { speaker: 'npc:benedetta-aurevine', text: 'It would be a greater sin to let heretics buy it. Which sin is the greater is a question for the Hierophant. I am only a factor; I deal in lesser evils, by the crate.', next: 'hub' },
      bye: { speaker: 'npc:benedetta-aurevine', text: 'Good evening. Do try the wine. It is the only thing on this rock that was not stolen.' },
    },
  },
  // ----- The bidders: Samir ibn Ruqaya
  {
    id: 'dialogue:ch5s-samir-bid', name: 'Samir: The caravans’ bid',
    entries: [{ when: f('npc.samir-ibn-ruqaya.met'), node: 'again' }, { node: 'start' }],
    nodes: {
      start: { speaker: 'narrator', text: 'The Qasiri envoy sits cross-legged on a rug spread over the wet flagstones, as though the hall were a tent. He is young, in layered sand-coloured robes, with glass beads in his beard and a curved nar-sabre across his knees. Before him on a copper plate are bread, a little dish of salt, and nothing else.', next: 'hello' },
      hello: {
        speaker: 'npc:samir-ibn-ruqaya', effects: [set('npc.samir-ibn-ruqaya.met'), { unlockLore: 'lore:qasiri-caravans' }],
        text: 'Peace on your road, Mark-bearer. I am Samir, son of Ruqaya. My mother saw you in the smoke three nights ago. She said you would come to my rug and not know whether to sit. (He opens a hand towards it.) Sit, or stand. The salt will wait either way.',
        choices: [
          { text: '[Sit, and wait to be offered the salt]', to: 'sit' },
          { text: '[Outlander] Sit, touch your heart, and wait to be offered the salt.', to: 'knows', when: { dialogueTag: 'outlander' }, tag: 'trait', effects: [{ reputation: 'faction:qasiri', delta: 5 }] },
          { text: 'Reach for a pinch of the salt.', to: 'grab' },
          { text: '“I’ll stand.”', to: 'stand' },
        ],
      },
      knows: { speaker: 'npc:samir-ibn-ruqaya', mood: 'happy', text: '(His eyebrows lift.) You know the way of it. Someone taught you well, or you have eaten at a Qasiri fire before and lived to remember it.', next: 'sit' },
      grab: { speaker: 'npc:samir-ibn-ruqaya', text: '(His hand closes gently over yours before you reach the dish.) No. Forgive me. Salt is given, never taken. A man who takes salt has taken nothing but salt. Sit, if you will, and I will give it.', next: 'sit' },
      stand: { speaker: 'npc:samir-ibn-ruqaya', text: 'As you like. Then we will speak as strangers do: carefully.', next: 'hub' },
      sit: {
        speaker: 'npc:samir-ibn-ruqaya',
        text: '(He tears the bread, salts it, and offers it on his open palm.) Eat, then. Salt shared is a vow. While it is in you, my tent is your tent and my blade is not for your throat, and you will do my people no harm. It is not a small thing among us. I ask you not to make it small.',
        choices: [
          { text: '[Eat]', to: 'eaten', effects: [set('npc.samir-ibn-ruqaya.salt_shared'), { unlockLore: 'lore:qasiri-salt-law' }] },
          { text: '[Decline, courteously]', to: 'declined' },
        ],
      },
      eaten: { speaker: 'npc:samir-ibn-ruqaya', mood: 'happy', text: 'Good. Now we may speak honestly, because now I would be ashamed to lie to you.', next: 'hub' },
      declined: { speaker: 'npc:samir-ibn-ruqaya', text: 'Then we are strangers still, and that is no insult. A vow should not be swallowed by accident.', next: 'hub' },
      again: { speaker: 'npc:samir-ibn-ruqaya', text: 'Mark-bearer. Sit, if you like.', next: 'hub' },
      hub: {
        speaker: 'npc:samir-ibn-ruqaya', text: 'Ask what you wish.',
        choices: [
          { text: '[Sit, and accept his salt]', to: 'sit', when: { not: f('npc.samir-ibn-ruqaya.salt_shared') } },
          { text: '“What are the caravans bidding?”', to: 'bid' },
          { text: '“The Qasiri fear fire. Why bid on an Ember at all?”', to: 'afraid', once: true },
          { text: '“Will the caravans stand behind my bid?”', to: 'back', when: { not: f('act2.samir_promise') } },
          { text: '“Peace on your road.”', to: 'bye', tag: 'leave' },
        ],
      },
      bid: { speaker: 'npc:samir-ibn-ruqaya', text: 'Cinderglass, enough to glaze a cathedral. Two hundred camels, which the Admiral cannot use and knows it. And our word that the Ember will be buried in the deep sand where no king will ever find it. My mother does not want the Ember. She wants nobody to have it.', next: 'hub' },
      afraid: { speaker: 'npc:samir-ibn-ruqaya', text: 'Yes. We are the only people in Morvane with the right to be afraid. Our grandmothers’ grandmothers watched the sky burn for a year. Every child of the caravans learns the last king of Qadir’s name before their own, so that they will never give it to a son. (A slight smile.) Ozrah. You see? Even saying it, I taste ash.', next: 'hub' },
      back: { speaker: 'npc:samir-ibn-ruqaya', text: 'Perhaps. Our camels will not win this; the Church’s gold will. But if our bid stood behind yours… My mother would ask a price.', next: 'price' },
      price: {
        speaker: 'npc:samir-ibn-ruqaya',
        text: 'Another Ember fell into Qadir, into the glass city where the last king sits. My mother has seen you go there. Promise me that when you take that Ember, no one will use it as the Ashen Kings used the leys: not the Church, not the Creed, not you. Keep it safe. Swear it on salt, and the caravans bid with you tomorrow.',
        choices: [
          { text: '“I swear it.”', to: 'sworn', when: f('npc.samir-ibn-ruqaya.salt_shared'), effects: [set('act2.samir_promise'), { reputation: 'faction:qasiri', delta: 5 }] },
          { text: '“I swear it.” (You have not shared his salt.)', to: 'unsalted', when: { not: f('npc.samir-ibn-ruqaya.salt_shared') } },
          { text: '“I can’t promise that.”', to: 'nopromise' },
        ],
      },
      unsalted: {
        speaker: 'npc:samir-ibn-ruqaya', text: 'Then it is only words, and words are wind in the Sunscar. Eat with me first. Then swear, and then I will believe you.',
        choices: [
          { text: '[Eat his salt, then swear]', to: 'sworn', effects: [set('npc.samir-ibn-ruqaya.salt_shared'), set('act2.samir_promise'), { reputation: 'faction:qasiri', delta: 5 }, { unlockLore: 'lore:qasiri-salt-law' }] },
          { text: '“Not yet.”', to: 'hub' },
        ],
      },
      sworn: { speaker: 'npc:samir-ibn-ruqaya', text: '(He presses his palm to his own heart, then to yours.) Then it is done, and it is heavy, and I am glad. Tomorrow, when the Admiral asks, I will say the caravans bid with you. Do not forget, Mark-bearer. Salt does not forget.', next: 'hub' },
      nopromise: { speaker: 'npc:samir-ibn-ruqaya', text: 'An honest answer. My mother says honest answers are rarer than water. Still, I cannot buy you an Ember with one.', next: 'hub' },
      bye: { speaker: 'npc:samir-ibn-ruqaya', text: 'And on yours.' },
    },
  },
  // ----- The auction (Kestrel presiding)
  {
    id: 'dialogue:ch5-auction', name: 'The Ember Auction',
    entries: [
      { when: f('act2.auction_outcome'), node: 'done' },
      { when: at('auction'), node: 'dusk' },
      { node: 'wait' },
    ],
    nodes: {
      wait: { speaker: 'npc:marisol-kestrel', text: 'Sundown, sweetheart. Go and frighten my bidders first.' },
      done: { speaker: 'npc:marisol-kestrel', text: 'The pin is down, and it came down hard, and it is staying down. Go and do whatever it is you are going to do.' },
      dusk: { speaker: 'narrator', text: 'At sundown they light the great lamp of Gull Rock for the first time in forty years, and the whole hall turns gold. The Ember sits in an iron cage on the stern-dais, humming: a low warm note you feel in your teeth and in the scar on your hand. Kestrel bangs a belaying pin on the rail.', next: 'open' },
      open: { speaker: 'npc:marisol-kestrel', text: 'Lords, ladies, heretics, priests, and whatever that is dripping at the back. One star, fished out of the Saltreach in a net of wet chain, warranted genuine by the three of my crew who are still coughing. Bidding opens now. Don’t be shy. Shyness is very expensive on Gull Rock.', next: 'bids' },
      bids: { speaker: 'narrator', text: 'Benedetta Aurevine bids forty thousand crowns and the Lantern’s absolution without rising from her chair. Samir ibn Ruqaya bids cinderglass and camels; the hall laughs, and he does not. Vesper Qadri stands on a bench and bids Church plate from four chapels, and the Wick soldiers put their hands to their swords. The woman in grey at the back bids nothing. She only watches you, and the water runs from her hem.', next: 'turn' },
      turn: {
        speaker: 'npc:marisol-kestrel',
        text: 'Forty thousand and the soul of every sailor in my fleet, from Solenne. Generous; most of their souls aren’t worth a herring. Going once. (She looks straight at you.) Well, Ashmarked? You didn’t come all this way to watch.',
        choices: [
          { text: '[Wren’s card] “Wren Tallow stands surety for my bid. Take Solenne’s figure and double it.”', to: 'surety', when: is('act1.wren_favour', 'whole'), effects: [outcome('bid'), { reputation: 'faction:salt-league', delta: 10 }] },
          { text: '[Samir’s vow] “The caravans bid with me.”', to: 'caravans', when: f('act2.samir_promise'), effects: [outcome('bid'), { reputation: 'faction:qasiri', delta: 10 }] },
          { text: '[Pledged] “I bid in the name of the Hierophancy.”', to: 'church', when: is('act2.church_stance', 'pledged'), effects: [outcome('bid'), set('act2.tide_church_bought'), { reputation: 'faction:lanternate', delta: 10 }] },
          { text: '[Silver Tongue] “Going once? You haven’t heard my offer, Admiral, and you’re already in love with it.”', to: 'tongue', once: true, when: { dialogueTag: 'silver-tongue' }, tag: 'trait' },
          {
            text: 'Cross the hall to Benedetta’s table, and tell her where the Red Abbess keeps her knife.', to: 'betray', tag: 'deceive',
            when: { not: f('act2.vesper_betrayed') },
            effects: [
              outcome('betrayal'), set('act2.vesper_betrayed'), { companion: VESPER, following: false },
              { reputation: 'faction:lanternate', delta: 15 }, { reputation: 'faction:ashen-creed', delta: -40 },
            ],
          },
          { text: '“Salt-law. I answer the bid with steel. Bring out your champion.”', to: 'duel', tag: 'aggressive', effects: [outcome('duel')] },
          { text: '[Shade] Let the pin fall. Locks are cheaper than bids.', to: 'heist', when: { classIs: 'class:shade' }, tag: 'class', effects: [outcome('heist')] },
          { text: 'Say nothing. Let it go to Solenne, and visit the vault tonight.', to: 'heist', effects: [outcome('heist')] },
        ],
      },
      tongue: { speaker: 'npc:marisol-kestrel', mood: 'happy', text: 'Ha! I am, a little. Go on, then. Make it worth the wait.', next: 'turn' },
      surety: { speaker: 'narrator', text: 'You hold up Wren Tallow’s card with its tallow wren. The hall goes very quiet. Somewhere a gambler whistles.', next: 'surety2' },
      surety2: { speaker: 'npc:marisol-kestrel', text: 'Wren’s wren. A whole one. (She shuts her eyes, like a woman handed poison she has promised to drink.) So the League’s own factor bids against the League’s own Admiral. Delightful. Sold, to the Ashmarked, for a sum I shall be arguing with Wren about until one of us is dead.', next: 'sold' },
      caravans: { speaker: 'narrator', text: 'Samir rises from his rug, crosses the hall, and stands at your shoulder without a word. He lays his palm on his heart. Every Qasiri in the hall does the same.', next: 'caravans2' },
      caravans2: { speaker: 'npc:marisol-kestrel', text: 'The caravans bid with the Ashmarked. (She whistles.) Cinderglass, camels, and the Cindermother’s goodwill, which in the Sunscar is worth more than Solenne. And a Qasiri vow, which I have never once seen broken. Sold.', next: 'sold' },
      church: { speaker: 'narrator', text: 'Across the hall Benedetta Aurevine inclines her head to you, a precise half-inch, and lifts two fingers. Her purse-bearer comes and stands behind you.', next: 'church2' },
      church2: { speaker: 'npc:marisol-kestrel', text: 'Solenne bids against Solenne? No, I see. Solenne bids through a borrowed hand. Clever, Benedetta. I hope your Lord-Inquisitor knows how far that hand can be trusted. (The pin comes down.) Sold, to the Lantern’s new friend.', next: 'sold' },
      betray: { speaker: 'narrator', text: 'You cross the hall to the white-clothed table and say a few words to Benedetta Aurevine. She listens without looking at you. Then she lifts one finger, and the two Wick soldiers behind her go to the bench where Vesper Qadri is standing.', next: 'betray2' },
      betray2: { speaker: VESPER, mood: 'sad', text: '(She does not run. She looks past the soldiers, straight at you, and her eyes go from gold to red to something much quieter.) Oh. Oh, I see. I did ask you to wait until you knew me. I suppose you did.', next: 'betray3' },
      betray3: { speaker: 'narrator', text: 'Fire runs up her arms. A soldier screams; then a Wick-chain closes round her wrists and the fire goes out like a pinched wick. They take her down the stairs to the boats. She does not look back.', next: 'betray4' },
      betray4: { speaker: 'npc:benedetta-aurevine', mood: 'happy', text: 'Thank you. That was very tidy. The Lord-Inquisitor will hear your name spoken kindly. (She raises her glass to the dais.) Admiral: my purse stands behind the Ashmarked. Forty thousand crowns, and one.', next: 'betray5' },
      betray5: { speaker: 'npc:marisol-kestrel', text: '…Sold. To the Ashmarked, with the Church’s money and the Abbess’s blood on it. (She does not bring the pin down very hard.) I’ve sold worse things. Not many.', next: 'sold' },
      duel: { speaker: 'npc:marisol-kestrel', mood: 'happy', text: 'Salt-law! Oh, I was hoping someone would. It has been years. (She stands and bellows down the hall.) Hask! Put down the herring. Someone wants to die.', next: 'duel2' },
      duel2: { speaker: 'narrator', text: 'A man the size of a mainmast rises from a bench by the fire, cracks his neck, and picks up a boarding-axe. The crowd begins, very cheerfully, to clear the floor and lay bets.', next: 'duel3' },
      duel3: { speaker: 'npc:marisol-kestrel', text: 'Beat my champion on the rocks below the hall, and the star is yours at Solenne’s price, which his purse will pay, since he won’t be needing it. Lose, and I sell your corpse to the lady in grey. She looks interested.' },
      heist: { speaker: 'narrator', text: 'You say nothing. Kestrel looks at you a moment longer, as if she knows exactly what kind of silence that is. Across the hall, Vesper Qadri very slightly raises one eyebrow.', next: 'heist2' },
      heist2: { speaker: 'npc:marisol-kestrel', text: 'Nothing? Pity. Going twice. Gone, to Solenne, for forty thousand crowns and assorted souls. Lady Benedetta, you may take delivery at dawn. Tonight it sleeps in my vault under three of my nastiest people, and I sleep on top of them.', next: 'heist3' },
      heist3: { speaker: 'narrator', text: 'Benedetta raises her glass. Vesper sits down very slowly. The lamp of Gull Rock burns gold, and deep in the rock beneath it the Ember hums. Dawn is a long way off.' },
      sold: { speaker: 'narrator', text: 'The Ember is yours. Kestrel tosses you an iron key as long as your hand, on a loop of tarred cord, still warm from her pocket. “The vault’s below the hall. Collect your property before somebody else does. And Ashmarked? Congratulations. Everyone in this room now wants to kill you.”' },
    },
  },
  // ----- The auction vault (heist, and every route’s Ember moment)
  {
    id: 'dialogue:obj-auction-vault-lock', name: 'Object: The auction vault',
    entries: [
      { when: f('act2.ember_tide_claimed'), node: 'empty' },
      { when: at('heist'), node: 'door' },
      { when: { all: [at('ember'), f('act2.tide_vault_open')] }, node: 'ajar' },
      { when: at('ember'), node: 'key' },
      { node: 'shut' },
    ],
    nodes: {
      shut: { speaker: 'narrator', text: 'An iron door set into the living rock below Gull Rock Hall, studded with old ship’s bolts. Behind it something hums, low and warm. Three of Kestrel’s people are playing dice in front of it, and they all stop to look at you.' },
      empty: { speaker: 'narrator', text: 'The vault stands open and empty. The dice-players have gone. Without the hum, the rock is very quiet.' },
      door: {
        speaker: 'narrator', text: 'The vault door is Orrun iron, set into the rock below the hall. Behind it the Ember hums. In front of it three of Kestrel’s people are playing dice by a lantern, and they are wide awake.',
        choices: [
          { text: '[Night] Wait for the dice to stop and the lantern to gutter.', to: 'night', when: { hour: [21, 5] } },
          { text: 'Too many eyes by daylight. Come back after dark.', to: null, when: { not: { hour: [21, 5] } }, tag: 'leave' },
          { text: 'Leave.', to: null, when: { hour: [21, 5] }, tag: 'leave' },
        ],
      },
      night: {
        speaker: 'narrator', text: 'Past midnight the dice stop, and the guards sleep sitting up, the way sailors do. The lantern burns down to a blue bead. The lock is a fist of iron with three wards, very old and very good.',
        choices: [
          { text: '[Shade] Three wards, three picks. The Quiet Hand taught you on worse locks than this.', to: 'open', when: { classIs: 'class:shade' }, tag: 'class' },
          { text: '[Vesper] Whistle once, softly, as the Red Abbess told you.', to: 'vesper', when: { all: [f('npc.vesper-qadri.heist_offer'), { not: f('act2.vesper_left') }] } },
          { text: 'Work the wards by feel.', to: 'open', check: { stat: 'finesse', dc: 20, failTo: 'caught' } },
          { text: 'Lever it open with the guards’ own lantern-hook.', to: 'caught', tag: 'aggressive' },
          { text: 'Come back another night.', to: null, tag: 'leave' },
        ],
      },
      open: {
        speaker: 'narrator',
        effects: [set('act2.tide_vault_open'), { reputation: 'faction:salt-league', delta: -10 }, { reputation: 'faction:lanternate', delta: -10 }],
        text: 'The last ward gives with a sound like a knuckle cracking. None of the guards wakes. The door swings inward on hinges someone has, very kindly, greased.',
        next: 'inside',
      },
      vesper: {
        speaker: 'narrator',
        effects: [set('act2.tide_vault_open'), set('npc.vesper-qadri.heist_helped'), { loyalty: VESPER, delta: 10 }, { reputation: 'faction:salt-league', delta: -10 }, { reputation: 'faction:lanternate', delta: -10 }],
        text: 'A shadow comes down the stair. Vesper Qadri lays one bare palm on the lock, and the iron goes red, then white, then soft as candle-wax. The guards do not stir; she is humming them a cradle-hymn from the Lamp-house under her breath.',
        next: 'vesper2',
      },
      vesper2: { speaker: VESPER, mood: 'happy', text: 'There. I said any lock in the Saltreach. Go on. It is your hand it wants, not mine.', next: 'inside' },
      inside: { speaker: 'narrator', text: 'The vault is a sea-cave with an iron floor. In the middle, in a cage of wet chain, the Ember of the Tide burns blue-green and gold, like the sun seen from under water. Brine runs off it and hisses into steam. Your hand is already reaching for it.', next: 'claim' },
      ajar: { speaker: 'narrator', text: 'The vault door stands as you left it. The guards are still asleep. Inside, in its cage of wet chain, the Ember of the Tide burns blue-green and gold, like the sun seen from under water.', next: 'claim' },
      key: { speaker: 'narrator', text: 'Kestrel walks you down herself, a lantern in one hand and half a pear in the other. The dice-players stand aside. She turns the long key with both hands, and the door swings in on a sea-cave with an iron floor. In a cage of wet chain the Ember of the Tide burns blue-green and gold, like the sun seen from under water.', next: 'key2' },
      key2: { speaker: 'npc:marisol-kestrel', text: 'Go on, then. I’ve had it a year, and it never once looked at me like that.', next: 'claim' },
      caught: { speaker: 'narrator', effects: [outcome('duel')], text: 'The ward slips. Something inside the lock goes clank, very loudly, and a bell you had not seen rings over the door. The guards are on their feet with knives out before it stops.', next: 'caught2' },
      caught2: { speaker: 'npc:marisol-kestrel', mood: 'angry', text: 'In my vault. In my own vault, on the night of my own auction. (She comes down the stair in a nightshirt and sea-boots, with a cutlass.) Salt-law says I hang you. But I am in a generous mood, and Hask hasn’t had a fight in months. Beat my champion on the rocks, and I shall call it a bid. Lose, and I shall call it a hanging.' },
      claim: {
        speaker: 'narrator', effects: TIDE_CLAIM,
        text: 'You close your hand round it. Cold first, colder than the sea; then the warmth comes up your arm like a tide over hot sand. The Ember sinks into the Ashmark and is gone, and for a moment you hear the whole Saltreach at once: every keel, every gull, every drowned bell on the sea-floor. Under it all, very far down, something is listening back.',
        next: 'after',
      },
      after: {
        speaker: 'narrator', text: 'The Ashmark burns steady now, with more colours in it than you can name. At the back of your mind a woman with wet hair turns her head, as if she had heard her name spoken in another room.',
        choices: [
          { text: '[Vesper] Someone is waiting at the top of the stair.', to: 'stair', when: { all: [f('npc.vesper-qadri.met'), { not: f('act2.vesper_betrayed') }, { not: f('act2.vesper_joined') }, { not: f('act2.vesper_left') }] } },
          { text: 'Leave the vault.', to: null },
        ],
      },
      stair: { speaker: 'narrator', text: 'Vesper Qadri is sitting on the top step with her breviary shut on her knee. She has the look of someone who has rehearsed a speech and forgotten all of it. (Speak with her.)' },
    },
  },
  // ----- Kestrel: after the duel
  {
    id: 'dialogue:ch5s-kestrel-concede', name: 'Kestrel: Salt-law',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: 'narrator', text: 'Hask goes down on the wet rocks like a felled mast, and stays down, and after a moment begins to laugh. On the cliff above the crowd roars, and money changes hands in every direction.', next: 'kestrel' },
      kestrel: {
        speaker: 'npc:marisol-kestrel', mood: 'happy', effects: [{ reputation: 'faction:salt-league', delta: 5 }],
        text: 'Well! Nobody has put Hask on the rocks since the War of the Two Lanterns, and he started that one. (She tosses you a long iron key.) Salt-law is salt-law. The star is yours at Solenne’s price, and Benedetta may sue me. Go down to the vault before I change my mind. I shan’t, but it is fun to say.',
        choices: [
          { text: '“Is Hask all right?”', to: 'hask' },
          { text: '“Thank you, Admiral.”', to: null },
        ],
      },
      hask: { speaker: 'npc:marisol-kestrel', text: 'Hask? He’ll be insufferable for a month. He likes losing to good people. It is winning against bad ones he finds tiring.' },
    },
  },
  // ----- Kestrel: general
  {
    id: 'dialogue:ch5s-kestrel-general', name: 'Kestrel: General',
    entries: [
      { when: { all: [f('act2.ember_tide_claimed'), is('act2.auction_outcome', 'heist')] }, node: 'robbed' },
      { when: f('act2.ember_tide_claimed'), node: 'after' },
      { when: at('duel'), node: 'duel' },
      { when: at('ember'), node: 'vault' },
      { node: 'idle' },
    ],
    nodes: {
      idle: { speaker: 'npc:marisol-kestrel', text: 'Busy, sweetheart. Gulls to feed, bidders to fleece.' },
      duel: { speaker: 'npc:marisol-kestrel', mood: 'happy', text: 'Hask is waiting on the rocks below the hall. He’s brought his axe and a herring. Don’t keep him; the herring won’t last.' },
      vault: { speaker: 'npc:marisol-kestrel', text: 'The vault is below the hall. Your property is in it. I’d hurry; property on Gull Rock has a way of changing hands.' },
      robbed: { speaker: 'npc:marisol-kestrel', mood: 'angry', text: 'You robbed me. In my own vault, on the night of my own auction. (A long pause.) Benedetta is still screaming. Best night I’ve had in a year. Get off my rock before I remember I’m angry.' },
      after: {
        speaker: 'npc:marisol-kestrel', text: 'There goes my star, walking about in somebody else’s hand. I shall miss the hum.',
        choices: [
          { text: '“What will you do with the money?”', to: 'money', once: true },
          { text: '“Fair winds, Admiral.”', to: null, tag: 'leave' },
        ],
      },
      money: { speaker: 'npc:marisol-kestrel', text: 'Buy ships. Hire captains. Wait for spring. If spring doesn’t come, buy bigger ships and sail somewhere it has. I was a pirate before I was an admiral. Pirates are optimists; we have to be.' },
    },
  },
  // ----- Benedetta: general
  {
    id: 'dialogue:ch5s-benedetta-general', name: 'Benedetta: General',
    entries: [
      { when: f('act2.vesper_betrayed'), node: 'betrayed' },
      { when: { all: [f('act2.ember_tide_claimed'), is('act2.auction_outcome', 'heist')] }, node: 'robbed' },
      { when: f('act2.tide_church_bought'), node: 'church' },
      { node: 'idle' },
    ],
    nodes: {
      idle: { speaker: 'npc:benedetta-aurevine', text: 'Ashmarked. Do sit. Or don’t; I know how busy you are.' },
      betrayed: { speaker: 'npc:benedetta-aurevine', text: 'The Abbess sailed for Valcastre in chains. She sang the whole way, I am told: the old Lamp-house hymns, the high part. The soldiers did not like it. (She turns her glass by the stem.) Nor, to be candid, did I.' },
      robbed: { speaker: 'npc:benedetta-aurevine', mood: 'angry', text: 'Somebody walked into the Admiral’s vault last night and walked out with the Church’s purchase. I shan’t ask who. I shall simply write to the Lord-Inquisitor and describe them to him. In detail.' },
      church: { speaker: 'npc:benedetta-aurevine', text: 'You carry the Church’s purchase in your hand now. The Lord-Inquisitor will ask after it. Do make sure he likes the answer.' },
    },
  },
];

export default dialogues;
