// Shared real-input bot for the e2e harnesses (dialogue, combat, objectives).
import { sleep } from './cdp.mjs';

export /** `when` objectives: how a player satisfies the flag (talk to someone or use something). */
const WHEN_HINTS = {
  'prologue.hale_outcome': [{ talk: 'npc:garrick-hale' }],
  'prologue.strongbox_opened': [{ interact: 'obj:oswin-strongbox' }],
  'prologue.oswin_fate': [{ talk: 'npc:oswin' }],
  'prologue.sluice_turned': [{ interact: 'obj:giants-sluice-wheel' }],
  'prologue.tobin_fate': [{ interact: 'obj:bound-tobin' }],
  'prologue.ember_claimed': [{ interact: 'obj:fallen-ember' }],
  'prologue.stag_fate': [{ fight: 'enemy:hollowed-white-stag', at: 'landmark:weeping-stones' }],
};


export class Bot {
  constructor(b, cls, report, say) {
    Object.assign(this, { b, cls, report, say });
    this.tried = new Map(); // dialogue choice memory: `${dlg}|${text}` → Set(choice index)
    this.lastProgress = Date.now();
    this.progressSig = '';
    this.lastAbility = 0;
    this.attempt = new Map(); // objective key → attempts
    this.lastDeath = false;
  }

  async snap() { return this.b.eval('window.__e2e.snap()'); }

  async play(budgetMs) {
    const end = Date.now() + budgetMs;
    while (Date.now() < end) {
      const s = await this.snap().catch((e) => { this.errOnce(`snap: ${e.message}`); return null; });
      if (!s || s.scene !== 'World' || !s.player) { await sleep(400); continue; }
      if (s.flags['prologue.complete']) { this.say('prologue.complete ✓'); this.report.steps.push('prologue.complete'); return true; }
      this.trackProgress(s);
      if (Date.now() - this.lastProgress > 240_000) {
        this.report.bugs.push(`stuck 4 min at ${JSON.stringify(s.quests.map((q) => [q.id, q.stage, q.objectives.map((o) => `${o.kind}:${JSON.stringify(o.target)}`)]))} loc=${JSON.stringify(s.loc)} level=${s.player.level}`);
        return false;
      }
      if (!s.player.alive) { if (!this.lastDeath) { this.report.deaths++; this.say(`died (${this.report.deaths})`); } this.lastDeath = true; await sleep(800); continue; }
      this.lastDeath = false;
      if (s.panels.length && !s.dlg) { await this.b.press('Escape'); await sleep(200); continue; }
      try {
        if (s.dlg) { await this.dialogue(s); continue; }
        const foe = this.pickFoe(s);
        if (foe) { await this.fight(s, foe); continue; }
        await this.objective(s);
      } catch (e) { this.errOnce(`tick: ${e.message}`); await sleep(500); }
    }
    this.report.bugs.push('time budget exhausted');
    return false;
  }

  trackProgress(s) {
    const sig = JSON.stringify([s.quests.map((q) => [q.id, q.stage, q.objectives.map((o) => o.count)]), Object.keys(s.flags).length]);
    if (sig !== this.progressSig) {
      if (this.progressSig) this.say(`progress: ${s.quests.map((q) => `${q.id.slice(6)}/${q.stage}`).join(', ') || '(no active prologue quests)'}`);
      this.progressSig = sig;
      this.lastProgress = Date.now();
      this.report.steps.push(`${Math.round((Date.now() - this.report.t0Ms) / 1000) || 0}s ${s.quests.map((q) => `${q.id}:${q.stage}`).join(' ')}`);
    }
  }

