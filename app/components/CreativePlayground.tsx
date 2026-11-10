"use client";

import { useState } from "react";
import type { KeyboardEvent } from "react";
import {
  ArrowRight, ArrowUpRight, Check, Copy, Cpu, Palette, RotateCcw,
  ShieldCheck, Sparkles, TerminalSquare, WandSparkles, Zap
} from "lucide-react";
import PlaygroundTerminal from "./PlaygroundTerminal";
import "./creative-playground.css";

type Mode = "design" | "engineer" | "chaos";
type TypeStyle = "sans" | "serif";
type Tone = "gold" | "slate" | "midnight";
const modes: {id: Mode; name: string; tagline: string; Icon: typeof Palette}[] = [
  {id:"design",name:"DESIGN",tagline:"Make it look right",Icon:Palette},
  {id:"engineer",name:"ENGINEER",tagline:"Make it work",Icon:Cpu},
  {id:"chaos",name:"CHAOS",tagline:"Make it interesting",Icon:Sparkles}
];
const moods: {id: Tone; label: string}[] = [
  {id:"gold",label:"CHAMPAGNE"},
  {id:"slate",label:"GRAPHITE"},
  {id:"midnight",label:"MIDNIGHT"}
];
const scenes = [
  {symbol:"✳",heading:"CONTROLLED\nCHAOS.",line:"It's not a bug. It's an undocumented art direction."},
  {symbol:"⌘",heading:"STAY\nCURIOUS.",line:"Normal wasn't in the brief. Neither was this button."},
  {symbol:"★",heading:"ONE MORE\nPIXEL.",line:"Every designer's most expensive sentence."},
  {symbol:"?!",heading:"IT WORKS.\nSOMEHOW.",line:"Full technical explanation: yes."},
  {symbol:"↗",heading:"IDEAS NEED\nROOM.",line:"The good ideas always escape the grid."},
  {symbol:"☺",heading:"NOT EVEN\nSORRY.",line:"You unlocked the profoundly unimportant achievement."}
];
const weirdErrors = [
  "Dat is een prima keuze voor iemand die graag meer werk creëert.",
  "ROGER_OS: je hebt op de knop voor onnodige problemen gedrukt.",
  "Bijna. Zelfs de printer zag dat deze niet ging werken.",
  "De engineer heeft het geprobeerd te negeren. Zonder succes."
];
const prompts = [
  "FORM\nFOLLOWS FUN.",
  "BE BOLD.\nSTAY SHARP.",
  "DESIGN\nWITH INTENT.",
  "GOOD IDEAS\nARE BUILT.",
  "PIXELS &\nPACKETS."
];

