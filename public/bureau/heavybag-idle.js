/* HEAVY BAG — ROAD TO CHAMPION | idle-first game
   One small timer while visible, no frame loop, no assets or third-party libs. */
(function(){
"use strict";
var KEY="the-bureau-heavybag-idle-v1";
var LEGACY="the-bureau-heavybag-arcade-v1";
var OFFLINE_LIMIT=8*60*60*1000;
var CHAPTERS=[
 {name:"THE BASEMENT",subtitle:"A single bag. A big ambition."},
 {name:"THE LOCAL CLUB",subtitle:"Your first proper boxing team."},
 {name:"THE FIGHT FACTORY",subtitle:"Turn training into a machine."},
 {name:"THE ELITE GYM",subtitle:"Build a world-class operation."},
 {name:"THE CHAMPIONSHIP",subtitle:"One final milestone: The Undisputed Club."}
];
var BOXERS=[
 {name:"Rookie",base:1,cost:70,chapter:0,affinity:"SPEED"},
 {name:"Amateur",base:4,cost:180,chapter:0,affinity:"STAMINA"},
 {name:"Professional",base:20,cost:2400,chapter:1,affinity:"POWER"},
 {name:"Specialist",base:110,cost:35000,chapter:2,affinity:"STAMINA"},
 {name:"Elite Boxer",base:650,cost:650000,chapter:3,affinity:"SPEED"},
 {name:"Champion",base:3800,cost:12000000,chapter:4,affinity:"POWER"}
];
var STATIONS=["SPEED","POWER","STAMINA"];
var UPGRADES=[
 {id:"reinforced",name:"Reinforced Bag",category:"EQUIPMENT",chapter:0,cost:280,bonus:.10,detail:"Stronger training equipment"},
 {id:"extramat",name:"Extra Training Mat",category:"FACILITIES",chapter:0,cost:650,bonus:.15,detail:"More room for training"},
 {id:"doublebag",name:"Double Bag",category:"EQUIPMENT",chapter:1,cost:1400,bonus:.20,detail:"Double-station equipment"},
 {id:"assistant",name:"Assistant Coach",category:"STAFF",chapter:1,cost:1650,bonus:.12,detail:"Support every boxer"},
 {id:"ventilation",name:"Gym Ventilation",category:"FACILITIES",chapter:1,cost:7000,bonus:.20,detail:"Better training conditions"},
 {id:"ropes",name:"Speed Ropes",category:"EQUIPMENT",chapter:2,cost:12000,bonus:.25,detail:"Better warm-ups"},
 {id:"nutrition",name:"Nutrition Expert",category:"STAFF",chapter:2,cost:18000,bonus:.20,detail:"Train smarter"},
 {id:"conditioning",name:"Conditioning Coach",category:"STAFF",chapter:2,cost:62000,bonus:.25,detail:"Consistent performance"},
 {id:"secondfloor",name:"Second Floor",category:"FACILITIES",chapter:2,cost:90000,bonus:.30,detail:"Expand your club"},
 {id:"powerrack",name:"Power Rack",category:"EQUIPMENT",chapter:3,cost:115000,bonus:.30,detail:"Elite strength training"},
 {id:"prowing",name:"Pro Training Wing",category:"FACILITIES",chapter:3,cost:750000,bonus:.40,detail:"Dedicated professional area"},
 {id:"headcoach",name:"Head Coach",category:"STAFF",chapter:3,cost:950000,bonus:.35,detail:"Lead a stronger team"},
 {id:"champbags",name:"Championship Bags",category:"EQUIPMENT",chapter:4,cost:3000000,bonus:.45,detail:"World-class equipment"},
 {id:"mediastudio",name:"Media Studio",category:"FACILITIES",chapter:4,cost:9000000,bonus:.50,detail:"An international club"},
 {id:"legend",name:"Legendary Trainer",category:"STAFF",chapter:4,cost:12000000,bonus:.60,detail:"The final staff upgrade"}
];
function objective(id,title,metric,target,index){return{id:id,title:title,metric:metric,target:target,index:index||0}}
var CONTRACTS=[
 [objective("b0-earned200","Earn 200 training credits","earned",200),
  objective("b0-rookies","Recruit a second Rookie","count",2,0),
  objective("b0-amateur","Recruit an Amateur","count",1,1),
  objective("b0-income","Reach 5 credits / sec","rate",5),
  objective("b0-earned1000","Earn 1,000 training credits","earned",1000)],
 [objective("b1-pro","Hire a Professional","count",1,2),
  objective("b1-income","Reach 50 credits / sec","rate",50),
  objective("b1-stations","Fill 2 circuit stations","filled",2),
  objective("b1-upgrades","Own 3 upgrades","upgrades",3),
  objective("b1-earned","Earn 15,000 training credits","earned",15000)],
 [objective("b2-spec","Hire a Specialist","count",1,3),
  objective("b2-income","Reach 500 credits / sec","rate",500),
  objective("b2-stations","Fill all 3 stations","filled",3),
  objective("b2-upgrades","Own 6 upgrades","upgrades",6),
  objective("b2-earned","Earn 250,000 training credits","earned",250000)],
 [objective("b3-elite","Hire an Elite Boxer","count",1,4),
  objective("b3-income","Reach 3,500 credits / sec","rate",3500),
  objective("b3-team","Own 12 boxers","owned",12),
  objective("b3-upgrades","Own 10 upgrades","upgrades",10),
  objective("b3-earned","Earn 3 million training credits","earned",3000000)],
 [objective("b4-champ","Hire a Champion","count",1,5),
  objective("b4-income","Reach 20,000 credits / sec","rate",20000),
  objective("b4-earned","Earn 65 million training credits","earned",65000000),
  objective("b4-upgrades","Own all 15 upgrades","upgrades",15),
  objective("b4-circuit","Match all 3 training stations","matched",3)]
];
var REWARDS=[50,500,10000,85000,1200000];
function id(s){return document.getElementById(s)}
function clamp(n,a,b){return Math.max(a,Math.min(b,n))}
function safeNum(n,min,max){n=Number(n);return Number.isFinite(n)?clamp(n,min,max):min}
function fmt(n){
 n=Math.floor(Math.max(0,n));
 if(n>=1e12)return(n/1e12).toFixed(2).replace(/\.00$/,"")+"T";
 if(n>=1e9)return(n/1e9).toFixed(n>=1e10?1:2).replace(/\.0+$/,"")+"B";
 if(n>=1e6)return(n/1e6).toFixed(n>=1e7?1:2).replace(/\.0+$/,"")+"M";
 if(n>=1e4)return(n/1e3).toFixed(1).replace(/\.0$/,"")+"K";
 return n.toLocaleString("en-US");
}
function fresh(){
 return {credits:100,earned:0,counts:[1,0,0,0,0,0],upgrades:{},stations:[0,-1,-1],
 chapter:0,completed:{},hits:0,hypeHits:0,hypeUntil:0,champion:false,lastTick:Date.now(),legacyStages:0};
}
function read(){
 var d=fresh(),raw=null;
 try{raw=JSON.parse(localStorage.getItem(KEY)||"null")}catch(e){}
 if(!raw||typeof raw!=="object"){
   try{
     var prior=JSON.parse(localStorage.getItem(LEGACY)||"null");
     if(prior&&typeof prior==="object"){
       d.credits+=safeNum(prior.credits,0,5000);
       d.legacyStages=Math.max(Math.floor(safeNum(prior.unlocked,0,19)),Array.isArray(prior.best)?prior.best.filter(function(v){return Number(v)>0}).length:0);
     }
   }catch(e){}
   return d;
 }
 d.credits=safeNum(raw.credits,0,1e15);
 d.earned=safeNum(raw.earned,0,1e15);
 if(Array.isArray(raw.counts))d.counts=d.counts.map(function(v,i){return Math.floor(safeNum(raw.counts[i],i===0?1:0,100000))});
 if(raw.upgrades&&typeof raw.upgrades==="object")UPGRADES.forEach(function(u){if(raw.upgrades[u.id]===true)d.upgrades[u.id]=true});
 d.chapter=Math.floor(safeNum(raw.chapter,0,4));
 if(raw.completed&&typeof raw.completed==="object")CONTRACTS.flat().forEach(function(c){if(raw.completed[c.id]===true)d.completed[c.id]=true});
 if(Array.isArray(raw.stations))d.stations=d.stations.map(function(v,i){return Math.floor(safeNum(raw.stations[i],-1,5))});
 d.hits=Math.floor(safeNum(raw.hits,0,1e12));
 d.hypeHits=Math.floor(safeNum(raw.hypeHits,0,9));
 d.hypeUntil=safeNum(raw.hypeUntil,0,Date.now()+60000);
 d.champion=raw.champion===true;
 d.lastTick=safeNum(raw.lastTick,0,Date.now());
 d.legacyStages=Math.floor(safeNum(raw.legacyStages,0,20));
 return d;
}
var state=read(),booted=false,timer=0,saveCounter=0,lastHitAnim=null,offlineNotice="",statusNotice="";
function availableStations(){return Math.min(3,state.chapter+1)}
function normalizeStations(){
 var used=[0,0,0,0,0,0];
 state.stations=state.stations.map(function(n,i){
  if(i>=availableStations()||n<0||n>5||!state.counts[n]||used[n]>=state.counts[n])return -1;
  used[n]++;return n;
 });
}
normalizeStations();
function owned(){return state.counts.reduce(function(a,b){return a+b},0)}
function purchased(){return UPGRADES.filter(function(u){return !!state.upgrades[u.id]}).length}
function filled(){return state.stations.slice(0,availableStations()).filter(function(v){return v>=0}).length}
function matched(){
 return state.stations.slice(0,availableStations()).filter(function(v,i){return v>=0&&BOXERS[v].affinity===STATIONS[i]}).length;
}
function circuitFactor(){
 var f=filled(),unique=new Set(state.stations.filter(function(v){return v>=0})).size===3;
 return 1+f*.05+matched()*.10+(f===3&&unique?.30:0);
}
function baseIncome(){
 var base=0;
 BOXERS.forEach(function(b,i){base+=state.counts[i]*b.base});
 var boost=1;
 UPGRADES.forEach(function(u){if(state.upgrades[u.id])boost+=u.bonus});
 return Math.min(1e13,base*boost*circuitFactor());
}
function income(now){return baseIncome()*(state.hypeUntil>now?1.25:1)}
function punchValue(){return Math.max(1,Math.round(baseIncome()*.03))}
function cost(i){return Math.ceil(BOXERS[i].cost*Math.pow(1.22,state.counts[i]))}
function save(){
 try{localStorage.setItem(KEY,JSON.stringify(state))}catch(e){}
}
function earn(n){
 if(!Number.isFinite(n)||n<=0)return;
 state.credits=Math.min(1e15,state.credits+n);
 state.earned=Math.min(1e15,state.earned+n);
}
function settle(now){
 var ms=clamp(now-state.lastTick,0,OFFLINE_LIMIT);
 if(ms<=0){state.lastTick=Math.max(now,state.lastTick);return 0}
 // Only a genuinely live 1-second tick can include a temporary Hype bonus.
 var rate=ms<=1500&&document.visibilityState==="visible"?income(now):baseIncome();
 var amount=rate*ms/1000;
 earn(amount);
 state.lastTick=now;
 return amount;
}
function metricValue(c){
 switch(c.metric){
  case"earned":return state.earned;
  case"count":return state.counts[c.index];
  case"rate":return baseIncome();
  case"filled":return filled();
  case"matched":return matched();
  case"upgrades":return purchased();
  case"owned":return owned();
 }
 return 0;
}
function reputation(){return Object.values(state.completed).filter(Boolean).length}
function updateContracts(){
 var changed=false,levelUp=false;
 for(var round=0;round<5;round++){
  var tasks=CONTRACTS[state.chapter];
  tasks.forEach(function(c){
   if(!state.completed[c.id]&&metricValue(c)>=c.target){
    state.completed[c.id]=true;
    state.credits=Math.min(1e15,state.credits+REWARDS[state.chapter]);
    changed=true;
   }
  });
  if(!tasks.every(function(c){return state.completed[c.id]}))break;
  if(state.chapter===4){
   if(!state.champion){state.champion=true;statusNotice="🏆 THE UNDISPUTED CLUB — Championship complete!";changed=true;levelUp=true;}
   break;
  }
  state.chapter++;
  normalizeStations();
  statusNotice="★ NEW GYM UNLOCKED: "+CHAPTERS[state.chapter].name;
  changed=true;levelUp=true;
 }
 return {changed:changed,levelUp:levelUp};
}
function printContracts(){
 var tasks=CONTRACTS[state.chapter];
 return tasks.map(function(c){
  var done=!!state.completed[c.id],value=metricValue(c);
  return '<div class="hbg-contract'+(done?' done':'')+'"><span class="hbg-check">'+(done?'✓':'')+'</span><span class="hbg-contract-title">'+c.title+'</span><span class="hbg-contract-progress">'+(done?'DONE':fmt(Math.min(value,c.target))+' / '+fmt(c.target))+'</span></div>';
 }).join("");
}
function printBoxers(){
 return BOXERS.map(function(b,i){
  if(b.chapter>state.chapter)return "";
  var price=cost(i),canBuy=state.credits>=price;
  return '<div class="hbg-boxer"><span><strong>'+b.name+' <span style="color:#d2a576">×'+state.counts[i]+'</span></strong><small>'+fmt(b.base)+'/sec each · '+b.affinity+' circuit</small></span><button class="hbg-action" data-hbg-hire="'+i+'" '+(canBuy?'':'disabled')+' aria-label="Hire '+b.name+' for '+fmt(price)+' credits">+ '+fmt(price)+'</button></div>';
 }).join("");
}
function printSlots(){
 return STATIONS.map(function(slot,i){
  var unlocked=i<availableStations(),selected=state.stations[i];
  var options='<option value="-1">Unassigned</option>';
  BOXERS.forEach(function(b,k){
   if(state.counts[k]<=0)return;
   options+='<option value="'+k+'" '+(selected===k?'selected':'')+'>'+b.name+'</option>';
  });
  return '<div class="hbg-slot '+(unlocked?'':'locked')+'"><label for="hbg-slot-'+i+'">'+slot+'</label>'+(unlocked?
   '<select id="hbg-slot-'+i+'" data-hbg-slot="'+i+'" aria-label="'+slot+' station">'+options+'</select><small>'+(selected>=0?(BOXERS[selected].affinity===slot?'+10% MATCH':'Training +5%'):'Assign a boxer')+'</small>':
   '<small>UNLOCK IN GYM '+(i+1)+'</small>')+'</div>';
 }).join("");
}
function printUpgrades(){
 var html="";
 ["EQUIPMENT","STAFF","FACILITIES"].forEach(function(category){
  var list=UPGRADES.filter(function(u){return u.category===category&&u.chapter<=state.chapter});
  if(!list.length)return;
  html+='<div class="hbg-section-tag">'+category+'</div>';
  list.forEach(function(u){
   var has=!!state.upgrades[u.id],canBuy=state.credits>=u.cost;
   html+='<div class="hbg-upgrade'+(has?' purchased':'')+'"><span><strong>'+u.name+'</strong><small>'+u.detail+' · +'+Math.round(u.bonus*100)+'% team income</small></span><button class="hbg-action" data-hbg-upgrade="'+u.id+'" '+(has||!canBuy?'disabled':'')+'>'+(has?'OWNED':fmt(u.cost))+'</button></div>';
  });
 });
 return html;
}
function chapterPct(){
 return Math.round(CONTRACTS[state.chapter].filter(function(c){return !!state.completed[c.id]}).length/5*100);
}
function noticeHTML(){
 var msg=offlineNotice||statusNotice;
 if(!msg)return "";
 return '<div class="hbg-notice" role="status"><span>'+msg+'</span><button type="button" data-hbg-dismiss aria-label="Dismiss notification">✕</button></div>';
}
function render(){
 var chap=CHAPTERS[state.chapter];
 var html='<div class="hbg" id="heavybag"><header class="hbg-top"><div><div class="hbg-eyebrow">THE BUREAU / IDLE ARCADE</div><h1>HEAVY BAG<span style="color:#df9a60">.</span></h1><p>ROAD TO CHAMPION · Build the ultimate boxing club.</p></div><span class="hbg-badge">'+(state.champion?'🏆 CHAMPION':'GYM 0'+(state.chapter+1)+' / 05')+'</span></header>';
 html+='<section class="hbg-stats" aria-label="Gym statistics"><div class="hbg-stat"><small>YOUR CREDITS</small><strong id="hbg-credits">0</strong></div><div class="hbg-stat"><small>INCOME / SEC</small><strong class="positive" id="hbg-rate">0</strong></div><div class="hbg-stat"><small>TOTAL EARNED</small><strong id="hbg-earned">0</strong></div><div class="hbg-stat"><small>CONTRACTS</small><strong id="hbg-reputation">0 / 25</strong></div></section>';
 html+='<div id="hbg-notice-wrap">'+noticeHTML()+'</div>';
 html+='<main class="hbg-layout"><div class="hbg-left"><section class="hbg-arena" data-chapter="'+state.chapter+'"><div class="hbg-arena-top"><span>WORLD 0'+(state.chapter+1)+' / 05</span><span>● TRAINING ACTIVE</span></div><h2>'+chap.name+'</h2><p class="hbg-arena-sub">'+chap.subtitle+'</p>';
 html+='<div class="hbg-bag-scene"><div class="hbg-halo"></div><div class="hbg-chain"></div><button class="hbg-bag" id="hbg-bag" type="button" data-hbg-punch aria-label="Punch the heavy bag"><span class="hbg-bag-body"><span class="hbg-bag-mark">THE<br>BUREAU</span><span class="hbg-bag-stripe"></span><span class="hbg-bag-seam"></span></span></button><div class="hbg-floor"></div><span class="hbg-hit-float" id="hbg-hit-float" aria-hidden="true"></span></div>';
 html+='<div class="hbg-tap"><span>🥊 TAP = ONE PUNCH</span><b id="hbg-tap-value">+1</b></div><div class="hbg-hype"><div class="hbg-hype-head"><span>GYM HYPE</span><span id="hbg-hype-text"></span></div><div class="hbg-bar"><span id="hbg-hype-bar" style="width:0"></span></div><p class="hbg-help">Optional: 10 punches give your team +25% income for 60 seconds. Your gym keeps earning without tapping.</p></div></section>';
 html+='<section class="hbg-panel"><div class="hbg-panel-head"><h2>GYM CONTRACTS</h2><small>+'+fmt(REWARDS[state.chapter])+' EACH</small></div><div class="hbg-contracts" id="hbg-contracts">'+printContracts()+'</div><div class="hbg-bar"><span id="hbg-chapter-bar" style="width:'+chapterPct()+'%"></span></div><div class="hbg-chapter-progress">Complete all five to unlock the next gym. No prestige or reset.</div>'+(state.champion?'<div class="hbg-banner" style="margin-top:12px">🏆 THE UNDISPUTED CLUB — All 25 contracts complete. Your club is yours to keep.</div>':'')+'</section></div>';
 html+='<div class="hbg-right"><section class="hbg-panel"><div class="hbg-panel-head"><h2>TRAINING CIRCUIT</h2><small id="hbg-circuit-value"></small></div><div class="hbg-circuit">'+printSlots()+'</div><p class="hbg-help">Assign owned boxers. A matching specialty gives +10%, and three different boxers give +30%. Circuit income is fully automatic.</p></section>';
 html+='<section class="hbg-panel"><div class="hbg-panel-head"><h2>YOUR BOXERS</h2><small>'+fmt(owned())+' HIRED</small></div><div class="hbg-roster">'+printBoxers()+'</div></section>';
 html+='<section class="hbg-panel"><div class="hbg-panel-head"><h2>PERMANENT UPGRADES</h2><small>'+purchased()+' / 15 OWNED</small></div><div class="hbg-shop">'+printUpgrades()+'</div></section></div></main>';
 html+='<footer class="hbg-footer"><span>100% OFFLINE INCOME · MAX 8 HOURS · NO ADS</span><span>'+(state.legacyStages?'LEGACY RECORD PRESERVED · '+state.legacyStages+' BAGS':'PROGRESS SAVES ON THIS DEVICE')+'</span></footer></div>';
 var host=id("content");
 if(host)host.innerHTML=html;
 paint();
}
function paint(){
 if(!booted)return;
 var now=Date.now();
 var write=function(key,text){var node=id(key);if(node&&node.textContent!==text)node.textContent=text};
 write("hbg-credits",fmt(state.credits));
 write("hbg-rate","+"+fmt(income(now)));
 write("hbg-earned",fmt(state.earned));
 write("hbg-reputation",reputation()+" / 25");
 write("hbg-tap-value","+"+fmt(punchValue()));
 var active=state.hypeUntil>now;
 var h=active?100:state.hypeHits*10;
 write("hbg-hype-text",active?"ACTIVE · "+Math.ceil((state.hypeUntil-now)/1000)+"s":" "+state.hypeHits+" / 10 punches");
 var bar=id("hbg-hype-bar");if(bar&&bar.style.width!==h+"%")bar.style.width=h+"%";
 write("hbg-circuit-value","×"+circuitFactor().toFixed(2)+" TEAM");
 var contracts=id("hbg-contracts");
 if(contracts){
  var html=printContracts();
  if(contracts.innerHTML!==html)contracts.innerHTML=html;
 }
 var prog=id("hbg-chapter-bar");if(prog)prog.style.width=chapterPct()+"%";
}
function notify(){
 var wrap=id("hbg-notice-wrap");if(wrap)wrap.innerHTML=noticeHTML();
}
function afterAction(){
 var progression=updateContracts();
 save();
 if(progression.levelUp)render();
 else {render();notify();}
}
function playHit(){
 var bag=id("hbg-bag"),fx=id("hbg-hit-float");
 if(bag&&typeof bag.animate==="function"){
  if(lastHitAnim)lastHitAnim.cancel();
  lastHitAnim=bag.animate([{transform:"rotate(-1deg)"},{transform:"rotate(10deg) scale(.975)",offset:.40},{transform:"rotate(-2deg)"}],{duration:210,easing:"ease-out"});
 }
 if(fx){
  fx.textContent="+"+fmt(punchValue());
  if(typeof fx.animate==="function")fx.animate([{transform:"translateY(0)",opacity:1},{transform:"translateY(-34px)",opacity:0}],{duration:480,easing:"ease-out"});
 }
}
function actionPunch(){
 settle(Date.now());
 var amount=punchValue();
 earn(amount);state.hits++;state.hypeHits++;
 if(state.hypeHits>=10){
  state.hypeHits=0;state.hypeUntil=Date.now()+60000;
  statusNotice="⚡ GYM HYPE ACTIVE: +25% for 60 seconds!";
 }
 playHit();
 var progression=updateContracts();
 if(progression.levelUp)render();
 else {paint();if(statusNotice)notify();}
 if(state.hits%5===0||progression.changed)save();
}
function hire(i){
 if(!BOXERS[i]||BOXERS[i].chapter>state.chapter)return;
 settle(Date.now());
 var price=cost(i);
 if(state.credits<price)return;
 state.credits-=price;state.counts[i]++;
 afterAction();
}
function buyUpgrade(key){
 var u=UPGRADES.find(function(x){return x.id===key});
 if(!u||u.chapter>state.chapter||state.upgrades[u.id]||state.credits<u.cost)return;
 settle(Date.now());
 if(state.credits<u.cost)return;
 state.credits-=u.cost;state.upgrades[u.id]=true;
 afterAction();
}
function assign(slot,value){
 if(slot<0||slot>=availableStations()||value<-1||value>=BOXERS.length)return;
 settle(Date.now());
 var used=state.stations.slice();
 used[slot]=value;
 if(value>=0&&used.filter(function(x){return x===value}).length>state.counts[value]){
  statusNotice="That boxer is already assigned. Hire another to use both stations.";
  notify();render();return;
 }
 state.stations=used;
 afterAction();
}
function gameTick(){
 var now=Date.now(),gone=now-state.lastTick;
 var amount=settle(now);
 if(gone>5000&&amount>0){
  offlineNotice="WELCOME BACK · Your team earned "+fmt(amount)+" credits while you were away.";
  notify();
 }
 var p=updateContracts();
 if(p.levelUp)render();else paint();
 if(p.changed)save();
 if(++saveCounter%15===0)save();
}
function startTimer(){
 if(timer||document.visibilityState==="hidden")return;
 timer=setInterval(gameTick,1000);
}
function stopTimer(){
 if(timer){clearInterval(timer);timer=0;}
}
function bootstrap(){
 if(booted)return;
 booted=true;
 var elapsed=clamp(Date.now()-state.lastTick,0,OFFLINE_LIMIT);
 if(elapsed>0){
  var pay=baseIncome()*elapsed/1000;
  earn(pay);
  if(elapsed>8000&&pay>0)offlineNotice="WELCOME BACK · "+fmt(pay)+" credits earned offline ("+Math.round(elapsed/60000)+" minutes).";
 }
 state.lastTick=Date.now();
 updateContracts();
 save();
 render();
 startTimer();
}
window.openHeavyBag=bootstrap;
document.addEventListener("click",function(event){
 var node=event.target&&event.target.closest?event.target.closest("[data-hbg-punch],[data-hbg-hire],[data-hbg-upgrade],[data-hbg-dismiss]"):null;
 if(!node)return;
 if(node.hasAttribute("data-hbg-punch")){actionPunch();return}
 if(node.hasAttribute("data-hbg-hire")){hire(Number(node.getAttribute("data-hbg-hire")));return}
 if(node.hasAttribute("data-hbg-upgrade")){buyUpgrade(node.getAttribute("data-hbg-upgrade"));return}
 if(node.hasAttribute("data-hbg-dismiss")){offlineNotice="";statusNotice="";notify();}
});
document.addEventListener("change",function(event){
 var node=event.target;
 if(node&&node.hasAttribute&&node.hasAttribute("data-hbg-slot"))assign(Number(node.getAttribute("data-hbg-slot")),Number(node.value));
});
document.addEventListener("visibilitychange",function(){
 if(!booted)return;
 if(document.visibilityState==="hidden"){settle(Date.now());save();stopTimer();}
 else {gameTick();startTimer();}
});
window.addEventListener("pagehide",function(){if(!booted)return;settle(Date.now());save();stopTimer()});
})();
