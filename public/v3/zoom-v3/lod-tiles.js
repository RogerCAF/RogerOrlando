/* Infinite Worlds V3 / independent adaptive texture-tile renderer.
 * Technical ideas: viewport culling, native-resolution tiles, progressive LOD,
 * async image decoding and bounded GPU memory. No third-party renderer code.
 * Draws into a transparent WebGL canvas; the existing 2D scene graph owns
 * physical portal clipping, linework, artwork positions and camera math.
 */
(function(global){
'use strict';
const TILE=256,MAX_LEVEL=3,MAX_TILE_BYTES=24*1024*1024,MAX_ACTIVE=3;
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const pickLevel=(pixelScale)=>clamp(Math.floor(Math.log2(1/Math.max(pixelScale,1e-8))),0,MAX_LEVEL);
function create(images,art,refresh){
  if(!global.document || !document.createElement)return null;
  const layer=document.createElement('canvas');
  let gl=null;
  try{gl=layer.getContext('webgl',{alpha:true,antialias:false,depth:false,stencil:false,
    premultipliedAlpha:false,preserveDrawingBuffer:true,powerPreference:'low-power'});}
  catch(_){return null;}
  if(!gl)return null;
  const makeShader=(kind,src)=>{
    const o=gl.createShader(kind);gl.shaderSource(o,src);gl.compileShader(o);
    if(!gl.getShaderParameter(o,gl.COMPILE_STATUS))throw Error('tile shader: '+gl.getShaderInfoLog(o));
    return o;
  };
  let program,buffer,position,texcoord,sampler;
  try{
    const vs=makeShader(gl.VERTEX_SHADER,'attribute vec2 a_pos; attribute vec2 a_uv; varying vec2 v_uv; void main(){gl_Position=vec4(a_pos,0.0,1.0);v_uv=a_uv;}');
    const fs=makeShader(gl.FRAGMENT_SHADER,'precision mediump float; varying vec2 v_uv; uniform sampler2D u_image; void main(){gl_FragColor=texture2D(u_image,v_uv);}');
    program=gl.createProgram();gl.attachShader(program,vs);gl.attachShader(program,fs);gl.linkProgram(program);
    if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error('tile linking failed');
    gl.deleteShader(vs);gl.deleteShader(fs);
    position=gl.getAttribLocation(program,'a_pos');texcoord=gl.getAttribLocation(program,'a_uv');
    sampler=gl.getUniformLocation(program,'u_image');buffer=gl.createBuffer();
  }catch(e){console.warn('Infinite Worlds: WebGL tiles unavailable',e);return null;}
  gl.disable(gl.DEPTH_TEST);gl.disable(gl.BLEND);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);
  gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,false);
  const thumbnails=new Map(),tiles=new Map(),waiting=new Set(),jobs=[];
  let tileBytes=0,tick=0,active=0,disposed=false,viewportW=0,viewportH=0,failed=false;
  let attempts=0,drawnTiles=0;
  layer.addEventListener('webglcontextlost',e=>{e.preventDefault();failed=true;},false);
  const maxTexture=gl.getParameter(gl.MAX_TEXTURE_SIZE)||2048;
  const createTexture=(source)=>{
    const tex=gl.createTexture();if(!tex)return null;
    gl.bindTexture(gl.TEXTURE_2D,tex);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
    try{gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,source);}
    catch(e){gl.deleteTexture(tex);return null;}
    return tex;
  };
  const tileCanvas=(im,sx,sy,sw,sh,rw,rh)=>{
    const c=document.createElement('canvas');c.width=rw;c.height=rh;
    const ctx=c.getContext('2d');if(!ctx)throw Error('No tile fallback context');
    ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
    ctx.drawImage(im,sx,sy,sw,sh,0,0,rw,rh);return c;
  };
  const thumbnail=(index)=>{
    if(thumbnails.has(index))return thumbnails.get(index);
    const im=images[index];if(!im||!im.complete||!im.naturalWidth)return null;
    const w=Math.min(512,im.naturalWidth),h=Math.min(maxTexture,Math.round(im.naturalHeight*w/im.naturalWidth));
    const c=tileCanvas(im,0,0,im.naturalWidth,im.naturalHeight,w,h);
    const tex=createTexture(c);if(!tex)return null;
    const data={tex,w,h};thumbnails.set(index,data);return data;
  };
  const trim=()=>{
    while(tileBytes>MAX_TILE_BYTES&&tiles.size){
      let oldest=null,age=Infinity;
      for(const [key,t] of tiles){if(t.last<age){age=t.last;oldest=key;}}
      if(oldest==null)break;
      const removed=tiles.get(oldest);gl.deleteTexture(removed.tex);tileBytes-=removed.bytes;tiles.delete(oldest);
    }
  };
  const pump=()=>{
    if(disposed||failed)return;
    while(active<MAX_ACTIVE && jobs.length){
      const job=jobs.shift();active++;
      const im=images[job.i];const factor=2**job.level;
      const gutter=factor;
      const sx=Math.max(0,job.col*TILE*factor-gutter),sy=Math.max(0,job.row*TILE*factor-gutter);
      const ex=Math.min(art[job.i].w,(job.col+1)*TILE*factor+gutter);
      const ey=Math.min(art[job.i].h,(job.row+1)*TILE*factor+gutter);
      const sw=Math.max(1,ex-sx),sh=Math.max(1,ey-sy);
      const rw=Math.max(1,Math.round(sw/factor)),rh=Math.max(1,Math.round(sh/factor));
      const decode=global.createImageBitmap
        ?global.createImageBitmap(im,sx,sy,sw,sh,{resizeWidth:rw,resizeHeight:rh,resizeQuality:'high'})
        :Promise.resolve(tileCanvas(im,sx,sy,sw,sh,rw,rh));
      Promise.resolve(decode).then(bitmap=>{
        try{
          if(disposed||failed)return;
          const tex=createTexture(bitmap);
          if(tex){const bytes=rw*rh*4;
            tiles.set(job.key,{tex,sx,sy,sw,sh,w:rw,h:rh,bytes,last:++tick});
            tileBytes+=bytes;trim();refresh();}
        }finally{bitmap.close?.();}
      }).catch(()=>{attempts++;}).finally(()=>{waiting.delete(job.key);active--;pump();});
    }
  };
  const enqueue=(i,level,col,row)=>{
    const key=i+':'+level+':'+col+':'+row;
    if(tiles.has(key)||waiting.has(key)||jobs.length>75)return key;
    waiting.add(key);jobs.push({i,level,col,row,key});pump();return key;
  };
  // Draw a clipped screen rectangle with source UVs. CPU double-precision
  // transforms prevent enormous nested coordinates from reaching GPU floats.
  const quad=(tex,srcX,srcY,srcW,srcH,screenX,screenY,screenW,screenH)=>{
    if(!tex||!Number.isFinite(screenX+screenY+screenW+screenH)||screenW<=0||screenH<=0)return;
    const left=Math.max(0,screenX),right=Math.min(viewportW,screenX+screenW);
    const top=Math.max(0,screenY),bottom=Math.min(viewportH,screenY+screenH);
    if(right<=left||bottom<=top)return;
    const u0=srcX+(left-screenX)/screenW*srcW,u1=srcX+(right-screenX)/screenW*srcW;
    const v0=srcY+(top-screenY)/screenH*srcH,v1=srcY+(bottom-screenY)/screenH*srcH;
    const x0=2*left/viewportW-1,x1=2*right/viewportW-1;
    const y0=1-2*top/viewportH,y1=1-2*bottom/viewportH;
    gl.bindTexture(gl.TEXTURE_2D,tex);
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([
      x0,y0,u0,v0, x1,y0,u1,v0, x0,y1,u0,v1, x1,y1,u1,v1
    ]),gl.STREAM_DRAW);
    gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
  };
  const begin=(w,h)=>{
    if(viewportW!==w||viewportH!==h){viewportW=w;viewportH=h;layer.width=w;layer.height=h;}
    gl.viewport(0,0,w,h);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(program);gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
    gl.enableVertexAttribArray(position);gl.enableVertexAttribArray(texcoord);
    gl.vertexAttribPointer(position,2,gl.FLOAT,false,16,0);
    gl.vertexAttribPointer(texcoord,2,gl.FLOAT,false,16,8);
    gl.activeTexture(gl.TEXTURE0);gl.uniform1i(sampler,0);
  };
  const draw=(i,g,ctx,state)=>{
    if(disposed||failed||!Number.isFinite(g.z)||g.z<=0||!images[i]?.naturalWidth)return false;
    const w=ctx.canvas.width,h=ctx.canvas.height;if(!w||!h)return false;
    const thumb=thumbnail(i);if(!thumb)return false;
    begin(w,h);
    // All transforms are in CSS pixels, while the WebGL backing store is DPR.
    const dpr=state.dpr,A=art[i],sx=g.x*dpr,sy=g.y*dpr,z=g.z*dpr;
    quad(thumb.tex,0,0,1,1,sx,sy,A.w*z,A.h*z);
    const sourceLeft=clamp(-sx/z,0,A.w),sourceTop=clamp(-sy/z,0,A.h);
    const sourceRight=clamp((w-sx)/z,0,A.w),sourceBottom=clamp((h-sy)/z,0,A.h);
    if(sourceRight>sourceLeft&&sourceBottom>sourceTop){
      const level=pickLevel(z),span=TILE*2**level;
      const colStart=Math.floor(sourceLeft/span),rowStart=Math.floor(sourceTop/span);
      const colEnd=Math.floor((sourceRight-1e-8)/span),rowEnd=Math.floor((sourceBottom-1e-8)/span);
      for(let row=rowStart;row<=rowEnd;row++)for(let col=colStart;col<=colEnd;col++){
        const key=enqueue(i,level,col,row),entry=tiles.get(key);
        if(!entry)continue;
        entry.last=++tick;drawnTiles++;
        quad(entry.tex,0,0,1,1,sx+entry.sx*z,sy+entry.sy*z,entry.sw*z,entry.sh*z);
      }
    }
    gl.flush();
    // Existing Canvas2D clips determine monitor, door, telescope and pearl.
    ctx.drawImage(layer,0,0,w,h,0,0,state.w,state.h);
    return true;
  };
  return {draw,stats:()=>({gpu:true,tileSize:TILE,cacheEntries:tiles.size,tileBytes,pending:waiting.size,
    thumbnails:thumbnails.size,drawnTiles,decodeFailures:attempts}),dispose:()=>{
      disposed=true;for(const item of tiles.values())gl.deleteTexture(item.tex);
      for(const item of thumbnails.values())gl.deleteTexture(item.tex);
      tiles.clear();thumbnails.clear();tileBytes=0;
    }};
}
global.InfiniteWorldsTileEngine={create,pickLevel,TILE,MAX_LEVEL};
})(window);