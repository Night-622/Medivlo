/**
 * Opening read-through (Claude 4): what a new player of each class reads in their first fifteen minutes, in order.
 * First Steps, then the campaign's first quest stage by stage (journal, objectives with where the marker points, and
 * every dialogue the stage opens, node by node), then the next quest's first stage. Ends with each proper name's first
 * mention, so a name used before it is introduced stands out. Read-only.
 * ACT=act2 / act3: the first quests after that act turns instead (the shared autoStart openers once, as SHARED, then each
 * class's first quest of the act). Usage: [ACT=act2] CLASSES=warden,arcanist node $(node tools/narrative/build.mjs tools/narrative/opening-dump.ts full)
 */
import { Registry } from '@/core';
import type { DialogueDef, NpcDef, ObjectiveDef, QuestDef, QuestStage } from '@/core';
import { CAMPAIGNS } from '@/narrative/engine/classes';
import { objectivePlaces } from '@/narrative/client/markers';

const want = process.env.CLASSES?.split(',');
const quests = Registry.all('quest') as QuestDef[];
const npcName = (id: string) => (Registry.tryGet('npc', id) as NpcDef | undefined)?.name ?? id;

function classOf(q: QuestDef): string | undefined {
  const r = q.requires as { heroClass?: string; all?: { heroClass?: string }[] } | undefined;
  return r?.heroClass ?? r?.all?.find((c) => c.heroClass)?.heroClass;
}

function objLine(o: ObjectiveDef, cls: string): string {
  const places = objectivePlaces(o, cls);
  return `    • ${o.text ?? '(no text)'}${o.hidden ? ' [hidden]' : ''}  → ${places.length ? places.slice(0, 3).join(', ') + (places.length > 3 ? ` +${places.length - 3}` : '') : 'NO MARKER'}`;
}

/** `at` = [quest id, stage id]: start from the entry those conditions would pick at this point (else the first) */
function dialogue(id: string, out: string[], at?: [string, string]): void {
  const d = Registry.tryGet('dialogue', id) as DialogueDef | undefined;
  if (!d) { out.push(`    [dialogue ${id} missing]`); return; }
  out.push(`    ── ${id}`);
  const js = (e: { when?: unknown }) => JSON.stringify(e.when ?? '');
  const entry = (at && (d.entries.find((e) => js(e).includes(at[0]) && js(e).includes(`"${at[1]}"`)) ?? d.entries.find((e) => js(e).includes(at[0])))) ?? d.entries[0];
  const seen = new Set<string>(), queue = [entry?.node];
  while (queue.length) {
    const n = queue.shift();
    if (!n || seen.has(n) || !d.nodes[n]) continue;
    seen.add(n);
    const node = d.nodes[n];
    const sp = typeof node.speaker === 'string' ? (node.speaker.startsWith('npc:') ? npcName(node.speaker) : node.speaker) : 'speaker';
    out.push(`      ${sp}: ${node.text}`);
    for (const c of node.choices ?? []) { out.push(`        > ${c.text}${c.to ? '' : ' (ends)'}`); if (c.to) queue.push(c.to); }
    if (node.next) queue.push(node.next);
  }
}

function stage(q: QuestDef, s: QuestStage, cls: string, out: string[]): void {
  out.push(`  [${q.name} · ${s.id}] ${s.journal ?? ''}`);
  for (const e of s.onEnter ?? []) if ('openDialogue' in e) dialogue(e.openDialogue as string, out, [q.id, s.id]);
  for (const o of s.objectives) {
    out.push(objLine(o, cls));
    if ('talk' in o && typeof o.talk === 'string') {
      const npc = Registry.tryGet('npc', o.talk) as NpcDef | undefined;
      // the NPC's entry for this quest stage (else for this quest), as the conditions would pick it at this point
      const js = (e: { when?: unknown }) => JSON.stringify(e.when ?? '');
      const pick = npc?.dialogue.find((e) => js(e).includes(q.id) && js(e).includes(`"${s.id}"`)) ?? npc?.dialogue.find((e) => js(e).includes(q.id));
      if (pick) dialogue(pick.dialogue, out, [q.id, s.id]); else if (npc) out.push(`    (talks with ${npc.dialogue.map((e) => e.dialogue).join(' | ')})`);
    }
  }
  for (const e of s.onComplete ?? []) if ('openDialogue' in e) dialogue(e.openDialogue as string, out, [q.id, s.id]);
}

const ACT = process.env.ACT;
if (ACT && process.env.SHARED !== '0') {
  const out: string[] = [`==================== SHARED ${ACT} openers`];
  for (const q of quests.filter((x) => x.act === ACT && x.autoStart && !classOf(x))) {
    out.push(`  summary: ${q.summary ?? ''}`);
    let s: QuestStage | undefined = q.stages.find((x) => x.id === q.firstStage) ?? q.stages[0];
    for (let i = 0; s && i < 5; i++) { stage(q, s, 'warden', out); s = s.next ? q.stages.find((x) => x.id === s!.next) : undefined; }
  }
  console.log(out.join('\n'));
}
for (const c of CAMPAIGNS) {
  if (want && !want.includes(c.id)) continue;
  const out: string[] = [`==================== ${c.id} (${c.school}, ${c.side})${ACT ? ` ${ACT}` : ''}`];
  const first = ACT
    ? quests.find((q) => q.act === ACT && classOf(q) === c.id && (q.type === 'main' || q.type === 'class'))
    : quests.find((q) => q.autoStart && q.type === 'main' && classOf(q) === c.id);
  if (!first) { console.log(out[0], '\n  NO autoStart main quest'); continue; }
  out.push(`  summary: ${first.summary ?? ''}`);
  let s: QuestStage | undefined = first.stages.find((x) => x.id === first.firstStage) ?? first.stages[0];
  let next: string | undefined;
  for (let i = 0; s && i < 5; i++) {
    stage(first, s, c.id, out);
    for (const e of s.onComplete ?? []) if ('startQuest' in e) next = e.startQuest as string;
    s = s.next ? first.stages.find((x) => x.id === s!.next) : undefined;
  }
  const q2 = next ? quests.find((q) => q.id === next) : undefined;
  if (q2) { out.push(`  summary: ${q2.summary ?? ''}`); stage(q2, q2.stages.find((x) => x.id === q2.firstStage) ?? q2.stages[0], c.id, out); }
  // first mentions of capitalised names (two-word names count as one), in reading order
  const firsts = new Map<string, string>();
  out.forEach((line, i) => {
    for (const m of line.replace(/^\s*(•|>|\[[^\]]*\]|[^:]{1,40}:)\s*/, '').matchAll(/(?<![.!?]\s|^)\b([A-Z][a-z’'-]+(?: [A-Z][a-z’'-]+)*)/g)) {
      if (!firsts.has(m[1])) firsts.set(m[1], `${i}: ${line.trim().slice(0, 70)}`);
    }
  });
  out.push('  first mentions:');
  for (const [n, where] of firsts) out.push(`    ${n.padEnd(24)} @${where}`);
  console.log(out.join('\n'));
}
