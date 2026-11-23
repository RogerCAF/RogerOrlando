"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import "../arcade.css";

type Phase = "idle" | "waiting" | "go" | "result" | "early";
const STORE = "bureau-reaction-best"; // Shared with the original Bureau reaction game.
const HISTORY_STORE = "bureau-mongo-verified-history-v1";

export default function MongoReactionGame() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [best, setBest] = useState<number | null>(null);
  const [last, setLast] = useState<number | null>(null);
  const [lastVerified, setLastVerified] = useState(false);
  const [verificationState, setVerificationState] = useState<"idle"|"pending"|"verified"|"failed">("idle");
  const [history, setHistory] = useState<number[]>([]);
  const [nickname, setNickname] = useState("NPC");
  const [ranking, setRanking] = useState<Array<{name:string;ms:number}>>([]);
  const [boardStatus, setBoardStatus] = useState("Loading global Top 10…");
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const phaseRef = useRef<Phase>("idle");
  const greenAt = useRef(0);
  const roundRef = useRef<string | null>(null);
  const preparing = useRef(false);

  useEffect(() => {
    try {
      const value = Number(localStorage.getItem(STORE));
      if (Number.isFinite(value) && value > 0) setBest(value);
    } catch { /* The game still works without browser storage. */ }
    try { setNickname(((saved => saved && saved !== "PLAYER" ? saved : "NPC")(localStorage.getItem("bureau-mongo-name")))); } catch {}
    try {
      const values = JSON.parse(localStorage.getItem(HISTORY_STORE) || "[]");
      if (Array.isArray(values)) setHistory(values.filter((v): v is number => typeof v==="number"&&Number.isFinite(v)&&v>=80&&v<=10000).slice(0,5));
    } catch { /* History remains optional. */ }
    void refreshBoard();
    return () => { if (timeout.current !== null) clearTimeout(timeout.current); };
  }, []);

  async function refreshBoard() {
    try {
      const response = await fetch("/api/reaction/verified", {cache:"no-store"});
      if (!response.ok) throw Error("Offline");
      const data = await response.json();
      setRanking(Array.isArray(data.entries) ? data.entries : []);
      setBoardStatus("GLOBAL TOP 10 · SHARED ACROSS DEVICES");
    } catch { setBoardStatus("Global leaderboard temporarily unavailable."); }
  }
  async function submitReaction(id: string, measured: number) {
    const name = nickname.trim().toUpperCase().replace(/[^A-Z0-9 _-]/g, "").slice(0,12) || "NPC";
    try { localStorage.setItem("bureau-mongo-name", name); } catch {}
    try {
      setBoardStatus("Verifying reaction time with the server…");
      const response = await fetch("/api/reaction/verified", {method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"finish",id,name})});
      const data = await response.json();
      if (!response.ok) throw Error(data.error || "Verification failed");
      setLast(data.ms);
      setLastVerified(true);
      setVerificationState("verified");
      setHistory(previous => {
        const next = [data.ms, ...previous].slice(0,5);
        try {localStorage.setItem(HISTORY_STORE, JSON.stringify(next))} catch {}
        return next;
      });
      setBest(previous => {
        const record = previous === null ? data.ms : Math.min(data.ms,previous);
        try {localStorage.setItem(STORE,String(record))}catch{}
        return record;
      });
      setRanking(Array.isArray(data.entries)?data.entries:[]);
      setBoardStatus(data.saved?"SERVER-VERIFIED · TIME ENTERED":"SERVER-VERIFIED · TOP 10 UNCHANGED");
    } catch {
      setLast(measured);
      setLastVerified(false);
      setVerificationState("failed");
      setBoardStatus("This round was not verified. It was not entered into the global Top 10.");
    }
  }

  const changePhase = useCallback((next: Phase) => {
    phaseRef.current = next;
    setPhase(next);
  }, []);

  const tap = useCallback(() => {
    if (phaseRef.current === "idle" || phaseRef.current === "result" || phaseRef.current === "early") {
      if (preparing.current) return;
      preparing.current = true;
      roundRef.current = null;
      if (timeout.current !== null) clearTimeout(timeout.current);
      setLast(null);
      setLastVerified(false);
      setVerificationState("idle");
      changePhase("waiting");
      void (async () => {
        try {
          const response = await fetch("/api/reaction/verified", {method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"start"})});
          if(!response.ok)throw Error("Verification unavailable");
          const data=await response.json();
          if(phaseRef.current!=="waiting")return;
          roundRef.current=data.id;
          timeout.current=setTimeout(()=>{
            if(phaseRef.current!=="waiting")return;
            greenAt.current=performance.now();
            changePhase("go");
          },data.waitMs);
        } catch {
          if (phaseRef.current==="waiting") {
            setBoardStatus("Verified rounds unavailable. Please retry.");
            changePhase("early");
          }
        } finally {preparing.current=false}
      })();
      return;
    }
    if (phaseRef.current === "waiting") {
      if (timeout.current !== null) clearTimeout(timeout.current);
      timeout.current = null;
      roundRef.current = null;
      changePhase("early");
      return;
    }
    if (phaseRef.current === "go") {
      const ms = Math.max(0, Math.round(performance.now() - greenAt.current));
      const id=roundRef.current;
      roundRef.current=null;
      setLast(ms);
      setVerificationState("pending");
      changePhase("result");
      if (id) void submitReaction(id,ms);
    }
  }, [changePhase, nickname]);

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

  const label = phase === "waiting" ? "HOLD"
    : phase === "go" ? "REACT!"
    : phase === "early" ? "TOO SOON"
    : phase === "result" ? (last === null ? "—" : String(last) + " ms")
    : "START TEST";
  const hint = phase === "waiting" ? "WAIT FOR GREEN — DO NOT CLICK"
    : phase === "go" ? "CLICK OR PRESS SPACE NOW"
    : phase === "early" ? "FALSE START — TAP TO RETRY"
    : phase === "result" ? "TAP TO RUN ANOTHER TEST"
    : "CLICK TO BEGIN YOUR REACTION TEST";
  const experimentState = phase==="waiting" ? "CALIBRATING"
    : phase==="go" ? "SIGNAL ACTIVE"
    : phase==="early" ? "FALSE START"
    : phase==="result" ? (verificationState==="verified" ? "VERIFIED RESULT" : verificationState==="failed" ? "NOT VERIFIED" : "VERIFYING RESULT")
    : "READY TO TEST";
  const reactionGrade = last === null ? null : last < 150 ? "LIGHTNING"
    : last < 220 ? "EXCELLENT" : last < 300 ? "QUICK" : last < 400 ? "GOOD" : "KEEP PRACTICING";
  const average = history.length ? Math.round(history.reduce((total, value)=>total+value,0)/history.length) : null;

  return <main className="bureau-standalone bureau-mongo-standalone">
    <div className="bureau-standalone-inner mongo-app">
      <div className="mongo-eyebrow"><span>THE BUREAU <b>/</b> MONGO LABS</span><span className="mongo-online">● SERVER-VERIFIED ARCADE</span></div>
      <header className="mongo-heading">
        <div>
          <span className="mongo-kicker">EXPERIMENT 001 / NEURAL RESPONSE</span>
          <h1>Dr. Mongo<span>’s</span> Reaction Game<span className="mongo-dot">.</span></h1>
          <p>One signal. One reaction. Wait for green, then hit the target as fast as you can.</p>
        </div>
        <div className="mongo-head-tag"><b>REFLEX LAB</b><small>10 PLACE GLOBAL RANKING</small></div>
      </header>
      <div className="mongo-layout">
        <section className="mongo-lab" aria-label="Reaction testing chamber">
          <div className="mongo-lab-top"><span className="mongo-lab-title">LIVE TEST CHAMBER <span>/ 01</span></span><span className={`mongo-live-state ${phase}`}><i aria-hidden="true"/> {experimentState}</span></div>
          <button className={`bureau-reaction-target mongo-target ${phase}`} type="button" onClick={tap} aria-label={hint}>
            <span className="mongo-target-corners" aria-hidden="true"/>
            <span className="mongo-target-orbit" aria-hidden="true"/>
            <span className="mongo-target-copy">
              <span className="mongo-target-kicker">{phase==="waiting"?"SIGNAL PENDING":phase==="go"?"SIGNAL DETECTED":phase==="early"?"REACTION INVALID":phase==="result"?"REACTION CAPTURED":"READY WHEN YOU ARE"}</span>
              <strong aria-live="polite">{label}</strong>
              <span className="mongo-target-hint">{hint}</span>
            </span>
            <span className="mongo-target-bottom" aria-hidden="true"><span>DR. MONGO / LAB 01</span><span>PRECISION TEST</span></span>
          </button>
          <div className="mongo-control-strip">
            <span><kbd>SPACE</kbd> <kbd>ENTER</kbd> START / REACT</span>
            <span><kbd>CLICK</kbd> <kbd>TAP</kbd> REACT</span>
          </div>
          <div className="mongo-stats" aria-label="Your reaction results">
            <div className="mongo-stat"><small>PERSONAL BEST</small><strong>{best === null ? "—" : best}<em>{best === null ? "" : " ms"}</em></strong></div>
            <div className="mongo-stat"><small>LATEST RESPONSE</small><strong>{last === null ? "—" : last}<em>{last === null ? "" : " ms"}</em></strong></div>
            <div className="mongo-stat"><small>LAST 5 VERIFIED / AVG</small><strong>{average === null ? "—" : average}<em>{average === null ? "" : " ms"}</em></strong></div>
          </div>
          <div className="mongo-lab-footer"><span>{phase==="result"&&reactionGrade ? reactionGrade : "GREEN MEANS GO · EARLY TAP RESETS"}</span><span>{phase==="result" ? (lastVerified?"✓ VERIFIED":verificationState==="failed"?"UNVERIFIED":"VERIFYING…") : "LOCAL BEST SAVED"}</span></div>
        </section>
        <aside className="mongo-leaderboard" aria-label="Verified global reaction leaderboard">
          <div className="mongo-board-title"><span className="mongo-board-kicker">WORLDWIDE / COMPETITIVE</span><h2>GLOBAL TOP <em>10</em></h2><p>Every published time is checked by the server.</p></div>
          <label className="mongo-player-name"><span>YOUR CALLSIGN</span><input value={nickname} maxLength={12} onChange={e=>setNickname(e.target.value)} aria-label="Naam voor de wereldwijde ranglijst" spellCheck={false}/></label>
          <div className="mongo-board-status" role="status">{boardStatus}</div>
          <div className="mongo-rank-header"><span>RANK / PLAYER</span><span>TIME</span></div>
          <ol className="mongo-ranking">{ranking.length?ranking.map((entry,i)=>
            <li key={entry.name+"-"+entry.ms+"-"+i}>
              <span className="mongo-rank-number">{String(i+1).padStart(2,"0")}</span>
              <span className="mongo-rank-name">{entry.name}</span>
              <strong>{entry.ms}<small> ms</small></strong>
            </li>
          ):<li className="mongo-rank-empty">No verified scores yet. Set the first record.</li>}</ol>
          <div className="mongo-board-footer">NO ACCOUNT REQUIRED <span>•</span> LIVE VERIFIED RANKING</div>
        </aside>
      </div>
    </div>
  </main>;
}
