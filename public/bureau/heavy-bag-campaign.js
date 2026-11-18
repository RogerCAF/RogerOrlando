/* Heavy Bag campaign v3: finite arcade progression, upgrades retained, no prestige reset. */
(function () {
  "use strict";
  const KEY = "the-bureau-heavybag-campaign-v1";
  const FIGHTS = [
    {name:"Rookie Canvas",tag:"Time your punches.",hp:65,bonus:95,skin:0,seconds:40,mode:"normal"},
    {name:"Rhythm Rider",tag:"Keep your rhythm.",hp:105,bonus:139,skin:0,seconds:40,mode:"rhythm"},
    {name:"Heavy Leather",tag:"Only accurate strikes break armor.",hp:160,bonus:183,skin:0,seconds:43,mode:"armor"},
    {name:"Gym Guardian",tag:"Precision is everything.",hp:240,bonus:317,skin:0,seconds:49,mode:"precision"},
    {name:"Back Alley",tag:"Time your punches.",hp:295,bonus:271,skin:1,seconds:40,mode:"rhythm"},
    {name:"Quickfire",tag:"Keep your rhythm.",hp:365,bonus:315,skin:1,seconds:34,mode:"rush"},
    {name:"Iron Stitch",tag:"Only accurate strikes break armor.",hp:470,bonus:359,skin:1,seconds:45,mode:"armor"},
    {name:"The Bouncer",tag:"Precision is everything.",hp:690,bonus:493,skin:1,seconds:54,mode:"shield"},
    {name:"Steel Core",tag:"Time your punches.",hp:790,bonus:447,skin:2,seconds:45,mode:"armor"},
    {name:"Broken Clock",tag:"Keep your rhythm.",hp:960,bonus:491,skin:2,seconds:39,mode:"rush"},
    {name:"Factory Reject",tag:"Only accurate strikes break armor.",hp:1190,bonus:535,skin:2,seconds:47,mode:"regen"},
    {name:"The Crusher",tag:"Precision is everything.",hp:1460,bonus:669,skin:2,seconds:56,mode:"armor"},
    {name:"Gold Standard",tag:"Time your punches.",hp:1700,bonus:623,skin:3,seconds:46,mode:"precision"},
    {name:"Redline",tag:"Keep your rhythm.",hp:1960,bonus:667,skin:3,seconds:42,mode:"rush"},
    {name:"The Sentinel",tag:"Only accurate strikes break armor.",hp:2290,bonus:711,skin:3,seconds:53,mode:"shield"},
    {name:"The Champion",tag:"Precision is everything.",hp:2800,bonus:845,skin:3,seconds:60,mode:"regen"},
    {name:"Last Warning",tag:"Time your punches.",hp:3110,bonus:799,skin:4,seconds:48,mode:"precision"},
    {name:"The Colossus",tag:"Keep your rhythm.",hp:3600,bonus:843,skin:4,seconds:58,mode:"armor"},
    {name:"No Mercy",tag:"Only accurate strikes break armor.",hp:4090,bonus:887,skin:4,seconds:56,mode:"shield"},
    {name:"THE FINAL BAG",tag:"Precision is everything.",hp:4950,bonus:1021,skin:4,seconds:72,mode:"final"}
  ];
  
  const maxStage = FIGHTS.length;
  function load(){
    try {
      const stored=JSON.parse(localStorage.getItem(KEY)||"null")||{};
      const stage=Math.min(maxStage,Math.max(0,Math.floor(Number(stored.stage)||0)));
      const max=stage===maxStage?0:FIGHTS[stage].hp;
      return {
        stage:stage,
        damage:Math.min(max,Math.max(0,Number(stored.damage)||0)),
        bestCombo:Math.min(100,Math.max(0,Math.floor(Number(stored.bestCombo)||0))),
        completedAt:Math.max(0,Number(stored.completedAt)||0),
        startedAt:Math.max(0,Number(stored.startedAt)||Date.now()),
        finishes:Math.max(0,Math.floor(Number(stored.finishes)||0)),
        charge:0,combo:0,lastHit:0
      };
    }catch(_){return {stage:0,damage:0,bestCombo:0,completedAt:0,startedAt:Date.now(),finishes:0,charge:0,combo:0,lastHit:0};}
  }
  const game=load();
  let lastSave=0;

  // Skill-based arcade engine. Stages are timed, with a visible moving strike indicator.
  const ZONES=['THE GYM','UNDERGROUND','THE FACTORY','THE ARENA','FINAL CHAMBER'];
  const RULES={normal:'Build clean combos.',rhythm:'PERFECT hits charge faster.',armor:'Off-beat punches barely hurt.',precision:'Weak punches do no damage.',rush:'Fast round — no wasting time.',shield:'Shield activates every 3.5 seconds.',regen:'The bag repairs itself.',final:'Three boss phases. No second chances.'};
  const RUN={status:'ready',aim:.5,combo:0,energy:0,hits:0,perfect:0,last:0,started:0,deadline:0,phase:1};
  let runFrame=0,lastUI=0,hiddenAt=0;
  const ui=(id)=>document.getElementById(id);
  // Disable the clicker's automatic damage/income: money now comes from victories.
  hbAdvance=function(){return false;};
  hbPerSecond=function(){return 0;};
  hbPerHit=function(){
    const gl=Math.min(15,hbLevel('gloves')),tech=Math.min(12,hbLevel('technique')),power=Math.min(12,hbLevel('power'));
    return (13+gl*5+tech*4)*Math.pow(1.22,power);
  };
  if(hbTickTimer!==null){clearInterval(hbTickTimer);hbTickTimer=null;}
  function halt(){if(runFrame)cancelAnimationFrame(runFrame);runFrame=0;}
  function roundReset(){
    halt();RUN.status='ready';RUN.aim=.5;RUN.combo=0;RUN.energy=0;RUN.hits=0;RUN.perfect=0;RUN.last=0;RUN.started=0;RUN.deadline=0;RUN.phase=1;
    game.combo=0;game.charge=0;
  }
  function endLoss(){
    halt();RUN.status='lost';game.damage=0;game.combo=0;game.charge=0;save(true);
    const box=ui('hbcRoundOverlay');if(box){box.hidden=false;box.innerHTML='<h2>TIME IS UP.</h2><p>The bag survived. Improve your timing or buy an upgrade. No progress was lost.</p><button class="cta" id="hbcStart">TRY AGAIN →</button>';}
    hbRender();beep(130,.14);
  }
  function perfectZone(){return .09+Math.min(12,hbLevel('coach'))*.009;}
  function frameRun(t){
    runFrame=0;
    if(RUN.status!=='fighting'||active!=='bag'||document.hidden||!ui('hbcAim'))return;
    const b=FIGHTS[game.stage];
    if(t>=RUN.deadline){endLoss();return;}
    RUN.aim=(Math.sin((t-RUN.started)*Math.PI*2/Math.max(810,1400-game.stage*22))+1)/2;
    ui('hbcAim').style.left=(RUN.aim*100)+'%';
    if(b.mode==='regen'&&Math.random()<.028)game.damage=Math.max(0,game.damage-b.hp*.0009);
    if(b.mode==='final')RUN.phase=game.damage/b.hp>.68?1:game.damage/b.hp>.35?2:3;
    if(t-lastUI>100){
      lastUI=t;
      const clock=ui('hbcTime');if(clock){clock.textContent=Math.max(0,(RUN.deadline-t)/1000).toFixed(1)+'s';clock.classList.toggle('danger',RUN.deadline-t<10000);}
      const hp=ui('hbcHealth');if(hp)hp.style.width=(100*Math.max(0,b.hp-game.damage)/b.hp)+'%';
    }
    runFrame=requestAnimationFrame(frameRun);
  }
  function startRound(){
    if(active!=='bag'||game.stage>=maxStage)return;
    roundReset();game.damage=0;
    RUN.status='fighting';RUN.started=performance.now();RUN.deadline=RUN.started+FIGHTS[game.stage].seconds*1000;
    const box=ui('hbcRoundOverlay');if(box){box.hidden=true;box.innerHTML='';}
    const punch=ui('hbPunch');if(punch)punch.disabled=false;
    hbRender();runFrame=requestAnimationFrame(frameRun);beep(540,.06);
  }
  function frameFinish(){
    halt();RUN.status='win';
    const box=ui('hbcRoundOverlay');if(box){box.hidden=false;box.innerHTML='<h2>BAG DESTROYED.</h2><p>Grade '+(RUN.perfect/Math.max(1,RUN.hits)>.5?'S':RUN.perfect/Math.max(1,RUN.hits)>.27?'A':'B')+' · '+RUN.perfect+' perfect hits. Claim your reward and continue.</p><button class="cta" id="hbcNextOverlay">NEXT BAG →</button>';}
    const punch=ui('hbPunch');if(punch)punch.disabled=true;
    hbRender();save(true);beep(740,.13);
  }
  
  function save(force){
    const now=Date.now();
    if(!force&&now-lastSave<600)return;
    lastSave=now;
    try {localStorage.setItem(KEY,JSON.stringify({
      stage:game.stage,damage:game.damage,bestCombo:game.bestCombo,completedAt:game.completedAt,startedAt:game.startedAt,finishes:game.finishes
    }));}catch(_){}
  }
  function f(id,value){const el=document.getElementById(id);if(el)el.textContent=String(value);}
  function show(id,visible){const el=document.getElementById(id);if(el)el.style.display=visible?"":"none";}
  function shop(){
    return HB_UPGRADES.map(function(u){
      const copy={coach:['Focus Training','Widens the PERFECT zone'],partner:['Combo Drills','Boosts timed combo damage'],gym:['Finisher Practice','Powers up the heavy strike']};
      const title=copy[u.id]?copy[u.id][0]:u.title,description=copy[u.id]?copy[u.id][1]:u.desc;
      return '<button type="button" class="hb-upgrade" data-hb-buy="'+u.id+'"><span class="hb-ico">'+u.icon+'</span><span><strong>'+title+' <span class="hb-level">Lv. 0</span></strong><small>'+description+'</small></span><span class="hb-price"></span></button>';
    }).join("");
  }
  function chapters(){
    return '<div class="hbc-route hbc-route20">'+FIGHTS.map(function(b,i){
      let cls=i<game.stage?'done':i===game.stage?'current':'locked';
      return '<span class="hbc-node '+cls+'" title="'+ZONES[Math.floor(i/4)]+' / '+b.name+'">'+(i<game.stage?'✓':i+1)+'</span>';
    }).join('')+'</div>';
  }
  
  function renderImpact(amount,critical,heavy){
    const bag=document.getElementById("hbPunch");
    if(bag){
      if(hbImpact)hbImpact.cancel();
      hbImpact=bag.animate([
        {transform:"rotate(0deg)"},
        {transform:"rotate("+(heavy?23:11)+"deg) scale(.97)",offset:.42},
        {transform:"rotate(-3deg)"}
      ],{duration:heavy?360:220,easing:"ease-out"});
    }
    const arena=document.getElementById("hbArena");
    if(arena){
      const floats=arena.querySelectorAll(".hb-float");
      if(floats.length>=7)floats[0].remove();
      const marker=document.createElement("span");
      marker.className="hb-float"+(critical||heavy?" critical":"");
      marker.textContent=(heavy?"HEAVY! ":critical?"CRIT! ":"+")+hbNum(amount);
      marker.style.left=(28+Math.random()*43)+"%";
      marker.style.top=(24+Math.random()*20)+"%";
      arena.append(marker);
      setTimeout(function(){marker.remove();},740);
    }
  }
  function deal(amount,critical,heavy){
    if(game.stage>=maxStage||RUN.status!=='fighting')return;
    const b=FIGHTS[game.stage],hit=Math.max(0,Math.round(amount*10)/10);
    game.damage=Math.min(b.hp,game.damage+hit);
    hb.total+=hit;hb.clicks++;if(hb.clicks===5)unlock(0);
    renderImpact(hit,critical,heavy);
    hbSave();save(false);
    if(game.damage>=b.hp){frameFinish();return;}
    hbRender();
  }
  
  window.hbHit=function(){
    if(active!=='bag'||RUN.status!=='fighting'||game.stage>=maxStage)return;
    const now=performance.now(),b=FIGHTS[game.stage];
    if(now>RUN.deadline){endLoss();return;}
    if(now-RUN.last<240)return;RUN.last=now;RUN.hits++;
    const diff=Math.abs(RUN.aim-.5),grade=diff<=perfectZone()?'PERFECT':diff<.245?'GOOD':'WEAK';
    RUN.combo=grade==='WEAK'?0:Math.min(25,RUN.combo+1);
    RUN.perfect+=grade==='PERFECT'?1:0;
    RUN.energy=Math.min(100,RUN.energy+(grade==='PERFECT'?(b.mode==='rhythm'?33:26):grade==='GOOD'?14:0));
    game.combo=RUN.combo;game.charge=Math.floor(RUN.energy/100*6);game.bestCombo=Math.max(game.bestCombo,RUN.combo);
    let amount=hbPerHit()*(grade==='PERFECT'?1.9:grade==='GOOD'?1:.22)*(1+RUN.combo*(.07+Math.min(12,hbLevel('partner'))*.008));
    if(b.mode==='armor'&&grade!=='PERFECT')amount*=.32;
    if(b.mode==='precision'&&grade==='WEAK')amount=0;
    if(b.mode==='shield'&&Math.floor((now-RUN.started)/3500)%2===1)amount*=grade==='PERFECT'?.65:.22;
    if(b.mode==='final'&&RUN.phase===2&&grade!=='PERFECT')amount*=.40;
    if(b.mode==='final'&&RUN.phase===3&&grade==='PERFECT')amount*=1.30;
    const feedback=ui('hbcFeedback');if(feedback)feedback.textContent=grade+' · '+RUN.combo+'× COMBO';
    deal(amount,grade==='PERFECT',false);
    if(grade==='PERFECT')beep(460,.045);
  };
  function finisher(){
    if(active!=='bag'||RUN.status!=='fighting'||RUN.energy<100)return;
    RUN.energy=0;game.charge=0;
    deal(hbPerHit()*(8+Math.min(12,hbLevel('gym'))*1.5)*(1+RUN.combo*.04),true,true);
    beep(200,.12);hbRender();
  }
  
  function advance(){
    if(active!=='bag'||RUN.status!=='win'||game.stage>=maxStage)return;
    const beaten=FIGHTS[game.stage],grade=RUN.perfect/Math.max(1,RUN.hits)>.5?'S':RUN.perfect/Math.max(1,RUN.hits)>.27?'A':'B';
    hbEarn(Math.round(beaten.bonus*(grade==='S'?1.4:grade==='A'?1.2:1)));
    game.stage++;game.damage=0;roundReset();
    if(game.stage>=maxStage){game.completedAt=Date.now();game.finishes++;toast('🏆 CHAMPION · THE FINAL BAG IS DOWN');}
    else toast('✦ BAG CLEARED · NEXT: '+FIGHTS[game.stage].name);
    hbSave(true);save(true);openHeavyBag();
  }
  
  function replay(){
    if(active!=="bag"||!game.completedAt||game.stage!==maxStage)return;
    game.stage=maxStage-1;
    game.damage=0;
    game.charge=0;
    game.combo=0;
    save(true);
    openHeavyBag();
  }
  window.hbRender=function(){
    if(active!=="bag"||!document.querySelector(".hb-game"))return;
    if(game.stage>=maxStage)return;
    const boss=FIGHTS[game.stage];
    const cleared=game.damage>=boss.hp;
    f("hbCoins",hbNum(hb.coins));
    f("hbClickPower",hbNum(hbPerHit()));
    f("hbDps",game.bestCombo+"×");
    if(RUN.status==="ready")f("hbcTime",FIGHTS[game.stage].seconds+"s");
    f("hbClicks",hbNum(hb.clicks));
    f("hbTotal",hbNum(hb.total));
    f("hbRank",HB_RANKS[Math.min(game.stage,HB_RANKS.length-1)]);
    f("hbcBoss",boss.name);
    f("hbcLine",cleared?"BAG DESTROYED. YOU HAVE PROVEN YOUR POINT.":boss.tag);
    f("hbcHP",hbNum(Math.max(0,boss.hp-game.damage))+" / "+hbNum(boss.hp)+" HP");
    f("hbcCombo",game.combo+"×");
    f("hbcCharge",game.charge+" / 6");
    f("hbcPhase",cleared?"STAGE CLEAR":"BAG "+(game.stage+1)+" / "+maxStage+" · "+ZONES[Math.floor(game.stage/4)]);
    f("hbcNextText",game.stage===maxStage-1?"CLAIM THE TITLE":"NEXT BAG");
    const bar=document.getElementById("hbcHealth");
    if(bar)bar.style.width=Math.max(0,100*(boss.hp-game.damage)/boss.hp)+"%";
    const arena=document.getElementById("hbArena");
    if(arena)arena.dataset.tier=String(boss.skin);
    const bag=document.getElementById("hbPunch");
    if(bag)bag.disabled=RUN.status!=='fighting'||cleared;
    show("hbcFinisher",RUN.status==='fighting'&&RUN.energy>=100);
    show("hbcContinue",false);
    f("hbcMode",RULES[boss.mode]);
    const energy=ui('hbcEnergy');if(energy)energy.style.width=RUN.energy+'%';
    const overlay=ui('hbcRoundOverlay');if(overlay&&RUN.status==='ready'){overlay.hidden=false;overlay.innerHTML='<h2>'+boss.name+'</h2><p>'+RULES[boss.mode]+' · '+boss.seconds+' seconds. Time your strikes in the green zone.</p><button class="cta" id="hbcStart">START ROUND →</button>';}
    const armor=document.getElementById("hbcArmour");
    if(armor)armor.style.display=game.stage>=2?"":"none";
    for(const u of HB_UPGRADES){
      const el=document.querySelector('[data-hb-buy="'+u.id+'"]');
      if(!el)continue;
      const price=hbPrice(u),level=hbLevel(u.id);
      el.disabled=level>=u.cap||hb.coins<price;
      const cost=el.querySelector(".hb-price");
      if(cost)cost.textContent=level>=u.cap?"MAX":"◈ "+hbNum(price);
      const lv=el.querySelector(".hb-level");
      if(lv)lv.textContent="Lv. "+level;
    }
    const nodes=document.querySelectorAll(".hbc-route .hbc-node");
    nodes.forEach(function(el,i){el.className="hbc-node "+(i<game.stage?"done":i===game.stage?"current":"locked");});
  };
  window.openHeavyBag=function(){
    hbAdvance();
    const offline=hbOffline;
    hbOffline=0;
    if(game.stage>=maxStage){
      modal(mark+'<div class="hb-game hbc-end">'+
        '<div class="hb-eyebrow">THE BUREAU / CAMPAIGN COMPLETE</div>'+
        '<div class="hbc-trophy">🏆</div>'+
        '<h1>YOU CONQUERED THE FINAL BAG.</h1>'+
        '<p>All 20 bags defeated. Five arenas conquered. Your champion belt is permanent.</p>'+
        '<div class="hbc-ending-line">THE BUREAU · UNDISPUTED CHAMPION</div>'+
        chapters()+
        '<div class="hb-tags"><span class="hb-tag">TOTAL TRAINING · '+hbNum(hb.total)+'</span><span class="hb-tag">PUNCHES · '+hbNum(hb.clicks)+'</span><span class="hb-tag">BEST COMBO · '+game.bestCombo+'×</span></div>'+
        '<p class="hb-achievements">Campaign complete. Your belt and upgrades stay saved on this device. No prestige and no forced reset.</p>'+
        '<button class="cta" id="hbcReplay">↻ REPLAY THE FINAL BAG</button></div>');
      return;
    }
    const boss=FIGHTS[game.stage];
    roundReset();
    modal(mark+'<div class="hb-game hbc-game"><div class="hb-top"><div>'+
      '<div class="hb-eyebrow">THE BUREAU / ROAD TO THE FINAL BAG</div>'+
      '<h1>The Heavy Bag</h1><span class="muted small">20 bags · 5 arenas · 1 final boss · no prestige.</span>'+
      '</div><span class="hb-rank">BELT · <b id="hbRank">Beginner</b></span></div>'+
      (offline>0?'<p class="hb-offline">✦ Offline training: +'+hbNum(offline)+' credits. Only your punches defeat each bag.</p>':"")+
      chapters()+
      '<div class="hb-statbar"><div class="hb-stat"><small>TRAINING CREDITS</small><strong id="hbCoins">0</strong></div>'+
      '<div class="hb-stat"><small>PER PUNCH</small><strong id="hbClickPower">1</strong></div>'+
      '<div class="hb-stat"><small>BEST COMBO</small><strong id="hbDps">0</strong></div></div>'+
      '<div class="hb-play"><div class="hb-arena" id="hbArena" data-tier="'+boss.skin+'">'+
      '<span class="hbc-arena-title" id="hbcBoss">'+boss.name+'</span>'+
      '<span class="hb-chain"></span><button type="button" id="hbPunch" class="hb-bag" aria-label="Punch the heavy bag"><span class="hb-bag-art"></span></button>'+
      '<div class="hb-hint" id="hbcFeedback">TAP AT THE RIGHT TIME · BUILD YOUR FINISHER</div><div class="hbc-timing"><div class="hbc-timing-head"><span id="hbcMode">PERFECT TIMING</span><span id="hbcTime">0.0s</span></div><div class="hbc-meter"><div class="hbc-sweet"></div><div class="hbc-needle" id="hbcAim"></div></div><div class="hbc-energy"><span id="hbcEnergy"></span></div></div><div class="hbc-round-overlay" id="hbcRoundOverlay"></div>'+
      '<div class="hbc-action"><span>COMBO <b id="hbcCombo">0×</b></span><span>HEAVY <b id="hbcCharge">0 / 6</b></span></div>'+
      '<button type="button" id="hbcFinisher" class="cta hbc-finisher" style="display:none">✦ HEAVY STRIKE</button>'+
      '</div><div class="hb-panel">'+
      '<div class="hb-progress-head"><strong id="hbcPhase">BAG '+(game.stage+1)+' / '+maxStage+'</strong><strong id="hbcHP">0 HP</strong></div>'+
      '<div class="hb-track hbc-boss-track"><span id="hbcHealth" style="width:0%"></span></div>'+
      '<p class="hbc-tagline" id="hbcLine">'+boss.tag+'</p>'+
      '<p id="hbcArmour" class="hbc-armor" style="display:none">ARMOURED BAG · Heavy strikes bypass armour</p>'+
      '<button class="cta hbc-next" id="hbcContinue" type="button" style="display:none"><span id="hbcNextText">NEXT BAG</span> →</button>'+
      '<div class="hb-section-title"><strong>TRAINING UPGRADES</strong><span class="muted small">Spend credits</span></div>'+
      '<div class="hb-shop">'+shop()+'</div></div></div>'+
      '<div class="hb-tags"><span class="hb-tag">TOTAL TRAINING · <b id="hbTotal">0</b></span>'+
      '<span class="hb-tag">PUNCHES · <b id="hbClicks">0</b></span>'+
      '<span class="hb-tag">BEST COMBO · '+game.bestCombo+'×</span></div>'+
      '<p class="hb-achievements">Beat every bag to earn the permanent champion belt. Your credits, upgrades and campaign progress save automatically. Passive income helps training but never clears stages.</p>'+
      '</div>');
    hbRender();
  };
  document.addEventListener("click",function(e){
    const start=e.target.closest("#hbcStart");if(start){e.preventDefault();startRound();return;}
    const hit=e.target.closest("#hbcFinisher");
    if(hit){e.preventDefault();finisher();return;}
    const next=e.target.closest("#hbcContinue,#hbcNextOverlay");
    if(next){e.preventDefault();advance();return;}
    const again=e.target.closest("#hbcReplay");
    if(again){e.preventDefault();replay();}
  });
  document.addEventListener('keydown',function(e){if(active!=='bag'||RUN.status!=='fighting'||e.repeat||e.altKey||e.ctrlKey||e.metaKey)return;if(['INPUT','BUTTON','TEXTAREA','SELECT'].includes(e.target.tagName))return;if(e.code==='Space'){e.preventDefault();hbHit();}if(e.key.toLowerCase()==='f'){e.preventDefault();finisher();}});
  document.addEventListener('visibilitychange',function(){if(RUN.status!=='fighting')return;if(document.hidden){hiddenAt=performance.now();halt();}else if(hiddenAt){const lapse=performance.now()-hiddenAt;RUN.deadline+=lapse;RUN.started+=lapse;hiddenAt=0;runFrame=requestAnimationFrame(frameRun);}});
  window.addEventListener("pagehide",function(){halt();save(true);});
  document.addEventListener("visibilitychange",function(){if(document.hidden)save(true);});
  const style=document.createElement("style");
  style.textContent=[
    ".hbc-game .hbc-route,.hbc-end .hbc-route{display:flex;gap:6px;margin:15px 0 9px;width:100%}",
    ".hbc-node{flex:1;text-align:center;border:1px solid #987a584c;border-radius:7px;background:#1c2227;color:#7e766b;padding:7px 0;font:12px ui-monospace,monospace}",
    ".hbc-node.done{color:#ffd399;background:#5b3d254c;border-color:#bb915765}",
    ".hbc-node.current{background:#c58c4f;color:#161719;border-color:#ffd49a;font-weight:900}",
    ".hbc-arena-title{font:700 13px ui-monospace,monospace;letter-spacing:.14em;color:#ebc18f;margin-bottom:4px;text-align:center;max-width:90%}",
    ".hbc-action{display:flex;gap:12px;margin:8px 0;color:#c4aa88;font:11px ui-monospace,monospace}",
    ".hbc-action b{color:#ffe1af;font-size:14px}",
    ".hbc-finisher{padding:10px 17px!important;margin:4px 0!important;background:#df9d4f!important;color:#1d1712!important;animation:hbc-ready .65s ease-in-out infinite alternate}",
    "@keyframes hbc-ready{from{box-shadow:0 0 0 #ffa82c00;transform:scale(1)}to{box-shadow:0 0 23px #ffa82c66;transform:scale(1.035)}}",
    ".hbc-boss-track{height:12px;margin-top:10px}.hbc-boss-track>span{background:linear-gradient(90deg,#dc794a,#f6be80)}",
    ".hbc-tagline{margin:9px 0 12px;color:#c6ae95;font:12px Georgia,serif;font-style:italic;min-height:20px}",
    ".hbc-armor{font:10px ui-monospace,monospace;color:#e0a878;letter-spacing:.08em}",
    ".hbc-next{margin:11px 0 4px;width:100%;background:#dda76b!important;color:#1a1918!important}",
    ".hb-arena[data-tier='1'] .hb-bag-art{filter:sepia(.22)}",
    ".hb-arena[data-tier='2'] .hb-bag-art{filter:grayscale(.75) brightness(.8)}",
    ".hb-arena[data-tier='3'] .hb-bag-art{filter:sepia(.8) hue-rotate(-20deg)}",
    ".hb-arena[data-tier='4'] .hb-bag-art{filter:contrast(1.25) saturate(.7)}",
    ".hb-arena[data-tier='5'] .hb-bag-art{filter:hue-rotate(22deg) brightness(.8)}",
    ".hb-arena[data-tier='6'] .hb-bag-art{filter:brightness(.7) contrast(1.5)}",
    ".hb-arena[data-tier='7']{background:radial-gradient(ellipse at 50% 42%,#a45d2d58,transparent 60%),linear-gradient(#252126,#0a0c10 78%)}",
    ".hb-arena[data-tier='7'] .hb-bag-art{filter:sepia(.8) saturate(1.7);box-shadow:0 0 26px #dc904455,inset 8px 0 9px #ffffff12,inset -15px 0 21px #000b}",
    ".hb-bag:disabled{cursor:default;opacity:.5;animation:none}",
    ".hbc-end{text-align:center;padding:15px 12px 18px}.hbc-end h1{font-size:clamp(27px,5vw,52px);margin:12px 0}",
    ".hbc-trophy{font-size:70px;margin:12px 0}.hbc-end p{color:#bfae99}",
    ".hbc-ending-line{font:700 14px ui-monospace,monospace;letter-spacing:.16em;color:#f5c58d;margin:25px 0}",
    ".hbc-end .hb-tags{justify-content:center}.hbc-end .cta{margin:18px auto}",
    "@media(max-width:660px){.hbc-game .hb-play{grid-template-columns:1fr}.hbc-game .hb-arena{min-height:310px}.hbc-node{font-size:10px}}",
    "@media(prefers-reduced-motion:reduce){.hbc-finisher{animation:none}}"
  ].join("\n");
  document.head.appendChild(style);
})();