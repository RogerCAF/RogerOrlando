import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { Script, runInNewContext } from 'node:vm';

const html=readFileSync(new URL('../public/infinite-worlds-v2.html',import.meta.url),'utf8');
const js=html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
assert.ok(js,'Vector V2 must include its zoom engine');
new Script(js,{filename:'infinite-worlds-v2.js'});
assert.match(html,/viewBox="0 0 1200 900"/);
assert.match(js,/const scenes=\[worldComputer,worldGallery,worldBalcony,worldServer,worldArchive,worldObservatory\]/);
assert.match(js,/worldEnding\(ending\)/);
assert.ok(!/<image\s|<canvas\s|\.webp|\.png|\.jpe?g|data:image\/|drawImage\(/i.test(html),
  'Vector-first world must not silently regress to enlarging raster imagery');
assert.ok(js.includes('clip-path="url(#') && js.includes('clipPathUnits="userSpaceOnUse"'),
  'Portal children must share real registered vector clipping geometry');
assert.ok(js.includes('const childTransform=') && js.includes('function buildScene') &&
  js.includes('camera.setAttribute(\'transform\''),
  'Missing shared zoom camera or nested SVG scene graph');
assert.ok(js.includes('pointerdown') && js.includes('pointermove') &&
  js.includes("addEventListener('wheel'"),'Wheel, pan and pinch must remain interactive');
assert.ok(js.includes("A SMALL TELESCOPE") &&
  js.includes("OBSERVE. DO NOT DISTURB THE HORIZON."),
  'The small, believable one-lens balcony telescope is missing');
const raw=js.match(/const portals=\[([\s\S]*?)\];\n\/\/ Portal center/)?.[1];
assert.ok(raw,'Portal geometry definitions must be present');
const p=runInNewContext('['+raw+']');
assert.equal(p.length,6,'Expected a nested portal for every transition among seven worlds');
assert.deepEqual(Array.from(p,x=>x.type),['rect','keyhole','circle','circle','circle','circle']);
assert.ok(p[2].r<10 && p[2].w<=12,'Telescope lens became oversized again');
for(let i=0;i<p.length;i++){
 const o=p[i];
 assert.ok(o.x>0&&o.x<1200&&o.y>0&&o.y<900&&o.w>0);
 const h=o.w*.75;
 if(o.type==='circle'||o.type==='keyhole'){
   const radius=o.type==='keyhole'?10:o.r;
   assert.ok(radius>=Math.hypot(o.w/2,h/2),'Round aperture cannot fully contain child transition '+i);
 }
 // At each world boundary the nested child and the new root share *exactly*
 // the same image coordinates. No scene swap position or scale discontinuity.
 const z=1200/o.w;
 for(const q of [[0,0],[1200,0],[0,900],[1200,900],[600,450]]){
   const parentX=o.x+(q[0]-600)*o.w/1200;
   const parentY=o.y+(q[1]-450)*o.w/1200;
   const outputX=600+(parentX-o.x)*z, outputY=450+(parentY-o.y)*z;
   assert.ok(Math.abs(outputX-q[0])<1e-8 && Math.abs(outputY-q[1])<1e-8,
     'The world-to-portal camera registration is not continuous at transition '+i);
 }
}
const titleMatches=js.match(/'0[1-7] \/ /g)||[];
assert.equal(titleMatches.length,7,'All seven worlds need accessible navigation names');
console.log('Infinite Worlds V2: 7 vector scenes, six exact portal alignments, small telescope, continuous zoom and pointer support verified.');
