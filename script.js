const $=jQuery,css=v=>getComputedStyle(document.documentElement).getPropertyValue(v).trim();
const store={get(k){try{return +localStorage.getItem(k)||0}catch(e){return 0}},set(k,v){try{localStorage.setItem(k,v)}catch(e){}}};
let sound=true;
function beep(f,d=.08){if(!sound)return;try{const a=beep.a||(beep.a=new(window.AudioContext||window.webkitAudioContext)()),o=a.createOscillator(),g=a.createGain();o.type='square';o.frequency.value=f;g.gain.value=.04;o.connect(g);g.connect(a.destination);o.start();o.stop(a.currentTime+d)}catch(e){}}
const cv=(box,w,h)=>{const c=$('<canvas class="game-cv"></canvas>').attr({width:w,height:h}).appendTo(box)[0];return[c,c.getContext('2d')]};

function blk(x,px,py,s,c){x.fillStyle=c;x.beginPath();x.roundRect(px,py,s,s,s*.22);x.fill();const g=x.createLinearGradient(px,py,px,py+s);g.addColorStop(0,'rgba(255,255,255,.55)');g.addColorStop(.45,'rgba(255,255,255,0)');g.addColorStop(1,'rgba(0,0,0,.4)');x.fillStyle=g;x.fill();x.strokeStyle='rgba(255,255,255,.35)';x.lineWidth=1;x.stroke()}
function ball(x,cx,cy,r,c){x.fillStyle=c;x.beginPath();x.arc(cx,cy,r-1,0,7);x.fill();const g=x.createRadialGradient(cx-r*.35,cy-r*.4,1,cx,cy,r);g.addColorStop(0,'rgba(255,255,255,.95)');g.addColorStop(.35,'rgba(255,255,255,0)');g.addColorStop(1,'rgba(0,0,0,.45)');x.fillStyle=g;x.fill()}
/* ---------- O’YINLAR ---------- */
const GAMES={};

GAMES.xo={title:'X-O',emoji:'❌⭕',desc:'Kompyuterga qarshi yoki do’st bilan',init(box,c){
  let b=Array(9).fill(''),turn='X',ai=true,lock=false,tm;
  const L=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  const win=(s,p)=>L.some(l=>l.every(i=>s[i]==p));
  const mm=(s,p)=>{if(win(s,'O'))return 1;if(win(s,'X'))return -1;if(s.every(v=>v))return 0;let best=p=='O'?-2:2;s.forEach((v,i)=>{if(!v){s[i]=p;const r=mm(s,p=='O'?'X':'O');s[i]='';best=p=='O'?Math.max(best,r):Math.min(best,r)}});return best};
  const ui=$(`<div class="text-center"><div class="flex gap-2 justify-center mb-3"><button data-m="1" class="chip on">🤖 Kompyuter</button><button data-m="0" class="chip">👥 2 kishi</button></div><div class="xo"></div><p class="msg mt-3 font-bold h-6"></p></div>`).appendTo(box);
  const msg=t=>ui.find('.msg').text(t);
  function draw(){ui.find('.xo').html(b.map((v,i)=>`<button data-i="${i}" style="color:${v=='X'?'#ef4444':'#3b82f6'}">${v}</button>`).join(''))}
  function reset(){b=Array(9).fill('');turn='X';lock=false;draw();msg(ai?'Sizning yurishingiz (X)':'X yuradi')}
  function after(){
    const w=['X','O'].find(p=>win(b,p));
    if(w||b.every(v=>v)){lock=true;beep(w?880:300,.2);
      if(w){msg(ai?(w=='X'?'Siz yutdingiz! 🎉':'Kompyuter yutdi 🤖'):w+' yutdi! 🎉');if(ai&&w=='X')c.add(10)}else{msg('Durang 🤝');if(ai)c.add(2)}
      tm=setTimeout(reset,1600);return true}
    return false}
  function aiMove(){
    if(c.paused){tm=setTimeout(aiMove,300);return}
    const e=b.map((v,i)=>v?-1:i).filter(i=>i>=0);let pick;
    if(Math.random()<.2)pick=e[Math.random()*e.length|0];
    else{let best=-2;e.forEach(i=>{b[i]='O';const r=mm(b,'X');b[i]='';if(r>best){best=r;pick=i}})}
    b[pick]='O';turn='X';draw();if(!after()){lock=false;msg('Sizning yurishingiz (X)')}}
  ui.on('click','.chip',function(){ui.find('.chip').removeClass('on');$(this).addClass('on');ai=$(this).data('m')==1;clearTimeout(tm);reset()});
  ui.on('click','.xo button',function(){
    const i=+$(this).data('i');if(lock||c.paused||b[i])return;
    b[i]=turn;beep(turn=='X'?520:400);draw();
    if(after())return;
    if(ai){turn='O';lock=true;msg('Kompyuter o’ylamoqda…');tm=setTimeout(aiMove,500)}
    else{turn=turn=='X'?'O':'X';msg(turn+' yuradi')}});
  reset();
  return{stop(){clearTimeout(tm)}}}};

GAMES.snake={title:'Ilon',emoji:'🐍',desc:'Olmani yeb o’sing',pad:true,init(box,c){
  const N=20,S=20,[el,x]=cv(box,400,400);
  let sn=[{x:10,y:10},{x:9,y:10},{x:8,y:10}],d={x:1,y:0},q=[],f,last=0,id,sp=130;
  const place=()=>{do f={x:Math.random()*N|0,y:Math.random()*N|0};while(sn.some(s=>s.x==f.x&&s.y==f.y))};place();
  function draw(){x.fillStyle=css('--cell');x.fillRect(0,0,400,400);for(let i=0;i<N;i++)for(let j=0;j<N;j++){x.fillStyle=(i+j)%2?'rgba(120,180,120,.16)':'rgba(120,180,120,.05)';x.fillRect(i*S,j*S,S,S)}x.save();x.shadowColor='#ef4444';x.shadowBlur=16;ball(x,f.x*S+10,f.y*S+10,9,'#ef4444');x.restore();
    sn.forEach((s,i)=>{blk(x,s.x*S+1,s.y*S+1,S-2,i?'#4ade80':'#15803d');if(!i)[-1,1].forEach(q=>{const ex=s.x*S+10+d.x*3-d.y*q*4,ey=s.y*S+10+d.y*3+d.x*q*4;x.fillStyle='#fff';x.beginPath();x.arc(ex,ey,3,0,7);x.fill();x.fillStyle='#111';x.beginPath();x.arc(ex+d.x,ey+d.y,1.5,0,7);x.fill()})})}
  function step(){if(q.length)d=q.shift();
    const h={x:sn[0].x+d.x,y:sn[0].y+d.y};
    if(h.x<0||h.y<0||h.x>=N||h.y>=N||sn.some(s=>s.x==h.x&&s.y==h.y)){beep(150,.3);c.end();return}
    sn.unshift(h);
    if(h.x==f.x&&h.y==f.y){c.add(10);beep(700);sp=Math.max(65,sp-3);place()}else sn.pop()}
  function loop(ts){id=requestAnimationFrame(loop);if(c.paused||c.over)return;if(ts-last>sp){last=ts;step();draw()}}
  draw();id=requestAnimationFrame(loop);
  const V={left:[-1,0],right:[1,0],up:[0,-1],down:[0,1]};
  return{stop(){cancelAnimationFrame(id)},onKey(k){const v=V[k];if(!v)return;const l=q.length?q[q.length-1]:d;if(l.x+v[0]==0&&l.y+v[1]==0)return;if(q.length<3)q.push({x:v[0],y:v[1]})}}}};

