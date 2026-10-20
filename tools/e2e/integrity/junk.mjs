/**
 * Malformed client messages for the fuzzers (integrity-realm-fuzz.mjs, integrity-host-fuzz.mjs). Owner: Claude 6.
 * makeJunk(seed, honestId) → { message() (an object), raw() (wire text: JSON, garbage, deep nesting, 63 KB) },
 * deterministic per seed. honestId is a real player id, so some junk aims at a real target.
 */
export function makeJunk(seed0, honestId = 'uid-honest') {
  let seed = seed0 >>> 0;
  const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 2 ** 32; };
  const pick = (a) => a[Math.floor(rnd() * a.length)];
  const junkNum = () => pick([0, -1, 1e308, -1e308, 2 ** 53, 0.5, -0.0001, 1e-320, 'NaN', 'Infinity', null, '1', [], {}]);
  const junkStr = () => pick(['', 'x', `p:${honestId}`, honestId, 'e:test', 'w_sword_wood', 'i_hp_s', 'ws:rime-capital', 'x'.repeat(60_000), '\u0000￿', '__proto__', 'constructor', 42, null, [], {}]);
  // huge arrays hold small values: an array of 60 KB strings stringified to hundreds of MB and made the fuzz crawl
  const junk = (d = 0) => (d > 2 ? junkNum() : pick([junkNum, junkStr, () => (d === 0 && rnd() < 0.3 ? Array.from({ length: 5000 }, junkNum) : Array.from({ length: pick([0, 3]) }, () => junk(d + 1))), () => ({ a: junk(d + 1), __proto__: junk(d + 1), uid: junkStr(), x: junkNum() })])());
  const ACTIONS = ['buy', 'sell', 'travel', 'respawn', 'rune', 'upgrade', 'reroll', 'imbue', 'transfer', 'craft', 'salvage', 'equip', 'unequip', 'use', 'drop', 'pickup', 'dialogue-close', 'hazard', 'revive', 'door', 'waystone', 'nonsense'];
  const TYPES = ['input', 'vote', 'chat', 'hello', 'bye', 'loadout', 'duel', 'dialogue:continue', 'interact', 'act', 'state:request', 'snapshot', 'welcome', '__proto__', 'x'];
  function message() {
    const t = pick(TYPES);
    const m = { type: t };
    switch (t) {
      case 'input': m.frames = pick([junk(), Array.from({ length: pick([1, 60, 3000]) }, () => ({ seq: junkNum(), t: junkNum(), move: { x: junkNum(), y: junkNum() }, aim: pick([junk(), { x: junkNum(), y: junkNum() }]), buttons: junkNum(), target: pick(['', 'e:test', 'x'.repeat(200), null, 7]) }))]); break;
      case 'act': m.domain = pick(['world', 'systems', 'narrative', junkStr()]); m.action = pick([...ACTIONS, junkStr()]); m.args = pick([junk(), { uid: junkStr(), spell: junkStr(), rune: junkStr(), remove: pick([true, 'false', 1]), affix: junkNum(), school: junkStr(), from: junkStr(), qty: junkNum(), npc: junkStr(), id: junkStr(), x: junkNum(), y: junkNum() }, undefined]); break;
      case 'loadout': m.data = pick([junk(), { classId: junkStr(), level: junkNum(), gold: junkNum(), inventory: junk(), equipment: junk(), tree: junk(), hotbar: junk(), runes: junk() }]); break;
      case 'vote': m.voteId = junkStr(); m.choice = junkNum(); break;
      case 'chat': m.text = junkStr(); break;
      case 'duel': m.target = junkStr(); m.accept = pick([true, false, junkNum()]); break;
      case 'dialogue:continue': m.sessionId = junkStr(); break;
      case 'interact': m.target = junkStr(); break;
      default: Object.assign(m, { payload: junk(), playerId: junkStr() });
    }
    return m;
  }
  function raw() {
    const r = rnd();
    if (r < 0.05) return 'not json {{';
    if (r < 0.08) return '['.repeat(5000) + ']'.repeat(5000); // deep nesting
    if (r < 0.10) return JSON.stringify({ type: 'act', domain: 'systems', action: 'buy', args: JSON.parse('{"a":' + '{"a":'.repeat(800) + '1' + '}'.repeat(800) + '}') });
    if (r < 0.12) return 'x'.repeat(63_000);
    let s;
    try { s = JSON.stringify(message()); } catch { return "x".repeat(2000); } // too big to even encode: the 64 KB frame cap stops it anyway
    return s.length > 64_000 ? s.slice(0, 64_000) : s;
  }


  return { message, raw, rnd };
}
