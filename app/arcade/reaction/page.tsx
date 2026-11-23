"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import "../arcade.css";

type Phase = "idle" | "waiting" | "go" | "result" | "early";
const STORE = "bureau-reaction-best"; // Shared with the original Bureau reaction game.

export default function MongoReactionGame() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [best, setBest] = useState<number | null>(null);
  const [last, setLast] = useState<number | null>(null);
  const [nickname, setNickname] = useState("PLAYER");
  const [ranking, setRanking] = useState<Array<{name:string;ms:number}>>([]);
  const [boardStatus, setBoardStatus] = useState("Loading global Top 10…");
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const phaseRef = useRef<Phase>("idle");
  const greenAt = useRef(0);

  useEffect(() => {
    try {
      const value = Number(localStorage.getItem(STORE));
      if (Number.isFinite(value) && value > 0) setBest(value);
    } catch { /* The game still works without browser storage. */ }
    try { setNickname(localStorage.getItem("bureau-mongo-name") || "PLAYER"); } catch {}
    void refreshBoard();
    return () => { if (timeout.current !== null) clearTimeout(timeout.current); };
  }, []);

  async function refreshBoard() {
    try {
      const response = await fetch("/api/reaction/leaderboard", {cache:"no-store"});
      if (!response.ok) throw Error("Offline");
      const data = await response.json();
      setRanking(Array.isArray(data.entries) ? data.entries : []);
      setBoardStatus("GLOBAL TOP 10 · SHARED ACROSS DEVICES");
    } catch { setBoardStatus("Global leaderboard temporarily unavailable."); }
  }
  async function submitReaction(ms: number) {
    if (ms < 80 || ms > 10000) { setBoardStatus("Only reactions from 80–10000 ms qualify."); return; }
    const name = nickname.trim().toUpperCase().replace(/[^A-Z0-9 _-]/g, "").slice(0,12) || "PLAYER";
    try { localStorage.setItem("bureau-mongo-name", name); } catch {}
    try {
      setBoardStatus("Saving your reaction online…");
      const response = await fetch("/api/reaction/leaderboard", { method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name,ms}) });
      if (!response.ok) throw Error("Save failed");
      await refreshBoard();
    } catch { setBoardStatus("Online save failed. Your personal best is saved locally."); }
  }

  const changePhase = useCallback((next: Phase) => {
    phaseRef.current = next;
    setPhase(next);
  }, []);

  const tap = useCallback(() => {
    if (phaseRef.current === "idle" || phaseRef.current === "result" || phaseRef.current === "early") {
      if (timeout.current !== null) clearTimeout(timeout.current);
      setLast(null);
      changePhase("waiting");
      timeout.current = setTimeout(() => {
        if (phaseRef.current !== "waiting") return;
        greenAt.current = performance.now();
        changePhase("go");
      }, 1200 + Math.random() * 2900);
      return;
    }
    if (phaseRef.current === "waiting") {
      if (timeout.current !== null) clearTimeout(timeout.current);
      timeout.current = null;
      changePhase("early");
      return;
    }
    if (phaseRef.current === "go") {
      const ms = Math.max(0, Math.round(performance.now() - greenAt.current));
      setLast(ms);
      void submitReaction(ms);
      setBest(previous => {
        const record = previous === null ? ms : Math.min(ms, previous);
        try { localStorage.setItem(STORE, String(record)); } catch { /* Optional score persistence. */ }
        return record;
      });
      changePhase("result");
    }
  }, [changePhase]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.repeat || (event.code !== "Space" && event.code !== "Enter")) return;
      const target = event.target;
      if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement ||
          (target instanceof HTMLElement && target.isContentEditable)) return;
      event.preventDefault(); // Prevent scrolling and the native focused-button click.
      tap();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [tap]);

  const label = phase === "waiting" ? "WAIT FOR GREEN…"
    : phase === "go" ? "TAP NOW!"
    : phase === "early" ? "TOO EARLY!"
    : phase === "result" ? `${last ?? 0} ms`
    : "TAP TO START";
  const hint = phase === "waiting" ? "Don't tap yet"
    : phase === "go" ? "As fast as you can"
    : phase === "early" ? "Tap to try again"
    : phase === "result" ? "Tap for another round"
    : "Wait for green, then tap";

  return <main className="bureau-standalone">
    <div className="bureau-standalone-inner">
      <div className="bureau-standalone-eyebrow">THE BUREAU / ARCADE / REFLEX DEPARTMENT</div>
      <section className="bureau-reaction">
        <div className="bureau-reaction-kicker">REACTION TIME / PERSONAL BEST</div>
        <h1>Dr. Mongo’s Reaction Game<span style={{color:"#d6b589"}}>.</span></h1>
        <p className="bureau-reaction-intro">Wacht op groen en reageer zo snel mogelijk. Je persoonlijke record blijft op dit apparaat staan; geldige reacties tellen mee voor de wereldwijde Top 10.</p>
        <label style={{display:"flex",alignItems:"center",gap:12,marginBottom:16,color:"#e4bd89",fontSize:12,fontWeight:750}}>PLAYER NAME <input value={nickname} maxLength={12} onChange={e=>setNickname(e.target.value)} aria-label="Naam voor de wereldwijde ranglijst" style={{background:"#1b2938",color:"#fff",padding:"9px 12px",border:"1px solid #a58a68",borderRadius:7,maxWidth:175}}/></label>
        <div className="bureau-arcade-key-guide"><strong>⌨ PC CONTROLS</strong><span><kbd>SPACE</kbd> of <kbd>ENTER</kbd> starten / reageren</span><span>MUIS OF TOUCH: klik op het vlak</span></div>
        <button className={`bureau-reaction-target ${phase}`} type="button" onClick={tap} aria-label={hint}>
          <strong aria-live="polite">{label}</strong><span>{hint.toUpperCase()}</span>
        </button>
        <div className="bureau-reaction-scores" aria-live="polite">
          <div><span>PERSONAL BEST</span><strong>{best === null ? "—" : `${best} ms`}</strong></div>
          <div><span>LATEST REACTION</span><strong>{last === null ? "—" : `${last} ms`}</strong></div>
          <small>GREEN MEANS GO / RED MEANS RESET</small>
        </div>
        <section style={{marginTop:24,padding:20,border:"1px solid #bd965e55",borderRadius:14,background:"#111a25"}}>
          <h2 style={{fontSize:20,color:"#f4d4a0",margin:"0 0 10px"}}>GLOBAL TOP 10 · FASTEST REACTIONS</h2>
          <p role="status" style={{fontSize:11,color:"#9cabbc"}}>{boardStatus}</p>
          <ol style={{paddingLeft:26,margin:"12px 0 0"}}>
            {ranking.length ? ranking.map((entry,i)=><li key={i} style={{padding:"8px 0",borderBottom:"1px solid #ffffff18",color:"#e7e0d5",fontSize:13}}><span style={{display:"inline-block",minWidth:"65%"}}>{entry.name}</span><strong style={{color:"#f1c18e"}}>{entry.ms} ms</strong></li>):<li style={{color:"#aeb9c7",padding:8}}>No scores yet. Set the first record.</li>}
          </ol>
        </section>
      </section>
    </div>
  </main>;
}
