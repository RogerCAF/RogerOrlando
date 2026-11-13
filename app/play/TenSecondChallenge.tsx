"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const STORE = "roger-os-ten-seconds-v1";
const TARGET = 10000;
const format = (ms: number) => (ms / 1000).toFixed(2);
type Attempt = { time: number; at: number };

export default function TenSecondChallenge() {
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [phase, setPhase] = useState<"ready" | "running" | "result">("ready");
  const [elapsed, setElapsed] = useState(0);
  const [showTime, setShowTime] = useState(true);
  const started = useRef<number | null>(null);
  const frame = useRef<number | null>(null);
  const phaseRef = useRef<"ready" | "running" | "result">("ready");
  const keyboardHeld = useRef(false);
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
    return () => { if (frame.current !== null) cancelAnimationFrame(frame.current); };
  }, []);

  const tick = useCallback(() => {
    if (started.current === null) return;
    if (displayRef.current) setElapsed(performance.now() - started.current);
    frame.current = requestAnimationFrame(tick);
  }, []);

  const start = useCallback(() => {
    if (phaseRef.current === "running") return;
    if (frame.current !== null) cancelAnimationFrame(frame.current);
    started.current = performance.now();
    setElapsed(0);
    phaseRef.current = "running";
    setPhase("running");
    frame.current = requestAnimationFrame(tick);
  }, [tick]);

  const stop = useCallback(() => {
    if (phaseRef.current !== "running" || started.current === null) return;
    const actual = performance.now() - started.current;
    started.current = null;
    if (frame.current !== null) cancelAnimationFrame(frame.current);
    frame.current = null;
    keyboardHeld.current = false;
    phaseRef.current = "result";
    setPhase("result");
    setElapsed(actual);
    const next = [{time: actual, at: Date.now()}, ...attemptsRef.current].slice(0, 50);
    attemptsRef.current = next;
    setAttempts(next);
    try { localStorage.setItem(STORE, JSON.stringify(next)); } catch { /* Still playable without localStorage. */ }
  }, []);

  const best = attempts.length ? attempts.reduce((a,b) =>
    Math.abs(a.time - TARGET) <= Math.abs(b.time - TARGET) ? a : b
  ) : null;
  const latest = attempts[0];
  const deviation = latest ? Math.abs(latest.time - TARGET) : null;

  return <section className="rg-ten-section" aria-label="Speel 10.00 seconden timinggame">
    <div className="rg-ten-head">
      <div><span className="rg-ten-kicker">BONUS EXPERIMENT / 10.00</span><h2>Ten seconds. <em>One shot.</em></h2>
      <p>Druk de rode knop in, houd hem vast en laat precies bij 10.00 seconden los. Je beste score en laatste pogingen blijven op dit apparaat bewaard.</p></div>
      <span className="rg-ten-edition">ARCADE / 002</span>
    </div>
    <div className="rg-ten-layout">
      <div className="rg-ten-play">
        <div className="rg-ten-readout" aria-live="off"><small>{phase === "running" ? "TIMER ACTIVE" : phase === "result" ? "YOUR LAST TIME" : "READY TO PLAY"}</small>
          <strong>{phase === "running" && !showTime ? "— —.——" : format(elapsed)}<span> SEC</span></strong>
          <span className="rg-ten-delta">{phase === "result" && deviation !== null ? (deviation < 5 ? "PERFECT 10.00!" : `${format(deviation)}s ${latest.time > TARGET ? "too late" : "too early"}`) : "TARGET / 10.00 SEC"}</span>
        </div>
        <button type="button" className={`rg-ten-button ${phase === "running" ? "is-running" : ""}`}
          aria-label={phase === "running" ? "Laat los om de tijd te stoppen" : "Houd ingedrukt om de timer te starten"}
          onPointerDown={e => { if(e.pointerType === "mouse" && e.button !== 0) return; e.preventDefault(); e.currentTarget.setPointerCapture(e.pointerId); start(); }}
          onPointerUp={e => { e.preventDefault(); stop(); }}
          onPointerCancel={() => { if (phaseRef.current === "running") stop(); }}
          onKeyDown={e => { if(e.key === " " || e.key === "Enter") { e.preventDefault(); if (!keyboardHeld.current) { keyboardHeld.current = true; start(); } } }}
          onKeyUp={e => { if(e.key === " " || e.key === "Enter") { e.preventDefault(); stop(); } }}
          onBlur={() => { if (phaseRef.current === "running") stop(); }}
        ><span>{phase === "running" ? "RELEASE" : "HOLD"}</span></button>
        <p className="rg-ten-instruction">{phase === "running" ? "Laat los wanneer jij denkt dat 10 seconden voorbij zijn." : "Houd de knop ingedrukt — laat los om te stoppen."}</p>
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
      </aside>
    </div>
  </section>;
}
