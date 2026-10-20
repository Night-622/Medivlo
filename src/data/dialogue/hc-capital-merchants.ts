/**
 * Realm-capital merchants' talk (Claude 4): a greeting, one line about their trade, and the shop. "Let me see your
 * wares." sets shop.open = the merchant, which opens Claude 3's shop panel when the dialogue closes. NPCs in
 * npcs/hc-capital-merchants.ts. Owner: Claude 4.
 */
import type { DialogueDef, SchoolId } from '@/core';

type Kind = 'smith' | 'trader' | 'pedlar';
const ASK: Record<Kind, string> = { smith: 'What does a Runeforge do?', trader: 'What do you have?', pedlar: 'What’s in the pack?' };

function talk(school: SchoolId, kind: Kind, greet: string, more: string): DialogueDef {
  const npc = `npc:${school}-${kind}` as const;
  const wares = { text: 'Let me see your wares.', to: null, effects: [{ setFlag: 'shop.open', value: npc }] };
  const bye = { text: 'Farewell.', to: null, tag: 'leave' as const };
  // smiths offer A Smith’s Eye (quests/hc-smiths-eye.ts) until the player's first upgrade, one quest at a time
  const eye = {
    text: 'Make something of mine stronger.', to: 'eye', quest: true,
    when: { all: [{ not: { flag: 'builds.upgraded' } }, { not: { flag: 'builds.smith_quest' } }] },
    effects: [{ setFlag: 'builds.smith_quest', value: true }, { startQuest: `quest:${school}-smiths-eye` }],
  };
  const smith = kind === 'smith' ? [eye] : [];
  return {
    id: `dialogue:merchant-${school}-${kind}`, name: `${school} capital ${kind}`,
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: npc, text: greet, choices: [wares, { text: ASK[kind], to: 'more' }, ...smith, bye] },
      more: { speaker: npc, text: more, choices: [wares, ...smith, bye] },
      eye: { speaker: npc, text: 'Pick something you like, bring it to the bench with the Embershards and a couple of Iron Ingots, and choose Upgrade. Do it once and you’ll never let good coin sit in your pack again.', choices: [wares, bye] },
    },
  } as DialogueDef;
}

