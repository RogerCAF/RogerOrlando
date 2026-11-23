"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Activity, CheckCircle2, Cpu, Gauge, HardDrive, Lightbulb, Monitor, RefreshCw, ShieldCheck, Wifi, X } from "lucide-react";
import "./bureau-diagnostics.css";

type Snapshot = {
  online: boolean;
  viewport: string;
  ratio: string;
  threads: string;
  memory: string;
  motion: string;
  input: string;
  latency: number | null;
  measuredAt: string;
};
type Props = { onClose: () => void; rgbEnabled: boolean; onToggleRgb: () => void };
function readSnapshot(latency: number | null = null): Snapshot {
  const nav = navigator as Navigator & { deviceMemory?: number };
  const mouse = matchMedia("(pointer: fine)").matches;
  return {
    online: navigator.onLine,
    viewport: `${window.innerWidth} × ${window.innerHeight}`,
    ratio: `${window.devicePixelRatio.toFixed(1)}×`,
    threads: navigator.hardwareConcurrency ? `${navigator.hardwareConcurrency} logical` : "Not exposed",
    memory: nav.deviceMemory ? `${nav.deviceMemory} GB approx.` : "Not exposed",
    motion: matchMedia("(prefers-reduced-motion: reduce)").matches ? "Reduced" : "Standard",
    input: mouse ? "Precision pointer" : "Touch / coarse",
    latency,
    measuredAt: new Date().toLocaleTimeString("en-GB", {hour12:false}),
  };
}
export default function BureauDiagnostics({onClose, rgbEnabled, onToggleRgb}:Props) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [running, setRunning] = useState(false);
  const runId = useRef(0);
  const runScan = useCallback(async () => {
    const id = ++runId.current;
    setRunning(true);
    let latency: number | null = null;
    try {
      const began = performance.now();
      const response = await fetch("/api/diagnostics/ping", {cache:"no-store", signal:AbortSignal.timeout(5000)});
      if (response.ok) latency = Math.round(performance.now()-began);
    } catch { /* Offline or backend unavailable; show as unavailable rather than fake success. */ }
    if(id!==runId.current)return;
    setSnapshot(readSnapshot(latency));
    setRunning(false);
  },[]);
  useEffect(()=>{
    closeRef.current?.focus();
    const old=document.body.style.overflow;
    document.body.style.overflow="hidden";
    const onEscape=(event:KeyboardEvent)=>{if(event.key==="Escape"){event.preventDefault();onClose()}};
    const onOnline=()=>setSnapshot(previous=>previous?{...previous,online:navigator.onLine}:previous);
    window.addEventListener("keydown",onEscape);
    window.addEventListener("online",onOnline);
    window.addEventListener("offline",onOnline);
    void runScan();
    return ()=>{runId.current++;document.body.style.overflow=old;window.removeEventListener("keydown",onEscape);window.removeEventListener("online",onOnline);window.removeEventListener("offline",onOnline)};
  },[onClose,runScan]);
  return <div className="bureau-diagnostics-overlay" role="presentation" onMouseDown={event=>{if(event.target===event.currentTarget)onClose()}}>
    <section className="bureau-diagnostics" role="dialog" aria-modal="true" aria-labelledby="bureau-diagnostics-heading">
      <header className="bd-titlebar">
        <div className="bd-identity"><Activity size={20}/><span><strong>ROGER.OS</strong><small>/ SYSTEM DIAGNOSTICS</small></span></div>
        <button ref={closeRef} type="button" onClick={onClose} aria-label="Sluit System Diagnostics"><X size={19}/></button>
      </header>
      <div className="bd-body">
        <div className="bd-headline">
          <span className="bd-eyebrow">WORKSTATION / HEALTH CHECK</span>
          <h2 id="bureau-diagnostics-heading">System <em>Diagnostics.</em></h2>
          <p>Less pretending. More checking. Live information reported by your browser — not imaginary temperatures or made-up hardware statistics.</p>
        </div>
        <div className="bd-status-grid" aria-live="polite">
          <div className={"bd-status "+(snapshot?.online?"is-ok":"is-offline")}><span><Wifi size={17}/> NETWORK</span><strong>{snapshot?.online?"CONNECTED":"OFFLINE"}</strong><small>Browser connectivity indicator</small></div>
          <div className={"bd-status "+(snapshot?.latency!==null&&snapshot?.latency!==undefined?"is-ok":"is-neutral")}><span><Gauge size={17}/> API RESPONSE</span><strong>{snapshot?.latency!=null?`${snapshot.latency} ms`:"—"}</strong><small>Measured round trip to this site</small></div>
          <div className="bd-status is-ok"><span><ShieldCheck size={17}/> UI STATUS</span><strong>RUNNING</strong><small>Interactive Bureau client</small></div>
        </div>
        <div className="bd-section-title"><span>01 / BROWSER ENVIRONMENT</span><small>READ-ONLY · REAL VALUES</small></div>
        <div className="bd-metrics">
          <div><Monitor size={18}/><span>Viewport</span><strong>{snapshot?.viewport??"—"}</strong></div>
          <div><Activity size={18}/><span>Pixel ratio</span><strong>{snapshot?.ratio??"—"}</strong></div>
          <div><Cpu size={18}/><span>Logical threads</span><strong>{snapshot?.threads??"—"}</strong></div>
          <div><HardDrive size={18}/><span>Device memory</span><strong>{snapshot?.memory??"—"}</strong></div>
          <div><Monitor size={18}/><span>Preferred motion</span><strong>{snapshot?.motion??"—"}</strong></div>
          <div><Activity size={18}/><span>Primary input</span><strong>{snapshot?.input??"—"}</strong></div>
        </div>
        <div className="bd-section-title"><span>02 / WORKSTATION CONTROLS</span><small>INTERACTIVE</small></div>
        <div className="bd-control"><div><Lightbulb size={18}/><span><strong>Ambient RGB</strong><small>Toggle the desk's existing visual lighting</small></span></div><button type="button" className={rgbEnabled?"is-active":""} onClick={onToggleRgb} aria-pressed={rgbEnabled}>{rgbEnabled?"ENABLED":"DISABLED"}</button></div>
        <footer className="bd-footer">
          <span><CheckCircle2 size={14}/> {running?"RUNNING CHECK…":snapshot?`LAST CHECK ${snapshot.measuredAt}`:"READY TO CHECK"}</span>
          <button type="button" disabled={running} onClick={()=>void runScan()}><RefreshCw size={15} className={running?"bd-spin":""}/> {running?"CHECKING":"RUN DIAGNOSTICS"}</button>
        </footer>
        <p className="bd-disclaimer">Browser information is approximate and may be withheld by privacy settings. This page does not access the real PC's fan speeds, temperatures or storage.</p>
      </div>
    </section>
  </div>;
}
