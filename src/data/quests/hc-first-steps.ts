/**
 * First Steps (onboarding, Claude 1's brief): one short tutorial quest per class, started beside its first quest.
 * - Eight optional steps, ticked by the client from real input (client/tutorial.ts sets `tut.<step>`), in any order.
 * - Never blocks: it is a side quest with no `campaign` (outside the 60-quest count), and its one hidden objective
 *   closes it when every step is done, when the realm gate opens (story.gate_open), or when hints are switched off
 *   (`tut.skip`).
 * - It only starts for a new game with hints on (`tut.on`, set by the client at game:new).
 * - Key names are `{key:<action>}` tokens, shown with the player's own bindings.
 * Owner: Claude 4.
 */
import type { NarrativeCondition, QuestDef } from '@/core';
import { CAMPAIGNS } from '@/narrative/engine/classes';

export const TUTORIAL_STEPS = ['move', 'talk', 'attack', 'dash', 'potion', 'pack', 'track', 'waystone'] as const;
export type TutorialStep = (typeof TUTORIAL_STEPS)[number];

/** what each step asks, per school: [quest name, journal, then one line per step] */
type Lines = { name: string; journal: string } & Record<TutorialStep, string>;
const KEYS: Record<TutorialStep, string> = {
  move: '{key:move}', talk: '{key:interact}', attack: 'click or {key:cast1}', dash: '{key:dash}',
  potion: '{key:potionQ} / {key:potionE}', pack: '{key:inventory}', track: '{key:journal}, then {key:track}', waystone: '{key:interact}',
};

