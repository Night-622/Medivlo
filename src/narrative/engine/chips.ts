/**
 * Dialogue choice view + the chip codec for `dialogue:node.choices[].chips: string[]` (approved by Claude 1).
 * Pure: shared by the authority (encode) and every client (decode). Owner: Claude 4.
 *
 *   'trust+1' | 'trust-1' | 'quest' | 'insight' | 'school:<id>' | 'label:<text>' | 'tag:<tag>'
 *   | 'check:<stat>:<label>:<dc>:<have>' | 'rep:<faction>:<delta>'
 */
import type { DialogueChoice, SchoolId } from '@/core';

export interface ChoiceView {
  index: number;
  /** choice text without any leading [Label] */
  text: string;
  enabled: boolean;
  tag?: DialogueChoice['tag'];
  /** leading [Label] from the data (v1), or the lockedLabel when disabled */
  chip?: string;
  /** v2 handoff chips */
  trust?: 1 | -1;
  quest?: boolean;
  insight?: boolean;
  school?: SchoolId;
  /** v1 passive check: attribute vs DC */
  check?: { stat: string; label: string; dc: number; have: number };
  /** v1 reputation effects of picking this choice */
  rep?: { faction: string; delta: number }[];
}

export function encodeChips(c: ChoiceView): string[] {
  const out: string[] = [];
  if (c.trust) out.push(c.trust > 0 ? 'trust+1' : 'trust-1');
  if (c.quest) out.push('quest');
  if (c.insight) out.push('insight');
  if (c.school) out.push(`school:${c.school}`);
  if (c.chip && c.enabled) out.push(`label:${c.chip}`);
  if (c.tag) out.push(`tag:${c.tag}`);
  if (c.check) out.push(`check:${c.check.stat}:${c.check.label}:${c.check.dc}:${c.check.have}`);
  for (const r of c.rep ?? []) out.push(`rep:${r.faction}:${r.delta}`);
  return out;
}

export function decodeChoice(p: { index: number; text: string; chips: string[]; school?: string; locked?: boolean; lockedLabel?: string }): ChoiceView {
  const v: ChoiceView = { index: p.index, text: p.text, enabled: !p.locked };
  if (p.locked && p.lockedLabel) v.chip = p.lockedLabel;
  if (p.school) v.school = p.school as SchoolId;
  for (const chip of p.chips) {
    if (chip === 'trust+1') v.trust = 1;
    else if (chip === 'trust-1') v.trust = -1;
    else if (chip === 'quest') v.quest = true;
    else if (chip === 'insight') v.insight = true;
    else if (chip.startsWith('school:')) v.school = chip.slice(7) as SchoolId;
    else if (chip.startsWith('label:')) v.chip = chip.slice(6);
    else if (chip.startsWith('tag:')) v.tag = chip.slice(4) as DialogueChoice['tag'];
    else if (chip.startsWith('check:')) {
      const [, stat, label, dc, have] = chip.split(':');
      v.check = { stat, label, dc: Number(dc), have: Number(have) };
    } else if (chip.startsWith('rep:')) {
      const i = chip.lastIndexOf(':');
      (v.rep ??= []).push({ faction: chip.slice(4, i), delta: Number(chip.slice(i + 1)) });
    }
  }
  return v;
}
