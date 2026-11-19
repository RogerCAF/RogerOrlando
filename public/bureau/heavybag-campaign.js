(function heavyBagCampaign() {
  'use strict';

  const KEY = 'the-bureau-heavybag-arcade-v1';
  const WORLDS = [
    {name:'THE GYM', kicker:'Earn your gloves', accent:'#e9ae76', bags:['Canvas Rookie','Split Seam','Iron Core','Gym Guardian']},
    {name:'THE UNDERGROUND', kicker:'No easy rounds', accent:'#f17965', bags:['Brick Wall','Redline','Night Shift','Pit Boss']},
    {name:'THE FACTORY', kicker:'Steel meets skin', accent:'#e5bb75', bags:['Rivet','Steel Skin','Shock Bag','The Press']},
    {name:'THE ARENA', kicker:'Only contenders remain', accent:'#a9abf8', bags:['Phantom','Blitz','Fortress','The Champion']},
    {name:'THE FINAL BAG', kicker:'One last challenge', accent:'#ed6967', bags:['Blackout','No Mercy','Last Warning','THE FINAL BAG']}
  ];
  const BOSS_PHASES = [
    {hint:'PHASE 1 / Precision. Build your combo and charge the finisher.'},
    {hint:'PHASE 2 / Iron Guard. Good hits are resisted; aim for PERFECT.'},
    {hint:'PHASE 3 / Redline. Faster timing, smaller window; perfect hits break through.'}
  ];
  const HEALTH = [75,110,165,240,325,420,570,750,950,1220,1550,1950,2400,3050,3850,4700,5800,7000,8200,12000];
  const TYPE = ['basic','basic','armor','heavy','heavy','speed','guard','armor','armor','guard','speed','heavy','speed','speed','armor','guard','heavy','guard','armor','final'];
  const MODES = {
    basic:{label:'RHYTHM',hint:'Find your timing. Every perfect hit builds momentum.'},
    armor:{label:'ARMOR BREAK',hint:'Land two perfect hits to crack the shell. Strike while it is exposed.'},
    speed:{label:'SPEED CHAIN',hint:'Fast needle. Every second consecutive perfect lands bonus damage.'},
    guard:{label:'GUARD WINDOW',hint:'Watch the shield. Hit during OPEN, or pierce it with a perfect.'},
    heavy:{label:'CRUSHING BLOWS',hint:'Slower rhythm. Every third consecutive perfect hits extra hard.'},
    final:{label:'CHAMPIONSHIP',hint:'Three final phases. Adapt and finish the campaign.'}
  };
  const UPGRADES = [
    {id:'gloves',icon:'🥊',name:'Impact Gloves',effect:'More base power on every strike',limit:8,cost:35,step:34},
    {id:'technique',icon:'⚡',name:'Precision',effect:'Much stronger perfectly timed hits',limit:7,cost:45,step:46},
    {id:'focus',icon:'◎',name:'Focus',effect:'A larger perfect-hit timing zone',limit:6,cost:50,step:59},
    {id:'finisher',icon:'🔥',name:'Finisher',effect:'Greater damage on a charged finisher',limit:7,cost:65,step:66}
  ];
  const fmt = n => Math.max(0,Math.round(n)).toLocaleString('en-US');
  const clamp = (n,min,max)=>Math.max(min,Math.min(max,n));
  const fresh = () => ({selected:0,unlocked:0,credits:0,upgrades:{gloves:0,technique:0,focus:0,finisher:0},best:Array(20).fill(0),wins:0,finished:false});
  function load() {
    let d;
    try{d=JSON.parse(localStorage.getItem(KEY)||'null')}catch{}
    if (!d || typeof d!=='object') {
      d=fresh();
      // The old saves remain untouched. Carry forward stages already cleared.
      try{
        const previous=JSON.parse(localStorage.getItem('the-bureau-heavybag-campaign-v2')||'null');
        if(previous && Number.isFinite(+previous.stage) && +previous.stage>0) {
          const cleared=clamp(Math.floor(+previous.stage),0,20);
          d.unlocked=clamp(cleared,0,19);d.selected=d.unlocked;
          for(let i=0;i<cleared;i++)d.best[i]=1;
          d.finished=cleared===20;
        }
      }catch{}
      try{
        const old=JSON.parse(localStorage.getItem('the-bureau-heavybag-v2')||'null');
        if(old && Number(old.total)>0) d.credits=clamp(Math.floor(Math.log10(Number(old.total)+1)*18),0,120);
      }catch{}
      return d;
    }
    const f=fresh();
    f.unlocked=clamp(Math.floor(Number(d.unlocked)||0),0,19);
    f.selected=clamp(Number.isFinite(+d.selected)?Math.floor(+d.selected):f.unlocked,0,f.unlocked);
    f.credits=clamp(Number(d.credits)||0,0,1000000);
    for(const u of UPGRADES)f.upgrades[u.id]=clamp(Math.floor(Number(d.upgrades?.[u.id])||0),0,u.limit);
    if(Array.isArray(d.best)) f.best=d.best.slice(0,20).concat(Array(20).fill(0)).slice(0,20).map(v=>clamp(Math.floor(Number(v)||0),0,3));
    f.wins=clamp(Math.floor(Number(d.wins)||0),0,1000000);
    f.finished=Boolean(d.finished && f.best[19]);
    return f;
  }
  let data=load();
  // Keep The Bureau's existing Muay Thai challengeboard connected to this arcade campaign.
  // Poster rewards grant campaign credits; the original mission counters remain available.
  const oldHbEarn=hbEarn;
  hbEarn=function(amount){
    oldHbEarn(amount);
    if(active==='muay' && Number.isFinite(amount) && amount>0){data.credits=clamp(data.credits+amount,0,1000000);save();}
  };
  hbAdvance=function(){return false;};
  if(hbTickTimer!==null){clearInterval(hbTickTimer);hbTickTimer=null;}

  let fight=null;
  let loop=0;
  let lastPaint=0;
  let impactAnimation=null;
  const PAINT_INTERVAL=1000/30; // Update the live UI at most 30 times per second.

  function save(){try{localStorage.setItem(KEY,JSON.stringify(data))}catch{}}
  function cost(u){return Math.ceil(u.cost+u.step*Math.pow(data.upgrades[u.id],1.58))}
  function upgradeBenefit(u,level){
    if(u.id==='gloves')return `${11+level*7} base power`;
    if(u.id==='technique')return `×${(1.85+level*.34).toFixed(2)} perfect`;
    if(u.id==='focus')return `${16+level*3}% timing window`;
    return `×${(6.4+level*2.1).toFixed(1)} finisher`;
  }
  function bagInfo(index=data.selected){
    const world=Math.floor(index/4),slot=index%4;
    return {index,world,slot,name:WORLDS[world].bags[slot],hp:HEALTH[index],type:TYPE[index],gate:index<19&&slot===3,time:35+world*7+(index===19?22:0)};
  }
  function makeFight(){
    const info=bagInfo();
    return {phase:'ready',hp:info.hp,maxHp:info.hp,seconds:info.time,started:0,lastHit:0,combo:0,highestCombo:0,
      hits:0,perfect:0,charge:0,message:'Find your rhythm.',kind:'',stars:0,reward:0,hiddenAt:0,bossPhase:1,armorStreak:0,armorOpenHits:0,enraged:false};
  }
  function canFight(){return active==='bag' && Boolean(document.querySelector('.hbc'))}
  function bossPhaseFor(hp,maxHp){const ratio=hp/maxHp;return ratio>2/3?1:ratio>1/3?2:3;}
  function syncBossPhase(){
    if(bagInfo().type!=='final'||!fight||fight.hp<=0)return;
    const next=bossPhaseFor(fight.hp,fight.maxHp);
    if(next===fight.bossPhase)return;
    fight.bossPhase=next;
    fight.message=next===2?'IRON GUARD — AIM FOR PERFECT!':'REDLINE — FINAL PUSH!';
    soundCue(next===2?310:420,.11);
  }
  function guardOpen(elapsed){return elapsed%3600>=1750;}
  function modeState(elapsed){
    const info=bagInfo();
    if(info.type==='armor')return fight.armorOpenHits>0?'SHELL CRACKED · '+fight.armorOpenHits+' HITS LEFT':'ARMOR · '+fight.armorStreak+'/2 PERFECT';
    if(info.type==='guard')return guardOpen(elapsed)?'GUARD OPEN · STRIKE!':'GUARD UP · WAIT';
    if(info.type==='speed')return 'SPEED CHAIN · '+fight.combo+' COMBO';
    if(info.type==='heavy')return 'POWER COMBO · '+fight.combo+' HITS';
    if(info.type==='final')return 'PHASE '+fight.bossPhase+' OF 3';
    return 'RHYTHM · BUILD YOUR COMBO';
  }
  function timing(elapsed){
    const info=bagInfo();
    const modifier=info.type==='speed'?0.72:info.type==='final'?0.81:info.type==='heavy'?1.12:1;
    const phaseSpeed=info.type==='final' ? (fight.bossPhase===3?0.76:fight.bossPhase===2?0.90:1) : 1;
    const gateSpeed=info.gate&&fight.enraged?.76:1;
    const period=(1780-Math.floor(info.world*125))*modifier*phaseSpeed*gateSpeed;
    const t=((elapsed%period)+period)%period/period;
    const position=(t<.5?t*2:(1-t)*2)*100;
    const width=clamp(16+data.upgrades.focus*3-(info.type==='final'&&fight.bossPhase===3?6:0)-(info.gate&&fight.enraged?3:0),10,36);
    return {position,width,diff:Math.abs(position-50)};
  }
  function soundCue(freq,duration){if(typeof beep==='function')beep(freq,duration)}
  function changeStage(index){
    if(index<0||index>data.unlocked||index>19||fight?.phase==='fighting')return;
    cancelAnimationFrame(loop);loop=0;data.selected=index;save();fight=makeFight();draw();
    // One compositor-only transition when moving between stages; no additional render loop.
    const arena=document.querySelector('.hbc-arena');
    if(arena && typeof arena.animate==='function' && !window.matchMedia('(prefers-reduced-motion: reduce)').matches){
      arena.animate([{opacity:.7,transform:'translateY(7px)'},{opacity:1,transform:'translateY(0)'}],{duration:240,easing:'ease-out'});
    }
  }
  function stageMap(){
    return WORLDS.map((world,w)=>{
      const items=world.bags.map((name,s)=>{
        const index=w*4+s,locked=index>data.unlocked,selected=index===data.selected,stars=data.best[index]||0,gate=s===3&&index<19;
        return `<button type="button" class="hbc-level ${selected?'selected':''} ${locked?'locked':''}" data-hbc-stage="${index}" ${locked?'disabled':''} aria-label="Stage ${index+1}: ${name}${locked?', locked':''}"><span>${String(index+1).padStart(2,'0')}</span><strong>${locked?'???':name}${!locked&&gate?' ★':''}</strong><small>${locked?'LOCKED':stars?'★'.repeat(stars)+'☆'.repeat(3-stars):selected?'CURRENT':'OPEN'}</small></button>`;
      }).join('');
      return `<div class="hbc-world ${w===Math.floor(data.selected/4)?'current':''}"><div class="hbc-world-title"><span>0${w+1} / ${world.name}</span><small>${world.kicker}</small></div><div class="hbc-levels">${items}</div></div>`;
    }).join('');
  }
  function upgradesHtml(){
    return UPGRADES.map(u=>{
      const level=data.upgrades[u.id],max=level===u.limit,price=cost(u),available=!max&&data.credits>=price,disabled=fight.phase==='fighting'||!available;
      return `<button class="hbc-upgrade" type="button" data-hbc-upgrade="${u.id}" ${disabled?'disabled':''}><span class="hbc-up-icon">${u.icon}</span><span class="hbc-up-name"><strong>${u.name} <em>LV.${level}/${u.limit}</em></strong><small>${u.effect}</small><small class="hbc-up-effect">${upgradeBenefit(u,level)}${max?' · MAX':` → ${upgradeBenefit(u,level+1)}`}</small></span><span class="hbc-up-price">${max?'MAX':`◈ ${fmt(price)}`}</span></button>`;
    }).join('');
  }
  function resultHtml(){
    const info=bagInfo();
    if(data.finished&&fight.phase==='ready'&&data.selected===19){
      return `<div class="hbc-final-banner"><span>★ UNDISPUTED HEAVY BAG CHAMPION ★</span><strong>🏆 THE FINAL BAG HAS FALLEN.</strong><p>20 bags defeated · 5 locations conquered · Championship permanently saved. Replay any stage to improve your stars.</p></div><button class="hbc-main-btn" type="button" data-hbc-start>REPLAY THE FINAL BOSS <span>↗</span></button>`;
    }
    if(fight.phase==='ready')return `<p class="hbc-state-intro">${info.index===19?'FINAL BOSS: master precision, break the iron guard, survive Redline.':MODES[info.type].hint+(info.gate?' LAST STAND activates below half HP.':'')}</p><button class="hbc-main-btn" type="button" data-hbc-start>START ROUND <span>↗</span></button>`;
    if(fight.phase==='fighting')return `<div class="hbc-fight-actions"><button id="hbcStrike" class="hbc-main-btn" type="button" data-hbc-hit>STRIKE <span>SPACE</span></button><button id="hbcFinisher" class="hbc-special" type="button" data-hbc-finisher disabled>FINISHER <span>F</span></button></div>`;
    if(fight.phase==='victory')return `<div class="hbc-result victory" role="status"><div class="hbc-result-tag">${info.index===19?'🏆 CHAMPIONSHIP WON':fight.firstClear?'STAGE CLEARED':fight.newBest?'★ NEW PERSONAL BEST':'ROUND CLEARED'} · ${fight.stars} STAR${fight.stars!==1?'S':''}</div><h2>${info.index===19?'UNDEFEATED. UNDISPUTED.':'BAG DESTROYED.'}</h2><p>+${fmt(fight.reward)} credits · ${fight.perfect} perfect hits · best combo ${fight.highestCombo}</p><div class="hbc-stars">${'★'.repeat(fight.stars)}${'☆'.repeat(3-fight.stars)}</div><div class="hbc-result-buttons">${info.index<19?'<button class="hbc-main-btn" data-hbc-next type="button">NEXT BAG →</button>':'<button class="hbc-main-btn" data-hbc-next type="button">VIEW YOUR VICTORY →</button>'}<button class="hbc-special" type="button" data-hbc-retry>REPLAY</button></div></div>`;
    return `<div class="hbc-result defeat"><div class="hbc-result-tag">ROUND EXPIRED</div><h2>NOT THIS TIME.</h2><p>Upgrade your gear or find a cleaner rhythm. Your campaign progress is safe.</p><div class="hbc-result-buttons"><button class="hbc-main-btn" type="button" data-hbc-retry>TRY AGAIN →</button></div></div>`;
  }
  function draw(){
    if(active!=='bag')return;
    if(impactAnimation){impactAnimation.cancel();impactAnimation=null;}
    const info=bagInfo(),world=WORLDS[info.world],stageNum=info.index+1;
    const completed=data.best.filter(Boolean).length;
    const top=`<div class="hbc-kicker">THE BUREAU / HEAVY BAG / STORY MODE</div>
      <div class="hbc-titleline"><div><h1>THE HEAVY BAG<span class="hbc-dot">.</span></h1><p>20 bags. 5 locations. One final fight.</p></div><div class="hbc-credits"><small>YOUR CREDITS</small><strong>◈ <span id="hbcCredits">${fmt(data.credits)}</span></strong></div></div>
      <div class="hbc-overall"><span>CAMPAIGN PROGRESS</span><div class="hbc-overall-rail"><span style="width:${completed*5}%"></span></div><b>${completed}/20</b></div>`;
    const main=`<div class="hbc-layout"><div class="hbc-left">
      <div class="hbc-arena" style="--hbc-color:${world.accent}">
        <div class="hbc-arena-header"><span>WORLD 0${info.world+1} · STAGE ${String(info.slot+1).padStart(2,'0')}</span><span>${info.type==='final'?'FINAL BOSS':info.gate?'★ GATEKEEPER':MODES[info.type].label}</span></div>
        <div class="hbc-bag-name"><span>${world.name}</span><h2>${info.name}</h2></div>
        <div class="hbc-health-label"><span>INTEGRITY</span><strong id="hbcHpText">${fmt(fight.hp)} / ${fmt(fight.maxHp)}</strong></div>
        <div class="hbc-health-rail"><span id="hbcHealth" style="width:100%"></span></div>
        ${info.type!=='final'?'<div class="hbc-mode-description">'+MODES[info.type].hint+'</div><div class="hbc-mode-status" id="hbcModeStatus"></div>':''}
        ${info.gate?'<div class="hbc-gate-status" id="hbcGateStatus">★ GATEKEEPER · LAST STAND AT 50% HP</div>':''}
        ${info.type==='final'?'<div class="hbc-boss-phases" aria-label="Final boss phases"><span class="hbc-boss-step active" id="hbcBossStep1">01 · THE TEST</span><span class="hbc-boss-step" id="hbcBossStep2">02 · IRON GUARD</span><span class="hbc-boss-step" id="hbcBossStep3">03 · REDLINE</span></div><div class="hbc-boss-hint" id="hbcBossHint">PHASE 1 / Precision. Build your combo and charge the finisher.</div>':''}
        <div class="hbc-bag-scene"><div class="hbc-halo"></div><div class="hbc-chain"></div><button id="hbcBag" type="button" class="hbc-bag hbc-skin-${info.world} ${info.type==='armor'||info.type==='final'?'armored':''}" aria-label="Punch ${info.name}"><span class="hbc-bag-body"><span class="hbc-bag-mark">THE<br>BUREAU</span><span class="hbc-bag-stripe"></span><span class="hbc-bag-seam"></span></span></button><div class="hbc-floor"></div><div id="hbcFloating" aria-hidden="true"></div></div>
        <div class="hbc-feedback"><strong id="hbcFeedback">FIND YOUR RHYTHM</strong><span id="hbcCombo">COMBO ×0</span></div>
        <div class="hbc-timing"><div class="hbc-timing-head"><strong>TIMING</strong><span id="hbcTimingText">Hit the center zone</span></div><div class="hbc-timing-rail"><div class="hbc-perfect-zone" id="hbcZone"></div><span id="hbcPulse" class="hbc-pulse" style="left:0%"></span></div><div class="hbc-timing-footer"><small>EARLY</small><small>PERFECT</small><small>LATE</small></div></div>
        <div class="hbc-round-stats"><span>TIME <strong id="hbcTime">${info.time.toFixed(1)}s</strong></span><span>PERFECT <strong id="hbcPerfect">0</strong></span><span>FINISHER <strong id="hbcCharge">0%</strong></span></div>
        <div class="hbc-charge-rail"><span id="hbcChargeFill" style="width:0%"></span></div>
        <div class="hbc-action-area" id="hbcAction">${resultHtml()}</div>
      </div></div><div class="hbc-side"><section class="hbc-side-box"><div class="hbc-box-heading"><strong>TRAINING GEAR</strong><small>Permanent upgrades</small></div><div class="hbc-shop">${upgradesHtml()}</div><p class="hbc-aside-hint">Win rounds to earn credits. No idle income. No prestige. No resets.</p></section>
      <section class="hbc-side-box hbc-road"><div class="hbc-box-heading"><strong>ROAD TO THE FINAL BAG</strong><small>${completed}/20 cleared</small></div><div class="hbc-map">${stageMap()}</div></section></div></div>`;
    const footer=`<div class="hbc-footer"><span>SPACE · STRIKE &nbsp; / &nbsp; F · FINISHER</span><span>PROGRESS SAVES AUTOMATICALLY ON THIS DEVICE</span></div>`;
    const html=`<div class="hb-game hbc">${top}${data.finished?`<div class="hbc-unlocked">★ THE FINAL BAG DEFEATED · CAMPAIGN COMPLETE</div>`:''}${main}${footer}</div>`;
    const host=document.getElementById('content');
    if(!host)return;
    if(!document.querySelector('.hbc')) modal(mark+html);
    else host.innerHTML=mark+html;
    paint(performance.now());
  }
  function paint(now){
    if(!canFight()||!fight)return;
    const info=bagInfo(),running=fight.phase==='fighting';
    const remain=running?Math.max(0,info.time-(now-fight.started)/1000):fight.phase==='ready'?info.time:fight.seconds;
    const el=id=>document.getElementById(id);
    // Avoid writes/layout invalidations when only the timer or timing needle moves.
    const put=(id,value)=>{const node=el(id);if(node&&node.textContent!==value)node.textContent=value;};
    const setWidth=(id,value)=>{const node=el(id);if(node&&node.style.width!==value)node.style.width=value;};
    setWidth('hbcHealth',clamp(100*fight.hp/fight.maxHp,0,100)+'%');
    put('hbcHpText',`${fmt(fight.hp)} / ${fmt(fight.maxHp)}`);
    put('hbcTime',remain.toFixed(1)+'s');
    put('hbcCombo','COMBO ×'+fight.combo);
    put('hbcPerfect',String(fight.perfect));
    put('hbcCharge',Math.floor(fight.charge)+'%');
    setWidth('hbcChargeFill',fight.charge+'%');
    put('hbcFeedback',fight.message.toUpperCase());
    const fin=el('hbcFinisher');if(fin&&fin.disabled!==(fight.charge<100))fin.disabled=fight.charge<100;
    const attack=el('hbcStrike');if(attack&&attack.disabled!==!running)attack.disabled=!running;
    const timingData=timing(running?now-fight.started:0);
    setWidth('hbcZone',timingData.width+'%');
    const pulse=el('hbcPulse');if(pulse&&running)pulse.style.left=timingData.position+'%';
    put('hbcTimingText',running?'Center the moving marker':'Hit the center zone');
    if(info.type!=='final')put('hbcModeStatus',modeState(running?now-fight.started:0));
    if(info.gate)put('hbcGateStatus',fight.enraged?'★ LAST STAND · FASTER TIMING':'★ GATEKEEPER · LAST STAND AT 50% HP');
    if(info.type==='final'){
      put('hbcBossHint',BOSS_PHASES[fight.bossPhase-1].hint);
      for(let i=1;i<=3;i++){
        const step=el('hbcBossStep'+i);
        const cls='hbc-boss-step '+(i<fight.bossPhase?'cleared':i===fight.bossPhase?'active':'');
        if(step&&step.className!==cls)step.className=cls;
      }
    }
  }
  function tick(now){
    loop=0;
    if(!canFight()||!fight||fight.phase!=='fighting')return;
    if(document.hidden){if(!fight.hiddenAt)fight.hiddenAt=now;return} // No rAF loop when hidden.
    const info=bagInfo();
    const remaining=info.time-(now-fight.started)/1000;
    if(remaining<=0){fight.seconds=0;fight.phase='defeat';fight.message='Round expired.';draw();return}
    if(now-lastPaint>=PAINT_INTERVAL){paint(now);lastPaint=now}
    loop=requestAnimationFrame(tick);
  }
  function start(){
    if(!fight||!canFight()||fight.phase==='fighting')return;
    fight=makeFight();
    fight.phase='fighting';
    fight.started=performance.now();
    lastPaint=0;
    fight.message=bagInfo().type==='final'?'THE TEST — FIND THE RHYTHM!':'GO! FIND THE CENTER.';
    cancelAnimationFrame(loop);loop=0;
    draw();
    soundCue(630,.09);
    loop=requestAnimationFrame(tick);
  }
  function floatDamage(amount,kind){
    const arena=document.querySelector('.hbc-bag-scene');if(!arena)return;
    const fx=document.createElement('div');
    fx.className='hbc-dmg '+kind;fx.textContent=kind==='miss'?'MISS':(kind==='perfect'?'PERFECT · ':kind==='finisher'?'FINISHER · ':'')+fmt(amount);
    fx.style.left=(38+Math.random()*20)+'%';fx.style.top=(29+Math.random()*15)+'%';
    arena.appendChild(fx);setTimeout(()=>fx.remove(),850);
    const bag=document.getElementById('hbcBag');
    if(bag&&kind!=='miss'){
      if(typeof bag.animate==='function'){
        if(impactAnimation)impactAnimation.cancel();
        impactAnimation=bag.animate([{transform:'rotate(-1deg)'},{transform:'rotate(11deg) scale(.975)',offset:.35},{transform:'rotate(-2deg)'}],{duration:280,easing:'ease-out'});
      }else{bag.classList.remove('is-hit');void bag.offsetWidth;bag.classList.add('is-hit')}
    }
  }
  function checkEnd(now){
    if(fight.hp>0)return false;
    fight.hp=0;
    fight.seconds=Math.max(0,bagInfo().time-(now-fight.started)/1000);
    fight.phase='victory';
    const ratio=fight.perfect/Math.max(1,fight.hits);
    fight.stars=1+(ratio>=.30?1:0)+(ratio>=.55&&fight.seconds>bagInfo().time*.16?1:0);
    const index=data.selected,previous=data.best[index],first=previous===0;
    fight.firstClear=first;fight.newBest=!first&&fight.stars>previous;
    data.best[index]=Math.max(previous,fight.stars);
    data.unlocked=Math.max(data.unlocked,Math.min(19,index+1));
    data.wins++;
    if(index===19)data.finished=true;
    fight.reward=Math.floor((30+index*27+fight.stars*12)*(first?1:0.28));
    data.credits+=fight.reward;
    hbEarn(fight.reward);hbSave(true);
    save();soundCue(index===19?950:720,.19);draw();return true;
  }
  function hit(finisher=false){
    if(!canFight()||!fight||fight.phase!=='fighting')return;
    const now=performance.now(),info=bagInfo();
    if(now-fight.lastHit<(finisher?390:205))return;
    if(finisher&&fight.charge<100)return;
    fight.lastHit=now;
    const base=(11+data.upgrades.gloves*7)*(1+.035*data.upgrades.technique);
    let damage=0,kind='normal';
    if(finisher){
      damage=base*(6.4+data.upgrades.finisher*2.1)*(1+fight.combo*.028);
      fight.charge=0;
      fight.message='FINISHER!';
      kind='finisher';
      soundCue(260,.2);
    }else{
      const {diff,width}=timing(now-fight.started);
      const perfect=diff<=width/2;
      const good=diff<=width/2+17;
      fight.hits++;
      if(perfect){
        fight.perfect++;fight.combo=clamp(fight.combo+1,0,25);
        fight.charge=clamp(fight.charge+26,0,100);
        damage=base*(1.85+data.upgrades.technique*.34)*(1+fight.combo*.035);
        fight.message='PERFECT TIMING!';
        kind='perfect';soundCue(560,.055);
      }else if(good){
        fight.combo=clamp(fight.combo+1,0,25);fight.charge=clamp(fight.charge+13,0,100);
        damage=base*1.05*(1+fight.combo*.022);
        fight.message='GOOD HIT';kind='good';soundCue(340,.042);
      }else{
        fight.combo=0; // Missing the timing window never generates finisher energy.
        damage=0;fight.message='MISS — COMBO LOST';kind='miss';
        soundCue(155,.043);
      }
      fight.highestCombo=Math.max(fight.highestCombo,fight.combo);
      if(info.type==='armor'){
        if(perfect){
          fight.armorStreak++;
          if(fight.armorStreak>=2&&fight.armorOpenHits===0){
            fight.armorOpenHits=3;fight.armorStreak=0;fight.message='SHELL CRACKED — STRIKE NOW!';
          }
        }else{fight.armorStreak=0;}
        if(fight.armorOpenHits>0&&kind!=='miss'){
          damage*=1.25;fight.armorOpenHits--;
        }else if(!perfect)damage*=.4;
      }
      if(info.type==='speed'&&perfect&&fight.combo%2===0){damage*=1.6;fight.message='SPEED CHAIN!';}
      if(info.type==='heavy'&&perfect&&fight.combo%3===0){damage*=2.0;fight.message='CRUSHING BLOW!';}
      if(info.type==='guard'&&kind!=='miss'){
        if(guardOpen(now-fight.started)){damage*=1.3;fight.message='GUARD OPEN — BONUS DAMAGE!';}
        else if(!perfect){damage*=.2;fight.message='GUARD UP — WAIT FOR OPEN';}
        else{fight.message='PERFECT — GUARD PIERCED!';}
      }
      if(info.type==='final'){
         if(fight.bossPhase===2)damage*=perfect?1.1:.4;
         if(fight.bossPhase===3)damage*=perfect?1.35:.65;
       }
    }
    if(info.type==='final'&&finisher&&fight.bossPhase===3)damage*=1.25;
    damage=Math.max(0,Math.round(damage));
    fight.hp=Math.max(0,fight.hp-damage);
    if(info.gate&&!fight.enraged&&fight.hp>0&&fight.hp<=fight.maxHp/2){
      fight.enraged=true;
      fight.message='★ LAST STAND — FASTER RHYTHM!';
      soundCue(430,.10);
    }
    if(info.type==='final')syncBossPhase();
    hb.total=Math.min(1e35,hb.total+damage);
    if(!finisher)hb.clicks++;
    hbSave();
    floatDamage(damage,kind);
    if(data.selected===0&&fight.hits===5 && typeof unlock==='function')unlock(0);
    if(checkEnd(now))return;
    paint(now);
  }
  function buy(id){
    if(!fight||fight.phase==='fighting')return;
    const u=UPGRADES.find(x=>x.id===id);if(!u)return;
    const level=data.upgrades[id],price=cost(u);
    if(level>=u.limit||price>data.credits)return;
    data.credits-=price;data.upgrades[id]++;
    if(id==='gloves'||id==='technique')hb.levels[id]=(hb.levels[id]||0)+1;
    hbSave(true);save();soundCue(500,.08);draw();
  }
  function next(){
    if(fight?.phase!=='victory')return;
    if(data.selected===19){fight=makeFight();draw();return}
    changeStage(Math.min(data.unlocked,data.selected+1));
  }
  function retry(){if(fight?.phase==='fighting')return;fight=makeFight();draw()}
  window.openHeavyBag=function(){cancelAnimationFrame(loop);loop=0;fight=makeFight();draw()};
  document.addEventListener('click',e=>{
    if(!e.target.closest('.hbc'))return;
    const btn=e.target.closest('button');if(!btn||btn.disabled)return;
    if(btn.hasAttribute('data-hbc-hit')||btn.id==='hbcBag'){if(fight?.phase==='ready')start();else hit();return}
    if(btn.hasAttribute('data-hbc-finisher')){hit(true);return}
    if(btn.hasAttribute('data-hbc-start')){start();return}
    if(btn.hasAttribute('data-hbc-next')){next();return}
    if(btn.hasAttribute('data-hbc-retry')){retry();return}
    if(btn.hasAttribute('data-hbc-stage')){changeStage(Number(btn.dataset.hbcStage));return}
    if(btn.hasAttribute('data-hbc-upgrade'))buy(btn.dataset.hbcUpgrade);
  });
  document.addEventListener('keydown',e=>{
    if(!canFight()||e.repeat||e.ctrlKey||e.metaKey||e.altKey||['INPUT','TEXTAREA','SELECT'].includes(e.target?.tagName))return;
    if(e.code==='Space'){e.preventDefault();if(fight?.phase==='ready')start();else hit()}
    if(e.code==='KeyF'){e.preventDefault();hit(true)}
  });
  document.addEventListener('visibilitychange',()=>{
    if(!fight||fight.phase!=='fighting')return;
    const now=performance.now();
    if(document.hidden){
      if(!fight.hiddenAt)fight.hiddenAt=now;
      if(loop)cancelAnimationFrame(loop);
      loop=0;
    }else if(fight.hiddenAt){
      fight.started+=now-fight.hiddenAt;fight.hiddenAt=0;lastPaint=0;
      if(!loop)loop=requestAnimationFrame(tick);
    }
  });
  window.addEventListener('pagehide',save);
  const style=document.createElement('style');
  style.id='heavybag-campaign-styles';
  style.textContent=`
  .modal:has(.hbc){width:min(1180px,100%)}.hbc{--hc:#e9ae76;max-width:1120px;margin:auto;color:#f4e9dc;font-family:Inter,ui-sans-serif,system-ui,sans-serif}
  .hbc *{box-sizing:border-box}.hbc button{font:inherit}.hbc-kicker{font:10px ui-monospace,monospace;letter-spacing:.25em;color:#c8a579}
  .hbc-titleline{display:flex;align-items:flex-start;justify-content:space-between;gap:20px;margin:8px 0 18px}
  .hbc-titleline h1{font:800 clamp(29px,4vw,43px)/1.05 Inter,system-ui,sans-serif;letter-spacing:-.045em;margin:0}
  .hbc-dot{color:#e8a86b}.hbc-titleline p{font-size:12px;color:#aa9a8b;margin:9px 0 0}
  .hbc-credits{background:#211c1b;border:1px solid #d4a36a55;border-radius:11px;padding:11px 17px;white-space:nowrap}
  .hbc-credits small{display:block;font:9px ui-monospace,monospace;letter-spacing:.14em;color:#a99177;margin-bottom:4px}
  .hbc-credits strong{font:700 21px ui-monospace,monospace;color:#f2c17f}
  .hbc-overall{display:flex;align-items:center;gap:12px;margin-bottom:17px;font:10px ui-monospace,monospace;letter-spacing:.11em;color:#b5a18b}
  .hbc-overall-rail{height:6px;flex:1;border-radius:20px;background:#3a3330;overflow:hidden}.hbc-overall-rail>span{display:block;height:100%;background:linear-gradient(90deg,#a86449,#f6c88f);border-radius:20px}
  .hbc-overall b{color:#ebc49c;font-size:12px}
  .hbc-layout{display:grid;grid-template-columns:minmax(0,1.22fr) minmax(290px,.78fr);gap:13px}
  .hbc-arena,.hbc-side-box{border:1px solid #9d775344;border-radius:14px;background:#11161b;overflow:hidden}
  .hbc-arena{padding:16px;background:radial-gradient(ellipse 80% 45% at 50% 45%,color-mix(in srgb,var(--hbc-color),transparent 91%),transparent),#101418;position:relative}
  .hbc-arena-header{display:flex;justify-content:space-between;gap:10px;color:#b79976;font:10px ui-monospace,monospace;letter-spacing:.14em}
  .hbc-arena-header span:last-child{color:#e9c69a}.hbc-bag-name{text-align:center;margin:12px 0 15px}
  .hbc-bag-name span{font:10px ui-monospace,monospace;letter-spacing:.23em;color:#998b81}.hbc-bag-name h2{margin:5px 0 0;font:800 clamp(23px,3vw,33px) Inter,system-ui,sans-serif;letter-spacing:-.04em}
  .hbc-health-label{display:flex;justify-content:space-between;font:10px ui-monospace,monospace;color:#c5ab93;letter-spacing:.12em}
  .hbc-health-rail,.hbc-charge-rail{overflow:hidden;height:9px;border-radius:20px;background:#403332;margin:7px 0 0}
  .hbc-health-rail span{display:block;height:100%;border-radius:20px;background:linear-gradient(90deg,#b65e4d,#f7a779);transition:width .11s}
  .hbc-bag-scene{height:230px;position:relative;display:flex;align-items:center;justify-content:flex-start;flex-direction:column;overflow:hidden}
  .hbc-halo{position:absolute;left:50%;top:42px;transform:translateX(-50%);width:290px;height:180px;background:radial-gradient(ellipse,color-mix(in srgb,var(--hbc-color),transparent 85%),transparent 64%);pointer-events:none}
  .hbc-chain{height:26px;width:7px;flex-shrink:0;background:repeating-linear-gradient(145deg,#777b7e 0 6px,#1c2729 6px 11px);box-shadow:0 0 9px #0009;z-index:1}
  .hbc-bag{border:0;background:transparent;padding:0;position:relative;z-index:2;cursor:pointer;touch-action:manipulation;transform-origin:50% -25px;animation:hbc-sway 3.5s ease-in-out infinite}
  .hbc-bag-body{display:block;width:115px;height:166px;position:relative;border-radius:27px 27px 35px 35px/25px 25px 28px 28px;border:3px solid #0d1113;background:linear-gradient(90deg,#0b1016,#303842 24%,#181f29 50%,#414046 76%,#0a0e13 100%);box-shadow:14px 12px 21px #0008,inset 8px 1px 9px #ffffff14,inset -10px 0 20px #000a;transition:filter .15s}
  .hbc-bag:focus-visible{outline:2px solid #ffc98e;outline-offset:8px}.hbc-bag:hover .hbc-bag-body{filter:brightness(1.19)}
  .hbc-bag-mark{position:absolute;top:41px;left:0;width:100%;text-align:center;font:800 15px/1.2 Inter,system-ui,sans-serif;letter-spacing:.17em;color:#f4ca96;text-shadow:0 2px 6px #0008}
  .hbc-bag-stripe{position:absolute;left:0;right:0;bottom:30px;height:8px;background:linear-gradient(90deg,#8c4c3c,#d9a16a,#91533c)}
  .hbc-bag-seam{position:absolute;left:15px;right:15px;bottom:19px;border-top:1px dashed #f5d5ad55}
  .hbc-skin-1 .hbc-bag-body{background:linear-gradient(90deg,#130e10,#5a272c 25%,#27181c 56%,#6d3834 76%,#130c0f)}
  .hbc-skin-2 .hbc-bag-body{background:linear-gradient(90deg,#111718,#4b5355 22%,#252d30 55%,#77736d 79%,#0a1113)}
  .hbc-skin-3 .hbc-bag-body{background:linear-gradient(90deg,#151322,#4c435f 25%,#211f36 53%,#636089 77%,#10121f)}
  .hbc-skin-4 .hbc-bag-body{background:linear-gradient(90deg,#11090c,#59212a 23%,#1c0d13 52%,#882f35 74%,#13060b);box-shadow:12px 14px 27px #ef525036,inset 8px 1px 9px #ffffff14,inset -10px 0 20px #000a}
  .hbc-bag.armored .hbc-bag-body:after{content:'';position:absolute;inset:16px 11px;z-index:0;border:1px solid #ffffff22;border-radius:10px;pointer-events:none}
  .hbc-bag.is-hit{animation:hbc-impact .3s ease-out}.hbc-floor{position:absolute;bottom:0;left:15%;right:15%;height:13px;background:radial-gradient(ellipse,#000b,transparent 75%);z-index:0}
  #hbcFloating{position:absolute;inset:0;pointer-events:none}.hbc-dmg{position:absolute;z-index:7;color:#efddc6;font:900 18px ui-monospace,monospace;text-shadow:0 3px 11px #000;animation:hbc-float .8s forwards}
  .hbc-dmg.perfect{color:#ffd181;font-size:22px}.hbc-dmg.finisher{color:#ff837c;font-size:25px}.hbc-dmg.miss{color:#9da0a3;font-size:17px}
  .hbc-feedback{display:flex;justify-content:space-between;gap:8px;align-items:center;border-top:1px solid #ffffff12;padding-top:10px;font:700 11px ui-monospace,monospace;letter-spacing:.1em;color:#e7c99e}
  #hbcCombo{color:#a4aaa9;white-space:nowrap}.hbc-timing{margin-top:14px}.hbc-timing-head{display:flex;justify-content:space-between;gap:10px;font:10px ui-monospace,monospace;color:#d4c3ad}
  .hbc-timing-head span{color:#998d81}.hbc-timing-rail{height:21px;border:1px solid #93806d55;background:linear-gradient(90deg,#4a2222,#392923 25%,#2c312b 50%,#392923 75%,#4a2222);border-radius:5px;position:relative;overflow:visible;margin-top:9px}
  .hbc-perfect-zone{position:absolute;left:50%;top:-1px;bottom:-1px;transform:translateX(-50%);background:#6b9d7245;border:1px solid #a6e3a7aa;border-radius:4px;box-shadow:0 0 20px #8cc58a35}
  .hbc-pulse{position:absolute;top:-7px;bottom:-7px;width:4px;z-index:3;background:#ffe4a9;border-radius:4px;box-shadow:0 0 13px #ffd8a7;transform:translateX(-50%);will-change:left}
  .hbc-timing-footer{display:flex;justify-content:space-between;margin-top:6px;font:9px ui-monospace,monospace;color:#897e74;letter-spacing:.1em}
  .hbc-round-stats{display:flex;justify-content:space-between;gap:7px;flex-wrap:wrap;font:10px ui-monospace,monospace;color:#b3a18d;margin-top:17px}
  .hbc-round-stats strong{color:#f7d0a1;font-size:14px;margin-left:4px}.hbc-charge-rail{height:5px;margin:9px 0 11px;background:#282d2e}
  .hbc-charge-rail span{display:block;background:linear-gradient(90deg,#c65d54,#f2b075);height:100%;transition:width .1s}
  .hbc-action-area{min-height:80px}.hbc-state-intro{font-size:12px;color:#ad9d90;line-height:1.5;margin:4px 0 12px;text-align:center}
  .hbc-main-btn,.hbc-special{border:1px solid #e6b580;border-radius:9px;background:#e9b17b;color:#1e1712;font:800 12px Inter,system-ui,sans-serif!important;letter-spacing:.12em;padding:15px 16px;cursor:pointer;display:inline-flex;justify-content:space-between;align-items:center;gap:10px;transition:background .15s,transform .12s}
  .hbc-main-btn{width:100%}.hbc-main-btn:not(:disabled):hover{background:#ffce9a;transform:translateY(-1px)}
  .hbc-fight-actions{display:flex;gap:9px}.hbc-fight-actions .hbc-main-btn{flex:1}.hbc-special{background:#242428;color:#e9b88b;white-space:nowrap;border-color:#c8986555}
  .hbc-special:disabled{opacity:.42;cursor:not-allowed}.hbc-special:not(:disabled):hover{background:#493126}
  .hbc-result{text-align:center;padding:5px 0}.hbc-result-tag{font:10px ui-monospace,monospace;letter-spacing:.18em;color:#f1bd7d}
  .hbc-result h2{font:900 23px Inter,system-ui,sans-serif;letter-spacing:-.03em;margin:8px 0 4px}.hbc-result p{font-size:12px;color:#aaa095;line-height:1.5;margin:4px 0}
  .hbc-stars{font-size:22px;letter-spacing:.15em;color:#eec28e;margin:8px 0}.hbc-result-buttons{display:flex;gap:8px;margin-top:10px}.hbc-result-buttons .hbc-main-btn{flex:1}
  /* Step 6: one-time result reveal. Opacity and transform avoid recurring layout/paint work. */
  .hbc-result.victory{position:relative;isolation:isolate}
  .hbc-result.victory::before{content:"";position:absolute;left:50%;top:3px;width:min(100%,260px);height:105px;transform:translateX(-50%);background:radial-gradient(ellipse,#f2b27526,transparent 70%);pointer-events:none;z-index:-1}
  .hbc-result.victory .hbc-result-tag{color:#ffd49f}
  .hbc-result.victory h2{font-size:clamp(23px,3vw,29px)}
  @keyframes hbc-win-reveal{from{opacity:0;transform:translateY(9px)}to{opacity:1;transform:translateY(0)}}
  .hbc-result.victory .hbc-result-tag,.hbc-result.victory h2,.hbc-result.victory p,.hbc-result.victory .hbc-stars,.hbc-result.victory .hbc-result-buttons{animation:hbc-win-reveal .36s ease-out both}
  .hbc-result.victory h2{animation-delay:.06s}.hbc-result.victory p{animation-delay:.11s}
  .hbc-result.victory .hbc-stars{animation-delay:.17s}.hbc-result.victory .hbc-result-buttons{animation-delay:.22s}
  .hbc-side{display:flex;flex-direction:column;gap:12px;min-width:0}.hbc-side-box{padding:13px}.hbc-box-heading{display:flex;justify-content:space-between;align-items:center;gap:12px;margin:0 0 12px}
  .hbc-box-heading strong{font:800 11px ui-monospace,monospace;letter-spacing:.12em;color:#f2d2ae}.hbc-box-heading small{font-size:10px;color:#998a7d}
  .hbc-shop{display:grid;gap:6px}.hbc-upgrade{display:grid;grid-template-columns:31px minmax(0,1fr) auto;align-items:center;gap:9px;padding:10px;border-radius:9px;border:1px solid #8b77584b;background:#232527;color:#f5e4d0;text-align:left;cursor:pointer}
  .hbc-upgrade:not(:disabled):hover{border-color:#e3b47b;background:#372f29}.hbc-upgrade:disabled{opacity:.48;cursor:not-allowed}.hbc-up-icon{font-size:20px}
  .hbc-up-name{min-width:0}.hbc-up-name strong{display:block;font-size:11px;font-weight:700}.hbc-up-name em{font:9px ui-monospace,monospace;color:#c8a37e;font-style:normal}
  .hbc-up-name small{font-size:10px;color:#a79a8f;display:block;margin-top:2px;line-height:1.3}.hbc-up-name .hbc-up-effect{color:#eabf85;font-weight:700;margin-top:5px}.hbc-up-price{font:11px ui-monospace,monospace;white-space:nowrap;color:#ecc18c}
  .hbc-aside-hint{font-size:10px;color:#857c75;line-height:1.5;margin:10px 0 0}
  .hbc-road{flex:1}.hbc-map{display:grid;gap:9px;max-height:285px;overflow-y:auto;padding-right:3px}
  .hbc-world-title{display:flex;justify-content:space-between;gap:10px;font:9px ui-monospace,monospace;letter-spacing:.12em;color:#bba187;margin:0 0 5px}
  .hbc-world-title small{color:#777a7b;font-size:9px;letter-spacing:normal}.hbc-levels{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:5px}
  .hbc-level{min-width:0;border:1px solid #776b594b;background:#1d2327;color:#e2d2bc;border-radius:7px;text-align:left;padding:7px 9px;cursor:pointer;display:grid;grid-template-columns:22px 1fr;gap:2px 4px}
  .hbc-level span{color:#a78b72;font:9px ui-monospace,monospace}.hbc-level strong{font-size:10px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.hbc-level small{grid-column:2;font:9px ui-monospace,monospace;color:#ddad79}
  .hbc-level.selected{border-color:#e3b47c;background:#322b27}.hbc-level.locked{opacity:.36;cursor:not-allowed}.hbc-level:not(:disabled):hover{background:#3b302a}
  .hbc-footer{display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap;font:9px ui-monospace,monospace;letter-spacing:.1em;color:#84786e;margin:14px 0 0}
  .hbc-unlocked,.hbc-final-banner{border:1px solid #d9b16d77;background:#3a291d;padding:9px 12px;border-radius:8px;font:11px ui-monospace,monospace;color:#ffcf8e;margin:0 0 12px}
  .hbc-final-banner strong{display:block;font:800 16px Inter,system-ui,sans-serif;margin:7px 0}.hbc-final-banner p{font:11px Inter,system-ui,sans-serif;line-height:1.6;margin:5px 0}
  .hbc-mode-description{margin:9px 0 0;color:#b8a08a;font:10px/1.5 ui-monospace,monospace}
   .hbc-mode-status{margin:5px 0 4px;padding:6px 8px;background:#262521;border:1px solid #a7805155;border-radius:6px;color:#f3c18b;font:700 10px ui-monospace,monospace}
   .hbc-gate-status{margin:6px 0 4px;padding:6px 8px;border-left:2px solid #e4a86f;color:#e8c29e;font:700 10px ui-monospace,monospace}
   .hbc-boss-phases{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:5px;margin:10px 0 0}
   .hbc-boss-step{min-width:0;padding:8px 3px;background:#191c21;border:1px solid #6a5d5955;border-radius:5px;text-align:center;color:#807f85;font:700 clamp(8px,1vw,10px) ui-monospace,monospace;white-space:nowrap}
   .hbc-boss-step.active{background:#5a2e28;border-color:#eab17c;color:#ffdfa9}
   .hbc-boss-step.cleared{background:#213b32;border-color:#658675;color:#a4d4b3}
   .hbc-boss-hint{min-height:25px;padding:6px 0 1px;text-align:center;color:#e6b88e;font:10px/1.5 ui-monospace,monospace}
   @keyframes hbc-sway{0%,100%{transform:rotate(-1deg)}50%{transform:rotate(1deg)}}@keyframes hbc-impact{0%{transform:rotate(0)}35%{transform:rotate(11deg) scale(.975)}100%{transform:rotate(-2deg)}}
  @keyframes hbc-float{0%{transform:translateY(0);opacity:1}100%{transform:translateY(-65px);opacity:0}}
  @media(max-width:780px){.hbc-layout{grid-template-columns:1fr}.hbc-map{max-height:none}.hbc-road{order:1}.hbc-side-box{padding:12px}.hbc-arena{padding:13px}.hbc-bag-scene{height:210px}.hbc-titleline h1{font-size:30px}}
  @media(max-width:440px){.hbc-titleline{gap:9px}.hbc-titleline h1{font-size:26px}.hbc-credits{padding:9px}.hbc-credits strong{font-size:16px}.hbc-overall{font-size:8px}.hbc-fight-actions{gap:5px}.hbc-main-btn,.hbc-special{font-size:10px!important;padding:13px 9px}.hbc-bag-scene{height:206px}.hbc-world-title small{display:none}}
  @media(prefers-reduced-motion:reduce){.hbc-bag,.hbc-bag.is-hit,.hbc-dmg,.hbc-result.victory .hbc-result-tag,.hbc-result.victory h2,.hbc-result.victory p,.hbc-result.victory .hbc-stars,.hbc-result.victory .hbc-result-buttons{animation:none!important}.hbc-main-btn{transition:none!important}}
  `;
  document.head.appendChild(style);
})();
