"use client";
import { useEffect, useRef, useState } from "react";
import { Folder, FileCode2, X, Monitor, ImagePlus, Search, Radar, Network, KeyRound, Shield, Trash2 } from "lucide-react";
import BruteForceLab from "./BruteForceLab";
import SecurityToolPanel, {type SecurityTool} from "./SecurityToolPanel";
type FolderName="Classified"|"Scripts"|"Notes"|"Recycle Bin";
type Entry={name:string;text:string};
const files:Record<FolderName,Entry[]>={
 Classified:[{name:"nasa_access.txt",text:"TOP SECRET\nNASA password: ********\nACCESS DENIED. Nice try."},{name:"world_domination.plan",text:"PHASE 1: Buy coffee.\nPHASE 2: Fix Wi-Fi.\nPHASE 3: World domination postponed."}],
 Scripts:[{name:"bruteforce_lab.py",text:"Interactive SHA-256 hash cracking demo."},{name:"hack_nasa.py",text:"$ python hack_nasa.py\n[+] Connecting to NASA...\n[!] ERROR: NASA uses Windows 95\n[!] Mission aborted successfully."},{name:"free_wifi.sh",text:"$ ./free_wifi.sh\nScanning...\nFound: FBI_SURVEILLANCE_VAN\nACCESS DENIED."},{name:"sudo_coffee.sh",text:"$ sudo make-me-a-sandwich\nPermission denied: go make it yourself."}],
 Notes:[{name:"readme.txt",text:"WELCOME TO ROGER OS\n\nThe games have their own entrances around the physical desk.\nClick the keyboard for Hacker Mode.\nThis desktop is for files and security experiments."}],
 "Recycle Bin":[{name:"motivation.exe",text:"This file was deleted on a Monday."},{name:"final_final_v9.zip",text:"Definitely the final version."}]
};
const tools:SecurityTool[]=["Sherlock OSINT","Nmap","Wireshark","Hashcat","Burp Suite"];
const toolIcons=[Search,Radar,Network,KeyRound,Shield];
const buttonStyle:React.CSSProperties={display:"flex",alignItems:"center",gap:10,color:"#ece9e4",background:"transparent",border:0,cursor:"pointer",padding:9,borderRadius:9,textAlign:"left",font:"inherit"};
export default function BureauDesktop({onClose}:{onClose:()=>void}){
 const [folder,setFolder]=useState<FolderName|null>(null);
 const [file,setFile]=useState<Entry|null>(null);
 const [tool,setTool]=useState<SecurityTool|null>(null);
 const [wallpaper,setWallpaper]=useState("");
 const [originalAvailable,setOriginalAvailable]=useState(false);
 const [wallpaperError,setWallpaperError]=useState("");
 const [dragging,setDragging]=useState(false);
 const chooser=useRef<HTMLInputElement>(null);
 useEffect(()=>{try{const saved=localStorage.getItem("roger-desktop-wallpaper-fullres-v2");if(saved)setWallpaper(saved);}catch{} const original=new Image();original.onload=()=>setOriginalAvailable(true);original.src="/bureau/Universum.jpg";},[]);
 useEffect(()=>{const close=(e:KeyboardEvent)=>{if(e.key==="Escape"){if(tool)setTool(null);else if(file)setFile(null);else if(folder)setFolder(null);else onClose();}};document.addEventListener("keydown",close);const previous=document.body.style.overflow;document.body.style.overflow="hidden";return()=>{document.removeEventListener("keydown",close);document.body.style.overflow=previous;};},[folder,file,tool,onClose]);
 const setBackground=async(selected?:File)=>{
  if(!selected)return;
  if(!selected.type.startsWith("image/")){setWallpaperError("Selecteer een afbeelding.");return;}
  try{
   const data=await new Promise<string>((resolve,reject)=>{
    const reader=new FileReader();
    reader.onload=()=>resolve(String(reader.result));
    reader.onerror=()=>reject(new Error("Unable to read wallpaper"));
    reader.readAsDataURL(selected);
   });
   localStorage.setItem("roger-desktop-wallpaper-fullres-v2",data);
   setWallpaper(data);setWallpaperError("");
  }catch{setWallpaperError("Je browser kon de originele afbeelding niet bewaren. Probeer een andere browser.");}
 };
 const leftFolders=(Object.keys(files) as FolderName[]).filter(name=>name!=="Recycle Bin");
 return <div role="presentation" onMouseDown={e=>{if(e.target===e.currentTarget)onClose();}} style={{position:"fixed",inset:0,zIndex:100000,background:"rgba(3,5,9,.88)",display:"grid",placeItems:"center",padding:15}}>
 <section onDragOver={e=>{if(e.dataTransfer.types.includes("Files")){e.preventDefault();setDragging(true);}}} onDragLeave={e=>{if(e.currentTarget===e.target)setDragging(false);}} onDrop={e=>{e.preventDefault();setDragging(false);void setBackground(e.dataTransfer.files?.[0]);}} section role="dialog" aria-modal="true" aria-label="Personal desktop" style={{width:"min(1200px,97vw)",height:"min(745px,91vh)",minHeight:420,position:"relative",overflow:"hidden",border:"1px solid #625446",borderRadius:13,boxShadow:"0 35px 110px #000",background:wallpaper?`linear-gradient(#06080b33,#06080b33),url("${wallpaper}") center/cover no-repeat`:`url("${originalAvailable?"/bureau/Universum.jpg":"/bureau/universum-wallpaper.svg"}") center/cover no-repeat`,color:"#e7e4e0",fontFamily:"system-ui,sans-serif"}}>
 
 <div style={{position:"absolute",top:15,right:15,zIndex:4,display:"flex",gap:7,alignItems:"center"}}>
 <input ref={chooser} aria-label="Upload wallpaper" type="file" accept="image/*" style={{display:"none"}} onChange={e=>{void setBackground(e.target.files?.[0]);e.target.value="";}}/>
 <button onClick={()=>chooser.current?.click()} title="Gebruik je eigen achtergrond" style={{...buttonStyle,background:"#121b20da",fontSize:11,border:"1px solid #53645c"}}><ImagePlus size={16}/> Wallpaper wijzigen</button>
 {wallpaper&&<button onClick={()=>{try{localStorage.removeItem("roger-desktop-wallpaper-fullres-v2");localStorage.removeItem("roger-desktop-wallpaper-v1");}catch{}setWallpaper("");}} title="Herstel je originele Universum-achtergrond" style={{...buttonStyle,background:"#121b20da",fontSize:11,border:"1px solid #53645c"}}>Originele achtergrond</button>}
 <button onClick={onClose} aria-label="Close desktop" style={{...buttonStyle,background:"#20262c",padding:9}}><X size={18}/></button>
 </div>
 {dragging&&<div style={{position:"absolute",inset:8,zIndex:20,display:"grid",placeItems:"center",background:"#06120bd9",border:"2px dashed #8fe0b3",borderRadius:12,pointerEvents:"none",fontSize:20,fontWeight:700}}>Laat je originele JPG hier los</div>}
 {!wallpaper&&!originalAvailable&&<button type="button" onClick={()=>chooser.current?.click()} style={{position:"absolute",zIndex:3,top:65,left:135,background:"#0e171ed9",color:"#e7edec",fontSize:11,border:"1px solid #687971",borderRadius:7,padding:"8px 12px",cursor:"pointer"}}>Originele achtergrond in HD instellen · Klik of sleep JPG hier</button>}
 {wallpaperError&&<p role="alert" style={{position:"absolute",top:58,right:16,zIndex:5,color:"#ffb0a0",background:"#131516",padding:8,fontSize:11}}>{wallpaperError}</p>}
 {/* Folders are aligned down the left edge, leaving the wallpaper clear. */}
 <div style={{position:"absolute",left:15,top:24,bottom:155,width:110,display:"flex",flexDirection:"column",gap:15,alignItems:"center",overflowY:"auto",zIndex:1}}>
 {leftFolders.map(name=><button key={name} onClick={()=>{setFolder(name);setTool(null);setFile(null);}} style={{...buttonStyle,flexDirection:"column",alignItems:"center",justifyContent:"center",textAlign:"center",gap:6,width:100,minHeight:78,fontSize:11,textShadow:"0 1px 5px #000,0 1px 9px #000"}}>
 <Folder size={36} color="#e9c17e" strokeWidth={1.5} style={{filter:"drop-shadow(0 2px 7px #000a)"}}/><span>{name}</span></button>)}
 </div>
 {/* Recycle bin sits in the upper-right, clear of the window controls. */}
 <button onClick={()=>{setFolder("Recycle Bin");setTool(null);setFile(null);}} style={{...buttonStyle,position:"absolute",right:17,top:70,width:102,flexDirection:"column",alignItems:"center",textAlign:"center",gap:7,fontSize:11,textShadow:"0 1px 5px #000,0 1px 9px #000",zIndex:1}}>
 <Trash2 size={37} strokeWidth={1.5} color="#e9c17e"/><span>Recycle Bin</span></button>
 {/* Ordinary desktop shortcuts, directly on the wallpaper at the bottom-left. */}
 <div role="group" aria-label="Security programs" style={{position:"absolute",left:15,bottom:55,width:"min(620px,calc(100% - 30px))",display:"flex",flexWrap:"wrap",alignItems:"flex-end",gap:"8px 6px",zIndex:1}}>
 {tools.map((name,i)=>{const ToolIcon=toolIcons[i];return <button key={name} onClick={()=>{setTool(name);setFile(null);}} style={{...buttonStyle,flexDirection:"column",alignItems:"center",justifyContent:"center",textAlign:"center",gap:6,padding:"7px 3px",width:108,minWidth:0,fontSize:11,textShadow:"0 1px 5px #000,0 1px 9px #000"}}>
 <ToolIcon size={34} strokeWidth={1.5} color="#91dec1" style={{filter:"drop-shadow(0 2px 7px #000a)"}}/><span style={{overflowWrap:"anywhere"}}>{name}</span></button>})}
 </div>
 <div style={{position:"absolute",bottom:0,left:0,right:0,minHeight:45,background:"rgba(5,9,14,.86)",borderTop:"1px solid #45474a",display:"flex",alignItems:"center",gap:12,padding:"0 19px",fontSize:11,color:"#ddd4ca",backdropFilter:"blur(10px)"}}><Monitor size={17}/> ROGER OS <span style={{marginLeft:"auto"}}>PRIVATE WORKSTATION</span></div>
 {folder&&<div style={{position:"absolute",zIndex:2,top:"15%",left:"min(12%,95px)",width:"min(690px,83%)",height:"min(420px,67%)",background:"#121820",border:"1px solid #4b514f",borderRadius:12,boxShadow:"0 24px 70px #000b",overflow:"auto"}}>
 <div style={{padding:"12px 16px",background:"#1c252e",display:"flex",alignItems:"center",gap:10,fontSize:14}}><Folder size={17} color="#d6ad71"/>{folder}<button onClick={()=>{setFolder(null);setFile(null);}} aria-label="Close folder" style={{...buttonStyle,marginLeft:"auto",padding:2}}><X size={17}/></button></div>
 <div style={{padding:14,display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(145px,1fr))",gap:6}}>{files[folder].map(entry=><button key={entry.name} onClick={()=>setFile(entry)} style={{...buttonStyle,fontSize:12,flexDirection:"column",alignItems:"flex-start",overflowWrap:"anywhere"}}><FileCode2 size={24} color="#aeccbf"/>{entry.name}</button>)}</div></div>}
 {tool&&<SecurityToolPanel tool={tool} onClose={()=>setTool(null)}/>}
 {file?.name==="bruteforce_lab.py"&&<div style={{position:"absolute",zIndex:5,inset:18,background:"#0b1016",border:"1px solid #48715b",borderRadius:12,overflow:"auto",padding:20}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}><strong style={{fontSize:14}}>bruteforce_lab.py</strong><button style={buttonStyle} onClick={()=>setFile(null)} aria-label="Close audit lab"><X size={18}/></button></div><BruteForceLab/></div>}
 {file&&file.name!=="bruteforce_lab.py"&&<div style={{position:"absolute",zIndex:3,top:"24%",left:"min(23%,180px)",width:"min(600px,72%)",minHeight:250,maxHeight:"52%",overflow:"auto",background:"#0b1016",border:"1px solid #64716c",borderRadius:10,boxShadow:"0 25px 80px #000"}}>
 <div style={{display:"flex",alignItems:"center",gap:9,padding:"11px 14px",background:"#202a30",fontSize:13}}><FileCode2 size={16}/>{file.name}<button onClick={()=>setFile(null)} style={{...buttonStyle,marginLeft:"auto",padding:0}} aria-label="Close file"><X size={17}/></button></div>
 <pre style={{whiteSpace:"pre-wrap",fontFamily:"ui-monospace,monospace",fontSize:13,color:"#97d9ae",lineHeight:1.75,padding:20,margin:0}}>{file.text}</pre></div>}
 </section></div>;
}