GAMES.tetris={title:'Tetris',emoji:'🧱',desc:'Qatorlarni to’ldiring',pad:true,init(box,c){
  const W=10,H=20,S=24,[el,x]=cv(box,240,480);
  const P=[[[1,1,1,1]],[[1,1],[1,1]],[[0,1,0],[1,1,1]],[[1,0,0],[1,1,1]],[[0,0,1],[1,1,1]],[[0,1,1],[1,1,0]],[[1,1,0],[0,1,1]]];
  const col=['','#22d3ee','#facc15','#c084fc','#60a5fa','#fb923c','#4ade80','#f87171'];
  let b=Array.from({length:H},()=>Array(W).fill(0)),p,lines=0,last=0,id;
  const rot=m=>m[0].map((_,i)=>m.map(r=>r[i]).reverse());
  const hit=(m,px,py)=>m.some((r,j)=>r.some((v,i)=>v&&(px+i<0||px+i>=W||py+j>=H||(py+j>=0&&b[py+j][px+i]))));
  const spawn=()=>{const k=Math.random()*7|0;p={m:P[k],c:k+1,x:3,y:0};if(hit(p.m,p.x,p.y)){beep(120,.4);c.end()}};
  function lock(){p.m.forEach((r,j)=>r.forEach((v,i)=>{if(v)b[p.y+j][p.x+i]=p.c}));
    let n=0;for(let j=H-1;j>=0;j--)if(b[j].every(v=>v)){b.splice(j,1);b.unshift(Array(W).fill(0));n++;j++}
    if(n){c.add([0,100,300,500,800][n]);lines+=n;beep(660,.15)}else beep(200,.04);spawn()}
  function down(){if(!hit(p.m,p.x,p.y+1))p.y++;else lock()}
  function draw(){x.fillStyle=css('--cell');x.fillRect(0,0,240,480);x.strokeStyle='rgba(128,128,160,.16)';x.lineWidth=1;for(let i=1;i<W;i++){x.beginPath();x.moveTo(i*S,0);x.lineTo(i*S,480);x.stroke()}for(let j=1;j<H;j++){x.beginPath();x.moveTo(0,j*S);x.lineTo(240,j*S);x.stroke()}
    const cell=(i,j,k)=>blk(x,i*S+1,j*S+1,S-2,col[k]);
    b.forEach((r,j)=>r.forEach((v,i)=>v&&cell(i,j,v)));
    if(!c.over){let gy=p.y;while(!hit(p.m,p.x,gy+1))gy++;x.globalAlpha=.25;p.m.forEach((r,j)=>r.forEach((v,i)=>v&&cell(p.x+i,gy+j,p.c)));x.globalAlpha=1;p.m.forEach((r,j)=>r.forEach((v,i)=>v&&cell(p.x+i,p.y+j,p.c)))}}
  function loop(ts){id=requestAnimationFrame(loop);if(c.paused||c.over)return;if(ts-last>Math.max(100,700-lines*30)){last=ts;down();draw()}}
  spawn();draw();id=requestAnimationFrame(loop);
  return{stop(){cancelAnimationFrame(id)},onKey(k){
    if(k=='left'&&!hit(p.m,p.x-1,p.y))p.x--;
    else if(k=='right'&&!hit(p.m,p.x+1,p.y))p.x++;
    else if(k=='down'){down();c.add(1)}
    else if(k=='up'){const r=rot(p.m);if(!hit(r,p.x,p.y))p.m=r;else if(!hit(r,p.x-1,p.y)){p.m=r;p.x--}else if(!hit(r,p.x+1,p.y)){p.m=r;p.x++}}
    else if(k=='act'){while(!hit(p.m,p.x,p.y+1))p.y++;lock()}
    draw()}}}};

GAMES.g2048={title:'2048',emoji:'🔢',desc:'Raqamlarni birlashtiring',init(box,c){
  let g=Array.from({length:4},()=>Array(4).fill(0));
  const el=$('<div class="g2048"></div>').appendTo(box);
  const add=()=>{const e=[];g.forEach((r,y)=>r.forEach((v,i)=>!v&&e.push([i,y])));if(!e.length)return;const[i,y]=e[Math.random()*e.length|0];g[y][i]=Math.random()<.9?2:4};
  const slide=r=>{const a=r.filter(v=>v);let gain=0;for(let i=0;i<a.length-1;i++)if(a[i]==a[i+1]){a[i]*=2;gain+=a[i];a.splice(i+1,1)}while(a.length<4)a.push(0);return[a,gain]};
  const can=()=>g.some((r,y)=>r.some((v,i)=>!v||(g[y][i+1]===v)||(g[y+1]&&g[y+1][i]===v)));
  function draw(){el.html(g.flat().map(v=>`<div class="t" style="${v?`background:linear-gradient(145deg,hsl(${(Math.log2(v)*38+10)%360} 85% 62%),hsl(${(Math.log2(v)*38+10)%360} 75% 42%));box-shadow:inset 0 2px 0 rgba(255,255,255,.4),0 3px 8px rgba(0,0,0,.25);text-shadow:0 2px 3px rgba(0,0,0,.35)`:''}">${v||''}</div>`).join(''))}
  add();add();draw();
  return{stop(){},onKey(k){
    if(!['left','right','up','down'].includes(k))return;
    const old=JSON.stringify(g),h=k=='left'||k=='right',rev=k=='right'||k=='down';let gain=0;
    for(let i=0;i<4;i++){let line=h?g[i].slice():g.map(r=>r[i]);if(rev)line.reverse();let[a,s]=slide(line);gain+=s;if(rev)a.reverse();for(let j=0;j<4;j++){if(h)g[i][j]=a[j];else g[j][i]=a[j]}}
    if(JSON.stringify(g)!=old){add();if(gain){c.add(gain);beep(500)}else beep(300,.04);draw();if(!can()){beep(120,.4);c.end()}}}}}};