  // ── dialogue: real key presses; prefer untried choices so loops terminate ──
  async dialogue(s) {
    const d = s.dlg;
    if (!d.choices.length) { await this.b.press('Space'); await sleep(250); return; }
    const key = `${d.id}|${d.text}`;
    const tried = this.tried.get(key) ?? new Set();
    const enabled = d.choices.filter((c) => c.enabled);
    const leave = (c) => /\b(leave|goodbye|farewell|later|not now|nothing)\b/i.test(c.text) || c.tag === 'end' || c.tag === 'leave';
    const pick = enabled.find((c) => !tried.has(c.i) && !leave(c)) ?? enabled.find((c) => !tried.has(c.i)) ?? enabled.find(leave) ?? enabled[0] ?? d.choices[0];
    tried.add(pick.i);
    this.tried.set(key, tried);
    const nth = d.choices.indexOf(pick) + 1;
    if (nth >= 1 && nth <= 9) await this.b.press(`Digit${nth}`);
    await sleep(300);
  }

  // ── combat ──
  pickFoe(s) {
    const hostile = s.enemies.filter((e) => (e.state === 'engage' || e.state === 'alert' || e.subdued) && e.d < 520);
    return hostile[0] ?? null;
  }

  async moveToward(s, tx, ty, ms = 160, away = false) {
    if (!away) { const wp = await this.b.eval(`window.__e2e.nav(${tx}, ${ty})`); tx = wp.x; ty = wp.y; }
    const dx = (tx - s.player.x) * (away ? -1 : 1), dy = (ty - s.player.y) * (away ? -1 : 1);
    const keys = [];
    if (dx > 12) keys.push('KeyD'); else if (dx < -12) keys.push('KeyA');
    if (dy > 12) keys.push('KeyS'); else if (dy < -12) keys.push('KeyW');
    if (keys.length) await this.b.hold(keys, ms);
  }

  /** the most urgent incoming attack, if any */
  threat(s) {
    const p = s.player;
    for (const e of s.enemies) {
      const a = e.atk;
      if (!a || a.phase !== 'windup') continue;
      const canBlock = this.cls === 'warden' && !a.unblockable;
      if (a.kind === 'charge' && e.d < a.range + 60) return { e, a, how: canBlock ? 'block' : 'side' };
      if (a.kind === 'area') {
        const cx = a.range > a.radius ? a.tx : e.x, cy = a.range > a.radius ? a.ty : e.y;
        if (Math.hypot(cx - p.x, cy - p.y) < a.radius + 28) return { e, a, how: canBlock && a.range <= a.radius ? 'block' : 'away', cx, cy };
      }
      if (a.kind === 'melee' && e.d < a.range + 30) return { e, a, how: a.unblockable ? 'away' : 'block' };
      if (a.kind === 'projectile' && e.d < a.range + 40 && a.frac > 0.55) return { e, a, how: canBlock ? 'block' : 'side' };
    }
    return null;
  }

  async dodge(s, dirX, dirY) {
    const keys = [];
    if (dirX > 0.3) keys.push('KeyD'); else if (dirX < -0.3) keys.push('KeyA');
    if (dirY > 0.3) keys.push('KeyS'); else if (dirY < -0.3) keys.push('KeyW');
    for (const k of keys) await this.b.keyDown(k);
    await this.b.press('Space', 40);
    await sleep(120);
    for (const k of keys) await this.b.keyUp(k);
    await sleep(200);
  }

  async setBlock(on, x, y) {
    if (on === !!this.blocking) return;
    this.blocking = on;
    if (on) await this.b.mouseDown(x, y, 'right'); else await this.b.mouseUp(x, y, 'right');
  }

