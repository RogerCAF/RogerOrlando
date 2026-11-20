/* CUBE SURVIVOR — COLOR ARSENAL
 * Self-contained 2D arcade. No engine, textures, network, physics or background simulation.
 * Fixed 30 FPS visual target, bounded entity arrays, movement and shooting via simple geometry.
 */
(function(){
"use strict";
const $=id=>document.getElementById(id), canvas=$("arena"),ctx=canvas.getContext("2d",{alpha:false});
if(!ctx){$("dialog-title").textContent="CANVAS UNAVAILABLE";$("dialog-description").textContent="Your browser does not support this game.";return}
const WPN=[
 {name:"DUAL PISTOLS",hint:"Twin precision cube bullets · every fifth shot is critical.",color:"#eeeeea",rate:.37},
 {name:"CUBE SHOTGUN",hint:"Five block pellets · powerful up close.",color:"#e05251",rate:.81},
 {name:"GATLING GUN",hint:"Spins up to an unstoppable stream of tiny cubes.",color:"#f0c448",rate:.14},
 {name:"CUBEZOOKA",hint:"A heavy rocket that explodes into cube fragments.",color:"#ec904b",rate:2.05},
 {name:"RAY GUN",hint:"A piercing laser that passes through entire enemy lines.",color:"#538fe1",rate:1.68},
 {name:"SEEKER LAUNCHER",hint:"Homing cube missiles find their own targets.",color:"#4fbf85",rate:1.5}
];
const RECORD="the-bureau-cube-survivor-v1";
const MAX_ENEMIES=25,MAX_BULLETS=84,MAX_DROPS=90,MAX_FX=66,MAX_SHOTS=22;
const TWO_PI=Math.PI*2, RUN_TIME=90;
let w=860,h=500,scale=1,mode="menu",raf=0,lastFrame=0,uiClock=0,soundOn=false,audio=null,lastSound=0;
let game=null;
const keys=new Set(), touch={active:false,id:0,x:0,y:0,dx:0,dy:0};
let records={best:0,wins:0,runs:0};
try{const v=JSON.parse(localStorage.getItem(RECORD)||"null");if(v){records.best=Math.max(0,Math.floor(Number(v.best)||0));records.wins=Math.max(0,Math.floor(Number(v.wins)||0));records.runs=Math.max(0,Math.floor(Number(v.runs)||0))}}catch(e){}
function saveRecord(){try{localStorage.setItem(RECORD,JSON.stringify(records))}catch(e){}}
function rand(a,b){return a+Math.random()*(b-a)}
function clamp(v,a,b){return Math.max(a,Math.min(b,v))}
function dist2(a,b,c,d){let x=a-c,y=b-d;return x*x+y*y}
function fmt(v){return Math.floor(v).toLocaleString("en-US")}
function createState(){
 let second=1+Math.floor(Math.random()*5);
 const initialRanks=[1,0,0,0,0,0];initialRanks[second]=1;
 return {t:0,player:{x:w/2,y:h/2,hp:100,max:100,speed:191,inv:0},
  score:0,kills:0,lvl:1,xp:0,nextXP:5,unlocked:[0,second],ranks:initialRanks,
  cooldowns:[0,.7,.7,1.1,1.3,.9],spun:0,hitCount:0,
  fusion:{kind:"",until:0},fusionNext:12,fusionIndex:0,
  enemies:[],bullets:[],drops:[],fx:[],shots:[],beams:[],
  spawn:0.5,boss:null,bossSpawned:false, speedBonus:0,notice:"",noticeUntil:0,hitFlash:0,screenShake:0};
}
function resize(){
 const r=canvas.getBoundingClientRect();
 const prevW=w,prevH=h;
 w=Math.max(280,r.width||860);h=Math.max(320,r.height||500);
 scale=Math.min(window.devicePixelRatio||1,1.5,Math.sqrt(1400000/(w*h)));
 canvas.width=Math.round(w*scale);canvas.height=Math.round(h*scale);
 ctx.setTransform(scale,0,0,scale,0,0);
 if(game){game.player.x=clamp(game.player.x*w/prevW,27,w-27);game.player.y=clamp(game.player.y*h/prevH,27,h-27);
  for(const collection of [game.enemies,game.bullets,game.drops,game.shots]){
   for(const v of collection){v.x*=w/prevW;v.y*=h/prevH}
  }
 }
 if(mode!=="playing")draw();
}
function sound(freq=240,length=.05,type="square",volume=.025){
 if(!soundOn||performance.now()-lastSound<55)return;
 lastSound=performance.now();
 try{
  const AC=window.AudioContext||window.webkitAudioContext;
  if(!AC)return;
  if(!audio)audio=new AC();
  if(audio.state==="suspended")audio.resume().catch(()=>{});
  let osc=audio.createOscillator(),gain=audio.createGain();
  osc.type=type;osc.frequency.setValueAtTime(freq,audio.currentTime);
  osc.frequency.exponentialRampToValueAtTime(Math.max(70,freq*.6),audio.currentTime+length);
  gain.gain.setValueAtTime(volume,audio.currentTime);
  gain.gain.exponentialRampToValueAtTime(.0001,audio.currentTime+length);
  osc.connect(gain);gain.connect(audio.destination);
  osc.start();osc.stop(audio.currentTime+length);
 }catch(e){}
}
function setMode(next){mode=next;cancelAnimationFrame(raf);raf=0;lastFrame=0}
function beginFrame(){if(mode==="playing"&&!raf)raf=requestAnimationFrame(frame)}
function setOverlay(kicker,title,description,action,actionLabel,footnote){
 $("dialog-kicker").textContent=kicker;
 $("dialog-title").textContent=title;
 $("dialog-description").textContent=description;
 $("dialog-action").hidden=!action;
 $("dialog-action").textContent=actionLabel||"CONTINUE →";
 $("dialog-action").onclick=action||null;
 $("dialog-footnote").textContent=footnote||"";
 $("dialog-score").hidden=true;$("upgrade-choices").hidden=true;
 $("overlay").hidden=false;
}
function start(){
 game=createState();keys.clear();touch.active=false;
 setMode("playing");$("overlay").hidden=true;refreshUI();
 showNotice("SURVIVE FOR 90 SECONDS · YOUR CUBE FIRES AUTOMATICALLY",3);
 draw();beginFrame();
}
function pause(message){
 if(mode!=="playing")return;
 setMode("paused");
 setOverlay("RUN PAUSED",message||"TAKE A BREAK.","Your run is frozen. Nothing happens while the game is paused.",resume,"RESUME RUN →","P to resume · Escape returns to The Bureau.");
 $("pause").textContent="▶ RESUME";
 refreshUI();draw();
}
function resume(){
 if(mode!=="paused")return;
 $("overlay").hidden=true;setMode("playing");$("pause").textContent="Ⅱ PAUSE";beginFrame();
}
function showNotice(s,seconds=1.8){if(!game)return;game.notice=s;game.noticeUntil=game.t+seconds}
function finish(win){
 if(mode!=="playing")return;
 setMode("ended");keys.clear();touch.active=false;
 if(win)game.score+=2500+Math.floor(game.player.hp)*10;
 records.runs++;if(win)records.wins++;
 records.best=Math.max(records.best,game.score);saveRecord();refreshUI();draw();
 setOverlay(win?"CHAMPIONSHIP COMPLETE":"RUN COMPLETE",win?"THE CUBE SURVIVED.":"ONE MORE RUN?",
  win?"The Corrupted Cube is defeated. You conquered the Color Arsenal!":"Your arena run is over. Try another weapon combination and beat your record.",
  start,"PLAY AGAIN →","Best "+fmt(records.best)+" · "+records.wins+" victories in "+records.runs+" runs · Records saved on this device.");
 $("dialog-score").hidden=false;$("dialog-score").textContent=fmt(game.score)+" POINTS";
 if(win)$("dialog-title").classList.add("win");else $("dialog-title").classList.remove("win");
}
function addFX(x,y,color,size=10,life=.28,kind="spark"){
 if(game.fx.length>=MAX_FX)game.fx.shift();
 game.fx.push({x,y,color,size,life,full:life,kind});
}
function addEnemy(type,x,y){
 if(game.enemies.length>=MAX_ENEMIES)return;
 let size=type==="tank"?20:type==="runner"?11:15;
 let hp=(type==="tank"?65:type==="runner"?17:27)*(1+game.t*.008);
 let speed=(type==="runner"?108:type==="tank"?43:69)*(1+game.t*.0024);
 game.enemies.push({type,x,y,size,hp,max:hp,speed,flash:0,knockX:0,knockY:0,hitDelay:0});
}
function spawnEnemy(){
 let side=Math.floor(rand(0,4)),x=side===0?-25:side===1?w+25:rand(0,w),y=side===2?-25:side===3?h+25:rand(0,h);
 if(side<2)y=rand(0,h);
 let r=Math.random(),type=game.t>36&&r<.19?"tank":game.t>18&&r<.43?"runner":"grunt";
 addEnemy(type,x,y);
}
function spawnBoss(){
 if(game.bossSpawned)return;
 game.bossSpawned=true;
 let x=game.player.x<w*.5?w+58:-58;
 game.boss={x,y:h/2,hp:1150,max:1150,size:39,speed:45,cooldown:1.35,flash:0,knockX:0,knockY:0};
 game.enemies.length=Math.min(game.enemies.length,14);
 showNotice("⚠ THE CORRUPTED CUBE HAS ARRIVED",3);
 $("boss").hidden=false;
 sound(115,.22,"sawtooth",.05);
}
function nearest(x,y){
 let best=null,bd=Infinity;
 for(const enemy of game.enemies){if(enemy.hp<=0)continue;let d=dist2(x,y,enemy.x,enemy.y);if(d<bd){bd=d;best=enemy}}
 if(game.boss&&game.boss.hp>0){
  let d=dist2(x,y,game.boss.x,game.boss.y);
  if(d<bd){bd=d;best=game.boss}
 }
 return best;
}
function pointToward(x,y,tx,ty){let a=Math.atan2(ty-y,tx-x);return{x:Math.cos(a),y:Math.sin(a),angle:a}}
function addBullet(x,y,angle,speed,damage,color,kind="normal",life=1.6,extra={}){
 if(game.bullets.length>=MAX_BULLETS)return;
 game.bullets.push(Object.assign({x,y,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,r:kind==="rocket"?8:kind==="seeker"?6:4,damage,color,kind,life,angle,pierce:0},extra));
}
function validFusion(k){return game.fusion.kind===k&&game.fusion.until>game.t}
function updateFusion(){
 if(game.t<game.fusionNext)return;
 game.fusionNext=game.t+11;
 const pairs=[{a:4,b:1,key:"4-1",name:"PRISM SHATTER"},
  {a:3,b:2,key:"3-2",name:"BULLET STORM"},
  {a:5,b:3,key:"5-3",name:"SWARM BOMB"},
  {a:0,b:4,key:"0-4",name:"PRECISION BEAM"}]
  .filter(c=>game.unlocked.includes(c.a)&&game.unlocked.includes(c.b));
 if(!pairs.length)return;
 const chosen=pairs[game.fusionIndex++%pairs.length];
 game.fusion={kind:chosen.key,until:game.t+3};
 showNotice("AUTO FUSION · "+chosen.name,2);
 sound(780,.12,"triangle");
}
function hurt(enemy,damage,dx=0,dy=0){
 if(enemy.hp<=0)return;
 enemy.hp-=damage;enemy.flash=.09;
 if(enemy===game.boss){enemy.knockX+=dx*.12;enemy.knockY+=dy*.12}
 else {enemy.knockX+=dx*.62;enemy.knockY+=dy*.62}
 if(enemy.hp<=0){
  if(enemy===game.boss){
   enemy.hp=0;game.score+=1900;
   for(let k=0;k<20;k++)addFX(enemy.x+rand(-30,30),enemy.y+rand(-30,30),WPN[k%6].color,rand(5,14),rand(.12,.48));
   sound(130,.26,"sawtooth",.06);
   finish(true);
   return;
  }
  const index=game.enemies.indexOf(enemy);
  if(index>=0)game.enemies.splice(index,1);
  game.kills++;game.score+=enemy.type==="tank"?110:enemy.type==="runner"?60:45;
  if(game.drops.length<MAX_DROPS)game.drops.push({x:enemy.x,y:enemy.y,value:enemy.type==="tank"?2:1,life:11});
  for(let k=0;k<4;k++)addFX(enemy.x+rand(-9,9),enemy.y+rand(-9,9),"#dbb18b",rand(3,8),rand(.12,.25));
 }
}
function explosion(x,y,r,damage,color){
 addFX(x,y,color,r,.31,"ring");
 sound(115,.13,"sawtooth",.044);
 // No physics: simple radial damage + knockback.
 const victims=game.boss?[...game.enemies,game.boss]:game.enemies.slice();
 for(const e of victims){
  let dx=e.x-x,dy=e.y-y,d=Math.hypot(dx,dy)||1;
  if(d<r+e.size)hurt(e,damage*(1-Math.min(.65,d/(r+e.size)*.55)),dx/d*25,dy/d*25);
 }
}
function attack(i){
 const p=game.player,target=nearest(p.x,p.y);
 if(!target)return;
 const mount=-Math.PI/2+i*TWO_PI/6;
 const x=p.x+Math.cos(mount)*26,y=p.y+Math.sin(mount)*26;
 const aim=Math.atan2(target.y-y,target.x-x);
 const rank=Math.max(1,game.ranks[i]),power=1+(rank-1)*.25;
 if(i===0){
  const crit=++game.hitCount%5===0;
  addBullet(x,y,aim,430,(crit?23:11)*power,WPN[i].color,"normal",1.45,{crit});
  if(rank>=3)addBullet(x,y,aim+rand(-.09,.09),420,(crit?18:9)*power,WPN[i].color,"normal",1.45,{crit});
  game.cooldowns[i]=WPN[i].rate*(1-(rank-1)*.075);
  sound(245,.045,"square");
 }else if(i===1){
  const bonus=(validFusion("4-1")?2:0)+(rank>=2?1:0);
  for(let j=0;j<5+bonus;j++){
   let count=5+bonus;
   addBullet(x,y,aim+(j-(count-1)/2)*.145+rand(-.03,.03),370,9*power,WPN[i].color,"pellet",.37);
  }
  game.cooldowns[i]=WPN[i].rate*(1-(rank-1)*.07);
  sound(135,.09,"sawtooth",.05);
 }else if(i===2){
  let spread=rand(-.095,.095);
  addBullet(x,y,aim+spread,470,5*power,WPN[i].color,"normal",1.3);
  if(rank>=4)addBullet(x,y,aim-spread,460,4*power,WPN[i].color,"normal",1.25);
  if(validFusion("3-2"))addBullet(x,y,aim+rand(-.22,.22),430,4*power,WPN[i].color,"normal",1.2);
  game.cooldowns[i]=clamp(.155-game.spun*.038, .069, .16)*(1-(rank-1)*.065);
  sound(360,.025,"square",.013);
 }else if(i===3){
  addBullet(x,y,aim,285,33*power,WPN[i].color,"rocket",2.3,{splash:56+rank*7,splashDamage:27*power});
  if(validFusion("5-3"))for(let j=0;j<2;j++)addBullet(x,y,aim+(j===0?-.25:.25),210,16*power,WPN[5].color,"seeker",2.6,{splash:0});
  game.cooldowns[i]=WPN[i].rate*(1-(rank-1)*.07);
  sound(95,.13,"sawtooth",.046);
 }else if(i===4){
  let len=Math.max(w,h)*1.5,dx=Math.cos(aim),dy=Math.sin(aim);
  let beamWidth=validFusion("0-4")?25:13+rank*2;
  game.beams.push({x,y,dx,dy,len,life:.17,max:.17,width:beamWidth,color:WPN[i].color});
  let victims=game.boss?[...game.enemies,game.boss]:game.enemies.slice();
  for(const e of victims){
   let px=e.x-x,py=e.y-y,along=px*dx+py*dy,side=Math.abs(px*dy-py*dx);
   if(along>0&&along<len&&side<beamWidth+e.size)hurt(e,51*power*(validFusion("0-4")?1.5:1),dx*10,dy*10);
  }
  game.cooldowns[i]=WPN[i].rate*(1-(rank-1)*.065);
  sound(580,.16,"sine",.037);
 }else{
  for(let j=0;j<(rank>=3?3:2);j++)addBullet(x,y,aim+(j===0?-.19:.19),245,20*power,WPN[i].color,"seeker",3.2);
  game.cooldowns[i]=WPN[i].rate*(1-(rank-1)*.065);
  sound(440,.08,"triangle");
 }
}
function upgradeOptions(){
 let pool=[];
 for(let i=0;i<6;i++){
  if(game.unlocked.includes(i)){
   if(game.ranks[i]<4)pool.push({kind:"boost",index:i,title:WPN[i].name+" LV."+(game.ranks[i]+1),
    description:i===0?"Faster, harder pistol fire.":i===1?"Stronger close-range cube spread.":i===2?"Higher bullet damage and more sustained fire.":i===3?"Bigger explosions and heavier rockets.":i===4?"Stronger beam damage and penetration.":"Additional seeker strength and better lock-on.",color:WPN[i].color});
  }else if(game.unlocked.length<6){
   pool.push({kind:"unlock",index:i,title:"UNLOCK "+WPN[i].name,description:WPN[i].hint,color:WPN[i].color});
  }
 }
 if(game.player.hp<game.player.max*.85)pool.push({kind:"heal",title:"FIELD REPAIR",description:"Recover 32 health points.",color:"#b4e7af"});
 if(game.speedBonus<3)pool.push({kind:"speed",title:"CUBE THRUSTERS",description:"Increase movement speed by 10%.",color:"#f1c48a"});
 pool.sort(()=>Math.random()-.5);
 // Never trap highly upgraded runs in an empty upgrade menu.
 if(pool.length<3)pool.push({kind:"cache",title:"CUBE CACHE",description:"Bank 600 bonus points and recover 15 HP.",color:"#f1c48a"});
 if(pool.length<3)pool.push({kind:"repair",title:"FIELD REPAIR+",description:"Recover 30 health points.",color:"#b4e7af"});
 return pool.slice(0,3);
}
function award(option){
 if(mode!=="upgrade")return;
 if(option.kind==="unlock"){game.unlocked.push(option.index);game.ranks[option.index]=1;game.cooldowns[option.index]=.22}
 else if(option.kind==="boost")game.ranks[option.index]++;
 else if(option.kind==="heal")game.player.hp=Math.min(game.player.max,game.player.hp+32);
 else if(option.kind==="speed"){game.speedBonus++;game.player.speed*=1.10}
 else if(option.kind==="cache"){game.score+=600;game.player.hp=Math.min(game.player.max,game.player.hp+15)}
 else if(option.kind==="repair"){game.player.hp=Math.min(game.player.max,game.player.hp+30)}
 $("overlay").hidden=true;setMode("playing");showNotice(option.title+" · UPGRADED",1.4);refreshUI();beginFrame();
}
function showUpgrade(){
 if(mode!=="playing")return;
 setMode("upgrade");keys.clear();touch.active=false;
 const opts=upgradeOptions();
 setOverlay("LEVEL "+game.lvl+" / CHOOSE ONE","YOUR CUBE EVOLVES.","Pick a weapon or upgrade. The arena is paused until you decide.",null,"","All six colors can be equipped together · Every unlocked gun fires automatically.");
 const holder=$("upgrade-choices");holder.innerHTML="";holder.hidden=false;
 for(const opt of opts){
  let b=document.createElement("button");b.type="button";b.className="choice";
  let mark=document.createElement("span");mark.className="mark";mark.style.background=opt.color;
  let title=document.createElement("b");title.textContent=opt.title;
  let p=document.createElement("p");p.textContent=opt.description;
  b.append(mark,title,p);b.addEventListener("click",()=>award(opt));holder.append(b);
 }
 draw();
}
function levelCheck(){
 if(game.xp<game.nextXP)return;
 game.xp-=game.nextXP;game.lvl++;game.nextXP=5+Math.floor(game.lvl*2.5);
 game.player.hp=Math.min(game.player.max,game.player.hp+12);
 showUpgrade();sound(780,.12,"sine",.05);
}
function collect(dt){
 for(let i=game.drops.length-1;i>=0;i--){
  const drop=game.drops[i];drop.life-=dt;
  if(drop.life<=0){game.drops.splice(i,1);continue}
  let d=Math.sqrt(dist2(drop.x,drop.y,game.player.x,game.player.y));
  if(d<130&&d>1){let sp=clamp(230+(130-d)*3,250,650)*dt;drop.x+=(game.player.x-drop.x)/d*sp;drop.y+=(game.player.y-drop.y)/d*sp}
  if(d<23){game.xp+=drop.value;game.score+=15;game.drops.splice(i,1)}
 }
}
function damagePlayer(amount){
 const p=game.player;
 if(p.inv>0||mode!=="playing")return;
 p.hp=Math.max(0,p.hp-amount);p.inv=.95;game.hitFlash=.2;game.screenShake=6;
 sound(165,.10,"sawtooth",.05);
 if(p.hp<=0)finish(false);
}
function updateMovement(dt){
 let mx=0,my=0;
 if(keys.has("a")||keys.has("arrowleft"))mx--;
 if(keys.has("d")||keys.has("arrowright"))mx++;
 if(keys.has("w")||keys.has("arrowup"))my--;
 if(keys.has("s")||keys.has("arrowdown"))my++;
 if(touch.active){mx+=touch.dx;my+=touch.dy}
 let d=Math.hypot(mx,my);
 if(d>.001){const sp=game.player.speed*dt/Math.max(1,d);game.player.x=clamp(game.player.x+mx*sp,24,w-24);game.player.y=clamp(game.player.y+my*sp,25,h-25)}
}
function updateEnemies(dt){
 const p=game.player;
 for(const enemy of game.enemies){
  enemy.flash=Math.max(0,enemy.flash-dt);
  let dx=p.x-enemy.x,dy=p.y-enemy.y,dis=Math.hypot(dx,dy)||1;
  enemy.x+=dx/dis*enemy.speed*dt+enemy.knockX*dt;
  enemy.y+=dy/dis*enemy.speed*dt+enemy.knockY*dt;
  enemy.knockX*=Math.exp(-8*dt);enemy.knockY*=Math.exp(-8*dt);
  if(dis<enemy.size+16)damagePlayer(enemy.type==="tank"?13:enemy.type==="runner"?8:9);
 }
 if(game.boss&&game.boss.hp>0){
  const b=game.boss;b.flash=Math.max(0,b.flash-dt);
  let dx=p.x-b.x,dy=p.y-b.y,d=Math.hypot(dx,dy)||1;
  b.x+=dx/d*b.speed*dt+b.knockX*dt;b.y+=dy/d*b.speed*dt+b.knockY*dt;
  b.knockX*=Math.exp(-7*dt);b.knockY*=Math.exp(-7*dt);
  if(d<b.size+14)damagePlayer(17);
  b.cooldown-=dt;
  if(b.cooldown<=0){
   b.cooldown=1.55;
   for(let j=0;j<8;j++){
    if(game.shots.length>=MAX_SHOTS)break;
    let a=j*TWO_PI/8+game.t*.2;
    game.shots.push({x:b.x,y:b.y,vx:Math.cos(a)*128,vy:Math.sin(a)*128,life:3.8});
   }
  }
 }
 for(let i=game.shots.length-1;i>=0;i--){
  let s=game.shots[i];s.x+=s.vx*dt;s.y+=s.vy*dt;s.life-=dt;
  if(dist2(s.x,s.y,p.x,p.y)<(20*20)){damagePlayer(7);game.shots.splice(i,1)}
  else if(s.life<=0||s.x<-20||s.x>w+20||s.y<-20||s.y>h+20)game.shots.splice(i,1);
 }
}
function updateBullets(dt){
 for(let i=game.bullets.length-1;i>=0;i--){
  let b=game.bullets[i];b.life-=dt;
  if(b.kind==="seeker"){
   const target=nearest(b.x,b.y);
   if(target){
    let wanted=Math.atan2(target.y-b.y,target.x-b.x);
    let current=Math.atan2(b.vy,b.vx);
    let delta=Math.atan2(Math.sin(wanted-current),Math.cos(wanted-current));
    const angle=current+clamp(delta,-dt*5.5,dt*5.5);
    const speed=Math.hypot(b.vx,b.vy);b.vx=Math.cos(angle)*speed;b.vy=Math.sin(angle)*speed;b.angle=angle;
   }
  }
  b.x+=b.vx*dt;b.y+=b.vy*dt;
  if(b.life<=0||b.x<-60||b.x>w+60||b.y<-60||b.y>h+60){
   if(b.kind==="rocket")explosion(clamp(b.x,0,w),clamp(b.y,0,h),b.splash,b.splashDamage*.5,b.color);
   game.bullets.splice(i,1);continue;
  }
  const targets=game.boss?[...game.enemies,game.boss]:game.enemies.slice();
  let victim=null;
  for(const e of targets){
   if(e.hp>0&&dist2(b.x,b.y,e.x,e.y)<(e.size+b.r)*(e.size+b.r)){victim=e;break}
  }
  if(victim){
   const speed=Math.hypot(b.vx,b.vy)||1;
   hurt(victim,b.damage,b.vx/speed*18,b.vy/speed*18);
   if(mode!=="playing")return;
   if(b.kind==="rocket")explosion(b.x,b.y,b.splash,b.splashDamage,b.color);
   else addFX(b.x,b.y,b.color,b.crit?13:6,.16,"spark");
   game.bullets.splice(i,1);
  }
 }
}
function simulate(dt){
 if(mode!=="playing")return;
 game.t=Math.min(RUN_TIME,game.t+dt);const p=game.player;
 p.inv=Math.max(0,p.inv-dt);game.hitFlash=Math.max(0,game.hitFlash-dt);
 game.screenShake=Math.max(0,game.screenShake-34*dt);
 updateMovement(dt);
 game.spawn-=dt;
 if(!game.bossSpawned&&game.t<80&&game.spawn<=0&&game.enemies.length<MAX_ENEMIES){
  spawnEnemy();game.spawn=Math.max(.36,1.13-game.t*.0067)+rand(-.09,.13);
 }
 if(game.t>=80&&!game.bossSpawned)spawnBoss();
 updateEnemies(dt);if(mode!=="playing")return;
 game.spun=game.unlocked.includes(2)?Math.min(2.5,game.spun+dt):0;
 updateFusion();
 for(const i of game.unlocked){
  game.cooldowns[i]-=dt;
  if(game.cooldowns[i]<=0){
   if(nearest(game.player.x,game.player.y))attack(i);
   else game.cooldowns[i]=.12;
   if(mode!=="playing")return;
  }
 }
 updateBullets(dt);if(mode!=="playing")return;
 for(let i=game.fx.length-1;i>=0;i--){game.fx[i].life-=dt;if(game.fx[i].life<=0)game.fx.splice(i,1)}
 for(let i=game.beams.length-1;i>=0;i--){game.beams[i].life-=dt;if(game.beams[i].life<=0)game.beams.splice(i,1)}
 collect(dt);if(game.xp>=game.nextXP){levelCheck();return}
 if(game.t>=RUN_TIME)finish(false);
}
function rect(x,y,r,color,angle=0){
 ctx.save();ctx.translate(x,y);ctx.rotate(angle);ctx.fillStyle=color;ctx.fillRect(-r,-r,r*2,r*2);
 ctx.strokeStyle="#08131ba9";ctx.lineWidth=2;ctx.strokeRect(-r,-r,r*2,r*2);ctx.restore();
}
function face(points,color){
 ctx.fillStyle=color;ctx.beginPath();ctx.moveTo(points[0][0],points[0][1]);
 for(let i=1;i<4;i++)ctx.lineTo(points[i][0],points[i][1]);
 ctx.closePath();ctx.fill();ctx.strokeStyle="#111a22";ctx.lineWidth=2.7;ctx.stroke();
 const lerp=(a,b,t)=>a+(b-a)*t;
 ctx.lineWidth=1.2;ctx.strokeStyle="#111a22cc";
 for(let j=1;j<3;j++){
  const t=j/3,lines=[
   [[lerp(points[0][0],points[1][0],t),lerp(points[0][1],points[1][1],t)],[lerp(points[3][0],points[2][0],t),lerp(points[3][1],points[2][1],t)]],
   [[lerp(points[0][0],points[3][0],t),lerp(points[0][1],points[3][1],t)],[lerp(points[1][0],points[2][0],t),lerp(points[1][1],points[2][1],t)]]
  ];
  for(let k=0;k<2;k++){ctx.beginPath();ctx.moveTo(...lines[k][0]);ctx.lineTo(...lines[k][1]);ctx.stroke()}
 }
}
function hero(x,y,active,size=20){
 let top=WPN[(active+2)%6].color,left=WPN[(active+4)%6].color,right=WPN[active].color;
 ctx.save();ctx.translate(x,y);let s=size/20;ctx.scale(s,s);
 face([[-21,-18],[0,-31],[21,-18],[0,-6]],top);
 face([[-21,-18],[0,-6],[0,19],[-21,6]],left);
 face([[0,-6],[21,-18],[21,6],[0,19]],right);
 ctx.restore();
}
function drawEnemy(e){
 ctx.save();ctx.translate(e.x,e.y);let s=e.size;
 ctx.shadowColor=e.type==="tank"?"#dc876d":"#69b3bc";ctx.shadowBlur=6;
 ctx.fillStyle=e.flash>0?"#ffffff":e.type==="tank"?"#b77c71":e.type==="runner"?"#8f8dde":"#738a99";
 ctx.fillRect(-s,-s,s*2,s*2);ctx.shadowBlur=0;
 ctx.strokeStyle="#26303c";ctx.lineWidth=3;ctx.strokeRect(-s,-s,s*2,s*2);
 ctx.strokeStyle="#17212a";ctx.lineWidth=1;
 ctx.beginPath();ctx.moveTo(-s/3,-s);ctx.lineTo(-s/3,s);ctx.moveTo(s/3,-s);ctx.lineTo(s/3,s);
 ctx.moveTo(-s,-s/3);ctx.lineTo(s,-s/3);ctx.moveTo(-s,s/3);ctx.lineTo(s,s/3);ctx.stroke();
 ctx.fillStyle="#ffdfad";ctx.fillRect(-s*.42,-3,4,4);ctx.fillRect(s*.23,-3,4,4);
 if(e.type==="tank"){ctx.fillStyle="#202932";ctx.fillRect(-s,s+5,s*2,3);ctx.fillStyle="#df9b7d";ctx.fillRect(-s,s+5,s*2*Math.max(0,e.hp/e.max),3)}
 ctx.restore();
}
function drawBoss(b){
 ctx.save();ctx.translate(b.x,b.y);
 ctx.shadowColor="#db4b5f";ctx.shadowBlur=19;
 let s=b.size;
 ctx.fillStyle=b.flash>0?"#fff1d6":"#932f47";ctx.fillRect(-s,-s,s*2,s*2);
 ctx.shadowBlur=0;ctx.strokeStyle="#d8999f";ctx.lineWidth=3;ctx.strokeRect(-s,-s,s*2,s*2);
 ctx.strokeStyle="#301926";ctx.lineWidth=3;
 for(let i=-1;i<=1;i++){ctx.beginPath();ctx.moveTo(-s,i*s/2);ctx.lineTo(s,i*s/2);ctx.moveTo(i*s/2,-s);ctx.lineTo(i*s/2,s);ctx.stroke()}
 ctx.fillStyle="#ffd0c6";ctx.fillRect(-15,-7,10,6);ctx.fillRect(7,-7,10,6);ctx.fillRect(-10,12,20,4);
 ctx.restore();
}
function drawGun(p,target){
 const i=game.active;let aim=target?Math.atan2(target.y-p.y,target.x-p.x):0;
 ctx.save();ctx.translate(p.x,p.y);ctx.rotate(aim);ctx.translate(15,0);
 ctx.fillStyle="#22282c";ctx.strokeStyle="#e6c9a5";ctx.lineWidth=1.4;
 if(i===0){ctx.fillRect(0,-12,21,5);ctx.fillRect(0,7,21,5);ctx.strokeRect(0,-12,21,5);ctx.strokeRect(0,7,21,5)}
 if(i===1){ctx.fillRect(0,-11,26,22);ctx.strokeRect(0,-11,26,22);ctx.fillStyle=WPN[i].color;ctx.fillRect(19,-9,7,18)}
 if(i===2){ctx.fillRect(0,-10,27,20);ctx.strokeRect(0,-10,27,20);for(let j=-1;j<=1;j++){ctx.fillStyle="#e8bd65";ctx.fillRect(16,j*5-2,17,3)}}
 if(i===3){ctx.fillRect(0,-9,33,18);ctx.strokeRect(0,-9,33,18);ctx.fillStyle="#b77344";ctx.fillRect(26,-11,9,22)}
 if(i===4){ctx.fillStyle="#577cbb";ctx.fillRect(0,-6,32,12);ctx.strokeRect(0,-6,32,12);ctx.fillStyle="#a1dbf7";ctx.fillRect(23,-3,9,6)}
 if(i===5){ctx.fillRect(0,-12,29,24);ctx.strokeRect(0,-12,29,24);ctx.fillStyle="#52ba8d";ctx.fillRect(25,-9,5,7);ctx.fillRect(25,3,5,7)}
 ctx.restore();
}
function draw(){
 ctx.setTransform(scale,0,0,scale,0,0);ctx.fillStyle="#0c1a25";ctx.fillRect(0,0,w,h);
 ctx.strokeStyle="#26384877";ctx.lineWidth=1;ctx.beginPath();
 const grid=42;
 for(let x=0;x<w;x+=grid){ctx.moveTo(x,0);ctx.lineTo(x,h)}
 for(let y=0;y<h;y+=grid){ctx.moveTo(0,y);ctx.lineTo(w,y)}
 ctx.stroke();
 ctx.strokeStyle="#c1b08c44";ctx.lineWidth=2;ctx.strokeRect(10,10,w-20,h-20);
 if(!game){hero(w/2,h/2,0,25);return}
 ctx.save();
 if(game.screenShake>0)ctx.translate(rand(-game.screenShake,game.screenShake),rand(-game.screenShake,game.screenShake));
 for(const drop of game.drops){ctx.fillStyle="#9be9df";ctx.fillRect(drop.x-4,drop.y-4,8,8);ctx.fillStyle="#d5ffff";ctx.fillRect(drop.x-1.5,drop.y-1.5,3,3)}
 for(const enemy of game.enemies)drawEnemy(enemy);
 if(game.boss&&game.boss.hp>0)drawBoss(game.boss);
 for(const shot of game.shots){rect(shot.x,shot.y,5,"#ed817e",game.t)}
 for(const bullet of game.bullets){
  if(bullet.kind==="seeker"){ctx.strokeStyle="#4fbf8580";ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(bullet.x-bullet.vx*.045,bullet.y-bullet.vy*.045);ctx.lineTo(bullet.x,bullet.y);ctx.stroke()}
  if(bullet.kind==="rocket"){ctx.strokeStyle="#e4a55e77";ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(bullet.x-bullet.vx*.05,bullet.y-bullet.vy*.05);ctx.lineTo(bullet.x,bullet.y);ctx.stroke()}
  rect(bullet.x,bullet.y,bullet.r,bullet.color,game.t*3);
 }
 for(const beam of game.beams){
  ctx.save();ctx.globalAlpha=beam.life/beam.max;
  ctx.lineCap="round";ctx.strokeStyle=beam.color;ctx.lineWidth=beam.width;ctx.shadowColor=beam.color;ctx.shadowBlur=12;
  ctx.beginPath();ctx.moveTo(beam.x,beam.y);ctx.lineTo(beam.x+beam.dx*beam.len,beam.y+beam.dy*beam.len);ctx.stroke();
  ctx.shadowBlur=0;ctx.strokeStyle="#edf9ff";ctx.lineWidth=3;ctx.stroke();ctx.restore();
 }
 for(const fx of game.fx){
  ctx.save();ctx.globalAlpha=fx.life/fx.full;ctx.strokeStyle=fx.color;ctx.fillStyle=fx.color;
  if(fx.kind==="ring"){ctx.lineWidth=3;ctx.beginPath();ctx.arc(fx.x,fx.y,fx.size*(1-fx.life/fx.full*.65),0,TWO_PI);ctx.stroke()}
  else ctx.fillRect(fx.x-fx.size*.5,fx.y-fx.size*.5,fx.size,fx.size);
  ctx.restore();
 }
 const p=game.player;
 ctx.save();if(p.inv>0&&Math.floor(p.inv*12)%2===0)ctx.globalAlpha=.5;
 const target=nearest(p.x,p.y);
 drawGun(p,target);hero(p.x,p.y,game.active,20);
 ctx.restore();
 if(touch.active){
  ctx.save();ctx.strokeStyle="#f1c48878";ctx.lineWidth=2;ctx.beginPath();ctx.arc(touch.x,touch.y,35,0,TWO_PI);ctx.stroke();
  ctx.fillStyle="#f1c48865";ctx.beginPath();ctx.arc(touch.x+touch.dx*29,touch.y+touch.dy*29,15,0,TWO_PI);ctx.fill();ctx.restore();
 }
 ctx.restore();
 if(game.hitFlash>0){ctx.fillStyle="rgba(255,76,72,"+(game.hitFlash*.7)+")";ctx.fillRect(0,0,w,h)}
 if(game.noticeUntil>game.t&&game.notice){
  ctx.save();ctx.font="800 "+Math.min(13,w/27)+"px ui-monospace,monospace";ctx.textAlign="center";
  let tw=Math.min(w-28,ctx.measureText(game.notice).width+30);ctx.fillStyle="#10151ddb";
  ctx.fillRect((w-tw)/2,h-42,tw,28);ctx.fillStyle="#ffdfa9";ctx.fillText(game.notice,w/2,h-23);ctx.restore();
 }
}
function refreshUI(){
 const g=game;
 $("best").textContent=fmt(records.best);
 const left=g?Math.ceil(Math.max(0,RUN_TIME-g.t)):90;
 $("time").textContent=String(Math.floor(left/60)).padStart(2,"0")+":"+String(left%60).padStart(2,"0");
 $("hp").textContent=g?Math.ceil(g.player.hp):"100";
 $("hp").classList.toggle("critical",!!g&&g.player.hp<35);
 $("score").textContent=g?fmt(g.score):"0";$("level").textContent=g?g.lvl:"1";
 $("xp-progress").style.width=g?(clamp(g.xp/g.nextXP,0,1)*100).toFixed(1)+"%":"0%";
 $("pause").textContent=mode==="paused"?"▶ RESUME":"Ⅱ PAUSE";
 $("pause").disabled=mode==="menu"||mode==="upgrade"||mode==="ended";
 for(const btn of $("weapons").querySelectorAll("button")){
  const i=Number(btn.dataset.weapon),unlocked=!!g&&g.unlocked.includes(i);
  btn.disabled=!unlocked;btn.classList.toggle("locked",!unlocked);
  btn.setAttribute("aria-pressed",String(!!g&&g.active===i));
  btn.title=unlocked?WPN[i].name+" level "+g.ranks[i]:"Unlock through an XP upgrade";
 }
 $("weapon-name").textContent=g?WPN[g.active].name:"DUAL PISTOLS";
 $("weapon-hint").textContent=g?WPN[g.active].hint:WPN[0].hint;
 const active=!!g&&g.fusion.until>g.t;
 const f=$("fusion");f.classList.toggle("active",active);
 f.textContent=active?"COLOR FUSION · "+({"4-1":"PRISM SHATTER","3-2":"BULLET STORM","5-3":"SWARM BOMB","0-4":"PRECISION BEAM"}[g.fusion.kind]||"SPECIAL")+" · "+Math.max(0,g.fusion.until-g.t).toFixed(1)+"s":
  "FUSION READY · switch colors to discover combos";
 $("boss").hidden=!g||!g.boss||g.boss.hp<=0;
 if(g&&g.boss)$("boss-bar").style.width=clamp(g.boss.hp/g.boss.max*100,0,100)+"%";
}
function frame(ts){
 raf=0;if(mode!=="playing")return;
 if(lastFrame&&ts-lastFrame<32){raf=requestAnimationFrame(frame);return}
 const dt=lastFrame?clamp((ts-lastFrame)/1000,.001,.055):.033;lastFrame=ts;
 simulate(dt);if(mode==="playing"){
  draw();
  uiClock+=dt;if(uiClock>=.16){refreshUI();uiClock=0}
  raf=requestAnimationFrame(frame);
 }
}
const keyMap={arrowup:1,arrowdown:1,arrowleft:1,arrowright:1,w:1,a:1,s:1,d:1};
document.addEventListener("keydown",function(e){
 const key=e.key.toLowerCase();
 if(keyMap[key]||key===" "||key==="p")e.preventDefault();
 if(key==="p"){if(mode==="playing")pause();else if(mode==="paused")resume();return}
 if(mode!=="playing")return;
 keys.add(key);
});
document.addEventListener("keyup",function(e){keys.delete(e.key.toLowerCase())});
window.addEventListener("blur",function(){keys.clear();touch.active=false;if(mode==="playing")pause("WINDOW UNFOCUSED")});
document.addEventListener("visibilitychange",function(){if(document.hidden){keys.clear();touch.active=false;if(mode==="playing")pause("GAME AUTO-PAUSED")}});
canvas.addEventListener("pointerdown",function(e){
 if(mode!=="playing")return;
 e.preventDefault();canvas.setPointerCapture(e.pointerId);
 const r=canvas.getBoundingClientRect();
 touch.active=true;touch.id=e.pointerId;touch.x=e.clientX-r.left;touch.y=e.clientY-r.top;touch.dx=0;touch.dy=0;
});
canvas.addEventListener("pointermove",function(e){
 if(!touch.active||e.pointerId!==touch.id)return;
 e.preventDefault();const r=canvas.getBoundingClientRect();
 let dx=e.clientX-r.left-touch.x,dy=e.clientY-r.top-touch.y,mag=Math.hypot(dx,dy);
 touch.dx=mag>9?dx/Math.max(55,mag):0;touch.dy=mag>9?dy/Math.max(55,mag):0;
});
function release(e){if(e.pointerId!==touch.id)return;touch.active=false;touch.dx=0;touch.dy=0}
canvas.addEventListener("pointerup",release);canvas.addEventListener("pointercancel",release);canvas.addEventListener("lostpointercapture",release);
$("pause").addEventListener("click",function(){if(mode==="playing")pause();else if(mode==="paused")resume()});
$("sound").addEventListener("click",function(){soundOn=!soundOn;$("sound").textContent=soundOn?"♪ ON":"♪ OFF";$("sound").setAttribute("aria-pressed",String(soundOn));$("sound").setAttribute("aria-label",soundOn?"Disable sound":"Enable sound");if(soundOn)sound(500,.07,"sine")});
window.addEventListener("pagehide",function(){if(mode==="playing")pause("GAME AUTO-PAUSED");cancelAnimationFrame(raf);raf=0;keys.clear();touch.active=false});
window.addEventListener("resize",resize,{passive:true});
setOverlay("THE BUREAU / COLOR ARSENAL","SIX COLORS. SIX WEAPONS.","You are the Rubik's Cube. Dodge enemies while your weapons fire automatically. Switch colors, collect XP and defeat the final boss.",start,"START RUN →","WASD / arrows to move · 1–6 to switch colors. On touchscreens, drag to move and tap color buttons.");
resize();refreshUI();
})();
