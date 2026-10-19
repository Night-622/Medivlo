/** Per-class campaign bot: plays a class from a new game through its campaign + the shared Concordia act. */
import { Game, Registry, Services, bus, createNewGameState, getFlag, classSchool, heroClassId } from '@/core';
import type { DialogueDef, NpcDef, QuestDef } from '@/core';
import { installNarrativeAuthority, dialogue, talkTo, activeQuests, checkCondition, CAMPAIGNS } from '@/narrative/engine';
import { currentStage, objectiveDone, progress } from '@/narrative/engine/quests';
import { HC_CAMPAIGN_BOSSES } from '@/data/enemies/hc/campaign';
import { newCharacter } from '@/systems/rules/character';
// nemesis forms yield instead of dying (Claude 3); lair-2 bosses die normally
const YIELDS = new Set([...HC_CAMPAIGN_BOSSES.filter((b) => b.slot !== 'lair2').map((b) => b.id), 'bx_hollowking']);

const CLASSES = (process.env.CLASSES ?? 'arcanist').split(',');
const SEEDS = Number(process.env.SEEDS ?? 3);
const COOP = process.env.COOP === '1';
let seed = 1;
const rand = () => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);
let party: string[] = [];
let votes = 0;
if (COOP) Services.register('net', {
  role: 'host', localPlayer: 'local', isAuthority: () => true, partySize: () => party.length,
  session: () => ({ members: party.map((c, i) => ({ playerId: i ? `p${i}` : 'local', name: c, classId: c, level: 10, isHost: !i, connected: true, downed: false })) }),
  onClient: () => () => {}, on: () => () => {}, addStateSync: () => () => {},
  openVote: (v: any) => { votes++; const ch = v.choices; return Promise.resolve(ch[Math.floor(rand() * ch.length)].index); },
} as never);
installNarrativeAuthority();
const tick = () => new Promise((r) => setTimeout(r, 0));

// flag → where it is set (object dialogues → obj ids; npc dialogues → npc ids)
const setters = new Map<string, { objs: Set<string>; npcs: Set<string> }>();
const npcOf = new Map<string, string[]>();
for (const n of Registry.all('npc') as NpcDef[]) for (const d of n.dialogue) npcOf.set(d.dialogue, [...(npcOf.get(d.dialogue) ?? []), n.id]);
for (const d of Registry.all('dialogue') as DialogueDef[]) {
  const flags = JSON.stringify(d).match(/"setFlag":"[^"]+"|"insight":"[^"]+"/g) ?? [];
  for (const f of flags) {
    const key = f.startsWith('"setFlag"') ? f.slice(11, -1) : `insight.${f.slice(11, -1)}`;
    const e = setters.get(key) ?? { objs: new Set(), npcs: new Set() };
    if (d.id.startsWith('dialogue:obj-')) e.objs.add(`obj:${d.id.slice(13)}`);
    for (const n of npcOf.get(d.id) ?? []) e.npcs.add(n);
    setters.set(key, e);
  }
}
const school = () => classSchool(heroClassId(Game.state) ?? '')!;
async function runDialogue() {
  for (let i = 0; i < 80 && dialogue.active; i++) {
    const v = dialogue.view()!;
    const en = v.choices.filter((c) => c.enabled);
    if (!en.length) dialogue.advance();
    else if (!COOP) dialogue.choose(en[Math.floor(rand() * en.length)].index);
    await tick();
  }
  if (dialogue.active) { stuckDlg.push(dialogue.view()!.dialogueId); dialogue.close(); }
}
const stuckDlg: string[] = [];
const interact = async (id: string) => { bus.emit('interact', { objectId: id, kind: 'object' as never, props: {}, playerId: 'local' }); await runDialogue(); };
async function act(o: any) {
  if ('talk' in o) { talkTo(o.talk, 'local'); await runDialogue(); return; }
  if ('interact' in o) {
    const n = o.count ?? 1;
    for (let i = 0; i < n; i++) {
      const id = o.interact.endsWith('-*') ? o.interact.replace('*', String(i + 1)) : o.interact.replace('*', school());
      await interact(id);
    }
    return;
  }
  if ('kill' in o) {
    const c = o.kill.replace('*', 'ed');
    for (let i = 0; i < o.count; i++) {
      if (YIELDS.has(c)) bus.emit('enemy:yielded', { enemyId: 'e', creature: c, space: 'x', x: 0, y: 0, killers: ['local'] });
      else bus.emit('enemy:killed', { enemyId: 'e', creature: c, x: 0, y: 0, level: 1 } as never);
    }
    return;
  }
  if ('collect' in o) { bus.emit('loot:granted', { playerId: 'local', item: o.collect, qty: o.count }); return; }
  if ('reach' in o) {
    const id: string = o.reach;
    if (id.startsWith('ws:')) bus.emit('waystone:woken', { playerId: 'local', waystone: id, space: 'concordia' });
    else if (id.startsWith('region:')) bus.emit('region:entered', { regionId: id, prevRegionId: null });
    else if (id.startsWith('inst:')) bus.emit('instance:entered', { instanceId: id });
    else if (id.startsWith('area:') || id.startsWith('zone:')) bus.emit('area:entered', { triggerId: id });
    else bus.emit('landmark:discovered', { landmarkId: id });
    return;
  }
  if ('when' in o) {
    const keys = [...JSON.stringify(o.when).matchAll(/"(?:flag|insight)":"([^"]+)"/g)].map((m) => (m[0].startsWith('"insight"') ? `insight.${m[1]}` : m[1]));
    for (const night of [false, true]) {
      Game.state.world.time = (night ? 22 : 12) * 60;
      for (const k of keys) {
        const s = setters.get(k);
        for (const ob of s?.objs ?? []) await interact(ob);
        for (const np of s?.npcs ?? []) { talkTo(np as never, 'local'); await runDialogue(); }
      }
      if (checkCondition(o.when)) break;
    }
    Game.state.world.time = 12 * 60;
  }
}

