/**
 * Runeforge tabs for the piece's body (Claude 3, BUILDS.md §6): Reforge, Sockets, Upgrade, Salvage.
 * Layout: the selected piece's header at y 316, the controls below it, the footer line at 652.
 * Reforge keeps the original Anvil layout (reforge button at (226, 404), a gem row at y 480 that fills the next
 * empty socket) so the older flows and tools/e2e/hc-panels.mjs keep working.
 */
import { C, HCButton, T, typeStyle } from '@/ui/kit/hc';
import { GEMS, itemInfo, upgradeOf } from '@/systems/rules/gear';
import { itemRarity, socketCount } from '@/systems/rules/affixes';
import { rarityLabel } from '@/systems/rules/describeHc';
import { dustYield, INGOT, MAX_UPGRADE, reforgeCost, salvageYield, socketCost, upgradeCost } from '@/systems/rules/runeforge';
import type { ItemInstance } from '@/systems/rules/types';
import { BODY_Y, cell, have, LEFT, plural, STEP, type ForgeCtx } from './ForgeTabs';

const rarityColor = (r: string): string => (T.color.rarity as Record<string, { color: string }>)[r]?.color ?? C.text;

/** Name (+upgrade) in its rarity colour, then item level, rarity and upgrade level. */
export function pieceHeader(ctx: ForgeCtx, it: ItemInstance): void {
  const { hud, root } = ctx;
  const info = itemInfo(it.base)!, up = upgradeOf(it), r = itemRarity(it);
  root.add(hud.add.text(LEFT, BODY_Y, `${info.name}${up ? ` +${up}` : ''}`, typeStyle('h3', rarityColor(r))));
  root.add(hud.add.text(LEFT, BODY_Y + 26, `Item level ${it.ilvl}  ·  ${rarityLabel(r)}${up ? `  ·  upgrade ${up}/${MAX_UPGRADE}` : ''}`, typeStyle('caption', C.text300)));
}

/** The sockets array as the authority will see it (legacy `gem` sits in socket 0). */
export function socketsOf(it: ItemInstance): (string | null)[] {
  const n = socketCount(it);
  const s = it.sockets ? [...it.sockets] : Array.from({ length: n }, (_, i) => (i === 0 ? it.gem ?? null : null));
  while (s.length < n) s.push(null);
  return s.slice(0, n);
}

const gemTip = (gem: string, cost: number) => () => [
  { text: itemInfo(gem)!.name, color: 'gold' as const, size: 'b' as const },
  { text: GEMS[gem].label, color: 'good' as const, size: 's' as const },
  { text: `Set it for ${cost} Embershards`, color: 'dim' as const, size: 's' as const },
];

export function bodyReforge(ctx: ForgeCtx, it: ItemInstance): void {
  const { hud, root, ch, shop } = ctx;
  const ingots = have(ch, INGOT);
  const rc = reforgeCost(it, ch.level);
  const canRe = !!rc && ch.gold >= rc.gold && ingots >= rc.ingots;
  root.add(new HCButton(hud, 226, 404, rc ? `Reforge to level ${rc.to}` : 'Already at your level', () => ctx.act('reforge', { shop, uid: it.uid }),
    { w: 300, disabled: !canRe, sub: rc ? `${rc.gold} Embershards · ${plural(rc.ingots, 'Iron Ingot')}` : undefined }));
  if (rc && !canRe) root.add(hud.add.text(400, 404, ch.gold < rc.gold ? 'Not enough Embershards' : `You need ${rc.ingots - ingots} more Iron Ingot${rc.ingots - ingots > 1 ? 's' : ''}`, typeStyle('caption', C.danger, 190)).setOrigin(0, 0.5));
  // quick gem: the next empty socket (the Sockets tab picks the socket)
  const n = socketCount(it), gems = ch.inventory.filter((x) => GEMS[x.base]);
  const full = n > 0 && socketsOf(it).every(Boolean);
  root.add(hud.add.text(LEFT, 452, !n ? 'No socket (ember-touched or finer gear only)' : full ? 'Set a gem in socket 1 (its gem is lost) · Sockets tab to choose:' : 'Set a gem in the next empty socket:', typeStyle('body', n ? C.text : C.text500)));
  if (n) gems.slice(0, 8).forEach((g, i) => {
    const cost = socketCost(it, g.base)!, ok = ch.gold >= cost;
    cell(ctx, LEFT + i * STEP, 480, g.base, { badge: { text: String(cost), ok }, badgeBelow: true, dim: !ok, qty: g.qty, tip: gemTip(g.base, cost), onClick: () => { if (ok) ctx.act('socket', { shop, uid: it.uid, gem: g.base }); } });
  });
  if (n && !gems.length) root.add(hud.add.text(LEFT, 484, 'You carry no gems (Pell sells them).', typeStyle('caption', C.text500)));
}

