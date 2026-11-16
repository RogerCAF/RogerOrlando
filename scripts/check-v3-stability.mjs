import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Script} from 'node:vm';

const html=readFileSync('public/infinite-worlds-v3-play.html','utf8');
const src=html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
assert.ok(src,'Interactive renderer JavaScript is missing');
new Script(src,{filename:'v3-stable-renderer.js'});
assert.ok(!html.includes('<script src="./v3/zoom-v3/lod-tiles.js">'),
  'The unverified WebGL tile engine must not load in public V3');
assert.ok(!src.includes('tileRenderer.draw('),
  'Unreliable asynchronous low-res texture swaps must not affect the portal chain');
assert.ok(src.includes('ctx.drawImage(im,left,top'),
  'Direct native source drawing must be active');
assert.ok(html.includes('.haze{display:none}'),
  'Do not cover the illustration with a full-screen haze/vignette');
assert.ok(html.includes('renderMode:\'stable-canvas2d\''),
  'Expose a truthful stable renderer diagnostics marker');

function boot(w,h){
 const frames=[],handlers={};
 let calls=0,invalid=0,clock=0;
 const noop=()=>{};
 const gradient=()=>({addColorStop:noop});
 const ctx=new Proxy({canvas:{width:w,height:h}},{
  get(target,key){
   if(key==='canvas')return target.canvas;
   if(key==='createLinearGradient'||key==='createRadialGradient')return gradient;
   if(key==='drawImage')return (...a)=>{
    calls++;
    if(a.some(x=>typeof x==='number'&&!Number.isFinite(x)))invalid++;
   };
   return noop;
  },set(){return true;}
 });
 const canvas={
  style:{},getContext:()=>ctx,getBoundingClientRect:()=>({width:w,height:h}),
  addEventListener:(event,cb)=>handlers[event]=cb,setPointerCapture:noop
 };
 const node=()=>({setAttribute:noop,style:{},textContent:''});
 const elements={art:canvas,loading:{hidden:false},chapter:node(),title:node(),
 story:node(),status:node(),again:node(),minus:node(),plus:node()};
 const document={
  getElementById:id=>elements[id]??=node(),
  querySelector:()=>({classList:{toggle:noop}}),
  querySelectorAll:()=>Array.from({length:6},node)
 };
 class Image{
  constructor(){this.complete=false;this.naturalWidth=0;}
  set src(value){this._src=value;this.complete=true;this.naturalWidth=1084;this.onload?.();}
  get src(){return this._src;}
 }
 const window={document,Image,devicePixelRatio:1,ResizeObserver:null,
 addEventListener:noop,matchMedia:()=>({matches:true}),
 requestAnimationFrame:fn=>(frames.push(fn),frames.length)};
 window.window=window;
 new Script(src).runInNewContext(window);
 function draw(){
  let count=0;
  while(frames.length){
   frames.shift()(clock+=16);
   if(++count>250)throw Error('Zoom draw loop stalled');
  }
 }
 draw();
 return {api:window.__INFINITE_V3,draw,handlers,calls:()=>calls,invalid:()=>invalid};
}
for(const [w,h] of [[390,844],[1600,900]]){
 const app=boot(w,h);
 assert.equal(app.api.renderMode,'stable-canvas2d');
 assert.equal(app.api.art.length,6);
 assert.ok(app.calls()>0,'At full zoom-out, original painted computer must render');
 app.api.setDepth(1.35);app.draw();
 app.api.setDepth(2.8);app.draw();
 app.api.setDepth(3.25);app.draw();
 app.api.setDepth(4.45);app.draw();
 app.api.setDepth(5.75);app.draw();
 assert.ok(app.calls()>16,'Each nested world must remain drawable');
 assert.equal(app.invalid(),0,'Render must never pass NaN or Infinity into drawImage');
 app.api.goHome();app.draw();
 assert.ok(app.api.atHome(),'Viewer and computer must reappear on full zoom-out');
}
console.log('V3 stable renderer: six worlds, no GPU preview popping, source image drawing, responsive zoom and original full-person ending verified.');
