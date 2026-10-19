/** Act II, Chapter 5 (north): quest:the-ninth-nail (Ironspine) and quest:the-wolf-moot (Frostreach). docs/lore/11-act2-spec.md. Owner: Claude 4. */
import type { QuestDef } from '@/core';

const L = (id: `landmark:${string}`) => ({ landmark: id });
const CH = 'The Ember Hunts';
const deep = (v: string) => ({ flag: 'act2.deep_choice', op: '==' as const, value: v });
const moot = (v: string) => ({ flag: 'act2.moot_outcome', op: '==' as const, value: v });
const route = (v: string) => ({ flag: 'act2.moot_route', op: '==' as const, value: v });

const quests: QuestDef[] = [
  // ----- The Ninth Nail (Ironspine)
  {
    id: 'quest:the-ninth-nail', name: 'The Ninth Nail', type: 'main', act: 'act2', chapter: CH, region: 'region:ironspine', giver: 'npc:brannoch-deepforge',
    summary: 'Something fell through the mountain on the Night of Falling Ash and lodged in the Vault of the Nine Nails, where the Orrin pinned the Mire down. High Thane Brannoch Deepforge holds the only key.',
    // starts once the summons is done AND the Korrath gate is open (iron-and-oath may still be finishing in Act II)
    requires: { all: [{ flag: 'act1.korrath_gate_open' }, { questCompleted: 'quest:the-summons' }] }, autoStart: true,
    firstStage: 'korrath',
    stages: [
      {
        id: 'korrath', journal: 'The Ember of the Deep fell somewhere under the Ironspine. Korrath-under-Stone is the high hall of the Iron Concord, and the Vault of the Nine Nails lies beneath it. Only the High Thane can open the Vault-door.',
        objectives: [
          { id: 'reach', text: 'Go down to Korrath-under-Stone', reach: 'landmark:korrath-under-stone', marker: L('landmark:korrath-under-stone') },
          { id: 'brannoch', text: 'Win the High Thane’s leave to enter the Vault', marker: L('landmark:thane-hall'), when: { flag: 'act2.vault_granted' } },
        ],
        onComplete: [{ unlockLore: 'lore:korrath-under-stone' }],
        next: 'vault',
      },
      {
        id: 'vault', journal: 'The Vault-door is open. Below it the Wrought have woken, and the rust-wraiths walk with them. Whatever burns at the bottom of the mountain, they are guarding it, or it is waking them.',
        objectives: [
          { id: 'reach', text: 'Descend into the Vault of the Nine Nails', reach: 'landmark:vault-of-nine-nails', marker: L('landmark:vault-of-nine-nails') },
          { id: 'sentinels', text: 'Bring down the wrought sentinels', kill: 'enemy:wrought-sentinel', count: 3, marker: L('landmark:vault-of-nine-nails') },
          { id: 'wraiths', text: 'Destroy the rust-wraiths', kill: 'enemy:rust-wraith', count: 2, marker: L('landmark:vault-of-nine-nails') },
        ],
        onComplete: [
          { unlockLore: 'lore:vault-of-the-nine-nails' }, { unlockLore: 'lore:wrought-sentinels' },
          { openDialogue: 'dialogue:ch5n-vault-nails' },
        ],
        next: 'socket',
      },
      {
        id: 'socket', journal: 'Seven Nails stand in the Vault, each the height of a tower. Where the Eighth and the Ninth should stand there are two black wells, and between them something is burning.',
        objectives: [{ id: 'socket', text: 'Look into the empty socket', interact: 'obj:empty-socket', marker: L('landmark:the-empty-socket') }],
        next: 'choice',
      },
      {
        id: 'choice', journal: 'The Ember of the Deep fell into the wound the failed Nails left, and it has been holding the Mire down ever since, the way a cork holds a cask. Take it, and the black water comes up after it. Leave it, and it is not yours.',
        objectives: [{ id: 'choice', text: 'Decide what to do with the Ember of the Deep', marker: L('landmark:the-empty-socket'), when: { flag: 'act2.deep_choice' } }],
        next: [{ when: deep('forge'), to: 'forge' }, { to: 'flood' }],
      },
      {
        id: 'flood', journal: 'You pulled the Ember out of the wound, and the Mire came up behind it. The lower holds of Korrath are under black water, and every Orrun in the Ironspine will know whose hand did it.', objectives: [],
        onEnter: [{ reputation: 'faction:iron-concord', delta: -25 }],
        next: 'ember',
      },
      {
        id: 'forge', journal: 'A new Nail, to stand where the Ninth stood. True-iron must be cut from the living seam, three veins of it, and worked on the Orrin anvil in the Vault. No Orrun forge has been hot enough for true-iron since the Rusting. Your hand is.',
        objectives: [
          { id: 'veins', text: 'Cut true-iron from the veins of the seam', interact: 'obj:true-iron-vein-*', count: 3, marker: L('landmark:true-iron-seam') },
          { id: 'anvil', text: 'Forge the new Nail on the Orrin anvil', marker: L('landmark:vault-of-nine-nails'), when: { flag: 'act2.new_nail' } },
        ],
        onComplete: [{ reputation: 'faction:iron-concord', delta: 20 }, { unlockLore: 'lore:true-iron' }],
        next: 'ember',
      },
      {
        id: 'ember', journal: 'The Ember of the Deep is free of the wound. Take it.',
        objectives: [{ id: 'ember', text: 'Claim the Ember of the Deep', marker: L('landmark:the-empty-socket'), when: { flag: 'act2.ember_deep_claimed' } }],
        next: [{ when: { flag: 'act2.new_nail' }, to: 'thane' }, { to: 'taken' }],
      },
      {
        id: 'taken', journal: 'The Ember of the Deep burns in your hand. Below Korrath the black water stands in the lower holds, and does not go down.', objectives: [],
        end: { status: 'completed', outcome: 'take' },
      },
      {
        id: 'thane', journal: 'A Ninth Nail stands in the Vault again, true-iron, new-forged. The Ember of the Deep is yours. The High Thane has sent word that he will see you in his hall.',
        objectives: [{ id: 'thane', text: 'Return to High Thane Brannoch', marker: L('landmark:thane-hall'), when: { flag: 'act2.first_nail_given' } }],
        end: { status: 'completed', outcome: 'forge' },
      },
    ],
    reward: { xpTier: 3, lore: ['lore:the-rusting'] },
  },
  // ----- The Wolf-Moot (Frostreach)
  {
    id: 'quest:the-wolf-moot', name: 'The Wolf-Moot', type: 'main', act: 'act2', chapter: CH, region: 'region:frostreach', giver: 'npc:ketil-wolfsbane',
    summary: 'An Ember fell on the Moot-stones of the Frostreach, and the starving Hrothi clans say it is Calun’s sign to take the south. A young raider at the foot of the northern pass offers to take you to them.',
    firstStage: 'pass',
    stages: [
      {
        id: 'pass', journal: 'The only road into the Frostreach goes over the northern pass, and the Hrothi watch it. A war-band is camped on the Ironspine side under a young man called Ketil Wolfsbane.',
        objectives: [
          { id: 'reach', text: 'Go to the camp below the northern pass', reach: 'landmark:north-pass-camp', marker: L('landmark:north-pass-camp') },
          { id: 'ketil', text: 'Get Ketil Wolfsbane to take you over the pass', marker: L('landmark:north-pass-camp'), when: { flag: 'act2.northpass_open' } },
        ],
        onComplete: [{ unlockLore: 'lore:the-hrothi' }],
        next: 'skelvik',
      },
      {
        id: 'skelvik', journal: 'Ketil has taken you over the pass. Skelvik sits at the head of its frozen fjord, and Jarl Sigrun Ice-Eye keeps the hall there.',
        objectives: [
          { id: 'reach', text: 'Go to Skelvik', reach: 'landmark:skelvik', marker: L('landmark:skelvik') },
          { id: 'sigrun', text: 'Speak with Jarl Sigrun in Skelvik hall', marker: L('landmark:skelvik-hall'), when: { flag: 'act2.sigrun_met' } },
        ],
        onComplete: [{ unlockLore: 'lore:skelvik' }, { unlockLore: 'lore:sigrun-ice-eye' }],
        next: 'moot',
      },
      {
        id: 'moot', journal: 'The Ember fell on the Moot-stones at Lanternmass, and the clans believe Calun threw it to show them the road south. Sigrun has called the Wolf-Moot. By Moot-law an outlander may claim against it by deed, by wit or by blood. Or you could take it at night, when the stones are watched by fewer eyes.',
        objectives: [{
          id: 'moot', text: 'Claim the Ember at the Wolf-Moot', marker: L('landmark:wolf-moot-stones'),
          when: { any: [{ flag: 'act2.moot_outcome' }, { flag: 'act2.moot_route' }] },
        }],
        onComplete: [{ unlockLore: 'lore:the-wolf-moot-stones' }, { unlockLore: 'lore:wolf-moot' }],
        next: [
          { when: { flag: 'act2.moot_outcome' }, to: 'ember' },
          { when: route('deeds'), to: 'deeds' },
          { when: route('duel'), to: 'duel' },
          { when: route('wits'), to: 'wits' },
          { to: 'ember' },
        ],
      },
      {
        id: 'deeds', journal: 'The Moot has asked for a deed. Rime-wolves have come down out of the white to the high steadings, and they have taken children. Kill four, and the Moot will hear you.',
        objectives: [{ id: 'wolves', text: 'Hunt the rime-wolves of the high steadings', kill: 'enemy:rime-wolf', count: 4, marker: { region: 'region:frostreach' } }],
        onComplete: [{ unlockLore: 'lore:rime-wolves' }],
        next: 'verdict',
      },
      {
        id: 'duel', journal: 'You have claimed the Ember by blood. Sigrun’s champion waits for you in the ring of the Moot-stones.',
        objectives: [{ id: 'champion', text: 'Defeat the Jarl’s champion', kill: 'enemy:hrothi-champion', count: 1, marker: L('landmark:wolf-moot-stones') }],
        next: 'verdict',
      },
      {
        id: 'wits', journal: 'You have claimed the Ember by wit. Sigrun will set three riddles in the old manner, and the Moot will judge your answers.',
        objectives: [{ id: 'riddles', text: 'Answer the Jarl’s riddles at the Moot-stones', marker: L('landmark:wolf-moot-stones'), when: { flag: 'act2.moot_outcome' } }],
        onComplete: [{ unlockLore: 'lore:hrothi-kennings' }],
        next: 'ember',
      },
      {
        id: 'verdict', journal: 'It is done. Go back to the Moot-stones and hear what the clans say of it.',
        objectives: [{ id: 'verdict', text: 'Return to Jarl Sigrun at the Moot-stones', marker: L('landmark:wolf-moot-stones'), when: { flag: 'act2.moot_outcome' } }],
        next: 'ember',
      },
      {
        id: 'ember', journal: 'The Ember of the Wolf lies on the Moot-stones. One way or another, it is yours to take.',
        objectives: [{ id: 'ember', text: 'Claim the Ember of the Wolf', marker: L('landmark:wolf-moot-stones'), when: { flag: 'act2.ember_wolf_claimed' } }],
        next: [{ when: moot('allied'), to: 'allied' }, { when: moot('stolen'), to: 'stolen' }, { to: 'broken' }],
      },
      {
        id: 'allied', journal: 'The Wolf-Moot gave you the Ember of the Wolf, and Sigrun Ice-Eye gave you her hand on it. The clans will not march south this winter. When the last fight comes, they will march with you.', objectives: [],
        onEnter: [{ reputation: 'faction:wolf-moot', delta: 25 }, { giveItem: 'item:frostjaw' }],
        end: { status: 'completed', outcome: 'allied' },
      },
      {
        id: 'broken', journal: 'You lost the riddle-game, and the Moot broke on it. The clans have gone home to their own fjords in feud, too divided to march anywhere. The Ember of the Wolf is yours. Nobody else could agree on who should have it.', objectives: [],
        onEnter: [{ reputation: 'faction:wolf-moot', delta: -10 }],
        end: { status: 'completed', outcome: 'broken' },
      },
      {
        id: 'stolen', journal: 'You took the Ember from the Moot-stones in the night, like a thief. By morning the war-horns were blowing in every fjord of the Frostreach. The Hrothi are coming south, for vengeance now as much as for bread.', objectives: [],
        onEnter: [{ reputation: 'faction:wolf-moot', delta: -25 }],
        end: { status: 'completed', outcome: 'stolen' },
      },
    ],
    reward: { xpTier: 3, lore: ['lore:calun-the-wanderer'] },
  },
];

export default quests;
