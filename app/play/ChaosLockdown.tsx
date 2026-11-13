"use client";

import { useEffect, useRef, useState } from "react";
import { AlertTriangle, LockKeyhole, RotateCcw, ShieldAlert, Zap } from "lucide-react";

const DURATION_MS = 20000;
const options = [
  {name:"CANCEL", x:18,y:28},
  {name:"RESTART",x:76,y:26},
  {name:"ESCAPE",x:49,y:50},
  {name:"UNDO",x:24,y:75},
  {name:"RESTORE",x:78,y:74}
];

export default function ChaosLockdown({onComplete}:{onComplete:()=>void}) {
  const [seconds,setSeconds] = useState(20);
  const [pointer,setPointer] = useState({x:-1000,y:-1000});
  const [taps,setTaps] = useState(0);
  const surface = useRef<HTMLDivElement>(null);
  const done = useRef(onComplete);
  const fired = useRef(false);
  useEffect(()=>{ done.current=onComplete; },[onComplete]);
  useEffect(()=>{
    const expiry=performance.now()+DURATION_MS;
    const update=()=>{
      const left=Math.max(0,expiry-performance.now());
      setSeconds(Math.ceil(left/1000));
      if(left===0&&!fired.current){fired.current=true;done.current();}
    };
    const timer=window.setInterval(update,70);
    update();
    surface.current?.focus({preventScroll:true});
    const preventKeys=(e:KeyboardEvent)=>{if(["Tab","Enter"," ","Escape"].includes(e.key)){e.preventDefault();e.stopPropagation();}};
    document.addEventListener("keydown",preventKeys,true);
    const oldOverflow=document.body.style.overflow;
    document.body.style.overflow="hidden";
    return ()=>{clearInterval(timer);document.removeEventListener("keydown",preventKeys,true);document.body.style.overflow=oldOverflow;};
  },[]);
  const evade=(x:number,y:number)=>{
    const dx=x-pointer.x,dy=y-pointer.y;
    const distance=Math.hypot(dx,dy);
    if(distance>=23)return {transform:"translate(0px,0px)"};
    const direction=distance>0.01?{x:dx/distance,y:dy/distance}:{x:1,y:0};
    const amount=Math.min(105,(23-distance)*6);
    return {transform:`translate(${direction.x*amount}px,${direction.y*amount}px)`};
  };
  const move=(clientX:number,clientY:number)=>{
    const rect=surface.current?.getBoundingClientRect();
    if(!rect)return;
    setPointer({x:(clientX-rect.left)/rect.width*100,y:(clientY-rect.top)/rect.height*100});
  };
  return <div className="rg-chaos-lockdown" ref={surface} tabIndex={-1} role="dialog" aria-modal="true" aria-label="Chaos systeemblokkade van twintig seconden"
    onPointerMove={e=>move(e.clientX,e.clientY)} onPointerDown={e=>{e.preventDefault();setTaps(x=>x+1);}}
    onClick={e=>e.preventDefault()}>
    <div className="rg-chaos-scan" aria-hidden="true"/>
    <div className="rg-chaos-top"><span><ShieldAlert size={16}/> ROGER_OS / SYSTEM COMPROMISED</span><span>ERROR 030</span></div>
    <div className="rg-chaos-center">
      <div className="rg-chaos-warning"><AlertTriangle size={42}/></div>
      <p>YOU PRESSED THE RED BUTTON.</p>
      <h2>NO CONTROL<span>.</span></h2>
      <div className="rg-chaos-count" aria-live="off">{String(seconds).padStart(2,"0")}<small> SEC</small></div>
      <p className="rg-chaos-caption">Systeem geblokkeerd. Probeer maar op een knop te drukken.</p>
      <div className="rg-chaos-rail"><span style={{width:`${(20-seconds)/20*100}%`}}/></div>
      <span className="rg-chaos-sub">{taps ? "NOPE. THAT BUTTON DOESN'T WORK." : "TEMPORARY LOCKDOWN / 20 SECONDS"}</span>
    </div>
    <div className="rg-chaos-evaders" aria-hidden="true">
      {options.map((item,i)=>{
        const style=evade(item.x,item.y);
        return <div className="rg-chaos-evader" key={item.name} style={{left:`${item.x}%`,top:`${item.y}%`,transform:style.transform,transition:"transform 120ms ease-out"}}>
          {i===0?<LockKeyhole size={13}/>:i===1?<RotateCcw size={13}/>:<Zap size={13}/>} {item.name}
        </div>;
      })}
    </div>
    <div className="rg-chaos-bottom">DON'T PANIC. THIS IS PART OF THE GAME.</div>
  </div>;
}
