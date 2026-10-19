/** Camp banter, part 2 (scenes 9–16 of docs/lore/13-companions.md §3). Scene 13 (the Cinderhold hearth) needs no
 *  companion following; 10 and 14 need one; 15 and 16 play for whoever is following, through a round-the-fire hub
 *  whose choices only show the companions present. Owner: Claude 4. */
import type { DialogueChoice, DialogueDef, NarrativeCondition, NarrativeEffect, NpcId } from '@/core';

const MAREN = 'npc:maren-hollis' as const;
const ANSELM = 'npc:anselm-pryde' as const;
const HESTA = 'npc:hesta-corrow' as const;
const CADOC = 'npc:cadoc-ap-ynys' as const;
const GRIMMA = 'npc:grimma-ironsong' as const;
const SABLE = 'npc:sable' as const;
const VESPER = 'npc:vesper-qadri' as const;
const ALL = [MAREN, ANSELM, HESTA, CADOC, GRIMMA, SABLE, VESPER];

const f = (flag: string): NarrativeCondition => ({ flag });
const is = (flag: string, value: string): NarrativeCondition => ({ flag, op: '==', value });
const all = (...c: NarrativeCondition[]): NarrativeCondition => ({ all: c });
const any = (...c: NarrativeCondition[]): NarrativeCondition => ({ any: c });
const not = (c: NarrativeCondition): NarrativeCondition => ({ not: c });
const fol = (npc: NpcId): NarrativeCondition => f(`companion.${npc.slice(4)}.following`);
const love = (npc: NpcId, delta: number): NarrativeEffect => ({ loyalty: npc, delta });
const anyFollowing = any(...ALL.map(fol));

const tobinHome = any(is('prologue.tobin_fate', 'saved'), f('act1.tobin_saved'));
const sableSaved = is('companion.sable.fate', 'saved');
const verseSung = is('companion.cadoc-ap-ynys.verse', 'sung');
const betrayed = f('prologue.anselm_betrayed');

/** A hub choice that only shows when `when` passes, can be taken once, and goes to `to`. */
const visit = (text: string, to: string, when: NarrativeCondition): DialogueChoice => ({ text, to, when, once: true });

