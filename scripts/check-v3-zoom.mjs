import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { Script } from 'node:vm';

// Regression of the real V3 camera using a small fake browser: we check the
// FULL seated-person composition at the absolute outward stop, not just
// whether a button has a "reset" label.
const html=readFileSync('public/infinite-worlds-v3-play.html','utf8');
const concept=readFileSync('public/infinite-worlds-v3-concept.html','utf8');
const homepage=readFileSync('app/components/InfiniteWorldsPreview.tsx','utf8');
const source=html.match(/<script>([\s\S]+?)<\/script>/)?.[1];
assert.ok(source,'V3 zoom script is missing');
new Script(source,{filename:'v3-zoom.js'});

const webp=readFileSync('public/v3/zoom-v3/03-grand-stairway.webp');
assert.equal(webp.toString('ascii',0,4),'RIFF','Stair art must be a real WebP file');
assert.equal(webp.toString('ascii',8,12),'WEBP','Stair asset must be WebP');
assert.equal(webp.readUInt16LE(26)&0x3fff,800,'New staircase must remain at registered width 800');
assert.equal(webp.readUInt16LE(28)&0x3fff,1280,'New staircase must remain at registered height 1280');
assert.ok(webp.length>350000,'Stair illustration is unexpectedly low fidelity');
assert.match(html,/03-grand-stairway\.webp/,'New illustrated staircase was not loaded');
assert.match(concept,/03-grand-stairway\.webp/,'Concept page must show the same corrected staircase');
assert.ok(html.includes("x:274,y:274,w:252,h:314,archRise:145"),
 'Stairway opening must stay inside the true painted arch, preserving its metalwork');
assert.ok(html.includes("04-observatory-daylight.webp"),
 'The stairway should reveal the same daylight glass dome as the child scene');
assert.ok(!html.includes("function telescopeMacro(g)"),
 'An invented duplicate telescope rim must not be pasted over the physical lens');
const obs=readFileSync('public/v3/zoom-v3/04-observatory-daylight.webp');
assert.equal(obs.toString('ascii',0,4),'RIFF');
assert.equal(obs.readUInt16LE(26)&0x3fff,658);
assert.equal(obs.readUInt16LE(28)&0x3fff,1386);
assert.ok(obs.length>280000,'The daylight observatory lost illustration detail');
assert.ok(concept.includes('/v3/zoom-v3/04-observatory-daylight.webp'),
 'The preview thumbnail must agree with the playable world');
assert.ok(html.includes('renderNested(g.i,g,art.length,g.i===0&&g.cycle===0)'),
  'The seated viewer must be drawn IN FRONT of the nested computer screen');
assert.ok(html.includes(".at-home .caption{opacity:0"),'No caption may obscure the seated viewer at the beginning');
assert.ok(html.includes('function goHome(){state.target=0;state.tx=state.ty=0;req();}'),
  'Returning from a panned zoom must center the user instead of leaving a shifted view');
assert.ok(html.includes('state.target===0&&state.depth<.045'),'The outward zoom stop must be visually detectable');
assert.ok(homepage.includes('src="/infinite-worlds.html"'),'Do not replace the already-live original zoom');

