/** Side quests (Act II): Lantern Coast, Ironspine, Frostreach. docs/lore/15-side-content.md. Owner: Claude 4. Objects and new landmarks are placed by Claude 2. */
import type { NarrativeCondition, QuestDef } from '@/core';

const L = (id: `landmark:${string}`) => ({ landmark: id });
const f = (flag: string) => ({ flag });
const eq = (flag: string, value: string) => ({ flag, op: '==' as const, value });
const gate = (...more: NarrativeCondition[]): NarrativeCondition => ({ all: [f('content.side'), f('content.act2'), ...more] });

const VINES = 'side.lc.vines', CANDLE = 'side.lc.candle', LEDGER = 'side.is.ledger', PATROL = 'side.is.patrol', SAGA = 'side.fr.saga', SHIP = 'side.fr.longship';

const quests: QuestDef[] = [
  // ===== Lantern Coast
  {
    id: 'quest:side-lc-snow-on-the-vines', name: 'Snow on the Vines', type: 'side', act: 'act2', region: 'region:lantern-coast', giver: 'npc:brother-fulvio',
    summary: 'In the vintners’ village of Vaudrac one row of vines has stayed green under the snow, and pilgrims walk out from Solenne to kneel in it. Brother Fulvio of the Curia has been sent to say whether it is a miracle. He would very much like someone else to find out first.',
    requires: gate(f('act1.complete')),
    firstStage: 'row',
    stages: [
      {
        id: 'row', journal: 'One row of vines at Vaudrac is green under the snow, and at its head stands an old stone the village calls the Saint’s Rest. Brother Fulvio wants to know what keeps the row warm before the Wick come to ask the same question.',
        objectives: [
          { id: 'reach', text: 'Walk the Saint’s Row at Vaudrac', reach: 'landmark:lc-saints-row', marker: L('landmark:lc-saints-row') },
          { id: 'stone', text: 'Examine the Saint’s Rest', interact: 'obj:lc-saints-rest', marker: L('landmark:lc-saints-row') },
          { id: 'livia', text: 'Speak with Livia Marrou, who owns the row', talk: 'npc:livia-marrou', marker: L('landmark:lc-vaudrac') },
        ],
        next: 'night',
      },
      {
        id: 'night', journal: 'The Saint’s Rest is warm, but not warm enough to keep a whole row green, and Livia Marrou will say only that the saint provides. There are scorch-marks in the snow between the vines. Watch the row after dark.',
        objectives: [{ id: 'watch', text: 'Watch the Saint’s Row after dark', marker: L('landmark:lc-saints-row'), when: f(`${VINES}.caught`) }],
        next: 'verdict',
      },
      {
        id: 'verdict', journal: 'Livia’s son Iacopo has been drawing ember into the roots every night, without a licence, to keep the row green for the pilgrims who pay for its leaves. It is feeding the village. It is also burning him hollow. Brother Fulvio is waiting to write his finding.',
        objectives: [
          { id: 'stone', text: 'Lay your marked hand on the Saint’s Rest', optional: true, interact: 'obj:lc-saints-rest', marker: L('landmark:lc-saints-row') },
          { id: 'decide', text: 'Tell Brother Fulvio what to write', marker: L('landmark:lc-vaudrac'), when: f(`${VINES}.outcome`) },
        ],
        next: [
          { when: eq(`${VINES}.outcome`, 'exposed'), to: 'exposed' },
          { when: eq(`${VINES}.outcome`, 'licensed'), to: 'licensed' },
          { when: eq(`${VINES}.outcome`, 'unproven'), to: 'unproven' },
          { to: 'kept' },
        ],
      },
      {
        id: 'exposed', journal: 'Brother Fulvio wrote “fraud” in a careful hand, and the Wick came for Iacopo Marrou two days later. The Saint’s Row is black now, like every other row on the coast. The pilgrims have gone back to Solenne.', objectives: [],
        onEnter: [{ reputation: 'faction:order-of-the-wick', delta: 10 }, { reputation: 'faction:lanternate', delta: 5 }],
        end: { status: 'completed', outcome: 'exposed' },
      },
      {
        id: 'licensed', journal: 'Brother Fulvio wrote that the boy had been examined under the Lord-Inquisitor’s writ and found fit for licence. Iacopo Marrou has gone up to Solenne to be taught to draw ember by the book. His mother has not decided whether to thank you.', objectives: [],
        onEnter: [{ reputation: 'faction:order-of-the-wick', delta: 5 }],
        end: { status: 'completed', outcome: 'licensed' },
      },
      {
        id: 'unproven', journal: 'Brother Fulvio laid his own hand on the Saint’s Rest, felt it warm, and wrote “cause not determined”, which he says is the most honest phrase in canon law. The row will stay green for a season on what you gave the stone. Iacopo has promised to let it go black after that.', objectives: [],
        onEnter: [{ reputation: 'faction:lanternate', delta: 5 }],
        end: { status: 'completed', outcome: 'unproven' },
      },
      {
        id: 'kept', journal: 'Brother Fulvio wrote “miracle”, because you told him to, and went back to Solenne relieved. The pilgrims still kneel in the Saint’s Row. Every night, after they have gone, Iacopo Marrou kneels there too.', objectives: [],
        end: { status: 'completed', outcome: 'kept' },
      },
    ],
    reward: { xpTier: 2, gold: 120, items: [{ item: 'item:glyph-cinders', qty: 1 }], lore: ['lore:lc-vaudrac-press'] },
  },
  {
    id: 'quest:side-lc-pilgrims-candle', name: 'The Pilgrim’s Candle', type: 'side', act: 'act2', region: 'region:lantern-coast', giver: 'npc:eydis-long-road',
    summary: 'An old Hrothi woman has walked from the far side of the Ironspine to light her lantern at the Brand. She arrived a year too late. She is still waiting at the pilgrim camp, with the lantern in her lap.',
    requires: gate(f('act1.complete')),
    firstStage: 'flame',
    stages: [
      {
        id: 'flame', journal: 'Eydis Long-Road walked south for a year and a half to light a lantern at the Brand and carry the flame home to her son’s cairn at the Northern Pass. The Brand is dead. Find her a flame she can believe in.',
        objectives: [
          { id: 'flame', text: 'Find a flame for Eydis’s lantern', marker: L('landmark:pilgrim-camp'), when: f(`${CANDLE}.flame`) },
          { id: 'wicks', text: 'The last Brand-lit lanterns are kept at Valcastre', optional: true, reach: 'landmark:valcastre', marker: L('landmark:valcastre') },
        ],
        next: 'farewell',
      },
      {
        id: 'farewell', journal: 'You have a flame for Eydis’s lantern. Bring it to her, and see her onto the long road north.',
        objectives: [{ id: 'eydis', text: 'Light Eydis’s lantern', marker: L('landmark:pilgrim-camp'), when: f(`${CANDLE}.lit`) }],
        next: [
          { when: eq(`${CANDLE}.flame`, 'wick'), to: 'wick' },
          { when: eq(`${CANDLE}.flame`, 'ashmark'), to: 'ashmark' },
          { to: 'hearth' },
        ],
      },
      {
        id: 'wick', journal: 'Eydis’s lantern burns with a flame taken from one of the last Brand-lit lamps at Valcastre. It leans north as she walks, as if it knows the way. In a locked room above the Pilgrim’s Road, the Lord-Inquisitor’s count is one flame longer than his lamps.', objectives: [],
        end: { status: 'completed', outcome: 'wick' },
      },
      {
        id: 'ashmark', journal: 'You lit Eydis’s lantern from your own marked hand, with a flame struck from the shards of the Brand. She asked whether it was holy. You told her what you could. She is carrying it north to the Northern Pass, and she is telling everyone she meets on the road whose hand it came from.', objectives: [],
        onEnter: [{ reputation: 'faction:wolf-moot', delta: 5 }],
        end: { status: 'completed', outcome: 'ashmark' },
      },
      {
        id: 'hearth', journal: 'Eydis lit her lantern at the pilgrims’ common fire, which every one of them has fed with a stick on arriving. It is not the Brand. She says it is the next best thing: it is everyone who came. She has gone north with it.', objectives: [],
        onEnter: [{ reputation: 'faction:lanternate', delta: 5 }],
        end: { status: 'completed', outcome: 'hearth' },
      },
    ],
    reward: { xpTier: 1, items: [{ item: 'item:glyph-lingering', qty: 1 }], lore: ['lore:lc-pilgrims-grave'] },
  },
  // ===== Ironspine
  {
    id: 'quest:side-is-ledger-of-the-lost', name: 'The Ledger of the Lost', type: 'side', act: 'act2', region: 'region:ironspine', giver: 'npc:ulka-coalheart',
    summary: 'When the lower holds of Korrath were barred, Clan Coalheart left its hearth-ledger behind: the names of every Coalheart dead, and of the lost hold of Dun Garrach. The damp is rising below. Ulka Coalheart wants the names copied before the ink runs.',
    requires: gate(f('act1.korrath_gate_open')),
    firstStage: 'stair',
    stages: [
      {
        id: 'stair', journal: 'Ulka Coalheart has unbarred her clan’s stair. Below it lies the Coalheart hearth, abandoned since the black water began to rise, and the rust-wraiths have found it first.',
        objectives: [
          { id: 'reach', text: 'Go down the Coalheart stair to the clan hearth', reach: 'landmark:is-coalheart-deep', marker: L('landmark:is-coalheart-deep') },
          { id: 'wraiths', text: 'Drive the rust-wraiths from the hearth', kill: 'enemy:rust-wraith', count: 2, marker: L('landmark:is-coalheart-deep') },
        ],
        next: 'ledger',
      },
      {
        id: 'ledger', journal: 'The Coalheart hearth-ledger lies on its stone by the cold hearth. Its iron covers have kept the worst out, but the pages are swollen and the old ink is beginning to bleed. Copy the names.',
        objectives: [{ id: 'copy', text: 'Copy the names from the hearth-ledger', marker: L('landmark:is-coalheart-deep'), when: f(`${LEDGER}.copied`) }],
        next: 'return',
      },
      {
        id: 'return', journal: 'You have the names, or as many as the water left. On the last written page, in a hand that did not want to be seen, is an entry for the year 1181 that the oath-ledger of Korrath does not have. Take the copy up to Ulka Coalheart.',
        objectives: [{ id: 'ulka', text: 'Bring the names to Ulka Coalheart', marker: L('landmark:korrath-under-stone'), when: f(`${LEDGER}.outcome`) }],
        next: [{ when: eq(`${LEDGER}.outcome`, 'restored'), to: 'restored' }, { to: 'names' }],
      },
      {
        id: 'restored', journal: 'Ulka Coalheart carried the 1181 entry to the Thane-Hall and wrote it into the great oath-ledger of Korrath, in the place where a page was cut, while the High Thane sat and watched her do it. A hearth-ledger answers to no Thane. The Concord does not thank you. Some of its ledger-keepers do.', objectives: [],
        onEnter: [{ reputation: 'faction:iron-concord', delta: -5 }, { unlockLore: 'lore:is-coalheart-hearth' }],
        end: { status: 'completed', outcome: 'restored' },
      },
      {
        id: 'names', journal: 'Ulka Coalheart has her names, and the Long Hall has sung them, every one, on the night of the long song. What else the hearth-ledger says stays below the stair, with the hearth, as the Coalhearts would want.', objectives: [],
        onEnter: [{ reputation: 'faction:iron-concord', delta: 10 }],
        end: { status: 'completed', outcome: 'names' },
      },
    ],
    reward: { xpTier: 2, gold: 90, items: [{ item: 'item:glyph-echo', qty: 1 }], lore: ['lore:is-dun-garrach-plate'] },
  },
  {
    id: 'quest:side-is-the-patrol', name: 'The Patrol', type: 'side', act: 'act2', region: 'region:ironspine', giver: 'npc:dhurm-stonebrow',
    summary: 'A Wrought sentinel has walked the same high ridge for three thousand years without troubling anyone. This winter it has begun stopping things. Two carters on the Concord’s ore-road are dead, and road-warden Dhurm Stonebrow wants to know why before he sends hammers.',
    requires: gate(f('act1.korrath_gate_open')),
    firstStage: 'round',
    stages: [
      {
        id: 'round', journal: 'The sentinel’s path is worn a hand’s depth into the rock of the ridge. Where it turns, the Orrin cut waymarks. Follow its round and learn where it is going.',
        objectives: [{ id: 'marks', text: 'Follow the sentinel’s waymarks along the ridge', interact: 'obj:is-patrol-mark-*', count: 3, marker: L('landmark:is-sentinel-road') }],
        next: 'father',
      },
      {
        id: 'father', journal: 'Every waymark points the same way: along the ridge to the Leaning Father, one of the frozen giants of the Rusting. The sentinel’s round ends there. Go and see what it does when it arrives.',
        objectives: [
          { id: 'reach', text: 'Go to the Leaning Father', reach: 'landmark:is-leaning-father', marker: L('landmark:is-leaning-father') },
          { id: 'decide', text: 'Decide what to do about the sentinel', marker: L('landmark:is-leaning-father'), when: f(`${PATROL}.outcome`) },
        ],
        next: [{ when: eq(`${PATROL}.outcome`, 'destroyed'), to: 'fight' }, { to: 'report' }],
      },
      {
        id: 'fight', journal: 'It will not stop, and it will not turn. Bring the sentinel down.',
        objectives: [{ id: 'sentinel', text: 'Destroy the sentinel of the ridge', kill: 'enemy:wrought-sentinel', count: 1, marker: L('landmark:is-leaning-father') }],
        onComplete: [{ giveItem: 'item:true-iron', count: 1 }],
        next: 'report',
      },
      {
        id: 'report', journal: 'The ore-road is safe, one way or another. Tell Dhurm Stonebrow how.',
        objectives: [{ id: 'dhurm', text: 'Report to Dhurm Stonebrow', talk: 'npc:dhurm-stonebrow', marker: L('landmark:is-sentinel-road') }],
        next: [
          { when: eq(`${PATROL}.outcome`, 'rerouted'), to: 'rerouted' },
          { when: eq(`${PATROL}.outcome`, 'sent'), to: 'sent' },
          { when: eq(`${PATROL}.outcome`, 'destroyed'), to: 'destroyed' },
          { to: 'rested' },
        ],
      },
      {
        id: 'rested', journal: 'The sentinel of the ridge knelt beside the Leaning Father with its hand on his wrist, and the light behind its eye went out. It is still there. The carters touch its shoulder for luck as they pass.', objectives: [],
        end: { status: 'completed', outcome: 'rested' },
      },
      {
        id: 'rerouted', journal: 'You cut the waymark anew, and the sentinel’s round now turns short of the ore-road. It walks the ridge as it always has, and the Concord has a guard on its high road that will never ask for wages.', objectives: [],
        onEnter: [{ reputation: 'faction:iron-concord', delta: 10 }],
        end: { status: 'completed', outcome: 'rerouted' },
      },
      {
        id: 'sent', journal: 'The sentinel heard the new Nail humming under the mountain, and when you turned it, it went down toward the sound. The Vault-wardens say it walks the Ninth now, and lays its hand on it at every round, and waits less long than it used to.', objectives: [],
        onEnter: [{ reputation: 'faction:iron-concord', delta: 15 }],
        end: { status: 'completed', outcome: 'sent' },
      },
      {
        id: 'destroyed', journal: 'The sentinel of the ridge is scrap at the Leaning Father’s feet. The ore-road is open. Dhurm Stonebrow has had the pieces carried down to Korrath, because the Orrun do not leave the Fathers’ work lying in the snow.', objectives: [],
        end: { status: 'completed', outcome: 'destroyed' },
      },
    ],
    reward: { xpTier: 2, items: [{ item: 'item:glyph-piercing', qty: 1 }], lore: ['lore:is-patrol-waymark'] },
  },
  // ===== Frostreach
  {
    id: 'quest:side-fr-skalds-last-saga', name: 'The Skald’s Last Saga', type: 'side', act: 'act2', region: 'region:frostreach', giver: 'npc:bjorna-long-memory',
    summary: 'Bjorna Long-Memory, eldest of the skalds of Skelvik, is dying, and will not go to Morrow on a saga about starving. She wants one more deed for her last verse. She has decided it will be yours.',
    requires: gate(f('act2.northpass_open')),
    firstStage: 'deed',
    stages: [
      {
        id: 'deed', journal: 'Bjorna Long-Memory lies by the long hearth in Skelvik hall and asks for a deed worth a saga. Tell her one you have done, or go and do one. The fishers say the beacon at the mouth of Hrimfjord has been dark since the star fell.',
        objectives: [{ id: 'deed', text: 'Give Bjorna a deed for her saga', marker: L('landmark:skelvik-hall'), when: { any: [f(`${SAGA}.deed`), f(`${SAGA}.beacon_vow`)] } }],
        next: [{ when: f(`${SAGA}.deed`), to: 'verse' }, { to: 'beacon' }],
      },
      {
        id: 'beacon', journal: 'You have vowed Bjorna a deed: to light the beacon at the mouth of Hrimfjord, which the boats steered home by until the star fell. Rime-wolves den on the headland now.',
        objectives: [
          { id: 'reach', text: 'Go to the Hrimfjord beacon', reach: 'landmark:fr-hrimfjord-beacon', marker: L('landmark:fr-hrimfjord-beacon') },
          { id: 'wolves', text: 'Drive the rime-wolves from the headland', kill: 'enemy:rime-wolf', count: 3, marker: L('landmark:fr-hrimfjord-beacon') },
          { id: 'light', text: 'Light the beacon', marker: L('landmark:fr-hrimfjord-beacon'), when: f(`${SAGA}.deed`) },
        ],
        next: 'verse',
      },
      {
        id: 'verse', journal: 'Bjorna has her deed. A saga must end somewhere, she says, and the young ones will be listening for where. Go back to her and hear the last verse made.',
        objectives: [{ id: 'ending', text: 'Help Bjorna end her saga', marker: L('landmark:skelvik-hall'), when: f(`${SAGA}.ending`) }],
        next: [{ when: eq(`${SAGA}.ending`, 'south'), to: 'south' }, { when: eq(`${SAGA}.ending`, 'plain'), to: 'plain' }, { to: 'endure' }],
      },
      {
        id: 'endure', journal: 'Bjorna Long-Memory sang her last saga to the benches of Skelvik hall and ended it with Vor’s word: hold. She died before the fire burned down. The young warriors did not cheer. Several of them have been heard singing it since, quietly, on watch.', objectives: [],
        onEnter: [{ reputation: 'faction:wolf-moot', delta: 5 }],
        end: { status: 'completed', outcome: 'endure' },
      },
      {
        id: 'south', journal: 'Bjorna Long-Memory ended her last saga with Calun’s road and the warm south, and the benches of Skelvik hall roared. She died smiling. By the next night the Young Moot at the pass was singing it, louder, with verses she never made.', objectives: [],
        onEnter: [{ reputation: 'faction:wolf-moot', delta: 10 }, { setFlag: 'side.fr.saga.south_sung', value: true }],
        end: { status: 'completed', outcome: 'south' },
      },
      {
        id: 'plain', journal: 'Bjorna Long-Memory ended her last saga with no kenning at all, only the plain truth of what was done and who did it. The skalds say no one has dared that in a hundred years. She died before they could decide whether it was an insult or a masterpiece. They are still arguing.', objectives: [],
        onEnter: [{ unlockLore: 'lore:the-hrothi', section: 'skald' }],
        end: { status: 'completed', outcome: 'plain' },
      },
    ],
    reward: { xpTier: 2, items: [{ item: 'item:glyph-storms', qty: 1 }], lore: ['lore:fr-skalds-cairn'] },
  },
  {
    id: 'quest:side-fr-ice-bound-longship', name: 'The Ice-Bound Longship', type: 'side', act: 'act2', region: 'region:frostreach', giver: 'npc:ingrid-oar-breaker',
    summary: 'The glacier above Ingrid Oar-Breaker’s steading has calved, and in the new ice-face stands a longship, whole, with its crew still at the oars. Her starving steading wants what is aboard. Her grandmother says the dead want something else.',
    requires: gate(f('act2.northpass_open')),
    firstStage: 'glacier',
    stages: [
      {
        id: 'glacier', journal: 'A longship stands in the ice-face of the calving glacier above the steading, prow-out, as if it had sailed into the ice and stopped. Ingrid Oar-Breaker will not go up to it alone.',
        objectives: [
          { id: 'reach', text: 'Climb to the calving glacier', reach: 'landmark:fr-calving-glacier', marker: L('landmark:fr-calving-glacier') },
          { id: 'ship', text: 'Board the ice-bound longship', interact: 'obj:fr-ice-longship', marker: L('landmark:fr-calving-glacier') },
        ],
        next: 'steersman',
      },
      {
        id: 'steersman', journal: 'The crew of the longship are dead and not resting. Their steersman, Hrafn the Seeker, sailed north four hundred years ago to find where the wind goes looking, and found it. The rings and the giant-iron in the hold would feed the steading for a winter. Hrafn wants to go up Calun’s road in fire.',
        objectives: [{ id: 'decide', text: 'Decide the fate of the longship', marker: L('landmark:fr-calving-glacier'), when: f(`${SHIP}.choice`) }],
        next: [{ when: eq(`${SHIP}.choice`, 'salvage'), to: 'crew' }, { to: 'return' }],
      },
      {
        id: 'crew', journal: 'You broke open the hold, and the crew stood up from their oars.',
        objectives: [{ id: 'crew', text: 'Put down the longship’s crew', kill: null, family: 'restless', count: 3, marker: L('landmark:fr-calving-glacier') }],
        next: 'return',
      },
      {
        id: 'return', journal: 'It is done at the glacier. Go down to Ingrid’s steading and tell her what became of the ship.',
        objectives: [{ id: 'ingrid', text: 'Return to Ingrid Oar-Breaker', talk: 'npc:ingrid-oar-breaker', marker: L('landmark:fr-glacier-steading') }],
        next: [
          { when: eq(`${SHIP}.choice`, 'salvage'), to: 'salvaged' },
          { when: eq(`${SHIP}.choice`, 'given'), to: 'given' },
          { to: 'burned' },
        ],
      },
      {
        id: 'burned', journal: 'The longship burned in the ice-face for a night and a day, and the smoke went straight up, though the wind was blowing. Hrafn’s crew went with it. The steading is as hungry as it was. Ingrid’s grandmother says it is the first good thing she has seen since the star fell.', objectives: [],
        onEnter: [{ reputation: 'faction:wolf-moot', delta: 10 }],
        end: { status: 'completed', outcome: 'burned' },
      },
      {
        id: 'given', journal: 'Hrafn’s crew gave up their rings and their giant-iron to the living, and then you gave them to the fire. The steading will eat this winter. The smoke went straight up, though the wind was blowing.', objectives: [],
        onEnter: [{ reputation: 'faction:wolf-moot', delta: 15 }, { giveGold: 60 }],
        end: { status: 'completed', outcome: 'given' },
      },
      {
        id: 'salvaged', journal: 'The rings and the giant-iron of Hrafn’s longship are on Ingrid’s table, and the steading will eat this winter. The crew lie broken on the ice. Ingrid’s grandmother has moved her bed to the other end of the hall, away from the door that faces the glacier.', objectives: [],
        onEnter: [{ giveGold: 150 }, { giveItem: 'item:true-iron', count: 1 }],
        end: { status: 'completed', outcome: 'salvaged' },
      },
    ],
    reward: { xpTier: 2, items: [{ item: 'item:glyph-frost', qty: 1 }], lore: ['lore:book-saga-of-hrafn-the-seeker'] },
  },
];

export default quests;
