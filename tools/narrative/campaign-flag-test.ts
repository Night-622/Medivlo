/** campaign.class / campaign.school are derived on game:new and game:loaded, including for old saves (Claude 4). */
import { Game, bus, createNewGameState, getFlag } from '@/core';
import { installNarrativeAuthority } from '@/narrative/engine';

installNarrativeAuthority();
let bad = 0;
const ok = (c: boolean, m: string) => { console.log(`${c ? 'ok  ' : 'FAIL'} ${m}`); if (!c) bad++; };
const hero = (cls: string) => ({ classId: cls, look: { skin: 0, hair: 0, hc: 0, eyes: 0, brows: 0, ec: 0, mouth: 0, mark: 0, body: 0 }, outfit: { dye: 0, headw: 0, cape: 0, neck: 0, face: 0, extra: 0 } });

Game.set(createNewGameState());
Game.state.player.hero = hero('warden') as never;
Game.set(Game.state);
bus.emit('game:new', {} as never);
ok(getFlag('campaign.class') === 'warden' && getFlag('campaign.school') === 'rime', `new game: ${getFlag('campaign.class')} / ${getFlag('campaign.school')}`);

// an old save: no campaign flags at all, loaded
const old = createNewGameState();
old.player.hero = hero('jester') as never;
Game.set(old);
bus.emit('game:loaded', {} as never);
ok(getFlag('campaign.class') === 'jester' && getFlag('campaign.school') === 'guile', `old save on load: ${getFlag('campaign.class')} / ${getFlag('campaign.school')}`);
console.log(bad ? `${bad} FAILED` : 'ALL PASS');
