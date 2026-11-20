"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import "../arcade.css";

type Phase = "idle" | "waiting" | "go" | "result" | "early";
const STORE = "bureau-reaction-best"; // Shared with the original Bureau reaction game.

export default function MongoReactionGame() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [best, setBest] = useState<number | null>(null);
  const [last, setLast] = useState<number | null>(null);
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const phaseRef = useRef<Phase>("idle");
  const greenAt = useRef(0);

  useEffect(() => {
    try {
      const value = Number(localStorage.getItem(STORE));
      if (Number.isFinite(value) && value > 0) setBest(value);
    } catch { /* The game still works without browser storage. */ }
    return () => { if (timeout.current !== null) clearTimeout(timeout.current); };
  }, []);

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
        <p className="bureau-reaction-intro">Wacht tot het vlak groen wordt en reageer zo snel mogelijk. Te vroeg drukken telt niet. Je snelste tijd blijft op dit apparaat bewaard.</p>
        <div className="bureau-arcade-key-guide"><strong>⌨ PC CONTROLS</strong><span><kbd>SPACE</kbd> of <kbd>ENTER</kbd> starten / reageren</span><span>MUIS OF TOUCH: klik op het vlak</span></div>
        <button className={`bureau-reaction-target ${phase}`} type="button" onClick={tap} aria-label={hint}>
          <strong aria-live="polite">{label}</strong><span>{hint.toUpperCase()}</span>
        </button>
        <div className="bureau-reaction-scores" aria-live="polite">
          <div><span>PERSONAL BEST</span><strong>{best === null ? "—" : `${best} ms`}</strong></div>
          <div><span>LATEST REACTION</span><strong>{last === null ? "—" : `${last} ms`}</strong></div>
          <small>GREEN MEANS GO / RED MEANS RESET</small>
        </div>
      </section>
    </div>
  </main>;
}
