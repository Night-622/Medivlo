/**
 * Hollow Crown: Concordia NPCs. The Brindlecross fourteen (handoff Screens NPCS, docs/lore/hollow-crown/04-concordia.md)
 * and the 23 other bearers (one per class, generated; 04 "The bearers"). Owner: Claude 4. Places are Claude 2's:
 * home landmarks are `landmark:<vil>-<place>` for the handoff village places.
 */
import type { NarrativeCondition, NpcDef } from '@/core';
import { CAMPAIGNS } from '@/narrative/engine/classes';

const at = (quest: `quest:${string}`, stage: string): NarrativeCondition => ({ questStage: quest, stage });
const active = (quest: `quest:${string}`): NarrativeCondition => ({ questActive: quest });
const R = 'region:alder' as const;

const npcs: NpcDef[] = [
  {
    id: 'npc:maren', name: 'Maren Hollis', title: 'Huntress of the Gloamwood', school: 'hunt', origin: 'concord', trust: 1,
    services: ['Quest giver', 'Trains Huntsmen', 'Sells arrows'], region: R, home: 'landmark:brind-east-gate', lore: 'lore:hc-maren',
    schedule: [
      { from: 0, to: 24, at: 'landmark:gate-circle', activity: 'idle', when: { any: [at('quest:cc-through-the-arch', 'arch'), at('quest:cc-through-the-arch', 'wolves'), at('quest:cc-through-the-arch', 'maren')] } },
      { from: 0, to: 24, at: 'landmark:brind-elders-house', activity: 'idle', when: { any: [at('quest:cc-through-the-arch', 'road'), at('quest:cc-through-the-arch', 'godric')] } },
      { from: 21, to: 5, at: 'landmark:lodge-hunters-lodge', activity: 'sleep' },
    ],
    dialogue: [
      { when: { any: [at('quest:cc-through-the-arch', 'road'), at('quest:cc-through-the-arch', 'godric')] }, dialogue: 'dialogue:cc-maren-road' },
      { when: active('quest:cc-through-the-arch'), dialogue: 'dialogue:cc-maren-arch' },
      { when: at('quest:cc-wolves', 'gate'), dialogue: 'dialogue:cc-maren-gate' },
      { dialogue: 'dialogue:cc-maren' },
    ],
    barks: [{ lines: ['Wolves don’t come this far out of the Gloamwood. Not on their own.', 'Keep your fire low in the trees. They follow the light now.', 'Something is driving them. I want to know what.'] }],
    roles: ['quest', 'trainer'], essential: true,
    look: { skin: 0xd8a888, hair: 0x6a4a2a, cloth: 0x6e5a28, accent: 0xd9b45a, build: 'tall' },
    bio: 'The best tracker in Aldermoor. She wears the pelt of the first Gloamwood wolf that came back wrong, and has hunted the reason ever since. Her mother was a bearer who walked into the Heart in C. 1012 and never came back.',
  },
  {
    id: 'npc:godric', name: 'Elder Godric', title: 'Elder of Brindlecross', school: 'radiance', origin: 'concord', trust: 1,
    services: ['Main story', 'Waystone keys', 'Village rewards'], region: R, home: 'landmark:brind-elders-house', lore: 'lore:hc-godric',
    dialogue: [
      { when: at('quest:cc-through-the-arch', 'godric'), dialogue: 'dialogue:cc-godric-welcome' },
      { when: at('quest:cc-eve', 'farewells'), dialogue: 'dialogue:cc-godric-eve' },
      { when: { all: [{ questCompleted: 'quest:cc-through-the-arch' }, { not: { questActive: 'quest:cc-drowned-bell' } }, { not: { questCompleted: 'quest:cc-drowned-bell' } }] }, dialogue: 'dialogue:cc-godric-bell' },
      { dialogue: 'dialogue:cc-godric' },
    ],
    barks: [{ lines: ['The Abbey bells rang. The Abbey has been under water thirty years.', 'I do not like magic. I like wolves less.'] }],
    roles: ['quest'], essential: true,
    look: { skin: 0xe0b898, hair: 0xe8e4dc, cloth: 0x8a7a5a, accent: 0xffd96b, build: 'average' },
    bio: 'Elder of Brindlecross for forty winters. He remembers the Abbey bells, distrusts magic and relies on it anyway. As a young Citadel guard he stood at the throne-room door on the night of the Hollowing, and he has never said what he saw.',
  },
  {
    id: 'npc:nanbriar', name: 'Nan Briar', title: 'Hedge-witch of the Briar Path', school: 'verdant', origin: 'concord', trust: 1,
    services: ['Potions', 'Trains Hedgewitches', 'Lifts curses'], region: 'region:briar', home: 'landmark:thorn-briar-cottage', lore: 'lore:hc-nan-briar',
    shop: 'shop:nan-briar',
    dialogue: [
      { when: { all: [{ questCompleted: 'quest:cc-wolves' }, { not: { questActive: 'quest:cc-tears' } }, { not: { questCompleted: 'quest:cc-tears' } }] }, dialogue: 'dialogue:cc-nan-tears' },
      { when: at('quest:cc-tears', 'return'), dialogue: 'dialogue:cc-nan-tear' },
      { dialogue: 'dialogue:cc-nan' },
    ],
    barks: [{ lines: ['Mind the cat. He bites clergy and anyone in red.', 'Three Red Draughts for a silver. Four if you stop staring at my kettle.'] }],
    roles: ['quest', 'merchant', 'trainer'], essential: true,
    look: { skin: 0xc8a888, hair: 0xd8d8d0, cloth: 0x3a5a2a, accent: 0x4fd86a, build: 'short' },
    bio: 'Nobody remembers Nan Briar being young, because she was the Verdant Concordant’s gardener three Turnings ago. Her cat is called Parson. She knows what the black tears are made of, and she charges for what she says.',
  },
  {
    id: 'npc:odo', name: 'Odo Vance', title: 'Smith of the Anvil', school: 'iron', origin: 'concord', trust: 2,
    services: ['Weapons', 'Armour', 'Repairs', 'Upgrades'], region: R, home: 'landmark:brind-anvil', lore: 'lore:hc-odo', shop: 'shop:odo',
    dialogue: [{ dialogue: 'dialogue:cc-odo' }],
    barks: [{ lines: ['That blade’s seen better days. So have I.', 'I can make it sharper. I can’t make you faster.'] }],
    roles: ['quest', 'merchant'],
    look: { skin: 0xb8886a, hair: 0x3a2a20, cloth: 0x4a3a30, accent: 0xc09070, build: 'broad' },
    bio: 'Odo forged half the militia’s blades and mended the rest. Iron from Hollowed armour rings wrong on his anvil, as if it remembers being something else, and he can’t stop thinking about it.',
  },
  {
    id: 'npc:wil', name: 'Wil Crane', title: 'Keeper of the Gilded Goose', school: 'song', origin: 'concord', trust: 3,
    services: ['Rest', 'Rumours', 'Hearty meals'], region: R, home: 'landmark:brind-gilded-goose', lore: 'lore:hc-wil', shop: 'shop:wil',
    dialogue: [
      { when: at('quest:cc-eve', 'farewells'), dialogue: 'dialogue:cc-wil-eve' },
      { when: at('quest:cc-warm-bed', 'wil-again'), dialogue: 'dialogue:cc-wil-letters' },
      { dialogue: 'dialogue:cc-wil' },
    ],
    barks: [{ lines: ['Room’s two shards. Stew’s free if you kill whatever’s howling.', 'Pell owes me nine shards. Tell him I said so.', 'Maren drinks alone. Don’t take it personally.'] }],
    roles: ['quest', 'merchant'],
    look: { skin: 0xe8c0a0, hair: 0x9a3a2a, cloth: 0x7a3aa8, accent: 0xf0a0ff, build: 'average' },
    bio: 'Wil hears everything that happens in Brindlecross, usually before it happens. A night at the Goose restores you fully, and her stew is famous on three roads.',
  },
  {
    id: 'npc:pell', name: 'Pell Odd', title: 'Peddler of the Morvane Road', school: 'guile', origin: 'concord', trust: 2,
    services: ['Rare goods', 'Buys loot', 'Moves weekly'], region: R, home: 'landmark:brind-market', lore: 'lore:hc-pell', shop: 'shop:pell',
    dialogue: [{ dialogue: 'dialogue:cc-pell' }],
    barks: [{ lines: ['Everything’s for sale. Some of it’s even mine.', 'Sparkforged? Course it’s Sparkforged. Look at it shine.', 'Tell Wil I’ll pay her Tuesday. Don’t say which Tuesday.'] }],
    roles: ['merchant'],
    look: { skin: 0xd0a080, hair: 0x2a2018, cloth: 0x7d1d3d, accent: 0xff5a8a, build: 'slight' },
    bio: 'Pell carries his whole shop on his back and sets it down wherever there is a crowd. His prices change with your face. Some of his stock is real Sparkforged gear, and some of it is black pearls he will swear he has never seen.',
  },
  {
    id: 'npc:aldous', name: 'Brother Aldous', title: 'Last Brother of the Abbey', school: 'radiance', origin: 'concord', trust: 2,
    services: ['Blessings', 'Removes curses', 'Abbey lore'], region: R, home: 'landmark:brind-chapel', lore: 'lore:hc-aldous',
    schedule: [{ from: 0, to: 24, at: 'landmark:shore-boat', activity: 'idle', when: at('quest:cc-eve', 'gather') }],
    dialogue: [
      { when: at('quest:cc-eve', 'gather'), dialogue: 'dialogue:cc-eve' },
      { when: at('quest:cc-drowned-bell', 'aldous'), dialogue: 'dialogue:cc-aldous-bells' },
      { when: at('quest:cc-drowned-bell', 'tell'), dialogue: 'dialogue:cc-aldous-after' },
      { when: { all: [{ questCompleted: 'quest:cc-stone-court' }, { flag: 'story.act2_ready' }, { not: { questActive: 'quest:cc-eve' } }, { not: { questCompleted: 'quest:cc-eve' } }] }, dialogue: 'dialogue:cc-aldous-eve' },
      { dialogue: 'dialogue:cc-aldous' },
    ],
    barks: [{ lines: ['I hear the choir some nights. I know they are gone. I hear them anyway.', 'Bless you. It is free. It is also not very strong.'] }],
    roles: ['quest'], essential: true,
    look: { skin: 0xd8b090, hair: 0x8a8a8a, cloth: 0xe8e0c8, accent: 0xffd96b, build: 'slight' },
    bio: 'Aldous was a novice when the Abbey sank in C. 1012, and the only one who swam out. He still carries his prayer book, and the water stains have never dried. He wants the Bell’s clapper back more than he wants anything.',
  },
  {
    id: 'npc:rook', name: 'Captain Rook Harrow', title: 'Captain of the Militia', school: 'blade', origin: 'concord', trust: 2,
    services: ['Bounties', 'Trains Swordsmen', 'Militia gear'], region: R, home: 'landmark:brind-watch-house', lore: 'lore:hc-rook',
    dialogue: [{ dialogue: 'dialogue:cc-rook' }],
    barks: [{ lines: ['Eleven farmers, one halberd and me. We could use a twelfth.', 'Bounties are on the board. Pay is honest. The work is not.', 'The Hollowed don’t tire. We do. That’s the whole problem.'] }],
    roles: ['quest', 'trainer'],
    look: { skin: 0xc8946e, hair: 0x2a2420, cloth: 0x2f4a7a, accent: 0xd63447, build: 'broad' },
    bio: 'Rook commands eleven farmers and a halberd. She lost an eye to a Hollowed in spring and says the scar improved her looks. Her bounty board lists every Sentinel in Morvane, and nobody has collected on one yet.',
  },
  {
    id: 'npc:tamsin', name: 'Tamsin Reed', title: 'Ferrywoman of the Wend', school: 'hunt', origin: 'concord', trust: 2,
    services: ['River crossing', 'Fishing', 'Shortcuts'], region: 'region:abbey', home: 'landmark:shore-ferry-house', lore: 'lore:hc-tamsin',
    dialogue: [
      { when: at('quest:cc-reeds', 'tamsin'), dialogue: 'dialogue:cc-tamsin-reeds' },
      { dialogue: 'dialogue:cc-tamsin' },
    ],
    barks: [{ lines: ['One copper and a story. The story better be good.', 'Something swims under my boat at night. Big. Slow. Pale.', 'Fish are leaving the river. Fish know things.'] }],
    roles: ['quest'],
    look: { skin: 0xc89a78, hair: 0xb8743a, cloth: 0x3a5a5a, accent: 0xd9b45a, build: 'average' },
    bio: 'Tamsin poles travellers across the Wend for a copper and a story. Lately she has seen pale shapes under the water at night, all swimming downstream toward the Abbey.',
  },
  {
    id: 'npc:hobb', name: 'Old Hobb', title: 'Sexton of Brindlecross', school: 'umbral', origin: 'concord', trust: 1,
    services: ['Grave goods', 'Hollowed lore'], region: R, home: 'landmark:brind-graveyard', lore: 'lore:hc-hobb',
    dialogue: [{ dialogue: 'dialogue:cc-hobb' }],
    barks: [{ lines: ['Dug that one twice. Nobody stays put any more.', 'Three empty graves. Don’t tell Godric. Not yet.', 'The Hollowed walk home, you know. They always walk home.'] }],
    roles: ['quest'],
    look: { skin: 0xb0a090, hair: 0x6a6a6a, cloth: 0x3a3048, accent: 0xa35cff, build: 'short' },
    bio: 'Hobb has buried most of Brindlecross and knows exactly where. Three of his graves were empty this week. He has not told the Elder yet.',
  },
  {
    id: 'npc:ysolde', name: 'Ysolde Fenn', title: 'Archivist of the Moot Hall', school: 'rime', origin: 'concord', trust: 2,
    services: ['Lore', 'Identifies items', 'Old maps'], region: R, home: 'landmark:brind-elders-house', lore: 'lore:hc-ysolde',
    schedule: [{ from: 6, to: 22, at: 'landmark:stone-court', activity: 'work', when: { questActive: 'quest:cc-stone-court' } }],
    dialogue: [
      { when: active('quest:cc-stone-court'), dialogue: 'dialogue:cc-ysolde-court' },
      { when: { all: [{ questCompleted: 'quest:cc-drowned-bell' }, { questCompleted: 'quest:cc-tears' }, { not: { questActive: 'quest:cc-stone-court' } }, { not: { questCompleted: 'quest:cc-stone-court' } }] }, dialogue: 'dialogue:cc-ysolde-opens' },
      { dialogue: 'dialogue:cc-ysolde' },
    ],
    barks: [{ lines: ['Every record since the founding. Some are even legible.', 'The Stag appears in the margins of the old chronicle. Always weeping.', 'Bring me anything with writing on it. Anything.'] }],
    roles: ['quest'], essential: true,
    look: { skin: 0xe8d4c4, hair: 0x2a2a30, cloth: 0x3fa9e8, accent: 0xe8fbff, build: 'slight' },
    bio: 'Ysolde keeps every record Brindlecross has ever written, and several it would rather forget. She has found the White Stag drawn in the margins of a chronicle three hundred years old, already weeping.',
  },
  {
    id: 'npc:pip', name: 'Pip', title: 'Self-appointed Squire', school: 'song', origin: 'concord', trust: 3,
    services: ['Rumours', 'Small errands'], region: R, home: 'landmark:brind-green', lore: 'lore:hc-pip',
    schedule: [{ from: 20, to: 7, at: 'landmark:brind-pip-home', activity: 'sleep' }],
    dialogue: [{ dialogue: 'dialogue:cc-pip' }],
    barks: [{ lines: ['I’m your squire now. I decided.', 'Old Hobb talks to the graves. Is that normal?', 'I found a shiny thing in the well. Want it? It’s two shards.'] }],
    roles: ['quest'],
    look: { skin: 0xe8c4a8, hair: 0xb8743a, cloth: 0x6a5a3a, accent: 0xf0a0ff, build: 'short' },
    bio: 'Pip has decided to be your squire and will not hear otherwise. He has a wooden sword, a lucky stone and an extremely good memory for things adults say when they think he is not listening.',
  },
  {
    id: 'npc:corwin', name: 'Corwin Hale', title: 'Miller of the Cinderwick', school: 'ash', origin: 'concord', trust: 2,
    services: ['Flour & food', 'Crafting materials'], region: R, home: 'landmark:brind-mill', lore: 'lore:hc-corwin', shop: 'shop:corwin',
    dialogue: [{ dialogue: 'dialogue:cc-corwin' }],
    barks: [{ lines: ['The mill burned the night the wolves came. Not a coincidence.', 'Bring me timber and I’ll bring you bread.'] }],
    roles: ['quest', 'merchant'],
    look: { skin: 0xd0a080, hair: 0x8a5a2a, cloth: 0x5a4a3a, accent: 0xff8a5a, build: 'broad' },
    bio: 'Corwin’s mill burned down the night the wolves first came. He is rebuilding it plank by plank. He once gave the old hearth-beam to an Arcanist who asked nicely. His family came from Solaria four generations ago; Mother Celestine Hale of Dawnspire is a cousin he has never met.',
  },
  {
    id: 'npc:sela', name: 'Sela Moth', title: 'Keeper of Waystones', school: 'storm', origin: 'concord', trust: 2,
    services: ['Maps', 'Fast travel', 'Compass'], region: R, home: 'landmark:brind-waystone', lore: 'lore:hc-sela',
    dialogue: [{ when: at('quest:cc-waystones', 'report'), dialogue: 'dialogue:cc-sela-report' }, { dialogue: 'dialogue:cc-sela' }],
    barks: [{ lines: ['Every waystone you wake, I can send you back to.', 'The stones hum before a storm. They’re humming now.', 'Bring me a map from the Abbey. Even a wet one.'] }],
    roles: ['quest'],
    look: { skin: 0xe0c0a8, hair: 0x4a5aa8, cloth: 0x2a3470, accent: 0xffe14a, build: 'slight' },
    bio: 'Sela walks the old roads of Morvane, waking the waystones one by one. She keeps a compass that points at the Heart no matter how you hold it, and she has never asked it why.',
  },
];

