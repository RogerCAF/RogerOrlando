"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowUpRight, Maximize2, Minus, Plus, RotateCcw, X } from "lucide-react";
import { portalAt, portalRatio, worldSvg, worldTitle } from "./bureau-worlds";
import type { Portal } from "./bureau-worlds";
import "./infinite-zoom.css";

/**
 * Nine curated illustrated scenes, followed by a procedural open world.
 * Nested openings are actual canvas clips, not hard cuts or unrelated slideshow frames.
 */
const MAX_CACHED_SCENES = 16;
const START_DEPTH = 0.015;
const CAPTIONS = [
  "Sommige ideeën beginnen bij een scherm. Deze bleef maar doorgaan.",
  "Ssst... achter dat sleutelgat is iemand nog aan het werk.",
  "De draak is hier voor zijn parkeervergunning. Al 400 jaar.",
  "Niet roeren. Er wonen mensen in.",
  "De garantie van de maan verliep gisteren.",
  "Rustige buurt. Soms beweegt de grond.",
  "Nieuwe schepping: vrijdag. Mits goedgekeurd door HR.",
  "Hier kun je zelfs verloren minuten kopen.",
  "De gebruiksaanwijzing voor de uitgang is uitgeleend.",
  "Geen laatste kamer. Alleen meer dingen om te ontdekken."
];

type XY = { x: number; y: number };
type Pointer = XY & { type: string };
type SceneImage = { img: HTMLImageElement; ready: boolean };
type RendererState = {
  level: number;
  target: number;
  x: number;
  y: number;
  tx: number;
  ty: number;
  auto: boolean;
  cache: Map<number, SceneImage>;
  needsPaint: boolean;
  pointers: Map<number, Pointer>;
  lastPinch: number | null;
  lastPointer: XY | null;
};
function createState(): RendererState {
  return {
    level: START_DEPTH, target: START_DEPTH, x: 0, y: 0, tx: 0, ty: 0, auto: false,
    cache: new Map(), needsPaint: true, pointers: new Map(), lastPinch: null, lastPointer: null
  };
}

function opening(ctx: CanvasRenderingContext2D, type: Portal) {
  ctx.beginPath();
  switch(type){
    case "screen":
      ctx.rect(371,390,258,181);break;
    case "keyhole":
      ctx.moveTo(500,448);
      ctx.bezierCurveTo(465,448,458,470,458,487);
      ctx.quadraticCurveTo(458,507,473,519);
      ctx.lineTo(463,552);ctx.quadraticCurveTo(500,562,537,552);
      ctx.lineTo(527,519);ctx.quadraticCurveTo(542,506,542,487);
      ctx.bezierCurveTo(542,462,523,448,500,448);ctx.closePath();break;
    case "coffee":
      ctx.ellipse(500,500,109,38,0,0,Math.PI*2);break;
    case "window":
      ctx.moveTo(436,581);ctx.lineTo(436,463);
      ctx.quadraticCurveTo(436,401,500,401);
      ctx.quadraticCurveTo(564,401,564,463);
      ctx.lineTo(564,581);ctx.closePath();break;
    case "moon":ctx.arc(500,500,103,0,Math.PI*2);break;
    case "watch":ctx.arc(500,500,93,0,Math.PI*2);break;
    case "globe":ctx.arc(500,500,105,0,Math.PI*2);break;
    case "book":
      ctx.moveTo(375,397);ctx.quadraticCurveTo(449,375,500,413);
      ctx.quadraticCurveTo(559,369,625,397);
      ctx.lineTo(625,603);ctx.quadraticCurveTo(556,580,500,627);
      ctx.quadraticCurveTo(452,583,375,604);ctx.closePath();break;
    default:ctx.rect(403,403,194,194);
  }
}

