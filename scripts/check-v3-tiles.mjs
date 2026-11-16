import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { Script } from 'node:vm';

const moduleSource=readFileSync('public/v3/zoom-v3/lod-tiles.js','utf8');
const experience=readFileSync('public/infinite-worlds-v3-play.html','utf8');
new Script(moduleSource,{filename:'v3/lod-tiles.js'});
assert.match(experience,/<script src="\.\/v3\/zoom-v3\/lod-tiles\.js"><\/script>/,
  'The real V3 player must load the new GPU renderer before its own zoom logic');
assert.ok(experience.includes('tileRenderer.draw(i,g,ctx,state)'),
  'All nested world images must pass through adaptive tile rendering');
assert.ok(experience.includes('ctx.drawImage(im,left,top'),
  'Keep the original Canvas2D rendering as a safe non-WebGL fallback');
assert.ok(experience.includes('window.__INFINITE_V3')&&experience.includes('tileStats:'),
  'Expose live tile diagnostics for browser profiling');
for(const scene of ['01-computer-refined.webp','02-server.webp','03-grand-stairway.webp',
                    '04-observatory-daylight.webp','05-honeybadgers.webp','06-pearl-conflict.webp']){
 assert.ok(experience.includes(scene),'Original approved world missing after renderer upgrade: '+scene);
}
assert.match(moduleSource,/MAX_TILE_BYTES=24\*1024\*1024/,
  'Tile textures need a strict memory budget for iPhones');
assert.match(moduleSource,/createImageBitmap\(im,sx,sy,sw,sh,/,
  'Texture tiles should decode progressively at their selected detail level');
assert.match(moduleSource,/gl\.deleteTexture\(removed\.tex\)/,
  'Old GPU textures must be freed when cache is full');
assert.match(moduleSource,/ctx\.drawImage\(layer,0,0,w,h,0,0,state\.w,state\.h\)/,
  'GPU tile output must remain inside the existing physical Canvas portal masks');

const drawCalls=[],renderCalls=[],texturesDeleted=[];
let nextTexture=1;
const gl=new Proxy({}, {get(_obj,key){
 if(key==='MAX_TEXTURE_SIZE')return 0x0D33;
 if(key==='COMPILE_STATUS'||key==='LINK_STATUS')return true;
 if(key==='TEXTURE_2D')return 3553;
 if(key==='createTexture')return ()=>({id:nextTexture++});
 if(key==='deleteTexture')return tex=>texturesDeleted.push(tex.id);
 if(key==='getShaderParameter'||key==='getProgramParameter')return ()=>true;
 if(key==='getAttribLocation')return (_program,name)=>name==='a_pos'?0:1;
 if(key==='getParameter')return ()=>2048;
 if(key==='bufferData')return (_kind,vertices)=>{
  assert.equal(vertices.length,16,'Each tile must use exactly four textured vertices');
  for(let j=0;j<vertices.length;j+=4){
    assert.ok(vertices[j]>=-1.00001&&vertices[j]<=1.00001,'Tile X must be viewport clipped');
    assert.ok(vertices[j+1]>=-1.00001&&vertices[j+1]<=1.00001,'Tile Y must be viewport clipped');
    assert.ok(vertices[j+2]>=-0.0001&&vertices[j+2]<=1.0001,'Tile U coordinates must be valid');
    assert.ok(vertices[j+3]>=-0.0001&&vertices[j+3]<=1.0001,'Tile V coordinates must be valid');
  }
 };
 if(key==='drawArrays')return ()=>drawCalls.push(1);
 if(key==='createShader'||key==='createProgram'||key==='createBuffer'||key==='getUniformLocation')return ()=>({});
 return ()=>{};
}});
const fake2D={imageSmoothingEnabled:true,imageSmoothingQuality:'high',drawImage(){}};
const fakeDocument={createElement(type){
 assert.equal(type,'canvas');return {width:0,height:0,addEventListener(){},
  getContext:kind=>kind==='webgl'?gl:kind==='2d'?fake2D:null};
}};
const env={document:fakeDocument,createImageBitmap:async (_image,_x,_y,_w,_h,options)=>({
  width:options.resizeWidth,height:options.resizeHeight,close(){}})};
env.window=env;
new Script(moduleSource).runInNewContext(env);
const api=env.InfiniteWorldsTileEngine;
assert.equal(api.TILE,256);
assert.equal(api.pickLevel(2),0,'Zoomed-in image requires native-resolution sampling');
assert.equal(api.pickLevel(1),0);
assert.equal(api.pickLevel(.49),1,'Half-scale zoom should sample 2x downsampled tiles');
assert.equal(api.pickLevel(.24),2);
assert.equal(api.pickLevel(.10),3);
assert.equal(api.pickLevel(1e-10),3,'Maximum pyramid reduction must stay bounded');
const image={naturalWidth:1024,naturalHeight:1536,complete:true};
const renderCanvas={canvas:{width:512,height:512},drawImage(){renderCalls.push(1);}};
let refreshes=0;
const engine=api.create([image],[{w:1024,h:1536}],()=>refreshes++);
assert.ok(engine,'WebGL renderer must initialize when available');
const geometry={x:0,y:0,z:.5};
assert.ok(engine.draw(0,geometry,renderCanvas,{w:512,h:512,dpr:1}));
assert.ok(renderCalls.length===1,'GPU scene should composite once into the clipped 2D camera');
await new Promise(resolve=>setTimeout(resolve,20));
engine.draw(0,geometry,renderCanvas,{w:512,h:512,dpr:1});
assert.ok(engine.stats().cacheEntries>=4,'Visible areas must be progressively tiled');
assert.ok(engine.stats().tileBytes<=24*1024*1024,'Live tile textures must honor GPU cap');
assert.ok(engine.stats().thumbnails===1,'Keep one small, ready-to-render preview texture per scene');
assert.ok(engine.stats().drawnTiles>=4,'Ready tiles must actually be drawn over the thumbnail');
assert.ok(refreshes>0,'Decoded tiles must request a fresh scene render');
assert.ok(drawCalls.length>=5,'GPU renderer should rasterize tile geometry, not just set flags');
engine.dispose();
assert.equal(engine.stats().cacheEntries,0,'Dispose must release GPU tile resources');
assert.ok(texturesDeleted.length>=5,'GPU textures must really be deleted');
const noGpu={document:{createElement:()=>({getContext:()=>null})}};noGpu.window=noGpu;
new Script(moduleSource).runInNewContext(noGpu);
assert.equal(noGpu.InfiniteWorldsTileEngine.create([image],[{w:1024,h:1536}],()=>{}),null,
  'Unavailable WebGL must gracefully fall back to the existing 2D renderer');
console.log('V3 adaptive tiles: WebGL shader, multi-LOD selection, visible tiles, 24MB LRU cache, safe disposal and Canvas2D fallback verified.');