// ----- Act III: five of the fourteen follow the bearers to the camp at the Heart's edge
const AT_HEART: NarrativeCondition = { all: [{ flag: 'story.heart_open' }, { not: { flag: 'story.complete' } }] };
for (const n of npcs) {
  if (!['npc:maren', 'npc:godric', 'npc:ysolde', 'npc:pip', 'npc:sela'].includes(n.id)) continue;
  n.schedule = [{ from: 0, to: 24, at: 'landmark:heart-camp', activity: 'idle', when: AT_HEART }, ...(n.schedule ?? [])];
}
const HEART_TALK: Record<string, { when: NarrativeCondition; dialogue: `dialogue:${string}` }[]> = {
  'npc:sela': [{ when: { questStage: 'quest:heart-wall', stage: 'sela' }, dialogue: 'dialogue:heart-sela' }],
  'npc:maren': [{ when: { questStage: 'quest:heart-marens-mother', stage: 'maren' }, dialogue: 'dialogue:heart-maren-mother' }],
  'npc:godric': [{ when: { questStage: 'quest:heart-what-godric-saw', stage: 'talk' }, dialogue: 'dialogue:heart-godric' }, { when: { questStage: 'quest:heart-what-godric-saw', stage: 'back' }, dialogue: 'dialogue:heart-godric-helmet' }],
  'npc:pip': [{ when: { questStage: 'quest:heart-last-chronicle', stage: 'pip' }, dialogue: 'dialogue:heart-pip' }],
  'npc:ysolde': [{ when: { questStage: 'quest:heart-last-chronicle', stage: 'ysolde' }, dialogue: 'dialogue:heart-ysolde' }],
};
for (const n of npcs) n.dialogue = [...(HEART_TALK[n.id] ?? []), ...n.dialogue];

