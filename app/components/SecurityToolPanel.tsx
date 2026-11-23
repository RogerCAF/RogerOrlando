"use client";
import {useState} from "react";
import {ExternalLink, Search, TerminalSquare, ShieldCheck} from "lucide-react";
export type SecurityTool = "Sherlock OSINT" | "Nmap" | "Wireshark" | "Hashcat" | "Burp Suite";
const configs:Record<SecurityTool,{summary:string,website:string,command:string,notes:string[]}> = {
 "Sherlock OSINT":{summary:"Open-source OSINT: zoek naar publiek zichtbare profielen op verschillende platforms.",website:"https://github.com/sherlock-project/sherlock",command:"sherlock example_username",notes:["Publieke bronnen, geen privéaccounts","Controleer gevonden profielen handmatig","Dit browsertabblad kan niet zelfstandig de Python CLI uitvoeren"]},
 Nmap:{summary:"Netwerkscanner voor host- en servicedetectie binnen een netwerk waarvoor je toestemming hebt.",website:"https://nmap.org/",command:"nmap -sV 192.0.2.10",notes:["Documentatie en voorbeeldcommando","192.0.2.10 is een gereserveerd voorbeeldadres","Een browser kan geen ruwe TCP/UDP-poortscan uitvoeren"]},
 Wireshark:{summary:"Packet analyzer voor het inspecteren en begrijpen van netwerkverkeer.",website:"https://www.wireshark.org/",command:"tcp.port == 443",notes:["Bekende Wireshark display-filter","Inspectie van eigen netwerkverkeer","Live packet capture vereist de desktopapp en OS-toegang"]},
 Hashcat:{summary:"Password recovery en auditing op basis van hashes. De lokale PIN-audit in Scripts werkt echt.",website:"https://hashcat.net/hashcat/",command:"hashcat --help",notes:["Lokale SHA-256 PIN-audit: Scripts / bruteforce_lab.py","Geen echte accounts of diensten worden aangevallen","Voor GPU cracking is de native desktopapp nodig"]},
 "Burp Suite":{summary:"Bekende web-security-tool om HTTP-verkeer van eigen applicaties te analyseren.",website:"https://portswigger.net/burp",command:"Proxy → Intercept → HTTP history",notes:["Interceptie van eigen testapplicaties","De volledige proxy draait niet binnen deze website","Gebruik de officiële desktopversie voor echte interceptie"]}
};
export default function SecurityToolPanel({tool,onClose}:{tool:SecurityTool;onClose:()=>void}){
 const [username,setUsername]=useState("");
 const [query,setQuery]=useState("");
 const data=configs[tool];
 const btn:React.CSSProperties={background:"#14291e",border:"1px solid #476c55",color:"#a5e9b9",padding:"9px 13px",borderRadius:7,cursor:"pointer",font:"inherit",fontSize:12};
 const sites=[["GitHub","https://github.com/"],["Reddit","https://www.reddit.com/user/"],["GitLab","https://gitlab.com/"],["Pinterest","https://www.pinterest.com/"],["Keybase","https://keybase.io/"]];
 return <div style={{position:"absolute",zIndex:6,inset:16,overflowY:"auto",background:"#0b1315",border:"1px solid #416052",borderRadius:10,padding:"20px",color:"#d7ece1",fontFamily:"system-ui,sans-serif"}}>
 <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:12}}><div style={{fontSize:11,color:"#88d7a4",letterSpacing:2}}>SECURITY WORKSTATION / REAL TOOLS</div><button onClick={onClose} style={btn}>Close ×</button></div>
 <h2 style={{fontSize:23,margin:"15px 0 6px"}}>{tool}</h2><p style={{fontSize:13,color:"#bbcdc2",lineHeight:1.7,maxWidth:650}}>{data.summary}</p>
 <div style={{background:"#050b0c",padding:16,border:"1px solid #253e33",borderRadius:8,margin:"18px 0",fontFamily:"ui-monospace,monospace",fontSize:12,color:"#8ff1ab",overflowWrap:"anywhere"}}>$ {data.command}</div>
 {tool==="Sherlock OSINT"&&<div style={{background:"#131d1e",padding:17,borderRadius:8,marginBottom:18}}>
 <div style={{display:"flex",gap:10,alignItems:"center",fontSize:13,marginBottom:12}}><Search size={17}/> Username OSINT · public profile shortcuts</div>
 <div style={{display:"flex",gap:9,flexWrap:"wrap"}}><input value={username} onChange={e=>setUsername(e.target.value.replace(/[^a-zA-Z0-9_.-]/g,"").slice(0,40))} placeholder="Public username" aria-label="Public username" style={{background:"#050c0e",border:"1px solid #456154",color:"#fff",padding:"10px",borderRadius:6,minWidth:180}}/><button style={btn} onClick={()=>setQuery(username)} disabled={!username}>Generate profile links</button></div>
 {query&&<div style={{display:"flex",gap:10,flexWrap:"wrap",marginTop:14}}>{sites.map(([name,base])=><a key={name} target="_blank" rel="noopener noreferrer" href={base+encodeURIComponent(query)} style={{...btn,textDecoration:"none",display:"inline-flex",gap:5,alignItems:"center"}}>{name}<ExternalLink size={12}/></a>)}</div>}
 <p style={{fontSize:11,color:"#8ea89a",marginBottom:0}}>Links openen openbare profielpagina's; het bestaan van een profiel wordt hier niet geverifieerd. Geen externe scan of scraping.</p>
 </div>}
 <div style={{display:"grid",gap:9,fontSize:12,color:"#aabcb2"}}>{data.notes.map(n=><div key={n} style={{display:"flex",gap:9,alignItems:"flex-start"}}><ShieldCheck size={15} color="#6fbd8b"/>{n}</div>)}</div>
 <a href={data.website} target="_blank" rel="noopener noreferrer" style={{...btn,display:"inline-flex",textDecoration:"none",gap:8,alignItems:"center",marginTop:19}}>Official project / documentation <ExternalLink size={14}/></a>
 </div>;
}
