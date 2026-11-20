/* HEAVY BAG — IDLE BOXING
 * Fast tap feedback, escalating combo power and early idle momentum.
 * Interval only updates balances; visuals animate on player input.
 * Existing arcade/idle save data is intentionally kept under its original keys.
 */
(function(){
"use strict";
const KEY="the-bureau-heavybag-lite-v1";
const LIMIT_MS=8*60*60*1000,MAX_CREDITS=1e15;
const GYMS=[
 {name:"THE BASEMENT",desc:"One bag. No shortcuts.",goal:6,bonus:30},
 {name:"THE LOCAL CLUB",desc:"Your first real boxing gym.",goal:100,bonus:300},
 {name:"THE FIGHT FACTORY",desc:"The gym starts to grow.",goal:1800,bonus:3000},
 {name:"THE ELITE GYM",desc:"Train with the best.",goal:20000,bonus:30000},
 {name:"THE CHAMPIONSHIP",desc:"Build the world's best boxing club.",goal:80000,bonus:0}
];
const BOXERS=[
 {name:"Rookie",icon:"🥊",income:2,cost:12,chapter:0,detail:"Your first helper."},
 {name:"Pad Holder",icon:"✋",income:12,cost:90,chapter:1,detail:"Keeps the drills moving."},
 {name:"Sparring Partner",icon:"⚡",income:65,cost:650,chapter:1,detail:"Trains alongside you."},
 {name:"Coach",icon:"★",income:360,cost:5800,chapter:2,detail:"Runs the training sessions."},
 {name:"Fight Camp",icon:"◆",income:2600,cost:52000,chapter:3,detail:"A full camp working for you."},
 {name:"Arena Deal",icon:"🏆",income:16500,cost:460000,chapter:4,detail:"The biggest stage."}
];
const GEAR=[
 {name:"Hand Wraps",icon:"▤",cost:36,bonus:2,chapter:0,detail:"+2 credits per punch"},
 {name:"Pro Gloves",icon:"🥊",cost:390,bonus:6,chapter:1,detail:"+6 credits per punch"},
 {name:"Power Punch",icon:"⚡",cost:4800,bonus:25,chapter:2,detail:"+25 credits per punch"}
];
const $=id=>document.getElementById(id);
const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
function safe(n,min,max){const v=Number(n);return Number.isFinite(v)?clamp(v,min,max):min}
function fmt(n){
 n=Math.max(0,Math.floor(n));
 if(n>=1e12)return +(n/1e12).toFixed(2)+"T";
 if(n>=1e9)return +(n/1e9).toFixed(2)+"B";
 if(n>=1e6)return +(n/1e6).toFixed(2)+"M";
 if(n>=1e4)return +(n/1e3).toFixed(1)+"K";
 return n.toLocaleString("en-US");
}
function fresh(){return{credits:0,earned:0,punches:0,counts:[0,0,0,0,0,0],gear:[false,false,false],chapter:0,champion:false,lastTick:Date.now()}}
function read(){
 const d=fresh();let s;
 try{s=JSON.parse(localStorage.getItem(KEY)||"null")}catch(e){}
 if(!s||typeof s!=="object")return d;
 d.credits=safe(s.credits,0,MAX_CREDITS);
 d.earned=safe(s.earned,0,MAX_CREDITS);
 d.punches=Math.floor(safe(s.punches,0,1e12));
 if(Array.isArray(s.counts))d.counts=d.counts.map((v,i)=>Math.floor(safe(s.counts[i],0,100000)));
 if(Array.isArray(s.gear))d.gear=d.gear.map((v,i)=>s.gear[i]===true);
 d.chapter=Math.floor(safe(s.chapter,0,4));
 d.champion=s.champion===true;
 d.lastTick=safe(s.lastTick,0,Date.now());
 return d;
}
let savedSound;try{savedSound=localStorage.getItem("the-bureau-heavybag-sound-v1")}catch(e){}
let state=read(),booted=false,timer=0,ticks=0,notice="",audioCtx=null,soundOn=savedSound!=="off",combo=0,lastPunchAt=0,lastSaveAt=0,dirty=false,lastPointerTapAt=0,bagAnimation=null,popAnimation=null,noiseBuffer=null;
function count(){return state.counts.reduce((n,v)=>n+v,0)}
function rate(){
 let total=0;
 for(let i=0;i<BOXERS.length;i++)total+=state.counts[i]*BOXERS[i].income;
 return Math.min(1e12,total);
}
function punchValue(){return 1+GEAR.reduce((sum,g,i)=>sum+(state.gear[i]?g.bonus:0),0)}
function price(i){return Math.min(MAX_CREDITS,Math.ceil(BOXERS[i].cost*Math.pow(1.16,state.counts[i])))}
function earn(n){if(n>0&&Number.isFinite(n)){state.credits=Math.min(MAX_CREDITS,state.credits+n);state.earned=Math.min(MAX_CREDITS,state.earned+n)}}
function settle(now){
 const elapsed=clamp(now-state.lastTick,0,LIMIT_MS);
 const gained=elapsed?rate()*elapsed/1000:0;
 earn(gained);
 state.lastTick=now;
 return gained;
}
function save(){try{localStorage.setItem(KEY,JSON.stringify(state));dirty=false;lastSaveAt=Date.now()}catch(e){}}
function milestones(){
 let changed=false,unlocked=[];
 for(let j=0;j<5;j++){
  if(state.chapter<4&&rate()>=GYMS[state.chapter].goal){
    const old=state.chapter;
    state.chapter++;earn(GYMS[old].bonus);changed=true;
    unlocked.push("★ "+GYMS[state.chapter].name+" UNLOCKED · +"+fmt(GYMS[old].bonus)+" C");
    continue;
  }
  break;
 }
 if(!state.champion&&state.chapter===4&&state.counts[5]>=1&&rate()>=GYMS[4].goal&&state.earned>=12000000){
   state.champion=true;changed=true;unlocked.push("🏆 WORLD CHAMPION · YOU BUILT THE ULTIMATE GYM");
 }
 if(unlocked.length)notice=unlocked.join("  ·  ");
 return changed;
}
function header(){
 return '<div class="hbl-head"><div><div class="hbl-kicker">THE BUREAU / IDLE ARCADE</div><h1>HEAVY BAG<span>.</span></h1><p>Start with your own punches. Build your gym, one punch at a time.</p></div><span class="hbl-pill" id="hbl-rank"></span></div>'+
 '<div class="hbl-stats">'+
 '<div class="hbl-stat"><small>CREDITS</small><strong id="hbl-credits">0</strong></div>'+
 '<div class="hbl-stat"><small>AUTO / SEC</small><strong id="hbl-rate" class="green">0</strong></div>'+
 '<div class="hbl-stat"><small>HELPERS</small><strong id="hbl-boxers">0</strong></div>'+
 '<div class="hbl-stat hbl-stat-punches"><small>TOTAL HITS</small><strong id="hbl-punches">0</strong></div>'+
 '</div><div class="hbl-notice" id="hbl-notice" hidden><span id="hbl-notice-text"></span><button type="button" data-action="dismiss" aria-label="Dismiss message">✕</button></div>';
}
function bag(){
 const gym=GYMS[state.chapter],auto=count()>0;
 return '<div class="hbl-arena" data-chapter="'+state.chapter+'">'+
 '<div class="hbl-arena-top"><span>GYM '+String(state.chapter+1).padStart(2,"0")+' / 05</span><span>'+(auto?'● TRAINING ACTIVE':'● MANUAL TRAINING')+'</span></div>'+
 '<h2>'+gym.name+'</h2><p class="subtitle">'+gym.desc+'</p>'+
 '<div class="hbl-stage" id="hbl-stage"><div class="hbl-stage-glow" aria-hidden="true"></div><span class="hbl-impact-flash" id="hbl-impact-flash" aria-hidden="true"></span><span class="hbl-impact-ring" id="hbl-impact-ring" aria-hidden="true"></span><span class="hbl-impact-word" id="hbl-impact-word" aria-hidden="true"></span><div class="hbl-chain"></div>'+
 '<button id="hbl-bag" class="hbl-bag" data-action="punch" type="button" aria-label="Punch the heavy bag and earn credits">'+
 '<span class="hbl-bag-body"><span class="hbl-bag-stitch" aria-hidden="true"></span><span class="hbl-bag-logo">HEAVY<br>BAG</span><span class="hbl-bag-band"></span></span></button>'+
 '<span class="hbl-shadow"></span><span class="hbl-pop" id="hbl-pop" aria-hidden="true"></span></div>'+
 '<div class="hbl-bag-caption"><strong>HIT TO EARN</strong><span id="hbl-value">+1 credit per punch</span><b id="hbl-combo" class="hbl-combo" hidden></b></div>'+
 '<div class="hbl-fury"><div class="hbl-fury-top"><span id="hbl-fury-title">BUILD YOUR COMBO</span><b id="hbl-fury-hits">POWER SHOT IN 8</b></div><div class="hbl-fury-track"><span id="hbl-fury-fill"></span></div><small>SPACE / CLICK / TAP TO PUNCH · CHAIN 8 HITS FOR A POWER SHOT</small></div>'+
 '<div class="hbl-auto'+(auto?' on':'')+'" id="hbl-auto"><i></i><span>'+(auto?'AUTO TRAINING ACTIVE · YOUR TEAM EARNS WHILE YOU ARE AWAY':'NO AUTO TRAINING YET · 12 CREDITS TO HIRE YOUR FIRST ROOKIE')+'</span></div></div>';
}
function objective(){
 const gym=GYMS[state.chapter];
 const complete=state.champion,final=state.chapter===4;
 const goalText=complete?"THE UNDISPUTED CLUB":final?"Become World Champion":"Unlock "+GYMS[state.chapter+1].name;
 const hint=complete?"You have completed the game. Your gym stays yours.":final?
  "Reach 80K credits/sec, earn 12M total credits and sign an Arena Deal.":
  "Grow your automatic income. The next gym unlocks automatically.";
 return '<div class="hbl-panel"><div class="hbl-panel-head"><h3>YOUR NEXT GOAL</h3><small>'+(complete?"COMPLETED":String(state.chapter+1).padStart(2,"0")+" / 05")+'</small></div>'+
 '<div class="hbl-goal-label"><span>'+goalText+'</span><b id="hbl-goal-count"></b></div>'+
 '<div class="hbl-bar"><span id="hbl-goal-progress"></span></div>'+
 '<p class="hbl-small" id="hbl-goal-help">'+hint+'</p>'+
 (complete?'<div class="hbl-trophy">🏆 WORLD CHAMPION<br>THE UNDISPUTED CLUB</div>':'')+
 '</div>';
}
function shopBoxers(){
 let rows="";
 BOXERS.forEach((b,i)=>{
   if(b.chapter>state.chapter+1)return;
   const locked=b.chapter>state.chapter,p=price(i);
   rows+='<div class="hbl-item'+(locked?' hbl-locked':'')+'"><span class="hbl-symbol">'+b.icon+'</span>'+
   '<div><strong>'+b.name+(state.counts[i]?' ×'+state.counts[i]:'')+'</strong>'+
   '<small>'+(locked?'AVAILABLE AT GYM '+(b.chapter+1):'+'+fmt(b.income)+'/SEC EACH')+'</small></div>'+
   '<button class="hbl-buy" type="button" data-action="hire" data-index="'+i+'"'+(locked||state.credits+1e-7<p?' disabled':'')+'>'+(locked?'LOCKED':fmt(p)+' C')+'</button></div>';
 });
 return '<div class="hbl-panel hbl-shop-panel"><div class="hbl-panel-head"><h3>AUTO TRAINING</h3><small>'+count()+' ACTIVE</small></div><div class="hbl-shop">'+rows+'</div></div>';
}
function shopGear(){
 let rows="";
 GEAR.forEach((g,i)=>{
   if(g.chapter>state.chapter+1)return;
   const done=state.gear[i],locked=GEAR[i].chapter>state.chapter;
   rows+='<div class="hbl-item'+(locked?' hbl-locked':'')+'"><span class="hbl-symbol">'+g.icon+'</span>'+
   '<div><strong>'+g.name+'</strong><small>'+g.detail+'</small></div>'+
   '<button class="hbl-buy'+(done?' hbl-bought':'')+'" data-action="gear" data-index="'+i+'" type="button"'+(done||locked||state.credits+1e-7<g.cost?' disabled':'')+'>'+(done?'OWNED':locked?'LOCKED':fmt(g.cost)+' C')+'</button></div>';
 });
 return '<div class="hbl-panel hbl-shop-panel"><div class="hbl-panel-head"><h3>PUNCH POWER</h3><small>PERMANENT</small></div><div class="hbl-shop">'+rows+'</div></div>';
}
function recommended(){
 const options=[];
 BOXERS.forEach((b,i)=>{
  if(b.chapter<=state.chapter)options.push({action:"hire",index:i,name:b.name,cost:price(i),gain:b.income,unit:"/ SEC"});
 });
 GEAR.forEach((g,i)=>{
  if(!state.gear[i]&&g.chapter<=state.chapter)options.push({action:"gear",index:i,name:g.name,cost:g.cost,gain:g.bonus*2,unit:"/ HIT"});
 });
 if(!options.length)return null;
 const affordable=options.filter(o=>o.cost<=state.credits+1e-7);
 if(affordable.length){
  affordable.sort((a,b)=>(a.cost/a.gain)-(b.cost/b.gain)||a.cost-b.cost);
  return affordable[0];
 }
 options.sort((a,b)=>a.cost-b.cost);
 return options[0];
}
function quickBar(){
 return '<div class="hbl-quick" id="hbl-quick">'+
  '<div class="hbl-quick-info"><small>YOUR NEXT UPGRADE</small><strong id="hbl-quick-name">Rookie</strong>'+
  '<span id="hbl-quick-progress">0 / 12 C</span></div>'+
  '<button type="button" class="hbl-quick-button" id="hbl-quick-buy" data-action="hire" data-index="0" disabled>12 C</button>'+
  '<span class="hbl-quick-track"><span id="hbl-quick-fill"></span></span></div>';
}
function journey(){
 return '<div class="hbl-panel hbl-journey"><div class="hbl-panel-head"><h3>ROAD TO CHAMPION</h3><small>5 GYMS</small></div>'+
 '<div class="hbl-timeline">'+
 ['BASEMENT','LOCAL','FACTORY','ELITE','CHAMPION'].map((name,i)=>'<div class="hbl-step '+(i<state.chapter?'done':i===state.chapter?'active':'')+'"><b>'+(i<state.chapter?'✓':String(i+1).padStart(2,"0"))+'</b>'+name+'</div>').join("")+
 '</div></div>';
}
function render(){
 const root=$("content");if(!root)return;
 root.innerHTML='<div class="hbl">'+header()+'<main class="hbl-layout"><div class="hbl-left">'+bag()+objective()+'</div><div class="hbl-right">'+shopBoxers()+shopGear()+'</div></main>'+journey()+quickBar()+
 '<footer class="hbl-footer"><span>UP TO 8 HOURS OFFLINE EARNINGS · SAVED ON THIS DEVICE</span>'+
 '<div><button type="button" id="hbl-sound" class="hbl-reset" data-action="sound">SOUND '+(soundOn?'ON':'OFF')+'</button> &nbsp;·&nbsp; <button type="button" class="hbl-reset" data-action="reset">RESTART FROM ZERO</button></div></footer></div>';
 sync();
}
function updateText(id,text){
 const node=$(id);if(node&&node.textContent!==text)node.textContent=text;
}
function goalStats(){
 if(state.champion)return{label:"COMPLETE",fraction:1};
 const current=rate(),target=GYMS[state.chapter].goal;
 if(state.chapter<4)return{label:fmt(current)+" / "+fmt(target)+" / SEC",fraction:clamp(current/target,0,1)};
 const one=clamp(current/target,0,1),two=clamp(state.earned/12000000,0,1),three=state.counts[5]?1:0;
 return{label:fmt(current)+" / "+fmt(target)+" / SEC",fraction:(one+two+three)/3};
}
function sync(){
 updateText("hbl-rank",state.champion?"🏆 WORLD CHAMPION":"GYM "+String(state.chapter+1).padStart(2,"0")+" / 05");
 updateText("hbl-credits",fmt(state.credits));
 updateText("hbl-rate","+"+fmt(rate()));
 updateText("hbl-boxers",fmt(count()));
 updateText("hbl-punches",fmt(state.punches));
 updateText("hbl-value","+"+fmt(punchValue())+" base / hit");
 const comboBadge=$("hbl-combo");if(comboBadge){const active=combo>1&&Date.now()-lastPunchAt<1350;comboBadge.hidden=!active;if(active)comboBadge.textContent="×"+Math.min(5,1+Math.floor((combo-1)/5))+" COMBO";}
 const heat=$("hbl-fury-fill"),title=$("hbl-fury-title"),hits=$("hbl-fury-hits");
 const activeChain=combo>0&&Date.now()-lastPunchAt<1300;
 const progress=activeChain?combo%8:0;
 if(heat)heat.style.width=((progress/8)*100).toFixed(1)+"%";
 if(title)title.textContent=activeChain?"COMBO / "+Math.min(combo,999)+" HITS":"BUILD YOUR COMBO";
 if(hits)hits.textContent=activeChain&&combo%8===0?"POWER SHOT!":"POWER SHOT IN "+(8-progress);
 const g=goalStats();
 updateText("hbl-goal-count",g.label);
 const bar=$("hbl-goal-progress");if(bar)bar.style.width=(g.fraction*100).toFixed(1)+"%";
 if(state.chapter===4&&!state.champion){
  updateText("hbl-goal-help","Sign an Arena Deal ("+(state.counts[5]?"✓":"○")+") · Earn "+fmt(state.earned)+" / 12M total credits · Reach 80K/sec.");
 }
 const next=recommended(),quick=$("hbl-quick"),quickBuy=$("hbl-quick-buy");
 if(next&&quick&&quickBuy){
  quick.hidden=false;
  updateText("hbl-quick-name",next.name);
  updateText("hbl-quick-progress",fmt(Math.min(state.credits,next.cost))+" / "+fmt(next.cost)+" C");
  const ready=state.credits+1e-7>=next.cost;
  quickBuy.disabled=!ready;
  quickBuy.setAttribute("data-action",next.action);
  quickBuy.setAttribute("data-index",String(next.index));
  quickBuy.textContent=ready?"BUY · "+fmt(next.cost)+" C":fmt(next.cost)+" C";
  quick.classList.toggle("ready",ready);
  const fill=$("hbl-quick-fill");
  if(fill)fill.style.width=(clamp(state.credits/next.cost,0,1)*100).toFixed(1)+"%";
 }else if(quick){quick.hidden=true}
 const n=$("hbl-notice");
 if(n){n.hidden=!notice;if(notice)updateText("hbl-notice-text",notice)}
 for(const b of document.querySelectorAll("[data-action='hire']")){
  const i=Number(b.getAttribute("data-index"));
  const locked=BOXERS[i].chapter>state.chapter,p=price(i),afford=state.credits+1e-7>=p;
  b.disabled=locked||!afford;
  b.textContent=locked?"LOCKED":fmt(p)+" C";
  b.closest(".hbl-item")?.classList.toggle("hbl-affordable",!locked&&afford);
 }
 for(const b of document.querySelectorAll("[data-action='gear']")){
  const i=Number(b.getAttribute("data-index"));
  const locked=GEAR[i].chapter>state.chapter,done=state.gear[i],afford=state.credits+1e-7>=GEAR[i].cost;
  b.disabled=done||locked||!afford;
  b.textContent=done?"OWNED":locked?"LOCKED":fmt(GEAR[i].cost)+" C";
  b.closest(".hbl-item")?.classList.toggle("hbl-affordable",!done&&!locked&&afford);
 }
}
function impact(amount,finisher){
 const bag=$("hbl-bag"),pop=$("hbl-pop"),stage=$("hbl-stage"),flash=$("hbl-impact-flash"),ring=$("hbl-impact-ring"),word=$("hbl-impact-word");
 if(!bag||!stage)return;
 const dir=state.punches%2?1:-1;
 if(bag.animate){
  bagAnimation?.cancel?.();
  bagAnimation=bag.animate([
   {transform:"rotate(0) scale(1)",offset:0},
   {transform:"translateX("+(-12*dir)+"px) rotate("+(-dir*(finisher?13:8))+"deg) scale("+(finisher?.92:.955)+")",offset:.12},
   {transform:"translateX("+(4*dir)+"px) rotate("+(4*dir)+"deg) scale(1.025)",offset:.60},
   {transform:"rotate(0) scale(1)",offset:1}
  ],{duration:finisher?260:172,easing:"cubic-bezier(.15,.85,.3,1)"});
 }else{bag.classList.remove("impact");void bag.offsetWidth;bag.classList.add("impact")}
 const arena=stage.closest(".hbl-arena");
 if(arena?.animate)arena.animate([
  {transform:"translateX(0)"},{transform:"translateX("+((finisher?5:2)*dir)+"px)",offset:.28},{transform:"translateX("+(-2*dir)+"px)",offset:.6},{transform:"translateX(0)"}
 ],{duration:finisher?170:95,easing:"ease-out"});
 const fx=(el,frames,ms)=>{if(el?.animate){el.getAnimations().forEach(a=>a.cancel());el.animate(frames,{duration:ms,easing:"ease-out",fill:"both"})}};
 fx(flash,[{opacity:finisher?.7:.38},{opacity:0}],finisher?220:110);
 fx(ring,[{opacity:1,transform:"translate(-50%,-50%) scale(.3)"},{opacity:0,transform:"translate(-50%,-50%) scale("+(finisher?2:1.45)+")"}],finisher?310:195);
 if(word){word.textContent=finisher?"POWER SHOT!":"THWACK!";word.classList.toggle("is-finisher",finisher);
 fx(word,[{opacity:0,transform:"translate(-50%,-50%) scale(.7)"},{opacity:1,transform:"translate(-50%,-60%) scale(1.1)",offset:.2},{opacity:0,transform:"translate(-50%,-92%) scale(1)"}],finisher?420:285)}
 if(pop){pop.textContent=(finisher?"CRITICAL ":"")+"+"+fmt(amount);pop.classList.toggle("is-finisher",finisher);
  if(pop.animate){popAnimation?.cancel?.();popAnimation=pop.animate([
   {opacity:1,transform:"translateY(0) scale("+(finisher?1.25:1)+")"},{opacity:0,transform:"translateY(-65px) scale(.96)"}
  ],{duration:finisher?455:325,easing:"ease-out",fill:"both"})}
  else{pop.classList.remove("show");void pop.offsetWidth;pop.classList.add("show")}}
 if(window.matchMedia?.("(prefers-reduced-motion: reduce)").matches)return;
 for(let i=0;i<(finisher?11:5);i++){
  const dot=document.createElement("i");dot.className="hbl-spark";
  dot.style.left=(50+(Math.random()-.5)*8)+"%";dot.style.top=(48+(Math.random()-.5)*10)+"%";
  dot.style.setProperty("--dx",Math.round((Math.random()-.5)*(finisher?195:110))+"px");
  dot.style.setProperty("--dy",Math.round((Math.random()-.5)*(finisher?160:105))+"px");
  stage.appendChild(dot);setTimeout(()=>dot.remove(),410);
 }
}
function sound(finisher){
 if(!soundOn)return;
 try{
  const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;
  if(!audioCtx)audioCtx=new AC();
  if(audioCtx.state==="suspended")audioCtx.resume().catch(()=>{});
  const t=audioCtx.currentTime;
  if(!noiseBuffer){noiseBuffer=audioCtx.createBuffer(1,Math.round(audioCtx.sampleRate*.09),audioCtx.sampleRate);
   const d=noiseBuffer.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/d.length,2.4)}
  const n=audioCtx.createBufferSource(),f=audioCtx.createBiquadFilter(),g=audioCtx.createGain();
  n.buffer=noiseBuffer;f.type="bandpass";f.frequency.value=finisher?1250:850;f.Q.value=.7;
  g.gain.setValueAtTime(finisher?.09:.060,t);g.gain.exponentialRampToValueAtTime(.0001,t+.095);
  n.connect(f);f.connect(g);g.connect(audioCtx.destination);n.start(t);n.stop(t+.09);
  const o=audioCtx.createOscillator(),bass=audioCtx.createGain();o.type="sine";
  o.frequency.setValueAtTime(finisher?185:145,t);o.frequency.exponentialRampToValueAtTime(64,t+.11);
  bass.gain.setValueAtTime(finisher?.105:.06,t);bass.gain.exponentialRampToValueAtTime(.0001,t+.13);
  o.connect(bass);bass.connect(audioCtx.destination);o.start(t);o.stop(t+.135);
 }catch(e){}
}
function punch(){
 settle(Date.now());
 const now=Date.now();
 combo=now-lastPunchAt<1300?Math.min(combo+1,999):1;lastPunchAt=now;
 const finisher=combo%8===0;
 const multiplier=1+Math.min(4,Math.floor((combo-1)/5));
 const amount=punchValue()*multiplier*(finisher?3:1);
 earn(amount);state.punches++;dirty=true;
 sound(finisher);try{navigator.vibrate?.(finisher?[10,15,20]:8)}catch(e){}
 impact(amount,finisher);
 const grown=milestones();if(grown)render();else sync();
 if(grown||finisher||state.punches===1||state.punches%4===0||Date.now()-lastSaveAt>1200)save();
}
function hire(i){
 if(!Number.isInteger(i)||i<0||i>=BOXERS.length||BOXERS[i].chapter>state.chapter)return;
 settle(Date.now());
 const p=price(i);
 if(p>state.credits+1e-7)return;
 state.credits-=p;state.counts[i]++;
 if(i===0&&count()===1)notice="🥊 FIRST HELPER HIRED · AUTOMATIC TRAINING IS ON!";
 else notice=BOXERS[i].name+" HIRED · +"+fmt(BOXERS[i].income)+"/SEC";
 milestones();save();render();
}
function buyGear(i){
 if(!Number.isInteger(i)||i<0||i>=GEAR.length||state.gear[i]||GEAR[i].chapter>state.chapter)return;
 settle(Date.now());
 const p=GEAR[i].cost;
 if(p>state.credits+1e-7)return;
 state.credits-=p;state.gear[i]=true;
 notice="★ "+GEAR[i].name.toUpperCase()+" INSTALLED · PUNCH POWER UP!";
 milestones();save();render();
}
function tick(){
 if(!booted||document.hidden)return;
 const now=Date.now(),delta=now-state.lastTick;
 const amount=settle(now);
 if(delta>=10000&&amount>0)notice="WELCOME BACK · +"+fmt(amount)+" C EARNED WHILE AWAY";
 const grown=milestones();
 if(grown)render();
 else sync();
 if(grown||(dirty&&now-lastSaveAt>1200)||++ticks%75===0)save();
}
function startTimer(){if(!timer&&!document.hidden)timer=setInterval(tick,200)}
function stopTimer(){if(timer){clearInterval(timer);timer=0}}
function boot(){
 if(booted)return;
 booted=true;
 const elapsed=clamp(Date.now()-state.lastTick,0,LIMIT_MS);
 const money=settle(Date.now());
 if(elapsed>=10000&&money>0)notice="WELCOME BACK · +"+fmt(money)+" C EARNED OFFLINE";
 milestones();
 save();render();startTimer();
}
window.openHeavyBag=boot;
document.addEventListener("pointerdown",event=>{
 if(!booted||event.button!==0)return;
 const btn=event.target?.closest?.("[data-action='punch']");
 if(!btn||btn.disabled)return;
 lastPointerTapAt=Date.now();
 punch();
},{passive:true});
document.addEventListener("click",event=>{
 const btn=event.target&&event.target.closest?event.target.closest("[data-action]"):null;
 if(!btn||!booted)return;
 const action=btn.getAttribute("data-action");
 if(action==="punch"){if(Date.now()-lastPointerTapAt>=650||!event.detail)punch()}
 else if(action==="hire")hire(Number(btn.getAttribute("data-index")));
 else if(action==="gear")buyGear(Number(btn.getAttribute("data-index")));
 else if(action==="dismiss"){notice="";sync()}
 else if(action==="sound"){soundOn=!soundOn;try{localStorage.setItem("the-bureau-heavybag-sound-v1",soundOn?"on":"off")}catch(e){}render()}
 else if(action==="reset"){
  if(window.confirm("Restart Heavy Bag from zero? This resets only this new Idle Boxing save.")){
   state=fresh();combo=0;lastPunchAt=0;notice="NEW START · 12 CREDITS TO YOUR FIRST ROOKIE";
   save();render();
  }
 }
});
document.addEventListener("keydown",event=>{
 if(event.code!=="Space"||event.repeat||!booted)return;
 const el=event.target;
 if(el instanceof HTMLInputElement||el instanceof HTMLTextAreaElement||el instanceof HTMLSelectElement||el?.isContentEditable)return;
 if(el instanceof HTMLElement&&el.closest("button:not(#hbl-bag),a"))return;
 event.preventDefault();punch();
});
document.addEventListener("visibilitychange",()=>{
 if(!booted)return;
 if(document.hidden){settle(Date.now());save();stopTimer()}
 else {tick();save();startTimer()}
});
window.addEventListener("pagehide",()=>{if(!booted)return;settle(Date.now());save();stopTimer()});
})();