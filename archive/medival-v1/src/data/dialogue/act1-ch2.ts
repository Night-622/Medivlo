/** Dialogue: Act I Ch2, quest:the-singing-wood and quest:iron-and-oath. Owner: Claude 4. */
import type { DialogueDef } from '@/core';

const Q4 = 'quest:the-singing-wood', Q5 = 'quest:iron-and-oath';
const stagCleansed = { flag: 'prologue.stag_fate', op: '==' as const, value: 'cleansed' };

/** obj:ylwen-seep-N: a short bark when Purged during the seeps stage. */
const seep = (n: 1 | 2 | 3, purge: string): DialogueDef => ({
  id: `dialogue:obj-ylwen-seep-${n}`, name: `Object: Ylwen seep ${n}`, bark: true,
  entries: [
    { when: { flag: `act1.ylwen_seep_${n}` }, node: 'clean' },
    { when: { questStage: Q4, stage: 'seeps' }, node: 'purge' },
    { node: 'idle' },
  ],
  nodes: {
    idle: { speaker: 'narrator', text: 'Black water wells up between the roots, warm as breath. The thorns above it have gone soft.' },
    purge: { speaker: 'narrator', effects: [{ setFlag: `act1.ylwen_seep_${n}`, value: true }], text: purge },
    clean: { speaker: 'narrator', text: 'Only wet earth now, and the hedge putting out a single white thorn.' },
  },
});

