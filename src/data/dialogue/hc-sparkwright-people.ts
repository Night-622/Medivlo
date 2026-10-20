/**
 * Hollow Crown, SPARKWRIGHT: Spirehold people (general talk), the eight side quests, the mentor thread and the
 * bounties, plus the Act II class-thread, featured-bearer and hook scenes. Owner: Claude 4.
 */
import type { DialogueChoice, DialogueDef, NarrativeCondition } from '@/core';

type Q = `quest:${string}`;
const fresh = (q: Q): NarrativeCondition => ({ all: [{ not: { questActive: q } }, { not: { questCompleted: q } }] });
const stage = (q: Q, s: string): NarrativeCondition => ({ questStage: q, stage: s });
const offer = (q: Q, text: string, to: string, extra?: NarrativeCondition): DialogueChoice =>
  ({ text, to, quest: true, when: extra ? { all: [fresh(q), extra] } : fresh(q), effects: [{ startQuest: q }] });
const bye: DialogueChoice = { text: 'Farewell.', to: null, tag: 'leave' };
const NIGHT: NarrativeCondition = { hour: [21, 4] };
const SW: NarrativeCondition = { heroClass: 'sparkwright' };
const TA = 'npc:tess-ampery' as const;

const dialogues: DialogueDef[] = [
  // ---------- Tess (general + mentor thread)
  {
    id: 'dialogue:sparkwright-tess', name: 'Tess (general)',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: TA, text: 'Family! Sit down, mind the kettle, that one’s live. What can I do for you, apart from everything?',
        choices: [
          offer('quest:sparkwright-the-nineteenth-kettle', 'Why do you have nineteen patents for the same kettle?', 'kettle', { trust: TA, value: 'friendly' }),
          offer('quest:sparkwright-tess-eyebrows', 'What happened to your eyebrows, really?', 'brows', { all: [{ trust: TA, value: 'trusted' }, { questCompleted: 'quest:sparkwright-the-witchs-belfry' }] }),
          { text: 'What is the Coil Guild for?', to: 'guild' },
          bye,
        ],
      },
      kettle: { speaker: TA, text: 'Because the first one wasn’t mine. It was my grandmother’s, Patent Number One, and they filed it somewhere silly in the Vault annexe and I have never been allowed back in. You’re allowed in. Go and find it.', next: null },
      brows: { speaker: TA, mood: 'sad', text: '(For once she doesn’t laugh.) I tried to catch something once, and it didn’t want catching. There’s a scorch down in the Foundations where it hit on the way out. I dropped my notebook beside it. I never went back for either.', next: null },
      guild: { speaker: TA, text: 'Making things that work, mostly by making things that don’t, first, in a great many interesting colours. Volta thinks it’s for keeping the city up. I think it’s for keeping the city curious. We’re both right, which is very annoying.',
        choices: [
          { text: 'Why do you call everybody family?', to: 'family', when: { trust: TA, value: 'friendly' } },
          { text: 'Very annoying.', to: 'start' },
        ],
      },
      family: { speaker: TA, mood: 'happy', text: 'Because my grandmother did. Winifred called the whole of Coil Street family, the lamp-posts included. When she died there were four hundred cousins at the funeral, and three lamp-posts, and one of the lamp-posts cried.', next: 'none' },
      none: {
        speaker: TA, text: '(She polishes a spanner that does not need polishing.) I haven’t got any of the ordinary sort, you see. No brothers, no children, nobody at the table. It didn’t seem fair to have none at all, so I took everybody. Nobody’s ever asked for a refund.',
        choices: [
          { text: 'I’m not asking for one.', to: 'refund', trust: 1 },
          { text: 'Did the lamp-post really cry?', to: 'lamp' },
        ],
      },
      refund: { speaker: TA, mood: 'happy', text: 'No. I didn’t think you would. (She sniffs, enormously, and blames the varnish shop.) Right. Kettle Twenty! More tea! Family business!', next: 'start' },
      lamp: { speaker: TA, text: 'It rained, and the lamp-post was underneath it. I choose to believe it cried. Grandmother would have patented it.', next: 'start' },
    },
  },
  {
    id: 'dialogue:sparkwright-tess-kettle', name: 'Mentor: the Nineteenth Kettle', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: TA, text: 'Patent Number One. Winifred Ampery, C. 961. “A kettle that whistles.” And the clerk’s note in the margin, look: “Every time the applicant’s kettle boils, lightning strikes the Lightning Tower. Filed under Coincidence.”', next: 'hum' },
      hum: {
        speaker: TA, mood: 'happy', text: 'It whistled at the Storm Stone’s pitch, family. Exactly. And the storms came. The Lightning Tower never caught a storm in its life. It hummed, and they came to it, like cats to a hearth. Every one of my nineteen kettles has been trying to remember that note.',
        choices: [{ text: 'Then a tower doesn’t have to catch a storm. It only has to hum.', to: 'end', insight: 'tower_hum', trust: 1 }],
      },
      end: { speaker: TA, text: 'Only has to hum. Write that on something. Write it on Volta, if you can get close enough.', next: null },
    },
  },
  {
    id: 'dialogue:obj-first-kettle-patent', name: 'Mentor: Patent Number One', scope: 'party',
    entries: [{ when: stage('quest:sparkwright-the-nineteenth-kettle', 'annexe'), node: 'found' }, { node: 'drawer' }],
    nodes: {
      found: { speaker: 'narrator', text: 'In the Vault annexe, in a drawer marked COINCIDENCE, under a stack of applications for self-buttering toast: Patent Number One. A drawing of a copper kettle, and beside it, in a careful clerk’s hand, a note about lightning.', next: null },
      drawer: { speaker: 'narrator', text: 'A drawer in the Vault annexe marked COINCIDENCE. It is very full.', next: null },
    },
  },
  {
    id: 'dialogue:sparkwright-tess-eyebrows', name: 'Mentor: Tess’s Eyebrows', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: TA, text: 'My notebook. (She turns it over and over.) C. 1012. I was in the Tower Crown that night, fixing a valve, and the Storm Stone went past me like a falling star. I jumped for it. I got this close. It took my eyebrows on the way past.', next: 'page' },
      page: {
        speaker: TA, mood: 'sad', text: '(She opens it to the last page: a drawing of a stone, over and over, with her hands round it, and each time the hands are a little further away.) I spent the whole night drawing how I could have held it. I never grew the eyebrows back. On principle. To remember I couldn’t.',
        choices: [
          { text: 'Maybe it was never meant to be held.', to: 'held' },
          { text: 'You can grow them back now, Tess.', to: 'grow' },
        ],
      },
      held: { speaker: TA, text: 'No. No, I don’t suppose it was. (She closes the notebook, very gently.) Funny. Forty years of patents and you’re the first person who’s ever told me something I didn’t already know.', next: 'end' },
      grow: { speaker: TA, mood: 'happy', text: 'Grow them back? At my age? I’d look ridiculous. (She thinks about it.) I’d look magnificent. I’ll think about it.', next: 'end' },
      end: { speaker: TA, text: 'Thank you, family. I mean it. Don’t make me say it twice, I’ll go pink.', effects: [{ trust: TA, delta: 1 }], next: null },
    },
  },
  {
    id: 'dialogue:obj-storm-stone-scorch', name: 'Mentor: the Storm Stone’s scorch', scope: 'party',
    entries: [{ when: stage('quest:sparkwright-tess-eyebrows', 'scorch'), node: 'scorch' }, { node: 'mark' }],
    nodes: {
      scorch: { speaker: 'narrator', text: 'A starburst of black glass fused into the rock of the Foundations, wider than you can reach. Thirty years old, and it is still faintly warm. Your half-stone crackles at it, as if greeting an old friend.', next: null },
      mark: { speaker: 'narrator', text: 'The scorch where the Storm Stone struck the Foundations on its way out of Spirehold.', next: null },
    },
  },
  {
    id: 'dialogue:obj-tess-notebook', name: 'Mentor: Tess’s notebook',
    entries: [{ when: stage('quest:sparkwright-tess-eyebrows', 'scorch'), node: 'book' }, { node: 'gone' }],
    nodes: {
      book: { speaker: 'narrator', text: 'A leather notebook in the dust beside the scorch, swollen with thirty years of damp, open at a drawing of a stone and two hands that can’t quite reach it.', next: null },
      gone: { speaker: 'narrator', text: 'A notebook-shaped clean patch in the dust.', next: null },
    },
  },
  {
    id: 'dialogue:sparkwright-kettle-twenty', name: 'Kettle Twenty',
    entries: [{ node: 'tweet' }],
    nodes: { tweet: { speaker: 'npc:kettle-twenty', text: '(Kettle Twenty walks a small circle on three copper legs, settles at your feet, and lets out one contented puff of steam.)', next: null } },
  },
  // ---------- Volta (general)
  {
    id: 'dialogue:sparkwright-volta', name: 'Volta (general)',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:volta-sterne', text: 'Sparkwright. Was there something? I have four hundred wheels and a city to keep up.',
        choices: [
          { text: 'What happens if the wheels stop?', to: 'stop' },
          { text: 'You never let a machine be silly.', to: 'silly', when: { flag: 'sparkwright.volta_met' } },
          bye,
        ],
      },
      stop: { speaker: 'npc:volta-sterne', text: 'The lights go out, the orphanage goes cold, and somebody, somewhere, builds another tower out of panic. The wheels do not stop. Good day.', next: null },
      silly: { speaker: 'npc:volta-sterne', mood: 'sad', text: 'Silly machines fall down. I have buried people under silly machines. (She straightens a cuff that was already straight.) Good day, Sparkwright.', next: null },
    },
  },
  // ---------- Coil Street: Pim, Mortimer, Juniper, Bunty
  {
    id: 'dialogue:sparkwright-pim', name: 'Pim Joule (the Quiet Workshop)',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:pim-joule', text: '(The door opens one inch.) Nothing’s wrong. Nothing’s exploded. Nothing has exploded at all, for nine days, which is perfectly normal, go away.',
        choices: [offer('quest:sparkwright-the-quiet-workshop', 'Pim, the whole street is worried about you.', 'worried'), bye],
      },
      worried: { speaker: 'npc:pim-joule', mood: 'afraid', text: 'Worried? About me? (The door closes. Through it, faintly:) There’s nothing in here. Especially not on the bench. Don’t look at the bench.', next: null },
    },
  },
  {
    id: 'dialogue:obj-pim-toaster', name: 'The Quiet Workshop: the bench', scope: 'party',
    entries: [{ when: stage('quest:sparkwright-the-quiet-workshop', 'toaster'), node: 'toast' }, { node: 'bench' }],
    nodes: {
      toast: { speaker: 'narrator', text: 'On Pim’s bench, under a cloth: a small brass box with two slots in the top. Beside it, a plate with a perfect slice of toast on it, golden on both sides. And another. And another. Nine days of perfect toast, stacked to the ceiling.', next: null },
      bench: { speaker: 'narrator', text: 'Pim’s bench. The toaster has pride of place.', next: null },
    },
  },
  {
    id: 'dialogue:sparkwright-pim-toast', name: 'The Quiet Workshop: Pim’s toaster', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:pim-joule', mood: 'afraid', text: 'You saw it. It works. It works every time. Eleven years I’ve been on Coil Street, and I finally invent something that works, and it’s a toaster. A toaster! Nobody will ever speak to me again. It’s so boring.',
        choices: [
          { text: 'Pim, it’s brilliant. Everyone eats toast.', to: 'brilliant', trust: 1 },
          { text: 'Make it explode a little. For appearances.', to: 'explode' },
        ],
      },
      brilliant: { speaker: 'npc:pim-joule', mood: 'happy', text: 'Everyone… eats toast. (He looks at the stack.) Everyone eats toast! Here, take some bread, I won’t need it, I’ve got nine days of toast. I’m going to tell the street. I’m going to tell the Patent Office!', next: 'stack' },
      explode: { speaker: 'npc:pim-joule', mood: 'happy', text: 'A small one? Just a little puff, on the hour? (He brightens enormously.) Oh, that’s good. That’s very good. Here, take some bread. I’m going to need the room.', next: 'stack' },
      stack: {
        speaker: 'npc:pim-joule', text: '(He looks up at the tower of toast, which sways.) Only, what do I do with all this? Nine days of it. It’s perfect. I can’t throw away perfect toast. It would be like throwing away a sunrise.',
        choices: [{ text: 'Marjorie Watt’s wheel keeps the orphanage warm. They could have it for breakfast.', to: 'orphans', quest: true }],
      },
      orphans: { speaker: 'npc:pim-joule', mood: 'happy', text: 'The orphanage! Forty children and a toaster that works! (He starts stacking it into a crate, slice by slice, very tenderly.) Take it to Marjorie. Tell her it’s from an inventor. Don’t tell her it was boring.', next: null },
    },
  },
  {
    id: 'dialogue:sparkwright-mortimer', name: 'Mortimer Sneddon (Patent Rejected)',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:mortimer-sneddon', text: 'Rejected. Rejected. Rejected. (Stamp. Stamp. Stamp.) Thirty years of rejections, and the Office pigeon exploded in C. 1013, and nobody has ever posted a single one.',
        choices: [offer('quest:sparkwright-patent-rejected', 'I could deliver some.', 'deliver'), bye],
      },
      deliver: { speaker: 'npc:mortimer-sneddon', text: 'Could you? The top two, then. Wilf Farraday, in the Spires: his glide-cloak with a built-in umbrella. And Juniper Gauss, aged nine, Coil Street. I did that one last month. I’ve felt bad about it since, and I don’t know why.', next: null },
    },
  },
  {
    id: 'dialogue:sparkwright-mortimer-done', name: 'Patent Rejected: Mortimer', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:mortimer-sneddon', text: 'Delivered? Both? Thirty years, and two letters have finally arrived. I don’t know whether to retire or have a lie-down.',
        choices: [
          { text: 'Juniper’s tower that hums. It isn’t wrong, Mortimer. It’s how the Lightning Tower worked.', to: 'right', when: { insight: 'tower_hum' } },
          { text: 'Juniper cried a bit. Then she started a new one.', to: 'cried' },
        ],
      },
      right: { speaker: 'npc:mortimer-sneddon', mood: 'afraid', text: 'It isn’t…? (He opens a drawer, takes out the carbon copy, and turns it over, and over.) Then I’ve rejected the only correct application in thirty years. (A pause.) I’m going to un-reject it. Is that a thing? I’m making it a thing.', next: 'seen' },
      cried: { speaker: 'npc:mortimer-sneddon', text: 'A new one. At nine. (He picks up his stamp, looks at it, and puts it in a drawer.) Here. For the postage.', next: 'seen' },
      seen: { speaker: 'npc:mortimer-sneddon', mood: 'afraid', text: 'Only… I’ve seen that drawing before. Years ago, when I was a boy, I got lost in the Tower Foundations. There was a great stone at the bottom with a tower cut into it, and lines coming off the top like a hum. Go and look. Tell me I’m not mad.', next: null },
    },
  },
  {
    id: 'dialogue:sparkwright-juniper', name: 'Juniper Gauss (the Wisp Nursery)',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:juniper-gauss', text: 'I sent in an application a MONTH ago. A month! And now Bobbin’s gone too. Bobbin’s my wisp. He went down the drain into the Foundations, where the big ones are, and the big ones have gone wrong.',
        choices: [offer('quest:sparkwright-the-wisp-nursery', 'I’ll go and look for Bobbin.', 'look', { questCompleted: 'quest:sparkwright-rod-duty' }), bye],
      },
      look: { speaker: 'npc:juniper-gauss', text: 'The wisp nursery’s deep down under the Tower. The hollow ones are eating the little sparks. Please be quick. He’s only about so big. He likes being sung to.', next: null },
    },
  },
  {
    id: 'dialogue:sparkwright-juniper-letter', name: 'Patent Rejected: Juniper’s letter', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:juniper-gauss', text: 'A letter from the Patent Office? For me? (She opens it.) “Application: a tower that hums instead of catches. Rejected: towers catch.” (Her face crumples.) They didn’t even read it properly.',
        effects: [{ setFlag: 'sparkwright.juniper_letter', value: true }],
        choices: [
          { text: 'They’re wrong. Keep it. Build it one day.', to: 'keep', trust: 1 },
          { text: 'Everyone gets rejected the first time.', to: 'first' },
        ],
      },
      keep: { speaker: 'npc:juniper-gauss', mood: 'happy', text: 'You think they’re wrong? (She folds the letter very small and puts it in her pocket.) Then I’ll build it. When I’m big. And it’ll hum so loud they’ll hear it at the Patent Office.', next: null },
      first: { speaker: 'npc:juniper-gauss', text: 'The first time. All right. (She sniffs.) Then I’ll do a second time. And a nineteenth, like the Guildmother.', next: null },
    },
  },
  {
    id: 'dialogue:sparkwright-juniper-wisp', name: 'The Wisp Nursery: Juniper', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:juniper-gauss', mood: 'happy', text: 'Bobbin! No, that’s not Bobbin. That’s a baby. (The baby wisp on your shoulder sparks at her.) Bobbin’s gone off with the big ones, hasn’t he? It’s all right. He was always going to. This one’s chosen you.',
        choices: [{ text: 'I’ll keep it safe.', to: 'safe' }, { text: 'Do you want it?', to: 'want' }],
      },
      safe: { speaker: 'npc:juniper-gauss', text: 'You have to sing to it. Not well. It doesn’t mind well. Here, take my old lamp, it can ride in it when it’s tired.', next: null },
      want: { speaker: 'npc:juniper-gauss', text: 'It doesn’t want me, silly, it wants you. Look at it. Here, take my old lamp. It can ride in it when it’s tired.', next: null },
    },
  },
  {
    id: 'dialogue:sparkwright-bunty', name: 'Bunty Pyle (bounties)',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:bunty-pyle', text: 'Bounties on the board! Stand back from the board! The board is also, slightly, on fire.',
        choices: [
          offer('quest:sparkwright-bounty-belfry-thunderbirds', 'The belfry Thunderbirds.', 'birds', { questCompleted: 'quest:sparkwright-rod-duty' }),
          offer('quest:sparkwright-bounty-haywire-sentries', 'The haywire Sentries.', 'sentries', { questCompleted: 'quest:sparkwright-the-chancellors-tour' }),
          bye,
        ],
      },
      birds: { speaker: 'npc:bunty-pyle', text: 'Hollow Thunderbirds roosting in the bell-towers. They dive on anything tall. In the Copper Spires, that’s everything. Six of them. Paid by the beak.', next: null },
      sentries: { speaker: 'npc:bunty-pyle', text: 'Six Coil Sentries in the Dynamo Halls have started arresting the wheels for going round. The wheels are pressing charges. Sort it out.', next: null },
    },
  },
  // ---------- the Copper Spires: Wilf, Ada and Bert
  {
    id: 'dialogue:sparkwright-wilf', name: 'Wilf Farraday (the Spire-Jumpers)',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:wilf-farraday', text: 'Gliding is just falling with good posture! My apprentices want a race. Four hoops, four towers, first one down buys the tea. They want to go first. They always want to go first.',
        choices: [offer('quest:sparkwright-the-spire-jumpers', 'I’ll race them.', 'race', { questCompleted: 'quest:sparkwright-rod-duty' }), bye],
      },
      race: { speaker: 'npc:wilf-farraday', text: 'Splendid! Borrow a cloak. Arms out, knees soft, don’t think about the ground. The ground is thinking about you enough for both of you.', next: null },
    },
  },
  {
    id: 'dialogue:sparkwright-wilf-letter', name: 'Patent Rejected: Wilf’s letter',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:wilf-farraday', text: 'A letter! (He reads it.) “Glide-cloak with built-in umbrella: rejected, see Gliding, Principles Of.” Ha! Thirty years I’ve waited for that. Tell Mortimer I’ve been using it for twenty-nine.',
        effects: [{ setFlag: 'sparkwright.wilf_letter', value: true }], next: null,
      },
    },
  },
  {
    id: 'dialogue:obj-jump-ring-1', name: 'The Spire-Jumpers: the first hoop',
    entries: [{ node: 'hoop' }],
    nodes: { hoop: { speaker: 'narrator', text: 'A copper hoop strung between two leaning towers, a very long way up. You jump. For a moment there is nothing under you at all. Then the cloak catches the wind, and you are through, and an apprentice behind you is shrieking with delight.', next: null } },
  },
  {
    id: 'dialogue:sparkwright-wilf-race', name: 'The Spire-Jumpers: the verdict', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:wilf-farraday', mood: 'happy', text: 'Through all four, and you landed on your feet! Upright! The apprentices are livid. They went first, every one of them, and three are still in a tree.',
        choices: [
          { text: 'I wasn’t racing. I was landing.', to: 'land', trust: 1 },
          { text: 'Next time, I go first.', to: 'first' },
        ],
      },
      land: { speaker: 'npc:wilf-farraday', text: 'Landing! The lost art! Forty years I’ve been telling them going first isn’t the trick. The trick is coming down. Here. Winnings. Don’t tell them.', next: 'tree' },
      first: { speaker: 'npc:wilf-farraday', text: 'Ha! Then you’ll be in the tree with them. Here. Winnings. Spend them on a better cloak.', next: 'tree' },
      tree: { speaker: 'npc:wilf-farraday', text: 'Speaking of the tree. They’ll come down when they’re ready, I always say. (He squints across the Spires.) They’ve been ready since lunch, by the sound of it. Would you? You’re the one who knows how to land.', next: null },
    },
  },
  {
    id: 'dialogue:sparkwright-ada', name: 'Ada Henry (Tower Seven Leans)',
    entries: [{ when: stage('quest:sparkwright-tower-seven-leans', 'tea'), node: 'tea' }, { node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:ada-henry', text: 'Come in, dear, mind the floor, it’s at an angle. Everything’s at an angle. Bert says it isn’t. Tea’s at four. The tower will have leaned another inch by four.',
        choices: [offer('quest:sparkwright-tower-seven-leans', 'Could a counterweight hold it?', 'weight', { questCompleted: 'quest:sparkwright-rod-duty' }), { text: 'Why not move out?', to: 'move' }, bye],
      },
      move: { speaker: 'npc:ada-henry', text: 'Fifty years we’ve lived up here. The view is lovely and the stairs are dreadful. If we went down, we’d never get back up. Besides, Bert would have to admit it leans.', next: 'start' },
      weight: { speaker: 'npc:ada-henry', text: 'A counterweight! Oh, Bert will hate that. Do it. There’s copper scrap all over the Spires from the towers that fell. Hang it off the high side, dear, before four.', next: null },
      tea: {
        speaker: 'npc:ada-henry', mood: 'happy', text: '(The cups are standing level on the table for the first time in years.) Look at that. The tea’s staying in the pot. Bert, look at the tea.',
        choices: [{ text: '(Accept a cup.)', to: 'bert' }],
      },
      bert: { speaker: 'npc:bert-henry', text: 'Never leaned in the first place. Rest of the city’s straightened up, that’s all. (He takes a long sip.) Good counterweight, though.', next: 'built' },
      built: {
        speaker: 'npc:ada-henry', mood: 'happy', text: '(When Bert goes to fetch the biscuits, very quietly.) He built it, you know. Tower Seven. Fifty years ago, for me. He built it leaning, on purpose, so the window would face my mother’s house. He’ll never admit it. Don’t you dare tell him I told you.',
        choices: [{ text: 'Your secret’s safe.', to: null, trust: 1 }, { text: '(Look out of the window.)', to: 'window' }],
      },
      window: { speaker: 'narrator', text: 'Through the window, a long way down across the Spires, a small blue house with a yellow door. Nobody has lived in it for years. Somebody still paints the door.', next: null },
    },
  },
  {
    id: 'dialogue:sparkwright-bert', name: 'Old Bert Henry',
    entries: [{ node: 'start' }],
    nodes: { start: { speaker: 'npc:bert-henry', text: 'Leans? This tower doesn’t lean. It’s the only straight thing in Spirehold. Everything else has gone crooked round it.', next: null } },
  },
  {
    id: 'dialogue:obj-tower-scrap-1', name: 'Tower Seven: scrap',
    entries: [{ node: 'scrap' }],
    nodes: { scrap: { speaker: 'narrator', text: 'A fallen tower’s copper crown, lying in the street where it came down twenty years ago. Somebody has planted geraniums in it. You take the bit without geraniums.', next: null } },
  },
  {
    id: 'dialogue:obj-tower-seven-counterweight', name: 'Tower Seven: the counterweight', scope: 'party',
    entries: [{ when: stage('quest:sparkwright-tower-seven-leans', 'weight'), node: 'hang' }, { node: 'hung' }],
    nodes: {
      hang: { speaker: 'narrator', text: 'You hang the scrap off the high side of Tower Seven on a copper cable and let it take the weight. The tower groans, considers it, and with a long creak like an old man getting out of a chair, leans back an inch.', next: null },
      hung: { speaker: 'narrator', text: 'A great lump of copper scrap, swinging gently off the side of Tower Seven, holding it nearly straight.', next: null },
    },
  },
  // ---------- the Dynamo Halls: Marjorie, Sixty-One
  {
    id: 'dialogue:sparkwright-marjorie', name: 'Marjorie Watt (Wheel Three)',
    entries: [{ when: stage('quest:sparkwright-wheel-three', 'shift'), node: 'shift' }, { node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:marjorie-watt', text: 'Thirty years on Number Three. The orphanage hasn’t had one cold night. And now these tin idiots want to replace me. Replace ME. They can’t even whistle.',
        choices: [offer('quest:sparkwright-wheel-three', 'Let me help you finish your shift.', 'help'), bye],
      },
      help: { speaker: 'npc:marjorie-watt', text: 'Keep them off the wheel till the bell, and I’ll keep it turning. Four of the beggars. Go on, then.', next: null },
      shift: {
        speaker: 'npc:marjorie-watt', mood: 'happy', text: 'There’s the bell. Thirty years and one more shift. (She pats the wheel, the way you would a horse.) Orphanage is warm tonight. Thank you, Sparkwright. Here. I was saving it for a rainy day, but it’s always raining.',
        choices: [{ text: 'The Chancellor says Number Three is her favourite.', to: 'volta', when: { flag: 'sparkwright.volta_met' } }, { text: 'Goodnight, Marjorie.', to: 'never' }],
      },
      volta: { speaker: 'npc:marjorie-watt', text: 'Does she now. She’s never once been down to say so. (A pause.) She sends oil, though. Every month. The good oil.', next: 'never' },
      never: {
        speaker: 'npc:marjorie-watt', mood: 'sad', text: 'Funny thing. I grew up in that orphanage. Thirty years I’ve kept it warm, and I’ve never once been back inside. Never could face it. (She wipes her hands on her apron, twice.) You could look in, couldn’t you? Tell me if it’s still yellow.',
        choices: [{ text: 'I’ll look in.', to: null, quest: true }],
      },
    },
  },
  {
    id: 'dialogue:sparkwright-sixty-one', name: 'Sentry Sixty-One',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:sentry-sixty-one', text: 'COO. (A Coil Sentry the size of a wardrobe is roosting on the Number Three wheel. It bobs its lantern-head at you and pecks at the iron floor.) Coo. Coo.',
        choices: [offer('quest:sparkwright-sentry-sixty-one', '(Crouch down. Hold out your hand.)', 'hand', { questCompleted: 'quest:sparkwright-the-chancellors-tour' }), bye],
      },
      hand: { speaker: 'narrator', text: 'It looks at your empty hand, then at you, with deep pigeon disappointment. A tag on its leg reads: UNIT 61. HAYWIRE. FOR SCRAPPING, THURSDAY. It is Wednesday.', next: null },
    },
  },
  {
    id: 'dialogue:obj-dynamo-lunch-tin', name: 'Sentry Sixty-One: Marjorie’s lunch tin',
    entries: [{ node: 'tin' }],
    nodes: { tin: { speaker: 'narrator', text: 'Marjorie’s lunch tin, by the wheel. Inside, a note: “Crusts for whoever wants them. Not the Chancellor.” You take a pocketful of crusts.', next: null } },
  },
  {
    id: 'dialogue:sparkwright-sixty-one-feed', name: 'Sentry Sixty-One: breadcrumbs', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:sentry-sixty-one', text: '(You scatter crusts on the floor. Sentry Sixty-One looks at them. Looks at you. Then it hops down off the wheel, with a noise like a dropped bucket, and begins, very delicately, to peck.)',
        choices: [
          { text: '(Peel the scrapping tag off its leg.)', to: 'tag' },
          { text: '(Chalk HOMING PIGEON on its side.)', to: 'chalk' },
        ],
      },
      tag: { speaker: 'npc:sentry-sixty-one', mood: 'happy', text: 'COO. (It puffs out its chest plate and settles beside you, warm and humming. Nobody will scrap a Sentry that hasn’t got a tag. Nobody will find the paperwork.)', next: 'order' },
      chalk: { speaker: 'npc:sentry-sixty-one', mood: 'happy', text: 'COO! (It reads the chalk, or seems to, and bobs its lantern proudly. When the scrap-men come on Thursday, it will be very difficult to argue with.)', next: 'order' },
      order: { speaker: 'narrator', text: 'Except that the scrapping order isn’t on its leg. It is on file, at the Patent Office, in triplicate, and the scrap-men will come with a copy. In Spirehold a thing is whatever its paperwork says it is.', next: null },
    },
  },
  // ---------- the Tower Foundations: Ma Ohmsworth, the nursery
  {
    id: 'dialogue:sparkwright-ma', name: 'Ma Ohmsworth (the Root-Tuner)',
    entries: [{ when: stage('quest:sparkwright-the-root-tuner', 'ma'), node: 'note' }, { node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:ma-ohmsworth', text: 'Hush. That root’s flat. Hear it? No, you don’t, nobody does any more. The Chancellor says stop tuning. The Chancellor can come down here and say it to the roots.',
        choices: [offer('quest:sparkwright-the-root-tuner', 'Show me how to tune them.', 'how'), bye],
      },
      how: { speaker: 'npc:ma-ohmsworth', text: 'Six left. Tap each one with the back of your knuckle, not the front, and listen until it agrees with you. Your chest’s humming already. You’ll be good at this.', next: null },
      note: {
        speaker: 'npc:ma-ohmsworth', mood: 'happy', text: 'Hear that? All six. That’s the note the Tower sang, when I was a girl. That’s the note your chest is singing now. Funny, that.',
        choices: [
          { text: 'It’s the Storm Stone’s note. The Tower used to hum, and the storms came to it.', to: 'hum', insight: 'tower_hum', trust: 1, trustNpc: 'npc:ma-ohmsworth' },
          { text: 'Why does the Chancellor want you to stop?', to: 'why' },
        ],
      },
      hum: { speaker: 'npc:ma-ohmsworth', text: 'Came to it. Like cats to a fire. Aye. My gran said that. Nobody listened to my gran either. Now: ask me why she wants me to stop.', next: 'why' },
      why: {
        speaker: 'npc:ma-ohmsworth', text: 'Because two of my roots won’t tune any more. Somebody’s driven copper rods through them, great thick things, stamped V.S., and they hum like something holding on with its teeth. Go and put your hand on one. You’ll feel the storm at the end of it.',
        choices: [{ text: 'The rods are holding the storm still.', to: 'rods', insight: 'anchored_storm' }, { text: 'I will.', to: 'tess' }],
      },
      rods: { speaker: 'npc:ma-ohmsworth', mood: 'sad', text: 'Holding it still, over the Copper Gate, like a kite on a peg. A storm’s meant to go home. Everything’s meant to go home.', next: 'tess' },
      tess: { speaker: 'npc:ma-ohmsworth', text: 'And go and hum that note to the Guildmother. Forty years she’s been building kettles trying to find it. She’ll pretend she isn’t crying. Let her.', next: null },
    },
  },
  {
    id: 'dialogue:obj-copper-root-1', name: 'The Root-Tuner: a root',
    entries: [{ node: 'root' }],
    nodes: { root: { speaker: 'narrator', text: 'A copper root as thick as a tree, running down into the rock. You tap it with the back of your knuckle. It thrums, a little flat, and then, as you listen, comes up to the note on its own, like a singer finding the key.', next: null } },
  },
  {
    id: 'dialogue:obj-wisp-nursery-nest', name: 'The Wisp Nursery: the nest', scope: 'party',
    entries: [{ when: stage('quest:sparkwright-the-wisp-nursery', 'baby'), node: 'baby' }, { node: 'nest' }],
    nodes: {
      baby: { speaker: 'narrator', text: 'In the heart of the wisp nest, among the burned-out shells of sparks, one tiny light, no bigger than a pea, still flickering. You hum to it, badly. It flickers brighter, climbs your finger, and settles on your shoulder as if it has always lived there.', next: null },
      nest: { speaker: 'narrator', text: 'The wisp nursery in the Foundations, quiet now, glowing faintly with new sparks.', next: null },
    },
  },

  // ======================= ACT II
  {
    id: 'dialogue:sparkwright-prudence', name: 'C-1 Cliffstair: Spire-Keeper Prudence', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:prudence-spindle', text: 'A Sparkwright! From Spirehold! Do you know anything about kit-builds? Our Storm Spire came in eleven parts, thirty years ago. We have built parts one to five, and seven to eleven, beautifully. Part six never came.',
        choices: [
          { text: 'I need to find Storm’s Sentinel.', to: 'crow', quest: true },
          { text: 'What’s in part six?', to: 'six' },
        ],
      },
      six: { speaker: 'npc:prudence-spindle', mood: 'sad', text: 'We don’t know! That’s the agony of it! Part five ends with “now connect the” and part seven begins “once connected”. We have been guessing for thirty years. We have guessed four hundred things. None of them were it.', next: 'crow' },
      crow: {
        speaker: 'npc:prudence-spindle', text: 'The Stormcrow. Hear it? It screams up there on the clifftop every evening, the same news over and over: “The Turning! The Turning!” There hasn’t been one in thirty years. Nobody’s climbed to the nest since. The cliff’s too sheer.',
        choices: [{ text: 'Then I’ll build a ladder. A lightning one.', to: 'ladder', school: 'storm' }, { text: 'I’ll find a way up.', to: null }],
      },
      ladder: { speaker: 'npc:prudence-spindle', mood: 'happy', text: 'A lightning-ladder! Oh, that’s a proper Spirehold idea. There are old anchor-points up the cliff from before the arches shut. If it explodes, please explode away from the Spire.', next: null },
    },
  },
  {
    id: 'dialogue:obj-sparkwright-lightning-ladder-1', name: 'C-2 the lightning-ladder', scope: 'party',
    entries: [
      { when: { all: [SW, stage('quest:sparkwright-the-news-that-never-came', 'ladder'), { any: [{ flag: 'sparkwright.wisps', value: 'freed' }, { flag: 'sparkwright.wisps', value: 'chose' }] }] }, node: 'wisps' },
      { when: { all: [SW, stage('quest:sparkwright-the-news-that-never-came', 'ladder')] }, node: 'rig' },
      { node: 'anchor' },
    ],
    nodes: {
      rig: { speaker: 'narrator', text: 'An old iron anchor-point bolted into the cliff, thirty years rusted. You clip a copper line to it and wait for the strike. It comes, and runs up the line like a squirrel up a tree, and you go up with it.', next: null },
      wisps: { speaker: 'narrator', text: 'You clip a copper line to the old anchor. And out of the storm comes a swarm of little lights: Spirehold’s wisps, the ones you let go, a whole sky of them, settling along the line like lamps on a stair to light you up the cliff.', next: null },
      anchor: { speaker: 'narrator', text: 'An old iron anchor-point on the Stormcliffs, with a copper line clipped to it.', next: null },
    },
  },
  {
    id: 'dialogue:sparkwright-clement', name: 'C-4 the Gildport Works-Clerk', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:clement-penhallow', text: 'Spirehold cuffs. You’re Coil Guild. (He lowers his voice.) Then you’ll know her. Tall, buttoned, not a scorch on her. She came through a month ago with a harness and a patent and asked to see the old Works under the town. The buried ones.',
        choices: [
          { text: 'What did she do down there?', to: 'did' },
          { text: 'What has the Sentry on the clocktower seen?', to: 'sixty', when: { flag: 'sparkwright.sixty_one_saved' } },
        ],
      },
      sixty: { speaker: 'npc:clement-penhallow', text: 'Your pigeon? It sits on the clocktower and coos at the Ruins all night, very upset. Goes stiff whenever a black spark goes past. It’s seen her, all right. It won’t stop pointing.', next: 'did' },
      did: {
        speaker: 'npc:clement-penhallow', text: 'Started them. The old Sparkwright Works of the buried Gilded city, cold since C. 640, running hot every night. On something black. The ledgers write themselves now: “Fuel: tears. Product: crown.”',
        choices: [{ text: 'Show me the furnace.', to: 'furnace', quest: true }],
      },
      furnace: { speaker: 'npc:clement-penhallow', text: 'Under the Works, down the old stair. I won’t come. I’m a clerk. I’ll be here, writing it down, so somebody knows.', next: null },
    },
  },
  {
    id: 'dialogue:sparkwright-sixty-one-gild', name: 'Sentry Sixty-One at Gildport',
    entries: [{ node: 'coo' }],
    nodes: { coo: { speaker: 'npc:sentry-sixty-one-gild', mood: 'happy', text: 'COO! (It hops down off the clocktower with a noise like a falling wardrobe, bobs at you, and then turns its lantern-head, very deliberately, towards the Gilded Ruins, and stares.)', next: null } },
  },
  {
    id: 'dialogue:obj-sparkwright-volta-tear-furnace', name: 'C-4 the furnace under the Works', scope: 'party',
    entries: [{ when: { all: [SW, stage('quest:sparkwright-the-machine-age', 'furnace')] }, node: 'furnace' }, { node: 'cold' }],
    nodes: {
      furnace: { speaker: 'narrator', text: 'Under the Gildport Works, in a hall of buried gold, the oldest furnace of the Sparkwright city is roaring. It is being fed by a pipe of black water, and the pipe runs down, further, towards the sound of something enormous turning.', next: 'patent' },
      patent: { speaker: 'narrator', text: 'Nailed to the furnace door, a sheet of stiff paper in a neat hand: “Application for a Crown, to be forged by the Gilded Engine. Seats: one. Applicant: V. Sterne, Concordant of the Machine Age.” Stamped: PENDING.', next: null },
      cold: { speaker: 'narrator', text: 'An old furnace under the Gildport Works, going cold.', next: null },
    },
  },
  // ---------- C-6 Telegram
  {
    id: 'dialogue:obj-sparkwright-tess-telegraph', name: 'C-6 the telegraph wire', scope: 'party',
    entries: [
      { when: { all: [SW, stage('quest:sparkwright-stop-proud-of-you-stop', 'wire'), NIGHT] }, node: 'night' },
      { when: { all: [SW, stage('quest:sparkwright-stop-proud-of-you-stop', 'wire')] }, node: 'day' },
      { when: { all: [SW, stage('quest:sparkwright-stop-proud-of-you-stop', 'reply')] }, node: 'r-key' },
      { node: 'wire' },
    ],
    nodes: {
      wire: { speaker: 'narrator', text: 'A thin copper wire running out of the Storm arch and into the grass, ending in a little brass key on a stake.', next: null },
      // C-6 reply (wave 2 depth): a proper answer down the wire
      'r-key': { speaker: 'narrator', text: 'The little brass key on its stake by the Storm arch. The line hums. Tess is listening; you can tell. The wire has a particular patience when she is on the end of it.', next: 'r-send' },
      'r-send': {
        speaker: 'narrator', text: 'You have more to say than STOP. What do you send?',
        choices: [
          { text: '“STOP. PART SIX. STOP. CLIFFSTAIR SPIRE. WHAT IS IT. STOP.”', to: 'r-six', when: { flag: 'sparkwright.part_six_seen' }, effects: [{ setFlag: 'sparkwright.reply', value: 'six' }] },
          { text: '“STOP. PROUD OF YOU TOO. STOP. EYEBROWS GONE. STOP.”', to: 'r-proud', effects: [{ setFlag: 'sparkwright.reply', value: 'proud' }] },
          { text: '“STOP. FOUND VOLTA. STOP. SHE WANTS A CROWN WITH A SEAT IN IT. STOP.”', to: 'r-volta', when: { flag: 'sparkwright.volta_seat' }, effects: [{ setFlag: 'sparkwright.reply', value: 'volta' }] },
        ],
      },
      'r-six': { speaker: TA, mood: 'happy', text: '(A long pause. Then, very fast:) “PART SIX. STOP. GOOD HEAVENS. STOP. NOW CONNECT THE KETTLE. STOP. ANY KETTLE. STOP. IT IS A KETTLE. ALWAYS WAS. STOP. TELL PRUDENCE SORRY ABOUT THE POST.”', effects: [{ setFlag: 'sparkwright.part_six', value: true }], next: 'r-end' },
      'r-proud': { speaker: TA, text: '“STOP. STOP. STOP.” (A pause.) “THAT WAS ME CRYING. STOP. KETTLE ALSO CRYING. STOP. IT IS STEAM. STOP.”', next: 'r-end' },
      'r-volta': { speaker: TA, mood: 'sad', text: '“STOP. OH VOLTA. STOP. A SEAT. STOP. SHE ALWAYS WANTED SOMEWHERE TO SIT WHERE NOTHING MOVED. STOP. BRING HER HOME IF YOU CAN. STOP.”', next: 'r-end' },
      'r-end': { speaker: 'narrator', text: 'The key clacks once more, a long one, which in the old Guild code means nothing at all and in Tess’s means goodnight.', next: null },
      day: { speaker: 'narrator', text: 'The brass key on the end of the wire is still. Brindlecross is too loud by day. The line will be quieter after dark.', next: null },
      night: { speaker: 'narrator', text: 'In the dark, very faintly, the little brass key begins to clack. Long, short. Short, long. Somebody on the far side of the Copper Gate is sending, very slowly, in the old Guild code, with a great many mistakes.', next: 'msg' },
      msg: {
        speaker: TA, text: '“STOP. PROUD OF YOU. STOP. KETTLE FINE. STOP. STREET STILL EXPLODING. STOP. VOLTA’S DESK CAUGHT FIRE. NOT ME. STOP. COME HOME WHEN DONE. STOP. STOP. CAN’T WORK OUT HOW TO STOP.”',
        choices: [{ text: '(Tap back, slowly: “STOP”.)', to: 'reply', quest: true, effects: [{ setFlag: 'sparkwright.telegram', value: true }] }],
      },
      reply: { speaker: 'narrator', text: 'A pause. Then, very fast, a burst of clacking that is not in any code at all, and is probably laughing.', next: null },
    },
  },
  {
    id: 'dialogue:sparkwright-tower-and-eye', name: 'C-6 the Tower and the Eye', scope: 'party',
    entries: [{ node: 'chord' }],
    nodes: {
      chord: { speaker: 'narrator', text: 'In the Stone Court the Tower half and the Eye half sing together, and for a moment it is exactly the sound of a kettle coming to the boil in a very quiet room: all that crackle, gathered round one still point.', next: 'go' },
      go: { speaker: 'narrator', text: 'You don’t try to catch it. You let it hum. Somewhere over the Stormcliffs, a little storm turns round, curious, and comes to listen.', next: null },
    },
  },
  // ---------- featured bearers (hooks on the bearer NPCs)
  {
    id: 'dialogue:sparkwright-featured-arcanist', name: 'Featured: Spark and Ember', scope: 'party',
    entries: [
      { when: stage('quest:sparkwright-spark-and-ember', 'back'), node: 'back' },
      { when: { all: [stage('quest:sparkwright-spark-and-ember', 'furnace'), { not: { flag: 'sparkwright.ottoline_asked' } }] }, node: 'ask' },
    ],
    nodes: {
      ask: {
        speaker: 'npc:bearer-arcanist', text: 'A Sparkwright! Thank the Kiln. I have built a furnace here to burn the black out of the Works, and it will not catch. I’ve tried fire. I’ve tried more fire. I am beginning to think it wants something I haven’t got.',
        choices: [
          { text: 'A spark. At the same moment as the ember.', to: null, quest: true, effects: [{ setFlag: 'sparkwright.ottoline_asked', value: true }] },
          { text: 'Show me the furnace.', to: null, quest: true, effects: [{ setFlag: 'sparkwright.ottoline_asked', value: true }] },
        ],
      },
      back: {
        speaker: 'npc:bearer-arcanist', mood: 'happy', text: 'It caught! And your tower-machine hummed when it did, did you hear? Spark and ember, at the same moment. I think that’s the first useful thing Ash and Storm have done together in a thousand years. At the Heart, I’m standing next to you.',
        effects: [{ setFlag: 'sparkwright.ottoline_thanked', value: true }], next: null,
      },
    },
  },
  {
    id: 'dialogue:obj-sparkwright-ottoline-furnace', name: 'Spark and Ember: the furnace', scope: 'party',
    entries: [{ when: { all: [SW, stage('quest:sparkwright-spark-and-ember', 'furnace')] }, node: 'light' }, { node: 'burn' }],
    nodes: {
      light: {
        speaker: 'narrator', text: 'The Arcanist bearer holds a coal of white fire to the grate. You hold your hands to the coil. On three. One. Two.',
        choices: [{ text: '(Spark on three.)', to: 'three' }, { text: '(Spark on two, because everybody does.)', to: 'two', school: 'storm' }],
      },
      three: { speaker: 'narrator', text: 'Fire and lightning hit the grate at the same instant, and the furnace roars up gold, and up on the Gildport clocktower your tower-machine starts to hum.', next: null },
      two: { speaker: 'narrator', text: 'So does the Arcanist bearer. Fire and lightning hit the grate together on two, and the furnace roars up gold, and you both laugh, and the clocktower hums.', next: null },
      burn: { speaker: 'narrator', text: 'A furnace beside the Gildport Works, burning clean and gold.', next: null },
    },
  },
  {
    id: 'dialogue:sparkwright-featured-monk', name: 'Featured: The Long Way Up', scope: 'party',
    entries: [
      { when: stage('quest:sparkwright-the-long-way-up', 'back'), node: 'back' },
      { when: { all: [stage('quest:sparkwright-the-long-way-up', 'ledges'), { not: { flag: 'sparkwright.sefu_asked' } }] }, node: 'ask' },
    ],
    nodes: {
      ask: {
        speaker: 'npc:bearer-monk', text: 'No ladder. No rope. No lightning. I am climbing the Stormcliffs as the cliff intends, one hand and then another. You may come. You may race. Or you may carry the tea, which is the most important job.',
        choices: [
          { text: 'I’ll race you.', to: null, quest: true, effects: [{ setFlag: 'sparkwright.sefu_asked', value: true }] },
          { text: 'I’ll carry the tea.', to: null, quest: true, effects: [{ setFlag: 'sparkwright.sefu_asked', value: true }] },
        ],
      },
      back: {
        speaker: 'npc:bearer-monk', mood: 'happy', text: 'The tea was still warm at the top. You did not drop it, and you did not use a single machine. I could see it was very difficult for you. Whatever comes at the Heart, I will climb it beside you.',
        effects: [{ setFlag: 'sparkwright.sefu_thanked', value: true }], next: null,
      },
    },
  },
  {
    id: 'dialogue:obj-sparkwright-sefu-tea-ledge-1', name: 'The Long Way Up: a ledge', scope: 'party',
    entries: [{ when: { all: [SW, stage('quest:sparkwright-the-long-way-up', 'ledges')] }, node: 'ledge' }, { node: 'rock' }],
    nodes: {
      ledge: { speaker: 'narrator', text: 'A ledge on the Stormcliffs, three hundred feet up. The Monk bearer is already sitting on it, cross-legged, waiting. He pours two cups. Your hands are shaking. His are not. Neither of you mentions it.', next: null },
      rock: { speaker: 'narrator', text: 'A narrow ledge on the Stormcliffs, with two tea-rings on it.', next: null },
    },
  },
  // ---------- class hooks on the Brindlecross people
  {
    id: 'dialogue:hook-sparkwright-sela', name: 'Hook: Sela and the humming stones',
    entries: [{ when: { all: [{ not: { flag: 'sparkwright.sela_met' } }, { flag: 'story.act', op: '>=', value: 2 }] }, node: 'hum' }],
    nodes: {
      hum: {
        speaker: 'npc:sela', text: 'Spirehold cuffs, and no eyebrows. You’re Coil Guild. Tell me, Sparkwright: why do my waystones hum before a storm? Every one of them, the same note.',
        effects: [{ setFlag: 'sparkwright.sela_met', value: true }],
        choices: [
          { text: 'Because they were tuned to the Storm Stone’s pitch. They’re listening for it.', to: 'tuned', when: { insight: 'tower_hum' } },
          { text: 'Lightning likes a high, still point. They’re lightning rods with manners.', to: 'rods' },
        ],
      },
      tuned: { speaker: 'npc:sela', mood: 'happy', text: 'Listening for it. (She puts her hand flat on the nearest stone, and for a moment she looks about nine years old.) Then they’re not humming before a storm. They’re humming hello.', next: null },
      rods: { speaker: 'npc:sela', text: 'Lightning rods with manners. I like that. I’m going to say it to every waystone I wake, and see if they mind.', next: null },
    },
  },
  // ======================= ACT III
  {
    id: 'dialogue:sparkwright-herald-fate', name: 'III-4 the Copper Herald: Volta’s fate', scope: 'party',
    entries: [{ when: { flag: 'sparkwright.wisps', value: 'caged' }, node: 'caged' }, { node: 'kneel' }],
    nodes: {
      kneel: { speaker: 'npc:volta-sterne', mood: 'hollow', text: 'Don’t touch it. (Her hand is locked round the switch on her harness, white at the knuckles.) If I let go, it stops. If it stops, it falls. Everything I have ever loved has fallen down, Sparkwright. I won’t let go.', next: 'choose' },
      caged: { speaker: 'npc:volta-sterne', mood: 'hollow', text: 'Your wisps lit me, you know. (The wisps from Tower Fifteen are still burning in her coils, very dimly.) You caged them for me. You wanted it to stand too. So don’t ask me to let go.', next: 'choose' },
      choose: {
        speaker: 'npc:volta-sterne', mood: 'sad', text: 'Well? You’re Tess’s. Tell me how she does it. How do you love a thing, and let it be ridiculous, and let it fall down?',
        choices: [
          {
            text: '(Whistle the kettle note: the note the Tower hummed to the storms.)', to: 'kettle', quest: true,
            when: { flag: 'sparkwright.wisps', value: 'chose' }, lockedLabel: 'You need the note the Tower hummed',
            effects: [{ setFlag: 'sparkwright.nemesis_fate', value: 'spared' }],
          },
          {
            text: '(Open Tess’s notebook at the drawing of the stone she couldn’t hold.)', to: 'notebook', quest: true,
            when: { trust: TA, value: 'trusted' }, lockedLabel: 'You need Tess’s notebook, and her whole trust',
            effects: [{ setFlag: 'sparkwright.nemesis_fate', value: 'spared' }],
          },
          { text: 'You don’t. Not like this. (Cut the harness.)', to: 'destroy', quest: true, effects: [{ setFlag: 'sparkwright.nemesis_fate', value: 'destroyed' }] },
        ],
      },
      kettle: { speaker: 'narrator', text: 'You whistle it, badly, the way Tess does: the first kettle’s note, the Storm Stone’s own pitch. The dynamo bell falters. The coils in Volta’s crown begin to hum along, not holding the note, only humming to it.', next: 'let' },
      notebook: { speaker: 'narrator', text: 'You open it at the page: the Storm Stone in Tess’s hand, drawn on the night it fled, and under it, in pencil, “Couldn’t hold it. Shouldn’t have tried. Lovely, though.”', next: 'let' },
      let: { speaker: 'npc:volta-sterne', mood: 'sad', text: '(She looks for a long time. Then her fingers open, one at a time, and the switch clicks off, and nothing falls down.) Oh. (The copper wire slides off her like rain.) Oh, it’s so quiet.', next: null },
      destroy: { speaker: 'narrator', text: 'You cut the main line. The dynamo bell spins down with a long, falling whine, and the Copper Herald goes out like a street of lamps, one after another, until there is only a scorched harness on the stair and a smell of hot copper.', next: null },
    },
  },
  {
    id: 'dialogue:obj-sparkwright-heart-telegraph', name: 'Tess’s Last Patent: the telegraph at the Heart', scope: 'party',
    entries: [
      { when: { all: [SW, stage('quest:sparkwright-the-chancellors-engineers', 'ask')] }, node: 'e-key' },
      { when: { all: [SW, stage('quest:sparkwright-tess-last-patent', 'wire')] }, node: 'clack' },
      { when: { all: [SW, stage('quest:sparkwright-tess-last-patent', 'file')] }, node: 'f-key' },
      { node: 'key' },
    ],
    nodes: {
      // Tess's Last Patent, part 3 (wave 2 depth): filing it
      'f-key': { speaker: 'narrator', text: 'The telegraph key on its crate at the edge of the camp. The witnessed patent is still faintly warm in your hand. Tess will be sitting by the other end of the wire, pretending not to be.', next: 'f-send' },
      'f-send': {
        speaker: 'narrator', text: 'You tap it out in Guild code, with only a few mistakes.',
        choices: [
          { text: '“STOP. WITNESSED. IN SIGHT OF THE CROWN. STOP. IT HUMMED.”', to: 'f-reply' },
          { text: '“STOP. WITNESSED. CO-INVENTOR: KETTLE TWENTY. STOP.”', to: 'f-reply' },
        ],
      },
      'f-reply': { speaker: TA, mood: 'happy', text: '“STOP. FILED. PATENT NUMBER TWENTY. STOP. A CROWN THAT HUMS. STOP. INVENTORS: T. AMPERY AND FAMILY. STOP. THAT IS YOU. STOP. DON’T ARGUE. STOP.”', effects: [{ setFlag: 'sparkwright.patent_filed', value: true }], next: 'f-end' },
      'f-end': { speaker: 'narrator', text: 'Then a burst of clacking in no code at all, which goes on for some time, and which you are fairly sure is Tess telling the whole of Coil Street.', next: null },
      // The Chancellor's Engineers, part 2 (wave 2 depth): asking the Guildmother to relieve them
      'e-key': { speaker: 'narrator', text: 'The telegraph key on its crate. The engineers have followed you out of the Legion in a neat line and stand behind you in their clean cuffs, waiting to be relieved.', next: 'e-send' },
      'e-send': { speaker: 'narrator', text: 'You tap it out: “STOP. GUILDMOTHER. STOP. CHANCELLOR’S ENGINEERS AT THE HEART. STOP. ORDERS WERE HOLD UNTIL RELIEVED. STOP. PLEASE ADVISE.”', next: 'e-reply' },
      'e-reply': { speaker: TA, text: '“STOP. RELIEVED. ALL OF THEM. STOP. BY ORDER OF THE ELDEST MASTER. STOP. TELL THEM THE KETTLE IS ON. STOP. TELL THEM VOLTA WOULD SAY TIDY UP FIRST. STOP. SHE WOULD.”', effects: [{ setFlag: 'sparkwright.engineers_relieved', value: true }], next: null },
      clack: { speaker: 'narrator', text: 'A telegraph key on an upturned crate at the edge of the camp, its copper wire running back across the grass the way you came: to the Storm arch, and through it, and all the way to Spirehold. It is clacking. You take it down.', next: 'msg' },
      msg: { speaker: TA, text: '“STOP. FAMILY. STOP. LAST PATENT ENCLOSED. A CROWN THAT HUMS INSTEAD OF HOLDS. STOP. NO MOVING PARTS. STOP. ONE MOVING PART. STOP. IT IS THE PEOPLE. STOP.”', next: 'msg2' },
      msg2: { speaker: TA, mood: 'happy', text: '“GET IT WITNESSED. BY THE CROWN IF POSSIBLE. PATENT OFFICE WILL NOT BELIEVE IT OTHERWISE. STOP. KETTLE FINE. STOP. EYEBROWS STILL OFF. ON PRINCIPLE. STOP. T.”', next: null },
      key: { speaker: 'narrator', text: 'A telegraph key on an upturned crate, quiet now. Somebody has left a cup of tea beside it, in case.', next: null },
    },
  },
  {
    id: 'dialogue:obj-sparkwright-patent-witness', name: 'Tess’s Last Patent: in sight of the crown', scope: 'party',
    entries: [
      { when: { all: [SW, stage('quest:sparkwright-tess-last-patent', 'witness'), { flag: 'sparkwright.tess_devotable' }] }, node: 'devoted' },
      { when: { all: [SW, stage('quest:sparkwright-tess-last-patent', 'witness')] }, node: 'witness' },
      { node: 'step' },
    ],
    nodes: {
      witness: { speaker: 'narrator', text: 'From the top of the Twelve Stairs the Citadel doors stand open, and far down the long hall something in a cage is shining. You hold Tess’s patent up to it, sign the witness line, and write under it: “In sight of the crown.”', next: 'hum' },
      hum: { speaker: 'narrator', mood: 'happy', text: 'For a moment the paper hums in your hands, very faintly, at exactly the pitch of a kettle coming to the boil.', next: null },
      devoted: {
        speaker: 'narrator', text: 'From the top of the Twelve Stairs the Citadel doors stand open, and far down the long hall something in a cage is shining. You hold Tess’s patent up to it, sign the witness line, and write under it: “In sight of the crown.”',
        effects: [{ trust: TA, set: 5 }], next: 'hum-d',
      },
      'hum-d': { speaker: 'narrator', mood: 'happy', text: 'The paper hums in your hands at the pitch of a kettle coming to the boil. Far away in Spirehold, under nineteen patents, Kettle Twenty begins to whistle on its own, and Tess Ampery puts down her spanner and says to nobody, “There. That’s my family.”', next: null },
      step: { speaker: 'narrator', text: 'The top step of the Twelve Stairs. There is a small scorch on it where a patent was witnessed, and it is still faintly warm.', next: null },
    },
  },
  {
    id: 'dialogue:obj-sparkwright-guild-engineers', name: 'The Chancellor’s Engineers', scope: 'party',
    entries: [
      { when: { all: [SW, stage('quest:sparkwright-the-chancellors-engineers', 'measure'), { flag: 'sparkwright.wisps', value: 'caged' }] }, node: 'caged' },
      { when: { all: [SW, stage('quest:sparkwright-the-chancellors-engineers', 'measure')] }, node: 'engineers' },
      { when: { all: [SW, stage('quest:sparkwright-the-chancellors-engineers', 'ask')] }, node: 'hold' },
      { when: { all: [SW, stage('quest:sparkwright-the-chancellors-engineers', 'relieve')] }, node: 'r-read' },
      { node: 'gone' },
    ],
    nodes: {
      // parts 2 and 3 (wave 2 depth): they won't leave without orders; then they are relieved
      hold: { speaker: 'narrator', text: 'The engineers stand in a neat rank, awake now, polishing their goggles. “Hold until relieved,” says the senior engineer, apologetically. “Chancellor’s orders. Only a master of the Guild can stand us down.”', next: null },
      'r-read': { speaker: 'narrator', text: 'You read Tess’s telegram aloud to the rank. At “relieved”, the senior engineer’s shoulders come down an inch. At “tidy up first”, every one of them starts, without thinking, to pack away their instruments.', next: 'r-home' },
      'r-home': { speaker: 'narrator', mood: 'happy', text: 'They go out of the Legion in pairs, arguing about tolerances, the way Spirehold engineers always do on the way to the pub. The last one turns and salutes you with a slide rule.', effects: [{ setFlag: 'sparkwright.engineers_home', value: true }, { trust: TA, delta: 1 }], next: null },
      engineers: { speaker: 'narrator', text: 'A neat rank of Coil Guild engineers in the middle of the Legion, in clean cuffs and black-tear goggles. Each has a slide rule. Each is measuring the empty air in front of them, carefully, over and over, and writing down the same number.', next: 'number' },
      caged: { speaker: 'narrator', text: 'A neat rank of Coil Guild engineers in the Legion, in clean cuffs and black-tear goggles, measuring the empty air. Behind them, in a row of little cages, the wisps you caged for Tower Fifteen are burning very low.', next: 'number' },
      number: {
        speaker: 'narrator', text: 'You look over the nearest shoulder. The number is the height of Tower Fifteen. They are still trying to make it stand.',
        choices: [
          { text: '(Take the nearest slide rule, gently, and add one: the margin for error.)', to: 'margin', quest: true },
          { text: 'Tower Fifteen doesn’t have to stand. It’s all right. Things are allowed to fall down.', to: 'fall', quest: true },
          { text: '(Open the wisp cages.)', to: 'wisps', quest: true, when: { flag: 'sparkwright.wisps', value: 'caged' } },
        ],
      },
      margin: { speaker: 'narrator', mood: 'happy', text: 'She stares at the new number. It is wrong, wonderfully and obviously wrong. She laughs, a short surprised bark, and the black runs out of her goggles, and one by one the rank looks up from their sums.', next: null },
      fall: { speaker: 'narrator', text: 'The nearest engineer lowers her slide rule. “Fifteen,” she says, as if somebody has finally let her say it. “It doesn’t have to stand.” All down the rank, one by one, they put their instruments away.', next: null },
      wisps: { speaker: 'narrator', mood: 'happy', text: 'The wisps go up out of their cages like sparks from a chimney. The engineers’ heads turn to follow them, all together, and for the first time in a long while they are looking at something that is not a number.', next: null },
      gone: { speaker: 'narrator', text: 'A neat stack of slide rules, left on the ground in the Legion camp.', next: null },
    },
  },
  {
    id: 'dialogue:sparkwright-sixty-one-heart', name: 'Sixty-One Flies Home: the cook-tent', scope: 'party',
    entries: [{ when: stage('quest:sparkwright-sixty-one-flies-home', 'coo'), node: 'start' }, { node: 'chase' }],
    nodes: {
      start: { speaker: 'npc:sentry-sixty-one-heart', text: 'COO. (Sentry Sixty-One is roosting on the cook-tent, which is sagging. Its lantern-head is turned towards the Citadel, and it is bobbing, faster and faster.) Coo. Coo. COO.', next: 'tag' },
      tag: {
        speaker: 'narrator', text: 'There is a new tag on its leg: UNIT 61. HAS DECIDED IT IS A HOMING PIGEON. PLEASE DIRECT TO HOME. Underneath, in a different hand: “Which is where?”',
        choices: [
          { text: '(Hold out a crust.)', to: 'go', quest: true },
          { text: 'Sixty-One. Stay.', to: 'go', quest: true },
        ],
      },
      go: { speaker: 'narrator', text: 'It looks at you with deep pigeon pity. Then it hops off the tent, flaps its arms, which are not wings, and sets off up the Twelve Stairs towards the crown at a determined, clanking waddle. It is surprisingly fast.', next: null },
      chase: { speaker: 'npc:sentry-sixty-one-heart', text: '(Sixty-One is halfway up the stairs, and gaining.) COO.', next: null },
    },
  },
  {
    id: 'dialogue:obj-sparkwright-sixty-one-perch', name: 'Sixty-One Flies Home: the top of the stairs', scope: 'party',
    entries: [{ when: { all: [SW, stage('quest:sparkwright-sixty-one-flies-home', 'chase')] }, node: 'catch' }, { node: 'perch' }],
    nodes: {
      catch: { speaker: 'narrator', text: 'You catch up with it at the very top of the Twelve Stairs, where it has stopped dead in front of the Citadel doors, bobbing. Far down the hall the crown hangs in its cage of tears. Sixty-One looks at it. Then it looks at you.', next: 'home' },
      home: {
        speaker: 'narrator', mood: 'happy', text: 'It turns round, waddles back, and settles on your shoulder, which very nearly breaks it. Coo, it says quietly, like something that has been home all along and has only just noticed.',
        choices: [{ text: '(Stagger back down the stairs with it.)', to: null }],
      },
      perch: { speaker: 'narrator', text: 'A dent in the top step of the Twelve Stairs, roughly the shape of a pigeon the size of a wardrobe.', next: null },
    },
  },
];

export default dialogues;