const dialogues: DialogueDef[] = [
  talk('ash', 'smith', 'Mind the slag. Mind the sparks. Mind your eyebrows, while you’re at it; I’ve seen what this place does to apprentices.',
    'A Runeforge takes a good thing and argues with it until it’s better. Bring me gold and Iron Ingots, and I’ll put five more good arguments into anything you wear.'),
  talk('ash', 'trader', 'Candles, cordials, cinder-salve. Everything in Kilnhold burns sooner or later, love. I sell what you need afterwards.',
    'Potions for the burns, bread for the walk, rope for the bits of the city that have fallen down. The scrolls are the Magisters’ throw-outs. They mostly work.'),
  talk('rime', 'smith', 'I work cold. Hot steel forgets its shape the moment you look away. Cold steel remembers.',
    'Bring it here and I’ll hammer the next five years into it. Slowly. Everything in Glacierhome is slow, except the bill.'),
  talk('rime', 'trader', 'Furs, fish, firelighters. Prices are as they were thirty years ago. So is the fish, mostly.',
    'Potions keep in the cold, which is the one good thing about it. Rope, lanterns, a scroll or two the archivists sold me to pay for ink. Take your time. Everyone here does.'),
  talk('storm', 'smith', 'Guild-licensed, Guild-certified, Guild-approved, and still the only forge in Spirehold that doesn’t explode on Tuesdays.',
    'Two parts lightning, one part hammer, one part not standing too close. Five passes and it’s the best thing you own. Gold and Iron Ingots, and stay behind the yellow line.'),
  talk('storm', 'trader', 'Everything you need for a storm, dearie: oilskins, lamp-oil, rope, and a potion for when the rope wasn’t enough.',
    'The scrolls come from the Guild clerks. The clerks come from somewhere worse. I don’t ask.'),
  talk('radiance', 'smith', 'Blessings, and mind the polish. Everything in Dawnspire has to shine, including the things that hit people.',
    'The Runeforge is a prayer with a hammer in it: five strokes, five blessings. The Close takes its tithe in gold and Iron Ingots, which I’m told is very old-fashioned.'),
  talk('radiance', 'trader', 'Alms for the road! Well. Alms at a reasonable markup. The Cathedral has a roof to keep.',
    'Potions blessed and unblessed (the unblessed are cheaper and taste the same), bread from the Close, candles, rope, and scrolls of the lesser hymns.'),
  talk('umbral', 'smith', '(He doesn’t look up.) You’re louder than you think. Everyone is. Put it on the bench.',
    'The Runeforge hones what you carry until it stops making a noise about it. Five passes. After the fifth, people stop hearing it at all, which is the point. Gold and ingots.'),
  talk('umbral', 'trader', 'Open after dark, which in Duskmere is always. Lantern oil, sleeping draughts, rope that doesn’t creak.',
    'Everything here is honestly come by. I want that understood. I come by things very honestly, mostly at night.'),
  talk('verdant', 'smith', 'Mind the roots; they’re growing through the floor again. I let them. Steel quenched in sap holds an edge.',
    'The Runeforge grows a thing on, like grafting. Five grafts, an afternoon each. Gold and Iron Ingots feed it; the roots do the rest.'),
  talk('verdant', 'trader', 'Herbs for what ails you, seeds for what doesn’t yet, and a potion for the bits in between.',
    'Nettle rope, glow-moss lanterns, and the scrolls Mother Yarrow’s novices write out when it rains. All good. Mostly good. The red ones are for emergencies.'),
  talk('blade', 'smith', 'Every blade in Edgewater has been sharpened by a Tempra, a Bellows or a fool. I am not a Bellows.',
    'The Runeforge folds a blade back on itself, five times, until it knows its own mind. Bring gold and ingots. Bring patience. Do not bring opinions about the Ladder.'),
  talk('blade', 'trader', 'Bandages, liniment, a potion for the duel and another for the morning after. Edgewater runs on both.',
    'Rope, lanterns, bread, and the scrolls the Ladder clerks print with the rules on the back. The rules are free. Everyone needs them eventually.'),
  talk('iron', 'smith', 'If it’s iron, I’ll mend it. If it’s steel, I’ll mend it faster. If it’s gold-plate, take it to Gildport and stop wasting my coal.',
    'The Runeforge lays good iron on good iron, five courses, like a wall. Ironhold walls don’t fall over. Neither does my work. Gold and ingots, the usual.'),
  talk('iron', 'trader', 'Rations, rope, lamp-oil, field dressings. Signed for in triplicate. I don’t do triplicate for walk-ins, so you’re in luck.',
    'Potions at regulation strength, scrolls at regulation dullness, everything weighed on the steelyard. That’s my name and also my scales, and I have heard every joke.'),
  talk('fist', 'smith', 'The brothers don’t use swords. They do use bells, gongs, hinges, cooking pots and, now and then, a visitor’s sword. I mend all of those.',
    'The Runeforge is like a form: the same stroke five times, each one truer. Gold and ingots for the furnace. The furnace has taken no vows.'),
  talk('fist', 'trader', 'Tea first. Then shopping. That is the order in Stonecloister, and I will not be moved on it.',
    'Salve for blisters (the stairs), potions for worse than blisters (also the stairs), rope, lanterns, and scrolls of the lesser sutras for the long climb.'),
  talk('hunt', 'smith', 'Arrowheads, buckles, skinning knives, and the odd sword for people who insist on being close to things.',
    'The Runeforge trues what you carry, five times over, until it flies straight or cuts clean. Gold and Iron Ingots. Name what it’s for and I’ll know how to do it.'),
  talk('hunt', 'trader', 'Jerky, rope, waxed thread, lamp-oil. Everything a body needs to go out into the Greywilds and, with luck, come back.',
    'The potions are good. The scrolls are Lodge tally-sheets with a spell on the back, so read the right side.'),
  talk('guile', 'smith', 'Everything in Tidecourt has been pawned at least once, including this anvil. Twice, actually. I bought it back both times, at a very fair rate.',
    'The Runeforge improves a thing until it’s worth more than you paid for it, which in Tidecourt is the only magic anybody believes in. Gold and ingots, cash on the barrel.'),
  talk('guile', 'trader', 'Anything you want, love, and a good deal on the things you don’t know you want yet.',
    'Potions, rope, lanterns, and scrolls from a gentleman who no longer needed them. All above board. Some of it was under a board, briefly.'),
  talk('song', 'smith', 'Strings, keys, tuning pegs, and swords for people who can’t sing. Everything in Lyrehaven has to be in tune, including the hardware.',
    'The Runeforge tunes steel the way I tune a lute: five turns of the peg, each one truer. Gold and ingots. Hum something; it helps.'),
  talk('song', 'trader', 'Sheet music, rosin, throat-lozenges, and a potion for stage fright. The potion is the best seller.',
    'Rope for the flies, lanterns for the wings, scrolls for everything else. Mind the scores on the second shelf; they’re for the understudies.'),
  // ---------- frontier pedlars
  talk('ash', 'pedlar', 'Cinder roads, cold tea, warm feet. What’ll it be?',
    'Small potions, stamina draughts, an antidote or two, bread, apples and torches. And I’ll buy whatever you dragged out of the ash, no questions about the smell.'),
  talk('rime', 'pedlar', 'Don’t stand there letting the cold in. Come under the awning.',
    'Bread that’s been frozen and bread that hasn’t, torches, apples, and the little potions that keep your fingers on. I buy anything the wolves left you.'),
  talk('storm', 'pedlar', 'Get in out of the weather. The weather here is mostly out, so that leaves the awning.',
    'Potions, a stamina draught for the climb, antidote, bread, apples and torches that light in the wind. Mostly. I’ll buy what you find on the cliffs.'),
  talk('radiance', 'pedlar', 'Peace be with you, and with your purse.',
    'Potions, stamina, an antidote, bread from the Close ovens and apples from the abbey trees. Torches for the dark, which is very short here. I buy what you bring back.'),
  talk('umbral', 'pedlar', '(She is beside you before you hear her.) Don’t jump. Everyone jumps. Buying?',
    'A little of everything a body needs on the moor: potions, an antidote, bread, apples, and torches, which are very popular round here. I’ll take what you’ve found off your hands.'),
  talk('verdant', 'pedlar', 'Mind the pack; it’s been in a damp mood all week. What can I do you for?',
    'Potions, stamina, an antidote, bread and apples, very fresh. Torches, a bit damp. I buy what you’ve gathered, beetle bits and all.'),
  talk('blade', 'pedlar', 'Good day. Before you ask: no, I won’t duel you for a discount. Not any more.',
    'Potions for the scratches, stamina for the road, antidote, bread, apples and torches. And I’ll buy back whatever the Revenants dropped. Gently.'),
  talk('iron', 'pedlar', 'Halt, who goes there, and are you buying?',
    'Potions, stamina for the long march, antidote, bread, apples and torches. Not regulation issue, which means it tastes of something. I buy anything you salvage.'),
  talk('fist', 'pedlar', 'Ah. A traveller. Sit, if you like. I will stand. I always stand.',
    'Small potions, stamina for the stairs, antidote, bread, apples and torches for the dark landings. I buy what you carry, so you carry less.'),
  talk('hunt', 'pedlar', 'Out on the trail and short of something? That’s my whole trade.',
    'Potions, stamina, antidote, bread, apples and torches. And I’ll buy hides, horns, teeth and whatever else you’ve brought back. Name it first.'),
  talk('guile', 'pedlar', 'Afternoon. Everything on the barrow is for sale. Everything under it is for friends.',
    'Potions, stamina, antidote, bread, apples and torches. Above board, the lot. I buy anything at all, and I mean anything, and I never ask where it came from.'),
  talk('song', 'pedlar', '(She shakes the tambourine.) That’s hello. Buying or listening?',
    'Potions, stamina, antidote, bread, apples and torches. I buy whatever you’ve got, and if it rattles, I’ll pay extra.'),
];

export default dialogues;
