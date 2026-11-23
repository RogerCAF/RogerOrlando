"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const STORE = "roger-os-ten-seconds-v1";
const TARGET = 10000;
const format = (ms: number) => (ms / 1000).toFixed(2);
type Attempt = { time: number; at: number };
type BoardEntry = {name:string;ms:number;deviation:number;at:string};

export default function TenSecondChallenge() {
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [phase, setPhase] = useState<"ready" | "running" | "result">("ready");
  const [elapsed, setElapsed] = useState(0);
  const [showTime, setShowTime] = useState(true);
  const [nickname, setNickname] = useState("NPC");
  const [allTime, setAllTime] = useState<BoardEntry[]>([]);
  const [leaderboardStatus, setLeaderboardStatus] = useState("Loading all-time Top 10…");
  const started = useRef<number | null>(null);
  const displayTimer = useRef<number | null>(null);
  const phaseRef = useRef<"ready" | "running" | "result">("ready");
  const attemptsRef = useRef<Attempt[]>([]);
  const displayRef = useRef(true);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(STORE) || "[]");
      if (Array.isArray(stored)) {
        const safe = stored.filter((x): x is Attempt =>
          x && typeof x.time === "number" && Number.isFinite(x.time) && x.time >= 0 &&
          x.time < 3600000 && typeof x.at === "number" && Number.isFinite(x.at)
        ).slice(0, 50);
        attemptsRef.current = safe;
        setAttempts(safe);
      }
    } catch { /* Browser storage may be unavailable. */ }
    try {setNickname(((saved => saved && saved !== "PLAYER" ? saved : "NPC")(localStorage.getItem("bureau-kaya-name"))))}catch{}
    void refreshLeaderboard();
    return () => { if (displayTimer.current !== null) window.clearInterval(displayTimer.current); };
  }, []);

  async function refreshLeaderboard() {
    try {
      const response=await fetch("/api/kayas-button/leaderboard",{cache:"no-store"});
      if(!response.ok)throw Error("Leaderboard offline");
      const data=await response.json();
      setAllTime(Array.isArray(data.entries)?data.entries:[]);
      setLeaderboardStatus("ALL-TIME TOP 10 · SHARED ONLINE");
    } catch {setLeaderboardStatus("All-time leaderboard temporarily unavailable. Local attempts are still saved.")}
  }
  async function submitScore(time:number) {
    const name=nickname.trim().toUpperCase().replace(/[^A-Z0-9 _-]/g,"").slice(0,12)||"NPC";
    try{localStorage.setItem("bureau-kaya-name",name)}catch{}
    try{
      setLeaderboardStatus("Submitting qualifying attempt…");
      const response=await fetch("/api/kayas-button/leaderboard",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name,ms:Math.round(time)})});
      if(!response.ok)throw Error("Save failed");
      const data=await response.json();
      setAllTime(Array.isArray(data.entries)?data.entries:[]);
      setLeaderboardStatus(data.saved?"SAVED TO ALL-TIME TOP 10":"ALL-TIME TOP 10 · SCORE DID NOT QUALIFY");
    }catch{setLeaderboardStatus("Could not submit this score. Your local record is preserved.")}
  }

  // Only the *visual readout* needs periodic updates. The score itself is
  // measured with performance.now() when STOP is pressed, so reducing renders
  // does not change the accuracy of the 10.00 challenge.
  const tick = useCallback(() => {
    if (started.current === null || document.hidden || !displayRef.current) return;
    setElapsed(performance.now() - started.current);
  }, []);

  const start = useCallback(() => {
    if (phaseRef.current === "running") return;
    if (displayTimer.current !== null) window.clearInterval(displayTimer.current);
    started.current = performance.now();
    setElapsed(0);
    phaseRef.current = "running";
    setPhase("running");
    displayTimer.current = window.setInterval(tick, 40);
  }, [tick]);

  const stop = useCallback(() => {
    if (phaseRef.current !== "running" || started.current === null) return;
    const actual = performance.now() - started.current;
    started.current = null;
    if (displayTimer.current !== null) window.clearInterval(displayTimer.current);
    displayTimer.current = null;
    phaseRef.current = "result";
    setPhase("result");
    setElapsed(actual);
    const next = [{time: actual, at: Date.now()}, ...attemptsRef.current].slice(0, 50);
    attemptsRef.current = next;
    setAttempts(next);
    try { localStorage.setItem(STORE, JSON.stringify(next)); } catch { /* Still playable without localStorage. */ }
    void submitScore(actual);
    // A genuine stopped result which displays 10.00 unlocks Secret File 030.
    if (Math.round(actual / 10) === 1000) {
      try { localStorage.setItem("bureau-perfect-ten", "yes"); } catch { /* No persistence in restricted browsers. */ }
      window.dispatchEvent(new Event("bureau:unlock-changed"));
    }
  }, [nickname]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.repeat) return;
      const target = event.target;
      // Keep the Blind Mode checkbox and other form controls accessible.
      if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement ||
          (target instanceof HTMLElement && target.isContentEditable)) return;
      if (event.code === "Space" || event.code === "Enter") {
        event.preventDefault(); // Also prevents the focused button from activating twice.
        if (phaseRef.current === "running") stop();
        else start();
      }
      if (event.code === "KeyB") {
        event.preventDefault();
        setShowTime(previous => { displayRef.current = !previous; return !previous; });
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [start, stop]);

  const best = attempts.length ? attempts.reduce((a,b) =>
    Math.abs(a.time - TARGET) <= Math.abs(b.time - TARGET) ? a : b
  ) : null;
  const latest = attempts[0];
  const deviation = latest ? Math.abs(latest.time - TARGET) : null;

  return <section className="rg-ten-section" aria-label="Speel 10.00 seconden timinggame">
    <div className="rg-ten-head">
      <div><span className="rg-ten-kicker">KAYA’S BUTTON / 10.00</span><h2>Kaya’s Button. <em>Don’t push it.</em></h2>
      <p>Klik op START om de timer te starten en op STOP wanneer je denkt dat precies 10.00 seconden voorbij zijn. Je persoonlijke pogingen blijven op dit apparaat bewaard. De beste tien tijden, het dichtst bij exact 10.00 seconden, staan voor altijd in de gedeelde Top 10.</p></div>
      <span className="rg-ten-edition">ARCADE / 002</span>
    </div>
    <div className="bureau-arcade-key-guide"><strong>⌨ PC CONTROLS</strong><span><kbd>SPACE</kbd> of <kbd>ENTER</kbd> start / stop</span><span><kbd>B</kbd> blind mode</span><span>MUIS / TOUCH: rode knop</span></div>
    <div className="rg-ten-layout">
      <div className="rg-ten-play">
        <div className="rg-ten-readout" aria-live="off"><small>{phase === "running" ? "TIMER ACTIVE" : phase === "result" ? "YOUR LAST TIME" : "READY TO PLAY"}</small>
          <strong>{phase === "running" && !showTime ? "— —.——" : format(elapsed)}<span> SEC</span></strong>
          <span className="rg-ten-delta">{phase === "result" && deviation !== null ? (deviation < 5 ? "PERFECT 10.00!" : `${format(deviation)}s ${latest.time > TARGET ? "too late" : "too early"}`) : "TARGET / 10.00 SEC"}</span>
        </div>
        <button type="button" className={`rg-ten-button ${phase === "running" ? "is-running" : ""}`}
          aria-label={phase === "running" ? "Stop de timer" : "Start de timer"}
          onClick={() => { if (phaseRef.current === "running") stop(); else start(); }}
        ><span>{phase === "running" ? "STOP" : "START"}</span></button>
        <p className="rg-ten-instruction">{phase === "running" ? "Klik op STOP wanneer je denkt dat 10 seconden voorbij zijn." : phase === "result" ? "Nog een poging? Klik opnieuw op START." : "Klik op START om de timer te starten."}</p>
        <label className="rg-ten-toggle"><input type="checkbox" checked={!showTime} onChange={e => { const visible = !e.target.checked; setShowTime(visible); displayRef.current=visible; }}/> BLIND MODE <small>/ verberg timer tijdens spelen</small></label>
      </div>
      <aside className="rg-ten-scores">
        <div className="rg-ten-score-head"><span>PERSONAL BEST</span><span>LOCAL RECORD</span></div>
        <strong className="rg-ten-best">{best ? format(best.time) : "— —.——"}<small> SEC</small></strong>
        <p className="rg-ten-best-sub">{best ? `Afwijking: ${format(Math.abs(best.time-TARGET))} sec van 10.00` : "Nog geen score. Speel je eerste ronde."}</p>
        <div className="rg-ten-history-head"><span>RECENT ATTEMPTS</span><span>{attempts.length} TOTAL</span></div>
        <ol className="rg-ten-history">{attempts.length ? attempts.slice(0, 5).map((entry,i)=>
          <li key={entry.at+"-"+i}><span>#{String(attempts.length-i).padStart(2,"0")}</span><strong>{format(entry.time)} s</strong><small>{entry.time >= TARGET ? "+" : "−"}{format(Math.abs(entry.time-TARGET))} s</small></li>
        ) : <li className="rg-ten-empty">Je laatste vijf tijden verschijnen hier.</li>}</ol>
        <div style={{marginTop:22,paddingTop:18,borderTop:"1px solid #ffffff22"}}>
          <div className="rg-ten-score-head"><span>ALL-TIME TOP 10</span><span>WORLDWIDE</span></div>
          <label style={{display:"block",margin:"13px 0",fontSize:10,fontWeight:800,letterSpacing:".08em",color:"#eac18b"}}>PLAYER NAME
            <input aria-label="Naam voor het all-time klassement" value={nickname} maxLength={12} onChange={e=>setNickname(e.target.value)} style={{display:"block",marginTop:7,width:"100%",padding:"10px",borderRadius:7,border:"1px solid #af8b5c",background:"#142031",color:"#fff"}}/>
          </label>
          <p role="status" style={{fontSize:10,color:"#a9bac9"}}>{leaderboardStatus}</p>
          <ol className="rg-ten-history" style={{marginTop:10}}>
            {allTime.length?allTime.map((entry,index)=><li key={entry.at+"-"+index}>
              <span>#{String(index+1).padStart(2,"0")} {entry.name}</span><strong>{format(entry.ms)} s</strong><small>±{format(entry.deviation)} s</small>
            </li>):<li className="rg-ten-empty">Nog geen all-time records.</li>}
          </ol>
          <small style={{display:"block",marginTop:9,color:"#a9bac9",fontSize:10}}>Closest to 10.00 wins. Equal deviations: earliest record first.</small>
        </div>
      </aside>
    </div>
  </section>;
}
