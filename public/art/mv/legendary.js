/* Medival — legendary boss drops: one unique item per boss (25). Load after gear.js + bestiary.js (+ realms.js). */
(function __mvboot(){const R=typeof window!=='undefined'?window:globalThis,MV=R.MV;if(!(MV&&MV.GEAR&&MV.BESTIARY&&MV.BESTIARY.length>60)){setTimeout(__mvboot,40);return}
const {G,outline}=MV,GR=MV.GEAR,ICONS=MV.ICONS;
const BASES=['w_sword_spark','w_axe_ember','w_staff_rime','w_bow_storm','w_mace_umbral','w_spear_spark','w_dagger_umbral','w_wand_storm','i_moonpend','i_sunpend','i_emberring','i_tear'];
const NOUN={sword:'Blade',axe:'Cleaver',staff:'Staff',bow:'Bow',mace:'Maul',spear:'Lance',dagger:'Fang',wand:'Wand',moonpend:'Pendant',sunpend:'Sigil',emberring:'Ring',tear:'Tear'};
const FX=['Every third hit releases a shockwave of the boss\u2019s element.','Kills restore 10% health and Ember.','Your ultimate recharges 30% faster.','You are immune to the boss\u2019s signature effect.','Critical hits summon a spectral echo of the boss for 3s.','Deal 25% more damage to bosses and mini-bosses.'];
const LG=[];MV.BESTIARY.filter(b=>b.tier==='boss').forEach((b,i)=>{const base=BASES[i%BASES.length],kind=base.split('_')[1]||'tear',id='lg_'+b.id.slice(3);
  const short=b.name.split(',')[0].replace(/^The /,'').trim().split(' ').pop();
  ICONS[id]={w:32,h:32,tile:1,fn:g=>{const f=MV.frames(base);if(!f)return;g.img(f[0]);const col=['#ffd23f','#ff4a4a','#ffffff'];[[3,4],[28,3],[27,27],[4,28],[16,1],[30,16]].forEach(([x,y],k)=>{g.p(x,y,col[k%3]);if(k%2){g.p(x-1,y,col[0]);g.p(x+1,y,col[0]);g.p(x,y-1,col[0]);g.p(x,y+1,col[0])}})}};
  LG.push({id,name:short+'\u2019s '+NOUN[kind],boss:b.id,bossName:b.name,region:b.region,icon:id,rar:'spark',slot:kind.match(/pend|ring|tear/)?(kind==='emberring'?'ring':'amulet'):'main',fx:FX[i%FX.length],lore:'Dropped only by '+b.name+'. '+(b.ab&&b.ab[0]?b.ab[0].replace(/^Phase 1: /,''):''),val:2500+i*150})});
MV.LEGENDARY=LG;
if(R.dispatchEvent&&typeof CustomEvent!=='undefined')R.dispatchEvent(new CustomEvent('mvready',{detail:'legendary.js'}));})();
