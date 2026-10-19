/* Medival — pixel art library. All art authored in code at 1x (1 texel = 1 logical px on the 1280x720 canvas). */
(function(){
const root = typeof window!=='undefined'?window:globalThis;
const INK='#1a1230';
function mk(w,h){let c;if(typeof document!=='undefined'&&document.createElement)c=document.createElement('canvas');else c=createCanvas(w,h);c.width=w;c.height=h;return c;}
function rng(s){return()=>{s|=0;s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function G(w,h){
  const c=mk(w,h),x=c.getContext('2d');x.imageSmoothingEnabled=false;const g={c,x,w,h};
  g.p=(px,py,col)=>{if(!col)return;x.fillStyle=col;x.fillRect(Math.round(px),Math.round(py),1,1)};
  g.r=(rx,ry,rw,rh,col)=>{x.fillStyle=col;x.fillRect(rx,ry,rw,rh)};
  g.line=(x0,y0,x1,y1,col)=>{x0=Math.round(x0);y0=Math.round(y0);x1=Math.round(x1);y1=Math.round(y1);const dx=Math.abs(x1-x0),dy=-Math.abs(y1-y0),sx=x0<x1?1:-1,sy=y0<y1?1:-1;let e=dx+dy;for(let n=0;n<400;n++){g.p(x0,y0,col);if(x0===x1&&y0===y1)break;const e2=2*e;if(e2>=dy){e+=dy;x0+=sx}if(e2<=dx){e+=dx;y0+=sy}}};
  g.ell=(cx,cy,rx,ry,col,clear)=>{for(let y=Math.floor(cy-ry-1);y<=Math.ceil(cy+ry+1);y++)for(let xx=Math.floor(cx-rx-1);xx<=Math.ceil(cx+rx+1);xx++){const v=((xx-cx)/(rx+.4))**2+((y-cy)/(ry+.4))**2;if(v<=1){if(clear)x.clearRect(xx,y,1,1);else g.p(xx,y,col)}}};
  g.disc=(cx,cy,r,col)=>g.ell(cx,cy,r,r,col);
  g.cdisc=(cx,cy,r)=>g.ell(cx,cy,r,r,null,true);
  g.poly=(pts,col)=>{let a=1e9,b=-1e9;pts.forEach(p=>{a=Math.min(a,p[1]);b=Math.max(b,p[1])});x.fillStyle=col;for(let y=Math.floor(a);y<=Math.ceil(b);y++){const yy=y+.5,xs=[];for(let i=0;i<pts.length;i++){const P=pts[i],Q=pts[(i+1)%pts.length];if((P[1]<=yy&&Q[1]>yy)||(Q[1]<=yy&&P[1]>yy))xs.push(P[0]+(yy-P[1])/(Q[1]-P[1])*(Q[0]-P[0]))}xs.sort((m,n)=>m-n);for(let i=0;i+1<xs.length;i+=2){const s=Math.round(xs[i]),e=Math.round(xs[i+1]);if(e>s)x.fillRect(s,y,e-s,1)}}};
  g.band=(x0,y0,len,dx,dy,spec)=>{for(let i=0;i<len;i++)spec.forEach(s=>g.p(x0+dx*i+s[0],y0+dy*i+s[1],s[2]))};
  g.grid=(rows,pal,ox=0,oy=0)=>{rows.forEach((row,y)=>{for(let i=0;i<row.length;i++){const ch=row[i];if(ch==='.'||ch===' ')continue;const col=pal[ch];if(col)g.p(ox+i,oy+y,col)}})};
  g.img=(src,dx=0,dy=0)=>x.drawImage(src.c||src,dx,dy);
  g.rr=(rx,ry,rw,rh,col,r)=>{const ins=[[],[1],[2,1],[3,1,1]][r||0];for(let j=0;j<rh;j++){const i=Math.min(j,rh-1-j);const s=i<ins.length?ins[i]:0;g.r(rx+s,ry+j,rw-2*s,1,col)}};
  return g;
}
function outline(c,col=INK){const x=c.getContext('2d'),w=c.width,h=c.height,a=x.getImageData(0,0,w,h).data;const o=i=>a[i*4+3]>40;x.fillStyle=col;for(let y=0;y<h;y++)for(let xx=0;xx<w;xx++){const i=y*w+xx;if(o(i))continue;if((xx>0&&o(i-1))||(xx<w-1&&o(i+1))||(y>0&&o(i-w))||(y<h-1&&o(i+w)))x.fillRect(xx,y,1,1)}return c}
function hex(h){h=h.replace('#','');return[parseInt(h.slice(0,2),16),parseInt(h.slice(2,4),16),parseInt(h.slice(4,6),16)]}
function mix(a,b,t){const A=hex(a),B=hex(b);return'#'+A.map((v,i)=>Math.round(v+(B[i]-v)*t).toString(16).padStart(2,'0')).join('')}

/* ---------- PALETTE (mirrors medival-tokens.json) ---------- */
const T={
  ink:INK,
  rarity:{common:'#e6e9f5',fine:'#5fe06a',ember:'#3fa9ff',runed:'#b766ff',wrought:'#ff9a2e',spark:'#ff4a4a',sparkGold:'#ffd23f'},
  school:{ash:'#ff6a2a',rime:'#7fe3ff',storm:'#ffe14a',radiance:'#ffd96b',umbral:'#a35cff',verdant:'#4fd86a',blade:'#e8eef8',iron:'#c09070',fist:'#ff8a5a',hunt:'#d9b45a',guile:'#ff5a8a',song:'#f0a0ff'},
};

/* ---------- CHARACTERS (32x40 frames; art grid 32 wide, rows 0-35, drawn at oy=2) ---------- */
const BASE={k:INK,s:'#ffe0bd',S:'#f7b48a',d:'#d9805f',b:'#ff8a9e',w:'#ffffff'};
const FACE=[
".......HhsssssssssssssSHH.......",
".......HhsswksssssswksSHH.......",
".......HhsskksssssskksSHH.......",
".......HhsskksssssskksSHH.......",
".......HhsbbssssssssbbSHH.......",
".......HhssssssddsssssSHH.......",
"........HSsssssssssssSSH........",
"..........SSsssssssSSS.........."];
const FEET={idle:["..........NNnn....NNnn..........","..........nnnn....nnnn.........."],
  a:["..........NNnn....nnnn..........","..........nnnn.................."],
  b:["..........nnnn....NNnn..........","..................nnnn.........."]};
const ROBE_SIDE=".......rRqrRRRRyyRRRRRqqq.......";
const CHARS={
 hollowed:{w:32,h:40,ox:0,oy:2,label:'Hollowed villager',
  pal:{k:INK,s:'#c3cde0',S:'#949fbd',d:'#6b7494',h:'#5e5c7e',H:'#3c3a5c',e:'#f4a6ff',E:'#b84dff',w:'#f4a6ff',t:'#6fb59c',T:'#4f8f7f',j:'#2f5f5a',O:'#8a5a3a',o:'#c08a5a',N:'#949fbd',n:'#6b7494',b:'#c3cde0'},
  top:[
"................................",
"................................",
"................................",
"................................",
"............hhhhhhHH............",
"..........hhhhhhhhhHHH..........",
".........hhhhhhhhhhhHHH.........",
"........hhhhhhhhhhhhhHHH........",
"........HhhhhhhhhhhhhhHH........",
".......HhhhhhhhhhhhhhhhHH.......",
".......HHhhhhhhhhhhhhhHHH.......",
".......HHHHHHHHHHHHHHHHHH.......",
".......HhhShhSSSSShhShhhH.......",
".......HhsssssssssssssSHH.......",
".......HhsseesssssseesSHH.......",
".......HhssEEssssssEEsSHH.......",
".......HhsskssssssssksSHH.......",
".......HhsskssssssssksSHH.......",
".......HhsskssskksssksSHH.......",
"........HSsssssssssssSSH........",
"..........SSsssssssSSS..........",
".........ttttddddddTTjj.........",
".........ttTTTTTTTTTTjj.........",
".......sSjtTTTTTTTTTTTjSd.......",
".......sSjtTTOOTTTTTTTjSd.......",
".......sSjtTTOOTTTTTTTjSd.......",
".......sSjtTTTTTTTTTTTjSd.......",
".......sSjOoOoOoOoOoOojSd.......",
".......SSjtTTTTTTTTTTTjdd.......",
".......SdjtTTTTTTTTTTTjdd.......",
"......SSdjtTTTTTTTTTTTjSdd......",
"......d.djTT.TTTTT.TTTjd.d......",
".........jT.jTj.jTTj.Tj.........",
"...........Sd......Sd..........."],
  feet:FEET},
 wolf:{w:36,h:24,ox:2,oy:2,label:'Gloamwood wolf',
  pal:{k:INK,a:'#d6defa',b:'#8f9bd0',c:'#5d669e',C:'#3b4170',e:'#ffe14a',m:'#ff8fb0',t:'#36e0c8'},
  top:[
".......c...c....................",
".......bc..bc...................",
"......bmbc.bmbc.................",
".....aabbbbbbbbc............bc..",
"....aaabbbbbbbbbc..........abbc.",
"...aaabbbbbbbbbbc..........abbc.",
"..aaaeebbbbbbbbbc.........abbc..",
"kaaaakebbbbbbbbbc........abbc...",
"kaaaaabbbbbbbbbbc......aabbc....",
".ccccaabbbbbbbbbbbbbbbbbbbc.....",
"..caaaabbbbbbbbbbbtttbbbbbc.....",
"...caaaabbbbbbbbbtttbbbbbbc.....",
"....caaaabbbbbbbbbbbbbbbbc......",
".....cbaaaaaaaaaaaaaaaabbc......",
"......cccccccccccccccccccc......"],
  feet:{idle:["......abc.cc.......cc.abc.......","......abc.cc.......cc.abc.......","......CCC.CC.......CC.CCC......."],
   a:[".....abc...cc.....cc...abc......","....abc.....cc...cc.....abc.....","....CCC.....CC...CC.....CCC....."],
   b:[".......abccc.......ccabc........",".......abcc.........cabc........",".......CCCC.........CCCC........"]}}
};
function charFrame(def,dy,feet){
  const g=G(def.w,def.h),body=G(def.w,def.h),n=def.top.length;
  body.grid(def.top,def.pal,def.ox,def.oy+dy);
  if(dy<0)body.grid([def.top[n-1]],def.pal,def.ox,def.oy+n-1);
  body.grid(def.feet[feet],def.pal,def.ox,def.oy+n);
  outline(body.c);
  const L=(def.layers||[]).map(l=>{const lg=G(def.w,def.h);lg.grid(l.rows,def.pal,def.ox+l.x,def.oy+l.y+dy);outline(lg.c);return[l.z||1,lg]});
  L.filter(l=>l[0]<0).forEach(l=>g.img(l[1]));g.img(body);L.filter(l=>l[0]>0).forEach(l=>g.img(l[1]));
  return g.c;
}

/* ---------- HERO COMPOSER: shared head + swappable hair/eyes/mouth/marks + class gear layers ---------- */
const SKINS=[['#ffeede','#f9c9ad','#dc9c84','#ff9aaa'],['#ffe0bd','#f7b48a','#d9805f','#ff8a9e'],['#f2c48e','#d99a62','#ad6a3c','#f07a7a'],['#c98a5a','#a8653a','#7a4226','#e0707e'],['#8e5c3c','#6e4228','#4a2a18','#c05a6a']];
const HAIRC=[['#c47a44','#8a4b2a','#5a2e1a'],['#ff9a3c','#d0622a','#9a3a1a'],['#ffe27a','#e0b03a','#a87a1e'],['#55558a','#2e2e58','#1a1a3a'],['#ffffff','#d3ddf0','#9aa6c8'],['#ff9ad0','#e060a8','#a83a7a'],['#5ae0c8','#2aa898','#1a6a6a'],['#c08aff','#8a4ae0','#5a2aa8']];
const EYEC=[['#8a5a3a','#5a3420'],['#3fa9ff','#1f5fc4'],['#4fd86a','#1f8a45'],['#ffb02e','#c06a12'],['#b766ff','#6a2ac0'],['#ff4d5e','#a8123a']];
const LOOK={skin:['Porcelain','Peach','Honey','Umber','Deep'],hair:['Tousled','Long','Ponytail','Spiky','Bob','Braids','Cropped'],hc:['Chestnut','Ginger','Flax','Raven','Frost','Rose','Teal','Violet'],eyes:['Round','Wide','Sharp','Sleepy','Happy','Sparkle','Dot','Calm','Wink','Cat','Teary','Glare'],ec:['Hazel','Sky','Leaf','Amber','Violet','Ember'],mouth:['Smile','Grin','Stern','Smirk'],mark:['None','Freckles','Scar','Woad','Stubble','Beard'],brows:['None','Soft','Thick','Arched','Angry','Worried','Straight','Bushy','High','Unibrow','Raised','Split'],body:['Female','Male'],SKINS,HAIRC,EYEC};
const HEAD=["............ssssssss............","..........ssssssssssss..........",".........sssssssssssssS.........","........ssssssssssssssSS........",...Array(10).fill("........ssssssssssssssSS........"),".........sssssssssssssS.........","..........SSssssssssSS..........",".............dddddd............."];
const HEAD_M=[...HEAD.slice(0,14),"........ssssssssssssssSS........",".........SssssssssssSSS.........","............dddddddd............"];
const DOME=["............hhhhhhH.............","..........hhhhhhhhhHH...........",".........hhhhhhhhhhhHH..........","........hhhhhhhhhhhhhHH.........",".......hhhhhhhhhhhhhhhHH........",".......HhhhhhhhhhhhhhhHHj.......",".......HhhhhhhhhhhhhhhHHj.......",".......HHhhhhhhhhhhhhHHHj.......",".......jHHHHHHHHHHHHHHHHj......."];
const FR_T=[".......jHhhShhSSSShhShhHj.......",".......jHh.h..........hHj.......",".......jH..............Hj.......",".......jH..............Hj.......",".......jH..............Hj.......",".......jH..............Hj.......","........j..............j........"];
const FR_L=[".......jHhhhhhSSSShhhhhHj.......",".......jHhh..........hhHj.......",...Array(6).fill(".......jHh............hHj......."),...Array(3).fill("......jHh..............hHj......"),"......jjj..............jjj......"];
const FR_B=[".......jHhhhhhhhhhhhhhhHj.......",".......jHSSSSSSSSSSSSSSHj.......",...Array(6).fill(".......jHh............hHj......."),"........jHh..........hHj........",".........jj..........jj........."];
function hairPart(g,st,part,P,capped){
  if(part==='back'){if(st===1){g.r(7,18,18,11,P.H);g.r(7,18,18,1,P.h)}if(st===2){g.disc(25,10,2.6,P.H);g.r(24,11,4,9,P.H);g.r(26,11,2,9,P.j);g.disc(26,20,2,P.j);g.p(23,9,'#ff5a6a');g.p(24,9,'#ff5a6a')}return}
  if(part==='over'){if(st===5){for(let y=21;y<=31;y++){const c=y%2?P.h:P.H;g.r(6,y,2,1,c);g.r(24,y,2,1,c)}g.r(6,32,2,1,'#ff5a6a');g.r(24,32,2,1,'#ff5a6a');g.r(6,33,2,1,P.j);g.r(24,33,2,1,P.j)}return}
  if(st===6){g.grid(DOME.slice(2),{h:P.H,H:P.j,j:P.j},0,6);return}
  if(st===3&&!capped)[10,14,18,22].forEach((sx,i)=>{g.poly([[sx-2.5,7],[sx,1+(i%2)],[sx+2.5,7]],P.h);g.line(sx+1,3+(i%2),sx+2,6,P.H)});
  g.grid(DOME,P,0,4);
  g.grid(st===1||st===5?FR_L.slice(0,st===5?8:12):st===4?FR_B:st===2?FR_T.slice(0,5):FR_T,P,0,13);
}
const EYES=[[[11,16,["wk","ke","ee"]],[19,16,["wk","ke","ee"]]],[[10,16,["kkk","kwe","eee"]],[19,16,["kkk","kwe","eee"]]],[[10,16,["kk.",".ke"]],[19,16,[".kk","ek."]]],[[11,17,["kk","ew"]],[19,17,["kk","ew"]]],[[10,16,[".k.","k.k"]],[19,16,[".k.","k.k"]]],
 [[10,15,["kkk","wke","kew","eee"]],[19,15,["kkk","wke","kew","eee"]]],
 [[11,16,["kk","kk"]],[19,16,["kk","kk"]]],
 [[10,17,["kkk"]],[19,17,["kkk"]]],
 [[11,16,["wk","ke","ee"]],[19,17,["kkk"]]],
 [[10,16,["eee","eke","eee"]],[19,16,["eee","eke","eee"]]],
 [[11,16,["wk","ke","ee",".l"]],[19,16,["wk","ke","ee","l."]]],
 [[10,16,["k..","kke",".ee"]],[19,16,["..k","ekk","ee."]]]];
function faceDraw(g,L,P){const M=L.body===1,es=L.eyes%EYES.length;EYES[es].forEach(([x,y,rows],side)=>{if(M&&rows.length===3){rows=rows.slice(1);y+=1}g.grid(rows,P,x,y)});const m=L.mouth%4,blush=m!==2&&!M,k=L.mark%6;
  if(M){g.p(15,18,P.S)}
  if(k===4){const st=mix(P.s,P.H,.28);g.r(9,19,1,2,st);g.r(22,19,1,2,st);g.r(10,20,4,1,st);g.r(18,20,4,1,st);g.r(11,21,10,1,st);g.r(14,21,4,1,mix(P.s,P.H,.4))}
  if(k===5){g.r(8,15,2,6,P.H);g.r(22,15,2,6,P.H);g.r(9,19,14,3,P.H);g.r(10,22,12,1,P.H);g.r(12,23,8,1,P.j);g.r(10,19,12,1,P.h);g.r(14,19,4,1,P.S)}
  if(blush){g.r(10,19,2,1,P.b);g.r(20,19,2,1,P.b)}
  const mc=k===5?P.j:M?P.d:'#e0607a';if(m===0){g.r(15,20,2,1,mc);if(M)g.r(14,20,4,1,mc)}if(m===1){g.r(14,20,4,1,INK);g.r(15,20,2,1,'#ff6a7a')}if(m===2){g.r(14,20,4,1,mc)}if(m===3){g.r(15,20,2,1,mc);g.p(17,19,mc)}
  if(k===1){[[9,19],[12,19],[19,19],[22,19],[11,20],[20,20]].forEach(p=>g.p(p[0],p[1],P.d))}if(k===2){g.line(13,14,13,19,'#f0a0a8');g.p(12,15,'#f0a0a8');g.p(14,17,'#f0a0a8')}if(k===3){g.r(10,19,3,1,'#3f8cff');g.r(19,19,3,1,'#3f8cff');g.r(15,14,2,4,'#3f8cff')}}
function browsLashes(g,L,P){const es=L.eyes%EYES.length,M=L.body===1,bw=L.brows==null?(M?2:0):L.brows%12;
  const B=[null,[[10,15,3,1],[19,15,3,1]],[[9,15,4,1],[19,15,4,1],[12,16,1,1],[19,16,1,1]],[[10,15,1,1],[11,14,2,1],[19,14,2,1],[21,15,1,1]],[[9,14,1,1],[10,14,2,1],[11,15,2,1],[21,14,2,1],[19,15,2,1],[22,14,1,1]],[[10,15,2,1],[12,14,1,1],[19,14,1,1],[20,15,2,1]],[[9,15,4,1],[19,15,4,1]],[[9,14,4,2],[19,14,4,2],[8,15,1,1],[23,15,1,1]],[[10,13,3,1],[19,13,3,1]],[[9,15,14,1]],[[10,13,3,1],[19,15,3,1]],[[9,15,2,1],[12,15,1,1],[19,15,1,1],[21,15,2,1]]][bw];
  if(B)B.forEach(r=>g.r(r[0],r[1],r[2],r[3],bw===1?P.H:P.j));
  if(M||es===4||es===6||es===7)return;EYES[es].forEach(([x,y,rows],side)=>{const w=rows[0].length;if(side===0){g.p(x-1,y,INK);g.p(x-1,y-1,INK);g.p(x,y-1,INK)}else{g.p(x+w,y,INK);g.p(x+w,y-1,INK);g.p(x+w-1,y-1,INK)}})}
function sh(g,x,y,w,h,c){g.r(x,y,w,h,c[1]);g.r(x,y,1,h,c[0]);g.r(x+w-1,y,1,h,c[2])}
function robe(g,c,top=23){for(let y=top;y<=35;y++){const s=Math.floor((y-top)/4),x0=10-s,x1=21+s;g.r(x0,y,x1-x0+1,1,c[1]);g.r(x0,y,2,1,c[0]);g.r(x1-1,y,2,1,c[2])}}
function hands(g,P,l=[7,30],r=[23,30]){[l,r].forEach(([x,y])=>{g.r(x,y,2,2,P.s);g.p(x+1,y+1,P.S)})}
function legs(g,c){sh(g,11,33,4,3,c);sh(g,17,33,4,3,c)}
function feetDraw(g,B,mode){const f=(x,y,h)=>{g.r(x,y,4,h,B[1]);g.r(x,y,2,1,B[0])};if(mode==='a'){f(10,36,2);f(18,35,1)}else if(mode==='b'){f(10,35,1);f(18,36,2)}else{f(10,36,2);f(18,36,2)}}
function helmDome(g,c){g.ell(15.5,10,8.6,7.5,c[2]);g.ell(14.5,9.5,8,7,c[1]);g.ell(12,7,4,3,c[0]);g.x.clearRect(0,13,32,27)}
function hood(g,c,peak){g.ell(15.5,11,9.5,9.5,c[2]);g.ell(14.5,10.5,9,9,c[1]);g.ell(12,6,4,3,c[0]);if(peak==='up')g.poly([[12,4],[15.5,1],[19,4]],c[1]);if(peak==='back'){g.poly([[9,6],[3,2],[5,10]],c[1]);g.line(4,3,6,8,c[0])}g.ell(15.5,17,7.5,8,c[2]);g.ell(15.5,17,6.5,7,null,true);g.x.clearRect(0,22,32,18)}
const ST=['#eef4ff','#a9bbd6','#62759a'],GO=['#ffe27a','#f0a823','#b8661a'],LE=['#e8a868','#b06a38','#7a4526'];
const HERO={
 warden:{school:'rime',look:{skin:2,hair:0,hc:0,eyes:2,ec:1,mouth:2,mark:4,body:1},boots:['#7a88aa','#3a4566'],
  back:g=>{g.r(6,24,20,12,'#1f469c');g.r(6,24,2,12,'#2f74e0');[7,11,15,19,23].forEach(x=>g.p(x,36,'#1f469c'))},
  body:(g,P)=>{const B=['#5aaeff','#2f74e0','#1f469c'],F=['#ffffff','#dfe7f5','#a9b4d0'];legs(g,ST);sh(g,10,23,12,9,ST);sh(g,13,25,6,10,B);[[15,27],[16,27],[14,28],[17,28],[15,29],[16,29]].forEach(p=>g.p(p[0],p[1],'#ffffff'));g.r(15,28,2,1,'#bfe8ff');g.r(10,31,12,2,'#5e3220');g.r(15,31,2,2,GO[1]);sh(g,7,24,3,6,ST);sh(g,22,24,3,6,ST);g.r(7,29,3,1,ST[2]);g.r(22,29,3,1,ST[2]);hands(g,P);sh(g,4,24,4,3,ST);sh(g,24,24,4,3,ST);g.r(5,22,22,3,F[1]);g.r(5,22,22,1,F[0]);for(let x=5;x<27;x+=2)g.p(x,25,F[2]);g.r(14,22,4,2,GO[1])},
  head:g=>{helmDome(g,ST);g.r(14,1,4,8,'#2f74e0');g.r(14,1,1,8,'#5aaeff');g.r(17,1,1,8,'#1f469c');g.r(7,11,18,2,GO[1]);g.r(7,11,18,1,GO[0]);sh(g,7,13,3,6,ST);sh(g,22,13,3,6,ST);g.r(15,13,2,3,ST[1]);g.p(15,13,ST[0])},
  wf:[g=>{g.rr(19,19,12,18,ST[2],2);g.rr(20,20,10,16,'#2f74e0',1);g.r(20,21,2,14,'#5aaeff');g.r(28,21,2,14,'#1f469c');g.r(21,19,8,1,ST[0]);g.line(25,23,25,31,'#e8fbff');g.line(22,27,28,27,'#e8fbff');g.line(23,25,27,29,'#bfe8ff');g.line(27,25,23,29,'#bfe8ff');[[21,21],[29,21],[21,34],[29,34]].forEach(p=>g.p(p[0],p[1],GO[0]))}]},
 ranger:{school:'verdant',look:{skin:1,hair:2,hc:1,eyes:0,ec:2,mouth:3,mark:1,body:0},boots:['#a9622f','#5e3220'],
  back:g=>{const G2='#1f6a44';g.r(7,23,18,13,G2);for(let x=7;x<24;x+=3)g.poly([[x,35],[x+1.5,38],[x+3,35]],G2);g.band(19,27,10,1,-1,[[0,0,'#b06a38'],[1,0,'#7a4526'],[0,1,'#b06a38'],[1,1,'#7a4526']]);g.disc(28,17,1.6,'#5e3220');g.line(26,16,27,9,'#e8c98f');g.line(28,16,30,10,'#e8c98f');g.p(27,8,'#ff5a6a');g.p(26,8,'#ffffff');g.p(27,9,'#ff5a6a');g.p(30,9,'#ffffff');g.p(29,9,'#ff5a6a')},
  body:(g,P)=>{const Gr=['#8ef06a','#3fae4c','#1f6a44'];legs(g,['#a8b86a','#6e7f3a','#4a5a28']);sh(g,10,23,12,10,LE);g.line(11,23,20,32,'#5e3220');g.r(10,31,12,2,'#5e3220');g.r(15,31,2,1,'#ffd84a');sh(g,18,31,3,3,LE);sh(g,7,24,3,5,Gr);sh(g,22,24,3,5,Gr);sh(g,7,28,3,2,LE);sh(g,22,28,3,2,LE);hands(g,P);g.r(8,22,16,3,Gr[1]);g.r(8,22,16,1,Gr[0]);g.r(11,25,2,4,Gr[1]);g.p(11,28,Gr[2]);g.p(9,23,'#ffd84a')},
  head:g=>{hood(g,['#8ef06a','#3fae4c','#1f6a44'],'back');g.p(21,7,'#ffd84a');g.p(22,8,'#8ef06a');g.p(20,8,'#8ef06a')},
  wf:[g=>{for(let t=0;t<=1;t+=.01){const y=13+24*t,x=6-4.6*Math.sin(Math.PI*t);g.p(x,y,'#d9955a');g.p(x+1,y,'#7a4526')}g.p(6,12,'#ffd84a');g.p(6,37,'#ffd84a');g.line(7,14,7,36,'#fff1cf');g.r(2,24,2,3,'#3fae4c')}]},
 arcanist:{school:'ash',look:{skin:0,hair:4,hc:1,eyes:1,ec:3,mouth:0,mark:0,body:0},boots:['#6a5890','#3a2d58'],
  body:(g,P)=>{const R=['#ff6a6a','#d63447','#8a1f45'];robe(g,R);g.r(15,24,2,10,GO[1]);g.r(10,29,12,2,'#7a1840');g.r(15,29,2,2,'#ffd36a');sh(g,5,24,4,7,R);sh(g,23,24,4,7,R);g.r(5,30,4,1,GO[1]);g.r(23,30,4,1,GO[1]);hands(g,P,[6,31],[24,31]);g.r(7,34,18,2,GO[1]);g.r(7,34,18,1,GO[0]);g.r(19,31,3,3,'#5a3a8a');g.p(19,31,'#ffd84a');g.r(11,22,10,2,'#fff3d6');g.r(11,23,10,1,'#e3c08f')},
  head:g=>{const R=['#ff6a6a','#d63447','#8a1f45'];g.ell(15.5,12,13,2.6,R[2]);g.ell(15.5,11.4,12.5,2,R[1]);g.r(5,11,10,1,R[0]);g.poly([[9,11],[11,6],[14,2],[18,0.5],[23,1],[27,3],[28,5],[25,4],[21,4],[22,11]],R[1]);g.line(11,10,14,3,R[0]);g.line(14,3,18,1,R[0]);g.poly([[18,11],[21,5],[22,11]],R[2]);g.r(9,9,13,2,GO[1]);g.r(9,9,13,1,GO[0]);g.p(15,9,'#ff7a2a');g.p(16,9,'#ffd36a');g.line(28,5,28,7,'#3a2a4a');g.r(26,8,5,5,'#3a2a4a');g.r(27,9,3,3,'#ffd36a');g.p(28,9,'#fff0b0');g.r(26,7,5,1,'#5a4470')},
  wf:[g=>{g.r(3,21,2,17,'#c4834a');g.r(4,21,1,17,'#7d4a2a');g.r(2,19,4,2,GO[1]);g.disc(3.5,15.5,3,'#ff7a2a');g.disc(3,15,1.8,'#ffd36a');g.p(2,14,'#ffffff');g.p(4,11,'#ffb03a');g.p(2,10,'#ff7a2a')},g=>{g.disc(27,20,1.6,'#ff7a2a');g.p(27,19,'#ffd36a');g.p(28,18,'#ffd36a');g.p(26,22,'#ff7a2a')}]},
 reaver:{open:1,school:'ash',look:{skin:3,hair:3,hc:1,eyes:2,ec:5,mouth:1,mark:5,body:1},boots:['#6e5a40','#3a2a1a'],
  body:(g,P)=>{const F=['#e8d4b0','#a8906a','#6e5a40'],K=['#ff5a5a','#c02a3a','#7d1d2d'];legs(g,['#8a4f2a','#5e3220','#3a2a1a']);sh(g,10,23,12,8,[P.s,P.s,P.S]);g.r(15,25,2,1,P.S);g.line(11,24,13,27,'#ff7a2a');g.line(20,24,18,27,'#ff7a2a');g.line(10,24,20,31,'#5e3220');g.line(11,24,21,31,'#8a4f2a');g.r(10,30,12,3,LE[1]);g.r(10,30,12,1,LE[0]);g.r(15,30,2,2,'#efe6cf');sh(g,10,33,12,2,K);g.p(12,34,K[2]);g.p(18,34,K[2]);sh(g,7,24,3,7,[P.s,P.s,P.S]);sh(g,22,24,3,7,[P.s,P.s,P.S]);sh(g,7,28,3,2,LE);sh(g,22,28,3,2,LE);g.p(8,25,'#ff9a2e');g.p(8,26,'#ff7a2a');hands(g,P,[7,31],[23,31]);g.r(10,35,5,1,F[1]);g.r(17,35,5,1,F[1]);g.disc(8,23,4.2,F[1]);g.disc(7,22,2.5,F[0]);[[4,25],[6,27],[9,27]].forEach(p=>g.p(p[0],p[1],F[2]));g.p(5,19,'#ffffff');g.p(6,20,'#efe6cf');g.p(5,20,'#efe6cf')},
  head:g=>{const K=['#ff5a5a','#c02a3a','#7d1d2d'];g.r(8,11,16,2,K[1]);g.r(8,11,16,1,K[0]);g.poly([[8,11],[3,13],[2,17],[5,15],[8,13]],K[1]);g.poly([[8,12],[4,16],[5,18],[9,13]],K[2])},
  wf:[g=>{g.line(24,35,25,4,'#8a4f2a');g.line(25,35,26,4,'#5e3220');g.poly([[25,2],[19,0.5],[16,5],[18,11],[25,9]],'#b9c6e0');g.line(19,1,16,5,'#f2f6ff');g.line(16,5,18,10,'#f2f6ff');g.line(20,2,17,6,'#ff9a2e');g.line(23,3,23,9,'#7a88aa');g.poly([[27,4],[30,6],[27,8]],'#7a88aa');g.r(24,3,3,2,GO[1]);g.r(23,28,3,2,'#5e3220')}]},
 shade:{school:'umbral',look:{skin:1,hair:0,hc:3,eyes:2,ec:4,mouth:2,mark:0,body:1},boots:['#36407a','#1d1638'],
  back:g=>{g.poly([[10,22],[3,19],[1,21],[4,23],[2,27],[9,25]],'#a35cff');g.poly([[10,24],[5,26],[3,30],[9,27]],'#5a2ab0')},
  body:(g,P)=>{const C=['#5a6aa8','#36407a','#232a55'];legs(g,C);sh(g,10,23,12,10,C);g.r(10,29,12,2,'#a35cff');g.r(10,29,12,1,'#d9a0ff');g.line(10,24,21,28,'#1d1638');g.p(12,31,'#b9c6e0');g.p(19,31,'#b9c6e0');sh(g,7,24,3,6,C);sh(g,22,24,3,6,C);g.r(7,28,3,1,'#1d1638');g.r(22,28,3,1,'#1d1638');hands(g,P)},
  over:g=>{g.r(9,19,14,3,'#2b2145');g.r(9,19,14,1,'#3d3060');g.r(10,22,12,1,'#1d1638');g.r(9,22,14,2,'#a35cff');g.r(9,22,14,1,'#d9a0ff')},
  head:g=>hood(g,['#8a6ad0','#5a3fa0','#33236a'],'up'),
  wf:[g=>{g.line(6,32,4,36,'#e8c8ff');g.line(7,32,5,36,'#a35cff');g.line(25,32,27,36,'#e8c8ff');g.line(24,32,26,36,'#a35cff');g.p(3,29,'#d9a0ff');g.p(28,28,'#d9a0ff')}]},
 oathbound:{school:'radiance',look:{skin:2,hair:5,hc:2,eyes:0,ec:1,mouth:0,mark:0,body:0},boots:['#c98a1c','#7a4a12'],
  back:g=>{g.r(7,24,18,12,'#a9b4d0');g.r(7,24,2,12,'#e2e8f6')},
  body:(g,P)=>{const W=['#ffffff','#e2e8f6','#a9b4d0'];legs(g,GO);sh(g,10,23,12,8,GO);sh(g,12,26,8,9,W);g.disc(15.5,29,1.6,GO[1]);g.p(15,26,GO[1]);g.p(16,26,GO[1]);g.r(10,31,12,1,'#7d4a2a');sh(g,7,25,3,5,GO);sh(g,22,25,3,5,GO);hands(g,P);g.disc(8,24,3,GO[1]);g.disc(7,23,1.5,GO[0]);g.disc(23,24,3,GO[2]);g.disc(23,23,1.5,GO[1])},
  head:g=>{helmDome(g,GO);g.r(7,11,18,2,'#e2e8f6');g.r(15,11,2,2,'#7fe3ff');g.p(15,12,'#3fa9ff');[[[8,9],[2,3],[1,6],[3,6],[1,9],[4,9],[3,12],[8,12]],[[23,9],[29,3],[30,6],[28,6],[30,9],[27,9],[28,12],[23,12]]].forEach(w=>g.poly(w,'#ffffff'));g.line(3,7,7,9,'#c9d3ea');g.line(28,7,24,9,'#c9d3ea');g.line(4,10,7,11,'#c9d3ea');g.line(27,10,24,11,'#c9d3ea')},
  wf:[g=>{g.r(26,20,2,17,'#c4834a');g.r(27,20,1,17,'#7d4a2a');g.r(23,14,8,6,'#a9bbd6');g.r(23,14,8,1,'#eef4ff');g.r(23,19,8,1,'#62759a');g.r(26,14,2,6,GO[1]);g.p(30,13,'#fff6c8');g.p(22,13,'#fff6c8')}]},
 rimecaller:{open:1,school:'rime',look:{skin:0,hair:1,hc:4,eyes:3,ec:1,mouth:2,mark:5,body:1},boots:['#9aa6c8','#4a5a88'],
  body:(g,P)=>{const I=['#d8f6ff','#8fd8f5','#4a9ad0'];robe(g,I);g.r(14,25,4,9,'#2f5f9a');g.p(15,28,'#e8fbff');g.p(16,28,'#e8fbff');g.p(15,30,'#e8fbff');g.p(16,30,'#e8fbff');g.r(7,34,18,2,'#ffffff');g.r(7,35,18,1,'#dfe7f5');sh(g,6,24,3,7,I);sh(g,23,24,3,7,I);g.r(6,30,3,1,'#ffffff');g.r(23,30,3,1,'#ffffff');hands(g,P,[6,31],[24,31]);g.r(9,22,14,3,'#ffffff');for(let x=9;x<23;x+=2)g.p(x,25,'#dfe7f5')},
  head:g=>{[[15.5,0.5,6.5,2],[10.5,2,7,1.6],[20.5,2,7,1.6]].forEach(([x,y,b,w])=>{g.poly([[x,y],[x+w,(y+b)/2+1],[x,b],[x-w,(y+b)/2+1]],'#7fe3ff');g.line(x,y+1,x,b-1,'#e8fbff')});g.r(8,12,16,1,'#e8f0ff');g.r(8,13,16,1,'#9aa6c8');g.r(15,12,2,2,'#3fa9e8')},
  wf:[g=>{g.r(26,15,2,22,'#e8f0ff');g.r(27,15,1,22,'#9aa6c8');g.poly([[26.5,4],[30,9.5],[26.5,15],[23,9.5]],'#7fe3ff');g.poly([[26.5,4],[26.5,15],[30,9.5]],'#3fa9e8');g.line(25,7,24,9,'#e8fbff');g.p(26,6,'#ffffff');g.p(3,18,'#e8fbff');g.p(4,22,'#bfe8ff')}]},
 hedgewitch:{open:1,school:'verdant',look:{skin:2,hair:1,hc:6,eyes:4,ec:2,mouth:1,mark:1,body:0},boots:['#8a5a3a','#5e3a22'],
  body:(g,P)=>{robe(g,['#a8d86a','#6a9a3a','#3f6a2a']);g.r(12,27,8,7,'#fff1cf');g.r(12,27,8,1,'#e8c98f');g.r(14,31,4,2,'#e8c98f');g.r(10,30,2,3,'#ff5a8a');g.p(10,29,'#d9955a');g.r(20,30,2,3,'#5ab8ff');g.p(20,29,'#d9955a');sh(g,7,24,3,6,['#c8834a','#8a5a3a','#5e3a22']);sh(g,22,24,3,6,['#c8834a','#8a5a3a','#5e3a22']);hands(g,P);g.poly([[7,23],[25,23],[22,26],[16,29],[10,26]],'#c8503a');g.line(7,23,24,23,'#ff8a6a');[[10,26],[12,27],[14,28],[18,28],[20,27],[22,26]].forEach(p=>g.p(p[0],p[1],'#7d2a2a'))},
  head:g=>{const T='#8a5a3a';g.r(8,10,16,2,'#3fae4c');g.r(8,10,16,1,'#8ef06a');[[10,10,7,4],[8,6,5,5],[7,4,7,1],[9,8,10,3],[21,10,24,4],[23,6,26,5],[24,4,24,1],[22,8,21,3]].forEach(l=>g.line(l[0],l[1],l[2],l[3],T));[[7,0],[24,0],[5,4],[26,4],[10,2],[21,2]].forEach(p=>g.p(p[0],p[1],'#8ef06a'));g.p(11,9,'#ff79a8');g.p(10,9,'#ff79a8');g.p(12,9,'#ff79a8');g.p(11,8,'#ff79a8');g.p(11,9,'#ffd84a');g.p(20,9,'#fff6e8');g.p(19,9,'#fff6e8');g.p(21,9,'#fff6e8');g.p(20,8,'#fff6e8');g.p(20,9,'#ffd84a');g.p(28,2,'#7ff5e0')},
  wf:[g=>{g.r(2,14,2,24,'#8a5a3a');g.r(3,14,1,24,'#5e3a22');g.line(2,14,2,10,'#8a5a3a');g.line(3,9,5,8,'#8a5a3a');g.line(6,9,6,11,'#8a5a3a');g.p(6,12,'#3a2a4a');g.r(5,13,3,4,'#d8f4ff');g.r(6,14,1,2,'#b8f57a');g.r(5,13,3,1,'#8a5a3a')}]},
 duskweaver:{open:1,school:'umbral',look:{skin:4,hair:1,hc:3,eyes:2,ec:4,mouth:3,mark:0,body:0},boots:['#36387a','#1f1f4a'],
  back:g=>{g.ell(15.5,10.5,12.5,9.5,'#d9a0ff');g.ell(15.5,10.5,11.5,8.6,'#a35cff');g.ell(19.5,8.5,10.5,9.6,null,true);g.r(8,21,16,14,'#1f1f4a')},
  body:(g,P)=>{const N=['#5a5aa8','#36387a','#1f1f4a'];robe(g,N);[[11,27],[19,25],[13,32],[20,31]].forEach(p=>g.p(p[0],p[1],'#e8f0ff'));g.p(17,29,'#d9a0ff');g.r(10,28,12,2,'#a35cff');g.r(10,28,12,1,'#d9a0ff');sh(g,5,24,4,8,N);sh(g,23,24,4,8,N);g.r(5,31,4,1,'#a35cff');g.r(23,31,4,1,'#a35cff');hands(g,P,[6,32],[24,32]);g.r(11,22,10,2,'#5a2ab0')},
  head:g=>{g.r(8,12,16,1,'#e8f0ff');g.disc(15.5,12.5,1.4,'#a35cff');g.p(15,12,'#f4d8ff')},
  wf:[g=>{g.disc(5,27,3,'#5a2ab0');g.disc(4.5,26.5,2,'#a35cff');g.p(4,26,'#f4d8ff');g.line(1,29,9,25,'#d9a0ff');[[27,23],[26,24],[27,24],[28,24],[27,25]].forEach(p=>g.p(p[0],p[1],'#e8f0ff'))}]},
 cantor:{open:1,school:'radiance',look:{skin:1,hair:6,hc:2,eyes:0,ec:1,mouth:0,mark:0,body:1},boots:['#c9d3ea','#8a96b8'],
  body:(g,P)=>{const W=['#ffffff','#e6e9f5','#b7c0e3'];robe(g,W);g.r(13,25,2,10,GO[1]);g.r(17,25,2,10,GO[1]);g.p(13,28,GO[0]);g.p(17,28,GO[0]);g.r(7,34,18,2,GO[1]);sh(g,6,25,3,6,W);sh(g,23,25,3,6,W);g.r(6,30,3,1,GO[1]);g.r(23,30,3,1,GO[1]);hands(g,P,[6,31],[24,31]);g.ell(15.5,23,8.5,2.2,'#ffffff');for(let x=8;x<24;x+=2)g.p(x,24,'#c9d3ea');g.r(8,29,6,4,'#8a1f45');g.r(9,29,4,3,'#fff1cf');g.r(11,29,1,3,'#e3c08f')},
  head:g=>{g.ell(15.5,2.5,6.5,1.8,GO[1]);g.ell(15.5,2.2,6,1.2,GO[0]);g.ell(15.5,2.5,4.6,0.8,null,true)},
  wf:[g=>{for(let i=0;i<5;i++)g.p(24+i*.8,32+i*.7,'#c9d3ea');g.disc(27.5,35.5,2.2,GO[1]);g.p(27,34,GO[0]);g.p(28,31,'#fff6c8');g.p(29,29,'#fff6c8');g.p(28,27,'#fff6c8')}]},
 stormlancer:{school:'storm',look:{skin:2,hair:2,hc:3,eyes:2,ec:3,mouth:2,mark:4,body:1},boots:['#4a5aa8','#2a3470'],
  back:g=>{g.r(8,24,16,10,'#2a3470')},
  body:(g,P)=>{const N=['#8a9ad8','#4a5aa8','#2a3470'];legs(g,N);sh(g,10,23,12,9,N);g.line(13,24,16,27,'#ffe14a');g.line(16,27,15,28,'#ffe14a');g.line(15,28,18,31,'#ffe14a');g.r(10,31,12,1,'#e0a81e');sh(g,10,32,12,2,N);g.poly([[5,23],[10,22],[10,26],[6,26]],N[1]);g.line(5,23,10,22,N[0]);g.poly([[26,23],[21,22],[21,26],[25,26]],N[2]);sh(g,7,25,3,5,N);sh(g,22,25,3,5,N);hands(g,P)},
  head:g=>{helmDome(g,['#8a9ad8','#4a5aa8','#2a3470']);g.r(6,11,20,2,'#2a3470');g.r(6,11,20,1,'#4a5aa8');g.p(15,7,'#ffe14a');g.p(16,8,'#ffe14a');g.p(15,9,'#ffe14a');g.p(16,10,'#ffe14a');g.poly([[13,4],[16,1],[22,1],[28,3],[29,7],[24,4],[19,3],[17,5]],'#ffffff');g.line(18,2,27,4,'#ffe14a');g.line(16,3,22,3,'#dfe7f5')},
  wf:[g=>{g.r(4,8,2,30,'#c4834a');g.r(5,8,1,30,'#7d4a2a');g.poly([[5,1],[7.5,5],[5,8.5],[2.5,5]],'#d3ddff');g.line(5,2,4,6,'#ffffff');g.r(3,8,5,1,'#ffe14a');g.poly([[4,10],[1,11.5],[1,14],[4,13]],'#ffe14a');g.r(4,29,2,2,'#ffe0bd');g.p(8,3,'#fffbd0');g.p(1,4,'#fffbd0')}]},
 sparkwright:{open:1,school:'storm',look:{skin:1,hair:3,hc:5,eyes:1,ec:1,mouth:1,mark:1,body:0},boots:['#8a5a1a','#4a2a10'],
  back:g=>{const B=['#ffe27a','#d9a03a','#8a5a1a'];sh(g,8,20,16,11,B);g.r(24,4,2,18,'#a84a1a');g.r(24,4,1,18,'#e07a3a');for(let y=8;y<20;y+=3)g.r(23,y,4,1,'#e07a3a');g.disc(24.5,2.5,2,'#ffe14a');g.p(24,2,'#fffbd0');g.p(27,1,'#fffbd0');g.p(28,3,'#ffe14a');g.p(21,2,'#fffbd0');g.r(22,20,3,2,'#a84a1a')},
  body:(g,P)=>{const T=['#6fe0c8','#2aa898','#1a6a6a'],A=['#d9955a','#a8622f','#6b3a20'];legs(g,['#8a7a6a','#5a4a3a','#3a2a1a']);sh(g,10,23,12,10,T);sh(g,11,25,10,9,A);g.r(13,29,6,3,A[2]);g.p(14,28,'#b9c6e0');g.p(14,27,'#b9c6e0');g.p(17,28,'#ffe14a');g.r(11,23,1,2,A[2]);g.r(20,23,1,2,A[2]);g.r(10,31,12,1,'#d9a03a');sh(g,7,24,3,4,T);sh(g,22,24,3,4,T);sh(g,7,28,3,2,[P.s,P.s,P.S]);hands(g,P)},
  head:g=>{g.r(7,12,18,1,'#6b3a20');g.disc(12,12,2.3,'#d9a03a');g.disc(12,12,1.2,'#7fe3ff');g.disc(19,12,2.3,'#d9a03a');g.disc(19,12,1.2,'#7fe3ff');g.p(11,11,'#ffffff');g.p(18,11,'#ffffff')},
  wf:[g=>{const B=['#ffe27a','#d9a03a','#8a5a1a'];g.rr(22,25,6,8,B[1],1);g.r(22,25,1,8,B[0]);g.r(27,25,1,8,B[2]);g.r(22,27,6,1,'#e07a3a');g.r(22,29,6,1,'#e07a3a');g.r(23,32,5,2,B[2]);g.p(29,31,'#fffbd0');g.p(29,33,'#ffe14a')},g=>{g.line(5,28,5,34,'#b9c6e0');g.r(4,34,3,2,'#b9c6e0');g.p(5,35,'#62759a');g.r(4,27,2,2,'#ffe0bd')}]},
 /* ---- martial schools ---- */
 swordsman:{school:'blade',look:{skin:1,hair:0,hc:0,eyes:2,ec:1,mouth:3,mark:0,body:1},boots:['#7a4526','#3a2214'],
  back:g=>{g.poly([[6,22],[13,22],[12,35],[5,34]],'#b82f45');g.line(6,22,5,33,'#e84a4a')},
  body:(g,P)=>{const W=['#ffffff','#e6e9f5','#b7c0e3'];legs(g,['#5a6aa8','#36407a','#232a55']);sh(g,10,23,12,9,['#7ab4ff','#3f74d9','#22378a']);sh(g,7,24,3,6,W);sh(g,22,24,3,6,W);g.p(8,26,'#3f74d9');g.p(23,26,'#3f74d9');g.r(10,31,12,1,'#5e3220');g.line(10,30,21,24,'#e84a4a');g.line(10,31,21,25,'#b82f45');[24,26,28].forEach(y=>g.p(16,y,GO[0]));g.r(11,22,10,1,'#ffffff');hands(g,P)},
  wf:[(g,P)=>{g.r(24,4,3,22,'#b9c6e0');g.r(24,4,1,22,'#f2f6ff');g.r(26,4,1,22,'#7a88aa');g.r(25,6,1,18,'#d3ddff');g.p(25,3,'#f2f6ff');g.r(21,26,9,2,GO[1]);g.r(21,26,9,1,GO[0]);g.r(24,28,3,4,'#5e3220');g.r(23,29,3,2,P.s);g.disc(25,33,1.4,GO[1])}]},
 samurai:{school:'blade',look:{skin:2,hair:2,hc:3,eyes:2,ec:0,mouth:2,mark:0,body:1},boots:['#3a2a3a','#1a1230'],
  back:g=>{g.line(4,34,13,28,'#2b2145');g.line(4,35,13,29,'#1a1230');g.p(13,28,GO[1])},
  body:(g,P)=>{const R=['#ff6a6a','#c02a3a','#7d1d2d'],N=['#5a6aa8','#36407a','#232a55'];for(let y=30;y<=35;y++){const s=Math.floor((y-30)/2);g.r(10-s,y,12+2*s,1,N[1]);g.r(10-s,y,1,1,N[0]);g.r(21+s,y,1,1,N[2])}g.r(15,31,1,5,N[2]);sh(g,10,23,12,7,R);for(let y=24;y<30;y+=2)g.r(10,y,12,1,R[2]);for(let x=11;x<21;x+=3)g.p(x,25,GO[0]);g.r(10,29,12,2,'#2b2145');sh(g,7,27,3,3,N);sh(g,22,27,3,3,N);hands(g,P);sh(g,5,22,5,6,R);g.r(5,24,5,1,R[2]);g.r(5,26,5,1,R[2]);sh(g,22,22,5,6,R);g.r(22,24,5,1,R[2]);g.r(22,26,5,1,R[2]);g.r(11,22,10,1,'#fff1cf')},
  head:g=>{g.poly([[1,13],[6,9],[10,5],[13,3.2],[15.5,2.6],[18,3.2],[21,5],[25,9],[30,13]],'#e8c98f');g.poly([[15.5,2.6],[18,3.2],[21,5],[25,9],[30,13],[15.5,13]],'#c8a060');g.r(1,13,30,1,'#a8803a');g.line(5,12,13,4,'#c8a060');g.line(26,12,18,4,'#a8803a');g.line(10,12,14,4,'#d9b47a');g.p(15,3,'#fff1cf');g.line(9,14,10,19,'#d63447');g.line(22,14,21,19,'#d63447')},
  wf:[g=>{g.line(23,31,25,28,'#2b2145');g.line(24,31,26,28,'#5a3a8a');g.r(25,26,3,2,GO[1]);g.line(26,25,30,13,'#f2f6ff');g.line(27,25,30,15,'#b9c6e0')}]},
 knight:{school:'iron',look:{skin:1,hair:0,hc:0,eyes:2,ec:1,mouth:2,mark:0,body:1},boots:['#a9bbd6','#4b5578'],
  body:(g,P)=>{const W=['#ffffff','#e6e9f5','#b7c0e3'];legs(g,ST);sh(g,10,23,12,9,ST);sh(g,11,24,10,11,W);[[0,0],[0,1]].forEach(([_,o])=>{g.line(11,29+o,15,25+o,'#d63447');g.line(20,29+o,16,25+o,'#d63447')});g.r(10,31,12,1,'#5e3220');sh(g,7,24,3,6,ST);sh(g,22,24,3,6,ST);hands(g,{s:ST[0],S:ST[2]});g.disc(8,23,2.6,ST[1]);g.disc(7,22,1.4,ST[0]);g.disc(23,23,2.6,ST[2]);g.disc(23,22,1.4,ST[1])},
  head:g=>{g.rr(7,4,18,18,ST[2],3);g.rr(8,4,16,17,ST[1],3);g.r(9,5,4,14,ST[0]);g.r(15,4,2,18,ST[0]);g.r(9,14,14,2,'#1a1230');[[18,18],[20,18],[18,20],[20,20]].forEach(p=>g.p(p[0],p[1],'#1a1230'));g.disc(16,3,2.4,'#e84a4a');g.poly([[16,1.5],[24,1],[27,5],[22,3.5]],'#d63447');g.line(17,2,25,2,'#ff7a6a')},
  wf:[g=>{g.poly([[1,22],[9,22],[9,30],[5,36],[1,30]],'#d63447');g.line(1,22,9,22,'#ffd84a');g.line(1,22,1,30,'#ffd84a');g.line(9,22,9,30,'#b8661a');g.line(2,28,5,25,'#ffd84a');g.line(8,28,5,25,'#ffd84a');g.line(2,29,5,26,'#ffd84a');g.line(8,29,5,26,'#ffd84a')},g=>{g.r(24,12,2,16,'#d3ddff');g.r(25,12,1,16,'#7a88aa');g.p(24,11,'#f2f6ff');g.r(22,28,6,1,GO[1]);g.r(24,29,2,3,'#5e3220');g.p(24,32,GO[1])}]},
 juggernaut:{school:'iron',look:{skin:4,hair:6,hc:3,eyes:2,ec:5,mouth:2,mark:2,body:1},boots:['#5a5f7a','#2b2f45'],
  body:(g,P)=>{const I=['#8a90a8','#5a5f7a','#33364a'];legs(g,I);sh(g,9,23,14,10,I);[[11,25],[20,25],[11,29],[20,29]].forEach(p=>g.p(p[0],p[1],'#ff9a2e'));g.r(10,32,12,2,'#7a88aa');for(let x=10;x<22;x+=2)g.p(x,33,'#4b5578');sh(g,6,26,3,5,I);sh(g,23,26,3,5,I);g.r(6,31,3,2,I[1]);g.r(23,31,3,2,I[1]);g.disc(7,23,4.5,I[1]);g.disc(6,22,2.5,I[0]);g.poly([[3,20],[1,15],[5,19]],'#d3ddff');g.poly([[6,19],[6,14],[8,19]],'#d3ddff');g.disc(24,23,4.5,I[2]);g.disc(24,22,2.5,I[1]);g.poly([[28,20],[30,15],[26,19]],'#a9bbd6');g.poly([[25,19],[25,14],[23,19]],'#a9bbd6')},
  head:g=>{const I=['#8a90a8','#5a5f7a','#33364a'];helmDome(g,I);g.r(7,11,18,2,I[2]);[11,14,17,20].forEach(x=>g.poly([[x,4],[x+1,1],[x+2,4]],'#d3ddff'));sh(g,7,13,3,8,I);sh(g,22,13,3,8,I);g.r(10,21,12,2,I[1]);g.r(10,21,12,1,I[0]);g.p(8,15,'#ff9a2e');g.p(23,15,'#ff9a2e')},
  wf:[g=>{const I=['#8a90a8','#5a5f7a','#33364a'];g.line(6,34,8,8,'#6b3a20');g.line(7,34,9,8,'#3a2214');g.rr(2,1,12,7,I[1],1);g.r(3,2,10,1,I[0]);g.r(2,7,12,1,I[2]);g.r(7,1,2,7,'#ff9a2e')}]},
 monk:{open:1,school:'fist',look:{skin:2,hair:6,hc:3,eyes:3,ec:0,mouth:0,mark:0,body:1},boots:['#e8c98f','#a8803a'],
  back:g=>{g.r(1,24,30,2,'#c4834a');g.r(1,25,30,1,'#7d4a2a');g.r(1,24,2,2,'#ffd84a');g.r(29,24,2,2,'#ffd84a')},
  body:(g,P)=>{legs(g,['#fff1cf','#e8c98f','#b8945a']);sh(g,10,23,12,9,['#ffb03a','#f07a1a','#b8501a']);g.line(11,23,16,28,'#b8501a');g.line(21,23,16,28,'#b8501a');g.r(10,30,12,2,'#3a2a4a');g.r(19,32,2,3,'#3a2a4a');sh(g,7,24,3,5,[P.s,P.s,P.S]);sh(g,22,24,3,5,[P.s,P.s,P.S]);g.r(7,28,3,2,'#fff1cf');g.r(22,28,3,2,'#fff1cf');hands(g,P);[[10,23],[11,25],[12,26],[14,27],[17,27],[19,26],[20,25],[21,23]].forEach(p=>g.r(p[0],p[1],1,1,'#6b3a20'));g.r(15,27,2,2,'#d63447')},
  head:g=>{g.r(8,11,16,2,'#d63447');g.r(8,11,16,1,'#ff6a6a');g.poly([[23,11],[29,9],[30,12],[24,13]],'#d63447');g.poly([[23,12],[28,15],[27,17],[23,13]],'#a8203a')}},
 brawler:{open:1,school:'fist',look:{skin:3,hair:3,hc:0,eyes:2,ec:0,mouth:1,mark:2,body:1},boots:['#8a4f2a','#3a2214'],
  body:(g,P)=>{sh(g,11,33,4,3,[P.s,P.s,P.S]);sh(g,17,33,4,3,[P.s,P.s,P.S]);sh(g,10,31,12,3,['#ff6a6a','#d63447','#8a1f45']);g.r(15,32,2,2,'#8a1f45');sh(g,10,23,12,8,['#ffffff','#e6e9f5','#b7c0e3']);sh(g,7,23,3,7,[P.s,P.s,P.S]);sh(g,22,23,3,7,[P.s,P.s,P.S]);g.r(10,30,12,2,'#5e3220');g.r(13,30,6,2,GO[1]);g.r(14,30,4,1,GO[0]);g.line(12,24,15,27,'#e8c98f')},
  head:g=>{g.r(8,12,16,1,'#ffffff')},
  wf:[g=>{[[4,'#ff8a8a'],[22,'#ff8a8a']].forEach(([x,hi])=>{g.rr(x,26,6,6,'#d63447',1);g.r(x+1,27,2,2,hi);g.r(x+1,31,4,1,'#ffffff');g.r(x+5,27,1,4,'#8a1f45')})}]},
 huntsman:{school:'hunt',look:{skin:2,hair:0,hc:0,eyes:0,ec:2,mouth:3,mark:4,body:1},boots:['#8a5a3a','#4a2a18'],
  back:g=>{g.r(6,22,20,14,'#6e5a40');for(let x=6;x<26;x+=2)g.p(x,36,'#6e5a40')},
  body:(g,P)=>{legs(g,['#8a7a5a','#5e5040','#3a3228']);sh(g,10,23,12,10,LE);g.r(10,31,12,1,'#3a2214');g.r(19,29,3,5,'#7a4526');g.p(19,28,'#d3ddff');g.p(21,28,'#d3ddff');sh(g,7,24,3,6,LE);sh(g,22,24,3,6,LE);hands(g,P);g.r(8,22,16,3,'#a8906a');g.r(8,22,16,1,'#d9c4a0');for(let x=8;x<24;x+=2)g.p(x,25,'#a8906a')},
  head:g=>{g.ell(15.5,9,9,5.5,'#a8906a');g.ell(14.5,8,7.5,4,'#d9c4a0');g.r(7,11,18,3,'#8a6a4a');g.r(7,11,18,1,'#a8906a');sh(g,7,14,3,6,['#d9c4a0','#a8906a','#6e5a40']);sh(g,22,14,3,6,['#d9c4a0','#a8906a','#6e5a40']);g.poly([[22,6],[28,9],[29,13],[25,10]],'#8a6a4a');g.p(28,12,'#efe6cf');g.p(29,12,'#efe6cf')},
  wf:[g=>{g.r(8,28,14,2,'#8a4f2a');g.r(8,28,14,1,'#b06a38');g.line(6,23,6,34,'#5a5f7a');g.line(7,23,7,34,'#8a90a8');g.line(8,24,12,28,'#fff1cf');g.line(12,29,8,33,'#fff1cf');g.r(3,28,8,1,'#e8c98f');g.p(2,28,'#d3ddff')}]},
 falconer:{school:'hunt',look:{skin:1,hair:2,hc:2,eyes:0,ec:3,mouth:0,mark:1,body:0},boots:['#8a5a3a','#4a2a18'],
  back:g=>{g.r(7,23,18,13,'#5a4a3a');for(let x=7;x<25;x+=2)g.p(x,36,'#8a7a5a')},
  body:(g,P)=>{legs(g,['#6e7f3a','#4a5a28','#2f3a18']);sh(g,10,23,12,10,['#d9b45a','#a8803a','#6e5a28']);g.r(10,31,12,1,'#5e3220');g.r(15,31,2,1,GO[1]);g.line(11,23,20,31,'#6e5a28');sh(g,22,24,3,6,['#d9b45a','#a8803a','#6e5a28']);g.r(23,30,2,2,P.s);g.p(24,31,P.S);sh(g,7,22,3,4,['#d9b45a','#a8803a','#6e5a28']);sh(g,4,18,3,7,LE);g.r(4,17,3,2,LE[2])},
  wf:[g=>{g.ell(5,13,2.6,3.6,'#8a6a4a');g.ell(5.5,14,1.5,2.3,'#e8d4b0');g.disc(5.5,9.5,1.9,'#5a4a3a');g.p(7,10,'#ffd84a');g.p(6,9,'#1a1230');g.poly([[3,11],[1,17],[4,15]],'#5a4a3a');g.r(4,17,2,1,'#5a4a3a');g.p(4,16,'#ffd84a');g.p(6,16,'#ffd84a')}]},
 corsair:{school:'guile',look:{skin:3,hair:1,hc:3,eyes:2,ec:1,mouth:3,mark:2,body:0},boots:['#5e3220','#2b1a10'],
  back:g=>{g.r(7,26,18,10,'#7d1d2d');g.p(8,36,'#7d1d2d');g.p(23,36,'#7d1d2d')},
  body:(g,P)=>{const R=['#ff5a5a','#c02a3a','#7d1d2d'];legs(g,['#efe6cf','#d4c8a8','#ab9d7d']);sh(g,9,23,14,11,R);g.r(14,23,4,7,'#ffffff');g.r(14,23,4,1,'#e6e9f5');[[12,25],[12,28],[19,25],[19,28]].forEach(p=>g.p(p[0],p[1],GO[0]));g.r(10,30,12,2,'#3f74d9');g.r(10,30,12,1,'#5aaeff');g.line(9,23,20,31,'#5e3220');sh(g,6,24,3,6,R);sh(g,23,24,3,6,R);g.r(6,29,3,1,GO[1]);g.r(23,29,3,1,GO[1]);hands(g,P,[6,30],[24,30])},
  head:g=>{g.poly([[3,10],[8,5],[15.5,3],[23,5],[28,10],[22,9],[15.5,8],[9,9]],'#2b2145');g.poly([[8,5],[15.5,3],[15.5,6],[10,7]],'#3d3060');g.line(3,10,9,9,GO[1]);g.line(9,9,15.5,8,GO[1]);g.line(15.5,8,22,9,GO[1]);g.line(22,9,28,10,GO[1]);g.poly([[17,4],[26,1],[28,2],[20,5]],'#ffffff');g.line(18,4,26,2,'#dfe7f5')},
  wf:[g=>{g.disc(25,30,1.7,GO[1]);g.line(25,28,28,20,'#f2f6ff');g.line(26,28,29,21,'#b9c6e0');g.line(28,20,29,17,'#f2f6ff');g.p(29,18,'#b9c6e0')}]},
 jester:{school:'guile',look:{skin:0,hair:4,hc:5,eyes:4,ec:1,mouth:1,mark:0,body:0},boots:['#ffd84a','#c98a1c'],
  body:(g,P)=>{const R=['#ff6a6a','#d63447','#8a1f45'],B=['#5aaeff','#2f74e0','#1f469c'];sh(g,11,33,4,3,R);sh(g,17,33,4,3,B);g.r(10,23,6,10,R[1]);g.r(16,23,6,10,B[1]);g.r(10,23,1,10,R[0]);g.r(21,23,1,10,B[2]);[[12,26,B[1]],[13,29,B[1]],[18,26,R[1]],[19,29,R[1]]].forEach(p=>{g.p(p[0],p[1],p[2]);g.p(p[0]+1,p[1]+1,p[2])});g.r(10,31,12,1,'#ffd84a');sh(g,7,24,3,6,B);sh(g,22,24,3,6,R);hands(g,P);for(let x=9;x<23;x+=3)g.poly([[x,22],[x+1.5,25.5],[x+3,22]],'#ffd84a');g.p(10,25,'#fff6c8');g.p(21,25,'#fff6c8')},
  head:g=>{g.ell(15.5,9,8,3.5,'#a8203a');g.r(8,10,16,3,'#ffd84a');g.r(8,10,16,1,'#fff0a0');g.poly([[8,11],[14,9],[9,3],[3,1],[1,6],[4,4]],'#d63447');g.poly([[23,11],[17,9],[22,3],[28,1],[30,6],[27,4]],'#2f74e0');g.disc(2,7,1.5,'#ffd84a');g.disc(29,7,1.5,'#ffd84a')},
  wf:[g=>{g.disc(26,22,1.6,'#ffd84a');g.disc(28,18,1.6,'#4fd86a');g.disc(25,15,1.6,'#d63447');g.line(5,31,5,35,'#f2f6ff');g.p(5,30,GO[1])}]},
 bard:{school:'song',look:{skin:1,hair:1,hc:1,eyes:0,ec:2,mouth:0,mark:1,body:0},boots:['#8a4f2a','#4a2a18'],
  back:g=>{g.r(7,23,18,10,'#2f7a4a')},
  body:(g,P)=>{legs(g,['#ffe27a','#d9a03a','#8a5a1a']);sh(g,10,23,12,9,['#c08aff','#8a4ae0','#5a2aa8']);[24,26,28].forEach(y=>{g.p(15,y,GO[0]);g.p(16,y+1,GO[0])});g.r(10,31,12,1,'#5e3220');sh(g,7,24,3,5,GO);sh(g,22,24,3,5,GO);g.p(8,26,'#8a4ae0');g.p(23,26,'#8a4ae0');g.r(7,28,3,1,'#8a4ae0');g.r(22,28,3,1,'#8a4ae0');hands(g,P)},
  head:g=>{g.ell(13.5,9,9,3.2,'#8a4ae0');g.ell(12.5,8.4,8,2.4,'#c08aff');g.r(6,11,14,1,'#5a2aa8');g.poly([[18,7],[28,1],[29,2],[20,8]],'#ffd84a');g.line(19,7,28,2,'#e09a1e')},
  wf:[g=>{g.line(18,28,6,24,'#8a4f2a');g.line(18,29,6,25,'#5e3220');g.r(3,22,3,3,'#5e3220');g.p(2,22,'#ffd84a');g.p(2,24,'#ffd84a');g.ell(21,29,4.5,3.8,'#a8622f');g.ell(20.5,28.5,3.6,2.8,'#e8a868');g.disc(21,29,1.1,'#5e3220');g.line(24,30,7,25,'#fff1cf')}]},
 skald:{school:'song',look:{skin:1,hair:5,hc:2,eyes:2,ec:1,mouth:1,mark:5,body:1},boots:['#6e5a40','#3a2a1a'],
  back:g=>{g.disc(16,21,10.5,'#a8622f');g.disc(16,21,9.5,'#d18a4a');g.disc(16,21,8,'#efe6cf');g.line(8,15,24,27,'#a8622f');g.line(24,15,8,27,'#a8622f')},
  body:(g,P)=>{const T=['#7a9ac8','#4a6aa0','#2a4070'];legs(g,['#8a7a6a','#5a4a3a','#3a2a1a']);sh(g,10,23,12,9,T);g.r(10,31,12,1,'#5e3220');g.r(15,31,2,1,GO[1]);g.poly([[19,28],[25,26],[26,29],[20,30]],'#efe6cf');g.r(22,27,1,3,GO[1]);sh(g,7,24,3,6,T);sh(g,22,24,3,6,T);sh(g,7,28,3,2,LE);sh(g,22,28,3,2,LE);hands(g,P);g.r(8,22,16,3,'#a8906a');g.r(8,22,16,1,'#d9c4a0');for(let x=8;x<24;x+=2)g.p(x,25,'#a8906a')},
  head:g=>{const Bz=['#e8c08a','#c09070','#7a5a3a'];helmDome(g,Bz);g.r(7,11,18,2,Bz[2]);g.r(15,6,2,6,Bz[0]);g.poly([[8,9],[4,6],[2,1],[3,5],[5,9]],'#efe6cf');g.poly([[23,9],[27,6],[29,1],[28,5],[26,9]],'#efe6cf');g.p(2,1,'#a8906a');g.p(29,1,'#a8906a')},
  wf:[g=>{g.line(24,30,26,22,'#8a4f2a');g.poly([[25,22],[29,20],[29,25],[26,24]],'#b9c6e0');g.line(29,20,29,25,'#f2f6ff')}]},
 /* ---- NPCs ---- */
 maren:{npc:1,school:'hunt',look:{skin:3,hair:1,hc:0,eyes:2,ec:2,mouth:3,mark:2,body:0,brows:4},boots:['#6e5a40','#3a2a1a'],
  back:g=>{g.line(4,30,22,8,'#8a4f2a');g.line(5,30,23,8,'#5e3220');g.line(5,29,22,9,'#fff1cf');g.r(22,14,4,12,'#7a4526');g.r(22,14,1,12,'#b06a38');g.p(23,12,'#ff5a6a');g.p(25,12,'#ffffff');g.p(24,11,'#ff5a6a')},
  body:(g,P)=>{const F=['#c9cfe0','#8f97b0','#5d6480'];legs(g,['#6e7f3a','#4a5a28','#2f3a18']);sh(g,10,23,12,10,LE);g.line(10,24,21,32,'#3a2214');g.r(10,31,12,2,'#3a2214');g.p(15,31,'#d3ddff');sh(g,7,24,3,6,LE);sh(g,22,24,3,6,LE);g.r(7,28,3,2,F[1]);g.r(22,28,3,2,F[1]);hands(g,P);g.r(7,22,18,3,F[1]);g.r(7,22,18,1,F[0]);for(let x=7;x<25;x+=2)g.p(x,25,F[2]);g.r(18,30,2,4,'#d3ddff');g.r(18,30,2,1,'#5e3220')},
  head:g=>{const F=['#c9cfe0','#8f97b0','#5d6480'];hood(g,F);g.poly([[8,6],[9,1],[12,4]],F[1]);g.poly([[23,6],[22,1],[19,4]],F[2]);g.p(9,3,'#ff9ab0');g.p(22,3,'#ff9ab0');g.r(12,8,8,3,F[0]);g.p(13,9,'#1a1230');g.p(18,9,'#1a1230');g.r(15,10,2,1,'#1a1230')}},
 godric:{npc:1,school:'radiance',look:{skin:1,hair:6,hc:4,eyes:3,ec:0,mouth:2,mark:5,body:1,brows:2},boots:['#5e3a22','#3a2214'],
  body:(g,P)=>{const R=['#9ab88a','#5f7a5a','#3a4a3a'];robe(g,R);g.r(15,24,2,11,'#a8803a');sh(g,6,24,3,7,R);sh(g,23,24,3,7,R);hands(g,P,[6,31],[24,31]);g.r(7,22,18,3,'#a8906a');g.r(7,22,18,1,'#d9c4a0');for(let i=0;i<7;i++)g.p(11+i*1.5,24+Math.sin(i/6*Math.PI)*2,GO[1]);g.disc(16,27,2,GO[1]);g.disc(15.5,26.5,1,GO[0])},
  wf:[g=>{g.r(26,8,2,30,'#8a5a3a');g.r(27,8,1,30,'#5e3a22');g.disc(26.5,7,2.2,'#8a5a3a');g.p(26,6,'#b07a4a');g.r(24,30,3,2,'#ffe0bd')}]},
 nanbriar:{npc:1,school:'verdant',look:{skin:2,hair:4,hc:4,eyes:4,ec:2,mouth:3,mark:1,body:0,brows:1},boots:['#5e3a22','#3a2214'],
  body:(g,P)=>{robe(g,['#8a7ab0','#5f5090','#3f3466']);g.r(12,27,8,8,'#e8d4b0');g.r(12,27,8,1,'#c8b08a');g.r(13,30,2,2,'#6ee06a');g.p(18,31,'#c8503a');g.poly([[6,22],[26,22],[23,27],[16,31],[9,27]],'#a8503a');g.line(6,22,25,22,'#d07a5a');[[9,27],[12,29],[16,31],[20,29],[23,27]].forEach(p=>g.p(p[0],p[1],'#ffd84a'));sh(g,6,24,3,6,['#8a7ab0','#5f5090','#3f3466']);sh(g,23,24,3,6,['#8a7ab0','#5f5090','#3f3466']);hands(g,P,[6,30],[24,30])},
  head:g=>{g.ell(15.5,12.5,13,2.6,'#5e3a22');g.ell(15.5,12,12.5,2,'#8a5a3a');g.poly([[9,12],[11,6],[15,3],[19,2],[24,4],[26,8],[22,7],[22,12]],'#8a5a3a');g.poly([[19,2],[24,4],[26,8],[22,7]],'#5e3a22');g.r(12,6,4,3,'#a8503a');g.r(18,8,3,2,'#5f7a5a');g.r(9,10,13,2,'#5f5090');g.p(11,10,'#ffd84a');g.p(10,9,'#8ef06a')},
  wf:[g=>{g.line(25,30,28,22,'#a8a8b8');g.ell(28.5,21,2,1.4,'#c9cfe0');g.ell(25,35,3.5,2,'#1a1230');g.disc(28,33,1.8,'#1a1230');g.p(27,31,'#1a1230');g.p(29,31,'#1a1230');g.p(27,33,'#ffe14a');g.p(29,33,'#ffe14a');g.line(21,35,20,32,'#1a1230')}]},
 odo:{npc:1,school:'iron',look:{skin:3,hair:6,hc:3,eyes:2,ec:0,mouth:0,mark:5,body:1,brows:2},boots:['#3a3228','#1a1610'],
  body:(g,P)=>{legs(g,['#6e6a5a','#4a4638','#2e2a20']);sh(g,10,23,12,10,['#a89a8a','#7a6e60','#4a4238']);sh(g,11,24,10,10,['#8a5a3a','#6b3a20','#4a2614']);g.r(11,24,1,10,'#a8703a');g.r(13,28,6,3,'#4a2614');g.p(14,27,'#b9c6e0');sh(g,6,23,4,8,[P.s,P.s,P.S]);sh(g,22,23,4,8,[P.s,P.s,P.S]);g.r(6,29,4,2,'#4a4238');g.r(22,29,4,2,'#4a4238');g.r(6,31,3,2,P.s);g.r(23,31,3,2,P.s);g.p(8,25,'#5a5050');g.p(19,25,'#5a5050')},
  wf:[g=>{g.r(24,24,2,10,'#8a5a3a');g.r(25,24,1,10,'#5e3a22');g.r(21,20,8,5,'#5a5f7a');g.r(21,20,8,1,'#8a90a8');g.r(21,24,8,1,'#33364a');g.p(29,21,'#ff9a2e');g.p(30,22,'#ffd36a')}]},
 wil:{npc:1,school:'song',look:{skin:1,hair:5,hc:1,eyes:0,ec:1,mouth:1,mark:1,body:0,brows:1},boots:['#5e3220','#3a2214'],
  body:(g,P)=>{robe(g,['#ff8a6a','#d0503a','#8a2a2a'],27);sh(g,10,23,12,6,['#fff1cf','#e8d4b0','#c8b08a']);g.r(10,27,12,2,'#5e3220');g.r(12,29,8,7,'#ffffff');g.r(12,29,8,1,'#e6e9f5');g.p(15,32,'#d0503a');sh(g,7,24,3,5,['#fff1cf','#e8d4b0','#c8b08a']);sh(g,22,24,3,5,['#fff1cf','#e8d4b0','#c8b08a']);hands(g,P,[7,29],[23,29])},
  head:g=>{g.ell(15.5,8.5,8.6,4.6,'#4fa36a');g.ell(14.5,7.8,7.6,3.6,'#6fc88a');[[11,7],[15,6],[19,8],[13,9]].forEach(p=>g.p(p[0],p[1],'#ffffff'));g.poly([[22,9],[27,11],[26,14],[23,11]],'#4fa36a')},
  wf:[g=>{g.r(21,27,9,2,'#a9bbd6');g.r(21,27,9,1,'#eef4ff');g.r(22,22,3,5,'#d9955a');g.r(22,22,3,1,'#ffffff');g.r(26,23,3,4,'#d9955a');g.r(26,23,3,1,'#ffffff');g.p(25,24,'#a8622f');g.p(29,25,'#a8622f')}]},
 pell:{npc:1,school:'guile',look:{skin:2,hair:0,hc:0,eyes:1,ec:3,mouth:1,mark:4,body:1,brows:3},boots:['#8a5a3a','#4a2a18'],
  back:g=>{sh(g,5,10,22,23,['#d9955a','#a8622f','#6b3a20']);g.r(5,16,22,2,'#6b3a20');g.r(5,24,22,2,'#6b3a20');g.disc(4,22,2.5,'#c09070');g.disc(4,22,1.4,'#7a5a3a');g.disc(28,18,2.5,'#b9c6e0');g.r(26,27,4,5,'#ff5a8a');g.r(26,27,4,1,'#ffb0c8');g.r(8,8,6,3,'#4fa36a');g.r(17,7,7,4,'#3f74d9');g.r(17,7,7,1,'#7ab4ff')},
  body:(g,P)=>{legs(g,['#8a7a5a','#5e5040','#3a3228']);sh(g,10,23,12,10,['#ffd36a','#e0a03a','#a8661a']);g.r(10,25,12,1,'#8a4f2a');g.r(10,29,12,1,'#8a4f2a');g.r(10,31,12,2,'#5e3220');[[12,32],[15,32],[18,32]].forEach(p=>g.r(p[0],p[1],2,2,'#a8622f'));sh(g,7,24,3,6,['#ffd36a','#e0a03a','#a8661a']);sh(g,22,24,3,6,['#ffd36a','#e0a03a','#a8661a']);hands(g,P)},
  head:g=>{g.ell(15.5,11.5,12.5,2.4,'#6b3a20');g.ell(15.5,11,12,1.8,'#a8622f');g.r(9,5,13,6,'#a8622f');g.r(9,5,13,1,'#d9955a');g.r(9,9,13,2,'#3f74d9');g.p(20,7,'#ffe14a');g.p(21,6,'#ffe14a')}},
 aldous:{npc:1,school:'radiance',look:{skin:0,hair:6,hc:0,eyes:3,ec:1,mouth:0,mark:0,body:1,brows:1},boots:['#4b5578','#2b3150'],
  body:(g,P)=>{const R=['#7a88aa','#4b5578','#2b3150'];robe(g,R);g.r(14,24,4,11,'#ffffff');g.r(14,24,4,1,'#e6e9f5');g.p(15,28,GO[1]);g.p(16,28,GO[1]);g.p(15,27,GO[1]);g.p(16,29,GO[1]);sh(g,6,24,3,7,R);sh(g,23,24,3,7,R);hands(g,P,[6,31],[24,31]);g.r(11,22,10,2,'#ffffff');g.r(7,29,5,4,'#8a1f45');g.r(8,29,3,3,'#fff1cf')},
  wf:[g=>{g.line(25,32,25,34,'#3a2a4a');g.r(23,34,5,4,'#3a2a4a');g.r(24,35,3,2,'#ffd36a');g.p(25,35,'#fff0b0');g.r(23,33,5,1,'#5a4470')}]},
 rook:{npc:1,school:'blade',look:{skin:2,hair:0,hc:3,eyes:2,ec:0,mouth:2,mark:2,body:1,brows:4},boots:['#3a3228','#1a1610'],
  body:(g,P)=>{const C=['#c9cfe0','#8f97b0','#5d6480'],R=['#ff6a6a','#d63447','#8a1f45'];legs(g,C);sh(g,10,23,12,10,C);for(let y=24;y<33;y+=2)for(let x=11;x<21;x+=2)g.p(x+(y%4?1:0),y,C[2]);sh(g,12,24,8,11,R);g.r(12,28,8,2,'#ffd84a');g.r(10,31,12,1,'#3a2214');sh(g,7,24,3,6,C);sh(g,22,24,3,6,C);hands(g,P)},
  head:g=>{helmDome(g,['#c9cfe0','#8f97b0','#5d6480']);g.ell(15.5,12.5,12,2,'#5d6480');g.ell(15.5,12,11.5,1.4,'#8f97b0');g.r(14,4,4,1,'#d63447')},
  wf:[g=>{g.r(26,5,2,32,'#8a5a3a');g.r(27,5,1,32,'#5e3a22');g.poly([[26,7],[30,5],[30,13],[26,11]],'#b9c6e0');g.line(30,5,30,13,'#f2f6ff');g.poly([[26,8],[23,9],[26,10]],'#7a88aa');g.poly([[26.5,1],[28,5],[25,5]],'#d3ddff')}]},
 tamsin:{npc:1,school:'hunt',look:{skin:1,hair:2,hc:1,eyes:0,ec:2,mouth:3,mark:1,body:0,brows:1},boots:['#3a4a3a','#1f2a1f'],
  body:(g,P)=>{const Y=['#ffe27a','#f0b43a','#a8761a'];legs(g,['#7ab4ff','#3f74d9','#22378a']);g.r(11,34,4,1,'#fff1cf');g.r(17,34,4,1,'#fff1cf');sh(g,9,23,14,11,Y);g.r(15,23,2,11,Y[2]);[25,28,31].forEach(y=>g.p(14,y,'#5e3220'));sh(g,6,24,3,7,Y);sh(g,23,24,3,7,Y);hands(g,P,[6,31],[24,31])},
  head:g=>{g.ell(15.5,12.5,12.5,2.8,'#a8761a');g.ell(15.5,12,12,2.2,'#f0b43a');g.ell(15.5,9,8,4.5,'#ffe27a');g.ell(14,8,5,2.6,'#fff0b0');g.poly([[19,13],[29,15],[27,17],[21,15]],'#f0b43a')},
  wf:[g=>{g.line(3,4,6,37,'#c4834a');g.line(4,4,7,37,'#7d4a2a');g.r(4,30,3,2,'#ffe0bd')}]},
 hobb:{npc:1,school:'umbral',look:{skin:1,hair:6,hc:4,eyes:3,ec:0,mouth:2,mark:4,body:1,brows:2},boots:['#3a3228','#1a1610'],
  body:(g,P)=>{const C=['#8a8a9a','#5a5a6a','#3a3a48'];legs(g,['#6e6a5a','#4a4638','#2e2a20']);sh(g,9,23,14,11,C);g.r(12,27,3,3,'#7a6e60');g.r(18,30,3,2,'#6e5a40');g.r(9,30,14,1,'#3a2214');sh(g,6,24,3,7,C);sh(g,23,24,3,7,C);hands(g,P,[6,31],[24,31]);g.r(10,22,12,2,'#a8a8b8')},
  head:g=>{g.ell(15.5,9,8.5,4,'#4a4638');g.ell(14.5,8.3,7.5,3,'#6e6a5a');g.ell(15.5,12,9.5,1.6,'#3a3228')},
  wf:[g=>{g.r(4,8,2,24,'#8a5a3a');g.r(5,8,1,24,'#5e3a22');g.r(3,7,4,2,'#5e3a22');g.rr(2,31,6,6,'#8a90a8',1);g.r(3,32,2,4,'#c9cfe0');g.r(4,30,2,2,'#ffe0bd')},g=>{g.line(25,32,25,33,'#3a2a4a');g.r(23,33,5,4,'#3a2a4a');g.r(24,34,3,2,'#b8f57a');g.p(25,34,'#e8ffc0')}]},
 ysolde:{open:1,npc:1,school:'rime',look:{skin:4,hair:4,hc:3,eyes:0,ec:1,mouth:0,mark:0,body:0,brows:1},boots:['#2f5f9a','#1f3a66'],
  body:(g,P)=>{const R=['#7ab4ff','#3f74d9','#22378a'];robe(g,R);g.r(13,24,6,10,'#2f5f9a');g.r(7,34,18,1,GO[1]);sh(g,6,24,3,6,R);sh(g,23,24,3,6,R);hands(g,P,[8,29],[22,29]);g.r(9,27,14,3,'#8a1f45');g.r(10,25,12,2,'#5a8a3a');g.r(11,23,10,2,'#c8503a');g.r(9,27,14,1,'#fff1cf');g.r(10,25,12,1,'#fff1cf');g.r(11,23,10,1,'#fff1cf')},
  head:g=>{g.r(9,15,5,1,'#d9a03a');g.r(18,15,5,1,'#d9a03a');g.r(9,19,5,1,'#d9a03a');g.r(18,19,5,1,'#d9a03a');g.r(9,15,1,5,'#d9a03a');g.r(13,15,1,5,'#d9a03a');g.r(18,15,1,5,'#d9a03a');g.r(22,15,1,5,'#d9a03a');g.r(14,16,4,1,'#d9a03a');g.p(10,16,'#e8fbff');g.p(19,16,'#e8fbff');g.line(25,20,24,10,'#ffffff');g.r(24,8,3,2,'#3a2a4a')}},
 pip:{open:1,npc:1,school:'song',look:{skin:1,hair:3,hc:1,eyes:1,ec:2,mouth:1,mark:1,body:1,brows:1},boots:['#8a5a3a','#4a2a18'],
  body:(g,P)=>{const T=['#8ef06a','#3fae4c','#1f6a44'];sh(g,11,33,4,3,[P.s,P.s,P.S]);sh(g,17,33,4,3,[P.s,P.s,P.S]);sh(g,10,31,12,3,['#c8834a','#8a5a3a','#5e3a22']);sh(g,10,23,12,9,T);g.r(13,27,3,3,'#ffd84a');g.p(14,28,'#c8834a');g.r(10,30,12,1,'#5e3220');sh(g,7,24,3,6,T);sh(g,22,24,3,6,T);hands(g,P)},
  head:g=>{g.poly([[20,6],[26,1],[27,3],[22,7]],'#ffffff');g.line(21,6,26,2,'#e6e9f5')},
  wf:[g=>{g.r(24,14,2,15,'#d9955a');g.r(25,14,1,15,'#a8622f');g.p(24,13,'#d9955a');g.r(21,29,8,2,'#8a5a3a');g.r(24,31,2,3,'#5e3220')}]},
 corwin:{npc:1,school:'ash',look:{skin:3,hair:0,hc:0,eyes:0,ec:0,mouth:0,mark:5,body:1,brows:2},boots:['#6e5a40','#3a2a1a'],
  back:g=>{g.ell(8,18,6,7,'#c8b08a');g.ell(7,17,5,6,'#efe6cf');g.r(5,12,6,2,'#a8906a')},
  body:(g,P)=>{legs(g,['#8a7a5a','#5e5040','#3a3228']);sh(g,9,23,14,10,['#a89a8a','#7a6e60','#4a4238']);sh(g,11,25,10,10,['#ffffff','#efe6cf','#c8b08a']);[[12,27],[17,29],[14,32],[19,26]].forEach(p=>g.p(p[0],p[1],'#ffffff'));g.p(18,31,'#5a5050');g.p(12,30,'#5a5050');sh(g,6,24,3,7,['#a89a8a','#7a6e60','#4a4238']);sh(g,23,24,3,7,['#a89a8a','#7a6e60','#4a4238']);g.r(6,28,3,1,'#efe6cf');hands(g,P,[6,31],[24,31])},
  head:g=>{g.ell(15.5,9,8.6,4.2,'#efe6cf');g.ell(14.5,8.3,7.6,3.2,'#ffffff');g.r(7,11,18,2,'#c8b08a');g.poly([[22,7],[27,9],[26,12],[22,10]],'#efe6cf')}},
 sela:{open:1,npc:1,school:'storm',look:{skin:2,hair:1,hc:7,eyes:2,ec:4,mouth:3,mark:0,body:0,brows:3},boots:['#5e3220','#2b1a10'],
  back:g=>{g.r(7,24,18,11,'#1a6a6a')},
  body:(g,P)=>{const T=['#6fe0c8','#2aa898','#1a6a6a'];legs(g,['#8a7a6a','#5a4a3a','#3a2a1a']);sh(g,10,23,12,10,T);g.r(15,23,2,10,T[2]);g.line(10,23,21,31,'#5e3220');sh(g,19,29,4,4,LE);g.r(19,29,4,1,LE[0]);g.r(10,31,12,1,'#5e3220');sh(g,7,24,3,6,T);sh(g,22,24,3,6,T);hands(g,P);g.disc(16,26,1.4,'#7ff5e0');g.p(16,25,'#e8fbff')},
  head:g=>{g.r(8,12,16,1,'#e8f0ff');g.disc(15.5,12,1.6,'#2de2c4');g.p(15,11,'#e8fbff')},
  wf:[g=>{g.r(3,25,4,9,'#fff1cf');g.r(3,25,4,1,'#ffffff');g.r(6,25,1,9,'#e8c98f');g.r(3,24,4,1,'#c8503a');g.r(3,33,4,1,'#c8503a');g.disc(26,31,2.2,GO[1]);g.disc(26,31,1.3,'#fff1cf');g.p(26,30,'#d63447')}]},
};
const XK=['dye','headw','cape','neck','face','extra','helm','chest','hands','feet','weapon'];
function heroLook(name){if(HERO[name])return Object.assign({cls:name},HERO[name].look);if(typeof name!=='string'||name.indexOf('hero:')!==0)return null;const a=name.split(':');if(!HERO[a[1]])return null;const n=a.slice(2,9).map(v=>+v||0);const L={cls:a[1],skin:n[0],hair:n[1],hc:n[2],eyes:n[3],ec:n[4],mouth:n[5],mark:n[6],nohat:a[9]==='1',body:+a[10]||0,brows:a[11]!=null&&a[11]!==''?+a[11]:null};XK.forEach((k,i)=>L[k]=+a[12+i]||0);return L}
function widen(c,y0,y1,d){const t=G(32,40);t.img(c);const x=c.getContext('2d');x.clearRect(0,y0,32,y1-y0+1);const h=y1-y0+1;x.drawImage(t.c,0,y0,16,h,-d,y0,16,h);x.drawImage(t.c,16,y0,16,h,16+d,y0,16,h);for(let i=0;i<d;i++){x.drawImage(t.c,15,y0,1,h,15-i,y0,1,h);x.drawImage(t.c,16,y0,1,h,16+i,y0,1,h)}}
function heroFrame(L,dy,feet){
  const C=HERO[L.cls],sk=SKINS[L.skin%5],hc=HAIRC[L.hc%8],ec=EYEC[L.ec%6];
  const P={k:INK,w:'#ffffff',s:sk[0],S:sk[1],d:sk[2],b:sk[3],h:hc[0],H:hc[1],j:hc[2],e:ec[0],E:ec[1]};
  const bd=G(32,40);if(C.back)C.back(bd,P);hairPart(bd,L.hair%7,'back',P);C.body(bd,P);
  if(L.body===1){widen(bd.c,21,35,1);widen(bd.c,21,26,1)}
  const up=G(32,40);up.img(bd);up.grid(L.body===1?HEAD_M:HEAD,P,0,6);faceDraw(up,L,P);hairPart(up,L.hair%7,'front',P,C.head&&!L.nohat&&!C.open);browsLashes(up,L,P);hairPart(up,L.hair%7,'over',P);if(C.over)C.over(up,P);
  const base=G(32,40);if(dy<0)base.x.drawImage(up.c,0,33,32,4,0,33,32,4);base.x.drawImage(up.c,0,dy);feetDraw(base,C.boots,feet);outline(base.c);
  const out=G(32,40),lay=fn=>{const l=G(32,40);fn(l,P);outline(l.c);return l.c};
  (C.wb||[]).forEach(fn=>out.x.drawImage(lay(fn),0,dy));out.img(base);if(C.head&&!L.nohat)out.x.drawImage(lay(C.head),0,dy);(C.wf||[]).forEach(fn=>out.x.drawImage(lay(fn),0,dy));
  return out.c;
}

/* ---------- ICONS (32x32 items, 24x24 schools, 16x16 coin) ---------- */
const S1='#f2f6ff',S2='#b9c6e0',S3='#7a88aa',S4='#4b5578',GY='#ffe066',GM='#f0a823',GD='#b8661a',W1='#d9955a',W2='#a8622f',W3='#6b3a20';
function staffIcon(g,c1,c2,c3){g.band(6,28,16,1,-1,[[0,0,W1],[1,0,W2]]);g.disc(21,12,2,GM);g.p(20,11,GY);g.disc(23,9,4.2,c2);g.disc(22,8,2.6,c1);g.p(21,7,'#fff');g.p(27,4,c2);g.p(28,3,c1);g.p(19,4,c2);g.p(24,3,c1);g.p(26,13,c3)}
function potionIcon(g,L){g.r(13,4,6,3,W2);g.r(13,4,6,1,W1);g.r(13,7,6,5,'#d8f4ff');g.r(17,7,2,5,'#9fc8e0');g.r(12,11,8,1,'#ffffff');g.disc(16,20,8.5,'#9fc8e0');g.disc(15,19,7.6,'#d8f4ff');
  for(let y=16;y<=29;y++)for(let x=7;x<=25;x++){const d=(x-16)**2+(y-20)**2;if(d<=56){g.p(x,y,y>=25||x>=20?L[1]:L[0])}}
  g.r(9,16,14,1,L[2]);g.p(10,14,'#fff');g.p(10,15,'#fff');g.p(9,17,'#fff');g.p(9,18,'#fff');g.p(18,19,L[2]);g.p(14,23,L[2]);g.p(19,22,L[2])}
const ICONS={
 icon_sword:{w:32,h:32,fn:g=>{g.band(9,22,16,1,-1,[[0,0,S1],[1,0,S2],[1,1,S3]]);g.p(25,6,S1);g.band(8,23,4,-1,1,[[0,0,W1],[1,0,W2]]);g.band(5,18,8,1,1,[[0,0,GY],[1,0,GM],[0,1,GD]]);g.disc(4,27,1.6,GM);g.p(3,26,GY)}},
 icon_axe:{w:32,h:32,fn:g=>{g.poly([[18,15],[25,8],[20,4],[15,2],[10,5],[9,11],[13,15]],S2);g.line(15,2,10,5,S1);g.line(10,5,9,11,S1);g.line(9,11,13,15,S1);g.line(11,6,10,10,S1);g.line(17,13,23,7,S3);g.line(16,12,21,7,S3);g.band(6,27,18,1,-1,[[0,0,W1],[1,0,W2]]);g.band(9,24,3,1,-1,[[0,0,'#ff5a6a'],[1,0,'#d92f4a']]);g.p(24,9,GY);g.p(24,10,GM)}},
 icon_staff:{w:32,h:32,fn:g=>staffIcon(g,'#ffd36a','#ff7a2a','#ffb03a')},
 icon_staff_rime:{w:32,h:32,fn:g=>staffIcon(g,'#e8fbff','#3fa9ff','#7fe3ff')},
 icon_bow:{w:32,h:32,fn:g=>{g.line(25,5,5,25,'#fff1cf');for(let t=0;t<=1;t+=.01){const x=(1-t)**2*25+2*(1-t)*t*3+t*t*4,y=(1-t)**2*4+2*(1-t)*t*3+t*t*25;g.p(x+1,y,W2);g.p(x,y+1,W2);g.p(x,y,W1)}g.disc(25,4,1.4,GM);g.disc(4,25,1.4,GM);g.line(26,26,9,9,W1);g.poly([[5,5],[12,7],[7,12]],S2);g.p(7,7,S1);g.p(25,27,'#ff5a6a');g.p(26,27,'#ff5a6a');g.p(27,25,'#d92f4a');g.p(27,26,'#ff5a6a')}},
 icon_dagger:{w:32,h:32,fn:g=>{g.band(13,19,9,1,-1,[[0,0,S1],[1,0,'#d9a0ff'],[1,1,'#9a55ff']]);g.p(22,10,S1);g.band(12,21,5,-1,1,[[0,0,'#5a2ab0'],[1,0,'#3a1a80']]);g.band(10,16,7,1,1,[[0,0,S2],[1,0,S3]]);g.disc(7,26,1.7,'#9a55ff');g.p(6,25,'#d9a0ff');g.p(25,7,'#d9a0ff');g.p(24,6,'#ffffff')}},
 icon_shield:{w:32,h:32,fn:g=>{g.poly([[6,5],[26,5],[26,16],[16,28],[6,16]],GM);g.line(7,5,25,5,GY);g.poly([[8,7],[24,7],[24,15],[16,25],[8,15]],'#3f8cff');g.poly([[16,7],[24,7],[24,15],[16,25]],'#2a5fc4');g.line(9,8,15,8,'#7fd0ff');g.line(9,8,9,14,'#7fd0ff');g.r(15,13,2,8,'#e8c98f');g.disc(16,12,3.4,'#ffffff');g.p(17,13,'#e8c98f');g.p(15,11,'#ffffff')}},
 icon_helm:{w:32,h:32,fn:g=>{g.ell(16,18,10,12,S3);g.ell(15,17,9,11,S2);g.ell(13,13,5,6,S1);g.x.clearRect(0,20,32,12);g.r(6,16,20,2,GM);g.r(6,16,20,1,GY);g.ell(16,21,13,3,S3);g.ell(16,20,13,2,S2);g.line(5,20,14,20,S1);g.disc(16,5,2.2,'#d92f4a');g.disc(18,3,1.6,'#ff5a6a');g.p(14,4,'#ff5a6a')}},
 icon_robe:{w:32,h:32,fn:g=>{const P=[[10,5],[14,4],[16,7],[18,4],[22,5],[28,12],[24,15],[23,13],[23,27],[9,27],[9,13],[8,15],[4,12]];g.poly(P,'#9a55ff');g.poly([[10,5],[14,4],[16,7],[16,27],[9,27],[9,13],[8,15],[4,12]],'#b77bff');g.line(22,14,22,26,'#5a2ab0');g.line(25,12,27,13,'#5a2ab0');g.poly([[13,4],[16,10],[19,4]],'#fff1cf');g.line(16,10,16,26,GY);g.r(9,25,15,2,GY);g.p(11,21,'#7ff5e0');g.p(12,20,'#7ff5e0');g.p(13,21,'#7ff5e0');g.p(19,21,'#7ff5e0');g.p(20,20,'#7ff5e0');g.p(21,21,'#7ff5e0');g.p(6,12,'#d9a0ff')}},
 icon_boots:{w:32,h:32,fn:g=>{g.poly([[10,5],[19,5],[19,19],[26,21],[28,24],[28,27],[9,27],[9,19]],W2);g.poly([[10,5],[14,5],[14,26],[9,26],[9,19]],W1);g.r(9,4,11,4,W1);g.r(9,7,11,1,W3);g.r(9,26,20,2,'#4a2a18');g.p(25,22,'#f0b26a');g.p(24,22,'#f0b26a');g.r(14,13,5,2,GY);g.p(11,24,'#3fbf4f');g.p(12,23,'#8ef06a');g.p(20,25,'#3fbf4f');g.p(21,24,'#8ef06a')}},
 icon_ring:{w:32,h:32,fn:g=>{g.ell(16,20,9,7,GD);g.ell(15,19,8.5,6.5,GM);g.ell(14,18,6,4.5,GY);g.ell(16,20,5.5,3.5,null,true);g.p(13,13,GM);g.p(19,13,GM);g.disc(16,11,3.6,'#2dc8b0');g.disc(15,10,2,'#7ff5e0');g.p(15,9,'#ffffff')}},
 icon_amulet:{w:32,h:32,fn:g=>{for(let i=0;i<=18;i++){const t=i/18,x=7+18*t,y=4+8*Math.sin(Math.PI*t);g.p(x,y,i%2?GD:GY)}g.disc(16,12,1.6,GY);g.poly([[10,20],[16,12],[22,20]],GM);g.disc(16,21,6.2,GM);g.disc(15,20,5,GY);g.disc(16,21,4,'#2b2145');g.poly([[13,20],[16,15],[19,20]],'#2b2145');g.p(14,19,'#d9a0ff');g.p(15,18,'#ffffff');g.p(17,23,'#5a3a8a')}},
 icon_potion_red:{w:32,h:32,fn:g=>potionIcon(g,['#ff5a6a','#d92f4a','#ffb0b8'])},
 icon_potion_ember:{w:32,h:32,fn:g=>potionIcon(g,['#5ab8ff','#2f6fd6','#bfe8ff'])},
 icon_potion_stamina:{w:32,h:32,fn:g=>potionIcon(g,['#9be33f','#4f9a2a','#e0ffb0'])},
 icon_coin:{w:16,h:16,fn:g=>{g.disc(8,8,6,GD);g.disc(7.5,7.5,5.5,GM);g.disc(7,7,4,GY);g.r(7,5,2,6,GM);g.p(5,5,'#fff')}},
 school_ash:{w:24,h:24,fn:g=>{g.poly([[5,15],[12,1],[19,15]],'#ff6a2a');g.disc(12,15,7,'#ff6a2a');g.poly([[8,16],[12,7],[16,16]],'#ffb03a');g.disc(12,16,4,'#ffb03a');g.disc(12,17,2.2,'#fff1cf');g.p(18,6,'#ff6a2a');g.p(19,5,'#ffb03a');g.p(6,8,'#ffb03a')}},
 school_rime:{w:24,h:24,fn:g=>{g.poly([[4,9],[7,14],[4,19],[1,14]],'#7fe3ff');g.poly([[20,9],[23,14],[20,19],[17,14]],'#3fa9e8');g.poly([[12,1],[17,12],[12,23],[7,12]],'#7fe3ff');g.poly([[12,1],[17,12],[12,23]],'#3fa9e8');g.line(11,4,8,12,'#e8fbff');g.p(3,12,'#e8fbff')}},
 school_storm:{w:24,h:24,fn:g=>{g.poly([[14,1],[5,13],[11,13],[8,23],[19,9],[13,9],[17,1]],'#ffe14a');g.line(14,2,7,12,'#fffbd0');g.line(18,9,10,20,'#e0a81e')}},
 school_radiance:{w:24,h:24,fn:g=>{[[0,-1],[1,0],[0,1],[-1,0]].forEach(([a,b])=>g.line(12+a*8,12+b*8,12+a*11,12+b*11,'#ffc43d'));[[1,1],[1,-1],[-1,1],[-1,-1]].forEach(([a,b])=>g.line(12+a*6,12+b*6,12+a*8,12+b*8,'#ffc43d'));g.disc(12,12,5.5,'#ffc43d');g.disc(11,11,4,'#fff0a0');g.disc(10,10,1.5,'#ffffff')}},
 school_umbral:{w:24,h:24,fn:g=>{g.disc(12,12,9,'#5a2ab0');g.disc(11,12,8,'#a35cff');g.disc(9,14,4,'#c99bff');g.cdisc(16,9,7);[[20,3],[19,4],[20,4],[21,4],[20,5]].forEach(p=>g.p(p[0],p[1],'#e0c8ff'));g.p(19,18,'#e0c8ff')}},
 school_verdant:{w:24,h:24,fn:g=>{g.poly([[3,21],[5,11],[12,4],[21,2],[20,11],[13,19]],'#3fbf4f');g.poly([[3,21],[5,11],[12,4],[21,2]],'#8ef06a');g.line(4,20,19,4,'#1f7a45');g.line(9,15,8,11,'#1f7a45');g.line(13,11,16,12,'#1f7a45');g.line(1,23,4,20,W2)}},
 school_blade:{w:24,h:24,fn:g=>{g.r(11,3,3,13,S2);g.r(11,3,1,13,S1);g.r(13,3,1,13,S3);g.poly([[11,3],[12.5,0.5],[14,3]],S1);g.r(6,16,13,2,GM);g.r(6,16,13,1,GY);g.r(11,18,3,4,W2);g.disc(12.5,22,1.4,GM)}},
 school_iron:{w:24,h:24,fn:g=>{g.poly([[3,3],[21,3],[21,12],[12,22],[3,12]],'#7a5a3a');g.poly([[5,5],[19,5],[19,11.5],[12,19.5],[5,11.5]],'#c09070');g.poly([[5,5],[12,5],[12,19.5],[5,11.5]],'#e8c08a');g.r(11,5,2,14,'#7a5a3a');g.r(5,10,14,2,'#7a5a3a');[[4,4],[20,4]].forEach(p=>g.p(p[0],p[1],'#ffe27a'))}},
 school_fist:{w:24,h:24,fn:g=>{g.rr(5,6,14,12,'#ff8a5a',2);g.rr(5,6,14,4,'#ffb08a',1);[9,12,15].forEach(x=>g.r(x,6,1,6,'#c0503a'));g.rr(3,12,6,5,'#ff8a5a',1);g.r(4,12,4,1,'#ffb08a');g.r(6,18,12,3,'#fff1cf');g.r(6,18,12,1,'#ffffff')}},
 school_hunt:{w:24,h:24,fn:g=>{g.ell(12,16,5.5,4.5,'#d9b45a');g.ell(11,15,4,3,'#f0d48a');[[5,9],[9.5,5.5],[14.5,5.5],[19,9]].forEach(([x,y])=>{g.ell(x,y,2.2,2.8,'#d9b45a');g.p(x-1,y-1,'#f0d48a')})}},
 school_guile:{w:24,h:24,fn:g=>{g.poly([[2,8],[8,5],[12,7],[16,5],[22,8],[20,15],[14,17],[12,15],[10,17],[4,15]],'#ff5a8a');g.poly([[2,8],[8,5],[12,7],[12,15],[10,17],[4,15]],'#ff8aac');g.ell(7.5,10.5,2.2,1.6,null,true);g.ell(16.5,10.5,2.2,1.6,null,true);g.line(2,8,0,4,'#a8203a');g.line(22,8,23,4,'#a8203a')}},
 school_song:{w:24,h:24,fn:g=>{g.ell(6,18,3.2,2.4,'#f0a0ff');g.ell(17,16,3.2,2.4,'#f0a0ff');g.r(8,4,2,14,'#f0a0ff');g.r(19,2,2,14,'#f0a0ff');g.poly([[8,4],[21,2],[21,6],[8,8]],'#c070e0');g.p(5,17,'#ffe0ff');g.p(16,15,'#ffe0ff')}},
};

/* ---------- TILES 32x32 (no outline) + PROPS (auto-outline) ---------- */
function grass(g,seed,fl,pal){const P=pal||['#3eae4c','#349f49','#5ccc55','#8fe36a','#2a8a47'];const R=rng(seed);g.r(0,0,32,32,P[0]);for(let i=0;i<16;i++)g.p(R()*32|0,R()*32|0,P[1]);for(let i=0;i<6;i++){const x=2+R()*27|0,y=3+R()*26|0;g.p(x,y,P[2]);g.p(x+1,y-1,P[3]);g.p(x+2,y,P[2]);g.p(x+1,y,P[4]);g.p(x,y+1,P[4]);g.p(x+2,y+1,P[4])}
  if(fl){const cols=['#ff79a8','#fff6e8','#7fb6ff','#ffd84a'];for(let i=0;i<fl;i++){const x=3+R()*25|0,y=3+R()*25|0,c=cols[R()*4|0];g.p(x,y+2,P[4]);g.p(x-1,y,c);g.p(x+1,y,c);g.p(x,y-1,c);g.p(x,y+1,c);g.p(x,y,c==='#ffd84a'?'#ff8a2a':'#ffd84a')}}}
function stoneAt(g,x,y,w,h,P){for(let j=1;j<h;j++)for(let i=1;i<w;i++){if((j===1||j===h-1)&&(i===1||i===w-1))continue;const col=j===1?P[0]:j===h-1?P[2]:i===w-1?P[3]:P[1];g.p(((x+i)%32+32)%32,y+j,col)}}
function pathTile(g,seed,P){P=P||['#efe6cf','#d4c8a8','#ab9d7d','#c2b593','#8a7c66'];const R=rng(seed);g.r(0,0,32,32,P[4]);for(let row=0;row<4;row++){let x=-(R()*8|0);while(x<32){const w=6+(R()*6|0);stoneAt(g,x,row*8,w,8,P);x+=w}}}
function dungeonFloor(g,seed){const R=rng(seed);g.r(0,0,32,32,'#1e3550');[[0,0],[16,0],[0,16],[16,16]].forEach(([x,y])=>{g.r(x+1,y+1,14,14,'#2b4a66');g.r(x+1,y+1,14,1,'#3a6585');g.r(x+1,y+1,1,14,'#3a6585');g.r(x+1,y+14,14,1,'#24405a')});g.line(4,20,9,25,'#1e3550');for(let i=0;i<4;i++){const x=R()*30|0,y=R()*30|0;g.p(x,y,'#2de2c4');g.p(x+1,y,'#1fae9a')}}
function dungeonWall(g){g.r(0,0,32,32,'#2e2456');for(let row=0;row<3;row++){const off=row%2?8:0;for(let x=-16+off;x<32;x+=16){g.r(x+1,row*8+1,14,7,'#4b3c82');g.r(x+1,row*8+1,14,1,'#6a55b0')}}g.r(0,24,32,8,'#231a44');g.r(0,24,32,1,'#3a2f6a');g.p(5,25,'#2de2c4');g.p(6,25,'#2de2c4');g.p(22,26,'#2de2c4')}
function house(g,R){
  g.r(68,2,12,22,'#9a8f8a');g.r(68,2,4,22,'#c9c0b8');g.r(66,0,16,4,'#6f6670');g.r(66,0,16,1,'#a9a0a0');
  g.r(0,8,96,52,R[1]);
  for(let k=0,y=14;y<54;y+=7,k++){g.r(0,y+4,96,2,R[2]);for(let xx=(k%2)*5;xx<96;xx+=10){g.p(xx+1,y,R[0]);g.p(xx+2,y,R[0]);g.p(xx+3,y+1,R[0]);g.r(xx+9,y,1,4,R[2])}}
  g.r(0,8,96,5,R[0]);g.r(0,8,96,1,'#ffffff');g.r(0,13,96,1,R[2]);g.r(0,8,3,52,R[0]);g.r(93,8,3,52,R[2]);g.r(0,56,96,4,R[3]);
  g.r(8,60,80,36,'#e8b070');for(let xx=15;xx<88;xx+=8)g.r(xx,64,1,32,'#c98a4a');g.r(8,60,80,4,'#8a4f2a');g.r(8,60,4,36,'#9a5a30');g.r(84,60,4,36,'#6e3a22');g.r(8,77,80,3,'#8a4f2a');g.r(8,77,80,1,'#b06a38');
  g.r(4,94,88,8,'#a99f95');for(let xx=10;xx<92;xx+=10)g.r(xx,94,1,8,'#7a7068');g.r(4,94,88,1,'#cfc6bb');g.r(4,101,88,1,'#6a6058');
  g.r(41,71,14,23,'#6e3a22');g.r(43,69,10,2,'#6e3a22');[44,48,52].forEach(xx=>g.r(xx,73,1,21,'#4f2a18'));g.r(42,72,1,22,'#9a5a30');g.p(51,84,'#ffd84a');g.p(51,85,'#e09a1e');g.r(38,94,20,3,'#cfc6bb');
  [18,64].forEach(wx=>{g.r(wx,65,14,13,'#6e3a22');g.r(wx+2,67,10,9,'#ffd36a');g.r(wx+2,67,10,3,'#fff0b0');g.r(wx+6,67,2,9,'#6e3a22');g.r(wx+2,71,10,1,'#6e3a22');g.r(wx-1,78,16,4,'#a9622f');g.r(wx-1,78,16,1,'#d18a4a');for(let i=0;i<5;i++){g.p(wx+i*3,77,'#ff5a6a');g.p(wx+i*3+1,76,'#ff79a8');g.p(wx+i*3+1,77,'#3eae4c')}});
}
function tree(g,P,seed){
  g.r(27,52,10,24,'#8a4f2a');g.r(27,52,4,24,'#b06a38');g.r(34,52,3,24,'#5e3220');g.r(22,72,20,4,'#8a4f2a');g.r(22,72,5,4,'#b06a38');
  g.disc(32,30,23,P[0]);g.disc(17,38,12,P[0]);g.disc(47,38,12,P[0]);
  g.disc(31,27,20,P[1]);g.disc(17,34,10,P[1]);g.disc(45,34,10,P[1]);
  g.disc(28,23,15,P[2]);g.disc(17,31,7,P[2]);g.disc(42,26,8,P[2]);
  g.disc(24,18,9,P[3]);g.disc(37,15,5,P[3]);g.disc(14,28,4,P[3]);g.disc(21,14,3.5,P[4]);
  const R=rng(seed||7);for(let i=0;i<34;i++){const a=R()*6.28,d=R()*19,x=32+Math.cos(a)*d,y=28+Math.sin(a)*d*.9;const top=y<26;g.p(x,y,top?P[4]:P[2]);g.p(x+1,y+1,top?P[3]:P[1])}
}
const TREE_P=['#1f6a44','#2a8a47','#3eae4c','#5ccc55','#8fe36a'];
const PROPS={
 tile_grass_a:{w:32,h:32,tile:1,fn:g=>grass(g,11,0)},
 tile_grass_b:{w:32,h:32,tile:1,fn:g=>grass(g,29,0)},
 tile_grass_c:{w:32,h:32,tile:1,fn:g=>grass(g,53,0)},
 tile_grass_flowers:{w:32,h:32,tile:1,fn:g=>grass(g,71,4)},
 tile_grass_flowers_b:{w:32,h:32,tile:1,fn:g=>grass(g,97,3)},
 tile_path_a:{w:32,h:32,tile:1,fn:g=>pathTile(g,5)},
 tile_path_b:{w:32,h:32,tile:1,fn:g=>pathTile(g,17)},
 tile_forest_a:{w:32,h:32,tile:1,fn:g=>{grass(g,41,0,['#25806a','#1f6f5a','#35a07a','#6fd6a0','#155a4a']);g.p(9,9,'#7ff5e0');g.p(10,9,'#2de2c4')}},
 tile_forest_b:{w:32,h:32,tile:1,fn:g=>{grass(g,43,0,['#25806a','#1f6f5a','#35a07a','#6fd6a0','#155a4a']);g.r(18,18,4,3,'#ff5a8a');g.r(19,17,2,1,'#ff9ab8');g.r(19,21,2,2,'#fff1cf')}},
 tile_dungeon_floor:{w:32,h:32,tile:1,fn:g=>dungeonFloor(g,3)},
 tile_dungeon_wall:{w:32,h:32,tile:1,fn:g=>dungeonWall(g)},
 prop_house_red:{w:96,h:104,fn:g=>house(g,['#ff7a6a','#e84a4a','#b82f45','#7d1d3d'])},
 prop_house_blue:{w:96,h:104,fn:g=>house(g,['#7ab4ff','#4a8cf0','#2f5fc4','#22378a'])},
 prop_house_teal:{w:96,h:104,fn:g=>house(g,['#6fe0c8','#35c2a6','#1f8a85','#155a66'])},
 prop_tree:{w:64,h:80,fn:g=>tree(g,TREE_P,7)},
 prop_tree_b:{w:64,h:80,fn:g=>tree(g,TREE_P,19)},
 prop_tree_gloam:{w:64,h:80,fn:g=>{tree(g,['#154a4a','#1f6f5a','#2f9a6a','#4fc48a','#9af0c0'],5);g.p(20,40,'#7ff5e0');g.p(44,30,'#7ff5e0');g.p(30,12,'#c58bff')}},
 prop_bush:{w:32,h:24,fn:g=>{g.disc(16,14,10,'#1f6a44');g.disc(9,15,6,'#1f6a44');g.disc(23,15,6,'#1f6a44');g.disc(15,12,8,'#2a8a47');g.disc(13,10,5,'#3eae4c');g.disc(11,8,2,'#5ccc55');[[18,14],[22,12],[10,16],[20,18]].forEach(p=>{g.p(p[0],p[1],'#ff5a6a');g.p(p[0]-1,p[1]-1,'#ffb0b8')})}},
 prop_fence:{w:32,h:22,fn:g=>{[2,26].forEach(x=>{g.r(x,2,4,19,'#a9622f');g.r(x,2,2,19,'#d18a4a');g.r(x,1,4,1,'#d18a4a')});[6,13].forEach(y=>{g.r(0,y,32,3,'#c98a4a');g.r(0,y,32,1,'#f0b26a');g.r(0,y+2,32,1,'#8a4f2a')})}},
 prop_well:{w:48,h:58,fn:g=>{g.r(8,12,4,30,'#8a4f2a');g.r(8,12,2,30,'#b06a38');g.r(36,12,4,30,'#6e3a22');g.r(4,4,40,10,'#e84a4a');g.r(4,4,40,3,'#ff7a6a');g.r(4,11,40,3,'#b82f45');for(let x=8;x<44;x+=8)g.r(x,7,1,4,'#b82f45');g.r(2,2,44,2,'#7d1d3d');g.line(24,14,24,26,'#e8c98f');g.r(21,26,6,6,'#a9622f');g.r(21,26,6,1,'#d18a4a');
   g.r(4,40,40,12,'#9a8f8a');g.ell(24,51,20,4,'#9a8f8a');for(let x=10;x<42;x+=8){g.r(x,42,1,9,'#7a7068')}g.r(4,46,40,1,'#7a7068');g.ell(24,40,20,7,'#cfc6bb');g.ell(24,40,15,4.5,'#1f3a6a');g.ell(24,41,13,3,'#2a96d8');g.r(18,40,6,1,'#7fe3ff')}},
 prop_lamp:{w:16,h:58,fn:g=>{g.r(6,18,4,36,'#6e3a22');g.r(6,18,2,36,'#a9622f');g.r(3,51,10,6,'#7a7068');g.r(3,51,10,1,'#a99f95');g.r(2,5,12,14,'#2b2145');g.r(4,7,8,10,'#ffd36a');g.r(4,7,8,3,'#fff0b0');g.r(7,7,2,10,'#2b2145');g.r(1,3,14,3,'#3a2a4a');g.r(5,1,6,2,'#3a2a4a');g.r(4,18,8,2,'#3a2a4a')}},
 prop_barrel:{w:20,h:24,fn:g=>{g.r(3,1,14,22,'#b06a38');g.r(1,4,18,16,'#b06a38');g.r(4,1,4,22,'#d18a4a');g.r(13,1,4,22,'#7a4526');g.r(1,6,18,2,'#5a5f7a');g.r(1,16,18,2,'#5a5f7a');g.r(1,6,18,1,'#9aa0c0');g.r(3,1,14,2,'#e8a868')}},
 prop_crate:{w:22,h:22,fn:g=>{g.r(1,1,20,20,'#c98a4a');g.r(1,1,20,3,'#8a4f2a');g.r(1,18,20,3,'#8a4f2a');g.r(1,1,3,20,'#8a4f2a');g.r(18,1,3,20,'#8a4f2a');g.line(4,17,17,4,'#8a4f2a');g.line(5,17,17,5,'#8a4f2a');g.r(1,1,20,1,'#f0b26a')}},
 prop_campfire:{w:32,h:20,fn:g=>{[[5,13],[10,16],[16,17],[22,16],[27,13],[8,9],[24,9]].forEach(p=>{g.disc(p[0],p[1],2.4,'#8f86a8');g.p(p[0]-1,p[1]-1,'#c9c0d8')});g.line(8,14,24,8,'#8a4f2a');g.line(8,15,24,9,'#5e3220');g.line(8,8,24,14,'#a9622f');g.line(8,9,24,15,'#6e3a22');g.disc(16,12,2,'#ff7a2a');g.p(16,11,'#ffd36a')}},
 prop_rock:{w:24,h:16,fn:g=>{g.ell(12,9,10,6,'#6a6390');g.ell(11,8,9,5,'#8f86b8');g.ell(9,6,4,2,'#b9b0dc');g.p(18,11,'#3fbf4f');g.p(17,12,'#8ef06a')}},
 prop_sign:{w:24,h:30,fn:g=>{g.r(10,14,4,15,'#8a4f2a');g.r(10,14,2,15,'#b06a38');g.r(1,3,22,12,'#c98a4a');g.r(1,3,22,2,'#f0b26a');g.r(1,13,22,2,'#8a4f2a');g.r(5,7,8,1,'#6e3a22');g.r(5,10,12,1,'#6e3a22')}},
 prop_crystal:{w:22,h:28,fn:g=>{g.poly([[3,26],[1,15],[5,9],[8,26]],'#7fe3ff');g.poly([[7,26],[8,6],[11,0],[14,6],[15,26]],'#c58bff');g.poly([[11,0],[14,6],[15,26],[11,26]],'#9a5adf');g.line(9,7,9,24,'#f0dcff');g.poly([[15,26],[17,12],[21,17],[20,26]],'#7fe3ff');g.line(2,16,3,24,'#e8fbff')}},
 prop_torch:{w:12,h:30,fn:g=>{g.r(4,12,4,16,'#6e3a22');g.r(4,12,2,16,'#a9622f');g.r(2,10,8,3,'#5a5f7a');g.disc(6,7,3.6,'#ff7a2a');g.poly([[3,8],[6,0],[9,8]],'#ff7a2a');g.disc(6,8,2,'#ffd36a');g.p(6,5,'#ffd36a')}},
};

/* ---------- UI 9-SLICES (24x24, slice 8; bars 12x12, slice 4) ---------- */
const UI={
 panel:g=>{g.rr(0,0,24,24,INK,3);g.rr(2,2,20,20,'#8b9fe0',2);g.r(4,2,16,1,'#d3ddff');g.r(4,21,16,1,'#5a6aa8');g.rr(4,4,16,16,'#171f3d',1);g.r(5,4,14,1,'#2c3868')},
 panel_gold:g=>{g.rr(0,0,24,24,INK,3);g.rr(2,2,20,20,'#ffc43d',2);g.r(4,2,16,1,'#fff0b0');g.r(4,21,16,1,'#d98a1c');g.rr(4,4,16,16,'#171f3d',1);g.r(5,4,14,1,'#2c3868')},
 panel_inset:g=>{g.rr(0,0,24,24,'#0b0f22',2);g.rr(2,2,20,20,'#0f1530',1);g.r(3,21,18,1,'#2c3868');g.r(21,3,1,18,'#2c3868')},
 tooltip:g=>{g.rr(0,0,24,24,INK,3);g.rr(2,2,20,20,'#45538f',2);g.r(4,2,16,1,'#8b9fe0');g.rr(4,4,16,16,'#10162e',1)},
 btn_gold:g=>{g.rr(0,0,24,24,INK,3);g.rr(2,2,20,20,'#b8761a',2);g.rr(2,2,20,17,'#ffc43d',2);g.r(4,3,16,1,'#fff0b0');g.r(3,4,1,12,'#ffe27a');g.r(4,17,16,1,'#e8a52a')},
 btn_gold_hover:g=>{g.rr(0,0,24,24,INK,3);g.rr(2,2,20,20,'#c98a1c',2);g.rr(2,2,20,17,'#ffd866',2);g.r(4,3,16,1,'#ffffff');g.r(3,4,1,12,'#fff0b0');g.r(4,17,16,1,'#f0b43a')},
 btn_gold_down:g=>{g.rr(0,0,24,24,INK,3);g.rr(2,2,20,20,'#e0a52a',2);g.r(4,2,16,2,'#b8761a');g.r(2,4,2,14,'#c98a1c')},
 btn_off:g=>{g.rr(0,0,24,24,INK,3);g.rr(2,2,20,20,'#262e52',2);g.rr(2,2,20,17,'#38427a',2);g.r(4,3,16,1,'#4d5890')},
 btn_slate:g=>{g.rr(0,0,24,24,INK,3);g.rr(2,2,20,20,'#1c2448',2);g.rr(2,2,20,17,'#2c3868',2);g.r(4,3,16,1,'#5a6aa8');g.r(3,4,1,12,'#45538f')},
 btn_slate_hover:g=>{g.rr(0,0,24,24,INK,3);g.rr(2,2,20,20,'#1a8f8a',2);g.rr(2,2,20,17,'#34437c',2);g.r(4,3,16,1,'#36e0c8');g.r(3,4,1,12,'#36e0c8');g.r(20,4,1,12,'#36e0c8')},
 tab:g=>{g.rr(0,0,24,24,INK,2);g.rr(2,2,20,20,'#1c2448',1);g.r(3,2,18,1,'#45538f')},
 tab_active:g=>{g.rr(0,0,24,24,INK,2);g.rr(2,2,20,20,'#2c3868',1);g.r(3,2,18,2,'#ffc43d')},
 bar:g=>{g.w=12;g.rr(0,0,12,12,INK,1);g.rr(1,1,10,10,'#0b0f22',0)},
 slot_empty:g=>{g.rr(0,0,24,24,INK,2);g.rr(2,2,20,20,'#2c3868',2);g.rr(4,4,16,16,'#141b38',1);g.r(4,4,16,1,'#0b0f22')},
};
Object.entries(T.rarity).forEach(([k,c])=>{if(k==='sparkGold')return;UI['slot_'+k]=g=>{const hi=mix(c,'#ffffff',.45),lo=mix(c,'#000000',.35),glow=mix(c,'#141b38',.72);g.rr(0,0,24,24,INK,2);g.rr(2,2,20,20,lo,2);g.rr(2,2,20,19,c,2);g.r(4,2,16,1,hi);g.rr(4,4,16,16,glow,1);g.rr(6,6,12,12,'#141b38',0);if(k==='spark'){g.p(3,3,T.rarity.sparkGold);g.p(20,3,T.rarity.sparkGold);g.p(3,20,T.rarity.sparkGold);g.p(20,20,T.rarity.sparkGold);g.r(9,2,6,1,T.rarity.sparkGold)}}});
function nine(kind){const s=kind==='bar'?12:24;const g=G(s,s);UI[kind](g);return g.c}

/* ---------- WORDMARK (pixelised from Jersey 10, banded gold, 2px ink, drop) ---------- */
function wordmark(text){
  const f='40px "Jersey 10"';const m=G(10,10);m.x.font=f;const tw=Math.ceil(m.x.measureText(text).width);
  const W=tw+16,H=52;const src=G(W,H);src.x.font=f;src.x.textBaseline='alphabetic';src.x.fillStyle='#fff';src.x.fillText(text,8,40);
  const d=src.x.getImageData(0,0,W,H).data;let top=H,bot=0;for(let y=0;y<H;y++)for(let x=0;x<W;x++)if(d[(y*W+x)*4+3]>128){top=Math.min(top,y);bot=Math.max(bot,y)}
  const out=G(W,H+4);const hgt=Math.max(1,bot-top);const on=(x,y)=>x>=0&&y>=0&&x<W&&y<H&&d[(y*W+x)*4+3]>128;
  for(let y=0;y<H;y++)for(let x=0;x<W;x++)if(on(x,y)){const t=(y-top)/hgt;let c=t<.28?'#fff0a0':t<.55?'#ffc43d':t<.8?'#f08a1c':'#c25a12';if(!on(x,y-1))c='#fffbe6';out.p(x,y,c)}
  outline(out.c,INK);outline(out.c,INK);
  const fin=G(W,H+4);const sh=G(W,H+4);sh.img(out);sh.x.globalCompositeOperation='source-in';sh.r(0,0,W,H+4,'#0d0a1e');fin.img(sh,0,3);fin.img(out);return fin.c;
}

/* ---------- REGISTRY ---------- */
const cache={};const clearCache=()=>{Object.keys(cache).forEach(k=>delete cache[k])};
function frames(name,anim){
  const key=name+'|'+(anim||'');if(cache[key])return cache[key];let out;
  const HL=heroLook(name);
  if(HL){const hf=root.MV&&root.MV.heroFrameX||heroFrame;out=anim==='walk'?[hf(HL,0,'a'),hf(HL,-1,'idle'),hf(HL,0,'b'),hf(HL,-1,'idle')]:anim==='idle'?[hf(HL,0,'idle'),hf(HL,-1,'idle')]:[hf(HL,0,'idle')]}
  else if(CHARS[name]){const d=CHARS[name];out=anim==='walk'?[charFrame(d,0,'a'),charFrame(d,-1,'idle'),charFrame(d,0,'b'),charFrame(d,-1,'idle')]:anim==='idle'?[charFrame(d,0,'idle'),charFrame(d,-1,'idle')]:[charFrame(d,0,'idle')]}
  else if(ICONS[name]||PROPS[name]){const d=ICONS[name]||PROPS[name];const g=G(d.w,d.h);d.fn(g);if(!d.tile)outline(g.c);out=[g.c]}
  else if(UI[name])out=[nine(name)];
  else if(name==='logo'){out=[wordmark('MEDIVAL')]}
  else if(root.MV&&root.MV.extFrames){out=root.MV.extFrames(name,anim);if(!out)return null}
  else return null;
  return cache[key]=out;
}
const flashCache=new WeakMap();
function flash(c,col='#ffffff'){let m=flashCache.get(c);if(m&&m[col])return m[col];m=m||{};const g=G(c.width,c.height);g.img(c);g.x.globalCompositeOperation='source-atop';g.r(0,0,c.width,c.height,col);m[col]=g.c;flashCache.set(c,m);return g.c}
const MV=root.MV={T,INK,G,outline,mix,rng,frames,flash,nine,wordmark,CHARS,ICONS,PROPS,UI,HERO,LOOK,heroLook,_int:{HEAD,HEAD_M,faceDraw,hairPart,browsLashes,feetDraw,widen,SKINS,HAIRC,EYEC,sh,robe,hands,legs,helmDome,hood,EYES},
  list:{heroes:Object.keys(HERO).filter(k=>!HERO[k].npc),npcs:Object.keys(HERO).filter(k=>HERO[k].npc),chars:Object.keys(CHARS),icons:Object.keys(ICONS),props:Object.keys(PROPS),ui:Object.keys(UI)},
  fontsReady:(typeof document!=='undefined'&&document.fonts)?document.fonts.load('40px "Jersey 10"').then(()=>document.fonts.ready):Promise.resolve()};

/* ---------- 9-slices exposed as CSS vars: border-image: var(--ui-panel) 8 fill / 8px stretch ---------- */
if(typeof document!=='undefined'&&document.documentElement){const st=document.documentElement.style;Object.keys(UI).forEach(k=>st.setProperty('--ui-'+k,'url('+nine(k).toDataURL()+')'))}

/* ---------- <px-sprite name scale anim flip fps> ---------- */
if(typeof customElements!=='undefined'&&!customElements.get('px-sprite')){
  const live=new Set();let raf=0;
  const loop=t=>{live.forEach(el=>el._tick(t));raf=live.size?requestAnimationFrame(loop):0};
  class PxSprite extends HTMLElement{
    static get observedAttributes(){return['name','scale','anim','flip','fps']}
    connectedCallback(){if(!this._c){this._c=document.createElement('canvas');this._c.style.cssText='display:block;image-rendering:pixelated;';this.appendChild(this._c)}if(!this.style.display)this.style.display='inline-block';this.style.lineHeight='0';this._build();live.add(this);if(!raf)raf=requestAnimationFrame(loop)}
    disconnectedCallback(){live.delete(this)}
    attributeChangedCallback(){if(this._c)this._build()}
    _build(){const name=this.getAttribute('name'),anim=this.getAttribute('anim')||'';
      if(name==='logo'){MV.fontsReady.then(()=>{this._fr=frames('logo');this._draw(0,true)});return}
      this._fr=frames(name,anim==='walk'||anim==='idle'?anim:'');if(!this._fr)return;this._i=-1;this._draw(0,true)}
    _draw(i,force){const fr=this._fr;if(!fr)return;if(!force&&i===this._i)return;this._i=i;const f=fr[i%fr.length],s=+(this.getAttribute('scale')||1);const c=this._c;
      if(c.width!==f.width||c.height!==f.height){c.width=f.width;c.height=f.height}c.style.width=f.width*s+'px';c.style.height=f.height*s+'px';const x=c.getContext('2d');x.clearRect(0,0,c.width,c.height);x.drawImage(f,0,0);
      c.style.transform=this.hasAttribute('flip')&&this.getAttribute('flip')!=='false'?'scaleX(-1)':''}
    _tick(t){const a=this.getAttribute('anim');if(!a||!this._fr)return;const s=+(this.getAttribute('scale')||1);
      if(a==='float'){const o=[0,-1,-2,-1][Math.floor(t/180)%4];this._c.style.translate='0 '+o*s+'px';return}
      if(a==='pulse'){this._c.style.filter='brightness('+(1+.18*Math.sin(t/260))+')';return}
      const fps=+(this.getAttribute('fps')||(a==='walk'?8:2.5));this._draw(Math.floor(t/(1000/fps))%this._fr.length)}
  }
  customElements.define('px-sprite',PxSprite);
  let rt=0;root.addEventListener&&root.addEventListener('mvready',()=>{clearTimeout(rt);rt=setTimeout(()=>{clearCache();live.forEach(el=>{try{el._build()}catch(e){}})},10)});
}
})();
