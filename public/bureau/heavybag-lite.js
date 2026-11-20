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
let state=read(),booted=false,timer=0,ticks=0,notice="",audioCtx=null,soundOn=false,combo=0,lastPunchAt=0,lastSaveAt=0;
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
function save(){try{localStorage.setItem(KEY,JSON.stringify(state))}catch(e){}}
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
 '<div class="hbl-stage"><div class="hbl-stage-glow" aria-hidden="true"></div><div class="hbl-chain"></div>'+
 '<button id="hbl-bag" class="hbl-bag" data-action="punch" type="button" aria-label="Punch the heavy bag and earn credits">'+
 '<span class="hbl-bag-body"><span class="hbl-bag-stitch" aria-hidden="true"></span><span class="hbl-bag-logo">HEAVY<br>BAG</span><span class="hbl-bag-band"></span></span></button>'+
 '<span class="hbl-shadow"></span><span class="hbl-pop" id="hbl-pop" aria-hidden="true"></span></div>'+
 '<div class="hbl-bag-caption"><strong>HIT TO EARN</strong><span id="hbl-value">+1 credit per punch</span><b id="hbl-combo" class="hbl-combo" hidden></b></div>'+
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
function journey(){
 return '<div class="hbl-panel hbl-journey"><div class="hbl-panel-head"><h3>ROAD TO CHAMPION</h3><small>5 GYMS</small></div>'+
 '<div class="hbl-timeline">'+
 ['BASEMENT','LOCAL','FACTORY','ELITE','CHAMPION'].map((name,i)=>'<div class="hbl-step '+(i<state.chapter?'done':i===state.chapter?'active':'')+'"><b>'+(i<state.chapter?'✓':String(i+1).padStart(2,"0"))+'</b>'+name+'</div>').join("")+
 '</div></div>';
}
function render(){
 const root=$("content");if(!root)return;
 root.innerHTML='<div class="hbl">'+header()+'<main class="hbl-layout"><div class="hbl-left">'+bag()+objective()+'</div><div class="hbl-right">'+shopBoxers()+shopGear()+'</div></main>'+journey()+
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
 const g=goalStats();
 updateText("hbl-goal-count",g.label);
 const bar=$("hbl-goal-progress");if(bar)bar.style.width=(g.fraction*100).toFixed(1)+"%";
 if(state.chapter===4&&!state.champion){
  updateText("hbl-goal-help","Sign an Arena Deal ("+(state.counts[5]?"✓":"○")+") · Earn "+fmt(state.earned)+" / 12M total credits · Reach 80K/sec.");
 }
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
function impact(amount,automatic){
 if(automatic)return;
 const bag=$("hbl-bag"),pop=$("hbl-pop");
 if(bag){
  if(typeof bag.animate==="function"){
   bag.animate([{transform:"rotate(0deg) scale(1)"},{transform:"rotate(7deg) scale(.975)",offset:.25},{transform:"rotate(-3deg) scale(1.012)",offset:.65},{transform:"rotate(0deg) scale(1)"}],
    {duration:205,easing:"cubic-bezier(.18,.7,.2,1)"});
  }else{
   bag.classList.remove("impact");bag.classList.add("impact");
  }
 }
 if(pop){
  pop.textContent="+"+fmt(amount);
  if(typeof pop.animate==="function"){
   pop.animate([{opacity:1,transform:"translateY(0) scale(.92)"},{opacity:0,transform:"translateY(-55px) scale(1.1)"}],
    {duration:420,easing:"ease-out"});
  }else{pop.classList.remove("show");pop.classList.add("show")}
 }
}
function sound(){
 if(!soundOn)return;
 try{
  const AC=window.AudioContext||window.webkitAudioContext;
  if(!AC)return;
  if(!audioCtx)audioCtx=new AC();
  if(audioCtx.state==="suspended")audioCtx.resume().catch(()=>{});
  const o=audioCtx.createOscillator(),g=audioCtx.createGain();
  o.type="triangle";o.frequency.setValueAtTime(130,audioCtx.currentTime);
  o.frequency.exponentialRampToValueAtTime(65,audioCtx.currentTime+.085);
  g.gain.setValueAtTime(.022,audioCtx.currentTime);
  g.gain.exponentialRampToValueAtTime(.0001,audioCtx.currentTime+.09);
  o.connect(g);g.connect(audioCtx.destination);o.start();o.stop(audioCtx.currentTime+.09);
 }catch(e){}
}
function punch(){
 settle(Date.now());
 const now=Date.now();
 combo=now-lastPunchAt<1100?Math.min(combo+1,25):1;
 lastPunchAt=now;
 const multiplier=1+Math.min(4,Math.floor((combo-1)/5));
 const amount=punchValue()*multiplier;
 earn(amount);state.punches++;
 sound();try{navigator.vibrate?.(10)}catch(e){}
 impact(amount,false);
 const grown=milestones();
 if(grown)render();else sync();
 if(grown||Date.now()-lastSaveAt>3000){save();lastSaveAt=Date.now()}
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
 if(++ticks%75===0||grown){save();lastSaveAt=Date.now()}
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
document.addEventListener("click",event=>{
 const btn=event.target&&event.target.closest?event.target.closest("[data-action]"):null;
 if(!btn||!booted)return;
 const action=btn.getAttribute("data-action");
 if(action==="punch")punch();
 else if(action==="hire")hire(Number(btn.getAttribute("data-index")));
 else if(action==="gear")buyGear(Number(btn.getAttribute("data-index")));
 else if(action==="dismiss"){notice="";sync()}
 else if(action==="sound"){soundOn=!soundOn;render()}
 else if(action==="reset"){
  if(window.confirm("Restart Heavy Bag from zero? This resets only this new Idle Boxing save.")){
   state=fresh();combo=0;lastPunchAt=0;notice="NEW START · 12 CREDITS TO YOUR FIRST ROOKIE";
   save();render();
  }
 }
});
document.addEventListener("visibilitychange",()=>{
 if(!booted)return;
 if(document.hidden){settle(Date.now());save();stopTimer()}
 else {tick();startTimer()}
});
window.addEventListener("pagehide",()=>{if(!booted)return;settle(Date.now());save();stopTimer()});
})();