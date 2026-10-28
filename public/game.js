/* Warplands game engine, computer opponent and interface.
   Runs in the browser (createGame()) and on the Cloudflare server (createGame({server:true,...})). */
import {ART} from './art.js';
export function createGame(HOST={}){

/* ================= SOUND =================
   Small synthesized effects (no audio files). Browsers only allow sound after a click, so the
   audio context starts on the first interaction. */
const SFX={ctx:null,on:true,last:{}};
try{SFX.on=localStorage.getItem('tb-sound')!=='off'}catch(e){}
function audioCtx(){
  if(typeof window==='undefined')return null;
  if(!SFX.ctx){const A=window.AudioContext||window.webkitAudioContext;if(!A)return null;try{SFX.ctx=new A()}catch(e){return null}}
  if(SFX.ctx.state==='suspended')SFX.ctx.resume().catch(()=>{});
  return SFX.ctx;
}
function noiseBuf(ctx,dur){const n=Math.floor(ctx.sampleRate*dur),b=ctx.createBuffer(1,n,ctx.sampleRate),d=b.getChannelData(0);for(let i=0;i<n;i++)d[i]=Math.random()*2-1;return b}
function env(ctx,g,t,a,peak,dec){g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(peak,t+a);g.gain.exponentialRampToValueAtTime(0.0001,t+a+dec)}
function tone(ctx,out,t,f0,f1,dur,peak,type){const o=ctx.createOscillator(),g=ctx.createGain();o.type=type||'sine';o.frequency.setValueAtTime(f0,t);o.frequency.exponentialRampToValueAtTime(f1,t+dur);env(ctx,g,t,0.005,peak,dur);o.connect(g).connect(out);o.start(t);o.stop(t+dur+0.05)}
function noise(ctx,out,t,dur,peak,ftype,f0,f1,q){const s=ctx.createBufferSource(),f=ctx.createBiquadFilter(),g=ctx.createGain();s.buffer=noiseBuf(ctx,dur+0.05);f.type=ftype;f.Q.value=q||1;f.frequency.setValueAtTime(f0,t);f.frequency.exponentialRampToValueAtTime(f1,t+dur);env(ctx,g,t,0.008,peak,dur);s.connect(f).connect(g).connect(out);s.start(t);s.stop(t+dur+0.05)}
const SOUNDS={
  /* Draw: a crisp card flick off the stack and a soft swish as it lands */
  draw:(ctx,out,t)=>{noise(ctx,out,t,0.09,1.1,'bandpass',2600,5200,1.2);noise(ctx,out,t+0.075,0.11,0.8,'bandpass',1500,900,0.9)},
  /* Site built: just a soft, warm ding with a faint airy breath */
  build:(ctx,out,t)=>{noise(ctx,out,t,0.45,0.09,'bandpass',1800,900,0.7);tone(ctx,out,t+0.02,392,388,0.8,0.16,'sine');tone(ctx,out,t+0.06,587.33,582,0.7,0.09,'sine')},
  place:(ctx,out,t,n)=>{for(let i=0;i<Math.min(n||1,4);i++){const u=t+i*0.07;tone(ctx,out,u,640,420,0.07,0.28,'triangle');noise(ctx,out,u,0.02,0.08,'highpass',3000,3000)}},
  hit:(ctx,out,t)=>{tone(ctx,out,t,190,55,0.18,0.55);noise(ctx,out,t,0.07,0.3,'highpass',1800,900)},
  struct:(ctx,out,t)=>{tone(ctx,out,t,95,45,0.22,0.5);noise(ctx,out,t,0.2,0.35,'lowpass',900,250,0.8);noise(ctx,out,t+0.05,0.08,0.12,'bandpass',2500,1200,2)},
  destroy:(ctx,out,t)=>{noise(ctx,out,t,0.9,0.5,'lowpass',2600,140,0.7);tone(ctx,out,t,70,32,0.8,0.55);for(let i=0;i<5;i++)noise(ctx,out,t+0.15+i*0.09+Math.random()*0.04,0.04,0.12,'bandpass',1800+Math.random()*1500,900,3)},
  /* Victory: a rising fanfare that lands on a bright chord */
  win:(ctx,out,t)=>{[523.25,659.25,783.99,1046.5].forEach((f,i)=>tone(ctx,out,t+i*0.12,f,f,0.16,0.3,'triangle'));
    [523.25,659.25,783.99,1046.5].forEach(f=>tone(ctx,out,t+0.52,f,f*1.002,1.0,0.14,'triangle'));
    for(let i=0;i<4;i++)tone(ctx,out,t+0.6+i*0.1,2093+i*260,2093+i*260,0.12,0.05,'sine')},
  /* Upgrade: a quick climbing fanfare in fifths that rings out on a bright chord with shimmer */
  upgrade:(ctx,out,t)=>{[392,587.33,783.99].forEach((f,i)=>{tone(ctx,out,t+i*0.09,f,f,0.12,0.24,'square');tone(ctx,out,t+i*0.09,f/2,f/2,0.12,0.1,'triangle')});
    [783.99,987.77,1174.66].forEach(f=>tone(ctx,out,t+0.3,f,f*1.003,0.7,0.12,'triangle'));tone(ctx,out,t+0.3,392,392,0.7,0.12,'triangle');
    for(let i=0;i<6;i++)tone(ctx,out,t+0.34+i*0.06,2349+i*180,2349+i*180,0.09,0.035,'sine')},
  /* Your turn: a low gong with a rising two-note call on top */
  yourturn:(ctx,out,t)=>{tone(ctx,out,t,98,92,1.4,0.32,'sine');tone(ctx,out,t,196,190,1.0,0.12,'triangle');tone(ctx,out,t,293.7,290,0.8,0.06,'sine');
    noise(ctx,out,t,0.25,0.12,'bandpass',600,300,2);
    tone(ctx,out,t+0.18,587.33,587.33,0.22,0.16,'triangle');tone(ctx,out,t+0.36,880,880,0.5,0.16,'triangle');tone(ctx,out,t+0.36,1760,1760,0.3,0.04,'sine')},
  /* Reveal: a quick whoosh into a bright double chime */
  reveal:(ctx,out,t)=>{noise(ctx,out,t,0.28,0.22,'bandpass',500,3200,1.2);tone(ctx,out,t+0.2,1046.5,1046.5,0.18,0.14,'triangle');tone(ctx,out,t+0.3,1568,1568,0.35,0.12,'triangle');tone(ctx,out,t+0.3,784,784,0.4,0.08,'sine')},
  /* Defeat: a slow, sagging descent */
  lose:(ctx,out,t)=>{[392,369.99,349.23].forEach((f,i)=>tone(ctx,out,t+i*0.34,f,f*0.99,0.3,0.28,'triangle'));
    tone(ctx,out,t+1.02,329.63,293.66,1.1,0.3,'triangle');tone(ctx,out,t+1.02,164.81,146.83,1.1,0.16,'sine')}
};
function gameOverSound(){
  if(HOST.server||!G||!G.over||G.sim) return;
  const w=G.over.winner, mine=G.mode==='online'?w===ONLINE.seat:G.mode==='hot'?w!==-1:w===0;
  setTimeout(()=>sfx(mine?'win':'lose'),350);
}
function sfx(kind,n){
  if(SND_CAP&&(kind==='hit'||kind==='struct'||kind==='destroy')){SND_CAP.snd=kind;return}
  if(HOST.server){if(HOST.fx&&!(G&&G.sim))HOST.fx(kind,n);return}
  if(typeof document==='undefined'||!SFX.on||(typeof G!=='undefined'&&G&&G.sim))return;
  const now=performance.now();if(now-(SFX.last[kind]||0)<80)return;SFX.last[kind]=now;
  const ctx=SFX.ctx;if(!ctx||ctx.state!=='running')return;
  try{const out=ctx.createGain();out.gain.value=0.5;out.connect(ctx.destination);SOUNDS[kind](ctx,out,ctx.currentTime+0.01,n)}catch(e){}
}

/* ---- Damage projectiles: where each hit comes from, and the queue the browser draws ---- */
let CUR_SRC=null, SND_CAP=null;
const ARROWS={q:[],until:0};
const PEND=new Map(), PENDZ=new Map(), GHOSTS=new Map();
async function withSrc(src,fn){const prev=CUR_SRC;CUR_SRC=src;try{return await fn()}finally{CUR_SRC=prev}}
const UPS={q:[]};
const REV={q:[],until:0};
/* A card played from hand (reaction, attachment, or an opponent's event) is shown to both players */
function fxReveal(pi,card,to,ev){
  if(typeof G!=='undefined'&&G&&G.sim) return;
  const d={pi,id:card.def.id,uid:card.uid};if(to!=null)d.to=to;if(ev)d.ev=1;
  if(HOST.server){if(HOST.fx)HOST.fx('reveal',d);return}
  if(typeof document!=='undefined') REV.q.push(d);
}
function fxUp(d){
  if(typeof G!=='undefined'&&G&&G.sim) return;
  if(HOST.server){if(HOST.fx)HOST.fx('lvlup',d);return}
  if(typeof document!=='undefined') UPS.q.push(d);
}
function fxArrow(d){
  if(typeof G!=='undefined'&&G&&G.sim) return null;
  if(HOST.server){if(HOST.fx)HOST.fx('arrow',d);return d}
  if(typeof document==='undefined') return null;
  ARROWS.q.push(d);return d;
}
/* ================= HELPERS ================= */
const ROMAN=['','I','II','III','IV'];
const UPGRADE_COST={1:2,2:3,3:4};
let SPEED=1;
const sleep=ms=>new Promise(r=>setTimeout(r,ms*SPEED));
const HAS_DOM=!HOST.server&&typeof document!=='undefined';

const isYou=p=>p.name==='You';
const s_=p=>isYou(p)?'':'s';
const poss=p=>isYou(p)?'your':p.name+"'s";
const Poss=p=>isYou(p)?'Your':p.name+"'s";
const subj=p=>isYou(p)?'You are':p.name+' is';
const hotPfx=p=>G&&G.mode==='hot'?p.name+': ':'';

const hasAtt=(s,id)=>s.attachments.some(a=>a.def.id===id);
const integ=s=>(s.card.def.integrity||3)+3*s.attachments.filter(a=>a.def.id==='retrofit').length;
const isFort=s=>!!s.card.def.fortified||s.attachments.some(a=>a.def.fortify);
const canGain=s=>!hasAtt(s,'threat');
const canLeave=s=>!hasAtt(s,'sanctions');
const totalF=p=>p.sites.reduce((a,s)=>a+s.followers,0);
const allSites=()=>G.players.flatMap(p=>p.sites);
const inPlay=s=>G.players[s.owner].sites.includes(s);
const minNeed=s=>{const ab=(s.card.def.abilities||[]);return ab.length?Math.min(...ab.map(a=>a.need)):0};
const startSite=p=>p.sites.find(s=>s.card.def.start);
const ofId=(p,id)=>p.sites.filter(s=>s.card.def.id===id);

/* Abilities: Hex blocks them; Academy lowers requirements */
function abilBlocked(site){return hasAtt(site,'sabotage')}
function univBonus(site){const p=G.players[site.owner];return p.sites.some(u=>u!==site&&u.card.def.id==='university'&&u.followers>=1&&!abilBlocked(u))?1:0}
const effNeed=(site,ab)=>hasAtt(site,'compnet')?0:Math.max(0,ab.need-univBonus(site));
function needOf(s){const ab=(s.card.def.abilities||[]);return ab.length?Math.min(...ab.map(a=>effNeed(s,a))):0}

/* Aegis shields its owner's other sites from opponents' damage */
function ffProtects(site){return G.players[site.owner].sites.some(f=>f!==site&&f.card.def.id==='forcefield'&&!abilBlocked(f)&&f.followers>=effNeed(f,f.card.def.abilities[0]))}
/* AI valuation helpers */
function dmgValue(site,n){
  if(ffProtects(site)) return -0.5;
  const left=integ(site)-site.damage;
  const w=(site.card.def.worth||1)+(site.card.def.attacker?2.5:0);
  if(n>=left) return site.followers+2+w;
  const killed=isFort(site)?0:Math.min(n,site.followers);
  return killed+0.25*n+(n/left)*(Math.max(0,site.followers-killed)*0.5+w*0.5);
}
function structValue(site,n){if(ffProtects(site))return -0.5;const left=integ(site)-site.damage;return n>=left?site.followers+2+(site.card.def.worth||1):0.35*n}
function killValue(site){let v=1;if((site.card.def.abilities||[]).some(a=>!a.passive&&a.need===site.followers))v+=1.2;if(hasAtt(site,'plague'))v-=0.4;return v}
function bestOpp(c,n){let b=-1;for(const s of c.opp.sites)b=Math.max(b,dmgValue(s,n));return b}
function bestOppS(c,n){let b=-1;for(const s of c.opp.sites)b=Math.max(b,structValue(s,n));return b}
function lossOf(site,n,opt={}){
  if(site.damage+n>=integ(site)) return site.followers+(site.card.def.worth||1)+1;
  if(opt.structural||isFort(site)) return 0.2;
  return Math.min(n,site.followers);
}
function placeScore(s){
  if(!canGain(s)) return -50;
  let sc=(integ(s)-s.damage)*0.5+(isFort(s)?1.5:0);
  const need=minNeed(s);
  if(need&&s.followers<need) sc+=6-(need-s.followers);
  if(s.card.def.id==='farm'&&s.tucked.length&&s.followers<1) sc+=4+s.tucked.length;
  if(hasAtt(s,'plague')) sc-=5;
  if(hasAtt(s,'sabotage')) sc-=2;
  return sc-s.followers*0.15;
}
/* How far through the game we are: 1 at the start, 0 when the draw stacks are empty */
function gameLeft(){if(!G||!G.stacks)return 0.5;let n=0;for(const l of [1,2,3,4])n+=G.stacks[l].length;return Math.min(1,n/50)}
/* A card under Fields pays out 1 Zealot every harvest, so it is worth more the longer the game has left */
function fieldsTuckVal(s){return (0.5+2.2*gameLeft())*(s.followers>0?1:0.75)}
function keepValue(k){return k.def.level+(k.def.type==='reaction'?1:0)+(k.def.type==='site'?0.3:0)}
function wantsMore(c){
  const a=c.me.actions+1, uc=UPGRADE_COST[c.me.level];
  return c.me.hand.some(k=>k.def.type!=='reaction'&&k.def.cost>c.me.actions&&k.def.cost<=a)||(uc&&uc>c.me.actions&&uc<=a);
}
/* Best way to split n damage across at most maxSites of the given sites */
function bestAlloc(sites,n,maxSites,val){
  let best={v:-1e9,a:new Map()};
  const rec=(i,left,used,cur,v)=>{
    if(left===0){if(v>best.v)best={v,a:new Map(cur)};return}
    if(i>=sites.length||used>=maxSites) return;
    for(let k=left;k>=1;k--){cur.set(sites[i],k);rec(i+1,left-k,used+1,cur,v+val(sites[i],k));cur.delete(sites[i])}
    rec(i+1,left,used,cur,v);
  };
  if(n>0) rec(0,n,0,new Map(),0);
  return best;
}

/* Shared effect pieces */
/* Cards tucked under a site, as its abilities count them */
const TUCK_SITES={farm:1,port:1.1,bank:1.2,alienweapon:2};
function tuckN(site){return site.tucked.length}
/* Record kills; note any Healer Hut next to the site so it can save some of them */
function noteKill(pi,n,site){if(n>0&&G){const hh=site&&inPlay(site)?adjacent(site).filter(x=>x.card.def.id==='healerhut').map(x=>x.uid):[];G.pending.push({t:'kill',pi,n,hh})}}
function killOn(site,k){const x=Math.min(k,site.followers);site.followers-=x;noteKill(site.owner,x,site);sweep();return x}
function gainF(site,n){if(!canGain(site)||n<=0)return 0;site.followers+=n;sfx('place',n);return n}
function sweep(){
  if(!G) return;
  for(const s of allSites()) if(s.followers===0) for(const a of [...s.attachments]) if(a.def.id==='plague'){
    s.attachments.splice(s.attachments.indexOf(a),1);G.discard.push(a);log(`${Poss(G.players[s.owner])} ${s.card.def.name} is empty, so ${a.def.name} is discarded.`);
  }
}
function applyCounts(p,counts){let moved=0;for(const s of p.sites) if(counts[s.uid]!==undefined){if(counts[s.uid]>s.followers)moved+=counts[s.uid]-s.followers;s.followers=counts[s.uid]}if(moved)sfx('place',moved);G.pending.push({t:'reloc',pi:p.i});sweep()}
function discardFromHand(pi,k){const p=G.players[pi];p.hand.splice(p.hand.indexOf(k),1);G.discard.push(k)}
async function hit(c,n,label,o={}){
  const s=await pickSite(c.pi,{prompt:`${label}: choose ${o.opp?"an opponent's site":'a site'} to take ${n}${o.structural?' structural':''} damage.`,
    filter:s=>(o.opp?s.owner!==c.pi:(!c.me.ai||s.owner!==c.pi))&&(!o.filter||o.filter(s)),aiScore:s=>o.structural?structValue(s,n):dmgValue(s,n)});
  if(!s) return null;
  c.pay(); await damage(c.pi,s,n,{structural:!!o.structural}); return s;
}
async function gainOnOwn(c,n,label,site){
  const s=site||await pickSite(c.pi,{prompt:`${label}: choose one of your sites to gain ${n} follower${n>1?'s':''}.`,filter:s=>s.owner===c.pi&&canGain(s),aiScore:placeScore,auto:true});
  if(!s) return null;
  c.pay(); const x=gainF(s,n); log(`${c.me.name} gain${s_(c.me)} ${x} follower${x===1?'':'s'} on ${s.card.def.name}.`); return s;
}
function drawHigher(pi){
  const p=G.players[pi], l=p.level+1;
  if(l>4||!G.stacks[l].length){log(`There is no Level ${ROMAN[l]||'V'} card to draw.`);return}
  drawCard(pi,l);
}
function upgradeLevel(pi){const p=G.players[pi];if(p.level>=4)return;p.level++;log(`${p.name} upgrade${s_(p)} to Level ${ROMAN[p.level]}.`);G.pending.push({t:'upgrade'});sfx('upgrade');fxUp({pi,to:p.level})}
async function drawN(pi,n,label,maxL){
  const p=G.players[pi]; maxL=maxL||p.level; let left=n;
  while(left>0&&G&&!G.over){
    const lv=[];for(let l=1;l<=maxL;l++)if(G.stacks[l].length)lv.push(l);
    if(!lv.length){log('There are no cards left to draw.');break}
    let l=lv[lv.length-1];
    if(!p.ai&&lv.length>1) l=await pickOption(pi,{prompt:`${hotPfx(p)}${label}: draw ${left>1?left+' cards':'a card'} from which level?`,options:lv.map(x=>({label:`Level ${ROMAN[x]} (${G.stacks[x].length} left)`,value:x}))});
    const take=Math.min(left,G.stacks[l].length);
    for(let i=0;i<take;i++)drawCard(pi,l);
    left-=take;
  }
}
async function pickUpTo(c,max,o){
  const picked=[];
  for(let i=0;i<max;i++){
    const s=await pickSite(c.pi,{prompt:o.prompt(i,picked),filter:s=>!picked.includes(s)&&o.filter(s),aiScore:o.aiScore,
      extra:i>0?[{label:'Done',value:'done'}]:[],cancellable:true,auto:o.auto&&i===0});
    if(s===null&&i===0) return null;
    if(!s||s==='done') break;
    picked.push(s);
    if(c.me.ai&&o.aiStop&&o.aiStop(picked)) break;
  }
  return picked;
}
/* Split n damage among up to maxSites sites; the person picks one point at a time */
async function divideDamage(c,n,maxSites,label,filter,forced){
  if(n<=0) return null;
  if(c.me.ai){
    const b=bestAlloc(allSites().filter(s=>s.owner!==c.pi&&filter(s)),n,maxSites,dmgValue);
    return b.v>-1e8?b.a:null;
  }
  const a=new Map();
  for(let i=0;i<n;i++){
    const s=await pickSite(c.pi,{prompt:`${label}: choose a site for damage point ${i+1} of ${n} (up to ${maxSites} different sites).`,
      filter:s=>filter(s)&&(a.size<maxSites||a.has(s)),aiScore:()=>0,cancellable:i===0&&!forced});
    if(!s) return null;
    a.set(s,(a.get(s)||0)+1);
  }
  return a;
}
function fanK(c,src){let best=1,bv=-99;for(let k=1;k<=Math.min(3,src.followers);k++){const v=bestOpp(c,k)-k;if(v>bv){bv=v;best=k}}return best}
function mbK(c){let best=0,bv=-99;for(let k=1;k<=c.site.followers;k++){const v=bestOpp(c,k)-k*0.8;if(v>bv){bv=v;best=k}}return {k:best,v:bv}}
function castlePlan(p,castle){
  const counts={};let moved=0;
  for(const s of p.sites){if(s===castle)continue;const mv=canLeave(s)?Math.max(0,s.followers-minNeed(s)):0;counts[s.uid]=s.followers-mv;moved+=mv}
  counts[castle.uid]=castle.followers+moved;return{counts,moved};
}
function masonAI(c,all){
  const src=c.me.sites.filter(s=>s!==c.site&&s.damage>0&&s.followers>=2).sort((a,b)=>b.followers*b.damage-a.followers*a.damage)[0];
  if(!src)return -1;
  const mv=all?src.damage:1;
  const dst=c.me.sites.filter(s=>s!==src&&s.followers===0&&s.damage+mv<integ(s));
  return dst.length?(all?src.damage*0.8:0.8):-1;
}
async function moveDamage(c,all){
  const src=await pickSite(c.pi,{prompt:`Stonesmith: choose one of your other sites to move ${all?'all damage counters':'1 damage counter'} from.`,filter:s=>s.owner===c.pi&&s.damage>0&&s!==c.site,aiScore:s=>s.followers*s.damage,auto:true});
  if(!src)return;
  const mv=all?src.damage:1;
  const dst=await pickSite(c.pi,{prompt:`Stonesmith: choose another of your sites to receive ${mv} damage counter${mv>1?'s':''}.`,filter:s=>s.owner===c.pi&&s!==src,aiScore:s=>(s.damage+mv<integ(s)?10:0)-s.followers,auto:true});
  if(!dst)return;
  c.pay();src.damage-=mv;dst.damage+=mv;log(`${c.me.name} move${s_(c.me)} ${mv} damage counter${mv>1?'s':''} from ${src.card.def.name} to ${dst.card.def.name}.`);
  if(dst.damage>=integ(dst))destroySite(dst);
}
const HARMFUL=['plague','sabotage','threat','badomen'];
function threatPlan(p,site){
  const counts=Object.fromEntries(p.sites.map(s=>[s.uid,s.followers]));
  const dst=p.sites.filter(s=>s!==site&&canGain(s));
  let n=counts[site.uid];counts[site.uid]=0;
  while(n-->0){let best=null,bv=-1e9;for(const s of dst){const v=placeScore(s)-(counts[s.uid]-s.followers)*0.6;if(v>bv){bv=v;best=s}}counts[best.uid]++}
  return counts;
}
async function relocateBy(c,title,cost){
  const counts=c.me.ai?relocatePlan(c.me):await relocatePrompt(c.pi,{mode:'full',title,cost});
  if(!counts) return null; return counts;
}

/* Level III helpers */
const airN=s=>s.card.def.level===1?2:s.card.def.level===2?1:0;
const armsN=(c,s)=>1+Math.max(0,c.me.level-G.players[s.owner].level);
const canSteal=c=>c.opp.sites.some(s=>s.followers>0)&&c.me.sites.some(canGain);
async function steal(c,label){
  const from=await pickSite(c.pi,{prompt:`${label}: choose an opponent's site to steal a follower from.`,filter:s=>s.owner!==c.pi&&s.followers>0,aiScore:killValue});if(!from)return;
  const to=await pickSite(c.pi,{prompt:`${label}: place the stolen follower on which of your sites?`,filter:s=>s.owner===c.pi&&canGain(s),aiScore:placeScore,auto:true});if(!to)return;
  c.pay();from.followers--;to.followers++;sfx('place',1);sweep();log(`${c.me.name} steal${s_(c.me)} a follower from ${poss(G.players[from.owner])} ${from.card.def.name}.`);
}
/* Split up to n kills among at most maxSites sites; optional lets the person stop early */
async function divideKills(c,n,maxSites,label,filter,optional){
  if(c.me.ai){
    const cands=allSites().filter(s=>s.owner!==c.pi&&filter(s)&&s.followers>0);
    const b=bestAlloc(cands,n,maxSites,(s,k)=>Math.min(k,s.followers)+(k>=s.followers?0.3:0));
    if(b.v<=-1e8) return null;
    for(const [s,k] of b.a) if(k>s.followers) b.a.set(s,s.followers);
    return b.a;
  }
  const a=new Map();
  for(let i=0;i<n;i++){
    const s=await pickSite(c.pi,{prompt:`${label}: choose a site for kill ${i+1} of ${optional?'up to ':''}${n} (up to ${maxSites} different sites).`,
      filter:s=>filter(s)&&s.followers-(a.get(s)||0)>0&&(a.size<maxSites||a.has(s)),aiScore:()=>0,
      extra:optional&&i>0?[{label:'Finish',value:'done'}]:[],cancellable:i===0});
    if(!s){if(i===0)return null;break}
    if(s==='done')break;
    a.set(s,(a.get(s)||0)+1);
  }
  return a;
}
function pickDiscard(c,prompt,filter,score){
  const seen=new Set(),cands=G.discard.filter(k=>filter(k)&&!seen.has(k.def.id)&&seen.add(k.def.id));
  if(!cands.length) return Promise.resolve(null);
  return pickOption(c.pi,{prompt,options:cands.map(k=>({label:`${k.def.name} (Level ${ROMAN[k.def.level]})`,value:k})),aiChoose:()=>[...cands].sort((a,b)=>score(b)-score(a))[0],cancellable:true});
}
function aiNeed(c){
  const after=c.me.actions-c.card.def.cost;
  let want=UPGRADE_COST[c.me.level]||0;
  for(const k of c.me.hand){if(k===c.card||k.def.type==='reaction')continue;if(k.def.cost>want&&(k.def.worth||k.def.level)>=2.5)want=k.def.cost}
  return Math.max(0,want-after);
}
function ruthlessPlan(c){
  const need=Math.min(6,aiNeed(c));
  const junk=c.me.hand.filter(k=>k!==c.card).sort((a,b)=>keepValue(a)-keepValue(b));
  const cards=junk.slice(0,Math.max(0,Math.min(need,junk.length-1)));
  let left=need-cards.length;const sites=new Map();
  if(left>0&&totalF(c.me)-left>totalF(c.opp)+2){
    for(const s of [...c.me.sites].sort((a,b)=>(b.followers-minNeed(b))-(a.followers-minNeed(a)))){
      const x=Math.min(left,Math.max(0,s.followers-minNeed(s)));if(x){sites.set(s,x);left-=x}if(!left)break;
    }
  }
  return{need,cards,sites,ok:need>0&&left<=0};
}
const oilGain=plan=>{let g=0;for(const [s,n] of plan)g+=s.card.def.start?Math.floor(n/2):n;return g};
function oilPlan(c){
  const need=Math.min(6,aiNeed(c));const plan=new Map();let g=0;
  for(const s of [...c.me.sites].filter(s=>!s.card.def.start).sort((a,b)=>(a.followers+(a.card.def.worth||1))-(b.followers+(b.card.def.worth||1)))){
    if(g>=need)break;const room=integ(s)-s.damage-1;const x=Math.min(room,need-g);if(x>0){plan.set(s,x);g+=x}
  }
  const st=startSite(c.me);
  if(g<need&&st){const room=integ(st)-st.damage-1;const x=Math.min(Math.floor(room/2),need-g);if(x>0){plan.set(st,x*2);g+=x}}
  return{plan,ok:need>0&&g>=need};
}
function dilemmaPair(c){
  let best={v:-1,pair:[c.opp.sites[0],c.opp.sites[1]]};
  for(let i=0;i<c.opp.sites.length;i++)for(let j=i+1;j<c.opp.sites.length;j++){
    const a=c.opp.sites[i],b=c.opp.sites[j],v=Math.min(dmgValue(a,5),dmgValue(b,5));
    if(v>best.v)best={v,pair:[a,b]};
  }
  return best;
}
function placePlan(p,n){
  const counts=Object.fromEntries(p.sites.map(s=>[s.uid,s.followers]));
  const dst=p.sites.filter(canGain);
  for(let i=0;i<n;i++){let best=null,bv=-1e9;for(const s of dst){const v=placeScore(s)-(counts[s.uid]-s.followers)*0.6;if(v>bv){bv=v;best=s}}counts[best.uid]++}
  return counts;
}
function assimValue(c,s){
  const o=G.players[s.owner];
  const stays=!(s.followers&&canLeave(s)&&o.sites.some(x=>x!==s&&canGain(x)));
  return (s.card.def.worth||1)+2+(stays?s.followers*2:0)-(s.attachments.some(a=>HARMFUL.includes(a.def.id))?2:0);
}
function nanoPlan(c){
  const rem=new Map();let left=4;
  for(const s of [...c.me.sites].filter(s=>s.damage>0).sort((a,b)=>(b.followers+(b.card.def.worth||1))-(a.followers+(a.card.def.worth||1)))){const k=Math.min(left,s.damage);if(k){rem.set(s,k);left-=k}if(!left)break}
  for(const s of c.opp.sites.filter(s=>s.damage>0&&s.followers>0&&!isFort(s))){if(!left)break;const k=Math.min(left,s.damage,s.followers);if(k){rem.set(s,k);left-=k}}
  return rem;
}
function awStack(c,lv){
  if(totalF(c.me)>totalF(c.opp)) return [...lv].sort((a,b)=>G.stacks[a].length-G.stacks[b].length)[0];
  return [...lv].sort((a,b)=>G.stacks[b].length-G.stacks[a].length)[0];
}
function adjacent(site){const row=G.players[site.owner].sites,i=row.indexOf(site);return [row[i-1],row[i+1]].filter(Boolean)}
function marketGain(c){let n=0;for(const s of adjacent(c.site))n+=gainF(s,1);log(`The Market brings ${n} follower${n===1?'':'s'} to ${isYou(c.me)?'your':'their'} neighboring sites.`)}
let BANK_DEPTH=0;
function bankValue(c,s){
  if(BANK_DEPTH>1) return -1;
  BANK_DEPTH++;
  const u=s.usedTurn;s.usedTurn=-1;let b=-1;
  try{(s.card.def.abilities||[]).forEach((ab,i)=>{if(abilityReady(c.pi,s,i)){const v=ab.ai(mkCtx(c.pi,{site:s}));b=Math.max(b,ab.actions?v/ab.actions:v)}})}
  finally{s.usedTurn=u;BANK_DEPTH--}
  return b;
}

/* ================= CARD DATA =================
   set: 'core' | 'exp' marks which printed set each card belongs to.
   passive:true marks ∞ abilities that fire automatically when their condition happens. */
const CARDS=[
  {id:'homeland',name:'Warpland',level:1,type:'site',cost:0,integrity:6,start:true,worth:1,count:0,
   text:'During setup, place 10 followers on Warpland.',abilities:[]},

  /* ---------- LEVEL I · HAMLET ---------- */
  {id:'catapult',name:'Trebuchet',level:1,type:'site',cost:2,integrity:3,count:2,worth:2,
   abilities:[
    {need:3,actions:1,text:'Do 1 damage.',run:c=>hit(c,1,'Trebuchet'),ai:c=>bestOpp(c,1)},
    {need:5,actions:0,text:'Do 1 damage.',run:c=>hit(c,1,'Trebuchet'),ai:c=>bestOpp(c,1)+0.5}]},
  {id:'temple',name:'Altar',level:1,type:'site',cost:1,integrity:3,count:2,worth:1.3,
   abilities:[{need:1,actions:0,text:'Sacrifice 1 follower on Altar to gain 1 action.',
     run:async c=>{c.pay();killOn(c.site,1);c.me.actions++;log(`${c.me.name} sacrifice${s_(c.me)} a follower at the Altar and gain${s_(c.me)} an action.`)},
     ai:c=>totalF(c.me)>=totalF(c.opp)+2&&wantsMore(c)?1.2:-1}]},
  {id:'mission',name:'Shrine',level:1,type:'site',cost:1,integrity:3,count:2,worth:1.5,
   abilities:[
    {need:0,actions:0,text:'Discard 1 card from your hand to relocate.',can:c=>c.me.hand.length>0&&c.me.sites.length>1,
     run:async c=>{
       const k=await pickHandCard(c.pi,{prompt:'Shrine: choose a card to discard.'});if(!k)return;
       const counts=await relocateBy(c,'Shrine: relocate followers','Free · discards '+k.def.name);
       if(!counts)return;c.pay();discardFromHand(c.pi,k);applyCounts(c.me,counts);log(`${c.me.name} relocate${s_(c.me)} followers.`)},
     ai:c=>{if(c.me.hand.length<4)return -1;const rv=relocateValue(c.me,relocatePlan(c.me));return rv>=2?rv-1:-1}},
    {need:0,actions:0,text:'Discard 1 card from your hand to gain 2 followers on Shrine.',can:c=>c.me.hand.length>0&&canGain(c.site),
     run:async c=>{const k=await pickHandCard(c.pi,{prompt:'Shrine: choose a card to discard.'});if(!k)return;
       c.pay();discardFromHand(c.pi,k);gainF(c.site,2);log(`${c.me.name} discard${s_(c.me)} a card and gain${s_(c.me)} 2 followers on the Shrine.`)},
     ai:c=>c.me.hand.length>=4?1.1:-1}]},
  {id:'fort',name:'Palisade',level:1,type:'site',cost:2,integrity:4,count:2,worth:2.5,enterValue:3,fortified:true,
   text:'Fortified. When Palisade enters play, gain 3 followers on Palisade.',abilities:[],
   onEnter:(c,s)=>{s.followers+=3;sfx('place',3);log(`3 followers arrive at the Palisade.`)}},
  {id:'church',name:'Chapel',level:1,type:'site',cost:2,integrity:3,count:2,worth:2.7,
   abilities:[{need:2,actions:0,text:'Gain 1 follower on any site you own.',run:c=>gainOnOwn(c,1,'Chapel'),ai:c=>1.2}]},
  {id:'plague',name:"Witch's Rot",level:1,type:'attachment',cost:1,count:2,
   text:"At the start of site owner's turn, kill 1 follower on this site. If this site becomes unoccupied, immediately discard Witch's Rot.",
   aiAttach:(c,s)=>s.owner!==c.pi&&!hasAtt(s,'plague')?s.followers:-99,
   ai:c=>{const m=Math.max(0,...c.opp.sites.filter(s=>!hasAtt(s,'plague')).map(s=>s.followers));return m>=3?2.2:-1}},
  {id:'siege',name:'Spark',level:1,type:'event',cost:1,count:2,text:'Do 2 damage to a single site.',
   play:c=>hit(c,2,'Spark'),ai:c=>bestOpp(c,2)},
  {id:'fanaticism',name:'Holy Fervor',level:1,type:'event',cost:2,count:1,
   text:'Sacrifice up to 3 followers on a single site. Then do 1 damage for each follower sacrificed, all to a single site.',
   play:async c=>{
     const src=await pickSite(c.pi,{prompt:'Holy Fervor: choose one of your sites to sacrifice followers from.',filter:s=>s.owner===c.pi&&s.followers>0,aiScore:s=>s.followers-minNeed(s),auto:true});
     if(!src)return;
     const max=Math.min(3,src.followers);
     const k=c.me.ai?fanK(c,src):await pickOption(c.pi,{prompt:`Holy Fervor: sacrifice how many followers from ${src.card.def.name}?`,options:Array.from({length:max},(_,i)=>({label:String(i+1),value:i+1})),cancellable:true});
     if(!k)return;
     const t=await pickSite(c.pi,{prompt:`Holy Fervor: choose a site to take ${k} damage.`,filter:s=>!c.me.ai||s.owner!==c.pi,aiScore:s=>dmgValue(s,k)});
     if(!t)return;
     c.pay();killOn(src,k);log(`${c.me.name} sacrifice${s_(c.me)} ${k} follower${k>1?'s':''}.`);await damage(c.pi,t,k)},
   ai:c=>{const src=[...c.me.sites].sort((a,b)=>b.followers-a.followers)[0];if(!src||totalF(c.me)<5)return -1;let b=-1;for(let k=1;k<=Math.min(3,src.followers-1);k++)b=Math.max(b,bestOpp(c,k)-k);return b}},
  {id:'display',name:'Rite of Thunder',level:1,type:'event',cost:1,count:1,text:'Sacrifice a site of cost 2 or greater to gain 3 actions.',
   play:async c=>{
     const s=await pickSite(c.pi,{prompt:'Rite of Thunder: choose one of your sites (cost 2 or more) to sacrifice.',filter:s=>s.owner===c.pi&&!s.card.def.start&&s.card.def.cost>=2,aiScore:s=>-(s.followers+(s.card.def.worth||1))});
     if(!s)return;c.pay();destroySite(s,'sacrificed');c.me.actions+=3;log(`${c.me.name} gain${s_(c.me)} 3 actions.`)},
   ai:c=>{const cand=c.me.sites.filter(s=>!s.card.def.start&&s.card.def.cost>=2);if(!cand.length)return -1;return Math.max(...cand.map(s=>3-s.followers-(s.card.def.worth||1)-0.5))}},
  {id:'escape',name:'Hidden Postern',level:1,type:'reaction',cost:0,count:1,
   text:'When one of your sites is damaged, you may first relocate up to 3 followers from this site to another site you own.',
   reactCan:(pi,site)=>site.followers>0&&canLeave(site)&&G.players[pi].sites.some(s=>s!==site&&canGain(s)),
   reactAI:(pi,site,n,opt)=>Math.min(3,lossOf(site,n,opt))-0.5,
   react:async r=>{
     const p=G.players[r.pi];let counts;
     if(p.ai){const dst=p.sites.filter(s=>s!==r.site&&canGain(s)).sort((a,b)=>placeScore(b)-placeScore(a))[0];const m=Math.min(3,r.site.followers);
       counts=Object.fromEntries(p.sites.map(s=>[s.uid,s.followers]));counts[r.site.uid]-=m;counts[dst.uid]+=m}
     else counts=await relocatePrompt(r.pi,{mode:'escape',site:r.site,max:3,title:`Hidden Postern: move up to 3 followers off ${r.site.card.def.name}`,cost:'Free'});
     if(!counts)return;r.pay();applyCounts(p,counts);log(`${p.name} move${s_(p)} followers out of ${r.site.card.def.name}.`)}},
  {id:'misinfo',name:'Deceit',level:1,type:'reaction',cost:0,count:1,
   text:'When one of your sites is damaged, you may damage another site you own instead.',
   reactCan:(pi,site)=>G.players[pi].sites.length>1,
   reactAI:(pi,site,n,opt)=>{const alt=G.players[pi].sites.filter(s=>s!==site).map(s=>lossOf(s,n,opt));return lossOf(site,n,opt)-Math.min(...alt)-0.5},
   react:async r=>{
     const t=await pickSite(r.pi,{prompt:`Deceit: choose another of your sites to take the ${r.n} damage instead.`,filter:s=>s.owner===r.pi&&s!==r.site,aiScore:s=>-lossOf(s,r.n,r.opt),auto:true});
     if(!t)return;r.pay();log(`The damage is redirected to ${t.card.def.name}.`);r.site=t}},
  {id:'ram',name:'Siege Engine',level:1,type:'site',cost:2,integrity:3,count:2,worth:1.6,
   abilities:[
    {need:3,actions:0,text:'Do 1 structural damage.',run:c=>hit(c,1,'Siege Engine',{structural:true}),ai:c=>bestOppS(c,1)},
    {need:2,actions:0,text:'Sacrifice Siege Engine to do 2 structural damage to a single site.',
     run:async c=>{const t=await pickSite(c.pi,{prompt:'Siege Engine: choose a site to take 2 structural damage.',filter:s=>s!==c.site&&(!c.me.ai||s.owner!==c.pi),aiScore:s=>structValue(s,2)});
       if(!t)return;c.pay();destroySite(c.site,'sacrificed');await damage(c.pi,t,2,{structural:true})},
     ai:c=>bestOppS(c,2)-c.site.followers-1.6}]},
  {id:'barracks',name:'Garrison',level:1,type:'site',cost:2,integrity:3,count:2,worth:2,
   abilities:[
    {need:0,actions:1,text:'Gain 2 followers on Garrison.',can:c=>canGain(c.site),run:c=>gainOnOwn(c,2,'Garrison',c.site),ai:c=>2},
    {need:3,actions:0,text:'Sacrifice 1 follower on Garrison to do 1 damage.',
     run:async c=>{const t=await pickSite(c.pi,{prompt:'Garrison: choose a site to take 1 damage.',filter:s=>!c.me.ai||s.owner!==c.pi,aiScore:s=>dmgValue(s,1)});
       if(!t)return;c.pay();killOn(c.site,1);await damage(c.pi,t,1)},
     ai:c=>bestOpp(c,1)-1}]},
  {id:'healerhut',name:'Healer Hut',level:1,type:'site',cost:2,integrity:3,count:1,worth:1.8,
   abilities:[
    {need:1,actions:0,infinite:true,passive:true,text:'After your followers are killed on an adjacent site, gain followers on Healer Hut equal to half the number killed (rounded down).'},
    {need:3,actions:0,infinite:true,passive:true,text:'Round up instead.'}]},
  {id:'farm',name:'Fields',level:1,type:'site',cost:1,integrity:3,count:2,worth:1.5,
   abilities:[
    {need:0,actions:0,text:'Tuck 1 card under Fields to gain 1 follower on any site.',can:c=>c.me.hand.length>0&&c.me.sites.some(canGain),
     run:async c=>{const k=await pickHandCard(c.pi,{prompt:'Fields: choose a card to tuck under Fields.'});if(!k)return;
       const s=await pickSite(c.pi,{prompt:'Fields: choose one of your sites to gain 1 follower.',filter:s=>s.owner===c.pi&&canGain(s),aiScore:s=>placeScore(s)+(s===c.site&&s.followers<1?20:0),auto:true});if(!s)return;
       c.pay();c.me.hand.splice(c.me.hand.indexOf(k),1);c.site.tucked.push(k);gainF(s,1);log(`${c.me.name} tuck${s_(c.me)} a card under Fields and gain${s_(c.me)} a follower.`)},
     ai:c=>{const h=c.me.hand.length;if(h<2)return -1;const cheap=Math.min(...c.me.hand.map(keepValue));return h>=3||cheap<=1.3?0.8+1.4*gameLeft()-(cheap-1)*0.6:-1}},
    {need:1,actions:0,text:'Gain 1 follower on Fields for each card tucked under Fields.',can:c=>tuckN(c.site)>0&&canGain(c.site),
     run:async c=>{c.pay();const n=gainF(c.site,tuckN(c.site));log(`${c.me.name} gain${s_(c.me)} ${n} follower${n>1?'s':''} on Fields.`)},
     ai:c=>tuckN(c.site)}]},
  {id:'castle',name:'Stone Keep',level:2,type:'site',cost:2,integrity:4,count:1,worth:3,fortified:true,text:'Fortified.',
   abilities:[
    {need:0,actions:0,text:'Relocate followers to Stone Keep.',can:c=>canGain(c.site)&&c.me.sites.some(s=>s!==c.site&&s.followers>0&&canLeave(s)),
     run:async c=>{const counts=c.me.ai?castlePlan(c.me,c.site).counts:await relocatePrompt(c.pi,{mode:'to',site:c.site,title:'Stone Keep: move followers onto Stone Keep',cost:'Free'});
       if(!counts)return;c.pay();applyCounts(c.me,counts);log(`${c.me.name} move${s_(c.me)} followers into the Stone Keep.`)},
     ai:c=>{const pl=castlePlan(c.me,c.site);return pl.moved>=3&&c.site.damage<2?1:-1}},
    {need:0,actions:0,text:'Relocate followers off Stone Keep.',can:c=>c.site.followers>0&&canLeave(c.site)&&c.me.sites.some(s=>s!==c.site&&canGain(s)),
     run:async c=>{const counts=await relocatePrompt(c.pi,{mode:'off',site:c.site,title:'Stone Keep: move followers off Stone Keep',cost:'Free'});
       if(!counts)return;c.pay();applyCounts(c.me,counts);log(`${c.me.name} move${s_(c.me)} followers out of the Stone Keep.`)},
     ai:c=>-1}]},
  {id:'masons',name:'Stonesmith',level:1,type:'site',cost:1,integrity:3,count:1,worth:1.2,
   abilities:[
    {need:2,actions:0,text:'Move 1 damage counter from another site you own to a different site you own.',can:c=>c.me.sites.some(s=>s!==c.site&&s.damage>0),
     run:c=>moveDamage(c,false),ai:c=>masonAI(c,false)},
    {need:4,actions:0,text:'Move all damage counters from another site you own to a different site you own.',can:c=>c.me.sites.some(s=>s!==c.site&&s.damage>0),
     run:c=>moveDamage(c,true),ai:c=>masonAI(c,true)}]},
  {id:'monolith',name:'Faerie Ring',level:1,type:'site',cost:1,integrity:3,count:1,worth:2,
   abilities:[
    {need:3,actions:1,text:'Draw 1 card from a level one higher than your current level.',can:c=>c.me.level<4,
     run:async c=>{c.pay();drawHigher(c.pi)},ai:c=>c.me.level<4&&G.stacks[c.me.level+1].length?1.3:-1},
    {need:3,actions:0,text:'Sacrifice Faerie Ring to upgrade.',can:c=>c.me.level<4,
     run:async c=>{c.pay();destroySite(c.site,'sacrificed');upgradeLevel(c.pi)},
     ai:c=>(UPGRADE_COST[c.me.level]||0)*1.1-c.site.followers-1}]},
  {id:'mine',name:'Iron Pit',level:1,type:'site',cost:1,integrity:3,count:1,worth:1.5,
   abilities:[
    {need:3,actions:0,text:'Do 2 structural damage to a starting site you own to gain 1 action.',can:c=>!!startSite(c.me),
     run:async c=>{const s=startSite(c.me);c.pay();await damage(c.pi,s,2,{structural:true});c.me.actions++;log(`${c.me.name} gain${s_(c.me)} an action from the Iron Pit.`)},
     ai:c=>{const s=startSite(c.me);return s&&integ(s)-s.damage>3&&wantsMore(c)?1:-1}},
    {need:3,actions:0,text:'Do 1 structural damage to a non-starting site you own to gain 1 action.',can:c=>c.me.sites.some(s=>!s.card.def.start),
     run:async c=>{const s=await pickSite(c.pi,{prompt:'Iron Pit: choose one of your non-starting sites to take 1 structural damage.',filter:s=>s.owner===c.pi&&!s.card.def.start,aiScore:s=>integ(s)-s.damage-s.followers*0.3,auto:true});
       if(!s)return;c.pay();await damage(c.pi,s,1,{structural:true});c.me.actions++;log(`${c.me.name} gain${s_(c.me)} an action from the Iron Pit.`)},
     ai:c=>c.me.sites.some(s=>!s.card.def.start&&integ(s)-s.damage>1)&&wantsMore(c)?0.9:-1}]},
  {id:'onslaught',name:'Howling Advance',level:1,type:'event',cost:2,count:1,text:"Do 1 damage each to up to 3 different sites owned by an opponent.",
   play:async c=>{
     const picked=await pickUpTo(c,3,{prompt:(i)=>`Howling Advance: choose ${i?'another':'an'} opponent's site (${i+1} of up to 3, 1 damage each).`,filter:s=>s.owner!==c.pi,aiScore:s=>dmgValue(s,1)});
     if(!picked||!picked.length)return;c.pay();for(const s of picked)await damage(c.pi,s,1)},
   ai:c=>c.opp.sites.map(s=>dmgValue(s,1)).sort((a,b)=>b-a).slice(0,3).reduce((a,b)=>a+b,0)},
  {id:'radicalism',name:'Heresy',level:1,type:'event',cost:2,count:2,text:"Do damage to an opponent's site, where the damage dealt equals their level.",
   play:c=>hit(c,c.opp.level,'Heresy',{opp:true}),ai:c=>bestOpp(c,c.opp.level)},
  {id:'fertility',name:'Harvest Blessing',level:1,type:'event',cost:1,count:2,
   text:'Gain 1 follower each on up to 3 sites you own. OR Gain followers on a single site equal to the number of occupied sites an opponent owns.',
   play:async c=>{
     const occ=c.opp.sites.filter(s=>s.followers>0).length, a=Math.min(3,c.me.sites.filter(canGain).length);
     const mode=await pickOption(c.pi,{prompt:'Harvest Blessing: choose one.',options:[{label:'1 follower each on up to 3 of your sites',value:'a'},{label:`${occ} follower${occ===1?'':'s'} on one site`,value:'b'}],aiChoose:()=>occ>a?'b':'a',cancellable:true});
     if(!mode)return;
     if(mode==='a'){
       const picked=await pickUpTo(c,3,{prompt:(i)=>`Harvest Blessing: choose your site ${i+1} of up to 3 (1 follower each).`,filter:s=>s.owner===c.pi&&canGain(s),aiScore:placeScore,auto:c.me.sites.filter(canGain).length===1});
       if(!picked||!picked.length)return;c.pay();for(const s of picked)gainF(s,1);log(`${c.me.name} gain${s_(c.me)} ${picked.length} follower${picked.length>1?'s':''}.`);
     } else await gainOnOwn(c,occ,'Harvest Blessing');
   },
   ai:c=>Math.max(Math.min(3,c.me.sites.filter(canGain).length),c.opp.sites.filter(s=>s.followers>0).length)},
  {id:'fodder',name:'Peasant Levy',level:1,type:'reaction',cost:0,count:1,
   text:'When one of your sites is damaged, sacrifice any number of followers on that site to prevent 1 damage to it for each follower sacrificed.',
   reactCan:(pi,site)=>site.followers>0,
   reactAI:(pi,site,n,opt)=>{if(site.damage+n<integ(site))return -1;const k=site.damage+n-integ(site)+1;if(k>n||k>=site.followers)return -1;return site.followers-k+(site.card.def.worth||1)-1},
   react:async r=>{
     const p=G.players[r.pi];
     const max=Math.min(r.n,r.site.followers);
     if(!max)return;
     let k;
     if(p.ai) k=Math.min(max,r.site.damage+r.n-integ(r.site)+1);
     else k=await pickOption(r.pi,{prompt:`Peasant Levy: sacrifice how many of the ${r.site.followers} followers on ${r.site.card.def.name}? Each one prevents 1 of the ${r.n} damage.`,options:Array.from({length:max},(_,i)=>({label:String(i+1),value:i+1})),cancellable:true});
     if(!k)return;r.pay();
     killOn(r.site,k);
     r.n-=k;log(`${p.name} sacrifice${s_(p)} ${k} follower${k>1?'s':''} on ${r.site.card.def.name} to prevent ${k} damage.`)}},
  {id:'pillage',name:'Reave',level:1,type:'event',cost:1,count:1,
   text:'Do 3 damage to an unoccupied site. OR Look at all cards tucked under all sites and put 1 into your hand.',
   play:async c=>{
     const unocc=allSites().filter(s=>s.followers===0&&(!c.me.ai||s.owner!==c.pi));
     const tucked=allSites().flatMap(s=>s.tucked.map(k=>({k,s})));
     const opts=[];
     if(unocc.length)opts.push({label:'Do 3 damage to an unoccupied site',value:'a'});
     if(tucked.length)opts.push({label:'Take a tucked card',value:'b'});
     if(!opts.length){c.pay();log('Reave finds nothing to take.');return}
     const mode=opts.length===1?opts[0].value:await pickOption(c.pi,{prompt:'Reave: choose one.',options:opts,aiChoose:()=>unocc.some(s=>dmgValue(s,3)>1.5)?'a':'b',cancellable:true});
     if(!mode)return;
     if(mode==='a'){const s=await pickSite(c.pi,{prompt:'Reave: choose an unoccupied site to take 3 damage.',filter:s=>s.followers===0&&(!c.me.ai||s.owner!==c.pi),aiScore:s=>dmgValue(s,3)});
       if(!s)return;c.pay();await damage(c.pi,s,3)}
     else{const i=await pickOption(c.pi,{prompt:'Reave: choose a tucked card to take.',options:tucked.map((t,i)=>({label:`${t.k.def.name} (Level ${ROMAN[t.k.def.level]}, under ${poss(G.players[t.s.owner])} ${t.s.card.def.name})`,value:i})),
       aiChoose:()=>tucked.map((t,i)=>[t.k.def.level,i]).sort((a,b)=>b[0]-a[0])[0][1],cancellable:true});
       if(i===null||i===undefined)return;c.pay();const t=tucked[i];t.s.tucked.splice(t.s.tucked.indexOf(t.k),1);c.me.hand.push(t.k);log(`${c.me.name} take${s_(c.me)} a tucked card.`)}
   },
   ai:c=>{const u=c.opp.sites.filter(s=>s.followers===0).map(s=>dmgValue(s,3));const t=allSites().some(s=>s.tucked.length)?1.2:-1;return Math.max(t,...u,-1)}},
  {id:'badomen',name:"Raven's Curse",level:1,type:'attachment',cost:1,count:1,
   text:'When any player upgrades, do 1 damage to this site. When a draw stack runs out, do 3 damage to this site.',
   aiAttach:(c,s)=>s.owner!==c.pi?s.followers*0.5+(integ(s)-s.damage<=3?2:0)+(isFort(s)?-1:0):-99,
   ai:c=>c.opp.sites.length?1.3:-1},
  {id:'market',name:'Market',level:1,type:'site',cost:2,integrity:3,count:2,worth:2.8,
   abilities:[
    {need:2,actions:1,text:'Gain 1 follower on each adjacent site.',can:c=>adjacent(c.site).some(canGain),
     run:async c=>{c.pay();marketGain(c)},ai:c=>adjacent(c.site).filter(canGain).length},
    {need:4,actions:0,text:'Gain 1 follower on each adjacent site.',can:c=>adjacent(c.site).some(canGain),
     run:async c=>{c.pay();marketGain(c)},ai:c=>adjacent(c.site).filter(canGain).length}]},

  /* ---------- LEVEL II · CORE SET ---------- */
  {id:'milbase',name:'Mustering Hall',set:'core',level:2,type:'site',cost:2,integrity:4,count:2,worth:2.5,
   abilities:[{need:0,actions:1,text:'Sacrifice any number of followers on Mustering Hall. Then do 1 damage for each follower sacrificed, all to a single site.',can:c=>c.site.followers>0,
     run:async c=>{
       const max=c.site.followers;
       const k=c.me.ai?mbK(c).k:await pickOption(c.pi,{prompt:`Mustering Hall: sacrifice how many of its ${max} followers?`,options:Array.from({length:max},(_,i)=>({label:String(i+1),value:i+1})),cancellable:true});
       if(!k)return;
       const t=await pickSite(c.pi,{prompt:`Mustering Hall: choose a site to take ${k} damage.`,filter:s=>!c.me.ai||s.owner!==c.pi,aiScore:s=>dmgValue(s,k)});
       if(!t)return;c.pay();killOn(c.site,k);log(`${c.me.name} sacrifice${s_(c.me)} ${k} follower${k>1?'s':''} at the Mustering Hall.`);await damage(c.pi,t,k)},
     ai:c=>c.site.followers?mbK(c).v:-1}]},
  {id:'library',name:'Lorehall',set:'core',level:2,type:'site',cost:1,integrity:3,count:2,worth:2.5,
   abilities:[
    {need:3,actions:0,text:'Draw 1 card.',can:c=>drawableLevels(c.pi).length>0,
     run:async c=>{const l=await pickDrawLevel(c.pi,true,'Lorehall: draw from which level?');if(!l)return;c.pay();drawCard(c.pi,l)},ai:c=>2},
    {need:5,actions:1,text:'Put 1 discarded card of your level or lower into your hand. Then discard 1 card from your hand.',can:c=>G.discard.some(k=>k.def.level<=c.me.level),
     run:async c=>{
       const seen=new Set(),cands=G.discard.filter(k=>k.def.level<=c.me.level&&!seen.has(k.def.id)&&seen.add(k.def.id));
       const k=await pickOption(c.pi,{prompt:'Lorehall: choose a discarded card to put into your hand.',options:cands.map(k=>({label:`${k.def.name} (Level ${ROMAN[k.def.level]})`,value:k})),
         aiChoose:()=>[...cands].sort((a,b)=>keepValue(b)-keepValue(a))[0],cancellable:true});
       if(!k)return;c.pay();G.discard.splice(G.discard.indexOf(k),1);c.me.hand.push(k);log(`${c.me.name} take${s_(c.me)} ${k.def.name} from the discard pile.`);
       const d=await pickHandCard(c.pi,{prompt:'Lorehall: now discard 1 card from your hand.',cancellable:false});
       if(d){discardFromHand(c.pi,d);log(`${c.me.name} discard${s_(c.me)} ${d.def.name}.`)}},
     ai:c=>{const best=Math.max(...G.discard.filter(k=>k.def.level<=c.me.level).map(keepValue));const worst=c.me.hand.length?Math.min(...c.me.hand.map(keepValue)):0;return best-worst>0.9?best-worst:-1}}]},
  {id:'hospital',name:'Infirmary',set:'core',level:2,type:'site',cost:2,integrity:4,count:1,worth:2.2,
   abilities:[
    {need:0,actions:0,infinite:true,passive:true,text:'After your followers are killed, gain followers on Infirmary equal to half the number killed (rounded down).'},
    {need:3,actions:0,infinite:true,passive:true,text:'Round up instead.'}]},
  {id:'sniper',name:'Ranger\'s Perch',set:'core',level:2,type:'site',cost:1,integrity:3,count:1,worth:2.5,
   abilities:[
    {need:1,actions:0,infinite:true,passive:true,text:'After an opponent relocates, kill 1 of their followers.'},
    {need:3,actions:0,infinite:true,passive:true,text:'Kill 2 of their followers instead.'}]},
  {id:'railroad',name:'Waystone',set:'core',level:2,type:'site',cost:1,integrity:3,count:1,worth:1.6,
   abilities:[{need:1,actions:0,text:'Relocate.',can:c=>c.me.sites.length>1,
     run:async c=>{const counts=await relocateBy(c,'Waystone: relocate followers','Free');if(!counts)return;c.pay();applyCounts(c.me,counts);log(`${c.me.name} relocate${s_(c.me)} followers by Waystone.`)},
     ai:c=>{const rv=relocateValue(c.me,relocatePlan(c.me));return rv>=1.5?rv:-1}}]},
  {id:'conversion',name:'Pilgrimage',set:'core',level:2,type:'event',cost:1,count:2,text:'Gain a total of 3 followers on any combination of sites you own.',
   play:async c=>{
     const picks=[];
     for(let i=0;i<3;i++){
       const s=await pickSite(c.pi,{prompt:`Pilgrimage: choose a site for follower ${i+1} of 3.`,filter:s=>s.owner===c.pi&&canGain(s),
         aiScore:s=>placeScore(s)-picks.filter(x=>x===s).length*0.5,auto:true,cancellable:i===0});
       if(!s){if(i===0)return;break}
       picks.push(s);
     }
     c.pay();for(const s of picks)gainF(s,1);log(`${c.me.name} gain${s_(c.me)} 3 followers.`)},
   ai:c=>c.me.sites.some(canGain)?3:-1},
  {id:'fortify',name:'Bulwark',set:'core',level:2,type:'attachment',cost:1,count:1,fortify:true,
   text:'Upon attachment, remove all damage counters from this site. This site is now fortified.',
   onAttach:async s=>{if(s.damage){log(`${s.card.def.name} is repaired.`);s.damage=0}},
   aiAttach:(c,s)=>s.owner===c.pi?s.damage*1.5+(isFort(s)?0:s.followers*0.35):-99,
   ai:c=>{const m=Math.max(-1,...c.me.sites.map(s=>s.damage*1.5+(isFort(s)?0:s.followers*0.35)));return m>=2.5?m:-1}},
  {id:'shelling',name:'Barrage',set:'core',level:2,type:'event',cost:2,count:1,text:'Do 3 damage divided among up to 2 sites.',
   play:async c=>{const a=await divideDamage(c,3,2,'Barrage',()=>true);if(!a)return;c.pay();for(const [s,k] of a)await damage(c.pi,s,k)},
   ai:c=>bestAlloc(c.opp.sites,3,2,dmgValue).v},
  {id:'blockade',name:'Embargo',set:'core',level:2,type:'event',cost:2,count:1,text:"Kill 1 follower on each of an opponent's sites.",
   play:async c=>{c.pay();let n=0;for(const s of [...c.opp.sites])n+=killOn(s,1);log(`Embargo kills ${n} of ${poss(c.opp)} followers.`)},
   ai:c=>c.opp.sites.filter(s=>s.followers>0).reduce((a,s)=>a+killValue(s),0)},
  {id:'sabotage',name:'Hex',set:'core',level:2,type:'attachment',cost:2,count:1,text:'This site cannot activate abilities.',
   aiAttach:(c,s)=>s.owner!==c.pi&&!hasAtt(s,'sabotage')&&(s.card.def.abilities||[]).length?(s.card.def.worth||1)*(s.followers>=minNeed(s)?2:1):-99,
   ai:c=>{const t=c.opp.sites.filter(s=>!hasAtt(s,'sabotage')&&(s.card.def.abilities||[]).length&&s.followers>=minNeed(s));return t.length?Math.max(...t.map(s=>s.card.def.worth||1))*1.3:-1}},
  {id:'lossfaith',name:'Interdict',set:'core',level:2,type:'event',cost:1,count:1,text:'An opponent starts their next turn with 1 fewer action.',
   play:async c=>{c.pay();c.opp.lof=(c.opp.lof||0)+1;log(`${c.opp.name} will start ${isYou(c.opp)?'your':'their'} next turn with 1 fewer action.`)},
   ai:c=>1.7},
  {id:'martyr',name:'Blessed Sacrifice',set:'core',level:2,type:'reaction',cost:0,count:1,trigger:'kill',
   text:'When any number of your followers are killed, draw 1 card for each killed follower.'},

  /* ---------- LEVEL II · EXPANSION SET ---------- */
  {id:'mortar',name:'Siege Tower',set:'exp',level:2,type:'site',cost:2,integrity:3,count:2,worth:2.5,
   abilities:[
    {need:3,actions:0,text:'Do 1 damage.',run:c=>hit(c,1,'Siege Tower'),ai:c=>bestOpp(c,1)},
    {need:5,actions:1,text:'Do 1 damage each to 2 different sites.',can:()=>allSites().length>=2,
     run:async c=>{
       const a=await pickSite(c.pi,{prompt:'Siege Tower: choose the first site (1 damage).',filter:s=>!c.me.ai||s.owner!==c.pi,aiScore:s=>dmgValue(s,1)});if(!a)return;
       const b=await pickSite(c.pi,{prompt:'Siege Tower: choose a second, different site (1 damage).',filter:s=>s!==a&&(!c.me.ai||s.owner!==c.pi),aiScore:s=>dmgValue(s,1)});if(!b)return;
       c.pay();await damage(c.pi,a,1);await damage(c.pi,b,1)},
     ai:c=>{if(c.opp.sites.length<2)return -1;const v=c.opp.sites.map(s=>dmgValue(s,1)).sort((x,y)=>y-x);return v[0]+v[1]}}]},
  {id:'port',name:'Harbor',set:'exp',level:2,type:'site',cost:1,integrity:3,count:2,worth:1.8,
   abilities:[
    {need:0,actions:0,text:'Tuck 1 card under Harbor to relocate.',can:c=>c.me.hand.length>0&&c.me.sites.length>1,
     run:async c=>{const k=await pickHandCard(c.pi,{prompt:'Harbor: choose a card to tuck under Harbor.'});if(!k)return;
       const counts=await relocateBy(c,'Harbor: relocate followers','Free · tucks '+k.def.name);if(!counts)return;
       c.pay();c.me.hand.splice(c.me.hand.indexOf(k),1);c.site.tucked.push(k);applyCounts(c.me,counts);log(`${c.me.name} tuck${s_(c.me)} a card under Harbor and relocate${s_(c.me)}.`)},
     ai:c=>{if(c.me.hand.length<4)return -1;const rv=relocateValue(c.me,relocatePlan(c.me));return rv>=2?rv-0.8:-1}},
    {need:3,actions:0,text:'Draw 1 card for each card tucked under Harbor.',can:c=>tuckN(c.site)>0&&drawableLevels(c.pi).length>0,
     run:async c=>{c.pay();await drawN(c.pi,tuckN(c.site),'Harbor')},ai:c=>tuckN(c.site)*1.1}]},
  {id:'university',name:'Academy',set:'exp',level:2,type:'site',cost:1,integrity:3,count:1,worth:2.5,
   abilities:[
    {need:1,actions:0,infinite:true,passive:true,text:"When activating another site's ability, you may do so with 1 fewer follower than that ability currently requires."},
    {need:3,actions:2,text:'Upgrade.',can:c=>c.me.level<4,run:async c=>{c.pay();upgradeLevel(c.pi)},ai:c=>(UPGRADE_COST[c.me.level]||0)*0.9}]},
  {id:'depot',name:'Quartermaster',set:'exp',level:2,type:'site',cost:1,integrity:3,count:1,worth:1.8,
   abilities:[
    {need:2,actions:0,text:'Remove 1 damage counter from any other site.',can:c=>allSites().some(s=>s!==c.site&&s.damage>0),
     run:async c=>{const s=await pickSite(c.pi,{prompt:'Quartermaster: choose another site to remove 1 damage counter from.',filter:s=>s!==c.site&&s.damage>0&&(!c.me.ai||s.owner===c.pi),aiScore:s=>s.followers+(integ(s)-s.damage<=1?3:0),auto:true});
       if(!s)return;c.pay();s.damage--;log(`${c.me.name} repair${s_(c.me)} 1 damage on ${poss(G.players[s.owner])} ${s.card.def.name}.`)},
     ai:c=>{const d=c.me.sites.filter(s=>s!==c.site&&s.damage>0);return d.length?Math.max(...d.map(s=>0.5+(integ(s)-s.damage<=1?1.5:0.3))):-1}},
    {need:2,actions:1,text:'Remove an attachment from any site and then attach it to another site owned by the same player.',
     can:c=>allSites().some(s=>s.attachments.length&&G.players[s.owner].sites.length>1),
     run:async c=>{
       const list=allSites().filter(s=>G.players[s.owner].sites.length>1).flatMap(s=>s.attachments.map(a=>({a,s})));
       const pick=await pickOption(c.pi,{prompt:'Quartermaster: choose an attachment to move.',options:list.map(x=>({label:`${x.a.def.name} on ${poss(G.players[x.s.owner])} ${x.s.card.def.name}`,value:x})),
         aiChoose:()=>list.find(x=>x.s.owner===c.pi&&HARMFUL.includes(x.a.def.id))||list[0],cancellable:true});
       if(!pick)return;
       const dst=await pickSite(c.pi,{prompt:`Quartermaster: move ${pick.a.def.name} to which of ${poss(G.players[pick.s.owner])} other sites?`,filter:s=>s.owner===pick.s.owner&&s!==pick.s,
         aiScore:s=>-(s.followers+(s.card.def.worth||1)),auto:true});
       if(!dst)return;
       c.pay();pick.s.attachments.splice(pick.s.attachments.indexOf(pick.a),1);
       log(`${c.me.name} move${s_(c.me)} ${pick.a.def.name} from ${pick.s.card.def.name} to ${dst.card.def.name}.`);
       if(pick.s.damage>=integ(pick.s))destroySite(pick.s);
       await attach(pick.a,dst,pick.a.attachedBy,true)},
     ai:c=>{const bad=c.me.sites.some(s=>s.attachments.some(a=>HARMFUL.includes(a.def.id)));return bad&&c.me.sites.length>1?1.6:-1}}]},
  {id:'spy',name:'Thieves\' Guild',set:'exp',level:2,type:'site',cost:1,integrity:3,count:1,worth:2.2,
   abilities:[
    {need:2,actions:0,infinite:true,passive:true,text:'After an opponent relocates, draw 1 card of their level or lower.'},
    {need:3,actions:0,text:'Kill 1 follower.',can:()=>allSites().some(s=>s.followers>0),
     run:async c=>{const s=await pickSite(c.pi,{prompt:'Thieves\' Guild: choose a site to kill 1 follower on.',filter:s=>s.followers>0&&(!c.me.ai||s.owner!==c.pi),aiScore:killValue});
       if(!s)return;c.pay();killOn(s,1);log(`A spy kills a follower on ${poss(G.players[s.owner])} ${s.card.def.name}.`)},
     ai:c=>c.opp.sites.some(s=>s.followers>0)?Math.max(...c.opp.sites.filter(s=>s.followers>0).map(killValue)):-1}]},
  {id:'conscription',name:'Muster',set:'exp',level:2,type:'attachment',cost:1,count:2,
   text:"Upon attachment, gain 2 followers on this site. At the start of site owner's turn, gain 1 follower on this site.",
   onAttach:async s=>{const n=gainF(s,2);if(n)log(`${n} conscripts arrive at ${s.card.def.name}.`)},
   aiAttach:(c,s)=>s.owner===c.pi&&canGain(s)?placeScore(s)+(hasAtt(s,'plague')?-3:0):-99,
   ai:c=>c.me.sites.some(canGain)?2.6:-1},
  {id:'research',name:'Arcane Study',set:'exp',level:2,type:'event',cost:1,count:1,
   text:'Draw 1 card. You may play 1 card from your hand for no actions. OR Tuck 1 card from your hand under any site to draw cards equal to your level.',
   play:async c=>{
     const others=c.me.hand.filter(k=>k!==c.card);
     const opts=[{label:'Draw 1, then play a card for free',value:'a'}];
     if(others.length)opts.push({label:`Tuck a card to draw ${c.me.level}`,value:'b'});
     const mode=await pickOption(c.pi,{prompt:'Arcane Study: choose one.',options:opts,aiChoose:()=>{const b=aiBestFree(c.pi,c.card);return b&&b.v>=2?'a':(others.length&&c.me.level>=2?'b':'a')},cancellable:true});
     if(!mode)return;
     if(mode==='a'){
       c.pay();await drawN(c.pi,1,'Arcane Study');
       let k;
       if(c.me.ai){const b=aiBestFree(c.pi);k=b&&b.v>0.5?b.k:null}
       else k=await pickHandCard(c.pi,{prompt:'Arcane Study: choose a card to play for no actions.',filter:k=>k.def.type!=='reaction',cancellable:true,cancelLabel:'Skip'});
       if(k){log(`${c.me.name} play${s_(c.me)} a card for free.`);await playCard(c.pi,k,{free:true})}
     } else {
       const k=await pickHandCard(c.pi,{prompt:'Arcane Study: choose a card to tuck.',filter:k=>k!==c.card});if(!k)return;
       const s=await pickSite(c.pi,{prompt:'Arcane Study: tuck it under which site?',filter:()=>true,aiScore:s=>s.owner===c.pi?1+integ(s)-s.damage:0});if(!s)return;
       c.pay();c.me.hand.splice(c.me.hand.indexOf(k),1);s.tucked.push(k);log(`${c.me.name} tuck${s_(c.me)} a card under ${s.card.def.name}.`);
       await drawN(c.pi,c.me.level,'Arcane Study');
     }},
   ai:c=>1.3},
  {id:'outrage',name:'Blood Feud',set:'exp',level:2,type:'reaction',cost:0,count:1,trigger:'destroyed',
   text:"When one of your sites is destroyed, draw cards equal to that site's level. Draw 1 additional card for each card tucked under that site and for each attachment on that site."},
  {id:'retrofit',name:'Reinforcement',set:'exp',level:2,type:'attachment',cost:1,count:1,text:'Site gains +3 integrity.',
   aiAttach:(c,s)=>s.owner===c.pi?s.followers*0.3+(integ(s)-s.damage<=2?2:0)+(s.card.def.worth||1)*0.3:-99,
   ai:c=>c.me.sites.some(s=>s.followers>=4||integ(s)-s.damage<=2)?1.3:-1},
  {id:'demolition',name:'Collapse',set:'exp',level:2,type:'event',cost:2,count:1,text:'Do 4 damage to a site with at least 1 damage counter on it.',
   play:c=>hit(c,4,'Collapse',{filter:s=>s.damage>0}),
   ai:c=>{const d=c.opp.sites.filter(s=>s.damage>0);return d.length?Math.max(...d.map(s=>dmgValue(s,4))):-1}},
  {id:'threat',name:'Death Mark',set:'exp',level:2,type:'attachment',cost:1,count:1,
   text:"Upon attachment, site owner must immediately relocate all followers off this site, if able. Followers cannot be gained or relocated onto this site. At the end of site owner's turn, discard Death Mark.",
   onAttach:async s=>{
     const owner=G.players[s.owner];
     if(!s.followers||!canLeave(s)||!owner.sites.some(x=>x!==s&&canGain(x))){log(`${Poss(owner)} followers cannot leave ${s.card.def.name}.`);return}
     const counts=owner.ai?threatPlan(owner,s):await relocatePrompt(owner.i,{mode:'threat',site:s,forced:true,title:`${hotPfx(owner)}Death Mark: move every follower off ${s.card.def.name}`,cost:'Required, no action cost'});
     applyCounts(owner,counts);log(`${owner.name} relocate${s_(owner)} every follower off ${s.card.def.name}.`)},
   aiAttach:(c,s)=>{if(s.owner===c.pi||hasAtt(s,'threat'))return -99;const o=G.players[s.owner];const can=o.sites.some(x=>x!==s&&canGain(x));return (can?s.followers:0)+((s.card.def.abilities||[]).length?1.5:0)+(ofId(c.me,'sniper').length?2:0)},
   ai:c=>{const m=Math.max(0,...c.opp.sites.map(s=>s.followers));return m>=4&&c.opp.sites.length>1?1.2+(ofId(c.me,'sniper').some(s=>s.followers>=1)?1:0):-1}},
  {id:'revolt',name:'Uprising',set:'exp',level:2,type:'event',cost:2,count:1,text:'Do 1 damage for each occupied site an opponent owns, divided among up to 2 of their sites.',
   play:async c=>{const n=c.opp.sites.filter(s=>s.followers>0).length;
     if(!n){c.pay();log('Uprising finds no occupied sites.');return}
     const a=await divideDamage(c,n,2,`Uprising (${n} damage)`,s=>s.owner!==c.pi);if(!a)return;c.pay();for(const [s,k] of a)await damage(c.pi,s,k)},
   ai:c=>{const n=c.opp.sites.filter(s=>s.followers>0).length;return n?bestAlloc(c.opp.sites,n,2,dmgValue).v:-1}},

  /* ---------- LEVEL III · CORE SET ---------- */
  {id:'silo',name:'Ballista Tower',set:'core',level:3,type:'site',cost:1,integrity:3,count:2,worth:4,
   abilities:[
    {need:2,actions:1,text:'Do 2 damage to a single site.',run:c=>hit(c,2,'Ballista Tower'),ai:c=>bestOpp(c,2)},
    {need:2,actions:1,text:'Do 1 damage each to 2 different sites.',can:()=>allSites().length>=2,
     run:async c=>{
       const a=await pickSite(c.pi,{prompt:'Ballista Tower: choose the first site (1 damage).',filter:s=>!c.me.ai||s.owner!==c.pi,aiScore:s=>dmgValue(s,1)});if(!a)return;
       const b=await pickSite(c.pi,{prompt:'Ballista Tower: choose a second, different site (1 damage).',filter:s=>s!==a&&(!c.me.ai||s.owner!==c.pi),aiScore:s=>dmgValue(s,1)});if(!b)return;
       c.pay();await damage(c.pi,a,1);await damage(c.pi,b,1)},
     ai:c=>{if(c.opp.sites.length<2)return -1;const v=c.opp.sites.map(s=>dmgValue(s,1)).sort((x,y)=>y-x);return v[0]+v[1]}}]},
  {id:'robotics',name:'Mana Well',set:'core',level:3,type:'site',cost:1,integrity:3,count:2,worth:3,
   abilities:[{need:2,actions:0,text:'Gain 1 action.',run:async c=>{c.pay();c.me.actions++;log(`${c.me.name} gain${s_(c.me)} an action from the Mana Well.`)},ai:c=>1.6}]},
  {id:'radio',name:'Herald\'s Tower',set:'core',level:3,type:'site',cost:1,integrity:3,count:1,worth:3,
   abilities:[
    {need:2,actions:1,text:'Steal 1 follower and place it on any site you own.',can:canSteal,run:c=>steal(c,'Herald\'s Tower'),ai:c=>2},
    {need:4,actions:0,text:'Steal 1 follower and place it on any site you own.',can:canSteal,run:c=>steal(c,'Herald\'s Tower'),ai:c=>2}]},
  {id:'compnet',name:'Animated Tools',set:'core',level:3,type:'attachment',cost:1,count:1,text:"This site's abilities require no followers to activate.",
   aiAttach:(c,s)=>{if(s.owner!==c.pi||hasAtt(s,'compnet')||hasAtt(s,'sabotage'))return -99;const ab=(s.card.def.abilities||[]);if(!ab.length)return -50;return ab.reduce((a,x)=>a+Math.max(0,x.need-s.followers),0)*0.5+(s.card.def.worth||1)},
   ai:c=>{const t=c.me.sites.filter(s=>!hasAtt(s,'compnet')&&!hasAtt(s,'sabotage')&&(s.card.def.abilities||[]).some(ab=>ab.need>s.followers));return t.length?Math.max(...t.map(s=>s.card.def.worth||1))*0.8:-1}},
  {id:'airstrike',name:'Warp Storms',set:'core',level:3,type:'event',cost:2,count:1,
   text:"Do 2 damage to each of an opponent's Level I sites and 1 damage to each of their Level II sites. (Starting sites count as Level I.)",
   play:async c=>{c.pay();for(const s of [...c.opp.sites]){const n=airN(s);if(n)await damage(c.pi,s,n)}},
   ai:c=>c.opp.sites.reduce((a,s)=>a+(airN(s)?dmgValue(s,airN(s)):0),0)},
  {id:'bioweapon',name:'Pestilence',set:'core',level:3,type:'event',cost:2,count:1,
   text:"Kill 1 of an opponent's followers for each card in their hand. Divide these kills among up to 2 sites.",
   play:async c=>{const n=c.opp.hand.length;
     if(!n||!totalF(c.opp)){c.pay();log('Pestilence finds no one to kill.');return}
     const a=await divideKills(c,n,2,`Pestilence (${n} kill${n>1?'s':''})`,s=>s.owner!==c.pi,false);if(!a)return;
     c.pay();let k=0;for(const [s,x] of a)k+=killOn(s,x);log(`Pestilence kills ${k} of ${poss(c.opp)} followers.`)},
   ai:c=>{const n=c.opp.hand.length;if(!n)return -1;const top=c.opp.sites.map(s=>s.followers).sort((a,b)=>b-a);return Math.min(n,(top[0]||0)+(top[1]||0))*1.1}},
  {id:'archaeology',name:'Excavation',set:'core',level:3,type:'event',cost:1,count:1,
   text:'Draw a total of 3 cards from levels lower than your current level. OR Put any 1 discarded card into your hand.',
   play:async c=>{
     const low=[];for(let l=1;l<c.me.level;l++)if(G.stacks[l].length)low.push(l);
     const opts=[];
     if(low.length)opts.push({label:'Draw 3 from lower levels',value:'a'});
     if(G.discard.length)opts.push({label:'Take any discarded card',value:'b'});
     if(!opts.length){c.pay();log('Excavation finds nothing.');return}
     const mode=opts.length===1?opts[0].value:await pickOption(c.pi,{prompt:'Excavation: choose one.',options:opts,aiChoose:()=>Math.max(...G.discard.map(keepValue))>=3.5?'b':'a',cancellable:true});
     if(!mode)return;
     if(mode==='a'){c.pay();await drawN(c.pi,3,'Excavation',c.me.level-1)}
     else{const k=await pickDiscard(c,'Excavation: choose a discarded card to put into your hand.',()=>true,keepValue);if(!k)return;
       c.pay();G.discard.splice(G.discard.indexOf(k),1);c.me.hand.push(k);log(`${c.me.name} take${s_(c.me)} ${k.def.name} from the discard pile.`)}},
   ai:c=>c.me.level>=2?2.4:(G.discard.length?1:-1)},
  {id:'ruthless',name:'Blood Tithe',set:'core',level:3,type:'event',cost:1,count:1,
   text:'Sacrifice any number of followers and discard any number of cards from your hand. Gain 1 action for each follower sacrificed and 1 action for each card discarded. You may not gain more than 6 actions in this way.',
   play:async c=>{
     let picks=new Map(),cards=[];
     if(c.me.ai){const pl=ruthlessPlan(c);picks=pl.sites;cards=pl.cards}
     else{
       const maxF=Math.min(6,totalF(c.me));
       const kf=await pickOption(c.pi,{prompt:'Blood Tithe: how many followers will you sacrifice? Each one gives 1 action.',options:Array.from({length:maxF+1},(_,i)=>({label:String(i),value:i})),cancellable:true});
       if(kf===null||kf===undefined)return;
       for(let i=0;i<kf;i++){const s=await pickSite(c.pi,{prompt:`Blood Tithe: sacrifice follower ${i+1} of ${kf} from which site?`,filter:s=>s.owner===c.pi&&s.followers-(picks.get(s)||0)>0,aiScore:()=>0,auto:true,cancellable:false});if(s)picks.set(s,(picks.get(s)||0)+1)}
       while(kf+cards.length<6&&c.me.hand.some(k=>k!==c.card&&!cards.includes(k))){
         const k=await pickHandCard(c.pi,{prompt:`Blood Tithe: discard a card for 1 more action (${kf+cards.length} so far), or finish.`,filter:k=>k!==c.card&&!cards.includes(k),cancellable:true,cancelLabel:'Finish'});
         if(!k)break;cards.push(k);
       }
     }
     c.pay();for(const k of cards)discardFromHand(c.pi,k);for(const [s,n] of picks)killOn(s,n);
     const g=Math.min(6,cards.length+[...picks.values()].reduce((a,b)=>a+b,0));c.me.actions+=g;log(`${c.me.name} gain${s_(c.me)} ${g} action${g===1?'':'s'}.`)},
   ai:c=>{const p=ruthlessPlan(c);return p.ok?1.6:-1}},

  /* ---------- LEVEL III · EXPANSION SET ---------- */
  {id:'arms',name:'Armory',set:'exp',level:3,type:'site',cost:2,integrity:3,count:2,worth:3,
   abilities:[
    {need:3,actions:0,text:"Do 1 damage to a single site and 1 additional damage to that site for each level you are higher than that site's owner.",
     run:async c=>{const s=await pickSite(c.pi,{prompt:'Armory: choose a site to damage.',filter:s=>!c.me.ai||s.owner!==c.pi,aiScore:s=>dmgValue(s,armsN(c,s))});if(!s)return;c.pay();await damage(c.pi,s,armsN(c,s))},
     ai:c=>bestOpp(c,1+Math.max(0,c.me.level-c.opp.level))},
    {need:3,actions:2,text:'Do 1 damage each to a number of sites. That number cannot exceed your level.',
     run:async c=>{const picked=await pickUpTo(c,c.me.level,{prompt:i=>`Armory: choose site ${i+1} of up to ${c.me.level} (1 damage each).`,filter:s=>!c.me.ai||s.owner!==c.pi,aiScore:s=>dmgValue(s,1)});
       if(!picked||!picked.length)return;c.pay();for(const s of picked)await damage(c.pi,s,1)},
     ai:c=>c.opp.sites.map(s=>dmgValue(s,1)).sort((a,b)=>b-a).slice(0,c.me.level).reduce((a,b)=>a+b,0)}]},
  {id:'bank',name:'Treasury',set:'exp',level:3,type:'site',cost:1,integrity:3,count:2,worth:2.5,
   abilities:[
    {need:0,actions:0,text:'Tuck 1 card under Treasury to allow another site to activate abilities again, even if that site already activated an ability this turn.',
     can:c=>c.me.hand.length>0&&c.me.sites.some(s=>s!==c.site&&s.usedTurn===G.turnCount),
     run:async c=>{
       const s=await pickSite(c.pi,{prompt:'Treasury: choose another of your sites that has already used an ability this turn.',filter:s=>s.owner===c.pi&&s!==c.site&&s.usedTurn===G.turnCount,aiScore:s=>bankValue(c,s),auto:true});if(!s)return;
       const k=await pickHandCard(c.pi,{prompt:'Treasury: choose a card to tuck under Treasury.'});if(!k)return;
       c.pay();c.me.hand.splice(c.me.hand.indexOf(k),1);c.site.tucked.push(k);s.usedTurn=-1;log(`${c.me.name} tuck${s_(c.me)} a card under the Treasury so ${s.card.def.name} can act again.`)},
     ai:c=>{if(c.me.hand.length<3)return -1;const v=Math.max(-1,...c.me.sites.filter(s=>s!==c.site&&s.usedTurn===G.turnCount).map(s=>bankValue(c,s)));return v-0.8}},
    {need:3,actions:0,text:'Gain 1 action for each card tucked under Treasury.',can:c=>tuckN(c.site)>0,
     run:async c=>{c.pay();const n=tuckN(c.site);c.me.actions+=n;log(`${c.me.name} gain${s_(c.me)} ${n} action${n>1?'s':''} from the Treasury.`)},
     ai:c=>tuckN(c.site)*1.2}]},
  {id:'pplant',name:'Arcane Furnace',set:'exp',level:3,type:'site',cost:1,integrity:3,count:1,worth:2.4,
   text:"When destroyed, its owner chooses 2 of their sites. Both take 1 structural damage for each card tucked under Arcane Furnace.",
   abilities:[{need:2,actions:2,text:'Play a discarded event for no actions. Then tuck that event under Arcane Furnace.',can:c=>G.discard.some(k=>k.def.type==='event'),
     run:async c=>{
       const k=await pickDiscard(c,'Arcane Furnace: choose a discarded event to play.',k=>k.def.type==='event',k=>cardValue(c.pi,k));if(!k)return;
       G.discard.splice(G.discard.indexOf(k),1);c.me.hand.push(k);
       const ok=await playCard(c.pi,k,{free:true});
       if(!ok){if(c.me.hand.includes(k)){c.me.hand.splice(c.me.hand.indexOf(k),1);G.discard.push(k)}return}
       c.pay();
       const i=G.discard.indexOf(k);
       if(i>=0&&inPlay(c.site)){G.discard.splice(i,1);c.site.tucked.push(k);log(`${k.def.name} is tucked under the Arcane Furnace.`)}},
     ai:c=>{const ev=G.discard.filter(k=>k.def.type==='event');return ev.length?Math.max(...ev.map(k=>cardValue(c.pi,k))):-1}}]},
  {id:'oil',name:'Strip the Land',set:'exp',level:3,type:'event',cost:1,count:1,
   text:'Do any amount of structural damage to sites you own, but not more than is required to destroy them. Gain 1 action for every 2 damage you do to a starting site and 1 action for every 1 damage you do to a non-starting site. You cannot gain more than 6 actions in this way.',
   play:async c=>{
     let plan;
     if(c.me.ai) plan=oilPlan(c).plan;
     else{
       plan=new Map();
       for(let guard=0;guard<40;guard++){
         const g=oilGain(plan);if(g>=6)break;
         const s=await pickSite(c.pi,{prompt:`Strip the Land: choose one of your sites to take 1 structural damage (${g} action${g===1?'':'s'} so far).`,
           filter:s=>s.owner===c.pi&&(plan.get(s)||0)<integ(s)-s.damage,aiScore:()=>0,extra:plan.size?[{label:'Finish',value:'done'}]:[],cancellable:!plan.size});
         if(!s){if(!plan.size)return;break}
         if(s==='done')break;
         plan.set(s,(plan.get(s)||0)+1);
       }
     }
     if(!plan.size)return;
     c.pay();const g=Math.min(6,oilGain(plan));
     for(const [s,n] of plan)await damage(c.pi,s,n,{structural:true});
     c.me.actions+=g;log(`${c.me.name} gain${s_(c.me)} ${g} action${g===1?'':'s'} from Strip the Land.`)},
   ai:c=>oilPlan(c).ok?1.5:-1},
  {id:'dilemma',name:'Cruel Bargain',set:'exp',level:3,type:'event',cost:2,count:1,
   text:'Choose 2 sites owned by an opponent. They choose 1 of those sites to save. Do 5 damage to the other site. If an opponent has only 1 site, Cruel Bargain has no effect on them.',
   play:async c=>{
     if(c.opp.sites.length<2){c.pay();log(`Cruel Bargain has no effect: ${c.opp.name} ${isYou(c.opp)?'have':'has'} only 1 site.`);return}
     const pair=c.me.ai?dilemmaPair(c).pair:null;
     const a=await pickSite(c.pi,{prompt:"Cruel Bargain: choose the first of 2 opponent's sites.",filter:s=>s.owner!==c.pi,aiScore:s=>s===pair[0]?1:0});if(!a)return;
     const b=await pickSite(c.pi,{prompt:"Cruel Bargain: choose the second opponent's site.",filter:s=>s.owner!==c.pi&&s!==a,aiScore:s=>s===pair[1]?1:0});if(!b)return;
     c.pay();
     const save=await pickSite(c.oppi,{prompt:`${hotPfx(c.opp)}Cruel Bargain: choose which of these 2 sites to save. The other takes 5 damage.`,filter:s=>s===a||s===b,aiScore:s=>dmgValue(s,5),cancellable:false});
     const t=save===a?b:a;log(`${c.opp.name} save${s_(c.opp)} ${save.card.def.name}.`);await damage(c.pi,t,5)},
   ai:c=>c.opp.sites.length<2?-1:dilemmaPair(c).v},
  {id:'sanctions',name:'Quarantine',set:'exp',level:3,type:'attachment',cost:1,count:1,
   text:"At the start of site owner's turn, do 1 structural damage to this site. Followers cannot be relocated off this site.",
   aiAttach:(c,s)=>s.owner!==c.pi&&!hasAtt(s,'sanctions')?s.followers*0.6+(integ(s)-s.damage<=3?2:0):-99,
   ai:c=>c.opp.sites.some(s=>s.followers>=3)?1.4:-1},
  {id:'surgical',name:'Assassinate',set:'exp',level:3,type:'event',cost:1,count:1,text:'Kill up to 3 followers, divided among up to 2 sites.',
   play:async c=>{const a=await divideKills(c,3,2,'Assassinate',s=>!c.me.ai||s.owner!==c.pi,true);if(!a||!a.size)return;
     c.pay();let k=0;for(const [s,x] of a)k+=killOn(s,x);log(`Assassinate kills ${k} follower${k===1?'':'s'}.`)},
   ai:c=>{const top=c.opp.sites.map(s=>s.followers).sort((a,b)=>b-a);return Math.min(3,(top[0]||0)+(top[1]||0))*1.2}},
  {id:'trade',name:'GET FUCKED',set:'exp',level:3,type:'reaction',cost:0,count:1,trigger:'play',
   text:'When an opponent plays a card, discard that card with no effect. They still lose the actions required to play that card, but they also draw 1 card of your level or lower.'},

  /* ---------- LEVEL IV · CORE SET ---------- */
  {id:'ark',name:'Promised Citadel',set:'core',level:4,type:'site',cost:2,integrity:6,count:1,worth:2.5,enterValue:6,
   text:'When Promised Citadel enters play, gain 6 followers on Promised Citadel.',abilities:[],
   onEnter:(c,s)=>{s.followers+=6;sfx('place',4);log('6 followers gather at the Promised Citadel.')}},
  {id:'doomsday',name:'Dragon\'s Maw',set:'core',level:4,type:'site',cost:1,integrity:5,count:1,worth:4.5,fortified:true,text:'Fortified.',
   abilities:[{need:3,actions:2,text:'Do 8 damage to a single site.',run:c=>hit(c,8,'Dragon\'s Maw'),ai:c=>bestOpp(c,8)}]},
  {id:'forcefield',name:'Aegis',set:'core',level:4,type:'site',cost:1,integrity:3,count:1,worth:3.5,fortified:true,text:'Fortified.',
   abilities:[{need:1,actions:0,infinite:true,passive:true,text:'When one of your other sites is damaged, prevent that damage.'}]},
  {id:'mindcontrol',name:'Dominate',set:'core',level:4,type:'event',cost:2,count:1,text:'Steal all the followers on a single site and place them on any combination of sites you own.',
   play:async c=>{
     const src=await pickSite(c.pi,{prompt:'Dominate: choose a site to steal every follower from.',filter:s=>s.owner!==c.pi&&s.followers>0,aiScore:s=>s.followers});if(!src)return;
     const n=src.followers, own=c.me.sites.filter(canGain);if(!own.length)return;
     let counts;
     if(c.me.ai) counts=placePlan(c.me,n);
     else if(own.length===1){counts=Object.fromEntries(c.me.sites.map(s=>[s.uid,s.followers]));counts[own[0].uid]+=n}
     else counts=await relocatePrompt(c.pi,{mode:'place',pool:n,title:`Dominate: place ${n} stolen follower${n>1?'s':''}`,cost:'Part of Dominate'});
     if(!counts)return;
     c.pay();src.followers=0;for(const s of c.me.sites)if(counts[s.uid]!==undefined)s.followers=counts[s.uid];sfx('place',n);sweep();
     log(`${c.me.name} seize${s_(c.me)} ${n} follower${n>1?'s':''} from ${poss(c.opp)} ${src.card.def.name}.`)},
   ai:c=>c.me.sites.some(canGain)?Math.max(-1,...c.opp.sites.map(s=>s.followers*1.6)):-1},
  {id:'oracle',name:"Oracle's Eye",set:'core',level:4,type:'attachment',cost:1,count:1,
   text:'Draw 1 card from the highest level deck available to the site owner at the start of their turn.',
   aiAttach:(c,s)=>s.owner===c.pi&&!hasAtt(s,'oracle')?3+(integ(s)-s.damage)*0.3+(isFort(s)?0.5:0):-99,
   ai:c=>c.me.sites.length&&drawableLevels(c.pi).length?3:-1},
  {id:'sentient',name:'Awakened Grimoire',set:'core',level:4,type:'attachment',cost:1,count:1,
   text:'After this site activates an ability, site owner may immediately activate the same ability again for no actions.',
   aiAttach:(c,s)=>s.owner===c.pi&&!hasAtt(s,'sabotage')&&(s.card.def.abilities||[]).some(a=>!a.passive)?(s.card.def.worth||1)+(s.followers>=minNeed(s)?1:0):-99,
   ai:c=>c.me.sites.some(s=>!hasAtt(s,'sabotage')&&(s.card.def.abilities||[]).some(a=>!a.passive))?2:-1},

  /* ---------- LEVEL IV · EXPANSION SET ---------- */
  {id:'alienweapon',name:'Doom Engine',set:'exp',level:4,type:'site',cost:1,integrity:3,count:1,worth:3,fortified:true,text:'Fortified.',
   abilities:[
    {need:0,actions:0,text:'Tuck 1 card under Doom Engine to discard up to 2 cards from the top of any draw stack.',can:c=>c.me.hand.length>0&&[1,2,3,4].some(l=>G.stacks[l].length),
     run:async c=>{
       const lv=[1,2,3,4].filter(l=>G.stacks[l].length);
       const k=await pickHandCard(c.pi,{prompt:'Doom Engine: choose a card to tuck under Doom Engine.'});if(!k)return;
       const l=await pickOption(c.pi,{prompt:'Doom Engine: discard cards from the top of which draw stack?',options:lv.map(x=>({label:`Level ${ROMAN[x]} (${G.stacks[x].length} left)`,value:x})),aiChoose:()=>awStack(c,lv),cancellable:true});if(!l)return;
       const max=Math.min(2,G.stacks[l].length);
       const n=c.me.ai?max:await pickOption(c.pi,{prompt:`Doom Engine: discard how many cards from Level ${ROMAN[l]}?`,options:Array.from({length:max},(_,i)=>({label:String(i+1),value:i+1})),cancellable:true});if(!n)return;
       c.pay();c.me.hand.splice(c.me.hand.indexOf(k),1);c.site.tucked.push(k);
       for(let i=0;i<n;i++)G.discard.push(G.stacks[l].pop());
       log(`${c.me.name} tuck${s_(c.me)} a card under Doom Engine and discard${s_(c.me)} ${n} card${n>1?'s':''} from the Level ${ROMAN[l]} stack.`);
       if(!G.stacks[l].length){log(`The Level ${ROMAN[l]} stack has run out.`);G.pending.push({t:'stackout'})}},
     ai:c=>c.me.hand.length>=3?(totalF(c.me)>totalF(c.opp)+3?1.6:0.8):-1},
    {need:2,actions:0,text:'Do 2 damage for each card tucked under Doom Engine, divided among up to 2 sites.',can:c=>tuckN(c.site)>0,
     run:async c=>{const n=2*tuckN(c.site);const a=await divideDamage(c,n,2,`Doom Engine (${n} damage)`,()=>true);if(!a)return;c.pay();for(const [s,k] of a)await damage(c.pi,s,k)},
     ai:c=>tuckN(c.site)?bestAlloc(c.opp.sites,2*tuckN(c.site),2,dmgValue).v:-1}]},
  {id:'assimilation',name:'Conquest',set:'exp',level:4,type:'event',cost:2,count:1,
   text:'Choose a site owned by an opponent. They must relocate followers off that site, if able. Then gain ownership of that site.',
   play:async c=>{
     const s=await pickSite(c.pi,{prompt:"Conquest: choose an opponent's site to take over.",filter:s=>s.owner!==c.pi,aiScore:s=>assimValue(c,s)});if(!s)return;
     c.pay();
     const owner=G.players[s.owner];
     if(s.followers&&canLeave(s)&&owner.sites.some(x=>x!==s&&canGain(x))){
       const counts=owner.ai?threatPlan(owner,s):await relocatePrompt(owner.i,{mode:'threat',site:s,forced:true,title:`${hotPfx(owner)}Conquest: move every follower off ${s.card.def.name}`,cost:'Required, no action cost'});
       applyCounts(owner,counts);log(`${owner.name} evacuate${s_(owner)} ${s.card.def.name}.`);
     }
     if(!inPlay(s))return;
     owner.sites.splice(owner.sites.indexOf(s),1);s.owner=c.pi;s.usedTurn=-1;
     const pos=await pickSlot(c.pi,s.card.def,true);c.me.sites.splice(pos??c.me.sites.length,0,s);sfx('build');sweep();
     log(`${c.me.name} take${s_(c.me)} over ${poss(owner)} ${s.card.def.name}${s.followers?`, along with ${s.followers} follower${s.followers>1?'s':''}`:''}.`)},
   ai:c=>Math.max(-1,...c.opp.sites.map(s=>assimValue(c,s)))},
  {id:'brainemu',name:'Golden Age',set:'exp',level:4,type:'event',cost:1,count:1,text:'Gain 2 followers on each site you own. OR Gain 7 followers on a single site.',
   play:async c=>{
     const own=c.me.sites.filter(canGain);if(!own.length)return;
     const mode=await pickOption(c.pi,{prompt:'Golden Age: choose one.',options:[{label:`2 followers on each of your ${own.length} site${own.length>1?'s':''}`,value:'a'},{label:'7 followers on one site',value:'b'}],aiChoose:()=>own.length*2>7?'a':'b',cancellable:true});
     if(!mode)return;
     if(mode==='a'){c.pay();for(const s of own)gainF(s,2);log(`${c.me.name} gain${s_(c.me)} ${own.length*2} followers.`)}
     else await gainOnOwn(c,7,'Golden Age')},
   ai:c=>{const n=c.me.sites.filter(canGain).length;return n?Math.max(n*2,7):-1}},
  {id:'nanobots',name:'Unmaking',set:'exp',level:4,type:'event',cost:2,count:1,
   text:'Remove a total of up to 4 damage counters from any combination of sites. Then do 1 damage for each counter removed, divided among any number of sites.',
   play:async c=>{
     if(!allSites().some(s=>s.damage>0)){c.pay();log('Unmaking finds nothing to take apart.');return}
     let rem;
     if(c.me.ai) rem=nanoPlan(c);
     else{
       rem=new Map();
       for(let i=0;i<4;i++){
         const s=await pickSite(c.pi,{prompt:`Unmaking: choose a site to remove damage counter ${i+1} of up to 4 from.`,filter:s=>s.damage-(rem.get(s)||0)>0,aiScore:()=>0,extra:i>0?[{label:'Finish',value:'done'}]:[],cancellable:i===0});
         if(!s){if(i===0)return;break}
         if(s==='done')break;
         rem.set(s,(rem.get(s)||0)+1);
       }
     }
     const n=[...rem.values()].reduce((a,b)=>a+b,0);if(!n)return;
     c.pay();for(const [s,k] of rem)s.damage-=k;log(`Unmaking remove ${n} damage counter${n>1?'s':''}.`);
     const a=await divideDamage(c,n,n,`Unmaking (${n} damage)`,()=>true,true);
     if(a)for(const [s,k] of a)await damage(c.pi,s,k)},
   ai:c=>{const rem=nanoPlan(c);const n=[...rem.values()].reduce((a,b)=>a+b,0);if(!n)return -1;
     let own=0;for(const [s,k] of rem)if(s.owner===c.pi)own+=k;return own*0.8+Math.max(0,bestAlloc(c.opp.sites,n,n,dmgValue).v)}},
  {id:'replicator',name:'Mirror Forge',set:'exp',level:4,type:'site',cost:1,integrity:3,count:1,worth:2.5,
   abilities:[{need:0,actions:1,text:'Take 1 site out of the discard pile and play it for no actions. Then do 1 structural damage to Mirror Forge.',can:c=>G.discard.some(k=>k.def.type==='site'),
     run:async c=>{
       const k=await pickDiscard(c,'Mirror Forge: choose a discarded site to play.',k=>k.def.type==='site',k=>(k.def.worth||1)+(k.def.enterValue||0));if(!k)return;
       G.discard.splice(G.discard.indexOf(k),1);c.me.hand.push(k);
       const ok=await playCard(c.pi,k,{free:true});
       if(!ok){if(c.me.hand.includes(k)){c.me.hand.splice(c.me.hand.indexOf(k),1);G.discard.push(k)}return}
       c.pay();if(inPlay(c.site))await damage(c.pi,c.site,1,{structural:true})},
     ai:c=>{const v=Math.max(-1,...G.discard.filter(k=>k.def.type==='site').map(k=>(k.def.worth||1)+(k.def.enterValue||0)));return integ(c.site)-c.site.damage<=1?v-c.site.followers-1:v}}]},
];
for(const d of CARDS)if(d.type==='site'&&(d.abilities||[]).some(a=>/do \d|damage each|damage for each|kill/i.test(a.text)&&!/you own|your followers are killed/i.test(a.text)))d.attacker=true;
const DEF=Object.fromEntries(CARDS.map(d=>[d.id,d]));

/* ================= ENGINE ================= */
let G=null;
let UI={prompt:null,relocate:null,curtain:false,menu:true,busy:false,set:'core'};
try{const v=localStorage.getItem('tb-set');if(v)UI.set=v==='both'?'random':v}catch(e){}
let uidc=1;
const SET_LABEL={core:'Core Set',exp:'Expansion Set',random:'Totally mixed'};
/* Draw stack sizes for a 2-player game; Level I loses 10 more when the opening hands are dealt. */
const STACK_SIZE={1:20,2:15,3:10,4:5};

function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function log(msg){if(!G)return;G.log.unshift(msg);if(G.log.length>80)G.log.pop()}
function mkSite(card,owner){return{uid:card.uid,card,owner,followers:0,damage:0,attachments:[],tucked:[],usedTurn:-1}}
function mkCtx(pi,extra){return Object.assign({pi,me:G.players[pi],opp:G.players[1-pi],oppi:1-pi},extra)}

function newGame(mode,setChoice){
  PEND.clear();PENDZ.clear();
  uidc=1;
  /* One mode only: every level's cards are shuffled together and dealt to the stack size. */
  const choice='random';
  const sets={};
  for(const l of [1,2,3,4]) sets[l]=choice==='mix'?(Math.random()<.5?'core':'exp'):choice;
  const stacks={1:[],2:[],3:[],4:[]};
  for(const d of CARDS){
    if(d.set&&sets[d.level]&&sets[d.level]!=='random'&&d.set!==sets[d.level]) continue;
    for(let i=0;i<(d.count||0);i++) stacks[d.level].push({uid:uidc++,def:d});
  }
  for(const l in stacks){shuffle(stacks[l]);stacks[l]=stacks[l].slice(0,STACK_SIZE[l])}
  const names=mode==='ai'?['You','Opponent']:mode==='sim'?['Player A','Player B']:mode==='online'&&HOST.names?HOST.names():['Player 1','Player 2'];
  const players=[0,1].map(i=>({i,name:names[i],ai:mode==='sim'||(mode==='ai'&&i===1),level:1,hand:[],sites:[],actions:0,lof:0,lofTurn:-1}));
  G={mode,players,stacks,discard:[],turn:0,turnCount:0,log:[],over:null,pending:[],sets,choice};
  for(const p of players){
    const s=mkSite({uid:uidc++,def:DEF.homeland},p.i); s.followers=10; p.sites.push(s);
    for(let k=0;k<5;k++) p.hand.push(stacks[1].pop());
  }
  UI.prompt=null;UI.relocate=null;UI.menu=false;UI.busy=false;
  if(setChoice==='tutorial'){tutSetup();startTurn(0);return}
  const first=Math.random()<.5?0:1;
  log(`${players[first].name} ${isYou(players[first])?'are':'is'} the first player.`);
  startTurn(first);
}

async function startTurn(pi){
  G.turn=pi; G.turnCount++; G.turnStart=Date.now(); G.turnEnd=null;
  const p=G.players[pi];
  p.actions=G.turnCount===1&&!G.tut?2:3;
  log(`— ${p.name}: turn begins (${p.actions} actions).`);
  if(p.lof){p.actions=Math.max(0,p.actions-p.lof);p.lof=0;p.lofTurn=G.turnCount;log(`Interdict: ${p.name} ${isYou(p)?'have':'has'} ${p.actions} action${p.actions===1?'':'s'} this turn.`)}
  for(const s of [...p.sites]) for(const a of [...s.attachments]){
    if(a.def.id==='plague'&&s.followers>0){killOn(s,1);log(`${a.def.name} kills a follower on ${poss(p)} ${s.card.def.name}.`)}
  }
  for(const s of [...p.sites]) for(const a of s.attachments){
    if(a.def.id==='conscription'&&gainF(s,1)) log(`Muster adds a follower to ${poss(p)} ${s.card.def.name}.`);
    /* Oracle's Eye: a card from the highest-level stack the owner can draw from */
    if(a.def.id==='oracle'){const lv=drawableLevels(p.i);if(lv.length){log(`Oracle's Eye on ${poss(p)} ${s.card.def.name} opens.`);drawCard(p.i,lv[lv.length-1])}}
  }
  sweep();
  if(G.mode==='hot') UI.curtain=true;
  UI.busy=true; render();
  for(const s of [...p.sites]) for(const a of [...s.attachments]) if(a.def.id==='sanctions'&&inPlay(s)&&!G.over){
    log(`Quarantine strains ${poss(p)} ${s.card.def.name}.`);await withSrc({pi:a.attachedBy},()=>damage(a.attachedBy,s,1,{structural:true}));
  }
  await flush();
  UI.busy=false;
  if(checkGameOver()){render();return}
  render();
  if(p.ai) runAI();
}

async function endTurn(){
  if(!G||G.over) return;
  const p=G.players[G.turn];
  for(const s of p.sites) for(const a of [...s.attachments]) if(a.def.id==='threat'){
    s.attachments.splice(s.attachments.indexOf(a),1);G.discard.push(a);log(`Death Mark on ${poss(p)} ${s.card.def.name} is discarded.`);
  }
  const empty=[1,2,3,4].filter(l=>!G.stacks[l].length).length;
  if(empty>=3){
    const t=G.players.map(totalF);
    G.over={winner:decide(t),type:'Majority victory',reason:`Three draw stacks ran out. Followers: ${G.players[0].name} ${t[0]}, ${G.players[1].name} ${t[1]}.`};
    log('Three draw stacks are empty. The game ends.');gameOverSound();render();return;
  }
  UI.relocate=null;
  await startTurn(1-G.turn);
}
function decide(t){
  if(t[0]!==t[1]) return t[0]>t[1]?0:1;
  const l=G.players.map(p=>p.level);
  if(l[0]!==l[1]) return l[0]>l[1]?0:1;
  return -1;
}
function checkGameOver(){
  if(!G||G.over) return !!(G&&G.over);
  const t=G.players.map(totalF);
  if(t[0]===0||t[1]===0){
    const w=(t[0]===0&&t[1]===0)?decide(t):(t[0]===0?1:0);
    G.over={winner:w,type:'Total victory',reason:w===-1?'Both sides lost every follower at the same level.':`${isYou(G.players[1-w])?'You have':G.players[1-w].name+' has'} no followers left.`};
    log('The game is over.');
    gameOverSound();
    if(G.sim) return true;
    if(UI.prompt){const r=UI.prompt.resolve;UI.prompt=null;r(null)}
    if(UI.relocate){const r=UI.relocate.resolve;UI.relocate=null;r(null)}
    return true;
  }
  return false;
}

function drawableLevels(pi){const p=G.players[pi],o=[];for(let l=1;l<=p.level;l++)if(G.stacks[l].length)o.push(l);return o}
function drawCard(pi,l){
  const c=G.stacks[l].pop(); if(!c) return null;
  const p=G.players[pi];
  p.hand.push(c); sfx('draw'); log(`${p.name} draw${s_(p)} a Level ${ROMAN[l]} card.`);
  if(!G.stacks[l].length){log(`The Level ${ROMAN[l]} stack has run out.`);G.pending.push({t:'stackout'})}
  return c;
}
function pickDrawLevel(pi,cancellable,prompt){
  const lv=drawableLevels(pi); if(!lv.length) return Promise.resolve(null);
  if(lv.length===1) return Promise.resolve(lv[0]);
  return pickOption(pi,{prompt:prompt||'Draw from which level?',options:lv.map(l=>({label:`Level ${ROMAN[l]} (${G.stacks[l].length} left)`,value:l})),aiChoose:()=>lv[lv.length-1],cancellable});
}

/* Choices: the computer decides instantly; a person gets a prompt */
function pickSite(pi,o){
  const cands=allSites().filter(o.filter);
  if(!cands.length) return Promise.resolve(null);
  if(G.players[pi].ai){cands.sort((a,b)=>o.aiScore(b)-o.aiScore(a));return Promise.resolve(cands[0])}
  if(cands.length===1&&o.auto) return Promise.resolve(cands[0]);
  return new Promise(res=>{UI.prompt={kind:'site',pi,text:o.prompt,set:new Set(cands.map(s=>s.uid)),extra:o.extra||[],cancellable:o.cancellable!==false,resolve:v=>{UI.prompt=null;res(v);render()}};render()});
}
function pickOption(pi,o){
  if(G.players[pi].ai) return Promise.resolve(o.aiChoose?o.aiChoose():o.options[0].value);
  return new Promise(res=>{UI.prompt={kind:'opts',pi,text:o.prompt,options:o.options,cancellable:!!o.cancellable,resolve:v=>{UI.prompt=null;res(v);render()}};render()});
}
function pickHandCard(pi,o){
  const p=G.players[pi], cands=p.hand.filter(o.filter||(()=>true));
  if(!cands.length) return Promise.resolve(null);
  if(p.ai){cands.sort((a,b)=>keepValue(a)-keepValue(b));return Promise.resolve(cands[0])}
  return new Promise(res=>{UI.prompt={kind:'hand',pi,text:o.prompt,set:new Set(cands.map(k=>k.uid)),cancellable:o.cancellable!==false,cancelLabel:o.cancelLabel,resolve:v=>{UI.prompt=null;res(v);render()}};render()});
}
function relocatePrompt(pi,o){
  const p=G.players[pi], cur=Object.fromEntries(p.sites.map(s=>[s.uid,s.followers]));
  return new Promise(res=>{UI.relocate={pi,mode:o.mode||'full',src:o.site?o.site.uid:null,max:o.max??Infinity,forced:!!o.forced,title:o.title,cost:o.cost,pool:o.pool||0,counts:{...cur},orig:{...cur},resolve:v=>{UI.relocate=null;res(v);render()}};render()});
}
function rlCan(r,uid,dir){
  const isSrc=uid===r.src;
  const site=G.players[r.pi].sites.find(s=>s.uid===uid);
  if(r.mode==='place') return dir<0?r.counts[uid]>r.orig[uid]:r.pool>0&&(!site||canGain(site));
  if(dir<0){
    if(r.counts[uid]<=0) return false;
    if(r.counts[uid]>r.orig[uid]) return true;
    if(site&&!canLeave(site)) return false;
    if(r.mode==='to') return !isSrc;
    if(r.mode==='off'||r.mode==='threat') return isSrc;
    if(r.mode==='escape') return isSrc&&(r.orig[uid]-r.counts[uid])<r.max;
    return true;
  }
  if(r.pool<=0) return false;
  if(r.counts[uid]<r.orig[uid]) return !(r.mode==='threat'&&isSrc);
  if(site&&!canGain(site)) return false;
  if(r.mode==='to') return isSrc;
  if(r.mode==='off'||r.mode==='threat') return !isSrc;
  if(r.mode==='escape'){if(isSrc) return false;const dest=Object.keys(r.counts).map(Number).filter(u=>u!==r.src&&r.counts[u]>r.orig[u]);return !dest.length||dest.includes(uid)}
  return true;
}

/* Damage, with reactions offered to the site's owner first */
async function damage(src,site,n,opt={}){
  if(!inPlay(site)||n<=0) return;
  const owner=G.players[site.owner];
  if(src!=null&&src!==site.owner&&ffProtects(site)){log(`${Poss(owner)} Aegis blocks ${n} damage to ${site.card.def.name}.`);return}
  if(src!=null&&src!==site.owner){
    const used=new Set();
    for(let g=0;g<6&&n>0&&inPlay(site);g++){
      const rs=owner.hand.filter(k=>k.def.react&&!used.has(k.uid)&&k.def.reactCan(owner.i,site,n,opt));
      if(!rs.length) break;
      let pick=null;
      if(owner.ai){const sc=rs.map(k=>({k,v:k.def.reactAI(owner.i,site,n,opt)})).filter(x=>x.v>0).sort((a,b)=>b.v-a.v);pick=sc.length?sc[0].k:null}
      else pick=await pickOption(owner.i,{prompt:`${hotPfx(owner)}${subj(G.players[src])} about to do ${n}${opt.structural?' structural':''} damage to ${poss(owner)} ${site.card.def.name}. Play a reaction?`,
        options:[...rs.map(k=>({label:k.def.name,value:k})),{label:'No reaction',value:null}]});
      if(!pick) break;
      used.add(pick.uid);
      const r={pi:owner.i,site,n,opt,paid:false};
      r.pay=()=>{if(r.paid)return;r.paid=true;fxReveal(owner.i,pick);owner.hand.splice(owner.hand.indexOf(pick),1);G.discard.push(pick);log(`${owner.name} play${s_(owner)} ${pick.def.name}.`)};
      await pick.def.react(r);
      if(r.paid){site=r.site;n=r.n}
      render();
    }
    if(n<=0||!inPlay(site)) return;
  }
  const kill=(opt.structural||isFort(site))?0:Math.min(n,site.followers);
  SND_CAP=fxArrow({s:CUR_SRC||{pi:src},t:site.uid,st:!!opt.structural,n,k:kill});
  try{
    site.followers-=kill; site.damage+=n; noteKill(site.owner,kill,site);
    log(`${n}${opt.structural?' structural':''} damage to ${poss(owner)} ${site.card.def.name}${kill?` (${kill} follower${kill>1?'s':''} killed)`:''}.`);
    if(site.damage>=integ(site)) destroySite(site); else sfx(opt.structural?'struct':'hit');
  }finally{SND_CAP=null}
  sweep();
}
function destroySite(site,verb='destroyed'){
  const owner=G.players[site.owner];
  sfx('destroy');
  const k=site.followers; site.followers=0;
  noteKill(site.owner,k,site);
  owner.sites.splice(owner.sites.indexOf(site),1);
  if(site.card.def.id==='pplant'&&site.tucked.length) G.pending.push({t:'pplant',pi:site.owner,n:site.tucked.length});
  G.pending.push({t:'destroyed',pi:site.owner,lvl:site.card.def.level,extra:site.attachments.length+site.tucked.length,name:site.card.def.name});
  G.discard.push(site.card,...site.attachments,...site.tucked);
  log(`${Poss(owner)} ${site.card.def.name} is ${verb}${k?`, killing ${k} follower${k>1?'s':''}`:''}.`);
}
async function attach(card,s,by,moved){
  card.attachedBy=by; s.attachments.push(card);
  if(!moved) log(`${card.def.name} is attached to ${poss(G.players[s.owner])} ${s.card.def.name}.`);
  sweep();
  if(card.def.onAttach&&s.attachments.includes(card)) await card.def.onAttach(s,by);
}

/* Triggered effects resolve after the action that caused them. Kills from one action count as one event. */
async function flush(){
  let guard=0;
  while(G&&G.pending.length&&!G.over&&guard++<30){
    const wave=G.pending.splice(0);
    const kills={};
    const heal={};
    for(const e of wave) if(e.t==='kill'){kills[e.pi]=(kills[e.pi]||0)+e.n;for(const u of e.hh||[])heal[u]=(heal[u]||0)+e.n}
    for(const pi of [0,1]) if(kills[pi]&&!G.over) await onKilled(pi,kills[pi],heal);
    for(const e of wave){
      if(G.over) break;
      if(e.t==='upgrade'||e.t==='stackout') await badOmen(e.t==='upgrade'?1:3);
      else if(e.t==='reloc') await onRelocate(e.pi);
      else if(e.t==='destroyed') await onDestroyed(e);
      else if(e.t==='pplant') await onPowerPlant(e);
    }
    checkGameOver();
  }
  if(G) G.pending.length=0;
}
async function badOmen(n){
  const hits=[];
  for(const s of allSites()) for(const a of s.attachments) if(a.def.id==='badomen') hits.push([s,a]);
  for(const [s,a] of hits){ if(!inPlay(s)) continue; log(`${a.def.name} strikes ${poss(G.players[s.owner])} ${s.card.def.name}.`); await withSrc({pi:a.attachedBy},()=>damage(a.attachedBy,s,n)); }
}
async function onKilled(pi,n,heal={}){
  const p=G.players[pi];
  for(const h of ofId(p,'healerhut')){
    const k=heal[h.uid];if(!k||!inPlay(h)||abilBlocked(h)) continue;
    const ab=h.card.def.abilities;if(h.followers<effNeed(h,ab[0])) continue;
    const g=h.followers>=effNeed(h,ab[1])?Math.ceil(k/2):Math.floor(k/2);
    const x=gainF(h,g);
    if(x) log(`${Poss(p)} Healer Hut saves ${x} follower${x>1?'s':''}.`);
  }
  for(const h of ofId(p,'hospital')){
    if(!inPlay(h)||abilBlocked(h)) continue;
    const up=h.followers>=effNeed(h,h.card.def.abilities[1]);
    const g=up?Math.ceil(n/2):Math.floor(n/2);
    const x=gainF(h,g);
    if(x) log(`${Poss(p)} Infirmary saves ${x} follower${x>1?'s':''}.`);
  }
  const m=p.hand.find(k=>k.def.trigger==='kill');
  if(m&&drawableLevels(pi).length){
    const use=p.ai?true:await pickOption(pi,{prompt:`${hotPfx(p)}${n} of your followers ${n>1?'were':'was'} killed. Play Blessed Sacrifice to draw ${n} card${n>1?'s':''}?`,options:[{label:'Play Blessed Sacrifice',value:true},{label:'Not now',value:false}]});
    if(use&&p.hand.includes(m)){fxReveal(pi,m);discardFromHand(pi,m);log(`${p.name} play${s_(p)} Blessed Sacrifice.`);await drawN(pi,n,'Blessed Sacrifice')}
  }
}
async function onRelocate(pi){
  const p=G.players[pi],o=G.players[1-pi];
  for(const s of ofId(o,'sniper')){
    if(G.over||!inPlay(s)||abilBlocked(s)) continue;
    const ab=s.card.def.abilities;
    if(s.followers<effNeed(s,ab[0])) continue;
    const k=s.followers>=effNeed(s,ab[1])?2:1;
    for(let i=0;i<k&&totalF(p)>0&&!G.over;i++){
      const t=await pickSite(o.i,{prompt:`${hotPfx(o)}Ranger's Perch: ${p.name} relocated. Choose one of ${isYou(p)?'your':'their'} sites to kill a follower on${k>1?` (${i+1} of ${k})`:''}.`,
        filter:x=>x.owner===pi&&x.followers>0,aiScore:killValue,auto:true,cancellable:false});
      if(t){killOn(t,1);log(`Ranger's Perch kills a follower on ${poss(p)} ${t.card.def.name}.`);checkGameOver()}
    }
  }
  for(const s of ofId(o,'spy')){
    if(G.over||!inPlay(s)||abilBlocked(s)||s.followers<effNeed(s,s.card.def.abilities[0])) continue;
    const lv=[];for(let l=1;l<=p.level;l++)if(G.stacks[l].length)lv.push(l);
    if(!lv.length) continue;
    const l=lv.length===1||o.ai?lv[lv.length-1]:await pickOption(o.i,{prompt:`${hotPfx(o)}Thieves' Guild: ${p.name} relocated. Draw from which level?`,options:lv.map(x=>({label:`Level ${ROMAN[x]} (${G.stacks[x].length} left)`,value:x}))});
    log(`${Poss(o)} Thieves' Guild reports in.`);drawCard(o.i,l);
  }
}
async function onPowerPlant(e){
  const p=G.players[e.pi];if(!p.sites.length)return;
  const picks=[];
  for(let i=0;i<2&&picks.length<p.sites.length;i++){
    const s=await pickSite(e.pi,{prompt:`${hotPfx(p)}Your Arcane Furnace was destroyed. Choose ${i?'a second':'a'} site of yours to take ${e.n} structural damage.`,filter:s=>s.owner===e.pi&&!picks.includes(s),aiScore:s=>-lossOf(s,e.n,{structural:true}),auto:true,cancellable:false});
    if(s)picks.push(s);
  }
  log(`${Poss(p)} Arcane Furnace explodes.`);
  for(const s of picks)await damage(e.pi,s,e.n,{structural:true});
}
async function onDestroyed(e){
  const p=G.players[e.pi];
  const m=p.hand.find(k=>k.def.trigger==='destroyed');
  if(!m||!drawableLevels(e.pi).length) return;
  const n=e.lvl+e.extra;
  const use=p.ai?true:await pickOption(e.pi,{prompt:`${hotPfx(p)}Your ${e.name} was destroyed. Play Blood Feud to draw ${n} card${n>1?'s':''}?`,options:[{label:'Play Blood Feud',value:true},{label:'Not now',value:false}]});
  if(use&&p.hand.includes(m)){fxReveal(e.pi,m);discardFromHand(e.pi,m);log(`${p.name} play${s_(p)} Blood Feud.`);await drawN(e.pi,n,'Blood Feud')}
}

function abilityReady(pi,site,i){
  const ab=(site.card.def.abilities||[])[i], p=G.players[pi];
  if(!ab) return false;
  if(ab.passive||G.over||G.turn!==pi||site.owner!==pi||!inPlay(site)||abilBlocked(site)) return false;
  if(site.followers<effNeed(site,ab)||p.actions<ab.actions) return false;
  if(!ab.infinite&&site.usedTurn===G.turnCount) return false;
  if(ab.can&&!ab.can(mkCtx(pi,{site}))) return false;
  return true;
}
async function useAbility(pi,site,i){
  if(!abilityReady(pi,site,i)) return false;
  const ab=site.card.def.abilities[i],p=G.players[pi];
  let paid=false;
  const pay=()=>{if(paid)return;paid=true;p.actions-=ab.actions;if(!ab.infinite)site.usedTurn=G.turnCount;log(`${p.name} activate${s_(p)} ${site.card.def.name}.`)};
  await withSrc({site:site.uid,pi},()=>ab.run(mkCtx(pi,{site,pay})));
  if(paid&&!G.over&&hasAtt(site,'sentient')&&inPlay(site)&&!abilBlocked(site)&&site.followers>=effNeed(site,ab)&&(!ab.can||ab.can(mkCtx(pi,{site})))){
    const yes=p.ai?ab.ai(mkCtx(pi,{site}))>0.5:await pickOption(pi,{prompt:`Awakened Grimoire: activate ${site.card.def.name} again for no actions?`,options:[{label:'Activate again',value:true},{label:'No',value:false}]});
    if(yes){let p2=false;await withSrc({site:site.uid,pi},()=>ab.run(mkCtx(pi,{site,pay:()=>{if(p2)return;p2=true;log(`Awakened Grimoire activates ${site.card.def.name} again.`)}})))}
  }
  checkGameOver(); return paid;
}
/* Where a new site goes in its owner's row (it matters for Market's adjacent sites). */
function slotLabel(row,pos,self){
  const L=row[pos-1],R=row[pos+1];
  if(self) return L&&R?`between ${L.card.def.name} and ${R.card.def.name}`:L?`to the right of ${L.card.def.name}`:R?`to the left of ${R.card.def.name}`:'in the row';
  const l=row[pos-1],r=row[pos];
  return l&&r?`Between ${l.card.def.name} and ${r.card.def.name}`:l?`Far right, after ${l.card.def.name}`:r?`Far left, before ${r.card.def.name}`:'In the row';
}
function slotScore(row,pos,def){
  const nb=[row[pos-1],row[pos]].filter(Boolean);
  let v=nb.filter(s=>s.card.def.id==='market').length*1.5;
  if(def.id==='market') v+=nb.length;
  if(def.id==='healerhut') v+=nb.reduce((a,s)=>a+s.followers,0)*0.2;
  return v+pos*0.01;
}
/* Sites always go in the right-most slot of the owner's row */
async function pickSlot(pi){return G.players[pi].sites.length}
function canPlay(pi,card){
  const p=G.players[pi];
  return !G.over&&G.turn===pi&&card.def.type!=='reaction'&&card.def.cost<=p.actions&&hasEffect(pi,card);
}
/* Events that would do nothing right now can't be played (they'd just waste the card and Mana). */
const NO_EFFECT={
  pillage:(me,opp)=>allSites().some(s=>s.followers===0&&(!me.ai||s.owner!==me.i))||allSites().some(s=>s.tucked.length),
  revolt:(me,opp)=>opp.sites.some(s=>s.followers>0),
  bioweapon:(me,opp)=>opp.hand.length>0&&totalF(opp)>0,
  archaeology:(me,opp)=>{for(let l=1;l<me.level;l++)if(G.stacks[l].length)return true;return G.discard.length>0},
  dilemma:(me,opp)=>opp.sites.length>=2,
  nanobots:()=>allSites().some(s=>s.damage>0),
};
function hasEffect(pi,card){const f=NO_EFFECT[card.def.id];return !f||f(G.players[pi],G.players[1-pi])}
async function playCard(pi,card,o={}){
  const p=G.players[pi],d=card.def;
  if(o.free){if(G.over||d.type==='reaction'||!p.hand.includes(card))return false}
  else if(!canPlay(pi,card)) return false;
  let paid=false;
  const pay=()=>{if(paid)return;paid=true;if(d.type==='event')fxReveal(pi,card,undefined,true);if(!o.free)p.actions-=d.cost;p.hand.splice(p.hand.indexOf(card),1);log(`${p.name} play${s_(p)} ${d.name}.`)};
  const c=mkCtx(pi,{card,pay});
  const opp=G.players[1-pi], ta=opp.hand.find(k=>k.def.trigger==='play');
  if(ta){
    const use=opp.ai?cardValue(pi,card)>=2.2:await pickOption(opp.i,{prompt:`${hotPfx(opp)}${subj(p)} playing ${d.name}. Play GET FUCKED to cancel it?`,options:[{label:'Play GET FUCKED',value:true},{label:'Let it resolve',value:false}]});
    if(use&&opp.hand.includes(ta)&&p.hand.includes(card)&&!G.over){
      pay();fxReveal(opp.i,ta);discardFromHand(opp.i,ta);G.discard.push(card);
      log(`${opp.name} play${s_(opp)} GET FUCKED. ${d.name} is discarded with no effect.`);
      const lv=[];for(let l=1;l<=opp.level;l++)if(G.stacks[l].length)lv.push(l);
      if(lv.length){const l=lv.length===1||p.ai?lv[lv.length-1]:await pickOption(pi,{prompt:`${hotPfx(p)}GET FUCKED: draw 1 card from which level?`,options:lv.map(x=>({label:`Level ${ROMAN[x]} (${G.stacks[x].length} left)`,value:x}))});drawCard(pi,l)}
      checkGameOver();return true;
    }
  }
  if(d.type==='site'){const pos=await pickSlot(pi,d);if(pos==null)return false;pay();const s=mkSite(card,pi);p.sites.splice(pos,0,s);sfx('build');log(`${d.name} is placed ${slotLabel(p.sites,pos,s)}.`);if(d.onEnter)d.onEnter(c,s)}
  else if(d.type==='attachment'){
    const s=await pickSite(pi,{prompt:`Attach ${d.name} to which site?`,filter:()=>true,aiScore:s=>d.aiAttach(c,s)});
    if(!s) return false;
    fxReveal(pi,card,s.uid); pay(); await attach(card,s,pi);
  } else {
    await withSrc({card:card.uid,pi},()=>d.play(c));
    if(!paid) return false;
    G.discard.push(card);
  }
  checkGameOver(); return true;
}
async function actDraw(pi,l){
  const p=G.players[pi];
  if(G.over||G.turn!==pi||p.actions<1||l>p.level||!G.stacks[l].length) return false;
  p.actions--; drawCard(pi,l); return true;
}
async function actGain(pi){
  const p=G.players[pi]; if(G.over||G.turn!==pi||p.actions<1) return false;
  const s=await pickSite(pi,{prompt:'Place the new follower on which of your sites?',filter:s=>s.owner===pi&&canGain(s),aiScore:placeScore,auto:true});
  if(!s) return false;
  p.actions--; gainF(s,1); log(`${p.name} gain${s_(p)} a follower on ${s.card.def.name}.`); return true;
}
function actRelocate(pi,counts){
  const p=G.players[pi]; if(G.over||G.turn!==pi||p.actions<1) return false;
  const total=p.sites.reduce((a,s)=>a+(counts[s.uid]||0),0);
  if(total!==totalF(p)) return false;
  p.actions--; applyCounts(p,counts);
  log(`${p.name} relocate${s_(p)} followers.`); return true;
}
function actUpgrade(pi){
  const p=G.players[pi],cost=UPGRADE_COST[p.level];
  if(G.over||G.turn!==pi||!cost||p.actions<cost) return false;
  p.actions-=cost; upgradeLevel(pi); return true;
}

/* ================= COMPUTER OPPONENT ================= */
function relocatePlan(p){
  const plan={};
  for(const s of p.sites) plan[s.uid]=s.followers;
  const open=p.sites.filter(canGain);
  if(!open.length) return plan;
  let left=0;
  for(const s of p.sites) if(canLeave(s)){left+=s.followers;plan[s.uid]=0}
  const staffed=open.filter(s=>minNeed(s)>0&&!hasAtt(s,'plague')&&!hasAtt(s,'sabotage')).sort((a,b)=>(b.card.def.worth||1)-(a.card.def.worth||1));
  for(const s of staffed){const n=Math.max(0,needOf(s)-plan[s.uid]);if(left>=n){plan[s.uid]+=n;left-=n}}
  const pool=open.filter(s=>!hasAtt(s,'plague')); const tgt=pool.length?pool:open;
  while(left>0){
    let best=null,bv=Infinity;
    for(const s of tgt){const v=plan[s.uid]/Math.max(1,integ(s)-s.damage+(isFort(s)?3:0));if(v<bv){bv=v;best=s}}
    plan[best.uid]++;left--;
  }
  return plan;
}
function relocateValue(p,plan){
  if(p.sites.every(s=>s.followers===plan[s.uid])) return 0;
  const en=f=>p.sites.filter(s=>minNeed(s)>0&&f(s)>=minNeed(s)).length;
  const maxB=Math.max(...p.sites.map(s=>s.followers)), maxA=Math.max(...p.sites.map(s=>plan[s.uid]));
  const snipe=ofId(G.players[1-p.i],'sniper').some(s=>s.followers>=1&&!abilBlocked(s))?1.5:0;
  return 2*(en(s=>plan[s.uid])-en(s=>s.followers))+0.35*(maxB-maxA)-snipe;
}
function cardValue(pi,k){
  const d=k.def,p=G.players[pi];
  if(d.type==='reaction') return -1;
  if(d.type==='site') return ((d.worth||1)+(d.enterValue||0))*(p.sites.length<4?1:0.6);
  return d.ai(mkCtx(pi,{card:k}));
}
function aiBestFree(pi,except){
  let best=null;
  for(const k of G.players[pi].hand){if(k===except)continue;const v=cardValue(pi,k);if(!best||v>best.v)best={k,v}}
  return best;
}
/* Threat awareness: how much damage the opponent's sites could do next turn
   (damage abilities on sites already staffed to fire; nearly-staffed ones count half). */
const DMG_AB=ab=>!ab.passive&&/damage|kill/i.test(ab.text)&&!/you own/i.test(ab.text);
function oppThreat(pi){
  let t=0;
  for(const s of G.players[1-pi].sites){
    if(abilBlocked(s)) continue;
    let best=0;
    for(const ab of s.card.def.abilities||[]){
      if(!DMG_AB(ab)) continue;
      const need=effNeed(s,ab),m=/(\d+)/.exec(ab.text),dmg=m?+m[1]:1;
      if(s.followers>=need) best=Math.max(best,dmg);
      else if(s.followers+1>=need) best=Math.max(best,dmg*0.5);
    }
    t+=best;
  }
  return t;
}
/* Defences against that damage: damage reactions in hand, and a working Aegis */
function myDefence(pi){
  const p=G.players[pi];
  let d=p.hand.filter(k=>['escape','misinfo','fodder'].includes(k.def.id)).length*1.5;
  if(p.sites.some(s=>s.card.def.id==='forcefield'&&!abilBlocked(s)&&s.followers>=effNeed(s,s.card.def.abilities[0]))) d+=4;
  return d;
}
/* Upgrading while the opponent has damage sites ready to fire usually loses: only upgrade when
   unthreatened, or when there are enough reactions to absorb the hits. */
function aiSafeToUpgrade(pi){return oppThreat(pi)-myDefence(pi)<1}
function aiOptions(pi,steady){
  const p=G.players[pi],o=G.players[1-pi],opts=[];
  const j=steady?()=>0:()=>Math.random()*0.15;
  for(const s of p.sites)(s.card.def.abilities||[]).forEach((ab,i)=>{
    if(!abilityReady(pi,s,i)) return;
    const v=ab.ai(mkCtx(pi,{site:s}));
    if(v<=0) return;
    opts.push({score:ab.actions?v/ab.actions+j():v*1.5,aggr:/damage|kill|steal/i.test(ab.text)&&!/you own/i.test(ab.text),exec:()=>useAbility(pi,s,i)});
  });
  for(const c of p.hand){
    if(!canPlay(pi,c)) continue;
    const v=cardValue(pi,c);
    if(v<=0) continue;
    opts.push({score:v/Math.max(c.def.cost,0.5)+j(),aggr:!!c.def.attacker||(c.def.type==='event'&&/damage|kill|steal/i.test(c.def.text||'')&&!/you own/i.test(c.def.text||'')),exec:()=>playCard(pi,c)});
  }
  if(p.actions>=1){
    if(p.sites.some(canGain)) opts.push({score:0.9+j(),exec:()=>actGain(pi)});
    const lv=drawableLevels(pi);
    if(lv.length){opts.push({score:1.0+j(),exec:()=>actDraw(pi,lv[lv.length-1])})}
    const plan=relocatePlan(p),rv=relocateValue(p,plan);
    if(rv>=1.5) opts.push({score:rv,exec:async()=>actRelocate(pi,plan)});
  }
  const uc=UPGRADE_COST[p.level];
  if(uc&&p.actions>=uc){
    const stuck=drawableLevels(pi).length===0||G.stacks[p.level].length<=1;
    if(stuck||aiSafeToUpgrade(pi)){
      const sc=stuck?5:p.level===1?(G.turnCount>2?1.25:0.8):p.level===2?1.15:1.5;
      opts.push({score:sc+j(),exec:async()=>actUpgrade(pi)});
    }
  }
  return opts;
}
/* Lookahead: try each candidate action on a copy of the game (draw stacks reshuffled,
   the opponent's hand hidden) and keep the one that leaves the best position. */
const EV={depth:0,K2:6,pot:0.8,aggr:0.3,atk:2.5,stuck:3,f:0.9,fLate:1.0,card:1.1,cardL:0.25,lvl:4.5,site:1.4,staffed:0.8,tuck:0.4,att:1.2,act:0.9,risk:1.2,K:14};
const HIDDEN={id:'hidden',name:'Hidden card',level:1,type:'hidden',cost:99};
function cloneState(pi){
  const cc=k=>({uid:k.uid,def:k.def,attachedBy:k.attachedBy});
  const players=G.players.map(p=>({...p,ai:true,hand:p.i===pi?p.hand.map(cc):p.hand.map(k=>({uid:k.uid,def:HIDDEN})),
    sites:p.sites.map(s=>({...s,card:cc(s.card),attachments:s.attachments.map(cc),tucked:s.tucked.map(cc)}))}));
  const stacks={};for(const l of [1,2,3,4])stacks[l]=shuffle(G.stacks[l].map(cc));
  return {...G,players,stacks,discard:G.discard.map(cc),log:[],pending:G.pending.map(e=>({...e})),over:null,sim:true};
}
function attackPotential(pi){
  let v=0;
  for(const s of G.players[pi].sites){
    let b=0;
    (s.card.def.abilities||[]).forEach((ab,i)=>{if(!ab.passive&&/damage|kill|steal/i.test(ab.text)&&!/you own/i.test(ab.text)&&abilityReady(pi,s,i)){try{b=Math.max(b,ab.ai(mkCtx(pi,{site:s})))}catch(e){}}});
    v+=b;
  }
  return v;
}
/* What an attachment is worth to the site's owner over the next few turns */
function attVal(a,s){
  const w=s.card.def.worth||1,hasAb=(s.card.def.abilities||[]).length>0;
  switch(a.def.id){
    case 'plague': return -0.9*Math.min(s.followers,3)-0.3;
    case 'badomen': return -1.4-0.4*s.followers*(1/Math.max(1,integ(s)-s.damage));
    case 'sabotage': return hasAb?-w*1.3:-0.3;
    case 'threat': return -0.6;
    case 'sanctions': return -1.4-0.25*s.followers;
    case 'conscription': return 2.2;
    case 'compnet': return hasAb?w*0.9:0.2;
    case 'sentient': return hasAb?w*0.9:0.2;
    case 'oracle': return 2.8;
    case 'retrofit': return 0.6+0.15*s.followers;
    default: return a.def.fortify?0.6+0.25*s.followers:(HARMFUL.includes(a.def.id)?-EV.att:EV.att*0.6);
  }
}
function evalPos(pi,noPot){
  if(G.over){if(G.over.winner===pi)return 1e6;if(G.over.winner===1-pi)return -1e6;return 0}
  const late=[1,2,3,4].filter(l=>!G.stacks[l].length).length>=2?EV.fLate:0;
  const side=p=>{
    let v=totalF(p)*(EV.f+late)+(p.level-1)*EV.lvl+(p.i===G.turn&&!drawableLevels(p.i).length&&p.level<4?-EV.stuck:0);
    for(const s of p.sites){
      const I=integ(s),left=I-s.damage,w=s.card.def.worth||1;
      v+=w*EV.site*(left/I);
      const staffed=(s.card.def.abilities||[]).length&&s.followers>=needOf(s)&&!abilBlocked(s);
      if(staffed)v+=EV.staffed*w;
      if(s.card.def.attacker)v+=EV.atk*(staffed?1:0.4)*(left/I);
      v+=s.tucked.length*(s.card.def.id==='farm'?fieldsTuckVal(s):EV.tuck);
      if(s.card.def.id==='healerhut')v+=Math.min(2,adjacent(s).reduce((a,x)=>a+x.followers,0)*0.12);
      for(const a of s.attachments)v+=attVal(a,s);
      v-=EV.risk*s.followers*(s.damage/I)*(isFort(s)?0.6:1);
    }
    return v;
  };
  const me=G.players[pi],op=G.players[1-pi];
  const hv=[...me.hand].map(k=>EV.card+EV.cardL*k.def.level).sort((a,b)=>b-a).reduce((a,x,i)=>a+(i<6?x:x*0.4),0);
  return side(me)-side(op)+hv-op.hand.length*(EV.card+EV.cardL*op.level*0.5)+me.actions*EV.act+(!noPot&&G.turn===pi?EV.pot*attackPotential(pi):0);
}
async function simValue(pi,path,depth){
  /* Play the actions in path on a copy, then (if depth>0) also try the best follow-ups. */
  const real=G;let v=-Infinity;
  try{
    G=cloneState(pi);
    let bonus=0;
    for(const i of path){const o=aiOptions(pi,true)[i];if(!o){v=-Infinity;return v}await o.exec();await flush();if(o.aggr)bonus+=EV.aggr;if(G.over)break}
    v=Math.max(evalPos(pi,true)-G.players[pi].actions*EV.act, evalPos(pi))+bonus;
    if(depth>0&&!G.over&&G.turn===pi){
      const nxt=aiOptions(pi,true).map((o,i)=>[o.score,i]).sort((x,y)=>y[0]-x[0]).slice(0,EV.K2).map(x=>x[1]);
      const snap=G;G=real;
      for(const j of nxt){const w=await simValue(pi,[...path,j],depth-1);if(w>v)v=w}
      G=snap;
    }
  }catch(e){v=-Infinity}
  finally{G=real}
  return v;
}
async function aiStep(pi){
  /* Endgame push: with 2 draw stacks already empty, a player who is level or ahead on Zealots
     draws from the smallest stack it can reach to run out the third and end the game.
     (Without this, two AIs that have both outgrown the low stacks can stall forever.) */
  {const me=G.players[pi],op=G.players[1-pi];
   const empty=[1,2,3,4].filter(l=>!G.stacks[l].length).length;
   const lv=drawableLevels(pi);
   if(empty>=2&&me.actions>=1&&lv.length&&totalF(me)>=totalF(op)){
     const l=lv.reduce((a,b)=>G.stacks[b].length<G.stacks[a].length?b:a);await actDraw(pi,l);return true}}
  const base=aiOptions(pi,true);
  if(!base.length) return false;
  const idx=base.map((o,i)=>[o.score,i]).sort((a,b)=>b[0]-a[0]).slice(0,EV.K).map(x=>x[1]);
  let best=-Infinity,bi=-1;
  for(const i of idx){
    const v=await simValue(pi,[i],G.players[pi].actions>=2?EV.depth:0)+Math.random()*0.02;
    if(v>best){best=v;bi=i}
  }
  const endV=evalPos(pi,true)-G.players[pi].actions*EV.act;
  if(bi<0||best<=endV+0.05) return false;
  await base[bi].exec();
  return true;
}
async function runAI(){
  const pi=G.turn;
  if(G.tut){await tutOpponent(pi);return}
  await sleep(G.mode==='ai'?1500:0);
  let guard=0;
  while(!G.over&&G.turn===pi&&guard++<40){
    if(!(await aiStep(pi))) break;
    await flush();
    checkGameOver(); render();
    await sleep(G.mode==='ai'?2500:0);
  }
  if(!G.over&&G.turn===pi) await endTurn();
}

/* ================= TUTORIAL =================
   A guided game: fixed hands, a scripted opponent for its first two turns, and a coach panel that
   explains one idea at a time, highlights what to click and blocks everything else. */
const mkCard=id=>({uid:uidc++,def:DEF[id]});
function tutSetup(){
  const [me,op]=G.players;
  me.hand=['plague','siege','fort','farm','ram'].map(mkCard);
  op.hand=['church','temple','plague','farm','mission'].map(mkCard);
  /* no reaction cards anywhere near the scripted turns */
  for(const l of [1,2]) G.stacks[l]=G.stacks[l].filter(k=>k.def.type!=='reaction');
  /* top of the Hamlet stack: your Trebuchet, then the opponent's draw */
  G.stacks[1].push(mkCard('fertility'));
  const treb=mkCard('catapult');G.stacks[1].push(treb);
  const h=id=>me.hand.find(k=>k.def.id===id).uid;
  G.tut={step:0,free:false,treb:treb.uid,spark:h('siege'),fields:h('farm'),keep:h('fort')};
  G.log=[];log('Tutorial: you go first.');
}
async function tutOpponent(pi){
  const p=G.players[pi],me=G.players[1-pi],wait=ms=>sleep(ms);
  const step=async ms=>{await flush();checkGameOver();render();await wait(ms)};
  await wait(1300);
  if(!G.tut.free&&G.turnCount===2){
    /* turn 1: draw a card, build a Chapel */
    await actDraw(pi,1);await step(1500);
    const ch=p.hand.find(k=>k.def.id==='church');if(ch&&!G.over){await playCard(pi,ch);await step(1800)}
  } else if(!G.tut.free&&G.turnCount===4){
    /* turn 2: staff the Chapel, use it on Warpland, build an Altar, curse your Warpland with Witch's Rot */
    const home=p.sites.find(x=>x.card.def.start),chapel=p.sites.find(x=>x.card.def.id==='church');
    if(home&&chapel&&home.followers>2){
      const counts=Object.fromEntries(p.sites.map(x=>[x.uid,x.followers]));counts[home.uid]-=2;counts[chapel.uid]+=2;
      actRelocate(pi,counts);await step(1600);
      chapel.usedTurn=G.turnCount;log(`${p.name} activates Chapel.`);gainF(home,1);log(`${p.name} gains a Zealot on Warpland.`);await step(1600);
    }
    const altar=p.hand.find(k=>k.def.id==='temple');if(altar&&!G.over){await playCard(pi,altar);await step(1700)}
    const rot=p.hand.find(k=>k.def.id==='plague'),myHome=me.sites.find(x=>x.card.def.start);
    if(rot&&myHome&&!G.over&&p.actions>=1){
      fxReveal(pi,rot,myHome.uid);p.actions-=1;p.hand.splice(p.hand.indexOf(rot),1);log(`${p.name} plays Witch's Rot.`);
      await attach(rot,myHome,pi);await step(2600);
    }
  } else {
    /* easy opponent: no lookahead, picks among a few decent options at random, often stops early */
    let guard=0;
    while(!G.over&&G.turn===pi&&guard++<6){
      const opts=aiOptions(pi,true).filter(o=>o.score>0.6).sort((a,b)=>b.score-a.score).slice(0,4);
      if(!opts.length||Math.random()<0.25)break;
      await opts[Math.floor(Math.random()*opts.length)].exec();await step(1800);
    }
  }
  if(!G.over&&G.turn===pi) await endTurn();
}
const tutMe=()=>G.players[0];
const tutSiteOf=(pi,pred)=>G.players[pi].sites.find(pred);
const tutTreb=()=>tutSiteOf(0,x=>x.card.uid===G.tut.treb);
const tutFields=()=>tutSiteOf(0,x=>x.card.uid===G.tut.fields);
const siteSel=st=>st?`[data-site="${st.uid}"]`:'#__none';
const oppHomeSel=()=>siteSel(tutSiteOf(1,x=>x.card.def.start));
const oppChapelSel=()=>siteSel(tutSiteOf(1,x=>x.card.def.id==='church'));
/* the relocation must move exactly 3 Zealots from Warpland onto Trebuchet */
function tutRelocOK(){
  const R=UI.relocate,t=tutTreb(),home=tutSiteOf(0,x=>x.card.def.start);if(!R||!t||!home)return false;
  return tutMe().sites.every(x=>R.counts[x.uid]===R.orig[x.uid]+(x===t?3:x===home?-3:0));
}
const END_TURN={hl:'[data-act="end"]',allow:['[data-act="end"]']};
const TUT_STEPS=[
  {title:'Welcome to <span class="holo">Warplands</span>',text:'You and your opponent each lead a band of <b>Zealots</b>. Build sites, cast events and grow from a humble <b>Hamlet</b> into an <b>Empire</b>.<br><br><b>How to win:</b> wipe out every one of your opponent’s Zealots, or hold more Zealots than them when three of the four draw stacks run dry.',cont:true},
  {title:'Your Warpland',text:'This is your starting site, <b>Warpland</b>. It starts with 10 Zealots on it, shown by <span class="ic zn" role="img" aria-label="10 Zealots">10</span>. The <span class="hpbox tut-hp"><b>6</b></span> is its <b>HP</b>: it drops as the site takes damage, and at 0 the site is destroyed along with every Zealot on it. Hover it to see current / max HP.',hl:'#meZone [data-suid]',cont:true},
  {title:'Zealots',text:'<b>Zealots</b> are your people, and everything depends on them. They always live on one of your sites, and each site’s <span class="ic zn" role="img" aria-label="3 Zealots">3</span> counts how many are there. Many site abilities only work when enough Zealots are standing on that site, so where you keep them matters.<br><br>They are also your life: damage kills them, and <b>if every one of your Zealots dies, you lose</b>. Your total is shown next to your name.',hl:'#meZone .tokens',cont:true},
  {title:'Mana',text:'Everything you do costs <b>Mana</b>, shown by the diamonds above your hand. You get <b>3 Mana</b> at the start of every turn, and whatever you don’t spend is lost when your turn ends. Each card shows its cost in its top corner.',hl:'.pips',cont:true},
  {title:'Drawing cards',text:'Your hand holds the cards you can play. To get more, spend <b>1 Mana</b> to draw a card from one of the four <b>draw stacks</b> on the right: Hamlet, Township, City and Empire. Higher stacks hold stronger cards.',hl:'.rail .stacks',cont:true},
  {title:'Draw a Hamlet card',text:'You can only draw from your current level or lower, and you start at <b>Hamlet</b>. The higher stacks stay locked until you upgrade. Click the <b>Hamlet</b> stack to draw a card.',hl:'[data-draw="1"]',allow:['[data-draw="1"]','#prompt button'],done:()=>tutMe().hand.some(k=>k.uid===G.tut.treb)},
  {title:'Sites',text:'You drew a <b>Trebuchet</b>, a <b>site</b>. Sites are buildings: once played they stay on the table in your row, can hold Zealots, and have <b>abilities</b> you can use turn after turn. Like Warpland, each has HP and can be destroyed.',hl:()=>`[data-play="${G.tut.treb}"]`,cont:true},
  {title:'Play Trebuchet',text:'Spend <b>2 Mana</b> to play the Trebuchet: click it in your hand. New sites always go at the right end of your row.',hl:()=>`[data-play="${G.tut.treb}"],[data-slot]`,allow:()=>[`[data-play="${G.tut.treb}"]`,'[data-slot]','#prompt button'],done:()=>!!tutTreb()},
  {title:'Site abilities',text:'Each ability shows what it needs: <span class="ic zn" role="img" aria-label="3 Zealots">3</span> is how many Zealots must be standing on the site, and <span class="ic mn" role="img" aria-label="1 Mana"><b>1</b></span> is its Mana cost. Trebuchet’s first ability needs <b>3 Zealots</b> on it and <b>1 Mana</b> to do 1 damage. Each site can use one ability per turn.',hl:()=>tutTreb()?`[data-suid="${tutTreb().uid}"]`:'',cont:true},
  {title:'Out of Mana!',text:'You’ve spent all 3 Mana, and Trebuchet has no Zealots on it yet, so there is nothing left to do this turn. You’ll add Zealots to Trebuchet next turn. Click <b>End turn</b>.',...END_TURN,done:()=>G.turn===1},
  {title:'Opponent’s turn',text:'Your opponent is taking its turn…',wait:true,done:()=>G.turn===0&&G.turnCount>=3&&!UI.busy},
  {title:'What your opponent did',text:'Your opponent spent 1 Mana to <b>draw a card</b>, then 2 Mana to build a <b>Chapel</b>, a site whose ability adds Zealots once it has 2 Zealots on it. Your Mana is back to 3.',hl:'#oppZone [data-suid]',cont:true},
  {title:'Relocating',text:'Zealots can move between your sites. <b>Relocate</b> costs 1 Mana and lets you shift any number of Zealots from your sites onto your other sites in one go. This is how you staff a site so its abilities can be used.',hl:'[data-act="relocate"]',cont:true},
  {title:'Put Zealots on Trebuchet',text:'For now, let’s staff Trebuchet with the minimum number of Zealots it needs. Click <b>Relocate</b>, take <b>exactly 3</b> Zealots from Warpland and add them to Trebuchet, then confirm.',hl:'[data-act="relocate"]',allow:['[data-act="relocate"]','#overlay button'],relocExact:true,done:()=>{const t=tutTreb();return t&&t.followers>=3}},
  {title:'Use Trebuchet',text:'Trebuchet has its 3 Zealots. Click its first ability (<b>Do 1 damage</b>, 1 Mana) and target your opponent’s <b>Warpland</b>.',hl:()=>`[data-ab="${tutTreb()?tutTreb().uid:0}:0"],${oppHomeSel()}`,allow:()=>[`[data-ab="${tutTreb()?tutTreb().uid:0}:0"]`,oppHomeSel(),'#prompt button'],done:()=>{const t=tutTreb();return t&&t.usedTurn===G.turnCount}},
  {title:'Damage',text:'Each point of <b>damage</b> takes 1 HP off the site (<span class="hpbox tut-hp"><b>3</b></span>) and kills one Zealot on it. Two exceptions: <b>Fortified</b> sites and <b>Structural</b> damage hurt the site without killing its Zealots. And when a site’s HP reaches 0, it is <b>destroyed</b> and every Zealot on it dies.',hl:'#oppZone [data-suid]',cont:true},
  {title:'Play Fields',text:'Spend your last Mana to play <b>Fields</b> (1 Mana). It joins the right end of your row.',hl:()=>`[data-play="${G.tut.fields}"],[data-slot]`,allow:()=>[`[data-play="${G.tut.fields}"]`,'[data-slot]','#prompt button'],done:()=>!!tutFields()},
  {title:'Tucking',text:'Some sites let you <b>tuck</b> a card from your hand underneath them. A tucked card is out of play for good, but it powers the site: Fields gains you a Zealot each time you tuck, and its second ability grows with every card tucked under it.',hl:()=>tutFields()?`[data-suid="${tutFields().uid}"]`:'',cont:true},
  {title:'Use Fields',text:'Fields’ first ability needs no Zealots and no Mana. Click it, choose <b>Palisade</b> as the card to tuck, then place the new Zealot on <b>Fields</b>.',hl:()=>`[data-ab="${tutFields()?tutFields().uid:0}:0"],[data-pick="${G.tut.keep}"],${siteSel(tutFields())}`,allow:()=>[`[data-ab="${tutFields()?tutFields().uid:0}:0"]`,`[data-pick="${G.tut.keep}"]`,siteSel(tutFields()),'#prompt button'],done:()=>{const f=tutFields();return f&&f.usedTurn===G.turnCount}},
  {title:'Out of Mana!',text:'You’re out of Mana and every site that can act has acted, so your turn is done. Click <b>End turn</b>.',...END_TURN,done:()=>G.turn===1},
  {title:'Opponent’s turn',text:'Your opponent is taking its turn…',wait:true,done:()=>G.turn===0&&G.turnCount>=5&&!UI.busy},
  {title:'What your opponent did',text:'Your opponent relocated 2 Zealots onto its Chapel, used the Chapel to add a Zealot to its Warpland, and built an <b>Altar</b>.<br><br>Then it played <b>Witch’s Rot</b> on your Warpland. Witch’s Rot is an <b>attachment</b>: a card that sticks to a site and keeps working turn after turn. This one kills 1 Zealot on your Warpland at the start of each of your turns (it already took one) until the site is empty.',hl:'#meZone .chip.bad',cont:true},
  {title:'Event cards',text:'<b>Events</b> are one-time effects: you pay their Mana, the effect happens right away, and the card goes to the discard pile. They are a fast way to deal damage, gain Zealots or disrupt your opponent.',hl:()=>`[data-play="${G.tut.spark}"]`,cont:true},
  {title:'Play Spark',text:'Play <b>Spark</b> (1 Mana) and send its 2 damage at your opponent’s <b>Chapel</b>.',hl:()=>`[data-play="${G.tut.spark}"],${oppChapelSel()}`,allow:()=>[`[data-play="${G.tut.spark}"]`,oppChapelSel(),'#prompt button'],done:()=>!tutMe().hand.some(k=>k.uid===G.tut.spark)},
  {title:'Upgrading',text:'<b>Upgrading</b> raises your level and unlocks the next draw stack. It costs <b>2 Mana</b> from Hamlet to Township, <b>3</b> from Township to City, and <b>4</b> from City to Empire. Higher levels bring far stronger cards.<br><br>With normally 3 Mana per turn, you’ll need to find a source of extra Mana to upgrade from City to Empire… but it’s worth the effort!',hl:'[data-act="upgrade"]',cont:true},
  {title:'Upgrade to Township',text:'Spend your last <b>2 Mana</b>: click <b>Upgrade to Township</b>.',hl:'[data-act="upgrade"]',allow:['[data-act="upgrade"]'],done:()=>tutMe().level>=2},
  {title:'Your Power Grows',text:'Congratulations on reaching <b>Township</b>! When spending 1 Mana to draw cards, you’ll now be able to draw from the Township deck or the Hamlet deck. It’s up to you! Generally, higher level decks contain more powerful cards, but each deck has its own unique flavor. Sometimes, it can be strategic to draw from a lower level deck.',hl:'.rail .stacks',cont:true},
  {title:'Your Power Grows',text:'Congratulations on reaching <b>Township</b>! When drawing cards, you’ll now be able to draw from the <b>Township</b> deck or the <b>Hamlet</b> deck. It’s up to you! Generally, higher level decks contain more powerful cards, but each deck has its own unique flavor. Sometimes, it can be strategic to draw from a lower level deck.',hl:'.rail .stacks',cont:true},
  {title:'Tutorial over',text:'That’s everything you need to know. Hover any site to read its full card. Now finish the game against this easy opponent. Good luck!',cont:true,last:true}
];
const tutStep=()=>G&&G.tut&&!G.tut.free?TUT_STEPS[G.tut.step]:null;
const val=(x)=>typeof x==='function'?x():x;
function tutTick(){
  const coach=$('coach');if(!coach)return;
  const st=tutStep();
  if(!st||G.over||UI.menu){coach.hidden=true;return}
  if(st.done&&st.done()){G.tut.step++;return tutTick()}
  coach.hidden=false;
  const dw=$('dockwrap');coach.style.bottom=((dw?dw.offsetHeight:200)+14)+'px';
  const shown=TUT_STEPS.filter(x=>!x.wait),n=shown.indexOf(st);
  coach.innerHTML=term(`<div class="coach-n">${st.wait?'Tutorial':`Tutorial · step ${n+1} of ${shown.length}`}</div><h3>${st.title}</h3><p>${term(st.text).replace(/(^|>)([^<]+)/g,(m,g,t)=>g+uiIcons(t))}</p>
    ${st.cont?`<div class="coach-btns"><button class="btn primary" data-tut="next">${st.last?'Keep playing':'Continue'}</button></div>`:''}
    ${st.relocExact&&UI.relocate?`<p class="coach-warn">${tutRelocOK()?'That’s it: confirm.':'Move exactly 3 Zealots from Warpland onto Trebuchet.'}</p>`:''}`);
  document.querySelectorAll('.tut-hl').forEach(e=>e.classList.remove('tut-hl'));
  if(st.hl) document.querySelectorAll(val(st.hl)).forEach(e=>e.classList.add('tut-hl'));
}
function tutAdvance(){const st=tutStep();if(!st)return;if(st.last){G.tut.free=true}else G.tut.step++;render()}
/* While a step is waiting for a specific action, only that action's controls respond */
function tutAllows(t){
  const st=tutStep();if(!st)return true;
  if(t.closest('#coach,#soundBtn,#menuBtn,[data-discard],#discardView'))return true;
  if(UI.menu&&t.closest('#overlay'))return true;
  const allow=st.allow?val(st.allow):[];
  return allow.some(sel=>t.closest(sel));
}

/* ================= TERMINOLOGY =================
   The rules engine speaks of followers, actions and integrity; everything shown on screen
   is passed through term() so the game reads in Warplands terms. */
const LEVEL_NAME={1:'Hamlet',2:'Township',3:'City',4:'Empire'};
const LEVEL_BY_ROMAN={I:1,II:2,III:3,IV:4};
function term(x){
  return String(x)
    .replace(/\bLEVEL (IV|III|II|I)\b/g,(m,r)=>LEVEL_NAME[LEVEL_BY_ROMAN[r]].toUpperCase()).replace(/\bLevel (IV|III|II|I)\b/g,(m,r)=>LEVEL_NAME[LEVEL_BY_ROMAN[r]])
    .replace(/\bFollowers\b/g,'Zealots').replace(/\bFollower\b/g,'Zealot')
    .replace(/\bfollowers\b/g,'Zealots').replace(/\bfollower\b/g,'Zealot')
    .replace(/\b(\d+) fewer action\b/g,'$1 less Mana').replace(/\bfewer actions?\b/g,'less Mana')
    .replace(/\ban action\b/g,'1 Mana').replace(/\bno actions\b/g,'no Mana')
    .replace(/\bActions\b/g,'Mana').replace(/\bactions\b/g,'Mana').replace(/\baction\b/g,'Mana')
    .replace(/\bIntegrity\b/g,'HP').replace(/\bintegrity\b/g,'HP');
}
/* ================= RENDERING ================= */
const ICONS={
  site:'<svg viewBox="0 0 16 16"><path d="M8 1.5 1 7.5h2v7h4v-4h2v4h4v-7h2z"/></svg>',
  event:'<svg viewBox="0 0 16 16"><path d="M8 1l2.1 4.6 5 .5-3.8 3.4 1.1 5L8 12l-4.4 2.5 1.1-5L.9 6.1l5-.5z"/></svg>',
  reaction:'<svg viewBox="0 0 16 16"><path d="M2 5h9V2l4 4.5L11 11V8H2zM14 11H5V8l-4 4.5L5 17v-3h9z" transform="translate(0,-1)"/></svg>',
  attachment:'<svg viewBox="0 0 16 16"><circle cx="5.2" cy="8" r="3.7"/><circle cx="10.8" cy="8" r="3.7" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>'
};
const TYPE_NAME={site:'Site',event:'Event',reaction:'Reaction',attachment:'Attachment'};
const SET_NAME={core:'Core',exp:'Expansion'};
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const $=id=>document.getElementById(id);
const viewer=()=>G.mode==='ai'?0:G.mode==='online'?(ONLINE.seat??0):G.turn;
const humanTurn=()=>G&&!G.over&&!G.players[G.turn].ai&&G.turn===viewer();

function handSummary(p){const n={};for(const k of p.hand)n[k.def.level]=(n[k.def.level]||0)+1;return [1,2,3,4].filter(l=>n[l]).map(l=>`${n[l]} Level ${ROMAN[l]}`).join(', ')||'No cards'}
function reqHTML(ab,site){
  /* only what the ability actually needs: no Zealot disc for 0 Zealots, no diamond for 0 Mana */
  const n=site?effNeed(site,ab):ab.need;
  const parts=(ab.infinite?'<span class="rq inf" title="Works on any turn">∞</span>':'')
    +(n>0?`<span class="rq f" title="Followers needed on this site${n<ab.need?' (lowered by Academy)':''}">${n}</span>`:'')
    +(ab.actions?`<span class="rq a" title="Mana to spend"><b>${ab.actions}</b></span>`:'');
  return parts?`<span class="req">${parts}</span>`:'';
}
const eraCls=d=>d.start?'era-h':'era-'+d.level;
const artHTML=d=>ART[d.id]?`<div class="art" aria-hidden="true"><svg viewBox="0 0 160 84" preserveAspectRatio="xMidYMid slice">${ART[d.id]}</svg></div>`:'';
function bandHTML(d){
  const cost=d.start||d.type==='reaction'?'':`<span class="hcost" title="Costs ${d.cost} Mana">${MN(d.cost)}</span>`;
  return `<div class="band"><span class="nm">${esc(d.name)}</span><span class="ty" title="${TYPE_NAME[d.type]}">${ICONS[d.type]}</span>${cost}</div>`;
}
/* The card type is shown by the icon in the header; no separate type line */
function kindHTML(d){return ''}
/* Card and ability text with the words Zealot(s) and Mana replaced by their icons */
const IC_Z='<span class="ic z" role="img" aria-label="Zealot"></span>', IC_M='<span class="ic mn bare" role="img" aria-label="Mana"></span>', IC_C='<span class="ic c" role="img" aria-label="card"></span>';
const ZN=n=>`<span class="ic zn" role="img" aria-label="${n} Zealot${n==1?'':'s'}">${n}</span>`;
const DN=(n,st)=>`<span class="ic dn${st?' st':''}${n?'':' bare'}" role="img" aria-label="${n?n+' ':''}${st?'structural ':''}damage">${n?`<b>${n}</b>`:''}</span>`;
const MN=n=>`<span class="ic mn" role="img" aria-label="${n} Mana"><b>${n}</b></span>`;
/* Interface text (log, prompts): "3 Mana" -> numbered diamond, lone "Mana" -> plain diamond. Input must be escaped plain text. */
const uiIcons=t=>t.replace(/\b(\d+) Mana\b/g,'\u0006$1\u0006').replace(/\bMana\b/g,'\u0007').replace(/\u0006(\d+)\u0006/g,(m,n)=>MN(n)).replace(/\u0007/g,IC_M);
function cardText(t){
  /* swap words for placeholder marks first, then marks for icons, so no icon is matched twice */
  return esc(t)
    .replace(/\ban action\b/g,'1 \u0002').replace(/\bno actions\b/g,'no \u0002')
    .replace(/\b(\d+) fewer actions?\b/g,'$1 less \u0002').replace(/\bfewer actions?\b/g,'less \u0002')
    .replace(/\b[Aa]ctions?\b/g,'\u0002').replace(/\bMana\b/g,'\u0002')
    .replace(/\b([Dd]raw) (?:a|1) card\b/g,'$1 \u0003').replace(/\b([Dd]raw) (a total of )?(\d+) cards?\b/g,'$1 $2$3 \u0003').replace(/\b([Dd]raw) cards\b/g,'$1 \u0003')
    .replace(/\b(\d+) structural damage\b/g,'\u0005$1\u0005').replace(/\b[Ss]tructural damage\b/g,'\u0005\u0005')
    .replace(/\b(\d+) damage\b/g,'\u0004$1\u0004').replace(/\bdamage\b/g,'\u0004\u0004')
    .replace(/\b[Ff]ollowers?\b/g,'\u0001').replace(/\bZealots?\b/g,'\u0001')
    /* a count right before a Zealot or Mana icon goes inside it: "1 Mana" -> a black diamond with 1 in it */
    .replace(/\b(\d+|a) \u0001/g,(m,n)=>ZN(n==='a'?1:n)).replace(/\b(\d+) \u0002/g,(m,n)=>MN(n))
    .replace(/\u0001/g,IC_Z).replace(/\u0002/g,IC_M).replace(/\u0003/g,IC_C)
    .replace(/\u0004(\d*)\u0004/g,(m,n)=>DN(n,false)).replace(/\u0005(\d*)\u0005/g,(m,n)=>DN(n,true));
}
function abListHTML(d){return (d.abilities||[]).map(ab=>`<div class="ab ${ab.passive?'passive':''}">${reqHTML(ab)}<span>${cardText(ab.text)}${ab.passive?'<span class="auto">Automatic</span>':''}</span></div>`).join('')}
function handCardHTML(card,pi){
  const d=card.def;
  const pick=UI.prompt&&UI.prompt.kind==='hand'&&UI.prompt.pi===pi&&UI.prompt.set.has(card.uid);
  const ok=!pick&&humanTurn()&&!UI.busy&&!UI.prompt&&canPlay(pi,card);
  let body;
  if(d.type==='site'){
    /* a site in hand is drawn exactly like it will look on the board: same text, ability rows, Zealot disc and HP square */
    const tx=(d.text||'').replace(/^\s*Fortified\.\s*/,'');
    const abs=(d.abilities||[]).map(ab=>`<div class="ab mini${ab.passive?' passive':''}" title="${esc(ab.text)}">${reqHTML(ab)}<span class="abt">${cardText(ab.text)}</span></div>`).join('');
    body=`<div class="body">${tx?`<div class="tx">${cardText(tx)}</div>`:''}${abs?`<div class="abs">${abs}</div>`:''}</div><div class="foot">${zcHTML(0,!!d.fortified)}<div class="attl"></div>${hpHTML(d.integrity||3,d.integrity||3)}</div>`;
  }
  else body=`<div class="body"><div class="tx">${cardText(d.text)}</div></div>`;
  const title=pick?'Choose '+d.name:ok?'Play '+d.name:d.type==='reaction'?'Reactions are offered to you automatically when their condition happens':!hasEffect(pi,card)?'No valid target right now':'Not enough actions';
  return `<button class="card ${d.type==='site'?'site mini ':''}${eraCls(d)} ${ok?'playable':''} ${pick?'target':''}" ${pick?`data-pick="${card.uid}"`:`data-play="${card.uid}"`} ${ok||pick?'':'aria-disabled="true"'} title="${esc(title)}">${bandHTML(d)}${kindHTML(d)}${artHTML(d)}${body}</button>`;
}
function siteHTML(s,vi,full){
  if(!full) return siteMini(s,vi);
  const d=s.card.def, mine=false;
  const target=false;
  const live=false;
  const abs=(d.abilities||[]).map((ab,i)=>{
    if(ab.passive) return `<div class="ab passive">${reqHTML(ab,s)}<span>${cardText(ab.text)}<span class="auto">Automatic</span></span></div>`;
    const ready=live&&abilityReady(s.owner,s,i);
    return mine&&!target?`<button class="ab" data-ab="${s.uid}:${i}" ${ready?'':'disabled'}>${reqHTML(ab,s)}<span>${cardText(ab.text)}</span></button>`
               :`<div class="ab">${reqHTML(ab,s)}<span>${cardText(ab.text)}</span></div>`;
  }).join('');
    const shownDmg=Math.max(0,s.damage-(PEND.get(s.uid)||0));
  const used=s.usedTurn===G.turnCount&&G.turn===s.owner&&(d.abilities||[]).length;
  return `<div class="card site ${eraCls(d)}">
    ${bandHTML(d)}${artHTML(d)}${kindHTML(d)}
    <div class="body">
    ${d.text&&d.text.replace(/^\s*Fortified\.\s*/,'')?`<div class="tx">${cardText(d.text.replace(/^\s*Fortified\.\s*/,''))}</div>`:''}
    ${abs?`<div class="abs">${abs}</div>`:''}
    
    </div>
    <div class="foot">${zcHTML(shownZ(s),isFort(s))}${footIcons(s)}
    ${hpHTML(integ(s)-shownDmg,integ(s))}</div>
  </div>`;
}
/* Compact site for the board: name, art strip, ability buttons, Zealots and damage.
   Hovering it shows the full card (see showZoom). */
function siteMini(s,vi){
  const d=s.card.def, mine=s.owner===vi&&!G.players[s.owner].ai;
  const target=UI.prompt&&UI.prompt.kind==='site'&&UI.prompt.set.has(s.uid)&&!G.players[UI.prompt.pi].ai;
  const live=mine&&humanTurn()&&!UI.busy&&!UI.prompt;
  const used=s.usedTurn===G.turnCount&&G.turn===s.owner&&(d.abilities||[]).length;
  const abs=(d.abilities||[]).map((ab,i)=>{
    const t=esc(ab.text),ti=cardText(ab.text);
    if(ab.passive) return `<div class="ab mini passive" title="${t}">${reqHTML(ab,s)}<span class="abt">${ti}</span></div>`;
    const ready=live&&abilityReady(s.owner,s,i);
    return mine&&!target?`<button class="ab mini" data-ab="${s.uid}:${i}" ${ready?'':'disabled'} title="${t}">${reqHTML(ab,s)}<span class="abt">${ti}</span></button>`
               :`<div class="ab mini" title="${t}">${reqHTML(ab,s)}<span class="abt">${ti}</span></div>`;
  }).join('');
    const shownDmg=Math.max(0,s.damage-(PEND.get(s.uid)||0));
  /* the wall ring on the Zealot disc already says 'Fortified', so drop that sentence from the text */
  const miniTx=(d.text||'').replace(/^\s*Fortified\.\s*/,'');
  const chips='';
  return `<div class="card site mini ${eraCls(d)} ${target?'target':''}" data-suid="${s.uid}" ${target?`data-site="${s.uid}" tabindex="0" role="button" aria-label="Choose ${esc(d.name)}"`:''}>
    ${bandHTML(d)}${artHTML(d)}
    <div class="body">${miniTx?`<div class="tx">${cardText(miniTx)}</div>`:''}${abs?`<div class="abs">${abs}</div>`:''}${chips?`<div class="chips">${chips}</div>`:''}</div>
    <div class="foot">${zcHTML(shownZ(s),isFort(s))}${footIcons(s)}
    ${hpHTML(integ(s)-shownDmg,integ(s))}</div>
  </div>`;
}
/* Hover preview of the full site card */
/* Twinkling stars around the hover preview, so it can't be mistaken for another card on the board */
const TWINKLES=[[0,8],[0,55],[18,100],[62,100],[100,30],[100,82],[40,0],[85,0],[0,92],[100,4]].map(([x,y],i)=>`<i class="tw" style="left:${x}%;top:${y}%;animation-delay:${(i*0.23)%1.4}s"></i>`).join('');
function showZoom(el){
  const z=$('zoom');if(!z||!G)return;
  const uid=+el.dataset.suid,st=allSites().find(x=>x.uid===uid);if(!st){z.hidden=true;return}
  z.innerHTML=term(siteHTML(st,viewer(),true))+TWINKLES;
  /* the preview matches the board card exactly: same width, height and scale (never smaller) */
  {const c=z.firstElementChild,k=rowZoom(el);if(c){const r=el.getBoundingClientRect();c.style.zoom=k;c.style.width=(r.width/k)+'px';c.style.minHeight=(r.height/k)+'px';c.style.maxWidth='none'}}
  z.hidden=false;
  const r=el.getBoundingClientRect(),w=z.offsetWidth,h=z.offsetHeight;
  let x=r.right+12;if(x+w>innerWidth-8)x=r.left-w-12;if(x<8)x=8;
  let y=r.top;if(y+h>innerHeight-8)y=innerHeight-h-8;if(y<8)y=8;
  z.style.left=x+'px';z.style.top=y+'px';
}
function zoneHTML(pi,bottom){
  const p=G.players[pi], active=G.turn===pi&&!G.over, vi=viewer();
  const showHand=bottom&&!p.ai&&!(G.mode==='hot'&&UI.curtain);
  const lofNow=p.lofTurn===G.turnCount, lofNext=p.lof>0;
  let h=`<div class="zhead"><span class="pname">${esc(p.name)}</span>${G.mode==='online'&&!ONLINE.conn[pi]?'<span class="stat warn">Disconnected</span>':''}
    <span class="lvl era-${p.level}">LEVEL ${ROMAN[p.level]}</span>
    <span class="stat"><span class="dot"></span><b>${totalF(p)}</b> followers</span>
    <span class="stat">${showHand?'':`<span class="backs" title="${esc(handSummary(p))}">${[...p.hand].sort((a,b)=>a.def.level-b.def.level).map(k=>`<span class="back era-${k.def.level}" data-buid="${k.uid}">${ROMAN[k.def.level]}</span>`).join('')}</span>`}<b>${p.hand.length}</b> in hand</span>
    ${!bottom&&active?`<span class="stat oppmana" title="${p.actions} action${p.actions===1?'':'s'} left this turn"><span class="pips">${Array.from({length:Math.max(3,p.actions)},(_,i)=>`<span class="pip ${i<p.actions?'on':''}"></span>`).join('')}</span>${MN(p.actions)} left</span>`:''}
    ${lofNext?'<span class="stat warn">Interdict next turn: 1 fewer action</span>':''}
    ${active&&p.ai?'<span class="stat">Thinking…</span>':''}</div>`;
  const SP=UI.prompt&&UI.prompt.kind==='slot'&&UI.prompt.pi===pi&&pi===vi?UI.prompt:null;
  const slotBtn=i=>{const d=DEF[SP.def]||{name:'site',level:1};return `<button class="slot ${eraCls(d)}" data-slot="${i}" title="${esc(slotLabel(p.sites,i))}" aria-label="Place ${esc(d.name)}: ${esc(slotLabel(p.sites,i))}"><span class="slot-plus" aria-hidden="true">+</span><span class="slot-nm">${esc(d.name)}</span></button>`};
  const sites=SP?p.sites.map((s,i)=>slotBtn(i)+siteHTML(s,vi)).join('')+slotBtn(p.sites.length)
                :(p.sites.map(s=>siteHTML(s,vi)).join('')||'<div class="empty">No sites.</div>');
  const sitesRow=`<div class="label">Sites</div><div class="row">${sites}</div>`;
  return h+sitesRow;
}
/* The hand dock pinned to the bottom of the screen: action buttons and your hand, fanned */
function dockHTML(pi){
  const p=G.players[pi];
  let ctl='';
  if(humanTurn()&&G.turn===pi){
    const free=!UI.busy&&!UI.prompt, uc=UPGRADE_COST[p.level];
    const pips=Array.from({length:Math.max(3,p.actions)},(_,i)=>`<span class="pip ${i<p.actions?'on':''}"></span>`).join('');
    ctl=`<div class="controls"><span class="pips" title="${p.actions} actions left">${pips}</span>
      <button class="btn" data-act="gain" ${free&&p.actions>=1&&p.sites.some(canGain)?'':'disabled'}>Gain follower<span class="c">${MN(1)}</span></button>
      <button class="btn" data-act="relocate" ${free&&p.actions>=1&&p.sites.length>1?'':'disabled'}>Relocate<span class="c">${MN(1)}</span></button>
      <button class="btn" data-act="upgrade" ${free&&uc&&p.actions>=uc?'':'disabled'}>${uc?`Upgrade to Level ${ROMAN[p.level+1]}<span class="c">${MN(uc)}</span>`:'Max level'}</button>
      <button class="btn primary ${p.actions===0?'nudge':''}" data-act="end" ${free?'':'disabled'}>End turn</button></div>`;
  } else if(!G.over){
    ctl=`<div class="controls"><span class="stat">Waiting for ${esc(G.players[G.turn].name)}…</span></div>`;
  }
  const hand=p.hand.map(c=>handCardHTML(c,pi)).join('')||'<div class="empty">Your hand is empty.</div>';
  return `<div class="dock-bar">${ctl}</div><div class="hand">${hand}</div>`;
}
function midHTML(){
  const vi=viewer(), me=G.players[vi], canDraw=humanTurn()&&!UI.busy&&!UI.prompt&&me.actions>=1;
  const stacks=[1,2,3,4].map(l=>{
    const n=G.stacks[l].length, ok=canDraw&&l<=me.level&&n>0;
    const mk=G.players.filter(p=>p.level===l).map(p=>`<span class="mk">${esc(p.name)}</span>`).join('');
    return `<button class="stack era-${l} ${n?'':'out'}" data-draw="${l}" ${ok?'':'disabled'} aria-label="Level ${ROMAN[l]} stack, ${n} cards">
      <span class="rn">${ROMAN[l]}</span><span class="cnt"><b>${LEVEL_NAME[l]}</b></span><span class="cnt">${n} card${n===1?'':'s'}</span>
      <span class="hint">${n===0?'Empty':l>me.level?'Locked':ok?`Draw ${MN(1)}`:'&nbsp;'}</span><span class="markers">${mk}</span></button>`;
  }).join('');
  const last=G.discard[G.discard.length-1];
  const empty=[1,2,3,4].filter(l=>!G.stacks[l].length).length;
  return `<div class="stacks">${stacks}</div><div class="sideinfo">
    <button class="discard" data-discard="1" title="Search the discard pile">Discard: <b>${G.discard.length}</b>${last?` · top: ${esc(last.def.name)}`:''}<span class="dv">View</span></button>
    <div class="ends">Empty stacks: <b>${empty}</b>/3 to end</div></div>
    <ul class="log">${G.log.slice(0,40).map(l=>`<li>${uiIcons(esc(term(l)))}</li>`).join('')}</ul>`;
}
/* The discard pile, in the order cards were discarded (oldest first). Anyone can open it at any time. */
function syncDiscard(){
  let el=$('discardView');
  if(!el){el=document.createElement('div');el.id='discardView';el.className='dview';el.hidden=true;document.body.appendChild(el)}
  const open=!!(UI.dview&&G);el.hidden=!open;if(!open){const z=$('zoom');if(z&&z.classList.contains('over-dialog')){z.hidden=true;z.classList.remove('over-dialog')}}if(open)el.innerHTML=term(discardViewHTML());
}
function discardViewHTML(){
  const n=G.discard.length;
  const rows=G.discard.map((k,i)=>{const d=k.def;return `<li class="${eraCls(d)}" data-dcard="${i}"><span class="no">${i+1}</span><span class="sw"></span><span class="dn">${esc(d.name)}</span><span class="dt">${ICONS[d.type]||''}${LEVEL_NAME[d.level]} ${TYPE_NAME[d.type].toLowerCase()}</span></li>`}).join('');
  return `<div class="dv-box" role="dialog" aria-label="Discard pile"><div class="dv-head"><b>Discard pile</b><span>${n} card${n===1?'':'s'} · oldest first</span><button class="dv-x" data-dclose="1" aria-label="Close">✕</button></div>
    ${n?`<ol class="dv-list">${rows}</ol>`:'<p class="dv-empty">Nothing has been discarded yet.</p>'}</div>`;
}
function promptHTML(){
  const p=UI.prompt;
  let opts='';
  if(p.kind==='opts') opts=p.options.map((o,i)=>`<button data-opt="${i}" class="${i?'sec':''}">${esc(o.label)}</button>`).join('');
  if(p.kind==='site') opts=(p.extra||[]).map((o,i)=>`<button data-extra="${i}">${esc(o.label)}</button>`).join('');
  const hint=p.kind==='site'?' Click a highlighted site.':p.kind==='hand'?' Click a highlighted card in your hand.':p.kind==='slot'?' Click a glowing gap in your row.':'';
  return `<div class="in"><p>${uiIcons(esc(term(p.text)))}${hint}</p><div class="opts">${opts}${p.cancellable?`<button class="sec" data-cancel="1">${esc(p.cancelLabel||'Cancel')}</button>`:''}</div></div>`;
}
function relocateHTML(){
  const r=UI.relocate, p=G.players[r.pi];
  const rows=p.sites.map(s=>{
    const need=minNeed(s);
    return `<div class="rl"><div class="nm"><b>${esc(s.card.def.name)}</b><small>${need?`Ability needs ${need}`:'No follower requirement'} · damage ${s.damage}/${integ(s)}${isFort(s)?' · fortified':''}${canGain(s)?'':' · Death Mark: no followers can move here'}${canLeave(s)?'':' · Quarantine: followers cannot leave'}</small></div>
      <button data-rl="-${s.uid}" ${rlCan(r,s.uid,-1)?'':'disabled'} aria-label="Take a follower from ${esc(s.card.def.name)}">−</button><span class="n">${r.counts[s.uid]}</span>
      <button data-rl="+${s.uid}" ${rlCan(r,s.uid,1)?'':'disabled'} aria-label="Add a follower to ${esc(s.card.def.name)}">+</button></div>`}).join('');
  const changed=p.sites.some(s=>r.orig[s.uid]!==r.counts[s.uid]);
  const ok=r.pool===0&&(r.mode==='threat'?r.counts[r.src]===0:r.mode==='place'?true:changed);
  return `<div class="panel" role="dialog" aria-label="${esc(r.title)}"><h2>${esc(r.title)}</h2>
    <p>${r.mode==='place'?'Place each follower with +.':'Take followers with − and place them with +.'} ${esc(r.cost)}.</p>
    <div class="pool"><span class="dot"></span> In hand to place: ${r.pool}</div>
    <div class="reloc">${rows}</div>
    <div class="choices"><button class="btn primary" data-rlok="1" ${ok?'':'disabled'}>Confirm</button>${r.forced?'':'<button class="btn" data-rlx="1">Cancel</button>'}</div></div>`;
}
function setPicker(){
  const o=[['core','Core Set'],['exp','Expansion Set'],['mix','Level-by-level mix'],['random','Totally mixed']];
  return `<div class="seg" role="group" aria-label="Card set"><span class="label">Card set</span>${o.map(([v,l])=>`<button data-set="${v}" aria-pressed="${UI.set===v}">${l}</button>`).join('')}</div>`;
}
function menuHTML(){return term(menuHTML0()).replace(/>([^<]+)</g,(m,t)=>'>'+uiIcons(t)+'<')}
function menuHTML0(){
  return `<div class="panel"><div class="eras"><span style="background:var(--era1)"></span><span style="background:var(--era2)"></span><span style="background:var(--era3)"></span><span style="background:var(--era4)"></span></div>
    <h1><span class="holo">Warplands</span></h1>
    <p>Lead your followers from a humble hamlet to a sprawling empire. Wipe out your opponent's followers, or hold more of them when three draw stacks run dry.</p>
    <p class="fine">Each game deals a fresh random draw stack for every level: 20 Level I cards, 15 Level II, 10 Level III and 5 Level IV.</p>
    <div class="choices"><button class="btn primary" data-new="ai">Play the computer</button><button class="btn" data-new="tutorial">Tutorial</button>${G&&!G.over?'<button class="btn" data-resume="1">Resume game</button>':''}</div>
    ${onlineMenuHTML()}
    <details><summary>How to play</summary><ul>
      <li>Each turn you get 3 actions (the first player gets 2 on turn one).</li>
      <li><b>Draw</b> from any stack at or below your level · 1 action.</li>
      <li><b>Gain a follower</b> on one of your sites · 1 action.</li>
      <li><b>Relocate</b> any followers between your sites · 1 action.</li>
      <li><b>Play a card</b> for the cost shown on it. <b>Upgrade</b> costs 2, 3, then 4 actions.</li>
      <li>Site abilities show how many followers the site needs (${ZN(2)}) and how much Mana they cost (${MN(1)}). Each site can use one ability per turn.</li>
      <li>Abilities marked ∞ work on any turn. The ones marked Automatic fire by themselves when their condition happens.</li>
      <li>Damage kills followers on a site. A site is destroyed when damage reaches its integrity, and everyone on it dies. Structural damage and fortified sites don't kill followers unless the site is destroyed.</li>
      <li>Reactions are offered to you automatically when their condition happens.</li>
    </ul></details>
    <p class="fine disclaimer">Unofficial fan implementation for personal play. Time Barons is designed by Jon Perry and Derek Yu.</p>
    </div>`;
}
function overHTML(){
  const o=G.over, w=o.winner, name=w===-1?null:G.players[w].name;
  const title=w===-1?'Draw':G.mode==='online'?(w===ONLINE.seat?'You win':`${name} wins`):name==='You'?'You win':G.mode==='ai'?'Your opponent wins':`${name} wins`;
  return `<div class="panel"><div class="eras"><span style="background:var(--era1)"></span><span style="background:var(--era2)"></span><span style="background:var(--era3)"></span><span style="background:var(--era4)"></span></div>
    <h1>${esc(title)}</h1><p><b style="color:var(--fg)">${esc(o.type)}.</b> ${esc(o.reason)}</p>
    <div class="choices">${G.mode==='online'?'<button class="btn primary" data-online="rematch">Rematch</button><button class="btn" data-leave="1">Leave online game</button>':`<button class="btn primary" data-new="${G.mode}">Play again</button><button class="btn" data-menu="1">Main menu</button>`}<button class="btn" data-close="1">View the board</button></div></div>`;
}
function curtainHTML(){
  const p=G.players[G.turn];
  return `<div class="panel"><h2>${esc(p.name)}'s turn</h2><p>Pass the device to ${esc(p.name)}. Your hand stays hidden until you start.</p>
    <div class="choices"><button class="btn primary" data-curtain="1">Start turn</button></div></div>`;
}

function render(){
  if(HOST.server){if(!(G&&G.sim)&&HOST.broadcast)HOST.broadcast();return}
  if(!HAS_DOM||(G&&G.sim)) return;
  const oldRects=G&&!G.sim?snapRects():null;
  if(oldRects&&ARROWS.q.length&&!(typeof matchMedia==='function'&&matchMedia('(prefers-reduced-motion: reduce)').matches)){
    for(const d of ARROWS.q){if(d.pend)continue;d.pend=true;PEND.set(d.t,(PEND.get(d.t)||0)+d.n);if(d.k)PENDZ.set(d.t,(PENDZ.get(d.t)||0)+d.k);
      if(!oldRects['html'+d.t]){const e=document.querySelector(`[data-suid="${d.t}"]`);if(e){oldRects['html'+d.t]=e.outerHTML;oldRects['z'+d.t]=rowZoom(e)}}}
  }
  const ov=$('overlay');
  const inLobby=ONLINE.active&&ONLINE.lobby&&(!G||G.mode!=='online');
  if(!G||inLobby){const dk=$('handDock');if(dk)dk.hidden=true;ov.hidden=false;ov.innerHTML=term(UI.menu||!inLobby?menuHTML():lobbyHTML());if(!G){$('turnline').innerHTML='';return}}
  const vi=viewer(), cur=G.players[G.turn];
  const net=G.mode==='online'?` · Room ${esc(ONLINE.code||'')}${ONLINE.status&&ONLINE.status!=='Connected'?' · '+esc(ONLINE.status):''}`:'';
  const waitP=G.mode==='online'&&G.waiting!=null&&G.waiting!==ONLINE.seat?G.players[G.waiting]:null;
  $('turnline').innerHTML=term((G.over?'Game over':waitP?`Waiting for <b>${esc(waitP.name)}</b> to decide…`:`<b>${esc(cur.name)}</b> ${isYou(cur)?'are':'is'} taking a turn · ${MN(cur.actions)} left`)+(G.turnStart!=null?' · '+clockHTML():'')+net);
  if(inLobby) return;
  $('oppZone').innerHTML=term(zoneHTML(1-vi,false));
  $('oppZone').classList.toggle('active',G.turn===1-vi&&!G.over);
  {const om=G.turn===1-vi?G.players[1-vi].actions:null;const el=document.querySelector('#oppZone .oppmana');
   if(el&&FLY.oppMana!=null&&om!=null&&om!==FLY.oppMana&&G.turnCount===FLY.oppManaTurn)el.animate([{transform:'scale(1)',filter:'brightness(1)'},{transform:'scale(1.18)',filter:'brightness(1.8)'},{transform:'scale(1)',filter:'brightness(1)'}],{duration:450,easing:'ease-out'});
   FLY.oppMana=om;FLY.oppManaTurn=G.turnCount}
  $('mid').innerHTML=term(midHTML());
  $('meZone').innerHTML=term(zoneHTML(vi,true));
  const dock=$('handDock'),me=G.players[vi];
  if(dock){dock.hidden=!!me.ai;if(!me.ai)dock.innerHTML=term(dockHTML(vi))}
  $('meZone').classList.toggle('active',G.turn===vi&&!G.over);
  const pr=$('prompt');
  const showPrompt=UI.prompt&&!G.players[UI.prompt.pi].ai;
  pr.hidden=!showPrompt; if(showPrompt) pr.innerHTML=term(promptHTML());
  let o='';
  if(UI.menu) o=menuHTML();
  else if(UI.relocate) o=relocateHTML();
  else if(G.mode==='hot'&&UI.curtain&&!G.over&&!showPrompt) o=curtainHTML();
  else if(G.over&&!UI.closedOver) o=overHTML();
  ov.hidden=!o; ov.innerHTML=term(o);
  syncDiscard();
  /* no board hover preview while choosing a card from your hand: it would cover the prompt */
  if(UI.prompt&&UI.prompt.kind==='hand'){const z=$('zoom');if(z)z.hidden=true}
  equalizeCards();
  drawAnims();
  if(oldRects){if(REV.q.length)playReveals(oldRects);followerAnims(oldRects);placeAnims(oldRects);if(ARROWS.q.length)playArrows(oldRects);holdShifts(oldRects)}
  else holdShifts(null);
  if(UPS.q.length) playUps();
  yourTurnCheck();
  tutTick();
  equalizeCards();
}

/* ---- Damage animation: a projectile arcs from the source (a site, the played card, or the
   player) to the damaged site. Red for damage, orange for structural damage. ---- */
function snapRects(){
  const m={};
  for(const e of document.querySelectorAll('[data-suid]'))m['s'+e.dataset.suid]=e.getBoundingClientRect();
  for(const e of document.querySelectorAll('#handDock [data-play],#handDock [data-pick]'))m['c'+(e.dataset.play||e.dataset.pick)]=e.getBoundingClientRect();
  for(const e of document.querySelectorAll('[data-buid]'))m['c'+e.dataset.buid]=e.getBoundingClientRect();
  for(const e of document.querySelectorAll('[data-suid] .tokens')){const u=e.closest('[data-suid]').dataset.suid;m['t'+u]=e.getBoundingClientRect()}
  for(const z of ['meZone','oppZone']){const h=(z==='meZone'?document.querySelector('#handDock .hand'):null)||document.querySelector(`#${z} .backs`)||document.querySelector(`#${z} .pname`);if(h)m['h'+z]=h.getBoundingClientRect()}
  return m;
}
function zoneRect(pi){const z=document.querySelector(pi===viewer()?'#meZone .pname':'#oppZone .pname');return z?z.getBoundingClientRect():null}
function siteRect(uid,old){const e=document.querySelector(`[data-suid="${uid}"]`);return e?e.getBoundingClientRect():old['s'+uid]||null}
function fxLayer(){
  let svg=document.getElementById('fxsvg');
  if(!svg){svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.id='fxsvg';svg.setAttribute('aria-hidden','true');document.body.appendChild(svg)}
  svg.setAttribute('viewBox',`0 0 ${innerWidth} ${innerHeight}`);svg.setAttribute('width',innerWidth);svg.setAttribute('height',innerHeight);
  return svg;
}
function playArrows(old){
  const list=ARROWS.q.splice(0);
  const reduce=typeof matchMedia==='function'&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  const now=performance.now();let t0=Math.max(now,ARROWS.until);
  for(const d of list){
    const src=d.s.site!=null?siteRect(d.s.site,old):d.s.card!=null?(old['c'+d.s.card]||zoneRect(d.s.pi)):zoneRect(d.s.pi);
    const tgt=siteRect(d.t,old);
    if(reduce||!src||!tgt){if(d.snd)sfx(d.snd);settle(d);continue}
    if(!document.querySelector(`[data-suid="${d.t}"]`)&&old['html'+d.t]&&!GHOSTS.has(d.t)) makeGhost(d.t,old['html'+d.t],tgt,old['z'+d.t]||1);
    const delay=t0-now;
    const dist=Math.hypot(src.left-tgt.left,src.top-tgt.top);
    const dur=Math.min(820,420+dist*0.35);
    t0+=Math.min(260,dur*0.4);
    ARROWS.until=Math.max(ARROWS.until,now+delay+dur);
    setTimeout(()=>flyArrow(d,src,tgt,dur),delay);
    setTimeout(()=>settle(d),delay+dur+1500);
  }
}
/* ---- Reaction reveal: the card leaves its owner's hand, flips face-up in the middle of the screen with a
   caption, then drops onto the discard pile. Damage it affects waits until the card has been seen. ---- */
function playReveals(old){
  const list=REV.q.splice(0);
  const reduce=typeof matchMedia==='function'&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  const now=performance.now();let t0=Math.max(now,REV.until);
  for(const d of list){
    const def=DEF[d.id];if(!def)continue;
    if(d.ev&&d.pi===viewer())continue;
    const quick=d.to!=null&&d.pi===viewer();
    const delay=t0-now,dur=reduce?1600:quick?750:2300;
    REV.until=t0+dur;t0+=dur;
    ARROWS.until=Math.max(ARROWS.until,now+delay+(reduce?1200:1650));
    setTimeout(()=>revealCard(d,def,old,reduce,dur),delay);
  }
}
function revealCard(d,def,old,reduce,dur){
  const p=G&&G.players[d.pi];if(!p)return;
  sfx('reveal');
  const mine=d.pi===viewer();
  const src=old['c'+d.uid]||(document.querySelector(mine?'#handDock .hand':'#oppZone .backs')||document.body).getBoundingClientRect();
  const siteEl=d.to!=null?document.querySelector(`[data-suid="${d.to}"]`):null;
  const tgtSite=d.to!=null?allSites().find(x=>x.uid===d.to):null;
  const disc=(siteEl||document.querySelector('#mid .discard')||document.body).getBoundingClientRect();
  const W=250,H=W*1.45,cx=innerWidth/2,cy=innerHeight*0.42;
  const box={left:cx-W/2,top:cy-H/2};
  const f=document.createElement('div');f.className='flyer reveal';f.setAttribute('aria-hidden','true');
  Object.assign(f.style,{left:box.left+'px',top:box.top+'px',width:W+'px',height:H+'px'});
  const face=`<div class="card ${eraCls(def)}" style="width:100%;height:100%">${bandHTML(def)}${artHTML(def)}${kindHTML(def)}<div class="body"><div class="tx">${cardText(def.text||'')}</div></div></div>`;
  f.innerHTML=term(`<div class="fly-inner"><div class="fly-face fly-back era-${def.level}"><span style="font-size:52px">${ROMAN[def.level]}</span></div><div class="fly-face fly-front">${face}</div></div>
    <div class="reveal-cap">${esc(isYou(p)?'You play':p.name+' plays')} <b>${esc(def.name)}</b>${tgtSite?` on ${esc(poss(G.players[tgtSite.owner]))} ${esc(tgtSite.card.def.name)}`:''}</div>`);
  document.body.appendChild(f);
  const fromX=src.left+src.width/2-cx,fromY=src.top+src.height/2-cy,sc0=Math.max(0.12,Math.min(0.7,src.width/W));
  const toX=disc.left+disc.width/2-cx,toY=disc.top+disc.height/2-cy;
  const endSc=siteEl?Math.max(0.2,disc.width/W*0.8):0.18;
  const land=()=>{const e=d.to!=null&&document.querySelector(`[data-suid="${d.to}"]`);if(e){e.animate([{boxShadow:'0 0 0 0 rgba(255,200,90,0)'},{boxShadow:'0 0 26px 8px rgba(255,190,80,.85)'},{boxShadow:'0 0 0 0 rgba(255,200,90,0)'}],{duration:800,easing:'ease-out'});sparkle(e.getBoundingClientRect())}};
  if(siteEl&&d.pi===viewer()&&!reduce){
    f.querySelector('.reveal-cap').remove();
    f.animate([{transform:`translate(${fromX}px,${fromY}px) scale(${sc0})`,opacity:.6},{transform:`translate(${(fromX+toX)/2}px,${(fromY+toY)/2-60}px) scale(${(sc0+endSc)/2+0.1})`,opacity:1,offset:.5},{transform:`translate(${toX}px,${toY}px) scale(${endSc})`,opacity:.9}],
      {duration:dur,easing:'cubic-bezier(.3,.7,.3,1)',fill:'both'}).onfinish=()=>{f.remove();land()};
    setTimeout(()=>{if(f.isConnected)f.remove()},dur+600);return;
  }
  if(reduce){f.animate([{opacity:0},{opacity:1,offset:.15},{opacity:1,offset:.85},{opacity:0}],{duration:dur,fill:'forwards'}).onfinish=()=>f.remove();return}
  f.animate([
    {transform:`translate(${fromX}px,${fromY}px) scale(${sc0})`,opacity:.3,easing:'cubic-bezier(.2,.8,.3,1)'},
    {transform:'translate(0,0) scale(1.08)',opacity:1,offset:.2,easing:'ease-out'},
    {transform:'translate(0,0) scale(1)',offset:.28,easing:'linear'},
    {transform:'translate(0,0) scale(1)',opacity:1,offset:.76,easing:'cubic-bezier(.5,0,.8,.4)'},
    {transform:`translate(${toX}px,${toY}px) scale(${endSc}) rotate(${siteEl?0:8}deg)`,opacity:siteEl?.9:.25}],{duration:dur,easing:'linear',fill:'both'}).onfinish=()=>{f.remove();if(siteEl)land()};
  f.querySelector('.fly-inner').animate([{transform:mine?'rotateY(0deg)':'rotateY(180deg)'},{transform:mine?'rotateY(0deg)':'rotateY(180deg)',offset:.12,easing:'ease-in-out'},{transform:'rotateY(0deg)',offset:.3},{transform:'rotateY(0deg)'}],{duration:dur,easing:'linear',fill:'both'});
  f.querySelector('.reveal-cap').animate([{opacity:0},{opacity:0,offset:.22},{opacity:1,offset:.32},{opacity:1,offset:.7},{opacity:0,offset:.76},{opacity:0}],{duration:dur,fill:'both'});
  const glow=f.animate([{boxShadow:'0 0 0 0 rgba(255,200,90,0)'},{boxShadow:'0 0 60px 16px rgba(255,190,80,.55)',offset:.32},{boxShadow:'0 0 40px 8px rgba(255,190,80,.35)',offset:.7},{boxShadow:'0 0 0 0 rgba(255,200,90,0)'}],{duration:dur,fill:'both'});
  setTimeout(()=>{if(f.isConnected)f.remove()},dur+600);
}
/* A destroyed site lingers as a copy until the projectile that destroys it lands */
function rowZoom(el){const r=el&&el.closest('.row');return r&&parseFloat(r.style.zoom)||1}
function makeGhost(uid,html,r,z=1){
  const g=document.createElement('div');g.className='ghost-site';g.setAttribute('aria-hidden','true');
  Object.assign(g.style,{left:r.left+'px',top:r.top+'px',width:r.width+'px',height:r.height+'px'});
  g.innerHTML=html;const c=g.firstElementChild;if(c){c.removeAttribute('data-suid');c.removeAttribute('data-site');c.style.visibility='visible';c.style.margin='0';c.style.zoom=z;c.style.width=r.width/z+'px';c.style.height=r.height/z+'px';c.style.maxWidth='none';c.style.minHeight='0'}
  document.body.appendChild(g);GHOSTS.set(uid,g);
  setTimeout(()=>{if(GHOSTS.get(uid)===g){g.remove();GHOSTS.delete(uid)}},6000);
}
/* When a site leaves a row, the sites to its right stay where they were until the destroyed site has
   finished crumbling, wait a second, then slide left into the gap. */
const HOLD=new Map(); /* site uid -> {left: screen x to hold at, gone: [uids that left], t: release time} */
function holdShifts(old){
  if(!G) {HOLD.clear();return}
  if(old&&!(typeof matchMedia==='function'&&matchMedia('(prefers-reduced-motion: reduce)').matches)){
    const gone=Object.keys(old).filter(k=>k[0]==='s'&&!document.querySelector(`[data-suid="${k.slice(1)}"]`)).map(k=>k.slice(1));
    if(gone.length){
      for(const el of document.querySelectorAll('#app .board .row [data-suid]')){
        const u=el.dataset.suid,o=old['s'+u];if(!o||HOLD.has(u))continue;
        const r=el.getBoundingClientRect();
        if(Math.abs(r.top-o.top)<40&&o.left-r.left>8) HOLD.set(u,{left:o.left,gone,t:0});
      }
    }
  }
  for(const [u,h] of HOLD){
    const el=document.querySelector(`#app [data-suid="${u}"]`);if(!el){HOLD.delete(u);continue}
    const z=rowZoom(el);el.style.transform='';const r=el.getBoundingClientRect();
    el.style.transform=`translateX(${(h.left-r.left)/z}px)`;
  }
  if(HOLD.size&&!holdShifts.timer) holdShifts.timer=setInterval(holdTick,100);
}
function holdTick(){
  const now=performance.now();
  for(const [u,h] of HOLD){
    const busy=h.gone.some(g=>GHOSTS.has(+g)||PEND.has(+g)||ARROWS.q.some(a=>a.t==+g));
    if(busy){h.t=0;h.crumbled=true;continue}
    if(!h.t){h.t=now+1000+(h.crumbled?900:0);continue} /* the crumble takes ~0.9s, then a 1s pause */
    if(now<h.t)continue;
    HOLD.delete(u);
    const el=document.querySelector(`#app [data-suid="${u}"]`);if(!el)continue;
    const from=el.style.transform;el.style.transform='';
    if(from)el.animate([{transform:from},{transform:'translateX(0)'}],{duration:420,easing:'cubic-bezier(.3,.7,.3,1)'});
  }
  if(!HOLD.size){clearInterval(holdShifts.timer);holdShifts.timer=null}
}
function crumble(uid,col){
  const g=GHOSTS.get(uid);if(!g)return;GHOSTS.delete(uid);
  const r=g.getBoundingClientRect();
  g.animate([{transform:'translate(0,0) rotate(0)',filter:'brightness(1)'},{transform:'translate(-6px,0) rotate(-1.5deg)',filter:'brightness(1.8) saturate(1.6)',offset:.12},
    {transform:'translate(5px,2px) rotate(1.2deg)',filter:'brightness(1.4)',offset:.24},{transform:'translate(0,6px) rotate(0)',filter:'brightness(.9)',offset:.36,opacity:1},
    {transform:'translate(0,40px) rotate(4deg) scale(.85)',filter:'brightness(.4) blur(1px)',opacity:0}],{duration:900,easing:'ease-in',fill:'forwards'}).onfinish=()=>g.remove();
  const svg=fxLayer(),NS='http://www.w3.org/2000/svg';
  for(let i=0;i<18;i++){
    const x=r.left+Math.random()*r.width,y=r.top+r.height*(0.3+Math.random()*0.6);
    const sz=3+Math.random()*7;const rk=document.createElementNS(NS,'rect');
    rk.setAttribute('x',x);rk.setAttribute('y',y);rk.setAttribute('width',sz);rk.setAttribute('height',sz*0.8);rk.setAttribute('fill',i%3?'#4b4037':'#2a211b');svg.appendChild(rk);
    const dx=(Math.random()-0.5)*90,dy=40+Math.random()*80;
    rk.animate([{transform:'translate(0,0) rotate(0)',opacity:1},{transform:`translate(${dx}px,${dy}px) rotate(${(Math.random()-0.5)*300}deg)`,opacity:0}],{duration:700+Math.random()*400,delay:200+Math.random()*150,easing:'cubic-bezier(.3,0,.8,.6)',fill:'both'}).onfinish=()=>rk.remove();
  }
  const dust=document.createElementNS(NS,'ellipse');dust.setAttribute('cx',r.left+r.width/2);dust.setAttribute('cy',r.bottom-10);dust.setAttribute('rx',r.width*0.6);dust.setAttribute('ry',22);dust.setAttribute('fill','rgba(120,100,80,.35)');
  dust.setAttribute('style','filter:blur(6px)');svg.appendChild(dust);
  dust.animate([{opacity:0,transform:'scale(.6)'},{opacity:1,transform:'scale(1)',offset:.4},{opacity:0,transform:'scale(1.3)'}],{duration:1000,delay:250,fill:'both'}).onfinish=()=>dust.remove();
}
/* Show the damage a projectile carried, once it lands (or if its animation is skipped) */
/* Zealot count as one blue disc; HP as one red square showing current/max. */
/* Zealots killed by damage still in flight are shown until the projectile lands */
function shownZ(s){return s.followers+(PENDZ.get(s.uid)||0)}
function zcHTML(n,fort){return `<div class="tokens${fort?' fort':''}" title="${n} Zealot${n===1?'':'s'}${fort?' · Fortified site':''}"><span class="zc${n?'':' zero'}">${n}</span></div>`}
function hpHTML(cur,max){cur=Math.max(0,cur);return `<div class="integ" title="${cur} / ${max} HP"><span class="hpbox${cur<max?' hurt':''}"><b>${cur}</b></span></div>`}
/* Attachments and tucked cards as numbered icons in the site's bottom bar.
   Hovering the attachment icon shows the attachment cards themselves. */
function footIcons(s){
  const na=s.attachments.length,nt=s.tucked.length;
  const a=na?`<span class="ic an" data-atts="${s.uid}" role="img" aria-label="${na} attachment${na>1?'s':''}: ${esc(s.attachments.map(k=>k.def.name).join(', '))}"><b>${na}</b></span>`:'';
  const t=nt?`<span class="ic tn" role="img" title="${nt} card${nt>1?'s':''} tucked under this site" aria-label="${nt} tucked"><b>${nt}</b></span>`:'';
  return `<div class="attl">${a}${t}</div>`;
}
function attCardHTML(k){const d=k.def;return `<div class="card ${eraCls(d)}">${bandHTML(d)}${artHTML(d)}<div class="body"><div class="tx">${cardText(d.text)}</div></div></div>`}
/* Hovering a card in the discard pile list shows the card itself */
function cardFaceHTML(k){return k.def.type==='site'?siteHTML(mkSite(k,viewer()),viewer(),true):attCardHTML(k)}
function showDiscardZoom(el){
  const z=$('zoom');if(!z||!G)return;const k=G.discard[+el.dataset.dcard];if(!k){z.hidden=true;return}
  z.innerHTML=term(cardFaceHTML(k))+TWINKLES;z.classList.add('over-dialog');z.hidden=false;
  /* same size and scale as the cards on the board */
  {const c=z.firstElementChild,ref=document.querySelector('#app .board .site.mini');if(c&&ref){const k2=rowZoom(ref),r=ref.getBoundingClientRect();c.style.zoom=k2;c.style.width=(r.width/k2)+'px';c.style.minHeight=(r.height/k2)+'px';c.style.maxWidth='none'}}
  const r=el.closest('.dv-box').getBoundingClientRect(),row=el.getBoundingClientRect();
  placeZoom(z,{left:r.left,right:r.right,top:row.top+row.height/2});
}
function showAttZoom(el){
  const z=$('zoom');if(!z||!G)return;
  const st=allSites().find(x=>x.uid===+el.dataset.atts);if(!st||!st.attachments.length){z.hidden=true;return}
  z.innerHTML=term(`<div class="attzoom">${st.attachments.map(attCardHTML).join('')}</div>`)+TWINKLES;
  {const ref=el.closest('[data-suid]');if(ref){const k2=rowZoom(ref),r=ref.getBoundingClientRect();for(const c of z.querySelectorAll('.attzoom .card')){c.style.zoom=k2;c.style.width=(r.width/k2)+'px';c.style.minHeight=(r.height/k2)+'px'}}}
  z.hidden=false;placeZoom(z,el.getBoundingClientRect());
}
function placeZoom(z,r){
  const w=z.offsetWidth,h=z.offsetHeight;
  let x=r.right+12;if(x+w>innerWidth-8)x=r.left-w-12;if(x<8)x=8;
  let y=r.top-h/2;if(y+h>innerHeight-8)y=innerHeight-h-8;if(y<8)y=8;
  z.style.left=x+'px';z.style.top=y+'px';
}
function settle(d){
  if(d.settled)return;d.settled=true;
  if(!d.pend)return;
  const left=(PEND.get(d.t)||0)-d.n;if(left>0)PEND.set(d.t,left);else PEND.delete(d.t);
  if(d.k){const lz=(PENDZ.get(d.t)||0)-d.k;if(lz>0)PENDZ.set(d.t,lz);else PENDZ.delete(d.t)}
  const el=document.querySelector(`[data-suid="${d.t}"]`);if(!el||!G)return;
  const st=allSites().find(x=>x.uid===d.t);if(!st)return;
  if(d.k){const z=shownZ(st);if(FLY.fol&&FLY.fol.has(d.t))FLY.fol.get(d.t).n=z;setZ(el,z);killFx(el,d.k)}
  const shown=Math.max(0,st.damage-(PEND.get(d.t)||0));
  const box=el.querySelector('.hpbox');if(!box)return;
  const mx=integ(st),cur=Math.max(0,mx-shown),b=box.querySelector('b');
  if(b&&b.textContent!==String(cur)){b.textContent=cur;box.classList.toggle('hurt',cur<mx);const ig=box.closest('.integ');if(ig)ig.title=`${cur} / ${mx} HP`;
    box.animate([{transform:'scale(1.6)',filter:'brightness(2.2)'},{transform:'scale(1)',filter:'brightness(1)'}],{duration:420,easing:'ease-out'})}
}
function setZ(el,n){const c=el.querySelector('.zc');if(!c)return;c.textContent=n;c.classList.toggle('zero',!n);const t=el.querySelector('.tokens');if(t)t.title=`${n} Zealot${n===1?'':'s'}`}
/* Zealots killed: the disc flashes red and shrinks back, and a red "−N" rises from it */
function killFx(el,n){
  const c=el.querySelector('.zc');if(!c)return;
  c.animate([{transform:'scale(1.6)',filter:'brightness(1.6) sepia(1) saturate(6) hue-rotate(-50deg)'},{transform:'scale(1)',filter:'none'}],{duration:520,easing:'ease-out'});
  const r=c.getBoundingClientRect();if(!r.width)return;
  const f=document.createElement('div');f.className='killfx';f.setAttribute('aria-hidden','true');f.textContent='−'+n;
  Object.assign(f.style,{left:(r.left+r.width/2)+'px',top:(r.top)+'px'});document.body.appendChild(f);
  f.animate([{transform:'translate(-50%,0) scale(.7)',opacity:0},{transform:'translate(-50%,-14px) scale(1.15)',opacity:1,offset:.25},{transform:'translate(-50%,-38px) scale(1)',opacity:0}],{duration:1100,easing:'ease-out'}).onfinish=()=>f.remove();
  setTimeout(()=>f.remove(),1500);
}
function flyArrow(d,a,b,dur){
  const svg=fxLayer(),NS='http://www.w3.org/2000/svg';
  const col=d.st?'#ff9a1f':'#ff3b2f',glow=d.st?'#ff7a00':'#ff1a0a';
  const same=Math.abs(a.left-b.left)<2&&Math.abs(a.top-b.top)<2;
  const p0={x:a.left+a.width/2,y:a.top+Math.min(a.height/2,60)},p2={x:b.left+b.width/2,y:b.top+Math.min(b.height*0.32,70)};
  const dist=Math.hypot(p2.x-p0.x,p2.y-p0.y),lift=Math.min(260,dist*0.45+50);
  const ddx=p2.x-p0.x,bend=Math.abs(ddx)<140?(ddx>=0?1:-1)*(140-Math.abs(ddx))*0.9:0;
  const p1={x:(p0.x+p2.x)/2+bend,y:Math.min(p0.y,p2.y)-lift};
  const g=document.createElementNS(NS,'g');g.setAttribute('style',`filter:drop-shadow(0 0 4px ${glow})`);
  const path=document.createElementNS(NS,'path');
  path.setAttribute('d',`M${p0.x} ${p0.y}Q${p1.x} ${p1.y} ${p2.x} ${p2.y}`);
  path.setAttribute('fill','none');path.setAttribute('stroke',col);path.setAttribute('stroke-width','4.5');path.setAttribute('stroke-linecap','round');
  const head=document.createElementNS(NS,'path');head.setAttribute('d','M10 0L-7 -6.5L-3 0L-7 6.5Z');head.setAttribute('fill',col);head.setAttribute('stroke','#2a0a04');head.setAttribute('stroke-width','1');
  if(!same){g.appendChild(path);g.appendChild(head)}
  svg.appendChild(g);
  const L=same?0:path.getTotalLength();
  if(!same){path.style.strokeDasharray=`${L}`;path.style.strokeDashoffset=`${L}`}
  const start=performance.now();
  const step=now=>{
    let t=Math.min(1,(now-start)/(same?1:dur));const e=t<0.5?2*t*t:1-Math.pow(-2*t+2,2)/2;
    if(!same){
      const at=path.getPointAtLength(L*e),ah=path.getPointAtLength(Math.min(L,L*e+1));
      const ang=Math.atan2(ah.y-at.y,ah.x-at.x)*180/Math.PI;
      head.setAttribute('transform',`translate(${at.x} ${at.y}) rotate(${ang}) scale(1.25)`);
      path.style.strokeDashoffset=`${L*(1-e)}`;
      /* the trail fades behind the projectile */
      path.style.opacity=String(0.35+0.65*(1-Math.max(0,e-0.15)));
    }
    if(t<1){requestAnimationFrame(step);return}
    head.remove();
    path.animate([{opacity:path.style.opacity||1},{opacity:0}],{duration:380,fill:'forwards'}).onfinish=()=>g.remove();
    impact(d,p2,col,glow);
  };
  requestAnimationFrame(step);
}
function impact(d,p,col,glow){
  if(d.snd)sfx(d.snd);
  settle(d);
  if(GHOSTS.has(d.t)){if(d.snd==='destroy')crumble(d.t,col);else{const g=GHOSTS.get(d.t);g.animate([{transform:'translate(0,0)'},{transform:'translate(-5px,1px) rotate(-1deg)'},{transform:'translate(4px,-1px)'},{transform:'translate(0,0)'}],{duration:320})}}
  const svg=fxLayer(),NS='http://www.w3.org/2000/svg';
  const ring=document.createElementNS(NS,'circle');ring.setAttribute('cx',p.x);ring.setAttribute('cy',p.y);ring.setAttribute('r','6');
  ring.setAttribute('fill','none');ring.setAttribute('stroke',col);ring.setAttribute('stroke-width','4');ring.setAttribute('style',`filter:drop-shadow(0 0 6px ${glow})`);
  const core=document.createElementNS(NS,'circle');core.setAttribute('cx',p.x);core.setAttribute('cy',p.y);core.setAttribute('r','10');core.setAttribute('fill','#ffe2a8');core.setAttribute('opacity','.9');
  svg.appendChild(core);svg.appendChild(ring);
  ring.animate([{r:6,opacity:1,strokeWidth:5},{r:d.st?40:32,opacity:0,strokeWidth:1}],{duration:480,easing:'ease-out',fill:'forwards'}).onfinish=()=>ring.remove();
  core.animate([{r:10,opacity:.95},{r:2,opacity:0}],{duration:320,easing:'ease-out',fill:'forwards'}).onfinish=()=>core.remove();
  for(let i=0;i<(d.st?7:5);i++){
    const sp=document.createElementNS(NS,'circle');const ang=Math.random()*Math.PI*2,dd=18+Math.random()*26;
    sp.setAttribute('cx',p.x);sp.setAttribute('cy',p.y);sp.setAttribute('r',String(1.5+Math.random()*1.8));sp.setAttribute('fill',col);svg.appendChild(sp);
    sp.animate([{transform:'translate(0,0)',opacity:1},{transform:`translate(${Math.cos(ang)*dd}px,${Math.sin(ang)*dd+8}px)`,opacity:0}],{duration:420+Math.random()*200,easing:'ease-out',fill:'forwards'}).onfinish=()=>sp.remove();
  }
  const tx=document.createElementNS(NS,'text');tx.setAttribute('x',p.x);tx.setAttribute('y',p.y-14);tx.setAttribute('text-anchor','middle');
  tx.setAttribute('class','fx-num');tx.setAttribute('fill',col);tx.textContent=`−${d.n}`;svg.appendChild(tx);
  tx.animate([{transform:'translate(0,6px)',opacity:0},{transform:'translate(0,-4px)',opacity:1,offset:.25},{transform:'translate(0,-26px)',opacity:0}],{duration:1100,easing:'ease-out',fill:'forwards'}).onfinish=()=>tx.remove();
  const el=document.querySelector(`[data-suid="${d.t}"]`);
  if(el)el.animate([{transform:'translate(0,0)'},{transform:'translate(-5px,1px) rotate(-1deg)'},{transform:'translate(4px,-1px) rotate(.8deg)'},{transform:'translate(-3px,0)'},{transform:'translate(2px,0)'},{transform:'translate(0,0)'}],{duration:360,easing:'ease-out'});
}

/* ---- Draw animation: a new card flies from its draw stack (or the discard pile) to the hand,
   flipping face-up on the way for your cards and staying face-down for the opponent's. ---- */
const FLY={prev:null,hidden:new Set(),sites:null,hiddenSites:new Set()};
function drawAnims(){
  if(!G){FLY.prev=null;return}
  const now={hands:G.players.map(p=>p.hand.map(k=>k.uid)),stacks:[1,2,3,4].map(l=>G.stacks[l].length),turn:G.turnCount};
  const prev=FLY.prev;FLY.prev=now;
  for(const u of FLY.hidden){const el=handEl(u);if(el)el.style.visibility='hidden'}
  const reduce=typeof matchMedia==='function'&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fresh=!prev||now.turn<prev.turn;
  if(reduce||(fresh&&!(G.turnCount<=1&&G.mode!=='online')))return;
  const left=prev&&!fresh?[...prev.stacks]:[99,99,99,99];
  let i=0;
  G.players.forEach((p,pi)=>{
    const had=new Set(prev&&!fresh?prev.hands[pi]:[]);
    for(const k of p.hand){
      if(had.has(k.uid))continue;
      const l=k.def.level;let src;
      if(now.stacks[l-1]<left[l-1]){left[l-1]--;src=document.querySelector(`[data-draw="${l}"]`)}
      else src=document.querySelector('#mid .discard');
      flyCard(k,src,i++*(fresh?110:140));
    }
  });
}
/* ---- Site play animation: a new site flies from the hand (or wherever it was) to its spot in the row,
   then sparkles. The opponent's site flips face-up on the way. ---- */
function placeAnims(old){
  if(!G){FLY.sites=null;return}
  const now=G.players.map(p=>p.sites.map(s=>s.uid));
  const prev=FLY.sites;FLY.sites=now;
  for(const u of FLY.hiddenSites){const el=document.querySelector(`[data-suid="${u}"]`);if(el)el.style.visibility='hidden'}
  if(!prev||G.turnCount<(FLY.sitesTurn||0)){FLY.sitesTurn=G.turnCount;return}
  FLY.sitesTurn=G.turnCount;
  const reduce=typeof matchMedia==='function'&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(reduce)return;
  G.players.forEach((p,pi)=>{
    const had=new Set(prev[pi]||[]);
    for(const st of p.sites){
      if(had.has(st.uid))continue;
      const el=document.querySelector(`[data-suid="${st.uid}"]`);if(!el)continue;
      const src=old['c'+st.card.uid]||old['s'+st.uid]||null;
      flySite(st,el,src,pi!==viewer()&&!!old['c'+st.card.uid]);
    }
  });
}
function flySite(st,el,a,flip){
  const b=el.getBoundingClientRect();if(!b.width)return;
  const done=()=>{FLY.hiddenSites.delete(st.uid);const e=document.querySelector(`[data-suid="${st.uid}"]`);if(e){e.style.visibility='';sparkle(e.getBoundingClientRect())}};
  if(!a||!a.width){sparkle(b);return}
  FLY.hiddenSites.add(st.uid);el.style.visibility='hidden';
  const f=document.createElement('div');f.className='flyer';f.setAttribute('aria-hidden','true');
  Object.assign(f.style,{left:b.left+'px',top:b.top+'px',width:b.width+'px',height:b.height+'px'});
  const lv=st.card.def.level;
  f.innerHTML=`<div class="fly-inner"><div class="fly-face fly-back era-${st.card.def.start?'h':lv}"><span>${ROMAN[lv]}</span></div><div class="fly-face fly-front">${el.outerHTML}</div></div>`;
  const fr=f.querySelector('.fly-front>*');fr.style.visibility='visible';fr.removeAttribute('data-suid');fr.removeAttribute('data-site');
  {const z=rowZoom(el);if(z!==1){fr.style.zoom=z;fr.style.setProperty('width',b.width/z+'px','important');fr.style.height=b.height/z+'px';fr.style.maxWidth='none';fr.style.minHeight='0'}}
  const bs=f.querySelector('.fly-back span');bs.style.fontSize=Math.max(9,Math.min(44,b.width*0.24))+'px';
  if(!flip)f.querySelector('.fly-back').remove();
  document.body.appendChild(f);
  const sw=flip?Math.max(a.width*2.4,40):a.width,sx=sw/b.width,sy=flip?sx:a.height/b.height;
  const dx=a.left+a.width/2-(b.left+b.width/2),dy=a.top+a.height/2-(b.top+b.height/2);
  const dur=620;
  const anim=f.animate([
    {transform:`translate(${dx}px,${dy}px) scale(${sx},${sy})`},
    {transform:`translate(${dx*0.4}px,${dy*0.4-30}px) scale(${(sx+1)/2*1.1},${(sy+1)/2*1.1})`,offset:0.55},
    {transform:'translate(0,-6px) scale(1.04)',offset:0.85},
    {transform:'translate(0,0) scale(1)'}],{duration:dur,easing:'cubic-bezier(.3,.7,.3,1)',fill:'both'});
  if(flip)f.querySelector('.fly-inner').animate([{transform:'rotateY(180deg)'},{transform:'rotateY(180deg)',offset:0.2},{transform:'rotateY(0deg)',offset:0.8},{transform:'rotateY(0deg)'}],{duration:dur,easing:'ease-in-out',fill:'both'});
  let fin=false;const end=()=>{if(fin)return;fin=true;f.remove();done()};
  anim.onfinish=end;anim.oncancel=end;setTimeout(end,dur+500);
}
/* ---- Upgrade effect: a banner sweeps across the player's area in the new level's color,
   the level badge pulses and embers rise from it ---- */
function playUps(){
  const list=UPS.q.splice(0);
  if(typeof matchMedia==='function'&&matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  for(const d of list){
    const zone=document.getElementById(d.pi===viewer()?'meZone':'oppZone');if(!zone)continue;
    const p=G.players[d.pi],who=isYou(p)?'You':p.name;
    const ban=document.createElement('div');ban.className=`lvlup era-${d.to}`;ban.setAttribute('aria-hidden','true');
    ban.innerHTML=`<div class="lvlup-band"><small>${esc(who)} reached</small><b>${esc(term('Level '+ROMAN[d.to]))}</b></div>`;
    const zr=zone.getBoundingClientRect();Object.assign(ban.style,{left:zr.left+'px',top:zr.top+'px',width:zr.width+'px',height:Math.min(zr.height,innerHeight)+'px'});
    document.body.appendChild(ban);
    ban.animate([{opacity:0},{opacity:1,offset:.12},{opacity:1,offset:.75},{opacity:0}],{duration:1900,easing:'ease-out',fill:'forwards'}).onfinish=()=>ban.remove();
    ban.querySelector('.lvlup-band').animate([{transform:'scaleX(.2) translateY(6px)',letterSpacing:'0'},{transform:'scaleX(1.06)',offset:.2},{transform:'scaleX(1)',offset:.3},{transform:'scaleX(1) translateY(-4px)'}],{duration:1900,easing:'cubic-bezier(.2,.8,.2,1)',fill:'forwards'});
    zone.animate([{boxShadow:'0 0 0 0 rgba(0,0,0,0)'},{boxShadow:`0 0 40px 6px ${getComputedStyle(ban).getPropertyValue('--era')}`,offset:.25},{boxShadow:'0 0 0 0 rgba(0,0,0,0)'}],{duration:1600,easing:'ease-out'});
    const badge=zone.querySelector('.lvl');
    if(badge){badge.animate([{transform:'scale(1)'},{transform:'scale(1.5)',offset:.3},{transform:'scale(.95)',offset:.6},{transform:'scale(1)'}],{duration:900,easing:'ease-out'});
      const r=badge.getBoundingClientRect();emberBurst(r.left+r.width/2,r.top+r.height/2,getComputedStyle(ban).getPropertyValue('--era').trim()||'#ffd27a')}
  }
}
function emberBurst(x,y,col){
  const svg=fxLayer(),NS='http://www.w3.org/2000/svg';
  for(let i=0;i<22;i++){
    const c=document.createElementNS(NS,'circle');c.setAttribute('cx',x);c.setAttribute('cy',y);c.setAttribute('r',String(1.6+Math.random()*2.4));
    c.setAttribute('fill',i%3?col:'#fff1c9');c.setAttribute('style',`filter:drop-shadow(0 0 4px ${col})`);svg.appendChild(c);
    const ang=-Math.PI/2+(Math.random()-0.5)*Math.PI*1.4,d=40+Math.random()*90;
    c.animate([{transform:'translate(0,0)',opacity:1},{transform:`translate(${Math.cos(ang)*d}px,${Math.sin(ang)*d-30}px)`,opacity:0}],{duration:900+Math.random()*600,delay:Math.random()*150,easing:'cubic-bezier(.2,.7,.4,1)',fill:'both'}).onfinish=()=>c.remove();
  }
}
/* ---- "Your Turn": a full-screen flash, big text and a gong when your turn begins ---- */
const YT={seen:null};
function yourTurnCheck(){
  if(!G||G.over){YT.seen=null;return}
  const vi=viewer(),me=G.players[vi];
  const key=G.turnCount+':'+G.turn;
  if(YT.seen===key)return;
  const first=YT.seen===null;YT.seen=key;
  if(G.turn!==vi||me.ai||(first&&G.turnCount>1))return;
  sfx('yourturn');
  if(typeof matchMedia==='function'&&matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  const o=document.createElement('div');o.className='yourturn';o.setAttribute('aria-hidden','true');
  o.innerHTML='<div class="yt-streak"></div><div class="yt-text">Your Turn</div>';
  document.body.appendChild(o);
  o.animate([{opacity:0},{opacity:1,offset:.12},{opacity:1,offset:.7},{opacity:0}],{duration:1700,easing:'ease-out',fill:'forwards'}).onfinish=()=>o.remove();
  o.querySelector('.yt-text').animate([{transform:'scale(1.6)',letterSpacing:'.5em',filter:'blur(6px)'},{transform:'scale(1)',letterSpacing:'.18em',filter:'blur(0)',offset:.22},{transform:'scale(1.04)',letterSpacing:'.2em'}],{duration:1700,easing:'cubic-bezier(.2,.8,.2,1)',fill:'forwards'});
  o.querySelector('.yt-streak').animate([{transform:'scaleX(0)',opacity:0},{transform:'scaleX(1)',opacity:1,offset:.25},{transform:'scaleX(1.1)',opacity:0}],{duration:1300,easing:'ease-out',fill:'forwards'});
}
/* ---- Every card is the same height: the tallest card on the table sets it ---- */
function equalizeCards(){
  for(const r of document.querySelectorAll('.board .zone .row')) r.style.zoom='';
  const cards=[...document.querySelectorAll('#app .card')];
  if(cards.length){
    for(const c of cards) c.style.minHeight='';
    const h=Math.max(probeSiteH(cards),...cards.map(c=>c.offsetHeight));
    for(const c of cards) c.style.minHeight=h+'px';
  }
  /* Hand cards keep their natural height (only the top strip shows until hovered); each one lifts just enough to show itself */
  const dw=$('dockwrap'),app=$('app');
  if(dw&&app) app.style.paddingBottom=(dw.offsetHeight+18)+'px';
  fitBoard();
  sizeHand();
}
/* When the board is sparse, scale both rows of sites up (same factor for both) to use the empty space.
   Only scales while every site is still at its full width, so card heights stay equal. */
/* Height of a typical site with two abilities (Stone Keep), so a board of bare Warplands at the start
   is sized like the rest of the game instead of jumping taller when the first real site lands. */
function probeSiteH(cards){
  const ref=cards.find(c=>c.classList.contains('mini'));if(!ref||!G)return 0;
  const def=CARDS.find(c=>c.id==='castle');if(!def)return 0;
  const w=document.createElement('div');w.innerHTML=term(siteMini(mkSite({uid:-1,def},1-viewer()),viewer()));
  const c=w.firstElementChild;c.removeAttribute('data-suid');
  Object.assign(c.style,{position:'absolute',visibility:'hidden',left:'0',top:'0',width:ref.offsetWidth+'px',maxWidth:'none',flex:'none'});
  ref.parentElement.appendChild(c);const h=c.offsetHeight;c.remove();return h;
}
/* Shrink a card name's font just enough to keep it on one line */
function fitNames(sel){
  for(const nm of document.querySelectorAll(sel)){
    nm.style.fontSize='';nm.style.whiteSpace='nowrap';
    let f=parseFloat(getComputedStyle(nm).fontSize);
    while(nm.scrollWidth>nm.clientWidth+0.5&&f>9){f-=0.5;nm.style.fontSize=f+'px'}
  }
}
/* When the hand is wider than the screen, overlap the cards just enough to fit (more cards, more overlap).
   Each card still shows a strip you can hover; the hovered card lifts above its neighbours. */
/* Hand cards are drawn at the same size as the cards on the board: same width, same scale
   (scale capped so the header still fits in the strip of hand that peeks above the screen edge). */
function sizeHand(){
  const cards=[...document.querySelectorAll('#handDock .card')];
  const refs=[...document.querySelectorAll('#app .board .site.mini')];
  let w=176,z=1; /* z is reassigned if the board re-fits */
  if(refs.length){z=Math.min(rowZoom(refs[0]),1.5);w=Math.max(140,Math.min(208,Math.min(...refs.map(r=>r.getBoundingClientRect().width/rowZoom(r)))))}
  /* same fixed height as the board's cards (board cards are all equalized to one height) */
  let bh=refs.length?parseFloat(refs[0].style.minHeight)||refs[0].offsetHeight:0;
  for(const c of cards){c.style.zoom=Math.abs(z-1)>0.01?z:'';c.style.width=w+'px';c.style.minHeight=''}
  /* a card in hand taller than the board's cards raises the shared height for both */
  const hmax=Math.max(0,...cards.map(c=>c.offsetHeight));
  if(refs.length&&hmax>bh+0.5){bh=hmax;for(const c of document.querySelectorAll('#app .card'))c.style.minHeight=bh+'px';fitBoard();
    z=Math.min(rowZoom(refs[0]),1.5);for(const c of cards)c.style.zoom=Math.abs(z-1)>0.01?z:''}
  for(const c of cards)c.style.minHeight=bh?bh+'px':'';
  fitNames('#handDock .card .nm');
  fanHand();
  for(const c of cards)c.style.setProperty('--lift',Math.max(0,c.offsetHeight-DOCK_PEEK/z)+'px');
}
function fanHand(){
  const hand=document.querySelector('#handDock .hand');if(!hand)return;
  const cards=[...hand.children].filter(c=>c.classList.contains('card'));
  for(const c of cards)c.style.marginLeft='';
  hand.style.gap='';
  if(cards.length<2)return;
  const z=parseFloat(cards[0].style.zoom)||1;
  const gap=parseFloat(getComputedStyle(hand).columnGap)||10, w=cards[0].getBoundingClientRect().width;
  const avail=hand.clientWidth-8, need=cards.length*w+(cards.length-1)*gap;
  if(need<=avail)return;
  const step=Math.max(14,(avail-w)/(cards.length-1));
  hand.style.gap='0px';
  /* margins inside a scaled card are scaled too, so convert back to the card's own units */
  cards.forEach((c,i)=>{if(i)c.style.marginLeft=((step-w)/z)+'px'});
}
function fitBoard(){
  const rows=[...document.querySelectorAll('.board .zone .row')].filter(r=>r.querySelector('.site.mini'));
  for(const r of rows) r.style.zoom='';
  if(!rows.length) return;
  let z=1.5; /* same cap as the hand, so board and hand cards are always the same size */
  for(const r of rows){
    const kids=[...r.children].filter(k=>k.offsetParent);if(!kids.length) continue;
    const cs=getComputedStyle(r),zone=r.closest('.zone'),zcs=getComputedStyle(zone);
    const rr=r.getBoundingClientRect(),zr=zone.getBoundingClientRect();
    const first=kids[0].getBoundingClientRect(),last=kids[kids.length-1].getBoundingClientRect();
    const needW=last.right-first.left+parseFloat(cs.paddingLeft)+parseFloat(cs.paddingRight)+2;
    const availH=zr.bottom-parseFloat(zcs.borderBottomWidth)-parseFloat(zcs.paddingBottom)-rr.top;
    z=Math.min(z,r.clientWidth/needW,availH/r.scrollHeight);
  }
  /* scale up to fill empty space, or down (to 60%) when tall cards no longer fit */
  z=Math.max(0.6,Math.floor(z*0.995*50)/50); /* small margin so rounding never adds a scrollbar */
  if(Math.abs(z-1)>0.02) for(const r of rows) r.style.zoom=z;
}
const DOCK_PEEK=60;
/* ---- Zealot animation: dots fly between sites when they move, and in from the hand when gained ---- */
function followerAnims(old){
  if(!G){FLY.fol=null;return}
  const now=new Map();for(const p of G.players)for(const st of p.sites)now.set(st.uid,{n:shownZ(st),pi:p.i});
  const prev=FLY.fol;FLY.fol=now;
  if(!prev||G.turnCount<(FLY.folTurn||0)){FLY.folTurn=G.turnCount;return}
  FLY.folTurn=G.turnCount;
  if(typeof matchMedia==='function'&&matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const ups=[],downs=[];
  for(const [u,v] of now){const was=prev.get(u);if(!was)continue;const d=v.n-was.n;if(d>0)ups.push({u,pi:v.pi,n:d});else if(d<0)downs.push({u,pi:v.pi,n:-d})}
  /* Pair Zealots that left a site with sites that gained them: same player first (relocation), then across (steals) */
  const moves=[];
  const pair=same=>{for(const up of ups)for(const dn of downs){if(!up.n)break;if(!dn.n||(same?dn.pi!==up.pi:dn.pi===up.pi))continue;const k=Math.min(up.n,dn.n);moves.push({from:'t'+dn.u,to:up.u,n:k});up.n-=k;dn.n-=k}};
  pair(true);pair(false);
  for(const up of ups) if(up.n) moves.push({from:'h'+(up.pi===viewer()?'meZone':'oppZone'),to:up.u,n:up.n,hand:true});
  /* Zealots that vanished without moving anywhere were killed (or sacrificed) */
  for(const dn of downs) if(dn.n){const el=document.querySelector(`[data-suid="${dn.u}"]`);if(el&&!(FLY.hiddenSites&&FLY.hiddenSites.has(dn.u)))killFx(el,dn.n)}
  /* every destination animates at the same time, so a split relocation shows each stream */
  for(const m of moves){
    const a=old[m.from];
    const el=document.querySelector(`[data-suid="${m.to}"] .tokens`)||document.querySelector(`[data-suid="${m.to}"]`);
    if(!a||!el||(FLY.hiddenSites&&FLY.hiddenSites.has(m.to)))continue;
    const b=el.getBoundingClientRect();
    const n=Math.min(m.n,10);
    for(let i=0;i<n;i++) flyDot(a,b,i*70,m.hand);
    pulseTokens(m.to,n*70+560);
  }
}
/* the receiving site's Zealot row glows as the dots arrive */
function pulseTokens(uid,at){setTimeout(()=>{const t=document.querySelector(`[data-suid="${uid}"] .tokens`);if(t)t.animate([{filter:'drop-shadow(0 0 0 rgba(110,170,255,0))'},{filter:'drop-shadow(0 0 8px rgba(110,170,255,1))'},{filter:'drop-shadow(0 0 0 rgba(110,170,255,0))'}],{duration:500})},Math.max(0,at-200))}
function flyDot(a,b,delay,fromHand){
  const d=document.createElement('span');d.className='dot fly-dot';d.setAttribute('aria-hidden','true');
  const jit=()=>(Math.random()-0.5)*14;
  const x0=fromHand?a.left+a.width/2+jit()*4:a.left+6+Math.random()*Math.max(4,a.width-30),y0=fromHand?a.top+10:a.top+a.height/2+jit()*0.5;
  const x1=b.left+6+Math.random()*Math.max(4,Math.min(b.width,70)-12),y1=b.top+b.height/2+jit()*0.6;
  d.style.left=x0+'px';d.style.top=y0+'px';document.body.appendChild(d);
  const dx=x1-x0,dy=y1-y0,lift=Math.min(120,Math.hypot(dx,dy)*0.35+20);
  const dur=fromHand?620:760;
  const an=d.animate([
    {transform:'translate(-50%,-50%) scale(.4)',opacity:0},
    {transform:'translate(-50%,-50%) scale(1.1)',opacity:1,offset:.12},
    {transform:`translate(calc(${dx*0.5}px - 50%),calc(${dy*0.5-lift}px - 50%)) scale(1.25)`,opacity:1,offset:.55},
    {transform:`translate(calc(${dx}px - 50%),calc(${dy}px - 50%)) scale(1)`,opacity:1,offset:.92},
    {transform:`translate(calc(${dx}px - 50%),calc(${dy}px - 50%)) scale(.6)`,opacity:0}],
    {duration:dur,delay,easing:'cubic-bezier(.35,.6,.35,1)',fill:'both'});
  const end=()=>d.remove();an.onfinish=end;an.oncancel=end;setTimeout(()=>{if(d.isConnected)end()},dur+delay+400);
}
/* Gold sparkles around a card that was just played */
function sparkle(r){
  const svg=fxLayer(),NS='http://www.w3.org/2000/svg';
  const glow=document.createElementNS(NS,'rect');
  Object.entries({x:r.left-3,y:r.top-3,width:r.width+6,height:r.height+6,rx:9,fill:'none',stroke:'#ffd27a','stroke-width':3}).forEach(([k,v])=>glow.setAttribute(k,v));
  glow.setAttribute('style','filter:drop-shadow(0 0 8px #ffb347)');svg.appendChild(glow);
  glow.animate([{opacity:0},{opacity:1,offset:.2},{opacity:0}],{duration:700,easing:'ease-out',fill:'forwards'}).onfinish=()=>glow.remove();
  const star='M0 -7L1.6 -1.6L7 0L1.6 1.6L0 7L-1.6 1.6L-7 0L-1.6 -1.6Z';
  for(let i=0;i<14;i++){
    const side=i%4,u=Math.random();
    const x=side===0?r.left+u*r.width:side===1?r.right:side===2?r.left+u*r.width:r.left;
    const y=side===0?r.top:side===1?r.top+u*r.height:side===2?r.bottom:r.top+u*r.height;
    const ox=(x-(r.left+r.width/2))/r.width*40,oy=(y-(r.top+r.height/2))/r.height*40;
    const sp=document.createElementNS(NS,'path');sp.setAttribute('d',star);sp.setAttribute('fill',i%3?'#ffe6a8':'#fff6dc');
    sp.setAttribute('style','filter:drop-shadow(0 0 3px #ffc04d)');svg.appendChild(sp);
    const sc=0.5+Math.random()*0.9,delay=Math.random()*180;
    sp.animate([{transform:`translate(${x}px,${y}px) scale(0) rotate(0deg)`,opacity:1},
                {transform:`translate(${x+ox*0.5}px,${y+oy*0.5}px) scale(${sc}) rotate(45deg)`,opacity:1,offset:.45},
                {transform:`translate(${x+ox}px,${y+oy}px) scale(0) rotate(90deg)`,opacity:0}],{duration:650+Math.random()*250,delay,easing:'ease-out',fill:'both'}).onfinish=()=>sp.remove();
  }
}
function handEl(uid){return document.querySelector(`#handDock [data-play="${uid}"],#handDock [data-pick="${uid}"]`)}
function flyCard(k,src,delay){
  const mine=!!handEl(k.uid), tgt=mine?handEl(k.uid):document.querySelector(`#oppZone [data-buid="${k.uid}"]`);
  if(!src||!tgt)return;
  const a=src.getBoundingClientRect(),b=tgt.getBoundingClientRect();
  if(!b.width||!a.width)return;
  if(mine){FLY.hidden.add(k.uid);tgt.style.visibility='hidden'}
  const f=document.createElement('div');f.className='flyer';f.setAttribute('aria-hidden','true');
  Object.assign(f.style,{left:b.left+'px',top:b.top+'px',width:b.width+'px',height:b.height+'px'});
  const lv=k.def.level;
  f.innerHTML=`<div class="fly-inner"><div class="fly-face fly-back era-${lv}"><span>${ROMAN[lv]}</span></div>${mine?`<div class="fly-face fly-front">${tgt.outerHTML}</div>`:''}</div>`;
  const fr=f.querySelector('.fly-front>*');if(fr){fr.style.visibility='visible';fr.removeAttribute('data-play');fr.removeAttribute('data-pick');fr.style.margin='0';const z=parseFloat(fr.style.zoom)||1;if(z!==1){fr.style.setProperty('width',b.width/z+'px','important');fr.style.height=b.height/z+'px'}}
  const bs=f.querySelector('.fly-back span');if(bs)bs.style.fontSize=Math.max(9,Math.min(44,b.width*0.24))+'px';
  document.body.appendChild(f);
  const sw=mine?a.width*0.72:Math.min(a.width*0.55,70),sh=mine?sw*(b.height/b.width):sw*1.4;
  const sx=sw/b.width,sy=sh/b.height;
  const dx=a.left+a.width/2-(b.left+b.width/2),dy=a.top+a.height/2-(b.top+b.height/2);
  const dur=mine?620:520,ease='cubic-bezier(.3,.7,.3,1)';
  const anim=f.animate([
    {transform:`translate(${dx}px,${dy}px) scale(${sx},${sy})`,opacity:0.2},
    {transform:`translate(${dx*0.45}px,${dy*0.45-40}px) scale(${(sx+1)/2*1.08},${(sy+1)/2*1.08})`,opacity:1,offset:0.5},
    {transform:'translate(0,0) scale(1,1)',opacity:1}],{duration:dur,delay,easing:ease,fill:'both'});
  if(mine)f.querySelector('.fly-inner').animate([{transform:'rotateY(180deg)'},{transform:'rotateY(180deg)',offset:0.2},{transform:'rotateY(0deg)'}],{duration:dur,delay,easing:'ease-in-out',fill:'both'});
  const done=()=>{f.remove();if(mine){FLY.hidden.delete(k.uid);const el=handEl(k.uid);if(el)el.style.visibility=''}};
  anim.onfinish=done;anim.oncancel=done;setTimeout(()=>{if(f.isConnected)done()},dur+delay+500);
}

async function human(fn){
  if(UI.busy||!G||G.over) return;
  UI.busy=true; render();
  try{await fn();await flush()}catch(e){console.error(e)}
  UI.busy=false; checkGameOver(); render();
}

/* ================= ONLINE PLAY =================
   The server (a Cloudflare Durable Object) runs this same file with HOST.server set. It owns the
   real game state and sends each player a snapshot with the other player's hand hidden.
   The browser rebuilds the board from that snapshot and sends back actions and answers. */
const ONLINE={available:false,active:false,seat:null,ws:null,code:null,token:null,conn:[false,false],status:'',lobby:false,error:'',retry:0,relocSeq:-1};
function cardOut(k,hide){return hide?{uid:k.uid,id:'hidden',lv:k.def.level}:{uid:k.uid,id:k.def.id,by:k.attachedBy}}
const HIDDEN_LV={1:{...HIDDEN,level:1},2:{...HIDDEN,level:2},3:{...HIDDEN,level:3},4:{...HIDDEN,level:4}};
function cardIn(o){return {uid:o.uid,def:o.id==='hidden'?(HIDDEN_LV[o.lv]||HIDDEN):DEF[o.id],attachedBy:o.by}}
let PROMPT_SEQ=0;
/* full=true gives the complete state for saving; otherwise the view for seat pi */
function snapshot(pi,full){
  const P=UI.prompt,R=UI.relocate;
  const s={
    mode:G.mode,turn:G.turn,turnCount:G.turnCount,over:G.over,log:G.log.slice(0,full?80:60),
    players:G.players.map(p=>({i:p.i,name:p.name,level:p.level,actions:p.actions,lof:p.lof||0,lofTurn:p.lofTurn??-1,
      hand:p.hand.map(k=>cardOut(k,!full&&p.i!==pi)),
      sites:p.sites.map(x=>({uid:x.uid,card:cardOut(x.card),owner:x.owner,followers:x.followers,damage:x.damage,usedTurn:x.usedTurn,
        attachments:x.attachments.map(a=>cardOut(a)),tucked:x.tucked.map(k=>cardOut(k,!full&&x.owner!==pi))}))})),
    stacks:Object.fromEntries([1,2,3,4].map(l=>[l,full?G.stacks[l].map(k=>cardOut(k)):G.stacks[l].length])),
    discard:G.discard.map(k=>cardOut(k)),
    busy:!!UI.busy,
    turnMs:turnElapsed()
  };
  if(full) return s;
  if(P){
    if(P.pi===pi){
      if(P.seq==null)P.seq=++PROMPT_SEQ;
      s.prompt={seq:P.seq,kind:P.kind,text:P.text,cancellable:!!P.cancellable,cancelLabel:P.cancelLabel||null,
        set:P.set?[...P.set]:[],options:(P.options||[]).map(o=>o.label),extra:(P.extra||[]).map(o=>o.label),def:P.def||null,slots:P.slots||0};
    } else s.waiting=P.pi;
  }
  if(R){
    if(R.pi===pi){
      if(R.seq==null)R.seq=++PROMPT_SEQ;
      s.reloc={seq:R.seq,mode:R.mode,src:R.src,max:R.max===Infinity?null:R.max,forced:R.forced,title:R.title,cost:R.cost,pool:R.pool,counts:R.counts,orig:R.orig};
    } else s.waiting=R.pi;
  }
  return s;
}
function stateIn(s,full){
  const players=s.players.map(p=>({i:p.i,name:p.name,ai:false,level:p.level,actions:p.actions,lof:p.lof,lofTurn:p.lofTurn,
    hand:p.hand.map(cardIn),
    sites:p.sites.map(x=>({uid:x.uid,card:cardIn(x.card),owner:x.owner,followers:x.followers,damage:x.damage,usedTurn:x.usedTurn,
      attachments:x.attachments.map(cardIn),tucked:x.tucked.map(cardIn)}))}));
  const stacks={};
  for(const l of [1,2,3,4]) stacks[l]=full?s.stacks[l].map(cardIn):Array.from({length:s.stacks[l]},(_,i)=>({uid:-1-i,def:HIDDEN_LV[l]}));
  return {mode:s.mode,players,stacks,discard:s.discard.map(cardIn),turn:s.turn,turnCount:s.turnCount,log:s.log,over:s.over,pending:[],sets:{},choice:'random',
    turnStart:Date.now()-(s.turnMs||0),turnEnd:s.over?Date.now():null};
}
/* Turn timer: counts up from the start of the current turn and stops when the game ends */
function turnElapsed(){if(!G||G.turnStart==null)return 0;if(G.over&&G.turnEnd==null)G.turnEnd=Date.now();return Math.max(0,(G.turnEnd??Date.now())-G.turnStart)}
function fmtClock(ms){const t=Math.floor(ms/1000),h=Math.floor(t/3600),m=Math.floor(t/60)%60,sec=String(t%60).padStart(2,'0');return h?`${h}:${String(m).padStart(2,'0')}:${sec}`:`${m}:${sec}`}
const clockHTML=()=>`<span class="clock" title="Time spent on this turn">⏱ <span id="turnclock">${fmtClock(turnElapsed())}</span></span>`;
/* ---- server side ---- */
function serverLoad(saved){
  G=stateIn(saved,true);
  let m=0;for(const p of G.players){for(const k of p.hand)m=Math.max(m,k.uid);for(const x of p.sites){m=Math.max(m,x.uid,x.card.uid);for(const a of x.attachments)m=Math.max(m,a.uid);for(const k of x.tucked)m=Math.max(m,k.uid)}}
  for(const l of [1,2,3,4])for(const k of G.stacks[l])m=Math.max(m,k.uid);
  for(const k of G.discard)m=Math.max(m,k.uid);
  uidc=m+1;
  UI.prompt=null;UI.relocate=null;UI.busy=false;
}
const safePoint=()=>!!G&&!UI.busy&&!UI.prompt&&!UI.relocate;
function validReloc(R,counts){
  const p=G.players[R.pi];
  if(!counts||typeof counts!=='object') return false;
  let before=0,after=0,added=0,dests=0;
  for(const s of p.sites){
    const o=R.orig[s.uid],n=counts[s.uid];
    if(!Number.isInteger(n)||n<0) return false;
    before+=o;after+=n;
    const d=n-o, src=s.uid===R.src;
    if(d<0){
      if(!canLeave(s)||R.mode==='place') return false;
      if(R.mode==='to'&&src) return false;
      if((R.mode==='off'||R.mode==='threat'||R.mode==='escape')&&!src) return false;
      if(R.mode==='escape'&&-d>R.max) return false;
    }
    if(d>0){
      if(!canGain(s)) return false;
      if(R.mode==='to'&&!src) return false;
      if((R.mode==='off'||R.mode==='threat'||R.mode==='escape')&&src) return false;
      added+=d;dests++;
    }
  }
  if(R.mode==='escape'&&dests>1) return false;
  if(R.mode==='threat'&&counts[R.src]!==0) return false;
  if(R.mode==='place') return after===before+R.pool;
  return after===before;
}
function serverAnswer(pi,m){
  const P=UI.prompt;
  if(P&&P.pi===pi&&(m.seq==null||m.seq===P.seq)){
    if(m.a==='cancel'){if(P.cancellable)P.resolve(null);return}
    if(P.kind==='opts'&&m.a==='opt'){const o=P.options[m.i];if(o)P.resolve(o.value);return}
    if(P.kind==='site'){
      if(m.a==='site'&&P.set.has(m.uid)){const s=allSites().find(x=>x.uid===m.uid);if(s)P.resolve(s);return}
      if(m.a==='extra'&&P.extra&&P.extra[m.i]){P.resolve(P.extra[m.i].value);return}
      return;
    }
    if(P.kind==='slot'&&m.a==='slot'&&Number.isInteger(m.i)&&m.i>=0&&m.i<P.slots){P.resolve(m.i);return}
    if(P.kind==='hand'&&m.a==='hand'&&P.set.has(m.uid)){const k=G.players[pi].hand.find(x=>x.uid===m.uid);if(k)P.resolve(k);return}
    return;
  }
  const R=UI.relocate;
  if(R&&R.pi===pi&&(m.seq==null||m.seq===R.seq)){
    if(m.a==='relocCancel'&&!R.forced){R.resolve(null);return}
    if(m.a==='reloc'&&validReloc(R,m.counts)){const c={};for(const s of G.players[pi].sites)c[s.uid]=m.counts[s.uid];R.resolve(c)}
  }
}
function serverAct(pi,m){
  if(!G||G.over||G.turn!==pi||UI.busy||UI.prompt||UI.relocate) return;
  const p=G.players[pi];
  if(m.k==='draw'){human(()=>actDraw(pi,+m.l));return}
  if(m.k==='play'){const c=p.hand.find(x=>x.uid===m.uid);if(c&&canPlay(pi,c))human(()=>playCard(pi,c));return}
  if(m.k==='ab'){const s=p.sites.find(x=>x.uid===m.uid);if(s&&Number.isInteger(m.i))human(()=>useAbility(pi,s,m.i));return}
  if(m.k==='gain'){human(()=>actGain(pi));return}
  if(m.k==='upgrade'){human(async()=>actUpgrade(pi));return}
  if(m.k==='relocate'){if(p.actions>=1&&p.sites.length>1)human(async()=>{const c=await relocatePrompt(pi,{mode:'full',title:'Relocate followers',cost:'Costs 1 action'});if(c)actRelocate(pi,c)});return}
  if(m.k==='end'){endTurn();return}
}
/* ---- browser side ---- */
let SYNC_TIMER=null;
function onlineSend(o){
  try{if(ONLINE.ws&&ONLINE.ws.readyState===1)ONLINE.ws.send(JSON.stringify(o))}catch(e){}
  /* If no update arrives soon after an action, ask the server for a fresh copy of the game. */
  if(o.t!=='sync'){clearTimeout(SYNC_TIMER);SYNC_TIMER=setTimeout(()=>{if(ONLINE.active&&UI.busy)onlineSend({t:'sync'})},4000)}
}
function onlineSnap(s){
  clearTimeout(SYNC_TIMER);
  const wasOver=G&&G.mode==='online'&&G.over;
  const keepReloc=UI.relocate&&s.reloc&&UI.relocate.seq===s.reloc.seq?UI.relocate:null;
  G=stateIn(s,false);
  UI.menu=false;UI.closedOver=false;ONLINE.lobby=false;
  UI.busy=!!s.busy||s.waiting!=null;
  G.waiting=s.waiting;
  UI.prompt=null;
  if(s.prompt){
    const q=s.prompt;
    UI.prompt={kind:q.kind,pi:ONLINE.seat,seq:q.seq,text:q.text,cancellable:q.cancellable,cancelLabel:q.cancelLabel,set:new Set(q.set),
      options:q.options.map((label,i)=>({label,value:i})),extra:q.extra.map((label,i)=>({label,value:i})),def:q.def,slots:q.slots,
      resolve:v=>{
        let m;
        if(v===null||v===undefined) m={a:'cancel'};
        else if(q.kind==='opts') m={a:'opt',i:v};
        else if(q.kind==='site') m=typeof v==='number'?{a:'extra',i:v}:{a:'site',uid:v.uid};
        else if(q.kind==='hand') m={a:'hand',uid:v.uid};
        else if(q.kind==='slot') m={a:'slot',i:v};
        UI.prompt=null;UI.busy=true;render();onlineSend({t:'answer',seq:q.seq,...m});
      }};
  }
  UI.relocate=null;
  if(s.reloc){
    const r=s.reloc;
    UI.relocate=keepReloc||{pi:ONLINE.seat,seq:r.seq,mode:r.mode,src:r.src,max:r.max==null?Infinity:r.max,forced:r.forced,title:r.title,cost:r.cost,pool:r.pool,counts:{...r.counts},orig:{...r.orig}};
    UI.relocate.resolve=v=>{const seq=r.seq;UI.relocate=null;UI.busy=true;render();onlineSend(v?{t:'answer',a:'reloc',seq,counts:v}:{t:'answer',a:'relocCancel',seq})};
  }
  ONLINE.conn=s.conn||ONLINE.conn;
  for(const f of (s.fx||[])) if(f.k==='arrow')ARROWS.q.push(f.n); else if(f.k==='lvlup')UPS.q.push(f.n); else if(f.k==='reveal')REV.q.push(f.n); else sfx(f.k,f.n,true);
  if(!wasOver&&G.over) gameOverSound();
  render();
}
function onlineAct(ds){
  if(!humanTurn()||UI.busy) return false;
  let m=null;
  if(ds.draw) m={k:'draw',l:+ds.draw};
  else if(ds.play) m={k:'play',uid:+ds.play};
  else if(ds.ab){const [u,i]=ds.ab.split(':').map(Number);m={k:'ab',uid:u,i}}
  else if(ds.act) m={k:ds.act};
  if(!m) return false;
  UI.busy=true;render();onlineSend({t:'act',...m});
  return true;
}
function saveSession(){try{localStorage.setItem('wl-online',JSON.stringify({code:ONLINE.code,token:ONLINE.token}))}catch(e){}}
function loadSession(){try{return JSON.parse(localStorage.getItem('wl-online')||'null')}catch(e){return null}}
function clearSession(){try{localStorage.removeItem('wl-online')}catch(e){}}
function playerName(){try{return (localStorage.getItem('wl-name')||'').slice(0,18)}catch(e){return ''}}
function onlineConnect(code,name){
  if(ONLINE.ws){try{ONLINE.ws.onclose=null;ONLINE.ws.close()}catch(e){}}
  const sess=loadSession();
  const token=sess&&sess.code===code?sess.token:'';
  ONLINE.active=true;ONLINE.code=code;ONLINE.error='';ONLINE.status='Connecting…';
  if(!G||G.mode!=='online')ONLINE.lobby=true;
  render();
  const url=`${location.protocol==='https:'?'wss':'ws'}://${location.host}/api/room/${code}/ws?token=${encodeURIComponent(token)}&name=${encodeURIComponent(name||'')}`;
  const ws=new WebSocket(url);ONLINE.ws=ws;
  ws.onopen=()=>{ONLINE.status='Connected';ONLINE.retry=0;render()};
  ws.onmessage=e=>{
    let m;try{m=JSON.parse(e.data)}catch(err){return}
    if(m.t==='hello'){ONLINE.seat=m.seat;ONLINE.token=m.token;ONLINE.code=m.code;saveSession();render();return}
    if(m.t==='lobby'){ONLINE.conn=m.conn;ONLINE.names=m.names;if(!G||G.mode!=='online'){ONLINE.lobby=true;UI.menu=false}render();return}
    if(m.t==='state'){onlineSnap(m.s);return}
    if(m.t==='error'){ONLINE.error=m.msg;ONLINE.status='';if(m.fatal){clearSession();ONLINE.active=false;ONLINE.lobby=false;UI.menu=true}render();return}
  };
  ws.onclose=ev=>{
    if(ONLINE.ws!==ws) return;
    ONLINE.ws=null;
    if(!ONLINE.active) return;
    if(ev.code===4000||ev.code===4001){ONLINE.active=false;ONLINE.lobby=false;UI.menu=true;ONLINE.error=ev.code===4001?'This game was opened in another tab or on another device.':'You were disconnected after 30 minutes without activity. Choose Rejoin to continue.';render();return}
    if(ev.code>4001&&ev.code<4100){ONLINE.active=false;ONLINE.lobby=false;UI.menu=true;ONLINE.error=ev.reason||'The room was closed.';clearSession();render();return}
    ONLINE.status='Reconnecting…';render();
    const wait=Math.min(10000,800*Math.pow(1.6,ONLINE.retry++));
    setTimeout(()=>{if(ONLINE.active&&!ONLINE.ws)onlineConnect(ONLINE.code,playerName())},wait);
  };
}
async function onlineCreate(name){
  ONLINE.error='';
  try{
    const r=await fetch('/api/new',{method:'POST'});
    if(!r.ok) throw new Error('create failed');
    const {code}=await r.json();
    clearSession();onlineConnect(code,name);
  }catch(e){ONLINE.error='Could not create a game. Check your connection and try again.';render()}
}
function onlineLeave(){
  ONLINE.active=false;ONLINE.lobby=false;
  if(ONLINE.ws){try{onlineSend({t:'leave'});ONLINE.ws.onclose=null;ONLINE.ws.close()}catch(e){}}
  ONLINE.ws=null;clearSession();G=null;UI.prompt=null;UI.relocate=null;UI.busy=false;UI.menu=true;render();
}
function lobbyHTML(){
  const c=ONLINE.conn||[false,false],n=ONLINE.names||[];
  const other=ONLINE.seat==null?null:1-ONLINE.seat;
  const ready=other!=null&&c[other];
  return `<div class="panel"><h2>Online game</h2>
    <p>Send this room code to your opponent. They choose <b>Join with code</b> and type it in.</p>
    <div class="code" aria-label="Room code">${esc(ONLINE.code||'')}</div>
    <div class="choices"><button class="btn" data-copycode="1">Copy code</button><button class="btn" data-leave="1">Leave</button></div>
    <p class="fine">${esc(ONLINE.status||'')}${ONLINE.seat!=null?` · You are ${esc(n[ONLINE.seat]||'Player '+(ONLINE.seat+1))}`:''}</p>
    <p>${ready?'Opponent joined. Starting…':'Waiting for your opponent to join…'}</p>
    ${ONLINE.error?`<p class="warn">${esc(ONLINE.error)}</p>`:''}</div>`;
}
function onlineMenuHTML(){
  if(!ONLINE.available) return '';
  const sess=loadSession();
  return `<div class="online"><span class="label">Online</span>
    <div class="fieldrow"><label for="nameIn">Your name</label><input id="nameIn" maxlength="18" autocomplete="nickname" value="${esc(playerName())}" placeholder="Player"></div>
    <div class="choices"><button class="btn primary" data-online="create">Create online game</button></div>
    <div class="fieldrow"><label for="codeIn">Room code</label><input id="codeIn" maxlength="6" autocomplete="off" placeholder="ABCDE" style="text-transform:uppercase"><button class="btn" data-online="join">Join with code</button></div>
    ${sess&&sess.code?`<div class="choices"><button class="btn" data-online="rejoin">Rejoin room ${esc(sess.code)}</button></div>`:''}
    ${ONLINE.error?`<p class="warn">${esc(ONLINE.error)}</p>`:''}</div>`;
}
function readName(){
  const el=HAS_DOM&&document.getElementById('nameIn');
  let n=el?el.value.trim().replace(/\s+/g,' ').slice(0,18):playerName();
  if(/^you$/i.test(n)) n='';
  try{localStorage.setItem('wl-name',n)}catch(e){}
  return n;
}

if(HAS_DOM){
  setInterval(()=>{const el=$('turnclock');if(el&&G)el.textContent=fmtClock(turnElapsed())},500);
  const syncSound=()=>{const b=$('soundBtn');if(b){b.textContent=SFX.on?'Sound on':'Sound off';b.setAttribute('aria-pressed',String(SFX.on))}};
  syncSound();
  document.addEventListener('pointerdown',()=>{if(SFX.on)audioCtx()});
  document.addEventListener('keydown',()=>{if(SFX.on)audioCtx()});
  document.addEventListener('click',e=>{
    const tst=G&&G.tut&&!G.tut.free?TUT_STEPS[G.tut.step]:null;
    const badReloc=tst&&tst.relocExact&&e.target.closest('[data-rlok]')&&!tutRelocOK();
    if(G&&G.tut&&!G.tut.free&&(badReloc||!tutAllows(e.target))){e.stopPropagation();e.preventDefault();const c=$('coach');if(c)c.animate([{transform:'translateX(0)'},{transform:'translateX(-6px)'},{transform:'translateX(6px)'},{transform:'translateX(0)'}],{duration:260});}
  },true);
  document.addEventListener('click',e=>{
    if(e.target.closest('[data-discard]')){UI.dview=!UI.dview;syncDiscard();return}
    if(e.target.closest('[data-dclose]')||e.target.id==='discardView'){UI.dview=false;syncDiscard();return}
    if(e.target.closest('#soundBtn')){SFX.on=!SFX.on;try{localStorage.setItem('tb-sound',SFX.on?'on':'off')}catch(err){}if(SFX.on){audioCtx();setTimeout(()=>sfx('place',1),30)}syncSound();return}
    const st=e.target.closest('[data-site]');
    const t=(st&&UI.prompt&&UI.prompt.kind==='site')?st:e.target.closest('button,[data-site]'); if(!t) return;
    const ds=t.dataset;
    if(ds.online==='create'){const n=readName();onlineCreate(n);return}
    if(ds.online==='join'){const n=readName();const el=document.getElementById('codeIn');const code=(el?el.value:'').trim().toUpperCase().replace(/[^A-Z0-9]/g,'');if(code.length<4){ONLINE.error='Type the room code your opponent sent you.';render();return}clearSession();onlineConnect(code,n);return}
    if(ds.online==='rejoin'){const sess=loadSession();if(sess)onlineConnect(sess.code,readName());return}
    if(ds.online==='rematch'){onlineSend({t:'rematch'});return}
    if(ds.leave){onlineLeave();return}
    if(ds.copycode){const c=ONLINE.code||'';(navigator.clipboard?navigator.clipboard.writeText(c):Promise.reject()).then(()=>{t.textContent='Copied'}).catch(()=>{t.textContent=c});return}
    if(ds.new){if(ONLINE.active)onlineLeave();UI.closedOver=false;if(ds.new==='tutorial')newGame('ai','tutorial');else newGame(ds.new);return}
    if(ds.tut==='next'){tutAdvance();return}
    if(ds.resume){UI.menu=false;render();return}
    if(ds.menu){UI.menu=true;UI.closedOver=false;render();return}
    if(ds.close){UI.closedOver=true;render();return}
    if(ds.curtain){UI.curtain=false;render();return}
    if(t.id==='menuBtn'){UI.menu=!UI.menu||(!G&&!ONLINE.lobby);render();return}
    if(!G) return;
    if(ds.opt!==undefined&&UI.prompt){UI.prompt.resolve(UI.prompt.options[+ds.opt].value);return}
    if(ds.extra!==undefined&&UI.prompt){UI.prompt.resolve(UI.prompt.extra[+ds.extra].value);return}
    if(ds.cancel&&UI.prompt){UI.prompt.resolve(null);return}
    if(ds.slot!==undefined&&UI.prompt&&UI.prompt.kind==='slot'){UI.prompt.resolve(+ds.slot);return}
    if(ds.site&&UI.prompt&&UI.prompt.kind==='site'){const s=allSites().find(x=>x.uid===+ds.site);if(s)UI.prompt.resolve(s);return}
    if(ds.pick&&UI.prompt&&UI.prompt.kind==='hand'){const k=G.players[UI.prompt.pi].hand.find(x=>x.uid===+ds.pick);if(k)UI.prompt.resolve(k);return}
    if(UI.relocate){
      const r=UI.relocate;
      if(ds.rl){const uid=+ds.rl.slice(1),dir=ds.rl[0]==='-'?-1:1;if(rlCan(r,uid,dir)){r.counts[uid]+=dir;r.pool-=dir}render();return}
      if(ds.rlx&&!r.forced){r.resolve(null);return}
      if(ds.rlok){r.resolve({...r.counts});return}
      return;
    }
    if(UI.prompt) return;
    if(G.mode==='online'){onlineAct(ds);return}
    const pi=viewer();
    if(!humanTurn()) return;
    if(ds.draw){human(()=>actDraw(pi,+ds.draw));return}
    if(ds.play){const c=G.players[pi].hand.find(x=>x.uid===+ds.play);if(c&&canPlay(pi,c))human(()=>playCard(pi,c));return}
    if(ds.ab){const[u,i]=ds.ab.split(':').map(Number);const s=G.players[pi].sites.find(x=>x.uid===u);if(s)human(()=>useAbility(pi,s,i));return}
    if(ds.act==='gain'){human(()=>actGain(pi));return}
    if(ds.act==='upgrade'){human(async()=>actUpgrade(pi));return}
    if(ds.act==='relocate'){human(async()=>{const c=await relocatePrompt(pi,{mode:'full',title:'Relocate followers',cost:'Costs 1 action'});if(c)actRelocate(pi,c)});return}
    if(ds.act==='end'){if(!UI.busy)endTurn();return}
  });
  document.addEventListener('keydown',e=>{
    if((e.key==='Enter'||e.key===' ')&&e.target.dataset&&e.target.dataset.site){e.preventDefault();e.target.click()}
    if(e.key==='Escape'&&UI.dview){UI.dview=false;syncDiscard();return}
    if(e.key==='Escape'&&UI.prompt&&UI.prompt.cancellable)UI.prompt.resolve(null);
  });
  addEventListener('resize',()=>{if(G)equalizeCards()});
  /* Hovering a card in your hand shows its full ability text (the board-style 2-line cap is lifted),
   and raises the card far enough to show all of it */
document.addEventListener('mouseover',e=>{
  const hc=e.target.closest&&e.target.closest('#handDock .card');
  for(const c of document.querySelectorAll('#handDock .card.full'))if(c!==hc){c.classList.remove('full');c.style.setProperty('--lift',c.dataset.lift0||c.style.getPropertyValue('--lift'))}
  if(hc&&!hc.classList.contains('full')){hc.dataset.lift0=hc.style.getPropertyValue('--lift');hc.classList.add('full');
    const z=parseFloat(hc.style.zoom)||1;hc.style.setProperty('--lift',Math.max(0,hc.offsetHeight-DOCK_PEEK/z)+'px')}
});
document.addEventListener('mouseover',e=>{const dc=e.target.closest&&e.target.closest('[data-dcard]');if(dc){showDiscardZoom(dc);return}{const z=$('zoom');if(z)z.classList.remove('over-dialog')}if(UI.prompt&&UI.prompt.kind==='hand'){const z=$('zoom');if(z)z.hidden=true;return}const at=e.target.closest&&e.target.closest('#app [data-atts]');if(at){showAttZoom(at);return}const el=e.target.closest&&e.target.closest('#app [data-suid]');const z=$('zoom');if(el)showZoom(el);else if(z&&!z.hidden)z.hidden=true});
  document.addEventListener('scroll',()=>{const z=$('zoom');if(z)z.hidden=true},true);
  render();
  if(/^https?:$/.test(location.protocol)) fetch('/api/ping').then(r=>r.ok?r.json():null).then(j=>{
    if(!j||!j.warplands) return;
    ONLINE.available=true;
    const sess=loadSession();
    if(sess&&sess.code) onlineConnect(sess.code,playerName()); else render();
  }).catch(()=>{});
}
return {
  newOnline:()=>newGame('online'),
  load:serverLoad,
  snapshot:pi=>snapshot(pi,false),
  full:()=>snapshot(null,true),
  act:serverAct,
  answer:serverAnswer,
  safe:safePoint,
  hasGame:()=>!!G,
  isOver:()=>!!(G&&G.over)
};

}
