/* THE BUREAU — HAYWIRE: original hay-search incremental game.
   No third-party libraries. One hidden needle, persistent progress, offline automation. */
(() => {
  'use strict';
  const KEY = 'bureau-haywire-v1', TOTAL = 5000000, MAX_OFFLINE = 4 * 3600000;
  const TOOLS = [
    {name:'Bare hands', power:5, cost:0, icon:'✋'},
    {name:'Garden rake', power:25, cost:70, icon:'〽'},
    {name:'Pitchfork', power:110, cost:850, icon:'♆'},
    {name:'Hay vacuum', power:490, cost:10500, icon:'◉'},
    {name:'Industrial shredder', power:2300, cost:135000, icon:'✸'},
    {name:'Magnetic harvester', power:11000, cost:1750000, icon:'⦿'}
  ];
  const MACHINES = [
    {name:'Hand sifter', rate:4, cost:55, icon:'☷', detail:'A second pair of hands'},
    {name:'Rotary rake', rate:30, cost:520, icon:'⚙', detail:'Slow but reliable'},
    {name:'Conveyor belt', rate:220, cost:6300, icon:'⇉', detail:'Continuous collection'},
    {name:'Air separator', rate:1300, cost:62000, icon:'◌', detail:'High-volume filtering'},
    {name:'Industrial line', rate:6500, cost:420000, icon:'▥', detail:'A proper hay factory'},
    {name:'Magnetic array', rate:28000, cost:1800000, icon:'⌁', detail:'Search at scale'}
  ];
  const UPGRADES = [
    {id:'autoSell', title:'Automatic baler', icon:'▣', detail:'Sell incoming straw automatically', prices:[440]},
    {id:'value', title:'Better bale contracts', icon:'$', detail:'+45% straw value per level', prices:[380,4200,52000]},
    {id:'motor', title:'High-torque motors', icon:'⚡', detail:'+35% machine output per level', prices:[950,12500,160000]},
    {id:'capacity', title:'Storage expansion', icon:'◫', detail:'3× warehouse capacity per level', prices:[260,2800,28000]},
    {id:'detector', title:'Metal detection', icon:'◎', detail:'See distance clues to the needle', prices:[8200,86000]}
  ];
  const CHAPTERS = [
    {at:0, name:'THE SPLIT SEAM', sub:'A mysterious mountain of stuffing.'},
    {at:300000, name:'THE GOLDEN CORE', sub:'Your first real operation.'},
    {at:1000000, name:'THE DUSTY DEEP', sub:'Straw as far as the eye can see.'},
    {at:2400000, name:'THE INDUSTRIAL DIG', sub:'Let the machines do the heavy lifting.'},
    {at:4000000, name:'THE LAST STRANDS', sub:'One needle. One chance to spot it.'}
  ];
  const $ = id => document.getElementById(id);
  const fmt = n => {
    const x = Math.max(0, Number(n)||0);
    if (x >= 1000000000) return (x/1000000000).toFixed(2)+'B';
    if (x >= 1000000) return (x/1000000).toFixed(2)+'M';
    if (x >= 10000) return (x/1000).toFixed(1)+'K';
    return Math.floor(x).toLocaleString('en-US');
  };
  const money = n => '$'+fmt(n);
  const bound = (n,min,max) => Math.min(max,Math.max(min, Number.isFinite(Number(n)) ? Number(n) : min));
  const init = () => ({
    started:false, found:false, signal:false, needleAt: Math.floor(TOTAL * (.18 + Math.random()*.76)),
    searched:0, cash:0, earned:0, straw:0, sold:0, scoops:0, finds:0, remainder:0,
    tool:0, machines:[0,0,0,0,0,0], upgrades:{autoSell:0,value:0,motor:0,capacity:0,detector:0},
    lastTick:Date.now()
  });
  function load(){
    let old=null;try {old=JSON.parse(localStorage.getItem(KEY)||'null');} catch {}
    if (!old || typeof old !== 'object') return init();
    const d=init();
    for(const k of ['started','found','signal']) d[k]=old[k]===true;
    for(const k of ['searched','cash','earned','straw','sold','scoops','finds'])
      d[k]=bound(old[k],0,k==='searched'?TOTAL:1e15);
    d.needleAt=Math.floor(bound(old.needleAt,Math.floor(TOTAL*.18),Math.floor(TOTAL*.94)));
    d.tool=Math.floor(bound(old.tool,0,TOOLS.length-1));
    d.machines=d.machines.map((_,i)=>Math.floor(bound(old.machines?.[i],0,9999)));
    for(const u of UPGRADES) d.upgrades[u.id]=Math.floor(bound(old.upgrades?.[u.id],0,u.prices.length));
    d.remainder=bound(old.remainder,0,0.999999);
    d.lastTick=bound(old.lastTick,0,Date.now());
    if (d.searched>=d.needleAt && !d.found) d.signal=true;
    return d;
  }
  let s=load(), tab='machines', bulk='1', message='', messageAt=0, lastSave=0, lastRender=0, oldChapter=-1, lastPointer=0;
  let ticker=null, booted=false;
  const maxStock=()=>1200*Math.pow(3,s.upgrades.capacity);
  const unitPrice=()=>.65*(1+.45*s.upgrades.value);
  const output=()=>MACHINES.reduce((sum,m,i)=>sum+s.machines[i]*m.rate,0)*(1+.35*s.upgrades.motor);
  const chapter=()=>CHAPTERS.reduce((n,c,i)=>s.searched>=c.at?i:n,0);
  const say=t=>{message=t;messageAt=Date.now();};
  function save(){try {localStorage.setItem(KEY,JSON.stringify(s));lastSave=Date.now();} catch {}}
  function sell(){
    if(!s.straw) return false;
    const gain=s.straw*unitPrice();
    s.cash+=gain;s.earned+=gain;s.sold+=s.straw;s.straw=0;
    return true;
  }
  function search(amount,byMachine=false){
    if(!s.started||s.found||s.signal)return 0;
    let n=Math.min(Math.max(0,Math.floor(amount)),TOTAL-s.searched);
    if(s.upgrades.autoSell===0)n=Math.min(n,Math.floor(maxStock()-s.straw));
    if(n<=0)return 0;
    if(s.searched+n>=s.needleAt){n=s.needleAt-s.searched;s.signal=true;say('METAL SIGNATURE DETECTED — THE NEEDLE IS HERE!');}
    const before=s.searched;
    s.searched+=n;
    s.straw+=n;
    const discoveries=Math.floor(s.searched/3500)-Math.floor(before/3500);
    if(discoveries>0){
      s.finds+=discoveries;
      const bonus=discoveries*95*(1+Math.floor(s.searched/1000000));
      s.cash+=bonus;s.earned+=bonus;
      if(!byMachine)say('OLD COINS FOUND  ·  +'+money(bonus));
    }
    if(s.upgrades.autoSell) sell();
    if(s.searched>=TOTAL&&!s.signal)s.signal=true;
    return n;
  }
  function tick(now){
    const dt=Math.min(MAX_OFFLINE,Math.max(0,now-s.lastTick));
    s.lastTick=now;
    if(!s.started||s.found||s.signal||dt<=0)return 0;
    const work=output()*dt/1000+s.remainder;
    s.remainder=work-Math.floor(work);
    return search(work,true);
  }
  const mPrice=i=>Math.ceil(MACHINES[i].cost*Math.pow(1.19,s.machines[i]));
  function bundle(i,n){
    let cost=0;
    for(let j=0;j<n;j++) {cost+=Math.ceil(MACHINES[i].cost*Math.pow(1.19,s.machines[i]+j));if(cost>1e15)break;}
    return cost;
  }
  function offer(i){
    if(bulk==='1'||bulk==='10'){const qty=Number(bulk);return{qty,cost:bundle(i,qty)};}
    let lo=0,hi=250;
    while(lo<hi){const m=Math.ceil((lo+hi)/2);if(bundle(i,m)<=s.cash)lo=m;else hi=m-1;}
    return {qty:lo,cost:lo?bundle(i,lo):mPrice(i)};
  }
  function shopAllowed(i){return s.searched >= [0,0,10000,80000,400000,1500000][i];}
  function machineRows(){
    return MACHINES.map((m,i)=>{
      const locked=!shopAllowed(i),o=offer(i),owned=s.machines[i],affordable=o.qty>0&&s.cash>=o.cost;
      return "<div class='hw-offer"+(locked?" locked":"")+"' data-machine-row='"+i+"'>"+
       "<div class='hw-offer-icon'>"+m.icon+"</div><div class='hw-offer-info'><strong>"+m.name+(owned?" <span>×"+owned+"</span>":"")+"</strong><small>"+(locked?"UNLOCK AT "+fmt([0,0,10000,80000,400000,1500000][i])+" STRANDS":fmt(m.rate)+"/SEC EACH · "+m.detail)+"</small></div>"+
       "<button type='button' class='hw-buy' data-act='machine' data-index='"+i+"' "+(locked||!affordable?"disabled":"")+">"+(locked?"LOCKED":bulk==='MAX'&&o.qty?"×"+o.qty+" · ":"")+money(o.cost)+"</button></div>";
    }).join('');
  }
  function upgradeRows(){
    const nextTool=TOOLS[s.tool+1],toolBlock=nextTool?
      "<div class='hw-offer'><div class='hw-offer-icon'>"+nextTool.icon+"</div><div class='hw-offer-info'><strong>"+nextTool.name+"</strong><small>"+fmt(nextTool.power)+" STRANDS / CLICK · PERMANENT TOOL</small></div><button type='button' class='hw-buy' data-act='tool' "+(s.cash<nextTool.cost?"disabled":"")+">"+money(nextTool.cost)+"</button></div>":
      "<div class='hw-offer hw-owned'><div class='hw-offer-icon'>✓</div><div class='hw-offer-info'><strong>Maximum tool reached</strong><small>All manual tools unlocked</small></div><span class='hw-owned-text'>MAX</span></div>";
    return toolBlock+UPGRADES.map(u=>{
      const level=s.upgrades[u.id],completed=level>=u.prices.length,price=completed?0:u.prices[level];
      return "<div class='hw-offer"+(completed?" hw-owned":"")+"'><div class='hw-offer-icon'>"+u.icon+"</div><div class='hw-offer-info'><strong>"+u.title+(level?" <span>LV "+level+"</span>":"")+"</strong><small>"+u.detail+"</small></div>"+
      (completed?"<span class='hw-owned-text'>OWNED</span>":"<button type='button' class='hw-buy' data-act='upgrade' data-id='"+u.id+"' "+(s.cash<price?"disabled":"")+">"+money(price)+"</button>")+"</div>";
    }).join('');
  }
  function meterLabel(){
    if(!s.upgrades.detector)return 'Detector locked · upgrade in the workshop';
    const left=s.needleAt-s.searched,portion=left/TOTAL;
    if(s.upgrades.detector===1)return portion>.35?'NO METAL SIGNAL':portion>.13?'FAINT SIGNAL':portion>.04?'SIGNAL GETTING STRONGER':'VERY STRONG SIGNAL';
    return left>500000?'SIGNAL: DISTANT':left>100000?'SIGNAL: APPROACHING':left>15000?'SIGNAL: NEARBY':left>0?'SIGNAL: EXTREMELY CLOSE':'SIGNAL: TARGET FOUND';
  }
  function view(){
    const percent=s.searched/TOTAL*100, current=CHAPTERS[chapter()];
    if(!s.started)return "<div class='hw'><div class='hw-top'><div class='hw-eyebrow'>THE BUREAU / ONE IMPOSSIBLE JOB</div><div class='hw-logo'>HAY<span>WIRE.</span></div><p>A tiny needle. A very bad idea.</p></div>"+
      "<section class='hw-intro'><div class='hw-intro-bag'><div class='hw-chain'></div><div class='hw-sack'><span>HEAVY<br>BAG</span><i>✳</i></div><div class='hw-intro-hay'>〰 〃 ﹏ 〰</div></div>"+
      "<div class='hw-quote'>who the f put a needle in my hay</div><p>The punching bag is stuffed with "+fmt(TOTAL)+" pieces of hay.<br>One of them hides a needle. Tear it open, then search every strand.</p>"+
      "<button type='button' class='hw-primary hw-start' data-act='start'>RIP OPEN THE BAG <span>↗</span></button><small>Collect hay · sell bales · upgrade tools · build a factory · find the needle</small></section></div>";
    return "<div class='hw'>"+
      "<header class='hw-head'><div><div class='hw-eyebrow'>THE BUREAU / AN ABSURD SEARCH OPERATION</div><h1>HAY<span>WIRE.</span></h1><p>who the f put a needle in my hay</p></div><div class='hw-chapter'>ZONE "+String(chapter()+1).padStart(2,'0')+" / 05</div></header>"+
      "<div class='hw-numbers'><div><small>STRAW SEARCHED</small><strong id='hw-count'>"+fmt(s.searched)+"</strong><em>/ "+fmt(TOTAL)+"</em></div><div><small>CASH</small><strong class='hw-green' id='hw-money'>"+money(s.cash)+"</strong></div><div><small>AUTO / SEC</small><strong id='hw-auto'>"+fmt(output())+"</strong></div></div>"+
      "<div class='hw-layout'><div class='hw-main'>"+
      "<section class='hw-pit'><div class='hw-pit-head'><span>THE BAG'S INSIDES</span><span id='hw-pit-stage'>"+current.name+"</span></div><h2>"+current.name+"</h2><div class='hw-pit-sub'>"+current.sub+"</div>"+
      "<div class='hw-dig' id='hw-dig'>"+
      "<div class='hw-glow'></div><div class='hw-bag-rim' aria-hidden='true'><span class='hw-rim-stitches'></span></div><div class='hw-ripped-shell' aria-hidden='true'><span class='hw-tear-cavity'></span><span class='hw-tear-fiber hw-fiber-a'></span><span class='hw-tear-fiber hw-fiber-b'></span><span class='hw-tear-fiber hw-fiber-c'></span><span class='hw-bag-flap hw-bag-flap-left'></span><span class='hw-bag-flap hw-bag-flap-right'></span><span class='hw-hanging-thread hw-thread-a'></span><span class='hw-hanging-thread hw-thread-b'></span></div>"+
      "<button class='hw-hay' id='hw-hay' type='button' data-act='dig' aria-label='Search through the hay' "+(s.signal||s.found?"disabled":"")+"><span class='hw-straw-texture' aria-hidden='true'></span><span class='hw-scoop-label' id='hw-scoop-label'>"+(s.signal?'SIGNAL FOUND':s.found?'NEEDLE FOUND':'CLICK TO SEARCH')+"</span><span class='hw-fx' aria-hidden='true'></span></button>"+
      "<div class='hw-needle"+(s.signal||s.found?' show':'')+"' aria-hidden='true'><span></span></div>"+
      "</div>"+
      (s.found?"<div class='hw-won'><b>✦ YOU FOUND THE NEEDLE ✦</b><span>Hidden in "+fmt(s.needleAt)+" pieces of straw. Case closed.</span></div>":
      s.signal?"<button type='button' class='hw-primary hw-discover' data-act='claim'>✦ PULL OUT THE NEEDLE</button>":
      "<div class='hw-dig-foot'><b id='hw-power'>+"+fmt(TOOLS[s.tool].power)+"</b> STRANDS PER CLICK <span>● "+TOOLS[s.tool].name.toUpperCase()+"</span></div>")+
      "<div class='hw-prog'><div class='hw-prog-label'><span>SEARCH PROGRESS</span><b id='hw-progress'>"+percent.toFixed(3)+"%</b></div><div class='hw-progress-track'><span id='hw-progress-fill' style='width:"+percent+"%'></span></div></div>"+
      "<div class='hw-detector'><span class='hw-led'></span><small id='hw-signal'>"+meterLabel()+"</small></div></section>"+
      "<section class='hw-warehouse'><div class='hw-panel-head'><h3>HAY WAREHOUSE</h3><small>STORAGE / SELL</small></div><div class='hw-warehouse-row'><div><strong id='hw-stock'>"+fmt(s.straw)+"</strong><span> / <span id='hw-capacity'>"+fmt(maxStock())+"</span> STRANDS</span></div><button type='button' class='hw-primary hw-sell' data-act='sell' "+(s.straw<1?"disabled":"")+">SELL HAY <span id='hw-sale'>"+money(s.straw*unitPrice())+"</span></button></div><div class='hw-stock-track'><span id='hw-stock-fill' style='width:"+(s.straw/maxStock()*100)+"%'></span></div><div class='hw-warehouse-help'>"+(s.upgrades.autoSell?'✓ AUTO BALING ACTIVE · STRAW SELLS ITSELF':'BUY AN AUTOMATIC BALER TO KEEP MACHINES RUNNING')+"</div></section>"+
      "<section class='hw-milestones'><div class='hw-panel-head'><h3>THE OPERATION</h3><small>5 STAGES</small></div><div class='hw-zones'>"+CHAPTERS.map((c,i)=>"<div class='hw-zone"+(i===chapter()?' current':i<chapter()?' complete':'')+"'><b>"+(i<chapter()?'✓':i+1)+"</b><span>"+c.name+"</span></div>").join('')+"</div></section></div>"+
      "<aside class='hw-side'><div class='hw-shop-head'><div><div class='hw-eyebrow'>BUILD YOUR OPERATION</div><h2>WORKSHOP</h2></div><div class='hw-bulk'><button data-act='bulk' data-bulk='1' class='"+(bulk==='1'?'selected':'')+"'>×1</button><button data-act='bulk' data-bulk='10' class='"+(bulk==='10'?'selected':'')+"'>×10</button><button data-act='bulk' data-bulk='MAX' class='"+(bulk==='MAX'?'selected':'')+"'>MAX</button></div></div>"+
      "<div class='hw-tabs' role='tablist' aria-label='Workshop sections'><button type='button' role='tab' aria-selected='"+(tab==='machines')+"' data-act='tab' data-tab='machines'>MACHINES</button><button type='button' role='tab' aria-selected='"+(tab==='upgrades')+"' data-act='tab' data-tab='upgrades'>UPGRADES</button></div>"+
      "<div class='hw-shop-body'>"+(tab==='machines'?machineRows():upgradeRows())+"</div>"+
      "<div class='hw-tip'><strong>THE SEARCH LOOP</strong><span>Dig → collect hay → sell it → improve tools → automate → scan for metal.</span></div>"+
      "<section class='hw-ledger'><div><span>TOTAL STRAW SOLD</span><strong id='hw-sold'>"+fmt(s.sold)+"</strong></div><div><span>VALUABLES FOUND</span><strong id='hw-finds'>"+fmt(s.finds)+"</strong></div><div><span>TOTAL CLICKS</span><strong id='hw-clicks'>"+fmt(s.scoops)+"</strong></div></section></aside></div>"+
      "<footer class='hw-footer'><span>LOCAL SAVE · UP TO 4 HOURS OFFLINE AUTOMATION</span><button type='button' data-act='reset'>RESET SEARCH</button></footer>"+
      "<div class='hw-toast' id='hw-toast' role='status' aria-live='polite' hidden></div></div>";
  }
  function render(){
    const root=$('content');if(!root)return;
    root.innerHTML=view();
    oldChapter=chapter();lastRender=Date.now();
    sync();
  }
  function put(id,v){const e=$(id);if(e&&e.textContent!==String(v))e.textContent=String(v);}
  function sync(){
    if(!s.started)return;
    put('hw-count',fmt(s.searched));put('hw-money',money(s.cash));put('hw-auto',fmt(output()));
    put('hw-stock',fmt(s.straw));put('hw-capacity',fmt(maxStock()));put('hw-sale',money(s.straw*unitPrice()));
    put('hw-signal',s.signal?'NEEDLE LOCATION CONFIRMED':s.found?'CASE CLOSED':meterLabel());
    put('hw-sold',fmt(s.sold));put('hw-clicks',fmt(s.scoops));put('hw-finds',fmt(s.finds));
    const fraction=s.searched/TOTAL*100;
    put('hw-progress',fraction.toFixed(3)+'%');
    const p=$('hw-progress-fill');if(p)p.style.width=fraction+'%';
    const stock=$('hw-stock-fill');if(stock)stock.style.width=Math.min(100,s.straw/maxStock()*100)+'%';
    const sellButton=document.querySelector("[data-act='sell']");if(sellButton)sellButton.disabled=s.straw<1;
    const toast=$('hw-toast');
    if(toast){toast.hidden=!message||Date.now()-messageAt>3900;if(!toast.hidden)toast.textContent=message;}
    for(const b of document.querySelectorAll("[data-act='machine']")){
      const i=Number(b.getAttribute('data-index')),o=offer(i),locked=!shopAllowed(i);
      b.disabled=locked||!o.qty||s.cash<o.cost;
      b.textContent=locked?'LOCKED':(bulk==='MAX'&&o.qty?'×'+o.qty+' · ':'')+money(o.cost);
    }
    for(const b of document.querySelectorAll("[data-act='upgrade']")){
      const u=UPGRADES.find(item=>item.id===b.getAttribute('data-id'));
      if(!u)continue;const price=u.prices[s.upgrades[u.id]];
      b.disabled=s.cash<price;
    }
    const toolButton=document.querySelector("[data-act='tool']");
    if(toolButton)toolButton.disabled=s.cash<TOOLS[s.tool+1].cost;
    const hay=$('hw-hay');
    if(hay) {
      const remaining=(TOTAL-s.searched)/TOTAL;
      hay.style.setProperty('--fill',Math.max(.16,Math.pow(remaining,.56)).toFixed(4));
      hay.style.setProperty('--depth',Math.floor((1-remaining)*65)+'%');
    }
  }
  function fx(){
    const pit=$('hw-dig'),pile=$('hw-hay');
    if(!pit||!pile)return;
    pile.classList.remove('hit');void pile.offsetWidth;pile.classList.add('hit');
    const spark=document.createElement('span');
    spark.className='hw-spark';spark.textContent='+'+fmt(TOOLS[s.tool].power);
    spark.style.left=(30+Math.random()*40)+'%';
    pit.appendChild(spark);
    setTimeout(()=>spark.remove(),600);
  }
  function buyMachine(i){
    if(!Number.isInteger(i)||i<0||i>=MACHINES.length||!shopAllowed(i))return;
    const o=offer(i);
    if(!o.qty||s.cash<o.cost)return;
    s.cash-=o.cost;s.machines[i]+=o.qty;
    say('INSTALLED '+o.qty+' × '+MACHINES[i].name.toUpperCase());save();render();
  }
  function handle(act,node){
    const now=Date.now();
    tick(now);
    if(act==='start'){s.started=true;s.lastTick=now;say('THE BAG IS OPEN. START DIGGING.');save();render();return;}
    if(act==='dig'){
      if(s.found||s.signal)return;
      s.scoops++;const count=search(TOOLS[s.tool].power);
      if(!count&&s.straw>=maxStock())say('STORAGE FULL — SELL YOUR HAY');
      fx();sync();
      if(s.signal||chapter()!==oldChapter){save();render();}
      return;
    }
    if(act==='sell'){if(sell()){say('BALES SOLD');save();render();}return;}
    if(act==='claim'){
      if(!s.signal||s.found)return;
      s.found=true;s.signal=false;
      say('THE NEEDLE HAS BEEN FOUND.');save();render();return;
    }
    if(act==='tab'){tab=node.dataset.tab==='upgrades'?'upgrades':'machines';render();return;}
    if(act==='bulk'){bulk=['1','10','MAX'].includes(node.dataset.bulk)?node.dataset.bulk:'1';render();return;}
    if(act==='machine'){buyMachine(Number(node.dataset.index));return;}
    if(act==='tool'){
      const next=TOOLS[s.tool+1];if(!next||s.cash<next.cost)return;
      s.cash-=next.cost;s.tool++;say('TOOL UNLOCKED: '+next.name.toUpperCase());save();render();return;
    }
    if(act==='upgrade'){
      const u=UPGRADES.find(x=>x.id===node.dataset.id);
      if(!u)return;
      const level=s.upgrades[u.id],price=u.prices[level];if(price===undefined||s.cash<price)return;
      s.cash-=price;s.upgrades[u.id]++;
      if(u.id==='autoSell')sell();
      say('UPGRADE UNLOCKED: '+u.title.toUpperCase());save();render();return;
    }
    if(act==='reset'){
      if(window.confirm('Reset your entire hay search? This deletes your HAYWIRE progress (not the old boxing game).')){
        s=init();tab='machines';bulk='1';save();render();
      }
    }
  }
  function begin(){
    if(booted||!$('content'))return;
    booted=true;
    // Catch up offline processing without a runaway loop. Do not skip the hidden needle.
    if(s.started&&!s.found) {
      const elapsed=Math.min(MAX_OFFLINE,Math.max(0,Date.now()-s.lastTick));
      const earned=tick(Date.now());
      if(elapsed>45000&&earned>0)say('WHILE YOU WERE AWAY: '+fmt(earned)+' STRANDS SEARCHED');
    }
    render();
    $('content').addEventListener('click',e=>{
      const node=e.target.closest('[data-act]');if(!node||node.disabled)return;
      // Native click is used for mouse, keyboard, and touch.
      handle(node.dataset.act,node);
    });
    ticker=setInterval(()=>{
      if(document.hidden)return;
      const wasSignal=s.signal,wasChapter=chapter();
      tick(Date.now());
      if(wasSignal!==s.signal||wasChapter!==chapter()||Date.now()-lastRender>3500)render();
      else sync();
      if(Date.now()-lastSave>5000)save();
    },400);
    document.addEventListener('visibilitychange',()=>{if(document.hidden)save();else {tick(Date.now());render();}});
    window.addEventListener('pagehide',save);
    window.addEventListener('beforeunload',save);
    window.openHeavyBag=()=>{if(!booted)begin();else render();};
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',begin);
  else begin();
})();