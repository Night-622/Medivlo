/** Dialogue: Act II Ch5 (north, part 2), quest:the-wolf-moot. Ironspine is in act2-ch5-north.ts. Owner: Claude 4. */
import type { DialogueDef, NarrativeEffect } from '@/core';

const Q = 'quest:the-wolf-moot';
const stg = (stage: string) => ({ questStage: Q, stage });
const outcome = (v: string) => ({ flag: 'act2.moot_outcome', op: '==' as const, value: v });
const route = (v: string) => ({ flag: 'act2.moot_route', op: '==' as const, value: v });
const done = (n: 1 | 2 | 3) => ({ setFlag: `act2.riddle_${n}_done`, value: true });
const won: NarrativeEffect = { addFlag: 'act2.riddles_won', amount: 1 };
const night = { hour: [21, 5] as [number, number] };

/** The Ember moment. Only ever reached through entries/paths guarded by `not act2.ember_wolf_claimed`. */
const claimWolf: NarrativeEffect[] = [
  { setFlag: 'act2.ember_wolf_claimed', value: true },
  { addFlag: 'world.embers_held', amount: 1 },
  { setFlag: 'ashmark.rank', value: 4 },
  { unlockLore: 'lore:the-seven-embers', section: 'wolf' },
];
const INTO_HAND = 'It goes into your marked hand cold and bright, like a star sinking into deep water.';
/** Outcome flags are set before the route so the moot stage branches on the outcome. */
const allied: NarrativeEffect[] = [{ setFlag: 'act2.moot_outcome', value: 'allied' }];
const stolen: NarrativeEffect[] = [{ setFlag: 'act2.moot_outcome', value: 'stolen' }, { setFlag: 'act2.hrothi_invasion', value: true }];