GAMES.blast={title:'Block Blast',emoji:'💎',desc:'Bloklarni sudrab qatorlarni tozalang',init(box,c){
  const S=44,[el,x]=cv(box,360,520),CL=['#ef4444','#f59e0b','#22c55e','#3b82f6','#a855f7','#ec4899','#14b8a6'];
  const SH=[[[1]],[[1,1]],[[1],[1]],[[1,1,1]],[[1],[1],[1]],[[1,1],[1,1]],[[1,1,1],[1,1,1],[1,1,1]],[[1,0],[1,0],[1,1]],[[1,1],[1,0]],[[0,1],[1,1]],[[1,1,1,1]],[[1,1,0],[0,1,1]]];
  let b=Array.from({length:8},()=>Array(8).fill(0)),tray=[],dr=null,id;
  const nt=()=>{tray=[0,1,2].map(()=>({m:SH[Math.random()*SH.length|0],c:CL[Math.random()*7|0]}))};nt();
  const fit=(m,gx,gy)=>gx>=0&&gy>=0&&gy+m.length<=8&&gx+m[0].length<=8&&m.every((r,j)=>r.every((v,i)=>!v||!b[gy+j][gx+i]));
  const any=()=>tray.some(p=>p&&b.some((_,y)=>b[0].some((_,i)=>fit(p.m,i,y))));
  const pt=e=>{const r=el.getBoundingClientRect();return[(e.clientX-r.left)*360/r.width,(e.clientY-r.top)*520/r.height]};
  const snap=()=>{const m=tray[dr.i].m;return[Math.round((dr.x-m[0].length*S/2-4)/S),Math.round((dr.y-70-m.length*S/2-4)/S)]};
  function place(p,gx,gy){let n=0;p.m.forEach((r,j)=>r.forEach((v,i)=>{if(v){b[gy+j][gx+i]=p.c;n++}}));
    const rows=[],cs=[];for(let k=0;k<8;k++){if(b[k].every(v=>v))rows.push(k);if(b.every(r=>r[k]))cs.push(k)}
    rows.forEach(k=>b[k]=Array(8).fill(0));cs.forEach(k=>b.forEach(r=>r[k]=0));
    const L=rows.length+cs.length;c.add(n+L*L*10);beep(L?800:350,L?.2:.05)}
  el.onpointerdown=e=>{if(c.paused||c.over)return;const[px,py]=pt(e),i=Math.floor(px/120);if(py>370&&tray[i]){dr={i,x:px,y:py};el.setPointerCapture(e.pointerId)}};
  el.onpointermove=e=>{if(dr)[dr.x,dr.y]=pt(e)};
  el.onpointerup=()=>{if(!dr)return;const p=tray[dr.i],[gx,gy]=snap();if(fit(p.m,gx,gy)){place(p,gx,gy);tray[dr.i]=null;if(tray.every(v=>!v))nt();if(!any()){beep(120,.4);c.end()}}dr=null};
  function draw(){id=requestAnimationFrame(draw);const cc=css('--cell');x.clearRect(0,0,360,520);
    for(let j=0;j<8;j++)for(let i=0;i<8;i++){const v=b[j][i];if(v)blk(x,4+i*S+1,4+j*S+1,S-2,v);else{x.fillStyle=cc;x.beginPath();x.roundRect(4+i*S+2,4+j*S+2,S-4,S-4,8);x.fill()}}
    if(dr){const p=tray[dr.i],[gx,gy]=snap();if(fit(p.m,gx,gy)){x.globalAlpha=.4;p.m.forEach((r,j)=>r.forEach((v,i)=>v&&blk(x,4+(gx+i)*S+1,4+(gy+j)*S+1,S-2,p.c)));x.globalAlpha=1}}
    tray.forEach((p,i)=>{if(!p||(dr&&dr.i==i))return;const tx=60+i*120-p.m[0].length*12,ty=440-p.m.length*12;p.m.forEach((r,j)=>r.forEach((v,k)=>v&&blk(x,tx+k*24,ty+j*24,22,p.c)))});
    if(dr){const p=tray[dr.i],ox=dr.x-p.m[0].length*S/2,oy=dr.y-70-p.m.length*S/2;p.m.forEach((r,j)=>r.forEach((v,i)=>v&&blk(x,ox+i*S+1,oy+j*S+1,S-2,p.c)))}}
  draw();return{stop(){cancelAnimationFrame(id)}}}};

