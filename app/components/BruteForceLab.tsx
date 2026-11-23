"use client";
import {useEffect,useRef,useState} from "react";
import {Play,Pause,RotateCcw,ShieldCheck} from "lucide-react";

type AuditState="idle"|"running"|"paused"|"found"|"exhausted";
type Charset="digits"|"letters"|"alphanumeric"|"dictionary";
const alphabets:Record<Exclude<Charset,"dictionary">,string>={
 digits:"0123456789",letters:"abcdefghijklmnopqrstuvwxyz",alphanumeric:"abcdefghijklmnopqrstuvwxyz0123456789"
};
const dictionary=["admin","password","welcome","letmein","secret","hello","monkey","dragon","qwerty","computer","hacker","test","roger","nasa","world","sunshine","love","coffee","1234","12345","123456"];
const encoder=new TextEncoder();
async function digest(value:string){const bytes=new Uint8Array(await crypto.subtle.digest("SHA-256",encoder.encode(value)));return Array.from(bytes,n=>n.toString(16).padStart(2,"0")).join("");}
function combination(index:bigint,alphabet:string,length:number){let result="";const base=BigInt(alphabet.length);for(let pos=0;pos<length;pos++){result=alphabet[Number(index%base)]+result;index/=base;}return result;}
const dictionaryCandidates=[...new Set(dictionary.flatMap(word=>[word,word[0].toUpperCase()+word.slice(1),word+"123",word+"2026",word+"2026!",word+"123!",word+"!",word+"@123",word.toUpperCase()]))];
export default function BruteForceLab(){
 const [secret,setSecret]=useState("cat");
 const [mode,setMode]=useState<Charset>("letters");
 const [status,setStatus]=useState<AuditState>("idle");
 const [count,setCount]=useState(0n);
 const [space,setSpace]=useState(BigInt(26**3));
 const [guess,setGuess]=useState("—");
 const [seconds,setSeconds]=useState(0);
 const [hash,setHash]=useState("");
 const [events,setEvents]=useState<string[]>(["[READY] Local SHA-256 auditing sandbox","[SAFE] Only test strings entered on this page"]);
 const cursor=useRef(0n),runId=useRef(0),running=useRef(false),target=useRef(""),startTime=useRef(0),previous=useRef(0);
 const config=useRef({mode: "letters" as Charset, length:3, alphabet:alphabets.letters, total:BigInt(26**3)});
 useEffect(()=>()=>{running.current=false;runId.current++;},[]);
 const feasible=mode==="dictionary"?secret.length>0:mode==="digits"?/^\d{1,24}$/.test(secret):mode==="letters"?/^[a-z]{1,24}$/.test(secret):/^[a-z0-9]{1,24}$/.test(secret);
 const maximum=24;
 const numberOfCandidates=mode==="dictionary"?BigInt(dictionaryCandidates.length):feasible?BigInt(alphabets[mode].length)**BigInt(secret.length):0n;
 function reset(){
  runId.current++;running.current=false;cursor.current=0n;previous.current=0;
  setStatus("idle");setCount(0n);setSeconds(0);setGuess("—");setHash("");
  setEvents(["[READY] Local SHA-256 auditing sandbox","[SAFE] No remote logins, networks or servers"]);
 }
 const setInput=(value:string)=>{setSecret(value.slice(0,32));reset();};
 const setStrategy=(value:Charset)=>{setMode(value);reset();};
 const candidate=(n:bigint)=>{
  const cfg=config.current;
  return cfg.mode==="dictionary"?dictionaryCandidates[Number(n)]??"":combination(n,cfg.alphabet,cfg.length);
 };
 async function run(resume=false){
  if(!resume&&!feasible)return;
  const id=++runId.current;
  running.current=true;
  if(!resume){
   cursor.current=0n;previous.current=0;setCount(0n);setGuess("—");setSeconds(0);
   const newHash=await digest(secret);
   if(id!==runId.current)return;
   target.current=newHash;setHash(newHash);
   const alphabet=mode==="dictionary"?"":alphabets[mode];
   const total=mode==="dictionary"?BigInt(dictionaryCandidates.length):BigInt(alphabet.length)**BigInt(secret.length);
   config.current={mode,length:secret.length,alphabet,total};
   setSpace(total);
   setEvents(["[INIT] SHA-256 target hash generated locally","[MODE] "+mode.toUpperCase(),"[KEYSPACE] "+total.toLocaleString("en-US")+" candidates","[RUN] Hashing each candidate individually"]);
  }else setEvents(old=>[...old.slice(-5),"[RESUME] Continuing from attempt "+cursor.current]);
  startTime.current=performance.now();setStatus("running");
  const batch=async()=>{
   if(id!==runId.current||!running.current)return;
   const total=config.current.total;
   const end=cursor.current+30n<total?cursor.current+30n:total;
   for(;cursor.current<end;cursor.current++){
    const trial=candidate(cursor.current);
    const value=await digest(trial);
    if(id!==runId.current||!running.current)return;
    if(value===target.current){
     cursor.current++;
     setCount(cursor.current);setGuess(trial);
     setSeconds(previous.current+(performance.now()-startTime.current)/1000);
     running.current=false;setStatus("found");
     setEvents(old=>[...old.slice(-6),"[MATCH] SHA-256 digest verified","[SUCCESS] Test password recovered: "+trial]);
     return;
    }
   }
   setCount(cursor.current);setGuess(candidate(cursor.current>0n?cursor.current-1n:0n));
   setSeconds(previous.current+(performance.now()-startTime.current)/1000);
   if(cursor.current>=total){
    running.current=false;setStatus("exhausted");
    setEvents(old=>[...old.slice(-6),"[EXHAUSTED] No match in selected search space"]);return;
   }
   window.setTimeout(()=>void batch(),12);
  };
  void batch();
 }
 function pause(){previous.current+=(performance.now()-startTime.current)/1000;running.current=false;runId.current++;setStatus("paused");setEvents(old=>[...old.slice(-6),"[PAUSE] Candidate number "+cursor.current]);}
 const percentage=space>0n?Number(count*10000n/space)/100:0;
 const button:React.CSSProperties={cursor:"pointer",border:"1px solid #355044",borderRadius:7,padding:"9px 14px",font:"inherit",fontSize:12,display:"inline-flex",alignItems:"center",gap:8,color:"#b6f9ca",background:"#11251d"};
 const field:React.CSSProperties={background:"#09120f",border:"1px solid #43604c",padding:"10px",borderRadius:6,color:"#f0fff3",font:"inherit",fontSize:13,maxWidth:"100%"};
 return <div style={{fontFamily:"ui-monospace,SFMono-Regular,Consolas,monospace",color:"#c8e6d0"}}>
  <div style={{fontSize:11,letterSpacing:2,color:"#70cf9c",marginBottom:12}}>PASSWORD AUDIT / OFFLINE SHA-256 LAB</div>
  <p style={{fontFamily:"system-ui,sans-serif",fontSize:13,color:"#b5c5be",lineHeight:1.65}}>Probeer nu ook <b>woorden, langere zinnen en lettercombinaties</b>. Het programma genereert echt SHA-256-hashes voor elke kandidaat en vergelijkt die met jouw testwachtwoord. Alles draait uitsluitend lokaal in je browser.</p>
  <div style={{display:"flex",gap:12,flexWrap:"wrap",margin:"15px 0",alignItems:"end"}}>
   <label style={{display:"grid",gap:7,fontSize:12}}>Zoekmethode
    <select value={mode} disabled={status==="running"||status==="paused"} onChange={e=>setStrategy(e.target.value as Charset)} style={field}>
     <option value="letters">Letters a–z</option>
     <option value="alphanumeric">Letters + cijfers</option>
     <option value="digits">Cijfers 0–9</option>
     <option value="dictionary">Bekende woordenlijst</option>
    </select>
   </label>
   <label style={{display:"grid",gap:7,fontSize:12}}>Testwachtwoord
    <input value={secret} maxLength={32} disabled={status==="running"||status==="paused"} onChange={e=>setInput(e.target.value)} aria-label="Test password" style={{...field,width:200}} autoComplete="off" spellCheck={false}/>
   </label>
  </div>
  <p style={{fontSize:11,color:feasible?"#a7b9ad":"#ffac9c"}}>
   {mode==="dictionary"?"Woordenlijst met "+dictionaryCandidates.length+" varianten (woorden, hoofdletters, cijfers en suffixen):"Maximaal "+maximum+" tekens, alleen "+(mode==="digits"?"cijfers":mode==="letters"?"kleine letters a–z":"kleine letters en cijfers")+". "}
   {mode!=="dictionary"&&feasible?" Zoekruimte: "+numberOfCandidates.toLocaleString("nl-NL")+" combinaties. Een lange brute-force-zoektocht kan praktisch onhaalbaar zijn.":""}
   {mode==="dictionary"&&" Woorden buiten deze lijst kunnen niet gevonden worden."}
  </p>
  <div style={{display:"flex",gap:8,flexWrap:"wrap",margin:"14px 0"}}>
   {status!=="running"&&status!=="paused"&&<button style={button} disabled={!feasible||secret.length===0} onClick={()=>void run()}><Play size={14}/> Start audit</button>}
   {status==="running"&&<button style={button} onClick={pause}><Pause size={14}/> Pauzeren</button>}
   {status==="paused"&&<button style={button} onClick={()=>void run(true)}><Play size={14}/> Hervatten</button>}
   <button style={{...button,background:"#1b2020",color:"#e4e8e4"}} onClick={reset}><RotateCcw size={14}/> Reset</button>
  </div>
  <div style={{background:"#080f0c",border:"1px solid #263a31",borderRadius:9,padding:15}}>
   <div style={{display:"flex",justifyContent:"space-between",gap:12,marginBottom:10,fontSize:11}}><span>STATUS: {status.toUpperCase()}</span><span>{percentage.toFixed(2)}%</span></div>
   <div style={{height:6,background:"#263329",borderRadius:9,overflow:"hidden"}}><div style={{height:"100%",width:percentage+"%",background:"#4bd58a",transition:"width .12s"}}/></div>
   <div style={{display:"grid",gridTemplateColumns:"repeat(2,minmax(0,1fr))",gap:15,marginTop:16,fontSize:12}}>
    <div><div style={{color:"#809c8c"}}>ATTEMPTS</div><strong>{count.toLocaleString("en-US")} / {space.toLocaleString("en-US")}</strong></div>
    <div><div style={{color:"#809c8c"}}>CURRENT GUESS</div><strong style={{overflowWrap:"anywhere"}}>{guess}</strong></div>
    <div><div style={{color:"#809c8c"}}>ELAPSED</div><strong>{seconds.toFixed(2)}s</strong></div>
    <div><div style={{color:"#809c8c"}}>HASH RATE</div><strong>{seconds>0?Math.round(Number(count)/seconds).toLocaleString("en-US"):"0"} H/s</strong></div>
   </div>
   {hash&&<div style={{fontSize:10,color:"#6f9682",marginTop:15,overflowWrap:"anywhere"}}>TARGET SHA-256: {hash}</div>}
   <pre aria-live="polite" style={{margin:"15px 0 0",padding:12,whiteSpace:"pre-wrap",overflowWrap:"anywhere",background:"#050907",color:"#8fdaa9",lineHeight:1.7,fontSize:11,maxHeight:160,overflowY:"auto"}}>{events.join("\n")}</pre>
   {status==="found"&&<p style={{color:"#7ff4a6",fontSize:13}}><ShieldCheck size={16} style={{verticalAlign:"middle"}}/> Testwachtwoord gevonden en met SHA-256 geverifieerd.</p>}
   {status==="exhausted"&&<p style={{color:"#ffc38e",fontSize:12}}>Geen match in deze zoekruimte. Probeer een andere methode.</p>}
  </div>
 </div>;
}