function acquire(state: RendererState, index: number) {
  const found = state.cache.get(index);
  if (found) return found;
  const img = new Image();
  const entry: SceneImage = {img, ready:false};
  state.cache.set(index, entry);
  img.onload = () => { entry.ready = true; state.needsPaint = true; };
  img.onerror = () => { entry.ready = false; };
  img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(worldSvg(index));
  if (state.cache.size > MAX_CACHED_SCENES) {
    const current = Math.floor(state.level);
    for (const old of [...state.cache.keys()]) {
      if (old < current - 4 || old > current + 12) state.cache.delete(old);
    }
  }
  return entry;
}

function render(canvas: HTMLCanvasElement, state: RendererState, width: number, height: number) {
  if(width<1||height<1)return;
  const ctx=canvas.getContext("2d");
  if(!ctx)return;
  const pixelRatio=Math.min(2,window.devicePixelRatio||1);
  const cw=Math.max(1,Math.round(width*pixelRatio));
  const ch=Math.max(1,Math.round(height*pixelRatio));
  if(canvas.width!==cw||canvas.height!==ch){canvas.width=cw;canvas.height=ch;}
  ctx.setTransform(pixelRatio,0,0,pixelRatio,0,0);
  ctx.clearRect(0,0,width,height);
  ctx.fillStyle="#e5ebe4";ctx.fillRect(0,0,width,height);

  // Draw each original illustration through an aperture with precisely aligned geometry.
  // Every scene stays present, and the scale changes continuously; no crossfade or cut.
  const base=Math.max(width,height)*1.07;
  const cx=width/2+state.x;
  const cy=height/2+state.y;
  const current=Math.max(0,Math.floor(state.level));
  const start=Math.max(0,current-1);
  const fractional=state.level-current;
  let dimension=base*Math.pow(1/portalRatio(current),fractional);
  if(start<current) dimension/=portalRatio(start);
  const stop=current+7;
  ctx.save();
  for(let i=start;i<=stop;i++){
    if(dimension>1e9){dimension*=portalRatio(i);continue;}
    if(dimension<.7)break;
    const scale=dimension/1000;
    ctx.setTransform(pixelRatio*scale,0,0,pixelRatio*scale,
      pixelRatio*(cx-500*scale),pixelRatio*(cy-500*scale));
    const art=acquire(state,i);
    if(art.ready)ctx.drawImage(art.img,0,0,1000,1000);
    else{ctx.fillStyle=i%2?"#e5ebe4":"#f5f1e8";ctx.fillRect(0,0,1000,1000);}
    opening(ctx,portalAt(i));
    ctx.clip();
    dimension*=portalRatio(i);
  }
  ctx.restore();
}

function pointerDistance(items: Map<number, Pointer>) {
  if (items.size < 2) return null;
  const p=[...items.values()];
  return Math.hypot(p[0].x-p[1].x,p[0].y-p[1].y);
}