GAMES.bubble={title:'Bubble Shooter',emoji:'🫧',desc:'3 ta bir xil rangni portlating',init(box,c){
  const R=18,DY=31,RW=14,[el,x]=cv(box,360,520),CL=['#ef4444','#facc15','#22c55e','#3b82f6','#a855f7'];
  const cols=r=>r%2?9:10,px=(r,k)=>R+k*2*R+(r%2?R:0),py=r=>R+r*DY,rc=()=>CL[Math.random()*5|0];
  const row=r=>Array.from({length:cols(r)},rc),emp=r=>Array(cols(r)).fill(null);
  let g=Array.from({length:RW},(_,r)=>r<5?row(r):emp(r)),fly=null,cur=rc(),nxt=rc(),ang=-Math.PI/2,id,shots=0;
  const nbr=(r,k)=>{const o=r%2?[0,1]:[-1,0],a=[[r,k-1],[r,k+1]];[r-1,r+1].forEach(q=>o.forEach(d=>a.push([q,k+d])));return a.filter(([q,z])=>q>=0&&q<RW&&z>=0&&z<cols(q))};
  function flood(starts,test){const seen=new Set(),out=[],st=[...starts];while(st.length){const[r,k]=st.pop(),key=r*20+k;if(seen.has(key)||!test(r,k))continue;seen.add(key);out.push([r,k]);nbr(r,k).forEach(n=>st.push(n))}return out}
  function land(){let best=[0,0],bd=1e9;g.forEach((rw,r)=>rw.forEach((v,k)=>{if(!v){const d=Math.hypot(px(r,k)-fly.x,py(r)-fly.y);if(d<bd){bd=d;best=[r,k]}}}));
    const[r,k]=best,col=fly.c;g[r][k]=col;fly=null;shots++;
    const grp=flood([[r,k]],(a,b)=>g[a][b]===col);
    if(grp.length>=3){grp.forEach(([a,b])=>g[a][b]=null);c.add(grp.length*10);beep(600,.12);
      const top=flood(g[0].map((_,i)=>[0,i]),(a,b)=>g[a][b]),keep=new Set(top.map(([a,b])=>a*20+b));
      g.forEach((rw,a)=>rw.forEach((v,b)=>{if(v&&!keep.has(a*20+b)){g[a][b]=null;c.add(20)}}))}else beep(250,.05);
    if(shots%8==0){g.pop();g.pop();g.unshift(row(0),row(1))}
    if(g.every(rw=>rw.every(v=>!v))){c.add(200);for(let i=0;i<5;i++)g[i]=row(i)}
    if(g[12].some(v=>v)){beep(120,.4);c.end()}
    cur=nxt;nxt=rc()}
  function shoot(){if(fly||c.paused||c.over)return;fly={x:180,y:490,a:ang,c:cur};beep(320,.05)}
  function aim(e){const r=el.getBoundingClientRect(),mx=(e.clientX-r.left)*360/r.width,my=(e.clientY-r.top)*520/r.height;ang=Math.max(-Math.PI+.15,Math.min(-.15,Math.atan2(my-490,mx-180)))}
  el.onpointermove=e=>{if(!c.paused)aim(e)};el.onpointerdown=aim;el.onpointerup=shoot;
  function draw(){id=requestAnimationFrame(draw);
    if(!c.paused&&!c.over&&fly){for(let s=0;s<2&&fly;s++){fly.x+=Math.cos(fly.a)*6;fly.y+=Math.sin(fly.a)*6;
      if(fly.x<R||fly.x>360-R){fly.x=Math.max(R,Math.min(360-R,fly.x));fly.a=Math.PI-fly.a}
      let hit=fly.y<=R;if(!hit)g.forEach((rw,r)=>rw.forEach((v,k)=>{if(v&&Math.hypot(px(r,k)-fly.x,py(r)-fly.y)<2*R-3)hit=true}));if(hit)land()}}
    x.clearRect(0,0,360,520);x.fillStyle=css('--cell');x.fillRect(0,468,360,3);
    g.forEach((rw,r)=>rw.forEach((v,k)=>v&&ball(x,px(r,k),py(r),R,v)));
    x.setLineDash([2,8]);x.strokeStyle=css('--mut');x.lineWidth=3;x.beginPath();x.moveTo(180,490);x.lineTo(180+Math.cos(ang)*140,490+Math.sin(ang)*140);x.stroke();x.setLineDash([]);
    ball(x,180,490,R,cur);ball(x,40,495,12,nxt);if(fly)ball(x,fly.x,fly.y,R,fly.c)}
  draw();return{stop(){cancelAnimationFrame(id)},onKey(k){if(k=='left')ang=Math.max(-Math.PI+.15,ang-.08);if(k=='right')ang=Math.min(-.15,ang+.08);if(k=='act')shoot()}}}};

GAMES.memory={title:'Xotira',emoji:'🃏',desc:'Juft kartalarni toping',init(box,c){
  const E=['🦊','🐼','🐸','🦄','🐙','🍉','🚀','⭐'];let a,open=[],lock=false,moves,done,tm=[];
  const el=$('<div class="mc"></div>').appendTo(box);
  function reset(){a=[...E,...E].sort(()=>Math.random()-.5);open=[];lock=false;moves=0;done=0;el.html(a.map((e,i)=>`<div class="cd" data-i="${i}"><div class="in"><div class="fa fr">?</div><div class="fa bk">${e}</div></div></div>`).join(''))}
  el.on('click','.cd',function(){if(lock||c.paused||$(this).hasClass('f'))return;$(this).addClass('f');beep(450,.05);open.push($(this));
    if(open.length<2)return;moves++;const[p,q]=open;open=[];
    if(a[p.data('i')]==a[q.data('i')]){p.addClass('m');q.addClass('m');c.add(50);beep(800,.15);if(++done==8){c.add(Math.max(0,200-moves*8));tm.push(setTimeout(reset,1500))}}
    else{lock=true;tm.push(setTimeout(()=>{p.removeClass('f');q.removeClass('f');lock=false},750))}});
  reset();return{stop(){tm.forEach(clearTimeout)}}}};

