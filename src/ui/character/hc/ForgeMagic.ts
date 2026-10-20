/**
 * Runeforge tabs for the deeper builds (Claude 3, BUILDS.md §6): Reroll one affix line, Imbue a weapon with a
 * school (needs that school's Essence), Transfer a unique effect from a carried piece onto another of the same slot
 * family, and Craft runes from their recipes. Prices from rules/runeforge.ts and HC_RUNES[].craft.
 */
import { C, HCButton, T, typeStyle } from '@/ui/kit/hc';
import { MAGIC_SCHOOLS, MARTIAL_SCHOOLS } from '@/core/constants';
import { SCHOOL_COLOR, SCHOOL_NAME } from '@/data/classes/hc';
import { essenceOf, HC_RUNES } from '@/data/items/hc/build-items';
import { itemInfo } from '@/systems/rules/gear';
import { affixDef, itemRarity } from '@/systems/rules/affixes';
import { affixLines, itemTooltip, type TipLine } from '@/systems/rules/describeHc';
import { imbueCost, rerollCost, transferCost, uniqueOf } from '@/systems/rules/runeforge';
import type { ItemInstance } from '@/systems/rules/types';
import { flavourOf } from '@/systems/rules/buildText';
import { cell, have, LEFT, STEP, uniqueSources, type ForgeCtx } from './ForgeTabs';
import { runeName } from './RunePanel';

const SCHOOLS = [...MAGIC_SCHOOLS, ...MARTIAL_SCHOOLS];
const rarityColor = (r: string): string => (T.color.rarity as Record<string, { color: string }>)[r]?.color ?? C.text;

export function bodyReroll(ctx: ForgeCtx, it: ItemInstance): void {
  const { hud, root, ch, shop } = ctx;
  const cost = rerollCost(it);
  if (cost === null) { root.add(hud.add.text(LEFT, 380, 'No bonus lines to reroll. Fine and better gear rolls them.', typeStyle('body', C.text500, 512))); return; }
  const ok = ch.gold >= cost;
  root.add(hud.add.text(LEFT, 372, `Reroll one line: ${cost} Embershards. A fresh roll of the same kind at item level ${it.ilvl}.`, typeStyle('body', ok ? C.text : C.danger, 512)));
  (it.affixes ?? []).forEach((a, i) => {
    const y = 404 + i * 54, d = affixDef(a.id);
    const line = affixLines({ ...it, affixes: [a] })[0];
    root.add(hud.add.text(LEFT, y + 2, d?.kind === 'prefix' ? 'Prefix' : 'Suffix', typeStyle('caption', C.text500)));
    root.add(hud.add.text(LEFT, y + 18, line?.text ?? a.id, typeStyle('body', line?.color === 'school' ? SCHOOL_COLOR[ctx.school] : C.good, 380)));
    root.add(new HCButton(hud, 530, y + 22, 'Reroll', () => ctx.act('reroll', { shop, uid: it.uid, affix: i }), { w: 116, h: 44, variant: 'secondary', disabled: !ok }));
  });
}

export function bodyImbue(ctx: ForgeCtx, it: ItemInstance): void {
  const { hud, root, ch, shop } = ctx;
  const cost = imbueCost(it);
  if (cost === null) { root.add(hud.add.text(LEFT, 380, 'Only weapons take an imbue.', typeStyle('body', C.text500))); return; }
  root.add(hud.add.text(LEFT, 372, it.imbue ? `Imbued with ${SCHOOL_NAME[it.imbue]}. A new imbue replaces it.` : 'Not imbued.', typeStyle('body', it.imbue ? SCHOOL_COLOR[it.imbue] : C.text)));
  root.add(hud.add.text(LEFT, 392, `${cost} Embershards + 1 Essence of the school: half the weapon’s damage becomes that school’s.`, typeStyle('caption', ch.gold >= cost ? C.text300 : C.danger, 512)));
  SCHOOLS.forEach((s, i) => {
    const n = have(ch, essenceOf(s)), cur = it.imbue === s;
    const x = LEFT + 61 + (i % 4) * 128, y = 450 + Math.floor(i / 4) * 58;
    root.add(new HCButton(hud, x, y, SCHOOL_NAME[s], () => ctx.act('imbue', { shop, uid: it.uid, school: s }),
      { w: 122, h: 52, variant: cur ? 'primary' : 'secondary', disabled: !n || cur || ch.gold < cost, sub: cur ? 'current' : `Essence ×${n}` }));
  });
}

/** The unique / legendary effect text a piece carries. */
const effectText = (it: ItemInstance): string => { const fx = uniqueOf(it); return (fx && itemInfo(fx)?.desc) ?? 'its bound effect'; };

