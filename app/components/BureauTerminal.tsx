"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, LockKeyhole, Terminal, X } from "lucide-react";
import "./bureau-terminal.css";

type TerminalTone = "system" | "input" | "success" | "muted" | "error";
type TerminalLine = { id: number; tone: TerminalTone; text: string };
type Props = { onClose: () => void; onLaunchSecret: () => void };

const START_LINES: TerminalLine[] = [
  { id: 1, tone: "success", text: "ROGER_OS  /  INTERACTIVE TERMINAL  /  v1.0" },
  { id: 2, tone: "muted", text: "CONNECTED TO THE BUREAU. THIS IS A FICTIONAL SHELL." },
  { id: 3, tone: "system", text: "Type help to discover the available commands." },
];

export default function BureauTerminal({ onClose, onLaunchSecret }: Props) {
  const [lines, setLines] = useState<TerminalLine[]>(START_LINES);
  const [command, setCommand] = useState("");
  const [past, setPast] = useState<string[]>([]);
  const [pastIndex, setPastIndex] = useState(-1);
  const [unlocked, setUnlocked] = useState(false);
  const [matrix, setMatrix] = useState(false);
  const [secretFound, setSecretFound] = useState(false);
  const nextId = useRef(4);
  const feedRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    };
    document.addEventListener("keydown", close);
    // Avoid raising the software keyboard automatically on small touch devices.
    if (window.matchMedia("(pointer: fine)").matches) inputRef.current?.focus({ preventScroll: true });
    return () => {
      document.body.style.overflow = oldOverflow;
      document.removeEventListener("keydown", close);
    };
  }, [onClose]);

  useEffect(() => {
    const feed = feedRef.current;
    if (feed) feed.scrollTop = feed.scrollHeight;
  }, [lines]);

  const append = (items: { tone: TerminalTone; text: string }[]) => {
    const fresh = items.map((item) => ({ ...item, id: nextId.current++ }));
    setLines((current) => [...current, ...fresh].slice(-50));
  };

  const run = (raw: string) => {
    const typed = raw.trim();
    if (!typed) return;
    const cmd = typed.toLowerCase().replace(/\s+/g, " ");
    setCommand("");
    setPast((current) => [...current, typed].slice(-30));
    setPastIndex(-1);
    if (cmd === "clear" || cmd === "cls") {
      setLines([]);
      return;
    }
    if (cmd === "exit" || cmd === "quit") {
      onClose();
      return;
    }
    if (cmd === "launch" && unlocked) {
      onLaunchSecret();
      return;
    }
    const response: { tone: TerminalTone; text: string }[] = [
      { tone: "input", text: "roger@bureau:~$ " + typed },
    ];
    switch (cmd) {
      case "help":
      case "?":
        response.push(
          { tone: "system", text: "AVAILABLE COMMANDS" },
          { tone: "muted", text: "help    whoami    scan    unlock    launch" },
          { tone: "muted", text: "secret  matrix    clear   exit" },
          { tone: "system", text: "Tip: some commands open things that aren't visible on the desk." },
        );
        break;
      case "whoami":
        response.push(
          { tone: "success", text: "IDENTITY VERIFIED  /  ROGER ORLANDO" },
          { tone: "system", text: "Systems engineering × web development × visual design." },
          { tone: "muted", text: "Two disciplines. One workspace. Endless curiosity." },
        );
        break;
      case "scan":
        response.push(
          { tone: "system", text: "SIMULATED ENVIRONMENT SCAN..." },
          { tone: "success", text: "04 EXPERIENCE MODULES DETECTED" },
          { tone: "muted", text: "HEAVY BAG      —  ACTIVE" },
          { tone: "muted", text: "CUBE SURVIVOR  —  ACTIVE" },
          { tone: "muted", text: "FIGHT CAMP     —  ACTIVE" },
          { tone: "muted", text: "SECRET FILE 030 — RESTRICTED" },
          { tone: "system", text: "Try unlock to access the secret file." },
        );
        break;
      case "unlock":
      case "unlock 030":
        setUnlocked(true);
        response.push(
          { tone: "success", text: "ACCESS GRANTED  /  SECRET FILE 030" },
          { tone: "system", text: "The Unfinished Project is now ready to open." },
          { tone: "muted", text: "Type launch or use the OPEN FILE button below." },
        );
        break;
      case "launch":
        response.push({ tone: "error", text: "ACCESS DENIED  /  FIRST TYPE unlock" });
        break;
      case "secret":
        setSecretFound(true);
        response.push(
          { tone: "success", text: "✦ EASTER EGG FOUND / THE CURIOUS ALWAYS FIND A WAY ✦" },
          { tone: "system", text: "The best details are the ones you discover for yourself." },
          { tone: "muted", text: "ACHIEVEMENT: BEHIND THE KEYS" },
        );
        break;
      case "matrix":
        setMatrix((current) => !current);
        response.push({ tone: "success", text: matrix ? "VISUAL MODE RESTORED." : "MATRIX MODE ACTIVATED. FOLLOW THE GREEN SIGNAL." });
        break;
      default:
        response.push(
          { tone: "error", text: "COMMAND NOT FOUND  /  " + typed.toUpperCase() },
          { tone: "muted", text: "Type help to list the available commands." },
        );
    }
    append(response);
  };

  return (
    <div className="bureau-terminal-overlay" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className={`bureau-terminal ${matrix ? "bureau-terminal-matrix" : ""}`} role="dialog" aria-modal="true" aria-labelledby="bureau-terminal-title">
        <header className="bureau-terminal-header">
          <div className="bureau-terminal-header-title"><Terminal size={18} aria-hidden="true" /><div><strong id="bureau-terminal-title">ROGER_OS</strong><small>TERMINAL / LOCAL SESSION</small></div></div>
          <div className="bureau-terminal-header-actions">
            <span className="bureau-terminal-status"><i /> CONNECTED</span>
            <button type="button" onClick={onClose} aria-label="Sluit terminal" className="bureau-terminal-close"><X size={19} /></button>
          </div>
        </header>
        <div className="bureau-terminal-screen">
          <div className="bureau-terminal-grid" aria-hidden="true" />
          <div className="bureau-terminal-meta"><span>USER / VISITOR</span><span>SESSION / INTERACTIVE</span></div>
          <div className="bureau-terminal-feed" ref={feedRef} role="log" aria-live="polite" aria-relevant="additions text">
            {lines.map((line) => <p className={`bureau-terminal-line bureau-terminal-${line.tone}`} key={line.id}>{line.text}</p>)}
          </div>
          {secretFound && <div className="bureau-terminal-easteregg" role="status">✦ BEHIND THE KEYS — SECRET DISCOVERED ✦</div>}
          {unlocked && <button type="button" className="bureau-terminal-unlock" onClick={onLaunchSecret}><LockKeyhole size={16} aria-hidden="true" /> OPEN SECRET FILE 030 <ArrowRight size={17} aria-hidden="true" /></button>}
          <form className="bureau-terminal-form" onSubmit={(event) => { event.preventDefault(); run(command); }}>
            <label className="bureau-terminal-prompt" htmlFor="bureau-terminal-input">roger@bureau:~$</label>
            <input id="bureau-terminal-input" ref={inputRef} type="text" value={command} onChange={(event) => setCommand(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "ArrowUp" && past.length) {
                  event.preventDefault();
                  const idx = pastIndex < 0 ? past.length - 1 : Math.max(0, pastIndex - 1);
                  setPastIndex(idx);
                  setCommand(past[idx]);
                } else if (event.key === "ArrowDown" && pastIndex >= 0) {
                  event.preventDefault();
                  const idx = pastIndex + 1;
                  setPastIndex(idx < past.length ? idx : -1);
                  setCommand(idx < past.length ? past[idx] : "");
                }
              }}
              maxLength={80} autoComplete="off" autoCorrect="off" autoCapitalize="none" spellCheck={false} enterKeyHint="go"
              aria-label="Terminalcommando" placeholder="type help ..." />
            <button type="submit" className="bureau-terminal-run" aria-label="Voer commando uit"><ArrowRight size={19} /></button>
          </form>
        </div>
        <footer className="bureau-terminal-footer"><span>ENTER / EXECUTE</span><span>↑↓ / HISTORY</span><span>ESC / CLOSE</span><span>NO REAL SYSTEM ACCESS</span></footer>
      </section>
    </div>
  );
}