export function bodySockets(ctx: ForgeCtx, it: ItemInstance): void {
  const { hud, root, ch, shop, st } = ctx;
  const n = socketCount(it);
  if (!n) { root.add(hud.add.text(LEFT, 380, 'No sockets. Ember-touched and runed gear has 1, wrought 2, sparkforged 3.', typeStyle('body', C.text500, 512))); return; }
  const cur = socketsOf(it);
  const at = st.socket >= 0 && st.socket < n ? st.socket : Math.max(0, cur.indexOf(null));
  root.add(hud.add.text(LEFT, 372, 'Sockets: pick one, then click a gem to set it there', typeStyle('body', C.text)));
  cur.forEach((g, i) => {
    const x = LEFT + i * 88;
    cell(ctx, x, 396, g, {
      selected: i === at,
      tip: () => g ? [{ text: `Socket ${i + 1}: ${itemInfo(g)?.name}`, color: 'gold', size: 'b' }, { text: GEMS[g]?.label ?? '', color: 'good', size: 's' }, { text: 'A new gem replaces it (the old one is lost).', color: 'dim', size: 's' }]
        : [{ text: `Socket ${i + 1}: empty`, color: 'dim', size: 'b' }],
      onClick: () => { st.socket = i; ctx.redraw(); },
    });
    root.add(hud.add.text(x + 28, 456, `${i + 1}`, typeStyle('badge', i === at ? C.gold : C.text500)).setOrigin(0.5, 0));
  });
  const gems = ch.inventory.filter((x) => GEMS[x.base]);
  const cost = socketCost(it, 'i_ruby')!;
  root.add(hud.add.text(LEFT, 478, `Your gems · ${cost} Embershards to set one in socket ${at + 1}${cur[at] ? ' (its gem is lost)' : ''}`, typeStyle('body', C.text)));
  gems.slice(0, 8).forEach((g, i) => {
    const c = socketCost(it, g.base)!, ok = ch.gold >= c;
    cell(ctx, LEFT + i * STEP, 504, g.base, { badge: { text: String(c), ok }, badgeBelow: true, dim: !ok, qty: g.qty, tip: gemTip(g.base, c), onClick: () => { if (ok) ctx.act('socket', { shop, uid: it.uid, gem: g.base, socket: at }); } });
  });
  if (!gems.length) root.add(hud.add.text(LEFT, 508, 'You carry no gems (Pell sells them).', typeStyle('caption', C.text500)));
}

export function bodyUpgrade(ctx: ForgeCtx, it: ItemInstance): void {
  const { hud, root, ch, shop } = ctx;
  const up = upgradeOf(it), uc = upgradeCost(it), ingots = have(ch, INGOT);
  root.add(hud.add.text(LEFT, 372, 'Upgrade', typeStyle('h3', C.text)));
  for (let i = 0; i < MAX_UPGRADE; i++) root.add(hud.add.rectangle(LEFT + 110 + i * 22, 384, 12, 12, i < up ? 0xffd23f : 0x2c3868).setAngle(45).setStrokeStyle(2, 0x1a1230));
  root.add(hud.add.text(LEFT + 110 + MAX_UPGRADE * 22, 376, `+${up} / ${MAX_UPGRADE}`, typeStyle('body', C.gold)));
  root.add(hud.add.text(LEFT, 404, 'Each level adds 8% to its base stats and 6% to its bonus lines.', typeStyle('body', C.text300, 512)));
  const ok = !!uc && ch.gold >= uc.gold && ingots >= uc.ingots;
  root.add(new HCButton(hud, 226, 470, uc ? `Upgrade to +${uc.to}` : `Fully upgraded (+${MAX_UPGRADE})`, () => ctx.act('upgrade', { shop, uid: it.uid }),
    { w: 300, disabled: !ok, sub: uc ? `${uc.gold} Embershards · ${plural(uc.ingots, 'Iron Ingot')}` : undefined }));
  if (uc && !ok) root.add(hud.add.text(LEFT, 506, ingots < uc.ingots ? `You need ${uc.ingots - ingots} more Iron Ingot${uc.ingots - ingots > 1 ? 's' : ''} (salvage gear for them).` : 'Not enough Embershards.', typeStyle('caption', C.danger)));
}

export function bodySalvage(ctx: ForgeCtx, it: ItemInstance, worn: boolean): void {
  const { hud, root, shop, st } = ctx;
  const y = salvageYield(it), dust = dustYield(it);
  if (!y) { root.add(hud.add.text(LEFT, 380, 'The smith won’t break that (legendaries, story gifts and quest items).', typeStyle('body', C.text500, 512))); return; }
  root.add(hud.add.text(LEFT, 372, 'Breaking it gives:', typeStyle('body', C.text)));
  const gives = [plural(y.ingots, 'Iron Ingot'), ...y.gems.map((g) => `${itemInfo(g)?.name ?? g} (back from its socket)`), ...(dust ? [`${dust} Rune Dust`] : [])];
  gives.forEach((g, i) => root.add(hud.add.text(LEFT + 12, 396 + i * 20, `+ ${g}`, typeStyle('body', C.good))));
  root.add(new HCButton(hud, 226, 400 + gives.length * 20 + 40, worn ? 'Take it off to salvage' : 'Salvage', () => { st.sel = null; ctx.act('salvage', { shop, uid: it.uid }); },
    { w: 300, variant: 'secondary', disabled: worn, sub: worn ? undefined : 'The piece is destroyed' }));
}
