/** Hollow Crown, STORMLANCER Act I main dialogues (the Thunderclap Heights). Owner: Claude 4. */
import type { DialogueDef, NarrativeCondition } from '@/core';

type Q = `quest:${string}`;
const stage = (q: Q, s: string): NarrativeCondition => ({ questStage: q, stage: s });
const OG = 'npc:odran-gale' as const, CV = 'npc:cass-vantor' as const;

const dialogues: DialogueDef[] = [
  // ---------- I-1 The Bell in the Chimes
  {
    id: 'dialogue:stormlancer-chimes-night', name: 'I-1 the Bell in the chimes', scope: 'party',
    entries: [{ node: 'night' }],
    nodes: {
      night: { speaker: 'narrator', text: 'Night on the Ram Pastures. Wind in the long slate grass, a thousand wind-chimes on a thousand steadings, the herd asleep in the hollow under the Heights. Somewhere very far away, a bell rings once.', next: 'chimes' },
      chimes: { speaker: 'narrator', text: 'Every chime on the Heights rings with it, all at once, the same note. And three hundred Storm Rams wake up at the same moment, decide that this is the end of the world, and run.', next: 'run' },
      run: { speaker: 'narrator', text: 'You are on the nearest ram’s back before you have quite decided to be, no saddle, no bridle, a fistful of wool in each hand. Under your ribs, something has started to sing.', next: null },
    },
  },
  {
    id: 'dialogue:stormlancer-odran-bell', name: 'I-1 Odran arrives last', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: OG, text: '(He is walking up the slope, on foot, at a stroll, with his hands in his pockets. Behind him his ram, Old Biddy, is grazing in entirely the wrong direction.) Turned them, then. Good. Thought I’d let you go first.',
        choices: [
          { text: 'You walked? The whole herd was stampeding!', to: 'walked' },
          { text: 'Something in my chest is singing.', to: 'sing' },
        ],
      },
      walked: { speaker: OG, text: 'Biddy threw me at the first chime. She’s very consistent. Besides, a herd stops in the end. They always stop. It’s only a question of who’s in front when they do. (He looks at you.) That was you.', next: 'sing' },
      sing: {
        speaker: OG, text: 'Singing. (He takes a long time over the next bit.) Half the Storm Stone came down in the Eye of the storm, the night the crown broke. The old riders said it would call somebody, one day. Didn’t think it’d call somebody who rides without a bridle.',
        choices: [
          { text: 'What do I do?', to: 'do', trust: 1 },
          { text: 'Is it calling Cass too?', to: 'cass' },
        ],
      },
      cass: { speaker: OG, mood: 'sad', text: 'Cass rode into that storm a month ago and her ram came home without her. If it was calling her, she didn’t hear it right. (A pause.) Sorry, pup. I know.', next: 'do' },
      do: { speaker: OG, text: 'Tonight? Three rams broke the wrong way at the first chime, towards the storm. Fetch them back for me before they find the edge. Then come up to the steading. Kettle’s on. No hurry. Well. Some hurry.', next: null },
    },
  },
  // ---------- I-2 Reading the Sky
  {
    id: 'dialogue:obj-lightning-pattern-stones', name: 'I-2 the pattern-stones', scope: 'party',
    entries: [{ when: stage('quest:stormlancer-reading-the-sky', 'stones'), node: 'read' }, { node: 'stones' }],
    nodes: {
      read: { speaker: 'narrator', text: 'A ring of flat stones on the open Heights, each one scorched where a strike has hit it, for a thousand years. Every lancer learns the pattern as a child: the strikes walk across the Heights from north to south, like a man pacing.', next: 'wrong' },
      wrong: { speaker: 'narrator', text: 'Not any more. The newest scorches are black, and they do not walk. They circle, tighter every night, round the hollows where the herds graze. The storm is not pacing. It is hunting.', next: null },
      stones: { speaker: 'narrator', text: 'The lightning pattern-stones of the Thunderclap Heights, scorched by a thousand years of strikes.', next: null },
    },
  },
  {
    id: 'dialogue:stormlancer-odran-sky', name: 'I-2 report on the sky', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: OG, text: 'Circling. Round the grazing. (He lies down in the grass, which he does when he’s thinking, and looks at the clouds for a long time.) Hunting, then. Storms don’t hunt.',
        choices: [
          { text: 'This one does.', to: 'does' },
          { text: 'Are you all right down there?', to: 'down', trust: 1 },
          { text: 'The black strikes circle the grazing, and ram tracks run up out of the circle towards the crag.', to: 'tracks', when: { flag: 'stormlancer.ram_tracks' } },
        ],
      },
      tracks: { speaker: OG, mood: 'afraid', text: '(He sits up, which for Odran is very fast.) Up to the crag. Hoofprints that big are only the Ram King’s. Then he isn’t running from the storm, pup. He’s going to meet it, and taking the herd along to be polite.', next: 'does' },
      down: { speaker: OG, text: 'Never better. Ground’s the one thing on the Heights that never throws you. Now: storms don’t hunt.', next: 'does' },
      does: { speaker: OG, mood: 'sad', text: 'And the herd-king’s gone strange. The Ram King. Every night he leads a few more of them up the crag and off the edge into the storm. The clan wants him killed. Go up the crag, pup. See what he’s fighting. I don’t think it’s us.', next: null },
    },
  },
  // ---------- I-3 The Ram King's Crag
  {
    id: 'dialogue:obj-crag-herd-edge', name: 'I-3 the herd at the edge', scope: 'party',
    entries: [{ when: stage('quest:stormlancer-the-ram-kings-crag', 'herd'), node: 'edge' }, { node: 'crag' }],
    nodes: {
      edge: {
        speaker: 'narrator', text: 'The Ram King lies on the crag, the black lightning gone out of his horns at last. His herd stands at the very edge, forty rams, looking at the storm, waiting for a leader to tell them where to go.',
        choices: [
          { text: '(Stand in front of them, and walk away from the edge.)', to: 'lead' },
          { text: '(Lay your lance across the Ram King’s horns, the old honour, before you lead them.)', to: 'honour', school: 'storm' },
        ],
      },
      honour: { speaker: 'narrator', text: 'You lay your lance across his horns. He was fighting for them all along, just the wrong way. Forty rams watch you do it, and then, one by one, they turn from the edge.', next: 'lead' },
      lead: { speaker: 'narrator', text: 'You walk away from the edge, and the herd follows you down off the crag, slowly at first, then all at once, the way a herd does everything.', next: null },
      crag: { speaker: 'narrator', text: 'The Ram King’s Crag, empty now, with the wind going over it.', next: null },
    },
  },
  {
    id: 'dialogue:stormlancer-odran-crag', name: 'I-3 the herd is safe', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: OG, mood: 'happy', text: 'Forty rams, and none of them over the edge. The clan’s talking about you down at the Chime Yard. Mostly how you didn’t wait for anybody. You never did.',
        choices: [{ text: 'He wasn’t evil. He was trying to lead them somewhere safe.', to: 'safe', trust: 1 }, { text: 'Someone had to go up.', to: 'up' }],
      },
      safe: { speaker: OG, text: 'Aye. The tears tell you the worst is coming, and then you do something daft to beat it there. Seen that before. (He looks away, east, across the Heights.) Seen it recently.', next: 'streak' },
      up: { speaker: OG, text: 'Someone always does. Usually it’s the one who should’ve waited.', next: 'streak' },
      streak: { speaker: OG, text: 'Now. The herders on the Heights saw something this morning. Faster than any ram, they said. On foot, they said. Laughing. Go and look, pup. And when you see what it is, don’t go too fast.', next: null },
    },
  },
  // ---------- I-4 Catch Her
  {
    id: 'dialogue:stormlancer-cass-streak', name: 'I-4 Cass on the Heights', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: CV, mood: 'happy', text: 'You came! I knew you’d come! I’ve been round the Heights eleven times since dawn waiting for you to get up. (Cass Vantor, alive, laughing, with black tears streaking back off her face and never landing.) You look slow. You always looked slow.',
        choices: [
          { text: 'Cass. You’re alive.', to: 'alive' },
          { text: 'Your tears aren’t falling.', to: 'tears' },
        ],
      },
      tears: { speaker: CV, text: 'Nothing falls when you’re fast enough. Nothing lands. Nothing catches up. Isn’t it wonderful? (She is already pacing, side to side, unable to keep still.)', next: 'alive' },
      alive: {
        speaker: CV, text: 'More than alive. I rode into the storm and the storm let me out faster. Look. (She is ten yards away, then back, without seeming to move.) You couldn’t catch me then. You definitely can’t now.',
        choices: [{ text: 'The Thunderclap Run. You and me. Now.', to: 'run', quest: true }, { text: 'Thistle came home without you.', to: 'thistle' }],
      },
      thistle: { speaker: CV, text: '(For a moment, the smallest moment, she goes still. Then she laughs.) Thistle was slow. Everything’s slow. Race me. The Run. Come on.', next: 'run' },
      run: { speaker: CV, mood: 'happy', text: 'The Run! Three posts and back. Go! Go, go, go!', next: null },
    },
  },
  {
    id: 'dialogue:obj-thunderclap-run-post-1', name: 'I-4 the first run-post',
    entries: [{ when: stage('quest:stormlancer-catch-her', 'run'), node: 'post' }, { node: 'still' }],
    nodes: {
      post: { speaker: 'narrator', text: 'You round the first post at a flat gallop. There are scorch-marks round it already, still smoking: Cass has been round it twice while you were getting there.', next: null },
      still: { speaker: 'narrator', text: 'A weathered post on the Thunderclap Run, scorched all the way round.', next: null },
    },
  },
  {
    id: 'dialogue:stormlancer-cass-run', name: 'I-4 Cass at the finish', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: CV, mood: 'happy', text: 'By a mile! A mile! I had time to sit down! (She doesn’t sit down. She can’t.) Oh, I’ve missed this. Come with me. We can outrun all of it, the storm, the tears, the clans, all of it. Nobody will ever catch either of us.',
        choices: [
          { text: 'What are you running from, Cass?', to: 'from' },
          { text: 'I can’t keep up with you any more.', to: 'keep' },
        ],
      },
      from: { speaker: CV, text: 'From? I’m not running from. I’m running. That’s all there is now. If you stop, it catches you. Everyone knows that.', next: 'charge' },
      keep: { speaker: CV, mood: 'sad', text: 'You never could. That was the best thing about you. (She laughs, but it goes wrong in the middle.) Never mind.', next: 'charge' },
      charge: { speaker: CV, text: 'The young lancers want to charge the storm. The old law. I said I’d lead them. See you at the muster, slow one. Try to be on time.', next: null },
    },
  },
  // ---------- I-5 The Great Charge (faction choice; a party vote)
  {
    id: 'dialogue:stormlancer-great-charge', name: 'I-5 the clan muster', scope: 'party',
    entries: [{ when: { not: { flag: 'stormlancer.charge' } }, node: 'yard' }, { node: 'after' }],
    nodes: {
      yard: { speaker: 'narrator', text: 'The Chime Yard, every clan of the Heights mounted and milling, three hundred rams, a thousand chimes all ringing the same wrong note. At the front, Cass, on foot, bouncing. Behind her, the young lancers, lances up.', next: 'tamar' },
      tamar: { speaker: 'npc:tamar-mallory', mood: 'happy', text: 'The old law! When a storm won’t pass, the clans charge it! Cass rode in alone and came out faster than anyone! Charge it! Charge it! (The young lancers roar.)', next: 'odran' },
      odran: { speaker: OG, text: '(Sitting on a fence, slowly, at the back.) Lot of shouting. Let the one with the stone speak. Go on, pup. Your turn. Take your time.', next: 'voices' },
      voices: {
        speaker: 'narrator', text: 'Three hundred rams shift and blow. The chimes ring their one wrong note. Every rider in the yard is looking at you, and Cass is looking at nobody at all, bouncing on her toes at the gate.',
        choices: [
          { text: '(Let Gwenna Fold speak for the herds.)', to: 'gwenna', when: { flag: 'stormlancer.gwenna_asked' } },
          { text: '(Look at Cass.)', to: 'cass' },
          { text: '(Speak.)', to: 'choose' },
        ],
      },
      gwenna: { speaker: 'npc:gwenna-fold', text: '(Not loud, but the yard hears it.) Charge, and I lose a third of the herd to the storm and a third to panic. Shelter, and I lose the grazing for a season. Either way, I’m the one who counts what’s left. Pick the one with more left.', next: 'choose' },
      cass: { speaker: CV, mood: 'hollow', text: '(She doesn’t look back at you. She is staring at the storm as if it were the finish post.) Come on. Come on, come on, come on. Say charge. Say it, slow one, and we can go.', next: 'choose' },
      choose: {
        speaker: OG, text: 'Well? Is it brave to go first?',
        choices: [
          { text: 'Charge. The old law is the old law. We ride with Cass.', to: 'charged', quest: true, trust: -1, effects: [{ setFlag: 'stormlancer.charge', value: 'charged' }] },
          { text: 'Bring the herds down into Skyfall Gorge. Leave the Heights to the storm until it passes.', to: 'sheltered', quest: true, effects: [{ setFlag: 'stormlancer.charge', value: 'sheltered' }] },
          { text: 'Neither. We ride the wake. Behind the storm, not into it, the way the oldest riders did.', to: 'wake', quest: true, insight: 'wake_ridden', when: { insight: 'ride_the_wake' }, effects: [{ setFlag: 'stormlancer.charge', value: 'wake' }] },
        ],
      },
      charged: { speaker: CV, mood: 'happy', text: 'YES! (She is gone before anyone else has moved, and the young lancers stream after her towards the storm’s edge, roaring.) (On the fence, Odran looks at his hands, and does not get up.)', next: null },
      sheltered: { speaker: 'npc:tamar-mallory', mood: 'angry', text: 'Hide? In the gorge? Like sheep? (The young lancers jeer. Cass just laughs, and is gone across the Heights alone.) Slow. You were always slow.', next: null },
      wake: { speaker: 'narrator', text: 'The clans ride out behind the storm instead of into it, wind at their backs, the lightning already fallen ahead of them, and lose nobody. On a ridge, Cass stops dead, and watches them go, and for one moment she looks as if she wants to follow.', next: 'wake2' },
      wake2: { speaker: OG, mood: 'happy', text: '(Behind you, on Old Biddy, for once.) Well, look at that. Took us a thousand years to remember how to go second.', next: null },
      after: { speaker: OG, text: 'The clans have done what they’ve done. Now we live with it, at whatever speed we can manage.', next: null },
    },
  },
  // ---------- I-6 Old Clatterwing
  {
    id: 'dialogue:obj-aerie-fledglings', name: 'I-6 the fledglings home', scope: 'party',
    entries: [{ when: stage('quest:stormlancer-old-clatterwing', 'fledglings'), node: 'nest' }, { node: 'empty' }],
    nodes: {
      nest: { speaker: 'narrator', text: 'You tip the fledglings out of your cloak into the great nest of the Aerie. Old Clatterwing lies beside it, the black moulted out of her feathers at last. One fledgling climbs under her wing, and she lifts it, a little, to let it in.', next: null },
      empty: { speaker: 'narrator', text: 'The Thunderbird Aerie, crackling quietly, full of sleeping fledglings.', next: null },
    },
  },
  // ---------- I-7 Faster Than Grief
  {
    id: 'dialogue:stormlancer-cass-grief', name: 'I-7 Cass on the Eyrie Steps', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: CV, text: '(She is standing still on the Eyrie Steps. It looks like it hurts.) Don’t laugh. I wanted you to see it. I can do it for about a minute. Then it starts to catch up.',
        choices: [
          { text: 'What catches up?', to: 'catch' },
          { text: 'What do you want, Cass?', to: 'want' },
        ],
      },
      catch: { speaker: CV, mood: 'sad', text: 'Everything. Every slow thing. That’s why I don’t stop. That’s why nobody should.', next: 'want' },
      want: {
        speaker: CV, text: 'The Eye of the Storm. The only still place in Thunderreach, and the Eye half’s lying in it. With it I could carry the Eye inside me. Still, inside, and fast outside, for ever. Nothing would ever catch me. Not even the tears.',
        choices: [
          { text: 'Then why haven’t you taken it?', to: 'why' },
          { text: 'You still wear Thistle’s bridle at your belt. You’ve never once asked how she is.', to: 'bridle', insight: 'cass_bridle', when: { any: [{ flag: 'stormlancer.thistle_fed' }, { questCompleted: 'quest:stormlancer-thistle-wont-eat' }] } },
        ],
      },
      bridle: { speaker: CV, mood: 'hollow', text: '(Her hand goes to her belt, to the old blue bridle hanging there, and stays.) Don’t. Don’t, don’t. If you stop to look back, it catches you. I left her in the storm. I heard her. I didn’t look back. That’s how I got out.', next: 'why' },
      why: {
        speaker: CV, text: 'The Eye only opens to someone who can stop. I can’t stop. (She is moving again, pacing, faster.) But you can. You were always so good at it. Ride in, slow one. Stop in the middle. I’ll be right behind you.',
        choices: [{ text: 'I’m not taking it for you.', to: 'not' }, { text: '…', to: 'not' }],
      },
      not: { speaker: CV, mood: 'happy', text: 'You won’t have to. Just stop, in there, for once in your life where it matters. See you in the Eye! (And she is gone, down three hundred and four steps in about four seconds.)', next: null },
    },
  },
  {
    id: 'dialogue:stormlancer-odran-grief', name: 'I-7 Odran on Cass', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: OG, text: 'She wants the Eye. (He sits down on his doorstep, very slowly.) Course she does. The only still place in Thunderreach, and she can’t get into it, because she can’t stop. And you can.',
        choices: [
          { text: 'She says if you stop, it catches you.', to: 'catch' },
          { text: 'She left Thistle in the storm, Odran. She heard her.', to: 'thistle', when: { insight: 'cass_bridle' } },
          { text: 'She carved her own name on the Brave Stone the day before she rode in. And Thistle’s under it.', to: 'stone', when: { flag: 'stormlancer.brave_stone' } },
        ],
      },
      stone: { speaker: OG, mood: 'sad', text: 'Carved it herself. (He shuts his eyes.) She always said she’d be on that stone. Never said she’d put herself there. And the ram under her name, like she knew one of them wouldn’t come home. She just picked the wrong one.', next: 'catch' },
      thistle: { speaker: OG, mood: 'sad', text: 'Ah. (A long silence.) That’s what she’s outrunning, then. Not the tears. Turning round. She never could bear turning round. Not even in the Run.', next: 'catch' },
      catch: { speaker: OG, text: 'It does catch you. She’s right about that. Everybody gets caught. The trick’s letting it, and still being there after. Go into the Eye, pup. Stop in the middle. Let her come to you.', next: null },
    },
  },
  // ---------- I-8 The Eye of the Storm
  {
    id: 'dialogue:stormlancer-eye-words', name: 'I-8 the silent Eye', scope: 'party',
    entries: [{ node: 'eye' }],
    nodes: {
      eye: { speaker: 'narrator', text: 'You ride into the storm until there is nothing but wind and black rain and noise. Then, in the middle of it, you stop. And the storm opens round you like a hand, and you are standing in the Eye: silent, still, blue, a single star overhead.', next: 'cass' },
      cass: { speaker: CV, mood: 'hollow', text: '(A streak of lightning across the silence, and Cass is standing at the edge of the Eye, shaking, unable to step in.) You did it. You stopped. Now hold it there. Just hold it there and I’ll come in behind you.', next: 'choose' },
      choose: {
        speaker: CV, text: 'Pick it up. Give it to me. Please.',
        choices: [
          { text: '(Brace your lance, and wait.)', to: 'brace' },
          { text: 'Come in yourself, Cass. Stop.', to: 'stop' },
        ],
      },
      brace: { speaker: 'narrator', text: 'You set the butt of your lance in the still ground and the point at the edge of the Eye, and you wait. She can’t bear it. She comes.', next: null },
      stop: { speaker: CV, mood: 'hollow', text: 'I CAN’T! (And she comes at you in a line of black lightning, faster than anything alive.)', next: null },
    },
  },
  {
    id: 'dialogue:obj-storm-frontier-halfstone', name: 'I-8 the Eye half', scope: 'party',
    entries: [{ when: stage('quest:stormlancer-the-eye-of-the-storm', 'stone'), node: 'claim' }, { node: 'still' }],
    nodes: {
      claim: { speaker: 'narrator', text: 'In the silent centre of the Eye, on bare stone, lies half of a crystal, cracked clean across. It is the only thing in Thunderreach that is perfectly still. Cass is on her knees at the edge of the Eye, getting her breath, watching it.', next: 'wait' },
      wait: {
        speaker: 'narrator', text: 'Round you the storm goes on, a wall of noise a hundred yards away on every side. In here you can hear your own heart, and hers.',
        choices: [
          { text: '(Pick it up.)', to: 'take' },
          { text: '(Wait. Let her see you stop.)', to: 'stand' },
          { text: '(Hold out Thistle’s blanket-thread to her.)', to: 'thread', when: { flag: 'stormlancer.thistle_called' } },
        ],
      },
      stand: {
        speaker: 'narrator', text: 'You stand in the middle of the Eye and do nothing at all. It is the hardest thing you have ever done. Cass watches you do it, and her hands, for one moment, stop shaking.',
        choices: [{ text: '(Now pick it up.)', to: 'take', effects: [{ setFlag: 'stormlancer.eye_waited', value: true }] }],
      },
      thread: { speaker: CV, mood: 'sad', text: '(You hold up a blue thread from Thistle’s blanket. She stares at it.) She went to the edge. Didn’t she. She went to the edge and called. (A long, shaking breath.) I heard something. Out on the Heights. I didn’t stop.', next: 'take' },
      take: { speaker: 'narrator', text: 'It is warm in your hand. It feels like holding someone’s hand, someone who has been holding very still for a very long time and is glad to be let go of.', next: 'cass' },
      cass: {
        speaker: CV, mood: 'hollow', text: '(From the edge of the Eye, already turning.) Keep it still for me, slow one! I’ll see you at the Copper Gate! (And she is gone, out of the Eye, across the Heights, towards the gate, before you can even turn round.)',
        choices: [
          { text: '(Don’t chase her.)', to: 'stay' },
          { text: 'Cass! Thistle’s waiting!', to: 'call' },
        ],
      },
      stay: { speaker: 'narrator', text: 'You don’t chase her. Nobody has ever caught Cass Vantor by chasing her. Overhead, the single star in the Eye begins, very slowly, to be covered by cloud, as the storm closes up behind her.', next: null },
      call: { speaker: 'narrator', text: 'The shout goes out of the Eye and into the storm and is torn to pieces. Far off across the Heights the black streak that is Cass does not slow down. But it swerves, once, as if something had touched its sleeve.', next: null },
      still: { speaker: 'narrator', text: 'The bare stone at the centre of the Eye, and above it, one star.', next: null },
    },
  },
  // ---------- I-9 The Long Ride Down (mentor farewell; trust check)
  {
    id: 'dialogue:stormlancer-odran-farewell', name: 'I-9 Odran’s farewell', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: OG, text: 'Riding down with you. Don’t argue. It’ll take a while. Biddy doesn’t like the cliff road, and I don’t like Biddy on the cliff road. (They set off. It does take a while.)',
        choices: [
          { text: 'Thank you, Lancemaster. For giving me time.', to: 'gifts', trust: 1 },
          { text: 'Your name is the oldest on the Coward’s Cairn.', to: 'cairn', when: { flag: 'stormlancer.cairn_asked' } },
          { text: 'You should have charged with them.', to: 'charged', when: { flag: 'stormlancer.charge', value: 'charged' } },
        ],
      },
      cairn: { speaker: OG, mood: 'happy', text: 'Best thing I ever did, going on that cairn. Maudie used to say I was the only coward on the Heights with a wife to show for it. Don’t let them carve you on the Brave Stone, pup. It’s cold up there.', next: 'gifts' },
      charged: { speaker: OG, mood: 'sad', text: 'Three of them came back fast and wrong, like her. I’m old, pup. Somebody has to stay behind and count who comes home. That’s a job too.', next: 'gifts' },
      gifts: {
        speaker: OG, text: 'Here. Before the gate. No hurry.',
        choices: [
          { text: '(Take what he offers.)', to: 'pennant', when: { trust: OG, value: 'friendly' } },
          { text: '(Grip his hand.)', to: 'hand', when: { not: { trust: OG, value: 'friendly' } } },
        ],
      },
      pennant: {
        speaker: OG, text: 'My old lance-pennant. Rode under it forty years and fell off under it more. Fly it second. It looks better second.',
        effects: [{ giveItem: 'i_odran_pennant' }, { setFlag: 'stormlancer.odran_farewell', value: 'pennant' }],
        choices: [
          { text: 'I’ll fly it.', to: 'biddy', when: { trust: OG, value: 'trusted' } },
          { text: 'I’ll fly it.', to: 'end', when: { not: { trust: OG, value: 'trusted' } } },
        ],
      },
      biddy: {
        speaker: OG, mood: 'sad', text: '(He gets down off Old Biddy, which takes some time, and puts her halter in your hand.) And her. She’s thrown me more times than anyone alive. She’ll throw you too. Get back on. That’s all riding is.',
        choices: [
          { text: '(Take Old Biddy’s halter.)', to: 'end', effects: [{ setFlag: 'stormlancer.biddy_mount', value: true }] },
          { text: 'She’s yours, Odran. Keep her.', to: 'end' },
        ],
      },
      hand: { speaker: OG, text: 'Well. Mind the gate. Mind the bird. Mind her, if you catch her. Take your time.', effects: [{ setFlag: 'stormlancer.odran_farewell', value: 'hand' }], next: null },
      end: { speaker: OG, text: 'Go on, then. First through the gate. I’ll be along. Eventually.', next: null },
    },
  },
];

export default dialogues;
