"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowUpRight, Maximize2, Minus, Plus, RotateCcw, X } from "lucide-react";
import { apertureFor, sceneSvg, sceneTitle } from "./infinite-world-art";
import type { Aperture } from "./infinite-world-art";
import "./infinite-zoom.css";

/**
 * Nine curated illustrated scenes, followed by a procedural open world.
 * Nested openings are actual canvas clips, not hard cuts or unrelated slideshow frames.
 */
const DEPTH_RATIO = 4.5;
const MAX_CACHED_SCENES = 16;
const START_DEPTH = 0.04;
const CAPTIONS = [
  "Iedere deur heeft een verhaal. Deze heeft er een paar te veel.",
  "Je bent nog op tijd om terug te gaan. Zeggen ze.",
  "Waarschuwing: bruggen zijn niet gekeurd voor draken.",
  "Niet zo staren. Hij kijkt terug.",
  "Ssst. Hij heeft morgen een vergadering.",
  "Technische storing. Het universum wordt opnieuw opgestart.",
  "Een stad waar zelfs de tijd verdwaalt.",
  "Ergens hier ligt de handleiding voor de uitgang.",
  "Geen eindscherm. Geen haast. Alleen nog meer werelden."
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

function opening(ctx: CanvasRenderingContext2D, type: Aperture) {
  ctx.beginPath();
  if (type === "keyhole") {
    ctx.moveTo(500,408);
    ctx.bezierCurveTo(454,408,439,445,439,478);
    ctx.bezierCurveTo(439,513,468,536,478,543);
    ctx.lineTo(465,610);
    ctx.quadraticCurveTo(500,620,535,610);
    ctx.lineTo(522,543);
    ctx.bezierCurveTo(540,526,562,510,562,478);
    ctx.bezierCurveTo(562,441,539,408,500,408);
    ctx.closePath();
  } else if (type === "window") {
    ctx.moveTo(434,595); ctx.lineTo(434,463);
    ctx.bezierCurveTo(434,394,566,394,566,463);
    ctx.lineTo(566,595); ctx.closePath();
  } else if (type === "eye") {
    ctx.ellipse(500,500,77,69,0,0,Math.PI*2);
  } else if (type === "book") {
    ctx.moveTo(414,421);ctx.quadraticCurveTo(466,391,500,426);
    ctx.quadraticCurveTo(549,386,586,421);
    ctx.lineTo(586,590);
    ctx.quadraticCurveTo(546,580,500,604);
    ctx.quadraticCurveTo(456,581,414,590);ctx.closePath();
  } else {
    ctx.arc(500,500,type==="clock"?89:94,0,Math.PI*2);
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
  img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(sceneSvg(index));
  if (state.cache.size > MAX_CACHED_SCENES) {
    const current = Math.floor(state.level);
    for (const old of [...state.cache.keys()]) {
      if (old < current - 4 || old > current + 12) state.cache.delete(old);
    }
  }
  return entry;
}

function render(canvas: HTMLCanvasElement, state: RendererState, width: number, height: number) {
  if (width < 1 || height < 1) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const pixelRatio = Math.min(2, window.devicePixelRatio || 1);
  const cw = Math.max(1, Math.round(width * pixelRatio));
  const ch = Math.max(1, Math.round(height * pixelRatio));
  if (canvas.width !== cw || canvas.height !== ch) {
    canvas.width = cw; canvas.height = ch;
  }
  ctx.setTransform(pixelRatio,0,0,pixelRatio,0,0);
  ctx.clearRect(0,0,width,height);
  ctx.fillStyle = "#111d28";
  ctx.fillRect(0,0,width,height);

  const sceneSize = Math.max(width,height) * 1.13;
  const cx = width/2 + state.x;
  const cy = height/2 + state.y;
  const outerIndex = Math.max(0, Math.floor(state.level)-1);
  const deepestIndex = Math.max(outerIndex+2,Math.ceil(state.level)+5);
  ctx.save();
  for(let i=outerIndex;i<=deepestIndex;i++){
    const dimension = sceneSize*Math.pow(DEPTH_RATIO,state.level-i);
    if (dimension > 1e8) continue;
    if (dimension < 0.4) break;
    const art = acquire(state,i);
    const scale=dimension/1000;
    // The clip from the previous world remains active when a new transform is set.
    ctx.setTransform(pixelRatio*scale,0,0,pixelRatio*scale,
      pixelRatio*(cx - 500*scale),pixelRatio*(cy - 500*scale));
    if(art.ready){
      ctx.drawImage(art.img,0,0,1000,1000);
    }else{
      ctx.fillStyle = i%2===0?"#233445":"#34495b";
      ctx.fillRect(0,0,1000,1000);
    }
    opening(ctx,apertureFor(i));
    ctx.clip();
  }
  ctx.restore();
  ctx.setTransform(pixelRatio,0,0,pixelRatio,0,0);
  const fade=ctx.createRadialGradient(width/2,height/2,Math.min(width,height)*.1,width/2,height/2,Math.max(width,height)*.86);
  fade.addColorStop(0,"rgba(5,9,15,0)");
  fade.addColorStop(1,"rgba(5,9,15,.34)");
  ctx.fillStyle=fade;ctx.fillRect(0,0,width,height);
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
    const next=Math.max(-.45,Math.min(100000,s.target+amount));
    const change=next-s.target;
    if(focus && stageRef.current){
      const r=stageRef.current.getBoundingClientRect();
      const dx=focus.x-r.left-r.width/2,dy=focus.y-r.top-r.height/2;
      const factor=Math.pow(DEPTH_RATIO,change);
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
        const levelIndex=Math.max(0,Math.floor(s.level+.18));
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
        step(Math.log(newDistance/s.lastPinch)/Math.log(DEPTH_RATIO),
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
  const description=scene<CAPTIONS.length?CAPTIONS[scene]:CAPTIONS[8];

  return (
    <section className={expanded?"iw iw-expanded":"iw"} aria-label="Infinite Worlds interactieve zoomwereld">
      <div className="iw-header">
        <div className="iw-identity"><span className="iw-lit"/><span>ROGER / INFINITE WORLDS</span><span className="iw-light-text">EXPERIMENT 002</span></div>
        <button className="iw-expand" type="button" onClick={()=>setExpanded(v=>!v)}>
          {expanded?<X size={16}/>:<Maximize2 size={16}/>}
          <span>{expanded?"SLUIT":"OPEN FULLSCREEN"}</span>
        </button>
      </div>
      <div className="iw-stage" ref={stageRef}>
        <canvas
          className="iw-canvas" ref={canvasRef}
          aria-label="Verken een reeks geïllustreerde werelden via sleutelgaten, portalen en verborgen doorgangen"
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
        <div className="iw-corner iw-corner-left">
          <span className="iw-orbit">✳</span>
          <span>AN ENDLESS LITTLE ADVENTURE</span>
        </div>
        <div className="iw-corner iw-corner-right">WERELD {number} <span>/ ∞</span></div>

        {!expanded&&(
          <div className="iw-invite">
            <span className="iw-eyebrow">EEN DEUR. GEEN EINDE.</span>
            <h3>One world<br/>inside <em>another.</em></h3>
            <p>Van een geheim sleutelgat naar een wereld die nooit ophoudt. Vol onverwachte plekken, vreemde wezens en kleine grapjes.</p>
            <button type="button" onClick={()=>setExpanded(true)}>
              BEGIN MET ONTDEKKEN <ArrowUpRight size={16}/>
            </button>
          </div>
        )}
        {expanded&&(
          <div className="iw-world-info" aria-live="polite">
            <small>JE BENT IN WERELD {number}</small>
            <h3>{sceneTitle(scene)}</h3>
            <p>{description}</p>
          </div>
        )}
        {expanded&&<div className="iw-instructions">SCROLL OM IN TE ZOOMEN <span>·</span> SLEEP OM ROND TE KIJKEN <span>·</span> PINCH OP MOBIEL</div>}
        <div className="iw-controls" aria-label="Zoombediening">
          <button type="button" title="Inzoomen" aria-label="Inzoomen" onClick={()=>step(.3)}><Plus size={18}/></button>
          <button type="button" title="Uitzoomen" aria-label="Uitzoomen" onClick={()=>step(-.3)}><Minus size={18}/></button>
          <i aria-hidden="true"/>
          <button type="button" className={auto?"iw-active":""} title={auto?"Automatisch zoomen pauzeren":"Automatisch zoomen"} aria-label={auto?"Automatisch zoomen pauzeren":"Automatisch inzoomen"} onClick={toggleAuto}>{auto?"Ⅱ":"▶"}</button>
          <button type="button" title="Terug naar het sleutelgat" aria-label="Terug naar het sleutelgat" onClick={reset}><RotateCcw size={17}/></button>
        </div>
      </div>
      <div className="iw-footer">
        <div><strong>INFINITE WORLDS</strong><span>Een tekening. Duizend verhalen. Geen laatste deur.</span></div>
        <div className="iw-footer-right"><span className="iw-lit"/> FREE TO EXPLORE</div>
      </div>
    </section>
  );
}
