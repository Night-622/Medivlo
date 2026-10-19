import { Game, Registry, Services, bus, createNewGameState, getFlag, setFlag } from '@/core';
import { LocalNet } from '@/net';
import { installNarrativeAuthority, dialogue, openDialogue, getTrust } from '@/narrative/engine';
import { dialogueClient } from '@/narrative/client/dialogueClient';

let fails = 0;
const ok = (c: unknown, m: string) => { if (!c) { fails++; console.log('FAIL', m); } else console.log('ok  ', m); };
const R = Registry as any;
R.add({ id: 'npc:maren', name: 'Maren Hollis', school: 'hunt', trust: 2, region: 'region:alder', home: 'landmark:east-gate', dialogue: [{ dialogue: 'dialogue:t-maren' }], look: { skin: 0, cloth: 0 }, bio: '' });
R.add({ id: 'dialogue:t-maren', scope: 'party', entries: [{ node: 'start' }], nodes: {
  start: { speaker: 'npc:maren', text: 'Wolves.', choices: [
    { text: 'Something drives them.', to: 'b', quest: true, trust: 1 },
    { text: 'Look at the spacing.', to: 'b', school: 'hunt', trust: 1 },
    { text: 'Read the scorch.', to: 'b', school: 'ash' },
    { text: 'You wear one.', to: 'b', insight: 'maren-pelt', when: { flag: 'seen.pelt' } },
  ] },
  b: { speaker: 'npc:maren', text: 'Then come.', next: null },
} });
Game.set(createNewGameState());
Game.state.player.hero = { classId: 'arcanist', look: { skin: 0, hair: 0, hc: 0, eyes: 0, brows: 0, ec: 0, mouth: 0, mark: 0, body: 0 }, outfit: { dye: 0, headw: 0, cape: 0, neck: 0, face: 0, extra: 0 } };
Game.set(Game.state);
Services.register('net', new LocalNet('p1', 'Hero', '', 1));
installNarrativeAuthority();
dialogueClient.install();
const nodes: any[] = [];
bus.on('dialogue:node', (p) => nodes.push(p));

ok(getTrust('npc:maren') === 2, 'start trust from NpcDef');
openDialogue('dialogue:t-maren', 'npc:maren', 'p1');
const v = dialogueClient.view!;
ok(v && v.choices.length === 2, `visible choices = quest + [Ash] only (got ${v?.choices.map(c => c.text)})`);
ok(v.choices[0].quest && v.choices[0].trust === 1, 'QUEST + TRUST chips decoded on client');
ok(v.choices[1].school === 'ash' && v.choices[1].enabled, '[Ash] option visible and enabled for an Arcanist');
ok(nodes[0].audience === 'all', 'party scope audience all');
// client pick → LocalNet.send vote → engine onClient → choose (solo synchronous)
dialogueClient.choose(0);
ok(getTrust('npc:maren') === 3, `trust +1 applied (got ${getTrust('npc:maren')})`);
ok(dialogueClient.view?.text === 'Then come.', 'advanced to next node');
dialogueClient.advance();
ok(!dialogue.active && !dialogueClient.view, 'dialogue closed via dialogue:continue');
// trust pays once
openDialogue('dialogue:t-maren', 'npc:maren', 'p1');
ok(dialogueClient.view!.choices[0].trust === undefined, 'trust chip hidden after payout');
dialogueClient.choose(0); dialogueClient.advance();
ok(getTrust('npc:maren') === 3, 'trust paid only once');
// insight gate hidden → shown
setFlag('seen.pelt', true);
openDialogue('dialogue:t-maren', 'npc:maren', 'p1');
const iv = dialogueClient.view!.choices.find(c => c.insight);
ok(!!iv, 'INSIGHT option appears when gate passes');
dialogueClient.choose(iv!.index);
ok(getFlag('insight.maren-pelt') === true, 'insight flag set');
dialogueClient.advance();
// Devoted only via set
for (let i = 0; i < 5; i++) bus.emit('flag:changed', { key: 'noop', value: 1, prev: 1 });
ok(getTrust('npc:maren') <= 4, 'trust ≤ 4 via deltas');
// bearers derived
setFlag('story.bearer.reaver', true); setFlag('story.bearer.knight', true); setFlag('story.bearer.reaver', true);
ok(getFlag('story.bearers_gathered') === 2, `bearers derived = 2 (got ${getFlag('story.bearers_gathered')})`);
// trust condition
R.add({ id: 'dialogue:t-gate', entries: [{ when: { trust: 'npc:maren', value: 'friendly' }, node: 'a' }], nodes: { a: { speaker: 'narrator', text: 'Friendly gate', next: null } } });
ok(openDialogue('dialogue:t-gate'), 'trust >= friendly condition passes');
ok(nodes.at(-1).audience.length === 1, 'personal scope audience = initiator');
console.log(fails ? `${fails} FAILED` : 'ALL PASS');
