"use client";

import { useEffect, useRef, useState } from "react";
import type { FormEvent, KeyboardEvent } from "react";
import { ArrowRight, TerminalSquare, X } from "lucide-react";

type TerminalLine = { command: string; output: string };

const answers: Record<string, string> = {
  help: "COMMANDS: help · whoami · projects · skills · ls · coffee · uptime · secret · sudo make-me-rich · sudo fix-printer · clear · exit",
  whoami: "Roger. Designer-turned-engineer. Professional button clicker.",
  projects: "CityFi / 10.00 / BreakUrge / Losch Dental. Scroll naar PROJECTS voor het echte werk.",
  skills: "Design + development + systems + debugging things that worked yesterday.",
  ls: "projects/    ideas/    coffee.exe    questionable-decisions.log",
  coffee: "Brewing... [##########] 100% | Critical dependency restored.",
  uptime: "Portfolio status: running on caffeine and unreasonable optimism.",
  secret: "Achievement unlocked: you found the secret terminal. No loot, just bragging rights.",
  "sudo make-me-rich": "Permission denied. Have you tried turning capitalism off and on again?",
  "sudo fix-printer": "ERROR: printer has chosen violence. Please negotiate directly.",
  "cat questionable-decisions.log": "Yesterday: changed one pixel. Today: rewrote the entire component.",
};

export default function PlaygroundTerminal({ onClose }: { onClose: () => void }) {
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<TerminalLine[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);
  useEffect(() => { if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight; }, [history]);

  function execute(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const command = input.trim();
    if (!command) return;
    const normalized = command.toLowerCase().replace(/\s+/g, " ");
    setInput("");
    if (normalized === "clear") { setHistory([]); return; }
    if (normalized === "exit") { onClose(); return; }
    const output = normalized === "date"
      ? new Date().toLocaleString("nl-NL")
      : (answers[normalized] ?? "Command not found: " + command + ". Try 'help'.");
    setHistory(previous => [...previous.slice(-29), { command, output }]);
  }

  function handleKeys(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") onClose();
  }

  return (
    <div className="secret-terminal ro-terminal" aria-label="Interactieve demo-terminal">
      <div className="ro-terminal-bar">
        <span><TerminalSquare size={15}/> ROGER_OS / GUEST SHELL</span>
        <button type="button" onClick={onClose} aria-label="Sluit terminal"><X size={16}/></button>
      </div>
      <p className="ro-terminal-intro">Welcome to the unnecessary terminal. Type <b>help</b> to begin. Just a playful simulation — not a real shell.</p>
      <div className="ro-terminal-log" ref={logRef} role="log" aria-label="Terminaluitvoer">
        {history.map((line, index) => (
          <div className="ro-terminal-line" key={index}>
            <p><span>roger@orlando</span>:~$ {line.command}</p>
            <p className="ro-terminal-output">{line.output}</p>
          </div>
        ))}
      </div>
      <form className="ro-terminal-form" onSubmit={execute}>
        <label htmlFor="ro-terminal-input"><span>roger@orlando</span>:~$</label>
        <input id="ro-terminal-input" ref={inputRef} type="text" value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKeys} placeholder="help" autoComplete="off" autoCapitalize="off" spellCheck={false} aria-label="Typ een demo-commando"/>
        <button type="submit" aria-label="Voer commando uit"><ArrowRight size={17}/></button>
      </form>
    </div>
  );
}
