"use client";
import { useEffect, useState } from "react";
import { Folder, FileCode2, Trash2, X, ShieldAlert, Lock, Monitor, ChevronLeft } from "lucide-react";

type FolderName = "Classified" | "Scripts" | "Notes" | "Recycle Bin";
const files: Record<FolderName, { name: string; text: string }[]> = {
  Classified: [
    {name:"nasa_access.txt",text:"TOP SECRET\n\nNASA password: ********\nHint: it's probably not 'password123'.\n\nACCESS DENIED. Nice try."},
    {name:"world_domination.plan",text:"PHASE 1: Buy coffee.\nPHASE 2: Fix the Wi-Fi.\nPHASE 3: Apparently that's enough for today."}
  ],
  Scripts: [
    {name:"hack_nasa.py",text:"$ python hack_nasa.py\n[+] Connecting to NASA...\n[+] Bypassing firewall...\n[!] ERROR: NASA uses Windows 95\n[!] Mission aborted successfully."},
    {name:"free_wifi.sh",text:"$ ./free_wifi.sh\nScanning networks...\nFound: FBI_SURVEILLANCE_VAN\nPassword guess: 12345678\nACCESS DENIED. Buy your own internet."},
    {name:"sudo_coffee.sh",text:"$ sudo make-me-a-sandwich\n[sudo] password: ********\nPermission denied: go make it yourself."}
  ],
  Notes: [{name:"readme.txt",text:"WELCOME TO MY DESKTOP\n\nYou found the personal computer.\nThe games have their own entrances around the desk.\nTry the physical keyboard for Hacker Mode."}],
  "Recycle Bin":[{name:"motivation.exe",text:"This file was deleted on a Monday."},{name:"final_final_v9.zip",text:"Definitely not the final version."}]
};
export default function BureauDesktop({onClose}:{onClose:()=>void}) {
 const [folder,setFolder]=useState<FolderName|null>(null);
 const [file,setFile]=useState<{name:string;text:string}|null>(null);
 useEffect(()=>{const handler=(e:KeyboardEvent)=>{if(e.key==="Escape"){if(file)setFile(null);else if(folder)setFolder(null);else onClose();}};document.addEventListener("keydown",handler);const old=document.body.style.overflow;document.body.style.overflow="hidden";return()=>{document.removeEventListener("keydown",handler);document.body.style.overflow=old;};},[folder,file,onClose]);
 const btn:React.CSSProperties={display:"flex",alignItems:"center",gap:12,color:"#e7e4e0",background:"transparent",border:"0",cursor:"pointer",padding:"12px",borderRadius:10,textAlign:"left",font:"inherit"};
 return <div role="presentation" onMouseDown={e=>{if(e.target===e.currentTarget)onClose();}} style={{position:"fixed",inset:0,zIndex:100000,background:"rgba(3,5,9,.86)",display:"grid",placeItems:"center",padding:18}}>
 <section role="dialog" aria-modal="true" aria-label="Personal desktop" style={{width:"min(1100px,96vw)",height:"min(690px,88vh)",minHeight:420,position:"relative",overflow:"hidden",border:"1px solid #625446",borderRadius:16,boxShadow:"0 35px 100px #000",background:"radial-gradient(ellipse at 70% 28%,#29333c 0%,#161d28 40%,#080c12 85%)",color:"#e7e4e0",fontFamily:"system-ui,sans-serif"}}>
 <div style={{position:"absolute",top:22,right:22,zIndex:4}}><button type="button" aria-label="Close desktop" onClick={onClose} style={{...btn,background:"#20262c",padding:10}}><X size={20}/></button></div>
 <div style={{position:"absolute",inset:0,pointerEvents:"none",display:"grid",placeItems:"center",opacity:.09,fontSize:"clamp(100px,24vw,320px)",fontWeight:800,letterSpacing:-20}}>R</div>
 <div style={{padding:"35px 28px",display:"grid",gridTemplateColumns:"repeat(2,105px)",gap:24,alignContent:"start",position:"relative"}}>
 {(Object.keys(files) as FolderName[]).map(name=><button key={name} onClick={()=>{setFolder(name);setFile(null);}} style={{...btn,flexDirection:"column",gap:9,fontSize:12,textAlign:"center",minHeight:93}}><Folder size={40} strokeWidth={1.4} color="#d6ad71"/>{name}</button>)}
 </div>
 <div style={{position:"absolute",bottom:0,left:0,right:0,height:46,background:"rgba(5,9,14,.85)",borderTop:"1px solid #45474a",display:"flex",alignItems:"center",gap:12,padding:"0 19px",fontSize:12,color:"#c1b9af"}}><Monitor size={17}/> ROGER OS <span style={{marginLeft:"auto"}}>PERSONAL DESKTOP · PRIVATE SYSTEM</span></div>
 {folder && <div style={{position:"absolute",zIndex:2,top:"15%",left:"min(14%,100px)",width:"min(680px,80%)",height:"min(430px,65%)",background:"#121820",border:"1px solid #4b514f",borderRadius:12,boxShadow:"0 24px 70px #000b",overflow:"hidden"}}>
 <div style={{padding:"12px 16px",background:"#1c252e",display:"flex",alignItems:"center",gap:10,fontSize:14}}><Folder size={17} color="#d6ad71"/>{folder}<button onClick={()=>{setFolder(null);setFile(null);}} aria-label="Close folder" style={{...btn,marginLeft:"auto",padding:2}}><X size={17}/></button></div>
 <div style={{padding:14,display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(145px,1fr))",gap:6}}>{files[folder].map(entry=><button key={entry.name} onClick={()=>setFile(entry)} style={{...btn,fontSize:12,flexDirection:"column",alignItems:"flex-start",overflowWrap:"anywhere"}}><FileCode2 size={24} color="#aeccbf"/>{entry.name}</button>)}</div>
 </div>}
 {file && <div style={{position:"absolute",zIndex:3,top:"24%",left:"min(23%,180px)",width:"min(600px,72%)",minHeight:250,maxHeight:"52%",overflow:"auto",background:"#0b1016",border:"1px solid #64716c",borderRadius:10,boxShadow:"0 25px 80px #000"}}>
 <div style={{display:"flex",alignItems:"center",gap:9,padding:"11px 14px",background:"#202a30",fontSize:13}}><FileCode2 size={16}/>{file.name}<button onClick={()=>setFile(null)} style={{...btn,marginLeft:"auto",padding:0}} aria-label="Close file"><X size={17}/></button></div>
 <pre style={{whiteSpace:"pre-wrap",fontFamily:"ui-monospace,monospace",fontSize:13,color:"#97d9ae",lineHeight:1.75,padding:20,margin:0}}>{file.text}</pre>
 </div>}
 </section></div>;
}
