import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Script} from 'node:vm';

const html=readFileSync('public/infinite-worlds-v3-play.html','utf8');
const intro=readFileSync('app/components/InfiniteWorldsPreview.tsx','utf8');
const images=[
 ['01-computer-refined.webp',1084,1451,400000],
 ['02-server.webp',1024,1536,200000],
 ['03-grand-stairway.webp',800,1280,350000],
 ['04-observatory.webp',658,1386,120000],
 ['05-honeybadgers.webp',650,1380,150000],
 ['06-pearl-conflict.webp',975,1536,60000]
];
function dimensions(b,path){
 assert.equal(b.toString('ascii',0,4),'RIFF',path+' missing RIFF header');
 assert.equal(b.toString('ascii',8,12),'WEBP',path+' missing WEBP header');
 assert.equal(b.toString('ascii',12,16),'VP8 ',path+' codec changed, expected lossy WebP');
 return [b.readUInt16LE(26)&0x3fff,b.readUInt16LE(28)&0x3fff];
}
for(const [name,w,h,minBytes] of images){
 const path='public/v3/zoom-v3/'+name,b=readFileSync(path);
 assert.deepEqual(dimensions(b,path),[w,h],path+' unexpectedly changed dimensions');
 assert.ok(b.length>=minBytes,path+' source illustration lost substantial detail');
 assert.ok(html.includes('./v3/zoom-v3/'+name),name+' not linked by playing zoom');
}
const js=html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
assert.ok(js,'V3 active image compositor is missing');
new Script(js,{filename:'infinite-worlds-v3-play.js'});
assert.ok(js.includes('const portals=[') && js.includes('const art=['),'Missing authored image-to-image geometry');
assert.ok(js.includes("cx:541,cy:690,rx:269,ry:252"),
  'The screen portal must follow the actual painted glass rather than spill into its brass frame.');
assert.ok(!js.includes("file:'./v3/zoom-v3/01-computer.webp'"),
  'The old illustration must not silently reappear in the playable zoom.');
assert.equal((js.match(/shape:'(?:oval|arch)'/g)||[]).length,6,'Six physical openings are required for the six-world loop');
for(const label of ['SERVERKAMER','HET OBSERVATORIUM','HONEYBADGERS','PAREL','LUS'])
 assert.ok(html.includes(label),label+' narrative element is missing');
assert.ok(js.includes('const n=(i+1)%art.length') && js.includes('renderNested(n,next,remaining-1,false)'),
 'The pearl must contain world one without fake full-screen swaps');
assert.ok(js.includes('window.__INFINITE_V3') && js.includes('function calcRoot(depth)'),
 'Camera must have reproducible boundary positions');
assert.ok(js.includes('function telescopeMacro(g)') && js.includes('ctx.translate(g.x,g.y)'),
 'The near-zero lens needs a redrawn sharp macro rather than enlarging the thumbnail indefinitely');
for(const action of ['pointerdown','pointermove','pointercancel','wheel','keydown'])
 assert.ok(js.includes(action),'Missing '+action+' input control');
assert.ok(js.includes('foregroundViewer') && js.includes('ctx.clip()') && js.includes('g.i===0&&g.cycle===0'),
 'Original seated viewer must stay in front of the monitor aperture');
assert.ok(intro.includes('src="/infinite-worlds.html"') && intro.includes('href="/infinite-worlds.html"'),
 'Never replace the approved production experience before visual signoff');
console.log('V3 live-preview: 6 verified illustrated masters, continuous physical clips, input, optical macro and recursive pearl loop.');
