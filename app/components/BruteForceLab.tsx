"use client";
import { useEffect, useRef, useState } from "react";
import { Play, Pause, RotateCcw, ShieldCheck, X } from "lucide-react";

const enc = new TextEncoder();
const hex = (bytes: ArrayBuffer) => [...new Uint8Array(bytes)].map(v=>v.toString(16).padStart(2,"0")).join("");
async function sha256(text: string) { return hex(await crypto.subtle.digest("SHA-256",enc.encode(text))); }
type State = "idle" | "running" | "paused" | "found" | "exhausted";

export default function BruteForceLab() {
 const [pin,setPin] = useState("0420");
 const [status,setStatus] = useState<State>("idle");
 const [attempts,setAttempts] = useState(0);
 const [elapsed,setElapsed] = useState(0);
 const [candidate,setCandidate] = useState("----");
 const [targetHash,setTargetHash] = useState("");
 const [logs,setLogs] = useState<string[]>(["LOCAL HASH AUDIT · SHA-256","Target: four-digit demo PIN only","No network or login requests"]);
 const cursor=useRef(0);
 const token=useRef(0);
 const started=useRef(0);
 const baseElapsed=useRef(0);
 const target=useRef("");
 const active=useRef(false);

 useEffect(()=>()=>{token.current++;active.current=false;},[]);
 async function start(resume=false) {
  token.current++;
  const run=token.current;
  active.current=true;
  if(!resume) {
   cursor.current=0;
   baseElapsed.current=0;
   setElapsed(0);setAttempts(0);setCandidate("----");
   const digest=await sha256(pin);
   if(token.current!==run)return;
   target.current=digest;
   setTargetHash(digest);
   setLogs(["[INIT] Local SHA-256 hash generated","[TARGET] sha256: "+digest.slice(0,28)+"…","[MODE] Numeric mask ?d?d?d?d","[SPACE] 10,000 unique candidates","[RUN] Comparing SHA-256 digests locally"]);
  } else {
   setLogs(old=>[...old.slice(-5),"[RESUME] Continuing keyspace search"]);
  }
  started.current=performance.now();
  setStatus("running");
  const batch=async()=>{
   if(!active.current||run!==token.current)return;
   const limit=Math.min(cursor.current+12,10000);
   for(;cursor.current<limit;cursor.current++) {
    const guess=String(cursor.current).padStart(4,"0");
    const digest=await sha256(guess);
    if(!active.current||run!==token.current)return;
    setCandidate(guess);
    if(digest===target.current) {
     cursor.current++;
     setAttempts(cursor.current);
     setElapsed(baseElapsed.current+(performance.now()-started.current)/1000);
     active.current=false;
     setStatus("found");
     setLogs(old=>[...old.slice(-6),"[MATCH] sha256("+guess+") equals target","[SUCCESS] Demo PIN recovered: "+guess]);
     return;
    }
   }
   setAttempts(cursor.current);
   setElapsed(baseElapsed.current+(performance.now()-started.current)/1000);
   if(cursor.current>=10000){active.current=false;setStatus("exhausted");setLogs(old=>[...old.slice(-6),"[DONE] Exhausted 10,000 candidates"]);return;}
   window.setTimeout(batch,15);
  };
  void batch();
 }
 function pause(){baseElapsed.current+=(performance.now()-started.current)/1000;active.current=false;token.current++;setStatus("paused");setLogs(old=>[...old.slice(-6),"[PAUSED] Search paused at candidate "+String(cursor.current).padStart(4,"0")]);}
 function reset(){active.current=false;token.current++;cursor.current=0;baseElapsed.current=0;setStatus("idle");setAttempts(0);setElapsed(0);setTargetHash("");setCandidate("----");setLogs(["LOCAL HASH AUDIT · SHA-256","Target: four-digit demo PIN only","No network or login requests"]);}
 const progress=attempts/100;
 const btn:React.CSSProperties={cursor:"pointer",border:"1px solid #355044",borderRadius:7,padding:"9px 14px",font:"inherit",fontSize:12,display:"inline-flex",alignItems:"center",gap:8,color:"#b6f9ca",background:"#11251d"};
 return <div style={{fontFamily:"ui-monospace,SFMono-Regular,Consolas,monospace",color:"#c8e6d0"}}>
 <div style={{fontSize:11,letterSpacing:2,color:"#70cf9c",marginBottom:16}}>PASSWORD AUDIT / LOCAL SANDBOX</div>
 <p style={{fontFamily:"system-ui,sans-serif",fontSize:13,color:"#b5c5be",lineHeight:1.6}}>Een echte brute-force-demonstratie: elke pincode wordt lokaal met SHA-256 gehasht en vergeleken met een testhash. Geen echte accounts, servers of netwerkaanvragen.</p>
 <label style={{display:"block",fontSize:12,margin:"15px 0 7px"}}>Kies een test-PIN (4 cijfers)</label>
 <input aria-label="Demo PIN" inputMode="numeric" maxLength={4} value={pin} disabled={status==="running"||status==="paused"} onChange={e=>{const v=e.target.value.replace(/\D/g,"").slice(0,4);setPin(v);reset();}} style={{background:"#09120f",border:"1px solid #43604c",padding:12,borderRadius:6,color:"#f0fff3",font:"inherit",width:100,letterSpacing:4}}/>
 <div style={{display:"flex",flexWrap:"wrap",gap:8,margin:"14px 0"}}>
 {status!=="running"&&status!=="paused"&&<button style={btn} disabled={pin.length!==4} onClick={()=>void start(false)}><Play size={14}/> Start audit</button>}
 {status==="running"&&<button style={btn} onClick={pause}><Pause size={14}/> Pauzeer</button>}
 {status==="paused"&&<button style={btn} onClick={()=>void start(true)}><Play size={14}/> Hervat</button>}
 <button style={{...btn,background:"#1b2020",color:"#e4e8e4"}} onClick={reset}><RotateCcw size={14}/> Reset</button>
 </div>
 <div style={{background:"#080f0c",border:"1px solid #263a31",borderRadius:9,padding:15}}>
 <div style={{display:"flex",justifyContent:"space-between",gap:12,marginBottom:10,fontSize:11}}><span>STATUS: {status.toUpperCase()}</span><span>{progress.toFixed(2)}%</span></div>
 <div style={{height:6,background:"#263329",borderRadius:9,overflow:"hidden"}}><div style={{height:"100%",width:progress+"%",background:"#4bd58a",transition:"width .15s"}}/></div>
 <div style={{display:"grid",gridTemplateColumns:"repeat(2,minmax(0,1fr))",gap:15,marginTop:16,fontSize:12}}>
 <div><div style={{color:"#809c8c"}}>ATTEMPTS</div><strong>{attempts.toLocaleString("en-US")} / 10,000</strong></div>
 <div><div style={{color:"#809c8c"}}>CURRENT GUESS</div><strong>{candidate}</strong></div>
 <div><div style={{color:"#809c8c"}}>ELAPSED</div><strong>{elapsed.toFixed(2)}s</strong></div>
 <div><div style={{color:"#809c8c"}}>HASH RATE</div><strong>{elapsed>0?Math.round(attempts/elapsed).toLocaleString("en-US"):"0"} H/s</strong></div>
 </div>
 {targetHash&&<div style={{fontSize:10,color:"#6f9682",marginTop:15,overflowWrap:"anywhere"}}>TARGET SHA-256: {targetHash}</div>}
 <pre aria-live="polite" style={{margin:"15px 0 0",padding:12,whiteSpace:"pre-wrap",overflowWrap:"anywhere",background:"#050907",color:"#8fdaa9",lineHeight:1.7,fontSize:11,maxHeight:160,overflowY:"auto"}}>{logs.join("\n")}</pre>
 {status==="found"&&<p style={{color:"#7ff4a6",fontSize:13}}><ShieldCheck size={16} style={{verticalAlign:"middle"}}/> Lokale testhash gekraakt. Geen echt wachtwoord aangeraakt.</p>}
 </div>
 </div>;
}
