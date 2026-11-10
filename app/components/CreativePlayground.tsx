"use client";

import { useState } from "react";
import {
  ArrowRight, ArrowUpRight, Check, ChevronRight, CircleHelp,
  Code2, Copy, Cpu, Fingerprint, Gauge, Grid2X2, Heart,
  MousePointer2, Palette, RotateCcw, ScanSearch, ShieldCheck,
  Sparkles, TerminalSquare, WandSparkles, Zap
} from "lucide-react";
import PlaygroundTerminal from "./PlaygroundTerminal";
import "./creative-playground.css";

const posterStyles = [
  { name:"OBSIDIAN / GOLD", id:"obsidian", eyebrow:"THE CLASSIC", badge:"01" },
  { name:"PAPER / INK", id:"paper", eyebrow:"THE EDITORIAL", badge:"02" },
  { name:"MIDNIGHT / GOLD", id:"midnight", eyebrow:"THE AFTER HOURS", badge:"03" }
] as const;

const chaosScenes = [
  { face:"✳", line:"SYSTEM STATUS: SUSPICIOUSLY CREATIVE", note:"Professioneel onverantwoord. Visueel verantwoord.", name:"THE SPARK" },
  { face:"⌘", line:"COMMAND NOT FOUND: NORMAL", note:"Sorry. Normaal staat niet in de dependencies.", name:"THE SHORTCUT" },
  { face:"?!", line:"EVERYTHING IS FINE. PROBABLY.", note:"Ik heb het getest. Op mijn machine.", name:"THE QUESTION" },
  { face:"★", line:"ONE MORE PIXEL. JUST ONE.", note:"Spoiler: het zijn nooit maar één pixel.", name:"THE OBSESSION" },
  { face:"↗", line:"YOUR IDEAS HAVE ESCAPED", note:"Geen zorgen. We hebben ze een mooi jasje gegeven.", name:"THE ESCAPE" },
  { face:"☺", line:"CONGRATS, YOU FOUND NOTHING", note:"Dat is eigenlijk ook wel een prestatie.", name:"THE REWARD" }
] as const;

const errors = [
  "Je hebt een gewone pixel gekozen. De designer zucht hoorbaar.",
  "Nope. Technisch gezien wel een klik. Emotioneel niet de juiste.",
  "Bijna. Dat zeggen we ook altijd na de twaalfde bugfix.",
  "Die pixel is onschuldig. Richt je op het vreemde exemplaar."
];