const dialogues: DialogueDef[] = [
  // ----- Ketil at the north-pass camp
  {
    id: 'dialogue:ch5n-ketil-pass', name: 'Ketil: The northern pass',
    entries: [{ when: { flag: 'act2.northpass_open' }, node: 'open' }, { node: 'start' }],
    nodes: {
      open: { speaker: 'npc:ketil-wolfsbane', text: 'The pass is open, burning-hand. Three days over the top, if the wind lets us. Stay in my tracks.' },
      start: { speaker: 'narrator', text: 'The camp sits in the last of the pines below the northern pass: a ring of hide tents, a fire of green wood that smokes more than it burns, and a dozen Hrothi in furs too thin for the cold. They are young, every one of them, and every one of them is too thin. A wolf’s skull is nailed to the nearest tree. Beneath it a young man with storm-blue tattoos climbing his throat is sharpening a bearded axe that does not need it.', next: 'hello' },
      hello: {
        speaker: 'npc:ketil-wolfsbane',
        text: 'Burning-hand. (He grins. His teeth are very white in a starved face.) We heard of you before the snow did: a southerner with a star in the fist, walking the world and picking up the others like a crow after a battle. I am Ketil, Thrain’s son, Wolfsbane by my own axe. Sit. We have nothing to give you but fire, and not much of that.',
        choices: [
          { text: '“Why do they call you Wolfsbane?”', to: 'bane', once: true },
          { text: '“What is a Hrothi war-band doing on the south side of the pass?”', to: 'watch', once: true },
          { text: '“You’re starving, all of you. That’s why you want the south.”', to: 'hungry', once: true, tag: 'persuade', check: { stat: 'will', dc: 15, failTo: 'hungry-fail' } },
          { text: '[Reaver] “I know hunger. Mine drinks from my own veins.”', to: 'reaver', when: { classIs: 'class:reaver' }, tag: 'class', once: true },
          { text: '[Warden] “If you march south, I’ll be on the wall.”', to: 'warden', when: { classIs: 'class:warden' }, tag: 'class', once: true },
          { text: '[Brute] “I’ll arm-wrestle you for the road.”', to: 'brute', when: { dialogueTag: 'brute' }, tag: 'trait', effects: [{ setFlag: 'act2.northpass_open', value: true }] },
          { text: '“Take me over the pass to Skelvik.”', to: 'go', effects: [{ setFlag: 'act2.northpass_open', value: true }] },
        ],
      },
      bane: { speaker: 'npc:ketil-wolfsbane', text: 'A rime-wolf took my sister’s boy off the byre-step at Hrimfjord. I went into the white after it with this axe, a knife, and no coat. I came back with its skin and without the toes of my left foot. (He shrugs.) The name was cheaper than boots.', next: 'hello' },
      watch: { speaker: 'npc:ketil-wolfsbane', text: 'Watching it. Counting your roads. When the Moot says go, someone must know the way south, and I mean it to be me. Your Lord Protector held this pass once, with forty men. You sing about it. (He spits into the fire.) So do we. Differently.', next: 'hello' },
      hungry: { speaker: 'npc:ketil-wolfsbane', mood: 'angry', text: '(The grin goes.) We ate the dogs at midwinter. Then the seed-corn. My mother gave her share to my sister’s girls and walked out into the snow so there would be one mouth fewer. That is the old way, and I hate it. The south has granaries. I have seen their roofs from this pass. So do not talk to me of war like a priest. War is only hunger with an axe in its hand.', next: 'hello' },
      'hungry-fail': { speaker: 'npc:ketil-wolfsbane', mood: 'happy', text: 'Hungry? (He laughs, too loud.) We’re Hrothi. We are always hungry. It keeps the edge on us.', next: 'hello' },
      reaver: { speaker: 'npc:ketil-wolfsbane', text: '(He looks at you with new interest.) A blood-caller. The storm-callers say your kind burn bright and short. (He grins again.) So do we, these days.', next: 'hello' },
      warden: { speaker: 'npc:ketil-wolfsbane', mood: 'happy', text: 'Good! Then there will be one face on the wall worth the climb. (He means it kindly.)', next: 'hello' },
      brute: { speaker: 'narrator', text: 'He looks you up and down, and then he sets his elbow on a stump and holds out his hand. The whole war-band comes running. You strain over the stump with a dozen starving Hrothi roaring in your ears, and it does not matter in the end which of you wins, because Ketil is laughing too hard to care.', next: 'go' },
      go: { speaker: 'npc:ketil-wolfsbane', mood: 'happy', text: 'Over the pass? To the Moot? (He is on his feet before you finish.) Burning-hand, I would have carried you. A star falls on the Moot-stones at Lanternmass, and a month after, a southerner with a star in the fist comes walking up out of the south to look at it. If that is not Calun laughing in our ears, I don’t know what is. The Jarl will have to listen now.', next: 'go2' },
      go2: { speaker: 'npc:ketil-wolfsbane', text: 'Three days over the top, if the wind lets us. Stay in my tracks. The white up there eats people who don’t.' },
    },
  },
  {
    id: 'dialogue:ch5n-ketil-general', name: 'Ketil: General',
    entries: [
      { when: outcome('stolen'), node: 'war' },
      { when: outcome('allied'), node: 'allied' },
      { when: outcome('broken'), node: 'broken' },
      { when: { any: [stg('moot'), stg('deeds'), stg('duel'), stg('wits'), stg('verdict')] }, node: 'moot' },
      { when: stg('skelvik'), node: 'skelvik' },
      { node: 'idle' },
    ],
    nodes: {
      idle: { speaker: 'npc:ketil-wolfsbane', text: 'Burning-hand. The wind is out of the north. It is always out of the north.' },
      skelvik: { speaker: 'npc:ketil-wolfsbane', text: 'Skelvik hall. The Jarl will be counting something; she is always counting something. Tell her what you told me. Tell her the star called you.' },
      moot: {
        speaker: 'npc:ketil-wolfsbane',
        text: 'However you claim it, burning-hand, the young clans follow the star. If it goes south in your fist, perhaps we follow you instead. (He means it as a joke. Mostly.)',
        choices: [
          { text: '“And if the Moot says no war?”', to: 'nowar', once: true },
          { text: '“There’s nothing in the south but more hungry people.”', to: 'south', once: true, tag: 'persuade', check: { stat: 'will', dc: 15, failTo: 'south-fail' } },
          { text: '“Until the stones, then.”', to: null, tag: 'leave' },
        ],
      },
      nowar: { speaker: 'npc:ketil-wolfsbane', text: 'Then the Moot is old men, and old men die in winters like this one. I am not saying I would help them. I am saying I would not have to.', next: 'moot' },
      south: { speaker: 'npc:ketil-wolfsbane', mood: 'sad', text: '(He is quiet a while, turning the axe in his hands.) …I know. I am not a fool. But a fool with an axe can at least choose where he starves. Sitting in the snow, waiting, it is not a death. It is just a long time.', next: 'moot' },
      'south-fail': { speaker: 'npc:ketil-wolfsbane', text: 'Then we will eat the hungry people. (He laughs. Nobody else at the fire does.)', next: 'moot' },
      allied: { speaker: 'npc:ketil-wolfsbane', text: 'The Moot gave you the star. (He shrugs, but he is not smiling.) So we wait, and we starve politely. When your last war comes, burning-hand, I want the front of it. I would rather die of an axe than of waiting.' },
      broken: { speaker: 'npc:ketil-wolfsbane', mood: 'angry', text: 'You broke the Moot. The clans have gone home to feud, mine with them. Well. Feuds are warm, at least.' },
      war: { speaker: 'npc:ketil-wolfsbane', mood: 'angry', text: '(He does not speak to you. He only draws his thumb across his throat, slowly, and smiles.)' },
    },
  },
  // ----- Sigrun in Skelvik hall
  {
    id: 'dialogue:ch5n-sigrun-hall', name: 'Sigrun: Skelvik hall',
    entries: [{ when: { flag: 'act2.sigrun_met' }, node: 'again' }, { node: 'start' }],
    nodes: {
      again: { speaker: 'npc:sigrun-ice-eye', text: 'The Moot gathers at the stones, Ember-hand. Go when you are ready. I will be there; I am always there.' },
      start: {
        speaker: 'narrator', effects: [{ setFlag: 'act2.sigrun_met', value: true }],
        text: 'Skelvik hall is long and dark and very nearly as cold as the fjord outside. The hearth runs the length of it and only one end is lit: they are saving wood. Along the walls the shields of the dead hang in rows, and too many of them are new. At the lit end a tall woman in grey mail sits in the jarl’s chair with a stick across her knees, notching it with a knife. One of her eyes is grey-blue. The other is white as a frozen pond.',
        next: 'hello',
      },
      hello: {
        speaker: 'npc:sigrun-ice-eye',
        text: 'Ketil’s southerner. The one with the star in the fist. Sit, if you like; the bench is cold, but everything is. I am Sigrun, Ulfar’s widow, jarl of Skelvik for as long as the Moot lets me be. (She makes another notch.) Forgive me. I am counting graves. We dig them in autumn now, before the ground freezes, because we know we will need them.',
        choices: [
          { text: '“The Ember. Where is it?”', to: 'ember' },
          { text: '“Ice-Eye. How did you come by the name?”', to: 'eye', once: true },
          { text: '“The Ballad of the Northern Pass. Was your father the jarl in it?”', to: 'harrow', once: true, when: { any: [{ flag: 'act1.ruler', op: '==', value: 'harrow' }, { loreUnlocked: 'lore:book-ballad-of-the-northern-pass' }] } },
          { text: '[Oathbound] “The Lanternate would call this idolatry.”', to: 'oathbound', when: { classIs: 'class:oathbound' }, tag: 'class', once: true },
          { text: '[Outlander] “I have wintered in worse halls.”', to: 'outlander', when: { dialogueTag: 'outlander' }, tag: 'trait', once: true },
        ],
      },
      eye: { speaker: 'npc:sigrun-ice-eye', text: 'Ulfar and I went over the ice of Hrimfjord in a blizzard with a sledge of seal-meat for the steadings. Three days. I came back with the meat, and with him, and with this. (She touches the white eye.) He used to say I could see the cold coming. These days I see nothing else.', next: 'hello' },
      harrow: { speaker: 'npc:sigrun-ice-eye', text: 'He was. Do you know what happened on the third night? Osric Harrow came to my father’s tent with a lamp and a chest of grain-tallies, and my father took them and went home, and the south made a song about courage. (A thin smile.) I do not hate Harrow. He fed us. I hate that he could, and we could not.', next: 'hello' },
      oathbound: { speaker: 'npc:sigrun-ice-eye', text: 'Your Lanternate burned the storm-callers of Halvik in my grandmother’s time, and called it charity. They may call this whatever they please. They are a long way south, and the cold is here.', next: 'hello' },
      outlander: { speaker: 'npc:sigrun-ice-eye', mood: 'happy', text: 'There are no worse halls. But I like that you lie for courtesy. Ulfar did that.', next: 'hello' },
      ember: { speaker: 'npc:sigrun-ice-eye', text: 'On the Moot-stones, where it fell. It came down at Lanternmass with a sound like the sky tearing, and when we got there the snow had gone from the stones in a ring a hundred paces wide, and the grass under it was green. Green, in the Frostreach, at midwinter. Every man who saw it went down on his knees. I nearly did.', next: 'sign' },
      sign: { speaker: 'npc:sigrun-ice-eye', text: 'And so the clans say what clans say. Calun the Wanderer threw down a star to show us the road: south, to the granaries, to warm halls and fat cattle. The young say it loudest. Ketil’s war-band has sat on your side of the pass for a month, counting your roads.', next: 'sign2' },
      sign2: { speaker: 'npc:sigrun-ice-eye', mood: 'sad', text: 'I have called the Moot, because if I do not call it, Ketil will, and then it will not be my Moot. Every clan in the Frostreach will be at the stones. They will raise the star on a spear and march south behind it, and I will lead them, or I will be thrown down and someone else will.', next: 'law' },
      law: {
        speaker: 'npc:sigrun-ice-eye',
        text: '(She looks at you with her one good eye.) Unless the star is not ours. By Moot-law any guest may claim against the Moot: by deed, by wit or by blood. Nobody has used that law in forty years. Come to the stones, Ember-hand, and make your claim. I would rather lose a star than lose my people on your walls.',
        choices: [
          { text: '“Why would you help me take it?”', to: 'why', once: true },
          { text: '“I’ll see you at the stones.”', to: null },
        ],
      },
      why: { speaker: 'npc:sigrun-ice-eye', text: 'Because I have done the counting. Half of us would reach your granaries. The other half would feed your crows on the way, and the summer after, your Lord’s soldiers would come north and burn whatever was left. The young cannot count. I can. It is the only thing I am still good for.', next: 'law' },
    },
  },
  // ----- The Wolf-Moot (Sigrun at the Moot-stones; re-entered by quest stage and riddle progress)
  {
    id: 'dialogue:ch5-moot', name: 'The Wolf-Moot',
    entries: [
      { when: { flag: 'act2.ember_wolf_claimed' }, node: 'over' },
      { when: outcome('stolen'), node: 'thief' },
      { when: { flag: 'act2.moot_outcome' }, node: 'resume' },
      { when: { all: [stg('verdict'), route('deeds')] }, node: 'deeds-done' },
      { when: { all: [stg('verdict'), route('duel')] }, node: 'duel-done' },
      { when: { all: [stg('wits'), { flag: 'act2.riddle_3_done' }] }, node: 'judge' },
      { when: { all: [stg('wits'), { flag: 'act2.riddle_2_done' }] }, node: 'r3' },
      { when: { all: [stg('wits'), { flag: 'act2.riddle_1_done' }] }, node: 'r2' },
      { when: stg('wits'), node: 'r1' },
      { when: stg('deeds'), node: 'deeds-wait' },
      { when: stg('duel'), node: 'duel-wait' },
      { when: stg('moot'), node: 'start' },
      { node: 'idle' },
    ],
    nodes: {
      idle: { speaker: 'npc:sigrun-ice-eye', text: 'The Moot is not gathered, Ember-hand. Come to the stones when it is.' },
      over: { speaker: 'npc:sigrun-ice-eye', text: 'The star is gone from the stones. The grass in the ring is already browning under the frost. It was only ever grass.' },
      thief: { speaker: 'npc:sigrun-ice-eye', mood: 'angry', text: '(She does not raise her voice. That is worse.) You came to my hall as a guest. You ate my salt-fish. And you took the star off the stones in the dark, like a fox out of a byre. Go south, Ember-hand. Go quickly. The war-horns are already blowing, and Ketil is not waiting for my word any more. Nobody is.' },
      resume: { speaker: 'narrator', text: 'The Ember of the Wolf still burns on the Speaking-Stone, waiting for the hand the Moot gave it to.', next: 'give' },
      'deeds-wait': { speaker: 'npc:sigrun-ice-eye', text: 'Four rime-wolves, Ember-hand. The high steadings are up the valley, and the wolves are never far from the steadings now. The Moot will wait. It has had a great deal of practice.' },
      'duel-wait': { speaker: 'npc:sigrun-ice-eye', text: 'Hrolf is in the ring. He has been standing in the ring since dawn, and he does not feel the cold. Go in when you are ready.' },
      // --- the Moot assembles
      start: { speaker: 'narrator', effects: [{ unlockLore: 'lore:the-wolf-moot-stones' }], text: 'The Moot-stones stand on a headland above the frozen sea: a ring of grey standing-stones taller than longships, carved with wolves and storms and ships. Inside the ring the snow has gone. There is grass, green and wet and steaming, in a circle a hundred paces wide, and on the flat Speaking-Stone at its heart the Ember of the Wolf burns blue-white, like a star seen through ice. Round the ring stand the clans: hundreds of Hrothi in furs and mail, wolf-pelt banners stiff with frost, and every face is gaunt.', next: 'start2' },
      start2: { speaker: 'narrator', text: 'Ketil stands at the front of the young clans with his axe on his shoulder. Sigrun stands at the Speaking-Stone. When she lifts her hand the Moot goes quiet all at once, the way a wolf-pack goes quiet at a horn.', next: 'start3' },
      start3: { speaker: 'npc:sigrun-ice-eye', text: 'Hear me, Moot. A guest has come from the south to claim the star on the Speaking-Stone. By the old law a guest may claim by deed, by wit or by blood, and the Moot will judge. Ketil Thrainsson. Speak for the star.', next: 'ketil' },
      ketil: { speaker: 'npc:ketil-wolfsbane', text: '(Loud, for the whole ring.) What is there to say? Calun throws a star down on our stones in the dead of winter, the grass comes up green under it, and a month later the south sends us a burning-hand to pick it up! The Wanderer is laughing at us for slow fools. The star is the road, and the road goes south. Let the southerner claim. When the southerner loses, we march. (The young clans roar.)', next: 'hub' },
      hub: {
        speaker: 'npc:sigrun-ice-eye', text: 'Guest. How do you claim?',
        choices: [
          { text: '“Why does the Moot believe it is Calun’s sign?”', to: 'calun', once: true, tag: 'lore' },
          { text: '“By deed. Set me a task.”', to: 'deeds-set', effects: [{ setFlag: 'act2.moot_route', value: 'deeds' }] },
          { text: '“By wit. Riddle me.”', to: 'wits-set', effects: [{ setFlag: 'act2.moot_route', value: 'wits' }] },
          { text: '“By blood. Name your champion.”', to: 'duel-set', tag: 'aggressive', effects: [{ setFlag: 'act2.moot_route', value: 'duel' }] },
          { text: '“Your people are starving. So are mine. There is nothing in the south to take.”', to: 'persuade', tag: 'persuade', check: { stat: 'will', dc: 20, failTo: 'persuade-fail' } },
          { text: '[Queen’s letter] Break Queen Aldith’s seal and read her letter to the Moot.', to: 'letter', when: { all: [{ flag: 'act1.ruler', op: '==', value: 'aldith' }, { flag: 'act1.aldith_letter' }] }, effects: [...allied, { setFlag: 'act2.moot_route', value: 'persuade' }] },
          { text: '“Give me a night to think on it.”', to: 'night', tag: 'leave' },
        ],
      },
      calun: { speaker: 'npc:sigrun-ice-eye', effects: [{ unlockLore: 'lore:calun-the-wanderer' }], text: 'Calun is the Wanderer: wind, and luck, and the open road. When a ship finds its way home through a storm, that is Calun. When a star falls, that is Calun pointing. (Lower, for you alone.) And when a people are starving, every falling thing is a sign.', next: 'hub' },
      night: { speaker: 'narrator', text: 'Sigrun nods. The Moot will stand until you choose; it has stood for worse. Behind her the star burns on the Speaking-Stone, and you notice, as the light goes, how few spears are left to watch it once the clans go back to their fires.' },
      // --- deeds
      'deeds-set': { speaker: 'npc:sigrun-ice-eye', text: 'A deed, then. (She turns to the ring.) Who has a deed that wants doing?', next: 'deeds-set2' },
      'deeds-set2': { speaker: 'narrator', text: 'A woman pushes out from among the steading-clans, a big woman in a sheepskin with nothing in her face at all. “Rime-wolves,” she says. “Out of the white, since Lanternmass. Grey as frost, eyes like ice in a well. They took my son off the byre-step. They took four children from Hrimstead. Let the southerner kill wolves.”', next: 'deeds-set3' },
      'deeds-set3': { speaker: 'npc:sigrun-ice-eye', text: 'Four rime-wolves, Ember-hand. Bring the Moot four pelts, and the Moot will weigh them against the star.' },
      'deeds-done': {
        speaker: 'narrator', effects: allied,
        text: 'You come back to the Moot-stones with four rime-wolf pelts over your shoulders, grey as frost and stiff with cold. The steading-woman takes one in her arms and holds it like a child. Nobody needs to ask the Moot; the lawspeakers’ staves are already striking the stones.',
        next: 'deeds-done2',
      },
      'deeds-done2': { speaker: 'npc:sigrun-ice-eye', text: 'A deed for the steadings, done by a guest, while the Moot stood about the stones and argued. Shame enough for all of us. The Moot gives you the star.', next: 'give' },
      // --- blood
      'duel-set': { speaker: 'npc:sigrun-ice-eye', text: 'Blood, then. (Something in her face closes, like a door.) I name my champion: Hrolf the Unbowed, who has never once been thrown in the ring. He stands for the star. Go into the ring when you are ready, Ember-hand. To yield, or to fall. (Ketil whoops.)' },
      'duel-done': {
        speaker: 'narrator', effects: allied,
        text: 'Hrolf the Unbowed lies in the trampled grass of the ring, and for a long breath the whole Moot is silent. Then it roars, every clan of it, and this time it is roaring for you.',
        next: 'duel-done2',
      },
      'duel-done2': { speaker: 'npc:sigrun-ice-eye', text: 'Blood is the oldest law, and the plainest. The Moot gives you the star.', next: 'give' },
      // --- persuasion
      persuade: {
        speaker: 'narrator', effects: [...allied, { setFlag: 'act2.moot_route', value: 'persuade' }],
        text: 'You do not speak to the Jarl. You speak to the ring. You tell them of Haldren with its gates shut on its own refugees; of Varn drowned; of granaries swept bare before the first snow; of children in the Kingsvale eating bark. You tell them the south they mean to plunder is starving too, and that the only thing at the end of Ketil’s road is another ring of thin faces, behind a wall.',
        next: 'persuade2',
      },
      persuade2: { speaker: 'narrator', text: 'Nobody answers. But the steading-woman whose son the wolves took sits down in the snow and puts her face in her hands, and one by one, from the oldest clans outward, the spears of the Moot go down.', next: 'persuade3' },
      persuade3: { speaker: 'npc:sigrun-ice-eye', mood: 'sad', text: 'Hungry people, behind a wall. (She closes her good eye.) Yes. I have counted that too. The Moot gives you the star, Ember-hand, and the war goes back in its scabbard.', next: 'give' },
      'persuade-fail': { speaker: 'npc:sigrun-ice-eye', text: '(Not unkindly.) Fine words, guest. The Moot has heard fine words from the south before. They usually come a little before the soldiers.', next: 'hub' },
      letter: { speaker: 'narrator', text: 'You break the Queen’s seal and read her letter to the ring in your own voice, which shakes. Aldith of Haldmarch writes to the Wolf-Moot as a queen to her equals. She has no grain to give, she says, and she will not pretend that she has; but every child the Frostreach cannot feed this winter will be fed at Haldren, beside her own people’s children, on the same half-rations, until the thaw. In return she asks the Moot for nothing but its spears, when the Drowned come.', next: 'letter2' },
      letter2: { speaker: 'npc:sigrun-ice-eye', text: '(A long silence.) Half-rations. She does not lie to us, your girl-queen. Harrow would have sent silver and a smile. The Moot gives you the star, Ember-hand, and Skelvik will send its children south in sledges, not in longships.', next: 'give' },
      // --- wits: the riddle-game
      'wits-set': { speaker: 'npc:sigrun-ice-eye', effects: [{ unlockLore: 'lore:hrothi-kennings' }], text: '(For the first time, she very nearly smiles.) Wit. Ulfar would have liked you. He loved the riddle-game; he made a hundred riddles and was proud of nine. I will ask you three of the nine. Answer two true, and the Moot weighs your wit against the star. Answer fewer, and the Moot laughs you out of the ring, and the star goes south on a spear.', next: 'r1' },
      r1: {
        speaker: 'npc:sigrun-ice-eye',
        text: 'Riddle me this. I am a horse of the whale-road with a hundred legs of pine, and I walk on none of them. I wear a dragon for a face and wolves along my flanks. In summer I carry the living to the sword-moot; in winter I carry the dead to the Wanderer, and my bed is fire. What am I?',
        choices: [
          { text: '“A storm. Calun’s own horse, that runs on the sea.”', to: 'r1-wrong', effects: [done(1)] },
          { text: '“A war-banner: carried to battle, and burned for the dead.”', to: 'r1-wrong', effects: [done(1)] },
          { text: '“A longship. In summer a raider, in winter a pyre for the dead.”', to: 'r1-right', tag: 'lore', effects: [done(1)], check: { stat: 'intellect', dc: 15, failTo: 'r1-falter' } },
          { text: '[Scholar] “The whale-road’s horse is a ship. Your skalds call the oars its legs, and you burn your jarls in it.”', to: 'r1-right', when: { dialogueTag: 'scholar' }, tag: 'trait', effects: [done(1)] },
        ],
      },
      'r1-right': { speaker: 'npc:sigrun-ice-eye', effects: [won], text: 'A ship. (A murmur goes round the ring.) Ulfar went to Calun in one, the autumn before last. We had no pitch to spare for it. It burned badly. Next.', next: 'r2' },
      'r1-falter': { speaker: 'narrator', text: 'You have the answer, you are nearly sure of it; but the Hrothi give back a riddle as they ask it, in kennings, and when you open your mouth the kenning knots on your tongue. “A whale-horse. A sea-wolf. A… boat?” The ring laughs. Sigrun does not. “Near,” she says. “Near is not a ship.”', next: 'r2' },
      'r1-wrong': { speaker: 'npc:sigrun-ice-eye', text: 'No. A ship: the whale-road’s horse, and the oars are its legs. (The young clans jeer.) Next.', next: 'r2' },
      r2: {
        speaker: 'npc:sigrun-ice-eye',
        text: 'I am made of breath, and yet no sword can cut me. I am lighter than a feather, and yet I have dragged whole clans over the sea to die. A jarl may give me away and still keep me; a coward may keep me close and still have lost me. What am I?',
        choices: [
          { text: '“An oath.”', to: 'r2-right', tag: 'lore', effects: [done(2)], check: { stat: 'intellect', dc: 15, failTo: 'r2-falter' } },
          { text: '“A name.”', to: 'r2-wrong', effects: [done(2)] },
          { text: '“A song.”', to: 'r2-wrong', effects: [done(2)] },
          { text: '[Devout] “An oath. Vor hears every one of them, and weighs it.”', to: 'r2-right', when: { dialogueTag: 'devout' }, tag: 'trait', effects: [done(2)] },
          { text: '[Oathbreaker] “An oath. I know, because I have lost one.”', to: 'r2-right', when: { dialogueTag: 'oathbreaker' }, tag: 'trait', effects: [done(2)] },
        ],
      },
      'r2-right': { speaker: 'npc:sigrun-ice-eye', effects: [won], text: 'An oath. (She looks at you for a long moment.) Remember that you said so, here, before the Moot. Last.', next: 'r3' },
      'r2-falter': { speaker: 'narrator', text: '“A word,” you say, and then, too late, “a sworn word, an—” “A word is not an oath,” says Sigrun. “Words are cheap in the south, they tell me.” The young clans howl.', next: 'r3' },
      'r2-wrong': { speaker: 'npc:sigrun-ice-eye', text: 'No. An oath: breath that binds. (Ketil laughs loudest of anyone.) Last.', next: 'r3' },
      r3: {
        speaker: 'npc:sigrun-ice-eye',
        text: 'Last. A guest came to Skelvik on Lanternmass night and has not left. He eats at every board and is never full. He sleeps in every bed and is never warm. The jarl cannot drive him out with axes; the skald cannot drive him out with songs. Only one guest can make him leave, and he hates that guest above all things. Name them both.',
        choices: [
          { text: '“Hunger. And the guest he hates is bread.”', to: 'r3-half', effects: [done(3)] },
          { text: '“The Long Winter. And the guest it hates is fire, which I carry.”', to: 'r3-right', tag: 'lore', effects: [done(3)], check: { stat: 'intellect', dc: 15, failTo: 'r3-falter' } },
          { text: '“Death. And the guest he hates is a newborn child.”', to: 'r3-wrong', effects: [done(3)] },
          { text: '[Outlander] “The Long Winter, and the fire that ends it. I have slept in every cold place there is.”', to: 'r3-right', when: { dialogueTag: 'outlander' }, tag: 'trait', effects: [done(3)] },
        ],
      },
      'r3-right': { speaker: 'narrator', effects: [won], text: 'You lift your marked hand, and the Ember-light shows red through the skin. The ring goes very quiet. Sigrun looks at your hand a long time. “The Long Winter,” she says, “and the fire.” Then, so softly that only you can hear: “Ulfar made that one the week he died. He never told me the answer. I do not think he knew it.”', next: 'judge' },
      'r3-half': { speaker: 'npc:sigrun-ice-eye', text: 'Hunger eats at every board, aye. But hunger sleeps warm enough in a full bed. No. The Long Winter, and the fire.', next: 'judge' },
      'r3-falter': { speaker: 'narrator', text: 'You have it, the winter and the fire, but in the kenning-tongue it comes out as “the cold guest, and the… hot guest,” and the young clans fall about laughing. Sigrun shakes her head. “Near. Always near, southerner.”', next: 'judge' },
      'r3-wrong': { speaker: 'npc:sigrun-ice-eye', text: 'Death sleeps warm enough, in the end. No. The Long Winter, and the fire.', next: 'judge' },
      judge: {
        speaker: 'narrator',
        text: 'The Moot murmurs, clan to clan, the way the sea murmurs before the tide turns. Then the lawspeakers lift their staves.',
        choices: [
          { text: '[Await the Moot’s judgement]', to: 'wits-won', when: { flag: 'act2.riddles_won', op: '>=', value: 2 }, effects: allied },
          { text: '[Await the Moot’s judgement]', to: 'wits-lost', when: { not: { flag: 'act2.riddles_won', op: '>=', value: 2 } }, effects: [{ setFlag: 'act2.moot_outcome', value: 'broken' }] },
        ],
      },
      'wits-won': { speaker: 'npc:sigrun-ice-eye', text: 'The staves come down on the stones, once, all together. The Moot has weighed it: wit against a star, and the wit is heavier. The Moot gives you the star.', next: 'give' },
      'wits-lost': { speaker: 'narrator', mood: 'afraid', text: 'The staves come down on the stones, ragged, and before the sound has died the shouting has begun: Ketil’s young warriors crying that the star is theirs now by right; the steading-folk crying that the guest made the claim and the guest should have it; the old jarls shouting at everyone. Someone shoves. Someone draws.', next: 'wits-lost2' },
      'wits-lost2': { speaker: 'npc:sigrun-ice-eye', mood: 'sad', text: '(She walks through the shouting to the Speaking-Stone as if it were not there.) Take it. Take it and go. Calun has laughed at us long enough. There will be no march south now, Ember-hand. There will be no anything. They will go home and feud until the thaw, if there is a thaw.', next: 'give' },
      // --- the Ember (all outcomes but theft)
      give: {
        speaker: 'narrator', effects: claimWolf,
        text: `Sigrun lifts the Ember of the Wolf from the Speaking-Stone in her bare hands. It does not burn her; it only shines through her fingers, pale as ice-light. She carries it across the green ring and lays it in your palm. ${INTO_HAND}`,
        choices: [
          { text: '[Sigrun speaks]', to: 'frostjaw', when: outcome('allied') },
          { text: '[The Moot breaks]', to: 'broken', when: { not: outcome('allied') } },
        ],
      },
      frostjaw: { speaker: 'npc:sigrun-ice-eye', text: 'The Moot gives you the star, and Skelvik gives you this. (She draws from across her back a great bearded axe with a head as white as frost.) Frostjaw. It was Ulfar’s. It has never been south of the pass. When your last war comes, carry it there and send for us, and the Wolf-Moot will come. Not for plunder. For you.', next: 'ketil-allied' },
      'ketil-allied': { speaker: 'npc:ketil-wolfsbane', text: '(He has not moved. When he speaks, it is not loud.) So we wait. We wait, and we starve politely. (He turns on his heel, and stops.) When the last war comes, burning-hand, I want the front of it.', next: 'ysolde' },
      broken: { speaker: 'narrator', text: 'Behind you the Moot is coming apart: clan from clan, banner from banner, kin from kin. By nightfall the headland is empty but for trampled grass, already freezing, and a ring of stones with nobody to stand in it.', next: 'ysolde' },
      ysolde: { speaker: 'npc:ysolde', mood: 'hollow', text: '(A voice in the cold light, close as your own breath.) How cold it is up here, little spark. All those thin children. You have saved them for a little while. Bring it home, and I will save them for ever.' },
    },
  },
  {
    id: 'dialogue:ch5n-sigrun-general', name: 'Sigrun: General',
    entries: [
      { when: outcome('stolen'), node: 'stolen' },
      { when: { all: [{ questActive: Q }, { not: { flag: 'act2.ember_wolf_claimed' } }, { hour: [21, 6] }] }, node: 'night' },
      { when: outcome('allied'), node: 'allied' },
      { when: outcome('broken'), node: 'broken' },
      { node: 'idle' },
    ],
    nodes: {
      idle: { speaker: 'npc:sigrun-ice-eye', text: 'The bench is still cold, Ember-hand. I am still counting.' },
      night: { speaker: 'npc:sigrun-ice-eye', text: 'The Moot sleeps by its fires, Ember-hand, and so should you. Come to the stones at first light. (She turns back to her counting-stick.) The star will keep. It is the only thing up here that does.' },
      allied: {
        speaker: 'npc:sigrun-ice-eye', text: 'Skelvik keeps its word, Ember-hand. When you send, we come. Until then we eat what the sea gives us, and I count a little less often.',
        choices: [
          { text: '“How are your people?”', to: 'people', once: true },
          { text: '“Tell me about Ulfar.”', to: 'ulfar', once: true },
          { text: '“Until the last war, Jarl.”', to: null, tag: 'leave' },
        ],
      },
      people: { speaker: 'npc:sigrun-ice-eye', text: 'Hungry. Alive. Both at once, which is the trick of it. Ketil took his band out on the ice after seal, and came back with three. He is calling it a war. Let him.', next: 'allied' },
      ulfar: { speaker: 'npc:sigrun-ice-eye', mood: 'sad', text: 'He made riddles and he made bad jokes, and he could not sail to save his life, and he was the best man in the Frostreach. He gave his share to the steadings in the autumn, the way I did, and the cough took him in a week. I have his axe out of the hall now. It is strange how much lighter the wall is.', next: 'allied' },
      broken: { speaker: 'npc:sigrun-ice-eye', mood: 'sad', text: 'The clans have gone home to feud. I am the jarl of a cold hall and a counting-stick. (She does not look up.) You were not wrong to claim it. I only wish you had been cleverer.' },
      stolen: { speaker: 'npc:sigrun-ice-eye', mood: 'angry', text: 'Get out of my hall.' },
    },
  },
  // ----- obj:wolf-ember-shrine: the Speaking-Stone (theft by night; also re-claims after any Moot outcome)
  {
    id: 'dialogue:obj-wolf-ember-shrine', name: 'Object: The Speaking-Stone',
    entries: [
      { when: { flag: 'act2.ember_wolf_claimed' }, node: 'empty' },
      { when: outcome('stolen'), node: 'steal-resume' },
      { when: { flag: 'act2.moot_outcome' }, node: 'given' },
      { when: { all: [stg('moot'), night] }, node: 'night' },
      { when: stg('moot'), node: 'day' },
      { node: 'idle' },
    ],
    nodes: {
      idle: { speaker: 'narrator', text: 'A flat stone at the heart of the Moot-ring, carved with a wolf swallowing the sun. Something burns on it, pale as starlight.' },
      empty: { speaker: 'narrator', text: 'The Speaking-Stone is bare. In the ring around it the green grass is already browning under the frost.' },
      day: { speaker: 'narrator', text: 'The Ember of the Wolf burns on the Speaking-Stone, and a hundred Hrothi are standing round the ring looking at it. Not now. By night there would be fewer eyes.' },
      given: {
        speaker: 'narrator', effects: claimWolf,
        text: `The Ember of the Wolf still burns on the Speaking-Stone, waiting for the hand the Moot gave it to. You take it up. ${INTO_HAND}`,
        next: 'ysolde',
      },
      night: {
        speaker: 'narrator',
        text: 'The Moot-stones by night. The clans have gone back to their fires along the headland, and only four spearmen keep the ring, huddled in the lee of the tallest stone with a skin of something passing between them. Inside the ring the grass steams. On the Speaking-Stone the Ember of the Wolf burns pale as a star in ice, and nobody is looking at it.',
        choices: [
          { text: '[Shade] Go in by the shadows of the stones.', to: 'take', when: { classIs: 'class:shade' }, tag: 'class', effects: stolen },
          { text: 'Cross the open grass while the spearmen drink.', to: 'take', effects: stolen, check: { stat: 'finesse', dc: 15, failTo: 'seen' } },
          { text: 'Walk straight in and take it.', to: 'seen', tag: 'aggressive', effects: stolen },
          { text: 'Leave it. Claim it at the Moot, in daylight.', to: null, tag: 'leave' },
        ],
      },
      take: {
        speaker: 'narrator', effects: claimWolf,
        text: `You go in low and fast. The grass is warm under your hands, warm as a living thing. You close your fingers on the Ember. ${INTO_HAND} The ring goes dark behind you. Nobody shouts. Not yet.`,
        next: 'dawn',
      },
      seen: {
        speaker: 'narrator', effects: claimWolf,
        text: `One of the spearmen looks up just as your hand closes on the Ember. ${INTO_HAND} The ring goes dark, and in the dark he is already shouting, and then the horns begin.`,
        next: 'dawn',
      },
      'steal-resume': {
        speaker: 'narrator', effects: claimWolf,
        text: `The ring is dark and the horns are already blowing along the headland. Your hand closes on the Ember. ${INTO_HAND}`,
        next: 'dawn',
      },
      dawn: { speaker: 'narrator', mood: 'afraid', text: 'By the time the sun comes up grey over the frozen sea you are far up the valley, and behind you every war-horn in the Frostreach is blowing. Not for a Moot. For a march.', next: 'ysolde-steal' },
      'ysolde-steal': { speaker: 'npc:ysolde', mood: 'hollow', text: '(A voice in the cold light.) Oh, little spark. Now they will come south after you, all those thin children, and die on your walls. You did not mean it. None of us ever means it.' },
      ysolde: { speaker: 'npc:ysolde', mood: 'hollow', text: '(A voice in the cold light, close as your own breath.) How cold it is up here, little spark. Bring it home.' },
    },
  },
];

export default dialogues;