GAMES.mines={title:'Minalar',emoji:'💣',desc:'Minalarni topmasdan oching',init(box,c){
  const N=9,M=10,NC=['','#3b82f6','#16a34a','#ef4444','#7c3aed','#b45309','#0891b2','#111','#666'];
  let m,r,f,first,flag=false,done,lost,tm;
  const ui=$('<div class="text-center"><div class="mb-3"><button class="chip" id="fl">🚩 Bayroq: o’chiq</button></div><div class="ms"></div></div>').appendTo(box);
  const nb=(i,j,fn)=>{for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++){const y=i+a,x=j+b;if((a||b)&&y>=0&&x>=0&&y<N&&x<N)fn(y,x)}};
  const cnt=(i,j)=>{let n=0;nb(i,j,(y,x)=>n+=m[y][x]);return n};
  const grid=()=>Array.from({length:N},()=>Array(N).fill(0));
  function reset(){m=grid();r=grid();f=grid();first=true;done=lost=false;draw()}
  function draw(){ui.find('.ms').html(r.map((rw,i)=>rw.map((v,j)=>{let t='',s='',cl='';
    if(v){cl='o';const n=cnt(i,j);t=m[i][j]?'💣':(n||'');s=`color:${NC[n]}`}else if(lost&&m[i][j])t='💣';else if(f[i][j])t='🚩';
    return`<button class="${cl}" style="${s}" data-i="${i}" data-j="${j}">${t}</button>`}).join('')).join(''))}
  function opn(i,j){if(r[i][j]||f[i][j])return;r[i][j]=1;c.add(1);if(!m[i][j]&&!cnt(i,j))nb(i,j,opn)}
  function tap(i,j,fl){if(done||c.paused||r[i][j])return;
    if(fl){f[i][j]=!f[i][j];beep(300,.04);draw();return}if(f[i][j])return;
    if(first){first=false;let n=0;while(n<M){const y=Math.random()*N|0,x=Math.random()*N|0;if(!m[y][x]&&!(Math.abs(y-i)<2&&Math.abs(x-j)<2)){m[y][x]=1;n++}}}
    if(m[i][j]){lost=done=true;draw();beep(120,.4);c.end();return}
    opn(i,j);beep(500,.04);draw();
    if(r.flat().filter(v=>v).length==N*N-M){done=true;c.add(100);beep(900,.3);tm=setTimeout(reset,1600)}}
  ui.on('click','#fl',function(){flag=!flag;$(this).toggleClass('on',flag).text(flag?'🚩 Bayroq: yoniq':'🚩 Bayroq: o’chiq')});
  ui.on('click','.ms button',function(){tap(+$(this).data('i'),+$(this).data('j'),flag)});
  ui.on('contextmenu','.ms button',function(e){e.preventDefault();tap(+$(this).data('i'),+$(this).data('j'),true)});
  reset();return{stop(){clearTimeout(tm)}}}};

