/** Hollow Crown, OATHBOUND Act I main dialogues (the Gilded March). Owner: Claude 4. */
import type { DialogueDef } from '@/core';

const BH = 'npc:beatrix-holm' as const, IL = 'npc:ilsabet' as const, SG = 'npc:ser-gallant' as const;
const AS = 'npc:aurelian-sterling' as const;

const dialogues: DialogueDef[] = [
  // ---------- I-1 The Vigil
  {
    id: 'dialogue:oathbound-vigil-bell', name: 'I-1 the vigil and the Bell', scope: 'party',
    entries: [{ node: 'vigil' }],
    nodes: {
      vigil: { speaker: 'narrator', text: 'The Hall of Broken Swords, by candlelight. Three hundred swords hang in their brackets along the walls, each one snapped in a battle and brought home by whoever was left. You have been kneeling since the Hour of Lamps. Your knees stopped complaining an hour ago, which is worse.', next: 'bell' },
      bell: { speaker: 'narrator', text: 'You are halfway through the Oath of the March when a bell rings, very far away. Every broken sword in the Hall rings back at once, a high thin note like a wet finger round a glass, and something in your chest starts to ring with them.', next: 'door' },
      door: { speaker: BH, text: '(From the doorway, without moving.) Finish the oath. Then we’ll talk.', next: null },
    },
  },
  {
    id: 'dialogue:obj-broken-sword-rack-1', name: 'I-1 the ringing swords',
    entries: [{ when: { questStage: 'quest:oathbound-the-vigil', stage: 'swords' }, node: 'steady' }, { node: 'rack' }],
    nodes: {
      steady: { speaker: 'narrator', text: 'A rack of broken blades, humming so hard the brackets are walking out of the wall. You put your shield against them and lean, the way you were taught to hold a line, and they quieten under it, one by one.', next: null },
      rack: { speaker: 'narrator', text: 'A rack of broken swords, each with a scrap of ribbon tied to the hilt: a name, a date, a field.', next: null },
    },
  },
  {
    id: 'dialogue:oathbound-beatrix-vigil', name: 'I-1 the Oath of the March', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: BH, text: 'You stopped at “and I shall keep”. Every Oathbound gets to the end of that line in their own words. It’s the only part of the Oath that’s yours. Say it now. I’m listening, and so are three hundred swords.', next: 'swear' },
      swear: {
        speaker: BH, text: 'And I shall keep…',
        choices: [
          { text: '“…the place where no one else will stand.”', to: 'stand', effects: [{ setFlag: 'oathbound.oath_words', value: 'stand' }] },
          { text: '“…every village of the March, so that none shall stand alone.”', to: 'village', effects: [{ setFlag: 'oathbound.oath_words', value: 'village' }] },
          { text: '“…what I promise, though the one I promised fall.”', to: 'keep', effects: [{ setFlag: 'oathbound.oath_words', value: 'keep' }] },
        ],
      },
      stand: { speaker: BH, text: 'The place where no one else will stand. (She nods once.) That’s a hard one to keep. Good. I’ll hold you to it.', next: 'glow' },
      village: { speaker: BH, text: 'Every village of the March. That’s the old Oath, nearly word for word. You’ve been reading the founding stones. Good. I’ll hold you to it.', next: 'glow' },
      keep: { speaker: BH, mood: 'sad', text: 'Though the one you promised fall. (A long pause.) That is the Sorrow-Oath, near enough. Mind it. It has eaten better knights than you. I’ll hold you to it anyway.', next: 'glow' },
      glow: {
        speaker: BH, text: 'You’re sworn. Now: why are you glowing? Don’t tell me you’ve been at the chapel candles.',
        choices: [
          { text: 'Something is ringing in my chest, Marshal. Like the swords.', to: 'stone' },
          { text: 'I don’t know. It started with the bell.', to: 'stone' },
        ],
      },
      stone: { speaker: BH, text: 'Then it’s the March half. Half of the Radiance stone came to rest in the Dimming Shrine when the crown broke, and it’s lain there thirty years. If it has woken for a recruit with sore knees, the March is in more trouble than I thought.', next: 'end' },
      end: {
        speaker: BH, text: 'Go and sleep. That’s an order, and it’s the last easy one you’ll get from me.',
        choices: [{ text: 'Yes, Marshal.', to: null, trust: 1 }, { text: 'There isn’t a night to sleep in.', to: 'night' }],
      },
      night: { speaker: BH, text: 'There is on the March, now. Out past Haybright. That’s the trouble. Go to bed.', next: null },
    },
  },
  // ---------- I-2 No Village Alone
  {
    id: 'dialogue:oathbound-marjory', name: 'I-2 Reeve Stook at Haybright', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: 'npc:marjory-stook', text: 'Oathkeep! About time. The Dimming came over the north field at noon and now every soul in Haybright is stood in the street staring at their own feet. Old Pym thinks his shadow is trying to drag him to the underworld. It’s his shadow, Pym.', next: 'help' },
      help: {
        speaker: 'npc:marjory-stook', text: 'None of them have ever seen one at full length. I’ve tried shouting. Shouting didn’t work, which is a first. You try.',
        choices: [
          { text: 'No village of the March stands alone. I’ll talk to them.', to: 'go', quest: true },
          { text: 'Why aren’t you frightened?', to: 'why' },
        ],
      },
      why: { speaker: 'npc:marjory-stook', text: 'I’m frightened. I’ve also got four hundred acres of wheat to bring in and nobody to bring it. Fear can wait in the queue like everyone else.', next: 'go' },
      go: { speaker: 'npc:marjory-stook', text: 'And mind the shady bits. Something black has been pooling in them since this morning, and I don’t like the look of it.', next: null },
    },
  },
  {
    id: 'dialogue:obj-haybright-villager-1', name: 'I-2 a villager and his shadow',
    entries: [{ when: { questStage: 'quest:oathbound-no-village-alone', stage: 'shadows' }, node: 'pym' }, { node: 'calm' }],
    nodes: {
      pym: {
        speaker: 'narrator', text: 'Old Pym is standing quite still in the middle of the street, looking at the long dark shape stretched out behind him. “It’s following me,” he whispers. “Wherever I go.”',
        choices: [
          { text: 'It’s yours, Pym. It only goes where you go.', to: 'calm' },
          { text: '(Stand beside him, so your shadows lie side by side.)', to: 'side' },
        ],
      },
      side: { speaker: 'narrator', text: 'Pym looks at the two shadows, his and yours, lying together across the road like two people resting. After a while he laughs, and lifts one hand, and watches his shadow wave.', next: null },
      calm: { speaker: 'narrator', text: 'Pym is waving at his shadow, and his shadow is waving back.', next: null },
    },
  },
  {
    id: 'dialogue:oathbound-beatrix-haybright', name: 'I-2 report on Haybright', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: BH, text: 'Haybright’s standing? Good. The Lightbearers came out of the shade, you say. Out of the black stuff.',
        choices: [
          { text: 'Black tears. Pooling wherever the shade is deepest.', to: 'tears' },
          { text: 'The village did well, Marshal. Stook especially.', to: 'stook', trust: 1 },
        ],
      },
      stook: { speaker: BH, text: 'Marjory Stook could hold a breach with a broom. I’d knight her if she’d sit still for it.', next: 'tears' },
      tears: { speaker: BH, text: 'The tears are weeping out of everything on the March, now. And the road’s worse. The Gilded Lion has started eating the waymarks, and in the Dimming a road without waymarks is a road into a bog.', next: 'lion' },
      lion: { speaker: BH, text: 'That Lion has guarded the March road for a thousand years. Go up to the Lion’s Gate and find out what’s wrong with it. If it can’t be mended, end it, and bring back the gold.', next: null },
    },
  },
  // ---------- I-3 The Lion's Gate
  {
    id: 'dialogue:obj-lion-waymark-hoard', name: 'I-3 the Lion’s hoard', scope: 'party',
    entries: [{ when: { questStage: 'quest:oathbound-the-lions-gate', stage: 'hoard' }, node: 'gold' }, { node: 'empty' }],
    nodes: {
      gold: { speaker: 'narrator', text: 'Behind the Lion’s bed, a drift of chewed gold: the tops of waymarks, bitten off clean, some still with words on them. “HAYBRIGHT, TWO MILES.” “TRAVELLER, KEEP.” The Lion ate every one, and none of it filled whatever it was trying to fill.', next: null },
      empty: { speaker: 'narrator', text: 'The Lion’s empty bed, scattered with golden crumbs.', next: null },
    },
  },
  {
    id: 'dialogue:oathbound-beatrix-lion', name: 'I-3 the gold comes home', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: BH, text: 'That’s the whole road in one sack. (She lifts a bitten piece, reads it, puts it down.) I learned to ride on that road. Every waymark was a promise somebody made to somebody walking it.', next: 'news' },
      news: { speaker: BH, mood: 'afraid', text: 'And while you were up there, the scouts came in from the Dimming. Someone is riding out of the dark with a line of villagers behind her. Polished armour, they say. A grey horse. (She stops.) Get your cloak. We’re going to look.', next: null },
    },
  },
  // ---------- I-4 The Sorrow-Oath
  {
    id: 'dialogue:oathbound-ilsabet-meet', name: 'I-4 Dame Ilsabet rides out of the Dimming', scope: 'party',
    entries: [{ node: 'ride' }],
    nodes: {
      ride: { speaker: 'narrator', text: 'Out of the dark at the Dimming’s edge comes a knight on a grey horse, at a walk. Her armour is polished to a mirror. Forty villagers follow behind her in a line, and every child in it is holding her stirrup, or holding the hand of a child who is.', next: 'ilsabet' },
      ilsabet: {
        speaker: IL, mood: 'happy', text: 'Oathkeep. Thank you for coming out to meet us; the road has been eaten, and the children were tired of my singing. Forty-one from Nethercott, and a goat. Where shall I bring them?',
        choices: [
          { text: 'Haybright will take them. Who are you?', to: 'who' },
          { text: '(Look at her hands on the reins.)', to: 'ring', insight: 'ring_turned', when: { insight: 'oathbound_ring_custom' } },
        ],
      },
      ring: { speaker: 'narrator', text: 'Her gauntlets are off, for the children. On the third finger of her right hand is an Oathbound ring, the sun and the sword, and it has been turned inward on her finger, so the sun faces her palm.', next: 'who' },
      who: { speaker: IL, text: 'Ilsabet. Of the Sorrow-Oath, they used to say, though I don’t suppose anyone says it now. I’ve been in the Dimming a long time. (She looks past you, and her face changes.) Hello, Bea.', next: null },
    },
  },
  {
    id: 'dialogue:oathbound-beatrix-milestone', name: 'I-4 Beatrix on the milestone', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: BH, mood: 'sad', text: '(She is sitting on a milestone with her helm in her lap.) Thirty years. She went to the Turning in C. 1012 and the gates shut behind her. I said prayers for her. I had her sword-bracket put up in the Hall. Empty, because she took the sword.',
        choices: [
          { text: 'Who is she to you, Marshal?', to: 'who' },
          { text: 'Take your time.', to: 'time', trust: 1 },
          { text: 'I saw the empty bracket in the Hall. It rang when the Bell did.', to: 'bracket', when: { flag: 'oathbound.empty_bracket' } },
        ],
      },
      bracket: { speaker: BH, mood: 'sad', text: 'It rang? (She shuts her eyes.) Of course it did. I put that bracket up myself and wrote the ribbon. “Gone to the Turning.” I couldn’t write anything else. I have never once walked past it without looking.', next: 'who' },
      time: { speaker: BH, text: 'I don’t have time. That’s the whole trouble with me. (She stands up.) But thank you.', next: 'who' },
      who: { speaker: BH, text: 'My shield-companion. We were squires together. We swore together. She was the best of us and she knew it and she was kind about it, which was worse. And now she’s back, and she looks exactly the same, and that is wrong.', next: 'moot' },
      moot: { speaker: BH, mood: 'angry', text: 'And there’s a Brightwatch rider at Oathkeep with a decree, the scouts say. Back to the fortress. Whatever Ilsabet is, the Order has to deal with that first.', next: null },
    },
  },
  // ---------- I-5 The Oath Moot (faction choice; a party vote)
  {
    id: 'dialogue:oathbound-oath-moot', name: 'I-5 the Oath Moot', scope: 'party',
    entries: [{ when: { not: { flag: 'oathbound.decree' } }, node: 'stones' }, { node: 'after' }],
    nodes: {
      stones: { speaker: 'narrator', text: 'The oath-stones of Oathkeep, a ring of grey standing stones carved with every oath the Order ever swore. The knights stand inside the ring. Outside it, the folk of Haybright and Nethercott wait to hear what will be done with them.', next: 'decree' },
      decree: { speaker: AS, text: 'By order of His Radiance the Hierarch: all persons who have looked upon the night are night-touched, and shall be escorted to Dawnspire for cleansing in the light. Oathkeep will furnish the escort. Oathkeep is sworn to obey. (He clears his throat.) I’m terribly sorry.', next: 'beatrix' },
      beatrix: { speaker: BH, text: 'We are sworn to the Hierarch. We are also sworn that no village of the March shall stand alone. I have read both oaths a hundred times tonight and I cannot make them agree. You were sworn last. Your oath is freshest. Speak.', next: 'voices' },
      voices: {
        speaker: 'narrator', text: 'Inside the ring the knights stand very straight. Outside it the villagers stand very still. Somebody’s child asks, quite loudly, what “cleansing” means, and nobody answers.',
        choices: [
          { text: '(Let Reeve Stook speak for Haybright.)', to: 'stook', when: { flag: 'oathbound.stook_asked' } },
          { text: '(Ask Captain Sterling what he would do.)', to: 'sterling', when: { flag: 'oathbound.sterling_asked' } },
          { text: '(Speak.)', to: 'choose' },
        ],
      },
      stook: { speaker: 'npc:marjory-stook', text: '(From outside the ring, arms folded.) We’ve four hundred acres in and nobody hurt. We saw the night. It was dark, and then it wasn’t. If that wants cleansing, cleanse the sky first. I’ll wait.', next: 'choose' },
      sterling: { speaker: AS, mood: 'afraid', text: 'Me? I’d… (He looks at the decree in his hand as if someone had given him a live fish.) I would do what I’m told, Oathbound. It’s all I’ve ever been good at. But I’d be very glad if somebody told me something else.', next: 'choose' },
      choose: {
        speaker: BH, text: 'Well, Oathbound?',
        choices: [
          { text: 'Keep the decree. We swore to the Hierarch, and an oath is an oath.', to: 'decree_kept', quest: true, trustNpc: BH, trust: -1, effects: [{ setFlag: 'oathbound.decree', value: 'decree' }] },
          { text: 'Keep the March. “No village shall stand alone.” That oath is older.', to: 'march', quest: true, effects: [{ setFlag: 'oathbound.decree', value: 'march' }] },
          { text: 'Read the founding stone aloud. The Order was never sworn to the Hierarch. It was sworn to the crown that passes.', to: 'passes', quest: true, insight: 'oathbound_read_first_oath', when: { insight: 'first_oath' }, effects: [{ setFlag: 'oathbound.decree', value: 'passes' }] },
        ],
      },
      decree_kept: { speaker: BH, mood: 'angry', text: 'Then Oathkeep keeps its word. (She does not look at the villagers.) Mount the escort. We march them to Dawnspire. Gently, mind. Anyone who isn’t gentle answers to me.', next: null },
      march: { speaker: AS, mood: 'afraid', text: 'Then Oathkeep is forsworn, and I must say so to His Radiance. (He rolls up the decree.) For what it’s worth, Marshal, I’d have done the same, if I were brave. Please don’t tell anyone I said that.', next: 'march2' },
      march2: { speaker: BH, text: 'The Order stands with the March. Every knight to the Dimming’s edge. If the Brightwatch wants these people, it can come through us, and it won’t.', next: null },
      passes: { speaker: 'narrator', text: 'You read it from the stone, the words Beatrix rubbed out of the dirt: “to the crown that passes, and to no lord who will not let it pass.” The Brightwatch captain looks at the Hierarch’s own seal, cut into the same stone a thousand years ago, and very slowly puts his decree away.', next: 'passes2' },
      passes2: { speaker: AS, text: 'Well. I can hardly argue with my own Hierarch’s seal, can I. (He mounts.) I’ll tell His Radiance the March has… an older arrangement. He’ll be furious. He’s always furious. Good day.', next: null },
      after: { speaker: BH, text: 'The Moot has spoken. Now we keep what it said.', next: null },
    },
  },
  // ---------- I-6 The Forsworn Chapel
  {
    id: 'dialogue:oathbound-gallant-yields', name: 'I-6 Ser Gallant yields', scope: 'party',
    entries: [{ when: { not: { flag: 'oathbound.gallant' } }, node: 'yield' }, { node: 'after' }],
    nodes: {
      yield: { speaker: SG, mood: 'sad', text: 'I yield. I yield. (He sits down heavily among the broken pews.) Do you know how many times I have got up? Neither do I. I stopped counting at the first thousand. A broken oath won’t let you die. It won’t let you do anything else, either.', next: 'whose' },
      whose: {
        speaker: SG, text: 'You’ll want to know whose oath. They always do. I was Dame Ilsabet’s squire. I swore to follow her anywhere. And on the night of the Turning she knelt to the crown, and swore to it, and I couldn’t. So I ran.',
        choices: [
          { text: 'Why couldn’t you?', to: 'why' },
          { text: 'She’s back. She rode out of the Dimming.', to: 'back' },
        ],
      },
      why: { speaker: SG, text: 'Because I saw who was wearing it. (He shuts his eyes.) She broke nothing. She kept her oath to the letter. I broke mine because she kept hers to someone else. Make sense of that, Oathbound. I’ve had thirty years and I can’t.', next: 'choose' },
      back: { speaker: SG, mood: 'afraid', text: 'Back? Then she’s kept it still. Thirty years in the dark, and kept it. (He shuts his eyes.) I broke mine because she kept hers to someone else. Make sense of that, Oathbound.', next: 'choose' },
      choose: {
        speaker: SG, text: 'You could release me. A sworn knight can, from an oath to a lord who has fallen. Or you could hold me to my word, and I’ll follow you, the way I swore to follow her.',
        choices: [
          { text: 'I release you, Ser Gallant. Rest.', to: 'released', effects: [{ setFlag: 'oathbound.gallant', value: 'released' }] },
          { text: 'I hold you to your word. Follow me, and see it kept.', to: 'held', effects: [{ setFlag: 'oathbound.gallant', value: 'held' }] },
        ],
      },
      released: { speaker: SG, text: '(He takes his sword off, and lays it across the altar, and sits beside it.) Thank you. I think I’ll just stay here a while. It’s quiet, now. The night-touched can stay too. Tell them I don’t snore.', next: null },
      held: { speaker: SG, text: '(He gets up. It takes a long time.) Then I follow. Behind you, at a distance, the way a squire does. Don’t look round too often. It makes me nervous.', next: null },
      after: { speaker: SG, text: 'It’s settled. Go and find her. She’s waiting for you at the edge of the dark. She always waited for me there, too.', next: null },
    },
  },
  // ---------- I-7 To Whoever Wears It
  {
    id: 'dialogue:oathbound-ilsabet-turn', name: 'I-7 Ilsabet in the Dimming', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: IL, text: 'You beat Gallant. Good. Poor Gallant, he always did fall down before he was hit. Sit with me. The dark here is very restful, once you stop expecting it to bite.', next: 'oath' },
      oath: {
        speaker: IL, text: 'I’ll tell you plainly, because you’re Oathbound and you deserve it plain. I have sworn fealty to the Hollow King. On the night of the 85th Turning, in the Citadel, I knelt to the crown, and I have kept that oath every day since.',
        choices: [
          { text: 'The Hollow King isn’t the crown.', to: 'crown' },
          { text: 'Your ring was turned inward when you rode out of the Dimming.', to: 'ring', when: { insight: 'ring_turned' } },
          { text: 'Gallant broke his oath rather than kneel with you.', to: 'gallant' },
        ],
      },
      ring: { speaker: IL, mood: 'happy', text: 'You saw. Good. A knight should notice rings. Yes: turned inward, the sun to the palm, for an oath to a fallen lord. I’m not ashamed of it. I keep it turned so I’ll feel it every time I close my hand.', next: 'crown' },
      gallant: { speaker: IL, mood: 'sad', text: 'He did. And it has kept him alive and miserable for thirty years. That is what a broken oath does. I am not miserable, Oathbound. I am exactly where I swore to be.', next: 'crown' },
      crown: { speaker: IL, text: 'An oath to the crown is an oath to whoever wears it. That is what the words say. I didn’t choose who would wear it. I only chose to keep my word.', next: 'stone' },
      stone: {
        speaker: IL, text: 'The crown should have its stones back. You know that. And you’re Oathbound: your oath is to the crown too, whether you like who’s under it or not. Bring me the March half. Or I’ll take it from the Shrine, and ask your pardon afterwards.',
        choices: [
          { text: 'I swore to the March, not to him.', to: 'march' },
          { text: '[Radiance] An oath that only says yes isn’t an oath. It’s a leash.', to: 'leash', school: 'radiance' },
        ],
      },
      march: { speaker: IL, text: 'Then we’ve sworn different things, and we’ll meet in the Shrine, and the better knight will have the stone. By the rules. I’ll be glad of it, honestly. Nobody has fought me fairly in thirty years.', next: null },
      leash: { speaker: IL, mood: 'sad', text: '(For a moment she looks very tired.) Perhaps. But I put it on myself, and I can feel it, and nobody else ever has to. We’ll meet in the Shrine. By the rules.', next: null },
    },
  },
  {
    id: 'dialogue:oathbound-beatrix-turn', name: 'I-7 Beatrix hears it', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: BH, mood: 'angry', text: 'To him. To the man in the Citadel. She knelt to him. (She puts her fist against the wall, not hard.) Of course she did. She swore to the crown, and she’s never once in her life left an oath half kept.',
        choices: [
          { text: 'She says she’ll fight me fairly for the stone.', to: 'fair' },
          { text: 'You couldn’t have stopped her, Marshal.', to: 'stop', trust: 1 },
          { text: 'She left a letter in her camp. To you. One line: “Bea, I kept it.”', to: 'letter', when: { flag: 'oathbound.ilsabet_letter' } },
        ],
      },
      letter: { speaker: BH, mood: 'sad', text: '(She takes it, and reads it, and reads it again, and folds it into the cuff of her gauntlet.) “I kept it.” Thirty years, and that is what she has to tell me. That she kept it. As if I ever doubted she would.', next: 'stop' },
      stop: { speaker: BH, mood: 'sad', text: 'I could have been there. That’s a different thing. (A breath.) Never mind that now.', next: 'fair' },
      fair: { speaker: BH, text: 'She will. She’ll tell you every blow before she throws it, because that’s the rule, and she’ll still be faster than you. Listen to what she says, not what she does. Go to the Shrine. Get there first.', next: null },
    },
  },
  // ---------- I-8 The Dimming Shrine
  {
    id: 'dialogue:oathbound-ilsabet-challenge', name: 'I-8 Ilsabet’s challenge', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: IL, text: 'In the first dark of the March, by the old rules: I, Ilsabet of the Sorrow-Oath, challenge you for the March half, to yield or to the fall. I will name every blow before I strike it. Do you accept?',
        choices: [
          { text: '(Salute, and accept.)', to: 'fair', effects: [{ setFlag: 'oathbound.challenge', value: 'accepted' }] },
          { text: 'There aren’t any rules in the dark, Dame.', to: 'dark', effects: [{ setFlag: 'oathbound.challenge', value: 'refused' }] },
        ],
      },
      fair: { speaker: IL, mood: 'happy', text: 'Thank you. High guard, then. First blow: from the left, at the shoulder. Now.', next: null },
      dark: { speaker: IL, mood: 'sad', text: 'There are always rules. Some of us just keep them alone. First blow: from the left, at the shoulder. Now.', next: null },
    },
  },
  {
    id: 'dialogue:oathbound-ilsabet-yields', name: 'I-8 Ilsabet yields', scope: 'party',
    entries: [{ when: { not: { flag: 'oathbound.yield' } }, node: 'yield' }, { node: 'after' }],
    nodes: {
      yield: {
        speaker: IL, text: '(She goes down on one knee and lays her sword flat across it.) I yield. Formally, before witnesses, if the dark will serve as one. The field is yours, and the March half with it. By the rules, it is.',
        choices: [
          { text: 'I accept your yield, Dame Ilsabet.', to: 'accepted', effects: [{ setFlag: 'oathbound.yield', value: 'accepted' }] },
          { text: '(Strike her while she kneels.)', to: 'struck', effects: [{ setFlag: 'oathbound.yield', value: 'struck' }, { setFlag: 'oathbound.fought_foul', value: true }] },
        ],
      },
      accepted: { speaker: IL, mood: 'happy', text: 'Thank you. That was well fought, and better kept. (She stands, and sheathes, and bows.) I yielded the field. Not the road. I’ll see you at the Dawn Gate, Oathbound.', next: 'ride' },
      struck: { speaker: IL, mood: 'sad', text: '(The blow rings off her pauldron. She does not lift her sword.) A yielded knight. In the dark. (She stands, slowly.) I’ll remember that. I remember everything. I yielded the field, Oathbound. Not the road.', next: 'ride' },
      ride: { speaker: 'narrator', text: 'She walks out of the Shrine into the dark without hurrying, and a moment later you hear a grey horse going away east at a canter, towards the Dawn Gate.', next: null },
      after: { speaker: 'narrator', text: 'Hoofbeats, far off, going east.', next: null },
    },
  },
  {
    id: 'dialogue:obj-radiance-frontier-halfstone', name: 'I-8 the March half', scope: 'party',
    entries: [{ when: { questStage: 'quest:oathbound-the-dimming-shrine', stage: 'stone' }, node: 'claim' }, { node: 'stone' }],
    nodes: {
      claim: { speaker: 'narrator', text: 'On the Shrine’s stone, in the first dark of the March, lies half of a crystal, cracked clean across, singing. It is the only light in the place. Ilsabet has gone, but her hoofbeats are still going away east, steady as a drum.', next: 'kneel' },
      kneel: {
        speaker: 'narrator', text: 'Round the stone, cut into the floor, are the words of a vow too worn to read, and in front of it a hollow in the stone where a great many knights have knelt.',
        choices: [
          { text: '(Kneel where they knelt.)', to: 'knelt' },
          { text: '(Take the stone standing.)', to: 'stand' },
          { text: '(Say your vigil words again, out loud, to the stone.)', to: 'words', school: 'radiance' },
        ],
      },
      knelt: { speaker: 'narrator', text: 'Your knees go into the hollow as if it were cut for them. You can feel, through the stone, every knight who knelt here before you, and every one of them was afraid, and every one of them stood up again.', next: 'lift' },
      stand: { speaker: 'narrator', text: 'You stay on your feet. Ilsabet knelt to a crown. You will not kneel to a stone. The half-stone seems, oddly, to approve: its note lifts a little, the way a horse lifts its head.', next: 'lift' },
      words: { speaker: 'narrator', text: '“And I shall keep…” You finish the line the way you finished it in the Hall, in your own words, to nobody but the dark. The half-stone sings them back to you, note for note, as if it had been listening at the vigil too.', next: 'lift' },
      lift: { speaker: 'narrator', text: 'It comes up off the stone into your hand as if it had been waiting for exactly that hand. It feels like a promise being kept.', next: 'dark' },
      dark: {
        speaker: 'narrator', text: 'And the Shrine is not dark any more. The half-stone’s light goes up the walls, and on every one of them, carved by the knights of a thousand years, there are stars: the whole night sky, cut into the stone by people who could still see it.',
        choices: [
          { text: '(Look for the Passing, the crown between two hands.)', to: 'passing', when: { insight: 'passing_crown' } },
          { text: '(Go after the hoofbeats.)', to: null },
        ],
      },
      passing: { speaker: 'narrator', text: 'There, low on the east wall, two hands and a crown between them, going from the one to the other. Somebody has knelt under it so often that the floor is worn into a groove. You think you know who. She always waited at the edge of the dark.', next: null },
      stone: { speaker: 'narrator', text: 'The bare stone of the Dimming Shrine, with a pale mark on it where something rested for thirty years.', next: null },
    },
  },
  // ---------- I-9 The March Road (mentor farewell; trust check)
  {
    id: 'dialogue:oathbound-beatrix-farewell', name: 'I-9 Beatrix’s farewell', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: BH, text: 'She yielded you the field and took the road. Of course she did. Well. You have the stone and she has the gate, and I’m too old to ride through either. I’ll take you as far as the March goes.',
        choices: [
          { text: 'Ride through with me.', to: 'stay' },
          { text: 'Thank you, Marshal. For swearing me.', to: 'gift', trust: 1 },
        ],
      },
      stay: { speaker: BH, text: 'I swore to hold the March. I broke one promise in my life by keeping that one. I won’t break it now to make up for the other. No.', next: 'gift' },
      gift: {
        speaker: BH, text: 'Here.',
        choices: [
          { text: '(Take the ring from her hand.)', to: 'ring', when: { trust: BH, value: 'friendly' } },
          { text: '(Salute her.)', to: 'salute', when: { not: { trust: BH, value: 'friendly' } } },
        ],
      },
      ring: { speaker: BH, text: 'My oath-ring. Sun outward, the way it should be worn. If you ever have to turn it, think of me first, and then don’t.', effects: [{ giveItem: 'i_beatrix_oath_ring' }, { setFlag: 'oathbound.beatrix_ring', value: true }], next: 'release' },
      release: {
        speaker: BH, text: 'And one more thing.',
        choices: [
          { text: '(Wait.)', to: 'released', when: { trust: BH, value: 'trusted' } },
          { text: '(Nod, and turn your horse.)', to: 'order', when: { not: { trust: BH, value: 'trusted' } } },
        ],
      },
      released: { speaker: BH, mood: 'sad', text: 'You swore to Oathkeep in my Hall. I release you from it. Not from the March, not from your own words. From me. So that what you keep from here, you keep freely, and nobody can ever say you kept it because you were told.', effects: [{ setFlag: 'oathbound.released', value: true }], next: 'words' },
      words: { speaker: BH, text: 'And I shall keep. You finished that line in your own words, at the vigil. I wrote them down. I’ll be reading them to you again one day, so you’d better have kept them.', next: 'order' },
      salute: { speaker: BH, text: 'Mind the road. Mind the Hierarch. Mind her.', next: 'order' },
      order: {
        speaker: BH, text: 'Now. The Order.',
        choices: [
          { text: 'Ride with me to the gate.', to: 'ride', when: { not: { flag: 'oathbound.decree', value: 'decree' } } },
          { text: 'Keep the Dawnspire road. We swore to.', to: 'guard', when: { flag: 'oathbound.decree', value: 'decree' } },
        ],
      },
      ride: { speaker: BH, mood: 'happy', text: 'Oathkeep rides! (Behind her, all down the March road, the knights of the Order mount at once, as if they had been waiting all night for the word.)', next: 'lampwick' },
      guard: { speaker: BH, text: 'Then we keep it. The Order stays on the Dawnspire road, and you ride on alone. That’s what we swore to. I hope it was worth it.', next: 'lampwick' },
      lampwick: {
        speaker: 'narrator', text: 'At the edge of Oathkeep, someone is shouting your name.',
        choices: [
          { text: '(Look.)', to: 'cheer', when: { flag: 'oathbound.lampwick_saved' } },
          { text: '(Ride on.)', to: null, when: { not: { flag: 'oathbound.lampwick_saved' } } },
        ],
      },
      cheer: { speaker: 'narrator', text: 'The whole of Lampwick has walked over in the dark to see you off, every one of them carrying a candle they didn’t need, and they cheer you all the way down the first mile of the March road.', next: null },
    },
  },
  // ---------- I-10 The Dawn Gate (March side)
  {
    id: 'dialogue:oathbound-hierarch-kneel', name: 'I-10 the Hierarch commands', scope: 'party',
    entries: [{ node: 'one' }],
    nodes: {
      one: {
        speaker: 'narrator', text: 'The Fallen Hierarch stands in the Dawn Gate in his golden mask, and when he speaks the whole road shakes with light. KNEEL, Oathbound. You are sworn to me.',
        choices: [{ text: '(Hold your guard.) No.', to: 'two' }],
      },
      two: {
        speaker: 'narrator', text: 'KNEEL. Your knees are bending. Your shield arm is coming down. Every oath you ever swore is pulling at you like a hand on your collar.',
        choices: [{ text: '(Hold your guard.) No.', to: 'three' }],
      },
      three: {
        speaker: 'narrator', text: 'KNEEL. And under the command, very small, a man’s voice behind the mask: please.',
        choices: [{ text: '(Hold your guard, and raise your sword.) No.', to: 'fight' }],
      },
      fight: { speaker: 'narrator', text: 'The compulsion breaks like a rope. The Hierarch reels back into his own light, and you can strike.', next: null },
    },
  },
];

export default dialogues;