const dialogues: DialogueDef[] = [
  seep(1, 'You press your marked hand to the black water. It hisses, and shrinks from you like a slug from salt. Somewhere behind the hedge, a voice sings one low note.'),
  seep(2, 'The seep fights you. For a moment it is warm, and it is your mother’s voice, and it is asking you to lie down. Then the Ashmark bites, and it is only water, and gone.'),
  seep(3, 'The last wound closes with a sound like a sigh. All along the Thornwall the frost on the thorns begins to ring, very faintly, like glass.'),
  // ----- Cadoc at the Thornwall
  {
    id: 'dialogue:cadoc-thornwall', name: 'Cadoc: The Thornwall',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: 'narrator', text: 'The Thornwall rises forty feet: a hedge of living wardwood, black thorns long as daggers, every one of them rimed with frost. On a root above the only gap sits an Aelthi in a green cloak gone grey at the hem, paring a winter apple with a leaf-blade knife.', next: 'hello' },
      hello: {
        speaker: 'npc:cadoc-ap-ynys',
        text: 'Don’t touch the hedge. It bites, and then it sulks for a decade. You’ll be the Queen’s errand. The Ashmarked one. The wood has been muttering about you since the first snow, and it is a terrible gossip.',
        choices: [
          { text: '“I need to speak with the Thornwise.”', to: 'closed' },
          { text: '“Who are you?”', to: 'who', once: true },
          { text: '[Ranger] “Nan Briar of the Gloamwood taught me the green paths.”', to: 'ranger', when: { classIs: 'class:ranger' }, tag: 'class', once: true },
          { text: '[Outlander] “I’ve slept under stranger roofs than thorns.”', to: 'outlander', when: { dialogueTag: 'outlander' }, tag: 'trait', once: true },
        ],
      },
      who: { speaker: 'npc:cadoc-ap-ynys', text: 'Cadoc ap Ynys. Cadoc, son of Ynys, who was son of someone tediously distinguished, and so on back to the first leaf. I am three hundred years old, which makes me the youngest in my family and the only one they will let near the hedge. I am its keeper. I am also in disgrace. The two are not unconnected.', next: 'hello' },
      ranger: { speaker: 'npc:cadoc-ap-ynys', text: 'Nan Briar? That old hen stole three songs from my great-aunt and still owes her a basket. …Fine. You walk quieter than most of your kind. That is still very loud.', next: 'hello' },
      outlander: { speaker: 'npc:cadoc-ap-ynys', mood: 'happy', text: 'Stranger than thorns? I doubt it, but I admire the confidence. Most humans who reach this hedge either weep or try to set it on fire. Neither works.', next: 'hello' },
      closed: {
        speaker: 'npc:cadoc-ap-ynys',
        text: 'Ylwen is closed. Caer Ylwen has been closed to your kind since your kind learned to make axes, and to everyone since the Quench. The Archdruid does not open doors for errands. Not even royal ones. Especially not royal ones.',
        choices: [
          { text: '“Then how does someone earn a hearing?”', to: 'seeps', when: { not: stagCleansed } },
          { text: '“The hedge is moving.”', to: 'stag', when: stagCleansed },
        ],
      },
      stag: { speaker: 'narrator', text: 'The thorns draw back a finger’s breadth, then a hand’s. Far in among the white trunks something pale lifts its head: a crown of antlers, watching you.', next: 'stag2' },
      stag2: { speaker: 'npc:cadoc-ap-ynys', mood: 'afraid', text: '…Oh, that is unfair. You’re the one who knelt the White Stag and gave it back to itself. It remembers you. The Weeping Stones sang the night you did it; we heard them here, three days’ walk away, like a bell rung under water.', next: 'stag3' },
      stag3: { speaker: 'npc:cadoc-ap-ynys', effects: [{ unlockLore: 'lore:the-white-stag', section: 'cleansed' }], text: 'Well. The wood has opened its mouth for you, and I am not fool enough to argue with a wood. Wait here. I’ll fetch the Archdruid. She will come herself, I think. She has not come to the hedge in eighty years.' },
      seeps: {
        speaker: 'npc:cadoc-ap-ynys',
        text: 'There are three wounds in the wood, this side of the hedge. Places where the Old Sleeper has pushed up through our roots: black water, and the trees going soft around it like fruit. We sing them closed, and in a week they open again.',
        choices: [
          { text: '“Why can’t you close them for good?”', to: 'why', once: true },
          { text: '[Hollow-touched] “I can hear it under the roots. It’s calling to me too.”', to: 'hollow', when: { dialogueTag: 'hollow-touched' }, tag: 'trait', once: true },
          { text: '“I’ll burn them out.”', to: 'accept' },
        ],
      },
      why: { speaker: 'npc:cadoc-ap-ynys', mood: 'sad', text: 'Because we sing to them, and singing to the Mire is, how shall I put this gently… how we lost our last city. We sing a little, and we stop. You burn. Burning has never sunk anything.', next: 'seeps' },
      hollow: { speaker: 'narrator', mood: 'afraid', text: 'He looks at you properly for the first time, and the apple stops turning. “Then you hear what we hear. Ae’Hun, talking in its sleep. Don’t answer it. It is not cruel. It is only very large, and it does not know where it ends and you begin.”', next: 'seeps' },
      accept: { speaker: 'npc:cadoc-ap-ynys', text: 'Burn those, and if the hedge stops weeping I’ll go and fetch someone more important than me. Which is nearly everyone. Mind the thorns on the way.' },
    },
  },
  // ----- Rhiannon: the pact
  {
    id: 'dialogue:rhiannon-pact', name: 'Rhiannon: The pact of the Thornwall',
    entries: [{ when: stagCleansed, node: 'start-stag' }, { node: 'start-seeps' }],
    nodes: {
      'start-stag': { speaker: 'narrator', text: 'She comes through the hedge without parting it; where she walks the thorns are simply not there. She is taller than any man, older than anything you have seen that still moves, and the wardwood crown on her brow is putting out leaves in midwinter. Behind her, between the trees, the White Stag stands like a pale stone.', next: 'greet-stag' },
      'greet-stag': { speaker: 'npc:rhiannon-ys-caer', text: 'Ashmarked. The Stag would not stop speaking of you, so I have come to see the hand that burned it clean and did not kill it. It is a rarer thing than you know.', next: 'name' },
      'start-seeps': { speaker: 'narrator', text: 'She comes through the hedge without parting it; where she walks the thorns are simply not there. She is taller than any man, older than anything you have seen that still moves, and the wardwood crown on her brow is putting out leaves in midwinter. Her eyes are like a lamp seen through deep water.', next: 'greet-seeps' },
      'greet-seeps': { speaker: 'npc:rhiannon-ys-caer', text: 'Ashmarked. The hedge has stopped weeping, and the wood tells me you did that. So I have come to look at you, child of a quick people.', next: 'name' },
      name: { speaker: 'npc:rhiannon-ys-caer', effects: [{ unlockLore: 'lore:the-thornwise' }], text: 'I am Rhiannon. They add Ys-Caer, of the drowned court, because I was a child in Ys Aerwen on the night it went under the lake. I am the last who remembers the colour of its roofs. It was not a colour you have.', next: 'hub' },
      hub: {
        speaker: 'npc:rhiannon-ys-caer', text: 'Ask what you came to ask. The wood is patient. I am, mostly.',
        choices: [
          { text: '“What happened to Ys Aerwen?”', to: 'ys', once: true, tag: 'lore' },
          { text: '“What is the Lullaby?”', to: 'lullaby', once: true, tag: 'lore' },
          { text: '[Scholar] “The Canticle says Orr rose out of the Mire. I’m told your songs say he tore himself from it.”', to: 'scholar', when: { dialogueTag: 'scholar' }, tag: 'trait', once: true },
          { text: '“The Queen needs allies against the Drowned Choir.”', to: 'offer' },
        ],
      },
      ys: { speaker: 'npc:rhiannon-ys-caer', text: 'We heard it, under everything. Ae’Hun, the Dreaming. Not a sea of evil: a sea of everything that might have been, sleeping as a child sleeps. And the hammer had woken it into bad dreams. Our loremasters pitied it. We all pitied it. So they made a song to sing it back to sleep.', next: 'ys2' },
      ys2: {
        speaker: 'npc:rhiannon-ys-caer', mood: 'sad', effects: [{ unlockLore: 'lore:sundering-of-ys' }, { unlockLore: 'lore:the-mire', section: 'dreaming' }],
        text: 'We sang it on the lake at midsummer, a thousand voices, and the Mire heard us. It loved the song. It came closer to listen. By morning the stones of Ys were as soft as bread, and the towers bowed into the water like reeds. I was on my mother’s shoulders. She put me in a boat. She did not get into the boat.',
        choices: [
          { text: '“I’m sorry.”', to: 'sorry' },
          { text: '“And the survivors swore never to sing to it again.”', to: 'oath' },
        ],
      },
      sorry: { speaker: 'npc:rhiannon-ys-caer', text: 'So am I, still. We have a word for that grief, hiraeth-ys, because we needed one. Your people have no word for it yet. I hope you never need it.', next: 'oath' },
      oath: { speaker: 'npc:rhiannon-ys-caer', text: 'Caer Ylwen swore. Most of my people keep the oath. The Thornwise keep it… loosely. We sing the Lullaby still, softly, in pieces, never the whole of it. A thread. Enough to soothe the sleeper, never enough to call it.', next: 'hub' },
      lullaby: { speaker: 'npc:rhiannon-ys-caer', effects: [{ unlockLore: 'lore:the-lullaby' }], text: 'Hun-Aerwen. A song is a hand on a sleeper’s brow. The Church would chain the Mire, and the chain is fire, and the fire is going out. The Choir would drown the world so the sleeper may have its dream. We believe there is a third way. Neither chain nor drowning: sleep. True sleep, the kind one wakes from still oneself.', next: 'lullaby2' },
      lullaby2: { speaker: 'npc:rhiannon-ys-caer', mood: 'sad', text: 'We may be wrong. We were wrong once, and it cost a city. But the chain is failing whether we sing or not, and I would rather be wrong gently.', next: 'hub' },
      scholar: { speaker: 'npc:rhiannon-ys-caer', effects: [{ unlockLore: 'lore:the-forging', section: 'aelthi' }], text: 'You have read more than is good for you. Yes. The Canticle is a smith’s song, so it says the world was made. Ours is a mourner’s song, so it says the world was taken. Both are true. A sword is made, and a sword is also taken out of a mountain.', next: 'hub' },
      offer: { speaker: 'npc:rhiannon-ys-caer', text: 'The Thornwise do not fight for crowns. But the Choir’s black water is in our roots, and your Queen’s war is the Mire’s war whether she knows it or not. I will not offer you fealty. I will offer you a pact.', next: 'terms' },
      terms: {
        speaker: 'npc:rhiannon-ys-caer',
        text: 'The deepwood opens to you. Our wardens watch your western roads. Cadoc goes with you, because he is young and foolish and knows more of the song than he should, and because if the Embers ever come together, someone must be there who can sing. In return: when the time comes to choose what is done with the Embers, you will hear us. Not obey. Hear.',
        choices: [
          { text: '“I swear it. Hearth and kin, and the wood besides.”', to: 'swear' },
          { text: '[Devout] “I’ll swear it by Kethra the Thorn, if she’ll have me.”', to: 'devout', when: { dialogueTag: 'devout' }, tag: 'trait' },
          { text: '[Oathbound] “I’m sworn to the Lantern already. I can’t swear to two lights.”', to: 'oathbound', when: { classIs: 'class:oathbound' }, tag: 'class', once: true },
          { text: '“You don’t trust the song any more than I do. You want someone who knows it near the Embers.”', to: 'insight', tag: 'lore', once: true, check: { stat: 'intellect', dc: 15, failTo: 'insight-fail' } },
          { text: '“I can’t promise that. Not to anyone.”', to: 'refuse' },
        ],
      },
      oathbound: { speaker: 'npc:rhiannon-ys-caer', text: 'I do not ask you to swear to a light, Lightsworn. I ask you to listen. Even Ithren’s priests are permitted ears.', next: 'terms' },
      insight: { speaker: 'npc:rhiannon-ys-caer', effects: [{ reputation: 'faction:thornwise', delta: 5 }, { setFlag: 'act1.cadoc_secret_known', value: true }], text: 'Yes. When Cadoc was a hundred years old he sang the whole Lullaby to a seep on the Thornwall, alone, to see what it would do. The seep closed and stayed closed. That is why he is in disgrace, and why I am afraid of him, and why he must go with you.', next: 'terms' },
      'insight-fail': { speaker: 'npc:rhiannon-ys-caer', text: 'You see a shape in the water and call it a fish. Perhaps it is. The terms stand.', next: 'terms' },
      devout: { speaker: 'npc:rhiannon-ys-caer', mood: 'happy', effects: [{ reputation: 'faction:thornwise', delta: 5 }], text: 'She will have you. She has had worse. Kethra is not particular; she only asks that what grows be let grow.', next: 'swear' },
      swear: { speaker: 'narrator', effects: [{ setFlag: 'act1.ylwen_pact', value: true }], text: 'She takes your marked hand in both of hers. Her fingers are as cold as river-stones; the Ashmark flares, and she does not flinch. Somewhere behind the hedge many voices take up three notes together, and let them go.', next: 'swear2' },
      swear2: { speaker: 'npc:rhiannon-ys-caer', text: 'It is done. Gwyn aer: bright song to you, spark. …Cadoc. Stop listening behind the hedge and come and be useful.', next: 'cadoc' },
      cadoc: { speaker: 'npc:cadoc-ap-ynys', text: 'I wasn’t listening. I was eavesdropping, which is quite different and requires more skill. …Three hundred years I have waited to leave this hedge. I had thought I would feel braver about it.' },
      refuse: {
        speaker: 'npc:rhiannon-ys-caer',
        text: 'You are certain? A pact is not a chain. I would not offer you one.',
        choices: [
          { text: '“I’m certain.”', to: 'refused', effects: [{ setFlag: 'act1.ylwen_refused', value: true }] },
          { text: '“Wait. Let me hear the terms again.”', to: 'terms' },
        ],
      },
      refused: { speaker: 'npc:rhiannon-ys-caer', mood: 'sad', text: 'Then go with the wood’s blessing, and without its help. I will not curse you; I am too old to spend breath on curses. But the hedge will not open again, and when you need a song, there will be no one to sing it.' },
    },
  },
  // ----- Hedda at the gate
  {
    id: 'dialogue:ch2-hedda-gate', name: 'Hedda: The shut gate',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: 'narrator', text: 'Dun Korrath-Gate is a wall of black iron as tall as a cathedral, set into the mountain like a door into a house. On the gatehouse stair stands an Orrun woman in plate, her beard-braids ringed with silver. Her guards are watching the ground, not the road.', next: 'halt' },
      halt: {
        speaker: 'npc:hedda-stonebrow',
        text: 'Halt. The gate is shut. To humans, to Solenni, to the Wick, and to queens’ letters. By word of High Thane Brannoch Deepforge, whose voice I am. Hedda Stonebrow, Thane-Speaker. Now you know whom to curse on the road home.',
        choices: [
          { text: '“The Queen of Haldmarch asks for the Concord’s aid.”', to: 'queen', once: true },
          { text: '“Why is the gate shut?”', to: 'why', once: true },
          { text: '[Brute] “I could knock.”', to: 'brute', when: { dialogueTag: 'brute' }, tag: 'trait', once: true },
          { text: '“Your guards are watching the ground, not the road. What are they waiting for?”', to: 'ground', once: true, check: { stat: 'intellect', dc: 15, failTo: 'ground-fail' } },
          { text: '“Who keeps that forge outside your wall?”', to: 'grimma' },
        ],
      },
      queen: { speaker: 'npc:hedda-stonebrow', text: 'Haldmarch asks every winter. This winter Haldmarch can ask the snow. The snow is listening; the Concord is not.', next: 'halt' },
      why: { speaker: 'npc:hedda-stonebrow', text: 'Because the High Thane says so. That is the whole of the reason, and more reason than you are owed.', next: 'halt' },
      brute: { speaker: 'npc:hedda-stonebrow', text: 'Knock, then. Three hundred years of korr says you’ll break your hand before you trouble a hinge.', next: 'halt' },
      ground: { speaker: 'narrator', mood: 'afraid', text: 'Her hand finds the gate-chain and stays there. “The mountain is uneasy. Orrun feel the stone as you feel weather. That is all.” A pause. “That is all.”', next: 'halt' },
      'ground-fail': { speaker: 'npc:hedda-stonebrow', text: 'They are watching for fools who ask questions. They have found one.', next: 'halt' },
      grimma: { speaker: 'npc:hedda-stonebrow', mood: 'angry', text: 'Grimma Ironsong. Oath-breaker, scratched from her clan’s ledger, exiled. Do not speak with her. She tells lies about the mountain. The kind of lies that frighten children. Go home, Ashmarked.' },
    },
  },
  // ----- Grimma at her forge
  {
    id: 'dialogue:ch2-grimma-forge', name: 'Grimma: Nine Nails',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: 'narrator', text: 'Beneath the wall, in a drift of soot-black snow, an Orrun woman works an open-air forge. She is broad as a door, her braids rung with iron, and she does not look up from the anvil.', next: 'hello' },
      hello: { speaker: 'npc:grimma-ironsong', text: 'You’ll be the one Hedda turned away. Don’t take it hard. She’d turn Orr himself away if he’d no appointment. Grimma Ironsong. Runesmith. My clan scratched my name out of the ledger last autumn. Know what for? Counting.', next: 'count' },
      count: {
        speaker: 'npc:grimma-ironsong',
        text: 'Nine Nails in the Vault under Korrath. True-iron, Orrin-driven, pinning the Mire down where it pushes hardest. They sent me down to sing the runes fresh. I counted seven that hold. Two are rust to the root. Grenn. I said so, out loud, in the Hall. The Thane said I was mistaken. I said I can count.',
        choices: [
          { text: '“Why would the High Thane lie?”', to: 'lie', once: true },
          { text: '[Warden] “A gate that lies to you doesn’t hold.”', to: 'warden', when: { classIs: 'class:warden' }, tag: 'class', once: true },
          { text: '[Arcanist] “Can the runes not be sung again?”', to: 'arcanist', when: { classIs: 'class:arcanist' }, tag: 'class', once: true },
          { text: '“If two have failed, which way is the rust spreading?”', to: 'spread', tag: 'lore', once: true, check: { stat: 'intellect', dc: 15, failTo: 'spread-fail' } },
          { text: '“Can you prove it?”', to: 'proof' },
        ],
      },
      lie: { speaker: 'npc:grimma-ironsong', text: 'Because if the Concord says the Nails fail, every hold in the Ironspine panics, every human king comes begging true-iron, and Brannoch is the Thane who lost the Nails. Pride’s a heavy hammer. Hedda knows. She’s his voice, not his fool. She’s frightened sick.', next: 'count' },
      warden: { speaker: 'npc:grimma-ironsong', mood: 'happy', effects: [{ loyalty: 'npc:grimma-ironsong', delta: 5 }], text: 'Ha! A shield-arm with sense in it. Keep that. You’ll need it.', next: 'count' },
      arcanist: { speaker: 'npc:grimma-ironsong', text: 'Not on rust. A rune is ember fixed into matter. There’s no matter left down there to hold it. You can’t sing to a hole.', next: 'count' },
      spread: { speaker: 'narrator', mood: 'afraid', effects: [{ setFlag: 'act1.rust_follows_warmth', value: true }], text: 'She stops hammering. “Upward. Along the old ley-veins. Like it’s following the warmth home.” She looks at your gloved hand. “Like you’d follow a fire, in this cold.”', next: 'count' },
      'spread-fail': { speaker: 'npc:grimma-ironsong', text: 'Down, mostly. Rust goes where rust goes. Ask a smarter question.', next: 'count' },
      proof: { speaker: 'npc:grimma-ironsong', text: 'Up the valley there’s the Old Nail Shaft. A tenth Nail, a test-Nail from the First Age, sunk long before the Vault. It failed first. Whatever rusted it is still walking about down there. Bring me a piece of it, broken, and I’ll put it in Hedda’s hand in front of the whole gate. Iron doesn’t lie. People do.', next: 'debt' },
      debt: { speaker: 'npc:grimma-ironsong', text: 'Korr nagh. Iron-oath: bring me the shard and I owe you. An Orrun debt doesn’t rust, whatever else does.' },
    },
  },
  {
    id: 'dialogue:obj-broken-nail', name: 'Object: The broken Nail',
    entries: [{ when: { questStage: Q5, stage: 'shaft' }, node: 'nail' }, { node: 'idle' }],
    nodes: {
      idle: { speaker: 'narrator', text: 'The broken Nail stands in the dark, flaking. The stone around it is wet and soft. Something below it breathes.' },
      nail: {
        speaker: 'narrator',
        text: 'At the bottom of the shaft stands a spike of black true-iron, thick as an oak and driven into the floor up to the giants’ hand-marks. Around it the stone has gone soft and wet. The iron, which never rusts, is eaten through and flaking like old bark.',
        choices: [
          { text: 'Look at it with the mark.', to: 'sight' },
          { text: 'Break off a shard.', to: 'take' },
        ],
      },
      sight: { speaker: 'narrator', mood: 'afraid', text: 'The ley-light in the walls goes dark for a yard all round the Nail. Beneath the floor, through the stone, you see the black water pressed up against the iron, the way a face presses against a window.', next: 'take' },
      take: { speaker: 'narrator', text: 'A shard the length of your hand comes away at a touch. It is still warm. In a world made of iron, Orr’s own metal has given up.' },
    },
  },
  // ----- Hedda: the judgement at the gate
  {
    id: 'dialogue:hedda-nails', name: 'Hedda: Nine Nails, seven holding',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: 'narrator', text: 'Word travels fast in the foothills. By the time you reach the gate a crowd has gathered: Orrun traders and carters, gate-wardens, a knot of frightened Haldish refugees. Hedda Stonebrow stands on the stair. Grimma has come up behind you, and nobody will stand near her.', next: 'show' },
      show: { speaker: 'npc:hedda-stonebrow', text: 'You went down the Old Shaft. …Show me.', next: 'shard' },
      shard: { speaker: 'narrator', text: 'You hold out the shard. It flakes in the cold, red-black, onto the snow. Hedda does not take it. She steps down so close that only you can hear her.', next: 'plea' },
      plea: { speaker: 'npc:hedda-stonebrow', mood: 'afraid', text: 'I know. Do you think I don’t know? I have stood at this gate every night since autumn and felt the mountain shift under my boots. Say it here, aloud, and the holds will have it by nightfall: panic in every hall, and the Thane shamed. Say nothing, and I open the gate. The Concord stands with your Queen. True-iron for her smiths. All of it, for a closed mouth.', next: 'choice' },
      choice: {
        speaker: 'npc:grimma-ironsong', text: 'Ironsong’s watching, human. Choose like iron.',
        choices: [
          { text: 'Raise the shard and tell the crowd the truth.', to: 'expose', tag: 'aggressive' },
          { text: '“Tell them yourself, Hedda. It should come from the Thane’s voice.”', to: 'confess', tag: 'persuade', once: true, check: { stat: 'will', dc: 20, failTo: 'confess-fail' } },
          { text: '[Noble-born] “Your lord’s pride is not your honour. I was raised among proud lords; I know the difference.”', to: 'confess', when: { dialogueTag: 'noble-born' }, tag: 'trait', once: true },
          { text: '[Devout] “By Vor the Hammer, an oath kept with a lie is a cracked anvil.”', to: 'confess', when: { dialogueTag: 'devout' }, tag: 'trait', once: true },
          { text: 'Close your hand on the shard. “Keep your secret. Open the gate.”', to: 'keep' },
        ],
      },
      'confess-fail': { speaker: 'narrator', text: 'She opens her mouth to the crowd, and you watch her try. Nothing comes. “I am his voice,” she whispers. “I have no other.”', next: 'choice' },
      confess: { speaker: 'narrator', effects: [{ setFlag: 'act1.hedda_spoke', value: true }], text: 'For a long moment Hedda says nothing. Then she takes the shard from your hand, climbs the stair, and holds it up herself.', next: 'confess2' },
      confess2: { speaker: 'npc:hedda-stonebrow', text: 'Hear me. I am the Thane’s voice, and today I speak without him. There are Nine Nails under Korrath. Seven hold. Two are rust. Grimma Ironsong counted true, and we scratched her name for it.', next: 'confess3' },
      confess3: { speaker: 'npc:grimma-ironsong', mood: 'happy', text: '…Well. Stone me. Hedda Stonebrow, if they leave you a voice after this, I’ll forge you a better one.', next: 'open-exposed' },
      expose: { speaker: 'narrator', text: 'You lift the shard above your head and say it plainly, so that the back of the crowd can hear: seven Nails hold under Korrath, and two have failed. The murmur becomes a roar. Somebody starts to weep. Grimma stands very still.', next: 'expose2' },
      expose2: { speaker: 'npc:hedda-stonebrow', mood: 'sad', text: '…So. It is said. The Thane will have my voice for this, and perhaps my name.', next: 'open-exposed' },
      'open-exposed': {
        speaker: 'npc:hedda-stonebrow',
        effects: [
          { setFlag: 'act1.nails_exposed', value: true }, { setFlag: 'act1.nails_choice', value: 'exposed' },
          { setFlag: 'act1.korrath_gate_open', value: true }, { unlockLore: 'lore:the-nine-nails' },
        ],
        text: 'Go through, Ashmarked. The gate is open. It would be a poor sort of honour to shut it on the one who told the truth.',
        next: 'grimma-joins',
      },
      'grimma-joins': { speaker: 'npc:grimma-ironsong', text: 'I’m coming with you. No hold will have me now I’m proved right; that’s worse than being wrong. Besides, you’ll want a smith who can count.' },
      keep: {
        speaker: 'narrator',
        effects: [
          { takeItem: 'item:broken-nail-shard' }, { setFlag: 'act1.nails_kept', value: true },
          { setFlag: 'act1.nails_choice', value: 'kept' }, { setFlag: 'act1.korrath_gate_open', value: true },
        ],
        text: 'She breathes out, and takes the shard from you, and it is gone into her gauntlet. Then, loudly: “The gate opens for the Queen’s envoy! Korr nagh. The Concord keeps its debts.”',
        next: 'grimma-leaves',
      },
      'grimma-leaves': { speaker: 'npc:grimma-ironsong', mood: 'angry', next: 'grimma-gone', text: 'I thought you were the sort that could count. Grenn take you, then. Grenn take the lot of you. When the mountain comes down, you remember who counted.' },
      'grimma-gone': { speaker: 'narrator', text: 'She spits into the snow, shoulders her hammer and goes down the mountain road alone. She does not look back. Behind you the great gate groans open for the first time since autumn.' },
    },
  },
  // ----- general and companion conversations (Q4/Q5 NPCs)
  {
    id: 'dialogue:ch2-cadoc-general', name: 'Cadoc: General',
    entries: [
      { when: { flag: 'companion.cadoc-ap-ynys.following' }, node: 'comp' },
      { when: { questStage: Q4, stage: 'seeps' }, node: 'seeps' },
      { when: { questStage: Q4, stage: 'rhiannon' }, node: 'wait' },
      { when: { flag: 'act1.ylwen_refused' }, node: 'refused' },
      { node: 'idle' },
    ],
    nodes: {
      idle: { speaker: 'npc:cadoc-ap-ynys', text: 'Still here. The hedge and I have an understanding: it doesn’t bite me, and I don’t write poems about it.' },
      seeps: { speaker: 'npc:cadoc-ap-ynys', text: 'Three seeps, along the hedge. I counted them for you. I am generous that way.' },
      wait: { speaker: 'npc:cadoc-ap-ynys', mood: 'afraid', text: 'She’s coming. Stand up straight. No, straighter. She has watched kings drown.' },
      refused: { speaker: 'npc:cadoc-ap-ynys', mood: 'sad', text: 'The hedge is shut, and I am on the wrong side of it, as usual. Go carefully, spark. The wood won’t hold it against you. I might, a little.' },
      comp: {
        speaker: 'npc:cadoc-ap-ynys', text: 'Yes? I’m listening. I am always listening; it is a family failing.',
        choices: [
          { text: '“Tell me about your family.”', to: 'family', once: true },
          { text: '“Rhiannon told me about the seep you sang closed.”', to: 'secret', when: { flag: 'act1.cadoc_secret_known' }, once: true },
          { text: '“Why are you in disgrace?”', to: 'coy', when: { not: { flag: 'act1.cadoc_secret_known' } }, once: true },
          { text: '“Teach me some of the Lullaby.”', to: 'teach' },
          { text: '“Let’s keep moving.”', to: null, tag: 'leave' },
        ],
      },
      family: { speaker: 'npc:cadoc-ap-ynys', text: 'My mother is a mere eight hundred and forty, and still thought flighty. My great-grandmother remembers Ys. At family gatherings I am sent to fetch the wine, and I shall be until somebody younger is born, which at the present rate will be never.', next: 'comp' },
      coy: { speaker: 'npc:cadoc-ap-ynys', text: 'Because I was young once. Ask me again when we know each other better, or when I am drunk. Whichever comes first.', next: 'comp' },
      secret: { speaker: 'npc:cadoc-ap-ynys', mood: 'sad', effects: [{ loyalty: 'npc:cadoc-ap-ynys', delta: 5 }], text: 'Of course she did. …I sang the whole of it, once, to a seep no wider than a cart-wheel. It closed, and stayed closed, and for one breath I felt the whole sea under the world turn over and sigh, like a sleeper whose hand you have taken. Then I was sick for a year.', next: 'secret2' },
      secret2: { speaker: 'npc:cadoc-ap-ynys', text: 'I would do it again. That is the disgrace, really. Not the singing. That I would do it again.', next: 'comp' },
      teach: { speaker: 'npc:cadoc-ap-ynys', text: 'Not yet. Perhaps not ever. A song like that is not a tool, spark. It is a door, and you cannot close a door by wishing.', next: 'comp' },
    },
  },
  {
    id: 'dialogue:ch2-rhiannon-general', name: 'Rhiannon: General',
    entries: [{ when: { flag: 'act1.ylwen_pact' }, node: 'grove' }, { node: 'idle' }],
    nodes: {
      idle: { speaker: 'npc:rhiannon-ys-caer', text: 'The wood is listening, Ashmarked. So am I.' },
      grove: { speaker: 'npc:rhiannon-ys-caer', text: 'Walk softly in the Grove of Antlers. Everything here is older than your kingdom, and most of it is awake. Hun-aerwen, spark. Sleep well, when you sleep.' },
    },
  },
  {
    id: 'dialogue:ch2-grimma-general', name: 'Grimma: General',
    entries: [
      { when: { all: [{ flag: 'companion.grimma-ironsong.following' }, { flag: 'act2.grimma_restored' }] }, node: 'restored' },
      { when: { all: [{ flag: 'companion.grimma-ironsong.following' }, { flag: 'act2.new_nail' }] }, node: 'eight' },
      { when: { all: [{ flag: 'companion.grimma-ironsong.following' }, { flag: 'act2.korrath_flooded' }] }, node: 'flooded' },
      { when: { flag: 'companion.grimma-ironsong.following' }, node: 'comp' },
      { when: { questStage: Q5, stage: 'shaft' }, node: 'shaft' },
      { when: { questStage: Q5, stage: 'judge' }, node: 'judge' },
      { node: 'idle' },
    ],
    nodes: {
      restored: { speaker: 'npc:grimma-ironsong', mood: 'happy', text: 'My name\u2019s in the ledger. Ironsong. Runesmith. Who counted true. I keep saying it to myself like a fool.' },
      eight: { speaker: 'npc:grimma-ironsong', mood: 'happy', text: 'Eight hold. Eight. I\u2019ll count them every year till I die, and I\u2019ll enjoy it.' },
      flooded: { speaker: 'npc:grimma-ironsong', mood: 'sad', text: 'Don\u2019t. I know why you did it. Knowing doesn\u2019t dry the holds.' },
      idle: { speaker: 'npc:grimma-ironsong', text: 'Forge is hot, if you’ve steel that wants singing. Only warm thing on this mountain, me and it.' },
      shaft: { speaker: 'npc:grimma-ironsong', text: 'Still here? Old Nail Shaft’s up the valley. The shard won’t walk to me, and the rust-wraiths won’t let it.' },
      judge: { speaker: 'npc:grimma-ironsong', text: 'You’ve got it. I can smell the rust on you. Take it to Hedda. I’ll be behind you. Somebody has to be.' },
      comp: {
        speaker: 'npc:grimma-ironsong', text: 'What?',
        choices: [
          { text: '“How are you faring, Grimma?”', to: 'faring', once: true },
          { text: '“Tell me about the Orrin.”', to: 'orrin', once: true, tag: 'lore' },
          { text: '“Will you work my gear?”', to: 'gear' },
          { text: '“Nothing.”', to: null, tag: 'leave' },
        ],
      },
      faring: { speaker: 'npc:grimma-ironsong', text: 'Proved right and homeless. I’ve had worse winters. Not many. Don’t look at me like that. Hedda spoke up, or you did; either way my name’s back in somebody’s mouth, and that’s halfway to a ledger.', next: 'comp' },
      orrin: { speaker: 'npc:grimma-ironsong', effects: [{ unlockLore: 'lore:the-orrun' }], text: 'Our fathers. Giants of living iron, made from the slag of Orr’s forge. They dug down to wake him and the heat rusted them from the inside. We’re what was left: smaller, shorter-lived, more stubborn. You’ll see them standing in the passes. Don’t climb on them. It’s rude.', next: 'comp' },
      gear: { speaker: 'npc:grimma-ironsong', text: 'Bring it to an anvil and I’ll sing it a rune. Not in the snow. I’m not a savage.', next: 'comp' },
    },
  },
  {
    id: 'dialogue:ch2-hedda-general', name: 'Hedda: General',
    entries: [
      { when: { flag: 'act1.hedda_spoke' }, node: 'spoke' },
      { when: { flag: 'act1.nails_exposed' }, node: 'exposed' },
      { when: { flag: 'act1.nails_kept' }, node: 'kept' },
      { node: 'shut' },
    ],
    nodes: {
      shut: { speaker: 'npc:hedda-stonebrow', text: 'The gate is shut, human. Asking twice does not make it less shut.' },
      spoke: { speaker: 'npc:hedda-stonebrow', text: 'The Thane has not taken my voice yet. He says he is still deciding. I find I sleep better than I have since autumn. Strange, what a little truth does.' },
      exposed: { speaker: 'npc:hedda-stonebrow', mood: 'sad', text: 'The gate is open to you. Pass through. Do not expect the holds to thank you; they are too busy being frightened.' },
      kept: { speaker: 'npc:hedda-stonebrow', text: 'The gate is open to the Queen’s envoy. We do not speak of the shaft. Korr nagh.' },
    },
  },
];

export default dialogues;