export default function CreativePlayground() {
  const [mode, setMode] = useState<Mode>("design");
  const [expanded, setExpanded] = useState(false);
  const [copy, setCopy] = useState("MAKE IT\nMATTER.");
  const [tone, setTone] = useState<Tone>("gold");
  const [typeStyle, setTypeStyle] = useState<TypeStyle>("sans");
  const [size, setSize] = useState(94);
  const [tracking, setTracking] = useState(-3);
  const [grid, setGrid] = useState(true);
  const [generated, setGenerated] = useState(0);
  const [copied, setCopied] = useState(false);
  const [engineerStep, setEngineerStep] = useState(0);
  const [engineerFailures, setEngineerFailures] = useState(0);
  const [diagnosticNote, setDiagnosticNote] = useState("Selecteer een test. Het netwerk wacht op een operator.");
  const [chaosIndex, setChaosIndex] = useState(0);
  const [intensity, setIntensity] = useState(2);
  const [chaosTheme, setChaosTheme] = useState<Tone>("gold");
  const [terminalOpen, setTerminalOpen] = useState(false);
  const currentScene = scenes[chaosIndex % scenes.length];

  const randomizePoster = () => {
    setGenerated(i=>i+1);
    setCopy(prompts[generated % prompts.length]);
    setTypeStyle(t=>t==="sans"?"serif":"sans");
    setTracking(tracking >= 1 ? -4 : tracking+1);
    setTone(moods[(generated+1) % moods.length].id);
    setCopied(false);
  };
  const copySettings = async () => {
    const data = "ROGER DESIGN LAB\nText: "+copy.replace(/\n/g," / ")+
      "\nStyle: "+typeStyle+"\nPalette: "+tone+
      "\nScale: "+size+"\nTracking: "+tracking;
    try {await navigator.clipboard.writeText(data);setCopied(true);}
    catch {setCopied(false);setDiagnosticNote("Je browser staat kopiëren niet toe.");}
  };
  const runCheck = (command: string) => {
    const expected = ["ping","nslookup","repair"][engineerStep];
    if(command === "reset") {
      setEngineerStep(0);setEngineerFailures(0);
      setDiagnosticNote("Diagnostiek gereset. Probeer het nog eens, zonder de serverruimte te verbouwen.");
      return;
    }
    if(command !== expected) {
      setDiagnosticNote(weirdErrors[engineerFailures % weirdErrors.length]);
      setEngineerFailures(i=>i+1);
      return;
    }
    const messages=[
      "PING OK / 4 packets received. De verbinding werkt, maar de naam niet.",
      "DNS TIMEOUT / Het adres wordt niet gevonden. Je hebt de fout gelokaliseerd.",
      "RESOLVER REPAIRED / Alle systemen online. Zelfs de koffiemachine."
    ];
    setEngineerStep(i=>i+1);
    setDiagnosticNote(messages[engineerStep]);
  };
  const onModeKeys = (event: KeyboardEvent<HTMLDivElement>) => {
    if(event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    const current=modes.findIndex(m=>m.id===mode);
    const next=(current + (event.key === "ArrowRight" ? 1 : modes.length-1))%modes.length;
    setMode(modes[next].id);
    event.preventDefault();
    document.getElementById("cp-tab-"+modes[next].id)?.focus();
  };
  return (
    <div className={expanded ? "cp cp-expanded" : "cp"}>
      <div className="cp-topline">
        <span><i/> ROGER LAB / INTERACTIVE EDITION</span>
        <button type="button" className="cp-expand" aria-expanded={expanded} aria-controls="cp-stage" onClick={()=>setExpanded(v=>!v)}>
          {expanded ? "COMPACT VIEW" : "OPEN FULL WORKSPACE"} <ArrowUpRight size={15}/>
        </button>
      </div>
      <div className="cp-tabs" role="tablist" aria-label="Playground-modus" onKeyDown={onModeKeys}>
        {modes.map((m,index) => <button type="button" role="tab" id={"cp-tab-"+m.id} key={m.id}
          aria-selected={mode===m.id} aria-controls="cp-stage" tabIndex={mode===m.id?0:-1}
          className={mode===m.id?"cp-tab selected":"cp-tab"} onClick={()=>setMode(m.id)}>
          <span className="cp-tab-num">0{index+1}</span>
          <m.Icon size={19} strokeWidth={1.6}/>
          <span className="cp-tab-name"><strong>{m.name}</strong><small>{m.tagline}</small></span>
          <span className="cp-tab-diamond" aria-hidden="true">✳</span>
        </button>)}
      </div>
      <div className="cp-workbench" role="tabpanel" id="cp-stage" aria-labelledby={"cp-tab-"+mode}>
        <div className="cp-stage-visual">
          {mode==="design"&&
            <div className={"cp-design-preview cp-tone-"+tone}>
              <div className={grid?"cp-design-grid visible":"cp-design-grid"} aria-hidden="true"/>
              <div className="cp-preview-corner"><span>DESIGN EXPERIMENT / 001</span><span>ROGER®</span></div>
              <div className="cp-design-art">
                <div className="cp-design-orbit" aria-hidden="true"/>
                <strong className={"cp-poster-type cp-font-"+typeStyle}
                  style={{fontSize:"clamp(34px, calc("+Math.round(size*.51)+"px + 1.3vw), "+size+"px)",letterSpacing:tracking+"px"}}>
                  {copy.trim() || "YOUR\nIDEA."}
                </strong>
                <span className="cp-design-spark" aria-hidden="true">✳</span>
              </div>
              <div className="cp-preview-bottom"><span>TYPOGRAPHY / COMPOSITION / ATTITUDE</span><span>{tone.toUpperCase()} / {typeStyle.toUpperCase()}</span></div>
            </div>
          }
          {mode==="engineer"&&
            <div className="cp-engineer-preview">
              <div className="cp-console-heading"><span><i/> roger@lab:~/diagnostics</span><span>SIMULATED TERMINAL</span></div>
              <div className="cp-console-output" aria-live="polite">
                <p className="cp-command"><b>$</b> ./run-diagnostics --portfolio</p>
                <p className="cp-console-muted">↳ Initializing questionable levels of professionalism...</p>
                <p><span className="cp-console-pass">✓</span> Visual design <span>READY</span></p>
                <p><span className="cp-console-pass">✓</span> Coffee dependency <span>LOADED</span></p>
                <p><span className="cp-console-pass">✓</span> Frontend components <span>STABLE-ISH</span></p>
                {engineerStep>=1&&<p><span className="cp-console-pass">✓</span> ping 1.1.1.1 <span>REACHABLE</span></p>}
                {engineerStep>=2&&<p><span className="cp-console-warn">!</span> nslookup vault.example <span>DNS TIMEOUT</span></p>}
                {engineerStep>=3&&<p><span className="cp-console-pass">✓</span> DNS resolver <span>RESTORED</span></p>}
                <p className="cp-console-result">{engineerStep===0?"SYSTEM: AWAITING YOUR FIRST MOVE":engineerStep===1?"SYSTEM: IP WORKS. WHY DOES THE URL FAIL?":engineerStep===2?"SYSTEM: FAULT LOCATED. CHOOSE A FIX.":"SYSTEM: ALL GREEN. NO ACTUAL SERVERS HARMED."}</p>
                <p className="cp-console-cursor"><b>$</b> <span>▌</span></p>
              </div>
              <div className="cp-console-footer"><span>CONNECTION STATUS</span><strong>{engineerStep===3?"NOMINAL":engineerStep===0?"UNKNOWN":"INVESTIGATING"}</strong></div>
            </div>
          }
          {mode==="chaos"&&
            <div className={"cp-chaos-preview cp-tone-"+chaosTheme+" cp-chaos-level-"+intensity}>
              <div className="cp-chaos-orbit" aria-hidden="true"/>
              <div className="cp-chaos-scribble scribble-a" aria-hidden="true">CTRL + Z</div>
              <div className="cp-chaos-scribble scribble-b" aria-hidden="true">APPROVED BY NOBODY</div>
              <span className="cp-chaos-symbol" key={chaosIndex}>{currentScene.symbol}</span>
              <div className="cp-chaos-wordmark"><strong>{currentScene.heading}</strong><span>{currentScene.line}</span></div>
              <div className="cp-chaos-index">GENERATED INCIDENT / {String(chaosIndex+1).padStart(3,"0")}</div>
            </div>
          }
        </div>

        <div className="cp-controls" aria-label="Instellingen, scroll voor meer mogelijkheden" tabIndex={0}>
          {mode==="design"&&<>
            <div className="cp-panel-heading"><span>01 / VISUAL STUDIO</span><h3>Make it <em>yours.</em></h3><p>Stuur een mini-designstudio aan. Iedere aanpassing zie je direct links.</p></div>
            <label className="cp-field-label" htmlFor="cp-message">THE MESSAGE <span>MAX 40</span></label>
            <textarea id="cp-message" rows={2} value={copy} maxLength={40} onChange={event=>{setCopy(event.target.value.slice(0,40));setCopied(false);}}/>
            <div className="cp-field-label">COLOR DIRECTION</div>
            <div className="cp-mood-grid">{moods.map(m=><button key={m.id} type="button" aria-pressed={tone===m.id} className={tone===m.id?"selected":""} onClick={()=>setTone(m.id)}><i className={"cp-mood-chip mood-"+m.id}/>{m.label}</button>)}</div>
            <div className="cp-field-label">TYPOGRAPHY</div>
            <div className="cp-segmented" role="group" aria-label="Lettertype"><button type="button" aria-pressed={typeStyle==="sans"} className={typeStyle==="sans"?"selected":""} onClick={()=>setTypeStyle("sans")}>MODERN SANS</button><button type="button" aria-pressed={typeStyle==="serif"} className={typeStyle==="serif"?"selected":""} onClick={()=>setTypeStyle("serif")}>EDITORIAL SERIF</button></div>
            <label className="cp-slider-label" htmlFor="cp-size">TYPE SCALE <strong>{size}px</strong></label>
            <input type="range" id="cp-size" min="60" max="112" step="2" value={size} onChange={e=>setSize(Number(e.target.value))}/>
            <label className="cp-slider-label" htmlFor="cp-spacing">LETTER SPACING <strong>{tracking}px</strong></label>
            <input type="range" id="cp-spacing" min="-6" max="5" step="1" value={tracking} onChange={e=>setTracking(Number(e.target.value))}/>
            <label className="cp-checkbox-label"><input type="checkbox" checked={grid} onChange={e=>setGrid(e.target.checked)}/> SHOW CONSTRUCTION GRID</label>
            <div className="cp-panel-actions"><button type="button" className="cp-action-primary" onClick={randomizePoster}><WandSparkles size={16}/> SURPRISE ME</button><button type="button" className="cp-action-quiet" onClick={()=>{setCopy("MAKE IT\nMATTER.");setTone("gold");setTypeStyle("sans");setSize(94);setTracking(-3);setGrid(true);setCopied(false);}} aria-label="Herstel standaardontwerp"><RotateCcw size={17}/></button></div>
            <button type="button" className="cp-copy-settings" onClick={copySettings}><Copy size={14}/>{copied?"SETTINGS COPIED":"COPY DESIGN SETTINGS"}</button>
          </>}
          {mode==="engineer"&&<>
            <div className="cp-panel-heading"><span>02 / ENGINEERING BAY</span><h3>Debug the <em>drama.</em></h3><p>Er zit een netwerkstoring in deze fictieve console. Diagnoseer eerst, repareer daarna.</p></div>
            <div className="cp-progress-label"><span>DIAGNOSTIC PROGRESS</span><strong>0{engineerStep} / 03</strong></div>
            <div className="cp-progress-track"><span style={{width:(engineerStep/3*100)+"%"}}/></div>
            <div className="cp-engineer-steps"><span className={engineerStep>=1?"complete":""}><Check size={14}/> CONNECTIVITY</span><span className={engineerStep>=2?"complete":""}><Check size={14}/> DNS CHECK</span><span className={engineerStep>=3?"complete":""}><Check size={14}/> REPAIR</span></div>
            <div className="cp-field-label">SELECT NEXT ACTION</div>
            {engineerStep<3?<div className="cp-option-list">
              {(engineerStep===0?[
                {id:"reboot",label:"REBOOT EVERYTHING",desc:"De paniekroute"},
                {id:"ping",label:"PING 1.1.1.1",desc:"Test direct een IP-adres"},
                {id:"firewall",label:"DISABLE SECURITY",desc:"Wat kan er misgaan?"}
              ]:engineerStep===1?[
                {id:"browser",label:"REINSTALL BROWSER",desc:"Op gevoel"},
                {id:"nslookup",label:"NSLOOKUP VAULT.EXAMPLE",desc:"Onderzoek naamomzetting"},
                {id:"cable",label:"REPLACE ALL CABLES",desc:"Veel werk. Veel hoop."}
              ]:[
                {id:"reboot",label:"RESTART THE INTERNET",desc:"Overdreven"},
                {id:"repair",label:"REPAIR DNS RESOLVER",desc:"De gerichte oplossing"},
                {id:"printer",label:"ASK THE PRINTER",desc:"De echte eindbaas"}
              ]).map(option=><button type="button" key={option.id} onClick={()=>runCheck(option.id)}><span><strong>{option.label}</strong><small>{option.desc}</small></span><ArrowRight size={16}/></button>)}
            </div>:<div className="cp-engineer-win"><ShieldCheck size={24}/><div><strong>CASE CLOSED.</strong><span>DNS hersteld. Dit keer zonder de serverruimte af te breken.</span></div></div>}
            <div className="cp-engineer-note" role="status">{diagnosticNote}</div>
            <button type="button" className="cp-copy-settings" onClick={()=>runCheck("reset")}><RotateCcw size={14}/> RESET DIAGNOSTICS</button>
          </>}
          {mode==="chaos"&&<>
            <div className="cp-panel-heading"><span>03 / CREATIVE ANOMALIES</span><h3>A little <em>unpredictable.</em></h3><p>Een mini-generator voor mooie onzin. Speels, maar met een duidelijke art direction.</p></div>
            <div className="cp-chaos-card"><span>IDEA / {String(chaosIndex+1).padStart(3,"0")}</span><strong>{currentScene.line}</strong></div>
            <div className="cp-field-label">VISUAL MOOD</div>
            <div className="cp-mood-grid">{moods.map(m=><button key={m.id} type="button" aria-pressed={chaosTheme===m.id} className={chaosTheme===m.id?"selected":""} onClick={()=>setChaosTheme(m.id)}><i className={"cp-mood-chip mood-"+m.id}/>{m.label}</button>)}</div>
            <label className="cp-slider-label" htmlFor="cp-intensity">CHAOS INTENSITY <strong>0{intensity} / 04</strong></label>
            <input type="range" id="cp-intensity" min="1" max="4" step="1" value={intensity} onChange={e=>setIntensity(Number(e.target.value))}/>
            <p className="cp-intensity-hint">{["","Almost professional.","Elegantly unpredictable.","Design system mildly concerned.","This is why we have backups."][intensity]}</p>
            <button type="button" className="cp-action-primary cp-chaos-button" onClick={()=>setChaosIndex(i=>i+1)}><Zap size={16}/> MAKE IT WEIRDER <ArrowRight size={16}/></button>
            {chaosIndex>=5&&<div className="cp-chaos-easter"><Sparkles size={15}/><span>SECRET ACHIEVEMENT: Je hebt meer op deze knop gedrukt dan de gemiddelde bezoeker op een privacybeleid.</span></div>}
            <button type="button" className="cp-copy-settings" onClick={()=>{setChaosIndex(0);setIntensity(2);setChaosTheme("gold");}}><RotateCcw size={14}/> RESTORE NORMALITY (ISH)</button>
          </>}
        </div>
      </div>
      <div className="cp-footer">
        <span><i/> ALL SYSTEMS SIMULATED · NO ACCOUNTS NEEDED</span>
        <button type="button" aria-expanded={terminalOpen} onClick={()=>setTerminalOpen(o=>!o)}><TerminalSquare size={17}/>{terminalOpen?"CLOSE SECRET TERMINAL":"PSST. THERE'S A SECRET TERMINAL."}<ArrowUpRight size={15}/></button>
      </div>
      {terminalOpen&&<div className="cp-terminal-wrap"><PlaygroundTerminal onClose={()=>setTerminalOpen(false)}/></div>}
    </div>
  );
}
