/* Heavy Bag v4 — finite skill-based arcade campaign; no prestige. */
(function(){
"use strict";
const KEY="the-bureau-heavybag-campaign-v2", OLD_KEY="the-bureau-heavybag-campaign-v1";
const WORLDS=["THE GYM","THE UNDERGROUND","THE FACTORY","THE ARENA","THE FINAL ROOM"];
const RAW=[
["STANDARD ISSUE",28,50,"normal"],["THE SANDBAG",75,110,"rhythm"],["DOUBLE STITCH",160,205,"rhythm"],["GYM BULLY",345,380,"armour"],
["NIGHT SHIFT",670,590,"rhythm"],["IRON EGO",1100,850,"armour"],["DEBT COLLECTOR",1800,1350,"guard"],["CONCRETE THERAPY",2950,2100,"armour"],
["RUST BUCKET",4800,3150,"rhythm"],["STEEL SHELL",7800,4750,"armour"],["PISTON PUNCH",12500,7000,"guard"],["NO REFUNDS",20000,11000,"armour"],
["THE CONTENDER",31000,17000,"rhythm"],["HEAVYWEIGHT",50000,26500,"guard"],["TITLE DEFENDER",80000,41000,"armour"],["THE PROBLEM",130000,65000,"guard"],
["THE LOCKED DOOR",205000,105000,"armour"],["TITANIUM",325000,165000,"guard"],["REDLINE",530000,255000,"rhythm"],["THE IMPOSSIBLE BAG",850000,0,"final"]
];
const FIGHTS=RAW.map((b,i)=>({name:b[0],hp:b[1],bonus:b[2],mechanic:b[3],skin:i===19?7:Math.floor(i/4)}));
const MAX=FIGHTS.length;
const SKILLS=[
{id:"precision",label:"Precision Training",icon:"🎯",desc:"Wider perfect-hit timing zone",base:180,cap:5,growth:2.6},
{id:"momentum",label:"Combo Engine",icon:"⚡",desc:"Charge your power strike faster",base:650,cap:3,growth:2.9},
{id:"finisher",label:"Power Strike",icon:"💥",desc:"+30% special damage per level",base:1500,cap:5,growth:3.0}
];
function fresh(){return{stage:0,damage:0,bestCombo:0,perfectHits:0,completedAt:0,startedAt:Date.now(),skills:{},charge:0,combo:0,lastHit:0};}
function load(){
const a=fresh();try{
const current=JSON.parse(localStorage.getItem(KEY)||"null");
const legacy=current?null:JSON.parse(localStorage.getItem(OLD_KEY)||"null");
const d=current||legacy;if(!d||typeof d!=="object")return a;
let stage=Math.max(0,Math.min(MAX,Math.floor(+d.stage||0)));
if(legacy)stage=[0,2,5,7,10,12,15,18,20][Math.min(8,stage)];
a.stage=stage;
a.bestCombo=Math.max(0,Math.floor(+d.bestCombo||0));
a.perfectHits=Math.max(0,Math.floor(+d.perfectHits||0));
a.startedAt=Math.max(0,+d.startedAt||Date.now());
a.completedAt=Math.max(0,+d.completedAt||0);
if(a.stage===MAX&&a.completedAt===0)a.completedAt=Date.now();
if(a.stage<MAX){
a.damage=Math.min(FIGHTS[stage].hp,Math.max(0,+d.damage||0));
if(legacy){
const oldStage=Math.min(7,Math.max(0,Math.floor(+d.stage||0)));
const oldHp=[70,550,3600,22000,125000,750000,3500000,15000000][oldStage];
a.damage=Math.round(Math.min(1,a.damage/oldHp)*FIGHTS[stage].hp);
}
}
for(const skill of SKILLS)a.skills[skill.id]=Math.max(0,Math.min(skill.cap,Math.floor(+d.skills?.[skill.id]||0)));
return a;
}catch(_){return a;}
}
const game=load();
let lastSave=0,lastPunchAt=0,pulseStart=performance.now(),pulseFrame=0;
function save(force=false){
if(!force&&Date.now()-lastSave<450)return;
lastSave=Date.now();try{localStorage.setItem(KEY,JSON.stringify({
stage:game.stage,damage:game.damage,bestCombo:game.bestCombo,perfectHits:game.perfectHits,
completedAt:game.completedAt,startedAt:game.startedAt,skills:game.skills
}));}catch(_){}
}
function el(id){return document.getElementById(id);}
function set(id,v){const node=el(id);if(node)node.textContent=String(v);}
function visible(id,v){const node=el(id);if(node)node.style.display=v?"":"none";}
function target(){return .5+.14*Math.sin((game.stage+1)*2.1);}
function period(){return Math.max(650,1430-game.stage*38);}
function pulse(){const t=((performance.now()-pulseStart)%(period()*2))/period();return t<=1?t:2-t;}
function startPulse(){
if(pulseFrame)cancelAnimationFrame(pulseFrame);
pulseStart=performance.now();
function draw(){const marker=el("hbcNeedle");if(!marker||active!=="bag"){pulseFrame=0;return;}marker.style.left=(pulse()*100)+"%";pulseFrame=requestAnimationFrame(draw);}
pulseFrame=requestAnimationFrame(draw);
}
function phase(){if(game.stage!==MAX-1)return 1;let p=game.damage/FIGHTS[game.stage].hp;return p>=.67?3:p>=.34?2:1;}
function shop(){return HB_UPGRADES.map(u=>'<button type="button" class="hb-upgrade" data-hb-buy="'+u.id+'"><span class="hb-ico">'+u.icon+'</span><span><strong>'+u.title+' <span class="hb-level">Lv. 0</span></strong><small>'+u.desc+'</small></span><span class="hb-price"></span></button>').join("");}
function skillsHtml(){return SKILLS.map(s=>'<button type="button" class="hb-upgrade" data-hbc-skill="'+s.id+'"><span class="hb-ico">'+s.icon+'</span><span><strong>'+s.label+' <span class="hb-level">Lv. 0</span></strong><small>'+s.desc+'</small></span><span class="hb-price"></span></button>').join("");}
function skillPrice(s){return Math.ceil(s.base*Math.pow(s.growth,game.skills[s.id]||0));}
function route(){return '<div class="hbc-worlds">'+WORLDS.map((world,w)=>{
const start=w*4,done=Math.max(0,Math.min(4,game.stage-start));
return '<div class="hbc-world '+(done===4?"cleared":game.stage>=start&&game.stage<start+4?"active":"locked")+'"><div class="hbc-world-name"><span>0'+(w+1)+' · '+world+'</span><b>'+done+'/4</b></div><div class="hbc-world-bars">'+
Array.from({length:4},(_,j)=>'<span class="'+(start+j<game.stage?"done":start+j===game.stage?"current":"")+'" title="'+FIGHTS[start+j].name+'"></span>').join("")+'</div></div>';
}).join("")+'</div>';}
function impact(amount,perfect,special){
const bag=el("hbPunch");if(bag&&bag.animate){
if(hbImpact)hbImpact.cancel();
hbImpact=bag.animate([{transform:"rotate(0deg)"},{transform:"rotate("+(special?24:perfect?17:9)+"deg) scale(.96)",offset:.38},{transform:"rotate(-3deg)"}],{duration:special?400:225,easing:"ease-out"});
}
const arena=el("hbArena");if(!arena)return;
const floats=arena.querySelectorAll(".hb-float");if(floats.length>=7)floats[0].remove();
const label=document.createElement("span");label.className="hb-float"+(perfect||special?" critical":"");
label.textContent=(special?"POWER! ":perfect?"PERFECT! ":"+")+hbNum(amount);
label.style.left=(28+Math.random()*43)+"%";label.style.top=(20+Math.random()*22)+"%";
arena.append(label);setTimeout(()=>label.remove(),750);
}
function deal(n,perfect=false,special=false){
if(game.stage>=MAX)return;
const fight=FIGHTS[game.stage],amount=Math.max(1,Math.floor(n));
game.damage=Math.min(fight.hp,game.damage+amount);
hbEarn(amount); // Passive income never defeats bosses.
impact(amount,perfect,special);
if(game.damage>=fight.hp&&typeof toast==="function")toast("✦ BAG DOWN! Claim your victory.");
save(game.damage>=fight.hp);hbSave();hbRender();
}
function punch(){
if(active!=="bag"||game.stage>=MAX)return;
const fight=FIGHTS[game.stage];if(game.damage>=fight.hp)return;
const now=performance.now();if(now-lastPunchAt<165)return;lastPunchAt=now;
const diff=Math.abs(pulse()-target());
const perfect=diff<=.075+.012*(game.skills.precision||0),good=diff<=.20+.012*(game.skills.precision||0);
game.combo=good?(now-game.lastHit<=1750?Math.min(16,game.combo+1):1):0;
game.lastHit=now;game.bestCombo=Math.max(game.bestCombo,game.combo);
if(perfect)game.perfectHits++;
game.charge=Math.min(4,game.charge+(perfect?1+(game.skills.momentum||0)*.2:good?.5+(game.skills.momentum||0)*.15:0));
hb.clicks++;if(hb.clicks===5&&typeof unlock==="function")unlock(0);
let quality=perfect?3.4:good?1.2:.22;
if(fight.mechanic==="armour"&&!perfect)quality*=.28;
if(fight.mechanic==="guard"&&!perfect)quality*=.20;
if(fight.mechanic==="final"){
quality*=phase()===1?1:phase()===2?.68:.43;
if(!good)quality*=.20;
}
const damage=hbPerHit()*quality*(1+Math.min(1.6,game.combo*.13));
deal(damage,perfect,false);
const result=el("hbcVerdict");if(result){result.textContent=perfect?"PERFECT!":good?"GOOD HIT":"GLANCING BLOW";result.className="hbc-verdict "+(perfect?"perfect":good?"good":"miss");}
beep(perfect?330:good?185:85,.045);
hbSave();
}
window.hbHit=punch;
function finisher(){
if(active!=="bag"||game.stage>=MAX||game.charge<4)return;
if(game.damage>=FIGHTS[game.stage].hp)return;
const power=hbPerHit()*(24+Math.min(16,game.combo)*2)*(1+.3*(game.skills.finisher||0));
game.charge=0;game.combo=0;
deal(power,true,true);beep(180,.12);
}
function advance(){
if(active!=="bag"||game.stage>=MAX||game.damage<FIGHTS[game.stage].hp)return;
const reward=FIGHTS[game.stage].bonus;if(reward)hbEarn(reward);
game.stage++;game.damage=0;game.charge=0;game.combo=0;game.lastHit=0;lastPunchAt=0;
if(game.stage>=MAX){game.completedAt=Date.now();if(typeof toast==="function")toast("🏆 HEAVY BAG CHAMPION!");}
else if(typeof toast==="function")toast("✦ VICTORY! +"+hbNum(reward)+" credits.");
save(true);hbSave(true);window.openHeavyBag();
}
function buySkill(id){
if(active!=="bag"||game.stage>=MAX)return;
const s=SKILLS.find(x=>x.id===id);if(!s)return;
const lv=game.skills[id]||0,price=skillPrice(s);if(lv>=s.cap||hb.coins<price)return;
hb.coins-=price;game.skills[id]=lv+1;save(true);hbSave(true);beep(440,.07);hbRender();
}
window.hbRender=function(){
if(active!=="bag"||!document.querySelector(".hbc-game")||game.stage>=MAX)return;
const fight=FIGHTS[game.stage],clear=game.damage>=fight.hp;
set("hbCoins",hbNum(hb.coins));set("hbClickPower",hbNum(hbPerHit()));set("hbDps",hbNum(hbPerSecond()));
set("hbClicks",hbNum(hb.clicks));set("hbTotal",hbNum(hb.total));
set("hbRank",WORLDS[Math.floor(game.stage/4)]);
set("hbcBoss",fight.name);set("hbcHP",hbNum(Math.max(0,fight.hp-game.damage))+" / "+hbNum(fight.hp)+" HP");
set("hbcCombo",game.combo+"×");set("hbcCharge",game.charge.toFixed(game.charge%1?1:0)+" / 4");
set("hbcPerfect",hbNum(game.perfectHits));
set("hbcPhase",clear?"STAGE CLEAR":WORLDS[Math.floor(game.stage/4)]+" · "+(game.stage+1)+" / "+MAX);
set("hbcLine",clear?"BAG DESTROYED. TIME TO MOVE ON.":fight.mechanic==="normal"?"Warm up. Find your rhythm.":fight.mechanic==="armour"?"ARMOURED · Only perfectly timed hits cut through.":fight.mechanic==="guard"?"SHIELDED · Watch the golden timing zone.":fight.mechanic==="final"?"FINAL BOSS · Three escalating phases.":"Hit the moving golden zone to build a combo.");
set("hbcNextText",game.stage===MAX-1?"CLAIM THE CHAMPIONSHIP":"NEXT BAG");
set("hbcPhaseNumber",phase()+" / 3");
let hpBar=el("hbcHealth");if(hpBar)hpBar.style.width=Math.max(0,100*(fight.hp-game.damage)/fight.hp)+"%";
let aim=el("hbcTarget");if(aim)aim.style.left=(target()*100)+"%";
let arena=el("hbArena");if(arena)arena.dataset.tier=String(fight.skin);
let bag=el("hbPunch");if(bag)bag.disabled=clear;
visible("hbcFinisher",!clear&&game.charge>=4);visible("hbcContinue",clear);
for(const u of HB_UPGRADES){const n=document.querySelector('[data-hb-buy="'+u.id+'"]');if(!n)continue;
const lv=hbLevel(u.id),price=hbPrice(u);n.disabled=lv>=u.cap||hb.coins<price;
const cost=n.querySelector(".hb-price"),level=n.querySelector(".hb-level");
if(cost)cost.textContent=lv>=u.cap?"MAX":"◈ "+hbNum(price);if(level)level.textContent="Lv. "+lv;}
for(const s of SKILLS){const n=document.querySelector('[data-hbc-skill="'+s.id+'"]');if(!n)continue;
const lv=game.skills[s.id]||0,price=skillPrice(s);n.disabled=lv>=s.cap||hb.coins<price;
const cost=n.querySelector(".hb-price"),level=n.querySelector(".hb-level");
if(cost)cost.textContent=lv>=s.cap?"MAX":"◈ "+hbNum(price);if(level)level.textContent="Lv. "+lv;}
};
window.openHeavyBag=function(){
hbAdvance();const offline=hbOffline;hbOffline=0;
if(pulseFrame)cancelAnimationFrame(pulseFrame);
if(game.stage>=MAX){
modal(mark+'<div class="hb-game hbc-end"><div class="hb-eyebrow">THE BUREAU / CAMPAIGN COMPLETE</div>'+
'<div class="hbc-trophy">🏆</div><h1>THE IMPOSSIBLE IS BROKEN.</h1>'+
'<p>Five locations. Twenty bags. One champion. You actually finished.</p>'+
'<div class="hbc-ending-line">UNDISPUTED HEAVY BAG CHAMPION</div>'+route()+
'<div class="hb-tags"><span class="hb-tag">TOTAL CREDITS EARNED · '+hbNum(hb.total)+'</span><span class="hb-tag">PUNCHES · '+hbNum(hb.clicks)+'</span>'+
'<span class="hb-tag">PERFECT HITS · '+hbNum(game.perfectHits)+'</span><span class="hb-tag">BEST COMBO · '+game.bestCombo+'×</span></div>'+
'<p class="hb-achievements">Your championship, upgrades and records stay saved. No prestige. No forced reset.</p>'+
'<button type="button" class="cta" id="hbcReplay">↻ REPLAY THE FINAL BAG</button></div>');return;
}
const b=FIGHTS[game.stage];
modal(mark+'<div class="hb-game hbc-game"><div class="hb-top"><div><div class="hb-eyebrow">THE BUREAU / ROAD TO THE FINAL BAG</div>'+
'<h1>The Heavy Bag</h1><span class="muted small">20 bags · 5 locations · 1 championship</span></div>'+
'<span class="hb-rank">LOCATION · <b id="hbRank"></b></span></div>'+
(offline>0?'<p class="hb-offline">✦ Offline training: +'+hbNum(offline)+' credits. Passive income does not defeat bags.</p>':"")+
route()+
'<div class="hb-statbar"><div class="hb-stat"><small>TRAINING CREDITS</small><strong id="hbCoins">0</strong></div>'+
'<div class="hb-stat"><small>POWER</small><strong id="hbClickPower">1</strong></div>'+
'<div class="hb-stat"><small>CREDITS / SEC</small><strong id="hbDps">0</strong></div></div>'+
'<div class="hb-play"><div class="hb-arena" id="hbArena" data-tier="'+b.skin+'">'+
'<span class="hbc-arena-title" id="hbcBoss">'+b.name+'</span><span class="hb-chain"></span>'+
'<button type="button" id="hbPunch" class="hb-bag" aria-label="Punch the heavy bag"><span class="hb-bag-art"></span></button>'+
'<div id="hbcVerdict" class="hbc-verdict" aria-live="polite">TIME YOUR PUNCH</div>'+
'<div class="hbc-timing-wrap"><div class="hbc-timing" aria-label="Timing bar: punch as the marker reaches gold">'+
'<span id="hbcTarget" class="hbc-timing-zone"></span><span id="hbcNeedle" class="hbc-timing-needle"></span></div>'+
'<small>HIT WHEN THE MOVING LINE REACHES GOLD</small></div>'+
'<div class="hbc-action"><span>COMBO <b id="hbcCombo">0×</b></span><span>POWER STRIKE <b id="hbcCharge">0 / 4</b></span></div>'+
'<button type="button" id="hbcFinisher" class="cta hbc-finisher" style="display:none">✦ POWER STRIKE</button></div>'+
'<div class="hb-panel"><div class="hb-progress-head"><strong id="hbcPhase"></strong><strong id="hbcHP"></strong></div>'+
'<div class="hb-track hbc-boss-track"><span id="hbcHealth" style="width:0%"></span></div>'+
'<p id="hbcLine" class="hbc-tagline"></p>'+
(game.stage===MAX-1?'<p class="hbc-boss-phase">FINAL BOSS · PHASE <b id="hbcPhaseNumber">1 / 3</b></p>':"")+
'<button type="button" id="hbcContinue" class="cta hbc-next" style="display:none"><span id="hbcNextText">NEXT BAG</span> →</button>'+
'<div class="hb-section-title"><strong>SPECIAL ABILITIES</strong><span class="muted small">New gameplay upgrades</span></div>'+
'<div class="hb-shop">'+skillsHtml()+'</div>'+
'<div class="hb-section-title"><strong>TRAINING EQUIPMENT</strong><span class="muted small">Permanent upgrades</span></div>'+
'<div class="hb-shop">'+shop()+'</div></div></div>'+
'<div class="hb-tags"><span class="hb-tag">PUNCHES · <b id="hbClicks">0</b></span>'+
'<span class="hb-tag">PERFECT HITS · <b id="hbcPerfect">0</b></span>'+
'<span class="hb-tag">TOTAL TRAINING · <b id="hbTotal">0</b></span></div>'+
'<p class="hb-achievements">Timing beats frantic clicking. Perfect hits break shields, build combos and charge your special. Upgrades and stage progress save automatically. No prestige.</p></div>');
window.hbRender();startPulse();
};
// Prevent the old clicker from processing a campaign punch. On pointer and keyboard clicks.
document.addEventListener("click",function(e){
if(e.target.closest("#hbPunch")){e.preventDefault();e.stopImmediatePropagation();punch();}
},true);
document.addEventListener("click",function(e){
const target=e.target;
if(target.closest("#hbcFinisher")){e.preventDefault();finisher();}
else if(target.closest("#hbcContinue")){e.preventDefault();advance();}
else if(target.closest("#hbcReplay")){
if(game.stage!==MAX)return;
game.stage=MAX-1;game.damage=0;game.charge=0;game.combo=0;game.lastHit=0;lastPunchAt=0;save(true);window.openHeavyBag();
}
else{const skill=target.closest("[data-hbc-skill]");if(skill){e.preventDefault();buySkill(skill.dataset.hbcSkill);}}
});
document.addEventListener("visibilitychange",()=>{if(document.hidden)save(true);});
window.addEventListener("pagehide",()=>save(true));
const style=document.createElement("style");
style.textContent=[
".hbc-worlds{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:7px;margin:15px 0}",
".hbc-world{padding:9px;border:1px solid #78664d55;border-radius:9px;background:#121920;min-width:0}",
".hbc-world.active{border-color:#e8ae6c;background:#3c2b1d}.hbc-world.cleared{border-color:#af8f5d88}",
".hbc-world-name{display:flex;gap:4px;justify-content:space-between;font:700 9px ui-monospace,monospace;color:#c2b29f}",
".hbc-world.active .hbc-world-name{color:#ffd398}.hbc-world-name b{white-space:nowrap}",
".hbc-world-bars{display:grid;grid-template-columns:repeat(4,1fr);gap:3px;margin-top:9px}",
".hbc-world-bars span{height:5px;border-radius:3px;background:#49423b}.hbc-world-bars .done{background:#d0a165}.hbc-world-bars .current{background:#fff0bb;box-shadow:0 0 7px #ffc56c99}",
".hbc-arena-title{font:700 13px ui-monospace,monospace;letter-spacing:.14em;color:#ebc18f;margin-bottom:4px;text-align:center;max-width:90%}",
".hbc-action{display:flex;gap:12px;margin:8px 0;color:#c4aa88;font:11px ui-monospace,monospace}.hbc-action b{color:#ffe1af;font-size:14px}",
".hbc-finisher{padding:10px 17px!important;margin:4px 0!important;background:#df9d4f!important;color:#1d1712!important;animation:hbc-ready .65s ease-in-out infinite alternate}",
"@keyframes hbc-ready{from{box-shadow:0 0 0 #ffa82c00;transform:scale(1)}to{box-shadow:0 0 23px #ffa82c66;transform:scale(1.035)}}",
".hbc-boss-track{height:12px;margin-top:10px}.hbc-boss-track>span{background:linear-gradient(90deg,#dc794a,#f6be80)}",
".hbc-tagline{margin:9px 0 12px;color:#c6ae95;font:italic 12px Georgia,serif;min-height:22px}",
".hbc-next{margin:11px 0 4px;width:100%;background:#dda76b!important;color:#1a1918!important}",
".hbc-timing-wrap{width:min(100%,330px);padding:0 12px;margin:4px auto 0;text-align:center}",
".hbc-timing-wrap small{display:block;color:#bbac9b;font:9px ui-monospace,monospace;letter-spacing:.12em;margin-top:7px}",
".hbc-timing{position:relative;height:14px;border:1px solid #a77e5266;border-radius:99px;background:linear-gradient(90deg,#2a2c32,#34323a);margin:9px 0 0}",
".hbc-timing-zone{position:absolute;top:-3px;bottom:-3px;width:15%;transform:translateX(-50%);background:#f6ca67aa;border:1px solid #ffdf9c;box-shadow:0 0 12px #ffbd51bb;border-radius:5px}",
".hbc-timing-needle{position:absolute;top:-6px;bottom:-6px;width:4px;transform:translateX(-50%);border-radius:3px;background:#f5f1eb;box-shadow:0 0 8px #ffffffbd;pointer-events:none}",
".hbc-verdict{font:700 11px ui-monospace,monospace;letter-spacing:.1em;color:#e3c19b;min-height:17px}.hbc-verdict.perfect{color:#ffe195}.hbc-verdict.good{color:#b8e5ae}.hbc-verdict.miss{color:#bd8880}",
".hbc-boss-phase{padding:9px 10px;background:#451f23;border:1px solid #b95050;color:#ffd4c0;font:700 11px ui-monospace,monospace;border-radius:6px}",
".hb-arena[data-tier='1'] .hb-bag-art{filter:sepia(.23)}",
".hb-arena[data-tier='2'] .hb-bag-art{filter:grayscale(.7) brightness(.85)}",
".hb-arena[data-tier='3'] .hb-bag-art{filter:sepia(.8) hue-rotate(-20deg)}",
".hb-arena[data-tier='4'] .hb-bag-art{filter:contrast(1.2) saturate(.6)}",
".hb-arena[data-tier='7']{background:radial-gradient(ellipse at 50% 42%,#a45d2d58,transparent 60%),linear-gradient(#252126,#0a0c10 78%)}",
".hb-arena[data-tier='7'] .hb-bag-art{filter:sepia(.8) saturate(1.7);box-shadow:0 0 26px #dc904455,inset 8px 0 9px #ffffff12,inset -15px 0 21px #000b}",
".hb-bag:disabled{cursor:default;opacity:.5;animation:none}",
".hbc-end{text-align:center;padding:15px 12px 18px}.hbc-end h1{font-size:clamp(27px,5vw,52px);margin:12px 0}",
".hbc-trophy{font-size:70px;margin:12px 0}.hbc-end p{color:#bfae99}",
".hbc-ending-line{font:700 14px ui-monospace,monospace;letter-spacing:.16em;color:#f5c58d;margin:25px 0}",
".hbc-end .hb-tags{justify-content:center}.hbc-end .cta{margin:18px auto}",
"@media(max-width:880px){.hbc-worlds{grid-template-columns:repeat(3,minmax(0,1fr))}}",
"@media(max-width:660px){.hbc-game .hb-play{grid-template-columns:1fr}.hbc-game .hb-arena{min-height:330px}.hbc-worlds{grid-template-columns:repeat(2,minmax(0,1fr))}.hbc-world-name{font-size:10px}}",
"@media(prefers-reduced-motion:reduce){.hbc-finisher{animation:none}}"
].join("\n");
document.head.appendChild(style);
})();