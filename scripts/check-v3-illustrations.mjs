import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { Script } from 'node:vm';
const preview=readFileSync('public/infinite-worlds-v3-concept.html','utf8');
const live=readFileSync('app/components/InfiniteWorldsPreview.tsx','utf8');
const illustrations=[
 ['computerwereld','public/v3/v3-computer-original-illustrated.webp',1084,1286,500000],
 ['wereldkaart','public/v3/v3-five-world-storyboard.webp',1672,941,450000]
];
function dimensions(path){
 const b=readFileSync(path);
 assert.equal(b.toString('ascii',0,4),'RIFF',path+': missing RIFF header');
 assert.equal(b.toString('ascii',8,12),'WEBP',path+': missing WebP identifier');
 assert.equal(b.toString('ascii',12,16),'VP8 ',path+': unexpected WebP codec');
 assert.ok(b.length>200000,path+': image too small');
 return [b.readUInt16LE(26)&0x3fff,b.readUInt16LE(28)&0x3fff,b.length];
}
for(const [name,path,w,h,minBytes] of illustrations){
 const [width,height,length]=dimensions(path);
 assert.deepEqual([width,height],[w,h],name+': dimensions changed');
 assert.ok(length>=minBytes,name+': source over-compressed');
 assert.ok(preview.includes('/'+path.replace('public/','')),name+': illustration not used');
}
for(let i=0;i<5;i++)assert.ok(preview.includes('data-scene="'+i+'"'),'World '+(i+1)+' missing');
for(const title of ['Computer','Serverkamer','Trappenhuis','Telescoopkamer','Honeybadger Realm'])
 assert.ok(preview.includes(title),'World heading missing: '+title);
assert.ok(preview.includes('Dit is een visuele stijlstudie'),'Preview must never masquerade as a completed infinite zoom');
assert.ok(preview.includes('De oorspronkelijke computeropstelling blijft herkenbaar'),
  'V3 artwork must preserve the original composition rather than redesigning the first world');
assert.ok(preview.includes('background-image:url(\'/v3/v3-computer-original-illustrated.webp\')'),
  'Thumbnail must show the approved original computer layout');
assert.ok(!preview.includes('class="hero-art" src="/v3/v3-computer-art.webp"'),
  'The rejected generic study must not return as the first-world hero');

assert.ok(preview.includes('aria-pressed')&&preview.includes('aria-live="polite"'),'Accessible art selector missing');
const script=preview.match(/<script>([\s\S]*?)<\/script>/)?.[1];
assert.ok(script,'Inline Javascript missing');new Script(script,{filename:'v3-art-preview.js'});
assert.ok(live.includes('src="/infinite-worlds.html"'),'Original embedded infinite zoom must stay intact');
assert.ok(live.includes('href="/infinite-worlds.html"'),'Original fullscreen link must stay intact');
console.log('V3 illustration preview: 2 proper high-res masters, 5 stages, interaction and original homepage preserved.');
