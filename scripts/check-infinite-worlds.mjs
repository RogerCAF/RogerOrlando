import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { Script } from 'node:vm';

const html = readFileSync(new URL('../public/infinite-worlds.html', import.meta.url), 'utf8');
const door = readFileSync(new URL('../public/bureau-door-sharp.svg', import.meta.url), 'utf8');
const galleryEngraving = readFileSync(new URL('../public/bureau-hallway-engraving.svg', import.meta.url), 'utf8');
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
assert.ok(html.includes('/bureau-hallway-engraving.svg'), 'Registered gallery vector detail layer missing.');
assert.match(galleryEngraving, /viewBox="0 0 1680 2020"/, 'Gallery detail coordinate system differs from painted hallway.');
assert.ok(!/<image\b|base64,/.test(galleryEngraving), 'Gallery detail must be true vector, not a bitmap disguised as SVG.');
assert.ok((galleryEngraving.match(/<g transform="translate\(/g)||[]).length >= 8,
  'Gallery engraving should preserve scaled plaquettes toward the doorway.');
assert.ok((door.match(/href="#carving"/g)||[]).length === 6, 'Six carved walnut panels missing.');
assert.ok(door.includes('id="fineWalnut"'), 'Real fine-grain door detail was removed.');
assert.ok(html.includes('const engravingAlpha=hallAlpha*smooth'), 'Gallery details must blend progressively.');
assert.ok(html.includes("st.panTargetX") && html.includes("const panEasing="),
  'Smooth wheel pan camera response missing.');

// The complete finite stack must be loaded and decoded during initial setup,
// never on each portal or after scroll. Do not reintroduce per-level downloads.
for (const key of ['one','hall','hallEngraving','door','two','server','archive','observatory','puffer','shrimp']) {
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
const renderSources = new Set();
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
    if(args[0]?.assetUrl) renderSources.add(args[0].assetUrl);
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
    this.assetUrl=url;
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
assert.ok(renderSources.has('/bureau-hallway-engraving.svg'),
  'Extra fine gallery details were loaded but never composited while zooming.');
for(let i=0;i<80;i++){
  listeners.wheel({deltaMode:0,deltaY:150,clientX:470,clientY:350,preventDefault(){}});
  advance(4);
}
advance(40);
// Exercise drag and pinch interactions after zooming to make sure eased
// wheel pan does not interfere with direct pointer tracking.
for(let i=0;i<5;i++){
  listeners.wheel({deltaMode:0,deltaY:-150,clientX:470,clientY:350,preventDefault(){}});
  advance(15);
}
listeners.pointerdown({pointerType:'mouse',button:0,pointerId:1,clientX:410,clientY:330});
listeners.pointermove({pointerId:1,clientX:440,clientY:350});
advance(8);
listeners.pointerdown({pointerType:'touch',button:0,pointerId:2,clientX:580,clientY:350});
listeners.pointermove({pointerId:2,clientX:620,clientY:370});
advance(8);
listeners.pointerup({pointerId:2}); listeners.pointerup({pointerId:1});
assert.ok(totalDraws > 150, 'The multi-world canvas did not render normally.');
assert.equal(mistakes.length, 0, 'Rendering exceptions occurred.');

// Visual asset quality: keep the upgraded archive active, preserve the original
// Bier Koerier artwork, and never silently replace genuine vector logos with
// low-resolution images embedded in an SVG wrapper again.
const archiveHd = readFileSync(new URL('../public/bureau-world-four-archive-hd.webp', import.meta.url));
assert.ok(archiveHd.byteLength > 300000, 'Detailed underwater artwork missing/truncated.');
assert.equal(archiveHd.toString('ascii', 0, 4), 'RIFF', 'Archive art must be a real WebP.');
assert.equal(archiveHd.toString('ascii', 8, 12), 'WEBP', 'Archive artwork format corrupt.');
assert.ok(html.includes("/bureau-world-four-archive-hd.webp"), 'The high-detail archive is not rendered.');
assert.match(html, /archivePortal=\{x:530,y:893,r:25\}/, 'New archive glass coordinates lost.');
const portfolio = readFileSync(new URL('../app/components/PortfolioCaseStudies.tsx', import.meta.url), 'utf8');
const cityfi = readFileSync(new URL('../public/projects/cityfi-sharp.svg', import.meta.url), 'utf8');
const bier = readFileSync(new URL('../public/projects/bierkoerier-original.webp', import.meta.url));
assert.ok(cityfi.includes('<svg') && cityfi.includes('</svg>'), 'The CityFi artwork must be SVG.');
assert.ok(!/<image\b|base64,/.test(cityfi), 'CityFi has regressed into a low-resolution embedded bitmap.');
assert.ok(portfolio.includes('/projects/cityfi-sharp.svg'), 'Crisp CityFi vector not displayed.');
assert.ok(portfolio.includes('/projects/bierkoerier-original.webp'), 'Original high-resolution Bier Koerier logo not displayed.');
assert.ok(bier.byteLength > 150000, 'Authentic Bier Koerier source was replaced with a tiny thumbnail.');
assert.equal(bier.toString('ascii', 0, 4), 'RIFF', 'Bier Koerier image must be real WebP.');

console.log('Infinite Worlds: original paintings, detailed archive, sharp project marks, portal alignment and 160 zoom events verified.');
