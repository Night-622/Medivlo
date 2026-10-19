/* Medival — tilesets & buildings v2 (registers into MV.PROPS). 32×32 tiles at 1×; props/buildings auto-outlined. */
(function __mvboot(){const __root=typeof window!=='undefined'?window:globalThis;{const MV=__root.MV;if(!(MV)){setTimeout(__mvboot,25);return}}
const root=typeof window!=='undefined'?window:globalThis;const MV=root.MV;if(!MV)return;
const {G,outline,rng,mix}=MV,INK=MV.INK,P=MV.PROPS;
const H=(()=>{const R=rng(99);return Array.from({length:40},()=>R()-.5)})();
const hs=(x,y)=>{let h=(x*374761393+y*668265263)|0;h=(h^(h>>>13))*1274126177|0;return((h^(h>>>16))>>>0)/4294967296};

/* ---------- base textures ---------- */
function grassBase(seed,C){C=C||['#3eae4c','#349f49','#5ccc55','#8fe36a','#2a8a47'];const g=G(32,32),R=rng(seed);g.r(0,0,32,32,C[0]);for(let i=0;i<18;i++)g.p(R()*32|0,R()*32|0,C[1]);for(let i=0;i<6;i++){const x=2+R()*27|0,y=3+R()*26|0;g.p(x,y,C[2]);g.p(x+1,y-1,C[3]);g.p(x+2,y,C[2]);g.p(x+1,y,C[4]);g.p(x,y+1,C[4]);g.p(x+2,y+1,C[4])}return g}
function flowers(g,seed,n){const R=rng(seed),cols=['#ff79a8','#fff6e8','#7fb6ff','#ffd84a'];for(let i=0;i<n;i++){const x=3+R()*25|0,y=3+R()*25|0,c=cols[R()*4|0];g.p(x,y+2,'#2a8a47');g.p(x-1,y,c);g.p(x+1,y,c);g.p(x,y-1,c);g.p(x,y+1,c);g.p(x,y,c==='#ffd84a'?'#ff8a2a':'#ffd84a')}return g}
function dirtBase(seed,C){C=C||['#d9b07a','#c49a68','#efd0a0','#a87a4a'];const g=G(32,32),R=rng(seed);g.r(0,0,32,32,C[0]);for(let i=0;i<26;i++)g.p(R()*32|0,R()*32|0,C[1]);for(let i=0;i<5;i++){const x=R()*30|0,y=R()*30|0;g.r(x,y,2,1,C[2]);g.r(x,y+1,2,1,C[3])}return g}
function waterBase(seed,C){C=C||['#3fb8e8','#2a9ad8','#7fd8f8','#ffffff'];const g=G(32,32),R=rng(seed);g.r(0,0,32,32,C[0]);for(let i=0;i<10;i++)g.r(R()*30|0,R()*31|0,2+(R()*3|0),1,C[1]);for(let i=0;i<6;i++)g.r(R()*28|0,R()*31|0,3+(R()*3|0),1,C[2]);g.p(R()*30|0,R()*30|0,C[3]);return g}
function slabBase(seed,C){C=C||['#3a6585','#2b4a66','#24405a','#1e3550'];const g=G(32,32),R=rng(seed);g.r(0,0,32,32,C[3]);[[0,0,16,16],[16,0,16,8],[16,8,16,8],[0,16,10,16],[10,16,22,16]].forEach(([x,y,w,h])=>{g.r(x+1,y+1,w-2,h-2,C[1]);g.r(x+1,y+1,w-2,1,C[0]);g.r(x+1,y+1,1,h-2,C[0]);g.r(x+1,y+h-2,w-2,1,C[2])});for(let i=0;i<3;i++)g.p(R()*30|0,R()*30|0,C[2]);return g}
function cobbleBase(seed){const g=G(32,32),R=rng(seed);g.r(0,0,32,32,'#8a7c66');for(let row=0;row<4;row++){let x=-(R()*8|0);while(x<32){const w=6+(R()*6|0);for(let j=1;j<8;j++)for(let i=1;i<w;i++){if((j===1||j===7)&&(i===1||i===w-1))continue;g.p(((x+i)%32+32)%32,row*8+j,j===1?'#efe6cf':j===7?'#ab9d7d':i===w-1?'#c2b593':'#d4c8a8')}x+=w}}return g}
const px=g=>g.x.getImageData(0,0,32,32).data;

/* ---------- 16-tile corner autotile (bit 8=TL 4=TR 2=BL 1=BR = "inside" terrain) ---------- */
function wang(mask,outG,inG,E){const tl=mask>>3&1,tr=mask>>2&1,bl=mask>>1&1,br=mask&1;
  const ins=(x,y)=>{const u=(x+.5)/32,v=(y+.5)/32;let f;if(mask===6||mask===9){const cs=mask===6?[[32,0],[0,32]]:[[0,0],[32,32]];f=Math.max(...cs.map(([cx,cy])=>1-Math.hypot(x+.5-cx,y+.5-cy)/32))}else f=(tl*(1-u)+tr*u)*(1-v)+(bl*(1-u)+br*u)*v;return f+(H[(x+40)%40]+H[(y+40)%40])*.12>.5};
  const g=G(32,32),o=px(outG),n=px(inG),img=g.x.createImageData(32,32),d=img.data;
  for(let y=0;y<32;y++)for(let x=0;x<32;x++){const i=(y*32+x)*4,s=ins(x,y)?n:o;d[i]=s[i];d[i+1]=s[i+1];d[i+2]=s[i+2];d[i+3]=255}
  g.x.putImageData(img,0,0);
  for(let y=0;y<32;y++)for(let x=0;x<32;x++){const a=ins(x,y),nb=[ins(x-1,y),ins(x+1,y),ins(x,y-1),ins(x,y+1)];
    if(a&&nb.some(v=>!v)){g.p(x,y,E.inRim);if(E.inRim2&&!ins(x,y-1))g.p(x,y+1,E.inRim2)}
    else if(!a&&nb.some(v=>v)){if(E.outRim)g.p(x,y,E.outRim);if(E.tuft&&hs(x,y)<.35&&nb[3])g.p(x,y+1,E.tuft)}}
  return g}
function wangSet(prefix,outFn,inFn,E,note){for(let m=0;m<16;m++)P[prefix+m]={w:32,h:32,tile:1,wang:prefix,fn:g=>g.img(wang(m,outFn(m),inFn(m),E))}}

/* ---------- helpers for buildings ---------- */
function stones(g,x0,y0,w,h,C,seed,rh=6){const R=rng(seed);g.r(x0,y0,w,h,C[3]);for(let y=y0;y<y0+h;y+=rh){let x=x0-(R()*6|0);const hh=Math.min(rh-1,y0+h-y);while(x<x0+w){const sw=6+(R()*7|0),xa=Math.max(x0,x),xb=Math.min(x0+w,x+sw-1);if(xb>xa){g.r(xa,y,xb-xa,hh,C[1]);g.r(xa,y,xb-xa,1,C[0]);if(hh>2)g.r(xa,y+hh-1,xb-xa,1,C[2])}x+=sw}}}
function tilesRoof(g,x0,y0,w,h,C,rh=5){g.r(x0,y0,w,h,C[1]);for(let k=0,y=y0;y<y0+h;y+=rh,k++){g.r(x0,y+rh-1,w,1,C[2]);for(let x=x0+(k%2?4:0);x<x0+w;x+=8){g.r(x,y,1,rh-1,C[2]);g.r(x+1,y,5,1,C[0])}}}
function sideRoof(g,x0,y0,w,h,C){tilesRoof(g,x0,y0+4,w,h-7,C);g.r(x0,y0,w,4,C[3]);g.r(x0+2,y0,w-4,1,C[0]);g.r(x0,y0+h-3,w,3,C[3]);g.r(x0,y0+h-3,w,1,C[2]);g.r(x0,y0+4,3,h-7,C[0]);g.r(x0+w-3,y0+4,3,h-7,C[2])}
function gableRoof(g,x0,w,yTop,yPeak,yEave,C,kind,seed){const cx=x0+w/2,k=(yEave-yPeak)/(w/2),yb=x=>Math.round(yPeak+Math.abs(x+.5-cx)*k);
  for(let x=x0;x<x0+w;x++){const L=x<cx,bot=yb(x);for(let y=yTop;y<=bot;y++){let c=L?C[0]:C[1];const d=bot-y;
    if(kind==='thatch'){const h=hs(x,Math.floor(y/3)+seed);if(h<.2)c=L?C[1]:C[2];else if(h>.9)c=L?'#fff0b0':C[0]}
    else{const r=Math.floor(d/5),ir=d%5;if(ir===4)c=L?C[1]:C[2];else if(ir===0&&d>0)c=L?mix(C[0],'#ffffff',.25):C[0];if((x+r*4)%8===0&&ir!==4)c=L?C[1]:C[2]}
    g.p(x,y,c)}}
  g.r(Math.floor(cx)-1,yTop,2,yPeak-yTop,C[2]);g.p(Math.floor(cx)-1,yTop,C[0]);
  for(let x=x0;x<x0+w;x++){const b=yb(x);g.p(x,b,C[3]);g.p(x,b-1,C[2]);if(kind==='thatch'&&hs(x,7)<.4)g.p(x,b+1,C[2])}return yb}
function plaster(g,x,y,w,h,seed){const R=rng(seed||3);g.r(x,y,w,h,'#f4e6c8');for(let i=0;i<w*h/60;i++)g.p(x+R()*w|0,y+R()*h|0,'#e8d4b0')}
function beams(g,x,y,w,h,c='#7a4526',hi='#a8622f'){g.r(x,y,w,h,c);g.r(x,y,Math.max(1,w>h?w:1),1,hi)}
function win(g,x,y,w,h,o={}){const F=o.frame||'#6e3a22';g.r(x,y,w,h,F);g.r(x+2,y+2,w-4,h-4,o.lit===false?'#3a4a7a':'#ffd36a');if(o.lit!==false){g.r(x+2,y+2,w-4,Math.max(1,(h-4)/3|0),'#fff0b0')}else g.p(x+3,y+3,'#8ab4ff');g.r(x+(w/2|0)-1,y+2,2,h-4,F);g.r(x+2,y+(h/2|0),w-4,1,F);
  if(o.shutter){g.r(x-4,y,4,h,o.shutter);g.r(x+w,y,4,h,o.shutter);g.r(x-4,y,1,h,mix(o.shutter,'#ffffff',.3));g.r(x+w+3,y,1,h,mix(o.shutter,'#000000',.3));for(let j=y+2;j<y+h;j+=3){g.r(x-3,j,2,1,mix(o.shutter,'#000000',.25));g.r(x+w+1,j,2,1,mix(o.shutter,'#000000',.25))}}
  if(o.box){g.r(x-2,y+h,w+4,4,'#a9622f');g.r(x-2,y+h,w+4,1,'#d18a4a');for(let i=0;i<w;i+=3){g.p(x+i,y+h-1,'#ff5a6a');g.p(x+i+1,y+h-2,'#ff79a8');g.p(x+i+1,y+h-1,'#3eae4c')}}}
function door(g,x,y,w,h,c,o={}){const d=mix(c,'#000000',.35),l=mix(c,'#ffffff',.25);g.r(x,y+3,w,h-3,c);g.r(x+2,y+1,w-4,2,c);g.r(x+4,y,w-8,1,c);for(let i=x+3;i<x+w-2;i+=4)g.r(i,y+3,1,h-3,d);g.r(x+1,y+3,1,h-3,l);if(o.bands){g.r(x,y+8,w,1,'#4b5578');g.r(x,y+h-7,w,1,'#4b5578')}g.p(x+w-4,y+(h/2|0)+1,'#ffd84a');g.p(x+w-4,y+(h/2|0)+2,'#e09a1e')}
function roofTop(x,cx,yPeak,k){return yPeak+Math.abs(x+.5-cx)*k}
function clipAbove(g,x0,x1,topFn){for(let x=x0;x<x1;x++){const t=Math.floor(topFn(x));if(t>0)g.x.clearRect(x,0,1,t)}}
function sh(g,x,y,w,h,c){g.r(x,y,w,h,c[1]);g.r(x,y,1,h,c[0]);g.r(x+w-1,y,1,h,c[2])}
function sharpRoof(g,x0,w,yPeak,yEave,th,C,kind,seed){const cx=x0+w/2,k=(yEave-yPeak)/(w/2),top=x=>yPeak+Math.abs(x+.5-cx)*k;
  for(let x=x0;x<x0+w;x++){const t=Math.round(top(x)),L=x<cx;for(let y=t;y<=t+th;y++){const d=y-t;let c=L?C[0]:C[1];
    if(kind==='thatch'){const h=hs(x,Math.floor(y/3)+seed);if(h<.2)c=L?C[1]:C[2];else if(h>.9)c=L?'#fff0b0':C[0]}
    else if(kind==='glass'){c=L?'#d8f6ff':'#a8dce8';if(d%6===5||x%10===0)c=C[1]}
    else{const r=d%5;if(r===4)c=L?C[1]:C[2];else if((x+(Math.floor(d/5)%2)*3)%7===0)c=L?C[1]:C[2]}
    if(d===0)c=L?mix(C[0],'#ffffff',.3):C[0];if(d===th)c=C[3];else if(d===th-1)c=C[2];g.p(x,y,c)}
    if(kind==='thatch'&&hs(x,7)<.45)g.p(x,t+th+1,C[2])}
  g.r(Math.round(cx)-2,yPeak-1,4,3,C[3]);g.r(Math.round(cx)-1,yPeak-1,2,1,C[0]);return x=>Math.round(top(x))+th}
function sharpRoofSmall(g,x,y,w){for(let i=0;i<w/2;i++){g.r(x+i,y+w/2-i-6,1,6,'#7a4526');g.r(x+w-1-i,y+w/2-i-6,1,6,'#5e3220')}g.r(x,y+w/2-2,w,2,'#3a2214')}
const ROOF={red:['#ff7a6a','#e84a4a','#b82f45','#7d1d3d'],blue:['#7ab4ff','#4a8cf0','#2f5fc4','#22378a'],teal:['#6fe0c8','#35c2a6','#1f8a85','#155a66'],slate:['#9aa6c8','#6a7aa8','#46548c','#2c3868'],thatch:['#f0c870','#d9a850','#a8762a','#7a5218'],plum:['#c08aff','#8a4ae0','#5a2aa8','#3a1a70']};
const STONE={warm:['#d8ccc0','#b0a49a','#7a7068','#5e5650'],lav:['#d8d0e8','#b8b0c8','#8a82a0','#5e5878'],dark:['#a89aa8','#8a8090','#5e5668','#3e3848'],green:['#b8c8a8','#98a888','#6a7a5a','#4a5a3a']};

/* ---------- BUILDINGS ---------- */
P.b_inn={w:160,h:144,building:1,cat:'trade',label:'The Gilded Goose (inn)',lights:[[42,78,30],[80,78,30],[118,78,30],[32,116,34],[128,116,34],[42,36,22],[118,36,22]],fn:g=>{
  [20,128].forEach(x=>{g.r(x,0,12,16,'#9a8f8a');g.r(x,0,4,16,'#c9c0b8');g.r(x-1,0,14,2,'#6f6670')});
  sideRoof(g,0,8,160,56,ROOF.red);
  [30,106].forEach(x=>{plaster(g,x+3,30,20,20,x);win(g,x+6,33,14,14,{});gableRoof(g,x,26,18,20,32,ROOF.red,'tiles',x);for(let y=32;y<50;y++){g.p(x+2,y,'#b82f45');g.p(x+23,y,'#7d1d3d')}g.r(x+1,50,24,2,'#7d1d3d')});
  plaster(g,6,64,148,32,9);for(let x=6;x<=150;x+=24)g.r(x,64,3,32,'#6e3a22');g.r(6,64,148,3,'#6e3a22');g.r(6,93,148,3,'#6e3a22');
  [[9,30],[129,150]].forEach(([a,b])=>{g.line(a,67,b,93,'#6e3a22');g.line(b,67,a,93,'#6e3a22')});
  [34,72,110].forEach(x=>win(g,x,70,16,16,{box:1}));
  g.r(6,96,148,3,'#3a2214');stones(g,12,99,136,39,STONE.warm,21,6);
  g.r(66,104,28,34,'#4f2a18');door(g,67,106,13,32,'#8a4f2a',{bands:1});door(g,80,106,13,32,'#8a4f2a',{bands:1});g.r(65,102,30,3,'#7a7068');
  [[22,106],[118,106]].forEach(([x,y])=>{g.r(x,y,22,20,'#6e3a22');g.r(x+2,y+2,18,16,'#ffd36a');for(let i=0;i<3;i++)for(let j=0;j<3;j++)g.disc(x+5+i*6,y+5+j*5,1.2,'#fff0b0');g.r(x+10,y+2,2,16,'#6e3a22')});
  [[58,110],[98,110]].forEach(([x,y])=>{g.r(x,y,5,6,'#3a2a4a');g.r(x+1,y+1,3,4,'#ffd36a')});
  g.r(140,100,18,2,'#3a2a4a');g.r(146,102,1,3,'#3a2a4a');g.r(154,102,1,3,'#3a2a4a');g.r(142,105,16,14,GOLD[1]);g.r(143,106,14,12,'#6e3a22');g.ell(150,113,4,3,'#ffffff');g.disc(153,110,2,'#ffffff');g.p(155,110,'#ff9a2e');g.p(154,109,'#1a1230');g.r(147,116,6,1,GOLD[0]);
  g.r(10,138,140,4,'#cfc6bb');g.r(10,138,140,1,'#efe6cf')}};
const GOLD=['#ffe27a','#f0a823','#b8661a'];
P.b_smithy={w:128,h:112,building:1,cat:'craft',label:'The Anvil (smithy)',lights:[[40,90,56],[67,4,24]],fn:g=>{
  sideRoof(g,0,10,92,46,ROOF.slate);
  g.r(58,0,18,34,'#7a7068');stones(g,58,0,18,34,STONE.dark,5,5);g.r(56,0,22,3,'#3e3848');g.r(60,0,14,1,'#ff9a2e');g.p(63,1,'#ffd36a');g.p(69,1,'#ffd36a');
  stones(g,4,56,84,50,STONE.dark,8,6);g.r(18,64,46,42,'#2b2145');g.r(18,64,46,3,'#1a1230');g.r(16,62,50,2,'#5e5668');
  g.r(26,84,30,18,'#5e5668');g.r(26,84,30,2,'#8a8090');g.r(30,88,22,8,'#ff7a2a');g.r(32,89,18,4,'#ffd36a');[[34,90],[40,89],[46,91]].forEach(p=>g.p(p[0],p[1],'#fff0b0'));g.r(36,70,10,14,'#3e3848');
  [[22,70],[25,70],[58,70]].forEach(([x,y])=>{g.r(x,y,1,7,'#8a90a8');g.r(x-1,y+7,3,2,'#5a5f7a')});
  g.poly([[84,50],[126,58],[126,64],[84,58]],'#a9622f');g.line(84,50,126,58,'#d18a4a');for(let x=90;x<126;x+=6)g.line(x,51+(x-84)/5.3,x,57+(x-84)/5.3,'#7a4526');
  [92,122].forEach(x=>{g.r(x,60,3,46,'#7a4526');g.r(x,60,1,46,'#a9622f')});
  g.r(96,88,22,4,'#5a5f7a');g.r(96,88,22,1,'#a9bbd6');g.poly([[96,88],[90,90],[96,91]],'#5a5f7a');g.r(102,92,10,4,'#33364a');g.r(100,96,14,4,'#4b5578');g.r(100,96,14,1,'#7a88aa');
  [100,106,112].forEach(x=>{g.r(x,66,1,12,'#d3ddff');g.r(x-1,76,3,2,'#5e3220')});g.r(97,64,20,2,'#5e3220');
  g.r(4,104,122,4,'#5e5650');g.r(4,104,122,1,'#8a8090')}};
P.b_chapel={w:176,h:168,building:1,cat:'civic',label:'Chapel of the Drowned Bell',lights:[[88,90,48],[88,34,20],[30,112,22],[146,112,22],[56,116,18],[120,116,18]],fn:g=>{
  const L=STONE.lav,R=ROOF.slate;
  [[2,52],[122,52]].forEach(([x0,w],i)=>{stones(g,x0+4,96,w-8,64,STONE.dark,x0+3,6);const tmp=G(w,40);tilesRoof(tmp,0,4,w,30,R,5);tmp.r(0,30,w,4,R[3]);tmp.r(0,4,w,3,i?R[2]:R[0]);g.img(tmp,x0,62);
    [x0+10,x0+30].forEach(wx=>{g.r(wx,108,10,30,'#5e5878');g.r(wx+2,112,6,24,'#ffd36a');g.r(wx+2,112,6,6,'#fff0b0');g.r(wx+4,110,2,2,'#5e5878');g.r(wx+2,124,6,1,'#5e5878');g.disc(wx+5,111,3,'#5e5878');g.disc(wx+5,112,2,'#ffd36a')});
    g.r(x0+4,94,w-8,3,'#5e5878');g.r(x0+4,94,w-8,1,'#b8b0c8')});
  stones(g,72,10,32,48,L,2,6);g.r(72,10,4,48,'#d8d0e8');g.r(100,10,4,48,'#5e5878');g.r(76,22,24,30,'#2b2145');g.r(76,22,24,2,'#1a1230');
  g.poly([[80,38],[88,28],[96,38],[96,48],[80,48]],GOLD[1]);g.poly([[88,28],[96,38],[96,48],[88,48]],GOLD[2]);g.r(82,38,12,1,GOLD[0]);g.r(86,48,4,3,GOLD[2]);g.p(88,50,'#ffe27a');
  for(let x=70;x<106;x+=8){stones(g,x,4,6,8,L,x,4);g.r(x,4,6,1,'#e8e0f8')}
  g.poly([[70,6],[88,-1],[106,6]],R[1]);g.x.clearRect(0,0,176,0);g.poly([[66,8],[88,0],[110,8]],R[1]);g.poly([[88,0],[110,8],[88,8]],R[2]);g.line(66,8,87,0,R[0]);g.r(65,7,46,2,R[3]);g.r(87,0,2,1,GOLD[0]);
  const yb=gableRoof(g,30,116,52,60,96,R,'tiles',6);
  stones(g,38,98,100,62,L,31,7);for(let x=38;x<138;x++){const tp=yb(x)+1;if(tp<98)stones(g,x,tp,1,98-tp,L,x*7,6)}gableRoof(g,30,116,52,60,96,R,'tiles',6);
  [42,130].forEach(bx=>{g.r(bx-4,96,10,64,'#8a82a0');g.r(bx-4,96,3,64,'#b8b0c8');g.r(bx+4,96,2,64,'#5e5878');g.poly([[bx-4,96],[bx+1,88],[bx+6,96]],'#8a82a0');for(let y=104;y<158;y+=14)g.r(bx-4,y,10,1,'#5e5878')});
  const cols=['#ff5a6a','#3fa9ff','#ffd84a','#5fe06a','#b766ff','#3fa9ff','#ff9a2e','#5fe06a','#ff79a8','#7fe3ff','#ffd84a','#b766ff'];g.disc(88,92,17,'#5e5878');g.disc(88,92,15.5,'#3e3848');for(let y=-14;y<=14;y++)for(let x=-14;x<=14;x++){const d=Math.hypot(x,y);if(d>14)continue;const a=(Math.atan2(y,x)+Math.PI)/(Math.PI*2);g.p(88+x,92+y,d<4?'#fff0b0':d<9?cols[Math.floor(a*6)%6+6]:cols[Math.floor(a*12)%12])}
  for(let i=0;i<12;i++){const a=i/12*Math.PI*2;g.line(88,92,88+Math.cos(a)*14,92+Math.sin(a)*14,'#3e3848')}g.ell(88,92,9,9,'#3e3848');g.ell(88,92,8,8,null,true);for(let y=-8;y<=8;y++)for(let x=-8;x<=8;x++){const d=Math.hypot(x,y);if(d<=8){const a=(Math.atan2(y,x)+Math.PI)/(Math.PI*2);g.p(88+x,92+y,d<4?'#fff0b0':cols[Math.floor(a*6)%6+6])}}g.disc(88,92,2.4,'#3e3848');
  [[56,112],[114,112]].forEach(([x,y])=>{g.r(x,y,10,26,'#5e5878');g.r(x+2,y+4,6,20,'#7fe3ff');g.r(x+2,y+4,6,6,'#e8fbff');g.disc(x+5,y+3,3,'#5e5878');g.disc(x+5,y+4,2,'#7fe3ff');g.r(x+2,y+14,6,1,'#5e5878')});
  g.r(74,118,28,42,'#5e5878');for(let i=0;i<12;i++){const a=Math.PI*(1-i/11),x=88+Math.cos(a)*15,y=124-Math.sin(a)*10;g.r(Math.round(x)-3,Math.round(y)-3,6,6,i%2?'#b8b0c8':'#d8d0e8')}door(g,77,124,11,36,'#7a4526',{bands:1});door(g,88,124,11,36,'#7a4526',{bands:1});
  g.r(30,108,4,2,'#2fb7c9');g.r(142,108,4,2,'#2fb7c9');for(let x=38;x<138;x+=4)g.r(x,154+(hs(x,5)*3|0),3,6,'#2aa898');g.r(38,158,100,2,'#2fb7c9');
  g.r(64,160,48,4,'#b8b0c8');g.r(58,164,60,3,'#8a82a0');g.r(64,160,48,1,'#d8d0e8')}};
P.b_mill={w:128,h:144,building:1,cat:'craft',label:'Cinderwick mill (rebuilding)',lights:[[66,82,28]],fn:g=>{
  g.disc(22,98,22,'#6e3a22');g.disc(22,98,19,'#2a5a8a');g.disc(22,98,5,'#6e3a22');g.disc(22,98,3,'#a9622f');for(let i=0;i<10;i++){const a=i/10*Math.PI*2;g.line(22+Math.cos(a)*5,98+Math.sin(a)*5,22+Math.cos(a)*20,98+Math.sin(a)*20,'#a9622f');g.r(Math.round(22+Math.cos(a)*20)-2,Math.round(98+Math.sin(a)*20)-2,4,4,'#d18a4a')}
  g.r(2,128,40,8,'#2a96d8');g.r(2,128,40,2,'#7fd8f8');
  sideRoof(g,26,14,74,46,ROOF.teal);for(let x=100;x<126;x+=5){g.line(x,18,x-2,58,'#5e3220')}g.r(98,16,28,3,'#5e3220');g.r(98,56,28,3,'#3a2214');
  plaster(g,32,60,90,36,4);for(let x=32;x<=86;x+=18)g.r(x,60,3,36,'#6e3a22');g.r(32,60,90,3,'#6e3a22');g.r(32,93,90,3,'#6e3a22');g.line(35,63,50,93,'#6e3a22');g.line(53,63,68,93,'#6e3a22');
  for(let x=90;x<122;x+=4){g.r(x,60,4,36,x%8?'#3a2a2a':'#5a3a2a');g.p(x+1,62+(x%7),'#ff7a2a')}g.x.clearRect(108,60,14,10);g.x.clearRect(116,70,6,6);
  [94,120].forEach(x=>{g.r(x,40,2,96,'#e8c98f');g.r(x,40,1,96,'#fff1cf')});[52,78].forEach(y=>g.r(92,y,32,2,'#e8c98f'));g.r(104,62,2,40,'#c4834a');g.r(110,62,2,40,'#c4834a');for(let y=66;y<100;y+=6)g.r(104,y,8,1,'#c4834a');
  win(g,60,68,14,14,{});g.r(40,68,14,14,'#6e3a22');g.r(42,70,10,10,'#3a2a2a');g.line(42,70,51,79,'#c4834a');g.line(51,70,42,79,'#c4834a');
  stones(g,30,96,94,40,STONE.warm,41,6);door(g,52,106,16,30,'#8a4f2a');
  [[80,124],[88,126],[84,118]].forEach(([x,y])=>{g.ell(x,y,4.5,4,'#e8d4b0');g.ell(x-1,y-1,3,2.5,'#fff1cf');g.r(x-1,y-4,2,2,'#c8b08a')});
  g.r(28,136,96,4,'#cfc6bb');g.r(28,136,96,1,'#efe6cf')}};
P.b_stall={w:64,h:64,building:1,cat:'trade',label:'Market stall',fn:g=>{
  [4,56].forEach(x=>{g.r(x,14,3,46,'#7a4526');g.r(x,14,1,46,'#a9622f')});
  for(let x=0;x<64;x++){const c=Math.floor(x/8)%2?'#ffffff':'#e84a4a';g.r(x,4,1,14,c)}g.r(0,4,64,2,'#7d1d3d');for(let x=0;x<64;x+=8){g.disc(x+4,18,4,Math.floor(x/8)%2?'#ffffff':'#e84a4a')}g.r(0,14,64,1,'rgba(0,0,0,0)');
  g.r(2,36,60,6,'#c98a4a');g.r(2,36,60,1,'#f0b26a');g.r(2,42,60,16,'#a9622f');for(let x=6;x<60;x+=10)g.r(x,42,1,16,'#7a4526');
  [[10,32,'#ff5a6a'],[14,33,'#e84a4a'],[12,30,'#ff5a6a'],[24,32,'#7ee06a'],[28,32,'#5fc04a'],[26,30,'#9be38a'],[40,33,'#e8b070'],[46,33,'#e8b070'],[52,32,'#ffd84a'],[56,33,'#ffd84a']].forEach(([x,y,c])=>{g.disc(x,y,2.2,c);g.p(x-1,y-1,'#ffffff')});
  g.r(38,31,12,3,'#d18a4a');g.r(38,31,12,1,'#f0b26a')}};

/* ---------- VILLAGE PROPS ---------- */
P.v_well={w:48,h:64,fn:g=>{g.r(7,14,4,32,'#7a4526');g.r(7,14,2,32,'#a9622f');g.r(37,14,4,32,'#5e3220');tilesRoof(g,2,4,44,12,ROOF.teal,4);g.r(1,2,46,3,ROOF.teal[3]);g.r(1,15,46,2,ROOF.teal[3]);g.r(10,20,28,2,'#7a4526');g.r(38,18,6,2,'#5e3220');g.r(42,20,2,6,'#5e3220');g.line(24,22,24,30,'#e8c98f');g.r(21,30,6,6,'#a9622f');g.r(21,30,6,1,'#d18a4a');g.r(21,33,6,1,'#5a5f7a');
  stones(g,4,44,40,12,STONE.warm,3,4);g.ell(24,56,20,4,'#7a7068');g.ell(24,44,20,7,'#d8ccc0');g.ell(24,44,15,4.6,'#1f3a6a');g.ell(24,45,13,3,'#2a96d8');g.r(18,44,6,1,'#7fe3ff')}};
P.v_lamp={w:16,h:62,fn:g=>{g.r(7,20,3,36,'#2b2145');g.r(7,20,1,36,'#4b4578');g.r(4,54,9,6,'#3a3a48');g.r(4,54,9,1,'#6a6a78');g.r(3,7,11,13,'#2b2145');g.r(5,9,7,9,'#ffd36a');g.r(5,9,7,3,'#fff0b0');g.r(8,9,1,9,'#2b2145');g.poly([[2,7],[8.5,1],[15,7]],'#3a2a4a');g.r(7,0,3,2,'#3a2a4a');g.r(4,20,9,2,'#3a2a4a');g.r(10,24,4,1,'#2b2145');g.r(13,24,1,3,'#2b2145')}};
P.v_waystone={w:32,h:58,fn:g=>{g.ell(16,52,13,4,'#4fa36a');g.poly([[8,52],[6,20],[10,6],[16,2],[22,6],[26,20],[24,52]],'#8a82a0');g.poly([[16,2],[22,6],[26,20],[24,52],[16,52]],'#6a6290');g.line(9,8,7,40,'#b8b0c8');g.disc(16,24,6,'#2de2c4');g.disc(16,24,4.5,'#6a6290');g.disc(16,24,2,'#7ff5e0');[[16,15],[16,33],[9,24],[23,24]].forEach(p=>g.p(p[0],p[1],'#7ff5e0'));g.line(12,40,20,40,'#2de2c4');g.line(13,44,19,44,'#2de2c4');g.p(6,50,'#8ef06a');g.p(25,49,'#8ef06a')},lights:[[16,24,34,'#2de2c4']]};
P.v_noticeboard={w:40,h:46,fn:g=>{[4,33].forEach(x=>{g.r(x,8,3,36,'#7a4526');g.r(x,8,1,36,'#a9622f')});g.poly([[0,8],[20,1],[40,8],[40,10],[0,10]],'#b82f45');g.line(0,8,20,1,'#e84a4a');g.r(3,11,34,20,'#c98a4a');g.r(3,11,34,1,'#f0b26a');[[6,13,9,10,'#fff6e8'],[17,14,8,8,'#ffe27a'],[27,12,7,11,'#fff6e8'],[9,24,10,6,'#ff9ab0']].forEach(([x,y,w,h,c])=>{g.r(x,y,w,h,c);g.p(x+(w/2|0),y,'#d63447');g.r(x+1,y+3,w-2,1,'#c8b08a')})}};
P.v_haystack={w:40,h:32,fn:g=>{g.ell(20,20,19,11,'#d9a850');g.ell(18,17,15,9,'#f0c870');g.ell(15,12,8,5,'#ffe08a');for(let i=0;i<24;i++){const x=4+hs(i,1)*32|0,y=12+hs(i,2)*16|0;g.r(x,y,1,3,'#a8762a')}g.r(2,27,36,2,'#a8762a')}};
P.v_cart={w:56,h:40,fn:g=>{g.r(4,10,40,16,'#a9622f');g.r(4,10,40,2,'#d18a4a');for(let x=8;x<44;x+=8)g.r(x,12,1,14,'#7a4526');g.r(44,20,12,2,'#7a4526');g.ell(14,10,6,4,'#f0c870');g.ell(26,9,7,4,'#e8d4b0');g.ell(36,10,5,3,'#7ee06a');g.disc(14,28,9,'#5e3220');g.disc(14,28,7,'#a9622f');g.disc(14,28,2,'#5e3220');for(let i=0;i<6;i++){const a=i/6*Math.PI*2;g.line(14,28,14+Math.cos(a)*7,28+Math.sin(a)*7,'#5e3220')}g.r(36,26,4,12,'#5e3220')}};
P.v_bench={w:40,h:22,fn:g=>{g.r(2,6,36,4,'#c98a4a');g.r(2,6,36,1,'#f0b26a');g.r(2,12,36,3,'#a9622f');[4,32].forEach(x=>{g.r(x,10,4,11,'#7a4526');g.r(x,10,1,11,'#a9622f')})}};
P.v_fence_h={w:32,h:22,fn:g=>{[2,26].forEach(x=>{g.r(x,2,4,19,'#a9622f');g.r(x,2,2,19,'#d18a4a');g.r(x,1,4,1,'#d18a4a')});[6,13].forEach(y=>{g.r(0,y,32,3,'#c98a4a');g.r(0,y,32,1,'#f0b26a');g.r(0,y+2,32,1,'#8a4f2a')})}};
P.v_fence_v={w:12,h:40,fn:g=>{g.r(4,0,4,39,'#a9622f');g.r(4,0,2,39,'#d18a4a');g.r(2,6,8,3,'#c98a4a');g.r(2,22,8,3,'#c98a4a')}};
P.v_gate={w:32,h:24,fn:g=>{[1,27].forEach(x=>{g.r(x,0,4,23,'#7a4526');g.r(x,0,2,23,'#a9622f')});g.r(5,6,22,3,'#c98a4a');g.r(5,15,22,3,'#c98a4a');g.line(6,17,26,7,'#8a4f2a');g.line(6,18,26,8,'#c98a4a')}};
P.v_hedge={w:32,h:28,fn:g=>{[[6,16],[16,13],[26,16]].forEach(([x,y])=>g.disc(x,y,8,'#1f6a44'));[[6,14],[16,11],[26,14]].forEach(([x,y])=>g.disc(x,y,6.5,'#2a8a47'));[[5,11],[15,8],[25,11]].forEach(([x,y])=>g.disc(x,y,3,'#3eae4c'));g.r(0,22,32,5,'#1f6a44');[[8,18],[20,20],[27,16]].forEach(p=>{g.p(p[0],p[1],'#ff79a8');g.p(p[0]+1,p[1],'#fff6e8')})}};
P.v_flowerbed={w:32,h:20,fn:g=>{g.rr(0,6,32,13,'#8a5a3a',1);g.r(1,7,30,2,'#a87a4a');for(let i=0;i<9;i++){const x=3+i*3.2,y=8+(i%2)*4,c=['#ff79a8','#ffd84a','#fff6e8','#7fb6ff','#ff5a6a'][i%5];g.p(x,y+2,'#3eae4c');g.p(x,y+1,'#3eae4c');g.p(x-1,y,c);g.p(x+1,y,c);g.p(x,y-1,c);g.p(x,y,'#ffd84a')}}};
P.v_scarecrow={w:32,h:54,fn:g=>{g.r(15,10,2,44,'#7a4526');g.r(4,22,24,2,'#7a4526');g.r(10,20,12,16,'#7a6aa8');g.r(10,20,12,2,'#9a8ac8');g.r(10,30,12,1,'#5e3220');g.disc(16,13,5,'#e8d4b0');g.p(14,12,'#1a1230');g.p(18,12,'#1a1230');g.line(14,15,18,15,'#8a5a3a');g.ell(16,8,8,2,'#a8762a');g.r(12,3,8,5,'#d9a850');[[5,22],[27,22],[11,36],[20,36]].forEach(p=>{g.p(p[0],p[1]+2,'#f0c870');g.p(p[0],p[1]+3,'#d9a850')})}};
P.v_barrels={w:40,h:30,fn:g=>{[[2,4],[20,4]].forEach(([x,y])=>{g.r(x+2,y,14,24,'#b06a38');g.r(x,y+3,18,18,'#b06a38');g.r(x+3,y,4,24,'#d18a4a');g.r(x+12,y,4,24,'#7a4526');g.r(x,y+5,18,2,'#5a5f7a');g.r(x,y+16,18,2,'#5a5f7a');g.ell(x+9,y+1,7,2,'#e8a868')})}};
P.v_crates={w:40,h:40,fn:g=>{const cr=(x,y,s)=>{g.r(x,y,s,s,'#c98a4a');g.r(x,y,s,3,'#8a4f2a');g.r(x,y+s-3,s,3,'#8a4f2a');g.r(x,y,3,s,'#8a4f2a');g.r(x+s-3,y,3,s,'#8a4f2a');g.line(x+3,y+s-4,x+s-4,y+3,'#8a4f2a');g.r(x,y,s,1,'#f0b26a')};cr(1,17,22);cr(20,21,18);cr(8,1,18)}};

/* ---------- GLOAMWOOD ---------- */
const GT=['#154a4a','#1f6f5a','#2f9a6a','#4fc48a','#9af0c0'];
P.f_gloamtree={w:96,h:112,fn:g=>{g.r(40,64,16,40,'#4a3a4a');g.r(40,64,5,40,'#6a5a6a');g.r(52,64,4,40,'#2e2438');[[30,100,44,104],[66,100,54,104]].forEach(([a,b,c,d])=>{g.line(a,b,c,d,'#4a3a4a');g.line(a,b-1,c,d-1,'#4a3a4a')});g.r(32,100,32,6,'#4a3a4a');
  g.disc(48,38,34,GT[0]);g.disc(24,54,16,GT[0]);g.disc(72,54,16,GT[0]);g.disc(46,34,30,GT[1]);g.disc(26,48,13,GT[1]);g.disc(70,46,13,GT[1]);g.disc(42,28,22,GT[2]);g.disc(66,34,12,GT[2]);g.disc(22,42,8,GT[2]);g.disc(36,20,13,GT[3]);g.disc(58,22,7,GT[3]);g.disc(32,16,5,GT[4]);
  for(let i=0;i<60;i++){const a=hs(i,3)*6.28,d=hs(i,4)*30,x=48+Math.cos(a)*d,y=38+Math.sin(a)*d*.9;g.p(x,y,y<34?GT[4]:GT[2]);g.p(x+1,y+1,y<34?GT[3]:GT[1])}
  [[24,62],[70,60],[48,70],[34,52],[62,48]].forEach(([x,y],i)=>{g.r(x,y,1,3,'#7ff5e0');g.p(x,y-1,i%2?'#c58bff':'#7ff5e0')});
  [[38,86],[44,90],[54,84]].forEach(([x,y])=>{g.ell(x,y,4,2,'#2de2c4');g.ell(x,y-1,3,1,'#7ff5e0');g.r(x,y+1,1,3,'#c8f0e8')})},lights:[[44,88,40,'#2de2c4'],[24,62,22,'#7ff5e0'],[70,60,22,'#7ff5e0']]};
P.f_pine={w:48,h:88,fn:g=>{g.r(21,68,6,18,'#5e3a2a');g.r(21,68,2,18,'#8a5a3a');for(let i=0;i<5;i++){const y=6+i*13,w=8+i*4.2;g.poly([[24,y-6],[24+w,y+12],[24-w,y+12]],GT[1]);g.poly([[24,y-6],[24-w,y+12],[24-w*.2,y+12]],GT[2]);g.line(24-w,y+12,24+w,y+12,GT[0])}g.p(24,1,GT[4])}};
P.f_deadtree={w:56,h:80,fn:g=>{g.r(24,30,8,48,'#6a5a6a');g.r(24,30,3,48,'#8a7a8a');[[28,34,10,14],[28,40,46,22],[12,16,6,6],[44,24,52,16],[28,30,30,6],[30,8,36,2]].forEach(([a,b,c,d])=>{g.line(a,b,c,d,'#6a5a6a');g.line(a+1,b,c+1,d,'#4a3a4a')});g.r(18,76,20,3,'#4a3a4a');g.disc(20,52,1.5,'#c58bff');g.p(36,46,'#7ff5e0')}};
P.f_stump={w:32,h:26,fn:g=>{g.r(6,10,20,13,'#6e4a3a');g.r(6,10,6,13,'#8a6a4a');g.ell(16,10,10,4,'#c8a07a');g.ell(16,10,6,2.4,'#a87a5a');g.ell(16,10,3,1.2,'#c8a07a');g.r(2,20,28,5,'#6e4a3a');g.p(8,16,'#4fc48a');g.p(9,15,'#9af0c0');g.ell(24,18,3,1.6,'#2de2c4')}};
P.f_mushrooms={w:32,h:26,fn:g=>{[[8,16,5,'#2de2c4','#7ff5e0'],[20,12,7,'#c58bff','#e8c8ff'],[27,19,3,'#2de2c4','#7ff5e0']].forEach(([x,y,r,c,h])=>{g.r(x-1,y,2,24-y,'#e8e0f0');g.ell(x,y,r,r*.6,c);g.ell(x-r*.3,y-r*.25,r*.5,r*.25,h);g.p(x+r*.4,y,h)})},lights:[[16,14,28,'#7ff5e0']]};
P.f_toadstool={w:20,h:24,fn:g=>{g.r(8,12,4,10,'#fff1cf');g.r(8,12,1,10,'#ffffff');g.ell(10,10,8,5,'#e84a4a');g.ell(9,8,5,2.5,'#ff7a6a');[[6,9],[12,7],[14,11],[9,12]].forEach(p=>g.r(p[0],p[1],2,1,'#ffffff'))}};
P.f_fern={w:28,h:22,fn:g=>{[[14,20,4,4],[14,20,24,4],[14,20,2,12],[14,20,26,12],[14,20,14,1]].forEach(([a,b,c,d])=>{g.line(a,b,c,d,GT[2]);const n=8;for(let i=1;i<n;i++){const x=a+(c-a)*i/n,y=b+(d-b)*i/n;g.p(x-1,y,GT[3]);g.p(x+1,y+1,GT[1])}})}};
P.f_log={w:56,h:26,fn:g=>{g.r(6,6,44,16,'#6e4a3a');g.r(6,6,44,4,'#8a6a4a');g.r(6,18,44,4,'#4a3020');g.ell(50,14,5,8,'#c8a07a');g.ell(50,14,3,5,'#a87a5a');g.ell(6,14,5,8,'#6e4a3a');for(let x=10;x<46;x+=7)g.r(x,11,4,1,'#4a3020');g.r(14,4,14,3,GT[3]);g.r(16,3,8,1,GT[4]);g.ell(36,6,3,1.5,'#2de2c4')}};
P.f_runestone={w:28,h:50,fn:g=>{g.ell(14,45,12,4,GT[2]);g.poly([[5,46],[4,14],[9,4],[18,2],[24,10],[24,46]],'#6a7a8a');g.poly([[18,2],[24,10],[24,46],[16,46]],'#4a5a6a');g.line(6,12,5,40,'#8a9aaa');[[14,14],[12,18],[16,18],[14,22],[11,28],[17,28],[14,32],[14,36]].forEach(p=>g.p(p[0],p[1],'#7ff5e0'));g.line(11,28,17,28,'#2de2c4');g.r(6,20,6,4,GT[3]);g.r(19,34,5,5,GT[3])},lights:[[14,24,26,'#2de2c4']]};
P.f_ruin_arch={w:80,h:88,fn:g=>{stones(g,6,20,16,64,STONE.green,3,6);stones(g,58,30,16,54,STONE.green,5,6);for(let i=0;i<16;i++){const a=Math.PI*(1-i/15),x=40+Math.cos(a)*26,y=26-Math.sin(a)*20;if(i<12)g.r(Math.round(x)-4,Math.round(y)-3,8,6,i%2?'#98a888':'#b8c8a8')}g.r(62,24,8,6,'#98a888');g.r(4,82,72,4,'#6a7a5a');[[8,24],[60,34],[20,10],[10,60],[64,70]].forEach(([x,y])=>{g.r(x,y,6,3,GT[2]);g.r(x+1,y,3,1,GT[3])});g.line(16,8,12,40,GT[2]);g.line(17,8,14,30,GT[3])}};
P.f_bramble={w:40,h:24,fn:g=>{[[8,14,7],[20,10,9],[32,14,7]].forEach(([x,y,r])=>g.disc(x,y,r,'#3a4a3a'));[[8,12,5],[20,8,7],[32,12,5]].forEach(([x,y,r])=>g.disc(x,y,r,'#4a6a4a'));for(let i=0;i<14;i++){const x=3+hs(i,8)*34|0,y=4+hs(i,9)*16|0;g.p(x,y,'#c8b08a')}[[12,10],[26,8],[30,16]].forEach(p=>{g.p(p[0],p[1],'#b84dff');g.p(p[0]+1,p[1],'#b84dff')})}};
P.f_lily={w:32,h:32,tile:1,fn:g=>{g.img(waterBase(61,['#2a7a7a','#1f6a6a','#3f9a9a','#9af0c0']));[[9,10,5],[22,20,6]].forEach(([x,y,r])=>{g.disc(x,y,r,'#3fae4c');g.disc(x-1,y-1,r-2,'#5ccc55');g.line(x,y,x+r,y-1,'#1f6a6a')});g.disc(22,20,1.6,'#ff9ad0');g.p(21,19,'#ffffff')}};

/* ---------- DROWNED ABBEY ---------- */
P.d_wall_top={w:32,h:32,tile:1,fn:g=>{g.r(0,0,32,32,'#231a44');g.r(0,0,32,2,'#3a2f6a');for(let i=0;i<6;i++)g.p(hs(i,1)*32|0,4+hs(i,2)*26|0,'#2e2456')}};
const brick=(g,seed)=>{g.r(0,0,32,32,'#2e2456');for(let row=0;row<4;row++){const off=row%2?8:0;for(let x=-16+off;x<32;x+=16){g.r(x+1,row*8+1,14,7,'#4b3c82');g.r(x+1,row*8+1,14,1,'#6a55b0');g.r(x+1,row*8+7,14,1,'#3a2f6a')}}};
P.d_wall={w:32,h:32,tile:1,fn:g=>{brick(g);g.r(0,28,32,4,'#231a44')}};
P.d_wall_moss={w:32,h:32,tile:1,fn:g=>{brick(g);g.r(0,24,32,8,'#1f6a6a');for(let x=0;x<32;x+=2)g.r(x,22+(hs(x,3)*4|0),2,4,'#2de2c4');g.r(0,30,32,2,'#155a5a')}};
P.d_wall_crack={w:32,h:32,tile:1,fn:g=>{brick(g);g.line(10,2,16,14,'#1a1230');g.line(16,14,13,24,'#1a1230');g.line(16,14,22,18,'#1a1230');g.r(0,28,32,4,'#231a44');g.p(18,10,'#c58bff')}};
P.d_floor_a={w:32,h:32,tile:1,fn:g=>g.img(slabBase(3))};
P.d_floor_b={w:32,h:32,tile:1,fn:g=>{g.img(slabBase(9));g.line(6,20,12,26,'#1e3550');g.line(12,26,18,25,'#1e3550');[[24,6],[25,6],[4,10]].forEach(p=>g.p(p[0],p[1],'#2de2c4'))}};
P.d_mosaic={w:32,h:32,tile:1,fn:g=>{g.r(0,0,32,32,'#1e3550');for(let y=0;y<8;y++)for(let x=0;x<8;x++){const d=Math.abs(x-3.5)+Math.abs(y-3.5);g.r(x*4+1,y*4+1,3,3,d<2?'#ffd84a':d<4?'#3fa9ff':'#2b4a66')}}};
P.d_stairs={w:32,h:32,tile:1,fn:g=>{g.r(0,0,32,32,'#1a1230');for(let i=0;i<5;i++){const y=2+i*6;g.r(2+i*2,y,28-i*4,5,mix('#3a6585','#1a1230',i/5));g.r(2+i*2,y,28-i*4,1,mix('#5a85a5','#1a1230',i/5))}}};
P.d_grate={w:32,h:32,tile:1,fn:g=>{g.img(slabBase(5));g.r(6,6,20,20,'#1a1230');for(let x=8;x<26;x+=4)g.r(x,6,2,20,'#5a5f7a');g.r(6,6,20,2,'#8a90a8');g.r(6,24,20,2,'#33364a');g.r(10,14,12,4,'#2fb7c9')}};
P.d_pillar={w:32,h:80,fn:g=>{g.r(4,70,24,8,'#5e5878');g.r(4,70,24,2,'#8a82a0');g.r(2,2,28,8,'#5e5878');g.r(2,2,28,2,'#8a82a0');g.r(8,10,16,60,'#8a82a0');g.r(8,10,4,60,'#b8b0c8');g.r(20,10,4,60,'#5e5878');for(let y=14;y<68;y+=8)g.r(8,y,16,1,'#6a6290');g.r(8,56,16,14,'#1f6a6a');for(let x=8;x<24;x+=2)g.r(x,52+(hs(x,6)*5|0),2,5,'#2de2c4');g.line(14,20,17,34,'#3e3848')}};
P.d_arch={w:96,h:104,fn:g=>{stones(g,0,8,96,92,STONE.lav,17,8);g.r(0,0,96,10,'#5e5878');g.r(0,0,96,2,'#8a82a0');g.r(22,30,52,70,'#0d0a1e');for(let i=0;i<14;i++){const a=Math.PI*(1-i/13),x=48+Math.cos(a)*28,y=34-Math.sin(a)*22;g.r(Math.round(x)-4,Math.round(y)-4,8,8,i%2?'#b8b0c8':'#d8d0e8');g.r(Math.round(x)-4,Math.round(y)+3,8,1,'#5e5878')}g.r(42,6,12,10,'#ffd84a');g.r(44,8,8,6,'#b8661a');g.p(47,10,'#ffe27a');g.p(48,11,'#ffe27a');for(let y=40;y<100;y+=5)g.r(26,y,44,1,'#1a1a3a');g.r(22,94,52,6,'#2fb7c9');g.r(22,94,52,1,'#7fe3ff')}};
P.d_pew={w:48,h:26,fn:g=>{g.r(2,4,40,4,'#6e4a3a');g.r(2,4,40,1,'#8a6a4a');g.r(2,12,44,5,'#8a5a3a');g.r(2,12,44,1,'#a87a5a');[4,38].forEach(x=>g.r(x,8,4,16,'#4a3020'));g.poly([[42,4],[46,6],[44,12],[40,8]],'rgba(0,0,0,0)');g.x.clearRect(36,0,12,4);g.line(36,4,40,8,'#4a3020');g.p(20,10,'#2de2c4')}};
P.d_candelabra={w:20,h:42,fn:g=>{g.r(9,10,2,28,'#c98a1c');g.r(4,36,12,4,'#b8661a');g.r(4,36,12,1,'#ffe27a');g.r(3,12,14,2,'#c98a1c');[3,9,15].forEach(x=>{g.r(x,6,2,6,'#fff1cf');g.disc(x+1,4,1.6,'#ff9a2e');g.p(x+1,3,'#ffd36a')})},lights:[[10,5,40,'#ffb347']]};
P.d_sconce={w:16,h:32,fn:g=>{g.r(5,14,6,4,'#5a5f7a');g.r(7,18,2,10,'#5a5f7a');g.r(4,26,8,3,'#5a5f7a');g.r(6,10,4,5,'#6e3a22');g.disc(8,7,3.6,'#ff7a2a');g.poly([[5,8],[8,0],[11,8]],'#ff7a2a');g.disc(8,8,2,'#ffd36a');g.p(8,5,'#fff0b0')},lights:[[8,6,56,'#ffb347']]};
P.d_crystal={w:28,h:36,fn:g=>{g.poly([[4,34],[2,22],[6,14],[9,34]],'#7fe3ff');g.poly([[8,34],[10,8],[14,1],[18,8],[19,34]],'#c58bff');g.poly([[14,1],[18,8],[19,34],[14,34]],'#9a5adf');g.line(11,9,11,31,'#f0dcff');g.poly([[19,34],[21,18],[26,24],[24,34]],'#7fe3ff');g.line(3,22,4,32,'#e8fbff');g.r(0,33,28,2,'#2b4a66')},lights:[[14,18,40,'#c58bff']]};
P.d_altar={w:56,h:42,fn:g=>{g.r(4,18,48,22,'#8a82a0');g.r(4,18,48,3,'#d8d0e8');g.r(4,36,48,4,'#5e5878');g.r(8,24,40,10,'#6a6290');g.r(24,24,8,10,'#ffd84a');g.r(26,26,4,6,'#b8661a');g.r(10,12,6,8,'#fff1cf');g.disc(13,10,1.6,'#ff9a2e');g.r(40,12,6,8,'#fff1cf');g.disc(43,10,1.6,'#ff9a2e');g.r(20,8,16,10,'#8a1f45');g.r(21,9,14,8,'#fff1cf');g.r(27,9,1,8,'#e3c08f');g.r(4,30,48,2,'#1f6a6a')},lights:[[28,14,44,'#ffd36a']]};
P.d_bell={w:44,h:42,fn:g=>{g.ell(22,38,20,4,'#2fb7c9');g.poly([[6,36],[10,14],[16,6],[28,4],[34,10],[40,34]],'#d9a03a');g.poly([[28,4],[34,10],[40,34],[26,36]],'#a8761a');g.line(11,16,9,32,'#ffe27a');g.ell(23,36,17,4,'#8a5a1a');g.ell(23,35,14,2.5,'#3a2a1a');g.r(14,18,18,2,'#a8761a');g.r(14,24,18,1,'#ffe27a');g.r(18,8,4,4,'#1f6a6a');g.r(30,22,6,5,'#1f6a6a');[[12,30],[34,28]].forEach(p=>g.r(p[0],p[1],3,2,'#2de2c4'));g.r(4,38,36,2,'#7fe3ff')}};
P.d_chest={w:28,h:24,fn:g=>{g.r(2,8,24,14,'#8a5a3a');g.r(2,8,24,2,'#a87a5a');g.r(2,3,24,6,'#a87a5a');g.r(2,3,24,1,'#d0a070');g.r(2,8,24,1,'#4a3020');[2,13,24].forEach(x=>g.r(x,3,2,19,'#5a5f7a'));g.r(12,9,4,5,'#c9cfe0');g.p(13,11,'#1a1230')}};
P.d_chest_rare={w:28,h:24,fn:g=>{g.r(2,8,24,14,'#5a3aa8');g.r(2,8,24,2,'#8a5ad8');g.r(2,3,24,6,'#8a5ad8');g.r(2,3,24,1,'#c08aff');g.r(2,8,24,1,'#2e1a6a');[2,13,24].forEach(x=>g.r(x,3,2,19,'#f0a823'));g.r(2,3,24,1,'#ffe27a');g.r(11,9,6,6,'#ffd84a');g.r(13,11,2,2,'#b8661a');g.p(5,5,'#ffffff')},lights:[[14,12,30,'#b766ff']]};
P.d_kelp={w:18,h:38,fn:g=>{for(let i=0;i<3;i++){const x0=4+i*5;for(let y=36;y>8+i*4;y--){const x=x0+Math.sin(y/4+i)*2;g.p(x,y,i%2?'#2aa898':'#3fd8b0');if(y%5===0)g.p(x+1,y,'#7ff5e0')}}}};
P.d_bones={w:30,h:16,fn:g=>{g.disc(8,8,4.5,'#e8e0d0');g.disc(7,7,3,'#ffffff');g.p(6,8,'#1a1230');g.p(9,8,'#1a1230');g.r(6,11,5,2,'#d0c8b8');g.line(14,12,26,6,'#e8e0d0');g.line(14,6,26,12,'#d0c8b8');[[13,12],[27,6],[13,6],[27,12]].forEach(p=>g.disc(p[0],p[1],1.4,'#ffffff'))}};

/* ---------- plain tiles ---------- */
P.v_grass_0={w:32,h:32,tile:1,fn:g=>g.img(grassBase(11))};P.v_grass_1={w:32,h:32,tile:1,fn:g=>g.img(grassBase(29))};P.v_grass_2={w:32,h:32,tile:1,fn:g=>g.img(grassBase(53))};P.v_grass_3={w:32,h:32,tile:1,fn:g=>g.img(grassBase(87))};
P.v_flowers_0={w:32,h:32,tile:1,fn:g=>g.img(flowers(grassBase(71),71,4))};P.v_flowers_1={w:32,h:32,tile:1,fn:g=>g.img(flowers(grassBase(97),97,3))};
P.v_cobble_0={w:32,h:32,tile:1,fn:g=>g.img(cobbleBase(5))};P.v_cobble_1={w:32,h:32,tile:1,fn:g=>g.img(cobbleBase(17))};
P.v_farmland={w:32,h:32,tile:1,fn:g=>{g.r(0,0,32,32,'#8a5a3a');for(let y=2;y<32;y+=8){g.r(0,y,32,4,'#a87a4a');g.r(0,y,32,1,'#c49a68');g.r(0,y+4,32,1,'#6e4228')}}};
P.v_crops={w:32,h:32,tile:1,fn:g=>{g.img(P.v_farmland.__c||(()=>{const t=G(32,32);P.v_farmland.fn(t);return t})());for(let y=2;y<32;y+=8)for(let x=3;x<32;x+=6){g.r(x,y-2,1,4,'#3fae4c');g.p(x-1,y-2,'#8ef06a');g.p(x+1,y-3,'#8ef06a')}}};
P.v_wheat={w:32,h:32,tile:1,fn:g=>{g.r(0,0,32,32,'#c8902a');for(let i=0;i<60;i++){const x=hs(i,11)*32|0,y=hs(i,12)*30|0;g.r(x,y,1,3,'#ffe08a');g.p(x,y-1,'#fff0b0')}for(let x=0;x<32;x+=4)g.r(x,28,2,4,'#a8761a')}};
P.v_bridge={w:32,h:32,tile:1,fn:g=>{g.r(0,0,32,32,'#2a96d8');for(let x=0;x<32;x+=8){g.r(x,2,7,28,'#c98a4a');g.r(x,2,7,1,'#f0b26a');g.r(x+6,2,1,28,'#8a4f2a');g.p(x+3,6,'#5e3220');g.p(x+3,25,'#5e3220')}g.r(0,0,32,2,'#7a4526');g.r(0,30,32,2,'#7a4526')}};
P.f_floor_0={w:32,h:32,tile:1,fn:g=>g.img(grassBase(41,['#25806a','#1f6f5a','#35a07a','#6fd6a0','#155a4a']))};
P.f_floor_1={w:32,h:32,tile:1,fn:g=>{g.img(grassBase(43,['#25806a','#1f6f5a','#35a07a','#6fd6a0','#155a4a']));g.p(9,9,'#7ff5e0');g.p(10,9,'#2de2c4');g.p(22,24,'#c58bff')}};
P.f_leaves={w:32,h:32,tile:1,fn:g=>{g.img(grassBase(47,['#25806a','#1f6f5a','#35a07a','#6fd6a0','#155a4a']));for(let i=0;i<14;i++){const x=hs(i,21)*30|0,y=hs(i,22)*30|0,c=['#d9a03a','#c8503a','#e8c070'][i%3];g.r(x,y,2,1,c);g.p(x+1,y+1,mix(c,'#000000',.3))}}};
P.f_roots={w:32,h:32,tile:1,fn:g=>{g.img(grassBase(49,['#25806a','#1f6f5a','#35a07a','#6fd6a0','#155a4a']));[[0,10,14,14,32,9],[4,30,12,20,20,26]].forEach(([a,b,c,d,e,f])=>{g.line(a,b,c,d,'#5e3a2a');g.line(c,d,e,f,'#5e3a2a');g.line(a,b-1,c,d-1,'#8a5a3a')})}};

/* ---------- autotile sets ---------- */
wangSet('v_path_',m=>grassBase(11+m*3),m=>dirtBase(5+m),{inRim:'#b88a5a',outRim:'#2a8a47',tuft:'#5ccc55'});
wangSet('v_water_',m=>grassBase(31+m*5),m=>waterBase(7+m),{inRim:'#e8fbff',inRim2:'#8fe0ff',outRim:'#a87a4a'});
wangSet('f_path_',m=>grassBase(41+m*2,['#25806a','#1f6f5a','#35a07a','#6fd6a0','#155a4a']),m=>dirtBase(9+m,['#8a6a50','#6e5240','#a8886a','#5a4030']),{inRim:'#5a4030',outRim:'#155a4a',tuft:'#35a07a'});
wangSet('d_flood_',m=>slabBase(3+m),m=>{const s=slabBase(3+m),w=waterBase(19+m,['#2fb7c9','#2a9ab0','#7fe3ff','#ffffff']);const o=G(32,32);o.img(s);o.x.globalAlpha=.78;o.img(w);o.x.globalAlpha=1;return o},{inRim:'#c8f6ff',outRim:'#1e3550'});

/* ---------- more buildings ---------- */
const WD=['#a9622f','#7a4526','#5e3220'];
P.b_house_tall={w:96,h:144,building:1,cat:'home',label:'Townhouse',lights:[[48,32,18],[27,68,26],[69,68,26],[25,105,26]],fn:g=>{
  plaster(g,10,8,76,124,7);clipAbove(g,0,96,x=>roofTop(x,48,4,40/46)+6);
  g.r(64,6,10,26,'#9a8f8a');g.r(64,6,3,26,'#c9c0b8');g.r(62,4,14,3,'#6f6670');
  sharpRoof(g,2,92,4,44,12,ROOF.blue,'tiles',2);
  win(g,42,26,12,14,{});g.r(10,48,76,3,'#5e3220');g.r(10,48,3,38,'#7a4526');g.r(83,48,3,38,'#5e3220');g.r(47,51,2,35,'#7a4526');
  g.line(13,51,22,83,'#7a4526');g.line(46,51,37,83,'#7a4526');g.line(50,51,59,83,'#7a4526');g.line(83,51,74,83,'#7a4526');
  win(g,20,60,14,16,{shutter:'#e84a4a'});win(g,62,60,14,16,{shutter:'#e84a4a'});
  g.r(6,84,84,4,'#5e3220');g.r(6,84,84,1,'#8a4f2a');for(let x=10;x<88;x+=8)g.r(x,88,3,2,'#5e3220');
  plaster(g,12,88,72,40,9);g.r(12,88,2,40,'#7a4526');g.r(82,88,2,40,'#5e3220');
  win(g,18,98,16,14,{box:1});door(g,54,96,18,34,'#2f5fc4');g.r(54,94,18,2,'#5e3220');
  stones(g,8,128,80,10,STONE.warm,13,5);g.r(50,132,26,4,'#cfc6bb')}};
P.b_house_stone={w:96,h:112,building:1,cat:'home',label:'Stone house',lights:[[48,34,20],[24,74,26],[72,74,26]],fn:g=>{
  stones(g,8,6,80,96,STONE.warm,23,6);clipAbove(g,0,96,x=>roofTop(x,48,4,44/48)+6);
  sharpRoof(g,0,96,4,48,12,ROOF.slate,'tiles',5);
  g.disc(48,34,5,'#5e5650');g.disc(48,34,3.6,'#ffd36a');g.r(47,30,2,8,'#5e5650');
  win(g,16,66,16,16,{shutter:'#3f74d9'});win(g,64,66,16,16,{shutter:'#3f74d9'});
  g.r(38,70,20,32,'#5e5650');door(g,40,72,16,30,'#8a4f2a',{bands:1});g.r(38,68,20,3,'#d8ccc0');
  for(let i=0;i<40;i++){const x=8+hs(i,31)*14|0,y=52+hs(i,32)*48|0;g.p(x,y,i%3?'#3fae4c':'#5ccc55');g.p(x+1,y+1,'#2a8a47')}
  g.r(4,102,88,4,'#7a7068');g.r(36,104,24,4,'#cfc6bb')}};
P.b_rowhouses={w:156,h:124,building:1,cat:'home',label:'Row houses',lights:[[26,56,22],[78,56,22],[130,56,22]],fn:g=>{
  const walls=['#f4e6c8','#e4eef6','#f8e0e4'],roofs=[ROOF.red,ROOF.teal,ROOF.plum],doors=['#3fae4c','#e84a4a','#f0a823'];
  for(let i=0;i<3;i++){const tmp=G(52,124);tmp.r(4,8,44,106,walls[i]);for(let k=0;k<30;k++)tmp.p(4+hs(k,i)*44|0,8+hs(k,i+9)*100|0,mix(walls[i],'#000000',.08));clipAbove(tmp,0,52,x=>roofTop(x,26,4,30/26)+6);sharpRoof(tmp,0,52,4,34,10,roofs[i],'tiles',i);
    win(tmp,18,48,16,16,{shutter:mix(roofs[i][1],'#000000',.15)});tmp.r(4,74,44,2,'#7a4526');win(tmp,8,82,12,14,{box:1});door(tmp,26,80,16,34,doors[i]);tmp.r(4,40,1,74,'#5e3220');tmp.r(47,40,1,74,'#5e3220');g.img(tmp,i*52,0)}
  stones(g,2,112,152,10,STONE.warm,17,5)}};
P.b_pub={w:128,h:124,building:1,cat:'trade',label:'The Drowned Rat (pub)',lights:[[34,76,36],[54,80,16],[88,80,16]],fn:g=>{
  g.r(98,0,12,20,'#7a7068');g.r(98,0,4,20,'#a8a098');g.r(96,0,16,2,'#3e3848');
  sideRoof(g,0,8,128,44,['#8a6e60','#6e5448','#4a3830','#2e2420']);
  g.r(6,52,116,58,'#4f2a18');for(let x=6;x<122;x+=6){g.r(x,52,5,58,'#5e3a22');g.r(x,52,1,58,'#7a4a2a')}g.r(6,52,116,3,'#2e1a10');
  g.r(10,62,48,30,'#2e1a10');g.r(12,64,44,26,'#3a2a1a');for(let j=0;j<3;j++)for(let i=0;i<6;i++){const cx=16+i*7,cy=69+j*8;g.disc(cx,cy,2.8,'#c8b050');g.disc(cx-.5,cy-.5,1.6,'#ffe890')}g.r(8,92,52,3,'#2e1a10');
  door(g,62,72,20,38,'#8a1f45',{bands:1});g.r(60,68,24,4,'#2e1a10');
  [[52,76],[86,76]].forEach(([x,y])=>{g.r(x,y,5,7,'#2b2145');g.r(x+1,y+1,3,5,'#ffd36a')});
  g.r(92,54,30,2,'#2b2145');g.r(96,56,1,4,'#2b2145');g.r(116,56,1,4,'#2b2145');g.r(94,60,26,18,'#6e3a22');g.r(95,61,24,16,'#c98a4a');g.ell(106,71,6,3.5,'#8a90a8');g.disc(100,68,2.6,'#8a90a8');g.p(99,67,'#1a1230');g.line(112,71,118,66,'#ff9ab0');g.r(96,73,22,2,'#2fb7c9');
  g.r(98,92,16,16,'#a9622f');g.r(98,95,16,2,'#5a5f7a');g.r(98,103,16,2,'#5a5f7a');g.ell(106,92,8,2,'#d18a4a');
  stones(g,4,108,120,10,STONE.dark,19,5);g.r(10,118,108,3,'#5e5650')}};
P.b_teahouse={w:112,h:112,building:1,cat:'trade',label:'The Briar & Kettle (tea room)',lights:[[56,34,20],[34,74,34],[94,74,22]],fn:g=>{
  plaster(g,8,8,96,94,12);for(let i=0;i<60;i++)g.p(8+hs(i,41)*96|0,8+hs(i,42)*90|0,'#f8d8e0');clipAbove(g,0,112,x=>roofTop(x,56,4,40/56)+6);
  g.r(80,6,10,22,'#c9c0b8');g.r(78,4,14,3,'#8a82a0');
  sharpRoof(g,0,112,4,44,12,ROOF.teal,'tiles',8);
  g.disc(56,34,6,'#6e3a22');g.disc(56,34,4.4,'#ffd36a');g.r(55,30,2,8,'#6e3a22');g.r(52,34,8,1,'#6e3a22');
  win(g,14,64,40,24,{});for(let x=0;x<44;x++){const c=Math.floor(x/6)%2?'#ffffff':'#6fe0c8';g.r(12+x,56,1,8,c)}for(let x=12;x<56;x+=6)g.disc(x+3,64,3,Math.floor((x-12)/6)%2?'#ffffff':'#6fe0c8');g.r(12,56,44,1,'#1f8a85');
  door(g,66,66,18,36,'#3fae4c');win(g,88,68,12,14,{box:1});
  g.r(60,50,2,8,'#2b2145');g.r(60,50,12,2,'#2b2145');g.disc(68,60,4,'#f0a0ff');g.r(64,56,8,2,'#c070e0');g.line(72,60,75,57,'#f0a0ff');g.r(67,55,2,1,'#c070e0');
  stones(g,4,100,104,8,STONE.lav,7,4)}};
P.b_bakery={w:112,h:116,building:1,cat:'trade',label:'Hearth & Crust (bakery)',lights:[[95,96,34,'#ff9a3c'],[30,78,30],[48,34,18]],fn:g=>{
  plaster(g,8,8,80,98,15);clipAbove(g,0,96,x=>roofTop(x,48,4,44/48)+6);
  sharpRoof(g,0,96,4,48,12,ROOF.red,'tiles',3);
  g.disc(48,34,5,'#6e3a22');g.disc(48,34,3.6,'#ffd36a');g.r(47,30,2,8,'#6e3a22');
  g.disc(96,92,15,'#a8483a');g.disc(95,90,13,'#c86a4a');for(let y=80;y<106;y+=4)for(let x=82;x<110;x+=6)g.r(x+(y%8?3:0),y,4,1,'#a8483a');g.r(82,104,28,4,'#8a3a2a');g.rr(88,92,14,10,'#2b2145',2);g.r(90,96,10,6,'#ff7a2a');g.r(92,97,6,3,'#ffd36a');g.r(92,70,6,10,'#8a3a2a');g.r(91,68,8,2,'#5e3220');
  win(g,12,66,36,22,{});[[20,80],[30,82],[40,80],[24,74],[36,74]].forEach(([x,y])=>{g.ell(x,y,4,2.4,'#c8803a');g.ell(x-1,y-1,2.4,1.2,'#f0b060')});g.r(10,88,40,3,'#7a4526');
  door(g,56,70,18,36,'#7a4526');g.r(54,66,22,4,'#5e3220');
  g.r(60,52,2,8,'#2b2145');g.r(60,52,12,2,'#2b2145');g.disc(68,62,4.5,'#c8803a');g.disc(68,62,2.5,'#f4e6c8');g.disc(66,60,1.4,'#f4e6c8');g.disc(70,60,1.4,'#f4e6c8');
  [[4,98],[14,100]].forEach(([x,y])=>{g.ell(x+4,y+4,4.5,4,'#e8d4b0');g.r(x+3,y-1,3,2,'#c8b08a')});stones(g,4,104,86,8,STONE.warm,9,4)}};
P.b_alchemist={w:112,h:148,building:1,cat:'craft',label:'The Bubbling Flask (alchemist)',lights:[[56,72,24,'#7fe36a'],[56,104,24,'#ff79c8'],[18,108,22,'#7fe3ff'],[94,126,30,'#7fe36a']],fn:g=>{
  stones(g,30,40,52,100,STONE.lav,27,6);g.r(30,40,6,100,'#d8d0e8');g.r(76,40,6,100,'#5e5878');
  g.poly([[24,46],[52,12],[60,6],[72,1],[70,6],[64,14],[88,46]],ROOF.plum[1]);g.poly([[56,10],[64,14],[88,46],[56,46]],ROOF.plum[2]);g.line(24,46,52,12,ROOF.plum[0]);g.line(52,12,60,6,ROOF.plum[0]);g.r(22,44,68,4,ROOF.plum[3]);for(let y=20;y<44;y+=6)g.line(28+(44-y)*.4,y,84-(44-y)*.6,y,ROOF.plum[2]);g.disc(72,2,1.5,'#ffd84a');
  [[50,62,'#7fe36a'],[50,94,'#ff79c8']].forEach(([x,y,c])=>{g.r(x-2,y-2,16,22,'#5e5878');g.r(x,y,12,18,'#2b2145');g.r(x,y+12,12,6,mix(c,'#2b2145',.4));[[x+2,c],[x+6,'#ffd84a'],[x+9,'#7fe3ff']].forEach(([fx,fc])=>{g.r(fx,y+8,2,4,fc);g.p(fx,y+7,'#ffffff')});g.r(x,y,12,1,'#8a82a0')});
  plaster(g,4,86,30,54,5);for(let i=0;i<40;i++)g.p(4+hs(i,51)*30|0,86+hs(i,52)*54|0,'#d8e8c8');
  const tmp=G(40,40);sharpRoof(tmp,0,40,4,22,8,ROOF.plum,'tiles',2);g.img(tmp,0,70);g.r(24,62,4,14,'#5a5f7a');[[26,56,4],[29,48,5],[25,40,6]].forEach(([x,y,r])=>{g.disc(x,y,r,'#b8f57a');g.disc(x-1,y-1,r-1.5,'#e8ffc0')});
  win(g,10,100,16,16,{});g.r(14,106,3,6,'#7fe3ff');g.r(19,108,3,4,'#ff79c8');door(g,40,112,16,28,'#5a2aa8');
  g.r(84,62,2,8,'#2b2145');g.r(84,62,14,2,'#2b2145');g.r(88,70,10,12,'#d8d0e8');g.r(91,66,4,4,'#d8d0e8');g.r(89,75,8,6,'#7fe36a');
  g.ell(94,132,12,5,'#3e3848');g.r(83,124,22,10,'#3e3848');g.ell(94,124,11,3,'#5e5668');g.ell(94,124,9,2,'#7fe36a');[[90,121],[97,120],[94,118]].forEach(([x,y])=>{g.disc(x,y,1.6,'#b8f57a');g.p(x,y-1,'#e8ffc0')});
  stones(g,2,138,108,8,STONE.dark,5,4)}};
P.b_nursery={w:128,h:104,building:1,cat:'craft',label:'Greenbriar Nursery',lights:[[52,64,40,'#b8f57a']],fn:g=>{
  const F=['#6fe0c8','#2aa898','#1a6a6a'];
  g.r(8,36,90,56,'#bfe8ec');for(let i=0;i<14;i++){const x=12+i*6,h=6+hs(i,61)*14|0;g.r(x,90-h,4,h,i%3?'#3fae4c':'#5ccc55');g.disc(x+2,90-h,3,i%2?'#3eae4c':'#8ef06a');if(i%3===0){g.p(x+1,88-h,'#ff79a8');g.p(x+2,87-h,'#ffd84a')}}
  g.x.globalAlpha=.35;g.r(10,38,88,52,'#e8fbff');g.x.globalAlpha=1;
  for(let x=8;x<=98;x+=15)g.r(x,36,2,56,F[1]);g.r(8,62,90,2,F[1]);g.r(8,36,90,2,F[1]);g.r(8,90,90,2,F[2]);for(let i=0;i<6;i++)g.line(13+i*15,40,19+i*15,46,'#ffffff');
  const tmp=G(100,40);sharpRoof(tmp,0,100,4,30,6,F,'glass',1);g.img(tmp,3,8);
  sh(g,98,52,28,40,WD);for(let x=101;x<124;x+=5)g.r(x,52,1,40,'#5e3220');sharpRoofSmall(g,96,30,32);door(g,104,64,14,28,'#7a4526');
  [[14,98],[30,98],[46,98],[110,98]].forEach(([x,y],i)=>{g.r(x,y-6,10,7,'#c86a4a');g.r(x,y-6,10,1,'#e88a6a');g.disc(x+5,y-10,4,i%2?'#3eae4c':'#5ccc55');g.p(x+4,y-12,['#ff79a8','#ffd84a','#fff6e8','#b766ff'][i])});
  g.r(60,94,30,8,'#c98a4a');g.r(60,94,30,1,'#f0b26a');g.r(63,96,24,1,'#5e3220');g.r(63,98,16,1,'#5e3220')}};
P.b_training={w:144,h:124,building:1,cat:'civic',label:'Militia Training Hall',lights:[[72,60,22]],fn:g=>{
  sideRoof(g,0,4,144,44,ROOF.slate);
  plaster(g,8,48,128,22,3);for(let x=8;x<=132;x+=16)g.r(x,48,3,22,'#5e3220');g.r(8,48,128,2,'#3a2214');g.r(8,68,128,3,'#3a2214');
  stones(g,6,70,132,46,STONE.warm,37,6);
  [26,46,98,118].forEach(x=>{g.r(x,80,3,12,'#2b2145');g.r(x-1,79,5,1,'#7a7068')});
  g.r(54,76,36,40,'#3e3848');door(g,56,80,16,36,'#7a4526',{bands:1});door(g,72,80,16,36,'#7a4526',{bands:1});g.r(52,74,40,3,'#d8ccc0');
  g.poly([[64,52],[80,52],[80,62],[72,68],[64,62]],'#d63447');g.line(64,52,80,52,'#ffd84a');g.line(66,54,78,64,'#e8eef8');g.line(78,54,66,64,'#e8eef8');
  [[30,50],[110,50]].forEach(([x,y])=>{g.r(x-1,y,10,1,'#3a2214');g.r(x,y+1,8,26,'#d63447');g.r(x,y+1,1,26,'#ff6a6a');g.poly([[x,y+27],[x+4,y+31],[x+8,y+27]],'#d63447');g.line(x+4,y+6,x+4,y+20,'#e8eef8');g.r(x+2,y+17,5,1,'#ffd84a')});
  g.r(4,116,136,4,'#7a7068');g.r(4,116,136,1,'#a8a098')}};
P.b_stables={w:128,h:104,building:1,cat:'trade',label:'Stables',lights:[[64,34,20]],fn:g=>{
  const R=['#e8604a','#c84a3a','#8a2a2a'];
  sideRoof(g,0,6,128,38,['#a87a5a','#7a5a3a','#5e4228','#3e2a18']);
  sh(g,6,44,116,56,R);for(let x=10;x<120;x+=6)g.r(x,44,1,56,R[2]);g.r(6,44,116,2,'#5e3220');
  g.r(54,22,20,16,'#5e3220');g.r(56,24,16,14,'#3a2214');g.ell(64,34,7,4,'#f0c870');g.ell(63,32,5,3,'#ffe08a');
  [[12,58],[49,58],[86,58]].forEach(([x,y],i)=>{g.r(x,y,30,40,'#ffffff');g.r(x+2,y+2,26,36,R[1]);g.line(x+2,y+20,x+28,y+38,'#ffffff');g.line(x+28,y+20,x+2,y+38,'#ffffff');g.r(x,y+19,30,2,'#ffffff');if(i!==1)g.r(x+2,y+2,26,17,'#2b2145')});
  g.r(16,62,10,9,'#8a5a3a');g.r(14,66,4,6,'#8a5a3a');g.r(20,60,3,3,'#5e3a22');g.p(17,64,'#1a1230');g.r(24,62,3,11,'#5e3a22');
  g.r(94,64,7,6,'#efe6cf');g.r(92,66,4,5,'#efe6cf');g.p(94,66,'#1a1230');g.r(99,62,3,8,'#a8906a');
  g.r(2,98,124,4,'#6e5a40')}};
P.c_wall={w:64,h:96,building:1,cat:'castle',label:'Castle wall (tiles in x)',fn:g=>{
  for(let x=0;x<64;x+=16){stones(g,x,4,12,18,STONE.lav,x+1,6);g.r(x,4,12,2,'#e8e0f8')}
  stones(g,0,20,64,70,STONE.lav,43,8);g.r(0,20,64,4,'#5e5878');g.r(0,24,64,1,'#8a82a0');
  g.r(30,40,4,16,'#1a1230');g.r(28,46,8,4,'#1a1230');g.r(29,39,6,1,'#d8d0e8');
  g.r(0,84,64,8,'#5e5878');for(let x=0;x<64;x+=3)g.r(x,82+(hs(x,71)*4|0),2,4,'#4fa36a');g.r(0,90,64,4,'#3e3848')}};
P.c_tower={w:72,h:152,building:1,cat:'castle',label:'Castle tower',lights:[[36,74,20],[36,104,20]],fn:g=>{
  g.r(35,1,2,20,'#5e3220');g.poly([[37,2],[53,6],[37,10]],'#3f74d9');g.line(37,6,49,6,'#ffd84a');
  stones(g,10,44,52,104,STONE.lav,59,7);for(let y=44;y<148;y++){g.r(10,y,5,1,'#cfc6e0');g.r(55,y,7,1,'#6a6290')}
  for(let x=6;x<66;x+=12){stones(g,x,34,8,12,STONE.lav,x,6);g.r(x,34,8,1,'#e8e0f8')}g.r(6,44,60,3,'#5e5878');
  g.poly([[4,36],[36,10],[68,36]],ROOF.blue[1]);g.poly([[36,10],[68,36],[36,36]],ROOF.blue[2]);for(let y=16;y<36;y+=5){const hw=(y-10)*32/26;g.r(Math.round(36-hw),y,Math.round(hw*2),1,ROOF.blue[2])}g.line(4,36,36,10,ROOF.blue[0]);g.r(4,35,64,2,ROOF.blue[3]);
  [[33,66],[33,96]].forEach(([x,y])=>{g.r(x,y,6,14,'#2b2145');g.r(x+1,y+1,4,12,'#ffd36a');g.r(x,y,6,1,'#d8d0e8')});
  g.r(26,120,20,28,'#3e3848');door(g,28,122,16,26,'#7a4526',{bands:1});g.r(24,118,24,3,'#d8d0e8')}};
P.c_gate={w:160,h:152,building:1,cat:'castle',label:'Gatehouse',lights:[[24,92,26],[136,92,26],[80,128,40,'#ffb347']],fn:g=>{
  stones(g,44,52,72,96,STONE.lav,77,7);for(let x=44;x<116;x+=12){stones(g,x,40,8,12,STONE.lav,x+9,6);g.r(x,40,8,1,'#e8e0f8')}g.r(44,52,72,3,'#5e5878');
  g.r(56,80,48,68,'#0d0a1e');for(let i=0;i<14;i++){const a=Math.PI*(1-i/13),x=80+Math.cos(a)*26,y=84-Math.sin(a)*18;g.r(Math.round(x)-4,Math.round(y)-4,8,8,i%2?'#b8b0c8':'#d8d0e8')}
  for(let x=58;x<104;x+=6)g.r(x,72,2,56,'#5a5f7a');for(let y=78;y<128;y+=8)g.r(58,y,46,2,'#5a5f7a');for(let x=58;x<104;x+=6)g.r(x,128,2,4,'#8a90a8');
  [[62,56],[90,56]].forEach(([x,y])=>{g.r(x,y,10,22,'#3f74d9');g.r(x,y,10,2,'#ffd84a');g.r(x+4,y+6,2,10,'#ffd84a');g.r(x+2,y+10,6,2,'#ffd84a');g.poly([[x,y+22],[x+5,y+26],[x+10,y+22]],'#3f74d9')});
  [[0,'#3f74d9'],[112,'#d63447']].forEach(([x0,flag])=>{stones(g,x0+4,40,40,108,STONE.lav,x0+3,7);for(let y=40;y<148;y++){g.r(x0+4,y,4,1,'#cfc6e0');g.r(x0+38,y,6,1,'#6a6290')}for(let x=x0;x<x0+48;x+=12){stones(g,x,28,8,12,STONE.lav,x+5,6);g.r(x,28,8,1,'#e8e0f8')}g.r(x0,40,48,3,'#5e5878');g.r(x0+22,1,2,27,'#5e3220');g.poly([[x0+24,2],[x0+40,6],[x0+24,10]],flag);g.r(x0+20,64,6,12,'#1a1230');g.r(x0+21,63,4,1,'#d8d0e8');g.r(x0+20,86,8,12,'#2b2145');g.r(x0+21,87,6,10,'#ffd36a')});
  [[48,100],[108,100]].forEach(([x,y])=>{g.r(x,y,4,8,'#5a5f7a');g.disc(x+2,y-2,2.6,'#ff7a2a');g.p(x+2,y-3,'#ffd36a')})}};
P.c_keep={w:160,h:176,building:1,cat:'castle',label:'Castle keep',lights:[[48,98,20],[112,98,20],[80,60,22],[80,140,30]],fn:g=>{
  stones(g,16,56,128,116,STONE.lav,91,8);g.r(16,56,6,116,'#d8d0e8');g.r(138,56,6,116,'#5e5878');
  for(let x=12;x<148;x+=14){stones(g,x,44,9,14,STONE.lav,x+2,6);g.r(x,44,9,1,'#e8e0f8')}g.r(12,56,136,3,'#5e5878');
  [[8,'#d63447'],[124,'#3f74d9']].forEach(([x0,fc])=>{stones(g,x0,20,28,152,STONE.lav,x0+7,7);for(let x=x0-2;x<x0+30;x+=10){stones(g,x,10,7,12,STONE.lav,x+1,5);g.r(x,10,7,1,'#e8e0f8')}g.r(x0-2,22,32,2,'#5e5878');g.r(x0+13,1,2,9,'#5e3220');g.poly([[x0+15,2],[x0+26,5],[x0+15,8]],fc);[[x0+11,40],[x0+11,76],[x0+11,112]].forEach(([x,y])=>{g.r(x,y,6,12,'#2b2145');g.r(x+1,y+1,4,10,'#ffd36a')})});
  g.disc(80,58,8,'#d8d0e8');g.disc(80,58,6,'#2b2145');g.disc(80,58,4.6,'#ffd36a');g.r(79,53,2,10,'#2b2145');g.r(75,58,10,1,'#2b2145');
  [[40,88],[104,88]].forEach(([x,y])=>{g.r(x,y,16,22,'#2b2145');g.r(x+2,y+2,12,18,'#ffd36a');g.r(x+7,y+2,2,18,'#2b2145');g.r(x+2,y+10,12,2,'#2b2145')});
  [[58,72],[90,72]].forEach(([x,y])=>{g.r(x,y,12,36,'#d63447');g.r(x,y,12,2,'#ffd84a');g.disc(x+6,y+14,3,'#ffd84a');g.poly([[x,y+36],[x+6,y+41],[x+12,y+36]],'#d63447')});
  g.r(60,124,40,48,'#3e3848');door(g,62,128,18,44,'#7a4526',{bands:1});door(g,80,128,18,44,'#7a4526',{bands:1});for(let i=0;i<12;i++){const a=Math.PI*(1-i/11),x=80+Math.cos(a)*22,y=128-Math.sin(a)*10;g.r(Math.round(x)-3,Math.round(y)-3,6,6,'#d8d0e8')}
  g.r(52,170,56,4,'#d8d0e8')}};
P.v_dummy={w:28,h:50,fn:g=>{g.r(13,22,3,26,'#7a4526');g.r(4,24,20,3,'#7a4526');g.ell(14,32,7,9,'#d9a850');g.ell(13,30,5,7,'#f0c870');g.r(7,34,14,2,'#a8762a');g.disc(14,15,6,'#e8d4b0');g.line(10,13,18,17,'#d63447');g.line(18,13,10,17,'#d63447');g.r(4,47,20,2,'#5e3220');for(let i=0;i<6;i++)g.p(3+hs(i,81)*22|0,22+hs(i,82)*6|0,'#f0c870')}};
P.v_weapon_rack={w:40,h:42,fn:g=>{[3,33].forEach(x=>{g.r(x,6,4,34,'#7a4526');g.r(x,6,1,34,'#a9622f')});g.r(2,10,36,3,'#a9622f');g.r(2,30,36,3,'#a9622f');[[11,'#d3ddff'],[17,'#b9c6e0'],[23,'#d3ddff']].forEach(([x,c])=>{g.r(x,3,2,29,c);g.r(x-2,26,6,2,'#f0a823');g.r(x,28,2,6,'#5e3220')});g.r(28,5,2,31,'#8a5a3a');g.poly([[27,5],[31,5],[29,1]],'#d3ddff')}};
P.v_target={w:32,h:44,fn:g=>{g.line(8,40,14,20,'#7a4526');g.line(24,40,18,20,'#7a4526');g.disc(16,17,13,'#ffffff');g.disc(16,17,10.5,'#d63447');g.disc(16,17,7.5,'#ffffff');g.disc(16,17,5,'#d63447');g.disc(16,17,2.4,'#ffd84a');g.line(20,13,27,6,'#a9622f');g.p(28,5,'#ffffff');g.p(27,4,'#ff5a6a')}};
P.v_cafe_table={w:40,h:36,fn:g=>{g.r(18,14,3,18,'#5a5f7a');g.r(12,32,15,2,'#5a5f7a');g.ell(19.5,12,12,4,'#ffffff');g.ell(19.5,11,12,3,'#f8e0e8');g.r(16,7,4,4,'#ffffff');g.p(20,8,'#ffffff');g.disc(24,9,2,'#f0a0ff');[[2,'#6fe0c8'],[34,'#6fe0c8']].forEach(([x,c])=>{g.r(x,18,5,3,c);g.r(x+(x<10?0:4),10,1,10,c);g.r(x+1,21,1,12,'#5a5f7a');g.r(x+3,21,1,12,'#5a5f7a')})}};
P.v_trough={w:44,h:22,fn:g=>{g.r(2,6,40,12,'#8a5a3a');g.r(2,6,40,2,'#a87a5a');g.r(4,8,36,4,'#2a96d8');g.r(4,8,36,1,'#7fd8f8');[4,36].forEach(x=>g.r(x,18,4,3,'#5e3a22'))}};

/* ---------- vignettes (composed scenes, shown in the sheet) ---------- */
function compose(w,h,ground,props,grade,lights){const g=G(w,h);for(let ty=0;ty<h/32;ty++)for(let tx=0;tx<w/32;tx++){const n=ground(tx,ty);if(n)g.img(MV.frames(n)[0],tx*32,ty*32)}
  const shadow=(x,y,rw)=>{g.x.fillStyle='rgba(20,12,48,.3)';g.x.beginPath();g.x.ellipse(x,y,rw,rw*.32,0,0,6.29);g.x.fill()};
  props.map(([n,x,y])=>({n,x,y,f:MV.frames(n)[0]})).sort((a,b)=>(a.y+a.f.height)-(b.y+b.f.height)).forEach(p=>{if(!P[p.n].building&&!/wall|tile/.test(p.n))shadow(p.x+p.f.width/2,p.y+p.f.height-3,p.f.width*.42);if(/^[a-z]+_?char:/.test(p.n))return;g.img(p.f,p.x,p.y)});
  if(grade){g.x.globalCompositeOperation='multiply';g.x.fillStyle=grade;g.x.fillRect(0,0,w,h);g.x.globalCompositeOperation='lighter';
    props.forEach(([n,x,y])=>(P[n]&&P[n].lights||[]).forEach(([dx,dy,r,c])=>{const gr=g.x.createRadialGradient(x+dx,y+dy,0,x+dx,y+dy,r);gr.addColorStop(0,c||'#ffb347');gr.addColorStop(1,'rgba(0,0,0,0)');g.x.globalAlpha=.55;g.x.fillStyle=gr;g.x.fillRect(x+dx-r,y+dy-r,r*2,r*2)}));(lights||[]).forEach(([x,y,r,c])=>{const gr=g.x.createRadialGradient(x,y,0,x,y,r);gr.addColorStop(0,c);gr.addColorStop(1,'rgba(0,0,0,0)');g.x.globalAlpha=.5;g.x.fillStyle=gr;g.x.fillRect(x-r,y-r,r*2,r*2)});g.x.globalAlpha=1;g.x.globalCompositeOperation='source-over'}
  return g}
const pathAt=(fn)=>(tx,ty)=>{const c=(x,y)=>fn(x,y)?1:0;return(c(tx,ty)<<3)|(c(tx+1,ty)<<2)|(c(tx,ty+1)<<1)|c(tx+1,ty+1)};
P.vg_village={w:512,h:320,tile:1,fn:g=>{const road=(x,y)=>(y>=6&&y<=7)||(x>=7&&x<=8&&y<=7),pond=(x,y)=>(x-13.5)**2+(y-8.6)**2*1.6<7;const pm=pathAt(road),wm=pathAt(pond);
  g.img(compose(512,320,(tx,ty)=>{const w=wm(tx,ty);if(w)return'v_water_'+w;const m=pm(tx,ty);return m?'v_path_'+m:['v_grass_0','v_grass_1','v_grass_2','v_flowers_0','v_grass_3','v_grass_1'][(tx*7+ty*3)%6]},
  [['b_inn',20,8],['b_smithy',300,20],['b_house_stone',30,206],['b_stall',176,200],['v_well',300,196],['v_lamp',220,148],['v_lamp',330,148],['v_noticeboard',176,130],['v_haystack',140,280],['v_cart',372,160],['v_fence_h',448,180],['v_fence_h',480,180],['v_hedge',220,286],['v_flowerbed',260,290],['v_barrels',190,120],['v_waystone',470,232],['v_bench',140,230],['prop_tree',440,-30],['prop_tree_b',470,260]],null))}};
P.vg_forest={w:512,h:320,tile:1,fn:g=>{const road=(x,y)=>Math.abs(y-5-Math.sin(x/2.5)*1.2)<1.3;const pm=pathAt(road);
  g.img(compose(512,320,(tx,ty)=>{const m=pm(tx,ty);return m?'f_path_'+m:['f_floor_0','f_floor_1','f_leaves','f_floor_0','f_roots'][(tx*5+ty*7)%5]},
  [['f_gloamtree',10,-20],['f_gloamtree',360,150],['f_pine',180,-10],['f_pine',470,-20],['f_deadtree',280,-10],['f_ruin_arch',150,190],['f_runestone',420,40],['f_mushrooms',100,120],['f_mushrooms',330,260],['f_toadstool',260,120],['f_fern',60,250],['f_fern',300,90],['f_log',40,280],['f_stump',250,280],['f_bramble',460,120]],'#a4aae8',[[120,130,50,'#2de2c4']]))}};
P.vg_abbey={w:512,h:320,tile:1,fn:g=>{const flood=(x,y)=>(x-9)**2/9+(y-7.4)**2/3<1.4;const fm=pathAt(flood);
  g.img(compose(512,320,(tx,ty)=>{if(ty===0)return'd_wall_top';if(ty===1)return['d_wall','d_wall_moss','d_wall_crack','d_wall','d_wall_moss'][tx%5];if(ty===2)return['d_wall_moss','d_wall','d_wall_moss'][tx%3];const m=fm(tx,ty);if(m)return'd_flood_'+m;if(tx>=7&&tx<=8&&ty>=3&&ty<=6)return'd_mosaic';return(tx+ty)%3?'d_floor_a':'d_floor_b'},
  [['d_arch',208,0],['d_pillar',120,60],['d_pillar',360,60],['d_sconce',176,40],['d_sconce',320,40],['d_candelabra',60,140],['d_crystal',450,110],['d_altar',228,108],['d_pew',60,220],['d_pew',400,220],['d_bell',230,232],['d_chest_rare',440,180],['d_chest',30,180],['d_kelp',300,250],['d_kelp',180,262],['d_bones',140,280]],'#b0b0ec'))}};
if(__root.dispatchEvent&&typeof CustomEvent!=='undefined')__root.dispatchEvent(new CustomEvent('mvready',{detail:'tiles.js'}));})();
