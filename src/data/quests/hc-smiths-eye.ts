/**
 * A Smith’s Eye (Claude 4; from Claude 3 / Claude 5's gear-curve audit: Embershards sit idle until a player finds the
 * Runeforge). One short side quest per realm capital, offered by that capital's Runeforge smith (dialogue/
 * hc-capital-merchants.ts) to anyone who has never upgraded a piece. It completes on the first Runeforge upgrade
 * anywhere: Claude 3 emits item:crafted { recipe: 'recipe:upgrade' } and the engine sets builds.upgraded.
 * Only one runs at a time (builds.smith_quest). No `campaign`: outside every campaign's quest count, like First Steps.
 * Owner: Claude 4.
 */
import type { QuestDef, SchoolId } from '@/core';

const CAPITAL: Record<SchoolId, string> = {
  ash: 'Kilnhold', rime: 'Glacierhome', storm: 'Spirehold', radiance: 'Dawnspire', umbral: 'Duskmere', verdant: 'Rootholme',
  blade: 'Edgewater', iron: 'Anvilgate', fist: 'Stonecloister', hunt: 'Antlerford', guile: 'Velvet Harbour', song: 'Lyrehaven',
};

const quests: QuestDef[] = (Object.keys(CAPITAL) as SchoolId[]).map((s): QuestDef => ({
  id: `quest:${s}-smiths-eye`, name: 'A Smith’s Eye', type: 'side', act: 'act1', chapter: CAPITAL[s],
  region: `area:${s}-capital`, giver: `npc:${s}-smith`,
  summary: `The smith at the ${CAPITAL[s]} Runeforge has offered to make one piece you like stronger, for Embershards and Iron Ingots.`,
  firstStage: 'forge',
  stages: [{
    id: 'forge',
    journal: 'Pick something worth keeping, bring the Embershards and the Iron Ingots, and let the Runeforge argue it into something better. Any Runeforge will do.',
    objectives: [{ id: 'up', text: 'Upgrade a piece at the Runeforge', when: { flag: 'builds.upgraded' }, marker: { landmark: `landmark:${s}-capital-smithy` } }],
    end: { status: 'completed' },
  }],
  reward: { xpTier: 1, hcItems: [{ item: 'i_ingot', qty: 2 }] },
}));

export default quests;