const dialogues: DialogueDef[] = [
  // ----- 9. Grimma and Anselm: oaths and vows
  {
    id: 'dialogue:banter-grimma-anselm-oaths', name: 'Banter: Grimma and Anselm (oaths and vows)',
    entries: [{ when: all(fol(GRIMMA), fol(ANSELM), f('act1.nails_exposed')), node: 'open' }],
    nodes: {
      open: { speaker: GRIMMA, next: 'a1', text: 'Priests take vows. How many have you broken, priest?' },
      a1: { speaker: ANSELM, next: 'a2', text: '(He counts on his fingers, quite seriously.) Poverty: kept, easily; the Church sees to that. Obedience: broken, I am afraid. I forged a Prior’s name. Chastity—' },
      a2: { speaker: GRIMMA, next: 'a3', text: 'Don’t need the whole ledger.' },
      a3: { speaker: ANSELM, next: 'g1', text: '—kept, thank you, though I was not much tempted. And faith. (He stops counting.) Faith I keep. Mostly. In the dark, where nobody can check.' },
      g1: {
        speaker: GRIMMA,
        text: 'Oath you keep in the dark is the only sort worth iron. Any fool keeps one in front of the clan. (She looks at you, then at him.) And the one who broke faith with you? That gets written down, where I come from.',
        choices: [
          { text: '“I gave him to the Wick, Grimma. I won’t do it again.”', to: 'sold', when: all(betrayed, f('npc.anselm-pryde.forgave')), effects: [love(ANSELM, 3), love(GRIMMA, 2)] },
          { text: '“I gave him to the Wick, Grimma. I won’t do it again.”', to: 'sold-not', when: all(betrayed, not(f('npc.anselm-pryde.forgave'))), effects: [love(ANSELM, 2), love(GRIMMA, 2)] },
          { text: '“Nobody’s broken faith with Anselm. Not on my watch.”', to: 'kept', when: not(betrayed), effects: [love(ANSELM, 2)] },
          { text: '(Let him answer.)', to: 'answer' },
        ],
      },
      sold: { speaker: ANSELM, next: 'g2', text: 'Forgiven. (He says it plainly, as he might say amen.) Whether I have forgiven myself for being glad it was me in the cell is a different ledger.' },
      'sold-not': { speaker: ANSELM, mood: 'sad', next: 'g2', text: 'Not forgiven. Not yet. (He says it gently, which is worse.) But witnessed, now, in front of an Orrun. I gather that counts for something.' },
      kept: { speaker: GRIMMA, next: 'g2', text: 'Hm. Said in front of a witness. That’s an oath now, human. I’ll be holding you to it.' },
      answer: { speaker: ANSELM, next: 'g2', text: 'Where I come from, we forgive. It is rather the point of us.' },
      g2: { speaker: GRIMMA, next: 'a4', text: 'Orrun don’t forgive. We write it down and wait.' },
      a4: { speaker: ANSELM, mood: 'happy', next: 'g3', text: 'That sounds exhausting.' },
      g3: { speaker: GRIMMA, mood: 'happy', text: 'It is. It’s why we live so long. Spite keeps. (She raps the iron rings in her beard.) Korr nagh, priest. Keep your dark oath. I’ll keep mine.' },
    },
  },

  // ----- 10. Maren alone: Tobin
  {
    id: 'dialogue:banter-maren-tobin', name: 'Banter: Maren (Tobin)',
    entries: [
      { when: all(fol(MAREN), f('act1.tobin_saved')), node: 'reeds' },
      { when: all(fol(MAREN), f('act1.tobin_lost')), node: 'lost' },
      { when: all(fol(MAREN), is('prologue.tobin_fate', 'saved'), f('act1.gate_passed')), node: 'home' },
      { when: all(fol(MAREN), is('prologue.tobin_fate', 'dead'), f('act1.gate_passed')), node: 'dead' },
    ],
    nodes: {
      // saved in the reeds (Act I)
      reeds: { speaker: MAREN, mood: 'happy', next: 'reeds2', text: 'He wrote to me. Tobin. Agna Fenn’s girl carried it down the causeway. Do you want to hear it? You’re going to hear it.' },
      reeds2: { speaker: MAREN, next: 'reeds3', text: '(She unfolds a scrap of bark-paper.) “Dear Maren. It is cold. The goat is well. I am well. I do not dream about the water. Only a little. The goat ate my other letter. Your brother, Tobin Hollis.”' },
      reeds3: {
        speaker: MAREN, mood: 'sad',
        text: '(She folds it very small and puts it inside her jerkin.) Three months ago he was standing up to his chest in black water singing to my mother’s ghost. And now he’s complaining about a goat. You did that.',
        choices: [
          { text: '“We did that. You held him while I burned it out.”', to: 'reeds-we', effects: [love(MAREN, 3)] },
          { text: '“Write back. Tell him the goat’s in charge now.”', to: 'reeds-goat', effects: [love(MAREN, 2)] },
        ],
      },
      'reeds-we': { speaker: MAREN, mood: 'sad', next: 'reeds-end', text: 'I held him. He was so cold. I kept thinking, if I let go he’ll go back under and I’ll never get him out again. (A breath.) I didn’t let go.' },
      'reeds-goat': { speaker: MAREN, mood: 'happy', next: 'reeds-end', text: 'The goat’s always been in charge. It’s the only one in the family with any sense.' },
      'reeds-end': { speaker: MAREN, text: 'Hearth and kin, {player.name}. I don’t say it lightly. You’re both, now.' },
      // lost to the water (Act I)
      lost: { speaker: 'narrator', next: 'lost2', text: 'Maren is cutting marks into the shafts of her arrows with the point of her knife. Not her hunter’s mark. Small, careful notches, one to a shaft, like a tally.' },
      lost2: { speaker: MAREN, mood: 'angry', next: 'lost3', text: 'One for every reed-priest. There was one at the reeds that night, did you see him? Thin. A voice like a bell under water. He was singing to Tobin, and Tobin was singing back. I’d know that voice anywhere.' },
      lost3: {
        speaker: MAREN, mood: 'angry',
        text: 'They took my mother in the mere and they took my brother in the reeds, and they sang while they did it. So I’m going to give them something to sing about.',
        choices: [
          { text: '“We’ll find him. The singer. I swear it.”', to: 'lost-swear', effects: [love(MAREN, 3)] },
          { text: '“Tobin wouldn’t want you to turn into this.”', to: 'lost-soft', effects: [love(MAREN, -2)] },
          { text: '(Sit down beside her and take a knife to the next shaft.)', to: 'lost-sit', effects: [love(MAREN, 4)] },
        ],
      },
      'lost-swear': { speaker: MAREN, next: 'lost-end', text: 'You swore to me once before. In Brindlecross. (She doesn’t look up.) Swear better this time.' },
      'lost-soft': { speaker: MAREN, mood: 'angry', next: 'lost-end', text: 'Tobin doesn’t want anything. Tobin’s in the water. Don’t tell me what he’d want.' },
      'lost-sit': { speaker: 'narrator', next: 'lost-end', text: 'You cut a notch. She watches you do it, and then she takes the shaft from your hand and corrects the angle, very gently, the way she used to correct his.' },
      'lost-end': { speaker: MAREN, mood: 'sad', text: '(Much later, so quietly you almost miss it.) He was ten when Mam went in. I said I’d look after him. That’s all. I said I would.' },
      // saved in the prologue
      home: { speaker: MAREN, next: 'home2', text: 'Do you think Tobin’s eating? I left him with Hild and three sacks of oats. He’ll eat the oats raw out of spite, because I told him to cook them.' },
      home2: { speaker: MAREN, mood: 'sad', next: 'home3', text: 'He still dreams about the water, some nights. Not Mam singing any more. Just water. He says it’s quiet now, and that’s worse, somehow, because he misses her voice.' },
      home3: {
        speaker: MAREN,
        text: 'I should be home. I should be the one making him cook the oats. Instead I’m out here shooting things for you.',
        choices: [
          { text: '“Go home, if you need to. I’ll manage.”', to: 'home-go', effects: [love(MAREN, 2)] },
          { text: '“He’s safer because you’re out here.”', to: 'home-safe', effects: [love(MAREN, 3)] },
        ],
      },
      'home-go': { speaker: MAREN, mood: 'happy', next: 'home-end', text: 'You’d last a week. You can’t skin a rabbit without crying. No, I’ve started now.' },
      'home-safe': { speaker: MAREN, next: 'home-end', text: 'That’s what I tell myself. Every night. Some nights it even works.' },
      'home-end': { speaker: MAREN, mood: 'happy', text: 'When this is done you’re coming to supper, and you’re cooking the oats. That’s an order.' },
      // died in the prologue
      dead: { speaker: MAREN, mood: 'sad', next: 'dead2', text: 'I keep turning round to tell him things. Every day. I saw a heron this morning and turned round to say “look, Tobin” and there was just you.' },
      dead2: {
        speaker: MAREN, mood: 'sad',
        text: '(She laughs, wetly.) No offence. You’re a poor substitute. You don’t even pull faces when I tell you to wash.',
        choices: [
          { text: '“Tell me about him. Something I don’t know.”', to: 'dead-tell', effects: [love(MAREN, 4)] },
          { text: '(Pull a face.)', to: 'dead-face', effects: [love(MAREN, 2)] },
          { text: '“I’m sorry, Maren. I couldn’t save him.”', to: 'dead-sorry' },
        ],
      },
      'dead-tell': { speaker: MAREN, next: 'dead-end', text: 'He was afraid of geese. Proper afraid. He’d go the long way round the green so as not to pass Wat’s goose. And he never once told anyone the reason. He said he just liked the long way. (She smiles.) He was ten years old and he had more pride than a thane.' },
      'dead-face': { speaker: MAREN, mood: 'happy', next: 'dead-end', text: '(She snorts.) That’s terrible. He did it better. You need to stick your tongue under your lip, like this… no. No, that’s just sad.' },
      'dead-sorry': { speaker: MAREN, next: 'dead-end', text: 'I know. I know you couldn’t. I hate that you couldn’t, and I don’t hate you. Both at once. It’s very tiring.' },
      'dead-end': { speaker: MAREN, text: 'Thank you. For letting me say his name. Folk stop saying it, after a while. As if it’d hurt me. It hurts more when they stop.' },
    },
  },

  // ----- 11. Sable and Grimma: locks
  {
    id: 'dialogue:banter-sable-grimma-locks', name: 'Banter: Sable and Grimma (the lock)',
    entries: [{ when: all(fol(SABLE), fol(GRIMMA), f('act1.nails_exposed')), node: 'open' }],
    nodes: {
      open: { speaker: GRIMMA, next: 's1', text: '(She drops a small iron box in Sable’s lap.) Orrun lock. Six wards and a rune-seal. My grandmother forged it. Nobody’s opened it without the key in a hundred and twelve years.' },
      s1: { speaker: SABLE, mood: 'happy', next: 'g1', text: 'Give me a hairpin and the time it takes you to say that again.' },
      g1: {
        speaker: GRIMMA,
        text: 'A wager, then. Copper says she can’t. Human? You’re holding the stakes.',
        choices: [
          { text: '“My copper’s on Sable.”', to: 'try', effects: [love(SABLE, 3)] },
          { text: '“My copper’s on the lock.”', to: 'try', effects: [love(GRIMMA, 3)] },
          { text: '“I don’t gamble against Orrun. Or thieves.”', to: 'try' },
        ],
      },
      try: { speaker: 'narrator', next: 's2', text: 'Sable works at it for a long time. Her tongue pokes out of the corner of her mouth. The hairpin bends, then breaks. Grimma begins, very slowly, to smile. Then Sable takes out a thin knife, turns the box over, and unscrews the hinges.' },
      s2: { speaker: SABLE, mood: 'happy', next: 'g2', text: '(The lid comes off in her hand.) Ta-da.' },
      g2: { speaker: GRIMMA, mood: 'angry', next: 's3', text: 'That’s cheating.' },
      s3: { speaker: SABLE, mood: 'happy', next: 'g3', text: 'That’s thieving, love. It’s in the name. Nobody ever forged a rune-seal on a hinge.' },
      g3: { speaker: 'narrator', next: 'g4', text: 'Grimma stares at the box. Then she laughs: a great cracked bellow, like a boulder going down a scree. You realise you have never heard her laugh before. Neither, it seems, has she.' },
      g4: { speaker: GRIMMA, next: 's4', text: 'Grenn take me. A hundred and twelve years. (She takes the box back, and her thick fingers brush Sable’s.) Your hands are cold as a seam in winter, thief. Sit nearer the fire.' },
      s4: { speaker: SABLE, mood: 'hollow', text: '(Too quickly.) Thieves’ hands. We keep them cold so they don’t sweat on the tumblers. Trade secret. (She tucks them in her armpits, and does not move nearer the fire.)' },
    },
  },

  // ----- 12. Vesper and Hesta: free fire against wardened fire
  {
    id: 'dialogue:banter-vesper-hesta-fire', name: 'Banter: Vesper and Hesta (free fire)',
    entries: [{ when: all(fol(VESPER), fol(HESTA), f('act2.vesper_joined')), node: 'open' }],
    nodes: {
      open: { speaker: HESTA, next: 'v1', text: 'The Wardens kept the fire under oath. Nine hundred years. Tested, taught, sworn. And you’d hand it to any farm-girl who can snap her fingers.' },
      v1: { speaker: VESPER, next: 'h1', text: 'And for nine hundred years of oaths the Church burned you in a night. Forgive me, Warden, but the Wick only finished what your vows began: fire in the hands of the few, and the few in the hands of whoever has the keys.' },
      h1: { speaker: HESTA, mood: 'angry', next: 'v2', text: 'Sparks preserve me. The mouth on her. Were you this much trouble as a nun?' },
      v2: { speaker: VESPER, mood: 'happy', next: 'h2', text: 'More. I had a vow of silence for a year. I was very good at it, and still somehow argued with everyone.' },
      h2: {
        speaker: HESTA, mood: 'sad',
        text: 'Listen to me, girl. I gave the fire to one clever young woman, and the truth with it. No oath, no Church, no keys. Just her and me and the knowledge. And she is at the end of the world now, weeping black water.',
        next: 'v3',
      },
      v3: {
        speaker: VESPER,
        text: 'And you would rather she had stayed ignorant?',
        choices: [
          { text: '“Hesta’s right. Fire needs someone to answer for it.”', to: 'hesta', effects: [love(HESTA, 3), love(VESPER, -2)] },
          { text: '“Vesper’s right. Nobody should need a licence to stay warm.”', to: 'vesper', effects: [love(VESPER, 3), love(HESTA, -2)] },
          { text: '“You held the Glass Ember for a night, Vesper. You gave it back.”', to: 'glass', when: f('act2.vesper_held_glass'), effects: [love(VESPER, 2)] },
          { text: '“You both want the same thing. You just hate each other’s hats.”', to: 'hats', effects: [love(HESTA, 1), love(VESPER, 1)] },
        ],
      },
      hesta: { speaker: VESPER, next: 'end', text: 'Answer to whom? That is the only question there has ever been, and every answer to it has a lock on the end.' },
      vesper: { speaker: HESTA, mood: 'angry', next: 'end', text: 'Warm. Hah. Wait till you’ve seen what a frightened boy with a fistful of ember does to a barn full of his neighbours. Then talk to me about warm.' },
      glass: { speaker: VESPER, mood: 'sad', next: 'end', text: 'I did. All night I sat with it in my lap and thought: what if everyone is me? (She glances at Hesta.) I didn’t sleep. I don’t think I have since.' },
      hats: { speaker: HESTA, mood: 'happy', next: 'end', text: '(A wheeze that is almost a laugh.) Her hat is a shaved head, child. Mine is a hood. Neither of us has a hat.' },
      end: {
        speaker: HESTA,
        text: 'I’d have had her careful. That’s all. Not ignorant. Careful. (She pokes the fire.) I didn’t know how to teach that. I’m not sure anybody does. Perhaps you’ll find out, Abbess. Perhaps you’ll have better luck than me.',
      },
    },
  },

  // ----- 13. After Act I: everyone at the Cinderhold hearth
  {
    id: 'dialogue:banter-cinderhold-hearth', name: 'Banter: The Cinderhold hearth',
    entries: [
      { when: all(f('act1.complete'), f('act1.hesta_alive')), node: 'a-open' },
      { when: f('act1.complete'), node: 'd-open' },
    ],
    nodes: {
      // Hesta lives: her toast
      'a-open': {
        speaker: 'narrator',
        text: 'The night you came back from Varn, the hall at Cinderhold was full for the first time in a hundred and forty-five years. Someone had found a cask in the undercroft that the Wick had missed. The brazier burned high on its ley, and Hesta Corrow stood up on a bench with a cup in her hand, which took her three tries.',
        choices: [
          { text: '(Raise your cup.)', to: 'a-aldith', when: is('act1.ruler', 'aldith') },
          { text: '(Raise your cup.)', to: 'a-harrow', when: is('act1.ruler', 'harrow') },
          { text: '(Raise your cup.)', to: 'a-wick', when: is('act1.ruler', 'wick') },
          { text: '(Raise your cup.)', to: 'a-toast', when: not(f('act1.ruler')) },
        ],
      },
      'a-aldith': { speaker: HESTA, next: 'a-toast', text: 'To the Queen. Who is fifteen, and braver than her whole council, and who will, I am told, be giving me a pension. I have never had a pension. I intend to be unbearable about it.' },
      'a-harrow': { speaker: HESTA, mood: 'angry', next: 'a-toast', text: 'To the Lord Protector, who sold— no. No, I won’t. I’m too old to drink to men I’d not leave alone with a candle. To the Haldmarch, then, which deserves better than both of us.' },
      'a-wick': { speaker: HESTA, mood: 'angry', next: 'a-toast', text: 'To the Order of the Wick, who hold the city gates now, thanks to someone in this room. (She tips her cup and pours a measure on the flagstones.) There. They’ve had their share. Don’t ever say I’m not ecumenical.' },
      'a-toast': {
        speaker: HESTA,
        text: 'To the wardens of this hall, who kept the fire nine hundred years and never once got thanked for it. To the ones who should be here and aren’t. And to this lot, Seven help me. The worst company an old woman ever kept. Drink, before I start crying and have to kill you all.',
        next: 'a-hub',
      },
      'a-hub': {
        speaker: 'narrator', text: 'The hall is loud and warm. You go round the hearth.',
        choices: [
          visit('(Sit with Maren.)', 'a-maren', tobinHome),
          visit('(Sit with Maren.)', 'a-maren-sad', not(tobinHome)),
          visit('(Find Cadoc.)', 'a-cadoc', f('act1.ylwen_pact')),
          visit('(Find Grimma.)', 'a-grimma', f('act1.nails_exposed')),
          visit('(Find Sable.)', 'a-sable', f('act1.wick_ledger_taken')),
          visit('(Find Anselm.)', 'a-anselm', not(betrayed)),
          { text: '(Sit down by Hesta and the fire.)', to: 'a-end' },
        ],
      },
      'a-maren': { speaker: MAREN, mood: 'happy', next: 'a-hub', text: 'I’ve had three cups and I can still hit that rafter. Watch. (She does not try to hit the rafter, which is how you know she’s had three cups.) Tobin would love this. He’d be under the table by now.' },
      'a-maren-sad': { speaker: MAREN, mood: 'sad', next: 'a-hub', text: 'She said “the ones who should be here.” (She turns her cup round and round.) I counted Tobin. I always count Tobin. Drink with me. Just one. Then I’ll be all right.' },
      'a-cadoc': { speaker: CADOC, next: 'a-hub', text: 'Human festivals are so brief and so loud. Like a firework that has been taught to sing. (He takes a long drink.) I find I have missed being invited to things. Do not tell my mother.' },
      'a-grimma': { speaker: GRIMMA, mood: 'happy', next: 'a-hub', text: 'This ale’s a hundred and forty years old and tastes like a boot. Best thing I’ve drunk since the gate. (She clinks your cup hard enough to crack it.) Korr nagh.' },
      'a-sable': { speaker: SABLE, mood: 'happy', next: 'a-hub', text: 'I’ve picked three pockets tonight and put everything back. It’s a sort of game. Like giving presents, only nobody knows. (Her eyes shine, too wet in the firelight. She wipes them, laughing.) Smoke. It’s the smoke.' },
      'a-anselm': { speaker: ANSELM, mood: 'happy', next: 'a-hub', text: 'Mistress Corrow has asked me to bless the cask. I have explained that I am not certain it needs it. It is very holy already. It has, I believe, been made a saint.' },
      'a-end': {
        speaker: HESTA,
        text: '(She lowers herself down beside you with a grunt.) I was meant to die at Varn, you know. I felt it go by, close as a cart. And here I am, drinking ale that tastes of boot, with a hall full of fools. (She doesn’t look at you.) Thank you, child. Don’t you dare make anything of it.',
      },
      // Hesta is dead: the memorial toast
      'd-open': {
        speaker: 'narrator',
        text: 'The night you came back from Varn, the hall at Cinderhold was full, and quiet. The brazier burned high on its ley. Above the hearth, where Hesta used to sit and complain about the draught, someone had hung Lastlight on two iron pegs. It steamed a little in the cold.',
        choices: [{ text: '(Raise your cup.)', to: 'd-toast' }],
      },
      'd-toast': {
        speaker: MAREN, mood: 'sad',
        text: '(Maren stands, because nobody else will.) She’d hate this. She’d say we were wasting good ale and worse sentiment. (Her voice shakes, and she makes it stop.) To Hesta Corrow. Who was rude to every one of us, and died for all of us, and would want us to get on with it. So. Get on with it.',
        next: 'd-hub',
      },
      'd-hub': {
        speaker: 'narrator', text: 'The hall talks again, slowly, the way a fire takes. You go round the hearth.',
        choices: [
          visit('(Find Cadoc.)', 'd-cadoc', f('act1.ylwen_pact')),
          visit('(Find Grimma.)', 'd-grimma', f('act1.nails_exposed')),
          visit('(Find Sable.)', 'd-sable', f('act1.wick_ledger_taken')),
          visit('(Find Anselm.)', 'd-anselm', not(betrayed)),
          visit('(Look at the empty place at the end of the bench.)', 'd-empty', betrayed),
          { text: '(Take Lastlight down from the wall.)', to: 'd-end' },
        ],
      },
      'd-cadoc': { speaker: CADOC, mood: 'sad', next: 'd-hub', text: 'I sang. At Varn. I sang until my throat bled, and it was not enough alone. (He turns his cup.) I have outlived a great many humans, spark. I had thought it would not surprise me any more. It is apparently a thing one does not get used to.' },
      'd-grimma': { speaker: GRIMMA, next: 'd-hub', text: 'Knew her a season. Rude as a rockfall. (She taps a ring in her braid.) I put her in my ledger. Not owing. Paid. Orrun don’t write that often.' },
      'd-sable': { speaker: SABLE, mood: 'sad', next: 'd-hub', text: 'She caught me nicking her pipe, first week. Didn’t say a word. Next morning there was a second pipe in my pack. Cheaper. With a note. “Steal your own tobacco.” (She laughs, and stops.) I kept the note.' },
      'd-anselm': { speaker: ANSELM, mood: 'sad', next: 'd-hub', text: 'I said the office for her. She would have objected to every word. (He looks at his hands.) My Radiance held Ysolde back for a heartbeat. If there had been a song beside it, they say… I will be a long time wondering about that heartbeat.' },
      'd-empty': { speaker: MAREN, mood: 'sad', next: 'd-hub', text: '(She follows your eyes to the empty bench.) If Brother Anselm had been there, at Varn… (She stops herself.) No. Don’t. You’ll go mad down that road. Drink.' },
      'd-end': {
        speaker: 'narrator', effects: [love(MAREN, 2)],
        text: 'Lastlight is warm in your hands, warmer than the fire. Nobody stops you. Maren only nods, as if this was always what the pegs were for. Outside the snow comes down on Cinderhold, and for the first time in a hundred and forty-five years there is a warden in the hall to watch it.',
      },
    },
  },

  // ----- 14. After the Ninth Nail: Grimma
  {
    id: 'dialogue:banter-grimma-deep', name: 'Banter: Grimma (after the Ninth Nail)',
    entries: [
      { when: all(fol(GRIMMA), f('act2.new_nail')), node: 'nail' },
      { when: all(fol(GRIMMA), f('act2.korrath_flooded')), node: 'flood' },
    ],
    nodes: {
      // the new Nail forged
      nail: { speaker: 'narrator', next: 'nail2', text: 'Grimma is sitting by the fire tapping a hammer against nothing, over and over, in a slow rhythm. Under her breath she is singing the hold-fast rune. She has been singing it for an hour.' },
      nail2: { speaker: GRIMMA, mood: 'happy', next: 'nail3', text: 'Nine Nails and one. First new Nail in four thousand years, and it’s got my mark on its head. Clan Ironsong. In true-iron. Down there till the mountain falls.' },
      nail3: { speaker: GRIMMA, next: 'nail4', text: 'Brannoch shook my hand. In front of the hold. I counted my fingers after.' },
      nail4: {
        speaker: GRIMMA,
        text: 'They’ll have to unwrite “grenn” now. Next to my name. In the ledger.',
        choices: [
          { text: '“You should be proud, Grimma.”', to: 'nail-proud', effects: [love(GRIMMA, 3)] },
          { text: '“Will they? Unwrite it?”', to: 'nail-unwrite' },
        ],
      },
      'nail-proud': { speaker: GRIMMA, mood: 'sad', next: 'nail-end', text: 'I am. Grenn take it, I am. (She rubs her eyes with the back of a scarred wrist.) Spark in my eye. Forge-work. Happens.' },
      'nail-unwrite': { speaker: GRIMMA, mood: 'happy', next: 'nail-end', text: 'Orrun don’t unwrite. They’ll write something after it. “Grenn.” And underneath, smaller: “Also, right.” (She snorts.) That’ll do me.' },
      'nail-end': { speaker: GRIMMA, text: 'Clan-mother’ll want a hearing now. About my ring. (She touches the bare place on her finger.) Later. Tonight I’m going to sit here and sing at a Nail I can’t see. Go to sleep, human. You’ll not stop me.' },
      // the Ember taken, the holds flooded
      flood: { speaker: 'narrator', next: 'flood2', text: 'Grimma has not spoken since Korrath. She sits away from the fire with her back to a rock, and her hammer across her knees, and stares north toward the mountain.' },
      flood2: { speaker: GRIMMA, mood: 'angry', next: 'flood3', text: 'Lower holds are under. Coalheart. Half of Stonebrow. I had cousins in Stonebrow. Hedda’s sister ran the bread-ovens on the ninth stair. Black water in the ovens now.' },
      flood3: {
        speaker: GRIMMA, mood: 'angry',
        text: 'You took the Ember out of the hole and the sea came up through it. I told them the Nails were failing. I said it at the gate in front of everyone. And then I stood there and watched you pull out the plug.',
        choices: [
          { text: '“I’m sorry, Grimma. I chose wrong.”', to: 'flood-sorry', effects: [love(GRIMMA, 4)] },
          { text: '“The Ember had to be taken. We need all seven.”', to: 'flood-had', effects: [love(GRIMMA, -3)] },
          { text: '(Say nothing. Sit down beside her, away from the fire.)', to: 'flood-sit', effects: [love(GRIMMA, 2)] },
        ],
      },
      'flood-sorry': { speaker: GRIMMA, next: 'flood-end', text: 'Sorry. (She tastes the word like bad iron.) Humans say it like it fixes something. Orrun write it down. I’ll write it down. That’s more than most get.' },
      'flood-had': { speaker: GRIMMA, mood: 'angry', next: 'flood-end', text: '“Had to.” Every lie my people ever told started with “had to.” Had to keep it secret. Had to keep the peace. Don’t you start, human. Don’t you dare start.' },
      'flood-sit': { speaker: 'narrator', next: 'flood-end', text: 'It is very cold away from the fire. Neither of you moves. After a long while, without looking at you, Grimma shifts her hammer so that its weight lies across both your knees.' },
      'flood-end': { speaker: GRIMMA, mood: 'sad', text: 'I’ll walk with you still. We’ve a world to keep up. But it’s in my ledger now, against your name: owing. You’ll be paying a long time.' },
    },
  },

  // ----- 15. After the counsel: whoever is following, on the keeper’s price
  {
    id: 'dialogue:banter-keepers-price', name: 'Banter: The keeper’s price',
    entries: [{ when: all(f('act2.nhal_revealed'), anyFollowing), node: 'open' }],
    nodes: {
      open: {
        speaker: 'narrator',
        text: 'Nobody has said it aloud since the counsel. The third way can be sung: the Lullaby, the Embers and the Ashmark together. But someone must stay below, as keeper, for as long as the sea sleeps. Around the fire, nobody is looking at anybody.',
        next: 'hub',
      },
      hub: {
        speaker: 'narrator', text: 'The fire cracks. You look round at the faces in its light.',
        choices: [
          visit('(Look at Maren.)', 'maren', fol(MAREN)),
          visit('(Look at Anselm.)', 'anselm', fol(ANSELM)),
          visit('(Look at Hesta.)', 'hesta', fol(HESTA)),
          visit('(Look at Cadoc.)', 'cadoc-sung', all(fol(CADOC), verseSung)),
          visit('(Look at Cadoc.)', 'cadoc', all(fol(CADOC), not(verseSung))),
          visit('(Look at Grimma.)', 'grimma', fol(GRIMMA)),
          visit('(Look at Sable.)', 'sable-saved', all(fol(SABLE), sableSaved)),
          visit('(Look at Sable.)', 'sable', all(fol(SABLE), not(sableSaved))),
          visit('(Look at Vesper.)', 'vesper', fol(VESPER)),
          { text: '“Nobody stays below. We find another way.”', to: 'none' },
          { text: '“If anyone stays, it will be me.”', to: 'me' },
        ],
      },
      maren: { speaker: MAREN, mood: 'angry', next: 'hub', text: 'Not you. Don’t you look at me like you’re working up to it. If it’s you, I’ll come down after you and drag you up by the ear, keeper or no keeper, and the sea can sort itself out.' },
      anselm: { speaker: ANSELM, mood: 'sad', next: 'hub', text: 'The martyrs in the windows always look so calm. I used to think the glaziers painted them that way. I begin to suspect the glaziers had never met one. (A pause.) If it is the price, I have less to lose than most. I have already lost a Church.' },
      hesta: { speaker: HESTA, next: 'hub', text: 'Seventy, and a chest like a gravel cart. Send me. No, don’t argue. I taught her. I should be the one who sits in the dark with what she’s done. It’s only fair, and I’ve never been fair in my life, so let me start.' },
      'cadoc-sung': { speaker: CADOC, mood: 'sad', next: 'hub', text: 'I know the last verse now. I went down to Ys Aerwen for it. (He does not look up.) Whoever holds the sea asleep should be the one who can sing it to sleep, spark. You know that as well as I do.' },
      cadoc: { speaker: CADOC, next: 'hub', text: 'I have four hundred years left in me, give or take. That is a long vigil. It is also exactly what my people are for: being patient, and sad, somewhere damp. (Drily.) I would be very good at it. That is what frightens me.' },
      grimma: { speaker: GRIMMA, next: 'hub', text: 'My fathers stood in the passes for ten thousand years and didn’t complain once. Standing’s what Orrun are for. (A pause.) I’d want a forge down there, mind. And coal. I’m not keeping the world asleep in the cold like a savage.' },
      'sable-saved': { speaker: SABLE, next: 'hub', text: 'A month ago I’d have said me. I’d have meant it, too. (She looks at her hands, which are warm.) But you got all of me back, love, and I’ve gone greedy with it. Sorry. I want to keep me.' },
      sable: { speaker: SABLE, mood: 'hollow', next: 'hub', text: 'Who’d miss a thief? I’m halfway there already, love. I’d save everyone the walk. (She laughs. She wipes her eyes on her sleeve, and in the firelight the sleeve comes away dark.)' },
      vesper: { speaker: VESPER, mood: 'sad', next: 'hub', text: 'A keeper. One person holding the fire for everyone. That is a priest, by another name. I have spent my whole life saying that is wrong, and now it seems the only door out of the world is shaped exactly like one.' },
      none: { speaker: 'narrator', next: 'end', text: 'Nobody argues. Nobody believes you, either, quite. But somebody passes you the waterskin, and somebody else banks the fire, and for a while it is enough that it was said.' },
      me: { speaker: 'narrator', next: 'end', text: 'It goes very quiet. Then several people tell you, at once and with some force, exactly what they think of that.' },
      end: { speaker: 'narrator', text: 'Later, when the others sleep, you find that your Ashmark is warm, and that you have been holding it against your chest like something you meant to give away.' },
    },
  },

  // ----- 16. After Act II: the night before the Mirelands
  {
    id: 'dialogue:banter-eve-of-mirelands', name: 'Banter: The night before the Mirelands',
    entries: [{ when: all(f('act2.complete'), anyFollowing), node: 'open' }],
    nodes: {
      open: {
        speaker: 'narrator',
        text: 'South and east, beyond the last of Greywater, the Breach breathes. You can hear it from here: a slow sound, like a sleeper with a cold. Tomorrow you walk into the Mirelands. Tonight nobody can sleep, so nobody pretends to.',
        next: 'hub',
      },
      hub: {
        speaker: 'narrator', text: 'You go round the fire.',
        choices: [
          visit('(Sit with Maren.)', 'maren-home', all(fol(MAREN), tobinHome)),
          visit('(Sit with Maren.)', 'maren', all(fol(MAREN), not(tobinHome))),
          visit('(Sit with Anselm.)', 'anselm', fol(ANSELM)),
          visit('(Sit with Hesta.)', 'hesta', fol(HESTA)),
          visit('(Sit with Cadoc.)', 'cadoc', fol(CADOC)),
          visit('(Sit with Grimma.)', 'grimma', fol(GRIMMA)),
          visit('(Sit with Sable.)', 'sable', fol(SABLE)),
          visit('(Sit with Vesper.)', 'vesper', fol(VESPER)),
          { text: '(Lie down and watch the sparks go up.)', to: 'end' },
        ],
      },
      'maren-home': { speaker: MAREN, mood: 'happy', next: 'hub', text: 'When we’re back I’m going to sleep for a month, and then I’m going to teach Tobin to shoot, and he’s going to be dreadful at it. (She bumps your shoulder.) You’re coming too. Somebody has to hold the target.' },
      maren: { speaker: MAREN, next: 'hub', text: 'Mam went into the mere. Tobin went into the water. Tomorrow I walk into the whole sea of it, on purpose. (She tests her bowstring with her thumb.) Somebody in this family had to go in with a bow. Took us long enough.' },
      anselm: { speaker: ANSELM, next: 'hub', text: 'I have been trying to write a sermon for when we come back. I have the first line. “Brothers and sisters, I have been to the bottom of the world, and I regret to tell you it is damp.” I am still working on the second.' },
      hesta: { speaker: HESTA, mood: 'sad', next: 'hub', text: 'She’ll be there. Ysolde. Waiting, I expect, with a candle in the window. (She coughs.) I used to leave one in the window for her when she was late home from the leys. She always came. Let’s see if she still does.' },
      cadoc: { speaker: CADOC, next: 'hub', text: 'My great-grandmother sank with Ys Aerwen, and lived, and has never once gone near the water since. Tomorrow I shall walk into it on purpose, with a human. (A dry pause.) I am going to be insufferable at the next family gathering.' },
      grimma: { speaker: GRIMMA, next: 'hub', text: 'I’ve put new edges on everyone’s gear. Twice. Yours three times. (She weighs her hammer.) If the sea wants me, it can come and get me. It’ll find me very rude about it.' },
      sable: { speaker: SABLE, mood: 'happy', next: 'hub', text: 'Do you know what I’ve never stolen? A ship. Not a little one; a big one, with a figurehead. That’s for after. (She bumps your knee.) You can be the figurehead. You’ve the face for it.' },
      vesper: { speaker: VESPER, next: 'hub', text: 'I prayed tonight. A real prayer, not the office. I didn’t know who to address it to, so I addressed it to you. (She smiles.) Don’t let it go to your head. The last thing I prayed to was a candle.' },
      end: { speaker: 'narrator', text: 'One by one the others sleep, or lie still and pretend, which is nearly the same. The sparks go up into the dark and do not come down. In the morning, the Mirelands.' },
    },
  },
];

export default dialogues;