const ART={
xo:`<svg viewBox="0 0 200 110"><g stroke="#fff" stroke-opacity=".55" stroke-width="4" stroke-linecap="round"><path d="M86 12v86M114 12v86M58 40h84M58 70h84"/></g><g stroke="#ff5d73" stroke-width="7" stroke-linecap="round"><path d="M64 16l16 16M80 16L64 32M120 76l16 16M136 76l-16 16M64 76l16 16M80 76L64 92"/></g><g fill="none" stroke="#4cc9ff" stroke-width="7"><circle cx="100" cy="55" r="9"/><circle cx="136" cy="24" r="9"/></g></svg>`,
snake:`<svg viewBox="0 0 200 110"><path d="M18 84C48 84 46 42 78 42S112 80 142 68" stroke="#15803d" stroke-width="17" fill="none" stroke-linecap="round"/><path d="M18 84C48 84 46 42 78 42S112 80 142 68" stroke="#4ade80" stroke-width="10" fill="none" stroke-linecap="round"/><circle cx="146" cy="66" r="12" fill="#22c55e"/><g fill="#fff"><circle cx="150" cy="60" r="3.5"/><circle cx="150" cy="72" r="3.5"/></g><g fill="#111"><circle cx="151" cy="60" r="1.6"/><circle cx="151" cy="72" r="1.6"/></g><circle cx="180" cy="34" r="12" fill="#ef4444"/><circle cx="176" cy="30" r="3.5" fill="#fff" opacity=".7"/><path d="M180 22c3-7 9-8 9-8" stroke="#4ade80" stroke-width="3" fill="none" stroke-linecap="round"/></svg>`,
tetris:`<svg viewBox="0 0 200 110"><defs><rect id="tt" width="22" height="22" rx="5"/></defs><g stroke="#fff" stroke-opacity=".45"><use href="#tt" x="94" y="6" fill="#c084fc"/><use href="#tt" x="118" y="6" fill="#c084fc"/><use href="#tt" x="142" y="6" fill="#c084fc"/><use href="#tt" x="118" y="30" fill="#c084fc"/><use href="#tt" x="46" y="82" fill="#22d3ee"/><use href="#tt" x="70" y="82" fill="#facc15"/><use href="#tt" x="94" y="82" fill="#4ade80"/><use href="#tt" x="118" y="82" fill="#fb923c"/><use href="#tt" x="142" y="82" fill="#60a5fa"/><use href="#tt" x="70" y="58" fill="#facc15"/><use href="#tt" x="94" y="58" fill="#4ade80"/><use href="#tt" x="142" y="58" fill="#f87171"/></g></svg>`,
g2048:`<svg viewBox="0 0 200 110"><g font-family="Outfit,sans-serif" font-weight="900" font-size="20" text-anchor="middle" fill="#fff"><rect x="12" y="34" width="38" height="38" rx="9" fill="#f59e0b"/><text x="31" y="60">2</text><rect x="56" y="34" width="38" height="38" rx="9" fill="#f97316"/><text x="75" y="60">4</text><rect x="100" y="34" width="38" height="38" rx="9" fill="#ef4444"/><text x="119" y="60">8</text><rect x="144" y="26" width="46" height="54" rx="11" fill="#facc15"/><text x="167" y="59" font-size="15" fill="#1c1b22">2048</text></g></svg>`,
blast:`<svg viewBox="0 0 200 110"><defs><rect id="bk" width="24" height="24" rx="6"/></defs><g stroke="#fff" stroke-opacity=".5"><use href="#bk" x="46" y="12" fill="#ef4444"/><use href="#bk" x="74" y="12" fill="#ef4444"/><use href="#bk" x="102" y="12" fill="#f59e0b"/><use href="#bk" x="46" y="40" fill="#ef4444"/><use href="#bk" x="102" y="40" fill="#22c55e"/><use href="#bk" x="130" y="40" fill="#22c55e"/><use href="#bk" x="46" y="68" fill="#3b82f6"/><use href="#bk" x="74" y="68" fill="#3b82f6"/><use href="#bk" x="102" y="68" fill="#a855f7"/><use href="#bk" x="130" y="68" fill="#ec4899"/></g><g fill="#fff" fill-opacity=".16"><use href="#bk" x="74" y="40"/><use href="#bk" x="130" y="12"/></g></svg>`,
bubble:`<svg viewBox="0 0 200 110"><defs><radialGradient id="gl" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#fff" stop-opacity=".85"/><stop offset=".4" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".4"/></radialGradient><g id="bb"><circle r="11" fill="currentColor"/><circle r="11" fill="url(#gl)"/></g></defs><use href="#bb" x="20" y="16" style="color:#ef4444"/><use href="#bb" x="44" y="16" style="color:#ef4444"/><use href="#bb" x="68" y="16" style="color:#facc15"/><use href="#bb" x="92" y="16" style="color:#3b82f6"/><use href="#bb" x="116" y="16" style="color:#22c55e"/><use href="#bb" x="140" y="16" style="color:#22c55e"/><use href="#bb" x="164" y="16" style="color:#a855f7"/><use href="#bb" x="188" y="16" style="color:#ef4444"/><use href="#bb" x="32" y="37" style="color:#facc15"/><use href="#bb" x="56" y="37" style="color:#3b82f6"/><use href="#bb" x="80" y="37" style="color:#3b82f6"/><use href="#bb" x="104" y="37" style="color:#a855f7"/><use href="#bb" x="128" y="37" style="color:#22c55e"/><use href="#bb" x="152" y="37" style="color:#ef4444"/><use href="#bb" x="176" y="37" style="color:#facc15"/><use href="#bb" x="44" y="58" style="color:#a855f7"/><use href="#bb" x="68" y="58" style="color:#ef4444"/><use href="#bb" x="92" y="58" style="color:#3b82f6"/><path d="M100 82V70" stroke="#fff" stroke-width="3" stroke-dasharray="2 5" stroke-linecap="round"/><use href="#bb" x="100" y="96" style="color:#facc15"/></svg>`,
memory:`<svg viewBox="0 0 200 110"><g transform="rotate(-8 70 55)"><rect x="38" y="20" width="64" height="76" rx="10" fill="#a855f7" stroke="#fff" stroke-opacity=".5" stroke-width="2"/><text x="70" y="70" font-size="34" font-weight="900" text-anchor="middle" fill="#fff">?</text></g><g transform="rotate(8 135 55)"><rect x="103" y="16" width="64" height="76" rx="10" fill="#fff"/><text x="135" y="68" font-size="36" text-anchor="middle">🦊</text></g></svg>`,
mines:`<svg viewBox="0 0 200 110"><defs><rect id="mc" width="26" height="26" rx="6"/></defs><g fill="#9b9ab8"><use href="#mc" x="28" y="10"/><use href="#mc" x="57" y="10"/><use href="#mc" x="86" y="10"/><use href="#mc" x="115" y="39"/><use href="#mc" x="144" y="39"/><use href="#mc" x="28" y="68"/><use href="#mc" x="57" y="68"/></g><g fill="#e8eaf8"><use href="#mc" x="115" y="10"/><use href="#mc" x="144" y="10"/><use href="#mc" x="28" y="39"/><use href="#mc" x="57" y="39"/><use href="#mc" x="86" y="39"/><use href="#mc" x="86" y="68"/><use href="#mc" x="115" y="68"/><use href="#mc" x="144" y="68"/></g><g font-family="Outfit,sans-serif" font-weight="900" font-size="17" text-anchor="middle"><text x="41" y="58" fill="#3b82f6">1</text><text x="70" y="58" fill="#16a34a">2</text><text x="99" y="58" fill="#ef4444">3</text><text x="99" y="87" fill="#3b82f6">1</text></g><text x="70" y="88" font-size="18" text-anchor="middle">🚩</text><text x="128" y="29" font-size="18" text-anchor="middle">💣</text></svg>`,
chess:`<svg viewBox="0 0 200 110"><g fill="#ece9ff"><rect x="20" y="14" width="40" height="40"/><rect x="100" y="14" width="40" height="40"/><rect x="60" y="54" width="40" height="40"/><rect x="140" y="54" width="40" height="40"/></g><g fill="#6d5cff"><rect x="60" y="14" width="40" height="40"/><rect x="140" y="14" width="40" height="40"/><rect x="20" y="54" width="40" height="40"/><rect x="100" y="54" width="40" height="40"/></g><text x="80" y="48" font-size="36" text-anchor="middle" fill="#14142b">♞</text><text x="120" y="88" font-size="36" text-anchor="middle" fill="#fff" stroke="#14142b" stroke-width="1.2">♛</text></svg>`,
checkers:`<svg viewBox="0 0 200 110"><g fill="#ece9ff"><rect x="20" y="14" width="40" height="40"/><rect x="100" y="14" width="40" height="40"/><rect x="60" y="54" width="40" height="40"/><rect x="140" y="54" width="40" height="40"/></g><g fill="#6d5cff"><rect x="60" y="14" width="40" height="40"/><rect x="140" y="14" width="40" height="40"/><rect x="20" y="54" width="40" height="40"/><rect x="100" y="54" width="40" height="40"/></g><circle cx="80" cy="34" r="15" fill="#ef4444" stroke="#fff" stroke-opacity=".6" stroke-width="3"/><circle cx="40" cy="74" r="15" fill="#ef4444" stroke="#fff" stroke-opacity=".6" stroke-width="3"/><circle cx="120" cy="74" r="15" fill="#1f1f33" stroke="#fff" stroke-opacity=".5" stroke-width="3"/><circle cx="160" cy="34" r="15" fill="#1f1f33" stroke="#fff" stroke-opacity=".5" stroke-width="3"/></svg>`};
GAMES.chess={title:'Shaxmat',emoji:'♟️',desc:'Kompyuterga qarshi (oq bilan)',init(box,c){
  const G={p:'♟︎',n:'♞',b:'♝',r:'♜',q:'♛',k:'♚'},V={p:1,n:3,b:3,r:5,q:9,k:100},D=[[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]],N=[[1,2],[2,1],[-1,2],[-2,1],[1,-2],[2,-1],[-1,-2],[-2,-1]];
  let b,turn,sel,mv,tm,done;
  const ui=$('<div class="text-center"><div class="bd"></div><p class="msg mt-3 font-bold h-6"></p></div>').appendTo(box),msg=t=>ui.find('.msg').text(t);
  const ins=(y,x)=>y>=0&&x>=0&&y<8&&x<8;
  function pm(b,r,c){const p=b[r][c],t=p[1],w=p[0],o=[];
    const add=(y,x)=>{if(!ins(y,x))return false;const q=b[y][x];if(q&&q[0]==w)return false;o.push([y,x]);return !q};
    if(t=='p'){const d=w=='w'?-1:1;if(ins(r+d,c)&&!b[r+d][c]){o.push([r+d,c]);if(r==(w=='w'?6:1)&&!b[r+2*d][c])o.push([r+2*d,c])}[-1,1].forEach(s=>{const y=r+d,x=c+s;if(ins(y,x)&&b[y][x]&&b[y][x][0]!=w)o.push([y,x])})}
    else if(t=='n')N.forEach(([a,e])=>add(r+a,c+e));else if(t=='k')D.forEach(([a,e])=>add(r+a,c+e));
    else(t=='r'?D.slice(0,4):t=='b'?D.slice(4):D).forEach(([a,e])=>{let y=r+a,x=c+e;while(add(y,x)){y+=a;x+=e}});
    return o}
  const mk=(b,r,c,y,x)=>{const n=b.map(R=>R.slice());let p=n[r][c];if(p[1]=='p'&&(y==0||y==7))p=p[0]+'q';n[y][x]=p;n[r][c]='';return n};
  const kingIn=(b,w)=>{let ky,kx;b.forEach((R,y)=>R.forEach((p,x)=>{if(p==w+'k'){ky=y;kx=x}}));return b.some((R,y)=>R.some((p,x)=>p&&p[0]!=w&&pm(b,y,x).some(([a,e])=>a==ky&&e==kx)))};
  const legal=(b,r,c)=>pm(b,r,c).filter(([y,x])=>!kingIn(mk(b,r,c,y,x),b[r][c][0]));
  const all=(b,w,lg)=>{const o=[];b.forEach((R,y)=>R.forEach((p,x)=>{if(p&&p[0]==w)(lg?legal(b,y,x):pm(b,y,x)).forEach(([a,e])=>o.push([y,x,a,e]))}));return o};
  const sc=b=>{let s=0;b.forEach(R=>R.forEach(p=>{if(p)s+=(p[0]=='b'?1:-1)*V[p[1]]}));return s};
  function aiPick(){let best=-1e9,pick;all(b,'b',true).forEach(([y,x,a,e])=>{const nb=mk(b,y,x,a,e);let worst=1e9;all(nb,'w',false).forEach(([y2,x2,a2,e2])=>{const s=sc(mk(nb,y2,x2,a2,e2));if(s<worst)worst=s});if(worst==1e9)worst=sc(nb);worst+=Math.random()*.4;if(worst>best){best=worst;pick=[y,x,a,e]}});return pick}
  function draw(){ui.find('.bd').html(b.map((R,y)=>R.map((p,x)=>`<div class="sq ${(x+y)%2?'d':'l'}${sel&&sel[0]==y&&sel[1]==x?' sel':''}${mv.some(([a,e])=>a==y&&e==x)?' mv':''}" data-y="${y}" data-x="${x}">${p?`<span class="pc ${p[0]}">${G[p[1]]}</span>`:''}</div>`).join('')).join(''))}
  function start(){const bk='rnbqkbnr'.split('');b=[bk.map(t=>'b'+t),Array(8).fill('bp'),...Array.from({length:4},()=>Array(8).fill('')),Array(8).fill('wp'),bk.map(t=>'w'+t)];turn='w';sel=null;mv=[];done=false;draw();msg('Sizning yurishingiz (oq)')}
  function play(y,x,a,e){const q=b[a][e];if(q&&turn=='w')c.add(V[q[1]]*10);b=mk(b,y,x,a,e);sel=null;mv=[];beep(q?700:450,.08);turn=turn=='w'?'b':'w';draw();after()}
  function after(){const ms=all(b,turn,true),chk=kingIn(b,turn);
    if(!ms.length){done=true;if(!chk){msg('Durang 🤝');c.add(50);tm=setTimeout(start,2200)}else if(turn=='b'){msg('Mat! Siz yutdingiz 🎉');c.add(500);beep(900,.3);tm=setTimeout(start,2200)}else{beep(120,.4);c.end()}return}
    msg(chk?'Shoh! ⚠️':(turn=='w'?'Sizning yurishingiz (oq)':'Kompyuter o’ylamoqda…'));if(turn=='b')tm=setTimeout(ai,450)}
  function ai(){if(c.paused){tm=setTimeout(ai,300);return}const m=aiPick();if(m)play(...m)}
  ui.on('click','.sq',function(){if(turn!='w'||c.paused||done)return;const y=+$(this).data('y'),x=+$(this).data('x');
    if(sel&&mv.some(([a,e])=>a==y&&e==x)){play(sel[0],sel[1],y,x);return}
    if(b[y][x]&&b[y][x][0]=='w'){sel=[y,x];mv=legal(b,y,x);beep(420,.04)}else{sel=null;mv=[]}draw()});
  start();return{stop(){clearTimeout(tm)}}}};