  async fight(s, foe) {
    const p = s.player, b = this.b, now = Date.now();
    await b.mouseMove(foe.sx, foe.sy);
    if (foe.subdued) { // purge the kneeling boss
      await this.setBlock(false, foe.sx, foe.sy);
      if (foe.d > 90) await this.moveToward(s, foe.x, foe.y, 200);
      else { await b.press('KeyF'); this.say(`purge ${foe.id}`); await sleep(400); }
      return;
    }
    let t = this.threat(s);
    // react late, like a player: block/dodge only once the wind-up is mostly done; attack in between
    if (t && t.a.frac < (t.how === 'block' ? 0.45 : 0.3)) t = null;
    if (t && p.stamina > 20) {
      if (t.how === 'block' && this.cls === 'warden') { await this.setBlock(true, t.e.sx, t.e.sy); await sleep(120); return; }
      await this.setBlock(false, foe.sx, foe.sy);
      if (t.a.frac > 0.35) {
        const ax = t.how === 'away' ? p.x - (t.cx ?? t.e.x) : -(t.e.y - p.y), ay = t.how === 'away' ? p.y - (t.cy ?? t.e.y) : (t.e.x - p.x);
        const l = Math.hypot(ax, ay) || 1;
        await this.dodge(s, ax / l, ay / l);
        return;
      }
      await sleep(60);
      return;
    }
    await this.setBlock(false, foe.sx, foe.sy);
    if (p.hp < p.maxHp * 0.4 && p.draught > 0 && !(foe.d < 80 && foe.atk)) { await b.press('KeyR'); await sleep(250); return; }
    const kind = this.cls;
    if (kind === 'warden') {
      const reach = 48 + foe.r;
      if (foe.d > reach) { await this.moveToward(s, foe.x, foe.y, 140); return; }
      if (now - this.lastAbility > 6500 && p.stamina > 40) { this.lastAbility = now; await b.press('Digit1'); await sleep(150); return; }
      if (p.stamina > 15) { await b.click(foe.sx, foe.sy, 'left', 50); await sleep(220); } else await sleep(250);
    } else if (kind === 'ranger') {
      if (foe.d < 140) { await this.moveToward(s, foe.x, foe.y, 220, true); return; }
      if (foe.d > 420) { await this.moveToward(s, foe.x, foe.y, 160); return; }
      if (now - this.lastAbility > 8500 && p.stamina > 25) { this.lastAbility = now; await b.press('Digit1'); await sleep(250); return; }
      await b.mouseDown(foe.sx, foe.sy); await sleep(780);
      const s2 = await this.snap(); const f2 = s2.enemies?.[0] ?? foe;
      await b.mouseMove(f2.sx, f2.sy); await b.mouseUp(f2.sx, f2.sy); await sleep(100);
    } else {
      if (foe.d < 120) { await this.moveToward(s, foe.x, foe.y, 220, true); return; }
      if (foe.d > 380) { await this.moveToward(s, foe.x, foe.y, 160); return; }
      if (p.mana >= 12) { await b.press('Digit1'); await sleep(330); return; }
      await b.mouseDown(foe.sx, foe.sy); await sleep(450); await b.mouseUp(foe.sx, foe.sy); await sleep(60);
    }
  }

  // ── objectives ──
  async travelTo(locId) {
    // walk through doors until in the right instance/floor, then teleport next to the target
    for (let hop = 0; hop < 6; hop++) {
      const loc = await this.b.eval(`window.__e2e.locate(${JSON.stringify(locId)})`);
      if (!loc) return `unknown ${locId}`;
      const door = await this.b.eval(`window.__e2e.nextDoor(${JSON.stringify({ instance: loc.instance, floor: loc.floor })})`);
      if (!door) break;
      this.say(`door ${door} → ${locId}`);
      await this.b.eval(`window.__world.goto(${JSON.stringify(door)})`);
      await sleep(300);
      await this.b.press('KeyF');
      for (let i = 0; i < 30; i++) { await sleep(300); const s = await this.snap().catch(() => null); if (s?.scene === 'World' && s.player) break; }
      await sleep(600);
    }
    const r = await this.b.eval(`window.__world.goto(${JSON.stringify(locId)})`);
    await sleep(500);
    return r;
  }

  async useAt(id) {
    const r = await this.travelTo(id);
    await this.b.press('KeyF');
    await sleep(700);
    return r;
  }

  async talk(npc) {
    let r = await this.b.eval(`window.__world.gotoNpc(${JSON.stringify(npc)})`);
    if (/not shown/.test(r ?? '')) {
      const lm = await this.b.eval(`window.__e2e.npcLandmark(${JSON.stringify(npc)})`);
      if (lm) { await this.travelTo(lm); r = await this.b.eval(`window.__world.gotoNpc(${JSON.stringify(npc)})`); }
    }
    await sleep(300);
    await this.b.press('KeyF');
    await sleep(900);
    return r;
  }

