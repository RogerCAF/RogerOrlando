/* Agtung die Kurve — same-LAN / one-keyboard-per-computer mode.
 * Signaling: same-origin /api/curve-room (immutable short-lived Vercel Blobs).
 * Gameplay: host-authoritative browser physics, WebRTC peer-to-peer data channels.
 * No user accounts, external realtime SDKs, or installed server required. */
(() => {
"use strict";
const $ = id => document.getElementById(id);
const W=960,H=620, COLORS=["#ff6372","#53d5e9","#ffd66e","#87e88a","#c1a0ff"];
const KEYS={ KeyA:"left",ArrowLeft:"left",KeyD:"right",ArrowRight:"right" };
const allowed=/^[A-HJ-NP-Z2-9]{6}$/;
const canvas=$("arena"),ctx=canvas.getContext("2d");
const trail=document.createElement("canvas"),paint=trail.getContext("2d");
trail.width=W;trail.height=H;
const map=new Uint32Array(W*H);
let role="menu",room="",secret="",slot=0,phase="lobby",round=1,points=[0,0,0,0,0],players=[],countdown=3.25,clock=0,stamp=1;
let last=0,frameId=0,sendAt=0,segments=[],held={left:false,right:false},myConnected=false,joinPeer="";
const peers=new Map(),attempted=new Set();
let guestPc=null,guestChannel=null,joinStarted=0,alive=true,roomPoll=0,answerPoll=0,connectWatch=0;
const urlRoom=new URLSearchParams(location.search).get("room")||"";
const safeCode=v=>String(v||"").toUpperCase().replace(/[^A-Z2-9]/g,"").slice(0,6);
const clientLink=()=>location.origin+"/bureau/curve-lan.html?room="+room;
const iceServers={iceServers:[{urls:"stun:stun.l.google.com:19302"}]};
const message=(value,type="info")=>{const el=$("statusMessage");el.textContent=value;el.dataset.type=type};
const roleMessage=(value)=>{$("playerRole").textContent=value};
const sleep=t=>new Promise(resolve=>setTimeout(resolve,t));
const api=async (action,payload={},method="POST")=>{
 const url="/api/curve-room";
 const init=method==="GET"?{cache:"no-store"}:{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({action,...payload})};
 const r=await fetch(method==="GET"?url+"?"+new URLSearchParams({action,...payload}):url,init);
 const j=await r.json().catch(()=>({}));
 if(!r.ok)throw Error(j.error||"Kamerverbinding mislukt ("+r.status+").");
 return j;
};
function showGame(show){
 $("setup").hidden=show;$("gameShell").hidden=!show;
}
function setRole(which){
 role=which;
 $("roomCode").textContent=room||"------";
 $("roomLink").value=room?clientLink():"";
 $("hostControls").hidden=role!=="host";
 $("joinControls").hidden=role!=="guest";
 $("roomDetails").hidden=role!=="host";
 $("roomBadge").textContent=role==="host"?"KAMERMAKER / SPELER 1":role==="guest"?"GAST / SPELER "+(slot||"?"):"";
 $("setupActions").hidden=role!=="menu";
 $("lobby").hidden=role==="menu";
 $("playControls").hidden=role==="menu";
 if(which==="menu"){showGame(false);return}
 showGame(true);
}
function updateLobby(){
 const count=1+[...peers.values()].filter(p=>p.dc?.readyState==="open").length;
 $("memberCount").textContent=String(count);
 $("roomCode").textContent=room;
 $("roomLink").value=clientLink();
 const root=$("members");root.replaceChildren();
 const active=new Set([1,...[...peers.values()].filter(p=>p.dc?.readyState==="open").map(p=>p.slot)]);
 for(let i=1;i<=5;i++){
  const li=document.createElement("div");li.className="member"+(active.has(i)?" online":"");
  li.style.setProperty("--member-color",COLORS[i-1]);
  const dot=document.createElement("i");const label=document.createElement("span");
  label.textContent="P"+i+" "+(i===1?"HOST":active.has(i)?"VERBONDEN":"VRIJ");
  li.append(dot,label);root.append(li);
 }
 $("hostStart").disabled=role!=="host"||count<2;
 if(role==="host"&&phase==="lobby")message(count<2?"Deel je kamercode. Wacht op minimaal één tweede computer.":count+" spelers verbonden. Je kunt starten.","good");
 sendAll({t:"lobby",slots:[...active],phase});
}
function peerSend(peer,data){
 try{if(peer.dc?.readyState==="open"&&peer.dc.bufferedAmount<300000)peer.dc.send(JSON.stringify(data))}catch{}
}
function sendAll(data){for(const peer of peers.values())peerSend(peer,data)}
function sendGuest(data){try{if(guestChannel?.readyState==="open")guestChannel.send(JSON.stringify(data))}catch{}}
function onGuestMessage(event){
 if(typeof event.data!=="string"||event.data.length>120000)return;
 let d;try{d=JSON.parse(event.data)}catch{return}
 if(d.t==="welcome"){
  slot=d.slot;myConnected=true;roleMessage("SPELER "+slot+" · "+["","ROOD","BLAUW","GEEL","GROEN","PAARS"][slot]);
  $("roomBadge").textContent="GAST / SPELER "+slot;
  $("yourColor").style.background=COLORS[slot-1];
  message("Verbonden! Gebruik A / D of ← / → op je eigen toetsenbord.","good");
  showGame(true);renderScores();
 }
 if(d.t==="lobby"){
  const r=$("members");r.replaceChildren();
  for(let i=1;i<=5;i++){
   const e=document.createElement("div"),dot=document.createElement("i"),label=document.createElement("span");
   e.className="member"+(d.slots.includes(i)?" online":"");e.style.setProperty("--member-color",COLORS[i-1]);
   label.textContent="P"+i+" "+(d.slots.includes(i)?i===1?"HOST":"VERBONDEN":"VRIJ");e.append(dot,label);r.append(e);
  }
  $("memberCount").textContent=String(d.slots.length);
 }
 if(d.t==="round"){
  round=d.round;points=d.scores||points;players=d.players||[];phase="countdown";countdown=3.25;clock=0;
  paint.clearRect(0,0,W,H);$("roundText").textContent=String(round);
  $("actionPanel").hidden=true;renderScores();
 }
 if(d.t==="state"){
  if(phase==="lobby"||phase==="paused"||phase==="countdown"||phase==="playing"){
   phase=d.phase;countdown=d.countdown??countdown;clock=d.clock??clock;
   players=d.players||players;
   if(Array.isArray(d.segments))for(const s of d.segments)drawTrail(s);
   $("arenaStatus").textContent=d.phase==="countdown"?"GET READY":Math.floor(clock)+"s / SURVIVE";
  }
 }
 if(d.t==="result"){
  phase=d.phase;points=d.scores||points;players=d.players||players;renderScores();showResult(d.title,d.subtitle,"Wacht tot de host de volgende ronde start.");
 }
 if(d.t==="paused"){phase="paused";showResult("PAUZE","De host heeft het spel gepauzeerd.","Wacht tot het spel wordt hervat.")}
 if(d.t==="resume"){$("actionPanel").hidden=true;phase=d.phase;}
 if(d.t==="close"){message("De host heeft de kamer verlaten. Maak een nieuwe kamer.","bad");phase="ended";showResult("VERBINDING VERBROKEN","De host is vertrokken.","Open de link opnieuw of maak zelf een kamer.")}
}
function validMessage(e){if(typeof e.data!=="string"||e.data.length>2000)return null;try{return JSON.parse(e.data)}catch{return null}}
function setupDataChannel(peer,dc){
 peer.dc=dc;
 dc.onopen=()=>{
  const taken=new Set([...peers.values()].filter(p=>p!==peer&&p.dc?.readyState==="open").map(p=>p.slot));
  const free=[2,3,4,5].find(s=>!taken.has(s));
  if(!free||phase!=="lobby"){peerSend(peer,{t:"close"});dc.close();return}
  peer.slot=free;
  peerSend(peer,{t:"welcome",slot:free});
  updateLobby();renderScores();
 };
 dc.onmessage=e=>{
  const d=validMessage(e);if(!d||d.t!=="input"||!Number.isInteger(peer.slot))return;
  peer.left=d.left===true;peer.right=d.right===true;
 };
 dc.onclose=()=>{
  if(peers.get(peer.id)!==peer)return;
  peers.delete(peer.id);
  if(phase==="playing"||phase==="countdown"){
   const p=players.find(p=>p.id===peer.slot);if(p)p.alive=false;
  }
  updateLobby();renderScores();
 };
}
async function gather(pc){
 if(pc.iceGatheringState==="complete")return;
 await new Promise(resolve=>{
  const done=()=>{clearTimeout(timer);pc.removeEventListener("icegatheringstatechange",check);resolve()};
  const check=()=>{if(pc.iceGatheringState==="complete")done()};
  const timer=setTimeout(done,9000);
  pc.addEventListener("icegatheringstatechange",check);check();
 });
}
async function createRoom(){
 if(!window.RTCPeerConnection){message("Deze browser ondersteunt geen WebRTC. Gebruik Chrome, Edge, Firefox of Safari.","bad");return}
 $("createRoom").disabled=true;
 message("Kamer aanmaken...");
 try{
  const result=await api("create");room=result.room;secret=result.secret;slot=1;setRole("host");
  roleMessage("SPELER 1 · ROOD · HOST");
  $("yourColor").style.background=COLORS[0];
  history.replaceState(null,"",location.pathname+"?room="+room+"&host=1");
  updateLobby();renderScores();
  roomPoll=setInterval(checkOffers,1300);
  checkOffers();
 }catch(e){message(e.message,"bad");$("createRoom").disabled=false}
}
async function checkOffers(){
 if(role!=="host"||!room||!secret||!alive)return;
 try{
  const {offers}=await api("offers",{room,secret},"GET");
  for(const item of offers){
   if(attempted.has(item.peer))continue;
   if(peers.size>=4)break;
   attempted.add(item.peer);
   acceptGuest(item).catch(()=>{peers.delete(item.peer);updateLobby()});
  }
 }catch(e){message("Kamercontrole: "+e.message,"bad")}
}
async function acceptGuest(item){
 if(phase!=="lobby")return;
 const peer={id:item.peer,slot:0,dc:null,left:false,right:false,pc:new RTCPeerConnection(iceServers)};
 peers.set(item.peer,peer);
 peer.pc.ondatachannel=e=>setupDataChannel(peer,e.channel);
 peer.pc.onconnectionstatechange=()=>{
  if(["failed","closed","disconnected"].includes(peer.pc.connectionState)){
   if(peer.dc?.readyState!=="open"&&peers.get(item.peer)===peer){peers.delete(item.peer);updateLobby()}
  }
 };
 await peer.pc.setRemoteDescription(item.offer);
 const answer=await peer.pc.createAnswer();
 await peer.pc.setLocalDescription(answer);
 await gather(peer.pc);
 await api("answer",{room,secret,peer:item.peer,answer:{type:"answer",sdp:peer.pc.localDescription.sdp}});
}
async function joinRoom(codeValue){
 if(!window.RTCPeerConnection){message("Deze browser ondersteunt geen WebRTC.","bad");return}
 const target=safeCode(codeValue);
 if(!allowed.test(target)){message("Vul een geldige code van 6 tekens in.","bad");return}
 $("joinRoom").disabled=true;
 message("Verbinding met kamer "+target+" maken...");
 try{
  await api("check",{room:target},"GET");
  room=target;joinPeer=[...crypto.getRandomValues(new Uint8Array(12))].map(v=>v.toString(16).padStart(2,"0")).join("");
  guestPc=new RTCPeerConnection(iceServers);
  guestChannel=guestPc.createDataChannel("agtung-curve",{ordered:true});
  guestChannel.onopen=()=>{myConnected=true;message("Verbonden met de host.","good");sendInput()};
  guestChannel.onmessage=onGuestMessage;
  guestChannel.onclose=()=>{if(role==="guest"){message("Verbinding verbroken. Herlaad om opnieuw te verbinden.","bad");phase="ended"}};
  guestPc.onconnectionstatechange=()=>{
   if(["failed","closed"].includes(guestPc.connectionState)&&role==="guest")message("Peer-to-peer-verbinding mislukt. Controleer of beide computers hetzelfde netwerk gebruiken.","bad");
  };
  const offer=await guestPc.createOffer();
  await guestPc.setLocalDescription(offer);
  await gather(guestPc);
  await api("join",{room,peer:joinPeer,offer:{type:"offer",sdp:guestPc.localDescription.sdp}});
  setRole("guest");
  roleMessage("VERBINDING MAKEN...");
  history.replaceState(null,"",location.pathname+"?room="+room);
  message("Wachten tot de host je verbinding accepteert...");
  joinStarted=Date.now();
  answerPoll=setInterval(checkAnswer,1300);checkAnswer();
  connectWatch=setInterval(()=>{
   if(!myConnected&&Date.now()-joinStarted>35000){
    message("Verbinding duurt te lang. Probeer opnieuw. Tip: gebruik hetzelfde Wi-Fi-/LAN-netwerk.","bad");
    clearInterval(connectWatch);
   }
  },3500);
 }catch(e){
  message(e.message,"bad");$("joinRoom").disabled=false;
  if(guestPc){guestPc.close();guestPc=null}
 }
}
async function checkAnswer(){
 if(role!=="guest"||!room||!joinPeer||!guestPc||!alive)return;
 if(guestPc.remoteDescription){clearInterval(answerPoll);return}
 try{
  const {answer}=await api("answer",{room,peer:joinPeer},"GET");
  if(answer){clearInterval(answerPoll);await guestPc.setRemoteDescription(answer)}
 }catch(e){message("Kamerverbinding: "+e.message,"bad")}
}
function playerInput(p){
 if(p.id===1)return held;
 const peer=[...peers.values()].find(q=>q.slot===p.id&&q.dc?.readyState==="open");
 return {left:peer?.left===true,right:peer?.right===true};
}
function sendInput(){if(role==="guest")sendGuest({t:"input",left:held.left,right:held.right})}
function renderScores(){
 const root=$("scoreList");root.replaceChildren();
 const active=players.length?players.map(p=>p.id):role==="host"?[1,...[...peers.values()].filter(p=>p.dc?.readyState==="open").map(p=>p.slot)]:[];
 for(const id of active){
  const box=document.createElement("div");box.className="score";box.style.setProperty("--p",COLORS[id-1]);
  const title=document.createElement("span");title.textContent="P"+id+(id===slot?" / JIJ":"");
  const value=document.createElement("strong");value.textContent=String(points[id-1]||0);
  box.append(title,value);root.append(box);
 }
}
function newPositions(){
 const pos=[];
 for(const p of players){
  let x=0,y=0,k=0;do{x=75+Math.random()*(W-150);y=75+Math.random()*(H-150);k++}while(k<250&&pos.some(v=>Math.hypot(v.x-x,v.y-y)<145));
  p.x=x;p.y=y;p.a=Math.random()*Math.PI*2;p.alive=true;p.gapDelay=2.3+Math.random()*2.4;p.gapLeft=0;
  pos.push({x,y});
 }
}
function startMatch(){
 if(role!=="host"||phase!=="lobby"&&phase!=="matchend")return;
 if(phase==="lobby"){
  const ids=[1,...[...peers.values()].filter(p=>p.dc?.readyState==="open").map(p=>p.slot)].sort((a,b)=>a-b);
  if(ids.length<2){message("Er moet minstens één gast verbonden zijn.","bad");return}
  players=ids.map(id=>({id,color:COLORS[id-1],x:0,y:0,a:0,alive:true,points:0,gapDelay:4,gapLeft:0}));
  points=[0,0,0,0,0];round=1;
 }else{
  points=[0,0,0,0,0];players.forEach(p=>p.points=0);round=1;
 }
 initRound();
}
function initRound(){
 phase="countdown";countdown=3.25;clock=0;stamp=1;last=0;sendAt=0;segments.length=0;
 map.fill(0);paint.clearRect(0,0,W,H);newPositions();
 $("roundText").textContent=String(round);$("arenaStatus").textContent="GET READY";
 $("actionPanel").hidden=true;
 for(const peer of peers.values()){peer.left=false;peer.right=false}
 held={left:false,right:false};
 sendAll({t:"round",round,scores:points,players:positions()});
 renderScores();if(!frameId)frameId=requestAnimationFrame(frame);
}
function positions(){return players.map(p=>({id:p.id,x:p.x,y:p.y,a:p.a,alive:p.alive}))}
function drawTrail(s){
 const p=COLORS[s.i-1];if(!p)return;
 paint.strokeStyle=p;paint.lineWidth=5.4;paint.lineCap="round";
 paint.beginPath();paint.moveTo(s.x0,s.y0);paint.lineTo(s.x1,s.y1);paint.stroke();
}
function stampLine(x0,y0,x1,y1,p){
 const seg={i:p.id,x0:Math.round(x0),y0:Math.round(y0),x1:Math.round(x1),y1:Math.round(y1)};
 drawTrail(seg);segments.push(seg);
 const mark=(stamp++<<3)|p.id;
 for(let y=-3;y<=3;y++)for(let x=-3;x<=3;x++){
  if(x*x+y*y>10)continue;
  const px=Math.round(x1+x),py=Math.round(y1+y);
  if(px>0&&px<W&&py>0&&py<H)map[py*W+px]=mark;
 }
}
function collision(p){
 const px=Math.round(p.x),py=Math.round(p.y);
 if(px<8||px>W-8||py<8||py>H-8)return true;
 for(let oy=-4;oy<=4;oy+=2)for(let ox=-4;ox<=4;ox+=2){
  const cell=map[(py+oy)*W+(px+ox)];
  if(!cell)continue;
  if((cell&7)!==p.id||stamp-(cell>>>3)>55)return true;
 }
 return false;
}
function update(dt){
 clock+=dt;
 const speed=130,steps=Math.ceil(speed*dt/2.2),step=dt/steps;
 for(let n=0;n<steps;n++){
  for(const p of players){
   if(!p.alive)continue;
   const input=playerInput(p);
   p.a+=(Number(input.right)-Number(input.left))*2.55*step;
   const x=p.x,y=p.y;
   p.x+=Math.cos(p.a)*speed*step;p.y+=Math.sin(p.a)*speed*step;
   if(collision(p)){p.alive=false;continue}
   if(p.gapLeft<=0)stampLine(x,y,p.x,p.y,p);
  }
 }
 for(const p of players){
  if(!p.alive)continue;
  if(p.gapLeft>0){p.gapLeft-=dt;if(p.gapLeft<=0)p.gapDelay=2.5+Math.random()*2.5}
  else{p.gapDelay-=dt;if(p.gapDelay<=0)p.gapLeft=.17+Math.random()*.13}
 }
 if(players.filter(p=>p.alive).length<=1||clock>170)finishRound();
}
function showResult(title,subtitle,hint){
 $("actionPanel").hidden=false;$("resultTitle").textContent=title;$("resultSubtitle").textContent=subtitle;
 $("resultHint").textContent=hint;
 $("hostNext").hidden=role!=="host";$("hostNext").textContent=phase==="matchend"?"NIEUWE MATCH →":phase==="paused"?"VERDER SPELEN →":"VOLGENDE RONDE →";
}
function finishRound(){
 const alivePlayers=players.filter(p=>p.alive),lastOne=alivePlayers.length===1?alivePlayers[0]:null;
 if(lastOne){points[lastOne.id-1]++;lastOne.points++}
 const winner=players.find(p=>points[p.id-1]>=5);
 phase=winner?"matchend":"roundend";
 const title=winner?"P"+winner.id+" WINT DE MATCH!":lastOne?"P"+lastOne.id+" WINT DE RONDE!":"RONDE VOORBIJ";
 $("arenaStatus").textContent=winner?"MATCH COMPLETE":"ROUND COMPLETE";
 const subtitle=winner?"Eerste speler met 5 punten.":lastOne?"Laatste speler over verdient een punt.":"Niemand overleefde deze ronde.";
 renderScores();showResult(title,subtitle,role==="host"?"Druk op de knop of SPATIE voor de volgende ronde.":"Wacht tot de host doorgaat.");
 sendAll({t:"result",phase,title,subtitle,scores:points,players:positions()});
 held={left:false,right:false};
}
function continueMatch(){
 if(role!=="host")return;
 if(phase==="lobby"||phase==="matchend")startMatch();
 else if(phase==="roundend"){round++;initRound()}
 else if(phase==="paused"){phase="playing";last=0;$("actionPanel").hidden=true;sendAll({t:"resume",phase})}
}
function pause(){
 if(role!=="host")return;
 if(phase==="playing"||phase==="countdown"){
  phase="paused";showResult("PAUZE","Spel gepauzeerd.","Druk op VERDER SPELEN om door te gaan.");
  sendAll({t:"paused"});
 }
}
function draw(){
 ctx.fillStyle="#0b1521";ctx.fillRect(0,0,W,H);
 ctx.strokeStyle="#203043";ctx.lineWidth=1;ctx.beginPath();
 for(let x=0;x<W;x+=40){ctx.moveTo(x,0);ctx.lineTo(x,H)}
 for(let y=0;y<H;y+=40){ctx.moveTo(0,y);ctx.lineTo(W,y)}
 ctx.stroke();ctx.strokeStyle="#52667d";ctx.lineWidth=3;ctx.strokeRect(3,3,W-6,H-6);
 ctx.drawImage(trail,0,0);
 for(const p of players){
  ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.a);ctx.globalAlpha=p.alive?1:.42;
  ctx.shadowBlur=p.alive?17:0;ctx.shadowColor=COLORS[p.id-1];ctx.fillStyle=COLORS[p.id-1];
  ctx.beginPath();ctx.arc(0,0,6.8,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;
  ctx.fillStyle="#0b1420";ctx.beginPath();ctx.moveTo(8,0);ctx.lineTo(-2,-4.4);ctx.lineTo(-2,4.4);ctx.closePath();ctx.fill();ctx.restore();
 }
 if(phase==="countdown"){
  ctx.fillStyle="#071018ac";ctx.fillRect(0,0,W,H);
  ctx.textAlign="center";ctx.fillStyle="#fff3df";ctx.font="900 118px system-ui";ctx.fillText(String(Math.max(1,Math.ceil(countdown))),W/2,H/2+32);
  ctx.fillStyle="#e1b681";ctx.font="800 16px ui-monospace,monospace";ctx.fillText("READY YOUR HANDS",W/2,H/2+71);
 }
}
function frame(now){
 frameId=0;
 const dt=last?Math.min(.04,(now-last)/1000):.016;last=now;
 if(role==="host"&&phase==="countdown"){countdown-=dt;if(countdown<=0)phase="playing"}
 if(role==="host"&&phase==="playing")update(dt);
 if(role==="host"&&["countdown","playing"].includes(phase)&&now-sendAt>=50){
  sendAt=now;sendAll({t:"state",phase,countdown,clock,players:positions(),segments:segments.splice(0)});
  $("arenaStatus").textContent=phase==="countdown"?"GET READY":clock.toFixed(1)+"s / SURVIVE";
 }
 draw();frameId=requestAnimationFrame(frame);
}
function onKey(e,down){
 if(role==="menu")return;
 if(document.activeElement=== $("roomInput"))return;
 const side=KEYS[e.code];
 if(side){e.preventDefault();if(held[side]!==down){held[side]=down;sendInput()}return}
 if(!down||e.repeat)return;
 if(e.code==="Space"||e.code==="Enter"){if(role==="host"){e.preventDefault();continueMatch()}return}
 if(e.code==="KeyP"&&role==="host"){e.preventDefault();if(phase==="paused")continueMatch();else pause()}
}
document.addEventListener("keydown",e=>onKey(e,true));
document.addEventListener("keyup",e=>onKey(e,false));
window.addEventListener("blur",()=>{held={left:false,right:false};sendInput();if(role==="host")pause()});
document.addEventListener("visibilitychange",()=>{if(document.hidden&&role==="host")pause()});
for(const el of document.querySelectorAll("[data-turn]")){
 const dir=el.dataset.turn;
 el.addEventListener("pointerdown",e=>{e.preventDefault();el.setPointerCapture(e.pointerId);held[dir]=true;el.classList.add("active");sendInput()});
 const clear=e=>{held[dir]=false;el.classList.remove("active");sendInput()};
 el.addEventListener("pointerup",clear);el.addEventListener("pointercancel",clear);el.addEventListener("lostpointercapture",clear);
}
$("createRoom").addEventListener("click",createRoom);
$("joinRoom").addEventListener("click",()=>joinRoom($("roomInput").value));
$("roomInput").addEventListener("input",e=>e.target.value=safeCode(e.target.value));
$("roomInput").addEventListener("keydown",e=>{if(e.code==="Enter"){e.preventDefault();joinRoom(e.target.value)}});
$("hostStart").addEventListener("click",startMatch);
$("hostNext").addEventListener("click",continueMatch);
$("copyLink").addEventListener("click",async()=>{
 try{await navigator.clipboard.writeText(clientLink());$("copyLink").textContent="LINK GEKOPIEERD ✓"}
 catch{$("roomLink").focus();$("roomLink").select();message("Kopieer de geselecteerde link.","info")}
});
$("copyCode").addEventListener("click",async()=>{try{await navigator.clipboard.writeText(room);$("copyCode").textContent="GEKOPIEERD ✓"}catch{message("Kamercode: "+room)}});
$("back").addEventListener("click",()=>location.href="/bureau/curve-clash.html");
window.addEventListener("beforeunload",()=>{
 alive=false;clearInterval(roomPoll);clearInterval(answerPoll);clearInterval(connectWatch);
 if(role==="host"){sendAll({t:"close"});for(const p of peers.values())p.pc.close()}
 if(guestPc)guestPc.close();
});
setRole("menu");
if(allowed.test(safeCode(urlRoom))){$("roomInput").value=safeCode(urlRoom);joinRoom(urlRoom)}
else message("Maak een kamer en deel de link. Iedere speler gebruikt zijn eigen toetsenbord.");
renderScores();frameId=requestAnimationFrame(frame);
})();
