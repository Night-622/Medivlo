/* Medival — <mv-scene mode="combat|title" paused> : in-world renderer (stands in for the Phaser world layer). */
(function __mvboot(){const __root=typeof window!=='undefined'?window:globalThis;{const MV=__root.MV;if(!(MV&&MV.PROPS&&MV.PROPS.b_inn)){setTimeout(__mvboot,25);return}}
const MV=window.MV;if(!MV||customElements.get('mv-scene'))return;
const W=1280,H=720,TS=32;
const RAR=[['common','#e6e9f5',40],['fine','#5fe06a',28],['ember','#3fa9ff',17],['runed','#b766ff',9],['wrought','#ff9a2e',4.5],['spark','#ff4a4a',1.5]];
const LOOT=['icon_sword','icon_ring','icon_potion_red','icon_potion_ember','icon_boots','icon_dagger','icon_amulet','icon_helm','icon_coin'];
const NAMES={icon_sword:'Militia Blade',icon_ring:'Bellwether Ring',icon_potion_red:'Red Draught',icon_potion_ember:'Blue Ember Tonic',icon_boots:'Mirewalker Boots',icon_dagger:'Nightglass Dirk',icon_amulet:'Stag-Tear Locket',icon_helm:'Hollow Iron Helm',icon_coin:'Embershards'};
const SPELL={1:{n:'Ash Bolt',school:'ash',cost:6,cd:.35},2:{n:'Cinder Nova',school:'ash',cost:22,cd:4},3:{n:'Rime Shard',school:'rime',cost:10,cd:1.1},4:{n:'Kindle',school:'radiance',cost:15,cd:8}};
const SC={ash:['#ff6a2a','#ffd36a'],rime:['#7fe3ff','#e8fbff'],radiance:['#ffd96b','#fff6c8'],storm:['#ffe14a','#fffbd0']};
const isPath=(tx,ty)=>(ty>=13&&ty<=15)||(tx>=18&&tx<=21&&ty<=13)||((tx-19.5)**2+(ty-13.5)**2*1.6<18);
function buildGround(){const g=MV.G(W,H),R=MV.rng(42);const gr=['v_grass_0','v_grass_1','v_grass_2','v_grass_0','v_grass_3','v_flowers_0','v_grass_1','v_flowers_1'];const has=!!MV.PROPS.v_path_0;
  const c=(x,y)=>isPath(x,y)?1:0;
  for(let ty=0;ty<23;ty++)for(let tx=0;tx<40;tx++){const m=(c(tx,ty)<<3)|(c(tx+1,ty)<<2)|(c(tx,ty+1)<<1)|c(tx+1,ty+1);const n=has?(m?'v_path_'+m:gr[R()*gr.length|0]):(isPath(tx,ty)?'tile_path_a':'tile_grass_a');g.img(MV.frames(n)[0],tx*TS+16,ty*TS+16)}
  for(let tx=0;tx<41;tx++){g.img(MV.frames(has?gr[tx%8]:'tile_grass_a')[0],tx*TS-16,-16)}for(let ty=0;ty<24;ty++){g.img(MV.frames(has?gr[ty%8]:'tile_grass_a')[0],-16,ty*TS-16)}
  return g.c}
if(window.MV&&!MV.PROPS.b_inn)console.warn('tiles.js not loaded');
const PROPS=[['b_inn',150,128],['b_smithy',830,60],['b_house_stone',120,540],['b_chapel',960,470],['b_stall',730,290],['v_well',470,300],
 ['prop_tree',-14,-30],['prop_tree_b',330,-44],['prop_tree',1010,-60],['prop_tree_b',1190,70],['prop_tree',1210,300],['prop_tree_b',-24,330],['prop_tree',470,610],['prop_tree_b',1180,640],['prop_tree',760,630],
 ['v_hedge',300,240],['v_hedge',940,230],['v_flowerbed',250,680],['v_haystack',240,620],['v_barrels',320,250],['v_crates',970,180],['v_noticeboard',520,360],['v_waystone',360,590],['v_cart',880,600],['v_bench',820,380],['prop_rock',1100,250],['prop_rock',60,240],
 ['v_lamp',556,328],['v_lamp',712,328],['v_lamp',556,518],['v_lamp',712,518]];
PROPS.push(['odo',930,250],['wil',300,262],['godric',500,286],['pip',620,382],['aldous',1040,640],['corwin',250,640],['hobb',1150,560]);
PROPS.push(...[0,1,2,3,4].map(i=>['v_fence_h',40+i*32,404]),...[0,1,2,3].map(i=>['v_fence_h',880+i*32,404]));
class MvScene extends HTMLElement{
  static get observedAttributes(){return['mode','paused']}
  connectedCallback(){if(this._c)return;const c=this._c=document.createElement('canvas');c.width=W;c.height=H;c.style.cssText='display:block;width:100%;height:100%;image-rendering:pixelated;';this.appendChild(c);this.x=c.getContext('2d');this.x.imageSmoothingEnabled=false;
    this.ground=buildGround();this.props=PROPS.map(([n,x,y])=>{const f=MV.frames(n)[0];return{n,f,x,y,base:y+f.height-4}});
    this._reset();this._keys={};this._t0=performance.now();this._last=this._t0;this._idle=99;
    this._kd=e=>{if(this.mode!=='combat'||this.paused)return;const k=e.key.toLowerCase();if('wasd'.includes(k)&&k.length===1||k.startsWith('arrow')){this._keys[k]=1;this._idle=0}if('1234'.includes(k)&&k.length===1){this.cast(+k);this._idle=0}if(k===' '){this.dash();e.preventDefault()}};
    this._ku=e=>{this._keys[e.key.toLowerCase()]=0};
    this._md=e=>{if(this.mode!=='combat'||this.paused)return;const r=c.getBoundingClientRect();this._aim={x:(e.clientX-r.left)/r.width*W,y:(e.clientY-r.top)/r.height*H};this.cast(1);this._idle=0};
    window.addEventListener('keydown',this._kd);window.addEventListener('keyup',this._ku);c.addEventListener('mousedown',this._md);
    const loop=t=>{this._raf=requestAnimationFrame(loop);const dt=Math.min(.05,(t-this._last)/1000);this._last=t;if(!this.paused)this._update(dt,t/1000);this._render(t/1000)};this._raf=requestAnimationFrame(loop)}
  disconnectedCallback(){cancelAnimationFrame(this._raf);window.removeEventListener('keydown',this._kd);window.removeEventListener('keyup',this._ku);this._c&&this._c.remove();this._c=null}
  attributeChangedCallback(n,o,v){if(n==='paused')this.paused=v!==null&&v!=='false';if(n==='mode'){this.mode=v;if(this._c)this._reset()}}
  _reset(){this.mode=this.getAttribute('mode')||'combat';const P=this.p={x:640,y:468,hp:186,hpMax:240,ember:132,emberMax:160,st:100,stMax:100,xp:3120,xpMax:4400,face:1,moving:0,hurt:0,dash:0,cds:{1:0,2:0,3:0,4:0},kills:0,kindle:0};
    this.en=[];this.fx=[];this.nums=[];this.loot=[];this.proj=[];this._spawnT=.4;this._autoT=0;this._hudT=0;this._fireflies=Array.from({length:40},(_,i)=>({x:Math.random()*W,y:Math.random()*H,p:Math.random()*6}));
    if(this.mode==='title'){P.x=600;P.y=560;this.ally={x:690,y:556}}else{this.ally=null;for(let i=0;i<3;i++)this._spawn()}}
  _spawn(){const side=Math.random();const POOL=['wolf','wolf','hollowed','bx_slime','bx_crow','bx_bat','bx_bandit','bx_thornling','bx_skel','bx_direwolf','bx_cultist','bx_puffcap'];let kind=POOL[Math.random()*POOL.length|0];if(kind.indexOf('bx_')===0&&!(MV.frames(kind)))kind='wolf';let x,y;if(side<.4){x=-30;y=440+Math.random()*60}else if(side<.8){x=W+30;y=440+Math.random()*60}else{x=600+Math.random()*80;y=-30}
    this.en.push({kind,x,y,hp:kind==='wolf'?60:95,hpMax:kind==='wolf'?60:95,sp:kind==='wolf'?92:46,hit:0,kb:{x:0,y:0},atk:0,face:-1,slow:0,id:Math.random()})}
  _emit(type,detail){this.dispatchEvent(new CustomEvent(type,{detail,bubbles:true}))}
  dash(){const P=this.p;if(P.st<25||P.dash>0)return;P.st-=25;P.dash=.18;for(let i=0;i<10;i++)this.fx.push({k:'spark',x:P.x,y:P.y-10,vx:(Math.random()-.5)*80,vy:-Math.random()*60,life:.5,c:'#ffd36a'})}
  cast(n){const P=this.p,S=SPELL[n];if(!S||P.cds[n]>0||P.ember<S.cost||this.mode!=='combat')return false;P.ember-=S.cost;P.cds[n]=S.cd;this._castFlash=.12;
    const tgt=this._aim&&this._idle<.1?this._aim:this._nearest()||{x:P.x+P.face*100,y:P.y-12};this._aim=null;
    const ox=P.x+P.face*12,oy=P.y-20,a=Math.atan2(tgt.y-12-oy,tgt.x-ox);P.face=tgt.x<P.x?-1:1;
    if(n===1||n===3)this.proj.push({x:ox,y:oy,vx:Math.cos(a)*(n===1?440:360),vy:Math.sin(a)*(n===1?440:360),school:S.school,life:1.4,dmg:n===1?[16,26]:[12,18],slow:n===3,trail:0});
    if(n===2){this.fx.push({k:'ring',x:P.x,y:P.y-8,r:6,life:.45,max:.45,c:'#ff6a2a'});this.en.forEach(e=>{const d=Math.hypot(e.x-P.x,e.y-P.y);if(d<96)this._hit(e,30+Math.random()*12|0,'ash',(e.x-P.x)/d*220,(e.y-P.y)/d*220)});for(let i=0;i<28;i++){const b=i/28*6.28;this.fx.push({k:'spark',x:P.x,y:P.y-10,vx:Math.cos(b)*200,vy:Math.sin(b)*120,life:.5,c:i%2?'#ffd36a':'#ff6a2a'})}}
    if(n===4){P.kindle=3;this.fx.push({k:'ring',x:P.x,y:P.y-8,r:4,life:.5,max:.5,c:'#ffd96b'})}
    return true}
  _nearest(){let b=null,bd=1e9;this.en.forEach(e=>{const d=Math.hypot(e.x-this.p.x,e.y-this.p.y);if(d<bd&&e.x>-10&&e.x<W+10&&e.y>-10){bd=d;b=e}});return b&&bd<460?b:null}
  _hit(e,dmg,school,kx,ky){const crit=Math.random()<.18;if(crit)dmg=Math.round(dmg*1.8);e.hp-=dmg;e.hit=.12;e.kb={x:kx,y:ky};
    this.nums.push({x:e.x+(Math.random()-.5)*10,y:e.y-38,v:dmg,c:crit?'#ffd23f':SC[school][1],crit,life:.9,school});
    for(let i=0;i<6;i++)this.fx.push({k:'spark',x:e.x,y:e.y-14,vx:(Math.random()-.5)*160,vy:-Math.random()*120,life:.35,c:SC[school][0]});
    if(e.hp<=0){e.dead=1;this.p.kills++;this.p.xp+=e.kind==='wolf'?38:64;if(this.p.xp>=this.p.xpMax)this.p.xp-=this.p.xpMax;for(let i=0;i<16;i++)this.fx.push({k:'puff',x:e.x+(Math.random()-.5)*20,y:e.y-10+(Math.random()-.5)*14,vx:(Math.random()-.5)*60,vy:-20-Math.random()*40,life:.6,c:e.kind==='wolf'?'#8f9bd0':'#b84dff'});
      if(Math.random()<.7){let r=Math.random()*100,i=0;while(r>RAR[i][2]&&i<5){r-=RAR[i][2];i++}const icon=LOOT[Math.random()*LOOT.length|0];this.loot.push({x:e.x,y:e.y,vy:-160,z:0,icon,rar:RAR[i],t:0,f:MV.frames(icon)[0]})}}}
  _update(dt,t){const P=this.p;for(const k in P.cds)P.cds[k]=Math.max(0,P.cds[k]-dt);P.ember=Math.min(P.emberMax,P.ember+7*dt);P.st=Math.min(P.stMax,P.st+30*dt);P.hp=Math.min(P.hpMax,P.hp+(P.kindle>0?18:1)*dt);P.kindle=Math.max(0,P.kindle-dt);P.hurt=Math.max(0,P.hurt-dt);this._castFlash=Math.max(0,(this._castFlash||0)-dt);
    if(this.mode==='combat'){this._idle+=dt;const K=this._keys;let mx=(K.d||K.arrowright?1:0)-(K.a||K.arrowleft?1:0),my=(K.s||K.arrowdown?1:0)-(K.w||K.arrowup?1:0);
      if(this._idle>2.5&&this.getAttribute('autopilot')!=='false'){// autopilot demo
        const n=this._nearest();if(n){const d=Math.hypot(n.x-P.x,n.y-P.y);if(d<130){mx=(P.x-n.x)/d;my=(P.y-n.y)/d}else if(d>300){mx=(n.x-P.x)/d*.6;my=(n.y-P.y)/d*.6}this._autoT-=dt;if(this._autoT<=0){const close=this.en.filter(e=>Math.hypot(e.x-P.x,e.y-P.y)<90).length;if(close>=2&&this.cast(2));else if(Math.random()<.25)this.cast(3);else this.cast(1);this._autoT=.55}}
        else{mx=(640-P.x)/200;my=(468-P.y)/200;if(Math.abs(mx)<.05)mx=0;if(Math.abs(my)<.05)my=0}
        if(P.hp<P.hpMax*.45)this.cast(4)}
      const l=Math.hypot(mx,my);const sp=P.dash>0?380:120;P.dash=Math.max(0,P.dash-dt);if(l>0){P.x+=mx/Math.max(1,l)*sp*dt;P.y+=my/Math.max(1,l)*sp*dt;if(Math.abs(mx)>.1)P.face=mx<0?-1:1}P.moving=l>.05;
      P.x=Math.max(24,Math.min(W-24,P.x));P.y=Math.max(60,Math.min(H-20,P.y));
      this._spawnT-=dt;if(this._spawnT<=0&&this.en.length<5){this._spawn();this._spawnT=2.2+Math.random()*1.5}
      this.en.forEach(e=>{const dx=P.x-e.x,dy=P.y-e.y,d=Math.hypot(dx,dy)||1;e.slow=Math.max(0,e.slow-dt);const sp=e.sp*(e.slow>0?.45:1);e.hit=Math.max(0,e.hit-dt);e.atk=Math.max(0,e.atk-dt);
        if(d>26){e.x+=dx/d*sp*dt;e.y+=dy/d*sp*dt}else if(e.atk<=0){e.atk=1.1;const dm=e.kind==='wolf'?9+Math.random()*5|0:14+Math.random()*6|0;P.hp=Math.max(30,P.hp-dm);P.hurt=.2;this.nums.push({x:P.x,y:P.y-44,v:dm,c:'#ff4d5e',life:.8,player:1})}
        e.x+=e.kb.x*dt;e.y+=e.kb.y*dt;e.kb.x*=.86;e.kb.y*=.86;e.face=dx<0?-1:1;e.moving=d>26});
      this.en=this.en.filter(e=>!e.dead);
      this.proj.forEach(p=>{p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt;p.trail+=dt;if(p.trail>.02){p.trail=0;this.fx.push({k:'spark',x:p.x,y:p.y,vx:(Math.random()-.5)*30,vy:(Math.random()-.5)*30,life:.3,c:SC[p.school][Math.random()<.5?0:1]})}
        for(const e of this.en){if(Math.hypot(e.x-p.x,e.y-14-p.y)<16){const d=p.dmg[0]+Math.random()*(p.dmg[1]-p.dmg[0])|0;this._hit(e,d,p.school,p.vx*.35,p.vy*.35);if(p.slow)e.slow=2;p.life=0;this.fx.push({k:'ring',x:p.x,y:p.y,r:2,life:.22,max:.22,c:SC[p.school][0]});break}}});
      this.proj=this.proj.filter(p=>p.life>0&&p.x>-20&&p.x<W+20&&p.y>-20&&p.y<H+20);
      this.loot.forEach(L=>{L.t+=dt;if(L.z<0||L.vy<0){L.vy+=520*dt;L.z+=L.vy*dt;if(L.z>0){L.z=0;L.vy=L.vy>60?-L.vy*.35:0}}if(L.t>.6&&Math.hypot(L.x-P.x,L.y-P.y)<24){L.gone=1;this._emit('mvloot',{icon:L.icon,name:NAMES[L.icon],rarity:L.rar[0],color:L.rar[1]})}});
      this.loot=this.loot.filter(L=>!L.gone&&L.t<24);
    }
    this.fx.forEach(f=>{f.life-=dt;if(f.k==='ring')f.r+=(f.c==='#ff6a2a'?260:120)*dt;else{f.x+=f.vx*dt;f.y+=f.vy*dt;f.vx*=.92;f.vy=f.vy*.92+(f.k==='puff'?-10*dt:0)}});this.fx=this.fx.filter(f=>f.life>0);
    this.nums.forEach(n=>{n.life-=dt;n.y-=(n.life>.7?10:34)*dt});this.nums=this.nums.filter(n=>n.life>0);
    if(this.mode==='title'&&Math.random()<.5)this.fx.push({k:'spark',x:634+(Math.random()-.5)*14,y:540,vx:(Math.random()-.5)*20,vy:-40-Math.random()*50,life:1.2,c:Math.random()<.5?'#ffd36a':'#ff7a2a'});
    this._hudT-=dt;if(this._hudT<=0){this._hudT=.1;this._emit('mvhud',{hp:P.hp,hpMax:P.hpMax,ember:P.ember,emberMax:P.emberMax,st:P.st,stMax:P.stMax,xp:P.xp,xpMax:P.xpMax,cds:Object.assign({},P.cds),kills:P.kills,enemies:this.en.length,px:P.x,py:P.y,en:this.en.map(e=>[e.x,e.y])})}}
  _glow(x,y,r,c,a){const X=this.x,g=X.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,c);g.addColorStop(1,'rgba(0,0,0,0)');X.globalAlpha=a;X.fillStyle=g;X.fillRect(x-r,y-r,r*2,r*2);X.globalAlpha=1}
  _render(t){const X=this.x,P=this.p,title=this.mode==='title';X.globalCompositeOperation='source-over';X.drawImage(this.ground,0,0);
    const list=this.props.map(p=>({b:p.base,d:()=>X.drawImage(p.f,p.x,p.y)}));
    const shadow=(x,y,w)=>{X.fillStyle='rgba(20,12,48,.32)';X.beginPath();X.ellipse(Math.round(x),Math.round(y),w,w*.36,0,0,6.29);X.fill()};
    const drawChar=(name,x,y,face,moving,hit,ph)=>{let fr=MV.frames(name,moving?'walk':'idle');if(!fr){name='arcanist';fr=MV.frames(name,moving?'walk':'idle')}const i=moving?Math.floor(t*8+ph)%4:Math.floor(t*2.5+ph)%2;let f=fr[i];if(hit)f=MV.flash(f,hit===2?'#ff4d5e':'#ffffff');shadow(x,y,name==='wolf'?13:11);X.save();X.translate(Math.round(x),Math.round(y));if(face>0&&name==='wolf'||face<0&&name!=='wolf')X.scale(-1,1);X.drawImage(f,-Math.floor(f.width/2),-f.height+2);X.restore()};
    if(title){list.push({b:556,d:()=>drawChar('warden',this.ally.x,this.ally.y,-1,0,0,.5)});list.push({b:560,d:()=>drawChar('arcanist',P.x,P.y,1,0,0,0)});const cf=MV.frames('prop_campfire')[0];list.push({b:552,d:()=>{X.drawImage(cf,618,532);this._flame(634,544,t)}})}
    else{list.push({b:P.y,d:()=>drawChar(this.getAttribute('hero')||'arcanist',P.x,P.y,P.face,P.moving,P.hurt>0?2:this._castFlash>0?0:0,0)});
      this.en.forEach(e=>list.push({b:e.y,d:()=>{drawChar(e.kind,e.x,e.y,e.face,e.moving,e.hit>0?1:0,e.id*4);if(e.hp<e.hpMax){const bx=Math.round(e.x-12),by=Math.round(e.y-(e.kind==='wolf'?26:42));X.fillStyle='#1a1230';X.fillRect(bx-1,by-1,26,6);X.fillStyle='#3a0d26';X.fillRect(bx,by,24,4);X.fillStyle='#ff3d5a';X.fillRect(bx,by,Math.max(1,24*e.hp/e.hpMax|0),4);X.fillStyle='#ff8a9a';X.fillRect(bx,by,Math.max(1,24*e.hp/e.hpMax|0),1)}}}));
      this.loot.forEach(L=>list.push({b:L.y,d:()=>{const c=L.rar[1];X.globalCompositeOperation='lighter';X.globalAlpha=.35+.15*Math.sin(t*5);X.fillStyle=c;X.fillRect(L.x-3,L.y-60,6,60);X.globalAlpha=.18;X.fillRect(L.x-7,L.y-46,14,46);X.globalAlpha=1;X.globalCompositeOperation='source-over';shadow(L.x,L.y,9);const bob=L.z<0?L.z:-Math.abs(Math.sin(t*3+L.x))*4;const f=L.f;X.drawImage(f,Math.round(L.x-f.width/2),Math.round(L.y-f.height+bob-2));if(Math.floor(t*6+L.x)%5===0){X.fillStyle='#fff';X.fillRect(L.x+8,L.y-26+bob,1,3);X.fillRect(L.x+7,L.y-25+bob,3,1)}}}))}
    list.sort((a,b)=>a.b-b.b).forEach(o=>o.d());
    // projectiles
    this.proj.forEach(p=>{const c=SC[p.school];X.fillStyle=c[0];X.beginPath();X.arc(Math.round(p.x),Math.round(p.y),p.slow?4:5,0,6.29);X.fill();X.fillStyle=c[1];X.fillRect(Math.round(p.x)-2,Math.round(p.y)-2,4,4);X.fillStyle='#fff';X.fillRect(Math.round(p.x)-1,Math.round(p.y)-1,2,2)});
    this.fx.forEach(f=>{if(f.k==='ring'){X.strokeStyle=f.c;X.lineWidth=f.life/f.max*6+1;X.globalAlpha=Math.min(1,f.life/f.max*1.5);X.beginPath();X.ellipse(f.x,f.y,f.r,f.r*.6,0,0,6.29);X.stroke();X.globalAlpha=1}else{X.globalAlpha=Math.min(1,f.life*3);X.fillStyle=f.c;const s=f.k==='puff'?3:2;X.fillRect(Math.round(f.x),Math.round(f.y),s,s);X.globalAlpha=1}});
    // dusk / night grade + light pools (flat fills + additive radial glows, no blur)
    X.globalCompositeOperation='multiply';X.fillStyle=title?'#5c5fb4':'#8a8ed6';X.fillRect(0,0,W,H);X.globalCompositeOperation='lighter';
    const fl=1+Math.sin(t*9)*.04+Math.sin(t*23)*.03;
    [[564,338],[720,338],[564,528],[720,528]].forEach(([x,y])=>{this._glow(x,y,90*fl,'#ffb347',title?.5:.42);this._glow(x,y,22,'#fff0b0',.5)});
    this.props.forEach(p=>{const d=MV.PROPS[p.n];(d&&d.lights||[]).forEach(([dx,dy,r,c])=>this._glow(p.x+dx,p.y+dy,r,c||'#ffd36a',title?.55:.38))});
    if(title){this._glow(634,540,170*fl,'#ff9a3c',.55);this._glow(634,540,50,'#ffd36a',.6);this._fireflies.forEach(f=>{const x=(f.x+Math.sin(t*.6+f.p)*30+W)%W,y=f.y+Math.cos(t*.5+f.p)*20,a=.5+.5*Math.sin(t*2+f.p*3);this._glow(x,y,10,'#b8f57a',a*.6);X.fillStyle='#e8ffc0';X.globalAlpha=a;X.fillRect(Math.round(x),Math.round(y),2,2);X.globalAlpha=1})}
    else{this._glow(P.x,P.y-20,70,'#ff9a3c',.22+(this._castFlash>0?.3:0));this.proj.forEach(p=>this._glow(p.x,p.y,48,SC[p.school][0],.55));this.fx.forEach(f=>{if(f.k==='ring')this._glow(f.x,f.y,f.r+30,f.c,.4*f.life/f.max)});this.loot.forEach(L=>this._glow(L.x,L.y-6,36,L.rar[1],.45));if(P.kindle>0)this._glow(P.x,P.y-16,60,'#ffd96b',.4)}
    X.globalCompositeOperation='source-over';
    // damage numbers (Jersey 10, 2px ink stroke, pop-in)
    this.nums.forEach(n=>{const age=.9-n.life,s=age<.12?1.7-age*5.8:1,sz=Math.round((n.crit?32:n.player?20:22)*s);X.font=sz+'px "Jersey 10"';X.textAlign='center';X.globalAlpha=Math.min(1,n.life*3);X.lineWidth=4;X.strokeStyle='#1a1230';const txt=(n.player?'-':'')+n.v+(n.crit?'!':'');X.strokeText(txt,Math.round(n.x),Math.round(n.y));X.fillStyle=n.c;X.fillText(txt,Math.round(n.x),Math.round(n.y));X.globalAlpha=1});
    if(P.hurt>0&&!title){X.fillStyle='rgba(255,61,90,'+(P.hurt*.6)+')';X.fillRect(0,0,W,6);X.fillRect(0,H-6,W,6);X.fillRect(0,0,6,H);X.fillRect(W-6,0,6,H)}}
  _flame(x,y,t){const X=this.x;for(let i=0;i<3;i++){const h=14+Math.sin(t*12+i*2)*4,w=10-i*3;X.fillStyle=['#ff6a2a','#ffb03a','#fff0b0'][i];X.beginPath();X.moveTo(x-w/2,y);X.lineTo(x+Math.sin(t*8+i)*2,y-h+i*3);X.lineTo(x+w/2,y);X.fill()}}
}
customElements.define('mv-scene',MvScene);
if(__root.dispatchEvent&&typeof CustomEvent!=='undefined')__root.dispatchEvent(new CustomEvent('mvready',{detail:'scene.js'}));})();