(async () => {
  const out: string[] = [];
  const sizes: string[] = [];
  for (const cls of CLASSES) for (let s = 1; s <= SEEDS; s++) {
    seed = s * 7919 + cls.length * 31;
    const c = CAMPAIGNS.find((x) => x.id === cls)!;
    party = COOP ? [cls, ...CAMPAIGNS.map((x) => x.id).filter((x) => x !== cls).sort(() => rand() - 0.5).slice(0, 3)] : [cls];
    Game.set(createNewGameState());
    // the real path: character creation sets player.hero; Game.set mirrors it (core syncHeroClass)
    Game.state.player.hero = { classId: cls, look: { skin: 0, hair: 0, hc: 0, eyes: 0, brows: 0, ec: 0, mouth: 0, mark: 0, body: 0 }, outfit: { dye: 0, headw: 0, cape: 0, neck: 0, face: 0, extra: 0 } };
    // a real Hollow Crown hero also has a character save (core minLevel/hasItem read it)
    Game.state.character = newCharacter(cls);
    Game.set(Game.state);
    Game.state.world.time = 12 * 60;
    bus.emit('game:new', {} as never);
    bus.emit('flag:changed', { key: 'boot', value: 1, prev: undefined });
    let last = '', stall = 0;
    const mine = (Registry.all('quest') as QuestDef[]).filter((q) => q.campaign === cls || q.campaign === 'shared');
    for (let step = 0; step < 600 && stall < 15; step++) {
      for (const q of mine) if (!progress(q.id) && q.giver && checkCondition(q.requires)) for (let t = 0; t < 6 && !progress(q.id); t++) { talkTo(q.giver, 'local'); await runDialogue(); }
      for (const q of activeQuests()) {
        for (const o of currentStage(q)?.objectives ?? []) if (!objectiveDone(q, o)) await act(o);
      }
      const sig = JSON.stringify(Game.state.narrative.quests) + getFlag('story.act');
      stall = sig === last ? stall + 1 : 0; last = sig;
    }
    // unstarted quests whose gate fails (e.g. mentor trust) are optional this run, not a soft-lock
    const gated = mine.filter((q) => !progress(q.id) && !checkCondition(q.requires)).map((q) => q.id.slice(6));
    const runs = (Game.state.narrative.ext.bountyRuns ?? {}) as Record<string, number>;
    const left = mine.filter((q) => !progress(q.id)?.completed && !runs[q.id] && !gated.includes(q.id.slice(6))).map((q) => `${q.id.slice(6)}@${progress(q.id)?.stage ?? '-'}`);
    // SIZE=1: save-size breakdown at the end of the run (Claude 1: one Firestore doc, aim < ~300 KB)
    if (process.env.SIZE) {
      const len = (x: unknown) => JSON.stringify(x ?? null).length;
      const st = Game.state as unknown as Record<string, unknown> & { narrative: Record<string, unknown> & { ext: Record<string, unknown> } };
      const prefixes = new Map<string, number>();
      for (const [k, v] of Object.entries(Game.state.flags)) { const p = k.split('.')[0]; prefixes.set(p, (prefixes.get(p) ?? 0) + k.length + len(v) + 4); }
      sizes.push(`${cls}#${s}: total ${len(Game.state)} B · flags ${Object.keys(Game.state.flags).length} (${len(Game.state.flags)} B; ${[...prefixes].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([p, n]) => `${p} ${n}`).join(', ')})`
        + ` · quests ${Object.keys(st.narrative.quests as object).length} (${len(st.narrative.quests)} B) · codex ${len(st.narrative.codexUnlocked)} B`
        + ` · ext {${Object.entries(st.narrative.ext ?? {}).map(([k, v]) => `${k} ${len(v)}`).join(', ')}}`
        + ` · other {${Object.keys(st).filter((k) => !['flags', 'narrative'].includes(k)).map((k) => `${k} ${len(st[k])}`).join(', ')}}`);
    }
    out.push(`${cls}#${s}${COOP ? ' [' + party.slice(1).join(',') + ']' : ''}: ${mine.length - left.length}/${mine.length} act=${getFlag('story.act')} ready=${!!getFlag('story.act2_ready')} heart=${!!getFlag('story.heart_open')} bearers=${getFlag('story.bearers_gathered') ?? 0} trust(mentor)=${getFlag('trust.' + c.mentorId.slice(4))} ${gated.length ? 'gated(' + gated.join(',') + ') ' : ''}${left.length ? 'LEFT ' + left.join(' ') : 'OK'}`);
  }
  console.log(out.join('\n'));
  if (sizes.length) console.log(sizes.join('\n'));
  if (stuckDlg.length) console.log('STUCK DIALOGUES:', [...new Set(stuckDlg)].join(' '));
  console.log(out.every((l) => l.endsWith('OK')) ? `PASS${COOP ? ` (votes ${votes})` : ''}` : 'FAIL');
})();
