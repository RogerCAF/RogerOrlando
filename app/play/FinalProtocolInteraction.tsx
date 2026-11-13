"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Fingerprint, LockKeyhole, Network, RadioTower, ShieldCheck, Zap } from "lucide-react";

type Protocol = "archive" | "broadcast";
const tasks = [
  { title: "IDENTITY", value: "UTRECHT030" },
  { title: "ENCRYPTION", value: "AES / ACTIVE" },
  { title: "ACCESS", value: "RESTRICTED" }
];
const nodes = [
  { id: "local", label: "LOCAL NODE", sub: "UTR / 030" },
  { id: "relay", label: "RELAY", sub: "EU / 01" },
  { id: "public", label: "PUBLIC", sub: "WORLDWIDE" }
];
export default function FinalProtocolInteraction({protocol,onComplete,onBack}:{protocol:Protocol;onComplete:()=>void;onBack:()=>void}) {
  const [checked,setChecked] = useState<string[]>([]);
  const [phase,setPhase] = useState<"prepare"|"execute"|"intrusion">("prepare");
  const [progress,setProgress] = useState(0);
  const callback=useRef(onComplete);
  const didComplete=useRef(false);
  useEffect(()=>{callback.current=onComplete},[onComplete]);
  const allReady=checked.length===3;

  useEffect(()=>{
    if(phase!=="execute")return;
    const start=performance.now();
    const duration=protocol==="archive"?4600:5500;
    const timer=window.setInterval(()=>{
      const percent=Math.min(100,Math.floor((performance.now()-start)/duration*100));
      setProgress(percent);
      if(percent>=100){
        window.clearInterval(timer);
        if(protocol==="broadcast") setPhase("intrusion");
        else if(!didComplete.current){ didComplete.current=true; callback.current(); }
      }
    },45);
    return ()=>window.clearInterval(timer);
  },[phase,protocol]);

  useEffect(()=>{
    if(phase!=="intrusion")return;
    const timeout=window.setTimeout(()=>{
      if(!didComplete.current){didComplete.current=true;callback.current();}
    },6500);
    return ()=>window.clearTimeout(timeout);
  },[phase]);

  const toggle=(id:string)=>{
    if(phase!=="prepare")return;
    setChecked(old=>old.includes(id)?old.filter(x=>x!==id):[...old,id]);
  };
  const isArchive=protocol==="archive";
  return <div className={`rg-ritual rg-ritual-${protocol} ${phase==="intrusion"?"rg-ritual-hacked":""}`}>
    <div className="rg-ritual-meta"><span>{phase==="intrusion"?"INTRUSION DETECTED / SIMULATED BREACH":isArchive?"SECURE VAULT / FINAL OPERATION":"GLOBAL NETWORK / FINAL OPERATION"}</span><span>ROGER_OS / 04</span></div>
    <div className="rg-ritual-visual" aria-hidden="true">
      {isArchive?<div className={`rg-ritual-vault ${phase==="execute"?"is-sealing":""}`}>
        <div className="rg-ritual-vault-ring ring-outer"/><div className="rg-ritual-vault-ring ring-inner"/>
        <div className="rg-ritual-vault-center"><LockKeyhole size={48}/></div>
        <span>VAULT 030 / SECURITY LEVEL 03</span>
      </div>:<div className={`rg-ritual-network ${phase==="execute"?"is-transmitting":phase==="intrusion"?"is-compromised":""}`}>
        <div className="rg-ritual-network-path"/>{nodes.map((node,i)=><div key={node.id} className={`rg-ritual-network-node ${checked.includes(node.id)||phase==="execute"?"is-connected":""}`}><span>{i===0?<Network size={25}/>:i===1?<RadioTower size={25}/>:<Zap size={25}/>}</span><small>{node.label}</small></div>)}
        <div className="rg-ritual-network-pulse"/>{phase==="intrusion"&&<div className="rg-ritual-hack-banner"><span>ACCESS REVOKED</span><strong>YOU HAVE BEEN HACKED.</strong><small>SIMULATION / ROGER_OS</small></div>}
      </div>}
    </div>
    <div className="rg-ritual-copy">
      <span>{phase==="prepare"?"OPERATOR CONFIRMATION REQUIRED":phase==="intrusion"?"WARNING / SYSTEM BREACH":"PROTOCOL EXECUTING"}</span>
      <h3>{phase==="intrusion"?"SOMEONE ELSE IS IN CONTROL.":phase==="execute"?(isArchive?"SEALING THE ARCHIVE":"BROADCASTING THE SIGNAL"):(isArchive?"Lock it down.":"Let it out.")}</h3>
      <p>{phase==="intrusion"?"De uitzending is onderschept. Een fictieve indringer heeft de toegang overgenomen. Dit is onderdeel van het spel.":phase==="execute"?(isArchive?"Encryptiesleutels worden vastgelegd. De toegang tot het archief sluit.":"Het signaal reist van Utrecht naar de publieke nodes. De wereld krijgt toegang."):(isArchive?"Controleer de drie beveiligingsonderdelen voordat je het archief definitief verzegelt.":"Verbind de drie netwerkpunten in volgorde om de gegevens openbaar te maken.")}</p>
    </div>
    {phase==="prepare"?<>
      <div className="rg-ritual-checks" aria-label={isArchive?"Beveiligingscontrole":"Netwerkverbindingen"}>
        {(isArchive?tasks:nodes.map(x=>({title:x.label,value:x.sub}))).map((item,i)=>{
          const id=isArchive?item.title:nodes[i].id;
          const done=checked.includes(id);
          const allowed=isArchive||i===0||checked.includes(nodes[i-1].id);
          return <button type="button" key={id} disabled={!allowed} className={`rg-ritual-check ${done?"is-checked":""}`} onClick={()=>toggle(id)} aria-pressed={done}>
            <span className="rg-ritual-check-icon">{done?<Check size={17}/>:isArchive?<Fingerprint size={17}/>:<RadioTower size={17}/>}</span>
            <span><strong>{item.title}</strong><small>{item.value}</small></span>
            <span className="rg-ritual-check-status">{done?"READY":allowed?"VERIFY":"LOCKED"}</span>
          </button>;
        })}
      </div>
      <div className="rg-ritual-actions">
        <button type="button" className="rg-ritual-back" onClick={onBack}><ArrowLeft size={16}/> WIJZIG KEUZE</button>
        <button type="button" className="rg-ritual-confirm" disabled={!allReady} onClick={()=>{if(allReady)setPhase("execute")}}>{isArchive?<ShieldCheck size={18}/>:<RadioTower size={18}/>} {isArchive?"SEAL THE ARCHIVE":"SEND THE SIGNAL"} <ArrowRight size={16}/></button>
      </div>
    </>:<div className="rg-ritual-execution" role="status" aria-live="polite">
      <div className="rg-ritual-execution-top"><span>{phase==="intrusion"?"UNKNOWN REMOTE SESSION DETECTED":isArchive?"ENCRYPTING / SEALING":"UPLOADING / TRANSMITTING"}</span><strong>{phase==="intrusion"?"BREACH":progress+"%"}</strong></div>
      <div className="rg-ritual-execution-bar"><span style={{width:progress+"%"}}/></div>
      <div className="rg-ritual-execution-log"><span>{phase==="intrusion"?"[ALERT] Simulated intrusion: operator privileges revoked.":progress<35?(isArchive?"[VAULT] Generating secure keys...":"[NODE 030] Establishing uplink..."):progress<70?(isArchive?"[VAULT] Locking access permissions...":"[RELAY] Connecting public network..."):(isArchive?"[VAULT] Final seal in progress...":"[PUBLIC] Releasing the signal...")}</span><span>{phase==="intrusion"?"CONNECTION LOST":"DO NOT INTERRUPT"}</span></div>
    </div>}
  </div>;
}