function boot(w,h){
 const queue=[],handlers={}; let atHome=false,now=0;
 const noop=()=>{};
 const ctx=new Proxy({},{
   get(_t,p){
     if(String(p).startsWith('create')&&String(p).includes('Gradient'))return ()=>({addColorStop:noop});
     return noop;
   },set(){return true;}
 });
 const main={classList:{toggle:(key,v)=>{if(key==='at-home')atHome=!!v;}}};
 const canvas={style:{},getContext:()=>ctx,
   getBoundingClientRect:()=>({width:w,height:h}),
   addEventListener:(key,cb)=>{handlers[key]=cb;},
   setPointerCapture:noop};
 const node=()=>({setAttribute:noop,style:{}});
 const controls=Array.from({length:6},node);
 const byId={art:canvas,loading:{hidden:false,textContent:''},chapter:node(),title:node(),story:node(),status:node(),again:node(),minus:node(),plus:node()};
 const doc={
   getElementById:(id)=>byId[id]||(byId[id]=node()),
   querySelector:(selector)=>selector==='main'?main:null,
   querySelectorAll:()=>controls
 };
 class Img{
   constructor(){this.complete=false;this.naturalWidth=0;}
   set src(s){this._src=s;this.complete=true;this.naturalWidth=1024;this.onload?.();}
   get src(){return this._src;}
 }
 const sandbox={document:doc,Image:Img,devicePixelRatio:1,
   requestAnimationFrame:(cb)=>{queue.push(cb);return queue.length;},
   window:null,Math,Number};
 sandbox.window=sandbox;
 sandbox.addEventListener=noop;
 sandbox.matchMedia=()=>({matches:true});
 new Script(source).runInNewContext(sandbox);
 function flush(){let n=0;while(queue.length){const cb=queue.shift();cb(now+=16);if(++n>150)throw Error('Camera redraw never settled');}}
 flush();
 return {api:sandbox.__INFINITE_V3,canvas,handlers,controls,home:byId.again,
   atHome:()=>atHome,flush,dimensions:{w,h}};
}

for(const [w,h] of [[1600,900],[390,844],[1024,768]]){
 const t=boot(w,h),a=t.api;
 assert.ok(a,'V3 camera inspection hook missing');
 assert.equal(a.art.length,6,'Preserve the infinite loop across six worlds');
 assert.equal(a.art[0].w,1084,'Keep the approved original drawing and seated viewer');
 assert.equal(a.art[0].h,1451,'Keep the full original composition height');
 assert.ok(a.portals[3].rx<=9 && a.portals[3].ry<=10,
  'Telescope pupil must remain small and aligned with the painted objective');
 let g=a.geometry();
 assert.equal(g.i,0,'Complete outward stop must be the computer scene');
 const x2=g.x+g.z*a.art[0].w,y2=g.y+g.z*a.art[0].h;
 assert.ok(g.x>=-2&&g.y>=-2&&x2<=w+2&&y2<=h+2,
   'At full zoom-out the complete seated-person painting must fit '+w+'×'+h);
 assert.ok(t.atHome(),'At initial/outward stop remove captions covering the original composition');
 // Exact affine continuity: the end of the stairway must render precisely
 // the same pixels as the opening of the observatory, with no stage jump.
 a.setDepth(2.999999);t.flush();
 const stair=a.geometry(),p=a.portals[2],k=a.childK(2);
 const child={
  z:stair.z*k,
  x:stair.x+(p.x+p.w/2-a.art[3].w*k/2)*stair.z,
  y:stair.y+(p.y+p.h/2-a.art[3].h*k/2)*stair.z
 };
 a.setDepth(3);t.flush();const entered=a.geometry();
 for(const coord of ['x','y','z'])
  assert.ok(Math.abs(child[coord]-entered[coord])<.03,
   'Stair-to-observatory boundary jumps in '+coord+' at '+w+'×'+h);
 a.setDepth(3.4);t.flush();assert.equal(a.geometry().i,3,'A deeper scene must be reachable');
 a.setDepth(1.2);t.flush();assert.equal(a.geometry().i,1,'Zooming backward must return to the server');
 a.goHome();t.flush();g=a.geometry();
 assert.equal(g.i,0);
 assert.ok(a.atHome()&&t.atHome(),'Full zoom-out must end at a centered, unobstructed computer portrait');
 assert.ok(Math.abs(g.x+g.z*a.art[0].w/2-w/2)<.0001,'Home must center artwork horizontally');
 assert.ok(Math.abs(g.y+g.z*a.art[0].h/2-h/2)<.0001,'Home must center artwork vertically');
 t.handlers.wheel({deltaY:500,deltaMode:0,preventDefault:()=>{}});t.flush();
 assert.equal(a.geometry().i,0,'Scrolling outward cannot move beyond the seated viewer');
 assert.ok(a.atHome(),'Home must be a hard outward endpoint, not a repeating world');
}

console.log('V3: original full-person zoom-out, accurate daylight stair arch, 3 viewport affine seam checks and 6-world inner loop verified.');