GAMES.checkers={title:'Shashka',emoji:'🔴',desc:'Majburiy urish, damka bo’lish',init(box,c){
  let b,turn,sel,chain,tm,done;
  const ui=$('<div class="text-center"><div class="bd"></div><p class="msg mt-3 font-bold h-6"></p></div>').appendTo(box),msg=t=>ui.find('.msg').text(t);
  const inb=(y,x)=>y>=0&&x>=0&&y<8&&x<8,dirs=p=>p=='r'?[[-1,-1],[-1,1]]:p=='b'?[[1,-1],[1,1]]:[[-1,-1],[-1,1],[1,-1],[1,1]];
  const steps=(y,x)=>{const p=b[y][x],o=[];dirs(p).forEach(([dy,dx])=>{const ny=y+dy,nx=x+dx;if(!inb(ny,nx))return;const q=b[ny][nx];if(!q)o.push({f:[y,x],t:[ny,nx]});else if(q.toLowerCase()!=p.toLowerCase()){const jy=ny+dy,jx=nx+dx;if(inb(jy,jx)&&!b[jy][jx])o.push({f:[y,x],t:[jy,jx],cap:[ny,nx]})}});return o};
  const all=s=>{const o=[];b.forEach((R,y)=>R.forEach((p,x)=>{if(p&&p.toLowerCase()==s&&(!chain||(chain[0]==y&&chain[1]==x)))o.push(...steps(y,x))}));const cp=o.filter(m=>m.cap);return cp.length?cp:o};
  function draw(){const tg=sel&&turn=='r'?all('r').filter(m=>m.f[0]==sel[0]&&m.f[1]==sel[1]).map(m=>m.t):[];
    ui.find('.bd').html(b.map((R,y)=>R.map((p,x)=>`<div class="sq ${(x+y)%2?'d':'l'}${sel&&sel[0]==y&&sel[1]==x?' sel':''}${tg.some(t=>t[0]==y&&t[1]==x)?' mv':''}" data-y="${y}" data-x="${x}">${p?`<span class="ck ${p.toLowerCase()}">${p<'a'?'♛':''}</span>`:''}</div>`).join('')).join(''))}
  function start(){b=Array.from({length:8},(_,y)=>Array.from({length:8},(_,x)=>(x+y)%2?(y<3?'b':y>4?'r':''):''));turn='r';sel=null;chain=null;done=false;draw();msg('Sizning yurishingiz (qizil)')}
  function move(m){const[fy,fx]=m.f,[ty,tx]=m.t;let p=b[fy][fx],pro=false;b[fy][fx]='';if(p=='r'&&ty==0){p='R';pro=true}if(p=='b'&&ty==7){p='B';pro=true}b[ty][tx]=p;
    if(m.cap){b[m.cap[0]][m.cap[1]]='';if(turn=='r')c.add(10);beep(650,.08)}else beep(420,.05);if(pro&&turn=='r')c.add(20);
    chain=m.cap&&!pro&&steps(ty,tx).some(s=>s.cap)?[ty,tx]:null;if(!chain)turn=turn=='r'?'b':'r';sel=chain;draw();after()}
  function after(){const ms=all(turn);if(!ms.length){done=true;if(turn=='b'){msg('Siz yutdingiz! 🎉');c.add(100);beep(900,.3);tm=setTimeout(start,2200)}else{beep(120,.4);c.end()}return}
    msg(turn=='r'?(chain?'Yana yeng!':'Sizning yurishingiz (qizil)'):'Kompyuter o’ylamoqda…');if(turn=='b')tm=setTimeout(ai,500)}
  function ai(){if(c.paused){tm=setTimeout(ai,300);return}const sc=m=>(m.cap?10:0)+(m.t[0]==7&&b[m.f[0]][m.f[1]]=='b'?5:0)+m.t[0]*.3+Math.random()*3,ms=all('b').sort((a,e)=>sc(e)-sc(a));move(ms[0])}
  ui.on('click','.sq',function(){if(turn!='r'||c.paused||done)return;const y=+$(this).data('y'),x=+$(this).data('x'),ms=all('r'),m=sel&&ms.find(m=>m.f[0]==sel[0]&&m.f[1]==sel[1]&&m.t[0]==y&&m.t[1]==x);
    if(m){move(m);return}if(!chain)sel=ms.some(m=>m.f[0]==y&&m.f[1]==x)?[y,x]:null;draw()});
  start();return{stop(){clearTimeout(tm)}}}};

