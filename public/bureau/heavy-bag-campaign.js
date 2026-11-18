/* Heavy Bag campaign v3: finite arcade progression, upgrades retained, no prestige reset. */
(function () {
  "use strict";
  const KEY = "the-bureau-heavybag-campaign-v1";
  const FIGHTS = [
    {name:"STANDARD ISSUE",tag:"Property of the gym. Not for long.",hp:70,bonus:120,skin:0},
    {name:"THE SANDBAG",tag:"It has filed a formal complaint.",hp:550,bonus:400,skin:1},
    {name:"CONCRETE THERAPY",tag:"Talking about feelings was optional.",hp:3600,bonus:1800,skin:2},
    {name:"THE DEBT COLLECTOR",tag:"He did not come for coffee.",hp:22000,bonus:10000,skin:3},
    {name:"IRON EGO",tag:"Now with a completely unnecessary ego.",hp:125000,bonus:55000,skin:4},
    {name:"THE PROBLEM",tag:"This is becoming a workplace incident.",hp:750000,bonus:270000,skin:5},
    {name:"NO REFUNDS",tag:"All complaints will be ignored.",hp:3500000,bonus:1200000,skin:6},
    {name:"THE IMPOSSIBLE BAG",tag:"One final bag. Absolutely not meant to break.",hp:15000000,bonus:0,skin:7}
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
      return '<button type="button" class="hb-upgrade" data-hb-buy="'+u.id+'"><span class="hb-ico">'+u.icon+'</span><span><strong>'+u.title+' <span class="hb-level">Lv. 0</span></strong><small>'+u.desc+'</small></span><span class="hb-price"></span></button>';
    }).join("");
  }
  function chapters(){
    return '<div class="hbc-route">'+FIGHTS.map(function(b,i){
      let cls=i<game.stage?"done":i===game.stage?"current":"locked";
      return '<span class="hbc-node '+cls+'" title="Stage '+(i+1)+': '+b.name+'">'+(i<game.stage?'✓':i+1)+'</span>';
    }).join("")+'</div>';
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
    if(game.stage>=maxStage)return;
    const boss=FIGHTS[game.stage];
    const hit=Math.max(1,Math.floor(amount));
    game.damage=Math.min(boss.hp,game.damage+hit);
    hbEarn(hit); // Income still buys the original upgrades; passive income cannot defeat a bag.
    renderImpact(hit,critical,heavy);
    if(game.damage>=boss.hp){
      game.charge=0;
      save(true);
      if(typeof toast==="function")toast("✦ BAG DOWN! Finish the stage to continue.");
    }else save(false);
    hbSave();
    hbScheduleRender();
  }
  window.hbHit=function(){
    if(active!=="bag"||game.stage>=maxStage)return;
    if(game.damage>=FIGHTS[game.stage].hp)return;
    const now=Date.now();
    game.combo=now-game.lastHit<=1800?Math.min(12,game.combo+1):1;
    game.lastHit=now;
    game.bestCombo=Math.max(game.bestCombo,game.combo);
    game.charge=Math.min(6,game.charge+1);
    const armor=game.stage>=4?.30:game.stage>=2?.12:0;
    const critical=Math.random()<.07;
    const comboPower=1+Math.min(1.4,(game.combo-1)*.13);
    const hit=hbPerHit()*comboPower*(1-armor)*(critical?3:1);
    deal(hit,critical,false);
    if(critical||game.combo%3===0)beep(critical?260:110,.045);
  };
  function finisher(){
    if(active!=="bag"||game.stage>=maxStage||game.charge<6)return;
    if(game.damage>=FIGHTS[game.stage].hp)return;
    const amount=hbPerHit()*(20+Math.min(game.combo,10)*2)*(1+game.stage*.07);
    game.charge=0;
    game.combo=0;
    deal(amount,true,true);
    beep(190,.11);
    hbRender();
  }
  function advance(){
    if(active!=="bag"||game.stage>=maxStage||game.damage<FIGHTS[game.stage].hp)return;
    const defeated=FIGHTS[game.stage];
    if(defeated.bonus)hbEarn(defeated.bonus);
    game.stage++;
    game.damage=0;
    game.charge=0;
    game.combo=0;
    if(game.stage>=maxStage){
      game.completedAt=game.completedAt||Date.now();
      game.finishes++;
      if(typeof toast==="function")toast("🏆 CHAMPION. The Impossible Bag is no more.");
    }else if(typeof toast==="function")toast("✦ Stage complete. +"+hbNum(defeated.bonus)+" credits.");
    hbSave(true);
    save(true);
    openHeavyBag();
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
    f("hbDps",hbNum(hbPerSecond()));
    f("hbClicks",hbNum(hb.clicks));
    f("hbTotal",hbNum(hb.total));
    f("hbRank",HB_RANKS[Math.min(game.stage,HB_RANKS.length-1)]);
    f("hbcBoss",boss.name);
    f("hbcLine",cleared?"BAG DESTROYED. YOU HAVE PROVEN YOUR POINT.":boss.tag);
    f("hbcHP",hbNum(Math.max(0,boss.hp-game.damage))+" / "+hbNum(boss.hp)+" HP");
    f("hbcCombo",game.combo+"×");
    f("hbcCharge",game.charge+" / 6");
    f("hbcPhase",cleared?"STAGE CLEAR":"BAG "+(game.stage+1)+" / "+maxStage);
    f("hbcNextText",game.stage===maxStage-1?"CLAIM THE TITLE":"NEXT BAG");
    const bar=document.getElementById("hbcHealth");
    if(bar)bar.style.width=Math.min(100,100*game.damage/boss.hp)+"%";
    const arena=document.getElementById("hbArena");
    if(arena)arena.dataset.tier=String(boss.skin);
    const bag=document.getElementById("hbPunch");
    if(bag)bag.disabled=cleared;
    show("hbcFinisher",!cleared&&game.charge>=6);
    show("hbcContinue",cleared);
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
        '<h1>YOU BROKE THE IMPOSSIBLE.</h1>'+
        '<p>The final bag is gone. Your trainer has stopped answering your calls.</p>'+
        '<div class="hbc-ending-line">UNDISPUTED HEAVY BAG CHAMPION</div>'+
        chapters()+
        '<div class="hb-tags"><span class="hb-tag">TOTAL TRAINING · '+hbNum(hb.total)+'</span><span class="hb-tag">PUNCHES · '+hbNum(hb.clicks)+'</span><span class="hb-tag">BEST COMBO · '+game.bestCombo+'×</span></div>'+
        '<p class="hb-achievements">Campaign complete. Your belt and upgrades stay saved on this device. No prestige. No forced reset.</p>'+
        '<button class="cta" id="hbcReplay">↻ REPLAY THE FINAL BAG</button></div>');
      return;
    }
    const boss=FIGHTS[game.stage];
    modal(mark+'<div class="hb-game hbc-game"><div class="hb-top"><div>'+
      '<div class="hb-eyebrow">THE BUREAU / ROAD TO THE IMPOSSIBLE</div>'+
      '<h1>The Heavy Bag</h1><span class="muted small">Eight bags. One championship. No resets.</span>'+
      '</div><span class="hb-rank">BELT · <b id="hbRank">Beginner</b></span></div>'+
      (offline>0?'<p class="hb-offline">✦ Offline training: +'+hbNum(offline)+' credits. Only your punches defeat each bag.</p>':"")+
      chapters()+
      '<div class="hb-statbar"><div class="hb-stat"><small>TRAINING CREDITS</small><strong id="hbCoins">0</strong></div>'+
      '<div class="hb-stat"><small>PER PUNCH</small><strong id="hbClickPower">1</strong></div>'+
      '<div class="hb-stat"><small>PASSIVE / SEC</small><strong id="hbDps">0</strong></div></div>'+
      '<div class="hb-play"><div class="hb-arena" id="hbArena" data-tier="'+boss.skin+'">'+
      '<span class="hbc-arena-title" id="hbcBoss">'+boss.name+'</span>'+
      '<span class="hb-chain"></span><button type="button" id="hbPunch" class="hb-bag" aria-label="Punch the heavy bag"><span class="hb-bag-art"></span></button>'+
      '<div class="hb-hint">TAP TO COMBO · 6 HITS CHARGE A HEAVY STRIKE</div>'+
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
    const hit=e.target.closest("#hbcFinisher");
    if(hit){e.preventDefault();finisher();return;}
    const next=e.target.closest("#hbcContinue");
    if(next){e.preventDefault();advance();return;}
    const again=e.target.closest("#hbcReplay");
    if(again){e.preventDefault();replay();}
  });
  window.addEventListener("pagehide",function(){save(true);});
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