export default function InfiniteZoom() {
  const canvasRef=useRef<HTMLCanvasElement>(null);
  const stageRef=useRef<HTMLDivElement>(null);
  const state=useRef<RendererState>(createState());
  const [expanded,setExpanded]=useState(false);
  const [auto,setAuto]=useState(false);
  const [scene,setScene]=useState(0);

  const step=useCallback((amount:number,focus?:XY)=>{
    const s=state.current;
    const next=Math.max(0,Math.min(10000,s.target+amount));
    const change=next-s.target;
    if(focus && stageRef.current){
      const r=stageRef.current.getBoundingClientRect();
      const dx=focus.x-r.left-r.width/2,dy=focus.y-r.top-r.height/2;
      const factor=Math.pow(1/portalRatio(Math.max(0,Math.floor(s.target))),change);
      s.tx=dx+(s.tx-dx)*factor;
      s.ty=dy+(s.ty-dy)*factor;
    }
    s.target=next;
    s.needsPaint=true;
  },[]);

  const reset=useCallback(()=>{
    const s=state.current;
    s.target=START_DEPTH;s.tx=0;s.ty=0;s.auto=false;
    setAuto(false);s.needsPaint=true;
  },[]);

  const toggleAuto=useCallback(()=>{
    const s=state.current;s.auto=!s.auto;setAuto(s.auto);
  },[]);

  useEffect(()=>{
    const canvas=canvasRef.current,stage=stageRef.current;
    if(!canvas || !stage)return;
    let frame=0,visible=true;
    let width=0,height=0,lastIndex=-1,lastTime=0;
    const observer=new ResizeObserver(entries=>{
      const r=entries[0]?.contentRect;
      if(r){width=r.width;height=r.height;state.current.needsPaint=true;}
    });
    observer.observe(stage);
    const intersection=new IntersectionObserver(entries=>{
      visible=entries[0]?.isIntersecting??true;
      if(visible)state.current.needsPaint=true;
    },{threshold:0});
    intersection.observe(stage);
    function tick(now:number) {
      const s=state.current;
      const delta=lastTime?Math.min(50,now-lastTime):16;
      lastTime=now;
      if (visible && !document.hidden) {
        if(s.auto){s.target+=delta*.00024;s.needsPaint=true;}
        const smooth=1-Math.pow(.79,delta/16);
        const deltaLevel=s.target-s.level;
        if(Math.abs(deltaLevel)>0.00006){
          s.level+=deltaLevel*smooth;
          s.needsPaint=true;
        }else if(deltaLevel!==0){s.level=s.target;s.needsPaint=true;}
        const dx=s.tx-s.x,dy=s.ty-s.y;
        if(Math.abs(dx)+Math.abs(dy)>.1){
          s.x+=dx*smooth;s.y+=dy*smooth;s.needsPaint=true;
        }else if(dx!==0||dy!==0){s.x=s.tx;s.y=s.ty;s.needsPaint=true;}
        if(s.needsPaint){
          render(canvas!,s,width||stage!.clientWidth,height||stage!.clientHeight);
          s.needsPaint=false;
        }
        const levelIndex=Math.max(0,Math.floor(s.level+.07));
        if(levelIndex!==lastIndex){lastIndex=levelIndex;setScene(levelIndex);}
      }
      frame=requestAnimationFrame(tick);
    }
    frame=requestAnimationFrame(tick);
    return()=>{cancelAnimationFrame(frame);observer.disconnect();intersection.disconnect();};
  },[]);

  useEffect(()=>{
    if(!expanded)return;
    const previous=document.body.style.overflow;
    document.body.style.overflow="hidden";
    const key=(event:KeyboardEvent)=>{
      if(event.key==="Escape")setExpanded(false);
      if(event.key==="ArrowDown"||event.key==="+"){
        event.preventDefault();step(.22);
      }
      if(event.key==="ArrowUp"||event.key==="-"){
        event.preventDefault();step(-.22);
      }
      if(event.key==="Home")reset();
    };
    document.addEventListener("keydown",key);
    return()=>{
      document.body.style.overflow=previous;
      document.removeEventListener("keydown",key);
    };
  },[expanded,step,reset]);

  const onPointerDown=(event:React.PointerEvent<HTMLCanvasElement>)=>{
    if(!expanded)return;
    event.currentTarget.setPointerCapture(event.pointerId);
    const s=state.current;
    s.auto=false;setAuto(false);
    s.pointers.set(event.pointerId,{x:event.clientX,y:event.clientY,type:event.pointerType});
    s.lastPointer={x:event.clientX,y:event.clientY};
    s.lastPinch=pointerDistance(s.pointers);
  };
  const onPointerMove=(event:React.PointerEvent<HTMLCanvasElement>)=>{
    const s=state.current;
    if(!expanded||!s.pointers.has(event.pointerId))return;
    const previous=s.pointers.get(event.pointerId)!;
    s.pointers.set(event.pointerId,{x:event.clientX,y:event.clientY,type:event.pointerType});
    if(s.pointers.size===1){
      s.tx+=event.clientX-previous.x;
      s.ty+=event.clientY-previous.y;
      s.needsPaint=true;
    }else{
      const newDistance=pointerDistance(s.pointers);
      if(newDistance && s.lastPinch && newDistance>5 && s.lastPinch>5){
        const points=[...s.pointers.values()];
        step(Math.log(newDistance/s.lastPinch)/Math.log(1/portalRatio(Math.max(0,Math.floor(s.target)))),
          {x:(points[0].x+points[1].x)/2,y:(points[0].y+points[1].y)/2});
      }
      s.lastPinch=newDistance;
    }
  };
  const onPointerUp=(event:React.PointerEvent<HTMLCanvasElement>)=>{
    const s=state.current;
    s.pointers.delete(event.pointerId);
    s.lastPinch=pointerDistance(s.pointers);
    if(!s.pointers.size)s.lastPointer=null;
  };

  const number=String(scene+1).padStart(2,"0");
  const description=CAPTIONS[scene]??CAPTIONS[9];

  return (
    <section className={expanded?"iw iw-expanded":"iw"} aria-label="Interactieve wereld: The Bureau of Impossible Things">
      <div className="iw-header">
        <div className="iw-identity"><span className="iw-lit"/><span>THE BUREAU OF IMPOSSIBLE THINGS</span><span className="iw-light-text">ZOOM EXPERIMENT</span></div>
        <button className="iw-expand" type="button" onClick={()=>setExpanded(v=>!v)}>
          {expanded?<X size={16}/>:<Maximize2 size={16}/>}
          <span>{expanded?"SLUIT":"OPEN FULLSCREEN"}</span>
        </button>
      </div>
      <div className="iw-stage" ref={stageRef}>
        <canvas
          className="iw-canvas" ref={canvasRef}
          aria-label="Zoom door een geïllustreerde wereld via een scherm, sleutelgat, koffiekopje en andere doorgangen"
          onWheel={event=>{
            if(!expanded)return;
            event.preventDefault();
            step(event.deltaY*.00175,{x:event.clientX,y:event.clientY});
            if(state.current.auto){state.current.auto=false;setAuto(false);}
          }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onDoubleClick={event=>{if(expanded)step(.33,{x:event.clientX,y:event.clientY});}}
        />
        <div className="iw-grain" aria-hidden="true"/>
        {expanded&&<div className="iw-world-dot" aria-live="polite">WERELD {number} / ∞</div>}
        <div className="iw-controls" aria-label="Zoombediening">
          <button type="button" title="Inzoomen" aria-label="Inzoomen" onClick={()=>step(.3)}><Plus size={18}/></button>
          <button type="button" title="Uitzoomen" aria-label="Uitzoomen" onClick={()=>step(-.3)}><Minus size={18}/></button>
          <i aria-hidden="true"/>
          <button type="button" className={auto?"iw-active":""} title={auto?"Automatisch zoomen pauzeren":"Automatisch zoomen"} aria-label={auto?"Automatisch zoomen pauzeren":"Automatisch inzoomen"} onClick={toggleAuto}>{auto?"Ⅱ":"▶"}</button>
          <button type="button" title="Terug naar het begin" aria-label="Terug naar het begin" onClick={reset}><RotateCcw size={17}/></button>
        </div>
      </div>
      <div className="iw-footer">
        <div className="iw-footer-copy">
          <strong>THE BUREAU OF IMPOSSIBLE THINGS</strong>
          <span>{expanded?worldTitle(scene)+" · "+description:"Zoom het verhaal binnen. Verborgen deuren, muisjes en kleine grapjes."}</span>
        </div>
        {!expanded&&<button type="button" className="iw-start" onClick={()=>setExpanded(true)}>ONTDEK DE WERELD <ArrowUpRight size={16}/></button>}
        {expanded&&<span className="iw-footer-help">SCROLL · SLEEP · PINCH <span aria-hidden="true">/</span> ESC</span>}
      </div>
    </section>
  );
}
