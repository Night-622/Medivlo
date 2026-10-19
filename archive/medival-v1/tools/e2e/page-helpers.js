/* eslint-disable */
// Injected into the game page (DEV build) by tools/e2e/*.mjs. Defines window.__e2e: read-only snapshots of
// the live game plus small lookups. All *actions* go through real input (CDP) or Claude 2's __world travel API.
(async () => {
  const core = await import('/src/core/index.ts');
  const quests = await import('/src/narrative/quests.ts');
  const narrative = await import('/src/narrative/index.ts');
  const { Game, Registry } = core;
  const TILE = core.TILE_SIZE;

  // ── where things live: object/landmark id → { instance, floor, at } ─────────────────────────────
  const where = new Map();
  const overlayOwner = new Map(); // overlay id → { instance, floor }
  for (const inst of Registry.extraAll('instance')) {
    for (const f of inst.floors ?? []) {
      overlayOwner.set(f.overlay, { instance: inst.id, floor: f.id });
      for (const l of f.landmarks ?? []) where.set(l.id, { instance: inst.id, floor: f.id, at: l.at });
    }
  }
  for (const o of Registry.extraAll('overlay')) {
    const own = overlayOwner.get(o.id) ?? { instance: 'overworld', floor: undefined };
    const objs = [...(o.objects ?? []), ...(o.variants ?? []).flatMap((v) => v.objects ?? [])];
    for (const ob of objs) {
      const at = own.instance === 'overworld' ? [ob.at[0] + (o.origin?.[0] ?? 0), ob.at[1] + (o.origin?.[1] ?? 0)] : ob.at;
      if (!where.has(ob.id)) where.set(ob.id, { ...own, at, kind: ob.kind, props: ob.props ?? {} });
    }
  }
  for (const r of Registry.all('region')) for (const l of r.landmarks ?? []) if (!where.has(l.id)) where.set(l.id, { instance: l.instance ?? 'overworld', floor: undefined, at: l.at });

  /** doors on a given (instance, floor) */
  function doorsOn(instance, floor) {
    const out = [];
    for (const [id, w] of where) {
      if (w.kind !== 'door') continue;
      if (w.instance !== instance) continue;
      if (instance !== 'overworld' && w.floor !== floor) continue;
      out.push({ id, ...w });
    }
    return out;
  }

  /** next door to use to travel from the current location toward {instance, floor} (null = already there) */
  function nextDoor(target) {
    const loc = Game.state.world.location;
    const cur = { instance: loc.instance, floor: loc.floor };
    if (cur.instance === target.instance && (target.instance === 'overworld' || !target.floor || cur.floor === target.floor)) return null;
    if (cur.instance !== 'overworld' && cur.instance !== target.instance) {
      // leave this instance (via another floor if this floor has no exit)
      const exit = doorsOn(cur.instance, cur.floor).find((d) => d.props.target === 'overworld');
      if (exit) return exit.id;
      const up = doorsOn(cur.instance, cur.floor).find((d) => d.props.target === cur.instance);
      return up?.id ?? null;
    }
    if (cur.instance === 'overworld') {
      const door = doorsOn('overworld').find((d) => d.props.target === target.instance);
      return door?.id ?? null;
    }
    // same instance, other floor: prefer a direct stair, else any stair (floors are a chain)
    const stairs = doorsOn(cur.instance, cur.floor).filter((d) => d.props.target === cur.instance);
    const direct = stairs.find((d) => d.props.floor === target.floor);
    if (direct) return direct.id;
    const order = (Registry.extra('instance', cur.instance)?.floors ?? []).map((f) => f.id);
    const want = order.indexOf(target.floor), here = order.indexOf(cur.floor);
    return (stairs.find((d) => (order.indexOf(d.props.floor) - here) * (want - here) > 0) ?? stairs[0])?.id ?? null;
  }

  // ── UI lookup: centre of the clickable thing labelled `label` in a scene ──────────────────────
  function walk(list, out) { for (const o of list) { out.push(o); if (o.list) walk(o.list, out); } return out; }
  function findClickable(sceneKey, label, exact = true) {
    const game = window.__game;
    const scene = game.scene.getScene(sceneKey);
    if (!scene) return null;
    const all = walk(scene.children.list, []);
    const texts = all.filter((o) => o.type === 'Text' && o.visible && (exact ? o.text === label : o.text.includes(label)));
    for (const t of texts) {
      const parent = t.parentContainer;
      let target = parent?.input ? parent : parent?.list?.find((c) => c.input && c !== t) ?? (t.input ? t : null);
      target = target ?? t;
      const b = target.getBounds();
      return { x: Math.round(b.centerX), y: Math.round(b.centerY) };
    }
    return null;
  }

  function activeSceneKey() {
    const s = window.__game.scene.getScenes(true).map((x) => x.sys.settings.key);
    return s.includes('World') ? 'World' : s[0];
  }

  // ── snapshot for the bot ───────────────────────────────────────────────────────────────────────
  function snap() {
    const scene = activeSceneKey();
    const out = { scene, t: Date.now() };
    if (!Game.hasState) return out;
    const gs = Game.state;
    out.flags = gs.flags;
    out.loc = { ...gs.world.location };
    const v = narrative.dialogue.view();
    out.dlg = v ? { id: v.dialogueId, text: v.text.slice(0, 120), speaker: v.speakerName, choices: v.choices.map((c) => ({ i: c.index, text: c.text, enabled: c.enabled, tag: c.tag ?? null, chip: c.chip ?? null })) } : null;
    // quest focus: active prologue main quests first, then side
    const act = quests.activeQuests().filter((q) => q.act === 'prologue');
    act.sort((a, b) => (a.type === 'main' ? 0 : 1) - (b.type === 'main' ? 0 : 1));
    out.quests = act.map((q) => {
      const st = quests.currentStage(q);
      return {
        id: q.id, type: q.type, stage: st?.id,
        objectives: (st?.objectives ?? []).filter((o) => !o.optional && !quests.objectiveDone(q, o)).map((o) => {
          const kind = ['talk', 'kill', 'collect', 'reach', 'interact', 'when'].find((k) => k in o);
          return { id: o.id, kind, target: o[kind], count: quests.objectiveCount(q, o), need: quests.objectiveTarget(o), marker: o.marker?.landmark ?? null, text: o.text };
        }),
      };
    });
    const c = window.__combat;
    if (c && scene === 'World') {
      const { rt, player, scene: ws } = c;
      const cam = ws.cameras.main;
      const sx = (x) => Math.round((x - cam.worldView.x) * cam.zoom), sy = (y) => Math.round((y - cam.worldView.y) * cam.zoom);
      out.player = {
        x: Math.round(player.x), y: Math.round(player.y), sx: sx(player.x), sy: sy(player.y - 12), hp: Math.round(player.hp), maxHp: player.maxHp,
        mana: Math.round(player.mana), stamina: Math.round(player.stamina), alive: player.alive, level: player.level, cls: gs.player.progression.classId,
        draught: gs.player.inventory.draught.charges, resource: player.resource, inCombat: player.inCombat,
      };
      out.enemies = rt.enemies.filter((e) => e.alive).map((e) => ({
        id: e.def.id, x: Math.round(e.x), y: Math.round(e.y), sx: sx(e.x), sy: sy(e.y - e.radius), r: e.radius,
        d: Math.round(Math.hypot(e.x - player.x, e.y - player.y)), hp: Math.round(e.hp), max: e.maxHp, state: e.state,
        boss: e.isBoss, subdued: e.subdued,
        atk: e.attack ? { id: e.attack.def.id, kind: e.attack.def.kind, phase: e.attack.phase, frac: Math.min(1, (rt.now - e.attack.t0) / (e.attack.def.windupMs / e.attack.speed)),
          range: e.attack.def.rangePx, radius: e.attack.def.radius ?? 0, unblockable: !!e.attack.def.unblockable, tx: Math.round(e.attack.tx), ty: Math.round(e.attack.ty), dir: e.attack.dir } : null,
      })).sort((a, b) => a.d - b.d);
      out.panels = rt.paused ? [...rt.pauses] : [];
    }
    return out;
  }

  function locate(id) { const w = where.get(id); return w ? { instance: w.instance, floor: w.floor, at: w.at, kind: w.kind ?? null } : null; }
  function npcLandmark(npc) { return narrative.npcLandmark(npc) ?? null; }
  function npcsAt(lm) { return narrative.npcsAt(lm).map((n) => n.id); }
  function objectsNear(id, radius = 10) {
    const w = where.get(id);
    if (!w) return [];
    return [...where.entries()].filter(([oid, o]) => o.kind && o.kind !== 'door' && o.kind !== 'npc-anchor' && o.instance === w.instance && o.floor === w.floor
      && Math.hypot(o.at[0] - w.at[0], o.at[1] - w.at[1]) <= radius).map(([oid]) => oid);
  }
  function matchingObjects(prefix) { return [...where.keys()].filter((k) => (prefix.endsWith('*') ? k.startsWith(prefix.slice(0, -1)) : k === prefix)); }
  function zonesFor(enemyId) {
    const tables = Registry.extraAll('spawn').filter((t) => t.entries.some((e) => e.enemy === enemyId)).map((t) => t.id);
    const out = [];
    for (const r of Registry.all('region')) for (const z of r.spawnZones ?? []) if (tables.includes(z.table)) out.push({ instance: 'overworld', floor: undefined, at: [z.area.x + Math.floor(z.area.w / 2), z.area.y + Math.floor(z.area.h / 2)], zone: z.id });
    for (const inst of Registry.extraAll('instance')) for (const f of inst.floors ?? []) for (const z of f.spawnZones ?? []) if (tables.includes(z.table)) out.push({ instance: inst.id, floor: f.id, at: [z.area.x + Math.floor(z.area.w / 2), z.area.y + Math.floor(z.area.h / 2)], zone: z.id });
    return out;
  }

  /** next waypoint (world px) from the player toward (x, y): straight if clear, else via A* */
  function nav(x, y) {
    const w = core.Services.tryGet('world');
    const p = window.__combat?.player;
    if (!w || !p) return { x, y, direct: true };
    if (!w.raycast(p.x, p.y, x, y, core.Collision.SOLID | core.Collision.WATER).hit) return { x, y, direct: true };
    const path = w.findPath([Math.floor(p.x / TILE), Math.floor(p.y / TILE)], [Math.floor(x / TILE), Math.floor(y / TILE)], 4000);
    if (!path || path.length < 2) return { x, y, direct: true, nopath: true };
    const k = Math.min(path.length - 1, 2);
    return { x: path[k][0] * TILE + TILE / 2, y: path[k][1] * TILE + TILE / 2, direct: false };
  }

  window.__e2e = { snap, nav, locate, nextDoor, npcLandmark, npcsAt, objectsNear, matchingObjects, zonesFor, findClickable, TILE, ready: true };
})();
