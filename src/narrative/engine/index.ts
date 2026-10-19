/**
 * Narrative engine (Claude 4): pure TS, no Phaser, no DOM, no '@/systems'.
 * Runs only where the simulation runs (net.isAuthority(): solo, host, dedicated server).
 * Clients render from replicated events (docs/lore/hollow-crown/07-narrative-systems.md §4).
 */
import { Game, bus, getFlag, setFlag } from '@/core';
import { authBus, isAuthority } from './state';
import { campaign } from './classes';
import { activeQuests, currentStage, schedule } from './quests';
import { dialogue } from './dialogue';
import { heroClass } from './party';
import { getTrust } from './trust';
import { installBanter } from './banter';
import { installCodexTriggers } from './codex';
import { installNpcTriggers } from './npcs';
import { installQuestTriggers } from './quests';
import { installDialogueNet } from './dialogue';
import { installNemesis } from './nemesis';
import { installEscorts } from './escort';
import { syncAllRepFlags } from './reputation';

export { check as checkCondition, playerTags, setTagProvider } from './conditions';
export { applyEffects } from './effects';
export { dialogue, openDialogue, interpolate } from './dialogue';
export type { DialogueView, ChoiceView } from './dialogue';
export { startQuest, setStage, completeQuest, failQuest, activeQuests, questDef, progress, isActive } from './quests';
export { unlockLore, isUnlocked } from './codex';
export { getTrust, changeTrust, setTrust, trustLevel, trustPrice, trustKey } from './trust';
export { heroClass, heroSchool, members, partySize } from './party';
export { encodeChips, decodeChoice } from './chips';
export { CAMPAIGNS, campaign, SCHOOL_NAME } from './classes';
export type { CampaignInfo } from './classes';
export { getRep, changeRep, repTier, rankTitle, syncAllRepFlags, PRICE_BY_TIER } from './reputation';
export { validateContent } from './validate';
export { availableBanter, playBanter } from './banter';
export { npcDef, npcsAt, npcLandmark, npcPlacements, isPresent, talkTo, bark, npcMet, npcQuestState, npcQuestInfo } from './npcs';

let installed = false;

/** Wire the authority-side narrative: quest/NPC/codex triggers, banter and reputation flags. */
/**
 * story.gate_fight is true while the realm-gate fight (I-10) is the current objective: an active quest stage with a
 * kill objective on a realm boss (bx_<school>_5). Claude 2 arms the gate arena's boss trigger on it.
 */
export function syncGateFight(): void {
  const on = activeQuests().some((q) => (currentStage(q)?.objectives ?? []).some((o) => 'kill' in o && typeof o.kill === 'string' && /^bx_[a-z]+_5$/.test(o.kill)));
  if (!!getFlag('story.gate_fight') !== on) setFlag('story.gate_fight', on);
}

/** story.mentor_trust mirrors the campaign mentor's trust (0..5), so shared Act III gates need no per-class ids */
export function syncMentor(): void {
  const id = campaign(heroClass())?.mentorId;
  if (!id) return;
  const t = getTrust(id as `npc:${string}`);
  if (getFlag('story.mentor_trust') !== t) setFlag('story.mentor_trust', t);
}

export function syncBearers(): void {
  const n = Object.entries(Game.state.flags).filter(([k, v]) => k.startsWith('story.bearer.') && v === true).length;
  if (getFlag('story.bearers_gathered') !== n) setFlag('story.bearers_gathered', n);
}

export function installNarrativeAuthority(): void {
  if (installed) return;
  installed = true;
  // object/NPC dialogues first, so they see the quest stage before an interact advances it
  installNpcTriggers();
  installQuestTriggers();
  installCodexTriggers();
  installBanter();
  installDialogueNet();
  installNemesis();
  installEscorts();
  // story.bearers_gathered is derived: the number of distinct story.bearer.<class> flags (08 R11)
  authBus.on('flag:changed', ({ key }) => {
    if (key.startsWith('story.bearer.')) syncBearers();
    if (key.startsWith('trust.')) syncMentor();
  });
  authBus.on('game:loaded', () => syncMentor());
  for (const ev of ['quest:started', 'quest:advanced', 'quest:completed', 'game:loaded'] as const) authBus.on(ev, () => syncGateFight());
  authBus.on('game:new', () => syncAllRepFlags());
  // net is a switch facade (Claude 1): becoming a guest or realm visitor drops this machine's own scenes (the host's
  // story takes over); becoming the authority again (back to solo, or hosting) resumes the local campaign
  bus.on('net:changed', () => { if (isAuthority()) schedule(); else dialogue.drop(); });
  authBus.on('game:loaded', () => syncAllRepFlags());
}