// ----- class hooks: a campaign can give any of the fourteen class-specific lines with a dialogue named
// dialogue:hook-<class>-<npc-slug> (optional; talkTo falls through when it is missing or has no passing entry)
for (const n of npcs) {
  const slug = n.id.slice(4);
  n.dialogue = [...CAMPAIGNS.map((c) => ({ when: { heroClass: c.id }, dialogue: `dialogue:hook-${c.id}-${slug}` as const })), ...n.dialogue];
}

// ----- the other bearers: one NPC per class, hidden in its own campaign and when a party member plays that class
for (const c of CAMPAIGNS) {
  npcs.push({
    id: `npc:bearer-${c.id}`, name: c.bearer, title: `${c.name} of ${c.start}`, school: c.school, origin: c.school, trust: 1,
    region: R, home: 'landmark:stone-court', classLook: c.id, roles: ['bearer'],
    presentWhen: {
      all: [
        { any: [{ questActive: 'quest:cc-stone-court' }, { questCompleted: 'quest:cc-stone-court' }] },
        { not: { heroClass: c.id } },
        { not: { partyHasClass: c.id } },
      ],
    },
    // featured-bearer threads (each campaign's own hook dialogue first; falls through when it has nothing to say)
    dialogue: [
      ...CAMPAIGNS.filter((h) => h.featured.includes(c.id)).map((h) => ({ when: { heroClass: h.id }, dialogue: `dialogue:${h.id}-featured-${c.id}` as const })),
      { dialogue: `dialogue:cc-bearer-${c.id}` },
    ],
    barks: [{ lines: [`Is yours singing too? ${c.halfStone[0].toUpperCase()}${c.halfStone.slice(1)} won’t stop.`, `${c.realm} feels a long way off.`] }],
    look: { skin: 0xd8b090, cloth: 0x6e6e74 },
    bio: `The ${c.name} bearer, out of ${c.start} in ${c.realm}, carrying ${c.halfStone} of the ${c.school} stone.`,
  });
}

export default npcs;