/* ---------- SAYT QOBIG‘I ---------- */
const c={paused:false,over:false,id:null,inst:null,score:0,best:0};
c.add=n=>{c.score+=n;if(c.score>c.best){c.best=c.score;store.set('best_'+c.id,c.best)}ui()};
c.end=()=>{c.over=true;overlay('O’yin tugadi 💥','Natija: '+c.score,'Qayta o’ynash',start)};
const ui=()=>{const s=$('#sc');s.text(c.score).removeClass('pop');void s[0].offsetWidth;if(c.score)s.addClass('pop');$('#bs').text(c.best)};
function overlay(t,s,b,fn){$('#stage .ov').remove();$('<div class="ov"><div class="text-3xl font-black"></div><div></div><button class="btn"></button></div>').appendTo('#stage').find('div:eq(0)').text(t).end().find('div:eq(1)').text(s).end().find('button').text(b).on('click',fn)}
function start(){
  if(c.inst)c.inst.stop();
  Object.assign(c,{paused:false,over:false,score:0,best:store.get('best_'+c.id)});ui();$('#pz').text('⏸ Pauza');
  $('#stage').empty();$('#pad').toggleClass('on',!!GAMES[c.id].pad);
  c.inst=GAMES[c.id].init($('#stage'),c)}
function open(id){c.id=id;$('#home').addClass('hidden');$('#play').removeClass('hidden');$('#gt').text(GAMES[id].emoji+' '+GAMES[id].title);start()}
function close(){if(c.inst)c.inst.stop();c.inst=null;c.id=null;$('#play').addClass('hidden');$('#home').removeClass('hidden');home()}
function togglePause(){if(!c.inst||c.over)return;c.paused=!c.paused;$('#pz').text(c.paused?'▶ Davom':'⏸ Pauza');if(c.paused)overlay('Pauza ⏸','','Davom etish',togglePause);else $('#stage .ov').remove()}
function home(){$('#grid').html(Object.entries(GAMES).map(([id,g],n)=>`<button class="card gc p-4 text-center" data-id="${id}" style="--h:${n*47+8}"><div class="art">${ART[id]||''}</div><div class="font-black text-lg">${g.emoji} ${g.title}</div><div class="text-xs" style="opacity:.9">${g.desc}</div><div class="go">O’ynash ▶ · 🏆 ${store.get('best_'+id)}</div></button>`).join(''))}
home();
$('#grid').on('click','.card',function(){open($(this).data('id'))});
$('#back').on('click',close);$('#rs').on('click',start);$('#pz').on('click',togglePause);
$('#snd').on('click',function(){sound=!sound;$(this).text(sound?'🔊':'🔇')});
$('#thm').on('click',()=>{const r=document.documentElement,dark=r.dataset.theme?r.dataset.theme=='dark':matchMedia('(prefers-color-scheme:dark)').matches;r.dataset.theme=dark?'light':'dark'});
const KM={ArrowLeft:'left',a:'left',ArrowRight:'right',d:'right',ArrowUp:'up',w:'up',ArrowDown:'down',s:'down',' ':'act'};
const press=k=>{if(c.inst&&c.inst.onKey&&!c.paused&&!c.over)c.inst.onKey(k)};
$(document).on('keydown',e=>{if(!c.id)return;if(e.key=='p'||e.key=='P'){togglePause();return}const k=KM[e.key];if(!k)return;e.preventDefault();press(k)});
$('#pad').on('click','button',function(){press($(this).data('k'))});
let t0;$('#stage').on('touchstart',e=>{const t=e.originalEvent.touches[0];t0=[t.clientX,t.clientY]}).on('touchend',e=>{if(!t0)return;const t=e.originalEvent.changedTouches[0],dx=t.clientX-t0[0],dy=t.clientY-t0[1];t0=null;if(Math.max(Math.abs(dx),Math.abs(dy))<30)return;press(Math.abs(dx)>Math.abs(dy)?(dx>0?'right':'left'):(dy>0?'down':'up'))});