export default function CreativePlayground() {
  const [posterText,setPosterText] = useState("MAKE IT\nMATTER.");
  const [posterTheme,setPosterTheme] = useState(0);
  const [posterFont,setPosterFont] = useState<"sans"|"serif">("sans");
  const [posterSize,setPosterSize] = useState(90);
  const [posterSpacing,setPosterSpacing] = useState(-3);
  const [posterAngle,setPosterAngle] = useState(-3);
  const [posterGrid,setPosterGrid] = useState(true);
  const [posterSaved,setPosterSaved] = useState<"idle"|"copied"|"error">("idle");
  const [diagState,setDiagState] = useState(0);
  const [pingCount,setPingCount] = useState(0);
  const [chaosIndex,setChaosIndex] = useState(0);
  const [huntRound,setHuntRound] = useState(0);
  const [huntMisses,setHuntMisses] = useState(0);
  const [huntText,setHuntText] = useState("");
  const [terminalOpen,setTerminalOpen] = useState(false);
  const theme = posterStyles[posterTheme];
  const chaos = chaosScenes[chaosIndex % chaosScenes.length];
  const targets = [4,11,6];
  const huntDone = huntRound >= targets.length;

  const shufflePoster = () => {
    const headlines = ["NO RULES.\nJUST CRAFT.", "DESIGN WITH\nINTENT.", "LESS NOISE.\nMORE IMPACT.", "HELLO,\nWORLD.", "PIXELS &\nPACKETS."];
    setPosterTheme(index => (index + 1) % posterStyles.length);
    setPosterText(headlines[(posterTheme + posterSize + posterSpacing + 100) % headlines.length]);
    setPosterAngle(angle => angle >= 6 ? -6 : angle + 3);
    setPosterFont(font => font === "sans" ? "serif" : "sans");
    setPosterSaved("idle");
  };

  const copyPoster = async () => {
    const output = "ROGER / DESIGN LAB\n" +
      "Copy: " + posterText.replace(/\n/g," / ") + "\n" +
      "Theme: " + theme.name + "\n" +
      "Typeface: " + (posterFont === "sans" ? "Grotesk" : "Editorial serif") + "\n" +
      "Size: " + posterSize + " px\n" +
      "Tracking: " + posterSpacing + " px\n" +
      "Angle: " + posterAngle + "°";
    try {
      await navigator.clipboard.writeText(output);
      setPosterSaved("copied");
    } catch { setPosterSaved("error"); }
  };

  const resetPoster = () => {
    setPosterText("MAKE IT\nMATTER.");
    setPosterTheme(0);
    setPosterFont("sans");
    setPosterSize(90);
    setPosterSpacing(-3);
    setPosterAngle(-3);
    setPosterGrid(true);
    setPosterSaved("idle");
  };

  const guess = (index:number) => {
    if(huntDone) return;
    if(index === targets[huntRound]) {
      setHuntRound(current => current + 1);
      setHuntText(huntRound === 2 ? "All three anomalies eliminated. Designer sanity restored." : "YES. Die pixel stond inderdaad verkeerd. Volgende ronde!");
    } else {
      setHuntMisses(m => m + 1);
      setHuntText(errors[huntMisses % errors.length]);
    }
  };

  return (
    <div className="cplay">
      <div className="cplay-identity">
        <div><span className="cplay-live-dot"/><span>ROGER LAB / V2.0</span></div>
        <span>DESIGN × ENGINEERING × A LITTLE TROUBLE</span>
      </div>

      <div className="cplay-intro">
        <div>
          <span className="cplay-overline">NOT YOUR USUAL PORTFOLIO SECTION / 001</span>
          <h3>Made to be <em>messed with.</em></h3>
          <p>Geen plaatjes met nepknoppen. Dit is een echte creatieve werkplaats: maak iets, test iets, vind de fout en geef de chaos een zetje. Alles draait lokaal in je browser.</p>
        </div>
        <div className="cplay-stamp" aria-hidden="true"><span>R.</span><small>PLAY IS A SERIOUS BUSINESS</small></div>
      </div>

      <section className="cplay-module cplay-design" aria-label="Interactieve typografie-ontwerper">
        <div className="cplay-module-heading">
          <div><span className="cplay-index">01 / DESIGN STUDIO</span><h4>Build your own <em>statement.</em></h4><p>Een live typografisch experiment. Verander het ontwerp en zie wat er direct gebeurt. Ja, ook die ene pixel.</p></div>
          <span className="cplay-module-icon"><Palette size={22} strokeWidth={1.4}/></span>
        </div>
        <div className="cplay-design-grid">
          <div className={"cplay-poster cplay-theme-"+theme.id}>
            <div className={"cplay-poster-lines "+(posterGrid ? "show-grid":"")} aria-hidden="true"/>
            <div className="cplay-poster-top"><span>ROGER / VISUAL EXPERIMENTS</span><span>{theme.badge}—03</span></div>
            <div className="cplay-poster-center">
              <div className="cplay-poster-orbit" aria-hidden="true"/>
              <strong
                className={posterFont === "serif" ? "cplay-serif" : "cplay-sans"}
                style={{fontSize:"clamp(37px, 7vw, "+posterSize+"px)",letterSpacing:posterSpacing+"px",transform:"rotate("+posterAngle+"deg)"}}
              >{posterText || "YOUR\nIDEA HERE."}</strong>
              <span className="cplay-poster-spark" aria-hidden="true">✳</span>
            </div>
            <div className="cplay-poster-bottom"><span>{theme.eyebrow}</span><span>EST. 2026 / ALWAYS EXPERIMENTING</span></div>
          </div>
          <div className="cplay-controls">
            <div className="cplay-controls-label"><span>THE CONTROL DESK</span><span><Gauge size={14}/> LIVE</span></div>
            <label className="cplay-label" htmlFor="cplay-copy">YOUR MESSAGE <small>MAX 38 CHARACTERS</small></label>
            <textarea id="cplay-copy" value={posterText} onChange={event=>{setPosterText(event.target.value.slice(0,38));setPosterSaved("idle");}} rows={2} maxLength={38} aria-label="Tekst voor je typografische poster"/>
            <div className="cplay-label">COLOR / MATERIAL</div>
            <div className="cplay-swatches">{posterStyles.map((option,i)=><button key={option.id} className={posterTheme===i?"selected":""} aria-pressed={posterTheme===i} type="button" onClick={()=>{setPosterTheme(i);setPosterSaved("idle");}}><span className={"cplay-swatch-dot "+option.id}/>{option.name}</button>)}</div>
            <div className="cplay-label">TYPEFACE</div>
            <div className="cplay-segmented" role="group" aria-label="Kies een lettertype">
              <button type="button" aria-pressed={posterFont==="sans"} className={posterFont==="sans"?"selected":""} onClick={()=>setPosterFont("sans")}>GROTESK</button>
              <button type="button" aria-pressed={posterFont==="serif"} className={posterFont==="serif"?"selected":""} onClick={()=>setPosterFont("serif")}>EDITORIAL</button>
            </div>
            <label className="cplay-slider-label" htmlFor="cplay-font"><span>TYPE SCALE</span><strong>{posterSize}px</strong></label>
            <input id="cplay-font" type="range" min="54" max="112" step="2" value={posterSize} onChange={e=>setPosterSize(Number(e.target.value))}/>
            <label className="cplay-slider-label" htmlFor="cplay-track"><span>LETTER SPACING</span><strong>{posterSpacing}px</strong></label>
            <input id="cplay-track" type="range" min="-6" max="5" step="1" value={posterSpacing} onChange={e=>setPosterSpacing(Number(e.target.value))}/>
            <label className="cplay-slider-label" htmlFor="cplay-angle"><span>TILT</span><strong>{posterAngle}°</strong></label>
            <input id="cplay-angle" type="range" min="-10" max="10" step="1" value={posterAngle} onChange={e=>setPosterAngle(Number(e.target.value))}/>
            <label className="cplay-switch-row"><input type="checkbox" checked={posterGrid} onChange={e=>setPosterGrid(e.target.checked)}/><span>Show construction grid</span></label>
            <div className="cplay-control-actions">
              <button type="button" className="cplay-primary" onClick={shufflePoster}><WandSparkles size={16}/> SURPRISE ME</button>
              <button type="button" className="cplay-secondary" onClick={resetPoster}><RotateCcw size={16}/> RESET</button>
            </div>
            <button className="cplay-copy" type="button" onClick={copyPoster}><Copy size={14}/>{posterSaved==="copied"?"DESIGN SETTINGS COPIED":posterSaved==="error"?"COPY NOT AVAILABLE":"COPY DESIGN SETTINGS"}</button>
            <p className="cplay-disclaimer">Het kopiëren bewaart je ontwerpinstellingen als tekst, niet als afbeelding.</p>
          </div>
        </div>
      </section>

      <div className="cplay-twin">
        <section className="cplay-module cplay-engineer" aria-label="Simulatie van systeemdiagnostiek">
          <div className="cplay-module-heading">
            <div><span className="cplay-index">02 / ENGINEERING BAY</span><h4>Diagnose the <em>drama.</em></h4><p>Start een fictieve systeemscan. Los het gevonden probleem op — of doe eerst een ping, natuurlijk.</p></div>
            <span className="cplay-module-icon"><Cpu size={22} strokeWidth={1.4}/></span>
          </div>
          <div className="cplay-console">
            <div className="cplay-console-bar"><span><i/> roger@lab:~/systems</span><span>SIMULATED SHELL</span></div>
            <div className="cplay-console-inner" aria-live="polite">
              <p><b>$</b> ./diagnose --interactive</p>
              <p className="cplay-log-muted">› Ready to inspect the portfolio universe.</p>
              {diagState===0 ? <p><span className="cplay-log-gold">→</span> Waiting for operator command<span className="cplay-blink">_</span></p> : <>
                <p><span className="cplay-log-success">✓</span> Frontend render: responsive</p>
                <p><span className="cplay-log-success">✓</span> Coffee dependency: loaded</p>
                <p><span className="cplay-log-success">✓</span> Portfolio vibes: calibrated</p>
                <p><span className={diagState===1?"cplay-log-warn":"cplay-log-success"}>{diagState===1?"!":"✓"}</span> DNS resolver: {diagState===1?"UNREACHABLE":"RECOVERED"}</p>
                {pingCount>0 && <p><span className="cplay-log-gold">↳</span> ping test #{pingCount}: 4 packets, 0 lost</p>}
                {diagState===2 && <p className="cplay-log-celebration">ALL SYSTEMS NOMINALLY DRAMATIC.</p>}
              </>}
              <p className="cplay-console-prompt"><b>$</b> <span className="cplay-blink">▍</span></p>
            </div>
          </div>
          <div className="cplay-engineer-actions">
            <button className="cplay-primary" type="button" onClick={()=>{setDiagState(1);setPingCount(0);}}><ScanSearch size={16}/>{diagState===0?"RUN DIAGNOSTICS":"SCAN AGAIN"}</button>
            <button className="cplay-secondary" type="button" disabled={diagState===0} onClick={()=>setPingCount(n=>n+1)}><Gauge size={15}/> PING</button>
            {diagState===1&&<button className="cplay-repair" type="button" onClick={()=>setDiagState(2)}><ShieldCheck size={16}/> REPAIR DNS</button>}
          </div>
          <div className="cplay-engineer-caption"><span>STATUS / {diagState===0?"AWAITING INPUT":diagState===1?"ONE ISSUE DETECTED":"RECOVERED"}</span><span>{diagState===2?"NICE WORK, OPERATOR.":"NO REAL SERVERS INVOLVED."}</span></div>
        </section>

        <section className="cplay-module cplay-chaos" aria-label="Interactieve chaosgenerator">
          <div className="cplay-module-heading">
            <div><span className="cplay-index">03 / CHAOS DEPARTMENT</span><h4>Professionally <em>unserious.</em></h4><p>Een kleine generator voor grote creatieve onzin. Klik vaker voor andere ideeën en een verborgen bericht.</p></div>
            <span className="cplay-module-icon"><Sparkles size={22} strokeWidth={1.4}/></span>
          </div>
          <div className={"cplay-chaos-canvas cplay-chaos-variant-"+(chaosIndex%6)}>
            <span className="cplay-chaos-sticker sticker-a">CTRL + Z</span>
            <span className="cplay-chaos-sticker sticker-b">BRAND SAFE?<br/>ABSOLUTELY NOT.</span>
            <div className="cplay-chaos-ring"/>
            <div className="cplay-chaos-symbol" key={chaosIndex}><span>{chaos.face}</span></div>
            <span className="cplay-chaos-caption">{chaos.line}</span>
          </div>
          <div className="cplay-chaos-output"><span>GENERATED IDEA / {String(chaosIndex+1).padStart(2,"0")}</span><strong>{chaos.note}</strong></div>
          <button type="button" className="cplay-primary cplay-chaos-trigger" onClick={()=>setChaosIndex(n=>n+1)}><Zap size={16}/> MAKE IT WEIRDER <ArrowRight size={16}/></button>
          {chaosIndex>=5&&<div className="cplay-hidden-note"><Heart size={15}/> ACHIEVEMENT UNLOCKED: You've clicked this button more than most people read their own privacy policy.</div>}
        </section>
      </div>

      <section className="cplay-module cplay-hunt" aria-label="Speel zoek de afwijkende pixel">
        <div className="cplay-hunt-copy">
          <span className="cplay-index">04 / PIXEL PATROL</span>
          <h4>Spot the <em>imposter.</em></h4>
          <p>Er staat één pixel verkeerd. Vind de afwijkende tegel in drie rondes. Klinkt makkelijk, toch? Precies wat ik dacht toen ik ooit aan CSS begon.</p>
          <div className="cplay-hunt-stats"><span>ROUND <strong>{String(Math.min(huntRound+1,3)).padStart(2,"0")} / 03</strong></span><span>MISSES <strong>{String(huntMisses).padStart(2,"0")}</strong></span></div>
          <p className="cplay-hunt-feedback" role="status">{huntDone ? "PIXEL PATROL COMPLETE. Je hebt officieel de ogen van een designer. Of gewoon geluk." : huntText || "Hint: één tegel heeft een kleine gouden afwijking."}</p>
          {huntDone && <button className="cplay-primary" type="button" onClick={()=>{setHuntRound(0);setHuntMisses(0);setHuntText("");}}><RotateCcw size={16}/> PLAY AGAIN</button>}
        </div>
        <div className="cplay-hunt-board">
          <div className="cplay-hunt-board-head"><span>CALIBRATION / FIND ANOMALY</span><span><Grid2X2 size={13}/> 4 × 4</span></div>
          {huntDone ? <div className="cplay-hunt-win"><Check size={57} strokeWidth={1}/><strong>ALL CLEAR.</strong><span>THAT'S AN UNREASONABLY SHARP EYE.</span></div> :
            <div className="cplay-pixel-grid">{Array.from({length:16},(_,index)=><button type="button" key={huntRound+"-"+index} onClick={()=>guess(index)} className={"cplay-pixel "+(index===targets[huntRound]?"cplay-pixel-odd":"")} aria-label={"Inspecteer pixel "+(index+1)}><span/></button>)}</div>}
        </div>
      </section>

      <section className="cplay-terminal-section" aria-label="Geheime terminal">
        <div className="cplay-terminal-header"><div><span className="cplay-index">05 / HIDDEN CORNER</span><h4>There's always a <em>terminal.</em></h4><p>Voor de mensen die een website pas vertrouwen wanneer ze ergens <code>help</code> kunnen typen.</p></div><button type="button" className="cplay-terminal-trigger" aria-expanded={terminalOpen} onClick={()=>setTerminalOpen(open=>!open)}><TerminalSquare size={18}/>{terminalOpen?"CLOSE TERMINAL":"OPEN SECRET TERMINAL"}<ChevronRight size={17}/></button></div>
        {terminalOpen&&<PlaygroundTerminal onClose={()=>setTerminalOpen(false)}/>}
      </section>
      <div className="cplay-outro"><span>FIVE EXPERIMENTS. ZERO REQUIRED SIGNUPS.</span><span><Fingerprint size={14}/> MADE FOR CURIOUS HUMANS / ROGER ORLANDO</span></div>
    </div>
  );
}
