"use client";
import { useEffect, useState } from "react";
import { X, RefreshCw, TrendingUp, TrendingDown } from "lucide-react";
type Coin={symbol:string;price:number;change:number};
export default function BureauCrypto({onClose}:{onClose:()=>void}){
 const [coins,setCoins]=useState<Coin[]>([]);
 const [error,setError]=useState("");
 const [loading,setLoading]=useState(true);
 const [updated,setUpdated]=useState<Date|null>(null);
 useEffect(()=>{
  let alive=true;
  const load=async()=>{
   try{
    const response=await fetch("/api/crypto/top",{cache:"no-store"});
    if(!response.ok)throw new Error("Market feed unavailable");
    const data:unknown=await response.json();
    if(!Array.isArray(data))throw new Error("Invalid market data");
    if(alive){setCoins(data as Coin[]);setError("");setUpdated(new Date());}
   }catch{if(alive)setError("Live koersen zijn tijdelijk niet beschikbaar. Probeer het opnieuw.");}
   finally{if(alive)setLoading(false);}
  };
  const key=(e:KeyboardEvent)=>{if(e.key==="Escape")onClose();};
  document.addEventListener("keydown",key);
  const previous=document.body.style.overflow;document.body.style.overflow="hidden";
  void load();
  const timer=window.setInterval(()=>void load(),90000);
  return()=>{alive=false;window.clearInterval(timer);document.removeEventListener("keydown",key);document.body.style.overflow=previous;};
 },[onClose]);
 return <div role="presentation" onMouseDown={e=>{if(e.target===e.currentTarget)onClose();}} style={{position:"fixed",inset:0,zIndex:100001,background:"#020507dc",display:"grid",placeItems:"center",padding:16}}>
 <section role="dialog" aria-modal="true" aria-label="Live crypto top ten" style={{width:"min(520px,96vw)",maxHeight:"85vh",overflowY:"auto",borderRadius:16,border:"1px solid #53605b",background:"linear-gradient(135deg,#172324,#080e13)",color:"#f0f4f1",fontFamily:"system-ui,sans-serif",padding:23,boxShadow:"0 30px 90px #000"}}>
 <header style={{display:"flex",alignItems:"start",gap:15,justifyContent:"space-between"}}><div><div style={{fontSize:11,color:"#83c9a4",letterSpacing:2}}>LIVE MARKET FEED</div><h2 style={{fontSize:25,margin:"6px 0 4px"}}>Crypto Top 10</h2><p style={{fontSize:12,color:"#a7b9b1",margin:0}}>Op basis van marktkapitalisatie · USD · 24 uur</p></div><button onClick={onClose} aria-label="Close crypto market" style={{background:"#243232",color:"#fff",border:0,borderRadius:8,padding:8,cursor:"pointer"}}><X size={19}/></button></header>
 <div style={{display:"grid",gridTemplateColumns:"32px 1fr 110px 95px",gap:8,marginTop:24,padding:"10px 3px",borderBottom:"1px solid #354640",fontSize:10,color:"#90a69a"}}><span>#</span><span>COIN</span><span style={{textAlign:"right"}}>PRICE USD</span><span style={{textAlign:"right"}}>24H</span></div>
 {coins.map((coin,i)=><div key={coin.symbol+i} style={{display:"grid",gridTemplateColumns:"32px 1fr 110px 95px",gap:8,padding:"13px 3px",borderBottom:"1px solid #26342e",alignItems:"center",fontSize:13}}><span style={{color:"#849a90"}}>{String(i+1).padStart(2,"0")}</span><strong>{coin.symbol}</strong><span style={{textAlign:"right",fontVariantNumeric:"tabular-nums"}}>{coin.price.toLocaleString("en-US",{maximumFractionDigits:coin.price<1?6:2})}</span><span style={{textAlign:"right",color:coin.change>=0?"#6add9f":"#f28d8d",fontVariantNumeric:"tabular-nums"}}>{coin.change>=0?"+":""}{coin.change.toFixed(2)}%</span></div>)}
 {loading&&<p style={{color:"#9bb2a6"}}>Live koersen ophalen…</p>}
 {error&&<p role="status" style={{color:"#f3ac9a"}}>{error}</p>}
 <footer style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:18,fontSize:11,color:"#90a99b"}}><span>{updated?"Bijgewerkt "+updated.toLocaleTimeString("nl-NL"):"Wachten op marktgegevens"}</span><span style={{display:"flex",alignItems:"center",gap:5}}><RefreshCw size={12}/> elke 90 sec</span></footer>
 </section></div>;
}