  async objective(s) {
    await this.setBlock(false, 640, 360);
    const q = s.quests[0];
    if (!q) { await sleep(500); return; }
    const o = q.objectives[0];
    if (!o) { await sleep(400); return; }
    const key = `${q.id}/${q.stage}/${o.id}`;
    const n = (this.attempt.get(key) ?? 0) + 1;
    this.attempt.set(key, n);
    if (n === 1) this.say(`objective ${key}: ${o.kind} ${JSON.stringify(o.target)}`);
    switch (o.kind) {
      case 'talk': await this.talk(o.target); break;
      case 'reach': {
        const r = await this.travelTo(o.target);
        if (/unknown|no walkable/.test(r ?? '')) this.bugOnce(`reach ${o.target}: __world.goto → ${r}`);
        // walk a little so discovery/entered triggers fire
        await this.b.hold(['KeyW'], 300); await this.b.hold(['KeyS'], 300);
        break;
      }
      case 'interact': {
        const ids = await this.b.eval(`window.__e2e.matchingObjects(${JSON.stringify(o.target)})`);
        const used = this.used ??= new Set();
        const id = ids.find((x) => !used.has(x)) ?? ids[0];
        if (!id) { this.bugOnce(`interact ${o.target}: no such object in world data`); await sleep(2000); break; }
        used.add(id);
        await this.useAt(id);
        break;
      }
      case 'kill': {
        const near = s.enemies.find((e) => e.id === o.target);
        if (near) { await this.b.eval(`window.__world.tp(${Math.floor(near.x / 32)}, ${Math.floor(near.y / 32) + 3})`); await sleep(500); break; }
        if (o.marker) await this.travelTo(o.marker);
        else {
          const zones = await this.b.eval(`window.__e2e.zonesFor(${JSON.stringify(o.target)})`);
          const z = zones.find((x) => x.instance === s.loc.instance) ?? zones[0];
          if (z) {
            if (z.instance !== s.loc.instance || z.floor !== s.loc.floor) {
              const lms = await this.b.eval(`[...window.__e2e.matchingObjects('landmark:*')].filter(id => { const w = window.__e2e.locate(id); return w && w.instance === ${JSON.stringify(z.instance)} && w.floor === ${JSON.stringify(z.floor)}; })`);
              if (lms[0]) await this.travelTo(lms[0]);
            }
            await this.b.eval(`window.__world.tp(${z.at[0]}, ${z.at[1]})`);
          } else this.bugOnce(`kill ${o.target}: no spawn zone or marker`);
        }
        await sleep(1500);
        break;
      }
      case 'when': {
        const flag = o.target?.flag;
        const hints = WHEN_HINTS[flag];
        if (!hints) { this.bugOnce(`no harness hint for when-flag ${flag}`); await sleep(1000); break; }
        const h = hints[(n - 1) % hints.length];
        if (h.talk) await this.talk(h.talk);
        else if (h.interact) await this.useAt(h.interact);
        else if (h.fight) {
          const boss = s.enemies.find((e) => e.id === h.fight);
          if (boss) await this.b.eval(`window.__world.tp(${Math.floor(boss.x / 32)}, ${Math.floor(boss.y / 32) + 4})`);
          else await this.travelTo(h.at);
          await sleep(1500);
        }
        break;
      }
      case 'collect': this.bugOnce(`collect ${o.target}: not handled by harness`); await sleep(1000); break;
      default: await sleep(500);
    }
  }

  errOnce(msg) { this.errs ??= new Set(); if (!this.errs.has(msg)) { this.errs.add(msg); this.say(`ERR ${msg}`); this.report.bugs.push(`harness: ${msg}`); } }

  bugOnce(msg) {
    if (!this.report.bugs.includes(msg)) { this.report.bugs.push(msg); this.say(`BUG? ${msg}`); }
  }
}