export function bodyTransfer(ctx: ForgeCtx, it: ItemInstance): void {
  const { hud, root, ch, shop, st } = ctx;
  const info = itemInfo(it.base)!;
  if (info.kind === 'legendary') {
    root.add(hud.add.text(LEFT, 372, 'A unique keeps its own effect. Select the plain piece that should receive it; this one is the source.', typeStyle('body', C.text300, 512)));
    return;
  }
  const sources = uniqueSources(ch, it);
  root.add(hud.add.text(LEFT, 372, 'Take the effect from (the source is destroyed):', typeStyle('body', C.text)));
  if (!sources.length) { root.add(hud.add.text(LEFT, 400, `Carry a unique or legendary ${info.slot} to move its effect onto this piece.`, typeStyle('caption', C.text500, 512))); return; }
  sources.slice(0, 8).forEach((s, i) => {
    const cost = transferCost(s, it);
    cell(ctx, LEFT + i * STEP, 396, s.base, {
      rarity: itemRarity(s), dim: cost === null, selected: st.src === s.uid, badge: cost === null ? { text: '—', ok: false } : { text: String(cost), ok: ch.gold >= cost },
      tip: () => [...itemTooltip(s, ctx.equipped, ctx.school, ctx.weapons), cost === null ? { text: `Only onto a ${itemInfo(s.base)?.slot ?? 'matching'} piece.`, color: 'danger', size: 's' } : { text: 'Click to use as the source', color: 'gold', size: 's' }],
      onClick: () => { if (cost !== null) { st.src = s.uid; ctx.redraw(); } },
    });
  });
  const src = sources.find((s) => s.uid === st.src && transferCost(s, it) !== null);
  if (!src) { root.add(hud.add.text(LEFT, 470, 'Pick a source above.', typeStyle('caption', C.text500))); return; }
  const cost = transferCost(src, it)!;
  root.add(hud.add.text(LEFT, 468, `${itemInfo(src.base)?.name}: ${effectText(src)}`, typeStyle('body', C.gold, 512)));
  if (it.uniqueFx) root.add(hud.add.text(LEFT, 530, 'Its current bound effect is replaced.', typeStyle('caption', C.danger)));
  root.add(new HCButton(hud, 226, 590, `Bind it onto the ${info.slot}`, () => { st.src = null; ctx.act('transfer', { shop, uid: it.uid, from: src.uid }); },
    { w: 300, disabled: ch.gold < cost, sub: `${cost} Embershards · ${itemInfo(src.base)?.name} is destroyed` }));
}

/** Craft tab: the rune recipes in a grid (where the worn pieces sit on the other tabs), the chosen one below. */
export function drawCraft(ctx: ForgeCtx): void {
  const { hud, root, ch, shop, st } = ctx;
  const can = (r: typeof HC_RUNES[number]) => ch.gold >= r.craft.gold && r.craft.items.every((x) => have(ch, x.item) >= x.qty);
  const recipe = (r: typeof HC_RUNES[number]): TipLine[] => [
    { text: `${r.craft.gold} Embershards (you have ${ch.gold})`, color: ch.gold >= r.craft.gold ? 'gold' : 'danger', size: 's' },
    ...r.craft.items.map((x): TipLine => ({ text: `${x.qty} ${itemInfo(x.item)?.name ?? x.item} (you have ${have(ch, x.item)})`, color: have(ch, x.item) >= x.qty ? 'good' : 'danger', size: 's' })),
  ];
  HC_RUNES.forEach((r, i) => {
    const ok = can(r);
    cell(ctx, LEFT + (i % 8) * STEP, 184 + Math.floor(i / 8) * STEP, r.id, {
      dim: !ok, selected: st.rune === r.id, badge: { text: String(r.craft.gold), ok }, qty: have(ch, r.id),
      tip: () => [{ text: runeName(r.id), color: 'rarity', size: 'h' }, { text: r.desc, size: 's' }, { text: r.fits.length ? `Fits ${r.fits.join(' / ')} spells` : 'Fits any spell', color: 'dim', size: 's' }, ...recipe(r),
        ...(flavourOf('rune', r.id) ? [{ text: flavourOf('rune', r.id)!, color: 'dim' as const, size: 's' as const, italic: true }] : [])],
      onClick: () => { st.rune = r.id; ctx.redraw(); },
    });
  });
  const r = HC_RUNES.find((x) => x.id === st.rune);
  if (!r) { root.add(hud.add.text(LEFT, 452, 'Choose a rune to craft. Runes go into your spells’ rune slots (Spells panel).', typeStyle('body', C.text300, 512))); return; }
  root.add(hud.add.text(LEFT, 446, runeName(r.id), typeStyle('h3', rarityColor(r.rarity))));
  root.add(hud.add.text(LEFT, 472, `${r.desc}  ${r.fits.length ? `(${r.fits.join(' / ')} spells)` : '(any spell)'}`, typeStyle('body', C.text, 512)));
  recipe(r).forEach((l, i) => root.add(hud.add.text(LEFT, 520 + i * 20, l.text, typeStyle('body', l.color === 'danger' ? C.danger : l.color === 'good' ? C.good : C.gold))));
  root.add(new HCButton(hud, 470, 560, 'Craft', () => ctx.act('craft', { shop, rune: r.id }), { w: 220, disabled: !can(r), sub: `you carry ${have(ch, r.id)}` }));
}