const SCHOOL: Record<string, Lines> = {
  ash: {
    name: 'Mind the Cinders', journal: 'Whoever ends up teaching you will have opinions about how you walk, fight and pack, and none of them kind. Get ahead of them.',
    move: 'Walk the cinders without tripping', talk: 'Speak to someone who isn’t on fire', attack: 'Hit something that deserves it',
    dash: 'Dash clear of something burning', potion: 'Drink a draught, for the nerves', pack: 'Check your pack for scorch marks',
    track: 'Pick a duty in your journal and track it', waystone: 'Wake a waystone with a warm hand',
  },
  rime: {
    name: 'Feet on the Ice', journal: 'The cold watches everyone the same way: patiently. Show it you can keep your feet.',
    move: 'Cross the ice without sitting down', talk: 'Speak to someone with a warm word', attack: 'Strike something frozen and hostile',
    dash: 'Dash out of the way of a falling icicle', potion: 'Drink a draught before your fingers go', pack: 'Count what’s in your pack, twice',
    track: 'Pick an order in your journal and track it', waystone: 'Wake a frosted waystone',
  },
  storm: {
    name: 'Grounded', journal: 'Nobody in the Reach gets a second spark until they can manage the first. Prove you can.',
    move: 'Walk the rooftops of the Reach', talk: 'Talk to someone who isn’t shouting over thunder', attack: 'Give something a jolt',
    dash: 'Dash before the lightning finds you', potion: 'Drink a draught, sparks and all', pack: 'Make sure nothing in your pack is ticking',
    track: 'Pick a job in your journal and track it', waystone: 'Wake a waystone; mind the static',
  },
  radiance: {
    name: 'Walk in the Light', journal: 'The faithful walk, fight and kneel properly. Kneeling is optional. The rest is not.',
    move: 'Walk the bright streets', talk: 'Speak with one of the faithful', attack: 'Smite something that has it coming',
    dash: 'Dash aside, gracefully', potion: 'Take a draught, in moderation', pack: 'Look over your pack, humbly',
    track: 'Pick a duty in your journal and track it', waystone: 'Wake a waystone, and bless it if you like',
  },
  umbral: {
    name: 'Mind the Dark', journal: 'Nobody in the dusk trusts anyone who can’t move quietly, strike first and leave no mess. Begin.',
    move: 'Move through the shadows', talk: 'Have a quiet word with someone', attack: 'Strike before you’re seen',
    dash: 'Slip away in a blink', potion: 'Sip a draught where nobody’s looking', pack: 'Check your pack for anything that rattles',
    track: 'Pick an errand in your journal and track it', waystone: 'Wake a waystone in the dark',
  },
  verdant: {
    name: 'Mind the Path', journal: 'The paths here move. Keep up with them.',
    move: 'Follow the path, wherever it’s gone', talk: 'Talk to someone, or something, that answers', attack: 'Root out something that bites',
    dash: 'Dash through the undergrowth', potion: 'Drink a draught, herbs and all', pack: 'Shake the beetles out of your pack',
    track: 'Pick a task in your journal and track it', waystone: 'Wake a mossy waystone',
  },
  blade: {
    name: 'On Guard', journal: 'Footwork first, swordwork second, opinions never: every fencing master says so. Show them the first two.',
    move: 'Mind your footwork', talk: 'Exchange words, not blows', attack: 'Land a clean hit',
    dash: 'Step out of a lunge', potion: 'Drink a draught between bouts', pack: 'Inspect your kit',
    track: 'Pick a bout in your journal and track it', waystone: 'Wake a waystone with a salute',
  },
  iron: {
    name: 'First Shift', journal: 'Nobody signs you onto a shift until you can walk, swing and find your own tools. Clock on.',
    move: 'Walk the shop floor', talk: 'Talk to someone on your shift', attack: 'Put your weight into something',
    dash: 'Dash clear of the machinery', potion: 'Drink a draught on your break', pack: 'Find your tools in your pack',
    track: 'Pick a job off your journal and track it', waystone: 'Wake a waystone; it needs a good thump',
  },
  fist: {
    name: 'Stance', journal: 'Every fight starts with how you stand. Then with how you move. Then, eventually, with your fist.',
    move: 'Find your stance and move from it', talk: 'Talk to someone instead of hitting them', attack: 'Throw a proper punch',
    dash: 'Slip a blow', potion: 'Drink a draught in your corner', pack: 'Tie up your pack, like your wraps',
    track: 'Pick a lesson in your journal and track it', waystone: 'Wake a waystone, gently, with an open hand',
  },
  hunt: {
    name: 'The Old Law', journal: 'The old law: walk quiet, strike clean, take only what the hunt gives.',
    move: 'Walk quiet', talk: 'Talk to someone at the fire', attack: 'Strike clean',
    dash: 'Dodge a charge', potion: 'Take a draught from your flask', pack: 'Check your pack for what the hunt gave',
    track: 'Pick a trail in your journal and track it', waystone: 'Wake a waystone on the trail',
  },
  guile: {
    name: 'Tricks of the Trade', journal: 'The first trick is not looking new. Walk like you mean it, and keep your hands in your own pockets.',
    move: 'Walk like you belong here', talk: 'Talk your way into a conversation', attack: 'Strike when they least expect it',
    dash: 'Make a quick exit', potion: 'Drink a draught, discreetly', pack: 'Count what’s in your pack, and what’s in it now',
    track: 'Pick a scheme in your journal and track it', waystone: 'Wake a waystone; nobody saw a thing',
  },
  song: {
    name: 'Find Your Note', journal: 'Every performer starts by finding the stage, the audience and the exits. In that order.',
    move: 'Walk the stage', talk: 'Talk to your audience', attack: 'Hit your mark',
    dash: 'Dash offstage', potion: 'Wet your throat with a draught', pack: 'Check your pack for your music',
    track: 'Pick a part in your journal and track it', waystone: 'Wake a waystone; give it a note',
  },
};

const flag = (s: TutorialStep): NarrativeCondition => ({ flag: `tut.${s}` });

const firstSteps = CAMPAIGNS.map((c): QuestDef => {
  const L = SCHOOL[c.school];
  return {
    id: `quest:${c.id}-first-steps`, name: L.name, type: 'side', act: 'act1', chapter: 'tutorial',
    // no giver: First Steps opens before the player has met their mentor, so it names nobody
    region: `area:${c.school}-${c.side}`,
    summary: 'A few things worth knowing before the road gets long. Do them in any order; nothing waits on them.',
    autoStart: true,
    requires: { all: [{ heroClass: c.id }, { flag: 'tut.on' }, { not: { flag: 'story.gate_open' } }] },
    firstStage: 'steps',
    stages: [{
      id: 'steps', journal: L.journal,
      objectives: [
        ...TUTORIAL_STEPS.map((s) => ({ id: s, text: `${L[s]} (${KEYS[s]})`, optional: true, when: flag(s) })),
        { id: 'done', text: 'First steps', hidden: true, when: { any: [{ all: TUTORIAL_STEPS.map(flag) }, { flag: 'story.gate_open' }, { flag: 'tut.skip' }] } },
      ],
      end: { status: 'completed' },
    }],
    reward: { xpTier: 1 },
  };
});

export default firstSteps;
