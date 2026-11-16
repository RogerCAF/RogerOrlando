import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { Script } from 'node:vm';

const html = readFileSync(new URL('../public/infinite-worlds.html', import.meta.url), 'utf8');
const door = readFileSync(new URL('../public/bureau-door-sharp.svg', import.meta.url), 'utf8');
const inline = html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
assert.ok(inline, 'The standalone Infinite Worlds script must exist.');
new Script(inline, { filename: 'infinite-worlds-inline.js' });

// Preserve the approved art. A previous regression replaced its paintings with
// flat computer screens; these must never silently return.
assert.ok(html.includes('/bureau-hallway-detail.webp'), 'Original detailed hallway missing.');
assert.ok(!/paintScreens|wallPanels|function\s+paintScreens/.test(html),
  'Artificial monitor overlays have returned to the paintings.');
assert.ok(!/z\s*<\s*(?:80|3500)/.test(html),
  'A hard-coded zoom-level cutoff can expose a blank canvas on free pan.');

// A portal is a geometric object in the *same* drawing, not a scene swap.
// The door illustration and the Canvas mask must share an identical aperture.
const mask = inline.match(/const keyholePath=new Path2D\('([^']+)'\)/)?.[1];
assert.ok(mask, 'The Canvas keyhole path was lost.');
assert.ok(door.includes('<path d="' + mask + '"'),
  'Door art and Canvas clip diverged — this would produce a visible seam.');
assert.ok(html.includes('/bureau-door-sharp.svg'), 'Sharp scalable door asset missing.');

// The complete finite stack must be loaded and decoded during initial setup,
// never on each portal or after scroll. Do not reintroduce per-level downloads.
for (const key of ['one','hall','door','two','server','archive','observatory','puffer','shrimp']) {
  assert.match(inline, new RegExp('\\b' + key + ":'"), 'Missing source: ' + key);
}
assert.ok(inline.includes("const totalAssets=Object.keys(sources).length"),
  'Complete gallery preload was removed.');
assert.ok(inline.includes("img.decode()"), 'Image predecode was removed.');
assert.ok(inline.includes('st.prepared=true'), 'Full-gallery readiness gate missing.');
assert.ok(html.includes('id="preload"'), 'Initial-only preload progress indicator missing.');
assert.ok(inline.includes('clipCircle(') && inline.includes('clipKeyhole('),
  'Nested portal masks must stay spatially registered.');
assert.ok(inline.includes('zoomBy(') && inline.includes("addEventListener('wheel'") &&
  inline.includes("addEventListener('pointermove'"),
  'Free wheel / drag / pinch interactions must remain functional.');

// Exercise 160 smooth zoom events through the real inline code in an isolated
// fake canvas. This catches runtime errors and degenerate crop rectangles.
const listeners = {}, animationFrames = [], mistakes = [];
let totalDraws = 0, time = 0;
const element = () => ({
  style: {}, dataset: {}, hidden: false,
  classList: { add(){}, remove(){} }, setAttribute(){},
  addEventListener(name, callback){ listeners[name] = callback; },
  getBoundingClientRect(){ return { width: 960, height: 720, left: 0, top: 0 }; },
  setPointerCapture(){}
});
const canvas = element();
const preload = element();
const nodes = {
  drawing: canvas, random: element(), startDock: element(),
  message: element(), 'aria-status': element(),
  preload, preloadFill: element()
};
const ctx = new Proxy({
  drawImage(...args){
    totalDraws++;
    assert.equal(args.length, 9, 'Every image uses a clipped 9-argument region.');
    for (const n of args.slice(1)) assert.ok(Number.isFinite(n), 'Non-finite image coordinate.');
    for (const n of [args[3],args[4],args[7],args[8]]) {
      assert.ok(n > 0, 'Zero or negative image region.');
    }
  }
}, {
  get(target, key){ return key in target ? target[key] : () => {}; },
  set(target, key, value){ target[key] = value; return true; }
});
canvas.getContext = () => ctx;
class MockImage {
  constructor(){ this.complete=true;this.naturalWidth=1086;this.naturalHeight=1448; }
  set src(url){
    if(url.includes('world-one')){ this.naturalWidth=960;this.naturalHeight=1370; }
    if(url.includes('hallway')){ this.naturalWidth=1680;this.naturalHeight=2020; }
    if(url.includes('door-sharp')){ this.naturalWidth=900;this.naturalHeight=1200; }
    Promise.resolve().then(() => this.onload?.());
  }
  decode(){ return Promise.resolve(); }
}
const env = {
  document: { getElementById: id => nodes[id] },
  window: { devicePixelRatio: 2 },
  Image: MockImage,
  Path2D: class { constructor(d){ this.d=d; } },
  matchMedia: () => ({ matches: false }),
  ResizeObserver: class { observe(){} },
  requestAnimationFrame: fn => { animationFrames.push(fn); return animationFrames.length; },
  clearTimeout: () => {},
  setTimeout: () => 0
};
new Function(...Object.keys(env), inline)(...Object.values(env));
for (let i=0;i<5;i++) await Promise.resolve();
assert.equal(preload.hidden, true, 'Images were not fully prepared before navigation.');
const advance = (count) => {
  for(let i=0;i<count;i++){
    const frame = animationFrames.shift();
    if(!frame)break;
    time += 16.667;
    try { frame(time); } catch (error) {
      mistakes.push(error.message);
      throw error;
    }
  }
};
advance(5);
assert.equal(typeof listeners.wheel, 'function', 'Scroll zoom listener missing.');
for(let i=0;i<80;i++){
  listeners.wheel({deltaMode:0,deltaY:-150,clientX:470,clientY:350,preventDefault(){}});
  advance(4);
}
advance(40);
for(let i=0;i<80;i++){
  listeners.wheel({deltaMode:0,deltaY:150,clientX:470,clientY:350,preventDefault(){}});
  advance(4);
}
advance(40);
assert.ok(totalDraws > 150, 'The multi-world canvas did not render normally.');
assert.equal(mistakes.length, 0, 'Rendering exceptions occurred.');
console.log('Infinite Worlds: original paintings, portal alignment, preload and 160 zoom events verified.');
